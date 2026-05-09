import React, { useState, useEffect } from 'react';
import { getDashboardStats, getAgingSummary, getAccountsReceivable, getIncomeStatement } from '../../services/accountingReports';

const PieSegment = ({ label, value, total, color }) => {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, backgroundColor: color, borderRadius: 2, marginRight: 6 }}></span>{label}</span>
        <span>${value.toFixed(2)} ({pct.toFixed(1)}%)</span>
      </div>
      <div style={{ height: 20, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: 4 }}></div>
      </div>
    </div>
  );
};

const DashboardCharts = () => {
  const [stats, setStats] = useState(null);
  const [aging, setAging] = useState(null);
  const [topCustomers, setTopCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [statsRes, agingRes, arRes] = await Promise.all([
          getDashboardStats(),
          getAgingSummary(),
          getAccountsReceivable()
        ]);
        setStats(statsRes.data);
        setAging(agingRes.data);
        const customers = (arRes.data?.rows || []).sort((a, b) => b.outstanding - a.outstanding).slice(0, 5);
        setTopCustomers(customers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const toNum = (v) => parseFloat(v) || 0;

  if (loading) return <div className="container"><h1>Loading...</h1></div>;

  const revenueMonths = stats?.monthly_revenue || [];
  const expenses = stats?.expense_breakdown || [];
  const maxRevenue = Math.max(...revenueMonths.map(m => toNum(m.revenue)), 1);
  const totalExpense = expenses.reduce((s, e) => s + toNum(e.amount), 0);
  const maxCustomer = Math.max(...topCustomers.map(c => toNum(c.outstanding)), 1);
  const totalAR = toNum(aging?.accounts_receivable?.total);
  const totalAP = toNum(aging?.accounts_payable?.total);
  const maxAP = Math.max(totalAR, totalAP, 1);

  return (
    <div className="container">
      <h1>Dashboard Charts</h1>

      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="card stat-card"><h3>Receivables</h3><p className="stat-number" style={{ color: 'var(--danger)' }}>${totalAR.toFixed(2)}</p></div>
        <div className="card stat-card"><h3>Payables</h3><p className="stat-number" style={{ color: 'var(--primary)' }}>${totalAP.toFixed(2)}</p></div>
        <div className="card stat-card"><h3>Cash</h3><p className="stat-number" style={{ color: 'var(--success)' }}>${toNum(stats?.cash_balance).toFixed(2)}</p></div>
        <div className="card stat-card"><h3>Bank</h3><p className="stat-number">${toNum(stats?.bank_balance).toFixed(2)}</p></div>
      </div>

      <style>{`@media (min-width: 768px) { .acct-dashboard-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="acct-dashboard-grid">
        <div className="card">
          <h3>Revenue Trend (Last 6 Months)</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 200, padding: '1rem 0' }}>
            {revenueMonths.map((m, i) => {
              const val = toNum(m.revenue);
              const h = maxRevenue > 0 ? (val / maxRevenue) * 180 : 0;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '0.7rem', marginBottom: '0.25rem', fontWeight: 600 }}>${val.toFixed(0)}</div>
                  <div style={{ width: '100%', height: Math.max(h, 4), backgroundColor: 'var(--success)', borderRadius: '4px 4px 0 0', transition: 'height 0.3s' }}></div>
                  <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', color: 'var(--secondary)' }}>{m.month}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h3>Expense Breakdown</h3>
          {expenses.length > 0 ? expenses.slice(0, 8).map(e => (
            <PieSegment key={e.account_code} label={e.account_name} value={toNum(e.amount)} total={totalExpense} color={`hsl(${Math.random() * 360}, 60%, 50%)`} />
          )) : <p style={{ color: 'var(--secondary)' }}>No expense data</p>}
          {expenses.length > 8 && <p style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>+{expenses.length - 8} more categories</p>}
        </div>

        <div className="card">
          <h3>Receivables vs Payables</h3>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-end', marginTop: '1rem' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>Receivables</div>
              <div style={{ height: 150, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{ height: `${maxAP > 0 ? (totalAR / maxAP) * 100 : 0}%`, backgroundColor: '#ef4444', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>${totalAR.toFixed(0)}</div>
              </div>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>Payables</div>
              <div style={{ height: 150, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{ height: `${maxAP > 0 ? (totalAP / maxAP) * 100 : 0}%`, backgroundColor: '#3b82f6', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>${totalAP.toFixed(0)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Top 5 Customers by Outstanding</h3>
          {topCustomers.length > 0 ? topCustomers.map(c => {
            const pct = maxCustomer > 0 ? (toNum(c.outstanding) / maxCustomer) * 100 : 0;
            return (
              <div key={c.customer_id} style={{ marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span>{c.customer_name}</span>
                  <span style={{ fontWeight: 600 }}>${toNum(c.outstanding).toFixed(2)}</span>
                </div>
                <div style={{ height: 18, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, backgroundColor: '#f59e0b', borderRadius: 4 }}></div>
                </div>
              </div>
            );
          }) : <p style={{ color: 'var(--secondary)' }}>No customer data</p>}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
