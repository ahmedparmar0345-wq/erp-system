-- ============================================================================
-- ERP Demo Data Reset & Seed Script
-- ============================================================================
-- This script clears all operational ERP data and inserts realistic demo data.
-- It does NOT touch auth/system tables: users, roles, system_settings,
-- email_templates, sessions, password_resets, audit_logs.
-- ============================================================================
BEGIN;

-- ============================================================================
-- 1. DISABLE TRIGGERS (bypass FK checks for clean wipe)
-- ============================================================================
SET session_replication_role = 'replica';

-- ============================================================================
-- 2. DELETE EXISTING DATA (reverse FK dependency order)
-- ============================================================================
-- Journal entry lines (child of journal_entries)
DELETE FROM asset_depreciation;
DELETE FROM asset_maintenance;
DELETE FROM journal_entry_lines;
DELETE FROM journal_entries;
DELETE FROM budget_items;
DELETE FROM budgets;
DELETE FROM cost_centers;
DELETE FROM bank_transactions;
DELETE FROM reconciliation_reports;
DELETE FROM bank_accounts;
DELETE FROM recurring_entry_lines;
DELETE FROM recurring_entries;

-- Inventory & warehouse
DELETE FROM inventory_transactions;
DELETE FROM product_warehouse_stock;
DELETE FROM stock_transfer_items;
DELETE FROM stock_transfers;
DELETE FROM warehouse_bins;

-- Purchase
DELETE FROM purchase_order_items;
DELETE FROM purchase_orders;

-- Sales
DELETE FROM sales_order_items;
DELETE FROM sales_orders;

-- Quotations
DELETE FROM quotation_items;
DELETE FROM quotations;

-- Invoicing
DELETE FROM invoice_items;
DELETE FROM invoices;
DELETE FROM payments;

-- Services
DELETE FROM service_invoice_items;
DELETE FROM service_invoices;
DELETE FROM service_allocations;

-- Returns
DELETE FROM sales_return_items;
DELETE FROM sales_returns;
DELETE FROM purchase_return_items;
DELETE FROM purchase_returns;
DELETE FROM credit_notes;

-- Approvals
DELETE FROM approval_logs;
DELETE FROM approval_requests;
DELETE FROM approval_steps;
DELETE FROM approval_workflows;

-- Projects & time
DELETE FROM time_entries;
DELETE FROM project_members;
DELETE FROM project_tasks;
DELETE FROM projects;

-- HR
DELETE FROM employee_documents;
DELETE FROM leave_requests;
DELETE FROM attendance;
DELETE FROM employees;
DELETE FROM leave_types;

-- Expenses
DELETE FROM expenses;
DELETE FROM expense_categories;

-- Fixed assets
DELETE FROM fixed_assets;
DELETE FROM asset_categories;

-- Services & products
DELETE FROM services;
DELETE FROM products;
DELETE FROM suppliers;
DELETE FROM customers;

-- Tax
DELETE FROM tax_rates;

-- CRM
DELETE FROM interactions;
DELETE FROM follow_ups;
DELETE FROM opportunities;
DELETE FROM leads;
DELETE FROM lead_statuses;
DELETE FROM lead_sources;

-- Accounting
DELETE FROM chart_of_accounts;

-- Warehouse master
DELETE FROM warehouses;

-- Return reasons
DELETE FROM return_reasons;

-- ============================================================================
-- 3. RE-ENABLE TRIGGERS
-- ============================================================================
SET session_replication_role = 'origin';

-- ============================================================================
-- 4. RESET SEQUENCES
-- ============================================================================
ALTER SEQUENCE companies_id_seq RESTART WITH 1;
ALTER SEQUENCE warehouses_id_seq RESTART WITH 1;
ALTER SEQUENCE customers_id_seq RESTART WITH 1;
ALTER SEQUENCE suppliers_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE sales_orders_id_seq RESTART WITH 1;
ALTER SEQUENCE sales_order_items_id_seq RESTART WITH 1;
ALTER SEQUENCE purchase_orders_id_seq RESTART WITH 1;
ALTER SEQUENCE purchase_order_items_id_seq RESTART WITH 1;
ALTER SEQUENCE inventory_transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE invoices_id_seq RESTART WITH 1;
ALTER SEQUENCE invoice_items_id_seq RESTART WITH 1;
ALTER SEQUENCE payments_id_seq RESTART WITH 1;
ALTER SEQUENCE chart_of_accounts_id_seq RESTART WITH 1;
ALTER SEQUENCE journal_entries_id_seq RESTART WITH 1;
ALTER SEQUENCE journal_entry_lines_id_seq RESTART WITH 1;
ALTER SEQUENCE employees_id_seq RESTART WITH 1;
ALTER SEQUENCE asset_categories_id_seq RESTART WITH 1;
ALTER SEQUENCE fixed_assets_id_seq RESTART WITH 1;
ALTER SEQUENCE tax_rates_id_seq RESTART WITH 1;
ALTER SEQUENCE expense_categories_id_seq RESTART WITH 1;
ALTER SEQUENCE expenses_id_seq RESTART WITH 1;
ALTER SEQUENCE quotations_id_seq RESTART WITH 1;
ALTER SEQUENCE quotation_items_id_seq RESTART WITH 1;
ALTER SEQUENCE services_id_seq RESTART WITH 1;
ALTER SEQUENCE leave_types_id_seq RESTART WITH 1;
ALTER SEQUENCE warehouse_bins_id_seq RESTART WITH 1;
ALTER SEQUENCE product_warehouse_stock_id_seq RESTART WITH 1;
ALTER SEQUENCE stock_transfers_id_seq RESTART WITH 1;
ALTER SEQUENCE stock_transfer_items_id_seq RESTART WITH 1;

-- ============================================================================
-- 5. COMPANIES / LEGAL ENTITIES
-- ============================================================================
INSERT INTO companies (name, tax_id, email, phone, address, currency) VALUES
('Acme Corporation', 'US45-7890123', 'corporate@acmecorp.com', '+1 (212) 555-0199', '350 Fifth Avenue, Suite 3200, New York, NY 10118', 'USD'),
('GlobalTech Industries', 'US87-6543210', 'info@globaltech.io', '+1 (408) 555-0420', '2025 Innovation Drive, San Jose, CA 95134', 'USD'),
('EuroPacific Manufacturing GmbH', 'DE329876543', 'kontakt@europacific.de', '+49 30 5550 1234', 'Industriestrasse 42, 10557 Berlin, Germany', 'EUR'),
('Nippon Precision Trading', 'JP500-1234567', 'info@nippon-precision.jp', '+81 3 5550 9876', '2-15-8 Shibadaimon, Minato-ku, Tokyo 105-0012', 'JPY');

-- ============================================================================
-- 6. TAX RATES
-- ============================================================================
INSERT INTO tax_rates (company_id, name, rate, type, is_default, is_active, description) VALUES
(1, 'Standard VAT', 20.00, 'VAT', true, true, 'Standard VAT rate 20%'),
(1, 'Reduced VAT', 5.00, 'VAT', false, true, 'Reduced VAT rate 5%'),
(1, 'Zero Rated', 0.00, 'VAT', false, true, 'Zero rated supplies'),
(2, 'Standard VAT', 20.00, 'VAT', true, true, 'Standard VAT rate 20%'),
(3, 'German VAT 19%', 19.00, 'VAT', true, true, 'Standard German VAT rate'),
(4, 'Japanese Consumption Tax', 10.00, 'JCT', true, true, 'Standard JCT rate 10%');

-- ============================================================================
-- 7. WAREHOUSES / LOCATIONS
-- ============================================================================
INSERT INTO warehouses (company_id, code, name, address, city, state, country, postal_code, is_default, is_active) VALUES
(1, 'WH-NYC', 'Main Warehouse NYC', '350 Fifth Avenue, Basement B2', 'New York', 'NY', 'USA', '10118', true, true),
(1, 'WH-NWK', 'East Coast Distribution', '100 Port Street', 'Newark', 'NJ', 'USA', '07114', false, true),
(1, 'WH-LAX', 'West Coast Logistics Hub', '7500 World Way West', 'Los Angeles', 'CA', 'USA', '90045', false, true),
(2, 'GT-SJC', 'San Jose Headquarters Warehouse', '2025 Innovation Drive', 'San Jose', 'CA', 'USA', '95134', true, true),
(2, 'GT-AUS', 'Austin Distribution Center', '8900 Spectrum Drive', 'Austin', 'TX', 'USA', '78702', false, true),
(3, 'EP-BER', 'Berlin Central Warehouse', 'Industriestrasse 42', 'Berlin', NULL, 'Germany', '10557', true, true),
(4, 'NP-TOK', 'Tokyo Logistics Center', '2-15-8 Shibadaimon', 'Minato-ku', 'Tokyo', 'Japan', '105-0012', true, true);

-- ============================================================================
-- 8. PRODUCT CATEGORIES (create if not exists)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_categories') THEN
    CREATE TABLE product_categories (
      id SERIAL PRIMARY KEY,
      company_id INTEGER REFERENCES companies(id),
      code VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(company_id, code)
    );
  END IF;
END $$;

INSERT INTO product_categories (company_id, code, name, description) VALUES
(1, 'ELEC', 'Electronics & Components', 'Electronic components, circuit boards, power supplies'),
(1, 'OFFICE', 'Office Supplies', 'Paper, organizers, stationery and office essentials'),
(1, 'INDUST', 'Industrial Equipment', 'Heavy machinery, pumps, conveyor systems'),
(1, 'PACK', 'Packaging Materials', 'Boxes, wraps, tapes and shipping supplies'),
(1, 'SAFETY', 'Safety & Protective Gear', 'PPE, safety glasses, hard hats and protection equipment'),
(1, 'COMP', 'Computer Hardware', 'SSDs, monitors, peripherals and computing hardware'),
(1, 'FURN', 'Furniture & Fixtures', 'Office furniture, desks, chairs, shelving'),
(1, 'CLEAN', 'Cleaning & Maintenance', 'Industrial cleaners, janitorial supplies');

-- ============================================================================
-- 9. PRODUCTS / ITEMS
-- ============================================================================
INSERT INTO products (company_id, sku, name, description, unit_price, cost_price, current_stock, reorder_level) VALUES
(1, 'ELEC-001', 'Logic Board X1000', 'High-performance logic controller board with 32-bit ARM Cortex processor', 245.00, 150.00, 340, 50),
(1, 'ELEC-002', 'USB-C Hub 7-in-1', 'Multi-port USB-C hub with HDMI, SD card, 3x USB 3.0 and PD 100W', 34.99, 18.50, 520, 100),
(1, 'ELEC-003', 'Industrial Power Supply 24V', 'MeanWell 24V DC industrial power supply unit 240W', 189.00, 110.00, 85, 20),
(1, 'ELEC-004', 'Servo Motor Driver D200', 'Digital servo drive 200W with CANopen communication', 520.00, 340.00, 40, 10),
(1, 'ELEC-005', 'Temperature Sensor PT100', 'RTD temperature probe PT100 3-wire -50 to 250C', 18.75, 8.20, 1200, 200),
(1, 'OFFICE-001', 'Premium Bond Paper A4 5000pk', '80gsm premium white bond paper for professional printing', 52.00, 31.00, 200, 40),
(1, 'OFFICE-002', 'Executive Desk Organizer', 'Wooden desk organizer with 8 compartments and phone stand', 28.50, 14.75, 150, 25),
(1, 'OFFICE-003', 'Mesh Back Office Chair', 'Ergonomic mesh back office chair with lumbar support', 299.00, 175.00, 45, 10),
(1, 'INDUST-001', 'Hydraulic Pump H40', 'Industrial hydraulic pump 40L/min 200 bar', 1450.00, 875.00, 20, 5),
(1, 'INDUST-002', 'Conveyor Belt Roller 12"', 'Galvanized steel conveyor roller 12 inch length', 67.50, 38.00, 500, 100),
(1, 'INDUST-003', 'High Velocity Floor Fan 20"', 'Industrial 20-inch floor fan 3-speed 7000 CFM', 185.00, 98.00, 65, 15),
(1, 'PACK-001', 'Corrugated Box 12x10x8 100pk', 'Single wall corrugated cardboard shipping boxes 32 ECT', 45.00, 24.00, 300, 60),
(1, 'PACK-002', 'Stretch Wrap 500mm x 300m', 'Industrial grade stretch wrap film 20 micron', 32.00, 17.50, 180, 30),
(1, 'PACK-003', 'Packing Tape 48mm x 100m 36pk', 'Clear acrylic packing tape rolls case of 36', 28.00, 14.00, 90, 20),
(1, 'SAFETY-001', 'Anti-Fog Safety Goggles', 'Clear anti-fog polycarbonate safety goggles ANSI Z87.1', 8.99, 4.50, 800, 150),
(1, 'SAFETY-002', 'ANSI Hard Hat Type I', 'High-density polyethylene hard hat with 6-point suspension', 15.50, 7.25, 350, 75),
(1, 'SAFETY-003', 'Nitrile Gloves Box 100pk', 'Powder-free nitrile exam gloves size M 100 pieces', 12.00, 6.80, 600, 120),
(1, 'COMP-001', 'SSD 1TB NVMe M.2', 'High-speed NVMe PCIe Gen4 SSD 1TB 7000MB/s read', 129.00, 82.00, 220, 40),
(1, 'COMP-002', '27" 4K UHD Monitor', '27-inch IPS 4K monitor 3840x2160 USB-C 60W PD', 449.00, 295.00, 30, 10),
(1, 'COMP-003', 'Wireless Ergonomic Keyboard', 'Full-size wireless ergonomic split keyboard with wrist rest', 89.99, 52.00, 115, 25),
(1, 'FURN-001', 'Electric Standing Desk', 'Adjustable height electric standing desk 60x30 inch walnut', 695.00, 410.00, 25, 5),
(1, 'FURN-002', 'Metal 6-Tier Bookshelf', 'Industrial style steel bookshelf 6 tiers 72 inch height', 129.00, 68.00, 55, 15),
(1, 'CLEAN-001', 'Industrial Cleaner 5Gal', 'Concentrated industrial degreaser and cleaner 5 gallon pail', 38.00, 19.50, 110, 20),
(1, 'CLEAN-002', 'Microfiber Cloth 50pk', 'Premium microfiber cleaning cloths 16x16 inches assorted colors', 22.00, 11.00, 400, 80);

-- ============================================================================
-- 10. CUSTOMERS
-- ============================================================================
INSERT INTO customers (company_id, name, email, phone, billing_address, shipping_address) VALUES
(1, 'Thompson Electronics Inc.', 'accounts@thompsonelec.com', '+1 (312) 555-0188', '455 W Grand Ave, Chicago, IL 60654', '455 W Grand Ave, Chicago, IL 60654'),
(1, 'BrightPath Construction LLC', 'ap@brightpathbuild.com', '+1 (305) 555-0234', '1200 Brickell Ave Suite 800, Miami, FL 33131', '875 NW 12th St, Miami, FL 33136'),
(1, 'Harbor Freight Logistics', 'procurement@hflogistics.com', '+1 (206) 555-0456', '2001 Western Ave Suite 500, Seattle, WA 98121', '3400 Port Quay Rd, Seattle, WA 98134'),
(1, 'Crescent City Medical Supplies', 'orders@crescentmed.com', '+1 (504) 555-0678', '650 Poydras St Suite 1500, New Orleans, LA 70130', '650 Poydras St Suite 1500, New Orleans, LA 70130'),
(1, 'Pacific Northwest Retail Group', 'purchasing@pnwretail.com', '+1 (503) 555-0890', '1000 SW Broadway Suite 200, Portland, OR 97205', '4500 NW St Helens Rd, Portland, OR 97210'),
(1, 'Atlas Industrial Supply', 'orders@atlasind.com', '+1 (713) 555-0101', '1301 McKinney St Suite 300, Houston, TX 77010', '8901 East Freeway, Houston, TX 77029'),
(1, 'Premium Office Solutions', 'buyers@premiumoffice.com', '+1 (617) 555-0321', '100 Federal St Floor 15, Boston, MA 02110', '200 South St, Boston, MA 02111'),
(1, 'Greenfield Agricultural Coop', 'purchasing@greenfieldag.com', '+1 (559) 555-0765', '2500 W Shaw Ave Suite 100, Fresno, CA 93711', '14500 S Bethel Ave, Fresno, CA 93706');

-- ============================================================================
-- 11. SUPPLIERS
-- ============================================================================
INSERT INTO suppliers (company_id, name, email, phone, address) VALUES
(1, 'Precision Components Ltd.', 'sales@precisioncomponents.com', '+1 (847) 555-0110', '550 W Algonquin Rd, Arlington Heights, IL 60005'),
(1, 'Global Raw Materials Inc.', 'info@globalrawmaterials.com', '+1 (281) 555-0220', '1200 Smith St Suite 2500, Houston, TX 77002'),
(1, 'TechSource International', 'orders@techsource-intl.com', '+1 (510) 555-0330', '47200 Bayside Pkwy, Fremont, CA 94538'),
(1, 'Pacific Rim Traders', 'info@pacificrimtraders.com', '+1 (213) 555-0440', '800 W 6th St Suite 800, Los Angeles, CA 90017'),
(1, 'Midwest Packaging Solutions', 'sales@midwestpack.com', '+1 (314) 555-0550', '100 S 4th St Suite 600, St. Louis, MO 63102'),
(1, 'Quality Parts Manufacturing', 'quotes@qualityparts.com', '+1 (216) 555-0660', '200 Public Square Suite 1500, Cleveland, OH 44114');

-- ============================================================================
-- 12. SERVICES
-- ============================================================================
INSERT INTO services (company_id, name, description, category, unit_price, is_active) VALUES
(1, 'Equipment Installation', 'On-site industrial equipment installation and setup', 'Installation', 2500.00, true),
(1, 'Preventive Maintenance', 'Quarterly preventive maintenance service for all equipment', 'Maintenance', 1200.00, true),
(1, 'Technical Support - Bronze', 'Email and phone support 9-5 weekdays', 'Support', 500.00, true),
(1, 'Technical Support - Silver', 'Priority support with 4-hour response 24/7', 'Support', 1500.00, true),
(1, 'Technical Support - Gold', 'Dedicated support engineer on-call 24/7/365', 'Support', 4000.00, true),
(1, 'Warehouse Layout Consulting', 'Professional warehouse layout optimization consulting', 'Consulting', 3500.00, true);

-- ============================================================================
-- 13. EXPENSE CATEGORIES
-- ============================================================================
INSERT INTO expense_categories (company_id, name, description) VALUES
(1, 'Office Rent', 'Monthly office and warehouse rent payments'),
(1, 'Utilities', 'Electricity, water, gas, internet'),
(1, 'Office Supplies', 'Paper, toner, stationery and kitchen supplies'),
(1, 'Travel & Meals', 'Business travel, client meetings, team lunches'),
(1, 'Software Licenses', 'Annual/monthly software subscriptions'),
(1, 'Equipment Maintenance', 'Repair and maintenance of equipment'),
(1, 'Shipping & Freight', 'Outbound shipping and freight costs'),
(1, 'Employee Salaries', 'Monthly payroll and bonuses'),
(1, 'Marketing & Advertising', 'Digital ads, print, trade shows'),
(1, 'Insurance', 'General liability, property, worker comp insurance');

-- ============================================================================
-- 14. SALES ORDERS
-- ============================================================================
INSERT INTO sales_orders (company_id, customer_id, order_number, order_date, status, subtotal, tax_total, grand_total, notes, created_by, payment_status) VALUES
(1, 1, 'SO-2026-0001', '2026-01-12', 'invoiced', 3659.50, 731.90, 4391.40, 'Quarterly electronics components order', 1, 'paid'),
(1, 2, 'SO-2026-0002', '2026-01-18', 'invoiced', 10890.00, 2178.00, 13068.00, 'Industrial equipment for new construction site', 1, 'paid'),
(1, 3, 'SO-2026-0003', '2026-01-25', 'shipped', 4598.00, 919.60, 5517.60, 'Packaging supplies monthly restock', 1, 'unpaid'),
(1, 4, 'SO-2026-0004', '2026-02-03', 'invoiced', 4994.00, 998.80, 5992.80, 'Safety equipment for hospital network', 2, 'paid'),
(1, 5, 'SO-2026-0005', '2026-02-10', 'confirmed', 8450.00, 1690.00, 10140.00, 'Office furniture for new retail HQ', 2, 'unpaid'),
(1, 6, 'SO-2026-0006', '2026-02-18', 'invoiced', 17525.00, 3505.00, 21030.00, 'Industrial pump order for refinery project', 1, 'paid'),
(1, 7, 'SO-2026-0007', '2026-02-25', 'invoiced', 14275.00, 2855.00, 17130.00, 'Computer hardware upgrade for law firm', 1, 'paid'),
(1, 8, 'SO-2026-0008', '2026-03-04', 'draft', 3234.00, 646.80, 3880.80, 'Equipment and safety gear for new harvest season', 2, 'unpaid'),
(1, 1, 'SO-2026-0009', '2026-03-11', 'confirmed', 6675.00, 1335.00, 8010.00, 'Electronic components for R&D project', 1, 'unpaid'),
(1, 3, 'SO-2026-0010', '2026-03-18', 'draft', 12350.00, 2470.00, 14820.00, 'Full warehouse automation equipment order', 2, 'unpaid');

-- ============================================================================
-- 15. SALES ORDER ITEMS
-- ============================================================================
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
-- SO-0001: Thompson Electronics
(1, 1, 5, 245.00, 0.00, 1225.00),
(1, 2, 20, 34.99, 0.00, 699.80),
(1, 5, 50, 18.75, 0.00, 937.50),
(1, 18, 6, 129.00, 5.00, 735.30),
(1, 20, 8, 89.99, 0.00, 719.92),
(2, 9, 3, 1450.00, 0.00, 4350.00),
(2, 10, 50, 67.50, 0.00, 3375.00),
(2, 11, 10, 185.00, 5.00, 1757.50),
(2, 19, 2, 449.00, 0.00, 898.00),
(2, 3, 3, 189.00, 0.00, 567.00),
(3, 12, 50, 45.00, 0.00, 2250.00),
(3, 13, 30, 32.00, 0.00, 960.00),
(3, 14, 40, 28.00, 10.00, 1008.00),
(3, 23, 15, 22.00, 0.00, 330.00),
(4, 15, 200, 8.99, 5.00, 1708.10),
(4, 16, 80, 15.50, 0.00, 1240.00),
(4, 17, 150, 12.00, 0.00, 1800.00),
(4, 22, 8, 129.00, 0.00, 1032.00),
(5, 21, 5, 695.00, 0.00, 3475.00),
(5, 8, 8, 299.00, 5.00, 2272.40),
(5, 22, 15, 129.00, 0.00, 1935.00),
(5, 7, 20, 28.50, 0.00, 570.00),
(6, 9, 8, 1450.00, 5.00, 11020.00),
(6, 4, 10, 520.00, 0.00, 5200.00),
(6, 11, 5, 185.00, 0.00, 925.00),
(6, 3, 8, 189.00, 0.00, 1512.00),
(7, 18, 30, 129.00, 5.00, 3676.50),
(7, 19, 15, 449.00, 5.00, 6398.25),
(7, 20, 30, 89.99, 0.00, 2699.70),
(7, 1, 5, 245.00, 10.00, 1102.50),
(7, 8, 4, 299.00, 0.00, 1196.00),
(8, 15, 100, 8.99, 0.00, 899.00),
(8, 16, 60, 15.50, 0.00, 930.00),
(8, 22, 10, 129.00, 0.00, 1290.00),
(9, 2, 50, 34.99, 0.00, 1749.50),
(9, 5, 120, 18.75, 0.00, 2250.00),
(9, 1, 8, 245.00, 0.00, 1960.00),
(10, 9, 5, 1450.00, 0.00, 7250.00),
(10, 10, 40, 67.50, 0.00, 2700.00),
(10, 11, 12, 185.00, 0.00, 2220.00);

-- ============================================================================
-- 16. PURCHASE ORDERS
-- ============================================================================
INSERT INTO purchase_orders (company_id, supplier_id, po_number, order_date, expected_delivery_date, status, subtotal, tax_total, grand_total, total_amount, notes, created_by, payment_status) VALUES
(1, 1, 'PO-2026-0001', '2026-01-05', '2026-01-15', 'received', 28000.00, 5600.00, 33600.00, 33600.00, 'Bulk order of logic boards and servos', 1, 'paid'),
(1, 3, 'PO-2026-0002', '2026-01-10', '2026-01-22', 'received', 14250.00, 2850.00, 17100.00, 17100.00, 'SSDs and monitors for warehouse upgrade', 1, 'paid'),
(1, 5, 'PO-2026-0003', '2026-01-28', '2026-02-08', 'received', 8850.00, 1770.00, 10620.00, 10620.00, 'Packaging materials quarterly order', 1, 'paid'),
(1, 2, 'PO-2026-0004', '2026-02-05', '2026-02-18', 'received', 19500.00, 3900.00, 23400.00, 23400.00, 'Raw materials for manufacturing', 2, 'paid'),
(1, 4, 'PO-2026-0005', '2026-02-15', '2026-03-01', 'received', 7600.00, 1520.00, 9120.00, 9120.00, 'Safety equipment from Pacific Rim', 1, 'paid'),
(1, 6, 'PO-2026-0006', '2026-02-22', '2026-03-05', 'received', 12400.00, 2480.00, 14880.00, 14880.00, 'Industrial fans and conveyor rollers', 2, 'paid'),
(1, 1, 'PO-2026-0007', '2026-03-02', '2026-03-12', 'received', 32000.00, 6400.00, 38400.00, 38400.00, 'Servo drives and sensors restock', 1, 'paid'),
(1, 3, 'PO-2026-0008', '2026-03-10', '2026-03-22', 'sent', 9800.00, 1960.00, 11760.00, 11760.00, 'Computer peripherals and monitors', 1, 'unpaid'),
(1, 5, 'PO-2026-0009', '2026-03-15', '2026-03-25', 'sent', 5600.00, 1120.00, 6720.00, 6720.00, 'Stretch wrap and boxes restock', 2, 'unpaid'),
(1, 1, 'PO-2026-0010', '2026-03-20', '2026-04-01', 'draft', 18500.00, 3700.00, 22200.00, 22200.00, 'Q2 electronics components replenishment', 1, 'unpaid');

-- ============================================================================
-- 17. PURCHASE ORDER ITEMS
-- ============================================================================
INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity) VALUES
-- PO-0001: Precision Components
(1, 1, 80, 150.00, 12000.00, 80),
(1, 4, 40, 340.00, 13600.00, 40),
(1, 3, 15, 110.00, 1650.00, 15),
(1, 5, 100, 8.20, 820.00, 100),
(2, 18, 50, 82.00, 4100.00, 50),
(2, 19, 15, 295.00, 4425.00, 15),
(2, 20, 60, 52.00, 3120.00, 60),
(3, 12, 100, 24.00, 2400.00, 100),
(3, 13, 80, 17.50, 1400.00, 80),
(3, 14, 60, 14.00, 840.00, 60),
(3, 23, 100, 11.00, 1100.00, 100),
(4, 8, 30, 175.00, 5250.00, 30),
(4, 21, 15, 410.00, 6150.00, 15),
(4, 22, 50, 68.00, 3400.00, 50),
(4, 7, 40, 14.75, 590.00, 40),
(5, 15, 300, 4.50, 1350.00, 300),
(5, 16, 200, 7.25, 1450.00, 200),
(5, 17, 400, 6.80, 2720.00, 400),
(6, 11, 40, 98.00, 3920.00, 40),
(6, 10, 120, 38.00, 4560.00, 120),
(6, 3, 20, 110.00, 2200.00, 20),
(7, 4, 60, 340.00, 20400.00, 60),
(7, 1, 50, 150.00, 7500.00, 50),
(7, 5, 500, 8.20, 4100.00, 500),
(8, 18, 40, 82.00, 3280.00, 0),
(8, 20, 60, 52.00, 3120.00, 0),
(8, 19, 8, 295.00, 2360.00, 0),
(9, 13, 60, 17.50, 1050.00, 0),
(9, 12, 80, 24.00, 1920.00, 0),
(9, 14, 50, 14.00, 700.00, 0),
(10, 2, 200, 18.50, 3700.00, 0),
(10, 3, 50, 110.00, 5500.00, 0),
(10, 4, 20, 340.00, 6800.00, 0);

-- ============================================================================
-- 18. INVENTORY TRANSACTIONS
-- ============================================================================
INSERT INTO inventory_transactions (company_id, product_id, type, quantity, reference_type, reference_id, warehouse_id) VALUES
-- Initial stock adjustments
(1, 1, 'in', 200, 'initial_stock', NULL, 1),
(1, 2, 'in', 500, 'initial_stock', NULL, 1),
(1, 3, 'in', 100, 'initial_stock', NULL, 1),
(1, 4, 'in', 80, 'initial_stock', NULL, 1),
(1, 5, 'in', 1000, 'initial_stock', NULL, 1),
(1, 6, 'in', 300, 'initial_stock', NULL, 1),
(1, 7, 'in', 200, 'initial_stock', NULL, 1),
(1, 8, 'in', 50, 'initial_stock', NULL, 1),
(1, 9, 'in', 30, 'initial_stock', NULL, 1),
(1, 10, 'in', 500, 'initial_stock', NULL, 1),
(1, 11, 'in', 80, 'initial_stock', NULL, 1),
(1, 12, 'in', 400, 'initial_stock', NULL, 1),
(1, 13, 'in', 250, 'initial_stock', NULL, 1),
(1, 14, 'in', 150, 'initial_stock', NULL, 1),
(1, 15, 'in', 600, 'initial_stock', NULL, 1),
(1, 16, 'in', 400, 'initial_stock', NULL, 1),
(1, 17, 'in', 500, 'initial_stock', NULL, 1),
(1, 18, 'in', 300, 'initial_stock', NULL, 1),
(1, 19, 'in', 40, 'initial_stock', NULL, 1),
(1, 20, 'in', 150, 'initial_stock', NULL, 1),
(1, 21, 'in', 30, 'initial_stock', NULL, 1),
(1, 22, 'in', 80, 'initial_stock', NULL, 1),
(1, 23, 'in', 150, 'initial_stock', NULL, 1),
(1, 24, 'in', 500, 'initial_stock', NULL, 1),
-- PO Received stock
(1, 1, 'in', 80, 'purchase_order', 1, 1),
(1, 4, 'in', 40, 'purchase_order', 1, 1),
(1, 3, 'in', 15, 'purchase_order', 1, 1),
(1, 5, 'in', 100, 'purchase_order', 1, 1),
(1, 18, 'in', 50, 'purchase_order', 2, 1),
(1, 19, 'in', 15, 'purchase_order', 2, 1),
(1, 20, 'in', 60, 'purchase_order', 2, 1),
(1, 12, 'in', 100, 'purchase_order', 3, 2),
(1, 13, 'in', 80, 'purchase_order', 3, 2),
(1, 14, 'in', 60, 'purchase_order', 2, 2),
(1, 23, 'in', 100, 'purchase_order', 3, 2),
(1, 15, 'in', 300, 'purchase_order', 5, 3),
(1, 16, 'in', 200, 'purchase_order', 5, 3),
(1, 17, 'in', 400, 'purchase_order', 5, 3),
(1, 8, 'in', 30, 'purchase_order', 4, 1),
(1, 21, 'in', 15, 'purchase_order', 4, 1),
(1, 22, 'in', 50, 'purchase_order', 4, 1),
(1, 11, 'in', 40, 'purchase_order', 6, 3),
(1, 10, 'in', 120, 'purchase_order', 6, 3),
(1, 3, 'in', 20, 'purchase_order', 6, 1),
(1, 4, 'in', 60, 'purchase_order', 7, 1),
(1, 1, 'in', 50, 'purchase_order', 7, 1),
(1, 5, 'in', 500, 'purchase_order', 7, 1),
-- Sales order outbound
(1, 1, 'out', 5, 'sales_order', 1, 1),
(1, 2, 'out', 20, 'sales_order', 1, 1),
(1, 5, 'out', 50, 'sales_order', 1, 1),
(1, 18, 'out', 6, 'sales_order', 1, 1),
(1, 20, 'out', 8, 'sales_order', 1, 1),
(1, 9, 'out', 3, 'sales_order', 2, 1),
(1, 10, 'out', 50, 'sales_order', 2, 3),
(1, 11, 'out', 10, 'sales_order', 2, 3),
(1, 19, 'out', 2, 'sales_order', 2, 1),
(1, 3, 'out', 3, 'sales_order', 2, 1),
(1, 12, 'out', 50, 'sales_order', 3, 2),
(1, 13, 'out', 30, 'sales_order', 3, 2),
(1, 14, 'out', 40, 'sales_order', 3, 2),
(1, 23, 'out', 15, 'sales_order', 3, 2),
(1, 15, 'out', 200, 'sales_order', 4, 3),
(1, 16, 'out', 80, 'sales_order', 4, 3),
(1, 17, 'out', 150, 'sales_order', 4, 3),
(1, 22, 'out', 8, 'sales_order', 4, 1),
(1, 9, 'out', 8, 'sales_order', 6, 1),
(1, 4, 'out', 10, 'sales_order', 6, 1),
(1, 3, 'out', 8, 'sales_order', 6, 1),
(1, 11, 'out', 5, 'sales_order', 6, 3),
(1, 18, 'out', 30, 'sales_order', 7, 1),
(1, 19, 'out', 15, 'sales_order', 7, 1),
(1, 20, 'out', 30, 'sales_order', 7, 1),
(1, 1, 'out', 5, 'sales_order', 7, 1),
(1, 8, 'out', 4, 'sales_order', 7, 1);

