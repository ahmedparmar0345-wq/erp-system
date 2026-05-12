import React, { useState, useEffect } from 'react';
import { getSalesForecast } from '../../services/aiBi';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const MONTHS = 12;

const s = {
  page: { padding: 'clamp(16px, 3vw, 32px)', fontFamily: "'Inter',-apple-system,sans-serif", maxWidth: 1200, margin: '0 auto' },
  header: { display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.3px' },
  confBadge: { background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: 10, padding: '10px 20px', color: '#fff', fontSize: 14, fontWeight: 500, boxShadow: '0 4px 14px rgba(102,126,234,0.3)' },
  confValue: { fontWeight: 700, fontSize: 16 },
  card: { background: '#fff', borderRadius: 16, padding: 'clamp(18px, 2.5vw, 24px)', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 20px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0', overflow: 'hidden' },
  cardTitle: { fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: '50%', display: 'inline-block' },
  tableCard: { marginTop: 28, background: '#fff', borderRadius: 16, padding: 'clamp(18px, 2.5vw, 24px)', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 20px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 320 },
  th: { textAlign: 'left', padding: '12px 16px', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #f3f4f6', background: '#fafbfc' },
  thRight: { textAlign: 'right', padding: '12px 16px', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #f3f4f6', background: '#fafbfc' },
  td: { padding: '14px 16px', fontSize: 14, color: '#374151', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' },
  tdRight: { padding: '14px 16px', fontSize: 14, color: '#374151', borderBottom: '1px solid #f3f4f6', textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 600 },
  empty: { color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '40px 16px' },
  loader: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, flexDirection: 'column', gap: 16 },
  spinner: { width: 40, height: 40, border: '4px solid #f3f4f6', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
};

const chartOpts = {
  responsive: true, maintainAspectRatio: true,
  plugins: {
    legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { size: 12, family: "'Inter',sans-serif" } } },
    tooltip: { backgroundColor: '#1f2937', titleFont: { size: 13 }, bodyFont: { size: 12 }, padding: 12, cornerRadius: 8 },
  },
  scales: {
    y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { font: { size: 11 }, callback: v => '$' + v.toLocaleString() } },
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
  },
};

export default function SalesForecast() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSalesForecast(MONTHS, 3).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={s.loader}>
      <div style={s.spinner} />
      <div style={{ color: '#6b7280', fontSize: 15 }}>Loading forecast data...</div>
      <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
    </div>
  );
  if (!data) return <div style={{ padding: 24, color: '#ef4444' }}>Failed to load forecast data.</div>;

  const chartColors = { actual: '#3b82f6', forecast: '#f59e0b' };

  const allMonths = [...data.historical.map(h => {
    const d = new Date(h.month);
    return d.toLocaleString('default', { month: 'short', year: '2-digit' });
  }), ...(data.forecast || []).map(f => {
    const d = new Date(f.month);
    return d.toLocaleString('default', { month: 'short', year: '2-digit' });
  })];

  const actualRevenue = data.historical.map(h => h.revenue);
  const forecastRevenue = [...new Array(data.historical.length).fill(null), ...(data.forecast || []).map(f => f.revenue ?? null)];
  const actualOrders = data.historical.map(h => h.orders);
  const forecastOrders = [...new Array(data.historical.length).fill(null), ...(data.forecast || []).map(f => f.orders ?? null)];

  const revChart = {
    labels: allMonths,
    datasets: [
      { label: 'Actual Revenue', data: actualRevenue, borderColor: chartColors.actual, backgroundColor: 'rgba(59,130,246,0.08)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: chartColors.actual, borderWidth: 2.5 },
      { label: 'Forecast Revenue', data: forecastRevenue, borderColor: chartColors.forecast, backgroundColor: 'rgba(245,158,11,0.08)', fill: true, borderDash: [6, 4], tension: 0.4, pointRadius: 5, pointStyle: 'rectRot', pointBackgroundColor: chartColors.forecast, borderWidth: 2.5 },
    ],
  };

  const ordChart = {
    labels: allMonths,
    datasets: [
      { label: 'Actual Orders', data: actualOrders, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#10b981', borderWidth: 2.5 },
      { label: 'Forecast Orders', data: forecastOrders, borderColor: chartColors.forecast, backgroundColor: 'rgba(245,158,11,0.08)', fill: true, borderDash: [6, 4], tension: 0.4, pointRadius: 5, pointStyle: 'rectRot', pointBackgroundColor: chartColors.forecast, borderWidth: 2.5 },
    ],
  };

  return (
    <div style={s.page}>
      <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
      <div style={s.header}>
        <h2 style={s.title}>Sales Forecast</h2>
        <div style={s.confBadge}>
          Model confidence: <span style={s.confValue}>{data.confidence != null ? data.confidence + '%' : 'N/A'}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(380px, 100%), 1fr))', gap: 24 }}>
        <div style={s.card}>
          <h3 style={s.cardTitle}><span style={{ ...s.dot, background: chartColors.actual }} /><span style={{ ...s.dot, background: chartColors.forecast, marginLeft: -4 }} /> Revenue Forecast</h3>
          <div style={{ overflowX: 'auto' }}><Line data={revChart} options={chartOpts} /></div>
        </div>
        <div style={s.card}>
          <h3 style={s.cardTitle}><span style={{ ...s.dot, background: '#10b981' }} /><span style={{ ...s.dot, background: chartColors.forecast, marginLeft: -4 }} /> Order Volume Forecast</h3>
          <div style={{ overflowX: 'auto' }}><Line data={ordChart} options={chartOpts} /></div>
        </div>
      </div>

      <div style={s.tableCard}>
        <h3 style={{ ...s.cardTitle, marginBottom: 8 }}>Forecast Details</h3>
        {!data.forecast || data.forecast.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
            <div>Not enough historical data to generate forecast (need at least 2 months).</div>
          </div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Month</th>
                <th style={s.thRight}>Predicted Revenue</th>
                <th style={s.thRight}>Predicted Orders</th>
              </tr>
            </thead>
            <tbody>
              {data.forecast.map((f, i) => {
                const d = new Date(f.month);
                const rev = Number(f.revenue) || 0;
                const ord = Math.round(Number(f.orders)) || 0;
                return (
                  <tr key={i} style={{ transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={s.td}>{d.toLocaleString('default', { month: 'long', year: 'numeric' })}</td>
                    <td style={s.tdRight}>${rev.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td style={s.tdRight}>{ord}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
