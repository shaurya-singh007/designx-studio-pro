import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float as DreiFloat, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import heroImage from '../../assets/hero-3d.png';

const DataPanel = ({ position, rotation, index, color = "#4ade80", emissive = "#06b6d4", usePhoto = false }) => {
  const meshRef = useRef();
  
  // Load texture only if usePhoto is true. We'll reuse heroImage as a placeholder for the photos they mentioned.
  const texture = useTexture(usePhoto ? heroImage : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(time + index) * 0.001;
    }
  });

  return (
    <DreiFloat speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} rotation={rotation}>
        <planeGeometry args={[2, 1.2]} />
        <meshPhysicalMaterial 
          map={usePhoto ? texture : null}
          color={usePhoto ? "#ffffff" : "#0B0F1A"} 
          emissive={usePhoto ? "#000000" : color} 
          emissiveIntensity={0.3}
          transparent 
          opacity={usePhoto ? 0.9 : 0.7}
          roughness={0.1}
          metalness={0.5}
          transmission={usePhoto ? 0 : 0.5}
          thickness={1}
        />
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[2.02, 1.22]} />
          <meshBasicMaterial color={emissive} wireframe />
        </mesh>
        
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.08}
          color={color}
          font="https://fonts.gstatic.com/s/robotomono/v22/L0tkDF60be1_rCbue_tKeuyAJW8.woff"
          maxWidth={1.8}
          textAlign="center"
        >
          {`BLOCK_${index}\nSECURE_HASH: 0x${Math.random().toString(16).slice(2, 8).toUpperCase()}`}
        </Text>
      </mesh>
    </DreiFloat>
  );
};

const TunnelLines = () => {
  const lineCount = 30;
  const length = 120; // Cover z from +10 to -110
  const lines = useMemo(() => {
    const temp = [];
    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2;
      const radius = 5 + Math.random() * 2; 
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      temp.push({ x, y, angle });
    }
    return temp;
  }, []);

  const lineRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (lineRef.current) {
      lineRef.current.rotation.z = time * 0.05; 
    }
  });

  return (
    <group ref={lineRef}>
      {lines.map((pos, i) => (
        <mesh key={i} position={[pos.x, pos.y, -50]} rotation={[0, 0, pos.angle]}>
          <boxGeometry args={[0.02, 0.02, length]} />
          <meshBasicMaterial color={i % 3 === 0 ? "#ec4899" : "#06b6d4"} transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
};

const Particles = ({ count = 600 }) => {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -20 + Math.random() * 40;
      const yFactor = -20 + Math.random() * 40;
      const zFactor = 10 - Math.random() * 120; 
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  useFrame(() => {
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
      <dodecahedronGeometry args={[0.04, 0]} />
      <meshStandardMaterial color="#ffffff" roughness={0} metalness={1} emissive="#06b6d4" emissiveIntensity={0.5} />
    </instancedMesh>
  );
};

export const Scene = () => {
  const parallaxRef = useRef();

  useFrame((state) => {
    if (parallaxRef.current) {
      parallaxRef.current.position.x = THREE.MathUtils.lerp(parallaxRef.current.position.x, (state.mouse.x * 1.5), 0.05);
      parallaxRef.current.position.y = THREE.MathUtils.lerp(parallaxRef.current.position.y, (state.mouse.y * 1.5), 0.05);
    }
  });

  return (
    <group ref={parallaxRef}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#06b6d4" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#ec4899" />
      
      <TunnelLines />
      <Particles count={400} />
      
      {/* Hero ambient panels (Z = -5 to -15) */}
      {[...Array(5)].map((_, i) => (
        <DataPanel key={`hero-${i}`} index={i} usePhoto={i % 2 === 0} position={[(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10, -5 - Math.random() * 10]} rotation={[0, 0, Math.random()]} />
      ))}

      {/* Features ambient panels (Z = -25 to -35) */}
      {[...Array(5)].map((_, i) => (
        <DataPanel key={`feat-${i}`} index={i} usePhoto={i % 3 === 0} color="#ec4899" emissive="#ec4899" position={[(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10, -25 - Math.random() * 10]} rotation={[0, 0, Math.random()]} />
      ))}

      {/* AI ambient panels (Z = -45 to -55) */}
      {[...Array(5)].map((_, i) => (
        <DataPanel key={`ai-${i}`} index={i} usePhoto={i % 2 !== 0} color="#4ade80" emissive="#4ade80" position={[(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10, -45 - Math.random() * 10]} rotation={[0, 0, Math.random()]} />
      ))}

      {/* Pricing ambient panels (Z = -65 to -75) */}
      {[...Array(5)].map((_, i) => (
        <DataPanel key={`price-${i}`} index={i} usePhoto={i === 1} color="#CA8A04" emissive="#CA8A04" position={[(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10, -65 - Math.random() * 10]} rotation={[0, 0, Math.random()]} />
      ))}

      {/* Floor Grid */}
      <gridHelper args={[200, 100, "#06b6d4", "#06b6d4"]} rotation={[Math.PI / 2, 0, 0]} position={[0, -5, -50]} opacity={0.1} transparent />
      {/* Ceiling Grid */}
      <gridHelper args={[200, 100, "#ec4899", "#ec4899"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 5, -50]} opacity={0.1} transparent />
    </group>
  );
};
