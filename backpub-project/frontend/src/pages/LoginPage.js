import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Eye, EyeOff, User, Lock, ShoppingBag, 
  Loader2, CheckCircle, Building, Printer, Shield
} from 'lucide-react';
import logo from '../assets/logo.png';
import KraftBackground from '../components/KraftBackground';

function LoginPage() {
  const [formData, setFormData] = useState({ 
    identifier: '', 
    password: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await login(formData.identifier, formData.password);
      
      if (!result.success) {
        setError(result.error || 'Identifiants incorrects');
        setLoading(false);
        return;
      }

      // Redirection immédiate basée sur le rôle
      if (result.user) {
        // Si on a les données utilisateur directement, rediriger immédiatement
        if (result.user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (result.user.role === 'client') {
          navigate('/client/dashboard', { replace: true });
        }
      } else {
        // Sinon, attendre que user soit mis à jour (fallback)
        // Le useEffect gérera la redirection
      }
    } catch (error) {
      setError('Une erreur est survenue lors de la connexion');
      setLoading(false);
    }
  };

  // Redirection automatique basée sur le rôle après connexion (fallback)
  useEffect(() => {
    if (user && !loading) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'client') {
        navigate('/client/dashboard', { replace: true });
      }
      setLoading(false);
    }
  }, [user, loading, navigate]);

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
            Accédez à la puissance du
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A67C52] to-yellow-600 animate-gradient bg-[length:200%_auto]">
              marketing local partagé
            </span>
          </h1>
           
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-4 bg-white/80 backdrop-blur-sm p-6 rounded-3xl border-2 border-[#A67C52]/20 shadow-xl"
          >
            {[
              { text: 'Suivi en temps réel de vos commandes', icon: <ShoppingBag className="w-4 h-4" /> },
              { text: 'Gestion de vos cartes sur sacs craft', icon: <Printer className="w-4 h-4" /> },
              { text: 'Analytics détaillés de distribution', icon: <Building className="w-4 h-4" /> },
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

          {/* Comptes de test */}
          
        </motion.div>

        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-[#A67C52] rounded-full animate-pulse"></div>
          <span className="text-xs text-slate-600 font-bold uppercase tracking-widest opacity-80">
            Connexion 100% sécurisée • SSL/TLS
          </span>
        </div>
      </div>

      {/* === DROITE (FORMULAIRE) === */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4 sm:p-6 relative z-10">
        
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-4 sm:top-8 left-4 sm:left-8">
          <img src={logo} alt="BagPub Logo" className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain" />
        </div>

        <div className="w-full max-w-[440px] mt-12 sm:mt-16 lg:mt-0">
          {/* Carte Glassmorphism Kraft */}
          <div className="bg-white/90 backdrop-blur-sm border-2 border-[#A67C52]/20 p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-[2.5rem] shadow-2xl shadow-[#A67C52]/10 relative overflow-hidden">
             
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10 relative z-10"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-[#A67C52]/10 to-yellow-50 border-2 border-[#A67C52]/20 mb-6 shadow-lg shadow-[#A67C52]/10"
              >
                <Lock className="w-8 h-8 text-[#A67C52]" />
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#A67C52] to-yellow-600 bg-clip-text text-transparent mb-2">
                Connexion BagPub
              </h2>
              <p className="text-sm sm:text-base text-slate-600 font-medium">Accédez à votre espace personnel en toute sécurité</p>
            </motion.div>

            {error && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-50/80 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-3 font-medium shadow-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {/* Identifiant */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest ml-1">
                  Nom d'utilisateur
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#A67C52] transition-colors duration-300" />
                  </div>
                  <input 
                    type="text" 
                    name="identifier" 
                    value={formData.identifier} 
                    onChange={handleChange} 
                    required
                    placeholder="Votre identifiant"
                    className="w-full pl-12 pr-4 py-4 bg-white/80 border-2 border-slate-200 rounded-2xl text-slate-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#A67C52] focus:ring-4 focus:ring-[#A67C52]/20 transition-all duration-300 hover:bg-white hover:border-[#A67C52]/40 font-medium shadow-sm" 
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                    Mot de passe
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-xs font-bold text-[#A67C52] hover:text-yellow-600 hover:underline transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#A67C52] transition-colors duration-300" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-white/80 border-2 border-slate-200 rounded-2xl text-slate-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#A67C52] focus:ring-4 focus:ring-[#A67C52]/20 transition-all duration-300 hover:bg-white hover:border-[#A67C52]/40 font-medium shadow-sm" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#A67C52] transition-colors duration-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Bouton Connexion */}
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-[#A67C52]/30 hover:shadow-[#A67C52]/40 hover:from-[#A67C52]/90 hover:to-yellow-600/90 transition-all duration-300 flex items-center justify-center gap-2 mt-6 group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Se connecter
                  </>
                )}
              </motion.button>
            </form>
          </div>

          {/* Liens supplémentaires */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-slate-500 text-sm font-medium">
              Pas encore de compte ?{' '}
              <Link 
                to="/register/client" 
                className="font-bold text-[#A67C52] hover:text-yellow-600 hover:underline transition-colors"
              >
                S'inscrire comme client
              </Link>
            </p>
            
            <div className="flex justify-center gap-4">
              <Link 
                to="/register/partner" 
                className="text-xs font-bold text-slate-700 hover:text-[#A67C52] transition-colors px-4 py-2 rounded-full bg-white/80 border-2 border-[#A67C52]/20 hover:border-[#A67C52]/40 hover:bg-[#A67C52]/5"
              >
                Devenir partenaire
              </Link>
            </div>
          </div>
          
          {/* Retour accueil */}
          <div className="mt-8 flex justify-center">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors group font-medium px-4 py-2 rounded-full hover:bg-white/50"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Retour à l'accueil
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;