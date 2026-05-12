import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [sources, setSources] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState({ status_id: '', search: '' });
  const [detail, setDetail] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', mobile: '',
    company: '', designation: '', website: '', source_id: '', status_id: '',
    assigned_to: '', address: '', city: '', state: '', country: '', notes: ''
  });

  useEffect(() => {
    fetchLeads();
    fetchSources();
    fetchStatuses();
    fetchUsers();
  }, [filter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.status_id) params.append('status_id', filter.status_id);
      if (filter.search) params.append('search', filter.search);
      const res = await api.get(`/crm/leads?${params}`);
      setLeads(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchSources = async () => {
    try {
      const res = await api.get('/crm/lead-sources');
      setSources(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
  };

  const fetchStatuses = async () => {
    try {
      const res = await api.get('/crm/lead-statuses');
      setStatuses(Array.isArray(res.data) ? res.data : []);
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
        await api.put(`/crm/leads/${editing}`, formData);
      } else {
        await api.post('/crm/leads', formData);
      }
      alert(editing ? 'Lead updated' : 'Lead created');
      setShowModal(false);
      setEditing(null);
      setFormData({ first_name: '', last_name: '', email: '', phone: '', mobile: '', company: '', designation: '', website: '', source_id: '', status_id: '', assigned_to: '', address: '', city: '', state: '', country: '', notes: '' });
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const handleEdit = async (id) => {
    try {
      const res = await api.get(`/crm/leads/${id}`);
      const data = res.data;
      setEditing(id);
      setFormData({
        first_name: data.first_name || '', last_name: data.last_name || '', email: data.email || '', phone: data.phone || '',
        mobile: data.mobile || '', company: data.company || '', designation: data.designation || '', website: data.website || '',
        source_id: data.source_id || '', status_id: data.status_id || '', assigned_to: data.assigned_to || '',
        address: data.address || '', city: data.city || '', state: data.state || '', country: data.country || '', notes: data.notes || ''
      });
      setShowModal(true);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await api.delete(`/crm/leads/${id}`);
      fetchLeads();
    } catch (err) { console.error(err); }
  };

  const handleConvert = async (id) => {
    if (!window.confirm('Convert this lead to a customer?')) return;
    try {
      await api.post(`/crm/leads/${id}/convert`);
      alert('Lead converted to customer');
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const handleViewDetail = async (id) => {
    try {
      const res = await api.get(`/crm/leads/${id}`);
      setDetail(res.data);
    } catch (err) { console.error(err); }
  };

  const statusBadge = (status, color) => (
    <span style={{ background: color || '#6b7280', color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 11 }}>{status}</span>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Leads</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <input placeholder="Search leads..." value={filter.search} onChange={e => setFilter(prev => ({ ...prev, search: e.target.value }))} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, width: 'min(220px, 100%)' }} />
          <select value={filter.status_id} onChange={e => setFilter(prev => ({ ...prev, status_id: e.target.value }))} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }}>
            <option value="">All Statuses</option>
            {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button onClick={() => { setEditing(null); setFormData({ first_name: '', last_name: '', email: '', phone: '', mobile: '', company: '', designation: '', website: '', source_id: '', status_id: '', assigned_to: '', address: '', city: '', state: '', country: '', notes: '' }); setShowModal(true); }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>+ New Lead</button>
        </div>
      </div>

      {loading ? <p>Loading...</p> : (
        <div style={{ background: '#fff', borderRadius: 12, overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Company</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Source</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Assigned To</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td data-label="Name" style={tdStyle}><a href="#" onClick={(e) => { e.preventDefault(); handleViewDetail(lead.id); }} style={{ color: '#3b82f6', textDecoration: 'none', whiteSpace: 'nowrap' }}>{lead.first_name} {lead.last_name}</a></td>
                  <td data-label="Company" style={tdStyle}>{lead.company || '-'}</td>
                  <td data-label="Email" style={tdStyle}>{lead.email || '-'}</td>
                  <td data-label="Phone" style={tdStyle}>{lead.phone || lead.mobile || '-'}</td>
                  <td data-label="Source" style={tdStyle}>{lead.source_name || '-'}</td>
                  <td data-label="Status" style={tdStyle}>{statusBadge(lead.status_name, lead.status_color)}</td>
                  <td data-label="Assigned To" style={tdStyle}>{lead.assigned_to_name || '-'}</td>
                  <td data-label="Actions" style={tdStyle}>
                    <button onClick={() => handleViewDetail(lead.id)} style={{ ...btnStyle, background: '#6b7280' }}>View</button>
                    <button onClick={() => handleEdit(lead.id)} style={btnStyle}>Edit</button>
                    {!lead.converted_customer_id && <button onClick={() => handleConvert(lead.id)} style={{ ...btnStyle, background: '#10b981' }}>Convert</button>}
                    <button onClick={() => handleDelete(lead.id)} style={{ ...btnStyle, background: '#ef4444' }}>Del</button>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center' }}>No leads found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 'clamp(20px, 4vw, 32px)', width: 'min(700px, 100%)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px' }}>{editing ? 'Edit Lead' : 'New Lead'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: 12, marginBottom: 16 }}>
                <div><label style={labelStyle}>First Name *</label><input value={formData.first_name} onChange={e => setFormData(p => ({ ...p, first_name: e.target.value }))} style={inputStyle} required /></div>
                <div><label style={labelStyle}>Last Name *</label><input value={formData.last_name} onChange={e => setFormData(p => ({ ...p, last_name: e.target.value }))} style={inputStyle} required /></div>
                <div><label style={labelStyle}>Email</label><input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Phone</label><input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Mobile</label><input value={formData.mobile} onChange={e => setFormData(p => ({ ...p, mobile: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Company</label><input value={formData.company} onChange={e => setFormData(p => ({ ...p, company: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Designation</label><input value={formData.designation} onChange={e => setFormData(p => ({ ...p, designation: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Website</label><input value={formData.website} onChange={e => setFormData(p => ({ ...p, website: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Source</label><select value={formData.source_id} onChange={e => setFormData(p => ({ ...p, source_id: e.target.value }))} style={inputStyle}><option value="">Select</option>{sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                <div><label style={labelStyle}>Status</label><select value={formData.status_id} onChange={e => setFormData(p => ({ ...p, status_id: e.target.value }))} style={inputStyle}><option value="">Select</option>{statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                <div><label style={labelStyle}>Assigned To</label><select value={formData.assigned_to} onChange={e => setFormData(p => ({ ...p, assigned_to: e.target.value }))} style={inputStyle}><option value="">Select</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(150px, 100%), 1fr))', gap: 12, marginBottom: 12 }}>
                <div><label style={labelStyle}>City</label><input value={formData.city} onChange={e => setFormData(p => ({ ...p, city: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>State</label><input value={formData.state} onChange={e => setFormData(p => ({ ...p, state: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Country</label><input value={formData.country} onChange={e => setFormData(p => ({ ...p, country: e.target.value }))} style={inputStyle} /></div>
              </div>
              <div style={{ marginBottom: 12 }}><label style={labelStyle}>Address</label><textarea value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} style={{ ...inputStyle, minHeight: 50 }} /></div>
              <div style={{ marginBottom: 16 }}><label style={labelStyle}>Notes</label><textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} style={{ ...inputStyle, minHeight: 50 }} /></div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detail && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 'clamp(20px, 4vw, 32px)', width: 'min(800px, 100%)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>{detail.first_name} {detail.last_name}</h3>
              <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))', gap: 12, marginBottom: 20, padding: 16, background: '#f8fafc', borderRadius: 8 }}>
              <div><strong>Status:</strong> {statusBadge(detail.status_name, detail.status_color)}</div>
              <div><strong>Source:</strong> {detail.source_name || '-'}</div>
              <div><strong>Company:</strong> {detail.company || '-'}</div>
              <div><strong>Email:</strong> {detail.email || '-'}</div>
              <div><strong>Phone:</strong> {detail.phone || detail.mobile || '-'}</div>
              <div><strong>Designation:</strong> {detail.designation || '-'}</div>
              {detail.assigned_to_name && <div><strong>Assigned To:</strong> {detail.assigned_to_name}</div>}
              {detail.converted_customer_id && <div><strong>Converted:</strong> Yes</div>}
            </div>
            {detail.notes && <div style={{ marginBottom: 16 }}><strong>Notes:</strong> {detail.notes}</div>}
            {detail.opportunities && detail.opportunities.length > 0 && (
              <div style={{ marginBottom: 16 }}><h4>Opportunities</h4>
                {detail.opportunities.map(o => <div key={o.id} style={{ padding: '8px 12px', background: '#f0f9ff', borderRadius: 6, marginBottom: 4 }}>{o.name} - ${parseFloat(o.expected_revenue || 0).toFixed(2)}</div>)}
              </div>
            )}
            {detail.follow_ups && detail.follow_ups.length > 0 && (
              <div style={{ marginBottom: 16 }}><h4>Follow-ups</h4>
                {detail.follow_ups.map(f => <div key={f.id} style={{ padding: '8px 12px', background: '#fef3c7', borderRadius: 6, marginBottom: 4 }}>{f.title} - {f.due_date ? new Date(f.due_date).toLocaleDateString() : '-'} ({f.status})</div>)}
              </div>
            )}
            {detail.interactions && detail.interactions.length > 0 && (
              <div style={{ marginBottom: 16 }}><h4>Interactions</h4>
                {detail.interactions.map(i => <div key={i.id} style={{ padding: '8px 12px', background: '#ecfdf5', borderRadius: 6, marginBottom: 4 }}><strong>{i.type}</strong>: {i.subject} - {new Date(i.performed_at).toLocaleString()}</div>)}
              </div>
            )}
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

export default Leads;
