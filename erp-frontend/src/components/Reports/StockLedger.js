import React, { useState, useEffect } from 'react';
import { getStockLedger } from '../../services/reports';

const StockLedger = () => {
  const [ledger, setLedger] = useState([]);
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
      const res = await getStockLedger(filters);
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setLedger(data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to generate report';
      setError(msg);
      setLedger([]);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Product Code', 'Product Name', 'Opening Stock', 'Purchases', 'Sales', 'Purchase Returns', 'Sales Returns', 'Closing Stock', 'Unit Price', 'Value'];
    const rows = ledger.map(item => [
      item.sku,
      item.product_name,
      item.opening_stock,
      item.purchases,
      item.sales,
      item.purchase_returns,
      item.sales_returns,
      item.closing_stock,
      item.unit_price.toFixed(2),
      item.total_value.toFixed(2)
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-ledger-${filters.start_date}-${filters.end_date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  const totalValue = ledger.reduce((sum, item) => sum + item.total_value, 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Stock Ledger Report</h1>
        <div className="page-actions">
          <button className="btn" onClick={exportCSV} disabled={ledger.length === 0}>Export CSV</button>
          <button className="btn" onClick={printReport}>Print</button>
        </div>
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

      {ledger.length > 0 && (
        <div className="report-summary">
          <strong>Total Inventory Value: ${totalValue.toFixed(2)}</strong>
        </div>
      )}

      {loading ? <p>Loading...</p> : (
        <table className="table report-table table-modern">
          <thead>
            <tr>
              <th>Product Code</th>
              <th>Product Name</th>
              <th>Opening Stock</th>
              <th>Purchases</th>
              <th>Sales</th>
              <th>Purchase Returns</th>
              <th>Sales Returns</th>
              <th>Closing Stock</th>
              <th>Unit Price</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map(item => (
              <tr key={item.product_id}>
                <td>{item.sku}</td>
                <td>{item.product_name}</td>
                <td>{item.opening_stock}</td>
                <td>{item.purchases}</td>
                <td>{item.sales}</td>
                <td>{item.purchase_returns}</td>
                <td>{item.sales_returns}</td>
                <td>{item.closing_stock}</td>
                <td>${item.unit_price.toFixed(2)}</td>
                <td>${item.total_value.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && ledger.length === 0 && (
        <p className="empty-state">Select dates and click Generate Report</p>
      )}
    </div>
  );
};

export default StockLedger;
