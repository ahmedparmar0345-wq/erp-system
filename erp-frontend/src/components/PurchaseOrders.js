import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedReceiveOrder, setSelectedReceiveOrder] = useState(null);
  const [formData, setFormData] = useState({
    supplier_id: '',
    notes: '',
    items: [{ product_id: '', quantity: 1, unit_price: 0 }]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const [ordersRes, suppliersRes, productsRes] = await Promise.all([
        fetch('http://localhost:3000/api/purchase-orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/api/suppliers', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/api/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const ordersData = await ordersRes.json();
      const suppliersData = await suppliersRes.json();
      const productsData = await productsRes.json();

      setPurchaseOrders(Array.isArray(ordersData) ? ordersData : []);
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: '', quantity: 1, unit_price: 0 }]
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
        newItems[index].unit_price = product.cost_price || product.unit_price;
      }
    }

    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:3000/api/purchase-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Purchase order created successfully!');
        setShowModal(false);
        setFormData({
          supplier_id: '',
          notes: '',
          items: [{ product_id: '', quantity: 1, unit_price: 0 }]
        });
        fetchData();
      } else {
        const error = await response.json();
        alert('Failed to create order: ' + (error.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error creating purchase order:', err);
      alert('Failed to create purchase order');
    }
  };

  const handleReceiveStock = async (orderId) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:3000/api/purchase-orders/${orderId}/receive`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Stock received successfully!');
        setShowReceiveModal(false);
        fetchData();
      } else {
        const error = await response.json();
        alert('Failed to receive stock: ' + (error.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error receiving stock:', err);
      alert('Failed to receive stock');
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:3000/api/purchase-orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        alert(`Order status updated to ${status}`);
        fetchData();
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0.00';
    return `$${parseFloat(value).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: { bg: '#f3f4f6', color: '#374151', icon: '📝' },
      sent: { bg: '#dbeafe', color: '#1e40af', icon: '📧' },
      received: { bg: '#d1fae5', color: '#065f46', icon: '✅' },
      cancelled: { bg: '#fee2e2', color: '#991b1b', icon: '❌' }
    };
    const style = styles[status] || styles.draft;
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: style.bg,
        color: style.color
      }}>
        <span>{style.icon}</span>
        {status?.toUpperCase()}
      </span>
    );
  };

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = order.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>📦</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Loading purchase orders...</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: '1400px', margin: '0 auto' }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>
            Purchase Orders
          </h1>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Manage supplier orders and track inventory
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(99,102,241,0.3)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <span style={{ fontSize: '18px' }}>➕</span>
          New Purchase Order
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '8px 16px',
            transition: 'all 0.2s'
          }}>
            <span style={{ fontSize: '16px', marginRight: '8px', color: '#9ca3af' }}>🔍</span>
            <input
              type="text"
              placeholder="Search by PO number or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                background: 'transparent'
              }}
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '8px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '14px',
            background: 'white',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="received">Received</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Purchase Orders Table */}
      {filteredOrders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>No purchase orders found</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Click "New Purchase Order" to create your first order.</div>
        </div>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>PO #</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Supplier</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Date</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Total</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '16px', fontWeight: '500' }}>{order.po_number}</td>
                    <td style={{ padding: '16px' }}>{order.supplier_name}</td>
                    <td style={{ padding: '16px' }}>{formatDate(order.order_date)}</td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>{formatCurrency(order.total_amount)}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>{getStatusBadge(order.status)}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {order.status === 'draft' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'sent')}
                            style={{
                              padding: '6px 12px',
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Send
                          </button>
                        )}
                        {order.status === 'sent' && (
                          <button
                            onClick={() => {
                              setSelectedReceiveOrder(order);
                              setShowReceiveModal(true);
                            }}
                            style={{
                              padding: '6px 12px',
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Receive
                          </button>
                        )}
                        {order.status === 'draft' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                            style={{
                              padding: '6px 12px',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                          }}
                          style={{
                            padding: '6px 12px',
                            background: '#f3f4f6',
                            color: '#374151',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Purchase Order Modal */}
      <AnimatePresence>
        {showModal && (
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'white',
                borderRadius: '20px',
                width: '700px',
                maxWidth: '90%',
                maxHeight: '85%',
                overflow: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Create Purchase Order</h2>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                    Supplier *
                  </label>
                  <select
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                    Order Items
                  </label>
                  {formData.items.map((item, index) => {
                    const product = products.find(p => p.id === parseInt(item.product_id));
                    const total = item.quantity * item.unit_price;
                    return (
                      <div key={index} style={{
                        marginBottom: '12px',
                        padding: '12px',
                        background: '#f9fafb',
                        borderRadius: '12px'
                      }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <select
                            value={item.product_id}
                            onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                            required
                            style={{ flex: 2, padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
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
                            style={{ width: '100px', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px', textAlign: 'center' }}
                          />
                          <input
                            type="number"
                            placeholder="Unit Price"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            step="0.01"
                            required
                            style={{ width: '120px', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px', textAlign: 'right' }}
                          />
                          <div style={{ width: '100px', padding: '8px', fontWeight: '500', textAlign: 'right' }}>
                            {formatCurrency(total)}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            style={{
                              padding: '8px 12px',
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={handleAddItem}
                    style={{
                      padding: '8px 16px',
                      background: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      marginTop: '8px'
                    }}
                  >
                    + Add Item
                  </button>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
                    placeholder="Additional notes..."
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

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: '10px 20px',
                      background: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Create Order
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receive Stock Modal */}
      <AnimatePresence>
        {showReceiveModal && selectedReceiveOrder && (
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setShowReceiveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'white',
                borderRadius: '20px',
                width: '500px',
                maxWidth: '90%'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                  Receive Stock
                </h3>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                  Confirm receipt of items for PO: {selectedReceiveOrder.po_number}
                </p>
                <div style={{ marginBottom: '20px' }}>
                  <p><strong>Supplier:</strong> {selectedReceiveOrder.supplier_name}</p>
                  <p><strong>Total Amount:</strong> {formatCurrency(selectedReceiveOrder.total_amount)}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    onClick={() => setShowReceiveModal(false)}
                    style={{
                      padding: '10px 20px',
                      background: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReceiveStock(selectedReceiveOrder.id)}
                    style={{
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Confirm Receive
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && !showReceiveModal && (
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'white',
                borderRadius: '20px',
                width: '600px',
                maxWidth: '90%',
                maxHeight: '80%',
                overflow: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                padding: '24px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
                  Purchase Order Details
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#9ca3af'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '24px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>PO Number</div>
                    <div style={{ fontWeight: '600' }}>{selectedOrder.po_number}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Status</div>
                    <div>{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Supplier</div>
                    <div style={{ fontWeight: '600' }}>{selectedOrder.supplier_name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Order Date</div>
                    <div>{formatDate(selectedOrder.order_date)}</div>
                  </div>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Order Items</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Product</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Quantity</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Unit Price</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '12px' }}>{item.product_name}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{item.quantity}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(item.unit_price)}</td>
                          <td style={{ padding: '12px', textAlign: 'right', fontWeight: '500' }}>{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: '2px solid #e5e7eb', fontWeight: 'bold' }}>
                        <td colSpan="3" style={{ padding: '12px', textAlign: 'right' }}>Total Amount:</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontSize: '18px', color: '#6366f1' }}>
                          {formatCurrency(selectedOrder.total_amount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {selectedOrder.notes && (
                  <div style={{ marginTop: '24px', padding: '12px', background: '#f9fafb', borderRadius: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Notes</div>
                    <div style={{ fontSize: '14px' }}>{selectedOrder.notes}</div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    style={{
                      padding: '10px 20px',
                      background: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PurchaseOrders;