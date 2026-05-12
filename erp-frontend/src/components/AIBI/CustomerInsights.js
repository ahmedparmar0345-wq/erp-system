import React, { useState, useEffect } from 'react';
import { getCustomerInsights } from '../../services/aiBi';

const s = {
  page: { padding: 'clamp(16px, 3vw, 32px)', fontFamily: "'Inter',-apple-system,sans-serif", maxWidth: 1200, margin: '0 auto' },
  title: { fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 700, color: '#111', margin: '0 0 28px 0', letterSpacing: '-0.3px' },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: 20, marginBottom: 32 },
  statCard: (accent) => ({
    background: '#fff', borderRadius: 16, padding: '22px 24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 20px rgba(0,0,0,0.04)',
    border: '1px solid #f0f0f0', position: 'relative', overflow: 'hidden',
  }),
  statAccent: (accent) => ({
    position: 'absolute', top: 0, left: 0, width: 4, height: '100%',
    background: accent, borderRadius: '16px 0 0 16px',
  }),
  statLabel: { fontSize: 13, color: '#6b7280', fontWeight: 500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.03em' },
  statValue: { fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: 700, color: '#111' },
  statSuffix: { fontSize: 18, fontWeight: 500, color: '#6b7280', marginLeft: 2 },
  card: { background: '#fff', borderRadius: 16, padding: 'clamp(18px, 2.5vw, 24px)', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 20px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0', overflowX: 'auto' },
  cardTitle: { fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 480 },
  th: { textAlign: 'left', padding: '12px 14px', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #f3f4f6', background: '#fafbfc', whiteSpace: 'nowrap' },
  thRight: { textAlign: 'right', padding: '12px 14px', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #f3f4f6', background: '#fafbfc', whiteSpace: 'nowrap' },
  td: { padding: '13px 14px', fontSize: 14, color: '#374151', borderBottom: '1px solid #f3f4f6' },
  tdRight: { padding: '13px 14px', fontSize: 14, color: '#374151', borderBottom: '1px solid #f3f4f6', textAlign: 'right', whiteSpace: 'nowrap' },
  tdMuted: { padding: '13px 14px', fontSize: 13, color: '#9ca3af', borderBottom: '1px solid #f3f4f6' },
  empty: { color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '40px 16px' },
  rankBadge: (i) => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 24, height: 24, borderRadius: 8, fontSize: 12, fontWeight: 700,
    background: i < 3 ? '#eff6ff' : '#f3f4f6',
    color: i < 3 ? '#2563eb' : '#6b7280',
  }),
  loader: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, flexDirection: 'column', gap: 16 },
  spinner: { width: 40, height: 40, border: '4px solid #f3f4f6', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
};

export default function CustomerInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomerInsights().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={s.loader}>
      <div style={s.spinner} />
      <div style={{ color: '#6b7280', fontSize: 15 }}>Loading customer insights...</div>
      <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
    </div>
  );
  if (!data) return <div style={{ padding: 24, color: '#ef4444' }}>Failed to load customer data.</div>;

  return (
    <div style={s.page}>
      <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
      <h2 style={s.title}>Customer Insights</h2>

      <div style={s.statGrid}>
        <div style={s.statCard('#3b82f6')}>
          <div style={s.statAccent('#3b82f6')} />
          <div style={s.statLabel}>Total Customers</div>
          <div style={s.statValue}>{data.totalCustomers.toLocaleString()}</div>
        </div>
        <div style={s.statCard('#10b981')}>
          <div style={s.statAccent('#10b981')} />
          <div style={s.statLabel}>Repeat Customers</div>
          <div style={s.statValue}>{data.repeatCustomers.toLocaleString()}</div>
        </div>
        <div style={s.statCard('#f59e0b')}>
          <div style={s.statAccent('#f59e0b')} />
          <div style={s.statLabel}>Repeat Purchase Rate</div>
          <div style={s.statValue}>{data.repeatRate}<span style={s.statSuffix}>%</span></div>
        </div>
      </div>

      <div style={s.card}>
        <h3 style={s.cardTitle}>🏆 Top Customers by Revenue</h3>
        {data.topCustomers.length === 0 ? <div style={s.empty}>No customer data yet.</div> : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>#</th>
                <th style={s.th}>Customer</th>
                <th style={s.th}>Email</th>
                <th style={s.thRight}>Orders</th>
                <th style={s.thRight}>Total Spent</th>
                <th style={s.thRight}>Last Order</th>
              </tr>
            </thead>
            <tbody>
              {data.topCustomers.map((c, i) => (
                <tr key={c.id} style={{ transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={s.td}><span style={s.rankBadge(i)}>{i + 1}</span></td>
                  <td style={{ ...s.td, fontWeight: 600 }}>{c.name}</td>
                  <td style={s.tdMuted}>{c.email}</td>
                  <td style={s.tdRight}>{c.order_count}</td>
                  <td style={{ ...s.tdRight, fontWeight: 700 }}>${Number(c.total_spent).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td style={{ ...s.tdRight, color: '#9ca3af', fontWeight: 400 }}>
                    {c.last_order_date ? new Date(c.last_order_date).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
