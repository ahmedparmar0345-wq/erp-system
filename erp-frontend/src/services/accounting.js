import api from './api';

// Chart of Accounts
export const getChartOfAccounts = () => api.get('/accounting/chart-of-accounts');
export const createAccount = (data) => api.post('/accounting/chart-of-accounts', data);

// Vouchers
export const getVouchers = (params = {}) => api.get('/accounting/vouchers', { params });
export const getVoucher = (id) => api.get(`/accounting/vouchers/${id}`);
export const createPaymentVoucher = (data) => api.post('/accounting/vouchers/payment', data);
export const createReceiptVoucher = (data) => api.post('/accounting/vouchers/receipt', data);
export const createJournalVoucher = (data) => api.post('/accounting/vouchers/journal', data);
export const createContraVoucher = (data) => api.post('/accounting/vouchers/contra', data);
export const approveVoucher = (id, signatureBase64) => api.patch(`/accounting/vouchers/${id}/approve`, { signature: signatureBase64 });

// Reports
export const getTrialBalance = () => api.get('/accounting/reports/trial-balance');
export const getProfitLoss = (params = {}) => api.get('/accounting/reports/profit-loss', { params });
export const getBalanceSheet = (params = {}) => api.get('/accounting/reports/balance-sheet', { params });

// Accounting Reports
export const getGeneralLedger = (params = {}) => api.get('/accounting-reports/general-ledger', { params });
export const getAccountStatement = (accountId, params = {}) => api.get(`/accounting-reports/account-statement/${accountId}`, { params });
export const getTaxSummary = (params = {}) => api.get('/accounting-reports/tax-summary', { params });
export const getDashboardStats = () => api.get('/accounting-reports/dashboard-stats');