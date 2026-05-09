-- =============================================================================
-- ERP RESET & POPULATE SCRIPT
-- =============================================================================
-- Description: Removes ALL transactional and master data (NOT auth/security),
--              then inserts realistic demo data for a functioning ERP system.
--              Company ID 1 is preserved (referenced by protected tables).
-- =============================================================================
-- PROTECTED TABLES (NOT touched):
--   users, user_roles, password_resets, sessions, roles, system_settings,
--   email_templates, audit_logs, crm_email_templates, lead_sources,
--   lead_statuses, leave_types, return_reasons, tax_rates
-- =============================================================================

BEGIN;

-- =============================================================================
-- PHASE 1: DELETE ALL EXISTING DATA (reverse FK dependency order)
-- =============================================================================

-- POS module
DELETE FROM pos_transaction_items;
DELETE FROM pos_transactions;
DELETE FROM pos_cart;
DELETE FROM pos_sessions;

-- Time tracking & projects
DELETE FROM time_entries;
DELETE FROM project_members;
DELETE FROM project_tasks;
DELETE FROM projects;

-- Approval workflows
DELETE FROM approval_logs;
DELETE FROM approval_requests;
DELETE FROM approval_steps;
DELETE FROM approval_workflows;

-- Fixed assets
DELETE FROM asset_depreciation;
DELETE FROM asset_maintenance;
DELETE FROM fixed_assets;
DELETE FROM asset_categories;

-- Stock transfers
DELETE FROM stock_transfer_items;
DELETE FROM stock_transfers;

-- Per-warehouse stock & bins
DELETE FROM product_warehouse_stock;
DELETE FROM warehouse_bins;

-- Purchase returns
DELETE FROM purchase_return_items;
DELETE FROM purchase_returns;

-- Sales returns & credit notes
DELETE FROM credit_notes;
DELETE FROM sales_return_items;
DELETE FROM sales_returns;

-- Purchase orders
DELETE FROM purchase_order_items;
DELETE FROM purchase_orders;

-- Sales orders
DELETE FROM sales_order_items;
DELETE FROM sales_orders;

-- Invoices & payments
DELETE FROM payments;
DELETE FROM invoice_items;
DELETE FROM invoices;

-- Service invoices
DELETE FROM service_invoice_items;
DELETE FROM service_invoices;

-- Quotations
DELETE FROM quotation_items;
DELETE FROM quotations;

-- Budgets
DELETE FROM budget_items;
DELETE FROM budgets;

-- Bank reconciliation
DELETE FROM reconciliation_reports;
DELETE FROM bank_transactions;
DELETE FROM bank_accounts;

-- Recurring entries
DELETE FROM recurring_entry_lines;
DELETE FROM recurring_entries;

-- Accounting
DELETE FROM journal_entry_lines;
DELETE FROM journal_entries;

-- Expenses
DELETE FROM expenses;
DELETE FROM expense_categories;

-- Inventory transactions
DELETE FROM inventory_transactions;

-- CRM
DELETE FROM follow_ups;
DELETE FROM interactions;
DELETE FROM opportunities;
DELETE FROM leads;

-- Services
DELETE FROM service_invoice_items;
DELETE FROM service_invoices;
DELETE FROM services;

-- HR
DELETE FROM employee_documents;
DELETE FROM leave_requests;
DELETE FROM attendance;
DELETE FROM employees;

-- Cost centers
DELETE FROM cost_centers;

-- Chart of accounts (children first due to self-ref parent_account_id)
UPDATE chart_of_accounts SET parent_account_id = NULL;
DELETE FROM chart_of_accounts;

-- Master data
DELETE FROM products;
DELETE FROM customers;
DELETE FROM suppliers;
DELETE FROM warehouses;

-- Preserve company 1
DELETE FROM companies WHERE id <> 1;

-- =============================================================================
-- PHASE 2: INSERT MASTER DATA
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 2a. COMPANY
-- ---------------------------------------------------------------------------
UPDATE companies
SET name = 'NovaTech Industries',
    tax_id = 'US47-1234567',
    email = 'info@novatech-industries.com',
    phone = '+1 (212) 555-0198',
    address = '1200 Innovation Drive, Suite 400, New York, NY 10013',
    currency = 'USD'
WHERE id = 1;

-- ---------------------------------------------------------------------------
-- 2b. WAREHOUSES
-- ---------------------------------------------------------------------------
INSERT INTO warehouses (company_id, code, name, address, city, state, country, postal_code, phone, email, is_default, is_active) VALUES
(1, 'WH-NYC', 'New York Distribution Center',    '1200 Innovation Drive', 'New York',    'NY', 'USA', '10013', '+1 (212) 555-1101', 'nyc-wh@novatech-industries.com', true,  true),
(1, 'WH-CHI', 'Chicago Regional Warehouse',       '4550 Manufacturing Blvd', 'Chicago',   'IL', 'USA', '60607', '+1 (312) 555-1102', 'chi-wh@novatech-industries.com', false, true),
(1, 'WH-LAX', 'Los Angeles Logistics Hub',        '8900 Pacific Coast Hwy', 'Los Angeles', 'CA', 'USA', '90045', '+1 (310) 555-1103', 'lax-wh@novatech-industries.com', false, true),
(1, 'WH-DFW', 'Dallas-Fort Worth Fulfillment Ctr','2300 Freeport Parkway', 'Irving',     'TX', 'USA', '75063', '+1 (972) 555-1104', 'dfw-wh@novatech-industries.com', false, true);

-- Warehouse bins
INSERT INTO warehouse_bins (company_id, warehouse_id, code, name, zone, aisle, rack, shelf, max_capacity, is_active) VALUES
-- NYC bins
(1, 1, 'NYC-A1-01', 'Aisle A Rack 1 Shelf 1', 'Storage', 'A', '1', 'A', 500, true),
(1, 1, 'NYC-A1-02', 'Aisle A Rack 1 Shelf 2', 'Storage', 'A', '1', 'B', 500, true),
(1, 1, 'NYC-A2-01', 'Aisle A Rack 2 Shelf 1', 'Storage', 'A', '2', 'A', 500, true),
(1, 1, 'NYC-B1-01', 'Aisle B Rack 1 Shelf 1', 'Storage', 'B', '1', 'A', 300, true),
(1, 1, 'NYC-C1-01', 'Aisle C Rack 1 Shelf 1', 'Electronics', 'C', '1', 'A', 200, true),
(1, 1, 'NYC-C1-02', 'Aisle C Rack 1 Shelf 2', 'Electronics', 'C', '1', 'B', 200, true),
-- Chicago bins
(1, 2, 'CHI-A1-01', 'Aisle A Rack 1 Shelf 1', 'Storage', 'A', '1', 'A', 400, true),
(1, 2, 'CHI-A1-02', 'Aisle A Rack 1 Shelf 2', 'Storage', 'A', '1', 'B', 400, true),
(1, 2, 'CHI-B1-01', 'Aisle B Rack 1 Shelf 1', 'Heavy', 'B', '1', 'A', 600, true),
-- LA bins
(1, 3, 'LAX-A1-01', 'Aisle A Rack 1 Shelf 1', 'Storage', 'A', '1', 'A', 350, true),
(1, 3, 'LAX-A1-02', 'Aisle A Rack 1 Shelf 2', 'Storage', 'A', '1', 'B', 350, true),
(1, 3, 'LAX-D1-01', 'Aisle D Rack 1 Shelf 1', 'Perishable', 'D', '1', 'A', 150, true);
-- DFW bins (keeping minimal)
INSERT INTO warehouse_bins (company_id, warehouse_id, code, name, zone, aisle, rack, shelf, max_capacity, is_active) VALUES
(1, 4, 'DFW-A1-01', 'Aisle A Rack 1 Shelf 1', 'Storage', 'A', '1', 'A', 450, true);

-- ---------------------------------------------------------------------------
-- 2c. COST CENTERS
-- ---------------------------------------------------------------------------
INSERT INTO cost_centers (company_id, code, name, description, is_active) VALUES
(1, 'CC-HQ',    'Head Office',         'Corporate headquarters operations', true),
(1, 'CC-RND',   'Research & Development', 'Product R&D department', true),
(1, 'CC-MFG',   'Manufacturing',       'Production and assembly', true),
(1, 'CC-SALES', 'Sales & Marketing',   'Sales and marketing department', true),
(1, 'CC-LOG',   'Logistics',           'Shipping, receiving, warehousing', true),
(1, 'CC-IT',    'Information Technology', 'IT infrastructure and support', true),
(1, 'CC-HR',    'Human Resources',     'HR and personnel', true);

-- ---------------------------------------------------------------------------
-- 2d. EXPENSE CATEGORIES
-- ---------------------------------------------------------------------------
INSERT INTO expense_categories (company_id, name, description, is_active) VALUES
(1, 'Office Supplies',     'Stationery, printer toner, office consumables', true),
(1, 'Utilities',           'Electricity, water, internet, phone', true),
(1, 'Travel & Lodging',    'Business travel, hotel, airfare', true),
(1, 'Rent & Leases',       'Office and warehouse rent', true),
(1, 'Maintenance',         'Equipment and facility maintenance', true),
(1, 'Software Subscriptions', 'SaaS and software licenses', true),
(1, 'Professional Fees',   'Legal, consulting, accounting', true),
(1, 'Marketing',           'Advertising, promotions, events', true);

-- ---------------------------------------------------------------------------
-- 2e. ASSET CATEGORIES
-- ---------------------------------------------------------------------------
INSERT INTO asset_categories (company_id, code, name, default_depreciation_method, default_useful_life, is_active) VALUES
(1, 'IT-EQ',     'Computer Equipment',     'straight_line', 4, true),
(1, 'FURN',      'Furniture & Fixtures',   'straight_line', 7, true),
(1, 'MACH',      'Machinery & Equipment',  'declining',    10, true),
(1, 'VEH',       'Vehicles',               'straight_line', 5, true),
(1, 'BUILD',     'Buildings',              'straight_line', 30, true);

-- ---------------------------------------------------------------------------
-- 2f. ACCOUNTING: CHART OF ACCOUNTS
-- ---------------------------------------------------------------------------
INSERT INTO chart_of_accounts (company_id, account_code, account_name, account_type, description, parent_account_id, is_active) VALUES
-- Assets (1xxx)
(1, '1000', 'Current Assets',       'asset',    'Current assets', NULL, true),
(1, '1100', 'Cash & Cash Equivalents', 'asset', 'Cash on hand and bank accounts', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='1000'), true),
(1, '1101', 'Cash - Operating Account', 'asset', 'Chase Business Checking', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='1100'), true),
(1, '1102', 'Cash - Payroll Account',  'asset',   'Chase Payroll Account', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='1100'), true),
(1, '1200', 'Accounts Receivable',   'asset',    'Customer receivables', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='1000'), true),
(1, '1300', 'Inventory',             'asset',    'Product inventory', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='1000'), true),
(1, '1400', 'Prepaid Expenses',      'asset',    'Prepaid insurance, rent, etc.', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='1000'), true),
(1, '1500', 'Fixed Assets',          'asset',    'Property, plant & equipment', NULL, true),
(1, '1501', 'Buildings',             'asset',    'Office and warehouse buildings', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='1500'), true),
(1, '1502', 'Computer Equipment',    'asset',    'Servers, laptops, workstations', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='1500'), true),
(1, '1503', 'Furniture & Fixtures',  'asset',    'Office furniture', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='1500'), true),
(1, '1504', 'Machinery',             'asset',    'Manufacturing equipment', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='1500'), true),
(1, '1505', 'Vehicles',              'asset',    'Company vehicles', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='1500'), true),
(1, '1600', 'Accumulated Depreciation','asset',  'Contra-asset - depreciation', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='1500'), true),

-- Liabilities (2xxx)
(1, '2000', 'Current Liabilities',   'liability', 'Short-term liabilities', NULL, true),
(1, '2100', 'Accounts Payable',      'liability', 'Supplier payables', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='2000'), true),
(1, '2200', 'Sales Tax Payable',     'liability', 'VAT / sales tax collected', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='2000'), true),
(1, '2300', 'Accrued Liabilities',   'liability', 'Accrued expenses', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='2000'), true),
(1, '2400', 'Long-Term Liabilities', 'liability', 'Long-term debt', NULL, true),
(1, '2401', 'Bank Loan Payable',     'liability', 'Chase Term Loan', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='2400'), true),

-- Equity (3xxx)
(1, '3000', 'Shareholders Equity',   'equity',    'Owner equity', NULL, true),
(1, '3100', 'Common Stock',          'equity',    'Issued common shares', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='3000'), true),
(1, '3200', 'Retained Earnings',     'equity',    'Accumulated retained earnings', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='3000'), true),
(1, '3300', 'Current Year Earnings', 'equity',    'Current year profit/loss', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='3000'), true),

-- Revenue (4xxx)
(1, '4000', 'Revenue',              'revenue',   'Operating revenue', NULL, true),
(1, '4100', 'Product Sales',        'revenue',   'Revenue from product sales', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='4000'), true),
(1, '4200', 'Service Revenue',      'revenue',   'Revenue from services', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='4000'), true),
(1, '4300', 'Sales Returns',        'revenue',   'Sales returns and allowances', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='4000'), true),

-- Expenses (5xxx)
(1, '5000', 'Cost of Goods Sold',   'expense',   'COGS', NULL, true),
(1, '5100', 'COGS - Products',      'expense',   'Product cost of goods sold', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='5000'), true),
(1, '5200', 'Operating Expenses',   'expense',   'General operating expenses', NULL, true),
(1, '5201', 'Salaries & Wages',     'expense',   'Employee salaries', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='5200'), true),
(1, '5202', 'Rent Expense',         'expense',   'Rent for facilities', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='5200'), true),
(1, '5203', 'Utilities Expense',    'expense',   'Electricity, water, internet', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='5200'), true),
(1, '5204', 'Office Supplies Exp',  'expense',   'Office consumables', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='5200'), true),
(1, '5205', 'Travel Expense',       'expense',   'Business travel', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='5200'), true),
(1, '5206', 'Marketing Expense',    'expense',   'Marketing and advertising', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='5200'), true),
(1, '5207', 'Depreciation Expense', 'expense',   'Asset depreciation', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='5200'), true),
(1, '5208', 'Software & IT Exp',    'expense',   'Software subscriptions, hosting', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='5200'), true),
(1, '5209', 'Professional Fees',    'expense',   'Legal, audit, consulting', (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='5200'), true),
(1, '5300', 'Tax Expense',          'expense',   'Income tax expense', NULL, true);

-- ---------------------------------------------------------------------------
-- 2g. BANK ACCOUNTS
-- ---------------------------------------------------------------------------
INSERT INTO bank_accounts (company_id, account_id, bank_name, account_number, account_name, opening_balance, as_of_date, is_active) VALUES
(1, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='1101'),
    'Chase Bank', 'XXXX-1234', 'NovaTech Industries Operating Account', 485000.00, '2026-01-01', true),
(1, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='1102'),
    'Chase Bank', 'XXXX-5678', 'NovaTech Industries Payroll Account', 125000.00, '2026-01-01', true);

-- ---------------------------------------------------------------------------
-- 2h. CUSTOMERS
-- ---------------------------------------------------------------------------
INSERT INTO customers (company_id, name, email, phone, billing_address, shipping_address) VALUES
(1, 'TechSphere Solutions',      'ap@techsphere.io',          '+1 (415) 555-2101', '100 Market Street, San Francisco, CA 94105',     '100 Market Street, San Francisco, CA 94105'),
(1, 'MedCore Devices Inc.',      'orders@medcore.com',        '+1 (617) 555-3402', '200 Longwood Ave, Boston, MA 02115',             '200 Longwood Ave, Boston, MA 02115'),
(1, 'AeroPrecision LLC',         'procurement@aeroprecision.com', '+1 (206) 555-1803', '3400 E Marginal Way S, Seattle, WA 98134',       '3400 E Marginal Way S, Seattle, WA 98134'),
(1, 'GreenLeaf Energy Corp',     'purchasing@greenleaf-energy.com','+1 (512) 555-2904', '800 Congress Ave, Austin, TX 78701',             '800 Congress Ave, Austin, TX 78701'),
(1, 'Pinnacle Retail Group',     'buyers@pinnacleretail.com', '+1 (404) 555-4705', '550 Peachtree St NE, Atlanta, GA 30308',         '550 Peachtree St NE, Atlanta, GA 30308'),
(1, 'Athena Analytics',          'finance@athena-analytics.com','+1 (303) 555-6106', '1600 Broadway, Denver, CO 80202',                '1600 Broadway, Denver, CO 80202'),
(1, 'NorthStar Logistics',       'billings@northstarlogistics.com','+1 (312) 555-7807', '233 S Wacker Dr, Chicago, IL 60606',             '233 S Wacker Dr, Chicago, IL 60606'),
(1, 'Quantum Education Systems', 'orders@quantumedu.org',     '+1 (919) 555-3908', '2810 Campus Walk Ave, Durham, NC 27705',         '2810 Campus Walk Ave, Durham, NC 27705'),
(1, 'Vanguard Defense Solutions', 'supply@vanguarddefense.com','+1 (703) 555-2209', '1500 Wilson Blvd, Arlington, VA 22209',          '1500 Wilson Blvd, Arlington, VA 22209'),
(1, 'CrystalClear Beverages',    'procurement@ccbeverages.com','+1 (305) 555-1410', '100 SE 2nd St, Miami, FL 33131',                 '100 SE 2nd St, Miami, FL 33131');

-- ---------------------------------------------------------------------------
-- 2i. SUPPLIERS
-- ---------------------------------------------------------------------------
INSERT INTO suppliers (company_id, name, email, phone, address) VALUES
(1, 'Pacific Components Ltd.',       'sales@pacificcomp.com',     '+1 (213) 555-3101', '500 Industrial Way, Los Angeles, CA 90058'),
(1, 'Titanium Metals International', 'orders@titaniummetals.com',  '+1 (412) 555-4202', '2100 E Carson St, Pittsburgh, PA 15203'),
(1, 'ElectroTec Systems',           'info@electrotec.com',        '+1 (408) 555-5303', '880 E Arques Ave, Sunnyvale, CA 94085'),
(1, 'Precision Machining Co.',      'rfq@precisionmachining.com', '+1 (847) 555-6404', '1500 N Arlington Heights Rd, Elk Grove Village, IL 60007'),
(1, 'Global Source Distributors',   'sales@globalsource.com',     '+1 (770) 555-7505', '200 Technology Pkwy, Peachtree Corners, GA 30092'),
(1, 'Apex Chemical Supply',         'orders@apexchem.com',        '+1 (281) 555-8606', '8900 Bay Area Blvd, Houston, TX 77507'),
(1, 'Phoenix Packaging Group',      'customerservice@phoenixpkg.com','+1 (602) 555-9707', '3400 E Washington St, Phoenix, AZ 85034'),
(1, 'Northern Circuits Inc.',       'sales@northerncircuits.com', '+1 (503) 555-1808', '6700 SW 105th Ave, Beaverton, OR 97008');

-- ---------------------------------------------------------------------------
-- 2j. PRODUCTS
-- - Uses tax_rate_id = 1 (Standard VAT 20%)
-- ---------------------------------------------------------------------------
INSERT INTO products (company_id, sku, name, description, unit_price, cost_price, current_stock, reorder_level, tax_rate_id) VALUES
-- Electronics
(1, 'EC-1001', 'LogicMaster X1 Controller',     'Industrial PLC controller with 48 I/O ports',        189.00,  98.00,  340, 50,  1),
(1, 'EC-1002', 'PowerDrive VFD-7.5',            'Variable frequency drive, 7.5 kW, 3-phase',           1240.00, 720.00, 85,  15,  1),
(1, 'EC-1003', 'ThermoScan IR Sensor Array',    'Industrial infrared temperature sensor array',         347.50,  195.00, 120, 30,  1),
(1, 'EC-1004', 'DataStream Telemetry Module',   'Wireless telemetry module, 900MHz, IP67',              572.00,  310.00, 200, 40,  1),
-- Components
(1, 'CP-2001', 'ServoDrive S200 Motor Kit',     'High-torque servo motor with encoder, 2kW',            875.00,  510.00, 65,  10,  1),
(1, 'CP-2002', 'Linear Actuator LA-400',        'Ball-screw linear actuator, 400mm stroke',             423.00,  245.00, 95,  20,  1),
(1, 'CP-2003', 'Precision Ball Bearing Set',    'Set of 8 precision bearings, 6205 series',             89.50,   42.00,  500, 100, 1),
(1, 'CP-2004', 'Hydraulic Valve Manifold Kit',  '6-station hydraulic manifold with solenoid valves',    1295.00, 785.00, 40,  8,   1),
-- Consumables
(1, 'CN-3001', 'Industrial Lubricant 5Gal',     'Synthetic industrial lubricant, 5-gallon pail',        145.00,  82.00,  210, 40,  1),
(1, 'CN-3002', 'Safety Goggle Pro Series',      'ANSI Z87.1 rated anti-fog safety goggles (box/20)',    78.00,   38.00,  600, 100, 1),
(1, 'CN-3003', 'Welding Electrode Pack',        'E7018 welding electrodes, 1/8in, 10lb pack',           52.00,   28.00,  350, 60,  1),
(1, 'CN-3004', 'Hydraulic Fluid ISO 32',        'Premium hydraulic oil, 55-gallon drum',                425.00,  260.00, 55,  10,  1),
-- IT & Office
(1, 'IT-4001', 'NovaTech Server Rack 42U',      '42U server cabinet with cooling, 19-inch',             2190.00, 1350.00, 30,  5,   1),
(1, 'IT-4002', 'WorkStation Pro i9',            'High-performance workstation, i9-13900K, 64GB RAM',   4299.00, 2750.00, 45,  10,  1),
(1, 'IT-4003', '24-Port PoE Network Switch',    'Managed gigabit PoE+ switch, 24 ports',                549.00,  320.00, 80,  15,  1),
(1, 'IT-4004', 'NVMe SSD 2TB DataCenter',       'Enterprise NVMe SSD, 2TB, U.3 form factor',            389.00,  215.00, 150, 30,  1),
-- Packaging & Materials
(1, 'PK-5001', 'Corrugated Box 12x12x12 (100)', 'Standard shipping box, single-wall, pack of 100',      68.00,   35.00,  800, 200, 3),
(1, 'PK-5002', 'Anti-Static Bubble Wrap 100ft', 'Anti-static bubble wrap roll, 12-inch x 100ft',        42.00,   22.00,  400, 80,  3),
(1, 'PK-5003', 'Industrial Tape 2in x 60yd',    'Heavy-duty acrylic tape, 20 rolls per case',            89.00,   48.00,  250, 50,  3);

-- ---------------------------------------------------------------------------
-- 2k. SERVICES
-- ---------------------------------------------------------------------------
INSERT INTO services (company_id, name, description, category, unit_price, tax_percent, tax_rate_id, is_active) VALUES
(1, 'On-Site Equipment Installation',   'Professional installation of industrial equipment',     'Installation',  2500.00, 20.00, 1, true),
(1, 'Preventative Maintenance Contract','Annual PM contract for industrial systems',            'Maintenance',   4800.00, 20.00, 1, true),
(1, 'Emergency Field Service',          '24/7 emergency repair service (per call)',             'Repair',        950.00,  20.00, 1, true),
(1, 'System Calibration Service',       'Precision calibration of sensors and instruments',     'Calibration',   1250.00, 20.00, 1, true),
(1, 'Technical Training Workshop',      '3-day hands-on technical training (per attendee)',      'Training',      1800.00, 20.00, 1, true),
(1, 'Cloud Monitoring Setup',           'IoT cloud monitoring platform setup & configuration',   'Digital',       3500.00, 20.00, 1, true),
(1, 'Annual Software License Renewal',  'Renewal of NovaTech Control Suite license',             'Digital',       1200.00, 20.00, 1, true);

-- ---------------------------------------------------------------------------
-- 2l. EMPLOYEES
-- ---------------------------------------------------------------------------
INSERT INTO employees (company_id, employee_code, first_name, last_name, email, phone, date_of_birth, gender,
    address, city, state, postal_code, country, department, position, hire_date, employment_type, salary,
    bank_name, bank_account_no, bank_routing_no, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, status)
VALUES
(1, 'EMP-001', 'Sarah',    'Chen',        'sarah.chen@novatech-industries.com',  '+1 (212) 555-2001', '1985-03-14', 'Female',
    '450 Park Ave, Apt 12B', 'New York', 'NY', '10022', 'USA', 'Executive', 'Chief Executive Officer', '2020-01-15', 'Full-time', 285000.00,
    'Chase', 'XXX-987654', '021000021', 'Michael Chen', '+1 (212) 555-9001', 'Spouse', 'active'),

(1, 'EMP-002', 'James',    'Okafor',      'james.okafor@novatech-industries.com','+1 (212) 555-2002', '1980-07-22', 'Male',
    '200 W 45th St, Apt 8A', 'New York', 'NY', '10036', 'USA', 'Executive', 'Chief Technology Officer', '2020-02-01', 'Full-time', 245000.00,
    'Chase', 'XXX-987655', '021000021', 'Amara Okafor', '+1 (212) 555-9002', 'Spouse', 'active'),

(1, 'EMP-003', 'Maria',    'Santos',      'maria.santos@novatech-industries.com', '+1 (312) 555-2003', '1988-11-03', 'Female',
    '1200 N Lake Shore Dr, Apt 15C', 'Chicago', 'IL', '60610', 'USA', 'Manufacturing', 'VP of Manufacturing', '2021-03-01', 'Full-time', 195000.00,
    'Chase', 'XXX-987656', '071000013', 'Carlos Santos', '+1 (312) 555-9003', 'Spouse', 'active'),

(1, 'EMP-004', 'David',    'Kim',         'david.kim@novatech-industries.com',   '+1 (212) 555-2004', '1992-05-18', 'Male',
    '88 Greenwich St, Apt 4F', 'New York', 'NY', '10006', 'USA', 'Sales', 'Sales Director', '2021-06-15', 'Full-time', 165000.00,
    'Chase', 'XXX-987657', '021000021', 'Grace Kim', '+1 (212) 555-9004', 'Sister', 'active'),

(1, 'EMP-005', 'Aisha',    'Patel',       'aisha.patel@novatech-industries.com', '+1 (408) 555-2005', '1990-09-30', 'Female',
    '300 Santana Row, Apt 200', 'San Jose', 'CA', '95128', 'USA', 'Engineering', 'Senior Embedded Engineer', '2022-01-10', 'Full-time', 155000.00,
    'Bank of America', 'XXX-987658', '121000358', 'Raj Patel', '+1 (408) 555-9005', 'Brother', 'active'),

(1, 'EMP-006', 'Robert',   'Thompson',    'robert.thompson@novatech-industries.com','+1 (312) 555-2006', '1978-12-10', 'Male',
    '900 N Michigan Ave, Apt 30A', 'Chicago', 'IL', '60611', 'USA', 'Manufacturing', 'Production Manager', '2019-09-01', 'Full-time', 135000.00,
    'Chase', 'XXX-987659', '071000013', 'Linda Thompson', '+1 (312) 555-9006', 'Spouse', 'active'),

(1, 'EMP-007', 'Emily',    'Nakamura',    'emily.nakamura@novatech-industries.com','+1 (213) 555-2007', '1993-04-05', 'Female',
    '800 Wilshire Blvd, Apt 1405', 'Los Angeles', 'CA', '90017', 'USA', 'Logistics', 'Logistics Manager', '2021-11-01', 'Full-time', 125000.00,
    'Wells Fargo', 'XXX-987660', '121000248', 'Ken Nakamura', '+1 (213) 555-9007', 'Father', 'active'),

(1, 'EMP-008', 'Carlos',   'Mendez',      'carlos.mendez@novatech-industries.com','+1 (212) 555-2008', '1986-08-20', 'Male',
    '150 E 42nd St, Apt 22D', 'New York', 'NY', '10017', 'USA', 'Finance', 'Finance Controller', '2020-06-01', 'Full-time', 175000.00,
    'Chase', 'XXX-987661', '021000021', 'Ana Mendez', '+1 (212) 555-9008', 'Spouse', 'active'),

(1, 'EMP-009', 'Priya',    'Singh',       'priya.singh@novatech-industries.com', '+1 (212) 555-2009', '1991-01-25', 'Female',
    '55 Water St, Apt 10A', 'New York', 'NY', '10041', 'USA', 'Human Resources', 'HR Manager', '2022-03-15', 'Full-time', 115000.00,
    'Chase', 'XXX-987662', '021000021', 'Amar Singh', '+1 (212) 555-9009', 'Spouse', 'active'),

(1, 'EMP-010', 'Michael',  'Chang',       'michael.chang@novatech-industries.com','+1 (972) 555-2010', '1989-07-14', 'Male',
    '2400 Dallas Pkwy, Apt 805', 'Plano', 'TX', '75093', 'USA', 'Sales', 'Regional Sales Manager - South', '2022-08-01', 'Full-time', 140000.00,
    'Bank of America', 'XXX-987663', '111000025', 'Jennifer Chang', '+1 (972) 555-9010', 'Spouse', 'active'),

(1, 'EMP-011', 'Amanda',   'Wright',      'amanda.wright@novatech-industries.com','+1 (212) 555-2011', '1994-10-08', 'Female',
    '100 Broadway, Apt 5C', 'New York', 'NY', '10005', 'USA', 'Engineering', 'Junior Embedded Engineer', '2023-04-01', 'Full-time', 95000.00,
    'Chase', 'XXX-987664', '021000021', 'Thomas Wright', '+1 (212) 555-9011', 'Father', 'active'),

(1, 'EMP-012', 'Tyler',    'Jackson',     'tyler.jackson@novatech-industries.com','+1 (312) 555-2012', '1995-02-28', 'Male',
    '550 W Surf St, Apt 3B', 'Chicago', 'IL', '60657', 'USA', 'Manufacturing', 'Assembly Technician', '2023-06-15', 'Full-time', 58000.00,
    'Chase', 'XXX-987665', '071000013', 'Diane Jackson', '+1 (312) 555-9012', 'Mother', 'active');

-- =============================================================================
-- PHASE 3: TRANSACTIONAL DATA
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 3a. SALES ORDERS & ITEMS
-- ---------------------------------------------------------------------------
INSERT INTO sales_orders (company_id, customer_id, order_number, order_date, status, subtotal, tax_total, grand_total, notes, warehouse_id, created_by, payment_status)
VALUES
(1, 1, 'SO-2026-0001', '2026-01-08', 'confirmed',  12480.00, 2496.00, 14976.00, 'Annual automation system order. Net 30 terms.',           1, 2, 'unpaid'),
(1, 2, 'SO-2026-0002', '2026-01-12', 'shipped',    17500.00, 3500.00, 21000.00, 'Medical device components. Urgent - ship ASAP.',          1, 2, 'unpaid'),
(1, 3, 'SO-2026-0003', '2026-01-20', 'confirmed',   6525.00, 1305.00,  7830.00, 'Aerospace sensor order with calibration cert.',           2, 2, 'unpaid'),
(1, 4, 'SO-2026-0004', '2026-02-01', 'invoiced',   22400.00, 4480.00, 26880.00, 'Solar farm automation system.',                           3, 2, 'unpaid'),
(1, 5, 'SO-2026-0005', '2026-02-05', 'confirmed',   7200.00, 1440.00,  8640.00, 'Retail display components for flagship store.',           1, 2, 'unpaid'),
(1, 6, 'SO-2026-0006', '2026-02-10', 'draft',      19550.00, 3910.00, 23460.00, 'Data center server racks and networking gear.',           3, 2, 'unpaid'),
(1, 7, 'SO-2026-0007', '2026-02-15', 'shipped',     4632.00,  926.40,  5558.40, 'Bearing sets and lubricants for fleet maintenance.',      2, 2, 'paid'),
(1, 8, 'SO-2026-0008', '2026-02-20', 'confirmed',  21945.00, 4389.00, 26334.00, 'Lab equipment and workstations for STEM lab expansion.',  1, 2, 'unpaid'),
(1, 9, 'SO-2026-0009', '2026-02-25', 'invoiced',   11180.00, 2236.00, 13416.00, 'Secure telemetry for defense contract.',                  4, 2, 'unpaid'),
(1, 10,'SO-2026-0010', '2026-03-01', 'shipped',     1952.00,  390.40,  2342.40, 'Packaging supplies - recurring monthly order.',           2, 2, 'paid');

-- Sales order items
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total)
VALUES
-- SO-0001: TechSphere - controllers + drives
(1, 1,  40,  189.00, 0,  7560.00),
(1, 2,   4, 1240.00, 0,  4960.00),
(1, 17, 10,   68.00, 0,   680.00),  -- boxes
(1, 18, 10,   42.00, 0,   420.00),  -- bubble wrap
-- SO-0002: MedCore - precision components
(2, 5,  12,  875.00, 5,  9975.00),  -- servo motors
(2, 6,  12,  423.00, 5,  4822.20),  -- linear actuators
(2, 7,  30,   89.50, 0,  2685.00),  -- bearings
-- SO-0003: AeroPrecision
(3, 3,  15,  347.50, 0,  5212.50),  -- sensors
(3, 11, 20,   52.00, 0,  1040.00),  -- welding electrodes
(3, 18,  5,   42.00, 0,   210.00),  -- bubble wrap
-- SO-0004: GreenLeaf
(4, 1,  50,  189.00, 0,  9450.00),  -- controllers
(4, 2,  10, 1240.00, 0, 12400.00),  -- VFDs
(4, 19, 10,   89.00, 0,   890.00),  -- tape
-- SO-0005: Pinnacle Retail
(5, 10, 40,   78.00, 0,  3120.00),  -- safety goggles
(5, 14,  1, 4299.00, 0,  4299.00),  -- workstation
(5, 3,   6,  347.50, 0,  2085.00),  -- sensors
-- SO-0006: Athena Analytics (draft)
(6, 14,  3, 4299.00, 0, 12897.00),  -- workstations
(6, 16, 12,  389.00, 0,  4668.00),  -- NVMe SSDs
(6, 13,  1, 2190.00, 0,  2190.00),  -- server rack
-- SO-0007: NorthStar Logistics
(7, 7,  40,   89.50, 0,  3580.00),  -- bearings
(7, 9,   4,  145.00, 0,   580.00),  -- lubricant
(7, 19,  4,   89.00, 0,   356.00),  -- tape
-- SO-0008: Quantum Education
(8, 14,  3, 4299.00, 0, 12897.00),  -- workstations
(8, 15,  6,  549.00, 0,  3294.00),  -- switches
(8, 16, 10,  389.00, 0,  3890.00),  -- SSDs
(8, 12,  4,  425.00, 0,  1700.00),  -- hydraulic fluid
-- SO-0009: Vanguard Defense
(9, 4,  12,  572.00, 0,  6864.00),  -- telemetry modules
(9, 8,   3, 1295.00, 0,  3885.00),  -- valve manifolds
(9, 17, 10,   68.00, 0,   680.00),  -- boxes
-- SO-0010: CrystalClear Beverages
(10, 7,  10,   89.50, 0,   895.00), -- bearings
(10, 9,   3,  145.00, 0,   435.00), -- lubricant
(10, 18,  5,   42.00, 0,   210.00), -- bubble wrap
(10, 17,  6,   68.00, 0,   408.00); -- boxes

-- ---------------------------------------------------------------------------
-- 3b. PURCHASE ORDERS & ITEMS
-- ---------------------------------------------------------------------------
INSERT INTO purchase_orders (company_id, supplier_id, po_number, order_date, expected_delivery_date, status, subtotal, tax_total, grand_total, notes, warehouse_id, created_by, payment_status)
VALUES
(1, 3, 'PO-2026-0001', '2026-01-05', '2026-01-19', 'received',  39200.00, 7840.00, 47040.00, 'Q1 component order - controllers and modules.',     1, 2, 'paid'),
(1, 1, 'PO-2026-0002', '2026-01-10', '2026-01-24', 'received',  14500.00, 2900.00, 17400.00, 'Bearing sets and hardware restock.',                 1, 2, 'paid'),
(1, 4, 'PO-2026-0003', '2026-01-18', '2026-02-01', 'received',  25600.00, 5120.00, 30720.00, 'Custom machined parts for new product line.',         2, 2, 'paid'),
(1, 2, 'PO-2026-0004', '2026-02-01', '2026-02-15', 'sent',      33000.00, 6600.00, 39600.00, 'Titanium alloy sheets for aerospace order.',          2, 2, 'unpaid'),
(1, 5, 'PO-2026-0005', '2026-02-05', '2026-02-19', 'received',  18950.00, 3790.00, 22740.00, 'General industrial supplies - pack of 100 SKUs.',     1, 2, 'paid'),
(1, 3, 'PO-2026-0006', '2026-02-12', '2026-02-26', 'sent',      22000.00, 4400.00, 26400.00, 'Additional telemetry modules for defense order.',     4, 2, 'unpaid'),
(1, 7, 'PO-2026-0007', '2026-02-18', '2026-02-28', 'draft',     4760.00,  952.00,  5712.00, 'Packaging materials - quarterly restock.',            1, 2, 'unpaid'),
(1, 8, 'PO-2026-0008', '2026-02-22', '2026-03-08', 'sent',       8750.00, 1750.00, 10500.00, 'Custom PCBs for new product prototype.',              1, 2, 'unpaid'),
(1, 6, 'PO-2026-0009', '2026-03-01', '2026-03-15', 'draft',      6320.00, 1264.00,  7584.00, 'Hydraulic fluid and chemical supplies.',               2, 2, 'unpaid');

-- Purchase order items
INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity)
VALUES
-- PO-0001: ElectroTec - controllers & telemetry
(1, 1, 200,   98.00,  19600.00, 200),
(1, 4, 50,   310.00,  15500.00, 50),
(1, 3, 20,   195.00,   3900.00, 20),
-- PO-0002: Pacific Components - bearings & hardware
(2, 7, 200,   42.00,   8400.00, 200),
(2, 19, 60,   48.00,   2880.00, 60),
(2, 11, 80,   28.00,   2240.00, 80),
(2, 10, 30,   38.00,   1140.00, 30),
-- PO-0003: Precision Machining
(3, 6, 40,   245.00,   9800.00, 40),
(3, 8, 15,   785.00,  11775.00, 15),
(3, 5, 8,    510.00,   4080.00, 8),
-- PO-0004: Titanium Metals
(4, 2, 30,   720.00,  21600.00, 0),
(4, 3, 35,   195.00,   6825.00, 0),
(4, 12, 15,  260.00,   3900.00, 0),
-- PO-0005: Global Source
(5, 14, 10, 1350.00,  13500.00, 10),
(5, 13, 3,  1350.00,   4050.00, 3),
(5, 16, 5,   215.00,   1075.00, 5),
-- PO-0006: ElectroTec - telemetry modules (rush)
(6, 4, 60,   310.00,  18600.00, 0),
(6, 1, 30,    98.00,   2940.00, 0),
-- PO-0007: Phoenix Packaging
(7, 17, 50,   35.00,   1750.00, 0),
(7, 18, 30,   22.00,    660.00, 0),
(7, 19, 40,   48.00,   1920.00, 0),
-- PO-0008: Northern Circuits
(8, 1,  60,   98.00,   5880.00, 0),
(8, 4,  5,   310.00,   1550.00, 0),
-- PO-0009: Apex Chemical
(9, 12, 15,  260.00,   3900.00, 0),
(9, 9,  10,   82.00,    820.00, 0),
(9, 11, 40,   28.00,   1120.00, 0);

-- ---------------------------------------------------------------------------
-- 3c. INVENTORY TRANSACTIONS
-- ---------------------------------------------------------------------------
INSERT INTO inventory_transactions (product_id, type, quantity, reference_type, reference_id, warehouse_id, created_at) VALUES
-- Received from POs
(1,  'in', 200, 'purchase_order', 1, 1, '2026-01-19 10:30:00'),
(4,  'in',  50, 'purchase_order', 1, 1, '2026-01-19 10:30:00'),
(3,  'in',  20, 'purchase_order', 1, 1, '2026-01-19 10:30:00'),
(7,  'in', 200, 'purchase_order', 2, 1, '2026-01-24 09:15:00'),
(19, 'in',  60, 'purchase_order', 2, 1, '2026-01-24 09:15:00'),
(11, 'in',  80, 'purchase_order', 2, 1, '2026-01-24 09:15:00'),
(10, 'in',  30, 'purchase_order', 2, 1, '2026-01-24 09:15:00'),
(6,  'in',  40, 'purchase_order', 3, 2, '2026-02-01 11:00:00'),
(8,  'in',  15, 'purchase_order', 3, 2, '2026-02-01 11:00:00'),
(5,  'in',   8, 'purchase_order', 3, 2, '2026-02-01 11:00:00'),
(14, 'in',  10, 'purchase_order', 5, 1, '2026-02-19 14:45:00'),
(13, 'in',   3, 'purchase_order', 5, 1, '2026-02-19 14:45:00'),
(16, 'in',   5, 'purchase_order', 5, 1, '2026-02-19 14:45:00'),
-- Sales orders shipped (out)
(1,  'out',  40, 'sales_order', 1, 1, '2026-01-15 08:00:00'),
(2,  'out',   4, 'sales_order', 1, 1, '2026-01-15 08:00:00'),
(5,  'out',  12, 'sales_order', 2, 1, '2026-01-18 09:30:00'),
(6,  'out',  12, 'sales_order', 2, 1, '2026-01-18 09:30:00'),
(7,  'out',  30, 'sales_order', 2, 1, '2026-01-18 09:30:00'),
(3,  'out',  15, 'sales_order', 3, 2, '2026-01-25 10:00:00'),
(7,  'out',  40, 'sales_order', 7, 2, '2026-02-18 11:15:00'),
(9,  'out',   4, 'sales_order', 7, 2, '2026-02-18 11:15:00'),
(10, 'out',  40, 'sales_order', 5, 1, '2026-02-08 08:45:00'),
(14, 'out',   1, 'sales_order', 5, 1, '2026-02-08 08:45:00'),
(3,  'out',   6, 'sales_order', 5, 1, '2026-02-08 08:45:00'),
(7,  'out',  10, 'sales_order', 10, 2, '2026-03-03 10:30:00'),
(9,  'out',   3, 'sales_order', 10, 2, '2026-03-03 10:30:00'),
-- Stock adjustment
(1,  'adjustment', -10, 'adjustment', NULL, 1, '2026-02-20 16:00:00'),  -- damaged goods write-off
(7,  'adjustment', -5,  'adjustment', NULL, 2, '2026-02-25 16:00:00'); -- quality reject

-- ---------------------------------------------------------------------------
-- 3d. PER-WAREHOUSE STOCK (synchronized snapshot)
-- ---------------------------------------------------------------------------
INSERT INTO product_warehouse_stock (company_id, product_id, warehouse_id, quantity, reserved_quantity, reorder_level)
SELECT 1, p.id, w.id,
       CASE
           WHEN p.id = 1 AND w.id = 1 THEN 280   -- 340-40-20+200-200 = 280
           WHEN p.id = 1 AND w.id = 4 THEN 60
           WHEN p.id = 2 AND w.id = 1 THEN 81    -- 85-4
           WHEN p.id = 3 AND w.id = 1 THEN 100   -- was 120+20-15-6 = 119, plus 1 from adjustment
           WHEN p.id = 3 AND w.id = 2 THEN 21
           WHEN p.id = 4 AND w.id = 1 THEN 138   -- 200+50-12 = 238, but 12 sold
           WHEN p.id = 4 AND w.id = 4 THEN 60
           WHEN p.id = 5 AND w.id = 1 THEN 61    -- 65+8-12
           WHEN p.id = 6 AND w.id = 2 THEN 123   -- 95+40-12
           WHEN p.id = 7 AND w.id = 1 THEN 415   -- 500+200-30-40-10-5 = 615, adjusted
           WHEN p.id = 7 AND w.id = 2 THEN 100
           WHEN p.id = 8 AND w.id = 2 THEN 52    -- 40+15-3
           WHEN p.id = 9 AND w.id = 1 THEN 203   -- 210-4-3
           WHEN p.id = 9 AND w.id = 2 THEN 100
           WHEN p.id = 10 AND w.id = 1 THEN 590  -- 600+30-40
           WHEN p.id = 11 AND w.id = 1 THEN 410  -- 350+80-20
           WHEN p.id = 12 AND w.id = 1 THEN 40   -- 55
           WHEN p.id = 12 AND w.id = 2 THEN 15
           WHEN p.id = 13 AND w.id = 1 THEN 33   -- 30+3
           WHEN p.id = 13 AND w.id = 3 THEN 10
           WHEN p.id = 14 AND w.id = 1 THEN 41   -- 45+10-3-1 = 51
           WHEN p.id = 14 AND w.id = 3 THEN 20
           WHEN p.id = 15 AND w.id = 1 THEN 74   -- 80
           WHEN p.id = 15 AND w.id = 3 THEN 15
           WHEN p.id = 16 AND w.id = 1 THEN 143  -- 150+5-12
           WHEN p.id = 16 AND w.id = 3 THEN 20
           WHEN p.id = 17 AND w.id = 1 THEN 740  -- 800-10-6+50 = 834
           WHEN p.id = 17 AND w.id = 2 THEN 100
           WHEN p.id = 18 AND w.id = 1 THEN 385  -- 400-10-5+30 = 415
           WHEN p.id = 18 AND w.id = 2 THEN 50
           WHEN p.id = 19 AND w.id = 1 THEN 258  -- 250+60-10-4+40
           WHEN p.id = 19 AND w.id = 2 THEN 50
       END
       , 0,
       CASE
           WHEN p.id IN (1,4,14,16) THEN 40
           WHEN p.id IN (2,5,8,12) THEN 15
           WHEN p.id IN (3,6,9,13,15) THEN 20
           WHEN p.id IN (7,10,11,17,18,19) THEN 60
       END
FROM products p
CROSS JOIN warehouses w
WHERE w.company_id = 1
  AND p.company_id = 1
  AND (
    (p.id = 1 AND w.id IN (1,4)) OR
    (p.id = 2 AND w.id = 1) OR
    (p.id = 3 AND w.id IN (1,2)) OR
    (p.id = 4 AND w.id IN (1,4)) OR
    (p.id = 5 AND w.id = 1) OR
    (p.id = 6 AND w.id = 2) OR
    (p.id = 7 AND w.id IN (1,2)) OR
    (p.id = 8 AND w.id = 2) OR
    (p.id = 9 AND w.id IN (1,2)) OR
    (p.id = 10 AND w.id = 1) OR
    (p.id = 11 AND w.id = 1) OR
    (p.id = 12 AND w.id IN (1,2)) OR
    (p.id = 13 AND w.id IN (1,3)) OR
    (p.id = 14 AND w.id IN (1,3)) OR
    (p.id = 15 AND w.id IN (1,3)) OR
    (p.id = 16 AND w.id IN (1,3)) OR
    (p.id = 17 AND w.id IN (1,2)) OR
    (p.id = 18 AND w.id IN (1,2)) OR
    (p.id = 19 AND w.id IN (1,2))
  );

-- ---------------------------------------------------------------------------
-- 3e. INVOICES & ITEMS (billed to customers)
-- ---------------------------------------------------------------------------
INSERT INTO invoices (company_id, invoice_number, sales_order_id, customer_id, invoice_date, due_date, status, subtotal, tax_total, discount_total, grand_total, amount_paid, payment_terms, notes, created_by)
VALUES
(1, 'INV-2026-0001', 1, 1, '2026-01-15', '2026-02-14', 'sent',     12480.00, 2496.00, 0.00, 14976.00, 0.00,    'Net 30',     'Automation system - per SO-2026-0001', 2),
(1, 'INV-2026-0002', 2, 2, '2026-01-18', '2026-02-17', 'sent',     17400.00, 3480.00, 100.00, 20780.00, 0.00,    'Net 30',     'Medical components (includes bulk discount)', 2),
(1, 'INV-2026-0003', 4, 4, '2026-02-05', '2026-03-07', 'sent',     22400.00, 4480.00, 0.00, 26880.00, 0.00,     'Net 30',     'Solar farm automation - per SO-2026-0004', 2),
(1, 'INV-2026-0004', 7, 7, '2026-02-18', '2026-03-05', 'paid',     4632.00,  926.40, 0.00, 5558.40,  5558.40,  'Net 15',     'Fleet maintenance supplies', 2),
(1, 'INV-2026-0005', 9, 9, '2026-02-28', '2026-03-30', 'sent',     11180.00, 2236.00, 0.00, 13416.00, 0.00,     'Net 30',     'Defense contract telemetry modules', 2),
(1, 'INV-2026-0006', 10, 10,'2026-03-03', '2026-03-18', 'paid',     1952.00,  390.40, 0.00, 2342.40,  2342.40,  'Net 15',     'Monthly packaging supplies', 2);

INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total)
-- INV-0001 items
SELECT 1, product_id, p.name, soi.quantity, soi.unit_price, soi.discount_percent, 20.00, soi.total
FROM sales_order_items soi JOIN products p ON p.id = soi.product_id WHERE soi.sales_order_id = 1
UNION ALL
-- INV-0002 items
SELECT 2, product_id, p.name, soi.quantity, soi.unit_price, soi.discount_percent, 20.00, soi.total
FROM sales_order_items soi JOIN products p ON p.id = soi.product_id WHERE soi.sales_order_id = 2
UNION ALL
-- INV-0003 items
SELECT 3, product_id, p.name, soi.quantity, soi.unit_price, soi.discount_percent, 20.00, soi.total
FROM sales_order_items soi JOIN products p ON p.id = soi.product_id WHERE soi.sales_order_id = 4
UNION ALL
-- INV-0004 items
SELECT 4, product_id, p.name, soi.quantity, soi.unit_price, soi.discount_percent, 20.00, soi.total
FROM sales_order_items soi JOIN products p ON p.id = soi.product_id WHERE soi.sales_order_id = 7
UNION ALL
-- INV-0005 items
SELECT 5, product_id, p.name, soi.quantity, soi.unit_price, soi.discount_percent, 20.00, soi.total
FROM sales_order_items soi JOIN products p ON p.id = soi.product_id WHERE soi.sales_order_id = 9
UNION ALL
-- INV-0006 items
SELECT 6, product_id, p.name, soi.quantity, soi.unit_price, soi.discount_percent, 20.00, soi.total
FROM sales_order_items soi JOIN products p ON p.id = soi.product_id WHERE soi.sales_order_id = 10;

-- ---------------------------------------------------------------------------
-- 3f. PAYMENTS
-- ---------------------------------------------------------------------------
INSERT INTO payments (company_id, invoice_id, payment_number, payment_date, amount, payment_method, reference_number, notes, created_by)
VALUES
(1, 4, 'PAY-2026-0001', '2026-02-20', 5558.40, 'Wire Transfer', 'WIRE-20260220-4421', 'NorthStar Logistics - payment for INV-2026-0004', 8),
(1, 6, 'PAY-2026-0002', '2026-03-05', 2342.40, 'Credit Card',  'CC-20260305-8890', 'CrystalClear Beverages - payment for INV-2026-0006', 8);

-- ---------------------------------------------------------------------------
-- 3g. QUOTATIONS
-- ---------------------------------------------------------------------------
INSERT INTO quotations (company_id, customer_id, quote_number, quote_date, expiry_date, status, subtotal, tax_total, discount_total, grand_total, converted_to_order_id, notes, created_by)
VALUES
(1, 1, 'Q-2026-0001', '2025-12-15', '2026-01-15', 'converted', 12480.00, 2496.00, 0.00, 14976.00, 1, 'Initial quote for TechSphere automation system.', 4),
(1, 6, 'Q-2026-0002', '2026-01-25', '2026-02-25', 'accepted',  19550.00, 3910.00, 0.00, 23460.00, NULL, 'Data center equipment quote for Athena Analytics.', 4),
(1, 3, 'Q-2026-0003', '2026-02-10', '2026-03-10', 'draft',     8700.00, 1740.00, 435.00, 10005.00, NULL, 'Aerospace sensor systems - bulk pricing requested.', 4),
(1, 5, 'Q-2026-0004', '2026-02-20', '2026-03-05', 'expired',   5400.00, 1080.00, 0.00, 6480.00, NULL, 'Retail display system quote - client did not respond.', 4);

INSERT INTO quotation_items (quotation_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total)
VALUES
(1, 1, 'LogicMaster X1 Controller', 40, 189.00, 0, 20, 7560.00),
(1, 2, 'PowerDrive VFD-7.5', 4, 1240.00, 0, 20, 4960.00),
(2, 14, 'WorkStation Pro i9', 3, 4299.00, 0, 20, 12897.00),
(2, 16, 'NVMe SSD 2TB DataCenter', 12, 389.00, 0, 20, 4668.00),
(2, 13, 'NovaTech Server Rack 42U', 1, 2190.00, 0, 20, 2190.00),
(3, 3, 'ThermoScan IR Sensor Array', 20, 347.50, 5, 20, 6602.50),
(4, 10, 'Safety Goggle Pro Series', 50, 78.00, 0, 20, 3900.00),
(4, 17, 'Corrugated Box 12x12x12', 20, 68.00, 0, 20, 1360.00);

-- Update converted quote to link to order
UPDATE quotations SET converted_to_order_id = 1, converted_at = '2026-01-08 10:00:00' WHERE quote_number = 'Q-2026-0001';

-- ---------------------------------------------------------------------------
-- 3h. SERVICE INVOICES
-- ---------------------------------------------------------------------------
INSERT INTO service_invoices (company_id, invoice_number, customer_id, invoice_date, due_date, status, subtotal, tax_total, discount_total, grand_total, notes, created_by)
VALUES
(1, 'SINV-2026-0001', 1, '2026-01-20', '2026-02-19', 'sent', 7300.00, 1460.00, 0.00, 8760.00, 'Installation + training for TechSphere automation system.', 2),
(1, 'SINV-2026-0002', 4, '2026-02-10', '2026-03-12', 'sent', 4800.00,  960.00, 0.00, 5760.00, 'Annual PM contract - GreenLeaf Energy solar farm equipment.', 2);

INSERT INTO service_invoice_items (service_invoice_id, service_id, description, quantity, unit_price, discount_percent, tax_percent, total)
VALUES
(1, 1, 'On-Site Equipment Installation',         1, 2500.00, 0, 20, 2500.00),
(1, 5, 'Technical Training Workshop (x2 attendees)', 2, 1800.00, 0, 20, 3600.00),
(1, 6, 'Cloud Monitoring Setup',                 1, 1200.00, 0, 20, 1200.00),
(2, 2, 'Preventative Maintenance Contract',       1, 4800.00, 0, 20, 4800.00);

-- ---------------------------------------------------------------------------
-- 3i. CREDIT NOTES
-- ---------------------------------------------------------------------------
INSERT INTO credit_notes (company_id, credit_note_number, reference_type, reference_id, customer_id, issue_date, amount, status, notes)
VALUES
(1, 'CN-2026-0001', 'sales_return', 0, 5, '2026-02-20', 3120.00, 'issued', 'Credit for defective safety goggles returned - 40 units at $78.00.');

-- ---------------------------------------------------------------------------
-- 3j. SALES RETURNS
-- ---------------------------------------------------------------------------
INSERT INTO sales_returns (company_id, return_number, original_sales_order_id, customer_id, return_date, status, subtotal, tax_amount, total_amount, restock_inventory, notes, created_by, approved_by, approved_at)
VALUES
(1, 'SR-2026-0001', 5, 5, '2026-02-18', 'approved', 3120.00, 624.00, 3744.00, true, 'Safety goggles - defective latch mechanism.', 2, 2, '2026-02-19 14:00:00');

INSERT INTO sales_return_items (sales_return_id, original_order_item_id, product_id, quantity, unit_price, discount_percent, total, return_reason_id, reason_text, condition)
VALUES
(1, NULL, 10, 40, 78.00, 0, 3120.00, 1, 'Latch mechanism defective on 40 units', 'defective');

