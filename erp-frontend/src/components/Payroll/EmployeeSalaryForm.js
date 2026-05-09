import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getEmployees } from '../../services/api';
import { getEmployeeSalary, saveEmployeeSalary } from '../../services/payroll';

const EmployeeSalaryForm = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        employee_id: '',
        basic_salary: '',
        house_rent_allowance: '',
        conveyance_allowance: '',
        medical_allowance: '',
        other_allowances: '',
        provident_fund: '',
        professional_tax: '',
        income_tax: '',
        loan_deduction: '',
        other_deductions: '',
        effective_from: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const data = await getEmployees();
            setEmployees(data);
        } catch (err) {
            console.error('Error fetching employees:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployeeSalary = async (employeeId) => {
        try {
            const data = await getEmployeeSalary(employeeId);
            if (data) {
                setFormData({
                    employee_id: employeeId,
                    basic_salary: data.basic_salary || '',
                    house_rent_allowance: data.house_rent_allowance || '',
                    conveyance_allowance: data.conveyance_allowance || '',
                    medical_allowance: data.medical_allowance || '',
                    other_allowances: data.other_allowances || '',
                    provident_fund: data.provident_fund || '',
                    professional_tax: data.professional_tax || '',
                    income_tax: data.income_tax || '',
                    loan_deduction: data.loan_deduction || '',
                    other_deductions: data.other_deductions || '',
                    effective_from: formData.effective_from
                });
            } else {
                setFormData({
                    ...formData,
                    employee_id: employeeId,
                    basic_salary: '',
                    house_rent_allowance: '',
                    conveyance_allowance: '',
                    medical_allowance: '',
                    other_allowances: '',
                    provident_fund: '',
                    professional_tax: '',
                    income_tax: '',
                    loan_deduction: '',
                    other_deductions: ''
                });
            }
        } catch (err) {
            console.error('Error fetching salary:', err);
        }
    };

    const handleEmployeeChange = (e) => {
        const employeeId = e.target.value;
        setSelectedEmployee(employeeId);
        if (employeeId) {
            fetchEmployeeSalary(employeeId);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const calculateTotals = () => {
        const basic = parseFloat(formData.basic_salary) || 0;
        const hra = parseFloat(formData.house_rent_allowance) || 0;
        const ca = parseFloat(formData.conveyance_allowance) || 0;
        const ma = parseFloat(formData.medical_allowance) || 0;
        const oa = parseFloat(formData.other_allowances) || 0;
        const totalEarnings = basic + hra + ca + ma + oa;

        const pf = parseFloat(formData.provident_fund) || 0;
        const pt = parseFloat(formData.professional_tax) || 0;
        const it = parseFloat(formData.income_tax) || 0;
        const ld = parseFloat(formData.loan_deduction) || 0;
        const od = parseFloat(formData.other_deductions) || 0;
        const totalDeductions = pf + pt + it + ld + od;

        const netSalary = totalEarnings - totalDeductions;

        return { totalEarnings, totalDeductions, netSalary };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await saveEmployeeSalary(formData);
            alert('Salary structure saved successfully!');
            navigate('/payroll');
        } catch (err) {
            console.error('Error saving salary:', err);
            alert('Failed to save salary structure');
        } finally {
            setSaving(false);
        }
    };

    const totals = calculateTotals();
    const selectedEmployeeName = employees.find(e => e.id == selectedEmployee)?.first_name + ' ' + employees.find(e => e.id == selectedEmployee)?.last_name;

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '60px' }}>Loading employees...</div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <div style={{ marginBottom: '24px' }}>
                <button onClick={() => navigate('/payroll')} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', marginBottom: '12px' }}>← Back to Dashboard</button>
                <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>Employee Salary Structure</h1>
                <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0' }}>Set up salary components for each employee</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Select Employee *</label>
                        <select value={selectedEmployee} onChange={handleEmployeeChange} required style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                            <option value="">Select Employee</option>
                            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_code})</option>)}
                        </select>
                    </div>

                    {selectedEmployee && (
                        <>
                            <div style={{ marginBottom: '20px', padding: '12px', background: '#f9fafb', borderRadius: '12px' }}>
                                <div><strong>Employee:</strong> {selectedEmployeeName}</div>
                                <div style={{ fontSize: '13px', color: '#666' }}>Set salary components below</div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Earnings</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                                    <div><label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Basic Salary</label><input type="number" name="basic_salary" value={formData.basic_salary} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px' }} /></div>
                                    <div><label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>House Rent Allowance</label><input type="number" name="house_rent_allowance" value={formData.house_rent_allowance} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px' }} /></div>
                                    <div><label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Conveyance Allowance</label><input type="number" name="conveyance_allowance" value={formData.conveyance_allowance} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px' }} /></div>
                                    <div><label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Medical Allowance</label><input type="number" name="medical_allowance" value={formData.medical_allowance} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px' }} /></div>
                                    <div><label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Other Allowances</label><input type="number" name="other_allowances" value={formData.other_allowances} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px' }} /></div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Deductions</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                                    <div><label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Provident Fund</label><input type="number" name="provident_fund" value={formData.provident_fund} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px' }} /></div>
                                    <div><label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Professional Tax</label><input type="number" name="professional_tax" value={formData.professional_tax} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px' }} /></div>
                                    <div><label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Income Tax</label><input type="number" name="income_tax" value={formData.income_tax} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px' }} /></div>
                                    <div><label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Loan Deduction</label><input type="number" name="loan_deduction" value={formData.loan_deduction} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px' }} /></div>
                                    <div><label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Other Deductions</label><input type="number" name="other_deductions" value={formData.other_deductions} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px' }} /></div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Effective From *</label>
                                <input type="date" name="effective_from" value={formData.effective_from} onChange={handleChange} required style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                            </div>

                            {/* Summary */}
                            <div style={{ background: '#f9fafb', borderRadius: '16px', padding: '16px', marginTop: '20px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Salary Summary</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Total Earnings:</span><span>${totals.totalEarnings.toFixed(2)}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Total Deductions:</span><span>${totals.totalDeductions.toFixed(2)}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '8px' }}><span>Net Salary:</span><span style={{ color: '#10b981' }}>${totals.netSalary.toFixed(2)}</span></div>
                            </div>
                        </>
                    )}
                </div>

                {selectedEmployee && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="button" onClick={() => navigate('/payroll')} style={{ padding: '12px 24px', background: '#f3f4f6', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" disabled={saving} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving...' : 'Save Salary Structure'}</button>
                    </div>
                )}
            </form>
        </motion.div>
    );
};

export default EmployeeSalaryForm;