-- ============================================================================
-- ERP DEMO DATA: RESET & POPULATE
-- ============================================================================
-- Resets all transactional and master data (except users/auth tables)
-- and inserts realistic demo data for a functioning ERP system.
--
-- Usage: psql -U postgres -d postgres -f erp_reset_and_populate.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- SECTION 0: DISABLE TRIGGERS TEMPORARILY (to avoid FK issues during delete)
-- ============================================================================
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'approval_logs','approval_requests','approval_steps','approval_workflows',
      'time_entries','project_members','project_tasks','projects',
      'asset_maintenance','asset_depreciation','fixed_assets','asset_categories',
      'payments','invoice_items','invoices',
      'credit_notes','purchase_return_items','purchase_returns',
      'sales_return_items','sales_returns','return_reasons',
      'service_invoice_items','service_invoices','services',
      'quotation_items','quotations',
      'reconciliation_reports','bank_transactions','bank_accounts',
      'recurring_entry_lines','recurring_entries',
      'budget_items','budgets','cost_centers',
      'expenses','expense_categories',
      'journal_entry_lines','journal_entries','chart_of_accounts',
      'stock_transfer_items','stock_transfers',
      'product_warehouse_stock','warehouse_bins','warehouses',
      'inventory_transactions',
      'purchase_order_items','purchase_orders',
      'sales_order_items','sales_orders',
      'pos_transaction_items','pos_transactions','pos_cart','pos_sessions',
      'interactions','follow_ups','opportunities','leads',
      'lead_statuses','lead_sources','crm_email_templates',
      'employee_documents','leave_requests','leave_types','attendance','employees',
      'email_templates','audit_logs',
      'suppliers','customers','products','tax_rates','services'
    ])
  LOOP
    EXECUTE 'ALTER TABLE ' || tbl || ' DISABLE TRIGGER ALL;';
  END LOOP;
END $$;

-- ============================================================================
-- SECTION 1: DELETE ALL EXISTING DATA (safe order: children before parents)
-- ============================================================================

-- Approval Workflow
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

-- Services
DELETE FROM service_invoice_items;
DELETE FROM service_invoices;
DELETE FROM services;

-- Quotations
DELETE FROM quotation_items;
DELETE FROM quotations;

-- Accounting Enhancements
DELETE FROM reconciliation_reports;
DELETE FROM bank_transactions;
DELETE FROM bank_accounts;
DELETE FROM recurring_entry_lines;
DELETE FROM recurring_entries;
DELETE FROM budget_items;
DELETE FROM budgets;
DELETE FROM cost_centers;

-- Expenses
DELETE FROM expenses;
DELETE FROM expense_categories;

-- Journal Entries
DELETE FROM journal_entry_lines;
DELETE FROM journal_entries;

-- Chart of Accounts (self-referencing, so we delete from leaves upward)
DELETE FROM chart_of_accounts;

-- Stock Transfers
DELETE FROM stock_transfer_items;
DELETE FROM stock_transfers;

-- Warehouse
DELETE FROM product_warehouse_stock;
DELETE FROM warehouse_bins;
DELETE FROM warehouses;

-- Inventory
DELETE FROM inventory_transactions;

-- Purchasing
DELETE FROM purchase_order_items;
DELETE FROM purchase_orders;

-- Sales
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
DELETE FROM crm_email_templates;

-- HR
DELETE FROM employee_documents;
DELETE FROM leave_requests;
DELETE FROM leave_types;
DELETE FROM attendance;
DELETE FROM employees;

-- Settings
DELETE FROM email_templates;
DELETE FROM audit_logs;

-- Master Data
DELETE FROM suppliers;
DELETE FROM customers;
DELETE FROM products;
DELETE FROM tax_rates;

-- NOTE: companies and users tables are NOT touched (auth-related or referenced by auth)

-- ============================================================================
-- SECTION 2: RE-ENABLE TRIGGERS
-- ============================================================================
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'approval_logs','approval_requests','approval_steps','approval_workflows',
      'time_entries','project_members','project_tasks','projects',
      'asset_maintenance','asset_depreciation','fixed_assets','asset_categories',
      'payments','invoice_items','invoices',
      'credit_notes','purchase_return_items','purchase_returns',
      'sales_return_items','sales_returns','return_reasons',
      'service_invoice_items','service_invoices','services',
      'quotation_items','quotations',
      'reconciliation_reports','bank_transactions','bank_accounts',
      'recurring_entry_lines','recurring_entries',
      'budget_items','budgets','cost_centers',
      'expenses','expense_categories',
      'journal_entry_lines','journal_entries','chart_of_accounts',
      'stock_transfer_items','stock_transfers',
      'product_warehouse_stock','warehouse_bins','warehouses',
      'inventory_transactions',
      'purchase_order_items','purchase_orders',
      'sales_order_items','sales_orders',
      'pos_transaction_items','pos_transactions','pos_cart','pos_sessions',
      'interactions','follow_ups','opportunities','leads',
      'lead_statuses','lead_sources','crm_email_templates',
      'employee_documents','leave_requests','leave_types','attendance','employees',
      'email_templates','audit_logs',
      'suppliers','customers','products','tax_rates','services'
    ])
  LOOP
    EXECUTE 'ALTER TABLE ' || tbl || ' ENABLE TRIGGER ALL;';
  LOOP;
END $$;

-- ============================================================================
-- SECTION 3: ENSURE DEMO COMPANY EXISTS
-- ============================================================================
DO $$
DECLARE
  v_company_id INTEGER;
  v_user_id INTEGER;
BEGIN

-- Check if any company exists; if not, insert one
SELECT id INTO v_company_id FROM companies LIMIT 1;
IF v_company_id IS NULL THEN
  INSERT INTO companies (name, tax_id, email, phone, address, currency)
  VALUES ('Phoenix International Corp', 'US-47-8291045', 'corporate@phoenixintl.com', '+1 (800) 555-0199', '200 Renaissance Center, Suite 1500, Detroit, MI 48243, United States', 'USD')
  RETURNING id INTO v_company_id;
ELSE
  -- Use first existing company
  v_company_id := (SELECT id FROM companies ORDER BY id LIMIT 1);
END IF;

-- Check if any user exists; if not, insert one with a known password
SELECT id INTO v_user_id FROM users LIMIT 1;
IF v_user_id IS NULL THEN
  -- Note: the password_hash below is 'admin123' bcrypt hash (example only)
  INSERT INTO users (company_id, email, password_hash, name, role)
  VALUES (v_company_id, 'admin@phoenixintl.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGm6qJ4x5eXv1Qy5qXKZa', 'James Mitchell', 'admin')
  RETURNING id INTO v_user_id;
ELSE
  v_user_id := (SELECT id FROM users ORDER BY id LIMIT 1);
END IF;

-- Store IDs in a temporary table for later use
CREATE TEMP TABLE IF NOT EXISTS demo_ids (key TEXT PRIMARY KEY, val INTEGER);
DELETE FROM demo_ids;
INSERT INTO demo_ids VALUES ('company_id', v_company_id);
INSERT INTO demo_ids VALUES ('user_id', v_user_id);

END $$;

-- ============================================================================
-- SECTION 4: TAX RATES
-- ============================================================================
DO $$
DECLARE
  v_cid INTEGER;
  v_uid INTEGER;
BEGIN
  v_cid := (SELECT val FROM demo_ids WHERE key = 'company_id');
  v_uid := (SELECT val FROM demo_ids WHERE key = 'user_id');

  INSERT INTO tax_rates (company_id, name, rate, type, is_default, is_active, description, created_by) VALUES
  (v_cid, 'Standard VAT', 20.00, 'VAT', true, true, 'Standard 20% VAT rate for goods and services', v_uid),
  (v_cid, 'Reduced VAT', 5.00, 'VAT', false, true, 'Reduced 5% VAT rate for essential items', v_uid),
  (v_cid, 'Zero Rated', 0.00, 'VAT', false, true, 'Zero-rated supplies (exports, food)', v_uid),
  (v_cid, 'Sales Tax 8%', 8.00, 'Sales Tax', false, true, 'State sales tax 8%', v_uid);
END $$;

-- ============================================================================
-- SECTION 5: PRODUCTS
-- ============================================================================
DO $$
DECLARE
  v_cid INTEGER;
  v_tax_std INTEGER;
  v_tax_red INTEGER;
  v_tax_zero INTEGER;
  v_tax_sales INTEGER;
BEGIN
  v_cid := (SELECT val FROM demo_ids WHERE key = 'company_id');
  v_tax_std := (SELECT id FROM tax_rates WHERE company_id = v_cid AND name = 'Standard VAT' LIMIT 1);
  v_tax_red := (SELECT id FROM tax_rates WHERE company_id = v_cid AND name = 'Reduced VAT' LIMIT 1);
  v_tax_zero := (SELECT id FROM tax_rates WHERE company_id = v_cid AND name = 'Zero Rated' LIMIT 1);
  v_tax_sales := (SELECT id FROM tax_rates WHERE company_id = v_cid AND name = 'Sales Tax 8%' LIMIT 1);

  INSERT INTO products (company_id, sku, name, description, unit_price, cost_price, current_stock, reorder_level, tax_rate_id) VALUES
  (v_cid, 'ELEC-CBL-HDMI-01', 'HDMI Cable 2m Premium', 'High-speed HDMI 2.1 cable, 2 meters, braided nylon, 48Gbps', 19.99, 8.50, 250, 50, v_tax_std),
  (v_cid, 'ELEC-CBL-USB-C-01', 'USB-C Charging Cable 1m', 'USB-C to USB-C 100W PD charging cable, braided', 14.99, 5.75, 400, 80, v_tax_std),
  (v_cid, 'ELEC-PWR-ADAPT-01', 'Laptop Power Adapter 65W', 'Universal 65W USB-C laptop power adapter, GaN technology', 79.99, 38.00, 80, 20, v_tax_std),
  (v_cid, 'OFFC-PAPR-A4-01', 'Premium Printer Paper A4', '80gsm premium white printer paper, 500-sheet ream, 92% brightness', 8.49, 4.25, 1200, 300, v_tax_red),
  (v_cid, 'OFFC-TONR-BLK-01', 'Laser Toner Cartridge Black', 'High-yield black laser toner cartridge, 12,000 page yield', 89.99, 52.00, 45, 15, v_tax_std),
  (v_cid, 'OFFC-TONR-CYN-01', 'Laser Toner Cartridge Cyan', 'Standard-yield cyan laser toner cartridge, 6,000 page yield', 72.99, 41.00, 30, 10, v_tax_std),
  (v_cid, 'PKG-BOX-CRRG-01', 'Corrugated Box 12x12x12', 'Single-wall corrugated box, 12x12x12 inches, 32 ECT', 2.49, 0.95, 3000, 500, v_tax_zero),
  (v_cid, 'PKG-TAPE-ACRYL-01', 'Acrylic Packaging Tape 48mm', 'Clear acrylic packaging tape, 48mm x 100m, 50 micron', 5.99, 2.80, 800, 150, v_tax_zero),
  (v_cid, 'INDU-GLUV-NTRL-01', 'Industrial Nitrile Gloves L', 'Powder-free nitrile gloves, large, box of 100, 6mil thickness', 18.50, 9.75, 600, 100, v_tax_std),
  (v_cid, 'INDU-SFTY-GOGG-01', 'Safety Goggles Anti-Fog', 'Anti-fog polycarbonate safety goggles, ANSI Z87.1 certified', 12.99, 6.00, 350, 75, v_tax_std),
  (v_cid, 'OFFC-DSK-ERG-01', 'Standing Desk Converter 48"', 'Height-adjustable standing desk converter, 48x30 inch work surface', 449.99, 275.00, 15, 5, v_tax_sales),
  (v_cid, 'ELEC-WEB-CAM-4K-01', '4K Webcam with Microphone', 'Ultra HD 4K webcam with built-in noise-cancelling mic, plug-and-play', 129.99, 68.00, 55, 15, v_tax_std),
  (v_cid, 'OFFC-CHR-ERG-01', 'Ergonomic Office Chair', 'Mesh back ergonomic chair with lumbar support, adjustable armrests', 599.99, 340.00, 20, 5, v_tax_sales),
  (v_cid, 'PKG-BUBB-WRP-01', 'Bubble Wrap Roll 12"', 'Small bubble wrap roll, 12 inches x 175 feet, 3/16 inch bubbles', 22.99, 11.50, 200, 40, v_tax_zero);
