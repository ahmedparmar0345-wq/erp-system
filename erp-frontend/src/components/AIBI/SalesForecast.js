import React, { useState, useEffect } from 'react';
import { getSalesForecast } from '../../services/aiBi';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const MONTHS = 12;

export default function SalesForecast() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSalesForecast(MONTHS, 3).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 24, fontSize: 18 }}>Loading forecast...</div>;
  if (!data) return <div style={{ padding: 24, color: '#e74c3c' }}>Failed to load forecast data.</div>;

  const allMonths = [...data.historical.map(h => {
    const d = new Date(h.month);
    return d.toLocaleString('default', { month: 'short', year: '2-digit' });
  }), ...(data.forecast || []).map(f => {
    const d = new Date(f.month);
    return d.toLocaleString('default', { month: 'short', year: '2-digit' });
  })];

  const actualRevenue = data.historical.map(h => h.revenue);
  const forecastRevenue = [...new Array(data.historical.length).fill(null), ...(data.forecast || []).map(f => f.revenue ?? null)];
  const actualOrders = data.historical.map(h => h.orders);
  const forecastOrders = [...new Array(data.historical.length).fill(null), ...(data.forecast || []).map(f => f.orders ?? null)];

  const revChart = {
    labels: allMonths,
    datasets: [
      { label: 'Actual Revenue', data: actualRevenue, borderColor: '#3498db', backgroundColor: 'rgba(52,152,219,0.1)', fill: true, tension: 0.3, pointRadius: 4 },
      { label: 'Forecast Revenue', data: forecastRevenue, borderColor: '#e67e22', backgroundColor: 'rgba(230,126,34,0.1)', fill: true, borderDash: [5, 5], tension: 0.3, pointRadius: 4, pointStyle: 'rect' },
    ],
  };

  const ordChart = {
    labels: allMonths,
    datasets: [
      { label: 'Actual Orders', data: actualOrders, borderColor: '#2ecc71', backgroundColor: 'rgba(46,204,113,0.1)', fill: true, tension: 0.3, pointRadius: 4 },
      { label: 'Forecast Orders', data: forecastOrders, borderColor: '#e67e22', backgroundColor: 'rgba(230,126,34,0.1)', fill: true, borderDash: [5, 5], tension: 0.3, pointRadius: 4, pointStyle: 'rect' },
    ],
  };

  const chartOpts = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div style={{ padding: 'clamp(12px, 3vw, 24px)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(16px, 3vw, 24px)' }}>
        <h2>Sales Forecast</h2>
        <div style={{ background: '#fff', borderRadius: 8, padding: '8px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          Model confidence: <strong>{data.confidence != null ? data.confidence + '%' : 'N/A'}</strong>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: 24 }}>
        <div style={{ background: '#fff', borderRadius: 8, padding: 'clamp(14px, 2.5vw, 20px)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <h3 style={{ marginBottom: 16 }}>Revenue Forecast</h3>
          <div style={{ overflowX: 'auto' }}><Line data={revChart} options={chartOpts} /></div>
        </div>
        <div style={{ background: '#fff', borderRadius: 8, padding: 'clamp(14px, 2.5vw, 20px)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <h3 style={{ marginBottom: 16 }}>Order Volume Forecast</h3>
          <div style={{ overflowX: 'auto' }}><Line data={ordChart} options={chartOpts} /></div>
        </div>
      </div>
      <div style={{ marginTop: 24, background: '#fff', borderRadius: 8, padding: 'clamp(14px, 2.5vw, 20px)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <h3 style={{ marginBottom: 12 }}>Forecast Details</h3>
        {!data.forecast || data.forecast.length === 0 ? (
          <p style={{ color: '#888' }}>Not enough historical data to generate forecast (need at least 2 months).</p>
        ) : (
        <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 300 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={{ textAlign: 'left', padding: '8px 12px', whiteSpace: 'nowrap' }}>Month</th>
              <th style={{ textAlign: 'right', padding: '8px 12px', whiteSpace: 'nowrap' }}>Predicted Revenue</th>
              <th style={{ textAlign: 'right', padding: '8px 12px', whiteSpace: 'nowrap' }}>Predicted Orders</th>
            </tr>
          </thead>
          <tbody>
            {data.forecast.map((f, i) => {
              const d = new Date(f.month);
              const rev = Number(f.revenue) || 0;
              const ord = Math.round(Number(f.orders)) || 0;
              return (
                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td data-label="Month" style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{d.toLocaleString('default', { month: 'long', year: 'numeric' })}</td>
                  <td data-label="Predicted Revenue" style={{ textAlign: 'right', padding: '8px 12px', whiteSpace: 'nowrap' }}>${rev.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td data-label="Predicted Orders" style={{ textAlign: 'right', padding: '8px 12px', whiteSpace: 'nowrap' }}>{ord}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}
