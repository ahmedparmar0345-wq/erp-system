import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductSearch from './ProductSearch';
import CartSummary from './CartSummary';
import SessionManager from './SessionManager';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart, completeSale, getTodayStats } from '../../services/pos';

const POSLayout = () => {
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [todayStats, setTodayStats] = useState(null);
  const [hasOpenSession, setHasOpenSession] = useState(false);
  const isMounted = useRef(true);

  // Load cart function - stable reference
  const loadCart = useCallback(async () => {
    if (!isMounted.current) return;
    try {
      const data = await getCart();
      if (isMounted.current) {
        setCart(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading cart:', err);
      if (isMounted.current) setCart([]);
    }
  }, []);

  // Load stats function - stable reference
  const loadTodayStats = useCallback(async () => {
    if (!isMounted.current) return;
    try {
      const stats = await getTodayStats();
      if (isMounted.current) {
        setTodayStats(stats || { total_sales: 0, transaction_count: 0, average_ticket: 0 });
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      if (isMounted.current) {
        setTodayStats({ total_sales: 0, transaction_count: 0, average_ticket: 0 });
      }
    }
  }, []);

  // Initial load - runs only once on mount
  useEffect(() => {
    isMounted.current = true;

    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([loadCart(), loadTodayStats()]);
      } catch (err) {
        console.error('Initialization error:', err);
        if (isMounted.current) {
          setError('Failed to load POS data. Please refresh the page.');
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      isMounted.current = false;
    };
  }, []); // Empty dependency array - runs only once

  const handleAddToCart = async (product, quantity) => {
    try {
      await addToCart({
        product_id: product.id,
        quantity: quantity,
        unit_price: product.unit_price,
        discount_percent: 0
      });
      await loadCart();
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert(err.response?.data?.error || 'Failed to add to cart');
    }
  };

  const handleUpdateCartItem = async (id, data) => {
    try {
      await updateCartItem(id, data);
      await loadCart();
    } catch (err) {
      console.error('Error updating cart:', err);
    }
  };

  const handleRemoveFromCart = async (id) => {
    try {
      await removeFromCart(id);
      await loadCart();
    } catch (err) {
      console.error('Error removing from cart:', err);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Clear entire cart?')) {
      try {
        await clearCart();
        await loadCart();
      } catch (err) {
        console.error('Error clearing cart:', err);
        alert('Failed to clear cart');
      }
    }
  };

  const handleCompleteSale = async (saleData) => {
    try {
      const result = await completeSale({
        customer_id: saleData.customer?.id,
        payment_method: saleData.payment_method,
        paid_amount: parseFloat(saleData.paid_amount),
        notes: saleData.notes
      });
      alert('Sale completed successfully!');
      setCustomer(null);
      await Promise.all([loadCart(), loadTodayStats()]);
      if (result.order) {
        window.open(`/api/pos/receipt/${result.order.id}`, '_blank');
      }
    } catch (err) {
      console.error('Error completing sale:', err);
      alert(err.response?.data?.error || 'Failed to complete sale');
    }
  };

  const handleSessionChange = (session) => {
    setHasOpenSession(!!(session && session.status === 'open'));
    // Reload data when session changes
    if (session && session.status === 'open') {
      loadCart();
      loadTodayStats();
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '$0.00';
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return '$0.00';
    return `$${num.toFixed(2)}`;
  };

  // Show error state
  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px', color: '#dc2626' }}>Error</div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>{error}</div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: '40px', marginBottom: '16px' }}
          >
            🛒
          </motion.div>
          <div style={{ fontSize: '14px', color: '#666' }}>Loading POS...</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ minHeight: '100vh', background: '#f5f7fa' }}
    >
      <style>{`@media (min-width: 900px) { .pos-grid { grid-template-columns: 1fr 420px !important; } }`}</style>
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '12px' }}>
        {/* Session Manager */}
        <SessionManager onSessionChange={handleSessionChange} />

        {/* Stats Bar */}
        {hasOpenSession && todayStats && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}
          >
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '16px 20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              border: '1px solid rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Today's Sales</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>{formatCurrency(todayStats.total_sales)}</div>
              </div>
              <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>💰</div>
            </div>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '16px 20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              border: '1px solid rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Transactions</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>{todayStats.transaction_count}</div>
              </div>
              <div style={{ width: '48px', height: '48px', background: '#d1fae5', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📊</div>
            </div>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '16px 20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              border: '1px solid rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Average Ticket</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>{formatCurrency(todayStats.average_ticket)}</div>
              </div>
              <div style={{ width: '48px', height: '48px', background: '#fee2e2', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🎫</div>
            </div>
          </motion.div>
        )}

        {/* Main POS Interface */}
        {hasOpenSession ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '24px',
              minHeight: 'calc(100vh - 200px)'
            }}
            className="pos-grid"
          >
            <div>
              <ProductSearch onAddToCart={handleAddToCart} />
            </div>
            <div>
              <CartSummary
                cart={cart}
                customer={customer}
                onUpdateCartItem={handleUpdateCartItem}
                onRemoveFromCart={handleRemoveFromCart}
                onClearCart={handleClearCart}
                onCustomerChange={setCustomer}
                onCompleteSale={handleCompleteSale}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              textAlign: 'center',
              padding: '80px',
              background: 'white',
              borderRadius: '32px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🛒</div>
            <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Open a session to start selling</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Please open a POS session using the button above to begin processing sales.</div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default POSLayout;