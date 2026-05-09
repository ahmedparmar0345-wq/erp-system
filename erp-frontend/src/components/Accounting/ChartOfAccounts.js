import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ChartOfAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ account_code: '', account_name: '', account_type: 'Asset', parent_account_id: '', description: '' });

  const accountTypes = ['Asset', 'Liability', 'Equity', 'Income', 'Expense'];

  useEffect(() => { fetchAccounts(); }, []);

  const token = () => localStorage.getItem('token');
  const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}` });

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/accounting/chart-of-accounts', { headers: headers() });
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editing) {
        res = await fetch(`/api/accounting-enhancements/chart-of-accounts/${editing}`, { method: 'PUT', headers: headers(), body: JSON.stringify(formData) });
      } else {
        res = await fetch('/api/accounting/chart-of-accounts', { method: 'POST', headers: headers(), body: JSON.stringify(formData) });
      }
      if (res.ok) {
        alert(editing ? 'Account updated' : 'Account created');
        setShowModal(false); setEditing(null);
        setFormData({ account_code: '', account_name: '', account_type: 'Asset', parent_account_id: '', description: '' });
        fetchAccounts();
      } else { const err = await res.json(); alert(err.error); }
    } catch (err) { console.error(err); }
  };

  const handleToggle = async (id) => {
    try {
      await fetch(`/api/accounting-enhancements/chart-of-accounts/${id}/toggle`, { method: 'PATCH', headers: headers() });
      fetchAccounts();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this account?')) return;
    try {
      const res = await fetch(`/api/accounting-enhancements/chart-of-accounts/${id}`, { method: 'DELETE', headers: headers() });
      if (res.ok) { alert('Account deleted'); fetchAccounts(); }
      else { const err = await res.json(); alert(err.error); }
    } catch (err) { console.error(err); }
  };

  const grouped = accounts.reduce((acc, a) => {
    if (!acc[a.account_type]) acc[a.account_type] = [];
    acc[a.account_type].push(a);
    return acc;
  }, {});

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="coa-page" style={{ padding: '20px' }}>
      <style>{`
        @media (max-width: 768px) {
          .coa-header { flex-direction: column !important; align-items: stretch !important; }
          .coa-header h2 { font-size: 20px !important; }
          .coa-header button { width: 100% !important; }
          .coa-grid { grid-template-columns: 1fr !important; }
          .coa-item { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
          .coa-item-actions { width: 100% !important; justify-content: flex-start !important; }
        }
        @media (max-width: 480px) {
          .coa-page { padding: 12px !important; }
          .coa-modal-content { width: 95% !important; padding: 20px !important; }
          .coa-modal-actions { flex-direction: column !important; }
          .coa-modal-actions button { width: 100% !important; }
        }
      `}</style>
      <div className="coa-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Chart of Accounts</h2>
        <button onClick={() => { setEditing(null); setFormData({ account_code: '', account_name: '', account_type: 'Asset', parent_account_id: '', description: '' }); setShowModal(true); }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>+ New Account</button>
      </div>
      {loading ? <p>Loading...</p> : (
        <div className="coa-grid" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {accountTypes.map(type => {
            const items = grouped[type] || [];
            if (items.length === 0) return null;
            const colors = { Asset: '#3b82f6', Liability: '#f59e0b', Equity: '#10b981', Income: '#8b5cf6', Expense: '#ef4444' };
            return (
              <div key={type} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '12px 16px', background: colors[type] || '#6b7280', color: '#fff', fontWeight: 600, fontSize: 14 }}>{type} ({items.length})</div>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {items.map(a => (
                    <div key={a.id} className="coa-item" style={{ padding: '10px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: a.is_active === false ? 0.5 : 1 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{a.account_name}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{a.account_code}</div>
                      </div>
                      <div className="coa-item-actions" style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => { setEditing(a.id); setFormData({ account_code: a.account_code, account_name: a.account_name, account_type: a.account_type, parent_account_id: a.parent_account_id || '', description: a.description || '' }); setShowModal(true); }} style={btnSm}>Edit</button>
                        <button onClick={() => handleToggle(a.id)} style={{ ...btnSm, background: a.is_active === false ? '#10b981' : '#f59e0b' }}>{a.is_active === false ? 'Activate' : 'Deact.'}</button>
                        <button onClick={() => handleDelete(a.id)} style={{ ...btnSm, background: '#ef4444' }}>Del</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="coa-modal-content" style={{ background: '#fff', borderRadius: 16, padding: 32, width: 500, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px' }}>{editing ? 'Edit Account' : 'New Account'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
                <div><label style={labelStyle}>Account Code *</label><input value={formData.account_code} onChange={e => setFormData(p => ({ ...p, account_code: e.target.value }))} style={inputStyle} required /></div>
                <div><label style={labelStyle}>Account Name *</label><input value={formData.account_name} onChange={e => setFormData(p => ({ ...p, account_name: e.target.value }))} style={inputStyle} required /></div>
                <div><label style={labelStyle}>Type</label><select value={formData.account_type} onChange={e => setFormData(p => ({ ...p, account_type: e.target.value }))} style={inputStyle}>{accountTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label style={labelStyle}>Parent Account</label><select value={formData.parent_account_id} onChange={e => setFormData(p => ({ ...p, parent_account_id: e.target.value }))} style={inputStyle}><option value="">None (Top Level)</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.account_code} - {a.account_name}</option>)}</select></div>
                <div><label style={labelStyle}>Description</label><textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} style={{ ...inputStyle, minHeight: 50 }} /></div>
              </div>
              <div className="coa-modal-actions" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
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

const btnSm = { color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11, background: '#3b82f6' };
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: '#374151' };
const inputStyle = { width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' };

export default ChartOfAccounts;
