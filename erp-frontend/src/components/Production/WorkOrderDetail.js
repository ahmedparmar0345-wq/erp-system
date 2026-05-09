import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getWorkOrder, startWorkOrder, produceWorkOrder, completeWorkOrder, cancelWorkOrder, calculateProductionCost } from '../../services/production';
import { useNavigate, useParams } from 'react-router-dom';

const WorkOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wo, setWO] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProduceModal, setShowProduceModal] = useState(false);
  const [produceQty, setProduceQty] = useState(1);
  const [defectiveQty, setDefectiveQty] = useState(0);
  const [produceNotes, setProduceNotes] = useState('');
  const [costData, setCostData] = useState(null);

  useEffect(() => {
    loadWorkOrder();
  }, [id]);

  const loadWorkOrder = async () => {
    try {
      const res = await getWorkOrder(id);
      setWO(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!window.confirm('Start this work order?')) return;
    try {
      await startWorkOrder(id);
      loadWorkOrder();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to start');
    }
  };

  const handleProduce = async (e) => {
    e.preventDefault();
    try {
      await produceWorkOrder(id, {
        quantity_produced: parseInt(produceQty),
        quantity_defective: parseInt(defectiveQty),
        notes: produceNotes
      });
      setShowProduceModal(false);
      setProduceQty(1);
      setDefectiveQty(0);
      setProduceNotes('');
      loadWorkOrder();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to record production');
    }
  };

  const handleComplete = async () => {
    if (!window.confirm('Complete this work order?')) return;
    try {
      await completeWorkOrder(id);
      loadWorkOrder();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to complete');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this work order?')) return;
    try {
      await cancelWorkOrder(id);
      loadWorkOrder();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel');
    }
  };

  const loadCost = async () => {
    try {
      const res = await calculateProductionCost(id);
      setCostData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

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
    return <div style={{ textAlign: 'center', padding: '60px' }}>Loading work order...</div>;
  }

  if (!wo) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Work order not found</div>;
  }

  const progress = wo.quantity_planned > 0 ? Math.round((wo.quantity_produced / wo.quantity_planned) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <button onClick={() => navigate('/production/work-orders')} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', marginBottom: '12px' }}>← Back to Work Orders</button>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>{wo.work_order_number}</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={loadWorkOrder} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>Refresh</button>
          {wo.status === 'planned' && <button onClick={handleStart} style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>Start</button>}
          {wo.status === 'in_progress' && (
            <>
              <button onClick={() => setShowProduceModal(true)} style={{ padding: '8px 16px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>Record Production</button>
              <button onClick={handleComplete} style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>Complete</button>
            </>
          )}
          {['planned', 'in_progress'].includes(wo.status) && <button onClick={handleCancel} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>}
          <button onClick={loadCost} style={{ padding: '8px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>Calculate Cost</button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Work Order Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
          <div><strong style={{ color: '#374151' }}>Product:</strong> {wo.product_name}</div>
          <div><strong style={{ color: '#374151' }}>BOM:</strong> {wo.bom_name || 'N/A'}</div>
          <div><strong style={{ color: '#374151' }}>Planned Qty:</strong> {wo.quantity_planned}</div>
          <div><strong style={{ color: '#374151' }}>Produced:</strong> {wo.quantity_produced}</div>
          <div><strong style={{ color: '#374151' }}>Defective:</strong> <span style={{ color: '#dc2626' }}>{wo.quantity_defective}</span></div>
          <div><strong style={{ color: '#374151' }}>Priority:</strong> {getPriorityBadge(wo.priority)}</div>
          <div><strong style={{ color: '#374151' }}>Status:</strong> {getStatusBadge(wo.status)}</div>
        </div>
        <div style={{ marginTop: '16px' }}>
          <strong style={{ color: '#374151', display: 'block', marginBottom: '8px' }}>Progress:</strong>
          <div style={{ background: '#f3f4f6', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', color: 'white', textAlign: 'center', minWidth: progress > 0 ? '40px' : '0' }}>{progress}%</div>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Materials</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Material</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>SKU</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Required</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Consumed</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Stock</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {wo.materials?.map(mat => (
                <tr key={mat.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '500' }}>{mat.product_name}</td>
                  <td style={{ padding: '12px 16px', color: '#6b7280' }}>{mat.sku}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>{parseFloat(mat.quantity_required).toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>{parseFloat(mat.quantity_consumed).toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>{mat.current_stock || 0}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: parseFloat(mat.quantity_consumed) >= parseFloat(mat.quantity_required) ? '#d1fae5' : '#fef3c7', color: parseFloat(mat.quantity_consumed) >= parseFloat(mat.quantity_required) ? '#065f46' : '#92400e' }}>
                      {parseFloat(mat.quantity_consumed) >= parseFloat(mat.quantity_required) ? 'Consumed' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {costData && (
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Production Cost</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Material Cost</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#059669' }}>${costData.total_material_cost.toFixed(2)}</div>
            </div>
            <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Unit Cost</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#2563eb' }}>${costData.unit_production_cost.toFixed(2)}</div>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Material</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Consumed</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Unit Cost</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {costData.material_breakdown.map((m, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px' }}>{m.raw_material_id}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>{m.quantity_consumed}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>${m.unit_cost.toFixed(2)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>${m.total_cost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Production Log</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Action</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Quantity</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Performed By</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {wo.logs?.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{new Date(log.created_at).toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: '#f3f4f6', color: '#374151' }}>{log.action}</span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>{log.quantity || '-'}</td>
                  <td style={{ padding: '12px 16px' }}>{log.performed_by_name || 'System'}</td>
                  <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '13px' }}>{log.notes}</td>
                </tr>
              ))}
              {(!wo.logs || wo.logs.length === 0) && (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No production logs</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showProduceModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowProduceModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', width: '450px', maxWidth: '90%' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Record Production</h2>
            <form onSubmit={handleProduce}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Quantity Produced *</label>
                <input type="number" min="1" max={wo.quantity_planned - wo.quantity_produced} value={produceQty} onChange={e => setProduceQty(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Remaining: {wo.quantity_planned - wo.quantity_produced}</div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Defective Quantity</label>
                <input type="number" min="0" value={defectiveQty} onChange={e => setDefectiveQty(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Notes</label>
                <textarea value={produceNotes} onChange={e => setProduceNotes(e.target.value)} rows={3} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', resize: 'vertical' }}></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowProduceModal(false)} style={{ padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default WorkOrderDetail;
