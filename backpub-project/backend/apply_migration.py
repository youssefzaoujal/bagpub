#!/usr/bin/env python
"""
Script pour appliquer la migration manquante
"""
import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backpub.settings')
django.setup()

from django.core.management import execute_from_command_line

if __name__ == '__main__':
    print("🔧 Application de la migration pour ajouter payment_required et payment_status...")
    execute_from_command_line(['manage.py', 'migrate', 'api'])
    print("✅ Migration appliquée avec succès!")
    print("\nVous pouvez maintenant redémarrer le serveur Django.")
