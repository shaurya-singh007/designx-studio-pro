const router = require('express').Router();
const { authenticate } = require('./auth');

const PLANS = {
  pro: { name: 'Pro', price: 9, aiCredits: 50, stripeId: 'price_pro_monthly' },
  vip: { name: 'VIP', price: 29, aiCredits: -1, stripeId: 'price_vip_monthly' },
};

// GET /api/subscription/plans
router.get('/plans', (req, res) => {
  res.json({
    plans: [
      { id: 'free', name: 'Free', price: 0, aiCredits: 5, features: ['5 AI credits/month', '10 templates', 'PNG export (watermark)', '5 saved designs'] },
      { id: 'pro', name: 'Pro', price: 9, aiCredits: 50, features: ['50 AI credits/month', '500+ templates', 'HD export (4K)', 'Unlimited saves', 'PDF & SVG export'], popular: true },
      { id: 'vip', name: 'VIP', price: 29, aiCredits: -1, features: ['Unlimited AI', 'All templates', '4K + batch export', 'Priority support', 'Custom brand kit', 'API access'] },
    ],
  });
});

// POST /api/subscription/upgrade — simulate Stripe checkout
router.post('/upgrade', authenticate, async (req, res) => {
  const { planId } = req.body;
  const plan = PLANS[planId];
  if (!plan) return res.status(400).json({ error: 'Invalid plan' });

  // In prod: create Stripe Checkout session and return URL
  res.json({
    checkoutUrl: `https://checkout.stripe.com/pay/cs_test_demo_${planId}_${Date.now()}`,
    plan: plan.name,
    message: 'Redirect to Stripe checkout (mock)',
  });
});

// POST /api/subscription/cancel
router.post('/cancel', authenticate, (req, res) => {
  res.json({ message: 'Subscription scheduled for cancellation at period end' });
});

// GET /api/subscription/status
router.get('/status', authenticate, (req, res) => {
  res.json({
    plan: req.user.plan || 'FREE',
    status: 'active',
    renewsAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    aiCreditsRemaining: req.user.plan === 'VIP' ? 'Unlimited' : req.user.plan === 'PRO' ? 50 : 5,
  });
});

module.exports = router;