END $$;

-- ============================================================================
-- SECTION 6: SUPPLIERS
-- ============================================================================
DO $$
DECLARE
  v_cid INTEGER;
BEGIN
  v_cid := (SELECT val FROM demo_ids WHERE key = 'company_id');

  INSERT INTO suppliers (company_id, name, email, phone, address) VALUES
  (v_cid, 'GlobalSource Electronics Ltd', 'orders@globalsource-electronics.com', '+86 (21) 6888-1200', '318 Fuzhou Road, Huangpu District, Shanghai 200001, China'),
  (v_cid, 'OfficeMax Supplies Inc', 'sales@officemaxsupplies.com', '+1 (312) 555-4700', '233 S Wacker Dr, Suite 4200, Chicago, IL 60606, United States'),
  (v_cid, 'Pinnacle Packaging Solutions', 'info@pinnaclepackaging.com', '+1 (404) 555-8901', '1200 Peachtree St NE, Atlanta, GA 30309, United States'),
  (v_cid, 'Midwest Industrial Supply Co', 'orders@midwestindustrial.com', '+1 (313) 555-6700', '1501 Woodward Ave, Detroit, MI 48226, United States'),
  (v_cid, 'TechVision Components GmbH', 'vertrieb@techvision-components.de', '+49 (89) 2345-6789', 'Mies-van-der-Rohe-Straße 10, 80807 München, Germany');
END $$;

-- ============================================================================
-- SECTION 7: CUSTOMERS
-- ============================================================================
DO $$
DECLARE
  v_cid INTEGER;
BEGIN
  v_cid := (SELECT val FROM demo_ids WHERE key = 'company_id');

  INSERT INTO customers (company_id, name, email, phone, billing_address, shipping_address) VALUES
  (v_cid, 'Apex Retail Group LLC', 'ap@apexretailgroup.com', '+1 (212) 555-3400', '350 Fifth Ave, Floor 20, New York, NY 10118, United States', '350 Fifth Ave, Floor 20, New York, NY 10118, United States'),
  (v_cid, 'Meridian Hospital Systems Inc', 'procurement@meridianhosp.com', '+1 (617) 555-2100', '55 Fruit St, Boston, MA 02114, United States', '55 Fruit St, Boston, MA 02114, United States'),
  (v_cid, 'Summit Manufacturing Co', 'purchasing@summitmfg.com', '+1 (313) 555-8800', '500 Renaissance Center, Detroit, MI 48243, United States', '1200 Industrial Blvd, Toledo, OH 43612, United States'),
  (v_cid, 'Redwood University', 'finance@redwood.edu', '+1 (510) 555-4500', '1 Main St, Redwood City, CA 94063, United States', '1 Main St, Redwood City, CA 94063, United States'),
  (v_cid, 'Pioneer Technology Solutions', 'orders@pioneertech.io', '+1 (408) 555-7200', '440 N Wolfe Rd, Sunnyvale, CA 94085, United States', '440 N Wolfe Rd, Sunnyvale, CA 94085, United States'),
  (v_cid, 'Brightpath Childcare Centers Inc', 'admin@brightpathchildcare.com', '+1 (303) 555-6100', '1600 Broadway, Suite 200, Denver, CO 80202, United States', '1600 Broadway, Suite 200, Denver, CO 80202, United States');
END $$;

-- ============================================================================
-- SECTION 8: WAREHOUSES
-- ============================================================================
DO $$
DECLARE
  v_cid INTEGER;
  v_uid INTEGER;
BEGIN
  v_cid := (SELECT val FROM demo_ids WHERE key = 'company_id');
  v_uid := (SELECT val FROM demo_ids WHERE key = 'user_id');

  INSERT INTO warehouses (company_id, code, name, address, city, state, country, postal_code, phone, email, manager_id, is_active, is_default) VALUES
  (v_cid, 'WH-DET', 'Detroit Main Warehouse', '200 Renaissance Center, Suite 100', 'Detroit', 'MI', 'USA', '48243', '+1 (313) 555-0100', 'warehouse-detroit@phoenixintl.com', v_uid, true, true),
  (v_cid, 'WH-CHI', 'Chicago Distribution Center', '233 S Wacker Dr, Lower Level', 'Chicago', 'IL', 'USA', '60606', '+1 (312) 555-0200', 'warehouse-chicago@phoenixintl.com', v_uid, true, false),
  (v_cid, 'WH-ATL', 'Atlanta Regional Hub', '1200 Peachtree St NE, Warehouse B', 'Atlanta', 'GA', 'USA', '30309', '+1 (404) 555-0300', 'warehouse-atlanta@phoenixintl.com', v_uid, true, false);
END $$;

-- ============================================================================
-- SECTION 9: WAREHOUSE BINS
-- ============================================================================
DO $$
DECLARE
  v_cid INTEGER;
  v_wh_det INTEGER;
  v_wh_chi INTEGER;
  v_wh_atl INTEGER;
BEGIN
  v_cid := (SELECT val FROM demo_ids WHERE key = 'company_id');
  v_wh_det := (SELECT id FROM warehouses WHERE code = 'WH-DET' LIMIT 1);
  v_wh_chi := (SELECT id FROM warehouses WHERE code = 'WH-CHI' LIMIT 1);
  v_wh_atl := (SELECT id FROM warehouses WHERE code = 'WH-ATL' LIMIT 1);

  INSERT INTO warehouse_bins (company_id, warehouse_id, code, name, zone, aisle, rack, shelf, max_capacity, is_active) VALUES
  (v_cid, v_wh_det, 'DET-A-01-01', 'Electronics Aisle 1', 'Electronics', 'A', '01', '01', 500, true),
  (v_cid, v_wh_det, 'DET-A-01-02', 'Electronics Aisle 1 Lower', 'Electronics', 'A', '01', '02', 500, true),
  (v_cid, v_wh_det, 'DET-B-01-01', 'Office Supplies B1', 'Office', 'B', '01', '01', 1000, true),
  (v_cid, v_wh_det, 'DET-C-01-01', 'Packaging Zone C1', 'Packaging', 'C', '01', '01', 2000, true),
  (v_cid, v_wh_det, 'DET-D-01-01', 'Industrial Products D1', 'Industrial', 'D', '01', '01', 800, true),
  (v_cid, v_wh_det, 'DET-D-01-02', 'Industrial Products D2', 'Industrial', 'D', '01', '02', 800, true),
  (v_cid, v_wh_chi, 'CHI-A-01-01', 'Main Storage A1', 'General', 'A', '01', '01', 1500, true),
  (v_cid, v_wh_chi, 'CHI-A-01-02', 'Bulk Storage A2', 'General', 'A', '01', '02', 2000, true),
  (v_cid, v_wh_atl, 'ATL-A-01-01', 'South Zone A1', 'General', 'A', '01', '01', 1200, true);
END $$;

-- ============================================================================
-- SECTION 10: PRODUCT WAREHOUSE STOCK
-- ============================================================================
DO $$
DECLARE
  v_cid INTEGER;
  v_wh_det INTEGER;
  v_wh_chi INTEGER;
  v_wh_atl INTEGER;
BEGIN
  v_cid := (SELECT val FROM demo_ids WHERE key = 'company_id');
  v_wh_det := (SELECT id FROM warehouses WHERE code = 'WH-DET' LIMIT 1);
  v_wh_chi := (SELECT id FROM warehouses WHERE code = 'WH-CHI' LIMIT 1);
  v_wh_atl := (SELECT id FROM warehouses WHERE code = 'WH-ATL' LIMIT 1);

  INSERT INTO product_warehouse_stock (company_id, product_id, warehouse_id, quantity, reserved_quantity, reorder_level) VALUES
  (v_cid, (SELECT id FROM products WHERE sku = 'ELEC-CBL-HDMI-01' LIMIT 1), v_wh_det, 150, 20, 50),
  (v_cid, (SELECT id FROM products WHERE sku = 'ELEC-CBL-HDMI-01' LIMIT 1), v_wh_chi, 100, 10, 50),
  (v_cid, (SELECT id FROM products WHERE sku = 'ELEC-CBL-USB-C-01' LIMIT 1), v_wh_det, 250, 30, 80),
  (v_cid, (SELECT id FROM products WHERE sku = 'ELEC-PWR-ADAPT-01' LIMIT 1), v_wh_det, 50, 5, 20),
  (v_cid, (SELECT id FROM products WHERE sku = 'OFFC-PAPR-A4-01' LIMIT 1), v_wh_det, 800, 100, 300),
  (v_cid, (SELECT id FROM products WHERE sku = 'OFFC-PAPR-A4-01' LIMIT 1), v_wh_chi, 400, 50, 300),
  (v_cid, (SELECT id FROM products WHERE sku = 'OFFC-TONR-BLK-01' LIMIT 1), v_wh_det, 30, 5, 15),
  (v_cid, (SELECT id FROM products WHERE sku = 'OFFC-TONR-CYN-01' LIMIT 1), v_wh_det, 20, 3, 10),
  (v_cid, (SELECT id FROM products WHERE sku = 'PKG-BOX-CRRG-01' LIMIT 1), v_wh_det, 2000, 200, 500),
  (v_cid, (SELECT id FROM products WHERE sku = 'PKG-BOX-CRRG-01' LIMIT 1), v_wh_atl, 1000, 100, 500),
  (v_cid, (SELECT id FROM products WHERE sku = 'PKG-TAPE-ACRYL-01' LIMIT 1), v_wh_det, 500, 60, 150),
  (v_cid, (SELECT id FROM products WHERE sku = 'INDU-GLUV-NTRL-01' LIMIT 1), v_wh_det, 400, 50, 100),
  (v_cid, (SELECT id FROM products WHERE sku = 'INDU-GLUV-NTRL-01' LIMIT 1), v_wh_chi, 200, 25, 100),
  (v_cid, (SELECT id FROM products WHERE sku = 'INDU-SFTY-GOGG-01' LIMIT 1), v_wh_det, 250, 30, 75),
  (v_cid, (SELECT id FROM products WHERE sku = 'OFFC-DSK-ERG-01' LIMIT 1), v_wh_det, 10, 2, 5),
  (v_cid, (SELECT id FROM products WHERE sku = 'ELEC-WEB-CAM-4K-01' LIMIT 1), v_wh_det, 40, 8, 15),
  (v_cid, (SELECT id FROM products WHERE sku = 'OFFC-CHR-ERG-01' LIMIT 1), v_wh_det, 15, 3, 5),
  (v_cid, (SELECT id FROM products WHERE sku = 'PKG-BUBB-WRP-01' LIMIT 1), v_wh_det, 150, 20, 40);
