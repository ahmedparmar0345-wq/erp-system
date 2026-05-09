import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getPayrollPeriods, processPayroll } from '../../services/payroll';

const ProcessPayroll = () => {
    const navigate = useNavigate();
    const [periods, setPeriods] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [periodDetails, setPeriodDetails] = useState(null);

    useEffect(() => {
        fetchPeriods();
    }, []);

    const fetchPeriods = async () => {
        try {
            setLoading(true);
            const data = await getPayrollPeriods();
            setPeriods(data);
        } catch (err) {
            console.error('Error fetching periods:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePeriodSelect = (periodId) => {
        setSelectedPeriod(periodId);
        const period = periods.find(p => p.id == periodId);
        setPeriodDetails(period);
    };

    const handleProcessPayroll = async () => {
        if (!selectedPeriod) {
            alert('Please select a payroll period');
            return;
        }

        if (!window.confirm(`Process payroll for ${periodDetails?.period_name}? This will calculate salaries for all active employees.`)) {
            return;
        }

        setProcessing(true);
        try {
            const result = await processPayroll(selectedPeriod);
            alert(`Payroll processed successfully! ${result.employee_count} employees processed.`);
            navigate('/payroll/register');
        } catch (err) {
            console.error('Error processing payroll:', err);
            alert('Failed to process payroll: ' + (err.response?.data?.error || err.message));
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px' }}>
                <div>Loading payroll periods...</div>
            </div>
        );
    }

    const draftPeriods = periods.filter(p => p.status === 'draft');

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <div style={{ marginBottom: '24px' }}>
                <button onClick={() => navigate('/payroll')} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', marginBottom: '12px' }}>← Back to Dashboard</button>
                <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>Process Payroll</h1>
                <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0' }}>Calculate salaries for a payroll period</p>
            </div>

            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e5e7eb' }}>
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Select Payroll Period</label>
                    <select
                        value={selectedPeriod}
                        onChange={(e) => handlePeriodSelect(e.target.value)}
                        style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '14px' }}
                    >
                        <option value="">Select a period</option>
                        {draftPeriods.map(p => (
                            <option key={p.id} value={p.id}>{p.period_name} ({new Date(p.start_date).toLocaleDateString()} - {new Date(p.end_date).toLocaleDateString()})</option>
                        ))}
                    </select>
                    {draftPeriods.length === 0 && (
                        <p style={{ color: '#f59e0b', fontSize: '13px', marginTop: '8px' }}>
                            No draft periods available. Please create a new payroll period first.
                        </p>
                    )}
                </div>

                {periodDetails && (
                    <div style={{ background: '#f9fafb', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Period Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div><strong>Period Name:</strong> {periodDetails.period_name}</div>
                            <div><strong>Status:</strong> <span style={{ padding: '2px 8px', background: '#fef3c7', borderRadius: '12px', fontSize: '12px' }}>{periodDetails.status}</span></div>
                            <div><strong>Start Date:</strong> {new Date(periodDetails.start_date).toLocaleDateString()}</div>
                            <div><strong>End Date:</strong> {new Date(periodDetails.end_date).toLocaleDateString()}</div>
                        </div>
                    </div>
                )}

                <div style={{ background: '#f0fdf4', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>What will happen?</h3>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#666' }}>
                        <li>Calculate salaries based on attendance records</li>
                        <li>Apply proration for joined/resigned employees</li>
                        <li>Calculate earnings and deductions as per salary structure</li>
                        <li>Generate payroll transactions for each employee</li>
                    </ul>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button onClick={() => navigate('/payroll')} style={{ padding: '12px 24px', background: '#f3f4f6', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>Cancel</button>
                    <button
                        onClick={handleProcessPayroll}
                        disabled={!selectedPeriod || processing}
                        style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: !selectedPeriod || processing ? 'not-allowed' : 'pointer',
                            opacity: !selectedPeriod || processing ? 0.6 : 1
                        }}
                    >
                        {processing ? 'Processing...' : 'Process Payroll'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProcessPayroll;