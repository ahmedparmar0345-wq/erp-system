import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const VoucherPrint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companyInfo, setCompanyInfo] = useState({
    name: 'ERP System',
    address: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    fetchVoucher();
    fetchCompanyInfo();
  }, [id]);

  const fetchVoucher = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/accounting/vouchers/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setVoucher(data);
    } catch (err) {
      console.error('Error fetching voucher:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data) {
        setCompanyInfo({
          name: data.general?.company_name || 'ERP System',
          address: data.general?.company_address || '',
          phone: data.general?.company_phone || '',
          email: data.general?.company_email || ''
        });
      }
    } catch (err) {
      console.error('Error fetching company info:', err);
    }
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0.00';
    return `$${parseFloat(value).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatNumberToWords = (amount) => {
    const num = parseFloat(amount) || 0;
    return `${num.toFixed(2)} Only`;
  };

  const handlePrint = () => {
    const printContent = document.getElementById('voucher-print-area');
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow pop-ups to print');
      return;
    }

    const styles = `
            <style>
                @page {
                    size: A4;
                    margin: 2cm;
                }
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Segoe UI', Arial, sans-serif;
                    font-size: 12px;
                    line-height: 1.4;
                    color: #1f2937;
                }
                .voucher-container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                }
                .voucher-header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #e5e7eb;
                }
                .company-name {
                    font-size: 22px;
                    font-weight: bold;
                    margin-bottom: 5px;
                    color: #1a1a2e;
                }
                .company-details {
                    font-size: 11px;
                    color: #6b7280;
                    margin-bottom: 3px;
                }
                .voucher-title {
                    font-size: 18px;
                    font-weight: bold;
                    margin: 15px 0 5px;
                    color: #4f46e5;
                }
                .voucher-number {
                    font-size: 12px;
                    color: #6b7280;
                    margin-bottom: 10px;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #e5e7eb;
                }
                .info-label {
                    font-weight: 600;
                    color: #4b5563;
                }
                .description-box {
                    background: #f9fafb;
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                th, td {
                    border: 1px solid #e5e7eb;
                    padding: 10px;
                    text-align: left;
                }
                th {
                    background: #f9fafb;
                    font-weight: 600;
                    font-size: 11px;
                    color: #6b7280;
                }
                .text-right {
                    text-align: right;
                }
                .text-center {
                    text-align: center;
                }
                .amount-debit {
                    color: #dc2626;
                    font-weight: 600;
                }
                .amount-credit {
                    color: #10b981;
                    font-weight: 600;
                }
                .totals-row {
                    background: #f9fafb;
                    font-weight: bold;
                }
                .signatures {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 40px;
                    padding-top: 20px;
                }
                .signature-line {
                    text-align: center;
                    flex: 1;
                }
                .signature-line div {
                    width: 160px;
                    margin: 0 auto;
                    border-top: 1px solid #9ca3af;
                    padding-top: 8px;
                    font-size: 10px;
                    color: #6b7280;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 15px;
                    border-top: 1px solid #e5e7eb;
                    font-size: 9px;
                    color: #9ca3af;
                }
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            </style>
        `;

    const getVoucherIcon = (type) => {
      const icons = { Payment: '💸', Receipt: '📥', Journal: '📓', Contra: '🔄' };
      return icons[type] || '📄';
    };

    const getVoucherTypeColor = (type) => {
      const colors = { Payment: '#ef4444', Receipt: '#10b981', Journal: '#3b82f6', Contra: '#8b5cf6' };
      return colors[type] || '#6366f1';
    };

    const voucherIcon = getVoucherIcon(voucher.voucher_type);
    const voucherColor = getVoucherTypeColor(voucher.voucher_type);
    const totalDebit = voucher.lines?.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0) || 0;
    const totalCredit = voucher.lines?.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0) || 0;

    const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${voucher.voucher_type} Voucher - ${voucher.voucher_no}</title>
                ${styles}
            </head>
            <body>
                <div class="voucher-container">
                    <div class="voucher-header">
                        <div class="company-name">${companyInfo.name}</div>
                        ${companyInfo.address ? `<div class="company-details">${companyInfo.address}</div>` : ''}
                        ${companyInfo.phone ? `<div class="company-details">📞 ${companyInfo.phone}</div>` : ''}
                        ${companyInfo.email ? `<div class="company-details">✉️ ${companyInfo.email}</div>` : ''}
                        <div class="voucher-title">
                            <span style="font-size: 24px; margin-right: 8px;">${voucherIcon}</span>
                            ${voucher.voucher_type} VOUCHER
                        </div>
                        <div class="voucher-number">${voucher.voucher_no}</div>
                    </div>

                    <div class="info-row">
                        <div><span class="info-label">Date:</span> ${formatDate(voucher.entry_date)}</div>
                        <div><span class="info-label">Status:</span> <span style="color: ${voucher.status === 'approved' ? '#10b981' : '#f59e0b'}">${voucher.status?.toUpperCase()}</span></div>
                    </div>

                    ${voucher.description ? `
                        <div class="description-box">
                            <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Description</div>
                            <div>${voucher.description}</div>
                        </div>
                    ` : ''}

                    <table className="table-modern">
                        <thead>
                            <tr>
                                <th>Account</th>
                                <th class="text-right">Debit ($)</th>
                                <th class="text-right">Credit ($)</th>
                                <th>Narration</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${voucher.lines?.map(line => `
                                <tr>
                                    <td>${line.account_code} - ${line.account_name}</td>
                                    <td class="text-right ${line.debit > 0 ? 'amount-debit' : ''}">${line.debit > 0 ? formatCurrency(line.debit) : '-'}</td>
                                    <td class="text-right ${line.credit > 0 ? 'amount-credit' : ''}">${line.credit > 0 ? formatCurrency(line.credit) : '-'}</td>
                                    <td>${line.narration || '-'}</td>
                                </tr>
                            `).join('')}
                            <tr class="totals-row">
                                <td class="text-right"><strong>Total</strong></td>
                                <td class="text-right amount-debit"><strong>${formatCurrency(totalDebit)}</strong></td>
                                <td class="text-right amount-credit"><strong>${formatCurrency(totalCredit)}</strong></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="signatures">
                        <div class="signature-line"><div>Prepared By</div></div>
                        <div class="signature-line"><div>Approved By</div></div>
                        <div class="signature-line"><div>Receiver</div></div>
                    </div>

                    <div class="footer">
                        This is a computer-generated voucher. No signature required if digitally approved.<br>
                        Generated on: ${new Date().toLocaleString()}
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 1000);
                    };
                <\/script>
            </body>
            </html>
        `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>📄</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Loading voucher details...</div>
        </div>
      </div>
    );
  }

  if (!voucher) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
        <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>Voucher not found</div>
        <button onClick={() => navigate('/vouchers')} style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Back to Vouchers</button>
      </div>
    );
  }

  const getVoucherIcon = (type) => {
    const icons = { Payment: '💸', Receipt: '📥', Journal: '📓', Contra: '🔄' };
    return icons[type] || '📄';
  };

  const getVoucherTypeColor = (type) => {
    const colors = { Payment: '#ef4444', Receipt: '#10b981', Journal: '#3b82f6', Contra: '#8b5cf6' };
    return colors[type] || '#6366f1';
  };

  const voucherIcon = getVoucherIcon(voucher.voucher_type);
  const voucherColor = getVoucherTypeColor(voucher.voucher_type);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="vp-container"
      style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}
    >
      <style>{`
        @media (max-width: 768px) {
          .vp-container { padding: 20px 12px !important; }
          .vp-actions { flex-direction: column !important; gap: 12px !important; }
          .vp-actions button { width: 100%; justify-content: center; }
          .vp-header { padding: 24px 16px !important; }
          .vp-header-icon { font-size: 36px !important; }
          .vp-content { padding: 20px !important; }
          .vp-signatures { flex-direction: column !important; gap: 24px !important; }
          .vp-signatures > div { width: 100% !important; }
          .vp-signatures > div > div { width: 100% !important; max-width: 200px; }
          .vp-meta { flex-direction: column !important; gap: 12px !important; }
        }
        @media (max-width: 480px) {
          .vp-content { padding: 12px !important; }
          .vp-header { padding: 16px 12px !important; }
          .vp-header-icon { font-size: 28px !important; }
          .vp-header div:nth-child(2) { font-size: 14px !important; }
          .vp-table-wrap { overflow-x: visible !important; }
          .vp-table { min-width: 0 !important; }
          .vp-table thead { display: none !important; }
          .vp-table tbody tr { display: flex !important; flex-direction: column !important; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; margin-bottom: 12px; background: white; }
          .vp-table tbody td { display: flex !important; justify-content: space-between !important; align-items: center; padding: 6px 0 !important; border: none !important; gap: 8px; }
          .vp-table tbody td::before { content: attr(data-label); font-weight: 600; font-size: 11px; color: #6b7280; white-space: nowrap; }
          .vp-table tfoot { display: none !important; }
          .vp-desc { padding: 12px !important; font-size: 13px !important; }
          .vp-amount-words { font-size: 12px !important; }
          .vp-footer-text { font-size: 8px !important; }
        }
      `}</style>
      {/* Buttons - Hidden when printing */}
      <div className="no-print vp-actions" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/vouchers')}
          style={{
            padding: '10px 20px',
            background: '#f3f4f6',
            color: '#374151',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Back to Vouchers
        </button>
        <button
          onClick={handlePrint}
          style={{
            padding: '10px 24px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🖨️ Print Voucher
        </button>
      </div>

      {/* Voucher Content - Will be cloned for print */}
      <div id="voucher-print-area" style={{ background: 'white', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {/* Header */}
        <div className="vp-header" style={{ background: `linear-gradient(135deg, #1a1a2e, #16213e)`, padding: '32px', textAlign: 'center', color: 'white' }}>
          <div className="vp-header-icon" style={{ fontSize: '48px', marginBottom: '8px' }}>{voucherIcon}</div>
          <div style={{ fontSize: '18px', fontWeight: '500', opacity: 0.9 }}>{voucher.voucher_type} Voucher</div>
          <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>{voucher.voucher_no}</div>
        </div>

        {/* Content */}
        <div className="vp-content" style={{ padding: '32px' }}>
          <div className="vp-meta" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Date</div>
              <div style={{ fontWeight: '500' }}>{formatDate(voucher.entry_date)}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Status</div>
              <div style={{ color: voucher.status === 'approved' ? '#10b981' : '#f59e0b', fontWeight: '500' }}>
                {voucher.status?.toUpperCase()}
              </div>
            </div>
          </div>

          {voucher.description && (
            <div className="vp-desc" style={{ marginBottom: '24px', padding: '16px', background: '#f9fafb', borderRadius: '16px' }}>
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Description</div>
              <div style={{ fontSize: '14px' }}>{voucher.description}</div>
            </div>
          )}

          {/* Journal Entries Table */}
          <div className="vp-table-wrap" style={{ overflowX: 'auto' }}>
            <table className="vp-table table-modern" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Account</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Debit ($)</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Credit ($)</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Narration</th>
                </tr>
              </thead>
              <tbody>
                {voucher.lines?.map((line, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td data-label="Account" style={{ padding: '12px' }}>{line.account_code} - {line.account_name}</td>
                    <td data-label="Debit ($)" style={{ padding: '12px', textAlign: 'right', fontWeight: line.debit > 0 ? '600' : 'normal', color: line.debit > 0 ? '#dc2626' : '#374151' }}>
                      {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                    </td>
                    <td data-label="Credit ($)" style={{ padding: '12px', textAlign: 'right', fontWeight: line.credit > 0 ? '600' : 'normal', color: line.credit > 0 ? '#10b981' : '#374151' }}>
                      {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                    </td>
                    <td data-label="Narration" style={{ padding: '12px' }}>{line.narration || '-'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid #e5e7eb', fontWeight: 'bold', background: '#f9fafb' }}>
                  <td style={{ padding: '12px', textAlign: 'right' }}>Total</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#dc2626' }}>
                    {formatCurrency(voucher.lines?.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0))}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#10b981' }}>
                    {formatCurrency(voucher.lines?.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0))}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Amount in Words */}
          <div className="vp-amount-words" style={{ marginTop: '24px', padding: '12px', background: '#f0fdf4', borderRadius: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: '#6b7280' }}>Amount in Words: </span>
            <span style={{ fontWeight: '500' }}>{formatNumberToWords(voucher.total_debit)}</span>
          </div>

          {/* Signature Section */}
          <div className="vp-signatures" style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ width: '160px', margin: '0 auto', borderTop: '1px solid #9ca3af', paddingTop: '8px', fontSize: '10px', color: '#6b7280' }}>
                Prepared By
              </div>
            </div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ width: '160px', margin: '0 auto', borderTop: '1px solid #9ca3af', paddingTop: '8px', fontSize: '10px', color: '#6b7280' }}>
                Approved By
              </div>
            </div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ width: '160px', margin: '0 auto', borderTop: '1px solid #9ca3af', paddingTop: '8px', fontSize: '10px', color: '#6b7280' }}>
                Receiver
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="vp-footer-text" style={{ textAlign: 'center', marginTop: '30px', paddingTop: '15px', borderTop: '1px solid #e5e7eb', fontSize: '9px', color: '#9ca3af' }}>
            This is a computer-generated voucher. No signature required if digitally approved.
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VoucherPrint;