import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const SalesReturns = () => {
  const [returns, setReturns] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [formData, setFormData] = useState({
    original_sales_order_id: '',
    customer_id: '',
    return_date: new Date().toISOString().split('T')[0],
    restock_inventory: true,
    notes: '',
    items: []
  });
  const [newItem, setNewItem] = useState({ product_id: '', quantity: 1, unit_price: 0, return_reason_id: '', reason_text: '' });

  useEffect(() => {
    fetchReturns();
    fetchReasons();
    fetchCustomers();
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/returns/sales');
      setReturns(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchReasons = async () => {
    try {
      const res = await api.get('/returns/reasons');
      setReasons(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/sales-orders');
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
  };

  const handleOrderSelect = async (orderId) => {
    if (!orderId) return;
    try {
      const res = await api.get(`/sales-orders/${orderId}`);
      const order = res.data;
      if (order && order.items) {
        const items = order.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          return_reason_id: '',
          reason_text: '',
          original_order_item_id: item.id
        }));
        setFormData(prev => ({ ...prev, items, customer_id: order.customer_id }));
      }
    } catch (err) { console.error(err); }
  };

  const handleAddItem = () => {
    if (!newItem.product_id) return alert('Select a product');
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { ...newItem, total: newItem.quantity * newItem.unit_price }]
    }));
    setNewItem({ product_id: '', quantity: 1, unit_price: 0, return_reason_id: '', reason_text: '' });
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) return alert('Add at least one item');

    try {
      await api.post('/returns/sales', formData);
      alert('Sales return created successfully');
      setShowModal(false);
      setFormData({ original_sales_order_id: '', customer_id: '', return_date: new Date().toISOString().split('T')[0], restock_inventory: true, notes: '', items: [] });
      fetchReturns();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to create return');
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this return?')) return;
    try {
      await api.patch(`/returns/sales/${id}/approve`);
      alert('Return approved');
      fetchReturns();
    } catch (err) {
      console.error(err);
      alert('Failed to approve');
    }
  };

  const handleViewDetail = async (id) => {
    try {
      const res = await api.get(`/returns/sales/${id}`);
      setSelectedReturn(res.data);
    } catch (err) { console.error(err); }
  };

  const statusBadge = (status) => {
    const colors = { pending: '#f59e0b', approved: '#10b981', rejected: '#ef4444' };
    return <span style={{ background: colors[status] || '#6b7280', color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 12 }}>{status}</span>;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(16px, 3vw, 24px)' }}>
        <h2 style={{ margin: 0, fontSize: 'clamp(18px, 4vw, 24px)' }}>Sales Returns</h2>
        <button onClick={() => setShowModal(true)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: 'clamp(8px, 2vw, 10px) clamp(14px, 3vw, 20px)', borderRadius: 8, cursor: 'pointer', fontSize: 'clamp(13px, 2.5vw, 14px)', whiteSpace: 'nowrap' }}>+ New Return</button>
      </div>

      {loading ? <p>Loading...</p> : (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
          <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                <th style={thStyle}>Return #</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={tdStyle}>{r.return_number}</td>
                  <td style={tdStyle}>{r.customer_name || '-'}</td>
                  <td style={tdStyle}>{new Date(r.return_date).toLocaleDateString()}</td>
                  <td style={tdStyle}>${parseFloat(r.total_amount || 0).toFixed(2)}</td>
                  <td style={tdStyle}>{statusBadge(r.status)}</td>
                  <td style={tdStyle}>
                    <button onClick={() => handleViewDetail(r.id)} style={btnStyle}>View</button>
                    {r.status === 'pending' && <button onClick={() => handleApprove(r.id)} style={{ ...btnStyle, background: '#10b981' }}>Approve</button>}
                  </td>
                </tr>
              ))}
              {returns.length === 0 && <tr><td colSpan={6} style={{ padding: 'clamp(16px, 3vw, 24px)', textAlign: 'center' }}>No sales returns found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 'clamp(20px, 4vw, 32px)', width: 'min(700px, 100%)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 'clamp(16px, 3.5vw, 20px)' }}>New Sales Return</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Sales Order</label>
                  <select value={formData.original_sales_order_id} onChange={e => { setFormData(prev => ({ ...prev, original_sales_order_id: e.target.value })); handleOrderSelect(e.target.value); }} style={inputStyle}>
                    <option value="">Select Order</option>
                    {orders.map(o => <option key={o.id} value={o.id}>{o.order_number} - {o.customer_name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Customer</label>
                  <select value={formData.customer_id} onChange={e => setFormData(prev => ({ ...prev, customer_id: e.target.value }))} style={inputStyle} required>
                    <option value="">Select Customer</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Return Date</label>
                  <input type="date" value={formData.return_date} onChange={e => setFormData(prev => ({ ...prev, return_date: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>
                    <input type="checkbox" checked={formData.restock_inventory} onChange={e => setFormData(prev => ({ ...prev, restock_inventory: e.target.checked }))} style={{ marginRight: 8 }} />
                    Restock Inventory
                  </label>
                </div>
              </div>

              <h4 style={{ marginBottom: 12, fontSize: 'clamp(14px, 3vw, 16px)' }}>Items</h4>
              {formData.items.length > 0 && (
                <div style={{ overflowX: 'auto', marginBottom: 12 }}>
                <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 400 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>Product</th>
                      <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Qty</th>
                      <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Price</th>
                      <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Total</th>
                      <th style={{ padding: 8, border: '1px solid #e5e7eb' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, i) => (
                      <tr key={i}>
                        <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{products.find(p => p.id == item.product_id)?.name || `Product #${item.product_id}`}</td>
                        <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>${parseFloat(item.unit_price).toFixed(2)}</td>
                        <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>${(item.quantity * item.unit_price).toFixed(2)}</td>
                        <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                          <button type="button" onClick={() => handleRemoveItem(i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(140px, 100%), 1fr))', gap: 8, marginBottom: 16, alignItems: 'end' }}>
                <div>
                  <label style={labelStyle}>Product</label>
                  <select value={newItem.product_id} onChange={e => {
                    const p = products.find(x => x.id == e.target.value);
                    setNewItem(prev => ({ ...prev, product_id: e.target.value, unit_price: p ? p.unit_price || p.price || 0 : 0 }));
                  }} style={inputStyle}>
                    <option value="">Select</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Qty</label>
                  <input type="number" min="1" value={newItem.quantity} onChange={e => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Price</label>
                  <input type="number" step="0.01" value={newItem.unit_price} onChange={e => setNewItem(prev => ({ ...prev, unit_price: parseFloat(e.target.value) || 0 }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Reason</label>
                  <select value={newItem.return_reason_id} onChange={e => setNewItem(prev => ({ ...prev, return_reason_id: e.target.value }))} style={inputStyle}>
                    <option value="">Select</option>
                    {reasons.map(r => <option key={r.id} value={r.id}>{r.reason_name}</option>)}
                  </select>
                </div>
                <button type="button" onClick={handleAddItem} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', height: 38, alignSelf: 'end' }}>Add</button>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Notes</label>
                <textarea value={formData.notes} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} style={{ ...inputStyle, minHeight: 60 }} />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer', flex: '0 1 auto' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', flex: '0 1 auto' }}>Create Return</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedReturn && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 'clamp(20px, 4vw, 32px)', width: 'min(600px, 100%)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 'clamp(16px, 3.5vw, 20px)' }}>Return Detail - {selectedReturn.return_number}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))', gap: 12, marginBottom: 16 }}>
              <div><strong>Customer:</strong> {selectedReturn.customer_name || '-'}</div>
              <div><strong>Date:</strong> {new Date(selectedReturn.return_date).toLocaleDateString()}</div>
              <div><strong>Status:</strong> {statusBadge(selectedReturn.status)}</div>
              <div><strong>Total:</strong> ${parseFloat(selectedReturn.total_amount || 0).toFixed(2)}</div>
            </div>
            {selectedReturn.items && (
              <div style={{ overflowX: 'auto' }}>
              <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 400 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>Product</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Qty</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>Price</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>Total</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedReturn.items.map((item, i) => (
                    <tr key={i}>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{item.product_name || '-'}</td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>${parseFloat(item.unit_price).toFixed(2)}</td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>${parseFloat(item.total).toFixed(2)}</td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{item.reason_name || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
            {selectedReturn.notes && <p style={{ marginTop: 16 }}><strong>Notes:</strong> {selectedReturn.notes}</p>}
            <button onClick={() => setSelectedReturn(null)} style={{ marginTop: 16, padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const thStyle = { padding: '12px 16px', fontWeight: 600, fontSize: 13, color: '#6b7280', textTransform: 'uppercase' };
const tdStyle = { padding: '12px 16px', fontSize: 14 };
const btnStyle = { background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, marginRight: 6 };
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#374151' };
const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' };

export default SalesReturns;
