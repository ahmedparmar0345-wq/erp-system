import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { printReport } from '../../utils/printUtils';

const BalanceSheet = () => {
  const [data, setData] = useState({ assets: [], liabilities: [], equity: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBalanceSheet();
  }, [asOfDate]);

  const fetchBalanceSheet = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/accounting-reports/balance-sheet?as_of=${asOfDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      setData({
        assets: Array.isArray(result.assets) ? result.assets : [],
        liabilities: Array.isArray(result.liabilities) ? result.liabilities : [],
        equity: Array.isArray(result.equity) ? result.equity : []
      });
    } catch (err) {
      console.error('Error fetching balance sheet:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    printReport('balance-sheet-content', 'Balance Sheet');
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0.00';
    const num = typeof value === 'number' ? value : parseFloat(value);
    return `$${num.toFixed(2)}`;
  };

  const calculateTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + (item.balance || 0), 0);
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Loading Balance Sheet...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</div>
        <button onClick={fetchBalanceSheet} style={{ padding: '8px 16px', cursor: 'pointer' }}>Retry</button>
      </div>
    );
  }

  const totalAssets = calculateTotal(data.assets);
  const totalLiabilities = calculateTotal(data.liabilities);
  const totalEquity = calculateTotal(data.equity);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header with Back Button (goes to Reports Dashboard) and Print Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <button
          onClick={() => navigate('/accounting-reports')}
          className="no-print"
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          ← Back to Reports
        </button>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            style={{
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          <button
            onClick={handlePrint}
            className="no-print"
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {/* Report Content for Printing */}
      <div id="balance-sheet-content">
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Balance Sheet</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
          As of {new Date(asOfDate).toLocaleDateString()}
        </p>

        <style>{`
          @media (max-width: 768px) { .report-grid { grid-template-columns: 1fr !important; } }
          @media (max-width: 480px) {
            .bs-table-wrap { overflow: visible; }
            .bs-table-wrap table, .bs-table-wrap thead, .bs-table-wrap tbody,
            .bs-table-wrap tr, .bs-table-wrap td, .bs-table-wrap th { display: block; }
            .bs-table-wrap thead tr { display: none; }
            .bs-table-wrap td {
              display: flex; justify-content: space-between; align-items: center;
              padding: 6px 10px !important;
              border-bottom: 1px solid #e5e7eb;
            }
            .bs-table-wrap td::before {
              content: attr(data-label);
              font-weight: 600; font-size: 11px; color: #6b7280;
              margin-right: 12px; flex-shrink: 0;
            }
            .bs-table-wrap td:last-child { border-bottom: 2px solid #d1d5db; }
            .bs-table-wrap tr { margin-bottom: 10px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
            .bs-balance-box { flex-direction: column !important; gap: 6px !important; }
          }
        `}</style>
        <div className="report-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* Assets */}
          <div>
            <h3 style={{ borderBottom: '2px solid #333', paddingBottom: '8px' }}>Assets</h3>
            <div className="bs-table-wrap" style={{ overflowX: 'auto', width: '100%' }}>
            <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Account</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.assets.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td data-label="Account" style={{ padding: '8px' }}>{item.account_name}</td>
                    <td data-label="Amount" style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(item.balance)}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 'bold', borderTop: '2px solid #ddd' }}>
                  <td data-label="Account" style={{ padding: '8px' }}>Total Assets</td>
                  <td data-label="Amount" style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(totalAssets)}</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>

          {/* Liabilities + Equity */}
          <div>
            <h3 style={{ borderBottom: '2px solid #333', paddingBottom: '8px' }}>Liabilities</h3>
            <div className="bs-table-wrap" style={{ overflowX: 'auto', width: '100%' }}>
            <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Account</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.liabilities.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td data-label="Account" style={{ padding: '8px' }}>{item.account_name}</td>
                    <td data-label="Amount" style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(item.balance)}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 'bold', borderTop: '2px solid #ddd' }}>
                  <td data-label="Account" style={{ padding: '8px' }}>Total Liabilities</td>
                  <td data-label="Amount" style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(totalLiabilities)}</td>
                </tr>
              </tbody>
            </table>
            </div>

            <h3 style={{ borderBottom: '2px solid #333', paddingBottom: '8px' }}>Equity</h3>
            <div className="bs-table-wrap" style={{ overflowX: 'auto', width: '100%' }}>
            <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Account</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.equity.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td data-label="Account" style={{ padding: '8px' }}>{item.account_name}</td>
                    <td data-label="Amount" style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(item.balance)}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 'bold', borderTop: '2px solid #ddd' }}>
                  <td data-label="Account" style={{ padding: '8px' }}>Total Equity</td>
                  <td data-label="Amount" style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(totalEquity)}</td>
                </tr>
              </tbody>
            </table>
            </div>

            {/* Check if Balance Sheet balances */}
            <div className="bs-balance-box" style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>Total Liabilities + Equity</span>
                <span>{formatCurrency(totalLiabilities + totalEquity)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', color: totalAssets === (totalLiabilities + totalEquity) ? 'green' : 'red' }}>
                <span>Difference (Assets - Liabilities - Equity)</span>
                <span>{formatCurrency(totalAssets - totalLiabilities - totalEquity)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;