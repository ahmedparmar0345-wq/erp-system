import React, { useState, useEffect } from 'react';
import { getProductInsights } from '../../services/aiBi';

export default function ProductInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductInsights().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 24, fontSize: 18 }}>Loading product insights...</div>;
  if (!data) return <div style={{ padding: 24, color: '#e74c3c' }}>Failed to load product data.</div>;

  const renderTable = (rows, title, color) => (
    <div style={{ background: '#fff', borderRadius: 8, padding: 'clamp(14px, 2.5vw, 20px)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
      <h3 style={{ color, marginBottom: 12 }}>{title}</h3>
      {rows.length === 0 ? <p style={{ color: '#888' }}>No data</p> : (
        <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 400 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={{ textAlign: 'left', padding: '8px 12px', whiteSpace: 'nowrap' }}>Product</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', whiteSpace: 'nowrap' }}>SKU</th>
              <th style={{ textAlign: 'right', padding: '8px 12px', whiteSpace: 'nowrap' }}>Sold</th>
              <th style={{ textAlign: 'right', padding: '8px 12px', whiteSpace: 'nowrap' }}>Revenue</th>
              <th style={{ textAlign: 'right', padding: '8px 12px', whiteSpace: 'nowrap' }}>Stock</th>
              <th style={{ textAlign: 'right', padding: '8px 12px', whiteSpace: 'nowrap' }}>Reorder At</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0', background: p.current_stock <= p.reorder_level ? '#fff5f5' : 'transparent' }}>
                <td data-label="Product" style={{ padding: '8px 12px' }}>{p.name}</td>
                <td data-label="SKU" style={{ padding: '8px 12px', color: '#888', fontSize: 13 }}>{p.sku}</td>
                <td data-label="Sold" style={{ textAlign: 'right', padding: '8px 12px', whiteSpace: 'nowrap' }}>{p.total_sold}</td>
                <td data-label="Revenue" style={{ textAlign: 'right', padding: '8px 12px', whiteSpace: 'nowrap' }}>${Number(p.total_revenue).toLocaleString()}</td>
                <td data-label="Stock" style={{ textAlign: 'right', padding: '8px 12px', whiteSpace: 'nowrap', color: p.current_stock <= p.reorder_level ? '#e74c3c' : '#2ecc71', fontWeight: 600 }}>{p.current_stock}</td>
                <td data-label="Reorder At" style={{ textAlign: 'right', padding: '8px 12px', whiteSpace: 'nowrap' }}>{p.reorder_level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div style={{ padding: 'clamp(12px, 3vw, 24px)' }}>
      <h2 style={{ marginBottom: 'clamp(16px, 3vw, 24px)' }}>Product Insights</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: 24 }}>
        {renderTable(data.topProducts, 'Top Performing Products', '#2ecc71')}
        {renderTable(data.bottomProducts, 'Underperforming Products', '#e67e22')}
      </div>
      <div style={{ marginTop: 24 }}>
        {renderTable(data.lowStock, 'Low Stock Alerts', '#e74c3c')}
      </div>
    </div>
  );
}
