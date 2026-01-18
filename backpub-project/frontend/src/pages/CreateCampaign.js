import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/apiConfig';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';
import KraftBackground from '../components/KraftBackground';
import { 
  FileImage, UploadCloud, CheckCircle, ArrowLeft, Palette, 
  Globe, MessageCircle, X, Loader, Image as ImageIcon,
  Download, Eye, Type, Layout, QrCode,
  Smartphone, Mail, MapPin, Hash, MessageSquare, ExternalLink,
  ChevronLeft, ChevronRight, Search, Building2, Package, 
  Calendar, Euro, Package2, CheckCircle2, Rocket, ArrowRight
} from 'lucide-react';

// Imports des images depuis src/assets/
import template1 from '../assets/1.jpg';
import template2 from '../assets/2.jpg';
import template3 from '../assets/3.jpg';
import template4 from '../assets/4.jpg';
import template5 from '../assets/5.jpg';

// Mapping des templates vers leurs images
const templateImages = {
  1: template1,
  2: template2,
  3: template3,
  4: template4,
  5: template5,
};


// Composant pour le mode Template
const TemplateMode = ({ formData, setFormData, templates, loading }) => {
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
  const templatesPerView = 3; // Afficher 3 templates à la fois

  const TemplateCard = ({ template, isSelected, onClick }) => {
    const templateNumber = parseInt(template.id.split('_')[1]);
    // Récupérer l'image depuis le mapping
    const imageSrc = templateImages[templateNumber];

    return (
      <div 
        onClick={() => !loading && onClick(template.id)}
        className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${
          isSelected 
            ? 'ring-4 ring-blue-500 ring-offset-2 scale-[1.02] shadow-2xl' 
            : 'hover:scale-[1.02] hover:shadow-xl'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="aspect-[85/54] relative bg-gray-100">
          {/* Image du template */}
          {imageSrc ? (
            <img 
              src={imageSrc}
              alt={`Template ${templateNumber}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error(`Erreur chargement image template ${templateNumber}:`, e);
                // Remplacer par un placeholder en cas d'erreur
                const placeholder = e.target.parentElement;
                placeholder.className = 'aspect-[85/54] relative bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center';
                placeholder.innerHTML = `
                  <div class="text-center">
                    <div class="text-4xl font-bold text-gray-400 mb-2">${templateNumber}</div>
                    <div class="text-sm text-gray-500">Template ${templateNumber}</div>
                    <div class="text-xs text-gray-400 mt-1">Image non trouvée</div>
                  </div>
                `;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-400 mb-2">{templateNumber}</div>
                <div className="text-sm text-gray-500">Template {templateNumber}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {templateNumber <= 5 
                    ? `Import manquant pour ${templateNumber}.jpg`
                    : `Image ${templateNumber}.jpg manquante`}
                </div>
              </div>
            </div>
          )}
          
          {/* Overlay pour sélection */}
          {isSelected && (
            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center border-4 border-blue-500">
              <div className="bg-white rounded-full p-3 shadow-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          )}
        </div>
        
        {/* Badge de template */}
        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full font-bold">
          T{templateNumber.toString().padStart(2, '0')}
        </div>
      </div>
    );
  };

  const maxIndex = Math.max(0, templates.length - templatesPerView);
  
  const handlePrevious = () => {
    setCurrentTemplateIndex(prev => Math.max(0, prev - 1));
  };
  
  const handleNext = () => {
    setCurrentTemplateIndex(prev => Math.min(maxIndex, prev + 1));
  };
  
  const visibleTemplates = templates.slice(
    currentTemplateIndex,
    currentTemplateIndex + templatesPerView
  );

  return (
    <div className="space-y-8">
      {/* Carrousel de Templates */}
      <div>
        <div className="mb-6 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Choisissez votre template</h3>
          <p className="text-gray-600">
            {currentTemplateIndex + 1}-{Math.min(currentTemplateIndex + templatesPerView, templates.length)} sur {templates.length} templates
          </p>
        </div>
        
        {/* Carrousel */}
        <div className="relative">
          {/* Bouton Précédent */}
          {templates.length > templatesPerView && (
            <button
              onClick={handlePrevious}
              disabled={currentTemplateIndex === 0 || loading}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-xl border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all ${
                currentTemplateIndex === 0 || loading ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'
              }`}
              aria-label="Template précédent"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
          )}
          
          {/* Container des templates */}
          <div className={`flex justify-center gap-6 ${templates.length > templatesPerView ? 'px-16' : 'px-4'} overflow-hidden`}>
            {visibleTemplates.map((template) => (
              <div key={template.id} className="flex-shrink-0 w-full max-w-[280px] animate-fade-in">
                <TemplateCard
                  template={template}
                  isSelected={formData.template === template.id}
                  onClick={(templateId) => setFormData(prev => ({ ...prev, template: templateId }))}
                />
                <div className="text-center mt-3">
                  <p className="text-sm font-semibold text-gray-900">Template {template.id.split('_')[1]}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Bouton Suivant */}
          {templates.length > templatesPerView && (
            <button
              onClick={handleNext}
              disabled={currentTemplateIndex >= maxIndex || loading}
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-xl border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all ${
                currentTemplateIndex >= maxIndex || loading ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'
              }`}
              aria-label="Template suivant"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          )}
        </div>
        
        {/* Indicateurs de pagination */}
        {templates.length > templatesPerView && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: Math.ceil(templates.length / templatesPerView) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTemplateIndex(index * templatesPerView)}
                className={`h-2 rounded-full transition-all ${
                  Math.floor(currentTemplateIndex / templatesPerView) === index
                    ? 'w-8 bg-blue-500'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Page ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Section Logo - Simplifiée */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-1">Logo (optionnel)</h4>
          <p className="text-sm text-gray-600">Ajoutez le logo de votre entreprise</p>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors bg-white">
              <input
                type="file"
                name="logo"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const preview = URL.createObjectURL(file);
                    setFormData(prev => ({
                      ...prev,
                      logo: file,
                      logoPreview: preview
                    }));
                  }
                }}
                accept="image/*"
                className="hidden"
                id="logo-upload"
                disabled={loading}
              />
              <label htmlFor="logo-upload" className={`cursor-pointer ${loading ? 'cursor-not-allowed opacity-50' : ''}`}>
                {formData.logoPreview ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img 
                        src={formData.logoPreview} 
                        alt="Logo preview" 
                        className="w-48 h-48 object-contain rounded-xl shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, logo: null, logoPreview: null }));
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-900 font-medium">Logo ajouté ✓</p>
                      <p className="text-sm text-gray-500">Cliquez pour changer</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                      <UploadCloud className="w-12 h-12 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg mb-1">Ajouter un logo</p>
                      <p className="text-gray-600">PNG, JPG, SVG • Max 5MB</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Recommandé : Format carré, fond transparent
                      </p>
                    </div>
                  </div>
                )}
          </label>
        </div>
      </div>

      {/* Section QR Code - Simplifiée */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-1">QR Code</h4>
          <p className="text-sm text-gray-600">Que se passe-t-il quand on scanne le QR Code ?</p>
        </div>
        
        <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option WhatsApp */}
                <label className={`flex flex-col p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                  formData.qr_option === 'whatsapp' 
                    ? 'border-green-500 bg-green-50 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <input
                      type="radio"
                      name="qr_option"
                      value="whatsapp"
                      checked={formData.qr_option === 'whatsapp'}
                      onChange={(e) => !loading && setFormData(prev => ({ ...prev, qr_option: e.target.value }))}
                      className="w-5 h-5 text-green-600"
                      disabled={loading}
                    />
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <MessageSquare className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">WhatsApp</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Lance un message WhatsApp pré-rempli
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {formData.qr_option === 'whatsapp' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Numéro WhatsApp <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="whatsapp_phone"
                          value={formData.whatsapp_phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_phone: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="06 12 34 56 78"
                          required
                          disabled={loading}
                        />
                        <div className="text-xs text-gray-500 mt-2">
                          Format international : +33 6 12 34 56 78
                        </div>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">Message pré-rempli :</div>
                        <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                          Bonjour {formData.company_name || '[Nom entreprise]'}, je vous contacte via votre carte de visite...
                        </div>
                      </div>
                    </div>
                  )}
                </label>
                
                {/* Option Site web */}
                <label className={`flex flex-col p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                  formData.qr_option === 'website' 
                    ? 'border-blue-500 bg-blue-50 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <input
                      type="radio"
                      name="qr_option"
                      value="website"
                      checked={formData.qr_option === 'website'}
                      onChange={(e) => !loading && setFormData(prev => ({ ...prev, qr_option: e.target.value }))}
                      className="w-5 h-5 text-blue-600"
                      disabled={loading}
                    />
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <ExternalLink className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">Site web</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Redirige vers votre site ou page spécifique
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {formData.qr_option === 'website' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL du site web <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        name="website_url"
                        value={formData.website_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://www.votre-entreprise.com"
                        required
                        disabled={loading}
                      />
                      <div className="text-xs text-gray-500 mt-2">
                        Commencez par https:// pour une meilleure compatibilité
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>
      </div>
    </div>
  );
};

// Composant pour le mode Carte Personnalisée
const CustomCardMode = ({ formData, setFormData, loading }) => {
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simuler une progression d'upload
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            const preview = URL.createObjectURL(file);
            setFormData(prevData => ({
              ...prevData,
              custom_card: file,
              custom_card_preview: preview
            }));
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  };

  return (
    <div className="space-y-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Votre carte personnalisée</h3>
          <p className="text-gray-600">
            Téléchargez votre fichier de carte de visite prêt à imprimer
          </p>
        </div>
        
        {/* Zone d'upload */}
        <div className="border-3 border-dashed border-gray-300 rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center hover:border-blue-500 transition-colors bg-gradient-to-br from-gray-50 to-white">
          <input
            type="file"
            onChange={handleFileUpload}
            accept=".pdf,.ai,.eps,.psd,.jpg,.jpeg,.png"
            className="hidden"
            id="custom-card-upload"
            disabled={loading || uploadProgress > 0}
          />
          <label 
            htmlFor="custom-card-upload" 
            className={`cursor-pointer ${loading || uploadProgress > 0 ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {formData.custom_card_preview ? (
              <div className="space-y-6">
                <div className="relative inline-block">
                  <div className="w-64 h-40 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl shadow-2xl flex items-center justify-center">
                    <div className="text-center">
                      <FileImage className="w-16 h-16 text-blue-600 mx-auto mb-3" />
                      <div className="text-blue-800 font-bold">Carte personnalisée</div>
                      <div className="text-blue-700 text-sm mt-1">
                        {formData.custom_card?.name || 'fichier-uploadé.pdf'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData(prev => ({ 
                        ...prev, 
                        custom_card: null, 
                        custom_card_preview: null 
                      }));
                      setUploadProgress(0);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-center">
                  <p className="text-gray-900 font-bold text-lg mb-1">✅ Carte téléchargée</p>
                  <p className="text-gray-600">Cliquez pour changer de fichier</p>
                </div>
              </div>
            ) : uploadProgress > 0 ? (
              <div className="space-y-6">
                <div className="w-24 h-24 mx-auto relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-2" />
                      <div className="text-lg font-bold text-gray-900">{uploadProgress}%</div>
                    </div>
                  </div>
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="8"
                      strokeDasharray={`${uploadProgress * 2.83} 283`}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg mb-1">Téléchargement en cours...</p>
                  <p className="text-gray-600">Veuillez patienter</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
                  <UploadCloud className="w-16 h-16 text-gray-400" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-2xl mb-2">Déposez votre fichier</p>
                  <p className="text-gray-600 mb-4">
                    ou cliquez pour parcourir
                  </p>
                  <div className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl">
                    <Download className="w-4 h-4" />
                    <span className="font-medium">Choisir un fichier</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Formats acceptés : PDF, AI, EPS, PSD, JPG, PNG</p>
                  <p>Taille maximale : 20 MB</p>
                  <p>Résolution recommandée : 300 DPI</p>
                </div>
              </div>
            )}
          </label>
        </div>
        
        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-100">
          <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Instructions pour votre fichier
          </h4>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Dimensions : 85 x 54 mm (format carte de visite standard)</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Marge de sécurité : 3 mm de chaque côté</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Couleurs : CMJN pour l'impression</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Résolution : 300 DPI minimum</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Fond perdu : 3 mm supplémentaires tout autour</span>
            </li>
          </ul>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <a href="/guides/creation-carte.pdf" target="_blank" rel="noopener noreferrer" 
               className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium">
              <Download className="w-4 h-4" />
              Télécharger le guide complet (PDF)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant Info (utilisé dans CustomCardMode)
const Info = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CreateCampaign = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [campaignCreated, setCampaignCreated] = useState(false);
  const [campaignData, setCampaignData] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [mode, setMode] = useState(null); // null, 'template' ou 'custom' - null signifie que le choix n'a pas encore été fait
  const [communeResults, setCommuneResults] = useState([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  
  // Référence pour éviter les doubles soumissions
  const isSubmittingRef = useRef(false);
  
  // Codes postaux de Normandie (14, 27, 50, 61, 76)
  const normandieDepartements = ['14', '27', '50', '61', '76'];
  
  const isNormandiePostalCode = (code) => {
    if (code.length !== 5 || !/^\d+$/.test(code)) return false;
    const dept = code.substring(0, 2);
    return normandieDepartements.includes(dept);
  };
  
  const [formData, setFormData] = useState({
    // Informations entreprise
    company_name: user?.company_name || '',
    slogan: '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    postal_code: '',
    
    // Campagne - Toujours 1000 sacs
    quantity: 1000,
    postalCodes: [],
    currentPostalCode: '',
    special_instructions: '',
    
    // Recherche de commune Normandie
    communeSearch: '',
    selectedCommune: null,
    
    // Mode Template
    template: 'template_1',
    logo: null,
    logoPreview: null,
    
    // QR Code
    qr_option: 'whatsapp',
    website_url: '',
    whatsapp_phone: user?.phone || '',
    
    // Mode Custom
    custom_card: null,
    custom_card_preview: null,
    use_custom_card: false,
  });
  
  // Templates disponibles
  const templates = Array.from({ length: 20 }, (_, i) => ({
    id: `template_${i + 1}`,
    name: `Template ${i + 1}`,
    description: 'Design professionnel',
  }));

  const calculatePrice = () => {
    let price = 0;
    const basePricePer1000 = 129; // Prix fixe à 129€ pour 1000 sacs
    // Toujours 1000 sacs
    price = (1000 / 1000) * basePricePer1000;
    
    setTotalPrice(price);
    return price;
  };

  useEffect(() => {
    calculatePrice();
  }, [formData.quantity, mode]);

  // Recherche de communes de Normandie via l'API Géo française
  const searchCommunes = async (searchTerm) => {
    if (searchTerm.length < 2) {
      setCommuneResults([]);
      return;
    }
    
    setLoadingCommunes(true);
    try {
      // Recherche dans les départements de Normandie
      const responses = await Promise.all(
        normandieDepartements.map(dept =>
          fetch(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(searchTerm)}&codeDepartement=${dept}&fields=nom,code,codesPostaux&limit=5`)
            .then(res => res.json())
            .catch(() => [])
        )
      );
      
      const allResults = responses.flat();
      // Dédupliquer par code commune
      const uniqueResults = Array.from(
        new Map(allResults.map(commune => [commune.code, commune])).values()
      );
      setCommuneResults(uniqueResults.slice(0, 10));
    } catch (error) {
      console.error('Erreur recherche communes:', error);
      setCommuneResults([]);
    } finally {
      setLoadingCommunes(false);
    }
  };
  
  // Ajouter les codes postaux d'une commune sélectionnée
  const handleSelectCommune = (commune) => {
    if (commune.codesPostaux && commune.codesPostaux.length > 0) {
      const newCodes = commune.codesPostaux.filter(code => 
        isNormandiePostalCode(code) && !formData.postalCodes.includes(code)
      );
      
      if (newCodes.length > 0) {
        setFormData(prev => ({
          ...prev,
          postalCodes: [...prev.postalCodes, ...newCodes],
          selectedCommune: commune,
          communeSearch: '' // Vider le champ après sélection
        }));
        setCommuneResults([]);
      }
    }
  };
  
  const handleAddPostalCode = () => {
    const code = formData.currentPostalCode.trim();
    
    if (code.length === 5 && /^\d+$/.test(code)) {
      if (!isNormandiePostalCode(code)) {
        alert('⚠️ Seuls les codes postaux de Normandie sont acceptés (14xxx, 27xxx, 50xxx, 61xxx, 76xxx)');
        return;
      }
      
      if (!formData.postalCodes.includes(code)) {
        setFormData(prev => ({
          ...prev,
          postalCodes: [...prev.postalCodes, code],
          currentPostalCode: ''
        }));
      } else {
        alert('Ce code postal est déjà ajouté');
      }
    } else {
      alert('Veuillez entrer un code postal valide (5 chiffres)');
    }
  };
  
  // Debounce pour la recherche de communes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.communeSearch) {
        searchCommunes(formData.communeSearch);
      } else {
        setCommuneResults([]);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [formData.communeSearch]);

  const handleRemovePostalCode = (codeToRemove) => {
    setFormData(prev => ({
      ...prev,
      postalCodes: prev.postalCodes.filter(code => code !== codeToRemove)
    }));
  };

  const validateStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return formData.company_name && formData.phone && formData.email && formData.postal_code;
      case 2:
        return formData.postalCodes.length >= 5 &&
               formData.postalCodes.length >= 5;
      case 3:
        if (mode === 'template') {
          // Validation pour le mode template
          if (formData.qr_option === 'website') {
            return formData.website_url.trim() !== '';
          } else if (formData.qr_option === 'whatsapp') {
            return formData.whatsapp_phone.trim() !== '';
          }
          return true;
        } else {
          // Validation pour le mode custom
          return formData.custom_card !== null;
        }
      default:
        return true;
    }
  };

  const handleNext = () => {
    // Protection contre les doubles clics
    if (loading) {
      return;
    }
    
    if (!validateStep(step)) {
      let errorMessage = 'Veuillez remplir tous les champs obligatoires';
      
      if (step === 2 && formData.postalCodes.length < 5) {
        errorMessage = 'Minimum 5 codes postaux requis';
      } else if (step === 3) {
        if (!mode) {
          errorMessage = 'Veuillez choisir un mode de design';
        } else if (mode === 'template') {
          if (formData.qr_option === 'website' && !formData.website_url) {
            errorMessage = 'Veuillez saisir l\'URL de votre site web';
          } else if (formData.qr_option === 'whatsapp' && !formData.whatsapp_phone) {
            errorMessage = 'Veuillez saisir votre numéro WhatsApp';
          }
        } else if (mode === 'custom' && !formData.custom_card) {
          errorMessage = 'Veuillez télécharger votre carte personnalisée';
        }
      }
      
      alert(errorMessage);
      return;
    }
    
    if (step === 3) {
      handleSubmit();
    } else {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    // Protection contre les doubles soumissions avec useRef
    if (isSubmittingRef.current || loading) {
      console.warn('Tentative de double soumission ignorée');
      return;
    }
    
    isSubmittingRef.current = true;
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vous devez être connecté');
        navigate('/login');
        return;
      }
      
      const currentYear = new Date().getFullYear();
      const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const campaignName = `${formData.company_name} - Campagne ${currentYear} ${randomSuffix}`;
      
      const postalCodesString = formData.postalCodes.join(',');
      
      const formDataToSend = new FormData();
      
      // Campagne data
      formDataToSend.append('name', campaignName);
      formDataToSend.append('postal_codes', postalCodesString);
      formDataToSend.append('quantity', 1000); // Toujours 1000 sacs
      formDataToSend.append('special_instructions', formData.special_instructions || '');
      formDataToSend.append('estimated_price', totalPrice.toFixed(2));
      formDataToSend.append('faces', 1); // Toujours 1 face maintenant
      formDataToSend.append('use_custom_card', mode === 'custom');
      
      // Mode Template
      if (mode === 'template') {
        const designData = {
          slogan: formData.slogan,
          company_email: formData.email,
          company_phone: formData.phone,
          company_address: formData.address,
          company_postal_code: formData.postal_code,
          template: formData.template,
          contact_method: formData.qr_option === 'whatsapp' ? 'whatsapp' : 'email',
          website_url: formData.website_url || '',
          whatsapp_phone: formData.whatsapp_phone || '',
        };
        
        formDataToSend.append('design', JSON.stringify(designData));
        
        // Logo
        if (formData.logo) {
          formDataToSend.append('logo', formData.logo);
        }
      }
      
      // Mode Custom
      if (mode === 'custom' && formData.custom_card) {
        formDataToSend.append('custom_card', formData.custom_card);
        // Envoyer aussi les infos de contact (téléphone et email) même pour custom_card
        const customCardData = {
          company_email: formData.email,
          company_phone: formData.phone,
        };
        formDataToSend.append('design', JSON.stringify(customCardData));
      }
      
      const response = await axios.post(
        `${API_URL}/campaigns/create-complete/`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          timeout: 60000
        }
      );
      
      if (response.data.success || response.data.campaign) {
        const data = response.data.campaign || response.data;
        setCampaignData(data);
        setCampaignCreated(true);
      }
      
    } catch (error) {
      console.error('Erreur:', error);
      alert(`❌ Erreur lors de la création de la campagne: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // Écran de succès - Design Kraft captivant
  if (campaignCreated && campaignData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f5f2] via-yellow-50/20 to-orange-50/10 relative overflow-hidden">
        <KraftBackground />
        
        <div className="relative z-10 container mx-auto px-4 py-12 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border-2 border-[#A67C52]/20"
          >
            {/* Header animé avec dégradé kraft */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="bg-gradient-to-r from-[#A67C52] via-[#F59E0B] to-[#EAB308] p-8 md:p-12 text-white relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-[shimmer_3s_infinite]" />
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/30 shadow-xl"
                    >
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </motion.div>
                    <div>
                      <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-3xl md:text-4xl font-extrabold mb-2 drop-shadow-lg"
                      >
                        🎉 Campagne créée avec succès !
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-white/90 text-lg font-medium"
                      >
                        Votre commande est maintenant enregistrée
                      </motion.p>
                    </div>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border-2 border-white/30"
                  >
                    <div className="text-sm font-medium text-white/80 mb-1">N° Commande</div>
                    <div className="text-2xl font-bold text-white">{campaignData.order_number}</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Récapitulatif détaillé */}
            <div className="p-8 md:p-12">
              {/* Message de succès */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-center mb-10"
              >
                <p className="text-xl text-slate-700 font-medium mb-2">
                  {mode === 'custom' ? '📄 Carte personnalisée' : '🎨 Template'} créée avec succès !
                </p>
                <p className="text-slate-600">
                  Votre campagne a été enregistrée et sera traitée par notre équipe sous peu.
                </p>
              </motion.div>

              {/* Grille de récapitulatif */}
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                {/* Informations principales */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-gradient-to-br from-[#f8f5f2] to-white p-6 rounded-2xl border-2 border-[#A67C52]/20 shadow-lg"
                >
                  <h3 className="text-xl font-bold text-[#A67C52] mb-4 flex items-center gap-2">
                    <Package2 className="w-6 h-6" />
                    Détails de la commande
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-[#A67C52]/10">
                      <span className="text-slate-600 font-medium">Nom de la campagne</span>
                      <span className="text-slate-900 font-bold">{campaignData.name || formData.company_name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#A67C52]/10">
                      <span className="text-slate-600 font-medium">Quantité</span>
                      <span className="text-slate-900 font-bold">{campaignData.quantity || 1000} sacs</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#A67C52]/10">
                      <span className="text-slate-600 font-medium">Prix fixe</span>
                      <span className="text-[#A67C52] font-bold text-xl">129€</span>
                    </div>
                    {campaignData.estimated_price && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-600 font-medium">Prix estimé</span>
                        <span className="text-slate-900 font-bold">{parseFloat(campaignData.estimated_price).toFixed(2)}€</span>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Zones de distribution */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                  className="bg-gradient-to-br from-yellow-50/50 to-orange-50/30 p-6 rounded-2xl border-2 border-yellow-200/50 shadow-lg"
                >
                  <h3 className="text-xl font-bold text-[#A67C52] mb-4 flex items-center gap-2">
                    <MapPin className="w-6 h-6" />
                    Zones de distribution
                  </h3>
                  {(campaignData.postal_codes || formData.postalCodes.length > 0) ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {(campaignData.postal_codes ? String(campaignData.postal_codes).split(',') : formData.postalCodes)
                          .slice(0, 6)
                          .map((code, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-[#A67C52] text-white rounded-lg font-semibold text-sm shadow-md"
                          >
                            {String(code).trim()}
                          </span>
                        ))}
                        {(campaignData.postal_codes ? String(campaignData.postal_codes).split(',').length : formData.postalCodes.length) > 6 && (
                          <span className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm">
                            +{(campaignData.postal_codes ? String(campaignData.postal_codes).split(',').length : formData.postalCodes.length) - 6}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-3">
                        Total : <strong>{campaignData.postal_codes ? String(campaignData.postal_codes).split(',').length : formData.postalCodes.length}</strong> code{(campaignData.postal_codes ? String(campaignData.postal_codes).split(',').length : formData.postalCodes.length) > 1 ? 's' : ''} postal{(campaignData.postal_codes ? String(campaignData.postal_codes).split(',').length : formData.postalCodes.length) > 1 ? 'aux' : ''}
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-600">Codes postaux en cours de traitement...</p>
                  )}
                </motion.div>
              </div>

              {/* Prochaines étapes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl border-2 border-emerald-200 mb-10"
              >
                <h3 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                  <Rocket className="w-6 h-6" />
                  Prochaines étapes
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { icon: '📋', text: 'Examen de votre commande par notre équipe' },
                    { icon: '🤝', text: 'Attribution d\'un partenaire pour la distribution' },
                    { icon: '🖨️', text: 'Mise en impression de vos cartes' },
                    { icon: '🚚', text: 'Distribution dans les zones sélectionnées' },
                  ].map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.1 + idx * 0.1 }}
                      className="flex items-center gap-3 text-slate-700"
                    >
                      <div className="text-2xl">{step.icon}</div>
                      <span className="font-medium">{step.text}</span>
                    </motion.div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-emerald-800 font-medium">
                  ✉️ Vous recevrez un email à chaque étape pour suivre l'avancement de votre commande.
                </p>
              </motion.div>

              {/* Boutons d'action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-[#A67C52]/20"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/client/dashboard')}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-[#A67C52] to-[#F59E0B] hover:from-[#F59E0B] hover:to-[#EAB308] text-white font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 text-lg"
                >
                  <ArrowRight className="w-5 h-5" />
                  Retour au tableau de bord
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCampaignCreated(false);
                    setStep(1);
                    setFormData({
                      company_name: user?.company_name || '',
                      slogan: '',
                      phone: user?.phone || '',
                      email: user?.email || '',
                      address: '',
                      postal_code: '',
                      quantity: 1000,
                      postalCodes: [],
                      currentPostalCode: '',
                      communeSearch: '',
                      selectedCommune: null,
                      special_instructions: '',
                      template: 'template_1',
                      logo: null,
                      logoPreview: null,
                      qr_option: 'whatsapp',
                      website_url: '',
                      whatsapp_phone: user?.phone || '',
                      custom_card: null,
                      custom_card_preview: null,
                      use_custom_card: false,
                    });
                  }}
                  className="flex-1 px-8 py-4 bg-white border-2 border-[#A67C52]/30 hover:border-[#A67C52] hover:bg-[#A67C52]/5 text-[#A67C52] font-bold rounded-xl transition-all flex items-center justify-center gap-3 text-lg shadow-md"
                >
                  <FileImage className="w-5 h-5" />
                  Créer une nouvelle campagne
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%) skewX(-12deg); }
            100% { transform: translateX(200%) skewX(-12deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f5f2] via-yellow-50/20 to-orange-50/10 relative">
      <KraftBackground />
      
      {/* Header */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b-2 border-[#A67C52]/20 shadow-lg"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <img src={logo} alt="BagPub Logo" className="w-16 h-16 object-contain" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#A67C52] to-yellow-600 bg-clip-text text-transparent">Créer une campagne</h1>
                <p className="text-slate-600 text-sm mt-0.5">
                  Bonjour, <span className="font-semibold text-[#A67C52]">{user?.company_name || user?.username}</span>
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/client/dashboard')}
                className="px-4 py-2.5 bg-white border-2 border-[#A67C52]/30 hover:border-[#A67C52] text-[#A67C52] rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="w-4 h-4" />
                Tableau de bord
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <div className="pt-8 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border-2 border-[#A67C52]/20"
          >
            {/* Header du formulaire */}
            <div className="bg-gradient-to-r from-[#A67C52] via-yellow-600 to-orange-600 p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')] opacity-10"></div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2 drop-shadow-lg">Nouvelle Campagne</h2>
                  <p className="text-yellow-50">
                    {step === 1 && 'Informations de votre entreprise'}
                    {step === 2 && 'Quantité et zones de distribution'}
                    {step === 3 && !mode && 'Choisissez votre mode de design'}
                    {step === 3 && mode === 'template' && 'Design de vos cartes'}
                    {step === 3 && mode === 'custom' && 'Votre carte personnalisée'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Progress Steps */}
            <div className="px-8 pt-8 pb-4 bg-gradient-to-r from-[#A67C52]/5 to-yellow-50/50">
              <div className="flex justify-between relative">
                <div className="absolute top-5 left-0 right-0 h-1 bg-gradient-to-r from-[#A67C52]/20 via-yellow-200/50 to-[#A67C52]/20 -z-10"></div>
                
                {[1, 2, 3].map((stepNumber) => (
                  <motion.div 
                    key={stepNumber} 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center relative z-10"
                  >
                    <motion.div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-2 shadow-lg ${
                        stepNumber === step 
                          ? 'bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white ring-4 ring-yellow-200' 
                          : stepNumber < step 
                            ? 'bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white' 
                            : 'bg-slate-200 text-slate-600'
                      }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {stepNumber < step ? <CheckCircle className="w-6 h-6" /> : stepNumber}
                    </motion.div>
                    <span className={`text-sm font-semibold ${
                      stepNumber === step ? 'text-[#A67C52]' : 'text-slate-600'
                    }`}>
                      {stepNumber === 1 && 'Informations'}
                      {stepNumber === 2 && 'Zones'}
                      {stepNumber === 3 && 'Design'}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Form Content */}
            <div className="p-8" key="form-content">
              {/* Step 1: Informations */}
              {step === 1 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#A67C52] to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-[#A67C52] to-yellow-600 bg-clip-text text-transparent">Informations de votre entreprise</h2>
                      <p className="text-slate-600 mt-1">Remplissez vos coordonnées pour vos cartes de visite</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Nom de l'entreprise <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="company_name"
                        value={formData.company_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                        className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all bg-white shadow-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Slogan
                      </label>
                      <input
                        type="text"
                        name="slogan"
                        value={formData.slogan}
                        onChange={(e) => setFormData(prev => ({ ...prev, slogan: e.target.value }))}
                        className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all bg-white shadow-sm"
                        placeholder="Votre slogan professionnel"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Téléphone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all bg-white shadow-sm"
                        required
                        placeholder="01 23 45 67 89"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all bg-white shadow-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Adresse
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all bg-white shadow-sm"
                        placeholder="123 Avenue des Champs-Élysées"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Code postal <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                        maxLength="5"
                        className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all bg-white shadow-sm"
                        required
                        placeholder="75001"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Step 2: Zones de distribution */}
              {step === 2 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Package className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-[#A67C52] to-yellow-600 bg-clip-text text-transparent">Zones de distribution</h2>
                      <p className="text-slate-600 mt-1">Sélectionnez vos zones cibles (1000 sacs)</p>
                    </div>
                  </div>
                  
                  {/* Affichage fixe de la quantité */}
                  <div className="bg-gradient-to-br from-[#A67C52]/10 to-yellow-50/50 rounded-2xl p-6 border-2 border-[#A67C52]/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-lg font-bold text-slate-900 mb-2">
                          Nombre de sacs
                        </label>
                        <p className="text-slate-600">Quantité fixe pour toutes les campagnes</p>
                      </div>
                      <div className="text-right">
                        <span className="block text-4xl font-bold text-[#A67C52]">1 000</span>
                        <span className="block text-sm text-slate-600 mt-1">sacs</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Saisie des codes postaux - Simplifiée */}
                  <div className="bg-gradient-to-br from-yellow-50/50 to-orange-50/30 rounded-2xl p-6 border-2 border-[#A67C52]/20">
                    <label className="block text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#A67C52]" />
                      Zones de distribution <span className="text-red-500">*</span>
                      <span className="text-sm font-normal text-slate-600">(Minimum 5 codes postaux - Normandie uniquement)</span>
                    </label>
                    
                    {/* Recherche par ville - Mise en avant */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Search className="w-5 h-5 text-[#A67C52]" />
                        <span className="font-semibold text-slate-900">Rechercher par ville (recommandé)</span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.communeSearch}
                          onChange={(e) => setFormData(prev => ({ ...prev, communeSearch: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && communeResults.length > 0) {
                              e.preventDefault();
                              handleSelectCommune(communeResults[0]);
                            }
                          }}
                          placeholder="Tapez le nom d'une ville (ex: Caen, Rouen, Le Havre, Cherbourg...)"
                          className="w-full px-5 py-4 pl-12 border-2 border-[#A67C52]/30 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all bg-white shadow-sm text-lg"
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A67C52]" />
                        {loadingCommunes && (
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#A67C52] border-t-transparent"></div>
                          </div>
                        )}
                        {communeResults.length > 0 && (
                          <div className="absolute z-20 w-full mt-2 bg-white border-2 border-[#A67C52]/30 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                            {communeResults.map((commune) => (
                              <motion.button
                                key={commune.code}
                                type="button"
                                onClick={() => handleSelectCommune(commune)}
                                whileHover={{ backgroundColor: '#fef3c7' }}
                                className="w-full px-5 py-4 text-left hover:bg-yellow-50 transition-colors border-b border-slate-100 last:border-b-0"
                              >
                                <div className="flex items-center gap-3">
                                  <Building2 className="w-5 h-5 text-[#A67C52]" />
                                  <div>
                                    <div className="font-semibold text-slate-900">{commune.nom}</div>
                                    <div className="text-sm text-slate-600 mt-1">
                                      {commune.codesPostaux?.length || 0} code{commune.codesPostaux?.length > 1 ? 's' : ''} postal{commune.codesPostaux?.length > 1 ? 'aux' : ''} : {commune.codesPostaux?.slice(0, 3).join(', ')}{commune.codesPostaux?.length > 3 ? '...' : ''}
                                    </div>
                                  </div>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </div>
                      {formData.selectedCommune && (
                        <div className="mt-3 p-3 bg-[#A67C52]/10 rounded-lg border border-[#A67C52]/20">
                          <p className="text-sm text-slate-700">
                            <span className="font-semibold">Ville sélectionnée :</span> {formData.selectedCommune.nom} 
                            ({formData.selectedCommune.codesPostaux?.length || 0} code{formData.selectedCommune.codesPostaux?.length > 1 ? 's' : ''} postal{formData.selectedCommune.codesPostaux?.length > 1 ? 'aux' : ''} ajouté{formData.selectedCommune.codesPostaux?.length > 1 ? 's' : ''})
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Saisie manuelle - Option secondaire */}
                    <div className="mb-4 p-4 bg-white/60 rounded-xl border border-slate-200">
                      <div className="text-sm font-medium text-slate-600 mb-3">Ou saisir un code postal manuellement :</div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="currentPostalCode"
                          value={formData.currentPostalCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, currentPostalCode: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddPostalCode()}
                          maxLength="5"
                          placeholder="Ex: 14000"
                          className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all"
                        />
                        <motion.button
                          type="button"
                          onClick={handleAddPostalCode}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-3 bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white rounded-xl hover:from-[#A67C52]/90 hover:to-yellow-600/90 transition-all font-semibold shadow-lg"
                        >
                          + Ajouter
                        </motion.button>
                      </div>
                    </div>
                    
                    {/* Liste des codes postaux ajoutés - Améliorée */}
                    <div className="min-h-[120px] border-2 border-slate-200 rounded-xl p-5 bg-white/80">
                      {formData.postalCodes.length === 0 ? (
                        <div className="text-center py-8">
                          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-500 font-medium">Aucun code postal ajouté</p>
                          <p className="text-sm text-slate-400 mt-1">Recherchez une ville ou ajoutez un code postal</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {formData.postalCodes.map((code, index) => (
                              <motion.div 
                                key={index} 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex items-center bg-gradient-to-r from-[#A67C52]/10 to-yellow-50 border-2 border-[#A67C52]/30 rounded-lg px-4 py-2.5 shadow-sm"
                              >
                                <span className="font-mono font-bold text-[#A67C52] text-lg">{code}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemovePostalCode(code)}
                                  className="ml-3 text-slate-400 hover:text-red-600 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Compteur et validation - Amélioré */}
                    <div className="mt-4 flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${formData.postalCodes.length >= 5 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm font-semibold text-slate-700">
                          {formData.postalCodes.length} / 5 codes postaux
                        </span>
                      </div>
                      <div className="text-sm font-bold">
                        {formData.postalCodes.length >= 5 ? 
                          <span className="text-green-600 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Valide
                          </span> : 
                          <span className="text-red-600">
                            Minimum 5 requis
                          </span>
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/80 rounded-xl p-6 border-2 border-slate-200">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Instructions spéciales (optionnel)
                    </label>
                    <textarea
                      name="special_instructions"
                      value={formData.special_instructions}
                      onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all"
                      placeholder="Précisions sur la distribution, livraison, particularités..."
                    />
                  </div>
                </motion.div>
              )}
              
              {/* Step 3: Choix du mode puis Design ou Upload */}
              {step === 3 && (
                <>
                  {!mode ? (
                    // Écran de choix du mode
                    <div className="space-y-8">
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 mb-3">Comment souhaitez-vous créer votre carte ?</h2>
                        <p className="text-slate-600 text-lg">Choisissez la méthode qui vous convient le mieux</p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {/* Option Template */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          whileHover={{ scale: 1.02, y: -4 }}
                          onClick={() => setMode('template')}
                          className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-[#A67C52] cursor-pointer transition-all shadow-lg hover:shadow-xl relative overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-[#A67C52]/5 to-yellow-50/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="relative z-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#A67C52] to-yellow-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                              <Palette className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Utiliser nos templates</h3>
                            <p className="text-slate-600 mb-4">Choisissez parmi nos designs professionnels prêts à l'emploi</p>
                            <ul className="space-y-2 text-sm text-slate-600">
                              <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-[#A67C52]" />
                                Designs professionnels
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-[#A67C52]" />
                                Personnalisation facile
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-[#A67C52]" />
                                Rapide et efficace
                              </li>
                            </ul>
                          </div>
                        </motion.div>
                        
                        {/* Option Custom */}
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          whileHover={{ scale: 1.02, y: -4 }}
                          onClick={() => setMode('custom')}
                          className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-[#A67C52] cursor-pointer transition-all shadow-lg hover:shadow-xl relative overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/30 to-orange-50/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="relative z-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                              <UploadCloud className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Uploader ma carte</h3>
                            <p className="text-slate-600 mb-4">Téléchargez votre propre design de carte de visite</p>
                            <ul className="space-y-2 text-sm text-slate-600">
                              <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-yellow-600" />
                                Design personnalisé
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-yellow-600" />
                                Contrôle total
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-yellow-600" />
                                Format JPG, PNG, PDF
                              </li>
                            </ul>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  ) : (
                    // Mode Template ou Custom sélectionné
                    <>
                      {mode === 'template' ? (
                        <TemplateMode 
                          formData={formData} 
                          setFormData={setFormData} 
                          templates={templates}
                          loading={loading}
                        />
                      ) : (
                        <CustomCardMode 
                          formData={formData} 
                          setFormData={setFormData} 
                          loading={loading}
                        />
                      )}
                    </>
                  )}
                </>
              )}
              
              {/* Navigation */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 mt-8 border-t-2 border-[#A67C52]/10 bg-gradient-to-r from-[#A67C52]/5 to-yellow-50/30 -mx-8 px-8 pb-8">
                {step > 1 && (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (step === 3 && mode) {
                        setMode(null);
                      }
                      setStep(step - 1);
                    }}
                    className="px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-[#A67C52] transition-all flex items-center gap-2 shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                  </motion.button>
                )}
                
                <div className="flex-1"></div>
                
                <div className="flex flex-col items-end bg-white/80 rounded-xl p-4 border-2 border-[#A67C52]/20 shadow-md">
                  <div className="text-sm text-slate-600 font-medium">Total estimé</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-[#A67C52] to-yellow-600 bg-clip-text text-transparent">{totalPrice.toFixed(2)} €</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {mode === 'custom' && 'incl. supp. carte personnalisée'}
                  </div>
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext} 
                  disabled={loading || (step === 3 && !mode)}
                  className={`px-8 py-4 font-semibold rounded-xl transition-all flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                    'bg-gradient-to-r from-[#A67C52] to-yellow-600 hover:from-[#A67C52]/90 hover:to-yellow-600/90 text-white'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Traitement...
                    </>
                  ) : step === 3 && !mode ? (
                    'Choisir un mode'
                  ) : step === 3 ? (
                    mode === 'template' ? '🚀 Créer avec template' : '🚀 Créer avec ma carte'
                  ) : (
                    'Continuer →'
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;