import express from 'express';
import pool from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// ==================== PUBLIC ROUTES (No Auth) ====================

// Receipt route - publicly accessible for printing
router.get('/receipt/:orderId', async (req, res) => {
  try {
    const order = await pool.query(
      `SELECT so.*, c.name as customer_name, c.email as customer_email
       FROM sales_orders so
       LEFT JOIN customers c ON so.customer_id = c.id
       WHERE so.id = $1`,
      [req.params.orderId]
    );

    if (order.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = await pool.query(
      `SELECT soi.*, p.name as product_name, p.sku
       FROM sales_order_items soi
       JOIN products p ON soi.product_id = p.id
       WHERE soi.sales_order_id = $1`,
      [req.params.orderId]
    );

    const company = await pool.query(
      'SELECT setting_key, setting_value FROM system_settings WHERE company_id = $1',
      [order.rows[0].company_id]
    );

    const settings = {};
    company.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    const formatCurrency = (amount) => {
      const num = parseFloat(amount) || 0;
      return `${settings.currency_symbol || '$'}${num.toFixed(2)}`;
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Receipt ${order.rows[0].order_number}</title>
          <style>
              body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
              .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
              .company-name { font-size: 18px; font-weight: bold; }
              .receipt-title { font-size: 14px; margin-top: 10px; }
              .order-details { margin-bottom: 15px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { text-align: left; padding: 5px 0; }
              .text-right { text-align: right; }
              .totals { margin-top: 10px; border-top: 1px dashed #000; padding-top: 10px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; }
          </style>
      </head>
      <body>
          <div class="header">
              <div class="company-name">${settings.company_name || 'ERP System'}</div>
              <div>${settings.company_address || ''}</div>
              <div>${settings.company_phone || ''}</div>
              <div class="receipt-title">SALES RECEIPT</div>
          </div>
          
          <div class="order-details">
              <div>Order: ${order.rows[0].order_number}</div>
              <div>Date: ${new Date(order.rows[0].order_date).toLocaleDateString()}</div>
              <div>Time: ${new Date(order.rows[0].created_at).toLocaleTimeString()}</div>
              ${order.rows[0].customer_name ? `<div>Customer: ${order.rows[0].customer_name}</div>` : ''}
          </div>
          
          <table>
              <thead>
                  <tr><th>Item</th><th>Qty</th><th class="text-right">Price</th><th class="text-right">Total</th></tr>
              </thead>
              <tbody>
                  ${items.rows.map(item => `
                      <tr>
                          <td>${item.product_name}</td>
                          <td>${item.quantity}</td>
                          <td class="text-right">${formatCurrency(item.unit_price)}</td>
                          <td class="text-right">${formatCurrency(item.total)}</td>
                      </tr>
                  `).join('')}
              </tbody>
          <table>
          
          <div class="totals">
              <div>Total: ${formatCurrency(order.rows[0].grand_total)}</div>
              <div>Paid: ${formatCurrency(order.rows[0].paid_amount || order.rows[0].grand_total)}</div>
              <div>Payment: ${order.rows[0].payment_method || 'Cash'}</div>
          </div>
          
          <div class="footer">
              <div>Thank you for your purchase!</div>
              <div>${settings.company_email || ''}</div>
          </div>
          <script>window.print();</script>
      </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    console.error('Error generating receipt:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== PROTECTED ROUTES (Auth Required) ====================
router.use(auth);

// Helper: Generate session number
const generateSessionNumber = async (client, companyId) => {
  const result = await client.query(
    "SELECT COALESCE(MAX(CAST(SUBSTRING(session_number FROM '-([0-9]+)$') AS INTEGER)), 0) + 1 as next_num FROM pos_sessions WHERE company_id = $1",
    [companyId]
  );
  const nextNum = result.rows[0].next_num || 1;
  return `POS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(nextNum).padStart(4, '0')}`;
};

// Helper: Generate order number
const generateOrderNumber = async (client) => {
  const year = new Date().getFullYear();
  const result = await client.query(
    `SELECT order_number FROM sales_orders 
     WHERE order_number LIKE $1 
     ORDER BY order_number DESC LIMIT 1`,
    [`SO-${year}-%`]
  );

  if (result.rows.length > 0) {
    const lastNumber = parseInt(result.rows[0].order_number.split('-')[2]);
    const nextNumber = (lastNumber + 1).toString().padStart(5, '0');
    return `SO-${year}-${nextNumber}`;
  } else {
    return `SO-${year}-00001`;
  }
};

// ==================== SESSION ENDPOINTS ====================

// POST /api/pos/session/open
router.post('/session/open', async (req, res) => {
  const client = await pool.connect();
  try {
    console.log('Opening session for user:', req.user.id);

    const existing = await client.query(
      'SELECT id FROM pos_sessions WHERE company_id = $1 AND user_id = $2 AND status = $3',
      [req.user.company_id, req.user.id, 'open']
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'You already have an open session' });
    }

    const sessionNumber = await generateSessionNumber(client, req.user.company_id);

    const result = await client.query(
      `INSERT INTO pos_sessions (company_id, user_id, session_number, opening_time, opening_balance, status, created_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, 'open', CURRENT_TIMESTAMP)
       RETURNING *`,
      [req.user.company_id, req.user.id, sessionNumber, req.body.opening_balance || 0]
    );

    await client.query('COMMIT');
    console.log('Session created:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error opening session:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET /api/pos/session/current
router.get('/session/current', async (req, res) => {
  try {
    console.log('Getting current session for user:', req.user.id);

    const result = await pool.query(
      `SELECT s.*, u.name as cashier_name,
              COALESCE(SUM(sales.grand_total), 0) as total_sales,
              COUNT(sales.id) as transaction_count
       FROM pos_sessions s
       LEFT JOIN users u ON s.user_id = u.id
       LEFT JOIN sales_orders sales ON sales.pos_transaction = true 
          AND sales.created_at >= s.opening_time 
          AND (s.closing_time IS NULL OR sales.created_at <= s.closing_time)
       WHERE s.company_id = $1 AND s.user_id = $2 AND s.status = 'open'
       GROUP BY s.id, u.name`,
      [req.user.company_id, req.user.id]
    );

    console.log('Session query result rows:', result.rows.length);

    if (result.rows.length === 0) {
      return res.json(null);
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching current session:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/pos/session/close
router.patch('/session/close', async (req, res) => {
  const client = await pool.connect();
  try {
    const { closing_balance, cash_sales, card_sales, bank_sales, notes } = req.body;

    const result = await client.query(
      `UPDATE pos_sessions 
       SET closing_time = CURRENT_TIMESTAMP,
           closing_balance = $1,
           cash_sales = $2,
           card_sales = $3,
           bank_sales = $4,
           notes = $5,
           status = 'closed',
           updated_at = CURRENT_TIMESTAMP
       WHERE company_id = $6 AND user_id = $7 AND status = 'open'
       RETURNING *`,
      [closing_balance, cash_sales || 0, card_sales || 0, bank_sales || 0, notes, req.user.company_id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No open session found' });
    }

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error closing session:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ==================== CART ENDPOINTS ====================

// GET /api/pos/cart
router.get('/cart', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, p.name as product_name, p.sku,
              p.current_stock, p.unit_price as default_price
       FROM pos_cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.company_id = $1 AND c.user_id = $2
       ORDER BY c.created_at ASC`,
      [req.user.company_id, req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/pos/cart
router.post('/cart', async (req, res) => {
  const client = await pool.connect();
  try {
    const { product_id, quantity, unit_price, discount_percent } = req.body;

    const product = await client.query(
      'SELECT name, sku, current_stock, unit_price FROM products WHERE id = $1 AND company_id = $2',
      [product_id, req.user.company_id]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.rows[0].current_stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const price = unit_price || product.rows[0].unit_price;
    const total = quantity * price * (1 - (discount_percent || 0) / 100);

    const existing = await client.query(
      'SELECT id, quantity FROM pos_cart WHERE company_id = $1 AND user_id = $2 AND product_id = $3',
      [req.user.company_id, req.user.id, product_id]
    );

    let result;
    if (existing.rows.length > 0) {
      const newQuantity = existing.rows[0].quantity + quantity;
      const newTotal = newQuantity * price * (1 - (discount_percent || 0) / 100);
      result = await client.query(
        `UPDATE pos_cart 
         SET quantity = $1, unit_price = $2, discount_percent = $3, total = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
        [newQuantity, price, discount_percent || 0, newTotal, existing.rows[0].id]
      );
    } else {
      result = await client.query(
        `INSERT INTO pos_cart (company_id, user_id, product_id, quantity, unit_price, discount_percent, total, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
         RETURNING *`,
        [req.user.company_id, req.user.id, product_id, quantity, price, discount_percent || 0, total]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding to cart:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PUT /api/pos/cart/:id
router.put('/cart/:id', async (req, res) => {
  try {
    const { quantity, discount_percent } = req.body;

    const cartItem = await pool.query(
      'SELECT product_id, quantity, unit_price FROM pos_cart WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (cartItem.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const newTotal = (quantity || cartItem.rows[0].quantity) * cartItem.rows[0].unit_price * (1 - (discount_percent || 0) / 100);

    const result = await pool.query(
      `UPDATE pos_cart 
       SET quantity = COALESCE($1, quantity),
           discount_percent = COALESCE($2, discount_percent),
           total = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [quantity, discount_percent, newTotal, req.params.id, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating cart:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== CART DELETE ROUTES (ORDER MATTERS!) ====================

// DELETE /api/pos/cart/clear - MUST come BEFORE /cart/:id
router.delete('/cart/clear', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM pos_cart WHERE user_id = $1',
      [req.user.id]
    );
    res.json({ message: 'Cart cleared successfully' });
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/pos/cart/:id - MUST come AFTER /cart/clear
router.delete('/cart/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM pos_cart WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== SEARCH ENDPOINTS ====================

// GET /api/pos/search/product
router.get('/search/product', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const result = await pool.query(
      `SELECT id, sku, name, unit_price, current_stock
       FROM products
       WHERE company_id = $1 
         AND (sku ILIKE $2 OR name ILIKE $2)
       LIMIT 20`,
      [req.user.company_id, `%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error searching products:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== COMPLETE SALE ====================

// POST /api/pos/complete-sale
router.post('/complete-sale', async (req, res) => {
  const client = await pool.connect();
  try {
    const { customer_id, payment_method, paid_amount, notes } = req.body;

    const cartItems = await client.query(
      `SELECT c.*, p.unit_price as default_price
       FROM pos_cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1`,
      [req.user.id]
    );

    if (cartItems.rows.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const session = await client.query(
      'SELECT id FROM pos_sessions WHERE company_id = $1 AND user_id = $2 AND status = $3',
      [req.user.company_id, req.user.id, 'open']
    );

    if (session.rows.length === 0) {
      return res.status(400).json({ error: 'No open POS session' });
    }

    await client.query('BEGIN');

    let subtotal = 0;
    for (const item of cartItems.rows) {
      subtotal += parseFloat(item.total) || 0;
    }

    const order_number = await generateOrderNumber(client);

    const orderResult = await client.query(
      `INSERT INTO sales_orders (company_id, customer_id, order_number, order_date, status, subtotal, grand_total, notes, pos_transaction, payment_method, paid_amount, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, CURRENT_DATE, 'confirmed', $4, $4, $5, true, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [req.user.company_id, customer_id || null, order_number, subtotal, notes, payment_method, paid_amount || subtotal, req.user.id]
    );

    const order = orderResult.rows[0];

    for (const item of cartItems.rows) {
      const itemTotal = (item.quantity * item.unit_price) * (1 - (item.discount_percent || 0) / 100);

      await client.query(
        `INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
        [order.id, item.product_id, item.quantity, item.unit_price, item.discount_percent, itemTotal]
      );

      await client.query(
        'UPDATE products SET current_stock = current_stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [item.quantity, item.product_id]
      );

      await client.query(
        `INSERT INTO inventory_transactions (product_id, type, quantity, reference_type, reference_id, created_at)
         VALUES ($1, 'out', $2, 'sales_order', $3, CURRENT_TIMESTAMP)`,
        [item.product_id, item.quantity, order.id]
      );
    }

    await client.query('DELETE FROM pos_cart WHERE user_id = $1', [req.user.id]);

    await client.query('COMMIT');

    res.status(201).json({
      order,
      receipt_url: `/api/pos/receipt/${order.id}`
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error completing sale:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET /api/pos/today-stats
router.get('/today-stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const result = await pool.query(
      `SELECT 
          COALESCE(SUM(grand_total), 0) as total_sales,
          COUNT(*) as transaction_count,
          COALESCE(AVG(grand_total), 0) as average_ticket
       FROM sales_orders
       WHERE company_id = $1 
         AND pos_transaction = true
         AND DATE(created_at) = $2`,
      [req.user.company_id, today]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching today stats:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;