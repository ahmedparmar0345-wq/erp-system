import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getPayrollPeriods, getPayrollTransactions } from '../../services/payroll';

const PayslipsList = () => {
    const navigate = useNavigate();
    const [periods, setPeriods] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
            setTransactions(data.filter(t => t.status === 'paid'));
        } catch (err) {
            console.error('Error fetching transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => `$${(parseFloat(value) || 0).toFixed(2)}`;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <div style={{ marginBottom: '24px' }}>
                <button onClick={() => navigate('/payroll')} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', marginBottom: '12px' }}>← Back to Dashboard</button>
                <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>Payslips</h1>
                <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0' }}>View and print employee payslips</p>
            </div>

            <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Select Payroll Period</label>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                        >
                            <option value="">Select Period</option>
                            {periods.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.period_name} ({new Date(p.start_date).toLocaleDateString()} - {new Date(p.end_date).toLocaleDateString()})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {selectedPeriod && transactions.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                    <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>No payslips found</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Process payroll and mark salaries as paid to generate payslips.</div>
                </div>
            )}

            {selectedPeriod && transactions.length > 0 && (
                <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Employee</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Department</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Net Salary</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Payment Date</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(t => (
                                    <tr key={t.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ fontWeight: '500' }}>{t.first_name} {t.last_name}</div>
                                            <div style={{ fontSize: '11px', color: '#6b7280' }}>{t.employee_code}</div>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>{t.department || '-'}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(t.net_salary)}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>{t.payment_date ? new Date(t.payment_date).toLocaleDateString() : '-'}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            <button onClick={() => navigate(`/payroll/payslip/${t.id}`)} style={{ padding: '6px 12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>View & Print</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default PayslipsList;