-- ============================================================================
-- 19. INVOICES (Sales)
-- ============================================================================
INSERT INTO invoices (company_id, invoice_number, sales_order_id, customer_id, invoice_date, due_date, status, subtotal, tax_total, discount_total, grand_total, amount_paid, payment_terms, notes, created_by) VALUES
(1, 'INV-2026-0001', 1, 1, '2026-01-15', '2026-02-14', 'paid', 3659.50, 731.90, 0.00, 4391.40, 4391.40, 'Net 30', 'January electronics components invoice', 1),
(1, 'INV-2026-0002', 2, 2, '2026-01-20', '2026-02-19', 'paid', 10890.00, 2178.00, 0.00, 13068.00, 13068.00, 'Net 30', 'Construction equipment invoice - BrightPath', 1),
(1, 'INV-2026-0003', 4, 4, '2026-02-05', '2026-03-07', 'paid', 4994.00, 998.80, 0.00, 5992.80, 5992.80, 'Net 30', 'Safety equipment for Crescent Medical', 1),
(1, 'INV-2026-0004', 6, 6, '2026-02-20', '2026-03-22', 'paid', 17525.00, 3505.00, 0.00, 21030.00, 21030.00, 'Net 30', 'Industrial pumps and equipment - Atlas Industrial', 1),
(1, 'INV-2026-0005', 7, 7, '2026-02-27', '2026-03-29', 'paid', 14275.00, 2855.00, 0.00, 17130.00, 17130.00, 'Net 30', 'Hardware upgrade for Premium Office Solutions', 1),
(1, 'INV-2026-0006', 3, 3, '2026-01-28', '2026-02-27', 'sent', 4598.00, 919.60, 0.00, 5517.60, 0.00, 'Net 30', 'Packaging supplies Harbor Freight Logistics', 1),
(1, 'INV-2026-0007', 5, 5, '2026-02-12', '2026-03-14', 'sent', 8450.00, 1690.00, 0.00, 10140.00, 0.00, 'Net 30', 'Office furniture for PNW Retail Group', 1);

-- ============================================================================
-- 20. INVOICE ITEMS
-- ============================================================================
INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total) VALUES
(1, 1, 'Logic Board X1000', 5, 245.00, 0.00, 20.00, 1225.00),
(1, 2, 'USB-C Hub 7-in-1', 20, 34.99, 0.00, 20.00, 699.80),
(1, 5, 'Temperature Sensor PT100', 50, 18.75, 0.00, 20.00, 937.50),
(1, 18, 'SSD 1TB NVMe M.2', 6, 129.00, 5.00, 20.00, 735.30),
(1, 20, 'Wireless Ergonomic Keyboard', 8, 89.99, 0.00, 20.00, 719.92),
(2, 9, 'Hydraulic Pump H40', 3, 1450.00, 0.00, 20.00, 4350.00),
(2, 10, 'Conveyor Belt Roller 12"', 50, 67.50, 0.00, 20.00, 3375.00),
(2, 11, 'High Velocity Floor Fan 20"', 10, 185.00, 5.00, 20.00, 1757.50),
(2, 19, '27" 4K UHD Monitor', 2, 449.00, 0.00, 20.00, 898.00),
(2, 3, 'Industrial Power Supply 24V', 3, 189.00, 0.00, 20.00, 567.00),
(3, 15, 'Anti-Fog Safety Goggles', 200, 8.99, 5.00, 20.00, 1708.10),
(3, 16, 'ANSI Hard Hat Type I', 80, 15.50, 0.00, 20.00, 1240.00),
(3, 17, 'Nitrile Gloves Box 100pk', 150, 12.00, 0.00, 20.00, 1800.00),
(3, 22, 'Metal 6-Tier Bookshelf', 8, 129.00, 0.00, 20.00, 1032.00),
(4, 9, 'Hydraulic Pump H40', 8, 1450.00, 5.00, 20.00, 11020.00),
(4, 4, 'Servo Motor Driver D200', 10, 520.00, 0.00, 20.00, 5200.00),
(4, 11, 'High Velocity Floor Fan 20"', 5, 185.00, 0.00, 20.00, 925.00),
(4, 3, 'Industrial Power Supply 24V', 8, 189.00, 0.00, 20.00, 1512.00),
(5, 18, 'SSD 1TB NVMe M.2', 30, 129.00, 5.00, 20.00, 3676.50),
(5, 19, '27" 4K UHD Monitor', 15, 449.00, 5.00, 20.00, 6398.25),
(5, 20, 'Wireless Ergonomic Keyboard', 30, 89.99, 0.00, 20.00, 2699.70),
(5, 1, 'Logic Board X1000', 5, 245.00, 10.00, 20.00, 1102.50),
(5, 8, 'Mesh Back Office Chair', 4, 299.00, 0.00, 20.00, 1196.00);

-- ============================================================================
-- 21. PAYMENTS
-- ============================================================================
INSERT INTO payments (company_id, invoice_id, payment_number, payment_date, amount, payment_method, reference_number, notes, created_by) VALUES
(1, 1, 'PAY-2026-0001', '2026-01-28', 4391.40, 'bank_transfer', 'WIRE-20260128-001', 'Payment for INV-2026-0001 - Thompson Electronics', 1),
(1, 2, 'PAY-2026-0002', '2026-02-10', 13068.00, 'bank_transfer', 'WIRE-20260210-002', 'Payment for INV-2026-0002 - BrightPath Construction', 1),
(1, 3, 'PAY-2026-0003', '2026-02-25', 5992.80, 'check', 'CHK-20260225-004', 'Check received for Crescent Medical supplies', 1),
(1, 4, 'PAY-2026-0004', '2026-03-05', 21030.00, 'bank_transfer', 'WIRE-20260305-005', 'Payment for INV-2026-0004 - Atlas Industrial', 1),
(1, 5, 'PAY-2026-0005', '2026-03-15', 17130.00, 'bank_transfer', 'WIRE-20260315-006', 'Payment for INV-2026-0005 - Premium Office Solutions', 1);

