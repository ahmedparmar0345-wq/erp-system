import React, { useState, useEffect } from 'react';
import { getChartOfAccounts } from '../../services/accounting';
import { getAccountStatement } from '../../services/accountingReports';

const AccountStatement = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const defaultStart = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
  const defaultEnd = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await getChartOfAccounts();
        setAccounts(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) fetchStatement();
  }, [selectedAccount, startDate, endDate]);

  const fetchStatement = async () => {
    if (!selectedAccount) return;
    setLoading(true);
    try {
      const res = await getAccountStatement(selectedAccount, { start_date: startDate, end_date: endDate });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toNum = (v) => parseFloat(v) || 0;

  const exportCSV = () => {
    if (!data?.rows) return;
    const headers = ['Date', 'Voucher No', 'Type', 'Description', 'Debit', 'Credit', 'Running Balance'];
    const rows = data.rows.map(r => [
      r.entry_date, r.voucher_no || '', r.voucher_type || '', r.description || '',
      toNum(r.debit).toFixed(2), toNum(r.credit).toFixed(2), r.running_balance?.toFixed(2) || '0.00'
    ]);
    rows.unshift(['Opening Balance', '', '', '', '', '', toNum(data.opening_balance).toFixed(2)]);
    rows.push(['Closing Balance', '', '', '', '', '', data.closing_balance?.toFixed(2) || '0.00']);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `account-statement-${selectedAccount}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <div className="header-row">
        <h1>Account Statement</h1>
        <div>
          <button className="btn btn-primary btn-sm" onClick={exportCSV} disabled={!data?.rows?.length}>Export CSV</button>
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>Print</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 250 }}>
            <label>Account</label>
            <select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}>
              <option value="">-- Select Account --</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.account_code} - {a.account_name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}><label>From</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
          <div className="form-group" style={{ marginBottom: 0 }}><label>To</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
        </div>
      </div>

      {loading && <p>Loading...</p>}

      {data && (
        <>
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="card stat-card">
              <h3>Account</h3>
              <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>{data.account?.account_code} - {data.account?.account_name}</p>
              <span className={`badge badge-${data.account?.account_type}`}>{data.account?.account_type}</span>
            </div>
            <div className="card stat-card">
              <h3>Opening Balance</h3>
              <p className="stat-number">${toNum(data.opening_balance).toFixed(2)}</p>
            </div>
            <div className="card stat-card">
              <h3>Closing Balance</h3>
              <p className="stat-number" style={{ color: toNum(data.closing_balance) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                ${toNum(data.closing_balance).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="card" style={{overflowX: 'auto', width: '100%'}}>
            <table className="table table-modern" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Date</th><th>Voucher #</th><th>Type</th><th>Description</th>
                  <th style={{ textAlign: 'right' }}>Debit</th><th style={{ textAlign: 'right' }}>Credit</th><th style={{ textAlign: 'right' }}>Running Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>
                  <td colSpan={4}>Opening Balance</td>
                  <td></td><td></td>
                  <td style={{ textAlign: 'right' }}>${toNum(data.opening_balance).toFixed(2)}</td>
                </tr>
                {data.rows?.map((r, i) => (
                  <tr key={i}>
                    <td>{r.entry_date}</td>
                    <td>{r.voucher_no || ''}</td>
                    <td>{r.voucher_type ? <span className={`badge badge-${r.voucher_type.toLowerCase()}`}>{r.voucher_type}</span> : ''}</td>
                    <td>{r.description || r.narration || ''}</td>
                    <td style={{ textAlign: 'right' }}>{toNum(r.debit) > 0 ? `$${toNum(r.debit).toFixed(2)}` : ''}</td>
                    <td style={{ textAlign: 'right' }}>{toNum(r.credit) > 0 ? `$${toNum(r.credit).toFixed(2)}` : ''}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>${toNum(r.running_balance).toFixed(2)}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>
                  <td colSpan={4}>Closing Balance</td>
                  <td></td><td></td>
                  <td style={{ textAlign: 'right' }}>${toNum(data.closing_balance).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loading && !data && <p className="empty-state">Select an account to view statement</p>}
    </div>
  );
};

export default AccountStatement;
