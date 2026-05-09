import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServiceInvoices, deleteServiceInvoice, updateServiceInvoiceStatus } from '../../services/api';

const statusStyles = {
  draft: { bg: '#f3f4f6', color: '#374151', label: 'Draft' },
  sent: { bg: '#dbeafe', color: '#1e40af', label: 'Sent' },
  paid: { bg: '#d1fae5', color: '#065f46', label: 'Paid' },
  cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' }
};

const ServiceInvoiceList = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await getServiceInvoices();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading service invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, num) => {
    if (!window.confirm(`Delete invoice ${num}?`)) return;
    try {
      await deleteServiceInvoice(id);
      fetchInvoices();
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateServiceInvoiceStatus(id, status);
      fetchInvoices();
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.error || err.message));
    }
  };

  const formatCurrency = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? '$0.00' : `$${n.toFixed(2)}`;
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : 'N/A';

  const getStatusBadge = (status) => {
    const s = statusStyles[status] || statusStyles.draft;
    return <span style={{ display:'inline-block', padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'500', backgroundColor:s.bg, color:s.color }}>{s.label}</span>;
  };

  const filtered = invoices.filter(inv => {
    const matchSearch = inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) || inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'400px' }}>
      <div style={{ fontSize:'14px', color:'#666' }}>Loading service invoices...</div>
    </div>;
  }

  return (
    <div style={{ maxWidth:'1400px', margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h1 style={{ fontSize:'28px', fontWeight:'700', marginBottom:'4px' }}>Service Invoices</h1>
          <p style={{ fontSize:'14px', color:'#666', margin:0 }}>Bill clients for services rendered</p>
        </div>
        <button onClick={() => navigate('/services/invoices/new')} style={{
          display:'flex', alignItems:'center', gap:'8px', padding:'10px 20px',
          background:'linear-gradient(135deg, #6366f1, #8b5cf6)', color:'white',
          border:'none', borderRadius:'10px', cursor:'pointer', fontSize:'14px', fontWeight:'500',
          boxShadow:'0 2px 4px rgba(99,102,241,0.3)'
        }}>
          <span style={{ fontSize:'18px' }}>➕</span> New Invoice
        </button>
      </div>

      <div style={{ display:'flex', gap:'16px', marginBottom:'24px', flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:'250px' }}>
          <div style={{ display:'flex', alignItems:'center', background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'8px 16px' }}>
            <span style={{ fontSize:'16px', marginRight:'8px', color:'#9ca3af' }}>🔍</span>
            <input type="text" placeholder="Search by invoice # or customer..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ flex:1, border:'none', outline:'none', fontSize:'14px', background:'transparent' }} />
          </div>
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding:'8px 16px', border:'1px solid #e5e7eb', borderRadius:'12px', fontSize:'14px', background:'white', outline:'none', cursor:'pointer' }}>
          <option value="all">All Status</option>
          {Object.entries(statusStyles).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px', background:'white', borderRadius:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize:'48px', marginBottom:'16px' }}>🧾</div>
          <div style={{ fontSize:'18px', fontWeight:'500', marginBottom:'8px' }}>No service invoices found</div>
          <div style={{ fontSize:'14px', color:'#666' }}>Click "New Invoice" to bill a client for services.</div>
        </div>
      ) : (
        <div style={{ background:'white', borderRadius:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)', overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table className="table-modern" style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#f9fafb', borderBottom:'1px solid #e5e7eb' }}>
                  <th style={{ padding:'16px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Invoice #</th>
                  <th style={{ padding:'16px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Customer</th>
                  <th style={{ padding:'16px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Date</th>
                  <th style={{ padding:'16px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Due Date</th>
                  <th style={{ padding:'16px', textAlign:'right', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Total</th>
                  <th style={{ padding:'16px', textAlign:'center', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Status</th>
                  <th style={{ padding:'16px', textAlign:'center', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv.id} style={{ borderBottom:'1px solid #f3f4f6' }}>
                    <td style={{ padding:'16px', fontWeight:'500' }}>{inv.invoice_number}</td>
                    <td style={{ padding:'16px' }}>{inv.customer_name || 'N/A'}</td>
                    <td style={{ padding:'16px' }}>{formatDate(inv.invoice_date)}</td>
                    <td style={{ padding:'16px' }}>{formatDate(inv.due_date)}</td>
                    <td style={{ padding:'16px', textAlign:'right', fontWeight:'600' }}>{formatCurrency(inv.grand_total)}</td>
                    <td style={{ padding:'16px', textAlign:'center' }}>{getStatusBadge(inv.status)}</td>
                    <td style={{ padding:'16px', textAlign:'center' }}>
                      <div style={{ display:'flex', gap:'6px', justifyContent:'center', flexWrap:'wrap' }}>
                        <button onClick={() => navigate(`/services/invoices/${inv.id}`)}
                          style={{ padding:'6px 10px', background:'#3b82f6', color:'white', border:'none', borderRadius:'6px', fontSize:'11px', cursor:'pointer' }}>View</button>
                        {inv.status === 'draft' && (
                          <button onClick={() => navigate(`/services/invoices/${inv.id}/edit`)}
                            style={{ padding:'6px 10px', background:'#f59e0b', color:'white', border:'none', borderRadius:'6px', fontSize:'11px', cursor:'pointer' }}>Edit</button>
                        )}
                        {inv.status === 'draft' && (
                          <button onClick={() => handleStatusChange(inv.id, 'sent')}
                            style={{ padding:'6px 10px', background:'#3b82f6', color:'white', border:'none', borderRadius:'6px', fontSize:'11px', cursor:'pointer' }}>Send</button>
                        )}
                        {inv.status === 'sent' && (
                          <button onClick={() => handleStatusChange(inv.id, 'paid')}
                            style={{ padding:'6px 10px', background:'#10b981', color:'white', border:'none', borderRadius:'6px', fontSize:'11px', cursor:'pointer' }}>Mark Paid</button>
                        )}
                        {inv.status === 'draft' && (
                          <button onClick={() => handleDelete(inv.id, inv.invoice_number)}
                            style={{ padding:'6px 10px', background:'#ef4444', color:'white', border:'none', borderRadius:'6px', fontSize:'11px', cursor:'pointer' }}>Delete</button>
                        )}
                      </div>
                    </td>
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

export default ServiceInvoiceList;
