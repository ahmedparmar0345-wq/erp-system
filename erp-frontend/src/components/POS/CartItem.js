import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CartItem = ({ item, onUpdate, onRemove }) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const [discount, setDiscount] = useState(item.discount_percent || 0);

  const formatCurrency = (value) => {
    const num = typeof value === 'number' ? value : parseFloat(value);
    return `$${(num || 0).toFixed(2)}`;
  };

  const safeNumber = (value) => {
    const num = typeof value === 'number' ? value : parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const unitPrice = safeNumber(item.unit_price);
  const total = quantity * unitPrice * (1 - discount / 100);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
      onUpdate(item.id, { quantity: newQuantity, discount_percent: discount });
    }
  };

  const handleDiscountChange = (newDiscount) => {
    if (newDiscount >= 0 && newDiscount <= 100) {
      setDiscount(newDiscount);
      onUpdate(item.id, { quantity: quantity, discount_percent: newDiscount });
    }
  };

  return (
    <motion.div
      layout
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '12px',
        marginBottom: '8px',
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        transition: 'all 0.2s'
      }}
    >
      {/* Product Icon + Info row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 200px', minWidth: '160px' }}>
        <div style={{
          width: '40px', height: '40px',
          background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', flexShrink: 0
        }}>
          📦
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product_name || item.name}</div>
          <div style={{ fontSize: '10px', color: '#6b7280' }}>SKU: {item.sku || 'N/A'}</div>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#6366f1' }}>
            {formatCurrency(unitPrice)} each
          </div>
        </div>
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: '1 1 auto' }}>
        {/* Quantity Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button onClick={() => handleQuantityChange(quantity - 1)} style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#f3f4f6', border: 'none', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
          <span style={{ width: '30px', textAlign: 'center', fontWeight: '500', fontSize: '13px' }}>{quantity}</span>
          <button onClick={() => handleQuantityChange(quantity + 1)} style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#f3f4f6', border: 'none', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        </div>

        {/* Discount */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <input type="number" min="0" max="100" value={discount} onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)} style={{ width: '44px', padding: '4px', border: '1px solid #e5e7eb', borderRadius: '6px', textAlign: 'center', fontSize: '11px' }} />
          <span style={{ fontSize: '10px', color: '#6b7280' }}>%</span>
        </div>

        {/* Total */}
        <div style={{ fontWeight: '700', fontSize: '14px', color: '#1f2937', whiteSpace: 'nowrap' }}>
          {formatCurrency(total)}
        </div>

        {/* Remove */}
        <button onClick={() => onRemove(item.id)} style={{ padding: '4px', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#9ca3af', borderRadius: '6px', lineHeight: 1 }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >🗑️</button>
      </div>
    </motion.div>
  );
};

export default CartItem;