END $$;

-- ============================================================================
-- SECTION 11: INVENTORY TRANSACTIONS
-- ============================================================================
DO $$
DECLARE
  v_cid INTEGER;
  v_wh_det INTEGER;
  v_wh_chi INTEGER;
  v_wh_atl INTEGER;
BEGIN
  v_cid := (SELECT val FROM demo_ids WHERE key = 'company_id');
  v_wh_det := (SELECT id FROM warehouses WHERE code = 'WH-DET' LIMIT 1);
  v_wh_chi := (SELECT id FROM warehouses WHERE code = 'WH-CHI' LIMIT 1);
  v_wh_atl := (SELECT id FROM warehouses WHERE code = 'WH-ATL' LIMIT 1);

  INSERT INTO inventory_transactions (product_id, warehouse_id, type, quantity, reference_type, reference_id, created_at) VALUES
  -- Initial stock receipts
  ((SELECT id FROM products WHERE sku = 'ELEC-CBL-HDMI-01'), v_wh_det, 'in', 200, 'Purchase Order', 1, '2025-12-02 09:00:00'),
  ((SELECT id FROM products WHERE sku = 'ELEC-CBL-USB-C-01'), v_wh_det, 'in', 300, 'Purchase Order', 1, '2025-12-02 09:15:00'),
  ((SELECT id FROM products WHERE sku = 'OFFC-PAPR-A4-01'), v_wh_det, 'in', 1000, 'Purchase Order', 2, '2025-12-05 10:00:00'),
  ((SELECT id FROM products WHERE sku = 'OFFC-TONR-BLK-01'), v_wh_det, 'in', 50, 'Purchase Order', 2, '2025-12-05 10:30:00'),
  -- Sales outbound
  ((SELECT id FROM products WHERE sku = 'ELEC-CBL-HDMI-01'), v_wh_det, 'out', 30, 'Sales Order', 1, '2026-01-10 14:00:00'),
  ((SELECT id FROM products WHERE sku = 'ELEC-CBL-USB-C-01'), v_wh_det, 'out', 50, 'Sales Order', 1, '2026-01-10 14:05:00'),
  ((SELECT id FROM products WHERE sku = 'ELEC-PWR-ADAPT-01'), v_wh_det, 'out', 10, 'Sales Order', 2, '2026-01-15 09:30:00'),
  ((SELECT id FROM products WHERE sku = 'OFFC-PAPR-A4-01'), v_wh_det, 'out', 200, 'Sales Order', 3, '2026-01-20 11:00:00'),
  -- Transfers between warehouses
  ((SELECT id FROM products WHERE sku = 'ELEC-CBL-HDMI-01'), v_wh_det, 'out', 50, 'Transfer', 1, '2026-01-22 08:00:00'),
  ((SELECT id FROM products WHERE sku = 'ELEC-CBL-HDMI-01'), v_wh_chi, 'in', 50, 'Transfer', 1, '2026-01-22 14:00:00'),
  -- Stock adjustment
  ((SELECT id FROM products WHERE sku = 'PKG-BOX-CRRG-01'), v_wh_det, 'adjustment', 20, 'Adjustment', NULL, '2026-02-01 07:30:00'),
  -- More purchases
  ((SELECT id FROM products WHERE sku = 'INDU-GLUV-NTRL-01'), v_wh_det, 'in', 500, 'Purchase Order', 3, '2026-02-10 09:00:00'),
  ((SELECT id FROM products WHERE sku = 'INDU-SFTY-GOGG-01'), v_wh_det, 'in', 300, 'Purchase Order', 3, '2026-02-10 09:30:00'),
  -- More sales
  ((SELECT id FROM products WHERE sku = 'OFFC-CHR-ERG-01'), v_wh_det, 'out', 5, 'Sales Order', 4, '2026-03-01 10:00:00'),
  ((SELECT id FROM products WHERE sku = 'OFFC-DSK-ERG-01'), v_wh_det, 'out', 3, 'Sales Order', 4, '2026-03-01 10:05:00'),
  ((SELECT id FROM products WHERE sku = 'ELEC-WEB-CAM-4K-01'), v_wh_det, 'out', 20, 'Sales Order', 5, '2026-03-10 15:00:00');
END $$;

-- ============================================================================
-- SECTION 12: PURCHASE ORDERS
-- ============================================================================
DO $$
DECLARE
  v_cid INTEGER;
  v_uid INTEGER;
  v_wh_det INTEGER;
  v_wh_chi INTEGER;
  v_sup_gs INTEGER;
  v_sup_om INTEGER;
  v_sup_mw INTEGER;
BEGIN
  v_cid := (SELECT val FROM demo_ids WHERE key = 'company_id');
  v_uid := (SELECT val FROM demo_ids WHERE key = 'user_id');
  v_wh_det := (SELECT id FROM warehouses WHERE code = 'WH-DET' LIMIT 1);
  v_wh_chi := (SELECT id FROM warehouses WHERE code = 'WH-CHI' LIMIT 1);
  v_sup_gs := (SELECT id FROM suppliers WHERE name = 'GlobalSource Electronics Ltd' LIMIT 1);
  v_sup_om := (SELECT id FROM suppliers WHERE name = 'OfficeMax Supplies Inc' LIMIT 1);
  v_sup_mw := (SELECT id FROM suppliers WHERE name = 'Midwest Industrial Supply Co' LIMIT 1);

  -- PO-2025-001: Electronics from GlobalSource
  INSERT INTO purchase_orders (company_id, supplier_id, warehouse_id, po_number, order_date, status, subtotal, tax_total, grand_total, notes, payment_status, created_by, created_at)
  VALUES (v_cid, v_sup_gs, v_wh_det, 'PO-2025-001', '2025-12-01', 'received', 11995.00, 2399.00, 14394.00, 'Initial stock order for electronics department', 'paid', v_uid, '2025-12-01 08:00:00');
  INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity)
  VALUES
  (currval('purchase_orders_id_seq'), (SELECT id FROM products WHERE sku = 'ELEC-CBL-HDMI-01'), 200, 8.50, 1700.00, 200),
  (currval('purchase_orders_id_seq'), (SELECT id FROM products WHERE sku = 'ELEC-CBL-USB-C-01'), 300, 5.75, 1725.00, 300),
  (currval('purchase_orders_id_seq'), (SELECT id FROM products WHERE sku = 'ELEC-PWR-ADAPT-01'), 80, 38.00, 3040.00, 80),
  (currval('purchase_orders_id_seq'), (SELECT id FROM products WHERE sku = 'ELEC-WEB-CAM-4K-01'), 60, 68.00, 4080.00, 60),
  (currval('purchase_orders_id_seq'), (SELECT id FROM products WHERE sku = 'ELEC-CBL-HDMI-01'), 100, 8.50, 850.00, 100),
  (currval('purchase_orders_id_seq'), (SELECT id FROM products WHERE sku = 'ELEC-CBL-USB-C-01'), 100, 5.75, 575.00, 100);

  -- PO-2025-002: Office supplies from OfficeMax
  INSERT INTO purchase_orders (company_id, supplier_id, warehouse_id, po_number, order_date, status, subtotal, tax_total, grand_total, notes, payment_status, created_by, created_at)
  VALUES (v_cid, v_sup_om, v_wh_det, 'PO-2025-002', '2025-12-04', 'received', 12740.00, 2214.00, 14954.00, 'Q4 office supplies replenishment', 'paid', v_uid, '2025-12-04 09:00:00');
  INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity)
  VALUES
  (currval('purchase_orders_id_seq'), (SELECT id FROM products WHERE sku = 'OFFC-PAPR-A4-01'), 1000, 4.25, 4250.00, 1000),
  (currval('purchase_orders_id_seq'), (SELECT id FROM products WHERE sku = 'OFFC-TONR-BLK-01'), 50, 52.00, 2600.00, 50),
  (currval('purchase_orders_id_seq'), (SELECT id FROM products WHERE sku = 'OFFC-TONR-CYN-01'), 40, 41.00, 1640.00, 40),
  (currval('purchase_orders_id_seq'), (SELECT id FROM products WHERE sku = 'OFFC-DSK-ERG-01'), 10, 275.00, 2750.00, 10),
  (currval('purchase_orders_id_seq'), (SELECT id FROM products WHERE sku = 'OFFC-CHR-ERG-01'), 10, 340.00, 3400.00, 10),
  (currval('purchase_orders_id_seq'), (SELECT id FROM products WHERE sku = 'OFFC-PAPR-A4-01'), 500, 4.25, 2125.00, 500);

  -- PO-2026-001: Industrial supplies from Midwest
  INSERT INTO purchase_orders (company_id, supplier_id, warehouse_id, po_number, order_date, status, subtotal, tax_total, grand_total, notes, payment_status, created_by, created_at)
  VALUES (v_cid, v_sup_mw, v_wh_det, 'PO-2026-001', '2026-02-08', 'received', 11225.00, 2245.00, 13470.00, 'Industrial PPE and safety restock', 'paid', v_uid, '2026-02-08 10:00:00');
  INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity)
  VALUES
  (currval('purchase_orders_id_seq'), (SELECT id FROM products WHERE sku = 'INDU-GLUV-NTRL-01'), 500, 9.75, 4875.00, 500),
  (currval('purchase_orders_id_seq'), (SELECT id FROM products WHERE sku = 'INDU-SFTY-GOGG-01'), 300, 6.00, 1800.00, 300),
  (currval('purchase_orders_id_seq'), (SELECT id FROM products WHERE sku = 'PKG-BOX-CRRG-01'), 1000, 0.95, 950.00, 1000),
  (currval('purchase_orders_id_seq'), (SELECT id FROM products WHERE sku = 'PKG-TAPE-ACRYL-01'), 600, 2.80, 1680.00, 600),
  (currval('purchase_orders_id_seq'), (SELECT id FROM products WHERE sku = 'PKG-BUBB-WRP-01'), 200, 11.50, 2300.00, 200);

  -- PO-2026-002: Electronics restock (pending)
  INSERT INTO purchase_orders (company_id, supplier_id, warehouse_id, po_number, order_date, status, subtotal, tax_total, grand_total, notes, payment_status, created_by, created_at)
  VALUES (v_cid, v_sup_gs, v_wh_det, 'PO-2026-002', '2026-03-20', 'sent', 6150.00, 1230.00, 7380.00, 'Electronics restock Q1 2026', 'unpaid', v_uid, '2026-03-20 11:00:00');
  INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity)
  VALUES
  (currval('purchase_orders_id_seq'), (SELECT id FROM products WHERE sku = 'ELEC-CBL-HDMI-01'), 300, 8.50, 2550.00, 0),
  (currval('purchase_orders_id_seq'), (SELECT id FROM products WHERE sku = 'ELEC-CBL-USB-C-01'), 400, 5.75, 2300.00, 0),
  (currval('purchase_orders_id_seq'), (SELECT id FROM products WHERE sku = 'ELEC-WEB-CAM-4K-01'), 40, 68.00, 2720.00, 0),
  (currval('purchase_orders_id_seq'), (SELECT id FROM products WHERE sku = 'ELEC-PWR-ADAPT-01'), 60, 38.00, 2280.00, 0);
  -- Note: item totals don't match parent total in PO4, but this is realistic (rounding, discounts). Let's fix parent:
  UPDATE purchase_orders SET subtotal = 9850.00, tax_total = 1970.00, grand_total = 11820.00 WHERE po_number = 'PO-2026-002';
END $$;

-- ============================================================================
-- SECTION 13: SALES ORDERS
-- ============================================================================
DO $$
DECLARE
  v_cid INTEGER;
  v_uid INTEGER;
  v_wh_det INTEGER;
  v_cust_apex INTEGER;
  v_cust_meridian INTEGER;
  v_cust_summit INTEGER;
  v_cust_redwood INTEGER;
  v_cust_pioneer INTEGER;
  v_cust_brightpath INTEGER;
BEGIN
  v_cid := (SELECT val FROM demo_ids WHERE key = 'company_id');
  v_uid := (SELECT val FROM demo_ids WHERE key = 'user_id');
  v_wh_det := (SELECT id FROM warehouses WHERE code = 'WH-DET' LIMIT 1);
  v_cust_apex := (SELECT id FROM customers WHERE name = 'Apex Retail Group LLC' LIMIT 1);
  v_cust_meridian := (SELECT id FROM customers WHERE name = 'Meridian Hospital Systems Inc' LIMIT 1);
  v_cust_summit := (SELECT id FROM customers WHERE name = 'Summit Manufacturing Co' LIMIT 1);
  v_cust_redwood := (SELECT id FROM customers WHERE name = 'Redwood University' LIMIT 1);
  v_cust_pioneer := (SELECT id FROM customers WHERE name = 'Pioneer Technology Solutions' LIMIT 1);
  v_cust_brightpath := (SELECT id FROM customers WHERE name = 'Brightpath Childcare Centers Inc' LIMIT 1);

  -- SO-2026-001: Apex Retail - cables and webcams
  INSERT INTO sales_orders (company_id, customer_id, warehouse_id, order_number, order_date, status, subtotal, tax_total, grand_total, notes, created_by, payment_status, created_at)
  VALUES (v_cid, v_cust_apex, v_wh_det, 'SO-2026-001', '2026-01-08', 'invoiced', 1345.50, 269.10, 1614.60, 'Q1 electronics order for retail chain', v_uid, 'paid', '2026-01-08 10:30:00');
  INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, total)
  VALUES
  (currval('sales_orders_id_seq'), (SELECT id FROM products WHERE sku = 'ELEC-CBL-HDMI-01'), 30, 19.99, 599.70),
  (currval('sales_orders_id_seq'), (SELECT id FROM products WHERE sku = 'ELEC-CBL-USB-C-01'), 50, 14.99, 749.50),
  (currval('sales_orders_id_seq'), (SELECT id FROM products WHERE sku = 'ELEC-CBL-HDMI-01'), 10, 19.99, 199.90);
  -- Fix: too many items, let me recalculate
  DELETE FROM sales_order_items WHERE sales_order_id = currval('sales_orders_id_seq') AND id > (SELECT min(id) FROM sales_order_items WHERE sales_order_id = currval('sales_orders_id_seq'));
  -- Re-insert clean items
  INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, total) VALUES
  (currval('sales_orders_id_seq'), (SELECT id FROM products WHERE sku = 'ELEC-CBL-HDMI-01'), 30, 19.99, 599.70),
  (currval('sales_orders_id_seq'), (SELECT id FROM products WHERE sku = 'ELEC-CBL-USB-C-01'), 50, 14.99, 749.50);
  UPDATE sales_orders SET subtotal = 1349.20, tax_total = 269.84, grand_total = 1619.04 WHERE order_number = 'SO-2026-001';

  -- SO-2026-002: Meridian Hospital - power adapters & webcams
  INSERT INTO sales_orders (company_id, customer_id, warehouse_id, order_number, order_date, status, subtotal, tax_total, grand_total, notes, created_by, payment_status, created_at)
  VALUES (v_cid, v_cust_meridian, v_wh_det, 'SO-2026-002', '2026-01-14', 'invoiced', 2499.70, 499.94, 2999.64, 'Hospital equipment upgrade order', v_uid, 'paid', '2026-01-14 11:00:00');
  INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, total) VALUES
  (currval('sales_orders_id_seq'), (SELECT id FROM products WHERE sku = 'ELEC-PWR-ADAPT-01'), 10, 79.99, 799.90),
  (currval('sales_orders_id_seq'), (SELECT id FROM products WHERE sku = 'ELEC-WEB-CAM-4K-01'), 15, 129.99, 1949.85),
  (currval('sales_orders_id_seq'), (SELECT id FROM products WHERE sku = 'ELEC-CBL-HDMI-01'), 20, 19.99, 399.80);
  UPDATE sales_orders SET subtotal = 3149.55, tax_total = 629.91, grand_total = 3779.46 WHERE order_number = 'SO-2026-002';

  -- SO-2026-003: Redwood University - paper & toner
  INSERT INTO sales_orders (company_id, customer_id, warehouse_id, order_number, order_date, status, subtotal, tax_total, grand_total, notes, created_by, payment_status, created_at)
  VALUES (v_cid, v_cust_redwood, v_wh_det, 'SO-2026-003', '2026-01-18', 'invoiced', 2200.50, 110.03, 2310.53, 'Campus-wide office supplies for spring semester', v_uid, 'paid', '2026-01-18 09:15:00');
  INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, total) VALUES
  (currval('sales_orders_id_seq'), (SELECT id FROM products WHERE sku = 'OFFC-PAPR-A4-01'), 200, 8.49, 1698.00),
  (currval('sales_orders_id_seq'), (SELECT id FROM products WHERE sku = 'OFFC-TONR-BLK-01'), 5, 89.99, 449.95),
  (currval('sales_orders_id_seq'), (SELECT id FROM products WHERE sku = 'OFFC-TONR-CYN-01'), 3, 72.99, 218.97);
  UPDATE sales_orders SET subtotal = 2366.92, tax_total = 118.35, grand_total = 2485.27 WHERE order_number = 'SO-2026-003';

  -- SO-2026-004: Summit Manufacturing - office furniture
  INSERT INTO sales_orders (company_id, customer_id, warehouse_id, order_number, order_date, status, subtotal, tax_total, grand_total, notes, created_by, payment_status, created_at)
  VALUES (v_cid, v_cust_summit, v_wh_det, 'SO-2026-004', '2026-02-25', 'shipped', 4799.95, 383.99, 5183.94, 'Office renovation - new furniture for admin floor', v_uid, 'unpaid', '2026-02-25 14:00:00');
  INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, total) VALUES
  (currval('sales_orders_id_seq'), (SELECT id FROM products WHERE sku = 'OFFC-CHR-ERG-01'), 5, 599.99, 2999.95),
  (currval('sales_orders_id_seq'), (SELECT id FROM products WHERE sku = 'OFFC-DSK-ERG-01'), 4, 449.99, 1799.96),
  (currval('sales_orders_id_seq'), (SELECT id FROM products WHERE sku = 'OFFC-PAPR-A4-01'), 50, 8.49, 424.50);
  UPDATE sales_orders SET subtotal = 5224.41, tax_total = 417.95, grand_total = 5642.36 WHERE order_number = 'SO-2026-004';

  -- SO-2026-005: Pioneer Tech - webcams & cables
  INSERT INTO sales_orders (company_id, customer_id, warehouse_id, order_number, order_date, status, subtotal, tax_total, grand_total, notes, created_by, payment_status, created_at)
  VALUES (v_cid, v_cust_pioneer, v_wh_det, 'SO-2026-005', '2026-03-08', 'confirmed', 4798.50, 959.70, 5758.20, 'Remote workforce equipment order', v_uid, 'unpaid', '2026-03-08 10:30:00');
  INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, total) VALUES
  (currval('sales_orders_id_seq'), (SELECT id FROM products WHERE sku = 'ELEC-WEB-CAM-4K-01'), 20, 129.99, 2599.80),
  (currval('sales_orders_id_seq'), (SELECT id FROM products WHERE sku = 'ELEC-CBL-HDMI-01'), 50, 19.99, 999.50),
  (currval('sales_orders_id_seq'), (SELECT id FROM products WHERE sku = 'ELEC-CBL-USB-C-01'), 80, 14.99, 1199.20);
  UPDATE sales_orders SET subtotal = 4798.50, tax_total = 959.70, grand_total = 5758.20 WHERE order_number = 'SO-2026-005';
END $$;

-- ============================================================================
-- SECTION 14: INVOICES
-- ============================================================================
DO $$
DECLARE
  v_cid INTEGER;
  v_uid INTEGER;
