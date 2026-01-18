import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Utensils, Stethoscope, Dumbbell, Car, Scissors, 
  Coffee, Laptop, Home, Gift, Music 
} from 'lucide-react';

// ============================================
// SOUS-COMPOSANT : CARTE 3D INTERACTIVE
// ============================================

const Card3D = ({ data }) => {
  // Variables pour l'effet de tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x);
  const mouseY = useSpring(y);

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXFromCenter = e.clientX - rect.left - width / 2;
    const mouseYFromCenter = e.clientY - rect.top - height / 2;
    x.set(mouseXFromCenter / width);
    y.set(mouseYFromCenter / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex-shrink-0 w-[280px] h-[160px] md:w-[320px] md:h-[180px] rounded-xl cursor-pointer perspective-1000 mx-4"
    >
      {/* Contenu de la carte */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${data.gradient} p-6 shadow-xl border border-white/20 flex flex-col justify-between overflow-hidden group`}>
        
        {/* Motif de fond décoratif */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
        
        {/* En-tête Carte */}
        <div className="relative z-10 flex justify-between items-start">
          <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            {data.icon}
          </div>
          <div className="text-white/80 text-xs font-medium tracking-wider uppercase border border-white/20 px-2 py-1 rounded-full">
            {data.category}
          </div>
        </div>

        {/* Info Carte */}
        <div className="relative z-10 text-white">
          <h3 className="font-bold text-lg md:text-xl leading-tight mb-1">{data.name}</h3>
          <p className="text-white/70 text-xs md:text-sm">{data.tagline}</p>
        </div>

        {/* Effet de brillance (Glare) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </motion.div>
  );
};

// ============================================
// COMPOSANT PRINCIPAL : CAROUSEL SECTION
// ============================================

const CardsShowcase = () => {
  // Données factices pour les 10 cartes
  const cards = [
    { name: "Bella Pizza", tagline: "Saveurs d'Italie", category: "Restaurant", icon: <Utensils size={20} />, gradient: "from-red-500 to-orange-600" },
    { name: "Dr. Vet", tagline: "Clinique Vétérinaire", category: "Santé", icon: <Stethoscope size={20} />, gradient: "from-blue-500 to-cyan-500" },
    { name: "Iron Gym", tagline: "Fitness & Crossfit", category: "Sport", icon: <Dumbbell size={20} />, gradient: "from-stone-700 to-stone-900" },
    { name: "Auto Clean", tagline: "Lavage Écologique", category: "Auto", icon: <Car size={20} />, gradient: "from-emerald-500 to-green-600" },
    { name: "Arttif", tagline: "Coiffure & Visagiste", category: "Beauté", icon: <Scissors size={20} />, gradient: "from-pink-500 to-rose-600" },
    { name: "Café Moka", tagline: "Torréfacteur Local", category: "Détente", icon: <Coffee size={20} />, gradient: "from-amber-600 to-yellow-700" },
    { name: "Tech Fix", tagline: "Réparation Express", category: "Service", icon: <Laptop size={20} />, gradient: "from-indigo-500 to-violet-600" },
    { name: "Immo Plus", tagline: "Agence Immobilière", category: "Immo", icon: <Home size={20} />, gradient: "from-sky-600 to-blue-700" },
    { name: "Fleuriste", tagline: "Compositions Uniques", category: "Cadeaux", icon: <Gift size={20} />, gradient: "from-fuchsia-500 to-purple-600" },
    { name: "Music Store", tagline: "Instruments & Son", category: "Loisir", icon: <Music size={20} />, gradient: "from-slate-800 to-slate-900" },
  ];

  // Dupliquer les cartes pour l'effet infini
  const duplicatedCards = [...cards, ...cards];

  return (
    <section className="py-20 bg-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12 text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wide mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Réalisations
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Des exemples <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">concrets</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Découvrez comment nous mettons en valeur l'identité visuelle de nos partenaires sur nos sacs publicitaires.
          </p>
        </motion.div>
      </div>

      {/* Conteneur du Carousel avec effet de masque sur les bords */}
      <div className="relative w-full">
        {/* Masques de dégradé gauche/droite */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />

        {/* Bande défilante */}
        <div className="flex overflow-hidden py-10">
          <motion.div
            className="flex"
            animate={{
              x: ["0%", "-50%"],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 40, // Vitesse du défilement (plus grand = plus lent)
                ease: "linear",
              },
            }}
            // Pause au survol pour permettre l'interaction
            whileHover={{ animationPlayState: "paused" }} 
          >
            {duplicatedCards.map((card, idx) => (
              <Card3D key={idx} data={card} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CardsShowcase;