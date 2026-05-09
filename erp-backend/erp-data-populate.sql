-- ====================================================================
-- ERP DATABASE — RESET & POPULATE WITH REALISTIC DEMO DATA
-- ====================================================================
-- Usage: psql -U postgres -d your_db -f erp-data-populate.sql
--
-- What this script does:
--   • Truncates all business-data tables (data only, not structure)
--   • Re-inserts realistic, demo-quality data for every module
--   • Shows row-count summary at the end
--
-- Tables NOT touched (authentication / system):
--   users, roles, password_resets, sessions
-- ====================================================================

BEGIN;
SET session_replication_role = 'replica';

-- ====================================================================
-- TRUNCATE ALL BUSINESS TABLES
-- ====================================================================
TRUNCATE
  journal_entry_lines,
  journal_entries,
  chart_of_accounts,
  cost_centers,
  budgets,
  budget_items,
  bank_accounts,
  bank_transactions,
  reconciliation_reports,
  recurring_entries,
  recurring_entry_lines,
  expense_categories,
  expenses,
  asset_depreciation,
  asset_maintenance,
  fixed_assets,
  asset_categories,
  time_entries,
  project_members,
  project_tasks,
  projects,
  approval_logs,
  approval_requests,
  approval_steps,
  approval_workflows,
  stock_transfer_items,
  stock_transfers,
  product_warehouse_stock,
  warehouse_bins,
  warehouses,
  inventory_transactions,
  sales_return_items,
  sales_returns,
  purchase_return_items,
  purchase_returns,
  credit_notes,
  return_reasons,
  pos_transaction_items,
  pos_transactions,
  pos_cart,
  pos_sessions,
  service_invoice_items,
  service_invoices,
  invoice_items,
  invoices,
  payments,
  quotation_items,
  quotations,
  sales_order_items,
  sales_orders,
  purchase_order_items,
  purchase_orders,
  products,
  services,
  customers,
  suppliers,
  employees,
  attendance,
  leave_requests,
  leave_types,
  employee_documents,
  leads,
  opportunities,
  follow_ups,
  interactions,
  crm_email_templates,
  lead_sources,
  lead_statuses,
  email_templates,
  system_settings,
  audit_logs,
  tax_rates,
  companies
RESTART IDENTITY CASCADE;

SET session_replication_role = 'origin';

-- ====================================================================
-- 1.  COMPANIES
-- ====================================================================
INSERT INTO companies (name, tax_id, email, phone, address, currency)
VALUES (
  'NovaTech Solutions Inc.',
  '47-1284902',
  'info@novatech.com',
  '+1 (212) 555-8900',
  '350 Fifth Avenue, Suite 3200, New York, NY 10118',
  'USD'
);

-- ====================================================================
-- 2.  CHART OF ACCOUNTS
-- ====================================================================
INSERT INTO chart_of_accounts (company_id, account_code, account_name, account_type, parent_account_id, description, is_active) VALUES
(1, '1000', 'Cash & Bank',                  'asset',    NULL, 'Checking and savings accounts',                        true),
(1, '1100', 'Accounts Receivable',          'asset',    NULL, 'Amounts owed by customers',                            true),
(1, '1200', 'Inventory',                    'asset',    NULL, 'Product inventory on hand',                            true),
(1, '1300', 'Prepaid Expenses',             'asset',    NULL, 'Prepaid insurance, rent, etc.',                        true),
(1, '1400', 'Fixed Assets at Cost',         'asset',    NULL, 'Property, plant & equipment at cost',                  true),
(1, '1410', 'Accumulated Depreciation',     'asset',    NULL, 'Contra-asset (cumulative depreciation)',               true),
(1, '1500', 'Office Equipment',             'asset',    NULL, 'Computers, furniture, fixtures',                        true),
(1, '1510', 'Accum. Deprec. - Office Equip.','asset',   NULL, 'Contra (office equipment depreciation)',                true),
(1, '2000', 'Accounts Payable',             'liability', NULL, 'Amounts owed to suppliers',                            true),
(1, '2100', 'Sales Tax Payable',            'liability', NULL, 'Sales tax collected from customers',                   true),
(1, '2200', 'Payroll Liabilities',          'liability', NULL, 'Accrued salaries and withholdings',                     true),
(1, '2300', 'Accrued Expenses',             'liability', NULL, 'Accrued operating expenses',                            true),
(1, '3000', 'Common Stock',                 'equity',    NULL, 'Shareholder equity',                                   true),
(1, '3100', 'Retained Earnings',            'equity',    NULL, 'Cumulative retained earnings',                         true),
(1, '3200', 'Current Year Earnings',        'equity',    NULL, 'Current fiscal year profit / loss',                    true),
(1, '4000', 'Product Sales Revenue',        'revenue',   NULL, 'Revenue from product sales',                           true),
(1, '4100', 'Service Revenue',              'revenue',   NULL, 'Revenue from consulting and services',                 true),
(1, '5000', 'Cost of Goods Sold',           'expense',   NULL, 'Direct cost of products sold',                         true),
(1, '5100', 'Salaries & Wages Expense',     'expense',   NULL, 'Employee salaries and wages',                          true),
(1, '5200', 'Rent Expense',                 'expense',   NULL, 'Office and facility rent',                             true),
(1, '5300', 'Utilities Expense',            'expense',   NULL, 'Electricity, water, internet',                         true),
(1, '5400', 'Office Supplies Expense',      'expense',   NULL, 'Office supplies and consumables',                      true),
(1, '5500', 'Depreciation Expense',         'expense',   NULL, 'Fixed asset depreciation',                             true),
(1, '5600', 'Insurance Expense',            'expense',   NULL, 'Business insurance premiums',                          true),
(1, '5700', 'Marketing & Advertising',      'expense',   NULL, 'Ads, promotions, campaigns',                           true),
(1, '5800', 'Maintenance & Repairs',        'expense',   NULL, 'Equipment and facility maintenance',                   true),
(1, '5900', 'Bank Charges & Interest',      'expense',   NULL, 'Bank fees and loan interest',                          true);

-- ====================================================================
-- 3.  COST CENTERS
-- ====================================================================
INSERT INTO cost_centers (company_id, code, name, description, is_active) VALUES
(1, 'CC-ADMIN',  'Administration',   'General administrative operations',       true),
(1, 'CC-SALES',  'Sales & Marketing','Sales and marketing activities',          true),
(1, 'CC-ENG',    'Engineering',      'Product development and engineering',      true),
(1, 'CC-OPS',    'Operations',       'Warehouse, logistics, fulfillment',        true),
(1, 'CC-FIN',    'Finance',          'Accounting, finance, and reporting',       true);

-- ====================================================================
-- 4.  TAX RATES
-- ====================================================================
INSERT INTO tax_rates (company_id, name, rate, type, is_default, is_active, description) VALUES
(1, 'Standard VAT',     20.00, 'VAT', true,  true, 'Standard VAT rate 20%'),
(1, 'Reduced VAT',       5.00, 'VAT', false, true, 'Reduced VAT rate 5%'),
(1, 'Zero Rated',        0.00, 'VAT', false, true, 'Zero-rated supplies');

-- ====================================================================
-- 5.  PRODUCTS
-- ====================================================================
INSERT INTO products (company_id, sku, name, description, unit_price, cost_price, current_stock, reorder_level) VALUES
(1, 'SRV-DELL-R750',  'Dell PowerEdge R750xs Server',        'Enterprise rack server, Intel Xeon 16-core, 128GB RAM',     8499.00, 6200.00, 5,  2),
(1, 'SW-C9300-48P',   'Cisco Catalyst 9300 48-Port Switch',  'Managed GigE switch with PoE+ and 10Gb uplinks',           3299.00, 2400.00, 8,  2),
(1, 'UPS-SMT1500',    'APC Smart-UPS 1500VA',                 'Line-interactive UPS, LCD display, 1500VA/1000W',          899.00,  620.00,  12, 3),
(1, 'CBL-CAT6A-10',   'CAT6A Shielded Patch Cable 10ft',      'S/FTP stranded copper patch cable, 10ft',                  12.50,   5.80,   250, 50),
(1, 'SSD-SAMSUNG-3.8','Samsung PM9A3 3.84TB Enterprise SSD',  'NVMe PCIe 4.0, U.3, read-intensive, 3.84TB',              1249.00, 890.00,  15, 3),
(1, 'RAM-KING-64GB',  'Kingston 64GB DDR5-4800 ECC RAM',      'Server memory, DDR5 ECC Registered, 64GB module',          589.00,  410.00,  20, 5),
(1, 'HDD-SEAGATE-18T','Seagate Exos 18TB Enterprise HDD',     '7200 RPM SATA 6Gb/s, helium filled, 18TB',                 359.00,  245.00,  30, 5),
(1, 'CHR-AERON-B',    'Herman Miller Aeron Chair (Size B)',   'Ergonomic mesh task chair, fully adjustable',              1495.00, 950.00,  6,  2),
(1, 'DSK-UPLIFT-72',  'Uplift Standing Desk 72in',            'Height-adjustable standing desk, walnut top, 72x30',       899.00,  580.00,  4,  2),
(1, 'MNT-ERGOTRON-LX','Ergotron LX Dual Monitor Arm',         'Pneumatic dual-monitor arm, VESA 75/100, 14-25 lbs',       349.00,  220.00,  10, 3),
(1, 'KEY-MX-KEYS',    'Logitech MX Keys Wireless Keyboard',   'Full-size wireless keyboard, USB-C, backlit',              99.99,   62.00,   40, 10),
(1, 'MON-DELL-U2723', 'Dell UltraSharp U2723QE 27in 4K',      '27in IPS Black, 4K UHD, USB-C hub, height adjust',         719.99,  510.00,  8,  2),
(1, 'MOU-MX-MASTER',  'Logitech MX Master 3S Mouse',         'Wireless ergonomic mouse, 8K DPI, USB-C',                 79.99,   48.00,   35, 10),
(1, 'RPI-PI5-8GB',    'Raspberry Pi 5 8GB Starter Kit',       'RPi 5 8GB board, official PSU, case, 64GB microSD',       149.99,  105.00,  25, 5),
(1, 'ARD-MEGA-2560',  'Arduino Mega 2560 Rev3',               'ATmega2560 microcontroller board, 54 I/O pins',            48.99,   30.00,   20, 5),
(1, 'PRN-EPSON-T88',  'Epson TM-T88VI Thermal Printer',       'Receipt printer, USB+Ethernet, 8 ips, auto-cutter',       499.00,  340.00,  10, 3),
(1, 'SCN-ZEBRA-DS22', 'Zebra DS2208 2D Barcode Scanner',      'Handheld 2D imager, USB, plug-and-play',                  149.00,  95.00,   18, 5),
(1, 'RTR-UDM-PRO',    'Ubiquiti Dream Machine Pro',           'All-in-one gateway/switch/NVR, 10Gb SFP+',                499.00,  350.00,  7,  2),
(1, 'AP-UB-U6LR',     'Ubiquiti UniFi U6 Long-Range AP',      'WiFi 6 AP, dual-band, 5 GHz 4x4 MU-MIMO',                 179.00,  120.00,  15, 3),
(1, 'PCH-PANDUIT-24', 'Panduit 24-Port Cat6A Patch Panel',    '24-port shielded, 1U, angled, Cat6A certified',           89.00,   52.00,   0, 5);

-- ====================================================================
-- 6.  SERVICES
-- ====================================================================
INSERT INTO services (company_id, name, description, category, unit_price, is_active) VALUES
(1, 'IT Infrastructure Consulting',       'On-site IT architecture and infrastructure consulting',      'Consulting',  195.00, true),
(1, 'Network Design & Implementation',    'Fully managed network design and deployment',                  'Projects',   4500.00, true),
(1, 'Cloud Migration Service',            'End-to-end workload migration to cloud',                      'Projects',  12000.00, true),
(1, 'Managed IT Support (Monthly)',       '24/7 remote and on-site IT support',                         'Support',    2400.00, true),
(1, 'Data Backup & Disaster Recovery',    'Backup strategy, implementation, and DR testing',             'Projects',   3200.00, true),
(1, 'Cybersecurity Assessment',           'Vulnerability assessment, penetration testing, compliance',   'Consulting', 6500.00, true);

-- ====================================================================
-- 7.  SUPPLIERS
-- ====================================================================
INSERT INTO suppliers (company_id, name, email, phone, address) VALUES
(1, 'TechData Global Distribution',    'orders@techdataglobal.com',    '+1 (305) 555-0101', '1500 Distribution Blvd, Miami, FL 33101'),
(1, 'Ingram Micro Technology Solutions','sales@ingrammicrotech.com',  '+1 (949) 555-0102', '5 Technology Dr, Irvine, CA 92602'),
(1, 'ErgoOffice Supplies Inc.',        'customerservice@ergooffice.com','+1 (312) 555-0103','200 Commerce Pkwy, Chicago, IL 60601'),
(1, 'PrimeCable Industries LLC',       'info@primecable.com',         '+1 (214) 555-0104', '800 Fiber Ln, Dallas, TX 75201'),
(1, 'ComponentSource International',   'sales@componentsource.com',   '+1 (512) 555-0105', '500 Industrial Ave, Austin, TX 78701');

-- ====================================================================
-- 8.  CUSTOMERS
-- ====================================================================
INSERT INTO customers (company_id, name, email, phone, billing_address, shipping_address) VALUES
(1, 'Quantum Financial Group',    'accounts.payable@quantumfinancial.com', '+1 (212) 555-0201',
    '1 Wall Street, 15th Floor, New York, NY 10005',
    '1 Wall Street, Loading Dock B, New York, NY 10005'),
(1, 'MedHealth Systems Inc.',    'procurement@medhealth.com',             '+1 (617) 555-0202',
    '50 Hospital Rd, Suite 300, Boston, MA 02101',
    '50 Hospital Rd, Receiving Dock, Boston, MA 02101'),
