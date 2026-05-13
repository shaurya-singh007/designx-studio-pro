/* eslint-disable react-refresh/only-export-components -- route-scoped tunnel store + hook */
import { createContext, useContext, useMemo, useRef, useCallback, useState } from 'react';

const TunnelCtx = createContext(null);

/** Scroll-driven tunnel: shared refs (R3F) + minimal React state for HTML overlay zones. */
export function TunnelProvider({ children }) {
  const progressRef = useRef(0);
  const velocityRef = useRef(0);
  const [activeZone, setActiveZone] = useState(0);

  /** Called from GSAP ScrollTrigger onUpdate inside Canvas. */
  const reportScroll = useCallback((progress, velocity) => {
    progressRef.current = progress;
    velocityRef.current = velocity;
    const idx = Math.min(4, Math.max(0, Math.floor(progress * 5)));
    setActiveZone((z) => (z !== idx ? idx : z));
  }, []);

  const value = useMemo(
    () => ({ progressRef, velocityRef, activeZone, reportScroll }),
    [activeZone, reportScroll]
  );

  return <TunnelCtx.Provider value={value}>{children}</TunnelCtx.Provider>;
}

export function useTunnel() {
  const ctx = useContext(TunnelCtx);
  if (!ctx) throw new Error('useTunnel must be used inside TunnelProvider');
  return ctx;
}
