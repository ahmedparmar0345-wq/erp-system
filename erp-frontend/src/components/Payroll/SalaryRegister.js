import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SalaryRegister = () => {
    const navigate = useNavigate();
    const [periods, setPeriods] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPeriods();
    }, []);

    useEffect(() => {
        if (selectedPeriod) {
            loadTransactions();
        }
    }, [selectedPeriod]);

    const loadPeriods = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3000/api/hr/payroll/periods', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setPeriods(data);
            if (data && data.length > 0) {
                setSelectedPeriod(data[0].id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadTransactions = async () => {
        if (!selectedPeriod) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/api/hr/payroll/transactions?period_id=${selectedPeriod}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setTransactions(data);
        } catch (err) {
            console.error(err);
        }
    };

    const formatMoney = (val) => `$${(val || 0).toFixed(2)}`;

    if (loading) {
        return <div style={{ padding: '20px' }}>Loading...</div>;
    }

    if (periods.length === 0) {
        return (
            <div style={{ padding: '20px' }}>
                <p>No payroll periods found.</p>
                <button onClick={() => navigate('/payroll/periods')}>Create Period</button>
            </div>
        );
    }

    // Simple display
    return (
        <div style={{ padding: '20px' }}>
            <button onClick={() => navigate('/payroll')}>← Back</button>

            <h1>Salary Register</h1>

            <div>
                <label>Period: </label>
                <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                    {periods.map(p => (
                        <option key={p.id} value={p.id}>{p.period_name}</option>
                    ))}
                </select>
            </div>

            {transactions.length === 0 ? (
                <p>No transactions found. Process payroll first.</p>
            ) : (
                <div>
                    <p>Total transactions: {transactions.length}</p>
                    {transactions.map(t => (
                        <div key={t.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
                            {t.first_name} {t.last_name} - {formatMoney(t.net_salary)} - {t.status}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SalaryRegister;