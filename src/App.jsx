import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useStore } from './store/useStore';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import CanvasEditor from './pages/CanvasEditor';
import Templates from './pages/Templates';
import Profile from './pages/Profile';
import BottomNav from './components/BottomNav';
import TopBar from './components/TopBar';
import Toasts from './components/Toasts';
import DataTunnel from './pages/DataTunnel';
import InteractiveHero from './components/UI/InteractiveHero';


// ── Protected Route ──────────────────────────────────────────────
function Protected({ children }) {
  const user = useStore((s) => s.user);
  return user ? children : <Navigate to="/auth" replace />;
}

import { motion, useMotionValue, useSpring } from 'framer-motion';

// ── Custom Cursor & Magnetic Effects ─────────────────────────────
function CustomCursor() {
  const cursorStyle = useStore((s) => s.cursorStyle);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 20, stiffness: 100, mass: 0.1 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);
  
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (cursorStyle !== 'magic') {
      document.body.classList.remove('magic-cursor-enabled');
      return;
    }
    
    document.body.classList.add('magic-cursor-enabled');
    
    const onMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const expand = () => setIsHovered(true);
    const shrink = () => setIsHovered(false);
    
    document.addEventListener('mousemove', onMove);
    
    // Magnetic logic
    const magneticMove = (e, el) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    };
    const magneticLeave = (el) => {
      el.style.transform = 'translate(0, 0)';
    };

    const obs = new MutationObserver(() => {
      document.querySelectorAll('button, a, [role="button"], .cursor-pointer, h1, p').forEach((el) => {
        el.addEventListener('mouseenter', expand);
        el.addEventListener('mouseleave', shrink);
        
        if (el.classList.contains('btn-primary') || el.classList.contains('btn-gold')) {
          el.addEventListener('mousemove', (e) => magneticMove(e, el));
          el.addEventListener('mouseleave', () => magneticLeave(el));
        }
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });
    return () => { 
      document.removeEventListener('mousemove', onMove); 
      obs.disconnect(); 
      document.body.classList.remove('magic-cursor-enabled');
    };
  }, [cursorStyle, cursorX, cursorY]);

  return (
    <>
      {cursorStyle === 'magic' && (
        <>
          <motion.div 
            id="custom-cursor" 
            className={isHovered ? 'expanded' : ''}
            style={{ x: springX, y: springY }} 
          />
          <motion.div 
            id="custom-cursor-dot" 
            style={{ x: cursorX, y: cursorY }} 
          />
        </>
      )}
      <div className="loader-overlay">DesignX</div>
    </>
  );
}


// ── App Shell ────────────────────────────────────────────────────
function AppShell() {
  const location = useLocation();
  const theme = useStore((s) => s.theme);
  const user = useStore((s) => s.user);
  const isCanvas = location.pathname === '/editor';
  const isAuth = location.pathname === '/auth';
  const isLanding = location.pathname === '/';
  const isTunnel = location.pathname === '/tunnel';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (isAuth || isLanding || isTunnel) {
    return (
      <div className="relative">
        <Toasts />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/tunnel" element={<DataTunnel />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden"
      style={{ background: 'var(--bg-base)' }}>
      {!user && <InteractiveHero />}
      <Toasts />
      {!isCanvas && <TopBar />}

      <main className={`relative z-10 ${isCanvas ? '' : 'pt-[60px] pb-[72px]'}`}>
        <Routes>
          <Route path="/home" element={<Protected><Landing /></Protected>} />
          <Route path="/dashboard" element={<Protected><Landing /></Protected>} />
          <Route path="/editor" element={<Protected><CanvasEditor /></Protected>} />
          <Route path="/templates" element={<Protected><Templates /></Protected>} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      {!isCanvas && <BottomNav />}
    </div>
  );
}

export default function App() {
  const theme = useStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <CustomCursor />
      <AppShell />
    </BrowserRouter>
  );
}
