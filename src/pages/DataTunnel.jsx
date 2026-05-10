import React, { useRef, useEffect, useMemo, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Float, useTexture, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

// Register GSAP Plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ── 3D Components ────────────────────────────────────────────────

const DataPanel = ({ position, rotation, index, color = "#06b6d4", usePhoto = false }) => {
  const meshRef = useRef();
  // Using a reliable placeholder for photos if the asset fails
  const texture = useTexture(usePhoto ? 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=800&auto=format&fit=crop');

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime + index) * 0.002;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} rotation={rotation}>
        <planeGeometry args={[2.5, 1.5]} />
        <meshPhysicalMaterial 
          map={texture}
          transparent
          opacity={0.9}
          roughness={0.1}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={0.2}
        />
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[2.55, 1.55]} />
          <meshBasicMaterial color={color} wireframe />
        </mesh>
      </mesh>
    </Float>
  );
};

const TunnelScene = () => {
  const { camera } = useThree();
  const groupRef = useRef();

  // Create particles
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 200; i++) {
      temp.push({
        position: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, -Math.random() * 100],
        size: Math.random() * 0.05
      });
    }
    return temp;
  }, []);

  // Sync Camera with Scroll
  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#tunnel-wrapper",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      }
    });

    tl.to(camera.position, {
      z: -90,
      ease: "none"
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [camera]);

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#06b6d4" />
      
      {/* Dynamic Data Panels */}
      {[...Array(15)].map((_, i) => (
        <DataPanel 
          key={i} 
          index={i} 
          usePhoto={true}
          position={[
            Math.cos(i * 1.5) * 4,
            Math.sin(i * 1.5) * 4,
            -i * 6
          ]}
          rotation={[0, 0, i * 0.5]}
          color={i % 2 === 0 ? "#06b6d4" : "#ec4899"}
        />
      ))}

      {/* Star Field / Particles */}
      {particles.map((p, i) => (
        <mesh key={i} position={p.position}>
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Grid Tunnel */}
      <gridHelper args={[100, 50, "#06b6d4", "#06b6d4"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -50]} opacity={0.2} transparent />
    </group>
  );
};

// ── Main Page Component ──────────────────────────────────────────

const DataTunnel = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Smooth Scroll Setup
    const lenis = new Lenis();
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  if (!mounted) return null;

  return (
    <div id="tunnel-wrapper" className="relative w-full bg-[#0B0F1A]" style={{ minHeight: '500vh' }}>
      
      {/* 3D Experience */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <color attach="background" args={['#0B0F1A']} />
          <fog attach="fog" args={['#0B0F1A', 10, 50]} />
          
          <Suspense fallback={null}>
            <TunnelScene />
            <Environment preset="city" />
            
            <EffectComposer>
              <Bloom luminanceThreshold={0.1} intensity={1.5} />
              <ChromaticAberration offset={[0.002, 0.002]} />
              <Vignette darkness={0.7} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </div>

      {/* Content Sections */}
      <div className="relative z-10 pointer-events-none">
        <section className="h-screen flex items-center justify-center">
          <div className="text-center bg-black/40 backdrop-blur-xl p-12 rounded-3xl border border-white/10 pointer-events-auto">
            <h1 className="text-7xl md:text-9xl font-black text-white mb-4 tracking-tighter">DATATUNNEL</h1>
            <p className="text-[#06b6d4] font-mono text-xl uppercase tracking-[0.5em]">Scroll to enter</p>
          </div>
        </section>

        <section className="h-screen flex items-center justify-start px-20">
          <div className="max-w-xl bg-black/60 backdrop-blur-xl p-10 rounded-2xl border border-[#06b6d4]/30 pointer-events-auto">
            <h2 className="text-5xl font-bold text-white mb-6">NEURAL_NETWORK</h2>
            <p className="text-slate-300 text-lg leading-relaxed font-mono">
              Deep-diving into the architectural layers of your design data. 
              Real-time processing enabled.
            </p>
          </div>
        </section>

        <section className="h-screen flex items-center justify-end px-20">
          <div className="max-w-xl bg-black/60 backdrop-blur-xl p-10 rounded-2xl border border-[#ec4899]/30 pointer-events-auto text-right">
            <h2 className="text-5xl font-bold text-white mb-6">AI_SYNTHESIS</h2>
            <p className="text-slate-300 text-lg leading-relaxed font-mono">
              Synthesizing visual components across a multi-dimensional workspace.
            </p>
          </div>
        </section>

        <section className="h-screen flex items-center justify-center">
          <div className="text-center bg-black/60 backdrop-blur-xl p-10 rounded-2xl border border-white/10 pointer-events-auto">
            <h2 className="text-6xl font-bold text-white mb-6">CORE_ACCESS</h2>
            <button className="px-12 py-5 bg-[#06b6d4] text-black font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform">
              Initialize
            </button>
          </div>
        </section>

        <section className="h-screen flex items-center justify-center">
          <h2 className="text-4xl font-mono text-white/50 uppercase tracking-[1em]">Endpoint Reached</h2>
        </section>
      </div>
    </div>
  );
};

export default DataTunnel;
