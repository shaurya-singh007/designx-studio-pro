import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import robotBg from '../../assets/robot-hero-bg.png';

export default function InteractiveHero() {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Mouse positions
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring animations for smoothness
  const springConfig = { damping: 30, stiffness: 100, mass: 0.5 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Transformations for the "head move" effect
  // We'll rotate the image container slightly to simulate depth
  const rotateX = useTransform(springY, [-300, 300], [10, -10]);
  const rotateY = useTransform(springX, [-300, 300], [-10, 10]);
  
  // Parallax layers
  const translateX = useTransform(springX, [-300, 300], [-15, 15]);
  const translateY = useTransform(springY, [-300, 300], [-15, 15]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const handleMouseMove = (e) => {
      if (isMobile) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Center relative positions
      const x = clientX - innerWidth / 2;
      const y = clientY - innerHeight / 2;
      
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isMobile]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-full h-full -z-10 overflow-hidden bg-[#0a0a0a]"
    >
      {/* Background Layer: Darkened Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-10" />
      
      {/* Body Layer (Full Image, subtle movement) */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          perspective: '1200px',
          rotateX: isMobile ? 0 : useTransform(springY, [-300, 300], [2, -2]),
          rotateY: isMobile ? 0 : useTransform(springX, [-300, 300], [-2, 2]),
        }}
      >
        <motion.img 
          src={robotBg} 
          alt="Robot Body" 
          className="w-full h-full object-cover scale-110 opacity-40 blur-[1px]"
          style={{
            x: isMobile ? 0 : useTransform(springX, [-300, 300], [-5, 5]),
            y: isMobile ? 0 : useTransform(springY, [-300, 300], [-5, 5]),
          }}
        />
      </motion.div>

      {/* Head Layer (Isolated, aggressive movement) */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          perspective: '1000px',
          rotateX: isMobile ? 0 : rotateX,
          rotateY: isMobile ? 0 : rotateY,
          scale: 1.05,
        }}
      >
        <motion.div
          className="relative w-full h-full"
          style={{
            clipPath: 'circle(15% at 50% 35%)', // Isolate the head area
          }}
        >
          <motion.img 
            src={robotBg} 
            alt="Robot Head" 
            className="w-full h-full object-cover scale-110"
            style={{
              x: isMobile ? 0 : translateX,
              y: isMobile ? 0 : translateY,
            }}
          />
        </motion.div>
        
        {/* Glow Effects centered on head */}
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-30 bg-radial-gradient from-white/20 to-transparent blur-[80px] pointer-events-none" />
      </motion.div>

      {/* Atmospheric particles or dust could go here */}
    </div>
  );
}
