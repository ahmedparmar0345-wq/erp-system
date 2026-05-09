import React, { useState, useEffect } from 'react';
import { getStockMovement } from '../../services/reports';

const StockMovement = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    product_id: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const generateReport = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await getStockMovement(filters);
      setMovements(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to generate report';
      setError(msg);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'in': case 'purchase': case 'return_in': return 'text-success';
      case 'out': case 'sale': case 'return_out': return 'text-danger';
      default: return '';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Stock Movement Report</h1>
      </div>

      <div className="filter-bar">
        <div className="form-group">
          <label>Start Date</label>
          <input type="date" value={filters.start_date} onChange={e => setFilters({ ...filters, start_date: e.target.value })} />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input type="date" value={filters.end_date} onChange={e => setFilters({ ...filters, end_date: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Product (Optional)</label>
          <select value={filters.product_id} onChange={e => setFilters({ ...filters, product_id: e.target.value })}>
            <option value="">All Products</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>&nbsp;</label>
          <button className="btn btn-primary" onClick={generateReport} disabled={loading}>
            {loading ? 'Loading...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

      {movements.opening_balance !== undefined && (
        <div className="report-summary">
          <span>Opening: {movements.opening_balance}</span>
          <span>Closing: {movements.closing_balance}</span>
        </div>
      )}

      {loading ? <p>Loading...</p> : (
        <table className="table report-table table-modern">
          <thead>
            <tr>
              <th>Date</th>
              <th>Transaction Type</th>
              <th>Reference No</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {(movements.movements || []).map(m => (
              <tr key={m.id}>
                <td>{new Date(m.date).toLocaleDateString()}</td>
                <td className={getTypeColor(m.type)}>{m.type.toUpperCase()}</td>
                <td>{m.reference}</td>
                <td>{m.product_name}</td>
                <td className={getTypeColor(m.type)}>
                  {m.quantity > 0 ? '+' : '-'}{Math.abs(m.quantity)}
                </td>
                <td>{m.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && (!movements.movements || movements.movements.length === 0) && (
        <p className="empty-state">Select dates and click Generate Report</p>
      )}
    </div>
  );
};

export default StockMovement;
