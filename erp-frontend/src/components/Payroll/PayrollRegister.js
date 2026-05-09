import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPayrollTransactions, updatePaymentStatus } from '../../services/payroll';
import { getPayrollPeriods } from '../../services/payroll';

const PayrollRegister = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [transactions, setTransactions] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const periodId = params.get('period');
        if (periodId) setSelectedPeriod(periodId);
        fetchPeriods();
    }, []);

    useEffect(() => {
        if (selectedPeriod) {
            fetchTransactions();
        }
    }, [selectedPeriod]);

    const fetchPeriods = async () => {
        try {
            const data = await getPayrollPeriods();
            setPeriods(data);
        } catch (err) {
            console.error('Error fetching periods:', err);
        }
    };

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const data = await getPayrollTransactions(selectedPeriod);
            setTransactions(data);
        } catch (err) {
            console.error('Error fetching transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentStatus = async (id, status) => {
        if (!window.confirm(`Mark this salary as ${status}?`)) return;

        setUpdating(true);
        try {
            await updatePaymentStatus(id, { status, payment_date: new Date().toISOString().split('T')[0], payment_method: 'Bank Transfer' });
            alert(`Salary marked as ${status}`);
            fetchTransactions();
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const getPeriodName = () => {
        const period = periods.find(p => p.id == selectedPeriod);
        return period ? period.period_name : 'Select Period';
    };

    const totalSalary = transactions.reduce((sum, t) => sum + (parseFloat(t.net_salary) || 0), 0);
    const totalPaid = transactions.filter(t => t.status === 'paid').reduce((sum, t) => sum + (parseFloat(t.net_salary) || 0), 0);
    const totalPending = totalSalary - totalPaid;

    const formatCurrency = (value) => `$${(parseFloat(value) || 0).toFixed(2)}`;

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '60px' }}>Loading payroll register...</div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
            <style>{`
                @media (max-width: 768px) {
                    .pr-header { flex-direction: column; align-items: stretch !important; text-align: center; }
                    .pr-stats { grid-template-columns: 1fr 1fr !important; }
                    .pr-actions-wrap { flex-wrap: wrap; }
                    .pr-actions-wrap button { flex: 1; min-width: 100px; text-align: center; }
                    .pr-period-bar { flex-direction: column; align-items: stretch !important; }
                    .pr-period-bar select { width: 100%; }
                    .pr-table tfoot { display: none; }
                    .pr-table tbody td[style*="right"] { text-align: right !important; }
                    .pr-table tbody td:before { margin-right: 0; display: inline; }
                    .pr-table tbody td { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; }
                }
                @media (max-width: 480px) {
                    .pr-stats { grid-template-columns: 1fr !important; }
                    .pr-table thead th:nth-child(3), .pr-table tbody td:nth-child(3) { display: none !important; }
                }
            `}</style>

            <div className="pr-header" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={() => navigate('/payroll')} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: 13, whiteSpace: 'nowrap' }}>← Dashboard</button>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>Salary Register</h1>
                    <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0' }}>View and manage employee salary payments</p>
                </div>
            </div>

            <div className="pr-period-bar" style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '24px', border: '1px solid #e5e7eb', display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Select Payroll Period</label>
                    <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: 14 }}>
                        <option value="">Select Period</option>
                        {periods.map(p => <option key={p.id} value={p.id}>{p.period_name} ({new Date(p.start_date).toLocaleDateString()} - {new Date(p.end_date).toLocaleDateString()})</option>)}
                    </select>
                </div>
                {selectedPeriod && <div style={{ fontSize: '13px', color: '#6b7280', padding: '10px 0', whiteSpace: 'nowrap' }}>Showing: <strong>{getPeriodName()}</strong></div>}
            </div>

            {selectedPeriod && transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
                    <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>No payroll data found</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Process payroll for this period first.</div>
                </div>
            ) : selectedPeriod && (
                <>
                    <div className="pr-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Salary</div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: '#6366f1' }}>{formatCurrency(totalSalary)}</div>
                        </div>
                        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Paid Amount</div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>{formatCurrency(totalPaid)}</div>
                        </div>
                        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Pending Amount</div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>{formatCurrency(totalPending)}</div>
                        </div>
                        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Employees</div>
                            <div style={{ fontSize: '24px', fontWeight: '700' }}>{transactions.length}</div>
                        </div>
                    </div>

                    <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table-modern pr-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Employee</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Department</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Attend Days</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Earnings</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Deductions</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Net Salary</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Status</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map(t => (
                                        <tr key={t.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td data-label="Employee" style={{ padding: '12px 16px' }}>
                                                <div style={{ fontWeight: '500' }}>{t.first_name} {t.last_name}</div>
                                                <div style={{ fontSize: '11px', color: '#6b7280' }}>{t.employee_code}</div>
                                            </td>
                                            <td data-label="Department" style={{ padding: '12px 16px' }}>{t.department || '-'}</td>
                                            <td data-label="Attend Days" style={{ padding: '12px 16px', textAlign: 'center' }}>{t.paid_days || t.attendance_days} / {t.attendance_days}</td>
                                            <td data-label="Earnings" style={{ padding: '12px 16px', textAlign: 'right' }}>{formatCurrency(t.total_earnings)}</td>
                                            <td data-label="Deductions" style={{ padding: '12px 16px', textAlign: 'right' }}>{formatCurrency(t.total_deductions)}</td>
                                            <td data-label="Net Salary" style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(t.net_salary)}</td>
                                            <td data-label="Status" style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: t.status === 'paid' ? '#d1fae5' : '#fef3c7', color: t.status === 'paid' ? '#065f46' : '#92400e' }}>
                                                    {t.status?.toUpperCase()}
                                                </span>
                                            </td>
                                            <td data-label="Action" style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                <div className="pr-actions-wrap" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    {t.status !== 'paid' && <button onClick={() => handlePaymentStatus(t.id, 'paid')} disabled={updating} style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Mark Paid</button>}
                                                    <button onClick={() => navigate(`/payroll/payslip/${t.id}`)} style={{ padding: '6px 12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Payslip</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr style={{ background: '#f9fafb', fontWeight: 'bold', borderTop: '2px solid #e5e7eb' }}>
                                        <td colSpan="3" style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px' }}>Total</td>
                                        <td data-label="Total Earnings" style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px' }}>{formatCurrency(transactions.reduce((s, t) => s + parseFloat(t.total_earnings || 0), 0))}</td>
                                        <td data-label="Total Deductions" style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px' }}>{formatCurrency(transactions.reduce((s, t) => s + parseFloat(t.total_deductions || 0), 0))}</td>
                                        <td data-label="Total Net" style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px' }}>{formatCurrency(transactions.reduce((s, t) => s + parseFloat(t.net_salary || 0), 0))}</td>
                                        <td colSpan="2"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div className="pr-total-mobile" style={{ display: 'none', padding: '16px', background: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: 8 }}>Totals</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}><span>Earnings:</span><span style={{ fontWeight: 500 }}>{formatCurrency(transactions.reduce((s, t) => s + parseFloat(t.total_earnings || 0), 0))}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}><span>Deductions:</span><span style={{ fontWeight: 500 }}>{formatCurrency(transactions.reduce((s, t) => s + parseFloat(t.total_deductions || 0), 0))}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, borderTop: '1px solid #d1d5db', paddingTop: 4 }}><span>Net Salary:</span><span>{formatCurrency(transactions.reduce((s, t) => s + parseFloat(t.net_salary || 0), 0))}</span></div>
                        </div>
                        <style>{`@media (max-width: 768px) { .pr-total-mobile { display: block !important; } }`}</style>
                    </div>
                </>
            )}
        </motion.div>
    );
};

export default PayrollRegister;
