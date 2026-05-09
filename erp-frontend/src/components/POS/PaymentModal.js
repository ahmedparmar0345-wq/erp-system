import React, { useState } from 'react';
import { motion } from 'framer-motion';

const PaymentModal = ({ total, onComplete, onCancel }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const numericReceived = parseFloat(amountReceived) || 0;
  const change = numericReceived >= total ? numericReceived - total : 0;

  const quickAmounts = [
    total,
    Math.ceil(total),
    Math.ceil(total / 10) * 10,
    Math.ceil(total / 50) * 50,
    Math.ceil(total / 100) * 100
  ].filter((val, idx, arr) => arr.indexOf(val) === idx && val >= total);

  const handleComplete = async () => {
    if (paymentMethod === 'cash' && numericReceived < total) {
      setError('Insufficient amount received');
      return;
    }
    setProcessing(true);
    try {
      onComplete({
        payment_method: paymentMethod,
        amount_received: paymentMethod === 'cash' ? numericReceived : total,
        change: paymentMethod === 'cash' ? change : 0
      });
    } catch (err) {
      setError('Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const btnBase = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        style={{
          background: 'white',
          borderRadius: '24px',
          padding: '32px',
          width: '440px',
          maxWidth: '92vw',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Complete Payment</h3>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af', lineHeight: 1, padding: '4px' }}>×</button>
        </div>

        {/* Total Due Display */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Due</div>
          <div style={{ fontSize: '36px', fontWeight: '700', color: 'white' }}>${total.toFixed(2)}</div>
        </div>

        {/* Payment Method */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#374151' }}>Payment Method</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { key: 'cash', label: 'Cash', icon: '💵' },
              { key: 'card', label: 'Card', icon: '💳' },
              { key: 'bank', label: 'Bank', icon: '🏦' }
            ].map(m => (
              <button
                key={m.key}
                onClick={() => { setPaymentMethod(m.key); setError(''); }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: paymentMethod === m.key ? '2px solid #6366f1' : '2px solid #e5e7eb',
                  background: paymentMethod === m.key ? '#eef2ff' : 'white',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: paymentMethod === m.key ? '600' : '400',
                  color: paymentMethod === m.key ? '#6366f1' : '#6b7280',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{m.icon}</div>
                <div>{m.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Cash Amount Input */}
        {paymentMethod === 'cash' && (
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#374151' }}>Amount Received</label>
              <input
                type="number"
                step="0.01"
                value={amountReceived}
                onChange={e => { setAmountReceived(e.target.value); setError(''); }}
                placeholder="0.00"
                autoFocus
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '14px',
                  fontSize: '24px',
                  fontWeight: '700',
                  textAlign: 'center',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Quick Amounts */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {quickAmounts.map((amt, idx) => (
                <button
                  key={idx}
                  onClick={() => setAmountReceived(amt.toFixed(2))}
                  style={{
                    padding: '8px 14px',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#374151',
                    transition: 'background 0.2s'
                  }}
                >
                  ${amt.toFixed(2)}
                </button>
              ))}
            </div>

            {/* Change Due */}
            {change > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: '#f0fdf4',
                borderRadius: '12px',
                marginBottom: '16px'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#065f46' }}>Change Due</span>
                <span style={{ fontSize: '22px', fontWeight: '700', color: '#059669' }}>${change.toFixed(2)}</span>
              </div>
            )}
          </>
        )}

        {/* Non-cash payment info */}
        {paymentMethod !== 'cash' && (
          <div style={{
            padding: '14px 16px',
            background: '#f0fdf4',
            borderRadius: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            color: '#065f46'
          }}>
            <span>ℹ️</span>
            <span>The full amount of <strong>${total.toFixed(2)}</strong> will be charged to {paymentMethod === 'card' ? 'card' : 'bank account'}.</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            padding: '10px 14px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            color: '#dc2626',
            fontSize: '13px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '14px',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '14px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            disabled={processing || (paymentMethod === 'cash' && numericReceived < total)}
            style={{
              flex: 1,
              padding: '14px',
              background: processing ? '#a5b4fc' : 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              borderRadius: '14px',
              cursor: (processing || (paymentMethod === 'cash' && numericReceived < total)) ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              opacity: (processing || (paymentMethod === 'cash' && numericReceived < total)) ? 0.7 : 1
            }}
          >
            {processing ? 'Processing...' : 'Complete Sale'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaymentModal;
