import api from './api';

// ==================== ACCOUNTING REPORTS ====================

// Balance Sheet
export const getBalanceSheet = (params = {}) => api.get('/accounting-reports/balance-sheet', { params }).then(res => res.data);

// Income Statement (P&L)
export const getIncomeStatement = (params = {}) => api.get('/accounting-reports/income-statement', { params }).then(res => res.data);

// Trial Balance
export const getTrialBalance = (params = {}) => api.get('/accounting-reports/trial-balance', { params }).then(res => res.data);

// Accounts Receivable (Customer Aging)
export const getAccountsReceivable = () => api.get('/accounting-reports/accounts-receivable').then(res => res.data);

// Accounts Payable (Supplier Aging)
export const getAccountsPayable = () => api.get('/accounting-reports/accounts-payable').then(res => res.data);

// Aging Reports
export const getAgingReceivables = () => api.get('/accounting-reports/aging-receivables').then(res => res.data);
export const getAgingPayables = () => api.get('/accounting-reports/aging-payables').then(res => res.data);
export const getAgingSummary = () => api.get('/accounting-reports/aging-summary').then(res => res.data);

// Cash Flow Statement
export const getCashFlow = (params = {}) => api.get('/accounting-reports/cash-flow', { params }).then(res => res.data);

// General Ledger
export const getGeneralLedger = (params = {}) => api.get('/accounting-reports/general-ledger', { params }).then(res => res.data);

// Account Statement (Single Account)
export const getAccountStatement = (accountId, params = {}) => api.get(`/accounting-reports/account-statement/${accountId}`, { params }).then(res => res.data);

// Tax Summary
export const getTaxSummary = (params = {}) => api.get('/accounting-reports/tax-summary', { params }).then(res => res.data);

// Dashboard Stats (Quick KPIs)
export const getDashboardStats = () => api.get('/accounting-reports/dashboard-stats').then(res => res.data);

// Sales Register (Sales Transactions Report)
export const getSalesRegister = (params = {}) => api.get('/accounting-reports/sales-register', { params }).then(res => res.data);

// Purchase Register (Purchase Transactions Report)
export const getPurchaseRegister = (params = {}) => api.get('/accounting-reports/purchase-register', { params }).then(res => res.data);

// Customer Ledger (Specific Customer)
export const getCustomerLedger = (customerId, params = {}) => api.get(`/accounting-reports/customer-ledger/${customerId}`, { params }).then(res => res.data);

// Supplier Ledger (Specific Supplier)
export const getSupplierLedger = (supplierId, params = {}) => api.get(`/accounting-reports/supplier-ledger/${supplierId}`, { params }).then(res => res.data);

// Journal Ledger (All Journal Entries)
export const getJournalLedger = (params = {}) => api.get('/accounting-reports/journal-ledger', { params }).then(res => res.data);