import { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useTunnel } from './TunnelContext';

/** Bloom + vignette + scroll-reactive chromatic (motion-energy illusion). */
export function TunnelPostFX() {
  const { velocityRef } = useTunnel();
  const offset = useMemo(() => new THREE.Vector2(0.0016, 0.0019), []);

  useFrame(() => {
    const v = THREE.MathUtils.clamp(velocityRef.current, 0, 1);
    const amt = 0.0014 + v * 0.007;
    offset.set(amt * 0.94, amt * 1.04);
  });

  return (
    <EffectComposer disableNormalPass multisampling={window.matchMedia?.('(max-width: 768px)')?.matches ? 0 : 4}>
      <Bloom luminanceThreshold={0.08} mipmapBlur intensity={1.35} luminanceSmoothing={0.45} radius={0.52} />
      <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={offset} />
      <Noise blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.035} />
      <Vignette eskil={false} offset={0.1} darkness={1.05} />
    </EffectComposer>
  );
}

export default TunnelPostFX;
