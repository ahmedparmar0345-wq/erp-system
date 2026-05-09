import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createServiceInvoice, getServiceInvoice, updateServiceInvoice, getCustomers, getServices } from '../../services/api';

const ServiceInvoiceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: '',
    terms_conditions: '',
    items: [{ service_id: '', description: '', quantity: 1, unit_price: 0, discount_percent: 0, tax_percent: 0 }]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [custRes, svcRes] = await Promise.all([getCustomers(), getServices()]);
        setCustomers(Array.isArray(custRes) ? custRes : []);
        setServices(Array.isArray(svcRes) ? svcRes : []);

        if (isEdit) {
          const inv = await getServiceInvoice(id);
          setFormData({
            customer_id: inv.customer_id || '',
            invoice_date: inv.invoice_date || '',
            due_date: inv.due_date || '',
            notes: inv.notes || '',
            terms_conditions: inv.terms_conditions || '',
            items: inv.items?.map(i => ({
              service_id: i.service_id || '',
              description: i.description || '',
              quantity: i.quantity,
              unit_price: i.unit_price,
              discount_percent: i.discount_percent || 0,
              tax_percent: i.tax_percent || 0
            })) || [{ service_id: '', description: '', quantity: 1, unit_price: 0, discount_percent: 0, tax_percent: 0 }]
          });
        }
      } catch (err) {
        console.error('Error loading form data:', err);
        alert('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEdit]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    if (field === 'service_id') {
      const svc = services.find(s => s.id === parseInt(value));
      if (svc) {
        newItems[index].unit_price = svc.unit_price;
        newItems[index].description = svc.name;
        newItems[index].tax_percent = svc.tax_percent || 0;
      }
    }
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { service_id: '', description: '', quantity: 1, unit_price: 0, discount_percent: 0, tax_percent: 0 }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  };

  const calcItemTotal = (item) => {
    const lineTotal = item.quantity * item.unit_price;
    const discount = lineTotal * ((item.discount_percent || 0) / 100);
    return lineTotal - discount;
  };

  const calcGrandTotal = () => {
    let subtotal = 0, tax_total = 0, discount_total = 0;
    formData.items.forEach(item => {
      const lineTotal = item.quantity * item.unit_price;
      const discount = lineTotal * ((item.discount_percent || 0) / 100);
      const taxable = lineTotal - discount;
      const tax = taxable * ((item.tax_percent || 0) / 100);
      subtotal += lineTotal;
      discount_total += discount;
      tax_total += tax;
    });
    return { subtotal, discount_total, tax_total, grand_total: subtotal - discount_total + tax_total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_id) { alert('Please select a customer'); return; }
    if (!formData.items.some(i => i.description)) { alert('Please add at least one item'); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await updateServiceInvoice(id, formData);
        alert('Invoice updated!');
      } else {
        await createServiceInvoice(formData);
        alert('Invoice created!');
      }
      navigate('/services/invoices');
    } catch (err) {
      alert('Failed to save: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const totals = calcGrandTotal();

  if (loading) {
    return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'400px' }}>
      <div style={{ fontSize:'14px', color:'#666' }}>Loading...</div>
    </div>;
  }

  return (
    <div style={{ maxWidth:'1000px', margin:'0 auto' }}>
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{ fontSize:'28px', fontWeight:'700', margin:0 }}>{isEdit ? 'Edit Service Invoice' : 'New Service Invoice'}</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ background:'white', borderRadius:'16px', padding:'24px', marginBottom:'20px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize:'16px', fontWeight:'600', marginBottom:'16px', marginTop:0 }}>Invoice Details</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px' }}>
            <div>
              <label style={{ display:'block', marginBottom:'6px', fontWeight:'500', fontSize:'14px' }}>Customer *</label>
              <select value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: e.target.value})} required
                style={{ width:'100%', padding:'10px 16px', border:'1px solid #e5e7eb', borderRadius:'12px', fontSize:'14px', outline:'none' }}>
                <option value="">Select Customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', marginBottom:'6px', fontWeight:'500', fontSize:'14px' }}>Invoice Date</label>
              <input type="date" value={formData.invoice_date} onChange={e => setFormData({...formData, invoice_date: e.target.value})}
                style={{ width:'100%', padding:'10px 16px', border:'1px solid #e5e7eb', borderRadius:'12px', fontSize:'14px', outline:'none' }} />
            </div>
            <div>
              <label style={{ display:'block', marginBottom:'6px', fontWeight:'500', fontSize:'14px' }}>Due Date</label>
              <input type="date" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})}
                style={{ width:'100%', padding:'10px 16px', border:'1px solid #e5e7eb', borderRadius:'12px', fontSize:'14px', outline:'none' }} />
            </div>
          </div>
        </div>

        <div style={{ background:'white', borderRadius:'16px', padding:'24px', marginBottom:'20px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
            <h3 style={{ fontSize:'16px', fontWeight:'600', margin:0 }}>Service Items</h3>
            <button type="button" onClick={addItem}
              style={{ padding:'8px 16px', background:'#10b981', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'500' }}>
              + Add Item
            </button>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table className="table-modern" style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#f9fafb', borderBottom:'1px solid #e5e7eb' }}>
                  <th style={{ padding:'12px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Service</th>
                  <th style={{ padding:'12px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Description</th>
                  <th style={{ padding:'12px', textAlign:'center', fontSize:'12px', fontWeight:'600', color:'#6b7280', width:'70px' }}>Qty</th>
                  <th style={{ padding:'12px', textAlign:'right', fontSize:'12px', fontWeight:'600', color:'#6b7280', width:'110px' }}>Price</th>
                  <th style={{ padding:'12px', textAlign:'center', fontSize:'12px', fontWeight:'600', color:'#6b7280', width:'70px' }}>Disc%</th>
                  <th style={{ padding:'12px', textAlign:'center', fontSize:'12px', fontWeight:'600', color:'#6b7280', width:'70px' }}>Tax%</th>
                  <th style={{ padding:'12px', textAlign:'right', fontSize:'12px', fontWeight:'600', color:'#6b7280', width:'100px' }}>Total</th>
                  <th style={{ padding:'12px', textAlign:'center', fontSize:'12px', fontWeight:'600', color:'#6b7280', width:'50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom:'1px solid #f3f4f6' }}>
                    <td style={{ padding:'8px' }}>
                      <select value={item.service_id} onChange={e => handleItemChange(idx, 'service_id', e.target.value)}
                        style={{ width:'100%', padding:'8px', border:'1px solid #e5e7eb', borderRadius:'8px', fontSize:'13px' }}>
                        <option value="">Select Service</option>
                        {services.filter(s => s.is_active).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </td>
                    <td style={{ padding:'8px' }}>
                      <input type="text" value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)}
                        placeholder="Description"
                        style={{ width:'100%', padding:'8px', border:'1px solid #e5e7eb', borderRadius:'8px', fontSize:'13px' }} />
                    </td>
                    <td style={{ padding:'8px' }}>
                      <input type="number" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 0)} min="1"
                        style={{ width:'100%', padding:'8px', border:'1px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', textAlign:'center' }} />
                    </td>
                    <td style={{ padding:'8px' }}>
                      <input type="number" step="0.01" value={item.unit_price}
                        onChange={e => handleItemChange(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                        style={{ width:'100%', padding:'8px', border:'1px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', textAlign:'right' }} />
                    </td>
                    <td style={{ padding:'8px' }}>
                      <input type="number" value={item.discount_percent}
                        onChange={e => handleItemChange(idx, 'discount_percent', parseFloat(e.target.value) || 0)} min="0" max="100"
                        style={{ width:'100%', padding:'8px', border:'1px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', textAlign:'center' }} />
                    </td>
                    <td style={{ padding:'8px' }}>
                      <input type="number" value={item.tax_percent}
                        onChange={e => handleItemChange(idx, 'tax_percent', parseFloat(e.target.value) || 0)} min="0" max="100"
                        style={{ width:'100%', padding:'8px', border:'1px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', textAlign:'center' }} />
                    </td>
                    <td style={{ padding:'8px', textAlign:'right', fontWeight:'600', fontSize:'14px' }}>
                      ${calcItemTotal(item).toFixed(2)}
                    </td>
                    <td style={{ padding:'8px' }}>
                      <button type="button" onClick={() => removeItem(idx)}
                        style={{ padding:'6px 10px', background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'12px' }}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ background:'white', borderRadius:'16px', padding:'24px', marginBottom:'20px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize:'16px', fontWeight:'600', marginBottom:'16px', marginTop:0 }}>Notes & Terms</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
            <div>
              <label style={{ display:'block', marginBottom:'6px', fontWeight:'500', fontSize:'14px' }}>Notes</label>
              <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows="4"
                placeholder="Internal notes..." style={{ width:'100%', padding:'10px 16px', border:'1px solid #e5e7eb', borderRadius:'12px', fontSize:'14px', resize:'vertical', outline:'none' }} />
            </div>
            <div>
              <label style={{ display:'block', marginBottom:'6px', fontWeight:'500', fontSize:'14px' }}>Terms & Conditions</label>
              <textarea value={formData.terms_conditions} onChange={e => setFormData({...formData, terms_conditions: e.target.value})} rows="4"
                placeholder="Payment terms, late fees, etc..." style={{ width:'100%', padding:'10px 16px', border:'1px solid #e5e7eb', borderRadius:'12px', fontSize:'14px', resize:'vertical', outline:'none' }} />
            </div>
          </div>
        </div>

        <div style={{ background:'white', borderRadius:'16px', padding:'24px', marginBottom:'20px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ maxWidth:'300px', marginLeft:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:'14px' }}>
              <span style={{ color:'#6b7280' }}>Subtotal:</span>
              <span>${totals.subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:'14px' }}>
              <span style={{ color:'#6b7280' }}>Discount:</span>
              <span style={{ color:'#ef4444' }}>-${totals.discount_total.toFixed(2)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:'14px' }}>
              <span style={{ color:'#6b7280' }}>Tax:</span>
              <span>${totals.tax_total.toFixed(2)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', borderTop:'2px solid #e5e7eb', fontSize:'18px', fontWeight:'700' }}>
              <span>Grand Total:</span>
              <span style={{ color:'#6366f1' }}>${totals.grand_total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end', gap:'12px' }}>
          <button type="button" onClick={() => navigate('/services/invoices')}
            style={{ padding:'10px 24px', background:'#f3f4f6', color:'#374151', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'500' }}>
            Cancel
          </button>
          <button type="submit" disabled={saving}
            style={{ padding:'10px 24px', background:saving ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color:'white', border:'none', borderRadius:'10px', cursor:saving ? 'not-allowed' : 'pointer', fontWeight:'500' }}>
            {saving ? 'Saving...' : (isEdit ? 'Update Invoice' : 'Create Invoice')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceInvoiceForm;