(1, 'EduPrime University',       'purchasing@eduprime.edu',               '+1 (312) 555-0203',
    '100 College Ave, Admin Bldg, Chicago, IL 60607',
    '100 College Ave, Central Receiving, Chicago, IL 60607'),
(1, 'GreenLeaf Manufacturing Corp.','ap@greenleafmfg.com',               '+1 (503) 555-0204',
    '500 Industrial Dr, Suite A, Portland, OR 97201',
    '500 Industrial Dr, Gate 3, Portland, OR 97201'),
(1, 'Skyline Retail Group LLC',  'accounting@skylineretail.com',          '+1 (305) 555-0205',
    '800 Brickell Ave, Suite 1800, Miami, FL 33131',
    '800 Brickell Ave, Receiving, Miami, FL 33131');

-- ====================================================================
-- 9.  WAREHOUSES
-- ====================================================================
INSERT INTO warehouses (company_id, code, name, address, city, state, country, postal_code, phone, email, is_default, is_active) VALUES
(1, 'WH-NYC', 'NYC Main Warehouse',      '100 Warehouse Blvd',    'New York',    'NY', 'USA', '10001', '+1 (212) 555-0301', 'warehouse.nyc@novatech.com',  true,  true),
(1, 'WH-BOS', 'Boston East Distribution', '200 Logistics Way',     'Boston',      'MA', 'USA', '02101', '+1 (617) 555-0302', 'warehouse.bos@novatech.com', false, true),
(1, 'WH-SFO', 'San Francisco West Dist.','300 Port Dr',           'San Francisco','CA', 'USA', '94101', '+1 (415) 555-0303', 'warehouse.sfo@novatech.com', false, true);

-- ====================================================================
-- 10. WAREHOUSE BINS
-- ====================================================================
INSERT INTO warehouse_bins (company_id, warehouse_id, code, name, zone, aisle, rack, shelf) VALUES
(1, 1, 'A-01-01', 'Aisle A Rack 1 Shelf 1',  'Storage-A', 'A', '1', '1'),
(1, 1, 'A-01-02', 'Aisle A Rack 1 Shelf 2',  'Storage-A', 'A', '1', '2'),
(1, 1, 'A-01-03', 'Aisle A Rack 1 Shelf 3',  'Storage-A', 'A', '1', '3'),
(1, 1, 'A-02-01', 'Aisle A Rack 2 Shelf 1',  'Storage-A', 'A', '2', '1'),
(1, 1, 'A-02-02', 'Aisle A Rack 2 Shelf 2',  'Storage-A', 'A', '2', '2'),
(1, 1, 'B-01-01', 'Aisle B Rack 1 Shelf 1',  'Storage-B', 'B', '1', '1'),
(1, 1, 'B-01-02', 'Aisle B Rack 1 Shelf 2',  'Storage-B', 'B', '1', '2'),
(1, 2, 'E-01-01', 'East Aisle 1 Shelf 1',    'East-Stor', 'E', '1', '1'),
(1, 2, 'E-01-02', 'East Aisle 1 Shelf 2',    'East-Stor', 'E', '1', '2'),
(1, 3, 'W-01-01', 'West Aisle 1 Shelf 1',    'West-Stor', 'W', '1', '1');

-- ====================================================================
-- 11. PRODUCT WAREHOUSE STOCK
-- ====================================================================
INSERT INTO product_warehouse_stock (company_id, product_id, warehouse_id, bin_id, quantity, reserved_quantity, reorder_level) VALUES
(1, 1,  1, 1, 3,  0, 2),
(1, 2,  1, 2, 5,  1, 2),
(1, 3,  1, 3, 8,  1, 3),
(1, 4,  1, 4, 150,10,50),
(1, 5,  1, 5, 10, 2, 3),
(1, 6,  1, 6, 15, 2, 5),
(1, 7,  1, 7, 20, 3, 5),
(1, 8,  1, 1, 4,  0, 2),
(1, 9,  1, 2, 2,  0, 2),
(1, 10, 1, 3, 7,  1, 3),
(1, 11, 1, 4, 25, 5, 10),
(1, 12, 1, 5, 5,  0, 2),
(1, 13, 1, 6, 20, 3, 10),
(1, 14, 1, 7, 15, 2, 5),
(1, 15, 1, 1, 12, 0, 5),
(1, 16, 1, 2, 7,  1, 3),
(1, 17, 1, 3, 12, 2, 5),
(1, 18, 1, 4, 5,  0, 2),
(1, 19, 1, 5, 10, 1, 3),
(1, 1,  2, 8, 2,  0, 2),
(1, 4,  2, 9, 100,5, 50),
(1, 7,  3, 10,10, 1, 3);

-- ====================================================================
-- 12. EMPLOYEES
-- ====================================================================
INSERT INTO employees (company_id, employee_code, first_name, last_name, email, phone, department, position, hire_date, employment_type, salary, status) VALUES
(1, 'EMP-001', 'Sarah',    'Mitchell',   'sarah.mitchell@novatech.com',   '+1 (212) 555-1001', 'Finance',       'Chief Financial Officer',      '2021-03-15', 'Full-time', 180000.00, 'active'),
(1, 'EMP-002', 'James',    'Rodriguez',  'james.rodriguez@novatech.com',  '+1 (212) 555-1002', 'Engineering',   'VP of Engineering',            '2020-06-01', 'Full-time', 195000.00, 'active'),
(1, 'EMP-003', 'Emily',    'Chen',       'emily.chen@novatech.com',       '+1 (212) 555-1003', 'Human Resources','HR Director',                 '2022-01-10', 'Full-time', 130000.00, 'active'),
(1, 'EMP-004', 'Michael',  'Thompson',   'michael.thompson@novatech.com', '+1 (212) 555-1004', 'Sales',         'Sales Manager',                '2021-09-20', 'Full-time', 140000.00, 'active'),
(1, 'EMP-005', 'Lisa',     'Williams',   'lisa.williams@novatech.com',    '+1 (212) 555-1005', 'Operations',    'Operations Manager',           '2022-04-05', 'Full-time', 125000.00, 'active'),
(1, 'EMP-006', 'David',    'Kim',        'david.kim@novatech.com',        '+1 (212) 555-1006', 'Engineering',   'Lead Software Engineer',       '2021-11-01', 'Full-time', 155000.00, 'active'),
(1, 'EMP-007', 'Jessica',  'Patel',      'jessica.patel@novatech.com',    '+1 (212) 555-1007', 'Marketing',     'Marketing Director',           '2023-02-14', 'Full-time', 135000.00, 'active'),
(1, 'EMP-008', 'Robert',   'Johnson',    'robert.johnson@novatech.com',   '+1 (212) 555-1008', 'Operations',    'Warehouse Supervisor',         '2022-07-18', 'Full-time', 75000.00,  'active'),
(1, 'EMP-009', 'Amanda',   'Garcia',     'amanda.garcia@novatech.com',    '+1 (212) 555-1009', 'Finance',       'Senior Accountant',            '2023-05-22', 'Full-time', 95000.00,  'active'),
(1, 'EMP-010', 'Christopher','Lee',      'chris.lee@novatech.com',        '+1 (212) 555-1010', 'Support',       'IT Support Team Lead',         '2022-10-03', 'Full-time', 85000.00,  'active');

-- ====================================================================
-- 13. LEAVE TYPES
-- ====================================================================
INSERT INTO leave_types (company_id, name, code, default_days, is_paid, requires_approval) VALUES
(1, 'Annual Leave',   'AL', 20, true,  true),
(1, 'Sick Leave',     'SL', 12, true,  true),
(1, 'Casual Leave',   'CL', 5,  true,  true),
(1, 'Public Holiday', 'PH', 0,  true,  false),
(1, 'Unpaid Leave',   'UL', 0,  false, true);

-- ====================================================================
-- 14. LEAVE REQUESTS
-- ====================================================================
INSERT INTO leave_requests (company_id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status) VALUES
(1, 3, 1, '2026-02-10', '2026-02-14', 5, 'Family vacation',                 'approved'),
(1, 6, 2, '2026-03-03', '2026-03-04', 2, 'Medical appointment',             'approved'),
(1, 9, 1, '2026-04-01', '2026-04-05', 5, 'International travel',            'pending'),
(1, 8, 3, '2026-03-20', '2026-03-20', 1, 'Personal errand',                 'approved'),
(1, 4, 1, '2026-05-11', '2026-05-15', 5, 'Annual leave',                    'pending');

-- ====================================================================
-- 15. ATTENDANCE
-- ====================================================================
INSERT INTO attendance (company_id, employee_id, date, check_in, check_out, status) VALUES
(1, 1, '2026-04-01', '08:45', '17:30', 'present'),
(1, 2, '2026-04-01', '08:30', '18:00', 'present'),
(1, 3, '2026-04-01', '09:00', '17:00', 'present'),
(1, 4, '2026-04-01', '08:15', '16:45', 'present'),
(1, 5, '2026-04-01', '07:50', '16:30', 'present'),
(1, 6, '2026-04-01', '09:15', '17:45', 'present'),
(1, 7, '2026-04-01', '08:55', '17:15', 'present'),
(1, 8, '2026-04-01', '06:30', '15:00', 'present'),
(1, 9, '2026-04-01', '08:40', '17:20', 'present'),
(1, 10,'2026-04-01', '08:00', '17:00', 'present');

