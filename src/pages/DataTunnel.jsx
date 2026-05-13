import { useEffect, Suspense } from 'react';
import Lenis from 'lenis';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { useStore } from '../store/useStore';

import { TunnelProvider } from '../components/Tunnel/TunnelContext';
import { TunnelScene } from '../components/Tunnel/Scene';
import { CameraController } from '../components/Tunnel/CameraController';
import { TunnelSectionsOverlay } from '../components/Tunnel/Sections';
import { TunnelPostFX } from '../components/Tunnel/TunnelPostFX';

gsap.registerPlugin(ScrollTrigger);

const SCROLL_ROOT_ID = 'tunnel-scroll-root';

/**
 * Scroll-synced cinematic tunnel aligned with Depth bands:
 * Hero 0 · Features −20 · AI −40 · Pricing −60 · Contact −80 — camera scrubs −Z via GSAP.
 */
export default function DataTunnel() {
  useEffect(() => {
    const prevCursor = useStore.getState().cursorStyle;
    useStore.setState({ cursorStyle: 'magic' });
    document.documentElement.classList.add('tunnel-page');

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

    const lenis = new Lenis({
      smoothWheel: !reduceMotion,
      wheelMultiplier: reduceMotion ? 1 : 0.86,
      touchMultiplier: reduceMotion ? 1 : 1.55,
      syncTouch: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    let rafId = 0;
    function loop(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    function onResize() {
      ScrollTrigger.refresh();
    }
    window.addEventListener('resize', onResize);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.removeEventListener('resize', onResize);
      useStore.setState({ cursorStyle: prevCursor });
      document.documentElement.classList.remove('tunnel-page');
      ScrollTrigger.getAll().forEach((t) => t.kill(true));
    };
  }, []);

  return (
    <TunnelProvider>
      <main id={SCROLL_ROOT_ID} className="tunnel-scroll-shell relative min-h-[520vh] w-full overflow-x-hidden bg-[#030712]" aria-label="DesignX cinematic tunnel">

        <div className="fixed inset-0 z-0">
          <Canvas
            camera={{ fov: 58, near: 0.12, far: 200, position: [0, 0.14, 12] }}
            dpr={[1, Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio : 1)]}
            gl={{
              alpha: false,
              antialias: true,
              powerPreference: 'high-performance',
            }}
          >
            <color attach="background" args={['#050a14']} />
            <fog attach="fog" args={['#030712', 6, 108]} />

            <Suspense fallback={null}>
              <CameraController scrollRootId={SCROLL_ROOT_ID} />
              <TunnelScene />
              <TunnelPostFX />
            </Suspense>
          </Canvas>
        </div>

        {/* HTML chrome */}
        <div className="pointer-events-none fixed inset-x-0 top-6 z-[50] flex justify-between px-6 md:px-10 items-start">
          <Link
            to="/"
            className="tunnel-hit pointer-events-auto text-[11px] font-bold uppercase tracking-[0.42em] text-white/72 hover:text-cyan-200 transition-colors bg-black/25 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10"
          >
            ← DESIGNX
          </Link>
          <span className="hidden sm:block text-[10px] font-mono uppercase tracking-[0.45em] text-cyan-200/52">
            Tunnel · Fiber · GSAP scrub
          </span>
        </div>

        <TunnelSectionsOverlay />

        <footer className="pointer-events-none fixed bottom-8 inset-x-0 z-[48] flex justify-center px-4">
          <p className="text-[11px] font-mono uppercase tracking-[0.4em] text-white/42">
            Smooth scroll advances camera · Glow + chroma react to velocity
          </p>
        </footer>
      </main>
    </TunnelProvider>
  );
}
