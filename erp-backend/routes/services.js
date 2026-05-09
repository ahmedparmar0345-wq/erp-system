import express from 'express';
import pool from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT s.*, tr.name as tax_name, tr.rate as tax_rate FROM services s LEFT JOIN tax_rates tr ON s.tax_rate_id = tr.id WHERE s.company_id = $1';
    const params = [req.user.company_id];
    if (category) { query += ' AND s.category = $2'; params.push(category); }
    query += ' ORDER BY s.name';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT category FROM services WHERE company_id = $1 AND category IS NOT NULL AND category != \'\' ORDER BY category',
      [req.user.company_id]
    );
    res.json(result.rows.map(r => r.category));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT s.*, tr.name as tax_name, tr.rate as tax_rate FROM services s LEFT JOIN tax_rates tr ON s.tax_rate_id = tr.id WHERE s.id = $1 AND s.company_id = $2',
      [req.params.id, req.user.company_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Service not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, category, unit_price, tax_percent, tax_rate_id } = req.body;
    if (!name) return res.status(400).json({ error: 'Service name is required' });
    const result = await pool.query(
      `INSERT INTO services (company_id, name, description, category, unit_price, tax_percent, tax_rate_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.user.company_id, name, description, category, unit_price || 0, tax_percent || 0, tax_rate_id || null, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, description, category, unit_price, tax_percent, tax_rate_id, is_active } = req.body;
    const result = await pool.query(
      `UPDATE services SET name = $1, description = $2, category = $3, unit_price = $4, tax_percent = $5,
       tax_rate_id = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 AND company_id = $9 RETURNING *`,
      [name, description, category, unit_price || 0, tax_percent || 0, tax_rate_id || null, is_active !== false, req.params.id, req.user.company_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Service not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM services WHERE id = $1 AND company_id = $2 RETURNING id',
      [req.params.id, req.user.company_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Service not found' });
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
