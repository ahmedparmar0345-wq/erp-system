import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { printReport } from '../../utils/printUtils';
import { getAgingSummary } from '../../services/accountingReports';

const BarGroup = ({ label, ar, ap, max }) => {
  const arPct = max > 0 ? (ar / max) * 100 : 0;
  const apPct = max > 0 ? (ap / max) * 100 : 0;
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ width: 40, fontSize: '0.8rem', color: '#6b7280' }}>AR</span>
        <div style={{ flex: 1, height: 24, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${arPct}%`, backgroundColor: '#ef4444', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 4, color: 'white', fontSize: '0.75rem', fontWeight: 'bold', minWidth: arPct > 0 ? 40 : 0 }}>{arPct > 0 ? `$${ar.toFixed(0)}` : ''}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
        <span style={{ width: 40, fontSize: '0.8rem', color: '#6b7280' }}>AP</span>
        <div style={{ flex: 1, height: 24, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${apPct}%`, backgroundColor: '#3b82f6', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 4, color: 'white', fontSize: '0.75rem', fontWeight: 'bold', minWidth: apPct > 0 ? 40 : 0 }}>{apPct > 0 ? `$${ap.toFixed(0)}` : ''}</div>
        </div>
      </div>
    </div>
  );
};

const AgingChart = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAgingSummary();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const toNum = (v) => parseFloat(v) || 0;

  const handlePrint = () => {
    const el = document.getElementById('aging-chart-content');
    if (!el) return;
    const clone = el.cloneNode(true);
    const noPrint = clone.querySelectorAll('.no-print');
    noPrint.forEach(e => e.remove());
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) { alert('Please allow pop-ups to print'); return; }
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>Aging Summary</title>
      <style>
        @page { size: A4 landscape; margin: 1.5cm; }
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
        .print-header { text-align: center; margin-bottom: 25px; padding-bottom: 10px; border-bottom: 2px solid #333; }
        .company-name { font-size: 22px; font-weight: bold; }
        .report-title { font-size: 16px; font-weight: bold; margin: 10px 0; }
        .report-date { font-size: 10px; color: #666; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .stat-card { border: 1px solid #ddd; border-radius: 8px; padding: 16px; text-align: center; }
        .stat-card h3 { font-size: 12px; color: #666; margin: 0 0 8px; }
        .stat-number { font-size: 18px; font-weight: bold; margin: 0; }
        .chart-card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; }
        .bar-section { margin-bottom: 1.5rem; }
        .bar-label { font-weight: 600; margin-bottom: 0.5rem; font-size: 0.9rem; }
        .bar-row { display: flex; align-items: center; gap: 0.5rem; }
        .bar-label-text { width: 40px; font-size: 0.8rem; color: #6b7280; }
        .bar-track { flex: 1; height: 24px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 4px; display: flex; align-items: center; justify-content: flex-end; padding-right: 4px; color: white; font-size: 0.75rem; font-weight: bold; }
        .bar-fill-ar { background: #ef4444; }
        .bar-fill-ap { background: #3b82f6; }
        .legend { display: flex; gap: 1rem; margin-bottom: 1rem; font-size: 0.85rem; }
        .legend-color { display: inline-block; width: 12px; height: 12px; border-radius: 2px; margin-right: 4px; vertical-align: middle; }
        .footer { text-align: center; margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 9px; color: #888; }
      </style></head><body>
      <div class="print-header">
        <div class="company-name">${localStorage.getItem('company_name') || 'ERP System'}</div>
        <div class="report-title">Aging Summary</div>
        <div class="report-date">Generated on: ${new Date().toLocaleString()}</div>
      </div>
      ${clone.innerHTML}
      <div class="footer">This is a computer-generated report. No signature required.</div>
      <script>window.onload=function(){window.print();setTimeout(function(){window.close()},1000)};<\/script>
    </body></html>`);
    printWindow.document.close();
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Aging Summary...</div>;

  const ar = data?.accounts_receivable || {};
  const ap = data?.accounts_payable || {};
  const buckets = [
    { label: 'Current (0-30)', ar: toNum(ar.bucket_current), ap: toNum(ap.bucket_current) },
    { label: '31-60 Days', ar: toNum(ar.bucket_31_60), ap: toNum(ap.bucket_31_60) },
    { label: '61-90 Days', ar: toNum(ar.bucket_61_90), ap: toNum(ap.bucket_61_90) },
    { label: '90+ Days', ar: toNum(ar.bucket_90_plus), ap: toNum(ap.bucket_90_plus) },
  ];
  const maxVal = Math.max(...buckets.flatMap(b => [b.ar, b.ap]), 1);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <style>{`
        @media (max-width: 480px) { .ag-grid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <button onClick={() => navigate('/accounting-reports')} className="no-print" style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>← Back to Reports</button>
        <button onClick={handlePrint} className="no-print" style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🖨️ Print</button>
      </div>

      <div id="aging-chart-content">
        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Aging Summary</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>As of {new Date().toLocaleDateString()}</p>

        <div className="ag-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>AR Current</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#ef4444' }}>${toNum(ar.bucket_current).toFixed(2)}</div>
          </div>
          <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>AP Current</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#3b82f6' }}>${toNum(ap.bucket_current).toFixed(2)}</div>
          </div>
          <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Total AR</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#ef4444' }}>${toNum(ar.total).toFixed(2)}</div>
          </div>
          <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Total AP</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#3b82f6' }}>${toNum(ap.total).toFixed(2)}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 16px' }}>Aging Buckets - AR vs AP</h3>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            <span><span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: '#ef4444', borderRadius: 2, marginRight: 4 }}></span> AR (Receivables)</span>
            <span><span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: '#3b82f6', borderRadius: 2, marginRight: 4 }}></span> AP (Payables)</span>
          </div>
          {buckets.map(b => <BarGroup key={b.label} label={b.label} ar={b.ar} ap={b.ap} max={maxVal} />)}
        </div>
      </div>
    </div>
  );
};

export default AgingChart;
