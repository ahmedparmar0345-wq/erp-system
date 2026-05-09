import React, { useState } from 'react';

const SystemTab = () => {
  const [maintenance, setMaintenance] = useState(false);
  const [processing, setProcessing] = useState(null);

  const handleMaintenanceToggle = async (val) => {
    setProcessing('maintenance');
    try {
      const { toggleMaintenance } = await import('../../services/settings');
      await toggleMaintenance(val);
      setMaintenance(val);
      alert(`Maintenance mode ${val ? 'enabled' : 'disabled'}`);
    } catch (err) {
      alert('Failed to toggle maintenance mode');
    } finally {
      setProcessing(null);
    }
  };

  const handleBackup = async () => {
    if (!window.confirm('Start database backup? This may take a moment.')) return;
    setProcessing('backup');
    try {
      const { createBackup } = await import('../../services/settings');
      await createBackup();
      alert('Backup initiated. Check server logs for status.');
    } catch (err) {
      alert('Failed to initiate backup');
    } finally {
      setProcessing(null);
    }
  };

  const handleClearCache = async () => {
    setProcessing('cache');
    try {
      const { clearCache } = await import('../../services/settings');
      await clearCache();
      alert('Cache cleared successfully');
    } catch (err) {
      alert('Failed to clear cache');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Backend Version</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#6366f1' }}>v1.0.0</div>
        </div>
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Database</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>PostgreSQL</div>
        </div>
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Server Time</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>{new Date().toLocaleTimeString()}</div>
        </div>
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Maintenance Mode</div>
          <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', background: maintenance ? '#fee2e2' : '#d1fae5', color: maintenance ? '#991b1b' : '#065f46' }}>
              {maintenance ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <button
            onClick={() => handleMaintenanceToggle(!maintenance)}
            disabled={processing === 'maintenance'}
            style={{ padding: '8px 16px', background: maintenance ? '#10b981' : '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: processing === 'maintenance' ? 'not-allowed' : 'pointer' }}
          >
            {processing === 'maintenance' ? '...' : maintenance ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>System Actions</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={handleBackup} disabled={processing === 'backup'} style={{ padding: '10px 24px', background: processing === 'backup' ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', cursor: processing === 'backup' ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
            {processing === 'backup' ? 'Processing...' : 'Create Database Backup'}
          </button>
          <button onClick={handleClearCache} disabled={processing === 'cache'} style={{ padding: '10px 24px', background: processing === 'cache' ? '#fbbf24' : '#f59e0b', color: 'white', border: 'none', borderRadius: '10px', cursor: processing === 'cache' ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
            {processing === 'cache' ? 'Clearing...' : 'Clear Application Cache'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemTab;
