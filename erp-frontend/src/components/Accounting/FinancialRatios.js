import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const FinancialRatios = () => {
  const [ratios, setRatios] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRatios(); }, []);

  const fetchRatios = async () => {
    try {
      setLoading(true);
      const res = await api.get('/accounting-enhancements/reports/financial-ratios');
      setRatios(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <p>Loading ratios...</p>;
  if (!ratios) return <p>Could not load ratios. Ensure journal entries exist.</p>;

  const cards = [
    { label: 'Current Ratio', value: ratios.current_ratio, desc: 'Current Assets / Current Liabilities', good: ratios.current_ratio >= 1.5 },
    { label: 'Quick Ratio', value: ratios.quick_ratio, desc: 'Liquid Assets / Current Liabilities', good: ratios.quick_ratio >= 1 },
    { label: 'Debt to Equity', value: ratios.debt_to_equity, desc: 'Total Liabilities / Total Equity', good: ratios.debt_to_equity <= 1.5 },
    { label: 'Return on Equity', value: ratios.return_on_equity ? `${ratios.return_on_equity}%` : null, desc: 'Net Income / Total Equity × 100', good: parseFloat(ratios.return_on_equity) >= 10 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Financial Ratios</h2>
        <button onClick={fetchRatios} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>🔄 Refresh</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        {cards.map((card, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>{card.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: card.value === null ? '#6b7280' : card.good ? '#10b981' : '#ef4444' }}>
              {card.value ?? 'N/A'}
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{card.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h4 style={{ margin: '0 0 16px' }}>Financial Summary</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { label: 'Total Assets', value: ratios.details?.total_assets, color: '#3b82f6' },
            { label: 'Total Liabilities', value: ratios.details?.total_liabilities, color: '#f59e0b' },
            { label: 'Total Equity', value: ratios.details?.total_equity, color: '#10b981' },
            { label: 'Current Assets', value: ratios.details?.current_assets, color: '#3b82f6' },
            { label: 'Current Liabilities', value: ratios.details?.current_liabilities, color: '#f59e0b' },
            { label: 'Net Income', value: ratios.details?.net_income, color: ratios.details?.net_income >= 0 ? '#10b981' : '#ef4444' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{item.label}</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: item.color }}>
                ${parseFloat(item.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 16 }}>As of: {ratios.as_of_date ? new Date(ratios.as_of_date).toLocaleDateString() : 'Today'}</p>
      </div>
    </motion.div>
  );
};

export default FinancialRatios;
