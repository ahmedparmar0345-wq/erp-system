import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuotation, updateQuotationStatus, convertQuotationToOrder } from '../../services/api';

const statusStyles = {
  draft: { bg: '#f3f4f6', color: '#374151', label: 'Draft' },
  sent: { bg: '#dbeafe', color: '#1e40af', label: 'Sent' },
  accepted: { bg: '#d1fae5', color: '#065f46', label: 'Accepted' },
  rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
  expired: { bg: '#fef3c7', color: '#92400e', label: 'Expired' }
};

const QuotationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getQuotation(id);
        setQuote(data);
      } catch (err) {
        console.error('Error loading quotation:', err);
        alert('Quotation not found');
        navigate('/quotations');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  const handleStatus = async (status) => {
    try {
      await updateQuotationStatus(id, status);
      const updated = await getQuotation(id);
      setQuote(updated);
    } catch (err) {
      alert('Failed to update: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleConvert = async () => {
    if (!window.confirm('Convert this quotation to a sales order?')) return;
    try {
      const result = await convertQuotationToOrder(id);
      alert(`Converted! Order #${result.sales_order.order_number} created.`);
      const updated = await getQuotation(id);
      setQuote(updated);
    } catch (err) {
      alert('Failed to convert: ' + (err.response?.data?.error || err.message));
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

  if (!quote) return null;

  const getStatusBadge = (status) => {
    const s = statusStyles[status] || statusStyles.draft;
    return <span style={{ display:'inline-block', padding:'6px 16px', borderRadius:'20px', fontSize:'13px', fontWeight:'500', backgroundColor:s.bg, color:s.color }}>{s.label}</span>;
  };

  const isEditable = quote.status === 'draft';

  return (
    <div style={{ maxWidth:'1000px', margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'4px' }}>
            <h1 style={{ fontSize:'24px', fontWeight:'700', margin:0 }}>Quotation {quote.quote_number}</h1>
            {getStatusBadge(quote.status)}
          </div>
          <p style={{ fontSize:'14px', color:'#666', margin:0 }}>Created {formatDate(quote.created_at)}</p>
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          {isEditable && (
            <button onClick={() => navigate(`/quotations/${id}/edit`)}
              style={{ padding:'10px 20px', background:'#f59e0b', color:'white', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'500' }}>Edit</button>
          )}
          {isEditable && (
            <button onClick={() => handleStatus('sent')}
              style={{ padding:'10px 20px', background:'#3b82f6', color:'white', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'500' }}>Send to Customer</button>
          )}
          {quote.status === 'sent' && (
            <>
              <button onClick={() => handleStatus('accepted')}
                style={{ padding:'10px 20px', background:'#10b981', color:'white', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'500' }}>Accept</button>
              <button onClick={() => handleStatus('rejected')}
                style={{ padding:'10px 20px', background:'#ef4444', color:'white', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'500' }}>Reject</button>
            </>
          )}
          {(quote.status === 'accepted' && !quote.converted_to_order_id) && (
            <button onClick={handleConvert}
              style={{ padding:'10px 20px', background:'linear-gradient(135deg, #6366f1, #8b5cf6)', color:'white', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'500', boxShadow:'0 2px 4px rgba(99,102,241,0.3)' }}>
              Convert to Sales Order
            </button>
          )}
          <button onClick={() => navigate('/quotations')}
            style={{ padding:'10px 20px', background:'#f3f4f6', color:'#374151', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'500' }}>Back</button>
        </div>
      </div>

      <div style={{ background:'white', borderRadius:'16px', padding:'24px', marginBottom:'20px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'16px' }}>
          <div>
            <div style={{ fontSize:'12px', color:'#6b7280', marginBottom:'4px' }}>Customer</div>
            <div style={{ fontWeight:'600' }}>{quote.customer_name || 'N/A'}</div>
            {quote.customer_email && <div style={{ fontSize:'13px', color:'#6b7280' }}>{quote.customer_email}</div>}
            {quote.customer_phone && <div style={{ fontSize:'13px', color:'#6b7280' }}>{quote.customer_phone}</div>}
          </div>
          <div>
            <div style={{ fontSize:'12px', color:'#6b7280', marginBottom:'4px' }}>Quote Date</div>
            <div style={{ fontWeight:'600' }}>{formatDate(quote.quote_date)}</div>
          </div>
          <div>
            <div style={{ fontSize:'12px', color:'#6b7280', marginBottom:'4px' }}>Expiry Date</div>
            <div style={{ fontWeight:'600' }}>{formatDate(quote.expiry_date)}</div>
          </div>
          <div>
            <div style={{ fontSize:'12px', color:'#6b7280', marginBottom:'4px' }}>Status</div>
            <div>{getStatusBadge(quote.status)}</div>
          </div>
        </div>
      </div>

      <div style={{ background:'white', borderRadius:'16px', overflow:'hidden', marginBottom:'20px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ overflowX:'auto' }}>
          <table className="table-modern" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f9fafb', borderBottom:'1px solid #e5e7eb' }}>
                <th style={{ padding:'16px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>#</th>
                <th style={{ padding:'16px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Product</th>
                <th style={{ padding:'16px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Description</th>
                <th style={{ padding:'16px', textAlign:'center', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Qty</th>
                <th style={{ padding:'16px', textAlign:'right', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Unit Price</th>
                <th style={{ padding:'16px', textAlign:'center', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Disc%</th>
                <th style={{ padding:'16px', textAlign:'center', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Tax%</th>
                <th style={{ padding:'16px', textAlign:'right', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.items?.map((item, idx) => (
                <tr key={item.id || idx} style={{ borderBottom:'1px solid #f3f4f6' }}>
                  <td style={{ padding:'16px', color:'#6b7280' }}>{idx + 1}</td>
                  <td style={{ padding:'16px', fontWeight:'500' }}>{item.product_name || 'N/A'}</td>
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
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'20px' }}>
        {(quote.notes || quote.terms_conditions) && (
          <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
            {quote.notes && (
              <div style={{ marginBottom:'16px' }}>
                <h4 style={{ fontSize:'14px', fontWeight:'600', marginBottom:'8px' }}>Notes</h4>
                <p style={{ fontSize:'14px', color:'#374151', margin:0, whiteSpace:'pre-wrap' }}>{quote.notes}</p>
              </div>
            )}
            {quote.terms_conditions && (
              <div>
                <h4 style={{ fontSize:'14px', fontWeight:'600', marginBottom:'8px' }}>Terms & Conditions</h4>
                <p style={{ fontSize:'14px', color:'#374151', margin:0, whiteSpace:'pre-wrap' }}>{quote.terms_conditions}</p>
              </div>
            )}
          </div>
        )}
        <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ maxWidth:'280px', marginLeft:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:'14px' }}>
              <span style={{ color:'#6b7280' }}>Subtotal:</span>
              <span>${parseFloat(quote.subtotal || 0).toFixed(2)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:'14px' }}>
              <span style={{ color:'#6b7280' }}>Discount:</span>
              <span style={{ color:'#ef4444' }}>-${parseFloat(quote.discount_total || 0).toFixed(2)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:'14px' }}>
              <span style={{ color:'#6b7280' }}>Tax:</span>
              <span>${parseFloat(quote.tax_total || 0).toFixed(2)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', borderTop:'2px solid #e5e7eb', fontSize:'20px', fontWeight:'700' }}>
              <span>Total:</span>
              <span style={{ color:'#6366f1' }}>${parseFloat(quote.grand_total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {quote.converted_to_order_id && (
        <div style={{ background:'#e0e7ff', borderRadius:'16px', padding:'16px 24px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontSize:'20px' }}>✅</span>
          <div>
            <span style={{ fontWeight:'600', color:'#3730a3' }}>Converted to Sales Order</span>
            <button onClick={() => navigate(`/sales-orders`)}
              style={{ marginLeft:'12px', padding:'6px 14px', background:'#3730a3', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'12px' }}>
              View Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationDetail;
