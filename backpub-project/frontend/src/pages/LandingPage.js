import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  AnimatePresence,
  useInView,
  useMotionValue,
  useTransform,
  useAnimation,
  useReducedMotion
} from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import template1 from '../assets/1.jpg';
import template2 from '../assets/2.jpg';
import template3 from '../assets/3.jpg';
import template4 from '../assets/4.jpg';
import template5 from '../assets/5.jpg';
import {
  ShoppingBag, Users, TrendingUp, Zap,
  CheckCircle2, ArrowRight, Facebook, Instagram, Linkedin,
  Menu, X, LayoutDashboard, Rocket, Star, Quote, BarChart3,
  Eye, Store, Sparkles, Leaf, Heart,
  ArrowUpRight, Clock,
  ShieldCheck, MessageCircle, Award, ChevronRight, Mail, MapPin,
  Calculator, MousePointer2, Coins, Package, QrCode,
  ShoppingCart, Truck, ChevronLeft, ChevronDown, ExternalLink,
  Headphones,
  // Nouvelles icônes pour le carousel de cartes :
  Utensils, Stethoscope, Dumbbell, Car, Scissors, 
  Coffee, Laptop, Home, Gift, Music 
} from 'lucide-react';


const cards = [
  {
    name: "Bella Pizza",
    tagline: "Saveurs d'Italie",
    category: "Restaurant",
    icon: <Utensils size={20} />,
    image: template1,
  },
  {
    name: "Dr. Vet",
    tagline: "Clinique Vétérinaire",
    category: "Santé",
    icon: <Stethoscope size={20} />,
    image: template2,
  },
  {
    name: "Iron Gym",
    tagline: "Fitness & Crossfit",
    category: "Sport",
    icon: <Dumbbell size={20} />,
    image: template3,
  },
  {
    name: "Auto Clean",
    tagline: "Lavage Écologique",
    category: "Auto",
    icon: <Car size={20} />,
    image: template4,
  },
  {
    name: "Arttif",
    tagline: "Coiffure & Visagiste",
    category: "Beauté",
    icon: <Scissors size={20} />,
    image: template5,
  },
];

// ============================================
// HOOKS PERSONNALISÉS AMÉLIORÉS
// ============================================

/**
 * Hook pour gérer les performances et l'adaptabilité
 * - Correction de l'erreur ResizeObserver
 */
// ============================================
// NOUVEAU COMPOSANT : CAROUSEL DE CARTES 3D
// ============================================



const Card3D = memo(({ data }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const shouldReduceMotion = useReducedMotion();

  const rotateX = useTransform(y, [-0.5, 0.5], shouldReduceMotion ? ["0deg", "0deg"] : ["15deg", "-15deg"]);
  const rotateY = useTransform(x, [-0.5, 0.5], shouldReduceMotion ? ["0deg", "0deg"] : ["-15deg", "15deg"]);

  const handleMouseMove = useCallback((e) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) / rect.width);
    y.set((e.clientY - rect.top - rect.height / 2) / rect.height);
  }, [shouldReduceMotion, x, y]);

  const reset = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      style={{ perspective: 1000 }}
      className="relative mx-4 w-[280px] h-[160px] md:w-[320px] md:h-[180px]"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl"
      >
        {/* IMAGE */}
        <img
          src={data.image}
          alt={data.name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          style={{ willChange: 'transform' }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Contenu */}
        <div
          className="relative z-10 p-4 h-full flex flex-col justify-between text-white"
          style={{ transform: "translateZ(30px)" }}
        >
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur">
              {data.icon}
            </div>
            <span className="text-xs font-semibold uppercase">
              {data.category}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold">{data.name}</h3>
            <p className="text-sm opacity-90">{data.tagline}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}, (prevProps, nextProps) => prevProps.data.name === nextProps.data.name);
Card3D.displayName = 'Card3D';

const CardsShowcase = memo(() => {
  const shouldReduceMotion = useReducedMotion();
  const duplicatedCards = useMemo(() => [...cards, ...cards], []); // Pour l'effet infini

  return (
    <section className="py-20 bg-white overflow-hidden relative border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 text-[#A67C52] text-xs font-bold uppercase tracking-wide mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A67C52]"></span>
            </span>
            Réalisations
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Des exemples <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A67C52] to-yellow-600">concrets</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Découvrez le rendu premium de nos cartes sur sacs craft.
          </p>
        </motion.div>
      </div>

      <div className="relative w-full">
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />
        <div className="flex overflow-visible py-10">
          <motion.div
            className="flex"
            animate={shouldReduceMotion ? { x: 0 } : { x: ["0%", "-50%"] }}
            transition={shouldReduceMotion ? {} : { x: { repeat: Infinity, repeatType: "loop", duration: 40, ease: "linear" }}}
            whileHover={shouldReduceMotion ? {} : { animationPlayState: "paused" }}
          >
            {duplicatedCards.map((card, idx) => (
              <Card3D key={idx} data={card} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
});
CardsShowcase.displayName = 'CardsShowcase';

const usePerformanceMode = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    let timeoutId;
    
    const checkDevice = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setReduceMotion(mobile || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    };

    // Délai pour éviter les boucles ResizeObserver
    timeoutId = setTimeout(checkDevice, 100);
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkDevice, 150); // Délai augmenté
    };

    window.addEventListener('resize', handleResize, { passive: true });

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setReduceMotion(mediaQuery.matches), 100);
    };
    
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return { isMobile, reduceMotion };
};

/**
 * Hook magnetic avec effet avancé
 */
const useMagnetic = (strength = 0.2, enabled = true) => {
  const ref = useRef(null);
  const position = useMotionValue({ x: 0, y: 0 });
  const rotation = useMotionValue(0);
  const animationFrameId = useRef(null);

  const handleMouse = useCallback((e) => {
    if (!enabled || !ref.current) return;

    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }

    animationFrameId.current = requestAnimationFrame(() => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = ref.current.getBoundingClientRect();
      const middleX = clientX - (left + width / 2);
      const middleY = clientY - (top + height / 2);
      
      position.set({ 
        x: middleX * strength, 
        y: middleY * strength 
      });
      
      rotation.set(middleX * 0.02);
    });
  }, [enabled, strength, position, rotation]);

  const reset = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    
    position.set({ x: 0, y: 0 });
    rotation.set(0);
  }, [position, rotation]);

  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return { ref, position, rotation, handleMouse, reset };
};

/**
 * Hook pour les intersections avec throttling
 */
const useThrottledInView = (ref, options = {}) => {
  const [isInView, setIsInView] = useState(false);
  const [hasBeenViewed, setHasBeenViewed] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setHasBeenViewed(true);
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px',
        ...options 
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, options]);

  return { isInView, hasBeenViewed };
};

// ============================================
// COMPOSANTS UI RÉUTILISABLES
// ============================================

/**
 * Texte avec effet de révélation
 */
const TextReveal = ({ 
  children, 
  className = "", 
  delay = 0, 
  enabled = true, 
  duration = 0.8,
  as: Component = 'div'
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  if (!enabled || typeof children !== 'string') {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.span
        initial={{ y: "120%" }}
        animate={isInView ? { y: 0 } : {}}
        transition={{ 
          duration, 
          delay,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="inline-block"
      >
        {children}
      </motion.span>
      <motion.span
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ 
          duration: duration * 0.8, 
          delay: delay + duration * 0.3,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#A67C52]/0 via-[#A67C52] to-[#A67C52]/0 transform origin-left"
      />
    </Component>
  );
};

/**
 * Compteur animé avec effets
 */
const AnimatedCounter = ({ 
  end, 
  suffix = "", 
  duration = 2, 
  className = "", 
  prefix = "",
  delay = 0 
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const { isInView } = useThrottledInView(ref);

  useEffect(() => {
    if (!isInView) return;

    let animationId;
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;
    
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easedProgress * end));
      
      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };
    
    const timeout = setTimeout(() => {
      animationId = requestAnimationFrame(animate);
    }, delay * 1000);
    
    return () => {
      clearTimeout(timeout);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isInView, end, duration, delay]);

  return (
    <motion.span
      ref={ref}
      initial={{ scale: 0.5, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 200, delay }}
      className={`tabular-nums font-black ${className}`}
    >
      {prefix}{count.toLocaleString()}{suffix}
    </motion.span>
  );
};

/**
 * Badge élégant avec variants
 */
const Badge = ({ children, variant = "primary", className = "", icon }) => {
  const variants = {
    primary: "bg-yellow-50 text-yellow-800 border-yellow-200",
    secondary: "bg-[#A67C52]/10 text-[#A67C52] border-[#A67C52]/20",
    success: "bg-emerald-100 text-emerald-700 border-emerald-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    purple: "bg-orange-100 text-orange-700 border-orange-200",
    blue: "bg-yellow-50 text-yellow-800 border-yellow-200"
  };

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}>
      {icon && React.cloneElement(icon, { size: 12 })}
      {children}
    </span>
  );
};

/**
 * Texte avec dégradé animé
 */
const GradientText = ({ 
  children, 
  className = "", 
  gradient = "from-[#A67C52] to-yellow-600",
  animate = true 
}) => (
  <span 
    className={`
      bg-gradient-to-r ${gradient} 
      bg-clip-text text-transparent 
      ${animate ? 'animate-gradient bg-[length:200%_auto]' : ''} 
      ${className}
    `}
  >
    {children}
  </span>
);

/**
 * Bouton avancé avec effets
 */
const WowButton = ({ 
  children, 
  onClick, 
  variant = "primary", 
  className = "", 
  icon, 
  size = "default",
  magnetic = true,
  glow = true,
  fullWidth = false,
  type = "button"
}) => {
  const { isMobile } = usePerformanceMode();
  const shouldMagnetic = magnetic && !isMobile;
  const { ref, position, rotation, handleMouse, reset } = useMagnetic(0.15, shouldMagnetic);
  
  const sizes = {
    sm: "px-6 py-2.5 text-sm",
    default: "px-8 py-3.5 text-base",
    lg: "px-10 py-4 text-lg"
  };

  const variants = {
    primary: "bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white shadow-lg hover:shadow-xl hover:shadow-[#A67C52]/30",
    secondary: "bg-white text-slate-900 border-2 border-slate-200 hover:border-[#A67C52] shadow-md hover:shadow-lg",
    outline: "bg-transparent text-slate-700 border-2 border-slate-300 hover:border-[#A67C52] hover:text-[#A67C52]",
    gradient: "bg-gradient-to-r from-[#A67C52] via-yellow-500 to-orange-600 text-white shadow-lg hover:shadow-xl hover:shadow-[#A67C52]/30"
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={shouldMagnetic ? handleMouse : undefined}
      onMouseLeave={shouldMagnetic ? reset : undefined}
      style={shouldMagnetic ? { 
        x: position.get().x, 
        y: position.get().y,
        rotate: rotation.get()
      } : {}}
      whileHover={!isMobile ? { scale: 1.05, y: -2 } : {}}
      whileTap={!isMobile ? { scale: 0.98 } : {}}
      onClick={onClick}
      type={type}
      className={`
        relative rounded-xl font-semibold overflow-hidden group isolate 
        transition-all duration-300 active:scale-95
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {glow && variant === "primary" && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#A67C52]/20 to-yellow-400/20"
          initial={false}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.15)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0,0_0] bg-no-repeat transition-[background-position_0s_ease] duration-0 group-hover:bg-[position:200%_0,0_0] group-hover:duration-[1500ms]" />
      
      <span className="relative z-10 flex items-center gap-2 justify-center">
        {icon && React.cloneElement(icon, { size: size === "lg" ? 20 : 18 })}
        {children}
        <ArrowRight size={size === "lg" ? 18 : 16} className="transition-transform group-hover:translate-x-1" />
      </span>
    </motion.button>
  );
};

/**
 * Carte élégante avec effets
 */
const ElegantCard = ({ 
  children, 
  className = "", 
  hover = true, 
  glow = false,
  onClick 
}) => {
  const { isMobile, reduceMotion } = usePerformanceMode();
  
  return (
    <motion.div
      className={`
        relative bg-white rounded-2xl border border-slate-200 
        shadow-sm hover:shadow-lg transition-all duration-300 
        overflow-hidden group ${onClick ? 'cursor-pointer' : ''} ${className}
      `}
      whileHover={hover && !isMobile && !reduceMotion ? { y: -8, scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#A67C52]/0 via-[#A67C52]/10 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
      )}
      
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/0 to-yellow-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 bg-white/80 backdrop-blur-sm">{children}</div>
    </motion.div>
  );
};

// ============================================
// COMPOSANTS SPÉCIFIQUES - OPTIMISÉS
// ============================================

/**
 * Particules flottantes avec WebGL optimisé
 * - Correction ResizeObserver
 */
const FloatingParticles = ({ count = 20, className = "" }) => {
  const canvasRef = useRef(null);
  const { isMobile } = usePerformanceMode();
  const animationId = useRef(null);
  const resizeObserver = useRef(null);
  
  const particles = useMemo(() => {
    if (isMobile) return [];
    
    return Array.from({ length: Math.min(count, 30) }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.4 + 0.1,
      angle: Math.random() * Math.PI * 2,
      color: `hsla(${210 + Math.random() * 60}, 100%, 65%, ${Math.random() * 0.1 + 0.05})`
    }));
  }, [count, isMobile]);

  useEffect(() => {
    if (isMobile || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frameCount = 0;
    
    const resize = () => {
      if (!canvasRef.current) return;
      
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    
    // Utilisation de setTimeout au lieu de ResizeObserver pour éviter l'erreur
    const handleResize = () => {
      setTimeout(resize, 100);
    };
    
    resize();
    
    // Écouteur d'événement resize classique
    window.addEventListener('resize', handleResize, { passive: true });

    const animate = () => {
      if (!canvasRef.current) return;
      
      frameCount++;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += Math.cos(particle.angle + frameCount * 0.01) * particle.speed;
        particle.y += Math.sin(particle.angle + frameCount * 0.01) * particle.speed;
        
        if (particle.x < 0 || particle.x > 100) particle.angle = Math.PI - particle.angle;
        if (particle.y < 0 || particle.y > 100) particle.angle = -particle.angle;
        
        const x = (particle.x / 100) * canvas.width;
        const y = (particle.y / 100) * canvas.height;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, particle.size * 4);
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(x, y, particle.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });
      
      animationId.current = requestAnimationFrame(animate);
    };
    
    animationId.current = requestAnimationFrame(animate);

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
      window.removeEventListener('resize', handleResize);
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
      }
    };
  }, [particles, isMobile]);

  if (isMobile) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ 
        willChange: 'transform',
        imageRendering: 'crisp-edges'
      }}
    />
  );
};

/**
 * Background Kraft avec texture et animations
 */
const KraftBackground = () => {
  const { scrollY } = useScroll();
  const { isMobile } = usePerformanceMode();
  
  // Parallaxe pour les blobs
  const blob1Y = useTransform(scrollY, [0, 1000], [0, 200]);
  const blob2Y = useTransform(scrollY, [0, 1000], [0, -150]);
  const blob3Y = useTransform(scrollY, [0, 1000], [0, 100]);
  const blob4Y = useTransform(scrollY, [0, 1000], [0, 80]);
  
  // Animation pour la texture kraft
  const noiseOpacity = useTransform(scrollY, [0, 500], [0.08, 0.12]);
  
  if (isMobile) {
    return (
      <div className="fixed inset-0 -z-10 bg-[#f8f5f2]">
        <div className="absolute inset-0 bg-kraft-noise opacity-[0.1] mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-kraft-texture opacity-[0.05]"></div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#f8f5f2]">
      {/* Texture Kraft Noise - Couche principale */}
      <motion.div 
        className="absolute inset-0 bg-kraft-noise mix-blend-overlay"
        style={{ opacity: noiseOpacity }}
      />
      
      {/* Texture Kraft - Motif de fibres */}
      <motion.div 
        className="absolute inset-0 bg-kraft-texture opacity-[0.06]"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear"
        }}
      />
      
      {/* Texture de grain kraft animée */}
      <motion.div
        className="absolute inset-0 bg-kraft-grain opacity-[0.04]"
        animate={{
          opacity: [0.03, 0.06, 0.03],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Blobs animés avec parallaxe et animations */}
      <motion.div
        style={{ y: blob1Y }}
        className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-yellow-400/20 via-orange-300/15 to-transparent rounded-full blur-[120px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
          x: [0, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        style={{ y: blob2Y }}
        className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-orange-300/20 via-yellow-200/15 to-transparent rounded-full blur-[120px]"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.3, 0.2],
          x: [0, -25, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
      <motion.div
        style={{ y: blob3Y }}
        className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-gradient-to-br from-yellow-300/15 via-orange-200/10 to-transparent rounded-full blur-[100px]"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div
        style={{ y: blob4Y }}
        className="absolute top-[60%] right-[20%] w-[25%] h-[25%] bg-gradient-to-bl from-[#A67C52]/10 via-yellow-200/8 to-transparent rounded-full blur-[80px]"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.08, 0.15, 0.08],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4
        }}
      />
      
      {/* Lignes de fibres kraft animées */}
      <motion.div
        className="absolute inset-0 bg-kraft-fibers opacity-[0.03]"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear"
        }}
      />
      
      {/* Effet de lumière subtil qui bouge */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[40%] h-[40%] bg-gradient-radial from-yellow-100/20 via-transparent to-transparent rounded-full blur-3xl pointer-events-none"
        animate={{
          x: ['-20%', '20%', '-20%'],
          y: ['-10%', '10%', '-10%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

/**
 * Grille animée en arrière-plan
 */
const AnimatedGrid = () => {
  const { isMobile } = usePerformanceMode();
  
  if (isMobile) return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(166,124,82,0.03)_50%,transparent_100%)]"
        animate={{
          x: ['0%', '100%', '0%'],
        }}
        transition={{
          duration: 30, // Durée augmentée pour réduire les calculs
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <div 
        className="absolute inset-0 bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] bg-[size:80px_80px] opacity-[0.03]"
        style={{ 
          backgroundPosition: 'center center',
          backgroundRepeat: 'repeat'
        }}
      />
    </div>
  );
};

/**
 * Section des partenaires avec marquee
 */
const PartnersMarquee = memo(() => {
  const { isMobile } = usePerformanceMode();
  const shouldReduceMotion = useReducedMotion();
  
  const partners = useMemo(() => [
    { 
      name: "Pizza Presto", 
      description: "Livraison rapide 24h/24",
      category: "Restauration",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop"
    },
    { 
      name: "Alphabet Pizza", 
      description: "Pizza artisanale",
      category: "Restauration",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop"
    },
    { 
      name: "Pharmaice Herouville", 
      description: "Pharmacie de garde",
      category: "Santé",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop"
    },
    { 
      name: "Boucherie El Salam", 
      description: "Viandes halal",
      category: "Alimentation",
      image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=200&h=200&fit=crop"
    },
    { 
      name: "Boulangerie du Centre", 
      description: "Artisan boulanger",
      category: "Alimentation",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop"
    },
    { 
      name: "Café des Arts", 
      description: "Torréfacteur",
      category: "Restauration",
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop"
    },
    { 
      name: "Super U", 
      description: "Supermarché",
      category: "Commerce",
      image: "https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=200&h=200&fit=crop"
    },
    { 
      name: "Coiffeur Modern", 
      description: "Salon de coiffure",
      category: "Beauté",
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop"
    }
  ], []);

  return (
    <div className="py-16 bg-gradient-to-b from-white to-[#fdfbf7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-12"
        >
          <Badge variant="blue" icon={<Sparkles size={12} />} className="mb-4">
            Nos Partenaires
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Ils nous <GradientText gradient="from-[#A67C52] to-yellow-600">font confiance</GradientText>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Des centaines de commerces utilisent déjà BagPub pour booster leur visibilité
          </p>
        </motion.div>

        {isMobile ? (
          <div className="grid grid-cols-2 gap-4">
            {partners.slice(0, 4).map((partner, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <ElegantCard className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden mb-4 border-2 border-[#A67C52]/20 shadow-lg">
                      <img 
                        src={partner.image} 
                        alt={partner.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        style={{ willChange: 'transform' }}
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name)}&size=200&background=A67C52&color=fff&bold=true`;
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 mb-1">{partner.name}</div>
                      <div className="text-sm text-slate-500 mb-2">{partner.description}</div>
                      <Badge variant="secondary" className="text-xs">
                        {partner.category}
                      </Badge>
                    </div>
                  </div>
                </ElegantCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden py-4">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
            
            <motion.div
              className="flex gap-8"
              animate={shouldReduceMotion ? {} : { x: ['0%', '-50%'] }}
              transition={shouldReduceMotion ? {} : { 
                repeat: Infinity, 
                duration: 60, // Durée augmentée pour réduire les calculs
                ease: "linear"
              }}
            >
              {[...partners, ...partners].map((partner, idx) => (
                <ElegantCard key={idx} className="p-6 min-w-[280px] flex-shrink-0">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-4 border-2 border-[#A67C52]/30 shadow-lg">
                      <img 
                        src={partner.image} 
                        alt={partner.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                        style={{ willChange: 'transform' }}
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name)}&size=200&background=A67C52&color=fff&bold=true`;
                        }}
                      />
                    </div>
                    <h4 className="font-bold text-lg text-slate-900 mb-2">{partner.name}</h4>
                    <p className="text-slate-600 text-sm mb-4">{partner.description}</p>
                    <Badge variant="secondary" className="mb-4">
                      {partner.category}
                    </Badge>
                    <div className="flex items-center justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </ElegantCard>
              ))}
            </motion.div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-slate-500 text-sm mb-6">Et bien d'autres partenaires...</p>
          <WowButton variant="outline" size="sm">
            Voir tous nos partenaires
          </WowButton>
        </motion.div>
      </div>
    </div>
  );
});
PartnersMarquee.displayName = 'PartnersMarquee';

/**
 * Simulateur de ROI avancé
 */
const AdvancedROISimulator = memo(() => {
  const [cards, setCards] = useState(1000);
  const [budget, setBudget] = useState(130);
  const viewsPerCard = 6;
  const costPerCard = 0.13; // 130€ pour 1000 sacs = 0.13€ par sac
  
  const totalImpressions = useMemo(() => cards * viewsPerCard, [cards, viewsPerCard]);
  const estimatedCost = useMemo(() => cards * costPerCard, [cards, costPerCard]);
  const estimatedLeads = useMemo(() => Math.floor(totalImpressions * 0.05), [totalImpressions]);
  const estimatedROI = useMemo(() => ((estimatedLeads * 50) / estimatedCost).toFixed(1), [estimatedLeads, estimatedCost]);

  const handleCardsChange = useCallback((value) => {
    setCards(value);
    setBudget(Math.max(50, Math.min(5000, value * costPerCard * 10)));
  }, [costPerCard]);

  const handleBudgetChange = useCallback((value) => {
    setBudget(value);
    // Budget fixe à 130€ +20 pour 1000 sacs
    setCards(1000);
  }, []);

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#A67C52]/5 to-yellow-500/5 rounded-3xl" />
      
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 md:p-8">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg shrink-0">
                <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-[#A67C52]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">Simulateur ROI Intelligent</h3>
                <p className="text-xs sm:text-sm text-slate-600">Calculez votre retour sur investissement en temps réel</p>
              </div>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              <div>
                <div className="flex justify-between mb-4">
                  <div>
                    <div className="font-semibold text-slate-900">Nombre de cartes</div>
                    <div className="text-sm text-slate-500">Chaque carte = 6 emplacements</div>
                  </div>
                  <div className="text-2xl font-bold text-[#A67C52]">{cards.toLocaleString()}</div>
                </div>
                <input 
                  type="range" 
                  min="100" 
                  max="10000" 
                  step="100" 
                  value={cards} 
                  onChange={(e) => handleCardsChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#A67C52] hover:accent-yellow-600 transition-all"
                />
                <div className="flex justify-between mt-2 text-xs text-slate-400">
                  <span>100</span>
                  <span>5,000</span>
                  <span>10,000+</span>
                </div>
              </div>

              <div>
                <div className="p-4 bg-gradient-to-r from-[#A67C52]/10 to-yellow-50 rounded-xl border-2 border-[#A67C52]/20">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <div className="font-semibold text-slate-900">Prix fixe</div>
                      <div className="text-sm text-slate-500">Pour 1000 sacs</div>
                    </div>
                    <div className="text-3xl font-bold text-[#A67C52]">129€</div>
                  </div>
                  <div className="text-xs text-slate-600 mt-2">
                    ✓ Tous modes inclus (template ou personnalisé)<br />
                    ✓ Distribution via partenaires<br />
                    ✓ Tableau de bord analytics
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-600">Coût estimé par mois</div>
                    <div className="text-2xl font-bold text-slate-900">{estimatedCost.toFixed(0)}€</div>
                  </div>
                  <Coins className="w-8 h-8 text-amber-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                key={`impressions-${totalImpressions}`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-br from-[#A67C52] to-yellow-600 rounded-xl p-6 text-white shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <Eye className="w-5 h-5" />
                  <Badge className="bg-white/20 text-white border-0">+500%</Badge>
                </div>
                <div className="text-3xl font-bold mb-2">
                  <AnimatedCounter end={totalImpressions} duration={1.5} />
                </div>
                <div className="text-yellow-100 text-sm">Impressions totales</div>
              </motion.div>

              <motion.div 
                key={`leads-${estimatedLeads}`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-5 h-5 text-green-600" />
                  <Badge variant="success" className="text-xs">Estimation</Badge>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">
                  <AnimatedCounter end={estimatedLeads} duration={1.5} delay={0.2} />
                </div>
                <div className="text-slate-600 text-sm">Leads générés</div>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200"
            >
              <div className="text-center">
                <div className="text-sm text-emerald-700 font-semibold mb-2">RETOUR SUR INVESTISSEMENT</div>
                <div className="text-4xl font-bold text-emerald-900 mb-2">
                  <AnimatedCounter end={parseFloat(estimatedROI)} suffix="x" duration={2} />
                </div>
                <div className="text-emerald-700 text-sm">Pour chaque euro investi</div>
              </div>
            </motion.div>

            <WowButton 
              className="w-full" 
              variant="gradient"
              icon={<Rocket />}
              size="lg"
            >
              Lancer ma campagne
            </WowButton>
          </div>
        </div>
      </div>
    </div>
  );
});
AdvancedROISimulator.displayName = 'AdvancedROISimulator';

/**
 * Section des fonctionnalités
 */
const FeaturesShowcase = () => {
  const features = useMemo(() => [
    {
      icon: <QrCode />,
      title: "9 Cartes par Face",
      description: "Maximisez votre visibilité avec 9 emplacements publicitaires sur un seul sac",
      color: "from-[#A67C52] to-yellow-500",
      stats: "x9 Impact"
    },
    {
      icon: <MapPin />,
      title: "Ciblage Local",
      description: "Distribution ciblée dans vos zones géographiques préférées",
      color: "from-emerald-500 to-green-500",
      stats: "500+ Zones"
    },
    {
      icon: <BarChart3 />,
      title: "Analytics en Temps Réel",
      description: "Suivez vos performances avec des rapports détaillés",
      color: "from-purple-500 to-pink-500",
      stats: "Analytics"
    },
    {
      icon: <ShieldCheck />,
      title: "100% Sécurisé",
      description: "Paiements sécurisés et garantie de satisfaction",
      color: "from-amber-500 to-orange-500",
      stats: "Garantie"
    }
  ], []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {features.map((feature, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4, delay: idx * 0.1 }}
        >
          <ElegantCard className="p-4 sm:p-6 h-full" hover={true} glow={true}>
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-3 sm:mb-4 shadow-md shrink-0`}>
              {React.cloneElement(feature.icon, { size: 20, className: "sm:w-6 sm:h-6" })}
            </div>
            
            <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-2 sm:mb-3">{feature.title}</h4>
            <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4 leading-relaxed">{feature.description}</p>
            
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
              <span className="text-sm font-semibold text-slate-700">{feature.stats}</span>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
                <ArrowRight size={16} className="text-slate-400 group-hover:text-[#A67C52] transition-colors" />
              </div>
            </div>
          </ElegantCard>
        </motion.div>
      ))}
    </div>
  );
};

/**
 * Étapes du fonctionnement - Version simplifiée
 */
const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Inscription Rapide",
      description: "Créez votre compte en 2 minutes",
      icon: <UserPlus />,
      color: "bg-yellow-100 text-[#A67C52]"
    },
    {
      number: "02",
      title: "Personnalisation",
      description: "Créez votre design ou utilisez nos templates",
      icon: <PenTool />,
      color: "bg-orange-100 text-orange-600"
    },
    {
      number: "03",
      title: "Impression & Distribution",
      description: "Nous imprimons et distribuons vos cartes",
      icon: <Truck />,
      color: "bg-emerald-100 text-emerald-600"
    },
    {
      number: "04",
      title: "Suivi & Résultats",
      description: "Recevez des rapports détaillés de performance",
      icon: <BarChart />,
      color: "bg-amber-100 text-amber-600"
    }
  ];

  return (
    <div className="relative">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="relative"
          >
            <ElegantCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center text-xl font-bold`}>
                  {step.number}
                </div>
                <div className={`w-10 h-10 rounded-lg ${step.color} flex items-center justify-center flex-shrink-0`}>
                  {step.icon}
                </div>
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h4>
              <p className="text-slate-600">{step.description}</p>
            </ElegantCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/**
 * Carousel de témoignages simplifié
 */
const TestimonialsCarousel = () => {
  const [current, setCurrent] = useState(0);
  const { isMobile } = usePerformanceMode();

  const testimonials = [
    {
      name: "Marc Dubois",
      role: "Gérant, Pizza Presto",
      content: "BagPub a révolutionné notre marketing local. En 1 mois, nos ventes ont augmenté de 40% !",
      rating: 5,
      result: "+40% de ventes"
    },
    {
      name: "Sophie Martin",
      role: "Pharmacienne, Pharmaice Herouville",
      content: "La distribution via partenaires est incroyable. Nos cartes sont vues par des centaines de personnes chaque jour.",
      rating: 5,
      result: "500+ vues/jour"
    },
    {
      name: "Thomas Leroy",
      role: "Boucher, El Salam",
      content: "Le meilleur investissement marketing que j'ai fait. ROI de 8x en seulement 3 mois.",
      rating: 5,
      result: "ROI 8x"
    }
  ];

  useEffect(() => {
    if (isMobile) return;
    
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 8000); // Intervalle augmenté
    
    return () => clearInterval(timer);
  }, [testimonials.length, isMobile]);

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-3xl">
        <AnimatePresence mode="wait">
          {testimonials.map((testimonial, idx) => (
            current === idx && (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-white to-[#fdfbf7] rounded-3xl p-8 md:p-12 border border-slate-200 shadow-lg"
              >
                <div className="text-center">
                  <div className="text-6xl text-yellow-100 mb-6">"</div>
                  <p className="text-xl text-slate-700 italic mb-8 leading-relaxed">
                    {testimonial.content}
                  </p>
                  <div className="flex flex-col items-center">
                    <div className="font-bold text-slate-900 text-lg">{testimonial.name}</div>
                    <div className="text-slate-600 mb-2">{testimonial.role}</div>
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <Badge variant="success" className="text-sm">
                      {testimonial.result}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-2 mt-8">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              current === idx 
                ? 'bg-[#A67C52] w-8' 
                : 'bg-slate-200 w-2 hover:bg-slate-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Section statistiques
 */
const StatsSection = () => {
  const stats = [
    { label: "Cartes distribuées", value: 1000000, suffix: "+", icon: <Package />, color: "from-[#A67C52] to-yellow-500" },
    { label: "Clients satisfaits", value: 95, suffix: "%", icon: <Heart />, color: "from-emerald-500 to-green-500" },
    { label: "Partenaires actifs", value: 500, suffix: "+", icon: <Store />, color: "from-purple-500 to-pink-500" },
    { label: "Retour clients", value: 5.2, suffix: "x", icon: <TrendingUp />, color: "from-amber-500 to-orange-500" }
  ];

  return (
    <div className="bg-gradient-to-br from-[#fdfbf7] to-yellow-50 rounded-3xl p-8 md:p-12 border border-yellow-100 overflow-hidden">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="text-center"
          >
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-white mx-auto mb-4 shadow-lg`}>
              {React.cloneElement(stat.icon, { size: 24 })}
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">
              <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2} delay={idx * 0.2} />
            </div>
            <div className="text-slate-600 font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/**
 * Composants d'icônes manquants
 */