-- ============================================================================
-- 22. CHART OF ACCOUNTS
-- ============================================================================
INSERT INTO chart_of_accounts (company_id, account_code, account_name, account_type, parent_account_id, description, is_active) VALUES
-- Assets
(1, '1000', 'Current Assets', 'asset', NULL, 'Current asset accounts', true),
(1, '1100', 'Cash & Cash Equivalents', 'asset', 1, 'Cash on hand and in banks', true),
(1, '1101', 'Operating Account', 'asset', 2, 'Main business checking account', true),
(1, '1102', 'Petty Cash', 'asset', 2, 'Petty cash fund', true),
(1, '1200', 'Accounts Receivable', 'asset', 1, 'Money owed by customers', true),
(1, '1300', 'Inventory', 'asset', 1, 'Product inventory value', true),
(1, '1400', 'Fixed Assets', 'asset', NULL, 'Long-term tangible assets', true),
(1, '1401', 'Buildings & Improvements', 'asset', 7, 'Warehouse and office buildings', true),
(1, '1402', 'Machinery & Equipment', 'asset', 7, 'Manufacturing and warehouse equipment', true),
(1, '1403', 'Computer Hardware', 'asset', 7, 'Servers, computers, monitors', true),
(1, '1404', 'Furniture & Fixtures', 'asset', 7, 'Office furniture and fixtures', true),
(1, '1405', 'Vehicles', 'asset', 7, 'Company vehicles', true),
-- Liabilities
(1, '2000', 'Current Liabilities', 'liability', NULL, 'Short-term obligations', true),
(1, '2100', 'Accounts Payable', 'liability', 12, 'Money owed to suppliers', true),
(1, '2200', 'Sales Tax Payable', 'liability', 12, 'VAT/sales tax collected', true),
(1, '2300', 'Accrued Expenses', 'liability', 12, 'Accrued salaries and expenses', true),
-- Equity
(1, '3000', 'Equity', 'equity', NULL, 'Shareholder equity', true),
(1, '3100', 'Common Stock', 'equity', 17, 'Paid-in capital', true),
(1, '3200', 'Retained Earnings', 'equity', 17, 'Accumulated retained earnings', true),
(1, '3300', 'Current Year Earnings', 'equity', 17, 'Current fiscal year profit/loss', true),
-- Revenue
(1, '4000', 'Revenue', 'revenue', NULL, 'Income from operations', true),
(1, '4100', 'Product Sales', 'revenue', 21, 'Revenue from product sales', true),
(1, '4200', 'Service Revenue', 'revenue', 21, 'Revenue from services rendered', true),
(1, '4300', 'Shipping & Handling Income', 'revenue', 21, 'Shipping fees charged to customers', true),
-- Expenses
(1, '5000', 'Cost of Goods Sold', 'expense', NULL, 'Direct costs of products sold', true),
(1, '5100', 'COGS - Products', 'expense', 25, 'Product purchase and manufacturing costs', true),
(1, '5200', 'Operating Expenses', 'expense', NULL, 'General operating expenses', true),
(1, '5201', 'Salaries & Wages', 'expense', 27, 'Employee compensation', true),
(1, '5202', 'Rent & Utilities', 'expense', 27, 'Office and warehouse rent, utilities', true),
(1, '5203', 'Office Supplies Expense', 'expense', 27, 'Office and administrative supplies', true),
(1, '5204', 'Shipping & Freight Expense', 'expense', 27, 'Outbound shipping costs', true),
(1, '5205', 'Marketing & Advertising', 'expense', 27, 'Advertising and promotional costs', true),
(1, '5206', 'Insurance Expense', 'expense', 27, 'Insurance premiums', true),
(1, '5207', 'Depreciation', 'expense', 27, 'Asset depreciation expense', true),
(1, '5208', 'Professional Services', 'expense', 27, 'Legal, accounting, consulting fees', true),
(1, '5299', 'Miscellaneous Expenses', 'expense', 27, 'Other operating expenses', true);

-- ============================================================================
-- 23. JOURNAL ENTRIES
-- ============================================================================
INSERT INTO journal_entries (company_id, entry_date, total_debit, total_credit, voucher_no, voucher_type, status, description, created_by) VALUES
(1, '2026-01-31', 4391.40, 4391.40, 'JV-2026-0001', 'Receipt', 'approved', 'Sales revenue recognition for INV-2026-0001 - Thompson Electronics', 1),
(1, '2026-01-31', 33600.00, 33600.00, 'JV-2026-0002', 'Payment', 'approved', 'Purchase order PO-2026-0001 receipt from Precision Components', 1),
(1, '2026-02-28', 13068.00, 13068.00, 'JV-2026-0003', 'Receipt', 'approved', 'Sales revenue recognition for INV-2026-0002 - BrightPath Construction', 1),
(1, '2026-02-28', 17100.00, 17100.00, 'JV-2026-0004', 'Payment', 'approved', 'Purchase order PO-2026-0002 receipt from TechSource International', 1),
(1, '2026-01-31', 28000.00, 28000.00, 'JV-2026-0005', 'Journal', 'approved', 'Monthly payroll accrual January 2026', 1),
(1, '2026-02-28', 28500.00, 28500.00, 'JV-2026-0006', 'Journal', 'approved', 'Monthly payroll accrual February 2026', 1),
(1, '2026-03-15', 5000.00, 5000.00, 'JV-2026-0007', 'Journal', 'approved', 'Depreciation expense for Q1 2026', 1);

-- ============================================================================
-- 24. JOURNAL ENTRY LINES
-- ============================================================================
INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
-- JV-0001: Sales revenue - Thompson Electronics
(1, 12, 4391.40, 0.00, 'Invoice INV-2026-0001 - Accounts Receivable'),
(1, 22, 0.00, 3659.50, 'Product sales revenue'),
(1, 15, 0.00, 731.90, 'VAT collected at 20%'),
-- JV-0002: Purchase order - Precision Components
(2, 26, 28000.00, 0.00, 'COGS - products received'),
(2, 15, 5600.00, 0.00, 'Input VAT recoverable'),
(2, 13, 0.00, 33600.00, 'Accounts payable'),
-- JV-0003: Sales revenue - BrightPath Construction
(3, 12, 13068.00, 0.00, 'Invoice INV-2026-0002 - Accounts Receivable'),
(3, 22, 0.00, 10890.00, 'Product sales revenue'),
(3, 15, 0.00, 2178.00, 'VAT collected at 20%'),
-- JV-0004: Purchase order - TechSource
(4, 26, 14250.00, 0.00, 'COGS - SSDs and monitors'),
(4, 15, 2850.00, 0.00, 'Input VAT recoverable'),
(4, 13, 0.00, 17100.00, 'Accounts payable'),
-- JV-0005: January payroll
(5, 28, 28000.00, 0.00, 'Salaries expense - January'),
(5, 16, 0.00, 28000.00, 'Accrued salaries payable'),
-- JV-0006: February payroll
(6, 28, 28500.00, 0.00, 'Salaries expense - February'),
(6, 16, 0.00, 28500.00, 'Accrued salaries payable'),
-- JV-0007: Q1 Depreciation
(7, 33, 5000.00, 0.00, 'Depreciation expense'),
(7, 10, 0.00, 5000.00, 'Accumulated depreciation - Machinery');

