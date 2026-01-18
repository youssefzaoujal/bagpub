#!/usr/bin/env python
"""
Script pour créer des données de test pour BackPub
"""
import os
import django
import random
from faker import Faker
from datetime import datetime, timedelta

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backpub.settings')
django.setup()

from django.contrib.auth import get_user_model
from api.models import User, Campaign, CampaignDesign, Partner, PrintBatch, CampaignLog, CampaignProof
from django.utils import timezone

# Initialiser Faker avec locale française
fake = Faker('fr_FR')
User = get_user_model()

def create_superuser():
    """Crée un superutilisateur admin"""
    try:
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@backpub.com',
                password='admin123',
                role='admin',
                company_name='BackPub Admin',
                phone='01 23 45 67 89'
            )
            print("✅ Superutilisateur 'admin' créé (mot de passe: admin123)")
        else:
            print("⚠️ Superutilisateur 'admin' existe déjà")
    except Exception as e:
        print(f"❌ Erreur création superutilisateur: {e}")

def create_clients(num_clients=10):
    """Crée des clients de test"""
    clients = []
    print(f"\n📋 Création de {num_clients} clients...")
    
    for i in range(num_clients):
        try:
            # Générer des données aléatoires
            company_name = fake.company()
            username = f"client_{i+1}"
            email = f"client{i+1}@example.com"
            
            if not User.objects.filter(username=username).exists():
                client = User.objects.create_user(
                    username=username,
                    email=email,
                    password='client123',
                    role='client',
                    company_name=company_name,
                    siret=fake.numerify(text='##############'),
                    tva_number=f'FR{fake.numerify(text="## ### ### ###")}',
                    phone=fake.phone_number(),
                    address=fake.address(),
                    city=fake.city(),
                    postal_code=fake.postcode(),
                    is_active=True
                )
                clients.append(client)
                print(f"  ✅ Client {i+1}: {company_name}")
            else:
                client = User.objects.get(username=username)
                clients.append(client)
                print(f"  ⚠️ Client {i+1} existe déjà: {company_name}")
        except Exception as e:
            print(f"  ❌ Erreur création client {i+1}: {e}")
    
    return clients

def create_partners(num_partners=5):
    """Crée des partenaires de test"""
    partners = []
    print(f"\n🤝 Création de {num_partners} partenaires...")
    
    for i in range(num_partners):
        try:
            username = f'partner_{i+1}'
            
            if not User.objects.filter(username=username).exists():
                # Créer d'abord l'utilisateur
                partner_user = User.objects.create_user(
                    username=username,
                    email=f'partner{i+1}@example.com',
                    password='partner123',
                    role='partner',
                    company_name=f'Partenaire {fake.company()}',
                    phone=fake.phone_number(),
                    address=fake.address(),
                    city=fake.city(),
                    postal_code=fake.postcode(),
                    partner_type=random.choice(['Impression', 'Distribution', 'Complet']),
                    coverage_radius=random.randint(10, 100),
                    is_active=True
                )
                
                # Créer le profil partenaire
                partner = Partner.objects.create(
                    user=partner_user,
                    company_name=partner_user.company_name,
                    email=partner_user.email,
                    phone=partner_user.phone,
                    address=partner_user.address,
                    city=partner_user.city,
                    postal_code=partner_user.postal_code,
                    coverage_radius=partner_user.coverage_radius,
                    is_active=True
                )
                partners.append(partner)
                print(f"  ✅ Partenaire {i+1}: {partner.company_name}")
            else:
                partner_user = User.objects.get(username=username)
                partner, created = Partner.objects.get_or_create(
                    user=partner_user,
                    defaults={
                        'company_name': partner_user.company_name,
                        'email': partner_user.email,
                        'phone': partner_user.phone,
                        'address': partner_user.address,
                        'city': partner_user.city,
                        'postal_code': partner_user.postal_code,
                        'coverage_radius': partner_user.coverage_radius,
                        'is_active': True
                    }
                )
                partners.append(partner)
                print(f"  ⚠️ Partenaire {i+1} existe déjà: {partner.company_name}")
                
        except Exception as e:
            print(f"  ❌ Erreur création partenaire {i+1}: {e}")
    
    return partners

def create_campaigns(clients, num_campaigns_per_client=3):
    """Crée des campagnes de test pour chaque client"""
    campaigns = []
    print(f"\n🎯 Création de campagnes...")
    
    statuses = ['CREATED', 'IN_PRINTING', 'PRINTED', 'IN_DISTRIBUTION', 'DELIVERED', 'FINISHED']
    
    for client_idx, client in enumerate(clients):
        for camp_idx in range(num_campaigns_per_client):
            try:
                # Générer des codes postaux aléatoires
                postal_codes = ', '.join([fake.postcode() for _ in range(random.randint(3, 8))])
                
                # Créer un nom de campagne unique
                campaign_name = f"{client.company_name} - Campagne {camp_idx+1} {datetime.now().year}"
                
                # Créer la campagne
                campaign = Campaign.objects.create(
                    name=campaign_name,
                    client=client,
                    postal_codes=postal_codes,
                    quantity=random.choice([1000, 2000, 3000, 4000, 5000]),
                    status=random.choice(statuses),
                    special_request=random.choice(['', 'Impression recto-verso', 'Papier premium', 'Livraison express', '']),
                    estimated_price=random.uniform(100, 1000),
                    faces=random.choice([1, 2])
                )
                
                # Créer un design pour certaines campagnes
                if random.random() > 0.3:  # 70% des campagnes ont un design
                    create_campaign_design(campaign)
                
                campaigns.append(campaign)
                
                # Créer des logs
                create_campaign_logs(campaign, client)
                
                print(f"  ✅ Campagne pour {client.company_name}: {campaign.name}")
                
            except Exception as e:
                print(f"  ❌ Erreur création campagne: {e}")
    
    return campaigns

def create_campaign_design(campaign):
    """Crée un design pour une campagne"""
    try:
        templates = ['professional', 'modern', 'elegant']
        contact_methods = ['email', 'whatsapp', 'both']
        
        design, created = CampaignDesign.objects.get_or_create(
            campaign=campaign,
            defaults={
                'slogan': fake.catch_phrase(),
                'company_email': campaign.client.email,
                'company_phone': campaign.client.phone,
                'company_address': campaign.client.address,
                'company_postal_code': campaign.client.postal_code,
                'template': random.choice(templates),
                'two_faces': random.choice([True, False]),
                'accent_color': random.choice(['#3498DB', '#2C3E50', '#E74C3C', '#27AE60', '#F39C12']),
                'has_website': random.choice([True, False]),
                'website_url': f"https://www.{fake.domain_name()}" if random.choice([True, False]) else '',
                'want_landing_page': random.choice([True, False]),
                'landing_description': fake.text(max_nb_chars=200) if random.choice([True, False]) else '',
                'contact_method': random.choice(contact_methods)
            }
        )
        
        if created:
            # Log de création du design
            CampaignLog.objects.create(
                campaign=campaign,
                user=campaign.client,
                action='DESIGN_UPDATED',
                details=f"Design créé: template {design.template}"
            )
        
        return design
    except Exception as e:
        print(f"  ⚠️ Erreur création design: {e}")
        return None

def create_campaign_logs(campaign, user):
    """Crée des logs pour une campagne"""
    try:
        # Log de création
        CampaignLog.objects.get_or_create(
            campaign=campaign,
            action='CREATED',
            defaults={
                'user': user,
                'details': f"Campagne créée: {campaign.name}"
            }
        )
        
        # Logs supplémentaires selon le statut
        if campaign.status in ['IN_PRINTING', 'PRINTED']:
            CampaignLog.objects.get_or_create(
                campaign=campaign,
                action='PRINT_ASSIGNED',
                defaults={
                    'user': user,
                    'details': f"Campagne assignée à l'impression"
                }
            )
        
        if campaign.status == 'PRINTED':
            CampaignLog.objects.get_or_create(
                campaign=campaign,
                action='STATUS_CHANGE',
                defaults={
                    'user': user,
                    'details': "Impression terminée"
                }
            )
        
        if campaign.status == 'DELIVERED':
            CampaignLog.objects.get_or_create(
                campaign=campaign,
                action='STATUS_CHANGE',
                defaults={
                    'user': user,
                    'details': "Livraison effectuée"
                }
            )
    
    except Exception as e:
        print(f"  ⚠️ Erreur création logs: {e}")

