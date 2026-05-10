import React, { useEffect } from 'react';
import { Experience } from '../components/Tunnel/Experience';
import { Overlay } from '../components/UI/Overlay';
import { CustomCursor } from '../components/UI/CustomCursor';
import Lenis from 'lenis';

const DataTunnel = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <main className="relative w-full min-h-screen bg-[#0B0F1A] overflow-x-hidden">
      <CustomCursor />
      <Experience />
      <Overlay />
    </main>
  );
};

export default DataTunnel;