-- ============================================================================
-- 25. EMPLOYEES
-- ============================================================================
INSERT INTO employees (company_id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, address, city, state, postal_code, country, department, position, hire_date, employment_type, salary, bank_name, bank_account_no, emergency_contact_name, emergency_contact_phone, status) VALUES
(1, 'EMP-001', 'Sarah', 'Mitchell', 'sarah.mitchell@acmecorp.com', '+1 (212) 555-1001', '1985-03-15', 'Female', '45 Park Avenue Apt 12B', 'New York', 'NY', '10016', 'USA', 'Engineering', 'Senior Electrical Engineer', '2019-06-01', 'Full-time', 125000.00, 'Chase Bank', '****1234', 'James Mitchell', '+1 (212) 555-9001', 'active'),
(1, 'EMP-002', 'Michael', 'Chen', 'michael.chen@acmecorp.com', '+1 (212) 555-1002', '1990-07-22', 'Male', '120 E 34th Street Apt 5A', 'New York', 'NY', '10016', 'USA', 'Sales', 'Regional Sales Manager', '2020-03-15', 'Full-time', 110000.00, 'Bank of America', '****5678', 'Linda Chen', '+1 (212) 555-9002', 'active'),
(1, 'EMP-003', 'Emily', 'Rodriguez', 'emily.rodriguez@acmecorp.com', '+1 (212) 555-1003', '1992-11-08', 'Female', '78 Water Street Apt 3C', 'New York', 'NY', '10004', 'USA', 'Finance', 'Senior Accountant', '2021-01-10', 'Full-time', 95000.00, 'Wells Fargo', '****9012', 'Carlos Rodriguez', '+1 (212) 555-9003', 'active'),
(1, 'EMP-004', 'David', 'Thompson', 'david.thompson@acmecorp.com', '+1 (973) 555-1004', '1988-05-30', 'Male', '25 Elm Street', 'Newark', 'NJ', '07102', 'USA', 'Operations', 'Warehouse Operations Manager', '2018-09-20', 'Full-time', 88000.00, 'PNC Bank', '****3456', 'Karen Thompson', '+1 (973) 555-9004', 'active'),
(1, 'EMP-005', 'Jennifer', 'Patel', 'jennifer.patel@acmecorp.com', '+1 (212) 555-1005', '1994-09-12', 'Female', '250 W 55th Street Apt 15D', 'New York', 'NY', '10019', 'USA', 'Human Resources', 'HR Manager', '2021-06-01', 'Full-time', 92000.00, 'Chase Bank', '****7890', 'Raj Patel', '+1 (212) 555-9005', 'active'),
(1, 'EMP-006', 'Robert', 'Kim', 'robert.kim@acmecorp.com', '+1 (212) 555-1006', '1983-12-05', 'Male', '55 Broadway Suite 1800', 'New York', 'NY', '10006', 'USA', 'Engineering', 'Mechanical Engineer', '2017-04-15', 'Full-time', 115000.00, 'Citibank', '****2345', 'Susan Kim', '+1 (212) 555-9006', 'active'),
(1, 'EMP-007', 'Amanda', 'O''Brien', 'amanda.obrien@acmecorp.com', '+1 (212) 555-1007', '1991-02-18', 'Female', '300 E 42nd Street Apt 22C', 'New York', 'NY', '10017', 'USA', 'Sales', 'Account Executive', '2022-02-01', 'Full-time', 75000.00, 'Bank of America', '****6789', 'Patrick O''Brien', '+1 (212) 555-9007', 'active'),
(1, 'EMP-008', 'James', 'Williams', 'james.williams@acmecorp.com', '+1 (213) 555-1008', '1986-06-25', 'Male', '742 S Broadway', 'Los Angeles', 'CA', '90014', 'USA', 'Operations', 'West Coast Warehouse Supervisor', '2020-08-15', 'Full-time', 72000.00, 'US Bank', '****0123', 'Maria Williams', '+1 (213) 555-9008', 'active'),
(1, 'EMP-009', 'Sophia', 'Martinez', 'sophia.martinez@acmecorp.com', '+1 (212) 555-1009', '1996-08-14', 'Female', '150 E 44th Street Apt 8B', 'New York', 'NY', '10017', 'USA', 'Marketing', 'Marketing Specialist', '2023-01-15', 'Full-time', 65000.00, 'Chase Bank', '****4567', 'Elena Martinez', '+1 (212) 555-9009', 'active'),
(1, 'EMP-010', 'Thomas', 'Anderson', 'thomas.anderson@acmecorp.com', '+1 (212) 555-1010', '1980-04-02', 'Male', '1 Pennsylvania Plaza Suite 2000', 'New York', 'NY', '10119', 'USA', 'Executive', 'Chief Executive Officer', '2015-01-01', 'Full-time', 250000.00, 'Goldman Sachs', '****8901', 'Laura Anderson', '+1 (212) 555-9010', 'active'),
(1, 'EMP-011', 'Lisa', 'Johnson', 'lisa.johnson@acmecorp.com', '+1 (212) 555-1011', '1993-10-20', 'Female', '88 Greenwich Street Apt 30A', 'New York', 'NY', '10006', 'USA', 'Customer Support', 'Customer Support Lead', '2021-09-01', 'Full-time', 58000.00, 'Chase Bank', '****3456', 'Mark Johnson', '+1 (212) 555-9011', 'active'),
(1, 'EMP-012', 'Daniel', 'Lee', 'daniel.lee@acmecorp.com', '+1 (973) 555-1012', '1987-01-11', 'Male', '500 Broad Street Suite 400', 'Newark', 'NJ', '07102', 'USA', 'Operations', 'Inventory Controller', '2019-11-01', 'Full-time', 62000.00, 'TD Bank', '****7890', 'Cathy Lee', '+1 (973) 555-9012', 'active');

-- ============================================================================
-- 26. LEAVE TYPES
-- ============================================================================
INSERT INTO leave_types (company_id, name, code, default_days, is_paid, requires_approval) VALUES
(1, 'Annual Leave', 'AL', 20, true, true),
(1, 'Sick Leave', 'SL', 12, true, true),
(1, 'Casual Leave', 'CL', 5, true, true),
(1, 'Public Holiday', 'PH', 0, true, false),
(1, 'Unpaid Leave', 'UL', 0, false, true),
(1, 'Maternity Leave', 'ML', 90, true, true),
(1, 'Paternity Leave', 'PL', 14, true, true);

-- ============================================================================
-- 27. ASSET CATEGORIES
-- ============================================================================
INSERT INTO asset_categories (company_id, code, name, default_depreciation_method, default_useful_life, is_active) VALUES
(1, 'COMP-EQ', 'Computer Equipment', 'straight_line', 3, true),
(1, 'OFFICE-FURN', 'Office Furniture', 'straight_line', 7, true),
(1, 'MACHINERY', 'Industrial Machinery', 'straight_line', 10, true),
(1, 'VEHICLES', 'Vehicles', 'straight_line', 5, true),
(1, 'WAREHOUSE-EQ', 'Warehouse Equipment', 'straight_line', 8, true);

-- ============================================================================
-- 28. FIXED ASSETS
-- ============================================================================
INSERT INTO fixed_assets (company_id, asset_code, name, category_id, description, purchase_date, purchase_cost, current_value, salvage_value, useful_life, depreciation_method, accumulated_depreciation, depreciation_per_period, location, status, notes, created_by) VALUES
(1, 'AST-COMP-001', 'Dell PowerEdge R740 Server', 1, 'Dell rack server 64GB RAM 4x2TB SSD', '2024-03-15', 18500.00, 10541.67, 1500.00, 3, 'straight_line', 7958.33, 472.22, 'NYC Server Room', 'active', 'Primary application server', 1),
(1, 'AST-COMP-002', 'Cisco Catalyst 9300 Switch', 1, '48-port gigabit PoE network switch', '2024-06-01', 4200.00, 2683.33, 400.00, 3, 'straight_line', 1516.67, 105.56, 'NYC Server Room', 'active', 'Core network switch', 1),
(1, 'AST-FURN-001', 'Executive Conference Table', 2, 'Mahogany conference table 12-seater', '2023-01-15', 8500.00, 5464.29, 1000.00, 7, 'straight_line', 3035.71, 89.29, 'NYC HQ Boardroom', 'active', 'Boardroom furniture', 1),
(1, 'AST-FURN-002', 'Office Cubicle Set (50 units)', 2, 'Modular office cubicle system with desks and partitions', '2023-08-01', 45000.00, 31785.71, 5000.00, 7, 'straight_line', 13214.29, 476.19, 'NYC HQ Floor 3', 'active', 'Open plan office setup', 1),
(1, 'AST-MACH-001', 'CNC Milling Machine HAAS VF-2', 3, 'HAAS vertical machining center with 40-tool changer', '2022-01-20', 85000.00, 54416.67, 8500.00, 10, 'straight_line', 30583.33, 637.50, 'Newark Workshop', 'active', 'Main production CNC', 1),
(1, 'AST-MACH-002', 'Industrial Conveyor System', 3, '50-meter automated conveyor with sortation system', '2023-04-10', 120000.00, 88500.00, 12000.00, 10, 'straight_line', 31500.00, 900.00, 'Newark Warehouse', 'active', 'Warehouse automation line', 1),
(1, 'AST-VEH-001', 'Ford Transit Cargo Van 250', 4, '2023 Ford Transit 250 cargo van 4,650 lb payload', '2023-09-15', 42000.00, 27300.00, 8000.00, 5, 'straight_line', 14700.00, 566.67, 'NYC Fleet Garage', 'active', 'Local deliveries vehicle', 1),
(1, 'AST-VEH-002', 'Freightliner M2 106 Box Truck', 4, '26-foot box truck with lift gate 26,000 GVWR', '2024-02-01', 85000.00, 61933.33, 15000.00, 5, 'straight_line', 23066.67, 1166.67, 'Newark Fleet Yard', 'active', 'Regional freight transport', 1),
(1, 'AST-WH-001', 'Toyota Forklift 8FGCU25', 5, '5,000 lb capacity LPG forklift with side shift', '2023-06-01', 35000.00, 21937.50, 5000.00, 8, 'straight_line', 13062.50, 312.50, 'Newark Warehouse', 'active', 'Warehouse forklift unit #1', 1),
(1, 'AST-WH-002', 'Raymond Reach Truck 7400', 5, '4,500 lb reach truck 36V with 330 inch lift', '2024-05-15', 48000.00, 35250.00, 6000.00, 8, 'straight_line', 12750.00, 437.50, 'NYC Warehouse', 'active', 'High reach pallet handling', 1);

