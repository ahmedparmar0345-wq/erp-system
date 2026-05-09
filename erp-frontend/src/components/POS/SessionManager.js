import React, { useState, useEffect } from 'react';
import { getCurrentSession, closeSession, openSession } from '../../services/pos';

const SessionManager = ({ onSessionChange }) => {
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeData, setCloseData] = useState({
    closing_balance: 0,
    cash_sales: 0,
    card_sales: 0,
    bank_sales: 0,
    notes: ''
  });

  const fetchCurrentSession = async () => {
    try {
      setLoading(true);
      const session = await getCurrentSession();
      console.log('Session data:', session);

      if (session && session.status === 'open') {
        setCurrentSession(session);
        if (onSessionChange) onSessionChange(session);
      } else {
        setCurrentSession(null);
        if (onSessionChange) onSessionChange(null);
      }
    } catch (err) {
      console.error('Error fetching session:', err);
      setCurrentSession(null);
      if (onSessionChange) onSessionChange(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentSession();
  }, []);

  const handleOpenSession = async () => {
    try {
      const openingBalance = prompt('Enter opening cash balance:', '0');
      if (openingBalance === null) return;

      await openSession({ opening_balance: parseFloat(openingBalance) || 0 });
      await fetchCurrentSession();
      alert('POS session opened successfully!');
    } catch (err) {
      console.error('Error opening session:', err);
      alert('Failed to open session: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCloseSession = async () => {
    try {
      await closeSession({
        closing_balance: parseFloat(closeData.closing_balance) || 0,
        cash_sales: parseFloat(closeData.cash_sales) || 0,
        card_sales: parseFloat(closeData.card_sales) || 0,
        bank_sales: parseFloat(closeData.bank_sales) || 0,
        notes: closeData.notes
      });
      setShowCloseModal(false);
      setCloseData({
        closing_balance: 0,
        cash_sales: 0,
        card_sales: 0,
        bank_sales: 0,
        notes: ''
      });
      await fetchCurrentSession();
      alert('POS session closed successfully!');
    } catch (err) {
      console.error('Error closing session:', err);
      alert('Failed to close session: ' + (err.response?.data?.error || err.message));
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '$0.00';
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return '$0.00';
    return `$${num.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <span>Loading session...</span>
      </div>
    );
  }

  // If NO open session - show the yellow banner
  if (!currentSession) {
    return (
      <div style={{
        backgroundColor: '#fef3c7',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        marginBottom: '20px',
        border: '1px solid #f59e0b'
      }}>
        <div style={{ fontSize: '16px', marginBottom: '10px', color: '#92400e' }}>
          ⚠️ No active POS session
        </div>
        <div style={{ fontSize: '14px', marginBottom: '15px', color: '#78350f' }}>
          You need to open a session before processing sales.
        </div>
        <button
          onClick={handleOpenSession}
          style={{
            padding: '10px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          Open Session
        </button>
      </div>
    );
  }

  // If session IS open - show the green session info bar
  return (
    <div>
      <div style={{
        backgroundColor: '#d1fae5',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '15px',
        border: '1px solid #10b981'
      }}>
        <div>
          <div><strong>✓ Session Open</strong></div>
          <div><strong>Session:</strong> {currentSession.session_number || 'N/A'}</div>
          <div><strong>Opened:</strong> {formatDate(currentSession.opening_time)}</div>
          <div><strong>Sales:</strong> {formatCurrency(currentSession.total_sales)}</div>
          <div><strong>Transactions:</strong> {currentSession.transaction_count || 0}</div>
        </div>
        <div>
          <button
            onClick={() => setShowCloseModal(true)}
            style={{
              padding: '8px 20px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Close Session
          </button>
        </div>
      </div>

      {/* Close Session Modal */}
      {showCloseModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowCloseModal(false)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '400px',
            maxWidth: '90%'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Close POS Session</h3>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Closing Balance (Cash in drawer)
              </label>
              <input
                type="number"
                step="0.01"
                value={closeData.closing_balance}
                onChange={(e) => setCloseData({ ...closeData, closing_balance: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Cash Sales Today
              </label>
              <input
                type="number"
                step="0.01"
                value={closeData.cash_sales}
                onChange={(e) => setCloseData({ ...closeData, cash_sales: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Card Sales Today
              </label>
              <input
                type="number"
                step="0.01"
                value={closeData.card_sales}
                onChange={(e) => setCloseData({ ...closeData, card_sales: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Bank Transfer Sales Today
              </label>
              <input
                type="number"
                step="0.01"
                value={closeData.bank_sales}
                onChange={(e) => setCloseData({ ...closeData, bank_sales: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Notes
              </label>
              <textarea
                value={closeData.notes}
                onChange={(e) => setCloseData({ ...closeData, notes: e.target.value })}
                rows="3"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowCloseModal(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCloseSession}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Close Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionManager;