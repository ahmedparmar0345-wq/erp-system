import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const LeaveRequestsList = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hr/leave-requests');
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this leave request?')) return;
    try {
      await api.patch(`/hr/leave-requests/${id}/approve`);
      alert('Leave request approved');
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert('Failed to approve: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this leave request?')) return;
    try {
      await api.patch(`/hr/leave-requests/${id}/reject`);
      alert('Leave request rejected');
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert('Failed to reject: ' + (err.response?.data?.error || err.message));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const statusBadge = (status) => {
    const colors = { pending: { bg: '#fef3c7', color: '#92400e' }, approved: { bg: '#d1fae5', color: '#065f46' }, rejected: { bg: '#fee2e2', color: '#991b1b' } };
    const s = colors[status] || colors.pending;
    return <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: s.bg, color: s.color }}>{status}</span>;
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ fontSize: '40px', marginBottom: '16px' }}>📋</motion.div>
          <div style={{ fontSize: '14px', color: '#666' }}>Loading leave requests...</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <style>{`
        @media (max-width: 768px) {
          .lr-header { flex-direction: column; align-items: stretch !important; }
          .lr-header h1 { text-align: center; }
          .lr-stats { grid-template-columns: 1fr 1fr !important; }
          .lr-actions-wrap { flex-wrap: wrap; }
          .lr-actions-wrap button { flex: 1; min-width: 80px; text-align: center; }
        }
      `}</style>

      <div className="lr-header" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate('/hr')} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: 13, whiteSpace: 'nowrap' }}>← Dashboard</button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0, background: 'linear-gradient(135deg, #1a1a2e, #16213e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Leave Requests</h1>
          <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0' }}>Manage and approve employee leave requests</p>
        </div>
        <button onClick={() => navigate('/hr/leaves/new')} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap' }}>+ New Request</button>
      </div>

      <div className="lr-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #e5e7eb', cursor: 'pointer', ...(filter === 'all' ? { borderColor: '#6366f1', boxShadow: '0 0 0 2px rgba(99,102,241,0.2)' } : {}) }} onClick={() => setFilter('all')}>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Requests</div>
          <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px' }}>{stats.total}</div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #e5e7eb', cursor: 'pointer', ...(filter === 'pending' ? { borderColor: '#f59e0b', boxShadow: '0 0 0 2px rgba(245,158,11,0.2)' } : {}) }} onClick={() => setFilter('pending')}>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Pending</div>
          <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px', color: '#f59e0b' }}>{stats.pending}</div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #e5e7eb', cursor: 'pointer', ...(filter === 'approved' ? { borderColor: '#10b981', boxShadow: '0 0 0 2px rgba(16,185,129,0.2)' } : {}) }} onClick={() => setFilter('approved')}>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Approved</div>
          <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px', color: '#10b981' }}>{stats.approved}</div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #e5e7eb', cursor: 'pointer', ...(filter === 'rejected' ? { borderColor: '#ef4444', boxShadow: '0 0 0 2px rgba(239,68,68,0.2)' } : {}) }} onClick={() => setFilter('rejected')}>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Rejected</div>
          <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px', color: '#ef4444' }}>{stats.rejected}</div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '24px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>No leave requests found</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Click "+ New Request" to create a leave request.</div>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Employee</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Leave Type</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Duration</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Days</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td data-label="Employee" style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '600' }}>{r.first_name} {r.last_name}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>{r.employee_code}</div>
                      {r.reason && <div style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic', marginTop: 2 }}>"{r.reason}"</div>}
                    </td>
                    <td data-label="Leave Type" style={{ padding: '16px' }}>{r.leave_type_name || '-'}</td>
                    <td data-label="Duration" style={{ padding: '16px', textAlign: 'center', fontSize: '13px' }}>{formatDate(r.start_date)} - {formatDate(r.end_date)}</td>
                    <td data-label="Days" style={{ padding: '16px', textAlign: 'center', fontWeight: '500' }}>{r.total_days} days</td>
                    <td data-label="Status" style={{ padding: '16px', textAlign: 'center' }}>{statusBadge(r.status)}</td>
                    <td data-label="Actions" style={{ padding: '16px', textAlign: 'center' }}>
                      <div className="lr-actions-wrap" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {r.status === 'pending' && (
                          <>
                            <button onClick={() => handleApprove(r.id)} style={{ padding: '6px 14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Approve</button>
                            <button onClick={() => handleReject(r.id)} style={{ padding: '6px 14px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Reject</button>
                          </>
                        )}
                        {r.status !== 'pending' && (
                          <span style={{ fontSize: '11px', color: '#6b7280' }}>{r.status === 'approved' ? '✅ Approved' : '❌ Rejected'}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default LeaveRequestsList;
