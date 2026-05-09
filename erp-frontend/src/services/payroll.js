import api from './api';

// Payroll Periods
export const getPayrollPeriods = async () => {
    try {
        const response = await api.get('/hr/payroll/periods');
        // Axios returns data in response.data
        return response.data;
    } catch (error) {
        console.error('Error in getPayrollPeriods:', error);
        return [];
    }
};

export const createPayrollPeriod = (data) => api.post('/hr/payroll/periods', data).then(res => res.data);

// Employee Salary Structure
export const getEmployeeSalary = (employeeId) => api.get(`/hr/payroll/employee-salary/${employeeId}`).then(res => res.data);
export const saveEmployeeSalary = (data) => api.post('/hr/payroll/employee-salary', data).then(res => res.data);

// Payroll Processing
export const processPayroll = (periodId) => api.post('/hr/payroll/process', { period_id: periodId }).then(res => res.data);
export const getPayrollTransactions = async (periodId) => {
    try {
        const response = await api.get('/hr/payroll/transactions', { params: { period_id: periodId } });
        return response.data;
    } catch (error) {
        console.error('Error in getPayrollTransactions:', error);
        return [];
    }
};
export const updatePaymentStatus = (id, data) => api.patch(`/hr/payroll/transactions/${id}/status`, data).then(res => res.data);

// Payslip
export const getPayslip = (transactionId) => api.get(`/hr/payroll/payslip/${transactionId}`).then(res => res.data);