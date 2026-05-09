import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getVouchers, approveVoucher } from '../../services/accounting';
import SignaturePad from './SignaturePad';

const VoucherList = () => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [approveId, setApproveId] = useState(null);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType) params.type = filterType;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await getVouchers(params);
      setVouchers(res.data);
    } catch (err) {
      console.error('Failed to fetch vouchers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSuccess = async (signatureBase64) => {
    try {
      await approveVoucher(approveId, signatureBase64);
      setApproveId(null);
      alert('Voucher Approved Successfully!');
      fetchVouchers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve voucher');
    }
  };

  const handleApproveClick = (id) => {
    setApproveId(id);
  };

  const handlePrint = (id) => {
    window.open(`http://localhost:3000/api/accounting/vouchers/${id}/print`, '_blank');
  };

  const handleView = (id) => {
    navigate(`/vouchers/${id}`);
  };

  if (loading) return <p>Loading vouchers...</p>;

  return (
    <div className="container">
      <div className="header-row">
        <h1>Vouchers</h1>
        <Link to="/vouchers/create" className="btn btn-primary">+ New Voucher</Link>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label>Filter by Type</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              <option value="Payment">Payment</option>
              <option value="Receipt">Receipt</option>
              <option value="Journal">Journal</option>
              <option value="Contra">Contra</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label>Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label>End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={fetchVouchers} style={{ height: '40px' }}>Apply Filters</button>
        </div>

         <div style={{ overflowX: 'auto' }}>
           <table className="table table-modern">
             <thead>
               <tr>
                 <th>Voucher No</th>
                 <th>Type</th>
                 <th>Date</th>
                 <th>Description</th>
                 <th>Amount</th>
                 <th>Status</th>
                 <th>Actions</th>
               </tr>
             </thead>
             <tbody>
               {vouchers.length === 0 ? (
                 <tr>
                   <td colSpan="7" className="text-center">No vouchers found</td>
                 </tr>
               ) : (
                 vouchers.map(v => (
                   <tr key={v.id}>
                     <td>{v.voucher_no}</td>
                     <td><span className={`badge badge-${v.voucher_type.toLowerCase()}`}>{v.voucher_type}</span></td>
                     <td>{new Date(v.entry_date).toLocaleDateString()}</td>
                     <td>{v.description || '-'}</td>
                     <td>${parseFloat(v.total_debit).toFixed(2)}</td>
                     <td><span className={`badge badge-${v.status}`}>{v.status}</span></td>
                     <td>
                       <button className="btn btn-secondary btn-sm" onClick={() => handleView(v.id)}>View</button>
                       {v.status === 'draft' && (
                         <button className="btn btn-success btn-sm" onClick={() => handleApproveClick(v.id)}>Approve</button>
                       )}
                       <button className="btn btn-primary btn-sm" onClick={() => handlePrint(v.id)}>Print</button>
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
           </table>
         </div>
      </div>

      {/* Signature Modal */}
      {approveId && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Sign to Approve Voucher</h3>
            <SignaturePad onSave={handleApproveSuccess} onCancel={() => setApproveId(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherList;