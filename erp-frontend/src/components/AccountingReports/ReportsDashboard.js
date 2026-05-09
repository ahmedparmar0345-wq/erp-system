import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ReportsDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_receivables: 0,
    total_payables: 0,
    cash_balance: 0,
    revenue_trend: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/accounting-reports/dashboard-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0.00';
    return `$${value.toFixed(2)}`;
  };

  // ALL REPORTS ARE NOW AVAILABLE!
  const reportCards = [
    { title: 'Balance Sheet', icon: '📊', path: '/accounting-reports/balance-sheet', color: '#3b82f6', description: 'Assets, Liabilities, Equity', available: true },
    { title: 'Income Statement', icon: '📈', path: '/accounting-reports/income-statement', color: '#10b981', description: 'Revenue, Expenses, Profit/Loss', available: true },
    { title: 'Trial Balance', icon: '⚖️', path: '/accounting-reports/trial-balance', color: '#8b5cf6', description: 'All accounts with balances', available: true },
    { title: 'Accounts Receivable', icon: '💰', path: '/accounting-reports/accounts-receivable', color: '#f59e0b', description: 'Customer outstanding balances with aging', available: true },
    { title: 'Aging Summary', icon: '📅', path: '/accounting-reports/aging-summary', color: '#f97316', description: 'AR/AP aging chart comparison', available: true },
    { title: 'Accounts Payable', icon: '📋', path: '/accounting-reports/accounts-payable', color: '#ef4444', description: 'Supplier outstanding balances', available: true },
    { title: 'Cash Flow', icon: '💵', path: '/accounting-reports/cash-flow', color: '#06b6d4', description: 'Cash inflows and outflows', available: true },
    { title: 'General Ledger', icon: '📓', path: '/accounting-reports/general-ledger', color: '#6366f1', description: 'Detailed transaction history', available: true },
    { title: 'Tax Summary', icon: '🏛️', path: '/accounting-reports/tax-summary', color: '#14b8a6', description: 'Sales tax, Purchase tax', available: true }
  ];

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <style>{`
        @media (max-width: 480px) {
          .rd-stats { grid-template-columns: 1fr !important; }
          .rd-cards { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          padding: '8px 16px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          marginBottom: '20px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px'
        }}
      >
        ← Back to Main Dashboard
      </button>

      <h1 style={{ marginBottom: '10px' }}>Accounting Reports</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Complete financial reports and analysis for your business
      </p>

      {/* Quick Stats Cards */}
      <div className="rd-stats" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Accounts Receivable</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(stats.total_receivables)}</div>
          <div style={{ fontSize: '11px', color: '#999', marginTop: '5px' }}>Customer outstanding</div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Accounts Payable</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(stats.total_payables)}</div>
          <div style={{ fontSize: '11px', color: '#999', marginTop: '5px' }}>Supplier outstanding</div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Cash Balance</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(stats.cash_balance)}</div>
          <div style={{ fontSize: '11px', color: '#999', marginTop: '5px' }}>Available cash</div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Net Working Capital</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(stats.total_receivables - stats.total_payables)}</div>
          <div style={{ fontSize: '11px', color: '#999', marginTop: '5px' }}>Receivables - Payables</div>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="rd-cards" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {reportCards.map((report, index) => (
          <div
            key={index}
            onClick={() => navigate(report.path)}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderTop: `4px solid ${report.color}`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>{report.icon}</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{report.title}</div>
            <div style={{ fontSize: '13px', color: '#666' }}>{report.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsDashboard;