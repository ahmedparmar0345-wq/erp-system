-- ============================================================================
-- ERP DATA RESET & POPULATION SCRIPT
-- ============================================================================
-- Target: PostgreSQL (based on erp_schema.sql and module schema files)
-- WARNING: Deletes ALL existing data from business tables below,
--          then re-inserts realistic demo data.
-- SAFE: Does NOT touch users, roles, system_settings, email_templates,
--        tax_rates, return_reasons, lead_sources, lead_statuses,
--        leave_types, or any authentication-related tables.
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Delete existing data (FK-safe order — children before parents)
-- ============================================================================

-- Assets
DELETE FROM asset_depreciation;
DELETE FROM asset_maintenance;
DELETE FROM fixed_assets;
DELETE FROM asset_categories;

-- Stock transfers
DELETE FROM stock_transfer_items;
DELETE FROM stock_transfers;
DELETE FROM product_warehouse_stock;
DELETE FROM warehouse_bins;

-- Returns & credit notes
DELETE FROM purchase_return_items;
DELETE FROM purchase_returns;
DELETE FROM sales_return_items;
DELETE FROM sales_returns;
DELETE FROM credit_notes;

-- Projects & time
DELETE FROM time_entries;
DELETE FROM project_tasks;
DELETE FROM project_members;
DELETE FROM projects;

-- Approvals
DELETE FROM approval_logs;
DELETE FROM approval_requests;
DELETE FROM approval_steps;
DELETE FROM approval_workflows;

-- Invoicing & payments
DELETE FROM payments;
DELETE FROM invoice_items;
DELETE FROM invoices;

-- Accounting
DELETE FROM journal_entry_lines;
DELETE FROM journal_entries;

-- Inventory
DELETE FROM inventory_transactions;

-- Sales
DELETE FROM sales_order_items;
DELETE FROM sales_orders;

-- Purchasing
DELETE FROM purchase_order_items;
DELETE FROM purchase_orders;

-- POS
DELETE FROM pos_transaction_items;
DELETE FROM pos_transactions;
DELETE FROM pos_cart;
DELETE FROM pos_sessions;

-- Services
DELETE FROM service_invoice_items;
DELETE FROM service_invoices;
DELETE FROM services;

-- Quotations
DELETE FROM quotation_items;
DELETE FROM quotations;

-- CRM
DELETE FROM follow_ups;
DELETE FROM interactions;
DELETE FROM opportunities;
DELETE FROM leads;

-- HR
DELETE FROM attendance;
DELETE FROM leave_requests;
DELETE FROM employee_documents;
DELETE FROM employees;

-- Expenses
DELETE FROM expenses;
DELETE FROM expense_categories;

-- Bank reconciliation
DELETE FROM reconciliation_reports;
DELETE FROM bank_transactions;
DELETE FROM bank_accounts;

-- Budgets
DELETE FROM budget_items;
DELETE FROM budgets;

-- Recurring entries
DELETE FROM recurring_entry_lines;
DELETE FROM recurring_entries;

-- Cost centers
DELETE FROM cost_centers;

-- Products & partners
DELETE FROM product_warehouse_stock;
DELETE FROM products;
DELETE FROM customers;
DELETE FROM suppliers;
DELETE FROM warehouses;
DELETE FROM chart_of_accounts;

-- NOTE: companies table is NOT deleted (users + roles reference it).
-- Company ID 1 is updated in STEP 3 with realistic data.

-- ============================================================================
-- STEP 2: Reset sequences
-- ============================================================================

-- companies sequence: set to max existing ID (table not deleted)
SELECT setval('companies_id_seq', COALESCE((SELECT MAX(id) FROM companies), 0));
ALTER SEQUENCE warehouses_id_seq                 RESTART WITH 1;
ALTER SEQUENCE suppliers_id_seq                  RESTART WITH 1;
ALTER SEQUENCE customers_id_seq                  RESTART WITH 1;
ALTER SEQUENCE products_id_seq                   RESTART WITH 1;
ALTER SEQUENCE purchase_orders_id_seq            RESTART WITH 1;
ALTER SEQUENCE purchase_order_items_id_seq       RESTART WITH 1;
ALTER SEQUENCE sales_orders_id_seq               RESTART WITH 1;
ALTER SEQUENCE sales_order_items_id_seq          RESTART WITH 1;
ALTER SEQUENCE inventory_transactions_id_seq     RESTART WITH 1;
ALTER SEQUENCE invoices_id_seq                   RESTART WITH 1;
ALTER SEQUENCE invoice_items_id_seq              RESTART WITH 1;
ALTER SEQUENCE payments_id_seq                   RESTART WITH 1;
ALTER SEQUENCE chart_of_accounts_id_seq          RESTART WITH 1;
ALTER SEQUENCE journal_entries_id_seq            RESTART WITH 1;
ALTER SEQUENCE journal_entry_lines_id_seq        RESTART WITH 1;
ALTER SEQUENCE employees_id_seq                  RESTART WITH 1;
ALTER SEQUENCE attendance_id_seq                 RESTART WITH 1;
ALTER SEQUENCE leave_requests_id_seq             RESTART WITH 1;
ALTER SEQUENCE employee_documents_id_seq         RESTART WITH 1;
ALTER SEQUENCE asset_categories_id_seq           RESTART WITH 1;
ALTER SEQUENCE fixed_assets_id_seq               RESTART WITH 1;
ALTER SEQUENCE asset_depreciation_id_seq         RESTART WITH 1;
ALTER SEQUENCE asset_maintenance_id_seq          RESTART WITH 1;
ALTER SEQUENCE expense_categories_id_seq         RESTART WITH 1;
ALTER SEQUENCE expenses_id_seq                   RESTART WITH 1;
ALTER SEQUENCE quotations_id_seq                 RESTART WITH 1;
ALTER SEQUENCE quotation_items_id_seq            RESTART WITH 1;
ALTER SEQUENCE bank_accounts_id_seq              RESTART WITH 1;
ALTER SEQUENCE bank_transactions_id_seq          RESTART WITH 1;
ALTER SEQUENCE reconciliation_reports_id_seq     RESTART WITH 1;
ALTER SEQUENCE cost_centers_id_seq               RESTART WITH 1;
ALTER SEQUENCE budgets_id_seq                    RESTART WITH 1;
ALTER SEQUENCE budget_items_id_seq               RESTART WITH 1;
ALTER SEQUENCE recurring_entries_id_seq          RESTART WITH 1;
ALTER SEQUENCE recurring_entry_lines_id_seq      RESTART WITH 1;
ALTER SEQUENCE warehouse_bins_id_seq             RESTART WITH 1;
ALTER SEQUENCE product_warehouse_stock_id_seq    RESTART WITH 1;
ALTER SEQUENCE stock_transfers_id_seq            RESTART WITH 1;
ALTER SEQUENCE stock_transfer_items_id_seq       RESTART WITH 1;
ALTER SEQUENCE pos_sessions_id_seq               RESTART WITH 1;
ALTER SEQUENCE pos_cart_id_seq                   RESTART WITH 1;
ALTER SEQUENCE pos_transactions_id_seq           RESTART WITH 1;
ALTER SEQUENCE pos_transaction_items_id_seq      RESTART WITH 1;
ALTER SEQUENCE sales_returns_id_seq              RESTART WITH 1;
ALTER SEQUENCE sales_return_items_id_seq         RESTART WITH 1;
ALTER SEQUENCE purchase_returns_id_seq           RESTART WITH 1;
ALTER SEQUENCE purchase_return_items_id_seq      RESTART WITH 1;
ALTER SEQUENCE credit_notes_id_seq               RESTART WITH 1;
ALTER SEQUENCE projects_id_seq                   RESTART WITH 1;
ALTER SEQUENCE project_tasks_id_seq              RESTART WITH 1;
ALTER SEQUENCE project_members_id_seq            RESTART WITH 1;
ALTER SEQUENCE time_entries_id_seq               RESTART WITH 1;
ALTER SEQUENCE approval_workflows_id_seq         RESTART WITH 1;
ALTER SEQUENCE approval_steps_id_seq             RESTART WITH 1;
ALTER SEQUENCE approval_requests_id_seq          RESTART WITH 1;
ALTER SEQUENCE approval_logs_id_seq              RESTART WITH 1;
ALTER SEQUENCE leads_id_seq                      RESTART WITH 1;
ALTER SEQUENCE opportunities_id_seq              RESTART WITH 1;
ALTER SEQUENCE follow_ups_id_seq                 RESTART WITH 1;
ALTER SEQUENCE interactions_id_seq               RESTART WITH 1;
ALTER SEQUENCE services_id_seq                   RESTART WITH 1;
ALTER SEQUENCE service_invoices_id_seq           RESTART WITH 1;
ALTER SEQUENCE service_invoice_items_id_seq      RESTART WITH 1;

-- ============================================================================
-- STEP 3: COMPANIES
-- ============================================================================

INSERT INTO companies (name, tax_id, email, phone, address, currency) VALUES
('NovaTech Distributors Inc.', '47-3298412', 'info@novatechdist.com', '+1 212 555 8900', '450 Seventh Avenue, Suite 1200, New York, NY 10123, USA', 'USD'),
('Precision Manufacturing Corp.', '82-7156093', 'contact@precisionmfg.com', '+1 313 555 4700', '2800 Industrial Parkway, Detroit, MI 48216, USA', 'USD'),
('EuroStyle Retail GmbH', 'DE329871542', 'info@eurostyle-retail.de', '+49 69 2555 7800', 'Taunusanlage 15, 60325 Frankfurt am Main, Germany', 'EUR');

-- ============================================================================
-- STEP 4: WAREHOUSES
-- ============================================================================

INSERT INTO warehouses (company_id, code, name, address, city, state, country, postal_code, phone, email, is_default, is_active) VALUES
(1, 'NYC-MAIN', 'East Coast Distribution Center', '150 Port Street, Building A', 'Newark', 'NJ', 'USA', '07114', '+1 973 555 1000', 'nyc-wh@novatechdist.com', true, true),
(1, 'LAX-WEST', 'West Coast Fulfillment Hub', '4200 East 26th Street', 'Los Angeles', 'CA', 'USA', '90058', '+1 213 555 2000', 'lax-wh@novatechdist.com', false, true),
(2, 'DET-PROD', 'Main Production Warehouse', '2800 Industrial Parkway, Bldg 4', 'Detroit', 'MI', 'USA', '48216', '+1 313 555 4705', 'wh@precisionmfg.com', true, true),
(3, 'FRA-HUB', 'Central Logistics Hub', 'Industriestrasse 42', 'Frankfurt', 'Hessen', 'Germany', '60327', '+49 69 2555 7900', 'logistics@eurostyle-retail.de', true, true);

-- Warehouse bins for East Coast DC
INSERT INTO warehouse_bins (company_id, warehouse_id, code, name, zone, aisle, rack, shelf, max_capacity) VALUES
(1, 1, 'A-01-01', 'Aisle A Rack 1 Shelf 1', 'Electronics', 'A', '1', '1', 200),
(1, 1, 'A-01-02', 'Aisle A Rack 1 Shelf 2', 'Electronics', 'A', '1', '2', 200),
(1, 1, 'B-02-01', 'Aisle B Rack 2 Shelf 1', 'Peripherals', 'B', '2', '1', 300),
(1, 1, 'C-03-01', 'Aisle C Rack 3 Shelf 1', 'Furniture', 'C', '3', '1', 50),
(1, 1, 'D-04-01', 'Aisle D Rack 4 Shelf 1', 'Cables & Accessories', 'D', '4', '1', 500);

-- ============================================================================
-- STEP 5: SUPPLIERS
-- ============================================================================

INSERT INTO suppliers (company_id, name, email, phone, address) VALUES
(1, 'Shenzhen Electronics Co., Ltd.', 'sales@szelectronics.cn', '+86 755 8293 4000', '12 Science & Technology Road, Nanshan District, Shenzhen, Guangdong 518000, China'),
(1, 'TechVision Components Ltd.', 'orders@techvision.com', '+1 408 555 7200', '3200 Great America Parkway, Santa Clara, CA 95054, USA'),
(1, 'Pacific Logistics Group', 'info@pacificlogistics.com', '+1 213 555 4500', '1100 Wilmington Boulevard, Wilmington, CA 90744, USA'),
(2, 'Global Steel & Metals Inc.', 'supply@globalsteel.com', '+1 312 555 8900', '1500 West 47th Street, Chicago, IL 60609, USA'),
(3, 'Alpine Packaging Solutions', 'contact@alpinepack.com', '+1 770 555 3200', '5500 Oakbrook Parkway, Norcross, GA 30093, USA');

-- ============================================================================
-- STEP 6: CUSTOMERS
-- ============================================================================

INSERT INTO customers (company_id, name, email, phone, billing_address, shipping_address) VALUES
(1, 'Quantum Retail Solutions', 'accounts@quantumretail.com', '+1 312 555 4400', '200 North Michigan Avenue, Suite 1500, Chicago, IL 60601, USA', '200 North Michigan Avenue, Suite 1500, Chicago, IL 60601, USA'),
(1, 'MediCore Health Systems', 'procurement@medicorehealth.com', '+1 617 555 2300', '500 Longwood Avenue, Boston, MA 02115, USA', '1200 Technology Drive, Framingham, MA 01701, USA'),
(1, 'Velocity Automotive Parts', 'orders@velocityauto.com', '+1 248 555 6700', '3800 Automation Avenue, Auburn Hills, MI 48326, USA', '3800 Automation Avenue, Auburn Hills, MI 48326, USA'),
(2, 'Apex Construction Group', 'info@apexconstruction.com', '+1 216 555 3100', '1300 East 9th Street, Suite 200, Cleveland, OH 44114, USA', '4500 Manufacturing Road, Toledo, OH 43615, USA'),
(3, 'GreenField Organics Co.', 'purchasing@greenfieldorganics.com', '+49 40 3892 4500', 'Doberaner Strasse 12, 22041 Hamburg, Germany', 'Doberaner Strasse 12, 22041 Hamburg, Germany'),
(3, 'Stellar Education Trust', 'finance@stellaredu.org', '+44 20 7946 0800', '80 Charlotte Street, London W1T 4QS, United Kingdom', '80 Charlotte Street, London W1T 4QS, United Kingdom');

-- ============================================================================
-- STEP 7: PRODUCTS
-- ============================================================================

INSERT INTO products (company_id, sku, name, description, unit_price, cost_price, current_stock, reorder_level) VALUES
-- NovaTech Distributors (company_id 1)
(1, 'LAP-PRO-4500', 'Laptop ProBook 4500', '15.6" FHD display, Intel Core i7, 16GB RAM, 512GB SSD', 1299.00, 950.00, 150, 30),
(1, 'AUD-BT-HS200', 'Wireless Bluetooth Headset Pro', 'Active noise cancelling, 30hr battery, USB-C charging', 89.99, 45.00, 500, 100),
(1, 'MON-IPS-27-4K', '27" IPS LED Monitor 4K', 'Ultra HD 3840x2160, USB-C Hub, Height Adjustable', 449.00, 320.00, 80, 20),
(1, 'KEY-MCH-RGB', 'Mechanical Keyboard RGB', 'Cherry MX Blue switches, RGB backlighting, Aluminum frame', 129.99, 65.00, 200, 50),
(1, 'DOCK-USBC-PRO', 'USB-C Docking Station Pro', 'Dual HDMI, 100W PD, Gigabit Ethernet, 6 USB ports', 179.00, 95.00, 120, 25),
(1, 'CBL-CAT6-10M', 'Ethernet Cable Cat6 10m', 'Snagless molded boot, 250MHz, 10Gbps', 12.99, 5.50, 1000, 200),
(1, 'SRV-RACK-42U', 'Server Rack 42U Standard', 'Adjustable depth, ventilated doors, 1000kg capacity', 899.00, 620.00, 25, 5),
(1, 'SW-NET-48P', 'Network Switch 48-Port Gigabit', 'Managed L2, 48 PoE+ ports, 4 SFP+ uplinks', 1199.00, 780.00, 30, 8),
(1, 'CHR-ERG-PRO', 'Ergonomic Office Chair Pro', 'Adjustable lumbar, mesh back, 4D armrests, 300lb capacity', 599.00, 380.00, 45, 10),
(1, 'SSD-EXT-2TB', '2TB External SSD Portable', 'USB 3.2 Gen 2, 1050MB/s read, IP65 rated', 189.99, 120.00, 300, 60),
(1, 'CAM-WEB-4K', 'Webcam 4K Ultra HD', '4K@30fps, Auto-focus, Built-in microphone, Privacy shutter', 199.99, 110.00, 175, 35),
(1, 'SPR-12OUT-SURGE', 'Surge Protector 12-Outlet', '3600 Joules, 12 outlets, 6ft cord, USB ports', 39.99, 18.00, 600, 150),

-- Precision Manufacturing (company_id 2)
(2, 'STM-BEAM-20FT', 'Industrial Steel Beam 20ft', 'Grade A36 structural steel, W8x31 profile, 20ft length', 349.00, 220.00, 200, 40),
(2, 'HYD-PMP-HP300', 'Hydraulic Pump HP-300', '3000 PSI, 5 GPM, 2-stage gear pump, 15HP motor', 2899.00, 1950.00, 35, 8),
(2, 'SFTY-GGL-INDUST', 'Safety Goggles Industrial', 'Anti-fog, impact resistant, UV protection, ANSI Z87.1', 24.99, 12.00, 500, 100),
(2, 'PLJ-MAN-5500', 'Pallet Jack Manual 5500lbs', '5500lb capacity, 27" forks, polyurethane wheels', 1199.00, 750.00, 40, 10),

-- EuroStyle Retail (company_id 3)
(3, 'DSK-LMP-DESIGN', 'Designer Desk Lamp', 'LED adjustable, touch dimmer, matte black finish, 12W', 89.00, 45.00, 120, 25),
(3, 'THR-BLN-PREMIUM', 'Premium Throw Blanket', 'Cashmere blend 180x130cm, charcoal grey, hypoallergenic', 59.00, 28.00, 200, 40),
(3, 'CRM-MUG-SET-6', 'Ceramic Mug Set 6-Piece', 'Porcelain 350ml, dishwasher safe, assorted matte colors', 34.99, 14.00, 350, 70);

-- Per-warehouse stock for East Coast DC (warehouse_id 1)
INSERT INTO product_warehouse_stock (company_id, product_id, warehouse_id, quantity, reserved_quantity, reorder_level) VALUES
(1, 1, 1, 90, 5, 20),
(1, 2, 1, 300, 15, 60),
(1, 3, 1, 50, 3, 15),
(1, 4, 1, 120, 8, 30),
(1, 5, 1, 80, 4, 15),
(1, 6, 1, 600, 50, 120),
(1, 7, 1, 15, 1, 3),
(1, 8, 1, 20, 2, 5),
(1, 9, 1, 30, 2, 8),
(1, 10, 1, 180, 10, 40),
(1, 11, 1, 100, 5, 20),
(1, 12, 1, 400, 30, 100);

-- Per-warehouse stock for West Coast Hub (warehouse_id 2)
INSERT INTO product_warehouse_stock (company_id, product_id, warehouse_id, quantity, reserved_quantity, reorder_level) VALUES
(1, 1, 2, 60, 3, 15),
(1, 2, 2, 200, 10, 40),
(1, 3, 2, 30, 2, 10),
(1, 4, 2, 80, 5, 20),
(1, 6, 2, 400, 30, 80),
(1, 10, 2, 120, 8, 25),
(1, 12, 2, 200, 15, 50);

-- ============================================================================
-- STEP 8: PURCHASE ORDERS & LINES
-- ============================================================================

-- PO-2026-0001: NovaTech -> Shenzhen Electronics (received)
INSERT INTO purchase_orders (company_id, supplier_id, po_number, order_date, expected_delivery_date, status, subtotal, tax_total, grand_total, notes, created_by, payment_status)
VALUES (1, 1, 'PO-2026-0001', '2026-01-15', '2026-02-20', 'received', 47500.00, 3800.00, 51300.00, 'Initial bulk order of laptops and headsets', 1, 'paid');

INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity) VALUES
(1, 1, 50, 950.00, 47500.00, 50);

-- PO-2026-0002: NovaTech -> TechVision Components (received)
INSERT INTO purchase_orders (company_id, supplier_id, po_number, order_date, expected_delivery_date, status, subtotal, tax_total, grand_total, notes, created_by, payment_status)
VALUES (1, 2, 'PO-2026-0002', '2026-02-01', '2026-03-01', 'received', 26400.00, 2112.00, 28512.00, 'Monitor and peripheral restock', 1, 'paid');

INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity) VALUES
(2, 3, 40, 320.00, 12800.00, 40),
(2, 4, 100, 65.00, 6500.00, 100),
(2, 5, 50, 95.00, 4750.00, 50),
(2, 11, 25, 110.00, 2750.00, 25);

-- PO-2026-0003: NovaTech -> Pacific Logistics (sent)
INSERT INTO purchase_orders (company_id, supplier_id, po_number, order_date, expected_delivery_date, status, subtotal, tax_total, grand_total, notes, created_by, payment_status)
VALUES (1, 3, 'PO-2026-0003', '2026-03-10', '2026-04-05', 'sent', 17500.00, 1400.00, 18900.00, 'Logistics equipment for new fulfillment center', 1, 'unpaid');

INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity) VALUES
(3, 7, 10, 620.00, 6200.00, 0),
(3, 8, 15, 780.00, 11700.00, 0);

-- PO-2026-0004: Precision Mfg -> Global Steel (received)
INSERT INTO purchase_orders (company_id, supplier_id, po_number, order_date, expected_delivery_date, status, subtotal, tax_total, grand_total, notes, created_by, payment_status)
VALUES (2, 4, 'PO-2026-0004', '2026-02-20', '2026-03-25', 'received', 52300.00, 4184.00, 56484.00, 'Steel beams for Q2 construction projects', 1, 'paid');

INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity) VALUES
(4, 13, 150, 220.00, 33000.00, 150),
(4, 14, 10, 1950.00, 19500.00, 10);

-- PO-2026-0005: EuroStyle -> Alpine Packaging (draft)
INSERT INTO purchase_orders (company_id, supplier_id, po_number, order_date, expected_delivery_date, status, subtotal, tax_total, grand_total, notes, created_by, payment_status)
VALUES (3, 5, 'PO-2026-0005', '2026-03-22', '2026-04-15', 'draft', 3750.00, 712.50, 4462.50, 'Eco-friendly packaging for new product line', 1, 'unpaid');

INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity) VALUES
(5, 17, 50, 45.00, 2250.00, 0),
(5, 18, 30, 28.00, 840.00, 0),
(5, 19, 40, 14.00, 560.00, 0);

-- ============================================================================
-- STEP 9: SALES ORDERS & LINES
-- ============================================================================

-- SO-2026-0001: NovaTech -> Quantum Retail (shipped)
INSERT INTO sales_orders (company_id, customer_id, order_number, order_date, status, subtotal, tax_total, grand_total, notes, created_by, payment_status)
VALUES (1, 1, 'SO-2026-0001', '2026-02-20', 'shipped', 24290.00, 1943.20, 26233.20, 'Bulk laptop order for Q1 store rollout', 1, 'paid');

INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
(1, 1, 15, 1299.00, 0.00, 19485.00),
(1, 4, 25, 129.99, 5.00, 3087.26),
(1, 6, 100, 12.99, 0.00, 1299.00);

-- SO-2026-0002: NovaTech -> MediCore Health (confirmed)
INSERT INTO sales_orders (company_id, customer_id, order_number, order_date, status, subtotal, tax_total, grand_total, notes, created_by, payment_status)
VALUES (1, 2, 'SO-2026-0002', '2026-03-01', 'confirmed', 46750.00, 3740.00, 50490.00, 'IT infrastructure equipment for new hospital wing', 1, 'unpaid');

INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
(2, 1, 20, 1299.00, 5.00, 24681.00),
(2, 3, 15, 449.00, 0.00, 6735.00),
(2, 8, 8, 1199.00, 10.00, 8632.80),
(2, 7, 4, 899.00, 0.00, 3596.00);

-- SO-2026-0003: NovaTech -> Velocity Automotive (invoiced)
INSERT INTO sales_orders (company_id, customer_id, order_number, order_date, status, subtotal, tax_total, grand_total, notes, created_by, payment_status)
VALUES (1, 3, 'SO-2026-0003', '2026-03-10', 'invoiced', 12145.50, 971.64, 13117.14, 'Office equipment for new headquarters', 1, 'partial');

INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
(3, 9, 10, 599.00, 0.00, 5990.00),
(3, 10, 15, 189.99, 0.00, 2849.85),
(3, 11, 12, 199.99, 5.00, 2279.89),
(3, 12, 20, 39.99, 0.00, 799.80);

-- SO-2026-0004: Precision Mfg -> Apex Construction (shipped)
INSERT INTO sales_orders (company_id, customer_id, order_number, order_date, status, subtotal, tax_total, grand_total, notes, created_by, payment_status)
VALUES (2, 4, 'SO-2026-0004', '2026-02-28', 'shipped', 69750.00, 5580.00, 75330.00, 'Steel and hydraulic equipment for bridge project', 1, 'paid');

INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
(4, 13, 150, 349.00, 5.00, 49732.50),
(4, 14, 8, 2899.00, 0.00, 23192.00);

-- SO-2026-0005: EuroStyle -> GreenField Organics (confirmed)
INSERT INTO sales_orders (company_id, customer_id, order_number, order_date, status, subtotal, tax_total, grand_total, notes, created_by, payment_status)
VALUES (3, 5, 'SO-2026-0005', '2026-03-18', 'confirmed', 7936.00, 1507.84, 9443.84, 'Office furnishings for Hamburg headquarters', 1, 'unpaid');

INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
(5, 17, 20, 89.00, 0.00, 1780.00),
(5, 18, 50, 59.00, 0.00, 2950.00),
(5, 19, 80, 34.99, 5.00, 2659.24);

-- ============================================================================
-- STEP 10: INVENTORY TRANSACTIONS
-- ============================================================================

-- Stock in from purchase orders
INSERT INTO inventory_transactions (product_id, type, quantity, reference_type, reference_id, company_id, warehouse_id) VALUES
(1, 'in', 50, 'purchase_order', 1, 1, 1),
(3, 'in', 40, 'purchase_order', 2, 1, 1),
(4, 'in', 100, 'purchase_order', 2, 1, 1),
(5, 'in', 50, 'purchase_order', 2, 1, 1),
(11, 'in', 25, 'purchase_order', 2, 1, 1),
(7, 'in', 10, 'purchase_order', 3, 1, 2),
(8, 'in', 15, 'purchase_order', 3, 1, 2),
(13, 'in', 150, 'purchase_order', 4, 2, 3),
(14, 'in', 10, 'purchase_order', 4, 2, 3);

-- Stock out from sales orders
INSERT INTO inventory_transactions (product_id, type, quantity, reference_type, reference_id, company_id, warehouse_id) VALUES
(1, 'out', 15, 'sales_order', 1, 1, 1),
(4, 'out', 25, 'sales_order', 1, 1, 1),
(6, 'out', 100, 'sales_order', 1, 1, 1),
(13, 'out', 150, 'sales_order', 4, 2, 3),
(14, 'out', 8, 'sales_order', 4, 2, 3);

-- Stock adjustments
INSERT INTO inventory_transactions (product_id, type, quantity, reference_type, reference_id, company_id, warehouse_id) VALUES
(2, 'adjustment', -5, 'damaged_return', NULL, 1, 1),
(12, 'adjustment', -10, 'inventory_count', NULL, 1, 1);

-- ============================================================================
-- STEP 11: INVOICES (Sales)
-- ============================================================================

-- INV-2026-0001: Quantum Retail for SO-2026-0001
INSERT INTO invoices (company_id, invoice_number, sales_order_id, customer_id, invoice_date, due_date, status, subtotal, tax_total, grand_total, amount_paid, payment_terms, notes, created_by)
VALUES (1, 'INV-2026-0001', 1, 1, '2026-02-22', '2026-03-24', 'paid', 24290.00, 1943.20, 26233.20, 26233.20, 'Net 30', 'Payment received in full via wire transfer', 1);

INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total) VALUES
(1, 1, 'Laptop ProBook 4500', 15, 1299.00, 0.00, 8.00, 19485.00),
(1, 4, 'Mechanical Keyboard RGB', 25, 129.99, 5.00, 8.00, 3087.26),
(1, 6, 'Ethernet Cable Cat6 10m', 100, 12.99, 0.00, 8.00, 1299.00);

-- INV-2026-0002: Velocity Automotive for SO-2026-0003 (partial payment)
INSERT INTO invoices (company_id, invoice_number, sales_order_id, customer_id, invoice_date, due_date, status, subtotal, tax_total, grand_total, amount_paid, payment_terms, notes, created_by)
VALUES (1, 'INV-2026-0002', 3, 3, '2026-03-12', '2026-04-11', 'partial', 12145.50, 971.64, 13117.14, 5000.00, 'Net 30', 'Partial payment of $5,000 received, balance due $8,117.14', 1);

INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total) VALUES
(2, 9, 'Ergonomic Office Chair Pro', 10, 599.00, 0.00, 8.00, 5990.00),
(2, 10, '2TB External SSD Portable', 15, 189.99, 0.00, 8.00, 2849.85),
(2, 11, 'Webcam 4K Ultra HD', 12, 199.99, 5.00, 8.00, 2279.89),
(2, 12, 'Surge Protector 12-Outlet', 20, 39.99, 0.00, 8.00, 799.80);

-- INV-2026-0003: Apex Construction for SO-2026-0004
INSERT INTO invoices (company_id, invoice_number, sales_order_id, customer_id, invoice_date, due_date, status, subtotal, tax_total, grand_total, amount_paid, payment_terms, notes, created_by)
VALUES (2, 'INV-2026-0003', 4, 4, '2026-03-01', '2026-03-31', 'paid', 69750.00, 5580.00, 75330.00, 75330.00, 'Net 30', 'Full payment received', 1);

INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total) VALUES
(3, 13, 'Industrial Steel Beam 20ft', 150, 349.00, 5.00, 8.00, 49732.50),
(3, 14, 'Hydraulic Pump HP-300', 8, 2899.00, 0.00, 8.00, 23192.00);

-- ============================================================================
-- STEP 12: PAYMENTS
-- ============================================================================

INSERT INTO payments (company_id, invoice_id, payment_number, payment_date, amount, payment_method, reference_number, notes, created_by) VALUES
(1, 1, 'PAY-2026-0001', '2026-03-01', 26233.20, 'Wire Transfer', 'WT-9847321', 'Full payment for INV-2026-0001', 1),
(1, 2, 'PAY-2026-0002', '2026-03-20', 5000.00, 'Check', 'CK-1004592', 'Partial payment for INV-2026-0002', 1),
(2, 3, 'PAY-2026-0003', '2026-03-15', 75330.00, 'ACH', 'ACH-20260315-8821', 'Full payment for INV-2026-0003', 1);

-- ============================================================================
-- STEP 13: CHART OF ACCOUNTS
-- ============================================================================

-- Use account_type text column (post-migration)
INSERT INTO chart_of_accounts (company_id, account_code, account_name, account_type, parent_account_id, description, is_active) VALUES
-- Assets (1000-1999)
(1, '1000', 'Cash & Bank', 'asset', NULL, 'Cash on hand and bank accounts', true),
(1, '1100', 'Accounts Receivable', 'asset', NULL, 'Customer receivables', true),
(1, '1200', 'Inventory', 'asset', NULL, 'Product inventory on hand', true),
(1, '1300', 'Fixed Assets', 'asset', NULL, 'Property, plant and equipment', true),
(1, '1400', 'Accumulated Depreciation', 'asset', NULL, 'Contra-asset for accumulated depreciation', true),

-- Liabilities (2000-2999)
(1, '2000', 'Accounts Payable', 'liability', NULL, 'Supplier payables', true),
(1, '2100', 'Accrued Expenses', 'liability', NULL, 'Accrued liabilities', true),
(1, '2200', 'Sales Tax Payable', 'liability', NULL, 'Sales tax collected from customers', true),

-- Equity (3000-3999)
(1, '3000', 'Common Stock', 'equity', NULL, 'Shareholder capital contributions', true),
(1, '3100', 'Retained Earnings', 'equity', NULL, 'Accumulated retained earnings', true),

-- Revenue (4000-4999)
(1, '4000', 'Sales Revenue', 'revenue', NULL, 'Revenue from product sales', true),
(1, '4100', 'Service Revenue', 'revenue', NULL, 'Revenue from services', true),

-- Expenses (5000-5999)
(1, '5000', 'Cost of Goods Sold', 'expense', NULL, 'Direct cost of products sold', true),
(1, '5100', 'Salaries & Wages', 'expense', NULL, 'Employee salaries and wages', true),
(1, '5200', 'Rent & Utilities', 'expense', NULL, 'Office rent and utility expenses', true),
(1, '5300', 'Office Supplies', 'expense', NULL, 'Office supply expenses', true),
(1, '5400', 'Depreciation Expense', 'expense', NULL, 'Periodic depreciation charges', true),
(1, '5500', 'Marketing & Advertising', 'expense', NULL, 'Marketing and advertising costs', true),
(1, '5600', 'Insurance Expense', 'expense', NULL, 'Insurance premium expenses', true),
(1, '5700', 'Maintenance & Repairs', 'expense', NULL, 'Equipment and facility maintenance', true);

-- COA for Precision Mfg (same structure, different code prefix)
INSERT INTO chart_of_accounts (company_id, account_code, account_name, account_type, parent_account_id, description, is_active)
SELECT 2, account_code, account_name, account_type, NULL, description, true FROM chart_of_accounts WHERE company_id = 1;

-- COA for EuroStyle Retail
INSERT INTO chart_of_accounts (company_id, account_code, account_name, account_type, parent_account_id, description, is_active)
SELECT 3, account_code, account_name, account_type, NULL, description, true FROM chart_of_accounts WHERE company_id = 1;

-- ============================================================================
-- STEP 14: JOURNAL ENTRIES
-- ============================================================================

-- JE-2026-0001: Sales revenue recognition (Quantum Retail order)
INSERT INTO journal_entries (company_id, entry_date, account_id, debit, credit, reference_type, reference_id, description, voucher_no, voucher_type, total_debit, total_credit, status, created_by)
VALUES (1, '2026-02-22', 1, 26233.20, 0, 'invoice', 1, 'Sales invoice INV-2026-0001 - Quantum Retail', 'JE-2026-0001', 'Receipt', 26233.20, 26233.20, 'approved', 1);

INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
(1, 2, 26233.20, 0, 'Accounts receivable from Quantum Retail'),
(1, 11, 0, 24290.00, 'Sales revenue - Laptops and accessories'),
(1, 8, 0, 1943.20, 'Sales tax payable 8%');

-- JE-2026-0002: Purchase of inventory (Shenzhen Electronics PO)
INSERT INTO journal_entries (company_id, entry_date, account_id, debit, credit, reference_type, reference_id, description, voucher_no, voucher_type, total_debit, total_credit, status, created_by)
VALUES (1, '2026-02-20', 1, 51300.00, 0, 'purchase_order', 1, 'Inventory purchase PO-2026-0001 - Shenzhen Electronics', 'JE-2026-0002', 'Payment', 51300.00, 51300.00, 'approved', 1);

INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
(2, 3, 47500.00, 0, 'Inventory received'),
(2, 8, 3800.00, 0, 'Input VAT recoverable'),
(2, 6, 0, 51300.00, 'Accounts payable to Shenzhen Electronics');

-- JE-2026-0003: Payroll expense for February 2026
INSERT INTO journal_entries (company_id, entry_date, account_id, debit, credit, reference_type, reference_id, description, voucher_no, voucher_type, total_debit, total_credit, status, created_by)
VALUES (1, '2026-02-28', 1, 87500.00, 0, NULL, NULL, 'Monthly payroll - February 2026', 'JE-2026-0003', 'Journal', 87500.00, 87500.00, 'approved', 1);

INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
(3, 14, 65000.00, 0, 'Salaries - Sales department'),
(3, 14, 22500.00, 0, 'Salaries - Operations department'),
(3, 1, 0, 87500.00, 'Payroll disbursement from bank account');

-- ============================================================================
-- STEP 15: EMPLOYEES
-- ============================================================================

INSERT INTO employees (company_id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, address, city, state, postal_code, country, department, position, hire_date, employment_type, salary, bank_name, bank_account_no, status, created_by) VALUES
(1, 'EMP-2026-001', 'Sarah', 'Mitchell', 'sarah.mitchell@novatechdist.com', '+1 212 555 1001', '1982-04-15', 'Female', '45 Park Avenue, Apt 12B', 'New York', 'NY', '10016', 'USA', 'Executive', 'Chief Executive Officer', '2020-01-10', 'Full-time', 195000.00, 'Chase Bank', '****4521', 'active', 1),
(1, 'EMP-2026-002', 'James', 'Chen', 'james.chen@novatechdist.com', '+1 973 555 1002', '1988-09-22', 'Male', '28 Elm Street', 'Maplewood', 'NJ', '07040', 'USA', 'Warehouse', 'Warehouse Manager', '2021-03-15', 'Full-time', 78000.00, 'Bank of America', '****7890', 'active', 1),
(1, 'EMP-2026-003', 'Maria', 'Rodriguez', 'maria.rodriguez@novatechdist.com', '+1 212 555 1003', '1990-11-08', 'Female', '150 West 72nd Street', 'New York', 'NY', '10023', 'USA', 'Sales', 'Sales Manager', '2022-06-01', 'Full-time', 92000.00, 'Wells Fargo', '****3345', 'active', 1),
(1, 'EMP-2026-004', 'David', 'Thompson', 'david.thompson@novatechdist.com', '+1 212 555 1004', '1979-07-30', 'Male', '300 Central Park West, Apt 8A', 'New York', 'NY', '10024', 'USA', 'Finance', 'Financial Controller', '2019-09-01', 'Full-time', 145000.00, 'Chase Bank', '****6721', 'active', 1),
(2, 'EMP-2026-005', 'Robert', 'Kim', 'robert.kim@precisionmfg.com', '+1 313 555 4701', '1985-12-12', 'Male', '4200 Woodward Avenue, Apt 305', 'Detroit', 'MI', '48201', 'USA', 'Production', 'Production Supervisor', '2021-08-15', 'Full-time', 68000.00, 'Huntington Bank', '****8902', 'active', 1),
(3, 'EMP-2026-006', 'Anna', 'Weber', 'anna.weber@eurostyle-retail.de', '+49 69 2555 7001', '1991-05-18', 'Female', 'Goethestrasse 22', 'Frankfurt', 'Hessen', '60313', 'Germany', 'Retail', 'Store Manager', '2022-11-01', 'Full-time', 65000.00, 'Deutsche Bank', '****4501', 'active', 1);

