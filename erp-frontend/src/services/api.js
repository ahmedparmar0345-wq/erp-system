import axios from 'axios';

const api = axios.create({
  baseURL: window.location.hostname === 'localhost' ? '/api' : 'https://erp-backend.bonto.run/api',
});

// Request Interceptor: Add JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');

// ==================== CUSTOMERS ====================
export const getCustomers = () => api.get('/customers').then(res => res.data);
export const getCustomer = (id) => api.get(`/customers/${id}`).then(res => res.data);
export const createCustomer = (data) => api.post('/customers', data).then(res => res.data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data).then(res => res.data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`).then(res => res.data);

// ==================== PRODUCTS ====================
export const getProducts = () => api.get('/products').then(res => res.data);
export const getProduct = (id) => api.get(`/products/${id}`).then(res => res.data);
export const createProduct = (data) => api.post('/products', data).then(res => res.data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data).then(res => res.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`).then(res => res.data);
export const adjustStock = (id, data) => api.patch(`/products/${id}/stock`, data).then(res => res.data);

// ==================== SALES ORDERS ====================
export const getSalesOrders = () => api.get('/sales-orders').then(res => res.data);
export const getSalesOrder = (id) => api.get(`/sales-orders/${id}`).then(res => res.data);
export const createSalesOrder = (data) => api.post('/sales-orders', data).then(res => res.data);
export const updateOrderStatus = (id, status) => api.patch(`/sales-orders/${id}/status`, { status }).then(res => res.data);

// ==================== PURCHASE ORDERS ====================
export const getPurchaseOrders = () => api.get('/purchase-orders').then(res => res.data);
export const getPurchaseOrder = (id) => api.get(`/purchase-orders/${id}`).then(res => res.data);
export const createPurchaseOrder = (data) => api.post('/purchase-orders', data).then(res => res.data);
export const receivePurchaseOrder = (id) => api.post(`/purchase-orders/${id}/receive`).then(res => res.data);
export const getSuppliers = () => api.get('/suppliers').then(res => res.data);
export const createSupplier = (data) => api.post('/suppliers', data).then(res => res.data);

