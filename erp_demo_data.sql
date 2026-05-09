-- =============================================================================
-- ERP DEMO DATA: RESET + POPULATE
-- =============================================================================
-- This script DELETES all existing business data and inserts realistic demo
-- data for a multi-company, multi-warehouse ERP environment.
--
-- PROTECTED TABLES (NOT TOUCHED): users, roles, audit_logs, email_templates,
-- password_resets, user_roles, sessions, and any other auth-related tables.
-- =============================================================================

BEGIN;

-- =============================================================================
-- PART 1: DELETE ALL EXISTING DATA (triggers & FK checks temporarily disabled)
-- =============================================================================
SET session_replication_role = replica;

-- Asset Management
DELETE FROM asset_maintenance;
DELETE FROM asset_depreciation;
DELETE FROM fixed_assets;
DELETE FROM asset_categories;

-- HR
DELETE FROM employee_documents;
DELETE FROM leave_requests;
DELETE FROM attendance;
DELETE FROM leave_types;
DELETE FROM employees;

-- Production (if tables exist)
DELETE FROM production_logs;
DELETE FROM work_order_materials;
DELETE FROM work_orders;
DELETE FROM bom_items;
DELETE FROM boms;

-- Stock Transfers
DELETE FROM stock_transfer_items;
DELETE FROM stock_transfers;

-- Product-Warehouse stock
DELETE FROM product_warehouse_stock;
DELETE FROM warehouse_bins;

-- CRM
DELETE FROM follow_ups;
DELETE FROM interactions;
DELETE FROM opportunities;
DELETE FROM leads;
DELETE FROM lead_statuses;
DELETE FROM lead_sources;

-- POS
DELETE FROM pos_transaction_items;
DELETE FROM pos_transactions;
DELETE FROM pos_cart;
DELETE FROM pos_sessions;

-- Returns & Credit Notes
DELETE FROM credit_notes;
DELETE FROM purchase_return_items;
DELETE FROM purchase_returns;
DELETE FROM sales_return_items;
DELETE FROM sales_returns;
DELETE FROM return_reasons;

-- Service Invoices
DELETE FROM service_invoice_items;
DELETE FROM service_invoices;

-- Services
DELETE FROM services;

-- Quotations
DELETE FROM quotation_items;
DELETE FROM quotations;

-- Time entries, projects, approvals
DELETE FROM time_entries;
DELETE FROM approval_logs;
DELETE FROM approval_requests;
DELETE FROM approval_steps;
DELETE FROM approval_workflows;
DELETE FROM project_members;
DELETE FROM project_tasks;
DELETE FROM projects;

-- Payments & Invoices
DELETE FROM payments;
DELETE FROM invoice_items;
DELETE FROM invoices;

-- Purchase Orders & Items
DELETE FROM purchase_order_items;
DELETE FROM purchase_orders;

-- Sales Orders & Items
DELETE FROM sales_order_items;
DELETE FROM sales_orders;

-- Inventory Transactions
DELETE FROM inventory_transactions;

-- Accounting
DELETE FROM recurring_entry_lines;
DELETE FROM recurring_entries;
DELETE FROM reconciliation_reports;
DELETE FROM bank_transactions;
DELETE FROM bank_accounts;
DELETE FROM budget_items;
DELETE FROM budgets;
DELETE FROM cost_centers;
DELETE FROM journal_entry_lines;
DELETE FROM journal_entries;
DELETE FROM expenses;
DELETE FROM expense_categories;

-- Core Business Entities
DELETE FROM suppliers;
DELETE FROM customers;
DELETE FROM products;
DELETE FROM warehouses;
DELETE FROM tax_rates;
DELETE FROM chart_of_accounts;
DELETE FROM companies;

SET session_replication_role = origin;

-- =============================================================================
-- PART 2: RESET ALL SEQUENCES
-- =============================================================================
ALTER SEQUENCE companies_id_seq               RESTART WITH 1;
ALTER SEQUENCE tax_rates_id_seq               RESTART WITH 1;
ALTER SEQUENCE chart_of_accounts_id_seq       RESTART WITH 1;
ALTER SEQUENCE warehouses_id_seq              RESTART WITH 1;
ALTER SEQUENCE warehouse_bins_id_seq          RESTART WITH 1;
ALTER SEQUENCE products_id_seq                RESTART WITH 1;
ALTER SEQUENCE product_warehouse_stock_id_seq RESTART WITH 1;
ALTER SEQUENCE suppliers_id_seq               RESTART WITH 1;
ALTER SEQUENCE customers_id_seq               RESTART WITH 1;
ALTER SEQUENCE expense_categories_id_seq      RESTART WITH 1;
ALTER SEQUENCE asset_categories_id_seq        RESTART WITH 1;
ALTER SEQUENCE employees_id_seq               RESTART WITH 1;
ALTER SEQUENCE leave_types_id_seq             RESTART WITH 1;
ALTER SEQUENCE return_reasons_id_seq          RESTART WITH 1;
ALTER SEQUENCE services_id_seq                RESTART WITH 1;
ALTER SEQUENCE purchase_orders_id_seq         RESTART WITH 1;
ALTER SEQUENCE purchase_order_items_id_seq    RESTART WITH 1;
ALTER SEQUENCE sales_orders_id_seq            RESTART WITH 1;
ALTER SEQUENCE sales_order_items_id_seq       RESTART WITH 1;
ALTER SEQUENCE inventory_transactions_id_seq  RESTART WITH 1;
ALTER SEQUENCE invoices_id_seq                RESTART WITH 1;
ALTER SEQUENCE invoice_items_id_seq           RESTART WITH 1;
ALTER SEQUENCE payments_id_seq                RESTART WITH 1;
ALTER SEQUENCE journal_entries_id_seq         RESTART WITH 1;
ALTER SEQUENCE journal_entry_lines_id_seq     RESTART WITH 1;
ALTER SEQUENCE expenses_id_seq                RESTART WITH 1;
ALTER SEQUENCE fixed_assets_id_seq            RESTART WITH 1;
ALTER SEQUENCE asset_depreciation_id_seq      RESTART WITH 1;
ALTER SEQUENCE asset_maintenance_id_seq       RESTART WITH 1;
ALTER SEQUENCE projects_id_seq                RESTART WITH 1;
ALTER SEQUENCE project_tasks_id_seq           RESTART WITH 1;
ALTER SEQUENCE project_members_id_seq         RESTART WITH 1;
ALTER SEQUENCE time_entries_id_seq            RESTART WITH 1;
ALTER SEQUENCE stock_transfers_id_seq         RESTART WITH 1;
ALTER SEQUENCE stock_transfer_items_id_seq    RESTART WITH 1;
ALTER SEQUENCE cost_centers_id_seq            RESTART WITH 1;
ALTER SEQUENCE budgets_id_seq                 RESTART WITH 1;
ALTER SEQUENCE budget_items_id_seq            RESTART WITH 1;
ALTER SEQUENCE bank_accounts_id_seq           RESTART WITH 1;
ALTER SEQUENCE bank_transactions_id_seq       RESTART WITH 1;

-- =============================================================================
-- PART 3: INSERT MASTER DATA
-- =============================================================================

-- -------------------------------------------------------------------------
-- 3a. COMPANIES / LEGAL ENTITIES
-- -------------------------------------------------------------------------
INSERT INTO companies (id, name, tax_id, email, phone, address, currency) VALUES
(1, 'Acme Manufacturing Corporation',   '45-7890123',   'corporate@acmemfg.com',   '+1 (312) 555-1400', '200 Wacker Drive, Suite 1500, Chicago, IL 60606, USA',                 'USD'),
(2, 'Globex International Trading Ltd', 'GB-45321-789', 'info@globexint.com',      '+44 20 7946 0831',  '71 Queen Victoria Street, London EC4V 4AY, United Kingdom',             'GBP'),
(3, 'Rheinland Precision GmbH',         'DE-321-456-789','kontakt@rheinland-precision.de', '+49 69 8756 2340','Industriestrasse 45, 60327 Frankfurt am Main, Germany',                 'EUR'),
(4, 'Pacific Rim Imports LLC',          '78-3456789',   'sales@pacificrimimports.com', '+1 (415) 555-9100','1 Embarcadero Center, Suite 800, San Francisco, CA 94111, USA',         'USD');

-- -------------------------------------------------------------------------
-- 3b. TAX RATES
-- -------------------------------------------------------------------------
INSERT INTO tax_rates (id, company_id, name, rate, type, is_default, is_active, description, created_by)
SELECT 1, 1, 'Sales Tax 8.25%',  8.25, 'Sales Tax', true,  true, 'Standard Illinois sales tax rate', id FROM users ORDER BY id LIMIT 1;

INSERT INTO tax_rates (id, company_id, name, rate, type, is_default, is_active, description, created_by)
SELECT 2, 2, 'VAT 20%',         20.00, 'VAT',       true,  true, 'UK standard VAT rate',             id FROM users ORDER BY id LIMIT 1;

INSERT INTO tax_rates (id, company_id, name, rate, type, is_default, is_active, description, created_by)
SELECT 3, 3, 'VAT 19%',         19.00, 'VAT',       true,  true, 'German standard VAT rate',         id FROM users ORDER BY id LIMIT 1;

INSERT INTO tax_rates (id, company_id, name, rate, type, is_default, is_active, description, created_by)
SELECT 4, 4, 'Sales Tax 0%',     0.00, 'Sales Tax', true,  true, 'Zero-rated for export goods',      id FROM users ORDER BY id LIMIT 1;

INSERT INTO tax_rates (id, company_id, name, rate, type, is_default, is_active, description, created_by)
SELECT 5, 1, 'VAT 20% (Import)',20.00, 'VAT',      false, true, 'Import VAT on EU purchases',       id FROM users ORDER BY id LIMIT 1;

SELECT setval('tax_rates_id_seq', 5);

-- -------------------------------------------------------------------------
-- 3c. CHART OF ACCOUNTS (standard accounting framework)
-- -------------------------------------------------------------------------
-- Assets
INSERT INTO chart_of_accounts (id, company_id, account_code, account_name, account_type, description, is_active)
VALUES
(1,   1, '1000', 'Cash - Operating Account',   'asset', 'Primary operating checking account', true),
(2,   1, '1020', 'Accounts Receivable',         'asset', 'Trade receivables from customers',   true),
(3,   1, '1040', 'Inventory - Raw Materials',   'asset', 'Raw material stock value',           true),
(4,   1, '1050', 'Inventory - Finished Goods',  'asset', 'Finished product stock value',       true),
(5,   1, '1100', 'Prepaid Expenses',            'asset', 'Prepaid insurance, rent, etc.',      true),
(6,   1, '1200', 'Land & Buildings',            'asset', 'Property and facilities',            true),
(7,   1, '1300', 'Equipment & Machinery',       'asset', 'Production and office equipment',    true),
(8,   1, '1400', 'Accumulated Depreciation',    'asset', 'Contra-asset for depreciation',      true);

-- Liabilities
INSERT INTO chart_of_accounts (id, company_id, account_code, account_name, account_type, description, is_active)
VALUES
(9,   1, '2000', 'Accounts Payable',            'liability', 'Trade payables to suppliers',     true),
(10,  1, '2100', 'Accrued Liabilities',         'liability', 'Accrued expenses and wages',      true),
(11,  1, '2200', 'Short-term Loans Payable',    'liability', 'Current portion of loans',        true),
(12,  1, '2300', 'VAT / Sales Tax Payable',     'liability', 'Output tax collected',            true),
(13,  1, '2400', 'Income Tax Payable',          'liability', 'Corporate income tax due',        true);

-- Equity
INSERT INTO chart_of_accounts (id, company_id, account_code, account_name, account_type, description, is_active)
VALUES
(14,  1, '3000', 'Common Stock',                'equity', 'Share capital',                      true),
(15,  1, '3100', 'Retained Earnings',           'equity', 'Accumulated retained earnings',     true),
(16,  1, '3200', 'Current Year Profit / Loss',  'equity', 'Current fiscal year result',        true);

-- Revenue
INSERT INTO chart_of_accounts (id, company_id, account_code, account_name, account_type, description, is_active)
VALUES
(17,  1, '4000', 'Product Sales Revenue',       'revenue', 'Revenue from product sales',       true),
(18,  1, '4100', 'Service Revenue',             'revenue', 'Revenue from services',            true),
(19,  1, '4200', 'Sales Discounts & Allowances','revenue', 'Discounts given to customers',     true);

-- Expenses
INSERT INTO chart_of_accounts (id, company_id, account_code, account_name, account_type, description, is_active)
VALUES
(20,  1, '5000', 'Cost of Goods Sold',          'expense', 'Direct cost of products sold',     true),
(21,  1, '5100', 'Salaries & Wages',            'expense', 'Employee compensation',            true),
(22,  1, '5200', 'Rent & Utilities',            'expense', 'Facility rent and utility bills',  true),
(23,  1, '5300', 'Office Supplies & Expenses',  'expense', 'General office expenditures',      true),
(24,  1, '5400', 'Depreciation Expense',        'expense', 'Periodic depreciation charge',     true),
(25,  1, '5500', 'Marketing & Advertising',     'expense', 'Promotional and ad spend',         true),
(26,  1, '5600', 'Insurance Expense',           'expense', 'Business insurance premiums',      true),
(27,  1, '5700', 'Maintenance & Repairs',       'expense', 'Equipment and facility repairs',   true),
(28,  1, '5800', 'Professional Fees',           'expense', 'Legal, audit, consulting fees',    true),
(29,  1, '5900', 'Miscellaneous Expenses',      'expense', 'Other operating expenses',         true);

-- Parent-child relationships (sub-accounts)
UPDATE chart_of_accounts SET parent_account_id = 6  WHERE id = 7;  -- Equipment under Buildings
UPDATE chart_of_accounts SET parent_account_id = 7  WHERE id = 8;  -- Accum Depr under Equipment

SELECT setval('chart_of_accounts_id_seq', 29);

-- -------------------------------------------------------------------------
-- 3d. WAREHOUSES / LOCATIONS
-- -------------------------------------------------------------------------
INSERT INTO warehouses (id, company_id, code, name, address, city, state, country, postal_code, phone, email, is_default, is_active)
SELECT 1, 1, 'WH-CHI', 'Chicago Main Distribution Center',
  '4500 Industrial Parkway', 'Chicago', 'IL', 'USA', '60638', '+1 (312) 555-2401', 'warehouse.chi@acmemfg.com',
  true, true;

INSERT INTO warehouses (id, company_id, code, name, address, city, state, country, postal_code, phone, email, is_default, is_active)
SELECT 2, 1, 'WH-NWK', 'East Coast Regional Hub',
  '1200 Port Street', 'Newark', 'NJ', 'USA', '07114', '+1 (973) 555-6100', 'warehouse.nwk@acmemfg.com',
  false, true;

INSERT INTO warehouses (id, company_id, code, name, address, city, state, country, postal_code, phone, email, is_default, is_active)
SELECT 3, 1, 'WH-LAX', 'West Coast Fulfillment Center',
  '8900 Aviation Boulevard', 'Los Angeles', 'CA', 'USA', '90045', '+1 (310) 555-3300', 'warehouse.lax@acmemfg.com',
  false, true;

INSERT INTO warehouses (id, company_id, code, name, address, city, state, country, postal_code, phone, email, is_default, is_active)
SELECT 4, 1, 'WH-ATL', 'Southern Logistics Center',
  '2750 Southfield Drive', 'Atlanta', 'GA', 'USA', '30349', '+1 (404) 555-7700', 'warehouse.atl@acmemfg.com',
  false, true;

INSERT INTO warehouses (id, company_id, code, name, address, city, state, country, postal_code, phone, email, is_default, is_active)
SELECT 5, 2, 'WH-LHR', 'European Distribution Hub',
  'Unit 12, Heathrow Business Park', 'Hounslow', NULL, 'United Kingdom', 'TW6 2GA', '+44 20 8890 4500', 'warehouse.lhr@globexint.com',
  true, true;

SELECT setval('warehouses_id_seq', 5);

-- -------------------------------------------------------------------------
-- 3e. WAREHOUSE BINS
-- -------------------------------------------------------------------------
INSERT INTO warehouse_bins (id, company_id, warehouse_id, code, name, zone, aisle, rack, shelf, max_capacity, is_active)
VALUES
(1,  1, 1, 'A-01-01', 'Aisle A, Rack 1, Shelf 1', 'A-Raw',   'A', '1', '1', 500,  true),
(2,  1, 1, 'A-01-02', 'Aisle A, Rack 1, Shelf 2', 'A-Raw',   'A', '1', '2', 500,  true),
(3,  1, 1, 'B-02-01', 'Aisle B, Rack 2, Shelf 1', 'B-FG',    'B', '2', '1', 300,  true),
(4,  1, 1, 'B-02-02', 'Aisle B, Rack 2, Shelf 2', 'B-FG',    'B', '2', '2', 300,  true),
(5,  1, 1, 'C-03-01', 'Aisle C, Rack 3, Shelf 1', 'C-PACK',  'C', '3', '1', 200,  true),
(6,  1, 2, 'A-01-01', 'East Rack A1-S1',           'Storage', 'A', '1', '1', 400,  true),
(7,  1, 2, 'A-01-02', 'East Rack A1-S2',           'Storage', 'A', '1', '2', 400,  true),
(8,  1, 3, 'W-01-01', 'West Rack W1-S1',           'Storage', 'W', '1', '1', 350,  true),
(9,  1, 3, 'W-01-02', 'West Rack W1-S2',           'Storage', 'W', '1', '2', 350,  true),
(10, 1, 4, 'S-01-01', 'South Rack S1-S1',          'Storage', 'S', '1', '1', 250,  true),
(11, 2, 5, 'EU-A-01', 'European Rack A1',          'General', 'A', '1', NULL, 300,  true);

SELECT setval('warehouse_bins_id_seq', 11);

-- -------------------------------------------------------------------------
-- 3f. PRODUCTS / ITEMS (20 products across categories)
-- -------------------------------------------------------------------------
INSERT INTO products (id, company_id, sku, name, description, unit_price, cost_price, current_stock, reorder_level, created_at, updated_at)
VALUES
(1,  1, 'ELEC-0001', 'AC Induction Motor, 5HP, 3-Phase',
    'Three-phase AC induction motor, 5 horsepower, 230/460V, 1800 RPM, TEFC enclosure. Ideal for industrial conveyor systems and pumps.',
    845.00, 520.00, 48, 10, '2025-01-15', '2025-01-15'),

(2,  1, 'ELEC-0002', 'Servo Drive Controller S3000',
    'Digital servo drive controller, 3kW, EtherCAT communication, integrated safety. Used in precision CNC applications.',
    2190.00, 1380.00, 12, 5, '2025-01-15', '2025-01-15'),

(3,  1, 'ELEC-0003', 'Programmable Logic Controller X100',
    'Compact PLC with 24 digital I/O, 8 analog inputs, Ethernet/IP, Modbus TCP. Expandable via local bus.',
    675.00, 410.00, 35, 10, '2025-02-01', '2025-02-01'),

(4,  1, 'MECH-0001', 'Precision Ball Bearing Set 6205ZZ',
    'Double-shielded deep groove ball bearing, 25mm bore x 52mm OD x 15mm width. Premium steel, C3 clearance.',
    12.50, 6.80, 2000, 200, '2025-01-10', '2025-01-10'),

(5,  1, 'MECH-0002', 'Hydraulic Cylinder, 8" Stroke, 2" Bore',
    'Double-acting hydraulic cylinder, 2500 PSI max, 8-inch stroke, 2-inch bore, with clevis mounts and port fittings.',
    295.00, 178.00, 30, 8, '2025-01-20', '2025-01-20'),

(6,  1, 'MECH-0003', 'Linear Guide Rail Assembly 48"',
    'Profile rail linear guide, 48-inch length, 20mm rail width, with 4 bearing carriages. Pre-loaded and lubricated.',
    420.00, 260.00, 22, 5, '2025-02-05', '2025-02-05'),

(7,  1, 'SAFE-0001', 'Polycarbonate Safety Goggles, Anti-Fog',
    'ANSI Z87.1 rated safety goggles with anti-fog coating, adjustable strap, and indirect ventilation. Clear lens.',
    8.75, 4.20, 500, 100, '2025-01-05', '2025-01-05'),

(8,  1, 'SAFE-0002', 'Industrial Hard Hat, Type I Class E',
    'Full-brim hard hat, Type I Class E (electrical) rated, with 6-point nylon suspension and accessory slot.',
    18.50, 9.80, 350, 50, '2025-01-08', '2025-01-08'),

(9,  1, 'SAFE-0003', 'High-Visibility Safety Vest, Class 3',
    'ANSI/ISEA 107 Class 3 safety vest with 2-inch reflective tape, zipper front, and multiple pockets. Hi-Viz Orange.',
    14.25, 7.50, 800, 100, '2025-01-12', '2025-01-12'),

(10, 1, 'PACK-0001', 'Corrugated Shipping Box 12x12x12 (Pack of 25)',
    'Heavy-duty corrugated cardboard shipping boxes, 32 ECT, 12x12x12 inches, 25 per bundle. Made from 100% recycled content.',
    32.00, 18.50, 400, 50, '2025-01-03', '2025-01-03'),

(11, 1, 'PACK-0002', 'Stretch Wrap 18" x 1000 ft Roll',
    'Machine-grade stretch wrap, 18 inches wide, 1000 feet per roll, 80 gauge. High puncture resistance for pallet wrapping.',
    38.00, 22.00, 120, 20, '2025-01-06', '2025-01-06'),

(12, 1, 'PACK-0003', 'Bubble Cushioning Roll 12" x 175 ft',
    'Small bubble cushioning roll, 12 inches wide, 175 feet length. Ideal for void fill and wrapping fragile items.',
    28.50, 15.00, 90, 15, '2025-01-10', '2025-01-10'),

(13, 1, 'RAW-0001', 'Cold Rolled Steel Sheet, 4x8 ft, 14 Gauge',
    'Cold rolled steel sheet, 4ft x 8ft, 14 gauge (0.075 inch). Commercial quality, suitable for fabrication and stamping.',
    145.00, 95.00, 75, 15, '2025-01-02', '2025-01-02'),

(14, 1, 'RAW-0002', 'Aluminum 6061 Bar, 1" Round x 12 ft',
    'Aluminum 6061-T6 round bar, 1-inch diameter, 12-foot length. Precision extruded, suitable for machining and structural use.',
    62.00, 38.00, 200, 30, '2025-01-04', '2025-01-04'),

(15, 1, 'RAW-0003', 'Stainless Steel Tube, 2" OD x 6 ft, 16 Gauge',
    '304 stainless steel round tube, 2-inch OD, 6-foot length, 16 gauge wall. Welded, annealed, and pickled finish.',
    88.00, 55.00, 60, 10, '2025-01-07', '2025-01-07'),

(16, 1, 'OFF-0001', 'Adjustable Standing Desk, 60"x30"',
    'Electric height-adjustable standing desk, 60x30 inch laminate top, dual motor, memory presets, black frame.',
    595.00, 350.00, 18, 5, '2025-02-10', '2025-02-10'),

(17, 1, 'OFF-0002', 'Ergonomic Mesh Office Chair',
    'High-back ergonomic mesh chair with adjustable lumbar support, headrest, 4D armrests, and tilt-lock mechanism.',
    420.00, 255.00, 25, 5, '2025-02-12', '2025-02-12'),

(18, 1, 'OFF-0003', '27" IPS LED Monitor, 4K UHD',
    '27-inch IPS panel, 3840x2160 4K UHD resolution, USB-C with 65W power delivery, built-in speakers, VESA mountable.',
    450.00, 280.00, 30, 8, '2025-02-15', '2025-02-15'),

(19, 1, 'CHEM-0001', 'Industrial Degreaser Concentrate, 5 gal',
    'Heavy-duty concentrated industrial degreaser, 5-gallon pail. Biodegradable, non-corrosive, dilutes up to 1:20 with water.',
    75.00, 42.00, 40, 10, '2025-01-18', '2025-01-18'),

(20, 1, 'CHEM-0002', 'Lithium Grease EP2, 35 lb Pail',
    'Extreme pressure lithium complex grease, NLGI Grade 2, 35-pound pail. Excellent water resistance and high-temperature stability.',
    110.00, 68.00, 25, 5, '2025-01-22', '2025-01-22');

SELECT setval('products_id_seq', 20);

-- -------------------------------------------------------------------------
-- 3g. PRODUCT-WAREHOUSE STOCK (distribution across warehouses)
-- -------------------------------------------------------------------------
INSERT INTO product_warehouse_stock (id, company_id, product_id, warehouse_id, bin_id, quantity, reserved_quantity, reorder_level)
VALUES
(1,  1, 1,  1, 2,  30,  2, 10),
(2,  1, 1,  2, 6,  12,  0, 5),
(3,  1, 1,  4, 10, 6,   0, 3),
(4,  1, 2,  1, 2,  8,   1, 5),
(5,  1, 2,  2, 6,  4,   0, 2),
(6,  1, 3,  1, 1,  20,  3, 10),
(7,  1, 3,  2, 7,  10,  0, 5),
(8,  1, 3,  3, 8,  5,   0, 3),
(9,  1, 4,  1, 1,  1200, 50, 200),
(10, 1, 4,  2, 6,  600,  20, 100),
(11, 1, 4,  4, 10, 200,  10, 50),
(12, 1, 5,  1, 2,  18,   2, 8),
(13, 1, 5,  3, 8,  12,   0, 5),
(14, 1, 6,  1, 2,  15,   1, 5),
(15, 1, 6,  2, 7,  7,    0, 3),
(16, 1, 7,  1, 1,  300,  20, 100),
(17, 1, 7,  2, 6,  150,  10, 50),
(18, 1, 7,  4, 10, 50,   5, 20),
(19, 1, 8,  1, 1,  200,  15, 50),
(20, 1, 8,  3, 8,  100,  5,  25),
(21, 1, 8,  4, 10, 50,   0,  10),
(22, 1, 9,  1, 1,  500,  30, 100),
(23, 1, 9,  2, 7,  200,  10, 50),
(24, 1, 10, 1, 5,  250,  20, 50),
(25, 1, 10, 2, 6,  100,  5,  25),
(26, 1, 11, 1, 5,  80,   5,  20),
(27, 1, 11, 4, 10, 40,   0,  10),
(28, 1, 12, 1, 5,  60,   5,  15),
(29, 1, 12, 2, 7,  30,   0,  10),
(30, 1, 13, 1, 1,  50,   8,  15),
(31, 1, 13, 2, 6,  25,   2,  5),
(32, 1, 14, 1, 1,  150,  15, 30),
(33, 1, 14, 2, 6,  50,   5,  10),
(34, 1, 15, 1, 2,  40,   5,  10),
(35, 1, 15, 2, 7,  20,   0,  5),
(36, 1, 16, 1, 3,  12,   2,  5),
(37, 1, 16, 2, 7,  6,    0,  3),
(38, 1, 17, 1, 3,  15,   3,  5),
(39, 1, 17, 3, 8,  10,   0,  3),
(40, 1, 18, 1, 3,  20,   5,  8),
(41, 1, 18, 2, 6,  10,   2,  5),
(42, 1, 19, 1, 1,  25,   3,  10),
(43, 1, 19, 4, 10, 15,   0,  5),
(44, 1, 20, 1, 2,  18,   2,  5),
(45, 1, 20, 3, 8,  7,    0,  3);

SELECT setval('product_warehouse_stock_id_seq', 45);

-- -------------------------------------------------------------------------
-- 3h. SUPPLIERS
-- -------------------------------------------------------------------------
INSERT INTO suppliers (id, company_id, name, email, phone, address)
VALUES
(1, 1, 'Precision Components Ltd.',    'orders@precisioncomponents.co.uk',  '+44 121 555 8900',  'Unit 5, Aston Business Park, Birmingham B6 5PS, United Kingdom'),
(2, 1, 'Northern Steel Supply Co.',    'sales@northernsteel.com',           '+1 (412) 555-4900',  '1500 River Road, Pittsburgh, PA 15212, USA'),
(3, 1, 'Global Safety Solutions Inc.','info@globalsafety.com',             '+1 (713) 555-2200',  '8900 Katy Freeway, Suite 300, Houston, TX 77024, USA'),
(4, 1, 'Office Furnishings Direct',   'corporate@officefurnishings.com',   '+1 (616) 555-3800',  '4500 28th Street SE, Grand Rapids, MI 49512, USA'),
(5, 1, 'ChemCorp Industrial AG',      'export@chemcorp.ch',                '+41 61 555 7800',    'Chemiestrasse 22, 4057 Basel, Switzerland'),
(6, 1, 'Pacific Packaging Solutions', 'sales@pacificpack.com',             '+1 (206) 555-6100',  '1200 4th Avenue, Suite 500, Seattle, WA 98101, USA'),
(7, 2, 'EuroTech Automation GmbH',    'vertrieb@eurotech-automation.de',   '+49 89 555 1240',    'Automatisierungsweg 15, 80807 Munchen, Germany'),
(8, 3, 'Apex Industrial Supplies',    'info@apexindustrial.de',            '+49 69 555 3300',    'Gewerbestrasse 8, 60388 Frankfurt am Main, Germany');

SELECT setval('suppliers_id_seq', 8);

-- -------------------------------------------------------------------------
-- 3i. CUSTOMERS
-- -------------------------------------------------------------------------
INSERT INTO customers (id, company_id, name, email, phone, billing_address, shipping_address)
VALUES
(1, 1, 'BuildRite Construction LLC',        'ap@buildrite.com',          '+1 (212) 555-4200',
    '350 Fifth Avenue, 34th Floor, New York, NY 10118, USA',
    '1200 Construction Way, Newark, NJ 07102, USA'),
(2, 1, 'TechFlow Systems Inc.',            'procurement@techflow.com',  '+1 (512) 555-8700',
    '800 Congress Avenue, Suite 200, Austin, TX 78701, USA',
    '8900 Technology Boulevard, Austin, TX 78758, USA'),
(3, 1, 'MedEquip Distributors LLC',        'purchasing@medequip.com',   '+1 (612) 555-3400',
    '100 Washington Avenue S, Suite 700, Minneapolis, MN 55401, USA',
    '4500 Industrial Drive, Minneapolis, MN 55430, USA'),
(4, 1, 'Aurora Automotive Parts MFG',      'supplychain@auroraauto.com','+1 (313) 555-6200',
    '1 Renaissance Center, Suite 1500, Detroit, MI 48243, USA',
    '7800 Manufacturing Row, Sterling Heights, MI 48312, USA'),
(5, 1, 'GreenField Agriculture Co.',       'orders@greenfieldag.com',   '+1 (559) 555-2300',
    '2440 Tulare Street, Suite 400, Fresno, CA 93721, USA',
    '15500 South Elm Avenue, Fresno, CA 93706, USA'),
(6, 1, 'Marine & Offshore Engineering Pte','procurement@marineoffshore.sg','+65 6789 0123',
    '12 Maritime Square, #10-01, Singapore 099356',
    '45 Shipyard Road, Singapore 628140'),
(7, 1, 'North American Defense Contractors','contracts@nadc.com',       '+1 (202) 555-8800',
    '1100 Pennsylvania Avenue NW, Suite 800, Washington, DC 20004, USA',
    '8800 Defense Highway, Arlington, VA 22202, USA'),
(8, 1, 'Food Processing Technologies Inc.','buyer@foodprotech.com',     '+1 (312) 555-6600',
    '233 South Wacker Drive, Suite 600, Chicago, IL 60606, USA',
    '5600 Food Processing Way, Joliet, IL 60431, USA');

SELECT setval('customers_id_seq', 8);

-- -------------------------------------------------------------------------
-- 3j. EXPENSE CATEGORIES
-- -------------------------------------------------------------------------
INSERT INTO expense_categories (id, company_id, name, description, is_active)
VALUES
(1, 1, 'Travel & Accommodation',   'Business travel, hotel stays, and transportation',           true),
(2, 1, 'Office Rent & Leasing',    'Monthly office rent and equipment leasing fees',              true),
(3, 1, 'IT & Software Subscriptions','Cloud services, software licenses, and IT maintenance',     true),
(4, 1, 'Employee Training',        'Workshops, certifications, and professional development',     true),
(5, 1, 'Utilities & Telecom',      'Electricity, water, internet, and phone services',            true),
(6, 1, 'Shipping & Logistics',     'Freight charges, courier services, and customs brokerage',    true);

SELECT setval('expense_categories_id_seq', 6);

-- -------------------------------------------------------------------------
-- 3k. ASSET CATEGORIES
-- -------------------------------------------------------------------------
INSERT INTO asset_categories (id, company_id, code, name, default_depreciation_method, default_useful_life, is_active)
VALUES
(1, 1, 'COMP', 'Computer & IT Equipment',   'straight_line', 5,  true),
(2, 1, 'MACH', 'Machinery & Equipment',     'straight_line', 12, true),
(3, 1, 'VEH',  'Vehicles',                  'straight_line', 8,  true),
(4, 1, 'FURN', 'Furniture & Fixtures',      'straight_line', 7,  true),
(5, 1, 'BUILD','Buildings & Improvements',  'straight_line', 30, true);

SELECT setval('asset_categories_id_seq', 5);

-- -------------------------------------------------------------------------
-- 3l. EMPLOYEES
-- -------------------------------------------------------------------------
INSERT INTO employees (id, company_id, employee_code, first_name, last_name, email, phone,
  date_of_birth, gender, address, city, state, postal_code, country,
  department, position, hire_date, employment_type, salary,
  bank_name, bank_account_no, bank_routing_no,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relation, status, created_by)
SELECT
  1, 1, 'EMP-0001', 'John',   'Harrison',   'john.harrison@acmemfg.com',   '+1 (312) 555-1001',
  '1975-03-12', 'Male',   '1200 Lake Shore Drive, Apt 15B', 'Chicago', 'IL', '60610', 'USA',
  'Executive',       'Chief Executive Officer',             '2020-01-06', 'Full-time', 225000.00,
  'Chase Bank',               'XXXX1234', '021000021',
  'Mary Harrison', '+1 (312) 555-9001', 'Spouse',  'active', id FROM users ORDER BY id LIMIT 1;

INSERT INTO employees (id, company_id, employee_code, first_name, last_name, email, phone,
  date_of_birth, gender, address, city, state, postal_code, country,
  department, position, hire_date, employment_type, salary,
  bank_name, bank_account_no, bank_routing_no,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relation, status, created_by)
SELECT
  2, 1, 'EMP-0002', 'Sarah',  'Chen',        'sarah.chen@acmemfg.com',     '+1 (312) 555-1002',
  '1982-07-24', 'Female', '850 North Michigan Ave, Suite 2200', 'Chicago', 'IL', '60611', 'USA',
  'Finance',         'Chief Financial Officer',              '2020-01-06', 'Full-time', 195000.00,
  'Bank of America',          'XXXX5678', '026009593',
  'David Chen',   '+1 (312) 555-9002', 'Spouse',  'active', id FROM users ORDER BY id LIMIT 1;

INSERT INTO employees (id, company_id, employee_code, first_name, last_name, email, phone,
  date_of_birth, gender, address, city, state, postal_code, country,
  department, position, hire_date, employment_type, salary,
  bank_name, bank_account_no, bank_routing_no,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relation, status, created_by)
SELECT
  3, 1, 'EMP-0003', 'Michael', 'Patel',       'michael.patel@acmemfg.com', '+1 (312) 555-1003',
  '1979-11-08', 'Male',   '200 North Columbus Drive, Apt 3100', 'Chicago', 'IL', '60601', 'USA',
  'Operations',      'VP of Operations',                      '2020-03-01', 'Full-time', 175000.00,
  'Chase Bank',               'XXXX9012', '021000021',
  'Anita Patel',  '+1 (312) 555-9003', 'Spouse',  'active', id FROM users ORDER BY id LIMIT 1;

INSERT INTO employees (id, company_id, employee_code, first_name, last_name, email, phone,
  date_of_birth, gender, address, city, state, postal_code, country,
  department, position, hire_date, employment_type, salary,
  bank_name, bank_account_no, bank_routing_no,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relation, status, created_by)
SELECT
  4, 1, 'EMP-0004', 'Emily',  'Rodriguez',   'emily.rodriguez@acmemfg.com','+1 (312) 555-1004',
  '1985-05-19', 'Female', '750 West Van Buren Street, Apt 1805', 'Chicago', 'IL', '60607', 'USA',
  'Human Resources', 'HR Director',                             '2020-04-15', 'Full-time', 125000.00,
  'Citibank',               'XXXX3456', '071009140',
  'Carlos Rodriguez', '+1 (312) 555-9004', 'Spouse',  'active', id FROM users ORDER BY id LIMIT 1;

INSERT INTO employees (id, company_id, employee_code, first_name, last_name, email, phone,
  date_of_birth, gender, address, city, state, postal_code, country,
  department, position, hire_date, employment_type, salary,
  bank_name, bank_account_no, bank_routing_no,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relation, status, created_by)
SELECT
  5, 1, 'EMP-0005', 'David',  'Kim',         'david.kim@acmemfg.com',     '+1 (312) 555-1005',
  '1988-09-30', 'Male',   '1000 West Monroe Street, Unit 4B', 'Chicago', 'IL', '60607', 'USA',
  'Information Technology', 'IT Manager',                       '2020-06-01', 'Full-time', 115000.00,
  'PNC Bank',               'XXXX7890', '041000124',
  'Jennifer Kim', '+1 (312) 555-9005', 'Spouse',  'active', id FROM users ORDER BY id LIMIT 1;

INSERT INTO employees (id, company_id, employee_code, first_name, last_name, email, phone,
  date_of_birth, gender, address, city, state, postal_code, country,
  department, position, hire_date, employment_type, salary,
  bank_name, bank_account_no, bank_routing_no,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relation, status, created_by)
SELECT
  6, 1, 'EMP-0006', 'Lisa',   'Thompson',    'lisa.thompson@acmemfg.com', '+1 (312) 555-1006',
  '1990-02-14', 'Female', '550 West Madison Street, Apt 2905', 'Chicago', 'IL', '60661', 'USA',
  'Sales',           'Sales Manager',                            '2021-01-10', 'Full-time', 105000.00,
  'Chase Bank',               'XXXX1112', '021000021',
  'Robert Thompson', '+1 (312) 555-9006', 'Spouse',  'active', id FROM users ORDER BY id LIMIT 1;

INSERT INTO employees (id, company_id, employee_code, first_name, last_name, email, phone,
  date_of_birth, gender, address, city, state, postal_code, country,
  department, position, hire_date, employment_type, salary,
  bank_name, bank_account_no, bank_routing_no,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relation, status, created_by)
SELECT
  7, 1, 'EMP-0007', 'Robert', 'Martinez',    'robert.martinez@acmemfg.com','+1 (312) 555-1007',
  '1987-08-22', 'Male',   '4500 South Ashland Avenue, Unit 12', 'Chicago', 'IL', '60609', 'USA',
  'Warehouse',       'Warehouse Supervisor',                    '2021-03-15', 'Full-time', 78000.00,
  'Bank of America',          'XXXX1314', '026009593',
  'Sofia Martinez','+1 (312) 555-9007', 'Spouse',  'active', id FROM users ORDER BY id LIMIT 1;

INSERT INTO employees (id, company_id, employee_code, first_name, last_name, email, phone,
  date_of_birth, gender, address, city, state, postal_code, country,
  department, position, hire_date, employment_type, salary,
  bank_name, bank_account_no, bank_routing_no,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relation, status, created_by)
SELECT
  8, 1, 'EMP-0008', 'Amanda', 'Williams',    'amanda.williams@acmemfg.com','+1 (312) 555-1008',
  '1992-11-05', 'Female', '225 West Washington Street, Apt 8C', 'Chicago', 'IL', '60606', 'USA',
  'Finance',         'Accounts Payable Specialist',             '2021-06-20', 'Full-time', 58000.00,
  'Harris Bank',              'XXXX1516', '071000288',
  'Sarah Williams','+1 (312) 555-9008', 'Mother',  'active', id FROM users ORDER BY id LIMIT 1;

INSERT INTO employees (id, company_id, employee_code, first_name, last_name, email, phone,
  date_of_birth, gender, address, city, state, postal_code, country,
  department, position, hire_date, employment_type, salary,
  bank_name, bank_account_no, bank_routing_no,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relation, status, created_by)
SELECT
  9, 1, 'EMP-0009', 'James',  'Wilson',      'james.wilson@acmemfg.com',  '+1 (312) 555-1009',
  '1984-06-17', 'Male',   '1800 North Clybourn Avenue, Unit 3A', 'Chicago', 'IL', '60614', 'USA',
  'Procurement',     'Purchasing Manager',                      '2022-01-10', 'Full-time', 92000.00,
  'Chase Bank',               'XXXX1718', '021000021',
  'Laura Wilson', '+1 (312) 555-9009', 'Spouse',  'active', id FROM users ORDER BY id LIMIT 1;

INSERT INTO employees (id, company_id, employee_code, first_name, last_name, email, phone,
  date_of_birth, gender, address, city, state, postal_code, country,
  department, position, hire_date, employment_type, salary,
  bank_name, bank_account_no, bank_routing_no,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relation, status, created_by)
SELECT
  10, 1, 'EMP-0010', 'Maria',  'Garcia',      'maria.garcia@acmemfg.com', '+1 (312) 555-1010',
  '1991-04-28', 'Female', '3200 West 47th Street, Apt 2B', 'Chicago', 'IL', '60632', 'USA',
  'Manufacturing',   'Production Supervisor',                 '2022-04-05', 'Full-time', 72000.00,
  'Fifth Third Bank',         'XXXX1920', '042000314',
  'Jose Garcia',  '+1 (312) 555-9010', 'Spouse',  'active', id FROM users ORDER BY id LIMIT 1;

SELECT setval('employees_id_seq', 10);

-- -------------------------------------------------------------------------
-- 3m. LEAVE TYPES
-- -------------------------------------------------------------------------
INSERT INTO leave_types (id, company_id, name, code, default_days, is_paid, requires_approval, is_active)
VALUES
(1, 1, 'Annual Leave',  'AL', 20, true,  true,  true),
(2, 1, 'Sick Leave',    'SL', 12, true,  true,  true),
(3, 1, 'Casual Leave',  'CL', 5,  true,  true,  true),
(4, 1, 'Public Holiday','PH', 0,  true,  false, true),
(5, 1, 'Unpaid Leave',  'UL', 0,  false, true,  true);

SELECT setval('leave_types_id_seq', 5);

-- -------------------------------------------------------------------------
-- 3n. RETURN REASONS
-- -------------------------------------------------------------------------
INSERT INTO return_reasons (id, company_id, reason_code, reason_name, category, is_active)
VALUES
(1, 1, 'DEFECTIVE',    'Defective or Damaged Product',        'both',   true),
(2, 1, 'WRONG_ITEM',   'Wrong Item Shipped',                  'both',   true),
(3, 1, 'CUSTOMER_REQ', 'Customer Request / Change of Mind',   'sales',  true),
(4, 1, 'QUALITY_ISSUE','Incoming Quality Rejection',          'purchase',true),
(5, 1, 'EXPIRED',      'Product Expired or Perishable Loss',  'both',   true),
(6, 1, 'TRANSIT_DAMAGE','Damaged During Transit',             'both',   true);

SELECT setval('return_reasons_id_seq', 6);

-- -------------------------------------------------------------------------
-- 3o. SERVICES
-- -------------------------------------------------------------------------
INSERT INTO services (id, company_id, name, description, category, unit_price, tax_percent, is_active, created_by)
SELECT
  1, 1, 'Equipment Installation Service',    'On-site installation and commissioning of industrial equipment',         'Installation',       1500.00, 8.25, true, id FROM users ORDER BY id LIMIT 1;
INSERT INTO services (id, company_id, name, description, category, unit_price, tax_percent, is_active, created_by)
SELECT
  2, 1, 'Preventive Maintenance Contract',   'Annual preventive maintenance agreement for production machinery',      'Maintenance',        4500.00, 8.25, true, id FROM users ORDER BY id LIMIT 1;
INSERT INTO services (id, company_id, name, description, category, unit_price, tax_percent, is_active, created_by)
SELECT
  3, 1, 'Equipment Repair Labor (per hour)', 'Hourly rate for diagnostic and repair services by certified technicians','Repair',              175.00, 8.25, true, id FROM users ORDER BY id LIMIT 1;
INSERT INTO services (id, company_id, name, description, category, unit_price, tax_percent, is_active, created_by)
SELECT
  4, 1, 'Technical Support (annual plan)',   'Priority phone and remote support with 4-hour response SLA',            'Support',            2500.00, 8.25, true, id FROM users ORDER BY id LIMIT 1;

SELECT setval('services_id_seq', 4);

-- -------------------------------------------------------------------------
-- 3p. COST CENTERS
-- -------------------------------------------------------------------------
INSERT INTO cost_centers (id, company_id, code, name, description, is_active, created_by)
SELECT
  1, 1, 'CC-EXEC',  'Executive Office',         'Executive leadership and administration',     true, id FROM users ORDER BY id LIMIT 1;
INSERT INTO cost_centers (id, company_id, code, name, description, is_active, created_by)
SELECT
  2, 1, 'CC-MFG',   'Manufacturing Floor',      'Production and assembly operations',          true, id FROM users ORDER BY id LIMIT 1;
INSERT INTO cost_centers (id, company_id, code, name, description, is_active, created_by)
SELECT
  3, 1, 'CC-WH',    'Warehouse & Logistics',    'Inventory storage, receiving, and shipping',  true, id FROM users ORDER BY id LIMIT 1;
INSERT INTO cost_centers (id, company_id, code, name, description, is_active, created_by)
SELECT
  4, 1, 'CC-SALES',  'Sales & Marketing',        'Customer acquisition and relationship mgmt',  true, id FROM users ORDER BY id LIMIT 1;
INSERT INTO cost_centers (id, company_id, code, name, description, is_active, created_by)
SELECT
  5, 1, 'CC-IT',     'Information Technology',   'IT infrastructure, software, and support',    true, id FROM users ORDER BY id LIMIT 1;
INSERT INTO cost_centers (id, company_id, code, name, description, is_active, created_by)
SELECT
  6, 1, 'CC-FIN',    'Finance & Accounting',     'Financial operations and reporting',          true, id FROM users ORDER BY id LIMIT 1;

SELECT setval('cost_centers_id_seq', 6);

-- =============================================================================
-- PART 4: INSERT TRANSACTIONAL DATA
-- =============================================================================

-- -------------------------------------------------------------------------
-- 4a. PURCHASE ORDERS & LINES
-- -------------------------------------------------------------------------

-- PO-001: Raw materials from Northern Steel (sent status)
INSERT INTO purchase_orders (id, company_id, supplier_id, po_number, order_date, status,
    subtotal, tax_total, grand_total, notes, expected_delivery_date, warehouse_id, payment_status, created_by)
SELECT 1, 1, 2, 'PO-2026-0001', '2026-01-10', 'received',
    12580.00, 1037.85, 13617.85, 'Quarterly steel order for Q1 production schedule.', '2026-01-25', 1, 'paid', id FROM users ORDER BY id LIMIT 1;

INSERT INTO purchase_order_items (id, purchase_order_id, product_id, quantity, unit_price, total, received_quantity)
VALUES
(1, 1, 13, 50,  95.00,  4750.00, 50),
(2, 1, 14, 100, 38.00,  3800.00, 100),
(3, 1, 15, 40,  55.00,  2200.00, 40);

UPDATE purchase_order_items SET unit_price = 95.00, total = 4750.00 WHERE id = 1;
UPDATE purchase_orders SET total_amount = (SELECT SUM(total) FROM purchase_order_items WHERE purchase_order_id = 1) WHERE id = 1;

-- PO-002: Electronic components from Precision Components (sent status)
INSERT INTO purchase_orders (id, company_id, supplier_id, po_number, order_date, status,
    subtotal, tax_total, grand_total, notes, expected_delivery_date, warehouse_id, payment_status, created_by)
SELECT 2, 1, 1, 'PO-2026-0002', '2026-01-15', 'sent',
    12330.00, 1017.23, 13347.23, 'Servo drives and motors for production line automation.', '2026-02-10', 1, 'unpaid', id FROM users ORDER BY id LIMIT 1;

INSERT INTO purchase_order_items (id, purchase_order_id, product_id, quantity, unit_price, total, received_quantity)
VALUES
(4, 2, 2, 4,  1380.00,  5520.00, 0),
(5, 2, 3, 10, 410.00,   4100.00, 0),
(6, 2, 1, 5,  520.00,   2600.00, 0);

UPDATE purchase_orders SET total_amount = (SELECT SUM(total) FROM purchase_order_items WHERE purchase_order_id = 2) WHERE id = 2;

-- PO-003: Safety equipment from Global Safety (draft status)
INSERT INTO purchase_orders (id, company_id, supplier_id, po_number, order_date, status,
    subtotal, tax_total, grand_total, notes, expected_delivery_date, warehouse_id, payment_status, created_by)
SELECT 3, 1, 3, 'PO-2026-0003', '2026-02-01', 'draft',
    4410.00, 363.82, 4773.82, 'Annual safety equipment replenishment for all facilities.', '2026-02-20', 1, 'unpaid', id FROM users ORDER BY id LIMIT 1;

INSERT INTO purchase_order_items (id, purchase_order_id, product_id, quantity, unit_price, total, received_quantity)
VALUES
(7, 3, 7,  300, 4.20,   1260.00, 0),
(8, 3, 8,  150, 9.80,   1470.00, 0),
(9, 3, 9,  200, 7.50,   1500.00, 0);

UPDATE purchase_orders SET total_amount = (SELECT SUM(total) FROM purchase_order_items WHERE purchase_order_id = 3) WHERE id = 3;

-- PO-004: Packaging from Pacific Packaging (received status)
INSERT INTO purchase_orders (id, company_id, supplier_id, po_number, order_date, status,
    subtotal, tax_total, grand_total, notes, expected_delivery_date, warehouse_id, payment_status, created_by)
SELECT 4, 1, 6, 'PO-2026-0004', '2026-02-05', 'received',
    3850.00, 317.62, 4167.62, 'Packaging materials for finished goods shipping.', '2026-02-15', 4, 'paid', id FROM users ORDER BY id LIMIT 1;

INSERT INTO purchase_order_items (id, purchase_order_id, product_id, quantity, unit_price, total, received_quantity)
VALUES
(10, 4, 10, 100, 18.50, 1850.00, 100),
(11, 4, 11, 50,  22.00, 1100.00, 50),
(12, 4, 12, 60,  15.00, 900.00,  60);

UPDATE purchase_orders SET total_amount = (SELECT SUM(total) FROM purchase_order_items WHERE purchase_order_id = 4) WHERE id = 4;

-- PO-005: Chemicals from ChemCorp (sent)
INSERT INTO purchase_orders (id, company_id, supplier_id, po_number, order_date, status,
    subtotal, tax_total, grand_total, notes, expected_delivery_date, warehouse_id, payment_status, created_by)
SELECT 5, 1, 5, 'PO-2026-0005', '2026-03-01', 'sent',
    2360.00, 194.70, 2554.70, 'Industrial chemicals for Q2 production.', '2026-03-20', 1, 'unpaid', id FROM users ORDER BY id LIMIT 1;

INSERT INTO purchase_order_items (id, purchase_order_id, product_id, quantity, unit_price, total, received_quantity)
VALUES
(13, 5, 19, 30, 42.00, 1260.00, 0),
(14, 5, 20, 15, 68.00, 1020.00, 0);

UPDATE purchase_orders SET total_amount = (SELECT SUM(total) FROM purchase_order_items WHERE purchase_order_id = 5) WHERE id = 5;

SELECT setval('purchase_orders_id_seq', 5);
SELECT setval('purchase_order_items_id_seq', 14);

-- -------------------------------------------------------------------------
-- 4b. SALES ORDERS & LINES
-- -------------------------------------------------------------------------

-- SO-001: BuildRite Construction - Motors and mechanical components
INSERT INTO sales_orders (id, company_id, customer_id, order_number, order_date, status,
    subtotal, tax_total, grand_total, notes, warehouse_id, payment_status, created_by)
SELECT 1, 1, 1, 'SO-2026-0001', '2026-01-20', 'shipped',
    3880.00, 320.10, 4200.10, 'Rush order for conveyor system installation. Deliver to Newark.', 2, 'unpaid', id FROM users ORDER BY id LIMIT 1;

INSERT INTO sales_order_items (id, sales_order_id, product_id, quantity, unit_price, discount_percent, total)
VALUES
(1, 1, 1, 3, 845.00, 0.00, 2535.00),
(2, 1, 5, 4, 295.00, 5.00, 1121.00),
(3, 1, 4, 10, 12.50, 0.00, 125.00);

UPDATE sales_orders SET grand_total = subtotal + tax_total WHERE id = 1;

-- SO-002: TechFlow Systems - Office equipment and electronics
INSERT INTO sales_orders (id, company_id, customer_id, order_number, order_date, status,
    subtotal, tax_total, grand_total, notes, warehouse_id, payment_status, created_by)
SELECT 2, 1, 2, 'SO-2026-0002', '2026-02-01', 'confirmed',
    11705.00, 965.66, 12670.66, 'New office setup order - deliver to Austin HQ.', 3, 'unpaid', id FROM users ORDER BY id LIMIT 1;

INSERT INTO sales_order_items (id, sales_order_id, product_id, quantity, unit_price, discount_percent, total)
VALUES
(4, 2, 3,  5,  675.00, 0.00, 3375.00),
(5, 2, 16, 8,  595.00, 10.00, 4284.00),
(6, 2, 17, 10, 420.00, 10.00, 3780.00);

UPDATE sales_orders SET grand_total = subtotal + tax_total WHERE id = 2;

-- SO-003: MedEquip - Safety and packaging supplies
INSERT INTO sales_orders (id, company_id, customer_id, order_number, order_date, status,
    subtotal, tax_total, grand_total, notes, warehouse_id, payment_status, created_by)
SELECT 3, 1, 3, 'SO-2026-0003', '2026-02-10', 'draft',
    4177.50, 344.64, 4522.14, 'Regular supply order for distribution network.', 1, 'unpaid', id FROM users ORDER BY id LIMIT 1;

INSERT INTO sales_order_items (id, sales_order_id, product_id, quantity, unit_price, discount_percent, total)
VALUES
(7,  3, 7,  100, 8.75,  0.00, 875.00),
(8,  3, 8,  50,  18.50, 0.00, 925.00),
(9,  3, 9,  100, 14.25, 5.00, 1353.75),
(10, 3, 10, 30,  32.00, 0.00, 960.00);

UPDATE sales_orders SET grand_total = subtotal + tax_total WHERE id = 3;

-- SO-004: Aurora Automotive - Manufacturing components
INSERT INTO sales_orders (id, company_id, customer_id, order_number, order_date, status,
    subtotal, tax_total, grand_total, notes, warehouse_id, payment_status, created_by)
SELECT 4, 1, 4, 'SO-2026-0004', '2026-02-15', 'confirmed',
    22460.00, 1852.95, 24312.95, 'Production line upgrade order - partial delivery expected.', 1, 'unpaid', id FROM users ORDER BY id LIMIT 1;

INSERT INTO sales_order_items (id, sales_order_id, product_id, quantity, unit_price, discount_percent, total)
VALUES
(11, 4, 2,  3, 2190.00, 0.00, 6570.00),
(12, 4, 6,  8,  420.00, 0.00, 3360.00),
(13, 4, 13, 50, 145.00, 5.00, 6887.50),
(14, 4, 14, 80,  62.00, 5.00, 4712.00);

