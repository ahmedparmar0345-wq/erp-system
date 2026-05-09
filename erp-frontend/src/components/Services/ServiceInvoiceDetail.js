import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getServiceInvoice, updateServiceInvoiceStatus } from '../../services/api';

const statusStyles = {
  draft: { bg: '#f3f4f6', color: '#374151', label: 'Draft' },
  sent: { bg: '#dbeafe', color: '#1e40af', label: 'Sent' },
  paid: { bg: '#d1fae5', color: '#065f46', label: 'Paid' },
  cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' }
};

const ServiceInvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getServiceInvoice(id);
        setInvoice(data);
      } catch (err) {
        alert('Invoice not found');
        navigate('/services/invoices');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  const handleStatus = async (status) => {
    try {
      await updateServiceInvoiceStatus(id, status);
      const updated = await getServiceInvoice(id);
      setInvoice(updated);
    } catch (err) {
      alert('Failed to update: ' + (err.response?.data?.error || err.message));
    }
  };

  const formatCurrency = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? '$0.00' : `$${n.toFixed(2)}`;
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : 'N/A';

  if (loading) {
    return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'400px' }}>
      <div style={{ fontSize:'14px', color:'#666' }}>Loading...</div>
    </div>;
  }

  if (!invoice) return null;

  const getStatusBadge = (status) => {
    const s = statusStyles[status] || statusStyles.draft;
    return <span style={{ display:'inline-block', padding:'6px 16px', borderRadius:'20px', fontSize:'13px', fontWeight:'500', backgroundColor:s.bg, color:s.color }}>{s.label}</span>;
  };

  const isEditable = invoice.status === 'draft';

  return (
    <div style={{ maxWidth:'1000px', margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'4px' }}>
            <h1 style={{ fontSize:'24px', fontWeight:'700', margin:0 }}>Invoice {invoice.invoice_number}</h1>
            {getStatusBadge(invoice.status)}
          </div>
          <p style={{ fontSize:'14px', color:'#666', margin:0 }}>Created {formatDate(invoice.created_at)}</p>
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          {isEditable && (
            <button onClick={() => navigate(`/services/invoices/${id}/edit`)}
              style={{ padding:'10px 20px', background:'#f59e0b', color:'white', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'500' }}>Edit</button>
          )}
          {isEditable && (
            <button onClick={() => handleStatus('sent')}
              style={{ padding:'10px 20px', background:'#3b82f6', color:'white', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'500' }}>Send to Customer</button>
          )}
          {invoice.status === 'sent' && (
            <>
              <button onClick={() => handleStatus('paid')}
                style={{ padding:'10px 20px', background:'#10b981', color:'white', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'500' }}>Mark as Paid</button>
              <button onClick={() => handleStatus('cancelled')}
                style={{ padding:'10px 20px', background:'#ef4444', color:'white', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'500' }}>Cancel</button>
            </>
          )}
          <button onClick={() => navigate('/services/invoices')}
            style={{ padding:'10px 20px', background:'#f3f4f6', color:'#374151', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'500' }}>Back</button>
        </div>
      </div>

      <div style={{ background:'white', borderRadius:'16px', padding:'24px', marginBottom:'20px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'16px' }}>
          <div>
            <div style={{ fontSize:'12px', color:'#6b7280', marginBottom:'4px' }}>Customer</div>
            <div style={{ fontWeight:'600' }}>{invoice.customer_name || 'N/A'}</div>
            {invoice.customer_email && <div style={{ fontSize:'13px', color:'#6b7280' }}>{invoice.customer_email}</div>}
            {invoice.customer_phone && <div style={{ fontSize:'13px', color:'#6b7280' }}>{invoice.customer_phone}</div>}
          </div>
          <div>
            <div style={{ fontSize:'12px', color:'#6b7280', marginBottom:'4px' }}>Invoice Date</div>
            <div style={{ fontWeight:'600' }}>{formatDate(invoice.invoice_date)}</div>
          </div>
          <div>
            <div style={{ fontSize:'12px', color:'#6b7280', marginBottom:'4px' }}>Due Date</div>
            <div style={{ fontWeight:'600' }}>{formatDate(invoice.due_date)}</div>
          </div>
          <div>
            <div style={{ fontSize:'12px', color:'#6b7280', marginBottom:'4px' }}>Status</div>
            <div>{getStatusBadge(invoice.status)}</div>
          </div>
        </div>
      </div>

      <div style={{ background:'white', borderRadius:'16px', overflow:'hidden', marginBottom:'20px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
        <table className="table-modern" style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'#f9fafb', borderBottom:'1px solid #e5e7eb' }}>
              <th style={{ padding:'16px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>#</th>
              <th style={{ padding:'16px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Service</th>
              <th style={{ padding:'16px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Description</th>
              <th style={{ padding:'16px', textAlign:'center', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Qty</th>
              <th style={{ padding:'16px', textAlign:'right', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Unit Price</th>
              <th style={{ padding:'16px', textAlign:'center', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Disc%</th>
              <th style={{ padding:'16px', textAlign:'center', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Tax%</th>
              <th style={{ padding:'16px', textAlign:'right', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item, idx) => (
              <tr key={item.id || idx} style={{ borderBottom:'1px solid #f3f4f6' }}>
                <td style={{ padding:'16px', color:'#6b7280' }}>{idx + 1}</td>
                <td style={{ padding:'16px', fontWeight:'500' }}>{item.service_name || 'N/A'}</td>
                <td style={{ padding:'16px', color:'#6b7280' }}>{item.description || '-'}</td>
                <td style={{ padding:'16px', textAlign:'center' }}>{item.quantity}</td>
                <td style={{ padding:'16px', textAlign:'right' }}>{formatCurrency(item.unit_price)}</td>
                <td style={{ padding:'16px', textAlign:'center' }}>{item.discount_percent || 0}%</td>
                <td style={{ padding:'16px', textAlign:'center' }}>{item.tax_percent || 0}%</td>
                <td style={{ padding:'16px', textAlign:'right', fontWeight:'600' }}>{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'20px' }}>
        {(invoice.notes || invoice.terms_conditions) && (
          <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
            {invoice.notes && (
              <div style={{ marginBottom:'16px' }}>
                <h4 style={{ fontSize:'14px', fontWeight:'600', marginBottom:'8px', margin:0 }}>Notes</h4>
                <p style={{ fontSize:'14px', color:'#374151', margin:0, whiteSpace:'pre-wrap' }}>{invoice.notes}</p>
              </div>
            )}
            {invoice.terms_conditions && (
              <div>
                <h4 style={{ fontSize:'14px', fontWeight:'600', marginBottom:'8px', margin:0 }}>Terms & Conditions</h4>
                <p style={{ fontSize:'14px', color:'#374151', margin:0, whiteSpace:'pre-wrap' }}>{invoice.terms_conditions}</p>
              </div>
            )}
          </div>
        )}
        <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ maxWidth:'280px', marginLeft:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:'14px' }}>
              <span style={{ color:'#6b7280' }}>Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:'14px' }}>
              <span style={{ color:'#6b7280' }}>Discount:</span>
              <span style={{ color:'#ef4444' }}>-{formatCurrency(invoice.discount_total)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:'14px' }}>
              <span style={{ color:'#6b7280' }}>Tax:</span>
              <span>{formatCurrency(invoice.tax_total)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', borderTop:'2px solid #e5e7eb', fontSize:'20px', fontWeight:'700' }}>
              <span>Total:</span>
              <span style={{ color:'#6366f1' }}>{formatCurrency(invoice.grand_total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceInvoiceDetail;