-- ============================================================================
-- STEP 16: LEAVE REQUESTS
-- ============================================================================

INSERT INTO leave_requests (company_id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status, approved_by, created_by) VALUES
(1, 1, 1, '2026-03-10', '2026-03-14', 5, 'Annual family vacation - traveling to Japan', 'approved', 1, 1),
(1, 2, 2, '2026-02-05', '2026-02-06', 2, 'Medical appointment and recovery', 'approved', 1, 1),
(1, 3, 3, '2026-04-01', '2026-04-01', 1, 'Personal errand', 'pending', NULL, 1);

-- ============================================================================
-- STEP 17: ASSET CATEGORIES
-- ============================================================================

INSERT INTO asset_categories (company_id, code, name, default_depreciation_method, default_useful_life, is_active) VALUES
(1, 'VEHICLES', 'Motor Vehicles', 'straight_line', 8, true),
(1, 'IT-EQUIP', 'IT Equipment', 'straight_line', 5, true),
(1, 'MACHINERY', 'Heavy Machinery', 'straight_line', 10, true),
(2, 'MANUF-EQUIP', 'Manufacturing Equipment', 'straight_line', 12, true),
(3, 'FURNITURE', 'Store Furniture & Fixtures', 'straight_line', 7, true);

-- ============================================================================
-- STEP 18: FIXED ASSETS
-- ============================================================================

-- Forklift (NovaTech - Machinery)
INSERT INTO fixed_assets (company_id, asset_code, name, category_id, description, purchase_date, purchase_cost, current_value, salvage_value, useful_life, depreciation_method, accumulated_depreciation, depreciation_per_period, location, assigned_to, supplier_id, warranty_expiry, status, notes, created_by)
VALUES (1, 'FORKLIFT-001', 'Crown Forklift FC 4500', 3, 'Electric forklift, 4500lb capacity, 15ft lift height', '2024-03-15', 35000.00, 31500.00, 3500.00, 10, 'straight_line', 3500.00, 3150.00, 'East Coast DC - Newark', 2, 3, '2027-03-15', 'active', 'Primary warehouse forklift for daily operations', 1);

-- Server (NovaTech - IT Equipment)
INSERT INTO fixed_assets (company_id, asset_code, name, category_id, description, purchase_date, purchase_cost, current_value, salvage_value, useful_life, depreciation_method, accumulated_depreciation, depreciation_per_period, location, assigned_to, supplier_id, warranty_expiry, status, notes, created_by)
VALUES (1, 'SERVER-001', 'Dell PowerEdge R750', 2, 'Dell R750 rack server, 512GB RAM, dual Xeon Gold', '2025-01-20', 18500.00, 16650.00, 1850.00, 5, 'straight_line', 1850.00, 3330.00, 'Server Room - HQ NYC', 4, 2, '2028-01-20', 'active', 'Primary ERP application server', 1);

-- Cargo Van (NovaTech - Vehicles)
INSERT INTO fixed_assets (company_id, asset_code, name, category_id, description, purchase_date, purchase_cost, current_value, salvage_value, useful_life, depreciation_method, accumulated_depreciation, depreciation_per_period, location, assigned_to, warranty_expiry, status, notes, created_by)
VALUES (1, 'VEHICLE-001', 'Ford Transit Cargo Van 250', 1, '2024 Ford Transit 250, medium roof, 148" wheelbase', '2024-08-01', 42000.00, 39000.00, 6000.00, 8, 'straight_line', 3000.00, 4500.00, 'East Coast DC - Newark', 2, 3, '2027-08-01', 'active', 'Local deliveries and inter-warehouse transfers', 1);

-- Asset depreciation entries
INSERT INTO asset_depreciation (company_id, asset_id, period_date, amount, running_balance) VALUES
(1, 1, '2025-03-31', 262.50, 262.50),
(1, 1, '2025-06-30', 262.50, 525.00),
(1, 1, '2025-09-30', 262.50, 787.50),
(1, 1, '2025-12-31', 262.50, 1050.00),
(1, 2, '2025-03-31', 277.50, 277.50),
(1, 2, '2025-06-30', 277.50, 555.00),
(1, 2, '2025-09-30', 277.50, 832.50),
(1, 2, '2025-12-31', 277.50, 1110.00),
(1, 3, '2025-09-30', 375.00, 375.00),
(1, 3, '2025-12-31', 375.00, 750.00);

-- ============================================================================
-- STEP 19: EXPENSE CATEGORIES & EXPENSES
-- ============================================================================

INSERT INTO expense_categories (company_id, name, description, is_active) VALUES
(1, 'Office Rent', 'Monthly office lease payments', true),
(1, 'Utilities', 'Electricity, water, internet, phone', true),
(1, 'Travel & Meals', 'Business travel and client meals', true),
(1, 'Office Supplies', 'Stationery and office consumables', true),
(1, 'Software Subscriptions', 'SaaS and software licenses', true);

INSERT INTO expenses (company_id, expense_date, category_id, description, amount, payment_method, reference_number, created_by) VALUES
(1, '2026-02-01', 1, 'February office rent - HQ NYC', 18500.00, 'Wire Transfer', 'RENT-2026-02', 4),
(1, '2026-02-05', 2, 'February utilities - East Coast DC', 3450.00, 'ACH', 'UTIL-2026-02-DC', 4),
(1, '2026-02-10', 5, 'Microsoft 365 Business Premium - 50 licenses', 1250.00, 'Credit Card', 'MS-365-2026-02', 4),
(1, '2026-02-15', 3, 'Client dinner - Quantum Retail contract negotiation', 480.00, 'Company Card', 'MEAL-0215', 3);

-- ============================================================================
-- STEP 20: QUOTATIONS
-- ============================================================================

INSERT INTO quotations (company_id, customer_id, quote_number, quote_date, expiry_date, status, subtotal, tax_total, discount_total, grand_total, notes, terms_conditions, created_by) VALUES
(1, 2, 'QTE-2026-0001', '2026-02-10', '2026-03-10', 'converted', 46750.00, 3740.00, 0.00, 50490.00, 'IT infrastructure quote for MediCore Health Systems', 'Payment within 30 days. Delivery within 2 weeks of order confirmation.', 1),
(1, 1, 'QTE-2026-0002', '2026-03-15', '2026-04-15', 'draft', 35980.00, 2878.40, 0.00, 38858.40, 'Q2 bulk hardware quote for Quantum Retail expansion', 'Net 30 for approved accounts. Volume discounts available for orders above $50,000.', 1);

INSERT INTO quotation_items (quotation_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total) VALUES
(1, 1, 'Laptop ProBook 4500', 20, 1299.00, 5.00, 8.00, 24681.00),
(1, 3, '27" IPS LED Monitor 4K', 15, 449.00, 0.00, 8.00, 6735.00),
(1, 7, 'Server Rack 42U Standard', 4, 899.00, 0.00, 8.00, 3596.00),
(1, 8, 'Network Switch 48-Port Gigabit', 8, 1199.00, 10.00, 8.00, 8632.80),
(2, 1, 'Laptop ProBook 4500', 18, 1299.00, 3.00, 8.00, 22669.56),
(2, 9, 'Ergonomic Office Chair Pro', 12, 599.00, 0.00, 8.00, 7188.00),
(2, 10, '2TB External SSD Portable', 20, 189.99, 0.00, 8.00, 3799.80);

-- ============================================================================
-- STEP 21: CRM LEADS & OPPORTUNITIES
-- ============================================================================

INSERT INTO leads (company_id, first_name, last_name, email, phone, mobile, company, designation, source_id, status_id, notes, created_by) VALUES
(1, 'Thomas', 'Baker', 'thomas.baker@northwestlogistics.com', '+1 206 555 4400', '+1 206 555 4401', 'NorthWest Logistics', 'IT Director', 1, 3, 'Interested in full IT infrastructure upgrade for 3 warehouses', 1),
(1, 'Emily', 'Sullivan', 'emily.sullivan@baystate.edu', '+1 617 555 6100', '+1 617 555 6102', 'Bay State University', 'Procurement Manager', 5, 2, 'Requested quotes for computer lab equipment - 200+ workstations', 1),
(1, 'Luis', 'Garcia', 'luis.garcia@fontainebleauhotels.com', '+1 305 555 7200', NULL, 'Fontainebleau Hotels & Resorts', 'VP of Operations', 4, 1, 'New hotel construction in Miami - looking for bulk electronics supplier', 1);

INSERT INTO opportunities (company_id, lead_id, name, description, expected_revenue, probability, expected_close_date, stage, priority, assigned_to, created_by) VALUES
(1, 1, 'NorthWest Logistics IT Infrastructure Upgrade', 'Complete IT infrastructure upgrade for 3 warehouses including servers, networking, and workstations', 185000.00, 40, '2026-05-15', 'negotiation', 'high', 3, 1),
(1, 2, 'Bay State University Computer Lab Refresh', 'Replace 200+ workstations across 4 computer labs with new laptops and monitors', 280000.00, 25, '2026-06-30', 'proposal', 'medium', 3, 1),
(1, 3, 'Fontainebleau Miami Electronics Contract', 'Bulk electronics supplier for new hotel construction - TVs, computers, networking equipment', 420000.00, 15, '2026-08-01', 'qualification', 'medium', 3, 1);

-- ============================================================================
-- STEP 22: ROW COUNTS PER TABLE
-- ============================================================================

SELECT 'companies' AS table_name, COUNT(*) AS row_count FROM companies
UNION ALL SELECT 'warehouses', COUNT(*) FROM warehouses
UNION ALL SELECT 'warehouse_bins', COUNT(*) FROM warehouse_bins
UNION ALL SELECT 'product_warehouse_stock', COUNT(*) FROM product_warehouse_stock
UNION ALL SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL SELECT 'customers', COUNT(*) FROM customers
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'purchase_orders', COUNT(*) FROM purchase_orders
UNION ALL SELECT 'purchase_order_items', COUNT(*) FROM purchase_order_items
UNION ALL SELECT 'sales_orders', COUNT(*) FROM sales_orders
UNION ALL SELECT 'sales_order_items', COUNT(*) FROM sales_order_items
UNION ALL SELECT 'inventory_transactions', COUNT(*) FROM inventory_transactions
UNION ALL SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL SELECT 'invoice_items', COUNT(*) FROM invoice_items
UNION ALL SELECT 'payments', COUNT(*) FROM payments
UNION ALL SELECT 'chart_of_accounts', COUNT(*) FROM chart_of_accounts
UNION ALL SELECT 'journal_entries', COUNT(*) FROM journal_entries
UNION ALL SELECT 'journal_entry_lines', COUNT(*) FROM journal_entry_lines
UNION ALL SELECT 'employees', COUNT(*) FROM employees
UNION ALL SELECT 'leave_requests', COUNT(*) FROM leave_requests
UNION ALL SELECT 'asset_categories', COUNT(*) FROM asset_categories
UNION ALL SELECT 'fixed_assets', COUNT(*) FROM fixed_assets
UNION ALL SELECT 'asset_depreciation', COUNT(*) FROM asset_depreciation
UNION ALL SELECT 'expense_categories', COUNT(*) FROM expense_categories
UNION ALL SELECT 'expenses', COUNT(*) FROM expenses
UNION ALL SELECT 'quotations', COUNT(*) FROM quotations
UNION ALL SELECT 'quotation_items', COUNT(*) FROM quotation_items
UNION ALL SELECT 'leads', COUNT(*) FROM leads
UNION ALL SELECT 'opportunities', COUNT(*) FROM opportunities
ORDER BY table_name;

COMMIT;
