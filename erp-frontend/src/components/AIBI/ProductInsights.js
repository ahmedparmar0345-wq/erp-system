import React, { useState, useEffect } from 'react';
import { getProductInsights } from '../../services/aiBi';

const s = {
  page: { padding: 'clamp(16px, 3vw, 32px)', fontFamily: "'Inter',-apple-system,sans-serif" },
  title: { fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 700, color: '#111', margin: '0 0 28px 0', letterSpacing: '-0.3px' },
  card: { background: '#fff', borderRadius: 16, padding: 'clamp(18px, 2.5vw, 24px)', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 20px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0', overflowX: 'auto' },
  cardTitle: { fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 },
  titleDot: (color) => ({ width: 12, height: 12, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }),
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 480 },
  th: { textAlign: 'left', padding: '12px 14px', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #f3f4f6', background: '#fafbfc', whiteSpace: 'nowrap' },
  thRight: { textAlign: 'right', padding: '12px 14px', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #f3f4f6', background: '#fafbfc', whiteSpace: 'nowrap' },
  td: { padding: '13px 14px', fontSize: 14, color: '#374151', borderBottom: '1px solid #f3f4f6' },
  tdRight: { padding: '13px 14px', fontSize: 14, color: '#374151', borderBottom: '1px solid #f3f4f6', textAlign: 'right', whiteSpace: 'nowrap' },
  empty: { color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '40px 16px' },
  stockBadge: (low) => ({
    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
    background: low ? '#fef2f2' : '#f0fdf4', color: low ? '#dc2626' : '#16a34a',
  }),
  loader: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, flexDirection: 'column', gap: 16 },
  spinner: { width: 40, height: 40, border: '4px solid #f3f4f6', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
};

const renderTable = (rows, title, color, icon) => (
  <div style={s.card}>
    <h3 style={s.cardTitle}><span style={s.titleDot(color)} />{icon} {title}</h3>
    {rows.length === 0 ? <div style={s.empty}>No data available</div> : (
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Product</th>
            <th style={s.th}>SKU</th>
            <th style={s.thRight}>Sold</th>
            <th style={s.thRight}>Revenue</th>
            <th style={s.thRight}>Stock</th>
            <th style={s.thRight}>Reorder At</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const low = p.current_stock <= p.reorder_level;
            return (
              <tr key={p.id} style={{ transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ ...s.td, fontWeight: 600 }}>{p.name}</td>
                <td style={{ ...s.td, color: '#9ca3af' }}>{p.sku}</td>
                <td style={s.tdRight}>{p.total_sold}</td>
                <td style={s.tdRight}>${Number(p.total_revenue).toLocaleString()}</td>
                <td style={{ ...s.tdRight }}><span style={s.stockBadge(low)}>{p.current_stock}</span></td>
                <td style={s.tdRight}>{p.reorder_level}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    )}
  </div>
);

export default function ProductInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductInsights().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={s.loader}>
      <div style={s.spinner} />
      <div style={{ color: '#6b7280', fontSize: 15 }}>Loading product insights...</div>
      <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
    </div>
  );
  if (!data) return <div style={{ padding: 24, color: '#ef4444' }}>Failed to load product data.</div>;

  return (
    <div style={s.page}>
      <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
      <h2 style={s.title}>Product Insights</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(400px, 100%), 1fr))', gap: 24 }}>
        {renderTable(data.topProducts, 'Top Performing Products', '#22c55e', '🏆')}
        {renderTable(data.bottomProducts, 'Underperforming Products', '#f59e0b', '📉')}
      </div>
      <div style={{ marginTop: 24 }}>
        {renderTable(data.lowStock, 'Low Stock Alerts', '#ef4444', '⚠️')}
      </div>
    </div>
  );
}
