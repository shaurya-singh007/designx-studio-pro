import { useState, useEffect } from 'react';
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
    <div className="min-h-screen px-4 pb-4 animate-fade-in">

      {/* Hero */}
      <motion.section className="pt-6 pb-8 text-center"
        initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
          style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
          <Crown size={12} className="text-gold" />
          <span className="text-[11px] font-700 text-royal-light tracking-wider uppercase">Professional Design Studio</span>
        </motion.div>

        <motion.h1 variants={fadeUp} className="text-4xl font-800 leading-[1.1] mb-4"
          style={{ letterSpacing: '-0.03em' }}>
          <span className="text-platinum">Create</span>{' '}
          <span style={{ background: 'linear-gradient(135deg, #7C3AED, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Stunning
          </span>
          <br />
          <span className="text-platinum">Designs Fast</span>
        </motion.h1>

        <motion.p variants={fadeUp} className="text-muted text-sm leading-relaxed mb-8 px-4">
          A professional-grade design studio with AI superpowers. Posters, banners, social media — all in one place.
        </motion.p>

        <motion.div variants={fadeUp} className="flex gap-3 justify-center flex-wrap">
          <button className="btn-gold flex items-center gap-2 text-sm"
            onClick={() => navigate('/editor')}>
            <Zap size={16} strokeWidth={2.5} />
            Get Started Free
          </button>
          {!user && (
            <button className="flex items-center gap-2 text-sm font-600 text-royal-light px-5 py-3 rounded-full"
              style={{ border: '1px solid rgba(124,58,237,0.4)', background: 'rgba(124,58,237,0.1)' }}
              onClick={() => navigate('/auth')}>
              Sign In
            </button>
          )}
        </motion.div>

        {/* 3D Hero Image */}
        <motion.div variants={fadeUp} className="mt-10 relative px-4 flex justify-center">
          <div className="absolute inset-0 top-1/2 -translate-y-1/2 w-[80%] max-w-[300px] aspect-square rounded-full blur-[80px] -z-10 mx-auto"
               style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(245,158,11,0.2))' }} />
          <motion.img 
            src={hero3D} 
            alt="DesignX 3D Canvas Abstract" 
            className="w-full max-w-[340px] rounded-[32px] shadow-2xl object-cover border-[1px] border-[rgba(124,58,237,0.3)] animate-float"
            style={{ 
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5), 0 0 30px rgba(124,58,237,0.3)'
            }}
          />
        </motion.div>
      </motion.section>

      {/* Stats */}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="grid grid-cols-3 gap-3 mb-8">
        {Object.entries(stats).map(([key, val]) => (
          <div key={key} className="glass-card p-3 text-center">
            <div className="text-xl font-800" style={{ background: 'linear-gradient(135deg,#A78BFA,#F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{val}</div>
            <div className="text-[10px] text-muted capitalize font-500 mt-0.5">{key}</div>
          </div>
        ))}
      </motion.div>

      {/* Recent designs */}
      {user && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-700 text-platinum uppercase tracking-wider">Your Designs</h2>
            <button className="text-xs text-royal-light font-600 flex items-center gap-1" onClick={() => navigate('/profile')}>
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {recent.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                className="flex-shrink-0 w-36 template-card" onClick={() => openDesign(item)}>
                <div className="h-24 rounded-t-xl flex items-center justify-center text-white/10 text-xl font-800" 
                  style={{ background: item.canvasData?.bg || 'var(--bg-elevated)' }}>Dx</div>
                <div className="p-2">
                  <div className="text-[11px] font-700 text-platinum truncate">{item.name}</div>
                  <div className="text-[10px] text-muted">{item.type} · {new Date(item.updatedAt).toLocaleDateString()}</div>
                </div>
              </motion.div>
            ))}
            {/* New design card */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="flex-shrink-0 w-36 h-[120px] rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer"
              style={{ border: '2px dashed rgba(124,58,237,0.4)', background: 'rgba(124,58,237,0.05)' }}
              onClick={() => { setActiveDesign(null); navigate('/editor'); }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(124,58,237,0.2)' }}>
                <span className="text-royal-light text-lg font-300">+</span>
              </div>
              <span className="text-[10px] text-royal-light font-600">New Design</span>
            </motion.div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="mb-8">
        <h2 className="section-title mb-4 text-xl">Everything You Need</h2>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
              className="glass-card p-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(245,158,11,0.2))' }}>
                <Icon size={18} className="text-royal-light" />
              </div>
              <div className="text-xs font-700 text-platinum mb-1">{title}</div>
              <div className="text-[10px] text-muted leading-relaxed">{desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pro CTA Card */}
      <motion.section initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
        className="rounded-2xl p-5 mb-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 60%, #B45309 100%)' }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #FCD34D, transparent)', transform: 'translate(30%, -30%)' }} />
        <Crown size={24} className="text-gold mb-2" />
        <h3 className="text-xl font-800 text-white mb-1">Upgrade to Pro</h3>
        <p className="text-sm text-white/70 mb-4">Unlock 4K exports, 50 AI credits/month & 500+ premium templates</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-800 text-gold">$9</span>
            <span className="text-white/60 text-xs">/month</span>
          </div>
          <button className="btn-gold text-sm flex items-center gap-2" onClick={() => navigate('/profile')}>
            <Star size={14} strokeWidth={2.5} />
            Go Pro
          </button>
        </div>
      </motion.section>
    </div>
  );
}
