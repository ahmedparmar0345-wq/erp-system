import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChartOfAccounts } from '../../services/accounting';
import { getGeneralLedger } from '../../services/accountingReports';

const GeneralLedger = () => {
  const [data, setData] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    account_id: '',
    start_date: '',
    end_date: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await getChartOfAccounts();
        // Handle both array response and response with data property
        setAccounts(Array.isArray(res) ? res : (res.data || []));
      } catch (err) {
        console.error('Error fetching accounts:', err);
        setAccounts([]);
      }
    };
    fetchAccounts();
  }, []);

  const generateReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.account_id) params.account_id = filters.account_id;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      const res = await getGeneralLedger(params);
      // Handle both array response and response with data property
      setData(Array.isArray(res) ? res : (res.data || []));
    } catch (err) {
      console.error('Error fetching general ledger:', err);
      alert('Failed to load general ledger: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const toNum = (v) => parseFloat(v) || 0;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const exportCSV = () => {
    if (data.length === 0) return;
    const headers = ['Date', 'Voucher No', 'Type', 'Account Code', 'Account Name', 'Narration', 'Debit', 'Credit', 'Running Balance'];
    const rows = data.map(r => [
      r.entry_date, r.voucher_no, r.voucher_type, r.account_code, r.account_name,
      r.narration || '', toNum(r.debit).toFixed(2), toNum(r.credit).toFixed(2),
      toNum(r.running_balance).toFixed(2)
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'general-ledger.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('general-ledger-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>General Ledger</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
          <script>window.print();<\/script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  // Styles
  const styles = {
    container: { padding: '20px', maxWidth: '1400px', margin: '0 auto' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' },
    card: { backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' },
    formGroup: { marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '5px' },
    label: { fontSize: '12px', fontWeight: 'bold', color: '#666' },
    select: { padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minWidth: '200px' },
    input: { padding: '8px', border: '1px solid #ddd', borderRadius: '4px' },
    button: { padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
    buttonPrimary: { backgroundColor: '#3b82f6', color: 'white' },
    buttonSecondary: { backgroundColor: '#6c757d', color: 'white' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', backgroundColor: '#f3f4f6' },
    td: { padding: '10px', borderBottom: '1px solid #eee' },
    badge: { padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },
    badgePayment: { backgroundColor: '#d1fae5', color: '#065f46' },
    badgeReceipt: { backgroundColor: '#dbeafe', color: '#1e40af' },
    badgeJournal: { backgroundColor: '#fed7aa', color: '#92400e' },
    badgeContra: { backgroundColor: '#f3e8ff', color: '#6b21a5' },
    emptyState: { textAlign: 'center', padding: '40px', color: '#999' }
  };

  const getBadgeClass = (type) => {
    const lowerType = type?.toLowerCase();
    if (lowerType === 'payment') return styles.badgePayment;
    if (lowerType === 'receipt') return styles.badgeReceipt;
    if (lowerType === 'journal') return styles.badgeJournal;
    if (lowerType === 'contra') return styles.badgeContra;
    return styles.badge;
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <button
          onClick={() => navigate('/accounting-reports')}
          style={{ ...styles.button, ...styles.buttonSecondary }}
        >
          ← Back to Reports
        </button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={exportCSV}
            disabled={data.length === 0}
            style={{ ...styles.button, ...styles.buttonSecondary }}
          >
            📄 Export CSV
          </button>
          <button
            onClick={handlePrint}
            disabled={data.length === 0}
            style={{ ...styles.button, ...styles.buttonPrimary }}
          >
            🖨️ Print
          </button>
        </div>
      </div>

      <h1>General Ledger</h1>

      {/* Filters Card */}
      <div style={styles.card}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Account</label>
            <select
              value={filters.account_id}
              onChange={e => setFilters({ ...filters, account_id: e.target.value })}
              style={styles.select}
            >
              <option value="">All Accounts</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.account_code} - {a.account_name}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>From Date</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={e => setFilters({ ...filters, start_date: e.target.value })}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>To Date</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={e => setFilters({ ...filters, end_date: e.target.value })}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>&nbsp;</label>
            <button
              onClick={generateReport}
              disabled={loading}
              style={{ ...styles.button, ...styles.buttonPrimary }}
            >
              {loading ? 'Loading...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading...</p>
      ) : data.length > 0 ? (
        <><style>{`
          @media (max-width: 480px) {
            .gl-wrap { overflow: visible; }
            .gl-wrap table, .gl-wrap thead, .gl-wrap tbody,
            .gl-wrap tr, .gl-wrap td, .gl-wrap th { display: block; }
            .gl-wrap thead tr { display: none; }
            .gl-wrap td {
              display: flex; justify-content: space-between; align-items: center;
              padding: 8px 10px !important;
              border-bottom: 1px solid #e5e7eb;
            }
            .gl-wrap td::before {
              content: attr(data-label);
              font-weight: 600; font-size: 11px; color: #6b7280;
              margin-right: 12px; flex-shrink: 0;
            }
            .gl-wrap td:last-child { border-bottom: 2px solid #d1d5db; }
            .gl-wrap tr { margin-bottom: 10px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
          }
        `}</style>
        <div id="general-ledger-content" className="gl-wrap" style={{ ...styles.card, overflowX: 'auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>General Ledger</h2>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
            {filters.start_date && filters.end_date
              ? `Period: ${formatDate(filters.start_date)} - ${formatDate(filters.end_date)}`
              : 'All transactions'}
          </p>
          <table className="table-modern" style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Voucher #</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Account</th>
                <th style={styles.th}>Narration</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Debit</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Credit</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r, i) => (
                <tr key={i}>
                  <td data-label="Date" style={styles.td}>{formatDate(r.entry_date)}</td>
                  <td data-label="Voucher #" style={styles.td}>{r.voucher_no || '-'}</td>
                  <td data-label="Type" style={styles.td}>
                    <span style={{ ...styles.badge, ...getBadgeClass(r.voucher_type) }}>
                      {r.voucher_type || '-'}
                    </span>
                  </td>
                  <td data-label="Account" style={styles.td}>{r.account_code} - {r.account_name}</td>
                  <td data-label="Narration" style={{ ...styles.td, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.narration || '-'}
                  </td>
                  <td data-label="Debit" style={{ ...styles.td, textAlign: 'right' }}>
                    {toNum(r.debit) > 0 ? `$${toNum(r.debit).toFixed(2)}` : '-'}
                  </td>
                  <td data-label="Credit" style={{ ...styles.td, textAlign: 'right' }}>
                    {toNum(r.credit) > 0 ? `$${toNum(r.credit).toFixed(2)}` : '-'}
                  </td>
                  <td data-label="Balance" style={{ ...styles.td, textAlign: 'right', fontWeight: 'bold' }}>
                    ${toNum(r.running_balance).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></>
      ) : (
        <div style={styles.card}>
          <p style={styles.emptyState}>
            Select filters and click "Generate Report" to view the General Ledger.
          </p>
        </div>
      )}
    </div>
  );
};

export default GeneralLedger;