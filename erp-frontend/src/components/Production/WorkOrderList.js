import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getWorkOrders, startWorkOrder, completeWorkOrder, cancelWorkOrder } from '../../services/production';

const WorkOrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await getWorkOrders();
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (id) => {
    if (!window.confirm('Start this work order?')) return;
    try {
      await startWorkOrder(id);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to start');
    }
  };

  const handleComplete = async (id) => {
    if (!window.confirm('Complete this work order?')) return;
    try {
      await completeWorkOrder(id);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to complete');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this work order?')) return;
    try {
      await cancelWorkOrder(id);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel');
    }
  };

  const filtered = orders.filter(o => {
    if (filterStatus && o.status !== filterStatus) return false;
    if (filterDate && !o.created_at?.startsWith(filterDate)) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    const badges = {
      planned: { bg: '#fef3c7', color: '#92400e', label: 'Planned' },
      in_progress: { bg: '#dbeafe', color: '#1e40af', label: 'In Progress' },
      completed: { bg: '#d1fae5', color: '#065f46', label: 'Completed' },
      cancelled: { bg: '#f3f4f6', color: '#6b7280', label: 'Cancelled' }
    };
    const badge = badges[status] || badges.planned;
    return <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: badge.bg, color: badge.color }}>{badge.label}</span>;
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      low: { bg: '#f3f4f6', color: '#6b7280' },
      normal: { bg: '#dbeafe', color: '#1e40af' },
      high: { bg: '#fef3c7', color: '#92400e' },
      urgent: { bg: '#fee2e2', color: '#991b1b' }
    };
    const c = colors[priority] || colors.normal;
    return <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: c.bg, color: c.color }}>{priority}</span>;
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Loading work orders...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <button onClick={() => navigate('/production')} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', marginBottom: '12px' }}>← Back to Production</button>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>Work Orders</h1>
          <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0' }}>Manage production work orders</p>
        </div>
        <button onClick={() => navigate('/production/work-orders/new')} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>+ New Work Order</button>
      </div>

      <div style={{ display: 'flex', gap: '16px', background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '24px', border: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Status</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <option value="">All</option>
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Date</label>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏭</div>
          <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>No work orders found</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Click "New Work Order" to create one.</div>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Work Order #</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Product</th>
                  <th style={{ padding: '16px', textAlign: 'center' }}>Planned</th>
                  <th style={{ padding: '16px', textAlign: 'center' }}>Produced</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Progress</th>
                  <th style={{ padding: '16px', textAlign: 'center' }}>Priority</th>
                  <th style={{ padding: '16px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(wo => {
                  const progress = wo.quantity_planned > 0 ? Math.round((wo.quantity_produced / wo.quantity_planned) * 100) : 0;
                  return (
                    <tr key={wo.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '16px', fontWeight: '500' }}>{wo.work_order_number}</td>
                      <td style={{ padding: '16px' }}>{wo.product_name}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>{wo.quantity_planned}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>{wo.quantity_produced}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, background: '#f3f4f6', borderRadius: '8px', overflow: 'hidden', maxWidth: '150px' }}>
                            <div style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', color: 'white', textAlign: 'center', minWidth: progress > 0 ? '32px' : '0' }}>{progress}%</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>{getPriorityBadge(wo.priority)}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>{getStatusBadge(wo.status)}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button onClick={() => navigate(`/production/work-orders/${wo.id}`)} style={{ padding: '6px 12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>View</button>
                          {wo.status === 'planned' && <button onClick={() => handleStart(wo.id)} style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Start</button>}
                          {wo.status === 'in_progress' && <button onClick={() => handleComplete(wo.id)} style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Complete</button>}
                          {['planned', 'in_progress'].includes(wo.status) && <button onClick={() => handleCancel(wo.id)} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default WorkOrderList;
