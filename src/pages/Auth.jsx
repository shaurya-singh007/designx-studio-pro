import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Eye, EyeOff, Loader, Mail, Lock, User, ChevronLeft } from 'lucide-react';
import { useStore } from '../store/useStore';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const PHP_AUTH = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000';

// Change this to true to use PHP service for Auth
const USE_PHP = false; 

export default function Auth() {

  const navigate = useNavigate();
  const { setUser, addNotif } = useStore();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (mode === 'register' && !form.name.trim()) e.name = 'Name required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (form.password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/login' : '/register';
      const baseUrl = USE_PHP ? PHP_AUTH : `${API}/auth`;
      const { data } = await axios.post(`${baseUrl}${endpoint}`, form);
      setUser(data.user, data.token);

      addNotif(`Welcome${data.user.name ? ', ' + data.user.name : ''}! 🎨`, 'success');
      navigate('/dashboard');
    } catch (err) {
      // ── OFFLINE FALLBACK FOR DEMO ACCOUNT ──
      // If Render backend is sleeping/offline, force demo login to work
      if (mode === 'login' && form.email === 'demo@designx.pro') {
        setUser({ id: 1, name: 'Demo User', email: form.email, plan: 'FREE' }, 'demo-jwt-token-fallback');
        addNotif('Welcome back, Demo User! (Offline Mode) 🎨', 'success');
        navigate('/dashboard');
        return;
      }
      
      const msg = err.response?.data?.error || 'Server error. Please try again or use the Demo Account.';
      addNotif(msg, 'error');
      setErrors({ api: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">



      {/* Back to landing */}
      <button onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-1.5 text-sm font-600"
        style={{ color: 'var(--color-muted)' }}>
        <ChevronLeft size={16} /> Back
      </button>

      {/* Card */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="glass-card w-full max-w-[380px] mx-4 p-8 relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,var(--color-primary),var(--color-accent1))', boxShadow: '0 0 30px var(--color-primary-glow)' }}>
            <Crown size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-800 mb-1" style={{ color: 'var(--color-text)' }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            {mode === 'login' ? 'Sign in to your studio' : 'Join DesignX Studio Pro'}
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex rounded-xl p-1 mb-6" style={{ background: 'var(--bg-elevated)' }}>
          {['login', 'register'].map((m) => (
            <button key={m} onClick={() => { setMode(m); setErrors({}); }}
              className="flex-1 py-2 rounded-lg text-sm font-700 transition-all capitalize"
              style={mode === m
                ? { background: 'linear-gradient(135deg,var(--color-primary),var(--color-accent1))', color: '#fff', boxShadow: '0 0 12px var(--color-primary-glow)' }
                : { color: 'var(--color-muted)' }}>
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name (register only) */}
          <AnimatePresence>
            {mode === 'register' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <label className="block text-xs font-600 mb-1.5" style={{ color: 'var(--color-muted)' }}>Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted)' }} />
                  <input type="text" placeholder="Your name" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field pl-9" />
                </div>
                {errors.name && <p className="text-[11px] mt-1" style={{ color: 'var(--color-accent1)' }}>{errors.name}</p>}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div>
            <label className="block text-xs font-600 mb-1.5" style={{ color: 'var(--color-muted)' }}>Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted)' }} />
              <input type="email" placeholder="you@email.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field pl-9" />
            </div>
            {errors.email && <p className="text-[11px] mt-1" style={{ color: 'var(--color-accent1)' }}>{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-600 mb-1.5" style={{ color: 'var(--color-muted)' }}>Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted)' }} />
              <input type={show ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field pl-9 pr-10" />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted)' }}>
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="text-[11px] mt-1" style={{ color: 'var(--color-accent1)' }}>{errors.password}</p>}
          </div>

          {errors.api && (
            <div className="text-sm text-center py-2 px-4 rounded-xl"
              style={{ background: 'rgba(236,72,153,0.1)', color: 'var(--color-accent1)', border: '1px solid rgba(236,72,153,0.3)' }}>
              {errors.api}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="btn-primary w-full text-sm flex items-center justify-center gap-2 mt-2"
            style={{ opacity: loading ? 0.7 : 1 }}>
            {loading && <Loader size={15} className="animate-spin" />}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>or continue with</span>
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
        </div>

        {/* Demo login */}
        <button onClick={() => { setForm({ email: 'demo@designx.pro', password: 'demo123', name: 'Demo User' }); setMode('login'); }}
          className="btn-ghost w-full text-sm">
          Use Demo Account
        </button>
      </motion.div>
    </div>
  );
}
