from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings

class EmailService:
    @staticmethod
    def send_welcome_email_client(user):
        """Email de bienvenue au client après inscription"""
        subject = f"🎉 Bienvenue chez BagPub, {user.company_name} !"
        
        context = {
            'company_name': user.company_name or user.username,
            'dashboard_url': f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/client/dashboard",
            'subject': subject
        }
        
        html_content = render_to_string('emails/welcome_client.html', context)
        text_content = f"""
Bonjour {user.company_name or user.username},

Nous sommes ravis de vous accueillir chez BagPub !

Votre compte a été créé avec succès.

Vous pouvez dès maintenant :
1. Créer vos premières commandes
2. Uploader vos propres cartes de visite
3. Suivre l'avancement de vos commandes

Pour accéder à votre compte : {context['dashboard_url']}

Besoin d'aide ? Contactez-nous à support@bagpub.com

Cordialement,
L'équipe BagPub
        """
        
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
    
    @staticmethod
    def send_welcome_email_partner(user):
        """Email de bienvenue au partenaire après inscription"""
        subject = f"🤝 Demande de partenariat reçue - {user.company_name}"
        
        context = {
            'company_name': user.company_name or user.username,
            'email': user.email,
            'phone': user.phone or '',
            'city': user.city or '',
            'subject': subject
        }
        
        html_content = render_to_string('emails/welcome_partner.html', context)
        text_content = f"""
Bonjour {user.company_name or user.username},

Nous avons bien reçu votre demande de partenariat pour BagPub !

Votre demande est en cours d'examen. Notre équipe va examiner votre profil et vous contactera dans les plus brefs délais.

Informations de votre demande :
- Entreprise: {user.company_name}
- Email: {user.email}
- Téléphone: {user.phone or 'Non renseigné'}
- Ville: {user.city or 'Non renseigné'}

Des questions ? Contactez-nous à partners@bagpub.com

Cordialement,
L'équipe BagPub
        """
        
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
    
    @staticmethod
    def send_campaign_created_email_to_client(campaign):
        """Email au client quand sa campagne est créée"""
        subject = f"✅ Commande créée avec succès - {campaign.order_number}"
        
        context = {
            'client_name': campaign.client.company_name or campaign.client.username,
            'campaign_name': campaign.name,
            'order_number': campaign.order_number,
            'quantity': campaign.quantity,
            'postal_codes': campaign.postal_codes,
            'estimated_price': f"{campaign.estimated_price:.2f}" if campaign.estimated_price else None,
            'dashboard_url': f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/client/dashboard",
            'subject': subject
        }
        
        html_content = render_to_string('emails/campaign_created_client.html', context)
        text_content = f"""
Bonjour {context['client_name']},

Votre commande "{campaign.name}" a été créée avec succès !

DÉTAILS DE VOTRE COMMANDE:
- Numéro de commande: {campaign.order_number}
- Quantité: {campaign.quantity} sacs
- Codes postaux: {campaign.postal_codes}
- Prix estimé: {context['estimated_price'] or 'N/A'} €

Prochaines étapes :
1. Examen de votre commande par notre équipe
2. Attribution d'un partenaire pour la distribution
3. Mise en impression de vos cartes
4. Distribution dans les zones sélectionnées

Vous recevrez un email à chaque étape pour suivre l'avancement de votre commande.

Cordialement,
L'équipe BagPub
        """
        
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[campaign.client.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
    
    @staticmethod
    def send_campaign_created_email(campaign):
        """Email à l'admin quand une campagne est créée"""
        subject = f"Nouvelle campagne créée - {campaign.order_number}"
        
        context = {
            'campaign_name': campaign.name,
            'client_name': campaign.client.company_name,
            'order_number': campaign.order_number,
            'quantity': campaign.quantity,
            'postal_codes': campaign.postal_codes,
            'admin_url': f"{settings.ADMIN_URL}/campaigns/{campaign.id}"
        }
        
        html_content = render_to_string('emails/campaign_created.html', context)
        text_content = f"""
Nouvelle campagne créée sur BagPub

Nom: {campaign.name}
Client: {campaign.client.company_name}
Numéro: {campaign.order_number}
Quantité: {campaign.quantity} sacs
Codes postaux: {campaign.postal_codes}

Connectez-vous à l'admin pour plus de détails.
        """
        
        # Envoyer aux admins
        from .models import User
        admin_users = User.objects.filter(role='admin')
        admin_emails = [user.email for user in admin_users]
        
        if admin_emails:
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=admin_emails
            )
            email.attach_alternative(html_content, "text/html")
            email.send()
    
    @staticmethod
    def send_partner_assigned_email(campaign):
        """Email au client quand un partenaire est assigné et campagne envoyée à l'impression"""
        # Recharger la campagne avec le partenaire pour accéder aux détails
        from api.models import Campaign
        campaign = Campaign.objects.select_related('partner', 'client').get(id=campaign.id)
        
        if not campaign.partner:
            print(f"⚠️ Aucun partenaire assigné à la campagne {campaign.order_number}, email non envoyé")
            return
        
        if not campaign.client or not campaign.client.email:
            print(f"⚠️ Client ou email client manquant pour la campagne {campaign.order_number}, email non envoyé")
            return
        
        print(f"📧 Préparation email pour campagne {campaign.order_number} - Client: {campaign.client.email} - Partenaire: {campaign.partner.company_name}")
        
        subject = f"Votre campagne est en cours d'impression - {campaign.name}"
        
        context = {
            'client_name': campaign.client.company_name or campaign.client.username,
            'campaign_name': campaign.name,
            'order_number': campaign.order_number,
            'quantity': campaign.quantity,
            'postal_codes': campaign.postal_codes or '',
            'partner_company_name': campaign.partner.company_name,
            'partner_email': campaign.partner.email,
            'partner_phone': campaign.partner.phone or '',
            'partner_address': campaign.partner.address or '',
            'partner_city': campaign.partner.city or '',
            'partner_postal_code': campaign.partner.postal_code or '',
            'dashboard_url': f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/client/dashboard",
            'subject': subject
        }
        
        html_content = render_to_string('emails/partner_assigned.html', context)
        text_content = f"""
Bonjour {context['client_name']},

Excellente nouvelle ! Votre campagne "{campaign.name}" est maintenant en cours d'impression.

📦 DÉTAILS DE VOTRE COMMANDE:
   • Numéro de commande: {campaign.order_number}
   • Quantité: {campaign.quantity} sacs
   • Statut: En impression

🤝 PARTENAIRE ASSIGNÉ:
   • Entreprise: {campaign.partner.company_name}
   • Email: {campaign.partner.email}
   • Téléphone: {campaign.partner.phone if campaign.partner.phone else 'Non renseigné'}
   
   Ce partenaire sera responsable de la distribution de vos sacs dans les zones sélectionnées.

📧 Le partenaire vous contactera prochainement pour coordonner la distribution.

Vous pouvez suivre l'avancement de votre campagne depuis votre tableau de bord : {context['dashboard_url']}

Cordialement,
L'équipe BagPub
        """
        
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[campaign.client.email]
        )
        email.attach_alternative(html_content, "text/html")
        
        try:
            email.send()
            print(f"✅ Email envoyé avec succès à {campaign.client.email} pour campagne {campaign.order_number}")
        except Exception as e:
            import traceback
            print(f"❌ Erreur lors de l'envoi de l'email à {campaign.client.email} pour campagne {campaign.order_number}: {e}")
            print(f"❌ Traceback: {traceback.format_exc()}")
            raise
    
    @staticmethod
    def send_print_completed_email(campaign):
        """Email au client quand l'impression est terminée"""
        subject = f"Impression terminée - {campaign.name}"
        
        text_content = f"""
Bonjour,

L'impression de votre campagne "{campaign.name}" est maintenant terminée.

Numéro de commande: {campaign.order_number}
Quantité: {campaign.quantity} sacs

La campagne passe maintenant en phase de distribution.

Cordialement,
L'équipe BagPub
        """
        
        send_mail(
            subject=subject,
            message=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[campaign.client.email],
            fail_silently=True
        )
    
    @staticmethod
    def send_status_change_email(campaign, old_status, new_status):
        """Email au client quand le statut de la campagne change"""
        status_labels = {
            'CREATED': 'Créée',
            'ASSIGNED_TO_PARTNER': 'Attribuée à un partenaire',
            'ASSIGNED': 'Attribuée à un partenaire',
            'IN_PRINTING': 'En impression',
            'PRINTED': 'Imprimée',
            'IN_DISTRIBUTION': 'En cours de distribution',
            'DELIVERED': 'Livrée',
            'FINISHED': 'Terminée'
        }
        
        old_label = status_labels.get(old_status, old_status)
        new_label = status_labels.get(new_status, new_status)
        
        subject = f"📊 Mise à jour de votre commande - {campaign.name}"
        
        context = {
            'client_name': campaign.client.company_name or campaign.client.username,
            'campaign_name': campaign.name,
            'order_number': campaign.order_number,
            'quantity': campaign.quantity,
            'postal_codes': campaign.postal_codes,
            'old_status': old_status,
            'new_status': new_status,
            'old_status_label': old_label,
            'new_status_label': new_label,
            'dashboard_url': f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/client/dashboard",
            'subject': subject
        }
        
        html_content = render_to_string('emails/campaign_status.html', context)
        text_content = f"""
Bonjour {context['client_name']},

Le statut de votre commande "{campaign.name}" a été mis à jour.

📦 DÉTAILS DE VOTRE COMMANDE:
   • Numéro de commande: {campaign.order_number}
   • Quantité: {campaign.quantity} sacs
   • Ancien statut: {old_label}
   • Nouveau statut: {new_label}

"""
        
        # Ajouter des messages spécifiques selon le statut
        if new_status == 'IN_PRINTING':
            text_content += "Votre commande est maintenant en cours d'impression. Nous vous tiendrons informé de l'avancement.\n\n"
        elif new_status == 'PRINTED':
            text_content += "L'impression de votre commande est terminée. Elle va maintenant être distribuée.\n\n"
        elif new_status == 'IN_DISTRIBUTION':
            text_content += "Votre commande est maintenant en cours de distribution. Les sacs seront bientôt livrés dans les zones sélectionnées.\n\n"
        elif new_status == 'FINISHED':
            text_content += "Votre commande est terminée. Tous les sacs ont été distribués avec succès.\n\n"
        
        text_content += """Vous pouvez suivre l'avancement de votre commande depuis votre tableau de bord.

Cordialement,
L'équipe BagPub
        """
        
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[campaign.client.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
