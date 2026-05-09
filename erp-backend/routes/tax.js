import express from 'express';
import pool from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tax_rates WHERE company_id = $1 ORDER BY is_default DESC, name',
      [req.user.company_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/default', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tax_rates WHERE company_id = $1 AND is_default = true AND is_active = true LIMIT 1',
      [req.user.company_id]
    );
    if (result.rows.length === 0) {
      const first = await pool.query(
        'SELECT * FROM tax_rates WHERE company_id = $1 AND is_active = true ORDER BY id LIMIT 1',
        [req.user.company_id]
      );
      return res.json(first.rows[0] || null);
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, rate, type, is_default, is_active, description } = req.body;
    if (!name || rate === undefined) return res.status(400).json({ error: 'Name and rate are required' });
    await client.query('BEGIN');
    if (is_default) {
      await client.query('UPDATE tax_rates SET is_default = false WHERE company_id = $1', [req.user.company_id]);
    }
    const result = await client.query(
      `INSERT INTO tax_rates (company_id, name, rate, type, is_default, is_active, description, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.user.company_id, name, rate, type || 'VAT', is_default === true, is_active !== false, description, req.user.id]
    );
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, rate, type, is_default, is_active, description } = req.body;
    await client.query('BEGIN');
    if (is_default) {
      await client.query('UPDATE tax_rates SET is_default = false WHERE company_id = $1', [req.user.company_id]);
    }
    const result = await client.query(
      `UPDATE tax_rates SET name = $1, rate = $2, type = $3, is_default = $4, is_active = $5,
       description = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 AND company_id = $8 RETURNING *`,
      [name, rate, type || 'VAT', is_default === true, is_active !== false, description, req.params.id, req.user.company_id]
    );
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Tax rate not found' });
    }
    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM tax_rates WHERE id = $1 AND company_id = $2 RETURNING id',
      [req.params.id, req.user.company_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tax rate not found' });
    res.json({ message: 'Tax rate deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
