import React, { useState, useEffect } from 'react';
import { getStockValue, getLowStock } from '../../services/reports';

const StockValueCard = () => {
  const [data, setData] = useState({ total_value: 0, total_products: 0, low_stock_count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [valueRes, lowRes] = await Promise.all([
          getStockValue(),
          getLowStock()
        ]);
        setData({
          total_value: parseFloat(valueRes.data.summary.total_value || 0),
          total_products: parseInt(valueRes.data.summary.total_products || 0),
          low_stock_count: lowRes.data.length
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="stats-grid"><div className="stat-card">Loading...</div></div>;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Total Inventory Value</h3>
        <p className="stat-number">${data.total_value.toFixed(2)}</p>
      </div>
      <div className="stat-card">
        <h3>Total Products</h3>
        <p className="stat-number">{data.total_products}</p>
      </div>
      <div className="stat-card stat-card-danger">
        <h3>Low Stock Items</h3>
        <p className="stat-number">{data.low_stock_count}</p>
      </div>
    </div>
  );
};

export default StockValueCard;
