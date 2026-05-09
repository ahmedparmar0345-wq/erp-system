import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { printReport } from '../../utils/printUtils';

const IncomeStatement = () => {
  const [data, setData] = useState({ revenue: [], expenses: [], total_revenue: 0, total_expenses: 0, net_profit: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchIncomeStatement();
  }, [dateRange]);

  const fetchIncomeStatement = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/accounting-reports/income-statement?start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => printReport('income-statement-content', 'Income Statement');
  const formatCurrency = (value) => `$${(value || 0).toFixed(2)}`;

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Income Statement...</div>;
  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <button onClick={() => navigate('/accounting-reports')} className="no-print" style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>← Back to Reports</button>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input type="date" value={dateRange.start_date} onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
          <span>to</span>
          <input type="date" value={dateRange.end_date} onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
          <button onClick={handlePrint} style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🖨️ Print</button>
        </div>
      </div>

      <div id="income-statement-content">
        <h2 style={{ textAlign: 'center' }}>Income Statement</h2>
        <p style={{ textAlign: 'center', color: '#666' }}>For period {new Date(dateRange.start_date).toLocaleDateString()} - {new Date(dateRange.end_date).toLocaleDateString()}</p>

        <style>{`
          @media (max-width: 768px) { .report-grid { grid-template-columns: 1fr !important; } }
          @media (max-width: 480px) {
            .is-table-wrap { overflow: visible; }
            .is-table-wrap table, .is-table-wrap thead, .is-table-wrap tbody,
            .is-table-wrap tr, .is-table-wrap td, .is-table-wrap th { display: block; }
            .is-table-wrap thead tr { display: none; }
            .is-table-wrap td {
              display: flex; justify-content: space-between; align-items: center;
              padding: 6px 10px !important;
              border-bottom: 1px solid #e5e7eb;
            }
            .is-table-wrap td::before {
              content: attr(data-label);
              font-weight: 600; font-size: 11px; color: #6b7280;
              margin-right: 12px; flex-shrink: 0;
            }
            .is-table-wrap td:last-child { border-bottom: 2px solid #d1d5db; }
            .is-table-wrap tr { margin-bottom: 10px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
          }
        `}</style>
        <div className="report-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div><h3 style={{ fontSize: 'clamp(14px, 4vw, 18px)' }}>Revenue</h3>
            <div className="is-table-wrap" style={{ overflowX: 'auto', width: '100%' }}>
            <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={{ padding: '8px', textAlign: 'left' }}>Account</th><th style={{ padding: '8px', textAlign: 'right' }}>Amount</th></tr></thead>
              <tbody>
                {data.revenue.map((item, idx) => (<tr key={idx}><td data-label="Account" style={{ padding: '8px' }}>{item.account_name}</td><td data-label="Amount" style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(item.amount)}</td></tr>))}
                <tr style={{ fontWeight: 'bold', borderTop: '2px solid #ddd' }}><td data-label="Account" style={{ padding: '8px' }}>Total Revenue</td><td data-label="Amount" style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(data.total_revenue)}</td></tr>
              </tbody>
            </table>
            </div>
          </div>
          <div><h3 style={{ fontSize: 'clamp(14px, 4vw, 18px)' }}>Expenses</h3>
            <div className="is-table-wrap" style={{ overflowX: 'auto', width: '100%' }}>
            <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={{ padding: '8px', textAlign: 'left' }}>Account</th><th style={{ padding: '8px', textAlign: 'right' }}>Amount</th></tr></thead>
              <tbody>
                {data.expenses.map((item, idx) => (<tr key={idx}><td data-label="Account" style={{ padding: '8px' }}>{item.account_name}</td><td data-label="Amount" style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(item.amount)}</td></tr>))}
                <tr style={{ fontWeight: 'bold', borderTop: '2px solid #ddd' }}><td data-label="Account" style={{ padding: '8px' }}>Total Expenses</td><td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(data.total_expenses)}</td></tr>
              </tbody>
            </table>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px', textAlign: 'center' }}>
          <strong>Net Profit / (Loss):</strong> <span style={{ fontSize: '24px', fontWeight: 'bold', color: data.net_profit >= 0 ? 'green' : 'red' }}>{formatCurrency(data.net_profit)}</span>
        </div>
      </div>
    </div>
  );
};

export default IncomeStatement;