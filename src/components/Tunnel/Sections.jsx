import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Cpu, Layers, CreditCard, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTunnel } from './TunnelContext';

const ZONES = [
  {
    id: 'hero',
    eyebrow: 'DesignX Studio Pro',
    title: (
      <>
        Glide through{' '}
        <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-amber-300 bg-clip-text text-transparent">
          the neural tunnel
        </span>
      </>
    ),
    body: 'A cinematic ingress for the same stack that powers your editor — scroll to advance along the Z-axis. Each depth band syncs to real product story beats.',
    cta: { label: 'Open editor', to: '/auth', accent: true },
    icon: Sparkles,
  },
  {
    id: 'features',
    eyebrow: 'Depth · −20',
    title: <>Precision canvas. Studio-grade overlays.</>,
    body: 'Fabric-driven editor, tactile glass UI, royalty-grade exports. Layers, vectors, typography, textures — synced to the corridor as you glide forward.',
    cta: { label: 'Explore templates', to: '/templates' },
    icon: Layers,
  },
  {
    id: 'ai',
    eyebrow: 'Depth · −40',
    title: <>AI tooling in the datapath.</>,
    body: 'Image generation lanes, typography agents, remix flows — surfaced as luminous panels drifting past while your scroll holds the conductor’s baton.',
    cta: { label: 'Trial AI credits', to: '/dashboard' },
    icon: Cpu,
  },
  {
    id: 'pricing',
    eyebrow: 'Depth · −60',
    title: <>Clear tiers. No noise.</>,
    body: 'Free for exploration, Pro for scale, VIP for fleets. Locked formats and HD exports unwrap as you deepen into the corridor.',
    cta: { label: 'Upgrade path', to: '/profile' },
    icon: CreditCard,
  },
  {
    id: 'contact',
    eyebrow: 'Depth · −80',
    title: <>Transmit when ready.</>,
    body: 'Deploy this experience on Vercel, wire the Express lane, authenticate with JWT. Ping the maintainers once you emerge from the glow.',
    cta: { label: 'Authenticate', to: '/auth' },
    secondary: { label: 'Back home', to: '/' },
    icon: Mail,
  },
];

export function TunnelSectionsOverlay() {
  const { activeZone } = useTunnel();

  const zone = useMemo(() => ZONES[Math.min(activeZone, ZONES.length - 1)], [activeZone]);
  const Icon = zone.icon;

  return (
    <div className="tunnel-fixed-overlay fixed inset-0 z-30 flex items-center justify-center px-6 pt-28 pb-32 md:pb-36 pointer-events-none">
      <div className="w-full max-w-[min(100%,560px)]">
        <AnimatePresence mode="wait">
          <motion.article
            key={zone.id}
            role="article"
            aria-live="polite"
            initial={{ opacity: 0, y: 48, scale: 0.97, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -32, scale: 0.98, filter: 'blur(10px)' }}
            transition={{
              opacity: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
              y: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
              scale: { duration: 0.58 },
              filter: { duration: 0.52 },
            }}
            className="tunnel-overlay-card rounded-[28px] border border-white/12 bg-black/58 px-10 py-10 shadow-[0_40px_120px_rgba(6,182,236,0.12)] backdrop-blur-2xl pointer-events-auto md:px-14 md:py-12"
          >
            <motion.div layout className="flex items-start gap-4">
              <div className="mt-1 rounded-2xl border border-white/12 bg-white/5 p-3 text-cyan-300 shadow-[0_0_34px_rgba(34,211,238,0.45)]">
                <Icon strokeWidth={1.85} size={26} aria-hidden />
              </div>
              <div className="space-y-4 flex-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-200/85 font-mono">
                  {zone.eyebrow}
                </p>
                <h2 className="text-4xl md:text-[2.85rem] font-extrabold leading-[1.05] tracking-tight text-white">{zone.title}</h2>
                <p className="text-[15px] md:text-[16px] text-slate-300/92 leading-relaxed font-[500]" style={{ letterSpacing: '0.008em' }}>
                  {zone.body}
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  {zone.secondary && (
                    <Link to={zone.secondary.to} className="tunnel-hit btn-ghost text-sm px-6 py-3 inline-flex items-center gap-2">
                      {zone.secondary.label}
                    </Link>
                  )}
                  <Link
                    to={zone.cta.to}
                    className={`tunnel-hit btn-primary text-sm px-8 py-3.5 inline-flex items-center gap-2 ${zone.cta.accent ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700' : ''}`}
                  >
                    {zone.cta.label}
                    <ArrowRight strokeWidth={2.3} size={18} aria-hidden />
                  </Link>
                </div>

                <p className="text-[11px] text-slate-500 font-mono tracking-wide pt-1">
                  Zone {Math.min(activeZone + 1, ZONES.length)}/{ZONES.length} · synced to scroll scrub
                </p>
              </div>
            </motion.div>
          </motion.article>
        </AnimatePresence>

        {/* Progress HUD */}
        <div className="mt-10 flex gap-2 justify-center pointer-events-auto">
          {ZONES.map((z, idx) => (
            <div
              key={z.id}
              className="h-[3px] flex-1 max-w-[64px] rounded-full overflow-hidden bg-white/12"
              title={z.id}
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 origin-left"
                initial={false}
                animate={{ scaleX: activeZone >= idx ? 1 : 0.12 }}
                transition={{ duration: 0.45, ease: [0.33, 1, 0.68, 1] }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TunnelSectionsOverlay;
