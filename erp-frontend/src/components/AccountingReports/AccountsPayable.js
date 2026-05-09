import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { printReport } from '../../utils/printUtils';

const AccountsPayable = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchAccountsPayable(); }, []);

  const fetchAccountsPayable = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/accounting-reports/accounts-payable', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      setSuppliers(Array.isArray(result) ? result : []);
    } catch (err) { console.error(err); setError(err.message); } finally { setLoading(false); }
  };

  const handlePrint = () => printReport('accounts-payable-content', 'Accounts Payable');
  const formatCurrency = (value) => `$${(value || 0).toFixed(2)}`;

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Accounts Payable...</div>;
  if (error) return <div style={{ padding: '40px', textAlign: 'center' }}><p style={{ color: 'red' }}>Error: {error}</p><button onClick={fetchAccountsPayable} style={{ padding: '8px 16px', cursor: 'pointer' }}>Retry</button></div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <style>{`
        @media (max-width: 480px) {
          .ap-wrap { overflow: visible; }
          .ap-wrap table, .ap-wrap thead, .ap-wrap tbody,
          .ap-wrap tr, .ap-wrap td, .ap-wrap th { display: block; }
          .ap-wrap thead tr { display: none; }
          .ap-wrap td {
            display: flex; justify-content: space-between; align-items: center;
            padding: 8px 10px !important;
            border-bottom: 1px solid #e5e7eb;
          }
          .ap-wrap td::before {
            content: attr(data-label);
            font-weight: 600; font-size: 11px; color: #6b7280;
            margin-right: 12px; flex-shrink: 0;
          }
          .ap-wrap td:last-child { border-bottom: 2px solid #d1d5db; }
          .ap-wrap tr { margin-bottom: 10px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <button onClick={() => navigate('/accounting-reports')} style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>← Back to Reports</button>
        <button onClick={handlePrint} style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🖨️ Print</button>
      </div>
      <div id="accounts-payable-content">
        <h2 style={{ textAlign: 'center' }}>Accounts Payable</h2>
        <div className="ap-wrap" style={{ overflowX: 'auto', width: '100%' }}>
        <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={{ padding: '8px', textAlign: 'left' }}>Supplier</th><th style={{ padding: '8px', textAlign: 'right' }}>Total Due</th><th style={{ padding: '8px', textAlign: 'center' }}>PO Count</th><th style={{ padding: '8px', textAlign: 'left' }}>Last PO Date</th></tr></thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No outstanding payables found.</td></tr>
            ) : (
              suppliers.map(s => (<tr key={s.id}><td data-label="Supplier" style={{ padding: '8px' }}>{s.name}</td><td data-label="Total Due" style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(s.total_due)}</td><td data-label="PO Count" style={{ padding: '8px', textAlign: 'center' }}>{s.po_count}</td><td data-label="Last PO" style={{ padding: '8px' }}>{s.last_po_date ? new Date(s.last_po_date).toLocaleDateString() : '-'}</td></tr>))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default AccountsPayable;