const router = require('express').Router();
const { authenticate } = require('./auth');

const TEMPLATES = [
  { id: '1', name: 'Royal Brand Kit', category: 'Poster', plan: 'PRO', rating: 4.9, uses: 12000, thumbnail: 'gradient-purple-gold', tags: ['brand', 'luxury', 'corporate'] },
  { id: '2', name: 'Neon Social Pack', category: 'Social', plan: 'FREE', rating: 4.7, uses: 8000, thumbnail: 'gradient-cyan-purple', tags: ['social', 'neon', 'instagram'] },
  { id: '3', name: 'Product Launch', category: 'Banner', plan: 'PRO', rating: 4.8, uses: 5000, thumbnail: 'gradient-gold-red', tags: ['product', 'launch', 'marketing'] },
  { id: '4', name: 'Event Flyer Pro', category: 'Flyer', plan: 'PRO', rating: 4.6, uses: 3000, thumbnail: 'gradient-teal-cyan', tags: ['event', 'flyer', 'party'] },
  { id: '5', name: 'Minimal Logo', category: 'Logo', plan: 'FREE', rating: 4.5, uses: 15000, thumbnail: 'gradient-pink-purple', tags: ['logo', 'minimal', 'clean'] },
  { id: '6', name: 'Business Card', category: 'Card', plan: 'FREE', rating: 4.4, uses: 9000, thumbnail: 'gradient-red-orange', tags: ['card', 'business', 'professional'] },
  { id: '7', name: 'Glow Poster VIP', category: 'Poster', plan: 'VIP', rating: 5.0, uses: 2000, thumbnail: 'gradient-purple-pink', tags: ['glow', 'dark', 'premium'] },
  { id: '8', name: 'Deck Master', category: 'Presentation', plan: 'PRO', rating: 4.8, uses: 4000, thumbnail: 'gradient-sky-teal', tags: ['presentation', 'slides', 'pitch'] },
];

// GET all templates
router.get('/', (req, res) => {
  const { category, plan, q } = req.query;
  let filtered = [...TEMPLATES];
  if (category && category !== 'All') filtered = filtered.filter(t => t.category === category);
  if (plan) filtered = filtered.filter(t => t.plan === plan.toUpperCase());
  if (q) filtered = filtered.filter(t => t.name.toLowerCase().includes(q.toLowerCase()) || t.tags.some(tag => tag.includes(q.toLowerCase())));
  res.json({ templates: filtered, total: filtered.length });
});

// GET single template
router.get('/:id', (req, res) => {
  const t = TEMPLATES.find(t => t.id === req.params.id);
  if (!t) return res.status(404).json({ error: 'Template not found' });
  res.json(t);
});

// POST use template (clone to user design)
router.post('/:id/use', authenticate, (req, res) => {
  const t = TEMPLATES.find(t => t.id === req.params.id);
  if (!t) return res.status(404).json({ error: 'Template not found' });
  if (t.plan !== 'FREE' && req.user.plan === 'FREE') {
    return res.status(403).json({ error: 'Upgrade to Pro to use this template', upgradeRequired: true });
  }
  // In prod, clone canvas data for user
  res.json({ message: 'Template applied', designId: require('crypto').randomUUID(), template: t });
});

module.exports = router;
