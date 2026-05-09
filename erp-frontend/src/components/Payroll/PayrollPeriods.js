import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getPayrollPeriods, createPayrollPeriod, processPayroll } from '../../services/payroll';

const PayrollPeriods = () => {
    const navigate = useNavigate();
    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        period_name: '',
        start_date: '',
        end_date: '',
        notes: ''
    });
    const [processing, setProcessing] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createPayrollPeriod(formData);
            setShowModal(false);
            setFormData({ period_name: '', start_date: '', end_date: '', notes: '' });
            fetchPeriods();
            alert('Payroll period created successfully!');
        } catch (err) {
            console.error('Error creating period:', err);
            alert('Failed to create payroll period');
        }
    };

    const handleProcessPayroll = async (periodId) => {
        if (!window.confirm('Process payroll for this period? This will calculate salaries for all active employees.')) return;

        setProcessing(true);
        try {
            await processPayroll(periodId);
            alert('Payroll processed successfully!');
            fetchPeriods();
        } catch (err) {
            console.error('Error processing payroll:', err);
            alert('Failed to process payroll');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            draft: { bg: '#fef3c7', color: '#92400e', label: 'Draft' },
            processed: { bg: '#d1fae5', color: '#065f46', label: 'Processed' },
            approved: { bg: '#dbeafe', color: '#1e40af', label: 'Approved' },
            paid: { bg: '#e0e7ff', color: '#3730a3', label: 'Paid' }
        };
        const badge = badges[status] || badges.draft;
        return <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: badge.bg, color: badge.color }}>{badge.label}</span>;
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '60px' }}>Loading payroll periods...</div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <button onClick={() => navigate('/payroll')} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', marginBottom: '12px' }}>← Back to Dashboard</button>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>Payroll Periods</h1>
                    <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0' }}>Manage monthly payroll cycles</p>
                </div>
                <button onClick={() => setShowModal(true)} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>+ New Payroll Period</button>
            </div>

            {periods.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                    <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>No payroll periods found</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Click "New Payroll Period" to create your first payroll cycle.</div>
                </div>
            ) : (
                <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                    <th style={{ padding: '16px', textAlign: 'left' }}>Period Name</th>
                                    <th style={{ padding: '16px', textAlign: 'left' }}>Start Date</th>
                                    <th style={{ padding: '16px', textAlign: 'left' }}>End Date</th>
                                    <th style={{ padding: '16px', textAlign: 'center' }}>Status</th>
                                    <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {periods.map(period => (
                                    <tr key={period.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '16px', fontWeight: '500' }}>{period.period_name}</td>
                                        <td style={{ padding: '16px' }}>{new Date(period.start_date).toLocaleDateString()}</td>
                                        <td style={{ padding: '16px' }}>{new Date(period.end_date).toLocaleDateString()}</td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>{getStatusBadge(period.status)}</td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                {period.status === 'draft' && (
                                                    <button onClick={() => handleProcessPayroll(period.id)} disabled={processing} style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Process Payroll</button>
                                                )}
                                                <button onClick={() => navigate(`/payroll/register?period=${period.id}`)} style={{ padding: '6px 12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>View Register</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Period Modal */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
                    <div style={{ background: 'white', borderRadius: '20px', padding: '24px', width: '450px', maxWidth: '90%' }} onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Create Payroll Period</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Period Name *</label><input type="text" value={formData.period_name} onChange={(e) => setFormData({ ...formData, period_name: e.target.value })} required style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} placeholder="e.g., January 2024" /></div>
                            <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Start Date *</label><input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} required style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} /></div>
                            <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>End Date *</label><input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} required style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} /></div>
                            <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Notes</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows="3" style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', resize: 'vertical' }} placeholder="Additional notes..." /></div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}><button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button><button type="submit" style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Create Period</button></div>
                        </form>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default PayrollPeriods;