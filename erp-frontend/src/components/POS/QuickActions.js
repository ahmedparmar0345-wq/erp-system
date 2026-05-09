import React, { useState } from 'react';
import TodayStats from './TodayStats';

const QuickActions = ({ session, cart, onClearCart, onCloseSession }) => {
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState(null);

  return (
    <div className="pos-quick-actions">
      <div className="pos-actions-dropdown">
        <button className="btn btn-secondary btn-sm">⚡ Quick Actions</button>
        <div className="pos-actions-menu">
          <button className="pos-action-item" onClick={() => alert('Order held')}>
            ⏸️ Hold Order
          </button>
          {cart.length > 0 && (
            <button className="pos-action-item" onClick={onClearCart}>
              🗑️ Clear Cart
            </button>
          )}
          <button className="pos-action-item" onClick={onCloseSession}>
            🔒 Close Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;