import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPaymentVoucher, createReceiptVoucher, createJournalVoucher, createContraVoucher, getChartOfAccounts } from '../../services/accounting';

const CreateVoucher = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [activeTab, setActiveTab] = useState('Payment');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState([
    { account_id: '', debit: '', credit: '', narration: '' },
    { account_id: '', debit: '', credit: '', narration: '' }
  ]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getChartOfAccounts()
      .then(res => setAccounts(res.data))
      .catch(err => console.error('Failed to load accounts', err));
  }, []);

  const addLine = () => {
    setLines([...lines, { account_id: '', debit: '', credit: '', narration: '' }]);
  };

  const removeLine = (idx) => {
    if (lines.length <= 2) return; // Minimum 2 lines required
    setLines(lines.filter((_, i) => i !== idx));
  };

  const updateLine = (idx, field, value) => {
    const newLines = [...lines];
    newLines[idx][field] = value;
    // Auto-clear opposite field
    if (field === 'debit' && value !== '') {
      newLines[idx].credit = '';
    } else if (field === 'credit' && value !== '') {
      newLines[idx].debit = '';
    }
    setLines(newLines);
  };

  const totalDebit = lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isBalanced) {
      setError('Voucher must be balanced (Total Debits must equal Total Credits)');
      return;
    }

    const payload = {
      entry_date: entryDate,
      description,
      lines: lines
        .filter(l => l.account_id && (l.debit || l.credit))
        .map(l => ({
          account_id: parseInt(l.account_id),
          debit: parseFloat(l.debit) || 0,
          credit: parseFloat(l.credit) || 0,
          narration: l.narration
        }))
    };

    if (payload.lines.length < 2) {
      setError('Voucher must have at least 2 line items');
      return;
    }

    setSubmitting(true);

    try {
      let res;
      switch (activeTab) {
        case 'Payment': res = await createPaymentVoucher(payload); break;
        case 'Receipt': res = await createReceiptVoucher(payload); break;
        case 'Journal': res = await createJournalVoucher(payload); break;
        case 'Contra': res = await createContraVoucher(payload); break;
        default: throw new Error('Invalid voucher type');
      }
      if (res) navigate(`/vouchers/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create voucher');
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = ['Payment', 'Receipt', 'Journal', 'Contra'];

  return (
    <div className="container">
      <h1>Create {activeTab} Voucher</h1>
      <form onSubmit={handleSubmit}>
        {/* Tabs */}
        <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {tabs.map(type => (
              <button
                key={type}
                type="button"
                className={`btn ${activeTab === type ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab(type)}
              >
                {type} Voucher
              </button>
            ))}
          </div>
        </div>

        {/* Header Fields */}
        <div className="card">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }} className="voucher-header-grid">
            <div className="form-group">
              <label>Date *</label>
              <input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Enter description..." />
            </div>
          </div>
          <style>{`@media (min-width: 600px) { .voucher-header-grid { grid-template-columns: 1fr 2fr !important; } }`}</style>
        </div>

        {/* Line Items */}
        <div className="card">
          <h3>Account Entries</h3>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px,3fr) minmax(80px,1fr) minmax(80px,1fr) minmax(100px,2fr) 50px', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', minWidth: '450px' }}>
              <div>Account</div>
              <div>Debit ($)</div>
              <div>Credit ($)</div>
              <div>Narration</div>
              <div></div>
            </div>

          {lines.map((line, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'minmax(120px,3fr) minmax(80px,1fr) minmax(80px,1fr) minmax(100px,2fr) 50px', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center', minWidth: '450px' }}>
              <select value={line.account_id} onChange={e => updateLine(idx, 'account_id', e.target.value)} required style={{ width: '100%' }}>
                <option value="">Select Account</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.account_code} - {a.account_name} ({a.account_type})
                  </option>
                ))}
              </select>
              <input 
                type="number" 
                placeholder="0.00" 
                value={line.debit} 
                onChange={e => updateLine(idx, 'debit', e.target.value)} 
                step="0.01" 
                min="0"
                style={{ width: '100%' }}
              />
              <input 
                type="number" 
                placeholder="0.00" 
                value={line.credit} 
                onChange={e => updateLine(idx, 'credit', e.target.value)} 
                step="0.01" 
                min="0"
              />
              <input 
                placeholder="Narration (optional)" 
                value={line.narration} 
                onChange={e => updateLine(idx, 'narration', e.target.value)} 
              />
              <button type="button" className="btn btn-danger btn-sm" onClick={() => removeLine(idx)} disabled={lines.length <= 2}>
                X
              </button>
            </div>
          ))}

          <button type="button" className="btn btn-secondary btn-sm" onClick={addLine}>+ Add Line</button>
          </div>
        </div>

        {/* Footer / Summary */}
        <div className="card" style={{ background: isBalanced ? '#f0fff4' : '#fff5f5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ margin: '0.5rem 0' }}><strong>Total Debit:</strong> <span style={{ fontSize: '1.2rem', color: '#155724' }}>${totalDebit.toFixed(2)}</span></p>
              <p style={{ margin: '0.5rem 0' }}><strong>Total Credit:</strong> <span style={{ fontSize: '1.2rem', color: '#155724' }}>${totalCredit.toFixed(2)}</span></p>
              <p style={{ margin: '0.5rem 0', fontWeight: 'bold', color: isBalanced ? '#155724' : '#721c24' }}>
                {isBalanced ? '✓ Balanced' : '✗ Not Balanced'}
              </p>
            </div>
            <div>
              {error && <p className="error-msg">{error}</p>}
              <button type="submit" className="btn btn-primary" disabled={!isBalanced || submitting} style={{ marginRight: '0.5rem' }}>
                {submitting ? 'Creating...' : 'Create Voucher'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateVoucher;