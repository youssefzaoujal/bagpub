import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';
import KraftBackground from '../components/KraftBackground';
import { 
  ArrowLeft, Eye, EyeOff, User, Mail, Lock, Building, 
  Hash, FileText, Loader2, CheckCircle, Shield, 
  ChevronRight, Store, CreditCard, BadgeCheck
} from 'lucide-react';

const RegisterClientPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    company_name: '',
    siret: '',
    tva_number: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const { registerClient } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const validateStep1 = () => {
    const { username, email, password } = formData;
    if (!username || !email || !password) {
      setError('Veuillez remplir tous les champs obligatoires');
      return false;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    if (!email.includes('@')) {
      setError('Veuillez entrer une adresse email valide');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const { company_name, siret, tva_number } = formData;
    if (!company_name || !siret || !tva_number) {
      setError('Veuillez remplir tous les champs professionnels');
      return false;
    }
    if (siret.length !== 14 || !/^\d+$/.test(siret)) {
      setError('Le SIRET doit contenir exactement 14 chiffres');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      setError('');
    } else if (step === 2 && validateStep2()) {
      setStep(3);
      setError('');
    }
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!acceptedTerms) {
      setError('Vous devez accepter les conditions générales');
      return;
    }
    
    setError('');
    setLoading(true);
    
    const result = await registerClient(formData);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#f8f5f2] via-yellow-50/20 to-orange-50/10 font-sans overflow-hidden text-slate-800">
      <KraftBackground />

      {/* === GAUCHE (VISUEL) === */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-16 z-10 border-r border-[#A67C52]/20 bg-white/60 backdrop-blur-xl">
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
            Rejoignez la révolution du
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A67C52] to-yellow-600 animate-gradient bg-[length:200%_auto]">
              marketing local partagé
            </span>
          </h1>
           
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-4 bg-white/80 backdrop-blur-sm p-6 rounded-3xl border-2 border-[#A67C52]/20 shadow-xl mb-8"
          >
            {[
              { text: '129€ pour 1000 sacs - Prix fixe garanti', icon: <BadgeCheck className="w-4 h-4" /> },
              { text: 'Distribution via réseau de partenaires', icon: <Store className="w-4 h-4" /> },
              { text: 'Analytics en temps réel', icon: <Building className="w-4 h-4" /> },
              { text: 'Support dédié 7j/7', icon: <Shield className="w-4 h-4" /> }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 text-slate-700 group hover:bg-[#A67C52]/5 p-2 rounded-xl transition-colors"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-8 h-8 bg-gradient-to-r from-[#A67C52] to-yellow-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow"
                >
                  <CheckCircle className="w-4 h-4 text-white fill-white" />
                </motion.div>
                <span className="font-medium flex items-center gap-2">
                  {item.icon}
                  {item.text}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Steps indicator */}
          <div className="p-6 bg-gradient-to-r from-[#A67C52]/10 to-yellow-50/50 rounded-3xl border-2 border-[#A67C52]/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Votre parcours d'inscription</h3>
              <span className="text-sm font-bold text-[#A67C52]">Étape {step}/3</span>
            </div>
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((num) => (
                <React.Fragment key={num}>
                  <div className={`flex flex-col items-center ${num <= step ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-md ${
                      num < step 
                        ? 'bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white' 
                        : num === step 
                        ? 'bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white' 
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}>
                      {num < step ? <CheckCircle size={18} /> : num}
                    </div>
                    <span className="text-xs font-medium text-slate-700">
                      {num === 1 ? 'Compte' : num === 2 ? 'Société' : 'Validation'}
                    </span>
                  </div>
                  {num < 3 && (
                    <div className={`h-1 w-16 rounded-full ${num < step ? 'bg-gradient-to-r from-[#A67C52] to-yellow-600' : 'bg-slate-300'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-[#A67C52] rounded-full animate-pulse"></div>
          <span className="text-xs text-slate-600 font-bold uppercase tracking-widest opacity-80">
            Inscription sécurisée • Données cryptées
          </span>
        </div>
      </div>

      {/* === DROITE (FORMULAIRE) === */}
      <div className="w-full lg:w-1/2 flex flex-col items-center p-4 sm:p-6 relative z-10 overflow-y-auto">
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-4 sm:top-8 left-4 sm:left-8">
          <img src={logo} alt="BagPub Logo" className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain" />
        </div>

        {/* Back button */}
        <Link 
          to="/" 
          className="lg:hidden absolute top-4 sm:top-8 right-4 sm:right-8 flex items-center gap-2 text-xs sm:text-sm text-slate-600 hover:text-slate-800 transition-colors group font-medium"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Accueil</span>
        </Link>

        <div className="w-full max-w-[500px] mt-16 sm:mt-20 lg:mt-0 lg:py-16">
          <div className="bg-white/90 backdrop-blur-sm border-2 border-[#A67C52]/20 rounded-2xl sm:rounded-[2.5rem] shadow-2xl shadow-[#A67C52]/10 relative overflow-hidden">
             
            <div className="p-6 sm:p-8 md:p-12 relative z-10">
              {/* Header */}
              <div className="text-center mb-8 sm:mb-10">
                <div className="inline-flex p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#A67C52]/10 to-yellow-50 border-2 border-[#A67C52]/20 mb-4 sm:mb-6 shadow-lg shadow-[#A67C52]/10">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-[#A67C52]" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#A67C52] to-yellow-600 bg-clip-text text-transparent mb-2">Inscription Client</h2>
                <p className="text-sm sm:text-base text-slate-600 font-medium">
                  Rejoignez la plateforme BagPub et multipliez votre visibilité
                </p>
              </div>

              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-gradient-to-r from-[#A67C52] to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#A67C52]/20">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-[#A67C52] to-yellow-600 bg-clip-text text-transparent mb-4">Inscription réussie !</h3>
                    <p className="text-slate-600 mb-6">
                      Votre compte a été créé avec succès. Redirection vers la page de connexion...
                    </p>
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#A67C52]/10 to-yellow-50 text-[#A67C52] rounded-full font-medium border-2 border-[#A67C52]/20">
                      <div className="w-2 h-2 bg-[#A67C52] rounded-full animate-pulse"></div>
                      Patientez quelques secondes
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {/* Error message */}
                    {error && (
                      <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-50/80 border border-red-200 rounded-2xl text-red-700 text-sm flex items-start gap-3 font-medium shadow-sm">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0 mt-1" />
                        <span>{typeof error === 'object' ? JSON.stringify(error) : error}</span>
                      </div>
                    )}

                    {/* Form steps */}
                    <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}>
                      {/* Step 1: Account info */}
                      {step === 1 && (
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                              <User size={12} />
                              Nom d'utilisateur
                            </label>
                            <input
                              type="text"
                              name="username"
                              value={formData.username}
                              onChange={handleChange}
                              required
                              placeholder="john_doe"
                              className="w-full px-4 py-4 bg-white/80 border-2 border-slate-200 rounded-2xl text-slate-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#A67C52] focus:ring-4 focus:ring-[#A67C52]/20 transition-all duration-300 hover:bg-white hover:border-[#A67C52]/40 font-medium shadow-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                              <Mail size={12} />
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
                              <Lock size={12} />
                              Mot de passe
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Minimum 8 caractères"
                                className="w-full px-4 pr-12 py-4 bg-white/80 border-2 border-slate-200 rounded-2xl text-slate-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#A67C52] focus:ring-4 focus:ring-[#A67C52]/20 transition-all duration-300 hover:bg-white hover:border-[#A67C52]/40 font-medium shadow-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#A67C52] transition-colors"
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              • 8 caractères minimum • 1 majuscule • 1 chiffre
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Company info */}
                      {step === 2 && (
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                              <Building size={12} />
                              Nom de l'entreprise
                            </label>
                            <input
                              type="text"
                              name="company_name"
                              value={formData.company_name}
                              onChange={handleChange}
                              required
                              placeholder="Ma Société SAS"
                              className="w-full px-4 py-4 bg-white/80 border-2 border-slate-200 rounded-2xl text-slate-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#A67C52] focus:ring-4 focus:ring-[#A67C52]/20 transition-all duration-300 hover:bg-white hover:border-[#A67C52]/40 font-medium shadow-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                              <Hash size={12} />
                              Numéro SIRET
                              <span className="text-[#A67C52] ml-auto">14 chiffres</span>
                            </label>
                            <input
                              type="text"
                              name="siret"
                              value={formData.siret}
                              onChange={handleChange}
                              required
                              placeholder="12345678901234"
                              maxLength="14"
                              className="w-full px-4 py-4 bg-white/80 border-2 border-slate-200 rounded-2xl text-slate-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#A67C52] focus:ring-4 focus:ring-[#A67C52]/20 transition-all duration-300 hover:bg-white hover:border-[#A67C52]/40 font-medium shadow-sm tracking-widest"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                              <FileText size={12} />
                              Numéro TVA intracommunautaire
                            </label>
                            <input
                              type="text"
                              name="tva_number"
                              value={formData.tva_number}
                              onChange={handleChange}
                              required
                              placeholder="FR12345678901"
                              className="w-full px-4 py-4 bg-white/80 border-2 border-slate-200 rounded-2xl text-slate-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#A67C52] focus:ring-4 focus:ring-[#A67C52]/20 transition-all duration-300 hover:bg-white hover:border-[#A67C52]/40 font-medium shadow-sm"
                            />
                          </div>

                          <div className="p-4 bg-gradient-to-r from-[#A67C52]/10 to-yellow-50/50 rounded-2xl border-2 border-[#A67C52]/20">
                            <div className="flex items-start gap-3">
                              <Shield className="w-5 h-5 text-[#A67C52] mt-0.5" />
                              <div>
                                <p className="text-sm text-slate-700 font-medium">
                                  Vos informations d'entreprise sont nécessaires pour la facturation et la conformité légale.
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                  Ces données sont cryptées et protégées selon le RGPD.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Confirmation */}
                      {step === 3 && (
                        <div className="space-y-6">
                          {/* Summary */}
                          <div className="bg-gradient-to-br from-[#A67C52]/10 to-yellow-50/50 rounded-2xl p-6 border-2 border-[#A67C52]/20">
                            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                              <BadgeCheck className="w-5 h-5 text-[#A67C52]" />
                              Récapitulatif de votre inscription
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-sm text-slate-600">Nom d'utilisateur</span>
                                <span className="font-medium text-slate-900">{formData.username}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-sm text-slate-600">Email</span>
                                <span className="font-medium text-slate-900">{formData.email}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-sm text-slate-600">Entreprise</span>
                                <span className="font-medium text-slate-900">{formData.company_name}</span>
                              </div>
                              <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-slate-600">SIRET</span>
                                <span className="font-mono font-medium text-slate-900">{formData.siret}</span>
                              </div>
                            </div>
                          </div>

                          {/* Terms & Conditions */}
                          <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
                              <input
                                type="checkbox"
                                id="terms"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                className="mt-1 w-5 h-5 text-[#A67C52] bg-white border-2 border-slate-300 rounded focus:ring-[#A67C52] focus:ring-2"
                              />
                              <label htmlFor="terms" className="text-sm text-slate-700 cursor-pointer">
                                J'accepte les{' '}
                                <Link to="/terms" className="text-[#A67C52] hover:text-yellow-600 font-medium">
                                  conditions générales d'utilisation
                                </Link>{' '}
                                et la{' '}
                                <Link to="/privacy" className="text-[#A67C52] hover:text-yellow-600 font-medium">
                                  politique de confidentialité
                                </Link>{' '}
                                de BagPub. Je certifie que les informations fournies sont exactes.
                              </label>
                            </div>

                            {/* Benefits */}
                            <div className="p-4 bg-gradient-to-r from-[#A67C52]/10 to-yellow-50/50 rounded-2xl border-2 border-[#A67C52]/20">
                              <div className="flex items-center gap-3">
                                <Store className="w-5 h-5 text-[#A67C52]" />
                                <div>
                                  <p className="text-sm font-medium text-slate-800">
                                    Votre compte client vous donne accès à :
                                  </p>
                                  <ul className="text-xs text-slate-600 mt-1 space-y-1">
                                    <li>• Création de campagnes avec 9 cartes par sac</li>
                                    <li>• Distribution via notre réseau de partenaires</li>
                                    <li>• Tableau de bord analytique en temps réel</li>
                                    <li>• Support client dédié</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Navigation buttons */}
                      <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                        {step > 1 ? (
                          <motion.button
                            type="button"
                            onClick={handlePreviousStep}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-colors flex items-center gap-2"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            Retour
                          </motion.button>
                        ) : (
                          <Link
                            to="/"
                            className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-colors flex items-center gap-2"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            Accueil
                          </Link>
                        )}

                        {step < 3 ? (
                          <motion.button
                            type="button"
                            onClick={handleNextStep}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white font-medium hover:from-[#A67C52]/90 hover:to-yellow-600/90 transition-all flex items-center gap-2 shadow-lg shadow-[#A67C52]/20"
                          >
                            Continuer
                            <ChevronRight className="w-4 h-4" />
                          </motion.button>
                        ) : (
                          <motion.button
                            type="submit"
                            disabled={loading || !acceptedTerms}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg ${
                              acceptedTerms
                                ? 'bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white hover:from-[#A67C52]/90 hover:to-yellow-600/90'
                                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Traitement...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Finaliser l'inscription
                              </>
                            )}
                          </motion.button>
                        )}
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Login link */}
              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-slate-500 text-sm font-medium">
                  Déjà un compte ?{' '}
                  <Link 
                    to="/login" 
                    className="font-bold text-[#A67C52] hover:text-yellow-600 hover:underline transition-colors"
                  >
                    Se connecter
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Info footer */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-3 h-3" />
              <span>Vos données sont sécurisées et jamais partagées avec des tiers.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterClientPage;