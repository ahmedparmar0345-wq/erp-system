import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [formData, setFormData] = useState({
    expense_date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    amount: '',
    payment_method: 'Cash',
    reference_number: ''
  });

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, [dateRange]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/expenses?start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/expenses/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const url = editingExpense
        ? `/api/expenses/${editingExpense.id}`
        : '/api/expenses';
      const method = editingExpense ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(editingExpense ? 'Expense updated successfully!' : 'Expense added successfully!');
        setShowModal(false);
        resetForm();
        fetchExpenses();
      } else {
        const error = await response.json();
        alert('Failed to save expense: ' + (error.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error saving expense:', err);
      alert('Failed to save expense');
    }
  };

  const handleDelete = async (id, description) => {
    if (!window.confirm(`Delete expense "${description}"? This cannot be undone.`)) return;

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Expense deleted successfully!');
        fetchExpenses();
      } else {
        const error = await response.json();
        alert('Failed to delete: ' + (error.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
      alert('Failed to delete expense');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      expense_date: expense.expense_date || new Date().toISOString().split('T')[0],
      category: expense.category || '',
      description: expense.description || '',
      amount: expense.amount || '',
      payment_method: expense.payment_method || 'Cash',
      reference_number: expense.reference_number || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingExpense(null);
    setFormData({
      expense_date: new Date().toISOString().split('T')[0],
      category: '',
      description: '',
      amount: '',
      payment_method: 'Cash',
      reference_number: ''
    });
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0.00';
    return `$${parseFloat(value).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      Cash: '💵',
      'Credit Card': '💳',
      'Debit Card': '💳',
      'Bank Transfer': '🏦'
    };
    return icons[method] || '💰';
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate totals
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  // Group by category for summary
  const categoryTotals = {};
  filteredExpenses.forEach(expense => {
    const cat = expense.category || 'Uncategorized';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + (parseFloat(expense.amount) || 0);
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>💸</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Loading expenses...</div>
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
      <style>{`
        @media (max-width: 480px) {
          .exp-stats { grid-template-columns: 1fr !important; }
          .exp-table-wrap { overflow: visible; }
          .exp-table-wrap table, .exp-table-wrap thead, .exp-table-wrap tbody,
          .exp-table-wrap tr, .exp-table-wrap td, .exp-table-wrap th { display: block; }
          .exp-table-wrap thead tr { display: none; }
          .exp-table-wrap td {
            display: flex; justify-content: space-between; align-items: center;
            padding: 10px 12px !important;
            border-bottom: 1px solid #e5e7eb;
          }
          .exp-table-wrap td::before {
            content: attr(data-label);
            font-weight: 600; font-size: 11px; color: #6b7280;
            margin-right: 12px; flex-shrink: 0;
          }
          .exp-table-wrap td:last-child { border-bottom: 2px solid #d1d5db; }
          .exp-table-wrap tr { margin-bottom: 10px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
          .exp-modal-inner { width: 95% !important; max-width: 95% !important; padding: 16px !important; }
        }
      `}</style>
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
            Expenses
          </h1>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Track and manage all business expenses
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
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
          Add Expense
        </button>
      </div>

      {/* Stats Cards */}
      <div className="exp-stats" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #ef4444'
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Expenses</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>
            {formatCurrency(totalExpenses)}
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
            {filteredExpenses.length} transactions
          </div>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #f59e0b'
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Average Expense</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>
            {formatCurrency(filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0)}
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
            Per transaction
          </div>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #10b981'
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Top Category</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
            {Object.keys(categoryTotals)[0] || 'N/A'}
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
            {Object.values(categoryTotals)[0] ? formatCurrency(Object.values(categoryTotals)[0]) : '$0'}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
              Search
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '8px 16px'
            }}>
              <span style={{ fontSize: '16px', marginRight: '8px', color: '#9ca3af' }}>🔍</span>
              <input
                type="text"
                placeholder="Search by description or category..."
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
          <div style={{ minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                background: 'white',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
              From Date
            </label>
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
              To Date
            </label>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      {filteredExpenses.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💸</div>
          <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>No expenses found</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Click "Add Expense" to record your first expense.</div>
        </div>
      ) : (
        <div className="exp-table-wrap" style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Date</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Category</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Description</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Payment</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Amount</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td data-label="Date" style={{ padding: '16px' }}>{formatDate(expense.expense_date)}</td>
                    <td data-label="Category" style={{ padding: '16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: '#dbeafe',
                        color: '#1e40af'
                      }}>
                        {expense.category}
                      </span>
                    </td>
                    <td data-label="Description" style={{ padding: '16px' }}>{expense.description || '-'}</td>
                    <td data-label="Payment" style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{ fontSize: '18px' }} title={expense.payment_method}>
                        {getPaymentMethodIcon(expense.payment_method)}
                      </span>
                    </td>
                    <td data-label="Amount" style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#ef4444' }}>
                      {formatCurrency(expense.amount)}
                    </td>
                    <td data-label="" style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEdit(expense)}
                          style={{
                            padding: '6px 12px',
                            background: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id, expense.description)}
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
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f9fafb', borderTop: '2px solid #e5e7eb', fontWeight: 'bold' }}>
                  <td data-label="" colSpan="4" style={{ padding: '16px', textAlign: 'right' }}>Total</td>
                  <td data-label="Amount" style={{ padding: '16px', textAlign: 'right', fontSize: '16px', color: '#ef4444' }}>
                    {formatCurrency(totalExpenses)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Category Summary Section */}
      {Object.keys(categoryTotals).length > 0 && (
        <div style={{
          marginTop: '24px',
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Expense by Category</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(categoryTotals).map(([category, amount]) => {
              const percentage = (amount / totalExpenses) * 100;
              return (
                <div key={category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px', flexWrap: 'wrap', gap: '4px' }}>
                    <span>{category}</span>
                    <span>{formatCurrency(amount)} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div style={{
                    height: '8px',
                    background: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #ef4444, #f59e0b)',
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add/Edit Expense Modal */}
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
                width: '500px',
                maxWidth: '90%',
                maxHeight: '85%',
                overflow: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
              className="exp-modal-inner"
            >
              <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
                  {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                    Expense Date *
                  </label>
                  <input
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter description"
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                    Payment Method
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    <option value="Cash">💵 Cash</option>
                    <option value="Credit Card">💳 Credit Card</option>
                    <option value="Debit Card">💳 Debit Card</option>
                    <option value="Bank Transfer">🏦 Bank Transfer</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={formData.reference_number}
                    onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                    placeholder="Invoice or receipt number"
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
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
                    {editingExpense ? 'Update Expense' : 'Add Expense'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Expenses;