import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardCharts from './DashboardCharts';

const API_URL = 'http://localhost:3000/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    orders: 0,
    lowStock: 0,
    suppliers: 0,
    expenses: 0
  });
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Get user info
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserName(user.name || 'Admin');

        const [cRes, pRes, oRes, sRes, eRes] = await Promise.all([
          axios.get(`${API_URL}/customers`, { headers }),
          axios.get(`${API_URL}/products`, { headers }),
          axios.get(`${API_URL}/sales-orders`, { headers }),
          axios.get(`${API_URL}/suppliers`, { headers }),
          axios.get(`${API_URL}/expenses`, { headers }),
        ]);

        const products = pRes.data;
        const lowStock = Array.isArray(products) ? products.filter((p) => p.current_stock <= p.reorder_level).length : 0;
        const totalExpenses = Array.isArray(eRes.data) ? eRes.data.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) : 0;

        setStats({
          customers: Array.isArray(cRes.data) ? cRes.data.length : 0,
          products: Array.isArray(products) ? products.length : 0,
          orders: Array.isArray(oRes.data) ? oRes.data.length : 0,
          lowStock,
          suppliers: Array.isArray(sRes.data) ? sRes.data.length : 0,
          expenses: totalExpenses
        });
        setLoading(false);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>Loading Dashboard...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Welcome Section */}
      <div style={{ marginBottom: '30px' }}>
        <h1>Welcome back, {userName}!</h1>
        <p style={{ color: '#666' }}>Here's what's happening with your business today.</p>
      </div>

      {/* Quick Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #3b82f6'
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Customers</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>{stats.customers}</div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #10b981'
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Products</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>{stats.products}</div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #f59e0b'
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Sales Orders</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.orders}</div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #ef4444'
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Low Stock</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: stats.lowStock > 0 ? '#ef4444' : '#333' }}>
            {stats.lowStock}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #8b5cf6'
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Suppliers</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#8b5cf6' }}>{stats.suppliers}</div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #ec4899'
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Total Expenses</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ec4899' }}>
            ${stats.expenses.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Dashboard Charts - Financial KPIs */}
      <DashboardCharts />

      {/* Quick Links */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginTop: '30px'
      }}>
        <a href="/sales-orders" style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '15px',
          textDecoration: 'none',
          color: '#333',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          📦 New Sale
        </a>
        <a href="/purchase-orders" style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '15px',
          textDecoration: 'none',
          color: '#333',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          📥 New Purchase
        </a>
        <a href="/products" style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '15px',
          textDecoration: 'none',
          color: '#333',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          📦 Manage Products
        </a>
        <a href="/accounting-reports" style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '15px',
          textDecoration: 'none',
          color: '#333',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          📊 View Reports
        </a>
      </div>
    </div>
  );
};

export default Dashboard;