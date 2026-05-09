import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const sections = [
    {
        type: 'single', key: 'dashboard', path: '/dashboard',
        icon: '📊', label: 'Dashboard'
    },
    {
        type: 'group', key: 'ai-bi',
        icon: '🤖', label: 'AI & BI',
        items: [
            { path: '/ai-bi', icon: '📊', label: 'Dashboard' },
            { path: '/ai-bi/sales-forecast', icon: '🔮', label: 'Sales Forecast' },
            { path: '/ai-bi/product-insights', icon: '📦', label: 'Product Insights' },
            { path: '/ai-bi/customer-insights', icon: '👥', label: 'Customer Insights' },
            { path: '/ai-bi/anomalies', icon: '⚠️', label: 'Anomaly Detection' },
        ]
    },
    {
        type: 'group', key: 'sales',
        icon: '🛒', label: 'Sales & CRM',
        items: [
            { path: '/pos', icon: '🖥️', label: 'Point of Sale' },
            { path: '/sales-orders', icon: '📋', label: 'Sales Orders' },
            { path: '/quotations', icon: '📄', label: 'Quotations' },
            { path: '/invoices', icon: '🧾', label: 'Invoices' },
            { path: '/customers', icon: '👥', label: 'Customers' },
            { path: '/returns/sales', icon: '↩️', label: 'Sales Returns' },
            { path: '/crm/leads', icon: '👤', label: 'Leads' },
            { path: '/crm/opportunities', icon: '💼', label: 'Opportunities' },
        ]
    },
    {
        type: 'group', key: 'services',
        icon: '🔧', label: 'Services',
        items: [
            { path: '/services', icon: '🔧', label: 'Services Catalog' },
            { path: '/services/invoices', icon: '🧾', label: 'Service Invoices' },
        ]
    },
    {
        type: 'group', key: 'purchasing',
        icon: '📥', label: 'Purchasing',
        items: [
            { path: '/purchase-orders', icon: '📋', label: 'Purchase Orders' },
            { path: '/suppliers', icon: '🏭', label: 'Suppliers' },
            { path: '/returns/purchase', icon: '↩️', label: 'Purchase Returns' },
        ]
    },
    {
        type: 'group', key: 'inventory',
        icon: '📦', label: 'Inventory',
        items: [
            { path: '/products', icon: '📦', label: 'Products' },
            { path: '/warehouses', icon: '🏠', label: 'Warehouses' },
            { path: '/warehouses/transfers', icon: '🔄', label: 'Stock Transfers' },
            { path: '/reports/stock-ledger', icon: '📊', label: 'Stock Ledger' },
            { path: '/reports/stock-movement', icon: '📈', label: 'Stock Movement' },
            { path: '/reports/low-stock', icon: '⚠️', label: 'Low Stock Alerts' },
            { path: '/barcodes', icon: '🏷️', label: 'Barcodes & Labels' },
        ]
    },
    {
        type: 'group', key: 'accounting',
        icon: '💰', label: 'Accounting',
        items: [
            { path: '/vouchers', icon: '📄', label: 'Vouchers' },
            { path: '/accounting/chart-of-accounts', icon: '📋', label: 'Chart of Accounts' },
            { path: '/accounting/cost-centers', icon: '🏢', label: 'Cost Centers' },
            { path: '/accounting/budgets', icon: '🎯', label: 'Budgets' },
            { path: '/accounting/bank-reconciliation', icon: '🏦', label: 'Bank Reconciliation' },
            { path: '/accounting/recurring-entries', icon: '🔄', label: 'Recurring Entries' },
            { path: '/accounting/financial-ratios', icon: '📊', label: 'Financial Ratios' },
            { path: '/accounting-reports', icon: '📈', label: 'Financial Reports' },
            { path: '/tax', icon: '💰', label: 'Tax Rates' },
            { path: '/expenses', icon: '💸', label: 'Expenses' },
        ]
    },
    {
        type: 'group', key: 'projects',
        icon: '📋', label: 'Projects',
        items: [
            { path: '/projects', icon: '📊', label: 'All Projects' },
        ]
    },
    {
        type: 'group', key: 'production',
        icon: '🏭', label: 'Production',
        items: [
            { path: '/production/dashboard', icon: '📊', label: 'Dashboard' },
            { path: '/production/boms', icon: '📋', label: 'Bill of Materials' },
            { path: '/production/work-orders', icon: '🔧', label: 'Work Orders' },
        ]
    },
    {
        type: 'single', key: 'fixed-assets', path: '/fixed-assets',
        icon: '🔨', label: 'Fixed Assets'
    },
    {
        type: 'single', key: 'approvals', path: '/approvals',
        icon: '✅', label: 'Approvals'
    },
    {
        type: 'group', key: 'hr',
        icon: '👔', label: 'Human Resources',
        items: [
            { path: '/hr', icon: '🏠', label: 'Dashboard' },
            { path: '/hr/employees', icon: '👥', label: 'Employees' },
            { path: '/hr/attendance', icon: '📊', label: 'Attendance' },
            { path: '/hr/leaves', icon: '📋', label: 'Leave Requests' },
            { path: '/hr/leave-balances', icon: '⚖️', label: 'Leave Balances' },
        ]
    },
    {
        type: 'group', key: 'payroll',
        icon: '💰', label: 'Payroll',
        items: [
            { path: '/payroll', icon: '📊', label: 'Dashboard' },
            { path: '/payroll/periods', icon: '📅', label: 'Payroll Periods' },
            { path: '/payroll/employee-salary', icon: '💵', label: 'Salary Setup' },
            { path: '/payroll/register', icon: '📋', label: 'Salary Register' },
            { path: '/payroll/payslips', icon: '📄', label: 'Payslips' },
        ]
    },
    {
        type: 'single', key: 'settings', path: '/settings',
        icon: '⚙️', label: 'Settings'
    }
];

const Sidebar = ({ isOpen, setIsOpen, isMobile }) => {
    const location = useLocation();
    const [expandedSections, setExpandedSections] = useState({
        'ai-bi': true, sales: true, services: true, purchasing: true, inventory: true,
        accounting: true, projects: true, production: false, hr: true, payroll: true
    });

    const toggleSection = (key) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const isActive = (path) =>
        location.pathname === path || location.pathname.startsWith(path + '/');

    const isSectionActive = (items) =>
        items.some(item => location.pathname.startsWith(item.path));

    const linkStyle = (active) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 16px',
        marginBottom: '4px',
        borderRadius: '10px',
        textDecoration: 'none',
        color: active ? 'white' : 'rgba(255,255,255,0.65)',
        background: active ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
        fontSize: '13px',
        fontWeight: active ? '500' : '400',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        border: 'none',
        width: '100%',
        textAlign: 'left'
    });

    const sectionHeaderStyle = (active) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderRadius: '12px',
        cursor: 'pointer',
        background: active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
        color: active ? 'white' : 'rgba(255,255,255,0.7)',
        fontWeight: active ? '600' : '400',
        fontSize: '13px',
        border: 'none',
        width: '100%',
        textAlign: 'left',
        transition: 'all 0.2s ease'
    });

    return (
        <>
            {isMobile && isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)', zIndex: 999
                    }}
                />
            )}
            <motion.div
                initial={{ width: isOpen ? (isMobile ? '100%' : 260) : (isMobile ? 0 : 80) }}
                animate={{ width: isOpen ? (isMobile ? '280px' : 260) : (isMobile ? 0 : 80) }}
                transition={{ duration: 0.3 }}
                style={{
                    position: 'fixed', left: 0, top: 0, height: '100vh',
                    background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a3e 100%)',
                    color: 'white', overflow: 'hidden', zIndex: 1000,
                    boxShadow: '2px 0 20px rgba(0,0,0,0.2)',
                    display: 'flex', flexDirection: 'column'
                }}
            >
                <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: isOpen ? 'space-between' : 'center',
                    padding: '20px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    flexShrink: 0
                }}>
                    {isOpen && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '10px',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '16px', fontWeight: 'bold', color: 'white'
                            }}>E</div>
                            <div>
                                <div style={{
                                    fontSize: '16px', fontWeight: '700', color: 'white',
                                    letterSpacing: '0.5px'
                                }}>ERP</div>
                                <div style={{
                                    fontSize: '9px', color: 'rgba(255,255,255,0.4)',
                                    letterSpacing: '1px', textTransform: 'uppercase'
                                }}>Enterprise Suite</div>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: 'none', borderRadius: '8px', padding: '8px',
                            cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
                            fontSize: '14px', lineHeight: 1
                        }}
                    >
                        {isOpen ? '◀' : '▶'}
                    </button>
                </div>

                <div style={{
                    flex: 1, overflowY: 'auto', overflowX: 'hidden',
                    padding: '8px 10px'
                }}>
                    {sections.map((section) => {
                        if (section.type === 'single') {
                            const active = isActive(section.path);
                            return (
                                <Link
                                    key={section.key}
                                    to={section.path}
                                    style={linkStyle(active)}
                                    onMouseEnter={(e) => {
                                        if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!active) e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <span style={{ fontSize: '18px', flexShrink: 0 }}>{section.icon}</span>
                                    {isOpen && <span>{section.label}</span>}
                                </Link>
                            );
                        }

                        if (section.type === 'group') {
                            const expanded = expandedSections[section.key] !== false;
                            const sectionActive = isSectionActive(section.items);
                            return (
                                <div key={section.key} style={{ marginTop: '4px' }}>
                                    <button
                                        onClick={() => toggleSection(section.key)}
                                        style={sectionHeaderStyle(sectionActive)}
                                        onMouseEnter={(e) => {
                                            if (!sectionActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!sectionActive) e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '18px', flexShrink: 0 }}>{section.icon}</span>
                                            {isOpen && <span>{section.label}</span>}
                                        </div>
                                        {isOpen && (
                                            <span style={{
                                                fontSize: '10px', opacity: 0.5,
                                                transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                                                transition: 'transform 0.2s'
                                            }}>▼</span>
                                        )}
                                    </button>

                                    {expanded && section.items.map((item) => {
                                        const active = isActive(item.path);
                                        return (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                style={linkStyle(active)}
                                                onMouseEnter={(e) => {
                                                    if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!active) e.currentTarget.style.background = 'transparent';
                                                }}
                                            >
                                                <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
                                                {isOpen && <span>{item.label}</span>}
                                            </Link>
                                        );
                                    })}
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>

                <div style={{
                    padding: '16px',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(0,0,0,0.15)',
                    flexShrink: 0
                }}>
                    {isOpen ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '38px', height: '38px', borderRadius: '10px',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: '600', color: 'white', fontSize: '14px'
                            }}>A</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: '500', fontSize: '13px', color: 'white' }}>Admin User</div>
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('token');
                                        window.location.href = '/login';
                                    }}
                                    style={{
                                        background: 'none', border: 'none',
                                        color: 'rgba(255,255,255,0.4)',
                                        fontSize: '11px', cursor: 'pointer', padding: 0
                                    }}
                                >
                                    Sign out
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    window.location.href = '/login';
                                }}
                                style={{
                                    background: 'rgba(255,255,255,0.06)',
                                    border: 'none', borderRadius: '8px', padding: '8px 10px',
                                    cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
                                    fontSize: '14px', lineHeight: 1
                                }}
                            >🚪</button>
                        </div>
                    ) : (
                        <button
                            onClick={() => {
                                localStorage.removeItem('token');
                                window.location.href = '/login';
                            }}
                            style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: 'none', borderRadius: '8px', padding: '10px',
                                cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
                                width: '100%', fontSize: '18px'
                            }}
                        >🚪</button>
                    )}
                </div>
            </motion.div>
        </>
    );
};

export default Sidebar;
