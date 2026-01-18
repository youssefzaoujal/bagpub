from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import *
from .serializers import CustomTokenObtainPairSerializer

# Initialisation du router
router = DefaultRouter()
router.register(r'campaigns', CampaignViewSet, basename='campaign')
router.register(r'partners', PartnerViewSet, basename='partner')
router.register(r'print-batches', PrintBatchViewSet, basename='printbatch')

# Configuration des URLs
urlpatterns = [
    # ============================================
    # SECTION 1: AUTHENTIFICATION
    # ============================================
    path('auth/register/client/', RegisterClientView.as_view(), name='register-client'),
    path('auth/register/partner/', RegisterPartnerView.as_view(), name='register-partner'),
    path('auth/login/', TokenObtainPairView.as_view(serializer_class=CustomTokenObtainPairSerializer), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', UserProfileView.as_view(), name='user-profile'),
    
    # Mot de passe
    path('auth/password/forgot/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('auth/password/reset/', ResetPasswordView.as_view(), name='reset-password'),
    path('auth/password/reset/<str:token>/validate/', ValidateResetTokenView.as_view(), name='validate-reset-token'),
    
    # ============================================
    # SECTION 2: CAMPAGNES
    # ============================================
    path('campaigns/create-complete/', CampaignCreateCompleteView.as_view(), name='create-complete'),
    
    path('campaigns/<uuid:pk>/design/', CampaignDesignView.as_view(), name='campaign-design'),
    path('campaigns/<uuid:pk>/logs/', CampaignLogsView.as_view(), name='campaign-logs'),
    path('campaigns/<uuid:pk>/proofs/', CampaignProofsView.as_view(), name='campaign-proofs'),
    
    # ============================================
    # SECTION 3: ADMIN - GESTION CAMPAGNES
    # ============================================
    path('admin/campaigns/', AdminCampaignsView.as_view(), name='admin-campaigns'),
    path('admin/campaigns/send-to-print/', SendCampaignsToPrintView.as_view(), name='send-campaigns-to-print'),
    path('admin/campaigns/assign-partner-and-print/', AssignPartnerAndSendToPrintView.as_view(), name='assign-partner-and-print'),
    path('admin/campaigns/<uuid:campaign_id>/update-status/', UpdateCampaignStatusView.as_view(), name='update-campaign-status'),
    path('admin/clients/', ClientListView.as_view(), name='client-list'),
    
    # ============================================
    # SECTION 5: DASHBOARD CLIENT
    # ============================================
    path('client/campaigns/', ClientCampaignsView.as_view(), name='client-campaigns'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('admin/analytics/', AnalyticsView.as_view(), name='analytics'),
    
    # ============================================
    # SECTION 7: LANDING (pour éviter 404)
    # ============================================
    path('landing/dashboard/', LandingDashboardView.as_view(), name='landing-dashboard'),
    
    # ============================================
    # SECTION 6: ROUTES AUTOMATIQUES
    # ============================================
    path('', include(router.urls)),
]