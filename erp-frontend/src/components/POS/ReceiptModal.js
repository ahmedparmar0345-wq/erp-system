import React from 'react';

const ReceiptModal = ({ data, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal pos-receipt-modal">
        <div id="pos-receipt-content">
          <div className="pos-receipt-header">
            <h2>RECEIPT</h2>
            <p>Order: {data.order_number}</p>
            <p>Date: {new Date(data.date).toLocaleString()}</p>
          </div>

          {data.customer && (
            <div className="pos-receipt-customer">
              <strong>Customer:</strong> {data.customer.customer_name || data.customer.name}
            </div>
          )}

          <table className="pos-receipt-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.cart.map(item => (
                <tr key={item.id}>
                  <td>{item.product_name}</td>
                  <td>{item.quantity}</td>
                  <td>${item.unit_price.toFixed(2)}</td>
                  <td>${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pos-receipt-totals">
            <div className="pos-receipt-row">
              <span>Subtotal</span>
              <span>${data.subtotal.toFixed(2)}</span>
            </div>
            <div className="pos-receipt-row">
              <span>Tax</span>
              <span>${data.tax.toFixed(2)}</span>
            </div>
            <div className="pos-receipt-row pos-receipt-grand">
              <span>Total</span>
              <span>${data.total.toFixed(2)}</span>
            </div>
            <div className="pos-receipt-row">
              <span>Payment Method</span>
              <span>{data.payment_method.toUpperCase()}</span>
            </div>
            {data.payment_method === 'cash' && (
              <>
                <div className="pos-receipt-row">
                  <span>Received</span>
                  <span>${data.amount_received.toFixed(2)}</span>
                </div>
                <div className="pos-receipt-row">
                  <span>Change</span>
                  <span>${data.change.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          <div className="pos-receipt-footer">
            <p>Thank you for your purchase!</p>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={handlePrint}>🖨️ Print Receipt</button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;