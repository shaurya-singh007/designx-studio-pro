import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  PerspectiveCamera, 
  Environment, 
  Float, 
  Text, 
  MeshDistortMaterial, 
  Box, 
  ScrollControls, 
  Scroll, 
  useScroll,
  Instances,
  Instance,
  Float as DreiFloat,
  Html
} from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

const PANEL_COUNT = 20;

const DataPanel = ({ position, rotation, index }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(time + index) * 0.001;
    }
  });

  return (
    <DreiFloat speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh 
        ref={meshRef}
        position={position} 
        rotation={rotation}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[1.5, 1]} />
        <meshPhysicalMaterial 
          color="#0B0F1A" 
          emissive={hovered ? "#06b6d4" : "#4ade80"} 
          emissiveIntensity={hovered ? 1 : 0.2}
          transparent 
          opacity={0.8}
          roughness={0.1}
          metalness={0.8}
          transmission={0.5}
          thickness={1}
        />
        {/* Neon Border */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[1.52, 1.02]} />
          <meshBasicMaterial color={hovered ? "#06b6d4" : "#4ade80"} wireframe />
        </mesh>
        
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.06}
          color={hovered ? "#06b6d4" : "#4ade80"}
          font="https://fonts.gstatic.com/s/robotomono/v22/L0tkDF60be1_rCbue_tKeuyAJW8.woff"
          maxWidth={1.2}
          textAlign="center"
        >
          {`LAYER_${index}\nSYNC_STATE: OPTIMAL\n0x${Math.random().toString(16).slice(2, 10).toUpperCase()}`}
        </Text>
      </mesh>
    </DreiFloat>
  );
};

const TunnelLines = () => {
  const lineCount = 40;
  const lines = useMemo(() => {
    const temp = [];
    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2;
      const radius = 5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      temp.push({ x, y });
    }
    return temp;
  }, []);

  return (
    <group>
      {lines.map((pos, i) => (
        <mesh key={i} position={[pos.x, pos.y, -50]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.01, 0.01, 100]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
};

const Particles = ({ count = 500 }) => {
  const mesh = useRef();
  const light = useRef();
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <dodecahedronGeometry args={[0.05, 0]} />
      <meshStandardMaterial color="#06b6d4" roughness={0} metalness={1} />
    </instancedMesh>
  );
};

const ScrollProgress = () => {
  const scroll = useScroll();
  const ringRef = useRef();

  useFrame(() => {
    if (ringRef.current) {
      ringRef.current.rotation.z = scroll.offset * Math.PI * 2;
      ringRef.current.scale.setScalar(1 + scroll.offset * 0.5);
    }
  });

  return (
    <group position={[0, 0, -2]}>
      <mesh ref={ringRef}>
        <ringGeometry args={[0.95, 1, 64]} />
        <meshBasicMaterial color="#CA8A04" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <Text
        position={[0, 0, 0.1]}
        fontSize={0.05}
        color="#CA8A04"
        font="https://fonts.gstatic.com/s/robotomono/v22/L0tkDF60be1_rCbue_tKeuyAJW8.woff"
      >
        SYSTEM_READY
      </Text>
    </group>
  );
};

const Scene = () => {
  const scroll = useScroll();
  const groupRef = useRef();

  useFrame((state) => {
    const offset = scroll.offset;
    state.camera.position.z = -offset * 100;
    
    if (groupRef.current) {
      groupRef.current.position.z = -offset * 10;
    }
  });

  const panels = useMemo(() => {
    const temp = [];
    for (let i = 0; i < PANEL_COUNT; i++) {
      const z = -i * 10 - 5;
      const angle = (i / PANEL_COUNT) * Math.PI * 2 + Math.random();
      const radius = 3 + Math.random() * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      temp.push({ position: [x, y, z], rotation: [0, 0, angle] });
    }
    return temp;
  }, []);

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#06b6d4" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#ec4899" />
      
      <ScrollProgress />
      <TunnelLines />
      <Particles count={300} />
      
      {panels.map((props, i) => (
        <DataPanel key={i} {...props} index={i} />
      ))}
      
      <gridHelper args={[200, 100, "#06b6d4", "#06b6d4"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -100]} opacity={0.2} transparent />
    </group>
  );
};

export const Experience = () => {
  return (
    <div className="fixed inset-0 bg-[#0B0F1A]">
      <Canvas
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#0B0F1A']} />
        <fog attach="fog" args={['#0B0F1A', 5, 30]} />
        
        <ScrollControls pages={5} damping={0.1}>
          <Scene />
          
          <EffectComposer disableNormalPass>
            <Bloom 
              luminanceThreshold={0.2} 
              mipmapBlur 
              intensity={1.5} 
              radius={0.4} 
            />
            <ChromaticAberration 
              blendFunction={BlendFunction.NORMAL} 
              offset={new THREE.Vector2(0.001, 0.001)} 
            />
            <Noise opacity={0.05} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>

          <Scroll html>
            <div className="w-screen">
              <section className="h-screen flex items-center justify-center pointer-events-none">
                <div className="text-center px-4">
                  <motion.h1 
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="text-7xl md:text-9xl font-black text-white tracking-tighter mb-4"
                    style={{ fontFamily: "'Exo', sans-serif" }}
                  >
                    DATATUNNEL <span className="text-[#CA8A04]">PRO</span>
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="text-[#06b6d4] font-mono text-xl uppercase tracking-widest"
                  >
                    Experience Infinite Depth
                  </motion.p>
                </div>
              </section>

              {/* Add more sections to enable scrolling */}
              {[...Array(4)].map((_, i) => (
                <section key={i} className="h-screen flex items-center justify-start px-20 pointer-events-none">
                  <div className="max-w-2xl">
                    <h2 className="text-5xl font-bold text-white mb-4">LAYER {i + 1}</h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                      Discover the hidden dimensions of data visualization. 
                      Everything you see is rendered in real-time with performance optimized instancing.
                    </p>
                  </div>
                </section>
              ))}
            </div>
          </Scroll>
        </ScrollControls>
      </Canvas>
    </div>
  );
};
