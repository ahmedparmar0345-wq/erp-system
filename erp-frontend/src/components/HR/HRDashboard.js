import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const HRDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalEmployees: 0,
        activeEmployees: 0,
        onLeave: 0,
        pendingLeaves: 0,
        totalLeaveRequests: 0,
        departments: 0
    });
    const [recentLeaves, setRecentLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHRData();
    }, []);

    const fetchHRData = async () => {
        try {
            setLoading(true);

            const [employeesRes, leavesRes] = await Promise.all([
                api.get('/hr/employees'),
                api.get('/hr/leave-requests')
            ]);
            const employees = employeesRes.data;
            const leaves = leavesRes.data;

            const employeesArray = Array.isArray(employees) ? employees : [];
            const leavesArray = Array.isArray(leaves) ? leaves : [];

            const departments = [...new Set(employeesArray.map(e => e.department).filter(Boolean))];

            setStats({
                totalEmployees: employeesArray.length,
                activeEmployees: employeesArray.filter(e => e.status === 'active').length,
                onLeave: employeesArray.filter(e => e.status === 'on_leave').length,
                pendingLeaves: leavesArray.filter(l => l.status === 'pending').length,
                totalLeaveRequests: leavesArray.length,
                departments: departments.length
            });

            setRecentLeaves(leavesArray.slice(0, 5));
        } catch (err) {
            console.error('Error fetching HR data:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const getLeaveStatusBadge = (status) => {
        const badges = {
            pending: { bg: '#fef3c7', color: '#92400e', icon: '⏳', text: 'Pending' },
            approved: { bg: '#d1fae5', color: '#065f46', icon: '✅', text: 'Approved' },
            rejected: { bg: '#fee2e2', color: '#991b1b', icon: '❌', text: 'Rejected' }
        };
        return badges[status] || badges.pending;
    };

    const menuItems = [
        { title: 'Employee Directory', icon: '👥', path: '/hr/employees', color: '#6366f1', description: 'View and manage all employees' },
        { title: 'Leave Balances', icon: '⚖️', path: '/hr/leave-balances', color: '#10b981', description: 'Track leave balances by employee' },
        { title: 'Leave Requests', icon: '📋', path: '/hr/leaves', color: '#f59e0b', description: 'Manage leave requests and approvals' },
        { title: 'Attendance Tracker', icon: '📊', path: '/hr/attendance', color: '#ef4444', description: 'Record daily attendance' },
        { title: 'Add Employee', icon: '➕', path: '/hr/employees/new', color: '#8b5cf6', description: 'Add new employee to system' }
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        style={{ fontSize: '40px', marginBottom: '16px' }}
                    >
                        👥
                    </motion.div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Loading HR Dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}
        >
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Human Resources Dashboard
                </h1>
                <p style={{ fontSize: '14px', color: '#666' }}>Manage employees, attendance, leave requests, and more</p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Employees</div>
                        <div style={{ fontSize: '24px' }}>👥</div>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '700' }}>{stats.totalEmployees}</div>
                    <div style={{ fontSize: '12px', color: '#10b981', marginTop: '8px' }}>{stats.activeEmployees} active</div>
                </div>
                <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>On Leave</div>
                        <div style={{ fontSize: '24px' }}>🏖️</div>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>{stats.onLeave}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Currently away</div>
                </div>
                <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Pending Requests</div>
                        <div style={{ fontSize: '24px' }}>📋</div>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>{stats.pendingLeaves}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Awaiting approval</div>
                </div>
                <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Departments</div>
                        <div style={{ fontSize: '24px' }}>🏢</div>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6' }}>{stats.departments}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Active departments</div>
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

            {/* Recent Leave Requests */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Recent Leave Requests</h2>
                    <button onClick={() => navigate('/hr/leaves')} style={{ fontSize: '12px', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' }}>View All →</button>
                </div>
                {recentLeaves.length === 0 ? (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '40px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                        <div>No leave requests found</div>
                    </div>
                ) : (
                    <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Employee</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Leave Type</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Duration</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Days</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentLeaves.map(leave => {
                                        const statusBadge = getLeaveStatusBadge(leave.status);
                                        return (
                                            <tr key={leave.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <div style={{ fontWeight: '500' }}>{leave.employee_name || `Employee #${leave.employee_id}`}</div>
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>{leave.leave_type_name || 'N/A'}</td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px' }}>
                                                    {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                                                </td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '500' }}>{leave.total_days} days</td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: statusBadge.bg, color: statusBadge.color }}>
                                                        {statusBadge.icon} {statusBadge.text}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Links Footer */}
            <div style={{ marginTop: '32px', padding: '20px', background: '#f9fafb', borderRadius: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>
                    💡 Tip: Use the Leave Balance module to track available leave days before approving requests.
                </p>
            </div>
        </motion.div>
    );
};

export default HRDashboard;