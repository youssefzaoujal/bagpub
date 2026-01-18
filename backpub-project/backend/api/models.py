from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import uuid
import secrets
from django.utils.text import slugify

# Fonction pour générer un token sécurisé
def generate_secure_token():
    """Génère un token sécurisé de 64 caractères"""
    return secrets.token_hex(32)  # 32 bytes = 64 caractères hexadécimaux

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Administrateur'),
        ('client', 'Client'),
        ('partner', 'Partenaire'),
    )
    email = models.EmailField(unique=True, blank=False, null=False)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    company_name = models.CharField(max_length=255, blank=True)
    siret = models.CharField(max_length=14, blank=True)
    tva_number = models.CharField(max_length=20, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=10, blank=True)
    
    # Pour les partenaires
    partner_type = models.CharField(max_length=50, blank=True)
    coverage_radius = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.company_name or self.username} ({self.role})"
    
    def get_company_slug(self):
        """Retourne le slug de l'entreprise (généré dynamiquement)"""
        if self.company_name:
            return slugify(self.company_name)
        return None

class Partner(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='partner_profile')
    company_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    address = models.TextField(blank=True, default='')
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10)
    coverage_radius = models.IntegerField(default=10)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.company_name

class Campaign(models.Model):
    STATUS_CHOICES = (
        ('CREATED', 'Créée'),
        ('ASSIGNED', 'Attribuée à partenaire'),
        ('IN_PRINTING', 'En impression'),
        ('PRINTED', 'Imprimée'),
        ('IN_DISTRIBUTION', 'En distribution'),
        ('DELIVERED', 'Livrée'),
        ('FINISHED', 'Terminée'),
    )
    
    PRINTING_STATUS_CHOICES = (
        ('NOT_SENT', 'Non envoyé'),
        ('SENT_TO_PRINT', 'Envoyé à l\'impression'),
        ('IN_PROGRESS', 'En cours'),
        ('COMPLETED', 'Terminé'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='campaigns')
    partner = models.ForeignKey(Partner, on_delete=models.SET_NULL, null=True, blank=True)
    
    postal_codes = models.TextField(help_text="Codes postaux séparés par des virgules")
    quantity = models.IntegerField(default=1000)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='CREATED')
    printing_status = models.CharField(max_length=20, choices=PRINTING_STATUS_CHOICES, default='NOT_SENT')
    
    special_request = models.TextField(blank=True, null=True, help_text="Demandes spéciales pour l'impression")
    estimated_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    faces = models.IntegerField(default=1, help_text="Nombre de faces (1 ou 2)")
    
    # Paiement
    payment_required = models.BooleanField(default=True)
    payment_status = models.CharField(max_length=20, choices=[
        ('PENDING', 'En attente'),
        ('PAID', 'Payé'),
        ('FAILED', 'Échoué'),
        ('REFUNDED', 'Remboursé'),
    ], default='PENDING')
    
    secure_token = models.CharField(max_length=64, editable=False, unique=True)
    
    # Champs pour carte personnalisée
    custom_card = models.FileField(upload_to='custom_cards/', null=True, blank=True)
    use_custom_card = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order_number']),
            models.Index(fields=['status']),
            models.Index(fields=['printing_status']),
            models.Index(fields=['client', 'created_at']),
            models.Index(fields=['postal_codes']),  # Nouvel index pour optimisation
        ]
        verbose_name = "Campagne"
        verbose_name_plural = "Campagnes"
    
    def save(self, *args, **kwargs):
        # Générer le numéro de commande si manquant
        if not self.order_number:
            date_str = timezone.now().strftime('%Y%m%d')
            random_part = secrets.token_hex(4).upper()
            self.order_number = f"BP-{date_str}-{random_part}"
        
        # Générer le token sécurisé si manquant
        if not self.secure_token:
            self.secure_token = secrets.token_hex(32)
        
        # Générer un nom par défaut si manquant
        if not self.name:
            year = self.created_at.year if self.created_at else timezone.now().year
            self.name = f"{self.client.company_name if self.client else 'Campagne'} - {year}"
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.name} ({self.order_number})"
    
    @property
    def is_ready_for_printing(self):
        """Vérifie si la campagne est prête pour l'impression"""
        return self.status == 'ASSIGNED' and self.printing_status == 'SENT_TO_PRINT'
    
    @property
    def has_custom_card(self):
        """Vérifie si la campagne a une carte personnalisée"""
        return self.use_custom_card and bool(self.custom_card)
    
    def get_printing_data(self):
        """Retourne toutes les données nécessaires pour l'impression"""
        design = getattr(self, 'design', None)
        
        return {
            'campaign_id': str(self.id),
            'order_number': self.order_number,
            'client_company': self.client.company_name,
            'client_email': self.client.email,
            'client_phone': self.client.phone,
            'quantity': self.quantity,
            'postal_codes': self.postal_codes,
            'special_requests': self.special_request,
            'faces': self.faces,
            'has_custom_card': self.has_custom_card,
            'custom_card_url': self.custom_card.url if self.custom_card else None,
            'design_template': design.template if design else 'professional',
            'qr_code_url': design.qr_code.url if design and design.qr_code else None,
            'logo_url': design.logo.url if design and design.logo else None,
            'slogan': design.slogan if design else '',
            'contact_email': design.company_email if design else self.client.email,
            'contact_phone': design.company_phone if design else self.client.phone,
            'address': design.company_address if design else self.client.address,
            'postal_code': design.company_postal_code if design else self.client.postal_code,
        }
    
    def get_common_campaigns_by_postal_code(self):
        """Retourne les campagnes avec codes postaux communs"""
        campaigns = Campaign.objects.filter(status='CREATED')
        common_campaigns = []
        postal_codes_list = [code.strip() for code in self.postal_codes.split(',')]
        
        for campaign in campaigns.exclude(id=self.id):
            campaign_codes = [code.strip() for code in campaign.postal_codes.split(',')]
            # Vérifier s'il y a au moins un code postal commun
            if set(postal_codes_list) & set(campaign_codes):
                common_campaigns.append(campaign)
        
        return common_campaigns

