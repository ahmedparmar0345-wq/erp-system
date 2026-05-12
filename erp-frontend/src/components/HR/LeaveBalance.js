import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const LeaveBalance = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [leaveBalances, setLeaveBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchData();
    }, [year]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [employeesRes, balancesRes] = await Promise.all([
                api.get('/hr/employees'),
                api.get('/hr/leave-balances', { params: { year } })
            ]);
            setEmployees(Array.isArray(employeesRes.data) ? employeesRes.data : []);
            setLeaveBalances(Array.isArray(balancesRes.data) ? balancesRes.data : []);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getBalancesForEmployee = (employeeId) => {
        return leaveBalances.filter(b => b.employee_id === employeeId);
    };

    const getBalanceDisplay = (balance, total) => {
        const remaining = balance?.remaining_days || 0;
        const totalDays = total || balance?.total_days || 0;
        const percentage = totalDays > 0 ? (remaining / totalDays) * 100 : 0;

        return (
            <div>
                <div style={{ fontWeight: '600' }}>
                    {remaining} / {totalDays} days
                </div>
                <div style={{
                    width: '100%',
                    height: '6px',
                    background: '#e5e7eb',
                    borderRadius: '3px',
                    marginTop: '6px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${Math.min(percentage, 100)}%`,
                        height: '100%',
                        background: remaining < 5 ? '#dc2626' : '#10b981',
                        borderRadius: '3px',
                        transition: 'width 0.3s ease'
                    }} />
                </div>
                {remaining < 5 && remaining > 0 && (
                    <div style={{ fontSize: '10px', color: '#dc2626', marginTop: '4px' }}>
                        Low balance warning
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        style={{ fontSize: '40px', marginBottom: '16px' }}
                    >
                        ⚖️
                    </motion.div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Loading leave balances...</div>
                </div>
            </div>
        );
    }

    const totalEmployees = employees.length;
    const leaveTypeNames = [...new Set(leaveBalances.map(b => b.leave_type_name).filter(Boolean))];
    const totalLeaveUsed = leaveBalances.reduce((sum, b) => sum + (b.used_days || 0), 0);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}
        >
            <style>{`
                @media (max-width: 768px) {
                    .lb-header { flex-direction: column; align-items: stretch !important; }
                    .lb-year-bar { flex-direction: column; align-items: stretch !important; text-align: center; }
                    .lb-year-btns { justify-content: center; }
                    .lb-legend { flex-direction: column; align-items: center; gap: 8px !important; }
                }
            `}</style>

            <div className="lb-header" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                    onClick={() => navigate('/hr')}
                    style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: 13, whiteSpace: 'nowrap' }}
                >
                    ← Dashboard
                </button>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0, background: 'linear-gradient(135deg, #1a1a2e, #16213e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Leave Balance Management
                    </h1>
                    <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0' }}>
                        Track and manage employee leave balances
                    </p>
                </div>
            </div>

            <div className="lb-year-bar" style={{
                background: 'white', borderRadius: '20px', padding: '16px 20px', marginBottom: '24px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
                border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
                <div>
                    <span style={{ fontWeight: '500' }}>Year:</span>
                    <span style={{ marginLeft: '8px', color: '#6366f1', fontWeight: '600', fontSize: '18px' }}>{year}</span>
                </div>
                <div className="lb-year-btns" style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => setYear(year - 1)} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: 13 }}>← Previous Year</button>
                    <button onClick={() => setYear(new Date().getFullYear())} style={{ padding: '8px 16px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '500', fontSize: 13 }}>Current Year</button>
                    <button onClick={() => setYear(year + 1)} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: 13 }}>Next Year →</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'white', borderRadius: '20px', padding: '16px 20px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Employees</div><div style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>{totalEmployees}</div></div>
                    <div style={{ fontSize: '32px' }}>👥</div>
                </div>
                <div style={{ background: 'white', borderRadius: '20px', padding: '16px 20px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Leave Types</div><div style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>{leaveTypeNames.length}</div></div>
                    <div style={{ fontSize: '32px' }}>📋</div>
                </div>
                <div style={{ background: 'white', borderRadius: '20px', padding: '16px 20px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Leave Used</div><div style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>{totalLeaveUsed} days</div></div>
                    <div style={{ fontSize: '32px' }}>📊</div>
                </div>
            </div>

            {employees.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '24px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                    <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>No employees found</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Add employees to manage leave balances.</div>
                    <button onClick={() => navigate('/hr/employees/new')} style={{ marginTop: '16px', padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>+ Add Employee</button>
                </div>
            ) : (
                <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Employee</th>
                                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Annual Leave</th>
                                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Sick Leave</th>
                                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Casual Leave</th>
                                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map(emp => {
                                    const balances = getBalancesForEmployee(emp.id);
                                    const annual = balances.find(b => b.code === 'AL') || { remaining_days: 0, total_days: 0 };
                                    const sick = balances.find(b => b.code === 'SL') || { remaining_days: 0, total_days: 0 };
                                    const casual = balances.find(b => b.code === 'CL') || { remaining_days: 0, total_days: 0 };
                                    return (
                                        <tr key={emp.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td data-label="Employee" style={{ padding: '16px' }}>
                                                <div style={{ fontWeight: '600' }}>{emp.first_name} {emp.last_name}</div>
                                                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{emp.employee_code}</div>
                                                <div style={{ fontSize: '11px', color: '#6b7280' }}>{emp.department || 'No department'}</div>
                                            </td>
                                            <td data-label="Annual Leave" style={{ padding: '16px', textAlign: 'center' }}>{getBalanceDisplay(annual, annual.total_days)}</td>
                                            <td data-label="Sick Leave" style={{ padding: '16px', textAlign: 'center' }}>{getBalanceDisplay(sick, sick.total_days)}</td>
                                            <td data-label="Casual Leave" style={{ padding: '16px', textAlign: 'center' }}>{getBalanceDisplay(casual, casual.total_days)}</td>
                                            <td data-label="Status" style={{ padding: '16px', textAlign: 'center' }}>
                                                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: emp.status === 'active' ? '#d1fae5' : '#fee2e2', color: emp.status === 'active' ? '#065f46' : '#991b1b' }}>
                                                    {emp.status === 'active' ? '✅ Active' : '❌ Inactive'}
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

            <div className="lb-legend" style={{ marginTop: '20px', padding: '12px 20px', background: '#f9fafb', borderRadius: '12px', display: 'flex', gap: '24px', justifyContent: 'center', fontSize: '11px', color: '#6b7280', flexWrap: 'wrap' }}>
                <span>🟢 Green = Good balance (≥5 days remaining)</span>
                <span>🔴 Red = Low balance (&lt;5 days remaining)</span>
                <span>📊 Bar shows percentage of remaining leave</span>
            </div>
        </motion.div>
    );
};

export default LeaveBalance;
