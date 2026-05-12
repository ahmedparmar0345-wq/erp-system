import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const VoucherList = () => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/accounting/vouchers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setVouchers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching vouchers:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0.00';
    return `$${parseFloat(value).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getVoucherTypeConfig = (type) => {
    const configs = {
      Payment: {
        icon: '💸',
        bgGradient: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        borderColor: '#ef4444',
        textColor: '#991b1b',
        accentColor: '#ef4444'
      },
      Receipt: {
        icon: '📥',
        bgGradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        borderColor: '#10b981',
        textColor: '#065f46',
        accentColor: '#10b981'
      },
      Journal: {
        icon: '📓',
        bgGradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        borderColor: '#3b82f6',
        textColor: '#1e40af',
        accentColor: '#3b82f6'
      },
      Contra: {
        icon: '🔄',
        bgGradient: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
        borderColor: '#8b5cf6',
        textColor: '#6b21a5',
        accentColor: '#8b5cf6'
      }
    };
    return configs[type] || configs.Payment;
  };

  const getStatusConfig = (status) => {
    const configs = {
      draft: { label: 'Draft', icon: '📝', bg: '#f3f4f6', color: '#374151' },
      approved: { label: 'Approved', icon: '✅', bg: '#d1fae5', color: '#065f46' },
      posted: { label: 'Posted', icon: '✓', bg: '#d1fae5', color: '#065f46' },
      cancelled: { label: 'Cancelled', icon: '❌', bg: '#fee2e2', color: '#991b1b' }
    };
    return configs[status] || configs.draft;
  };

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = voucher.voucher_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || voucher.voucher_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || voucher.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: vouchers.length,
    totalAmount: vouchers.reduce((sum, v) => sum + (parseFloat(v.total_debit) || 0), 0),
    paymentCount: vouchers.filter(v => v.voucher_type === 'Payment').length,
    receiptCount: vouchers.filter(v => v.voucher_type === 'Receipt').length
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: '32px', marginBottom: '16px' }}
          >
            ⭕
          </motion.div>
          <div style={{ fontSize: '14px', color: '#666' }}>Loading vouchers...</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="vl-container"
      style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}
    >
      <style>{`
        @media (max-width: 768px) {
          .vl-stats { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)) !important; gap: 12px !important; }
          .vl-filter { flex-direction: column !important; align-items: stretch !important; }
          .vl-filter > div, .vl-filter select, .vl-filter button { width: 100% !important; }
          .vl-cards { grid-template-columns: 1fr !important; gap: 16px !important; }
          .vl-hero h1 { font-size: 24px !important; }
        }
        @media (max-width: 480px) {
          .vl-container { padding: 0 12px !important; }
          .vl-stats { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          .vl-stats > div { padding: 12px !important; }
          .vl-stats > div > div > div:last-child { font-size: 20px !important; }
          .vl-empty { padding: 40px 20px !important; }
          .vl-card-footer { flex-direction: column !important; gap: 8px !important; }
          .vl-card-footer > div:last-child { flex-wrap: wrap !important; }
        }
      `}</style>
      {/* Hero Section */}
      <div className="vl-hero" style={{ marginBottom: '32px' }}>
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: '700', marginBottom: '8px', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          Vouchers
        </motion.h1>
        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', color: '#666' }}
        >
          Manage payment, receipt, journal, and contra vouchers with ease
        </motion.p>
      </div>

      {/* Stats Row */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}
        className="vl-stats"
      >
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Total Vouchers</div>
              <div style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: '700', color: '#1f2937' }}>{stats.total}</div>
            </div>
            <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📄</div>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Total Amount</div>
              <div style={{ fontSize: 'clamp(18px, 4vw, 32px)', fontWeight: '700', color: '#10b981' }}>{formatCurrency(stats.totalAmount)}</div>
            </div>
            <div style={{ width: '48px', height: '48px', background: '#d1fae5', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>💰</div>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Payment Vouchers</div>
              <div style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: '700', color: '#ef4444' }}>{stats.paymentCount}</div>
            </div>
            <div style={{ width: '48px', height: '48px', background: '#fee2e2', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>💸</div>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Receipt Vouchers</div>
              <div style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: '700', color: '#10b981' }}>{stats.receiptCount}</div>
            </div>
            <div style={{ width: '48px', height: '48px', background: '#d1fae5', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📥</div>
          </div>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '32px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
        className="vl-filter"
      >
        <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '8px', background: '#f9fafb', borderRadius: '12px', padding: '8px 16px', border: '1px solid #e5e7eb' }}>
          <span style={{ fontSize: '16px', color: '#9ca3af' }}>🔍</span>
          <input
            type="text"
            placeholder="Search by voucher number or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 'clamp(12px, 2.5vw, 14px)' }}
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', background: '#f9fafb', outline: 'none', cursor: 'pointer' }}
        >
          <option value="all">All Types</option>
          <option value="Payment">💸 Payment</option>
          <option value="Receipt">📥 Receipt</option>
          <option value="Journal">📓 Journal</option>
          <option value="Contra">🔄 Contra</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', background: '#f9fafb', outline: 'none', cursor: 'pointer' }}
        >
          <option value="all">All Status</option>
          <option value="draft">📝 Draft</option>
          <option value="approved">✅ Approved</option>
          <option value="cancelled">❌ Cancelled</option>
        </select>
        <button
          onClick={() => navigate('/vouchers/create')}
          style={{
            padding: '10px 24px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '16px' }}>+</span> New Voucher
        </button>
      </motion.div>

      {/* Vouchers Grid */}
      {filteredVouchers.length === 0 ? (
        <motion.div
          className="vl-empty"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            textAlign: 'center',
            padding: 'clamp(40px, 8vw, 80px)',
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ fontSize: 'clamp(40px, 10vw, 64px)', marginBottom: '16px' }}>📄</div>
          <div style={{ fontSize: 'clamp(16px, 3.5vw, 20px)', fontWeight: '500', marginBottom: '8px' }}>No vouchers found</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Create your first voucher by clicking the "New Voucher" button.</div>
        </motion.div>
      ) : (
        <div className="vl-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: 'clamp(16px, 3vw, 24px)' }}>
          <AnimatePresence>
            {filteredVouchers.map((voucher, index) => {
              const typeConfig = getVoucherTypeConfig(voucher.voucher_type);
              const statusConfig = getStatusConfig(voucher.status);
              return (
                <motion.div
                  key={voucher.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  style={{
                    background: 'white',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {/* Card Header */}
                  <div style={{
                    background: typeConfig.bgGradient,
                    padding: 'clamp(12px, 2.5vw, 16px) clamp(16px, 3vw, 20px)',
                    borderBottom: `2px solid ${typeConfig.borderColor}20`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: `${typeConfig.accentColor}15`,
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                      }}>
                        {typeConfig.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: typeConfig.textColor }}>
                          {voucher.voucher_type} Voucher
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                          {voucher.voucher_no}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      backgroundColor: statusConfig.bg,
                      color: statusConfig.color,
                      fontSize: '11px',
                      fontWeight: '500'
                    }}>
                      <span>{statusConfig.icon}</span>
                      {statusConfig.label}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: 'clamp(16px, 3vw, 20px)' }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1 0 120px' }}>
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Date</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{formatDate(voucher.entry_date)}</div>
                      </div>
                      {voucher.description && (
                        <div style={{ flex: 2 }}>
                          <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Description</div>
                          <div style={{ fontSize: 'clamp(12px, 2.5vw, 13px)', color: '#4b5563', lineHeight: '1.4', wordBreak: 'break-word' }}>{voucher.description}</div>
                        </div>
                      )}
                    </div>

                    {/* Amounts */}
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      paddingTop: '12px',
                      borderTop: '1px solid #e5e7eb'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '2px' }}>Total Debit</div>
                        <div style={{ fontSize: 'clamp(15px, 3.5vw, 18px)', fontWeight: '700', color: '#ef4444' }}>
                          {formatCurrency(voucher.total_debit)}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '2px' }}>Total Credit</div>
                        <div style={{ fontSize: 'clamp(15px, 3.5vw, 18px)', fontWeight: '700', color: '#10b981' }}>
                          {formatCurrency(voucher.total_credit)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="vl-card-footer" style={{
                    padding: 'clamp(10px, 2vw, 12px) clamp(16px, 3vw, 20px)',
                    background: '#f9fafb',
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                      Created: {formatDate(voucher.created_at)}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => navigate(`/vouchers/${voucher.id}`)}
                        style={{
                          padding: '6px 14px',
                          background: 'white',
                          color: '#374151',
                          border: '1px solid #e5e7eb',
                          borderRadius: '20px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
                      >
                        View Details
                      </button>
                      {voucher.status === 'draft' && (
                        <button
                          onClick={async () => {
                            const token = localStorage.getItem('token');
                            await fetch(`/api/accounting/vouchers/${voucher.id}/approve`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                              body: JSON.stringify({ signature: 'Approved digitally' })
                            });
                            fetchVouchers();
                            alert('Voucher approved!');
                          }}
                          style={{
                            padding: '6px 14px',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => window.open(`/vouchers/${voucher.id}/printOutput`, '_blank')}
                        style={{
                          padding: '6px 14px',
                          background: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '20px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Print
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default VoucherList;