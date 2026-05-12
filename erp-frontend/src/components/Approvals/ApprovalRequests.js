import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const ApprovalRequests = () => {
  const [requests, setRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWfModal, setShowWfModal] = useState(false);
  const [showReqModal, setShowReqModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewTab, setViewTab] = useState('all');
  const [wfForm, setWfForm] = useState({ name: '', description: '', target_entity: '', steps: [{ approver_id: '', approver_role_id: '', min_amount: '', max_amount: '', requires_all: false }] });
  const [reqForm, setReqForm] = useState({ workflow_id: '', target_entity: 'purchase_order', target_id: '', amount: 0, notes: '' });
  const [approveComment, setApproveComment] = useState('');

  useEffect(() => {
    fetchRequests();
    fetchPending();
    fetchWorkflows();
    fetchUsers();
  }, []);

  const fetchRequests = async () => {
    try { const res = await api.get('/approvals/requests'); setRequests(Array.isArray(res.data) ? res.data : []); }
    catch (err) { console.error(err); }
  };

  const fetchPending = async () => {
    try { const res = await api.get('/approvals/requests/pending'); setPendingRequests(Array.isArray(res.data) ? res.data : []); }
    catch (err) { console.error(err); }
  };

  const fetchWorkflows = async () => {
    try { const res = await api.get('/approvals/workflows'); setWorkflows(Array.isArray(res.data) ? res.data : []); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try { const res = await api.get('/auth/users'); setUsers(Array.isArray(res.data) ? res.data : []); }
    catch (err) { console.error(err); }
  };

  const handleCreateWorkflow = async (e) => {
    e.preventDefault();
    if (!wfForm.name || !wfForm.target_entity) return alert('Name and target entity required');
    try {
      await api.post('/approvals/workflows', wfForm);
      alert('Workflow created');
      setShowWfModal(false);
      setWfForm({ name: '', description: '', target_entity: '', steps: [{ approver_id: '', approver_role_id: '', min_amount: '', max_amount: '', requires_all: false }] });
      fetchWorkflows();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!reqForm.workflow_id || !reqForm.target_id) return alert('Workflow and target ID required');
    try {
      await api.post('/approvals/requests', reqForm);
      alert('Approval request submitted');
      setShowReqModal(false);
      setReqForm({ workflow_id: '', target_entity: 'purchase_order', target_id: '', amount: 0, notes: '' });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  const handleAction = async (id, action) => {
    try {
      await api.post(`/approvals/requests/${id}/action`, { action, comment: approveComment });
      alert(`Request ${action}`);
      setSelectedRequest(null);
      setApproveComment('');
      fetchRequests();
      fetchPending();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  const handleViewRequest = async (id) => {
    try {
      const res = await api.get(`/approvals/requests/${id}`);
      setSelectedRequest(res.data);
    } catch (err) { console.error(err); }
  };

  const addStep = () => {
    setWfForm(prev => ({ ...prev, steps: [...prev.steps, { approver_id: '', approver_role_id: '', min_amount: '', max_amount: '', requires_all: false }] }));
  };

  const removeStep = (idx) => {
    setWfForm(prev => ({ ...prev, steps: prev.steps.filter((_, i) => i !== idx) }));
  };

  const updateStep = (idx, field, value) => {
    setWfForm(prev => {
      const steps = [...prev.steps];
      steps[idx] = { ...steps[idx], [field]: value };
      return { ...prev, steps };
    });
  };

  const statusBadge = (s) => {
    const colors = { pending: '#f59e0b', approved: '#10b981', rejected: '#ef4444' };
    return <span style={{ background: colors[s] || '#6b7280', color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 12, display: 'inline-block' }}>{s}</span>;
  };

  const list = viewTab === 'pending' ? pendingRequests : requests;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <style>{`
        @media (max-width: 768px) {
          .ap-header { flex-direction: column; align-items: stretch !important; gap: 12px; }
          .ap-header h2 { text-align: center; }
          .ap-header-btns { justify-content: center; }
          .ap-layout { grid-template-columns: 1fr !important; }
          .ap-tabs { flex-wrap: wrap; }
          .ap-tabs button { flex: 1; min-width: 100px; text-align: center; }
          .ap-grid-2 { grid-template-columns: 1fr !important; }
          .ap-actions-wrap { flex-wrap: wrap; }
          .ap-actions-wrap button { flex: 1; min-width: 100px; text-align: center; justify-content: center; }
          .ap-step-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .ap-modal-content { padding: 20px 16px !important; width: 95% !important; }
        }
      `}</style>

      <div className="ap-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Approval Workflows</h2>
        <div className="ap-header-btns" style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowReqModal(true)} style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ New Request</button>
          <button onClick={() => setShowWfModal(true)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Workflow</button>
        </div>
      </div>

      <div className="ap-tabs" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setViewTab('all')} style={tabBtn(viewTab === 'all')}>All Requests ({requests.length})</button>
        <button onClick={() => setViewTab('pending')} style={tabBtn(viewTab === 'pending')}>Pending My Approval ({pendingRequests.length})</button>
      </div>

      <div className="ap-layout" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div>
          {loading ? <p>Loading...</p> : (
            <div style={{ background: '#fff', borderRadius: 12, overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 550 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Workflow</th>
                    <th style={thStyle}>Entity</th>
                    <th style={thStyle}>Requester</th>
                    <th style={thStyle}>Amount</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td data-label="ID" style={tdStyle}>#{r.id}</td>
                      <td data-label="Workflow" style={tdStyle}>{r.workflow_name || '-'}</td>
                      <td data-label="Entity" style={tdStyle}>{r.target_entity} #{r.target_id}</td>
                      <td data-label="Requester" style={tdStyle}>{r.requester_name || '-'}</td>
                      <td data-label="Amount" style={tdStyle}>${parseFloat(r.amount || 0).toFixed(2)}</td>
                      <td data-label="Status" style={tdStyle}>{statusBadge(r.status)}</td>
                      <td data-label="Actions" style={tdStyle}>
                        <button onClick={() => handleViewRequest(r.id)} style={btnStyle}>View</button>
                      </td>
                    </tr>
                  ))}
                  {list.length === 0 && <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center' }}>No requests found</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <h4 style={{ margin: '0 0 12px' }}>Workflow Definitions</h4>
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {workflows.length === 0 ? <p style={{ fontSize: 13, color: '#6b7280' }}>No workflows defined yet.</p> : (
              workflows.map(wf => (
                <div key={wf.id} style={{ padding: '12px 0', borderBottom: '1px solid #e5e7eb', fontSize: 13 }}>
                  <div style={{ fontWeight: 600 }}>{wf.name}</div>
                  <div style={{ color: '#6b7280', fontSize: 12 }}>{wf.target_entity} · {wf.steps_count} step(s)</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showWfModal && (
        <div className="modal-overlay" onClick={() => setShowWfModal(false)}>
          <div className="ap-modal-content" onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 32, width: '90%', maxWidth: 650, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px' }}>New Approval Workflow</h3>
            <form onSubmit={handleCreateWorkflow}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Name *</label>
                <input value={wfForm.name} onChange={e => setWfForm(prev => ({ ...prev, name: e.target.value }))} style={inputStyle} required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Description</label>
                <textarea value={wfForm.description} onChange={e => setWfForm(prev => ({ ...prev, description: e.target.value }))} style={{ ...inputStyle, minHeight: 60 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Target Entity *</label>
                <select value={wfForm.target_entity} onChange={e => setWfForm(prev => ({ ...prev, target_entity: e.target.value }))} style={inputStyle} required>
                  <option value="">Select</option>
                  <option value="purchase_order">Purchase Order</option>
                  <option value="expense">Expense</option>
                  <option value="invoice">Invoice</option>
                  <option value="leave">Leave Request</option>
                  <option value="sales_order">Sales Order</option>
                </select>
              </div>

              <h4 style={{ marginBottom: 8 }}>Approval Steps</h4>
              {wfForm.steps.map((step, idx) => (
                <div key={idx} style={{ background: '#f8fafc', borderRadius: 8, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <strong style={{ fontSize: 13 }}>Step {idx + 1}</strong>
                    {wfForm.steps.length > 1 && <button type="button" onClick={() => removeStep(idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>Remove</button>}
                  </div>
                  <div className="ap-step-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Approver</label>
                      <select value={step.approver_id} onChange={e => updateStep(idx, 'approver_id', e.target.value)} style={inputStyle}>
                        <option value="">Select User</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Or Role</label>
                      <input value={step.approver_role_id} onChange={e => updateStep(idx, 'approver_role_id', e.target.value)} style={inputStyle} placeholder="Role ID" />
                    </div>
                    <div>
                      <label style={labelStyle}>Min Amount</label>
                      <input type="number" step="0.01" value={step.min_amount} onChange={e => updateStep(idx, 'min_amount', e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Max Amount</label>
                      <input type="number" step="0.01" value={step.max_amount} onChange={e => updateStep(idx, 'max_amount', e.target.value)} style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <label><input type="checkbox" checked={step.requires_all} onChange={e => updateStep(idx, 'requires_all', e.target.checked)} style={{ marginRight: 6 }} />Requires all approvers in this step</label>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addStep} style={{ marginBottom: 16, padding: '8px 16px', border: '1px dashed #3b82f6', borderRadius: 6, background: 'transparent', color: '#3b82f6', cursor: 'pointer', width: '100%', fontSize: 13 }}>+ Add Step</button>

              <div className="ap-actions-wrap" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowWfModal(false)} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Create Workflow</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReqModal && (
        <div className="modal-overlay" onClick={() => setShowReqModal(false)}>
          <div className="ap-modal-content" onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 32, width: '90%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px' }}>New Approval Request</h3>
            <form onSubmit={handleSubmitRequest}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Workflow *</label>
                <select value={reqForm.workflow_id} onChange={e => {
                  const wf = workflows.find(w => w.id == e.target.value);
                  setReqForm(prev => ({ ...prev, workflow_id: e.target.value, target_entity: wf?.target_entity || '' }));
                }} style={inputStyle} required>
                  <option value="">Select Workflow</option>
                  {workflows.filter(w => w.is_active).map(w => <option key={w.id} value={w.id}>{w.name} ({w.target_entity})</option>)}
                </select>
              </div>
              <div className="ap-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Target ID *</label>
                  <input type="number" min="1" value={reqForm.target_id} onChange={e => setReqForm(prev => ({ ...prev, target_id: e.target.value }))} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Amount ($)</label>
                  <input type="number" step="0.01" min="0" value={reqForm.amount} onChange={e => setReqForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Notes</label>
                <textarea value={reqForm.notes} onChange={e => setReqForm(prev => ({ ...prev, notes: e.target.value }))} style={{ ...inputStyle, minHeight: 60 }} />
              </div>
              <div className="ap-actions-wrap" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowReqModal(false)} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="ap-modal-content" onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 32, width: '90%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <h3 style={{ margin: 0 }}>Request #{selectedRequest.id}</h3>
              {statusBadge(selectedRequest.status)}
            </div>
            <div className="ap-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14, marginBottom: 16 }}>
              <div><strong>Workflow:</strong> {selectedRequest.workflow_name || '-'}</div>
              <div><strong>Entity:</strong> {selectedRequest.target_entity} #{selectedRequest.target_id}</div>
              <div><strong>Requester:</strong> {selectedRequest.requester_name || '-'}</div>
              <div><strong>Amount:</strong> ${parseFloat(selectedRequest.amount || 0).toFixed(2)}</div>
              <div><strong>Step:</strong> {selectedRequest.current_step}/{selectedRequest.total_steps}</div>
              <div><strong>Created:</strong> {new Date(selectedRequest.created_at).toLocaleString()}</div>
            </div>
            {selectedRequest.notes && <p><strong>Notes:</strong> {selectedRequest.notes}</p>}

            {selectedRequest.logs && selectedRequest.logs.length > 0 && (
              <>
                <h4 style={{ marginBottom: 8 }}>History</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16, minWidth: 450 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={thSm}>Step</th>
                        <th style={thSm}>Approver</th>
                        <th style={thSm}>Action</th>
                        <th style={thSm}>Comment</th>
                        <th style={thSm}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRequest.logs.map((log, i) => (
                        <tr key={i}>
                          <td data-label="Step" style={tdSm}>Step {log.step_order}</td>
                          <td data-label="Approver" style={tdSm}>{log.approver_name || '-'}</td>
                          <td data-label="Action" style={tdSm}>{statusBadge(log.action)}</td>
                          <td data-label="Comment" style={tdSm}>{log.comment || '-'}</td>
                          <td data-label="Date" style={tdSm}>{new Date(log.acted_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {selectedRequest.status === 'pending' && (
              <div style={{ marginTop: 16 }}>
                <textarea value={approveComment} onChange={e => setApproveComment(e.target.value)} style={{ ...inputStyle, minHeight: 60, marginBottom: 12 }} placeholder="Comment (optional)" />
                <div className="ap-actions-wrap" style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => handleAction(selectedRequest.id, 'approved')} style={{ padding: '10px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Approve</button>
                  <button onClick={() => handleAction(selectedRequest.id, 'rejected')} style={{ padding: '10px 24px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Reject</button>
                </div>
              </div>
            )}

            <button onClick={() => setSelectedRequest(null)} style={{ marginTop: 16, padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const thStyle = { padding: '12px 16px', fontWeight: 600, fontSize: 13, color: '#6b7280', textTransform: 'uppercase' };
const tdStyle = { padding: '12px 16px', fontSize: 14 };
const thSm = { padding: 8, border: '1px solid #e5e7eb', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase' };
const tdSm = { padding: 8, border: '1px solid #e5e7eb', fontSize: 13 };
const btnStyle = { background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, marginRight: 6 };
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#374151' };
const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' };
const tabBtn = (active) => ({ background: active ? '#3b82f6' : '#e5e7eb', color: active ? '#fff' : '#374151', border: 'none', padding: '6px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 });

export default ApprovalRequests;
