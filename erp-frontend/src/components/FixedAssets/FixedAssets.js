import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const FixedAssets = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [showDisposeModal, setShowDisposeModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [formData, setFormData] = useState({
    asset_code: '', name: '', category_id: '', description: '', purchase_date: '', purchase_cost: '',
    salvage_value: 0, useful_life: '', depreciation_method: 'straight_line', location: '', assigned_to: '',
    supplier_id: '', warranty_expiry: '', notes: ''
  });
  const [maintForm, setMaintForm] = useState({
    maintenance_date: new Date().toISOString().split('T')[0], type: 'repair', description: '', cost: 0, performed_by: '', next_maintenance_date: '', notes: ''
  });
  const [disposeForm, setDisposeForm] = useState({ disposal_date: new Date().toISOString().split('T')[0], disposal_amount: 0, notes: '' });

  useEffect(() => {
    fetchAssets();
    fetchCategories();
    fetchSuppliers();
    fetchUsers();
  }, []);

  const fetchAssets = async () => {
    try { setLoading(true); const res = await api.get('/fixed-assets'); setAssets(Array.isArray(res.data) ? res.data : []); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try { const res = await api.get('/fixed-assets/categories'); setCategories(Array.isArray(res.data) ? res.data : []); }
    catch (err) { console.error(err); }
  };

  const fetchSuppliers = async () => {
    try { const res = await api.get('/suppliers'); setSuppliers(Array.isArray(res.data) ? res.data : []); }
    catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try { const res = await api.get('/auth/users'); setUsers(Array.isArray(res.data) ? res.data : []); }
    catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.asset_code || !formData.name || !formData.purchase_date || !formData.purchase_cost || !formData.useful_life)
      return alert('Asset code, name, purchase date, cost, and useful life are required');
    try {
      await api.post('/fixed-assets', formData);
      alert('Asset created'); setShowModal(false); setFormData({ asset_code: '', name: '', category_id: '', description: '', purchase_date: '', purchase_cost: '', salvage_value: 0, useful_life: '', depreciation_method: 'straight_line', location: '', assigned_to: '', supplier_id: '', warranty_expiry: '', notes: '' }); fetchAssets();
    } catch (err) { console.error(err); alert(err.response?.data?.error || 'Failed'); }
  };

  const handleView = async (id) => {
    try { const res = await api.get(`/fixed-assets/${id}`); setSelectedAsset(res.data); setActiveTab('details'); }
    catch (err) { console.error(err); }
  };

  const handleDepreciate = async (id) => {
    if (!window.confirm('Run depreciation for this asset?')) return;
    try {
      await api.post(`/fixed-assets/${id}/depreciate`);
      alert('Depreciation recorded'); if (selectedAsset) handleView(id); fetchAssets();
    } catch (err) { console.error(err); alert('Failed'); }
  };

  const handleMaintSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAsset) return;
    try {
      await api.post(`/fixed-assets/${selectedAsset.id}/maintenance`, maintForm);
      alert('Maintenance recorded'); setShowMaintModal(false); setMaintForm({ maintenance_date: new Date().toISOString().split('T')[0], type: 'repair', description: '', cost: 0, performed_by: '', next_maintenance_date: '', notes: '' }); handleView(selectedAsset.id);
    } catch (err) { console.error(err); alert('Failed'); }
  };

  const handleDispose = async (e) => {
    e.preventDefault();
    if (!window.confirm('Dispose this asset? This cannot be undone.')) return;
    if (!selectedAsset) return;
    try {
      await api.post(`/fixed-assets/${selectedAsset.id}/dispose`, disposeForm);
      alert('Asset disposed'); setShowDisposeModal(false); setSelectedAsset(null); fetchAssets();
    } catch (err) { console.error(err); alert('Failed'); }
  };

  const statusBadge = (s) => {
    const colors = { active: '#10b981', disposed: '#ef4444', maintenance: '#f59e0b' };
    return <span style={{ background: colors[s] || '#6b7280', color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 12, display: 'inline-block' }}>{s}</span>;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <style>{`
        @media (max-width: 768px) {
          .fa-header { flex-direction: column; align-items: stretch !important; gap: 12px; }
          .fa-header h2 { text-align: center; }
          .fa-grid-2 { grid-template-columns: 1fr !important; }
          .fa-actions-wrap { flex-wrap: wrap; }
          .fa-actions-wrap button { flex: 1; min-width: 120px; text-align: center; justify-content: center; }
        }
        @media (max-width: 600px) {
          .fa-modal-content { padding: 20px 16px !important; width: 95% !important; }
          .fa-detail-grid { grid-template-columns: 1fr !important; }
          .fa-tab-bar { flex-wrap: wrap; }
          .fa-tab-bar button { flex: 1; min-width: 80px; text-align: center; }
        }
      `}</style>

      <div className="fa-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Fixed Assets</h2>
        <button onClick={() => setShowModal(true)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ New Asset</button>
      </div>

      {loading ? <p>Loading...</p> : (
        <div style={{ background: '#fff', borderRadius: 12, overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                <th style={thStyle}>Asset Code</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Purchase Date</th>
                <th style={thStyle}>Cost</th>
                <th style={thStyle}>Current Value</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td data-label="Asset Code" style={tdStyle}>{a.asset_code}</td>
                  <td data-label="Name" style={tdStyle}>{a.name}</td>
                  <td data-label="Category" style={tdStyle}>{a.category_name || '-'}</td>
                  <td data-label="Purchase Date" style={tdStyle}>{new Date(a.purchase_date).toLocaleDateString()}</td>
                  <td data-label="Cost" style={tdStyle}>${parseFloat(a.purchase_cost).toFixed(2)}</td>
                  <td data-label="Current Value" style={tdStyle}>${parseFloat(a.current_value).toFixed(2)}</td>
                  <td data-label="Status" style={tdStyle}>{statusBadge(a.status)}</td>
                  <td data-label="Actions" style={tdStyle} className="fa-actions-wrap">
                    <button onClick={() => handleView(a.id)} style={btnStyle}>View</button>
                    {a.status === 'active' && <button onClick={() => handleDepreciate(a.id)} style={{ ...btnStyle, background: '#8b5cf6' }}>Depr</button>}
                  </td>
                </tr>
              ))}
              {assets.length === 0 && <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center' }}>No assets found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="fa-modal-content" onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 32, width: '90%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px' }}>New Fixed Asset</h3>
            <form onSubmit={handleSubmit}>
              <div className="fa-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Asset Code *</label>
                  <input value={formData.asset_code} onChange={e => setFormData(prev => ({ ...prev, asset_code: e.target.value }))} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Name *</label>
                  <input value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select value={formData.category_id} onChange={e => setFormData(prev => ({ ...prev, category_id: e.target.value }))} style={inputStyle}>
                    <option value="">Select</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Purchase Date *</label>
                  <input type="date" value={formData.purchase_date} onChange={e => setFormData(prev => ({ ...prev, purchase_date: e.target.value }))} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Purchase Cost *</label>
                  <input type="number" step="0.01" min="0" value={formData.purchase_cost} onChange={e => setFormData(prev => ({ ...prev, purchase_cost: parseFloat(e.target.value) || 0 }))} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Salvage Value</label>
                  <input type="number" step="0.01" min="0" value={formData.salvage_value} onChange={e => setFormData(prev => ({ ...prev, salvage_value: parseFloat(e.target.value) || 0 }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Useful Life (months) *</label>
                  <input type="number" min="1" value={formData.useful_life} onChange={e => setFormData(prev => ({ ...prev, useful_life: parseInt(e.target.value) || '' }))} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Depreciation Method</label>
                  <select value={formData.depreciation_method} onChange={e => setFormData(prev => ({ ...prev, depreciation_method: e.target.value }))} style={inputStyle}>
                    <option value="straight_line">Straight Line</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Location</label>
                  <input value={formData.location} onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Assigned To</label>
                  <select value={formData.assigned_to} onChange={e => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))} style={inputStyle}>
                    <option value="">Select</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Supplier</label>
                  <select value={formData.supplier_id} onChange={e => setFormData(prev => ({ ...prev, supplier_id: e.target.value }))} style={inputStyle}>
                    <option value="">Select</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Warranty Expiry</label>
                  <input type="date" value={formData.warranty_expiry} onChange={e => setFormData(prev => ({ ...prev, warranty_expiry: e.target.value }))} style={inputStyle} />
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
              <div className="fa-actions-wrap" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Create Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedAsset && (
        <div className="modal-overlay" onClick={() => setSelectedAsset(null)}>
          <div className="fa-modal-content" onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 32, width: '90%', maxWidth: 750, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
              <h3 style={{ margin: 0 }}>{selectedAsset.name} ({selectedAsset.asset_code})</h3>
              {statusBadge(selectedAsset.status)}
            </div>
            <div className="fa-tab-bar" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button onClick={() => setActiveTab('details')} style={tabBtn(activeTab === 'details')}>Details</button>
              <button onClick={() => setActiveTab('depreciation')} style={tabBtn(activeTab === 'depreciation')}>Depreciation</button>
              <button onClick={() => setActiveTab('maintenance')} style={tabBtn(activeTab === 'maintenance')}>Maintenance</button>
            </div>

            {activeTab === 'details' && (
              <div>
                <div className="fa-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14, marginBottom: 16 }}>
                  <div><strong>Category:</strong> {selectedAsset.category_name || '-'}</div>
                  <div><strong>Purchase Date:</strong> {new Date(selectedAsset.purchase_date).toLocaleDateString()}</div>
                  <div><strong>Purchase Cost:</strong> ${parseFloat(selectedAsset.purchase_cost).toFixed(2)}</div>
                  <div><strong>Current Value:</strong> ${parseFloat(selectedAsset.current_value).toFixed(2)}</div>
                  <div><strong>Salvage Value:</strong> ${parseFloat(selectedAsset.salvage_value || 0).toFixed(2)}</div>
                  <div><strong>Accum. Depreciation:</strong> ${parseFloat(selectedAsset.accumulated_depreciation || 0).toFixed(2)}</div>
                  <div><strong>Useful Life:</strong> {selectedAsset.useful_life} months</div>
                  <div><strong>Depreciation/Period:</strong> ${parseFloat(selectedAsset.depreciation_per_period || 0).toFixed(2)}</div>
                  <div><strong>Location:</strong> {selectedAsset.location || '-'}</div>
                  <div><strong>Assigned To:</strong> {selectedAsset.assigned_to_name || '-'}</div>
                  <div><strong>Supplier:</strong> {selectedAsset.supplier_name || '-'}</div>
                  {selectedAsset.warranty_expiry && <div><strong>Warranty:</strong> {new Date(selectedAsset.warranty_expiry).toLocaleDateString()}</div>}
                </div>
                {selectedAsset.description && <p><strong>Description:</strong> {selectedAsset.description}</p>}
                {selectedAsset.notes && <p><strong>Notes:</strong> {selectedAsset.notes}</p>}
                <div className="fa-actions-wrap" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  {selectedAsset.status === 'active' && (
                    <>
                      <button onClick={() => handleDepreciate(selectedAsset.id)} style={{ padding: '8px 20px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Run Depreciation</button>
                      <button onClick={() => { setMaintForm({ maintenance_date: new Date().toISOString().split('T')[0], type: 'repair', description: '', cost: 0, performed_by: '', next_maintenance_date: '', notes: '' }); setShowMaintModal(true); }} style={{ padding: '8px 20px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Log Maintenance</button>
                      <button onClick={() => { setDisposeForm({ disposal_date: new Date().toISOString().split('T')[0], disposal_amount: 0, notes: '' }); setShowDisposeModal(true); }} style={{ padding: '8px 20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Dispose</button>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'depreciation' && (
              <div>
                {selectedAsset.depreciation && selectedAsset.depreciation.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 350 }}>
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          <th style={thSm}>Period</th>
                          <th style={{ ...thSm, textAlign: 'right' }}>Amount</th>
                          <th style={{ ...thSm, textAlign: 'right' }}>Running Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedAsset.depreciation.map((d, i) => (
                          <tr key={i}>
                            <td data-label="Period" style={tdSm}>{new Date(d.period_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</td>
                            <td data-label="Amount" style={{ ...tdSm, textAlign: 'right' }}>${parseFloat(d.amount).toFixed(2)}</td>
                            <td data-label="Running Balance" style={{ ...tdSm, textAlign: 'right' }}>${parseFloat(d.running_balance).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p>No depreciation records yet.</p>}
              </div>
            )}

            {activeTab === 'maintenance' && (
              <div>
                {selectedAsset.maintenance && selectedAsset.maintenance.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 450 }}>
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          <th style={thSm}>Date</th>
                          <th style={thSm}>Type</th>
                          <th style={thSm}>Description</th>
                          <th style={{ ...thSm, textAlign: 'right' }}>Cost</th>
                          <th style={thSm}>Performed By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedAsset.maintenance.map((m, i) => (
                          <tr key={i}>
                            <td data-label="Date" style={tdSm}>{new Date(m.maintenance_date).toLocaleDateString()}</td>
                            <td data-label="Type" style={tdSm}>{m.type}</td>
                            <td data-label="Description" style={tdSm}>{m.description || '-'}</td>
                            <td data-label="Cost" style={{ ...tdSm, textAlign: 'right' }}>${parseFloat(m.cost).toFixed(2)}</td>
                            <td data-label="Performed By" style={tdSm}>{m.performed_by || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p>No maintenance records yet.</p>}
              </div>
            )}

            <button onClick={() => setSelectedAsset(null)} style={{ marginTop: 16, padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

      {showMaintModal && (
        <div className="modal-overlay" onClick={() => setShowMaintModal(false)}>
          <div className="fa-modal-content" onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 32, width: '90%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px' }}>Log Maintenance</h3>
            <form onSubmit={handleMaintSubmit}>
              <div className="fa-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Date *</label>
                  <input type="date" value={maintForm.maintenance_date} onChange={e => setMaintForm(prev => ({ ...prev, maintenance_date: e.target.value }))} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Type *</label>
                  <select value={maintForm.type} onChange={e => setMaintForm(prev => ({ ...prev, type: e.target.value }))} style={inputStyle}>
                    <option value="repair">Repair</option>
                    <option value="service">Service</option>
                    <option value="inspection">Inspection</option>
                    <option value="upgrade">Upgrade</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Cost</label>
                  <input type="number" step="0.01" min="0" value={maintForm.cost} onChange={e => setMaintForm(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Performed By</label>
                  <input value={maintForm.performed_by} onChange={e => setMaintForm(prev => ({ ...prev, performed_by: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Next Maintenance</label>
                  <input type="date" value={maintForm.next_maintenance_date} onChange={e => setMaintForm(prev => ({ ...prev, next_maintenance_date: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Description</label>
                <textarea value={maintForm.description} onChange={e => setMaintForm(prev => ({ ...prev, description: e.target.value }))} style={{ ...inputStyle, minHeight: 60 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Notes</label>
                <textarea value={maintForm.notes} onChange={e => setMaintForm(prev => ({ ...prev, notes: e.target.value }))} style={{ ...inputStyle, minHeight: 60 }} />
              </div>
              <div className="fa-actions-wrap" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowMaintModal(false)} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Record Maintenance</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDisposeModal && (
        <div className="modal-overlay" onClick={() => setShowDisposeModal(false)}>
          <div className="fa-modal-content" onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 32, width: '90%', maxWidth: 450, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px', color: '#ef4444' }}>Dispose Asset</h3>
            <form onSubmit={handleDispose}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Disposal Date *</label>
                <input type="date" value={disposeForm.disposal_date} onChange={e => setDisposeForm(prev => ({ ...prev, disposal_date: e.target.value }))} style={inputStyle} required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Disposal Amount ($)</label>
                <input type="number" step="0.01" min="0" value={disposeForm.disposal_amount} onChange={e => setDisposeForm(prev => ({ ...prev, disposal_amount: parseFloat(e.target.value) || 0 }))} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Notes</label>
                <textarea value={disposeForm.notes} onChange={e => setDisposeForm(prev => ({ ...prev, notes: e.target.value }))} style={{ ...inputStyle, minHeight: 60 }} />
              </div>
              <div className="fa-actions-wrap" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowDisposeModal(false)} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Confirm Disposal</button>
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
const thSm = { padding: 8, border: '1px solid #e5e7eb', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase' };
const tdSm = { padding: 8, border: '1px solid #e5e7eb', fontSize: 13 };
const btnStyle = { background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, marginRight: 6 };
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#374151' };
const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' };
const tabBtn = (active) => ({ background: active ? '#3b82f6' : '#e5e7eb', color: active ? '#fff' : '#374151', border: 'none', padding: '6px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 });

export default FixedAssets;
