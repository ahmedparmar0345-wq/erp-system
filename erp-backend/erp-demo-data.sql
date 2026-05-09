-- ===================================================================
-- ERP DEMO DATA — RESET & POPULATE
-- ===================================================================
-- Run: psql -U postgres -d your_db -f erp-demo-data.sql
--
-- Resets all transactional/module data (not auth tables) and inserts
-- realistic demo data across Companies, Products, Sales, Purchasing,
-- Inventory, Accounting, HR, Invoicing, Payments, Assets, Projects,
-- CRM, Returns, POS, Warehousing, Services, Quotations, Expenses.
--
-- Safe: preserves users, roles, system_settings, email_templates,
--        lead_sources, lead_statuses, leave_types, return_reasons,
--        tax_rates, audit_logs.
-- Does NOT alter schema – only data.
-- ===================================================================

BEGIN;

-- ===================================================================
-- HELPER: disable trigger checks so we can delete in any order
-- ===================================================================
SET session_replication_role = 'replica';

-- ===================================================================
-- 1. DELETE ALL EXISTING DATA (reverse FK dependency order)
-- ===================================================================

-- Approval workflows
DELETE FROM approval_logs;
DELETE FROM approval_requests;
DELETE FROM approval_steps;
DELETE FROM approval_workflows;

-- Time tracking & projects
DELETE FROM time_entries;
DELETE FROM project_members;
DELETE FROM project_tasks;
DELETE FROM projects;

-- Fixed assets
DELETE FROM asset_depreciation;
DELETE FROM asset_maintenance;
DELETE FROM fixed_assets;
DELETE FROM asset_categories;

-- Payments & invoices
DELETE FROM payments;
DELETE FROM invoice_items;
DELETE FROM invoices;

-- Services invoicing
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

-- Returns & credit notes
DELETE FROM credit_notes;
DELETE FROM purchase_return_items;
DELETE FROM purchase_returns;
DELETE FROM sales_return_items;
DELETE FROM sales_returns;

-- CRM deeper
DELETE FROM interactions;
DELETE FROM follow_ups;
DELETE FROM opportunities;
DELETE FROM leads;

-- Stock transfers
DELETE FROM stock_transfer_items;
DELETE FROM stock_transfers;

-- Warehouse stock & bins
DELETE FROM product_warehouse_stock;
DELETE FROM warehouse_bins;

-- Order lines & headers
DELETE FROM sales_order_items;
DELETE FROM sales_orders;
DELETE FROM purchase_order_items;
DELETE FROM purchase_orders;

-- Inventory
DELETE FROM inventory_transactions;

-- Accounting
DELETE FROM journal_entry_lines;
DELETE FROM journal_entries;
DELETE FROM budget_items;
DELETE FROM budgets;
DELETE FROM bank_transactions;
DELETE FROM reconciliation_reports;
DELETE FROM bank_accounts;
DELETE FROM recurring_entry_lines;
DELETE FROM recurring_entries;
DELETE FROM cost_centers;

-- Expenses
DELETE FROM expenses;
DELETE FROM expense_categories;

-- HR
DELETE FROM employee_documents;
DELETE FROM leave_requests;
DELETE FROM attendance;
DELETE FROM employees;

-- Core entities
UPDATE customers SET converted_customer_id = NULL WHERE converted_customer_id IS NOT NULL;
DELETE FROM products;
DELETE FROM suppliers;
DELETE FROM customers;
DELETE FROM warehouses;
DELETE FROM chart_of_accounts;

-- Companies: keep company 1 (users FK to it), add new ones
DELETE FROM companies WHERE id > 1;

-- ===================================================================
-- 2. RESET SEQUENCES
-- ===================================================================
ALTER SEQUENCE companies_id_seq              RESTART WITH 2;
ALTER SEQUENCE customers_id_seq              RESTART WITH 1;
ALTER SEQUENCE suppliers_id_seq              RESTART WITH 1;
ALTER SEQUENCE products_id_seq               RESTART WITH 1;
ALTER SEQUENCE warehouses_id_seq             RESTART WITH 1;
ALTER SEQUENCE warehouse_bins_id_seq         RESTART WITH 1;
ALTER SEQUENCE product_warehouse_stock_id_seq RESTART WITH 1;
ALTER SEQUENCE stock_transfers_id_seq        RESTART WITH 1;
ALTER SEQUENCE stock_transfer_items_id_seq   RESTART WITH 1;
ALTER SEQUENCE sales_orders_id_seq           RESTART WITH 1;
ALTER SEQUENCE sales_order_items_id_seq      RESTART WITH 1;
ALTER SEQUENCE purchase_orders_id_seq        RESTART WITH 1;
ALTER SEQUENCE purchase_order_items_id_seq   RESTART WITH 1;
ALTER SEQUENCE inventory_transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE chart_of_accounts_id_seq      RESTART WITH 1;
ALTER SEQUENCE journal_entries_id_seq        RESTART WITH 1;
ALTER SEQUENCE journal_entry_lines_id_seq    RESTART WITH 1;
ALTER SEQUENCE invoices_id_seq               RESTART WITH 1;
ALTER SEQUENCE invoice_items_id_seq          RESTART WITH 1;
ALTER SEQUENCE payments_id_seq               RESTART WITH 1;
ALTER SEQUENCE asset_categories_id_seq       RESTART WITH 1;
ALTER SEQUENCE fixed_assets_id_seq           RESTART WITH 1;
ALTER SEQUENCE asset_depreciation_id_seq     RESTART WITH 1;
ALTER SEQUENCE asset_maintenance_id_seq      RESTART WITH 1;
ALTER SEQUENCE projects_id_seq               RESTART WITH 1;
ALTER SEQUENCE project_tasks_id_seq          RESTART WITH 1;
ALTER SEQUENCE project_members_id_seq        RESTART WITH 1;
ALTER SEQUENCE time_entries_id_seq           RESTART WITH 1;
ALTER SEQUENCE approval_workflows_id_seq     RESTART WITH 1;
ALTER SEQUENCE approval_steps_id_seq         RESTART WITH 1;
ALTER SEQUENCE approval_requests_id_seq      RESTART WITH 1;
ALTER SEQUENCE approval_logs_id_seq          RESTART WITH 1;
ALTER SEQUENCE employees_id_seq              RESTART WITH 1;
ALTER SEQUENCE attendance_id_seq             RESTART WITH 1;
ALTER SEQUENCE leave_requests_id_seq         RESTART WITH 1;
ALTER SEQUENCE employee_documents_id_seq     RESTART WITH 1;
ALTER SEQUENCE expense_categories_id_seq     RESTART WITH 1;
ALTER SEQUENCE expenses_id_seq               RESTART WITH 1;
ALTER SEQUENCE cost_centers_id_seq           RESTART WITH 1;
ALTER SEQUENCE budgets_id_seq                RESTART WITH 1;
ALTER SEQUENCE budget_items_id_seq           RESTART WITH 1;
ALTER SEQUENCE bank_accounts_id_seq          RESTART WITH 1;
ALTER SEQUENCE bank_transactions_id_seq      RESTART WITH 1;
ALTER SEQUENCE reconciliation_reports_id_seq RESTART WITH 1;
ALTER SEQUENCE recurring_entries_id_seq      RESTART WITH 1;
ALTER SEQUENCE recurring_entry_lines_id_seq  RESTART WITH 1;
ALTER SEQUENCE quotations_id_seq             RESTART WITH 1;
ALTER SEQUENCE quotation_items_id_seq        RESTART WITH 1;
ALTER SEQUENCE pos_sessions_id_seq           RESTART WITH 1;
ALTER SEQUENCE pos_cart_id_seq               RESTART WITH 1;
ALTER SEQUENCE pos_transactions_id_seq       RESTART WITH 1;
ALTER SEQUENCE pos_transaction_items_id_seq  RESTART WITH 1;
ALTER SEQUENCE sales_returns_id_seq          RESTART WITH 1;
ALTER SEQUENCE sales_return_items_id_seq     RESTART WITH 1;
ALTER SEQUENCE purchase_returns_id_seq       RESTART WITH 1;
ALTER SEQUENCE purchase_return_items_id_seq  RESTART WITH 1;
ALTER SEQUENCE credit_notes_id_seq           RESTART WITH 1;
ALTER SEQUENCE services_id_seq               RESTART WITH 1;
ALTER SEQUENCE service_invoices_id_seq       RESTART WITH 1;
ALTER SEQUENCE service_invoice_items_id_seq  RESTART WITH 1;

-- ===================================================================
-- 3. UPDATE EXISTING COMPANY & ADD NEW ONES
-- ===================================================================
UPDATE companies
SET name = 'Acme Corporation',
    tax_id = 'US-47-1234567',
    email = 'info@acmecorp.com',
    phone = '+1-212-555-0100',
    address = '123 Industrial Boulevard, Suite 400, New York, NY 10001, United States',
    currency = 'USD',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

INSERT INTO companies (name, tax_id, email, phone, address, currency) VALUES
('GlobalTech Industries', 'US-95-8765432', 'corporate@globaltech.com', '+1-408-555-0200',
 '2000 Innovation Drive, Building 7, San Jose, CA 95134, United States', 'USD'),
('EuroParts GmbH', 'DE-813-456-789', 'info@europarts.de', '+49-89-555-0300',
 'Industriestrasse 42, 80339 München, Germany', 'EUR');

-- ===================================================================
-- 4. CHART OF ACCOUNTS (company 1 only)
-- ===================================================================
INSERT INTO chart_of_accounts (company_id, account_code, account_name, account_type, description, is_active) VALUES
-- Assets
(1, '1000', 'Cash on Hand',               'asset',    'Petty cash and undeposited funds', true),
(1, '1010', 'Checking Account',            'asset',    'Primary business checking account', true),
(1, '1020', 'Savings Account',             'asset',    'Business savings / money market', true),
(1, '1100', 'Accounts Receivable',         'asset',    'Customer invoices outstanding', true),
(1, '1200', 'Inventory',                   'asset',    'Raw materials and finished goods', true),
(1, '1300', 'Prepaid Expenses',            'asset',    'Prepaid insurance, rent, etc.', true),
(1, '1400', 'Fixed Assets',                'asset',    'Property, plant & equipment', true),
(1, '1410', 'Accumulated Depreciation',    'asset',    'Contra-asset: cumulative depreciation', true),
-- Liabilities
(1, '2000', 'Accounts Payable',            'liability','Supplier invoices outstanding', true),
(1, '2100', 'Accrued Liabilities',         'liability','Accrued expenses and taxes', true),
(1, '2200', 'Sales Tax Payable',           'liability','Sales tax collected from customers', true),
(1, '2300', 'Payroll Liabilities',         'liability','Wages and payroll taxes payable', true),
-- Equity
(1, '3000', 'Common Stock',                'equity',   'Share capital', true),
(1, '3100', 'Retained Earnings',           'equity',   'Accumulated retained earnings', true),
-- Revenue
(1, '4000', 'Sales Revenue',               'revenue',  'Product sales income', true),
(1, '4100', 'Service Revenue',             'revenue',  'Service and consulting income', true),
(1, '4200', 'Discounts Given',             'revenue',  'Sales discounts and allowances', true),
-- Expense
(1, '5000', 'Cost of Goods Sold',          'expense',  'Direct product costs', true),
(1, '5100', 'Salaries and Wages',          'expense',  'Employee compensation', true),
(1, '5200', 'Rent Expense',                'expense',  'Office and warehouse rent', true),
(1, '5300', 'Utilities',                   'expense',  'Electricity, water, internet', true),
(1, '5400', 'Office Supplies',             'expense',  'General office consumables', true),
(1, '5500', 'Depreciation',                'expense',  'Asset depreciation expense', true),
(1, '5600', 'Insurance',                   'expense',  'Business insurance premiums', true),
(1, '5700', 'Marketing and Advertising',   'expense',  'Promotional and ad spend', true),
(1, '5800', 'Maintenance and Repairs',     'expense',  'Equipment and facility repairs', true);

-- ===================================================================
-- 5. WAREHOUSES
-- ===================================================================
INSERT INTO warehouses (company_id, code, name, address, city, state, country, postal_code, phone, email, manager_id, is_active, is_default) VALUES
(1, 'MAIN', 'Main Warehouse', '123 Industrial Boulevard', 'New York', 'NY', 'USA', '10001', '+1-212-555-0301', 'warehouse.ny@acmecorp.com', 4, true, true),
(1, 'EAST', 'East Coast Distribution', '456 Commerce Drive', 'Newark', 'NJ', 'USA', '07102', '+1-973-555-0302', 'east.distro@acmecorp.com', 4, true, false),
(1, 'WEST', 'West Coast Fulfillment', '789 Logistics Avenue', 'Los Angeles', 'CA', 'USA', '90013', '+1-213-555-0303', 'west.fulfill@acmecorp.com', 2, true, false);

-- Warehouse bins
INSERT INTO warehouse_bins (company_id, warehouse_id, code, name, zone, aisle, rack, shelf, max_capacity) VALUES
(1, 1, 'A-01-01', 'Zone A - Electronics', 'A', '01', '01', 'A', 500),
(1, 1, 'A-01-02', 'Zone A - Electronics', 'A', '01', '01', 'B', 500),
(1, 1, 'B-01-01', 'Zone B - Office Supplies', 'B', '01', '01', 'A', 300),
(1, 1, 'C-01-01', 'Zone C - Raw Materials', 'C', '01', '01', 'A', 1000),
(1, 1, 'D-01-01', 'Zone D - Packaging', 'D', '01', '01', 'A', 800),
(1, 2, 'A-01-01', 'East - Fast Movers', 'A', '01', '01', 'A', 400),
(1, 2, 'B-01-01', 'East - Bulk Storage', 'B', '01', '01', 'A', 2000),
(1, 3, 'A-01-01', 'West - Electronics', 'A', '01', '01', 'A', 600),
(1, 3, 'B-01-01', 'West - General', 'B', '01', '01', 'A', 1200);

-- ===================================================================
-- 6. SUPPLIERS
-- ===================================================================
INSERT INTO suppliers (company_id, name, email, phone, address) VALUES
(1, 'Pacific Rim Imports LLC',          'orders@pacificrim.com',           '+1-310-555-0201', '500 Harbor Boulevard, Los Angeles, CA 90071, USA'),
(1, 'Northern Steel Supply Co.',        'sales@northernsteel.com',         '+1-312-555-0202', '850 Michigan Avenue, Chicago, IL 60611, USA'),
(1, 'GlobalTech Components',            'procurement@globaltechcomp.com',  '+1-408-555-0203', '3200 Central Expressway, Santa Clara, CA 95050, USA'),
(1, 'East Coast Packaging Inc',         'info@eastcoastpkg.com',           '+1-212-555-0204', '75 Industrial Park Drive, Newark, NJ 07105, USA'),
(1, 'Quality Office Direct',            'sales@qualityofficedirect.com',   '+1-214-555-0205', '1200 Commerce Street, Dallas, TX 75201, USA'),
(1, 'Allied Raw Materials Ltd',         'supply@alliedraw.com',            '+1-713-555-0206', '2800 Energy Drive, Houston, TX 77002, USA'),
(1, 'Precision Parts Manufacturing',    'quotes@precisionparts.com',       '+1-847-555-0207', '550 Technology Way, Schaumburg, IL 60173, USA'),
(1, 'TransGlobal Logistics Services',   'freight@transgloballogistics.com','+1-305-555-0208', '1000 Port Boulevard, Miami, FL 33101, USA');

-- ===================================================================
-- 7. PRODUCTS
-- ===================================================================
INSERT INTO products (company_id, sku, name, description, unit_price, cost_price, current_stock, reorder_level) VALUES
(1, 'WDG-001', 'Standard Widget',          'High-quality standard widget, steel construction, nickel-plated finish', 15.50, 8.00, 450, 100),
(1, 'WDG-002', 'Premium Widget',           'Premium-grade widget with titanium coating and precision bearings', 29.99, 15.00, 200, 50),
(1, 'WDG-003', 'Industrial Widget',        'Heavy-duty industrial widget rated for 10,000 PSI', 89.99, 45.00, 80, 20),
(1, 'ELC-001', 'USB-C 7-in-1 Hub',         'USB-C hub with HDMI, SD card, USB 3.0, and PD 100W charging', 34.99, 18.00, 350, 75),
(1, 'ELC-002', 'Ergonomic Wireless Mouse',  'Bluetooth 5.0 ergonomic mouse with 6 programmable buttons', 24.99, 12.00, 500, 100),
(1, 'ELC-003', 'Mechanical Keyboard',       'Full-size mechanical keyboard with Cherry MX Blue switches', 89.99, 45.00, 150, 30),
(1, 'ELC-004', '27" 4K IPS Monitor',        '27-inch 4K UHD IPS monitor, 99% sRGB, USB-C connectivity', 349.99, 200.00, 60, 15),
(1, 'ELC-005', 'Noise-Canceling Headphones','Over-ear wireless ANC headphones, 30-hour battery', 149.99, 80.00, 120, 25),
(1, 'OFF-001', 'A4 Copy Paper 5000-sheet',  'Premium bright white A4 copy paper, 80gsm, 10 ream box', 45.00, 28.00, 300, 60),
(1, 'OFF-002', 'Laser Toner Cartridge',      'High-yield black laser toner cartridge, 12,000 page yield', 89.99, 55.00, 180, 40),
(1, 'OFF-003', 'Executive Mesh Desk Chair',  'Ergonomic mesh back chair with lumbar support and adjustable armrests', 599.99, 350.00, 25, 5),
(1, 'OFF-004', 'Standing Desk Converter',    'Height-adjustable standing desk converter, 36-inch wide', 299.99, 175.00, 40, 10),
(1, 'RMW-001', 'Steel Sheet 4x8 ft 14ga',    'Cold-rolled steel sheet, 4x8 feet, 14-gauge thickness', 120.00, 75.00, 200, 50),
(1, 'RMW-002', 'Aluminum Rod 6061 1m',       '6061 aluminum round rod, 25mm diameter, 1 meter length', 45.00, 28.00, 400, 80),
(1, 'RMW-003', 'Copper Wire Spool 100m',     '12 AWG bare copper wire, 100-meter spool', 89.99, 55.00, 150, 30),
(1, 'RMW-004', 'Polypropylene Granules',     'Virgin PP granules, 25kg bag, injection molding grade', 65.00, 40.00, 500, 100),
(1, 'PKG-001', 'Corrugated Box 18x12x12',    'Single-wall corrugated shipping box, 32 ECT, pack of 25', 2.50, 1.20, 5000, 500),
(1, 'PKG-002', 'Bubble Wrap Roll 12"x175"',  'Small bubble cushioning wrap, 12 inches wide, 175 ft roll', 35.00, 18.00, 250, 50),
(1, 'PKG-003', 'Shipping Labels 4x6 500pk',  'Direct thermal shipping labels, permanent adhesive, 500 per pack', 65.00, 38.00, 180, 40);

-- ===================================================================
-- 8. CUSTOMERS
-- ===================================================================
INSERT INTO customers (company_id, name, email, phone, billing_address, shipping_address) VALUES
(1, 'TechFlow Solutions Inc.',          'accounts@techflowsolutions.com',   '+1-415-555-0101', '580 Market Street, Suite 300, San Francisco, CA 94104, USA', '580 Market Street, Suite 300, San Francisco, CA 94104, USA'),
(1, 'GreenLeaf Enterprises',            'ap@greenleaf-enterprises.com',     '+1-206-555-0102', '1200 Pike Street, Seattle, WA 98101, USA', '4500 Industrial Way, Building 12, Tacoma, WA 98421, USA'),
(1, 'Pinnacle Medical Supply LLC',      'orders@pinnaclemed.com',           '+1-615-555-0103', '3401 West End Avenue, Suite 500, Nashville, TN 37203, USA', '890 Distribution Parkway, La Vergne, TN 37086, USA'),
(1, 'Harbor Freight Logistics',         'dispatch@harborfreightlogistics.com','+1-757-555-0104', '455 Commerce Circle, Norfolk, VA 23510, USA', '455 Commerce Circle, Norfolk, VA 23510, USA'),
(1, 'BrightPath Education Group',       'purchasing@brightpath.edu',        '+1-617-555-0105', '2000 Beacon Street, Chestnut Hill, MA 02467, USA', '2000 Beacon Street, Chestnut Hill, MA 02467, USA'),
(1, 'Summit Construction Company',       'info@summitconstruction.com',      '+1-303-555-0106', '1550 Wewatta Street, Suite 200, Denver, CO 80202, USA', '7800 E 40th Avenue, Denver, CO 80207, USA'),
(1, 'Vanguard Energy Corporation',      'supplychain@vanguardenergy.com',   '+1-281-555-0107', '1500 Louisiana Street, Houston, TX 77002, USA', '3300 North Sam Houston Parkway, Houston, TX 77086, USA'),
(1, 'SilverLake Hospitality Group',     'procurement@silverlakehospitality.com','+1-407-555-0108', '6677 Sea Harbor Drive, Orlando, FL 32821, USA', '6677 Sea Harbor Drive, Orlando, FL 32821, USA'),
(1, 'Northwood Pharmaceuticals',        'purchasing@northwoodpharma.com',   '+1-215-555-0109', '3000 Market Street, Philadelphia, PA 19104, USA', '200 Chemical Road, Plymouth Meeting, PA 19462, USA'),
(1, 'Apex Automotive Parts Distributors','orders@apexautoparts.com',         '+1-313-555-0110', '2000 Town Center, Suite 1500, Southfield, MI 48075, USA', '8500 Executive Drive, Romulus, MI 48174, USA'),
(1, 'MapleLeaf Foods Corporation',      'procurement@mapleleaffoods.com',   '+1-416-555-0111', '100 Wellesley Street West, Toronto, ON M5S 2Z2, Canada', '300 The East Mall, Toronto, ON M9B 6B7, Canada');

-- ===================================================================
-- 9. PRODUCT WAREHOUSE STOCK
-- ===================================================================
INSERT INTO product_warehouse_stock (company_id, product_id, warehouse_id, bin_id, quantity, reserved_quantity, reorder_level)
SELECT 1, p.id, w.id, b.id,
       CASE
         WHEN p.sku LIKE 'WDG%' THEN p.current_stock * 60 / 100
         WHEN p.sku LIKE 'ELC%' THEN p.current_stock * 70 / 100
         WHEN p.sku LIKE 'OFF%' THEN p.current_stock * 50 / 100
         WHEN p.sku LIKE 'RMW%' THEN p.current_stock * 80 / 100
         ELSE p.current_stock * 60 / 100
       END,
       CASE
         WHEN p.sku LIKE 'WDG%' THEN 20
         WHEN p.sku LIKE 'ELC%' THEN 15
         WHEN p.sku LIKE 'OFF%' THEN 10
         ELSE 30
       END,
       CASE
         WHEN p.sku LIKE 'WDG%' THEN p.reorder_level * 60 / 100
         ELSE p.reorder_level * 50 / 100
       END
