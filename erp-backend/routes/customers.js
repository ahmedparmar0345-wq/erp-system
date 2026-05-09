import express from 'express';
import Joi from 'joi';
import pool from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/customers
router.get('/', auth, async (req, res) => {
  try {
    const { company_id } = req.query;
    let query = 'SELECT * FROM customers';
    const params = [];
    
    if (company_id) {
      query += ' WHERE company_id = $1';
      params.push(company_id);
    }
    
    query += ' ORDER BY id';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/customers/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/customers
router.post('/', auth, async (req, res) => {
  const schema = Joi.object({
    company_id: Joi.number().required(),
    name: Joi.string().required(),
    email: Joi.string().email().allow(null, ''),
    phone: Joi.string().allow(null, ''),
    billing_address: Joi.string().allow(null, ''),
    shipping_address: Joi.string().allow(null, '')
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { company_id, name, email, phone, billing_address, shipping_address } = value;

  try {
    const result = await pool.query(
      `INSERT INTO customers (company_id, name, email, phone, billing_address, shipping_address) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [company_id, name, email, phone, billing_address, shipping_address]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/customers/:id
router.put('/:id', auth, async (req, res) => {
  const schema = Joi.object({
    company_id: Joi.number(),
    name: Joi.string(),
    email: Joi.string().email().allow(null, ''),
    phone: Joi.string().allow(null, ''),
    billing_address: Joi.string().allow(null, ''),
    shipping_address: Joi.string().allow(null, '')
  }).min(1);

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const updates = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, val] of Object.entries(value)) {
    updates.push(`${key} = $${paramIndex++}`);
    values.push(val);
  }

  values.push(req.params.id);

  try {
    const result = await pool.query(
      `UPDATE customers SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/customers/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const orderCheck = await pool.query('SELECT COUNT(*) FROM sales_orders WHERE customer_id = $1', [req.params.id]);
    if (parseInt(orderCheck.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete customer with existing sales orders' });
    }

    const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
