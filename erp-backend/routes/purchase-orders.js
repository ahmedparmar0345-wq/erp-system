import express from 'express';
import db from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all purchase orders
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(`
            SELECT po.*, s.name as supplier_name 
            FROM purchase_orders po
            JOIN suppliers s ON po.supplier_id = s.id
            WHERE po.company_id = $1
            ORDER BY po.id DESC
        `, [req.user.company_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get single purchase order with items
router.get('/:id', auth, async (req, res) => {
  try {
    const poResult = await db.query(`
            SELECT po.*, s.name as supplier_name 
            FROM purchase_orders po
            JOIN suppliers s ON po.supplier_id = s.id
            WHERE po.id = $1 AND po.company_id = $2
        `, [req.params.id, req.user.company_id]);

    if (poResult.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    const itemsResult = await db.query(`
            SELECT poi.*, p.name as product_name, p.sku
            FROM purchase_order_items poi
            JOIN products p ON poi.product_id = p.id
            WHERE poi.purchase_order_id = $1
        `, [req.params.id]);

    res.json({
      ...poResult.rows[0],
      items: itemsResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Create purchase order
router.post('/', auth, async (req, res) => {
  const client = await db.connect();
  try {
    const { supplier_id, items, notes } = req.body;

    if (!supplier_id || !items || items.length === 0) {
      return res.status(400).json({ error: 'supplier_id and items are required' });
    }

    await client.query('BEGIN');

    // Generate PO number
    const poNumberResult = await client.query(
      "SELECT 'PO-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(COALESCE(MAX(id) + 1, 1)::text, 5, '0') as po_number FROM purchase_orders"
    );
    const po_number = poNumberResult.rows[0].po_number;

    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.quantity * item.unit_price;
    }

    // Insert purchase order
    const poResult = await client.query(
      `INSERT INTO purchase_orders (company_id, supplier_id, po_number, order_date, subtotal, grand_total, notes, status, created_at, updated_at)
             VALUES ($1, $2, $3, CURRENT_DATE, $4, $4, $5, 'draft', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING *`,
      [req.user.company_id, supplier_id, po_number, subtotal, notes]
    );

    const purchaseOrder = poResult.rows[0];

    // Insert items
    for (const item of items) {
      await client.query(
        `INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity)
                 VALUES ($1, $2, $3, $4, $5, 0)`,
        [purchaseOrder.id, item.product_id, item.quantity, item.unit_price, item.quantity * item.unit_price]
      );
    }

    await client.query('COMMIT');

    res.status(201).json(purchaseOrder);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Receive stock (THIS IS THE KEY FIX)
router.post('/:id/receive', auth, async (req, res) => {
  const client = await db.connect();
  try {
    const poId = req.params.id;

    await client.query('BEGIN');

    // Get purchase order items not fully received
    const itemsResult = await client.query(`
            SELECT poi.*, p.current_stock 
            FROM purchase_order_items poi
            JOIN products p ON poi.product_id = p.id
            WHERE poi.purchase_order_id = $1 AND poi.received_quantity < poi.quantity
        `, [poId]);

    if (itemsResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No items to receive or already fully received' });
    }

    // Process each item
    for (const item of itemsResult.rows) {
      const receiveQty = item.quantity - item.received_quantity;

      // Update product stock
      await client.query(
        'UPDATE products SET current_stock = current_stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [receiveQty, item.product_id]
      );

      // Update purchase order item received quantity
      await client.query(
        'UPDATE purchase_order_items SET received_quantity = $1 WHERE id = $2',
        [item.quantity, item.id]
      );

      // Record inventory transaction
      await client.query(
        `INSERT INTO inventory_transactions (product_id, type, quantity, reference_type, reference_id, created_at)
                 VALUES ($1, 'in', $2, 'purchase_order', $3, CURRENT_TIMESTAMP)`,
        [item.product_id, receiveQty, poId]
      );
    }

    // Update purchase order status
    await client.query(
      `UPDATE purchase_orders 
             SET status = 'received', updated_at = CURRENT_TIMESTAMP 
             WHERE id = $1`,
      [poId]
    );

    await client.query('COMMIT');

    res.json({ message: 'Stock received successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Update status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await db.query(
      `UPDATE purchase_orders 
             SET status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 AND company_id = $3
             RETURNING *`,
      [status, req.params.id, req.user.company_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;