-- ====================================================================
-- 16. PURCHASE ORDERS
-- ====================================================================
INSERT INTO purchase_orders (company_id, supplier_id, po_number, order_date, expected_delivery_date, status, warehouse_id, subtotal, tax_total, grand_total, notes, payment_status) VALUES
(1, 1, 'PO-2025-0001', '2025-11-15', '2025-12-01', 'received', 1, 41740.00, 4174.00, 45914.00, 'Q4 server and networking refresh',            'paid'),
(1, 2, 'PO-2025-0002', '2025-12-05', '2025-12-20', 'received', 1, 17710.00, 1771.00, 19481.00, 'Office furniture and peripherals order',      'paid'),
(1, 1, 'PO-2026-0001', '2026-03-10', '2026-03-25', 'received', 1, 18695.00, 1869.50, 20564.50, 'H1 2026 IT equipment restock',                'unpaid'),
(1, 4, 'PO-2026-0002', '2026-04-01', '2026-04-15', 'sent',     1, 3125.00,  312.50,  3437.50,  'Cabling and infrastructure restock',          'unpaid');

-- ====================================================================
-- 17. PURCHASE ORDER ITEMS
-- ====================================================================
INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity) VALUES
-- PO-2025-0001: Dell servers + Cisco switches + SSDs + RAM
(1, 1,  3, 6200.00, 18600.00, 3),
(1, 2,  2, 2400.00, 4800.00,  2),
(1, 5,  5, 890.00,  4450.00,  5),
(1, 6,  10, 410.00, 4100.00,  10),
(1, 18, 3, 350.00,  1050.00,  3),
-- PO-2025-0002: Office chairs + desks + monitor arms + monitors
(2, 8,  4,  950.00, 3800.00,  4),
(2, 9,  3,  580.00, 1740.00,  3),
(2, 10, 5,  220.00, 1100.00,  5),
(2, 12, 5,  510.00, 2550.00,  5),
(2, 11, 10, 62.00,  620.00,   10),
(2, 13, 10, 48.00,  480.00,   10),
-- PO-2026-0001: More servers + SSDs + RAM + UPS + APs
(3, 1,  1, 6200.00, 6200.00,  0),
(3, 5,  3, 890.00,  2670.00,  0),
(3, 6,  5, 410.00,  2050.00,  0),
(3, 3,  5, 620.00,  3100.00,  0),
(3, 19, 8, 120.00,  960.00,   0),
-- PO-2026-0002: CAT6 cables + patch panels
(4, 4,  200, 5.80,  1160.00,  0),
(4, 20, 15, 52.00,  780.00,   0),
(4, 4,  100, 5.80,  580.00,   0),
(4, 3,  1,  620.00, 620.00,   0);

-- ====================================================================
-- 18. INVENTORY TRANSACTIONS
-- ====================================================================
INSERT INTO inventory_transactions (product_id, warehouse_id, type, quantity, reference_type, reference_id) VALUES
-- PO-2025-0001 received
(1,  1, 'in', 3,  'purchase_order', 1),
(2,  1, 'in', 2,  'purchase_order', 1),
(5,  1, 'in', 5,  'purchase_order', 1),
(6,  1, 'in', 10, 'purchase_order', 1),
(18, 1, 'in', 3,  'purchase_order', 1),
-- PO-2025-0002 received
(8,  1, 'in', 4,  'purchase_order', 2),
(9,  1, 'in', 3,  'purchase_order', 2),
(10, 1, 'in', 5,  'purchase_order', 2),
(12, 1, 'in', 5,  'purchase_order', 2),
(11, 1, 'in', 10, 'purchase_order', 2),
(13, 1, 'in', 10, 'purchase_order', 2);

-- ====================================================================
-- 19. SALES ORDERS
-- ====================================================================
INSERT INTO sales_orders (company_id, customer_id, order_number, order_date, status, warehouse_id, subtotal, tax_total, grand_total, notes, payment_status) VALUES
(1, 1, 'SO-2026-0001', '2026-01-10', 'shipped',   1, 11586.50, 1158.65, 12745.15, 'Q1 server infrastructure upgrade for Quantum Financial', 'paid'),
(1, 2, 'SO-2026-0002', '2026-02-05', 'shipped',   1, 6798.00,  679.80,  7477.80,  'MedHealth systems expansion order',                    'unpaid'),
(1, 3, 'SO-2026-0003', '2026-03-01', 'confirmed', 1, 5237.50,  523.75,  5761.25,  'EduPrime computer lab equipment',                       'unpaid'),
(1, 5, 'SO-2026-0004', '2026-03-22', 'confirmed', 1, 4178.00,  417.80,  4595.80,  'Skyline Retail POS hardware and peripherals',           'unpaid'),
(1, 4, 'SO-2026-0005', '2026-04-08', 'draft',     1, 1799.98,  180.00,  1979.98,  'GreenLeaf manufacturing floor IT upgrade',              'unpaid');

