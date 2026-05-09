import express from 'express';
import pool from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

router.get('/products', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, sku, barcode, name, unit_price, current_stock
       FROM products WHERE company_id = $1 ORDER BY name`,
      [req.user.company_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/products/:id/barcode', async (req, res) => {
  try {
    const { barcode } = req.body;
    const result = await pool.query(
      'UPDATE products SET barcode = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND company_id = $3 RETURNING id, sku, barcode, name',
      [barcode || null, req.params.id, req.user.company_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/generate-bulk', async (req, res) => {
  try {
    const { product_ids, use_sku } = req.body;
    let query;
    if (product_ids && product_ids.length > 0) {
      query = `SELECT id, sku, barcode, name, unit_price FROM products WHERE id = ANY($1::int[]) AND company_id = $2 ORDER BY name`;
      const result = await pool.query(query, [product_ids, req.user.company_id]);
      return res.json(result.rows);
    }
    const result = await pool.query(
      'SELECT id, sku, barcode, name, unit_price FROM products WHERE company_id = $1 ORDER BY name',
      [req.user.company_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
