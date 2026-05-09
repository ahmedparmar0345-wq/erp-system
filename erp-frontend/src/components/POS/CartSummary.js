import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CartItem from './CartItem';
import CustomerLookup from './CustomerLookup';
import PaymentModal from './PaymentModal';
import { getDefaultTaxRate } from '../../services/api';

const CartSummary = ({
  cart,
  customer,
  onUpdateCartItem,
  onRemoveFromCart,
  onClearCart,
  onCustomerChange,
  onCompleteSale
}) => {
  const [showCustomerLookup, setShowCustomerLookup] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);

  useEffect(() => {
    getDefaultTaxRate().then(r => { if (r) setTaxRate(r.rate); }).catch(() => {});
  }, []);

  const safeNumber = (value) => {
    if (value === null || value === undefined) return 0;
    const num = typeof value === 'number' ? value : parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const subtotal = cart.reduce((sum, item) => sum + (safeNumber(item.quantity) * safeNumber(item.unit_price)), 0);
  const totalDiscount = cart.reduce((sum, item) => sum + (safeNumber(item.quantity) * safeNumber(item.unit_price) * safeNumber(item.discount_percent) / 100), 0);
  const discountAmount = subtotal * (safeNumber(globalDiscount) / 100);
  const taxableAmount = subtotal - totalDiscount - discountAmount;
  const tax = taxableAmount * (taxRate / 100);
  const total = taxableAmount + tax;

  const formatCurrency = (value) => {
    const num = safeNumber(value);
    return `$${num.toFixed(2)}`;
  };

  const handlePaymentComplete = (paymentData) => {
    setShowPayment(false);
    onCompleteSale({
      ...paymentData,
      cart,
      customer,
      subtotal,
      tax,
      total,
      date: new Date().toISOString()
    });
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '24px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Current Order</h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.7 }}>{cart.length} items</p>
        </div>
        {cart.length > 0 && (
          <button
            onClick={onClearCart}
            style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Customer Section */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
        {customer ? (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            background: '#e0e7ff',
            borderRadius: '16px'
          }}>
            <div>
              <div style={{ fontWeight: '600' }}>👤 {customer.name}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                {customer.email && <span style={{ marginRight: '12px' }}>{customer.email}</span>}
                {customer.phone && <span>{customer.phone}</span>}
              </div>
            </div>
            <button
              onClick={() => onCustomerChange(null)}
              style={{
                padding: '6px 12px',
                background: 'white',
                color: '#374151',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              Change
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCustomerLookup(true)}
            style={{
              width: '100%',
              padding: '12px',
              background: '#f3f4f6',
              color: '#374151',
              border: '1px dashed #cbd5e1',
              borderRadius: '16px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '18px' }}>➕</span> Add Customer
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', maxHeight: '400px' }}>
        {cart.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 20px',
            color: '#9ca3af'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛒</div>
            <div style={{ fontSize: '14px' }}>Cart is empty</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>Search and add products</div>
          </div>
        ) : (
          <AnimatePresence>
            {cart.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
              >
                <CartItem
                  item={item}
                  onUpdate={onUpdateCartItem}
                  onRemove={onRemoveFromCart}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Totals */}
      {cart.length > 0 && (
        <div style={{ padding: '20px 24px', borderTop: '1px solid #e5e7eb', background: '#f9fafb' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>Subtotal</span>
              <span style={{ fontSize: '13px', fontWeight: '500' }}>{formatCurrency(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>Discount</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  value={globalDiscount}
                  onChange={e => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="1"
                  style={{
                    width: '60px',
                    padding: '4px 8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '12px'
                  }}
                />
                <span style={{ fontSize: '13px' }}>% ({formatCurrency(discountAmount)})</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>Tax ({taxRate}%)</span>
              <span style={{ fontSize: '13px', fontWeight: '500' }}>{formatCurrency(tax)}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '12px',
              borderTop: '2px solid #e5e7eb',
              marginTop: '4px'
            }}>
              <span style={{ fontSize: '16px', fontWeight: '700' }}>Total</span>
              <span style={{ fontSize: '20px', fontWeight: '700', color: '#6366f1' }}>{formatCurrency(total)}</span>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={() => setShowPayment(true)}
            style={{
              width: '100%',
              padding: '14px',
              background: cart.length === 0 ? '#cbd5e1' : 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            💳 Complete Sale • {formatCurrency(total)}
          </button>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showCustomerLookup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setShowCustomerLookup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'white',
                borderRadius: '24px',
                padding: '24px',
                width: '500px',
                maxWidth: '90%',
                maxHeight: '80%',
                overflow: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Select Customer</h3>
                <button onClick={() => setShowCustomerLookup(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
              </div>
              <CustomerLookup onSelectCustomer={(c) => { onCustomerChange(c); setShowCustomerLookup(false); }} />
            </motion.div>
          </motion.div>
        )}

        {showPayment && (
          <PaymentModal
            total={total}
            onComplete={handlePaymentComplete}
            onCancel={() => setShowPayment(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartSummary;