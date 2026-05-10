import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const CameraController = () => {
  const { camera } = useThree();

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#tunnel-sections-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // Smooth scrubbing
      }
    });

    // Animate camera Z position over the course of the scroll container
    // Z depth maps to our content: Hero(0), Features(-20), AI(-40), Pricing(-60), Contact(-80)
    tl.to(camera.position, {
      z: -80,
      ease: "none"
    });

    return () => {
      tl.kill();
    };
  }, [camera]);

  return null;
};
