-- ==================================================
-- ERP Database: Full Data Reset & Realistic Population
-- ==================================================
-- Usage: psql -U postgres -d your_erp_db -f erp_reset_and_populate.sql
--
-- WARNING: This script DELETES ALL EXISTING DATA from business tables
-- and replaces it with realistic demo data.
-- It does NOT modify table structures.
-- It does NOT touch auth tables: users, roles, user_roles, sessions, password_resets.
-- ==================================================

BEGIN;

-- ==================================================
-- STEP 1: DISABLE TRIGGERS (temporarily)
-- ==================================================
-- Uncomment if your schema uses triggers:
-- SET session_replication_role = 'replica';

-- ==================================================
-- STEP 2: DELETE DATA (FK-safe reverse order)
-- ==================================================

-- Returns / Credits
DELETE FROM sales_return_items;
DELETE FROM sales_returns;
DELETE FROM purchase_return_items;
DELETE FROM purchase_returns;
DELETE FROM credit_notes;

-- POS
DELETE FROM pos_transaction_items;
DELETE FROM pos_transactions;
DELETE FROM pos_cart;
DELETE FROM pos_sessions;

-- Approvals
DELETE FROM approval_logs;
DELETE FROM approval_requests;
DELETE FROM approval_steps;
DELETE FROM approval_workflows;

-- Projects
DELETE FROM time_entries;
DELETE FROM project_members;
DELETE FROM project_tasks;
DELETE FROM projects;

-- Assets
DELETE FROM asset_maintenance;
DELETE FROM asset_depreciation;
DELETE FROM fixed_assets;
DELETE FROM asset_categories;

-- Services
DELETE FROM service_invoice_items;
DELETE FROM service_invoices;
DELETE FROM services;

-- Quotations
DELETE FROM quotation_items;
DELETE FROM quotations;

-- Invoices & Payments
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

-- Warehouse
DELETE FROM stock_transfer_items;
DELETE FROM stock_transfers;
DELETE FROM product_warehouse_stock;
DELETE FROM warehouse_bins;
DELETE FROM warehouses;

-- Accounting / Finance
DELETE FROM budget_items;
DELETE FROM budgets;
DELETE FROM cost_centers;
DELETE FROM expenses;
DELETE FROM expense_categories;
DELETE FROM bank_transactions;
DELETE FROM reconciliation_reports;
DELETE FROM bank_accounts;
DELETE FROM recurring_entry_lines;
DELETE FROM recurring_entries;
DELETE FROM journal_entry_lines;
DELETE FROM journal_entries;
DELETE FROM chart_of_accounts;

-- CRM
DELETE FROM follow_ups;
DELETE FROM interactions;
DELETE FROM opportunities;
DELETE FROM leads;
DELETE FROM crm_email_templates;

-- HR
DELETE FROM employee_documents;
DELETE FROM leave_requests;
DELETE FROM attendance;
DELETE FROM employees;

-- Core
DELETE FROM products;
DELETE FROM customers;
DELETE FROM suppliers;
DELETE FROM audit_logs;

-- Config / Settings (reinserted)
DELETE FROM system_settings;
DELETE FROM email_templates;
DELETE FROM return_reasons;
DELETE FROM lead_sources;
DELETE FROM lead_statuses;
DELETE FROM leave_types;
DELETE FROM tax_rates;

DELETE FROM companies;

-- ==================================================
-- STEP 3: RESET SEQUENCES
-- ==================================================
DO $$
DECLARE
    tbl TEXT;
    seq TEXT;
BEGIN
    FOR tbl, seq IN
        SELECT table_name, pg_get_serial_sequence(table_schema || '.' || table_name, 'id')
        FROM information_schema.columns
        WHERE column_default LIKE 'nextval%'
          AND table_schema = 'public'
    LOOP
        IF seq IS NOT NULL THEN
            BEGIN
                EXECUTE 'ALTER SEQUENCE ' || seq || ' RESTART WITH 1';
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Could not reset sequence for %', tbl;
            END;
        END IF;
    END LOOP;
END $$;

-- ==================================================
-- STEP 4: INSERT REALISTIC DATA
-- ==================================================

-- ==================== COMPANIES ====================
INSERT INTO companies (name, tax_id, email, phone, address, currency) VALUES
('Acme Corporation', 'US45-6789012', 'info@acmecorp.com', '+1 (212) 555-0198', '1200 Broadway, Suite 400, New York, NY 10001, United States', 'USD'),
('GlobalTech Industries', 'US87-6543210', 'contact@globaltech.com', '+1 (408) 555-0321', '500 Innovation Drive, San Jose, CA 95134, United States', 'USD'),
('MediCore Health Systems', 'US23-4567890', 'hello@medicore.com', '+1 (617) 555-0476', '200 Medical Plaza, Boston, MA 02115, United States', 'USD');

-- ==================== WAREHOUSES ====================
INSERT INTO warehouses (company_id, code, name, address, city, state, country, postal_code, phone, email, is_default, is_active) VALUES
(1, 'MAIN', 'Main Warehouse', '1200 Broadway, Suite 100', 'New York', 'NY', 'United States', '10001', '+1 (212) 555-1101', 'warehouse.ny@acmecorp.com', true, true),
(1, 'EAST', 'East Coast Distribution Center', '400 Industrial Parkway', 'Newark', 'NJ', 'United States', '07105', '+1 (973) 555-1102', 'east.dc@acmecorp.com', false, true),
(1, 'WEST', 'West Coast Logistics Hub', '800 Port Road', 'Los Angeles', 'CA', 'United States', '90058', '+1 (213) 555-1103', 'west.hub@acmecorp.com', false, true),
(2, 'SJ-HQ', 'San Jose Headquarters Warehouse', '500 Innovation Drive, Bldg B', 'San Jose', 'CA', 'United States', '95134', '+1 (408) 555-2100', 'warehouse@globaltech.com', true, true),
(3, 'BOS-MAIN', 'Boston Medical Supply Center', '200 Medical Plaza, Basement', 'Boston', 'MA', 'United States', '02115', '+1 (617) 555-3100', 'supplychain@medicore.com', true, true);

-- ==================== WAREHOUSE BINS ====================
INSERT INTO warehouse_bins (company_id, warehouse_id, code, name, zone, aisle, rack, shelf, max_capacity, is_active) VALUES
(1, 1, 'A-01-01', 'Aisle A Rack 1 Shelf 1', 'Electronics', 'A', '1', '1', 200, true),
(1, 1, 'A-01-02', 'Aisle A Rack 1 Shelf 2', 'Electronics', 'A', '1', '2', 200, true),
(1, 1, 'B-01-01', 'Aisle B Rack 1 Shelf 1', 'Office Supplies', 'B', '1', '1', 500, true),
(1, 1, 'C-01-01', 'Aisle C Rack 1 Shelf 1', 'Packaging', 'C', '1', '1', 300, true),
(1, 2, 'A-01-01', 'Bin A-01-01', 'General Storage', 'A', '1', '1', 400, true),
(1, 2, 'A-01-02', 'Bin A-01-02', 'General Storage', 'A', '1', '2', 400, true),
(1, 3, 'Z-01-01', 'Zone Z Bay 1', 'Bulk Storage', 'Z', '1', '1', 1000, true),
(2, 4, 'RACK-1A', 'Rack 1A', 'Components', '1', 'A', '1', 300, true),
(3, 5, 'COLD-01', 'Cold Storage 1', 'Refrigerated', 'C1', '1', '1', 150, true);

-- ==================== TAX RATES ====================
INSERT INTO tax_rates (company_id, name, rate, type, is_default, is_active, description) VALUES
(1, 'Standard VAT', 20.00, 'VAT', true, true, 'Standard VAT rate 20%'),
(1, 'Reduced VAT', 5.00, 'VAT', false, true, 'Reduced VAT rate for essentials'),
(1, 'Zero Rated', 0.00, 'VAT', false, true, 'Zero rated supplies'),
(2, 'Standard VAT', 20.00, 'VAT', true, true, 'Standard VAT rate 20%'),
(3, 'Standard VAT', 20.00, 'VAT', true, true, 'Standard VAT rate 20%'),
(3, 'Medical Exemption', 0.00, 'VAT', false, true, 'Medical supplies exemption');

-- ==================== LEAD SOURCES ====================
INSERT INTO lead_sources (company_id, name) VALUES
(1, 'Website'), (1, 'Referral'), (1, 'Phone Inquiry'),
(1, 'Email Campaign'), (1, 'Social Media'), (1, 'Walk-in'),
(1, 'Trade Show'), (1, 'Other'),
(2, 'Website'), (2, 'Referral'), (2, 'Phone Inquiry'),
(2, 'Email Campaign'), (2, 'Social Media'), (2, 'Walk-in'),
(2, 'Trade Show'), (2, 'Other'),
(3, 'Website'), (3, 'Referral'), (3, 'Phone Inquiry'),
(3, 'Email Campaign'), (3, 'Social Media'), (3, 'Walk-in'),
(3, 'Trade Show'), (3, 'Other');

-- ==================== LEAD STATUSES ====================
INSERT INTO lead_statuses (company_id, name, sort_order, color) VALUES
(1, 'New', 1, '#3b82f6'), (1, 'Contacted', 2, '#8b5cf6'), (1, 'Qualified', 3, '#f59e0b'),
(1, 'Proposal', 4, '#ec4899'), (1, 'Negotiation', 5, '#f97316'), (1, 'Won', 6, '#10b981'),
(1, 'Lost', 7, '#ef4444'),
(2, 'New', 1, '#3b82f6'), (2, 'Contacted', 2, '#8b5cf6'), (2, 'Qualified', 3, '#f59e0b'),
(2, 'Proposal', 4, '#ec4899'), (2, 'Negotiation', 5, '#f97316'), (2, 'Won', 6, '#10b981'),
(2, 'Lost', 7, '#ef4444'),
(3, 'New', 1, '#3b82f6'), (3, 'Contacted', 2, '#8b5cf6'), (3, 'Qualified', 3, '#f59e0b'),
(3, 'Proposal', 4, '#ec4899'), (3, 'Negotiation', 5, '#f97316'), (3, 'Won', 6, '#10b981'),
(3, 'Lost', 7, '#ef4444');

-- ==================== RETURN REASONS ====================
INSERT INTO return_reasons (company_id, reason_code, reason_name, category) VALUES
(1, 'DEFECTIVE', 'Defective/Damaged Product', 'both'),
(1, 'WRONG_ITEM', 'Wrong Item Shipped', 'both'),
(1, 'CUSTOMER_REQUEST', 'Customer Request / Change of Mind', 'sales'),
(1, 'QUALITY_ISSUE', 'Quality Issue', 'purchase'),
(1, 'EXPIRED', 'Product Expired', 'both'),
(1, 'DAMAGED', 'Damaged During Transit', 'both'),
(1, 'OVERSTOCK', 'Supplier Overstock / Duplicate', 'purchase'),
(2, 'DEFECTIVE', 'Defective/Damaged Product', 'both'),
(2, 'WRONG_ITEM', 'Wrong Item Shipped', 'both'),
(2, 'CUSTOMER_REQUEST', 'Customer Request / Change of Mind', 'sales'),
(2, 'QUALITY_ISSUE', 'Quality Issue', 'purchase'),
(2, 'EXPIRED', 'Product Expired', 'both'),
(2, 'DAMAGED', 'Damaged During Transit', 'both'),
(3, 'DEFECTIVE', 'Defective/Damaged Product', 'both'),
(3, 'WRONG_ITEM', 'Wrong Item Shipped', 'both'),
(3, 'CUSTOMER_REQUEST', 'Customer Request / Change of Mind', 'sales'),
(3, 'QUALITY_ISSUE', 'Quality Issue', 'purchase'),
(3, 'EXPIRED', 'Product Expired', 'both'),
(3, 'DAMAGED', 'Damaged During Transit', 'both');

-- ==================== LEAVE TYPES ====================
INSERT INTO leave_types (company_id, name, code, default_days, is_paid) VALUES
(1, 'Annual Leave', 'AL', 20, true),
(1, 'Sick Leave', 'SL', 12, true),
(1, 'Casual Leave', 'CL', 5, true),
(1, 'Public Holiday', 'PH', 0, true),
(1, 'Unpaid Leave', 'UL', 0, false),
(2, 'Annual Leave', 'AL', 22, true),
(2, 'Sick Leave', 'SL', 15, true),
(2, 'Casual Leave', 'CL', 6, true),
(2, 'Public Holiday', 'PH', 0, true),
(2, 'Unpaid Leave', 'UL', 0, false),
(3, 'Annual Leave', 'AL', 25, true),
(3, 'Sick Leave', 'SL', 18, true),
(3, 'Casual Leave', 'CL', 5, true),
(3, 'Public Holiday', 'PH', 0, true),
(3, 'Unpaid Leave', 'UL', 0, false);

-- ==================== SUPPLIERS ====================
INSERT INTO suppliers (company_id, name, email, phone, address) VALUES
(1, 'Global Sourcing Inc.', 'orders@globalsourcing.com', '+1 (312) 555-2100', '1500 Merchandise Mart, Chicago, IL 60654, United States'),
(1, 'TechParts Distribution', 'sales@techparts.com', '+1 (510) 555-3300', '8800 Technology Way, Oakland, CA 94621, United States'),
(1, 'Raw Materials Co.', 'info@rawmaterials.com', '+1 (713) 555-4400', '4500 Industrial Blvd, Houston, TX 77001, United States'),
(1, 'Office Essentials Ltd.', 'contact@officeessentials.com', '+1 (404) 555-5500', '600 Peachtree Street, Atlanta, GA 30308, United States'),
(1, 'Packaging Plus', 'hello@packagingplus.com', '+1 (502) 555-6600', '3500 Logistics Lane, Louisville, KY 40201, United States'),
(2, 'ChipSource Electronics', 'sales@chipsource.com', '+1 (512) 555-7100', '2400 Semiconductor Drive, Austin, TX 78701, United States'),
(2, 'Global Logistics Partners', 'ops@globallogistics.com', '+1 (305) 555-8200', '1200 Freight Street, Miami, FL 33101, United States'),
(3, 'MedSupply International', 'orders@medsupply.com', '+1 (763) 555-9300', '500 Healthway Circle, Minneapolis, MN 55401, United States'),
(3, 'PharmaDirect Ltd.', 'info@pharmadirect.com', '+1 (732) 555-0400', '800 Pharmaceutical Drive, New Brunswick, NJ 08901, United States');

-- ==================== CUSTOMERS ====================
INSERT INTO customers (company_id, name, email, phone, billing_address, shipping_address) VALUES
(1, 'TechVantage Solutions', 'ap@techvantage.com', '+1 (415) 555-1001', '300 Market Street, San Francisco, CA 94105, United States', '300 Market Street, San Francisco, CA 94105, United States'),
(1, 'BrightPath Education', 'finance@brightpath.edu', '+1 (617) 555-2002', '50 Education Lane, Cambridge, MA 02138, United States', '50 Education Lane, Cambridge, MA 02138, United States'),
(1, 'GreenLeaf Landscaping', 'billing@greenleaf.com', '+1 (503) 555-3003', '200 Garden Avenue, Portland, OR 97201, United States', '200 Garden Avenue, Portland, OR 97201, United States'),
(1, 'Summit Hospitality Group', 'accounts@summithospitality.com', '+1 (702) 555-4004', '4500 Vegas Boulevard, Las Vegas, NV 89109, United States', '4500 Vegas Boulevard, Las Vegas, NV 89109, United States'),
(1, 'Apex Manufacturing LLC', 'procurement@apexmfg.com', '+1 (313) 555-5005', '750 Factory Road, Detroit, MI 48201, United States', '750 Factory Road, Detroit, MI 48201, United States'),
(1, 'CloudBase IT Services', 'payables@cloudbase.io', '+1 (425) 555-6006', '1800 Tech Street, Redmond, WA 98052, United States', '1800 Tech Street, Redmond, WA 98052, United States'),
(2, 'NovaStar Enterprises', 'finance@novastar.com', '+1 (212) 555-7007', '100 Park Avenue, New York, NY 10017, United States', '100 Park Avenue, New York, NY 10017, United States'),
(2, 'DataPulse Analytics', 'ap@datapulse.com', '+1 (512) 555-8008', '800 Congress Avenue, Austin, TX 78701, United States', '800 Congress Avenue, Austin, TX 78701, United States'),
(3, 'Springfield General Hospital', 'procurement@sgh.org', '+1 (413) 555-9009', '100 Healthcare Drive, Springfield, MA 01104, United States', '100 Healthcare Drive, Springfield, MA 01104, United States'),
(3, 'Wellness Pharmacy Group', 'orders@wellnesspharmacy.com', '+1 (305) 555-0110', '50 Pharmacy Row, Miami, FL 33101, United States', '50 Pharmacy Row, Miami, FL 33101, United States');

-- ==================== PRODUCTS ====================
INSERT INTO products (company_id, sku, name, description, unit_price, cost_price, current_stock, reorder_level, tax_rate_id) VALUES
-- Acme Corp (company 1) products
(1, 'ELEC-LAP-001', 'ProBook Laptop 15"', '15.6" FHD laptop, Intel i7, 16GB RAM, 512GB SSD', 1299.00, 875.00, 45, 10, 1),
(1, 'ELEC-MON-002', 'UltraSharp 27" 4K Monitor', '27" IPS 4K UHD monitor with USB-C hub', 549.00, 380.00, 80, 15, 1),
(1, 'ELEC-KEY-003', 'Wireless Ergonomic Keyboard', 'Full-size wireless keyboard with wrist rest', 89.99, 48.00, 200, 30, 1),
(1, 'ELEC-MOU-004', 'Precision Wireless Mouse', 'Ergonomic mouse with 6 buttons, rechargeable', 49.99, 26.00, 300, 50, 1),
(1, 'ELEC-HUB-005', 'USB-C 7-in-1 Hub', 'USB-C hub with HDMI, SD card, USB 3.0 ports', 39.99, 19.50, 180, 25, 1),
(1, 'OFFC-PAP-006', 'Premium Multi-Purpose Paper (5000 ct)', 'A4 80gsm multipurpose printer paper, case of 10 reams', 64.99, 42.00, 90, 15, 2),
(1, 'OFFC-PEN-007', 'Executive Ballpoint Pen Set (12 pcs)', 'Gold-trimmed ballpoint pens, medium point blue ink', 24.99, 12.00, 400, 50, 2),
(1, 'OFFC-FIL-008', 'Hanging File Folders (25 pcs)', 'Letter size hanging file folders, assorted colors', 18.99, 9.50, 250, 40, 2),
(1, 'OFFC-CHR-009', 'Ergonomic Office Chair', 'Mesh back with lumbar support, adjustable height', 399.00, 215.00, 25, 5, 1),
(1, 'OFFC-DSK-010', 'Standing Desk Electric 60"', 'Electric height-adjustable standing desk, 60x30 inches', 749.00, 420.00, 15, 3, 1),
(1, 'IND-BOX-011', 'Corrugated Shipping Box (50 ct)', '12x10x8 inch corrugated cardboard boxes', 29.99, 16.00, 500, 100, 2),
(1, 'IND-TAP-012', 'Industrial Packing Tape (36 rolls)', 'Clear acrylic packing tape, 2" x 110 yards', 45.00, 28.00, 150, 30, 2),
(1, 'IND-BUB-013', 'Bubble Wrap Roll (175 ft)', '12 inch wide small bubble wrap, 175 ft roll', 38.50, 22.00, 80, 15, 2),
-- GlobalTech (company 2) products
(2, 'GT-SRV-001', 'CloudServe Pro Server', '2U rack server, dual Xeon, 128GB ECC, 4x4TB SSD', 8499.00, 5200.00, 8, 2, 4),
(2, 'GT-SWT-002', 'SmartSwitch 48-Port PoE+', '48-port managed gigabit PoE+ switch', 1299.00, 780.00, 20, 5, 4),
(2, 'GT-FW-003', 'CyberShield Firewall Appliance', 'Next-gen firewall, 10GbE, 5000 sessions', 2499.00, 1500.00, 12, 3, 4),
(2, 'GT-CBL-004', 'Cat6a Patch Cable (100 pack)', '10ft Cat6a shielded patch cables, assorted colors', 149.00, 82.00, 100, 20, 4),
(2, 'GT-RACK-005', '42U Server Rack Enclosure', '42U 19-inch rack, side panels, front/rear doors', 895.00, 510.00, 15, 3, 4),
-- MediCore (company 3) products
(3, 'MC-MSK-001', 'Surgical Face Masks (500 ct)', 'Level 3 surgical masks, ASTM certified, box of 500', 89.00, 52.00, 300, 50, 6),
(3, 'MC-GLV-002', 'Nitrile Exam Gloves (1000 ct)', 'Powder-free nitrile gloves, size M, box of 1000', 129.00, 78.00, 200, 30, 6),
(3, 'MC-THM-003', 'Digital Forehead Thermometer', 'Non-contact infrared thermometer, medical grade', 45.00, 24.00, 150, 25, 6),
(3, 'MC-BP-004', 'Automatic Blood Pressure Monitor', 'Upper arm BP monitor with large LCD display', 79.00, 42.00, 100, 15, 6),
(3, 'MC-SYR-005', 'Disposable Syringes 5ml (200 ct)', 'Luer lock syringes, sterile, box of 200', 32.00, 17.00, 400, 60, 6);

-- ==================== PRODUCT WAREHOUSE STOCK ====================
INSERT INTO product_warehouse_stock (company_id, product_id, warehouse_id, bin_id, quantity, reserved_quantity, reorder_level) VALUES
(1, 1, 1, 1, 30, 5, 10), (1, 1, 2, 5, 15, 2, 5),
(1, 2, 1, 2, 50, 8, 15), (1, 2, 2, 5, 30, 4, 10),
(1, 3, 1, 3, 120, 10, 30), (1, 3, 2, 6, 80, 6, 20),
(1, 4, 1, 3, 180, 15, 50), (1, 4, 2, 6, 120, 10, 30),
(1, 5, 1, 2, 100, 8, 25), (1, 5, 3, 7, 80, 5, 15),
(1, 6, 1, 3, 60, 5, 15),
(1, 7, 1, 3, 250, 20, 50), (1, 7, 2, 6, 150, 10, 30),
(1, 8, 1, 3, 150, 10, 40),
(1, 9, 1, 1, 15, 2, 5),  (1, 9, 2, 5, 10, 1, 3),
(1, 10, 1, 1, 10, 1, 3), (1, 10, 2, 5, 5, 0, 2),
(1, 11, 1, 4, 300, 25, 100),
(1, 12, 1, 4, 100, 10, 30), (1, 12, 3, 7, 50, 5, 15),
(1, 13, 1, 4, 50, 5, 15), (1, 13, 3, 7, 30, 3, 10),
(2, 14, 4, 8, 6, 1, 2),
(2, 15, 4, 8, 15, 2, 5),
(2, 16, 4, 8, 10, 2, 3),
(2, 17, 4, 8, 60, 10, 20),
(2, 18, 4, 8, 10, 2, 3),
(3, 19, 5, 9, 200, 15, 50),
(3, 20, 5, 9, 150, 10, 30),
(3, 21, 5, 9, 100, 8, 25),
(3, 22, 5, 9, 70, 5, 15),
(3, 23, 5, 9, 300, 20, 60);

-- ==================== EMPLOYEES ====================
INSERT INTO employees (company_id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, address, city, state, postal_code, country, department, position, hire_date, employment_type, salary, status) VALUES
-- Acme Corp Employees
(1, 'EMP-0001', 'Sarah', 'Mitchell', 'sarah.mitchell@acmecorp.com', '+1 (212) 555-2001', '1987-03-14', 'Female', '340 Park Avenue, Apt 12B', 'New York', 'NY', '10065', 'United States', 'Executive', 'Chief Executive Officer', '2019-06-01', 'Full-time', 185000.00, 'active'),
(1, 'EMP-0002', 'James', 'Rodriguez', 'james.rodriguez@acmecorp.com', '+1 (212) 555-2002', '1991-07-22', 'Male', '150 Broadway, Apt 8A', 'New York', 'NY', '10006', 'United States', 'Finance', 'Chief Financial Officer', '2020-01-15', 'Full-time', 165000.00, 'active'),
(1, 'EMP-0003', 'Emily', 'Chen', 'emily.chen@acmecorp.com', '+1 (212) 555-2003', '1993-11-08', 'Female', '250 West 55th Street, Apt 5C', 'New York', 'NY', '10019', 'United States', 'Sales', 'Sales Director', '2020-03-01', 'Full-time', 120000.00, 'active'),
(1, 'EMP-0004', 'Michael', 'Thompson', 'michael.thompson@acmecorp.com', '+1 (973) 555-2004', '1985-09-30', 'Male', '80 Maple Street', 'Newark', 'NJ', '07102', 'United States', 'Warehouse', 'Warehouse Manager', '2018-11-01', 'Full-time', 78000.00, 'active'),
(1, 'EMP-0005', 'Jessica', 'Patel', 'jessica.patel@acmecorp.com', '+1 (212) 555-2005', '1995-05-16', 'Female', '500 East 77th Street, Apt 15D', 'New York', 'NY', '10162', 'United States', 'Human Resources', 'HR Manager', '2021-04-01', 'Full-time', 85000.00, 'active'),
(1, 'EMP-0006', 'David', 'Kim', 'david.kim@acmecorp.com', '+1 (212) 555-2006', '1990-02-25', 'Male', '120 Lexington Avenue, Apt 3F', 'New York', 'NY', '10016', 'United States', 'IT', 'IT Manager', '2020-07-01', 'Full-time', 95000.00, 'active'),
(1, 'EMP-0007', 'Amanda', 'Williams', 'amanda.williams@acmecorp.com', '+1 (212) 555-2007', '1988-08-12', 'Female', '75 Amsterdam Avenue, Apt 9A', 'New York', 'NY', '10023', 'United States', 'Sales', 'Sales Representative', '2022-01-10', 'Full-time', 55000.00, 'active'),
(1, 'EMP-0008', 'Robert', 'Martinez', 'robert.martinez@acmecorp.com', '+1 (213) 555-2008', '1992-12-03', 'Male', '800 Sunset Boulevard, Apt 7B', 'Los Angeles', 'CA', '90028', 'United States', 'Warehouse', 'West Coast Supervisor', '2021-09-01', 'Full-time', 62000.00, 'active'),
(1, 'EMP-0009', 'Laura', 'Johnson', 'laura.johnson@acmecorp.com', '+1 (212) 555-2009', '1994-04-19', 'Female', '60 East 42nd Street, Apt 22A', 'New York', 'NY', '10017', 'United States', 'Finance', 'Accountant', '2022-06-15', 'Full-time', 65000.00, 'active'),
(1, 'EMP-0010', 'Kevin', 'Brown', 'kevin.brown@acmecorp.com', '+1 (212) 555-2010', '1986-10-07', 'Male', '300 East 34th Street, Apt 11C', 'New York', 'NY', '10016', 'United States', 'Purchasing', 'Procurement Manager', '2019-08-01', 'Full-time', 82000.00, 'active'),
(1, 'EMP-0011', 'Sophia', 'Garcia', 'sophia.garcia@acmecorp.com', '+1 (212) 555-2011', '1996-01-28', 'Female', '450 West 42nd Street, Apt 6B', 'New York', 'NY', '10036', 'United States', 'Marketing', 'Marketing Coordinator', '2023-03-01', 'Full-time', 48000.00, 'active'),
(1, 'EMP-0012', 'Daniel', 'Lee', 'daniel.lee@acmecorp.com', '+1 (212) 555-2012', '1989-06-15', 'Male', '88 Fulton Street, Apt 14E', 'New York', 'NY', '10038', 'United States', 'Operations', 'Operations Manager', '2020-05-01', 'Full-time', 88000.00, 'active'),
-- GlobalTech Employees
(2, 'EMP-1001', 'Grace', 'Hopper', 'grace.hopper@globaltech.com', '+1 (408) 555-3001', '1984-12-09', 'Female', '100 Innovation Way, Unit 200', 'San Jose', 'CA', '95134', 'United States', 'Engineering', 'VP of Engineering', '2018-04-01', 'Full-time', 195000.00, 'active'),
(2, 'EMP-1002', 'Alan', 'Turing', 'alan.turing@globaltech.com', '+1 (408) 555-3002', '1990-06-23', 'Male', '200 Silicon Valley Blvd, Apt 301', 'San Jose', 'CA', '95134', 'United States', 'Engineering', 'Senior Software Engineer', '2020-08-01', 'Full-time', 145000.00, 'active'),
(2, 'EMP-1003', 'Ada', 'Lovelace', 'ada.lovelace@globaltech.com', '+1 (408) 555-3003', '1992-03-15', 'Female', '300 Tech Park Drive, Apt 150', 'San Jose', 'CA', '95134', 'United States', 'Product', 'Product Manager', '2021-02-01', 'Full-time', 125000.00, 'active'),
-- MediCore Employees
(3, 'EMP-2001', 'William', 'Harvey', 'william.harvey@medicore.com', '+1 (617) 555-4001', '1978-09-14', 'Male', '50 Longwood Avenue, Apt 12', 'Boston', 'MA', '02115', 'United States', 'Medical', 'Chief Medical Officer', '2019-01-01', 'Full-time', 210000.00, 'active'),
(3, 'EMP-2002', 'Florence', 'Nightingale', 'florence.nightingale@medicore.com', '+1 (617) 555-4002', '1986-11-22', 'Female', '200 Beacon Street, Apt 8', 'Boston', 'MA', '02116', 'United States', 'Quality', 'Quality Assurance Director', '2020-05-01', 'Full-time', 110000.00, 'active'),
(3, 'EMP-2003', 'Marie', 'Curie', 'marie.curie@medicore.com', '+1 (617) 555-4003', '1991-07-07', 'Female', '80 Cambridge Street, Apt 4A', 'Boston', 'MA', '02114', 'United States', 'Logistics', 'Supply Chain Coordinator', '2022-09-01', 'Full-time', 58000.00, 'active');

-- ==================== SALES ORDERS ====================
INSERT INTO sales_orders (company_id, customer_id, order_number, order_date, status, subtotal, tax_total, grand_total, notes, warehouse_id, created_by) VALUES
(1, 1, 'SO-2026-0001', '2026-01-10', 'confirmed', 1687.97, 337.59, 2025.56, 'Year-end IT equipment upgrade order', 1, 3),
(1, 2, 'SO-2026-0002', '2026-01-15', 'shipped', 343.93, 17.20, 361.13, 'Office supplies for spring semester', 2, 3),
(1, 3, 'SO-2026-0003', '2026-01-22', 'invoiced', 817.48, 163.50, 980.98, 'New office setup order', 1, 7),
(1, 4, 'SO-2026-0004', '2026-02-01', 'confirmed', 3834.00, 766.80, 4600.80, 'Bulk electronics for hotel chain', 1, 7),
(1, 5, 'SO-2026-0005', '2026-02-05', 'draft', 1474.00, 294.80, 1768.80, 'Manufacturing floor equipment', 3, 3),
(1, 6, 'SO-2026-0006', '2026-02-10', 'shipped', 1949.00, 389.80, 2338.80, 'Server room equipment for cloud migration', 3, 7),
(1, 1, 'SO-2026-0007', '2026-02-18', 'confirmed', 889.50, 177.90, 1067.40, 'Additional monitors and peripherals', 1, 3),
(1, 3, 'SO-2026-0008', '2026-02-25', 'cancelled', 449.00, 89.80, 538.80, 'Order cancelled due to budget freeze', 1, 7),
(2, 7, 'SO-2026-0100', '2026-01-20', 'confirmed', 11493.00, 2298.60, 13791.60, 'Infrastructure upgrade for new office', 4, 1),
(2, 8, 'SO-2026-0101', '2026-02-08', 'shipped', 1044.00, 208.80, 1252.80, 'Cabling and rack for data center expansion', 4, 1),
(3, 9, 'SO-2026-0200', '2026-01-12', 'confirmed', 4010.00, 0.00, 4010.00, 'Monthly medical supply order - tax exempt', 5, 1),
(3, 10, 'SO-2026-0201', '2026-02-03', 'invoiced', 5030.00, 0.00, 5030.00, 'Pharmacy inventory restock Q1', 5, 1);

-- ==================== SALES ORDER ITEMS ====================
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
-- SO-2026-0001: TechVantage
(1, 1, 1, 1299.00, 0.00, 1299.00),
(1, 2, 1, 389.99, 0.00, 389.99),
(1, 5, 1, 39.99, 2.50, 38.99),
-- SO-2026-0002: BrightPath
(2, 6, 2, 64.99, 0.00, 129.98),
(2, 7, 5, 24.99, 0.00, 124.95),
(2, 8, 5, 18.99, 2.00, 92.99),
-- SO-2026-0003: GreenLeaf
(3, 3, 2, 89.99, 0.00, 179.98),
(3, 4, 3, 49.99, 0.00, 149.97),
(3, 5, 5, 39.99, 5.00, 189.95),
(3, 7, 10, 24.99, 3.00, 242.40),
(3, 8, 3, 18.99, 0.00, 56.97),
-- SO-2026-0004: Summit Hospitality
(4, 2, 5, 549.00, 5.00, 2607.75),
(4, 4, 10, 49.99, 3.00, 484.90),
(4, 5, 20, 39.99, 5.00, 759.81),
-- SO-2026-0005: Apex Manufacturing
(5, 9, 2, 399.00, 0.00, 798.00),
(5, 10, 1, 549.00, 0.00, 549.00),
(5, 13, 2, 38.50, 0.00, 77.00),
-- SO-2026-0006: CloudBase IT
(6, 1, 1, 1299.00, 0.00, 1299.00),
(6, 4, 2, 49.99, 0.00, 99.98),
(6, 5, 5, 39.99, 0.00, 199.95),
(6, 3, 3, 89.99, 5.00, 256.47),
-- SO-2026-0007: TechVantage repeat
(7, 2, 1, 389.99, 0.00, 389.99),
(7, 4, 3, 49.99, 0.00, 149.97),
(7, 7, 10, 24.99, 0.00, 249.90),
(7, 8, 5, 18.99, 1.00, 94.00),
-- SO-2026-0008: GreenLeaf cancelled
(8, 9, 1, 399.00, 0.00, 399.00),
(8, 13, 1, 38.50, 0.00, 38.50),
-- SO-2026-0100: NovaStar
(9, 14, 1, 8499.00, 0.00, 8499.00),
(9, 15, 2, 1299.00, 5.00, 2468.10),
(9, 16, 1, 2499.00, 0.00, 2499.00),
-- SO-2026-0101: DataPulse
(10, 17, 4, 149.00, 0.00, 596.00),
(10, 18, 1, 895.00, 0.00, 895.00),
-- SO-2026-0200: Springfield General
(11, 19, 10, 89.00, 0.00, 890.00),
(11, 20, 5, 129.00, 0.00, 645.00),
(11, 21, 20, 45.00, 0.00, 900.00),
(11, 22, 15, 79.00, 0.00, 1185.00),
(11, 23, 10, 32.00, 0.00, 320.00),
-- SO-2026-0201: Wellness Pharmacy
(12, 19, 20, 89.00, 2.00, 1744.40),
(12, 20, 10, 129.00, 2.00, 1264.20),
(12, 21, 30, 45.00, 2.00, 1323.00),
(12, 23, 15, 32.00, 0.00, 480.00);

-- ==================== INVENTORY TRANSACTIONS ====================
INSERT INTO inventory_transactions (product_id, type, quantity, reference_type, reference_id, warehouse_id) VALUES
-- SO-2026-0001 fulfillment
(1, 'out', 1, 'sales_order', 1, 1),
(2, 'out', 1, 'sales_order', 1, 1),
(5, 'out', 1, 'sales_order', 1, 1),
-- SO-2026-0002 fulfillment
(6, 'out', 2, 'sales_order', 2, 2),
(7, 'out', 5, 'sales_order', 2, 2),
(8, 'out', 5, 'sales_order', 2, 2),
-- Stock adjustments
(1, 'adjustment', 2, 'physical_count', NULL, 1),
(4, 'adjustment', -1, 'damaged', NULL, 1),
(11, 'in', 500, 'initial_stock', NULL, 1),
(12, 'in', 150, 'initial_stock', NULL, 1),
(13, 'in', 80, 'initial_stock', NULL, 1),
-- GlobalTech initial stock
(14, 'in', 8, 'initial_stock', NULL, 4),
(15, 'in', 20, 'initial_stock', NULL, 4),
(16, 'in', 12, 'initial_stock', NULL, 4),
(17, 'in', 100, 'initial_stock', NULL, 4),
(18, 'in', 15, 'initial_stock', NULL, 4),
-- MediCore initial stock
(19, 'in', 300, 'initial_stock', NULL, 5),
(20, 'in', 200, 'initial_stock', NULL, 5),
(21, 'in', 150, 'initial_stock', NULL, 5),
(22, 'in', 100, 'initial_stock', NULL, 5),
(23, 'in', 400, 'initial_stock', NULL, 5);

-- ==================== PURCHASE ORDERS ====================
INSERT INTO purchase_orders (company_id, supplier_id, po_number, order_date, status, total_amount, grand_total, warehouse_id, created_by, expected_delivery_date, payment_status) VALUES
(1, 1, 'PO-2026-0001', '2026-01-05', 'received', 4750.00, 5700.00, 1, 10, '2026-01-12', 'paid'),
(1, 2, 'PO-2026-0002', '2026-01-08', 'received', 2400.00, 2880.00, 1, 10, '2026-01-15', 'paid'),
(1, 4, 'PO-2026-0003', '2026-01-20', 'received', 1560.00, 1872.00, 2, 10, '2026-01-28', 'paid'),
(1, 5, 'PO-2026-0004', '2026-02-01', 'sent', 2100.00, 2520.00, 1, 10, '2026-02-10', 'unpaid'),
(1, 3, 'PO-2026-0005', '2026-02-05', 'draft', 3200.00, 3840.00, 3, 10, '2026-02-20', 'unpaid'),
(1, 1, 'PO-2026-0006', '2026-02-10', 'cancelled', 1800.00, 2160.00, 1, 10, '2026-02-18', 'unpaid'),
(2, 6, 'PO-2026-0100', '2026-01-15', 'received', 33600.00, 40320.00, 4, 1, '2026-01-25', 'paid'),
(2, 6, 'PO-2026-0101', '2026-02-05', 'sent', 10400.00, 12480.00, 4, 1, '2026-02-18', 'unpaid'),
(3, 8, 'PO-2026-0200', '2026-01-10', 'received', 12450.00, 12450.00, 5, 1, '2026-01-18', 'paid'),
(3, 9, 'PO-2026-0201', '2026-02-01', 'sent', 8600.00, 8600.00, 5, 1, '2026-02-12', 'unpaid');

-- ==================== PURCHASE ORDER ITEMS ====================
INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity) VALUES
-- PO-0001: Global Sourcing - Laptops
(1, 1, 5, 875.00, 4375.00, 5),
(1, 2, 1, 375.00, 375.00, 1),
-- PO-0002: TechParts - Peripherals
(2, 3, 30, 48.00, 1440.00, 30),
(2, 4, 40, 24.00, 960.00, 40),
-- PO-0003: Office Essentials
(3, 6, 10, 42.00, 420.00, 10),
(3, 7, 50, 12.00, 600.00, 50),
(3, 8, 60, 9.00, 540.00, 60),
-- PO-0004: Packaging Plus
(4, 11, 50, 16.00, 800.00, 0),
(4, 12, 30, 28.00, 840.00, 0),
(4, 13, 20, 22.00, 440.00, 0),
-- PO-0005: Raw Materials Co.
(5, 10, 4, 420.00, 1680.00, 0),
(5, 9, 4, 215.00, 860.00, 0),
-- PO-0006: cancelled
(6, 5, 50, 19.00, 950.00, 0),
(6, 3, 20, 48.00, 960.00, 0),
-- PO-0100: ChipSource - GlobalTech
(7, 14, 4, 5200.00, 20800.00, 4),
(7, 15, 10, 780.00, 7800.00, 10),
(7, 16, 2, 1500.00, 3000.00, 2),
-- PO-0101: ChipSource
(8, 17, 50, 82.00, 4100.00, 0),
(8, 18, 8, 510.00, 4080.00, 0),
(8, 16, 1, 1500.00, 1500.00, 0),
-- PO-0200: MedSupply - MediCore
(9, 19, 50, 52.00, 2600.00, 50),
(9, 20, 30, 78.00, 2340.00, 30),
(9, 21, 100, 24.00, 2400.00, 100),
(9, 22, 40, 42.00, 1680.00, 40),
(9, 23, 60, 17.00, 1020.00, 60),
-- PO-0201: PharmaDirect
(10, 19, 30, 52.00, 1560.00, 0),
(10, 21, 50, 24.00, 1200.00, 0),
(10, 22, 30, 42.00, 1260.00, 0),
(10, 23, 200, 17.00, 3400.00, 0);

-- ==================== CHART OF ACCOUNTS ====================
INSERT INTO chart_of_accounts (company_id, account_code, account_name, account_type, parent_account_id, description, is_active) VALUES
-- Company 1: Acme Corp
(1, '1000', 'Cash and Cash Equivalents', 'asset', NULL, 'Cash on hand and in bank accounts', true),
(1, '1100', 'Accounts Receivable', 'asset', NULL, 'Customer invoices outstanding', true),
(1, '1200', 'Inventory', 'asset', NULL, 'Product inventory value', true),
(1, '1300', 'Prepaid Expenses', 'asset', NULL, 'Prepaid rent, insurance, etc.', true),
(1, '1400', 'Fixed Assets', 'asset', NULL, 'Property, plant and equipment', true),
(1, '1410', 'Accumulated Depreciation', 'asset', NULL, 'Accumulated depreciation on fixed assets', true),
(1, '2000', 'Accounts Payable', 'liability', NULL, 'Supplier invoices outstanding', true),
(1, '2100', 'Accrued Liabilities', 'liability', NULL, 'Accrued expenses', true),
(1, '2200', 'Short-term Loans', 'liability', NULL, 'Short-term borrowing', true),
(1, '2300', 'Tax Payable', 'liability', NULL, 'Sales tax/VAT payable', true),
(1, '3000', 'Retained Earnings', 'equity', NULL, 'Accumulated retained earnings', true),
(1, '3100', 'Common Stock', 'equity', NULL, 'Share capital', true),
(1, '4000', 'Sales Revenue', 'revenue', NULL, 'Revenue from product sales', true),
(1, '4100', 'Service Revenue', 'revenue', NULL, 'Revenue from services', true),
(1, '4200', 'Discounts Given', 'revenue', NULL, 'Sales discounts and allowances', true),
(1, '5000', 'Cost of Goods Sold', 'expense', NULL, 'Direct cost of products sold', true),
(1, '5100', 'Salaries and Wages', 'expense', NULL, 'Employee compensation', true),
(1, '5200', 'Rent and Utilities', 'expense', NULL, 'Office rent and utility bills', true),
(1, '5300', 'Office Supplies Expense', 'expense', NULL, 'Office consumables', true),
(1, '5400', 'Marketing and Advertising', 'expense', NULL, 'Marketing and promotional costs', true),
(1, '5500', 'Shipping and Freight', 'expense', NULL, 'Freight and logistics costs', true),
(1, '5600', 'Depreciation Expense', 'expense', NULL, 'Periodic depreciation charges', true),
(1, '5700', 'Bank Charges', 'expense', NULL, 'Bank service fees', true),
(1, '5800', 'Miscellaneous Expense', 'expense', NULL, 'Other operating expenses', true),
(1, '6000', 'Income Tax Expense', 'expense', NULL, 'Corporate income tax', true),
-- Company 2: GlobalTech
(2, '1000', 'Cash and Cash Equivalents', 'asset', NULL, 'Cash on hand and in bank accounts', true),
(2, '1100', 'Accounts Receivable', 'asset', NULL, 'Customer invoices outstanding', true),
(2, '1200', 'Inventory', 'asset', NULL, 'Product inventory value', true),
(2, '1400', 'Fixed Assets', 'asset', NULL, 'Property, plant and equipment', true),
(2, '2000', 'Accounts Payable', 'liability', NULL, 'Supplier invoices outstanding', true),
(2, '3000', 'Retained Earnings', 'equity', NULL, 'Accumulated retained earnings', true),
(2, '4000', 'Sales Revenue', 'revenue', NULL, 'Revenue from product sales', true),
(2, '5000', 'Cost of Goods Sold', 'expense', NULL, 'Direct cost of products sold', true),
(2, '5100', 'Salaries and Wages', 'expense', NULL, 'Employee compensation', true),
(2, '5200', 'Rent and Utilities', 'expense', NULL, 'Office rent and utility bills', true),
-- Company 3: MediCore
(3, '1000', 'Cash and Cash Equivalents', 'asset', NULL, 'Cash on hand and in bank accounts', true),
(3, '1100', 'Accounts Receivable', 'asset', NULL, 'Customer invoices outstanding', true),
(3, '1200', 'Inventory', 'asset', NULL, 'Product inventory value', true),
(3, '2000', 'Accounts Payable', 'liability', NULL, 'Supplier invoices outstanding', true),
(3, '3000', 'Retained Earnings', 'equity', NULL, 'Accumulated retained earnings', true),
(3, '4000', 'Sales Revenue', 'revenue', NULL, 'Revenue from product sales', true),
(3, '5000', 'Cost of Goods Sold', 'expense', NULL, 'Direct cost of products sold', true),
(3, '5100', 'Salaries and Wages', 'expense', NULL, 'Employee compensation', true),
(3, '5200', 'Medical Equipment Lease', 'expense', NULL, 'Medical equipment leasing costs', true),
(3, '5300', 'Quality Compliance', 'expense', NULL, 'Regulatory and compliance costs', true);