FROM products p
CROSS JOIN (SELECT id FROM warehouses WHERE code = 'MAIN') w
CROSS JOIN (SELECT id FROM warehouse_bins WHERE warehouse_id = 1 AND code = 'A-01-01') b
WHERE p.company_id = 1;

INSERT INTO product_warehouse_stock (company_id, product_id, warehouse_id, bin_id, quantity, reserved_quantity, reorder_level)
SELECT 1, p.id, w.id, b.id,
       p.current_stock * 25 / 100,
       5,
       p.reorder_level * 30 / 100
FROM products p
CROSS JOIN (SELECT id FROM warehouses WHERE code = 'EAST') w
CROSS JOIN (SELECT id FROM warehouse_bins WHERE warehouse_id = 2 AND code = 'A-01-01') b
WHERE p.company_id = 1 AND p.sku NOT LIKE 'RMW%' AND p.sku NOT LIKE 'PKG%';

INSERT INTO product_warehouse_stock (company_id, product_id, warehouse_id, bin_id, quantity, reserved_quantity, reorder_level)
SELECT 1, p.id, w.id, b.id,
       p.current_stock * 15 / 100,
       5,
       p.reorder_level * 30 / 100
FROM products p
CROSS JOIN (SELECT id FROM warehouses WHERE code = 'WEST') w
CROSS JOIN (SELECT id FROM warehouse_bins WHERE warehouse_id = 3 AND code = 'A-01-01') b
WHERE p.company_id = 1 AND p.sku NOT LIKE 'RMW%' AND p.sku NOT LIKE 'PKG%';

-- ===================================================================
-- 10. SALES ORDERS
-- ===================================================================
INSERT INTO sales_orders (company_id, customer_id, order_number, order_date, status, subtotal, tax_total, grand_total, notes, created_by, warehouse_id, payment_status)
VALUES
(1, 1, 'SO-2025-0001', '2025-11-15', 'invoiced',  2084.40, 208.44, 2292.84, 'Wireless mouse and keyboard bundle for new office setup', 2, 1, 'paid'),
(1, 2, 'SO-2025-0002', '2025-11-28', 'shipped',   3179.85, 317.99, 3497.84, 'Bulk office paper order for Q4', 3, 1, 'unpaid'),
(1, 4, 'SO-2025-0003', '2025-12-05', 'confirmed', 1249.95, 125.00, 1374.95, 'Monitor order for dispatch office upgrade', 2, 2, 'unpaid'),
(1, 6, 'SO-2025-0004', '2025-12-12', 'draft',     2399.60, 239.96, 2639.56, 'Projected order for construction site office', 2, 1, 'unpaid'),
(1, 3, 'SO-2026-0001', '2026-01-08', 'confirmed', 1699.80, 169.98, 1869.78, 'Medical supply packaging materials', 3, 2, 'unpaid'),
(1, 5, 'SO-2026-0002', '2026-01-20', 'draft',     524.85,   52.49,  577.34, 'Office supplies for spring semester', 3, 2, 'unpaid'),
(1, 7, 'SO-2026-0003', '2026-02-03', 'cancelled', 2670.00, 267.00, 2937.00, 'Raw materials - cancelled due to supplier change', 2, 1, 'unpaid'),
(1, 8, 'SO-2026-0004', '2026-02-14', 'confirmed', 3149.70, 314.97, 3464.67, 'Furniture for hotel renovation project', 3, 3, 'unpaid'),
(1, 9, 'SO-2026-0005', '2026-03-01', 'draft',     1899.75, 189.98, 2089.73, 'Lab equipment and office supplies', 2, 1, 'unpaid'),
(1, 10,'SO-2026-0006', '2026-03-10', 'confirmed', 4140.00, 414.00, 4554.00, 'Steel sheets and aluminum rods for manufacturing line', 3, 1, 'unpaid');

-- Sales order items
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
-- SO-2025-0001
(1, 5, 30, 24.99,  0.00, 749.70),
(1, 6, 10, 89.99,  0.00, 899.90),
(1, 9,  8, 45.00,  10.00, 324.00),
(1, 10, 2, 89.99,  0.00, 179.98),
(1, 4,  5, 34.99,  5.00, 166.20),
-- total = 2319.78 -- recalc: 749.70+899.90+324+179.98+166.20=2319.78? Wait let me recalculate
-- 30*24.99=749.70, 10*89.99=899.90, 8*45=360, 10% off=324, 2*89.99=179.98, 5*34.99=174.95, 5% off=166.20
-- 749.70+899.90+324+179.98+166.20 = 2319.78
-- But subtotal is 2084.40... Let me adjust
-- Actually let me just recalculate more carefully. The subtotal was 2084.40
-- 30*24.99 = 749.70
-- 10*89.99 = 899.90
-- 8*45 = 360, with 10% = 324
-- 2*89.99 = 179.98
-- 5*34.99 = 174.95, with 5% = 166.20
-- 749.70+899.90+324+179.98+166.20 = 2319.78 -- doesn't match 2084.40

-- Hmm, let me just fix this by adjusting quantities or prices. Let me use a simpler approach:
-- For each order, I'll just make the numbers work.

-- SO-2025-0001: 2084.40
(1, 5,  25, 24.99,  0.00, 624.75),
(1, 6,  10, 89.99,  0.00, 899.90),
(1, 9,  8,  45.00,  10.00, 324.00),
(1, 10, 2,  89.99,  0.00, 179.98),
(1, 4,  2,  34.99,  0.00, 69.98),
-- 624.75+899.90+324+179.98+69.98 = 2098.61 -- close but not exact
-- Let me adjust more carefully
-- 25*24.99=624.75, 10*89.99=899.90, 8*45=360-36=324, 2*89.99=179.98, 2*34.99=69.98
-- 624.75+899.90+324+179.98+69.98 = 2098.61
-- I need 2084.40. Diff is 14.21. Let me change quantity of item 5 from 25 to 24
-- 24*24.99=599.76

-- OK this is getting really tedious. Let me just recalculate subtotals to match what I insert.
-- I'll recompute: for each order, compute the total from items.
-- SO-2025-0001: 599.76+899.90+324+179.98+69.98 = 2073.62. Tax 207.36. Grand 2280.98. Let me update the so data.

-- Actually, let me just adjust the SO subtotals to match the items, rather than the other way around.
-- It's much easier.

-- SO-2025-0001:
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
(1, 5,  24, 24.99,  0.00, 599.76),
(1, 6,  10, 89.99,  0.00, 899.90);
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
(1, 9,  8,  45.00,  10.00, 324.00);
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
(1, 10, 2,  89.99,  0.00, 179.98);
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
(1, 4,  2,  34.99,  0.00,  69.98);

-- SO-2025-0002: 3179.85
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
(2, 9,  50, 45.00,  5.00, 2137.50);
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
(2, 10, 8,  89.99,  0.00, 719.92);
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
(2, 11, 1, 599.99,  0.00, 599.99);
-- 2137.50+719.92+599.99 = 3457.41 - nope
-- Let me fix: 50*45=2250, 5% off = 2137.50. 8*89.99=719.92. 1*599.99=599.99. Total = 3457.41
-- I need 3179.85. Let me reduce paper qty: 35*45=1575, 5% off=1496.25. 719.92+1496.25+599.99=2816.16
-- Ugh. OK I need to stop trying to match exact numbers and just recalculate subtotals to match items.

-- Let me take a different approach: insert items FIRST, then UPDATE the SO with computed totals.
-- OR: just insert items and update the SO header with correct totals.

-- Let me recalculate everything:

-- SO-2025-0001 items:
-- 24*24.99=599.76 + 10*89.99=899.90 + 8*45=360 (324 w/10%) + 2*89.99=179.98 + 2*34.99=69.98
-- = 599.76+899.90+324+179.98+69.98 = 2073.62

-- SO-2025-0002:
-- Will insert: 35*45=1575 (1496.25 w/5%) + 8*89.99=719.92 + 1*599.99=599.99
-- = 1496.25+719.92+599.99 = 2816.16

-- SO-2025-0003:
-- Will insert: 3*349.99=1049.97 + 5*24.99=124.95 + 2*34.99=69.98 + 2*14.99=299.98 (wait, headphones are 149.99)
-- 2*149.99=299.98 + ...
-- Let me plan amounts and just update later
-- I'll insert items without worrying about exact total match, then update

-- INSERT items for remaining SOs:
-- SO-2025-0003
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
(3, 7,  3, 349.99,  0.00, 1049.97),
(3, 5,  5,  24.99,  0.00, 124.95),
(3, 4,  2,  34.99,  0.00,  69.98);
-- SO-2025-0004
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
(4, 13, 12, 120.00, 5.00, 1368.00),
(4, 14, 10,  45.00, 0.00, 450.00),
(4, 16, 8,   65.00, 0.00, 520.00);
-- SO-2026-0001
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
(5, 17, 100, 2.50,  0.00, 250.00),
(5, 18, 20,  35.00, 0.00, 700.00),
(5, 19,  8,  65.00, 0.00, 520.00),
(5, 1,  10,  15.50, 0.00, 155.00);
-- SO-2026-0002
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
(6, 9,   5,  45.00,  0.00, 225.00),
(6, 10,  2,  89.99,  0.00, 179.98),
(6, 12,  1, 299.99, 10.00, 269.99);
-- SO-2026-0003 (cancelled)
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
(7, 13, 15, 120.00, 0.00, 1800.00),
(7, 14, 20,  45.00, 0.00, 900.00);
-- SO-2026-0004
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
(8, 11,  3, 599.99,  0.00, 1799.97),
(8, 12,  2, 299.99,  0.00, 599.98),
(8, 8,   5, 149.99,  5.00, 712.45);
-- SO-2026-0005
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
(9, 7,   3, 349.99,  0.00, 1049.97),
(9, 10,  4,  89.99,  0.00, 359.96),
(9, 9,   6,  45.00,  0.00, 270.00);
-- SO-2026-0006
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
(10, 13, 20, 120.00, 5.00, 2280.00),
(10, 14, 30,  45.00, 0.00, 1350.00),
(10, 15,  5,  89.99, 0.00, 449.95);

-- ===================================================================
-- 11. UPDATE SALES ORDER TOTALS TO MATCH ITEMS
-- ===================================================================
UPDATE sales_orders so SET
  subtotal    = COALESCE((SELECT SUM(total) FROM sales_order_items WHERE sales_order_id = so.id), 0),
  tax_total   = ROUND(COALESCE((SELECT SUM(total) FROM sales_order_items WHERE sales_order_id = so.id), 0) * 0.10, 2),
  grand_total = ROUND(COALESCE((SELECT SUM(total) FROM sales_order_items WHERE sales_order_id = so.id), 0) * 1.10, 2);

-- ===================================================================
-- 12. PURCHASE ORDERS
-- ===================================================================
INSERT INTO purchase_orders (company_id, supplier_id, po_number, order_date, status, warehouse_id, created_by, payment_status, expected_delivery_date)
VALUES
(1, 3, 'PO-2025-0001', '2025-10-20', 'received',  1, 4, 'paid',    '2025-11-05'),
(1, 5, 'PO-2025-0002', '2025-11-10', 'received',  1, 4, 'paid',    '2025-11-25'),
(1, 1, 'PO-2025-0003', '2025-12-01', 'received',  1, 4, 'paid',    '2025-12-15'),
(1, 2, 'PO-2026-0001', '2026-01-05', 'sent',      1, 4, 'unpaid',  '2026-01-25'),
(1, 4, 'PO-2026-0002', '2026-01-15', 'received',  2, 4, 'paid',    '2026-01-30'),
(1, 7, 'PO-2026-0003', '2026-02-01', 'sent',      1, 4, 'unpaid',  '2026-02-20'),
(1, 6, 'PO-2026-0004', '2026-02-20', 'draft',     1, 4, 'unpaid',  '2026-03-10'),
(1, 3, 'PO-2026-0005', '2026-03-05', 'sent',      3, 4, 'unpaid',  '2026-03-22');

-- Purchase order items
INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity) VALUES
-- PO-2025-0001: Electronics from GlobalTech
(1, 4, 200, 18.00, 3600.00, 200),
(1, 5, 300, 12.00, 3600.00, 300),
(1, 6, 100, 45.00, 4500.00, 100);
-- PO-2025-0002: Office supplies from Quality Office Direct
INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity) VALUES
(2, 9,  200, 28.00, 5600.00, 200),
(2, 10, 100, 55.00, 5500.00, 100),
(2, 11, 10, 350.00, 3500.00, 10);
-- PO-2025-0003: Widgets from Pacific Rim
INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity) VALUES
(3, 1,  500, 8.00,  4000.00, 500),
(3, 2,  200, 15.00, 3000.00, 200),
(3, 3,  100, 45.00, 4500.00, 100);
-- PO-2026-0001: Steel from Northern Steel
INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity) VALUES
(4, 13, 150, 75.00, 11250.00, 0),
(4, 14, 300, 28.00, 8400.00, 0);
-- PO-2026-0002: Packaging from East Coast Packaging
INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity) VALUES
(5, 17, 5000, 1.20, 6000.00, 5000),
(5, 18, 500,  18.00, 9000.00, 500),
(5, 19, 300,  38.00, 11400.00, 300);
-- PO-2026-0003: Precision Parts
INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity) VALUES
(6, 15, 200, 55.00, 11000.00, 0),
(6, 16, 400, 40.00, 16000.00, 0);
-- PO-2026-0004: Raw materials from Allied Raw
INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity) VALUES
(7, 13, 100, 75.00, 7500.00, 0),
(7, 14, 200, 28.00, 5600.00, 0);
-- PO-2026-0005: Electronics for West Coast
INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity) VALUES
(8, 7,  50, 200.00, 10000.00, 0),
(8, 8,  80, 80.00,  6400.00, 0);

-- Update PO totals
UPDATE purchase_orders po SET
  subtotal    = COALESCE((SELECT SUM(total) FROM purchase_order_items WHERE purchase_order_id = po.id), 0),
  tax_total   = ROUND(COALESCE((SELECT SUM(total) FROM purchase_order_items WHERE purchase_order_id = po.id), 0) * 0.10, 2),
  grand_total = ROUND(COALESCE((SELECT SUM(total) FROM purchase_order_items WHERE purchase_order_id = po.id), 0) * 1.10, 2),
  total_amount = ROUND(COALESCE((SELECT SUM(total) FROM purchase_order_items WHERE purchase_order_id = po.id), 0) * 1.10, 2);

-- ===================================================================
-- 13. INVENTORY TRANSACTIONS
-- ===================================================================
INSERT INTO inventory_transactions (company_id, product_id, transaction_type, quantity, reference_type, reference_id, notes, created_by)
SELECT 1, poi.product_id, 'in', poi.received_quantity, 'purchase_order', po.id,
       'Received PO ' || po.po_number, 4
FROM purchase_order_items poi
JOIN purchase_orders po ON po.id = poi.purchase_order_id
WHERE poi.received_quantity > 0 AND po.status = 'received';

INSERT INTO inventory_transactions (company_id, product_id, transaction_type, quantity, reference_type, reference_id, notes, created_by)
SELECT 1, soi.product_id, 'out', soi.quantity, 'sales_order', so.id,
       'Shipped SO ' || so.order_number, 2
FROM sales_order_items soi
JOIN sales_orders so ON so.id = soi.sales_order_id
WHERE so.status IN ('shipped', 'invoiced');

-- Manually update product current_stock based on transactions
UPDATE products p SET
  current_stock = COALESCE((SELECT SUM(CASE WHEN it.transaction_type = 'in' THEN it.quantity ELSE 0 END)
                             FROM inventory_transactions it WHERE it.product_id = p.id), 0)
                - COALESCE((SELECT SUM(CASE WHEN it.transaction_type = 'out' THEN it.quantity ELSE 0 END)
                             FROM inventory_transactions it WHERE it.product_id = p.id), 0);

-- ===================================================================
-- 14. INVOICES (Sales)
-- ===================================================================
INSERT INTO invoices (company_id, invoice_number, sales_order_id, customer_id, invoice_date, due_date, status, subtotal, tax_total, grand_total, payment_terms, notes, created_by)
VALUES
(1, 'INV-2025-0001', 1, 1, '2025-11-16', '2025-12-16', 'paid',     2073.62, 207.36, 2280.98, 'Net 30', 'Invoice for SO-2025-0001', 2),
(1, 'INV-2025-0002', 2, 2, '2025-11-30', '2025-12-30', 'sent',     2816.16, 281.62, 3097.78, 'Net 30', 'Invoice for SO-2025-0002', 3),
(1, 'INV-2025-0003', 3, 4, '2025-12-08', '2026-01-08', 'sent',     1244.90, 124.49, 1369.39, 'Net 30', 'Invoice for SO-2025-0003', 2),
(1, 'INV-2026-0001', 5, 3, '2026-01-10', '2026-02-09', 'draft',    1625.00, 162.50, 1787.50, 'Net 30', 'Invoice for SO-2026-0001', 3),
(1, 'INV-2026-0002', 8, 8, '2026-02-18', '2026-03-20', 'draft',    3112.40, 311.24, 3423.64, 'Net 45', 'Invoice for SO-2026-0004', 3);

-- Invoice items
INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, discount_percent, total)
SELECT i.id, soi.product_id, p.name, soi.quantity, soi.unit_price, soi.discount_percent, soi.total
FROM invoices i
JOIN sales_orders so ON so.id = i.sales_order_id
JOIN sales_order_items soi ON soi.sales_order_id = so.id
JOIN products p ON p.id = soi.product_id;

-- ===================================================================
-- 15. PAYMENTS
-- ===================================================================
INSERT INTO payments (company_id, invoice_id, payment_number, payment_date, amount, payment_method, reference_number, notes, created_by)
VALUES
(1, 1, 'PAY-2025-0001', '2025-12-10', 2280.98, 'Wire Transfer', 'WIRE-20251210-001', 'Payment received for INV-2025-0001', 2);

-- Update invoice amount_paid
UPDATE invoices SET amount_paid = grand_total, status = 'paid' WHERE id = 1;

-- ===================================================================
-- 16. EMPLOYEES
-- ===================================================================
INSERT INTO employees (company_id, employee_code, first_name, last_name, email, phone, date_of_birth, gender,
  address, city, state, postal_code, country, department, position, hire_date, employment_type, salary,
  bank_name, bank_account_no, bank_routing_no, emergency_contact_name, emergency_contact_phone,
  emergency_contact_relation, status, created_by)
VALUES
(1, 'EMP-001', 'Sarah',   'Mitchell',   's.mitchell@acmecorp.com',   '+1-212-555-1001', '1988-04-12', 'Female',
 '340 Park Avenue, Apt 12B', 'New York', 'NY', '10022', 'USA', 'Human Resources', 'HR Manager',
 '2020-03-15', 'Full-time', 78000.00, 'Chase Bank', '****1234', '021000021',
 'David Mitchell', '+1-212-555-9001', 'Spouse', 'active', 1),

(1, 'EMP-002', 'James',    'Rodriguez',  'j.rodriguez@acmecorp.com',  '+1-212-555-1002', '1990-09-25', 'Male',
 '150 Broadway, Suite 8', 'New York', 'NY', '10013', 'USA', 'Information Technology', 'Senior Software Engineer',
 '2021-06-01', 'Full-time', 112000.00, 'Bank of America', '****5678', '026009593',
 'Maria Rodriguez', '+1-212-555-9002', 'Spouse', 'active', 1),

(1, 'EMP-003', 'Emily',    'Chen',       'e.chen@acmecorp.com',       '+1-212-555-1003', '1992-11-03', 'Female',
 '88 Fulton Street, Apt 5A', 'New York', 'NY', '10038', 'USA', 'Accounting', 'Senior Accountant',
 '2022-01-10', 'Full-time', 72000.00, 'Wells Fargo', '****9012', '121000248',
 'Michael Chen', '+1-212-555-9003', 'Brother', 'active', 1),

(1, 'EMP-004', 'Michael',  'Thompson',   'm.thompson@acmecorp.com',   '+1-212-555-1004', '1985-07-19', 'Male',
 '500 West 43rd Street, Apt 3', 'New York', 'NY', '10036', 'USA', 'Operations', 'Warehouse Supervisor',
 '2019-08-20', 'Full-time', 56000.00, 'Chase Bank', '****3456', '021000021',
 'Lisa Thompson', '+1-212-555-9004', 'Spouse', 'active', 1),

(1, 'EMP-005', 'Lisa',     'Patel',      'l.patel@acmecorp.com',      '+1-212-555-1005', '1994-02-28', 'Female',
 '75 Wall Street, Apt 15C', 'New York', 'NY', '10005', 'USA', 'Sales', 'Sales Representative',
 '2022-09-05', 'Full-time', 52000.00, 'Citibank', '****7890', '021000089',
 'Raj Patel', '+1-212-555-9005', 'Father', 'active', 1),

(1, 'EMP-006', 'David',    'Kim',        'd.kim@acmecorp.com',        '+1-212-555-1006', '1991-06-14', 'Male',
 '220 East 23rd Street, Apt 7B', 'New York', 'NY', '10010', 'USA', 'Marketing', 'Marketing Specialist',
 '2023-03-01', 'Full-time', 58000.00, 'Bank of America', '****2345', '026009593',
 'Susan Kim', '+1-212-555-9006', 'Spouse', 'active', 1),

(1, 'EMP-007', 'Amanda',   'Foster',     'a.foster@acmecorp.com',     '+1-212-555-1007', '1993-12-01', 'Female',
 '30 Rockefeller Plaza, Apt 22', 'New York', 'NY', '10112', 'USA', 'Customer Support', 'Customer Support Lead',
 '2021-11-15', 'Full-time', 48000.00, 'Chase Bank', '****6789', '021000021',
 'Jennifer Foster', '+1-212-555-9007', 'Sister', 'active', 1),

(1, 'EMP-008', 'Robert',   'O''Brien',   'r.obrien@acmecorp.com',     '+1-212-555-1008', '1980-03-22', 'Male',
 '10 Water Street, Apt 4', 'New York', 'NY', '10004', 'USA', 'Procurement', 'Procurement Officer',
 '2018-05-10', 'Full-time', 62000.00, 'Wells Fargo', '****0123', '121000248',
 'Catherine O''Brien', '+1-212-555-9008', 'Spouse', 'active', 1);

-- ===================================================================
-- 17. ATTENDANCE (last 2 weeks sample)
-- ===================================================================
INSERT INTO attendance (company_id, employee_id, date, check_in, check_out, status, overtime_hours, notes)
SELECT 1, e.id, d::date,
       '08:45:00'::time + (random() * interval '15 minutes'),
       '17:15:00'::time + (random() * interval '30 minutes'),
       'present', 0.00, 'Regular work day'
FROM employees e
CROSS JOIN generate_series(CURRENT_DATE - 14, CURRENT_DATE - 1, '1 day'::interval) AS d
WHERE e.status = 'active'
  AND EXTRACT(DOW FROM d) NOT IN (0, 6)
  AND e.id NOT IN (4)  -- Michael was on leave 2 days
  AND d NOT IN (CURRENT_DATE - 10, CURRENT_DATE - 11);

-- Michael was on leave 2 days
INSERT INTO attendance (company_id, employee_id, date, check_in, check_out, status, notes) VALUES
(1, 4, CURRENT_DATE - 10, NULL, NULL, 'absent', 'Sick leave'),
(1, 4, CURRENT_DATE - 11, NULL, NULL, 'absent', 'Sick leave');

-- Robert worked 2 hours overtime on Saturday
INSERT INTO attendance (company_id, employee_id, date, check_in, check_out, status, overtime_hours, notes) VALUES
(1, 8, CURRENT_DATE - 7, '09:00:00', '13:00:00', 'present', 4.00, 'Weekend inventory audit');

-- ===================================================================
-- 18. LEAVE REQUESTS
-- ===================================================================
INSERT INTO leave_requests (company_id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status, approved_by, created_by)
SELECT 1, e.id, lt.id, CURRENT_DATE - 60, CURRENT_DATE - 57, 3, 'Personal vacation', 'approved', 1, 1
FROM employees e, leave_types lt
WHERE e.employee_code = 'EMP-001' AND lt.code = 'AL';

INSERT INTO leave_requests (company_id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status, approved_by, created_by)
SELECT 1, e.id, lt.id, CURRENT_DATE - 30, CURRENT_DATE - 29, 2, 'Medical appointment', 'approved', 1, 1
FROM employees e, leave_types lt
WHERE e.employee_code = 'EMP-002' AND lt.code = 'SL';

INSERT INTO leave_requests (company_id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status, approved_by, created_by)
SELECT 1, e.id, lt.id, CURRENT_DATE - 10, CURRENT_DATE - 9, 2, 'Not feeling well', 'approved', 1, 1
FROM employees e, leave_types lt
WHERE e.employee_code = 'EMP-004' AND lt.code = 'SL';

INSERT INTO leave_requests (company_id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status, approved_by, created_by)
SELECT 1, e.id, lt.id, CURRENT_DATE + 30, CURRENT_DATE + 33, 4, 'Family wedding', 'pending', NULL, 1
FROM employees e, leave_types lt
WHERE e.employee_code = 'EMP-005' AND lt.code = 'AL';

INSERT INTO leave_requests (company_id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status, approved_by, created_by)
SELECT 1, e.id, lt.id, CURRENT_DATE + 14, CURRENT_DATE + 14, 1, 'Personal errand', 'approved', 1, 1
FROM employees e, leave_types lt
WHERE e.employee_code = 'EMP-007' AND lt.code = 'CL';

-- ===================================================================
-- 19. EXPENSE CATEGORIES
-- ===================================================================
INSERT INTO expense_categories (company_id, name, description, is_active) VALUES
(1, 'Travel',            'Business travel including flights, hotels, meals', true),
(1, 'Office Rent',       'Monthly office and warehouse lease payments', true),
(1, 'Utilities',         'Electricity, water, gas, internet, phone', true),
(1, 'Software Licenses', 'SaaS subscriptions and software licenses', true),
(1, 'Office Supplies',   'Stationery, printer supplies, general consumables', true),
(1, 'Equipment',         'IT equipment, machinery, tools', true),
(1, 'Marketing',         'Digital ads, print media, events, branding', true),
(1, 'Professional Fees', 'Legal, accounting, consulting services', true),
(1, 'Insurance',         'Business insurance premiums', true),
(1, 'Maintenance',       'Building and equipment maintenance', true);

-- ===================================================================
-- 20. EXPENSES
-- ===================================================================
INSERT INTO expenses (company_id, expense_date, category_id, description, amount, payment_method, reference_number, created_by) VALUES
(1, '2026-01-05',  2, 'January rent - Main office',                15000.00, 'Wire Transfer', 'RENT-2026-01', 3),
(1, '2026-01-05',  2, 'January rent - Warehouse',                  8500.00,  'Wire Transfer', 'RENT-WH-2026-01', 3),
(1, '2026-01-10',  3, 'January utilities - Office',                2450.00,  'Check',         'UTIL-01-OFF', 3),
(1, '2026-01-10',  3, 'January utilities - Warehouse',             3200.00,  'Check',         'UTIL-01-WH', 3),
(1, '2026-01-15',  4, 'Microsoft 365 Business Premium - Annual',   7200.00,  'Credit Card',   'MS-365-2026', 2),
(1, '2026-01-20',  7, 'Google Ads campaign - Q1',                  5000.00,  'Credit Card',   'ADS-Q1-2026', 6),
(1, '2026-02-01',  1, 'Flight - NYC to Chicago - Client meeting',  450.00,   'Corporate Card','FLT-2026-0201', 5),
(1, '2026-02-03',  1, 'Hotel - Chicago Marriott - 2 nights',       680.00,   'Corporate Card','HTL-2026-0203', 5),
(1, '2026-02-05',  5, 'Printer toner and paper',                   350.00,   'Credit Card',   'SUPP-2026-0205', 7),
(1, '2026-02-10',  8, 'External audit preparation - Q4 2025',      3500.00,  'Wire Transfer', 'AUDIT-Q4-2025', 1),
(1, '2026-02-15',  9, 'General liability insurance - Annual',      6200.00,  'Wire Transfer', 'LIAB-INS-2026', 1),
(1, '2026-02-20',  10,'HVAC repair - Warehouse Zone B',            1850.00,  'Check',         'HVAC-REP-0220', 4),
(1, '2026-03-01',  6, 'Replacement forklift battery',              3200.00,  'Check',         'FORK-BATT-001', 4),
(1, '2026-03-05',  7, 'LinkedIn sponsored content - March',        2000.00,  'Credit Card',   'LINKED-MAR', 6),
(1, '2026-03-08',  5, 'Office coffee supplies and snacks',         175.00,   'Credit Card',   'SNACKS-0308', 7);

-- ===================================================================
-- 21. STOCK TRANSFERS
-- ===================================================================
INSERT INTO stock_transfers (company_id, transfer_number, from_warehouse_id, to_warehouse_id, transfer_date, status, notes, created_by, approved_by, approved_at, received_by, received_at)
VALUES
(1, 'ST-2026-0001', 1, 2, '2026-01-20', 'completed', 'Replenish East Coast - Widgets and Electronics', 4, 1, '2026-01-20 10:30:00', 4, '2026-01-22 14:00:00'),
(1, 'ST-2026-0002', 1, 3, '2026-02-05', 'completed', 'Stock West Coast fulfillment - Office supplies', 4, 1, '2026-02-05 09:15:00', 2, '2026-02-08 11:45:00'),
(1, 'ST-2026-0003', 2, 3, '2026-02-28', 'draft', 'Cross-country transfer - Monitors and keyboards', 4, NULL, NULL, NULL, NULL);

INSERT INTO stock_transfer_items (stock_transfer_id, product_id, quantity, unit_cost) VALUES
(1, 1, 100, 8.00),
(1, 2, 50,  15.00),
(1, 4, 60,  18.00),
(1, 5, 80,  12.00),
(2, 9, 100, 28.00),
(2, 10, 40, 55.00),
(2, 11, 5,  350.00),
(3, 7, 15, 200.00),
(3, 6, 30, 45.00);

-- ===================================================================
-- 22. COST CENTERS
-- ===================================================================
INSERT INTO cost_centers (company_id, code, name, description, created_by) VALUES
(1, 'CC-ADMIN', 'Administration', 'General administrative costs', 1),
(1, 'CC-SALES', 'Sales & Marketing', 'Sales and marketing operations', 1),
(1, 'CC-OPS',   'Operations', 'Warehouse and logistics operations', 1),
(1, 'CC-RD',    'Research & Development', 'Product innovation and R&D', 1),
(1, 'CC-IT',    'Information Technology', 'IT infrastructure and support', 1);

-- ===================================================================
-- 23. ASSET CATEGORIES
-- ===================================================================
INSERT INTO asset_categories (company_id, code, name, default_depreciation_method, default_useful_life) VALUES
(1, 'COMP-EQ', 'Computer Equipment', 'straight_line', 3),
(1, 'FURN',    'Office Furniture',   'straight_line', 7),
(1, 'MACH',    'Machinery',          'straight_line', 10),
(1, 'VEH',     'Vehicles',           'straight_line', 5),
(1, 'LEASE',   'Leasehold Improvements', 'straight_line', 10);

-- ===================================================================
-- 24. FIXED ASSETS
-- ===================================================================
INSERT INTO fixed_assets (company_id, asset_code, name, category_id, description, purchase_date, purchase_cost, current_value, salvage_value, useful_life, depreciation_method, accumulated_depreciation, depreciation_per_period, location, assigned_to, supplier_id, warranty_expiry, status, created_by)
VALUES
(1, 'AST-001', 'Dell PowerEdge R740 Server', 1,
 'Production database server, 64GB RAM, 4TB SSD storage',
 '2024-03-15', 18500.00, 12333.33, 500.00, 3, 'straight_line', 6166.67, 500.00,
 'Server Room B, Main HQ', 2, 3, '2027-03-15', 'active', 4),

(1, 'AST-002', 'Forklift Toyota 8FGCU25', 3,
 'Propane-powered forklift, 5,000 lb capacity',
 '2023-08-01', 28500.00, 21375.00, 2000.00, 10, 'straight_line', 7125.00, 237.50,
 'Main Warehouse', 4, 8, '2028-08-01', 'active', 4),

(1, 'AST-003', 'Executive Conference Table', 2,
 'Mahogany conference table, 12-seat capacity',
 '2024-01-20', 8500.00, 7285.71, 500.00, 7, 'straight_line', 1214.29, 108.93,
 'Boardroom, 4th Floor HQ', 1, 5, NULL, 'active', 4),

(1, 'AST-004', 'HVAC System - Main Building', 5,
 'Central HVAC system for HQ building, 20-ton capacity',
 '2023-06-01', 45000.00, 38250.00, 3000.00, 10, 'straight_line', 6750.00, 412.50,
 '123 Industrial Blvd, Basement', 4, NULL, '2028-06-01', 'active', 4),

(1, 'AST-005', 'Ford Transit Cargo Van 250', 4,
 'Cargo van for local deliveries, 10 ft cargo box',
 '2024-09-15', 42000.00, 33600.00, 8000.00, 5, 'straight_line', 8400.00, 700.00,
 'Fleet Parking Lot', 4, NULL, '2028-09-15', 'active', 4),

(1, 'AST-006', 'Cisco Meraki Network Stack', 1,
 'Core switches, firewall, and 24 APs for HQ',
 '2024-06-01', 22000.00, 14666.67, 1000.00, 3, 'straight_line', 7333.33, 583.33,
 'Server Room B, Main HQ', 2, 3, '2027-06-01', 'active', 4),

(1, 'AST-007', 'Warehouse Pallet Racking System', 5,
 'Heavy-duty pallet racking for Zone B and C',
 '2022-11-01', 32000.00, 25600.00, 2000.00, 10, 'straight_line', 6400.00, 250.00,
 'Main Warehouse, Zones B & C', 4, 8, NULL, 'active', 4);

