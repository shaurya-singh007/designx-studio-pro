import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Fingerprint, Globe, Menu } from 'lucide-react';

export const Overlay = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex flex-col justify-between p-8 md:p-12">
      {/* Top Navigation */}
      <header className="flex justify-between items-center pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#CA8A04] rounded-sm rotate-45 flex items-center justify-center">
            <div className="w-4 h-4 bg-[#0B0F1A] rounded-sm" />
          </div>
          <span className="font-bold text-white tracking-widest text-xl font-mono">D-TUNNEL</span>
        </div>
        <nav className="hidden md:flex gap-8 text-slate-400 font-mono text-sm uppercase tracking-widest">
          {['Network', 'Terminal', 'Archive', 'Identity'].map((item) => (
            <button key={item} className="hover:text-white transition-colors cursor-pointer interactive">
              {item}
            </button>
          ))}
        </nav>
        <button className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors pointer-events-auto interactive">
          <Menu className="text-white w-6 h-6" />
        </button>
      </header>

      {/* Bottom UI */}
      <footer className="flex justify-between items-end">
        <div className="flex flex-col gap-4 pointer-events-auto">
          <div className="flex gap-4">
            <button className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-[#06b6d4] hover:text-white transition-all interactive">
              <Fingerprint className="w-5 h-5" />
            </button>
            <button className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-[#ec4899] hover:text-white transition-all interactive">
              <Globe className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            © 2026 DATATUNNEL PRO // VER 2.4.0
          </p>
        </div>

        {/* Scroll Indicator */}
        <div className="flex flex-col items-center gap-4">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.5em] [writing-mode:vertical-lr]">
            Scroll to Navigate
          </span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-[1px] h-12 bg-gradient-to-b from-[#CA8A04] to-transparent"
          />
        </div>

        <div className="hidden md:block pointer-events-auto">
          <button className="px-8 py-4 bg-transparent border border-[#CA8A04] text-[#CA8A04] font-bold uppercase tracking-widest hover:bg-[#CA8A04] hover:text-white transition-all duration-300 interactive">
            Initialize Sync
          </button>
        </div>
      </footer>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0B0F1A_80%)] opacity-50 pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  );
};
