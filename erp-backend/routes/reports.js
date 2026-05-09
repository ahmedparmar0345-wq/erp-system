import express from 'express';
import pool from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

// ==========================================
// 1. STOCK LEDGER REPORT
// ==========================================

router.get('/stock-ledger', async (req, res) => {
  const { start_date, end_date, product_id } = req.query;

  if (!start_date || !end_date) {
    return res.status(400).json({ error: 'start_date and end_date are required' });
  }

  try {
    const client = await pool.connect();

    let productFilter = '';
    const params = [req.user.company_id, start_date, end_date];
    if (product_id) {
      productFilter = ' AND p.id = $4';
      params.push(product_id);
    }

    const query = `
      SELECT
        p.id AS product_id,
        p.name AS product_name,
        p.sku,
        p.unit_price,
        COALESCE(SUM(CASE WHEN it.created_at < $2 THEN
          CASE WHEN it.type = 'in' THEN it.quantity
               WHEN it.type = 'out' THEN -it.quantity
          ELSE 0 END
        ELSE 0 END), 0) AS opening_stock,
        COALESCE(SUM(CASE WHEN it.created_at BETWEEN $2 AND $3 AND it.type = 'in' AND it.reference_type = 'purchase_order' THEN it.quantity ELSE 0 END), 0) AS purchases,
        COALESCE(SUM(CASE WHEN it.created_at BETWEEN $2 AND $3 AND it.type = 'out' AND it.reference_type = 'sales_order' THEN it.quantity ELSE 0 END), 0) AS sales,
        COALESCE(SUM(CASE WHEN it.created_at BETWEEN $2 AND $3 AND it.type = 'out' AND it.reference_type = 'purchase_return' THEN it.quantity ELSE 0 END), 0) AS purchase_returns,
        COALESCE(SUM(CASE WHEN it.created_at BETWEEN $2 AND $3 AND it.type = 'in' AND it.reference_type = 'sales_return' THEN it.quantity ELSE 0 END), 0) AS sales_returns,
        COALESCE(SUM(CASE WHEN it.created_at BETWEEN $2 AND $3 AND it.reference_type = 'api_adjustment' THEN
          CASE WHEN it.type = 'in' THEN it.quantity
               WHEN it.type = 'out' THEN -it.quantity
          ELSE 0 END
        ELSE 0 END), 0) AS adjustments
      FROM products p
      LEFT JOIN inventory_transactions it ON p.id = it.product_id
      WHERE p.company_id = $1${productFilter}
      GROUP BY p.id, p.name, p.sku, p.unit_price
      ORDER BY p.name
    `;

    const result = await client.query(query, params);
    client.release();

    const ledger = result.rows.map(r => {
      const opening = parseFloat(r.opening_stock);
      const purchases = parseFloat(r.purchases);
      const sales = parseFloat(r.sales);
      const purchaseReturns = parseFloat(r.purchase_returns);
      const salesReturns = parseFloat(r.sales_returns);
      const adjustments = parseFloat(r.adjustments);
      const closing = opening + purchases - sales - purchaseReturns + salesReturns + adjustments;
      return {
        product_id: r.product_id,
        product_name: r.product_name,
        sku: r.sku,
        unit_price: parseFloat(r.unit_price),
        opening_stock: opening,
        purchases,
        sales,
        purchase_returns: purchaseReturns,
        sales_returns: salesReturns,
        closing_stock: closing,
        total_value: closing * parseFloat(r.unit_price)
      };
    });

    res.json(ledger);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// 2. STOCK VALUE REPORT
// ==========================================

router.get('/stock-value', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         COUNT(*) as total_products,
         SUM(stock_quantity) as total_units,
         SUM(stock_quantity * price) as total_value
       FROM products 
       WHERE company_id = $1 AND is_active = true`,
      [req.user.company_id]
    );

    // Also return value by category
    const byCategory = await pool.query(
      `SELECT category, 
              COUNT(*) as products, 
              SUM(stock_quantity) as units,
              SUM(stock_quantity * price) as value
       FROM products 
       WHERE company_id = $1 AND is_active = true
       GROUP BY category
       ORDER BY value DESC`,
      [req.user.company_id]
    );

    res.json({
      summary: result.rows[0],
      by_category: byCategory.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// 3. LOW STOCK REPORT
// ==========================================

router.get('/low-stock', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, product_name, sku, stock_quantity, reorder_level, price, 
              (reorder_level - stock_quantity) as deficit
       FROM products 
       WHERE company_id = $1 AND stock_quantity <= reorder_level AND is_active = true
       ORDER BY stock_quantity ASC`,
      [req.user.company_id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// 4. STOCK MOVEMENT REPORT
// ==========================================

router.get('/stock-movement', async (req, res) => {
  const { start_date, end_date, product_id } = req.query;

  try {
    const client = await pool.connect();

    // Get opening balance before start_date
    let openingQuery = `
      SELECT COALESCE(SUM(
        CASE WHEN it.type IN ('in', 'adjustment') THEN it.quantity
             WHEN it.type = 'out' THEN -it.quantity
             ELSE 0 END
      ), 0) as opening_balance
      FROM inventory_transactions it
      JOIN products p ON it.product_id = p.id
      WHERE p.company_id = $1`;
    const params = [req.user.company_id];
    let paramIdx = 2;

    if (product_id) {
      openingQuery += ` AND it.product_id = $${paramIdx++}`;
      params.push(product_id);
    }

    if (start_date) {
      openingQuery += ` AND it.created_at < $${paramIdx++}`;
      params.push(start_date);
    }

    const openingRes = await client.query(openingQuery, params);
    const openingBalance = parseFloat(openingRes.rows[0].opening_balance);

    // Get transactions within range
    let transQuery = `
      SELECT it.id, it.type, it.quantity, it.reference_type, it.reference_id, 
             it.created_at, p.name AS product_name, p.sku
      FROM inventory_transactions it
      JOIN products p ON it.product_id = p.id
      WHERE p.company_id = $1`;
    
    const transParams = [req.user.company_id];
    let tIdx = 2;

    if (product_id) {
      transQuery += ` AND it.product_id = $${tIdx++}`;
      transParams.push(product_id);
    }

    if (start_date) {
      transQuery += ` AND it.created_at >= $${tIdx++}`;
      transParams.push(start_date);
    }

    if (end_date) {
      transQuery += ` AND it.created_at <= $${tIdx++}`;
      transParams.push(end_date);
    }

    transQuery += ' ORDER BY it.created_at ASC';

    const transactions = await client.query(transQuery, transParams);
    client.release();

    // Calculate running balance
    let runningBalance = openingBalance;
    const movements = transactions.rows.map(t => {
      const qty = parseFloat(t.quantity);
      if (t.type === 'in' || t.type === 'adjustment') {
        runningBalance += qty;
      } else {
        runningBalance -= qty;
      }

      return {
        id: t.id,
        date: t.created_at,
        product_name: t.product_name,
        sku: t.sku,
        type: t.type,
        quantity: qty,
        reference: t.reference_type ? `${t.reference_type} #${t.reference_id}` : '-',
        balance: runningBalance
      };
    });

    res.json({
      opening_balance: openingBalance,
      closing_balance: runningBalance,
      movements
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