-- ====================================================================
-- 20. SALES ORDER ITEMS
-- ====================================================================
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
-- SO-2026-0001: 1x server + 1x switch + 2x SSD + 4x RAM
(1, 1,  1, 8499.00,  0.00, 8499.00),
(1, 2,  1, 3299.00,  5.00, 3134.05),
(1, 5,  2, 1249.00,  0.00, 2498.00),
(1, 6,  4, 589.00,   5.00, 2238.20),
-- SO-2026-0002: 3x UPS + 2x keyboard + 2x mouse + 1x monitor
(2, 3,  3, 899.00,   0.00, 2697.00),
(2, 11, 2, 99.99,    0.00, 199.98),
(2, 13, 2, 79.99,    0.00, 159.98),
(2, 12, 1, 719.99,   0.00, 719.99),
-- SO-2026-0003: 10x RPi kits + 5x Arduino + 3x barcode scanners + monitors
(3, 14, 10, 149.99,  5.00, 1424.91),
(3, 15, 5,  48.99,   0.00, 244.95),
(3, 17, 3,  149.00,  0.00, 447.00),
(3, 12, 2,  719.99,  0.00, 1439.98),
-- SO-2026-0004: 3x thermal printers + 4x scanners + 1x switch + 10x cables
(4, 16, 3,  499.00,  0.00, 1497.00),
(4, 17, 4,  149.00,  0.00, 596.00),
(4, 2,  1,  3299.00, 10.00, 2969.10),
-- SO-2026-0005: 2x mice + 2x keyboards + 1x monitor
(5, 13, 2,  79.99,   0.00, 159.98),
(5, 11, 2,  99.99,   0.00, 199.98),
(5, 12, 0,  719.99,  0.00, 0.00),
(5, 18, 1,  499.00,  0.00, 499.00);

-- Recalculate SO-2025-0005 properly
UPDATE sales_orders SET subtotal = 859.96, tax_total = 86.00, grand_total = 945.96 WHERE order_number = 'SO-2026-0005';

-- ====================================================================
-- 21. INVENTORY TRANSACTIONS (SALES)
-- ====================================================================
INSERT INTO inventory_transactions (product_id, warehouse_id, type, quantity, reference_type, reference_id) VALUES
-- SO-2026-0001 shipped
(1,  1, 'out', 1, 'sales_order', 1),
(2,  1, 'out', 1, 'sales_order', 1),
(5,  1, 'out', 2, 'sales_order', 1),
(6,  1, 'out', 4, 'sales_order', 1),
-- SO-2026-0002 shipped
(3,  1, 'out', 3, 'sales_order', 2),
(11, 1, 'out', 2, 'sales_order', 2),
(13, 1, 'out', 2, 'sales_order', 2),
(12, 1, 'out', 1, 'sales_order', 2);

UPDATE sales_order_items SET total = 1439.98 WHERE sales_order_id = 5 AND product_id = 12;

-- ====================================================================
-- 22. INVOICES
-- ====================================================================
INSERT INTO invoices (company_id, invoice_number, sales_order_id, customer_id, invoice_date, due_date, status, subtotal, tax_total, discount_total, grand_total, amount_paid, payment_terms, notes) VALUES
(1, 'INV-2026-0001', 1, 1, '2026-01-15', '2026-02-14', 'paid',       11586.50, 1158.65, 164.95, 12745.15, 12745.15, 'Net 30', 'Invoice for SO-2026-0001'),
(1, 'INV-2026-0002', 2, 2, '2026-02-10', '2026-03-12', 'overdue',    6798.00,  679.80,  0.00,   7477.80,  0.00,     'Net 30', 'Invoice for SO-2026-0002'),
(1, 'INV-2026-0003', 3, 3, '2026-03-05', '2026-04-04', 'sent',       5237.50,  523.75,  75.00,   5761.25,  0.00,     'Net 30', 'Invoice for SO-2026-0003');