// ==================== EXPENSES ====================
export const getExpenses = (params) => api.get('/expenses', { params }).then(res => res.data);
export const getExpenseCategories = () => api.get('/expenses/categories').then(res => res.data);
export const createExpense = (data) => api.post('/expenses', data).then(res => res.data);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data).then(res => res.data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`).then(res => res.data);
export const getExpenseReport = (startDate, endDate) => api.get(`/expenses/reports/total?start_date=${startDate}&end_date=${endDate}`).then(res => res.data);

// ==================== ACCOUNTING & VOUCHERS ====================
export const getChartOfAccounts = () => api.get('/accounting/chart-of-accounts').then(res => res.data);
export const createAccount = (data) => api.post('/accounting/chart-of-accounts', data).then(res => res.data);
export const getVouchers = () => api.get('/accounting/vouchers').then(res => res.data);
export const getVoucher = (id) => api.get(`/accounting/vouchers/${id}`).then(res => res.data);
export const createPaymentVoucher = (data) => api.post('/accounting/vouchers/payment', data).then(res => res.data);
export const createReceiptVoucher = (data) => api.post('/accounting/vouchers/receipt', data).then(res => res.data);
export const createJournalVoucher = (data) => api.post('/accounting/vouchers/journal', data).then(res => res.data);
export const approveVoucher = (id, signature) => api.patch(`/accounting/vouchers/${id}/approve`, { signature }).then(res => res.data);
export const getTrialBalance = () => api.get('/accounting/reports/trial-balance').then(res => res.data);
export const getProfitLoss = (startDate, endDate) => api.get(`/accounting/reports/profit-loss?start_date=${startDate}&end_date=${endDate}`).then(res => res.data);
export const getBalanceSheet = (asOfDate) => api.get(`/accounting/reports/balance-sheet?as_of=${asOfDate}`).then(res => res.data);

// ==================== ACCOUNTING REPORTS ====================
export const getGeneralLedger = (params) => api.get('/accounting-reports/general-ledger', { params }).then(res => res.data);
export const getAccountStatement = (accountId, params) => api.get(`/accounting-reports/account-statement/${accountId}`, { params }).then(res => res.data);
export const getTaxSummary = (params) => api.get('/accounting-reports/tax-summary', { params }).then(res => res.data);
export const getDashboardStats = () => api.get('/accounting-reports/dashboard-stats').then(res => res.data);

// ==================== HR / EMPLOYEES ====================
export const getEmployees = (params) => api.get('/hr/employees', { params }).then(res => res.data);
export const getEmployee = (id) => api.get(`/hr/employees/${id}`).then(res => res.data);
export const createEmployee = (data) => api.post('/hr/employees', data).then(res => res.data);
export const updateEmployee = (id, data) => api.put(`/hr/employees/${id}`, data).then(res => res.data);
export const updateEmployeeStatus = (id, status) => api.patch(`/hr/employees/${id}/status`, status).then(res => res.data);
export const getAttendance = (params) => api.get('/hr/attendance', { params }).then(res => res.data);
export const checkIn = (data) => api.post('/hr/attendance/check-in', data).then(res => res.data);
export const checkOut = (data) => api.post('/hr/attendance/check-out', data).then(res => res.data);
export const getLeaveTypes = () => api.get('/hr/leave-types').then(res => res.data);
export const getLeaveRequests = (params) => api.get('/hr/leave-requests', { params }).then(res => res.data);
export const createLeaveRequest = (data) => api.post('/hr/leave-requests', data).then(res => res.data);
export const approveLeaveRequest = (id) => api.patch(`/hr/leave-requests/${id}/approve`).then(res => res.data);
export const rejectLeaveRequest = (id) => api.patch(`/hr/leave-requests/${id}/reject`).then(res => res.data);

// ==================== RETURNS ====================
export const getReturnReasons = () => api.get('/returns/reasons').then(res => res.data);
export const getSalesReturns = () => api.get('/returns/sales').then(res => res.data);
export const getSalesReturn = (id) => api.get(`/returns/sales/${id}`).then(res => res.data);
export const createSalesReturn = (data) => api.post('/returns/sales', data).then(res => res.data);
export const approveSalesReturn = (id) => api.patch(`/returns/sales/${id}/approve`).then(res => res.data);
export const getPurchaseReturns = () => api.get('/returns/purchase').then(res => res.data);
export const createPurchaseReturn = (data) => api.post('/returns/purchase', data).then(res => res.data);

// ==================== POINT OF SALE (POS) ====================
export const openPosSession = () => api.post('/pos/session/open').then(res => res.data);
export const closePosSession = (data) => api.patch('/pos/session/close', data).then(res => res.data);
export const getCurrentSession = () => api.get('/pos/session/current').then(res => res.data);
export const getPosSessions = () => api.get('/pos/sessions').then(res => res.data);
export const getPosCart = () => api.get('/pos/cart').then(res => res.data);
export const addToCart = (data) => api.post('/pos/cart', data).then(res => res.data);
export const updateCartItem = (id, data) => api.put(`/pos/cart/${id}`, data).then(res => res.data);
export const removeFromCart = (id) => api.delete(`/pos/cart/${id}`).then(res => res.data);
export const clearCart = () => api.delete('/pos/cart/clear').then(res => res.data);
export const completeSale = (data) => api.post('/pos/complete-sale', data).then(res => res.data);
export const searchProducts = (query) => api.get(`/pos/search/product?q=${query}`).then(res => res.data);
export const getTodayStats = () => api.get('/pos/today-stats').then(res => res.data);
export const getTopProducts = () => api.get('/pos/top-products').then(res => res.data);
export const getReceipt = (orderId) => api.get(`/pos/receipt/${orderId}`, { responseType: 'text' }).then(res => res.data);

// ==================== SETTINGS & CMS ====================
export const getSettings = () => api.get('/settings').then(res => res.data);
export const updateSetting = (key, value) => api.put(`/settings/${key}`, { value }).then(res => res.data);
export const uploadLogo = (file) => {
  const formData = new FormData();
  formData.append('logo', file);
  return api.post('/settings/upload-logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data);
};
export const uploadFavicon = (file) => {
  const formData = new FormData();
  formData.append('favicon', file);
  return api.post('/settings/upload-favicon', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data);
};

// ==================== ROLES & PERMISSIONS ====================
export const getRoles = () => api.get('/settings/roles').then(res => res.data);
export const getRole = (id) => api.get(`/settings/roles/${id}`).then(res => res.data);
export const createRole = (data) => api.post('/settings/roles', data).then(res => res.data);
export const updateRole = (id, data) => api.put(`/settings/roles/${id}`, data).then(res => res.data);
export const deleteRole = (id) => api.delete(`/settings/roles/${id}`).then(res => res.data);

// ==================== USER MANAGEMENT ====================
export const getSystemUsers = () => api.get('/settings/users').then(res => res.data);
export const getSystemUser = (id) => api.get(`/settings/users/${id}`).then(res => res.data);
export const createSystemUser = (data) => api.post('/settings/users', data).then(res => res.data);
export const updateSystemUser = (id, data) => api.put(`/settings/users/${id}`, data).then(res => res.data);
export const deleteSystemUser = (id) => api.delete(`/settings/users/${id}`).then(res => res.data);
export const resetUserPassword = (id, newPassword) => api.post(`/settings/users/${id}/reset-password`, { new_password: newPassword }).then(res => res.data);

// ==================== AUDIT LOGS ====================
export const getAuditLogs = (params) => api.get('/settings/audit-logs', { params }).then(res => res.data);

// ==================== EMAIL TEMPLATES ====================
export const getEmailTemplates = () => api.get('/settings/email-templates').then(res => res.data);
export const getEmailTemplate = (code) => api.get(`/settings/email-templates/${code}`).then(res => res.data);
export const updateEmailTemplate = (code, data) => api.put(`/settings/email-templates/${code}`, data).then(res => res.data);

// ==================== SYSTEM ====================
export const getSystemInfo = () => api.get('/settings/system-info').then(res => res.data);
export const clearCache = () => api.post('/settings/clear-cache').then(res => res.data);
export const toggleMaintenance = (enabled) => api.post('/settings/maintenance', { enabled }).then(res => res.data);
export const createBackup = () => api.post('/settings/backup').then(res => res.data);

// ==================== QUOTATIONS ====================
export const getQuotations = () => api.get('/quotations').then(res => res.data);
export const getQuotation = (id) => api.get(`/quotations/${id}`).then(res => res.data);
export const createQuotation = (data) => api.post('/quotations', data).then(res => res.data);
export const updateQuotation = (id, data) => api.put(`/quotations/${id}`, data).then(res => res.data);
export const deleteQuotation = (id) => api.delete(`/quotations/${id}`).then(res => res.data);
export const updateQuotationStatus = (id, status) => api.patch(`/quotations/${id}/status`, { status }).then(res => res.data);
export const convertQuotationToOrder = (id) => api.post(`/quotations/${id}/convert`).then(res => res.data);

// ==================== SERVICES ====================
export const getServices = () => api.get('/services').then(res => res.data);
export const getService = (id) => api.get(`/services/${id}`).then(res => res.data);
export const createService = (data) => api.post('/services', data).then(res => res.data);
export const updateService = (id, data) => api.put(`/services/${id}`, data).then(res => res.data);
export const deleteService = (id) => api.delete(`/services/${id}`).then(res => res.data);
export const getServiceCategories = () => api.get('/services/categories').then(res => res.data);

// ==================== SERVICE INVOICES ====================
export const getServiceInvoices = () => api.get('/service-invoices').then(res => res.data);
export const getServiceInvoice = (id) => api.get(`/service-invoices/${id}`).then(res => res.data);
export const createServiceInvoice = (data) => api.post('/service-invoices', data).then(res => res.data);
export const updateServiceInvoice = (id, data) => api.put(`/service-invoices/${id}`, data).then(res => res.data);
export const deleteServiceInvoice = (id) => api.delete(`/service-invoices/${id}`).then(res => res.data);
export const updateServiceInvoiceStatus = (id, status) => api.patch(`/service-invoices/${id}/status`, { status }).then(res => res.data);

// ==================== TAX RATES ====================
export const getTaxRates = () => api.get('/tax').then(res => res.data);
export const getDefaultTaxRate = () => api.get('/tax/default').then(res => res.data);
export const createTaxRate = (data) => api.post('/tax', data).then(res => res.data);
export const updateTaxRate = (id, data) => api.put(`/tax/${id}`, data).then(res => res.data);
export const deleteTaxRate = (id) => api.delete(`/tax/${id}`).then(res => res.data);

export default api;