UPDATE sales_orders SET grand_total = subtotal + tax_total WHERE id = 4;

-- SO-005: GreenField Agriculture - Motors and chemicals
INSERT INTO sales_orders (id, company_id, customer_id, order_number, order_date, status,
    subtotal, tax_total, grand_total, notes, warehouse_id, payment_status, created_by)
SELECT 5, 1, 5, 'SO-2026-0005', '2026-03-01', 'draft',
    5650.00, 466.12, 6116.12, 'Irrigation pump motors and maintenance chemicals.', 4, 'unpaid', id FROM users ORDER BY id LIMIT 1;

INSERT INTO sales_order_items (id, sales_order_id, product_id, quantity, unit_price, discount_percent, total)
VALUES
(15, 5, 1,  4, 845.00, 0.00, 3380.00),
(16, 5, 19, 6,  75.00, 0.00, 450.00),
(17, 5, 20, 8, 110.00, 0.00, 880.00);

UPDATE sales_orders SET grand_total = subtotal + tax_total WHERE id = 5;

SELECT setval('sales_orders_id_seq', 5);
SELECT setval('sales_order_items_id_seq', 17);

-- -------------------------------------------------------------------------
-- 4c. INVENTORY TRANSACTIONS
-- -------------------------------------------------------------------------
INSERT INTO inventory_transactions (id, product_id, type, quantity, reference_type, reference_id, warehouse_id, notes, created_by)
SELECT 1,  1,  'in',  30, 'purchase_order', 1, 1, 'Received PO-2026-0001 - steel order', id FROM users ORDER BY id LIMIT 1;
INSERT INTO inventory_transactions (id, product_id, type, quantity, reference_type, reference_id, warehouse_id, notes, created_by)
SELECT 2,  14, 'in',  100, 'purchase_order', 1, 1, 'Received PO-2026-0001 - aluminum bars', id FROM users ORDER BY id LIMIT 1;
INSERT INTO inventory_transactions (id, product_id, type, quantity, reference_type, reference_id, warehouse_id, notes, created_by)
SELECT 3,  15, 'in',  40, 'purchase_order',  1, 1, 'Received PO-2026-0001 - steel tubes', id FROM users ORDER BY id LIMIT 1;
INSERT INTO inventory_transactions (id, product_id, type, quantity, reference_type, reference_id, warehouse_id, notes, created_by)
SELECT 4,  13, 'in',  50, 'purchase_order',  1, 1, 'Received PO-2026-0001 - steel sheets', id FROM users ORDER BY id LIMIT 1;
INSERT INTO inventory_transactions (id, product_id, type, quantity, reference_type, reference_id, warehouse_id, notes, created_by)
SELECT 5,  1,  'out', 3,  'sales_order',     1, 2, 'Shipped SO-2026-0001 to BuildRite', id FROM users ORDER BY id LIMIT 1;
INSERT INTO inventory_transactions (id, product_id, type, quantity, reference_type, reference_id, warehouse_id, notes, created_by)
SELECT 6,  5,  'out', 4,  'sales_order',     1, 2, 'Shipped SO-2026-0001 to BuildRite', id FROM users ORDER BY id LIMIT 1;
INSERT INTO inventory_transactions (id, product_id, type, quantity, reference_type, reference_id, warehouse_id, notes, created_by)
SELECT 7,  4,  'out', 10, 'sales_order',     1, 2, 'Shipped SO-2026-0001 to BuildRite', id FROM users ORDER BY id LIMIT 1;
INSERT INTO inventory_transactions (id, product_id, type, quantity, reference_type, reference_id, warehouse_id, notes, created_by)
SELECT 8,  10, 'in',  100, 'purchase_order', 4, 4, 'Received PO-2026-0004 - packaging boxes', id FROM users ORDER BY id LIMIT 1;
INSERT INTO inventory_transactions (id, product_id, type, quantity, reference_type, reference_id, warehouse_id, notes, created_by)
SELECT 9,  11, 'in',  50, 'purchase_order',  4, 4, 'Received PO-2026-0004 - stretch wrap', id FROM users ORDER BY id LIMIT 1;
INSERT INTO inventory_transactions (id, product_id, type, quantity, reference_type, reference_id, warehouse_id, notes, created_by)
SELECT 10, 12, 'in',  60, 'purchase_order',  4, 4, 'Received PO-2026-0004 - bubble rolls', id FROM users ORDER BY id LIMIT 1;
INSERT INTO inventory_transactions (id, product_id, type, quantity, reference_type, reference_id, warehouse_id, notes, created_by)
SELECT 11, 4,  'adjustment', 10, 'cycle_count', NULL, 1, 'Cycle count adjustment - found 10 extra units in bin A-01-01', id FROM users ORDER BY id LIMIT 1;

SELECT setval('inventory_transactions_id_seq', 11);

-- -------------------------------------------------------------------------
-- 4d. INVOICES & ITEMS
-- -------------------------------------------------------------------------

-- INV-001: Invoice for SO-001 (BuildRite) - partially paid
INSERT INTO invoices (id, company_id, invoice_number, sales_order_id, customer_id, invoice_date, due_date,
    status, subtotal, tax_total, discount_total, grand_total, amount_paid, payment_terms, notes, created_by)
SELECT 1, 1, 'INV-2026-0001', 1, 1, '2026-01-25', '2026-02-24',
    'sent', 3880.00, 320.10, 98.75, 4200.10, 0.00, 'Net 30', 'Invoice for conveyor system components per SO-2026-0001', id FROM users ORDER BY id LIMIT 1;

INSERT INTO invoice_items (id, invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total)
VALUES
(1, 1, 1, 'AC Induction Motor, 5HP, 3-Phase',       3,  845.00,  0.00, 8.25, 2535.00),
(2, 1, 5, 'Hydraulic Cylinder, 8" Stroke, 2" Bore', 4,  295.00,  5.00, 8.25, 1121.00),
(3, 1, 4, 'Precision Ball Bearing Set 6205ZZ',      10, 12.50,   0.00, 8.25, 125.00);

-- INV-002: Invoice for SO-002 (TechFlow) - unpaid
INSERT INTO invoices (id, company_id, invoice_number, sales_order_id, customer_id, invoice_date, due_date,
    status, subtotal, tax_total, discount_total, grand_total, amount_paid, payment_terms, notes, created_by)
SELECT 2, 1, 'INV-2026-0002', 2, 2, '2026-02-05', '2026-03-07',
    'sent', 11705.00, 965.66, 979.00, 12670.66, 0.00, 'Net 30', 'Office equipment and PLCs for new Austin facility', id FROM users ORDER BY id LIMIT 1;

INSERT INTO invoice_items (id, invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total)
VALUES
(4, 2, 3,  'Programmable Logic Controller X100',  5,  675.00,  0.00, 8.25, 3375.00),
(5, 2, 16, 'Adjustable Standing Desk, 60"x30"',    8,  595.00, 10.00, 8.25, 4284.00),
(6, 2, 17, 'Ergonomic Mesh Office Chair',          10, 420.00, 10.00, 8.25, 3780.00);

-- INV-003: Invoice for SO-003 (MedEquip) - draft
INSERT INTO invoices (id, company_id, invoice_number, sales_order_id, customer_id, invoice_date, due_date,
    status, subtotal, tax_total, discount_total, grand_total, amount_paid, payment_terms, notes, created_by)
SELECT 3, 1, 'INV-2026-0003', 3, 3, '2026-02-15', '2026-03-17',
    'draft', 4177.50, 344.64, 71.25, 4522.14, 0.00, 'Net 30', 'Safety and packaging supplies - scheduled delivery', id FROM users ORDER BY id LIMIT 1;

INSERT INTO invoice_items (id, invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total)
VALUES
(7, 3, 7,  'Polycarbonate Safety Goggles, Anti-Fog',  100, 8.75,   0.00, 8.25, 875.00),
(8, 3, 8,  'Industrial Hard Hat, Type I Class E',      50,  18.50,  0.00, 8.25, 925.00),
(9, 3, 9,  'High-Visibility Safety Vest, Class 3',     100, 14.25,  5.00, 8.25, 1353.75),
(10, 3, 10, 'Corrugated Shipping Box 12x12x12 (Pack of 25)', 30, 32.00, 0.00, 8.25, 960.00);

-- INV-004: Invoice for SO-004 (Aurora Automotive) - unpaid
INSERT INTO invoices (id, company_id, invoice_number, sales_order_id, customer_id, invoice_date, due_date,
    status, subtotal, tax_total, discount_total, grand_total, amount_paid, payment_terms, notes, created_by)
SELECT 4, 1, 'INV-2026-0004', 4, 4, '2026-02-20', '2026-03-22',
    'sent', 22460.00, 1852.95, 580.00, 24312.95, 0.00, 'Net 30', 'Production line equipment per SO-2026-0004', id FROM users ORDER BY id LIMIT 1;

INSERT INTO invoice_items (id, invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total)
VALUES
(11, 4, 2,  'Servo Drive Controller S3000',           3,  2190.00,  0.00, 8.25, 6570.00),
(12, 4, 6,  'Linear Guide Rail Assembly 48"',          8,  420.00,   0.00, 8.25, 3360.00),
(13, 4, 13, 'Cold Rolled Steel Sheet, 4x8 ft, 14 Gauge',  50, 145.00,  5.00, 8.25, 6887.50),
(14, 4, 14, 'Aluminum 6061 Bar, 1" Round x 12 ft',    80, 62.00,    5.00, 8.25, 4712.00);

SELECT setval('invoices_id_seq', 4);
SELECT setval('invoice_items_id_seq', 14);

-- -------------------------------------------------------------------------
-- 4e. PAYMENTS
-- -------------------------------------------------------------------------
-- PMT-001: Partial payment for INV-001
INSERT INTO payments (id, company_id, invoice_id, payment_number, payment_date, amount,
    payment_method, reference_number, notes, created_by)
SELECT 1, 1, 1, 'PMT-2026-0001', '2026-02-10', 2000.00,
    'Wire Transfer', 'WIRE-20260210-3421', 'Partial payment for INV-2026-0001', id FROM users ORDER BY id LIMIT 1;

UPDATE invoices SET amount_paid = 2000.00 WHERE id = 1;

-- PMT-002: Full payment for PO-001 supplier invoice
INSERT INTO payments (id, company_id, invoice_id, payment_number, payment_date, amount,
    payment_method, reference_number, notes, created_by)
SELECT 2, 1, NULL, 'PMT-2026-0002', '2026-02-05', 13617.85,
    'ACH', 'ACH-20260205-8890', 'Payment for PO-2026-0001 - Northern Steel', id FROM users ORDER BY id LIMIT 1;

-- PMT-003: Payment for PO-004
INSERT INTO payments (id, company_id, invoice_id, payment_number, payment_date, amount,
    payment_method, reference_number, notes, created_by)
SELECT 3, 1, NULL, 'PMT-2026-0003', '2026-02-20', 4167.62,
    'Credit Card', 'CC-20260220-4521', 'Payment for PO-2026-0004 - Pacific Packaging', id FROM users ORDER BY id LIMIT 1;

SELECT setval('payments_id_seq', 3);

-- -------------------------------------------------------------------------
-- 4f. JOURNAL ENTRIES & LINES (double-entry accounting)
-- -------------------------------------------------------------------------

-- JE-001: Record PO-001 receipt (raw materials received)
INSERT INTO journal_entries (id, company_id, entry_date, voucher_no, voucher_type,
    total_debit, total_credit, status, description, reference_type, reference_id, created_by)
SELECT 1, 1, '2026-01-25', 'JV-2026-0001', 'Purchase Receipt',
    12580.00, 12580.00, 'posted', 'Inventory receipt for PO-2026-0001 - steel & aluminum from Northern Steel', 'purchase_order', 1, id FROM users ORDER BY id LIMIT 1;

INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, debit, credit, narration)
VALUES
(1, 1, 3,  12580.00, 0.00,    'Debit Inventory - Raw Materials'),
(2, 1, 9,  0.00,     12580.00, 'Credit Accounts Payable - Northern Steel');

-- JE-002: Record SO-001 shipment (COGS recognition)
INSERT INTO journal_entries (id, company_id, entry_date, voucher_no, voucher_type,
    total_debit, total_credit, status, description, reference_type, reference_id, created_by)
SELECT 2, 1, '2026-01-22', 'JV-2026-0002', 'Sales Shipment',
    2536.00, 2536.00, 'posted', 'Cost of goods sold for SO-2026-0001 to BuildRite Construction', 'sales_order', 1, id FROM users ORDER BY id LIMIT 1;

INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, debit, credit, narration)
VALUES
(3, 2, 20, 2536.00, 0.00,    'Debit COGS'),
(4, 2, 4,  0.00,    2536.00, 'Credit Inventory - Finished Goods');

-- JE-003: Record INV-001 invoice (revenue recognition)
INSERT INTO journal_entries (id, company_id, entry_date, voucher_no, voucher_type,
    total_debit, total_credit, status, description, reference_type, reference_id, created_by)
SELECT 3, 1, '2026-01-25', 'JV-2026-0003', 'Sales Invoice',
    4200.10, 4200.10, 'posted', 'Accounts receivable for INV-2026-0001 to BuildRite Construction', 'invoice', 1, id FROM users ORDER BY id LIMIT 1;

INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, debit, credit, narration)
VALUES
(5, 3, 2,  4200.10, 0.00,    'Debit Accounts Receivable'),
(6, 3, 17, 0.00,    3880.00, 'Credit Product Sales Revenue'),
(7, 3, 12, 0.00,    320.10,  'Credit VAT/Sales Tax Payable');

-- JE-004: Record January rent expense
INSERT INTO journal_entries (id, company_id, entry_date, voucher_no, voucher_type,
    total_debit, total_credit, status, description, created_by)
SELECT 4, 1, '2026-01-31', 'JV-2026-0004', 'Standing Journal',
    18500.00, 18500.00, 'posted', 'Monthly rent and utilities for January 2026', id FROM users ORDER BY id LIMIT 1;

INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, debit, credit, narration)
VALUES
(8,  4, 22, 18500.00, 0.00,     'Debit Rent & Utilities'),
(9,  4, 9,  0.00,     18500.00, 'Credit Accounts Payable');

-- JE-005: Record payroll for January
INSERT INTO journal_entries (id, company_id, entry_date, voucher_no, voucher_type,
    total_debit, total_credit, status, description, created_by)
SELECT 5, 1, '2026-01-31', 'JV-2026-0005', 'Payroll',
    134000.00, 134000.00, 'posted', 'Monthly payroll for January 2026', id FROM users ORDER BY id LIMIT 1;

INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, debit, credit, narration)
VALUES
(10, 5, 21, 134000.00, 0.00,      'Debit Salaries & Wages'),
(11, 5, 9,  0.00,      100000.00, 'Credit Accounts Payable - net pay'),
(12, 5, 13, 0.00,      34000.00,  'Credit Income Tax Payable');

-- JE-006: Receive payment from BuildRite (partial)
INSERT INTO journal_entries (id, company_id, entry_date, voucher_no, voucher_type,
    total_debit, total_credit, status, description, reference_type, reference_id, created_by)
SELECT 6, 1, '2026-02-10', 'JV-2026-0006', 'Payment Receipt',
    2000.00, 2000.00, 'posted', 'Partial payment received from BuildRite Construction for INV-2026-0001', 'payment', 1, id FROM users ORDER BY id LIMIT 1;

INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, debit, credit, narration)
VALUES
(13, 6, 1,  2000.00, 0.00,    'Debit Cash - Operating Account'),
(14, 6, 2,  0.00,    2000.00, 'Credit Accounts Receivable');

SELECT setval('journal_entries_id_seq', 6);
SELECT setval('journal_entry_lines_id_seq', 14);

-- -------------------------------------------------------------------------
-- 4g. EXPENSES
-- -------------------------------------------------------------------------
INSERT INTO expenses (id, company_id, expense_date, category, category_id, description, amount, payment_method, reference_number, created_by)
SELECT 1, 1, '2026-01-12', 'Travel & Accommodation', 1, 'VP Operations flight and hotel for supplier visit in Pittsburgh', 2850.00, 'Corporate Card', 'EXP-2026-0001', id FROM users ORDER BY id LIMIT 1;
INSERT INTO expenses (id, company_id, expense_date, category, category_id, description, amount, payment_method, reference_number, created_by)
SELECT 2, 1, '2026-01-20', 'IT & Software Subscriptions', 3, 'Annual Microsoft 365 Business Premium renewal (50 users)', 6750.00, 'ACH', 'EXP-2026-0002', id FROM users ORDER BY id LIMIT 1;
INSERT INTO expenses (id, company_id, expense_date, category, category_id, description, amount, payment_method, reference_number, created_by)
SELECT 3, 1, '2026-02-01', 'Shipping & Logistics', 6, 'Freight charges for PO-2026-0001 shipment from Pittsburgh to Chicago', 890.00, 'ACH', 'EXP-2026-0003', id FROM users ORDER BY id LIMIT 1;
INSERT INTO expenses (id, company_id, expense_date, category, category_id, description, amount, payment_method, reference_number, created_by)
SELECT 4, 1, '2026-02-05', 'Employee Training', 4, 'Lean Manufacturing Certification Workshop for 12 production staff', 4800.00, 'Check', 'EXP-2026-0004', id FROM users ORDER BY id LIMIT 1;

SELECT setval('expenses_id_seq', 4);

-- -------------------------------------------------------------------------
-- 4h. FIXED ASSETS
-- -------------------------------------------------------------------------
INSERT INTO fixed_assets (id, company_id, asset_code, name, category_id, description,
    purchase_date, purchase_cost, current_value, salvage_value, useful_life,
    depreciation_method, accumulated_depreciation, depreciation_per_period,
    location, status, notes, created_by)
SELECT 1, 1, 'MACH-001', 'CNC Milling Machine - Haas VF-4', 2,
    'Vertical machining center with 40-tool automatic changer and TSC. 4-axis ready.',
    '2023-06-15', 185000.00, 141000.00, 15000.00, 12,
    'straight_line', 44000.00, 14166.67,
    'Building 2, Manufacturing Floor', 'active', 'Primary production workhorse for precision parts', id FROM users ORDER BY id LIMIT 1;

INSERT INTO fixed_assets (id, company_id, asset_code, name, category_id, description,
    purchase_date, purchase_cost, current_value, salvage_value, useful_life,
    depreciation_method, accumulated_depreciation, depreciation_per_period,
    location, status, notes, created_by)
SELECT 2, 1, 'MACH-002', 'Forklift - Toyota 5-ton', 2,
    'Toyota 5-ton capacity propane forklift with side-shifter and fork positioner.',
    '2023-09-01', 48500.00, 35450.00, 5000.00, 10,
    'straight_line', 13050.00, 4350.00,
    'Warehouse - Chicago DC', 'active', 'Primary material handling equipment', id FROM users ORDER BY id LIMIT 1;

INSERT INTO fixed_assets (id, company_id, asset_code, name, category_id, description,
    purchase_date, purchase_cost, current_value, salvage_value, useful_life,
    depreciation_method, accumulated_depreciation, depreciation_per_period,
    location, status, notes, created_by)
SELECT 3, 1, 'COMP-001', 'Server Rack & Networking Equipment', 1,
    '42U server rack with Dell PowerEdge servers, 10GbE switching, and UPS backup.',
    '2024-01-10', 78000.00, 69000.00, 3000.00, 5,
    'straight_line', 9000.00, 15000.00,
    'Server Room - HQ Basement', 'active', 'Core IT infrastructure', id FROM users ORDER BY id LIMIT 1;

INSERT INTO fixed_assets (id, company_id, asset_code, name, category_id, description,
    purchase_date, purchase_cost, current_value, salvage_value, useful_life,
    depreciation_method, accumulated_depreciation, depreciation_per_period,
    location, status, notes, created_by)
SELECT 4, 1, 'COMP-002', 'Laptop Computers (20 units)', 1,
    'Dell Latitude 5540 laptops for sales and management team. Deployed January 2025.',
    '2025-01-15', 38000.00, 33000.00, 2000.00, 4,
    'straight_line', 5000.00, 9000.00,
    'Various - assigned to employees', 'active', 'Standard-issue corporate laptops', id FROM users ORDER BY id LIMIT 1;

INSERT INTO fixed_assets (id, company_id, asset_code, name, category_id, description,
    purchase_date, purchase_cost, current_value, salvage_value, useful_life,
    depreciation_method, accumulated_depreciation, depreciation_per_period,
    location, status, notes, created_by)
SELECT 5, 1, 'BUILD-001', 'Headquarters Office Building', 5,
    'Four-story office building with basement. 48,000 sq ft total. Includes manufacturing wing.',
    '2020-03-01', 4200000.00, 3790000.00, 800000.00, 30,
    'straight_line', 410000.00, 113333.33,
    '200 Wacker Drive, Chicago, IL', 'active', 'Corporate headquarters and main production facility', id FROM users ORDER BY id LIMIT 1;

INSERT INTO fixed_assets (id, company_id, asset_code, name, category_id, description,
    purchase_date, purchase_cost, current_value, salvage_value, useful_life,
    depreciation_method, accumulated_depreciation, depreciation_per_period,
    location, status, notes, created_by)
SELECT 6, 1, 'VEH-001', 'Company Pickup Truck - Ford F-250', 3,
    'Ford F-250 Super Duty crew cab, 4x4, with utility bed for field service calls.',
    '2024-04-15', 62000.00, 51000.00, 12000.00, 8,
    'straight_line', 11000.00, 6250.00,
    'Parking - HQ Lot', 'active', 'Field service and warehouse transport vehicle', id FROM users ORDER BY id LIMIT 1;

INSERT INTO fixed_assets (id, company_id, asset_code, name, category_id, description,
    purchase_date, purchase_cost, current_value, salvage_value, useful_life,
    depreciation_method, accumulated_depreciation, depreciation_per_period,
    location, status, notes, created_by)
SELECT 7, 1, 'FURN-001', 'Executive Conference Room Furniture', 4,
    'Custom conference table, 20 leather chairs, AV console, and cabinetry for 4th floor exec suite.',
    '2024-06-01', 45000.00, 38000.00, 5000.00, 7,
    'straight_line', 7000.00, 5714.29,
    'HQ - 4th Floor Executive Suite', 'active', 'Executive boardroom furnishings', id FROM users ORDER BY id LIMIT 1;

