# api/email_service.py
import secrets
import string
from datetime import timedelta
from django.utils import timezone
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

class PasswordResetService:
    
    @staticmethod
    def generate_token():
        """Génère un token sécurisé"""
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(64))
    
    @staticmethod
    def create_reset_token(user, request):
        """Crée un token de réinitialisation"""
        from .models import PasswordResetToken
        
        # Invalider tous les tokens précédents
        PasswordResetToken.objects.filter(user=user, used=False).update(used=True)
        
        # Générer un nouveau token
        token = PasswordResetService.generate_token()
        expires_at = timezone.now() + timedelta(hours=24)
        
        reset_token = PasswordResetToken.objects.create(
            user=user,
            token=token,
            expires_at=expires_at,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return reset_token
    
    @staticmethod
    def send_reset_email(user, reset_token, request):
        """Envoie l'email de réinitialisation"""
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{reset_token.token}"
        
        context = {
            'company_name': user.company_name or user.username,
            'reset_url': reset_url,
            'expires_in': '24 heures',
            'ip_address': reset_token.ip_address,
            'user_agent': reset_token.user_agent,
            'current_year': timezone.now().year,
            'support_email': settings.DEFAULT_FROM_EMAIL
        }
        
        # Email HTML
        html_content = render_to_string('emails/password_reset.html', context)
        text_content = strip_tags(html_content)
        
        email = EmailMultiAlternatives(
            subject=f"🔒 Réinitialisation de votre mot de passe BackPub",
            body=text_content,
            from_email=f"BackPub Sécurité <{settings.DEFAULT_FROM_EMAIL}>",
            to=[user.email],
            reply_to=[settings.DEFAULT_FROM_EMAIL]
        )
        email.attach_alternative(html_content, "text/html")
        
        try:
            email.send()
            return True
        except Exception as e:
            print(f"❌ Erreur envoi email réinitialisation: {e}")
            return False
    
    @staticmethod
    def send_password_changed_email(user, request):
        """Envoie une confirmation de changement de mot de passe"""
        context = {
            'company_name': user.company_name or user.username,
            'timestamp': timezone.now().strftime("%d/%m/%Y à %H:%M"),
            'ip_address': request.META.get('REMOTE_ADDR'),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'support_email': settings.DEFAULT_FROM_EMAIL
        }
        
        html_content = render_to_string('emails/password_changed.html', context)
        text_content = strip_tags(html_content)
        
        email = EmailMultiAlternatives(
            subject=f"✅ Votre mot de passe BackPub a été modifié",
            body=text_content,
            from_email=f"BackPub Sécurité <{settings.DEFAULT_FROM_EMAIL}>",
            to=[user.email],
            reply_to=[settings.DEFAULT_FROM_EMAIL]
        )
        email.attach_alternative(html_content, "text/html")
        
        try:
            email.send()
            return True
        except Exception as e:
            print(f"❌ Erreur envoi email confirmation: {e}")
            return False