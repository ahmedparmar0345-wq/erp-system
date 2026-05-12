import express from 'express';
import db from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

function linearForecast(data, periods = 3) {
  if (data.length < 2) return { forecast: [], confidence: null };
  const n = data.length;
  const indices = data.map((_, i) => i);
  const sumX = indices.reduce((a, b) => a + b, 0);
  const sumY = data.reduce((a, b) => a + b, 0);
  const sumXY = indices.reduce((a, i) => a + i * data[i], 0);
  const sumX2 = indices.reduce((a, i) => a + i * i, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const forecast = [];
  for (let i = 1; i <= periods; i++) {
    forecast.push(Math.max(0, Math.round((slope * (n + i - 1) + intercept) * 100) / 100));
  }
  const residuals = data.map((y, i) => Math.abs(y - (slope * i + intercept)));
  const mae = residuals.reduce((a, b) => a + b, 0) / n;
  const pctErr = mae / (sumY / n || 1);
  return { forecast, confidence: Math.max(0, Math.min(100, Math.round((1 - pctErr) * 100))) };
}

router.get('/dashboard', async (req, res) => {
  try {
    const { company_id } = req.user;
    const filter = company_id ? 'WHERE company_id = $1' : '';
    const param = company_id ? [company_id] : [];
    const [revenueRes, ordersRes, customersRes, productsRes, avgOrderRes, monthlyRes] = await Promise.all([
      db.query(`SELECT COALESCE(SUM(grand_total),0) as total FROM sales_orders ${filter}`, param),
      db.query(`SELECT COUNT(*) as count FROM sales_orders ${filter}`, param),
      db.query(`SELECT COUNT(*) as count FROM customers ${filter}`, param),
      db.query(`SELECT COUNT(*) as count FROM products ${company_id ? 'WHERE company_id = $1' : ''}`, param),
      db.query(`SELECT COALESCE(AVG(grand_total),0) as avg FROM sales_orders ${filter}`, param),
      db.query(`SELECT COALESCE(SUM(grand_total),0) as revenue, COUNT(*) as orders FROM sales_orders WHERE ${company_id ? 'company_id = $1 AND ' : ''}status != 'cancelled' AND created_at >= NOW() - INTERVAL '30 days'`, param),
    ]);
    const revenue = parseFloat(revenueRes.rows[0].total);
    const orders = parseInt(ordersRes.rows[0].count);
    const customers = parseInt(customersRes.rows[0].count);
    const products = parseInt(productsRes.rows[0].count);
    const avgOrderValue = parseFloat(avgOrderRes.rows[0].avg);
    const monthRevenue = parseFloat(monthlyRes.rows[0].revenue);
    const monthOrders = parseInt(monthlyRes.rows[0].orders);
    res.json({ revenue, orders, customers, products, avgOrderValue, monthRevenue, monthOrders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/sales-forecast', async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 12;
    const forecastPeriods = parseInt(req.query.forecast) || 3;
    const { company_id } = req.user;
    const param = company_id ? [company_id, months] : [months];
    const filter = company_id ? 'company_id = $1 AND' : '';
    const idx = company_id ? 2 : 1;
    const result = await db.query(
      `SELECT date_trunc('month', created_at)::date as month,
              COUNT(*)::int as order_count,
              COALESCE(SUM(grand_total),0) as revenue
       FROM sales_orders
       WHERE ${filter} status != 'cancelled'
         AND created_at >= date_trunc('month', NOW()) - ($${idx}::int || ' months')::interval
       GROUP BY 1 ORDER BY 1`,
      param
    );
    const historical = result.rows.map(r => ({ month: r.month, orders: r.order_count, revenue: parseFloat(r.revenue) }));
    const revenueData = historical.map(r => r.revenue);
    const orderData = historical.map(r => r.orders);
    const revenueForecast = linearForecast(revenueData, forecastPeriods);
    const orderForecast = linearForecast(orderData, forecastPeriods);
    const lastMonth = historical.length > 0 ? new Date(historical[historical.length - 1].month) : new Date();
    const forecastMonths = [];
    for (let i = 1; i <= forecastPeriods; i++) {
      const d = new Date(lastMonth);
      d.setMonth(d.getMonth() + i);
      forecastMonths.push(d.toISOString().slice(0, 10));
    }
    const hasForecast = revenueForecast.forecast.length > 0;
    res.json({
      historical,
      forecast: hasForecast
        ? forecastMonths.map((m, i) => ({
            month: m,
            revenue: revenueForecast.forecast[i] ?? 0,
            orders: orderForecast.forecast[i] ?? 0,
          }))
        : [],
      confidence: revenueForecast.confidence,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/product-insights', async (req, res) => {
  try {
    const { company_id } = req.user;
    const CID = company_id || '';
    const param = company_id ? [company_id] : [];
    const filter = company_id ? 'AND p.company_id = $1' : '';
    const topProducts = await db.query(
      `SELECT p.id, p.name, p.sku, p.current_stock, p.reorder_level,
              COALESCE(SUM(soi.quantity),0)::int as total_sold,
              COALESCE(SUM(soi.total),0) as total_revenue
       FROM products p
       LEFT JOIN sales_order_items soi ON soi.product_id = p.id
       LEFT JOIN sales_orders so ON so.id = soi.sales_order_id AND so.status != 'cancelled'
       ${filter}
       GROUP BY p.id, p.name, p.sku, p.current_stock, p.reorder_level
       ORDER BY total_revenue DESC LIMIT 10`,
      param
    );
    const bottomProducts = await db.query(
      `SELECT p.id, p.name, p.sku, p.current_stock, p.reorder_level,
              COALESCE(SUM(soi.quantity),0)::int as total_sold,
              COALESCE(SUM(soi.total),0) as total_revenue
       FROM products p
       LEFT JOIN sales_order_items soi ON soi.product_id = p.id
       LEFT JOIN sales_orders so ON so.id = soi.sales_order_id AND so.status != 'cancelled'
       ${filter}
       GROUP BY p.id, p.name, p.sku, p.current_stock, p.reorder_level
       HAVING COALESCE(SUM(soi.total),0) > 0
       ORDER BY total_revenue ASC LIMIT 10`,
      param
    );
    const lowStock = await db.query(
      `SELECT id, name, sku, current_stock, reorder_level FROM products
       WHERE current_stock <= reorder_level ${filter ? 'AND company_id = $1' : ''}
       ORDER BY current_stock ASC LIMIT 10`,
      param
    );
    res.json({
      topProducts: topProducts.rows.map(r => ({ ...r, total_revenue: parseFloat(r.total_revenue) })),
      bottomProducts: bottomProducts.rows.map(r => ({ ...r, total_revenue: parseFloat(r.total_revenue) })),
      lowStock: lowStock.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/customer-insights', async (req, res) => {
  try {
    const { company_id } = req.user;
    const param = company_id ? [company_id] : [];
    const filter = company_id ? 'AND c.company_id = $1' : '';
    const topCustomers = await db.query(
      `SELECT c.id, c.name, c.email,
              COUNT(so.id)::int as order_count,
              COALESCE(SUM(so.grand_total),0) as total_spent,
              MAX(so.created_at) as last_order_date
       FROM customers c
       LEFT JOIN sales_orders so ON so.customer_id = c.id AND so.status != 'cancelled'
       ${filter}
       GROUP BY c.id, c.name, c.email
       ORDER BY total_spent DESC LIMIT 10`,
      param
    );
    const repeatResult = await db.query(
      `SELECT
        COUNT(*) as total_customers,
        SUM(CASE WHEN order_count > 1 THEN 1 ELSE 0 END)::int as repeat_customers
       FROM (
         SELECT c.id, COUNT(so.id) as order_count
         FROM customers c
         LEFT JOIN sales_orders so ON so.customer_id = c.id AND so.status != 'cancelled'
         ${filter}
         GROUP BY c.id
       ) sub`,
      param
    );
    const totalCust = parseInt(repeatResult.rows[0]?.total_customers) || 0;
    const repeatCust = parseInt(repeatResult.rows[0]?.repeat_customers) || 0;
    res.json({
      topCustomers: topCustomers.rows.map(r => ({ ...r, total_spent: parseFloat(r.total_spent) })),
      totalCustomers: totalCust,
      repeatCustomers: repeatCust,
      repeatRate: totalCust > 0 ? Math.round((repeatCust / totalCust) * 100) : 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/anomalies', async (req, res) => {
  try {
    const { company_id } = req.user;
    const param = company_id ? [company_id] : [];
    const filter = company_id ? 'WHERE company_id = $1' : '';
    const dailyRes = await db.query(
      `SELECT created_at::date as day,
              COUNT(*)::int as order_count,
              COALESCE(SUM(grand_total),0) as revenue
       FROM sales_orders
       ${filter ? filter.replace('company_id', 'company_id') : ''}
       ${!company_id ? 'WHERE' : 'AND'} status != 'cancelled'
         AND created_at >= NOW() - INTERVAL '90 days'
       GROUP BY 1 ORDER BY 1`,
      param
    );
    if (dailyRes.rows.length < 7) return res.json({ anomalies: [] });
    const revenues = dailyRes.rows.map(r => parseFloat(r.revenue));
    const mean = revenues.reduce((a, b) => a + b, 0) / revenues.length;
    const std = Math.sqrt(revenues.reduce((s, v) => s + (v - mean) ** 2, 0) / revenues.length);
    const anomalies = dailyRes.rows
      .map((r, i) => ({
        date: r.day,
        revenue: parseFloat(r.revenue),
        orders: r.order_count,
        zScore: std > 0 ? (parseFloat(r.revenue) - mean) / std : 0,
      }))
      .filter(a => Math.abs(a.zScore) > 2)
      .map(a => ({
        ...a,
        type: a.zScore > 0 ? 'spike' : 'drop',
        zScore: Math.round(a.zScore * 100) / 100,
      }));
    res.json({ anomalies, mean: Math.round(mean * 100) / 100, std: Math.round(std * 100) / 100 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/seasonality', async (req, res) => {
  try {
    const { company_id } = req.user;
    const param = company_id ? [company_id] : [];
    const filter = company_id ? 'AND company_id = $1' : '';
    const dayOfWeek = await db.query(
      `SELECT EXTRACT(DOW FROM created_at)::int as dow,
              COUNT(*)::int as order_count,
              COALESCE(SUM(grand_total),0) as revenue
       FROM sales_orders
       WHERE status != 'cancelled' ${filter}
       GROUP BY 1 ORDER BY 1`,
      param
    );
    const monthly = await db.query(
      `SELECT EXTRACT(MONTH FROM created_at)::int as month,
              COUNT(*)::int as order_count,
              COALESCE(SUM(grand_total),0) as revenue
       FROM sales_orders
       WHERE status != 'cancelled' ${filter}
       GROUP BY 1 ORDER BY 1`,
      param
    );
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const totalRevenue = monthly.rows.reduce((s, r) => s + parseFloat(r.revenue), 0);
    res.json({
      dayOfWeek: dayOfWeek.rows.map(r => ({
        day: dayNames[r.dow],
        orders: r.order_count,
        revenue: parseFloat(r.revenue),
        pct: totalRevenue > 0 ? Math.round((parseFloat(r.revenue) / totalRevenue) * 10000) / 100 : 0,
      })),
      monthly: monthly.rows.map(r => ({
        month: monthNames[r.month - 1],
        orders: r.order_count,
        revenue: parseFloat(r.revenue),
        pct: totalRevenue > 0 ? Math.round((parseFloat(r.revenue) / totalRevenue) * 10000) / 100 : 0,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
