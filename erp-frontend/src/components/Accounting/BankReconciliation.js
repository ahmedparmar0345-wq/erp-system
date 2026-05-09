import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const BankReconciliation = () => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('accounts');
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [reconciliations, setReconciliations] = useState([]);
  const [showReconModal, setShowReconModal] = useState(false);
  const [formData, setFormData] = useState({ account_id: '', bank_name: '', account_number: '', account_name: '', opening_balance: 0, as_of_date: new Date().toISOString().split('T')[0] });
  const [reconData, setReconData] = useState({ statement_date: new Date().toISOString().split('T')[0], statement_balance: 0, uncleared_deposits: 0, uncleared_checks: 0, notes: '' });
  const [csvData, setCsvData] = useState('');

  useEffect(() => {
    fetchBankAccounts();
    fetchAccounts();
    fetchReconciliations();
  }, []);

  const token = () => localStorage.getItem('token');
  const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}` });

  const fetchBankAccounts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/accounting-enhancements/bank-accounts', { headers: headers() });
      const data = await res.json();
      setBankAccounts(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchTransactions = async (bankId, filter = '') => {
    try {
      const res = await fetch(`/api/accounting-enhancements/bank-accounts/${bankId}/transactions${filter}`, { headers: headers() });
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const fetchReconciliations = async () => {
    try {
      const res = await fetch('/api/accounting-enhancements/reconciliation', { headers: headers() });
      const data = await res.json();
      setReconciliations(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounting/chart-of-accounts', { headers: headers() });
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/accounting-enhancements/bank-accounts', { method: 'POST', headers: headers(), body: JSON.stringify(formData) });
      if (res.ok) { alert('Bank account created'); setShowAccountModal(false); fetchBankAccounts(); }
      else { const err = await res.json(); alert(err.error); }
    } catch (err) { console.error(err); }
  };

  const handleImportTransactions = async () => {
    if (!selectedBank) return alert('Select a bank account first');
    try {
      const lines = csvData.trim().split('\n').slice(1);
      const transactions = lines.map(line => {
        const cols = line.split(',');
        return { transaction_date: cols[0]?.trim(), description: cols[1]?.trim(), reference_number: cols[2]?.trim(), debit: parseFloat(cols[3]?.trim()) || 0, credit: parseFloat(cols[4]?.trim()) || 0 };
      }).filter(t => t.transaction_date);

      const res = await fetch(`/api/accounting-enhancements/bank-accounts/${selectedBank.id}/transactions/import`, {
        method: 'POST', headers: headers(), body: JSON.stringify({ transactions })
      });
      if (res.ok) { alert(`${transactions.length} transactions imported`); setShowImportModal(false); fetchTransactions(selectedBank.id); }
      else { const err = await res.json(); alert(err.error); }
    } catch (err) { console.error(err); }
  };

  const handleMatch = async (txnId) => {
    const entryId = prompt('Enter Journal Entry ID to match:');
    if (!entryId) return;
    try {
      await fetch(`/api/accounting-enhancements/transactions/${txnId}/match`, { method: 'PATCH', headers: headers(), body: JSON.stringify({ journal_entry_id: parseInt(entryId) }) });
      if (selectedBank) fetchTransactions(selectedBank.id);
    } catch (err) { console.error(err); }
  };

  const handleUnmatch = async (txnId) => {
    try {
      await fetch(`/api/accounting-enhancements/transactions/${txnId}/unmatch`, { method: 'PATCH', headers: headers() });
      if (selectedBank) fetchTransactions(selectedBank.id);
    } catch (err) { console.error(err); }
  };

  const handleReconcile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/accounting-enhancements/reconciliation', {
        method: 'POST', headers: headers(), body: JSON.stringify({ ...reconData, bank_account_id: selectedBank.id })
      });
      if (res.ok) { alert('Reconciliation saved'); setShowReconModal(false); fetchReconciliations(); }
      else { const err = await res.json(); alert(err.error); }
    } catch (err) { console.error(err); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <style>{`
        @media (max-width: 768px) {
          .br-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .br-table-wrap table { min-width: 700px; }
        }
        @media (max-width: 480px) {
          .br-table-wrap { overflow: visible; }
          .br-table-wrap table,
          .br-table-wrap thead,
          .br-table-wrap tbody,
          .br-table-wrap tr,
          .br-table-wrap td,
          .br-table-wrap th { display: block; }
          .br-table-wrap thead tr { display: none; }
          .br-table-wrap td {
            display: flex; justify-content: space-between; align-items: center;
            padding: 8px 12px !important;
            border-bottom: 1px solid #e5e7eb;
          }
          .br-table-wrap td::before {
            content: attr(data-label);
            font-weight: 600; font-size: 11px; color: #6b7280; text-transform: uppercase;
            margin-right: 12px; flex-shrink: 0;
          }
          .br-table-wrap td:last-child { border-bottom: 2px solid #d1d5db; }
          .br-table-wrap tr { margin-bottom: 12px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }

          .br-modal-inner { width: 95% !important; max-width: 95% !important; padding: 20px !important; }
          .br-filter-row { flex-direction: column !important; align-items: stretch !important; gap: 8px !important; }
        }
      `}</style>
      <h2 style={{ margin: '0 0 20px', fontSize: window.innerWidth <= 480 ? 16 : undefined }}>Bank Reconciliation</h2>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {['accounts', 'transactions', 'reports'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: '8px 20px', border: 'none', borderRadius: 8, cursor: 'pointer', background: activeTab === tab ? '#3b82f6' : '#e5e7eb', color: activeTab === tab ? '#fff' : '#374151', fontWeight: 500, fontSize: 13 }}>
            {tab === 'accounts' ? 'Bank Accounts' : tab === 'transactions' ? 'Transactions' : 'Reconciliation Reports'}
          </button>
        ))}
      </div>

      {activeTab === 'accounts' && (
        <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button onClick={() => setShowAccountModal(true)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>+ Add Bank Account</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {bankAccounts.map(ba => (
              <div key={ba.id} style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer', border: selectedBank?.id === ba.id ? '2px solid #3b82f6' : 'none' }}
                onClick={() => { setSelectedBank(ba); fetchTransactions(ba.id); setActiveTab('transactions'); }}>
                <h4 style={{ margin: '0 0 4px', fontSize: 15 }}>{ba.bank_name}</h4>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{ba.account_name} - {ba.account_number || 'N/A'}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>COA: {ba.account_code} - {ba.account_name}</div>
              </div>
            ))}
            {bankAccounts.length === 0 && <p style={{ color: '#6b7280' }}>No bank accounts. Add one to start reconciling.</p>}
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div>
          {selectedBank ? (
            <div>
              <div className="br-filter-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <h4 style={{ margin: 0, fontSize: window.innerWidth <= 480 ? 14 : undefined }}>{selectedBank.bank_name} - Transactions</h4>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => { fetchTransactions(selectedBank.id, '?is_cleared=false'); }} style={btnStyle}>Uncleared</button>
                  <button onClick={() => fetchTransactions(selectedBank.id)} style={btnStyle}>All</button>
                  <button onClick={() => setShowImportModal(true)} style={{ ...btnStyle, background: '#10b981' }}>Import CSV</button>
                </div>
              </div>
              <div className="br-table-wrap" style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                    <th style={thStyle}>Date</th><th style={thStyle}>Description</th><th style={thStyle}>Ref #</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Debit</th><th style={{ ...thStyle, textAlign: 'right' }}>Credit</th>
                    <th style={thStyle}>Status</th><th style={thStyle}>Actions</th>
                  </tr></thead>
                  <tbody>
                    {transactions.map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #e5e7eb', opacity: t.is_cleared ? 0.7 : 1 }}>
                        <td data-label="Date" style={tdStyle}>{new Date(t.transaction_date).toLocaleDateString()}</td>
                        <td data-label="Description" style={tdStyle}>{t.description || '-'}</td>
                        <td data-label="Ref #" style={tdStyle}>{t.reference_number || '-'}</td>
                        <td data-label="Debit" style={{ ...tdStyle, textAlign: 'right', color: '#ef4444' }}>{t.debit > 0 ? `$${parseFloat(t.debit).toFixed(2)}` : '-'}</td>
                        <td data-label="Credit" style={{ ...tdStyle, textAlign: 'right', color: '#10b981' }}>{t.credit > 0 ? `$${parseFloat(t.credit).toFixed(2)}` : '-'}</td>
                        <td data-label="Status" style={tdStyle}><span style={{ background: t.is_cleared ? '#10b981' : '#f59e0b', color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 11 }}>{t.is_cleared ? 'Cleared' : 'Uncleared'}</span></td>
                        <td data-label="Actions" style={tdStyle}>
                          {!t.is_cleared && <button onClick={() => handleMatch(t.id)} style={btnSmall}>Match</button>}
                          {t.is_cleared && <button onClick={() => handleUnmatch(t.id)} style={{ ...btnSmall, background: '#f59e0b' }}>Unmatch</button>}
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center' }}>No transactions. Import a CSV to begin.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          ) : <p style={{ color: '#6b7280' }}>Select a bank account from the Accounts tab</p>}
        </div>
      )}

      {activeTab === 'reports' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            {selectedBank && <button onClick={() => setShowReconModal(true)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>New Reconciliation</button>}
          </div>
          <div className="br-table-wrap" style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                <th style={thStyle}>Bank</th><th style={thStyle}>Date</th><th style={{ ...thStyle, textAlign: 'right' }}>Statement</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Book</th><th style={{ ...thStyle, textAlign: 'right' }}>Difference</th><th style={thStyle}>Status</th>
              </tr></thead>
              <tbody>
                {reconciliations.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td data-label="Bank" style={tdStyle}>{r.bank_name}</td>
                    <td data-label="Date" style={tdStyle}>{new Date(r.statement_date).toLocaleDateString()}</td>
                    <td data-label="Statement" style={{ ...tdStyle, textAlign: 'right' }}>${parseFloat(r.statement_balance).toFixed(2)}</td>
                    <td data-label="Book" style={{ ...tdStyle, textAlign: 'right' }}>${parseFloat(r.book_balance).toFixed(2)}</td>
                    <td data-label="Difference" style={{ ...tdStyle, textAlign: 'right', color: parseFloat(r.difference) === 0 ? '#10b981' : '#ef4444' }}>${parseFloat(r.difference).toFixed(2)}</td>
                    <td data-label="Status" style={tdStyle}><span style={{ background: r.status === 'completed' ? '#10b981' : '#f59e0b', color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 11 }}>{r.status}</span></td>
                  </tr>
                ))}
                {reconciliations.length === 0 && <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center' }}>No reconciliations yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAccountModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="br-modal-inner" style={{ background: '#fff', borderRadius: 16, padding: 32, width: 500, maxWidth: '90%' }}>
            <h3 style={{ margin: '0 0 20px' }}>Add Bank Account</h3>
            <form onSubmit={handleCreateAccount}>
              <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
                <div><label style={labelStyle}>COA Account *</label><select value={formData.account_id} onChange={e => setFormData(p => ({ ...p, account_id: e.target.value }))} style={inputStyle} required><option value="">Select</option>{accounts.filter(a => a.account_type === 'Asset').map(a => <option key={a.id} value={a.id}>{a.account_code} - {a.account_name}</option>)}</select></div>
                <div><label style={labelStyle}>Bank Name *</label><input value={formData.bank_name} onChange={e => setFormData(p => ({ ...p, bank_name: e.target.value }))} style={inputStyle} required /></div>
                <div><label style={labelStyle}>Account Number</label><input value={formData.account_number} onChange={e => setFormData(p => ({ ...p, account_number: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Account Name</label><input value={formData.account_name} onChange={e => setFormData(p => ({ ...p, account_name: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Opening Balance</label><input type="number" step="0.01" value={formData.opening_balance} onChange={e => setFormData(p => ({ ...p, opening_balance: parseFloat(e.target.value) || 0 }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>As Of Date</label><input type="date" value={formData.as_of_date} onChange={e => setFormData(p => ({ ...p, as_of_date: e.target.value }))} style={inputStyle} /></div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAccountModal(false)} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="br-modal-inner" style={{ background: '#fff', borderRadius: 16, padding: 32, width: 600, maxWidth: '90%' }}>
            <h3 style={{ margin: '0 0 8px' }}>Import Bank Transactions</h3>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 16px' }}>Paste CSV with columns: date, description, reference, debit, credit (one per line, skip header)</p>
            <textarea value={csvData} onChange={e => setCsvData(e.target.value)} style={{ ...inputStyle, minHeight: 200, fontFamily: 'monospace', fontSize: 12 }} placeholder="date,description,ref,debit,credit&#10;2026-01-15,Payment from Client,INV-001,,5000&#10;2026-01-16,Rent Payment,CHK-1001,2000," />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setShowImportModal(false)} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleImportTransactions} style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Import</button>
            </div>
          </div>
        </div>
      )}

      {showReconModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="br-modal-inner" style={{ background: '#fff', borderRadius: 16, padding: 32, width: 500, maxWidth: '90%' }}>
            <h3 style={{ margin: '0 0 20px' }}>New Reconciliation</h3>
            <form onSubmit={handleReconcile}>
              <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
                <div><label style={labelStyle}>Bank Account</label><input value={selectedBank?.bank_name || ''} disabled style={inputStyle} /></div>
                <div><label style={labelStyle}>Statement Date *</label><input type="date" value={reconData.statement_date} onChange={e => setReconData(p => ({ ...p, statement_date: e.target.value }))} style={inputStyle} required /></div>
                <div><label style={labelStyle}>Statement Balance *</label><input type="number" step="0.01" value={reconData.statement_balance} onChange={e => setReconData(p => ({ ...p, statement_balance: parseFloat(e.target.value) || 0 }))} style={inputStyle} required /></div>
                <div><label style={labelStyle}>Uncleared Deposits</label><input type="number" step="0.01" value={reconData.uncleared_deposits} onChange={e => setReconData(p => ({ ...p, uncleared_deposits: parseFloat(e.target.value) || 0 }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Uncleared Checks</label><input type="number" step="0.01" value={reconData.uncleared_checks} onChange={e => setReconData(p => ({ ...p, uncleared_checks: parseFloat(e.target.value) || 0 }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Notes</label><textarea value={reconData.notes} onChange={e => setReconData(p => ({ ...p, notes: e.target.value }))} style={{ ...inputStyle, minHeight: 50 }} /></div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowReconModal(false)} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Save</button>
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
const btnStyle = { background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12 };
const btnSmall = { color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11, background: '#3b82f6' };
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: '#374151' };
const inputStyle = { width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' };

export default BankReconciliation;
