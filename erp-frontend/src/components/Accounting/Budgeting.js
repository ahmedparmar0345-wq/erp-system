import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Budgeting = () => {
  const [budgets, setBudgets] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [budgetVsActual, setBudgetVsActual] = useState(null);
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportBudgetId, setReportBudgetId] = useState('');
  const [formData, setFormData] = useState({ fiscal_year: new Date().getFullYear(), name: '', notes: '' });
  const [items, setItems] = useState([]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  useEffect(() => {
    fetchBudgets();
    fetchAccounts();
    fetchCostCenters();
  }, []);

  const token = () => localStorage.getItem('token');
  const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}` });

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/accounting-enhancements/budgets', { headers: headers() });
      const data = await res.json();
      setBudgets(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchBudgetDetail = async (id) => {
    try {
      const res = await fetch(`/api/accounting-enhancements/budgets/${id}`, { headers: headers() });
      setSelectedBudget(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchBudgetVsActual = async () => {
    if (!reportBudgetId) return;
    try {
      const res = await fetch(`/api/accounting-enhancements/reports/budget-vs-actual?budget_id=${reportBudgetId}&month=${reportMonth}&year=${new Date().getFullYear()}`, { headers: headers() });
      setBudgetVsActual(await res.json());
    } catch (err) { console.error(err); }
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

  const handleAddItem = () => {
    const empty = { account_id: '', cost_center_id: '' };
    monthKeys.forEach(m => empty[m] = 0);
    setItems(prev => [...prev, empty]);
  };

  const updateItem = (index, field, value) => {
    setItems(prev => { const n = [...prev]; n[index] = { ...n[index], [field]: value }; return n; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/accounting-enhancements/budgets', {
        method: 'POST', headers: headers(), body: JSON.stringify({ ...formData, items })
      });
      if (res.ok) { alert('Budget created'); setShowModal(false); fetchBudgets(); }
      else { const err = await res.json(); alert(err.error); }
    } catch (err) { console.error(err); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bud-page" style={{ padding: '20px' }}>
      <style>{`
        @media (max-width: 768px) {
          .bud-header { flex-direction: column !important; align-items: stretch !important; }
          .bud-header h2 { font-size: 20px !important; }
          .bud-header button { width: 100% !important; }
          .bud-grid { grid-template-columns: 1fr !important; }
          .bud-filter { flex-direction: column !important; }
          .bud-filter select, .bud-filter button { width: 100% !important; }
          .bud-form-row { flex-direction: column !important; }
          .bud-form-row > div { width: 100% !important; }
          .bud-modal-content { width: 95% !important; padding: 20px !important; }
          .bud-modal-actions { flex-direction: column !important; }
          .bud-modal-actions button { width: 100% !important; }
          .bud-table-wrap { overflow-x: visible !important; }
        }
        @media (max-width: 480px) {
          .bud-page { padding: 12px !important; }
          .bud-card { padding: 16px !important; }
        }
      `}</style>

      <div className="bud-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Budgets</h2>
        <button onClick={() => { setItems([]); setFormData({ fiscal_year: new Date().getFullYear(), name: '', notes: '' }); setShowModal(true); }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>+ New Budget</button>
      </div>

      <div className="bud-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="bud-card" style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h4 style={{ margin: '0 0 12px' }}>Budgets</h4>
          {budgets.map(b => (
            <div key={b.id} style={{ padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 8, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onClick={() => fetchBudgetDetail(b.id)}>
              <div><strong>{b.name}</strong><div style={{ fontSize: 12, color: '#6b7280' }}>FY {b.fiscal_year}</div></div>
              <span style={{ background: b.status === 'approved' ? '#10b981' : b.status === 'draft' ? '#f59e0b' : '#6b7280', color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 11, whiteSpace: 'nowrap' }}>{b.status}</span>
            </div>
          ))}
          {budgets.length === 0 && <p style={{ color: '#6b7280', fontSize: 13 }}>No budgets yet</p>}
        </div>

        <div className="bud-card" style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h4 style={{ margin: '0 0 12px' }}>Budget vs Actual</h4>
          <div className="bud-filter" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <select value={reportBudgetId} onChange={e => setReportBudgetId(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 0 }}>
              <option value="">Select Budget</option>
              {budgets.map(b => <option key={b.id} value={b.id}>{b.name} (FY{b.fiscal_year})</option>)}
            </select>
            <select value={reportMonth} onChange={e => setReportMonth(parseInt(e.target.value))} style={{ ...inputStyle, width: 100, flexShrink: 0 }}>
              {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <button onClick={fetchBudgetVsActual} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap' }}>Run</button>
          </div>
          {budgetVsActual && (
            <div className="bud-table-wrap" style={{ fontSize: 13, maxHeight: 300, overflowY: 'auto' }}>
              <table className="bud-table table-modern" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
                <thead><tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'left' }}>Account</th>
                  <th style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'right' }}>Budget</th>
                  <th style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'right' }}>Actual</th>
                  <th style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'right' }}>Variance</th>
                </tr></thead>
                <tbody>
                  {budgetVsActual.rows.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: 6, border: '1px solid #e5e7eb' }}>{r.account_name}</td>
                      <td style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'right' }}>${r.budget_amount.toFixed(2)}</td>
                      <td style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'right' }}>${r.actual_amount.toFixed(2)}</td>
                      <td style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'right', color: r.variance < 0 ? '#ef4444' : '#10b981' }}>${r.variance.toFixed(2)}</td>
                    </tr>
                  ))}
                  {budgetVsActual.totals && (
                    <tr style={{ fontWeight: 600, background: '#f8fafc' }}>
                      <td style={{ padding: 6, border: '1px solid #e5e7eb' }}>TOTAL</td>
                      <td style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'right' }}>${budgetVsActual.totals.budget.toFixed(2)}</td>
                      <td style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'right' }}>${budgetVsActual.totals.actual.toFixed(2)}</td>
                      <td style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'right', color: budgetVsActual.totals.variance < 0 ? '#ef4444' : '#10b981' }}>${budgetVsActual.totals.variance.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedBudget && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="bud-modal-content" style={{ background: '#fff', borderRadius: 16, padding: 24, width: 800, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>{selectedBudget.name} (FY {selectedBudget.fiscal_year})</h3>
              <button onClick={() => setSelectedBudget(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            {selectedBudget.items && selectedBudget.items.length > 0 ? (
              <div className="bud-table-wrap" style={{ maxHeight: 500, overflowY: 'auto' }}>
                <table className="bud-table table-modern" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: '600px' }}>
                  <thead><tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'left' }}>Account</th>
                    {months.map(m => <th key={m} style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'right' }}>{m}</th>)}
                    <th style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'right' }}>Total</th>
                  </tr></thead>
                  <tbody>
                    {selectedBudget.items.map((item, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: 6, border: '1px solid #e5e7eb' }}>{item.account_name || `Account #${item.account_id}`}</td>
                        {monthKeys.map(m => <td key={m} style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'right' }}>${parseFloat(item[m] || 0).toFixed(0)}</td>)}
                        <td style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'right', fontWeight: 600 }}>${parseFloat(item.annual_total || 0).toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p>No items in this budget</p>}
          </div>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="bud-modal-content" style={{ background: '#fff', borderRadius: 16, padding: 24, width: 800, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 18 }}>New Budget</h3>
            <form onSubmit={handleSubmit}>
              <div className="bud-form-row" style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Name *</label><input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} style={inputStyle} required /></div>
                <div style={{ width: 120, flexShrink: 0 }}><label style={labelStyle}>Fiscal Year *</label><input type="number" value={formData.fiscal_year} onChange={e => setFormData(p => ({ ...p, fiscal_year: parseInt(e.target.value) }))} style={inputStyle} required /></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ margin: 0, fontSize: 14 }}>Budget Items</h4>
                <button type="button" onClick={handleAddItem} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>+ Add Row</button>
              </div>

              {items.length > 0 && (
                <div className="bud-table-wrap" style={{ maxHeight: 400, overflowX: 'auto', fontSize: 12 }}>
                  <table className="bud-table table-modern" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                    <thead><tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'left' }}>Account</th>
                      <th style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'left' }}>Cost Center</th>
                      {months.map(m => <th key={m} style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'right', width: 60 }}>{m}</th>)}
                    </tr></thead>
                    <tbody>
                      {items.map((item, i) => (
                        <tr key={i}>
                          <td style={{ padding: 4, border: '1px solid #e5e7eb' }}>
                            <select value={item.account_id} onChange={e => updateItem(i, 'account_id', e.target.value)} style={{ ...inputStyle, fontSize: 11, padding: '4px 6px', minWidth: 140 }} required>
                              <option value="">Select</option>
                              {accounts.filter(a => a.account_type === 'Income' || a.account_type === 'Expense').map(a => <option key={a.id} value={a.id}>{a.account_name}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: 4, border: '1px solid #e5e7eb' }}>
                            <select value={item.cost_center_id} onChange={e => updateItem(i, 'cost_center_id', e.target.value)} style={{ ...inputStyle, fontSize: 11, padding: '4px 6px', minWidth: 100 }}>
                              <option value="">All</option>
                              {costCenters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </td>
                          {monthKeys.map(m => (
                            <td key={m} style={{ padding: 4, border: '1px solid #e5e7eb' }}>
                              <input type="number" value={item[m]} onChange={e => updateItem(i, m, parseFloat(e.target.value) || 0)} style={{ ...inputStyle, fontSize: 11, padding: '4px 6px', textAlign: 'right', width: 55 }} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {items.length === 0 && <p style={{ color: '#6b7280', fontSize: 13 }}>Click "Add Row" to add budget items</p>}

              <div style={{ marginTop: 12 }}><label style={labelStyle}>Notes</label><textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} style={{ ...inputStyle, minHeight: 50 }} /></div>
              <div className="bud-modal-actions" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Create Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: '#374151' };
const inputStyle = { width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' };

export default Budgeting;