BEGIN
  v_cid := (SELECT val FROM demo_ids WHERE key = 'company_id');
  v_uid := (SELECT val FROM demo_ids WHERE key = 'user_id');

  -- INV-2026-001 -> SO-2026-001 (Apex Retail)
  INSERT INTO invoices (company_id, invoice_number, sales_order_id, customer_id, invoice_date, due_date, status, subtotal, tax_total, grand_total, amount_paid, payment_terms, created_by, created_at)
  SELECT v_cid, 'INV-2026-001', id, customer_id, '2026-01-10', '2026-02-09', 'paid', subtotal, tax_total, grand_total, grand_total, 'Net 30', v_uid, '2026-01-10 12:00:00'
  FROM sales_orders WHERE order_number = 'SO-2026-001';
  INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, total)
  SELECT currval('invoices_id_seq'), p.id, p.name, soi.quantity, soi.unit_price, soi.total
  FROM sales_order_items soi JOIN products p ON p.id = soi.product_id
  WHERE soi.sales_order_id = (SELECT id FROM sales_orders WHERE order_number = 'SO-2026-001');

  -- INV-2026-002 -> SO-2026-002 (Meridian Hospital)
  INSERT INTO invoices (company_id, invoice_number, sales_order_id, customer_id, invoice_date, due_date, status, subtotal, tax_total, grand_total, amount_paid, payment_terms, created_by, created_at)
  SELECT v_cid, 'INV-2026-002', id, customer_id, '2026-01-16', '2026-02-15', 'paid', subtotal, tax_total, grand_total, grand_total, 'Net 30', v_uid, '2026-01-16 12:00:00'
  FROM sales_orders WHERE order_number = 'SO-2026-002';
  INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, total)
  SELECT currval('invoices_id_seq'), p.id, p.name, soi.quantity, soi.unit_price, soi.total
  FROM sales_order_items soi JOIN products p ON p.id = soi.product_id
  WHERE soi.sales_order_id = (SELECT id FROM sales_orders WHERE order_number = 'SO-2026-002');

  -- INV-2026-003 -> SO-2026-003 (Redwood University)
  INSERT INTO invoices (company_id, invoice_number, sales_order_id, customer_id, invoice_date, due_date, status, subtotal, tax_total, grand_total, amount_paid, payment_terms, created_by, created_at)
  SELECT v_cid, 'INV-2026-003', id, customer_id, '2026-01-20', '2026-02-19', 'paid', subtotal, tax_total, grand_total, grand_total, 'Net 30', v_uid, '2026-01-20 12:00:00'
  FROM sales_orders WHERE order_number = 'SO-2026-003';
  INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, total)
  SELECT currval('invoices_id_seq'), p.id, p.name, soi.quantity, soi.unit_price, soi.total
  FROM sales_order_items soi JOIN products p ON p.id = soi.product_id
  WHERE soi.sales_order_id = (SELECT id FROM sales_orders WHERE order_number = 'SO-2026-003');

  -- INV-2026-004 -> SO-2026-004 (Summit Manufacturing)
  INSERT INTO invoices (company_id, invoice_number, sales_order_id, customer_id, invoice_date, due_date, status, subtotal, tax_total, grand_total, amount_paid, payment_terms, created_by, created_at)
  SELECT v_cid, 'INV-2026-004', id, customer_id, '2026-02-27', '2026-03-29', 'sent', subtotal, tax_total, grand_total, 0, 'Net 30', v_uid, '2026-02-27 12:00:00'
  FROM sales_orders WHERE order_number = 'SO-2026-004';
  INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, total)
  SELECT currval('invoices_id_seq'), p.id, p.name, soi.quantity, soi.unit_price, soi.total
  FROM sales_order_items soi JOIN products p ON p.id = soi.product_id
  WHERE soi.sales_order_id = (SELECT id FROM sales_orders WHERE order_number = 'SO-2026-004');

  -- INV-2026-005 -> SO-2026-005 (Pioneer Tech)
  INSERT INTO invoices (company_id, invoice_number, sales_order_id, customer_id, invoice_date, due_date, status, subtotal, tax_total, grand_total, amount_paid, payment_terms, created_by, created_at)
  SELECT v_cid, 'INV-2026-005', id, customer_id, '2026-03-10', '2026-04-09', 'draft', subtotal, tax_total, grand_total, 0, 'Net 30', v_uid, '2026-03-10 12:00:00'
  FROM sales_orders WHERE order_number = 'SO-2026-005';
  INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, total)
  SELECT currval('invoices_id_seq'), p.id, p.name, soi.quantity, soi.unit_price, soi.total
  FROM sales_order_items soi JOIN products p ON p.id = soi.product_id
  WHERE soi.sales_order_id = (SELECT id FROM sales_orders WHERE order_number = 'SO-2026-005');
END $$;

-- ============================================================================
-- SECTION 15: PAYMENTS
-- ============================================================================
DO $$
DECLARE
  v_cid INTEGER;
  v_uid INTEGER;
BEGIN
  v_cid := (SELECT val FROM demo_ids WHERE key = 'company_id');
  v_uid := (SELECT val FROM demo_ids WHERE key = 'user_id');

  -- Payment for INV-2026-001 (Apex Retail)
  INSERT INTO payments (company_id, invoice_id, payment_number, payment_date, amount, payment_method, reference_number, notes, created_by)
  SELECT v_cid, id, 'PAY-2026-001', '2026-01-28', grand_total, 'Wire Transfer', 'WIRE-2026-00123', 'Payment for INV-2026-001', v_uid
  FROM invoices WHERE invoice_number = 'INV-2026-001';

  -- Payment for INV-2026-002 (Meridian Hospital)
  INSERT INTO payments (company_id, invoice_id, payment_number, payment_date, amount, payment_method, reference_number, notes, created_by)
  SELECT v_cid, id, 'PAY-2026-002', '2026-02-05', grand_total, 'Check', 'CK-104729', 'Check received - thank you', v_uid
  FROM invoices WHERE invoice_number = 'INV-2026-002';

  -- Payment for INV-2026-003 (Redwood University)
  INSERT INTO payments (company_id, invoice_id, payment_number, payment_date, amount, payment_method, reference_number, notes, created_by)
  SELECT v_cid, id, 'PAY-2026-003', '2026-02-14', grand_total, 'Credit Card', 'CC-8842-9921', 'Online payment via portal', v_uid
  FROM invoices WHERE invoice_number = 'INV-2026-003';
END $$;

-- ============================================================================
-- SECTION 16: CHART OF ACCOUNTS
-- ============================================================================
DO $$
DECLARE
  v_cid INTEGER;
  v_asset_parent INTEGER;
  v_liability_parent INTEGER;
  v_equity_parent INTEGER;
  v_revenue_parent INTEGER;
  v_expense_parent INTEGER;
BEGIN
  v_cid := (SELECT val FROM demo_ids WHERE key = 'company_id');

  -- Account types: asset, liability, equity, revenue, expense

  -- ========== ASSETS (1xxx) ==========
  INSERT INTO chart_of_accounts (company_id, account_code, account_name, account_type, description, is_active) VALUES
  (v_cid, '1000', 'Current Assets', 'asset', 'Current asset accounts', true),
  (v_cid, '1100', 'Cash & Cash Equivalents', 'asset', 'Cash on hand and in bank accounts', true),
  (v_cid, '1101', 'Operating Account - Chase', 'asset', 'Main business checking account', true),
  (v_cid, '1102', 'Money Market Account', 'asset', 'Interest-bearing money market account', true),
  (v_cid, '1200', 'Accounts Receivable', 'asset', 'Trade receivables from customers', true),
  (v_cid, '1300', 'Inventory', 'asset', 'Inventory on hand', true),
  (v_cid, '1400', 'Prepaid Expenses', 'asset', 'Prepaid insurance, rent, etc.', true),
  (v_cid, '1500', 'Fixed Assets', 'asset', 'Property, plant, and equipment', true),
  (v_cid, '1501', 'Accumulated Depreciation', 'asset', 'Contra-asset for accumulated depreciation', true);

  -- ========== LIABILITIES (2xxx) ==========
  INSERT INTO chart_of_accounts (company_id, account_code, account_name, account_type, description, is_active) VALUES
  (v_cid, '2000', 'Current Liabilities', 'liability', 'Short-term liabilities', true),
  (v_cid, '2100', 'Accounts Payable', 'liability', 'Trade payables to suppliers', true),
  (v_cid, '2200', 'Sales Tax Payable', 'liability', 'Sales tax collected from customers', true),
  (v_cid, '2300', 'VAT Payable', 'liability', 'VAT payable to tax authorities', true),
  (v_cid, '2400', 'Accrued Expenses', 'liability', 'Accrued salaries, utilities, etc.', true),
  (v_cid, '2500', 'Long-term Liabilities', 'liability', 'Long-term debt obligations', true);

  -- ========== EQUITY (3xxx) ==========
  INSERT INTO chart_of_accounts (company_id, account_code, account_name, account_type, description, is_active) VALUES
  (v_cid, '3000', 'Equity', 'equity', 'Shareholder equity accounts', true),
  (v_cid, '3100', 'Common Stock', 'equity', 'Common shares issued', true),
  (v_cid, '3200', 'Retained Earnings', 'equity', 'Accumulated retained earnings', true),
  (v_cid, '3300', 'Current Year Earnings', 'equity', 'Current fiscal year profit/loss', true);

  -- ========== REVENUE (4xxx) ==========
  INSERT INTO chart_of_accounts (company_id, account_code, account_name, account_type, description, is_active) VALUES
  (v_cid, '4000', 'Revenue', 'revenue', 'Operating revenue accounts', true),
  (v_cid, '4100', 'Product Sales Revenue', 'revenue', 'Revenue from product sales', true),
  (v_cid, '4200', 'Service Revenue', 'revenue', 'Revenue from services', true),
  (v_cid, '4300', 'Sales Discounts', 'revenue', 'Sales discounts and allowances', true);

  -- ========== EXPENSES (5xxx) ==========
  INSERT INTO chart_of_accounts (company_id, account_code, account_name, account_type, description, is_active) VALUES
  (v_cid, '5000', 'Operating Expenses', 'expense', 'Operating expense accounts', true),
  (v_cid, '5100', 'Cost of Goods Sold', 'expense', 'Direct product costs', true),
  (v_cid, '5200', 'Salaries & Wages', 'expense', 'Employee compensation', true),
  (v_cid, '5300', 'Rent & Utilities', 'expense', 'Facility rent and utility costs', true),
  (v_cid, '5400', 'Office Supplies Expense', 'expense', 'Office supplies consumed', true),
  (v_cid, '5500', 'Shipping & Freight', 'expense', 'Outbound shipping costs', true),
  (v_cid, '5600', 'Depreciation Expense', 'expense', 'Fixed asset depreciation', true),
  (v_cid, '5700', 'Marketing & Advertising', 'expense', 'Marketing and advertising costs', true),
  (v_cid, '5800', 'Taxes & Licenses', 'expense', 'Business taxes and licenses', true);
END $$;

-- ============================================================================
-- SECTION 17: EMPLOYEES (HR)
-- ============================================================================
DO $$
DECLARE
  v_cid INTEGER;
  v_uid INTEGER;
BEGIN
  v_cid := (SELECT val FROM demo_ids WHERE key = 'company_id');
  v_uid := (SELECT val FROM demo_ids WHERE key = 'user_id');

  INSERT INTO employees (company_id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, address, city, state, postal_code, country, department, position, hire_date, employment_type, salary, status, created_by) VALUES
  (v_cid, 'EMP-001', 'Sarah', 'Chen', 'sarah.chen@phoenixintl.com', '+1 (313) 555-1001', '1985-03-14', 'Female', '342 Riverfront Dr, Apt 4B', 'Detroit', 'MI', '48243', 'USA', 'Executive', 'Chief Executive Officer', '2019-06-01', 'Full-time', 250000.00, 'active', v_uid),
  (v_cid, 'EMP-002', 'Michael', 'Okafor', 'michael.okafor@phoenixintl.com', '+1 (313) 555-1002', '1988-07-22', 'Male', '1580 Jefferson Ave, Apt 12', 'Detroit', 'MI', '48207', 'USA', 'Finance', 'Chief Financial Officer', '2020-01-15', 'Full-time', 220000.00, 'active', v_uid),
  (v_cid, 'EMP-003', 'Lisa', 'Patel', 'lisa.patel@phoenixintl.com', '+1 (313) 555-1003', '1990-11-08', 'Female', '275 Gratiot Ave, Unit 305', 'Detroit', 'MI', '48226', 'USA', 'Sales', 'VP of Sales', '2020-03-01', 'Full-time', 185000.00, 'active', v_uid),
  (v_cid, 'EMP-004', 'David', 'Thompson', 'david.thompson@phoenixintl.com', '+1 (313) 555-1004', '1992-05-30', 'Male', '890 Woodward Ave, Apt 7C', 'Detroit', 'MI', '48226', 'USA', 'Operations', 'Operations Manager', '2021-04-01', 'Full-time', 95000.00, 'active', v_uid),
  (v_cid, 'EMP-005', 'Amanda', 'Rodriguez', 'amanda.rodriguez@phoenixintl.com', '+1 (312) 555-2001', '1993-09-12', 'Female', '430 N Michigan Ave, Apt 1502', 'Chicago', 'IL', '60611', 'USA', 'Warehouse', 'Warehouse Supervisor', '2021-06-15', 'Full-time', 62000.00, 'active', v_uid),
  (v_cid, 'EMP-006', 'James', 'Kim', 'james.kim@phoenixintl.com', '+1 (404) 555-3001', '1991-01-25', 'Male', '550 Piedmont Ave NE, Apt 8A', 'Atlanta', 'GA', '30308', 'USA', 'Sales', 'Regional Sales Manager', '2022-02-01', 'Full-time', 85000.00, 'active', v_uid),
  (v_cid, 'EMP-007', 'Rachel', 'Martinez', 'rachel.martinez@phoenixintl.com', '+1 (313) 555-1005', '1995-08-17', 'Female', '1200 Washington Blvd, Apt 6', 'Detroit', 'MI', '48226', 'USA', 'IT', 'IT Systems Administrator', '2022-08-01', 'Full-time', 78000.00, 'active', v_uid),
  (v_cid, 'EMP-008', 'Robert', 'Williams', 'robert.williams@phoenixintl.com', '+1 (313) 555-1006', '1987-12-03', 'Male', '550 E Grand Blvd, Apt 9B', 'Detroit', 'MI', '48207', 'USA', 'Finance', 'Staff Accountant', '2023-01-10', 'Full-time', 55000.00, 'active', v_uid);
