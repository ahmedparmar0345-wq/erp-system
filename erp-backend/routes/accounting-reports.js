import express from 'express';
import pool from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

// ==================== BALANCE SHEET ====================
router.get('/balance-sheet', async (req, res) => {
  try {
    const { as_of } = req.query;
    const asOfDate = as_of || new Date().toISOString().split('T')[0];

    const result = await pool.query(`
            SELECT ca.account_name, ca.account_type, 
                   COALESCE(SUM(jel.debit - jel.credit), 0) as balance
            FROM chart_of_accounts ca
            LEFT JOIN journal_entry_lines jel ON ca.id = jel.account_id
            LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id 
                AND je.status IN ('approved', 'posted')
                AND je.entry_date <= $1
            WHERE ca.company_id = $2 AND ca.is_active = true
            GROUP BY ca.id, ca.account_name, ca.account_type
            ORDER BY ca.account_code
        `, [asOfDate, req.user.company_id]);

    const assets = [];
    const liabilities = [];
    const equity = [];

    result.rows.forEach(row => {
      const balance = parseFloat(row.balance);
      const item = { account_name: row.account_name, balance: Math.abs(balance) };

      if (row.account_type === 'Asset') {
        assets.push(item);
      } else if (row.account_type === 'Liability') {
        liabilities.push(item);
      } else if (row.account_type === 'Equity') {
        equity.push(item);
      }
    });

    res.json({ assets, liabilities, equity });
  } catch (err) {
    console.error('Error generating balance sheet:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== INCOME STATEMENT (P&L) ====================
router.get('/income-statement', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const startDate = start_date || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const endDate = end_date || new Date().toISOString().split('T')[0];

    const result = await pool.query(`
            SELECT ca.account_name, ca.account_type,
                   COALESCE(SUM(jel.credit - jel.debit), 0) as amount
            FROM chart_of_accounts ca
            LEFT JOIN journal_entry_lines jel ON ca.id = jel.account_id
            LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id 
                AND je.status IN ('approved', 'posted')
                AND je.entry_date BETWEEN $1 AND $2
            WHERE ca.company_id = $3 
                AND ca.account_type IN ('Income', 'Expense')
                AND ca.is_active = true
            GROUP BY ca.id, ca.account_name, ca.account_type
            ORDER BY ca.account_type, ca.account_name
        `, [startDate, endDate, req.user.company_id]);

    const revenue = [];
    const expenses = [];
    let totalRevenue = 0;
    let totalExpenses = 0;

    result.rows.forEach(row => {
      const amount = parseFloat(row.amount);
      if (row.account_type === 'Income') {
        revenue.push({ account_name: row.account_name, amount: amount });
        totalRevenue += amount;
      } else {
        expenses.push({ account_name: row.account_name, amount: Math.abs(amount) });
        totalExpenses += Math.abs(amount);
      }
    });

    res.json({
      revenue,
      expenses,
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      net_profit: totalRevenue - totalExpenses,
      start_date: startDate,
      end_date: endDate
    });
  } catch (err) {
    console.error('Error generating income statement:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== TRIAL BALANCE ====================
router.get('/trial-balance', async (req, res) => {
  try {
    const { as_of } = req.query;
    const asOfDate = as_of || new Date().toISOString().split('T')[0];

    const result = await pool.query(`
            SELECT ca.account_code, ca.account_name, ca.account_type,
                   COALESCE(SUM(jel.debit), 0) as total_debit,
                   COALESCE(SUM(jel.credit), 0) as total_credit
            FROM chart_of_accounts ca
            LEFT JOIN journal_entry_lines jel ON ca.id = jel.account_id
            LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id 
                AND je.status IN ('approved', 'posted')
                AND je.entry_date <= $1
            WHERE ca.company_id = $2 AND ca.is_active = true
            GROUP BY ca.id, ca.account_code, ca.account_name, ca.account_type
            ORDER BY ca.account_code
        `, [asOfDate, req.user.company_id]);

    let totalDebit = 0;
    let totalCredit = 0;

    const accounts = result.rows.map(row => {
      const debit = parseFloat(row.total_debit);
      const credit = parseFloat(row.total_credit);
      totalDebit += debit;
      totalCredit += credit;
      return {
        account_code: row.account_code,
        account_name: row.account_name,
        account_type: row.account_type,
        debit: debit,
        credit: credit
      };
    });

    res.json({ accounts, total_debit: totalDebit, total_credit: totalCredit });
  } catch (err) {
    console.error('Error generating trial balance:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== ACCOUNTS RECEIVABLE ====================
router.get('/accounts-receivable', async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT c.id, c.name, c.email, c.phone,
                   COALESCE(SUM(so.grand_total - COALESCE(so.paid_amount, 0)), 0) as total_due,
                   COUNT(so.id) as invoice_count,
                   MAX(so.order_date) as last_invoice_date,
                   MIN(so.order_date) as first_invoice_date
            FROM customers c
            LEFT JOIN sales_orders so ON c.id = so.customer_id 
                AND so.status IN ('confirmed', 'shipped', 'invoiced')
                AND (so.paid_amount IS NULL OR so.paid_amount < so.grand_total)
            WHERE c.company_id = $1
            GROUP BY c.id, c.name, c.email, c.phone
            HAVING COALESCE(SUM(so.grand_total - COALESCE(so.paid_amount, 0)), 0) > 0
            ORDER BY total_due DESC
        `, [req.user.company_id]);

    // Calculate aging for each customer
    const today = new Date();
    const customersWithAging = await Promise.all(result.rows.map(async (customer) => {
      const agingResult = await pool.query(`
                SELECT 
                    COALESCE(SUM(CASE WHEN so.order_date >= CURRENT_DATE - INTERVAL '30 days' THEN so.grand_total - COALESCE(so.paid_amount, 0) ELSE 0 END), 0) as current_30,
                    COALESCE(SUM(CASE WHEN so.order_date < CURRENT_DATE - INTERVAL '30 days' AND so.order_date >= CURRENT_DATE - INTERVAL '60 days' THEN so.grand_total - COALESCE(so.paid_amount, 0) ELSE 0 END), 0) as days_31_60,
                    COALESCE(SUM(CASE WHEN so.order_date < CURRENT_DATE - INTERVAL '60 days' AND so.order_date >= CURRENT_DATE - INTERVAL '90 days' THEN so.grand_total - COALESCE(so.paid_amount, 0) ELSE 0 END), 0) as days_61_90,
                    COALESCE(SUM(CASE WHEN so.order_date < CURRENT_DATE - INTERVAL '90 days' THEN so.grand_total - COALESCE(so.paid_amount, 0) ELSE 0 END), 0) as days_90_plus
                FROM sales_orders so
                WHERE so.customer_id = $1 
                    AND so.status IN ('confirmed', 'shipped', 'invoiced')
                    AND (so.paid_amount IS NULL OR so.paid_amount < so.grand_total)
            `, [customer.id]);

      return {
        ...customer,
        aging: agingResult.rows[0]
      };
    }));

    res.json(customersWithAging);
  } catch (err) {
    console.error('Error generating accounts receivable:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== ACCOUNTS PAYABLE ====================
router.get('/accounts-payable', async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT s.id, s.name, s.email, s.phone,
                   COALESCE(SUM(po.total_amount), 0) as total_due,
                   COUNT(po.id) as po_count,
                   MAX(po.order_date) as last_po_date
            FROM suppliers s
            LEFT JOIN purchase_orders po ON s.id = po.supplier_id 
                AND po.status IN ('sent', 'received')
            WHERE s.company_id = $1
            GROUP BY s.id, s.name, s.email, s.phone
            HAVING COALESCE(SUM(po.total_amount), 0) > 0
            ORDER BY total_due DESC
        `, [req.user.company_id]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error generating accounts payable:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== CASH FLOW ====================
router.get('/cash-flow', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const startDate = start_date || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const endDate = end_date || new Date().toISOString().split('T')[0];

    // Operating Cash Flow (Sales - Expenses)
    const operating = await pool.query(`
            SELECT 
                COALESCE(SUM(CASE WHEN ca.account_type = 'Income' THEN jel.credit - jel.debit ELSE 0 END), 0) as cash_inflow,
                COALESCE(SUM(CASE WHEN ca.account_type = 'Expense' THEN jel.debit - jel.credit ELSE 0 END), 0) as cash_outflow
            FROM journal_entry_lines jel
            JOIN chart_of_accounts ca ON jel.account_id = ca.id
            JOIN journal_entries je ON jel.journal_entry_id = je.id
            WHERE ca.company_id = $1 
                AND je.status IN ('approved', 'posted')
                AND je.entry_date BETWEEN $2 AND $3
        `, [req.user.company_id, startDate, endDate]);

    // Investing Cash Flow (Asset purchases/sales)
    const investing = await pool.query(`
            SELECT COALESCE(SUM(jel.debit - jel.credit), 0) as net_cash
            FROM journal_entry_lines jel
            JOIN chart_of_accounts ca ON jel.account_id = ca.id
            JOIN journal_entries je ON jel.journal_entry_id = je.id
            WHERE ca.company_id = $1 
                AND ca.account_type = 'Asset'
                AND je.status IN ('approved', 'posted')
                AND je.entry_date BETWEEN $2 AND $3
        `, [req.user.company_id, startDate, endDate]);

    // Financing Cash Flow (Loans, Equity)
    const financing = await pool.query(`
            SELECT COALESCE(SUM(jel.debit - jel.credit), 0) as net_cash
            FROM journal_entry_lines jel
            JOIN chart_of_accounts ca ON jel.account_id = ca.id
            JOIN journal_entries je ON jel.journal_entry_id = je.id
            WHERE ca.company_id = $1 
                AND ca.account_type IN ('Liability', 'Equity')
                AND je.status IN ('approved', 'posted')
                AND je.entry_date BETWEEN $2 AND $3
        `, [req.user.company_id, startDate, endDate]);

    const operatingCashFlow = parseFloat(operating.rows[0].cash_inflow) - parseFloat(operating.rows[0].cash_outflow);
    const investingCashFlow = parseFloat(investing.rows[0].net_cash);
    const financingCashFlow = parseFloat(financing.rows[0].net_cash);
    const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;

    res.json({
      operating: { inflow: parseFloat(operating.rows[0].cash_inflow), outflow: parseFloat(operating.rows[0].cash_outflow), net: operatingCashFlow },
      investing: { net: investingCashFlow },
      financing: { net: financingCashFlow },
      net_cash_flow: netCashFlow,
      start_date: startDate,
      end_date: endDate
    });
  } catch (err) {
    console.error('Error generating cash flow:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== GENERAL LEDGER ====================
router.get('/general-ledger', async (req, res) => {
  try {
    const { account_id, start_date, end_date } = req.query;
    let query = `
            SELECT je.entry_date, je.voucher_no, je.voucher_type, je.description,
                   ca.account_code, ca.account_name, jel.debit, jel.credit,
                   SUM(jel.debit - jel.credit) OVER (ORDER BY je.entry_date, je.id) as running_balance
            FROM journal_entry_lines jel
            JOIN journal_entries je ON jel.journal_entry_id = je.id
            JOIN chart_of_accounts ca ON jel.account_id = ca.id
            WHERE ca.company_id = $1 AND je.status IN ('approved', 'posted')
        `;
    const params = [req.user.company_id];
    let paramCount = 2;

    if (account_id) {
      query += ` AND jel.account_id = $${paramCount}`;
      params.push(account_id);
      paramCount++;
    }

    if (start_date) {
      query += ` AND je.entry_date >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND je.entry_date <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    query += ` ORDER BY je.entry_date, je.id`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error generating general ledger:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== TAX SUMMARY ====================
router.get('/tax-summary', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const startDate = start_date || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const endDate = end_date || new Date().toISOString().split('T')[0];

    // Sales Tax (from invoices with proper tax_total)
    const invoiceTax = await pool.query(`
      SELECT COALESCE(SUM(tax_total), 0) as tax_collected
      FROM invoices
      WHERE company_id = $1 AND status IN ('draft', 'sent', 'paid')
        AND invoice_date BETWEEN $2 AND $3
    `, [req.user.company_id, startDate, endDate]);

    // Service Invoice Tax
    const serviceTax = await pool.query(`
      SELECT COALESCE(SUM(tax_total), 0) as tax_collected
      FROM service_invoices
      WHERE company_id = $1 AND status IN ('draft', 'sent', 'paid')
        AND invoice_date BETWEEN $2 AND $3
    `, [req.user.company_id, startDate, endDate]);

    // Purchase Tax (from purchase orders)
    const purchaseTax = await pool.query(`
      SELECT COALESCE(SUM(tax_total), 0) as tax_paid
      FROM purchase_orders
      WHERE company_id = $1 AND status IN ('sent', 'received')
        AND order_date BETWEEN $2 AND $3
    `, [req.user.company_id, startDate, endDate]);

    const salesTaxTotal = parseFloat(invoiceTax.rows[0].tax_collected) + parseFloat(serviceTax.rows[0].tax_collected);

    res.json({
      sales_tax_collected: salesTaxTotal,
      purchase_tax_paid: parseFloat(purchaseTax.rows[0].tax_paid),
      net_tax_payable: salesTaxTotal - parseFloat(purchaseTax.rows[0].tax_paid),
      start_date: startDate,
      end_date: endDate
    });
  } catch (err) {
    console.error('Error generating tax summary:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== DASHBOARD STATS ====================
router.get('/dashboard-stats', async (req, res) => {
  try {
    const receivables = await pool.query(`
            SELECT COALESCE(SUM(so.grand_total - COALESCE(so.paid_amount, 0)), 0) as total
            FROM sales_orders so
            WHERE so.company_id = $1 
                AND so.status IN ('confirmed', 'shipped', 'invoiced')
                AND so.grand_total > COALESCE(so.paid_amount, 0)
        `, [req.user.company_id]);

    const payables = await pool.query(`
            SELECT COALESCE(SUM(po.total_amount), 0) as total
            FROM purchase_orders po
            WHERE po.company_id = $1 
                AND po.status IN ('sent', 'received')
        `, [req.user.company_id]);

    const cashBalance = await pool.query(`
            SELECT COALESCE(SUM(jel.debit - jel.credit), 0) as balance
            FROM journal_entry_lines jel
            JOIN chart_of_accounts ca ON jel.account_id = ca.id
            JOIN journal_entries je ON jel.journal_entry_id = je.id
            WHERE ca.company_id = $1 
                AND (ca.account_name ILIKE '%cash%' OR ca.account_name ILIKE '%bank%')
                AND je.status IN ('approved', 'posted')
        `, [req.user.company_id]);

    const revenueTrend = await pool.query(`
            SELECT TO_CHAR(je.entry_date, 'YYYY-MM') as month,
                   COALESCE(SUM(jel.credit - jel.debit), 0) as revenue
            FROM journal_entry_lines jel
            JOIN chart_of_accounts ca ON jel.account_id = ca.id
            JOIN journal_entries je ON jel.journal_entry_id = je.id
            WHERE ca.company_id = $1 
                AND ca.account_type = 'Income'
                AND je.status IN ('approved', 'posted')
                AND je.entry_date >= NOW() - INTERVAL '6 months'
            GROUP BY TO_CHAR(je.entry_date, 'YYYY-MM')
            ORDER BY month DESC
        `, [req.user.company_id]);

    res.json({
      total_receivables: parseFloat(receivables.rows[0].total) || 0,
      total_payables: parseFloat(payables.rows[0].total) || 0,
      cash_balance: parseFloat(cashBalance.rows[0].balance) || 0,
      revenue_trend: revenueTrend.rows
    });
  } catch (err) {
    console.error('Error generating dashboard stats:', err);
    res.status(500).json({ error: err.message });
  }
});
// ==================== DASHBOARD CHARTS DATA ====================

// Monthly Revenue & Expenses for Chart
router.get('/charts/monthly-trend', async (req, res) => {
  try {
    const { months = 6 } = req.query;

    const result = await pool.query(`
            SELECT 
                TO_CHAR(DATE_TRUNC('month', je.entry_date), 'Mon YYYY') as month,
                TO_CHAR(DATE_TRUNC('month', je.entry_date), 'YYYY-MM') as sort_date,
                COALESCE(SUM(CASE WHEN ca.account_type = 'Income' THEN jel.credit - jel.debit ELSE 0 END), 0) as revenue,
                COALESCE(SUM(CASE WHEN ca.account_type = 'Expense' THEN jel.debit - jel.credit ELSE 0 END), 0) as expenses
            FROM journal_entry_lines jel
            JOIN chart_of_accounts ca ON jel.account_id = ca.id
            JOIN journal_entries je ON jel.journal_entry_id = je.id
            WHERE ca.company_id = $1 
                AND je.status IN ('approved', 'posted')
                AND je.entry_date >= NOW() - ($2 || ' months')::INTERVAL
            GROUP BY DATE_TRUNC('month', je.entry_date)
            ORDER BY DATE_TRUNC('month', je.entry_date) ASC
        `, [req.user.company_id, months]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching monthly trend:', err);
    res.status(500).json({ error: err.message });
  }
});

// Top Products by Sales
router.get('/charts/top-products', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const result = await pool.query(`
            SELECT 
                p.name as product_name,
                COALESCE(SUM(soi.quantity), 0) as total_quantity,
                COALESCE(SUM(soi.total), 0) as total_amount
            FROM products p
            JOIN sales_order_items soi ON p.id = soi.product_id
            JOIN sales_orders so ON soi.sales_order_id = so.id
            WHERE p.company_id = $1 
                AND so.status IN ('confirmed', 'shipped', 'invoiced')
            GROUP BY p.id, p.name
            ORDER BY total_amount DESC
            LIMIT $2
        `, [req.user.company_id, limit]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching top products:', err);
    res.status(500).json({ error: err.message });
  }
});

// Expense by Category for Pie Chart
router.get('/charts/expense-categories', async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT 
                COALESCE(e.category, 'Other') as category,
                COALESCE(SUM(e.amount), 0) as total
            FROM expenses e
            WHERE e.company_id = $1 
                AND e.created_at >= NOW() - INTERVAL '12 months'
            GROUP BY e.category
            ORDER BY total DESC
            LIMIT 6
        `, [req.user.company_id]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching expense categories:', err);
    res.status(500).json({ error: err.message });
  }
});

// Quick Stats for Dashboard
router.get('/charts/quick-stats', async (req, res) => {
  try {
    // Today's Sales
    const todaySales = await pool.query(`
            SELECT COALESCE(SUM(grand_total), 0) as total
            FROM sales_orders
            WHERE company_id = $1 
                AND DATE(created_at) = CURRENT_DATE
                AND status IN ('confirmed', 'shipped', 'invoiced')
        `, [req.user.company_id]);

    // This Month Sales
    const monthSales = await pool.query(`
            SELECT COALESCE(SUM(grand_total), 0) as total
            FROM sales_orders
            WHERE company_id = $1 
                AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
                AND status IN ('confirmed', 'shipped', 'invoiced')
        `, [req.user.company_id]);

    // Total Customers
    const totalCustomers = await pool.query(`
            SELECT COUNT(*) as count FROM customers WHERE company_id = $1
        `, [req.user.company_id]);

    // Total Products
    const totalProducts = await pool.query(`
            SELECT COUNT(*) as count FROM products WHERE company_id = $1
        `, [req.user.company_id]);

    // Low Stock Products
    const lowStock = await pool.query(`
            SELECT COUNT(*) as count FROM products 
            WHERE company_id = $1 AND current_stock <= reorder_level
        `, [req.user.company_id]);

    // Pending Orders
    const pendingOrders = await pool.query(`
            SELECT COUNT(*) as count FROM sales_orders 
            WHERE company_id = $1 AND status = 'draft'
        `, [req.user.company_id]);

    res.json({
      today_sales: parseFloat(todaySales.rows[0].total) || 0,
      month_sales: parseFloat(monthSales.rows[0].total) || 0,
      total_customers: parseInt(totalCustomers.rows[0].count) || 0,
      total_products: parseInt(totalProducts.rows[0].count) || 0,
      low_stock_count: parseInt(lowStock.rows[0].count) || 0,
      pending_orders: parseInt(pendingOrders.rows[0].count) || 0
    });
  } catch (err) {
    console.error('Error fetching quick stats:', err);
    res.status(500).json({ error: err.message });
  }
});
export default router;