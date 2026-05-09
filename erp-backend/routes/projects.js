import express from 'express';
import db from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

// ==================== PROJECTS ====================
router.get('/', async (req, res) => {
  try {
    const { status, customer_id } = req.query;
    let query = `
      SELECT p.*, c.name as customer_name, u.name as manager_name,
        (SELECT COUNT(*) FROM project_tasks WHERE project_id = p.id) as tasks_count,
        (SELECT COUNT(*) FROM project_tasks WHERE project_id = p.id AND status = 'done') as tasks_done,
        (SELECT COALESCE(SUM(hours),0) FROM time_entries WHERE project_id = p.id) as logged_hours
      FROM projects p
      LEFT JOIN customers c ON p.customer_id = c.id
      LEFT JOIN users u ON p.project_manager = u.id
      WHERE p.company_id = $1
    `;
    const params = [req.user.company_id];
    if (status) { query += ' AND p.status = $2'; params.push(status); }
    if (customer_id) { query += ' AND p.customer_id = $3'; params.push(customer_id); }
    query += ' ORDER BY p.created_at DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await db.query(`
      SELECT p.*, c.name as customer_name, u.name as manager_name
      FROM projects p LEFT JOIN customers c ON p.customer_id = c.id LEFT JOIN users u ON p.project_manager = u.id
      WHERE p.id = $1 AND p.company_id = $2
    `, [req.params.id, req.user.company_id]);
    if (project.rows.length === 0) return res.status(404).json({ error: 'Project not found' });

    const tasks = await db.query(`
      SELECT pt.*, u.name as assigned_to_name,
        (SELECT COUNT(*) FROM project_tasks WHERE parent_task_id = pt.id) as subtasks_count
      FROM project_tasks pt LEFT JOIN users u ON pt.assigned_to = u.id
      WHERE pt.project_id = $1 ORDER BY pt.sort_order, pt.created_at
    `, [req.params.id]);

    const members = await db.query(`
      SELECT pm.*, u.name as user_name, u.email FROM project_members pm JOIN users u ON pm.user_id = u.id WHERE pm.project_id = $1
    `, [req.params.id]);

    const timeEntries = await db.query(`
      SELECT te.*, u.name as user_name, pt.name as task_name
      FROM time_entries te LEFT JOIN users u ON te.user_id = u.id LEFT JOIN project_tasks pt ON te.task_id = pt.id
      WHERE te.project_id = $1 ORDER BY te.entry_date DESC
    `, [req.params.id]);

    res.json({ ...project.rows[0], tasks, members, time_entries: timeEntries.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { project_code, name, description, customer_id, start_date, end_date, budget_amount, priority, project_manager, notes } = req.body;
    if (!project_code || !name) return res.status(400).json({ error: 'Project code and name required' });
    const result = await db.query(`
      INSERT INTO projects (company_id, project_code, name, description, customer_id, start_date, end_date, budget_amount, priority, project_manager, notes, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *
    `, [req.user.company_id, project_code, name, description, customer_id, start_date, end_date, budget_amount, priority || 'medium', project_manager, notes, req.user.id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Project code already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const fields = ['name', 'description', 'customer_id', 'start_date', 'end_date', 'budget_amount', 'status', 'priority', 'project_manager', 'notes'];
    const updates = []; const values = []; let idx = 1;
    values.push(req.params.id, req.user.company_id); idx = 3;
    for (const f of fields) {
      if (req.body[f] !== undefined) { updates.push(`${f} = $${idx++}`); values.push(req.body[f]); }
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields' });
    updates.push('updated_at = CURRENT_TIMESTAMP');
    const result = await db.query(`UPDATE projects SET ${updates.join(',')} WHERE id = $1 AND company_id = $2 RETURNING *`, values);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM projects WHERE id = $1 AND company_id = $2', [req.params.id, req.user.company_id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== TASKS ====================
router.get('/:projectId/tasks', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT pt.*, u.name as assigned_to_name
      FROM project_tasks pt LEFT JOIN users u ON pt.assigned_to = u.id
      WHERE pt.project_id = $1 ORDER BY pt.sort_order
    `, [req.params.projectId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:projectId/tasks', async (req, res) => {
  try {
    const { name, description, assigned_to, start_date, due_date, estimated_hours, priority, parent_task_id } = req.body;
    if (!name) return res.status(400).json({ error: 'Task name required' });
    const maxSort = await db.query('SELECT COALESCE(MAX(sort_order),0) + 1 as next FROM project_tasks WHERE project_id = $1', [req.params.projectId]);
    const result = await db.query(`
      INSERT INTO project_tasks (company_id, project_id, parent_task_id, name, description, assigned_to, start_date, due_date, estimated_hours, priority, sort_order, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *
    `, [req.user.company_id, req.params.projectId, parent_task_id, name, description, assigned_to, start_date, due_date, estimated_hours, priority || 'medium', maxSort.rows[0].next, req.user.id]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/tasks/:taskId', async (req, res) => {
  try {
    const fields = ['name', 'description', 'assigned_to', 'start_date', 'due_date', 'estimated_hours', 'priority', 'status', 'sort_order'];
    const updates = []; const values = []; let idx = 1;
    values.push(req.params.taskId); idx = 2;
    for (const f of fields) {
      if (req.body[f] !== undefined) { updates.push(`${f} = $${idx++}`); values.push(req.body[f]); }
    }
    if (req.body.status === 'done') updates.push('completed_date = CURRENT_DATE');
    updates.push('updated_at = CURRENT_TIMESTAMP');
    if (updates.length === 1) return res.status(400).json({ error: 'No fields' });
    const result = await db.query(`UPDATE project_tasks SET ${updates.join(',')} WHERE id = $1 RETURNING *`, values);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/tasks/:taskId', async (req, res) => {
  try {
    await db.query('DELETE FROM project_tasks WHERE id = $1', [req.params.taskId]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== PROJECT MEMBERS ====================
router.get('/:projectId/members', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT pm.*, u.name as user_name, u.email FROM project_members pm JOIN users u ON pm.user_id = u.id WHERE pm.project_id = $1
    `, [req.params.projectId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:projectId/members', async (req, res) => {
  try {
    const { user_id, role, hourly_rate } = req.body;
    const result = await db.query(
      'INSERT INTO project_members (company_id, project_id, user_id, role, hourly_rate) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (project_id, user_id) DO UPDATE SET role = $4, hourly_rate = $5 RETURNING *',
      [req.user.company_id, req.params.projectId, user_id, role || 'member', hourly_rate]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:projectId/members/:userId', async (req, res) => {
  try {
    await db.query('DELETE FROM project_members WHERE project_id = $1 AND user_id = $2', [req.params.projectId, req.params.userId]);
    res.json({ message: 'Removed' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== TIME ENTRIES ====================
router.get('/:projectId/time', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT te.*, u.name as user_name, pt.name as task_name
      FROM time_entries te JOIN users u ON te.user_id = u.id LEFT JOIN project_tasks pt ON te.task_id = pt.id
      WHERE te.project_id = $1 ORDER BY te.entry_date DESC
    `, [req.params.projectId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:projectId/time', async (req, res) => {
  try {
    const { task_id, entry_date, hours, description, billable } = req.body;
    if (!hours) return res.status(400).json({ error: 'Hours required' });
    const result = await db.query(`
      INSERT INTO time_entries (company_id, project_id, task_id, user_id, entry_date, hours, description, billable)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *
    `, [req.user.company_id, req.params.projectId, task_id, req.user.id, entry_date || new Date(), hours, description, billable !== false]);
    // Update actual hours on task
    if (task_id) {
      await db.query('UPDATE project_tasks SET actual_hours = actual_hours + $1 WHERE id = $2', [hours, task_id]);
    }
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