INSERT INTO fixed_assets (id, company_id, asset_code, name, category_id, description,
    purchase_date, purchase_cost, current_value, salvage_value, useful_life,
    depreciation_method, accumulated_depreciation, depreciation_per_period,
    location, status, notes, created_by)
SELECT 8, 1, 'MACH-003', 'Assembly Line Conveyor System', 2,
    'Modular belt conveyor system with 8 workstations, 150 ft length, with PLC controls and safety guards.',
    '2024-09-01', 215000.00, 195000.00, 25000.00, 12,
    'straight_line', 20000.00, 15833.33,
    'Manufacturing Wing - Assembly Line', 'active', 'Main assembly line installed Sep 2024', id FROM users ORDER BY id LIMIT 1;

SELECT setval('fixed_assets_id_seq', 8);

-- -------------------------------------------------------------------------
-- 4i. ASSET DEPRECIATION (sample entries for a few assets)
-- -------------------------------------------------------------------------
INSERT INTO asset_depreciation (id, company_id, asset_id, period_date, amount, running_balance, journal_entry_id)
VALUES
(1, 1, 1, '2026-01-31', 14166.67, 44000.00, NULL),
(2, 1, 3, '2026-01-31', 15000.00, 9000.00,  NULL),
(3, 1, 5, '2026-01-31', 113333.33, 410000.00, NULL);

SELECT setval('asset_depreciation_id_seq', 3);

-- -------------------------------------------------------------------------
-- 4j. STOCK TRANSFERS
-- -------------------------------------------------------------------------
INSERT INTO stock_transfers (id, company_id, transfer_number, from_warehouse_id, to_warehouse_id,
    transfer_date, status, notes, created_by)
SELECT 1, 1, 'ST-2026-0001', 1, 2, '2026-01-28', 'completed',
    'Transfer 20 units of steel sheet and 10 units of bearings to East Coast Hub for upcoming orders.',
    id FROM users ORDER BY id LIMIT 1;

INSERT INTO stock_transfer_items (id, stock_transfer_id, product_id, quantity, unit_cost)
VALUES
(1, 1, 13, 20, 95.00),
(2, 1, 4,  200, 6.80);

INSERT INTO stock_transfers (id, company_id, transfer_number, from_warehouse_id, to_warehouse_id,
    transfer_date, status, notes, created_by)
SELECT 2, 1, 'ST-2026-0002', 1, 4, '2026-02-01', 'completed',
    'Transfer packaging materials to Southern Logistics Center for impending shipments.',
    id FROM users ORDER BY id LIMIT 1;

INSERT INTO stock_transfer_items (id, stock_transfer_id, product_id, quantity, unit_cost)
VALUES
(3, 2, 10, 50, 18.50),
(4, 2, 11, 30, 22.00);

SELECT setval('stock_transfers_id_seq', 2);
SELECT setval('stock_transfer_items_id_seq', 4);

-- -------------------------------------------------------------------------
-- 4k. PROJECTS
-- -------------------------------------------------------------------------
INSERT INTO projects (id, company_id, project_code, name, description, customer_id,
    start_date, end_date, budget_amount, status, priority, notes, created_by)
SELECT 1, 1, 'PRJ-2026-001', 'BuildRite Conveyor Installation',
    'Design, supply, and install conveyor system for BuildRite Construction Newark facility. Scope includes 4 motors, hydraulics, and controls.',
    1, '2026-01-15', '2026-03-15', 85000.00, 'in_progress', 'high',
    'Key strategic project for expanding into construction automation.', id FROM users ORDER BY id LIMIT 1;

INSERT INTO projects (id, company_id, project_code, name, description, customer_id,
    start_date, end_date, budget_amount, status, priority, notes, created_by)
SELECT 2, 1, 'PRJ-2026-002', 'TechFlow Office Relocation',
    'Complete office fit-out and equipment installation for TechFlow new Austin HQ. Includes 60 workstations, conference rooms, and server room.',
    2, '2026-01-20', '2026-03-01', 120000.00, 'in_progress', 'medium',
    'High-visibility project with potential for follow-on business.', id FROM users ORDER BY id LIMIT 1;

SELECT setval('projects_id_seq', 2);

-- -------------------------------------------------------------------------
-- 4l. BUDGET (FY 2026)
-- -------------------------------------------------------------------------
INSERT INTO budgets (id, company_id, fiscal_year, name, status, notes, created_by)
SELECT 1, 1, 2026, 'Annual Operating Budget FY 2026', 'approved',
    'FY 2026 operating budget approved by board on 2025-12-15.', id FROM users ORDER BY id LIMIT 1;

INSERT INTO budget_items (id, budget_id, account_id, cost_center_id,
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec)
VALUES
(1, 1, 21, 1, 225000, 225000, 225000, 225000, 225000, 225000, 225000, 225000, 225000, 225000, 225000, 225000),
(2, 1, 22, 3, 18500,  18500,  18500,  18500,  18500,  18500,  18500,  18500,  18500,  18500,  18500,  18500),
(3, 1, 25, 4, 12000,  12000,  12000,  12000,  12000,  12000,  12000,  12000,  12000,  12000,  12000,  12000),
(4, 1, 26, 1, 8500,   8500,   8500,   8500,   8500,   8500,   8500,   8500,   8500,   8500,   8500,   8500),
(5, 1, 23, 5, 4500,   4500,   4500,   4500,   4500,   4500,   4500,   4500,   4500,   4500,   4500,   4500);

SELECT setval('budgets_id_seq', 1);
SELECT setval('budget_items_id_seq', 5);

-- -------------------------------------------------------------------------
-- 4m. BANK ACCOUNTS
-- -------------------------------------------------------------------------
INSERT INTO bank_accounts (id, company_id, account_id, bank_name, account_number, account_name,
    opening_balance, as_of_date, is_active, created_by)
SELECT 1, 1, 1, 'Chase Bank', '****1234', 'Acme Manufacturing Corp - Operating Account',
    450000.00, '2026-01-01', true, id FROM users ORDER BY id LIMIT 1;

INSERT INTO bank_accounts (id, company_id, account_id, bank_name, account_number, account_name,
    opening_balance, as_of_date, is_active, created_by)
SELECT 2, 1, 1, 'Bank of America', '****5678', 'Acme Manufacturing Corp - Payroll Account',
    185000.00, '2026-01-01', true, id FROM users ORDER BY id LIMIT 1;

SELECT setval('bank_accounts_id_seq', 2);

-- -------------------------------------------------------------------------
-- 4n. LEAVE REQUESTS (sample)
-- -------------------------------------------------------------------------
INSERT INTO leave_requests (id, company_id, employee_id, leave_type_id, start_date, end_date, total_days,
    reason, status, created_by)
SELECT 1, 1, 4, 1, '2026-02-10', '2026-02-14', 5,
    'Family vacation - visiting relatives in Puerto Rico', 'approved', id FROM users ORDER BY id LIMIT 1;

INSERT INTO leave_requests (id, company_id, employee_id, leave_type_id, start_date, end_date, total_days,
    reason, status, created_by)
SELECT 2, 1, 7, 2, '2026-02-17', '2026-02-18', 2,
    'Medical appointment and recovery', 'pending', id FROM users ORDER BY id LIMIT 1;

INSERT INTO leave_requests (id, company_id, employee_id, leave_type_id, start_date, end_date, total_days,
    reason, status, created_by)
SELECT 3, 1, 8, 1, '2026-03-01', '2026-03-05', 5,
    'Pre-arranged annual leave', 'approved', id FROM users ORDER BY id LIMIT 1;

SELECT setval('leave_requests_id_seq', 3);

-- =============================================================================
-- PART 5: ROW COUNTS PER TABLE (confirmation)
-- =============================================================================
SELECT 'COMPANIES' AS table_name, COUNT(*) AS row_count FROM companies
UNION ALL SELECT 'TAX_RATES', COUNT(*) FROM tax_rates
UNION ALL SELECT 'CHART_OF_ACCOUNTS', COUNT(*) FROM chart_of_accounts
UNION ALL SELECT 'WAREHOUSES', COUNT(*) FROM warehouses
UNION ALL SELECT 'WAREHOUSE_BINS', COUNT(*) FROM warehouse_bins
UNION ALL SELECT 'PRODUCTS', COUNT(*) FROM products
UNION ALL SELECT 'PRODUCT_WAREHOUSE_STOCK', COUNT(*) FROM product_warehouse_stock
UNION ALL SELECT 'SUPPLIERS', COUNT(*) FROM suppliers
UNION ALL SELECT 'CUSTOMERS', COUNT(*) FROM customers
UNION ALL SELECT 'EXPENSE_CATEGORIES', COUNT(*) FROM expense_categories
UNION ALL SELECT 'ASSET_CATEGORIES', COUNT(*) FROM asset_categories
UNION ALL SELECT 'EMPLOYEES', COUNT(*) FROM employees
UNION ALL SELECT 'LEAVE_TYPES', COUNT(*) FROM leave_types
UNION ALL SELECT 'RETURN_REASONS', COUNT(*) FROM return_reasons
UNION ALL SELECT 'SERVICES', COUNT(*) FROM services
UNION ALL SELECT 'COST_CENTERS', COUNT(*) FROM cost_centers
UNION ALL SELECT 'PURCHASE_ORDERS', COUNT(*) FROM purchase_orders
UNION ALL SELECT 'PURCHASE_ORDER_ITEMS', COUNT(*) FROM purchase_order_items
UNION ALL SELECT 'SALES_ORDERS', COUNT(*) FROM sales_orders
UNION ALL SELECT 'SALES_ORDER_ITEMS', COUNT(*) FROM sales_order_items
UNION ALL SELECT 'INVENTORY_TRANSACTIONS', COUNT(*) FROM inventory_transactions
UNION ALL SELECT 'INVOICES', COUNT(*) FROM invoices
UNION ALL SELECT 'INVOICE_ITEMS', COUNT(*) FROM invoice_items
UNION ALL SELECT 'PAYMENTS', COUNT(*) FROM payments
UNION ALL SELECT 'JOURNAL_ENTRIES', COUNT(*) FROM journal_entries
UNION ALL SELECT 'JOURNAL_ENTRY_LINES', COUNT(*) FROM journal_entry_lines
UNION ALL SELECT 'EXPENSES', COUNT(*) FROM expenses
UNION ALL SELECT 'FIXED_ASSETS', COUNT(*) FROM fixed_assets
UNION ALL SELECT 'ASSET_DEPRECIATION', COUNT(*) FROM asset_depreciation
UNION ALL SELECT 'STOCK_TRANSFERS', COUNT(*) FROM stock_transfers
UNION ALL SELECT 'STOCK_TRANSFER_ITEMS', COUNT(*) FROM stock_transfer_items
UNION ALL SELECT 'PROJECTS', COUNT(*) FROM projects
UNION ALL SELECT 'LEAVE_REQUESTS', COUNT(*) FROM leave_requests
UNION ALL SELECT 'BUDGETS', COUNT(*) FROM budgets
UNION ALL SELECT 'BUDGET_ITEMS', COUNT(*) FROM budget_items
UNION ALL SELECT 'BANK_ACCOUNTS', COUNT(*) FROM bank_accounts
UNION ALL SELECT 'BANK_TRANSACTIONS', COUNT(*) FROM bank_transactions
ORDER BY table_name;

COMMIT;
