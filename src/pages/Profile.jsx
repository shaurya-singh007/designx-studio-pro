import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, Zap, Settings, LogOut, Edit3, Award, TrendingUp, Image, Download, ChevronRight, Bell, Shield, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PLANS = [
  { id: 'free', name: 'Free', price: '$0', features: ['5 AI credits/month', '10 templates', 'PNG export (watermark)', '5 saved designs'], current: true },
  { id: 'pro', name: 'Pro', price: '$9', period: '/mo', features: ['50 AI credits/month', '500+ templates', 'HD export (4K)', 'Unlimited saves', 'PDF & SVG export'], hot: true },
  { id: 'vip', name: 'VIP', price: '$29', period: '/mo', features: ['Unlimited AI', 'All templates', '4K + batch export', 'Priority support', 'Custom brand kit', 'API access'] },
];

const MY_DESIGNS = [
  { id: 1, name: 'Brand Identity 2025', type: 'Poster', gradient: 'linear-gradient(135deg,#7C3AED,#F59E0B)', date: '2d ago' },
  { id: 2, name: 'Social Media Pack', type: 'Social', gradient: 'linear-gradient(135deg,#06B6D4,#7C3AED)', date: '5d ago' },
  { id: 3, name: 'Event Promo', type: 'Flyer', gradient: 'linear-gradient(135deg,#F59E0B,#EF4444)', date: '1w ago' },
];

const STATS = [
  { icon: Image, label: 'Designs', value: '24' },
  { icon: Download, label: 'Exports', value: '89' },
  { icon: TrendingUp, label: 'AI Used', value: '3/5' },
  { icon: Award, label: 'Plan', value: 'Free' },
];

export default function Profile() {
  const navigate = useNavigate();
  const [activePlan, setActivePlan] = useState('pro');

  return (
    <div className="min-h-screen pb-4 animate-fade-in">

      {/* Profile Hero */}
      <div className="px-4 pt-6 pb-4 text-center relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124,58,237,0.2) 0%, transparent 70%)' }} />
        {/* Avatar */}
        <div className="relative inline-block mb-3">
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-800"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#F59E0B)', boxShadow: '0 0 30px rgba(124,58,237,0.5)' }}>
            Y
          </div>
          <button className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: '#7C3AED', border: '2px solid #07071A' }}>
            <Edit3 size={10} className="text-white" />
          </button>
        </div>
        <h1 className="text-xl font-800 text-platinum">Yash Designer</h1>
        <p className="text-muted text-xs mt-0.5">yash@designx.pro</p>
        <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full"
          style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
          <Crown size={11} className="text-gold" />
          <span className="text-[10px] font-700 text-royal-light">Free Plan</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 px-4 mb-6">
        {STATS.map(({ icon: Icon, label, value }) => (
          <div key={label} className="glass-card py-3 px-2 text-center">
            <Icon size={14} className="text-royal-light mx-auto mb-1" />
            <div className="text-sm font-800 text-platinum">{value}</div>
            <div className="text-[9px] text-muted">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent Designs */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-700 text-platinum uppercase tracking-wider">My Designs</h2>
          <button className="text-[10px] text-royal-light font-600">See all</button>
        </div>
        <div className="space-y-2">
          {MY_DESIGNS.map((d) => (
            <div key={d.id} className="glass-card p-3 flex items-center gap-3 cursor-pointer hover:border-royal-purple/40 transition-colors"
              onClick={() => navigate('/editor')}>
              <div className="w-12 h-12 rounded-lg flex-shrink-0" style={{ background: d.gradient }} />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-700 text-platinum truncate">{d.name}</div>
                <div className="text-[10px] text-muted">{d.type} · {d.date}</div>
              </div>
              <ChevronRight size={14} className="text-muted flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div className="px-4 mb-6">
        <h2 className="text-xs font-700 text-platinum uppercase tracking-wider mb-3">Choose Your Plan</h2>
        <div className="space-y-3">
          {PLANS.map((plan) => (
            <motion.div key={plan.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className={`rounded-2xl p-4 cursor-pointer transition-all ${activePlan === plan.id ? 'ring-2 ring-[#7C3AED]' : ''}`}
              style={{
                background: activePlan === plan.id
                  ? 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(245,158,11,0.1))'
                  : 'rgba(14,14,44,0.7)',
                border: `1px solid ${activePlan === plan.id ? 'rgba(124,58,237,0.5)' : 'rgba(124,58,237,0.15)'}`,
              }}
              onClick={() => setActivePlan(plan.id)}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-800 text-platinum">{plan.name}</span>
                    {plan.hot && <span className="badge-pro text-[9px] flex items-center gap-0.5"><Zap size={8} /> Popular</span>}
                    {plan.current && <span className="text-[9px] text-muted font-600">Current</span>}
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xl font-800" style={{ color: plan.id === 'vip' ? '#F59E0B' : '#A78BFA' }}>{plan.price}</span>
                    {plan.period && <span className="text-[10px] text-muted">{plan.period}</span>}
                  </div>
                </div>
                {!plan.current && (
                  <button className={plan.id === 'vip' ? 'btn-gold text-[11px] py-2 px-3' : 'btn-royal text-[11px] py-2 px-3'}>
                    {plan.id === 'vip' ? 'Go VIP' : 'Upgrade'}
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-1.5 text-[10px] text-muted">
                    <Star size={8} className="text-gold flex-shrink-0" fill="#F59E0B" /> {f}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="px-4 mb-6">
        <h2 className="text-xs font-700 text-platinum uppercase tracking-wider mb-3">Account</h2>
        <div className="glass-card overflow-hidden">
          {[
            { Icon: Settings, label: 'Preferences', sub: 'Theme, language, notifications' },
            { Icon: Bell, label: 'Notifications', sub: 'Push & email alerts' },
            { Icon: Shield, label: 'Privacy & Security', sub: 'Password, 2FA, data' },
            { Icon: HelpCircle, label: 'Help & Support', sub: 'Docs, chat, tickets' },
            { Icon: LogOut, label: 'Sign Out', sub: '', danger: true },
          ].map(({ Icon, label, sub, danger }, i, arr) => (
            <button key={label}
              className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[rgba(124,58,237,0.08)] transition-colors ${i < arr.length - 1 ? 'border-b border-[rgba(124,58,237,0.1)]' : ''}`}>
              <Icon size={16} className={danger ? 'text-red-400' : 'text-royal-light'} />
              <div className="flex-1 text-left">
                <div className={`text-[11px] font-600 ${danger ? 'text-red-400' : 'text-platinum'}`}>{label}</div>
                {sub && <div className="text-[10px] text-muted">{sub}</div>}
              </div>
              {!danger && <ChevronRight size={13} className="text-muted" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
