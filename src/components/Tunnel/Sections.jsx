import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Sections = () => {
  const sectionsRef = useRef([]);
  const setSectionRef = (el, index) => {
    sectionsRef.current[index] = el;
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      sectionsRef.current.forEach((section, i) => {
        if (!section) return;

        const title = section.querySelector('.tunnel-title');
        const text = section.querySelectorAll('.tunnel-text');

        // Entry animation
        gsap.fromTo(title, 
          { opacity: 0, y: 50, scale: 0.9, filter: 'blur(10px)' },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1, 
            filter: 'blur(0px)',
            scrollTrigger: {
              trigger: section,
              start: "top 70%",
              end: "top 30%",
              scrub: 1,
            }
          }
        );

        if (text.length) {
          gsap.fromTo(text, 
            { opacity: 0, y: 30 },
            { 
              opacity: 1, 
              y: 0, 
              stagger: 0.1,
              scrollTrigger: {
                trigger: section,
                start: "top 60%",
                end: "top 20%",
                scrub: 1,
              }
            }
          );
        }
        
        // Exit animation (fade out when leaving, except for the last section)
        if (i < sectionsRef.current.length - 1) {
          gsap.to(section, {
            opacity: 0,
            y: -50,
            filter: 'blur(10px)',
            scrollTrigger: {
              trigger: section,
              start: "bottom 60%",
              end: "bottom 20%",
              scrub: 1,
            }
          });
        }
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div id="tunnel-sections-container" className="w-full text-white pointer-events-none relative z-10">
      
      {/* Hero Section */}
      <section ref={(el) => setSectionRef(el, 0)} className="h-screen flex items-center justify-center px-4 md:px-20 pointer-events-auto">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="tunnel-title text-6xl md:text-8xl font-black mb-6 tracking-tighter font-exo">
            DATATUNNEL <span className="text-[#CA8A04] glow-text">PRO</span>
          </h1>
          <p className="tunnel-text text-[#06b6d4] font-mono text-xl uppercase tracking-widest bg-black/30 backdrop-blur-sm p-4 rounded-lg inline-block border border-[#06b6d4]/30">
            Scroll to enter the dimension
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section ref={(el) => setSectionRef(el, 1)} className="h-screen flex items-center justify-start px-4 md:px-20 pointer-events-auto">
        <div className="max-w-2xl bg-[#0B0F1A]/60 backdrop-blur-md p-10 rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
          <h2 className="tunnel-title text-4xl md:text-6xl font-bold mb-6 font-exo">FEATURE_ZONE</h2>
          <p className="tunnel-text text-slate-300 text-lg leading-relaxed font-mono">
            High-performance WebGL rendering paired with state-of-the-art interaction design.
            Every layer of depth is meticulously optimized for maximum impact.
          </p>
        </div>
      </section>

      {/* AI Tools Section */}
      <section ref={(el) => setSectionRef(el, 2)} className="h-screen flex items-center justify-end px-4 md:px-20 pointer-events-auto">
        <div className="max-w-2xl bg-[#0B0F1A]/60 backdrop-blur-md p-10 rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(236,72,153,0.1)] text-right">
          <h2 className="tunnel-title text-4xl md:text-6xl font-bold mb-6 text-[#ec4899] font-exo">AI_INTEGRATION</h2>
          <p className="tunnel-text text-slate-300 text-lg leading-relaxed font-mono">
            Neural networks processing design requests in real-time. 
            Welcome to the cognitive layer of your workflow.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={(el) => setSectionRef(el, 3)} className="h-screen flex items-center justify-center px-4 md:px-20 pointer-events-auto">
        <div className="text-center max-w-4xl mx-auto bg-[#0B0F1A]/60 backdrop-blur-md p-10 rounded-2xl border border-[#CA8A04]/30 shadow-[0_0_50px_rgba(202,138,4,0.15)]">
          <h2 className="tunnel-title text-4xl md:text-6xl font-bold mb-6 text-[#CA8A04] font-exo">ACCESS_LEVELS</h2>
          <p className="tunnel-text text-slate-300 text-lg leading-relaxed font-mono max-w-2xl mx-auto">
            Unlock the full potential of the DataTunnel. 
            Choose your clearance level and begin the override sequence.
          </p>
          <button className="tunnel-text mt-8 px-8 py-4 bg-transparent border border-[#CA8A04] text-[#CA8A04] font-bold uppercase tracking-widest hover:bg-[#CA8A04] hover:text-[#0B0F1A] transition-all duration-300 interactive cursor-pointer">
            Initialize Access
          </button>
        </div>
      </section>

      {/* Contact Section */}
      <section ref={(el) => setSectionRef(el, 4)} className="h-screen flex items-center justify-center px-4 md:px-20 pointer-events-auto">
        <div className="text-center w-full max-w-4xl">
          <h2 className="tunnel-title text-5xl md:text-7xl font-bold mb-4 font-exo">CONNECTION_ESTABLISHED</h2>
          <p className="tunnel-text text-[#06b6d4] font-mono text-xl uppercase tracking-widest mb-12">
            Secure channel open. Ready for transmission.
          </p>
          <div className="flex justify-center gap-6">
             <button className="tunnel-text px-8 py-4 bg-[#06b6d4]/10 border border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4] hover:text-[#0B0F1A] rounded-full transition-all interactive font-mono uppercase text-sm cursor-pointer">
              Send_Data
            </button>
            <button className="tunnel-text px-8 py-4 bg-[#ec4899]/10 border border-[#ec4899] text-[#ec4899] hover:bg-[#ec4899] hover:text-[#0B0F1A] rounded-full transition-all interactive font-mono uppercase text-sm cursor-pointer">
              Terminate
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
