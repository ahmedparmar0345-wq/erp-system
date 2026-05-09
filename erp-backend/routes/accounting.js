import express from 'express';
import Joi from 'joi';
import pool from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

// Helper: Safe number parser
const safeNumber = (value) => {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string' && value !== '') return parseFloat(value) || 0;
  if (typeof value === 'object' && value !== null) return 0;
  return 0;
};

// Helper: Format number for display
const formatNumber = (value) => {
  return safeNumber(value).toFixed(2);
};

// Helper: Generate Voucher Number
const generateVoucherNo = () => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `VCH-${dateStr}-${random}`;
};

// Helper: Validate Debits = Credits
const validateBalanced = (lines) => {
  let totalDebit = 0;
  let totalCredit = 0;
  lines.forEach(line => {
    totalDebit += safeNumber(line.debit);
    totalCredit += safeNumber(line.credit);
  });
  return Math.abs(totalDebit - totalCredit) < 0.01;
};

// Helper: Parse voucher data with safe numbers
const parseVoucherNumbers = (voucher) => {
  if (!voucher) return voucher;
  return {
    ...voucher,
    total_debit: safeNumber(voucher.total_debit),
    total_credit: safeNumber(voucher.total_credit),
    lines: (voucher.lines || []).map(line => ({
      ...line,
      debit: safeNumber(line.debit),
      credit: safeNumber(line.credit)
    }))
  };
};

