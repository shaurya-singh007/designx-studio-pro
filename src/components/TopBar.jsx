import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Plus, X, Moon, Sun, Crown, Bell, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function TopBar() {
  const navigate = useNavigate();
  const { theme, toggleTheme, notifications } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50"
        style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between px-4 h-[60px]">
          {/* Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-primary-glow)', border: '1px solid var(--color-border)' }}>
            {menuOpen ? <X size={16} style={{ color: 'var(--color-primary)' }} /> : <Menu size={16} style={{ color: 'var(--color-primary)' }} />}
          </button>

          {/* Logo */}
          <div className="flex items-center gap-1.5">
            <Crown size={15} style={{ color: 'var(--color-accent3)' }} />
            <span className="font-extrabold text-xs tracking-widest uppercase"
              style={{ color: 'var(--color-text)' }}>DesignX Pro</span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* Theme toggle */}
            <button onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--color-border)' }}>
              {theme === 'dark'
                ? <Sun size={15} style={{ color: 'var(--color-accent3)' }} />
                : <Moon size={15} style={{ color: 'var(--color-primary)' }} />}
            </button>
            {/* New design */}
            <button onClick={() => navigate('/editor')}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,var(--color-primary),var(--color-accent1))', boxShadow: '0 0 12px var(--color-primary-glow)' }}>
              <Plus size={16} className="text-white" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-down menu */}
      {menuOpen && (
        <div className="fixed top-[60px] left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 animate-slide-up"
          style={{ background: 'var(--bg-elevated)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--color-border)' }}>
          {[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'My Designs', path: '/profile' },
            { label: 'Templates', path: '/templates' },
            { label: 'New Design', path: '/editor' },
            { label: 'Upgrade to Pro', path: '/profile', gold: true },
          ].map(({ label, path, gold }) => (
            <button key={label} onClick={() => { navigate(path); setMenuOpen(false); }}
              className="w-full text-left px-6 py-4 text-sm font-semibold transition-colors"
              style={{ borderBottom: '1px solid var(--color-border)', color: gold ? 'var(--color-accent3)' : 'var(--color-text)' }}>
              {gold && <Zap size={13} className="inline mr-2" style={{ color: 'var(--color-accent3)' }} />}
              {label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