-- ====================================================================
-- 23. INVOICE ITEMS
-- ====================================================================
INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total) VALUES
(1, 1,  'Dell PowerEdge R750xs Server',        1, 8499.00,  0.00, 10.00, 8499.00),
(1, 2,  'Cisco Catalyst 9300 48-Port Switch', 1, 3299.00,  5.00, 10.00, 3134.05),
(1, 5,  'Samsung PM9A3 3.84TB Enterprise SSD', 2, 1249.00,  0.00, 10.00, 2498.00),
(2, 3,  'APC Smart-UPS 1500VA',               3, 899.00,   0.00, 10.00, 2697.00),
(2, 11, 'Logitech MX Keys Keyboard',           2, 99.99,    0.00, 10.00, 199.98),
(2, 13, 'Logitech MX Master 3S Mouse',         2, 79.99,    0.00, 10.00, 159.98),
(2, 12, 'Dell UltraSharp U2723QE 27in 4K',     1, 719.99,   0.00, 10.00, 719.99),
(3, 14, 'Raspberry Pi 5 8GB Starter Kit',     10, 149.99,   5.00, 10.00, 1424.91),
(3, 15, 'Arduino Mega 2560 Rev3',              5, 48.99,    0.00, 10.00, 244.95),
(3, 17, 'Zebra DS2208 2D Barcode Scanner',     3, 149.00,   0.00, 10.00, 447.00),
(3, 12, 'Dell UltraSharp U2723QE 27in 4K',     2, 719.99,   0.00, 10.00, 1439.98);

-- ====================================================================
-- 24. PAYMENTS
-- ====================================================================
INSERT INTO payments (company_id, invoice_id, payment_number, payment_date, amount, payment_method, reference_number, notes) VALUES
(1, 1, 'PAY-2026-0001', '2026-02-10', 12745.15, 'Wire Transfer', 'WIRE-20260210-QFG', 'Payment received from Quantum Financial Group'),
(1, 2, 'PAY-2026-0002', '2026-03-20', 3000.00,  'Check',        'CHK-10452',         'Partial payment from MedHealth Systems');

-- ====================================================================
-- 25. JOURNAL ENTRIES
-- ====================================================================
INSERT INTO journal_entries (company_id, entry_date, voucher_no, voucher_type, total_debit, total_credit, status, reference_type, reference_id, description) VALUES
(1, '2026-01-01', 'JV-2026-0001', 'Opening',  500000.00, 500000.00, 'approved', NULL,       NULL, 'Opening balance journal entry for fiscal year 2026'),
(1, '2026-01-15', 'JV-2026-0002', 'Receipt',  12745.15,  12745.15,  'approved', 'invoice', 1,   'Sales revenue recognition for INV-2026-0001'),
(1, '2026-01-15', 'JV-2026-0003', 'Journal',  10830.20,  10830.20,  'approved', 'invoice', 1,   'Cost of goods sold for INV-2026-0001'),
(1, '2026-01-31', 'JV-2026-0004', 'Payment',  90000.00,  90000.00,  'approved', NULL,       NULL, 'Monthly payroll for January 2026'),
(1, '2026-01-31', 'JV-2026-0005', 'Payment',  15000.00,  15000.00,  'approved', NULL,       NULL, 'January rent payment'),
(1, '2026-02-10', 'JV-2026-0006', 'Receipt',  12745.15,  12745.15,  'approved', 'payment',  1,    'Payment received from Quantum Financial Group'),
(1, '2026-02-28', 'JV-2026-0007', 'Journal',  7500.00,   7500.00,   'draft',   NULL,       NULL, 'February utilities and office expenses');

-- ====================================================================
-- 26. JOURNAL ENTRY LINES
-- ====================================================================
INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
-- JV-0001: Opening Balance
(1, 1,  500000.00, 0.00,       'Opening cash and bank balance'),
(1, 13, 0.00,      500000.00,  'Opening common stock contribution'),
-- JV-0002: Invoice revenue recognition
(2, 2,  12745.15,  0.00,       'Accounts receivable - Quantum Financial'),
(2, 16, 0.00,      12745.15,   'Product sales revenue recognized'),
-- JV-0003: COGS for invoice 1
(3, 18, 8630.00,   0.00,       'Cost of goods sold - server & networking'),
(3, 3,  0.00,      8630.00,    'Inventory reduction'),
-- JV-0004: Payroll
(4, 19, 90000.00,  0.00,       'Salaries and wages expense'),
(4, 1,  0.00,      90000.00,   'Cash disbursement'),
-- JV-0005: Rent
(5, 20, 15000.00,  0.00,       'Rent expense - January 2026'),
(5, 1,  0.00,      15000.00,   'Rent payment'),
-- JV-0006: Payment received
(6, 1,  12745.15,  0.00,       'Cash received from Quantum Financial'),
(6, 2,  0.00,      12745.15,   'Accounts receivable settled'),
-- JV-0007: Estimated utilities
(7, 21, 5000.00,   0.00,       'Estimated utilities expense'),
(7, 24, 2500.00,   0.00,       'Office supplies expense'),
(7, 1,  0.00,      7500.00,    'Cash disbursement');