const UserPlus = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);

const PenTool = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const BarChart = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isMobile } = usePerformanceMode();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { 
    stiffness: 100, 
    damping: 30,
    restDelta: 0.001
  });

  // Injection des styles CSS pour le background kraft
  useEffect(() => {
    const kraftStyles = `
      /* Texture de bruit kraft principal */
      .bg-kraft-noise {
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='kraftNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0.3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23kraftNoise)' opacity='0.4'/%3E%3C/svg%3E");
        background-size: 200px 200px;
      }
      
      /* Texture de grain kraft */
      .bg-kraft-grain {
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='kraftGrain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23kraftGrain)'/%3E%3C/svg%3E");
        background-size: 100px 100px;
      }
      
      /* Texture de fibres kraft */
      .bg-kraft-texture {
        background-image: 
          repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(166,124,82,0.03) 2px, rgba(166,124,82,0.03) 4px),
          repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(166,124,82,0.02) 2px, rgba(166,124,82,0.02) 4px),
          repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(166,124,82,0.015) 1px, rgba(166,124,82,0.015) 2px);
        background-size: 200% 200%, 200% 200%, 300% 300%;
      }
      
      /* Lignes de fibres kraft */
      .bg-kraft-fibers {
        background-image: 
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(166,124,82,0.08) 3px,
            rgba(166,124,82,0.08) 4px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 3px,
            rgba(166,124,82,0.06) 3px,
            rgba(166,124,82,0.06) 4px
          );
        background-size: 150px 150px, 150px 150px;
      }
      
      /* Gradient radial pour effet de lumière */
      .bg-gradient-radial {
        background: radial-gradient(circle, var(--tw-gradient-stops));
      }
      
      @keyframes kraft-pulse {
        0%, 100% {
          opacity: 0.05;
        }
        50% {
          opacity: 0.12;
        }
      }
      
      @keyframes kraft-drift {
        0% {
          transform: translate(0, 0) rotate(0deg);
        }
        33% {
          transform: translate(20px, -30px) rotate(2deg);
        }
        66% {
          transform: translate(-15px, 20px) rotate(-2deg);
        }
        100% {
          transform: translate(0, 0) rotate(0deg);
        }
      }
    `;

    if (!document.getElementById('kraft-styles')) {
      const styleSheet = document.createElement("style");
      styleSheet.id = 'kraft-styles';
      styleSheet.type = "text/css";
      styleSheet.innerText = kraftStyles;
      document.head.appendChild(styleSheet);
    }

    return () => {
      const styleSheet = document.getElementById('kraft-styles');
      if (styleSheet) {
        styleSheet.remove();
      }
    };
  }, []);

  useEffect(() => {
    let timeoutId;
    
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsScrolled(window.scrollY > 50);
      }, 50);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMenuOpen(false);
    }
  }, []);

  const navItems = useMemo(() => [
    { name: 'Accueil', id: 'hero' },
    { name: 'Fonctionnement', id: 'fonctionnement' },
    { name: 'Simulateur', id: 'simulateur' },
    { name: 'Partenaires', id: 'partenaires' },
    { name: 'Témoignages', id: 'temoignages' }
  ], []);

  const faqs = useMemo(() => [
    {
      q: "🤔 Comment fonctionne le regroupement des 9 cartes ?",
      a: "Nous regroupons automatiquement 9 campagnes différentes sur un même sac craft. Chaque client bénéficie d'un emplacement distinct et visible, garantissant une visibilité optimale pour votre entreprise. Le système est entièrement automatisé pour une répartition équitable."
    },
    {
      q: "🎯 Puis-je choisir mes zones de distribution ?",
      a: "Absolument ! Vous pouvez sélectionner jusqu'à 100 codes postaux dans la région Normandie (14, 27, 50, 61, 76). Notre système vous permet de cibler précisément vos zones d'intérêt commercial pour maximiser votre impact local."
    },
    {
      q: "⚡ Quels sont les délais de mise en place ?",
      a: "Une fois votre campagne validée, l'impression et la distribution se font en 2-3 jours ouvrés. Notre réseau de partenaires vous garantit une mise en circulation rapide de vos cartes de visite sur nos sacs craft."
    },
    {
      q: "💰 Quel est le prix de la campagne ?",
      a: "Le prix est fixe à 129€ pour 1000 sacs, peu importe le mode choisi (template ou carte personnalisée). Ce prix inclut la création, l'impression et la distribution via notre réseau de partenaires. Pas de frais cachés !"
    },
    {
      q: "📊 Comment suivre les résultats de ma campagne ?",
      a: "Vous avez accès à un tableau de bord complet avec des statistiques en temps réel : nombre de sacs distribués, zones de distribution, performance de votre campagne. Tous les résultats sont mesurables et transparents."
    },
    {
      q: "🔄 Puis-je modifier ma campagne après création ?",
      a: "Oui, vous pouvez modifier certains éléments de votre campagne avant l'impression. Une fois envoyée à l'impression, les modifications ne sont plus possibles pour garantir la qualité du processus."
    }
  ], []);

  return (
    <div className="min-h-screen bg-[#f8f5f2] font-sans text-slate-900 overflow-x-hidden relative">
      {/* Background Kraft avec texture et blobs */}
      <KraftBackground />
      
      {/* Éléments d'arrière-plan */}
      <FloatingParticles />
      <AnimatedGrid />
      
      {/* Barre de progression */}
      {!isMobile && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#A67C52] via-yellow-500 to-orange-500 origin-left z-[100]"
          style={{ scaleX }}
        />
      )}

      {/* En-tête */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`
          fixed top-0 w-full z-50 transition-all duration-300
          ${isScrolled 
            ? 'bg-white/95 backdrop-blur-lg shadow-lg py-3 border-b border-slate-100' 
            : 'bg-transparent py-4'
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center gap-2 sm:gap-4">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <motion.img
                src={logo}
                alt="BagPub Logo"
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 object-contain"
                whileHover={{ rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </motion.div>

            {/* Navigation desktop */}
            {!isMobile && (
              <nav className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-1 py-1 rounded-full border border-slate-200 shadow-sm">
                {navItems.map((item) => (
                  <motion.button
                    key={item.name}
                    onClick={() => scrollToSection(item.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-full text-sm font-medium text-slate-600 hover:text-[#A67C52] hover:bg-yellow-50 transition-all"
                  >
                    {item.name}
                  </motion.button>
                ))}
              </nav>
            )}

            {/* Boutons d'authentification */}
            <div className="hidden md:flex items-center gap-3">
              {!user ? (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-[#A67C52] transition-colors"
                  >
                    Connexion
                  </button>
                  <WowButton
                    onClick={() => navigate('/register/client')}
                    icon={<Rocket size={16} />}
                    size="sm"
                  >
                    Commencer
                  </WowButton>
                </>
              ) : (
                <WowButton
                  onClick={() => {
                    if (user?.role === 'admin') {
                      navigate('/admin/dashboard');
                    } else if (user?.role === 'client') {
                      navigate('/client/dashboard');
                    } else {
                      navigate('/login');
                    }
                  }}
                  icon={<LayoutDashboard size={16} />}
                  size="sm"
                >
                  Tableau de bord
                </WowButton>
              )}
            </div>

            {/* Bouton menu mobile */}
            <button
              className="md:hidden p-2 rounded-lg bg-white border border-slate-200 shadow-sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              {isMenuOpen ? <X size={20} className="text-slate-700" /> : <Menu size={20} className="text-slate-700" />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-100 shadow-lg"
            >
              <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => scrollToSection(item.id)}
                    className="block w-full text-left px-4 py-3 rounded-lg font-medium text-slate-600 hover:text-[#A67C52] hover:bg-yellow-50 transition-all"
                  >
                    {item.name}
                  </button>
                ))}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  {!user ? (
                    <>
                      <button
                        onClick={() => navigate('/login')}
                        className="block w-full text-center px-4 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Connexion
                      </button>
                      <WowButton
                        onClick={() => navigate('/register/client')}
                        className="w-full justify-center"
                        size="sm"
                        fullWidth
                      >
                        Commencer
                      </WowButton>
                    </>
                  ) : (
                    <WowButton
                      onClick={() => {
                    if (user?.role === 'admin') {
                      navigate('/admin/dashboard');
                    } else if (user?.role === 'client') {
                      navigate('/client/dashboard');
                    } else {
                      navigate('/login');
                    }
                  }}
                      className="w-full justify-center"
                      size="sm"
                      fullWidth
                    >
                      Tableau de bord
                    </WowButton>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Section Hero */}
      <section id="hero" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f8f5f2] via-white to-[#fdfbf7]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 mb-8"
            >
              <Sparkles size={14} className="text-[#A67C52]" />
              <span className="text-sm font-medium text-[#A67C52]">Nouveau concept révolutionnaire</span>
            </motion.div>

            {/* Titre principal */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6">
              <TextReveal delay={0.3} as="div">
                Boostez votre visibilité
              </TextReveal>
              <TextReveal delay={0.6} as="div">
                avec nos <GradientText>sacs craft</GradientText>
              </TextReveal>
            </h1>

            {/* Sous-titre */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed font-medium"
            >
              <span className="text-[#A67C52] font-bold">Révolutionnez</span> votre marketing local avec nos sacs craft innovants. 
              <br className="hidden md:block" />
              <span className="text-yellow-600">9 cartes par face</span>, distribution ciblée via nos partenaires, 
              <span className="text-orange-600"> résultats mesurables</span>.
            </motion.p>

            {/* Boutons CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 md:mb-16 px-2 sm:px-0"
            >
              <WowButton
                onClick={() => navigate('/register/client')}
                icon={<Zap />}
                size="lg"
                className="w-full sm:w-auto"
              >
                Commencer gratuitement
              </WowButton>
              <WowButton
                variant="outline"
                onClick={() => scrollToSection('simulateur')}
                icon={<Calculator />}
                size="lg"
                className="w-full sm:w-auto"
              >
                Calculer mon ROI
              </WowButton>
            </motion.div>

            {/* Statistiques */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto"
            >
              {[
                { value: 9, label: "Cartes par sac", icon: <QrCode size={20} />, color: "text-[#A67C52]" },
                { value: 500, label: "Partenaires", icon: <Users size={20} />, color: "text-yellow-600" },
                { value: 95, label: "Satisfaction", icon: <Heart size={20} />, color: "text-rose-600" },
              ].map((stat, idx) => (
                <ElegantCard key={idx} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stat.color.replace('text', 'bg')}/10`}>
                      {stat.icon}
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">
                        <AnimatedCounter 
                          end={stat.value} 
                          suffix={stat.value === 95 ? "%" : "+"} 
                          duration={1.5}
                        />
                      </div>
                      <div className="text-xs sm:text-sm text-slate-600 truncate">{stat.label}</div>
                    </div>
                  </div>
                </ElegantCard>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Indicateur de scroll */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
            onClick={() => scrollToSection('fonctionnement')}
          >
            <span className="text-sm text-slate-400">Découvrir comment ça marche</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <MousePointer2 className="w-5 h-5 text-slate-400" />
            </motion.div>
          </motion.div>
        )}
      </section>

      {/* Section Partenaires */}
      <section id="partenaires" className="py-16">
        <PartnersMarquee />
      </section>

      {/* Section Fonctionnement */}
      <section id="fonctionnement" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <Badge variant="blue" icon={<Zap size={12} />} className="mb-4">
              Fonctionnement
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
              Comment ça <GradientText gradient="from-[#A67C52] to-yellow-600">marche</GradientText> ?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto px-2 sm:px-0">
              Une solution simple en 4 étapes pour maximiser votre visibilité locale
            </p>
          </motion.div>

          <HowItWorks />
        </div>
      </section>
      <CardsShowcase />
      {/* Section Fonctionnalités */}
      <section className="py-12 sm:py-16 md:py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <Badge variant="purple" icon={<Sparkles size={12} />} className="mb-3 sm:mb-4">
              Avantages
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
              Pourquoi choisir <GradientText gradient="from-purple-600 to-pink-600">BagPub</GradientText> ?
            </h2>
          </motion.div>

          <FeaturesShowcase />
        </div>
      </section>
      {/* Section Simulateur ROI */}
      <section id="simulateur" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="success" icon={<Calculator size={12} />} className="mb-4">
              Simulateur
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Calculez votre <GradientText gradient="from-emerald-600 to-green-600">retour sur investissement</GradientText>
            </h2>
            <p className="text-slate-600">Les chiffres ne mentent pas. 9 cartes = 9x plus d'impact.</p>
          </motion.div>
          
          <AdvancedROISimulator />
        </div>
      </section>

      {/* Section Tarifs/Pricing - Améliorée */}
      <section id="pricing" className="py-12 sm:py-16 md:py-20 lg:py-32 relative overflow-hidden">
        {/* Background décoratif */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#A67C52]/5 via-yellow-50/30 to-orange-50/20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-l from-[#A67C52]/10 to-yellow-400/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <Badge variant="success" icon={<Coins size={12} />} className="mb-4">
                Tarifs Transparents
              </Badge>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
              Un prix <GradientText gradient="from-[#A67C52] via-yellow-600 to-orange-600">fixe et juste</GradientText>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              <span className="font-bold text-[#A67C52]">129€</span> pour <span className="font-bold text-yellow-600">1000 sacs</span>. 
              <br className="hidden md:block" />
              Pas de surprises, pas de frais cachés. C'est tout ce que vous payez.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto mb-8 sm:mb-12">
            {/* Colonne 1: Prix */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <ElegantCard className="p-6 h-full bg-gradient-to-br from-[#A67C52]/10 to-yellow-50/50 border-2 border-[#A67C52]/30">
                <div className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-[#A67C52] to-yellow-600 bg-clip-text text-transparent mb-3">
                  129€
                </div>
                <div className="text-lg font-bold text-slate-900 mb-2">Prix unique</div>
                <div className="text-sm text-slate-600">Pour 1000 sacs craft</div>
              </ElegantCard>
            </motion.div>

            {/* Colonne 2: Avantages principaux */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <ElegantCard className="p-4 sm:p-6 h-full bg-gradient-to-br from-white to-yellow-50/30 border-2 border-yellow-200">
                <Package className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-yellow-600 mx-auto mb-3 sm:mb-4" />
                <div className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">Tout inclus</div>
                <div className="space-y-2 text-sm text-slate-600 text-left">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                    <span>Design & Impression</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                    <span>Distribution via partenaires</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                    <span>Analytics en temps réel</span>
                  </div>
                </div>
              </ElegantCard>
            </motion.div>

            {/* Colonne 3: Garanties */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <ElegantCard className="p-6 h-full bg-gradient-to-br from-emerald-50/50 to-green-50/30 border-2 border-emerald-200">
                <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <div className="text-xl font-bold text-slate-900 mb-3">Garanti</div>
                <div className="space-y-2 text-sm text-slate-600 text-left">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                    <span>Prix fixe garanti</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                    <span>Sans frais cachés</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                    <span>Support dédié 7j/7</span>
                  </div>
                </div>
              </ElegantCard>
            </motion.div>
          </div>

          {/* Carte principale du prix */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <ElegantCard className="p-6 sm:p-8 md:p-12 border-3 border-[#A67C52]/30 relative overflow-hidden bg-gradient-to-br from-white via-yellow-50/20 to-orange-50/10" glow={true}>
              {/* Éléments décoratifs */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#A67C52]/10 to-yellow-400/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-orange-300/10 to-yellow-300/10 rounded-full blur-2xl"></div>
              
              {/* Badge "Meilleur choix" */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", delay: 0.3 }}
                className="absolute top-6 right-6"
              >
                <Badge variant="warning" className="animate-pulse shadow-lg">
                  ⭐ Tarif unique
                </Badge>
              </motion.div>

              <div className="relative z-10">
                <div className="text-center mb-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", delay: 0.4 }}
                    className="text-7xl md:text-8xl font-extrabold bg-gradient-to-r from-[#A67C52] via-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4"
                  >
                    129€
                  </motion.div>
                  <div className="text-xl md:text-2xl font-bold text-slate-900 mb-2">pour 1000 sacs craft</div>
                  <div className="text-sm md:text-base text-slate-600">Prix fixe • Tous modes inclus • Sans frais cachés</div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-10">
                  {[
                    { icon: <Package className="w-5 h-5" />, text: "1000 sacs distribués" },
                    { icon: <BarChart3 className="w-5 h-5" />, text: "Analytics inclus" },
                    { icon: <MapPin className="w-5 h-5" />, text: "Jusqu'à 100 codes postaux" },
                    { icon: <ShieldCheck className="w-5 h-5" />, text: "Support 7j/7" },
                    { icon: <QrCode className="w-5 h-5" />, text: "9 emplacements garantis" },
                    { icon: <Truck className="w-5 h-5" />, text: "Distribution incluse" }
                  ].map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-[#A67C52]/20 hover:bg-[#A67C52]/5 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#A67C52] to-yellow-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-md">
                        {feature.icon}
                      </div>
                      <span className="font-medium text-slate-700">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                >
                  <WowButton
                    onClick={() => navigate('/register/client')}
                    variant="gradient"
                    size="lg"
                    className="w-full mb-6"
                    icon={<Rocket />}
                  >
                    Commencer maintenant
                  </WowButton>

                  <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>Aucune carte requise</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>Résultats garantis</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </ElegantCard>
          </motion.div>
        </div>
      </section>

      {/* Section Statistiques */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <StatsSection />
        </div>
      </section>

      {/* Section Témoignages */}
      <section id="temoignages" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <Badge variant="warning" icon={<Quote size={12} />} className="mb-4">
              Témoignages
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Ce que disent nos <GradientText gradient="from-amber-600 to-orange-600">clients</GradientText>
            </h2>
          </motion.div>

          <TestimonialsCarousel />
        </div>
      </section>

      {/* Section FAQ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" icon={<MessageCircle size={12} />} className="mb-4">
              FAQ
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Questions fréquentes</h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <ElegantCard className="p-6">
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === i ? null : i)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <span className="font-semibold text-lg text-slate-900 pr-4">{faq.q}</span>
                    <div className={`transition-transform duration-300 ${activeAccordion === i ? 'rotate-180' : ''}`}>
                      <ChevronDown size={20} className="text-slate-400" />
                    </div>
                  </button>
                  <AnimatePresence>
                    {activeAccordion === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="pt-4 mt-4 border-t border-slate-100 text-slate-600">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </ElegantCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section CTA Finale */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        {/* Background kraft déjà appliqué globalement */}
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-200"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A67C52]"></span>
              </span>
              <span className="text-sm font-medium text-[#A67C52]">Offre spéciale lancement</span>
            </motion.div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Prêt à{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A67C52] to-yellow-600">
                multiplier
              </span>
              <br />
              votre impact ?
            </h2>

            <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
              Rejoignez la révolution du marketing local partagé. 
              <span className="font-semibold text-slate-800"> Premier mois offert</span> pour les 100 premiers inscrits.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <WowButton
                onClick={() => navigate('/register/client')}
                icon={<Rocket />}
                size="lg"
                variant="gradient"
                className="w-full sm:w-auto"
              >
                S'inscrire gratuitement
              </WowButton>
              <WowButton
                variant="secondary"
                onClick={() => navigate('/register/partner')}
                icon={<Store />}
                size="lg"
                className="w-full sm:w-auto"
              >
                Devenir Partenaire
              </WowButton>
            </div>

            <p className="text-sm text-slate-500">
              Aucune carte bancaire requise • Essai gratuit de 30 jours • Annulation à tout moment
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pied de page */}
      <footer className="bg-slate-900 text-white pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <img src={logo} alt="BagPub Logo" className="w-32 h-32 object-contain" loading="eager" decoding="async" />
              </div>
              <p className="text-slate-400 text-sm mb-6 max-w-md">
                La plateforme innovante de cartes de visite sur sacs craft. 
                9 cartes par face, distribution via partenaires, résultats garantis.
              </p>
              <div className="flex gap-3">
                {[Facebook, Instagram, Linkedin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                    aria-label={`Suivez-nous sur ${Icon.name}`}
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Navigation</h4>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className="text-slate-400 hover:text-white transition-colors text-sm text-left"
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Légal</h4>
              <ul className="space-y-2">
                {['Mentions légales', 'Confidentialité', 'CGV', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-center text-slate-400 text-sm">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>&copy; {new Date().getFullYear()} BagPub SAS. Tous droits réservés.</div>
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2">
                  <Leaf size={14} className="text-emerald-400" /> Écologique
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#A67C52]" /> Sécurisé
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Bouton retour en haut */}
      <AnimatePresence>
        {isScrolled && !isMobile && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-[#A67C52] to-yellow-600 text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-shadow z-50"
            whileHover={{ y: -3, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Retour en haut"
          >
            <ArrowUpRight size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LandingPage;
