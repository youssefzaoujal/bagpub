import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';
import KraftBackground from '../components/KraftBackground';
import { 
  ArrowLeft, Mail, Phone, MapPin, Building, 
  Loader2, CheckCircle, Users, Package,
  Handshake, TrendingUp, Shield, Target,
  Clock, Percent
} from 'lucide-react';

const RegisterPartnerPage = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { registerPartner } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const validateForm = () => {
    const { company_name, email, phone, address, city, postal_code } = formData;
    
    if (!company_name || !email || !phone || !address || !city || !postal_code) {
      setError('Veuillez remplir tous les champs obligatoires');
      return false;
    }
    
    if (!email.includes('@')) {
      setError('Veuillez entrer une adresse email valide');
      return false;
    }
    
    if (phone.length < 10) {
      setError('Veuillez entrer un numéro de téléphone valide');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setError('');
    setLoading(true);
    
    const partnerData = {
      ...formData
    };
    
    const result = await registerPartner(partnerData);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2500);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#f8f5f2] via-yellow-50/20 to-orange-50/10 font-sans overflow-hidden text-slate-800">
      <KraftBackground />

      {/* === GAUCHE (VISUEL) === */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-16 z-10 border-r border-white/50 bg-white/30 backdrop-blur-xl">
        <div className="flex items-center">
          <img src={logo} alt="BagPub Logo" className="w-32 h-32 object-contain" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl"
        >
          <h1 className="text-5xl font-extrabold leading-tight mb-8 text-slate-900">
            Devenez partenaire et
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A67C52] to-yellow-600 animate-gradient bg-[length:200%_auto]">
              générez des revenus passifs
            </span>
          </h1>
           
          {/* Partner Benefits */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-4 mb-8"
          >
            {[
              { 
                icon: <TrendingUp className="w-5 h-5" />, 
                title: 'Revenus complémentaires',
                desc: 'Jusqu\'à 500€/mois selon votre trafic',
                color: 'from-emerald-500 to-green-500'
              },
              { 
                icon: <Package className="w-5 h-5" />, 
                title: 'Sacs offerts',
                desc: 'Recevez gratuitement vos sacs BagPub',
                color: 'from-blue-500 to-cyan-500'
              },
              { 
                icon: <Target className="w-5 h-5" />, 
                title: 'Impact local',
                desc: 'Soutenez les entreprises de votre quartier',
                color: 'from-purple-500 to-pink-500'
              },
              { 
                icon: <Shield className="w-5 h-5" />, 
                title: 'Sans engagement',
                desc: 'Arrêtez quand vous voulez, sans frais',
                color: 'from-amber-500 to-orange-500'
              }
            ].map((benefit, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-start gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-[#A67C52]/20 shadow-lg hover:shadow-xl transition-all group"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-12 h-12 bg-gradient-to-r ${benefit.color} rounded-xl flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-shadow`}
                >
                  {benefit.icon}
                </motion.div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{benefit.title}</h3>
                  <p className="text-sm text-slate-600">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </motion.div>

        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-[#A67C52] rounded-full animate-pulse"></div>
          <span className="text-xs text-slate-600 font-bold uppercase tracking-widest opacity-80">
            Plus de 500 partenaires actifs
          </span>
        </div>
      </div>

      {/* === DROITE (FORMULAIRE) === */}
      <div className="w-full lg:w-1/2 flex flex-col items-center p-6 relative z-10 overflow-y-auto">
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-8">
          <img src={logo} alt="BagPub Logo" className="w-28 h-28 object-contain" />
        </div>

        {/* Back button */}
        <Link 
          to="/" 
          className="lg:hidden absolute top-8 right-8 flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors group font-medium"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Accueil
        </Link>

        <div className="w-full max-w-[500px] mt-20 lg:mt-0 lg:py-16">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/90 backdrop-blur-sm border-2 border-[#A67C52]/20 rounded-[2.5rem] shadow-2xl shadow-[#A67C52]/10 p-8 md:p-12 relative overflow-hidden"
              >
                {/* Décoration */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-[#A67C52]/10 to-yellow-400/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-r from-yellow-300/10 to-orange-300/10 rounded-full blur-3xl"></div>
                
                <div className="text-center relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-r from-[#A67C52] to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#A67C52]/20">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-[#A67C52] to-yellow-600 bg-clip-text text-transparent mb-4">Inscription envoyée !</h3>
                  <p className="text-slate-600 mb-6">
                    Merci pour votre intérêt à devenir partenaire BagPub.
                  </p>
                  
                  <div className="bg-gradient-to-r from-[#A67C52]/10 to-yellow-50/50 rounded-2xl p-6 border-2 border-[#A67C52]/20 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Mail className="w-5 h-5 text-[#A67C52]" />
                      <div>
                        <h4 className="font-bold text-slate-900">Prochaine étape</h4>
                        <p className="text-sm text-slate-600">
                          Notre équipe va vous contacter par email dans les 48h.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-[#A67C52]" />
                      <div>
                        <h4 className="font-bold text-slate-900">Redirection automatique</h4>
                        <p className="text-sm text-slate-600">
                          Vous serez redirigé vers l'accueil dans 5 secondes...
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#A67C52]/10 to-yellow-50 text-[#A67C52] rounded-full font-medium border-2 border-[#A67C52]/20">
                    <div className="w-2 h-2 bg-[#A67C52] rounded-full animate-pulse"></div>
                    <span>Patientez quelques secondes</span>
                  </div>
                  
                  <div className="mt-8">
                    <Link 
                      to="/" 
                      className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors font-medium"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Retourner à l'accueil maintenant
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="bg-white/90 backdrop-blur-sm border-2 border-[#A67C52]/20 rounded-[2.5rem] shadow-2xl shadow-[#A67C52]/10 relative overflow-hidden">
                  
                  <div className="p-8 md:p-12 relative z-10">
                    {/* Header */}
                    <div className="text-center mb-10">
                      <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-[#A67C52]/10 to-yellow-50 border-2 border-[#A67C52]/20 mb-6 shadow-lg shadow-[#A67C52]/10">
                        <Handshake className="w-8 h-8 text-[#A67C52]" />
                      </div>
                      <h2 className="text-3xl font-extrabold bg-gradient-to-r from-[#A67C52] to-yellow-600 bg-clip-text text-transparent mb-2">Devenir Partenaire BagPub</h2>
                      <p className="text-slate-600 font-medium">
                        Transformez votre établissement en point de distribution
                      </p>
                    </div>

                    {/* Error message */}
                    {error && (
                      <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-50/80 border border-red-200 rounded-2xl text-red-700 text-sm flex items-start gap-3 font-medium shadow-sm">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0 mt-1" />
                        <span>{typeof error === 'object' ? JSON.stringify(error) : error}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Company Information */}
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            Nom de l'entreprise
                          </label>
                          <input
                            type="text"
                            name="company_name"
                            value={formData.company_name}
                            onChange={handleChange}
                            required
                            placeholder="Nom officiel de votre établissement"
                            className="w-full px-4 py-4 bg-white/80 border-2 border-slate-200 rounded-2xl text-slate-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#A67C52] focus:ring-4 focus:ring-[#A67C52]/20 transition-all duration-300 hover:bg-white hover:border-[#A67C52]/40 font-medium shadow-sm"
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Email professionnel
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              placeholder="contact@entreprise.fr"
                              className="w-full px-4 py-4 bg-white/80 border-2 border-slate-200 rounded-2xl text-slate-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#A67C52] focus:ring-4 focus:ring-[#A67C52]/20 transition-all duration-300 hover:bg-white hover:border-[#A67C52]/40 font-medium shadow-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              Téléphone
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              required
                              placeholder="06 12 34 56 78"
                              className="w-full px-4 py-4 bg-white/80 border-2 border-slate-200 rounded-2xl text-slate-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#A67C52] focus:ring-4 focus:ring-[#A67C52]/20 transition-all duration-300 hover:bg-white hover:border-[#A67C52]/40 font-medium shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Adresse complète
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            placeholder="123 Rue de la République"
                            className="w-full px-4 py-4 bg-white/80 border-2 border-slate-200 rounded-2xl text-slate-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#A67C52] focus:ring-4 focus:ring-[#A67C52]/20 transition-all duration-300 hover:bg-white hover:border-[#A67C52]/40 font-medium shadow-sm"
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Ville
                            </label>
                            <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              required
                              placeholder="Paris"
                              className="w-full px-4 py-4 bg-white/80 border-2 border-slate-200 rounded-2xl text-slate-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#A67C52] focus:ring-4 focus:ring-[#A67C52]/20 transition-all duration-300 hover:bg-white hover:border-[#A67C52]/40 font-medium shadow-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Code postal
                            </label>
                            <input
                              type="text"
                              name="postal_code"
                              value={formData.postal_code}
                              onChange={handleChange}
                              required
                              placeholder="75000"
                              className="w-full px-4 py-4 bg-white/80 border-2 border-slate-200 rounded-2xl text-slate-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#A67C52] focus:ring-4 focus:ring-[#A67C52]/20 transition-all duration-300 hover:bg-white hover:border-[#A67C52]/40 font-medium shadow-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* How it works */}
                      <div className="p-6 bg-gradient-to-r from-[#A67C52]/10 to-yellow-50/50 rounded-2xl border-2 border-[#A67C52]/20">
                        <div className="flex items-start gap-3 mb-4">
                          <Users className="w-5 h-5 text-[#A67C52] mt-0.5" />
                          <div>
                            <h4 className="font-bold text-slate-900 mb-2">Comment ça marche ?</h4>
                            <ul className="text-sm text-slate-600 space-y-2">
                              <li className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-[#A67C52] rounded-full"></div>
                                <span>Nous vous fournissons gratuitement des sacs BagPub</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-[#A67C52] rounded-full"></div>
                                <span>Vous distribuez les sacs à vos clients</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-[#A67C52] rounded-full"></div>
                                <span>Vous recevez une commission par sac distribué</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-[#A67C52]/30 hover:shadow-[#A67C52]/40 hover:from-[#A67C52]/90 hover:to-yellow-600/90 transition-all duration-300 flex items-center justify-center gap-2 mt-4"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <Handshake className="w-5 h-5" />
                            Devenir partenaire
                          </>
                        )}
                      </motion.button>
                    </form>

                    {/* Contact info */}
                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                      <p className="text-slate-500 text-sm font-medium mb-2">
                        Questions ? Contactez notre équipe partenaires :
                      </p>
                      <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm">
                        <a href="mailto:partenaires@BagPub.fr" className="text-[#A67C52] hover:text-yellow-600 font-medium flex items-center justify-center gap-2">
                          <Mail className="w-4 h-4" />
                          partenaires@BagPub.fr
                        </a>
                        <span className="hidden sm:block text-slate-300">|</span>
                        <a href="tel:+33123456789" className="text-[#A67C52] hover:text-yellow-600 font-medium flex items-center justify-center gap-2">
                          <Phone className="w-4 h-4" />
                          01 23 45 67 89
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick benefits */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: <Percent className="w-4 h-4" />, text: 'Commission attractive' },
                    { icon: <Package className="w-4 h-4" />, text: 'Sacs gratuits' },
                    { icon: <Shield className="w-4 h-4" />, text: 'Sans engagement' }
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600 bg-white/80 p-3 rounded-xl border-2 border-[#A67C52]/20">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#A67C52]/20 to-yellow-100 rounded-lg flex items-center justify-center text-[#A67C52]">
                        {benefit.icon}
                      </div>
                      <span className="font-medium">{benefit.text}</span>
                    </div>
                  ))}
                </div>

                {/* Back link */}
                <div className="mt-8 flex justify-center">
                  <Link 
                    to="/" 
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors group font-medium px-4 py-2 rounded-full hover:bg-white/50"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Retour à l'accueil
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default RegisterPartnerPage;