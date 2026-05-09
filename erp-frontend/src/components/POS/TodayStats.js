import React, { useState, useEffect } from 'react';
import { getTodayStats, getTopProducts } from '../../services/pos';

const TodayStats = ({ data }) => {
  const [stats, setStats] = useState(data || null);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    if (data) {
      setStats(data);
      return;
    }
    Promise.all([getTodayStats(), getTopProducts()])
      .then(([sRes, pRes]) => {
        setStats(sRes.data);
        setTopProducts(pRes.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [data]);

  if (loading) return <p>Loading stats...</p>;

  return (
    <div className="pos-today-stats">
      <h3>Today's Stats</h3>
      <div className="pos-stats-grid">
        <div className="pos-stat-card">
          <span>Total Sales</span>
          <strong>${stats?.revenue?.toFixed(2) || '0.00'}</strong>
        </div>
        <div className="pos-stat-card">
          <span>Transactions</span>
          <strong>{stats?.orders || 0}</strong>
        </div>
        <div className="pos-stat-card">
          <span>Cash Sales</span>
          <strong>${stats?.cash_sales?.toFixed(2) || '0.00'}</strong>
        </div>
      </div>

      {topProducts.length > 0 && (
        <div className="pos-top-products">
          <h4>Top Selling Products</h4>
          <table className="table table-modern">
            <thead>
              <tr><th>Product</th><th>Sold</th></tr>
            </thead>
            <tbody>
              {topProducts.map(p => (
                <tr key={p.product_name}>
                  <td>{p.product_name}</td>
                  <td>{p.sold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TodayStats;