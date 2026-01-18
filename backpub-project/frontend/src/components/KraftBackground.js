import React from 'react';
import { motion } from 'framer-motion';

// Composant de background Kraft réutilisable
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

export default KraftBackground;