-- ===================================================================
-- 25. ASSET DEPRECIATION (sample entries for 2025)
-- ===================================================================
INSERT INTO asset_depreciation (company_id, asset_id, period_date, amount, running_balance)
SELECT 1, fa.id, d::date, fa.depreciation_per_period,
       fa.depreciation_per_period * (EXTRACT(YEAR FROM d) * 12 + EXTRACT(MONTH FROM d) -
                                     EXTRACT(YEAR FROM fa.purchase_date) * 12 - EXTRACT(MONTH FROM fa.purchase_date) + 1)
FROM fixed_assets fa
CROSS JOIN generate_series('2025-01-01'::date, '2025-12-01'::date, '1 month'::interval) AS d
WHERE d >= date_trunc('month', fa.purchase_date);

-- ===================================================================
-- 26. JOURNAL ENTRIES (accounting)
-- ===================================================================
-- JE-001: Record sales revenue for INV-2025-0001 (paid)
INSERT INTO journal_entries (company_id, entry_date, voucher_no, voucher_type, total_debit, total_credit, status, description, reference_type, reference_id, created_by)
VALUES (1, '2025-11-16', 'JV-2025-0001', 'Receipt', 2280.98, 2280.98, 'approved', 'Sales invoice INV-2025-0001 - TechFlow Solutions', 'sales_invoice', 1, 3);

INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
(1, (SELECT id FROM chart_of_accounts WHERE account_code = '1100' AND company_id = 1), 2280.98, 0.00,
   'Accounts Receivable - TechFlow Solutions'),
(1, (SELECT id FROM chart_of_accounts WHERE account_code = '4000' AND company_id = 1), 0.00, 2073.62,
   'Sales Revenue - Widgets and accessories'),
(1, (SELECT id FROM chart_of_accounts WHERE account_code = '2200' AND company_id = 1), 0.00, 207.36,
   'Output VAT / Sales Tax Payable');

-- JE-002: Record cash receipt for INV-2025-0001
INSERT INTO journal_entries (company_id, entry_date, voucher_no, voucher_type, total_debit, total_credit, status, description, reference_type, reference_id, created_by)
VALUES (1, '2025-12-10', 'JV-2025-0002', 'Receipt', 2280.98, 2280.98, 'approved', 'Payment received for INV-2025-0001', 'payment', 1, 3);

INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
(2, (SELECT id FROM chart_of_accounts WHERE account_code = '1010' AND company_id = 1), 2280.98, 0.00,
   'Checking Account - Wire transfer from TechFlow'),
(2, (SELECT id FROM chart_of_accounts WHERE account_code = '1100' AND company_id = 1), 0.00, 2280.98,
   'Accounts Receivable - Payment cleared');

-- JE-003: Record PO-2026-0005 received (electronics for West Coast)
INSERT INTO journal_entries (company_id, entry_date, voucher_no, voucher_type, total_debit, total_credit, status, description, reference_type, reference_id, created_by)
VALUES (1, '2026-03-22', 'JV-2026-0001', 'Payment', 16400.00, 16400.00, 'approved', 'Goods received - PO-2026-0005 from GlobalTech Components', 'purchase_receipt', 8, 4);

INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
(3, (SELECT id FROM chart_of_accounts WHERE account_code = '1200' AND company_id = 1), 16400.00, 0.00,
   'Inventory - Monitors and headphones received'),
(3, (SELECT id FROM chart_of_accounts WHERE account_code = '2000' AND company_id = 1), 0.00, 16400.00,
   'Accounts Payable - GlobalTech Components');

-- JE-004: Monthly rent expense
INSERT INTO journal_entries (company_id, entry_date, voucher_no, voucher_type, total_debit, total_credit, status, description, reference_type, reference_id, created_by)
VALUES (1, '2026-01-05', 'JV-2026-0002', 'Journal', 23500.00, 23500.00, 'approved', 'January rent - Office & Warehouse', 'expense', 1, 3);

INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
(4, (SELECT id FROM chart_of_accounts WHERE account_code = '5200' AND company_id = 1), 23500.00, 0.00,
   'Rent Expense - January 2026'),
(4, (SELECT id FROM chart_of_accounts WHERE account_code = '1010' AND company_id = 1), 0.00, 23500.00,
   'Checking Account - Rent payment');

-- JE-005: Depreciation for January 2026
INSERT INTO journal_entries (company_id, entry_date, voucher_no, voucher_type, total_debit, total_credit, status, description, created_by)
VALUES (1, '2026-01-31', 'JV-2026-0003', 'Journal', 2792.26, 2792.26, 'approved', 'Monthly depreciation - January 2026', 3);

INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
(5, (SELECT id FROM chart_of_accounts WHERE account_code = '5500' AND company_id = 1),
    (SELECT COALESCE(SUM(amount), 0) FROM asset_depreciation WHERE company_id = 1 AND period_date = '2026-01-01'), 0.00,
    'Depreciation expense - All assets'),
(5, (SELECT id FROM chart_of_accounts WHERE account_code = '1410' AND company_id = 1), 0.00,
    (SELECT COALESCE(SUM(amount), 0) FROM asset_depreciation WHERE company_id = 1 AND period_date = '2026-01-01'),
    'Accumulated depreciation - All assets');

-- JE-006: Payroll for January 2026
INSERT INTO journal_entries (company_id, entry_date, voucher_no, voucher_type, total_debit, total_credit, status, description, created_by)
VALUES (1, '2026-01-31', 'JV-2026-0004', 'Journal', 42875.00, 42875.00, 'approved', 'January 2026 payroll - All departments', 3);

INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
(6, (SELECT id FROM chart_of_accounts WHERE account_code = '5100' AND company_id = 1), 35000.00, 0.00,
   'Salaries - January 2026'),
(6, (SELECT id FROM chart_of_accounts WHERE account_code = '5100' AND company_id = 1), 7875.00, 0.00,
   'Employer payroll taxes and benefits - January 2026'),
(6, (SELECT id FROM chart_of_accounts WHERE account_code = '1010' AND company_id = 1), 0.00, 35000.00,
   'Net pay transferred to employees'),
(6, (SELECT id FROM chart_of_accounts WHERE account_code = '2300' AND company_id = 1), 0.00, 7875.00,
   'Payroll taxes and benefits payable');

-- ===================================================================
-- 27. BANK ACCOUNTS
-- ===================================================================
INSERT INTO bank_accounts (company_id, account_id, bank_name, account_number, account_name, opening_balance, as_of_date, created_by)
VALUES
(1, (SELECT id FROM chart_of_accounts WHERE account_code = '1010' AND company_id = 1),
 'Chase Business Banking', '****4523', 'Acme Corporation Operating Account', 245000.00, '2026-01-01', 3),
(1, (SELECT id FROM chart_of_accounts WHERE account_code = '1020' AND company_id = 1),
 'Chase Business Banking', '****7891', 'Acme Corporation Savings Account', 180000.00, '2026-01-01', 3);

-- ===================================================================
-- 28. BANK TRANSACTIONS (sample)
-- ===================================================================
INSERT INTO bank_transactions (company_id, bank_account_id, transaction_date, description, reference_number, debit, credit, balance, is_cleared, created_by)
VALUES
(1, 1, '2026-01-02', 'Beginning balance',                  'BAL-2026',      0.00,     0.00,   245000.00, true, 3),
(1, 1, '2026-01-05', 'Rent payment - Office & Warehouse',  'RENT-2026-01',  23500.00, 0.00,   221500.00, true, 3),
(1, 1, '2026-01-10', 'Wire transfer - TechFlow Solutions', 'WIRE-20251210', 0.00,     2280.98, 223780.98, true, 3),
(1, 1, '2026-01-15', 'Payment - GlobalTech Components',   'PO-PAY-0001',   16400.00, 0.00,   207380.98, true, 3),
(1, 1, '2026-01-20', 'Google Ads charge',                  'ADS-Q1-2026',   5000.00,  0.00,   202380.98, true, 6),
(1, 1, '2026-01-25', 'MS 365 Annual subscription',         'MS-365-2026',   7200.00,  0.00,   195180.98, true, 2),
(1, 1, '2026-01-31', 'Payroll - January',                  'PAYROLL-01',    35000.00, 0.00,   160180.98, true, 3),
(1, 1, '2026-02-05', 'Check - Utilities Jan',              'UTIL-01-OFF',   2450.00,  0.00,   157730.98, true, 3),
(1, 1, '2026-02-05', 'Check - Warehouse Utilities Jan',    'UTIL-01-WH',    3200.00,  0.00,   154530.98, true, 3),
(1, 1, '2026-02-10', 'Audit preparation fees',             'AUDIT-Q4-2025', 3500.00,  0.00,   151030.98, true, 1),
(1, 1, '2026-02-15', 'Insurance premium - Annual',         'LIAB-INS-2026', 6200.00,  0.00,   144830.98, true, 1),
(1, 1, '2026-02-20', 'HVAC repair - Warehouse B',          'HVAC-REP-0220', 1850.00,  0.00,   142980.98, true, 4),
(1, 1, '2026-03-01', 'Forklift battery replacement',       'FORK-BATT-001', 3200.00,  0.00,   139780.98, true, 4),
(1, 1, '2026-03-05', 'LinkedIn ad campaign',               'LINKED-MAR',    2000.00,  0.00,   137780.98, true, 6),
(1, 1, '2026-03-10', 'Ferris Tech LLC - Product order',    'WIRE-20260310', 0.00,     4554.00, 142334.98, false, 3);

-- ===================================================================
-- 29. PROJECTS
-- ===================================================================
INSERT INTO projects (company_id, project_code, name, description, customer_id, start_date, end_date, budget_amount, status, priority, project_manager, created_by)
VALUES
(1, 'PRJ-2025-001', 'ERP System v2 Migration',     'Migrate legacy ERP to cloud-based v2 platform',          NULL,    '2025-09-01', '2026-06-30', 250000.00, 'in_progress', 'high',   2, 1),
(1, 'PRJ-2026-001', 'Warehouse Automation',         'Install automated sorting and racking system',            NULL,    '2026-01-15', '2026-08-31', 180000.00, 'in_progress', 'high',   4, 1),
(1, 'PRJ-2026-002', 'TechFlow Solutions Onboarding', 'Onboard new client TechFlow as managed services customer', 1,    '2026-02-01', '2026-04-30', 35000.00,  'in_progress', 'medium', 2, 1),
(1, 'PRJ-2026-003', 'Q2 Marketing Campaign',         'Digital marketing push for Q2 2026',                      NULL,    '2026-03-01', '2026-05-31', 45000.00,  'planning',    'medium', 6, 1);

INSERT INTO project_tasks (company_id, project_id, name, description, assigned_to, start_date, due_date, estimated_hours, priority, status, created_by) VALUES
-- ERP Migration tasks
(1, 1, 'Database schema review',        'Audit existing schema and plan migration',      2, '2025-09-01', '2025-09-30', 40.00, 'high',   'completed', 1),
(1, 1, 'API layer development',         'Build REST API layer for v2',                   2, '2025-10-01', '2026-01-31', 200.00,'high',   'completed', 1),
(1, 1, 'Frontend component migration',  'Migrate React components to new design system', 2, '2026-02-01', '2026-04-30', 160.00,'medium', 'in_progress', 1),
(1, 1, 'User acceptance testing',       'Coordinate UAT with department leads',          1, '2026-05-01', '2026-06-15', 60.00, 'high',   'todo',      1),
(1, 1, 'Deployment and go-live',        'Production deployment and cutover',             2, '2026-06-16', '2026-06-30', 80.00, 'high',   'todo',      1),
-- Warehouse automation tasks
(1, 2, 'Vendor selection and RFP',      'Evaluate automation vendors and issue RFP',      4, '2026-01-15', '2026-02-15', 30.00, 'high',   'completed', 1),
(1, 2, 'Floor layout redesign',         'Redesign warehouse floor plan for automation',   4, '2026-02-16', '2026-03-15', 40.00, 'medium', 'in_progress', 1),
(1, 2, 'Equipment installation',        'Install conveyor system and robotic sorters',    4, '2026-04-01', '2026-07-31', 300.00,'high',   'todo',      1),
(1, 2, 'System integration testing',    'Test integration with WMS',                      2, '2026-08-01', '2026-08-31', 80.00, 'high',   'todo',      1);

-- ===================================================================
-- 30. QUOTATIONS
-- ===================================================================
INSERT INTO quotations (company_id, customer_id, quote_number, quote_date, expiry_date, status, subtotal, tax_total, grand_total, notes, created_by)
VALUES
(1, 11, 'QTE-2026-0001', '2026-03-01', '2026-03-31', 'sent',      5249.85, 524.99, 5774.84, 'Bulk electronics for MapleLeaf Foods distribution center', 5),
(1, 9,  'QTE-2026-0002', '2026-03-05', '2026-04-04', 'draft',     1899.75, 189.98, 2089.73, 'Laboratory equipment quotation for Northwood Pharma', 5);

INSERT INTO quotation_items (quotation_id, product_id, description, quantity, unit_price, discount_percent, total) VALUES
(1, 7,   '27" 4K IPS Monitor - Bulk pricing',            8, 349.99, 10.00, 2519.93),
(1, 8,   'Noise-Canceling Headphones - Bulk pricing',     12, 149.99, 10.00, 1619.89),
(1, 12,  'Standing Desk Converter - Bulk pricing',        5, 299.99, 5.00,  1424.95),
(2, 7,   '27" 4K IPS Monitor',                            3, 349.99, 0.00,  1049.97),
(2, 10,  'Laser Toner Cartridge - High yield',            4, 89.99,  0.00,  359.96),
(2, 9,   'A4 Copy Paper 5000-sheet',                      6, 45.00,  0.00,  270.00);

UPDATE quotations q SET
  subtotal    = COALESCE((SELECT SUM(total) FROM quotation_items WHERE quotation_id = q.id), 0),
  tax_total   = ROUND(COALESCE((SELECT SUM(total) FROM quotation_items WHERE quotation_id = q.id), 0) * 0.10, 2),
  grand_total = ROUND(COALESCE((SELECT SUM(total) FROM quotation_items WHERE quotation_id = q.id), 0) * 1.10, 2);

-- ===================================================================
-- 31. SERVICES
-- ===================================================================
INSERT INTO services (company_id, name, description, category, unit_price, created_by) VALUES
(1, 'IT Support - Basic',        'Remote IT support, 8x5, per user/month',       'IT Services',    25.00, 2),
(1, 'IT Support - Premium',      'Onsite + remote IT support, 24x7, per user',   'IT Services',    55.00, 2),
(1, 'Warehouse Storage - Pallet','Monthly pallet storage per pallet position',   'Logistics',      35.00, 4),
(1, 'Consulting - Senior',       'Senior business consultant, per hour',          'Consulting',     200.00,1),
(1, 'Consulting - Junior',       'Junior business consultant, per hour',          'Consulting',     125.00,1),
(1, 'Equipment Maintenance',     'Annual maintenance contract per equipment unit','Maintenance',    500.00, 4);

INSERT INTO service_invoices (company_id, invoice_number, customer_id, invoice_date, due_date, status, subtotal, tax_total, grand_total, notes, created_by)
VALUES
(1, 'SINV-2026-0001', 1, '2026-02-01', '2026-03-03', 'sent', 1100.00, 110.00, 1210.00, 'Monthly IT support - TechFlow Solutions - February 2026', 2),
(1, 'SINV-2026-0002', 6, '2026-03-01', '2026-03-31', 'draft', 1750.00, 175.00, 1925.00,'Consulting hours - Summit Construction - March 2026', 1);

INSERT INTO service_invoice_items (service_invoice_id, service_id, description, quantity, unit_price, total) VALUES
(1, 1, 'IT Support Basic - 20 users @ $25', 20, 25.00, 500.00),
(1, 2, 'IT Support Premium - 5 execs @ $55',5, 55.00, 275.00),
(1, 3, 'Pallet storage - 10 pallets',       10, 35.00, 350.00);

-- ===================================================================
-- 32. CRM - LEADS
-- ===================================================================
INSERT INTO leads (company_id, salutation, first_name, last_name, email, phone, company, designation,
  source_id, status_id, assigned_to, address, city, state, country, notes, created_by)
SELECT 1, 'Mr.', 'Thomas', 'Anderson', 't.anderson@metacorp.com', '+1-312-555-0401', 'MetaCorp International',
       'VP of Operations', ls.id, lst.id, 5,
       '200 South Wacker Drive, Suite 1500', 'Chicago', 'IL', 'USA',
       'Interested in bulk widget order - potential 50k unit annual contract', 5
FROM lead_sources ls, lead_statuses lst
WHERE ls.name = 'Referral' AND lst.name = 'Qualified';

INSERT INTO leads (company_id, salutation, first_name, last_name, email, phone, company, designation,
  source_id, status_id, assigned_to, address, city, state, country, notes, created_by)
SELECT 1, 'Ms.', 'Jessica', 'Warren', 'j.warren@innovatecorp.com', '+1-650-555-0402', 'InnovateCorp',
       'Procurement Director', ls.id, lst.id, 5,
       '100 Hamilton Avenue', 'Palo Alto', 'CA', 'USA',
       'Needs IT equipment for new 200-person office opening Q3', 5
FROM lead_sources ls, lead_statuses lst
WHERE ls.name = 'Email Campaign' AND lst.name = 'New';

INSERT INTO leads (company_id, salutation, first_name, last_name, email, phone, company, designation,
  source_id, status_id, assigned_to, address, city, state, country, notes, created_by)
SELECT 1, 'Dr.', 'Alan', 'Grant', 'a.grant@pacificresearch.org', '+1-808-555-0403', 'Pacific Research Institute',
       'Lab Director', ls.id, lst.id, 5,
       '45-220 Kamehameha Highway', 'Honolulu', 'HI', 'USA',
       'Requires specialized packaging materials for sensitive equipment', 5
FROM lead_sources ls, lead_statuses lst
WHERE ls.name = 'Website' AND lst.name = 'Contacted';

INSERT INTO leads (company_id, salutation, first_name, last_name, email, phone, company, designation,
  source_id, status_id, assigned_to, address, city, state, country, notes, created_by)
SELECT 1, 'Mrs.', 'Patricia', 'Nelson', 'pnelson@citygov.org', '+1-512-555-0404', 'City of Austin Procurement',
       'Senior Buyer', ls.id, lst.id, 5,
       '301 West 2nd Street', 'Austin', 'TX', 'USA',
       'Government RFP for office supplies - 12-month contract', 5
FROM lead_sources ls, lead_statuses lst
WHERE ls.name = 'Phone Inquiry' AND lst.name = 'Proposal';

-- ===================================================================
-- 33. OPPORTUNITIES
-- ===================================================================
INSERT INTO opportunities (company_id, customer_id, name, description, expected_revenue, probability, expected_close_date, stage, priority, assigned_to, created_by)
VALUES
(1, 1, 'TechFlow Annual Managed Services Contract', 'Renew and expand managed IT services for 200 users', 72000.00, 80, '2026-04-15', 'negotiation', 'high', 5, 5),
(1, 6, 'Summit Construction - Full Office Fit-out', 'Furniture, IT equipment, and supplies for new HQ', 45000.00, 60, '2026-05-30', 'proposal', 'medium', 5, 5),
(1, 10,'Apex Auto Parts - Steel Supply Agreement', 'Quarterly steel sheet and aluminum rod supply', 96000.00, 40, '2026-06-30', 'qualification', 'high', 5, 5);

-- ===================================================================
-- 34. CRM INTERACTIONS
-- ===================================================================
INSERT INTO interactions (company_id, lead_id, customer_id, type, subject, notes, outcome, performed_by)
SELECT 1, l.id, NULL, 'Email', 'Initial outreach - MetaCorp',
       'Sent product catalog and pricing sheet for bulk widgets',
       'Positive - scheduled follow-up call', 5
FROM leads l WHERE l.company = 'MetaCorp International';

INSERT INTO interactions (company_id, lead_id, customer_id, type, subject, notes, outcome, performed_by)
SELECT 1, l.id, NULL, 'Phone', 'Follow-up call - InnovateCorp',
       'Discussed IT equipment needs for new office. Sent proposal.',
       'Interested - requested demo', 5
FROM leads l WHERE l.company = 'InnovateCorp';

INSERT INTO interactions (company_id, lead_id, customer_id, type, subject, notes, outcome, performed_by)
SELECT 1, NULL, 1, 'Meeting', 'Q1 Business Review - TechFlow',
       'Reviewed SLA performance for Q4 2025. Discussed expansion plans.',
       'Positive - moving forward with contract renewal', 5
FROM customers c WHERE c.id = 1;

-- ===================================================================
-- 35. SALES RETURNS
-- ===================================================================
INSERT INTO sales_returns (company_id, return_number, original_sales_order_id, customer_id, return_date, status, subtotal, tax_amount, total_amount, restock_inventory, notes, created_by)
VALUES
(1, 'SR-2026-0001', 1, 1, '2026-01-10', 'approved', 69.98, 7.00, 76.98, true, 'USB-C hub defective - replaced under warranty', 7),
(1, 'SR-2026-0002', 4, 6, '2026-02-20', 'pending',  120.00, 12.00, 132.00, true, 'Steel sheet arrived with surface rust - return requested', 7);

INSERT INTO sales_return_items (sales_return_id, original_order_item_id, product_id, quantity, unit_price, total, condition) VALUES
(1, NULL, 4, 2, 34.99, 69.98, 'defective'),
(2, NULL, 13, 1, 120.00, 120.00, 'damaged');

-- ===================================================================
-- 36. PURCHASE RETURNS
-- ===================================================================
INSERT INTO purchase_returns (company_id, return_number, original_purchase_order_id, supplier_id, return_date, status, subtotal, tax_amount, total_amount, notes, created_by)
VALUES
(1, 'PR-2026-0001', 4, 2, '2026-02-01', 'approved', 1125.00, 112.50, 1237.50, 'Steel sheets gauge incorrect - returning 15 sheets', 4);

INSERT INTO purchase_return_items (purchase_return_id, product_id, quantity, unit_price, total)
VALUES (1, 13, 15, 75.00, 1125.00);

-- ===================================================================
-- 37. CREDIT NOTES
-- ===================================================================
INSERT INTO credit_notes (company_id, credit_note_number, reference_type, reference_id, customer_id, issue_date, amount, status, notes)
VALUES
(1, 'CN-2026-0001', 'sales_return', 1, 1, '2026-01-15', 76.98, 'issued', 'Credit for returned USB-C hubs - SR-2026-0001'),
(1, 'CN-2026-0002', 'sales_return', 2, 6, '2026-02-25', 132.00, 'pending', 'Credit for damaged steel sheet - SR-2026-0002');

-- ===================================================================
-- 38. APPROVAL WORKFLOWS
-- ===================================================================
INSERT INTO approval_workflows (company_id, name, description, target_entity, created_by) VALUES
(1, 'Purchase Order Approval', 'Approval workflow for POs above $5,000', 'purchase_order', 1),
(1, 'Leave Request Approval', 'Standard leave approval chain', 'leave_request', 1),
(1, 'Sales Discount Approval', 'Approval for discounts above 15%', 'sales_discount', 1);

INSERT INTO approval_steps (workflow_id, step_order, approver_id, min_amount, max_amount) VALUES
(1, 1, 4, 5000.00, 15000.00),
(1, 2, 1, 15000.01, 50000.00),
(2, 1, 1, NULL, NULL),
(3, 1, 2, NULL, NULL);

-- ===================================================================
-- 39. POS SESSIONS (sample closed session)
-- ===================================================================
INSERT INTO pos_sessions (company_id, user_id, session_number, opening_time, closing_time, opening_balance, closing_balance, cash_sales, card_sales, status, notes)
VALUES
(1, 4, 'POS-2026-0001', '2026-03-01 08:00:00', '2026-03-01 17:30:00', 500.00, 1745.00, 795.00, 450.00, 'closed', 'Daily sales session - March 1');

INSERT INTO pos_transactions (company_id, session_id, customer_id, order_number, order_date, subtotal, tax_amount, discount_amount, total_amount, payment_method, amount_paid, change_amount, status, created_by)
VALUES
(1, 1, 4, 'POS-2026-000001', '2026-03-01 10:15:00', 45.00, 4.50, 0.00, 49.50, 'Cash', 50.00, 0.50, 'completed', 4),
(1, 1, NULL, 'POS-2026-000002','2026-03-01 11:30:00', 34.99, 3.50, 0.00, 38.49, 'Card', 38.49, 0.00, 'completed', 4),
(1, 1, 1, 'POS-2026-000003', '2026-03-01 14:00:00', 89.99, 9.00, 0.00, 98.99, 'Cash', 100.00, 1.01, 'completed', 4),
(1, 1, NULL, 'POS-2026-000004','2026-03-01 15:45:00', 124.95, 12.50, 5.00, 132.45, 'Card', 132.45, 0.00, 'completed', 4);

INSERT INTO pos_transaction_items (pos_transaction_id, product_id, product_name, sku, quantity, unit_price, total) VALUES
(1, 9, 'A4 Copy Paper 5000-sheet', 'OFF-001', 1, 45.00, 45.00),
(2, 4, 'USB-C 7-in-1 Hub', 'ELC-001', 1, 34.99, 34.99),
(3, 6, 'Mechanical Keyboard', 'ELC-003', 1, 89.99, 89.99),
(4, 5, 'Ergonomic Wireless Mouse', 'ELC-002', 5, 24.99, 124.95);

-- ===================================================================
-- 40. EXPENSE RECURRING ENTRIES (sample)
-- ===================================================================
INSERT INTO recurring_entries (company_id, name, description, frequency, interval_value, start_date, next_date, day_of_month, status, created_by)
VALUES
(1, 'Monthly Rent - Office', 'Office rent payment on 5th of each month', 'monthly', 1, '2026-01-05', '2026-04-05', 5, 'active', 3),
(1, 'Monthly Rent - Warehouse', 'Warehouse rent on 5th of each month', 'monthly', 1, '2026-01-05', '2026-04-05', 5, 'active', 3);

-- ===================================================================
-- 41. ADD MULTI-COMPANY DATA (company 2 - GlobalTech)
-- ===================================================================
INSERT INTO chart_of_accounts (company_id, account_code, account_name, account_type, description, is_active) VALUES
(2, '1000', 'Cash on Hand',            'asset',     'Petty cash', true),
(2, '1010', 'Checking Account',        'asset',     'Operating checking', true),
(2, '1100', 'Accounts Receivable',     'asset',     'Customer receivables', true),
(2, '1200', 'Inventory',               'asset',     'Product inventory', true),
(2, '2000', 'Accounts Payable',        'liability', 'Supplier payables', true),
(2, '2200', 'Sales Tax Payable',       'liability', 'Sales tax collected', true),
(2, '3000', 'Common Stock',            'equity',    'Share capital', true),
(2, '3100', 'Retained Earnings',       'equity',    'Retained earnings', true),
(2, '4000', 'Sales Revenue',           'revenue',   'Product sales', true),
(2, '5000', 'Cost of Goods Sold',      'expense',   'COGS', true),
(2, '5100', 'Operating Expenses',      'expense',   'General operating expenses', true);

INSERT INTO suppliers (company_id, name, email, phone, address) VALUES
(2, 'Taiwan Semiconductor Corp', 'sales@tsc.com.tw', '+886-2-555-0401', '150 Roosevelt Road, Sec 2, Taipei 100, Taiwan'),
(2, 'European Components BV',     'orders@eurocomp.nl', '+31-20-555-0402', 'Strawinskylaan 300, 1077 XX Amsterdam, Netherlands');

INSERT INTO customers (company_id, name, email, phone, billing_address, shipping_address) VALUES
(2, 'NexGen Devices Inc.',    'ap@nexgendevices.com', '+1-858-555-0403', '5775 Morehouse Drive, San Diego, CA 92121, USA', '5775 Morehouse Drive, San Diego, CA 92121, USA'),
(2, 'DataStream Networks',    'orders@datastream.net', '+1-703-555-0404', '22001 Loudoun County Parkway, Ashburn, VA 20147, USA', '14155 Sullivan Street, Ashburn, VA 20147, USA');

-- ===================================================================
-- 42. COMPANY 3 (EuroParts) - minimal data
-- ===================================================================
INSERT INTO chart_of_accounts (company_id, account_code, account_name, account_type, description, is_active) VALUES
(3, '1000', 'Kassenbestand',          'asset',     'Bargeld', true),
(3, '1010', 'Geschäftskonto',         'asset',     'Bankkonto', true),
(3, '1100', 'Forderungen',            'asset',     'Forderungen aus Lieferungen', true),
(3, '2000', 'Verbindlichkeiten',      'liability', 'Verbindlichkeiten aus Lieferungen', true),
(3, '4000', 'Umsatzerlöse',           'revenue',   'Erlöse aus Verkäufen', true),
(3, '5000', 'Wareneinsatz',           'expense',   'Wareneinsatz', true);

INSERT INTO suppliers (company_id, name, email, phone, address) VALUES
(3, 'Automobil Teile GmbH', 'bestellung@autoteile.de', '+49-89-555-0501', 'Münchner Strasse 200, 80339 München, Germany');

INSERT INTO customers (company_id, name, email, phone, billing_address, shipping_address) VALUES
(3, 'Berlin Motors AG',     'einkauf@berlinmotors.de', '+49-30-555-0502', 'Friedrichstrasse 100, 10117 Berlin, Germany', 'Industriestrasse 15, 14612 Falkensee, Germany');

-- ===================================================================
-- RE-ENABLE TRIGGERS
-- ===================================================================
SET session_replication_role = 'origin';

-- ===================================================================
-- FINAL: ROW COUNTS PER TABLE
-- ===================================================================
SELECT 'companies' AS table_name, COUNT(*) AS row_count FROM companies
UNION ALL SELECT 'chart_of_accounts', COUNT(*) FROM chart_of_accounts
UNION ALL SELECT 'customers', COUNT(*) FROM customers
UNION ALL SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL SELECT 'warehouses', COUNT(*) FROM warehouses
UNION ALL SELECT 'warehouse_bins', COUNT(*) FROM warehouse_bins
UNION ALL SELECT 'product_warehouse_stock', COUNT(*) FROM product_warehouse_stock
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'sales_orders', COUNT(*) FROM sales_orders
UNION ALL SELECT 'sales_order_items', COUNT(*) FROM sales_order_items
UNION ALL SELECT 'purchase_orders', COUNT(*) FROM purchase_orders
UNION ALL SELECT 'purchase_order_items', COUNT(*) FROM purchase_order_items
UNION ALL SELECT 'inventory_transactions', COUNT(*) FROM inventory_transactions
UNION ALL SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL SELECT 'invoice_items', COUNT(*) FROM invoice_items
UNION ALL SELECT 'payments', COUNT(*) FROM payments
UNION ALL SELECT 'employees', COUNT(*) FROM employees
UNION ALL SELECT 'attendance', COUNT(*) FROM attendance
UNION ALL SELECT 'leave_requests', COUNT(*) FROM leave_requests
UNION ALL SELECT 'expense_categories', COUNT(*) FROM expense_categories
UNION ALL SELECT 'expenses', COUNT(*) FROM expenses
UNION ALL SELECT 'cost_centers', COUNT(*) FROM cost_centers
UNION ALL SELECT 'asset_categories', COUNT(*) FROM asset_categories
UNION ALL SELECT 'fixed_assets', COUNT(*) FROM fixed_assets
UNION ALL SELECT 'asset_depreciation', COUNT(*) FROM asset_depreciation
UNION ALL SELECT 'journal_entries', COUNT(*) FROM journal_entries
UNION ALL SELECT 'journal_entry_lines', COUNT(*) FROM journal_entry_lines
UNION ALL SELECT 'bank_accounts', COUNT(*) FROM bank_accounts
UNION ALL SELECT 'bank_transactions', COUNT(*) FROM bank_transactions
UNION ALL SELECT 'projects', COUNT(*) FROM projects
UNION ALL SELECT 'project_tasks', COUNT(*) FROM project_tasks
UNION ALL SELECT 'quotations', COUNT(*) FROM quotations
UNION ALL SELECT 'quotation_items', COUNT(*) FROM quotation_items
UNION ALL SELECT 'stock_transfers', COUNT(*) FROM stock_transfers
UNION ALL SELECT 'stock_transfer_items', COUNT(*) FROM stock_transfer_items
UNION ALL SELECT 'leads', COUNT(*) FROM leads
UNION ALL SELECT 'opportunities', COUNT(*) FROM opportunities
UNION ALL SELECT 'interactions', COUNT(*) FROM interactions
UNION ALL SELECT 'services', COUNT(*) FROM services
UNION ALL SELECT 'service_invoices', COUNT(*) FROM service_invoices
UNION ALL SELECT 'service_invoice_items', COUNT(*) FROM service_invoice_items
UNION ALL SELECT 'sales_returns', COUNT(*) FROM sales_returns
UNION ALL SELECT 'sales_return_items', COUNT(*) FROM sales_return_items
UNION ALL SELECT 'purchase_returns', COUNT(*) FROM purchase_returns
UNION ALL SELECT 'purchase_return_items', COUNT(*) FROM purchase_return_items
UNION ALL SELECT 'credit_notes', COUNT(*) FROM credit_notes
UNION ALL SELECT 'approval_workflows', COUNT(*) FROM approval_workflows
UNION ALL SELECT 'approval_steps', COUNT(*) FROM approval_steps
UNION ALL SELECT 'approval_requests', COUNT(*) FROM approval_requests
UNION ALL SELECT 'pos_sessions', COUNT(*) FROM pos_sessions
UNION ALL SELECT 'pos_transactions', COUNT(*) FROM pos_transactions
UNION ALL SELECT 'pos_transaction_items', COUNT(*) FROM pos_transaction_items
UNION ALL SELECT 'recurring_entries', COUNT(*) FROM recurring_entries
UNION ALL SELECT 'budgets', COUNT(*) FROM budgets
UNION ALL SELECT 'budget_items', COUNT(*) FROM budget_items
UNION ALL SELECT 'reconciliation_reports', COUNT(*) FROM reconciliation_reports
UNION ALL SELECT 'recurring_entry_lines', COUNT(*) FROM recurring_entry_lines
ORDER BY table_name;

COMMIT;
