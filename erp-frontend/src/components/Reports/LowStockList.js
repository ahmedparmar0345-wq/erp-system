import React, { useState, useEffect } from 'react';
import { getLowStock } from '../../services/reports';

const LowStockList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStock();
  }, []);

  const fetchLowStock = async () => {
    try {
      const res = await getLowStock();
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (product) => {
    window.location.href = `/purchase-orders?reorder=${product.id}&qty=${product.deficit || product.reorder_level}`;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Low Stock Products</h1>
      </div>

      {loading ? <p>Loading...</p> : (
        <table className="table table-modern">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Current Stock</th>
              <th>Reorder Level</th>
              <th>Deficit</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className={p.stock_quantity <= 0 ? 'critical-stock-row' : ''}>
                <td>{p.product_name}</td>
                <td>{p.sku}</td>
                <td>{p.stock_quantity}</td>
                <td>{p.reorder_level}</td>
                <td>{p.deficit}</td>
                <td>
                  <button className="btn btn-sm btn-primary" onClick={() => handleReorder(p)}>
                    Reorder
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && products.length === 0 && (
        <p className="empty-state">All products are well-stocked</p>
      )}
    </div>
  );
};

export default LowStockList;
