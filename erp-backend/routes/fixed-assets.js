import express from 'express';
import db from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

// ==================== ASSET CATEGORIES ====================
router.get('/categories', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM asset_categories WHERE company_id = $1 AND is_active = true ORDER BY code', [req.user.company_id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/categories', async (req, res) => {
  try {
    const { code, name, default_depreciation_method, default_useful_life } = req.body;
    if (!code || !name) return res.status(400).json({ error: 'Code and name required' });
    const result = await db.query(
      'INSERT INTO asset_categories (company_id, code, name, default_depreciation_method, default_useful_life) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.user.company_id, code, name, default_depreciation_method || 'straight_line', default_useful_life]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== FIXED ASSETS ====================
router.get('/', async (req, res) => {
  try {
    const { status, category_id } = req.query;
    let query = `
      SELECT fa.*, ac.name as category_name, u.name as assigned_to_name, s.name as supplier_name
      FROM fixed_assets fa
      LEFT JOIN asset_categories ac ON fa.category_id = ac.id
      LEFT JOIN users u ON fa.assigned_to = u.id
      LEFT JOIN suppliers s ON fa.supplier_id = s.id
      WHERE fa.company_id = $1
    `;
    const params = [req.user.company_id];
    if (status) { query += ' AND fa.status = $2'; params.push(status); }
    if (category_id) { query += ' AND fa.category_id = $3'; params.push(category_id); }
    query += ' ORDER BY fa.created_at DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const asset = await db.query(`
      SELECT fa.*, ac.name as category_name, u.name as assigned_to_name, s.name as supplier_name
      FROM fixed_assets fa
      LEFT JOIN asset_categories ac ON fa.category_id = ac.id
      LEFT JOIN users u ON fa.assigned_to = u.id
      LEFT JOIN suppliers s ON fa.supplier_id = s.id
      WHERE fa.id = $1 AND fa.company_id = $2
    `, [req.params.id, req.user.company_id]);
    if (asset.rows.length === 0) return res.status(404).json({ error: 'Asset not found' });
    const depr = await db.query('SELECT * FROM asset_depreciation WHERE asset_id = $1 ORDER BY period_date', [req.params.id]);
    const maint = await db.query('SELECT * FROM asset_maintenance WHERE asset_id = $1 ORDER BY maintenance_date DESC', [req.params.id]);
    res.json({ ...asset.rows[0], depreciation: depr.rows, maintenance: maint.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { asset_code, name, category_id, description, purchase_date, purchase_cost, salvage_value, useful_life, depreciation_method, location, assigned_to, supplier_id, warranty_expiry, notes } = req.body;
    if (!asset_code || !name || !purchase_date || !purchase_cost || !useful_life)
      return res.status(400).json({ error: 'Asset code, name, purchase_date, purchase_cost, useful_life required' });

    const deprMethod = depreciation_method || 'straight_line';
    const sv = salvage_value || 0;
    const deprPerPeriod = deprMethod === 'straight_line' ? (purchase_cost - sv) / useful_life : 0;

    const result = await db.query(`
      INSERT INTO fixed_assets (company_id, asset_code, name, category_id, description, purchase_date, purchase_cost, current_value, salvage_value, useful_life, depreciation_method, depreciation_per_period, location, assigned_to, supplier_id, warranty_expiry, notes, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *
    `, [req.user.company_id, asset_code, name, category_id, description, purchase_date, purchase_cost, purchase_cost, sv, useful_life, deprMethod, deprPerPeriod, location, assigned_to, supplier_id, warranty_expiry, notes, req.user.id]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Asset code already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, category_id, description, location, assigned_to, supplier_id, warranty_expiry, status, notes, current_value } = req.body;
    const result = await db.query(`
      UPDATE fixed_assets SET name = COALESCE($1,name), category_id = COALESCE($2,category_id), description = COALESCE($3,description),
        location = COALESCE($4,location), assigned_to = $5, supplier_id = $6, warranty_expiry = $7,
        status = COALESCE($8,status), notes = COALESCE($9,notes), current_value = COALESCE($10,current_value), updated_at = CURRENT_TIMESTAMP
      WHERE id = $11 AND company_id = $12 RETURNING *
    `, [name, category_id, description, location, assigned_to || null, supplier_id || null, warranty_expiry, status, notes, current_value, req.params.id, req.user.company_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Asset not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM fixed_assets WHERE id = $1 AND company_id = $2', [req.params.id, req.user.company_id]);
    res.json({ message: 'Asset deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Depreciation run
router.post('/:id/depreciate', async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const asset = await client.query('SELECT * FROM fixed_assets WHERE id = $1 AND company_id = $2 AND status = $3',
      [req.params.id, req.user.company_id, 'active']);
    if (asset.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Active asset not found' }); }

    const a = asset.rows[0];
    const lastDepr = await client.query('SELECT MAX(period_date) as last_date FROM asset_depreciation WHERE asset_id = $1', [req.params.id]);
    const startDate = lastDepr.rows[0].last_date ? new Date(lastDepr.rows[0].last_date) : new Date(a.purchase_date);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());

    let created = 0;
    for (let m = 1; m <= monthsDiff; m++) {
      const periodDate = new Date(startDate.getFullYear(), startDate.getMonth() + m, 1);
      const newAccum = a.accumulated_depreciation + a.depreciation_per_period;
      if (newAccum >= a.purchase_cost - a.salvage_value) break;

      await client.query(`
        INSERT INTO asset_depreciation (company_id, asset_id, period_date, amount, running_balance)
        VALUES ($1, $2, $3, $4, $5)
      `, [a.company_id, a.id, periodDate, a.depreciation_per_period, a.purchase_cost - a.depreciation_per_period * (m + (lastDepr.rows[0].last_date ? 1 : 0))]);
      created++;
    }

    if (created > 0) {
      const totalDepr = await client.query('SELECT COALESCE(SUM(amount),0) as total FROM asset_depreciation WHERE asset_id = $1', [req.params.id]);
      const accum = parseFloat(totalDepr.rows[0].total);
      await client.query('UPDATE fixed_assets SET accumulated_depreciation = $1, current_value = purchase_cost - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [accum, req.params.id]);
    }

    await client.query('COMMIT');
    res.json({ message: `Depreciation recorded for ${created} period(s)` });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

// Maintenance
router.post('/:id/maintenance', async (req, res) => {
  try {
    const { maintenance_date, type, description, cost, performed_by, next_maintenance_date, notes } = req.body;
    const result = await db.query(`
      INSERT INTO asset_maintenance (company_id, asset_id, maintenance_date, type, description, cost, performed_by, next_maintenance_date, notes, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *
    `, [req.user.company_id, req.params.id, maintenance_date, type, description, cost, performed_by, next_maintenance_date, notes, req.user.id]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Disposal
router.post('/:id/dispose', async (req, res) => {
  try {
    const { disposal_date, disposal_amount, notes } = req.body;
    const result = await db.query(`
      UPDATE fixed_assets SET status = 'disposed', current_value = COALESCE($1, 0), notes = CASE WHEN $3 IS NOT NULL THEN notes || E'\n' || $3 ELSE notes END, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND company_id = $4 RETURNING *
    `, [disposal_amount || 0, req.params.id, notes, req.user.company_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Asset not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
