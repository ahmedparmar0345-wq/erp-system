import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('stock-value');
  const [loading, setLoading] = useState(false);
  const [stockValue, setStockValue] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [stockLedger, setStockLedger] = useState([]);
  const [stockMovement, setStockMovement] = useState(null);
  const [filters, setFilters] = useState({ start_date: '2025-01-01', end_date: new Date().toISOString().split('T')[0], product_id: '' });

  useEffect(() => {
    if (activeTab === 'stock-value') fetchStockValue();
    if (activeTab === 'low-stock') fetchLowStock();
    if (activeTab === 'stock-ledger') fetchStockLedger();
    if (activeTab === 'stock-movement') fetchStockMovement();
  }, [activeTab]);

  const fetchStockValue = async () => {
    try {
      const res = await api.get('/reports/stock-value');
      setStockValue(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLowStock = async () => {
    try {
      const res = await api.get('/reports/low-stock');
      setLowStock(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStockLedger = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/stock-ledger', { params: filters });
      setStockLedger(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockMovement = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/stock-movement', { params: filters });
      setStockMovement(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>Reports</h1>
      <div className="tabs">
        {['stock-value', 'low-stock', 'stock-ledger', 'stock-movement'].map(tab => (
          <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
            {tab.replace(/-/g, ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {(activeTab === 'stock-ledger' || activeTab === 'stock-movement') && (
        <div className="filter-bar">
          <input type="date" value={filters.start_date} onChange={e => setFilters({...filters, start_date: e.target.value})} />
          <input type="date" value={filters.end_date} onChange={e => setFilters({...filters, end_date: e.target.value})} />
          <button className="btn btn-primary" onClick={activeTab === 'stock-ledger' ? fetchStockLedger : fetchStockMovement}>
            Generate Report
          </button>
        </div>
      )}

      {loading && <p>Loading...</p>}

      {activeTab === 'stock-value' && stockValue && (
        <div>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Products</h3>
              <p>{stockValue.summary.total_products}</p>
            </div>
            <div className="stat-card">
              <h3>Total Units</h3>
              <p>{stockValue.summary.total_units}</p>
            </div>
            <div className="stat-card">
              <h3>Total Value</h3>
              <p>${parseFloat(stockValue.summary.total_value).toFixed(2)}</p>
            </div>
          </div>
          <h3>Value by Category</h3>
          <table className="table table-modern">
            <thead>
              <tr><th>Category</th><th>Products</th><th>Units</th><th>Value</th></tr>
            </thead>
            <tbody>
              {stockValue.by_category.map(c => (
                <tr key={c.category}>
                  <td>{c.category || 'Uncategorized'}</td>
                  <td>{c.products}</td>
                  <td>{c.units}</td>
                  <td>${parseFloat(c.value).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'low-stock' && (
        <table className="table table-modern">
          <thead>
            <tr><th>Product</th><th>SKU</th><th>Current</th><th>Reorder Level</th><th>Deficit</th></tr>
          </thead>
          <tbody>
            {lowStock.map(p => (
              <tr key={p.id} className="low-stock-row">
                <td>{p.product_name}</td>
                <td>{p.sku}</td>
                <td>{p.stock_quantity}</td>
                <td>{p.reorder_level}</td>
                <td>{p.deficit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {activeTab === 'stock-ledger' && (
        <table className="table table-modern">
          <thead>
            <tr><th>Product</th><th>SKU</th><th>Opening</th><th>Purchases</th><th>Sales</th><th>P. Returns</th><th>S. Returns</th><th>Closing</th><th>Value</th></tr>
          </thead>
          <tbody>
            {stockLedger.map(item => (
              <tr key={item.product_id}>
                <td>{item.product_name}</td>
                <td>{item.sku}</td>
                <td>{item.opening_stock}</td>
                <td>{item.purchases}</td>
                <td>{item.sales}</td>
                <td>{item.purchase_returns}</td>
                <td>{item.sales_returns}</td>
                <td>{item.closing_stock}</td>
                <td>${item.total_value.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {activeTab === 'stock-movement' && stockMovement && (
        <div>
          <div className="stats-grid">
            <div className="stat-card"><h3>Opening Balance</h3><p>{stockMovement.opening_balance}</p></div>
            <div className="stat-card"><h3>Closing Balance</h3><p>{stockMovement.closing_balance}</p></div>
          </div>
          <table className="table table-modern">
            <thead>
              <tr><th>Date</th><th>Product</th><th>Type</th><th>Qty</th><th>Reference</th><th>Balance</th></tr>
            </thead>
            <tbody>
              {stockMovement.movements.map(m => (
                <tr key={m.id}>
                  <td>{new Date(m.date).toLocaleDateString()}</td>
                  <td>{m.product_name}</td>
                  <td>{m.type}</td>
                  <td>{m.quantity}</td>
                  <td>{m.reference}</td>
                  <td>{m.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reports;
