-- ====================================================================
-- ERP Demo Data Reset & Seed Script
-- ====================================================================
-- This script DELETES ALL EXISTING DATA from non-authentication tables
-- and repopulates them with realistic demo data.
--
-- Protected tables (data NOT touched):
--   users, roles, system_settings, email_templates, audit_logs,
--   password_resets, sessions, user_roles
-- ====================================================================

BEGIN;

-- ====================================================================
-- STEP 1: Disable FK triggers for clean deletion
-- ====================================================================
SET session_replication_role = 'replica';

-- ====================================================================
-- STEP 2: Delete all existing data (auth-protected tables excluded)
-- ====================================================================

-- Returns / Credit Notes
DELETE FROM purchase_return_items;
DELETE FROM purchase_returns;
DELETE FROM sales_return_items;
DELETE FROM sales_returns;
DELETE FROM return_reasons;
DELETE FROM credit_notes;

-- Fixed Assets
DELETE FROM asset_depreciation;
DELETE FROM asset_maintenance;
DELETE FROM fixed_assets;
DELETE FROM asset_categories;

-- Projects & Time
DELETE FROM time_entries;
DELETE FROM project_members;
DELETE FROM project_tasks;
DELETE FROM projects;

-- Approval Workflows
DELETE FROM approval_logs;
DELETE FROM approval_steps;
DELETE FROM approval_requests;
DELETE FROM approval_workflows;

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
DELETE FROM lead_statuses;
DELETE FROM lead_sources;
DELETE FROM crm_email_templates;

-- Stock Transfers
DELETE FROM stock_transfer_items;
DELETE FROM stock_transfers;

-- Warehouse
DELETE FROM product_warehouse_stock;
DELETE FROM warehouse_bins;
DELETE FROM warehouses;

-- HR / Employees
DELETE FROM employee_documents;
DELETE FROM leave_requests;
DELETE FROM attendance;
DELETE FROM employees;
DELETE FROM leave_types;

-- Invoicing & Payments
DELETE FROM payments;
DELETE FROM invoice_items;
DELETE FROM invoices;

-- Services
DELETE FROM service_invoice_items;
DELETE FROM service_invoices;
DELETE FROM services;

-- Quotations
DELETE FROM quotation_items;
DELETE FROM quotations;

-- Expenses
DELETE FROM expenses;
DELETE FROM expense_categories;

-- Accounting (enhanced)
DELETE FROM recurring_entry_lines;
DELETE FROM recurring_entries;
DELETE FROM reconciliation_reports;
DELETE FROM bank_transactions;
DELETE FROM bank_accounts;
DELETE FROM budget_items;
DELETE FROM budgets;
DELETE FROM cost_centers;

-- Accounting (core)
DELETE FROM journal_entry_lines;
DELETE FROM journal_entries;
DELETE FROM chart_of_accounts;

-- Purchasing
DELETE FROM purchase_order_items;
DELETE FROM purchase_orders;
DELETE FROM suppliers;

-- Sales
DELETE FROM sales_order_items;
DELETE FROM sales_orders;
DELETE FROM customers;

-- Inventory
DELETE FROM inventory_transactions;
DELETE FROM products;

-- Tax
DELETE FROM tax_rates;

-- Companies (must be last)
DELETE FROM companies;

-- ====================================================================
-- STEP 3: Reset all sequences to start fresh
-- ====================================================================
ALTER SEQUENCE IF EXISTS companies_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS customers_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS products_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS suppliers_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS sales_orders_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS sales_order_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS inventory_transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS purchase_orders_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS purchase_order_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS chart_of_accounts_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS journal_entries_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS journal_entry_lines_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS invoices_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS invoice_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS payments_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS asset_categories_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS fixed_assets_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS asset_depreciation_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS asset_maintenance_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS projects_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS project_tasks_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS project_members_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS time_entries_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS approval_workflows_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS approval_steps_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS approval_requests_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS approval_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS warehouses_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS warehouse_bins_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS product_warehouse_stock_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS stock_transfers_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS stock_transfer_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS employees_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS attendance_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS leave_types_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS leave_requests_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS employee_documents_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS return_reasons_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS sales_returns_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS sales_return_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS purchase_returns_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS purchase_return_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS credit_notes_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS lead_sources_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS lead_statuses_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS leads_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS opportunities_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS follow_ups_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS interactions_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS crm_email_templates_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS pos_sessions_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS pos_cart_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS pos_transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS pos_transaction_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS tax_rates_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS services_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS service_invoices_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS service_invoice_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS quotations_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS quotation_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS expense_categories_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS expenses_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS cost_centers_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS budgets_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS budget_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS bank_accounts_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS bank_transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS reconciliation_reports_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS recurring_entries_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS recurring_entry_lines_id_seq RESTART WITH 1;

-- ====================================================================
-- STEP 4: Re-enable FK triggers
-- ====================================================================
SET session_replication_role = 'origin';

-- ====================================================================
-- STEP 5: INSERT DEMO DATA
-- ====================================================================

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5a. COMPANIES
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO companies (name, tax_id, email, phone, address, currency)
VALUES
    ('Acme Corporation',     'US-45-6789123',    'info@acmecorp.com',     '+1-212-555-0140', '350 Fifth Avenue, New York, NY 10118, United States',  'USD'),
    ('GlobalTech Industries', 'US-87-6543210',    'contact@globaltech.io', '+1-408-555-0290', '1 Infinite Loop, Cupertino, CA 95014, United States',   'USD'),
    ('EuroChem GmbH',         'DE-123-456-789',   'info@eurochem.de',      '+49-30-5550-120', 'Friedrichstraße 100, 10117 Berlin, Germany',             'EUR');

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5b. CUSTOMERS (3 per company)
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO customers (company_id, name, email, phone, billing_address, shipping_address)
VALUES
    -- Acme customers
    (1, 'Sarah Mitchell',      'sarah.mitchell@email.com',  '+1-212-555-1001', '100 Broadway, New York, NY 10006', '100 Broadway, New York, NY 10006'),
    (1, 'David Chen',          'dchen@partnerfirm.com',     '+1-646-555-2100', '200 Park Avenue, New York, NY 10166', '200 Park Avenue, New York, NY 10166'),
    (1, 'Pristine Hotels LLC', 'accounts@pristinehotels.com', '+1-305-555-3300', '1200 Ocean Drive, Miami, FL 33139', '1200 Ocean Drive, Miami, FL 33139'),
    -- GlobalTech customers
    (2, 'NovaStar Systems',    'procurement@novastar.com', '+1-415-555-4400', '300 Mission Street, San Francisco, CA 94105', '300 Mission Street, San Francisco, CA 94105'),
    (2, 'Robert Okafor',       'robert.okafor@webmail.com','+1-510-555-5500', '4500 Shellmound Ave, Emeryville, CA 94608', '4500 Shellmound Ave, Emeryville, CA 94608'),
    (2, 'Pacific Data Corp',   'orders@pacificdata.com',   '+1-213-555-6600', '601 Wilshire Blvd, Los Angeles, CA 90036', '601 Wilshire Blvd, Los Angeles, CA 90036'),
    -- EuroChem customers
    (3, 'Berlin Pharm AG',     'lager@berlinpharma.de',     '+49-30-555-7700','Unter den Linden 50, 10117 Berlin, Germany',  'Unter den Linden 50, 10117 Berlin, Germany'),
    (3, 'Klaus Weber',         'klaus.weber@t-online.de',   '+49-30-555-8800','Karl-Marx-Allee 80, 10243 Berlin, Germany',  'Karl-Marx-Allee 80, 10243 Berlin, Germany'),
    (3, 'Sächsische Labor GmbH','info@saechsischelab.de',   '+49-341-555-9900','Augustusplatz 12, 04109 Leipzig, Germany',   'Augustusplatz 12, 04109 Leipzig, Germany');

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5c. PRODUCTS (5 per company)
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO products (company_id, sku, name, description, unit_price, cost_price, current_stock, reorder_level)
VALUES
    -- Acme products
    (1, 'ACM-WDG-001', 'Aluminum Widget Pro',      'High-grade 6061 aluminum widget, anodized finish, 4 x 2 inches',          18.50,  9.25,  250, 40),
    (1, 'ACM-GDT-002', 'Digital Multimeter 5000',  'True-RMS auto-ranging multimeter with temperature probe and backlight',   89.00,  52.00,  75,  15),
    (1, 'ACM-BOL-003', 'Grade-8 Steel Bolt Set',   'M12 x 1.75 hex bolts, zinc-plated, box of 100',                         34.75,  18.50,  500, 80),
    (1, 'ACM-PCB-004', 'Control Board v3.2',       'Custom PCB assembly with ATmega328P, 6-layer design',                    245.00, 132.00,  40,  10),
    (1, 'ACM-PKG-005', 'Deluxe Packaging Bundle',  'Corrugated box, foam insert, and poly bag – 50-pack',                    22.00,  11.80,  180, 30),
    -- GlobalTech products
    (2, 'GTX-SRV-006', 'CloudRack 42U Server Rack','42U 19-inch server cabinet with cooling fans and cable management',      1890.00, 980.00,  12,   3),
    (2, 'GTX-FIB-007', 'Fiber Optic Patch 10m',    'LC-LC duplex OM4 multimode fiber patch cable, 10 meters',                 18.90,   8.45,  800, 100),
    (2, 'GTX-SEN-008', 'TempSense PT100 Probe',    'PT100 RTD temperature sensor, -50 to 250 C, 4-wire',                    42.50,  24.00,  320, 50),
    (2, 'GTX-DRO-009', 'AutoPick R2 Robot',        'Autonomous inventory retrieval robot with LIDAR navigation',             14500.00, 8200.00, 3,   1),
    (2, 'GTX-SCN-010', 'ScanMaster 8500',          'Industrial 2D barcode scanner, IP65 rated, USB-C',                       395.00, 210.00,  45,  10),
    -- EuroChem products
    (3, 'ECH-NAC-011', 'Sodium Chloride 99.9%',    'High-purity NaCl, analytical grade, 1 kg bottle',                         32.00,  17.50,  400, 60),
    (3, 'ECH-LAB-012', 'Borosilicate Beaker Set',  'Set of 6 graduated beakers: 50, 100, 250, 500, 1000, 2000 ml',            68.00,  38.00,  120, 20),
    (3, 'ECH-FIL-013', 'Industrial Water Filter',  'Activated carbon block filter, 10-micron, 20-inch',                       15.80,   7.90,  600, 100),
    (3, 'ECH-VAL-014', 'Pressure Relief Valve 2"', 'Bronze pressure relief valve, 150 PSI, 2-inch NPT',                       89.50,  48.00,  85,  15),
    (3, 'ECH-TNK-015', 'Poly Tank Liner Kit',      'HDPE liner for 5000L storage tank, includes seals and clamps',             420.00, 230.00,  20,   5);

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5d. TAX RATES (for all companies)
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO tax_rates (company_id, name, rate, type, is_default, is_active, description)
VALUES
    (1, 'Sales Tax NY',       8.875,  'VAT',  true,  true, 'New York State & City combined sales tax'),
    (1, 'Sales Tax CA',       7.250,  'VAT',  false, true, 'California state sales tax'),
    (2, 'Sales Tax CA',       7.250,  'VAT',  true,  true, 'California state sales tax'),
    (2, 'Sales Tax TX',       6.250,  'VAT',  false, true, 'Texas state sales tax'),
    (3, 'German VAT 19%',    19.000, 'VAT',  true,  true, 'German standard VAT (Mehrwertsteuer)'),
    (3, 'German VAT 7%',      7.000,  'VAT',  false, true, 'German reduced VAT for food & books');

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5e. SUPPLIERS (2 per company)
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO suppliers (company_id, name, email, phone, address)
VALUES
    (1, 'Raw Materials Inc.',       'sales@rawmaterials.com',     '+1-973-555-1110', '50 Industrial Blvd, Newark, NJ 07105, United States'),
    (1, 'Precision Components LLC', 'orders@precisioncomp.com',   '+1-860-555-2220', '200 Tech Park Drive, Hartford, CT 06103, United States'),
    (2, 'ChipSource International', 'info@chipsource.com',        '+1-512-555-3330', '8900 Semiconductor Dr, Austin, TX 78701, United States'),
    (2, 'LogiNext Distribution',    'sales@loginext.net',         '+1-312-555-4440', '1500 Logistics Way, Chicago, IL 60607, United States'),
    (3, 'ChemSupply Europe BV',     'orders@chemsupply.eu',       '+31-20-555-5550', 'Strawinskylaan 400, 1077 XX Amsterdam, Netherlands'),
    (3, 'Laboratory Equipment GmbH','info@labequipment.de',       '+49-89-555-6660', 'Bahnhofstraße 28, 80337 München, Germany');

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5f. SALES ORDERS & ITEMS (2 per company, various statuses)
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO sales_orders (company_id, customer_id, order_number, order_date, status, subtotal, tax_total, grand_total, notes)
VALUES
    (1, 1, 'SO-2026-0001', '2026-01-15', 'shipped',   2868.75, 254.70, 3123.45, 'Standard delivery, net 30 terms'),
    (1, 3, 'SO-2026-0002', '2026-02-28', 'confirmed', 5500.00, 488.13, 5988.13, 'Bulk order for Miami property refurbishment'),
    (2, 4, 'SO-2026-0003', '2026-01-20', 'invoiced',  2385.00, 172.91, 2557.91, 'Server rack and accessories for data center expansion'),
    (2, 6, 'SO-2026-0004', '2026-03-05', 'draft',     8100.00, 587.25, 8687.25, 'Pending credit check approval'),
    (3, 7, 'SO-2026-0005', '2026-02-10', 'confirmed', 4200.00, 798.00, 4998.00, 'Bulk chemical order for Q1 production'),
    (3, 9, 'SO-2026-0006', '2026-03-18', 'cancelled', 1530.00, 290.70, 1820.70, 'Cancelled per customer request – stock returned');

INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total)
VALUES
    -- SO-0001: Sarah Mitchell ordered from Acme
    (1,  1,  25, 18.50,  0.00, 462.50),
    (1,  3,  50, 34.75,  5.00, 1650.63),
    (1,  4,   2, 245.00, 0.00, 490.00),
    (1,  5,  12, 22.00,  0.00, 264.00),
    -- SO-0002: Pristine Hotels ordered from Acme
    (2,  2,  30, 89.00, 10.00, 2403.00),
    (2,  5, 100, 22.00,  5.00, 2090.00),
    (2,  1,  60, 18.50,  0.00, 1110.00),
    -- SO-0003: NovaStar from GlobalTech
    (3,  6,   1, 1890.00, 0.00, 1890.00),
    (3,  7,  10, 18.90,  0.00, 189.00),
    (3,  10,  1, 395.00,  0.00, 395.00),
    -- SO-0004: Pacific Data Corp from GlobalTech (draft)
    (4,  8,  40, 42.50,  0.00, 1700.00),
    (4,  9,   1, 14500.00, 0.00, 14500.00),
    -- SO-0005: Berlin Pharm from EuroChem
    (5,  11, 80, 32.00,  0.00, 2560.00),
    (5,  13, 60, 15.80,  0.00, 948.00),
    (5,  14,  6, 89.50,  0.00, 537.00),
    -- SO-0006: Sächsische Labor from EuroChem (cancelled)
    (6,  12, 15, 68.00,  0.00, 1020.00),
    (6,  13, 20, 15.80,  0.00, 316.00),
    (6,  11,  5, 32.00,  0.00, 160.00);

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5g. PURCHASE ORDERS & ITEMS (2 per company)
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO purchase_orders (company_id, supplier_id, po_number, order_date, status, subtotal, tax_total, grand_total, notes, expected_delivery_date)
VALUES
    (1, 1, 'PO-2026-0001', '2026-01-05',  'received', 7150.00, 634.56, 7784.56, 'Raw material replenishment for Q1 production',  '2026-01-20'),
    (1, 2, 'PO-2026-0002', '2026-02-20',  'sent',     4520.00, 401.15, 4921.15, 'Custom PCB order for new product line',         '2026-03-15'),
    (2, 3, 'PO-2026-0003', '2026-01-12',  'received', 22200.00, 1609.50, 23809.50, 'Bulk semiconductor order for Q1',               '2026-02-10'),
    (2, 4, 'PO-2026-0004', '2026-03-01',  'sent',     8400.00, 609.00, 9009.00,   'Logistics supplies and packaging materials',    '2026-03-28'),
    (3, 5, 'PO-2026-0005', '2026-02-05',  'received', 10500.00, 1995.00, 12495.00, 'Bulk chemical raw materials',                    '2026-02-28'),
    (3, 6, 'PO-2026-0006', '2026-03-10',  'draft',    3400.00, 646.00, 4046.00,   'Lab equipment upgrade pending budget approval', NULL);

INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity)
VALUES
    -- PO-0001: Raw Materials -> Acme
    (1, 1, 500, 9.25,  4625.00,  500),
    (1, 3, 100, 18.50, 1850.00,  100),
    (1, 5,  60, 11.80, 708.00,    60),
    -- PO-0002: Precision Components -> Acme
    (2, 4,  30, 132.00, 3960.00,   0),
    (2, 2,  10, 52.00,  520.00,    0),
    -- PO-0003: ChipSource -> GlobalTech
    (3, 6,   8, 980.00, 7840.00,   8),
    (3, 7, 500, 8.45,  4225.00,  500),
    (3, 10, 20, 210.00, 4200.00,  20),
    -- PO-0004: LogiNext -> GlobalTech
    (4, 7, 300, 8.45,  2535.00,   0),
    (4, 5, 100, 11.80, 1180.00,   0),
    -- PO-0005: ChemSupply -> EuroChem
    (5, 11, 200, 17.50, 3500.00, 200),
    (5, 13, 500, 7.90,  3950.00, 500),
    (5, 14,  50, 48.00, 2400.00,  50),
    -- PO-0006: LabEquipment -> EuroChem (draft, not yet received)
    (6, 12,  50, 38.00, 1900.00,   0),
    (6, 15,   5, 230.00, 1150.00,  0);

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5h. INVENTORY TRANSACTIONS (linked to orders above)
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO inventory_transactions (product_id, type, quantity, reference_type, reference_id)
VALUES
    -- Stock in from purchase orders
    (1,  'in',  500, 'purchase_order', 1),
    (3,  'in',  100, 'purchase_order', 1),
    (5,  'in',   60, 'purchase_order', 1),
    (6,  'in',    8, 'purchase_order', 3),
    (7,  'in',  500, 'purchase_order', 3),
    (10, 'in',   20, 'purchase_order', 3),
    (11, 'in',  200, 'purchase_order', 5),
    (13, 'in',  500, 'purchase_order', 5),
    (14, 'in',   50, 'purchase_order', 5),
    -- Stock out from sales orders
    (1,  'out',  25, 'sales_order', 1),
    (3,  'out',  50, 'sales_order', 1),
    (4,  'out',   2, 'sales_order', 1),
    (5,  'out',  12, 'sales_order', 1),
    (2,  'out',  30, 'sales_order', 2),
    (5,  'out', 100, 'sales_order', 2),
    (1,  'out',  60, 'sales_order', 2),
    (6,  'out',   1, 'sales_order', 3),
    (7,  'out',  10, 'sales_order', 3),
    (10, 'out',   1, 'sales_order', 3),
    (11, 'out',  80, 'sales_order', 5),
    (13, 'out',  60, 'sales_order', 5),
    (14, 'out',   6, 'sales_order', 5),
    -- Stock adjustments
    (1,  'adjustment', -2,  'adjustment', NULL),
    (7,  'adjustment', -5,  'adjustment', NULL),
    (13, 'adjustment', -10, 'adjustment', NULL);

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5i. CHART OF ACCOUNTS (standard simplified COA per company)
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO chart_of_accounts (company_id, account_code, account_name, account_type, is_active)
VALUES
    -- Assets
    (1, '1000', 'Cash & Cash Equivalents',          'asset',    true),
    (1, '1100', 'Accounts Receivable',              'asset',    true),
    (1, '1200', 'Inventory',                        'asset',    true),
    (1, '1300', 'Prepaid Expenses',                 'asset',    true),
    (1, '1400', 'Fixed Assets (Net)',               'asset',    true),
    -- Liabilities
    (1, '2000', 'Accounts Payable',                 'liability', true),
    (1, '2100', 'Accrued Liabilities',              'liability', true),
    (1, '2200', 'Sales Tax Payable',                'liability', true),
    (1, '2300', 'Short-Term Debt',                  'liability', true),
    -- Equity
    (1, '3000', 'Common Stock',                     'equity',   true),
    (1, '3100', 'Retained Earnings',                'equity',   true),
    (1, '3200', 'Current Year Earnings',            'equity',   true),
    -- Revenue
    (1, '4000', 'Product Sales Revenue',            'revenue',  true),
    (1, '4100', 'Service Revenue',                  'revenue',  true),
    (1, '4200', 'Sales Discounts & Returns',        'revenue',  true),
    -- Cost of Goods Sold
    (1, '5000', 'Cost of Goods Sold',               'expense',  true),
    (1, '5100', 'Inventory Write-Offs',             'expense',  true),
    -- Operating Expenses
    (1, '6000', 'Salaries & Wages',                 'expense',  true),
    (1, '6100', 'Rent & Utilities',                 'expense',  true),
    (1, '6200', 'Office Supplies',                  'expense',  true),
    (1, '6300', 'Marketing & Advertising',          'expense',  true),
    (1, '6400', 'Depreciation',                     'expense',  true),
    (1, '6500', 'Insurance',                        'expense',  true),
    (1, '6600', 'Professional Fees',                'expense',  true),
    (1, '6700', 'Travel & Entertainment',           'expense',  true),
    -- GlobalTech COA (same structure, different codes)
    (2, '1000', 'Cash & Cash Equivalents',          'asset',    true),
    (2, '1100', 'Accounts Receivable',              'asset',    true),
    (2, '1200', 'Inventory',                        'asset',    true),
    (2, '1300', 'Prepaid Expenses',                 'asset',    true),
    (2, '1400', 'Fixed Assets (Net)',               'asset',    true),
    (2, '2000', 'Accounts Payable',                 'liability', true),
    (2, '2100', 'Accrued Liabilities',              'liability', true),
    (2, '2200', 'Sales Tax Payable',                'liability', true),
    (2, '2300', 'Deferred Revenue',                 'liability', true),
    (2, '3000', 'Common Stock',                     'equity',   true),
    (2, '3100', 'Retained Earnings',                'equity',   true),
    (2, '3200', 'Current Year Earnings',            'equity',   true),
    (2, '4000', 'Product Sales Revenue',            'revenue',  true),
    (2, '4100', 'Service Revenue',                  'revenue',  true),
    (2, '5000', 'Cost of Goods Sold',               'expense',  true),
    (2, '5100', 'Inventory Write-Offs',             'expense',  true),
    (2, '6000', 'Salaries & Wages',                 'expense',  true),
    (2, '6100', 'Rent & Utilities',                 'expense',  true),
    (2, '6200', 'R&D Expenses',                     'expense',  true),
    (2, '6300', 'Marketing & Advertising',          'expense',  true),
    (2, '6400', 'Depreciation',                     'expense',  true),
    (2, '6500', 'Insurance',                        'expense',  true),
    -- EuroChem COA (EUR-based)
    (3, '1000', 'Kassenbestand',                    'asset',    true),
    (3, '1100', 'Forderungen aus L&L',              'asset',    true),
    (3, '1200', 'Vorräte',                          'asset',    true),
    (3, '1300', 'Sonstige Vermögensgegenstände',    'asset',    true),
    (3, '1400', 'Sachanlagen',                      'asset',    true),
    (3, '2000', 'Verbindlichkeiten a. L&L',         'liability', true),
    (3, '2100', 'Sonstige Rückstellungen',          'liability', true),
    (3, '2200', 'Umsatzsteuerverbindlichkeit',      'liability', true),
    (3, '3000', 'Gezeichnetes Kapital',             'equity',   true),
    (3, '3100', 'Gewinnrücklagen',                  'equity',   true),
    (3, '3200', 'Jahresüberschuss',                 'equity',   true),
    (3, '4000', 'Umsatzerlöse',                     'revenue',  true),
    (3, '5000', 'Wareneinsatz',                     'expense',  true),
    (3, '6000', 'Personalaufwand',                  'expense',  true),
    (3, '6100', 'Miete & Nebenkosten',              'expense',  true),
    (3, '6200', 'Abschreibungen',                   'expense',  true),
    (3, '6300', 'Sonstige betriebliche Aufwendungen','expense', true);

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5j. INVOICES & ITEMS (linked to shipped/invoiced sales orders)
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO invoices (company_id, invoice_number, sales_order_id, customer_id, invoice_date, due_date, status, subtotal, tax_total, grand_total, amount_paid, payment_terms)
VALUES
    (1, 'INV-2026-0001', 1, 1, '2026-01-20', '2026-02-19', 'paid',      2868.75, 254.70, 3123.45, 3123.45, 'Net 30'),
    (2, 'INV-2026-0002', 3, 4, '2026-01-28', '2026-02-27', 'overdue',   2385.00, 172.91, 2557.91,    0.00, 'Net 30'),
    (2, 'INV-2026-0003', 4, 6, '2026-03-10', '2026-04-09', 'draft',     8100.00, 587.25, 8687.25,    0.00, 'Net 30'),
    (3, 'INV-2026-0004', 5, 7, '2026-02-15', '2026-03-17', 'sent',      4200.00, 798.00, 4998.00,    0.00, 'Net 30 nach Rechnungserhalt');

INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total)
VALUES
    -- INV-0001
    (1, 1, 'Aluminum Widget Pro',                   25,  18.50,  0.00, 8.875,  462.50),
    (1, 3, 'Grade-8 Steel Bolt Set',                50,  34.75,  5.00, 8.875, 1650.63),
    (1, 4, 'Control Board v3.2',                     2, 245.00,  0.00, 8.875,  490.00),
    (1, 5, 'Deluxe Packaging Bundle',               12,  22.00,  0.00, 8.875,  264.00),
    -- INV-0002
    (2, 6, 'CloudRack 42U Server Rack',              1,1890.00,  0.00, 7.250, 1890.00),
    (2, 7, 'Fiber Optic Patch 10m',                 10,  18.90,  0.00, 7.250,  189.00),
    (2,10, 'ScanMaster 8500',                        1, 395.00,  0.00, 7.250,  395.00),
    -- INV-0003 (draft, items correspond to SO-0004)
    (3, 8, 'TempSense PT100 Probe',                 40,  42.50,  0.00, 7.250, 1700.00),
    (3, 9, 'AutoPick R2 Robot',                      1,14500.00, 0.00, 7.250,14500.00),
    -- INV-0004
    (4,11, 'Sodium Chloride 99.9%',                 80,  32.00,  0.00,19.000, 2560.00),
    (4,13, 'Industrial Water Filter',               60,  15.80,  0.00,19.000,  948.00),
    (4,14, 'Pressure Relief Valve 2"',               6,  89.50,  0.00,19.000,  537.00);

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5k. PAYMENTS
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO payments (company_id, invoice_id, payment_number, payment_date, amount, payment_method, reference_number)
VALUES
    (1, 1, 'PAY-2026-0001', '2026-02-05', 3123.45, 'Wire Transfer', 'WIRE-2026-0215'),
    (1, 1, 'PAY-2026-0002', '2026-01-25', 1500.00, 'Credit Card',  'CC-CH-4892'),
    (1, 1, 'PAY-2026-0003', '2026-02-10', 1623.45, 'Check',        'CHK-1042');

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5l. JOURNAL ENTRIES & LINES
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO journal_entries (company_id, entry_date, total_debit, total_credit, reference_type, reference_id, description, voucher_no, voucher_type, status)
VALUES
    -- Sale on credit for SO-0001 -> INV-0001
    (1, '2026-01-20', 3123.45, 3123.45, 'invoice', 1, 'Invoice INV-2026-0001 - Sale to Sarah Mitchell', 'JE-2026-0001', 'Sales', 'posted');

INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration)
VALUES
    (1, 2, 3123.45, 0,      'Accounts Receivable'),
    (1, 13, 0,      2868.75,'Product Sales Revenue'),
    (1, 8, 0,        254.70,'Sales Tax Payable');

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5m. WAREHOUSES, BINS & PRODUCT-WAREHOUSE STOCK
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO warehouses (company_id, code, name, address, city, state, country, postal_code, is_default, is_active)
VALUES
    (1, 'WH-NYC',   'New York Main Warehouse',     '350 5th Avenue, Floor 2',  'New York',   'NY', 'USA', '10118', true,  true),
    (1, 'WH-LAX',   'Los Angeles Distribution Hub', '1200 Long Beach Ave',      'Los Angeles', 'CA', 'USA', '90013', false, true),
    (2, 'CHI-HUB',  'Chicago Logistics Center',     '4500 W 47th Street',       'Chicago',     'IL', 'USA', '60632', true,  true),
    (3, 'BER-WH',   'Berlin Central Warehouse',     'Industriestraße 45',       'Berlin',      NULL, 'Germany', '12059', true,  true);

INSERT INTO warehouse_bins (company_id, warehouse_id, code, name, zone, aisle, rack, shelf)
VALUES
    (1, 1, 'A-01-01', 'Aisle A, Rack 1, Shelf 1', 'Storage A', 'A', '1', '1'),
    (1, 1, 'A-01-02', 'Aisle A, Rack 1, Shelf 2', 'Storage A', 'A', '1', '2'),
    (1, 1, 'B-02-01', 'Aisle B, Rack 2, Shelf 1', 'Storage B', 'B', '2', '1'),
    (1, 2, 'LA-A-01', 'LA Zone A Rack 1',          'Zone A',    'A', '1', '1'),
    (2, 3, 'CH-01-01','Chicago Main Rack 1',       'Main Floor','1', '1', '1'),
    (3, 4, 'BR-A-01', 'Berlin Rack A1',            'Lager A',   'A', '1', '1'),
    (3, 4, 'BR-B-02', 'Berlin Rack B2',            'Lager B',   'B', '2', '1');

