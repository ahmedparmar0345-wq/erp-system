import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [formData, setFormData] = useState({
    project_code: '', name: '', description: '', customer_id: '', start_date: '', end_date: '',
    budget_amount: 0, priority: 'medium', project_manager: '', notes: ''
  });
  const [taskForm, setTaskForm] = useState({ name: '', description: '', assigned_to: '', start_date: '', due_date: '', estimated_hours: 0, priority: 'medium', parent_task_id: '' });
  const [memberForm, setMemberForm] = useState({ user_id: '', role: 'member', hourly_rate: '' });
  const [timeForm, setTimeForm] = useState({ task_id: '', entry_date: new Date().toISOString().split('T')[0], hours: 0, description: '', billable: true });

  useEffect(() => {
    fetchProjects();
    fetchCustomers();
    fetchUsers();
  }, []);

  const token = () => localStorage.getItem('token');
  const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}` });

  const fetchProjects = async () => {
    try { setLoading(true);       const res = await fetch('/api/projects', { headers: headers() }); const d = await res.json(); setProjects(Array.isArray(d) ? d : []); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchCustomers = async () => {
    try {       const res = await fetch('/api/customers', { headers: headers() }); const d = await res.json(); setCustomers(Array.isArray(d) ? d : []); }
    catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {       const res = await fetch('/api/auth/users', { headers: headers() }); const d = await res.json(); setUsers(Array.isArray(d) ? d : []); }
    catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.project_code || !formData.name) return alert('Project code and name required');
    try {
      const res = await fetch('/api/projects', {
        method: 'POST', headers: headers(), body: JSON.stringify(formData)
      });
      if (res.ok) { alert('Project created'); setShowModal(false); setFormData({ project_code: '', name: '', description: '', customer_id: '', start_date: '', end_date: '', budget_amount: 0, priority: 'medium', project_manager: '', notes: '' }); fetchProjects(); }
      else { const err = await res.json(); alert(err.error || 'Failed'); }
    } catch (err) { console.error(err); }
  };

  const handleView = async (id) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { headers: headers() });
      const d = await res.json();
      setSelectedProject(d);
      setActiveTab('details');
    } catch (err) { console.error(err); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT', headers: headers(), body: JSON.stringify({ status })
      });
      if (res.ok) { fetchProjects(); if (selectedProject) handleView(id); }
    } catch (err) { console.error(err); }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!selectedProject || !taskForm.name) return alert('Task name required');
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/tasks`, {
        method: 'POST', headers: headers(), body: JSON.stringify(taskForm)
      });
      if (res.ok) { alert('Task added'); setShowTaskModal(false); setTaskForm({ name: '', description: '', assigned_to: '', start_date: '', due_date: '', estimated_hours: 0, priority: 'medium', parent_task_id: '' }); handleView(selectedProject.id); }
      else alert('Failed');
    } catch (err) { console.error(err); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedProject || !memberForm.user_id) return alert('Select a user');
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/members`, {
        method: 'POST', headers: headers(), body: JSON.stringify(memberForm)
      });
      if (res.ok) { alert('Member added'); setShowMemberModal(false); setMemberForm({ user_id: '', role: 'member', hourly_rate: '' }); handleView(selectedProject.id); }
      else alert('Failed');
    } catch (err) { console.error(err); }
  };

  const handleLogTime = async (e) => {
    e.preventDefault();
    if (!selectedProject || !timeForm.hours || parseFloat(timeForm.hours) <= 0) return alert('Valid hours required');
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/time`, {
        method: 'POST', headers: headers(), body: JSON.stringify(timeForm)
      });
      if (res.ok) { alert('Time logged'); setShowTimeModal(false); setTimeForm({ task_id: '', entry_date: new Date().toISOString().split('T')[0], hours: 0, description: '', billable: true }); handleView(selectedProject.id); }
      else alert('Failed');
    } catch (err) { console.error(err); }
  };

  const handleTaskStatus = async (taskId, status) => {
    try {
      const res = await fetch(`/api/projects/tasks/${taskId}`, {
        method: 'PUT', headers: headers(), body: JSON.stringify({ status })
      });
      if (res.ok && selectedProject) handleView(selectedProject.id);
    } catch (err) { console.error(err); }
  };

  const progressStyle = (done, total) => {
    const pct = total > 0 ? (done / total) * 100 : 0;
    return (
      <div style={{ width: 100, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden', display: 'inline-block' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: '#10b981', borderRadius: 3 }} />
      </div>
    );
  };

  const statusBadge = (s) => {
    const colors = { planning: '#6b7280', active: '#3b82f6', on_hold: '#f59e0b', completed: '#10b981', cancelled: '#ef4444' };
    return <span style={{ background: colors[s] || '#6b7280', color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 12 }}>{s}</span>;
  };

  const priorityBadge = (p) => {
    const colors = { low: '#9ca3af', medium: '#3b82f6', high: '#f59e0b', urgent: '#ef4444' };
    return <span style={{ background: colors[p] || '#6b7280', color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: 11 }}>{p}</span>;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <style>{`
        @media (max-width: 480px) {
          .pr-table-wrap { overflow: visible; }
          .pr-table-wrap table, .pr-table-wrap thead, .pr-table-wrap tbody,
          .pr-table-wrap tr, .pr-table-wrap td, .pr-table-wrap th { display: block; }
          .pr-table-wrap thead tr { display: none; }
          .pr-table-wrap td {
            display: flex; justify-content: space-between; align-items: center;
            padding: 8px 12px !important;
            border-bottom: 1px solid #e5e7eb;
          }
          .pr-table-wrap td::before {
            content: attr(data-label);
            font-weight: 600; font-size: 11px; color: #6b7280;
            margin-right: 12px; flex-shrink: 0;
          }
          .pr-table-wrap td:last-child { border-bottom: 2px solid #d1d5db; }
          .pr-table-wrap tr { margin-bottom: 10px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
          .pr-modal-inner { width: 95% !important; max-width: 95% !important; padding: 20px !important; }
          .pr-modal-inner .form-grid { grid-template-columns: 1fr !important; }
          .pr-detail-grid { grid-template-columns: 1fr !important; }
          .pr-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
        }
      `}</style>
      <div className="pr-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0 }}>Projects</h2>
        <button onClick={() => setShowModal(true)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>+ New Project</button>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="pr-table-wrap" style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                <th style={thStyle}>Code</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Progress</th>
                <th style={thStyle}>Budget</th>
                <th style={thStyle}>Logged Hours</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Priority</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td data-label="Code" style={tdStyle}>{p.project_code}</td>
                  <td data-label="Name" style={tdStyle}>{p.name}</td>
                  <td data-label="Customer" style={tdStyle}>{p.customer_name || '-'}</td>
                  <td data-label="Progress" style={tdStyle}>{progressStyle(parseInt(p.tasks_done || 0), parseInt(p.tasks_count || 0))} {p.tasks_done || 0}/{p.tasks_count || 0}</td>
                  <td data-label="Budget" style={tdStyle}>${parseFloat(p.budget_amount || 0).toFixed(2)}</td>
                  <td data-label="Hours" style={tdStyle}>{parseFloat(p.logged_hours || 0).toFixed(1)}h</td>
                  <td data-label="Status" style={tdStyle}>{statusBadge(p.status)}</td>
                  <td data-label="Priority" style={tdStyle}>{priorityBadge(p.priority)}</td>
                  <td data-label="Actions" style={tdStyle}>
                    <button onClick={() => handleView(p.id)} style={btnStyle}>View</button>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && <tr><td colSpan={9} style={{ padding: 24, textAlign: 'center' }}>No projects found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="pr-modal-inner" style={{ background: '#fff', borderRadius: 16, padding: 32, width: 700, maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px' }}>New Project</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Project Code *</label>
                  <input value={formData.project_code} onChange={e => setFormData(prev => ({ ...prev, project_code: e.target.value }))} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Name *</label>
                  <input value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Customer</label>
                  <select value={formData.customer_id} onChange={e => setFormData(prev => ({ ...prev, customer_id: e.target.value }))} style={inputStyle}>
                    <option value="">Select</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Project Manager</label>
                  <select value={formData.project_manager} onChange={e => setFormData(prev => ({ ...prev, project_manager: e.target.value }))} style={inputStyle}>
                    <option value="">Select</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Start Date</label>
                  <input type="date" value={formData.start_date} onChange={e => setFormData(prev => ({ ...prev, start_date: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>End Date</label>
                  <input type="date" value={formData.end_date} onChange={e => setFormData(prev => ({ ...prev, end_date: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Budget ($)</label>
                  <input type="number" step="0.01" min="0" value={formData.budget_amount} onChange={e => setFormData(prev => ({ ...prev, budget_amount: parseFloat(e.target.value) || 0 }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Priority</label>
                  <select value={formData.priority} onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value }))} style={inputStyle}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Description</label>
                <textarea value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} style={{ ...inputStyle, minHeight: 60 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Notes</label>
                <textarea value={formData.notes} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} style={{ ...inputStyle, minHeight: 60 }} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedProject && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="pr-modal-inner" style={{ background: '#fff', borderRadius: 16, padding: 32, width: 800, maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
              <h3 style={{ margin: 0 }}>{selectedProject.name} ({selectedProject.project_code})</h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {statusBadge(selectedProject.status)}
                {priorityBadge(selectedProject.priority)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <button onClick={() => setActiveTab('details')} style={tabBtn(activeTab === 'details')}>Details</button>
              <button onClick={() => setActiveTab('tasks')} style={tabBtn(activeTab === 'tasks')}>Tasks ({selectedProject.tasks?.length || 0})</button>
              <button onClick={() => setActiveTab('members')} style={tabBtn(activeTab === 'members')}>Members ({selectedProject.members?.length || 0})</button>
              <button onClick={() => setActiveTab('time')} style={tabBtn(activeTab === 'time')}>Time ({selectedProject.time_entries?.length || 0})</button>
            </div>

            {activeTab === 'details' && (
              <div>
                <div className="pr-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14, marginBottom: 16 }}>
                  <div><strong>Customer:</strong> {selectedProject.customer_name || '-'}</div>
                  <div><strong>Manager:</strong> {selectedProject.manager_name || '-'}</div>
                  <div><strong>Start Date:</strong> {selectedProject.start_date ? new Date(selectedProject.start_date).toLocaleDateString() : '-'}</div>
                  <div><strong>End Date:</strong> {selectedProject.end_date ? new Date(selectedProject.end_date).toLocaleDateString() : '-'}</div>
                  <div><strong>Budget:</strong> ${parseFloat(selectedProject.budget_amount || 0).toFixed(2)}</div>
                  <div><strong>Status:</strong> {selectedProject.status}</div>
                </div>
                {selectedProject.description && <p><strong>Description:</strong> {selectedProject.description}</p>}
                {selectedProject.notes && <p><strong>Notes:</strong> {selectedProject.notes}</p>}
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  {selectedProject.status === 'active' && <button onClick={() => handleStatusChange(selectedProject.id, 'completed')} style={{ padding: '8px 20px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Mark Completed</button>}
                  {selectedProject.status === 'planning' && <button onClick={() => handleStatusChange(selectedProject.id, 'active')} style={{ padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Activate Project</button>}
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                  <button onClick={() => setShowTaskModal(true)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>+ Add Task</button>
                </div>
                {selectedProject.tasks && selectedProject.tasks.length > 0 ? (
                  <div className="pr-table-wrap">
                  <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>Task</th>
                        <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Assigned To</th>
                        <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Due Date</th>
                        <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Est. Hours</th>
                        <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'center' }}>Status</th>
                        <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProject.tasks.map(t => (
                        <tr key={t.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td data-label="Task" style={{ padding: 8, border: '1px solid #e5e7eb' }}>
                            {t.parent_task_id && <span style={{ marginRight: 4 }}>↳</span>}
                            {t.name}
                          </td>
                          <td data-label="Assigned To" style={{ padding: 8, border: '1px solid #e5e7eb' }}>{t.assigned_to_name || '-'}</td>
                          <td data-label="Due Date" style={{ padding: 8, border: '1px solid #e5e7eb' }}>{t.due_date ? new Date(t.due_date).toLocaleDateString() : '-'}</td>
                          <td data-label="Est. Hours" style={{ padding: 8, border: '1px solid #e5e7eb' }}>{t.estimated_hours || 0}</td>
                          <td data-label="Status" style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                            <select value={t.status} onChange={e => handleTaskStatus(t.id, e.target.value)} style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 12 }}>
                              <option value="todo">Todo</option>
                              <option value="in_progress">In Progress</option>
                              <option value="done">Done</option>
                            </select>
                          </td>
                          <td data-label="" style={{ padding: 8, border: '1px solid #e5e7eb' }}>
                            {t.subtasks_count > 0 && <span style={{ fontSize: 11, color: '#6b7280' }}>{t.subtasks_count} subtask(s)</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                ) : <p>No tasks yet.</p>}
              </div>
            )}

            {activeTab === 'members' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                  <button onClick={() => setShowMemberModal(true)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>+ Add Member</button>
                </div>
                {selectedProject.members && selectedProject.members.length > 0 ? (
                  <div className="pr-table-wrap">
                  <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>Name</th>
                        <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Email</th>
                        <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Role</th>
                        <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>Hourly Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProject.members.map((m, i) => (
                        <tr key={i}>
                          <td data-label="Name" style={{ padding: 8, border: '1px solid #e5e7eb' }}>{m.user_name || '-'}</td>
                          <td data-label="Email" style={{ padding: 8, border: '1px solid #e5e7eb' }}>{m.email || '-'}</td>
                          <td data-label="Role" style={{ padding: 8, border: '1px solid #e5e7eb' }}>{m.role}</td>
                          <td data-label="Rate" style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>{m.hourly_rate ? `$${parseFloat(m.hourly_rate).toFixed(2)}` : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                ) : <p>No members yet.</p>}
              </div>
            )}

            {activeTab === 'time' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                  <button onClick={() => setShowTimeModal(true)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>+ Log Time</button>
                </div>
                {selectedProject.time_entries && selectedProject.time_entries.length > 0 ? (
                  <div className="pr-table-wrap">
                  <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Date</th>
                        <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>User</th>
                        <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Task</th>
                        <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>Hours</th>
                        <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Billable</th>
                        <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProject.time_entries.map((te, i) => (
                        <tr key={i}>
                          <td data-label="Date" style={{ padding: 8, border: '1px solid #e5e7eb' }}>{new Date(te.entry_date).toLocaleDateString()}</td>
                          <td data-label="User" style={{ padding: 8, border: '1px solid #e5e7eb' }}>{te.user_name || '-'}</td>
                          <td data-label="Task" style={{ padding: 8, border: '1px solid #e5e7eb' }}>{te.task_name || '-'}</td>
                          <td data-label="Hours" style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>{parseFloat(te.hours).toFixed(1)}</td>
                          <td data-label="Billable" style={{ padding: 8, border: '1px solid #e5e7eb' }}>{te.billable ? 'Yes' : 'No'}</td>
                          <td data-label="Description" style={{ padding: 8, border: '1px solid #e5e7eb' }}>{te.description || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                ) : <p>No time entries yet.</p>}
              </div>
            )}

            <button onClick={() => setSelectedProject(null)} style={{ marginTop: 16, padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 550, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px' }}>Add Task</h3>
            <form onSubmit={handleAddTask}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Task Name *</label>
                <input value={taskForm.name} onChange={e => setTaskForm(prev => ({ ...prev, name: e.target.value }))} style={inputStyle} required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Description</label>
                <textarea value={taskForm.description} onChange={e => setTaskForm(prev => ({ ...prev, description: e.target.value }))} style={{ ...inputStyle, minHeight: 60 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Assigned To</label>
                  <select value={taskForm.assigned_to} onChange={e => setTaskForm(prev => ({ ...prev, assigned_to: e.target.value }))} style={inputStyle}>
                    <option value="">Select</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Priority</label>
                  <select value={taskForm.priority} onChange={e => setTaskForm(prev => ({ ...prev, priority: e.target.value }))} style={inputStyle}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Start Date</label>
                  <input type="date" value={taskForm.start_date} onChange={e => setTaskForm(prev => ({ ...prev, start_date: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Due Date</label>
                  <input type="date" value={taskForm.due_date} onChange={e => setTaskForm(prev => ({ ...prev, due_date: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Est. Hours</label>
                  <input type="number" step="0.5" min="0" value={taskForm.estimated_hours} onChange={e => setTaskForm(prev => ({ ...prev, estimated_hours: parseFloat(e.target.value) || 0 }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Parent Task</label>
                  <select value={taskForm.parent_task_id} onChange={e => setTaskForm(prev => ({ ...prev, parent_task_id: e.target.value }))} style={inputStyle}>
                    <option value="">None (top-level)</option>
                    {selectedProject?.tasks?.filter(t => !t.parent_task_id).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowTaskModal(false)} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 450, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px' }}>Add Member</h3>
            <form onSubmit={handleAddMember}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>User *</label>
                <select value={memberForm.user_id} onChange={e => setMemberForm(prev => ({ ...prev, user_id: e.target.value }))} style={inputStyle} required>
                  <option value="">Select</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Role</label>
                <select value={memberForm.role} onChange={e => setMemberForm(prev => ({ ...prev, role: e.target.value }))} style={inputStyle}>
                  <option value="member">Member</option>
                  <option value="lead">Lead</option>
                  <option value="manager">Manager</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Hourly Rate ($)</label>
                <input type="number" step="0.01" min="0" value={memberForm.hourly_rate} onChange={e => setMemberForm(prev => ({ ...prev, hourly_rate: e.target.value }))} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowMemberModal(false)} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTimeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px' }}>Log Time</h3>
            <form onSubmit={handleLogTime}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Task</label>
                <select value={timeForm.task_id} onChange={e => setTimeForm(prev => ({ ...prev, task_id: e.target.value }))} style={inputStyle}>
                  <option value="">General (no task)</option>
                  {selectedProject?.tasks?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Date *</label>
                  <input type="date" value={timeForm.entry_date} onChange={e => setTimeForm(prev => ({ ...prev, entry_date: e.target.value }))} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Hours *</label>
                  <input type="number" step="0.25" min="0.25" value={timeForm.hours} onChange={e => setTimeForm(prev => ({ ...prev, hours: parseFloat(e.target.value) || 0 }))} style={inputStyle} required />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Description</label>
                <textarea value={timeForm.description} onChange={e => setTimeForm(prev => ({ ...prev, description: e.target.value }))} style={{ ...inputStyle, minHeight: 60 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label><input type="checkbox" checked={timeForm.billable} onChange={e => setTimeForm(prev => ({ ...prev, billable: e.target.checked }))} style={{ marginRight: 8 }} />Billable</label>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowTimeModal(false)} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Log Time</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const thStyle = { padding: '12px 16px', fontWeight: 600, fontSize: 13, color: '#6b7280', textTransform: 'uppercase' };
const tdStyle = { padding: '12px 16px', fontSize: 14 };
const btnStyle = { background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, marginRight: 6 };
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#374151' };
const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' };
const tabBtn = (active) => ({ background: active ? '#3b82f6' : '#e5e7eb', color: active ? '#fff' : '#374151', border: 'none', padding: '6px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 });

export default Projects;
