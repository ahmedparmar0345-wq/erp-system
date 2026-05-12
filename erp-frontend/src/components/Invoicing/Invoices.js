import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const s = {
  page: { fontFamily: "'Inter',-apple-system,sans-serif" },
  header: { display: 'flex', flexWrap: 'wrap', gap: 'clamp(8px, 2vw, 12px)', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(16px, 3vw, 24px)' },
  title: { fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.3px' },
  btnGroup: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  btn: (bg) => ({ background: bg, color: '#fff', border: 'none', padding: 'clamp(8px, 1.5vw, 10px) clamp(14px, 2vw, 20px)', borderRadius: 8, cursor: 'pointer', fontSize: 'clamp(12px, 1.2vw, 13px)', fontWeight: 500, whiteSpace: 'nowrap' }),
  tableWrap: { background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 20px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 700 },
  th: { padding: '12px clamp(8px, 1.5vw, 16px)', fontWeight: 600, fontSize: 'clamp(11px, 1vw, 13px)', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#fafbfc', borderBottom: '2px solid #f3f4f6', textAlign: 'left', whiteSpace: 'nowrap' },
  td: { padding: '12px clamp(8px, 1.5vw, 16px)', fontSize: 'clamp(13px, 1.2vw, 14px)', color: '#374151', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' },
  btnSmall: (bg) => ({ background: bg, color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, marginRight: 4, fontWeight: 500 }),
  statusBadge: (s) => {
    const colors = { draft: '#f3f4f6', sent: '#eff6ff', partial: '#fffbeb', paid: '#f0fdf4', overdue: '#fef2f2', cancelled: '#f9fafb' };
    const textColors = { draft: '#6b7280', sent: '#2563eb', partial: '#d97706', paid: '#16a34a', overdue: '#dc2626', cancelled: '#9ca3af' };
    return { background: colors[s] || '#f3f4f6', color: textColors[s] || '#6b7280', padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, display: 'inline-block' };
  },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'clamp(12px, 3vw, 24px)' },
  modal: { background: '#fff', borderRadius: 16, padding: 'clamp(20px, 3vw, 32px)', width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto' },
  modalSm: { background: '#fff', borderRadius: 16, padding: 'clamp(20px, 3vw, 32px)', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: 'clamp(10px, 2vw, 16px)', marginBottom: 'clamp(12px, 2vw, 16px)' },
  label: { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#374151' },
  input: { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' },
  itemRow: { display: 'flex', gap: 8, marginBottom: 16, alignItems: 'end', flexWrap: 'wrap' },
  itemField: { flex: '1 0 auto', minWidth: 100 },
  itemFieldSm: { flex: '0 0 auto', width: 'clamp(50px, 10vw, 70px)' },
  itemFieldMd: { flex: '0 0 auto', width: 'clamp(80px, 15vw, 100px)' },
  itemsTable: { width: '100%', borderCollapse: 'collapse', marginBottom: 12, fontSize: 13, minWidth: 400 },
  itemsTh: { padding: '8px clamp(4px, 1vw, 10px)', border: '1px solid #e5e7eb', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', background: '#fafbfc', whiteSpace: 'nowrap' },
  itemsTd: { padding: '8px clamp(4px, 1vw, 10px)', border: '1px solid #e5e7eb', fontSize: 13 },
  empty: { padding: 'clamp(20px, 3vw, 32px)', textAlign: 'center', color: '#9ca3af', fontSize: 14 },
  viewGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))', gap: 'clamp(8px, 1.5vw, 12px)', marginBottom: 16, fontSize: 14 },
  loader: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, color: '#6b7280', fontSize: 14 },
};

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payInvoiceId, setPayInvoiceId] = useState(null);
  const [payForm, setPayForm] = useState({ payment_date: new Date().toISOString().split('T')[0], amount: '', payment_method: 'bank_transfer', reference_number: '', notes: '' });
  const [formMode, setFormMode] = useState('manual');
  const [formData, setFormData] = useState({ customer_id: '', invoice_date: new Date().toISOString().split('T')[0], due_date: '', payment_terms: '', notes: '', items: [] });
  const [newItem, setNewItem] = useState({ product_id: '', description: '', quantity: 1, unit_price: 0, discount_percent: 0, tax_percent: 0 });
  const [selectedOrderId, setSelectedOrderId] = useState('');

  useEffect(() => { fetchInvoices(); fetchCustomers(); fetchProducts(); fetchOrders(); }, []);

  const fetchInvoices = async () => {
    try { setLoading(true); const res = await api.get('/invoices'); setInvoices(Array.isArray(res.data) ? res.data : []); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchCustomers = async () => { try { const res = await api.get('/customers'); setCustomers(Array.isArray(res.data) ? res.data : []); } catch (err) { console.error(err); } };
  const fetchProducts = async () => { try { const res = await api.get('/products'); setProducts(Array.isArray(res.data) ? res.data : []); } catch (err) { console.error(err); } };
  const fetchOrders = async () => { try { const res = await api.get('/sales-orders'); setOrders(Array.isArray(res.data) ? res.data : []); } catch (err) { console.error(err); } };

  const handleCreateFromOrder = async () => {
    if (!selectedOrderId) return alert('Select an order');
    try {
      await api.post(`/invoices/from-order/${selectedOrderId}`, { due_date: formData.due_date, payment_terms: formData.payment_terms, notes: formData.notes });
      alert('Invoice created from order'); setShowModal(false); setSelectedOrderId(''); fetchInvoices();
    } catch (err) { console.error(err); alert(err.response?.data?.error || 'Failed'); }
  };

  const handleAddItem = () => {
    if (!newItem.product_id && !newItem.description) return alert('Add a product or description');
    setFormData(prev => ({ ...prev, items: [...prev.items, { ...newItem, total: newItem.quantity * newItem.unit_price * (1 - (newItem.discount_percent || 0) / 100) * (1 + (newItem.tax_percent || 0) / 100) }] }));
    setNewItem({ product_id: '', description: '', quantity: 1, unit_price: 0, discount_percent: 0, tax_percent: 0 });
  };

  const handleRemoveItem = (i) => { setFormData(prev => ({ ...prev, items: prev.items.filter((_, idx) => idx !== i) })); };

  const handleSubmitManual = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) return alert('Add at least one item');
    try {
      await api.post('/invoices', formData);
      alert('Invoice created'); setShowModal(false); setFormData({ customer_id: '', invoice_date: new Date().toISOString().split('T')[0], due_date: '', payment_terms: '', notes: '', items: [] }); fetchInvoices();
    } catch (err) { console.error(err); alert(err.response?.data?.error || 'Failed'); }
  };

  const handleView = async (id) => { try { const res = await api.get(`/invoices/${id}`); setSelectedInvoice(res.data); } catch (err) { console.error(err); } };

  const handleStatusChange = async (id, status) => {
    try { await api.patch(`/invoices/${id}/status`, { status }); fetchInvoices(); if (selectedInvoice) handleView(id); }
    catch (err) { console.error(err); alert('Failed to update status'); }
  };

  const openPayment = (id, amount) => { setPayInvoiceId(id); setPayForm(prev => ({ ...prev, amount: amount || '' })); setShowPaymentModal(true); };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!payForm.amount || parseFloat(payForm.amount) <= 0) return alert('Valid amount required');
    try {
      await api.post(`/invoices/${payInvoiceId}/payments`, payForm);
      alert('Payment recorded'); setShowPaymentModal(false); setPayInvoiceId(null); setPayForm({ payment_date: new Date().toISOString().split('T')[0], amount: '', payment_method: 'bank_transfer', reference_number: '', notes: '' }); fetchInvoices();
    } catch (err) { console.error(err); alert(err.response?.data?.error || 'Failed'); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={s.page}>
      <div style={s.header}>
        <h2 style={s.title}>Invoices</h2>
        <div style={s.btnGroup}>
          <button onClick={() => { setFormMode('from-order'); setShowModal(true); }} style={s.btn('#8b5cf6')}>+ From Order</button>
          <button onClick={() => { setFormMode('manual'); setShowModal(true); }} style={s.btn('#3b82f6')}>+ New Invoice</button>
        </div>
      </div>

      {loading ? <div style={s.loader}>Loading...</div> : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Invoice #</th>
                <th style={s.th}>Customer</th>
                <th style={s.th}>Date</th>
                <th style={s.th}>Due Date</th>
                <th style={s.th}>Total</th>
                <th style={s.th}>Paid</th>
                <th style={s.th}>Balance</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} style={{ transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ ...s.td, fontWeight: 600 }}>{inv.invoice_number}</td>
                  <td style={s.td}>{inv.customer_name || '-'}</td>
                  <td style={s.td}>{new Date(inv.invoice_date).toLocaleDateString()}</td>
                  <td style={s.td}>{new Date(inv.due_date).toLocaleDateString()}</td>
                  <td style={s.td}>${parseFloat(inv.grand_total).toFixed(2)}</td>
                  <td style={s.td}>${parseFloat(inv.amount_paid || 0).toFixed(2)}</td>
                  <td style={s.td}>${parseFloat(inv.balance_due || inv.grand_total).toFixed(2)}</td>
                  <td style={s.td}><span style={s.statusBadge(inv.status)}>{inv.status}</span></td>
                  <td style={s.td}>
                    <button onClick={() => handleView(inv.id)} style={s.btnSmall('#3b82f6')}>View</button>
                    {inv.status === 'draft' && <button onClick={() => handleStatusChange(inv.id, 'sent')} style={s.btnSmall('#8b5cf6')}>Send</button>}
                    {['draft', 'sent', 'partial'].includes(inv.status) && <button onClick={() => openPayment(inv.id, inv.balance_due || inv.grand_total)} style={s.btnSmall('#10b981')}>Pay</button>}
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && <tr><td colSpan={9} style={s.empty}>No invoices found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            {formMode === 'from-order' ? (
              <>
                <h3 style={{ margin: '0 0 20px', fontSize: 'clamp(16px, 2.5vw, 20px)' }}>Create Invoice from Sales Order</h3>
                <div style={s.formGrid}>
                  <div>
                    <label style={s.label}>Sales Order</label>
                    <select value={selectedOrderId} onChange={e => setSelectedOrderId(e.target.value)} style={s.input}>
                      <option value="">Select Order</option>
                      {orders.filter(o => o.status !== 'invoiced').map(o => <option key={o.id} value={o.id}>{o.order_number} - {o.customer_name} (${parseFloat(o.grand_total).toFixed(2)})</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={s.label}>Due Date</label>
                    <input type="date" value={formData.due_date} onChange={e => setFormData(prev => ({ ...prev, due_date: e.target.value }))} style={s.input} />
                  </div>
                  <div>
                    <label style={s.label}>Payment Terms</label>
                    <input value={formData.payment_terms} onChange={e => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))} style={s.input} placeholder="e.g. Net 30" />
                  </div>
                  <div>
                    <label style={s.label}>Notes</label>
                    <textarea value={formData.notes} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} style={{ ...s.input, minHeight: 60 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button onClick={() => setShowModal(false)} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                  <button onClick={handleCreateFromOrder} style={{ padding: '10px 24px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Create Invoice</button>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ margin: '0 0 20px', fontSize: 'clamp(16px, 2.5vw, 20px)' }}>New Manual Invoice</h3>
                <form onSubmit={handleSubmitManual}>
                  <div style={s.formGrid}>
                    <div>
                      <label style={s.label}>Customer *</label>
                      <select value={formData.customer_id} onChange={e => setFormData(prev => ({ ...prev, customer_id: e.target.value }))} style={s.input} required>
                        <option value="">Select Customer</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={s.label}>Invoice Date</label>
                      <input type="date" value={formData.invoice_date} onChange={e => setFormData(prev => ({ ...prev, invoice_date: e.target.value }))} style={s.input} />
                    </div>
                    <div>
                      <label style={s.label}>Due Date *</label>
                      <input type="date" value={formData.due_date} onChange={e => setFormData(prev => ({ ...prev, due_date: e.target.value }))} style={s.input} required />
                    </div>
                    <div>
                      <label style={s.label}>Payment Terms</label>
                      <input value={formData.payment_terms} onChange={e => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))} style={s.input} placeholder="Net 30" />
                    </div>
                  </div>

                  <h4 style={{ marginBottom: 12, fontSize: 'clamp(14px, 1.5vw, 16px)' }}>Items</h4>
                  {formData.items.length > 0 && (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={s.itemsTable}>
                        <thead>
                          <tr>
                            <th style={s.itemsTh}>Product</th>
                            <th style={{ ...s.itemsTh, textAlign: 'center' }}>Qty</th>
                            <th style={{ ...s.itemsTh, textAlign: 'right' }}>Price</th>
                            <th style={{ ...s.itemsTh, textAlign: 'center' }}>Disc%</th>
                            <th style={{ ...s.itemsTh, textAlign: 'center' }}>Tax%</th>
                            <th style={{ ...s.itemsTh, textAlign: 'right' }}>Total</th>
                            <th style={s.itemsTh}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.items.map((item, i) => (
                            <tr key={i}>
                              <td style={s.itemsTd}>{products.find(p => p.id == item.product_id)?.name || item.description || '-'}</td>
                              <td style={{ ...s.itemsTd, textAlign: 'center' }}>{item.quantity}</td>
                              <td style={{ ...s.itemsTd, textAlign: 'right' }}>${parseFloat(item.unit_price).toFixed(2)}</td>
                              <td style={{ ...s.itemsTd, textAlign: 'center' }}>{item.discount_percent || 0}%</td>
                              <td style={{ ...s.itemsTd, textAlign: 'center' }}>{item.tax_percent || 0}%</td>
                              <td style={{ ...s.itemsTd, textAlign: 'right' }}>${(item.total || 0).toFixed(2)}</td>
                              <td style={{ ...s.itemsTd, textAlign: 'center' }}><button type="button" onClick={() => handleRemoveItem(i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>✕</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div style={s.itemRow}>
                    <div style={s.itemField}>
                      <label style={s.label}>Product</label>
                      <select value={newItem.product_id} onChange={e => {
                        const p = products.find(x => x.id == e.target.value);
                        setNewItem(prev => ({ ...prev, product_id: e.target.value, unit_price: p ? p.unit_price || p.price || 0 : 0 }));
                      }} style={s.input}>
                        <option value="">Select</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div style={s.itemField}>
                      <label style={s.label}>Or Description</label>
                      <input value={newItem.description} onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))} style={s.input} placeholder="Custom item" />
                    </div>
                    <div style={s.itemFieldSm}>
                      <label style={s.label}>Qty</label>
                      <input type="number" min="1" value={newItem.quantity} onChange={e => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))} style={s.input} />
                    </div>
                    <div style={s.itemFieldMd}>
                      <label style={s.label}>Price</label>
                      <input type="number" step="0.01" value={newItem.unit_price} onChange={e => setNewItem(prev => ({ ...prev, unit_price: parseFloat(e.target.value) || 0 }))} style={s.input} />
                    </div>
                    <button type="button" onClick={handleAddItem} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', height: 38, flexShrink: 0, fontSize: 13 }}>Add</button>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={s.label}>Notes</label>
                    <textarea value={formData.notes} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} style={{ ...s.input, minHeight: 60 }} />
                  </div>

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                    <button type="submit" style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Create Invoice</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {selectedInvoice && (
        <div style={s.overlay} onClick={() => setSelectedInvoice(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: 'clamp(16px, 2.5vw, 20px)' }}>{selectedInvoice.invoice_number}</h3>
              <span style={s.statusBadge(selectedInvoice.status)}>{selectedInvoice.status}</span>
            </div>
            <div style={s.viewGrid}>
              <div><strong>Customer:</strong> {selectedInvoice.customer_name || '-'}</div>
              <div><strong>Date:</strong> {new Date(selectedInvoice.invoice_date).toLocaleDateString()}</div>
              <div><strong>Due Date:</strong> {new Date(selectedInvoice.due_date).toLocaleDateString()}</div>
              <div><strong>Status:</strong> {selectedInvoice.status}</div>
              <div><strong>Subtotal:</strong> ${parseFloat(selectedInvoice.subtotal || 0).toFixed(2)}</div>
              <div><strong>Tax:</strong> ${parseFloat(selectedInvoice.tax_total || 0).toFixed(2)}</div>
              <div><strong>Grand Total:</strong> ${parseFloat(selectedInvoice.grand_total || 0).toFixed(2)}</div>
              <div><strong>Paid:</strong> ${parseFloat(selectedInvoice.amount_paid || 0).toFixed(2)}</div>
              <div><strong>Balance:</strong> ${parseFloat(selectedInvoice.balance_due || 0).toFixed(2)}</div>
              {selectedInvoice.payment_terms && <div><strong>Terms:</strong> {selectedInvoice.payment_terms}</div>}
            </div>

            {selectedInvoice.items && selectedInvoice.items.length > 0 && (
              <>
                <h4 style={{ marginBottom: 8, fontSize: 'clamp(14px, 1.5vw, 15px)' }}>Items</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16, minWidth: 350 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ padding: '8px clamp(4px, 1vw, 10px)', border: '1px solid #e5e7eb', textAlign: 'left' }}>Product</th>
                        <th style={{ padding: '8px clamp(4px, 1vw, 10px)', border: '1px solid #e5e7eb', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '8px clamp(4px, 1vw, 10px)', border: '1px solid #e5e7eb', textAlign: 'right' }}>Price</th>
                        <th style={{ padding: '8px clamp(4px, 1vw, 10px)', border: '1px solid #e5e7eb', textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item, i) => (
                        <tr key={i}>
                          <td style={{ padding: '8px clamp(4px, 1vw, 10px)', border: '1px solid #e5e7eb' }}>{item.product_name || item.description || '-'}</td>
                          <td style={{ padding: '8px clamp(4px, 1vw, 10px)', border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.quantity}</td>
                          <td style={{ padding: '8px clamp(4px, 1vw, 10px)', border: '1px solid #e5e7eb', textAlign: 'right' }}>${parseFloat(item.unit_price).toFixed(2)}</td>
                          <td style={{ padding: '8px clamp(4px, 1vw, 10px)', border: '1px solid #e5e7eb', textAlign: 'right' }}>${parseFloat(item.total).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
              <>
                <h4 style={{ marginBottom: 8, fontSize: 'clamp(14px, 1.5vw, 15px)' }}>Payments</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16, minWidth: 350 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ padding: '8px clamp(4px, 1vw, 10px)', border: '1px solid #e5e7eb' }}>Date</th>
                        <th style={{ padding: '8px clamp(4px, 1vw, 10px)', border: '1px solid #e5e7eb', textAlign: 'right' }}>Amount</th>
                        <th style={{ padding: '8px clamp(4px, 1vw, 10px)', border: '1px solid #e5e7eb' }}>Method</th>
                        <th style={{ padding: '8px clamp(4px, 1vw, 10px)', border: '1px solid #e5e7eb' }}>Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.payments.map((p, i) => (
                        <tr key={i}>
                          <td style={{ padding: '8px clamp(4px, 1vw, 10px)', border: '1px solid #e5e7eb' }}>{new Date(p.payment_date).toLocaleDateString()}</td>
                          <td style={{ padding: '8px clamp(4px, 1vw, 10px)', border: '1px solid #e5e7eb', textAlign: 'right' }}>${parseFloat(p.amount).toFixed(2)}</td>
                          <td style={{ padding: '8px clamp(4px, 1vw, 10px)', border: '1px solid #e5e7eb' }}>{p.payment_method}</td>
                          <td style={{ padding: '8px clamp(4px, 1vw, 10px)', border: '1px solid #e5e7eb' }}>{p.reference_number || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {selectedInvoice.notes && <p style={{ fontSize: 14 }}><strong>Notes:</strong> {selectedInvoice.notes}</p>}

            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              <button onClick={() => setSelectedInvoice(null)} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13 }}>Close</button>
              {['draft', 'sent', 'partial'].includes(selectedInvoice.status) && (
                <button onClick={() => { setSelectedInvoice(null); openPayment(selectedInvoice.id, selectedInvoice.balance_due || selectedInvoice.grand_total); }} style={{ padding: '10px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Record Payment</button>
              )}
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div style={s.overlay} onClick={() => { setShowPaymentModal(false); setPayInvoiceId(null); }}>
          <div style={s.modalSm} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', fontSize: 'clamp(16px, 2.5vw, 20px)' }}>Record Payment</h3>
            <form onSubmit={handleRecordPayment}>
              <div style={s.formGrid}>
                <div>
                  <label style={s.label}>Payment Date</label>
                  <input type="date" value={payForm.payment_date} onChange={e => setPayForm(prev => ({ ...prev, payment_date: e.target.value }))} style={s.input} />
                </div>
                <div>
                  <label style={s.label}>Amount *</label>
                  <input type="number" step="0.01" min="0.01" value={payForm.amount} onChange={e => setPayForm(prev => ({ ...prev, amount: e.target.value }))} style={s.input} required />
                </div>
                <div>
                  <label style={s.label}>Payment Method</label>
                  <select value={payForm.payment_method} onChange={e => setPayForm(prev => ({ ...prev, payment_method: e.target.value }))} style={s.input}>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={s.label}>Reference Number</label>
                  <input value={payForm.reference_number} onChange={e => setPayForm(prev => ({ ...prev, reference_number: e.target.value }))} style={s.input} />
                </div>
                <div>
                  <label style={s.label}>Notes</label>
                  <textarea value={payForm.notes} onChange={e => setPayForm(prev => ({ ...prev, notes: e.target.value }))} style={{ ...s.input, minHeight: 60 }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => { setShowPaymentModal(false); setPayInvoiceId(null); }} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Invoices;
