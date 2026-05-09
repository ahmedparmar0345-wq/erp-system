import express from 'express';
import db from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

// ==================== WORKFLOW DEFINITIONS ====================
router.get('/workflows', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT aw.*, u.name as created_by_name,
        (SELECT COUNT(*) FROM approval_steps WHERE workflow_id = aw.id) as steps_count
      FROM approval_workflows aw LEFT JOIN users u ON aw.created_by = u.id WHERE aw.company_id = $1 ORDER BY aw.name
    `, [req.user.company_id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/workflows/:id', async (req, res) => {
  try {
    const wf = await db.query('SELECT * FROM approval_workflows WHERE id = $1 AND company_id = $2', [req.params.id, req.user.company_id]);
    if (wf.rows.length === 0) return res.status(404).json({ error: 'Workflow not found' });
    const steps = await db.query(`
      SELECT as2.*, u.name as approver_name, r.name as role_name
      FROM approval_steps as2 LEFT JOIN users u ON as2.approver_id = u.id LEFT JOIN roles r ON as2.approver_role_id = r.id
      WHERE as2.workflow_id = $1 ORDER BY as2.step_order
    `, [req.params.id]);
    res.json({ ...wf.rows[0], steps: steps.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/workflows', async (req, res) => {
  const client = await db.connect();
  try {
    const { name, description, target_entity, steps } = req.body;
    if (!name || !target_entity || !steps || steps.length === 0)
      return res.status(400).json({ error: 'Name, target_entity, and steps required' });

    await client.query('BEGIN');
    const wf = await client.query(
      'INSERT INTO approval_workflows (company_id, name, description, target_entity, created_by) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.user.company_id, name, description, target_entity, req.user.id]
    );
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      await client.query(`
        INSERT INTO approval_steps (workflow_id, step_order, approver_id, approver_role_id, min_amount, max_amount, requires_all)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
      `, [wf.rows[0].id, i + 1, s.approver_id, s.approver_role_id, s.min_amount, s.max_amount, s.requires_all || false]);
    }
    await client.query('COMMIT');
    res.status(201).json(wf.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

router.put('/workflows/:id', async (req, res) => {
  const client = await db.connect();
  try {
    const { name, description, is_active, steps } = req.body;
    await client.query('BEGIN');
    await client.query(
      'UPDATE approval_workflows SET name = COALESCE($1,name), description = COALESCE($2,description), is_active = COALESCE($3,is_active) WHERE id = $4 AND company_id = $5',
      [name, description, is_active, req.params.id, req.user.company_id]
    );
    if (steps) {
      await client.query('DELETE FROM approval_steps WHERE workflow_id = $1', [req.params.id]);
      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        await client.query(`
          INSERT INTO approval_steps (workflow_id, step_order, approver_id, approver_role_id, min_amount, max_amount, requires_all)
          VALUES ($1,$2,$3,$4,$5,$6,$7)
        `, [req.params.id, i + 1, s.approver_id, s.approver_role_id, s.min_amount, s.max_amount, s.requires_all || false]);
      }
    }
    await client.query('COMMIT');
    const result = await db.query('SELECT * FROM approval_workflows WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

router.delete('/workflows/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM approval_workflows WHERE id = $1 AND company_id = $2', [req.params.id, req.user.company_id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== APPROVAL REQUESTS ====================
router.get('/requests', async (req, res) => {
  try {
    const { status, target_entity } = req.query;
    let query = `
      SELECT ar.*, aw.name as workflow_name, u.name as requester_name
      FROM approval_requests ar
      JOIN approval_workflows aw ON ar.workflow_id = aw.id
      JOIN users u ON ar.requester_id = u.id
      WHERE ar.company_id = $1
    `;
    const params = [req.user.company_id];
    if (status) { query += ' AND ar.status = $2'; params.push(status); }
    if (target_entity) { query += ' AND ar.target_entity = $3'; params.push(target_entity); }
    query += ' ORDER BY ar.created_at DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Requests pending my approval
router.get('/requests/pending', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT ar.*, aw.name as workflow_name, u.name as requester_name
      FROM approval_requests ar
      JOIN approval_workflows aw ON ar.workflow_id = aw.id
      JOIN users u ON ar.requester_id = u.id
      JOIN approval_steps a_step ON a_step.workflow_id = ar.workflow_id AND a_step.step_order = ar.current_step
      WHERE ar.company_id = $1 AND ar.status = 'pending'
        AND (a_step.approver_id = $2 OR a_step.approver_role_id IN (SELECT role_id FROM users WHERE id = $2))
      ORDER BY ar.created_at ASC
    `, [req.user.company_id, req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/requests/:id', async (req, res) => {
  try {
    const ar = await db.query(`
      SELECT ar.*, aw.name as workflow_name, u.name as requester_name
      FROM approval_requests ar
      JOIN approval_workflows aw ON ar.workflow_id = aw.id
      JOIN users u ON ar.requester_id = u.id
      WHERE ar.id = $1 AND ar.company_id = $2
    `, [req.params.id, req.user.company_id]);
    if (ar.rows.length === 0) return res.status(404).json({ error: 'Request not found' });
    const logs = await db.query(`
      SELECT al.*, a_step.step_order, u.name as approver_name
      FROM approval_logs al
      JOIN approval_steps a_step ON al.step_id = a_step.id
      LEFT JOIN users u ON al.approver_id = u.id
      WHERE al.request_id = $1 ORDER BY al.acted_at
    `, [req.params.id]);
    res.json({ ...ar.rows[0], logs: logs.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Submit approval request
router.post('/requests', async (req, res) => {
  try {
    const { workflow_id, target_entity, target_id, amount, notes } = req.body;
    if (!workflow_id || !target_entity || !target_id)
      return res.status(400).json({ error: 'workflow_id, target_entity, target_id required' });

    const wf = await db.query('SELECT * FROM approval_workflows WHERE id = $1 AND company_id = $2 AND is_active = true', [workflow_id, req.user.company_id]);
    if (wf.rows.length === 0) return res.status(404).json({ error: 'Active workflow not found' });

    const steps = await db.query('SELECT COUNT(*) as count FROM approval_steps WHERE workflow_id = $1', [workflow_id]);

    const result = await db.query(`
      INSERT INTO approval_requests (company_id, workflow_id, target_entity, target_id, requester_id, current_step, total_steps, amount, notes)
      VALUES ($1,$2,$3,$4,$5,1,$6,$7,$8) RETURNING *
    `, [req.user.company_id, workflow_id, target_entity, target_id, req.user.id, parseInt(steps.rows[0].count), amount || 0, notes]);

    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Approve / Reject
router.post('/requests/:id/action', async (req, res) => {
  const client = await db.connect();
  try {
    const { action, comment } = req.body; // 'approved' or 'rejected'
    if (!action || !['approved', 'rejected'].includes(action))
      return res.status(400).json({ error: 'Action must be approved or rejected' });

    await client.query('BEGIN');

    const ar = await client.query('SELECT * FROM approval_requests WHERE id = $1 AND company_id = $2 AND status = $3',
      [req.params.id, req.user.company_id, 'pending']);
    if (ar.rows.length === 0) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Pending request not found' }); }
    const request = ar.rows[0];

    const step = await client.query(`
      SELECT * FROM approval_steps WHERE workflow_id = $1 AND step_order = $2
    `, [request.workflow_id, request.current_step]);
    if (step.rows.length === 0) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Step not found' }); }

    // Log the action
    await client.query(`
      INSERT INTO approval_logs (request_id, step_id, approver_id, action, comment)
      VALUES ($1, $2, $3, $4, $5)
    `, [req.params.id, step.rows[0].id, req.user.id, action, comment]);

    if (action === 'rejected') {
      await client.query('UPDATE approval_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['rejected', req.params.id]);
    } else {
      // approved - move to next step or complete
      if (request.current_step >= request.total_steps) {
        await client.query('UPDATE approval_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['approved', req.params.id]);
      } else {
        await client.query('UPDATE approval_requests SET current_step = current_step + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [req.params.id]);
      }
    }

    await client.query('COMMIT');
    res.json({ message: `Request ${action}` });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

export default router;
