from rest_framework import serializers
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
import secrets
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import *

# ============================================
# SERIALIZERS D'UTILISATEUR
# ============================================

class UserSerializer(serializers.ModelSerializer):
    """Serializer pour les utilisateurs existants"""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'company_name', 
                 'phone', 'city', 'postal_code', 'siret', 'tva_number',
                 'partner_type', 'coverage_radius', 'is_active')
        read_only_fields = ('role', 'username', 'email')

class RegisterClientSerializer(serializers.ModelSerializer):
    """Serializer pour l'inscription des clients"""
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'company_name', 
                 'siret', 'tva_number', 'phone')
        
    def validate_username(self, value):
        """Valider l'unicité du username (optimisé)"""
        # Utiliser only() pour ne récupérer que le champ nécessaire
        if User.objects.filter(username=value).only('id').exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà pris.")
        return value
    
    def validate_email(self, value):
        """Valider l'unicité de l'email (optimisé)"""
        # Utiliser only() pour ne récupérer que le champ nécessaire
        if User.objects.filter(email=value).only('id').exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value
    
    def create(self, validated_data):
        """Créer un utilisateur client"""
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            company_name=validated_data['company_name'],
            siret=validated_data.get('siret', ''),
            tva_number=validated_data.get('tva_number', ''),
            phone=validated_data.get('phone', ''),
            role='client',
            is_active=True
        )
        
        # Envoyer l'email de bienvenue
        self.send_welcome_email(user)
        
        return user
    
    def send_welcome_email(self, user):
        """Envoyer un email de bienvenue au client (asynchrone)"""
        import threading
        from .utils.email_service import EmailService
        
        def send_email_async():
            try:
                EmailService.send_welcome_email_client(user)
                print(f"✅ Email de bienvenue envoyé à {user.email}")
            except Exception as e:
                print(f"⚠️ Erreur envoi email de bienvenue: {e}")
        
        # Lancer l'envoi d'email dans un thread séparé (non bloquant)
        thread = threading.Thread(target=send_email_async)
        thread.daemon = True
        thread.start()

class RegisterPartnerSerializer(serializers.ModelSerializer):
    """Serializer pour l'inscription des partenaires"""
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    partner_type = serializers.CharField(required=False, allow_blank=True)
    coverage_radius = serializers.IntegerField(required=False, default=10)

    class Meta:
        model = User
        fields = ('company_name', 'email', 'phone', 'address', 'city', 'postal_code', 
                 'password', 'partner_type', 'coverage_radius')
    
    def validate_email(self, value):
        """Valider l'unicité et le format de l'email (optimisé et sécurisé)"""
        import re
        # Validation du format email
        email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        if not email_pattern.match(value):
            raise serializers.ValidationError("Format d'email invalide.")
        
        # Normalisation de l'email (minuscules)
        value = value.lower().strip()
        
        # Limite de longueur
        if len(value) > 254:
            raise serializers.ValidationError("L'email est trop long.")
        
        # Utiliser only() pour ne récupérer que le champ nécessaire
        if User.objects.filter(email=value).only('id').exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value
    
    def create(self, validated_data):
        """Créer un utilisateur partenaire"""
        email = validated_data.get('email')
        company_name = validated_data.get('company_name')
        
        # Générer un username unique basé sur l'email
        base_username = email.split('@')[0]
        username = base_username
        counter = 1
        
        while User.objects.filter(username=username).only('id').exists():
            username = f"{base_username}{counter}"
            counter += 1
        
        # Générer un mot de passe aléatoire si non fourni
        password = validated_data.get('password')
        if not password:
            password = secrets.token_urlsafe(12)
        
        # Créer l'utilisateur partenaire
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            company_name=company_name,
            phone=validated_data.get('phone'),
            city=validated_data.get('city'),
            postal_code=validated_data.get('postal_code'),
            partner_type=validated_data.get('partner_type', ''),
            coverage_radius=validated_data.get('coverage_radius', 10),
            role='partner',
            is_active=False
        )
        
        # Créer le profil partenaire
        Partner.objects.create(
            user=user,
            company_name=company_name,
            email=email,
            phone=validated_data.get('phone'),
            address=validated_data.get('address', ''),
            city=validated_data.get('city'),
            postal_code=validated_data.get('postal_code'),
            coverage_radius=validated_data.get('coverage_radius', 10)
        )
        
        # Envoyer l'email de bienvenue au partenaire
        import threading
        from .utils.email_service import EmailService
        
        def send_email_async():
            try:
                EmailService.send_welcome_email_partner(user)
                print(f"✅ Email de bienvenue partenaire envoyé à {user.email}")
            except Exception as e:
                print(f"⚠️ Erreur envoi email de bienvenue partenaire: {e}")
        
        # Lancer l'envoi d'email dans un thread séparé (non bloquant)
        thread = threading.Thread(target=send_email_async)
        thread.daemon = True
        thread.start()
        
        return user

