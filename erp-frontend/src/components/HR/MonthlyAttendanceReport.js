import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MonthlyAttendanceReport = () => {
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [viewType, setViewType] = useState('summary');

    useEffect(() => {
        fetchEmployees();
        fetchReport();
    }, [selectedYear, selectedMonth, selectedEmployee]);

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/hr/employees', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setEmployees(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching employees:', err);
        }
    };

    const fetchReport = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            let url = `http://localhost:3000/api/hr/attendance/report/monthly?year=${selectedYear}&month=${selectedMonth}`;
            if (selectedEmployee) {
                url += `&employee_id=${selectedEmployee}`;
            }
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setReport(data);
        } catch (err) {
            console.error('Error fetching report:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployeeDetailReport = async (employeeId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/hr/attendance/report/employee/${employeeId}?year=${selectedYear}&month=${selectedMonth}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setReport(data);
            setViewType('detailed');
        } catch (err) {
            console.error('Error fetching employee detail:', err);
        } finally {
            setLoading(false);
        }
    };

    const goBackToSummary = () => {
        setSelectedEmployee(null);
        setViewType('summary');
        fetchReport();
    };

    const handlePrint = () => {
        const printContent = document.getElementById('report-print-area');
        if (!printContent) return;

        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (!printWindow) {
            alert('Please allow pop-ups to print');
            return;
        }

        const companyName = localStorage.getItem('company_name') || 'ERP System';
        const companyAddress = localStorage.getItem('company_address') || '';
        const companyPhone = localStorage.getItem('company_phone') || '';

        const styles = `
            <style>
                @page {
                    size: A4;
                    margin: 2cm;
                }
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Segoe UI', Arial, sans-serif;
                    font-size: 12px;
                    line-height: 1.4;
                    color: #1f2937;
                }
                .print-container {
                    max-width: 100%;
                    margin: 0 auto;
                }
                .print-header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #333;
                }
                .company-name {
                    font-size: 20px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .company-details {
                    font-size: 11px;
                    color: #555;
                    margin-bottom: 3px;
                }
                .report-title {
                    font-size: 16px;
                    font-weight: bold;
                    margin: 15px 0 5px;
                }
                .report-period {
                    font-size: 12px;
                    color: #666;
                    margin-bottom: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px 10px;
                    text-align: left;
                }
                th {
                    background-color: #f5f5f5;
                    font-weight: bold;
                }
                .text-center {
                    text-align: center;
                }
                .text-right {
                    text-align: right;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 10px;
                    border-top: 1px solid #ddd;
                    font-size: 9px;
                    color: #888;
                }
                .stats-grid {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 20px;
                }
                .stat-card {
                    flex: 1;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 12px;
                    text-align: center;
                }
                .stat-number {
                    font-size: 24px;
                    font-weight: bold;
                    margin-top: 5px;
                }
                .attendance-badge {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 10px;
                    font-weight: 500;
                }
            </style>
        `;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Attendance Report - ${report?.month_name} ${selectedYear}</title>
                ${styles}
            </head>
            <body>
                <div class="print-container">
                    <div class="print-header">
                        <div class="company-name">${escapeHtml(companyName)}</div>
                        ${companyAddress ? `<div class="company-details">${escapeHtml(companyAddress)}</div>` : ''}
                        ${companyPhone ? `<div class="company-details">📞 ${escapeHtml(companyPhone)}</div>` : ''}
                        <div class="report-title">MONTHLY ATTENDANCE REPORT</div>
                        <div class="report-period">${report?.month_name} ${selectedYear}</div>
                        <div class="report-period">Generated on: ${new Date().toLocaleString()}</div>
                    </div>
                    ${printContent.innerHTML}
                    <div class="footer">
                        This is a computer-generated report.
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 1000);
                    };
                <\/script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    const escapeHtml = (text) => {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    const getAttendanceRateColor = (rate) => {
        if (rate >= 90) return { bg: '#d1fae5', color: '#065f46' };
        if (rate >= 75) return { bg: '#fef3c7', color: '#92400e' };
        return { bg: '#fee2e2', color: '#991b1b' };
    };

    const getAttendanceStatusBadge = (status) => {
        const badges = {
            present: { bg: '#d1fae5', color: '#065f46', icon: '✅', label: 'Present' },
            absent: { bg: '#fee2e2', color: '#991b1b', icon: '❌', label: 'Absent' },
            late: { bg: '#fef3c7', color: '#92400e', icon: '⏰', label: 'Late' },
            half_day: { bg: '#fed7aa', color: '#9a3412', icon: '🌓', label: 'Half Day' },
            weekend: { bg: '#f3f4f6', color: '#6b7280', icon: '📅', label: 'Weekend' }
        };
        return badges[status] || badges.absent;
    };

    const months = [
        { value: 1, name: 'January' }, { value: 2, name: 'February' }, { value: 3, name: 'March' },
        { value: 4, name: 'April' }, { value: 5, name: 'May' }, { value: 6, name: 'June' },
        { value: 7, name: 'July' }, { value: 8, name: 'August' }, { value: 9, name: 'September' },
        { value: 10, name: 'October' }, { value: 11, name: 'November' }, { value: 12, name: 'December' }
    ];

    const years = [2023, 2024, 2025, 2026];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '40px' }}>📊</motion.div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Loading report...</div>
                </div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
            {/* Header - Hidden when printing */}
            <div className="no-print" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Monthly Attendance Report
                    </h1>
                    <p style={{ fontSize: '14px', color: '#666' }}>Track employee attendance, punctuality, and overtime</p>
                </div>
                <button onClick={handlePrint} style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🖨️ Print Report
                </button>
            </div>

            {/* Filters - Hidden when printing */}
            <div className="no-print" style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '24px', border: '1px solid #e5e7eb', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} style={{ padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} style={{ padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                    {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                </select>
                {viewType === 'summary' && (
                    <>
                        <select value={selectedEmployee || ''} onChange={(e) => setSelectedEmployee(e.target.value || null)} style={{ padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: '12px', minWidth: '200px' }}>
                            <option value="">All Employees</option>
                            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>)}
                        </select>
                        <button onClick={fetchReport} style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>Generate Report</button>
                    </>
                )}
                {viewType === 'detailed' && (
                    <button onClick={goBackToSummary} style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>← Back to Summary</button>
                )}
            </div>

            {/* Report Content for Printing */}
            <div id="report-print-area">
                {report && viewType === 'summary' && (
                    <div>
                        {/* Summary Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e5e7eb' }}>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Employees</div>
                                <div style={{ fontSize: '32px', fontWeight: '700' }}>{report.summary?.total_employees || 0}</div>
                            </div>
                            <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e5e7eb' }}>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Present Days</div>
                                <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>{report.summary?.total_present_days || 0}</div>
                            </div>
                            <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e5e7eb' }}>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Absent Days</div>
                                <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444' }}>{report.summary?.total_absent_days || 0}</div>
                            </div>
                            <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e5e7eb' }}>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>Working Days</div>
                                <div style={{ fontSize: '32px', fontWeight: '700' }}>{report.total_working_days}</div>
                            </div>
                        </div>

                        {/* Employees Table */}
                        <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                            <th style={{ padding: '16px', textAlign: 'left' }}>Employee</th>
                                            <th style={{ padding: '16px', textAlign: 'left' }}>Department</th>
                                            <th style={{ padding: '16px', textAlign: 'center' }}>Present</th>
                                            <th style={{ padding: '16px', textAlign: 'center' }}>Absent</th>
                                            <th style={{ padding: '16px', textAlign: 'center' }}>Late</th>
                                            <th style={{ padding: '16px', textAlign: 'center' }}>Half Day</th>
                                            <th style={{ padding: '16px', textAlign: 'center' }}>Attendance %</th>
                                            <th style={{ padding: '16px', textAlign: 'center' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.employees?.map(emp => {
                                            const attendanceRate = ((emp.total_days_present / report.total_working_days) * 100).toFixed(1);
                                            const rateColor = getAttendanceRateColor(attendanceRate);
                                            return (
                                                <tr key={emp.employee_id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                    <td style={{ padding: '16px' }}>
                                                        <div style={{ fontWeight: '500' }}>{emp.first_name} {emp.last_name}</div>
                                                        <div style={{ fontSize: '11px', color: '#6b7280' }}>{emp.employee_code}</div>
                                                    </td>
                                                    <td style={{ padding: '16px' }}>{emp.department || '-'}</td>
                                                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: '500', color: '#10b981' }}>{emp.total_days_present}</td>
                                                    <td style={{ padding: '16px', textAlign: 'center', color: '#ef4444' }}>{emp.absent_days}</td>
                                                    <td style={{ padding: '16px', textAlign: 'center', color: '#f59e0b' }}>{emp.late_days}</td>
                                                    <td style={{ padding: '16px', textAlign: 'center' }}>{emp.half_days}</td>
                                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: rateColor.bg, color: rateColor.color }}>
                                                            {attendanceRate}%
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                                        <button className="no-print" onClick={() => fetchEmployeeDetailReport(emp.employee_id)} style={{ padding: '6px 12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>View Details</button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Detailed Employee Report */}
                {report && viewType === 'detailed' && (
                    <div>
                        {/* Employee Header */}
                        <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: '20px', padding: '24px', marginBottom: '24px', color: 'white' }}>
                            <div style={{ fontSize: '14px', opacity: 0.7 }}>{report.employee?.employee_code}</div>
                            <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px' }}>{report.employee?.first_name} {report.employee?.last_name}</div>
                            <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '4px' }}>{report.employee?.department} • {report.employee?.position}</div>
                        </div>

                        {/* Statistics Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>Attendance Rate</div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>{report.statistics?.attendance_percentage || 0}%</div>
                            </div>
                            <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>Present Days</div>
                                <div style={{ fontSize: '28px', fontWeight: '700' }}>{report.statistics?.present_days || 0}</div>
                            </div>
                            <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>Absent Days</div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444' }}>{report.statistics?.absent_days || 0}</div>
                            </div>
                            <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>Late Days</div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>{report.statistics?.late_days || 0}</div>
                            </div>
                            <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>Overtime Hours</div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#8b5cf6' }}>{report.statistics?.total_overtime_hours || 0}</div>
                            </div>
                        </div>

                        {/* Daily Attendance Calendar */}
                        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e5e7eb' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Daily Attendance - {report.month_name} {report.year}</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(38px, 1fr))', gap: '6px' }} className="attendance-calendar-grid">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} style={{ textAlign: 'center', padding: '6px', fontWeight: '600', fontSize: '11px', color: '#6b7280' }}>{day}</div>
                                ))}
                                {report.daily_report?.map((day, idx) => {
                                    const statusBadge = getAttendanceStatusBadge(day.status);
                                    return (
                                        <div key={idx} style={{ textAlign: 'center', padding: '6px', borderRadius: '8px', background: statusBadge.bg, color: statusBadge.color }}>
                                            <div style={{ fontWeight: '500', fontSize: '13px' }}>{day.day}</div>
                                            <div style={{ fontSize: '9px' }}>{statusBadge.icon}</div>
                                        </div>
                                    );
                                })}
                            </div>
                            <style>{`@media (max-width: 480px) { .attendance-calendar-grid { grid-template-columns: repeat(7, minmax(32px, 1fr)) !important; gap: 4px !important; } }`}</style>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default MonthlyAttendanceReport;