def create_print_batches(campaigns, partners):
    """Crée des batches d'impression de test"""
    print(f"\n🖨️ Création de batches d'impression...")
    
    batches = []
    
    # Créer quelques batches avec des campagnes en statut CREATED ou IN_PRINTING
    printable_campaigns = [c for c in campaigns if c.status in ['CREATED', 'IN_PRINTING']]
    
    if len(printable_campaigns) >= 3:
        for i in range(min(3, len(printable_campaigns) // 3)):
            try:
                # Sélectionner 3 à 9 campagnes pour le batch
                num_campaigns = min(random.randint(3, 9), len(printable_campaigns))
                batch_campaigns = random.sample(printable_campaigns, num_campaigns)
                postal_code = fake.postcode()
                
                # Récupérer un admin
                admin_user = User.objects.filter(role='admin').first()
                if not admin_user:
                    admin_user = User.objects.filter(is_superuser=True).first()
                
                batch = PrintBatch.objects.create(
                    postal_code=postal_code,
                    created_by=admin_user,
                    status=random.choice(['PENDING', 'PRINTED'])
                )
                batch.campaigns.set(batch_campaigns)
                
                if batch.status == 'PRINTED':
                    batch.printed_by = admin_user
                    batch.printed_at = timezone.now() - timedelta(days=random.randint(1, 30))
                    batch.save()
                
                batches.append(batch)
                
                # Mettre à jour le statut des campagnes
                for campaign in batch_campaigns:
                    if batch.status == 'PRINTED':
                        campaign.status = 'PRINTED'
                    else:
                        campaign.status = 'IN_PRINTING'
                    campaign.save()
                
                print(f"  ✅ Batch {batch.batch_number} créé avec {len(batch_campaigns)} campagnes")
            
            except Exception as e:
                print(f"  ❌ Erreur création batch: {e}")
    else:
        print(f"  ⚠️ Pas assez de campagnes imprimables pour créer des batches")
    
    return batches

def create_campaign_proofs(campaigns):
    """Crée des preuves de test pour certaines campagnes"""
    print(f"\n📸 Création de preuves...")
    
    proofs_created = 0
    for campaign in campaigns:
        if campaign.status in ['PRINTED', 'IN_DISTRIBUTION', 'DELIVERED'] and random.random() > 0.7:
            try:
                # Récupérer un admin pour uploader
                admin_user = User.objects.filter(role='admin').first()
                if not admin_user:
                    admin_user = User.objects.filter(is_superuser=True).first()
                
                proof, created = CampaignProof.objects.get_or_create(
                    campaign=campaign,
                    defaults={
                        'description': random.choice([
                            "Preuve d'impression",
                            "Photo de la distribution",
                            "Validation qualité",
                            "Preuve de livraison"
                        ]),
                        'uploaded_by': admin_user
                    }
                )
                
                if created:
                    proofs_created += 1
            except Exception as e:
                print(f"  ⚠️ Erreur création preuve: {e}")
    
    print(f"  ✅ {proofs_created} preuves créées")

def assign_partners_to_campaigns(campaigns, partners):
    """Assigne des partenaires à des campagnes"""
    print(f"\n🤝 Assignation de partenaires aux campagnes...")
    
    assigned = 0
    for campaign in campaigns:
        if not campaign.partner and random.random() > 0.5 and partners:
            try:
                campaign.partner = random.choice(partners)
                campaign.save()
                
                # Récupérer un admin
                admin_user = User.objects.filter(role='admin').first()
                if not admin_user:
                    admin_user = User.objects.filter(is_superuser=True).first()
                
                CampaignLog.objects.get_or_create(
                    campaign=campaign,
                    action='PARTNER_ASSIGNED',
                    defaults={
                        'user': admin_user,
                        'details': f"Partenaire {campaign.partner.company_name} assigné"
                    }
                )
                assigned += 1
            except Exception as e:
                print(f"  ⚠️ Erreur assignation partenaire: {e}")
    
    print(f"  ✅ {assigned} campagnes avec partenaire assigné")

def print_summary():
    """Affiche un résumé des données créées"""
    print("\n" + "="*50)
    print("📊 RÉSUMÉ DES DONNÉES CRÉÉES")
    print("="*50)
    
    try:
        print(f"👥 Utilisateurs: {User.objects.count()}")
        print(f"  ├─ Admins: {User.objects.filter(role='admin').count()}")
        print(f"  ├─ Clients: {User.objects.filter(role='client').count()}")
        print(f"  └─ Partenaires: {User.objects.filter(role='partner').count()}")
        
        print(f"🤝 Partenaires (profils): {Partner.objects.count()}")
        
        print(f"🎯 Campagnes: {Campaign.objects.count()}")
        for status in ['CREATED', 'IN_PRINTING', 'PRINTED', 'IN_DISTRIBUTION', 'DELIVERED', 'FINISHED']:
            count = Campaign.objects.filter(status=status).count()
            if count > 0:
                print(f"  ├─ {status}: {count}")
        
        print(f"🎨 Designs: {CampaignDesign.objects.count()}")
        print(f"🖨️ Batches d'impression: {PrintBatch.objects.count()}")
        print(f"📝 Logs: {CampaignLog.objects.count()}")
        print(f"📸 Preuves: {CampaignProof.objects.count()}")
        
        print("\n🔗 Informations de connexion:")
        print("  Admin:      http://localhost:8000/admin/")
        print("  API:        http://localhost:8000/api/")
        print("  Frontend:   http://localhost:3000/")
        
        print("\n🔑 Identifiants de test:")
        print("  Superadmin: admin / admin123")
        print("  Client 1:   client_1 / client123")
        print("  Partenaire: partner_1 / partner123")
        
    except Exception as e:
        print(f"❌ Erreur lors du résumé: {e}")

def cleanup_existing_data():
    """Nettoie les données existantes (optionnel)"""
    print("\n🧹 Nettoyage des données existantes...")
    
    response = input("Voulez-vous supprimer les données existantes ? (o/N): ").strip().lower()
    
    if response == 'o' or response == 'oui':
        try:
            # Supprimer dans l'ordre inverse des dépendances
            CampaignProof.objects.all().delete()
            CampaignLog.objects.all().delete()
            PrintBatch.objects.all().delete()
            CampaignDesign.objects.all().delete()
            Campaign.objects.all().delete()
            Partner.objects.all().delete()
            
            # Supprimer les utilisateurs non-admin
            User.objects.filter(role__in=['client', 'partner']).delete()
            
            print("✅ Données existantes supprimées")
        except Exception as e:
            print(f"❌ Erreur lors du nettoyage: {e}")
    else:
        print("✅ Conservation des données existantes")

def main():
    """Fonction principale"""
    print("="*50)
    print("🚀 CRÉATION DE DONNÉES DE TEST BACKPUB")
    print("="*50)
    
    try:
        # Optionnel: nettoyer les données existantes
        # cleanup_existing_data()
        
        # 1. Créer le superutilisateur
        create_superuser()
        
        # 2. Créer des clients
        clients = create_clients(5)
        
        # 3. Créer des partenaires
        partners = create_partners(3)
        
        # 4. Créer des campagnes
        campaigns = create_campaigns(clients, 3)
        
        # 5. Assigner des partenaires aux campagnes
        assign_partners_to_campaigns(campaigns, partners)
        
        # 6. Créer des batches d'impression
        batches = create_print_batches(campaigns, partners)
        
        # 7. Créer des preuves
        create_campaign_proofs(campaigns)
        
        # 8. Afficher le résumé
        print_summary()
        
        print("\n" + "="*50)
        print("✅ DONNÉES CRÉÉES AVEC SUCCÈS !")
        print("="*50)
        
    except Exception as e:
        print(f"\n❌ ERREUR CRITIQUE: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()