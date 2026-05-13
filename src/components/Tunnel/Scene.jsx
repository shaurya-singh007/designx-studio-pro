import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useTunnel } from './TunnelContext';
import { ZONE_ANCHORS_Z, tunnelHash01 } from './tunnelConstants';

function TunnelCage() {
  const g = useRef(null);
  useFrame((_s, dt) => {
    if (g.current) g.current.rotation.z += dt * 0.011;
  });
  return (
    <group ref={g} position={[0, 0, -48]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} renderOrder={-2}>
        <cylinderGeometry args={[9.2, 10.2, 130, 56, 1, true]} />
        <meshBasicMaterial
          color="#22d3ee"
          wireframe
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} renderOrder={-1}>
        <cylinderGeometry args={[9.05, 9.95, 128, 32, 1, true]} />
        <meshBasicMaterial color="#ec4899" wireframe transparent opacity={0.04} depthWrite={false} />
      </mesh>
    </group>
  );
}

function TunnelGrids() {
  const a = useRef(null);
  const b = useRef(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (a.current) a.current.position.z = -52 + Math.sin(t * 0.08) * 0.55;
    if (b.current) b.current.position.z = -52 + Math.cos(t * 0.07) * 0.42;
  });
  return (
    <>
      <group ref={a} rotation={[Math.PI / 2, 0, 0]} position={[0, -5.9, -52]}>
        <gridHelper args={[200, 40, '#06b6d4', '#0f172a']} />
      </group>
      <group ref={b} rotation={[Math.PI / 2, 0, 0]} position={[0, 5.85, -52]}>
        <gridHelper args={[190, 36, '#a855f7', '#1e1b4b']} />
      </group>
    </>
  );
}

