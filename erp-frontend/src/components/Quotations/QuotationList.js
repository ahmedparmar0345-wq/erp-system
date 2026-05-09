import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuotations, deleteQuotation, updateQuotationStatus, convertQuotationToOrder } from '../../services/api';

const statusStyles = {
  draft: { bg: '#f3f4f6', color: '#374151', label: 'Draft' },
  sent: { bg: '#dbeafe', color: '#1e40af', label: 'Sent' },
  accepted: { bg: '#d1fae5', color: '#065f46', label: 'Accepted' },
  rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
  expired: { bg: '#fef3c7', color: '#92400e', label: 'Expired' },
  converted: { bg: '#e0e7ff', color: '#3730a3', label: 'Converted' }
};

const QuotationList = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { fetchQuotations(); }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const data = await getQuotations();
      setQuotations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, number) => {
    if (!window.confirm(`Delete quotation ${number}?`)) return;
    try {
      await deleteQuotation(id);
      fetchQuotations();
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateQuotationStatus(id, status);
      fetchQuotations();
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleConvert = async (id) => {
    if (!window.confirm('Convert this quotation to a sales order?')) return;
    try {
      const result = await convertQuotationToOrder(id);
      alert(`Quotation converted! Sales Order #${result.sales_order.order_number} created.`);
      fetchQuotations();
    } catch (err) {
      alert('Failed to convert: ' + (err.response?.data?.error || err.message));
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

  const isEditable = (status) => status === 'draft';

  const filtered = quotations.filter(q => {
    const matchSearch = q.quote_number?.toLowerCase().includes(searchTerm.toLowerCase()) || q.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'400px' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'24px', marginBottom:'16px' }}>📄</div>
        <div style={{ fontSize:'14px', color:'#666' }}>Loading quotations...</div>
      </div>
    </div>;
  }

  return (
    <div style={{ maxWidth:'1400px', margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h1 style={{ fontSize:'28px', fontWeight:'700', marginBottom:'4px' }}>Quotations</h1>
          <p style={{ fontSize:'14px', color:'#666' }}>Create and manage customer quotations</p>
        </div>
        <button onClick={() => navigate('/quotations/new')} style={{
          display:'flex', alignItems:'center', gap:'8px', padding:'10px 20px',
          background:'linear-gradient(135deg, #6366f1, #8b5cf6)', color:'white',
          border:'none', borderRadius:'10px', cursor:'pointer', fontSize:'14px', fontWeight:'500',
          boxShadow:'0 2px 4px rgba(99,102,241,0.3)'
        }}>
          <span style={{ fontSize:'18px' }}>➕</span> New Quotation
        </button>
      </div>

      <div style={{ display:'flex', gap:'16px', marginBottom:'24px', flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:'250px' }}>
          <div style={{ display:'flex', alignItems:'center', background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'8px 16px' }}>
            <span style={{ fontSize:'16px', marginRight:'8px', color:'#9ca3af' }}>🔍</span>
            <input type="text" placeholder="Search by quote number or customer..." value={searchTerm}
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
          <div style={{ fontSize:'48px', marginBottom:'16px' }}>📄</div>
          <div style={{ fontSize:'18px', fontWeight:'500', marginBottom:'8px' }}>No quotations found</div>
          <div style={{ fontSize:'14px', color:'#666' }}>Click "New Quotation" to create your first quote.</div>
        </div>
      ) : (
        <div style={{ background:'white', borderRadius:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)', overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table className="table-modern" style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#f9fafb', borderBottom:'1px solid #e5e7eb' }}>
                  <th style={{ padding:'16px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Quote #</th>
                  <th style={{ padding:'16px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Customer</th>
                  <th style={{ padding:'16px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Date</th>
                  <th style={{ padding:'16px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Expiry</th>
                  <th style={{ padding:'16px', textAlign:'right', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Total</th>
                  <th style={{ padding:'16px', textAlign:'center', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Status</th>
                  <th style={{ padding:'16px', textAlign:'center', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(q => (
                  <tr key={q.id} style={{ borderBottom:'1px solid #f3f4f6' }}>
                    <td style={{ padding:'16px', fontWeight:'500' }}>{q.quote_number}</td>
                    <td style={{ padding:'16px' }}>{q.customer_name || 'N/A'}</td>
                    <td style={{ padding:'16px' }}>{formatDate(q.quote_date)}</td>
                    <td style={{ padding:'16px' }}>{formatDate(q.expiry_date)}</td>
                    <td style={{ padding:'16px', textAlign:'right', fontWeight:'600' }}>{formatCurrency(q.grand_total)}</td>
                    <td style={{ padding:'16px', textAlign:'center' }}>{getStatusBadge(q.status)}</td>
                    <td style={{ padding:'16px', textAlign:'center' }}>
                      <div style={{ display:'flex', gap:'6px', justifyContent:'center', flexWrap:'wrap' }}>
                        <button onClick={() => navigate(`/quotations/${q.id}`)}
                          style={{ padding:'6px 10px', background:'#3b82f6', color:'white', border:'none', borderRadius:'6px', fontSize:'11px', cursor:'pointer' }}>View</button>
                        {isEditable(q.status) && (
                          <button onClick={() => navigate(`/quotations/${q.id}/edit`)}
                            style={{ padding:'6px 10px', background:'#f59e0b', color:'white', border:'none', borderRadius:'6px', fontSize:'11px', cursor:'pointer' }}>Edit</button>
                        )}
                        {q.status === 'draft' && (
                          <button onClick={() => handleStatusChange(q.id, 'sent')}
                            style={{ padding:'6px 10px', background:'#3b82f6', color:'white', border:'none', borderRadius:'6px', fontSize:'11px', cursor:'pointer' }}>Send</button>
                        )}
                        {(q.status === 'accepted' && !q.converted_to_order_id) && (
                          <button onClick={() => handleConvert(q.id)}
                            style={{ padding:'6px 10px', background:'#10b981', color:'white', border:'none', borderRadius:'6px', fontSize:'11px', cursor:'pointer' }}>Convert to Order</button>
                        )}
                        {(q.status === 'sent') && (
                          <button onClick={() => handleStatusChange(q.id, 'accepted')}
                            style={{ padding:'6px 10px', background:'#10b981', color:'white', border:'none', borderRadius:'6px', fontSize:'11px', cursor:'pointer' }}>Accept</button>
                        )}
                        {(q.status === 'sent') && (
                          <button onClick={() => handleStatusChange(q.id, 'rejected')}
                            style={{ padding:'6px 10px', background:'#ef4444', color:'white', border:'none', borderRadius:'6px', fontSize:'11px', cursor:'pointer' }}>Reject</button>
                        )}
                        {isEditable(q.status) && (
                          <button onClick={() => handleDelete(q.id, q.quote_number)}
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

export default QuotationList;
