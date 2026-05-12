import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DashboardCharts from './DashboardCharts';

const s = {
  page: { padding: 'clamp(12px, 3vw, 24px)', maxWidth: 1400, margin: '0 auto', fontFamily: "'Inter',-apple-system,sans-serif" },
  welcome: { marginBottom: 'clamp(20px, 3vw, 30px)' },
  title: { fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 700, color: '#111', margin: '0 0 6px', letterSpacing: '-0.3px' },
  subtitle: { fontSize: 'clamp(13px, 1.5vw, 15px)', color: '#6b7280', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(170px, 100%), 1fr))', gap: 'clamp(12px, 2vw, 20px)', marginBottom: 'clamp(20px, 3vw, 30px)' },
  card: (color) => ({
    background: '#fff', borderRadius: 14, padding: 'clamp(16px, 2vw, 20px)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 20px rgba(0,0,0,0.04)',
    borderLeft: `4px solid ${color}`, border: '1px solid #f0f0f0',
  }),
  cardLabel: { fontSize: 'clamp(11px, 1.2vw, 13px)', color: '#6b7280', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' },
  cardValue: (color) => ({ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 700, color }),
  linksGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(150px, 100%), 1fr))', gap: 'clamp(10px, 1.5vw, 15px)', marginTop: 'clamp(20px, 3vw, 30px)' },
  link: {
    background: '#fff', borderRadius: 12, padding: 'clamp(12px, 1.5vw, 15px)',
    textDecoration: 'none', color: '#374151', textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 20px rgba(0,0,0,0.04)',
    border: '1px solid #f0f0f0', fontWeight: 500, fontSize: 'clamp(13px, 1.2vw, 14px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  loader: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, flexDirection: 'column', gap: 16 },
  spinner: { width: 40, height: 40, border: '4px solid #f3f4f6', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
};

const colors = { customers: '#3b82f6', products: '#10b981', orders: '#f59e0b', lowStock: '#ef4444', suppliers: '#8b5cf6', expenses: '#ec4899' };
const labels = { customers: 'Customers', products: 'Products', orders: 'Sales Orders', lowStock: 'Low Stock', suppliers: 'Suppliers', expenses: 'Total Expenses' };

const Dashboard = () => {
  const [stats, setStats] = useState({ customers: 0, products: 0, orders: 0, lowStock: 0, suppliers: 0, expenses: 0 });
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserName(user.name || 'Admin');
        const [cRes, pRes, oRes, sRes, eRes] = await Promise.all([
          api.get('/customers'), api.get('/products'), api.get('/sales-orders'),
          api.get('/suppliers'), api.get('/expenses'),
        ]);
        const products = pRes.data;
        const lowStock = Array.isArray(products) ? products.filter(p => p.current_stock <= p.reorder_level).length : 0;
        const totalExpenses = Array.isArray(eRes.data) ? eRes.data.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) : 0;
        setStats({
          customers: Array.isArray(cRes.data) ? cRes.data.length : 0,
          products: Array.isArray(products) ? products.length : 0,
          orders: Array.isArray(oRes.data) ? oRes.data.length : 0,
          lowStock, suppliers: Array.isArray(sRes.data) ? sRes.data.length : 0,
          expenses: totalExpenses,
        });
        setLoading(false);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div style={s.loader}>
      <div style={s.spinner} />
      <div style={{ color: '#6b7280', fontSize: 15 }}>Loading dashboard...</div>
      <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
    </div>
  );

  const formatVal = (key, val) => key === 'expenses' ? `$${Number(val).toFixed(2)}` : Number(val).toLocaleString();

  return (
    <div style={s.page}>
      <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
      <div style={s.welcome}>
        <h1 style={s.title}>Welcome back, {userName}!</h1>
        <p style={s.subtitle}>Here's what's happening with your business today.</p>
      </div>

      <div style={s.grid}>
        {Object.entries(colors).map(([key, color]) => (
          <div key={key} style={s.card(color)}>
            <div style={s.cardLabel}>{labels[key]}</div>
            <div style={s.cardValue(key === 'lowStock' && stats.lowStock > 0 ? '#ef4444' : color)}>
              {formatVal(key, stats[key])}
            </div>
          </div>
        ))}
      </div>

      <DashboardCharts />

      <div style={s.linksGrid}>
        {[
          { href: '/sales-orders', icon: '📦', label: 'New Sale' },
          { href: '/purchase-orders', icon: '📥', label: 'New Purchase' },
          { href: '/products', icon: '🏷️', label: 'Manage Products' },
          { href: '/accounting-reports', icon: '📊', label: 'View Reports' },
        ].map(link => (
          <a key={link.href} href={link.href} style={s.link}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
            {link.icon} {link.label}
          </a>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
