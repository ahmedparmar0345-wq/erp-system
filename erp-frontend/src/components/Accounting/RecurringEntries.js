import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const RecurringEntries = () => {
  const [entries, setEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', voucher_type: 'Journal', frequency: 'monthly', interval_value: 1,
    start_date: new Date().toISOString().split('T')[0], end_date: '', day_of_month: '', total_occurrences: '', lines: []
  });
  const [newLine, setNewLine] = useState({ account_id: '', cost_center_id: '', debit: 0, credit: 0, narration: '' });

  useEffect(() => {
    fetchEntries();
    fetchAccounts();
    fetchCostCenters();
  }, []);

  const token = () => localStorage.getItem('token');
  const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}` });

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/accounting-enhancements/recurring-entries', { headers: headers() });
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounting/chart-of-accounts', { headers: headers() });
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const fetchCostCenters = async () => {
    try {
      const res = await fetch('/api/accounting-enhancements/cost-centers', { headers: headers() });
      const data = await res.json();
      setCostCenters(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const fetchDetail = async (id) => {
    try {
      const res = await fetch(`/api/accounting-enhancements/recurring-entries/${id}`, { headers: headers() });
      setDetail(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleAddLine = () => {
    if (!newLine.account_id) return alert('Select an account');
    setFormData(prev => ({ ...prev, lines: [...prev.lines, { ...newLine }] }));
    setNewLine({ account_id: '', cost_center_id: '', debit: 0, credit: 0, narration: '' });
  };

  const handleRemoveLine = (i) => {
    setFormData(prev => ({ ...prev, lines: prev.lines.filter((_, idx) => idx !== i) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.lines.length < 2) return alert('At least 2 lines required (debit + credit)');
    try {
      const url = editing ? `/api/accounting-enhancements/recurring-entries/${editing}` : '/api/accounting-enhancements/recurring-entries';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(formData) });
      if (res.ok) {
        alert(editing ? 'Entry updated' : 'Recurring entry created');
        setShowModal(false); setEditing(null);
        setFormData({ name: '', description: '', voucher_type: 'Journal', frequency: 'monthly', interval_value: 1, start_date: new Date().toISOString().split('T')[0], end_date: '', day_of_month: '', total_occurrences: '', lines: [] });
        fetchEntries();
      } else { const err = await res.json(); alert(err.error); }
    } catch (err) { console.error(err); }
  };

  const handleGenerate = async (id) => {
    if (!window.confirm('Generate journal entry now?')) return;
    try {
      const res = await fetch(`/api/accounting-enhancements/recurring-entries/${id}/generate`, { method: 'POST', headers: headers() });
      if (res.ok) { const data = await res.json(); alert(`Journal entry created: ${data.voucher_no}`); fetchEntries(); }
      else { const err = await res.json(); alert(err.error); }
    } catch (err) { console.error(err); }
  };

  const freqLabel = { monthly: 'Monthly', weekly: 'Weekly', yearly: 'Yearly', daily: 'Daily' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <style>{`
        @media (max-width: 768px) {
          .re-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .re-table-wrap table { min-width: 700px; }
        }
        @media (max-width: 480px) {
          .re-table-wrap { overflow: visible; }
          .re-table-wrap table,
          .re-table-wrap thead,
          .re-table-wrap tbody,
          .re-table-wrap tr,
          .re-table-wrap td,
          .re-table-wrap th { display: block; }
          .re-table-wrap thead tr { display: none; }
          .re-table-wrap td {
            display: flex; justify-content: space-between; align-items: center;
            padding: 8px 12px !important;
            border-bottom: 1px solid #e5e7eb;
          }
          .re-table-wrap td::before {
            content: attr(data-label);
            font-weight: 600; font-size: 11px; color: #6b7280; text-transform: uppercase;
            margin-right: 12px; flex-shrink: 0;
          }
          .re-table-wrap td:last-child { border-bottom: 2px solid #d1d5db; }
          .re-table-wrap tr { margin-bottom: 12px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }

          .re-modal-inner { width: 95% !important; max-width: 95% !important; padding: 20px !important; }
          .re-modal-inner .form-grid { grid-template-columns: 1fr !important; }
          .re-line-row { flex-direction: column !important; align-items: stretch !important; }
          .re-line-row > div { width: 100% !important; }
          .re-header { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
        }
      `}</style>
      <div className="re-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0 }}>Recurring Journal Entries</h2>
        <button onClick={() => { setEditing(null); setFormData({ name: '', description: '', voucher_type: 'Journal', frequency: 'monthly', interval_value: 1, start_date: new Date().toISOString().split('T')[0], end_date: '', day_of_month: '', total_occurrences: '', lines: [] }); setShowModal(true); }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>+ New Recurring Entry</button>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="re-table-wrap" style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#f8fafc', textAlign: 'left' }}>
              <th style={thStyle}>Name</th><th style={thStyle}>Frequency</th><th style={thStyle}>Next Date</th>
              <th style={thStyle}>Generated</th><th style={thStyle}>Status</th><th style={thStyle}>Actions</th>
            </tr></thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td data-label="Name" style={tdStyle}><a href="#" onClick={(ev) => { ev.preventDefault(); fetchDetail(e.id); }} style={{ color: '#3b82f6', textDecoration: 'none' }}>{e.name}</a></td>
                  <td data-label="Frequency" style={tdStyle}>{freqLabel[e.frequency] || e.frequency} {e.interval_value > 1 ? `(every ${e.interval_value})` : ''}</td>
                  <td data-label="Next Date" style={tdStyle}>{e.next_date ? new Date(e.next_date).toLocaleDateString() : '-'}</td>
                  <td data-label="Generated" style={tdStyle}>{e.occurrences_generated}{e.total_occurrences ? ` / ${e.total_occurrences}` : ''}</td>
                  <td data-label="Status" style={tdStyle}><span style={{ background: e.status === 'active' ? '#10b981' : e.status === 'completed' ? '#6b7280' : '#f59e0b', color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 11 }}>{e.status}</span></td>
                  <td data-label="Actions" style={tdStyle}>
                    <button onClick={() => handleGenerate(e.id)} style={{ ...btnStyle, background: '#10b981' }}>Generate</button>
                    <button onClick={() => { setEditing(e.id); setFormData({ name: e.name, description: e.description || '', voucher_type: e.voucher_type, frequency: e.frequency, interval_value: e.interval_value, start_date: e.start_date ? e.start_date.split('T')[0] : '', end_date: e.end_date ? e.end_date.split('T')[0] : '', day_of_month: e.day_of_month || '', total_occurrences: e.total_occurrences || '', lines: [] }); setShowModal(true); }} style={btnStyle}>Edit</button>
                  </td>
                </tr>
              ))}
              {entries.length === 0 && <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center' }}>No recurring entries. Create one to auto-post journal entries.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="re-modal-inner" style={{ background: '#fff', borderRadius: 16, padding: 32, width: 600, maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>{detail.name}</h3>
              <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8, padding: 16, background: '#f8fafc', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
              <div><strong>Type:</strong> {detail.voucher_type}</div>
              <div><strong>Frequency:</strong> {freqLabel[detail.frequency] || detail.frequency}</div>
              <div><strong>Start:</strong> {new Date(detail.start_date).toLocaleDateString()}</div>
              <div><strong>Next:</strong> {detail.next_date ? new Date(detail.next_date).toLocaleDateString() : '-'}</div>
              <div><strong>Generated:</strong> {detail.occurrences_generated}{detail.total_occurrences ? `/${detail.total_occurrences}` : ''}</div>
              <div><strong>Status:</strong> {detail.status}</div>
            </div>
            {detail.lines && detail.lines.length > 0 && (
              <div className="re-table-wrap" style={{ overflowX: 'auto' }}>
              <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead><tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>Account</th>
                  <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>Debit</th>
                  <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>Credit</th>
                </tr></thead>
                <tbody>
                  {detail.lines.map((l, i) => (
                    <tr key={i}>
                      <td data-label="Account" style={{ padding: 8, border: '1px solid #e5e7eb' }}>{l.account_name || `#${l.account_id}`}</td>
                      <td data-label="Debit" style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>{l.debit > 0 ? `$${parseFloat(l.debit).toFixed(2)}` : '-'}</td>
                      <td data-label="Credit" style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>{l.credit > 0 ? `$${parseFloat(l.credit).toFixed(2)}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
            {detail.description && <p style={{ marginTop: 12 }}><strong>Description:</strong> {detail.description}</p>}
          </div>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="re-modal-inner" style={{ background: '#fff', borderRadius: 16, padding: 32, width: 700, maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px' }}>{editing ? 'Edit Recurring Entry' : 'New Recurring Entry'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Name *</label><input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} style={inputStyle} required /></div>
                <div><label style={labelStyle}>Voucher Type</label><select value={formData.voucher_type} onChange={e => setFormData(p => ({ ...p, voucher_type: e.target.value }))} style={inputStyle}><option value="Journal">Journal</option><option value="Payment">Payment</option><option value="Receipt">Receipt</option><option value="Contra">Contra</option></select></div>
                <div><label style={labelStyle}>Frequency *</label><select value={formData.frequency} onChange={e => setFormData(p => ({ ...p, frequency: e.target.value }))} style={inputStyle}><option value="monthly">Monthly</option><option value="weekly">Weekly</option><option value="yearly">Yearly</option><option value="daily">Daily</option></select></div>
                <div><label style={labelStyle}>Every</label><input type="number" min="1" value={formData.interval_value} onChange={e => setFormData(p => ({ ...p, interval_value: parseInt(e.target.value) || 1 }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Day of Month</label><input type="number" min="1" max="31" value={formData.day_of_month} onChange={e => setFormData(p => ({ ...p, day_of_month: e.target.value }))} style={inputStyle} placeholder="e.g. 1" /></div>
                <div><label style={labelStyle}>Start Date *</label><input type="date" value={formData.start_date} onChange={e => setFormData(p => ({ ...p, start_date: e.target.value }))} style={inputStyle} required /></div>
                <div><label style={labelStyle}>End Date</label><input type="date" value={formData.end_date} onChange={e => setFormData(p => ({ ...p, end_date: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Total Occurrences</label><input type="number" min="1" value={formData.total_occurrences} onChange={e => setFormData(p => ({ ...p, total_occurrences: e.target.value }))} style={inputStyle} placeholder="Leave empty = unlimited" /></div>
              </div>

              <h4 style={{ marginBottom: 8 }}>Lines (min 2 - debit & credit)</h4>
              {formData.lines.length > 0 && (
                <div className="re-table-wrap" style={{ overflowX: 'auto' }}>
                <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 8 }}>
                  <thead><tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'left' }}>Account</th>
                    <th style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'right' }}>Debit</th>
                    <th style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'right' }}>Credit</th>
                    <th style={{ padding: 6, border: '1px solid #e5e7eb' }}></th>
                  </tr></thead>
                  <tbody>
                    {formData.lines.map((l, i) => (
                      <tr key={i}>
                        <td data-label="Account" style={{ padding: 6, border: '1px solid #e5e7eb' }}>{accounts.find(a => a.id == l.account_id)?.account_name || `#${l.account_id}`}</td>
                        <td data-label="Debit" style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'right' }}>${parseFloat(l.debit || 0).toFixed(2)}</td>
                        <td data-label="Credit" style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'right' }}>${parseFloat(l.credit || 0).toFixed(2)}</td>
                        <td data-label="" style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'center' }}><button type="button" onClick={() => handleRemoveLine(i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}

              <div className="re-line-row" style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'end' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Account</label><select value={newLine.account_id} onChange={e => setNewLine(p => ({ ...p, account_id: e.target.value }))} style={inputStyle}><option value="">Select</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.account_name}</option>)}</select></div>
                <div style={{ width: 90 }}><label style={labelStyle}>Debit</label><input type="number" step="0.01" value={newLine.debit} onChange={e => setNewLine(p => ({ ...p, debit: parseFloat(e.target.value) || 0 }))} style={inputStyle} /></div>
                <div style={{ width: 90 }}><label style={labelStyle}>Credit</label><input type="number" step="0.01" value={newLine.credit} onChange={e => setNewLine(p => ({ ...p, credit: parseFloat(e.target.value) || 0 }))} style={inputStyle} /></div>
                <button type="button" onClick={handleAddLine} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', height: 36, flexShrink: 0 }}>Add</button>
              </div>

              <div style={{ marginBottom: 16 }}><label style={labelStyle}>Description</label><textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} style={{ ...inputStyle, minHeight: 50 }} /></div>

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
const btnStyle = { color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 5, cursor: 'pointer', fontSize: 11, marginRight: 4, background: '#3b82f6' };
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: '#374151' };
const inputStyle = { width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' };

export default RecurringEntries;
