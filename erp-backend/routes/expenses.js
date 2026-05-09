import express from 'express';
import db from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get expense categories
router.get('/categories', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM expense_categories WHERE company_id = $1 AND is_active = true ORDER BY name',
      [req.user.company_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Create expense category
router.post('/categories', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const result = await db.query(
      `INSERT INTO expense_categories (company_id, name, description, is_active, created_at)
             VALUES ($1, $2, $3, true, CURRENT_TIMESTAMP)
             RETURNING *`,
      [req.user.company_id, name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all expenses
router.get('/', auth, async (req, res) => {
  try {
    const { category, start_date, end_date } = req.query;
    let query = 'SELECT * FROM expenses WHERE company_id = $1';
    let params = [req.user.company_id];
    let paramIndex = 2;

    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (start_date) {
      query += ` AND expense_date >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      query += ` AND expense_date <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    query += ' ORDER BY expense_date DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get single expense
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM expenses WHERE id = $1 AND company_id = $2',
      [req.params.id, req.user.company_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Create expense
router.post('/', auth, async (req, res) => {
  try {
    const { expense_date, category, description, amount, payment_method, reference_number } = req.body;

    if (!category || !amount) {
      return res.status(400).json({ error: 'category and amount are required' });
    }

    const result = await db.query(
      `INSERT INTO expenses (company_id, expense_date, category, description, amount, payment_method, reference_number, created_by, created_at, updated_at)
             VALUES ($1, COALESCE($2, CURRENT_DATE), $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING *`,
      [req.user.company_id, expense_date, category, description, amount, payment_method, reference_number, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update expense
router.put('/:id', auth, async (req, res) => {
  try {
    const { expense_date, category, description, amount, payment_method, reference_number } = req.body;

    const result = await db.query(
      `UPDATE expenses 
             SET expense_date = COALESCE($1, expense_date),
                 category = COALESCE($2, category),
                 description = COALESCE($3, description),
                 amount = COALESCE($4, amount),
                 payment_method = COALESCE($5, payment_method),
                 reference_number = COALESCE($6, reference_number),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $7 AND company_id = $8
             RETURNING *`,
      [expense_date, category, description, amount, payment_method, reference_number, req.params.id, req.user.company_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM expenses WHERE id = $1 AND company_id = $2 RETURNING id',
      [req.params.id, req.user.company_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get expense report
router.get('/reports/total', auth, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let query = `
            SELECT category, SUM(amount) as total
            FROM expenses
            WHERE company_id = $1
        `;
    let params = [req.user.company_id];
    let paramIndex = 2;

    if (start_date) {
      query += ` AND expense_date >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      query += ` AND expense_date <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    query += ' GROUP BY category ORDER BY category';

    const result = await db.query(query, params);

    const summary = {};
    result.rows.forEach(row => {
      summary[row.category] = parseFloat(row.total);
    });

    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;