import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';
import template1 from '../assets/1.jpg';
import template2 from '../assets/2.jpg';
import template3 from '../assets/3.jpg';
import template4 from '../assets/4.jpg';
import template5 from '../assets/5.jpg';
import {
  Send, RefreshCw, Users, Building2, ShoppingBag, Printer, Eye,
  Plus, TrendingUp, MapPin, Euro, BarChart3, PieChart, X,
  CheckCircle, AlertCircle, Loader2, LogOut, Home, Crown,
  User, Palette, MessageSquare, Download, FileImage, Filter, Search, Calendar
} from 'lucide-react';

// Mapping des templates vers leurs images
const templateImages = {
  1: template1,
  2: template2,
  3: template3,
  4: template4,
  5: template5,
};
import {
  LineChart, Line, BarChart as ReBarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { API_URL, API_BASE_URL } from '../config/apiConfig';

const API_BASE = API_URL;
const COLORS = ['#A67C52', '#F59E0B', '#F97316', '#EAB308', '#D97706', '#B45309'];

// Background Kraft
const KraftBackground = () => (
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

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  
  // Données
  const [campaigns, setCampaigns] = useState([]);
  const [clients, setClients] = useState([]);
  const [partners, setPartners] = useState([]);
  const [analytics, setAnalytics] = useState({});
  
  // Sélection
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  
  // Notifications
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  // Modals
  const [openCampaignModal, setOpenCampaignModal] = useState(false);
  const [openPartnerModal, setOpenPartnerModal] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [openAssignPartnerModal, setOpenAssignPartnerModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailsType, setDetailsType] = useState(null);
  const [campaignDetails, setCampaignDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  // Filtre par code postal
  const [postalCodeFilter, setPostalCodeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [commonPostalCodes, setCommonPostalCodes] = useState([]);
  
  // Debounce pour les recherches
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Formulaires
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    postal_codes: '',
    client_email: '',
    create_client: false,
    client_company_name: '',
    client_phone: '',
    client_address: '',
    client_city: '',
    client_postal_code: '',
    estimated_price: '',
    faces: 1,
    use_custom_card: false
  });
  
  const [partnerForm, setPartnerForm] = useState({
    company_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: ''
  });
  
  // Statistiques
  const [stats, setStats] = useState({
    total_campaigns: 0,
    total_clients: 0,
    total_partners: 0,
    unassigned_campaigns: 0,
    campaigns_in_printing: 0,
    total_revenue: 0
  });
  
  // Analytics détaillées
  const [analyticsData, setAnalyticsData] = useState({
    revenue: { total: 0, today: 0, this_month: 0, this_year: 0 },
    revenue_by_month: [],
    revenue_by_day: [],
    revenue_by_year: [],
    campaigns_by_status: [],
    campaigns_by_postal_code: [],
    partner_distribution: [],
    quantity: { total: 0, distributed: 0, remaining: 0 },
    top_clients: []
  });

  // Charger les données
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [campaignsRes, clientsRes, partnersRes, statsRes, analyticsRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/admin/campaigns/`, { headers }).catch(() => ({ data: { campaigns: [] } })),
        axios.get(`${API_BASE}/admin/clients/`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/partners/`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/dashboard/stats/`, { headers }).catch(() => ({ data: {} })),
        axios.get(`${API_BASE}/admin/analytics/`, { headers }).catch(() => ({ data: {} }))
      ]);

      const campaignsData = campaignsRes.status === 'fulfilled' ? campaignsRes.value.data : { campaigns: [] };
      const clientsData = clientsRes.status === 'fulfilled' ? clientsRes.value.data : [];
      const partnersResponse = partnersRes.status === 'fulfilled' ? partnersRes.value.data : null;
      const statsData = statsRes.status === 'fulfilled' ? statsRes.value.data : {};
      const analyticsDataRes = analyticsRes.status === 'fulfilled' ? analyticsRes.value.data : {};

      // S'assurer que partnersData est un tableau
      // DRF ViewSet peut retourner { results: [...] } avec pagination ou directement [...]
      let partnersData = [];
      if (partnersResponse) {
        if (Array.isArray(partnersResponse)) {
          partnersData = partnersResponse;
        } else if (partnersResponse.results && Array.isArray(partnersResponse.results)) {
          // Format paginé DRF
          partnersData = partnersResponse.results;
        } else if (partnersResponse.partners && Array.isArray(partnersResponse.partners)) {
          partnersData = partnersResponse.partners;
        } else if (partnersResponse.data && Array.isArray(partnersResponse.data)) {
          partnersData = partnersResponse.data;
        } else {
          // Débogage : afficher la structure pour comprendre
          console.log('🔍 Partners response structure:', partnersResponse);
          console.log('🔍 Partners response type:', typeof partnersResponse);
        }
      }
      
      // Débogage
      console.log('📊 Partners data:', partnersData);
      console.log('📊 Partners count:', partnersData.length);

      setCampaigns(campaignsData.campaigns || campaignsData || []);
      setClients(Array.isArray(clientsData) ? clientsData : []);
      setPartners(Array.isArray(partnersData) ? partnersData : []);
      setStats({
        total_campaigns: statsData.total_campaigns || campaignsData.stats?.total_campaigns || 0,
        total_clients: statsData.total_clients || clientsData.length || 0,
        total_partners: statsData.total_partners || partnersData.length || 0,
        unassigned_campaigns: statsData.unassigned_campaigns || campaignsData.stats?.unassigned_campaigns || 0,
        campaigns_in_printing: statsData.campaigns_in_printing || campaignsData.stats?.campaigns_in_printing || 0,
        total_revenue: statsData.total_revenue || 0
      });
      
      // Mettre à jour les analytics détaillées
      if (analyticsDataRes && Object.keys(analyticsDataRes).length > 0) {
        setAnalyticsData(analyticsDataRes);
      }

      calculateAnalytics(campaignsData.campaigns || campaignsData || [], clientsData || []);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      showNotification('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calculer les analytics - Mémorisé pour éviter les recalculs
  const calculateAnalytics = useCallback((campaignsData, clientsData) => {
    const profitsByMonth = {};
    campaignsData.forEach(campaign => {
      if (campaign.created_at && campaign.estimated_price) {
        const month = format(new Date(campaign.created_at), 'yyyy-MM');
        if (!profitsByMonth[month]) {
          profitsByMonth[month] = 0;
        }
        profitsByMonth[month] += parseFloat(campaign.estimated_price) || 0;
      }
    });

    const profitsChart = Object.entries(profitsByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, profit]) => ({
        month: format(new Date(month + '-01'), 'MMM yyyy', { locale: fr }),
        profit: parseFloat(profit.toFixed(2))
      }));

    const postalCodeCounts = {};
    clientsData.forEach(client => {
      if (client.postal_code) {
        postalCodeCounts[client.postal_code] = (postalCodeCounts[client.postal_code] || 0) + 1;
      }
    });

    const topPostalCodes = Object.entries(postalCodeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([code, count]) => ({ code, count }));

    const statusCounts = {};
    campaignsData.forEach(campaign => {
      const status = campaign.status || 'CREATED';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const statusChart = Object.entries(statusCounts).map(([status, count]) => ({
      name: getStatusLabel(status),
      value: count
    }));

      setAnalytics({
        profitsChart,
        topPostalCodes,
        statusChart
      });
  }, []);

  useEffect(() => {
    fetchData();
  }, []); // fetchData est stable, pas besoin de dépendance

  // Calculer les commandes avec alerte (15 jours max pour distribution) - Optimisé avec useMemo
  const getCampaignsWithAlerts = useMemo(() => {
    const now = new Date();
    const maxDays = 15;
    const alertCampaigns = [];

    campaigns.forEach(campaign => {
      if (!campaign.created_at) {
        console.log('⚠️ Campagne sans created_at:', campaign);
        return;
      }
      
      const createdAt = new Date(campaign.created_at);
      
      // Vérifier si la date est valide
      if (isNaN(createdAt.getTime())) {
        console.log('⚠️ Date invalide pour campagne:', campaign.id, campaign.created_at);
        return;
      }
      
      const daysSinceCreation = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
      const daysRemaining = maxDays - daysSinceCreation;

      // Exclure les commandes déjà terminées ou livrées
      if (campaign.status === 'FINISHED' || campaign.status === 'DELIVERED') {
        return;
      }

      // Alerte si on approche ou dépasse la limite de 15 jours
      // On affiche les alertes si :
      // - La campagne a 12 jours ou plus (3 jours avant la limite)
      // - Ou si elle dépasse déjà la limite de 15 jours
      if (daysSinceCreation >= maxDays - 3 || daysRemaining <= 0) {
        alertCampaigns.push({
          ...campaign,
          daysSinceCreation,
          daysRemaining,
          urgencyLevel: daysRemaining <= 0 ? 'critical' : daysRemaining <= 3 ? 'high' : 'medium'
        });
      }
    });

    // Trier par urgence (critique en premier)
    return alertCampaigns.sort((a, b) => {
      if (a.urgencyLevel === 'critical' && b.urgencyLevel !== 'critical') return -1;
      if (b.urgencyLevel === 'critical' && a.urgencyLevel !== 'critical') return 1;
      return a.daysRemaining - b.daysRemaining;
    });
  }, [campaigns]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ ...notification, show: false }), 5000);
  };

  // Gestion de la sélection - Mémorisé
  const handleSelectAll = useCallback((event) => {
    if (event.target.checked) {
      const campaignsToUse = postalCodeFilter ? filteredCampaigns : campaigns;
      const selectableCampaigns = campaignsToUse
        .filter(c => c.status === 'CREATED' && c.printing_status !== 'SENT_TO_PRINT')
        .map(c => c.id);
      setSelectedCampaigns(selectableCampaigns);
    } else {
      setSelectedCampaigns([]);
    }
  }, [campaigns, postalCodeFilter, filteredCampaigns]);

  const handleSelectCampaign = useCallback((campaignId) => {
    setSelectedCampaigns(prev => {
      if (prev.includes(campaignId)) {
        return prev.filter(id => id !== campaignId);
      } else {
        return [...prev, campaignId];
      }
    });
  }, []);

  const fetchCampaignDetails = useCallback(async (campaignId) => {
    setDetailsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/campaigns/${campaignId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaignDetails(response.data);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des détails:', error);
      setCampaignDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const handleViewDetails = useCallback(async (item, type) => {
    setSelectedItem(item);
    setDetailsType(type);
    setOpenDetailsModal(true);
    
    // Si c'est une commande, charger les détails complets
    if (type === 'campaign' && item.id) {
      await fetchCampaignDetails(item.id);
    } else {
      setCampaignDetails(null);
    }
  }, [fetchCampaignDetails]);
  
  // Calculer les codes postaux communs - Optimisé avec useMemo
  const commonPostalCodesMemo = useMemo(() => {
    const postalCodeCounts = {};
    
    campaigns.forEach(campaign => {
      if (campaign.postal_codes) {
        const codes = campaign.postal_codes.toString().split(',').map(c => c.trim()).filter(c => c);
        codes.forEach(code => {
          if (!postalCodeCounts[code]) {
            postalCodeCounts[code] = { code, count: 0, campaigns: [] };
          }
          postalCodeCounts[code].count++;
          postalCodeCounts[code].campaigns.push(campaign.id);
        });
      }
    });
    
    // Trier par nombre de commandes (du plus commun au moins commun)
    return Object.values(postalCodeCounts)
      .sort((a, b) => b.count - a.count)
      .map(item => ({
        code: item.code,
        count: item.count,
        percentage: campaigns.length > 0 ? ((item.count / campaigns.length) * 100).toFixed(1) : '0'
      }));
  }, [campaigns]);

  // Mettre à jour commonPostalCodes quand le memo change
  useEffect(() => {
    setCommonPostalCodes(commonPostalCodesMemo);
  }, [commonPostalCodesMemo]);

  // Filtrer les commandes par code postal et recherche - Optimisé avec useMemo
  const filteredCampaignsMemo = useMemo(() => {
    let filtered = campaigns;
    
    // Filtre par code postal
    if (postalCodeFilter.trim()) {
      const filterCode = postalCodeFilter.trim();
      filtered = filtered.filter(campaign => {
        if (!campaign.postal_codes) return false;
        const codes = campaign.postal_codes.toString().split(',').map(c => c.trim()).filter(c => c);
        return codes.includes(filterCode);
      });
    }
    
    // Filtre par recherche (debounced)
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(campaign => 
        campaign.name?.toLowerCase().includes(searchLower) ||
        campaign.order_number?.toLowerCase().includes(searchLower) ||
        campaign.client?.company_name?.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [campaigns, postalCodeFilter, debouncedSearchTerm]);

  // Mettre à jour filteredCampaigns quand le memo change
  useEffect(() => {
    setFilteredCampaigns(filteredCampaignsMemo);
  }, [filteredCampaignsMemo]);

  // Créer une commande
  const handleCreateCampaign = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const campaignData = {
        name: campaignForm.name,
        quantity: 1000, // Toujours 1000 sacs
        postal_codes: campaignForm.postal_codes,
        estimated_price: parseFloat(campaignForm.estimated_price) || 0,
        faces: parseInt(campaignForm.faces) || 1,
        use_custom_card: campaignForm.use_custom_card
      };

      if (campaignForm.create_client) {
        const clientData = {
          username: campaignForm.client_email.split('@')[0],
          email: campaignForm.client_email,
          password: 'TempPassword123!',
          company_name: campaignForm.client_company_name,
          phone: campaignForm.client_phone,
          address: campaignForm.client_address,
          city: campaignForm.client_city,
          postal_code: campaignForm.client_postal_code,
          role: 'client'
        };

        const clientResponse = await axios.post(`${API_BASE}/auth/register/client/`, clientData, { headers });
        campaignData.client_id = clientResponse.data.user?.id;
      } else {
        const client = clients.find(c => c.email === campaignForm.client_email);
        if (client) {
          campaignData.client_id = client.id;
        } else {
          throw new Error('Client non trouvé');
        }
      }

      await axios.post(`${API_BASE}/campaigns/create-complete/`, campaignData, { headers });
      
      showNotification('Commande créée avec succès', 'success');
      setOpenCampaignModal(false);
      setCampaignForm({
        name: '', quantity: '', postal_codes: '', client_email: '', create_client: false,
        client_company_name: '', client_phone: '', client_address: '', client_city: '', client_postal_code: '',
        estimated_price: '', faces: 1, use_custom_card: false
      });
      fetchData();
    } catch (error) {
      console.error('Erreur création commande:', error);
      showNotification(error.response?.data?.error || 'Erreur lors de la création de la commande', 'error');
    }
  };

  // Créer un partenaire
  const handleCreatePartner = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const partnerData = {
        username: partnerForm.email.split('@')[0],
        email: partnerForm.email,
        password: 'TempPassword123!', // Mot de passe temporaire par défaut
        company_name: partnerForm.company_name,
        phone: partnerForm.phone,
        address: partnerForm.address,
        city: partnerForm.city,
        postal_code: partnerForm.postal_code,
        coverage_radius: 0, // Valeur par défaut
        partner_type: '', // Valeur par défaut
        role: 'partner'
      };

      await axios.post(`${API_BASE}/auth/register/partner/`, partnerData, { headers });
      
      showNotification('Partenaire créé avec succès', 'success');
      setOpenPartnerModal(false);
      setPartnerForm({
        company_name: '', email: '', phone: '', address: '',
        city: '', postal_code: ''
      });
      fetchData();
    } catch (error) {
      console.error('Erreur création partenaire:', error);
      showNotification(error.response?.data?.error || 'Erreur lors de la création du partenaire', 'error');
    }
  };

  // Mettre à jour le statut d'une commande
  const handleUpdateCampaignStatus = async (campaignId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_BASE}/admin/campaigns/${campaignId}/update-status/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification(
        response.data.message || 'Statut de la commande mis à jour',
        'success'
      );
      fetchData();
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      showNotification(
        error.response?.data?.error || 'Erreur lors de la mise à jour du statut',
        'error'
      );
    }
  };

  // Assigner partenaire et envoyer à l'impression
  const handleAssignPartnerAndPrint = async (partnerId) => {
    if (selectedCampaigns.length === 0) {
      showNotification('Veuillez sélectionner au moins une commande', 'warning');
      return;
    }

    if (!partnerId) {
      showNotification('Veuillez sélectionner un partenaire', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE}/admin/campaigns/assign-partner-and-print/`,
        { 
          campaign_ids: selectedCampaigns,
          partner_id: partnerId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification(
        response.data.message || 
        `${selectedCampaigns.length} commande(s) assignée(s) et envoyée(s) à l'impression`, 
        'success'
      );
      setSelectedCampaigns([]);
      setOpenAssignPartnerModal(false);
      fetchData();
    } catch (error) {
      console.error('Erreur assignation et envoi impression:', error);
      showNotification(
        error.response?.data?.error || 
        'Erreur lors de l\'assignation et de l\'envoi à l\'impression', 
        'error'
      );
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'CREATED': 'bg-blue-100 text-blue-700 border-blue-200',
      'ASSIGNED_TO_PARTNER': 'bg-purple-100 text-purple-700 border-purple-200',
      'SENT_TO_PRINT': 'bg-amber-100 text-amber-700 border-amber-200',
      'IN_PRINTING': 'bg-amber-100 text-amber-700 border-amber-200',
      'PRINTED': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'IN_DISTRIBUTION': 'bg-purple-100 text-purple-700 border-purple-200',
      'DELIVERED': 'bg-green-100 text-green-700 border-green-200',
      'FINISHED': 'bg-slate-100 text-slate-700 border-slate-200'
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f5f2] via-yellow-50/20 to-orange-50/10 flex items-center justify-center">
        <KraftBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-[#A67C52] animate-spin mx-auto mb-4" />
          <p className="text-slate-700 font-semibold">Chargement...</p>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 0, label: 'Commandes', icon: ShoppingBag },
    { id: 1, label: 'Clients', icon: Users },
    { id: 2, label: 'Partenaires', icon: Building2 },
    { id: 3, label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f5f2] via-yellow-50/20 to-orange-50/10 font-sans">
      <KraftBackground />
      
      {/* Header */}
      <motion.nav 
        initial={{ y: -100 }} 
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <img src={logo} alt="BagPub Logo" className="w-16 h-16 object-contain" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#A67C52] to-yellow-600 bg-clip-text text-transparent">
                  Dashboard Administrateur
                </h1>
                <p className="text-sm text-slate-600">Gestion complète de la plateforme</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/')}
                className="p-2.5 bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <Home className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="p-2.5 bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="pt-36 pb-12 px-6 max-w-7xl mx-auto">
        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-slate-200 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Commandes</p>
                <p className="text-3xl font-bold text-[#A67C52]">{stats.total_campaigns}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#A67C52] to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-slate-200 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Clients</p>
                <p className="text-3xl font-bold text-[#A67C52]">{stats.total_clients}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#A67C52] to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-slate-200 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Partenaires</p>
                <p className="text-3xl font-bold text-[#A67C52]">{stats.total_partners}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#A67C52] to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-slate-200 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Non assignées</p>
                <p className="text-3xl font-bold text-[#A67C52]">{stats.unassigned_campaigns}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#A67C52] to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <Printer className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-slate-200 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Revenus totaux</p>
                <p className="text-2xl font-bold text-[#A67C52]">
                  {stats.total_revenue ? `${parseFloat(stats.total_revenue).toFixed(0)} €` : '0 €'}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#A67C52] to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <Euro className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Alertes - Commandes à distribuer rapidement */}
        {(() => {
          const alertCampaigns = getCampaignsWithAlerts;
          // Toujours afficher la section d'alertes, même s'il n'y a pas d'alertes
          
          return (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className={`rounded-2xl border-2 shadow-xl p-6 ${
                alertCampaigns.length > 0 
                  ? 'bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 border-red-200' 
                  : 'bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-green-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                      alertCampaigns.length > 0 
                        ? 'bg-gradient-to-br from-red-500 to-orange-500' 
                        : 'bg-gradient-to-br from-green-500 to-emerald-500'
                    }`}>
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-2xl font-bold ${
                        alertCampaigns.length > 0 ? 'text-red-900' : 'text-green-900'
                      }`}>
                        {alertCampaigns.length > 0 ? '⚠️ Alertes de Distribution' : 'Aucune Alerte'}
                      </h2>
                      <p className={`text-sm ${
                        alertCampaigns.length > 0 ? 'text-red-700' : 'text-green-700'
                      }`}>
                        {alertCampaigns.length > 0 
                          ? `Commandes à distribuer dans les 15 jours après création (${alertCampaigns.length} en retard)`
                          : 'Toutes les commandes sont dans les délais (15 jours maximum)'
                        }
                      </p>
                    </div>
                  </div>
                  {alertCampaigns.length > 0 && (
                    <div className="px-4 py-2 bg-red-500 text-white rounded-full font-bold text-lg shadow-lg animate-pulse">
                      {alertCampaigns.length}
                    </div>
                  )}
                </div>

                {alertCampaigns.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {alertCampaigns.map((campaign) => {
                    const isCritical = campaign.urgencyLevel === 'critical';
                    const isHigh = campaign.urgencyLevel === 'high';
                    const bgColor = isCritical 
                      ? 'bg-gradient-to-r from-red-500 to-red-600' 
                      : isHigh 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600' 
                      : 'bg-gradient-to-r from-yellow-500 to-yellow-600';
                    const borderColor = isCritical ? 'border-red-700' : isHigh ? 'border-orange-700' : 'border-yellow-700';
                    
                    return (
                      <motion.div
                        key={campaign.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        className={`${bgColor} rounded-xl p-4 border-2 ${borderColor} shadow-lg cursor-pointer`}
                        onClick={() => handleViewDetails(campaign, 'campaign')}
                      >
                        <div className="flex items-center justify-between text-white">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-lg">{campaign.name}</h3>
                              <span className="text-xs px-2 py-1 bg-white/20 rounded-full">
                                #{campaign.order_number || campaign.id?.slice(0, 8)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Créée il y a {campaign.daysSinceCreation} jour{campaign.daysSinceCreation > 1 ? 's' : ''}
                              </span>
                              {campaign.daysRemaining > 0 ? (
                                <span className="font-semibold">
                                  ⏱️ {campaign.daysRemaining} jour{campaign.daysRemaining > 1 ? 's' : ''} restant{campaign.daysRemaining > 1 ? 's' : ''}
                                </span>
                              ) : (
                                <span className="font-bold text-red-100 bg-red-800/50 px-2 py-1 rounded">
                                  ⚠️ DÉPASSÉE !
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {campaign.postal_codes ? 
                                  `${campaign.postal_codes.toString().split(',').length} zone${campaign.postal_codes.toString().split(',').length > 1 ? 's' : ''}` : 
                                  'Non spécifié'
                                }
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                              campaign.status === 'CREATED' ? 'bg-white/30' :
                              campaign.status === 'ASSIGNED_TO_PARTNER' ? 'bg-purple-500/50' :
                              campaign.status === 'SENT_TO_PRINT' ? 'bg-blue-500/50' :
                              'bg-green-500/50'
                            }`}>
                              {campaign.status === 'CREATED' ? 'Non assignée' :
                               campaign.status === 'ASSIGNED_TO_PARTNER' ? 'Assignée' :
                               campaign.status === 'SENT_TO_PRINT' ? 'En impression' :
                               campaign.status}
                            </span>
                            <Eye className="w-5 h-5 hover:scale-110 transition-transform" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-green-700">Toutes les commandes sont dans les délais !</p>
                    <p className="text-sm text-green-600 mt-2">Aucune commande n'a dépassé la limite de 15 jours</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })()}

        {/* Onglets */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-slate-200 shadow-lg mb-6 overflow-hidden">
          <div className="flex border-b border-slate-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Contenu des onglets */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 0 && (
                <motion.div
                  key="campaigns"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <div className="space-y-4 mb-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-slate-900">
                        Commandes ({postalCodeFilter ? filteredCampaigns.length : campaigns.length})
                      </h2>
                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setOpenCampaignModal(true)}
                          className="px-5 py-2.5 bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          Créer une commande
                        </motion.button>
                      {selectedCampaigns.length > 0 && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setOpenAssignPartnerModal(true)}
                          className="px-5 py-2.5 bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                        >
                          <Users className="w-5 h-5" />
                          Assigner et envoyer {selectedCampaigns.length} commande(s)
                        </motion.button>
                      )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={fetchData}
                          className="px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                          <RefreshCw className="w-5 h-5" />
                          Actualiser
                        </motion.button>
                      </div>
                    </div>
                    
                    {/* Filtre par code postal */}
                    <div className="bg-gradient-to-r from-[#A67C52]/10 to-yellow-50 rounded-xl p-4 border-2 border-[#A67C52]/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A67C52]" />
                          <input
                            type="text"
                            placeholder="Filtrer par code postal (ex: 14000)"
                            value={postalCodeFilter}
                            onChange={(e) => setPostalCodeFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all font-medium"
                          />
                        </div>
                        {postalCodeFilter && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setPostalCodeFilter('')}
                            className="px-4 py-3 bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                          >
                            <X className="w-5 h-5" />
                            Effacer
                          </motion.button>
                        )}
                      </div>
                      
                      {/* Codes postaux communs */}
                      {!postalCodeFilter && commonPostalCodes.length > 0 && (
                        <div className="mt-4">
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-5 h-5 text-[#A67C52]" />
                            <h3 className="font-semibold text-slate-900">Codes postaux communs</h3>
                            <span className="text-sm text-slate-600">({commonPostalCodes.length} codes uniques)</span>
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            <div className="flex flex-wrap gap-2">
                              {commonPostalCodes.map((item) => (
                                <motion.button
                                  key={item.code}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setPostalCodeFilter(item.code)}
                                  className="px-4 py-2 bg-white border-2 border-[#A67C52]/30 rounded-xl hover:border-[#A67C52] hover:bg-[#A67C52]/5 transition-all"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#A67C52]">{item.code}</span>
                                    <span className="text-xs bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white px-2 py-0.5 rounded-full font-semibold">
                                      {item.count}
                                    </span>
                                  </div>
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {postalCodeFilter && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 flex items-center gap-2 text-sm text-slate-700"
                        >
                          <MapPin className="w-4 h-4 text-[#A67C52]" />
                          <span className="font-medium">
                            {filteredCampaigns.length} commande{filteredCampaigns.length > 1 ? 's' : ''} trouvée{filteredCampaigns.length > 1 ? 's' : ''} avec le code postal <span className="text-[#A67C52] font-bold">{postalCodeFilter}</span>
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Table des commandes */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-slate-200">
                          <th className="text-left py-3 px-4">
                            <input
                              type="checkbox"
                              checked={(postalCodeFilter ? filteredCampaigns : campaigns).filter(c => c.status === 'CREATED' && c.printing_status !== 'SENT_TO_PRINT').length > 0 && 
                                      selectedCampaigns.length === (postalCodeFilter ? filteredCampaigns : campaigns).filter(c => c.status === 'CREATED' && c.printing_status !== 'SENT_TO_PRINT').length}
                              onChange={handleSelectAll}
                              className="w-4 h-4 text-[#A67C52] rounded"
                            />
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">N° Commande</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Nom</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Client</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Partenaire</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Quantité</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Prix</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Statut</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(postalCodeFilter ? filteredCampaigns : campaigns).length === 0 ? (
                          <tr>
                            <td colSpan={9} className="text-center py-8 text-slate-500">
                              {postalCodeFilter ? `Aucune commande avec le code postal ${postalCodeFilter}` : 'Aucune commande trouvée'}
                            </td>
                          </tr>
                        ) : (
                          (postalCodeFilter ? filteredCampaigns : campaigns).map((campaign) => {
                            const isSelectable = campaign.status === 'CREATED' && campaign.printing_status !== 'SENT_TO_PRINT';
                            const isSelected = selectedCampaigns.includes(campaign.id);

                            return (
                              <motion.tr
                                key={campaign.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                              >
                                <td className="py-3 px-4">
                                  {isSelectable && (
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handleSelectCampaign(campaign.id)}
                                      className="w-4 h-4 text-[#A67C52] rounded"
                                    />
                                  )}
                                </td>
                                <td className="py-3 px-4 text-slate-900 font-medium">{campaign.order_number}</td>
                                <td className="py-3 px-4 text-slate-900">{campaign.name}</td>
                                <td className="py-3 px-4 text-slate-700">
                                  {campaign.client_details?.company_name || campaign.client_details?.username || 'N/A'}
                                </td>
                                <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                                  {campaign.partner_details?.company_name || campaign.partner?.company_name ? (
                                    <span className="inline-block px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-medium text-xs whitespace-nowrap">
                                      {campaign.partner_details?.company_name || campaign.partner?.company_name}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-xs italic">-</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-slate-700">1 000</td>
                                <td className="py-3 px-4 text-slate-700">
                                  {campaign.estimated_price ? `${parseFloat(campaign.estimated_price).toFixed(2)} €` : 'N/A'}
                                </td>
                                <td className="py-3 px-4">
                                  <select
                                    value={campaign.status}
                                    onChange={(e) => handleUpdateCampaignStatus(campaign.id, e.target.value)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all hover:shadow-md ${getStatusColor(campaign.status)} focus:outline-none focus:ring-2 focus:ring-[#A67C52]/20`}
                                    style={{ 
                                      appearance: 'none',
                                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                      backgroundRepeat: 'no-repeat',
                                      backgroundPosition: 'right 0.5rem center',
                                      paddingRight: '2rem'
                                    }}
                                  >
                                    <option value="CREATED">Créée</option>
                                    <option value="IN_PRINTING">En impression</option>
                                    <option value="IN_DISTRIBUTION">En distribution</option>
                                    <option value="FINISHED">Terminée</option>
                                  </select>
                                </td>
                                <td className="py-3 px-4 text-slate-600 text-sm">
                                  {campaign.created_at
                                    ? format(new Date(campaign.created_at), 'dd/MM/yyyy', { locale: fr })
                                    : 'N/A'}
                                </td>
                                <td className="py-3 px-4">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleViewDetails(campaign, 'campaign')}
                                    className="p-2 text-[#A67C52] hover:bg-[#A67C52]/10 rounded-lg transition-colors"
                                  >
                                    <Eye className="w-5 h-5" />
                                  </motion.button>
                                </td>
                              </motion.tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 1 && (
                <motion.div
                  key="clients"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-900">Clients ({clients.length})</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={fetchData}
                      className="px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Actualiser
                    </motion.button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-slate-200">
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Entreprise</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Téléphone</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Ville</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Commandes</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Total dépensé</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Date inscription</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clients.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center py-8 text-slate-500">
                              Aucun client trouvé
                            </td>
                          </tr>
                        ) : (
                          clients.map((client) => (
                            <motion.tr
                              key={client.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                            >
                              <td className="py-3 px-4 text-slate-900 font-medium">{client.company_name || client.username}</td>
                              <td className="py-3 px-4 text-slate-700">{client.email}</td>
                              <td className="py-3 px-4 text-slate-700">{client.phone || 'N/A'}</td>
                              <td className="py-3 px-4 text-slate-700">{client.city || 'N/A'}</td>
                              <td className="py-3 px-4 text-slate-700">{client.campaigns_count || 0}</td>
                              <td className="py-3 px-4 text-slate-700">
                                {client.total_spent ? `${parseFloat(client.total_spent).toFixed(2)} €` : '0 €'}
                              </td>
                              <td className="py-3 px-4 text-slate-600 text-sm">
                                {client.date_joined
                                  ? format(new Date(client.date_joined), 'dd/MM/yyyy', { locale: fr })
                                  : 'N/A'}
                              </td>
                              <td className="py-3 px-4">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleViewDetails(client, 'client')}
                                  className="p-2 text-[#A67C52] hover:bg-[#A67C52]/10 rounded-lg transition-colors"
                                >
                                  <Eye className="w-5 h-5" />
                                </motion.button>
                              </td>
                            </motion.tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 2 && (
                <motion.div
                  key="partners"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-900">Partenaires ({partners.length})</h2>
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setOpenPartnerModal(true)}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Ajouter un partenaire
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchData}
                        className="px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all flex items-center gap-2"
                      >
                        <RefreshCw className="w-5 h-5" />
                        Actualiser
                      </motion.button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-slate-200">
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Entreprise</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Téléphone</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Ville</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Code postal</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Statut</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {partners.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-8 text-slate-500">
                              Aucun partenaire trouvé
                            </td>
                          </tr>
                        ) : (
                          (Array.isArray(partners) ? partners : []).map((partner) => (
                            <motion.tr
                              key={partner.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                            >
                              <td className="py-3 px-4 text-slate-900 font-medium">{partner.company_name}</td>
                              <td className="py-3 px-4 text-slate-700">{partner.email}</td>
                              <td className="py-3 px-4 text-slate-700">{partner.phone || 'N/A'}</td>
                              <td className="py-3 px-4 text-slate-700">{partner.city || 'N/A'}</td>
                              <td className="py-3 px-4 text-slate-700">{partner.postal_code || 'N/A'}</td>
                              <td className="py-3 px-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                  partner.is_active 
                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                  {partner.is_active ? 'Actif' : 'Inactif'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleViewDetails(partner, 'partner')}
                                  className="p-2 text-[#A67C52] hover:bg-[#A67C52]/10 rounded-lg transition-colors"
                                >
                                  <Eye className="w-5 h-5" />
                                </motion.button>
                              </td>
                            </motion.tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 3 && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Analytics & Statistiques</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={fetchData}
                      className="px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Actualiser
                    </motion.button>
                  </div>

                  {/* Cartes de revenus */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-[#A67C52] to-yellow-600 rounded-2xl p-6 text-white shadow-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Euro className="w-8 h-8 opacity-80" />
                        <span className="text-sm opacity-80">Aujourd'hui</span>
                      </div>
                      <p className="text-3xl font-bold">{analyticsData.revenue?.today?.toFixed(2) || '0.00'} €</p>
                      <p className="text-sm opacity-80 mt-1">Revenus du jour</p>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white shadow-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8 opacity-80" />
                        <span className="text-sm opacity-80">Ce mois</span>
                      </div>
                      <p className="text-3xl font-bold">{analyticsData.revenue?.this_month?.toFixed(2) || '0.00'} €</p>
                      <p className="text-sm opacity-80 mt-1">Revenus mensuels</p>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <BarChart3 className="w-8 h-8 opacity-80" />
                        <span className="text-sm opacity-80">Cette année</span>
                      </div>
                      <p className="text-3xl font-bold">{analyticsData.revenue?.this_year?.toFixed(2) || '0.00'} €</p>
                      <p className="text-sm opacity-80 mt-1">Revenus annuels</p>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Euro className="w-8 h-8 opacity-80" />
                        <span className="text-sm opacity-80">Total</span>
                      </div>
                      <p className="text-3xl font-bold">{analyticsData.revenue?.total?.toFixed(2) || '0.00'} €</p>
                      <p className="text-sm opacity-80 mt-1">Revenus totaux</p>
                    </motion.div>
                  </div>

                  {/* Graphiques de revenus */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenus par jour (30 derniers jours) */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#A67C52]/20 shadow-xl">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#A67C52]" />
                        Revenus par jour (30 derniers jours)
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analyticsData.revenue_by_day || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                          <YAxis stroke="#64748b" />
                          <Tooltip 
                            formatter={(value) => `${parseFloat(value).toFixed(2)} €`}
                            contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#A67C52" 
                            fill="#A67C52" 
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Revenus par mois (12 derniers mois) */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#A67C52]/20 shadow-xl">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-[#A67C52]" />
                        Revenus par mois (12 derniers mois)
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <ReBarChart data={analyticsData.revenue_by_month || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="month" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip 
                            formatter={(value) => `${parseFloat(value).toFixed(2)} €`}
                            contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                          />
                          <Bar dataKey="revenue" fill="#A67C52" radius={[8, 8, 0, 0]} />
                        </ReBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Revenus par année */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#A67C52]/20 shadow-xl">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#A67C52]" />
                      Revenus par année
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analyticsData.revenue_by_year || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="year" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip 
                          formatter={(value) => `${parseFloat(value).toFixed(2)} €`}
                          contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#A67C52" 
                          strokeWidth={3}
                          dot={{ fill: '#A67C52', r: 5 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="campaigns" 
                          stroke="#F59E0B" 
                          strokeWidth={2}
                          dot={{ fill: '#F59E0B', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Commandes par statut et par code postal */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Répartition des statuts */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#A67C52]/20 shadow-xl">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-[#A67C52]" />
                        Commandes par statut
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <RePieChart>
                          <Pie
                            data={analyticsData.campaigns_by_status || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent, value }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={80}
                            fill="#A67C52"
                            dataKey="value"
                          >
                            {(analyticsData.campaigns_by_status || []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Top codes postaux */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#A67C52]/20 shadow-xl">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-[#A67C52]" />
                        Top 10 codes postaux (commandes)
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <ReBarChart data={analyticsData.campaigns_by_postal_code || []} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis type="number" stroke="#64748b" />
                          <YAxis dataKey="code" type="category" stroke="#64748b" width={60} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                          />
                          <Bar dataKey="count" fill="#A67C52" radius={[0, 8, 8, 0]} />
                        </ReBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Distribution par partenaire */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#A67C52]/20 shadow-xl">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#A67C52]" />
                      Distribution par partenaire
                    </h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <ReBarChart data={analyticsData.partner_distribution || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" angle={-45} textAnchor="end" height={100} fontSize={12} />
                        <YAxis stroke="#64748b" />
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === 'revenue') return `${parseFloat(value).toFixed(2)} €`;
                            return value;
                          }}
                          contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                        <Legend />
                        <Bar dataKey="campaigns" fill="#A67C52" radius={[8, 8, 0, 0]} name="Commandes" />
                        <Bar dataKey="revenue" fill="#EAB308" radius={[8, 8, 0, 0]} name="Revenus (€)" />
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Top clients et quantités */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top clients */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#A67C52]/20 shadow-xl">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Crown className="w-5 h-5 text-[#A67C52]" />
                        Top 10 clients (par revenus)
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <ReBarChart data={analyticsData.top_clients || []} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis type="number" stroke="#64748b" />
                          <YAxis dataKey="name" type="category" stroke="#64748b" width={100} fontSize={12} />
                          <Tooltip 
                            formatter={(value) => `${parseFloat(value).toFixed(2)} €`}
                            contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                          />
                          <Bar dataKey="revenue" fill="#A67C52" radius={[0, 8, 8, 0]} />
                        </ReBarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Statistiques de commandes */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#A67C52]/20 shadow-xl">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-[#A67C52]" />
                        Statistiques de commandes
                      </h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-[#A67C52]/10 to-yellow-50 rounded-xl border-2 border-[#A67C52]/20">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-700 font-medium">Total commandes</span>
                            <span className="text-2xl font-bold text-[#A67C52]">
                              {stats.total_campaigns || 0}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-700 font-medium">Commandes distribuées</span>
                            <span className="text-2xl font-bold text-emerald-600">
                              {analyticsData.campaigns_by_status?.find(s => s.name === 'Terminée')?.value || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tableau détaillé des partenaires */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#A67C52]/20 shadow-xl">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#A67C52]" />
                      Détails de distribution par partenaire
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-slate-200">
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Partenaire</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Commandes</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Revenus</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analyticsData.partner_distribution?.length > 0 ? (
                            analyticsData.partner_distribution.map((partner, index) => (
                              <motion.tr
                                key={index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                              >
                                <td className="py-3 px-4 text-slate-900 font-medium">{partner.name}</td>
                                <td className="py-3 px-4 text-slate-700">{partner.campaigns}</td>
                                <td className="py-3 px-4 text-slate-700 font-semibold">
                                  {parseFloat(partner.revenue || 0).toFixed(2)} €
                                </td>
                              </motion.tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="text-center py-8 text-slate-500">
                                Aucune distribution par partenaire
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modal Créer Commande */}
      <AnimatePresence>
        {openCampaignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setOpenCampaignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-[#A67C52] via-yellow-600 to-orange-600 p-6 text-white">
                <h2 className="text-2xl font-bold">Créer une commande manuellement</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nom de la commande</label>
                  <input
                    type="text"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all"
                    required
                  />
                </div>
                <div>
                  <div className="mb-4 p-4 bg-gradient-to-r from-[#A67C52]/10 to-yellow-50 rounded-xl border-2 border-[#A67C52]/20">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Quantité</label>
                    <p className="text-2xl font-bold text-[#A67C52]">1 000 sacs</p>
                    <p className="text-xs text-slate-500 mt-1">Quantité fixe pour toutes les commandes</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Prix estimé (€)</label>
                    <input
                      type="number"
                      value={campaignForm.estimated_price}
                      onChange={(e) => setCampaignForm({ ...campaignForm, estimated_price: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Codes postaux (séparés par des virgules)</label>
                  <input
                    type="text"
                    value={campaignForm.postal_codes}
                    onChange={(e) => setCampaignForm({ ...campaignForm, postal_codes: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Client</label>
                  <select
                    value={campaignForm.create_client ? 'new' : 'existing'}
                    onChange={(e) => setCampaignForm({ ...campaignForm, create_client: e.target.value === 'new' })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all"
                  >
                    <option value="existing">Client existant</option>
                    <option value="new">Nouveau client</option>
                  </select>
                </div>
                {campaignForm.create_client ? (
                  <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                    <input
                      type="email"
                      placeholder="Email du client"
                      value={campaignForm.client_email}
                      onChange={(e) => setCampaignForm({ ...campaignForm, client_email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Nom de l'entreprise"
                      value={campaignForm.client_company_name}
                      onChange={(e) => setCampaignForm({ ...campaignForm, client_company_name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all"
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Téléphone"
                        value={campaignForm.client_phone}
                        onChange={(e) => setCampaignForm({ ...campaignForm, client_phone: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all"
                      />
                      <input
                        type="text"
                        placeholder="Code postal"
                        value={campaignForm.client_postal_code}
                        onChange={(e) => setCampaignForm({ ...campaignForm, client_postal_code: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Ville"
                      value={campaignForm.client_city}
                      onChange={(e) => setCampaignForm({ ...campaignForm, client_city: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Adresse"
                      value={campaignForm.client_address}
                      onChange={(e) => setCampaignForm({ ...campaignForm, client_address: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all"
                    />
                  </div>
                ) : (
                  <select
                    value={campaignForm.client_email}
                    onChange={(e) => setCampaignForm({ ...campaignForm, client_email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all"
                  >
                    <option value="">Sélectionner un client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.email}>
                        {client.company_name || client.username} ({client.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setOpenCampaignModal(false)}
                  className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateCampaign}
                  className="px-6 py-3 bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Créer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Créer Partenaire */}
      <AnimatePresence>
        {openPartnerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setOpenPartnerModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-[#A67C52] via-yellow-600 to-orange-600 p-6 text-white">
                <h2 className="text-2xl font-bold">Ajouter un partenaire</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nom de l'entreprise</label>
                  <input
                    type="text"
                    value={partnerForm.company_name}
                    onChange={(e) => setPartnerForm({ ...partnerForm, company_name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={partnerForm.email}
                    onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Téléphone</label>
                    <input
                      type="text"
                      value={partnerForm.phone}
                      onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Code postal</label>
                    <input
                      type="text"
                      value={partnerForm.postal_code}
                      onChange={(e) => setPartnerForm({ ...partnerForm, postal_code: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Ville</label>
                  <input
                    type="text"
                    value={partnerForm.city}
                    onChange={(e) => setPartnerForm({ ...partnerForm, city: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Adresse</label>
                  <input
                    type="text"
                    value={partnerForm.address}
                    onChange={(e) => setPartnerForm({ ...partnerForm, address: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setOpenPartnerModal(false)}
                  className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreatePartner}
                  className="px-6 py-3 bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Créer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Détails */}
      <AnimatePresence>
        {openDetailsModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setOpenDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-[#A67C52] via-yellow-600 to-orange-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedItem?.name || 'Détails'}</h2>
                    <p className="text-yellow-50/90 mt-1">Commande #{selectedItem?.order_number}</p>
                  </div>
                  <button
                    onClick={() => setOpenDetailsModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                {detailsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-[#A67C52] animate-spin" />
                  </div>
                ) : detailsType === 'campaign' && (campaignDetails || selectedItem) ? (
                  <div className="space-y-6">
                    {(() => {
                      const details = campaignDetails || selectedItem;
                      const parseZipCodes = (zipCodesString) => {
                        if (!zipCodesString) return [];
                        return zipCodesString.toString().split(',').map(code => code.trim()).filter(code => code);
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

                      return (
                        <>
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
                                    {getStatusLabel(details.status)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-slate-500">Quantité</span>
                                  <span className="font-medium">1 000 sacs</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-slate-500">Type</span>
                                  <span className="font-medium">
                                    {details.use_custom_card ? 'Design de votre carte' : 
                                     details.design ? 'Design personnalisé' : 
                                     'Design standard'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-slate-500">Créée le</span>
                                  <span className="font-medium">{formatDate(details.created_at)}</span>
                                </div>
                                {details.estimated_price && (
                                  <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">Prix estimé</span>
                                    <span className="font-medium">{parseFloat(details.estimated_price).toFixed(2)} €</span>
                                  </div>
                                )}
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
                                     selectedItem?.client_details?.company_name ||
                                     '-'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-slate-500">Email</span>
                                  {(() => {
                                    const email = details.client_details?.email || 
                                                 details.client?.email || 
                                                 selectedItem?.client_details?.email ||
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
                                    {(() => {
                                      // Récupérer le téléphone depuis différentes sources
                                      // Priorité 1: design.company_phone (pour toutes les campagnes, y compris custom_card)
                                      let phone = 
                                        campaignDetails?.design?.company_phone ||
                                        details.design?.company_phone;
                                      
                                      // Si pas de téléphone dans design, utiliser client_details ou client
                                      // (important pour les anciennes campagnes créées avant la création du design minimal)
                                      if (!phone || phone.trim() === '' || phone === 'None' || phone === 'null') {
                                        phone = 
                                          campaignDetails?.client_details?.phone ||
                                          details.client_details?.phone ||
                                          campaignDetails?.client?.phone ||
                                          details.client?.phone ||
                                          selectedItem?.client?.phone ||
                                          selectedItem?.client_details?.phone;
                                      }
                                      
                                      return phone && phone.trim() !== '' && phone !== 'None' && phone !== 'null' ? phone : '-';
                                    })()}
                                  </span>
                                </div>
                                {(details.client_details?.address || details.client?.address) && (
                                  <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">Adresse</span>
                                    <span className="font-medium text-right max-w-[60%]">
                                      {details.client_details?.address || details.client?.address || '-'}
                                    </span>
                                  </div>
                                )}
                                {(details.client_details?.city || details.client?.city) && (
                                  <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">Ville</span>
                                    <span className="font-medium">
                                      {details.client_details?.city || details.client?.city || '-'}
                                    </span>
                                  </div>
                                )}
                                {(details.client_details?.postal_code || details.client?.postal_code) && (
                                  <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">Code postal</span>
                                    <span className="font-medium">
                                      {details.client_details?.postal_code || details.client?.postal_code || '-'}
                                    </span>
                                  </div>
                                )}
                                {(details.client_details?.siret || details.client?.siret) && (
                                  <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">SIRET</span>
                                    <span className="font-medium">
                                      {details.client_details?.siret || details.client?.siret || '-'}
                                    </span>
                                  </div>
                                )}
                                {(details.client_details?.tva_number || details.client?.tva_number) && (
                                  <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">N° TVA</span>
                                    <span className="font-medium">
                                      {details.client_details?.tva_number || details.client?.tva_number || '-'}
                                    </span>
                                  </div>
                                )}
                                {details.partner && (
                                  <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">Partenaire</span>
                                    <span className="font-medium text-purple-600">{details.partner.company_name || details.partner_details?.company_name}</span>
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
                            {details.postal_codes && details.postal_codes.toString().trim() ? (
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
                                    const customCardUrl = details.custom_card_url || 
                                                         details.custom_card ||
                                                         selectedItem?.custom_card_url ||
                                                         selectedItem?.custom_card;
                                    
                                    let fullCustomCardUrl = null;
                                    if (customCardUrl) {
                                      if (customCardUrl.toString().startsWith('http')) {
                                        fullCustomCardUrl = customCardUrl;
                                      } else {
                                        fullCustomCardUrl = `${API_BASE_URL}${customCardUrl.toString().startsWith('/') ? '' : '/'}${customCardUrl}`;
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
                                          let qrCodeImageUrl = null;
                                          
                                          if (details.design?.qr_code_image_url) {
                                            qrCodeImageUrl = details.design.qr_code_image_url;
                                          } else if (details.design?.qr_code) {
                                            const qrCodePath = details.design.qr_code;
                                            if (qrCodePath.toString().startsWith('http')) {
                                              qrCodeImageUrl = qrCodePath;
                                            } else {
                                              qrCodeImageUrl = `${API_BASE_URL}${qrCodePath}`;
                                            }
                                          }
                                          
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
                                                      e.target.style.display = 'none';
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
                        </>
                      );
                    })()}
                  </div>
                ) : detailsType === 'campaign' ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-slate-900 mb-2">Impossible de charger les détails</h4>
                    <p className="text-slate-600">Veuillez réessayer plus tard</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                {detailsType === 'client' && (
                  <>
                    <div className="flex justify-between py-3 border-b border-slate-200">
                      <span className="font-semibold text-slate-700">Nom d'utilisateur</span>
                      <span className="text-slate-900">{selectedItem.username || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-slate-200">
                      <span className="font-semibold text-slate-700">Nom d'entreprise</span>
                      <span className="text-slate-900">{selectedItem.company_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-slate-200">
                      <span className="font-semibold text-slate-700">Email</span>
                      <a href={`mailto:${selectedItem.email}`} className="text-slate-900 text-[#A67C52] hover:text-yellow-600">
                        {selectedItem.email}
                      </a>
                    </div>
                    <div className="flex justify-between py-3 border-b border-slate-200">
                      <span className="font-semibold text-slate-700">Téléphone</span>
                      {selectedItem.phone ? (
                        <a href={`tel:${selectedItem.phone}`} className="text-slate-900 text-[#A67C52] hover:text-yellow-600">
                          {selectedItem.phone}
                        </a>
                      ) : (
                        <span className="text-slate-900">N/A</span>
                      )}
                    </div>
                    {selectedItem.address && (
                      <div className="flex justify-between py-3 border-b border-slate-200">
                        <span className="font-semibold text-slate-700">Adresse</span>
                        <span className="text-slate-900 text-right max-w-[60%]">{selectedItem.address}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-3 border-b border-slate-200">
                      <span className="font-semibold text-slate-700">Ville</span>
                      <span className="text-slate-900">{selectedItem.city || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-slate-200">
                      <span className="font-semibold text-slate-700">Code postal</span>
                      <span className="text-slate-900">{selectedItem.postal_code || 'N/A'}</span>
                    </div>
                    {selectedItem.siret && (
                      <div className="flex justify-between py-3 border-b border-slate-200">
                        <span className="font-semibold text-slate-700">SIRET</span>
                        <span className="text-slate-900 font-mono">{selectedItem.siret}</span>
                      </div>
                    )}
                    {selectedItem.tva_number && (
                      <div className="flex justify-between py-3 border-b border-slate-200">
                        <span className="font-semibold text-slate-700">N° TVA intracommunautaire</span>
                        <span className="text-slate-900 font-mono">{selectedItem.tva_number}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-3 border-b border-slate-200">
                      <span className="font-semibold text-slate-700">Nombre de commandes</span>
                      <span className="text-slate-900 font-semibold">{selectedItem.campaigns_count || 0}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-slate-200">
                      <span className="font-semibold text-slate-700">Total dépensé</span>
                      <span className="text-slate-900 font-semibold text-[#A67C52]">
                        {selectedItem.total_spent ? `${parseFloat(selectedItem.total_spent).toFixed(2)} €` : '0 €'}
                      </span>
                    </div>
                    {selectedItem.date_joined && (
                      <div className="flex justify-between py-3">
                        <span className="font-semibold text-slate-700">Date d'inscription</span>
                        <span className="text-slate-900 text-sm">
                          {format(new Date(selectedItem.date_joined), 'dd/MM/yyyy', { locale: fr })}
                        </span>
                      </div>
                    )}
                  </>
                    )}
                    {detailsType === 'partner' && (
                      <>
                        <div className="flex justify-between py-3 border-b border-slate-200">
                          <span className="font-semibold text-slate-700">Nom de l'entreprise</span>
                          <span className="text-slate-900">{selectedItem.company_name}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-slate-200">
                          <span className="font-semibold text-slate-700">Email</span>
                          <span className="text-slate-900">{selectedItem.email}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-slate-200">
                          <span className="font-semibold text-slate-700">Téléphone</span>
                          <span className="text-slate-900">{selectedItem.phone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-slate-200">
                          <span className="font-semibold text-slate-700">Adresse</span>
                          <span className="text-slate-900 text-right max-w-[60%]">{selectedItem.address || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-slate-200">
                          <span className="font-semibold text-slate-700">Ville</span>
                          <span className="text-slate-900">{selectedItem.city || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-slate-200">
                          <span className="font-semibold text-slate-700">Code postal</span>
                          <span className="text-slate-900">{selectedItem.postal_code || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-slate-200">
                          <span className="font-semibold text-slate-700">Statut</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            selectedItem.is_active 
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {selectedItem.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-slate-200 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setOpenDetailsModal(false)}
                  className="px-6 py-3 bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Fermer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Assigner Partenaire */}
      <AnimatePresence>
        {openAssignPartnerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setOpenAssignPartnerModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full"
            >
              <div className="bg-gradient-to-r from-[#A67C52] via-yellow-600 to-orange-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Assigner un partenaire</h2>
                    <p className="text-yellow-50/90 mt-1">
                      {selectedCampaigns.length} commande{selectedCampaigns.length > 1 ? 's' : ''} sélectionnée{selectedCampaigns.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => setOpenAssignPartnerModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Sélectionner un partenaire
                  </label>
                  {partners.length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-xl border-2 border-slate-200 text-center">
                      <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-600 font-medium">Aucun partenaire disponible</p>
                      <p className="text-sm text-slate-500 mt-1">Créez d'abord un partenaire</p>
                    </div>
                  ) : (
                    <select
                      id="partner-select"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all font-medium"
                      defaultValue=""
                      onChange={(e) => {
                        const selectedPartnerId = e.target.value;
                        if (selectedPartnerId) {
                          handleAssignPartnerAndPrint(selectedPartnerId);
                        }
                      }}
                    >
                      <option value="">-- Sélectionner un partenaire --</option>
                      {partners.filter(p => p.is_active !== false).map((partner) => (
                        <option key={partner.id} value={partner.id}>
                          {partner.company_name} {partner.city ? `(${partner.city})` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="bg-gradient-to-r from-[#A67C52]/10 to-yellow-50 rounded-xl p-4 border-2 border-[#A67C52]/20">
                  <p className="text-sm text-slate-700">
                    <strong>Note :</strong> Les commandes sélectionnées seront automatiquement assignées au partenaire choisi et envoyées à l'impression. Un email sera envoyé à chaque client concerné.
                  </p>
                </div>
              </div>
              <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setOpenAssignPartnerModal(false)}
                  className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                >
                  Annuler
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 50, x: 0 }}
            className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 ${
              notification.type === 'success' 
                ? 'bg-emerald-500 text-white' 
                : notification.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-amber-500 text-white'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-semibold">{notification.message}</span>
            <button
              onClick={() => setNotification({ ...notification, show: false })}
              className="ml-4 hover:opacity-70 transition-opacity"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
