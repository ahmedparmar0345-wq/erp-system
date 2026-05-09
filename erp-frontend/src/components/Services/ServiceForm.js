import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createService, getService, updateService, getTaxRates } from '../../services/api';

const ServiceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [taxRates, setTaxRates] = useState([]);
  const [formData, setFormData] = useState({
    name: '', description: '', category: '', unit_price: '', tax_percent: '', tax_rate_id: '', is_active: true
  });

  useEffect(() => {
    getTaxRates().then(d => setTaxRates(Array.isArray(d) ? d : [])).catch(() => {});
    if (isEdit) {
      (async () => {
        try {
          const data = await getService(id);
          setFormData({
            name: data.name || '',
            description: data.description || '',
            category: data.category || '',
            unit_price: data.unit_price || '',
            tax_percent: data.tax_percent || '',
            tax_rate_id: data.tax_rate_id || '',
            is_active: data.is_active !== false
          });
        } catch (err) {
          alert('Service not found');
          navigate('/services');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id, isEdit, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { alert('Service name is required'); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await updateService(id, formData);
        alert('Service updated!');
      } else {
        await createService(formData);
        alert('Service created!');
      }
      navigate('/services');
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
    <div style={{ maxWidth:'700px', margin:'0 auto' }}>
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{ fontSize:'28px', fontWeight:'700', margin:0 }}>{isEdit ? 'Edit Service' : 'New Service'}</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ background:'white', borderRadius:'16px', padding:'24px', marginBottom:'20px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom:'16px' }}>
            <label style={{ display:'block', marginBottom:'6px', fontWeight:'500', fontSize:'14px' }}>Service Name *</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required
              placeholder="e.g. Consulting, Installation, Maintenance"
              style={{ width:'100%', padding:'10px 16px', border:'1px solid #e5e7eb', borderRadius:'12px', fontSize:'14px', outline:'none' }} />
          </div>
          <div style={{ marginBottom:'16px' }}>
            <label style={{ display:'block', marginBottom:'6px', fontWeight:'500', fontSize:'14px' }}>Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3"
              placeholder="Describe the service..."
              style={{ width:'100%', padding:'10px 16px', border:'1px solid #e5e7eb', borderRadius:'12px', fontSize:'14px', resize:'vertical', outline:'none' }} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
            <div>
              <label style={{ display:'block', marginBottom:'6px', fontWeight:'500', fontSize:'14px' }}>Category</label>
              <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                placeholder="e.g. Consulting, Support"
                style={{ width:'100%', padding:'10px 16px', border:'1px solid #e5e7eb', borderRadius:'12px', fontSize:'14px', outline:'none' }} />
            </div>
            <div>
              <label style={{ display:'block', marginBottom:'6px', fontWeight:'500', fontSize:'14px' }}>Unit Price ($)</label>
              <input type="number" step="0.01" min="0" value={formData.unit_price}
                onChange={e => setFormData({...formData, unit_price: e.target.value})}
                style={{ width:'100%', padding:'10px 16px', border:'1px solid #e5e7eb', borderRadius:'12px', fontSize:'14px', outline:'none' }} />
            </div>
            <div>
              <label style={{ display:'block', marginBottom:'6px', fontWeight:'500', fontSize:'14px' }}>Tax Rate</label>
              <select value={formData.tax_rate_id} onChange={e => {
                const val = e.target.value;
                const rate = taxRates.find(r => r.id === parseInt(val));
                setFormData({...formData, tax_rate_id: val, tax_percent: rate ? rate.rate : ''});
              }} style={{ width:'100%', padding:'10px 16px', border:'1px solid #e5e7eb', borderRadius:'12px', fontSize:'14px', outline:'none' }}>
                <option value="">Select Tax Rate</option>
                {taxRates.filter(r => r.is_active).map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.rate}%)</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display:'block', marginBottom:'6px', fontWeight:'500', fontSize:'14px' }}>Tax % <span style={{fontSize:'11px', color:'#9ca3af'}}>(auto-filled)</span></label>
              <input type="number" step="0.01" min="0" max="100" value={formData.tax_percent}
                onChange={e => setFormData({...formData, tax_percent: e.target.value})}
                style={{ width:'100%', padding:'10px 16px', border:'1px solid #e5e7eb', borderRadius:'12px', fontSize:'14px', outline:'none' }} />
            </div>
          </div>
          <div style={{ marginTop:'16px', display:'flex', alignItems:'center', gap:'10px' }}>
            <label style={{ fontWeight:'500', fontSize:'14px', cursor:'pointer' }}>
              <input type="checkbox" checked={formData.is_active}
                onChange={e => setFormData({...formData, is_active: e.target.checked})}
                style={{ marginRight:'8px' }} />
              Active
            </label>
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:'12px' }}>
          <button type="button" onClick={() => navigate('/services')}
            style={{ padding:'10px 24px', background:'#f3f4f6', color:'#374151', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'500' }}>
            Cancel
          </button>
          <button type="submit" disabled={saving}
            style={{ padding:'10px 24px', background:saving ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color:'white', border:'none', borderRadius:'10px', cursor:saving ? 'not-allowed' : 'pointer', fontWeight:'500' }}>
            {saving ? 'Saving...' : (isEdit ? 'Update Service' : 'Create Service')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;
