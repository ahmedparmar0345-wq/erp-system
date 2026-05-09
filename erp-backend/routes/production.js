import express from 'express';
import db from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

// ==========================================
// BOM ENDPOINTS
// ==========================================

router.get('/boms', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT b.*, p.product_name, p.sku, p.price as selling_price,
             COUNT(bi.id) as items_count
      FROM boms b
      LEFT JOIN products p ON b.product_id = p.id
      LEFT JOIN bom_items bi ON b.id = bi.bom_id
      WHERE b.company_id = $1
      GROUP BY b.id, p.id
      ORDER BY b.created_at DESC
    `, [req.user.company_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/boms/:id', async (req, res) => {
  try {
    const bomResult = await db.query(`
      SELECT b.*, p.product_name, p.sku
      FROM boms b
      LEFT JOIN products p ON b.product_id = p.id
      WHERE b.id = $1 AND b.company_id = $2
    `, [req.params.id, req.user.company_id]);

    if (bomResult.rows.length === 0) {
      return res.status(404).json({ error: 'BOM not found' });
    }

    const itemsResult = await db.query(`
      SELECT bi.*, p.product_name, p.sku, p.current_stock, p.cost_price
      FROM bom_items bi
      LEFT JOIN products p ON bi.raw_material_id = p.id
      WHERE bi.bom_id = $1
    `, [req.params.id]);

    res.json({ ...bomResult.rows[0], items: itemsResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/boms', async (req, res) => {
  const client = await db.connect();
  try {
    const { name, product_id, version, notes, items } = req.body;

    if (!name || !product_id || !items || items.length === 0) {
      return res.status(400).json({ error: 'name, product_id, and items are required' });
    }

    await client.query('BEGIN');

    const bomResult = await client.query(`
      INSERT INTO boms (company_id, product_id, name, version, notes, created_by, created_at, updated_at)
      VALUES ($1, $2, $3, COALESCE($4, '1.0'), $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [req.user.company_id, product_id, name, version, notes, req.user.id]);

    const bom = bomResult.rows[0];

    for (const item of items) {
      await client.query(`
        INSERT INTO bom_items (bom_id, raw_material_id, quantity, unit_cost, wastage_percent)
        VALUES ($1, $2, $3, $4, COALESCE($5, 0))
      `, [bom.id, item.raw_material_id, item.quantity, item.unit_cost, item.wastage_percent]);
    }

    await client.query('COMMIT');
    res.status(201).json(bom);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.put('/boms/:id', async (req, res) => {
  const client = await db.connect();
  try {
    const { name, product_id, version, notes, items } = req.body;

    await client.query('BEGIN');

    const result = await client.query(`
      UPDATE boms
      SET name = COALESCE($1, name),
          product_id = COALESCE($2, product_id),
          version = COALESCE($3, version),
          notes = COALESCE($4, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND company_id = $6
      RETURNING *
    `, [name, product_id, version, notes, req.params.id, req.user.company_id]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'BOM not found' });
    }

    if (items && Array.isArray(items)) {
      await client.query('DELETE FROM bom_items WHERE bom_id = $1', [req.params.id]);

      for (const item of items) {
        await client.query(`
          INSERT INTO bom_items (bom_id, raw_material_id, quantity, unit_cost, wastage_percent)
          VALUES ($1, $2, $3, $4, COALESCE($5, 0))
        `, [req.params.id, item.raw_material_id, item.quantity, item.unit_cost, item.wastage_percent]);
      }
    }

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.delete('/boms/:id', async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM boms WHERE id = $1 AND company_id = $2 RETURNING id',
      [req.params.id, req.user.company_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'BOM not found' });
    }

    res.json({ message: 'BOM deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// WORK ORDER ENDPOINTS
// ==========================================

router.get('/work-orders', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT wo.*, b.name as bom_name, p.product_name, p.sku
      FROM work_orders wo
      LEFT JOIN boms b ON wo.bom_id = b.id
      LEFT JOIN products p ON wo.product_id = p.id
      WHERE wo.company_id = $1
      ORDER BY wo.created_at DESC
    `, [req.user.company_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/work-orders/:id', async (req, res) => {
  try {
    const woResult = await db.query(`
      SELECT wo.*, b.name as bom_name, p.product_name, p.sku
      FROM work_orders wo
      LEFT JOIN boms b ON wo.bom_id = b.id
      LEFT JOIN products p ON wo.product_id = p.id
      WHERE wo.id = $1 AND wo.company_id = $2
    `, [req.params.id, req.user.company_id]);

    if (woResult.rows.length === 0) {
      return res.status(404).json({ error: 'Work order not found' });
    }

    const materialsResult = await db.query(`
      SELECT wom.*, p.product_name, p.sku, p.current_stock
      FROM work_order_materials wom
      LEFT JOIN products p ON wom.raw_material_id = p.id
      WHERE wom.work_order_id = $1
    `, [req.params.id]);

    const logsResult = await db.query(`
      SELECT pl.*, u.name as performed_by_name
      FROM production_logs pl
      LEFT JOIN users u ON pl.performed_by = u.id
      WHERE pl.work_order_id = $1
      ORDER BY pl.created_at ASC
    `, [req.params.id]);

    res.json({ ...woResult.rows[0], materials: materialsResult.rows, logs: logsResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/work-orders', async (req, res) => {
  const client = await db.connect();
  try {
    const { bom_id, product_id, quantity_planned, priority, notes, start_date } = req.body;

    if (!quantity_planned || quantity_planned <= 0) {
      return res.status(400).json({ error: 'quantity_planned is required and must be > 0' });
    }

    await client.query('BEGIN');

    const woNumberResult = await client.query(
      "SELECT 'WO-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(COALESCE(MAX(id) + 1, 1)::text, 5, '0') as wo_number FROM work_orders"
    );
    const work_order_number = woNumberResult.rows[0].wo_number;

    const woResult = await client.query(`
      INSERT INTO work_orders (company_id, work_order_number, bom_id, product_id, quantity_planned, priority, notes, start_date, created_by, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'normal'), $7, $8, $9, 'planned', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [req.user.company_id, work_order_number, bom_id, product_id, quantity_planned, priority, notes, start_date, req.user.id]);

    const workOrder = woResult.rows[0];

    // Auto-reserve materials from BOM
    if (bom_id) {
      const bomItemsResult = await client.query(`
        SELECT bi.*, p.cost_price
        FROM bom_items bi
        JOIN products p ON bi.raw_material_id = p.id
        WHERE bi.bom_id = $1
      `, [bom_id]);

      for (const item of bomItemsResult.rows) {
        const wastageFactor = 1 + (item.wastage_percent / 100);
        const quantityRequired = parseFloat(item.quantity) * quantity_planned * wastageFactor;

        await client.query(`
          INSERT INTO work_order_materials (work_order_id, raw_material_id, quantity_required, unit_cost)
          VALUES ($1, $2, $3, $4)
        `, [workOrder.id, item.raw_material_id, quantityRequired, item.cost_price || item.unit_cost]);
      }
    }

    await client.query('COMMIT');
    res.status(201).json(workOrder);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.patch('/work-orders/:id/start', async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const woResult = await client.query(`
      UPDATE work_orders
      SET status = 'in_progress', start_date = COALESCE(start_date, CURRENT_DATE), updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND company_id = $2 AND status = 'planned'
      RETURNING *
    `, [req.params.id, req.user.company_id]);

    if (woResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Work order not found or cannot be started' });
    }

    await client.query(`
      INSERT INTO production_logs (work_order_id, action, notes, performed_by)
      VALUES ($1, 'started', 'Production started', $2)
    `, [req.params.id, req.user.id]);

    await client.query('COMMIT');
    res.json({ message: 'Work order started', work_order: woResult.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.post('/work-orders/:id/produce', async (req, res) => {
  const client = await db.connect();
  try {
    const { quantity_produced, quantity_defective, notes } = req.body;

    if (!quantity_produced || quantity_produced <= 0) {
      return res.status(400).json({ error: 'quantity_produced is required' });
    }

    await client.query('BEGIN');

    const woResult = await client.query(
      'SELECT * FROM work_orders WHERE id = $1 AND company_id = $2',
      [req.params.id, req.user.company_id]
    );

    if (woResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Work order not found' });
    }

    const wo = woResult.rows[0];

    if (wo.quantity_produced + quantity_produced > wo.quantity_planned) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cannot produce more than planned quantity' });
    }

    // Consume materials proportionally
    const materialsResult = await client.query(
      'SELECT * FROM work_order_materials WHERE work_order_id = $1',
      [req.params.id]
    );

    const ratio = quantity_produced / wo.quantity_planned;

    for (const material of materialsResult.rows) {
      const consumeQty = parseFloat(material.quantity_required) * ratio;

      await client.query(`
        UPDATE work_order_materials
        SET quantity_consumed = quantity_consumed + $1
        WHERE id = $2
      `, [consumeQty, material.id]);

      // Deduct raw materials from inventory
      await client.query(`
        UPDATE products SET current_stock = current_stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
      `, [consumeQty, material.raw_material_id]);

      // Record inventory transaction
      await client.query(`
        INSERT INTO inventory_transactions (product_id, type, quantity, reference_type, reference_id, notes, created_at)
        VALUES ($1, 'out', $2, 'production', $3, $4, CURRENT_TIMESTAMP)
      `, [material.raw_material_id, consumeQty, req.params.id, `Consumed for WO: ${wo.work_order_number}`]);
    }

    // Add finished goods to inventory
    await client.query(`
      UPDATE products SET current_stock = current_stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
    `, [quantity_produced, wo.product_id]);

    await client.query(`
      INSERT INTO inventory_transactions (product_id, type, quantity, reference_type, reference_id, notes, created_at)
      VALUES ($1, 'in', $2, 'production', $3, $4, CURRENT_TIMESTAMP)
    `, [wo.product_id, quantity_produced, req.params.id, `Produced from WO: ${wo.work_order_number}`]);

    await client.query(`
      UPDATE work_orders
      SET quantity_produced = quantity_produced + $1,
          quantity_defective = quantity_defective + COALESCE($2, 0),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [quantity_produced, quantity_defective, req.params.id]);

    await client.query(`
      INSERT INTO production_logs (work_order_id, action, quantity, notes, performed_by)
      VALUES ($1, 'produced', $2, $3, $4)
    `, [req.params.id, quantity_produced, notes, req.user.id]);

    await client.query('COMMIT');
    res.json({ message: 'Production recorded', quantity_produced, quantity_defective });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.patch('/work-orders/:id/complete', async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const woResult = await client.query(`
      UPDATE work_orders
      SET status = 'completed', end_date = COALESCE(end_date, CURRENT_DATE), completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND company_id = $2 AND status IN ('in_progress', 'planned')
      RETURNING *
    `, [req.params.id, req.user.company_id]);

    if (woResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Work order not found or cannot be completed' });
    }

    await client.query(`
      INSERT INTO production_logs (work_order_id, action, notes, performed_by)
      VALUES ($1, 'completed', 'Work order completed', $2)
    `, [req.params.id, req.user.id]);

    await client.query('COMMIT');
    res.json({ message: 'Work order completed', work_order: woResult.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.patch('/work-orders/:id/cancel', async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const woResult = await client.query(`
      UPDATE work_orders
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND company_id = $2 AND status NOT IN ('completed', 'cancelled')
      RETURNING *
    `, [req.params.id, req.user.company_id]);

    if (woResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Work order not found or cannot be cancelled' });
    }

    await client.query(`
      INSERT INTO production_logs (work_order_id, action, notes, performed_by)
      VALUES ($1, 'cancelled', 'Work order cancelled', $2)
    `, [req.params.id, req.user.id]);

    await client.query('COMMIT');
    res.json({ message: 'Work order cancelled', work_order: woResult.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ==========================================
// PRODUCTION CALCULATION ENDPOINTS
// ==========================================

router.get('/requirements/:bomId', async (req, res) => {
  try {
    const { quantity } = req.query;
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'quantity parameter is required' });
    }

    const itemsResult = await db.query(`
      SELECT bi.*, p.product_name, p.sku, p.current_stock, p.cost_price
      FROM bom_items bi
      JOIN products p ON bi.raw_material_id = p.id
      WHERE bi.bom_id = $1
    `, [req.params.bomId]);

    const requirements = itemsResult.rows.map(item => {
      const wastageFactor = 1 + (parseFloat(item.wastage_percent) / 100);
      const requiredQty = parseFloat(item.quantity) * parseFloat(quantity) * wastageFactor;
      const currentStock = parseFloat(item.current_stock || 0);

      return {
        raw_material_id: item.raw_material_id,
        product_name: item.product_name,
        sku: item.sku,
        required_quantity: requiredQty,
        current_stock: currentStock,
        available: currentStock >= requiredQty,
        shortage: currentStock < requiredQty ? requiredQty - currentStock : 0,
        estimated_cost: requiredQty * parseFloat(item.cost_price || 0)
      };
    });

    const totalCost = requirements.reduce((sum, r) => sum + r.estimated_cost, 0);
    const allAvailable = requirements.every(r => r.available);

    res.json({
      bom_id: req.params.bomId,
      quantity: parseFloat(quantity),
      requirements,
      total_estimated_cost: totalCost,
      can_produce: allAvailable
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/available-stock/:bomId', async (req, res) => {
  try {
    const itemsResult = await db.query(`
      SELECT bi.quantity, bi.wastage_percent, p.current_stock, p.product_name, p.sku
      FROM bom_items bi
      JOIN products p ON bi.raw_material_id = p.id
      WHERE bi.bom_id = $1
    `, [req.params.bomId]);

    if (itemsResult.rows.length === 0) {
      return res.status(404).json({ error: 'BOM not found or has no items' });
    }

    let maxPossible = Infinity;

    for (const item of itemsResult.rows) {
      const wastageFactor = 1 + (parseFloat(item.wastage_percent) / 100);
      const perUnitNeed = parseFloat(item.quantity) * wastageFactor;
      const possible = Math.floor(parseFloat(item.current_stock || 0) / perUnitNeed);
      if (possible < maxPossible) {
        maxPossible = possible;
      }
    }

    res.json({
      bom_id: req.params.bomId,
      max_producible: maxPossible === Infinity ? 0 : maxPossible,
      components: itemsResult.rows.map(item => ({
        product_name: item.product_name,
        sku: item.sku,
        current_stock: parseFloat(item.current_stock),
        required_per_unit: parseFloat(item.quantity) * (1 + parseFloat(item.wastage_percent) / 100)
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/calculate-cost/:workOrderId', async (req, res) => {
  try {
    const woResult = await db.query(`
      SELECT * FROM work_orders WHERE id = $1 AND company_id = $2
    `, [req.params.workOrderId, req.user.company_id]);

    if (woResult.rows.length === 0) {
      return res.status(404).json({ error: 'Work order not found' });
    }

    const materialsResult = await db.query(`
      SELECT * FROM work_order_materials WHERE work_order_id = $1
    `, [req.params.workOrderId]);

    let totalMaterialCost = 0;
    const materialBreakdown = [];

    for (const material of materialsResult.rows) {
      const consumedQty = parseFloat(material.quantity_consumed || 0);
      const unitCost = parseFloat(material.unit_cost || 0);
      const cost = consumedQty * unitCost;
      totalMaterialCost += cost;

      materialBreakdown.push({
        raw_material_id: material.raw_material_id,
        quantity_consumed: consumedQty,
        unit_cost: unitCost,
        total_cost: cost
      });
    }

    const produced = parseFloat(woResult.rows[0].quantity_produced || 0);
    const defective = parseFloat(woResult.rows[0].quantity_defective || 0);
    const unitProductionCost = produced > 0 ? totalMaterialCost / produced : 0;

    res.json({
      work_order_id: req.params.workOrderId,
      quantity_produced: produced,
      quantity_defective: defective,
      material_breakdown: materialBreakdown,
      total_material_cost: totalMaterialCost,
      unit_production_cost: unitProductionCost
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
