import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring, useScroll } from 'framer-motion';
import { Sparkles, Crown, Zap, Layers, Download, Share2, Star, ChevronRight, Play } from 'lucide-react';
import axios from 'axios';
import { useStore } from '../store/useStore';
import hero3D from '../assets/hero-3d.png';


const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';


const FEATURES = [
  { icon: Layers, title: 'Infinite Canvas', desc: 'Design without boundaries on our AI-powered canvas engine' },
  { icon: Sparkles, title: 'AI Generation', desc: 'Generate stunning visuals with DALL·E integration in seconds' },
  { icon: Download, title: '4K Export', desc: 'Export as PNG, PDF, SVG in ultra-high resolution' },
  { icon: Crown, title: 'Pro Templates', desc: '500+ premium templates crafted by world-class designers' },
];

const RECENT = [
  { id: 1, name: 'Brand Kit 2025', type: 'Poster', thumb: 'gradient-1', time: '2h ago' },
  { id: 2, name: 'Social Campaign', type: 'Banner', thumb: 'gradient-2', time: '5h ago' },
  { id: 3, name: 'Product Launch', type: 'Flyer', thumb: 'gradient-3', time: '1d ago' },
];

const THUMBS = {
  'gradient-1': 'linear-gradient(135deg, #7C3AED 0%, #F59E0B 100%)',
  'gradient-2': 'linear-gradient(135deg, #06B6D4 0%, #7C3AED 100%)',
  'gradient-3': 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
};

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

export default function Landing() {
  const navigate = useNavigate();
  const { user, addNotif, setActiveDesign } = useStore();
  const [stats] = useState({ designs: '2.4M+', users: '180K+', templates: '500+' });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);

  // 3D Tilt Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);
  const rotateX = useTransform(springY, [-0.5, 0.5], ['15deg', '-15deg']);
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-15deg', '15deg']);

  // Parallax Effect
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  useEffect(() => {
    if (user) fetchRecent();
  }, [user]);

  const fetchRecent = async () => {
    setLoading(true);
    try {
      const token = useStore.getState().token;
      const { data } = await axios.get(`${API}/designs`, { headers: { Authorization: `Bearer ${token}` } });
      setRecent(data.designs.slice(0, 5));
    } catch (e) {
      console.error('Failed to fetch designs');
    } finally {
      setLoading(false);
    }
  };

  const openDesign = (design) => {
    setActiveDesign(design);
    navigate('/editor');
  };

  return (
    <div className="min-h-screen relative z-10 overflow-x-hidden" onClick={() => !user && navigate('/auth')}>
      
      {user && <div className="fixed inset-0 bg-bg-base -z-10" />}

      {/* Hero */}
      {user ? (
        <motion.section className="pt-20 pb-8 text-center px-4"
          initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
          {/* Content for logged in users */}
          <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
            Welcome back
          </motion.h1>
          {/* ... existing Hero content for logged in users if needed ... */}
        </motion.section>
      ) : null}


      {/* Stats */}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32 px-10 border-y border-white/5 py-20">
        {Object.entries(stats).map(([key, val]) => (
          <div key={key} className="text-center">
            <div className="text-5xl font-serif font-bold text-white mb-2">{val}</div>
            <div className="text-xs text-white/30 uppercase tracking-[0.2em] font-medium">{key}</div>
          </div>
        ))}
      </motion.div>

      {/* Recent designs (Infinite Carousel) */}
      {user && (
        <motion.section 
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-50px" }}
          className="mb-8 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3 px-2">
            <h2 className="text-sm font-700 text-platinum uppercase tracking-wider">Your Designs</h2>
            <button className="text-xs text-royal-light font-600 flex items-center gap-1" onClick={() => navigate('/profile')}>
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="infinite-carousel pb-2">
            {[...recent, ...recent].map((item, i) => (
              <div key={`${item.id}-${i}`} className="flex-shrink-0 w-36 template-card" onClick={() => openDesign(item)}>
                <div className="h-24 rounded-t-xl flex items-center justify-center text-white/10 text-xl font-800" 
                  style={{ background: item.canvasData?.bg || 'var(--bg-elevated)' }}>Dx</div>
                <div className="p-2">
                  <div className="text-[11px] font-700 text-platinum truncate">{item.name}</div>
                  <div className="text-[10px] text-muted">{item.type}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="mb-32 px-10"
      >
        <h2 className="text-4xl font-serif font-bold text-white mb-16 text-center tracking-tight">CRAFTED FOR EXCELLENCE</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} viewport={{ once: true }}
              className="group">
              <div className="text-white/20 group-hover:text-white/100 transition-colors duration-500 mb-6">
                <Icon size={32} strokeWidth={1} />
              </div>
              <div className="text-xl font-serif font-bold text-white mb-4 uppercase tracking-wider">{title}</div>
              <div className="text-white/40 leading-relaxed font-light text-lg">{desc}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>


      <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }}
        className="px-10 py-32 bg-white text-black text-center mb-20">
        <h3 className="text-5xl md:text-7xl font-serif font-bold mb-8 tracking-tighter">READY TO START?</h3>
        <p className="text-black/60 text-xl mb-12 max-w-xl mx-auto font-light">Join 180K+ designers creating the future of visual communication.</p>
        <button className="px-12 py-5 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-black/90 transition-colors"
          onClick={() => navigate('/auth')}>
          GET STARTED NOW
        </button>
      </motion.section>
    </div>
  );
}
