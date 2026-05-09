import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTaxRates, deleteTaxRate, updateTaxRate } from '../../services/api';

const TaxRateList = () => {
  const navigate = useNavigate();
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRates(); }, []);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const data = await getTaxRates();
      setRates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading tax rates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete tax rate "${name}"?`)) return;
    try {
      await deleteTaxRate(id);
      fetchRates();
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleSetDefault = async (rate) => {
    try {
      await updateTaxRate(rate.id, { ...rate, is_default: true });
      fetchRates();
    } catch (err) {
      alert('Failed to set default: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'400px' }}>
      <div style={{ fontSize:'14px', color:'#666' }}>Loading tax rates...</div>
    </div>;
  }

  return (
    <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h1 style={{ fontSize:'28px', fontWeight:'700', marginBottom:'4px' }}>Tax Rates</h1>
          <p style={{ fontSize:'14px', color:'#666', margin:0 }}>Configure VAT, GST, and other tax rates</p>
        </div>
        <button onClick={() => navigate('/tax/new')} style={{
          display:'flex', alignItems:'center', gap:'8px', padding:'10px 20px',
          background:'linear-gradient(135deg, #6366f1, #8b5cf6)', color:'white',
          border:'none', borderRadius:'10px', cursor:'pointer', fontSize:'14px', fontWeight:'500',
          boxShadow:'0 2px 4px rgba(99,102,241,0.3)'
        }}>
          <span style={{ fontSize:'18px' }}>➕</span> New Tax Rate
        </button>
      </div>

      {rates.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px', background:'white', borderRadius:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize:'48px', marginBottom:'16px' }}>💰</div>
          <div style={{ fontSize:'18px', fontWeight:'500', marginBottom:'8px' }}>No tax rates configured</div>
          <div style={{ fontSize:'14px', color:'#666' }}>Click "New Tax Rate" to add VAT, GST, or other tax rates.</div>
        </div>
      ) : (
        <div style={{ background:'white', borderRadius:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)', overflow:'hidden' }}>
          <table className="table-modern" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f9fafb', borderBottom:'1px solid #e5e7eb' }}>
                <th style={{ padding:'16px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Name</th>
                <th style={{ padding:'16px', textAlign:'center', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Rate</th>
                <th style={{ padding:'16px', textAlign:'center', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Type</th>
                <th style={{ padding:'16px', textAlign:'center', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Default</th>
                <th style={{ padding:'16px', textAlign:'center', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Active</th>
                <th style={{ padding:'16px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Description</th>
                <th style={{ padding:'16px', textAlign:'center', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rates.map(r => (
                <tr key={r.id} style={{ borderBottom:'1px solid #f3f4f6' }}>
                  <td style={{ padding:'16px', fontWeight:'500' }}>{r.name}</td>
                  <td style={{ padding:'16px', textAlign:'center', fontWeight:'600', fontSize:'16px' }}>{r.rate}%</td>
                  <td style={{ padding:'16px', textAlign:'center' }}>
                    <span style={{
                      display:'inline-block', padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'500',
                      background: r.type === 'VAT' ? '#dbeafe' : r.type === 'GST' ? '#d1fae5' : '#f3f4f6',
                      color: r.type === 'VAT' ? '#1e40af' : r.type === 'GST' ? '#065f46' : '#374151'
                    }}>{r.type}</span>
                  </td>
                  <td style={{ padding:'16px', textAlign:'center' }}>
                    {r.is_default ? (
                      <span style={{ fontSize:'16px' }}>⭐</span>
                    ) : (
                      <button onClick={() => handleSetDefault(r)}
                        style={{ padding:'4px 10px', background:'transparent', color:'#6366f1', border:'1px dashed #6366f1', borderRadius:'6px', fontSize:'11px', cursor:'pointer' }}>
                        Set Default
                      </button>
                    )}
                  </td>
                  <td style={{ padding:'16px', textAlign:'center' }}>
                    <span style={{
                      display:'inline-block', padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'500',
                      backgroundColor: r.is_active ? '#d1fae5' : '#fee2e2',
                      color: r.is_active ? '#065f46' : '#991b1b'
                    }}>{r.is_active ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td style={{ padding:'16px', color:'#6b7280', fontSize:'13px' }}>{r.description || '-'}</td>
                  <td style={{ padding:'16px', textAlign:'center' }}>
                    <div style={{ display:'flex', gap:'6px', justifyContent:'center' }}>
                      <button onClick={() => navigate(`/tax/${r.id}/edit`)}
                        style={{ padding:'6px 10px', background:'#f59e0b', color:'white', border:'none', borderRadius:'6px', fontSize:'11px', cursor:'pointer' }}>Edit</button>
                      <button onClick={() => handleDelete(r.id, r.name)}
                        style={{ padding:'6px 10px', background:'#ef4444', color:'white', border:'none', borderRadius:'6px', fontSize:'11px', cursor:'pointer' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TaxRateList;