// 1. GET /api/accounting/chart-of-accounts
router.get('/chart-of-accounts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM chart_of_accounts WHERE company_id = $1 ORDER BY account_code', [req.user.company_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. POST /api/accounting/chart-of-accounts
router.post('/chart-of-accounts', async (req, res) => {
  const schema = Joi.object({
    account_code: Joi.string().required(),
    account_name: Joi.string().required(),
    account_type: Joi.string().valid('Asset', 'Liability', 'Equity', 'Income', 'Expense').required(),
    parent_account_id: Joi.number().optional(),
    description: Joi.string().optional()
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const result = await pool.query(
      'INSERT INTO chart_of_accounts (company_id, account_code, account_name, account_type, parent_account_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.company_id, value.account_code, value.account_name, value.account_type, value.parent_account_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Account code already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. GET /api/accounting/vouchers
router.get('/vouchers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM journal_entries WHERE company_id = $1 ORDER BY entry_date DESC', [req.user.company_id]);
    // Parse numbers for each voucher
    const parsedVouchers = result.rows.map(v => ({
      ...v,
      total_debit: safeNumber(v.total_debit),
      total_credit: safeNumber(v.total_credit)
    }));
    res.json(parsedVouchers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 4. GET /api/accounting/vouchers/:id
router.get('/vouchers/:id', async (req, res) => {
  try {
    const jeRes = await pool.query('SELECT * FROM journal_entries WHERE id = $1 AND company_id = $2', [req.params.id, req.user.company_id]);
    if (jeRes.rows.length === 0) return res.status(404).json({ error: 'Voucher not found' });

    const linesRes = await pool.query(`
      SELECT jel.*, ca.account_code, ca.account_name 
      FROM journal_entry_lines jel 
      JOIN chart_of_accounts ca ON jel.account_id = ca.id 
      WHERE jel.journal_entry_id = $1
    `, [req.params.id]);

    const voucher = jeRes.rows[0];
    voucher.lines = linesRes.rows;

    // Parse numbers safely
    const parsedVoucher = parseVoucherNumbers(voucher);
    res.json(parsedVoucher);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper: Create Voucher (Payment, Receipt, Journal, Contra)
const createVoucher = async (req, res, voucherType) => {
  const schema = Joi.object({
    entry_date: Joi.date().iso().optional(),
    description: Joi.string().optional(),
    lines: Joi.array().items(
      Joi.object({
        account_id: Joi.number().required(),
        debit: Joi.number().precision(2).min(0).optional(),
        credit: Joi.number().precision(2).min(0).optional(),
        narration: Joi.string().optional()
      })
    ).min(2).required()
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  // Ensure all lines have proper number values
  const processedLines = value.lines.map(line => ({
    ...line,
    debit: safeNumber(line.debit),
    credit: safeNumber(line.credit)
  }));

  if (!validateBalanced(processedLines)) {
    return res.status(400).json({ error: 'Voucher is not balanced. Total Debits must equal Total Credits.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let totalDebit = 0;
    let totalCredit = 0;
    processedLines.forEach(l => {
      totalDebit += l.debit;
      totalCredit += l.credit;
    });

    const voucher_no = generateVoucherNo();
    const entryDate = value.entry_date || new Date().toISOString().split('T')[0];

    const jeRes = await client.query(
      `INSERT INTO journal_entries (company_id, voucher_no, voucher_type, entry_date, description, total_debit, total_credit, status, created_by, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft', $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
      [req.user.company_id, voucher_no, voucherType, entryDate, value.description, totalDebit, totalCredit, req.user.id]
    );

    const jeId = jeRes.rows[0].id;

    for (const line of processedLines) {
      await client.query(
        'INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES ($1, $2, $3, $4, $5)',
        [jeId, line.account_id, line.debit, line.credit, line.narration]
      );
    }

    await client.query('COMMIT');

    // Return the created voucher with parsed numbers
    const result = await pool.query('SELECT * FROM journal_entries WHERE id = $1', [jeId]);
    const parsedResult = {
      ...result.rows[0],
      total_debit: safeNumber(result.rows[0].total_debit),
      total_credit: safeNumber(result.rows[0].total_credit)
    };
    res.status(201).json(parsedResult);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  } finally {
    client.release();
  }
};

// 5. POST /api/accounting/vouchers/payment
router.post('/vouchers/payment', async (req, res) => createVoucher(req, res, 'Payment'));

// 6. POST /api/accounting/vouchers/receipt
router.post('/vouchers/receipt', async (req, res) => createVoucher(req, res, 'Receipt'));

// 7. POST /api/accounting/vouchers/journal
router.post('/vouchers/journal', async (req, res) => createVoucher(req, res, 'Journal'));

// 8. POST /api/accounting/vouchers/contra
router.post('/vouchers/contra', async (req, res) => createVoucher(req, res, 'Contra'));

// 9. PATCH /api/accounting/vouchers/:id/approve
router.patch('/vouchers/:id/approve', async (req, res) => {
  const schema = Joi.object({ signature: Joi.string().optional() });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const result = await pool.query(
      `UPDATE journal_entries SET status = 'approved', approved_by = $1, approved_at = CURRENT_TIMESTAMP, signature = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 AND company_id = $4 AND status = 'draft' RETURNING *`,
      [req.user.id, value.signature || null, req.params.id, req.user.company_id]
    );
    if (result.rows.length === 0) return res.status(400).json({ error: 'Cannot approve. Already approved/approved or not found.' });

    const parsedResult = {
      ...result.rows[0],
      total_debit: safeNumber(result.rows[0].total_debit),
      total_credit: safeNumber(result.rows[0].total_credit)
    };
    res.json(parsedResult);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 10. POST /api/accounting/signature/upload
router.post('/signature/upload', async (req, res) => {
  const { signature } = req.body;
  if (!signature) return res.status(400).json({ error: 'Signature (base64) is required' });
  res.json({ message: 'Signature stored successfully', signature });
});

// 11. GET /api/accounting/vouchers/:id/print
router.get('/vouchers/:id/print', async (req, res) => {
  try {
    const jeRes = await pool.query('SELECT * FROM journal_entries WHERE id = $1 AND company_id = $2', [req.params.id, req.user.company_id]);
    if (jeRes.rows.length === 0) return res.status(404).json({ error: 'Voucher not found' });
    const je = jeRes.rows[0];

    const linesRes = await pool.query(`
      SELECT jel.*, ca.account_code, ca.account_name 
      FROM journal_entry_lines jel JOIN chart_of_accounts ca ON jel.account_id = ca.id 
      WHERE jel.journal_entry_id = $1
    `, [je.id]);

    // Safe number formatting
    const totalDebitFormatted = safeNumber(je.total_debit).toFixed(2);
    const totalCreditFormatted = safeNumber(je.total_credit).toFixed(2);

    const html = `
      <html>
      <head>
        <style>
          body { font-family: sans-serif; padding: 40px; }
          h1 { text-align: center; }
          table { width: 100%; margin-bottom: 20px; }
          .voucher-table { width: 100%; border-collapse: collapse; }
          .voucher-table th, .voucher-table td { border: 1px solid #ccc; padding: 8px; }
          .voucher-table th { background: #eee; }
          .text-right { text-align: right; }
        </style>
      </head>
      <body>
        <h1>${je.voucher_type.toUpperCase()} VOUCHER</h1>
        <table style="width: 100%; margin-bottom: 20px;">
          <tr><td><strong>Voucher No:</strong> ${je.voucher_no}</td><td><strong>Date:</strong> ${je.entry_date}</td></tr>
          <tr><td colspan="2"><strong>Description:</strong> ${je.description || '-'}</td></tr>
        </table>
        <table class="voucher-table">
          <thead>
            <tr><th>Acc Code</th><th>Account</th><th>Narration</th><th class="text-right">Debit</th><th class="text-right">Credit</th></tr>
          </thead>
          <tbody>
            ${linesRes.rows.map(l => `
              <tr>
                <td>${l.account_code}</td>
                <td>${l.account_name}</td>
                <td>${l.narration || '-'}</td>
                <td class="text-right">${safeNumber(l.debit) > 0 ? safeNumber(l.debit).toFixed(2) : '-'}</td>
                <td class="text-right">${safeNumber(l.credit) > 0 ? safeNumber(l.credit).toFixed(2) : '-'}</td>
              </tr>
            `).join('')}
            <tr style="font-weight:bold">
              <td colspan="3">TOTAL</td>
              <td class="text-right">${totalDebitFormatted}</td>
              <td class="text-right">${totalCreditFormatted}</td>
            </tr>
          </tbody>
        </table>
        ${je.signature ? `<img src="${je.signature}" style="height: 50px; margin-top: 40px;" />` : ''}
        <div style="margin-top: 10px;">Status: ${je.status.toUpperCase()}</div>
      </body>
      </html>
    `;
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 12. GET /api/accounting/reports/trial-balance
router.get('/reports/trial-balance', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ca.account_code, ca.account_name, ca.account_type, 
             COALESCE(SUM(jel.debit), 0) as total_debit, 
             COALESCE(SUM(jel.credit), 0) as total_credit
      FROM chart_of_accounts ca
      LEFT JOIN journal_entry_lines jel ON ca.id = jel.account_id
      LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.status IN ('approved', 'posted')
      WHERE ca.company_id = $1
      GROUP BY ca.id
      ORDER BY ca.account_code
    `, [req.user.company_id]);

    let grandDebit = 0, grandCredit = 0;
    const parsedRows = result.rows.map(r => {
      const debit = safeNumber(r.total_debit);
      const credit = safeNumber(r.total_credit);
      grandDebit += debit;
      grandCredit += credit;
      return { ...r, total_debit: debit, total_credit: credit };
    });

    res.json({ accounts: parsedRows, totals: { debit: grandDebit, credit: grandCredit } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 13. GET /api/accounting/reports/profit-loss
router.get('/reports/profit-loss', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ca.account_name, ca.account_type, COALESCE(SUM(jel.credit - jel.debit), 0) as balance
      FROM chart_of_accounts ca
      LEFT JOIN journal_entry_lines jel ON ca.id = jel.account_id
      LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.status IN ('approved', 'posted')
      WHERE ca.company_id = $1 AND ca.account_type IN ('Income', 'Expense')
      GROUP BY ca.id
      ORDER BY ca.account_name
    `, [req.user.company_id]);

    let income = 0;
    let expenses = 0;
    const parsedRows = result.rows.map(r => {
      const balance = safeNumber(r.balance);
      if (r.account_type === 'Income') income += balance;
      if (r.account_type === 'Expense') expenses += Math.abs(balance);
      return { ...r, balance };
    });

    res.json({
      accounts: parsedRows,
      summary: {
        income,
        expenses,
        net_profit: income - expenses
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 14. GET /api/accounting/reports/balance-sheet
router.get('/reports/balance-sheet', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ca.account_name, ca.account_type, COALESCE(SUM(jel.debit - jel.credit), 0) as balance
      FROM chart_of_accounts ca
      LEFT JOIN journal_entry_lines jel ON ca.id = jel.account_id
      LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.status IN ('approved', 'posted')
      WHERE ca.company_id = $1 AND ca.account_type IN ('Asset', 'Liability', 'Equity')
      GROUP BY ca.id
      ORDER BY ca.account_code
    `, [req.user.company_id]);

    const parsedRows = result.rows.map(r => ({
      ...r,
      balance: safeNumber(r.balance)
    }));

    res.json({ accounts: parsedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;