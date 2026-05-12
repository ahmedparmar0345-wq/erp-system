import React, { useState, useEffect } from 'react';
import { getAIBIDashboard } from '../../services/aiBi';

const s = {
  page: { padding: 'clamp(16px, 3vw, 32px)', fontFamily: "'Inter',-apple-system,sans-serif", maxWidth: 1200, margin: '0 auto' },
  hero: {
    background: 'linear-gradient(135deg,#1e293b 0%,#334155 50%,#475569 100%)',
    borderRadius: 20, padding: 'clamp(24px, 4vw, 40px)',
    marginBottom: 32, color: '#fff', position: 'relative', overflow: 'hidden',
  },
  heroBg: { position: 'absolute', top: '-50%', right: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.15),transparent 70%)', pointerEvents: 'none' },
  heroBg2: { position: 'absolute', bottom: '-30%', left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(168,85,247,0.1),transparent 70%)', pointerEvents: 'none' },
  heroTitle: { fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.3px', position: 'relative', zIndex: 1 },
  heroSub: { fontSize: 'clamp(13px, 1.5vw, 15px)', color: '#94a3b8', margin: 0, position: 'relative', zIndex: 1 },
  heroStatRow: { display: 'flex', flexWrap: 'wrap', gap: 'clamp(16px, 3vw, 32px)', marginTop: 'clamp(16px, 3vw, 24px)', position: 'relative', zIndex: 1 },
  heroStat: { textAlign: 'center', flex: '1 0 auto', minWidth: 80 },
  heroStatLabel: { fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 },
  heroStatValue: { fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 700, color: '#fff' },
  divider: { width: 1, height: 40, background: '#475569', alignSelf: 'center' },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: 'clamp(12px, 2vw, 20px)', marginBottom: 32 },
  card: (accent) => ({
    background: '#fff', borderRadius: 16, padding: 'clamp(18px, 2.5vw, 24px)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 20px rgba(0,0,0,0.04)',
    border: '1px solid #f0f0f0', position: 'relative', overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default',
  }),
  cardAccent: (c) => ({ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: c }),
  cardIconWrap: (bg) => ({
    width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: bg, marginBottom: 14, fontSize: 18,
  }),
  cardLabel: { fontSize: 13, color: '#6b7280', fontWeight: 500, marginBottom: 6 },
  cardValue: { fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 700, color: '#111', letterSpacing: '-0.3px' },
  cardTrend: (up) => ({ fontSize: 12, color: up ? '#16a34a' : '#6b7280', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }),

  summary: {
    background: '#fff', borderRadius: 16, padding: 'clamp(20px, 3vw, 28px)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 20px rgba(0,0,0,0.04)',
    border: '1px solid #f0f0f0', marginBottom: 32,
  },
  summaryTitle: { fontSize: 16, fontWeight: 600, color: '#111', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 },
  insightGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: 16 },
  insightCard: (bg) => ({
    background: bg, borderRadius: 12, padding: '16px 20px',
    display: 'flex', alignItems: 'center', gap: 14,
  }),
  insightIcon: { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: 'rgba(255,255,255,0.9)' },
  insightText: { fontSize: 13, color: '#fff', lineHeight: 1.4 },

  navGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: 16 },
  navCard: (bg) => ({
    background: '#fff', borderRadius: 16, padding: 'clamp(16px, 2vw, 22px)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 20px rgba(0,0,0,0.04)',
    border: '1px solid #f0f0f0', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', color: 'inherit',
  }),
  navIcon: (bg) => ({ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }),
  navInfo: { flex: 1, minWidth: 0 },
  navTitle: { fontSize: 14, fontWeight: 600, color: '#111', margin: '0 0 2px' },
  navDesc: { fontSize: 12, color: '#9ca3af', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  navArrow: { color: '#d1d5db', fontSize: 16, flexShrink: 0 },

  loader: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, flexDirection: 'column', gap: 16 },
  spinner: { width: 40, height: 40, border: '4px solid #f3f4f6', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
};

const cards = [
  { label: 'Total Revenue', valueKey: 'revenue', fmt: 'currency', accent: '#3b82f6', iconBg: '#eff6ff', icon: '💰', trend: '+12.5%' },
  { label: 'Total Orders', valueKey: 'orders', fmt: 'number', accent: '#10b981', iconBg: '#f0fdf4', icon: '📦', trend: '' },
  { label: 'Total Customers', valueKey: 'customers', fmt: 'number', accent: '#8b5cf6', iconBg: '#f5f3ff', icon: '👥', trend: '' },
  { label: 'Products', valueKey: 'products', fmt: 'number', accent: '#f59e0b', iconBg: '#fffbeb', icon: '🏷️', trend: '' },
  { label: 'Avg Order Value', valueKey: 'avgOrderValue', fmt: 'currency', accent: '#ec4899', iconBg: '#fdf2f8', icon: '📈', trend: '' },
  { label: '30-Day Revenue', valueKey: 'monthRevenue', fmt: 'currency', accent: '#06b6d4', iconBg: '#ecfeff', icon: '🔥', trend: '' },
];

