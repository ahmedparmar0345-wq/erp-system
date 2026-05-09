import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchProducts } from '../../services/pos';
import BarcodeScannerInput from '../Barcode/BarcodeScannerInput';

const ProductSearch = ({ onAddToCart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      performSearch();
    } else {
      setProducts([]);
    }
  }, [searchTerm]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const results = await searchProducts(searchTerm);
      setProducts(Array.isArray(results) ? results : []);
    } catch (err) {
      console.error('Error searching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      onAddToCart(selectedProduct, quantity);
      setSelectedProduct(null);
      setSearchTerm('');
      setProducts([]);
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '$0.00';
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return '$0.00';
    return `$${num.toFixed(2)}`;
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Search Input */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'white',
          borderRadius: '20px',
          padding: '4px 20px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          transition: 'all 0.2s'
        }}>
          <span style={{ fontSize: '20px', marginRight: '12px', color: '#9ca3af' }}>🔍</span>
          <input
            type="text"
            placeholder="Search by product name, SKU, or scan barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              padding: '14px 0',
              fontSize: '15px',
              border: 'none',
              outline: 'none',
              background: 'transparent'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#9ca3af'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: '32px' }}
          >
            ⭕
          </motion.div>
          <div style={{ fontSize: '13px', color: '#666', marginTop: '12px' }}>Searching products...</div>
        </div>
      )}

      {/* Search Results */}
      {!loading && searchTerm.length >= 2 && products.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          background: 'white',
          borderRadius: '24px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
          <div style={{ fontSize: '14px', color: '#666' }}>No products found. Try a different search term.</div>
        </div>
      )}

      {/* Product Grid */}
      {!loading && products.length > 0 && !selectedProduct && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
          overflowY: 'auto',
          padding: '4px'
        }}>
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleProductClick(product)}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}
              whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(0,0,0,0.15)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{product.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>SKU: {product.sku}</div>
                </div>
                <div style={{
                  background: product.current_stock > 0 ? '#d1fae5' : '#fee2e2',
                  color: product.current_stock > 0 ? '#065f46' : '#991b1b',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '500'
                }}>
                  {product.current_stock > 0 ? `Stock: ${product.current_stock}` : 'Out of Stock'}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#6366f1' }}>
                  {formatCurrency(product.unit_price)}
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Click to add →</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quantity Modal */}
      <AnimatePresence>
        {selectedProduct && (
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
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'white',
                borderRadius: '32px',
                padding: '32px',
                width: '400px',
                maxWidth: '90%',
                textAlign: 'center'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
              <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '8px' }}>{selectedProduct.name}</h3>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>SKU: {selectedProduct.sku}</div>

              <div style={{ marginBottom: '12px' }}>
                <BarcodeScannerInput onScan={(code) => { setSearchTerm(code); }} placeholder="Scan barcode..." autoFocus />
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products by name, SKU, or barcode..."
                    style={{
                      width: '100%',
                      padding: '14px 20px 14px 48px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '16px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      background: '#f9fafb'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                  />
                  <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: '#9ca3af' }}>🔍</span>
                </div>
                <div style={{ fontSize: '13px', color: selectedProduct.current_stock > 0 ? '#10b981' : '#dc2626' }}>
                  Available Stock: {selectedProduct.current_stock}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                  Quantity
                </label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: '#f3f4f6',
                      border: 'none',
                      fontSize: '20px',
                      cursor: 'pointer'
                    }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct.current_stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{
                      width: '80px',
                      padding: '10px',
                      textAlign: 'center',
                      fontSize: '18px',
                      fontWeight: '600',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: '#f3f4f6',
                      border: 'none',
                      fontSize: '20px',
                      cursor: 'pointer'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '24px', padding: '12px', background: '#f9fafb', borderRadius: '16px' }}>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>Total Amount</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#6366f1' }}>
                  {formatCurrency(selectedProduct.unit_price * quantity)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setSelectedProduct(null)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddToCart}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductSearch;