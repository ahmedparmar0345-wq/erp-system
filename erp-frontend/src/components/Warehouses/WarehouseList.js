import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const WarehouseList = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);
  const [formData, setFormData] = useState({
    code: '', name: '', address: '', city: '', state: '', country: 'USA',
    postal_code: '', phone: '', email: '', manager_id: '', is_default: false
  });

  useEffect(() => {
    fetchWarehouses();
    fetchUsers();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/warehouses');
      setWarehouses(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/settings/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/warehouses/${editing}`, formData);
        alert('Warehouse updated');
      } else {
        await api.post('/warehouses', formData);
        alert('Warehouse created');
      }
      setShowModal(false);
      setEditing(null);
      setFormData({ code: '', name: '', address: '', city: '', state: '', country: 'USA', postal_code: '', phone: '', email: '', manager_id: '', is_default: false });
      fetchWarehouses();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed');
    }
  };

  const handleEdit = async (w) => {
    setEditing(w.id);
    setFormData({
      code: w.code || '', name: w.name || '', address: w.address || '', city: w.city || '',
      state: w.state || '', country: w.country || 'USA', postal_code: w.postal_code || '',
      phone: w.phone || '', email: w.email || '', manager_id: w.manager_id || '', is_default: w.is_default || false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this warehouse?')) return;
    try {
      await api.delete(`/warehouses/${id}`);
      alert('Warehouse deleted');
      fetchWarehouses();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed');
    }
  };

  const handleViewDetail = async (id) => {
    try {
      const res = await api.get(`/warehouses/${id}`);
      setDetail(res.data);
    } catch (err) { console.error(err); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Warehouses</h2>
        <button onClick={() => { setEditing(null); setFormData({ code: '', name: '', address: '', city: '', state: '', country: 'USA', postal_code: '', phone: '', email: '', manager_id: '', is_default: false }); setShowModal(true); }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>+ New Warehouse</button>
      </div>

      {loading ? <p>Loading...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {warehouses.map(w => (
            <div key={w.id} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: w.is_default ? '2px solid #3b82f6' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 16 }}>{w.name} {w.is_default && <span style={{ fontSize: 10, background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: 8, marginLeft: 6 }}>Default</span>}</h4>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Code: {w.code}</p>
                </div>
                <div>
                  <button onClick={() => handleViewDetail(w.id)} style={{ ...btnSm, background: '#6b7280' }}>View</button>
                  <button onClick={() => handleEdit(w)} style={btnSm}>Edit</button>
                  {!w.is_default && <button onClick={() => handleDelete(w.id)} style={{ ...btnSm, background: '#ef4444' }}>Del</button>}
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#4b5563' }}>
                {w.city && <div>📍 {w.city}{w.state ? `, ${w.state}` : ''}</div>}
                {w.phone && <div>📞 {w.phone}</div>}
                <div style={{ marginTop: 8, display: 'flex', gap: 16 }}>
                  <span><strong>{w.products_count || 0}</strong> products</span>
                  <span><strong>{w.total_stock || 0}</strong> units</span>
                </div>
                {w.manager_name && <div style={{ marginTop: 4, color: '#6b7280' }}>Manager: {w.manager_name}</div>}
              </div>
            </div>
          ))}
          {warehouses.length === 0 && <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#6b7280' }}>No warehouses found</div>}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px' }}>{editing ? 'Edit Warehouse' : 'New Warehouse'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div><label style={labelStyle}>Code *</label><input value={formData.code} onChange={e => setFormData(p => ({ ...p, code: e.target.value }))} style={inputStyle} required /></div>
                <div><label style={labelStyle}>Name *</label><input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} style={inputStyle} required /></div>
                <div><label style={labelStyle}>Phone</label><input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Email</label><input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>City</label><input value={formData.city} onChange={e => setFormData(p => ({ ...p, city: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>State</label><input value={formData.state} onChange={e => setFormData(p => ({ ...p, state: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Country</label><input value={formData.country} onChange={e => setFormData(p => ({ ...p, country: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Postal Code</label><input value={formData.postal_code} onChange={e => setFormData(p => ({ ...p, postal_code: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Manager</label><select value={formData.manager_id} onChange={e => setFormData(p => ({ ...p, manager_id: e.target.value }))} style={inputStyle}><option value="">Select</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
                <div style={{ display: 'flex', alignItems: 'end' }}>
                  <label><input type="checkbox" checked={formData.is_default} onChange={e => setFormData(p => ({ ...p, is_default: e.target.checked }))} style={{ marginRight: 8 }} />Set as Default</label>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}><label style={labelStyle}>Address</label><textarea value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} style={{ ...inputStyle, minHeight: 50 }} /></div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detail && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 800, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>{detail.name} ({detail.code})</h3>
              <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20, padding: 16, background: '#f8fafc', borderRadius: 8, fontSize: 13 }}>
              {detail.address && <div><strong>Address:</strong> {detail.address}</div>}
              {detail.city && <div><strong>City:</strong> {detail.city}</div>}
              {detail.state && <div><strong>State:</strong> {detail.state}</div>}
              {detail.country && <div><strong>Country:</strong> {detail.country}</div>}
              {detail.phone && <div><strong>Phone:</strong> {detail.phone}</div>}
              {detail.email && <div><strong>Email:</strong> {detail.email}</div>}
              {detail.manager_name && <div><strong>Manager:</strong> {detail.manager_name}</div>}
              <div><strong>Default:</strong> {detail.is_default ? 'Yes' : 'No'}</div>
            </div>

            {detail.bins && detail.bins.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4>Bins / Locations ({detail.bins.length})</h4>
                <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead><tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>Code</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>Zone</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>Aisle</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>Rack</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>Shelf</th>
                  </tr></thead>
                  <tbody>{detail.bins.map(b => <tr key={b.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{b.code}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{b.zone || '-'}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{b.aisle || '-'}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{b.rack || '-'}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{b.shelf || '-'}</td>
                  </tr>)}</tbody>
                </table>
              </div>
            )}

            {detail.stock && detail.stock.length > 0 && (
              <div>
                <h4>Stock ({detail.stock.length} products)</h4>
                <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead><tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>Product</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>SKU</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>Quantity</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>Reserved</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>Bin</th>
                  </tr></thead>
                  <tbody>{detail.stock.map(s => <tr key={s.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{s.product_name}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{s.sku}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>{s.quantity}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>{s.reserved_quantity || 0}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{s.bin_code || '-'}</td>
                  </tr>)}</tbody>
                </table>
              </div>
            )}
            <button onClick={() => setDetail(null)} style={{ marginTop: 16, padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const btnSm = { color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11, marginRight: 4, background: '#3b82f6' };
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: '#374151' };
const inputStyle = { width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' };

export default WarehouseList;