INSERT INTO product_warehouse_stock (company_id, product_id, warehouse_id, bin_id, quantity, reorder_level)
VALUES
    (1, 1, 1, 1, 200, 40),
    (1, 2, 1, 2,  60, 15),
    (1, 3, 1, 1, 400, 80),
    (1, 4, 1, 3,  30, 10),
    (1, 5, 2, 4, 120, 30),
    (2, 6, 3, 5, 10,  3),
    (2, 7, 3, 5, 700, 100),
    (2, 8, 3, 5, 300, 50),
    (2, 9, 3, 5, 2,   1),
    (2,10, 3, 5,  40, 10),
    (3,11, 4, 6, 350, 60),
    (3,12, 4, 6, 100, 20),
    (3,13, 4, 7, 500, 100),
    (3,14, 4, 6,  70, 15),
    (3,15, 4, 7,  15,  5);

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5n. EMPLOYEES
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO employees (company_id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, address, city, state, country, department, position, hire_date, employment_type, salary, status)
VALUES
    (1, 'EMP-ACM-001', 'Jennifer',  'Adams',     'jennifer.adams@acmecorp.com',   '+1-212-555-7001', '1985-03-12', 'Female', '150 Broadway, Apt 12B', 'New York',   'NY',  'USA', 'Operations',     'Operations Manager',      '2019-06-01', 'Full-time', 85000.00, 'active'),
    (1, 'EMP-ACM-002', 'Michael',   'Torres',    'michael.torres@acmecorp.com',   '+1-212-555-7002', '1990-11-05', 'Male',   '200 W 45th St, Apt 8A',  'New York',   'NY',  'USA', 'Warehouse',      'Warehouse Supervisor',    '2020-09-15', 'Full-time', 62000.00, 'active'),
    (2, 'EMP-GTI-001', 'Aisha',     'Patel',     'aisha.patel@globaltech.io',     '+1-408-555-8001', '1988-07-22', 'Female', '3500 Stevens Creek Blvd', 'San Jose',   'CA',  'USA', 'Engineering',    'Senior Hardware Engineer','2018-03-20', 'Full-time', 135000.00,'active'),
    (2, 'EMP-GTI-002', 'James',     'O Brien',   'james.obrien@globaltech.io',    '+1-408-555-8002', '1992-01-14', 'Male',   '880 N 1st Street, #305',  'San Jose',   'CA',  'USA', 'Sales',          'Sales Director',          '2021-01-10', 'Full-time', 110000.00,'active'),
    (3, 'EMP-ECH-001', 'Petra',     'Schmidt',   'petra.schmidt@eurochem.de',     '+49-30-555-9001', '1982-09-30', 'Female', 'Hauptstraße 45',         'Berlin',     NULL, 'Germany', 'Laboratory',     'Lab Manager',             '2017-05-01', 'Full-time', 78000.00, 'active'),
    (3, 'EMP-ECH-002', 'Lukas',     'Fischer',   'lukas.fischer@eurochem.de',     '+49-30-555-9002', '1991-04-18', 'Male',   'Schillerstraße 12',      'Berlin',     NULL, 'Germany', 'Logistics',      'Logistics Coordinator',   '2022-02-14', 'Full-time', 48000.00, 'active');

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5o. LEAVE TYPES (already inserted via hr-schema.sql, but for other companies)
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO leave_types (company_id, name, code, default_days, is_paid, requires_approval, is_active)
VALUES
    (2, 'Annual Leave',  'AL', 20, true,  true, true),
    (2, 'Sick Leave',    'SL', 12, true,  true, true),
    (2, 'Casual Leave',  'CL',  5, true,  true, true),
    (2, 'Unpaid Leave',  'UL',  0, false, true, true),
    (3, 'Jahresurlaub',  'JU', 28, true,  true, true),
    (3, 'Krankheitstag', 'KT', 10, true,  true, true),
    (3, 'Sonderurlaub',  'SU',  3, true,  true, true),
    (3, 'Unbezahlter Urlaub', 'UU', 0, false, true, true);

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5p. LEAVE REQUESTS (some sample)
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO leave_requests (company_id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status)
VALUES
    (1, 1, 1, '2026-03-10', '2026-03-14', 5, 'Family vacation to Florida',       'approved'),
    (2, 3, 6, '2026-04-01', '2026-04-03', 3, 'Medical appointment',              'approved'),
    (3, 5, 11,'2026-05-01', '2026-05-15', 15,'Jahresurlaub – Italienreise',      'pending');

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5q. ASSET CATEGORIES & FIXED ASSETS
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO asset_categories (company_id, code, name, default_depreciation_method, default_useful_life, is_active)
VALUES
    (1, 'COMP-EQ',    'Computer Equipment',     'straight_line', 5, true),
    (1, 'OFFICE-FUR', 'Office Furniture',       'straight_line', 7, true),
    (1, 'MACHINERY',  'Manufacturing Machinery','straight_line', 10, true),
    (2, 'COMP-EQ',    'Computer Equipment',     'straight_line', 5, true),
    (2, 'VEHICLES',   'Vehicles',               'straight_line', 5, true),
    (3, 'LAB-EQ',     'Laboratory Equipment',   'straight_line', 8, true),
    (3, 'COMP-EQ',    'Computer Equipment',     'straight_line', 5, true);

INSERT INTO fixed_assets (company_id, asset_code, name, category_id, description, purchase_date, purchase_cost, current_value, salvage_value, useful_life, depreciation_method, accumulated_depreciation, depreciation_per_period, location, status)
VALUES
    (1, 'ACM-ASST-001', 'CNC Milling Machine',       3, 'Haas VF-2 3-axis CNC mill',            '2024-06-15', 85000.00, 72250.00, 5000.00, 10, 'straight_line', 12750.00, 8000.00,  '350 5th Ave, Floor 1',   'active'),
    (1, 'ACM-ASST-002', 'Server Rack ProLiant',       1, 'HPE ProLiant DL380 Gen10 server',     '2025-01-20', 12000.00, 10200.00,  500.00,  5, 'straight_line',  1800.00, 2300.00,  '350 5th Ave, Server Room','active'),
    (2, 'GTI-ASST-001', 'Forklift Toyota 8FGCU25',    5, 'Toyota 8FGCU25 propane forklift',     '2024-03-10', 32000.00, 22400.00, 3000.00,  5, 'straight_line',  9600.00, 5800.00,  'Chicago Logistics Center','active'),
    (3, 'ECH-ASST-001', 'Spectrophotometer UV-2600',  6, 'Shimadzu UV-2600 UV-Vis spectrometer','2024-11-01', 28000.00, 26250.00, 2000.00,  8, 'straight_line',  1750.00, 3250.00,  'Berlin Lab, Room 102',   'active');

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5r. EXPENSE CATEGORIES & EXPENSES
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO expense_categories (company_id, name, description, is_active)
VALUES
    (1, 'Office Supplies',   'Stationery, printer toner, etc.',        true),
    (1, 'Utilities',         'Electricity, water, internet',           true),
    (1, 'Travel',            'Business travel and accommodation',      true),
    (2, 'R&D Materials',     'Prototyping and research supplies',      true),
    (2, 'Marketing',         'Digital ads, trade shows, print',        true),
    (3, 'Lab Consumables',   'Gloves, pipettes, beakers, reagents',    true),
    (3, 'Facility Costs',    'Miete, Reinigung, Wartung',              true);