/** Far particle stream — Z lives in a ref (mutated each frame) to satisfy immutability lint. */
function StreamParticlesInstanced({ count = 620 }) {
  const meshRef = useRef(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const { velocityRef } = useTunnel();

  const xArr = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) arr[i] = (tunnelHash01(i * 73) - 0.5) * 22;
    return arr;
  }, [count]);
  const yArr = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) arr[i] = (tunnelHash01(i * 17) - 0.5) * 22;
    return arr;
  }, [count]);
  const sArr = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) arr[i] = 0.018 + tunnelHash01(i * 99) * 0.065;
    return arr;
  }, [count]);
  const spArr = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) arr[i] = 0.55 + tunnelHash01(i * 59) * 1.85;
    return arr;
  }, [count]);

  const zArrRef = useRef(new Float32Array(count));
  useLayoutEffect(() => {
    const z = zArrRef.current;
    for (let i = 0; i < count; i++) z[i] = -tunnelHash01(i * 41) * 125 - 2;
  }, [count]);

  useFrame((state, dt) => {
    if (!meshRef.current) return;
    const vx = velocityRef.current;
    const t = state.clock.elapsedTime;
    const zBuf = zArrRef.current;
    for (let i = 0; i < count; i++) {
      let z = zBuf[i];
      z += dt * (5.5 + vx * 16) * spArr[i] * 0.42;
      if (z > 16) z -= 148;
      zBuf[i] = z;

      dummy.position.set(xArr[i], yArr[i], z);
      dummy.scale.setScalar(sArr[i] * (1 + vx * 0.06));
      dummy.rotation.set(t * 0.12 + i * 0.05, t * 0.2 + i * 0.08, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#e0f2fe"
        emissive="#22d3ee"
        emissiveIntensity={2.8}
        metalness={1}
        roughness={0.15}
      />
    </instancedMesh>
  );
}

function PanelStreamInstanced({ count = 40 }) {
  const meshRef = useRef(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const { progressRef, velocityRef } = useTunnel();

  const { bx, by, baseZ, sc, ph, mode } = useMemo(() => {
    const bx = new Float32Array(count);
    const by = new Float32Array(count);
    const baseZ = new Float32Array(count);
    const sc = new Float32Array(count);
    const ph = new Float32Array(count);
    const mode = new Uint8Array(count);
    for (let i = 0; i < count; i++) {
      const ring = Math.floor(i / 8);
      const theta = tunnelHash01(ring * 19 + i) * Math.PI * 2 + (i % 8) * 0.72;
      const radius = 3.4 + tunnelHash01(i * 111) * 2.2 + (ring % 3) * 0.4;
      bx[i] = Math.cos(theta) * radius;
      by[i] = Math.sin(theta) * radius + (tunnelHash01(i * 211) - 0.5) * 2.4;
      baseZ[i] = -6 - ring * 5 - tunnelHash01(i * 311) * 4 - (i % 5) * 0.85;
      sc[i] = 0.48 + tunnelHash01(i * 401) * 0.32;
      ph[i] = tunnelHash01(i * 501) * Math.PI * 2;
      mode[i] = i % 3;
    }
    return { bx, by, baseZ, sc, ph, mode };
  }, [count]);

  const driftZ = useRef(new Float32Array(count));
  const colorPick = useMemo(() => new THREE.Color(), []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const d0 = driftZ.current;
    for (let i = 0; i < count; i++) d0[i] = 0;
    for (let i = 0; i < count; i++) {
      const m = mode[i];
      colorPick.set(m === 0 ? '#22d3ee' : m === 1 ? '#f472b6' : '#fcd34d');
      mesh.setColorAt(i, colorPick);
    }
    mesh.instanceColor.needsUpdate = true;
  }, [colorPick, count, mode]);

  useFrame((state, dt) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material;
    const vx = velocityRef.current;
    const pr = progressRef.current;
    const t = state.clock.elapsedTime;
    mat.emissiveIntensity = 1.1 + vx * 0.45 + Math.sin(t * 0.35) * 0.07;

    const dz = driftZ.current;
    const bxL = bx;
    const byL = by;
    const baseZL = baseZ;

    for (let i = 0; i < count; i++) {
      dz[i] += dt * -(1.4 + pr * 2.1 + vx * 6);
      while (dz[i] < -18) dz[i] += 18;
      while (dz[i] > 0) dz[i] -= 18;

      const w = Math.sin(t * 0.9 + ph[i]);
      const zWorld = baseZL[i] + dz[i];

      dummy.position.set(bxL[i] + state.pointer.x * 1.15, byL[i] + state.pointer.y * 1.05, zWorld + dt * vx * -0.5 + w * 0.95);
      dummy.scale.set(
        sc[i] + vx * 0.02 + w * 0.035,
        sc[i] * 0.58 + w * 0.02 + vx * 0.018,
        sc[i] + vx * 0.022
      );
      dummy.rotation.set(-t * 0.045 + state.pointer.y * 0.25 + mode[i] * 0.2, t * 0.08 + ph[i], w * 0.12);

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <planeGeometry args={[2.8, 0.48]} />
      <meshStandardMaterial
        vertexColors
        toneMapped={false}
        metalness={0.92}
        roughness={0.12}
        emissive="#0c4a6e"
        emissiveIntensity={0.9}
        transparent
        opacity={0.95}
      />
    </instancedMesh>
  );
}

function ZonePulseLights() {
  const group = useRef(null);
  const { camera } = useThree();

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const cz = camera.position.z;
    const t = clock.elapsedTime;

    ZONE_ANCHORS_Z.forEach((hz, idx) => {
      const lamp = g.children[idx];
      if (!lamp || !('intensity' in lamp)) return;

      const d = Math.abs(cz - hz);
      const envelope = THREE.MathUtils.clamp(1 - d / 16, 0, 1);
      const hue = idx % 2 === 0 ? '#22d3ee' : '#f472b6';
      lamp.intensity =
        THREE.MathUtils.lerp(0.06, 2.05, envelope ** 2) * (0.78 + Math.sin(t * 2.2 + hz * 0.05) * 0.08);
      lamp.color.set(hue);
    });
  });

  return (
    <group ref={group}>
      {ZONE_ANCHORS_Z.map((z, idx) => (
        <pointLight key={idx} position={[Math.sin(idx * 2.34) * 3.8, idx % 3 === 0 ? 3.2 : -2.9, z]} decay={2} distance={44} color="#22d3ee" intensity={0.6} />
      ))}
    </group>
  );
}

function BackgroundLayer({ children }) {
  const ref = useRef(null);
  useFrame((state, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.008 + state.pointer.x * 0.002;
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, state.pointer.x * 0.06, 0.04);
  });
  return <group ref={ref}>{children}</group>;
}

function ForegroundWrap({ children }) {
  const ref = useRef(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, state.pointer.x * 0.62, 0.08);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, state.pointer.y * 0.48, 0.06);
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.15) * 0.03 * (1 + state.pointer.x);
  });
  return <group ref={ref}>{children}</group>;
}

export function TunnelScene() {
  return (
    <>
      <ambientLight intensity={0.18} />

      <BackgroundLayer>
        <TunnelCage />
        <TunnelGrids />
        <StreamParticlesInstanced />
      </BackgroundLayer>

      <ForegroundWrap>
        <PanelStreamInstanced />
      </ForegroundWrap>

      <ZonePulseLights />

      <directionalLight position={[28, 32, -8]} intensity={0.85} color="#e0f2fe" />
    </>
  );
}

export default TunnelScene;
