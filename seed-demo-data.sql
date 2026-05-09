-- ============================================================================
-- ERP DEMO DATA SEED SCRIPT
-- Resets all business data and populates with realistic demo data.
-- Does NOT modify table structures or auth tables (users, roles, etc.).
-- Run: psql -U postgres -d your_db_name -f seed-demo-data.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Temporarily disable triggers for performance
-- ============================================================================
SET session_replication_role = replica;

-- ============================================================================
-- STEP 2: DELETE existing data (child tables first, respecting FK order)
-- ============================================================================

-- Asset / Maintenance
DELETE FROM asset_maintenance;
DELETE FROM asset_depreciation;
DELETE FROM fixed_assets;
DELETE FROM asset_categories;

-- Projects / Tasks
DELETE FROM time_entries;
DELETE FROM project_members;
DELETE FROM project_tasks;
DELETE FROM projects;

-- Approvals
DELETE FROM approval_logs;
DELETE FROM approval_requests;
DELETE FROM approval_steps;
DELETE FROM approval_workflows;

-- Payments & Invoices
DELETE FROM payments;
DELETE FROM invoice_items;
DELETE FROM invoices;

-- Returns & Credits
DELETE FROM credit_notes;
DELETE FROM purchase_return_items;
DELETE FROM purchase_returns;
DELETE FROM sales_return_items;
DELETE FROM sales_returns;
DELETE FROM return_reasons;

-- Accounting
DELETE FROM budget_items;
DELETE FROM budgets;
DELETE FROM bank_transactions;
DELETE FROM reconciliation_reports;
DELETE FROM bank_accounts;
DELETE FROM recurring_entry_lines;
DELETE FROM recurring_entries;
DELETE FROM expenses;
DELETE FROM expense_categories;
DELETE FROM journal_entry_lines;
DELETE FROM journal_entries;
DELETE FROM chart_of_accounts;
DELETE FROM cost_centers;

-- Inventory & Warehouse
DELETE FROM inventory_transactions;
DELETE FROM product_warehouse_stock;
DELETE FROM stock_transfer_items;
DELETE FROM stock_transfers;
DELETE FROM warehouse_bins;
DELETE FROM warehouses;

-- Purchase Orders
DELETE FROM purchase_order_items;
DELETE FROM purchase_orders;

-- Sales Orders
DELETE FROM quotation_items;
DELETE FROM quotations;
DELETE FROM sales_order_items;
DELETE FROM sales_orders;

-- POS
DELETE FROM pos_transaction_items;
DELETE FROM pos_transactions;
DELETE FROM pos_cart;
DELETE FROM pos_sessions;

-- CRM
DELETE FROM interactions;
DELETE FROM follow_ups;
DELETE FROM opportunities;
DELETE FROM leads;
DELETE FROM lead_statuses;
DELETE FROM lead_sources;

-- HR
DELETE FROM employee_documents;
DELETE FROM attendance;
DELETE FROM leave_requests;
DELETE FROM leave_types;

-- Services
DELETE FROM service_invoice_items;
DELETE FROM service_invoices;
DELETE FROM services;

-- Core Business
DELETE FROM employees;
DELETE FROM products;
DELETE FROM suppliers;
DELETE FROM customers;
DELETE FROM companies;

-- Tax
DELETE FROM tax_rates;

-- ============================================================================
-- STEP 3: Reset all relevant sequences
-- ============================================================================
DO $$
DECLARE
    seq_list TEXT[] := ARRAY[
        'companies_id_seq', 'customers_id_seq', 'suppliers_id_seq',
        'products_id_seq', 'sales_orders_id_seq', 'sales_order_items_id_seq',
        'purchase_orders_id_seq', 'purchase_order_items_id_seq',
        'inventory_transactions_id_seq',
        'warehouses_id_seq', 'warehouse_bins_id_seq', 'product_warehouse_stock_id_seq',
        'stock_transfers_id_seq', 'stock_transfer_items_id_seq',
        'employees_id_seq', 'attendance_id_seq', 'leave_types_id_seq',
        'leave_requests_id_seq', 'employee_documents_id_seq',
        'chart_of_accounts_id_seq', 'journal_entries_id_seq', 'journal_entry_lines_id_seq',
        'invoices_id_seq', 'invoice_items_id_seq', 'payments_id_seq',
        'asset_categories_id_seq', 'fixed_assets_id_seq', 'asset_depreciation_id_seq',
        'asset_maintenance_id_seq',
        'projects_id_seq', 'project_tasks_id_seq', 'project_members_id_seq',
        'time_entries_id_seq',
        'approval_workflows_id_seq', 'approval_steps_id_seq', 'approval_requests_id_seq',
        'approval_logs_id_seq',
        'cost_centers_id_seq', 'budgets_id_seq', 'budget_items_id_seq',
        'bank_accounts_id_seq', 'bank_transactions_id_seq', 'reconciliation_reports_id_seq',
        'recurring_entries_id_seq', 'recurring_entry_lines_id_seq',
        'expense_categories_id_seq', 'expenses_id_seq',
        'return_reasons_id_seq', 'sales_returns_id_seq', 'sales_return_items_id_seq',
        'purchase_returns_id_seq', 'purchase_return_items_id_seq', 'credit_notes_id_seq',
        'tax_rates_id_seq', 'services_id_seq', 'service_invoices_id_seq',
        'service_invoice_items_id_seq',
        'quotations_id_seq', 'quotation_items_id_seq',
        'pos_sessions_id_seq', 'pos_cart_id_seq', 'pos_transactions_id_seq',
        'pos_transaction_items_id_seq',
        'lead_sources_id_seq', 'lead_statuses_id_seq', 'leads_id_seq',
        'opportunities_id_seq', 'follow_ups_id_seq', 'interactions_id_seq',
        'crm_email_templates_id_seq'
    ];
    s TEXT;
BEGIN
    FOREACH s IN ARRAY seq_list LOOP
        IF EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = s) THEN
            EXECUTE 'ALTER SEQUENCE ' || s || ' RESTART WITH 1';
        END IF;
    END LOOP;
END $$;

-- ============================================================================
-- STEP 4: Re-enable triggers (data is clean)
-- ============================================================================
SET session_replication_role = DEFAULT;

-- ============================================================================
-- STEP 5: INSERT DEMO DATA
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 5a. TAX RATES
-- ---------------------------------------------------------------------------
INSERT INTO tax_rates (company_id, name, rate, type, is_default, is_active, description) VALUES
(1, 'Standard VAT', 20.00, 'VAT', true, true, 'Standard VAT rate 20%'),
(1, 'Reduced VAT', 5.00, 'VAT', false, true, 'Reduced VAT rate 5%'),
(1, 'Zero Rated', 0.00, 'VAT', false, true, 'Zero rated supplies');

-- ---------------------------------------------------------------------------
-- 5b. COMPANY (single tenant)
-- ---------------------------------------------------------------------------
INSERT INTO companies (name, tax_id, email, phone, address, currency)
VALUES ('TechNova Solutions Inc.', 'TN-47-3298741', 'info@technova.com', '+1 (214) 555-0198', '2800 North Dallas Parkway, Suite 400, Dallas, TX 75201', 'USD');

-- ---------------------------------------------------------------------------
-- 5c. CUSTOMERS (6)
-- ---------------------------------------------------------------------------
INSERT INTO customers (company_id, name, email, phone, billing_address, shipping_address) VALUES
(1, 'Quantum Financial Group', 'ap@quantumfinancial.com', '+1 (212) 555-2400', '1 Financial Square, New York, NY 10005', '1 Financial Square, New York, NY 10005'),
(1, 'MedCore Health Systems', 'purchasing@medcore.com', '+1 (617) 555-7800', '200 Brookline Ave, Boston, MA 02215', '200 Brookline Ave, Boston, MA 02215'),
(1, 'Apex Manufacturing LLC', 'procurement@apexmfg.com', '+1 (313) 555-6300', '1500 Industrial Blvd, Detroit, MI 48216', '1500 Industrial Blvd, Detroit, MI 48216'),
(1, 'BrightPath Education Inc.', 'finance@brightpath.edu', '+1 (512) 555-4100', '8900 Research Blvd, Austin, TX 78758', '8900 Research Blvd, Austin, TX 78758'),
(1, 'Velocity Logistics Corp', 'accountspayable@velocitylogistics.com', '+1 (312) 555-8700', '4500 West 47th Street, Chicago, IL 60632', '4500 West 47th Street, Chicago, IL 60632'),
(1, 'GreenLeaf Energy Solutions', 'procurement@greenleafenergy.com', '+1 (303) 555-3200', '1200 17th Street, Suite 800, Denver, CO 80202', '1200 17th Street, Suite 800, Denver, CO 80202');

-- ---------------------------------------------------------------------------
-- 5d. SUPPLIERS (5)
-- ---------------------------------------------------------------------------
INSERT INTO suppliers (company_id, name, email, phone, address) VALUES
(1, 'Dell Technologies Inc.', 'enterprise.sales@dell.com', '+1 (800) 555-4700', 'One Dell Way, Round Rock, TX 78682'),
(1, 'Ingram Micro Inc.', 'orders@ingrammicro.com', '+1 (714) 555-1000', '3351 Michelson Drive, Irvine, CA 92612'),
(1, 'CDW Corporation', 'sales@cdw.com', '+1 (847) 555-7700', '200 N Milwaukee Ave, Vernon Hills, IL 60061'),
(1, 'Synnex Corporation', 'customer.service@synnex.com', '+1 (510) 555-2300', '44201 Nobel Drive, Fremont, CA 94538'),
(1, 'Office Depot LLC', 'b2bsales@officedepot.com', '+1 (561) 555-4400', '6600 North Military Trail, Boca Raton, FL 33496');

-- ---------------------------------------------------------------------------
-- 5e. PRODUCTS (12 realistic items)
-- ---------------------------------------------------------------------------
INSERT INTO products (company_id, sku, name, description, unit_price, cost_price, current_stock, reorder_level, tax_rate_id) VALUES
(1, 'LAP-DELL-7400', 'Dell Latitude 7440 Laptop', 'Intel Core i7-1365U, 16GB DDR5, 512GB SSD, 14" FHD Touchscreen, Windows 11 Pro', 1249.00, 875.00, 45, 10, 1),
(1, 'LAP-HP-PRO', 'HP ProBook 450 G11', 'Intel Core i5-1345U, 16GB RAM, 512GB SSD, 15.6" FHD, Windows 11 Pro', 1099.00, 769.00, 38, 10, 1),
(1, 'MON-SAM-27', 'Samsung 27" 4K UHD Monitor', 'LG 27UP850N-W, 27" 4K IPS, USB-C 90W PD, HDR10, Pivot/Height Adjustable', 449.00, 315.00, 60, 15, 1),
(1, 'MON-DEL-24', 'Dell 24" FHD Monitor', 'Dell S2425HS, 24" FHD IPS, 75Hz, USB-C, Built-in Speakers, VESA Compatible', 219.00, 153.00, 85, 20, 1),
(1, 'NW-CIS-9200', 'Cisco Catalyst 9200-48P Switch', '48-Port Gigabit PoE+ Switch, 4x10G SFP+, Network Essentials License', 2899.00, 2030.00, 12, 5, 1),
(1, 'NW-UBI-AP', 'Ubiquiti UniFi 6 Pro Access Point', 'WiFi 6 (802.11ax), Dual-Band, 5.3 Gbps Throughput, PoE+ Powered', 179.00, 125.00, 90, 20, 1),
(1, 'NW-MIK-RB', 'MikroTik RB5009UG+S+ Router', '10-Port Gigabit Router, 1x10G SFP+, 7xGbE, RouterOS L5, 1GB RAM', 249.00, 174.00, 25, 8, 1),
(1, 'OFF-HER-MY', 'Herman Miller Aeron Chair', 'Size B (Medium), Mineral Graphite Frame, 8Z Pellicle Mesh, PostureFit SL, Adjustable Arms', 1395.00, 976.00, 18, 5, 1),
(1, 'OFF-STE-SF', 'Steelcase Standing Desk', 'SteelSeries Ology 60x30, Electric Height Adjustable, Laminate Top, Programmable Memory', 1899.00, 1329.00, 10, 3, 1),
(1, 'OFF-KEN-T5', 'Kensington SD5700P Thunderbolt 4 Dock', 'Thunderbolt 4, 8K@30Hz, Dual 4K@60Hz, 96W PD, USB-A/C, 2.5GbE, SD 4.0', 329.00, 230.00, 35, 10, 1),
(1, 'SW-M365-BP', 'Microsoft 365 Business Premium (1yr)', 'Microsoft 365 Business Premium annual subscription per user, includes Office apps, Defender, Intune', 264.00, 185.00, 200, 50, 1),
(1, 'SW-ADP-WK1', 'Adobe Creative Cloud Team License (1yr)', 'Adobe Creative Cloud All Apps team license, annual subscription per seat', 599.00, 419.00, 150, 30, 1);

-- ---------------------------------------------------------------------------
-- 5f. EMPLOYEES (10)
-- ---------------------------------------------------------------------------
INSERT INTO employees (company_id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, address, city, state, postal_code, country, department, position, hire_date, employment_type, salary, bank_name, bank_account_no, bank_routing_no, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, status) VALUES
(1, 'EMP-001', 'Sarah', 'Chen', 'sarah.chen@technova.com', '+1 (214) 555-1001', '1985-03-12', 'Female', '4520 Preston Road, Suite 200', 'Dallas', 'TX', '75205', 'USA', 'Executive', 'Chief Executive Officer', '2020-01-15', 'Full-time', 250000.00, 'Chase Bank', '****1234', '111000025', 'Michael Chen', '+1 (214) 555-9101', 'Spouse'),
(1, 'EMP-002', 'Marcus', 'Williams', 'marcus.williams@technova.com', '+1 (214) 555-1002', '1982-07-24', 'Male', '3100 McKinney Ave, Apt 15B', 'Dallas', 'TX', '75204', 'USA', 'Operations', 'VP of Operations', '2020-03-01', 'Full-time', 185000.00, 'Bank of America', '****5678', '111000025', 'Alicia Williams', '+1 (214) 555-9102', 'Spouse'),
(1, 'EMP-003', 'Emily', 'Rodriguez', 'emily.rodriguez@technova.com', '+1 (214) 555-1003', '1990-11-05', 'Female', '7426 Elm Street, Apt 7', 'Dallas', 'TX', '75201', 'USA', 'Sales', 'Sales Manager', '2021-06-01', 'Full-time', 135000.00, 'Wells Fargo', '****9012', '111000025', 'Carlos Rodriguez', '+1 (214) 555-9103', 'Brother'),
(1, 'EMP-004', 'David', 'Kim', 'david.kim@technova.com', '+1 (214) 555-1004', '1988-09-18', 'Male', '12500 Dallas Parkway, Apt 320', 'Dallas', 'TX', '75230', 'USA', 'Warehouse', 'Warehouse Manager', '2021-09-15', 'Full-time', 82000.00, 'Chase Bank', '****3456', '111000025', 'Soo Jin Kim', '+1 (214) 555-9104', 'Spouse'),
(1, 'EMP-005', 'Lisa', 'Thompson', 'lisa.thompson@technova.com', '+1 (214) 555-1005', '1992-04-22', 'Female', '5600 SMU Boulevard, Apt 12', 'Dallas', 'TX', '75206', 'USA', 'Accounting', 'Senior Accountant', '2022-01-10', 'Full-time', 95000.00, 'Chase Bank', '****7890', '111000025', 'James Thompson', '+1 (214) 555-9105', 'Spouse'),
(1, 'EMP-006', 'James', 'Mitchell', 'james.mitchell@technova.com', '+1 (214) 555-1006', '1986-08-14', 'Male', '2200 Ross Avenue, Apt 8F', 'Dallas', 'TX', '75201', 'USA', 'IT', 'IT Manager', '2021-04-01', 'Full-time', 115000.00, 'Bank of America', '****2345', '111000025', 'Karen Mitchell', '+1 (214) 555-9106', 'Spouse'),
(1, 'EMP-007', 'Amanda', 'Foster', 'amanda.foster@technova.com', '+1 (214) 555-1007', '1991-12-03', 'Female', '3700 McKinney Ave, Apt 4C', 'Dallas', 'TX', '75204', 'USA', 'Human Resources', 'HR Manager', '2022-03-15', 'Full-time', 88000.00, 'Wells Fargo', '****6789', '111000025', 'Robert Foster', '+1 (214) 555-9107', 'Spouse'),
(1, 'EMP-008', 'Robert', 'Garcia', 'robert.garcia@technova.com', '+1 (214) 555-1008', '1994-06-30', 'Male', '8900 Greenville Ave, Apt 204', 'Dallas', 'TX', '75243', 'USA', 'Sales', 'Sales Representative', '2023-02-01', 'Full-time', 72000.00, 'Chase Bank', '****0123', '111000025', 'Maria Garcia', '+1 (214) 555-9108', 'Mother'),
(1, 'EMP-009', 'Jennifer', 'Lee', 'jennifer.lee@technova.com', '+1 (214) 555-1009', '1993-10-17', 'Female', '1500 Pacific Avenue, Apt 22A', 'Dallas', 'TX', '75201', 'USA', 'Logistics', 'Logistics Coordinator', '2023-06-01', 'Full-time', 58000.00, 'Bank of America', '****4567', '111000025', 'Andrew Lee', '+1 (214) 555-9109', 'Brother'),
(1, 'EMP-010', 'Michael', 'Brown', 'michael.brown@technova.com', '+1 (214) 555-1010', '1996-02-28', 'Male', '6800 Meadow Road, Apt 315', 'Dallas', 'TX', '75231', 'USA', 'Accounting', 'Accounting Clerk', '2024-01-15', 'Full-time', 48000.00, 'Chase Bank', '****8901', '111000025', 'Susan Brown', '+1 (214) 555-9110', 'Mother');

-- ---------------------------------------------------------------------------
-- 5g. LEAVE TYPES
-- ---------------------------------------------------------------------------
INSERT INTO leave_types (company_id, name, code, default_days, is_paid, requires_approval, is_active) VALUES
(1, 'Annual Leave', 'AL', 20, true, true, true),
(1, 'Sick Leave', 'SL', 12, true, true, true),
(1, 'Casual Leave', 'CL', 5, true, true, true),
(1, 'Public Holiday', 'PH', 0, true, false, true),
(1, 'Unpaid Leave', 'UL', 0, false, true, true);

-- ---------------------------------------------------------------------------
-- 5h. RETURN REASONS
-- ---------------------------------------------------------------------------
INSERT INTO return_reasons (company_id, reason_code, reason_name, category, is_active) VALUES
(1, 'DEFECTIVE', 'Defective or Damaged Product', 'both', true),
(1, 'WRONG_ITEM', 'Wrong Item Shipped', 'both', true),
(1, 'CUSTOMER_REQUEST', 'Customer Request or Change of Mind', 'sales', true),
(1, 'QUALITY_ISSUE', 'Quality Issue or Non-Conformance', 'purchase', true),
(1, 'EXPIRED', 'Product Expired or Near Expiry', 'both', true),
(1, 'DAMAGED', 'Damaged During Transit', 'both', true),
(1, 'OVERSTOCK', 'Overstock or Duplicate Order', 'purchase', true),
(1, 'INSTALL_FAIL', 'Installation or Compatibility Failure', 'sales', true);

-- ---------------------------------------------------------------------------
-- 5i. WAREHOUSES (3) + BINS
-- ---------------------------------------------------------------------------
INSERT INTO warehouses (company_id, code, name, address, city, state, country, postal_code, phone, email, is_default, is_active) VALUES
(1, 'WH-DAL', 'Dallas Distribution Center', '2800 North Dallas Parkway, Suite 100', 'Dallas', 'TX', 'USA', '75201', '+1 (214) 555-2000', 'warehouse.dal@technova.com', true, true),
(1, 'WH-CHI', 'Chicago Logistics Hub', '4500 West 47th Street', 'Chicago', 'IL', 'USA', '60632', '+1 (312) 555-2100', 'warehouse.chi@technova.com', false, true),
(1, 'WH-ATL', 'Atlanta Regional Warehouse', '2300 Airport Industrial Drive', 'Atlanta', 'GA', 'USA', '30337', '+1 (404) 555-2200', 'warehouse.atl@technova.com', false, true);

INSERT INTO warehouse_bins (company_id, warehouse_id, code, name, zone, aisle, rack, shelf, max_capacity, is_active) VALUES
-- Dallas bins
(1, 1, 'DAL-A1-01', 'Aisle A Rack 1 Shelf 1', 'A', 'A1', 'R1', 'S1', 50, true),
(1, 1, 'DAL-A1-02', 'Aisle A Rack 1 Shelf 2', 'A', 'A1', 'R1', 'S2', 50, true),
(1, 1, 'DAL-A2-01', 'Aisle A Rack 2 Shelf 1', 'A', 'A2', 'R2', 'S1', 50, true),
(1, 1, 'DAL-B1-01', 'Aisle B Rack 1 Shelf 1', 'B', 'B1', 'R1', 'S1', 40, true),
(1, 1, 'DAL-B1-02', 'Aisle B Rack 1 Shelf 2', 'B', 'B1', 'R1', 'S2', 40, true),
-- Chicago bins
(1, 2, 'CHI-A1-01', 'Aisle A Rack 1 Shelf 1', 'A', 'A1', 'R1', 'S1', 50, true),
(1, 2, 'CHI-A1-02', 'Aisle A Rack 1 Shelf 2', 'A', 'A1', 'R1', 'S2', 50, true),
(1, 2, 'CHI-B1-01', 'Aisle B Rack 1 Shelf 1', 'B', 'B1', 'R1', 'S1', 30, true),
-- Atlanta bins
(1, 3, 'ATL-A1-01', 'Aisle A Rack 1 Shelf 1', 'A', 'A1', 'R1', 'S1', 50, true),
(1, 3, 'ATL-A1-02', 'Aisle A Rack 1 Shelf 2', 'A', 'A1', 'R1', 'S2', 50, true);

-- ---------------------------------------------------------------------------
-- 5j. PRODUCT WAREHOUSE STOCK (initial stock distribution)
-- ---------------------------------------------------------------------------
INSERT INTO product_warehouse_stock (company_id, product_id, warehouse_id, bin_id, quantity, reserved_quantity, reorder_level) VALUES
(1, 1, 1, 1, 20, 2, 10),  -- Dell Laptops in DAL
(1, 1, 2, 6, 15, 0, 10),  -- Dell Laptops in CHI
(1, 1, 3, 9, 10, 0, 10),   -- Dell Laptops in ATL
(1, 2, 1, 1, 18, 1, 10),  -- HP Laptops in DAL
(1, 2, 2, 6, 12, 0, 10),  -- HP Laptops in CHI
(1, 2, 3, 9, 8, 0, 10),   -- HP Laptops in ATL
(1, 3, 1, 2, 25, 3, 15),  -- Samsung Monitors in DAL
(1, 3, 2, 7, 20, 0, 15),  -- Samsung Monitors in CHI
(1, 3, 3, 10, 15, 0, 15), -- Samsung Monitors in ATL
(1, 4, 1, 2, 40, 2, 20),  -- Dell Monitors in DAL
(1, 4, 2, 7, 30, 0, 20),  -- Dell Monitors in CHI
(1, 4, 3, 10, 15, 0, 20), -- Dell Monitors in ATL
(1, 5, 1, 3, 8, 1, 5),    -- Cisco Switches in DAL
(1, 5, 2, 8, 4, 0, 5),    -- Cisco Switches in CHI
(1, 6, 1, 3, 40, 5, 20),  -- UniFi APs in DAL
(1, 6, 2, 8, 30, 0, 20),  -- UniFi APs in CHI
(1, 6, 3, 10, 20, 0, 20), -- UniFi APs in ATL
(1, 7, 1, 3, 15, 0, 8),   -- MikroTik Routers in DAL
(1, 7, 2, 8, 10, 0, 8),   -- MikroTik Routers in CHI
(1, 8, 1, 4, 10, 1, 5),   -- Aeron Chairs in DAL
(1, 8, 2, 8, 5, 0, 5),    -- Aeron Chairs in CHI
(1, 8, 3, 9, 3, 0, 5),    -- Aeron Chairs in ATL
(1, 9, 1, 4, 6, 0, 3),    -- Standing Desks in DAL
(1, 9, 2, 8, 4, 0, 3),    -- Standing Desks in CHI
(1, 10, 1, 5, 20, 2, 10), -- Kensington Docks in DAL
(1, 10, 2, 7, 10, 0, 10), -- Kensington Docks in CHI
(1, 10, 3, 9, 5, 0, 10); -- Kensington Docks in ATL

-- ---------------------------------------------------------------------------
-- 5k. SALES ORDERS (4 confirmed orders)
-- ---------------------------------------------------------------------------
INSERT INTO sales_orders (company_id, customer_id, order_number, order_date, status, subtotal, tax_total, grand_total, notes, created_by, payment_status, warehouse_id) VALUES
(1, 1, 'SO-2026-0001', '2026-01-15', 'shipped', 7495.00, 1499.00, 8994.00, 'Q1 Infrastructure upgrade - Quantum Financial. 5x Dell laptops, 3x Samsung monitors.', 3, 'paid', 1),
(1, 2, 'SO-2026-0002', '2026-02-03', 'shipped', 28990.00, 5798.00, 34788.00, 'MedCore network refresh - 10x Cisco Catalyst 9200 switches for hospital campus.', 3, 'paid', 1),
(1, 3, 'SO-2026-0003', '2026-02-20', 'confirmed', 21000.00, 4200.00, 25200.00, 'Apex Manufacturing office fit-out. 12x Aeron chairs, 3x standing desks, 5x HP laptops.', 8, 'unpaid', 1),
(1, 4, 'SO-2026-0004', '2026-03-01', 'confirmed', 8052.00, 1610.40, 9662.40, 'BrightPath Education IT lab refresh. 8x HP laptops, 12x Dell monitors, 10x Kensington docks.', 8, 'unpaid', 2);

-- ---------------------------------------------------------------------------
-- 5l. SALES ORDER ITEMS
-- ---------------------------------------------------------------------------
-- SO-2026-0001: Quantum Financial
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
(1, 1, 5, 1249.00, 0.00, 6245.00),
(1, 3, 3, 449.00, 0.00, 1347.00);
-- Update SO subtotal to match items total
UPDATE sales_orders SET subtotal = 7592.00, tax_total = 1518.40, grand_total = 9110.40 WHERE id = 1;

-- SO-2026-0002: MedCore
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
(2, 5, 10, 2899.00, 0.00, 28990.00);

-- SO-2026-0003: Apex Manufacturing
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
(3, 8, 12, 1395.00, 0.00, 16740.00),
(3, 9, 3, 1899.00, 0.00, 5697.00),
(3, 2, 5, 1099.00, 0.00, 5495.00);
UPDATE sales_orders SET subtotal = 27932.00, tax_total = 5586.40, grand_total = 33518.40 WHERE id = 3;

-- SO-2026-0004: BrightPath
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
(4, 2, 8, 1099.00, 0.00, 8792.00),
(4, 4, 12, 219.00, 0.00, 2628.00),
(4, 10, 10, 329.00, 5.00, 3125.50);
UPDATE sales_orders SET subtotal = 14545.50, tax_total = 2909.10, grand_total = 17454.60 WHERE id = 4;

-- ---------------------------------------------------------------------------
-- 5m. PURCHASE ORDERS (3)
-- ---------------------------------------------------------------------------
INSERT INTO purchase_orders (company_id, supplier_id, po_number, order_date, expected_delivery_date, status, subtotal, tax_total, grand_total, notes, created_by, payment_status, warehouse_id, total_amount) VALUES
(1, 1, 'PO-2026-0001', '2026-01-05', '2026-01-20', 'received', 43750.00, 8750.00, 52500.00, 'Restock Dell Latitude laptops - Q1 inventory replenishment. 50 units.', 6, 'paid', 1, 52500.00),
(1, 2, 'PO-2026-0002', '2026-02-10', '2026-03-01', 'received', 14950.00, 2990.00, 17940.00, 'Cisco switches and Ubiquiti APs for upcoming customer deployments.', 6, 'paid', 1, 17940.00),
(1, 5, 'PO-2026-0003', '2026-03-05', '2026-03-25', 'sent', 26150.00, 5230.00, 31380.00, 'Office furniture restock - Aeron chairs and standing desks for upcoming projects.', 6, 'unpaid', 1, 31380.00);

-- ---------------------------------------------------------------------------
-- 5n. PURCHASE ORDER ITEMS
-- ---------------------------------------------------------------------------
-- PO-2026-0001: Dell - 50 Laptops
INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity) VALUES
(1, 1, 50, 875.00, 43750.00, 50);

-- PO-2026-0002: Ingram Micro
INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity) VALUES
(2, 5, 10, 2030.00, 20300.00, 10),
(2, 6, 50, 125.00, 6250.00, 50);
UPDATE purchase_orders SET subtotal = 26550.00, tax_total = 5310.00, grand_total = 31860.00, total_amount = 31860.00 WHERE id = 2;

-- PO-2026-0003: Office Depot
INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity) VALUES
(3, 8, 20, 976.00, 19520.00, 0),
(3, 9, 5, 1329.00, 6645.00, 0);

-- ---------------------------------------------------------------------------
-- 5o. INVENTORY TRANSACTIONS
-- ---------------------------------------------------------------------------
-- PO Receipts (stock in)
INSERT INTO inventory_transactions (company_id, product_id, warehouse_id, type, transaction_type, quantity, reference_type, reference_id, notes) VALUES
(1, 1, 1, 'in', 'in', 50, 'purchase_order', 1, 'PO-2026-0001 received - Dell Latitude laptops'),
(1, 5, 1, 'in', 'in', 10, 'purchase_order', 2, 'PO-2026-0002 received - Cisco Catalyst switches'),
(1, 6, 1, 'in', 'in', 50, 'purchase_order', 2, 'PO-2026-0002 received - Ubiquiti APs');

-- SO Shipments (stock out)
INSERT INTO inventory_transactions (company_id, product_id, warehouse_id, type, transaction_type, quantity, reference_type, reference_id, notes) VALUES
(1, 1, 1, 'out', 'out', 5, 'sales_order', 1, 'SO-2026-0001 shipped - 5x Dell laptops to Quantum Financial'),
(1, 3, 1, 'out', 'out', 3, 'sales_order', 1, 'SO-2026-0001 shipped - 3x Samsung monitors to Quantum Financial'),
(1, 5, 1, 'out', 'out', 10, 'sales_order', 2, 'SO-2026-0002 shipped - 10x Cisco switches to MedCore Health');

-- Stock adjustment (cycle count correction)
INSERT INTO inventory_transactions (company_id, product_id, warehouse_id, type, transaction_type, quantity, reference_type, notes) VALUES
(1, 4, 1, 'adjustment', 'adjustment', 2, 'cycle_count', 'Cycle count adjustment Q1 2026 - found 2 extra Dell monitors');

-- ---------------------------------------------------------------------------
-- 5p. CHART OF ACCOUNTS
-- ---------------------------------------------------------------------------
INSERT INTO chart_of_accounts (company_id, account_code, account_name, account_type, parent_account_id, description, is_active) VALUES
(1, '1000', 'Cash and Cash Equivalents', 'asset', NULL, 'Cash on hand and demand deposits', true),
(1, '1010', 'Chase Business Checking', 'asset', 1, 'Chase Bank business checking account x1234', true),
(1, '1020', 'Bank of America Savings', 'asset', 1, 'BofA business savings account x5678', true),
(1, '1100', 'Accounts Receivable', 'asset', NULL, 'Trade receivables from customers', true),
(1, '1200', 'Inventory', 'asset', NULL, 'Finished goods inventory held for sale', true),
(1, '1300', 'Prepaid Expenses', 'asset', NULL, 'Prepaid insurance, rent, subscriptions', true),
(1, '1400', 'Fixed Assets', 'asset', NULL, 'Property, plant and equipment', true),
(1, '1410', 'Computer Equipment', 'asset', 7, 'Servers, networking, computer hardware', true),
(1, '1420', 'Furniture and Fixtures', 'asset', 7, 'Office furniture, chairs, desks', true),
(1, '1430', 'Vehicles', 'asset', 7, 'Company vehicles for delivery and transport', true),
(1, '1500', 'Accumulated Depreciation', 'asset', NULL, 'Contra-asset for accumulated depreciation', true),
(1, '2000', 'Accounts Payable', 'liability', NULL, 'Trade payables to suppliers', true),
(1, '2100', 'Accrued Expenses', 'liability', NULL, 'Accrued salaries, utilities, taxes', true),
(1, '2200', 'Short-term Loans', 'liability', NULL, 'Short-term bank loans and credit lines', true),
(1, '3000', 'Common Stock', 'equity', NULL, 'Share capital issued', true),
(1, '3100', 'Retained Earnings', 'equity', NULL, 'Accumulated retained earnings', true),
(1, '3200', 'Current Year Earnings', 'equity', NULL, 'Current fiscal year profit or loss', true),
(1, '4000', 'Sales Revenue - Products', 'revenue', NULL, 'Revenue from product sales', true),
(1, '4100', 'Service Revenue', 'revenue', NULL, 'Revenue from services rendered', true),
(1, '5000', 'Cost of Goods Sold', 'expense', NULL, 'Direct cost of products sold', true),
(1, '5100', 'Salaries and Wages', 'expense', NULL, 'Employee salaries, wages and bonuses', true),
(1, '5200', 'Rent and Utilities', 'expense', NULL, 'Office and warehouse rent, utilities', true),
(1, '5300', 'Office Supplies', 'expense', NULL, 'Office supplies and consumables', true),
(1, '5400', 'Depreciation Expense', 'expense', NULL, 'Periodic depreciation charges', true),
(1, '5500', 'Marketing and Advertising', 'expense', NULL, 'Marketing campaigns, ads, promotions', true),
(1, '5600', 'Insurance Expense', 'expense', NULL, 'Business insurance premiums', true),
(1, '5700', 'Professional Fees', 'expense', NULL, 'Legal, audit, consulting fees', true),
(1, '5800', 'Travel and Entertainment', 'expense', NULL, 'Business travel, meals, entertainment', true),
(1, '5900', 'Tax Expense', 'expense', NULL, 'Income tax, property tax, other taxes', true);

-- ---------------------------------------------------------------------------
-- 5q. COST CENTERS
-- ---------------------------------------------------------------------------
INSERT INTO cost_centers (company_id, code, name, description, is_active) VALUES
(1, 'IT', 'Information Technology', 'IT infrastructure, software, and support', true),
(1, 'SALES', 'Sales and Marketing', 'Sales operations, marketing campaigns', true),
(1, 'OPS', 'Operations', 'Warehouse, logistics, and fulfillment', true),
(1, 'ADMIN', 'Administration', 'Executive, HR, finance, and legal', true),
(1, 'RND', 'Research and Development', 'Product development and innovation', true);

-- ---------------------------------------------------------------------------
-- 5r. JOURNAL ENTRIES & LINES
-- ---------------------------------------------------------------------------
-- JE-1: January Sales Revenue Recognition
INSERT INTO journal_entries (company_id, entry_date, account_id, debit, credit, description, voucher_no, voucher_type, total_debit, total_credit, status, created_by) VALUES
(1, '2026-01-31', NULL, NULL, NULL, 'January 2026 sales revenue - SO-2026-0001 Quantum Financial', 'JV-2026-00001', 'Receipt', 27932.00, 27932.00, 'approved', 5);

INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
(1, 2, 9110.40, 0.00, 'Accounts Receivable - Quantum Financial Group'),
(1, 17, 0.00, 7592.00, 'Sales Revenue - Product sales (SO-2026-0001)'),
(1, 25, 0.00, 1518.40, 'Tax Liability - VAT on sales');

-- JE-2: January COGS
INSERT INTO journal_entries (company_id, entry_date, account_id, debit, credit, description, voucher_no, voucher_type, total_debit, total_credit, status, created_by) VALUES
(1, '2026-01-31', NULL, NULL, NULL, 'January 2026 cost of goods sold - SO-2026-0001', 'JV-2026-00002', 'Journal', 4975.00, 4975.00, 'approved', 5);

INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
(2, 19, 4975.00, 0.00, 'COGS - Dell laptops (5 x $875) + Samsung monitors (3 x $315)'),
(2, 5, 0.00, 4975.00, 'Inventory reduction - shipped goods');

-- JE-3: February Payroll
INSERT INTO journal_entries (company_id, entry_date, account_id, debit, credit, description, voucher_no, voucher_type, total_debit, total_credit, status, created_by) VALUES
(1, '2026-02-15', NULL, NULL, NULL, 'February 2026 semi-monthly payroll', 'JV-2026-00003', 'Payment', 57500.00, 57500.00, 'approved', 5);

INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
(3, 20, 57500.00, 0.00, 'Salaries and wages - February 1-15 payroll'),
(3, 1, 0.00, 43125.00, 'Cash disbursement - net pay via ACH'),
(3, 12, 0.00, 14375.00, 'Payroll liabilities - tax withholdings and benefits');

-- JE-4: February Sales (MedCore)
INSERT INTO journal_entries (company_id, entry_date, account_id, debit, credit, description, voucher_no, voucher_type, total_debit, total_credit, status, created_by) VALUES
(1, '2026-02-28', NULL, NULL, NULL, 'February sales - SO-2026-0002 MedCore Health Systems', 'JV-2026-00004', 'Receipt', 34788.00, 34788.00, 'approved', 5);

INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
(4, 2, 34788.00, 0.00, 'Accounts Receivable - MedCore Health Systems'),
(4, 17, 0.00, 28990.00, 'Sales Revenue - 10x Cisco Catalyst switches'),
(4, 25, 0.00, 5798.00, 'Tax Liability - VAT on sales');

-- JE-5: Prepaid Insurance
INSERT INTO journal_entries (company_id, entry_date, account_id, debit, credit, description, voucher_no, voucher_type, total_debit, total_credit, status, created_by) VALUES
(1, '2026-01-01', NULL, NULL, NULL, 'Annual business insurance premium - 2026', 'JV-2026-00005', 'Payment', 24000.00, 24000.00, 'approved', 5);

INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
(5, 6, 24000.00, 0.00, 'Prepaid insurance - full year 2026'),
(5, 1, 0.00, 24000.00, 'Cash payment - annual premium');

-- ---------------------------------------------------------------------------
-- 5s. INVOICES & PAYMENTS
-- ---------------------------------------------------------------------------
INSERT INTO invoices (company_id, invoice_number, sales_order_id, customer_id, invoice_date, due_date, status, subtotal, tax_total, grand_total, amount_paid, payment_terms, notes, created_by) VALUES
(1, 'INV-2026-0001', 1, 1, '2026-01-20', '2026-02-19', 'paid', 7592.00, 1518.40, 9110.40, 9110.40, 'Net 30', 'Invoice for SO-2026-0001 - Q1 IT upgrade', 3),
(1, 'INV-2026-0002', 2, 2, '2026-02-10', '2026-03-12', 'paid', 28990.00, 5798.00, 34788.00, 34788.00, 'Net 30', 'Invoice for SO-2026-0002 - Network infrastructure', 3),
(1, 'INV-2026-0003', 3, 3, '2026-03-01', '2026-03-31', 'sent', 27932.00, 5586.40, 33518.40, 0.00, 'Net 30', 'Invoice for SO-2026-0003 - Office fit-out', 8),
(1, 'INV-2026-0004', 4, 4, '2026-03-05', '2026-04-04', 'sent', 14545.50, 2909.10, 17454.60, 0.00, 'Net 30', 'Invoice for SO-2026-0004 - IT lab refresh', 8);

INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total) VALUES
(1, 1, 'Dell Latitude 7440 Laptop', 5, 1249.00, 0.00, 20.00, 6245.00),
(1, 3, 'Samsung 27" 4K UHD Monitor', 3, 449.00, 0.00, 20.00, 1347.00),
(2, 5, 'Cisco Catalyst 9200-48P Switch', 10, 2899.00, 0.00, 20.00, 28990.00),
(3, 8, 'Herman Miller Aeron Chair', 12, 1395.00, 0.00, 20.00, 16740.00),
(3, 9, 'Steelcase Standing Desk', 3, 1899.00, 0.00, 20.00, 5697.00),
(3, 2, 'HP ProBook 450 G11', 5, 1099.00, 0.00, 20.00, 5495.00),
(4, 2, 'HP ProBook 450 G11', 8, 1099.00, 0.00, 20.00, 8792.00),
(4, 4, 'Dell 24" FHD Monitor', 12, 219.00, 0.00, 20.00, 2628.00),
(4, 10, 'Kensington SD5700P Thunderbolt 4 Dock', 10, 329.00, 5.00, 20.00, 3125.50);

-- ---------------------------------------------------------------------------
-- 5t. PAYMENTS
-- ---------------------------------------------------------------------------
INSERT INTO payments (company_id, invoice_id, payment_number, payment_date, amount, payment_method, reference_number, notes, created_by) VALUES
(1, 1, 'PMT-2026-0001', '2026-02-10', 9110.40, 'Wire Transfer', 'WF-20260210-QF', 'Payment received from Quantum Financial - INV-2026-0001', 5),
(1, 2, 'PMT-2026-0002', '2026-03-05', 34788.00, 'ACH', 'ACH-20260305-MH', 'Payment received from MedCore Health - INV-2026-0002', 5);

-- ---------------------------------------------------------------------------
-- 5u. FIXED ASSETS
-- ---------------------------------------------------------------------------
INSERT INTO asset_categories (company_id, code, name, default_depreciation_method, default_useful_life, is_active) VALUES
(1, 'COMP-EQ', 'Computer Equipment', 'straight_line', 3, true),
(1, 'FURN-FIX', 'Furniture and Fixtures', 'straight_line', 5, true),
(1, 'MACH-EQ', 'Machinery and Equipment', 'straight_line', 7, true),
(1, 'VEHICLES', 'Vehicles', 'straight_line', 5, true);

INSERT INTO fixed_assets (company_id, asset_code, name, category_id, description, purchase_date, purchase_cost, current_value, salvage_value, useful_life, depreciation_method, accumulated_depreciation, depreciation_per_period, location, assigned_to, supplier_id, warranty_expiry, status) VALUES
(1, 'AST-001', 'Dell PowerEdge R740 Server', 1, 'Production server for ERP and database hosting. Intel Xeon Gold, 256GB RAM, 4x 2TB SSD RAID 10.', '2025-03-15', 8450.00, 5633.33, 500.00, 3, 'straight_line', 2816.67, 220.83, 'Dallas DC - Server Room', 6, 1, '2028-03-15', 'active'),
(1, 'AST-002', 'Ford Transit 350 Cargo Van', 4, '2024 Ford Transit 350 HD, extended cargo van for local deliveries. 12,500 lb GVWR.', '2025-06-01', 32500.00, 27666.67, 4000.00, 5, 'straight_line', 4833.33, 475.00, 'Dallas DC - Fleet Parking', 9, 2, NULL, 'active'),
(1, 'AST-003', 'Toyota Forklift 8FBN25', 3, 'Toyota 8FBN25 electric forklift, 5,000 lb capacity, 189 Ah battery, 3-stage mast.', '2025-09-01', 18900.00, 17235.00, 1200.00, 7, 'straight_line', 1665.00, 210.71, 'Dallas DC - Warehouse Bay 2', 4, 3, NULL, 'active'),
(1, 'AST-004', 'Conference Room AV System', 1, 'Crestron NVX audio-visual system for main conference room. Includes 86" display, soundbar, camera, control system.', '2025-11-01', 12300.00, 10691.67, 800.00, 3, 'straight_line', 1608.33, 319.44, 'HQ Dallas - 4th Floor Conference', 6, 2, '2028-11-01', 'active'),
(1, 'AST-005', 'Xerox VersaLink C8000 Copier', 2, 'Production color multifunction printer for office. 80 ppm, finishing, scan to email/network.', '2024-08-01', 5600.00, 3266.67, 400.00, 5, 'straight_line', 2333.33, 86.67, 'HQ Dallas - 3rd Floor Print Room', 7, 5, NULL, 'active');

INSERT INTO asset_depreciation (company_id, asset_id, period_date, amount, running_balance) VALUES
(1, 1, '2026-01-31', 220.83, 2816.67),
(1, 2, '2026-01-31', 475.00, 4833.33),
(1, 3, '2026-01-31', 210.71, 1665.00),
(1, 4, '2026-01-31', 319.44, 1608.33),
(1, 5, '2026-01-31', 86.67, 2333.33),
(1, 1, '2026-02-28', 220.83, 3037.50),
(1, 2, '2026-02-28', 475.00, 5308.33),
(1, 3, '2026-02-28', 210.71, 1875.71),
(1, 4, '2026-02-28', 319.44, 1927.77),
(1, 5, '2026-02-28', 86.67, 2420.00);

-- ---------------------------------------------------------------------------
-- 5v. BANK ACCOUNTS
-- ---------------------------------------------------------------------------
INSERT INTO bank_accounts (company_id, account_id, bank_name, account_number, account_name, opening_balance, as_of_date, is_active) VALUES
(1, 2, 'JPMorgan Chase Bank', '****1234', 'TechNova Solutions Business Checking', 245000.00, '2026-01-01', true),
(1, 3, 'Bank of America', '****5678', 'TechNova Solutions Business Savings', 520000.00, '2026-01-01', true);

-- ---------------------------------------------------------------------------
-- 5w. EXPENSE CATEGORIES
-- ---------------------------------------------------------------------------
INSERT INTO expense_categories (company_id, name, description, is_active) VALUES
(1, 'Office Rent', 'Monthly office and warehouse rent payments', true),
(1, 'Utilities', 'Electricity, water, internet, and phone services', true),
(1, 'Software Subscriptions', 'SaaS and software licensing fees', true),
(1, 'Travel', 'Employee business travel expenses', true),
(1, 'Meals and Entertainment', 'Client meetings and team building', true),
(1, 'Office Supplies', 'Stationery, printer supplies, pantry items', true),
(1, 'Maintenance', 'Equipment and facility maintenance', true);

-- ---------------------------------------------------------------------------
-- 5x. CRM LEAD SOURCES & STATUSES
-- ---------------------------------------------------------------------------
INSERT INTO lead_sources (company_id, name) VALUES
(1, 'Website'), (1, 'Referral'), (1, 'Phone Inquiry'),
(1, 'Email Campaign'), (1, 'Social Media'), (1, 'Walk-in'),
(1, 'Trade Show'), (1, 'Partner Network');

INSERT INTO lead_statuses (company_id, name, sort_order, color) VALUES
(1, 'New', 1, '#3b82f6'),
(1, 'Contacted', 2, '#8b5cf6'),
(1, 'Qualified', 3, '#f59e0b'),
(1, 'Proposal', 4, '#ec4899'),
(1, 'Negotiation', 5, '#f97316'),
(1, 'Won', 6, '#10b981'),
(1, 'Lost', 7, '#ef4444');

