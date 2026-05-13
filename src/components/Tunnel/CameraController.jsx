import { useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTunnel } from './TunnelContext';

gsap.registerPlugin(ScrollTrigger);

/** Depth zoning: Hero 0 · Features −20 · AI −40 · Pricing −60 · Contact −80 (world Z). Camera travels −Z past each. */
export const CAMERA_Z_START = 12;
export const CAMERA_Z_END = -94;

export function CameraController({ scrollRootId = 'tunnel-scroll-root' }) {
  const { camera } = useThree();
  const { reportScroll } = useTunnel();

  useLayoutEffect(() => {
    const cam = camera;
    cam.position.set(0, 0.14, CAMERA_Z_START);
    const target = new THREE.Vector3(0, 0.1, CAMERA_Z_END - 30);
    cam.lookAt(target);

    let prevProg = 0;

    const anim = gsap.to(cam.position, {
      z: CAMERA_Z_END,
      ease: 'none',
      scrollTrigger: {
        trigger: `#${scrollRootId}`,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate(self) {
          const p = self.progress;
          const velocity = Math.min(1.2, Math.abs(p - prevProg) * 45);
          prevProg = p;
          reportScroll(p, velocity);

          cam.lookAt(target.x + p * 0.15, target.y, target.z);
        },
      },
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      anim.scrollTrigger?.kill(true);
      anim.kill();
    };
  }, [camera, reportScroll, scrollRootId]);

  return null;
}