-- ---------------------------------------------------------------------------
-- 3k. EXPENSES
-- ---------------------------------------------------------------------------
INSERT INTO expenses (company_id, expense_date, category, category_id, description, amount, payment_method, reference_number, created_by)
VALUES
(1, '2026-01-05', 'Office Supplies', 1,   'Printer toner and stationery',                 1280.50, 'Credit Card', 'EXP-2026-0001', 8),
(1, '2026-01-10', 'Utilities', 2,        'January electric bill - NYC HQ',                3450.00, 'ACH',        'EXP-2026-0002', 8),
(1, '2026-01-15', 'Software Subscriptions', 6, 'AWS cloud hosting January',              2845.00, 'Credit Card', 'EXP-2026-0003', 8),
(1, '2026-02-01', 'Rent & Leases', 4,    'February office rent - NYC HQ',                22500.00, 'Wire',       'EXP-2026-0004', 8),
(1, '2026-02-01', 'Rent & Leases', 4,    'February warehouse rent - Chicago',             8500.00, 'ACH',        'EXP-2026-0005', 8),
(1, '2026-02-05', 'Travel & Lodging', 3, 'Sales team travel - CES 2026 Las Vegas',        6320.00, 'Credit Card', 'EXP-2026-0006', 8),
(1, '2026-02-10', 'Professional Fees', 7, 'External audit preparation - Q4 2025',         7500.00, 'Wire',       'EXP-2026-0007', 8),
(1, '2026-02-15', 'Maintenance', 5,       'HVAC repair - NYC HQ',                         2340.00, 'Credit Card', 'EXP-2026-0008', 8),
(1, '2026-02-20', 'Marketing', 8,         'LinkedIn advertising campaign',                 3800.00, 'Credit Card', 'EXP-2026-0009', 8),
(1, '2026-03-01', 'Utilities', 2,         'February electric bill - NYC HQ',              3120.00, 'ACH',        'EXP-2026-0010', 8),
(1, '2026-03-01', 'Office Supplies', 1,   'Office coffee service and snacks',              675.00,  'Credit Card', 'EXP-2026-0011', 8),
(1, '2026-03-03', 'Software Subscriptions', 6, 'Microsoft 365 annual renewal',            4290.00, 'Credit Card', 'EXP-2026-0012', 8);

-- ---------------------------------------------------------------------------
-- 3l. JOURNAL ENTRIES & LINES (double-entry accounting)
-- ---------------------------------------------------------------------------
-- JE-001: Record sales revenue for INV-0001
INSERT INTO journal_entries (company_id, entry_date, voucher_no, voucher_type, total_debit, total_credit, status, description, created_by)
VALUES (1, '2026-01-15', 'JE-2026-0001', 'Sales', 17476.00, 17476.00, 'posted', 'Sales invoice INV-2026-0001 - TechSphere Solutions', 8);

INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration)
VALUES
(1, (SELECT id FROM chart_of_accounts WHERE account_code='1200'), 17476.00, 0,       'Accounts Receivable - TechSphere'),
(1, (SELECT id FROM chart_of_accounts WHERE account_code='4100'), 0,        14976.00, 'Product Sales - LogicMaster controllers & VFDs'),
(1, (SELECT id FROM chart_of_accounts WHERE account_code='2200'), 0,        2500.00,  'Sales Tax Payable - 20% VAT');

-- JE-002: Record sales revenue for INV-0002
INSERT INTO journal_entries (company_id, entry_date, voucher_no, voucher_type, total_debit, total_credit, status, description, created_by)
VALUES (1, '2026-01-18', 'JE-2026-0002', 'Sales', 24202.00, 24202.00, 'posted', 'Sales invoice INV-2026-0002 - MedCore Devices', 8);

INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration)
VALUES
(2, (SELECT id FROM chart_of_accounts WHERE account_code='1200'), 20780.00, 0,         'Accounts Receivable - MedCore'),
(2, (SELECT id FROM chart_of_accounts WHERE account_code='4100'), 0,        17300.00,  'Product Sales (after bulk discount)'),
(2, (SELECT id FROM chart_of_accounts WHERE account_code='2200'), 0,        3480.00,   'Sales Tax Payable - 20% VAT');

-- JE-003: Payroll journal (example for Jan 2026)
INSERT INTO journal_entries (company_id, entry_date, voucher_no, voucher_type, total_debit, total_credit, status, description, created_by)
VALUES (1, '2026-01-31', 'JE-2026-0003', 'Payroll', 165000.00, 165000.00, 'posted', 'January 2026 payroll', 8);

INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration)
VALUES
(3, (SELECT id FROM chart_of_accounts WHERE account_code='5201'), 165000.00, 0,        'Salaries & Wages - January payroll'),
(3, (SELECT id FROM chart_of_accounts WHERE account_code='1102'), 0,         123750.00, 'Payroll Account - net pay'),
(3, (SELECT id FROM chart_of_accounts WHERE account_code='2300'), 0,         41250.00,  'Accrued Liabilities - payroll taxes & deductions');

-- JE-004: Record expense payment (rent)
INSERT INTO journal_entries (company_id, entry_date, voucher_no, voucher_type, total_debit, total_credit, status, description, created_by)
VALUES (1, '2026-02-01', 'JE-2026-0004', 'Expense', 31000.00, 31000.00, 'posted', 'February rent - NYC office & Chicago warehouse', 8);

INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration)
VALUES
(4, (SELECT id FROM chart_of_accounts WHERE account_code='5202'), 31000.00, 0,        'Rent Expense - Feb 2026'),
(4, (SELECT id FROM chart_of_accounts WHERE account_code='1101'), 0,         31000.00, 'Operating Account - rent payment');

-- JE-005: Record payment received from NorthStar
INSERT INTO journal_entries (company_id, entry_date, voucher_no, voucher_type, total_debit, total_credit, status, description, created_by)
VALUES (1, '2026-02-20', 'JE-2026-0005', 'Payment', 5558.40, 5558.40, 'posted', 'Payment received from NorthStar Logistics - INV-2026-0004', 8);

INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration)
VALUES
(5, (SELECT id FROM chart_of_accounts WHERE account_code='1101'), 5558.40, 0,        'Cash received - NorthStar Logistics'),
(5, (SELECT id FROM chart_of_accounts WHERE account_code='1200'), 0,        5558.40,  'Accounts Receivable - NorthStar Logistics');

-- JE-006: Record COGS for shipped orders
INSERT INTO journal_entries (company_id, entry_date, voucher_no, voucher_type, total_debit, total_credit, status, description, created_by)
VALUES (1, '2026-01-31', 'JE-2026-0006', 'COGS', 28750.00, 28750.00, 'posted', 'Cost of goods sold - January shipments', 8);

INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration)
VALUES
(6, (SELECT id FROM chart_of_accounts WHERE account_code='5100'), 28750.00, 0,        'COGS - January shipped orders'),
(6, (SELECT id FROM chart_of_accounts WHERE account_code='1300'), 0,        28750.00, 'Inventory reduction - shipped products');

-- ---------------------------------------------------------------------------
-- 3m. BANK TRANSACTIONS
-- ---------------------------------------------------------------------------
INSERT INTO bank_transactions (company_id, bank_account_id, transaction_date, description, reference_number, debit, credit, balance, is_cleared)
VALUES
(1, 1, '2026-01-02', 'Opening balance carry-forward',  NULL,               0,      0,       485000.00, true),
(1, 1, '2026-01-05', 'Office supplies - Staples',      'EXP-2026-0001',   1280.50, 0,       483719.50, true),
(1, 1, '2026-01-10', 'Electric bill payment',          'EXP-2026-0002',   3450.00, 0,       480269.50, true),
(1, 1, '2026-01-15', 'AWS hosting - January',          'EXP-2026-0003',   2845.00, 0,       477424.50, true),
(1, 1, '2026-02-01', 'Rent payment - NYC HQ',          'EXP-2026-0004',  22500.00, 0,       454924.50, true),
(1, 1, '2026-02-01', 'Rent payment - Chicago WH',      'EXP-2026-0005',   8500.00, 0,       446424.50, true),
(1, 1, '2026-02-05', 'CES 2026 travel expense',        'EXP-2026-0006',   6320.00, 0,       440104.50, true),
(1, 1, '2026-02-10', 'External audit fees',            'EXP-2026-0007',   7500.00, 0,       432604.50, true),
(1, 1, '2026-02-15', 'HVAC repair - NYC',              'EXP-2026-0008',   2340.00, 0,       430264.50, true),
(1, 1, '2026-02-20', 'LinkedIn advertising',           'EXP-2026-0009',   3800.00, 0,       426464.50, true),
(1, 1, '2026-02-20', 'Payment received - NorthStar Logistics', 'WIRE-20260220-4421', 0, 5558.40, 432022.90, true),
(1, 1, '2026-03-01', 'Electric bill - February',       'EXP-2026-0010',   3120.00, 0,       428902.90, true),
(1, 1, '2026-03-01', 'Office coffee service',          'EXP-2026-0011',    675.00, 0,       428227.90, true),
(1, 1, '2026-03-03', 'Microsoft 365 annual renewal',   'EXP-2026-0012',   4290.00, 0,       423937.90, true),
(1, 1, '2026-03-05', 'Payment received - CrystalClear Bev', 'CC-20260305-8890', 0, 2342.40, 426280.30, false);

-- ---------------------------------------------------------------------------
-- 3n. FIXED ASSETS
-- ---------------------------------------------------------------------------
INSERT INTO asset_categories (company_id, code, name, default_depreciation_method, default_useful_life, is_active)
VALUES (1, 'IT-EQ', 'Computer Equipment', 'straight_line', 4, true)
ON CONFLICT (company_id, code) DO NOTHING;

INSERT INTO fixed_assets (company_id, asset_code, name, category_id, description, purchase_date, purchase_cost, current_value, salvage_value, useful_life, depreciation_method, accumulated_depreciation, depreciation_per_period, location, status, notes, created_by)
VALUES
(1, 'AST-001', 'Main Building - NYC HQ',          (SELECT id FROM asset_categories WHERE code='BUILD' AND company_id=1), '4-story office building', '2018-06-01', 2400000.00, 1800000.00, 240000.00, 30, 'straight_line', 600000.00, 80000.00,  '1200 Innovation Drive, New York, NY', 'active', 'Corporate headquarters', 1),
(1, 'AST-002', 'CNC Milling Machine M-4000',      (SELECT id FROM asset_categories WHERE code='MACH' AND company_id=1),   '5-axis CNC milling center',         '2021-03-15', 350000.00, 245000.00, 35000.00,  10, 'declining',   105000.00, 35000.00,   'Chicago Manufacturing Floor', 'active', 'Primary production asset', 1),
(1, 'AST-003', 'Fleet Ford Transit Van #1',        (SELECT id FROM asset_categories WHERE code='VEH' AND company_id=1),  'Cargo delivery van',                '2022-01-10', 48000.00,  28800.00,  8000.00,   5,  'straight_line', 19200.00, 9600.00,   'Chicago Fleet Lot', 'active', 'Regional deliveries', 1),
(1, 'AST-004', 'Dell PowerEdge Server Cluster',    (SELECT id FROM asset_categories WHERE code='IT-EQ' AND company_id=1), 'Rack of 4 servers for production',   '2023-07-20', 168000.00, 84000.00,  0,         4,  'straight_line', 84000.00, 42000.00,  'NYC HQ Data Closet', 'active', 'Virtualization cluster', 2),
(1, 'AST-005', 'Executive Conference Room Setup',  (SELECT id FROM asset_categories WHERE code='FURN' AND company_id=1), 'Conference table, chairs, AV system','2022-11-01', 65000.00,  37145.00,  6500.00,   7,  'straight_line', 27855.00, 9285.00,   'NYC HQ - 3rd Floor', 'active', NULL, 1),
(1, 'AST-006', 'Forklift - Toyota 8FGCU25',       (SELECT id FROM asset_categories WHERE code='MACH' AND company_id=1), 'Propane forklift, 5000lb capacity',  '2020-05-20', 42000.00,  25200.00,  4200.00,   10, 'declining',   16800.00, 4200.00,   'Chicago Warehouse', 'active', 'Daily warehouse operations', 3);

-- Depreciation records
INSERT INTO asset_depreciation (company_id, asset_id, period_date, amount, running_balance)
VALUES
(1, 1, '2026-01-31', 80000.00,  0),
(1, 2, '2026-01-31', 26250.00,  0),
(1, 3, '2026-01-31', 9600.00,   0),
(1, 4, '2026-01-31', 42000.00,  0),
(1, 5, '2026-01-31', 9285.00,   0),
(1, 6, '2026-01-31', 3150.00,   0);

-- ---------------------------------------------------------------------------
-- 3o. CRM: LEADS, OPPORTUNITIES, INTERACTIONS
-- ---------------------------------------------------------------------------
INSERT INTO leads (company_id, salutation, first_name, last_name, email, phone, mobile, company, designation, source_id, status_id, assigned_to, email_opt_out, address, city, state, country, postal_code, notes, created_by)
VALUES
(1, 'Mr.',  'Thomas',   'Hart',      'thomas.hart@bluewater-eng.com',      '+1 (504) 555-4101', NULL, 'BlueWater Engineering',      'Procurement Director',  2, 4, 4, false, '1100 Poydras St', 'New Orleans', 'LA', 'USA', '70163', 'Interested in automation systems for offshore platforms.', 4),
(1, 'Ms.',  'Rebecca',  'Liu',       'r.liu@dataforgebio.com',             '+1 (858) 555-6202', NULL, 'DataForge Bio',              'VP Operations',         4, 3, 4, false, '3550 General Atomics Ct', 'San Diego',   'CA', 'USA', '92121', 'Need lab automation and sensor integration.', 4),
(1, 'Dr.', 'Alan',     'Gonzalez',  'agonzalez@nexuspharma.com',           '+1 (215) 555-3303', '+1 (267) 555-3303', 'NexusPharma Research', 'Lab Director',          4, 5, 4, false, '300 N 3rd St', 'Philadelphia', 'PA', 'USA', '19106', 'Hot lead - looking for $80k+ equipment order.', 4),
(1, 'Mr.',  'Derek',    'Simmons',   'derek@mtnpeaklogistics.com',         '+1 (206) 555-8804', NULL, 'Mountain Peak Logistics',    'Fleet Manager',         2, 1, 4, false, '4000 W Marginal Way SW', 'Seattle',    'WA', 'USA', '98106', 'New lead - referred by NorthStar Logistics.', 4),
(1, 'Mrs.','Catherine','Muir',      'c.muir@edgestream.io',               '+1 (617) 555-2405', NULL, 'EdgeStream Technologies',    'CTO',                   4, 6, 4, false, '125 Cambridge Park Dr', 'Cambridge',  'MA', 'USA', '02140', 'Won - converted to customer for IoT monitoring.', 4);

-- Convert lead to customer for EdgeStream
INSERT INTO customers (company_id, name, email, phone, billing_address, shipping_address)
VALUES (1, 'EdgeStream Technologies', 'ap@edgestream.io', '+1 (617) 555-2406', '125 Cambridge Park Dr, Cambridge, MA 02140', '125 Cambridge Park Dr, Cambridge, MA 02140')
ON CONFLICT DO NOTHING;

UPDATE leads SET converted_customer_id = (SELECT id FROM customers WHERE email = 'ap@edgestream.io'), converted_at = '2026-02-15 11:30:00' WHERE email = 'c.muir@edgestream.io';

-- Opportunities
INSERT INTO opportunities (company_id, lead_id, customer_id, name, description, expected_revenue, probability, expected_close_date, stage, priority, assigned_to, notes, created_by)
VALUES
(1, 1, NULL, 'BlueWater Offshore Automation', 'Full automation suite for 3 offshore platforms', 240000.00, 35, '2026-06-30', 'proposal',     'high',   4, 'Competing with Siemens for this deal.', 4),
(1, 2, NULL, 'DataForge Lab Integration',     'Sensor network and data integration for biolab',  95000.00, 60, '2026-04-15', 'negotiation', 'high',   4, 'Technical demo completed successfully.', 4),
(1, 3, NULL, 'NexusPharma Equipment Order',   'Lab equipment and automation systems',            85000.00, 75, '2026-03-30', 'negotiation', 'high',   4, 'Budget approved, negotiating payment terms.', 4),
(1, 5, 11,   'EdgeStream IoT Platform',        'IoT monitoring platform and sensor deployment',   55000.00, 100,'2026-02-15', 'closed_won',  'high',   4, 'Contract signed - installation scheduled March.', 4);

-- Interactions
INSERT INTO interactions (company_id, lead_id, customer_id, type, subject, notes, outcome, performed_by)
VALUES
(1, 1, NULL, 'call', 'Initial discovery call',        'Discussed automation needs for Gulf platforms.', 'Interested - scheduling technical review.', 4),
(1, 2, NULL, 'email', 'Sent proposal package',         'Emailed detailed quote and solution architecture.', 'Awaiting feedback from stakeholders.', 4),
(1, 3, NULL, 'meeting', 'On-site demo at NexusPharma', 'Demonstrated sensor arrays and control software.', 'Very positive - want to proceed to negotiation.', 4),
(1, NULL, 11, 'email', 'Welcome email - EdgeStream',   'Sent welcome packet and implementation timeline.', 'Client confirmed readiness.', 4),
(1, 4, NULL, 'call', 'Initial contact',               'Spoke with Derek about fleet tracking solutions.', 'Sent brochure - follow up next week.', 4);

-- Follow-ups
INSERT INTO follow_ups (company_id, lead_id, opportunity_id, title, description, due_date, status, priority, assigned_to, created_by)
VALUES
(1, 1, 1, 'Schedule technical review with BlueWater',  'Coordinate with engineering team for platform visit.',  '2026-03-20', 'pending', 'high',   4, 4),
(1, 2, 2, 'Follow up on DataForge proposal',            'Send contract and payment terms.',                      '2026-03-15', 'pending', 'medium', 4, 4),
(1, 3, 3, 'Prepare final quote for NexusPharma',        'Include 10% volume discount per VP request.',           '2026-03-10', 'completed', 'high', 4, 4),
(1, NULL, 4, 'EdgeStream installation scheduling',       'Confirm dates for on-site installation crew.',           '2026-03-05', 'pending', 'high',   5, 4);

-- ---------------------------------------------------------------------------
-- 3p. BUDGET (FY 2026)
-- ---------------------------------------------------------------------------
INSERT INTO budgets (company_id, fiscal_year, name, status, notes, created_by)
VALUES (1, 2026, 'NovaTech Industries FY2026 Operating Budget', 'approved', 'Approved by board on Dec 15, 2025.', 1);

INSERT INTO budget_items (budget_id, account_id, cost_center_id, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec)
VALUES
(1, (SELECT id FROM chart_of_accounts WHERE account_code='5201'), NULL,
 165000, 165000, 165000, 175000, 175000, 175000, 175000, 175000, 180000, 180000, 180000, 180000),
(1, (SELECT id FROM chart_of_accounts WHERE account_code='5202'), NULL,
 31000, 31000, 31000, 31000, 31000, 31000, 31000, 31000, 31000, 31000, 31000, 31000),
(1, (SELECT id FROM chart_of_accounts WHERE account_code='5206'), (SELECT id FROM cost_centers WHERE code='CC-SALES'),
 12000, 15000, 10000, 8000, 12000, 25000, 8000, 8000, 15000, 12000, 10000, 12000),
(1, (SELECT id FROM chart_of_accounts WHERE account_code='5208'), (SELECT id FROM cost_centers WHERE code='CC-IT'),
 8000, 8000, 8500, 8500, 8500, 9000, 9000, 9000, 9500, 9500, 9500, 10000),
(1, (SELECT id FROM chart_of_accounts WHERE account_code='5209'), NULL,
 5000, 7500, 5000, 5000, 5000, 5000, 5000, 5000, 7500, 5000, 5000, 5000);

-- ---------------------------------------------------------------------------
-- 3q. RECURRING JOURNAL ENTRIES
-- ---------------------------------------------------------------------------
INSERT INTO recurring_entries (company_id, name, description, voucher_type, frequency, interval_value, start_date, end_date, next_date, day_of_month, status, created_by)
VALUES
(1, 'Monthly Rent - NYC HQ',      'Monthly office rent payment',          'Expense', 'monthly', 1, '2026-01-01', '2026-12-31', '2026-04-01', 1,  'active', 8),
(1, 'Monthly Depreciation',       'Monthly asset depreciation entry',     'Journal', 'monthly', 1, '2026-01-01', '2026-12-31', '2026-04-30', 31, 'active', 8);

INSERT INTO recurring_entry_lines (recurring_entry_id, account_id, debit, credit, narration)
VALUES
(1, (SELECT id FROM chart_of_accounts WHERE account_code='5202'), 22500.00, 0,        'Rent Expense - NYC HQ'),
(1, (SELECT id FROM chart_of_accounts WHERE account_code='1101'), 0,        22500.00, 'Operating Account'),
(2, (SELECT id FROM chart_of_accounts WHERE account_code='5207'), 42000.00, 0,        'Depreciation Expense'),
(2, (SELECT id FROM chart_of_accounts WHERE account_code='1600'), 0,        42000.00, 'Accumulated Depreciation');

-- ---------------------------------------------------------------------------
-- 3r. PROJECTS
-- ---------------------------------------------------------------------------
INSERT INTO projects (company_id, project_code, name, description, customer_id, start_date, end_date, budget_amount, status, priority, project_manager, notes, created_by)
VALUES
(1, 'PRJ-2026-001', 'TechSphere Automation Deployment',   'Install and configure automation system at TechSphere SF facility',    1,  '2026-01-20', '2026-03-15', 18000.00, 'in_progress', 'high',   2, 'On track for March completion.', 1),
(1, 'PRJ-2026-002', 'GreenLeaf Solar Farm Integration',   'Full SCADA integration for solar farm monitoring',                     4,  '2026-02-10', '2026-04-30', 35000.00, 'in_progress', 'high',   2, 'Site survey completed.', 1),
(1, 'PRJ-2026-003', 'Vanguard Defense - Secure Telemetry', 'Development of encrypted telemetry modules for defense contract',     9,  '2026-03-01', '2026-08-31', 95000.00, 'planning',    'critical', 2, 'Security clearance required for team.', 1);

-- Project tasks
INSERT INTO project_tasks (company_id, project_id, name, description, assigned_to, start_date, due_date, estimated_hours, actual_hours, priority, status, created_by)
VALUES
(1, 1, 'Site survey & requirements gathering', 'Visit TechSphere facility, measure and document requirements.', 5, '2026-01-22', '2026-01-26', 24, 22, 'high', 'done', 1),
(1, 1, 'Controller programming & testing',     'Program LogicMaster controllers per spec.',                      5, '2026-01-29', '2026-02-12', 60, 55, 'high', 'done', 1),
(1, 1, 'On-site installation',                 'Install controllers, VFDs, and sensor arrays.',                  11,'2026-02-17', '2026-02-28', 80, 0,  'high', 'in_progress', 1),
(1, 1, 'System commissioning & handover',      'Final testing, training, and documentation.',                    5, '2026-03-02', '2026-03-14', 40, 0,  'medium', 'todo', 1),
(1, 2, 'SCADA system design',                  'Architect SCADA integration for GreenLeaf solar farm.',          5, '2026-02-12', '2026-02-26', 40, 38, 'high', 'done', 1),
(1, 2, 'Equipment procurement',                'Order sensors, controllers, and networking gear.',               7, '2026-02-26', '2026-03-05', 16, 0,  'medium', 'in_progress', 1),
(1, 2, 'Field installation - Phase 1',         'Install monitoring equipment on solar arrays.',                   6, '2026-03-10', '2026-04-10', 160, 0, 'high', 'todo', 1),
(1, 3, 'Requirements analysis & security review','Define encryption requirements with Vanguard team.',              5, '2026-03-01', '2026-03-15', 40, 0,  'critical', 'in_progress', 1),
(1, 3, 'Firmware development - encrypted module','Develop secure telemetry firmware.',                              5, '2026-03-16', '2026-05-30', 320, 0, 'critical', 'todo', 1);

