// src/pages/NotFoundPage.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft, AlertCircle, Compass } from 'lucide-react';
import KraftBackground from '../components/KraftBackground';
import logo from '../assets/logo.png';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8f5f2] via-yellow-50/20 to-orange-50/10 font-sans overflow-hidden text-slate-800 relative">
      <KraftBackground />
      
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="max-w-2xl w-full text-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mb-6 sm:mb-8"
          >
            <img src={logo} alt="BagPub Logo" className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto object-contain" />
          </motion.div>

          {/* 404 Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="text-7xl sm:text-9xl md:text-[12rem] font-extrabold bg-gradient-to-r from-[#A67C52] via-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4"
            >
              404
            </motion.div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-red-50 border-2 border-red-200 text-red-700 mb-4 sm:mb-6"
            >
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-bold text-xs sm:text-sm">Page non trouvée</span>
            </motion.div>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mb-8 sm:mb-12"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 sm:mb-4">
              Oups ! Cette page n'existe pas
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
              La page que vous recherchez semble avoir été déplacée ou n'existe plus.
              <br className="hidden md:block" />
              Ne vous inquiétez pas, nous pouvons vous aider à retrouver votre chemin !
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white font-bold rounded-2xl shadow-xl shadow-[#A67C52]/30 hover:shadow-[#A67C52]/40 transition-all"
            >
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-[#A67C52]/20 text-slate-700 font-bold rounded-2xl shadow-lg hover:border-[#A67C52]/40 hover:bg-[#A67C52]/5 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Page précédente
            </motion.button>
          </motion.div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="bg-white/90 backdrop-blur-sm border-2 border-[#A67C52]/20 rounded-3xl p-8 shadow-xl"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Compass className="w-5 h-5 text-[#A67C52]" />
              <h2 className="text-xl font-bold text-slate-900">Liens utiles</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { to: '/login', label: 'Connexion', icon: <Search className="w-4 h-4" /> },
                { to: '/register/client', label: 'Inscription Client', icon: <Home className="w-4 h-4" /> },
                { to: '/register/partner', label: 'Devenir Partenaire', icon: <Home className="w-4 h-4" /> },
              ].map((link, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <Link
                    to={link.to}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-[#A67C52]/5 to-yellow-50 border-2 border-[#A67C52]/20 hover:border-[#A67C52]/40 hover:bg-[#A67C52]/10 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#A67C52] to-yellow-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      {link.icon}
                    </div>
                    <span className="font-medium text-slate-700 group-hover:text-[#A67C52] transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-12 flex justify-center gap-2"
          >
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-3 h-3 bg-[#A67C52] rounded-full"
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
