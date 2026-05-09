import express from 'express';
import pool from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

// GET all sales orders
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT so.*, c.name as customer_name 
             FROM sales_orders so
             LEFT JOIN customers c ON so.customer_id = c.id
             WHERE so.company_id = $1
             ORDER BY so.created_at DESC`,
            [req.user.company_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching sales orders:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET single sales order
router.get('/:id', async (req, res) => {
    try {
        const orderResult = await pool.query(
            `SELECT so.*, c.name as customer_name 
             FROM sales_orders so
             LEFT JOIN customers c ON so.customer_id = c.id
             WHERE so.id = $1 AND so.company_id = $2`,
            [req.params.id, req.user.company_id]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const itemsResult = await pool.query(
            `SELECT soi.*, p.name as product_name, p.sku
             FROM sales_order_items soi
             JOIN products p ON soi.product_id = p.id
             WHERE soi.sales_order_id = $1`,
            [req.params.id]
        );

        const order = orderResult.rows[0];
        order.items = itemsResult.rows;
        res.json(order);
    } catch (err) {
        console.error('Error fetching sales order:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST create sales order
router.post('/', async (req, res) => {
    const client = await pool.connect();
    try {
        const { customer_id, notes, items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'At least one item is required' });
        }

        await client.query('BEGIN');

        // Calculate totals
        let subtotal = 0;
        for (const item of items) {
            subtotal += item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100);
        }

        // Generate order number
        const orderNumberResult = await client.query(
            "SELECT 'SO-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(COALESCE(MAX(CAST(SUBSTRING(order_number FROM '-([0-9]+)$') AS INTEGER)), 0) + 1, 5, '0') as order_number FROM sales_orders"
        );
        const order_number = orderNumberResult.rows[0].order_number;

        // Check stock availability
        for (const item of items) {
            const stockResult = await client.query(
                'SELECT current_stock FROM products WHERE id = $1 AND company_id = $2',
                [item.product_id, req.user.company_id]
            );
            if (stockResult.rows.length === 0) {
                throw new Error(`Product ${item.product_id} not found`);
            }
            if (stockResult.rows[0].current_stock < item.quantity) {
                throw new Error(`Insufficient stock for product ID ${item.product_id}`);
            }
        }

        // Create sales order
        const orderResult = await client.query(
            `INSERT INTO sales_orders (company_id, customer_id, order_number, order_date, status, subtotal, grand_total, notes, created_by, created_at, updated_at)
             VALUES ($1, $2, $3, CURRENT_DATE, 'draft', $4, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING *`,
            [req.user.company_id, customer_id || null, order_number, subtotal, notes, req.user.id]
        );

        const order = orderResult.rows[0];

        // Create order items and deduct stock
        for (const item of items) {
            const total = item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100);

            await client.query(
                `INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
                [order.id, item.product_id, item.quantity, item.unit_price, item.discount_percent || 0, total]
            );

            // Deduct stock
            await client.query(
                'UPDATE products SET current_stock = current_stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [item.quantity, item.product_id]
            );

            // Log inventory transaction
            await client.query(
                `INSERT INTO inventory_transactions (product_id, type, quantity, reference_type, reference_id, created_at)
                 VALUES ($1, 'out', $2, 'sales_order', $3, CURRENT_TIMESTAMP)`,
                [item.product_id, item.quantity, order.id]
            );
        }

        await client.query('COMMIT');

        res.status(201).json(order);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating sales order:', err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// PATCH update order status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const result = await pool.query(
            `UPDATE sales_orders 
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 AND company_id = $3
             RETURNING *`,
            [status, req.params.id, req.user.company_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;