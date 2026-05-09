import React, { useState, useEffect } from 'react';
import { getAIBIDashboard } from '../../services/aiBi';

export default function AIBIDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAIBIDashboard().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 24, fontSize: 18 }}>Loading AI insights...</div>;
  if (!data) return <div style={{ padding: 24, color: '#e74c3c' }}>Failed to load dashboard data.</div>;

  const cards = [
    { label: 'Total Revenue', value: data.revenue, fmt: 'currency' },
    { label: 'Total Orders', value: data.orders, fmt: 'number' },
    { label: 'Total Customers', value: data.customers, fmt: 'number' },
    { label: 'Products', value: data.products, fmt: 'number' },
    { label: 'Avg Order Value', value: data.avgOrderValue, fmt: 'currency' },
    { label: 'Last 30 Days Revenue', value: data.monthRevenue, fmt: 'currency' },
  ];

  return (
    <div style={{ padding: 'clamp(12px, 3vw, 24px)' }}>
      <h2 style={{ marginBottom: 'clamp(16px, 3vw, 24px)' }}>AI & BI Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: 16, marginBottom: 32 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 8, padding: 'clamp(14px, 2.5vw, 20px)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>{c.label}</div>
            <div style={{ fontSize: 'clamp(18px, 3.5vw, 24px)', fontWeight: 700 }}>
              {c.fmt === 'currency' ? `$${Number(c.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : Number(c.value).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 8, padding: 'clamp(14px, 2.5vw, 20px)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'hidden' }}>
        <h3 style={{ marginBottom: 8 }}>Quick Insights</h3>
        <p style={{ wordBreak: 'break-word' }}>Average order value: <strong>${Number(data.avgOrderValue).toFixed(2)}</strong></p>
        <p style={{ wordBreak: 'break-word' }}>Last 30 days: <strong>{data.monthOrders}</strong> orders generating <strong>${Number(data.monthRevenue).toLocaleString()}</strong></p>
        <p style={{ wordBreak: 'break-word' }}>Customer base: <strong>{data.customers}</strong> customers across <strong>{data.products}</strong> products</p>
        <p style={{ color: '#666', marginTop: 16, fontStyle: 'italic' }}>
          Explore detailed reports: Sales Forecast, Product Insights, Customer Insights, Anomaly Detection
        </p>
      </div>
    </div>
  );
}
