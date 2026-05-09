import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { getPayslip } from '../../services/payroll';

const PayslipView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [payslip, setPayslip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [companyInfo, setCompanyInfo] = useState({ name: 'ERP System', address: '', phone: '', email: '' });

    useEffect(() => {
        fetchPayslip();
        fetchCompanyInfo();
    }, [id]);

    const fetchPayslip = async () => {
        try {
            const data = await getPayslip(id);
            setPayslip(data);
        } catch (err) {
            console.error('Error fetching payslip:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanyInfo = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/settings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data && data.general) {
                setCompanyInfo({
                    name: data.general.company_name || 'ERP System',
                    address: data.general.company_address || '',
                    phone: data.general.company_phone || '',
                    email: data.general.company_email || ''
                });
            }
        } catch (err) {
            console.error('Error fetching company info:', err);
        }
    };

    const handlePrint = () => {
        const printContent = document.getElementById('payslip-print-area');
        if (!printContent) return;

        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (!printWindow) {
            alert('Please allow pop-ups to print');
            return;
        }

        const html = `
            <!DOCTYPE html>
            <html>
            <head><title>Payslip - ${payslip?.first_name} ${payslip?.last_name}</title>
            <style>
                @page { size: A4; margin: 1.5cm; }
                body { font-family: Arial, sans-serif; font-size: 12px; }
                .payslip-container { max-width: 800px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .company-name { font-size: 20px; font-weight: bold; }
                .payslip-title { font-size: 16px; margin-top: 10px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background: #f5f5f5; }
                .text-right { text-align: right; }
                .footer { text-align: center; margin-top: 20px; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
            </style>
            </head>
            <body><div class="payslip-container">${printContent.innerHTML}</div>
            <script>window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 1000); };<\/script>
            </body>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
    };

    const formatCurrency = (value) => `$${(parseFloat(value) || 0).toFixed(2)}`;

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '60px' }}>Loading payslip...</div>;
    }

    if (!payslip) {
        return <div style={{ textAlign: 'center', padding: '60px' }}>Payslip not found</div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <style>{`@media (min-width: 768px) { .payslip-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <button onClick={() => navigate('/payroll/register')} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>← Back</button>
                <button onClick={handlePrint} style={{ padding: '8px 16px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>🖨️ Print Payslip</button>
            </div>

            <div id="payslip-print-area" style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <div style={{ padding: '24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{companyInfo.name}</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>{companyInfo.address}</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>{companyInfo.phone}</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '12px' }}>PAYSLIP</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>For the period: {payslip.period_name}</div>
                    </div>

                    <div style={{ marginBottom: '20px', width: '100%' }}>
                        <div style={{ overflowX: 'auto' }}>
                        <table className="table-modern" style={{ width: '100%' }}>
                            <tbody>
                                <tr><td width="50%"><strong>Employee ID:</strong> {payslip.employee_code}</td><td><strong>Department:</strong> {payslip.department || '-'}</td></tr>
                                <tr><td><strong>Name:</strong> {payslip.first_name} {payslip.last_name}</td><td><strong>Position:</strong> {payslip.position || '-'}</td></tr>
                                <tr><td><strong>Bank:</strong> {payslip.bank_name || '-'}</td><td><strong>Account No:</strong> {payslip.bank_account_no || '-'}</td></tr>
                                <tr><td><strong>Paid Days:</strong> {payslip.paid_days} / {payslip.attendance_days}</td><td><strong>Payment Method:</strong> {payslip.payment_method || 'Bank Transfer'}</td></tr>
                            </tbody>
                        </table>
                        </div>
                    </div>

                    <div className="payslip-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                        <div><h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Earnings</h3>
                            <div style={{ overflowX: 'auto' }}>
                            <table className="table-modern" style={{ width: '100%' }}><tbody>
                                <tr><td>Basic Salary</td><td className="text-right">{formatCurrency(payslip.basic_salary)}</td></tr>
                                <tr><td>House Rent Allowance</td><td className="text-right">{formatCurrency(payslip.house_rent_allowance)}</td></tr>
                                <tr><td>Conveyance Allowance</td><td className="text-right">{formatCurrency(payslip.conveyance_allowance)}</td></tr>
                                <tr><td>Medical Allowance</td><td className="text-right">{formatCurrency(payslip.medical_allowance)}</td></tr>
                                <tr><td>Other Allowances</td><td className="text-right">{formatCurrency(payslip.other_allowances)}</td></tr>
                                <tr style={{ fontWeight: 'bold', borderTop: '1px solid #ddd' }}><td>Total Earnings</td><td className="text-right">{formatCurrency(payslip.total_earnings)}</td></tr>
                            </tbody></table>
                            </div>
                        </div>
                        <div><h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Deductions</h3>
                            <div style={{ overflowX: 'auto' }}>
                            <table className="table-modern" style={{ width: '100%' }}><tbody>
                                <tr><td>Provident Fund</td><td className="text-right">{formatCurrency(payslip.provident_fund)}</td></tr>
                                <tr><td>Professional Tax</td><td className="text-right">{formatCurrency(payslip.professional_tax)}</td></tr>
                                <tr><td>Income Tax</td><td className="text-right">{formatCurrency(payslip.income_tax)}</td></tr>
                                <tr><td>Loan Deduction</td><td className="text-right">{formatCurrency(payslip.loan_deduction)}</td></tr>
                                <tr><td>Other Deductions</td><td className="text-right">{formatCurrency(payslip.other_deductions)}</td></tr>
                                <tr style={{ fontWeight: 'bold', borderTop: '1px solid #ddd' }}><td>Total Deductions</td><td className="text-right">{formatCurrency(payslip.total_deductions)}</td></tr>
                            </tbody></table>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '20px', padding: '16px', background: '#f0fdf4', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Net Salary Payable</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(payslip.net_salary)}</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>(Amount in Words: {Math.floor(payslip.net_salary)} Only)</div>
                    </div>

                    <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#666' }}>
                        <div>Employee Signature</div>
                        <div>Authorized Signature</div>
                        <div>Company Stamp</div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PayslipView;