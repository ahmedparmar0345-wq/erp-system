import React, { useState, useEffect } from 'react';
import { getCustomers, createCustomer } from '../../services/api';

const CustomerLookup = ({ onSelectCustomer }) => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    billing_address: '',
    company_id: 1
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await getCustomers();
      setCustomers(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error loading customers:', err);
      setCustomers([]);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  const handleSelect = (customer) => {
    setSelectedCustomerId(customer.id);
    if (onSelectCustomer && typeof onSelectCustomer === 'function') {
      onSelectCustomer(customer);
    } else {
      console.error('onSelectCustomer is not a function', onSelectCustomer);
    }
  };

  const handleCreateCustomer = async () => {
    try {
      const response = await createCustomer(newCustomer);
      setCustomers([...customers, response]);
      handleSelect(response);
      setShowModal(false);
      setNewCustomer({ name: '', email: '', phone: '', billing_address: '', company_id: 1 });
    } catch (err) {
      console.error('Error creating customer:', err);
      alert('Failed to create customer: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="customer-lookup" style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Search customer by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          + New Customer
        </button>
      </div>

      <div style={{
        maxHeight: '200px',
        overflowY: 'auto',
        border: '1px solid #eee',
        borderRadius: '6px'
      }}>
        {filteredCustomers.length === 0 && searchTerm && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
            No customers found. Click "New Customer" to add one.
          </div>
        )}
        {filteredCustomers.slice(0, 10).map(customer => (
          <div
            key={customer.id}
            onClick={() => handleSelect(customer)}
            style={{
              padding: '10px',
              borderBottom: '1px solid #eee',
              cursor: 'pointer',
              transition: 'background 0.2s',
              backgroundColor: selectedCustomerId === customer.id ? '#e0e7ff' : 'transparent'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedCustomerId === customer.id ? '#e0e7ff' : 'transparent'}
          >
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>{customer.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {customer.email && <span style={{ marginRight: '15px' }}>📧 {customer.email}</span>}
              {customer.phone && <span>📞 {customer.phone}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Modal for creating new customer */}
      {showModal && (
        <div style={{
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
        }} onClick={() => setShowModal(false)}>
           <div style={{
             background: 'white',
             padding: '25px',
             borderRadius: '8px',
             minWidth: '300px',
             maxWidth: '500px',
             width: '90vw'
           }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Quick Add Customer</h3>
            <input
              type="text"
              placeholder="Customer Name *"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
            <input
              type="email"
              placeholder="Email"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
            <input
              type="text"
              placeholder="Phone"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
            <textarea
              placeholder="Billing Address"
              value={newCustomer.billing_address}
              onChange={(e) => setNewCustomer({ ...newCustomer, billing_address: e.target.value })}
              rows="3"
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowModal(false)}
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
                onClick={handleCreateCustomer}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Create Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerLookup;