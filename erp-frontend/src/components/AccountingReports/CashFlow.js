import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { printReport } from '../../utils/printUtils';

const CashFlow = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const navigate = useNavigate();

  useEffect(() => { fetchCashFlow(); }, [dateRange]);

  const fetchCashFlow = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/accounting-reports/cash-flow?start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      setData(result);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handlePrint = () => printReport('cash-flow-content', 'Cash Flow Statement');
  const formatCurrency = (value) => `$${(value || 0).toFixed(2)}`;

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Cash Flow Statement...</div>;
  if (!data) return <div style={{ padding: '40px', textAlign: 'center' }}>No data available</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <button onClick={() => navigate('/accounting-reports')} style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>← Back to Reports</button>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input type="date" value={dateRange.start_date} onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
          <span>to</span>
          <input type="date" value={dateRange.end_date} onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
          <button onClick={handlePrint} style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🖨️ Print</button>
        </div>
      </div>
      <style>{`
        @media (max-width: 480px) {
          .cf-wrap { overflow: visible; }
          .cf-wrap table, .cf-wrap thead, .cf-wrap tbody,
          .cf-wrap tr, .cf-wrap td, .cf-wrap th { display: block; }
          .cf-wrap thead tr { display: none; }
          .cf-wrap td {
            display: flex; justify-content: space-between; align-items: center;
            padding: 8px 10px !important;
            border-bottom: 1px solid #e5e7eb;
          }
          .cf-wrap td::before {
            content: attr(data-label);
            font-weight: 600; font-size: 11px; color: #6b7280;
            margin-right: 12px; flex-shrink: 0;
          }
          .cf-wrap td:last-child { border-bottom: 2px solid #d1d5db; }
          .cf-wrap tr { margin-bottom: 10px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
        }
      `}</style>
      <div id="cash-flow-content">
        <h2 style={{ textAlign: 'center' }}>Cash Flow Statement</h2>
        <p style={{ textAlign: 'center', color: '#666' }}>For period {new Date(dateRange.start_date).toLocaleDateString()} - {new Date(dateRange.end_date).toLocaleDateString()}</p>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: 'clamp(14px, 4vw, 18px)' }}>Operating Activities</h3>
          <div className="cf-wrap" style={{ overflowX: 'auto', width: '100%' }}>
          <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={{ padding: '8px', textAlign: 'left' }}>Item</th><th style={{ padding: '8px', textAlign: 'right' }}>Amount</th></tr></thead>
            <tbody>
            <tr><td data-label="Item" style={{ padding: '8px' }}>Cash Inflow (Sales/Income)</td><td data-label="Amount" style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(data.operating?.inflow)}</td></tr>
            <tr><td data-label="Item" style={{ padding: '8px' }}>Cash Outflow (Expenses)</td><td data-label="Amount" style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(data.operating?.outflow)}</td></tr>
            <tr style={{ fontWeight: 'bold', borderTop: '2px solid #ddd' }}><td data-label="Item" style={{ padding: '8px' }}>Net Operating Cash Flow</td><td data-label="Amount" style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(data.operating?.net)}</td></tr>
            </tbody>
          </table>
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: 'clamp(14px, 4vw, 18px)' }}>Investing Activities</h3>
          <div className="cf-wrap" style={{ overflowX: 'auto', width: '100%' }}>
          <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={{ padding: '8px', textAlign: 'left' }}>Item</th><th style={{ padding: '8px', textAlign: 'right' }}>Amount</th></tr></thead>
            <tbody>
            <tr style={{ fontWeight: 'bold' }}><td data-label="Item" style={{ padding: '8px' }}>Net Investing Cash Flow</td><td data-label="Amount" style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(data.investing?.net)}</td></tr>
            </tbody>
          </table>
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: 'clamp(14px, 4vw, 18px)' }}>Financing Activities</h3>
          <div className="cf-wrap" style={{ overflowX: 'auto', width: '100%' }}>
          <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={{ padding: '8px', textAlign: 'left' }}>Item</th><th style={{ padding: '8px', textAlign: 'right' }}>Amount</th></tr></thead>
            <tbody>
            <tr style={{ fontWeight: 'bold' }}><td data-label="Item" style={{ padding: '8px' }}>Net Financing Cash Flow</td><td data-label="Amount" style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(data.financing?.net)}</td></tr>
            </tbody>
          </table>
          </div>
        </div>

        <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px', textAlign: 'center' }}>
          <strong>Net Cash Flow:</strong> <span style={{ fontSize: '24px', fontWeight: 'bold', color: data.net_cash_flow >= 0 ? 'green' : 'red' }}>{formatCurrency(data.net_cash_flow)}</span>
        </div>
      </div>
    </div>
  );
};

export default CashFlow;