INSERT INTO expenses (company_id, expense_date, category, category_id, description, amount, payment_method, reference_number)
VALUES
    (1, '2026-01-08', 'Office Supplies', 1, 'Printer toner cartridges (qty 4)',         240.00,  'Credit Card', 'CC-ACM-001'),
    (1, '2026-01-15', 'Utilities',       2, 'January electricity bill',                 1850.00, 'Wire',        'UTIL-2026-01'),
    (1, '2026-02-05', 'Travel',          3, 'Hotel stay - Miami client visit (3 nights)',780.00,  'Corporate Card', 'TRV-2026-005'),
    (2, '2026-01-22', 'R&D Materials',   4, 'PCB prototype batch (10 pcs)',             3200.00, 'Check',       'CHK-2089'),
    (2, '2026-02-14', 'Marketing',       5, 'Google Ads campaign Q1 2026',              5000.00, 'Credit Card', 'CC-GTI-042'),
    (3, '2026-01-12', 'Lab Consumables', 6, 'Microscope slides and cover slips (500)',   185.00,  'Bank Transfer', 'ÜBW-2026-012'),
    (3, '2026-02-28', 'Facility Costs',  7, 'February facility maintenance service',    1250.00, 'Bank Transfer', 'ÜBW-2026-028');

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5s. COST CENTERS (for accounting enhancement)
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO cost_centers (company_id, code, name, description, is_active)
VALUES
    (1, 'CC-ADMIN',  'Administration',    'General administrative costs',        true),
    (1, 'CC-OPS',    'Operations',        'Manufacturing and warehouse ops',     true),
    (1, 'CC-SALES',  'Sales & Marketing', 'Sales team and marketing costs',      true),
    (2, 'CC-RND',    'Research & Development','Engineering and R&D costs',        true),
    (2, 'CC-SALES',  'Sales',             'Sales department costs',              true),
    (3, 'CC-LAB',    'Labor',             'Laboratory operations cost center',   true),
    (3, 'CC-LOG',    'Logistics',         'Warehouse and shipping cost center',  true);

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5t. PROJECTS (for project management module)
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO projects (company_id, project_code, name, description, customer_id, start_date, end_date, budget_amount, status, priority)
VALUES
    (1, 'PRJ-ACM-001', 'Miami Hotel Refurbishment',   'Full electrical and plumbing upgrade for Pristine Hotels Miami location', 3, '2026-03-01', '2026-06-30', 250000.00, 'in_progress', 'high'),
    (2, 'PRJ-GTI-001', 'NovaStar Data Center Migration','Migration of NovaStar systems to new data center infrastructure',     4, '2026-02-15', '2026-05-15', 180000.00, 'in_progress', 'high'),
    (3, 'PRJ-ECH-001', 'Berlin Pharm Q2 Scale-Up',      'Scale-up of chemical production process for Berlin Pharm AG',         7, '2026-04-01', '2026-09-30', 95000.00,  'planning',    'medium');

INSERT INTO project_tasks (company_id, project_id, name, description, assigned_to, start_date, due_date, estimated_hours, status, priority)
VALUES
    (1, 1, 'Site Survey',           'Complete on-site electrical and structural survey',         2, '2026-03-01', '2026-03-08', 24, 'completed', 'high'),
    (1, 1, 'Material Procurement',  'Order all required wiring, panels, and fixtures',           2, '2026-03-10', '2026-03-25', 16, 'in_progress', 'high'),
    (1, 1, 'Electrical Rough-In',   'Install conduit, boxes, and pull wiring',                  4, '2026-04-01', '2026-04-20', 120, 'pending', 'high'),
    (2, 2, 'Network Assessment',    'Audit existing NovaStar network topology and requirements',  3, '2026-02-15', '2026-02-28', 30, 'completed', 'high'),
    (2, 2, 'Server Rack Installation','Install and configure new CloudRack server racks',         4, '2026-03-01', '2026-03-20', 40, 'in_progress', 'high'),
    (3, 3, 'Process Documentation', 'Document existing chemical process steps and parameters',   3, '2026-04-01', '2026-04-15', 20, 'pending', 'medium');

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5u. CRM – LEADS
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO lead_sources (company_id, name, is_active)
VALUES
    (2, 'Website'), (2, 'Referral'), (2, 'LinkedIn'), (2, 'Tech Conference'),
    (3, 'Website'), (3, 'Messe/Conference'), (3, 'Empfehlung');

INSERT INTO lead_statuses (company_id, name, sort_order, color, is_active)
VALUES
    (2, 'New', 1, '#3b82f6', true), (2, 'Contacted', 2, '#8b5cf6', true),
    (2, 'Qualified', 3, '#f59e0b', true), (2, 'Won', 4, '#10b981', true),
    (3, 'Neu', 1, '#3b82f6', true), (3, 'Kontaktiert', 2, '#8b5cf6', true),
    (3, 'Qualifiziert', 3, '#f59e0b', true), (3, 'Gewonnen', 4, '#10b981', true);

INSERT INTO leads (company_id, first_name, last_name, email, phone, company, source_id, status_id, assigned_to, city, country)
VALUES
    (2, 'Emily',  'Watson',   'emily.watson@startup.io',     '+1-415-555-3001', 'NexGen Robotics',  1, 1, 3, 'San Francisco', 'USA'),
    (2, 'Thomas', 'Mueller',  'thomas@cloudscale.de',        '+49-89-555-4001', 'CloudScale GmbH',  3, 3, 4, 'München',       'Germany'),
    (3, 'Dr. Anna', 'Krüger', 'anna.krueger@unibw.de',       '+49-30-555-5001', 'Universität der Bundeswehr', 1, 5, 4, 'Berlin', 'Germany');

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5v. QUOTATIONS
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO quotations (company_id, customer_id, quote_number, quote_date, expiry_date, status, subtotal, tax_total, discount_total, grand_total, notes)
VALUES
    (1, 2, 'QTE-2026-0001', '2026-02-01', '2026-03-03', 'accepted', 11250.00, 998.44, 0.00, 12248.44, 'Bulk pricing for office building automation project'),
    (2, 5, 'QTE-2026-0002', '2026-03-05', '2026-04-04', 'draft',    8750.00, 634.38, 500.00, 8884.38, 'Proposed sensor network for smart warehouse');

