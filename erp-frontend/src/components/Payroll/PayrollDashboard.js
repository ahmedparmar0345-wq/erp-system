import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getPayrollPeriods } from '../../services/payroll';

const PayrollDashboard = () => {
    const navigate = useNavigate();
    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        totalSalary: 0,
        processedPeriods: 0,
        pendingPayments: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const periodsData = await getPayrollPeriods();
            setPeriods(periodsData);

            // Calculate stats
            const processed = periodsData.filter(p => p.status === 'processed' || p.status === 'approved');
            setStats({
                totalEmployees: 0,
                totalSalary: 0,
                processedPeriods: processed.length,
                pendingPayments: periodsData.filter(p => p.status === 'draft').length
            });
        } catch (err) {
            console.error('Error fetching payroll data:', err);
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        { title: 'Payroll Periods', icon: '📅', path: '/payroll/periods', color: '#6366f1', description: 'Manage payroll periods and cycles' },
        { title: 'Employee Salary', icon: '💰', path: '/payroll/employee-salary', color: '#10b981', description: 'Set employee salary structures' },
        { title: 'Process Payroll', icon: '⚙️', path: '/payroll/process', color: '#f59e0b', description: 'Run payroll for a period' },
        { title: 'Salary Register', icon: '📊', path: '/payroll/register', color: '#ef4444', description: 'View salary register reports' },
        { title: 'Payslips', icon: '📄', path: '/payroll/payslips', color: '#8b5cf6', description: 'Generate and print payslips' }
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '40px' }}>💰</motion.div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Loading Payroll Dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Payroll Management
                </h1>
                <p style={{ fontSize: '14px', color: '#666' }}>Manage employee salaries, process payroll, and generate payslips</p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Payroll Periods</div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#6366f1' }}>{periods.length}</div>
                </div>
                <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Processed Periods</div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>{stats.processedPeriods}</div>
                </div>
                <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Pending Periods</div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>{stats.pendingPayments}</div>
                </div>
            </div>

            {/* Quick Action Cards */}
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Quick Actions</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {menuItems.map((item, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ y: -4 }}
                            onClick={() => navigate(item.path)}
                            style={{
                                background: 'white',
                                borderRadius: '20px',
                                padding: '20px',
                                border: `1px solid ${item.color}20`,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <div style={{ fontSize: '32px' }}>{item.icon}</div>
                                <div>
                                    <div style={{ fontWeight: '600' }}>{item.title}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>{item.description}</div>
                                </div>
                            </div>
                            <div style={{ fontSize: '11px', color: item.color }}>Click to access →</div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Recent Payroll Periods */}
            <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Recent Payroll Periods</h2>
                {periods.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📅</div>
                        <div>No payroll periods found</div>
                        <button onClick={() => navigate('/payroll/periods')} style={{ marginTop: '16px', padding: '8px 16px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Create First Period</button>
                    </div>
                ) : (
                    <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>Period Name</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>Start Date</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>End Date</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {periods.slice(0, 5).map(period => (
                                        <tr key={period.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '12px 16px', fontWeight: '500' }}>{period.period_name}</td>
                                            <td style={{ padding: '12px 16px' }}>{new Date(period.start_date).toLocaleDateString()}</td>
                                            <td style={{ padding: '12px 16px' }}>{new Date(period.end_date).toLocaleDateString()}</td>
                                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: period.status === 'processed' ? '#d1fae5' : period.status === 'approved' ? '#dbeafe' : '#fef3c7', color: period.status === 'processed' ? '#065f46' : period.status === 'approved' ? '#1e40af' : '#92400e' }}>
                                                    {period.status?.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                <button onClick={() => navigate(`/payroll/register?period=${period.id}`)} style={{ padding: '6px 12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>View Register</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default PayrollDashboard;