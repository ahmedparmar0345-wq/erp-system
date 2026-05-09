import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTaxSummary } from '../../services/accountingReports';

const TaxSummary = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTaxSummary();
  }, [dateRange]);

  const fetchTaxSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getTaxSummary({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date
      });
      setData(result);
    } catch (err) {
      console.error('Error fetching tax summary:', err);
      setError(err.message || 'Failed to load tax summary');
      setData({ sales_tax_collected: 0, purchase_tax_paid: 0 });
    } finally {
      setLoading(false);
    }
  };

  const safeNumber = (value) => {
    if (value === null || value === undefined) return 0;
    const num = typeof value === 'number' ? value : parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const formatCurrency = (value) => {
    const num = safeNumber(value);
    return `$${num.toFixed(2)}`;
  };

  const handlePrint = () => {
    const companyName = localStorage.getItem('company_name') || 'ERP System';
    const companyAddress = localStorage.getItem('company_address') || '';
    const companyPhone = localStorage.getItem('company_phone') || '';

    const salesTax = safeNumber(data?.sales_tax_collected);
    const purchaseTax = safeNumber(data?.purchase_tax_paid);
    const netTaxPayable = salesTax - purchaseTax;

    const startDate = new Date(dateRange.start_date).toLocaleDateString();
    const endDate = new Date(dateRange.end_date).toLocaleDateString();
    const generatedDate = new Date().toLocaleString();

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow pop-ups to print');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tax Summary Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; font-size: 14px; }
          .report-container { max-width: 800px; margin: 0 auto; background: white; }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #333; }
          .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .company-details { font-size: 12px; color: #555; margin-bottom: 10px; }
          .report-title { font-size: 18px; font-weight: bold; margin-top: 15px; margin-bottom: 5px; }
          .report-period { font-size: 12px; color: #666; margin-bottom: 5px; }
          .generated-date { font-size: 10px; color: #888; margin-top: 5px; }
          .summary-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .summary-table th, .summary-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .summary-table th { background-color: #f5f5f5; font-weight: bold; }
          .text-right { text-align: right; }
          .net-row { background-color: #e8f5e9; font-weight: bold; }
          .net-payable { color: #dc2626; }
          .net-refund { color: #10b981; }
          .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; text-align: center; font-size: 10px; color: #888; }
          .info-note { margin-top: 20px; padding: 10px; background-color: #f9fafb; border-radius: 4px; font-size: 11px; color: #666; }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="header">
            <div class="company-name">${escapeHtml(companyName)}</div>
            ${companyAddress ? `<div class="company-details">${escapeHtml(companyAddress)}</div>` : ''}
            ${companyPhone ? `<div class="company-details">Phone: ${escapeHtml(companyPhone)}</div>` : ''}
            <div class="report-title">TAX SUMMARY REPORT</div>
            <div class="report-period">Period: ${startDate} to ${endDate}</div>
            <div class="generated-date">Generated on: ${generatedDate}</div>
          </div>

          <table className="table-modern">
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Sales Tax Collected (10%)</strong><br/><span style="font-size: 11px; color: #666;">Tax collected from customer sales</span></td>
                <td class="text-right">${formatCurrency(salesTax)}</td>
              </tr>
              <tr style="background-color: #f9fafb;">
                <td><strong>Purchase Tax Paid (10%)</strong><br/><span style="font-size: 11px; color: #666;">Tax paid to suppliers on purchases</span></td>
                <td class="text-right">${formatCurrency(purchaseTax)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="net-row">
                <td><strong>NET TAX PAYABLE / (REFUNDABLE)</strong></td>
                <td class="text-right ${netTaxPayable >= 0 ? 'net-payable' : 'net-refund'}" style="font-size: 18px;">
                  ${formatCurrency(Math.abs(netTaxPayable))}
                  ${netTaxPayable >= 0 ? '(Payable)' : '(Refundable)'}
                </td>
              </tr>
            </tfoot>
          </table>

          <div class="info-note">
            <strong>Note:</strong> Tax is calculated at 10% on sales and purchase transactions.<br/>
            This report includes all confirmed sales and received purchase orders within the selected period.
          </div>

          <div class="footer">
            This is a computer-generated tax summary report.<br/>
            For detailed tax calculations, please refer to individual invoices.
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        <\/script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  const escapeHtml = (text) => {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Loading Tax Summary...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</div>
        <button onClick={fetchTaxSummary} style={{ padding: '8px 16px', cursor: 'pointer' }}>Retry</button>
      </div>
    );
  }

  const salesTax = safeNumber(data?.sales_tax_collected);
  const purchaseTax = safeNumber(data?.purchase_tax_paid);
  const netTaxPayable = salesTax - purchaseTax;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <button
          onClick={() => navigate('/accounting-reports')}
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
            value={dateRange.start_date}
            onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.end_date}
            onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <button
            onClick={handlePrint}
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

      {/* Screen View */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Tax Summary</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
          Period: {new Date(dateRange.start_date).toLocaleDateString()} - {new Date(dateRange.end_date).toLocaleDateString()}
        </p>

        <style>{`
          @media (max-width: 480px) {
            .ts-wrap { overflow: visible; }
            .ts-wrap table, .ts-wrap thead, .ts-wrap tbody,
            .ts-wrap tr, .ts-wrap td, .ts-wrap th { display: block; }
            .ts-wrap thead tr { display: none; }
            .ts-wrap td {
              display: flex; justify-content: space-between; align-items: center;
              padding: 10px 12px !important;
              border-bottom: 1px solid #e5e7eb;
            }
            .ts-wrap td::before {
              content: attr(data-label);
              font-weight: 600; font-size: 11px; color: #6b7280;
              margin-right: 12px; flex-shrink: 0;
            }
            .ts-wrap td:last-child { border-bottom: 2px solid #d1d5db; }
            .ts-wrap tr { margin-bottom: 10px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
          }
        `}</style>
        <div className="ts-wrap" style={{ overflowX: 'auto', width: '100%' }}>
        <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={{ padding: '12px', textAlign: 'left' }}>Description</th><th style={{ padding: '12px', textAlign: 'right' }}>Amount</th></tr></thead>
          <tbody>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <td data-label="Description" style={{ padding: '12px', fontWeight: 'bold', borderBottom: '2px solid #ddd' }}>
                Sales Tax Collected (10%)
              </td>
              <td data-label="Amount" style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>
                {formatCurrency(salesTax)}
              </td>
            </tr>
            <tr>
              <td data-label="Description" style={{ padding: '12px', fontWeight: 'bold' }}>
                Purchase Tax Paid (10%)
              </td>
              <td data-label="Amount" style={{ padding: '12px', textAlign: 'right' }}>
                {formatCurrency(purchaseTax)}
              </td>
            </tr>
            <tr style={{ borderTop: '2px solid #ddd', backgroundColor: '#f0fdf4' }}>
              <td data-label="Description" style={{ padding: '12px', fontWeight: 'bold', fontSize: '16px' }}>
                Net Tax Payable / (Refundable)
              </td>
              <td data-label="Amount" style={{ padding: '12px', textAlign: 'right', fontSize: '18px', fontWeight: 'bold', color: netTaxPayable >= 0 ? '#dc2626' : '#10b981' }}>
                {formatCurrency(Math.abs(netTaxPayable))}
                {netTaxPayable >= 0 ? ' (Payable)' : ' (Refundable)'}
              </td>
            </tr>
          </tbody>
        </table>
        </div>

        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '4px', fontSize: '12px', color: '#666' }}>
          <p><strong>Note:</strong> Tax is calculated at 10% on sales and purchases.</p>
        </div>
      </div>
    </div>
  );
};

export default TaxSummary;