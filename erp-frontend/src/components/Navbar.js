import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/dashboard-charts': 'Analytics',
  '/customers': 'Customers',
  '/products': 'Products',
  '/sales-orders': 'Sales Orders',
  '/quotations': 'Quotations',
  '/quotations/new': 'New Quotation',
  '/suppliers': 'Suppliers',
  '/purchase-orders': 'Purchase Orders',
  '/expenses': 'Expenses',
  '/reports': 'Stock Value Report',
  '/reports/stock-ledger': 'Stock Ledger',
  '/reports/stock-movement': 'Stock Movement',
  '/reports/low-stock': 'Low Stock Report',
  '/production': 'Production Dashboard',
  '/production/dashboard': 'Production Dashboard',
  '/production/boms': 'Bill of Materials',
  '/production/work-orders': 'Work Orders',
  '/vouchers': 'Vouchers',
  '/vouchers/create': 'Create Voucher',
  '/hr': 'HR Dashboard',
  '/hr/employees': 'Employees',
  '/hr/attendance': 'Attendance',
  '/hr/leaves': 'Leave Requests',
  '/hr/leave-balances': 'Leave Balances',
  '/hr/attendance-report': 'Attendance Report',
  '/settings': 'Settings',
  '/pos': 'Point of Sale',
  '/accounting-reports': 'Accounting Reports',
  '/payroll': 'Payroll Dashboard',
  '/payroll/periods': 'Payroll Periods',
  '/payroll/employee-salary': 'Employee Salary',
  '/payroll/register': 'Salary Register',
  '/payroll/process': 'Process Payroll',
  '/payroll/payslips': 'Payslips',
  '/ai-bi': 'AI & BI Dashboard',
  '/ai-bi/sales-forecast': 'Sales Forecast',
  '/ai-bi/product-insights': 'Product Insights',
  '/ai-bi/customer-insights': 'Customer Insights',
  '/ai-bi/anomalies': 'Anomaly Detection'
};

const Navbar = ({ sidebarOpen, setSidebarOpen, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const getTitle = () => {
    const path = location.pathname;
    if (pageTitles[path]) return pageTitles[path];
    if (path.startsWith('/production/boms')) return 'Bill of Materials';
    if (path.startsWith('/production/work-orders')) return 'Work Orders';
    if (path.startsWith('/hr/employees')) return 'Employees';
    if (path.startsWith('/hr/leaves')) return 'Leave Requests';
    if (path.startsWith('/payroll/payslip')) return 'Payslip';
    if (path.startsWith('/quotations')) return 'Quotations';
    if (path.startsWith('/ai-bi')) {
      const s = path.split('/').pop();
      return s ? s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'AI & BI';
    }
    if (path.startsWith('/vouchers')) return 'Voucher';
    if (path.startsWith('/accounting-reports')) {
      const s = path.split('/').pop();
      return s ? s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Accounting Reports';
    }
    return 'Dashboard';
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const notifications = [
    { id: 1, text: 'New employee added', time: '2 min ago', unread: true },
    { id: 2, text: 'Payroll processed for March', time: '1 hour ago', unread: true },
    { id: 3, text: 'Low stock alert: Widget A', time: '3 hours ago', unread: false }
  ];

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      right: 0,
      left: isMobile ? 0 : (sidebarOpen ? 260 : 80),
      height: '60px',
      background: 'white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 999,
      transition: 'left 0.3s ease'
    }} className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer',
            color: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '8px', borderRadius: '8px', transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >☰</button>
        <span style={{ fontWeight: '600', color: '#374151', fontSize: '16px' }}>{getTitle()}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowNotif(!showNotif); setShowUserMenu(false); }}
            style={{
              background: showNotif ? '#f3f4f6' : 'none', border: 'none', fontSize: '18px',
              cursor: 'pointer', padding: '8px', borderRadius: '8px', position: 'relative',
              transition: 'background 0.2s'
            }}
          >🔔
            <span style={{
              position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px',
              background: '#ef4444', borderRadius: '50%'
            }}></span>
          </button>
          {showNotif && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, width: '320px', background: 'white',
              borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', border: '1px solid #e5e7eb',
              overflow: 'hidden', marginTop: '8px', zIndex: 1000
            }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', fontWeight: '600', fontSize: '14px' }}>Notifications</div>
              {notifications.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>No notifications</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} style={{
                    padding: '12px 20px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer',
                    background: n.unread ? '#f5f3ff' : 'white', display: 'flex', gap: '12px', alignItems: 'flex-start',
                    transition: 'background 0.2s'
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = n.unread ? '#f5f3ff' : 'white'}
                  >
                    <div style={{ fontSize: '13px', flex: 1 }}>
                      <div style={{ fontWeight: n.unread ? '500' : '400', color: '#374151' }}>{n.text}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{n.time}</div>
                    </div>
                    {n.unread && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', marginTop: '6px', flexShrink: 0 }}></div>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div ref={userRef} style={{ position: 'relative' }}>
          <div
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotif(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
              padding: '6px 10px', borderRadius: '10px', transition: 'background 0.2s',
              background: showUserMenu ? '#f3f4f6' : 'transparent'
            }}
            onMouseEnter={(e) => { if (!showUserMenu) e.currentTarget.style.background = '#f3f4f6'; }}
            onMouseLeave={(e) => { if (!showUserMenu) e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', color: 'white', fontSize: '14px'
            }}>A</div>
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }} className="user-name">Admin</span>
            <span style={{ fontSize: '10px', color: '#9ca3af' }}>▼</span>
          </div>
          {showUserMenu && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, width: '200px', background: 'white',
              borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', border: '1px solid #e5e7eb',
              overflow: 'hidden', marginTop: '8px', zIndex: 1000
            }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>Admin User</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>admin@erp.com</div>
              </div>
              <div style={{ padding: '8px' }}>
                {[
                  { label: 'My Profile', icon: '👤', onClick: () => navigate('/settings') },
                  { label: 'Settings', icon: '⚙️', onClick: () => navigate('/settings') },
                ].map(item => (
                  <div key={item.label} onClick={item.onClick} style={{
                    padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                    fontSize: '13px', color: '#374151', transition: 'background 0.2s'
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #f3f4f6', marginTop: '4px', paddingTop: '4px' }}>
                  <div onClick={handleLogout} style={{
                    padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                    fontSize: '13px', color: '#ef4444', transition: 'background 0.2s'
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
