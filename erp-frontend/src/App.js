import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DashboardCharts from './components/DashboardCharts';
import Customers from './components/Customers';
import Products from './components/Products';
import SalesOrders from './components/SalesOrders';
import Suppliers from './components/Suppliers';
import PurchaseOrders from './components/PurchaseOrders';
import Expenses from './components/Expenses';
import StockValueCard from './components/Reports/StockValueCard';
import StockLedger from './components/Reports/StockLedger';
import LowStockList from './components/Reports/LowStockList';
import StockMovement from './components/Reports/StockMovement';
import ProductionDashboard from './components/Production/ProductionDashboard';
import BOMList from './components/Production/BOMList';
import BOMForm from './components/Production/BOMForm';
import BOMDetail from './components/Production/BOMDetail';
import WorkOrderList from './components/Production/WorkOrderList';
import WorkOrderForm from './components/Production/WorkOrderForm';
import WorkOrderDetail from './components/Production/WorkOrderDetail';
import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Navbar';
import VoucherList from './components/Vouchers/VoucherList';
import CreateVoucher from './components/Vouchers/CreateVoucher';
import VoucherPrint from './components/Vouchers/VoucherPrint';
import VoucherPrintOutput from './components/Vouchers/VoucherPrintOutput';
import EmployeeList from './components/HR/EmployeeList';
import EmployeeForm from './components/HR/EmployeeForm';
import EmployeeDetail from './components/HR/EmployeeDetail';
import AttendanceTracker from './components/HR/AttendanceTracker';
import LeaveRequestsList from './components/HR/LeaveRequestsList';
import LeaveRequestForm from './components/HR/LeaveRequestForm';
import SettingsPage from './components/Settings/SettingsPage';
import POSLayout from './components/POS/POSLayout';
import ReportsDashboard from './components/AccountingReports/ReportsDashboard';
import BalanceSheet from './components/AccountingReports/BalanceSheet';
import IncomeStatement from './components/AccountingReports/IncomeStatement';
import TrialBalance from './components/AccountingReports/TrialBalance';
import AccountsReceivable from './components/AccountingReports/AccountsReceivable';
import AccountsPayable from './components/AccountingReports/AccountsPayable';
import AgingChart from './components/AccountingReports/AgingChart';
import CashFlow from './components/AccountingReports/CashFlow';
import GeneralLedger from './components/AccountingReports/GeneralLedger';
import TaxSummary from './components/AccountingReports/TaxSummary';
import LeaveBalance from './components/HR/LeaveBalance';
import HRDashboard from './components/HR/HRDashboard';
import MonthlyAttendanceReport from './components/HR/MonthlyAttendanceReport';
import PayrollDashboard from './components/Payroll/PayrollDashboard';
import PayrollPeriods from './components/Payroll/PayrollPeriods';
import EmployeeSalaryForm from './components/Payroll/EmployeeSalaryForm';
import PayrollRegister from './components/Payroll/PayrollRegister';
import PayslipView from './components/Payroll/PayslipView';
import ProcessPayroll from './components/Payroll/ProcessPayroll';
import PayslipsList from './components/Payroll/PayslipsList';
import SalesReturns from './components/Returns/SalesReturns';
import PurchaseReturns from './components/Returns/PurchaseReturns';
import Leads from './components/CRM/Leads';
import Opportunities from './components/CRM/Opportunities';
import WarehouseList from './components/Warehouses/WarehouseList';
import StockTransfer from './components/Warehouses/StockTransfer';
import ChartOfAccounts from './components/Accounting/ChartOfAccounts';
import CostCenters from './components/Accounting/CostCenters';
import Budgeting from './components/Accounting/Budgeting';
import BankReconciliation from './components/Accounting/BankReconciliation';
import RecurringEntries from './components/Accounting/RecurringEntries';
import FinancialRatios from './components/Accounting/FinancialRatios';
import Invoices from './components/Invoicing/Invoices';
import FixedAssets from './components/FixedAssets/FixedAssets';
import Projects from './components/Projects/Projects';
import ApprovalRequests from './components/Approvals/ApprovalRequests';
import QuotationList from './components/Quotations/QuotationList';
import QuotationForm from './components/Quotations/QuotationForm';
import QuotationDetail from './components/Quotations/QuotationDetail';
import ServiceList from './components/Services/ServiceList';
import ServiceForm from './components/Services/ServiceForm';
import ServiceInvoiceList from './components/Services/ServiceInvoiceList';
import ServiceInvoiceForm from './components/Services/ServiceInvoiceForm';
import ServiceInvoiceDetail from './components/Services/ServiceInvoiceDetail';
import TaxRateList from './components/Tax/TaxRateList';
import TaxRateForm from './components/Tax/TaxRateForm';
import BarcodeGenerator from './components/Barcode/BarcodeGenerator';
import AIBIDashboard from './components/AIBI/AIBIDashboard';
import SalesForecast from './components/AIBI/SalesForecast';
import ProductInsights from './components/AIBI/ProductInsights';
import CustomerInsights from './components/AIBI/CustomerInsights';
import AnomalyDetection from './components/AIBI/AnomalyDetection';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(prev => mobile ? false : prev);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const sidebarWidth = isMobile ? 0 : (sidebarOpen ? 260 : 80);

  return (
    <Router>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; overflow-x: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      `}</style>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div style={{ display: 'flex', minHeight: '100vh', maxWidth: '100vw', overflowX: 'hidden' }}>
                <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isMobile={isMobile} />
                <div style={{
                  flex: 1,
                  width: '100%',
                  maxWidth: '100%',
                  marginLeft: sidebarWidth,
                  transition: 'margin-left 0.3s ease',
                  minHeight: '100vh',
                  overflowX: 'hidden'
                }}>
                  <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} />
                  <div style={{
                    padding: isMobile ? '76px 12px 24px 12px' : '80px 24px 24px 24px',
                    minHeight: '100vh',
                    background: '#f5f7fa',
                    overflowX: 'hidden'
                  }}>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/dashboard-charts" element={<DashboardCharts />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/sales-orders" element={<SalesOrders />} />
                      <Route path="/suppliers" element={<Suppliers />} />
                      <Route path="/purchase-orders" element={<PurchaseOrders />} />
                      <Route path="/expenses" element={<Expenses />} />
                      <Route path="/reports" element={<StockValueCard />} />
                      <Route path="/reports/stock-ledger" element={<StockLedger />} />
                      <Route path="/reports/stock-movement" element={<StockMovement />} />
                      <Route path="/reports/low-stock" element={<LowStockList />} />
                      <Route path="/production" element={<ProductionDashboard />} />
                      <Route path="/production/dashboard" element={<ProductionDashboard />} />
                      <Route path="/production/boms" element={<BOMList />} />
                      <Route path="/production/boms/new" element={<BOMForm />} />
                      <Route path="/production/boms/:id" element={<BOMDetail />} />
                      <Route path="/production/boms/:id/edit" element={<BOMForm />} />
                      <Route path="/production/work-orders" element={<WorkOrderList />} />
                      <Route path="/production/work-orders/new" element={<WorkOrderForm />} />
                      <Route path="/production/work-orders/:id" element={<WorkOrderDetail />} />
                      <Route path="/vouchers" element={<VoucherList />} />
                      <Route path="/vouchers/create" element={<CreateVoucher />} />
                      <Route path="/vouchers/:id" element={<VoucherPrint />} />
                      <Route path="/vouchers/:id/printOutput" element={<VoucherPrintOutput />} />
                      <Route path="/hr" element={<HRDashboard />} />
                      <Route path="/hr/employees" element={<EmployeeList />} />
                      <Route path="/hr/employees/new" element={<EmployeeForm />} />
                      <Route path="/hr/employees/:id" element={<EmployeeDetail />} />
                      <Route path="/hr/employees/:id/edit" element={<EmployeeForm />} />
                      <Route path="/hr/attendance" element={<AttendanceTracker />} />
                      <Route path="/hr/leaves" element={<LeaveRequestsList />} />
                      <Route path="/hr/leaves/new" element={<LeaveRequestForm />} />
                      <Route path="/hr/leave-balances" element={<LeaveBalance />} />
                      <Route path="/hr/attendance-report" element={<MonthlyAttendanceReport />} />
                      <Route path="/payroll" element={<PayrollDashboard />} />
                      <Route path="/payroll/periods" element={<PayrollPeriods />} />
                      <Route path="/payroll/employee-salary" element={<EmployeeSalaryForm />} />
                      <Route path="/payroll/register" element={<PayrollRegister />} />
                      <Route path="/payroll/payslip/:id" element={<PayslipView />} />
                      <Route path="/payroll/process" element={<ProcessPayroll />} />
                      <Route path="/payroll/payslips" element={<PayslipsList />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/pos" element={<POSLayout />} />
                      <Route path="/accounting-reports" element={<ReportsDashboard />} />
                      <Route path="/accounting-reports/balance-sheet" element={<BalanceSheet />} />
                      <Route path="/accounting-reports/income-statement" element={<IncomeStatement />} />
                      <Route path="/accounting-reports/trial-balance" element={<TrialBalance />} />
                      <Route path="/accounting-reports/accounts-receivable" element={<AccountsReceivable />} />
                       <Route path="/accounting-reports/accounts-payable" element={<AccountsPayable />} />
                       <Route path="/accounting-reports/aging-summary" element={<AgingChart />} />
                      <Route path="/accounting-reports/cash-flow" element={<CashFlow />} />
                      <Route path="/accounting-reports/general-ledger" element={<GeneralLedger />} />
                      <Route path="/accounting-reports/tax-summary" element={<TaxSummary />} />
                      <Route path="/returns/sales" element={<SalesReturns />} />
                      <Route path="/returns/purchase" element={<PurchaseReturns />} />
                      <Route path="/crm/leads" element={<Leads />} />
                      <Route path="/crm/opportunities" element={<Opportunities />} />
                      <Route path="/warehouses" element={<WarehouseList />} />
                      <Route path="/warehouses/transfers" element={<StockTransfer />} />
                      <Route path="/accounting/chart-of-accounts" element={<ChartOfAccounts />} />
                      <Route path="/accounting/cost-centers" element={<CostCenters />} />
                      <Route path="/accounting/budgets" element={<Budgeting />} />
                      <Route path="/accounting/bank-reconciliation" element={<BankReconciliation />} />
                      <Route path="/accounting/recurring-entries" element={<RecurringEntries />} />
                      <Route path="/accounting/financial-ratios" element={<FinancialRatios />} />
                      <Route path="/invoices" element={<Invoices />} />
                      <Route path="/fixed-assets" element={<FixedAssets />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/quotations" element={<QuotationList />} />
                      <Route path="/quotations/new" element={<QuotationForm />} />
                      <Route path="/quotations/:id" element={<QuotationDetail />} />
                      <Route path="/quotations/:id/edit" element={<QuotationForm />} />
                      <Route path="/services" element={<ServiceList />} />
                      <Route path="/services/new" element={<ServiceForm />} />
                      <Route path="/services/:id/edit" element={<ServiceForm />} />
                      <Route path="/services/invoices" element={<ServiceInvoiceList />} />
                      <Route path="/services/invoices/new" element={<ServiceInvoiceForm />} />
                      <Route path="/services/invoices/:id" element={<ServiceInvoiceDetail />} />
                      <Route path="/services/invoices/:id/edit" element={<ServiceInvoiceForm />} />
                      <Route path="/tax" element={<TaxRateList />} />
                      <Route path="/tax/new" element={<TaxRateForm />} />
                      <Route path="/tax/:id/edit" element={<TaxRateForm />} />
                      <Route path="/barcodes" element={<BarcodeGenerator />} />
                      <Route path="/approvals" element={<ApprovalRequests />} />
                      <Route path="/ai-bi" element={<AIBIDashboard />} />
                      <Route path="/ai-bi/sales-forecast" element={<SalesForecast />} />
                      <Route path="/ai-bi/product-insights" element={<ProductInsights />} />
                      <Route path="/ai-bi/customer-insights" element={<CustomerInsights />} />
                      <Route path="/ai-bi/anomalies" element={<AnomalyDetection />} />
                      <Route path="/" element={<Navigate to="/dashboard" />} />
                      <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
