import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createWorkOrder, getMaterialRequirements, getBOMs } from '../../services/production';
import { useNavigate } from 'react-router-dom';

const WorkOrderForm = () => {
  const navigate = useNavigate();
  const [boms, setBOMs] = useState([]);
  const [selectedBOM, setSelectedBOM] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [priority, setPriority] = useState('normal');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [requirements, setRequirements] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBOMs = async () => {
      try {
        const res = await getBOMs();
        setBOMs(res.data.filter(b => b.is_active));
      } catch (err) {
        console.error(err);
      }
    };
    fetchBOMs();
  }, []);

  useEffect(() => {
    if (selectedBOM && quantity > 0) {
      fetchRequirements(selectedBOM, quantity);
    }
  }, [selectedBOM, quantity]);

  const fetchRequirements = async (bomId, qty) => {
    try {
      const res = await getMaterialRequirements(bomId, qty);
      setRequirements(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBOM || !quantity) {
      alert('Please select a BOM and enter quantity');
      return;
    }
    setLoading(true);
    try {
      const bom = boms.find(b => b.id === parseInt(selectedBOM));
      const data = {
        bom_id: parseInt(selectedBOM),
        product_id: bom?.product_id,
        quantity_planned: parseInt(quantity),
        priority,
        start_date: startDate,
        notes
      };
      await createWorkOrder(data);
      navigate('/production/work-orders');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create work order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <button onClick={() => navigate('/production/work-orders')} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', marginBottom: '12px' }}>← Back to Work Orders</button>
        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>Create Work Order</h1>
        <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0' }}>Create a new production work order</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Select BOM *</label>
              <select value={selectedBOM} onChange={e => setSelectedBOM(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <option value="">Choose BOM</option>
                {boms.map(b => (
                  <option key={b.id} value={b.id}>BOM-{String(b.id).padStart(4, '0')} - {b.product_name} (v{b.version})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Quantity Planned *</label>
              <input type="number" min="1" value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} required style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            </div>
          </div>
        </div>

        {requirements && (
          <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Material Requirements Preview</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Material</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>SKU</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Required</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Current Stock</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Shortage</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Est. Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {requirements.requirements.map((req, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '500' }}>{req.product_name}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280' }}>{req.sku}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>{req.required_quantity.toFixed(2)}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>{req.current_stock}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: req.available ? '#d1fae5' : '#fee2e2', color: req.available ? '#065f46' : '#991b1b' }}>
                          {req.available ? 'Available' : 'Insufficient'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: req.shortage > 0 ? '#dc2626' : undefined, fontWeight: req.shortage > 0 ? '500' : undefined }}>{req.shortage > 0 ? req.shortage.toFixed(2) : '-'}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>${req.estimated_cost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#f9fafb', fontWeight: 'bold' }}>
                    <td colSpan={6} style={{ padding: '12px 16px', textAlign: 'right' }}>Total Estimated Cost:</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#059669' }}>${requirements.total_estimated_cost.toFixed(2)}</td>
                  </tr>
                  <tr style={{ background: '#f9fafb' }}>
                    <td colSpan={7} style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: requirements.can_produce ? '#d1fae5' : '#fee2e2', color: requirements.can_produce ? '#065f46' : '#991b1b' }}>
                        {requirements.can_produce ? 'All materials available' : 'Insufficient materials for production'}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', resize: 'vertical' }}></textarea>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" onClick={() => navigate('/production/work-orders')} style={{ padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating...' : 'Create Work Order'}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default WorkOrderForm;
