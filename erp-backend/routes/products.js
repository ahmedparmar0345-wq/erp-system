import express from 'express';
import pool from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

// GET all products
router.get('/', async (req, res) => {
  try {
    const { company_id, low_stock } = req.query;
    let query = 'SELECT p.*, tr.name as tax_name, tr.rate as tax_rate FROM products p LEFT JOIN tax_rates tr ON p.tax_rate_id = tr.id';
    let params = [];
    let conditions = [];

    if (company_id) {
      conditions.push(`p.company_id = $${params.length + 1}`);
      params.push(company_id);
    } else {
      conditions.push(`p.company_id = $${params.length + 1}`);
      params.push(req.user.company_id);
    }

    if (low_stock === 'true') {
      conditions.push(`p.current_stock < p.reorder_level`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY p.name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT p.*, tr.name as tax_name, tr.rate as tax_rate FROM products p LEFT JOIN tax_rates tr ON p.tax_rate_id = tr.id WHERE p.id = $1 AND p.company_id = $2',
      [req.params.id, req.user.company_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST create product
router.post('/', async (req, res) => {
  try {
    const { sku, name, description, unit_price, cost_price, current_stock, reorder_level, tax_rate_id, barcode } = req.body;

    if (!sku || !name) {
      return res.status(400).json({ error: 'SKU and name are required' });
    }

    // Check if SKU already exists
    const existing = await pool.query(
      'SELECT id FROM products WHERE sku = $1 AND company_id = $2',
      [sku, req.user.company_id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Product with this SKU already exists' });
    }

    const result = await pool.query(
      `INSERT INTO products (company_id, sku, name, description, unit_price, cost_price, current_stock, reorder_level, tax_rate_id, barcode, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING *`,
      [req.user.company_id, sku, name, description, unit_price || 0, cost_price || 0, current_stock || 0, reorder_level || 0, tax_rate_id || null, barcode || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update product
router.put('/:id', async (req, res) => {
  try {
    const { name, description, unit_price, cost_price, current_stock, reorder_level, tax_rate_id, barcode } = req.body;

    const result = await pool.query(
      `UPDATE products 
             SET name = COALESCE($1, name),
                 description = COALESCE($2, description),
                 unit_price = COALESCE($3, unit_price),
                 cost_price = COALESCE($4, cost_price),
                 current_stock = COALESCE($5, current_stock),
                 reorder_level = COALESCE($6, reorder_level),
                 tax_rate_id = $7,
                 barcode = $8,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $9 AND company_id = $10
             RETURNING *`,
      [name, description, unit_price, cost_price, current_stock, reorder_level, tax_rate_id || null, barcode || null, req.params.id, req.user.company_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH update stock
router.patch('/:id/stock', async (req, res) => {
  const client = await pool.connect();
  try {
    const { quantity, type } = req.body;

    if (!quantity || !type || !['add', 'subtract', 'set'].includes(type)) {
      return res.status(400).json({ error: 'quantity and type (add/subtract/set) are required' });
    }

    await client.query('BEGIN');

    const product = await client.query(
      'SELECT current_stock FROM products WHERE id = $1 AND company_id = $2',
      [req.params.id, req.user.company_id]
    );

    if (product.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Product not found' });
    }

    let newStock;
    let transactionType;

    switch (type) {
      case 'add':
        newStock = product.rows[0].current_stock + quantity;
        transactionType = 'in';
        break;
      case 'subtract':
        newStock = product.rows[0].current_stock - quantity;
        transactionType = 'out';
        break;
      case 'set':
        newStock = quantity;
        transactionType = 'adjustment';
        break;
    }

    await client.query(
      'UPDATE products SET current_stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newStock, req.params.id]
    );

    await client.query(
      `INSERT INTO inventory_transactions (product_id, type, quantity, reference_type, created_at)
             VALUES ($1, $2, $3, 'api_adjustment', CURRENT_TIMESTAMP)`,
      [req.params.id, transactionType, Math.abs(quantity)]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Stock updated successfully',
      product_id: req.params.id,
      old_stock: product.rows[0].current_stock,
      new_stock: newStock
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const salesCheck = await pool.query(
      'SELECT id FROM sales_order_items WHERE product_id = $1 LIMIT 1',
      [req.params.id]
    );

    if (salesCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot delete product with existing sales orders' });
    }

    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 AND company_id = $2 RETURNING id',
      [req.params.id, req.user.company_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;