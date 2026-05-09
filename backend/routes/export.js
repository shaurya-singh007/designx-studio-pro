const router = require('express').Router();
const { authenticate } = require('./auth');

// POST /api/export — simulates export (in prod: html2canvas + S3 upload)
router.post('/', authenticate, (req, res) => {
  const { designId, format, quality = 'standard' } = req.body;
  if (!designId || !format) return res.status(400).json({ error: 'designId and format required' });

  const allowed = { FREE: ['png', 'jpg'], PRO: ['png', 'jpg', 'pdf', 'svg'], VIP: ['png', 'jpg', 'pdf', 'svg', 'webp'] };
  const userPlan = req.user.plan || 'FREE';
  const formats = allowed[userPlan] || allowed.FREE;

  if (!formats.includes(format.toLowerCase())) {
    return res.status(403).json({ error: `${format.toUpperCase()} export requires Pro plan`, upgradeRequired: true });
  }

  // Simulate processing delay + return mock download URL
  setTimeout(() => {
    res.json({
      url: `https://cdn.designx.pro/exports/${designId}_${Date.now()}.${format}`,
      format,
      size: format === 'pdf' ? '2.4 MB' : '850 KB',
      watermark: userPlan === 'FREE',
      expiresIn: '24h',
    });
  }, 800);
});

// GET export formats available for user
router.get('/formats', authenticate, (req, res) => {
  const plan = req.user.plan || 'FREE';
  const ALL_FORMATS = [
    { id: 'png', label: 'PNG', plans: ['FREE', 'PRO', 'VIP'], note: plan === 'FREE' ? 'Watermark added' : '4K available' },
    { id: 'jpg', label: 'JPG', plans: ['FREE', 'PRO', 'VIP'], note: '' },
    { id: 'pdf', label: 'PDF', plans: ['PRO', 'VIP'], note: 'Multi-page support' },
    { id: 'svg', label: 'SVG', plans: ['PRO', 'VIP'], note: 'Vector, infinitely scalable' },
    { id: 'webp', label: 'WebP', plans: ['VIP'], note: 'Best compression' },
  ];
  res.json({ formats: ALL_FORMATS, plan });
});

module.exports = router;