class LoginSerializer(serializers.Serializer):
    """Serializer pour la connexion"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        """Valider les identifiants"""
        user = authenticate(username=data['username'], password=data['password'])
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Identifiants incorrects ou compte inactif")

# Serializer personnalisé pour ajouter le rôle dans le token JWT
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Ajouter le rôle et autres infos utiles dans le token
        token['role'] = user.role
        token['username'] = user.username
        token['email'] = user.email
        token['user_id'] = str(user.id)
        return token

# ============================================
# SERIALIZERS CAMPAGNES
# ============================================

class CampaignSerializer(serializers.ModelSerializer):
    """Serializer pour les campagnes - SÉCURISÉ"""
    client_details = serializers.SerializerMethodField()
    partner_details = serializers.SerializerMethodField()
    design = serializers.SerializerMethodField()
    has_custom_card = serializers.BooleanField(read_only=True)
    printing_status = serializers.CharField(read_only=True)
    common_campaigns = serializers.SerializerMethodField()
    custom_card_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Campaign
        fields = [
            'id', 'order_number', 'name', 'client', 'client_details',
            'partner', 'partner_details', 'postal_codes', 'quantity',
            'status', 'printing_status', 'secure_token', 'created_at', 
            'updated_at', 'special_request', 'estimated_price', 'faces',
            'use_custom_card', 'custom_card', 'custom_card_url', 'has_custom_card', 'design',
            'common_campaigns'
        ]
        read_only_fields = ['order_number', 'secure_token', 'created_at', 
                           'updated_at', 'client', 'printing_status']
    
    def validate_quantity(self, value):
        """Quantité fixe à 1000 sacs"""
        return 1000
    
    def validate_postal_codes(self, value):
        """Validation stricte des codes postaux"""
        import re
        if not value:
            raise serializers.ValidationError("Codes postaux requis.")
        
        codes = [c.strip() for c in value.split(',') if c.strip()]
        postal_code_pattern = re.compile(r'^\d{5}$')
        
        for code in codes:
            if not postal_code_pattern.match(code):
                raise serializers.ValidationError(f"Code postal invalide: {code}")
        
        if len(codes) < 5:
            raise serializers.ValidationError("Minimum 5 codes postaux requis.")
        if len(codes) > 100:
            raise serializers.ValidationError("Maximum 100 codes postaux autorisés.")
        
        return value
    
    def validate_estimated_price(self, value):
        """Validation du prix"""
        if value and (value <= 0 or value > 100000):
            raise serializers.ValidationError("Prix invalide.")
        return value
    
    def get_client_details(self, obj):
        if obj.client:
            return {
                'id': obj.client.id,
                'username': obj.client.username,
                'company_name': obj.client.company_name,
                'email': obj.client.email,
                'phone': obj.client.phone,
                'address': obj.client.address,
                'city': obj.client.city,
                'postal_code': obj.client.postal_code,
                'siret': obj.client.siret,
                'tva_number': obj.client.tva_number
            }
        return None
    
    def get_partner_details(self, obj):
        if obj.partner:
            return {
                'id': obj.partner.id,
                'company_name': obj.partner.company_name,
                'city': obj.partner.city,
                'email': obj.partner.email,
                'phone': obj.partner.phone
            }
        return None
    
    def get_design(self, obj):
        """Retourne les données du design si elles existent"""
        try:
            design = CampaignDesign.objects.get(campaign=obj)
            serializer = CampaignDesignSerializer(design, context=self.context)
            return serializer.data
        except CampaignDesign.DoesNotExist:
            # Ne pas créer de design rétroactivement ici car cela peut causer des problèmes
            # lors de la sérialisation de plusieurs campagnes en même temps
            # Le design sera créé lors de la création de campagne ou lors de la récupération
            # d'une campagne spécifique (via une vue séparée si nécessaire)
            return None
    
    def get_common_campaigns(self, obj):
        """Retourne les campagnes avec codes postaux communs"""
        try:
            common_campaigns = obj.get_common_campaigns_by_postal_code()
            return [
                {
                    'id': str(c.id),
                    'order_number': c.order_number,
                    'name': c.name,
                    'client': c.client.company_name
                }
                for c in common_campaigns[:5]  # Limiter à 5 pour l'affichage
            ]
        except:
            return []
    
    def get_custom_card_url(self, obj):
        """Retourne l'URL complète de la carte personnalisée"""
        if obj.custom_card:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.custom_card.url)
            return obj.custom_card.url
        return None
    
    def validate_custom_card(self, value):
        """Valider le fichier de carte personnalisée"""
        if value:
            # Vérifier l'extension
            allowed_extensions = ['pdf', 'jpg', 'jpeg', 'png', 'ai', 'eps', 'psd']
            ext = value.name.split('.')[-1].lower()
            if ext not in allowed_extensions:
                raise serializers.ValidationError(
                    f"Format de fichier non supporté. Formats autorisés: {', '.join(allowed_extensions)}"
                )
            
            # Vérifier la taille (max 10MB)
            max_size = 10 * 1024 * 1024  # 10MB
            if value.size > max_size:
                raise serializers.ValidationError("Le fichier ne doit pas dépasser 10MB")
        
        return value

