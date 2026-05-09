import React, { useState, useEffect } from 'react';
import { getEmailTemplates, updateEmailTemplate, testEmail } from '../../services/settings';

const EmailTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ subject: '', body: '' });
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    getEmailTemplates()
      .then(res => setTemplates(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = (tpl) => {
    setFormData({ subject: tpl.subject, body: tpl.body });
    setEditId(tpl.template_code);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      await updateEmailTemplate(editId, formData);
      alert('Template updated');
      setShowModal(false);
      setTemplates(prev => prev.map(t => t.template_code === editId ? { ...t, ...formData } : t));
    } catch (err) {
      alert('Failed to update template');
    }
  };

  const handleTest = async (code) => {
    setSendingTest(true);
    try {
      await testEmail(code);
      alert('Test email sent successfully');
    } catch (err) {
      alert('Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading templates...</div>;

  return (
    <div>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Email Templates</h3>

      {templates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px', color: '#6b7280' }}>No email templates found</div>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Code</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Subject</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Variables</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map(tpl => (
                  <tr key={tpl.template_code} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{tpl.template_code}</td>
                    <td style={{ padding: '12px 16px' }}>{tpl.subject}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {tpl.variables && tpl.variables.map(v => (
                        <span key={v} style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', color: '#6366f1', marginRight: '6px', fontFamily: 'monospace' }}>{`{${v}}`}</span>
                      ))}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button onClick={() => handleEdit(tpl)} style={{ padding: '6px 12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => handleTest(tpl.template_code)} disabled={sendingTest} style={{ padding: '6px 12px', background: sendingTest ? '#d1d5db' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: sendingTest ? 'not-allowed' : 'pointer' }}>
                          {sendingTest ? 'Sending...' : 'Test'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', width: '700px', maxWidth: '90%' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Edit Template: {editId}</h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Subject</label>
              <input type="text" value={formData.subject} onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Body (HTML)</label>
              <textarea value={formData.body} onChange={e => setFormData(prev => ({ ...prev, body: e.target.value }))} rows="10" style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
              <button type="button" onClick={handleSave} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplates;
