import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const StockTransfer = () => {
  const [transfers, setTransfers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [detail, setDetail] = useState(null);
  const [formData, setFormData] = useState({
    from_warehouse_id: '', to_warehouse_id: '', transfer_date: new Date().toISOString().split('T')[0],
    notes: '', items: []
  });
  const [newItem, setNewItem] = useState({ product_id: '', quantity: 1, unit_cost: 0 });

  useEffect(() => {
    fetchTransfers();
    fetchWarehouses();
    fetchProducts();
  }, [statusFilter]);

  const token = () => localStorage.getItem('token');
  const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}` });

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await fetch(`http://localhost:3000/api/warehouses/transfers${params}`, { headers: headers() });
      const data = await res.json();
      setTransfers(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/warehouses', { headers: headers() });
      const data = await res.json();
      setWarehouses(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/products', { headers: headers() });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const handleAddItem = () => {
    if (!newItem.product_id) return alert('Select a product');
    setFormData(prev => ({ ...prev, items: [...prev.items, { ...newItem }] }));
    setNewItem({ product_id: '', quantity: 1, unit_cost: 0 });
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) return alert('Add at least one item');

    try {
      const res = await fetch('http://localhost:3000/api/warehouses/transfers', {
        method: 'POST', headers: headers(), body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert('Stock transfer created');
        setShowModal(false);
        setFormData({ from_warehouse_id: '', to_warehouse_id: '', transfer_date: new Date().toISOString().split('T')[0], notes: '', items: [] });
        fetchTransfers();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (err) { console.error(err); }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this transfer?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/warehouses/transfers/${id}/approve`, { method: 'PATCH', headers: headers() });
      if (res.ok) { alert('Transfer approved'); fetchTransfers(); }
      else { const err = await res.json(); alert(err.error); }
    } catch (err) { console.error(err); }
  };

  const handleComplete = async (id) => {
    if (!window.confirm('Complete this transfer? This will move stock between warehouses.')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/warehouses/transfers/${id}/complete`, { method: 'POST', headers: headers() });
      if (res.ok) { alert('Transfer completed'); fetchTransfers(); }
      else { const err = await res.json(); alert(err.error); }
    } catch (err) { console.error(err); }
  };

  const handleViewDetail = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/api/warehouses/transfers/${id}`, { headers: headers() });
      const data = await res.json();
      setDetail(data);
    } catch (err) { console.error(err); }
  };

  const statusBadge = (status) => {
    const colors = { draft: '#6b7280', approved: '#f59e0b', completed: '#10b981', cancelled: '#ef4444' };
    return <span style={{ background: colors[status] || '#6b7280', color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 11 }}>{status}</span>;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Stock Transfers</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }}>
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
          </select>
          <button onClick={() => setShowModal(true)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>+ New Transfer</button>
        </div>
      </div>

      {loading ? <p>Loading...</p> : (
        <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                <th style={thStyle}>Transfer #</th>
                <th style={thStyle}>From</th>
                <th style={thStyle}>To</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={tdStyle}>{t.transfer_number}</td>
                  <td style={tdStyle}>{t.from_warehouse_name}</td>
                  <td style={tdStyle}>{t.to_warehouse_name}</td>
                  <td style={tdStyle}>{new Date(t.transfer_date).toLocaleDateString()}</td>
                  <td style={tdStyle}>{statusBadge(t.status)}</td>
                  <td style={tdStyle}>
                    <button onClick={() => handleViewDetail(t.id)} style={{ ...btnStyle, background: '#6b7280' }}>View</button>
                    {t.status === 'draft' && <button onClick={() => handleApprove(t.id)} style={{ ...btnStyle, background: '#f59e0b' }}>Approve</button>}
                    {t.status === 'approved' && <button onClick={() => handleComplete(t.id)} style={{ ...btnStyle, background: '#10b981' }}>Complete</button>}
                  </td>
                </tr>
              ))}
              {transfers.length === 0 && <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center' }}>No transfers found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 700, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px' }}>New Stock Transfer</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div><label style={labelStyle}>From Warehouse *</label>
                  <select value={formData.from_warehouse_id} onChange={e => setFormData(p => ({ ...p, from_warehouse_id: e.target.value }))} style={inputStyle} required>
                    <option value="">Select</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>To Warehouse *</label>
                  <select value={formData.to_warehouse_id} onChange={e => setFormData(p => ({ ...p, to_warehouse_id: e.target.value }))} style={inputStyle} required>
                    <option value="">Select</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>Transfer Date</label>
                  <input type="date" value={formData.transfer_date} onChange={e => setFormData(p => ({ ...p, transfer_date: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              <h4 style={{ marginBottom: 12 }}>Items</h4>
              {formData.items.length > 0 && (
                <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12, fontSize: 13 }}>
                  <thead><tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>Product</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Qty</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>Unit Cost</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb' }}></th>
                  </tr></thead>
                  <tbody>
                    {formData.items.map((item, i) => (
                      <tr key={i}>
                        <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{products.find(p => p.id == item.product_id)?.name || `#${item.product_id}`}</td>
                        <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>${parseFloat(item.unit_cost || 0).toFixed(2)}</td>
                        <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                          <button type="button" onClick={() => handleRemoveItem(i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'end' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Product</label>
                  <select value={newItem.product_id} onChange={e => setNewItem(prev => ({ ...prev, product_id: e.target.value }))} style={inputStyle}>
                    <option value="">Select</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                  </select>
                </div>
                <div style={{ width: 70 }}>
                  <label style={labelStyle}>Qty</label>
                  <input type="number" min="1" value={newItem.quantity} onChange={e => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))} style={inputStyle} />
                </div>
                <button type="button" onClick={handleAddItem} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', height: 38 }}>Add</button>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Notes</label>
                <textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} style={{ ...inputStyle, minHeight: 50 }} />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Create Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detail && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 700, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Transfer {detail.transfer_number}</h3>
              <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 16, background: '#f8fafc', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
              <div><strong>From:</strong> {detail.from_warehouse_name}</div>
              <div><strong>To:</strong> {detail.to_warehouse_name}</div>
              <div><strong>Date:</strong> {new Date(detail.transfer_date).toLocaleDateString()}</div>
              <div><strong>Status:</strong> {statusBadge(detail.status)}</div>
              {detail.created_by_name && <div><strong>Created By:</strong> {detail.created_by_name}</div>}
              {detail.approved_by_name && <div><strong>Approved By:</strong> {detail.approved_by_name}</div>}
            </div>
            {detail.items && detail.items.length > 0 && (
              <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead><tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>Product</th>
                  <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>SKU</th>
                  <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>Qty</th>
                </tr></thead>
                <tbody>{detail.items.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{item.product_name}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{item.sku}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>{item.quantity}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
            {detail.notes && <p style={{ marginTop: 12 }}><strong>Notes:</strong> {detail.notes}</p>}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const thStyle = { padding: '10px 14px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase' };
const tdStyle = { padding: '10px 14px', fontSize: 13 };
const btnStyle = { color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 5, cursor: 'pointer', fontSize: 11, marginRight: 4 };
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: '#374151' };
const inputStyle = { width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' };

export default StockTransfer;