class CampaignDesignSerializer(serializers.ModelSerializer):
    """Serializer pour les designs de campagne"""
    campaign_name = serializers.CharField(source='campaign.name', read_only=True)
    client_company = serializers.CharField(source='campaign.client.company_name', read_only=True)
    qr_code_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = CampaignDesign
        fields = [
            'id', 'campaign', 'campaign_name', 'client_company',
            'slogan', 'company_email', 'company_phone', 'company_address',
            'company_postal_code', 'logo', 'template', 'accent_color',
            'contact_method', 'qr_code', 'qr_code_url', 'qr_code_image_url', 'created_at', 'updated_at'
        ]
        read_only_fields = ['qr_code', 'qr_code_url', 'created_at', 'updated_at']
    
    def get_qr_code_image_url(self, obj):
        """Retourne l'URL complète de l'image QR code"""
        if obj.qr_code:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.qr_code.url)
            return obj.qr_code.url
        return None

# ============================================
# SERIALIZERS BATCH ET IMPRESSION
# ============================================

class PrintBatchSerializer(serializers.ModelSerializer):
    """Serializer pour les batchs d'impression"""
    partner_details = serializers.SerializerMethodField()
    campaigns_count = serializers.SerializerMethodField()
    total_quantity = serializers.IntegerField(read_only=True)
    client_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = PrintBatch
        fields = [
            'id', 'batch_number', 'postal_code', 'partner', 'partner_details',
            'status', 'campaigns_count', 'total_quantity', 'client_count',
            'created_at', 'updated_at', 'printed_at', 'delivered_at'
        ]
        read_only_fields = ['batch_number', 'created_at', 'updated_at']
    
    def get_partner_details(self, obj):
        if obj.partner:
            return {
                'id': obj.partner.id,
                'company_name': obj.partner.company_name,
                'email': obj.partner.email,
                'phone': obj.partner.phone,
                'city': obj.partner.city,
                'postal_code': obj.partner.postal_code,
                'coverage_radius': obj.partner.coverage_radius
            }
        return None
    
    def get_campaigns_count(self, obj):
        return obj.campaigns.count()

class PrintOrderSerializer(serializers.ModelSerializer):
    """Serializer pour les ordres d'impression"""
    batch_details = PrintBatchSerializer(source='batch', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)
    printing_details = serializers.SerializerMethodField()
    
    class Meta:
        model = PrintOrder
        fields = [
            'id', 'order_number', 'batch', 'batch_details', 'status',
            'assigned_to', 'assigned_to_name', 'print_file',
            'created_at', 'updated_at', 'started_at', 'completed_at', 'shipped_at',
            'printing_details'
        ]
        read_only_fields = ['order_number', 'created_at', 'updated_at', 
                           'started_at', 'completed_at', 'shipped_at']
    
    def get_printing_details(self, obj):
        """Retourne les détails complets pour l'impression"""
        return obj.get_printing_details()

# ============================================
# SERIALIZERS PARTENAIRES
# ============================================

class PartnerSerializer(serializers.ModelSerializer):
    """Serializer pour les partenaires"""
    user_details = UserSerializer(source='user', read_only=True)
    campaign_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Partner
        fields = [
            'id', 'user', 'user_details', 'company_name', 'email',
            'phone', 'address', 'city', 'postal_code', 'coverage_radius',
            'is_active', 'created_at', 'campaign_count'
        ]
    
    def get_campaign_count(self, obj):
        """Compter le nombre de campagnes assignées à ce partenaire"""
        return Campaign.objects.filter(partner=obj).count()

# ============================================
# SERIALIZERS DE LOGS ET PREUVES
# ============================================

class CampaignLogSerializer(serializers.ModelSerializer):
    """Serializer pour les logs de campagne"""
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)
    campaign_name = serializers.CharField(source='campaign.name', read_only=True)
    batch_number = serializers.CharField(source='batch.batch_number', read_only=True)
    
    class Meta:
        model = CampaignLog
        fields = [
            'id', 'campaign', 'campaign_name', 'batch', 'batch_number',
            'user', 'user_name', 'user_role', 'action', 'details', 'created_at'
        ]
        read_only_fields = ['created_at']

class CampaignProofSerializer(serializers.ModelSerializer):
    """Serializer pour les preuves de campagne"""
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = CampaignProof
        fields = [
            'id', 'campaign', 'image', 'image_url', 'description',
            'uploaded_by', 'uploaded_by_name', 'uploaded_at'
        ]
        read_only_fields = ['uploaded_at']
    
    def get_image_url(self, obj):
        """Retourner l'URL complète de l'image"""
        request = self.context.get('request')
        if request and obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None

# ============================================
# SERIALIZERS POUR MOT DE PASSE
# ============================================

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    
    def validate_email(self, value):
        email = value.lower().strip()
        try:
            user = User.objects.get(email=email)
            if not user.is_active:
                raise serializers.ValidationError("Ce compte est désactivé.")
            self.context['user'] = user
        except User.DoesNotExist:
            pass
        return email

class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'Les mots de passe ne correspondent pas.'
            })
        
        # Vérifier la complexité
        password = data['new_password']
        if not any(char.isdigit() for char in password):
            raise serializers.ValidationError({
                'new_password': 'Le mot de passe doit contenir au moins un chiffre.'
            })
        if not any(char.isalpha() for char in password):
            raise serializers.ValidationError({
                'new_password': 'Le mot de passe doit contenir au moins une lettre.'
            })
        
        # Vérifier le token
        try:
            reset_token = PasswordResetToken.objects.get(
                token=data['token'],
                used=False
            )
            
            if not reset_token.is_valid():
                raise serializers.ValidationError({
                    'token': 'Ce lien de réinitialisation a expiré.'
                })
            
            self.context['reset_token'] = reset_token
            self.context['user'] = reset_token.user
            
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError({
                'token': 'Lien de réinitialisation invalide.'
            })
        
        return data

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    
    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Mot de passe actuel incorrect.')
        return value
    
    def validate(self, data):
        if data['new_password'] == data['current_password']:
            raise serializers.ValidationError({
                'new_password': 'Le nouveau mot de passe doit être différent de l\'actuel.'
            })
        
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'Les mots de passe ne correspondent pas.'
            })
        
        # Vérifier la complexité
        password = data['new_password']
        if not any(char.isdigit() for char in password):
            raise serializers.ValidationError({
                'new_password': 'Le mot de passe doit contenir au moins un chiffre.'
            })
        if not any(char.isupper() for char in password):
            raise serializers.ValidationError({
                'new_password': 'Le mot de passe doit contenir au moins une majuscule.'
            })
        
        return data