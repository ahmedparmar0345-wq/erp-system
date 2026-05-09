import React, { useState, useEffect } from 'react';
import { getAnomalies, getSeasonality } from '../../services/aiBi';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function AnomalyDetection() {
  const [anomalies, setAnomalies] = useState(null);
  const [seasonality, setSeasonality] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('anomalies');

  useEffect(() => {
    Promise.all([getAnomalies(), getSeasonality()])
      .then(([a, s]) => { setAnomalies(a); setSeasonality(s); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 24, fontSize: 18 }}>Analyzing patterns...</div>;

  const tabStyle = (isActive) => ({
    padding: '10px 20px',
    cursor: 'pointer',
    borderBottom: isActive ? '3px solid #3498db' : '3px solid transparent',
    fontWeight: isActive ? 700 : 400,
    color: isActive ? '#3498db' : '#666',
    background: 'none',
    borderTop: 'none', borderLeft: 'none', borderRight: 'none',
    fontSize: 14,
  });

  return (
    <div style={{ padding: 'clamp(12px, 3vw, 24px)' }}>
      <h2 style={{ marginBottom: 'clamp(16px, 3vw, 24px)' }}>Anomaly & Pattern Detection</h2>
      <div style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 0 }}>
        <button style={tabStyle(tab === 'anomalies')} onClick={() => setTab('anomalies')}>Anomalies</button>
        <button style={tabStyle(tab === 'seasonality')} onClick={() => setTab('seasonality')}>Seasonality</button>
      </div>

      {tab === 'anomalies' && anomalies && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ background: '#fff', borderRadius: 8, padding: 'clamp(14px, 2.5vw, 20px)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>Daily Avg Revenue</div>
              <div style={{ fontSize: 'clamp(18px, 3.5vw, 24px)', fontWeight: 700 }}>${Number(anomalies.mean).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 8, padding: 'clamp(14px, 2.5vw, 20px)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>Daily Std Dev</div>
              <div style={{ fontSize: 'clamp(18px, 3.5vw, 24px)', fontWeight: 700 }}>${Number(anomalies.std).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 8, padding: 'clamp(14px, 2.5vw, 20px)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>Anomalies Detected</div>
              <div style={{ fontSize: 'clamp(18px, 3.5vw, 24px)', fontWeight: 700, color: anomalies.anomalies?.length > 0 ? '#e74c3c' : '#2ecc71' }}>{anomalies.anomalies?.length || 0}</div>
            </div>
          </div>
          {anomalies.anomalies?.length > 0 ? (
            <div style={{ background: '#fff', borderRadius: 8, padding: 'clamp(14px, 2.5vw, 20px)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
              <h3 style={{ marginBottom: 12 }}>Anomalous Days (|z-score| &gt; 2)</h3>
              <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee' }}>
                    <th style={{ textAlign: 'left', padding: '8px 12px', whiteSpace: 'nowrap' }}>Date</th>
                    <th style={{ textAlign: 'right', padding: '8px 12px', whiteSpace: 'nowrap' }}>Revenue</th>
                    <th style={{ textAlign: 'right', padding: '8px 12px', whiteSpace: 'nowrap' }}>Orders</th>
                    <th style={{ textAlign: 'right', padding: '8px 12px', whiteSpace: 'nowrap' }}>Z-Score</th>
                    <th style={{ textAlign: 'center', padding: '8px 12px', whiteSpace: 'nowrap' }}>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalies.anomalies.map((a, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', background: a.type === 'spike' ? '#f0fff4' : '#fff5f5' }}>
                      <td data-label="Date" style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{new Date(a.date).toLocaleDateString()}</td>
                      <td data-label="Revenue" style={{ textAlign: 'right', padding: '8px 12px', whiteSpace: 'nowrap' }}>${Number(a.revenue).toLocaleString()}</td>
                      <td data-label="Orders" style={{ textAlign: 'right', padding: '8px 12px', whiteSpace: 'nowrap' }}>{a.orders}</td>
                      <td data-label="Z-Score" style={{ textAlign: 'right', padding: '8px 12px', whiteSpace: 'nowrap' }}>{a.zScore}</td>
                      <td data-label="Type" style={{ textAlign: 'center', padding: '8px 12px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                          background: a.type === 'spike' ? '#d4edda' : '#f8d7da', color: a.type === 'spike' ? '#155724' : '#721c24',
                        }}>
                          {a.type === 'spike' ? 'SPIKE' : 'DROP'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 8, padding: 'clamp(24px, 5vw, 40px)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(32px, 6vw, 48px)', marginBottom: 12 }}>✅</div>
              <h3>No Anomalies Detected</h3>
              <p style={{ color: '#888' }}>Daily revenue is within normal fluctuation range for the past 90 days.</p>
            </div>
          )}
        </>
      )}

      {tab === 'seasonality' && seasonality && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 24 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 'clamp(14px, 2.5vw, 20px)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <h3 style={{ marginBottom: 16 }}>Revenue by Day of Week</h3>
            <div style={{ overflowX: 'auto' }}><Bar
              data={{
                labels: seasonality.dayOfWeek.map(d => d.day),
                datasets: [{
                  label: 'Revenue',
                  data: seasonality.dayOfWeek.map(d => d.revenue),
                  backgroundColor: ['#e74c3c','#e67e22','#f1c40f','#2ecc71','#3498db','#9b59b6','#1abc9c'],
                }],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 8, padding: 'clamp(14px, 2.5vw, 20px)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <h3 style={{ marginBottom: 16 }}>Revenue by Month</h3>
            <div style={{ overflowX: 'auto' }}><Bar
              data={{
                labels: seasonality.monthly.map(m => m.month),
                datasets: [{
                  label: 'Revenue',
                  data: seasonality.monthly.map(m => m.revenue),
                  backgroundColor: '#3498db',
                }],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } },
              }}
            /></div>
          </div>
          <div style={{ background: '#fff', borderRadius: 8, padding: 'clamp(14px, 2.5vw, 20px)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <h3 style={{ marginBottom: 16 }}>Revenue Distribution by Day</h3>
            <div style={{ overflowX: 'auto' }}><Doughnut
              data={{
                labels: seasonality.dayOfWeek.map(d => d.day),
                datasets: [{
                  data: seasonality.dayOfWeek.map(d => d.revenue),
                  backgroundColor: ['#e74c3c','#e67e22','#f1c40f','#2ecc71','#3498db','#9b59b6','#1abc9c'],
                }],
              }}
              options={{ responsive: true, plugins: { legend: { position: 'right' } } }}
            /></div>
          </div>
          <div style={{ background: '#fff', borderRadius: 8, padding: 'clamp(14px, 2.5vw, 20px)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <h3 style={{ marginBottom: 16 }}>Revenue Distribution by Month</h3>
            <div style={{ overflowX: 'auto' }}><Doughnut
              data={{
                labels: seasonality.monthly.map(m => m.month),
                datasets: [{
                  data: seasonality.monthly.map(m => m.revenue),
                  backgroundColor: ['#e74c3c','#e67e22','#f1c40f','#2ecc71','#3498db','#9b59b6','#1abc9c','#1abc9c','#34495e','#7f8c8d','#e91e63','#00bcd4'],
                }],
              }}
              options={{ responsive: true, plugins: { legend: { position: 'right' } } }}
            /></div>
          </div>
        </div>
      )}
    </div>
  );
}
