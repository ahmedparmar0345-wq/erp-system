import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getWorkOrders, getBOMs, getAvailableStock } from '../../services/production';

const ProductionDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ active: 0, completed: 0, totalProduced: 0 });
  const [workOrders, setWorkOrders] = useState([]);
  const [lowStockBOMs, setLowStockBOMs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [woRes, bomRes] = await Promise.all([
          getWorkOrders(),
          getBOMs()
        ]);
        setWorkOrders(woRes.data);

        const active = woRes.data.filter(w => w.status === 'in_progress').length;
        const completed = woRes.data.filter(w => w.status === 'completed').length;
        const totalProduced = woRes.data.reduce((sum, w) => sum + (w.quantity_produced || 0), 0);

        setStats({ active, completed, totalProduced });

        for (const bom of bomRes.data) {
          try {
            const stockRes = await getAvailableStock(bom.id);
            if (stockRes.data.max_producible === 0) {
              setLowStockBOMs(prev => [...prev, { ...bom, max_producible: 0 }]);
            }
          } catch (err) {}
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const productionByProduct = workOrders.filter(w => w.status === 'completed').reduce((acc, wo) => {
    const name = wo.product_name || 'Unknown';
    acc[name] = (acc[name] || 0) + (wo.quantity_produced || 0);
    return acc;
  }, {});

  const maxProduced = Math.max(...Object.values(productionByProduct), 1);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Loading production dashboard...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <button onClick={() => navigate('/production')} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', marginBottom: '12px' }}>← Back to Production</button>
        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>Production Dashboard</h1>
        <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0' }}>Overview of production activities</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Active Work Orders</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#6366f1' }}>{stats.active}</div>
        </div>
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Completed (All Time)</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>{stats.completed}</div>
        </div>
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Produced Units</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>{stats.totalProduced}</div>
        </div>
      </div>

      {Object.keys(productionByProduct).length > 0 && (
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Production by Product</h3>
          {Object.entries(productionByProduct).map(([product, qty]) => (
            <div key={product} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ width: '150px', fontSize: '13px', color: '#374151' }}>{product}</span>
              <div style={{ flex: 1, background: '#f3f4f6', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${(qty / maxProduced) * 100}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', color: 'white', whiteSpace: 'nowrap', minWidth: qty > 0 ? '40px' : '0' }}>{qty}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Active Work Orders</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>WO #</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Product</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Progress</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.filter(w => w.status === 'in_progress').map(wo => {
                const progress = wo.quantity_planned > 0 ? Math.round((wo.quantity_produced / wo.quantity_planned) * 100) : 0;
                return (
                  <tr key={wo.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{wo.work_order_number}</td>
                    <td style={{ padding: '12px 16px' }}>{wo.product_name}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, background: '#f3f4f6', borderRadius: '8px', overflow: 'hidden', maxWidth: '200px' }}>
                          <div style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', color: 'white', textAlign: 'center', minWidth: progress > 0 ? '32px' : '0' }}>{progress}%</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: '#dbeafe', color: '#1e40af' }}>{wo.status}</span>
                    </td>
                  </tr>
                );
              })}
              {workOrders.filter(w => w.status === 'in_progress').length === 0 && (
                <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No active work orders</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {lowStockBOMs.length > 0 && (
        <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #fecaca', marginTop: '24px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #fecaca', background: '#fef2f2' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#991b1b' }}>Low Stock Alerts - Cannot Produce</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>BOM</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Product</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Max Producible</th>
                </tr>
              </thead>
              <tbody>
                {lowStockBOMs.map(bom => (
                  <tr key={bom.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>BOM-{String(bom.id).padStart(4, '0')}</td>
                    <td style={{ padding: '12px 16px' }}>{bom.product_name}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#dc2626', fontWeight: '500' }}>{bom.max_producible} units</td>
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

export default ProductionDashboard;
