import React, { useState, useEffect } from 'react';
import { getAuditLogs, exportAuditLogs } from '../../services/settings';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      const res = await getAuditLogs();
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await exportAuditLogs();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'audit_logs.csv');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Failed to export logs');
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filterUser && !log.user_name?.toLowerCase().includes(filterUser.toLowerCase())) return false;
    if (filterAction && !log.action?.toLowerCase().includes(filterAction.toLowerCase())) return false;
    if (filterDate && !log.created_at?.startsWith(filterDate)) return false;
    return true;
  });

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading audit logs...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Audit Logs</h3>
        <button onClick={handleExport} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>Export to CSV</button>
      </div>

      <div style={{ display: 'flex', gap: '12px', background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '20px', border: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '180px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Filter by User</label>
          <input placeholder="User name..." value={filterUser} onChange={e => setFilterUser(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
        </div>
        <div style={{ flex: 1, minWidth: '180px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Filter by Action</label>
          <input placeholder="Action..." value={filterAction} onChange={e => setFilterAction(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Filter by Date</label>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px', color: '#6b7280' }}>No logs found</div>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>User</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Action</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Entity</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{new Date(log.created_at).toLocaleString()}</td>
                    <td style={{ padding: '12px 16px' }}>{log.user_name || 'System'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: '#f3f4f6', color: '#374151' }}>{log.action}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{log.entity_type} #{log.entity_id || '-'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
