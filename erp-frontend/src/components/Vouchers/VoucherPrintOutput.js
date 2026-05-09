import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVoucher, approveVoucher } from '../../services/accounting';
import SignaturePad from './SignaturePad';

// Simple helper for demo purposes
const amountInWords = (num) => `${num.toFixed(2)} Only`;

const VoucherPrintOutput = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [showSignature, setShowSignature] = useState(false);

  useEffect(() => {
    getVoucher(id).then(res => setVoucher(res.data));
  }, [id]);

  const handleApprove = async (signatureBase64) => {
    try {
      await approveVoucher(id, signatureBase64);
      setShowSignature(false);
      const res = await getVoucher(id);
      setVoucher(res.data);
      alert('Voucher Approved and Posted!');
    } catch (err) {
      alert('Failed to approve: ' + (err.response?.data?.error || err.message));
    }
  };

  if (!voucher) return <p>Loading voucher details...</p>;

  return (
    <div className="container" style={{ background: '#eee', padding: '20px' }}>
      <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
        <button className="btn btn-primary" onClick={() => window.print()}>Print Voucher</button>
        <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ marginLeft: '0.5rem' }}>Back</button>
        {voucher.status === 'draft' && !showSignature && (
          <button className="btn btn-success" onClick={() => setShowSignature(true)} style={{ marginLeft: '0.5rem' }}>Approve & Sign</button>
        )}
      </div>

      {/* Print Area */}
      <div className="card" id="voucher-print-area" style={{ background: 'white', padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '20px', marginBottom: '30px' }}>
          <h1 style={{ margin: 0, color: '#333' }}>ERP SYSTEM</h1>
          <p style={{ margin: '5px 0', color: '#666' }}>123 Business Street, City, Country | Phone: (123) 456-7890</p>
          <h2 style={{ margin: '20px 0 0', textDecoration: 'underline', textTransform: 'uppercase' }}>
            {voucher.voucher_type} Voucher
          </h2>
        </div>

        {/* Meta Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <p><strong>Voucher No:</strong> {voucher.voucher_no}</p>
            <p><strong>Date:</strong> {new Date(voucher.entry_date).toLocaleDateString()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p><strong>Status:</strong> <span style={{ fontWeight: 'bold', color: voucher.status === 'posted' ? 'green' : 'red' }}>{voucher.status.toUpperCase()}</span></p>
          </div>
        </div>

        <p style={{ marginBottom: '20px' }}><strong>Description:</strong> {voucher.description || 'N/A'}</p>

        {/* Table */}
        <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'left' }}>Account Code</th>
              <th style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'left' }}>Account Name</th>
              <th style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'left' }}>Narration</th>
              <th style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'right' }}>Debit</th>
              <th style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'right' }}>Credit</th>
            </tr>
          </thead>
          <tbody>
            {voucher.lines.map((line, idx) => (
              <tr key={idx}>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{line.account_code}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{line.account_name}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{line.narration || '-'}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>{line.debit > 0 ? `$${line.debit.toFixed(2)}` : '-'}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>{line.credit > 0 ? `$${line.credit.toFixed(2)}` : '-'}</td>
              </tr>
            ))}
            <tr style={{ fontWeight: 'bold', background: '#f9f9f9' }}>
              <td colSpan="3" style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'right' }}>TOTAL</td>
              <td style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'right' }}>${voucher.total_debit.toFixed(2)}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'right' }}>${voucher.total_credit.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <p style={{ marginBottom: '40px' }}><strong>Amount in Words:</strong> {amountInWords(parseFloat(voucher.total_debit))}</p>

        {/* Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
          <div style={{ textAlign: 'center', width: '30%' }}>
            {voucher.signature ? <img src={voucher.signature} alt="Prepared By" style={{ maxHeight: '50px' }} /> : <div style={{ height: '50px' }}></div>}
            <p style={{ marginTop: '5px', fontWeight: 'bold' }}>Prepared By</p>
          </div>
          <div style={{ textAlign: 'center', width: '30%' }}>
            {voucher.status === 'posted' && voucher.approved_at ? (
               <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid green', color: 'green', borderRadius: '5px', padding: '5px' }}>APPROVED</div>
            ) : <div style={{ height: '50px' }}></div>}
            <p style={{ marginTop: '5px', fontWeight: 'bold' }}>Approved By</p>
          </div>
          <div style={{ textAlign: 'center', width: '30%' }}>
            <div style={{ height: '50px' }}></div>
            <p style={{ marginTop: '5px', fontWeight: 'bold' }}>Receiver</p>
          </div>
        </div>
      </div>

      {/* Signature Modal */}
      {showSignature && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Signature for Approval</h3>
            <SignaturePad onSave={handleApprove} onCancel={() => setShowSignature(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherPrintOutput;