import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServices, deleteService } from '../../services/api';

const ServiceList = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await getServices();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete service "${name}"?`)) return;
    try {
      await deleteService(id);
      fetchServices();
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.error || err.message));
    }
  };

  const formatCurrency = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? '$0.00' : `$${n.toFixed(2)}`;
  };

  const filtered = services.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'400px' }}>
      <div style={{ fontSize:'14px', color:'#666' }}>Loading services...</div>
    </div>;
  }

  return (
    <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h1 style={{ fontSize:'28px', fontWeight:'700', marginBottom:'4px' }}>Services</h1>
          <p style={{ fontSize:'14px', color:'#666', margin:0 }}>Manage your service catalog for billing</p>
        </div>
        <button onClick={() => navigate('/services/new')} style={{
          display:'flex', alignItems:'center', gap:'8px', padding:'10px 20px',
          background:'linear-gradient(135deg, #6366f1, #8b5cf6)', color:'white',
          border:'none', borderRadius:'10px', cursor:'pointer', fontSize:'14px', fontWeight:'500',
          boxShadow:'0 2px 4px rgba(99,102,241,0.3)'
        }}>
          <span style={{ fontSize:'18px' }}>➕</span> New Service
        </button>
      </div>

      <div style={{ marginBottom:'20px' }}>
        <div style={{ display:'flex', alignItems:'center', background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'8px 16px', maxWidth:'400px' }}>
          <span style={{ fontSize:'16px', marginRight:'8px', color:'#9ca3af' }}>🔍</span>
          <input type="text" placeholder="Search by name or category..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ flex:1, border:'none', outline:'none', fontSize:'14px', background:'transparent' }} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px', background:'white', borderRadius:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize:'48px', marginBottom:'16px' }}>🔧</div>
          <div style={{ fontSize:'18px', fontWeight:'500', marginBottom:'8px' }}>No services found</div>
          <div style={{ fontSize:'14px', color:'#666' }}>Click "New Service" to add your first service.</div>
        </div>
      ) : (
        <div style={{ background:'white', borderRadius:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)', overflow:'hidden' }}>
          <table className="table-modern" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f9fafb', borderBottom:'1px solid #e5e7eb' }}>
                <th style={{ padding:'16px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Name</th>
                <th style={{ padding:'16px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Category</th>
                <th style={{ padding:'16px', textAlign:'right', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Unit Price</th>
                <th style={{ padding:'16px', textAlign:'center', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Tax %</th>
                <th style={{ padding:'16px', textAlign:'center', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Active</th>
                <th style={{ padding:'16px', textAlign:'center', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} style={{ borderBottom:'1px solid #f3f4f6' }}>
                  <td style={{ padding:'16px', fontWeight:'500' }}>{s.name}</td>
                  <td style={{ padding:'16px' }}>{s.category || '-'}</td>
                  <td style={{ padding:'16px', textAlign:'right', fontWeight:'600' }}>{formatCurrency(s.unit_price)}</td>
                  <td style={{ padding:'16px', textAlign:'center' }}>{s.tax_percent || 0}%</td>
                  <td style={{ padding:'16px', textAlign:'center' }}>
                    <span style={{
                      display:'inline-block', padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'500',
                      backgroundColor:s.is_active ? '#d1fae5' : '#fee2e2',
                      color:s.is_active ? '#065f46' : '#991b1b'
                    }}>{s.is_active ? 'Yes' : 'No'}</span>
                  </td>
                  <td style={{ padding:'16px', textAlign:'center' }}>
                    <div style={{ display:'flex', gap:'6px', justifyContent:'center' }}>
                      <button onClick={() => navigate(`/services/${s.id}/edit`)}
                        style={{ padding:'6px 10px', background:'#f59e0b', color:'white', border:'none', borderRadius:'6px', fontSize:'11px', cursor:'pointer' }}>Edit</button>
                      <button onClick={() => handleDelete(s.id, s.name)}
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

export default ServiceList;
