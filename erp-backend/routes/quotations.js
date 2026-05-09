import express from 'express';
import pool from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT q.*, c.name as customer_name
       FROM quotations q
       LEFT JOIN customers c ON q.customer_id = c.id
       WHERE q.company_id = $1
       ORDER BY q.created_at DESC`,
      [req.user.company_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching quotations:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const quoteResult = await pool.query(
      `SELECT q.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
              c.billing_address, c.shipping_address
       FROM quotations q
       LEFT JOIN customers c ON q.customer_id = c.id
       WHERE q.id = $1 AND q.company_id = $2`,
      [req.params.id, req.user.company_id]
    );

    if (quoteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    const itemsResult = await pool.query(
      `SELECT qi.*, p.name as product_name, p.sku
       FROM quotation_items qi
       JOIN products p ON qi.product_id = p.id
       WHERE qi.quotation_id = $1`,
      [req.params.id]
    );

    const quote = quoteResult.rows[0];
    quote.items = itemsResult.rows;
    res.json(quote);
  } catch (err) {
    console.error('Error fetching quotation:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { customer_id, quote_date, expiry_date, notes, terms_conditions, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required' });
    }

    await client.query('BEGIN');

    let subtotal = 0;
    let tax_total = 0;
    let discount_total = 0;

    for (const item of items) {
      const itemTotal = item.quantity * item.unit_price;
      const itemDiscount = itemTotal * ((item.discount_percent || 0) / 100);
      const itemTax = (itemTotal - itemDiscount) * ((item.tax_percent || 0) / 100);
      subtotal += itemTotal;
      discount_total += itemDiscount;
      tax_total += itemTax;
    }

    const grand_total = subtotal - discount_total + tax_total;

    const quoteNumberResult = await client.query(
      `SELECT 'QTN-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD((COALESCE(MAX(CAST(SUBSTRING(quote_number FROM '-([0-9]+)$') AS INTEGER)), 0) + 1)::TEXT, 5, '0') as quote_number FROM quotations`
    );
    const quote_number = quoteNumberResult.rows[0].quote_number;

    const quoteResult = await client.query(
      `INSERT INTO quotations (company_id, customer_id, quote_number, quote_date, expiry_date, status, subtotal, tax_total, discount_total, grand_total, notes, terms_conditions, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'draft', $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [req.user.company_id, customer_id || null, quote_number, quote_date || new Date(), expiry_date, subtotal, tax_total, discount_total, grand_total, notes, terms_conditions, req.user.id]
    );

    const quote = quoteResult.rows[0];

    for (const item of items) {
      const itemTotal = item.quantity * item.unit_price;
      const itemDiscount = itemTotal * ((item.discount_percent || 0) / 100);
      const total = itemTotal - itemDiscount;

      await client.query(
        `INSERT INTO quotation_items (quotation_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
        [quote.id, item.product_id, item.description, item.quantity, item.unit_price, item.discount_percent || 0, item.tax_percent || 0, total]
      );
    }

    await client.query('COMMIT');

    const fullQuote = await pool.query(
      `SELECT q.*, c.name as customer_name
       FROM quotations q
       LEFT JOIN customers c ON q.customer_id = c.id
       WHERE q.id = $1`,
      [quote.id]
    );

    res.status(201).json(fullQuote.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating quotation:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { customer_id, quote_date, expiry_date, notes, terms_conditions, items } = req.body;

    const existing = await client.query(
      'SELECT status FROM quotations WHERE id = $1 AND company_id = $2',
      [req.params.id, req.user.company_id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    if (existing.rows[0].status !== 'draft') {
      return res.status(400).json({ error: 'Only draft quotations can be edited' });
    }

    await client.query('BEGIN');

    let subtotal = 0;
    let tax_total = 0;
    let discount_total = 0;

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
      `UPDATE quotations SET customer_id = $1, quote_date = $2, expiry_date = $3,
       notes = $4, terms_conditions = $5, subtotal = $6, tax_total = $7,
       discount_total = $8, grand_total = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 AND company_id = $11`,
      [customer_id || null, quote_date, expiry_date, notes, terms_conditions, subtotal, tax_total, discount_total, grand_total, req.params.id, req.user.company_id]
    );

    if (items && items.length > 0) {
      await client.query('DELETE FROM quotation_items WHERE quotation_id = $1', [req.params.id]);

      for (const item of items) {
        const itemTotal = item.quantity * item.unit_price;
        const itemDiscount = itemTotal * ((item.discount_percent || 0) / 100);
        const total = itemTotal - itemDiscount;

        await client.query(
          `INSERT INTO quotation_items (quotation_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
          [req.params.id, item.product_id, item.description, item.quantity, item.unit_price, item.discount_percent || 0, item.tax_percent || 0, total]
        );
      }
    }

    await client.query('COMMIT');

    const result = await pool.query(
      `SELECT q.*, c.name as customer_name
       FROM quotations q
       LEFT JOIN customers c ON q.customer_id = c.id
       WHERE q.id = $1`,
      [req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating quotation:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'expired'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const result = await pool.query(
      `UPDATE quotations SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND company_id = $3
       RETURNING *`,
      [status, req.params.id, req.user.company_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating quotation status:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM quotations WHERE id = $1 AND company_id = $2 RETURNING id',
      [req.params.id, req.user.company_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    res.json({ message: 'Quotation deleted successfully' });
  } catch (err) {
    console.error('Error deleting quotation:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/convert', async (req, res) => {
  const client = await pool.connect();
  try {
    const quoteResult = await client.query(
      `SELECT q.*, c.name as customer_name
       FROM quotations q
       LEFT JOIN customers c ON q.customer_id = c.id
       WHERE q.id = $1 AND q.company_id = $2`,
      [req.params.id, req.user.company_id]
    );

    if (quoteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    const quote = quoteResult.rows[0];

    if (quote.converted_to_order_id) {
      return res.status(400).json({ error: 'Quotation has already been converted to a sales order' });
    }

    if (quote.status === 'rejected' || quote.status === 'expired') {
      return res.status(400).json({ error: `Cannot convert a ${quote.status} quotation` });
    }

    await client.query('BEGIN');

    const orderNumberResult = await client.query(
      `SELECT 'SO-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(COALESCE(MAX(CAST(SUBSTRING(order_number FROM '-([0-9]+)$') AS INTEGER)), 0) + 1, 5, '0') as order_number FROM sales_orders`
    );
    const order_number = orderNumberResult.rows[0].order_number;

    const itemsResult = await client.query(
      'SELECT * FROM quotation_items WHERE quotation_id = $1',
      [req.params.id]
    );

    for (const item of itemsResult.rows) {
      const stockResult = await client.query(
        'SELECT current_stock FROM products WHERE id = $1 AND company_id = $2',
        [item.product_id, req.user.company_id]
      );
      if (stockResult.rows.length === 0) {
        throw new Error(`Product ID ${item.product_id} not found`);
      }
    }

    const orderResult = await client.query(
      `INSERT INTO sales_orders (company_id, customer_id, order_number, order_date, status, subtotal, tax_total, grand_total, notes, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, CURRENT_DATE, 'draft', $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [req.user.company_id, quote.customer_id, order_number, quote.subtotal, quote.tax_total, quote.grand_total, quote.notes, req.user.id]
    );

    const order = orderResult.rows[0];

    for (const item of itemsResult.rows) {
      await client.query(
        `INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
        [order.id, item.product_id, item.quantity, item.unit_price, item.discount_percent, item.total]
      );
    }

    await client.query(
      `UPDATE quotations SET status = 'accepted', converted_to_order_id = $1, converted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [order.id, req.params.id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Quotation converted to sales order successfully',
      sales_order: order,
      quotation_id: parseInt(req.params.id)
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error converting quotation:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

export default router;
