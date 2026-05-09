import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Star, Crown, Sparkles, ChevronDown } from 'lucide-react';

const CATEGORIES = ['All', 'Social', 'Poster', 'Banner', 'Flyer', 'Logo', 'Card', 'Presentation'];

const GRADIENTS = [
  'linear-gradient(135deg,#7C3AED,#F59E0B)',
  'linear-gradient(135deg,#06B6D4,#7C3AED)',
  'linear-gradient(135deg,#F59E0B,#EF4444)',
  'linear-gradient(135deg,#10B981,#06B6D4)',
  'linear-gradient(135deg,#EC4899,#7C3AED)',
  'linear-gradient(135deg,#EF4444,#F97316)',
  'linear-gradient(135deg,#5B21B6,#EC4899)',
  'linear-gradient(135deg,#0EA5E9,#10B981)',
  'linear-gradient(135deg,#F97316,#EAB308)',
  'linear-gradient(135deg,#7C3AED,#06B6D4)',
  'linear-gradient(135deg,#1E3A5F,#7C3AED)',
  'linear-gradient(135deg,#064E3B,#F59E0B)',
];

const TEMPLATES = [
  { id: 1, name: 'Royal Brand Kit', cat: 'Poster', plan: 'PRO', rating: 4.9, uses: '12K', gradient: 0 },
  { id: 2, name: 'Neon Social Pack', cat: 'Social', plan: 'FREE', rating: 4.7, uses: '8K', gradient: 1 },
  { id: 3, name: 'Product Launch', cat: 'Banner', plan: 'PRO', rating: 4.8, uses: '5K', gradient: 2 },
  { id: 4, name: 'Event Flyer Pro', cat: 'Flyer', plan: 'PRO', rating: 4.6, uses: '3K', gradient: 3 },
  { id: 5, name: 'Minimal Logo', cat: 'Logo', plan: 'FREE', rating: 4.5, uses: '15K', gradient: 4 },
  { id: 6, name: 'Business Card', cat: 'Card', plan: 'FREE', rating: 4.4, uses: '9K', gradient: 5 },
  { id: 7, name: 'Glow Poster', cat: 'Poster', plan: 'VIP', rating: 5.0, uses: '2K', gradient: 6 },
  { id: 8, name: 'Deck Master', cat: 'Presentation', plan: 'PRO', rating: 4.8, uses: '4K', gradient: 7 },
  { id: 9, name: 'Story Pack', cat: 'Social', plan: 'FREE', rating: 4.3, uses: '20K', gradient: 8 },
  { id: 10, name: 'Gold Edition', cat: 'Flyer', plan: 'VIP', rating: 4.9, uses: '1.5K', gradient: 9 },
  { id: 11, name: 'Night Mode Banner', cat: 'Banner', plan: 'PRO', rating: 4.7, uses: '6K', gradient: 10 },
  { id: 12, name: 'Vintage Logo', cat: 'Logo', plan: 'PRO', rating: 4.6, uses: '7K', gradient: 11 },
];

export default function Templates() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = TEMPLATES.filter(t =>
    (activeCat === 'All' || t.cat === activeCat) &&
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-4 animate-fade-in">

      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h1 className="section-title text-2xl mb-1">Templates</h1>
        <p className="text-muted text-xs">500+ professional templates to jumpstart your design</p>
      </div>

      {/* Search + Filter */}
      <div className="px-4 mb-3 flex gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-8 pr-3 py-2.5 text-[12px] text-platinum placeholder-muted rounded-xl focus:outline-none"
            style={{ background: 'rgba(14,14,44,0.8)', border: '1px solid rgba(124,58,237,0.25)' }}
          />
        </div>
        <button onClick={() => setSortOpen(!sortOpen)}
          className="tool-btn w-10 h-10 flex-shrink-0">
          <SlidersHorizontal size={15} />
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 px-4 mb-4 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCat(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-600 transition-all ${activeCat === cat
              ? 'text-[#07071A]'
              : 'text-muted'}`}
            style={activeCat === cat
              ? { background: 'linear-gradient(135deg,#7C3AED,#F59E0B)', boxShadow: '0 0 12px rgba(124,58,237,0.4)' }
              : { background: 'rgba(14,14,44,0.8)', border: '1px solid rgba(124,58,237,0.2)' }}>
            {cat}
          </button>
        ))}
      </div>

      {/* AI Suggested */}
      <div className="px-4 mb-4">
        <div className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
          style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.25),rgba(245,158,11,0.15))', border: '1px solid rgba(124,58,237,0.3)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#F59E0B)' }}>
            <Sparkles size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-700 text-platinum">AI Template Generator</div>
            <div className="text-[10px] text-muted">Describe your design and AI builds the template</div>
          </div>
          <button className="text-[10px] font-700 text-gold px-3 py-1.5 rounded-full flex-shrink-0"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>Try</button>
        </div>
      </div>

      {/* Grid */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-muted font-600">{filtered.length} templates</span>
          <span className="text-[10px] text-royal-light font-600 flex items-center gap-1 cursor-pointer" onClick={() => setSortOpen(!sortOpen)}>
            Sort: Popular <ChevronDown size={11} />
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filtered.map((t, i) => (
            <motion.div key={t.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="template-card" onClick={() => navigate('/editor')}>
              {/* Thumbnail */}
              <div className="relative h-32 flex items-center justify-center"
                style={{ background: GRADIENTS[t.gradient] }}>
                <span className="text-white/30 text-4xl font-800">Dx</span>
                <div className="absolute top-2 left-2">
                  {t.plan === 'FREE'
                    ? <span className="badge-free">{t.plan}</span>
                    : t.plan === 'VIP'
                    ? <span className="badge-pro flex items-center gap-0.5"><Crown size={8} /> VIP</span>
                    : <span className="badge-pro">{t.plan}</span>}
                </div>
              </div>
              {/* Info */}
              <div className="p-3">
                <div className="text-[11px] font-700 text-platinum truncate mb-1">{t.name}</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-muted">
                    <Star size={9} className="text-gold" fill="#F59E0B" /> {t.rating} · {t.uses}
                  </div>
                  <span className="text-[9px] text-muted">{t.cat}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted text-sm mb-2">No templates found</div>
            <button className="btn-royal text-xs py-2 px-4" onClick={() => setSearch('')}>Clear Search</button>
          </div>
        )}
      </div>
    </div>
  );
}
