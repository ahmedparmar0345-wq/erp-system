import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { printReport } from '../../utils/printUtils';
import { getAccountsReceivable } from '../../services/accountingReports';

const AccountsReceivable = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccountsReceivable();
  }, []);

  const fetchAccountsReceivable = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAccountsReceivable();
      // Ensure data is an array
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching accounts receivable:', err);
      setError(err.message || 'Failed to load data');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Safe number formatting function
  const safeNumber = (value) => {
    if (value === null || value === undefined) return 0;
    const num = typeof value === 'number' ? value : parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const formatCurrency = (value) => {
    const num = safeNumber(value);
    return `$${num.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const handlePrint = () => {
    printReport('accounts-receivable-content', 'Accounts Receivable');
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Loading Accounts Receivable...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</div>
        <button onClick={fetchAccountsReceivable} style={{ padding: '8px 16px', cursor: 'pointer' }}>Retry</button>
      </div>
    );
  }

  const totalOutstanding = customers.reduce((sum, c) => sum + safeNumber(c.total_due), 0);

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header with Back Button */}
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

      {/* Report Content for Printing */}
      <div id="accounts-receivable-content">
        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Accounts Receivable</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
          As of {new Date().toLocaleDateString()}
        </p>

        <style>{`
          @media (max-width: 480px) {
            .ar-wrap { overflow: visible; }
            .ar-wrap table, .ar-wrap thead, .ar-wrap tbody,
            .ar-wrap tr, .ar-wrap td, .ar-wrap th { display: block; }
            .ar-wrap thead tr { display: none; }
            .ar-wrap td {
              display: flex; justify-content: space-between; align-items: center;
              padding: 8px 10px !important;
              border-bottom: 1px solid #e5e7eb;
            }
            .ar-wrap td::before {
              content: attr(data-label);
              font-weight: 600; font-size: 11px; color: #6b7280;
              margin-right: 12px; flex-shrink: 0;
            }
            .ar-wrap td:last-child { border-bottom: 2px solid #d1d5db; }
            .ar-wrap tr { margin-bottom: 10px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
          }
        `}</style>
        {customers.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            No outstanding receivables found.
          </p>
        ) : (
          <>
            <div className="ar-wrap" style={{ overflowX: 'auto', width: '100%' }}>
            <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Customer</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Total Due</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Invoice Count</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Last Invoice Date</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Current (1-30)</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>31-60 Days</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>61-90 Days</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>90+ Days</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, idx) => (
                  <tr key={customer.id || idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td data-label="Customer" style={{ padding: '12px', fontWeight: '500' }}>{customer.name || 'Unknown'}</td>
                    <td data-label="Total Due" style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                      {formatCurrency(customer.total_due)}
                    </td>
                    <td data-label="Invoices" style={{ padding: '12px', textAlign: 'center' }}>{customer.invoice_count || 0}</td>
                    <td data-label="Last Invoice" style={{ padding: '12px', textAlign: 'center' }}>{formatDate(customer.last_invoice_date)}</td>
                    <td data-label="1-30 Days" style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(customer.aging?.current_30)}</td>
                    <td data-label="31-60 Days" style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(customer.aging?.days_31_60)}</td>
                    <td data-label="61-90 Days" style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(customer.aging?.days_61_90)}</td>
                    <td data-label="90+ Days" style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(customer.aging?.days_90_plus)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#f9fafb', fontWeight: 'bold', borderTop: '2px solid #e5e7eb' }}>
                  <td data-label="Total" style={{ padding: '12px' }}>Total</td>
                  <td data-label="Total Due" style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(totalOutstanding)}</td>
                  <td colSpan="6"></td>
                </tr>
              </tfoot>
            </table>
            </div>

            {/* Aging Summary */}
            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Aging Summary</h4>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div><strong>Current (1-30 days):</strong> {formatCurrency(customers.reduce((sum, c) => sum + safeNumber(c.aging?.current_30), 0))}</div>
                <div><strong>31-60 days:</strong> {formatCurrency(customers.reduce((sum, c) => sum + safeNumber(c.aging?.days_31_60), 0))}</div>
                <div><strong>61-90 days:</strong> {formatCurrency(customers.reduce((sum, c) => sum + safeNumber(c.aging?.days_61_90), 0))}</div>
                <div><strong>90+ days:</strong> {formatCurrency(customers.reduce((sum, c) => sum + safeNumber(c.aging?.days_90_plus), 0))}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AccountsReceivable;