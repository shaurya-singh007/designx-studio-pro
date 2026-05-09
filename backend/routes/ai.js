const router = require('express').Router();
const { authenticate } = require('./auth');

// Credit limits per plan
const PLAN_CREDITS = { FREE: 5, PRO: 50, VIP: Infinity };

// Mock credit store
const credits = new Map(); // userId → { used, refreshedAt }

function getCredits(userId, plan) {
  if (!credits.has(userId)) credits.set(userId, { used: 0, refreshedAt: new Date().toISOString() });
  const c = credits.get(userId);
  const limit = PLAN_CREDITS[plan] || 5;
  return { used: c.used, limit, remaining: limit === Infinity ? 'Unlimited' : Math.max(0, limit - c.used) };
}

// POST /api/ai/generate-image
router.post('/generate-image', authenticate, async (req, res) => {
  const { prompt, style = 'photorealistic', size = '1024x1024' } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });

  const plan = req.user.plan || 'FREE';
  const c = getCredits(req.user.id, plan);
  if (c.remaining !== 'Unlimited' && c.remaining <= 0) {
    return res.status(403).json({ error: 'AI credits exhausted. Upgrade to Pro for more.', upgradeRequired: true });
  }

  // Deduct credit
  const store = credits.get(req.user.id) || { used: 0 };
  credits.set(req.user.id, { ...store, used: store.used + 1, refreshedAt: store.refreshedAt });

  // Simulate DALL·E call (replace with real OpenAI call in prod)
  await new Promise(r => setTimeout(r, 1200));

  res.json({
    imageUrl: `https://picsum.photos/seed/${Date.now()}/1024/1024`,
    prompt,
    style,
    creditsUsed: 1,
    creditsRemaining: c.remaining !== 'Unlimited' ? c.remaining - 1 : 'Unlimited',
  });
});

// POST /api/ai/generate-text
router.post('/generate-text', authenticate, async (req, res) => {
  const { context, type = 'headline' } = req.body;
  await new Promise(r => setTimeout(r, 600));
  const samples = {
    headline: ['Design Like a Pro', 'Unleash Your Creativity', 'Premium Design Studio', 'Create. Inspire. Dominate.'],
    tagline: ['Where Ideas Become Reality', 'Professional Design, Simplified', 'Your Creative Power, Amplified'],
    cta: ['Start Designing Free', 'Get Started Today', 'Try Pro Free for 7 Days'],
  };
  const texts = samples[type] || samples.headline;
  res.json({ text: texts[Math.floor(Math.random() * texts.length)], type });
});

// POST /api/ai/remove-background
router.post('/remove-background', authenticate, async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ error: 'imageUrl required' });
  await new Promise(r => setTimeout(r, 1500));
  res.json({ processedUrl: imageUrl, message: 'Background removed (mock)' });
});

// GET /api/ai/credits
router.get('/credits', authenticate, (req, res) => {
  const plan = req.user.plan || 'FREE';
  res.json(getCredits(req.user.id, plan));
});

module.exports = router;