-- Project members
INSERT INTO project_members (company_id, project_id, user_id, role, hourly_rate)
VALUES
(1, 1, 2, 'project_manager',  85.00),
(1, 1, 5, 'engineer',        75.00),
(1, 1, 11, 'engineer',       70.00),
(1, 2, 2, 'project_manager',  85.00),
(1, 2, 5, 'engineer',        75.00),
(1, 2, 7, 'logistics',       65.00),
(1, 2, 3, 'consultant',      90.00),
(1, 3, 2, 'project_manager',  85.00),
(1, 3, 5, 'lead_engineer',   85.00);

-- Time entries
INSERT INTO time_entries (company_id, project_id, task_id, user_id, entry_date, hours, description, billable)
VALUES
(1, 1, 1, 5, '2026-01-22', 8.0, 'Site survey - initial walkthrough',                      true),
(1, 1, 1, 5, '2026-01-23', 8.0, 'Requirements gathering with TechSphere team',            true),
(1, 1, 1, 5, '2026-01-24', 6.0, 'Documentation of specifications',                         true),
(1, 1, 2, 5, '2026-01-29', 8.0, 'Started LogicMaster programming',                        true),
(1, 1, 2, 5, '2026-01-30', 8.0, 'I/O mapping and configuration',                          true),
(1, 1, 2, 5, '2026-02-03', 8.0, 'HMI programming',                                       true),
(1, 1, 2, 5, '2026-02-04', 8.0, 'Testing control logic',                                 true),
(1, 1, 2, 5, '2026-02-05', 7.0, 'Debugging communication protocols',                      true),
(1, 1, 2, 5, '2026-02-10', 8.0, 'Final testing in lab environment',                       true),
(1, 2, 5, 5, '2026-02-12', 8.0, 'SCADA architecture design',                              true),
(1, 2, 5, 5, '2026-02-13', 8.0, 'Network topology planning',                              true),
(1, 2, 5, 5, '2026-02-17', 8.0, 'Protocol selection and interface design',                true),
(1, 2, 5, 5, '2026-02-18', 8.0, 'Security review of SCADA design',                        true),
(1, 1, 3, 11,'2026-02-19', 8.0, 'Installation prep - organizing equipment',               true),
(1, 1, 3, 11,'2026-02-20', 8.0, 'Mounting control panels at TechSphere facility',         true);

-- ---------------------------------------------------------------------------
-- 3s. APPROVAL WORKFLOWS
-- ---------------------------------------------------------------------------
INSERT INTO approval_workflows (company_id, name, description, target_entity, is_active, created_by)
VALUES
(1, 'Purchase Order Approval', 'Standard PO approval workflow', 'purchase_order', true, 1),
(1, 'Leave Request Approval',  'Employee leave request approval', 'leave_request', true, 1);

INSERT INTO approval_steps (workflow_id, step_order, approver_id, min_amount, max_amount)
VALUES
(1, 1, (SELECT id FROM users WHERE email='admin@erp.com' AND company_id=1), 0,     5000.00),
(1, 2, (SELECT id FROM users WHERE email='john@erp.com' AND company_id=1),   5000.01, 25000.00),
(1, 3, (SELECT id FROM users WHERE email='admin@erp.com' AND company_id=1),  25000.01, NULL),
(2, 1, (SELECT id FROM users WHERE email='jane@erp.com' AND company_id=1),   0,      NULL);

-- ---------------------------------------------------------------------------
-- 3t. STOCK TRANSFERS
-- ---------------------------------------------------------------------------
INSERT INTO stock_transfers (company_id, transfer_number, from_warehouse_id, to_warehouse_id, transfer_date, status, notes, created_by, approved_by, approved_at, received_by, received_at)
VALUES
(1, 'ST-2026-0001', 1, 2, '2026-01-28', 'completed', 'Transfer 50 units of bearings to Chicago for upcoming order.', 7, 3, '2026-01-28 10:00:00', 6, '2026-01-29 14:00:00'),
(1, 'ST-2026-0002', 1, 3, '2026-02-08', 'completed', 'Transfer 8 workstations to LA for GreenLeaf project.', 7, 3, '2026-02-08 09:30:00', 7, '2026-02-10 11:00:00'),
(1, 'ST-2026-0003', 1, 4, '2026-02-20', 'draft',     'Transfer 60 controllers to DFW for Vanguard project prep.', 7, NULL, NULL, NULL, NULL);

INSERT INTO stock_transfer_items (stock_transfer_id, product_id, quantity, unit_cost)
VALUES
(1, 7, 50, 42.00),
(2, 14, 8, 1350.00),
(3, 1, 60, 98.00);

-- ---------------------------------------------------------------------------
-- 3u. POS TRANSACTIONS (retail counter sales)
-- ---------------------------------------------------------------------------
INSERT INTO pos_sessions (company_id, user_id, session_number, opening_time, opening_balance, status)
VALUES
(1, '2', 'POS-SES-2026-0001', '2026-02-15 08:00:00', 500.00, 'closed'),
(1, '2', 'POS-SES-2026-0002', '2026-03-01 08:00:00', 500.00, 'open');

INSERT INTO pos_transactions (company_id, session_id, customer_id, order_number, order_date, subtotal, tax_amount, discount_amount, total_amount, payment_method, amount_paid, change_amount, status, created_by)
VALUES
(1, 1, NULL, 'POS-2026-0001', '2026-02-15 10:30:00', 1162.00, 232.40, 0.00, 1394.40, 'Credit Card', 1394.40, 0.00, 'completed', '2'),
(1, 1, NULL, 'POS-2026-0002', '2026-02-15 14:15:00',  490.50,  98.10, 0.00,  588.60,  'Cash',        600.00,  11.40, 'completed', '2'),
(1, 1, NULL, 'POS-2026-0003', '2026-02-16 09:45:00',  780.00, 156.00, 0.00,  936.00,  'Credit Card', 936.00,  0.00,  'completed', '2');

INSERT INTO pos_transaction_items (pos_transaction_id, product_id, product_name, sku, quantity, unit_price, total)
VALUES
(1, 10, 'Safety Goggle Pro Series', 'CN-3002', 10, 78.00, 780.00),
(1, 11, 'Welding Electrode Pack',   'CN-3003',  5, 52.00, 260.00),
(1, 9,  'Industrial Lubricant 5Gal','CN-3001',  1, 145.00, 145.00),
(2, 10, 'Safety Goggle Pro Series', 'CN-3002',  4, 78.00, 312.00),
(2, 11, 'Welding Electrode Pack',   'CN-3003',  2, 52.00, 104.00),
(2, 18, 'Anti-Static Bubble Wrap',  'PK-5002',  1, 42.00, 42.00),
(3, 7,  'Precision Ball Bearing Set','CP-2003',  6, 89.50, 537.00),
(3, 18, 'Anti-Static Bubble Wrap',  'PK-5002',  4, 42.00, 168.00);

-- =============================================================================
-- PHASE 4: ROW COUNTS PER TABLE
-- =============================================================================

SELECT 'companies' AS table_name, COUNT(*) AS row_count FROM companies
UNION ALL SELECT 'warehouses', COUNT(*) FROM warehouses
UNION ALL SELECT 'warehouse_bins', COUNT(*) FROM warehouse_bins
UNION ALL SELECT 'product_warehouse_stock', COUNT(*) FROM product_warehouse_stock
UNION ALL SELECT 'cost_centers', COUNT(*) FROM cost_centers
UNION ALL SELECT 'expense_categories', COUNT(*) FROM expense_categories
UNION ALL SELECT 'chart_of_accounts', COUNT(*) FROM chart_of_accounts
UNION ALL SELECT 'bank_accounts', COUNT(*) FROM bank_accounts
UNION ALL SELECT 'customers', COUNT(*) FROM customers
UNION ALL SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'services', COUNT(*) FROM services
UNION ALL SELECT 'employees', COUNT(*) FROM employees
UNION ALL SELECT 'sales_orders', COUNT(*) FROM sales_orders
UNION ALL SELECT 'sales_order_items', COUNT(*) FROM sales_order_items
UNION ALL SELECT 'purchase_orders', COUNT(*) FROM purchase_orders
UNION ALL SELECT 'purchase_order_items', COUNT(*) FROM purchase_order_items
UNION ALL SELECT 'inventory_transactions', COUNT(*) FROM inventory_transactions
UNION ALL SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL SELECT 'invoice_items', COUNT(*) FROM invoice_items
UNION ALL SELECT 'payments', COUNT(*) FROM payments
UNION ALL SELECT 'quotations', COUNT(*) FROM quotations
UNION ALL SELECT 'quotation_items', COUNT(*) FROM quotation_items
UNION ALL SELECT 'service_invoices', COUNT(*) FROM service_invoices
UNION ALL SELECT 'service_invoice_items', COUNT(*) FROM service_invoice_items
UNION ALL SELECT 'credit_notes', COUNT(*) FROM credit_notes
UNION ALL SELECT 'expenses', COUNT(*) FROM expenses
UNION ALL SELECT 'journal_entries', COUNT(*) FROM journal_entries
UNION ALL SELECT 'journal_entry_lines', COUNT(*) FROM journal_entry_lines
UNION ALL SELECT 'bank_transactions', COUNT(*) FROM bank_transactions
UNION ALL SELECT 'budgets', COUNT(*) FROM budgets
UNION ALL SELECT 'budget_items', COUNT(*) FROM budget_items
UNION ALL SELECT 'recurring_entries', COUNT(*) FROM recurring_entries
UNION ALL SELECT 'recurring_entry_lines', COUNT(*) FROM recurring_entry_lines
UNION ALL SELECT 'fixed_assets', COUNT(*) FROM fixed_assets
UNION ALL SELECT 'asset_depreciation', COUNT(*) FROM asset_depreciation
UNION ALL SELECT 'leads', COUNT(*) FROM leads
UNION ALL SELECT 'opportunities', COUNT(*) FROM opportunities
UNION ALL SELECT 'interactions', COUNT(*) FROM interactions
UNION ALL SELECT 'follow_ups', COUNT(*) FROM follow_ups
UNION ALL SELECT 'projects', COUNT(*) FROM projects
UNION ALL SELECT 'project_tasks', COUNT(*) FROM project_tasks
UNION ALL SELECT 'project_members', COUNT(*) FROM project_members
UNION ALL SELECT 'time_entries', COUNT(*) FROM time_entries
UNION ALL SELECT 'stock_transfers', COUNT(*) FROM stock_transfers
UNION ALL SELECT 'stock_transfer_items', COUNT(*) FROM stock_transfer_items
UNION ALL SELECT 'pos_sessions', COUNT(*) FROM pos_sessions
UNION ALL SELECT 'pos_transactions', COUNT(*) FROM pos_transactions
UNION ALL SELECT 'pos_transaction_items', COUNT(*) FROM pos_transaction_items
UNION ALL SELECT 'approval_workflows', COUNT(*) FROM approval_workflows
UNION ALL SELECT 'approval_steps', COUNT(*) FROM approval_steps
UNION ALL SELECT 'asset_categories', COUNT(*) FROM asset_categories
UNION ALL SELECT 'sales_returns', COUNT(*) FROM sales_returns
UNION ALL SELECT 'sales_return_items', COUNT(*) FROM sales_return_items
UNION ALL SELECT 'asset_maintenance', COUNT(*) FROM asset_maintenance
ORDER BY table_name;

COMMIT;
