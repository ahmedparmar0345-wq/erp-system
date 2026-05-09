import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
  const [formData, setFormData] = useState({
    customer_id: '', invoice_date: new Date().toISOString().split('T')[0], due_date: '', payment_terms: '', notes: '', items: []
  });
  const [newItem, setNewItem] = useState({ product_id: '', description: '', quantity: 1, unit_price: 0, discount_percent: 0, tax_percent: 0 });
  const [selectedOrderId, setSelectedOrderId] = useState('');

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
    fetchProducts();
    fetchOrders();
  }, []);

  const token = () => localStorage.getItem('token');
  const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}` });

  const fetchInvoices = async () => {
    try { setLoading(true); const res = await fetch('http://localhost:3000/api/invoices', { headers: headers() }); const d = await res.json(); setInvoices(Array.isArray(d) ? d : []); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchCustomers = async () => {
    try { const res = await fetch('http://localhost:3000/api/customers', { headers: headers() }); const d = await res.json(); setCustomers(Array.isArray(d) ? d : []); }
    catch (err) { console.error(err); }
  };

  const fetchProducts = async () => {
    try { const res = await fetch('http://localhost:3000/api/products', { headers: headers() }); const d = await res.json(); setProducts(Array.isArray(d) ? d : []); }
    catch (err) { console.error(err); }
  };

  const fetchOrders = async () => {
    try { const res = await fetch('http://localhost:3000/api/sales-orders', { headers: headers() }); const d = await res.json(); setOrders(Array.isArray(d) ? d : []); }
    catch (err) { console.error(err); }
  };

  const handleCreateFromOrder = async () => {
    if (!selectedOrderId) return alert('Select an order');
    try {
      const res = await fetch(`http://localhost:3000/api/invoices/from-order/${selectedOrderId}`, {
        method: 'POST', headers: headers(), body: JSON.stringify({ due_date: formData.due_date, payment_terms: formData.payment_terms, notes: formData.notes })
      });
      if (res.ok) { alert('Invoice created from order'); setShowModal(false); setSelectedOrderId(''); fetchInvoices(); }
      else { const e = await res.json(); alert(e.error || 'Failed'); }
    } catch (err) { console.error(err); }
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
      const res = await fetch('http://localhost:3000/api/invoices', {
        method: 'POST', headers: headers(), body: JSON.stringify(formData)
      });
      if (res.ok) { alert('Invoice created'); setShowModal(false); setFormData({ customer_id: '', invoice_date: new Date().toISOString().split('T')[0], due_date: '', payment_terms: '', notes: '', items: [] }); fetchInvoices(); }
      else { const e = await res.json(); alert(e.error || 'Failed'); }
    } catch (err) { console.error(err); }
  };

  const handleView = async (id) => {
    try { const res = await fetch(`http://localhost:3000/api/invoices/${id}`, { headers: headers() }); const d = await res.json(); setSelectedInvoice(d); }
    catch (err) { console.error(err); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:3000/api/invoices/${id}/status`, {
        method: 'PATCH', headers: headers(), body: JSON.stringify({ status })
      });
      if (res.ok) { fetchInvoices(); if (selectedInvoice) handleView(id); }
      else alert('Failed to update status');
    } catch (err) { console.error(err); }
  };

  const openPayment = (id, amount) => {
    setPayInvoiceId(id);
    setPayForm(prev => ({ ...prev, amount: amount || '' }));
    setShowPaymentModal(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!payForm.amount || parseFloat(payForm.amount) <= 0) return alert('Valid amount required');
    try {
      const res = await fetch(`http://localhost:3000/api/invoices/${payInvoiceId}/payments`, {
        method: 'POST', headers: headers(), body: JSON.stringify(payForm)
      });
      if (res.ok) { alert('Payment recorded'); setShowPaymentModal(false); setPayInvoiceId(null); setPayForm({ payment_date: new Date().toISOString().split('T')[0], amount: '', payment_method: 'bank_transfer', reference_number: '', notes: '' }); fetchInvoices(); }
      else { const e = await res.json(); alert(e.error || 'Failed'); }
    } catch (err) { console.error(err); }
  };

  const statusBadge = (s) => {
    const colors = { draft: '#6b7280', sent: '#3b82f6', partial: '#f59e0b', paid: '#10b981', overdue: '#ef4444', cancelled: '#9ca3af' };
    return <span style={{ background: colors[s] || '#6b7280', color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 12 }}>{s}</span>;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Invoices</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { setFormMode('from-order'); setShowModal(true); }} style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>+ From Order</button>
          <button onClick={() => { setFormMode('manual'); setShowModal(true); }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>+ New Invoice</button>
        </div>
      </div>

      {loading ? <p>Loading...</p> : (
        <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                <th style={thStyle}>Invoice #</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Due Date</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Paid</th>
                <th style={thStyle}>Balance</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={tdStyle}>{inv.invoice_number}</td>
                  <td style={tdStyle}>{inv.customer_name || '-'}</td>
                  <td style={tdStyle}>{new Date(inv.invoice_date).toLocaleDateString()}</td>
                  <td style={tdStyle}>{new Date(inv.due_date).toLocaleDateString()}</td>
                  <td style={tdStyle}>${parseFloat(inv.grand_total).toFixed(2)}</td>
                  <td style={tdStyle}>${parseFloat(inv.amount_paid || 0).toFixed(2)}</td>
                  <td style={tdStyle}>${parseFloat(inv.balance_due || inv.grand_total).toFixed(2)}</td>
                  <td style={tdStyle}>{statusBadge(inv.status)}</td>
                  <td style={tdStyle}>
                    <button onClick={() => handleView(inv.id)} style={btnStyle}>View</button>
                    {inv.status === 'draft' && <button onClick={() => handleStatusChange(inv.id, 'sent')} style={{ ...btnStyle, background: '#8b5cf6' }}>Send</button>}
                    {['draft', 'sent', 'partial'].includes(inv.status) && <button onClick={() => openPayment(inv.id, inv.balance_due || inv.grand_total)} style={{ ...btnStyle, background: '#10b981' }}>Pay</button>}
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && <tr><td colSpan={9} style={{ padding: 24, textAlign: 'center' }}>No invoices found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 700, maxHeight: '90vh', overflowY: 'auto' }}>
            {formMode === 'from-order' ? (
              <>
                <h3 style={{ margin: '0 0 20px' }}>Create Invoice from Sales Order</h3>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Sales Order</label>
                  <select value={selectedOrderId} onChange={e => setSelectedOrderId(e.target.value)} style={inputStyle}>
                    <option value="">Select Order</option>
                    {orders.filter(o => o.status !== 'invoiced').map(o => <option key={o.id} value={o.id}>{o.order_number} - {o.customer_name} (${parseFloat(o.grand_total).toFixed(2)})</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Due Date</label>
                  <input type="date" value={formData.due_date} onChange={e => setFormData(prev => ({ ...prev, due_date: e.target.value }))} style={inputStyle} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Payment Terms</label>
                  <input value={formData.payment_terms} onChange={e => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))} style={inputStyle} placeholder="e.g. Net 30" />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Notes</label>
                  <textarea value={formData.notes} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} style={{ ...inputStyle, minHeight: 60 }} />
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowModal(false)} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleCreateFromOrder} style={{ padding: '10px 24px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Create Invoice</button>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ margin: '0 0 20px' }}>New Manual Invoice</h3>
                <form onSubmit={handleSubmitManual}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={labelStyle}>Customer *</label>
                      <select value={formData.customer_id} onChange={e => setFormData(prev => ({ ...prev, customer_id: e.target.value }))} style={inputStyle} required>
                        <option value="">Select Customer</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Invoice Date</label>
                      <input type="date" value={formData.invoice_date} onChange={e => setFormData(prev => ({ ...prev, invoice_date: e.target.value }))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Due Date *</label>
                      <input type="date" value={formData.due_date} onChange={e => setFormData(prev => ({ ...prev, due_date: e.target.value }))} style={inputStyle} required />
                    </div>
                    <div>
                      <label style={labelStyle}>Payment Terms</label>
                      <input value={formData.payment_terms} onChange={e => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))} style={inputStyle} placeholder="Net 30" />
                    </div>
                  </div>

                  <h4 style={{ marginBottom: 12 }}>Items</h4>
                  {formData.items.length > 0 && (
                    <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12, fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>Product</th>
                          <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Qty</th>
                          <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Price</th>
                          <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Disc%</th>
                          <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Tax%</th>
                          <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Total</th>
                          <th style={{ padding: 8, border: '1px solid #e5e7eb' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.map((item, i) => (
                          <tr key={i}>
                            <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{products.find(p => p.id == item.product_id)?.name || item.description || '-'}</td>
                            <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.quantity}</td>
                            <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>${parseFloat(item.unit_price).toFixed(2)}</td>
                            <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.discount_percent || 0}%</td>
                            <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.tax_percent || 0}%</td>
                            <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>${(item.total || 0).toFixed(2)}</td>
                            <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'center' }}><button type="button" onClick={() => handleRemoveItem(i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <label style={labelStyle}>Product</label>
                      <select value={newItem.product_id} onChange={e => {
                        const p = products.find(x => x.id == e.target.value);
                        setNewItem(prev => ({ ...prev, product_id: e.target.value, unit_price: p ? p.unit_price || p.price || 0 : 0 }));
                      }} style={inputStyle}>
                        <option value="">Select</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div style={{ minWidth: 120 }}>
                      <label style={labelStyle}>Or Description</label>
                      <input value={newItem.description} onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))} style={inputStyle} placeholder="Custom item" />
                    </div>
                    <div style={{ width: 60 }}>
                      <label style={labelStyle}>Qty</label>
                      <input type="number" min="1" value={newItem.quantity} onChange={e => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))} style={inputStyle} />
                    </div>
                    <div style={{ width: 90 }}>
                      <label style={labelStyle}>Price</label>
                      <input type="number" step="0.01" value={newItem.unit_price} onChange={e => setNewItem(prev => ({ ...prev, unit_price: parseFloat(e.target.value) || 0 }))} style={inputStyle} />
                    </div>
                    <button type="button" onClick={handleAddItem} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', height: 38 }}>Add</button>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Notes</label>
                    <textarea value={formData.notes} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} style={{ ...inputStyle, minHeight: 60 }} />
                  </div>

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Create Invoice</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {selectedInvoice && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 700, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>{selectedInvoice.invoice_number}</h3>
              {statusBadge(selectedInvoice.status)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, fontSize: 14 }}>
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
                <h4 style={{ marginBottom: 8 }}>Items</h4>
                <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>Product</th>
                      <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Qty</th>
                      <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>Price</th>
                      <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item, i) => (
                      <tr key={i}>
                        <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{item.product_name || item.description || '-'}</td>
                        <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>${parseFloat(item.unit_price).toFixed(2)}</td>
                        <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>${parseFloat(item.total).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
              <>
                <h4 style={{ marginBottom: 8 }}>Payments</h4>
                <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Date</th>
                      <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Method</th>
                      <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.payments.map((p, i) => (
                      <tr key={i}>
                        <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{new Date(p.payment_date).toLocaleDateString()}</td>
                        <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>${parseFloat(p.amount).toFixed(2)}</td>
                        <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{p.payment_method}</td>
                        <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{p.reference_number || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {selectedInvoice.notes && <p><strong>Notes:</strong> {selectedInvoice.notes}</p>}

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={() => setSelectedInvoice(null)} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Close</button>
              {['draft', 'sent', 'partial'].includes(selectedInvoice.status) && (
                <button onClick={() => { setSelectedInvoice(null); openPayment(selectedInvoice.id, selectedInvoice.balance_due || selectedInvoice.grand_total); }} style={{ padding: '10px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Record Payment</button>
              )}
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 450, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px' }}>Record Payment</h3>
            <form onSubmit={handleRecordPayment}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Payment Date</label>
                <input type="date" value={payForm.payment_date} onChange={e => setPayForm(prev => ({ ...prev, payment_date: e.target.value }))} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Amount *</label>
                <input type="number" step="0.01" min="0.01" value={payForm.amount} onChange={e => setPayForm(prev => ({ ...prev, amount: e.target.value }))} style={inputStyle} required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Payment Method</label>
                <select value={payForm.payment_method} onChange={e => setPayForm(prev => ({ ...prev, payment_method: e.target.value }))} style={inputStyle}>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Reference Number</label>
                <input value={payForm.reference_number} onChange={e => setPayForm(prev => ({ ...prev, reference_number: e.target.value }))} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Notes</label>
                <textarea value={payForm.notes} onChange={e => setPayForm(prev => ({ ...prev, notes: e.target.value }))} style={{ ...inputStyle, minHeight: 60 }} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowPaymentModal(false); setPayInvoiceId(null); }} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Record Payment</button>
              </div>
            </form>
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

export default Invoices;
