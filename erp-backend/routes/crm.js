import express from 'express';
import db from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

// ============================
// LEAD SOURCES
// ============================
router.get('/lead-sources', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM lead_sources WHERE company_id = $1 AND is_active = true ORDER BY name', [req.user.company_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================
// LEAD STATUSES
// ============================
router.get('/lead-statuses', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM lead_statuses WHERE company_id = $1 AND is_active = true ORDER BY sort_order', [req.user.company_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================
// LEADS CRUD
// ============================
router.get('/leads', async (req, res) => {
  try {
    const { status_id, source_id, search } = req.query;
    let query = `
      SELECT l.*, ls.name as source_name, lst.name as status_name, lst.color as status_color,
             u.name as assigned_to_name,
             COALESCE((SELECT COUNT(*) FROM follow_ups fu WHERE fu.lead_id = l.id AND fu.status = 'pending'), 0) as pending_follow_ups
      FROM leads l
      LEFT JOIN lead_sources ls ON l.source_id = ls.id
      LEFT JOIN lead_statuses lst ON l.status_id = lst.id
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE l.company_id = $1
    `;
    const params = [req.user.company_id];
    let idx = 2;

    if (status_id) { query += ` AND l.status_id = $${idx++}`; params.push(status_id); }
    if (source_id) { query += ` AND l.source_id = $${idx++}`; params.push(source_id); }
    if (search) { query += ` AND (LOWER(l.first_name) LIKE $${idx} OR LOWER(l.last_name) LIKE $${idx} OR LOWER(l.email) LIKE $${idx} OR LOWER(l.company) LIKE $${idx})`; params.push(`%${search.toLowerCase()}%`); idx++; }

    query += ' ORDER BY l.created_at DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/leads/:id', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT l.*, ls.name as source_name, lst.name as status_name, lst.color as status_color,
             u.name as assigned_to_name
      FROM leads l
      LEFT JOIN lead_sources ls ON l.source_id = ls.id
      LEFT JOIN lead_statuses lst ON l.status_id = lst.id
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE l.id = $1 AND l.company_id = $2
    `, [req.params.id, req.user.company_id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Lead not found' });

    const followUps = await db.query('SELECT * FROM follow_ups WHERE lead_id = $1 ORDER BY due_date ASC', [req.params.id]);
    const interactions = await db.query('SELECT * FROM interactions WHERE lead_id = $1 ORDER BY performed_at DESC', [req.params.id]);
    const opportunities = await db.query('SELECT * FROM opportunities WHERE lead_id = $1 ORDER BY created_at DESC', [req.params.id]);

    res.json({ ...result.rows[0], follow_ups: followUps.rows, interactions: interactions.rows, opportunities: opportunities.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/leads', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, mobile, company, designation, website, source_id, status_id, assigned_to, address, city, state, country, postal_code, notes } = req.body;
    if (!first_name || !last_name) return res.status(400).json({ error: 'First and last name are required' });

    const result = await db.query(`
      INSERT INTO leads (company_id, first_name, last_name, email, phone, mobile, company, designation, website, source_id, status_id, assigned_to, address, city, state, country, postal_code, notes, created_by, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11, (SELECT id FROM lead_statuses WHERE company_id = $1 AND sort_order = 1)), $12, $13, $14, $15, $16, $17, $18, $19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [req.user.company_id, first_name, last_name, email, phone, mobile, company, designation, website, source_id, status_id, assigned_to, address, city, state, country, postal_code, notes, req.user.id]);

    // Log interaction
    await db.query(`
      INSERT INTO interactions (company_id, lead_id, type, subject, notes, performed_by)
      VALUES ($1, $2, 'created', 'Lead Created', 'Lead was created', $3)
    `, [req.user.company_id, result.rows[0].id, req.user.id]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/leads/:id', async (req, res) => {
  try {
    const fields = ['first_name', 'last_name', 'email', 'phone', 'mobile', 'company', 'designation', 'website', 'source_id', 'status_id', 'assigned_to', 'address', 'city', 'state', 'country', 'postal_code', 'notes', 'email_opt_out'];
    const updates = [];
    const values = [];
    let idx = 1;

    values.push(req.params.id, req.user.company_id);
    idx = 3;

    for (const f of fields) {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = $${idx++}`);
        values.push(req.body[f]);
      }
    }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    const result = await db.query(`
      UPDATE leads SET ${updates.join(', ')} WHERE id = $1 AND company_id = $2 RETURNING *
    `, values);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Lead not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/leads/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM leads WHERE id = $1 AND company_id = $2 RETURNING id', [req.params.id, req.user.company_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Lead not found' });
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Convert lead to customer
router.post('/leads/:id/convert', async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const leadResult = await client.query('SELECT * FROM leads WHERE id = $1 AND company_id = $2', [req.params.id, req.user.company_id]);
    if (leadResult.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Lead not found' }); }
    const lead = leadResult.rows[0];

    if (lead.converted_customer_id) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Lead already converted' }); }

    const customerResult = await client.query(`
      INSERT INTO customers (company_id, name, email, phone, billing_address)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [lead.company_id, `${lead.first_name} ${lead.last_name}`, lead.email, lead.phone || lead.mobile, lead.address]);

    const customerId = customerResult.rows[0].id;

    await client.query(`
      UPDATE leads SET status_id = (SELECT id FROM lead_statuses WHERE company_id = $1 AND sort_order = 6),
                       converted_customer_id = $2, converted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [lead.company_id, customerId, lead.id]);

    await client.query('COMMIT');
    res.json({ lead: lead, customer: customerResult.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ============================
// OPPORTUNITIES CRUD
// ============================
router.get('/opportunities', async (req, res) => {
  try {
    const { stage } = req.query;
    let query = `
      SELECT o.*, l.first_name || ' ' || l.last_name as lead_name, c.name as customer_name, u.name as assigned_to_name
      FROM opportunities o
      LEFT JOIN leads l ON o.lead_id = l.id
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN users u ON o.assigned_to = u.id
      WHERE o.company_id = $1
    `;
    const params = [req.user.company_id];
    if (stage) { query += ` AND o.stage = $2`; params.push(stage); }
    query += ' ORDER BY o.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/opportunities/:id', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT o.*, l.first_name || ' ' || l.last_name as lead_name, c.name as customer_name, u.name as assigned_to_name
      FROM opportunities o
      LEFT JOIN leads l ON o.lead_id = l.id
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN users u ON o.assigned_to = u.id
      WHERE o.id = $1 AND o.company_id = $2
    `, [req.params.id, req.user.company_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Opportunity not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/opportunities', async (req, res) => {
  try {
    const { lead_id, customer_id, name, description, expected_revenue, probability, expected_close_date, stage, priority, assigned_to, notes } = req.body;
    if (!name) return res.status(400).json({ error: 'Opportunity name is required' });

    const result = await db.query(`
      INSERT INTO opportunities (company_id, lead_id, customer_id, name, description, expected_revenue, probability, expected_close_date, stage, priority, assigned_to, notes, created_by, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, 'qualification'), COALESCE($10, 'medium'), $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [req.user.company_id, lead_id, customer_id, name, description, expected_revenue, probability, expected_close_date, stage, priority, assigned_to, notes, req.user.id]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/opportunities/:id', async (req, res) => {
  try {
    const fields = ['name', 'description', 'expected_revenue', 'probability', 'expected_close_date', 'stage', 'priority', 'assigned_to', 'notes', 'lost_reason'];
    const updates = [];
    const values = [];
    let idx = 1;
    values.push(req.params.id, req.user.company_id);
    idx = 3;
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = $${idx++}`);
        values.push(req.body[f]);
      }
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    updates.push('updated_at = CURRENT_TIMESTAMP');
    const result = await db.query(`UPDATE opportunities SET ${updates.join(', ')} WHERE id = $1 AND company_id = $2 RETURNING *`, values);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Opportunity not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/opportunities/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM opportunities WHERE id = $1 AND company_id = $2 RETURNING id', [req.params.id, req.user.company_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Opportunity not found' });
    res.json({ message: 'Opportunity deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================
// FOLLOW-UPS
// ============================
router.get('/follow-ups', async (req, res) => {
  try {
    const { status, lead_id } = req.query;
    let query = `
      SELECT fu.*, l.first_name || ' ' || l.last_name as lead_name, u.name as assigned_to_name
      FROM follow_ups fu
      LEFT JOIN leads l ON fu.lead_id = l.id
      LEFT JOIN users u ON fu.assigned_to = u.id
      WHERE fu.company_id = $1
    `;
    const params = [req.user.company_id];
    if (status) { query += ` AND fu.status = $2`; params.push(status); }
    if (lead_id) { query += ` AND fu.lead_id = $3`; params.push(lead_id); }
    query += ' ORDER BY fu.due_date ASC, fu.due_time ASC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/follow-ups', async (req, res) => {
  try {
    const { lead_id, opportunity_id, title, description, due_date, due_time, priority, assigned_to } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const result = await db.query(`
      INSERT INTO follow_ups (company_id, lead_id, opportunity_id, title, description, due_date, due_time, priority, assigned_to, created_by, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 'medium'), $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [req.user.company_id, lead_id, opportunity_id, title, description, due_date, due_time, priority, assigned_to, req.user.id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/follow-ups/:id/complete', async (req, res) => {
  try {
    const result = await db.query(`
      UPDATE follow_ups SET status = 'completed', completed_at = CURRENT_TIMESTAMP, completed_by = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND company_id = $3 RETURNING *
    `, [req.user.id, req.params.id, req.user.company_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Follow-up not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/follow-ups/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM follow_ups WHERE id = $1 AND company_id = $2', [req.params.id, req.user.company_id]);
    res.json({ message: 'Follow-up deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================
// INTERACTIONS
// ============================
router.get('/interactions', async (req, res) => {
  try {
    const { lead_id, customer_id } = req.query;
    let query = `
      SELECT i.*, l.first_name || ' ' || l.last_name as lead_name, c.name as customer_name, u.name as performed_by_name
      FROM interactions i
      LEFT JOIN leads l ON i.lead_id = l.id
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN users u ON i.performed_by = u.id
      WHERE i.company_id = $1
    `;
    const params = [req.user.company_id];
    if (lead_id) { query += ` AND i.lead_id = $2`; params.push(lead_id); }
    if (customer_id) { query += ` AND i.customer_id = $3`; params.push(customer_id); }
    query += ' ORDER BY i.performed_at DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/interactions', async (req, res) => {
  try {
    const { lead_id, customer_id, type, subject, notes, outcome } = req.body;
    if (!type) return res.status(400).json({ error: 'Type is required' });
    const result = await db.query(`
      INSERT INTO interactions (company_id, lead_id, customer_id, type, subject, notes, outcome, performed_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [req.user.company_id, lead_id, customer_id, type, subject, notes, outcome, req.user.id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================
// DASHBOARD STATS
// ============================
router.get('/dashboard', async (req, res) => {
  try {
    const companyId = req.user.company_id;

    const totalLeads = await db.query('SELECT COUNT(*) FROM leads WHERE company_id = $1', [companyId]);
    const leadsByStatus = await db.query(`
      SELECT lst.name as status, lst.color, COUNT(l.id) as count
      FROM leads l RIGHT JOIN lead_statuses lst ON l.status_id = lst.id AND l.company_id = $1
      WHERE lst.company_id = $1 AND lst.is_active = true
      GROUP BY lst.id, lst.name, lst.color, lst.sort_order ORDER BY lst.sort_order
    `, [companyId]);

    const totalOpportunities = await db.query('SELECT COUNT(*) FROM opportunities WHERE company_id = $1', [companyId]);
    const pipelineValue = await db.query("SELECT COALESCE(SUM(expected_revenue), 0) as total FROM opportunities WHERE company_id = $1 AND stage NOT IN ('lost', 'closed_won')", [companyId]);
    const wonValue = await db.query("SELECT COALESCE(SUM(expected_revenue), 0) as total FROM opportunities WHERE company_id = $1 AND stage = 'closed_won'", [companyId]);

    const pendingFollowUps = await db.query("SELECT COUNT(*) FROM follow_ups WHERE company_id = $1 AND status = 'pending' AND due_date <= CURRENT_DATE", [companyId]);
    const recentInteractions = await db.query(`
      SELECT i.*, l.first_name || ' ' || l.last_name as lead_name, u.name as performed_by_name
      FROM interactions i
      LEFT JOIN leads l ON i.lead_id = l.id
      LEFT JOIN users u ON i.performed_by = u.id
      WHERE i.company_id = $1 ORDER BY i.performed_at DESC LIMIT 10
    `, [companyId]);

    res.json({
      total_leads: parseInt(totalLeads.rows[0].count),
      leads_by_status: leadsByStatus.rows,
      total_opportunities: parseInt(totalOpportunities.rows[0].count),
      pipeline_value: parseFloat(pipelineValue.rows[0].total),
      won_value: parseFloat(wonValue.rows[0].total),
      pending_follow_ups: parseInt(pendingFollowUps.rows[0].count),
      recent_interactions: recentInteractions.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