-- ============================================================================
-- 29. EXPENSES
-- ============================================================================
INSERT INTO expenses (company_id, expense_date, category, category_id, description, amount, payment_method, reference_number, created_by) VALUES
(1, '2026-01-05', 'Office Rent', 1, 'January 2026 office rent NYC HQ', 15000.00, 'bank_transfer', 'RENT-2026-01', 1),
(1, '2026-01-08', 'Utilities', 2, 'January utilities NYC HQ', 3200.00, 'bank_transfer', 'UTIL-2026-01', 1),
(1, '2026-01-12', 'Office Supplies', 3, 'Printer toner and paper restock', 850.00, 'credit_card', 'SUPP-2026-01', 2),
(1, '2026-01-20', 'Shipping & Freight', 7, 'Outbound shipping charges January', 4200.00, 'bank_transfer', 'SHIP-2026-01', 1),
(1, '2026-02-02', 'Office Rent', 1, 'February 2026 office rent NYC HQ', 15000.00, 'bank_transfer', 'RENT-2026-02', 1),
(1, '2026-02-05', 'Travel & Meals', 4, 'Client visit lunch meeting - Thompson Electronics', 340.00, 'credit_card', 'TRAV-2026-02-01', 2),
(1, '2026-02-10', 'Software Licenses', 5, 'Annual ERP software license renewal', 12000.00, 'bank_transfer', 'SW-2026-ERP', 1),
(1, '2026-02-15', 'Insurance', 10, 'Q1 2026 general liability insurance premium', 8500.00, 'bank_transfer', 'INS-Q1-2026', 1),
(1, '2026-02-20', 'Marketing & Advertising', 9, 'Google Ads campaign February 2026', 2500.00, 'credit_card', 'ADS-2026-02', 3),
(1, '2026-02-28', 'Utilities', 2, 'February utilities NYC HQ + Newark warehouse', 4100.00, 'bank_transfer', 'UTIL-2026-02', 1),
(1, '2026-03-03', 'Office Rent', 1, 'March 2026 office rent NYC HQ', 15000.00, 'bank_transfer', 'RENT-2026-03', 1),
(1, '2026-03-08', 'Equipment Maintenance', 6, 'Forklift annual service - Newark warehouse', 1800.00, 'bank_transfer', 'MAINT-2026-03-01', 4),
(1, '2026-03-12', 'Shipping & Freight', 7, 'Outbound shipping charges March', 5100.00, 'bank_transfer', 'SHIP-2026-03', 1),
(1, '2026-03-18', 'Travel & Meals', 4, 'LA warehouse inspection trip flights and hotel', 2400.00, 'credit_card', 'TRAV-2026-03-01', 4),
(1, '2026-03-22', 'Office Supplies', 3, 'New desk chairs and supplies for customer support team', 3200.00, 'credit_card', 'SUPP-2026-03', 5);

-- ============================================================================
-- 30. QUOTATIONS
-- ============================================================================
INSERT INTO quotations (company_id, customer_id, quote_number, quote_date, expiry_date, status, subtotal, tax_total, discount_total, grand_total, notes, created_by) VALUES
(1, 5, 'QTE-2026-0001', '2026-01-20', '2026-02-19', 'converted', 8450.00, 1690.00, 0.00, 10140.00, 'Office furniture quote for PNW Retail HQ', 2),
(1, 8, 'QTE-2026-0002', '2026-02-10', '2026-03-12', 'converted', 3234.00, 646.80, 0.00, 3880.80, 'Seasonal equipment for Greenfield Ag', 2),
(1, 1, 'QTE-2026-0003', '2026-02-28', '2026-03-30', 'sent', 8750.00, 1750.00, 0.00, 10500.00, 'Q2 component supply proposal', 1),
(1, 4, 'QTE-2026-0004', '2026-03-05', '2026-04-04', 'draft', 12450.00, 2490.00, 500.00, 14440.00, 'Full PPE and safety equipment package', 1);

-- ============================================================================
-- 31. QUOTATION ITEMS
-- ============================================================================
INSERT INTO quotation_items (quotation_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total) VALUES
(1, 21, 'Electric Standing Desk', 5, 695.00, 0.00, 20.00, 3475.00),
(1, 8, 'Mesh Back Office Chair', 8, 299.00, 5.00, 20.00, 2272.40),
(1, 22, 'Metal 6-Tier Bookshelf', 15, 129.00, 0.00, 20.00, 1935.00),
(1, 7, 'Executive Desk Organizer', 20, 28.50, 0.00, 20.00, 570.00),
(2, 15, 'Anti-Fog Safety Goggles', 100, 8.99, 0.00, 20.00, 899.00),
(2, 16, 'ANSI Hard Hat Type I', 60, 15.50, 0.00, 20.00, 930.00),
(2, 22, 'Metal 6-Tier Bookshelf', 10, 129.00, 0.00, 20.00, 1290.00),
(3, 2, 'USB-C Hub 7-in-1', 80, 34.99, 0.00, 20.00, 2799.20),
(3, 18, 'SSD 1TB NVMe M.2', 25, 129.00, 5.00, 20.00, 3063.75),
(3, 5, 'Temperature Sensor PT100', 200, 18.75, 0.00, 20.00, 3750.00),
(4, 15, 'Anti-Fog Safety Goggles', 500, 8.99, 5.00, 20.00, 4270.25),
(4, 16, 'ANSI Hard Hat Type I', 200, 15.50, 5.00, 20.00, 2945.00),
(4, 17, 'Nitrile Gloves Box 100pk', 400, 12.00, 5.00, 20.00, 4560.00);

-- Update quotation conversion references
UPDATE quotations SET converted_to_order_id = 5, converted_at = '2026-02-10 14:30:00' WHERE quote_number = 'QTE-2026-0001';
UPDATE quotations SET converted_to_order_id = 8, converted_at = '2026-03-04 10:15:00' WHERE quote_number = 'QTE-2026-0002';

-- ============================================================================
-- 32. RETURN REASONS
-- ============================================================================
INSERT INTO return_reasons (company_id, reason_code, reason_name, category) VALUES
(1, 'DEFECTIVE', 'Defective/Damaged Product', 'both'),
(1, 'WRONG_ITEM', 'Wrong Item Shipped', 'both'),
(1, 'CUSTOMER_REQUEST', 'Customer Request/Change of Mind', 'sales'),
(1, 'QUALITY_ISSUE', 'Quality Issue', 'purchase'),
(1, 'EXPIRED', 'Product Expired', 'both'),
(1, 'DAMAGED', 'Damaged During Transit', 'both');

-- ============================================================================
-- 33. VERIFICATION: ROW COUNTS PER TABLE
-- ============================================================================
SELECT 'companies' AS table_name, COUNT(*) AS row_count FROM companies
UNION ALL SELECT 'warehouses', COUNT(*) FROM warehouses
UNION ALL SELECT 'warehouse_bins', COUNT(*) FROM warehouse_bins
UNION ALL SELECT 'tax_rates', COUNT(*) FROM tax_rates
UNION ALL SELECT 'customers', COUNT(*) FROM customers
UNION ALL SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL SELECT 'product_categories', COUNT(*) FROM product_categories
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'services', COUNT(*) FROM services
UNION ALL SELECT 'sales_orders', COUNT(*) FROM sales_orders
UNION ALL SELECT 'sales_order_items', COUNT(*) FROM sales_order_items
UNION ALL SELECT 'purchase_orders', COUNT(*) FROM purchase_orders
UNION ALL SELECT 'purchase_order_items', COUNT(*) FROM purchase_order_items
UNION ALL SELECT 'inventory_transactions', COUNT(*) FROM inventory_transactions
UNION ALL SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL SELECT 'invoice_items', COUNT(*) FROM invoice_items
UNION ALL SELECT 'payments', COUNT(*) FROM payments
UNION ALL SELECT 'chart_of_accounts', COUNT(*) FROM chart_of_accounts
UNION ALL SELECT 'journal_entries', COUNT(*) FROM journal_entries
UNION ALL SELECT 'journal_entry_lines', COUNT(*) FROM journal_entry_lines
UNION ALL SELECT 'employees', COUNT(*) FROM employees
UNION ALL SELECT 'leave_types', COUNT(*) FROM leave_types
UNION ALL SELECT 'expense_categories', COUNT(*) FROM expense_categories
UNION ALL SELECT 'expenses', COUNT(*) FROM expenses
UNION ALL SELECT 'asset_categories', COUNT(*) FROM asset_categories
UNION ALL SELECT 'fixed_assets', COUNT(*) FROM fixed_assets
UNION ALL SELECT 'quotations', COUNT(*) FROM quotations
UNION ALL SELECT 'quotation_items', COUNT(*) FROM quotation_items
UNION ALL SELECT 'return_reasons', COUNT(*) FROM return_reasons
ORDER BY table_name;

COMMIT;
