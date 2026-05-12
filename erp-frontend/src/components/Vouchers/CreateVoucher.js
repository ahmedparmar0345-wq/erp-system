import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CreateVoucher = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [voucherType, setVoucherType] = useState('Payment');
  const [formData, setFormData] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    description: '',
    lines: [
      { account_id: '', debit: 0, credit: 0, narration: '' },
      { account_id: '', debit: 0, credit: 0, narration: '' }
    ]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/accounting/chart-of-accounts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching accounts:', err);
    }
  };

  const handleAddLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { account_id: '', debit: 0, credit: 0, narration: '' }]
    });
  };

  const handleRemoveLine = (index) => {
    if (formData.lines.length <= 2) {
      alert('At least two line items are required for a balanced voucher');
      return;
    }
    const newLines = formData.lines.filter((_, i) => i !== index);
    setFormData({ ...formData, lines: newLines });
  };

  const handleLineChange = (index, field, value) => {
    const newLines = [...formData.lines];
    newLines[index][field] = value;
    setFormData({ ...formData, lines: newLines });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const totalDebit = formData.lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
    const totalCredit = formData.lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      alert(`Voucher is not balanced! Debit: ${totalDebit}, Credit: ${totalCredit}`);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const endpoint = `/api/accounting/vouchers/${voucherType.toLowerCase()}`;
      const response = await fetch(`${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(`${voucherType} voucher created successfully!`);
        navigate('/vouchers');
      } else {
        const error = await response.json();
        alert('Failed to create voucher: ' + (error.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error creating voucher:', err);
      alert('Failed to create voucher');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return `$${parseFloat(value || 0).toFixed(2)}`;
  };

  const voucherTypes = [
    { value: 'Payment', label: '💸 Payment Voucher', color: '#ef4444', desc: 'For payments to suppliers, expenses' },
    { value: 'Receipt', label: '📥 Receipt Voucher', color: '#10b981', desc: 'For receipts from customers, income' },
    { value: 'Journal', label: '📓 Journal Voucher', color: '#3b82f6', desc: 'For adjustments, transfers' },
    { value: 'Contra', label: '🔄 Contra Voucher', color: '#8b5cf6', desc: 'For internal transfers' }
  ];

  const totalDebit = formData.lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
  const totalCredit = formData.lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <motion.div
      className="voucher-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}
    >
      <style>{`
        .voucher-table { width: 100%; border-collapse: collapse; min-width: 600px; }
        .voucher-table th, .voucher-table td { padding: 12px; }
        .voucher-table th { background: #f9fafb; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; }
        .voucher-table td { border-bottom: 1px solid #f3f4f6; }
        .voucher-input { padding: 8px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; box-sizing: border-box; }
        .voucher-select { padding: 8px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; box-sizing: border-box; }
        @media (max-width: 768px) {
          .voucher-table-wrap { overflow-x: visible; }
          .voucher-table { min-width: 0; }
          .voucher-table thead { display: none; }
          .voucher-table tr { display: flex; flex-direction: column; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; margin-bottom: 12px; background: white; }
          .voucher-table td { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border: none; gap: 8px; }
          .voucher-table td::before { content: attr(data-label); font-weight: 600; font-size: 11px; color: #6b7280; white-space: nowrap; }
          .voucher-input, .voucher-select { width: 100% !important; max-width: 200px; }
          .voucher-type-btn { flex: 1 1 100% !important; }
        }
        @media (max-width: 480px) {
          .voucher-page { padding: 12px !important; }
          .voucher-card { padding: 16px !important; }
          .voucher-actions { flex-direction: column !important; }
          .voucher-actions button { width: 100%; }
        }
      `}</style>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/vouchers')}
          style={{
            padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)',
            background: '#f3f4f6',
            color: '#374151',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            marginBottom: '16px'
          }}
        >
          ← Back to Vouchers
        </button>
        <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '700', marginBottom: '4px' }}>
          Create Voucher
        </h1>
        <p style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', color: '#666' }}>
          Create payment, receipt, journal, or contra vouchers
        </p>
      </div>

      {/* Voucher Type Selection */}
      <div className="voucher-card" style={{
        background: 'white',
        borderRadius: '16px',
        padding: 'clamp(16px, 3vw, 24px)',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: 'clamp(14px, 3vw, 16px)', fontWeight: '600', marginBottom: '16px' }}>Select Voucher Type</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {voucherTypes.map(type => (
            <button
              key={type.value}
              type="button"
              onClick={() => setVoucherType(type.value)}
              className="voucher-type-btn"
              style={{
                flex: 1,
                padding: '16px',
                background: voucherType === type.value ? type.color : '#f9fafb',
                color: voucherType === type.value ? 'white' : '#374151',
                border: voucherType === type.value ? 'none' : '1px solid #e5e7eb',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{type.label.split(' ')[0]}</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{type.label}</div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>{type.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Voucher Form */}
      <form onSubmit={handleSubmit}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: 'clamp(16px, 3vw, 24px)',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {/* Date Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
              Voucher Date *
            </label>
            <input
              type="date"
              value={formData.entry_date}
              onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
              required
              style={{
                width: '100%',
                maxWidth: '250px',
                padding: '10px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          {/* Description Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              placeholder="Enter description for this voucher"
              style={{
                width: '100%',
                padding: '10px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                resize: 'vertical',
                outline: 'none'
              }}
            />
          </div>

          {/* Journal Entries Table */}
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Journal Entries</h3>
          <div className="voucher-table-wrap" style={{ overflowX: 'auto' }}>
            <table className="voucher-table">
              <thead>
                <tr>
                  <th>Account</th>
                  <th style={{ textAlign: 'right' }}>Debit</th>
                  <th style={{ textAlign: 'right' }}>Credit</th>
                  <th>Narration</th>
                  <th style={{ textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {formData.lines.map((line, index) => (
                  <tr key={index}>
                    <td data-label="Account">
                      <select
                        value={line.account_id}
                        onChange={(e) => handleLineChange(index, 'account_id', e.target.value)}
                        required
                        className="voucher-select"
                        style={{ width: '200px' }}
                      >
                        <option value="">Select Account</option>
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>
                            {acc.account_code} - {acc.account_name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td data-label="Debit">
                      <input
                        type="number"
                        step="0.01"
                        value={line.debit}
                        onChange={(e) => handleLineChange(index, 'debit', parseFloat(e.target.value) || 0)}
                        className="voucher-input"
                        style={{ width: '120px', textAlign: 'right' }}
                      />
                    </td>
                    <td data-label="Credit">
                      <input
                        type="number"
                        step="0.01"
                        value={line.credit}
                        onChange={(e) => handleLineChange(index, 'credit', parseFloat(e.target.value) || 0)}
                        className="voucher-input"
                        style={{ width: '120px', textAlign: 'right' }}
                      />
                    </td>
                    <td data-label="Narration">
                      <input
                        type="text"
                        value={line.narration}
                        onChange={(e) => handleLineChange(index, 'narration', e.target.value)}
                        placeholder="Narration"
                        className="voucher-input"
                        style={{ width: '200px' }}
                      />
                    </td>
                    <td data-label="">
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(index)}
                        style={{
                          padding: '4px 8px',
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid #e5e7eb', fontWeight: 'bold' }}>
                  <td style={{ padding: '12px', textAlign: 'right' }}><strong>Totals</strong></td>
                  <td style={{ padding: '12px', textAlign: 'right' }}><strong>{formatCurrency(totalDebit)}</strong></td>
                  <td style={{ padding: '12px', textAlign: 'right' }}><strong>{formatCurrency(totalCredit)}</strong></td>
                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Add Line Button */}
          <button
            type="button"
            onClick={handleAddLine}
            style={{
              marginTop: '16px',
              padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)',
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: 'clamp(12px, 2.5vw, 14px)'
            }}
          >
            + Add Line Item
          </button>

          {/* Balance Status */}
          <div style={{
            marginTop: '20px',
            padding: '12px',
            borderRadius: '10px',
            backgroundColor: isBalanced ? '#d1fae5' : '#fee2e2',
            color: isBalanced ? '#065f46' : '#991b1b'
          }}>
            {isBalanced ? (
              <span>✅ Voucher is balanced. Debits equal Credits.</span>
            ) : (
              <span>⚠️ Voucher is not balanced. Difference: {formatCurrency(Math.abs(totalDebit - totalCredit))}</span>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="voucher-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '40px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate('/vouchers')}
            style={{
              padding: '12px 24px',
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !isBalanced}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: loading || !isBalanced ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              opacity: loading || !isBalanced ? 0.6 : 1
            }}
          >
            {loading ? 'Creating...' : `Create ${voucherType} Voucher`}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateVoucher;