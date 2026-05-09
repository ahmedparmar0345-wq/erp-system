-- ==========================================================================
-- ERP DATA RESET & POPULATION SCRIPT
-- ==========================================================================
-- Purpose: Clears all business data (not auth) and inserts realistic demo data
-- Database: PostgreSQL
-- Usage:   psql -U postgres -d postgres -f reset_and_populate_data.sql
-- ==========================================================================

BEGIN;

-- ==========================================================================
-- STEP 1: Disable FK triggers temporarily for clean deletion
-- ==========================================================================
SET session_replication_role = 'replica';

-- ==========================================================================
-- STEP 2: Delete existing data (reverse FK dependency order)
--    Auth tables (users, roles, system_settings, email_templates, audit_logs,
--    lead_sources, lead_statuses, leave_types, return_reasons) are PRESERVED.
-- ==========================================================================

DELETE FROM approval_logs;
DELETE FROM approval_requests;
DELETE FROM approval_steps;
DELETE FROM approval_workflows;
DELETE FROM time_entries;
DELETE FROM project_members;
DELETE FROM project_tasks;
DELETE FROM projects;
DELETE FROM asset_depreciation;
DELETE FROM asset_maintenance;
DELETE FROM fixed_assets;
DELETE FROM asset_categories;
DELETE FROM pos_transaction_items;
DELETE FROM pos_transactions;
DELETE FROM pos_cart;
DELETE FROM pos_sessions;
DELETE FROM bank_transactions;
DELETE FROM bank_accounts;
DELETE FROM reconciliation_reports;
DELETE FROM recurring_entry_lines;
DELETE FROM recurring_entries;
DELETE FROM budget_items;
DELETE FROM budgets;
DELETE FROM expenses;
DELETE FROM expense_categories;
DELETE FROM payments;
DELETE FROM invoice_items;
DELETE FROM invoices;
DELETE FROM credit_notes;
DELETE FROM purchase_return_items;
DELETE FROM purchase_returns;
DELETE FROM sales_return_items;
DELETE FROM sales_returns;
DELETE FROM journal_entry_lines;
DELETE FROM journal_entries;
DELETE FROM chart_of_accounts;
DELETE FROM cost_centers;
DELETE FROM service_invoice_items;
DELETE FROM service_invoices;
DELETE FROM services;
DELETE FROM stock_transfer_items;
DELETE FROM stock_transfers;
DELETE FROM product_warehouse_stock;
DELETE FROM warehouse_bins;
DELETE FROM warehouses;
DELETE FROM inventory_transactions;
DELETE FROM sales_order_items;
DELETE FROM sales_orders;
DELETE FROM quotation_items;
DELETE FROM quotations;
DELETE FROM purchase_order_items;
DELETE FROM purchase_orders;
DELETE FROM follow_ups;
DELETE FROM opportunities;
DELETE FROM interactions;
DELETE FROM leads;
DELETE FROM employee_documents;
DELETE FROM leave_requests;
DELETE FROM attendance;
DELETE FROM employees;
DELETE FROM products;
DELETE FROM customers;
DELETE FROM suppliers;

-- ==========================================================================
-- STEP 3: Re-enable FK triggers
-- ==========================================================================
SET session_replication_role = 'origin';

-- ==========================================================================
-- STEP 4: Reset sequences for all cleared tables
-- ==========================================================================
DO $$
DECLARE
    tbl TEXT;
    seq_name TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'approval_logs', 'approval_requests', 'approval_steps', 'approval_workflows',
            'time_entries', 'project_members', 'project_tasks', 'projects',
            'asset_depreciation', 'asset_maintenance', 'fixed_assets', 'asset_categories',
            'pos_transaction_items', 'pos_transactions', 'pos_cart', 'pos_sessions',
            'bank_transactions', 'bank_accounts', 'reconciliation_reports',
            'recurring_entry_lines', 'recurring_entries', 'budget_items', 'budgets',
            'expenses', 'expense_categories', 'payments', 'invoice_items', 'invoices',
            'credit_notes', 'purchase_return_items', 'purchase_returns',
            'sales_return_items', 'sales_returns', 'journal_entry_lines', 'journal_entries',
            'chart_of_accounts', 'cost_centers', 'service_invoice_items', 'service_invoices',
            'services', 'stock_transfer_items', 'stock_transfers', 'product_warehouse_stock',
            'warehouse_bins', 'warehouses', 'inventory_transactions',
            'sales_order_items', 'sales_orders', 'quotation_items', 'quotations',
            'purchase_order_items', 'purchase_orders', 'follow_ups', 'opportunities',
            'interactions', 'leads', 'employee_documents', 'leave_requests', 'attendance',
            'employees', 'products', 'customers', 'suppliers'
        ])
    LOOP
        BEGIN
            seq_name := tbl || '_id_seq';
            IF EXISTS (SELECT 1 FROM pg_class WHERE relname = seq_name AND relkind = 'S') THEN
                EXECUTE 'ALTER SEQUENCE ' || seq_name || ' RESTART WITH 1';
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not reset sequence for table: %', tbl;
        END;
    END LOOP;
END $$;

-- ==========================================================================
-- STEP 5: INSERT DEMO DATA (company_id = 1 for all)
-- ==========================================================================

-- ------------------------------------------------------------------
-- 5a. COMPANIES (keep existing "Acme Corp" - id=1 is already there)
-- ------------------------------------------------------------------
INSERT INTO companies (id, name, tax_id, email, phone, address, currency)
SELECT 1, 'Acme Corp', 'TAX-84-1234567', 'info@acmecorp.com', '+1 (212) 555-0198', '350 Fifth Avenue, Suite 7200, New York, NY 10118', 'USD'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE id = 1);

-- ------------------------------------------------------------------
-- 5b. WAREHOUSES / LOCATIONS
-- ------------------------------------------------------------------
INSERT INTO warehouses (company_id, code, name, address, city, state, country, postal_code, phone, email, is_default, is_active) VALUES
(1, 'WH-NYC', 'New York Main Warehouse', '100 Broadway, Suite 100', 'New York', 'NY', 'USA', '10013', '+1 (212) 555-1001', 'nyc.wh@acmecorp.com', true, true),
(1, 'WH-CHI', 'Chicago Distribution Center', '4500 W 47th Street', 'Chicago', 'IL', 'USA', '60632', '+1 (312) 555-1002', 'chi.wh@acmecorp.com', false, true),
(1, 'WH-LAX', 'Los Angeles Regional Hub', '1201 S Alameda Street', 'Los Angeles', 'CA', 'USA', '90021', '+1 (213) 555-1003', 'lax.wh@acmecorp.com', false, true);

-- ------------------------------------------------------------------
-- 5c. WAREHOUSE BINS
-- ------------------------------------------------------------------
INSERT INTO warehouse_bins (company_id, warehouse_id, code, name, zone, aisle, rack, shelf, max_capacity, is_active) VALUES
(1, 1, 'NYC-A1-01', 'Aisle A Rack 1 Shelf 1', 'Storage A', 'A1', 'R1', 'S1', 500, true),
(1, 1, 'NYC-A1-02', 'Aisle A Rack 1 Shelf 2', 'Storage A', 'A1', 'R1', 'S2', 500, true),
(1, 1, 'NYC-B1-01', 'Aisle B Rack 1 Shelf 1', 'Storage B', 'B1', 'R1', 'S1', 300, true),
(1, 2, 'CHI-A1-01', 'Chicago Aisle A Rack 1', 'Storage A', 'A1', 'R1', 'S1', 400, true),
(1, 2, 'CHI-A2-01', 'Chicago Aisle A Rack 2', 'Storage A', 'A2', 'R2', 'S1', 400, true),
(1, 3, 'LAX-A1-01', 'LA Aisle A Rack 1', 'Storage A', 'A1', 'R1', 'S1', 350, true);

-- ------------------------------------------------------------------
-- 5d. PRODUCTS / ITEMS
-- ------------------------------------------------------------------
INSERT INTO products (company_id, sku, name, description, unit_price, cost_price, current_stock, reorder_level, tax_rate_id) VALUES
-- Electronics
(1, 'LAP-PRO-15', 'PrecisionPro Laptop 15"', '15.6" FHD Laptop, Intel i7, 16GB RAM, 512GB SSD', 1299.99, 899.00, 45, 10, 1),
(1, 'LAP-PRO-13', 'PrecisionPro Laptop 13"', '13.3" 2K Laptop, Intel i5, 8GB RAM, 256GB SSD', 899.99, 625.00, 60, 15, 1),
(1, 'MON-27-4K', 'ClearView 27" 4K Monitor', '27" UHD 3840x2160 IPS Monitor, USB-C', 549.99, 350.00, 30, 8, 1),
(1, 'MON-24-FHD', 'ClearView 24" FHD Monitor', '24" Full HD 1920x1080 IPS Monitor', 249.99, 155.00, 80, 20, 1),
(1, 'KBD-MECH', 'TactileType Mechanical Keyboard', 'Cherry MX Blue Switches, RGB Backlight', 149.99, 85.00, 120, 25, 1),
(1, 'MSE-ERG', 'ErgoGrip Wireless Mouse', 'Ergonomic Vertical Mouse, 6 Buttons', 49.99, 28.00, 200, 40, 2),
(1, 'HDD-4TB', 'DataVault 4TB External HDD', '4TB USB 3.0 External Hard Drive', 119.99, 72.00, 55, 15, 1),

-- Office Supplies
(1, 'PAP-A4-500', 'Premium A4 Printer Paper 500pk', '80gsm Bright White Multipurpose Paper', 8.99, 4.50, 500, 100, 3),
(1, 'TON-CYAN', 'ColorPrint Cyan Toner Cartridge', 'High-yield Cyan Toner, 3000 pages', 89.99, 52.00, 35, 10, 1),
(1, 'TON-MAG', 'ColorPrint Magenta Toner Cartridge', 'High-yield Magenta Toner, 3000 pages', 89.99, 52.00, 35, 10, 1),
(1, 'TON-YEL', 'ColorPrint Yellow Toner Cartridge', 'High-yield Yellow Toner, 3000 pages', 89.99, 52.00, 35, 10, 1),
(1, 'TON-BLK', 'ColorPrint Black Toner Cartridge', 'High-yield Black Toner, 5000 pages', 79.99, 45.00, 40, 12, 1),

-- Packaging Materials
(1, 'BOX-SM', 'Corrugated Shipping Box Small', '12x10x8 inch corrugated cardboard box', 1.49, 0.65, 2000, 500, 3),
(1, 'BOX-MD', 'Corrugated Shipping Box Medium', '18x14x12 inch corrugated cardboard box', 2.29, 1.05, 1500, 400, 3),
(1, 'TAPE-CLR', 'Clear Packing Tape 48mm x 100m', 'High-strength acrylic packing tape', 4.99, 2.10, 800, 200, 2);

-- ------------------------------------------------------------------
-- 5e. SUPPLIERS
-- ------------------------------------------------------------------
INSERT INTO suppliers (company_id, name, email, phone, address) VALUES
(1, 'Pacific Rim Electronics Ltd.', 'orders@pacificelec.com', '+1 (310) 555-2101', '2000 E Grand Avenue, Suite 400, Los Angeles, CA 90021'),
(1, 'GlobalTech Components Inc.', 'sales@globaltechcomp.com', '+1 (408) 555-2102', '3555 Gateway Place, San Jose, CA 95110'),
(1, 'OfficeMax Supplies Co.', 'b2b@officemaxsupplies.com', '+1 (312) 555-2103', '150 N Martingale Road, Schaumburg, IL 60173'),
(1, 'EcoPackage Solutions', 'info@ecopackage.com', '+1 (503) 555-2104', '1200 NW Naito Parkway, Portland, OR 97209'),
(1, 'Precision Parts Manufacturing', 'quotes@precisionparts.com', '+1 (586) 555-2105', '45000 Van Dyke Avenue, Sterling Heights, MI 48314'),
(1, 'DataTronics International', 'sales@datatronics.com', '+1 (512) 555-2106', '9600 Metric Boulevard, Austin, TX 78758');

-- ------------------------------------------------------------------
-- 5f. CUSTOMERS
-- ------------------------------------------------------------------
INSERT INTO customers (company_id, name, email, phone, billing_address, shipping_address) VALUES
(1, 'TechCorp Solutions Inc.', 'ap@techcorpsolutions.com', '+1 (415) 555-3101', '500 Mission Street, San Francisco, CA 94105', '500 Mission Street, San Francisco, CA 94105'),
(1, 'GreenLeaf Organic Markets', 'ordering@greenleafmarket.com', '+1 (206) 555-3102', '2323 5th Avenue, Seattle, WA 98121', '2323 5th Avenue, Seattle, WA 98121'),
(1, 'Summit Healthcare Systems', 'procurement@summithealth.com', '+1 (617) 555-3103', '800 Boylston Street, Boston, MA 02199', '800 Boylston Street, Boston, MA 02199'),
(1, 'Apex Construction Group', 'invoices@apexconstruct.com', '+1 (713) 555-3104', '1000 Main Street, Houston, TX 77002', '2000 Industrial Boulevard, Houston, TX 77009'),
(1, 'NorthStar Logistics LLC', 'accountspayable@northstarlog.com', '+1 (312) 555-3105', '233 S Wacker Drive, Chicago, IL 60606', '233 S Wacker Drive, Chicago, IL 60606'),
(1, 'Vanguard Education Services', 'orders@vanguardedu.org', '+1 (202) 555-3106', '1200 18th Street NW, Washington, DC 20036', '1200 18th Street NW, Washington, DC 20036'),
(1, 'Pinnacle Hospitality Group', 'purchasing@pinnaclehospitality.com', '+1 (305) 555-3107', '1001 Brickell Bay Drive, Miami, FL 33131', '1001 Brickell Bay Drive, Miami, FL 33131'),
(1, 'Titan Automotive Parts', 'buying@titanautoparts.com', '+1 (248) 555-3108', '200 E Long Lake Road, Bloomfield Hills, MI 48304', '200 E Long Lake Road, Bloomfield Hills, MI 48304');

-- ------------------------------------------------------------------
-- 5g. PURCHASE ORDERS & LINES
-- ------------------------------------------------------------------
INSERT INTO purchase_orders (company_id, supplier_id, po_number, order_date, expected_delivery_date, status, subtotal, tax_total, grand_total, notes, warehouse_id, created_by, payment_status) VALUES
(1, 1, 'PO-2026-0001', '2026-01-10', '2026-01-25', 'received', 18749.85, 3749.97, 22499.82, 'Q1 electronics stock replenishment', 1, 2, 'paid'),
(1, 2, 'PO-2026-0002', '2026-01-15', '2026-02-01', 'received', 9624.50, 1924.90, 11549.40, 'Office supplies and toner bulk order', 1, 2, 'paid'),
(1, 4, 'PO-2026-0003', '2026-02-05', '2026-02-20', 'sent', 5675.00, 283.75, 5958.75, 'Packaging materials quarterly order', 2, 2, 'unpaid'),
(1, 1, 'PO-2026-0004', '2026-02-20', '2026-03-10', 'draft', 24499.75, 4899.95, 29399.70, 'Additional laptop inventory for Q2', 1, 2, 'unpaid');

INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity) VALUES
-- PO-0001: Pacific Rim Electronics
(1, 1, 10, 899.00, 8990.00, 10),
(1, 2, 12, 625.00, 7500.00, 12),
(1, 6, 50, 28.00, 1400.00, 50),
(1, 7, 20, 72.00, 1440.00, 20),
-- PO-0002: GlobalTech / OfficeMax
(2, 8, 100, 4.50, 450.00, 100),
(2, 9, 25, 52.00, 1300.00, 25),
(2, 10, 25, 52.00, 1300.00, 25),
(2, 11, 25, 52.00, 1300.00, 25),
(2, 12, 30, 45.00, 1350.00, 30),
(2, 5, 20, 85.00, 1700.00, 20),
(2, 6, 50, 28.00, 1400.00, 50),
-- PO-0003: EcoPackage
(3, 13, 2000, 0.65, 1300.00, 0),
(3, 14, 1500, 1.05, 1575.00, 0),
(3, 15, 400, 2.10, 840.00, 0),
-- PO-0004: Pacific Rim Electronics (Q2)
(4, 1, 20, 899.00, 17980.00, 0),
(4, 3, 10, 350.00, 3500.00, 0),
(4, 7, 25, 72.00, 1800.00, 0);

-- ------------------------------------------------------------------
-- 5h. SALES ORDERS & LINES
-- ------------------------------------------------------------------
INSERT INTO sales_orders (company_id, customer_id, order_number, order_date, status, subtotal, tax_total, grand_total, notes, warehouse_id, created_by, payment_status) VALUES
(1, 1, 'SO-2026-0001', '2026-01-20', 'invoiced', 4979.95, 995.99, 5975.94, 'TechCorp office equipment upgrade', 1, 1, 'paid'),
(1, 2, 'SO-2026-0002', '2026-01-25', 'shipped', 3439.95, 687.99, 4127.94, 'GreenLeaf POS system hardware', 1, 1, 'paid'),
(1, 5, 'SO-2026-0003', '2026-02-01', 'confirmed', 1249.95, 249.99, 1499.94, 'NorthStar logistics tracking hardware', 2, 1, 'unpaid'),
(1, 3, 'SO-2026-0004', '2026-02-10', 'draft', 7499.85, 1499.97, 8999.82, 'Summit Healthcare - 5 workstation setups', 1, 1, 'unpaid'),
(1, 1, 'SO-2026-0005', '2026-02-18', 'confirmed', 2999.80, 599.96, 3599.76, 'TechCorp additional monitor order', 1, 1, 'unpaid');

INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
-- SO-0001: TechCorp
(1, 1, 2, 1299.99, 5.00, 2469.98),
(1, 3, 2, 549.99, 0.00, 1099.98),
(1, 5, 5, 149.99, 10.00, 674.96),
(1, 6, 15, 49.99, 0.00, 749.85),
-- SO-0002: GreenLeaf
(2, 2, 2, 899.99, 5.00, 1709.98),
(2, 7, 2, 119.99, 0.00, 239.98),
(2, 8, 100, 8.99, 0.00, 899.00),
(2, 5, 4, 149.99, 0.00, 599.96),
-- SO-0003: NorthStar
(3, 2, 1, 899.99, 0.00, 899.99),
(3, 6, 7, 49.99, 0.00, 349.93),
-- SO-0004: Summit Healthcare
(4, 1, 3, 1299.99, 5.00, 3704.97),
(4, 3, 3, 549.99, 0.00, 1649.97),
(4, 5, 3, 149.99, 0.00, 449.97),
(4, 6, 6, 49.99, 0.00, 299.94),
(4, 8, 50, 8.99, 0.00, 449.50),
-- SO-0005: TechCorp monitors
(5, 3, 4, 549.99, 0.00, 2199.96),
(5, 4, 4, 249.99, 0.00, 999.96);

-- ------------------------------------------------------------------
-- 5i. INVENTORY TRANSACTIONS
-- ------------------------------------------------------------------
INSERT INTO inventory_transactions (product_id, type, quantity, reference_type, reference_id, warehouse_id) VALUES
-- PO-0001 received
(1, 'in', 10, 'purchase_order', 1, 1),
(2, 'in', 12, 'purchase_order', 1, 1),
(6, 'in', 50, 'purchase_order', 1, 1),
(7, 'in', 20, 'purchase_order', 1, 1),
-- PO-0002 received
(8, 'in', 100, 'purchase_order', 2, 1),
(9, 'in', 25, 'purchase_order', 2, 1),
(10, 'in', 25, 'purchase_order', 2, 1),
(11, 'in', 25, 'purchase_order', 2, 1),
(12, 'in', 30, 'purchase_order', 2, 1),
(5, 'in', 20, 'purchase_order', 2, 1),
(6, 'in', 50, 'purchase_order', 2, 1),
-- SO-0001 shipped
(1, 'out', 2, 'sales_order', 1, 1),
(3, 'out', 2, 'sales_order', 1, 1),
(5, 'out', 5, 'sales_order', 1, 1),
(6, 'out', 15, 'sales_order', 1, 1),
-- SO-0002 shipped
(2, 'out', 2, 'sales_order', 2, 1),
(7, 'out', 2, 'sales_order', 2, 1),
(8, 'out', 100, 'sales_order', 2, 1),
-- Stock transfer NYC -> Chicago
(5, 'out', 10, 'stock_transfer', 1, 1),
(5, 'in', 10, 'stock_transfer', 1, 2);

-- ------------------------------------------------------------------
-- 5j. INVOICES (Sales) & INVOICE ITEMS
-- ------------------------------------------------------------------
INSERT INTO invoices (company_id, invoice_number, sales_order_id, customer_id, invoice_date, due_date, status, subtotal, tax_total, grand_total, amount_paid, payment_terms, notes, created_by) VALUES
(1, 'INV-2026-0001', 1, 1, '2026-01-20', '2026-02-19', 'paid', 4979.95, 995.99, 5975.94, 5975.94, 'Net 30', 'Invoice for SO-2026-0001 - Office equipment upgrade', 1),
(1, 'INV-2026-0002', 2, 2, '2026-01-25', '2026-02-24', 'paid', 3439.95, 687.99, 4127.94, 4127.94, 'Net 30', 'Invoice for SO-2026-0002 - POS system hardware', 1),
(1, 'INV-2026-0003', 3, 5, '2026-02-01', '2026-03-03', 'sent', 1249.95, 249.99, 1499.94, 0.00, 'Net 30', 'Invoice for SO-2026-0003 - Tracking hardware', 1),
(1, 'INV-2026-0004', 5, 1, '2026-02-18', '2026-03-20', 'draft', 2999.80, 599.96, 3599.76, 0.00, 'Net 30', 'Invoice for SO-2026-0005 - Additional monitors', 1);

INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total) VALUES
(1, 1, 'PrecisionPro Laptop 15"', 2, 1299.99, 5.00, 20.00, 2469.98),
(1, 3, 'ClearView 27" 4K Monitor', 2, 549.99, 0.00, 20.00, 1099.98),
(1, 5, 'TactileType Mechanical Keyboard', 5, 149.99, 10.00, 20.00, 674.96),
(1, 6, 'ErgoGrip Wireless Mouse', 15, 49.99, 0.00, 20.00, 749.85),
(2, 2, 'PrecisionPro Laptop 13"', 2, 899.99, 5.00, 20.00, 1709.98),
(2, 7, 'DataVault 4TB External HDD', 2, 119.99, 0.00, 20.00, 239.98),
(2, 8, 'Premium A4 Printer Paper 500pk', 100, 8.99, 0.00, 0.00, 899.00),
(2, 5, 'TactileType Mechanical Keyboard', 4, 149.99, 0.00, 20.00, 599.96);

-- ------------------------------------------------------------------
-- 5k. PAYMENTS
-- ------------------------------------------------------------------
INSERT INTO payments (company_id, invoice_id, payment_number, payment_date, amount, payment_method, reference_number, notes, created_by) VALUES
(1, 1, 'PAY-2026-0001', '2026-02-10', 5975.94, 'wire_transfer', 'WIRE-20260210-8472', 'Payment received for INV-2026-0001', 3),
(1, 2, 'PAY-2026-0002', '2026-02-15', 4127.94, 'ach', 'ACH-20260215-3319', 'Payment received for INV-2026-0002', 3),
(1, 1, 'PAY-2026-0003', '2026-02-18', 1499.94, 'check', 'CHK-100482', 'Partial pre-payment for INV-2026-0003', 3);

-- ------------------------------------------------------------------
-- 5l. CHART OF ACCOUNTS (Standard accounting COA)
-- ------------------------------------------------------------------
INSERT INTO chart_of_accounts (company_id, account_code, account_name, account_type, parent_account_id, description, is_active) VALUES
-- Assets (1000-1999)
(1, '1000', 'Cash & Cash Equivalents', 'asset', NULL, 'Cash on hand and in bank accounts', true),
(1, '1010', 'Checking Account - Chase', 'asset', 1, 'Chase Business Checking', true),
(1, '1020', 'Savings Account - BofA', 'asset', 1, 'Bank of America Business Savings', true),
(1, '1100', 'Accounts Receivable', 'asset', NULL, 'Customer invoices outstanding', true),
(1, '1200', 'Inventory - Electronics', 'asset', NULL, 'Electronic product inventory', true),
(1, '1210', 'Inventory - Office Supplies', 'asset', NULL, 'Office supply inventory', true),
(1, '1220', 'Inventory - Packaging', 'asset', NULL, 'Packaging material inventory', true),
(1, '1300', 'Prepaid Expenses', 'asset', NULL, 'Prepaid rent, insurance, etc.', true),
(1, '1400', 'Fixed Assets - Equipment', 'asset', NULL, 'Computers, machinery, furniture', true),
(1, '1410', 'Accumulated Depreciation', 'asset', NULL, 'Accumulated depreciation on fixed assets', true),

-- Liabilities (2000-2999)
(1, '2000', 'Accounts Payable', 'liability', NULL, 'Supplier invoices outstanding', true),
(1, '2100', 'Accrued Expenses', 'liability', NULL, 'Accrued salaries, taxes, etc.', true),
(1, '2200', 'Sales Tax Payable', 'liability', NULL, 'VAT/Sales tax collected', true),
(1, '2300', 'Payroll Liabilities', 'liability', NULL, 'Payroll taxes and deductions', true),

-- Equity (3000-3999)
(1, '3000', 'Common Stock', 'equity', NULL, 'Shareholder equity', true),
(1, '3100', 'Retained Earnings', 'equity', NULL, 'Accumulated retained earnings', true),
(1, '3200', 'Current Year Earnings', 'equity', NULL, 'Fiscal year profit/loss', true),

-- Revenue (4000-4999)
(1, '4000', 'Sales Revenue - Products', 'revenue', NULL, 'Revenue from product sales', true),
(1, '4100', 'Service Revenue', 'revenue', NULL, 'Revenue from services', true),
(1, '4200', 'Sales Discounts', 'revenue', NULL, 'Discounts given on sales', true),
(1, '4300', 'Sales Returns & Allowances', 'revenue', NULL, 'Returns and allowances', true),

-- Expenses (5000-5999)
(1, '5000', 'Cost of Goods Sold', 'expense', NULL, 'Direct product costs', true),
(1, '5100', 'Salaries & Wages', 'expense', NULL, 'Employee compensation', true),
(1, '5110', 'Payroll Taxes', 'expense', NULL, 'Employer payroll taxes', true),
(1, '5200', 'Rent Expense', 'expense', NULL, 'Office and warehouse rent', true),
(1, '5210', 'Utilities Expense', 'expense', NULL, 'Electricity, water, internet', true),
(1, '5300', 'Office Supplies Expense', 'expense', NULL, 'Office consumables', true),
(1, '5400', 'Shipping & Freight', 'expense', NULL, 'Shipping costs', true),
(1, '5500', 'Marketing & Advertising', 'expense', NULL, 'Marketing and ad spend', true),
(1, '5600', 'Professional Fees', 'expense', NULL, 'Legal, accounting, consulting', true),
(1, '5700', 'Depreciation Expense', 'expense', NULL, 'Asset depreciation', true),
(1, '5800', 'Insurance Expense', 'expense', NULL, 'Business insurance premiums', true),
(1, '5900', 'Miscellaneous Expenses', 'expense', NULL, 'Other operating expenses', true);

-- ------------------------------------------------------------------
-- 5m. COST CENTERS
-- ------------------------------------------------------------------
INSERT INTO cost_centers (company_id, code, name, description, is_active, created_by) VALUES
(1, 'CC-IT', 'Information Technology', 'IT department cost center', true, 1),
(1, 'CC-OPS', 'Operations', 'Operations and logistics', true, 1),
(1, 'CC-SALES', 'Sales & Marketing', 'Sales and marketing department', true, 1),
(1, 'CC-ADMIN', 'Administration', 'Administrative and general', true, 1),
(1, 'CC-WH', 'Warehouse', 'Warehouse and inventory management', true, 1);

-- ------------------------------------------------------------------
-- 5n. JOURNAL ENTRIES & LINES
-- ------------------------------------------------------------------
INSERT INTO journal_entries (company_id, entry_date, account_id, debit, credit, reference_type, reference_id, description, voucher_no, voucher_type, total_debit, total_credit, status, created_by) VALUES
(1, '2026-01-20', 1, 5975.94, 0.00, 'invoice', 1, 'Invoice INV-2026-0001 - TechCorp office equipment', 'JV-2026-0001', 'Sales', 5975.94, 5975.94, 'posted', 3),
(1, '2026-01-25', 1, 4127.94, 0.00, 'invoice', 2, 'Invoice INV-2026-0002 - GreenLeaf POS hardware', 'JV-2026-0002', 'Sales', 4127.94, 4127.94, 'posted', 3),
(1, '2026-02-10', 1, 5975.94, 0.00, 'payment', 1, 'Payment received from TechCorp', 'JV-2026-0003', 'Receipt', 5975.94, 5975.94, 'posted', 3),
(1, '2026-01-31', 1, 15000.00, 0.00, 'payroll', NULL, 'January 2026 salary accrual', 'JV-2026-0004', 'Accrual', 15000.00, 15000.00, 'posted', 3);

INSERT INTO journal_entry_lines (journal_entry_id, account_id, cost_center_id, debit, credit, narration) VALUES
-- JV-0001: INV-2026-0001 revenue recognition
(1, 5, 3, 5975.94, 0.00, 'Debit AR for INV-2026-0001'),
(1, 18, 3, 0.00, 4979.95, 'Credit Sales Revenue'),
(1, 13, 3, 0.00, 995.99, 'Credit Sales Tax Payable'),
-- JV-0002: INV-2026-0002 revenue recognition
(2, 5, 3, 4127.94, 0.00, 'Debit AR for INV-2026-0002'),
(2, 18, 3, 0.00, 3439.95, 'Credit Sales Revenue'),
(2, 13, 3, 0.00, 687.99, 'Credit Sales Tax Payable'),
-- JV-0003: Payment received from TechCorp
(3, 2, 3, 5975.94, 0.00, 'Debit Chase Checking - payment received'),
(3, 5, 3, 0.00, 5975.94, 'Credit AR - invoice paid'),
-- JV-0004: January salary accrual
(4, 24, 4, 15000.00, 0.00, 'Debit Salaries & Wages'),
(4, 12, 4, 0.00, 15000.00, 'Credit Accrued Expenses');

-- ------------------------------------------------------------------
-- 5o. BUDGETS
-- ------------------------------------------------------------------
INSERT INTO budgets (company_id, fiscal_year, name, status, notes, created_by) VALUES
(1, 2026, 'FY2026 Operating Budget', 'approved', 'Annual operating budget approved Dec 2025', 1);

INSERT INTO budget_items (budget_id, account_id, cost_center_id, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec) VALUES
(1, 24, 4, 15000, 15000, 15000, 16000, 16000, 16000, 16000, 16000, 16500, 16500, 16500, 16500),
(1, 26, 4, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000),
(1, 27, 4, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200),
(1, 29, 3, 3500, 3500, 4000, 3500, 3500, 4000, 3500, 3500, 4000, 3500, 3500, 5000),
(1, 30, 4, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000);

-- ------------------------------------------------------------------
-- 5p. EMPLOYEES
-- ------------------------------------------------------------------
INSERT INTO employees (company_id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, address, city, state, postal_code, department, position, hire_date, employment_type, salary, bank_name, bank_account_no, bank_routing_no, emergency_contact_name, emergency_contact_phone, status, created_by) VALUES
(1, 'EMP-001', 'Sarah', 'Mitchell', 'sarah.mitchell@acmecorp.com', '+1 (212) 555-4001', '1985-03-15', 'Female', '120 Park Avenue, Apt 12B', 'New York', 'NY', '10017', 'Information Technology', 'IT Director', '2020-06-01', 'Full-time', 145000.00, 'Chase Bank', '****4832', '021000021', 'James Mitchell', '+1 (212) 555-4091', 'active', 1),
(1, 'EMP-002', 'Michael', 'Chen', 'michael.chen@acmecorp.com', '+1 (212) 555-4002', '1990-07-22', 'Male', '350 Hudson Street, Apt 5A', 'New York', 'NY', '10014', 'Operations', 'Operations Manager', '2021-01-15', 'Full-time', 95000.00, 'Bank of America', '****7719', '026009593', 'Lisa Chen', '+1 (212) 555-4092', 'active', 1),
(1, 'EMP-003', 'Jessica', 'Williams', 'jessica.williams@acmecorp.com', '+1 (312) 555-4003', '1992-11-08', 'Female', '550 W Madison Street, Apt 2204', 'Chicago', 'IL', '60661', 'Sales', 'Sales Director', '2021-03-01', 'Full-time', 130000.00, 'Chase Bank', '****2156', '071000013', 'David Williams', '+1 (312) 555-4093', 'active', 1),
(1, 'EMP-004', 'Robert', 'Johnson', 'robert.johnson@acmecorp.com', '+1 (213) 555-4004', '1988-09-30', 'Male', '800 S Figueroa Street, Apt 1405', 'Los Angeles', 'CA', '90017', 'Warehouse', 'Warehouse Supervisor', '2022-02-14', 'Full-time', 68000.00, 'Wells Fargo', '****6643', '121000248', 'Maria Johnson', '+1 (213) 555-4094', 'active', 1),
(1, 'EMP-005', 'Emily', 'Davis', 'emily.davis@acmecorp.com', '+1 (212) 555-4005', '1995-05-12', 'Female', '200 E 32nd Street, Apt 8C', 'New York', 'NY', '10016', 'Information Technology', 'Software Engineer', '2023-06-15', 'Full-time', 105000.00, 'Chase Bank', '****9912', '021000021', 'Thomas Davis', '+1 (212) 555-4095', 'active', 1),
(1, 'EMP-006', 'Daniel', 'Martinez', 'daniel.martinez@acmecorp.com', '+1 (312) 555-4006', '1993-01-27', 'Male', '120 N LaSalle Street, Apt 310', 'Chicago', 'IL', '60602', 'Operations', 'Logistics Coordinator', '2023-09-01', 'Full-time', 55000.00, 'Bank of America', '****3378', '026009593', 'Ana Martinez', '+1 (312) 555-4096', 'active', 1);

-- ------------------------------------------------------------------
-- 5q. EMPLOYEE DOCUMENTS
-- ------------------------------------------------------------------
INSERT INTO employee_documents (company_id, employee_id, document_type, document_name, file_path, file_size, uploaded_by) VALUES
(1, 1, 'contract', 'Employment Contract - Sarah Mitchell.pdf', '/documents/contracts/EMP-001_contract.pdf', 245760, 1),
(1, 1, 'id_proof', 'Passport - Sarah Mitchell.pdf', '/documents/id/EMP-001_passport.pdf', 184320, 1),
(1, 2, 'contract', 'Employment Contract - Michael Chen.pdf', '/documents/contracts/EMP-002_contract.pdf', 233472, 1),
(1, 3, 'w4', 'W-4 Form - Jessica Williams.pdf', '/documents/tax/EMP-003_w4.pdf', 122880, 1);

-- ------------------------------------------------------------------
-- 5r. LEAVE REQUESTS
-- ------------------------------------------------------------------
INSERT INTO leave_requests (company_id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status, approved_by, approved_at, created_by) VALUES
(1, 2, 1, '2026-03-10', '2026-03-14', 5, 'Family vacation to Florida', 'approved', 1, '2026-02-20 10:30:00', 2),
(1, 4, 2, '2026-02-05', '2026-02-06', 2, 'Medical appointment', 'approved', 1, '2026-02-01 09:15:00', 4),
(1, 5, 1, '2026-04-01', '2026-04-05', 5, 'Travel to Japan', 'pending', NULL, NULL, 5);

-- ------------------------------------------------------------------
-- 5s. ATTENDANCE (sample for current week)
-- ------------------------------------------------------------------
INSERT INTO attendance (company_id, employee_id, date, check_in, check_out, status, notes) VALUES
(1, 1, '2026-02-16', '08:45', '17:30', 'present', NULL),
(1, 1, '2026-02-17', '08:50', '17:15', 'present', NULL),
(1, 1, '2026-02-18', '08:30', '17:45', 'present', NULL),
(1, 1, '2026-02-19', '09:00', '18:00', 'present', NULL),
(1, 1, '2026-02-20', '08:40', '16:30', 'present', NULL),
(1, 2, '2026-02-16', '08:30', '17:00', 'present', NULL),
(1, 2, '2026-02-17', '08:45', '17:30', 'present', NULL),
(1, 2, '2026-02-18', '09:00', '18:00', 'present', NULL),
(1, 2, '2026-02-19', '08:00', '16:45', 'present', NULL),
(1, 2, '2026-02-20', '08:30', '17:15', 'present', NULL),
(1, 5, '2026-02-16', '09:15', '18:00', 'present', NULL),
(1, 5, '2026-02-17', '09:00', '17:30', 'present', NULL),
(1, 5, '2026-02-18', '08:45', '17:45', 'present', NULL),
(1, 5, '2026-02-19', '09:30', '18:15', 'present', NULL),
(1, 5, '2026-02-20', '09:00', '17:00', 'present', NULL);

-- ------------------------------------------------------------------
-- 5t. EXPENSE CATEGORIES
-- ------------------------------------------------------------------
INSERT INTO expense_categories (company_id, name, description, is_active) VALUES
(1, 'Travel & Accommodation', 'Business travel, hotel, and lodging expenses', true),
(1, 'Meals & Entertainment', 'Client meals, team lunches, office events', true),
(1, 'Office Rent', 'Office and warehouse rental payments', true),
(1, 'Utilities', 'Electricity, water, internet, phone bills', true),
(1, 'Software Subscriptions', 'SaaS and software licensing fees', true),
(1, 'Vehicle & Fuel', 'Company vehicle expenses and fuel', true);

-- ------------------------------------------------------------------
-- 5u. EXPENSES
-- ------------------------------------------------------------------
INSERT INTO expenses (company_id, expense_date, category_id, description, amount, payment_method, reference_number, created_by) VALUES
(1, '2026-01-15', 1, 'Flight tickets - NYC to Chicago (Jan 20-22)', 845.50, 'company_card', 'CC-20260115-4421', 1),
(1, '2026-01-20', 2, 'Client dinner - TechCorp Solutions', 320.00, 'company_card', 'CC-20260120-2108', 3),
(1, '2026-02-01', 3, 'February office rent - NYC HQ', 12000.00, 'wire_transfer', 'RENT-20260201', 1),
(1, '2026-02-03', 4, 'ConEdison - January utilities', 2150.00, 'ach', 'UTIL-20260203', 1),
(1, '2026-02-05', 5, 'Microsoft 365 Business Premium - Feb subscription', 540.00, 'company_card', 'MSFT-20260205', 5),
(1, '2026-02-10', 2, 'Team lunch - Operations dept monthly meeting', 185.75, 'company_card', 'CC-20260210-3387', 2),
(1, '2026-02-12', 5, 'AWS Cloud Services - January hosting', 2890.30, 'company_card', 'AWS-20260212', 5);

-- ------------------------------------------------------------------
-- 5v. FIXED ASSETS
-- ------------------------------------------------------------------
INSERT INTO asset_categories (company_id, code, name, default_depreciation_method, default_useful_life, is_active) VALUES
(1, 'ASSET-COMP', 'Computer Equipment', 'straight_line', 4, true),
(1, 'ASSET-FURN', 'Furniture & Fixtures', 'straight_line', 7, true),
(1, 'ASSET-VEH', 'Vehicles', 'straight_line', 5, true),
(1, 'ASSET-MACH', 'Machinery & Equipment', 'straight_line', 10, true);

INSERT INTO fixed_assets (company_id, asset_code, name, category_id, description, purchase_date, purchase_cost, current_value, salvage_value, useful_life, depreciation_method, accumulated_depreciation, depreciation_per_period, location, status, created_by) VALUES
(1, 'SRV-DELL-001', 'Dell PowerEdge R750 Server', 1, 'Production database server', '2025-06-15', 18500.00, 16231.25, 1500.00, 4, 'straight_line', 2268.75, 354.17, 'NYC HQ - Server Room', 'active', 5),
(1, 'FORK-TOY-001', 'Toyota Forklift 5,000lb', 4, 'Warehouse forklift for loading dock', '2024-03-20', 32000.00, 26400.00, 3000.00, 10, 'straight_line', 5600.00, 241.67, 'NYC Warehouse - Loading Bay', 'active', 2),
(1, 'VEH-FORD-001', 'Ford Transit Cargo Van 2024', 3, 'Delivery van for local NYC routes', '2024-09-01', 45000.00, 35700.00, 8000.00, 5, 'straight_line', 9300.00, 616.67, 'NYC Warehouse - Vehicle Depot', 'active', 2),
(1, 'CONF-OFFICE', 'Office Conference Room Setup', 2, 'Conference table, chairs, AV system', '2025-01-15', 15000.00, 12642.86, 2000.00, 7, 'straight_line', 2357.14, 154.76, 'NYC HQ - 3rd Floor Conference', 'active', 1);

INSERT INTO asset_depreciation (company_id, asset_id, period_date, amount, running_balance, journal_entry_id) VALUES
(1, 1, '2026-01-31', 354.17, 16231.25, NULL),
(1, 2, '2026-01-31', 241.67, 26400.00, NULL),
(1, 3, '2026-01-31', 616.67, 35700.00, NULL),
(1, 4, '2026-01-31', 154.76, 12642.86, NULL);

-- ------------------------------------------------------------------
-- 5w. SERVICES (for service invoicing module)
-- ------------------------------------------------------------------
INSERT INTO services (company_id, name, description, category, unit_price, tax_percent, is_active, created_by) VALUES
(1, 'IT Support - Basic', 'Remote IT support per incident', 'Professional Services', 150.00, 20.00, true, 1),
(1, 'IT Support - Premium', 'On-site IT support per incident', 'Professional Services', 350.00, 20.00, true, 1),
(1, 'Consulting - Hourly', 'Business consulting services per hour', 'Consulting', 250.00, 20.00, true, 1),
(1, 'Warehouse Storage - Pallet/month', 'Pallet storage per month', 'Logistics', 45.00, 5.00, true, 2),
(1, 'Equipment Rental - Weekly', 'Equipment rental per week', 'Rental', 500.00, 20.00, true, 2);

-- ------------------------------------------------------------------
-- 5x. CRM: LEADS & OPPORTUNITIES
-- ------------------------------------------------------------------
INSERT INTO leads (company_id, first_name, last_name, email, phone, mobile, company, designation, source_id, status_id, assigned_to, address, city, state, country, notes, created_by) VALUES
(1, 'Thomas', 'Anderson', 'thomas.anderson@metacorp.io', '+1 (415) 555-5001', '+1 (415) 555-5001', 'MetaCorp Technologies', 'CTO', 1, 1, 2, '100 Harrison Street', 'San Francisco', 'CA', 'USA', 'Interested in laptop bulk order for 50 employees', 2),
(1, 'Patricia', 'Moore', 'patricia.moore@blueriverinc.com', '+1 (303) 555-5002', '+1 (303) 555-5002', 'BlueRiver Inc.', 'Office Manager', 4, 3, NULL, '1601 Blake Street', 'Denver', 'CO', 'USA', 'Requested quote for office supplies and printer hardware', 2),
(1, 'Kevin', 'Brown', 'kevin.brown@silverpeak.io', '+1 (512) 555-5003', NULL, 'SilverPeak Analytics', 'VP Engineering', 7, 2, 2, '816 Congress Avenue', 'Austin', 'TX', 'USA', 'Met at CES 2026 - following up on server equipment needs', 2);

INSERT INTO opportunities (company_id, lead_id, name, expected_revenue, probability, expected_close_date, stage, priority, assigned_to, created_by) VALUES
(1, 1, 'MetaCorp - Bulk Laptop Order (50 units)', 64999.50, 25, '2026-04-15', 'qualification', 'high', 2, 2),
(1, 2, 'BlueRiver - Office Supplies Contract', 12500.00, 60, '2026-03-01', 'proposal', 'medium', 2, 2),
(1, 3, 'SilverPeak - Server Infrastructure', 45000.00, 15, '2026-05-30', 'qualification', 'medium', 2, 2);

-- ------------------------------------------------------------------
-- 5y. PRODUCT WAREHOUSE STOCK (current stock snapshot)
-- ------------------------------------------------------------------
INSERT INTO product_warehouse_stock (company_id, product_id, warehouse_id, bin_id, quantity, reserved_quantity, reorder_level) VALUES
(1, 1, 1, 1, 43, 2, 10),
(1, 2, 1, 1, 58, 0, 15),
(1, 3, 1, 1, 28, 4, 8),
(1, 4, 1, 1, 80, 0, 20),
(1, 5, 1, 2, 105, 8, 25),
(1, 5, 2, 4, 10, 0, 25),
(1, 6, 1, 2, 185, 15, 40),
(1, 7, 1, 2, 53, 2, 15),
(1, 8, 1, 3, 400, 50, 100),
(1, 9, 1, 3, 35, 0, 10),
(1, 10, 1, 3, 35, 0, 10),
(1, 11, 1, 3, 35, 0, 10),
(1, 12, 1, 3, 40, 0, 12),
(1, 13, 1, 3, 2000, 0, 500),
(1, 13, 2, 5, 500, 0, 500),
(1, 14, 1, 3, 1500, 0, 400),
(1, 15, 1, 2, 800, 0, 200);

-- ------------------------------------------------------------------
-- 5z. STOCK TRANSFERS
-- ------------------------------------------------------------------
INSERT INTO stock_transfers (company_id, transfer_number, from_warehouse_id, to_warehouse_id, transfer_date, status, notes, created_by, approved_by, approved_at, received_by, received_at) VALUES
(1, 'ST-2026-0001', 1, 2, '2026-02-10', 'completed', 'Rebooked 10 mechanical keyboards to Chicago for upcoming event', 2, 1, '2026-02-09 14:00:00', 4, '2026-02-11 10:00:00'),
(1, 'ST-2026-0002', 1, 3, '2026-02-15', 'pending', 'Transfer of 500 small boxes and 300 medium boxes to LA hub', 2, NULL, NULL, NULL, NULL);

INSERT INTO stock_transfer_items (stock_transfer_id, product_id, quantity, unit_cost) VALUES
(1, 5, 10, 85.00),
(2, 13, 500, 0.65),
(2, 14, 300, 1.05);

-- ------------------------------------------------------------------
-- 5aa. QUOTATIONS
-- ------------------------------------------------------------------
INSERT INTO quotations (company_id, customer_id, quote_number, quote_date, expiry_date, status, subtotal, tax_total, discount_total, grand_total, notes, created_by) VALUES
(1, 4, 'Q-2026-0001', '2026-02-05', '2026-03-07', 'sent', 8549.85, 1709.97, 0.00, 10259.82, 'Quote for Apex Construction - 5 workstation setup', 3),
(1, 6, 'Q-2026-0002', '2026-02-12', '2026-03-14', 'draft', 4049.85, 809.97, 200.00, 4659.82, 'Quote for Vanguard Education - computer lab equipment', 3);

INSERT INTO quotation_items (quotation_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total) VALUES
(1, 1, 'PrecisionPro Laptop 15"', 3, 1299.99, 5.00, 20.00, 3704.97),
(1, 4, 'ClearView 24" FHD Monitor', 6, 249.99, 0.00, 20.00, 1499.94),
(1, 5, 'TactileType Mechanical Keyboard', 5, 149.99, 0.00, 20.00, 749.95),
(1, 6, 'ErgoGrip Wireless Mouse', 10, 49.99, 0.00, 20.00, 499.90),
(1, 8, 'Premium A4 Printer Paper 500pk', 20, 8.99, 0.00, 0.00, 179.80),
(2, 4, 'ClearView 24" FHD Monitor', 10, 249.99, 5.00, 20.00, 2374.90),
(2, 2, 'PrecisionPro Laptop 13"', 2, 899.99, 0.00, 20.00, 1799.98),
(2, 6, 'ErgoGrip Wireless Mouse', 10, 49.99, 0.00, 5.00, 499.90);

-- ------------------------------------------------------------------
-- 5bb. PROJECTS
-- ------------------------------------------------------------------
INSERT INTO projects (company_id, project_code, name, description, customer_id, start_date, end_date, budget_amount, status, priority, project_manager, created_by) VALUES
(1, 'PRJ-2026-001', 'TechCorp Office Infrastructure Upgrade', 'Full office network and workstation upgrade for TechCorp SF office', 1, '2026-01-10', '2026-02-28', 25000.00, 'in_progress', 'high', 1, 1),
(1, 'PRJ-2026-002', 'Warehouse Management System', 'Implementation of new WMS across all warehouses', NULL, '2026-03-01', '2026-06-30', 75000.00, 'planning', 'medium', 1, 1);

INSERT INTO project_members (company_id, project_id, user_id, role, hourly_rate) VALUES
(1, 1, 1, 'project_manager', 85.00),
(1, 1, 5, 'developer', 55.00),
(1, 1, 2, 'stakeholder', NULL),
(1, 2, 1, 'project_manager', 85.00),
(1, 2, 5, 'developer', 55.00),
(1, 2, 2, 'subject_matter_expert', NULL);

INSERT INTO project_tasks (company_id, project_id, parent_task_id, name, description, assigned_to, start_date, due_date, estimated_hours, actual_hours, priority, status, created_by) VALUES
(1, 1, NULL, 'Site survey and assessment', 'Visit TechCorp office, assess current infrastructure', 5, '2026-01-12', '2026-01-16', 20, 22, 'high', 'completed', 1),
(1, 1, NULL, 'Hardware procurement and staging', 'Order and stage all required hardware', 2, '2026-01-17', '2026-01-24', 15, 14, 'high', 'completed', 1),
(1, 1, NULL, 'Installation and configuration', 'Install workstations, network equipment, and software', 5, '2026-01-25', '2026-02-07', 80, 75, 'high', 'in_progress', 1),
(1, 1, NULL, 'Testing and handover', 'Test all systems and hand over to TechCorp IT team', 5, '2026-02-08', '2026-02-14', 24, 18, 'high', 'todo', 1);

INSERT INTO time_entries (company_id, project_id, task_id, user_id, entry_date, hours, description, billable) VALUES
(1, 1, 1, 5, '2026-01-12', 8, 'Site survey at TechCorp SF office', true),
(1, 1, 1, 5, '2026-01-13', 8, 'Network infrastructure assessment', true),
(1, 1, 1, 5, '2026-01-14', 6, 'Documentation and reporting', true),
(1, 1, 2, 2, '2026-01-18', 4, 'Vendor coordination for hardware ordering', true),
(1, 1, 3, 5, '2026-01-25', 8, 'Workstation setup and OS installation', true),
(1, 1, 3, 5, '2026-01-26', 8, 'Network configuration', true),
(1, 1, 3, 5, '2026-01-27', 8, 'Software deployment', true);

-- ------------------------------------------------------------------
-- 5cc. APPROVAL WORKFLOWS
-- ------------------------------------------------------------------
INSERT INTO approval_workflows (company_id, name, description, target_entity, is_active, created_by) VALUES
(1, 'Purchase Order Approval', 'Approval workflow for purchase orders over $5,000', 'purchase_order', true, 1),
(1, 'Expense Report Approval', 'Approval workflow for expense reports over $1,000', 'expense', true, 1);

INSERT INTO approval_steps (workflow_id, step_order, approver_id, min_amount, max_amount) VALUES
(1, 1, 2, 5000.01, 25000.00),
(1, 2, 1, 25000.01, 100000.00),
(2, 1, 2, 1000.01, 5000.00),
(2, 2, 1, 5000.01, 50000.00);

-- ------------------------------------------------------------------
-- 5dd. BANK ACCOUNTS (for bank reconciliation module)
-- ------------------------------------------------------------------
INSERT INTO bank_accounts (company_id, account_id, bank_name, account_number, account_name, opening_balance, as_of_date, is_active, created_by) VALUES
(1, 2, 'JPMorgan Chase', '****4832', 'Acme Corp Business Checking', 285000.00, '2026-01-01', true, 3),
(1, 3, 'Bank of America', '****7719', 'Acme Corp Business Savings', 450000.00, '2026-01-01', true, 3);

INSERT INTO bank_transactions (company_id, bank_account_id, transaction_date, description, reference_number, debit, credit, balance, is_cleared, created_by) VALUES
(1, 1, '2026-02-10', 'Wire transfer - TechCorp payment INV-2026-0001', 'WIRE-20260210-8472', 5975.94, 0.00, 290975.94, true, 3),
(1, 1, '2026-02-12', 'Rent payment - February NYC HQ', 'ACH-20260212-001', 0.00, 12000.00, 278975.94, true, 3),
(1, 1, '2026-02-15', 'ACH deposit - GreenLeaf payment INV-2026-0002', 'ACH-20260215-3319', 4127.94, 0.00, 283103.88, true, 3),
(1, 1, '2026-02-18', 'Check payment - NorthStar pre-payment', 'CHK-100482', 1499.94, 0.00, 284603.82, false, 3);

-- ------------------------------------------------------------------
-- 5ee. SERVICE INVOICES (service-specific billing)
-- ------------------------------------------------------------------
INSERT INTO service_invoices (company_id, invoice_number, customer_id, invoice_date, due_date, status, subtotal, tax_total, discount_total, grand_total, notes, created_by) VALUES
(1, 'SINV-2026-0001', 1, '2026-02-01', '2026-03-03', 'sent', 1500.00, 300.00, 0.00, 1800.00, 'IT Support - January 2026 incidents', 1),
(1, 'SINV-2026-0002', 5, '2026-02-10', '2026-03-12', 'draft', 500.00, 100.00, 50.00, 550.00, 'Consulting services - warehouse optimization', 1);

