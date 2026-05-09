import express from 'express';
import pool from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

const generateInvoiceNumber = async (companyId) => {
  const result = await pool.query(
    "SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'SINV-([0-9]+)$') AS INTEGER)), 0) + 1 as next FROM service_invoices WHERE company_id = $1",
    [companyId]
  );
  return `SINV-${String(result.rows[0].next).padStart(5, '0')}`;
};

router.get('/', async (req, res) => {
  try {
    const { status, customer_id } = req.query;
    let query = `
      SELECT si.*, c.name as customer_name
      FROM service_invoices si
      LEFT JOIN customers c ON si.customer_id = c.id
      WHERE si.company_id = $1
    `;
    const params = [req.user.company_id];
    if (status) { query += ' AND si.status = $2'; params.push(status); }
    if (customer_id) { query += ' AND si.customer_id = $3'; params.push(customer_id); }
    query += ' ORDER BY si.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const inv = await pool.query(
      `SELECT si.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
              c.billing_address, c.shipping_address
       FROM service_invoices si
       LEFT JOIN customers c ON si.customer_id = c.id
       WHERE si.id = $1 AND si.company_id = $2`,
      [req.params.id, req.user.company_id]
    );
    if (inv.rows.length === 0) return res.status(404).json({ error: 'Service invoice not found' });
    const items = await pool.query(
      `SELECT sii.*, s.name as service_name
       FROM service_invoice_items sii
       LEFT JOIN services s ON sii.service_id = s.id
       WHERE sii.service_invoice_id = $1`,
      [req.params.id]
    );
    res.json({ ...inv.rows[0], items: items.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { customer_id, invoice_date, due_date, notes, terms_conditions, items } = req.body;
    if (!customer_id || !items || items.length === 0) {
      return res.status(400).json({ error: 'Customer and at least one item are required' });
    }
    await client.query('BEGIN');
    let subtotal = 0, tax_total = 0, discount_total = 0;
    for (const item of items) {
      const itemTotal = item.quantity * item.unit_price;
      const itemDiscount = itemTotal * ((item.discount_percent || 0) / 100);
      const itemTax = (itemTotal - itemDiscount) * ((item.tax_percent || 0) / 100);
      subtotal += itemTotal;
      discount_total += itemDiscount;
      tax_total += itemTax;
    }
    const grand_total = subtotal - discount_total + tax_total;
    const invoiceNumber = await generateInvoiceNumber(req.user.company_id);
    const invResult = await client.query(
      `INSERT INTO service_invoices (company_id, invoice_number, customer_id, invoice_date, due_date, status, subtotal, tax_total, discount_total, grand_total, notes, terms_conditions, created_by)
       VALUES ($1, $2, $3, $4, $5, 'draft', $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [req.user.company_id, invoiceNumber, customer_id, invoice_date || new Date(), due_date, subtotal, tax_total, discount_total, grand_total, notes, terms_conditions, req.user.id]
    );
    const invoice = invResult.rows[0];
    for (const item of items) {
      const itemTotal = item.quantity * item.unit_price;
      const itemDiscount = itemTotal * ((item.discount_percent || 0) / 100);
      const total = itemTotal - itemDiscount;
      await client.query(
        `INSERT INTO service_invoice_items (service_invoice_id, service_id, description, quantity, unit_price, discount_percent, tax_percent, total)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [invoice.id, item.service_id || null, item.description, item.quantity, item.unit_price, item.discount_percent || 0, item.tax_percent || 0, total]
      );
    }
    await client.query('COMMIT');
    const full = await client.query(
      `SELECT si.*, c.name as customer_name
       FROM service_invoices si
       LEFT JOIN customers c ON si.customer_id = c.id
       WHERE si.id = $1`,
      [invoice.id]
    );
    res.status(201).json(full.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { customer_id, invoice_date, due_date, notes, terms_conditions, items } = req.body;
    const existing = await client.query(
      'SELECT status FROM service_invoices WHERE id = $1 AND company_id = $2',
      [req.params.id, req.user.company_id]
    );
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Service invoice not found' });
    if (existing.rows[0].status !== 'draft') return res.status(400).json({ error: 'Only draft invoices can be edited' });
    await client.query('BEGIN');
    let subtotal = 0, tax_total = 0, discount_total = 0;
    if (items && items.length > 0) {
      for (const item of items) {
        const itemTotal = item.quantity * item.unit_price;
        const itemDiscount = itemTotal * ((item.discount_percent || 0) / 100);
        const itemTax = (itemTotal - itemDiscount) * ((item.tax_percent || 0) / 100);
        subtotal += itemTotal;
        discount_total += itemDiscount;
        tax_total += itemTax;
      }
    }
    const grand_total = subtotal - discount_total + tax_total;
    await client.query(
      `UPDATE service_invoices SET customer_id = $1, invoice_date = $2, due_date = $3,
       notes = $4, terms_conditions = $5, subtotal = $6, tax_total = $7,
       discount_total = $8, grand_total = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 AND company_id = $11`,
      [customer_id, invoice_date, due_date, notes, terms_conditions, subtotal, tax_total, discount_total, grand_total, req.params.id, req.user.company_id]
    );
    if (items && items.length > 0) {
      await client.query('DELETE FROM service_invoice_items WHERE service_invoice_id = $1', [req.params.id]);
      for (const item of items) {
        const itemTotal = item.quantity * item.unit_price;
        const itemDiscount = itemTotal * ((item.discount_percent || 0) / 100);
        const total = itemTotal - itemDiscount;
        await client.query(
          `INSERT INTO service_invoice_items (service_invoice_id, service_id, description, quantity, unit_price, discount_percent, tax_percent, total)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [req.params.id, item.service_id || null, item.description, item.quantity, item.unit_price, item.discount_percent || 0, item.tax_percent || 0, total]
        );
      }
    }
    await client.query('COMMIT');
    const result = await pool.query(
      `SELECT si.*, c.name as customer_name
       FROM service_invoices si
       LEFT JOIN customers c ON si.customer_id = c.id
       WHERE si.id = $1`,
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['draft', 'sent', 'paid', 'cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ error: `Invalid status. Must be one of: ${valid.join(', ')}` });
    const result = await pool.query(
      `UPDATE service_invoices SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND company_id = $3 RETURNING *`,
      [status, req.params.id, req.user.company_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Service invoice not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM service_invoices WHERE id = $1 AND company_id = $2 RETURNING id',
      [req.params.id, req.user.company_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Service invoice not found' });
    res.json({ message: 'Service invoice deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
