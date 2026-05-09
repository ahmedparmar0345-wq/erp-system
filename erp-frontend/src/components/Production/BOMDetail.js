import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getBOM } from '../../services/production';
import { useNavigate, useParams } from 'react-router-dom';

const BOMDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bom, setBOM] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBOM = async () => {
      try {
        const res = await getBOM(id);
        setBOM(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadBOM();
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Loading BOM...</div>;
  }

  if (!bom) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>BOM not found</div>;
  }

  const totalCost = bom.items?.reduce((sum, item) => sum + (parseFloat(item.quantity) * parseFloat(item.unit_cost || 0)), 0) || 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <button onClick={() => navigate('/production/boms')} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', marginBottom: '12px' }}>← Back to BOMs</button>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>BOM-{String(bom.id).padStart(4, '0')}: {bom.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => navigate(`/production/boms/${bom.id}/edit`)} style={{ padding: '10px 20px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>Edit</button>
          <button onClick={() => navigate(`/production/work-orders/new?bom_id=${bom.id}`)} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>Create Work Order</button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Product Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
          <div><strong style={{ color: '#374151' }}>Finished Good:</strong> {bom.product_name}</div>
          <div><strong style={{ color: '#374151' }}>SKU:</strong> {bom.sku || '-'}</div>
          <div><strong style={{ color: '#374151' }}>Version:</strong> v{bom.version}</div>
          <div>
            <strong style={{ color: '#374151' }}>Status:</strong>{' '}
            <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: bom.is_active ? '#d1fae5' : '#f3f4f6', color: bom.is_active ? '#065f46' : '#6b7280' }}>{bom.is_active ? 'Active' : 'Inactive'}</span>
          </div>
          {bom.notes && <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: '#374151' }}>Notes:</strong> {bom.notes}</div>}
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Raw Materials ({bom.items?.length || 0} items)</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Material</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>SKU</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Quantity</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Unit Cost</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Wastage %</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Current Stock</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Row Cost</th>
              </tr>
            </thead>
            <tbody>
              {bom.items?.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '500' }}>{item.product_name || 'N/A'}</td>
                  <td style={{ padding: '12px 16px', color: '#6b7280' }}>{item.sku || '-'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>${parseFloat(item.unit_cost || 0).toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.wastage_percent}%</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', color: parseFloat(item.current_stock) < item.quantity ? '#dc2626' : undefined, fontWeight: parseFloat(item.current_stock) < item.quantity ? '500' : undefined }}>{item.current_stock || 0}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>${(parseFloat(item.quantity) * parseFloat(item.unit_cost || 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f9fafb', fontWeight: 'bold' }}>
                <td colSpan={6} style={{ padding: '12px 16px', textAlign: 'right' }}>Total Cost per Unit:</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: '#059669' }}>${totalCost.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default BOMDetail;