INSERT INTO service_invoice_items (service_invoice_id, service_id, description, quantity, unit_price, discount_percent, tax_percent, total) VALUES
(1, 1, 'IT Support Basic - 10 incidents', 10, 150.00, 0.00, 20.00, 1500.00),
(2, 3, 'Consulting - warehouse layout optimization', 2, 250.00, 10.00, 20.00, 500.00);

-- ------------------------------------------------------------------
-- 5ff. SALES RETURNS
-- ------------------------------------------------------------------
INSERT INTO sales_returns (company_id, return_number, customer_id, return_date, status, subtotal, tax_amount, total_amount, restock_inventory, notes, created_by) VALUES
(1, 'SR-2026-0001', 1, '2026-02-14', 'approved', 149.99, 30.00, 179.99, true, 'Customer returned 1 defective keyboard - key chattering issue', 1);

INSERT INTO sales_return_items (sales_return_id, product_id, quantity, unit_price, discount_percent, total, return_reason_id, reason_text, condition) VALUES
(1, 5, 1, 149.99, 0.00, 149.99, 1, 'Spacebar key registers double press', 'defective');

-- ------------------------------------------------------------------
-- 5gg. CREDIT NOTES
-- ------------------------------------------------------------------
INSERT INTO credit_notes (company_id, credit_note_number, reference_type, reference_id, customer_id, issue_date, amount, status, notes) VALUES
(1, 'CN-2026-0001', 'sales_return', 1, 1, '2026-02-14', 179.99, 'issued', 'Credit for defective keyboard return SR-2026-0001');

-- ==========================================================================
-- STEP 6: Show row counts per table
-- ==========================================================================
SELECT '=== DATA POPULATION COMPLETE ===' AS status;

SELECT 'COMPANIES' AS table_name, COUNT(*) AS row_count FROM companies
UNION ALL SELECT 'CUSTOMERS', COUNT(*) FROM customers
UNION ALL SELECT 'SUPPLIERS', COUNT(*) FROM suppliers
UNION ALL SELECT 'PRODUCTS', COUNT(*) FROM products
UNION ALL SELECT 'WAREHOUSES', COUNT(*) FROM warehouses
UNION ALL SELECT 'WAREHOUSE_BINS', COUNT(*) FROM warehouse_bins
UNION ALL SELECT 'PRODUCT_WAREHOUSE_STOCK', COUNT(*) FROM product_warehouse_stock
UNION ALL SELECT 'SALES_ORDERS', COUNT(*) FROM sales_orders
UNION ALL SELECT 'SALES_ORDER_ITEMS', COUNT(*) FROM sales_order_items
UNION ALL SELECT 'PURCHASE_ORDERS', COUNT(*) FROM purchase_orders
UNION ALL SELECT 'PURCHASE_ORDER_ITEMS', COUNT(*) FROM purchase_order_items
UNION ALL SELECT 'INVENTORY_TRANSACTIONS', COUNT(*) FROM inventory_transactions
UNION ALL SELECT 'INVOICES', COUNT(*) FROM invoices
UNION ALL SELECT 'INVOICE_ITEMS', COUNT(*) FROM invoice_items
UNION ALL SELECT 'PAYMENTS', COUNT(*) FROM payments
UNION ALL SELECT 'CHART_OF_ACCOUNTS', COUNT(*) FROM chart_of_accounts
UNION ALL SELECT 'JOURNAL_ENTRIES', COUNT(*) FROM journal_entries
UNION ALL SELECT 'JOURNAL_ENTRY_LINES', COUNT(*) FROM journal_entry_lines
UNION ALL SELECT 'COST_CENTERS', COUNT(*) FROM cost_centers
UNION ALL SELECT 'BUDGETS', COUNT(*) FROM budgets
UNION ALL SELECT 'BUDGET_ITEMS', COUNT(*) FROM budget_items
UNION ALL SELECT 'EMPLOYEES', COUNT(*) FROM employees
UNION ALL SELECT 'ATTENDANCE', COUNT(*) FROM attendance
UNION ALL SELECT 'LEAVE_REQUESTS', COUNT(*) FROM leave_requests
UNION ALL SELECT 'EMPLOYEE_DOCUMENTS', COUNT(*) FROM employee_documents
UNION ALL SELECT 'EXPENSE_CATEGORIES', COUNT(*) FROM expense_categories
UNION ALL SELECT 'EXPENSES', COUNT(*) FROM expenses
UNION ALL SELECT 'ASSET_CATEGORIES', COUNT(*) FROM asset_categories
UNION ALL SELECT 'FIXED_ASSETS', COUNT(*) FROM fixed_assets
UNION ALL SELECT 'ASSET_DEPRECIATION', COUNT(*) FROM asset_depreciation
UNION ALL SELECT 'SERVICES', COUNT(*) FROM services
UNION ALL SELECT 'SERVICE_INVOICES', COUNT(*) FROM service_invoices
UNION ALL SELECT 'SERVICE_INVOICE_ITEMS', COUNT(*) FROM service_invoice_items
UNION ALL SELECT 'QUOTATIONS', COUNT(*) FROM quotations
UNION ALL SELECT 'QUOTATION_ITEMS', COUNT(*) FROM quotation_items
UNION ALL SELECT 'LEADS', COUNT(*) FROM leads
UNION ALL SELECT 'OPPORTUNITIES', COUNT(*) FROM opportunities
UNION ALL SELECT 'PROJECTS', COUNT(*) FROM projects
UNION ALL SELECT 'PROJECT_MEMBERS', COUNT(*) FROM project_members
UNION ALL SELECT 'PROJECT_TASKS', COUNT(*) FROM project_tasks
UNION ALL SELECT 'TIME_ENTRIES', COUNT(*) FROM time_entries
UNION ALL SELECT 'APPROVAL_WORKFLOWS', COUNT(*) FROM approval_workflows
UNION ALL SELECT 'APPROVAL_STEPS', COUNT(*) FROM approval_steps
UNION ALL SELECT 'BANK_ACCOUNTS', COUNT(*) FROM bank_accounts
UNION ALL SELECT 'BANK_TRANSACTIONS', COUNT(*) FROM bank_transactions
UNION ALL SELECT 'STOCK_TRANSFERS', COUNT(*) FROM stock_transfers
UNION ALL SELECT 'STOCK_TRANSFER_ITEMS', COUNT(*) FROM stock_transfer_items
UNION ALL SELECT 'SALES_RETURNS', COUNT(*) FROM sales_returns
UNION ALL SELECT 'SALES_RETURN_ITEMS', COUNT(*) FROM sales_return_items
UNION ALL SELECT 'CREDIT_NOTES', COUNT(*) FROM credit_notes
ORDER BY table_name;

-- Keep auth tables untouched:
SELECT 'USERS (preserved)' AS note, COUNT(*) AS row_count FROM users
UNION ALL SELECT 'ROLES (preserved)', COUNT(*) FROM roles
UNION ALL SELECT 'TAX_RATES (preserved)', COUNT(*) FROM tax_rates
UNION ALL SELECT 'LEAVE_TYPES (preserved)', COUNT(*) FROM leave_types
UNION ALL SELECT 'LEAD_SOURCES (preserved)', COUNT(*) FROM lead_sources
UNION ALL SELECT 'LEAD_STATUSES (preserved)', COUNT(*) FROM lead_statuses
UNION ALL SELECT 'RETURN_REASONS (preserved)', COUNT(*) FROM return_reasons
ORDER BY note;

COMMIT;
