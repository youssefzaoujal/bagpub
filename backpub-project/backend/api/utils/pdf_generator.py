import io
from reportlab.lib.pagesizes import A4, A3
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
import qrcode
from django.conf import settings
import os


class PrintBatchPDFGenerator:
    def __init__(self, print_batch):
        self.batch = print_batch
        self.campaigns = print_batch.campaigns.all()
        self.pdf_buffer = io.BytesIO()
        
    def generate_pdf(self):
        """Génère un PDF avec les cartes de visite (peut être moins de 9)"""
        page_size = A4
        cards_per_page = 9
        
        c = canvas.Canvas(self.pdf_buffer, pagesize=page_size)
        width, height = page_size
        
        # Configuration des marges et dimensions des cartes
        margin = 15 * mm
        card_width = (width - 4 * margin) / 3
        card_height = (height - 4 * margin) / 3
        
        for i, campaign in enumerate(self.campaigns):
            # Nouvelle page après 9 cartes
            if i > 0 and i % cards_per_page == 0:
                c.showPage()
            
            # Calculer la position de la carte
            page_position = i % cards_per_page
            row = (page_position // 3) % 3
            col = page_position % 3
            
            x = margin + col * (card_width + margin)
            y = height - margin - (row + 1) * (card_height + margin)
            
            # Dessiner le contour de la carte
            c.rect(x, y, card_width, card_height)
            
            # Ajouter les informations de la campagne
            self._draw_card_content(c, campaign, x, y, card_width, card_height)
            
            # Ajouter le QR code s'il existe
            if hasattr(campaign, 'design') and campaign.design.qr_code:
                qr_path = campaign.design.qr_code.path
                if os.path.exists(qr_path):
                    qr_img = ImageReader(qr_path)
                    qr_size = 20 * mm
                    c.drawImage(qr_img, x + 5, y + 5, qr_size, qr_size)
            
            # Ajouter le token sécurisé
            c.setFont("Helvetica", 6)
            c.drawString(x + 5, y + 5, f"Token: {campaign.secure_token[:8]}")
            
            # Numéro de batch
            c.setFont("Helvetica", 6)
            c.drawString(x + card_width - 60, y + 5, f"Batch: {self.batch.batch_number}")
        
        c.save()
        
        # Sauvegarder le PDF
        pdf_content = self.pdf_buffer.getvalue()
        pdf_filename = f'print_batches/batch_{self.batch.batch_number}.pdf'
        
        from django.core.files.base import ContentFile
        self.batch.pdf_file.save(
            pdf_filename,
            ContentFile(pdf_content),
            save=True
        )
        
        return self.batch.pdf_file.url