import express from 'express';
import db from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

// ==================== COA MANAGEMENT (enhance existing) ====================
router.put('/chart-of-accounts/:id', async (req, res) => {
  try {
    const { account_code, account_name, account_type, parent_account_id, description, is_active } = req.body;
    const result = await db.query(`
      UPDATE chart_of_accounts SET account_code = COALESCE($1, account_code), account_name = COALESCE($2, account_name),
        account_type = COALESCE($3, account_type), parent_account_id = $4, description = COALESCE($5, description),
        is_active = COALESCE($6, is_active) WHERE id = $7 AND company_id = $8 RETURNING *
    `, [account_code, account_name, account_type, parent_account_id || null, description, is_active, req.params.id, req.user.company_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Account not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/chart-of-accounts/:id', async (req, res) => {
  try {
    const check = await db.query('SELECT id FROM journal_entry_lines WHERE account_id = $1 LIMIT 1', [req.params.id]);
    if (check.rows.length > 0) return res.status(400).json({ error: 'Cannot delete account with journal entries. Deactivate it instead.' });
    await db.query('DELETE FROM chart_of_accounts WHERE id = $1 AND company_id = $2', [req.params.id, req.user.company_id]);
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/chart-of-accounts/:id/toggle', async (req, res) => {
  try {
    const result = await db.query(`
      UPDATE chart_of_accounts SET is_active = NOT is_active WHERE id = $1 AND company_id = $2 RETURNING *
    `, [req.params.id, req.user.company_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Account not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== COST CENTERS ====================
router.get('/cost-centers', async (req, res) => {
  try {
    const result = await db.query('SELECT cc.*, u.name as created_by_name FROM cost_centers cc LEFT JOIN users u ON cc.created_by = u.id WHERE cc.company_id = $1 ORDER BY cc.code', [req.user.company_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/cost-centers', async (req, res) => {
  try {
    const { code, name, description } = req.body;
    if (!code || !name) return res.status(400).json({ error: 'Code and name are required' });
    const result = await db.query(`
      INSERT INTO cost_centers (company_id, code, name, description, created_by, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *
    `, [req.user.company_id, code, name, description, req.user.id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Cost center code already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/cost-centers/:id', async (req, res) => {
  try {
    const { code, name, description, is_active } = req.body;
    const result = await db.query(`
      UPDATE cost_centers SET code = COALESCE($1, code), name = COALESCE($2, name), description = COALESCE($3, description),
        is_active = COALESCE($4, is_active), updated_at = CURRENT_TIMESTAMP WHERE id = $5 AND company_id = $6 RETURNING *
    `, [code, name, description, is_active, req.params.id, req.user.company_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cost center not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/cost-centers/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM cost_centers WHERE id = $1 AND company_id = $2', [req.params.id, req.user.company_id]);
    res.json({ message: 'Cost center deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== BUDGETS ====================
router.get('/budgets', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT b.*, u.name as created_by_name,
        (SELECT COUNT(*) FROM budget_items WHERE budget_id = b.id) as items_count
      FROM budgets b LEFT JOIN users u ON b.created_by = u.id WHERE b.company_id = $1 ORDER BY b.fiscal_year DESC, b.name
    `, [req.user.company_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/budgets/:id', async (req, res) => {
  try {
    const budget = await db.query('SELECT b.*, u.name as created_by_name FROM budgets b LEFT JOIN users u ON b.created_by = u.id WHERE b.id = $1 AND b.company_id = $2', [req.params.id, req.user.company_id]);
    if (budget.rows.length === 0) return res.status(404).json({ error: 'Budget not found' });
    const items = await db.query(`
      SELECT bi.*, ca.account_code, ca.account_name, cc.name as cost_center_name
      FROM budget_items bi
      LEFT JOIN chart_of_accounts ca ON bi.account_id = ca.id
      LEFT JOIN cost_centers cc ON bi.cost_center_id = cc.id
      WHERE bi.budget_id = $1 ORDER BY ca.account_code
    `, [req.params.id]);
    res.json({ ...budget.rows[0], items: items.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/budgets', async (req, res) => {
  const client = await db.connect();
  try {
    const { fiscal_year, name, notes, items } = req.body;
    if (!fiscal_year || !name) return res.status(400).json({ error: 'Fiscal year and name are required' });

    await client.query('BEGIN');
    const budget = await client.query(`
      INSERT INTO budgets (company_id, fiscal_year, name, notes, created_by, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *
    `, [req.user.company_id, fiscal_year, name, notes, req.user.id]);

    if (items && items.length > 0) {
      for (const item of items) {
        const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
        const vals = months.map(m => parseFloat(item[m] || 0));
        await client.query(`
          INSERT INTO budget_items (budget_id, account_id, cost_center_id, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        `, [budget.rows[0].id, item.account_id, item.cost_center_id || null, ...vals]);
      }
    }

    await client.query('COMMIT');
    res.status(201).json(budget.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.put('/budgets/:id', async (req, res) => {
  const client = await db.connect();
  try {
    const { name, notes, status, items } = req.body;
    await client.query('BEGIN');

    await client.query(`UPDATE budgets SET name = COALESCE($1, name), notes = COALESCE($2, notes), status = COALESCE($3, status), updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND company_id = $5`,
      [name, notes, status, req.params.id, req.user.company_id]);

    if (items) {
      await client.query('DELETE FROM budget_items WHERE budget_id = $1', [req.params.id]);
      for (const item of items) {
        const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
        const vals = months.map(m => parseFloat(item[m] || 0));
        await client.query(`
          INSERT INTO budget_items (budget_id, account_id, cost_center_id, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        `, [req.params.id, item.account_id, item.cost_center_id || null, ...vals]);
      }
    }

    await client.query('COMMIT');
    const result = await db.query('SELECT * FROM budgets WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.delete('/budgets/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM budgets WHERE id = $1 AND company_id = $2', [req.params.id, req.user.company_id]);
    res.json({ message: 'Budget deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Budget vs Actual report
router.get('/reports/budget-vs-actual', async (req, res) => {
  try {
    const { budget_id, month, year } = req.query;
    if (!budget_id || !year) return res.status(400).json({ error: 'budget_id and year are required' });

    const monthNum = parseInt(month) || new Date().getMonth() + 1;
    const monthNames = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
    const monthCol = monthNames[monthNum - 1];

    const result = await db.query(`
      SELECT bi.id, ca.account_code, ca.account_name, ca.account_type,
        COALESCE(bi.${monthCol}, 0) as budget_amount,
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM je.entry_date) = $3 AND EXTRACT(YEAR FROM je.entry_date) = $2
          THEN jel.debit - jel.credit ELSE 0 END), 0) as actual_amount
      FROM budget_items bi
      JOIN chart_of_accounts ca ON bi.account_id = ca.id
      LEFT JOIN journal_entry_lines jel ON jel.account_id = ca.id
      LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.status IN ('approved', 'posted')
      WHERE bi.budget_id = $1
      GROUP BY bi.id, ca.id
      ORDER BY ca.account_code
    `, [budget_id, year, monthNum]);

    const rows = result.rows.map(r => {
      const budget = parseFloat(r.budget_amount);
      const actual = parseFloat(r.actual_amount);
      const variance = budget - actual;
      return { ...r, budget_amount: budget, actual_amount: actual, variance, variance_pct: budget > 0 ? ((variance / budget) * 100).toFixed(1) : 0 };
    });

    const totals = rows.reduce((acc, r) => ({
      budget: acc.budget + r.budget_amount,
      actual: acc.actual + r.actual_amount,
      variance: acc.variance + r.variance
    }), { budget: 0, actual: 0, variance: 0 });

    res.json({ month: monthNum, year, rows, totals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== BANK RECONCILIATION ====================
router.get('/bank-accounts', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT ba.*, ca.account_code, ca.account_name
      FROM bank_accounts ba
      JOIN chart_of_accounts ca ON ba.account_id = ca.id
      WHERE ba.company_id = $1 ORDER BY ba.bank_name
    `, [req.user.company_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/bank-accounts', async (req, res) => {
  try {
    const { account_id, bank_name, account_number, account_name, opening_balance, as_of_date } = req.body;
    if (!account_id || !bank_name) return res.status(400).json({ error: 'Account and bank name are required' });
    const result = await db.query(`
      INSERT INTO bank_accounts (company_id, account_id, bank_name, account_number, account_name, opening_balance, as_of_date, created_by, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *
    `, [req.user.company_id, account_id, bank_name, account_number, account_name, opening_balance || 0, as_of_date, req.user.id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/bank-accounts/:id', async (req, res) => {
  try {
    const { bank_name, account_number, account_name, opening_balance, as_of_date, is_active } = req.body;
    const result = await db.query(`
      UPDATE bank_accounts SET bank_name = COALESCE($1, bank_name), account_number = COALESCE($2, account_number),
        account_name = COALESCE($3, account_name), opening_balance = COALESCE($4, opening_balance),
        as_of_date = COALESCE($5, as_of_date), is_active = COALESCE($6, is_active), updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 AND company_id = $8 RETURNING *
    `, [bank_name, account_number, account_name, opening_balance, as_of_date, is_active, req.params.id, req.user.company_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bank account not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/bank-accounts/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM bank_accounts WHERE id = $1 AND company_id = $2', [req.params.id, req.user.company_id]);
    res.json({ message: 'Bank account deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bank transactions
router.get('/bank-accounts/:id/transactions', async (req, res) => {
  try {
    const { is_cleared } = req.query;
    let query = 'SELECT * FROM bank_transactions WHERE bank_account_id = $1 AND company_id = $2';
    const params = [req.params.id, req.user.company_id];
    if (is_cleared !== undefined) { query += ' AND is_cleared = $3'; params.push(is_cleared === 'true'); }
    query += ' ORDER BY transaction_date DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/bank-accounts/:id/transactions/import', async (req, res) => {
  try {
    const { transactions } = req.body;
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0)
      return res.status(400).json({ error: 'Transactions array is required' });

    let balance = 0;
    const last = await db.query('SELECT balance FROM bank_transactions WHERE bank_account_id = $1 ORDER BY id DESC LIMIT 1', [req.params.id]);
    if (last.rows.length > 0) balance = parseFloat(last.rows[0].balance);

    const created = [];
    for (const txn of transactions) {
      const debit = parseFloat(txn.debit || 0);
      const credit = parseFloat(txn.credit || 0);
      balance = balance + credit - debit;
      const result = await db.query(`
        INSERT INTO bank_transactions (company_id, bank_account_id, transaction_date, description, reference_number, check_number, debit, credit, balance, created_by, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP) RETURNING *
      `, [req.user.company_id, req.params.id, txn.transaction_date, txn.description, txn.reference_number, txn.check_number, debit, credit, balance, req.user.id]);
      created.push(result.rows[0]);
    }
    res.status(201).json({ count: created.length, transactions: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/transactions/:id/match', async (req, res) => {
  try {
    const { journal_entry_id } = req.body;
    const result = await db.query(`
      UPDATE bank_transactions SET is_cleared = true, matched_journal_entry_id = $1, matched_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND company_id = $3 RETURNING *
    `, [journal_entry_id, req.params.id, req.user.company_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Transaction not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/transactions/:id/unmatch', async (req, res) => {
  try {
    const result = await db.query(`
      UPDATE bank_transactions SET is_cleared = false, matched_journal_entry_id = NULL, matched_at = NULL
      WHERE id = $1 AND company_id = $2 RETURNING *
    `, [req.params.id, req.user.company_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Transaction not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reconciliation
router.post('/reconciliation', async (req, res) => {
  try {
    const { bank_account_id, statement_date, statement_balance, uncleared_deposits, uncleared_checks, notes } = req.body;
    if (!bank_account_id || !statement_date || statement_balance === undefined)
      return res.status(400).json({ error: 'bank_account_id, statement_date, and statement_balance are required' });

    const bookResult = await db.query(`
      SELECT COALESCE(SUM(debit - credit), 0) as balance FROM bank_transactions
      WHERE bank_account_id = $1 AND is_cleared = true
    `, [bank_account_id]);
    const bookBalance = parseFloat(bookResult.rows[0].balance);
    const diff = statement_balance - bookBalance;

    const result = await db.query(`
      INSERT INTO reconciliation_reports (company_id, bank_account_id, statement_date, statement_balance, book_balance,
        uncleared_deposits, uncleared_checks, difference, notes, reconciled_by, reconciled_at, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *
    `, [req.user.company_id, bank_account_id, statement_date, statement_balance, bookBalance,
      uncleared_deposits || 0, uncleared_checks || 0, diff, notes, req.user.id]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/reconciliation', async (req, res) => {
  try {
    const { bank_account_id } = req.query;
    let query = `
      SELECT rr.*, ba.bank_name, u.name as reconciled_by_name
      FROM reconciliation_reports rr
      JOIN bank_accounts ba ON rr.bank_account_id = ba.id
      LEFT JOIN users u ON rr.reconciled_by = u.id
      WHERE rr.company_id = $1
    `;
    const params = [req.user.company_id];
    if (bank_account_id) { query += ' AND rr.bank_account_id = $2'; params.push(bank_account_id); }
    query += ' ORDER BY rr.created_at DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== RECURRING ENTRIES ====================
router.get('/recurring-entries', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT re.*, u.name as created_by_name,
        (SELECT COUNT(*) FROM recurring_entry_lines WHERE recurring_entry_id = re.id) as lines_count
      FROM recurring_entries re LEFT JOIN users u ON re.created_by = u.id WHERE re.company_id = $1 ORDER BY re.name
    `, [req.user.company_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/recurring-entries/:id', async (req, res) => {
  try {
    const entry = await db.query('SELECT * FROM recurring_entries WHERE id = $1 AND company_id = $2', [req.params.id, req.user.company_id]);
    if (entry.rows.length === 0) return res.status(404).json({ error: 'Recurring entry not found' });
    const lines = await db.query(`
      SELECT rel.*, ca.account_code, ca.account_name, cc.name as cost_center_name
      FROM recurring_entry_lines rel
      LEFT JOIN chart_of_accounts ca ON rel.account_id = ca.id
      LEFT JOIN cost_centers cc ON rel.cost_center_id = cc.id
      WHERE rel.recurring_entry_id = $1
    `, [req.params.id]);
    res.json({ ...entry.rows[0], lines: lines.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/recurring-entries', async (req, res) => {
  const client = await db.connect();
  try {
    const { name, description, voucher_type, frequency, interval_value, start_date, end_date,
      day_of_month, day_of_week, total_occurrences, lines } = req.body;
    if (!name || !frequency || !start_date || !lines || lines.length < 2)
      return res.status(400).json({ error: 'Name, frequency, start_date, and at least 2 lines are required' });

    await client.query('BEGIN');
    const entry = await client.query(`
      INSERT INTO recurring_entries (company_id, name, description, voucher_type, frequency, interval_value,
        start_date, end_date, next_date, day_of_month, day_of_week, total_occurrences, created_by, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $7, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *
    `, [req.user.company_id, name, description, voucher_type || 'Journal', frequency, interval_value || 1,
      start_date, end_date, day_of_month, day_of_week, total_occurrences, req.user.id]);

    for (const line of lines) {
      await client.query(`
        INSERT INTO recurring_entry_lines (recurring_entry_id, account_id, cost_center_id, debit, credit, narration)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [entry.rows[0].id, line.account_id, line.cost_center_id || null, line.debit || 0, line.credit || 0, line.narration]);
    }

    await client.query('COMMIT');
    res.status(201).json(entry.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.put('/recurring-entries/:id', async (req, res) => {
  const client = await db.connect();
  try {
    const { name, description, frequency, interval_value, end_date, day_of_month, day_of_week,
      total_occurrences, status, lines } = req.body;

    await client.query('BEGIN');
    await client.query(`
      UPDATE recurring_entries SET name = COALESCE($1, name), description = COALESCE($2, description),
        frequency = COALESCE($3, frequency), interval_value = COALESCE($4, interval_value),
        end_date = $5, day_of_month = COALESCE($6, day_of_month), day_of_week = COALESCE($7, day_of_week),
        total_occurrences = COALESCE($8, total_occurrences), status = COALESCE($9, status), updated_at = CURRENT_TIMESTAMP
      WHERE id = $10 AND company_id = $11
    `, [name, description, frequency, interval_value, end_date || null, day_of_month, day_of_week,
      total_occurrences, status, req.params.id, req.user.company_id]);

    if (lines) {
      await client.query('DELETE FROM recurring_entry_lines WHERE recurring_entry_id = $1', [req.params.id]);
      for (const line of lines) {
        await client.query(`
          INSERT INTO recurring_entry_lines (recurring_entry_id, account_id, cost_center_id, debit, credit, narration)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [req.params.id, line.account_id, line.cost_center_id || null, line.debit || 0, line.credit || 0, line.narration]);
      }
    }

    await client.query('COMMIT');
    const result = await db.query('SELECT * FROM recurring_entries WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.delete('/recurring-entries/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM recurring_entries WHERE id = $1 AND company_id = $2', [req.params.id, req.user.company_id]);
    res.json({ message: 'Recurring entry deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/recurring-entries/:id/generate', async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const entry = await client.query('SELECT * FROM recurring_entries WHERE id = $1 AND company_id = $2 AND status = $3',
      [req.params.id, req.user.company_id, 'active']);
    if (entry.rows.length === 0) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Active recurring entry not found' }); }

    const re = entry.rows[0];
    if (re.total_occurrences && re.occurrences_generated >= re.total_occurrences) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'All occurrences have been generated' });
    }

    const lines = await client.query('SELECT * FROM recurring_entry_lines WHERE recurring_entry_id = $1', [req.params.id]);
    if (lines.rows.length < 2) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Need at least 2 lines' }); }

    const voucherNo = `AUTO-${re.name.substring(0, 3).toUpperCase()}-${Date.now()}`;
    let totalDebit = 0, totalCredit = 0;
    lines.rows.forEach(l => { totalDebit += parseFloat(l.debit || 0); totalCredit += parseFloat(l.credit || 0); });

    const je = await client.query(`
      INSERT INTO journal_entries (company_id, voucher_no, voucher_type, entry_date, description, total_debit, total_credit, status, created_by, created_at, updated_at)
      VALUES ($1, $2, $3, CURRENT_DATE, $4, $5, $6, 'approved', $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *
    `, [req.user.company_id, voucherNo, re.voucher_type, re.name, totalDebit, totalCredit, req.user.id]);

    for (const line of lines.rows) {
      await client.query(`
        INSERT INTO journal_entry_lines (journal_entry_id, account_id, cost_center_id, debit, credit, narration)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [je.rows[0].id, line.account_id, line.cost_center_id, line.debit, line.credit, line.narration]);
    }

    // Calculate next date
    let nextDate = null;
    if (re.frequency === 'monthly') {
      nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + (re.interval_value || 1));
    } else if (re.frequency === 'weekly') {
      nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 7 * (re.interval_value || 1));
    } else if (re.frequency === 'yearly') {
      nextDate = new Date();
      nextDate.setFullYear(nextDate.getFullYear() + (re.interval_value || 1));
    }

    await client.query(`
      UPDATE recurring_entries SET last_generated = CURRENT_DATE, next_date = $1,
        occurrences_generated = occurrences_generated + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
    `, [nextDate, req.params.id]);

    if (re.total_occurrences && (re.occurrences_generated + 1) >= re.total_occurrences) {
      await client.query('UPDATE recurring_entries SET status = $1 WHERE id = $2', ['completed', req.params.id]);
    }

    await client.query('COMMIT');
    res.json({ message: 'Journal entry created', voucher_no: voucherNo });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ==================== FINANCIAL RATIOS ====================
router.get('/reports/financial-ratios', async (req, res) => {
  try {
    const { as_of } = req.query;
    const asOfDate = as_of || new Date().toISOString().split('T')[0];

    // Current Assets
    const currentAssets = await db.query(`
      SELECT COALESCE(SUM(jel.debit - jel.credit), 0) as balance FROM chart_of_accounts ca
      JOIN journal_entry_lines jel ON ca.id = jel.account_id
      JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.status IN ('approved', 'posted') AND je.entry_date <= $1
      WHERE ca.company_id = $2 AND ca.account_type = 'Asset' AND ca.is_active = true AND ca.account_code LIKE '1%'
    `, [asOfDate, req.user.company_id]);

    // Current Liabilities
    const currentLiabilities = await db.query(`
      SELECT COALESCE(SUM(jel.credit - jel.debit), 0) as balance FROM chart_of_accounts ca
      JOIN journal_entry_lines jel ON ca.id = jel.account_id
      JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.status IN ('approved', 'posted') AND je.entry_date <= $1
      WHERE ca.company_id = $2 AND ca.account_type = 'Liability' AND ca.is_active = true AND ca.account_code LIKE '2%'
    `, [asOfDate, req.user.company_id]);

    // Total Assets
    const totalAssets = await db.query(`
      SELECT COALESCE(SUM(jel.debit - jel.credit), 0) as balance FROM chart_of_accounts ca
      JOIN journal_entry_lines jel ON ca.id = jel.account_id
      JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.status IN ('approved', 'posted') AND je.entry_date <= $1
      WHERE ca.company_id = $2 AND ca.account_type = 'Asset' AND ca.is_active = true
    `, [asOfDate, req.user.company_id]);

    // Total Liabilities
    const totalLiabilities = await db.query(`
      SELECT COALESCE(SUM(jel.credit - jel.debit), 0) as balance FROM chart_of_accounts ca
      JOIN journal_entry_lines jel ON ca.id = jel.account_id
      JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.status IN ('approved', 'posted') AND je.entry_date <= $1
      WHERE ca.company_id = $2 AND ca.account_type = 'Liability' AND ca.is_active = true
    `, [asOfDate, req.user.company_id]);

    // Total Equity
    const totalEquity = await db.query(`
      SELECT COALESCE(SUM(jel.credit - jel.debit), 0) as balance FROM chart_of_accounts ca
      JOIN journal_entry_lines jel ON ca.id = jel.account_id
      JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.status IN ('approved', 'posted') AND je.entry_date <= $1
      WHERE ca.company_id = $2 AND ca.account_type = 'Equity' AND ca.is_active = true
    `, [asOfDate, req.user.company_id]);

    // Income (current year)
    const income = await db.query(`
      SELECT COALESCE(SUM(jel.credit - jel.debit), 0) as balance FROM chart_of_accounts ca
      JOIN journal_entry_lines jel ON ca.id = jel.account_id
      JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.status IN ('approved', 'posted')
        AND EXTRACT(YEAR FROM je.entry_date) = EXTRACT(YEAR FROM $1::DATE)
      WHERE ca.company_id = $2 AND ca.account_type = 'Income' AND ca.is_active = true
    `, [asOfDate, req.user.company_id]);

    const ca = parseFloat(currentAssets.rows[0].balance);
    const cl = parseFloat(currentLiabilities.rows[0].balance);
    const ta = parseFloat(totalAssets.rows[0].balance);
    const tl = parseFloat(totalLiabilities.rows[0].balance);
    const te = parseFloat(totalEquity.rows[0].balance);
    const inc = parseFloat(income.rows[0].balance);

    res.json({
      current_ratio: cl > 0 ? (ca / cl).toFixed(2) : null,
      quick_ratio: cl > 0 ? ((ca) / cl).toFixed(2) : null,
      debt_to_equity: te > 0 ? (tl / te).toFixed(2) : null,
      return_on_equity: te > 0 ? ((inc / te) * 100).toFixed(1) : null,
      profit_margin: inc > 0 ? 'N/A' : null,
      as_of_date: asOfDate,
      details: {
        current_assets: ca,
        current_liabilities: cl,
        total_assets: ta,
        total_liabilities: tl,
        total_equity: te,
        net_income: inc
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
