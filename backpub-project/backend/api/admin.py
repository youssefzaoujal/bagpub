from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, Partner, Campaign, CampaignDesign, PrintBatch,
    PrintOrder, CampaignLog, CampaignProof, PasswordResetToken, LoginAttempt
)


# Configuration personnalisée pour le modèle User
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'company_name', 'role', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active', 'is_staff', 'date_joined')
    search_fields = ('username', 'email', 'company_name', 'phone')
    ordering = ('-date_joined',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Informations professionnelles', {
            'fields': ('role', 'company_name', 'siret', 'tva_number', 'phone', 
                      'address', 'city', 'postal_code', 'partner_type', 'coverage_radius')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Informations professionnelles', {
            'fields': ('role', 'company_name', 'email', 'phone')
        }),
    )


@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'email', 'phone', 'city', 'is_active', 'created_at')
    list_filter = ('is_active', 'city', 'created_at')
    search_fields = ('company_name', 'email', 'phone', 'city')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'name', 'client', 'quantity', 'status', 
                   'printing_status', 'estimated_price', 'created_at')
    list_filter = ('status', 'printing_status', 'use_custom_card', 'faces', 'created_at')
    search_fields = ('order_number', 'name', 'client__username', 'client__company_name', 
                    'postal_codes')
    ordering = ('-created_at',)
    readonly_fields = ('id', 'order_number', 'secure_token', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('id', 'order_number', 'name', 'client', 'partner', 'status', 'printing_status')
        }),
        ('Détails de la commande', {
            'fields': ('quantity', 'postal_codes', 'faces', 'estimated_price', 'special_request')
        }),
        ('Carte personnalisée', {
            'fields': ('use_custom_card', 'custom_card')
        }),
        ('Sécurité', {
            'fields': ('secure_token',)
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # Si c'est une modification
            return self.readonly_fields + ('id',)
        return self.readonly_fields


class CampaignDesignInline(admin.StackedInline):
    model = CampaignDesign
    extra = 0
    fields = ('template', 'slogan', 'company_email', 'company_phone', 
             'company_address', 'company_postal_code', 'accent_color', 
             'contact_method', 'logo', 'qr_code', 'qr_code_url')
    readonly_fields = ('qr_code_url',)


@admin.register(CampaignDesign)
class CampaignDesignAdmin(admin.ModelAdmin):
    list_display = ('campaign', 'template', 'company_email', 'company_phone', 'contact_method', 'created_at')
    list_filter = ('template', 'contact_method', 'created_at')
    search_fields = ('campaign__name', 'campaign__order_number', 'company_email', 'company_phone')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Campagne', {
            'fields': ('campaign',)
        }),
        ('Informations entreprise', {
            'fields': ('slogan', 'company_email', 'company_phone', 
                      'company_address', 'company_postal_code', 'logo')
        }),
        ('Design', {
            'fields': ('template', 'accent_color')
        }),
        ('Contact', {
            'fields': ('contact_method', 'qr_code', 'qr_code_url')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at')
        }),
    )


class CampaignInline(admin.TabularInline):
    model = Campaign
    extra = 0
    fields = ('order_number', 'name', 'quantity', 'status')
    readonly_fields = ('order_number',)
    can_delete = False


@admin.register(PrintBatch)
class PrintBatchAdmin(admin.ModelAdmin):
    list_display = ('batch_number', 'postal_code', 'status', 'partner', 
                   'total_quantity', 'campaigns_count', 'created_at')
    list_filter = ('status', 'postal_code', 'created_at')
    search_fields = ('batch_number', 'postal_code', 'partner__company_name')
    ordering = ('-created_at',)
    readonly_fields = ('batch_number', 'total_quantity', 'client_count', 
                      'created_at', 'updated_at', 'printed_at')
    filter_horizontal = ('campaigns',)
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('batch_number', 'postal_code', 'status', 'partner')
        }),
        ('Campagnes', {
            'fields': ('campaigns',)
        }),
        ('Statistiques', {
            'fields': ('total_quantity', 'client_count')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at', 'printed_at')
        }),
    )
    
    def campaigns_count(self, obj):
        return obj.campaigns.count()
    campaigns_count.short_description = 'Nombre de campagnes'


@admin.register(PrintOrder)
class PrintOrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'batch', 'status', 'assigned_to', 'created_at', 'completed_at')
    list_filter = ('status', 'created_at', 'completed_at')
    search_fields = ('order_number', 'batch__batch_number', 'assigned_to__username')
    ordering = ('-created_at',)
    readonly_fields = ('order_number', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('order_number', 'batch', 'status', 'assigned_to')
        }),
        ('Fichiers', {
            'fields': ('print_file',)
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at', 'started_at', 'completed_at', 'shipped_at')
        }),
    )


@admin.register(CampaignLog)
class CampaignLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'campaign', 'batch', 'user', 'created_at')
    list_filter = ('action', 'created_at')
    search_fields = ('campaign__order_number', 'campaign__name', 'user__username', 'details')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('action', 'campaign', 'batch', 'user')
        }),
        ('Détails', {
            'fields': ('details', 'created_at')
        }),
    )


@admin.register(CampaignProof)
class CampaignProofAdmin(admin.ModelAdmin):
    list_display = ('campaign', 'description', 'uploaded_by', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('campaign__order_number', 'campaign__name', 'description', 'uploaded_by__username')
    ordering = ('-uploaded_at',)
    readonly_fields = ('uploaded_at',)


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'token_preview', 'used', 'expires_at', 'created_at', 'ip_address')
    list_filter = ('used', 'expires_at', 'created_at')
    search_fields = ('user__username', 'user__email', 'token', 'ip_address')
    ordering = ('-created_at',)
    readonly_fields = ('token', 'created_at', 'expires_at')
    
    def token_preview(self, obj):
        if obj.token:
            return f"{obj.token[:20]}..." if len(obj.token) > 20 else obj.token
        return "-"
    token_preview.short_description = 'Token'
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('user', 'token', 'used', 'expires_at')
        }),
        ('Sécurité', {
            'fields': ('ip_address', 'user_agent', 'created_at')
        }),
    )


@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):
    list_display = ('email', 'user', 'success', 'ip_address', 'timestamp', 'reason')
    list_filter = ('success', 'timestamp')
    search_fields = ('email', 'ip_address', 'user_agent', 'reason')
    ordering = ('-timestamp',)
    readonly_fields = ('timestamp',)
    
    fieldsets = (
        ('Tentative de connexion', {
            'fields': ('user', 'email', 'success', 'reason', 'ip_address', 'user_agent', 'timestamp')
        }),
    )
