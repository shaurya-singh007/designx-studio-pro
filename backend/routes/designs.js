const router = require('express').Router();
const { v4: uuidv4 } = require('crypto');
const { authenticate } = require('./auth');

const { getDB } = require('../db');

// Attempt MySQL connection
let db = null;
getDB().then(conn => { db = conn; });

// In-memory fallback
const designs = new Map();

// GET /api/designs
router.get('/', authenticate, async (req, res) => {
  try {
    if (db) {
      const [rows] = await db.execute('SELECT id, name, canvas_data as canvasData, type, created_at as createdAt, updated_at as updatedAt FROM designs WHERE user_id = ? OR user_id = 0', [req.user.id]);
      return res.json({ designs: rows, total: rows.length });
    }
    const userDesigns = [...designs.values()].filter(d => d.userId === req.user.id || d.userId === 'demo');
    res.json({ designs: userDesigns, total: userDesigns.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/designs/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    if (db) {
      const [rows] = await db.execute('SELECT id, name, canvas_data as canvasData, type, created_at as createdAt, updated_at as updatedAt FROM designs WHERE id = ?', [req.params.id]);
      if (!rows.length) return res.status(404).json({ error: 'Design not found' });
      const d = rows[0];
      if (typeof d.canvasData === 'string') d.canvasData = JSON.parse(d.canvasData);
      return res.json(d);
    }
    const d = designs.get(req.params.id);
    if (!d) return res.status(404).json({ error: 'Design not found' });
    res.json(d);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/designs
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, canvasData, type = 'Custom' } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const id = uuidv4();
    const canvasStr = JSON.stringify(canvasData || { objects: [], bg: '#0E0E2C' });

    if (db) {
      await db.execute('INSERT INTO designs (id, user_id, name, canvas_data, type) VALUES (?, ?, ?, ?, ?)', 
        [id, req.user.id, name, canvasStr, type]);
      return res.status(201).json({ id, name, canvasData, type });
    }

    const design = { id, userId: req.user.id, name, canvasData: canvasData || { objects: [], bg: '#0E0E2C' }, type, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    designs.set(id, design);
    res.status(201).json(design);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/designs/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, canvasData, type } = req.body;
    
    if (db) {
      const [rows] = await db.execute('SELECT user_id FROM designs WHERE id = ?', [req.params.id]);
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      if (rows[0].user_id != req.user.id) return res.status(403).json({ error: 'Forbidden' });
      
      let query = 'UPDATE designs SET updated_at = NOW()';
      const params = [];
      if (name) { query += ', name = ?'; params.push(name); }
      if (canvasData) { query += ', canvas_data = ?'; params.push(JSON.stringify(canvasData)); }
      if (type) { query += ', type = ?'; params.push(type); }
      query += ' WHERE id = ?';
      params.push(req.params.id);
      
      await db.execute(query, params);
      return res.json({ id: req.params.id, message: 'Updated' });
    }

    const d = designs.get(req.params.id);
    if (!d) return res.status(404).json({ error: 'Not found' });
    if (d.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    const updated = { ...d, ...req.body, id: d.id, userId: d.userId, updatedAt: new Date().toISOString() };
    designs.set(d.id, updated);
    res.json(updated);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/designs/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (db) {
      const [rows] = await db.execute('SELECT user_id FROM designs WHERE id = ?', [req.params.id]);
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      if (rows[0].user_id != req.user.id) return res.status(403).json({ error: 'Forbidden' });
      await db.execute('DELETE FROM designs WHERE id = ?', [req.params.id]);
      return res.json({ message: 'Deleted' });
    }
    const d = designs.get(req.params.id);
    if (!d) return res.status(404).json({ error: 'Not found' });
    if (d.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    designs.delete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