-- ==================== JOURNAL ENTRIES ====================
INSERT INTO journal_entries (company_id, entry_date, voucher_no, voucher_type, total_debit, total_credit, status, reference_type, reference_id, description, created_by) VALUES
(1, '2026-01-10', 'JV-2026-0001', 'Receipt', 2025.56, 2025.56, 'posted', 'sales_order', 1, 'Sales invoice for SO-2026-0001 - TechVantage Solutions', 3),
(1, '2026-01-15', 'JV-2026-0002', 'Receipt', 361.13, 361.13, 'posted', 'sales_order', 2, 'Sales invoice for SO-2026-0002 - BrightPath Education', 3),
(1, '2026-01-18', 'JV-2026-0003', 'Payment', 5700.00, 5700.00, 'posted', 'purchase_order', 1, 'Supplier payment for PO-2026-0001 - Global Sourcing Inc.', 10),
(1, '2026-01-22', 'JV-2026-0004', 'Receipt', 980.98, 980.98, 'posted', 'sales_order', 3, 'Sales invoice for SO-2026-0003 - GreenLeaf Landscaping', 7),
(1, '2026-01-25', 'JV-2026-0005', 'Payment', 2880.00, 2880.00, 'posted', 'purchase_order', 2, 'Supplier payment for PO-2026-0002 - TechParts Distribution', 10),
(1, '2026-01-31', 'JV-2026-0006', 'Journal', 45000.00, 45000.00, 'posted', NULL, NULL, 'Monthly salary journal for January 2026', 9),
(1, '2026-01-31', 'JV-2026-0007', 'Journal', 12000.00, 12000.00, 'posted', NULL, NULL, 'Monthly rent and utilities allocation', 9),
(1, '2026-02-05', 'JV-2026-0008', 'Receipt', 4600.80, 4600.80, 'posted', 'sales_order', 4, 'Sales invoice for SO-2026-0004 - Summit Hospitality', 7),
(1, '2026-02-08', 'JV-2026-0009', 'Receipt', 2338.80, 2338.80, 'posted', 'sales_order', 6, 'Sales invoice for SO-2026-0006 - CloudBase IT', 7),
(1, '2026-02-10', 'JV-2026-0010', 'Payment', 1872.00, 1872.00, 'posted', 'purchase_order', 3, 'Supplier payment for PO-2026-0003 - Office Essentials Ltd.', 10),
(1, '2026-02-15', 'JV-2026-0011', 'Journal', 850.00, 850.00, 'draft', NULL, NULL, 'Depreciation for February 2026', 9),
(1, '2026-02-28', 'JV-2026-0012', 'Journal', 45000.00, 45000.00, 'draft', NULL, NULL, 'Monthly salary journal for February 2026', 9);

-- ==================== JOURNAL ENTRY LINES ====================
INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration) VALUES
-- JV-0001: SO-0001 TechVantage
(1, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='1100'), 2025.56, 0, 'AR from TechVantage Solutions'),
(1, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='4000'), 0, 1687.97, 'Sales revenue - SO-2026-0001'),
(1, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='2300'), 0, 337.59, 'Sales tax payable'),
-- JV-0002: SO-0002 BrightPath
(2, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='1100'), 361.13, 0, 'AR from BrightPath Education'),
(2, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='4000'), 0, 343.93, 'Sales revenue - SO-2026-0002'),
(2, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='2300'), 0, 17.20, 'Sales tax payable'),
-- JV-0003: PO-0001 Global Sourcing
(3, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='1200'), 4750.00, 0, 'Inventory received - PO-2026-0001'),
(3, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='2300'), 950.00, 0, 'Input VAT recoverable'),
(3, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='2000'), 0, 5700.00, 'Accounts payable - Global Sourcing Inc.'),
-- JV-0004: SO-0003 GreenLeaf
(4, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='1100'), 980.98, 0, 'AR from GreenLeaf Landscaping'),
(4, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='4000'), 0, 817.48, 'Sales revenue - SO-2026-0003'),
(4, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='2300'), 0, 163.50, 'Sales tax payable'),
-- JV-0005: PO-0002 TechParts
(5, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='1200'), 2400.00, 0, 'Inventory received - PO-2026-0002'),
(5, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='2300'), 480.00, 0, 'Input VAT recoverable'),
(5, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='2000'), 0, 2880.00, 'Accounts payable - TechParts Distribution'),
-- JV-0006: January salaries
(6, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='5100'), 45000.00, 0, 'January 2026 salaries'),
(6, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='1000'), 0, 45000.00, 'Salary payments disbursed'),
-- JV-0007: Rent and utilities
(7, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='5200'), 12000.00, 0, 'January rent and utilities'),
(7, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='1000'), 0, 12000.00, 'Rent and utilities payment'),
-- JV-0008: SO-0004 Summit Hospitality
(8, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='1100'), 4600.80, 0, 'AR from Summit Hospitality Group'),
(8, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='4000'), 0, 3834.00, 'Sales revenue - SO-2026-0004'),
(8, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='2300'), 0, 766.80, 'Sales tax payable'),
-- JV-0009: SO-0006 CloudBase IT
(9, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='1100'), 2338.80, 0, 'AR from CloudBase IT Services'),
(9, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='4000'), 0, 1949.00, 'Sales revenue - SO-2026-0006'),
(9, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='2300'), 0, 389.80, 'Sales tax payable'),
-- JV-0010: PO-0003 Office Essentials
(10, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='1200'), 1560.00, 0, 'Inventory received - PO-2026-0003'),
(10, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='2300'), 312.00, 0, 'Input VAT recoverable'),
(10, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='2000'), 0, 1872.00, 'Accounts payable - Office Essentials Ltd.'),
-- JV-0011: Depreciation
(11, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='5600'), 850.00, 0, 'Monthly depreciation charge'),
(11, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='1410'), 0, 850.00, 'Accumulated depreciation'),
-- JV-0012: February salaries
(12, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='5100'), 45000.00, 0, 'February 2026 salaries'),
(12, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='1000'), 0, 45000.00, 'Salary payments disbursed');

-- ==================== INVOICES ====================
INSERT INTO invoices (company_id, invoice_number, sales_order_id, customer_id, invoice_date, due_date, status, subtotal, tax_total, grand_total, amount_paid, balance_due, payment_terms, notes, created_by) VALUES
(1, 'INV-2026-0001', 1, 1, '2026-01-10', '2026-02-09', 'paid', 1687.97, 337.59, 2025.56, 2025.56, 'Net 30', 'Payment received via wire transfer', 3),
(1, 'INV-2026-0002', 2, 2, '2026-01-15', '2026-02-14', 'paid', 343.93, 17.20, 361.13, 361.13, 'Net 30', 'Paid by credit card', 3),
(1, 'INV-2026-0003', 3, 3, '2026-01-22', '2026-02-21', 'sent', 817.48, 163.50, 980.98, 0.00, 'Net 30', 'Payment pending - follow up', 7),
(1, 'INV-2026-0004', 4, 4, '2026-02-01', '2026-03-03', 'sent', 3834.00, 766.80, 4600.80, 0.00, 'Net 30', 'Due early March', 7),
(1, 'INV-2026-0005', 5, 5, '2026-02-05', '2026-03-07', 'draft', 1424.00, 284.80, 1708.80, 0.00, 'Net 30', 'Awaiting final approval', 3),
(1, 'INV-2026-0006', 6, 6, '2026-02-10', '2026-03-12', 'sent', 1949.00, 389.80, 2338.80, 0.00, 'Net 30', 'Partial payment expected', 7),
(1, 'INV-2026-0007', 7, 1, '2026-02-18', '2026-03-20', 'draft', 889.50, 177.90, 1067.40, 0.00, 'Net 30', 'To be sent next week', 3),
(3, 'INV-2026-0200', 11, 9, '2026-01-12', '2026-02-11', 'paid', 4010.00, 0.00, 4010.00, 4010.00, 'Net 30', 'Tax exempt medical supplies', 1),
(3, 'INV-2026-0201', 12, 10, '2026-02-03', '2026-03-05', 'sent', 5030.00, 0.00, 5030.00, 2000.00, 'Net 30', 'Partial payment received', 1);

-- ==================== INVOICE ITEMS ====================
INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total) VALUES
(1, 1, 'ProBook Laptop 15"', 1, 1299.00, 0.00, 20.00, 1299.00),
(1, 2, 'UltraSharp 27" 4K Monitor', 1, 389.99, 0.00, 20.00, 389.99),
(1, 5, 'USB-C 7-in-1 Hub', 1, 39.99, 2.50, 20.00, 38.99),
(2, 6, 'Premium Multi-Purpose Paper (5000 ct)', 2, 64.99, 0.00, 5.00, 129.98),
(2, 7, 'Executive Ballpoint Pen Set (12 pcs)', 5, 24.99, 0.00, 5.00, 124.95),
(2, 8, 'Hanging File Folders (25 pcs)', 5, 18.99, 2.00, 5.00, 92.99),
(3, 3, 'Wireless Ergonomic Keyboard', 2, 89.99, 0.00, 20.00, 179.98),
(3, 4, 'Precision Wireless Mouse', 3, 49.99, 0.00, 20.00, 149.97),
(3, 5, 'USB-C 7-in-1 Hub', 5, 39.99, 5.00, 20.00, 189.95),
(3, 7, 'Executive Ballpoint Pen Set (12 pcs)', 10, 24.99, 3.00, 5.00, 242.40),
(3, 8, 'Hanging File Folders (25 pcs)', 3, 18.99, 0.00, 5.00, 56.97),
(4, 2, 'UltraSharp 27" 4K Monitor', 5, 549.00, 5.00, 20.00, 2607.75),
(4, 4, 'Precision Wireless Mouse', 10, 49.99, 3.00, 20.00, 484.90),
(4, 5, 'USB-C 7-in-1 Hub', 20, 39.99, 5.00, 20.00, 759.81),
(5, 9, 'Ergonomic Office Chair', 2, 399.00, 0.00, 20.00, 798.00),
(5, 10, 'Standing Desk Electric 60"', 1, 549.00, 0.00, 20.00, 549.00),
(5, 13, 'Bubble Wrap Roll (175 ft)', 2, 38.50, 0.00, 5.00, 77.00),
(6, 1, 'ProBook Laptop 15"', 1, 1299.00, 0.00, 20.00, 1299.00),
(6, 4, 'Precision Wireless Mouse', 2, 49.99, 0.00, 20.00, 99.98),
(6, 5, 'USB-C 7-in-1 Hub', 5, 39.99, 0.00, 20.00, 199.95),
(6, 3, 'Wireless Ergonomic Keyboard', 3, 89.99, 5.00, 20.00, 256.47),
(7, 2, 'UltraSharp 27" 4K Monitor', 1, 389.99, 0.00, 20.00, 389.99),
(7, 4, 'Precision Wireless Mouse', 3, 49.99, 0.00, 20.00, 149.97),
(7, 7, 'Executive Ballpoint Pen Set (12 pcs)', 10, 24.99, 0.00, 5.00, 249.90),
(7, 8, 'Hanging File Folders (25 pcs)', 5, 18.99, 1.00, 5.00, 94.00),
(8, 19, 'Surgical Face Masks (500 ct)', 10, 89.00, 0.00, 0.00, 890.00),
(8, 20, 'Nitrile Exam Gloves (1000 ct)', 5, 129.00, 0.00, 0.00, 645.00),
(8, 21, 'Digital Forehead Thermometer', 20, 45.00, 0.00, 0.00, 900.00),
(8, 22, 'Automatic Blood Pressure Monitor', 15, 79.00, 0.00, 0.00, 1185.00),
(8, 23, 'Disposable Syringes 5ml (200 ct)', 10, 32.00, 0.00, 0.00, 320.00),
(9, 19, 'Surgical Face Masks (500 ct)', 20, 89.00, 2.00, 0.00, 1744.40),
(9, 20, 'Nitrile Exam Gloves (1000 ct)', 10, 129.00, 2.00, 0.00, 1264.20),
(9, 21, 'Digital Forehead Thermometer', 30, 45.00, 2.00, 0.00, 1323.00),
(9, 23, 'Disposable Syringes 5ml (200 ct)', 15, 32.00, 0.00, 0.00, 480.00);

-- ==================== PAYMENTS ====================
INSERT INTO payments (company_id, invoice_id, payment_number, payment_date, amount, payment_method, reference_number, notes, created_by) VALUES
(1, 1, 'PAY-2026-0001', '2026-01-20', 2025.56, 'Wire Transfer', 'WIRE-2026-00123', 'Payment for INV-2026-0001 - TechVantage', 9),
(1, 2, 'PAY-2026-0002', '2026-01-28', 361.13, 'Credit Card', 'CC-4859-1234-5678-9012', 'CC payment for INV-2026-0002 - BrightPath', 9),
(3, 8, 'PAY-2026-0200', '2026-01-25', 4010.00, 'Wire Transfer', 'WIRE-2026-00456', 'Payment for INV-2026-0200 - Springfield General', 1),
(3, 9, 'PAY-2026-0201', '2026-02-15', 2000.00, 'Check', 'CK-10234', 'Partial payment for INV-2026-0201 - Wellness Pharmacy', 1);

-- ==================== EXPENSE CATEGORIES ====================
INSERT INTO expense_categories (company_id, name, description, is_active) VALUES
(1, 'Office Rent', 'Monthly office lease payments', true),
(1, 'Utilities', 'Electricity, water, internet, phone', true),
(1, 'Travel & Meals', 'Business travel and client meals', true),
(1, 'Software Subscriptions', 'SaaS and software licenses', true),
(1, 'Maintenance & Repairs', 'Equipment and facility maintenance', true),
(1, 'Professional Services', 'Legal, consulting, accounting fees', true),
(1, 'Insurance', 'Business insurance premiums', true),
(1, 'Office Equipment', 'Non-capital office equipment purchases', true);

-- ==================== EXPENSES ====================
INSERT INTO expenses (company_id, expense_date, category, category_id, description, amount, payment_method, reference_number, created_by) VALUES
(1, '2026-01-05', 'Office Rent', 1, 'January 2026 office rent - 1200 Broadway', 15000.00, 'Wire Transfer', 'RENT-2026-01', 9),
(1, '2026-01-08', 'Utilities', 2, 'January utilities - electricity and internet', 2400.00, 'Wire Transfer', 'UTIL-2026-01', 9),
(1, '2026-01-12', 'Software Subscriptions', 4, 'Annual Salesforce CRM renewal', 7200.00, 'Credit Card', 'SAAS-SF-2026', 6),
(1, '2026-01-18', 'Travel & Meals', 3, 'Client dinner - Summit Hospitality negotiation', 340.50, 'Corporate Card', 'TRAV-2026-018', 7),
(1, '2026-02-02', 'Office Rent', 1, 'February 2026 office rent - 1200 Broadway', 15000.00, 'Wire Transfer', 'RENT-2026-02', 9),
(1, '2026-02-05', 'Professional Services', 6, 'Quarterly tax filing and compliance', 3500.00, 'Wire Transfer', 'PROF-TAX-Q1', 2),
(1, '2026-02-10', 'Maintenance & Repairs', 5, 'HVAC repair - Main warehouse', 1850.00, 'Check', 'CK-2026-042', 4),
(1, '2026-02-15', 'Insurance', 7, 'Annual general liability insurance premium', 4800.00, 'Wire Transfer', 'INS-GL-2026', 2);

-- ==================== COST CENTERS ====================
INSERT INTO cost_centers (company_id, code, name, description, is_active) VALUES
(1, 'CC-SALES', 'Sales Department', 'Sales and customer acquisition costs', true),
(1, 'CC-OPS', 'Operations', 'Warehouse and logistics costs', true),
(1, 'CC-FIN', 'Finance', 'Finance and accounting department', true),
(1, 'CC-HR', 'Human Resources', 'HR and personnel costs', true),
(1, 'CC-IT', 'Information Technology', 'IT infrastructure and support', true),
(1, 'CC-MKT', 'Marketing', 'Marketing and advertising', true),
(1, 'CC-ADMIN', 'General Administration', 'General and administrative costs', true);

-- ==================== BUDGETS ====================
INSERT INTO budgets (company_id, fiscal_year, name, status, notes, created_by) VALUES
(1, 2026, 'Annual Operating Budget 2026', 'approved', 'Board-approved operating budget for fiscal year 2026', 2);

INSERT INTO budget_items (budget_id, account_id, cost_center_id, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec) VALUES
(1, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='5100'), 4, 45000, 45000, 45000, 45000, 45000, 45000, 47000, 47000, 47000, 47000, 47000, 47000),
(1, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='5200'), 7, 15000, 15000, 15000, 15000, 15000, 15000, 15000, 15000, 15000, 15000, 15000, 15000),
(1, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='5400'), 6, 5000, 5000, 5000, 8000, 8000, 12000, 8000, 8000, 5000, 5000, 5000, 5000),
(1, (SELECT id FROM chart_of_accounts WHERE company_id=1 AND account_code='5500'), 2, 3500, 3500, 3500, 4000, 4000, 4000, 4500, 4500, 4000, 4000, 3500, 3500);

-- ==================== FIXED ASSETS ====================
INSERT INTO asset_categories (company_id, code, name, default_depreciation_method, default_useful_life, is_active) VALUES
(1, 'VEH', 'Vehicles', 'straight_line', 5, true),
(1, 'COM', 'Computer Equipment', 'straight_line', 3, true),
(1, 'FUR', 'Furniture and Fixtures', 'straight_line', 7, true),
(1, 'MAC', 'Machinery and Equipment', 'straight_line', 10, true),
(1, 'BUI', 'Buildings', 'straight_line', 30, true);

INSERT INTO fixed_assets (company_id, asset_code, name, category_id, description, purchase_date, purchase_cost, current_value, salvage_value, useful_life, depreciation_method, accumulated_depreciation, depreciation_per_period, location, status, created_by) VALUES
(1, 'ASSET-001', 'Forklift - Toyota 8FGCU25', 4, 'Toyota 8FGCU25 propane forklift, 5000lb capacity', '2024-03-15', 28500.00, 22800.00, 3000.00, 10, 'straight_line', 5700.00, 237.50, 'Main Warehouse', 'active', 10),
(1, 'ASSET-002', 'Server Rack - Dell PowerEdge MX7000', 2, 'Dell MX7000 modular server chassis with 4 blades', '2025-01-20', 42000.00, 35000.00, 2000.00, 3, 'straight_line', 7000.00, 1166.67, 'IT Room - HQ', 'active', 6),
(1, 'ASSET-003', 'Executive Conference Table', 3, 'Custom mahogany conference table, 12 seats', '2023-06-01', 8500.00, 6071.43, 500.00, 7, 'straight_line', 2428.57, 95.24, 'Boardroom - 5th Floor', 'active', 1),
(1, 'ASSET-004', 'Chevrolet Express 3500 Delivery Van', 1, '2024 Chevrolet Express 3500 cargo van', '2024-09-01', 38500.00, 30800.00, 8500.00, 5, 'straight_line', 7700.00, 500.00, 'East DC Fleet', 'active', 10),
(1, 'ASSET-005', 'Warehouse Shelving System', 4, 'Industrial bolted shelving, 50 bays, 1000lb capacity each', '2022-11-01', 28000.00, 18666.67, 2000.00, 10, 'straight_line', 9333.33, 216.67, 'Main Warehouse', 'active', 4);

-- ==================== ASSET DEPRECIATION ====================
INSERT INTO asset_depreciation (company_id, asset_id, period_date, amount, running_balance) VALUES
(1, 1, '2026-01-31', 237.50, 5937.50),
(1, 1, '2026-02-28', 237.50, 6175.00),
(1, 2, '2026-01-31', 1166.67, 8166.67),
(1, 2, '2026-02-28', 1166.67, 9333.34),
(1, 3, '2026-01-31', 95.24, 2523.81),
(1, 3, '2026-02-28', 95.24, 2619.05),
(1, 4, '2026-01-31', 500.00, 8200.00),
(1, 4, '2026-02-28', 500.00, 8700.00),
(1, 5, '2026-01-31', 216.67, 9550.00),
(1, 5, '2026-02-28', 216.67, 9766.67);

-- ==================== SERVICES ====================
INSERT INTO services (company_id, name, description, category, unit_price, tax_percent, is_active, created_by) VALUES
(1, 'IT Support - Premium (per month)', 'Dedicated IT support with 4hr SLA', 'IT Services', 299.00, 20.00, true, 6),
(1, 'Equipment Installation Service', 'On-site equipment installation and setup', 'Installation', 150.00, 20.00, true, 6),
(1, 'Extended Warranty (1 year)', 'Extended manufacturer warranty for 1 additional year', 'Warranty', 79.99, 20.00, true, 3),
(1, 'Warehouse Storage (per pallet/month)', 'Climate-controlled pallet storage', 'Logistics', 35.00, 5.00, true, 4),
(1, 'Consulting (per hour)', 'Business process consulting', 'Consulting', 200.00, 20.00, true, 1);

-- ==================== QUOTATIONS ====================
INSERT INTO quotations (company_id, customer_id, quote_number, quote_date, expiry_date, status, subtotal, tax_total, discount_total, grand_total, notes, created_by) VALUES
(1, 4, 'Q-2026-0001', '2026-01-20', '2026-02-20', 'converted', 3834.00, 766.80, 0.00, 4600.80, 'Converted to SO-2026-0004', 7),
(1, 6, 'Q-2026-0002', '2026-01-25', '2026-02-25', 'converted', 1949.00, 389.80, 0.00, 2338.80, 'Converted to SO-2026-0006', 3),
(1, 1, 'Q-2026-0003', '2026-02-10', '2026-03-10', 'sent', 1299.00, 259.80, 0.00, 1558.80, 'Follow-up pending for bulk laptop order', 7),
(1, 5, 'Q-2026-0004', '2026-02-12', '2026-03-12', 'draft', 3200.00, 640.00, 0.00, 3840.00, 'Draft - awaiting pricing approval', 3),
(1, 3, 'Q-2026-0005', '2026-02-18', '2026-03-18', 'sent', 480.00, 96.00, 0.00, 576.00, 'Small equipment rental quote', 7);

-- ==================== QUOTATION ITEMS ====================
INSERT INTO quotation_items (quotation_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total) VALUES
(1, 2, 'UltraSharp 27" 4K Monitor', 5, 549.00, 5.00, 20.00, 2607.75),
(1, 4, 'Precision Wireless Mouse', 10, 49.99, 3.00, 20.00, 484.90),
(1, 5, 'USB-C 7-in-1 Hub', 20, 39.99, 5.00, 20.00, 759.81),
(2, 1, 'ProBook Laptop 15"', 1, 1299.00, 0.00, 20.00, 1299.00),
(2, 4, 'Precision Wireless Mouse', 2, 49.99, 0.00, 20.00, 99.98),
(2, 5, 'USB-C 7-in-1 Hub', 5, 39.99, 0.00, 20.00, 199.95),
(2, 3, 'Wireless Ergonomic Keyboard', 3, 89.99, 5.00, 20.00, 256.47),
(3, 1, 'ProBook Laptop 15"', 1, 1299.00, 0.00, 20.00, 1299.00),
(4, 9, 'Ergonomic Office Chair', 5, 399.00, 0.00, 20.00, 1995.00),
(4, 10, 'Standing Desk Electric 60"', 2, 549.00, 0.00, 20.00, 1098.00),
(5, 8, 'Hanging File Folders (25 pcs)', 10, 18.99, 0.00, 20.00, 189.90),
(5, 7, 'Executive Ballpoint Pen Set (12 pcs)', 10, 24.99, 0.00, 20.00, 249.90);

-- ==================== LEADS ====================
INSERT INTO leads (company_id, salutation, first_name, last_name, email, phone, mobile, company, designation, source_id, status_id, assigned_to, address, city, state, country, notes, created_by) VALUES
(1, 'Mr.', 'Thomas', 'Anderson', 'thomas.anderson@metacortex.com', '+1 (415) 555-8001', '+1 (415) 555-8001', 'MetaCortex Corp', 'IT Director', 1, 5, 3, '100 Mission Street', 'San Francisco', 'CA', 'United States', 'Interested in bulk laptop order for 50 employees. Negotiating pricing.', 7),
(1, 'Ms.', 'Diana', 'Prince', 'diana.prince@themyscira.foundation', '+1 (202) 555-8002', '+1 (202) 555-8002', 'Themyscira Foundation', 'Executive Director', 2, 2, 3, '200 L Street NW', 'Washington', 'DC', 'United States', 'Referred by existing client. Needs office supplies and equipment.', 7),
(1, 'Dr.', 'Bruce', 'Banner', 'bruce.banner@culver.edu', '+1 (518) 555-8003', '+1 (518) 555-8003', 'Culver University', 'Research Director', 5, 3, 7, '1 University Plaza', 'Troy', 'NY', 'United States', 'Lab equipment needs. Follow up for quote.', 7),
(1, 'Mrs.', 'Lois', 'Lane', 'lois.lane@dailyplanet.com', '+1 (212) 555-8004', '+1 (212) 555-8004', 'Daily Planet Media', 'Managing Editor', 4, 1, 3, '355 Lexington Avenue', 'New York', 'NY', 'United States', 'Email campaign response. Requested catalog.', 7),
(1, 'Mr.', 'Tony', 'Stark', 'tony@starkindustries.com', '+1 (310) 555-8005', '+1 (310) 555-8005', 'Stark Industries', 'CEO', 7, 6, 3, '10880 Malibu Point', 'Malibu', 'CA', 'United States', 'Trade show contact. Won - order to be placed next quarter.', 7);

-- ==================== OPPORTUNITIES ====================
INSERT INTO opportunities (company_id, lead_id, name, expected_revenue, probability, expected_close_date, stage, priority, assigned_to, created_by) VALUES
(1, 1, 'MetaCortex - IT Equipment Upgrade', 65000.00, 60, '2026-03-31', 'negotiation', 'high', 3, 7),
(1, 3, 'Culver University - Lab Equipment', 28000.00, 30, '2026-04-30', 'proposal', 'medium', 7, 7),
(1, 4, 'Daily Planet - Office Supplies Contract', 8500.00, 20, '2026-05-15', 'qualification', 'low', 3, 7);

-- ==================== FOLLOW-UPS ====================
INSERT INTO follow_ups (company_id, lead_id, opportunity_id, title, description, due_date, status, priority, assigned_to, created_by) VALUES
(1, 1, 1, 'Send revised pricing proposal', 'Prepare volume discount pricing for 50 laptops', '2026-03-01', 'pending', 'high', 3, 7),
(1, 3, 2, 'Schedule lab demo', 'Arrange demo of industrial equipment for Dr. Banner', '2026-03-10', 'pending', 'medium', 7, 7),
(1, 4, 3, 'Send catalog and pricing', 'Mail the latest office supplies catalog', '2026-02-28', 'completed', 'low', 3, 7),
(1, 5, NULL, 'Thank you note', 'Send thank you note after trade show meeting', '2026-02-20', 'completed', 'low', 3, 7);

-- ==================== PROJECTS ====================
INSERT INTO projects (company_id, project_code, name, description, customer_id, start_date, end_date, budget_amount, status, priority, created_by) VALUES
(1, 'PRJ-2026-001', 'Warehouse Automation Upgrade', 'Install automated conveyor system and barcode scanners at Main Warehouse', NULL, '2026-01-15', '2026-04-30', 75000.00, 'in_progress', 'high', 12),
(1, 'PRJ-2026-002', 'ERP System Implementation', 'Company-wide ERP system rollout phase 2', NULL, '2026-02-01', '2026-08-31', 120000.00, 'planning', 'high', 6),
(1, 'PRJ-2026-003', 'Website Redesign', 'Complete overhaul of corporate website and e-commerce platform', NULL, '2026-01-10', '2026-03-15', 25000.00, 'in_progress', 'medium', 11),
(1, 'PRJ-2026-004', 'Client Onboarding - Summit Hospitality', 'Manage new client onboarding and initial order fulfillment', 4, '2026-02-01', '2026-03-15', 5000.00, 'in_progress', 'medium', 7);

-- ==================== PROJECT TASKS ====================
INSERT INTO project_tasks (company_id, project_id, name, description, assigned_to, start_date, due_date, estimated_hours, actual_hours, priority, status) VALUES
(1, 1, 'Requirements gathering', 'Interview warehouse staff and document requirements', 12, '2026-01-15', '2026-01-25', 20.00, 22.00, 'high', 'completed'),
(1, 1, 'Vendor selection', 'Evaluate and select conveyor system vendor', 12, '2026-01-26', '2026-02-10', 30.00, 28.00, 'high', 'completed'),
(1, 1, 'Installation', 'Install conveyor system hardware', 4, '2026-02-15', '2026-03-30', 160.00, 0.00, 'high', 'todo'),
(1, 2, 'System analysis', 'Analyze current processes and integration points', 6, '2026-02-01', '2026-02-20', 40.00, 5.00, 'high', 'in_progress'),
(1, 2, 'Data migration planning', 'Plan data migration from legacy systems', 6, '2026-02-21', '2026-03-10', 25.00, 0.00, 'high', 'todo'),
(1, 3, 'Design mockups', 'Create wireframes and UI mockups', 11, '2026-01-10', '2026-01-31', 40.00, 45.00, 'medium', 'completed'),
(1, 3, 'Frontend development', 'Build new frontend components', 6, '2026-02-01', '2026-03-01', 80.00, 30.00, 'medium', 'in_progress'),
(1, 4, 'Initial onboarding call', 'Welcome call with Summit Hospitality team', 7, '2026-02-01', '2026-02-02', 2.00, 2.00, 'medium', 'completed'),
(1, 4, 'First order processing', 'Process and ship order SO-2026-0004', 4, '2026-02-03', '2026-02-07', 10.00, 8.00, 'medium', 'completed');

-- ==================== CRM EMAIL TEMPLATES ====================
INSERT INTO crm_email_templates (company_id, name, subject, body, variables, is_active) VALUES
(1, 'Follow-up Email', 'Following up on our conversation', '<p>Dear {{first_name}},</p><p>It was great speaking with you. As promised, here is the information we discussed.</p>', '["first_name","company_name"]', true),
(1, 'Welcome New Lead', 'Welcome to Acme Corporation', '<p>Thank you for your interest in our products. We look forward to serving you.</p>', '["first_name","company_name"]', true);

-- ==================== SYSTEM SETTINGS ====================
INSERT INTO system_settings (company_id, setting_key, setting_value, setting_type, category) VALUES
(1, 'company_name', 'Acme Corporation', 'string', 'general'),
(1, 'company_logo', '', 'image', 'general'),
(1, 'company_address', '1200 Broadway, Suite 400, New York, NY 10001', 'string', 'general'),
(1, 'company_phone', '+1 (212) 555-0198', 'string', 'general'),
(1, 'company_email', 'info@acmecorp.com', 'string', 'general'),
(1, 'company_tax_id', 'US45-6789012', 'string', 'general'),
(1, 'currency_symbol', '$', 'string', 'currency'),
(1, 'currency_code', 'USD', 'string', 'currency'),
(1, 'currency_position', 'before', 'string', 'currency'),
(1, 'decimal_places', '2', 'number', 'currency'),
(1, 'thousand_separator', ',', 'string', 'currency'),
(1, 'date_format', 'YYYY-MM-DD', 'string', 'general'),
(1, 'timezone', 'America/New_York', 'string', 'general'),
(1, 'primary_color', '#2563eb', 'string', 'appearance'),
(1, 'sidebar_color', '#1e293b', 'string', 'appearance'),
(1, 'theme', 'light', 'string', 'appearance'),
(1, 'maintenance_mode', 'false', 'boolean', 'system'),
(2, 'company_name', 'GlobalTech Industries', 'string', 'general'),
(2, 'company_logo', '', 'image', 'general'),
(2, 'company_address', '500 Innovation Drive, San Jose, CA 95134', 'string', 'general'),
(2, 'company_phone', '+1 (408) 555-0321', 'string', 'general'),
(2, 'company_email', 'contact@globaltech.com', 'string', 'general'),
(2, 'currency_symbol', '$', 'string', 'currency'),
(2, 'currency_code', 'USD', 'string', 'currency'),
(2, 'timezone', 'America/Los_Angeles', 'string', 'general'),
(3, 'company_name', 'MediCore Health Systems', 'string', 'general'),
(3, 'company_logo', '', 'image', 'general'),
(3, 'company_address', '200 Medical Plaza, Boston, MA 02115', 'string', 'general'),
(3, 'company_phone', '+1 (617) 555-0476', 'string', 'general'),
(3, 'company_email', 'hello@medicore.com', 'string', 'general'),
(3, 'currency_symbol', '$', 'string', 'currency'),
(3, 'currency_code', 'USD', 'string', 'currency'),
(3, 'timezone', 'America/New_York', 'string', 'general');

-- ==================== EMAIL TEMPLATES ====================
INSERT INTO email_templates (company_id, template_code, subject, body, variables) VALUES
(1, 'welcome_email', 'Welcome to {company_name}', '<h1>Welcome {user_name}!</h1><p>Your Acme Corporation account has been created. Please set up your password.</p>', '["user_name","company_name","login_link"]'),
(1, 'order_confirmation', 'Order Confirmation - {order_number}', '<h1>Thank you for your order!</h1><p>Order #{order_number} has been confirmed. Total: {total_amount}.</p>', '["order_number","customer_name","order_date","total_amount"]'),
(1, 'leave_approval', 'Leave Request Approved', '<p>Dear {employee_name}, your leave request from {start_date} to {end_date} has been approved.</p>', '["employee_name","start_date","end_date","leave_type"]'),
(1, 'invoice_sent', 'Invoice {invoice_number} is now available', '<p>Dear {customer_name}, invoice {invoice_number} for {amount} is now due by {due_date}.</p>', '["customer_name","invoice_number","amount","due_date"]'),
(1, 'purchase_order', 'New Purchase Order {po_number}', '<p>Purchase Order {po_number} has been issued. Total: {total_amount}.</p>', '["po_number","supplier_name","order_date","total_amount"]');

-- ==================== CRM INTERACTIONS ====================
INSERT INTO interactions (company_id, lead_id, customer_id, type, subject, notes, outcome, performed_by) VALUES
(1, 1, NULL, 'Call', 'Initial discovery call', 'Discussed laptop requirements for 50 employees. Needs docking stations and monitors too.', 'Positive - interest confirmed', 7),
(1, 1, NULL, 'Email', 'Sent preliminary quote', 'Sent quote for 50x ProBook laptops + accessories. Total est. $78,000.', 'Awaiting response', 7),
(1, 2, NULL, 'Call', 'Introduction call', 'Diana was referred by a mutual contact. She needs office furniture and supplies for a new office.', 'Interested in catalog', 7),
(1, 5, NULL, 'Meeting', 'Trade Show - CES 2026', 'Met Tony at the CES booth. Discussed automation solutions for Stark Industries manufacturing.', 'Promising lead for Q2', 3),
(1, NULL, 1, 'Email', 'Support ticket - shipping inquiry', 'Customer asked about shipping status for SO-2026-0001.', 'Resolved - tracking sent', 7),
(1, NULL, 4, 'Meeting', 'Quarterly business review', 'Quarterly review with Summit Hospitality. Discussed recurring orders and potential expansion.', 'Positive - planning larger Q2 order', 3);

-- ==================== STOCK TRANSFERS ====================
INSERT INTO stock_transfers (company_id, transfer_number, from_warehouse_id, to_warehouse_id, transfer_date, status, notes, created_by) VALUES
(1, 'ST-2026-0001', 1, 2, '2026-01-18', 'completed', 'Replenish East DC stock for BrightPath order', 4),
(1, 'ST-2026-0002', 1, 3, '2026-01-25', 'completed', 'Transfer inventory to West Coast hub for Apex order', 4),
(1, 'ST-2026-0003', 2, 1, '2026-02-05', 'draft', 'Return excess inventory to main warehouse', 4);

INSERT INTO stock_transfer_items (stock_transfer_id, product_id, quantity, unit_cost) VALUES
(1, 6, 5, 42.00),
(1, 7, 10, 12.00),
(1, 8, 10, 9.00),
(2, 10, 2, 420.00),
(2, 13, 5, 22.00);

-- ==================== SALES RETURNS ====================
INSERT INTO sales_returns (company_id, return_number, original_sales_order_id, customer_id, return_date, status, subtotal, tax_amount, total_amount, restock_inventory, notes, created_by) VALUES
(1, 'SR-2026-0001', 1, 1, '2026-01-25', 'approved', 38.99, 7.80, 46.79, true, 'USB-C hub defective - returned by TechVantage', 7);

INSERT INTO sales_return_items (sales_return_id, product_id, quantity, unit_price, discount_percent, total, return_reason_id, reason_text, condition) VALUES
(1, 5, 1, 39.99, 2.50, 38.99, 1, 'USB-C port not working consistently', 'defective');

-- ==================== CREDIT NOTES ====================
INSERT INTO credit_notes (company_id, credit_note_number, reference_type, reference_id, customer_id, issue_date, amount, status, notes) VALUES
(1, 'CN-2026-0001', 'sales_return', 1, 1, '2026-01-25', 46.79, 'issued', 'Credit for defective USB hub return SR-2026-0001');

-- ==================== LEAVE REQUESTS ====================
INSERT INTO leave_requests (company_id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status, created_by) VALUES
(1, 1, 1, '2026-03-10', '2026-03-14', 5, 'Family vacation to Florida', 'approved', 1),
(1, 3, 2, '2026-02-20', '2026-02-21', 2, 'Doctor appointment and recovery', 'approved', 3),
(1, 5, 1, '2026-04-01', '2026-04-05', 5, 'Spring break vacation', 'pending', 5),
(1, 9, 3, '2026-02-28', '2026-02-28', 1, 'Personal errand', 'approved', 9),
(1, 11, 2, '2026-03-05', '2026-03-06', 2, 'Medical leave', 'pending', 11);

-- ==================== ATTENDANCE ====================
INSERT INTO attendance (company_id, employee_id, date, check_in, check_out, status, overtime_hours, notes) VALUES
(1, 1, '2026-02-03', '08:45', '18:15', 'present', 1.25, 'Stayed late for board meeting prep'),
(1, 1, '2026-02-04', '09:00', '17:30', 'present', 0.00, NULL),
(1, 3, '2026-02-03', '08:30', '17:45', 'present', 0.75, 'Client call ran over'),
(1, 3, '2026-02-04', '09:15', '17:00', 'present', 0.00, 'Late due to traffic'),
(1, 4, '2026-02-03', '07:00', '16:30', 'present', 0.50, 'Inventory count'),
(1, 4, '2026-02-04', '06:45', '16:00', 'present', 0.00, NULL),
(1, 10, '2026-02-03', '08:00', '17:00', 'present', 0.00, NULL),
(1, 10, '2026-02-04', '08:10', '17:15', 'present', 0.00, NULL);

-- ==================== APPROVAL WORKFLOWS ====================
INSERT INTO approval_workflows (company_id, name, description, target_entity, is_active, created_by) VALUES
(1, 'Purchase Order Approval', 'Approval workflow for purchase orders above $1,000', 'purchase_order', true, 1),
(1, 'Sales Discount Approval', 'Approval for discounts exceeding 10% on sales orders', 'sales_order', true, 3),
(1, 'Leave Request Approval', 'Approval workflow for employee leave requests', 'leave_request', true, 5);

-- ==================== APPROVAL STEPS ====================
INSERT INTO approval_steps (workflow_id, step_order, min_amount, max_amount, requires_all) VALUES
(1, 1, 1000.00, 5000.00, false),
(1, 2, 5000.01, 999999.99, false),
(2, 1, 10.00, 30.00, false),
(3, 1, NULL, NULL, false);

-- ==================================================
-- STEP 5: RE-ENABLE TRIGGERS (if disabled above)
-- ==================================================
-- SET session_replication_role = 'origin';

COMMIT;

-- ==================================================
-- STEP 6: VERIFICATION - ROW COUNTS PER TABLE
-- ==================================================
BEGIN;
SELECT 'companies' AS table_name, COUNT(*) AS row_count FROM companies
UNION ALL SELECT 'customers', COUNT(*) FROM customers
UNION ALL SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'warehouses', COUNT(*) FROM warehouses
UNION ALL SELECT 'warehouse_bins', COUNT(*) FROM warehouse_bins
UNION ALL SELECT 'product_warehouse_stock', COUNT(*) FROM product_warehouse_stock
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
UNION ALL SELECT 'leave_requests', COUNT(*) FROM leave_requests
UNION ALL SELECT 'attendance', COUNT(*) FROM attendance
UNION ALL SELECT 'quotations', COUNT(*) FROM quotations
UNION ALL SELECT 'quotation_items', COUNT(*) FROM quotation_items
UNION ALL SELECT 'services', COUNT(*) FROM services
UNION ALL SELECT 'fixed_assets', COUNT(*) FROM fixed_assets
UNION ALL SELECT 'asset_categories', COUNT(*) FROM asset_categories
UNION ALL SELECT 'asset_depreciation', COUNT(*) FROM asset_depreciation
UNION ALL SELECT 'projects', COUNT(*) FROM projects
UNION ALL SELECT 'project_tasks', COUNT(*) FROM project_tasks
UNION ALL SELECT 'leads', COUNT(*) FROM leads
UNION ALL SELECT 'opportunities', COUNT(*) FROM opportunities
UNION ALL SELECT 'follow_ups', COUNT(*) FROM follow_ups
UNION ALL SELECT 'interactions', COUNT(*) FROM interactions
UNION ALL SELECT 'expenses', COUNT(*) FROM expenses
UNION ALL SELECT 'expense_categories', COUNT(*) FROM expense_categories
UNION ALL SELECT 'cost_centers', COUNT(*) FROM cost_centers
UNION ALL SELECT 'budgets', COUNT(*) FROM budgets
UNION ALL SELECT 'budget_items', COUNT(*) FROM budget_items
UNION ALL SELECT 'tax_rates', COUNT(*) FROM tax_rates
UNION ALL SELECT 'lead_sources', COUNT(*) FROM lead_sources
UNION ALL SELECT 'lead_statuses', COUNT(*) FROM lead_statuses
UNION ALL SELECT 'return_reasons', COUNT(*) FROM return_reasons
UNION ALL SELECT 'sales_returns', COUNT(*) FROM sales_returns
UNION ALL SELECT 'sales_return_items', COUNT(*) FROM sales_return_items
UNION ALL SELECT 'credit_notes', COUNT(*) FROM credit_notes
UNION ALL SELECT 'stock_transfers', COUNT(*) FROM stock_transfers
UNION ALL SELECT 'stock_transfer_items', COUNT(*) FROM stock_transfer_items
UNION ALL SELECT 'system_settings', COUNT(*) FROM system_settings
UNION ALL SELECT 'email_templates', COUNT(*) FROM email_templates
UNION ALL SELECT 'crm_email_templates', COUNT(*) FROM crm_email_templates
UNION ALL SELECT 'approval_workflows', COUNT(*) FROM approval_workflows
UNION ALL SELECT 'approval_steps', COUNT(*) FROM approval_steps
ORDER BY table_name;
COMMIT;
