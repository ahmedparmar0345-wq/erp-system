import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTaxRates, createTaxRate, updateTaxRate } from '../../services/api';

const TaxRateForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '', rate: '', type: 'VAT', is_default: false, is_active: true, description: ''
  });

  useEffect(() => {
    if (isEdit) {
      (async () => {
        try {
          const rates = await getTaxRates();
          const rate = rates.find(r => r.id === parseInt(id));
          if (rate) {
            setFormData({
              name: rate.name || '',
              rate: rate.rate || '',
              type: rate.type || 'VAT',
              is_default: rate.is_default || false,
              is_active: rate.is_active !== false,
              description: rate.description || ''
            });
          }
        } catch (err) {
          alert('Tax rate not found');
          navigate('/tax');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id, isEdit, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { alert('Tax name is required'); return; }
    if (!formData.rate && formData.rate !== 0) { alert('Tax rate is required'); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await updateTaxRate(id, formData);
        alert('Tax rate updated!');
      } else {
        await createTaxRate(formData);
        alert('Tax rate created!');
      }
      navigate('/tax');
    } catch (err) {
      alert('Failed to save: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'400px' }}>
      <div style={{ fontSize:'14px', color:'#666' }}>Loading...</div>
    </div>;
  }

  return (
    <div style={{ maxWidth:'600px', margin:'0 auto' }}>
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{ fontSize:'28px', fontWeight:'700', margin:0 }}>{isEdit ? 'Edit Tax Rate' : 'New Tax Rate'}</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ background:'white', borderRadius:'16px', padding:'24px', marginBottom:'20px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom:'16px' }}>
            <label style={{ display:'block', marginBottom:'6px', fontWeight:'500', fontSize:'14px' }}>Tax Name *</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required
              placeholder="e.g. Standard VAT, GST 18%, Sales Tax"
              style={{ width:'100%', padding:'10px 16px', border:'1px solid #e5e7eb', borderRadius:'12px', fontSize:'14px', outline:'none' }} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
            <div>
              <label style={{ display:'block', marginBottom:'6px', fontWeight:'500', fontSize:'14px' }}>Rate (%) *</label>
              <input type="number" step="0.01" min="0" max="100" value={formData.rate}
                onChange={e => setFormData({...formData, rate: e.target.value})} required
                placeholder="e.g. 20"
                style={{ width:'100%', padding:'10px 16px', border:'1px solid #e5e7eb', borderRadius:'12px', fontSize:'14px', outline:'none' }} />
            </div>
            <div>
              <label style={{ display:'block', marginBottom:'6px', fontWeight:'500', fontSize:'14px' }}>Tax Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                style={{ width:'100%', padding:'10px 16px', border:'1px solid #e5e7eb', borderRadius:'12px', fontSize:'14px', outline:'none' }}>
                <option value="VAT">VAT</option>
                <option value="GST">GST</option>
                <option value="Sales Tax">Sales Tax</option>
                <option value="Withholding">Withholding</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom:'16px' }}>
            <label style={{ display:'block', marginBottom:'6px', fontWeight:'500', fontSize:'14px' }}>Description</label>
            <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="e.g. Standard rate for goods and services"
              style={{ width:'100%', padding:'10px 16px', border:'1px solid #e5e7eb', borderRadius:'12px', fontSize:'14px', outline:'none' }} />
          </div>
          <div style={{ display:'flex', gap:'24px', alignItems:'center' }}>
            <label style={{ fontWeight:'500', fontSize:'14px', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px' }}>
              <input type="checkbox" checked={formData.is_default}
                onChange={e => setFormData({...formData, is_default: e.target.checked})} />
              Set as default rate
            </label>
            <label style={{ fontWeight:'500', fontSize:'14px', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px' }}>
              <input type="checkbox" checked={formData.is_active}
                onChange={e => setFormData({...formData, is_active: e.target.checked})} />
              Active
            </label>
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:'12px' }}>
          <button type="button" onClick={() => navigate('/tax')}
            style={{ padding:'10px 24px', background:'#f3f4f6', color:'#374151', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'500' }}>
            Cancel
          </button>
          <button type="submit" disabled={saving}
            style={{ padding:'10px 24px', background:saving ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color:'white', border:'none', borderRadius:'10px', cursor:saving ? 'not-allowed' : 'pointer', fontWeight:'500' }}>
            {saving ? 'Saving...' : (isEdit ? 'Update Tax Rate' : 'Create Tax Rate')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaxRateForm;