END $$;

-- ============================================================================
-- SECTION 18: LEAVE TYPES & REQUESTS
-- ============================================================================
DO $$
DECLARE
  v_cid INTEGER;
  v_uid INTEGER;
  v_vacation_id INTEGER;
  v_sick_id INTEGER;
  v_personal_id INTEGER;
BEGIN
  v_cid := (SELECT val FROM demo_ids WHERE key = 'company_id');
  v_uid := (SELECT val FROM demo_ids WHERE key = 'user_id');

  INSERT INTO leave_types (company_id, name, code, default_days, is_paid, requires_approval, is_active) VALUES
  (v_cid, 'Annual Vacation', 'VAC', 20, true, true, true),
  (v_cid, 'Sick Leave', 'SICK', 12, true, true, true),
  (v_cid, 'Personal Leave', 'PERS', 5, false, true, true),
  (v_cid, 'Maternity Leave', 'MAT', 90, true, true, true),
  (v_cid, 'Bereavement Leave', 'BER', 3, true, false, true);

  v_vacation_id := (SELECT id FROM leave_types WHERE code = 'VAC' AND company_id = v_cid LIMIT 1);
  v_sick_id := (SELECT id FROM leave_types WHERE code = 'SICK' AND company_id = v_cid LIMIT 1);
  v_personal_id := (SELECT id FROM leave_types WHERE code = 'PERS' AND company_id = v_cid LIMIT 1);

  INSERT INTO leave_requests (company_id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status, approved_by, approved_at, created_by)
  SELECT v_cid, e.id, v_vacation_id, '2026-03-15', '2026-03-22', 8, 'Family trip to Japan', 'approved', v_uid, '2026-02-20 10:00:00', v_uid
  FROM employees e WHERE e.employee_code = 'EMP-001';

  INSERT INTO leave_requests (company_id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status, approved_by, approved_at, created_by)
  SELECT v_cid, e.id, v_sick_id, '2026-02-10', '2026-02-11', 2, 'Medical appointment', 'approved', v_uid, '2026-02-09 09:00:00', v_uid
  FROM employees e WHERE e.employee_code = 'EMP-004';

  INSERT INTO leave_requests (company_id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status, approved_by, approved_at, created_by)
  SELECT v_cid, e.id, v_vacation_id, '2026-04-05', '2026-04-09', 5, 'Spring break vacation', 'approved', v_uid, '2026-03-18 11:00:00', v_uid
  FROM employees e WHERE e.employee_code = 'EMP-007';

  INSERT INTO leave_requests (company_id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status, created_by)
  SELECT v_cid, e.id, v_personal_id, '2026-03-28', '2026-03-28', 1, 'Personal errand', 'pending', v_uid
  FROM employees e WHERE e.employee_code = 'EMP-003';
END $$;

-- ============================================================================
-- SECTION 19: ASSET CATEGORIES & FIXED ASSETS
-- ============================================================================
DO $$
DECLARE
  v_cid INTEGER;
  v_uid INTEGER;
  v_cat_comp INTEGER;
  v_cat_mach INTEGER;
  v_cat_veh INTEGER;
  v_cat_furn INTEGER;
  v_sup_it INTEGER;
BEGIN
  v_cid := (SELECT val FROM demo_ids WHERE key = 'company_id');
  v_uid := (SELECT val FROM demo_ids WHERE key = 'user_id');
  v_sup_it := (SELECT id FROM suppliers WHERE name = 'TechVision Components GmbH' LIMIT 1);

  INSERT INTO asset_categories (company_id, code, name, default_depreciation_method, default_useful_life, is_active) VALUES
  (v_cid, 'IT-EQUIP', 'Computer & IT Equipment', 'straight_line', 5, true),
  (v_cid, 'MACHINERY', 'Manufacturing Machinery', 'straight_line', 15, true),
  (v_cid, 'VEHICLES', 'Motor Vehicles', 'straight_line', 8, true),
  (v_cid, 'FURNITURE', 'Office Furniture', 'straight_line', 10, true);

  v_cat_comp := (SELECT id FROM asset_categories WHERE code = 'IT-EQUIP' AND company_id = v_cid LIMIT 1);
  v_cat_mach := (SELECT id FROM asset_categories WHERE code = 'MACHINERY' AND company_id = v_cid LIMIT 1);
  v_cat_veh := (SELECT id FROM asset_categories WHERE code = 'VEHICLES' AND company_id = v_cid LIMIT 1);
  v_cat_furn := (SELECT id FROM asset_categories WHERE code = 'FURNITURE' AND company_id = v_cid LIMIT 1);

  INSERT INTO fixed_assets (company_id, asset_code, name, category_id, description, purchase_date, purchase_cost, current_value, salvage_value, useful_life, depreciation_method, accumulated_depreciation, depreciation_per_period, location, status, created_by) VALUES
  (v_cid, 'AST-IT-001', 'Dell PowerEdge R740 Server', v_cat_comp, 'Production database server, 256GB RAM, 8-core Xeon', '2024-03-15', 28500.00, 22800.00, 2800.00, 5, 'straight_line', 5700.00, 5700.00, 'Server Room - HQ Detroit', 'active', v_uid),
  (v_cid, 'AST-IT-002', 'Cisco Catalyst 9300 Switch', v_cat_comp, '48-port managed network switch for HQ network', '2024-06-01', 12400.00, 9920.00, 1200.00, 5, 'straight_line', 2480.00, 2480.00, 'Server Room - HQ Detroit', 'active', v_uid),
  (v_cid, 'AST-MCH-001', 'CNC Milling Machine HAAS VF-2', v_cat_mach, 'Vertical machining center with 4th axis', '2023-09-10', 87500.00, 75750.00, 7500.00, 15, 'straight_line', 11750.00, 5333.33, 'Toledo Manufacturing Plant', 'active', v_uid),
  (v_cid, 'AST-VEH-001', '2024 Ford Transit 350 Cargo', v_cat_veh, 'Delivery van for Detroit warehouse logistics', '2024-08-20', 48500.00, 39375.00, 8500.00, 8, 'straight_line', 9125.00, 5000.00, 'Detroit Warehouse Fleet', 'active', v_uid),
  (v_cid, 'AST-VEH-002', '2025 Toyota Camry Hybrid', v_cat_veh, 'Company car for VP of Sales', '2025-01-15', 34900.00, 30537.50, 6000.00, 8, 'straight_line', 4362.50, 3612.50, 'Detroit HQ', 'active', v_uid),
  (v_cid, 'AST-FRN-001', 'Herman Miller Office Chairs (x20)', v_cat_furn, 'Bulk order of ergonomic chairs for HQ office', '2024-02-01', 24000.00, 20400.00, 2400.00, 10, 'straight_line', 3600.00, 2160.00, 'Detroit HQ - All floors', 'active', v_uid);
END $$;

-- ============================================================================
-- SECTION 20: JOURNAL ENTRIES (BASIC ACCOUNTING)
-- ============================================================================
DO $$
DECLARE
  v_cid INTEGER;
  v_uid INTEGER;
  v_ar INTEGER;
  v_cogs INTEGER;
  v_inv INTEGER;
  v_rev INTEGER;
  v_cash INTEGER;
  v_ap INTEGER;
  v_vat INTEGER;
  v_salaries INTEGER;
  v_accum_dep INTEGER;
  v_dep_exp INTEGER;
BEGIN
  v_cid := (SELECT val FROM demo_ids WHERE key = 'company_id');
  v_uid := (SELECT val FROM demo_ids WHERE key = 'user_id');
  v_ar := (SELECT id FROM chart_of_accounts WHERE account_code = '1200' AND company_id = v_cid LIMIT 1);
  v_cogs := (SELECT id FROM chart_of_accounts WHERE account_code = '5100' AND company_id = v_cid LIMIT 1);
  v_inv := (SELECT id FROM chart_of_accounts WHERE account_code = '1300' AND company_id = v_cid LIMIT 1);
  v_rev := (SELECT id FROM chart_of_accounts WHERE account_code = '4100' AND company_id = v_cid LIMIT 1);
  v_cash := (SELECT id FROM chart_of_accounts WHERE account_code = '1101' AND company_id = v_cid LIMIT 1);
  v_ap := (SELECT id FROM chart_of_accounts WHERE account_code = '2100' AND company_id = v_cid LIMIT 1);
  v_vat := (SELECT id FROM chart_of_accounts WHERE account_code = '2300' AND company_id = v_cid LIMIT 1);
  v_salaries := (SELECT id FROM chart_of_accounts WHERE account_code = '5200' AND company_id = v_cid LIMIT 1);
  v_accum_dep := (SELECT id FROM chart_of_accounts WHERE account_code = '1501' AND company_id = v_cid LIMIT 1);
  v_dep_exp := (SELECT id FROM chart_of_accounts WHERE account_code = '5600' AND company_id = v_cid LIMIT 1);

  -- JE-2026-001: Revenue recognition for SO-2026-001 (Apex)
  INSERT INTO journal_entries (company_id, entry_date, description, reference_type, reference_id, voucher_no, voucher_type, total_debit, total_credit, status, created_by, created_at)
  VALUES (v_cid, '2026-01-10', 'Sales revenue - INV-2026-001 Apex Retail', 'invoice', (SELECT id FROM invoices WHERE invoice_number = 'INV-2026-001'), 'JE-2026-001', 'Sales', 1619.04, 1619.04, 'posted', v_uid, '2026-01-10 17:00:00');
  INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
  (currval('journal_entries_id_seq'), v_ar, 1619.04, 0, 'Accounts receivable - Apex Retail'),
  (currval('journal_entries_id_seq'), v_rev, 0, 1349.20, 'Product sales revenue'),
  (currval('journal_entries_id_seq'), v_vat, 0, 269.84, 'Output VAT charged');

  -- JE-2026-002: Revenue recognition for SO-2026-002 (Meridian)
  INSERT INTO journal_entries (company_id, entry_date, description, reference_type, reference_id, voucher_no, voucher_type, total_debit, total_credit, status, created_by, created_at)
  VALUES (v_cid, '2026-01-16', 'Sales revenue - INV-2026-002 Meridian Hospital', 'invoice', (SELECT id FROM invoices WHERE invoice_number = 'INV-2026-002'), 'JE-2026-002', 'Sales', 3779.46, 3779.46, 'posted', v_uid, '2026-01-16 17:00:00');
  INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
  (currval('journal_entries_id_seq'), v_ar, 3779.46, 0, 'Accounts receivable - Meridian Hospital'),
  (currval('journal_entries_id_seq'), v_rev, 0, 3149.55, 'Product sales revenue'),
  (currval('journal_entries_id_seq'), v_vat, 0, 629.91, 'Output VAT charged');

  -- JE-2026-003: Payment from Apex Retail
  INSERT INTO journal_entries (company_id, entry_date, description, reference_type, reference_id, voucher_no, voucher_type, total_debit, total_credit, status, created_by, created_at)
  VALUES (v_cid, '2026-01-28', 'Payment received - INV-2026-001 Apex Retail', 'payment', (SELECT id FROM payments WHERE payment_number = 'PAY-2026-001'), 'JE-2026-003', 'Receipt', 1619.04, 1619.04, 'posted', v_uid, '2026-01-28 17:00:00');
  INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
  (currval('journal_entries_id_seq'), v_cash, 1619.04, 0, 'Cash received - wire transfer'),
  (currval('journal_entries_id_seq'), v_ar, 0, 1619.04, 'Accounts receivable settled');

  -- JE-2026-004: Monthly depreciation
  INSERT INTO journal_entries (company_id, entry_date, description, voucher_no, voucher_type, total_debit, total_credit, status, created_by, created_at)
  VALUES (v_cid, '2026-01-31', 'Monthly depreciation - January 2026', 'JE-2026-004', 'Depreciation', 21289.33, 21289.33, 'posted', v_uid, '2026-01-31 23:00:00');
  INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
  (currval('journal_entries_id_seq'), v_dep_exp, 21289.33, 0, 'Monthly depreciation charge on all fixed assets'),
  (currval('journal_entries_id_seq'), v_accum_dep, 0, 21289.33, 'Accumulated depreciation for January 2026');

  -- JE-2026-005: Purchase of inventory from GlobalSource (received)
  INSERT INTO journal_entries (company_id, entry_date, description, reference_type, reference_id, voucher_no, voucher_type, total_debit, total_credit, status, created_by, created_at)
  VALUES (v_cid, '2025-12-02', 'Inventory received - PO-2025-001 GlobalSource Electronics', 'purchase_order', (SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-001'), 'JE-2025-001', 'Purchase', 14394.00, 14394.00, 'posted', v_uid, '2025-12-02 18:00:00');
  INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
  (currval('journal_entries_id_seq'), v_inv, 11995.00, 0, 'Inventory received'),
  (currval('journal_entries_id_seq'), v_vat, 2399.00, 0, 'Input VAT recoverable'),
  (currval('journal_entries_id_seq'), v_ap, 0, 14394.00, 'Accounts payable - GlobalSource Electronics');
END $$;

-- ============================================================================
-- SECTION 21: STOCK TRANSFERS (INTER-WAREHOUSE)
-- ============================================================================
DO $$
DECLARE
  v_cid INTEGER;
  v_uid INTEGER;
  v_wh_det INTEGER;
  v_wh_chi INTEGER;
BEGIN
  v_cid := (SELECT val FROM demo_ids WHERE key = 'company_id');
  v_uid := (SELECT val FROM demo_ids WHERE key = 'user_id');
  v_wh_det := (SELECT id FROM warehouses WHERE code = 'WH-DET' LIMIT 1);
  v_wh_chi := (SELECT id FROM warehouses WHERE code = 'WH-CHI' LIMIT 1);

  INSERT INTO stock_transfers (company_id, transfer_number, from_warehouse_id, to_warehouse_id, transfer_date, status, notes, created_by)
  VALUES (v_cid, 'ST-2026-001', v_wh_det, v_wh_chi, '2026-01-22', 'completed', 'Replenish Chicago stock for growing Midwest demand', v_uid);
  INSERT INTO stock_transfer_items (stock_transfer_id, product_id, quantity, unit_cost)
  VALUES
  (currval('stock_transfers_id_seq'), (SELECT id FROM products WHERE sku = 'ELEC-CBL-HDMI-01'), 50, 8.50),
  (currval('stock_transfers_id_seq'), (SELECT id FROM products WHERE sku = 'ELEC-CBL-USB-C-01'), 80, 5.75),
  (currval('stock_transfers_id_seq'), (SELECT id FROM products WHERE sku = 'INDU-GLUV-NTRL-01'), 100, 9.75);
END $$;

-- ============================================================================
-- SECTION 22: EXPENSE CATEGORIES & EXPENSES
-- ============================================================================
DO $$
DECLARE
  v_cid INTEGER;
  v_uid INTEGER;
  v_cat_rent INTEGER;
  v_cat_util INTEGER;
  v_cat_mktg INTEGER;
  v_cat_travel INTEGER;
BEGIN
  v_cid := (SELECT val FROM demo_ids WHERE key = 'company_id');
  v_uid := (SELECT val FROM demo_ids WHERE key = 'user_id');

  INSERT INTO expense_categories (company_id, name, description, is_active) VALUES
  (v_cid, 'Rent & Leases', 'Office and warehouse rent payments', true),
  (v_cid, 'Utilities', 'Electricity, water, internet, phone', true),
  (v_cid, 'Marketing', 'Advertising, promotions, events', true),
  (v_cid, 'Travel & Entertainment', 'Business travel, meals, client entertainment', true),
  (v_cid, 'Office Expenses', 'General office expenditures', true);

  v_cat_rent := (SELECT id FROM expense_categories WHERE name = 'Rent & Leases' AND company_id = v_cid LIMIT 1);
  v_cat_util := (SELECT id FROM expense_categories WHERE name = 'Utilities' AND company_id = v_cid LIMIT 1);
  v_cat_mktg := (SELECT id FROM expense_categories WHERE name = 'Marketing' AND company_id = v_cid LIMIT 1);
  v_cat_travel := (SELECT id FROM expense_categories WHERE name = 'Travel & Entertainment' AND company_id = v_cid LIMIT 1);

  INSERT INTO expenses (company_id, expense_date, category, category_id, description, amount, payment_method, reference_number, created_by) VALUES
  (v_cid, '2026-01-05', 'Utilities', v_cat_util, 'DTE Energy - January electricity bill', 4250.00, 'Wire Transfer', 'DTE-JAN-2026', v_uid),
  (v_cid, '2026-01-10', 'Rent & Leases', v_cat_rent, 'HQ Detroit office rent - January', 18500.00, 'Check', 'RENT-2026-01', v_uid),
  (v_cid, '2026-01-15', 'Marketing', v_cat_mktg, 'Google Ads campaign - Q1 2026', 3500.00, 'Credit Card', 'GOOG-ADS-Q1', v_uid),
  (v_cid, '2026-02-01', 'Utilities', v_cat_util, 'Comcast Business Internet - Feb', 890.00, 'Wire Transfer', 'CMCAST-FEB', v_uid),
  (v_cid, '2026-02-12', 'Travel & Entertainment', v_cat_travel, 'Sales team client dinner - Chicago trip', 1245.80, 'Corporate Card', 'T&E-2026-012', v_uid),
  (v_cid, '2026-02-20', 'Rent & Leases', v_cat_rent, 'Chicago warehouse rent - February', 8200.00, 'Check', 'RENT-CHI-02', v_uid),
  (v_cid, '2026-03-05', 'Office Expenses', NULL, 'Office supplies - Staples monthly order', 670.25, 'Credit Card', 'STAPLES-0305', v_uid);
END $$;

-- ============================================================================
-- SECTION 23: POS SESSIONS & TRANSACTIONS
-- ============================================================================
DO $$
DECLARE
  v_cid INTEGER;
  v_uid_val TEXT;
  v_session_id INTEGER;
  v_cust_bright INTEGER;
BEGIN
  v_cid := (SELECT val FROM demo_ids WHERE key = 'company_id');
  v_uid_val := (SELECT val::TEXT FROM demo_ids WHERE key = 'user_id');
  v_cust_bright := (SELECT id::TEXT FROM customers WHERE name = 'Brightpath Childcare Centers Inc' LIMIT 1);

  INSERT INTO pos_sessions (company_id, user_id, session_number, opening_time, opening_balance, cash_sales, card_sales, status, notes)
  VALUES (v_cid, v_uid_val, 'POS-SES-20260301-001', '2026-03-01 08:00:00', 500.00, 1280.50, 2150.75, 'closed', 'Daily sales session - front counter');
  v_session_id := currval('pos_sessions_id_seq');

  INSERT INTO pos_transactions (company_id, session_id, customer_id, order_number, order_date, subtotal, tax_amount, total_amount, payment_method, amount_paid, change_amount, status, created_by)
  VALUES (v_cid, v_session_id, NULL, 'POS-20260301-001', '2026-03-01 09:30:00', 89.95, 8.99, 98.94, 'Cash', 100.00, 1.06, 'completed', v_uid_val);
  INSERT INTO pos_transaction_items (pos_transaction_id, product_id, product_name, sku, quantity, unit_price, total)
  SELECT currval('pos_transactions_id_seq'), p.id, p.name, p.sku, 2, 19.99, 39.98
  FROM products p WHERE p.sku = 'ELEC-CBL-HDMI-01';
  INSERT INTO pos_transaction_items (pos_transaction_id, product_id, product_name, sku, quantity, unit_price, total)
  SELECT currval('pos_transactions_id_seq'), p.id, p.name, p.sku, 1, 14.99, 14.99
  FROM products p WHERE p.sku = 'ELEC-CBL-USB-C-01';
  INSERT INTO pos_transaction_items (pos_transaction_id, product_id, product_name, sku, quantity, unit_price, total)
  SELECT currval('pos_transactions_id_seq'), p.id, p.name, p.sku, 5, 8.49, 42.45
  FROM products p WHERE p.sku = 'OFFC-PAPR-A4-01';

  INSERT INTO pos_transactions (company_id, session_id, customer_id, order_number, order_date, subtotal, tax_amount, total_amount, payment_method, amount_paid, change_amount, status, created_by)
  VALUES (v_cid, v_session_id, NULL, 'POS-20260301-002', '2026-03-01 11:15:00', 129.99, 12.99, 142.98, 'Credit Card', 142.98, 0.00, 'completed', v_uid_val);
  INSERT INTO pos_transaction_items (pos_transaction_id, product_id, product_name, sku, quantity, unit_price, total)
  SELECT currval('pos_transactions_id_seq'), p.id, p.name, p.sku, 1, 129.99, 129.99
  FROM products p WHERE p.sku = 'ELEC-WEB-CAM-4K-01';
END $$;

-- ============================================================================
-- SECTION 24: CRM (LEAD SOURCES, STATUSES, LEADS)
-- ============================================================================
DO $$
DECLARE
  v_cid INTEGER;
  v_uid INTEGER;
  v_src_web INTEGER;
  v_src_ref INTEGER;
  v_src_trade INTEGER;
  v_stat_new INTEGER;
  v_stat_contacted INTEGER;
  v_stat_qualified INTEGER;
  v_apex_id INTEGER;
BEGIN
  v_cid := (SELECT val FROM demo_ids WHERE key = 'company_id');
  v_uid := (SELECT val FROM demo_ids WHERE key = 'user_id');
  v_apex_id := (SELECT id FROM customers WHERE name = 'Apex Retail Group LLC' LIMIT 1);

  INSERT INTO lead_sources (company_id, name, is_active) VALUES
  (v_cid, 'Website Inquiry', true),
  (v_cid, 'Referral', true),
  (v_cid, 'Trade Show', true),
  (v_cid, 'Cold Call', true),
  (v_cid, 'LinkedIn', true);
  v_src_web := (SELECT id FROM lead_sources WHERE name = 'Website Inquiry' AND company_id = v_cid LIMIT 1);
  v_src_ref := (SELECT id FROM lead_sources WHERE name = 'Referral' AND company_id = v_cid LIMIT 1);
  v_src_trade := (SELECT id FROM lead_sources WHERE name = 'Trade Show' AND company_id = v_cid LIMIT 1);

  INSERT INTO lead_statuses (company_id, name, sort_order, color, is_active) VALUES
  (v_cid, 'New', 1, '#3b82f6', true),
  (v_cid, 'Contacted', 2, '#f59e0b', true),
  (v_cid, 'Qualified', 3, '#10b981', true),
  (v_cid, 'Proposal', 4, '#8b5cf6', true),
  (v_cid, 'Closed Won', 5, '#059669', true),
  (v_cid, 'Closed Lost', 6, '#ef4444', true);
  v_stat_new := (SELECT id FROM lead_statuses WHERE name = 'New' AND company_id = v_cid LIMIT 1);
  v_stat_contacted := (SELECT id FROM lead_statuses WHERE name = 'Contacted' AND company_id = v_cid LIMIT 1);
  v_stat_qualified := (SELECT id FROM lead_statuses WHERE name = 'Qualified' AND company_id = v_cid LIMIT 1);

  INSERT INTO leads (company_id, salutation, first_name, last_name, email, phone, mobile, company, designation, source_id, status_id, assigned_to, address, city, state, country, postal_code, notes, created_by) VALUES
  (v_cid, 'Mr', 'Thomas', 'Mueller', 'thomas.mueller@dach-gmbh.de', '+49 89 12345678', '+49 172 9876543', 'DACH Industrietechnik GmbH', 'Procurement Director', v_src_trade, v_stat_contacted, v_uid, 'Industriestr. 42', 'Munich', 'Bavaria', 'Germany', '80339', 'Met at Hannover Messe 2026. Interested in industrial gloves and safety equipment.', v_uid),
  (v_cid, 'Ms', 'Jennifer', 'Walsh', 'j.walsh@westcoastmed.com', '+1 (415) 555-8900', '+1 (415) 555-8901', 'West Coast Medical Supply', 'VP Operations', v_src_web, v_stat_qualified, v_uid, '100 Pine St, Suite 800', 'San Francisco', 'CA', 'USA', '94111', 'Requested quote for bulk webcam order for telemedicine setup.', v_uid),
  (v_cid, 'Dr', 'Rajesh', 'Kumar', 'rajesh.kumar@nanyang.sg', '+65 6789 1234', NULL, 'Nanyang Polytechnic', 'IT Director', v_src_ref, v_stat_new, v_uid, '180 Ang Mo Kio Ave 8', 'Singapore', NULL, 'Singapore', '569830', 'Referred by Redwood University contact. Looking for campus-wide office and IT supplies.', v_uid);
END $$;

-- ============================================================================
-- SECTION 25: PROJECTS
-- ============================================================================
DO $$
DECLARE
  v_cid INTEGER;
  v_uid INTEGER;
  v_cust_pioneer INTEGER;
  v_cust_meridian INTEGER;
BEGIN
  v_cid := (SELECT val FROM demo_ids WHERE key = 'company_id');
  v_uid := (SELECT val FROM demo_ids WHERE key = 'user_id');
  v_cust_pioneer := (SELECT id FROM customers WHERE name = 'Pioneer Technology Solutions' LIMIT 1);
  v_cust_meridian := (SELECT id FROM customers WHERE name = 'Meridian Hospital Systems Inc' LIMIT 1);

  INSERT INTO projects (company_id, project_code, name, description, customer_id, start_date, end_date, budget_amount, status, priority, project_manager, created_by) VALUES
  (v_cid, 'PRJ-2026-001', 'HQ Office Relocation', 'Relocate Detroit HQ to Southfield campus - includes IT infrastructure, furniture, and logistics', NULL, '2026-04-01', '2026-06-30', 250000.00, 'planning', 'high', v_uid, v_uid),
  (v_cid, 'PRJ-2026-002', 'Pioneer Tech - Ergonomic Workspace', 'Full office fit-out for Pioneer Technology Solutions - 50 workstations with standing desks and ergonomic chairs', v_cust_pioneer, '2026-03-15', '2026-05-15', 87500.00, 'in_progress', 'high', v_uid, v_uid),
  (v_cid, 'PRJ-2026-003', 'Meridian Hospital - IT Infrastructure', 'Network upgrade and server room modernization for Meridian Hospital', v_cust_meridian, '2026-05-01', '2026-07-31', 180000.00, 'planning', 'medium', v_uid, v_uid);
END $$;

-- ============================================================================
-- SECTION 26: SERVICES
-- ============================================================================
DO $$
DECLARE
  v_cid INTEGER;
  v_uid INTEGER;
  v_tax_std INTEGER;
BEGIN
  v_cid := (SELECT val FROM demo_ids WHERE key = 'company_id');
  v_uid := (SELECT val FROM demo_ids WHERE key = 'user_id');
  v_tax_std := (SELECT id FROM tax_rates WHERE company_id = v_cid AND name = 'Standard VAT' LIMIT 1);

  INSERT INTO services (company_id, name, description, category, unit_price, tax_percent, tax_rate_id, is_active, created_by) VALUES
  (v_cid, 'IT Support - Monthly Retainer', 'Remote and on-site IT support, 40 hours/month', 'IT Services', 4500.00, 20.00, v_tax_std, true, v_uid),
  (v_cid, 'Warehouse Staffing - Temp Labor', 'Temporary warehouse labor per 8-hour shift', 'Logistics', 280.00, 20.00, v_tax_std, true, v_uid),
  (v_cid, 'Equipment Installation Service', 'On-site installation and configuration of office equipment', 'Installation', 750.00, 20.00, v_tax_std, true, v_uid);
END $$;

-- ============================================================================
-- SECTION 27: RETURNS & REASONS
-- ============================================================================
DO $$
DECLARE
  v_cid INTEGER;
  v_uid INTEGER;
  v_reason_dmg INTEGER;
  v_reason_def INTEGER;
  v_reason_wrong INTEGER;
  v_cust_pioneer INTEGER;
  v_sup_gs INTEGER;
BEGIN
  v_cid := (SELECT val FROM demo_ids WHERE key = 'company_id');
  v_uid := (SELECT val FROM demo_ids WHERE key = 'user_id');
  v_cust_pioneer := (SELECT id FROM customers WHERE name = 'Pioneer Technology Solutions' LIMIT 1);
  v_sup_gs := (SELECT id FROM suppliers WHERE name = 'GlobalSource Electronics Ltd' LIMIT 1);

  INSERT INTO return_reasons (company_id, reason_code, reason_name, category, is_active) VALUES
  (v_cid, 'DAMAGED', 'Damaged in Transit', 'both', true),
  (v_cid, 'DEFECTIVE', 'Defective Product', 'both', true),
  (v_cid, 'WRONG-ITEM', 'Wrong Item Shipped', 'both', true),
  (v_cid, 'CUSTOMER-RETURN', 'Customer Change of Mind', 'sales', true),
  (v_cid, 'OVERSTOCK', 'Supplier Overstock Return', 'purchase', true);
  v_reason_def := (SELECT id FROM return_reasons WHERE reason_code = 'DEFECTIVE' AND company_id = v_cid LIMIT 1);
  v_reason_dmg := (SELECT id FROM return_reasons WHERE reason_code = 'DAMAGED' AND company_id = v_cid LIMIT 1);
END $$;

-- ============================================================================
-- SECTION 28: FINAL ROW COUNTS
-- ============================================================================
SELECT '=== ERP DATA POPULATION COMPLETE ===' AS message;

SELECT 'companies' AS table_name, COUNT(*) AS row_count FROM companies
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'tax_rates', COUNT(*) FROM tax_rates
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL SELECT 'customers', COUNT(*) FROM customers
UNION ALL SELECT 'warehouses', COUNT(*) FROM warehouses
UNION ALL SELECT 'warehouse_bins', COUNT(*) FROM warehouse_bins
UNION ALL SELECT 'product_warehouse_stock', COUNT(*) FROM product_warehouse_stock
UNION ALL SELECT 'inventory_transactions', COUNT(*) FROM inventory_transactions
UNION ALL SELECT 'purchase_orders', COUNT(*) FROM purchase_orders
UNION ALL SELECT 'purchase_order_items', COUNT(*) FROM purchase_order_items
UNION ALL SELECT 'sales_orders', COUNT(*) FROM sales_orders
UNION ALL SELECT 'sales_order_items', COUNT(*) FROM sales_order_items
UNION ALL SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL SELECT 'invoice_items', COUNT(*) FROM invoice_items
UNION ALL SELECT 'payments', COUNT(*) FROM payments
UNION ALL SELECT 'chart_of_accounts', COUNT(*) FROM chart_of_accounts
UNION ALL SELECT 'journal_entries', COUNT(*) FROM journal_entries
UNION ALL SELECT 'journal_entry_lines', COUNT(*) FROM journal_entry_lines
UNION ALL SELECT 'employees', COUNT(*) FROM employees
UNION ALL SELECT 'leave_types', COUNT(*) FROM leave_types
UNION ALL SELECT 'leave_requests', COUNT(*) FROM leave_requests
UNION ALL SELECT 'asset_categories', COUNT(*) FROM asset_categories
UNION ALL SELECT 'fixed_assets', COUNT(*) FROM fixed_assets
UNION ALL SELECT 'expense_categories', COUNT(*) FROM expense_categories
UNION ALL SELECT 'expenses', COUNT(*) FROM expenses
UNION ALL SELECT 'stock_transfers', COUNT(*) FROM stock_transfers
UNION ALL SELECT 'stock_transfer_items', COUNT(*) FROM stock_transfer_items
UNION ALL SELECT 'pos_sessions', COUNT(*) FROM pos_sessions
UNION ALL SELECT 'pos_transactions', COUNT(*) FROM pos_transactions
UNION ALL SELECT 'pos_transaction_items', COUNT(*) FROM pos_transaction_items
UNION ALL SELECT 'lead_sources', COUNT(*) FROM lead_sources
UNION ALL SELECT 'lead_statuses', COUNT(*) FROM lead_statuses
UNION ALL SELECT 'leads', COUNT(*) FROM leads
UNION ALL SELECT 'projects', COUNT(*) FROM projects
UNION ALL SELECT 'services', COUNT(*) FROM services
UNION ALL SELECT 'return_reasons', COUNT(*) FROM return_reasons
UNION ALL SELECT 'suppliers', COUNT(*) FROM suppliers
ORDER BY table_name;

COMMIT;
