import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getBOMs, deleteBOM } from '../../services/production';

const BOMList = () => {
  const navigate = useNavigate();
  const [boms, setBOMs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBOMs();
  }, []);

  const fetchBOMs = async () => {
    try {
      const res = await getBOMs();
      setBOMs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this BOM? This cannot be undone.')) return;
    try {
      await deleteBOM(id);
      fetchBOMs();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete BOM');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Loading BOMs...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <button onClick={() => navigate('/production')} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', marginBottom: '12px' }}>← Back to Production</button>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>Bill of Materials</h1>
          <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0' }}>Manage product recipes and raw material requirements</p>
        </div>
        <button onClick={() => navigate('/production/boms/new')} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>+ New BOM</button>
      </div>

      {boms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>No BOMs created yet</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Click "New BOM" to get started.</div>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '16px', textAlign: 'left' }}>BOM Number</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Product</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>SKU</th>
                  <th style={{ padding: '16px', textAlign: 'center' }}>Version</th>
                  <th style={{ padding: '16px', textAlign: 'center' }}>Items</th>
                  <th style={{ padding: '16px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {boms.map(bom => (
                  <tr key={bom.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '16px', fontWeight: '500' }}>BOM-{String(bom.id).padStart(4, '0')}</td>
                    <td style={{ padding: '16px' }}>{bom.product_name || 'N/A'}</td>
                    <td style={{ padding: '16px', color: '#6b7280' }}>{bom.sku || '-'}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>v{bom.version}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>{bom.items_count}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: bom.is_active ? '#d1fae5' : '#f3f4f6', color: bom.is_active ? '#065f46' : '#6b7280' }}>{bom.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button onClick={() => navigate(`/production/boms/${bom.id}`)} style={{ padding: '6px 12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>View</button>
                        <button onClick={() => navigate(`/production/boms/${bom.id}/edit`)} style={{ padding: '6px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => handleDelete(bom.id)} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Delete</button>
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

export default BOMList;
