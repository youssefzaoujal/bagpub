import os
from django.template.loader import render_to_string
from django.core.files.base import ContentFile
from django.conf import settings

class LandingPageGenerator:
    def __init__(self, campaign_design):
        self.design = campaign_design
        self.campaign = campaign_design.campaign
        
    def generate_landing_page(self):
        """Génère une page HTML simple pour la campagne"""
        context = {
            'company_name': self.campaign.client.company_name,
            'slogan': self.design.slogan,
            'description': self.design.landing_description,
            'email': self.design.landing_email or self.design.company_email,
            'phone': self.design.company_phone,
            'campaign_name': self.campaign.name,
            'secure_token': self.campaign.secure_token,
        }
        
        # Générer le HTML
        html_content = render_to_string('landing_template.html', context)
        
        # Dans un cas réel, vous pourriez sauvegarder ce HTML
        # ou le servir dynamiquement
        return html_content
    
    def get_landing_url(self):
        """Retourne l'URL de la landing page"""
        # Utiliser le token sécurisé pour l'URL
        return f"{settings.FRONTEND_URL}/landing/{self.campaign.secure_token}"