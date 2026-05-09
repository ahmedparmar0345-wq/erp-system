import express from 'express';
import db from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

const generateInvoiceNumber = async (companyId) => {
  const result = await db.query(
    "SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'INV-([0-9]+)$') AS INTEGER)), 0) + 1 as next FROM invoices WHERE company_id = $1",
    [companyId]
  );
  return `INV-${String(result.rows[0].next).padStart(5, '0')}`;
};

// GET all invoices
router.get('/', async (req, res) => {
  try {
    const { status, customer_id } = req.query;
    let query = `
      SELECT i.*, c.name as customer_name
      FROM invoices i JOIN customers c ON i.customer_id = c.id WHERE i.company_id = $1
    `;
    const params = [req.user.company_id];
    if (status) { query += ' AND i.status = $2'; params.push(status); }
    if (customer_id) { query += ' AND i.customer_id = $3'; params.push(customer_id); }
    query += ' ORDER BY i.created_at DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET single invoice
router.get('/:id', async (req, res) => {
  try {
    const inv = await db.query(
      'SELECT i.*, c.name as customer_name, c.billing_address, c.shipping_address FROM invoices i JOIN customers c ON i.customer_id = c.id WHERE i.id = $1 AND i.company_id = $2',
      [req.params.id, req.user.company_id]
    );
    if (inv.rows.length === 0) return res.status(404).json({ error: 'Invoice not found' });
    const items = await db.query(`
      SELECT ii.*, p.name as product_name, p.sku FROM invoice_items ii
      LEFT JOIN products p ON ii.product_id = p.id WHERE ii.invoice_id = $1
    `, [req.params.id]);
    const payments = await db.query('SELECT * FROM payments WHERE invoice_id = $1 ORDER BY payment_date', [req.params.id]);
    res.json({ ...inv.rows[0], items: items.rows, payments: payments.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create invoice from sales order
router.post('/from-order/:orderId', async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const order = await client.query(
      'SELECT * FROM sales_orders WHERE id = $1 AND company_id = $2',
      [req.params.orderId, req.user.company_id]
    );
    if (order.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Order not found' }); }
    const so = order.rows[0];
    if (so.status === 'invoiced') { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Order already invoiced' }); }

    const invNum = await generateInvoiceNumber(req.user.company_id);
    const dueDate = req.body.due_date || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    const inv = await client.query(`
      INSERT INTO invoices (company_id, invoice_number, sales_order_id, customer_id, invoice_date, due_date, status, subtotal, tax_total, grand_total, payment_terms, notes, created_by)
      VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, 'draft', $6, $7, $8, $9, $10, $11) RETURNING *
    `, [req.user.company_id, invNum, so.id, so.customer_id, dueDate, so.subtotal, so.tax_total, so.grand_total, req.body.payment_terms, req.body.notes || so.notes, req.user.id]);

    const orderItems = await client.query('SELECT * FROM sales_order_items WHERE sales_order_id = $1', [so.id]);
    for (const item of orderItems.rows) {
      const total = (item.quantity * parseFloat(item.unit_price)) * (1 - (item.discount_percent || 0) / 100);
      await client.query(`
        INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, discount_percent, total)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [inv.rows[0].id, item.product_id, null, item.quantity, item.unit_price, item.discount_percent || 0, total]);
    }

    await client.query("UPDATE sales_orders SET status = 'invoiced' WHERE id = $1", [so.id]);
    await client.query('COMMIT');
    res.status(201).json(inv.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

// Create manual invoice
router.post('/', async (req, res) => {
  const client = await db.connect();
  try {
    const { customer_id, invoice_date, due_date, items, payment_terms, notes, terms_conditions } = req.body;
    if (!customer_id || !items || items.length === 0) { return res.status(400).json({ error: 'Customer and items required' }); }

    await client.query('BEGIN');
    const invNum = await generateInvoiceNumber(req.user.company_id);
    let subtotal = 0, taxTotal = 0;
    for (const item of items) {
      const itemTotal = item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100);
      subtotal += itemTotal;
      taxTotal += itemTotal * ((item.tax_percent || 0) / 100);
    }
    const grandTotal = subtotal + taxTotal;

    const inv = await client.query(`
      INSERT INTO invoices (company_id, invoice_number, customer_id, invoice_date, due_date, status, subtotal, tax_total, grand_total, payment_terms, notes, terms_conditions, created_by)
      VALUES ($1, $2, $3, $4, $5, 'draft', $6, $7, $8, $9, $10, $11, $12) RETURNING *
    `, [req.user.company_id, invNum, customer_id, invoice_date || new Date(), due_date, subtotal, taxTotal, grandTotal, payment_terms, notes, terms_conditions, req.user.id]);

    for (const item of items) {
      const total = item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100) * (1 + (item.tax_percent || 0) / 100);
      await client.query(`
        INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [inv.rows[0].id, item.product_id, item.description, item.quantity, item.unit_price, item.discount_percent || 0, item.tax_percent || 0, total]);
    }

    await client.query('COMMIT');
    res.status(201).json(inv.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

// Update invoice status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await db.query('UPDATE invoices SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND company_id = $3 RETURNING *',
      [status, req.params.id, req.user.company_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Invoice not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Record payment against invoice
router.post('/:id/payments', async (req, res) => {
  const client = await db.connect();
  try {
    const { payment_date, amount, payment_method, reference_number, notes } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid amount required' });

    await client.query('BEGIN');
    const payNum = `PAY-${Date.now()}`;
    const payment = await client.query(`
      INSERT INTO payments (company_id, invoice_id, payment_number, payment_date, amount, payment_method, reference_number, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    `, [req.user.company_id, req.params.id, payNum, payment_date || new Date(), amount, payment_method, reference_number, notes, req.user.id]);

    await client.query('UPDATE invoices SET amount_paid = amount_paid + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [amount, req.params.id]);

    // Auto-update status if fully paid
    await client.query(`
      UPDATE invoices SET status = CASE WHEN amount_paid >= grand_total THEN 'paid' ELSE 'partial' END, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [req.params.id]);

    await client.query('COMMIT');
    res.status(201).json(payment.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

// Get payments for invoice
router.get('/:id/payments', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM payments WHERE invoice_id = $1 ORDER BY payment_date', [req.params.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Overdue report
router.get('/reports/overdue', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT i.*, c.name as customer_name, c.email, c.phone,
        (CURRENT_DATE - i.due_date) as days_overdue
      FROM invoices i JOIN customers c ON i.customer_id = c.id
      WHERE i.company_id = $1 AND i.status NOT IN ('paid', 'cancelled') AND i.due_date < CURRENT_DATE
      ORDER BY i.due_date ASC
    `, [req.user.company_id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
