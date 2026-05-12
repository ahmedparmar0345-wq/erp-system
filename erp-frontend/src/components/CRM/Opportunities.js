import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [stageFilter, setStageFilter] = useState('');
  const [formData, setFormData] = useState({
    lead_id: '', customer_id: '', name: '', description: '', expected_revenue: '',
    probability: '', expected_close_date: '', stage: 'qualification', priority: 'medium',
    assigned_to: '', notes: ''
  });

  const stages = [
    { key: 'qualification', label: 'Qualification', color: '#8b5cf6' },
    { key: 'needs_analysis', label: 'Needs Analysis', color: '#3b82f6' },
    { key: 'proposal', label: 'Proposal', color: '#f59e0b' },
    { key: 'negotiation', label: 'Negotiation', color: '#f97316' },
    { key: 'closed_won', label: 'Closed Won', color: '#10b981' },
    { key: 'closed_lost', label: 'Closed Lost', color: '#ef4444' },
  ];

  useEffect(() => {
    fetchOpportunities();
    fetchLeads();
    fetchUsers();
  }, [stageFilter]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const params = stageFilter ? `?stage=${stageFilter}` : '';
      const res = await api.get(`/crm/opportunities${params}`);
      setOpportunities(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchLeads = async () => {
    try {
      const res = await api.get('/crm/leads');
      setLeads(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/settings/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/crm/opportunities/${editing}`, formData);
      } else {
        await api.post('/crm/opportunities', formData);
      }
      alert(editing ? 'Opportunity updated' : 'Opportunity created');
      setShowModal(false);
      setEditing(null);
      setFormData({ lead_id: '', customer_id: '', name: '', description: '', expected_revenue: '', probability: '', expected_close_date: '', stage: 'qualification', priority: 'medium', assigned_to: '', notes: '' });
      fetchOpportunities();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const handleEdit = async (id) => {
    try {
      const res = await api.get(`/crm/opportunities/${id}`);
      const d = res.data;
      setEditing(id);
      setFormData({
        lead_id: d.lead_id || '', customer_id: d.customer_id || '', name: d.name || '', description: d.description || '',
        expected_revenue: d.expected_revenue || '', probability: d.probability || '', expected_close_date: d.expected_close_date ? d.expected_close_date.split('T')[0] : '',
        stage: d.stage || 'qualification', priority: d.priority || 'medium', assigned_to: d.assigned_to || '', notes: d.notes || ''
      });
      setShowModal(true);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this opportunity?')) return;
    try {
      await api.delete(`/crm/opportunities/${id}`);
      fetchOpportunities();
    } catch (err) { console.error(err); }
  };

  const handleStageChange = async (id, stage) => {
    try {
      await api.put(`/crm/opportunities/${id}`, { stage });
      fetchOpportunities();
    } catch (err) { console.error(err); }
  };

  const stageBadge = (stage) => {
    const s = stages.find(x => x.key === stage);
    return <span style={{ background: s?.color || '#6b7280', color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 11 }}>{s?.label || stage}</span>;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Opportunities</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }}>
            <option value="">All Stages</option>
            {stages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <button onClick={() => { setEditing(null); setFormData({ lead_id: '', customer_id: '', name: '', description: '', expected_revenue: '', probability: '', expected_close_date: '', stage: 'qualification', priority: 'medium', assigned_to: '', notes: '' }); setShowModal(true); }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>+ New Opportunity</button>
        </div>
      </div>

      {loading ? <p>Loading...</p> : (
        <div style={{ background: '#fff', borderRadius: 12, overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Lead/Customer</th>
                <th style={thStyle}>Expected Revenue</th>
                <th style={thStyle}>Probability</th>
                <th style={thStyle}>Stage</th>
                <th style={thStyle}>Close Date</th>
                <th style={thStyle}>Assigned To</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td data-label="Name" style={tdStyle}><strong>{o.name}</strong></td>
                  <td data-label="Lead/Customer" style={tdStyle}>{o.lead_name || o.customer_name || '-'}</td>
                  <td data-label="Expected Revenue" style={tdStyle}>${parseFloat(o.expected_revenue || 0).toFixed(2)}</td>
                  <td data-label="Probability" style={tdStyle}>{o.probability}%</td>
                  <td data-label="Stage" style={tdStyle}>{stageBadge(o.stage)}</td>
                  <td data-label="Close Date" style={tdStyle}>{o.expected_close_date ? new Date(o.expected_close_date).toLocaleDateString() : '-'}</td>
                  <td data-label="Assigned To" style={tdStyle}>{o.assigned_to_name || '-'}</td>
                  <td data-label="Actions" style={tdStyle}>
                    <select value={o.stage} onChange={e => handleStageChange(o.id, e.target.value)} style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 11, marginRight: 6 }}>
                      {stages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                    <button onClick={() => handleEdit(o.id)} style={{ ...btnStyle, background: '#3b82f6' }}>Edit</button>
                    <button onClick={() => handleDelete(o.id)} style={{ ...btnStyle, background: '#ef4444' }}>Del</button>
                  </td>
                </tr>
              ))}
              {opportunities.length === 0 && <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center' }}>No opportunities found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 'clamp(20px, 4vw, 32px)', width: 'min(650px, 100%)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px' }}>{editing ? 'Edit Opportunity' : 'New Opportunity'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: 12, marginBottom: 16 }}>
                <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Opportunity Name *</label><input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} style={inputStyle} required /></div>
                <div><label style={labelStyle}>Lead</label><select value={formData.lead_id} onChange={e => setFormData(p => ({ ...p, lead_id: e.target.value }))} style={inputStyle}><option value="">Select</option>{leads.map(l => <option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>)}</select></div>
                <div><label style={labelStyle}>Expected Revenue</label><input type="number" step="0.01" value={formData.expected_revenue} onChange={e => setFormData(p => ({ ...p, expected_revenue: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Probability (%)</label><input type="number" min="0" max="100" value={formData.probability} onChange={e => setFormData(p => ({ ...p, probability: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Expected Close Date</label><input type="date" value={formData.expected_close_date} onChange={e => setFormData(p => ({ ...p, expected_close_date: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Stage</label><select value={formData.stage} onChange={e => setFormData(p => ({ ...p, stage: e.target.value }))} style={inputStyle}>{stages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
                <div><label style={labelStyle}>Priority</label><select value={formData.priority} onChange={e => setFormData(p => ({ ...p, priority: e.target.value }))} style={inputStyle}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
                <div><label style={labelStyle}>Assigned To</label><select value={formData.assigned_to} onChange={e => setFormData(p => ({ ...p, assigned_to: e.target.value }))} style={inputStyle}><option value="">Select</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
              </div>
              <div style={{ marginBottom: 12 }}><label style={labelStyle}>Description</label><textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} style={{ ...inputStyle, minHeight: 50 }} /></div>
              <div style={{ marginBottom: 16 }}><label style={labelStyle}>Notes</label><textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} style={{ ...inputStyle, minHeight: 50 }} /></div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
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
const btnStyle = { color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 5, cursor: 'pointer', fontSize: 11, marginRight: 4 };
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: '#374151' };
const inputStyle = { width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' };

export default Opportunities;
