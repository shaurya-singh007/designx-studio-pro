import React, { useRef, useLayoutEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Scene } from '../components/Tunnel/Scene';
import { Sections } from '../components/Tunnel/Sections';
import { CameraController } from '../components/Tunnel/CameraController';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { CustomCursor } from '../components/UI/CustomCursor';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const DataTunnel = () => {
  const containerRef = useRef();

  useLayoutEffect(() => {
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

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000);
      });
      lenis.destroy();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full bg-[#0B0F1A]">
      <CustomCursor />
      
      {/* 3D Canvas Fixed Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Canvas gl={{ antialias: true, alpha: false }} dpr={[1, 2]}>
          <color attach="background" args={['#0B0F1A']} />
          <fog attach="fog" args={['#0B0F1A', 5, 40]} />
          
          <CameraController />
          <React.Suspense fallback={null}>
            <Scene />
          </React.Suspense>
          
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.4} />
            <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.001, 0.001]} />
            <Noise opacity={0.05} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* HTML Content Overlay (Scrollable) */}
      <Sections />
    </div>
  );
};

export default DataTunnel;
