from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Create an admin user from environment variables or default values'

    def handle(self, *args, **options):
        # Utiliser les variables d'environnement ou les valeurs par défaut
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@backpub.com')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin123')
        company_name = os.environ.get('DJANGO_SUPERUSER_COMPANY', 'BackPub Admin')
        
        # Vérifier si l'utilisateur existe déjà
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f'User "{username}" already exists'))
            return
        
        # Créer le superuser
        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            role='admin',
            company_name=company_name
        )
        self.stdout.write(self.style.SUCCESS(f'✅ Admin user "{username}" created successfully!'))
        self.stdout.write(self.style.SUCCESS(f'   Email: {email}'))