INSERT INTO quotation_items (quotation_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total)
VALUES
    (1, 2, 'Digital Multimeter 5000', 50, 89.00, 0.00, 8.875, 4450.00),
    (1, 4, 'Control Board v3.2',      20, 245.00, 5.00, 8.875, 4655.00),
    (1, 5, 'Deluxe Packaging Bundle', 30, 22.00, 0.00, 8.875, 660.00),
    (2, 8, 'TempSense PT100 Probe',   100, 42.50, 5.00, 7.250, 4037.50),
    (2, 10,'ScanMaster 8500',         10, 395.00, 0.00, 7.250, 3950.00);

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5w. SERVICES & SERVICE INVOICES
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO services (company_id, name, description, category, unit_price, tax_percent, is_active)
VALUES
    (1, 'Equipment Installation',   'On-site installation and calibration of industrial equipment',   'Installation', 1500.00, 8.875, true),
    (1, 'Preventive Maintenance',   'Quarterly preventive maintenance visit',                         'Maintenance',   750.00, 8.875, true),
    (2, 'Cloud Infrastructure Audit','Security and performance audit of cloud infrastructure',        'Consulting',    5000.00, 7.250, true),
    (2, 'Firmware Update Service',  'Remote firmware update for deployed devices',                    'Software',       200.00, 0.00,  true);

INSERT INTO service_invoices (company_id, invoice_number, customer_id, invoice_date, due_date, status, subtotal, tax_total, grand_total)
VALUES
    (1, 'SINV-2026-0001', 3, '2026-03-01', '2026-03-31', 'sent', 3000.00, 266.25, 3266.25);

INSERT INTO service_invoice_items (service_invoice_id, service_id, description, quantity, unit_price, discount_percent, tax_percent, total)
VALUES
    (1, 1, 'Installation of control boards at Miami Hotel site', 2, 1500.00, 0.00, 8.875, 3000.00);

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5x. RETURN REASONS (for companies 2 & 3)
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO return_reasons (company_id, reason_code, reason_name, category, is_active)
VALUES
    (2, 'DEFECTIVE',   'Defective/Damaged Product',    'both',   true),
    (2, 'WRONG_ITEM',  'Wrong Item Shipped',           'both',   true),
    (2, 'CUSTOMER_REQ','Customer Request/Change Mind', 'sales',  true),
    (3, 'DEFECTIVE',   'Defekt/Beschädigt',            'both',   true),
    (3, 'FALSCHE_WARE','Falsche Ware geliefert',       'both',   true),
    (3, 'QUALITY',     'Qualitätsmangel',              'both',   true);

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5y. BANK ACCOUNTS (for accounting enhancement)
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO bank_accounts (company_id, account_id, bank_name, account_number, account_name, opening_balance, as_of_date, is_active)
VALUES
    (1, 1, 'Chase Bank',       '****-1234', 'Acme Corporation Operating Account',  500000.00, '2026-01-01', true),
    (2, 26,'Bank of America',  '****-5678', 'GlobalTech Industries Business Account', 1200000.00, '2026-01-01', true),
    (3, 48,'Deutsche Bank',    '****-9012', 'EuroChem GmbH Geschäftskonto',         750000.00, '2026-01-01', true);

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5z. APPROVAL WORKFLOWS
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO approval_workflows (company_id, name, description, target_entity, is_active)
VALUES
    (1, 'Purchase Order Approval', 'Standard PO approval for purchases over $5,000', 'purchase_order', true);

-- ====================================================================
-- STEP 6: Re-enable triggers (safety net)
-- ====================================================================
SET session_replication_role = 'origin';

-- ====================================================================
-- STEP 7: Row count verification
-- ====================================================================
SELECT 'companies' AS table_name, COUNT(*) AS row_count FROM companies
UNION ALL SELECT 'customers', COUNT(*) FROM customers
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL SELECT 'tax_rates', COUNT(*) FROM tax_rates
UNION ALL SELECT 'sales_orders', COUNT(*) FROM sales_orders
UNION ALL SELECT 'sales_order_items', COUNT(*) FROM sales_order_items
UNION ALL SELECT 'purchase_orders', COUNT(*) FROM purchase_orders
UNION ALL SELECT 'purchase_order_items', COUNT(*) FROM purchase_order_items
UNION ALL SELECT 'inventory_transactions', COUNT(*) FROM inventory_transactions
UNION ALL SELECT 'chart_of_accounts', COUNT(*) FROM chart_of_accounts
UNION ALL SELECT 'journal_entries', COUNT(*) FROM journal_entries
UNION ALL SELECT 'journal_entry_lines', COUNT(*) FROM journal_entry_lines
UNION ALL SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL SELECT 'invoice_items', COUNT(*) FROM invoice_items
UNION ALL SELECT 'payments', COUNT(*) FROM payments
UNION ALL SELECT 'warehouses', COUNT(*) FROM warehouses
UNION ALL SELECT 'warehouse_bins', COUNT(*) FROM warehouse_bins
UNION ALL SELECT 'product_warehouse_stock', COUNT(*) FROM product_warehouse_stock
UNION ALL SELECT 'employees', COUNT(*) FROM employees
UNION ALL SELECT 'leave_types', COUNT(*) FROM leave_types
UNION ALL SELECT 'leave_requests', COUNT(*) FROM leave_requests
UNION ALL SELECT 'asset_categories', COUNT(*) FROM asset_categories
UNION ALL SELECT 'fixed_assets', COUNT(*) FROM fixed_assets
UNION ALL SELECT 'expense_categories', COUNT(*) FROM expense_categories
UNION ALL SELECT 'expenses', COUNT(*) FROM expenses
UNION ALL SELECT 'cost_centers', COUNT(*) FROM cost_centers
UNION ALL SELECT 'projects', COUNT(*) FROM projects
UNION ALL SELECT 'project_tasks', COUNT(*) FROM project_tasks
UNION ALL SELECT 'lead_sources', COUNT(*) FROM lead_sources
UNION ALL SELECT 'lead_statuses', COUNT(*) FROM lead_statuses
UNION ALL SELECT 'leads', COUNT(*) FROM leads
UNION ALL SELECT 'quotations', COUNT(*) FROM quotations
UNION ALL SELECT 'quotation_items', COUNT(*) FROM quotation_items
UNION ALL SELECT 'services', COUNT(*) FROM services
UNION ALL SELECT 'service_invoices', COUNT(*) FROM service_invoices
UNION ALL SELECT 'service_invoice_items', COUNT(*) FROM service_invoice_items
UNION ALL SELECT 'return_reasons', COUNT(*) FROM return_reasons
UNION ALL SELECT 'bank_accounts', COUNT(*) FROM bank_accounts
UNION ALL SELECT 'approval_workflows', COUNT(*) FROM approval_workflows
ORDER BY table_name;

COMMIT;