-- ---------------------------------------------------------------------------
-- 5y. PROJECT (1 sample project)
-- ---------------------------------------------------------------------------
INSERT INTO projects (company_id, project_code, name, description, customer_id, start_date, end_date, budget_amount, status, priority, project_manager, notes, created_by) VALUES
(1, 'PRJ-2026-001', 'Quantum Financial IT Infrastructure Upgrade', 'Complete IT infrastructure refresh for Quantum Financial Group. Includes 50 laptop rollouts, network switch replacement, and server virtualization migration.', 1, '2026-01-10', '2026-04-30', 125000.00, 'in_progress', 'high', 6, 'Phased rollout: Phase 1 (Jan) - laptops, Phase 2 (Feb) - networking, Phase 3 (Mar-Apr) - servers and migration', 6);

INSERT INTO project_tasks (company_id, project_id, parent_task_id, name, description, assigned_to, start_date, due_date, estimated_hours, status, sort_order, created_by) VALUES
(1, 1, NULL, 'Site Assessment', 'Assess current IT infrastructure at Quantum Financial HQ', 6, '2026-01-10', '2026-01-14', 16, 'completed', 1, 6),
(1, 1, NULL, 'Laptop Deployment', 'Provision and deploy 50 Dell Latitude laptops with SOE image', 6, '2026-01-15', '2026-02-15', 120, 'completed', 2, 6),
(1, 1, NULL, 'Network Switch Upgrade', 'Replace existing switches with 10x Cisco Catalyst 9200', 6, '2026-02-03', '2026-03-01', 80, 'in_progress', 3, 6),
(1, 1, NULL, 'Server Virtualization', 'Migrate physical servers to virtualized environment', 6, '2026-03-01', '2026-04-30', 160, 'pending', 4, 6),
(1, 1, NULL, 'User Training', 'End-user training on new hardware and software', 7, '2026-04-01', '2026-04-15', 32, 'pending', 5, 6);

INSERT INTO project_members (company_id, project_id, user_id, role, hourly_rate) VALUES
(1, 1, 6, 'Project Manager', 75.00),
(1, 1, 4, 'Logistics Coordinator', 45.00),
(1, 1, 9, 'Warehouse Support', 35.00),
(1, 1, 3, 'Sales Representative', 55.00);

-- ---------------------------------------------------------------------------
-- 5z. STOCK TRANSFER (inter-warehouse)
-- ---------------------------------------------------------------------------
INSERT INTO stock_transfers (company_id, transfer_number, from_warehouse_id, to_warehouse_id, transfer_date, status, notes, created_by, approved_by, approved_at, received_by, received_at) VALUES
(1, 'ST-2026-0001', 1, 3, '2026-02-20', 'completed', 'Emergency stock transfer - 10 Dell monitors to Atlanta for BrightPath order preparation', 9, 2, '2026-02-20 10:30:00', 4, '2026-02-22 14:15:00'),
(1, 'ST-2026-0002', 1, 2, '2026-03-01', 'draft', 'Pre-position 8 HP laptops for Chicago area sales demo', 9, NULL, NULL, NULL, NULL);

INSERT INTO stock_transfer_items (stock_transfer_id, product_id, quantity, unit_cost) VALUES
(1, 4, 10, 153.00),
(2, 2, 8, 769.00);

-- Update product_warehouse_stock for completed transfer
UPDATE product_warehouse_stock SET quantity = quantity - 10 WHERE product_id = 4 AND warehouse_id = 1;
UPDATE product_warehouse_stock SET quantity = quantity + 10 WHERE product_id = 4 AND warehouse_id = 3;

-- ============================================================================
-- STEP 6: UPDATE products.current_stock to match product_warehouse_stock totals
-- ============================================================================
UPDATE products p
SET current_stock = COALESCE((
    SELECT SUM(quantity) FROM product_warehouse_stock WHERE product_id = p.id
), 0),
    updated_at = NOW();

-- ============================================================================
-- STEP 7: UPDATE invoice amount_paid and audit trail
-- ============================================================================
UPDATE invoices SET amount_paid = 9110.40, updated_at = NOW() WHERE id = 1;
UPDATE invoices SET amount_paid = 34788.00, updated_at = NOW() WHERE id = 2;

-- ============================================================================
-- STEP 8: ROW COUNTS PER TABLE
-- ============================================================================
SELECT 'companies' AS table_name, COUNT(*) AS row_count FROM companies
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'employees', COUNT(*) FROM employees
UNION ALL
SELECT 'leave_types', COUNT(*) FROM leave_types
UNION ALL
SELECT 'return_reasons', COUNT(*) FROM return_reasons
UNION ALL
SELECT 'tax_rates', COUNT(*) FROM tax_rates
UNION ALL
SELECT 'warehouses', COUNT(*) FROM warehouses
UNION ALL
SELECT 'warehouse_bins', COUNT(*) FROM warehouse_bins
UNION ALL
SELECT 'product_warehouse_stock', COUNT(*) FROM product_warehouse_stock
UNION ALL
SELECT 'sales_orders', COUNT(*) FROM sales_orders
UNION ALL
SELECT 'sales_order_items', COUNT(*) FROM sales_order_items
UNION ALL
SELECT 'purchase_orders', COUNT(*) FROM purchase_orders
UNION ALL
SELECT 'purchase_order_items', COUNT(*) FROM purchase_order_items
UNION ALL
SELECT 'inventory_transactions', COUNT(*) FROM inventory_transactions
UNION ALL
SELECT 'chart_of_accounts', COUNT(*) FROM chart_of_accounts
UNION ALL
SELECT 'cost_centers', COUNT(*) FROM cost_centers
UNION ALL
SELECT 'journal_entries', COUNT(*) FROM journal_entries
UNION ALL
SELECT 'journal_entry_lines', COUNT(*) FROM journal_entry_lines
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'invoice_items', COUNT(*) FROM invoice_items
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'asset_categories', COUNT(*) FROM asset_categories
UNION ALL
SELECT 'fixed_assets', COUNT(*) FROM fixed_assets
UNION ALL
SELECT 'asset_depreciation', COUNT(*) FROM asset_depreciation
UNION ALL
SELECT 'bank_accounts', COUNT(*) FROM bank_accounts
UNION ALL
SELECT 'expense_categories', COUNT(*) FROM expense_categories
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'project_tasks', COUNT(*) FROM project_tasks
UNION ALL
SELECT 'project_members', COUNT(*) FROM project_members
UNION ALL
SELECT 'stock_transfers', COUNT(*) FROM stock_transfers
UNION ALL
SELECT 'stock_transfer_items', COUNT(*) FROM stock_transfer_items
UNION ALL
SELECT 'lead_sources', COUNT(*) FROM lead_sources
UNION ALL
SELECT 'lead_statuses', COUNT(*) FROM lead_statuses
ORDER BY table_name;

COMMIT;
