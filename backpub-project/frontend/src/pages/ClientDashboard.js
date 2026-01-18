import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL, API_BASE_URL } from '../config/apiConfig';
import { debounce } from '../utils/debounce';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';
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
import {
  Package, TrendingUp, MapPin, Plus, Calendar, Users, Eye, Edit, Trash2, 
  Building2, DollarSign, Target, MessageSquare, CheckCircle, Clock, Truck, 
  Search, Filter, X, ArrowRight, ArrowLeft, LayoutDashboard, LogOut, 
  BarChart3, Mail, Phone, Globe, Building, CreditCard, User, Home, Menu, 
  Bell, Settings, Download, MoreVertical, Award, RefreshCw, ExternalLink,
  ChevronRight, UploadCloud, Shield, Megaphone, Rocket, ArrowUpRight,
  Printer, Share2, Loader2, AlertCircle, Info, Sparkles, Zap, Crown, 
  Palette, Hash, Tag, Smartphone, Briefcase, Globe as GlobeIcon, PhoneCall,
  EyeOff, TrendingDown, Users as UsersIcon, Send, CheckSquare,
  UserPlus, Printer as PrinterIcon, FileText, ShoppingBag, FileImage
} from 'lucide-react';

// --- COMPOSANTS UI ---
const SoftMeshBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-[#f8f5f2] via-yellow-50/30 to-orange-50/20">
    {/* Blobs animés kraft */}
    <motion.div 
      className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-yellow-300/20 to-orange-300/20 rounded-full blur-[120px]"
      animate={{
        scale: [1, 1.2, 1],
        x: [0, 50, 0],
        y: [0, 30, 0],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    <motion.div 
      className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-[#A67C52]/20 to-yellow-400/20 rounded-full blur-[120px]"
      animate={{
        scale: [1, 1.3, 1],
        x: [0, -40, 0],
        y: [0, -20, 0],
      }}
      transition={{
        duration: 25,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 2
      }}
    />
    <motion.div 
      className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-gradient-to-br from-orange-200/20 to-yellow-200/20 rounded-full blur-[100px]"
      animate={{
        scale: [1, 1.1, 1],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 30,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    {/* Texture kraft */}
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')] opacity-[0.03]" />
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]" />
  </div>
);

// CARTES DE CAMPAGNE - Optimisé avec React.memo
const CampaignCard = React.memo(({ campaign, onView, onEdit, onDelete, isAdmin = false, onAssign, onSendToPrint }) => {
  const getStatusColor = (status) => {
    const colors = {
      'CREATED': 'bg-blue-100 text-blue-700 border border-blue-200',
      'ASSIGNED_TO_PARTNER': 'bg-purple-100 text-purple-700 border border-purple-200',
      'SENT_TO_PRINT': 'bg-amber-100 text-amber-700 border border-amber-200',
      'IN_PRINTING': 'bg-amber-100 text-amber-700 border border-amber-200',
      'PRINTED': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      'IN_DISTRIBUTION': 'bg-purple-100 text-purple-700 border border-purple-200',
      'DELIVERED': 'bg-green-100 text-green-700 border border-green-200',
      'FINISHED': 'bg-slate-100 text-slate-700 border border-slate-200'
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border border-slate-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'CREATED': '📝',
      'ASSIGNED_TO_PARTNER': '👥',
      'SENT_TO_PRINT': '🖨️',
      'IN_PRINTING': '🖨️',
      'PRINTED': '✅',
      'IN_DISTRIBUTION': '🚚',
      'DELIVERED': '📦',
      'FINISHED': '🏁'
    };
    return icons[status] || '📄';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'CREATED': 'Créée',
      'ASSIGNED_TO_PARTNER': 'Attribuée',
      'SENT_TO_PRINT': 'Envoyée à l\'impression',
      'IN_PRINTING': 'En impression',
      'PRINTED': 'Imprimée',
      'IN_DISTRIBUTION': 'En distribution',
      'DELIVERED': 'Livrée',
      'FINISHED': 'Terminée'
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-[#A67C52]/30 hover:shadow-xl transition-all relative overflow-hidden group"
    >
      {/* Effet de brillance au survol */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/0 to-orange-50/0 group-hover:from-yellow-50/50 group-hover:to-orange-50/30 transition-all duration-300"></div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-[#A67C52] transition-colors">{campaign.name}</h3>
          <p className="text-sm text-slate-500">Commande #{campaign.order_number}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm ${getStatusColor(campaign.status)}`}>
          <span>{getStatusIcon(campaign.status)}</span>
          {getStatusLabel(campaign.status)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-3 border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Quantité</p>
          <p className="text-sm font-bold text-[#A67C52]">1 000 sacs</p>
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-3 border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Créée le</p>
          <p className="text-sm font-bold text-slate-900">{formatDate(campaign.created_at)}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-3 border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Zones</p>
          <p className="text-sm font-bold text-slate-900">
            {(() => {
              if (!campaign.postal_codes || !campaign.postal_codes.trim()) return '0 CP';
              const codes = campaign.postal_codes.toString().split(',').filter(c => c && c.trim());
              return codes.length > 0 ? `${codes.length} CP` : '0 CP';
            })()}
          </p>
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-3 border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Type</p>
          <p className="text-sm font-bold text-slate-900">
            {(() => {
              if (campaign.use_custom_card) {
                return '🎨 Design de votre carte';
              } else if (campaign.design || campaign.has_design) {
                return '🎨 Design personnalisé';
              } else {
                return '🎨 Design standard';
              }
            })()}
          </p>
        </div>
      </div>

      {/* Info partenaire */}
      {campaign.partner && (
        <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl border-2 border-purple-200 relative z-10 shadow-sm">
          <p className="text-xs text-purple-600 mb-1 font-medium">Partenaire attribué</p>
          <p className="text-sm font-bold text-purple-900">{campaign.partner.company_name || campaign.partner_details?.company_name}</p>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-slate-200 relative z-10">
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onView(campaign)}
            className="p-2.5 text-slate-600 hover:text-[#A67C52] hover:bg-yellow-50 rounded-xl transition-all shadow-sm hover:shadow-md"
            title="Voir les détails"
          >
            <Eye className="w-4 h-4" />
          </motion.button>
          {/* Boutons de modification et suppression uniquement pour les admins */}
          {isAdmin && (
            <>
              <motion.button
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEdit(campaign)}
                className="p-2.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all shadow-sm hover:shadow-md"
                title="Modifier"
              >
                <Edit className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(campaign.id)}
                className="p-2.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm hover:shadow-md"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </>
          )}
        </div>
        
        {/* Actions admin */}
        {isAdmin && (
          <div className="flex gap-2">
            {campaign.status === 'CREATED' && (
              <button
                onClick={() => onAssign(campaign)}
                className="px-3 py-1 bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white text-xs rounded-lg hover:from-[#A67C52]/90 hover:to-yellow-600/90 transition-colors flex items-center gap-1"
              >
                <UserPlus className="w-3 h-3" />
                Attribuer
              </button>
            )}
            {campaign.status === 'ASSIGNED_TO_PARTNER' && (
              <button
                onClick={() => onSendToPrint(campaign.id)}
                className="px-3 py-1 bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white text-xs rounded-lg hover:from-[#A67C52]/90 hover:to-yellow-600/90 transition-colors flex items-center gap-1"
              >
                <PrinterIcon className="w-3 h-3" />
                Envoyer print
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Comparaison personnalisée pour éviter les re-renders inutiles
  return prevProps.campaign.id === nextProps.campaign.id &&
         prevProps.campaign.status === nextProps.campaign.status &&
         prevProps.isAdmin === nextProps.isAdmin;
});

// MODAL DE DÉTAILS
const CampaignDetailsModal = ({ isOpen, onClose, campaign, details, loading }) => {
  const getStatusColor = (status) => {
    const colors = {
      'CREATED': 'bg-blue-100 text-blue-700 border border-blue-200',
      'ASSIGNED_TO_PARTNER': 'bg-purple-100 text-purple-700 border border-purple-200',
      'SENT_TO_PRINT': 'bg-amber-100 text-amber-700 border border-amber-200',
      'IN_PRINTING': 'bg-amber-100 text-amber-700 border border-amber-200',
      'PRINTED': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      'IN_DISTRIBUTION': 'bg-purple-100 text-purple-700 border border-purple-200',
      'DELIVERED': 'bg-green-100 text-green-700 border border-green-200',
      'FINISHED': 'bg-slate-100 text-slate-700 border border-slate-200'
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border border-slate-200';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non disponible';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const parseZipCodes = (zipCodesString) => {
    if (!zipCodesString) return [];
    return zipCodesString.split(',').map(code => code.trim()).filter(code => code);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{campaign?.name}</h2>
              <p className="text-slate-600">Commande #{campaign?.order_number}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : details ? (
            <div className="space-y-6">
              {/* Informations principales */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-xl p-5">
                  <h4 className="font-medium text-slate-700 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5" /> Informations générales
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Statut</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(details.status)}`}>
                        {details.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Quantité</span>
                      <span className="font-medium">{details.quantity?.toLocaleString()} sacs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Type</span>
                      <span className="font-medium">Design standard</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Créée le</span>
                      <span className="font-medium">{formatDate(details.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-5">
                  <h4 className="font-medium text-slate-700 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" /> Informations client
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Entreprise</span>
                      <span className="font-medium">
                        {details.client_details?.company_name || 
                         details.client_details?.username || 
                         details.client?.company_name || 
                         details.client?.username || 
                         campaign?.client_details?.company_name ||
                         '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Email</span>
                      {(() => {
                        const email = details.client_details?.email || 
                                     details.client?.email || 
                                     campaign?.client_details?.email ||
                                     details.design?.company_email;
                        return email ? (
                          <a href={`mailto:${email}`} className="font-medium text-[#A67C52] hover:text-yellow-600">
                            {email}
                          </a>
                        ) : (
                          <span className="font-medium">-</span>
                        );
                      })()}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Téléphone</span>
                      <span className="font-medium">
                        {details.client_details?.phone || 
                         details.client?.phone || 
                         campaign?.client_details?.phone ||
                         details.design?.company_phone ||
                         '-'}
                      </span>
                    </div>
                    {(details.partner || details.partner_details) && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Partenaire assigné</span>
                        <span className="font-medium text-purple-600">
                          {details.partner?.company_name || 
                           details.partner_details?.company_name || 
                           'Non spécifié'}
                        </span>
                      </div>
                    )}
                    {(details.partner || details.partner_details) && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl border-2 border-purple-200">
                        <p className="text-xs text-purple-600 mb-1 font-semibold">📦 Distribution</p>
                        <p className="text-sm text-purple-900">
                          Votre campagne est en cours d'impression et sera distribuée par{' '}
                          <strong>{details.partner?.company_name || details.partner_details?.company_name}</strong>
                          {details.partner?.phone || details.partner_details?.phone ? (
                            <span className="block mt-1 text-xs">
                              Contact: {details.partner?.phone || details.partner_details?.phone}
                            </span>
                          ) : null}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Codes postaux */}
              <div className="bg-slate-50 rounded-xl p-5">
                <h4 className="font-medium text-slate-700 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" /> Zones de distribution
                </h4>
                {details.postal_codes && details.postal_codes.trim() ? (
                  <div>
                    <p className="text-sm text-slate-600 mb-3">
                      {parseZipCodes(details.postal_codes).length} code{parseZipCodes(details.postal_codes).length > 1 ? 's' : ''} postal{parseZipCodes(details.postal_codes).length > 1 ? 's' : ''}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {parseZipCodes(details.postal_codes).map((code, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm font-medium"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500">Aucun code postal spécifié</p>
                )}
              </div>

              {/* Design */}
              {(details.design || details.use_custom_card) && (
                <div className="bg-slate-50 rounded-xl p-5">
                  <h4 className="font-medium text-slate-700 mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5" /> Design & Configuration
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {/* Template - seulement si pas de carte personnalisée */}
                      {!details.use_custom_card && details.design && (
                        <div>
                          <p className="text-sm text-slate-500 mb-2">Template</p>
                          {(() => {
                            const templateNum = parseInt(details.design.template?.split('_')[1] || '1');
                            const templateImage = templateImages[templateNum];
                            return (
                              <div>
                                <p className="font-medium mb-2">Template {templateNum}</p>
                                {templateImage && (
                                  <div className="w-full max-w-xs border-2 border-slate-200 rounded-lg overflow-hidden shadow-md">
                                    <img 
                                      src={templateImage} 
                                      alt={`Template ${templateNum}`}
                                      className="w-full h-auto object-cover"
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                      
                      {/* Carte personnalisée */}
                      {details.use_custom_card && (() => {
                        // Prioriser custom_card_url (URL absolue du serializer)
                        const customCardUrl = details.custom_card_url || 
                                             details.custom_card ||
                                             campaign?.custom_card_url ||
                                             campaign?.custom_card;
                        
                        // Construire l'URL complète si c'est un chemin relatif
                        let fullCustomCardUrl = null;
                        if (customCardUrl) {
                          if (customCardUrl.startsWith('http')) {
                            fullCustomCardUrl = customCardUrl;
                          } else {
                            fullCustomCardUrl = `${API_BASE_URL}${customCardUrl.startsWith('/') ? '' : '/'}${customCardUrl}`;
                          }
                        }
                        
                        return fullCustomCardUrl ? (
                          <div>
                            <p className="text-sm text-slate-500 mb-2">Carte de visite personnalisée</p>
                            <div className="w-full max-w-xs border-2 border-[#A67C52]/30 rounded-lg overflow-hidden shadow-md bg-white p-4">
                              <div className="flex flex-col items-center gap-3">
                                <FileImage className="w-16 h-16 text-[#A67C52]" />
                                <p className="font-semibold text-slate-900">Fichier uploadé</p>
                                <p className="text-sm text-slate-600 text-center">
                                  {typeof customCardUrl === 'string' ? customCardUrl.split('/').pop() : 'carte-personnalisee.pdf'}
                                </p>
                                <motion.a
                                  href={fullCustomCardUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="mt-2 px-6 py-3 bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                >
                                  <Download className="w-5 h-5" />
                                  Voir le fichier
                                </motion.a>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-slate-500 mb-2">Carte de visite personnalisée</p>
                            <div className="w-full max-w-xs border-2 border-slate-200 rounded-lg overflow-hidden shadow-md bg-white p-4">
                              <div className="flex flex-col items-center gap-3">
                                <FileImage className="w-16 h-16 text-slate-400" />
                                <p className="font-semibold text-slate-600">Fichier non disponible</p>
                                <p className="text-xs text-slate-500 text-center">
                                  Le fichier n'a pas pu être chargé
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      
                      {details.design && (
                        <>
                          <div>
                            <p className="text-sm text-slate-500 mb-1">Slogan</p>
                            <p className="font-medium">{details.design.slogan || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500 mb-1">Email de contact</p>
                            <p className="font-medium">{details.design.company_email || '-'}</p>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="space-y-4">
                      {details.design && (
                        <>
                          <div>
                            <p className="text-sm text-slate-500 mb-1">Téléphone</p>
                            <p className="font-medium">{details.design.company_phone || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500 mb-2">QR Code</p>
                            {(() => {
                          // Essayer plusieurs chemins possibles pour l'image QR code
                          // 1. qr_code_image_url (nouveau champ du serializer)
                          // 2. qr_code (chemin relatif de l'ImageField)
                          // 3. Construire l'URL si c'est un chemin relatif
                          let qrCodeImageUrl = null;
                          
                          if (details.design?.qr_code_image_url) {
                            qrCodeImageUrl = details.design.qr_code_image_url;
                          } else if (details.design?.qr_code) {
                            const qrCodePath = details.design.qr_code;
                            if (qrCodePath.startsWith('http')) {
                              qrCodeImageUrl = qrCodePath;
                            } else {
                              qrCodeImageUrl = `${API_BASE_URL}${qrCodePath}`;
                            }
                          }
                          
                          // Vérifier si le QR code existe (soit l'image, soit l'URL des données)
                          const hasQrCode = qrCodeImageUrl || details.design?.qr_code_url;
                          
                          if (hasQrCode && qrCodeImageUrl) {
                            return (
                              <div className="space-y-2">
                                <p className="font-medium text-emerald-600 flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4" />
                                  Généré
                                </p>
                                <div className="w-40 h-40 border-2 border-emerald-200 rounded-lg overflow-hidden bg-white p-3 shadow-md flex items-center justify-center">
                                  <img 
                                    src={qrCodeImageUrl} 
                                    alt="QR Code"
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      console.error('❌ Erreur chargement QR code:', qrCodeImageUrl);
                                      console.error('📦 Design data complète:', details.design);
                                      console.error('📦 Tous les chemins testés:', {
                                        qr_code_image_url: details.design?.qr_code_image_url,
                                        qr_code: details.design?.qr_code,
                                        qr_code_url: details.design?.qr_code_url
                                      });
                                      e.target.style.display = 'none';
                                    }}
                                    onLoad={() => {
                                      console.log('✅ QR code chargé avec succès:', qrCodeImageUrl);
                                    }}
                                  />
                                </div>
                                {details.design?.qr_code_url && (
                                  <p className="text-xs text-slate-500 mt-2">
                                    {details.design.qr_code_url.startsWith('mailto:') ? '📧 Email' : 
                                     details.design.qr_code_url.startsWith('https://wa.me') ? '💬 WhatsApp' : 
                                     '🔗 Lien'}
                                  </p>
                                )}
                              </div>
                            );
                          } else {
                            return (
                              <div className="space-y-2">
                                <p className="font-medium text-slate-600 flex items-center gap-2">
                                  <X className="w-4 h-4" />
                                  Non généré
                                </p>
                                <p className="text-xs text-slate-500">
                                  {details.design ? 
                                    'Le QR code n\'a pas pu être généré. Contactez le support.' : 
                                    'Le QR code sera généré après la création de la campagne'}
                                </p>
                              </div>
                            );
                          }
                        })()}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Demandes spéciales */}
              {details.special_request && (
                <div className="bg-slate-50 rounded-xl p-5">
                  <h4 className="font-medium text-slate-700 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" /> Instructions spéciales
                  </h4>
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <p className="text-slate-700 whitespace-pre-wrap">{details.special_request}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Impossible de charger les détails</h4>
              <p className="text-slate-600">Veuillez réessayer plus tard</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6">
          <div className="flex justify-end">
            <button 
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white rounded-xl font-medium hover:from-[#A67C52]/90 hover:to-yellow-600/90 transition-colors shadow-lg"
            >
              Fermer
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// MODAL POUR ATTRIBUER UN PARTENAIRE
const AssignPartnerModal = ({ isOpen, onClose, campaign, partners, onAssign }) => {
  const [selectedPartner, setSelectedPartner] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!selectedPartner) {
      alert('Veuillez sélectionner un partenaire');
      return;
    }

    setLoading(true);
    try {
      await onAssign(campaign.id, selectedPartner);
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'attribution');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">Attribuer un partenaire</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-slate-600 mb-4">
            Attribuer la campagne <strong>{campaign.name}</strong> à un partenaire
          </p>
          
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Sélectionner un partenaire
          </label>
          <select
            value={selectedPartner}
            onChange={(e) => setSelectedPartner(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choisir un partenaire...</option>
            {partners.map(partner => (
              <option key={partner.id} value={partner.id}>
                {partner.company_name} - {partner.city} ({partner.coverage_radius}km)
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-xl font-medium"
          >
            Annuler
          </button>
          <button
            onClick={handleAssign}
            disabled={loading || !selectedPartner}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white rounded-xl font-medium hover:from-[#A67C52]/90 hover:to-yellow-600/90 disabled:opacity-50 shadow-lg"
          >
            {loading ? 'Attribution...' : 'Attribuer'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// MODAL DE CONFIRMATION
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-600">{message}</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-xl font-medium transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-medium hover:from-orange-600/90 hover:to-red-600/90 transition-colors shadow-lg"
          >
            Confirmer
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// COMPOSANT DE STATISTIQUES
const StatCard = ({ title, value, icon: Icon, color = 'blue', loading = false }) => {
  const colorMap = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      border: 'border-blue-200',
      text: 'text-blue-700'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100/50',
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      border: 'border-purple-200',
      text: 'text-purple-700'
    },
    amber: {
      bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      iconBg: 'bg-gradient-to-br from-yellow-500 to-orange-500',
      border: 'border-yellow-200',
      text: 'text-yellow-700'
    },
    emerald: {
      bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600',
      border: 'border-emerald-200',
      text: 'text-emerald-700'
    }
  };
  
  const colors = colorMap[color] || colorMap.blue;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`bg-white rounded-2xl p-6 border-2 ${colors.border} shadow-md hover:shadow-xl transition-all relative overflow-hidden`}
    >
      {/* Effet de brillance */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-2xl"></div>
      
      <div className="flex justify-between items-start relative z-10">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
          {loading ? (
            <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse"></div>
          ) : (
            <p className={`text-4xl font-bold ${colors.text} mb-1`}>{value}</p>
          )}
        </div>
        <motion.div 
          className={`p-4 rounded-xl ${colors.iconBg} shadow-lg`}
          whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          <Icon className="w-7 h-7 text-white" />
        </motion.div>
      </div>
      
      {/* Barre décorative en bas */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${colors.iconBg} rounded-b-2xl`}></div>
    </motion.div>
  );
};

// ==========================================
// COMPOSANT PRINCIPAL CLIENTDASHBOARD
// ==========================================

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [campaignDetails, setCampaignDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Debounce pour les recherches - évite trop d'updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // États pour admin
  const [partners, setPartners] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [campaignToAssign, setCampaignToAssign] = useState(null);

  useEffect(() => {
    fetchCampaigns();
    fetchStats();
    
    if (user?.role === 'admin') {
      fetchPartners();
    }
  }, [user]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const endpoint = user?.role === 'admin' 
        ? `${API_URL}/admin/campaigns/`
        : `${API_URL}/client/campaigns/`;
      
      const response = await axios.get(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (user?.role === 'admin') {
        // Pour admin, combiner toutes les campagnes
        const allCampaigns = [
          ...(response.data.unassigned_campaigns || []),
          ...(response.data.assigned_not_sent || []),
          ...(response.data.recent_campaigns || [])
        ];
        // Filtrer les doublons
        const uniqueCampaigns = Array.from(new Map(allCampaigns.map(c => [c.id, c])).values());
        setCampaigns(uniqueCampaigns);
      } else {
        // Pour client - filtrer les doublons par ID
        const campaignsList = response.data.campaigns || [];
        const uniqueCampaigns = Array.from(
          new Map(campaignsList.map(c => [c.id || c.order_number, c])).values()
        );
        setCampaigns(uniqueCampaigns);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des campagnes:', error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/dashboard/stats/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        total_campaigns: 0,
        active_campaigns: 0,
        total_revenue: 0
      });
    }
  };

  const fetchPartners = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/partners/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPartners(response.data);
    } catch (error) {
      console.error('Erreur chargement partenaires:', error);
      setPartners([]);
    }
  };

  const fetchCampaignDetails = async (campaignId) => {
    setDetailsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/campaigns/${campaignId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('📦 Détails campagne reçus:', response.data);
      setCampaignDetails(response.data);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des détails:', error);
      console.error('❌ Détails erreur:', error.response?.data);
      setCampaignDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteCampaign = async (id) => {
    try {
      const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/campaigns/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCampaigns(campaigns.filter(c => c.id !== id));
      setDeleteConfirm(null);
      alert('Campagne supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la campagne.');
    }
  };

  const handleAssignPartner = async (campaignId, partnerId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/admin/campaigns/${campaignId}/assign-partner/`,
        { partner_id: partnerId },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Rafraîchir les campagnes
      fetchCampaigns();
      alert('Partenaire attribué avec succès');
    } catch (error) {
      console.error('Erreur attribution partenaire:', error);
      throw error;
    }
  };

  const handleSendToPrint = async (campaignId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/admin/campaigns/${campaignId}/send-to-print/`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Rafraîchir les campagnes
      fetchCampaigns();
      alert('Campagne envoyée à l\'impression');
    } catch (error) {
      console.error('Erreur envoi impression:', error);
      alert('Erreur lors de l\'envoi à l\'impression');
    }
  };

  const viewCampaignDetails = async (campaign) => {
    setSelectedCampaign(campaign);
    setShowDetailsModal(true);
    await fetchCampaignDetails(campaign.id);
  };

  const handleEditCampaign = (campaign) => {
    // Les clients ne peuvent pas modifier leurs campagnes
    if (user?.role !== 'admin') {
      alert('Vous ne pouvez pas modifier une campagne après sa création.');
      return;
    }
    navigate(`/client/campaign/edit/${campaign.id}`);
  };

  const handleCreateCampaign = () => {
    navigate('/client/campaign/new');
  };

  const handleOpenAssignModal = (campaign) => {
    setCampaignToAssign(campaign);
    setShowAssignModal(true);
  };

  // Calcul des statistiques - Optimisé avec useMemo
  const totalCampagnes = useMemo(() => stats.total_campaigns || campaigns.length, [stats.total_campaigns, campaigns.length]);
  
  const campagnesActives = useMemo(() => 
    campaigns.filter(c => 
      ['CREATED', 'ASSIGNED_TO_PARTNER', 'SENT_TO_PRINT', 'IN_PRINTING'].includes(c.status)
    ).length,
    [campaigns]
  );
  
  const totalSacs = useMemo(() => campaigns.length * 1000, [campaigns.length]);
  
  const campagnesEnAttente = useMemo(() => 
    campaigns.filter(c => c.status === 'CREATED').length,
    [campaigns]
  );
  
  // Campagnes filtrées - Optimisé avec useMemo
  const filteredCampaigns = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return campaigns;
    const search = debouncedSearchTerm.toLowerCase();
    return campaigns.filter(c => 
      c.name?.toLowerCase().includes(search) ||
      c.order_number?.toLowerCase().includes(search)
    );
  }, [campaigns, debouncedSearchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f5f2] via-yellow-50/20 to-orange-50/10 font-sans">
      <SoftMeshBackground />
      
      {/* NAVBAR */}
      <motion.nav 
        initial={{ y: -100 }} 
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="flex items-center">
                <img src={logo} alt="BagPub Logo" className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 object-contain" />
              </div>

              <div className="hidden md:flex items-center gap-1">
                {[
                  { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
                  { id: 'campagnes', icon: Target, label: 'Mes Campagnes' },
                  { id: 'profile', icon: User, label: 'Profil' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                      activeTab === item.id 
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Boutons client */}
              {user?.role === 'client' && (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={handleCreateCampaign}
                    className="px-3 sm:px-4 py-2 bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white rounded-xl font-medium hover:from-[#A67C52]/90 hover:to-yellow-600/90 transition-colors flex items-center gap-2 shadow-lg text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Nouvelle campagne</span>
                    <span className="sm:hidden">Nouvelle</span>
                  </button>
                </div>
              )}
              
              {/* Menu hamburger mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6 text-slate-700" /> : <Menu className="w-6 h-6 text-slate-700" />}
              </button>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">
                    {user?.company_name || user?.username || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {user?.role === 'admin' ? 'Administrateur' : 
                     user?.role === 'partner' ? 'Partenaire' : 'Client'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#A67C52] to-yellow-600 flex items-center justify-center text-white font-bold shadow-md">
                  {(user?.company_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/')}
                  className="p-2.5 bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white rounded-xl font-medium hover:from-[#A67C52]/90 hover:to-yellow-600/90 transition-all shadow-lg hover:shadow-xl"
                  title="Retour à l'accueil"
                >
                  <Home className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="p-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl"
                  title="Déconnexion"
                >
                  <LogOut className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Menu mobile */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-sm"
            >
              <div className="px-4 py-4 space-y-2">
                {[
                  { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
                  { id: 'campagnes', icon: Target, label: 'Mes Campagnes' },
                  { id: 'profile', icon: User, label: 'Profil' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                      activeTab === item.id 
                        ? 'bg-slate-900 text-white shadow-lg' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
                {user?.role === 'client' && (
                  <button
                    onClick={() => {
                      handleCreateCampaign();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white rounded-xl font-medium hover:from-[#A67C52]/90 hover:to-yellow-600/90 transition-colors shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Nouvelle campagne</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* CONTENU PRINCIPAL */}
      <div className="pt-24 sm:pt-28 md:pt-36 px-4 sm:px-6 pb-8 sm:pb-12 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            // TABLEAU DE BORD
            <div className="space-y-8">
              {/* En-tête */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#A67C52]/20 shadow-lg mb-6"
              >
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-[#A67C52] to-yellow-600 bg-clip-text text-transparent mb-2">
                    {user?.role === 'admin' ? 'Tableau de bord Admin' : `Bonjour, ${user?.company_name || user?.username || 'Utilisateur'}`}
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 font-medium">
                    {user?.role === 'admin' 
                      ? 'Gérez les campagnes et les partenaires' 
                      : 'Bienvenue sur votre tableau de bord BagPub'}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchCampaigns}
                    disabled={loading}
                    className="px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">{loading ? 'Chargement...' : 'Rafraîchir'}</span>
                    <span className="sm:hidden">{loading ? '...' : '↻'}</span>
                  </motion.button>
                </div>
              </motion.div>

              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Campagnes totales" 
                  value={totalCampagnes} 
                  icon={Target} 
                  color="blue"
                  loading={loading}
                />
                <StatCard 
                  title={user?.role === 'admin' ? 'En attente' : 'Actives'} 
                  value={user?.role === 'admin' ? campagnesEnAttente : campagnesActives} 
                  icon={Clock} 
                  color="amber"
                  loading={loading}
                />
                <StatCard 
                  title={user?.role === 'admin' ? 'Partenaires' : 'En impression'} 
                  value={user?.role === 'admin' ? partners.length : campaigns.filter(c => c.status === 'IN_PRINTING').length} 
                  icon={user?.role === 'admin' ? UsersIcon : Printer} 
                  color="purple"
                  loading={loading}
                />
                <StatCard 
                  title="Terminées" 
                  value={campaigns.filter(c => c.status === 'FINISHED').length} 
                  icon={CheckCircle} 
                  color="emerald"
                  loading={loading}
                />
              </div>

              {/* Campagnes récentes */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-[#A67C52]/20 shadow-xl overflow-hidden"
              >
                <div className="p-6 border-b-2 border-[#A67C52]/10 bg-gradient-to-r from-[#A67C52]/5 to-yellow-50/50">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-[#A67C52] to-yellow-600 bg-clip-text text-transparent">
                      {user?.role === 'admin' ? 'Campagnes récentes' : 'Mes campagnes récentes'}
                    </h2>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Rechercher une campagne..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20 bg-white shadow-sm transition-all"
                        />
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2.5 text-slate-600 hover:text-[#A67C52] hover:bg-yellow-50 rounded-xl transition-all shadow-sm hover:shadow-md"
                      >
                        <Filter className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : campaigns.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {filteredCampaigns
                        .slice(0, 4)
                        .map(campaign => (
                          <CampaignCard
                            key={campaign.id}
                            campaign={campaign}
                            onView={viewCampaignDetails}
                            onEdit={user?.role === 'admin' ? handleEditCampaign : () => {}}
                            onDelete={user?.role === 'admin' ? ((id) => setDeleteConfirm({ id, name: campaign.name })) : () => {}}
                            onAssign={() => handleOpenAssignModal(campaign)}
                            onSendToPrint={handleSendToPrint}
                            isAdmin={user?.role === 'admin'}
                          />
                        ))}
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-16 bg-gradient-to-br from-yellow-50/50 to-orange-50/30 rounded-xl border-2 border-[#A67C52]/20"
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-[#A67C52] to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Target className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Aucune campagne</h3>
                      <p className="text-slate-600 mb-6 font-medium">Commencez par créer votre première campagne</p>
                      {user?.role === 'client' && (
                        <div className="flex gap-3 justify-center">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCreateCampaign}
                            className="px-8 py-3.5 bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-[#A67C52]/90 hover:to-yellow-600/90 transition-all"
                          >
                            Créer une campagne
                          </motion.button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                {campaigns.length > 0 && (
                  <div className="p-6 border-t-2 border-[#A67C52]/10 bg-gradient-to-r from-[#A67C52]/5 to-yellow-50/50">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab('campagnes')}
                      className="w-full py-3.5 bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white font-semibold flex items-center justify-center gap-2 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      Voir toutes les campagnes <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </div>
          ) : activeTab === 'campagnes' ? (
            // TOUTES LES CAMPAGNES
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#A67C52]/20 shadow-lg"
              >
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-[#A67C52] to-yellow-600 bg-clip-text text-transparent mb-2">
                    {user?.role === 'admin' ? 'Toutes les campagnes' : 'Mes Campagnes'}
                  </h1>
                  <p className="text-slate-600 font-medium">
                    {user?.role === 'admin' 
                      ? 'Gérez toutes les campagnes du système' 
                      : 'Gérez et suivez toutes vos campagnes publicitaires'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <motion.button 
                    whileHover={{ scale: 1.05, rotate: 180 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchCampaigns}
                    disabled={loading}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Rafraîchir
                  </motion.button>
                  
                  {user?.role === 'client' && (
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCreateCampaign}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white rounded-xl font-semibold hover:from-[#A67C52]/90 hover:to-yellow-600/90 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        <Plus className="w-5 h-5" />
                        Nouvelle campagne
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Filtres et recherche */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-[#A67C52]/20 shadow-xl p-4 sm:p-6"
              >
                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="relative flex-1 md:w-64">
                      <Search className="w-4 h-4 text-[#A67C52] absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Rechercher une campagne..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20 bg-white shadow-sm transition-all"
                      />
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2.5 text-slate-600 hover:text-[#A67C52] hover:bg-yellow-50 rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                      <Filter className="w-5 h-5" />
                    </motion.button>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#A67C52] to-yellow-600 rounded-xl shadow-md hover:shadow-lg"
                    >
                      Toutes
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 shadow-sm"
                    >
                      En attente
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 shadow-sm"
                    >
                      En cours
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 shadow-sm"
                    >
                      Terminées
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Liste des campagnes */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-[#A67C52]/20 shadow-xl overflow-hidden"
              >
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-[#A67C52] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : campaigns.length > 0 ? (
                  <div className="divide-y divide-slate-200/50">
                    {filteredCampaigns
                      .map(campaign => (
                        <motion.div 
                          key={campaign.id} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          whileHover={{ scale: 1.01, x: 4 }}
                          className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-slate-200 hover:border-[#A67C52]/30 hover:shadow-lg transition-all"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#A67C52]/20 to-yellow-100 rounded-xl flex items-center justify-center shrink-0">
                                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#A67C52]" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">{campaign.name}</h3>
                                <p className="text-xs sm:text-sm text-slate-600">#{campaign.order_number}</p>
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
                                  <span className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 font-semibold shadow-sm">
                                    1 000 sacs
                                  </span>
                                  <span className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border border-yellow-300 font-semibold shadow-sm">
                                    {(() => {
                                      if (campaign.use_custom_card) {
                                        return '🎨 Design de votre carte';
                                      } else if (campaign.design || campaign.has_design) {
                                        return '🎨 Design personnalisé';
                                      } else {
                                        return '🎨 Design standard';
                                      }
                                    })()}
                                  </span>
                                  {campaign.partner && (
                                    <span className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-300 font-semibold shadow-sm">
                                      👥 {campaign.partner.company_name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Status sur mobile - au-dessus des boutons */}
                            <div className="sm:hidden pb-3 border-b border-slate-100">
                              <div className="flex items-center justify-between">
                                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getStatusColor(campaign.status)}`}>
                                  {campaign.status === 'CREATED' ? 'Créée' :
                                   campaign.status === 'ASSIGNED_TO_PARTNER' ? 'Attribuée' :
                                   campaign.status === 'SENT_TO_PRINT' ? 'Envoyée print' :
                                   campaign.status === 'IN_PRINTING' ? 'En impression' :
                                   campaign.status === 'PRINTED' ? 'Imprimée' :
                                   campaign.status === 'IN_DISTRIBUTION' ? 'En distribution' :
                                   campaign.status === 'DELIVERED' ? 'Livrée' : 'Terminée'}
                                </span>
                                <span className="text-xs text-slate-600">
                                  {(() => {
                                    if (!campaign.postal_codes) return '0 codes';
                                    const codes = campaign.postal_codes.toString().split(',').filter(c => c && c.trim());
                                    return codes.length > 0 ? `${codes.length} codes` : '0 codes';
                                  })()}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6">
                              <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-slate-900">
                                  {campaign.status === 'CREATED' ? 'Créée' :
                                   campaign.status === 'ASSIGNED_TO_PARTNER' ? 'Attribuée' :
                                   campaign.status === 'SENT_TO_PRINT' ? 'Envoyée print' :
                                   campaign.status === 'IN_PRINTING' ? 'En impression' :
                                   campaign.status === 'PRINTED' ? 'Imprimée' :
                                   campaign.status === 'IN_DISTRIBUTION' ? 'En distribution' :
                                   campaign.status === 'DELIVERED' ? 'Livrée' : 'Terminée'}
                                </p>
                                <p className="text-sm text-slate-600">
                                  {(() => {
                                    if (!campaign.postal_codes) return '0 codes postaux';
                                    const codes = campaign.postal_codes.toString().split(',').filter(c => c && c.trim());
                                    return codes.length > 0 ? `${codes.length} codes postaux` : '0 codes postaux';
                                  })()}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => viewCampaignDetails(campaign)}
                                  className="p-2.5 text-slate-600 hover:text-[#A67C52] hover:bg-yellow-50 rounded-xl transition-all shadow-sm hover:shadow-md"
                                  title="Voir détails"
                                >
                                  <Eye className="w-4 h-4" />
                                </motion.button>
                                {user?.role === 'admin' && (
                                  <>
                                    <button
                                      onClick={() => handleEditCampaign(campaign)}
                                      className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                      title="Modifier"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    {campaign.status === 'CREATED' && (
                                      <button
                                        onClick={() => handleOpenAssignModal(campaign)}
                                        className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                        title="Attribuer partenaire"
                                      >
                                        <UserPlus className="w-4 h-4" />
                                      </button>
                                    )}
                                    {campaign.status === 'ASSIGNED_TO_PARTNER' && (
                                      <button
                                        onClick={() => handleSendToPrint(campaign.id)}
                                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Envoyer à l'impression"
                                      >
                                        <PrinterIcon className="w-4 h-4" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => setDeleteConfirm({ id: campaign.id, name: campaign.name })}
                                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Supprimer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 bg-gradient-to-br from-yellow-50/50 to-orange-50/30 rounded-xl border-2 border-[#A67C52]/20 m-6"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-[#A67C52] to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Target className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Aucune campagne trouvée</h3>
                    <p className="text-slate-600 mb-6 font-medium">Commencez par créer votre première campagne</p>
                    {user?.role === 'client' && (
                      <div className="flex gap-3 justify-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCreateCampaign}
                          className="px-8 py-3.5 bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-[#A67C52]/90 hover:to-yellow-600/90 transition-all"
                        >
                          Créer une campagne
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </div>
          ) : activeTab === 'profile' ? (
            // PROFIL
            <div className="max-w-4xl mx-auto pt-8">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                {/* Header profil */}
                <div className="bg-gradient-to-r from-[#A67C52] via-yellow-600 to-orange-600 p-8 text-white relative overflow-hidden">
                  {/* Effet de texture */}
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')]"></div>
                  <div className="relative z-10 flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40 flex items-center justify-center text-3xl font-bold shadow-xl">
                      {(user?.company_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold mb-2 drop-shadow-lg">
                        {user?.company_name || user?.username || 'Utilisateur'}
                      </h1>
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4" />
                        <p className="text-yellow-50">{user?.email || ''}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30">
                          {user?.role === 'admin' ? '👑 Administrateur' : 
                           user?.role === 'partner' ? '🤝 Partenaire' : '👤 Client'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenu profil */}
                <div className="p-8 bg-gradient-to-br from-[#f8f5f2] to-white">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <User className="w-6 h-6 text-[#A67C52]" />
                        Informations personnelles
                      </h2>
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                          <label className="block text-sm font-medium text-slate-500 mb-2">Entreprise</label>
                          <div className="text-lg font-semibold text-slate-900">
                            {user?.company_name || '-'}
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                          <label className="block text-sm font-medium text-slate-500 mb-2">Email</label>
                          <div className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-[#A67C52]" />
                            {user?.email || '-'}
                          </div>
                        </div>
                        {user?.address && (
                          <div className="bg-white rounded-xl p-4 border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <label className="block text-sm font-medium text-slate-500 mb-2">Adresse</label>
                            <div className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-[#A67C52]" />
                              {user.address}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-[#A67C52]" />
                        Statistiques du compte
                      </h2>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-6 bg-gradient-to-br from-[#A67C52]/10 to-yellow-50 rounded-xl border-2 border-[#A67C52]/20 shadow-md">
                          <div>
                            <p className="text-sm text-slate-600 mb-1">Campagnes totales</p>
                            <p className="text-3xl font-bold text-[#A67C52]">{campaigns.length}</p>
                          </div>
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#A67C52] to-yellow-600 flex items-center justify-center shadow-lg">
                            <Target className="w-7 h-7 text-white" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200 shadow-md">
                          <div>
                            <p className="text-sm text-slate-600 mb-1">Sacs commandés</p>
                            <p className="text-3xl font-bold text-yellow-700">{totalSacs.toLocaleString()}</p>
                          </div>
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                            <Package className="w-7 h-7 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* MODALS */}
      <CampaignDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        campaign={selectedCampaign}
        details={campaignDetails}
        loading={detailsLoading}
      />

      <AssignPartnerModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        campaign={campaignToAssign}
        partners={partners}
        onAssign={handleAssignPartner}
      />

      <ConfirmationModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDeleteCampaign(deleteConfirm?.id)}
        title="Supprimer la campagne"
        message={`Êtes-vous sûr de vouloir supprimer la campagne "${deleteConfirm?.name}" ? Cette action est irréversible.`}
      />

      {/* FOOTER */}
      <footer className="mt-16 pt-12 pb-8 bg-gradient-to-b from-slate-50 to-white border-t-2 border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Logo et description */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <img src={logo} alt="BagPub Logo" className="w-16 h-16 object-contain" />
              </div>
              <p className="text-sm text-slate-600 max-w-xs">
                La plateforme innovante de cartes de visite sur sacs craft. Marketing local efficace et écologique.
              </p>
            </div>
            
            {/* Liens rapides */}
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Liens rapides</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-slate-600 hover:text-[#A67C52] transition-colors">
                    Conditions d'utilisation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-600 hover:text-[#A67C52] transition-colors">
                    Politique de confidentialité
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-600 hover:text-[#A67C52] transition-colors">
                    Support
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-600 hover:text-[#A67C52] transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>contact@bagpub.fr</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+33 1 XX XX XX XX</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-500">
                © {new Date().getFullYear()} BagPub. Tous droits réservés.
              </p>

            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClientDashboard;