import React, { useState, useEffect } from 'react';
import { getAnomalies, getSeasonality } from '../../services/aiBi';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

const s = {
  page: { padding: 'clamp(16px, 3vw, 32px)', fontFamily: "'Inter',-apple-system,sans-serif" },
  title: { fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 700, color: '#111', margin: '0 0 28px 0', letterSpacing: '-0.3px' },
  tabs: { marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 4, background: '#f3f4f6', borderRadius: 12, padding: 4, width: 'fit-content' },
  tab: (active) => ({
    padding: '10px 22px', cursor: 'pointer', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: active ? 600 : 500,
    background: active ? '#fff' : 'transparent', color: active ? '#111' : '#6b7280',
    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s',
  }),
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(190px, 100%), 1fr))', gap: 20, marginBottom: 28 },
  statCard: (accent) => ({
    background: '#fff', borderRadius: 16, padding: '22px 24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 20px rgba(0,0,0,0.04)',
    border: '1px solid #f0f0f0', position: 'relative', overflow: 'hidden',
  }),
  statAccent: (accent) => ({ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: accent, borderRadius: '16px 0 0 16px' }),
  statLabel: { fontSize: 13, color: '#6b7280', fontWeight: 500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.03em' },
  statValue: { fontSize: 'clamp(20px, 3.5vw, 26px)', fontWeight: 700, color: '#111' },
  card: { background: '#fff', borderRadius: 16, padding: 'clamp(18px, 2.5vw, 24px)', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 20px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0', overflow: 'hidden' },
  cardTitle: { fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 500 },
  th: { textAlign: 'left', padding: '12px 14px', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #f3f4f6', background: '#fafbfc', whiteSpace: 'nowrap' },
  thRight: { textAlign: 'right', padding: '12px 14px', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #f3f4f6', background: '#fafbfc', whiteSpace: 'nowrap' },
  thCenter: { textAlign: 'center', padding: '12px 14px', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #f3f4f6', background: '#fafbfc', whiteSpace: 'nowrap' },
  td: { padding: '13px 14px', fontSize: 14, color: '#374151', borderBottom: '1px solid #f3f4f6' },
  tdRight: { padding: '13px 14px', fontSize: 14, color: '#374151', borderBottom: '1px solid #f3f4f6', textAlign: 'right', whiteSpace: 'nowrap' },
  tdCenter: { padding: '13px 14px', fontSize: 14, color: '#374151', borderBottom: '1px solid #f3f4f6', textAlign: 'center' },
  badge: (type) => ({
    display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em',
    background: type === 'spike' ? '#f0fdf4' : '#fef2f2', color: type === 'spike' ? '#16a34a' : '#dc2626',
  }),
  noData: { color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '40px 16px' },
  successBox: { background: '#fff', borderRadius: 16, padding: 'clamp(32px, 5vw, 48px)', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 20px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0', textAlign: 'center' },
  chartGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: 24 },
  loader: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, flexDirection: 'column', gap: 16 },
  spinner: { width: 40, height: 40, border: '4px solid #f3f4f6', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
};

const barChartOpts = (title) => ({
  responsive: true, maintainAspectRatio: true,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: '#1f2937', titleFont: { size: 13 }, bodyFont: { size: 12 }, padding: 12, cornerRadius: 8 },
  },
  scales: {
    y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { font: { size: 11 }, callback: v => '$' + v.toLocaleString() } },
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
  },
});

const doughnutOpts = {
  responsive: true, maintainAspectRatio: true,
  plugins: {
    legend: { position: 'right', labels: { usePointStyle: true, padding: 16, font: { size: 12, family: "'Inter',sans-serif" } } },
    tooltip: { backgroundColor: '#1f2937', padding: 12, cornerRadius: 8 },
  },
};

const dayColors = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#a855f7','#14b8a6'];
const monthColors = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#a855f7','#14b8a6','#06b6d4','#6366f1','#ec4899','#f43f5e','#8b5cf6'];

export default function AnomalyDetection() {
  const [anomalies, setAnomalies] = useState(null);
  const [seasonality, setSeasonality] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('anomalies');

  useEffect(() => {
    Promise.all([getAnomalies(), getSeasonality()])
      .then(([a, s]) => { setAnomalies(a); setSeasonality(s); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={s.loader}>
      <div style={s.spinner} />
      <div style={{ color: '#6b7280', fontSize: 15 }}>Analyzing patterns...</div>
      <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
    </div>
  );

  return (
    <div style={s.page}>
      <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
      <h2 style={s.title}>Anomaly & Pattern Detection</h2>

      <div style={s.tabs}>
        <button style={s.tab(tab === 'anomalies')} onClick={() => setTab('anomalies')}>🔍 Anomalies</button>
        <button style={s.tab(tab === 'seasonality')} onClick={() => setTab('seasonality')}>📅 Seasonality</button>
      </div>

      {tab === 'anomalies' && anomalies && (
        <>
          <div style={s.statGrid}>
            <div style={s.statCard('#3b82f6')}>
              <div style={s.statAccent('#3b82f6')} />
              <div style={s.statLabel}>Daily Avg Revenue</div>
              <div style={s.statValue}>${Number(anomalies.mean).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
            <div style={s.statCard('#8b5cf6')}>
              <div style={s.statAccent('#8b5cf6')} />
              <div style={s.statLabel}>Daily Std Deviation</div>
              <div style={s.statValue}>${Number(anomalies.std).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
            <div style={s.statCard(anomalies.anomalies?.length > 0 ? '#ef4444' : '#22c55e')}>
              <div style={s.statAccent(anomalies.anomalies?.length > 0 ? '#ef4444' : '#22c55e')} />
              <div style={s.statLabel}>Anomalies Detected</div>
              <div style={{ ...s.statValue, color: anomalies.anomalies?.length > 0 ? '#ef4444' : '#16a34a' }}>{anomalies.anomalies?.length || 0}</div>
            </div>
          </div>

          {anomalies.anomalies?.length > 0 ? (
            <div style={s.card}>
              <h3 style={s.cardTitle}>⚠️ Anomalous Days (|z-score| &gt; 2)</h3>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Date</th>
                    <th style={s.thRight}>Revenue</th>
                    <th style={s.thRight}>Orders</th>
                    <th style={s.thRight}>Z-Score</th>
                    <th style={s.thCenter}>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalies.anomalies.map((a, i) => (
                    <tr key={i} style={{ transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={s.td}>{new Date(a.date).toLocaleDateString()}</td>
                      <td style={s.tdRight}>${Number(a.revenue).toLocaleString()}</td>
                      <td style={s.tdRight}>{a.orders}</td>
                      <td style={{ ...s.tdRight, fontWeight: 700, color: Math.abs(a.zScore) > 3 ? '#ef4444' : '#f59e0b' }}>{a.zScore}</td>
                      <td style={s.tdCenter}><span style={s.badge(a.type)}>{a.type}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={s.successBox}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 600 }}>No Anomalies Detected</h3>
              <p style={{ color: '#6b7280', margin: 0, fontSize: 14 }}>Daily revenue is within normal fluctuation range for the past 90 days.</p>
            </div>
          )}
        </>
      )}

      {tab === 'seasonality' && seasonality && (
        <div style={s.chartGrid}>
          <div style={s.card}>
            <h3 style={s.cardTitle}>📊 Revenue by Day of Week</h3>
            <Bar
              data={{
                labels: seasonality.dayOfWeek.map(d => d.day),
                datasets: [{ label: 'Revenue', data: seasonality.dayOfWeek.map(d => d.revenue), backgroundColor: dayColors, borderRadius: 6 }],
              }}
              options={barChartOpts()}
            />
          </div>
          <div style={s.card}>
            <h3 style={s.cardTitle}>📊 Revenue by Month</h3>
            <Bar
              data={{
                labels: seasonality.monthly.map(m => m.month),
                datasets: [{ label: 'Revenue', data: seasonality.monthly.map(m => m.revenue), backgroundColor: '#3b82f6', borderRadius: 6 }],
              }}
              options={barChartOpts()}
            />
          </div>
          <div style={s.card}>
            <h3 style={s.cardTitle}>🍩 Revenue Distribution by Day</h3>
            <Doughnut
              data={{
                labels: seasonality.dayOfWeek.map(d => d.day),
                datasets: [{ data: seasonality.dayOfWeek.map(d => d.revenue), backgroundColor: dayColors }],
              }}
              options={doughnutOpts}
            />
          </div>
          <div style={s.card}>
            <h3 style={s.cardTitle}>🍩 Revenue Distribution by Month</h3>
            <Doughnut
              data={{
                labels: seasonality.monthly.map(m => m.month),
                datasets: [{ data: seasonality.monthly.map(m => m.revenue), backgroundColor: monthColors }],
              }}
              options={doughnutOpts}
            />
          </div>
        </div>
      )}
    </div>
  );
}
