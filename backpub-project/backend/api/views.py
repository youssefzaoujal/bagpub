from django.shortcuts import render
from rest_framework import viewsets, status, generics, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.core.mail import send_mail
from django.conf import settings
import qrcode
from io import BytesIO
from django.core.files import File
import json
import os
import secrets
import traceback
from django.utils import timezone
from django.utils.text import slugify
from datetime import timedelta
from django.contrib.auth.hashers import make_password
from django.core.files.storage import default_storage
from django.http import FileResponse
from django.views.static import serve

from .models import *
from .serializers import *
from .permissions import *

User = get_user_model()

# ============================================
# VUES D'AUTHENTIFICATION
# ============================================

class RegisterClientView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterClientSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            {"message": "Inscription réussie !"},
            status=status.HTTP_201_CREATED
        )

class RegisterPartnerView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterPartnerSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            {"message": "Demande de partenariat envoyée."},
            status=status.HTTP_201_CREATED
        )

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Optimisation : utiliser select_related pour éviter les requêtes N+1
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

# ============================================
# VUES CAMPAGNES
# ============================================

class CampaignViewSet(viewsets.ModelViewSet):
    serializer_class = CampaignSerializer
    permission_classes = [IsAuthenticated, IsClientOrAdmin]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'client':
            return Campaign.objects.filter(client=user).select_related('client', 'partner')
        elif user.role == 'admin':
            return Campaign.objects.all().select_related('client', 'partner')
        else:
            return Campaign.objects.none()
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        """Création avec log"""
        campaign = serializer.save()
        
        CampaignLog.objects.create(
            campaign=campaign,
            user=self.request.user,
            action='CREATED',
            details=f"Campagne créée: {campaign.name}"
        )
    
    def update(self, request, *args, **kwargs):
        """Les clients ne peuvent pas modifier leurs campagnes"""
        if request.user.role == 'client':
            return Response(
                {'error': 'Vous ne pouvez pas modifier une campagne après sa création.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        """Les clients ne peuvent pas modifier leurs campagnes"""
        if request.user.role == 'client':
            return Response(
                {'error': 'Vous ne pouvez pas modifier une campagne après sa création.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().partial_update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Les clients ne peuvent pas supprimer leurs campagnes"""
        if request.user.role == 'client':
            return Response(
                {'error': 'Vous ne pouvez pas supprimer une campagne après sa création.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

import logging
import re
from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache

logger = logging.getLogger('api.security')

class CampaignCreateCompleteView(APIView):
    """Création complète de campagne en une requête - SÉCURISÉE"""
    permission_classes = [IsAuthenticated, IsClient]  # Seuls les clients peuvent créer
    
    @method_decorator(never_cache)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)
    
    def get_client_ip(self, request):
        """Récupérer l'IP du client de manière sécurisée"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def post(self, request):
        # Rate limiting basique
        user_id = request.user.id
        cache_key = f'campaign_create_rate_limit_{user_id}'
        attempts = cache.get(cache_key, 0)
        
        if attempts >= 10:  # Max 10 campagnes par heure
            logger.warning(
                f"Rate limit dépassé pour la création de campagne",
                extra={'user': request.user.username, 'ip': self.get_client_ip(request)}
            )
            return Response({
                'error': 'Trop de tentatives. Veuillez réessayer plus tard.'
            }, status=429)
        
        cache.set(cache_key, attempts + 1, 3600)  # 1 heure
        
        try:
            logger.info(
                f"Tentative de création de campagne",
                extra={'user': request.user.username, 'ip': self.get_client_ip(request)}
            )
            
            # Validation stricte des données
            
            # 1. Données de base avec validation de longueur
            campaign_name = request.data.get('name', '').strip()
            if campaign_name and len(campaign_name) > 255:
                return Response({'error': 'Le nom de la campagne est trop long (max 255 caractères)'}, status=400)
            
            if not campaign_name:
                year = timezone.now().year
                company_name = request.user.company_name or request.user.username
                campaign_name = f"{company_name} - Campagne {year}"
            
            # Sanitization du nom
            campaign_name = re.sub(r'[<>"\']', '', campaign_name)[:255]
            
            # 2. Quantité - Toujours 1000 sacs
            quantity = 1000
            
            # 3. Codes postaux - Validation stricte
            postal_codes = request.data.get('postal_codes', '').strip()
            if not postal_codes:
                return Response({'error': 'Codes postaux requis'}, status=400)
            
            # Validation du format des codes postaux français (5 chiffres)
            postal_code_pattern = re.compile(r'^\d{5}$')
            codes_list = []
            for code in postal_codes.split(','):
                code = code.strip()
                if code:
                    if not postal_code_pattern.match(code):
                        return Response({
                            'error': f'Code postal invalide: {code}. Format attendu: 5 chiffres'
                        }, status=400)
                    if len(code) == 5:  # Code postal français
                        codes_list.append(code)
            
            if len(codes_list) < 5:
                return Response({
                    'error': 'Minimum 5 codes postaux valides requis',
                    'count': len(codes_list)
                }, status=400)
            
            if len(codes_list) > 100:  # Limite maximale
                return Response({
                    'error': 'Maximum 100 codes postaux autorisés'
                }, status=400)
            
            postal_codes = ','.join(codes_list)
            
            # 4. Carte personnalisée - CORRECTION ICI
            use_custom_card_raw = request.data.get('use_custom_card', 'false')
            # Convertir en booléen correctement
            use_custom_card = str(use_custom_card_raw).lower().strip() == 'true'
            custom_card = request.FILES.get('custom_card') if use_custom_card else None
            
            # 4. Validation fichier custom_card si fourni
            use_custom_card_raw = request.data.get('use_custom_card', 'false')
            use_custom_card = str(use_custom_card_raw).lower().strip() == 'true'
            custom_card = None
            
            if use_custom_card:
                custom_card = request.FILES.get('custom_card')
                if not custom_card:
                    return Response({'error': 'Fichier de carte personnalisée requis'}, status=400)
                
                # Validation de la taille (max 10MB)
                if custom_card.size > 10 * 1024 * 1024:
                    return Response({'error': 'Le fichier est trop volumineux (max 10MB)'}, status=400)
                
                # Validation de l'extension
                allowed_extensions = ['.pdf', '.jpg', '.jpeg', '.png', '.ai', '.eps', '.psd']
                file_ext = os.path.splitext(custom_card.name)[1].lower()
                if file_ext not in allowed_extensions:
                    return Response({
                        'error': f'Extension non autorisée: {file_ext}. Extensions autorisées: {", ".join(allowed_extensions)}'
                    }, status=400)
            
            # 5. Calcul du prix - Validation et sécurisation
            base_price_per_1000 = 129.0  # € pour 1000 sacs (prix fixe)
            estimated_price = round((quantity / 1000) * base_price_per_1000, 2)
            
            # Validation du prix calculé
            if estimated_price <= 0 or estimated_price > 100000:  # Limite max 100,000€
                logger.error(
                    f"Prix calculé suspect: {estimated_price} pour quantité {quantity}",
                    extra={'user': request.user.username, 'ip': self.get_client_ip(request)}
                )
                return Response({'error': 'Erreur dans le calcul du prix'}, status=500)
            
            # 6. Faces - Validation stricte
            faces_raw = request.data.get('faces', '1')
            try:
                faces = int(faces_raw)
                if faces not in [1, 2]:
                    faces = 1
            except (ValueError, TypeError):
                faces = 1
            
            # 7. Validation des instructions spéciales
            special_request = request.data.get('special_instructions', '').strip()
            if special_request and len(special_request) > 2000:
                special_request = special_request[:2000]
            
            # Sanitization des instructions
            special_request = re.sub(r'[<>"\']', '', special_request)
            
            # 8. Vérifier que l'utilisateur est actif
            if not request.user.is_active:
                logger.warning(
                    f"Tentative de création par utilisateur inactif",
                    extra={'user': request.user.username, 'ip': self.get_client_ip(request)}
                )
                return Response({'error': 'Votre compte est désactivé'}, status=403)
            
            # 9. Créer la campagne
            campaign_data = {
                'client': request.user,
                'name': campaign_name,
                'postal_codes': postal_codes,
                'quantity': quantity,
                'special_request': special_request,
                'estimated_price': estimated_price,
                'faces': faces,
                'use_custom_card': use_custom_card,
            }
            
            if custom_card:
                campaign_data['custom_card'] = custom_card
            
            # Log sécurisé (sans données sensibles)
            logger.info(
                f"Création campagne: {campaign_name[:50]}",
                extra={
                    'user': request.user.username,
                    'quantity': quantity,
                    'ip': self.get_client_ip(request)
                }
            )
            
            # Création transactionnelle avec gestion d'erreurs
            from django.db import transaction
            try:
                with transaction.atomic():
                    campaign = Campaign.objects.create(**campaign_data)
                    
                    # Log de succès
                    CampaignLog.objects.create(
                        campaign=campaign,
                        user=request.user,
                        action='CREATED',
                        details=f"Campagne créée avec succès"
                    )
                    
                    logger.info(
                        f"Campagne créée avec succès: {campaign.order_number}",
                        extra={'user': request.user.username, 'campaign_id': str(campaign.id)}
                    )
                    
                    # Envoyer email au client après création
                    from .utils.email_service import EmailService
                    try:
                        EmailService.send_campaign_created_email_to_client(campaign)
                        print(f"✅ Email de création de campagne envoyé à {campaign.client.email}")
                    except Exception as e:
                        print(f"⚠️ Erreur envoi email création campagne: {e}")
            except Exception as e:
                logger.error(
                    f"Erreur lors de la création de campagne: {str(e)}",
                    extra={'user': request.user.username, 'ip': self.get_client_ip(request)},
                    exc_info=True
                )
                return Response({
                    'error': 'Erreur lors de la création de la campagne'
                }, status=500)
            
            # 8. Créer un design (pour template ou pour custom_card avec infos de contact)
            design_data = request.data.get('design', {})
            
            # Si design_data est une chaîne JSON, la parser
            if isinstance(design_data, str):
                try:
                    design_data = json.loads(design_data)
                except json.JSONDecodeError:
                    print(f"⚠️ Erreur parsing JSON design: {design_data}")
                    design_data = {}
            
            # Si design_data n'est toujours pas un dict, utiliser un dict vide
            if not isinstance(design_data, dict):
                design_data = {}
            
            # Debug: Afficher les données reçues
            print(f"🎨 Données design: {design_data}")
            
            # Valeurs par défaut pour les champs requis
            company_email = design_data.get('company_email', request.user.email)
            # Pour le téléphone, utiliser celui fourni dans design_data, sinon celui du client
            company_phone = design_data.get('company_phone', '') or request.user.phone or ''
            
            # S'assurer que les champs requis ne sont pas vides
            if not company_email:
                company_email = request.user.email
            if not company_phone:
                company_phone = request.user.phone or ''
            
            # IMPORTANT: Mettre à jour le profil User du client avec le téléphone si fourni
            # Cela permet d'avoir le téléphone disponible même pour les anciennes campagnes
            if company_phone and company_phone.strip() and not request.user.phone:
                request.user.phone = company_phone.strip()
                request.user.save(update_fields=['phone'])
                print(f"✅ Téléphone mis à jour dans le profil client: {company_phone}")
            
            if use_custom_card:
                # Pour custom_card, créer un design minimal avec juste téléphone et email
                # Même si le téléphone est vide, on crée le design pour avoir une structure cohérente
                design_obj = CampaignDesign.objects.create(
                    campaign=campaign,
                    slogan='',  # Pas de slogan pour custom_card
                    company_email=company_email,
                    company_phone=company_phone or '',  # Peut être vide, mais on crée quand même le design
                    company_address='',
                    company_postal_code='',
                    template='custom',  # Marqueur spécial pour custom_card
                    accent_color='#3498DB',
                    contact_method='email'
                )
                design_obj.save()
                print(f"✅ Design minimal créé pour custom_card avec téléphone: {company_phone or '(vide)'}")
            else:
                # Pour template, créer le design complet
                # CORRECTION: Convertir contact_method
                contact_method_raw = design_data.get('contact_method', 'email')
                contact_method = str(contact_method_raw).lower().strip()
                if contact_method not in ['email', 'whatsapp', 'both']:
                    contact_method = 'email'
                
                design_obj = CampaignDesign.objects.create(
                    campaign=campaign,
                    slogan=design_data.get('slogan', ''),
                    company_email=company_email,
                    company_phone=company_phone,
                    company_address=design_data.get('company_address', ''),
                    company_postal_code=design_data.get('company_postal_code', ''),
                    template=design_data.get('template', 'template_1'),
                    accent_color=design_data.get('accent_color', '#3498DB'),
                    contact_method=contact_method
                )
                
                # Logo
                if 'logo' in request.FILES:
                    design_obj.logo = request.FILES['logo']
                
                # QR Code
                try:
                    qr_data = self.generate_qr_data(campaign, design_obj)
                    qr_img = qrcode.make(qr_data)
                    buffer = BytesIO()
                    qr_img.save(buffer, format='PNG')
                    design_obj.qr_code.save(f'qr_{campaign.id}.png', File(buffer), save=False)
                    design_obj.qr_code_url = qr_data
                except Exception as e:
                    print(f"⚠️ Erreur génération QR code: {e}")
                    # Continuer sans QR code si erreur
                    design_obj.qr_code_url = f"mailto:{company_email}"
                
                design_obj.save()
                print(f"✅ Design créé avec template: {design_obj.template}")
            
            # 9. Log
            CampaignLog.objects.create(
                campaign=campaign,
                user=request.user,
                action='CREATED',
                details=f"Campagne créée: {campaign.name} - {quantity} cartes"
            )
            
            # 10. Réponse
            response_data = {
                'success': True,
                'campaign_id': str(campaign.id),
                'order_number': campaign.order_number,
                'name': campaign.name,
                'campaign_name': campaign.name,
                'quantity': quantity,
                'estimated_price': float(estimated_price),
                'postal_codes': campaign.postal_codes,
                'has_custom_card': campaign.has_custom_card,
                'has_design': hasattr(campaign, 'design'),
                'message': 'Campagne créée avec succès !'
            }
            
            if hasattr(campaign, 'design'):
                design = campaign.design
                qr_code_url = None
                qr_code_image_url = None
                if design.qr_code:
                    qr_code_url = design.qr_code_url
                    qr_code_image_url = request.build_absolute_uri(design.qr_code.url)
                
                response_data['design'] = {
                    'template': design.template,
                    'qr_code_url': qr_code_url,
                    'qr_code': design.qr_code.url if design.qr_code else None,
                    'qr_code_image_url': qr_code_image_url,
                    'contact_method': design.contact_method if hasattr(design, 'contact_method') else None
                }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"❌ Erreur création campagne: {str(e)}")
            traceback.print_exc()
            return Response({
                'error': 'Erreur interne du serveur',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def generate_qr_data(self, campaign, design):
        """Génère les données pour le QR Code"""
        try:
            if design.contact_method in ['whatsapp', 'both'] and design.company_phone:
                phone = design.company_phone.replace(' ', '').replace('+', '').replace('-', '')
                if phone.startswith('0'):
                    phone = '33' + phone[1:]
                message = f"Bonjour {campaign.client.company_name}, je vous contacte via votre carte BagPub"
                from urllib.parse import quote
                encoded_message = quote(message)
                return f"https://wa.me/{phone}?text={encoded_message}"
            else:
                return f"mailto:{design.company_email}"
        except Exception as e:
            print(f"⚠️ Erreur génération QR code data: {e}")
            return f"mailto:{design.company_email}"
class CampaignDesignView(APIView):
    """Gestion du design de campagne"""
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    
    def post(self, request, pk):
        try:
            campaign = Campaign.objects.get(pk=pk)
            self.check_object_permissions(request, campaign)
            
            # Vérifier que la campagne n'a pas de carte personnalisée
            if campaign.use_custom_card:
                return Response({'error': 'Cette campagne utilise une carte personnalisée'}, status=400)
            
            # Créer ou mettre à jour le design
            design_data = {
                'slogan': request.data.get('slogan', ''),
                'company_email': request.data.get('company_email', request.user.email),
                'company_phone': request.data.get('company_phone', request.user.phone or ''),
                'company_address': request.data.get('company_address', ''),
                'company_postal_code': request.data.get('company_postal_code', ''),
                'template': request.data.get('template', 'template_1'),
                'accent_color': request.data.get('accent_color', '#3498DB'),
                'contact_method': request.data.get('contact_method', 'email')
            }
            
            design, created = CampaignDesign.objects.update_or_create(
                campaign=campaign,
                defaults=design_data
            )
            
            # Logo
            if 'logo' in request.FILES:
                design.logo = request.FILES['logo']
            
            # QR Code
            qr_data = self.generate_qr_data(campaign, design)
            qr_img = qrcode.make(qr_data)
            buffer = BytesIO()
            qr_img.save(buffer, format='PNG')
            design.qr_code.save(f'qr_{campaign.id}.png', File(buffer), save=False)
            design.qr_code_url = qr_data
            
            design.save()
            
            serializer = CampaignDesignSerializer(design)
            
            return Response({
                'success': True,
                'message': 'Design mis à jour avec succès',
                'data': serializer.data,
                'qr_code_url': request.build_absolute_uri(design.qr_code.url) if design.qr_code else None
            }, status=201 if created else 200)
            
        except Campaign.DoesNotExist:
            return Response({'error': 'Campagne non trouvée'}, status=404)
        except Exception as e:
            print(f"❌ Erreur design: {str(e)}")
            return Response({'error': str(e)}, status=500)
    
    def generate_qr_data(self, campaign, design):
        """Génère les données pour le QR Code"""
        if design.contact_method in ['whatsapp', 'both'] and design.company_phone:
            phone = design.company_phone.replace(' ', '').replace('+', '').replace('-', '')
            if phone.startswith('0'):
                phone = '33' + phone[1:]
            message = f"Bonjour {campaign.client.company_name}, je vous contacte via votre carte BagPub"
            from urllib.parse import quote
            encoded_message = quote(message)
            return f"https://wa.me/{phone}?text={encoded_message}"
        else:
            return f"mailto:{design.company_email}"

# ============================================
# VUES BATCH ET IMPRESSION
# ============================================

class PrintBatchViewSet(viewsets.ModelViewSet):
    """Gestion des batchs d'impression"""
    serializer_class = PrintBatchSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        return PrintBatch.objects.all().select_related('partner').prefetch_related('campaigns')
    
    @action(detail=True, methods=['get'], url_path='details')
    def batch_details(self, request, pk=None):
        """Retourne les détails complets d'un batch"""
        batch = self.get_object()
        details = batch.get_batch_details()
        return Response(details)
    
    @action(detail=True, methods=['post'], url_path='assign-partner')
    def assign_partner(self, request, pk=None):
        """Assigner un partenaire à un batch"""
        batch = self.get_object()
        partner_id = request.data.get('partner_id')
        
        if not partner_id:
            return Response({'error': 'ID partenaire requis'}, status=400)
        
        try:
            partner = Partner.objects.get(id=partner_id)
            batch.partner = partner
            batch.status = 'ASSIGNED'
            batch.save()
            
            # Mettre à jour le statut des campagnes
            batch.campaigns.update(partner=partner, status='ASSIGNED')
            
            # Log
            for campaign in batch.campaigns.all():
                CampaignLog.objects.create(
                    campaign=campaign,
                    user=request.user,
                    action='PARTNER_ASSIGNED',
                    details=f"Campagne assignée au partenaire {partner.company_name} via batch {batch.batch_number}"
                )
            
            CampaignLog.objects.create(
                batch=batch,
                user=request.user,
                action='PARTNER_ASSIGNED',
                details=f"Batch assigné au partenaire {partner.company_name}"
            )
            
            return Response({
                'message': 'Partenaire assigné avec succès',
                'batch_number': batch.batch_number,
                'partner': partner.company_name,
                'campaigns_count': batch.campaigns.count()
            })
        except Partner.DoesNotExist:
            return Response({'error': 'Partenaire non trouvé'}, status=404)
    
    @action(detail=True, methods=['post'], url_path='send-to-print')
    def send_to_print(self, request, pk=None):
        """Envoyer un batch à l'impression"""
        batch = self.get_object()
        
        if batch.status != 'ASSIGNED':
            return Response({'error': 'Le batch doit être assigné à un partenaire avant impression'}, status=400)
        
        # Créer l'ordre d'impression
        print_order, created = PrintOrder.objects.get_or_create(
            batch=batch,
            defaults={'status': 'PENDING'}
        )
        
        # Mettre à jour le statut du batch
        batch.status = 'IN_PRINTING'
        batch.save()
        
        # Mettre à jour le statut des campagnes
        batch.campaigns.update(status='IN_PRINTING', printing_status='SENT_TO_PRINT')
        
        # Log
        CampaignLog.objects.create(
            batch=batch,
            user=request.user,
            action='SENT_TO_PRINT',
            details=f"Batch envoyé à l'impression"
        )
        
        for campaign in batch.campaigns.all():
            CampaignLog.objects.create(
                campaign=campaign,
                user=request.user,
                action='SENT_TO_PRINT',
                details=f"Campagne envoyée à l'impression via batch {batch.batch_number}"
            )
        
        return Response({
            'message': 'Batch envoyé à l\'impression',
            'print_order_id': str(print_order.id),
            'print_order_number': print_order.order_number,
            'campaigns_count': batch.campaigns.count(),
            'total_quantity': batch.total_quantity
        })

class PrintOrderViewSet(viewsets.ModelViewSet):
    """Gestion des ordres d'impression"""
    serializer_class = PrintOrderSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        # Seuls les admins peuvent voir les ordres d'impression
        return PrintOrder.objects.all().select_related('batch', 'batch__partner')
    
    @action(detail=True, methods=['get'], url_path='printing-details')
    def printing_details(self, request, pk=None):
        """Retourne les détails complets pour l'impression"""
        print_order = self.get_object()
        details = print_order.get_printing_details()
        return Response(details)
    
    
    @action(detail=True, methods=['post'], url_path='mark-completed')
    def mark_completed(self, request, pk=None):
        """Marquer un ordre comme terminé"""
        print_order = self.get_object()
        
        print_order.status = 'COMPLETED'
        print_order.completed_at = timezone.now()
        
        # Mettre à jour le batch
        batch = print_order.batch
        batch.status = 'PRINTED'
        batch.printed_at = timezone.now()
        batch.save()
        
        # Mettre à jour les campagnes
        batch.campaigns.update(status='PRINTED', printing_status='COMPLETED')
        
        print_order.save()
        
        # Log
        CampaignLog.objects.create(
            batch=batch,
            user=request.user,
            action='STATUS_CHANGE',
            details='Impression terminée'
        )
        
        return Response({
            'message': 'Ordre marqué comme terminé',
            'batch_status': batch.status,
            'campaigns_updated': batch.campaigns.count()
        })
    
    @action(detail=True, methods=['get'], url_path='download-files')
    def download_files(self, request, pk=None):
        """Télécharger les fichiers d'impression"""
        print_order = self.get_object()
        batch = print_order.batch
        
        # Récupérer les cartes personnalisées
        custom_cards = []
        for campaign in batch.campaigns.filter(use_custom_card=True):
            if campaign.custom_card:
                custom_cards.append({
                    'campaign_id': str(campaign.id),
                    'order_number': campaign.order_number,
                    'client': campaign.client.company_name,
                    'filename': campaign.custom_card.name.split('/')[-1],
                    'url': request.build_absolute_uri(campaign.custom_card.url)
                })
        
        # Informations sur les designs template
        template_designs = []
        for campaign in batch.campaigns.filter(use_custom_card=False):
            if hasattr(campaign, 'design'):
                design = campaign.design
                template_designs.append({
                    'campaign_id': str(campaign.id),
                    'order_number': campaign.order_number,
                    'client': campaign.client.company_name,
                    'template': design.template,
                    'slogan': design.slogan,
                    'contact_email': design.company_email,
                    'contact_phone': design.company_phone
                })
        
        return Response({
            'batch_info': {
                'batch_number': batch.batch_number,
                'postal_code': batch.postal_code,
                'partner': batch.partner.company_name if batch.partner else None,
                'total_campaigns': batch.campaigns.count(),
                'total_quantity': batch.total_quantity
            },
            'custom_cards': custom_cards,
            'template_designs': template_designs,
            'summary': {
                'has_custom_cards': len(custom_cards) > 0,
                'has_template_designs': len(template_designs) > 0
            }
        })

# ============================================
# VUES ADMIN - GESTION DES BATCHS
# ============================================

class AdminCampaignsView(APIView):
    """Vue admin pour gérer les campagnes"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get(self, request):
        # Toutes les campagnes pour la sélection - Optimisé avec only()
        all_campaigns = Campaign.objects.all().select_related('client', 'design').only(
            'id', 'name', 'order_number', 'status', 'postal_codes', 'quantity', 
            'estimated_price', 'created_at', 'client_id'
        ).order_by('-created_at')
        
        # Campagnes non assignées - Optimisé
        unassigned_campaigns = Campaign.objects.filter(
            status='CREATED'
        ).select_related('client').only(
            'id', 'name', 'order_number', 'postal_codes', 'quantity', 
            'estimated_price', 'client_id', 'client__company_name'
        )
        
        # Analyser les codes postaux pour créer des batchs
        postal_code_groups = {}
        for campaign in unassigned_campaigns:
            codes = [code.strip() for code in campaign.postal_codes.split(',')]
            for code in codes:
                if code not in postal_code_groups:
                    postal_code_groups[code] = []
                postal_code_groups[code].append(campaign)
        
        # Créer des suggestions de batchs (groupes de 1-12 campagnes)
        batch_suggestions = []
        for postal_code, campaigns in postal_code_groups.items():
            if len(campaigns) >= 1:  # Minimum 1 campagne par batch
                # Essayer de créer des groupes de 1-12 campagnes
                groups = []
                current_group = []
                
                for campaign in campaigns:
                    if len(current_group) < 12:
                        current_group.append(campaign)
                    else:
                        groups.append(current_group)
                        current_group = [campaign]
                
                if current_group:
                    groups.append(current_group)
                
                for group in groups:
                    total_quantity = sum(c.quantity for c in group)
                    clients = set(c.client.company_name for c in group)
                    
                    batch_suggestions.append({
                        'postal_code': postal_code,
                        'campaigns_count': len(group),
                        'total_quantity': total_quantity,
                        'clients': list(clients),
                        'campaign_ids': [str(c.id) for c in group],
                        'estimated_price': sum(float(c.estimated_price or 0) for c in group)
                    })
        
        # Batchs existants
        existing_batches = PrintBatch.objects.all().select_related('partner')
        
        # Statistiques
        stats = {
            'total_campaigns': Campaign.objects.count(),
            'unassigned_campaigns': unassigned_campaigns.count(),
            'assigned_campaigns': Campaign.objects.filter(status='ASSIGNED').count(),
            'in_printing': Campaign.objects.filter(status='IN_PRINTING').count(),
            'printed_campaigns': Campaign.objects.filter(status='PRINTED').count(),
        }
        
        # Sérialiser les campagnes avec le contexte de la requête
        campaigns_serializer = CampaignSerializer(all_campaigns, many=True, context={'request': request})
        unassigned_serializer = CampaignSerializer(unassigned_campaigns, many=True, context={'request': request})
        
        return Response({
            'stats': stats,
            'campaigns': campaigns_serializer.data,
            'unassigned_campaigns': unassigned_serializer.data,
        })

class SendCampaignsToPrintView(APIView):
    """Envoyer les campagnes sélectionnées par email à l'imprimerie"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def post(self, request):
        try:
            campaign_ids = request.data.get('campaign_ids', [])
            print(f"📋 IDs de campagnes reçus: {campaign_ids} (type: {type(campaign_ids)})")
            
            if not campaign_ids:
                return Response({'error': 'Aucune campagne sélectionnée'}, status=400)
            
            # Importer uuid pour la validation
            import uuid as uuid_module
            
            # S'assurer que campaign_ids est une liste
            if not isinstance(campaign_ids, list):
                campaign_ids = [campaign_ids] if campaign_ids else []
            
            # Convertir tous les IDs en UUID (les IDs sont des UUIDs dans ce modèle)
            valid_uuid_ids = []
            for cid in campaign_ids:
                if cid is None:
                    continue
                    
                # Essayer de convertir en UUID
                try:
                    # Si c'est déjà une string UUID, la convertir
                    if isinstance(cid, str):
                        # Si c'est un UUID complet
                        uuid_obj = uuid_module.UUID(cid)
                        valid_uuid_ids.append(uuid_obj)
                    elif isinstance(cid, uuid_module.UUID):
                        # Si c'est déjà un UUID
                        valid_uuid_ids.append(cid)
                    elif isinstance(cid, int):
                        # Si c'est un entier, essayer de le convertir (peut-être un ID partiel)
                        print(f"⚠️ ID entier reçu: {cid}, tentative de recherche par UUID...")
                        # Essayer de trouver l'UUID complet qui commence par cette partie
                        # Mais ce n'est pas possible avec UUID, donc on skip
                        continue
                    else:
                        print(f"⚠️ Format d'ID non reconnu: {type(cid)} - {cid}")
                except (ValueError, AttributeError) as e:
                    print(f"⚠️ ID invalide ignoré: {cid} (erreur: {e})")
                    continue
            
            campaign_ids = valid_uuid_ids
            
            if not campaign_ids:
                return Response({'error': 'Aucune campagne sélectionnée (IDs invalides)'}, status=400)
            
            print(f"📋 IDs de campagnes validés (UUIDs): {campaign_ids}")
            print(f"📋 Types des IDs: {[type(cid).__name__ for cid in campaign_ids]}")
            
            # Vérifier qu'il existe des campagnes avec ces IDs
            existing_campaigns_count = Campaign.objects.filter(id__in=campaign_ids).count()
            print(f"🔍 Vérification: {existing_campaigns_count} campagnes existent avec ces IDs")
            
            if existing_campaigns_count == 0:
                # Afficher quelques IDs existants pour déboguer
                sample_campaigns = Campaign.objects.all()[:5].values_list('id', flat=True)
                sample_ids_str = [str(cid) for cid in sample_campaigns]
                print(f"📋 Exemples d'IDs de campagnes existantes: {sample_ids_str}")
                print(f"📋 IDs recherchés (format string): {[str(cid) for cid in campaign_ids]}")
                return Response({
                    'error': 'Aucune campagne trouvée avec ces IDs',
                    'details': f'Aucune campagne n\'existe avec les IDs: {[str(cid) for cid in campaign_ids]}',
                    'requested_ids': [str(cid) for cid in campaign_ids],
                    'sample_existing_ids': sample_ids_str
                }, status=400)
            
            # Récupérer les campagnes avec toutes les relations nécessaires
            campaigns = Campaign.objects.filter(
                id__in=campaign_ids
            ).select_related('client', 'design').prefetch_related('design')
            
            print(f"📊 Nombre de campagnes trouvées: {campaigns.count()}")
            print(f"📋 IDs des campagnes trouvées: {[c.id for c in campaigns]}")
            
            if campaigns.count() != len(campaign_ids):
                found_ids = {c.id for c in campaigns}
                missing_ids = set(campaign_ids) - found_ids
                print(f"⚠️ IDs recherchés: {campaign_ids}")
                print(f"⚠️ IDs trouvés: {found_ids}")
                print(f"⚠️ IDs manquants: {missing_ids}")
                return Response({
                    'error': 'Certaines campagnes n\'ont pas été trouvées',
                    'details': f'Recherché {len(campaign_ids)} campagnes, trouvé {campaigns.count()}',
                    'missing_ids': list(missing_ids),
                    'requested_ids': campaign_ids
                }, status=400)
            
            # Email de l'imprimerie
            printshop_email = 'zaoujalyoussef1@gmail.com'
            
            # Préparer le contenu de l'email
            email_subject = f'Commande d\'impression - {campaigns.count()} campagne(s)'
            
            email_body = f"""
Bonjour,

Vous avez reçu une nouvelle commande d'impression avec {campaigns.count()} campagne(s).

==========================================
DÉTAILS DE LA COMMANDE
==========================================

"""
            
            total_quantity = 0
            total_price = 0
            
            for campaign in campaigns:
                try:
                    # Construire l'URL de base
                    request_scheme = request.scheme if hasattr(request, 'scheme') else 'http'
                    request_host = request.get_host() if hasattr(request, 'get_host') else 'localhost:8000'
                    
                    design_info = ""
                    custom_card_info = ""
                    
                    if campaign.use_custom_card and campaign.custom_card:
                        # Mode carte personnalisée
                        try:
                            custom_card_path = campaign.custom_card.url if hasattr(campaign.custom_card, 'url') else campaign.custom_card.name
                            custom_card_url = f"{request_scheme}://{request_host}{custom_card_path}"
                            file_name = campaign.custom_card.name.split('/')[-1] if campaign.custom_card.name else 'carte_personnalisee'
                            custom_card_info = f"""
    📎 CARTE PERSONNALISÉE (FICHIER FOURNI PAR LE CLIENT):
       • Type: Carte personnalisée
       • Nom du fichier: {file_name}
       • URL de téléchargement: {custom_card_url}
       • ⚠️ IMPORTANT: Utilisez ce fichier tel quel, sans modification
       • Le client a fourni son propre design prêt à imprimer
       • Format attendu: Selon l'extension du fichier (.pdf, .ai, .eps, .psd, etc.)
"""
                        except Exception as e:
                            print(f"⚠️ Erreur accès custom_card pour campagne {campaign.order_number}: {e}")
                            custom_card_info = """
    📎 CARTE PERSONNALISÉE (FICHIER FOURNI PAR LE CLIENT):
       • ⚠️ ATTENTION: Le fichier existe mais l'URL n'a pas pu être générée
       • Veuillez contacter l'administrateur pour obtenir le fichier
"""
                    elif hasattr(campaign, 'design'):
                        try:
                            # Mode template avec design
                            design = campaign.design
                            
                            # URLs des fichiers avec gestion d'erreur
                            logo_url = ""
                            qr_code_url = ""
                            try:
                                if design.logo and hasattr(design.logo, 'url'):
                                    logo_url = f"{request_scheme}://{request_host}{design.logo.url}"
                            except Exception as e:
                                print(f"⚠️ Erreur accès logo pour campagne {campaign.order_number}: {e}")
                            
                            try:
                                if design.qr_code and hasattr(design.qr_code, 'url'):
                                    qr_code_url = f"{request_scheme}://{request_host}{design.qr_code.url}"
                            except Exception as e:
                                print(f"⚠️ Erreur accès qr_code pour campagne {campaign.order_number}: {e}")
                            
                            # Informations sur le template
                            template_num = design.template.replace('template_', '')
                            
                            # Détails complets du design
                            contact_method_label = dict(design.CONTACT_METHOD_CHOICES).get(design.contact_method, design.contact_method)
                            
                            design_info = f"""
    🎨 DÉTAILS COMPLETS DU DESIGN:
    
    📐 TEMPLATE & MISE EN PAGE:
       • Template sélectionné: Template {template_num}
       • Référence technique: {design.template}
       • Nombre de faces: {campaign.faces} {'face' if campaign.faces == 1 else 'faces'}
    
    🎨 COULEURS:
       • Couleur d'accent principale: {design.accent_color}
       • Code couleur hexadécimal: {design.accent_color}
    
    📝 INFORMATIONS À AFFICHER SUR LA CARTE:
       • Slogan/Message: {design.slogan or '(Aucun slogan)'}
       • Email de contact: {design.company_email}
       • Téléphone de contact: {design.company_phone}
       • Adresse complète: {design.company_address or '(Non spécifiée)'}
       • Code postal: {design.company_postal_code or '(Non spécifié)'}
    
    🖼️ LOGO:
       • Logo fourni: {'✅ OUI' if design.logo else '❌ NON'}
       {f'• URL de téléchargement du logo: {logo_url}' if logo_url else '• Aucun logo à télécharger'}
    
    📱 QR CODE:
       • QR Code activé: {'✅ OUI' if design.qr_code_url else '❌ NON'}
       • Méthode de contact QR: {contact_method_label}
       {f'• URL du QR Code: {design.qr_code_url}' if design.qr_code_url else ''}
       {f'• Image QR Code à télécharger: {qr_code_url}' if qr_code_url else ''}
       • Fonction: {'Ouvre WhatsApp' if 'wa.me' in (design.qr_code_url or '') else 'Envoie email' if 'mailto:' in (design.qr_code_url or '') else 'Redirection'}
    
    ⚙️ NOTES IMPORTANTES:
       • Utilisez le template {template_num} pour cette commande
       • Appliquez la couleur {design.accent_color} comme couleur principale
       {'• Le logo doit être intégré si fourni' if design.logo else ''}
       • Le QR Code doit être fonctionnel et pointer vers: {design.qr_code_url or 'N/A'}
"""
                        except Exception as design_error:
                            print(f"❌ Erreur construction design_info pour campagne {campaign.order_number}: {design_error}")
                            traceback.print_exc()
                            design_info = f"""
    🎨 DÉTAILS DU DESIGN (Informations partielles):
       • Template: {getattr(design, 'template', 'N/A') if 'design' in locals() else 'N/A'}
       • Couleur: {getattr(design, 'accent_color', 'N/A') if 'design' in locals() else 'N/A'}
       • ⚠️ Erreur lors de la récupération des détails complets
"""
                    else:
                        design_info = """
    ⚠️ ATTENTION: Aucun design n'a été configuré pour cette campagne.
    Veuillez contacter le client pour plus d'informations.
"""
                    
                    email_body += f"""
═══════════════════════════════════════════════════════════════
📦 CAMPAGNE #{campaign.order_number}
═══════════════════════════════════════════════════════════════

📋 INFORMATIONS GÉNÉRALES:
   - Nom de la campagne: {campaign.name}
   - Date de création: {campaign.created_at.strftime('%d/%m/%Y à %H:%M')}
   
👤 INFORMATIONS CLIENT:
   - Nom de l'entreprise: {campaign.client.company_name}
   - Email: {campaign.client.email}
   - Téléphone: {campaign.client.phone or 'Non renseigné'}
   
📊 SPÉCIFICATIONS DE COMMANDE:
   - Quantité: {campaign.quantity:,} cartes
   - Zones de distribution: {campaign.postal_codes}
   - Nombre de faces: {campaign.faces} {'face' if campaign.faces == 1 else 'faces'}
   - Prix estimé: {campaign.estimated_price or 0:.2f} €
   
📝 NOTES & DEMANDES SPÉCIALES:
   {campaign.special_request or 'Aucune demande particulière'}
{design_info}{custom_card_info}
───────────────────────────────────────────────────────────────

"""
                    total_quantity += campaign.quantity
                    total_price += float(campaign.estimated_price or 0)
                    
                    # Mettre à jour le statut de la campagne
                    campaign.status = 'IN_PRINTING'
                    campaign.printing_status = 'SENT_TO_PRINT'
                    campaign.save()
                    
                    # Log
                    CampaignLog.objects.create(
                        campaign=campaign,
                        user=request.user,
                        action='SENT_TO_PRINT',
                        details=f"Campagne envoyée à l'imprimerie par email"
                    )
                    
                except Exception as campaign_error:
                    print(f"❌ Erreur traitement campagne {campaign.order_number if hasattr(campaign, 'order_number') else 'N/A'}: {campaign_error}")
                    traceback.print_exc()
                    # Continuer avec les autres campagnes même en cas d'erreur sur une
                    continue
            
            # Détails additionnels
            campaigns_with_design = sum(1 for c in campaigns if hasattr(c, 'design') and not c.use_custom_card)
            campaigns_custom = sum(1 for c in campaigns if c.use_custom_card)
            
            email_body += f"""
═══════════════════════════════════════════════════════════════
📊 RÉSUMÉ DE LA COMMANDE
═══════════════════════════════════════════════════════════════

📈 STATISTIQUES GLOBALES:
   • Nombre total de campagnes: {campaigns.count()}
   • Campagnes avec template: {campaigns_with_design}
   • Campagnes avec carte personnalisée: {campaigns_custom}
   • Quantité totale de cartes: {total_quantity:,} cartes
   • Prix total estimé: {total_price:.2f} €

📋 NUMÉROS DE COMMANDE:
   {', '.join([f"• {c.order_number}" for c in campaigns])}

📧 INFORMATIONS IMPORTANTES:
   • Tous les fichiers (logos, QR codes, cartes personnalisées) sont disponibles
     via les liens fournis dans chaque section de campagne.
   • Pour toute question concernant une campagne spécifique, référez-vous
     au numéro de commande (ex: {campaigns[0].order_number if campaigns else 'N/A'}).

⚠️ INSTRUCTIONS:
   1. Vérifiez que tous les fichiers sont accessibles via les URLs fournies
   2. Utilisez le template spécifié pour chaque campagne avec template
   3. Respectez les couleurs d'accent indiquées
   4. Assurez-vous que les QR codes sont fonctionnels
   5. Pour les cartes personnalisées, utilisez exactement le fichier fourni

───────────────────────────────────────────────────────────────

Cordialement,
Équipe BagPub

📧 Contact: {getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@bagpub.com')}
🌐 Site web: https://bagpub.com

"""
            
            # Envoyer l'email
            try:
                print(f"📧 Envoi email à {printshop_email}")
                print(f"📄 Sujet: {email_subject}")
                print(f"📝 Longueur du message: {len(email_body)} caractères")
                
                send_mail(
                    subject=email_subject,
                    message=email_body,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[printshop_email],
                    fail_silently=False,
                )
                
                print(f"✅ Email envoyé avec succès à {printshop_email}")
                
                return Response({
                    'success': True,
                    'message': f'{campaigns.count()} campagne(s) envoyée(s) par email à l\'imprimerie avec tous les détails',
                    'campaigns_count': campaigns.count(),
                    'total_quantity': total_quantity,
                    'email_sent_to': printshop_email,
                    'email_length': len(email_body)
                }, status=200)
                
            except Exception as e:
                error_details = str(e)
                print(f"❌ Erreur envoi email: {error_details}")
                traceback.print_exc()
                
                # Rétablir les statuts des campagnes en cas d'erreur
                campaigns.update(status='CREATED', printing_status='NOT_SENT')
                
                return Response({
                    'error': 'Erreur lors de l\'envoi de l\'email',
                    'details': error_details,
                    'help': 'Vérifiez la configuration email dans settings.py'
                }, status=500)
            
        except Exception as e:
            error_details = str(e)
            print(f"❌ Erreur générale envoi campagnes: {error_details}")
            traceback.print_exc()
            return Response({
                'error': 'Erreur lors du traitement des campagnes',
                'details': error_details
            }, status=500)

class SendToPrintBulkView(APIView):
    """Envoyer plusieurs batchs à l'impression en une fois"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def post(self, request):
        batch_ids = request.data.get('batch_ids', [])
        
        if not batch_ids:
            return Response({'error': 'Aucun batch sélectionné'}, status=400)
        
        batches = PrintBatch.objects.filter(
            id__in=batch_ids,
            status='ASSIGNED',
            partner__isnull=False
        )
        
        if batches.count() != len(batch_ids):
            return Response({'error': 'Certains batchs ne peuvent pas être envoyés'}, status=400)
        
        created_orders = []
        for batch in batches:
            # Créer l'ordre d'impression
            print_order = PrintOrder.objects.create(
                batch=batch,
                status='PENDING'
            )
            
            # Mettre à jour le statut
            batch.status = 'IN_PRINTING'
            batch.save()
            
            # Mettre à jour les campagnes
            batch.campaigns.update(status='IN_PRINTING', printing_status='SENT_TO_PRINT')
            
            # Log
            CampaignLog.objects.create(
                batch=batch,
                user=request.user,
                action='SENT_TO_PRINT',
                details=f"Batch envoyé à l'impression en lot"
            )
            
            created_orders.append({
                'batch_id': str(batch.id),
                'batch_number': batch.batch_number,
                'print_order_id': str(print_order.id),
                'print_order_number': print_order.order_number,
                'campaigns_count': batch.campaigns.count(),
                'total_quantity': batch.total_quantity
            })
        
        return Response({
            'message': f'{len(created_orders)} batchs envoyés à l\'impression',
            'orders': created_orders
        })

class AssignPartnerAndSendToPrintView(APIView):
    """Assigner des campagnes à un partenaire et les envoyer directement à l'impression en lot combiné de 1000 sacs"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def post(self, request):
        try:
            campaign_ids = request.data.get('campaign_ids', [])
            partner_id = request.data.get('partner_id')
            
            if not campaign_ids:
                return Response({'error': 'Aucune campagne sélectionnée'}, status=400)
            
            if not partner_id:
                return Response({'error': 'Partenaire requis'}, status=400)
            
            # Convertir les IDs en UUID
            import uuid as uuid_module
            valid_uuid_ids = []
            for cid in campaign_ids:
                try:
                    if isinstance(cid, str):
                        valid_uuid_ids.append(uuid_module.UUID(cid))
                    elif isinstance(cid, uuid_module.UUID):
                        valid_uuid_ids.append(cid)
                except (ValueError, AttributeError):
                    continue
            
            if not valid_uuid_ids:
                return Response({'error': 'Aucune campagne valide sélectionnée'}, status=400)
            
            # Récupérer le partenaire
            try:
                partner = Partner.objects.get(id=partner_id)
            except Partner.DoesNotExist:
                return Response({'error': 'Partenaire non trouvé'}, status=404)
            
            # Récupérer les campagnes
            campaigns = Campaign.objects.filter(id__in=valid_uuid_ids).select_related('client', 'design')
            
            if campaigns.count() != len(valid_uuid_ids):
                return Response({'error': 'Certaines campagnes n\'ont pas été trouvées'}, status=400)
            
            # Créer un PrintBatch combiné pour toutes les campagnes
            # Toutes les campagnes sont combinées en un seul lot de 1000 sacs
            from .models import PrintBatch
            from .utils.email_service import EmailService
            
            # Déterminer le code postal principal (premier code postal de la première campagne)
            first_campaign = campaigns.first()
            postal_codes_list = first_campaign.postal_codes.split(',') if first_campaign.postal_codes else []
            main_postal_code = postal_codes_list[0].strip() if postal_codes_list else '00000'
            
            # Créer le batch combiné
            print_batch = PrintBatch.objects.create(
                postal_code=main_postal_code,
                partner=partner,
                status='IN_PRINTING'
            )
            
            # Ajouter toutes les campagnes au batch
            print_batch.campaigns.set(campaigns)
            
            # Assigner le partenaire et mettre à jour le statut de toutes les campagnes
            updated_campaigns = []
            for campaign in campaigns:
                # Assigner le partenaire
                campaign.partner = partner
                campaign.status = 'IN_PRINTING'  # Directement en impression
                campaign.printing_status = 'SENT_TO_PRINT'
                campaign.save()
                
                # Recharger la campagne pour s'assurer que le partenaire est bien lié
                campaign.refresh_from_db()
                
                # Log
                CampaignLog.objects.create(
                    campaign=campaign,
                    user=request.user,
                    action='PARTNER_ASSIGNED',
                    details=f"Campagne assignée au partenaire {partner.company_name} et envoyée à l'impression (lot combiné)"
                )
                
                CampaignLog.objects.create(
                    campaign=campaign,
                    user=request.user,
                    action='SENT_TO_PRINT',
                    details=f"Campagne envoyée à l'impression dans un lot combiné de 1000 sacs"
                )
                
                # Envoyer email au client
                try:
                    print(f"📧 Envoi email au client pour campagne {campaign.order_number}...")
                    EmailService.send_partner_assigned_email(campaign)
                    print(f"✅ Email envoyé avec succès au client {campaign.client.email} pour campagne {campaign.order_number}")
                except Exception as e:
                    import traceback
                    print(f"❌ Erreur envoi email pour campagne {campaign.order_number}: {e}")
                    print(f"❌ Traceback: {traceback.format_exc()}")
                
                updated_campaigns.append({
                    'id': str(campaign.id),
                    'order_number': campaign.order_number,
                    'name': campaign.name
                })
            
            # Envoyer l'email à l'imprimerie avec les détails du lot combiné
            try:
                self._send_combined_print_email(request, print_batch, campaigns, partner)
            except Exception as e:
                print(f"⚠️ Erreur envoi email imprimerie: {e}")
            
            return Response({
                'message': f'{len(updated_campaigns)} campagne(s) assignée(s) au partenaire {partner.company_name} et envoyée(s) à l\'impression en lot combiné (1000 sacs)',
                'batch': {
                    'id': str(print_batch.id),
                    'batch_number': print_batch.batch_number,
                    'quantity': 1000,  # Toujours 1000 sacs pour un lot combiné
                    'campaigns_count': len(updated_campaigns)
                },
                'partner': {
                    'id': str(partner.id),
                    'company_name': partner.company_name,
                    'email': partner.email,
                    'phone': partner.phone
                },
                'campaigns': updated_campaigns
            })
            
        except Exception as e:
            print(f"❌ Erreur assignation partenaire et envoi impression: {e}")
            import traceback
            traceback.print_exc()
            return Response({
                'error': 'Erreur lors de l\'assignation et de l\'envoi à l\'impression',
                'details': str(e)
            }, status=500)
    
    def _send_combined_print_email(self, request, print_batch, campaigns, partner):
        """Envoyer un email HTML à l'imprimerie pour un lot combiné de 1000 sacs avec toutes les infos et images"""
        from django.core.mail import EmailMultiAlternatives
        from django.template.loader import render_to_string
        from django.conf import settings
        from django.utils import timezone
        import os
        from pathlib import Path
        
        printshop_email = 'zaoujalyoussef1@gmail.com'
        
        request_scheme = request.scheme if hasattr(request, 'scheme') else 'http'
        request_host = request.get_host() if hasattr(request, 'get_host') else 'localhost:8000'
        
        email_subject = f'Commande d\'impression COMBINÉE - Lot {print_batch.batch_number} - 1000 sacs'
        
        # Préparer les données pour le template
        campaigns_data = []
        for idx, campaign in enumerate(campaigns, 1):
            campaign_data = {
                'name': campaign.name,
                'order_number': campaign.order_number,
                'client_name': campaign.client.company_name or campaign.client.username,
                'client_email': campaign.client.email,
                'client_phone': getattr(campaign.client, 'phone', None),
                'postal_codes': campaign.postal_codes,
                'has_custom_card': False,
                'has_design': False,
                'custom_card_filename': None,
                'custom_card_attached': False,
                'template_number': None,
                'slogan': None,
                'design_email': None,
                'design_phone': None,
                'design_address': None,
                'design_postal_code': None,
                'accent_color': None,
                'contact_method': None,
                'logo_url': None,
                'qr_code_url': None,
                'template_image_attached': False
            }
            
            # Carte personnalisée
            if campaign.use_custom_card and campaign.custom_card:
                try:
                    custom_card_path = campaign.custom_card.path if hasattr(campaign.custom_card, 'path') else None
                    custom_card_name = campaign.custom_card.name.split('/')[-1] if campaign.custom_card.name else 'carte_personnalisee'
                    campaign_data['has_custom_card'] = True
                    campaign_data['custom_card_filename'] = custom_card_name
                    campaign_data['custom_card_path'] = custom_card_path
                    campaign_data['custom_card_attached'] = custom_card_path and os.path.exists(custom_card_path)
                except Exception as e:
                    print(f"⚠️ Erreur carte personnalisée campagne {campaign.order_number}: {e}")
            
            # Design template
            elif hasattr(campaign, 'design'):
                try:
                    design = campaign.design
                    template_num = design.template.replace('template_', '')
                    contact_method_label = dict(design.CONTACT_METHOD_CHOICES).get(design.contact_method, design.contact_method)
                    
                    campaign_data['has_design'] = True
                    campaign_data['template_number'] = template_num
                    campaign_data['slogan'] = design.slogan
                    campaign_data['design_email'] = design.company_email
                    campaign_data['design_phone'] = design.company_phone
                    campaign_data['design_address'] = design.company_address
                    campaign_data['design_postal_code'] = design.company_postal_code
                    campaign_data['accent_color'] = design.accent_color
                    campaign_data['contact_method'] = contact_method_label
                    
                    # URLs pour logo et QR code
                    try:
                        if design.logo and hasattr(design.logo, 'url'):
                            campaign_data['logo_url'] = f"{request_scheme}://{request_host}{design.logo.url}"
                            if hasattr(design.logo, 'path') and os.path.exists(design.logo.path):
                                campaign_data['logo_path'] = design.logo.path
                    except Exception:
                        pass
                    
                    try:
                        if design.qr_code and hasattr(design.qr_code, 'url'):
                            campaign_data['qr_code_url'] = f"{request_scheme}://{request_host}{design.qr_code.url}"
                            if hasattr(design.qr_code, 'path') and os.path.exists(design.qr_code.path):
                                campaign_data['qr_code_path'] = design.qr_code.path
                    except Exception:
                        pass
                    
                    # Chercher l'image du template
                    try:
                        # Chercher dans les assets frontend
                        frontend_assets = Path(settings.BASE_DIR).parent / 'frontend' / 'src' / 'assets'
                        template_image_path = frontend_assets / f'{template_num}.jpg'
                        if not template_image_path.exists():
                            template_image_path = frontend_assets / f'template_{template_num}.jpg'
                        if template_image_path.exists():
                            campaign_data['template_image_path'] = str(template_image_path)
                            campaign_data['template_image_attached'] = True
                    except Exception as e:
                        print(f"⚠️ Erreur recherche image template {template_num}: {e}")
                        
                except Exception as e:
                    print(f"⚠️ Erreur design campagne {campaign.order_number}: {e}")
            
            campaigns_data.append(campaign_data)
        
        # Préparer le contexte pour le template
        context = {
            'batch_number': print_batch.batch_number,
            'campaigns_count': len(campaigns),
            'total_if_separate': len(campaigns) * 1000,
            'postal_code': print_batch.postal_code,
            'order_date': timezone.now().strftime('%d/%m/%Y à %H:%M'),
            'campaigns': campaigns_data,
            'partner': {
                'company_name': partner.company_name,
                'email': partner.email,
                'phone': getattr(partner, 'phone', None),
                'address': getattr(partner, 'address', None),
                'city': getattr(partner, 'city', None),
                'postal_code': getattr(partner, 'postal_code', None),
            }
        }
        
        # Rendre le template HTML
        html_content = render_to_string('emails/print_order_combined.html', context)
        
        # Version texte simple
        text_content = f"""
Commande d'impression COMBINÉE - Lot {print_batch.batch_number}

⚠️ IMPORTANT: Cette commande combine {len(campaigns)} campagne(s) en UN SEUL LOT de 1000 sacs.

QUANTITÉ À IMPRIMER: 1000 sacs au total

Les {len(campaigns)} designs doivent être COMBINÉS dans les 1000 sacs.

Voir l'email HTML pour tous les détails et les fichiers joints.
"""
        
        # Créer l'email
        email = EmailMultiAlternatives(
            subject=email_subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[printshop_email]
        )
        
        # Ajouter la version HTML
        email.attach_alternative(html_content, "text/html")
        
        # Attacher les fichiers
        try:
            # Attacher les cartes personnalisées
            for campaign_data in campaigns_data:
                if campaign_data.get('custom_card_attached') and campaign_data.get('custom_card_path'):
                    try:
                        with open(campaign_data['custom_card_path'], 'rb') as f:
                            email.attach(
                                campaign_data['custom_card_filename'],
                                f.read(),
                                'application/octet-stream'
                            )
                        print(f"✅ Carte personnalisée attachée: {campaign_data['custom_card_filename']}")
                    except Exception as e:
                        print(f"⚠️ Erreur attachement carte personnalisée: {e}")
            
            # Attacher les images des templates
            for campaign_data in campaigns_data:
                if campaign_data.get('template_image_attached') and campaign_data.get('template_image_path'):
                    try:
                        template_num = campaign_data['template_number']
                        with open(campaign_data['template_image_path'], 'rb') as f:
                            email.attach(
                                f'template_{template_num}.jpg',
                                f.read(),
                                'image/jpeg'
                            )
                        print(f"✅ Image template attachée: template_{template_num}.jpg")
                    except Exception as e:
                        print(f"⚠️ Erreur attachement image template: {e}")
            
            # Attacher les logos si disponibles
            for campaign_data in campaigns_data:
                if campaign_data.get('logo_path') and os.path.exists(campaign_data['logo_path']):
                    try:
                        logo_name = os.path.basename(campaign_data['logo_path'])
                        with open(campaign_data['logo_path'], 'rb') as f:
                            email.attach(
                                f"logo_{campaign_data['order_number']}_{logo_name}",
                                f.read(),
                                'image/jpeg'
                            )
                        print(f"✅ Logo attaché: {logo_name}")
                    except Exception as e:
                        print(f"⚠️ Erreur attachement logo: {e}")
            
            # Attacher les QR codes si disponibles
            for campaign_data in campaigns_data:
                if campaign_data.get('qr_code_path') and os.path.exists(campaign_data['qr_code_path']):
                    try:
                        qr_name = os.path.basename(campaign_data['qr_code_path'])
                        with open(campaign_data['qr_code_path'], 'rb') as f:
                            email.attach(
                                f"qr_{campaign_data['order_number']}_{qr_name}",
                                f.read(),
                                'image/png'
                            )
                        print(f"✅ QR Code attaché: {qr_name}")
                    except Exception as e:
                        print(f"⚠️ Erreur attachement QR Code: {e}")
                        
        except Exception as e:
            print(f"⚠️ Erreur lors de l'attachement des fichiers: {e}")
        
        # Envoyer l'email
        try:
            email.send()
            print(f"✅ Email HTML envoyé à l'imprimerie pour le lot combiné {print_batch.batch_number}")
        except Exception as e:
            print(f"❌ Erreur envoi email imprimerie: {e}")
            raise

class UpdateCampaignStatusView(APIView):
    """Mettre à jour le statut d'une campagne"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def patch(self, request, campaign_id):
        try:
            new_status = request.data.get('status')
            
            if not new_status:
                return Response({'error': 'Statut requis'}, status=400)
            
            # Valider le statut
            valid_statuses = ['CREATED', 'ASSIGNED', 'IN_PRINTING', 'PRINTED', 'IN_DISTRIBUTION', 'DELIVERED', 'FINISHED']
            if new_status not in valid_statuses:
                return Response({'error': f'Statut invalide. Statuts valides: {", ".join(valid_statuses)}'}, status=400)
            
            # Récupérer la campagne
            try:
                campaign = Campaign.objects.select_related('client', 'partner').get(id=campaign_id)
            except Campaign.DoesNotExist:
                return Response({'error': 'Campagne non trouvée'}, status=404)
            
            # Sauvegarder l'ancien statut
            old_status = campaign.status
            
            # Mettre à jour le statut
            campaign.status = new_status
            
            # Mettre à jour printing_status si nécessaire
            if new_status == 'IN_PRINTING':
                campaign.printing_status = 'SENT_TO_PRINT'
            elif new_status == 'PRINTED':
                campaign.printing_status = 'COMPLETED'
            
            campaign.save()
            
            # Log
            CampaignLog.objects.create(
                campaign=campaign,
                user=request.user,
                action='STATUS_CHANGED',
                details=f"Statut changé de {old_status} à {new_status}"
            )
            
            # Envoyer email au client
            from .utils.email_service import EmailService
            try:
                EmailService.send_status_change_email(campaign, old_status, new_status)
            except Exception as e:
                print(f"⚠️ Erreur envoi email pour changement de statut: {e}")
            
            return Response({
                'message': f'Statut de la campagne mis à jour: {old_status} → {new_status}',
                'campaign': {
                    'id': str(campaign.id),
                    'order_number': campaign.order_number,
                    'name': campaign.name,
                    'status': campaign.status
                }
            })
            
        except Exception as e:
            print(f"❌ Erreur mise à jour statut campagne: {e}")
            import traceback
            traceback.print_exc()
            return Response({
                'error': 'Erreur lors de la mise à jour du statut',
                'details': str(e)
            }, status=500)

# ============================================
# VUES CLIENT
# ============================================

class ClientCampaignsView(APIView):
    """Dashboard client"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        if user.role != 'client':
            return Response({'error': 'Accès réservé aux clients'}, status=403)
        
        campaigns = Campaign.objects.filter(client=user).select_related('design')
        
        # Statistiques
        stats = {
            'total': campaigns.count(),
            'in_printing': campaigns.filter(status='IN_PRINTING').count(),
            'printed': campaigns.filter(status='PRINTED').count(),
            'delivered': campaigns.filter(status='DELIVERED').count(),
            'with_custom_card': campaigns.filter(use_custom_card=True).count(),
            'total_investment': sum(float(c.estimated_price or 0) for c in campaigns)
        }
        
        # Campagnes récentes avec détails
        campaigns_data = []
        for campaign in campaigns.order_by('-created_at')[:20]:
            campaign_data = {
                'id': str(campaign.id),
                'order_number': campaign.order_number,
                'name': campaign.name,
                'quantity': campaign.quantity,
                'postal_codes': campaign.postal_codes or '',
                'status': campaign.status,
                'printing_status': campaign.printing_status,
                'estimated_price': float(campaign.estimated_price or 0),
                'created_at': campaign.created_at,
                'use_custom_card': campaign.use_custom_card,
                'has_custom_card': campaign.has_custom_card,
                'has_design': hasattr(campaign, 'design'),
                'custom_card_url': request.build_absolute_uri(campaign.custom_card.url) if campaign.custom_card else None,
            }
            
            if hasattr(campaign, 'design'):
                design = campaign.design
                campaign_data['design'] = {
                    'template': design.template,
                    'qr_code_url': request.build_absolute_uri(design.qr_code.url) if design.qr_code else None
                }
            
            campaigns_data.append(campaign_data)
        
        return Response({
            'stats': stats,
            'campaigns': campaigns_data
        })

# ============================================
# VUES MOT DE PASSE (inchangées)
# ============================================

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email', '').lower().strip()
        
        if not email:
            return Response({'message': 'Email requis.'}, status=400)
        
        try:
            users = User.objects.filter(email=email, is_active=True)
            
            if not users.exists():
                # Pour des raisons de sécurité, on ne révèle pas si l'email existe
                return Response({
                    'message': 'Si votre email existe dans notre système, vous recevrez un lien de réinitialisation.'
                })
            
            user = users.first()
            
            if users.count() > 1:
                user = users.order_by('-date_joined').first()
            
            # Créer le token
            token = secrets.token_urlsafe(64)
            
            # Supprimer les anciens tokens
            PasswordResetToken.objects.filter(user=user, used=False).update(used=True)
            
            # Créer le nouveau token
            reset_token = PasswordResetToken.objects.create(
                user=user,
                token=token,
                expires_at=timezone.now() + timedelta(hours=24),
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500]
            )
            
            # Envoyer l'email
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            reset_url = f"{frontend_url}/reset-password/{token}"
            
            send_mail(
                subject='🔒 Réinitialisation de votre mot de passe',
                message=f'Cliquez sur ce lien pour réinitialiser votre mot de passe : {reset_url}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            
            return Response({
                'message': 'Si votre email existe dans notre système, vous recevrez un lien de réinitialisation.'
            })
            
        except Exception as e:
            print(f"❌ Erreur ForgotPassword: {str(e)}")
            return Response({
                'message': 'Une erreur est survenue. Veuillez réessayer.'
            }, status=500)

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        token = request.data.get('token', '')
        new_password = request.data.get('new_password', '')
        confirm_password = request.data.get('confirm_password', '')
        
        if not token or not new_password or not confirm_password:
            return Response({'error': 'Tous les champs sont requis.'}, status=400)
        
        if new_password != confirm_password:
            return Response({'error': 'Les mots de passe ne correspondent pas.'}, status=400)
        
        if len(new_password) < 8:
            return Response({'error': 'Le mot de passe doit contenir au moins 8 caractères.'}, status=400)
        
        try:
            reset_token = PasswordResetToken.objects.get(token=token, used=False)
            
            if timezone.now() > reset_token.expires_at:
                return Response({'error': 'Ce lien a expiré.'}, status=400)
            
            # Mettre à jour le mot de passe
            user = reset_token.user
            user.set_password(new_password)
            user.save()
            
            # Marquer le token comme utilisé
            reset_token.used = True
            reset_token.save()
            
            # Envoyer confirmation
            send_mail(
                subject='✅ Votre mot de passe a été modifié',
                message='Votre mot de passe a été modifié avec succès.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            
            return Response({'message': 'Votre mot de passe a été réinitialisé avec succès.'})
            
        except PasswordResetToken.DoesNotExist:
            return Response({'error': 'Lien invalide ou déjà utilisé.'}, status=400)
        except Exception as e:
            print(f"Erreur ResetPassword: {str(e)}")
            return Response({'error': 'Une erreur est survenue.'}, status=500)

class ValidateResetTokenView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, token):
        try:
            reset_token = PasswordResetToken.objects.get(token=token, used=False)
            
            if timezone.now() > reset_token.expires_at:
                return Response({'valid': False, 'message': 'Lien expiré.'})
            
            return Response({
                'valid': True,
                'email': reset_token.user.email,
                'company_name': reset_token.user.company_name
            })
            
        except PasswordResetToken.DoesNotExist:
            return Response({'valid': False, 'message': 'Lien invalide.'})

# ============================================
# VUES PARTENAIRES
# ============================================

class PartnerViewSet(viewsets.ModelViewSet):
    serializer_class = PartnerSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    pagination_class = None  # Désactiver la pagination pour ce ViewSet
    
    def get_queryset(self):
        return Partner.objects.all().select_related('user').order_by('-created_at')

# ============================================
# AUTRES VUES
# ============================================

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from django.core.cache import cache
        
        user = request.user
        cache_key = f'dashboard_stats_{user.id}_{user.role}'
        
        # Utiliser le cache (30 secondes)
        cached_stats = cache.get(cache_key)
        if cached_stats:
            return Response(cached_stats)
        
        if user.role == 'client':
            campaigns = Campaign.objects.filter(client=user).only('status', 'estimated_price')
            stats = {
                'total_campaigns': campaigns.count(),
                'active_campaigns': campaigns.exclude(status='FINISHED').count(),
                'campaigns_in_printing': campaigns.filter(status='IN_PRINTING').count(),
                'total_investment': sum(float(c.estimated_price or 0) for c in campaigns)
            }
        elif user.role == 'admin':
            # Calculer le revenu total de toutes les campagnes (tous statuts)
            all_campaigns = Campaign.objects.only('estimated_price')
            total_revenue = sum(float(c.estimated_price or 0) for c in all_campaigns)
            
            # Optimiser avec only() pour réduire les données récupérées
            stats = {
                'total_campaigns': Campaign.objects.only('id').count(),
                'total_clients': User.objects.filter(role='client').only('id').count(),
                'total_partners': Partner.objects.only('id').count(),
                'unassigned_campaigns': Campaign.objects.filter(status='CREATED').only('id').count(),
                'campaigns_in_printing': Campaign.objects.filter(status='IN_PRINTING').only('id').count(),
                'printed_campaigns': Campaign.objects.filter(status='PRINTED').only('id').count(),
                'total_revenue': total_revenue,  # Revenus totaux de toutes les campagnes
            }
        else:
            stats = {}
        
        # Mettre en cache pour 30 secondes
        cache.set(cache_key, stats, 30)
        return Response(stats)

class AnalyticsView(APIView):
    """Analytics détaillées pour l'admin"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get(self, request):
        from django.core.cache import cache
        
        # Cache des analytics (1 minute)
        cache_key = 'admin_analytics'
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
        from django.db.models import Sum, Count, Q
        from django.utils import timezone
        from datetime import timedelta
        from collections import defaultdict
        import calendar
        from .models import PrintBatch
        
        # Revenus totaux
        all_campaigns = Campaign.objects.all()
        total_revenue = sum(float(c.estimated_price or 0) for c in all_campaigns)
        
        # Revenus par période
        now = timezone.now()
        revenue_today = sum(float(c.estimated_price or 0) for c in all_campaigns.filter(created_at__date=now.date()))
        revenue_this_month = sum(float(c.estimated_price or 0) for c in all_campaigns.filter(created_at__month=now.month, created_at__year=now.year))
        revenue_this_year = sum(float(c.estimated_price or 0) for c in all_campaigns.filter(created_at__year=now.year))
        
        # Revenus par mois (12 derniers mois)
        revenue_by_month = []
        for i in range(11, -1, -1):
            month_date = now - timedelta(days=30*i)
            month_campaigns = all_campaigns.filter(
                created_at__month=month_date.month,
                created_at__year=month_date.year
            )
            revenue_by_month.append({
                'month': calendar.month_name[month_date.month][:3],
                'revenue': sum(float(c.estimated_price or 0) for c in month_campaigns),
                'campaigns': month_campaigns.count()
            })
        
        # Revenus par jour (30 derniers jours)
        revenue_by_day = []
        for i in range(29, -1, -1):
            day_date = now.date() - timedelta(days=i)
            day_campaigns = all_campaigns.filter(created_at__date=day_date)
            revenue_by_day.append({
                'day': day_date.strftime('%d/%m'),
                'revenue': sum(float(c.estimated_price or 0) for c in day_campaigns),
                'campaigns': day_campaigns.count()
            })
        
        # Campagnes par statut
        campaigns_by_status = []
        for status_code, status_label in Campaign.STATUS_CHOICES:
            count = all_campaigns.filter(status=status_code).count()
            if count > 0:
                campaigns_by_status.append({
                    'name': status_label,
                    'value': count
                })
        
        # Campagnes par code postal
        postal_code_stats = defaultdict(int)
        for campaign in all_campaigns:
            if campaign.postal_codes:
                codes = str(campaign.postal_codes).split(',')
                for code in codes:
                    code = code.strip()
                    if code:
                        postal_code_stats[code] += 1
        
        # Top 10 codes postaux
        top_postal_codes = sorted(postal_code_stats.items(), key=lambda x: x[1], reverse=True)[:10]
        campaigns_by_postal_code = [{'code': code, 'count': count} for code, count in top_postal_codes]
        
        # Distribution par partenaire - Optimisé
        # Note: Les campagnes combinées en lot = 1000 sacs au total, pas 1000 × nombre de campagnes
        partner_distribution = []
        partners = Partner.objects.only('id', 'company_name')
        for partner in partners:
            partner_campaigns = all_campaigns.filter(partner=partner).only('id', 'estimated_price')
            if partner_campaigns.count() > 0:
                # Compter les batches pour savoir combien de lots de 1000 sacs
                partner_batches = PrintBatch.objects.filter(partner=partner)
                total_quantity = 0
                for batch in partner_batches:
                    # Chaque batch = 1000 sacs (même si plusieurs campagnes)
                    total_quantity += 1000
                
                # Si pas de batch, compter les campagnes individuelles
                if total_quantity == 0:
                    total_quantity = partner_campaigns.count() * 1000
                
                partner_distribution.append({
                    'name': partner.company_name,
                    'campaigns': partner_campaigns.count(),
                    'quantity': total_quantity,  # Basé sur les batches (1000 par lot)
                    'revenue': sum(float(c.estimated_price or 0) for c in partner_campaigns)
                })
        
        # Campagnes par année
        revenue_by_year = []
        years = all_campaigns.values_list('created_at__year', flat=True).distinct()
        for year in sorted(years):
            year_campaigns = all_campaigns.filter(created_at__year=year)
            revenue_by_year.append({
                'year': str(year),
                'revenue': sum(float(c.estimated_price or 0) for c in year_campaigns),
                'campaigns': year_campaigns.count()
            })
        
        # Quantité totale : compter les batches (chaque batch = 1000 sacs, même si plusieurs campagnes)
        total_batches = PrintBatch.objects.count()
        total_quantity = total_batches * 1000  # Chaque batch = 1000 sacs
        
        # Si pas de batches, compter les campagnes individuelles
        if total_quantity == 0:
            total_quantity = all_campaigns.count() * 1000
        
        # Quantité distribuée : batches en distribution/livrés
        distributed_batches = PrintBatch.objects.filter(status__in=['IN_PRINTING', 'PRINTED', 'DELIVERED']).count()
        quantity_distributed = distributed_batches * 1000
        
        # Si pas de batches, compter les campagnes
        if quantity_distributed == 0:
            quantity_distributed = all_campaigns.filter(status__in=['IN_DISTRIBUTION', 'DELIVERED', 'FINISHED']).count() * 1000
        
        # Top clients - Optimisé
        client_stats = []
        clients = User.objects.filter(role='client').only('id', 'company_name', 'username')
        for client in clients:
            client_campaigns = all_campaigns.filter(client=client)
            if client_campaigns.exists():
                client_revenue = sum(float(c.estimated_price or 0) for c in client_campaigns)
                client_stats.append({
                    'name': client.company_name or client.username,
                    'campaigns': client_campaigns.count(),
                    'revenue': client_revenue
                })
        top_clients = sorted(client_stats, key=lambda x: x['revenue'], reverse=True)[:10]
        
        analytics_data = {
            'revenue': {
                'total': total_revenue,
                'today': revenue_today,
                'this_month': revenue_this_month,
                'this_year': revenue_this_year
            },
            'revenue_by_month': revenue_by_month,
            'revenue_by_day': revenue_by_day,
            'revenue_by_year': revenue_by_year,
            'campaigns_by_status': campaigns_by_status,
            'campaigns_by_postal_code': campaigns_by_postal_code,
            'partner_distribution': partner_distribution,
            'quantity': {
                'total': total_quantity,
                'distributed': quantity_distributed,
                'remaining': total_quantity - quantity_distributed
            },
            'top_clients': top_clients
        }
        
        # Mettre en cache pour 1 minute
        cache.set(cache_key, analytics_data, 60)
        return Response(analytics_data)

class CampaignLogsView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    
    def get(self, request, pk):
        try:
            campaign = Campaign.objects.get(pk=pk)
            self.check_object_permissions(request, campaign)
            
            logs = CampaignLog.objects.filter(campaign=campaign).order_by('-created_at')
            serializer = CampaignLogSerializer(logs, many=True)
            return Response(serializer.data)
        except Campaign.DoesNotExist:
            return Response({'detail': 'Campagne non trouvée'}, status=404)

class CampaignProofsView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    
    def get(self, request, pk):
        try:
            campaign = Campaign.objects.get(pk=pk)
            self.check_object_permissions(request, campaign)
            
            proofs = CampaignProof.objects.filter(campaign=campaign)
            return Response([{
                'id': proof.id,
                'image': request.build_absolute_uri(proof.image.url) if proof.image else None,
                'description': proof.description,
                'uploaded_at': proof.uploaded_at
            } for proof in proofs])
        except Campaign.DoesNotExist:
            return Response({'detail': 'Campagne non trouvée'}, status=404)
    
    def post(self, request, pk):
        if request.user.role != 'admin':
            return Response({'error': 'Permission refusée'}, status=403)
        
        try:
            campaign = Campaign.objects.get(pk=pk)
            image = request.FILES.get('image')
            description = request.data.get('description', '')
            
            if image:
                proof = CampaignProof.objects.create(
                    campaign=campaign,
                    image=image,
                    description=description,
                    uploaded_by=request.user
                )
                
                CampaignLog.objects.create(
                    campaign=campaign,
                    user=request.user,
                    action='PROOF_UPLOADED',
                    details=f"Preuve uploadée: {description}"
                )
                
                return Response({'message': 'Preuve uploadée avec succès'})
            return Response({'error': 'Image requise'}, status=400)
        except Campaign.DoesNotExist:
            return Response({'detail': 'Campagne non trouvée'}, status=404)

class ClientListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get(self, request):
        clients = User.objects.filter(role='client').select_related()
        
        clients_data = []
        for client in clients:
            campaign_count = Campaign.objects.filter(client=client).count()
            total_spent = sum(float(c.estimated_price or 0) for c in Campaign.objects.filter(client=client))
            
            clients_data.append({
                'id': client.id,
                'username': client.username,
                'email': client.email,
                'company_name': client.company_name,
                'siret': client.siret,
                'tva_number': client.tva_number,
                'phone': client.phone,
                'address': client.address,
                'city': client.city,
                'postal_code': client.postal_code,
                'campaigns_count': campaign_count,
                'total_spent': total_spent,
                'date_joined': client.date_joined
            })
        
        return Response(clients_data)

# ============================================
# ENDPOINT LANDING DASHBOARD (pour éviter 404)
# ============================================
class LandingDashboardView(APIView):
    """Endpoint minimal pour éviter l'erreur 404"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({
            'message': 'Cet endpoint n\'est pas utilisé',
            'available_endpoints': [
                '/api/landing/{identifier}/',
                '/api/admin/campaigns/',
                '/api/client/campaigns/',
            ]
        }, status=200)