const navItems = [
  { title: 'Sales Forecast', desc: 'Predict future revenue and orders', icon: '📊', bg: '#eff6ff', color: '#3b82f6', href: '/ai-bi/sales-forecast' },
  { title: 'Product Insights', desc: 'Analyze product performance', icon: '🏆', bg: '#f0fdf4', color: '#16a34a', href: '/ai-bi/product-insights' },
  { title: 'Customer Insights', desc: 'Understand customer behavior', icon: '👥', bg: '#f5f3ff', color: '#8b5cf6', href: '/ai-bi/customer-insights' },
  { title: 'Anomaly Detection', desc: 'Detect unusual patterns', icon: '🔍', bg: '#fef2f2', color: '#ef4444', href: '/ai-bi/anomalies' },
];

export default function AIBIDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAIBIDashboard().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={s.loader}>
      <div style={s.spinner} />
      <div style={{ color: '#6b7280', fontSize: 15 }}>Loading AI insights...</div>
      <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
    </div>
  );
  if (!data) return <div style={{ padding: 24, color: '#ef4444', fontFamily: "'Inter',sans-serif" }}>Failed to load dashboard data.</div>;

  return (
    <div style={s.page}>
      <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>

      <div style={s.hero}>
        <div style={s.heroBg} />
        <div style={s.heroBg2} />
        <h1 style={s.heroTitle}>AI & BI Dashboard</h1>
        <p style={s.heroSub}>Real-time business intelligence powered by machine learning</p>
        <div style={s.heroStatRow}>
          <div style={s.heroStat}>
            <div style={s.heroStatLabel}>Total Revenue</div>
            <div style={s.heroStatValue}>${Number(data.revenue).toLocaleString()}</div>
          </div>
          <div style={s.divider} />
          <div style={s.heroStat}>
            <div style={s.heroStatLabel}>Orders</div>
            <div style={s.heroStatValue}>{data.orders}</div>
          </div>
          <div style={s.divider} />
          <div style={s.heroStat}>
            <div style={s.heroStatLabel}>Customers</div>
            <div style={s.heroStatValue}>{data.customers}</div>
          </div>
          <div style={s.divider} />
          <div style={s.heroStat}>
            <div style={s.heroStatLabel}>30-Day Revenue</div>
            <div style={s.heroStatValue}>${Number(data.monthRevenue).toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div style={s.grid}>
        {cards.map(c => {
          const val = data[c.valueKey];
          return (
            <div key={c.label} style={s.card(c.accent)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
              <div style={s.cardAccent(c.accent)} />
              <div style={s.cardIconWrap(c.iconBg)}>{c.icon}</div>
              <div style={s.cardLabel}>{c.label}</div>
              <div style={s.cardValue}>
                {c.fmt === 'currency'
                  ? `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                  : Number(val).toLocaleString()}
              </div>
              {c.trend && <div style={s.cardTrend(true)}>↑ {c.trend} vs last period</div>}
            </div>
          );
        })}
      </div>

      <div style={s.summary}>
        <h3 style={s.summaryTitle}>📋 Quick Insights</h3>
        <div style={s.insightGrid}>
          <div style={s.insightCard('linear-gradient(135deg,#3b82f6,#2563eb)')}>
            <div style={s.insightIcon}>📈</div>
            <div style={s.insightText}><strong>${Number(data.avgOrderValue).toFixed(2)}</strong> average order value</div>
          </div>
          <div style={s.insightCard('linear-gradient(135deg,#10b981,#059669)')}>
            <div style={s.insightIcon}>📦</div>
            <div style={s.insightText}><strong>{data.monthOrders}</strong> orders in last 30 days · <strong>${Number(data.monthRevenue).toLocaleString()}</strong> revenue</div>
          </div>
          <div style={s.insightCard('linear-gradient(135deg,#8b5cf6,#7c3aed)')}>
            <div style={s.insightIcon}>👥</div>
            <div style={s.insightText}><strong>{data.customers}</strong> customers across <strong>{data.products}</strong> products</div>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>🔎 Explore Detailed Reports</h3>
        <div style={s.navGrid}>
          {navItems.map(item => (
            <a key={item.title} href={item.href} style={s.navCard(item.bg)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
              <div style={s.navIcon(item.bg)}>{item.icon}</div>
              <div style={s.navInfo}>
                <div style={s.navTitle}>{item.title}</div>
                <div style={s.navDesc}>{item.desc}</div>
              </div>
              <div style={s.navArrow}>→</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