class CampaignDesign(models.Model):
    TEMPLATE_CHOICES = [(f'template_{i}', f'Template {i}') for i in range(1, 21)]
    
    CONTACT_METHOD_CHOICES = (
        ('email', 'Email seulement'),
        ('whatsapp', 'WhatsApp seulement'),
        ('both', 'Email et WhatsApp'),
    )
    
    campaign = models.OneToOneField(Campaign, on_delete=models.CASCADE, related_name='design')
    
    # Informations entreprise
    slogan = models.CharField(max_length=255, blank=True)
    company_email = models.EmailField()
    company_phone = models.CharField(max_length=20)
    company_address = models.TextField(blank=True)
    company_postal_code = models.CharField(max_length=10, blank=True)
    logo = models.ImageField(upload_to='designs/logos/', null=True, blank=True)
    
    # Options design simplifiées
    template = models.CharField(max_length=20, choices=TEMPLATE_CHOICES, default='template_1')
    accent_color = models.CharField(max_length=7, default='#3498DB')
    
    contact_method = models.CharField(max_length=20, choices=CONTACT_METHOD_CHOICES, default='email')
    
    # QR Code
    qr_code = models.ImageField(upload_to='qr_codes/', null=True, blank=True)
    qr_code_url = models.URLField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Design de {self.campaign.name}"

class PrintBatch(models.Model):
    """Batch d'impression regroupant plusieurs campagnes par code postal"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    batch_number = models.CharField(max_length=50, unique=True, editable=False)
    postal_code = models.CharField(max_length=10)
    partner = models.ForeignKey(Partner, on_delete=models.SET_NULL, null=True, blank=True)
    
    STATUS_CHOICES = (
        ('CREATED', 'Créé'),
        ('ASSIGNED', 'Assigné'),
        ('IN_PRINTING', 'En impression'),
        ('PRINTED', 'Imprimé'),
        ('DELIVERED', 'Livré'),
    )
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='CREATED')
    campaigns = models.ManyToManyField(Campaign, related_name='print_batches')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    printed_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Batch d'impression"
        verbose_name_plural = "Batchs d'impression"
    
    def save(self, *args, **kwargs):
        if not self.batch_number:
            date_str = timezone.now().strftime('%Y%m%d')
            random_part = secrets.token_hex(3).upper()
            self.batch_number = f"BATCH-{self.postal_code}-{date_str}-{random_part}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Batch {self.batch_number} - {self.postal_code}"
    
    @property
    def total_quantity(self):
        """Retourne la quantité totale de cartes dans le batch"""
        campaigns_count = self.campaigns.count()
        if campaigns_count > 1:
            # Si plusieurs campagnes sont combinées, c'est un lot combiné de 1000 sacs
            return 1000
        elif campaigns_count == 1:
            # Une seule campagne = 1000 sacs
            return 1000
        else:
            return 0
    
    @property
    def client_count(self):
        """Retourne le nombre de clients différents dans le batch"""
        return len(set(campaign.client.id for campaign in self.campaigns.all()))
    
    def get_batch_details(self):
        """Retourne les détails du batch pour l'impression"""
        details = {
            'batch_id': str(self.id),
            'batch_number': self.batch_number,
            'postal_code': self.postal_code,
            'status': self.status,
            'total_quantity': self.total_quantity,
            'client_count': self.client_count,
            'campaigns': [],
            'partner_info': None
        }
        
        if self.partner:
            details['partner_info'] = {
                'company_name': self.partner.company_name,
                'email': self.partner.email,
                'phone': self.partner.phone,
                'address': f"{self.partner.address}, {self.partner.postal_code} {self.partner.city}",
                'coverage_radius': self.partner.coverage_radius
            }
        
        for campaign in self.campaigns.all():
            campaign_details = {
                'campaign_id': str(campaign.id),
                'order_number': campaign.order_number,
                'client_company': campaign.client.company_name,
                'quantity': campaign.quantity,
                'faces': campaign.faces,
                'has_custom_card': campaign.has_custom_card,
                'special_requests': campaign.special_request,
                'design': None
            }
            
            if hasattr(campaign, 'design'):
                design = campaign.design
                campaign_details['design'] = {
                    'template': design.template,
                    'slogan': design.slogan,
                    'contact_email': design.company_email,
                    'contact_phone': design.company_phone
                }
            
            details['campaigns'].append(campaign_details)
        
        return details

