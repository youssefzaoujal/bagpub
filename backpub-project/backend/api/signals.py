from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db import transaction
from .models import Campaign, CampaignLog, PrintBatch
from .utils.email_service import EmailService

@receiver(post_save, sender=Campaign)
def log_campaign_creation(sender, instance, created, **kwargs):
    """Log la création d'une campagne"""
    if created:
        CampaignLog.objects.create(
            campaign=instance,
            user=instance.client,
            action='CREATED',
            details=f"Campagne créée par {instance.client.username}"
        )
        
        # Envoyer email à l'admin (dans un thread pour ne pas bloquer)
        import threading
        def send_admin_email():
            try:
                EmailService.send_campaign_created_email(instance)
            except Exception as e:
                print(f"⚠️ Erreur envoi email admin: {e}")
        thread = threading.Thread(target=send_admin_email)
        thread.daemon = True
        thread.start()
        
        # Note: L'email au client est envoyé directement dans la vue après la création complète
        # pour s'assurer que tous les détails (design, etc.) sont prêts

@receiver(post_save, sender=Campaign)
def handle_status_change(sender, instance, **kwargs):
    """Gère les changements de statut"""
    if 'update_fields' in kwargs and 'status' in kwargs['update_fields']:
        CampaignLog.objects.create(
            campaign=instance,
            user=None,  # Système
            action='STATUS_CHANGE',
            details=f"Statut changé à {instance.get_status_display()}"
        )
        
        # Email si impression terminée
        if instance.status == 'PRINTED':
            EmailService.send_print_completed_email(instance)

@receiver(post_save, sender=PrintBatch)
def handle_print_batch_creation(sender, instance, created, **kwargs):
    """Gère la création d'un batch d'impression"""
    if created:
        # Log de création du batch
        CampaignLog.objects.create(
            batch=instance,
            user=None,  # Système
            action='BATCH_CREATED',
            details=f"Batch {instance.batch_number} créé avec {instance.campaigns.count()} campagne(s)"
        )