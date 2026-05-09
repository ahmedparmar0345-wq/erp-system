import express from 'express';
import pool from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

// Helper: Generate return number
const generateReturnNumber = async (client, prefix) => {
  const result = await client.query(
    "SELECT COALESCE(MAX(CAST(SUBSTRING(return_number FROM '-([0-9]+)$') AS INTEGER)), 0) + 1 as next_num FROM sales_returns WHERE company_id = $1",
    [client._connected ? client._connected : 1]
  );
  const nextNum = result.rows[0].next_num || 1;
  return `${prefix}-${new Date().getFullYear()}-${String(nextNum).padStart(5, '0')}`;
};

// GET /api/returns/reasons
router.get('/reasons', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM return_reasons WHERE company_id = $1 AND is_active = true ORDER BY reason_name',
      [req.user.company_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching return reasons:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/returns/sales
router.get('/sales', async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT sr.*, c.name as customer_name
            FROM sales_returns sr
            JOIN customers c ON sr.customer_id = c.id
            WHERE sr.company_id = $1
            ORDER BY sr.created_at DESC
        `, [req.user.company_id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching sales returns:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/returns/sales/:id
router.get('/sales/:id', async (req, res) => {
  try {
    const returnResult = await pool.query(`
            SELECT sr.*, c.name as customer_name
            FROM sales_returns sr
            JOIN customers c ON sr.customer_id = c.id
            WHERE sr.id = $1 AND sr.company_id = $2
        `, [req.params.id, req.user.company_id]);

    if (returnResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sales return not found' });
    }

    const itemsResult = await pool.query(`
            SELECT sri.*, p.name as product_name, p.sku, rr.reason_name
            FROM sales_return_items sri
            JOIN products p ON sri.product_id = p.id
            LEFT JOIN return_reasons rr ON sri.return_reason_id = rr.id
            WHERE sri.sales_return_id = $1
        `, [req.params.id]);

    const salesReturn = returnResult.rows[0];
    salesReturn.items = itemsResult.rows;
    res.json(salesReturn);
  } catch (err) {
    console.error('Error fetching sales return details:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/returns/sales
router.post('/sales', async (req, res) => {
  const client = await pool.connect();
  try {
    const { original_sales_order_id, customer_id, return_date, restock_inventory, notes, items } = req.body;

    if (!original_sales_order_id || !customer_id || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await client.query('BEGIN');

    // Generate return number
    const returnNumber = `RMA-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Calculate total
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.quantity * item.unit_price;
    }

    // Insert sales return
    const returnResult = await client.query(
      `INSERT INTO sales_returns (company_id, return_number, original_sales_order_id, customer_id, return_date, total_amount, restock_inventory, notes, created_by, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING *`,
      [req.user.company_id, returnNumber, original_sales_order_id, customer_id, return_date || new Date(), totalAmount, restock_inventory !== false, notes, req.user.id]
    );

    const salesReturn = returnResult.rows[0];

    // Insert items and restore stock
    for (const item of items) {
      await client.query(
        `INSERT INTO sales_return_items (sales_return_id, product_id, quantity, unit_price, total, return_reason_id, reason_text)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [salesReturn.id, item.product_id, item.quantity, item.unit_price, item.quantity * item.unit_price, item.return_reason_id || null, item.reason_text]
      );

      // Restore stock if requested
      if (restock_inventory !== false) {
        await client.query(
          'UPDATE products SET current_stock = current_stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [item.quantity, item.product_id]
        );

        // Log inventory transaction
        await client.query(
          `INSERT INTO inventory_transactions (product_id, type, quantity, reference_type, reference_id, created_at)
                     VALUES ($1, 'in', $2, 'sales_return', $3, CURRENT_TIMESTAMP)`,
          [item.product_id, item.quantity, salesReturn.id]
        );
      }
    }

    await client.query('COMMIT');

    res.status(201).json(salesReturn);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating sales return:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PATCH /api/returns/sales/:id/approve
router.patch('/sales/:id/approve', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE sales_returns 
             SET status = 'approved', updated_at = CURRENT_TIMESTAMP 
             WHERE id = $1 AND company_id = $2 AND status = 'pending'
             RETURNING *`,
      [req.params.id, req.user.company_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sales return not found or already approved' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error approving sales return:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/returns/purchase
router.get('/purchase', async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT pr.*, s.name as supplier_name
            FROM purchase_returns pr
            JOIN suppliers s ON pr.supplier_id = s.id
            WHERE pr.company_id = $1
            ORDER BY pr.created_at DESC
        `, [req.user.company_id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching purchase returns:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/returns/purchase
router.post('/purchase', async (req, res) => {
  const client = await pool.connect();
  try {
    const { original_purchase_order_id, supplier_id, return_date, notes, items } = req.body;

    if (!original_purchase_order_id || !supplier_id || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await client.query('BEGIN');

    // Generate return number
    const returnNumber = `PR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Calculate total
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.quantity * item.unit_price;
    }

    // Insert purchase return
    const returnResult = await client.query(
      `INSERT INTO purchase_returns (company_id, return_number, original_purchase_order_id, supplier_id, return_date, total_amount, notes, created_by, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING *`,
      [req.user.company_id, returnNumber, original_purchase_order_id, supplier_id, return_date || new Date(), totalAmount, notes, req.user.id]
    );

    const purchaseReturn = returnResult.rows[0];

    // Insert items and reduce stock
    for (const item of items) {
      await client.query(
        `INSERT INTO purchase_return_items (purchase_return_id, product_id, quantity, unit_price, total, return_reason_id, reason_text)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [purchaseReturn.id, item.product_id, item.quantity, item.unit_price, item.quantity * item.unit_price, item.return_reason_id || null, item.reason_text]
      );

      // Reduce stock
      await client.query(
        'UPDATE products SET current_stock = current_stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [item.quantity, item.product_id]
      );

      // Log inventory transaction
      await client.query(
        `INSERT INTO inventory_transactions (product_id, type, quantity, reference_type, reference_id, created_at)
                 VALUES ($1, 'out', $2, 'purchase_return', $3, CURRENT_TIMESTAMP)`,
        [item.product_id, item.quantity, purchaseReturn.id]
      );
    }

    await client.query('COMMIT');

    res.status(201).json(purchaseReturn);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating purchase return:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

export default router;