class PrintOrder(models.Model):
    """Commande d'impression pour un batch"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    batch = models.OneToOneField(PrintBatch, on_delete=models.CASCADE, related_name='print_order')
    order_number = models.CharField(max_length=50, unique=True, editable=False)
    
    STATUS_CHOICES = (
        ('PENDING', 'En attente'),
        ('IN_PROGRESS', 'En cours'),
        ('COMPLETED', 'Terminé'),
        ('SHIPPED', 'Expédié'),
    )
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Fichiers d'impression
    print_file = models.FileField(upload_to='print_orders/', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    shipped_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            date_str = timezone.now().strftime('%Y%m%d%H%M')
            random_part = secrets.token_hex(4).upper()
            self.order_number = f"PRINT-{date_str}-{random_part}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Ordre {self.order_number} - Batch {self.batch.batch_number}"
    
    def get_printing_details(self):
        """Retourne tous les détails pour l'impression"""
        batch_details = self.batch.get_batch_details()
        
        # Ajouter les fichiers personnalisés si nécessaire
        custom_cards = []
        for campaign in self.batch.campaigns.filter(use_custom_card=True):
            if campaign.custom_card:
                custom_cards.append({
                    'campaign_id': str(campaign.id),
                    'client': campaign.client.company_name,
                    'filename': campaign.custom_card.name.split('/')[-1],
                    'url': campaign.custom_card.url
                })
        
        return {
            'print_order': {
                'id': str(self.id),
                'order_number': self.order_number,
                'status': self.status,
                'assigned_to': self.assigned_to.username if self.assigned_to else None,
                'created_at': self.created_at.isoformat() if self.created_at else None
            },
            'batch_details': batch_details,
            'custom_cards': custom_cards,
            'summary': {
                'total_campaigns': len(batch_details['campaigns']),
                'total_cards': batch_details['total_quantity'],
                'clients_count': batch_details['client_count'],
                'has_custom_cards': len(custom_cards) > 0
            }
        }

class CampaignLog(models.Model):
    ACTION_CHOICES = (
        ('CREATED', 'Création'),
        ('STATUS_CHANGE', 'Changement de statut'),
        ('PARTNER_ASSIGNED', 'Partenaire assigné'),
        ('ADDED_TO_BATCH', 'Ajouté à un batch'),
        ('BATCH_CREATED', 'Batch créé'),
        ('SENT_TO_PRINT', 'Envoyé à l\'impression'),
        ('DESIGN_UPDATED', 'Design mis à jour'),
        ('PROOF_UPLOADED', 'Preuve uploadée'),
        ('COMMENT', 'Commentaire'),
    )
    
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='logs', null=True, blank=True)
    batch = models.ForeignKey(PrintBatch, on_delete=models.CASCADE, related_name='logs', null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    details = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        if self.campaign:
            return f"{self.action} - {self.campaign.name}"
        elif self.batch:
            return f"{self.action} - Batch {self.batch.batch_number}"
        return f"{self.action}"

class CampaignProof(models.Model):
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='proofs')
    image = models.ImageField(upload_to='campaign_proofs/')
    description = models.TextField(blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Preuve pour {self.campaign.name}"

# Modèles pour la sécurité (gardés)
class PasswordResetToken(models.Model):
    """
    Token sécurisé pour la réinitialisation de mot de passe
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Reset token for {self.user.email} ({'used' if self.used else 'active'})"
    
    def is_valid(self):
        """Vérifie si le token est encore valide"""
        return not self.used and timezone.now() < self.expires_at

class LoginAttempt(models.Model):
    """
    Suivi des tentatives de connexion pour la sécurité
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    email = models.EmailField()
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    success = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    reason = models.CharField(max_length=100, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['email', 'timestamp']),
            models.Index(fields=['ip_address', 'timestamp']),
        ]