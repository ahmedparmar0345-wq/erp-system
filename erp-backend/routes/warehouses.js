import express from 'express';
import db from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

// ============================
// WAREHOUSES CRUD
// ============================
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT w.*, COUNT(pws.id) as products_count,
             COALESCE(SUM(pws.quantity), 0) as total_stock,
             u.name as manager_name
      FROM warehouses w
      LEFT JOIN product_warehouse_stock pws ON w.id = pws.warehouse_id
      LEFT JOIN users u ON w.manager_id = u.id
      WHERE w.company_id = $1
      GROUP BY w.id, u.name
      ORDER BY w.is_default DESC, w.name
    `, [req.user.company_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT w.*, u.name as manager_name
      FROM warehouses w
      LEFT JOIN users u ON w.manager_id = u.id
      WHERE w.id = $1 AND w.company_id = $2
    `, [req.params.id, req.user.company_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Warehouse not found' });

    const bins = await db.query('SELECT * FROM warehouse_bins WHERE warehouse_id = $1 AND is_active = true ORDER BY code', [req.params.id]);
    const stock = await db.query(`
      SELECT pws.*, p.name as product_name, p.sku, p.unit_price
      FROM product_warehouse_stock pws
      JOIN products p ON pws.product_id = p.id
      WHERE pws.warehouse_id = $1
      ORDER BY p.name
    `, [req.params.id]);

    res.json({ ...result.rows[0], bins: bins.rows, stock: stock.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { code, name, address, city, state, country, postal_code, phone, email, manager_id, is_default } = req.body;
    if (!code || !name) return res.status(400).json({ error: 'Code and name are required' });

    if (is_default) {
      await db.query('UPDATE warehouses SET is_default = false WHERE company_id = $1', [req.user.company_id]);
    }

    const result = await db.query(`
      INSERT INTO warehouses (company_id, code, name, address, city, state, country, postal_code, phone, email, manager_id, is_default, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, COALESCE($12, false), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [req.user.company_id, code, name, address, city, state, country, postal_code, phone, email, manager_id, is_default]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Warehouse code already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const fields = ['code', 'name', 'address', 'city', 'state', 'country', 'postal_code', 'phone', 'email', 'manager_id', 'is_active'];
    const updates = [];
    const values = [];
    let idx = 1;
    values.push(req.params.id, req.user.company_id);
    idx = 3;

    if (req.body.is_default) {
      await db.query('UPDATE warehouses SET is_default = false WHERE company_id = $1', [req.user.company_id]);
    }

    for (const f of fields) {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = $${idx++}`);
        values.push(req.body[f]);
      }
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    updates.push('updated_at = CURRENT_TIMESTAMP');
    const result = await db.query(`UPDATE warehouses SET ${updates.join(', ')} WHERE id = $1 AND company_id = $2 RETURNING *`, values);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Warehouse not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const check = await db.query('SELECT is_default FROM warehouses WHERE id = $1 AND company_id = $2', [req.params.id, req.user.company_id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Warehouse not found' });
    if (check.rows[0].is_default) return res.status(400).json({ error: 'Cannot delete default warehouse' });

    await db.query('DELETE FROM warehouses WHERE id = $1 AND company_id = $2', [req.params.id, req.user.company_id]);
    res.json({ message: 'Warehouse deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================
// WAREHOUSE BINS
// ============================
router.get('/:id/bins', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM warehouse_bins WHERE warehouse_id = $1 AND company_id = $2 AND is_active = true ORDER BY code', [req.params.id, req.user.company_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/bins', async (req, res) => {
  try {
    const { code, name, zone, aisle, rack, shelf, max_capacity } = req.body;
    if (!code) return res.status(400).json({ error: 'Bin code is required' });
    const result = await db.query(`
      INSERT INTO warehouse_bins (company_id, warehouse_id, code, name, zone, aisle, rack, shelf, max_capacity)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    `, [req.user.company_id, req.params.id, code, name, zone, aisle, rack, shelf, max_capacity]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Bin code already exists in this warehouse' });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/bins/:binId', async (req, res) => {
  try {
    await db.query('DELETE FROM warehouse_bins WHERE id = $1 AND company_id = $2', [req.params.binId, req.user.company_id]);
    res.json({ message: 'Bin deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================
// PRODUCT WAREHOUSE STOCK
// ============================
router.get('/stock/:warehouseId', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT pws.*, p.name as product_name, p.sku, p.unit_price, p.cost_price, wb.code as bin_code
      FROM product_warehouse_stock pws
      JOIN products p ON pws.product_id = p.id
      LEFT JOIN warehouse_bins wb ON pws.bin_id = wb.id
      WHERE pws.warehouse_id = $1 AND pws.company_id = $2
      ORDER BY p.name
    `, [req.params.warehouseId, req.user.company_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/stock', async (req, res) => {
  try {
    const { product_id, warehouse_id, bin_id, quantity, reorder_level } = req.body;
    if (!product_id || !warehouse_id) return res.status(400).json({ error: 'Product and warehouse are required' });

    const existing = await db.query('SELECT * FROM product_warehouse_stock WHERE product_id = $1 AND warehouse_id = $2', [product_id, warehouse_id]);

    let result;
    if (existing.rows.length > 0) {
      result = await db.query(`
        UPDATE product_warehouse_stock SET quantity = quantity + $1, bin_id = COALESCE($2, bin_id), reorder_level = COALESCE($3, reorder_level), updated_at = CURRENT_TIMESTAMP
        WHERE product_id = $4 AND warehouse_id = $5 RETURNING *
      `, [quantity || 0, bin_id, reorder_level, product_id, warehouse_id]);
    } else {
      result = await db.query(`
        INSERT INTO product_warehouse_stock (company_id, product_id, warehouse_id, bin_id, quantity, reorder_level)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
      `, [req.user.company_id, product_id, warehouse_id, bin_id, quantity || 0, reorder_level || 0]);
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/stock/:id', async (req, res) => {
  try {
    const { quantity, bin_id, reorder_level } = req.body;
    const result = await db.query(`
      UPDATE product_warehouse_stock SET quantity = $1, bin_id = COALESCE($2, bin_id), reorder_level = COALESCE($3, reorder_level), updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND company_id = $5 RETURNING *
    `, [quantity, bin_id, reorder_level, req.params.id, req.user.company_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Stock record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================
// STOCK TRANSFERS
// ============================
router.get('/transfers', async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT st.*, fw.name as from_warehouse_name, tw.name as to_warehouse_name,
             cb.name as created_by_name, ab.name as approved_by_name
      FROM stock_transfers st
      JOIN warehouses fw ON st.from_warehouse_id = fw.id
      JOIN warehouses tw ON st.to_warehouse_id = tw.id
      LEFT JOIN users cb ON st.created_by = cb.id
      LEFT JOIN users ab ON st.approved_by = ab.id
      WHERE st.company_id = $1
    `;
    const params = [req.user.company_id];
    if (status) { query += ` AND st.status = $2`; params.push(status); }
    query += ' ORDER BY st.created_at DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/transfers/:id', async (req, res) => {
  try {
    const transferResult = await db.query(`
      SELECT st.*, fw.name as from_warehouse_name, tw.name as to_warehouse_name,
             cb.name as created_by_name, ab.name as approved_by_name
      FROM stock_transfers st
      JOIN warehouses fw ON st.from_warehouse_id = fw.id
      JOIN warehouses tw ON st.to_warehouse_id = tw.id
      LEFT JOIN users cb ON st.created_by = cb.id
      LEFT JOIN users ab ON st.approved_by = ab.id
      WHERE st.id = $1 AND st.company_id = $2
    `, [req.params.id, req.user.company_id]);
    if (transferResult.rows.length === 0) return res.status(404).json({ error: 'Transfer not found' });

    const items = await db.query(`
      SELECT sti.*, p.name as product_name, p.sku
      FROM stock_transfer_items sti
      JOIN products p ON sti.product_id = p.id
      WHERE sti.stock_transfer_id = $1
    `, [req.params.id]);

    res.json({ ...transferResult.rows[0], items: items.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/transfers', async (req, res) => {
  const client = await db.connect();
  try {
    const { from_warehouse_id, to_warehouse_id, transfer_date, notes, items } = req.body;
    if (!from_warehouse_id || !to_warehouse_id || !items || items.length === 0) {
      return res.status(400).json({ error: 'from_warehouse_id, to_warehouse_id, and items are required' });
    }
    if (from_warehouse_id === to_warehouse_id) {
      return res.status(400).json({ error: 'Source and destination warehouses must be different' });
    }

    await client.query('BEGIN');

    const transferNumber = `TRF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;

    const transferResult = await client.query(`
      INSERT INTO stock_transfers (company_id, transfer_number, from_warehouse_id, to_warehouse_id, transfer_date, notes, created_by, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *
    `, [req.user.company_id, transferNumber, from_warehouse_id, to_warehouse_id, transfer_date || new Date(), notes, req.user.id]);

    const transferId = transferResult.rows[0].id;

    for (const item of items) {
      await client.query(`
        INSERT INTO stock_transfer_items (stock_transfer_id, product_id, quantity, unit_cost)
        VALUES ($1, $2, $3, $4)
      `, [transferId, item.product_id, item.quantity, item.unit_cost || 0]);
    }

    await client.query('COMMIT');
    res.status(201).json(transferResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.patch('/transfers/:id/approve', async (req, res) => {
  try {
    const result = await db.query(`
      UPDATE stock_transfers SET status = 'approved', approved_by = $1, approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND company_id = $3 AND status = 'draft' RETURNING *
    `, [req.user.id, req.params.id, req.user.company_id]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'Transfer not found or cannot be approved' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/transfers/:id/complete', async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const transferResult = await client.query(`
      SELECT * FROM stock_transfers WHERE id = $1 AND company_id = $2 AND status = 'approved'
    `, [req.params.id, req.user.company_id]);
    if (transferResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Transfer not found or not approved' });
    }

    const transfer = transferResult.rows[0];
    const items = await client.query('SELECT * FROM stock_transfer_items WHERE stock_transfer_id = $1', [req.params.id]);

    for (const item of items.rows) {
      // Deduct from source
      await client.query(`
        INSERT INTO product_warehouse_stock (company_id, product_id, warehouse_id, quantity)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (product_id, warehouse_id) DO UPDATE SET quantity = product_warehouse_stock.quantity - $4, updated_at = CURRENT_TIMESTAMP
      `, [req.user.company_id, item.product_id, transfer.from_warehouse_id, item.quantity]);

      // Add to destination
      await client.query(`
        INSERT INTO product_warehouse_stock (company_id, product_id, warehouse_id, quantity)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (product_id, warehouse_id) DO UPDATE SET quantity = product_warehouse_stock.quantity + $4, updated_at = CURRENT_TIMESTAMP
      `, [req.user.company_id, item.product_id, transfer.to_warehouse_id, item.quantity]);

      // Log inventory transactions
      await client.query(`
        INSERT INTO inventory_transactions (product_id, type, quantity, reference_type, reference_id, notes, created_at)
        VALUES ($1, 'out', $2, 'stock_transfer', $3, $4, CURRENT_TIMESTAMP)
      `, [item.product_id, item.quantity, req.params.id, `Transfer out to ${transfer.to_warehouse_id}`]);

      await client.query(`
        INSERT INTO inventory_transactions (product_id, type, quantity, reference_type, reference_id, notes, created_at)
        VALUES ($1, 'in', $2, 'stock_transfer', $3, $4, CURRENT_TIMESTAMP)
      `, [item.product_id, item.quantity, req.params.id, `Transfer in from ${transfer.from_warehouse_id}`]);
    }

    await client.query(`
      UPDATE stock_transfers SET status = 'completed', received_by = $1, received_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [req.user.id, req.params.id]);

    await client.query('COMMIT');
    res.json({ message: 'Transfer completed successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.delete('/transfers/:id', async (req, res) => {
  try {
    const result = await db.query("DELETE FROM stock_transfers WHERE id = $1 AND company_id = $2 AND status = 'draft' RETURNING id", [req.params.id, req.user.company_id]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'Transfer not found or cannot be deleted' });
    res.json({ message: 'Transfer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
