-- ============================================================================
-- ERP DEMO DATA RESET & POPULATION SCRIPT
-- ============================================================================
-- This script DELETES all transactional data and re-inserts realistic demo
-- data for inspection, demo, or testing.
--
-- IMPORTANT SAFEGUARDS:
--   - Does NOT delete or modify table structures
--   - Does NOT touch auth tables (users, roles, system_settings, etc.)
--   - Keeps the existing company (Acme Corp, id=1) and all reference data
--   - All inserts use company_id = 1
--
-- Run with: psql -U postgres -d your_db_name -f seed-reset.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- SECTION 1: DELETE EXISTING DATA (children first to respect FK constraints)
-- ============================================================================

-- Approval Workflows
DELETE FROM approval_logs;
DELETE FROM approval_requests;
DELETE FROM approval_steps;
DELETE FROM approval_workflows;

-- Projects & Time
DELETE FROM time_entries;
DELETE FROM project_members;
DELETE FROM project_tasks;
DELETE FROM projects;

-- Fixed Assets
DELETE FROM asset_maintenance;
DELETE FROM asset_depreciation;
DELETE FROM fixed_assets;
DELETE FROM asset_categories;

-- Stock Transfers
DELETE FROM stock_transfer_items;
DELETE FROM stock_transfers;
DELETE FROM product_warehouse_stock;
DELETE FROM warehouse_bins;

-- Returns & Credit Notes
DELETE FROM credit_notes;
DELETE FROM purchase_return_items;
DELETE FROM purchase_returns;
DELETE FROM sales_return_items;
DELETE FROM sales_returns;

-- Services Invoicing
DELETE FROM service_invoice_items;
DELETE FROM service_invoices;
DELETE FROM services;

-- Quotations
DELETE FROM quotation_items;
DELETE FROM quotations;

-- POS
DELETE FROM pos_transaction_items;
DELETE FROM pos_transactions;
DELETE FROM pos_cart;
DELETE FROM pos_sessions;

-- CRM
DELETE FROM follow_ups;
DELETE FROM interactions;
DELETE FROM opportunities;
DELETE FROM leads;

-- Budgets & Cost Centers
DELETE FROM budget_items;
DELETE FROM budgets;
DELETE FROM recurring_entry_lines;
DELETE FROM recurring_entries;
DELETE FROM bank_transactions;
DELETE FROM reconciliation_reports;
DELETE FROM bank_accounts;
DELETE FROM cost_centers;

-- Accounting
DELETE FROM journal_entry_lines;
DELETE FROM journal_entries;

-- Invoicing & Payments
DELETE FROM invoice_items;
DELETE FROM payments;
DELETE FROM invoices;

-- Sales
DELETE FROM sales_order_items;
DELETE FROM sales_orders;

-- Purchasing
DELETE FROM purchase_order_items;
DELETE FROM purchase_orders;

-- Inventory
DELETE FROM inventory_transactions;

-- HR
DELETE FROM employee_documents;
DELETE FROM leave_requests;
DELETE FROM attendance;
DELETE FROM employees;

-- Products & Customers & Suppliers & Warehouses & Chart of Accounts
DELETE FROM products;
DELETE FROM customers;
DELETE FROM suppliers;
DELETE FROM warehouses;
DELETE FROM chart_of_accounts;

-- Expenses
DELETE FROM expenses;
DELETE FROM expense_categories;

-- ============================================================================
-- SECTION 2: RESET SEQUENCES
-- ============================================================================

ALTER SEQUENCE IF EXISTS approval_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS approval_requests_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS approval_steps_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS approval_workflows_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS time_entries_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS project_members_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS project_tasks_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS projects_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS asset_maintenance_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS asset_depreciation_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS fixed_assets_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS asset_categories_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS stock_transfer_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS stock_transfers_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS product_warehouse_stock_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS warehouse_bins_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS credit_notes_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS purchase_return_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS purchase_returns_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS sales_return_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS sales_returns_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS service_invoice_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS service_invoices_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS services_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS quotation_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS quotations_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS pos_transaction_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS pos_transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS pos_cart_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS pos_sessions_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS follow_ups_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS interactions_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS opportunities_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS leads_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS budget_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS budgets_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS recurring_entry_lines_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS recurring_entries_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS bank_transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS reconciliation_reports_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS bank_accounts_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS cost_centers_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS journal_entry_lines_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS journal_entries_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS invoice_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS invoices_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS payments_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS sales_order_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS sales_orders_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS purchase_order_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS purchase_orders_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS inventory_transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS employee_documents_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS leave_requests_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS attendance_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS employees_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS products_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS customers_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS suppliers_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS warehouses_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS chart_of_accounts_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS expenses_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS expense_categories_id_seq RESTART WITH 1;

-- ============================================================================
-- SECTION 3: INSERT REFERENCE / MASTER DATA
-- ============================================================================

-- ------------------------------------------------------------------
-- 3a. CHART OF ACCOUNTS
-- ------------------------------------------------------------------
INSERT INTO chart_of_accounts (id, company_id, account_code, account_name, account_type, parent_account_id, description, is_active) VALUES
-- Assets (1000-1999)
(1,  1, '1000', 'Cash - Operating Account',    'asset',     NULL, 'Business checking account at Chase Bank', true),
(2,  1, '1100', 'Accounts Receivable',          'asset',     NULL, 'Customer invoices outstanding', true),
(3,  1, '1200', 'Inventory - Raw Materials',    'asset',     NULL, 'Raw material stock value', true),
(4,  1, '1210', 'Inventory - Finished Goods',   'asset',     NULL, 'Finished product stock value', true),
(5,  1, '1300', 'Prepaid Expenses',             'asset',     NULL, 'Prepaid insurance, rent, etc.', true),
(6,  1, '1400', 'Fixed Assets - Equipment',     'asset',     NULL, 'Manufacturing and office equipment', true),
(7,  1, '1410', 'Fixed Assets - Vehicles',      'asset',     NULL, 'Company vehicles', true),
(8,  1, '1420', 'Fixed Assets - Buildings',     'asset',     NULL, 'Warehouse and office buildings', true),
(9,  1, '1500', 'Accumulated Depreciation',     'asset',     NULL, 'Contra-asset for accumulated depreciation', true),

-- Liabilities (2000-2999)
(10, 1, '2000', 'Accounts Payable',             'liability',  NULL, 'Supplier invoices outstanding', true),
(11, 1, '2100', 'Accrued Liabilities',          'liability',  NULL, 'Accrued expenses and salaries', true),
(12, 1, '2200', 'Short-Term Loans',             'liability',  NULL, 'Bank loans due within 12 months', true),
(13, 1, '2300', 'Sales Tax Payable',            'liability',  NULL, 'VAT / sales tax collected', true),
(14, 1, '2310', 'Income Tax Payable',           'liability',  NULL, 'Corporate income tax payable', true),

-- Equity (3000-3999)
(15, 1, '3000', 'Common Stock',                 'equity',     NULL, 'Share capital', true),
(16, 1, '3100', 'Retained Earnings',            'equity',     NULL, 'Accumulated retained earnings', true),
(17, 1, '3200', 'Current Year Earnings',        'equity',     NULL, 'Current fiscal year profit/loss', true),

-- Revenue (4000-4999)
(18, 1, '4000', 'Sales Revenue - Products',     'revenue',    NULL, 'Revenue from product sales', true),
(19, 1, '4100', 'Sales Revenue - Services',     'revenue',    NULL, 'Revenue from service contracts', true),
(20, 1, '4200', 'Other Income',                 'revenue',    NULL, 'Miscellaneous income', true),

-- Cost of Goods Sold (5000-5999)
(21, 1, '5000', 'Cost of Goods Sold',           'expense',    NULL, 'Direct cost of products sold', true),

-- Operating Expenses (6000-6999)
(22, 1, '6000', 'Salaries & Wages',             'expense',    NULL, 'Employee salaries and wages', true),
(23, 1, '6100', 'Rent & Utilities',             'expense',    NULL, 'Office and warehouse rent, electricity, water', true),
(24, 1, '6200', 'Office Supplies',              'expense',    NULL, 'Stationery, printer supplies, etc.', true),
(25, 1, '6300', 'Marketing & Advertising',      'expense',    NULL, 'Digital marketing, print ads, trade shows', true),
(26, 1, '6400', 'Travel & Entertainment',       'expense',    NULL, 'Business travel, client entertainment', true),
(27, 1, '6500', 'Depreciation Expense',         'expense',    NULL, 'Periodic depreciation charge', true),
(28, 1, '6600', 'Insurance Expense',            'expense',    NULL, 'Business insurance premiums', true),
(29, 1, '6700', 'Professional Fees',            'expense',    NULL, 'Legal, accounting, consulting fees', true),
(30, 1, '6800', 'Tax Expense',                  'expense',    NULL, 'Non-income taxes and licenses', true);

SELECT setval('chart_of_accounts_id_seq', 30);

-- ------------------------------------------------------------------
-- 3b. WAREHOUSES
-- ------------------------------------------------------------------
INSERT INTO warehouses (id, company_id, code, name, address, city, state, country, postal_code, phone, email, is_active, is_default) VALUES
(1, 1, 'WH-NYC',   'New York Central Warehouse',   '100 Industrial Blvd',    'New York',     'NY', 'USA', '10001', '+1-212-555-1000', 'nyc-wh@acmecorp.com', true,  true),
(2, 1, 'WH-CHI',   'Chicago Midwest Hub',          '4500 Logistics Ave',     'Chicago',      'IL', 'USA', '60607', '+1-312-555-2000', 'chi-wh@acmecorp.com', true, false),
(3, 1, 'WH-LAX',   'Los Angeles West Coast Depot', '7800 Pacific Highway',   'Los Angeles',  'CA', 'USA', '90045', '+1-310-555-3000', 'lax-wh@acmecorp.com', true, false);

SELECT setval('warehouses_id_seq', 3);

-- ------------------------------------------------------------------
-- 3c. WAREHOUSE BINS
-- ------------------------------------------------------------------
INSERT INTO warehouse_bins (company_id, warehouse_id, code, name, zone, aisle, rack, shelf, max_capacity, is_active) VALUES
(1, 1, 'NYC-A-01-01', 'Aisle A Rack 1 Shelf 1', 'Storage A', 'A', 'R1', 'S1', 500, true),
(1, 1, 'NYC-A-01-02', 'Aisle A Rack 1 Shelf 2', 'Storage A', 'A', 'R1', 'S2', 500, true),
(1, 1, 'NYC-B-01-01', 'Aisle B Rack 1 Shelf 1', 'Storage B', 'B', 'R1', 'S1', 300, true),
(1, 2, 'CHI-A-01-01', 'Chicago Aisle A Rack 1', 'Zone 1',    'A', 'R1', 'S1', 400, true),
(1, 2, 'CHI-A-01-02', 'Chicago Aisle A Rack 2', 'Zone 1',    'A', 'R2', 'S1', 400, true),
(1, 3, 'LAX-A-01-01', 'LA Aisle A Rack 1',       'Main',      'A', 'R1', 'S1', 600, true);

-- ------------------------------------------------------------------
-- 3d. EXPENSE CATEGORIES
-- ------------------------------------------------------------------
INSERT INTO expense_categories (id, company_id, name, description, is_active) VALUES
(1, 1, 'Office Rent',        'Monthly office and warehouse rent', true),
(2, 1, 'Utilities',          'Electricity, water, gas, internet', true),
(3, 1, 'Office Supplies',    'Stationery and office consumables', true),
(4, 1, 'Travel',             'Business travel and accommodation', true),
(5, 1, 'Marketing',          'Advertising and promotional costs', true),
(6, 1, 'Salaries',           'Employee payroll and benefits',     true),
(7, 1, 'Maintenance',        'Equipment and facility maintenance', true),
(8, 1, 'Professional Fees',  'Legal, accounting, consulting',     true);

SELECT setval('expense_categories_id_seq', 8);

-- ------------------------------------------------------------------
-- 3e. COST CENTERS
-- ------------------------------------------------------------------
INSERT INTO cost_centers (id, company_id, code, name, description, is_active) VALUES
(1, 1, 'CC-ADMIN',    'Administration',     'General administrative operations', true),
(2, 1, 'CC-SALES',    'Sales Department',   'Sales team operations and commissions', true),
(3, 1, 'CC-MFG',      'Manufacturing',      'Production and manufacturing', true),
(4, 1, 'CC-LOG',      'Logistics',          'Warehousing and distribution', true),
(5, 1, 'CC-RD',       'R&D',                'Research and development', true);

SELECT setval('cost_centers_id_seq', 5);

-- ------------------------------------------------------------------
-- 3f. BANK ACCOUNTS
-- ------------------------------------------------------------------
INSERT INTO bank_accounts (id, company_id, account_id, bank_name, account_number, account_name, opening_balance, as_of_date, is_active) VALUES
(1, 1, 1, 'Chase Bank',           '****1234', 'Acme Corp Operating Account',   250000.00, '2026-01-01', true),
(2, 1, 1, 'Bank of America',      '****5678', 'Acme Corp Reserve Account',     500000.00, '2026-01-01', true),
(3, 1, 1, 'Wells Fargo',          '****9012', 'Acme Corp Payroll Account',      75000.00, '2026-01-01', true);

SELECT setval('bank_accounts_id_seq', 3);

-- ============================================================================
-- SECTION 4: INSERT TRANSACTIONAL DATA
-- ============================================================================

-- ------------------------------------------------------------------
-- 4a. SUPPLIERS
-- ------------------------------------------------------------------
INSERT INTO suppliers (id, company_id, name, email, phone, address) VALUES
(1, 1, 'Precision Components Inc.',    'orders@precisioncomp.com',    '+1-800-555-0101', '200 Technology Park, Newark, NJ 07102'),
(2, 1, 'Global Materials Supply Co.',  'sales@globalmaterials.com',   '+1-800-555-0102', '1500 Commerce Blvd, Chicago, IL 60616'),
(3, 1, 'Pacific Rim Imports LLC',      'info@pacificrimimports.com',  '+1-310-555-0200', '880 Harbor Blvd, Long Beach, CA 90802'),
(4, 1, 'Apex Office Solutions',        'corpsales@apexoffice.com',    '+1-212-555-0300', '55 Madison Ave, New York, NY 10010'),
(5, 1, 'TechSource Electronics',       'quote@techsource.com',        '+1-408-555-0400', '3000 Innovation Dr, San Jose, CA 95134');

SELECT setval('suppliers_id_seq', 5);

-- ------------------------------------------------------------------
-- 4b. CUSTOMERS
-- ------------------------------------------------------------------
INSERT INTO customers (id, company_id, name, email, phone, billing_address, shipping_address) VALUES
(1, 1, 'TechNova Solutions',          'ap@technova.com',          '+1-617-555-1001', '500 Innovation Way, Boston, MA 02110', '500 Innovation Way, Boston, MA 02110'),
(2, 1, 'BuildRight Construction',     'purchasing@buildright.com', '+1-404-555-2001', '1200 Peachtree St, Atlanta, GA 30303', '1200 Peachtree St, Atlanta, GA 30303'),
(3, 1, 'MetroHealth Systems',         'procurement@metrohealth.org','+1-312-555-3001','800 Michigan Ave, Chicago, IL 60611', '800 Michigan Ave, Chicago, IL 60611'),
(4, 1, 'GreenField Agriculture Ltd.',  'orders@greenfieldag.com',   '+1-816-555-4001', '450 Farm Rd, Kansas City, MO 64101', '450 Farm Rd, Kansas City, MO 64101'),
(5, 1, 'Swift Logistics Inc.',        'accounting@swiftlog.com',   '+1-305-555-5001', '75 Port Blvd, Miami, FL 33101', '75 Port Blvd, Miami, FL 33101'),
(6, 1, 'Pinnacle Retail Group',       'vendors@pinnacleretail.com','+1-415-555-6001', '200 Market St, San Francisco, CA 94105', '200 Market St, San Francisco, CA 94105'),
(7, 1, 'Summit Education Trust',      'finance@summitedu.edu',     '+1-512-555-7001', '100 University Dr, Austin, TX 78701', '100 University Dr, Austin, TX 78701'),
(8, 1, 'Coastal Hospitality Corp.',   'procure@coastalhospitality.com','+1-206-555-8001','1500 Waterfront Pl, Seattle, WA 98101','1500 Waterfront Pl, Seattle, WA 98101');

SELECT setval('customers_id_seq', 8);

-- ------------------------------------------------------------------
-- 4c. PRODUCTS
-- ------------------------------------------------------------------
INSERT INTO products (id, company_id, sku, name, description, unit_price, cost_price, current_stock, reorder_level, tax_rate_id) VALUES
(1,  1, 'ELEC-001', 'Industrial Control Board v4',   'PCB-based motor controller, 24V, 10A',                   245.00,   140.00,  350,  50,  1),
(2,  1, 'ELEC-002', 'Precision Temperature Sensor',  'PT1000 RTD sensor, -50C to 300C, IP67',                   89.50,     52.00,  820, 100,  1),
(3,  1, 'ELEC-003', 'Servo Motor Drive Unit',        '3-phase servo drive, 400W, Modbus RTU',                   520.00,   310.00,  120,  25,  1),
(4,  1, 'MECH-001', 'Aluminum Mounting Bracket',     '6061 aluminum, 200x150mm, powder-coated',                 18.75,      9.50, 2500, 500,  2),
(5,  1, 'MECH-002', 'Stainless Steel Fastener Kit',  'M6-M12 bolts, nuts, washers, grade 316',                  34.00,     18.00, 1800, 300,  2),
(6,  1, 'MECH-003', 'Heavy-Duty Hinge Set',          'Steel hinge, zinc-plated, 100kg capacity',                42.00,     24.50,  600, 100,  2),
(7,  1, 'PACK-001', 'Corrugated Box 12x8x6',         'Single-wall corrugated, 32 ECT, bundle of 50',            28.50,     15.00, 5000, 800,  3),
(8,  1, 'PACK-002', 'Bubble Wrap Roll 50m',          'Anti-static bubble wrap, 500mm width, 50m roll',          45.00,     26.00,  300,  60,  3),
(9,  1, 'PACK-003', 'Polyester Strapping Kit',       '12mm strapping with tensioner, 100m coil',                22.00,     12.00,  400,  80,  3),
(10, 1, 'OFF-001',  'Ergonomic Office Chair Pro',    'Adjustable lumbar, mesh back, gas lift',                  420.00,   250.00,   45,  10,  1),
(11, 1, 'OFF-002',  'Standing Desk Converter',       'Height-adjustable 36-inch worktop, pneumatic',            295.00,   175.00,   30,   8,  1),
(12, 1, 'OFF-003',  'LED Desk Lamp Touch Control',   '5 brightness levels, USB charging port, 12W',              65.00,     38.00,  200,  40,  1),
(13, 1, 'RAW-001',  'Carbon Steel Sheet 4x8 14ga',   'Hot-rolled, pickled & oiled, 4x8 ft sheet',              120.00,     85.00,  150,  30,  2),
(14, 1, 'RAW-002',  'Copper Wire Spool 100m',        '14 AWG stranded copper, THHN insulation, 100m',           85.00,     55.00,  280,  50,  2),
(15, 1, 'RAW-003',  'Silicone Sealant Tube 300ml',   'Industrial grade, clear, paintable, 300ml cartridge',     12.50,      6.80, 1200, 200,  1);

SELECT setval('products_id_seq', 15);

-- ------------------------------------------------------------------
-- 4d. PRODUCT WAREHOUSE STOCK (per-warehouse inventory)
-- ------------------------------------------------------------------
INSERT INTO product_warehouse_stock (company_id, product_id, warehouse_id, quantity, reserved_quantity, reorder_level) VALUES
(1, 1,  1, 200, 10, 30),
(1, 1,  2, 100,  5, 20),
(1, 1,  3,  50,  0, 10),
(1, 2,  1, 500, 20, 60),
(1, 2,  2, 200, 15, 40),
(1, 3,  1,  80,  5, 15),
(1, 3,  2,  40,  0, 10),
(1, 4,  1, 1500,100,300),
(1, 4,  2, 1000, 50,200),
(1, 5,  1, 1200, 80,200),
(1, 5,  3,  600, 20,100),
(1, 6,  1, 400, 20, 60),
(1, 6,  2, 200, 10, 40),
(1, 7,  1, 3000,200,500),
(1, 7,  2, 2000,100,300),
(1, 8,  1, 200, 15, 40),
(1, 8,  3, 100,  5, 20),
(1, 9,  1, 300, 10, 50),
(1, 10, 1,  30,  5,  6),
(1, 10, 2,  15,  0,  4),
(1, 11, 1,  20,  3,  5),
(1, 11, 3,  10,  0,  3),
(1, 12, 1, 150, 10, 30),
(1, 12, 2,  50,  5, 10),
(1, 13, 1, 100, 10, 20),
(1, 13, 2,  50,  0, 10),
(1, 14, 1, 200, 15, 35),
(1, 14, 3,  80,  5, 15),
(1, 15, 1, 800, 40,100),
(1, 15, 2, 400, 20, 80);

-- ------------------------------------------------------------------
-- 4e. EMPLOYEES
-- ------------------------------------------------------------------
INSERT INTO employees (id, company_id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, address, city, state, postal_code, country, department, position, hire_date, employment_type, salary, bank_name, bank_account_no, bank_routing_no, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, status) VALUES
(1,  1, 'EMP-001', 'Sarah',    'Chen',        'sarah.chen@acmecorp.com',     '+1-212-555-8001', '1985-03-15', 'Female', '120 Broadway, Apt 12A', 'New York',   'NY', '10006', 'USA', 'Executive',      'Chief Executive Officer',    '2020-01-15', 'Full-time', 280000.00, 'Chase Bank',       '****1122', '021000021', 'Michael Chen',   '+1-212-555-9001', 'Spouse',   'active'),
(2,  1, 'EMP-002', 'James',    'Rodriguez',    'james.rodriguez@acmecorp.com','+1-212-555-8002', '1982-07-22', 'Male',   '55 Water St, Apt 7B',   'New York',   'NY', '10004', 'USA', 'Engineering',    'Chief Technology Officer',   '2020-02-01', 'Full-time', 230000.00, 'Bank of America',  '****3344', '026009593', 'Ana Rodriguez',   '+1-212-555-9002', 'Spouse',   'active'),
(3,  1, 'EMP-003', 'Lisa',     'Thompson',     'lisa.thompson@acmecorp.com',  '+1-212-555-8003', '1990-11-08', 'Female', '30 Rockefeller Plz, #2201','New York',  'NY', '10112', 'USA', 'Finance',        'Chief Financial Officer',    '2020-03-01', 'Full-time', 250000.00, 'Chase Bank',       '****5566', '021000021', 'David Thompson',  '+1-917-555-9003', 'Spouse',   'active'),
(4,  1, 'EMP-004', 'Raj',      'Patel',        'raj.patel@acmecorp.com',      '+1-312-555-8101', '1992-05-12', 'Male',   '200 N Michigan Ave, #1505','Chicago',  'IL', '60601', 'USA', 'Engineering',    'Senior Software Engineer',   '2021-06-01', 'Full-time', 145000.00, 'Chase Bank',       '****7788', '071000013', 'Priya Patel',     '+1-312-555-9101', 'Spouse',   'active'),
(5,  1, 'EMP-005', 'Emily',    'Watanabe',     'emily.watanabe@acmecorp.com', '+1-312-555-8102', '1995-09-28', 'Female', '400 E Randolph St, #3204','Chicago',   'IL', '60601', 'USA', 'Marketing',      'Marketing Director',         '2021-08-15', 'Full-time', 155000.00, 'Bank of America',  '****9900', '071000039', 'Ken Watanabe',    '+1-312-555-9102', 'Brother',  'active'),
(6,  1, 'EMP-006', 'Michael',  'O''Brien',     'michael.obrien@acmecorp.com', '+1-310-555-8201', '1988-12-03', 'Male',   '500 Venice Blvd, #210', 'Los Angeles', 'CA', '90066', 'USA', 'Operations',     'Operations Manager',         '2021-01-10', 'Full-time', 135000.00, 'Wells Fargo',      '****2233', '121000248', 'Kathleen O''Brien','+1-310-555-9201','Spouse',   'active'),
(7,  1, 'EMP-007', 'Jessica',  'Kim',          'jessica.kim@acmecorp.com',    '+1-212-555-8004', '1993-04-17', 'Female', '100 Broadway, #8C',     'New York',   'NY', '10005', 'USA', 'Sales',          'Sales Manager',              '2021-09-01', 'Full-time', 140000.00, 'Chase Bank',       '****4455', '021000021', 'Daniel Kim',      '+1-347-555-9004', 'Brother',  'active'),
(8,  1, 'EMP-008', 'Carlos',   'Mendez',       'carlos.mendez@acmecorp.com',  '+1-212-555-8005', '1991-08-30', 'Male',   '75 Wall St, #12B',      'New York',   'NY', '10005', 'USA', 'Sales',          'Account Executive',          '2022-02-14', 'Full-time',  95000.00, 'Bank of America',  '****6677', '026009593', 'Elena Mendez',    '+1-646-555-9005', 'Spouse',   'active'),
(9,  1, 'EMP-009', 'Amanda',   'Foster',       'amanda.foster@acmecorp.com',  '+1-312-555-8103', '1994-06-21', 'Female', '600 W Chicago Ave, #3','Chicago',    'IL', '60654', 'USA', 'Human Resources', 'HR Manager',                  '2022-04-01', 'Full-time', 110000.00, 'Chase Bank',       '****8899', '071000013', 'Robert Foster',   '+1-312-555-9103', 'Spouse',   'active'),
(10, 1, 'EMP-010', 'David',    'Nakamura',     'david.nakamura@acmecorp.com', '+1-310-555-8202', '1987-01-14', 'Male',   '8500 Wilshire Blvd, #605','Los Angeles','CA', '90211', 'USA', 'Engineering',    'DevOps Engineer',            '2022-06-20', 'Full-time', 130000.00, 'Wells Fargo',      '****0011', '121000248', 'Sakura Nakamura', '+1-310-555-9202', 'Mother',   'active'),
(11, 1, 'EMP-011', 'Rachel',   'Martinez',     'rachel.martinez@acmecorp.com','+1-212-555-8006', '1996-10-05', 'Female', '250 Park Ave S, #4A',   'New York',   'NY', '10003', 'USA', 'Finance',        'Staff Accountant',           '2023-01-09', 'Full-time',  75000.00, 'Chase Bank',       '****2234', '021000021', 'Sofia Martinez',  '+1-718-555-9006', 'Sister',   'active'),
(12, 1, 'EMP-012', 'Thomas',   'Baker',        'thomas.baker@acmecorp.com',   '+1-312-555-8104', '1997-03-19', 'Male',   '800 S Michigan Ave, #1201','Chicago',   'IL', '60605', 'USA', 'Operations',     'Warehouse Supervisor',       '2023-03-15', 'Full-time',  62000.00, 'Bank of America',  '****5567', '071000039', 'Margaret Baker',  '+1-312-555-9104', 'Mother',   'active');

SELECT setval('employees_id_seq', 12);

-- ------------------------------------------------------------------
-- 4f. ATTENDANCE (last 5 business days for all employees)
-- ------------------------------------------------------------------
INSERT INTO attendance (company_id, employee_id, date, check_in, check_out, status, overtime_hours) VALUES
(1, 1, '2026-05-04', '08:45', '17:30', 'present', 0.0),
(1, 1, '2026-05-05', '09:00', '18:00', 'present', 0.5),
(1, 1, '2026-05-06', '08:50', '17:15', 'present', 0.0),
(1, 1, '2026-05-07', '08:30', '18:30', 'present', 1.0),
(1, 1, '2026-05-08', '09:10', '17:00', 'present', 0.0),
(1, 2, '2026-05-04', '08:30', '17:45', 'present', 0.0),
(1, 2, '2026-05-05', '08:15', '18:30', 'present', 1.0),
(1, 2, '2026-05-06', '08:45', '17:00', 'present', 0.0),
(1, 2, '2026-05-07', '09:00', '17:30', 'present', 0.0),
(1, 2, '2026-05-08', '08:30', '17:15', 'present', 0.0),
(1, 3, '2026-05-04', '09:00', '17:30', 'present', 0.0),
(1, 3, '2026-05-05', '08:45', '18:00', 'present', 0.5),
(1, 3, '2026-05-06', '09:15', '17:00', 'present', 0.0),
(1, 3, '2026-05-07', '08:50', '17:30', 'present', 0.0),
(1, 3, '2026-05-08', '09:00', '16:00', 'half-day', 0.0),
(1, 4, '2026-05-04', '08:00', '17:00', 'present', 0.0),
(1, 4, '2026-05-05', '08:15', '17:30', 'present', 0.0),
(1, 4, '2026-05-06', '07:45', '18:15', 'present', 1.0),
(1, 4, '2026-05-07', '08:30', '17:00', 'present', 0.0),
(1, 4, '2026-05-08', '08:00', '17:00', 'present', 0.0),
(1, 5, '2026-05-04', '09:00', '17:30', 'present', 0.0),
(1, 5, '2026-05-05', '09:15', '18:00', 'present', 0.5),
(1, 5, '2026-05-06', '08:45', '17:15', 'present', 0.0),
(1, 5, '2026-05-07', '09:30', '17:00', 'present', 0.0),
(1, 5, '2026-05-08', '09:00', '17:30', 'present', 0.0),
(1, 6, '2026-05-04', '07:30', '16:30', 'present', 0.0),
(1, 6, '2026-05-05', '07:45', '16:45', 'present', 0.0),
(1, 6, '2026-05-06', '08:00', '17:00', 'present', 0.0),
(1, 6, '2026-05-07', '07:30', '17:30', 'present', 0.5),
(1, 6, '2026-05-08', '07:45', '16:00', 'present', 0.0),
(1, 7, '2026-05-04', '08:45', '18:00', 'present', 0.5),
(1, 7, '2026-05-05', '09:00', '17:30', 'present', 0.0),
(1, 7, '2026-05-06', '08:30', '17:00', 'present', 0.0),
(1, 7, '2026-05-07', '08:50', '18:30', 'present', 1.0),
(1, 7, '2026-05-08', '09:15', '17:00', 'present', 0.0),
(1, 8, '2026-05-04', '08:30', '17:15', 'present', 0.0),
(1, 8, '2026-05-05', '08:15', '18:00', 'present', 0.5),
(1, 8, '2026-05-06', '08:45', '17:30', 'present', 0.0),
(1, 8, '2026-05-07', '08:00', '17:00', 'present', 0.0),
(1, 8, '2026-05-08', '08:30', '16:30', 'present', 0.0),
(1, 9, '2026-05-04', '08:45', '17:00', 'present', 0.0),
(1, 9, '2026-05-05', '09:00', '17:30', 'present', 0.0),
(1, 9, '2026-05-06', '08:30', '17:00', 'present', 0.0),
(1, 9, '2026-05-07', '08:50', '17:15', 'present', 0.0),
(1, 9, '2026-05-08', '08:45', '17:00', 'present', 0.0),
(1, 10, '2026-05-04', '08:00', '17:00', 'present', 0.0),
(1, 10, '2026-05-05', '07:45', '18:00', 'present', 0.5),
(1, 10, '2026-05-06', '08:15', '17:15', 'present', 0.0),
(1, 10, '2026-05-07', '08:00', '17:30', 'present', 0.0),
(1, 10, '2026-05-08', '07:50', '16:45', 'present', 0.0),
(1, 11, '2026-05-04', '08:30', '17:30', 'present', 0.0),
(1, 11, '2026-05-05', '08:45', '17:00', 'present', 0.0),
(1, 11, '2026-05-06', '09:00', '17:30', 'present', 0.0),
(1, 11, '2026-05-07', '08:30', '18:00', 'present', 0.5),
(1, 11, '2026-05-08', '08:15', '17:00', 'present', 0.0),
(1, 12, '2026-05-04', '06:45', '16:00', 'present', 0.5),
(1, 12, '2026-05-05', '07:00', '15:30', 'present', 0.0),
(1, 12, '2026-05-06', '06:30', '16:30', 'present', 1.0),
(1, 12, '2026-05-07', '07:00', '15:00', 'present', 0.0),
(1, 12, '2026-05-08', '06:50', '15:30', 'present', 0.0);

-- ------------------------------------------------------------------
-- 4g. LEAVE REQUESTS
-- ------------------------------------------------------------------
INSERT INTO leave_requests (company_id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status, approved_by, created_by) VALUES
(1, 4, 1, '2026-06-15', '2026-06-19', 5, 'Family vacation to Japan',         'approved', 1, 1),
(1, 5, 2, '2026-05-18', '2026-05-19', 2, 'Medical appointment',               'approved', 1, 1),
(1, 8, 1, '2026-07-06', '2026-07-10', 5, 'Annual leave - wedding',            'approved', 7, 1),
(1, 11, 3, '2026-05-11', '2026-05-11', 1, 'Personal errand',                  'pending',  NULL, 1),
(1, 12, 2, '2026-04-20', '2026-04-21', 2, 'Sick leave - flu recovery',        'approved', 6, 1),
(1, 10, 1, '2026-08-10', '2026-08-21', 10, 'Extended vacation to Europe',      'pending',  NULL, 1);

-- ------------------------------------------------------------------
-- 4h. PURCHASE ORDERS
-- ------------------------------------------------------------------
INSERT INTO purchase_orders (id, company_id, supplier_id, po_number, order_date, expected_delivery_date, status, subtotal, tax_total, grand_total, notes, created_by, payment_status, warehouse_id) VALUES
(1, 1, 1, 'PO-2026-0001', '2026-04-01', '2026-04-15', 'received', 34100.00, 6820.00, 40920.00, 'Quarterly electronics components order',  2, 'paid',    1),
(2, 1, 3, 'PO-2026-0002', '2026-04-05', '2026-04-28', 'received', 22150.00, 1107.50, 23257.50, 'Packaging materials import shipment',     6, 'paid',    2),
(3, 1, 2, 'PO-2026-0003', '2026-04-12', '2026-04-26', 'received',  7600.00, 1520.00,  9120.00, 'Raw materials restock',                   6, 'paid',    1),
(4, 1, 4, 'PO-2026-0004', '2026-04-20', '2026-05-05', 'received', 18525.00, 3705.00, 22230.00, 'Office furniture upgrade - 2nd floor',    7, 'paid',    1),
(5, 1, 5, 'PO-2026-0005', '2026-04-25', '2026-05-20', 'received',  5325.00, 1065.00,  6390.00, 'R&D equipment - oscilloscopes',           2, 'paid',    1),
(6, 1, 1, 'PO-2026-0006', '2026-05-01', '2026-05-15', 'sent',    13000.00, 2600.00, 15600.00, 'Sensor restock for Q2 demand',            2, 'unpaid',  2),
(7, 1, 2, 'PO-2026-0007', '2026-05-05', '2026-05-19', 'draft',    6200.00, 1240.00,  7440.00, 'Steel sheets and hardware restock',       6, 'unpaid',  1);

SELECT setval('purchase_orders_id_seq', 7);

-- ------------------------------------------------------------------
-- 4i. PURCHASE ORDER ITEMS
-- ------------------------------------------------------------------
INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity) VALUES
-- PO-0001: Precision Components
(1, 1,  100, 140.00, 14000.00, 100),
(1, 2,  300,  52.00, 15600.00, 300),
(1, 3,  15,  310.00,  4650.00,  15),
(1, 14,   8,   55.00,   440.00,   8),
(1, 13,  10,   85.00,   850.00,  10),

-- PO-0002: Pacific Rim Imports (packaging)
(2, 7,  400,  15.00,  6000.00, 400),
(2, 8,  200,  26.00,  5200.00, 200),
(2, 9,  500,  12.00,  6000.00, 500),
(2, 5,  120,  18.00,  2160.00, 120),
(2, 6,  100,  24.50,  2450.00, 100),

-- PO-0003: Global Materials (raw)
(3, 13,  40,   85.00,  3400.00,  40),
(3, 14,  50,   55.00,  2750.00,  50),
(3, 4,  150,   9.50,  1425.00, 150),

-- PO-0004: Apex Office
(4, 10,  25,  250.00,  6250.00,  25),
(4, 11,  20,  175.00,  3500.00,  20),
(4, 12,  50,   38.00,  1900.00,  50),
(4, 4,  500,   9.50,  4750.00, 500),
(4, 6,  100,  24.50,  2450.00, 100),

-- PO-0005: TechSource Electronics
(5, 2,   25,   52.00,  1300.00,  25),
(5, 14,  20,   55.00,  1100.00,  20),
(5, 3,   10,  310.00,  3100.00,  10),

-- PO-0006: Precision Components (sent)
(6, 1,   50,  140.00,  7000.00,   0),
(6, 2,  100,   52.00,  5200.00,   0),
(6, 3,   10,  310.00,  3100.00,   0),

-- PO-0007: Global Materials (draft)
(7, 13,  30,   85.00,  2550.00,   0),
(7, 4,  200,   9.50,  1900.00,   0),
(7, 5,  100,  18.00,  1800.00,   0);

-- ------------------------------------------------------------------
-- 4j. SALES ORDERS
-- ------------------------------------------------------------------
INSERT INTO sales_orders (id, company_id, customer_id, order_number, order_date, status, subtotal, tax_total, grand_total, notes, created_by, payment_status, warehouse_id) VALUES
(1, 1, 1, 'SO-2026-0001', '2026-04-03', 'shipped',  26225.00, 5245.00, 31470.00, 'TechNova - control board + sensor order',    7, 'paid',     1),
(2, 1, 2, 'SO-2026-0002', '2026-04-08', 'invoiced', 11040.00, 2208.00, 13248.00, 'BuildRight - hardware and hinge bulk order', 7, 'paid',     2),
(3, 1, 3, 'SO-2026-0003', '2026-04-15', 'confirmed', 8400.00, 1680.00, 10080.00, 'MetroHealth - temperature sensors',          8, 'unpaid',   1),
(4, 1, 5, 'SO-2026-0004', '2026-04-18', 'shipped',  31250.00, 6250.00, 37500.00, 'Swift Logistics - drive units + brackets',   7, 'paid',     1),
(5, 1, 6, 'SO-2026-0005', '2026-04-25', 'confirmed', 9880.00, 1976.00, 11856.00, 'Pinnacle Retail - packaging + desk lamps',   8, 'unpaid',   2),
(6, 1, 8, 'SO-2026-0006', '2026-04-28', 'draft',     5450.00, 1090.00,  6540.00, 'Coastal Hospitality - office furniture',      8, 'unpaid',   3);

SELECT setval('sales_orders_id_seq', 6);

-- ------------------------------------------------------------------
-- 4k. SALES ORDER ITEMS
-- ------------------------------------------------------------------
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
-- SO-0001: TechNova
(1, 1,  50, 245.00, 0, 12250.00),
(1, 2, 100,  89.50, 5,  8502.50),
(1, 3,  10, 520.00, 0,  5200.00),
(1, 5,  10,  34.00, 0,   340.00),
-- SO-0002: BuildRight
(2, 5, 200,  34.00, 0,  6800.00),
(2, 6,  80,  42.00, 0,  3360.00),
(2, 4,  50,  18.75, 5,   890.63),
-- SO-0003: MetroHealth
(3, 2,  80,  89.50, 0,  7160.00),
(3, 14, 20,  85.00, 0,  1700.00),
-- SO-0004: Swift Logistics
(4, 3,  30, 520.00, 0, 15600.00),
(4, 4, 200,  18.75, 0,  3750.00),
(4, 1,  30, 245.00, 5,  6982.50),
(4, 6,  50,  42.00, 0,  2100.00),
-- SO-0005: Pinnacle Retail
(5, 7, 100,  28.50, 0,  2850.00),
(5, 12, 50,  65.00, 0,  3250.00),
(5, 8,  20,  45.00, 0,   900.00),
(5, 9, 100,  22.00, 0,  2200.00),
-- SO-0006: Coastal Hospitality (draft)
(6, 10,  6, 420.00, 0,  2520.00),
(6, 11,  8, 295.00, 0,  2360.00),
(6, 12,  6,  65.00, 0,   390.00);

-- ------------------------------------------------------------------
-- 4l. INVENTORY TRANSACTIONS
-- ------------------------------------------------------------------
-- Receipts from purchase orders (type = 'in')
INSERT INTO inventory_transactions (product_id, type, quantity, reference_type, reference_id, warehouse_id) VALUES
-- PO-0001 receipts
(1,  'in',  100, 'purchase_order', 1, 1),
(2,  'in',  300, 'purchase_order', 1, 1),
(3,  'in',   15, 'purchase_order', 1, 1),
(14, 'in',    8, 'purchase_order', 1, 1),
(13, 'in',   10, 'purchase_order', 1, 1),
-- PO-0002 receipts
(7,  'in',  400, 'purchase_order', 2, 2),
(8,  'in',  200, 'purchase_order', 2, 2),
(9,  'in',  500, 'purchase_order', 2, 2),
(5,  'in',  120, 'purchase_order', 2, 2),
(6,  'in',  100, 'purchase_order', 2, 2),
-- PO-0003 receipts
(13, 'in',   40, 'purchase_order', 3, 1),
(14, 'in',   50, 'purchase_order', 3, 1),
(4,  'in',  150, 'purchase_order', 3, 1),
-- PO-0004 receipts
(10, 'in',   25, 'purchase_order', 4, 1),
(11, 'in',   20, 'purchase_order', 4, 1),
(12, 'in',   50, 'purchase_order', 4, 1),
(4,  'in',  500, 'purchase_order', 4, 1),
(6,  'in',  100, 'purchase_order', 4, 1),
-- PO-0005 receipts
(2,  'in',   25, 'purchase_order', 5, 1),
(14, 'in',   20, 'purchase_order', 5, 1),
(3,  'in',   10, 'purchase_order', 5, 1);

-- Shipments from sales orders (type = 'out')
INSERT INTO inventory_transactions (product_id, type, quantity, reference_type, reference_id, warehouse_id) VALUES
-- SO-0001 shipments
(1,  'out',  50, 'sales_order', 1, 1),
(2,  'out', 100, 'sales_order', 1, 1),
(3,  'out',  10, 'sales_order', 1, 1),
(5,  'out',  10, 'sales_order', 1, 1),
-- SO-0002 shipments
(5,  'out', 200, 'sales_order', 2, 2),
(6,  'out',  80, 'sales_order', 2, 2),
(4,  'out',  50, 'sales_order', 2, 2),
-- SO-0004 shipments
(3,  'out',  30, 'sales_order', 4, 1),
(4,  'out', 200, 'sales_order', 4, 1),
(1,  'out',  30, 'sales_order', 4, 1),
(6,  'out',  50, 'sales_order', 4, 1);

-- Adjustments
INSERT INTO inventory_transactions (product_id, type, quantity, reference_type, warehouse_id) VALUES
(4,  'adjustment',  -10, 'cycle_count', 1),
(7,  'adjustment',   50, 'cycle_count', 2);

-- ------------------------------------------------------------------
-- 4m. INVOICES (Sales Invoices)
-- ------------------------------------------------------------------
INSERT INTO invoices (id, company_id, invoice_number, sales_order_id, customer_id, invoice_date, due_date, status, subtotal, tax_total, discount_total, grand_total, amount_paid, payment_terms, notes, created_by) VALUES
(1, 1, 'INV-2026-0001', 1, 1, '2026-04-05', '2026-05-05', 'paid',      26225.00, 5245.00, 0.00, 31470.00, 31470.00, 'Net 30',       'TechNova Q2 order',     1),
(2, 1, 'INV-2026-0002', 2, 2, '2026-04-10', '2026-05-10', 'paid',      11040.00, 2208.00, 0.00, 13248.00, 13248.00, 'Net 30',       'BuildRight materials',  1),
(3, 1, 'INV-2026-0003', 4, 5, '2026-04-20', '2026-05-20', 'paid',      31250.00, 6250.00, 0.00, 37500.00, 37500.00, 'Net 30',       'Swift Logistics order', 1),
(4, 1, 'INV-2026-0004', 3, 3, '2026-04-20', '2026-05-20', 'sent',      8400.00,  1680.00, 0.00, 10080.00,     0.00, 'Net 45',       'MetroHealth sensors',   1),
(5, 1, 'INV-2026-0005', 5, 6, '2026-04-28', '2026-05-28', 'sent',      9880.00,  1976.00, 0.00, 11856.00,     0.00, 'Net 30',       'Pinnacle Retail order', 1);

SELECT setval('invoices_id_seq', 5);

-- ------------------------------------------------------------------
-- 4n. INVOICE ITEMS (Copied from sales_order_items for completeness)
-- ------------------------------------------------------------------
INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total) VALUES
-- INV-0001 (SO-0001)
(1, 1, 'Industrial Control Board v4',                        50, 245.00, 0, 20, 12250.00),
(1, 2, 'Precision Temperature Sensor',                       100,  89.50, 5, 20,  8502.50),
(1, 3, 'Servo Motor Drive Unit',                             10,  520.00, 0, 20,  5200.00),
(1, 5, 'Stainless Steel Fastener Kit',                       10,   34.00, 0, 20,   340.00),
-- INV-0002 (SO-0002)
(2, 5, 'Stainless Steel Fastener Kit',                       200,  34.00, 0, 20,  6800.00),
(2, 6, 'Heavy-Duty Hinge Set',                               80,   42.00, 0, 20,  3360.00),
(2, 4, 'Aluminum Mounting Bracket',                          50,   18.75, 5, 20,   890.63),
-- INV-0003 (SO-0004)
(3, 3, 'Servo Motor Drive Unit',                             30,  520.00, 0, 20, 15600.00),
(3, 4, 'Aluminum Mounting Bracket',                          200,  18.75, 0, 20,  3750.00),
(3, 1, 'Industrial Control Board v4',                        30,  245.00, 5, 20,  6982.50),
(3, 6, 'Heavy-Duty Hinge Set',                               50,   42.00, 0, 20,  2100.00),
-- INV-0004 (SO-0003)
(4, 2, 'Precision Temperature Sensor',                       80,   89.50, 0, 20,  7160.00),
(4, 14, 'Copper Wire Spool 100m',                            20,   85.00, 0, 20,  1700.00),
-- INV-0005 (SO-0005)
(5, 7, 'Corrugated Box 12x8x6',                              100,  28.50, 0, 20,  2850.00),
(5, 12, 'LED Desk Lamp Touch Control',                       50,   65.00, 0, 20,  3250.00),
(5, 8, 'Bubble Wrap Roll 50m',                               20,   45.00, 0, 20,   900.00),
(5, 9, 'Polyester Strapping Kit',                            100,  22.00, 0, 20,  2200.00);

-- ------------------------------------------------------------------
-- 4o. PAYMENTS
-- ------------------------------------------------------------------
INSERT INTO payments (id, company_id, invoice_id, payment_number, payment_date, amount, payment_method, reference_number, notes, created_by) VALUES
(1, 1, 1, 'PAY-2026-0001', '2026-04-15', 31470.00, 'Wire Transfer', 'WIRE-2026-0415', 'TechNova payment - INV-0001', 1),
(2, 1, 2, 'PAY-2026-0002', '2026-04-20', 13248.00, 'Check',         'CHK-10234',       'BuildRight payment - INV-0002', 1),
(3, 1, 3, 'PAY-2026-0003', '2026-04-28', 37500.00, 'Wire Transfer', 'WIRE-2026-0428', 'Swift Logistics - INV-0003', 1);

SELECT setval('payments_id_seq', 3);

-- ------------------------------------------------------------------
-- 4p. JOURNAL ENTRIES
-- ------------------------------------------------------------------
-- Entry 1: Record sales revenue for INV-0001
INSERT INTO journal_entries (id, company_id, entry_date, voucher_no, voucher_type, total_debit, total_credit, status, description, reference_type, reference_id, created_by) VALUES
(1, 1, '2026-04-05', 'JV-2026-0001', 'Receipt', 31470.00, 31470.00, 'approved', 'Sales revenue - INV-0001 TechNova', 'invoice', 1, 3);
INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
(1, 2,  31470.00, 0.00,     'Accounts Receivable - TechNova'),
(1, 18, 0.00,     26225.00, 'Sales Revenue - Products'),
(1, 13, 0.00,     5245.00,  'Sales Tax Payable (20% VAT)');

-- Entry 2: Record sales revenue for INV-0002
INSERT INTO journal_entries (id, company_id, entry_date, voucher_no, voucher_type, total_debit, total_credit, status, description, reference_type, reference_id, created_by) VALUES
(2, 1, '2026-04-10', 'JV-2026-0002', 'Receipt', 13248.00, 13248.00, 'approved', 'Sales revenue - INV-0002 BuildRight', 'invoice', 2, 3);
INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
(2, 2,  13248.00, 0.00,     'Accounts Receivable - BuildRight'),
(2, 18, 0.00,     11040.00, 'Sales Revenue - Products'),
(2, 13, 0.00,     2208.00,  'Sales Tax Payable (20% VAT)');

-- Entry 3: Record sales revenue for INV-0003
INSERT INTO journal_entries (id, company_id, entry_date, voucher_no, voucher_type, total_debit, total_credit, status, description, reference_type, reference_id, created_by) VALUES
(3, 1, '2026-04-20', 'JV-2026-0003', 'Receipt', 37500.00, 37500.00, 'approved', 'Sales revenue - INV-0003 Swift Logistics', 'invoice', 3, 3);
INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
(3, 2,  37500.00, 0.00,     'Accounts Receivable - Swift Logistics'),
(3, 18, 0.00,     31250.00, 'Sales Revenue - Products'),
(3, 13, 0.00,     6250.00,  'Sales Tax Payable (20% VAT)');

-- Entry 4: Record COGS for SO-0001 (simplified - estimate cost)
INSERT INTO journal_entries (id, company_id, entry_date, voucher_no, voucher_type, total_debit, total_credit, status, description, reference_type, reference_id, created_by) VALUES
(4, 1, '2026-04-05', 'JV-2026-0004', 'Journal', 11390.00, 11390.00, 'approved', 'COGS - SO-0001 TechNova shipment', 'sales_order', 1, 3);
INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
(4, 21, 11390.00, 0.00,   'Cost of Goods Sold'),
(4, 4,  0.00,      9020.00,'Inventory - Finished Goods (control boards, sensors, drives)'),
(4, 3,  0.00,      2370.00,'Inventory - Raw Materials (fasteners)');

-- Entry 5: TechNova payment received
INSERT INTO journal_entries (id, company_id, entry_date, voucher_no, voucher_type, total_debit, total_credit, status, description, reference_type, reference_id, created_by) VALUES
(5, 1, '2026-04-15', 'JV-2026-0005', 'Receipt', 31470.00, 31470.00, 'approved', 'Payment received - TechNova INV-0001', 'payment', 1, 3);
INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
(5, 1,  31470.00, 0.00,     'Cash - Operating Account'),
(5, 2,  0.00,     31470.00, 'Accounts Receivable - TechNova');

-- Entry 6: BuildRight payment received
INSERT INTO journal_entries (id, company_id, entry_date, voucher_no, voucher_type, total_debit, total_credit, status, description, reference_type, reference_id, created_by) VALUES
(6, 1, '2026-04-20', 'JV-2026-0006', 'Receipt', 13248.00, 13248.00, 'approved', 'Payment received - BuildRight INV-0002', 'payment', 2, 3);
INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
(6, 1,  13248.00, 0.00,     'Cash - Operating Account'),
(6, 2,  0.00,     13248.00, 'Accounts Receivable - BuildRight');

-- Entry 7: Swift Logistics payment received
INSERT INTO journal_entries (id, company_id, entry_date, voucher_no, voucher_type, total_debit, total_credit, status, description, reference_type, reference_id, created_by) VALUES
(7, 1, '2026-04-28', 'JV-2026-0007', 'Receipt', 37500.00, 37500.00, 'approved', 'Payment received - Swift Logistics INV-0003', 'payment', 3, 3);
INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
(7, 1,  37500.00, 0.00,     'Cash - Operating Account'),
(7, 2,  0.00,     37500.00, 'Accounts Receivable - Swift Logistics');

-- Entry 8: Record PO-0001 receipt (increase inventory)
INSERT INTO journal_entries (id, company_id, entry_date, voucher_no, voucher_type, total_debit, total_credit, status, description, reference_type, reference_id, created_by) VALUES
(8, 1, '2026-04-15', 'JV-2026-0008', 'Journal', 34100.00, 34100.00, 'approved', 'Inventory receipt - PO-0001 Precision Components', 'purchase_order', 1, 3);
INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
(8, 4,  14000.00, 0.00,   'Inventory - Finished Goods (control boards)'),
(8, 4,  15600.00, 0.00,   'Inventory - Finished Goods (sensors)'),
(8, 4,   4650.00, 0.00,   'Inventory - Finished Goods (drive units)'),
(8, 3,    440.00, 0.00,   'Inventory - Raw Materials (copper wire)'),
(8, 3,    850.00, 0.00,   'Inventory - Raw Materials (steel sheet)'),
(8, 10, 0.00,     34100.00, 'Accounts Payable - Precision Components');

-- Entry 9: Rent expense for May (recurring)
INSERT INTO journal_entries (id, company_id, entry_date, voucher_no, voucher_type, total_debit, total_credit, status, description, created_by) VALUES
(9, 1, '2026-05-01', 'JV-2026-0009', 'Journal', 18000.00, 18000.00, 'approved', 'Monthly rent - May 2026', 3);
INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
(9, 23, 18000.00, 0.00,    'Rent Expense - May 2026'),
(9, 5,  0.00,      18000.00, 'Prepaid Expenses (rent allocation)');

-- Entry 10: Salaries for April
INSERT INTO journal_entries (id, company_id, entry_date, voucher_no, voucher_type, total_debit, total_credit, status, description, created_by) VALUES
(10, 1, '2026-04-30', 'JV-2026-0010', 'Journal', 125000.00, 125000.00, 'approved', 'Payroll - April 2026', 3);
INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
(10, 22, 125000.00, 0.00,   'Salaries & Wages - April payroll'),
(10, 11, 0.00,      125000.00, 'Accrued Liabilities (net pay + taxes payable)');

SELECT setval('journal_entries_id_seq', 10);

-- ------------------------------------------------------------------
-- 4q. FIXED ASSET CATEGORIES
-- ------------------------------------------------------------------
INSERT INTO asset_categories (id, company_id, code, name, default_depreciation_method, default_useful_life, is_active) VALUES
(1, 1, 'EQP-MFG', 'Manufacturing Equipment',  'straight_line', 10, true),
(2, 1, 'EQP-IT',  'IT & Computer Equipment',  'straight_line',  5, true),
(3, 1, 'VEH',     'Motor Vehicles',           'straight_line',  8, true),
(4, 1, 'FURN',    'Furniture & Fixtures',     'straight_line',  7, true),
(5, 1, 'BLDG',    'Buildings & Improvements', 'straight_line', 30, true);

SELECT setval('asset_categories_id_seq', 5);

-- ------------------------------------------------------------------
-- 4r. FIXED ASSETS
-- ------------------------------------------------------------------
INSERT INTO fixed_assets (id, company_id, asset_code, name, category_id, description, purchase_date, purchase_cost, current_value, salvage_value, useful_life, depreciation_method, accumulated_depreciation, depreciation_per_period, location, status, created_by) VALUES
(1, 1, 'CNC-001', 'CNC Milling Machine',        1, 'HAAS VF-4 5-axis CNC milling center',  '2022-06-15', 180000.00, 126000.00, 18000.00, 10, 'straight_line', 54000.00, 1350.00, 'New York - Mfg Floor',    'active', 2),
(2, 1, 'CNC-002', 'CNC Lathe Machine',          1, 'HAAS ST-30 CNC lathe with bar feeder', '2022-08-20', 145000.00, 105850.00, 14500.00, 10, 'straight_line', 39150.00, 1087.50, 'New York - Mfg Floor',    'active', 2),
(3, 1, 'SRV-001', 'Production Server Cluster',  2, 'Dell PowerEdge R750 rack (8 nodes)',    '2023-03-01',  95000.00,  57000.00,  9500.00,  5, 'straight_line', 38000.00, 1425.00, 'New York - Server Room',  'active', 2),
(4, 1, 'VEH-001', 'Ford Transit Cargo Van',     3, 'Ford Transit 350 XL, 2022 model',       '2022-11-01',  48500.00,  29648.00,  4850.00,  8, 'straight_line', 18852.00,  454.17, 'Chicago Depot',           'active', 6),
(5, 1, 'FURN-01', 'Executive Conference Table', 4, 'Custom mahogany conference table 12-seater','2023-07-01', 12500.00,  8572.00,   1250.00,  7, 'straight_line', 3928.00,  133.93, 'New York - Board Room',   'active', 1),
(6, 1, 'FURN-02', 'Open-Plan Workstations',     4, 'Steelcase modular workstations (24 pcs)','2023-01-15', 72000.00,  51428.00,  7200.00,  7, 'straight_line', 20572.00,  771.43, 'New York - 3rd Floor',    'active', 1);

SELECT setval('fixed_assets_id_seq', 6);

-- ------------------------------------------------------------------
-- 4s. ASSET DEPRECIATION (last 3 months for each asset)
-- ------------------------------------------------------------------
INSERT INTO asset_depreciation (company_id, asset_id, period_date, amount, running_balance) VALUES
(1, 1, '2026-03-31', 1350.00,  54000.00),
(1, 1, '2026-02-28', 1350.00,  52650.00),
(1, 1, '2026-01-31', 1350.00,  51300.00),
(1, 2, '2026-03-31', 1087.50,  39150.00),
(1, 2, '2026-02-28', 1087.50,  38062.50),
(1, 2, '2026-01-31', 1087.50,  36975.00),
(1, 3, '2026-03-31', 1425.00,  38000.00),
(1, 3, '2026-02-28', 1425.00,  36575.00),
(1, 3, '2026-01-31', 1425.00,  35150.00),
(1, 4, '2026-03-31',  454.17,  18852.00),
(1, 4, '2026-02-28',  454.17,  18397.83),
(1, 4, '2026-01-31',  454.17,  17943.66),
(1, 5, '2026-03-31',  133.93,   3928.00),
(1, 5, '2026-02-28',  133.93,   3794.07),
(1, 5, '2026-01-31',  133.93,   3660.14),
(1, 6, '2026-03-31',  771.43,  20572.00),
(1, 6, '2026-02-28',  771.43,  19800.57),
(1, 6, '2026-01-31',  771.43,  19029.14);

-- ------------------------------------------------------------------
-- 4t. SERVICES
-- ------------------------------------------------------------------
INSERT INTO services (id, company_id, name, description, category, unit_price, tax_percent, is_active) VALUES
(1, 1, 'On-Site Installation',          'Full equipment installation and commissioning',                'Installation',    1500.00, 20, true),
(2, 1, 'Preventive Maintenance',         'Quarterly preventive maintenance visit',                       'Maintenance',      800.00, 20, true),
(3, 1, 'Technical Support - Gold',       '24/7 phone and remote support, 1hr response SLA',              'Support',         2400.00, 20, true),
(4, 1, 'Equipment Calibration',          'NIST-traceable calibration with certificate',                  'Calibration',      600.00, 20, true),
(5, 1, 'Custom Fabrication Service',     'Custom metal fabrication per engineering drawings (per hour)', 'Fabrication',      125.00, 20, true);

SELECT setval('services_id_seq', 5);

-- ------------------------------------------------------------------
-- 4u. SERVICE INVOICES
-- ------------------------------------------------------------------
INSERT INTO service_invoices (id, company_id, invoice_number, customer_id, invoice_date, due_date, status, subtotal, tax_total, discount_total, grand_total, notes, created_by) VALUES
(1, 1, 'SVC-2026-0001', 1, '2026-04-10', '2026-05-10', 'paid',   3900.00,  780.00, 0.00,  4680.00, 'TechNova - annual maintenance package', 7),
(2, 1, 'SVC-2026-0002', 3, '2026-04-18', '2026-05-18', 'sent',   5600.00, 1120.00, 0.00,  6720.00, 'MetroHealth - installation + calibration', 8);

SELECT setval('service_invoices_id_seq', 2);

-- ------------------------------------------------------------------
-- 4v. SERVICE INVOICE ITEMS
-- ------------------------------------------------------------------
INSERT INTO service_invoice_items (service_invoice_id, service_id, description, quantity, unit_price, discount_percent, tax_percent, total) VALUES
(1, 2, 'Quarterly preventive maintenance for control systems',   1,  800.00, 0, 20,  800.00),
(1, 3, 'Gold support package - annual subscription',            1, 2400.00, 0, 20, 2400.00),
(1, 4, 'Calibration of 3 temperature sensors',                  1,  600.00, 0, 20,  600.00),
(2, 1, 'On-site installation of sensor network',                2, 1500.00, 0, 20, 3000.00),
(2, 4, 'Calibration of 5 instruments',                          3,  600.00, 0, 20, 1800.00);

-- ------------------------------------------------------------------
-- 4w. QUOTATIONS
-- ------------------------------------------------------------------
INSERT INTO quotations (id, company_id, customer_id, quote_number, quote_date, expiry_date, status, subtotal, tax_total, discount_total, grand_total, notes, created_by) VALUES
(1, 1, 4, 'Q-2026-0001', '2026-04-22', '2026-05-22', 'sent',   15750.00, 3150.00,  500.00, 18400.00, 'GreenField Agriculture - irrigation control system', 8),
(2, 1, 7, 'Q-2026-0002', '2026-04-28', '2026-05-28', 'draft',  22780.00, 4556.00,    0.00, 27336.00, 'Summit Education - campus-wide sensor project', 7);

SELECT setval('quotations_id_seq', 2);

-- ------------------------------------------------------------------
-- 4x. QUOTATION ITEMS
-- ------------------------------------------------------------------
INSERT INTO quotation_items (quotation_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total) VALUES
(1, 2, 'Precision Temperature Sensor',                  60,  89.50, 0, 20,  5370.00),
(1, 1, 'Industrial Control Board v4',                   20, 245.00, 0, 20,  4900.00),
(1, 6, 'Heavy-Duty Hinge Set',                          40,  42.00, 0, 20,  1680.00),
(1, 9, 'Polyester Strapping Kit',                       50,  22.00, 0, 20,  1100.00),
(1, 4, 'Aluminum Mounting Bracket',                     100, 18.75, 0, 20,  1875.00),
(2, 2, 'Precision Temperature Sensor',                  80,  89.50, 0, 20,  7160.00),
(2, 1, 'Industrial Control Board v4',                   30, 245.00, 0, 20,  7350.00),
(2, 3, 'Servo Motor Drive Unit',                        10, 520.00, 0, 20,  5200.00),
(2, 5, 'Stainless Steel Fastener Kit',                  40,  34.00, 0, 20,  1360.00),
(2, 15, 'Silicone Sealant Tube 300ml',                  80,  12.50, 0, 20,  1000.00);

-- ------------------------------------------------------------------
-- 4y. PROJECTS
-- ------------------------------------------------------------------
INSERT INTO projects (id, company_id, project_code, name, description, customer_id, start_date, end_date, budget_amount, status, priority, project_manager, created_by) VALUES
(1, 1, 'PRJ-2026-001', 'Sensor Network Deployment - TechNova',   'Install 200 sensors across manufacturing floor',        1, '2026-04-01', '2026-06-15', 45000.00, 'in_progress', 'high', 2, 2),
(2, 1, 'PRJ-2026-002', 'Warehouse Automation - Phase 1',         'Conveyor system and automated sorting for Chicago WH',    5, '2026-03-15', '2026-07-30', 180000.00, 'in_progress', 'high', 6, 2),
(3, 1, 'PRJ-2026-003', 'ERP v2 Migration',                       'Upgrade ERP to version 2 with new modules',              NULL, '2026-02-01', '2026-08-31', 75000.00, 'in_progress', 'medium', 2, 1);

SELECT setval('projects_id_seq', 3);

-- ------------------------------------------------------------------
-- 4z. PROJECT TASKS
-- ------------------------------------------------------------------
INSERT INTO project_tasks (id, company_id, project_id, name, description, assigned_to, start_date, due_date, status, priority, created_by) VALUES
(1, 1, 1, 'Site Survey',                'Conduct site survey and mark sensor locations',      4, '2026-04-01', '2026-04-08', 'done',        'high', 2),
(2, 1, 1, 'Sensor Installation Phase 1','Install sensors in Zone A and B',                   4, '2026-04-10', '2026-04-28', 'done',        'high', 2),
(3, 1, 1, 'Controller Programming',     'Configure control boards and test communication',    4, '2026-04-15', '2026-05-05', 'in_progress', 'high', 2),
(4, 1, 1, 'Integration Testing',        'Full system integration and calibration',            4, '2026-05-06', '2026-05-20', 'todo',        'medium', 2),
(5, 1, 2, 'Requirements Gathering',     'Document warehouse automation requirements',         6, '2026-03-15', '2026-03-31', 'done',        'high', 2),
(6, 1, 2, 'Vendor Selection',           'Evaluate and select conveyor system vendor',         6, '2026-04-01', '2026-04-20', 'done',        'high', 2),
(7, 1, 2, 'Conveyor Installation',      'Install conveyor belts and sorting mechanisms',     6, '2026-05-01', '2026-06-15', 'todo',        'high', 2),
(8, 1, 3, 'Database Migration Plan',    'Create migration plan for existing data',            10, '2026-02-01', '2026-02-20', 'done',        'high', 1),
(9, 1, 3, 'Backend API Updates',        'Update REST APIs for new module support',           4, '2026-02-21', '2026-04-30', 'in_progress', 'high', 1),
(10, 1, 3, 'Frontend Component Library', 'Build reusable UI components for new modules',      4, '2026-03-15', '2026-05-15', 'in_progress', 'medium', 1);

SELECT setval('project_tasks_id_seq', 10);

-- ------------------------------------------------------------------
-- 4aa. PROJECT MEMBERS
-- ------------------------------------------------------------------
INSERT INTO project_members (company_id, project_id, user_id, role, hourly_rate) VALUES
(1, 1, 2, 'project_manager', 85.00),
(1, 1, 4, 'developer',       65.00),
(1, 1, 7, 'consultant',     100.00),
(1, 2, 6, 'project_manager', 75.00),
(1, 2, 12, 'operations',     45.00),
(1, 3, 1, 'sponsor',        150.00),
(1, 3, 2, 'project_manager', 85.00),
(1, 3, 4, 'developer',       65.00),
(1, 3, 10, 'devops',         70.00);

-- ------------------------------------------------------------------
-- 4ab. TIME ENTRIES
-- ------------------------------------------------------------------
INSERT INTO time_entries (company_id, project_id, task_id, user_id, entry_date, hours, description, billable) VALUES
(1, 1, 1, 4, '2026-04-01', 8.0, 'Site walkthrough and sensor mapping', true),
(1, 1, 1, 4, '2026-04-02', 6.5, 'Marking installation points', true),
(1, 1, 2, 4, '2026-04-10', 8.0, 'Installing sensors in Zone A', true),
(1, 1, 2, 4, '2026-04-11', 8.0, 'Installing sensors in Zone B', true),
(1, 1, 3, 4, '2026-04-15', 7.0, 'Control board configuration', true),
(1, 1, 3, 4, '2026-04-16', 8.5, 'Modbus communication setup', true),
(1, 1, 3, 4, '2026-04-22', 6.0, 'Protocol testing and debugging', true),
(1, 2, 5, 6, '2026-03-15', 8.0, 'Requirements workshop with client', true),
(1, 2, 5, 6, '2026-03-17', 4.0, 'Documenting specifications', true),
(1, 2, 6, 6, '2026-04-05', 5.0, 'Vendor proposal review', true),
(1, 3, 8, 10, '2026-02-03', 8.0, 'Schema diff analysis', true),
(1, 3, 8, 10, '2026-02-04', 6.0, 'Writing migration scripts', true),
(1, 3, 9, 4, '2026-03-01', 8.0, 'API endpoint scaffolding', true),
(1, 3, 9, 4, '2026-03-02', 8.0, 'Implementing CRUD operations', false),
(1, 3, 9, 4, '2026-03-08', 7.0, 'Module integration', true);

-- ------------------------------------------------------------------
-- 4ac. CRM - LEADS
-- ------------------------------------------------------------------
INSERT INTO leads (id, company_id, first_name, last_name, email, phone, mobile, company, designation, source_id, status_id, assigned_to, city, state, country, created_by) VALUES
(1, 1, 'Marcus',   'Williams', 'marcus@aerospace-dynamics.com',   '+1-256-555-0101', '+1-256-555-1001', 'Aerospace Dynamics Corp.',  'Procurement Manager',  3, 3, 7, 'Huntsville', 'AL', 'USA', 7),
(2, 1, 'Priya',    'Sharma',   'priya@mediquest-labs.com',        '+1-650-555-0202', '+1-650-555-2002', 'MediQuest Laboratories',    'Lab Director',          1, 2, 8, 'Palo Alto',   'CA', 'USA', 8),
(3, 1, 'Robert',   'Fischer',  'rob.fischer@northwind-log.com',   '+1-312-555-0303', '+1-312-555-3003', 'Northwind Logistics',       'VP Operations',         4, 5, 7, 'Chicago',     'IL', 'USA', 7),
(4, 1, 'Sandra',   'Lee',      'slee@sunrise-foods.com',          '+1-206-555-0404', '+1-206-555-4004', 'Sunrise Foods International','Plant Manager',         2, 1, 8, 'Seattle',     'WA', 'USA', 8),
(5, 1, 'Ahmed',    'Hassan',   'ahmed@innovatec-eg.com',          '+20-2-5555-0505', '+20-2-5555-5050', 'InnovaTec Egypt',           'Technical Director',    6, 3, 7, 'Cairo',       NULL, 'Egypt', 7);

SELECT setval('leads_id_seq', 5);

-- ------------------------------------------------------------------
-- 4ad. OPPORTUNITIES
-- ------------------------------------------------------------------
INSERT INTO opportunities (id, company_id, lead_id, customer_id, name, description, expected_revenue, probability, expected_close_date, stage, priority, assigned_to, created_by) VALUES
(1, 1, 1, NULL,   'Aerospace Dynamics - Sensor Array Package',    '500-unit temperature sensor order for satellite testing',     45000.00, 60, '2026-06-30', 'negotiation', 'high', 7, 7),
(2, 1, 3, 5,      'Northwind Logistics - Warehouse Automation',   'Full warehouse conveyor and sensor system upgrade',          175000.00, 25, '2026-08-15', 'proposal',    'high', 7, 7),
(3, 1, 2, NULL,   'MediQuest - Clean Room Monitoring System',     'Temperature and humidity sensors for 5 clean rooms',           22000.00, 40, '2026-05-15', 'qualification','medium', 8, 8),
(4, 1, 4, NULL,   'Sunrise Foods - Cold Chain Sensors',           'Temperature monitoring for refrigerated supply chain',         15000.00, 15, '2026-07-01', 'qualification','medium', 8, 8);

SELECT setval('opportunities_id_seq', 4);

-- ------------------------------------------------------------------
-- 4ae. INTERACTIONS
-- ------------------------------------------------------------------
INSERT INTO interactions (company_id, lead_id, customer_id, type, subject, notes, performed_by) VALUES
(1, 1, NULL, 'call',        'Introductory call with Marcus Williams',        'Discussed sensor requirements for satellite testing facility. Interested in temperature and vibration sensors. Sent brochure via email.', 7),
(1, 1, NULL, 'email',       'Follow-up with quotation',                      'Sent preliminary quote for 500 units. Marcus confirmed receipt and will review with engineering team.', 7),
(1, 3, 5,    'meeting',     'Site visit - Chicago warehouse',                'Met with Robert and team to assess current warehouse layout. Proposed automation solution with conveyor system and 200 sensors.', 7),
(1, 2, NULL, 'call',        'Initial inquiry from MediQuest',                'Priya looking for clean room monitoring solutions. Scheduled video call for next week.', 8);

-- ------------------------------------------------------------------
-- 4af. STOCK TRANSFERS
-- ------------------------------------------------------------------
INSERT INTO stock_transfers (id, company_id, transfer_number, from_warehouse_id, to_warehouse_id, transfer_date, status, notes, created_by) VALUES
(1, 1, 'ST-2026-0001', 1, 2, '2026-04-12', 'completed', 'Replenish Chicago stock - control boards', 6),
(2, 1, 'ST-2026-0002', 1, 3, '2026-04-15', 'completed', 'Initial stock to LA warehouse', 6);

SELECT setval('stock_transfers_id_seq', 2);

INSERT INTO stock_transfer_items (stock_transfer_id, product_id, quantity, unit_cost) VALUES
(1, 1, 50, 140.00),
(1, 2, 100, 52.00),
(2, 2, 50, 52.00),
(2, 5, 300, 18.00),
(2, 8, 40, 26.00);

-- ------------------------------------------------------------------
-- 4ag. EXPENSES
-- ------------------------------------------------------------------
INSERT INTO expenses (id, company_id, expense_date, category_id, description, amount, payment_method, reference_number, created_by) VALUES
(1, 1, '2026-04-01', 1, 'Office rent - April 2026',                           15000.00, 'Wire Transfer', 'RENT-APR-2026', 3),
(2, 1, '2026-04-02', 2, 'Consolidated Edison - electricity April',             3200.00,  'Wire Transfer', 'UTIL-CONED-APR', 3),
(3, 1, '2026-04-03', 2, 'Verizon Business - internet & phone',                 950.00,   'Wire Transfer', 'TEL-VZ-APR', 3),
(4, 1, '2026-04-05', 3, 'Office supplies - Staples order',                     450.00,   'Credit Card',   'STAPLES-0415', 11),
(5, 1, '2026-04-08', 4, 'Flight tickets - Chicago meeting - Raj Patel',        680.00,   'Credit Card',   'DELTA-NK1234', 11),
(6, 1, '2026-04-10', 5, 'Google Ads campaign - Q2 electronics',               2500.00,   'Credit Card',   'GOOG-ADS-APR', 5),
(7, 1, '2026-04-12', 7, 'HVAC maintenance - NYC office',                       1800.00,   'Check',         'CHK-10235', 6),
(8, 1, '2026-04-18', 8, 'Legal retainer - corporate compliance review',        3500.00,   'Wire Transfer', 'LEGAL-APR', 3),
(9, 1, '2026-04-20', 3, 'Printer toner and paper - bulk order',                320.00,    'Credit Card',   'AMZN-BIZ-0420', 11),
(10, 1, '2026-04-25', 1, 'Warehouse rent - Chicago - April',                   8500.00,   'Wire Transfer', 'RENT-CHI-APR', 3);

SELECT setval('expenses_id_seq', 10);

-- ------------------------------------------------------------------
-- 4ah. SALES RETURNS
-- ------------------------------------------------------------------
INSERT INTO sales_returns (id, company_id, return_number, customer_id, return_date, status, subtotal, tax_amount, total_amount, restock_inventory, notes, created_by) VALUES
(1, 1, 'SR-2026-0001', 2, '2026-04-28', 'approved',  340.00, 68.00, 408.00, true, 'BuildRight returned 10 fastener kits - wrong thread size', 7);

SELECT setval('sales_returns_id_seq', 1);

INSERT INTO sales_return_items (sales_return_id, product_id, quantity, unit_price, discount_percent, total, return_reason_id, reason_text, condition) VALUES
(1, 5, 10, 34.00, 0, 340.00, 2, 'M8 bolts instead of M10 ordered', 'good');

-- ------------------------------------------------------------------
-- 4ai. BUDGETS
-- ------------------------------------------------------------------
INSERT INTO budgets (id, company_id, fiscal_year, name, status, notes, created_by) VALUES
(1, 1, 2026, 'Annual Operating Budget 2026', 'approved', 'Approved operating budget for fiscal year 2026', 3);

SELECT setval('budgets_id_seq', 1);

INSERT INTO budget_items (budget_id, account_id, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec) VALUES
(1, 22, 125000, 125000, 125000, 125000, 125000, 125000, 130000, 130000, 130000, 130000, 130000, 130000),
(1, 23,  20000,  20000,  20000,  20000,  20000,  20000,  20000,  20000,  20000,  20000,  20000,  20000),
(1, 25,   5000,   5000,   5000,   8000,   8000,   8000,   8000,   8000,   5000,   5000,   5000,   5000),
(1, 24,   1500,   1500,   1500,   2000,   2000,   2000,   2000,   2000,   1500,   1500,   1500,   1500);

-- ------------------------------------------------------------------
-- 4aj. APPROVAL WORKFLOWS
-- ------------------------------------------------------------------
INSERT INTO approval_workflows (id, company_id, name, description, target_entity, is_active, created_by) VALUES
(1, 1, 'Purchase Order Approval',     'PO approval workflow by amount threshold', 'purchase_order', true, 1),
(2, 1, 'Leave Request Approval',       'Standard leave request approval',          'leave_request',  true, 1),
(3, 1, 'Expense Report Approval',      'Expense reimbursement approval',           'expense',        true, 1);

SELECT setval('approval_workflows_id_seq', 3);

INSERT INTO approval_steps (workflow_id, step_order, approver_id, min_amount, max_amount) VALUES
(1, 1, 3, 0.00,    5000.00),
(1, 2, 1, 5000.01, 50000.00),
(1, 3, 1, 50000.01, 9999999.00),
(2, 1, 9, NULL, NULL),
(3, 1, 3, 0.00,    2000.00),
(3, 2, 1, 2000.01, 9999999.00);

-- ============================================================================
-- SECTION 5: UPDATE products.current_stock to reflect all transactions
-- ============================================================================
-- (We already set current_stock on INSERT, so stock levels are consistent.)

-- ============================================================================
-- SECTION 6: ROW COUNT VERIFICATION
-- ============================================================================

DO $$
DECLARE
    r RECORD;
    tbl_name TEXT;
    total_rows BIGINT;
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'ROW COUNTS AFTER SEED DATA INSERTION';
    RAISE NOTICE '==============================================';

    FOR r IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          AND table_name NOT IN (
            'users', 'roles', 'system_settings', 'email_templates',
            'audit_logs', 'lead_sources', 'lead_statuses',
            'leave_types', 'tax_rates', 'return_reasons'
          )
        ORDER BY table_name
    LOOP
        tbl_name := r.table_name;
        EXECUTE format('SELECT count(*) FROM %I', tbl_name) INTO total_rows;
        RAISE NOTICE '  %: % rows', tbl_name, total_rows;
    END LOOP;
END $$;

-- Count auth tables separately (unchanged)
SELECT '--- Auth/System tables (NOT modified) ---' AS info;
SELECT 'users' AS table_name, count(*) AS rows FROM users
UNION ALL
SELECT 'roles', count(*) FROM roles
UNION ALL
SELECT 'system_settings', count(*) FROM system_settings
UNION ALL
SELECT 'email_templates', count(*) FROM email_templates
UNION ALL
SELECT 'lead_sources', count(*) FROM lead_sources
UNION ALL
SELECT 'lead_statuses', count(*) FROM lead_statuses
UNION ALL
SELECT 'leave_types', count(*) FROM leave_types
UNION ALL
SELECT 'tax_rates', count(*) FROM tax_rates
UNION ALL
SELECT 'return_reasons', count(*) FROM return_reasons
ORDER BY table_name;

COMMIT;
