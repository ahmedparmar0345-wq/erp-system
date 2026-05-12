import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const s = {
  grid: { display: 'grid', gridTemplateColumns: '1fr', gap: 'clamp(16px, 2.5vw, 25px)', marginBottom: 'clamp(16px, 2.5vw, 25px)' },
  card: { background: '#fff', borderRadius: 14, padding: 'clamp(16px, 2vw, 20px)', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 20px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0' },
  cardTitle: { fontSize: 'clamp(14px, 1.5vw, 16px)', fontWeight: 600, color: '#111', margin: '0 0 clamp(12px, 2vw, 15px)' },
  chartBox: { height: 'clamp(220px, 45vw, 300px)' },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(160px, 100%), 1fr))', gap: 'clamp(12px, 2vw, 20px)', marginBottom: 'clamp(20px, 3vw, 30px)' },
  statCard: (color) => ({ background: '#fff', borderRadius: 14, padding: 'clamp(14px, 2vw, 20px)', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 20px rgba(0,0,0,0.04)', borderLeft: `4px solid ${color}`, border: '1px solid #f0f0f0' }),
  statLabel: { fontSize: 'clamp(11px, 1vw, 12px)', color: '#6b7280', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' },
  statValue: { fontSize: 'clamp(20px, 3.5vw, 24px)', fontWeight: 700, color: '#111' },
  summaryCard: (bg) => ({ background: bg, borderRadius: 10, padding: 'clamp(12px, 2vw, 15px)', marginBottom: 'clamp(10px, 1.5vw, 15px)' }),
  summaryLabel: { fontSize: 'clamp(11px, 1vw, 12px)', color: '#6b7280', fontWeight: 500 },
  summaryValue: (color) => ({ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 700, color }),
};

const chartOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top', labels: { usePointStyle: true, padding: 16, font: { size: 12 } } },
    tooltip: { backgroundColor: '#1f2937', padding: 12, cornerRadius: 8, callbacks: { label: ctx => `${ctx.dataset.label}: $${(ctx.raw || 0).toFixed(2)}` } },
  },
  scales: { y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { font: { size: 11 }, callback: v => '$' + v.toLocaleString() } }, x: { grid: { display: false }, ticks: { font: { size: 11 } } } },
};

const barOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top', labels: { font: { size: 12 } } },
    tooltip: { backgroundColor: '#1f2937', padding: 12, cornerRadius: 8, callbacks: { label: ctx => `$${(ctx.raw || 0).toFixed(2)}` } },
  },
  scales: { y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { font: { size: 11 }, callback: v => '$' + v.toLocaleString() } }, x: { grid: { display: false }, ticks: { font: { size: 10, maxRotation: 45 } } } },
};

const pieOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right', labels: { usePointStyle: true, padding: 12, font: { size: 12 } } },
    tooltip: { backgroundColor: '#1f2937', padding: 12, cornerRadius: 8, callbacks: { label: ctx => { const t = ctx.dataset.data.reduce((a, b) => a + b, 0); return `${ctx.label}: $${(ctx.raw || 0).toFixed(2)} (${((ctx.raw / t) * 100).toFixed(1)}%)`; } } },
  },
};

const DashboardCharts = () => {
  const [monthlyData, setMonthlyData] = useState({ months: [], revenue: [], expenses: [] });
  const [topProducts, setTopProducts] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [quickStats, setQuickStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchChartData(); }, []);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [monthlyRes, productsRes, expensesRes, statsRes] = await Promise.all([
        fetch('/api/accounting-reports/charts/monthly-trend?months=6', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/accounting-reports/charts/top-products?limit=5', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/accounting-reports/charts/expense-categories', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/accounting-reports/charts/quick-stats', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const monthly = await monthlyRes.json();
      const products = await productsRes.json();
      const expenses = await expensesRes.json();
      const stats = await statsRes.json();
      setMonthlyData({ months: monthly.map(m => m.month), revenue: monthly.map(m => parseFloat(m.revenue) || 0), expenses: monthly.map(m => parseFloat(m.expenses) || 0) });
      setTopProducts(products);
      setExpenseCategories(expenses);
      setQuickStats(stats);
    } catch (err) { console.error('Error fetching chart data:', err); } finally { setLoading(false); }
  };

  const fmt = v => `$${(v || 0).toFixed(2)}`;

  const revenueExpenseData = {
    labels: monthlyData.months,
    datasets: [
      { label: 'Revenue', data: monthlyData.revenue, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4, pointBackgroundColor: '#10b981', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6 },
      { label: 'Expenses', data: monthlyData.expenses, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4, pointBackgroundColor: '#ef4444', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6 },
    ],
  };

  const topProductsData = {
    labels: topProducts.map(p => (p.product_name?.length > 20 ? p.product_name.substring(0, 20) + '...' : p.product_name)),
    datasets: [{ label: 'Sales ($)', data: topProducts.map(p => parseFloat(p.total_amount) || 0), backgroundColor: '#3b82f6', borderRadius: 8, barPercentage: 0.7 }],
  };

  const expenseCategoriesData = {
    labels: expenseCategories.map(c => c.category),
    datasets: [{
      data: expenseCategories.map(c => parseFloat(c.total) || 0),
      backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'],
      borderWidth: 0,
    }],
  };

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#6b7280', fontSize: 14 }}>Loading dashboard charts...</div>
  );

  return (
    <div>
      <style>{'@media (min-width: 768px) { .dash-chart-grid { grid-template-columns: repeat(2, 1fr) !important; } }'}</style>

      {quickStats && (
        <div style={s.statGrid}>
          <div style={s.statCard('#10b981')}><div style={s.statLabel}>Today's Sales</div><div style={s.statValue}>{fmt(quickStats.today_sales)}</div></div>
          <div style={s.statCard('#3b82f6')}><div style={s.statLabel}>This Month</div><div style={s.statValue}>{fmt(quickStats.month_sales)}</div></div>
          <div style={s.statCard('#f59e0b')}><div style={s.statLabel}>Total Customers</div><div style={s.statValue}>{quickStats.total_customers}</div></div>
          <div style={s.statCard('#ef4444')}>
            <div style={s.statLabel}>Low Stock Alerts</div>
            <div style={{ ...s.statValue, color: quickStats.low_stock_count > 0 ? '#ef4444' : '#111' }}>{quickStats.low_stock_count}</div>
          </div>
        </div>
      )}

      <div style={s.grid} className="dash-chart-grid">
        <div style={s.card}>
          <h3 style={s.cardTitle}>Revenue vs Expenses Trend</h3>
          <div style={s.chartBox}><Line data={revenueExpenseData} options={chartOpts} /></div>
        </div>
        <div style={s.card}>
          <h3 style={s.cardTitle}>Top Selling Products</h3>
          <div style={s.chartBox}><Bar data={topProductsData} options={barOpts} /></div>
        </div>
        <div style={s.card}>
          <h3 style={s.cardTitle}>Expense Breakdown by Category</h3>
          <div style={s.chartBox}>
            {expenseCategories.length > 0 ? <Doughnut data={expenseCategoriesData} options={pieOpts} /> : <p style={{ textAlign: 'center', paddingTop: 80, color: '#9ca3af' }}>No expense data available</p>}
          </div>
        </div>
        <div style={s.card}>
          <h3 style={s.cardTitle}>Summary</h3>
          {monthlyData.revenue.length > 0 && (
            <div>
              <div style={s.summaryCard('#f0fdf4')}>
                <div style={s.summaryLabel}>Total Revenue (Last 6 months)</div>
                <div style={s.summaryValue('#10b981')}>{fmt(monthlyData.revenue.reduce((a, b) => a + b, 0))}</div>
              </div>
              <div style={s.summaryCard('#fef2f2')}>
                <div style={s.summaryLabel}>Total Expenses (Last 6 months)</div>
                <div style={s.summaryValue('#ef4444')}>{fmt(monthlyData.expenses.reduce((a, b) => a + b, 0))}</div>
              </div>
              <div style={s.summaryCard('#e0e7ff')}>
                <div style={s.summaryLabel}>Net Profit (Last 6 months)</div>
                <div style={s.summaryValue('#3b82f6')}>{fmt(monthlyData.revenue.reduce((a, b) => a + b, 0) - monthlyData.expenses.reduce((a, b) => a + b, 0))}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
