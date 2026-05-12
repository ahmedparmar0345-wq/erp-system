import React, { useState, useEffect } from 'react';
import api from '../services/api';

const SalesOrders = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    notes: '',
    items: [{ product_id: '', quantity: 1, unit_price: 0, discount_percent: 0 }]
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [ordersRes, customersRes, productsRes] = await Promise.all([
        api.get('/sales-orders'),
        api.get('/customers'),
        api.get('/products')
      ]);

      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      setCustomers(Array.isArray(customersRes.data) ? customersRes.data : []);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: '', quantity: 1, unit_price: 0, discount_percent: 0 }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    if (field === 'product_id') {
      const product = products.find(p => p.id === parseInt(value));
      if (product) {
        newItems[index].unit_price = product.unit_price;
      }
    }

    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post('/sales-orders', formData);
      alert('Sales order created successfully!');
      setShowModal(false);
      setFormData({
        customer_id: '',
        notes: '',
        items: [{ product_id: '', quantity: 1, unit_price: 0, discount_percent: 0 }]
      });
      fetchAllData();
    } catch (err) {
      console.error('Error creating order:', err);
      alert('Failed to create order: ' + (err.response?.data?.error || err.message));
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '$0.00';
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return '$0.00';
    return `$${num.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      confirmed: { bg: '#d1fae5', color: '#065f46' },
      shipped: { bg: '#fed7aa', color: '#92400e' },
      delivered: { bg: '#d1fae5', color: '#065f46' },
      draft: { bg: '#f3f4f6', color: '#374151' },
      cancelled: { bg: '#fee2e2', color: '#991b1b' }
    };
    const style = styles[status] || styles.draft;
    return {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold',
      backgroundColor: style.bg,
      color: style.color
    };
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading sales orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</div>
        <button
          onClick={fetchAllData}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <h1 style={{ margin: 0 }}>Sales Orders</h1>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          + New Order
        </button>
      </div>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>No sales orders found</div>
          <div style={{ fontSize: '14px' }}>Click "New Order" to create your first order.</div>
        </div>
      ) : (
        <div style={{
          overflowX: 'auto',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Order #</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Customer</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Grand Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '500' }}>
                    {order.order_number || 'N/A'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {order.customer_name || 'Guest'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {formatDate(order.order_date)}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={getStatusStyle(order.status)}>
                      {order.status || 'draft'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold' }}>
                    {formatCurrency(order.grand_total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for New Sales Order */}
      {showModal && (
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
        }} onClick={() => setShowModal(false)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '800px',
            maxWidth: '90%',
            maxHeight: '85%',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>New Sales Order</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Customer Selection */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                  Customer *
                </label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Items */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                  Order Items
                </label>
                {formData.items.map((item, index) => {
                  const product = products.find(p => p.id === parseInt(item.product_id));
                  const total = (item.quantity * item.unit_price) * (1 - (item.discount_percent || 0) / 100);
                  return (
                    <div key={index} style={{
                      marginBottom: '10px',
                      padding: '10px',
                      border: '1px solid #eee',
                      borderRadius: '6px',
                      backgroundColor: '#f9fafb'
                    }}>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <select
                          value={item.product_id}
                          onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                          required
                          style={{ flex: 2, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        >
                          <option value="">Select Product</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Stock: {p.current_stock})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                          min="1"
                          required
                          style={{ width: '80px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }}
                        />
                        <input
                          type="number"
                          placeholder="Price"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          step="0.01"
                          required
                          style={{ width: '100px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'right' }}
                        />
                        <input
                          type="number"
                          placeholder="Discount %"
                          value={item.discount_percent}
                          onChange={(e) => handleItemChange(index, 'discount_percent', parseFloat(e.target.value) || 0)}
                          step="1"
                          min="0"
                          max="100"
                          style={{ width: '80px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'right' }}
                        />
                        <div style={{ width: '100px', padding: '8px', fontWeight: 'bold' }}>
                          ${total.toFixed(2)}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={handleAddItem}
                  style={{
                    marginTop: '10px',
                    padding: '8px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  + Add Item
                </button>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  placeholder="Additional notes..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesOrders;