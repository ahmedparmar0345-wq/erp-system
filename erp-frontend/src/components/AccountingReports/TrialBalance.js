import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { printReport } from '../../utils/printUtils';

const TrialBalance = () => {
  const [data, setData] = useState({ accounts: [], total_debit: 0, total_credit: 0 });
  const [loading, setLoading] = useState(true);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const navigate = useNavigate();

  useEffect(() => { fetchTrialBalance(); }, [asOfDate]);

  const fetchTrialBalance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/accounting-reports/trial-balance?as_of=${asOfDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      setData(result);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handlePrint = () => printReport('trial-balance-content', 'Trial Balance');
  const formatCurrency = (value) => `$${(value || 0).toFixed(2)}`;

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Trial Balance...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <style>{`
        @media (max-width: 480px) {
          .tb-wrap { overflow: visible; }
          .tb-wrap table, .tb-wrap thead, .tb-wrap tbody,
          .tb-wrap tr, .tb-wrap td, .tb-wrap th { display: block; }
          .tb-wrap thead tr { display: none; }
          .tb-wrap td {
            display: flex; justify-content: space-between; align-items: center;
            padding: 6px 10px !important;
            border-bottom: 1px solid #e5e7eb;
          }
          .tb-wrap td::before {
            content: attr(data-label);
            font-weight: 600; font-size: 11px; color: #6b7280;
            margin-right: 12px; flex-shrink: 0;
          }
          .tb-wrap td:last-child { border-bottom: 2px solid #d1d5db; }
          .tb-wrap tr { margin-bottom: 10px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
          .tb-header { flex-direction: column !important; align-items: stretch !important; gap: 10px !important; }
          .tb-header > div { flex-wrap: wrap !important; }
        }
      `}</style>
      <div className="tb-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <button onClick={() => navigate('/accounting-reports')} style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>← Back to Reports</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} /><button onClick={handlePrint} style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🖨️ Print</button></div>
      </div>
      <div id="trial-balance-content">
        <h2 style={{ textAlign: 'center' }}>Trial Balance</h2>
        <p style={{ textAlign: 'center', color: '#666' }}>As of {new Date(asOfDate).toLocaleDateString()}</p>
        <div className="tb-wrap" style={{ overflowX: 'auto', width: '100%' }}>
        <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={{ padding: '8px', textAlign: 'left' }}>Account Code</th><th style={{ padding: '8px', textAlign: 'left' }}>Account Name</th><th style={{ padding: '8px', textAlign: 'left' }}>Type</th><th style={{ padding: '8px', textAlign: 'right' }}>Debit</th><th style={{ padding: '8px', textAlign: 'right' }}>Credit</th></tr></thead>
          <tbody>
            {data.accounts.map((acc, idx) => (<tr key={idx}><td data-label="Code" style={{ padding: '8px' }}>{acc.account_code}</td><td data-label="Name" style={{ padding: '8px' }}>{acc.account_name}</td><td data-label="Type" style={{ padding: '8px' }}>{acc.account_type}</td><td data-label="Debit" style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(acc.debit)}</td><td data-label="Credit" style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(acc.credit)}</td></tr>))}
            <tr style={{ fontWeight: 'bold', borderTop: '2px solid #ddd' }}><td data-label="Total" colSpan="3" style={{ padding: '8px' }}>Total</td><td data-label="Debit" style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(data.total_debit)}</td><td data-label="Credit" style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(data.total_credit)}</td></tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default TrialBalance;