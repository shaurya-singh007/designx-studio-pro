import { useNavigate, useLocation } from 'react-router-dom';
import { Home, PenTool, LayoutGrid, User } from 'lucide-react';

const TABS = [
  { path: '/dashboard', label: 'Home', Icon: Home },
  { path: '/editor', label: 'Editor', Icon: PenTool },
  { path: '/templates', label: 'Templates', Icon: LayoutGrid },
  { path: '/profile', label: 'Profile', Icon: User },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = (path) => pathname === path || (path === '/dashboard' && pathname === '/home');

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pb-safe"
      style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--color-border)' }}>
      <div className="flex items-center">
        {TABS.map(({ path, label, Icon }) => (
          <button key={path} onClick={() => navigate(path)}
            className={`bottom-nav-item ${active(path) ? 'active' : ''}`}>
            <div className="relative">
              {active(path) && (
                <span className="absolute inset-0 -m-1.5 rounded-lg"
                  style={{ background: 'var(--color-primary-glow)' }} />
              )}
              <Icon size={19} strokeWidth={active(path) ? 2.5 : 1.8} style={{ position: 'relative' }} />
            </div>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
