import React, { useState, useEffect } from 'react';
import { getRoles, createRole, updateRole, deleteRole } from '../../services/settings';

const permissionsList = [
  'dashboard', 'customers', 'products', 'sales', 'purchases',
  'expenses', 'accounting', 'vouchers', 'reports', 'hr', 'returns',
  'users', 'settings'
];

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', permissions: [] });

  useEffect(() => { fetchRoles(); }, []);

  const fetchRoles = async () => {
    try {
      const res = await getRoles();
      setRoles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateRole(editId, formData);
      } else {
        await createRole(formData);
      }
      setShowModal(false);
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (role) => {
    setFormData({ name: role.name, description: role.description, permissions: role.permissions });
    setEditId(role.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      await deleteRole(id);
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete role');
    }
  };

  const togglePermission = (perm) => {
    const newPerms = formData.permissions.includes(perm)
      ? formData.permissions.filter(p => p !== perm)
      : [...formData.permissions, perm];
    setFormData(prev => ({ ...prev, permissions: newPerms }));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setFormData(prev => ({ ...prev, permissions: permissionsList }));
    } else {
      setFormData(prev => ({ ...prev, permissions: [] }));
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading roles...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Roles & Permissions</h3>
        <button onClick={() => { setEditId(null); setFormData({ name: '', description: '', permissions: [] }); setShowModal(true); }} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>+ New Role</button>
      </div>

      <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Permissions</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(role => (
                <tr key={role.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '500' }}>{role.name}</td>
                  <td style={{ padding: '12px 16px', color: '#6b7280' }}>{role.description || '-'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: '#f3f4f6', color: '#374151' }}>{role.permissions.length}</span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => handleEdit(role)} disabled={role.is_system} style={{ padding: '6px 12px', background: role.is_system ? '#d1d5db' : '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: role.is_system ? 'not-allowed' : 'pointer' }}>Edit</button>
                      {!role.is_system && <button onClick={() => handleDelete(role.id)} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Delete</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', width: '520px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>{editId ? 'Edit Role' : 'Create Role'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Role Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} required style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Description</label>
                <input type="text" value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontWeight: '500', fontSize: '14px' }}>Permissions</label>
                  <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input type="checkbox" onChange={handleSelectAll} checked={formData.permissions.length === permissionsList.length} /> Select All
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px', maxHeight: '200px', overflowY: 'auto', border: '1px solid #e5e7eb', padding: '12px', borderRadius: '12px' }}>
                  {permissionsList.map(perm => (
                    <label key={perm} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '400', fontSize: '13px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={formData.permissions.includes(perm)} onChange={() => togglePermission(perm)} /> {perm}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
