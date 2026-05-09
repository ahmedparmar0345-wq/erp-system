import React, { useState, useEffect } from 'react';
import { getCustomerInsights } from '../../services/aiBi';

export default function CustomerInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomerInsights().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 24, fontSize: 18 }}>Loading customer insights...</div>;
  if (!data) return <div style={{ padding: 24, color: '#e74c3c' }}>Failed to load customer data.</div>;

  return (
    <div style={{ padding: 'clamp(12px, 3vw, 24px)' }}>
      <h2 style={{ marginBottom: 'clamp(16px, 3vw, 24px)' }}>Customer Insights</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))', gap: 16, marginBottom: 32 }}>
        <div style={{ background: '#fff', borderRadius: 8, padding: 'clamp(14px, 2.5vw, 20px)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>Total Customers</div>
          <div style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 700 }}>{data.totalCustomers.toLocaleString()}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 8, padding: 'clamp(14px, 2.5vw, 20px)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>Repeat Customers</div>
          <div style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 700 }}>{data.repeatCustomers.toLocaleString()}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 8, padding: 'clamp(14px, 2.5vw, 20px)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>Repeat Purchase Rate</div>
          <div style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 700 }}>{data.repeatRate}%</div>
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 8, padding: 'clamp(14px, 2.5vw, 20px)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <h3 style={{ marginBottom: 12 }}>Top Customers by Revenue</h3>
        {data.topCustomers.length === 0 ? <p style={{ color: '#888' }}>No customer data yet.</p> : (
          <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 400 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', whiteSpace: 'nowrap' }}>Customer</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', whiteSpace: 'nowrap' }}>Email</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', whiteSpace: 'nowrap' }}>Orders</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', whiteSpace: 'nowrap' }}>Total Spent</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', whiteSpace: 'nowrap' }}>Last Order</th>
              </tr>
            </thead>
            <tbody>
              {data.topCustomers.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td data-label="Customer" style={{ padding: '8px 12px', fontWeight: 600 }}>{c.name}</td>
                  <td data-label="Email" style={{ padding: '8px 12px', color: '#888' }}>{c.email}</td>
                  <td data-label="Orders" style={{ textAlign: 'right', padding: '8px 12px', whiteSpace: 'nowrap' }}>{c.order_count}</td>
                  <td data-label="Total Spent" style={{ textAlign: 'right', padding: '8px 12px', whiteSpace: 'nowrap' }}>${Number(c.total_spent).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td data-label="Last Order" style={{ textAlign: 'right', padding: '8px 12px', whiteSpace: 'nowrap', color: '#888', fontSize: 13 }}>
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
