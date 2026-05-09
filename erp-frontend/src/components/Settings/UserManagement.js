import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, resetPassword, getRoles } from '../../services/settings';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', role_id: '', is_active: true });
  const [resetData, setResetData] = useState({ id: '', new_password: '' });

  useEffect(() => {
    Promise.all([getUsers(), getRoles()])
      .then(([uRes, rRes]) => {
        setUsers(uRes.data);
        setRoles(rRes.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateUser(editId, formData);
      } else {
        await createUser(formData);
      }
      setShowModal(false);
      setFormData({ full_name: '', email: '', password: '', role_id: '', is_active: true });
      setEditId(null);
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save user');
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(resetData.id, { new_password: resetData.new_password });
      alert('Password reset successfully');
      setShowResetModal(false);
    } catch (err) {
      alert('Failed to reset password');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading users...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>User Management</h3>
        <button onClick={() => { setEditId(null); setFormData({ full_name: '', email: '', password: '', role_id: '', is_active: true }); setShowModal(true); }} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>+ New User</button>
      </div>

      <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Role</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Last Login</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '500' }}>{user.full_name}</td>
                  <td style={{ padding: '12px 16px', color: '#6b7280' }}>{user.email}</td>
                  <td style={{ padding: '12px 16px' }}>{user.role_name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <button
                      onClick={async () => {
                        await updateUser(user.id, { is_active: !user.is_active });
                        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
                      }}
                      style={{ padding: '4px 12px', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: '500', cursor: 'pointer', background: user.is_active ? '#d1fae5' : '#fee2e2', color: user.is_active ? '#065f46' : '#991b1b' }}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => { setEditId(user.id); setFormData({ full_name: user.full_name, email: user.email, role_id: user.role_id, is_active: user.is_active, password: '' }); setShowModal(true); }} style={{ padding: '6px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => { setResetData({ id: user.id, new_password: '' }); setShowResetModal(true); }} style={{ padding: '6px 12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Reset PW</button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No users found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', width: '480px', maxWidth: '90%' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>{editId ? 'Edit User' : 'Create User'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Full Name</label>
                <input type="text" value={formData.full_name} onChange={e => setFormData(prev => ({ ...prev, full_name: e.target.value }))} required style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} required disabled={!!editId} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', opacity: editId ? 0.6 : 1 }} />
              </div>
              {!editId && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Password</label>
                  <input type="password" value={formData.password} onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))} required style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                </div>
              )}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Role</label>
                <select value={formData.role_id} onChange={e => setFormData(prev => ({ ...prev, role_id: e.target.value }))} required style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  <option value="">Select Role</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResetModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowResetModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', width: '420px', maxWidth: '90%' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Reset Password</h3>
            <form onSubmit={handleReset}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>New Password</label>
                <input type="password" value={resetData.new_password} onChange={e => setResetData(prev => ({ ...prev, new_password: e.target.value }))} required minLength="6" style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowResetModal(false)} style={{ padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Reset Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
