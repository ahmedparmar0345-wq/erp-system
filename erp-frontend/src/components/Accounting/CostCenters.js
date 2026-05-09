import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CostCenters = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ code: '', name: '', description: '' });

  useEffect(() => { fetchCenters(); }, []);

  const token = () => localStorage.getItem('token');
  const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}` });

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/accounting-enhancements/cost-centers', { headers: headers() });
      const data = await res.json();
      setCenters(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editing ? `/api/accounting-enhancements/cost-centers/${editing}` : '/api/accounting-enhancements/cost-centers';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(formData) });
      if (res.ok) {
        alert(editing ? 'Cost center updated' : 'Cost center created');
        setShowModal(false); setEditing(null);
        setFormData({ code: '', name: '', description: '' });
        fetchCenters();
      } else { const err = await res.json(); alert(err.error); }
    } catch (err) { console.error(err); }
  };

  const handleEdit = (c) => {
    setEditing(c.id);
    setFormData({ code: c.code, name: c.name, description: c.description || '' });
    setShowModal(true);
  };

  const handleToggle = async (id) => {
    try {
      await fetch(`/api/accounting-enhancements/cost-centers/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify({ is_active: false }) });
      fetchCenters();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this cost center?')) return;
    try {
      await fetch(`/api/accounting-enhancements/cost-centers/${id}`, { method: 'DELETE', headers: headers() });
      fetchCenters();
    } catch (err) { console.error(err); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cc-page" style={{ padding: '20px' }}>
      <style>{`
        @media (max-width: 768px) {
          .cc-header { flex-direction: column !important; align-items: stretch !important; }
          .cc-header h2 { font-size: 20px !important; }
          .cc-header button { width: 100% !important; }
          .cc-table-wrap { overflow-x: visible !important; }
          .cc-table { min-width: 0 !important; }
          .cc-table thead { display: none !important; }
          .cc-table tbody tr { display: flex !important; flex-direction: column !important; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; margin-bottom: 12px; background: white; }
          .cc-table tbody td { display: flex !important; justify-content: space-between !important; align-items: center; padding: 6px 0 !important; border: none !important; gap: 8px; }
          .cc-table tbody td::before { content: attr(data-label); font-weight: 600; font-size: 11px; color: #6b7280; white-space: nowrap; }
          .cc-table tbody tr:last-child { border-bottom: none; margin-bottom: 0; }
        }
        @media (max-width: 480px) {
          .cc-page { padding: 12px !important; }
          .cc-modal-content { width: 95% !important; padding: 20px !important; }
          .cc-modal-actions { flex-direction: column !important; }
          .cc-modal-actions button { width: 100% !important; }
        }
      `}</style>
      <div className="cc-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Cost Centers</h2>
        <button onClick={() => { setEditing(null); setFormData({ code: '', name: '', description: '' }); setShowModal(true); }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>+ New Cost Center</button>
      </div>
      {loading ? <p>Loading...</p> : (
        <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div className="cc-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="cc-table table-modern" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
            <thead><tr style={{ background: '#f8fafc', textAlign: 'left' }}>
              <th style={thStyle}>Code</th><th style={thStyle}>Name</th><th style={thStyle}>Description</th><th style={thStyle}>Status</th><th style={thStyle}>Actions</th>
            </tr></thead>
            <tbody>
              {centers.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td data-label="Code" style={tdStyle}>{c.code}</td>
                  <td data-label="Name" style={tdStyle}>{c.name}</td>
                  <td data-label="Description" style={tdStyle}>{c.description || '-'}</td>
                  <td data-label="Status" style={tdStyle}><span style={{ background: c.is_active !== false ? '#10b981' : '#ef4444', color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 11 }}>{c.is_active !== false ? 'Active' : 'Inactive'}</span></td>
                  <td data-label="Actions" style={tdStyle}>
                    <button onClick={() => handleEdit(c)} style={btnStyle}>Edit</button>
                    <button onClick={() => handleToggle(c.id)} style={{ ...btnStyle, background: '#f59e0b' }}>Deact.</button>
                    <button onClick={() => handleDelete(c.id)} style={{ ...btnStyle, background: '#ef4444' }}>Del</button>
                  </td>
                </tr>
              ))}
              {centers.length === 0 && <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center' }}>No cost centers found</td></tr>}
            </tbody>
          </table>
          </div>
        </div>
      )}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="cc-modal-content" style={{ background: '#fff', borderRadius: 16, padding: 32, width: 500, maxWidth: '100%' }}>
            <h3 style={{ margin: '0 0 20px' }}>{editing ? 'Edit Cost Center' : 'New Cost Center'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
                <div><label style={labelStyle}>Code *</label><input value={formData.code} onChange={e => setFormData(p => ({ ...p, code: e.target.value }))} style={inputStyle} required /></div>
                <div><label style={labelStyle}>Name *</label><input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} style={inputStyle} required /></div>
                <div><label style={labelStyle}>Description</label><textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} style={{ ...inputStyle, minHeight: 50 }} /></div>
              </div>
              <div className="cc-modal-actions" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const thStyle = { padding: '10px 14px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase' };
const tdStyle = { padding: '10px 14px', fontSize: 13 };
const btnStyle = { color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 5, cursor: 'pointer', fontSize: 11, marginRight: 4, background: '#3b82f6' };
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: '#374151' };
const inputStyle = { width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' };

export default CostCenters;
