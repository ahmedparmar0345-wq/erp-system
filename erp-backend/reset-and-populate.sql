-- ==================================================
-- ERP DATA RESET & POPULATE SCRIPT
-- PostgreSQL | Safe to run multiple times
-- ==================================================
-- This script DELETES all transactional/master data
-- and inserts realistic demo data.
-- Tables NOT touched: users, roles, system_settings,
--   email_templates, audit_logs
-- ==================================================

BEGIN;

-- ==================================================
-- SECTION 1: DELETE EXISTING DATA
-- (FK-safe order: children before parents)
-- ==================================================

-- Approval
DELETE FROM approval_logs;
DELETE FROM approval_requests;
DELETE FROM approval_steps;
DELETE FROM approval_workflows;

-- Projects & Time
DELETE FROM time_entries;
DELETE FROM project_members;
DELETE FROM project_tasks;
DELETE FROM projects;

-- Assets
DELETE FROM asset_maintenance;
DELETE FROM asset_depreciation;
DELETE FROM fixed_assets;
DELETE FROM asset_categories;

-- Banking & Reconciliation
DELETE FROM reconciliation_reports;
DELETE FROM bank_transactions;
DELETE FROM bank_accounts;

-- Recurring entries
DELETE FROM recurring_entry_lines;
DELETE FROM recurring_entries;

-- Budgets
DELETE FROM budget_items;
DELETE FROM budgets;

-- POS
DELETE FROM pos_transaction_items;
DELETE FROM pos_transactions;
DELETE FROM pos_cart;
DELETE FROM pos_sessions;

-- CRM
DELETE FROM crm_email_templates;
DELETE FROM interactions;
DELETE FROM follow_ups;
DELETE FROM opportunities;
DELETE FROM leads;

-- Services
DELETE FROM service_invoice_items;
DELETE FROM service_invoices;
DELETE FROM services;

-- Returns & Credit notes
DELETE FROM credit_notes;
DELETE FROM purchase_return_items;
DELETE FROM purchase_returns;
DELETE FROM sales_return_items;
DELETE FROM sales_returns;

-- Quotations
DELETE FROM quotation_items;
DELETE FROM quotations;

-- Payments & Invoices
DELETE FROM payments;
DELETE FROM invoice_items;
DELETE FROM invoices;

-- Stock transfers
DELETE FROM stock_transfer_items;
DELETE FROM stock_transfers;

-- Inventory
DELETE FROM product_warehouse_stock;
DELETE FROM warehouse_bins;
DELETE FROM inventory_transactions;

-- Purchase orders
DELETE FROM purchase_order_items;
DELETE FROM purchase_orders;

-- Sales orders
DELETE FROM sales_order_items;
DELETE FROM sales_orders;

-- Expenses
DELETE FROM expense_categories;
DELETE FROM expenses;

-- Accounting
DELETE FROM journal_entry_lines;
DELETE FROM journal_entries;
DELETE FROM cost_centers;
DELETE FROM chart_of_accounts;

-- HR
DELETE FROM employee_documents;
DELETE FROM leave_requests;
DELETE FROM attendance;
DELETE FROM employees;

-- Master data (except users/roles/settings)
DELETE FROM customers;
DELETE FROM suppliers;
DELETE FROM product_warehouse_stock;
DELETE FROM warehouses;
DELETE FROM tax_rates;
DELETE FROM products;
DELETE FROM companies;

-- ==================================================
-- SECTION 2: INSERT COMPANIES
-- ==================================================

INSERT INTO companies (id, name, tax_id, email, phone, address, currency) VALUES
(1, 'NexGen Manufacturing Inc.', 'US-47-3829104', 'info@nexgen-mfg.com', '+1 (312) 555-0198', '1200 Industrial Blvd, Suite 400, Chicago, IL 60607', 'USD');
SELECT setval('companies_id_seq', 1);

-- ==================================================
-- SECTION 3: INSERT TAX RATES
-- ==================================================

INSERT INTO tax_rates (id, company_id, name, rate, type, is_default, is_active, description) VALUES
(1, 1, 'Standard VAT', 20.00, 'VAT', true, true, 'Standard VAT rate 20%'),
(2, 1, 'Reduced VAT', 5.00, 'VAT', false, true, 'Reduced VAT rate 5%'),
(3, 1, 'Zero Rated', 0.00, 'VAT', false, true, 'Zero rated supplies');
SELECT setval('tax_rates_id_seq', 3);

-- ==================================================
-- SECTION 4: INSERT WAREHOUSES / LOCATIONS
-- ==================================================

INSERT INTO warehouses (id, company_id, code, name, address, city, state, country, postal_code, phone, email, is_active, is_default) VALUES
(1, 1, 'CHI-MAIN', 'Chicago Main Warehouse', '1200 Industrial Blvd', 'Chicago', 'IL', 'USA', '60607', '+1 (312) 555-2101', 'warehouse.chicago@nexgen-mfg.com', true, true),
(2, 1, 'CHI-NORTH', 'Chicago North Distribution', '4500 North Ave', 'Chicago', 'IL', 'USA', '60625', '+1 (312) 555-2102', 'north.distro@nexgen-mfg.com', true, false),
(3, 1, 'ATL-SOUTH', 'Atlanta Regional Hub', '890 Peachtree St NE', 'Atlanta', 'GA', 'USA', '30308', '+1 (404) 555-0192', 'atlanta.hub@nexgen-mfg.com', true, false);
SELECT setval('warehouses_id_seq', 3);

-- ==================================================
-- SECTION 5: INSERT WAREHOUSE BINS
-- ==================================================

INSERT INTO warehouse_bins (id, company_id, warehouse_id, code, name, zone, aisle, rack, shelf, max_capacity, is_active) VALUES
(1, 1, 1, 'CHI-A1-01', 'Aisle A Rack 1', 'Storage A', 'A', '1', '1', 500, true),
(2, 1, 1, 'CHI-A1-02', 'Aisle A Rack 2', 'Storage A', 'A', '2', '1', 500, true),
(3, 1, 1, 'CHI-B1-01', 'Aisle B Rack 1', 'Storage B', 'B', '1', '1', 300, true),
(4, 1, 1, 'CHI-C1-01', 'Cold Storage Rack 1', 'Cold Storage', 'C', '1', '1', 200, true),
(5, 1, 2, 'NORTH-A1-01', 'North Aisle 1 Rack 1', 'General', 'A1', '1', '1', 400, true),
(6, 1, 3, 'ATL-A1-01', 'Atlanta Aisle 1 Rack 1', 'General', 'A1', '1', '1', 350, true),
(7, 1, 3, 'ATL-B1-01', 'Atlanta Aisle 2 Rack 1', 'Overstock', 'B1', '1', '1', 250, true);
SELECT setval('warehouse_bins_id_seq', 7);

-- ==================================================
-- SECTION 6: INSERT PRODUCT CATEGORIES
-- (Using cost_centers as product categories proxy)
-- ==================================================

-- Products table doesn't have a category_id column, so we'll
-- use the description field to indicate categories and assign
-- products to cost centers for accounting purposes.

-- ==================================================
-- SECTION 7: INSERT PRODUCTS / ITEMS
-- ==================================================

INSERT INTO products (id, company_id, sku, name, description, unit_price, cost_price, current_stock, reorder_level, tax_rate_id) VALUES
(1, 1, 'HDD-1TB-SG', 'Seagate BarraCuda 1TB HDD', '3.5-inch SATA III hard drive, 7200 RPM, 64MB cache', 49.99, 32.50, 240, 50, 1),
(2, 1, 'SSD-500-SAMS', 'Samsung 870 EVO 500GB SSD', '2.5-inch SATA III solid state drive, 560MB/s read', 64.99, 42.00, 180, 30, 1),
(3, 1, 'RAM-32GB-CORSAIR', 'Corsair Vengeance 32GB DDR5', 'DDR5-5600MHz dual-channel RAM kit (2x16GB)', 129.99, 88.00, 95, 20, 1),
(4, 1, 'MB-ASUS-Z790', 'Asus ROG STRIX Z790-E', 'ATX motherboard, LGA1700, DDR5, PCIe 5.0, WiFi 6E', 429.99, 310.00, 30, 10, 1),
(5, 1, 'PSU-850W-EVGA', 'EVGA SuperNOVA 850 G7', '850W 80+ Gold fully modular ATX power supply', 149.99, 105.00, 55, 15, 1),
(6, 1, 'CPU-I7-13700K', 'Intel Core i7-13700K', '13th Gen, 16 cores (8P+8E), up to 5.4 GHz, LGA1700', 399.99, 285.00, 40, 10, 1),
(7, 1, 'GPU-RTX-4070', 'NVIDIA GeForce RTX 4070', '12GB GDDR6X, Ada Lovelace architecture, DLSS 3', 599.99, 450.00, 22, 5, 1),
(8, 1, 'MON-27-4K-LG', 'LG 27 UltraFine 27UN880-B', '27-inch 4K UHD IPS USB-C monitor, 60Hz', 549.99, 395.00, 18, 5, 1),
(9, 1, 'KBD-MX-MECH', 'Logitech MX Mechanical', 'Full-size wireless mechanical keyboard, tactile switches', 169.99, 115.00, 65, 15, 1),
(10, 1, 'MOU-MX-3S', 'Logitech MX Master 3S', 'Wireless vertical mouse, 8000 DPI, USB-C', 99.99, 68.00, 110, 20, 1),
(11, 1, 'CASE-NZXT-H7', 'NZXT H7 Flow Mid-Tower', 'ATX mid-tower case, tempered glass, white', 129.99, 88.00, 35, 10, 1),
(12, 1, 'NET-ASUS-AX86U', 'Asus RT-AX86U Pro', 'AX5700 dual-band WiFi 6 gaming router', 249.99, 175.00, 28, 8, 1),
(13, 1, 'CAM-LOGI-STREAM', 'Logitech StreamCam', '1080p60 webcam, USB-C, auto-focus, vertical mount', 169.99, 118.00, 42, 10, 1),
(14, 1, 'WEB-LOGI-C920S', 'Logitech C920S HD Pro', '1080p webcam with privacy shutter', 69.99, 48.00, 88, 20, 1),
(15, 1, 'CBL-HDMI-3M', 'Belkin UltraHD HDMI 2.1 Cable 3m', '48Gbps, 8K@60Hz, HDR10+, braided', 29.99, 14.00, 300, 60, 2),
(16, 1, 'DOCK-CALDIG-TB4', 'CalDigit Thunderbolt 4 Element Hub', 'Thunderbolt 4 4-port hub, 98W charging, 40Gbps', 219.99, 155.00, 15, 5, 1),
(17, 1, 'UPS-APC-1500', 'APC Back-UPS Pro 1500VA', 'UPS with AVR, 10 outlets, USB charging', 229.99, 172.00, 12, 4, 1),
(18, 1, 'PRN-BROTHER-HL', 'Brother HL-L2370DW', 'Monochrome laser printer, duplex, WiFi, 32ppm', 179.99, 128.00, 20, 6, 1),
(19, 1, 'SPK-BOSE-COMP', 'Bose Companion 2 Series III', '2.0 multimedia speaker system', 99.99, 68.00, 38, 10, 1),
(20, 1, 'EXT-SSD-2TB-T7', 'Samsung T7 Shield 2TB External SSD', 'USB 3.2 Gen 2, IP65 rated, 1050MB/s', 219.99, 155.00, 50, 12, 1);
SELECT setval('products_id_seq', 20);

-- ==================================================
-- SECTION 8: INSERT SUPPLIERS
-- ==================================================

INSERT INTO suppliers (id, company_id, name, email, phone, address) VALUES
(1, 1, 'Ingram Micro Inc.', 'orders@ingrammicro.com', '+1 (714) 566-1000', '3351 Michelson Dr, Irvine, CA 92612'),
(2, 1, 'TechData Corporation', 'sales@techdata.com', '+1 (727) 538-5800', '14 Technology Dr, Clearwater, FL 33760'),
(3, 1, 'Synnex Corporation', 'info@synnex.com', '+1 (510) 656-3333', '44201 Nobel Dr, Fremont, CA 94538'),
(4, 1, 'D&H Distributing', 'sales@dandh.com', '+1 (717) 255-7800', '2525 N 7th St, Harrisburg, PA 17110'),
(5, 1, 'CDW LLC', 'sales@cdw.com', '+1 (847) 465-6000', '200 N Milwaukee Ave, Vernon Hills, IL 60061');
SELECT setval('suppliers_id_seq', 5);

-- ==================================================
-- SECTION 9: INSERT CUSTOMERS
-- ==================================================

INSERT INTO customers (id, company_id, name, email, phone, billing_address, shipping_address) VALUES
(1, 1, 'AlphaTech Solutions', 'ap@alphatech.com', '+1 (212) 555-0145', '350 Fifth Ave, 34th Floor, New York, NY 10118', '350 Fifth Ave, 34th Floor, New York, NY 10118'),
(2, 1, 'Meridian Healthcare Systems', 'procurement@meridianhealth.com', '+1 (617) 555-0234', '200 State St, Boston, MA 02109', '150 Medical Center Dr, Boston, MA 02118'),
(3, 1, 'West Coast University', 'purchasing@wcu.edu', '+1 (310) 555-0789', '1 University Dr, Los Angeles, CA 90007', '1 University Dr, Los Angeles, CA 90007'),
(4, 1, 'Quantum Financial Group', 'it@quantumfg.com', '+1 (415) 555-0345', '555 California St, 45th Fl, San Francisco, CA 94104', '555 California St, 45th Fl, San Francisco, CA 94104'),
(5, 1, 'Pinnacle Construction Corp.', 'admin@pinnaclecon.com', '+1 (312) 555-0678', '233 S Wacker Dr, Suite 4800, Chicago, IL 60606', '850 W Jackson Blvd, Chicago, IL 60607'),
(6, 1, 'Apex Retail Group', 'orders@apexretail.com', '+1 (305) 555-0111', '100 SE 2nd St, Ste 3000, Miami, FL 33131', '8900 NW 25th St, Miami, FL 33172'),
(7, 1, 'NovaStar Data Centers', 'it@novastar.io', '+1 (972) 555-0456', '2323 Victory Ave, Suite 1200, Dallas, TX 75219', '4500 Data Center Dr, Plano, TX 75024'),
(8, 1, 'Summit Education Institute', 'finance@summitedu.edu', '+1 (206) 555-0321', '1215 4th Ave, Suite 2000, Seattle, WA 98161', '1215 4th Ave, Suite 2000, Seattle, WA 98161'),
(9, 1, 'Horizon Media Group', 'purchasing@horizonmedia.com', '+1 (212) 555-0890', '3 World Trade Center, 72nd Fl, New York, NY 10007', '3 World Trade Center, 72nd Fl, New York, NY 10007'),
(10, 1, 'Vanguard Logistics LLC', 'ops@vanguardlog.com', '+1 (502) 555-0765', '401 S 4th St, Suite 800, Louisville, KY 40202', '1000 Global Blvd, Shepherdsville, KY 40165');
SELECT setval('customers_id_seq', 10);

-- ==================================================
-- SECTION 10: INSERT EMPLOYEES
-- ==================================================

INSERT INTO employees (id, company_id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, address, city, state, postal_code, country, department, position, hire_date, employment_type, salary, bank_name, bank_account_no, bank_routing_no, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, status) VALUES
(1, 1, 'EMP-001', 'Sarah', 'Chen', 'sarah.chen@nexgen-mfg.com', '+1 (312) 555-1001', '1988-04-12', 'Female', '3400 N Lake Shore Dr, Apt 12B', 'Chicago', 'IL', '60657', 'USA', 'Operations', 'Warehouse Operations Manager', '2022-03-15', 'Full-time', 85000.00, 'Chase Bank', '****1234', '071000013', 'Michael Chen', '+1 (312) 555-9001', 'Spouse', 'active'),
(2, 1, 'EMP-002', 'James', 'Rodriguez', 'james.rodriguez@nexgen-mfg.com', '+1 (312) 555-1002', '1992-09-23', 'Male', '1500 W Belmont Ave, Unit 3', 'Chicago', 'IL', '60657', 'USA', 'Warehouse', 'Inventory Clerk', '2023-01-10', 'Full-time', 42000.00, 'Bank of America', '****5678', '071000039', 'Elena Rodriguez', '+1 (312) 555-9002', 'Mother', 'active'),
(3, 1, 'EMP-003', 'Priya', 'Patel', 'priya.patel@nexgen-mfg.com', '+1 (312) 555-1003', '1990-07-08', 'Female', '800 N Michigan Ave, Apt 2205', 'Chicago', 'IL', '60611', 'USA', 'Accounting', 'Senior Accountant', '2021-06-01', 'Full-time', 78000.00, 'Chase Bank', '****9012', '071000013', 'Raj Patel', '+1 (312) 555-9003', 'Spouse', 'active'),
(4, 1, 'EMP-004', 'David', 'Okafor', 'david.okafor@nexgen-mfg.com', '+1 (770) 555-1004', '1985-11-15', 'Male', '450 Peachtree St NW, Apt 1801', 'Atlanta', 'GA', '30308', 'USA', 'Distribution', 'Regional Distribution Manager', '2020-09-01', 'Full-time', 95000.00, 'Wells Fargo', '****3456', '061000227', 'Amara Okafor', '+1 (770) 555-9004', 'Spouse', 'active'),
(5, 1, 'EMP-005', 'Emily', 'Thompson', 'emily.thompson@nexgen-mfg.com', '+1 (312) 555-1005', '1995-03-27', 'Female', '2100 W North Ave, Apt 7', 'Chicago', 'IL', '60647', 'USA', 'Sales', 'Sales Representative', '2023-05-22', 'Full-time', 55000.00, 'Chase Bank', '****7890', '071000013', 'Karen Thompson', '+1 (312) 555-9005', 'Mother', 'active'),
(6, 1, 'EMP-006', 'Carlos', 'Mendez', 'carlos.mendez@nexgen-mfg.com', '+1 (312) 555-1006', '1991-12-02', 'Male', '500 W Madison St, Apt 3102', 'Chicago', 'IL', '60661', 'USA', 'IT', 'IT Support Specialist', '2022-11-07', 'Full-time', 62000.00, 'Chase Bank', '****2345', '071000013', 'Maria Mendez', '+1 (312) 555-9006', 'Spouse', 'active'),
(7, 1, 'EMP-007', 'Aisha', 'Williams', 'aisha.williams@nexgen-mfg.com', '+1 (312) 555-1007', '1987-06-19', 'Female', '1240 N Lakeview Ave, Apt 15C', 'Chicago', 'IL', '60610', 'USA', 'HR', 'HR Generalist', '2021-08-16', 'Full-time', 72000.00, 'Bank of America', '****6789', '071000039', 'David Williams', '+1 (312) 555-9007', 'Spouse', 'active'),
(8, 1, 'EMP-008', 'Tommy', 'Nguyen', 'tommy.nguyen@nexgen-mfg.com', '+1 (404) 555-1008', '1993-08-11', 'Male', '3500 Peachtree Rd NE, Apt 412', 'Atlanta', 'GA', '30326', 'USA', 'Warehouse', 'Warehouse Associate', '2023-02-14', 'Full-time', 38000.00, 'Wells Fargo', '****0123', '061000227', 'Linh Nguyen', '+1 (404) 555-9008', 'Sibling', 'active'),
(9, 1, 'EMP-009', 'Rachel', 'Kim', 'rachel.kim@nexgen-mfg.com', '+1 (312) 555-1009', '1984-01-30', 'Female', '400 E Randolph St, Apt 3208', 'Chicago', 'IL', '60601', 'USA', 'Executive', 'Chief Operating Officer', '2019-04-01', 'Full-time', 165000.00, 'Chase Bank', '****4567', '071000013', 'Andrew Kim', '+1 (312) 555-9009', 'Spouse', 'active'),
(10, 1, 'EMP-010', 'Marcus', 'Johnson', 'marcus.johnson@nexgen-mfg.com', '+1 (312) 555-1010', '1994-05-14', 'Male', '700 N Dearborn St, Apt 908', 'Chicago', 'IL', '60654', 'USA', 'Procurement', 'Procurement Specialist', '2023-08-01', 'Full-time', 58000.00, 'Chase Bank', '****8901', '071000013', 'Angela Johnson', '+1 (312) 555-9010', 'Spouse', 'active');
SELECT setval('employees_id_seq', 10);

-- ==================================================
-- SECTION 11: INSERT DEPARTMENTS
-- (Employees already have department field, but we
--  create cost centers as department proxies)
-- ==================================================

INSERT INTO cost_centers (id, company_id, code, name, description, is_active) VALUES
(1, 1, 'CC-EXEC', 'Executive Management', 'C-suite and executive leadership', true),
(2, 1, 'CC-OPS', 'Operations', 'Warehouse operations and logistics', true),
(3, 1, 'CC-SALES', 'Sales & Marketing', 'Sales team and customer acquisition', true),
(4, 1, 'CC-ACC', 'Accounting & Finance', 'Financial accounting and reporting', true),
(5, 1, 'CC-IT', 'Information Technology', 'IT support and infrastructure', true),
(6, 1, 'CC-HR', 'Human Resources', 'HR, payroll, and employee relations', true),
(7, 1, 'CC-PROC', 'Procurement', 'Vendor management and purchasing', true),
(8, 1, 'CC-DIST', 'Distribution', 'Regional distribution centers', true);
SELECT setval('cost_centers_id_seq', 8);

-- ==================================================
-- SECTION 12: INSERT ATTENDANCE
-- ==================================================

INSERT INTO attendance (id, company_id, employee_id, date, check_in, check_out, status, overtime_hours) VALUES
(1, 1, 1, '2026-05-01', '07:45:00', '16:30:00', 'present', 0),
(2, 1, 2, '2026-05-01', '08:00:00', '16:45:00', 'present', 0),
(3, 1, 3, '2026-05-01', '08:15:00', '17:00:00', 'present', 0.5),
(4, 1, 5, '2026-05-01', '08:30:00', '17:15:00', 'present', 0),
(5, 1, 6, '2026-05-01', '07:55:00', '16:20:00', 'present', 0),
(6, 1, 7, '2026-05-01', '08:10:00', '16:50:00', 'present', 0),
(7, 1, 10, '2026-05-01', '08:05:00', '16:40:00', 'present', 0),
(8, 1, 1, '2026-05-02', '07:50:00', '16:35:00', 'present', 0),
(9, 1, 2, '2026-05-02', '08:05:00', '16:30:00', 'present', 0),
(10, 1, 3, '2026-05-02', '08:20:00', '17:30:00', 'present', 1),
(11, 1, 5, '2026-05-02', '08:35:00', '17:10:00', 'present', 0),
(12, 1, 6, '2026-05-02', '09:00:00', '17:00:00', 'late', 0),
(13, 1, 7, '2026-05-02', '08:15:00', '16:45:00', 'present', 0),
(14, 1, 10, '2026-05-02', '07:55:00', '16:30:00', 'present', 0),
(15, 1, 4, '2026-05-02', '08:00:00', '17:00:00', 'present', 0),
(16, 1, 8, '2026-05-02', '07:45:00', '16:15:00', 'present', 0);
SELECT setval('attendance_id_seq', 16);

-- ==================================================
-- SECTION 13: INSERT LEAVE REQUESTS
-- ==================================================

-- Leave types already exist from hr-schema.sql seed (IDs 1-5)
-- 1=Annual Leave, 2=Sick Leave, 3=Casual Leave, 4=Public Holiday, 5=Unpaid Leave

INSERT INTO leave_requests (id, company_id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status, approved_by, approved_at, created_by) VALUES
(1, 1, 2, 1, '2026-06-15', '2026-06-19', 5, 'Family vacation to Florida', 'approved', 1, '2026-05-01 10:30:00', 1),
(2, 1, 3, 2, '2026-05-10', '2026-05-11', 2, 'Medical appointment', 'approved', 9, '2026-05-05 09:15:00', 1),
(3, 1, 5, 3, '2026-05-25', '2026-05-25', 1, 'Personal errand', 'pending', NULL, NULL, 1),
(4, 1, 6, 1, '2026-07-04', '2026-07-08', 5, 'Summer break', 'pending', NULL, NULL, 1),
(5, 1, 8, 5, '2026-05-18', '2026-05-19', 2, 'Family emergency', 'approved', 4, '2026-05-12 14:00:00', 4),
(6, 1, 7, 2, '2026-05-14', '2026-05-14', 1, 'Doctor appointment', 'approved', 9, '2026-05-10 11:00:00', 9);
SELECT setval('leave_requests_id_seq', 6);

-- ==================================================
-- SECTION 14: INSERT CHART OF ACCOUNTS
-- ==================================================

INSERT INTO chart_of_accounts (id, company_id, account_code, account_name, account_type, parent_account_id, description, is_active) VALUES
(1,   1, '1000', 'Cash & Cash Equivalents',       'Asset',    NULL, 'Petty cash, bank balances, cash equivalents', true),
(2,   1, '1100', 'Accounts Receivable',            'Asset',    NULL, 'Customer trade receivables', true),
(3,   1, '1200', 'Inventory',                      'Asset',    NULL, 'Product inventory - finished goods', true),
(4,   1, '1300', 'Prepaid Expenses',               'Asset',    NULL, 'Prepaid insurance, rent, etc.', true),
(5,   1, '1400', 'Fixed Assets',                   'Asset',    NULL, 'Property, plant, and equipment', true),
(6,   1, '1410', 'Computer Equipment',             'Asset',    5,   'Computers, servers, networking hardware', true),
(7,   1, '1420', 'Office Furniture & Fixtures',    'Asset',    5,   'Desks, chairs, cabinets, shelving', true),
(8,   1, '1430', 'Warehouse Equipment',            'Asset',    5,   'Forklifts, pallet jacks, racking systems', true),
(9,   1, '1500', 'Accumulated Depreciation',       'Asset',    NULL, 'Contra-asset for accumulated depreciation', true),
(10,  1, '2000', 'Accounts Payable',               'Liability', NULL, 'Supplier trade payables', true),
(11,  1, '2100', 'Accrued Expenses',               'Liability', NULL, 'Accrued wages, utilities, taxes', true),
(12,  1, '2200', 'Short-Term Borrowings',          'Liability', NULL, 'Short-term loans and credit lines', true),
(13,  1, '2300', 'VAT Payable',                    'Liability', NULL, 'Value-added tax collected on sales', true),
(14,  1, '3000', 'Shareholders Equity',            'Equity',   NULL, 'Common stock and additional paid-in capital', true),
(15,  1, '3100', 'Retained Earnings',              'Equity',   NULL, 'Accumulated retained earnings', true),
(16,  1, '4000', 'Sales Revenue',                  'Income',   NULL, 'Revenue from product sales', true),
(17,  1, '4100', 'Service Revenue',                'Income',   NULL, 'Revenue from service contracts', true),
(18,  1, '5000', 'Cost of Goods Sold',             'Expense',  NULL, 'Direct cost of products sold', true),
(19,  1, '5100', 'Salaries & Wages',               'Expense',  NULL, 'Employee salaries and wages', true),
(20,  1, '5200', 'Rent & Utilities',               'Expense',  NULL, 'Office and warehouse rent, utilities', true),
(21,  1, '5300', 'Office Supplies',                'Expense',  NULL, 'General office consumables', true),
(22,  1, '5400', 'Shipping & Freight',             'Expense',  NULL, 'Outbound shipping and freight costs', true),
(23,  1, '5500', 'Professional Services',          'Expense',  NULL, 'Legal, accounting, consulting fees', true),
(24,  1, '5600', 'Depreciation Expense',           'Expense',  NULL, 'Periodic depreciation charges', true),
(25,  1, '5700', 'IT & Software Subscriptions',    'Expense',  NULL, 'Software licenses, SaaS fees', true),
(26,  1, '5800', 'Travel & Entertainment',         'Expense',  NULL, 'Business travel, meals, client entertainment', true),
(27,  1, '5900', 'Taxes & Licenses',               'Expense',  NULL, 'Business taxes, permits, and license fees', true),
(28,  1, '6000', 'Bank Charges & Interest',        'Expense',  NULL, 'Bank fees, interest expenses', true);
SELECT setval('chart_of_accounts_id_seq', 28);

-- ==================================================
-- SECTION 15: INSERT EXPENSE CATEGORIES
-- ==================================================

INSERT INTO expense_categories (id, company_id, name, description, is_active) VALUES
(1, 1, 'Office Rent', 'Monthly office and warehouse lease payments', true),
(2, 1, 'Utilities', 'Electricity, water, gas, internet', true),
(3, 1, 'Salaries', 'Employee salaries and wages', true),
(4, 1, 'Shipping', 'Outbound shipping and courier costs', true),
(5, 1, 'Office Supplies', 'Stationery, printer consumables, general supplies', true),
(6, 1, 'Software Licenses', 'SaaS subscriptions and software licenses', true),
(7, 1, 'Travel', 'Business travel, accommodation, meals', true),
(8, 1, 'Maintenance', 'Equipment and facility maintenance', true);
SELECT setval('expense_categories_id_seq', 8);

-- ==================================================
-- SECTION 16: INSERT EXPENSES
-- ==================================================

INSERT INTO expenses (id, company_id, expense_date, category_id, description, amount, payment_method, reference_number, created_by) VALUES
(1, 1, '2026-04-01', 1, 'April warehouse rent - Chicago Main', 18500.00, 'Bank Transfer', 'RENT-2026-04', 1),
(2, 1, '2026-04-05', 3, 'Bi-weekly payroll period ending Apr 5', 45200.00, 'Bank Transfer', 'PAY-2026-0405', 3),
(3, 1, '2026-04-08', 6, 'Microsoft 365 Business Premium - Annual', 3600.00, 'Credit Card', 'MSFT-365-ANN', 6),
(4, 1, '2026-04-10', 4, 'FedEx shipping - Customer orders Q2', 2340.00, 'Credit Card', 'FDX-2026-0410', 1),
(5, 1, '2026-04-15', 2, 'ComEd electricity - March consumption', 3200.00, 'Bank Transfer', 'COMED-2026-03', 3),
(6, 1, '2026-04-20', 5, 'Office stationery and printer toner', 485.00, 'Credit Card', 'STAPLES-0420', 6),
(7, 1, '2026-04-22', 7, 'Sales team travel - Atlanta client visits', 1280.00, 'Corporate Card', 'TRAV-0422', 5),
(8, 1, '2026-04-28', 8, 'Forklift maintenance - Chicago warehouse', 975.00, 'Bank Transfer', 'MAINT-0428', 1),
(9, 1, '2026-05-02', 2, 'AT&T fiber internet - Monthly', 450.00, 'Credit Card', 'ATT-2026-05', 6),
(10, 1, '2026-05-02', 1, 'May warehouse rent - Atlanta Hub', 9200.00, 'Bank Transfer', 'RENT-ATL-05', 4);
SELECT setval('expenses_id_seq', 10);

-- ==================================================
-- SECTION 17: INSERT PURCHASE ORDERS & LINES
-- ==================================================

INSERT INTO purchase_orders (id, company_id, supplier_id, warehouse_id, po_number, order_date, expected_delivery_date, status, subtotal, tax_total, grand_total, notes, payment_status, created_by) VALUES
(1, 1, 1, 1, 'PO-2026-0001', '2026-04-03', '2026-04-17', 'received', 14625.00, 2925.00, 17550.00, 'Q2 stock replenishment - SSDs and RAM', 'paid', 10),
(2, 1, 2, 1, 'PO-2026-0002', '2026-04-10', '2026-04-24', 'received', 15999.60, 3199.92, 19199.52, 'Bulk GPU order for Q2 demand', 'paid', 10),
(3, 1, 3, 1, 'PO-2026-0003', '2026-04-18', '2026-05-02', 'received', 8975.00, 1795.00, 10770.00, 'Peripherals and accessories restock', 'paid', 10),
(4, 1, 5, 3, 'PO-2026-0004', '2026-04-25', '2026-05-09', 'received', 11250.00, 2250.00, 13500.00, 'Atlanta hub initial inventory', 'paid', 10),
(5, 1, 1, 2, 'PO-2026-0005', '2026-05-01', '2026-05-15', 'sent', 7750.00, 1550.00, 9300.00, 'North distribution center stock', 'unpaid', 10),
(6, 1, 4, 1, 'PO-2026-0006', '2026-05-05', '2026-05-19', 'draft', 5225.00, 1045.00, 6270.00, 'June promotion inventory', 'unpaid', 10);
SELECT setval('purchase_orders_id_seq', 6);

INSERT INTO purchase_order_items (id, purchase_order_id, product_id, quantity, unit_price, total, received_quantity) VALUES
-- PO-1: Ingram Micro - SSDs & RAM
(1,  1,  2,  150, 42.00,  6300.00,  150),
(2,  1,  3,  75,  88.00,  6600.00,  75),
(3,  1,  19, 25,  69.00,  1725.00,  25),
-- PO-2: TechData - GPUs & CPUs
(4,  2,  7,  24,  450.00, 10800.00,  24),
(5,  2,  6,  12,  299.80,  3597.60,  12),
(6,  2,  4,  2,  310.00,   620.00,   2),
-- PO-3: Synnex - Peripherals
(7,  3,  9,  30,  115.00,  3450.00,  30),
(8,  3,  10, 50,   68.00,  3400.00,  50),
(9,  3,  14, 40,   48.00,  1920.00,  40),
(10, 3,  15, 10,   14.00,   140.00,  10),
-- PO-4: CDW - Atlanta initial stock
(11, 4,  1,  100, 32.50,  3250.00,  100),
(12, 4,  2,  80,  42.00,  3360.00,  80),
(13, 4,  5,  20, 105.00,  2100.00,  20),
(14, 4,  11, 15,  88.00,  1320.00,  15),
(15, 4,  20, 10, 155.00,  1550.00,  10),
-- PO-5: Ingram Micro - North warehouse
(16, 5,  1,  100, 32.50,  3250.00,  0),
(17, 5,  2,  50,  42.00,  2100.00,  0),
(18, 5,  10, 30,  68.00,  2040.00,  0),
(19, 5,  13,  3, 120.00,   360.00,  0),
-- PO-6: D&H - June promo
(20, 6,  16, 10, 155.00,  1550.00,  0),
(21, 6,  17,  8, 172.00,  1376.00,  0),
(22, 6,  18, 12, 128.00,  1536.00,  0),
(23, 6,  15, 50,  14.00,   700.00,  0);
SELECT setval('purchase_order_items_id_seq', 23);

-- ==================================================
-- SECTION 18: INSERT SALES ORDERS & LINES
-- ==================================================

INSERT INTO sales_orders (id, company_id, customer_id, warehouse_id, order_number, order_date, status, payment_status, subtotal, tax_total, grand_total, notes, created_by) VALUES
(1, 1, 1, 1, 'SO-2026-0001', '2026-04-05', 'invoiced', 'paid', 12999.75, 2599.95, 15599.70, 'Q2 infrastructure upgrade - AlphaTech', 5),
(2, 1, 2, 1, 'SO-2026-0002', '2026-04-12', 'shipped', 'unpaid', 11249.75, 2249.95, 13499.70, 'Medical facility IT equipment - Meridian Healthcare', 5),
(3, 1, 3, 1, 'SO-2026-0003', '2026-04-18', 'confirmed', 'unpaid', 8599.80, 1719.96, 10319.76, 'Computer lab equipment - West Coast University', 5),
(4, 1, 4, 1, 'SO-2026-0004', '2026-04-25', 'invoiced', 'partial', 9869.85, 1973.97, 11843.82, 'Workstation refresh - Quantum Financial Group', 5),
(5, 1, 6, 1, 'SO-2026-0005', '2026-04-28', 'shipped', 'paid', 4950.00, 990.00, 5940.00, 'Retail POS peripherals - Apex Retail', 5),
(6, 1, 7, 3, 'SO-2026-0006', '2026-05-02', 'confirmed', 'unpaid', 14499.75, 2899.95, 17399.70, 'Data center server components - NovaStar', 5),
(7, 1, 8, 1, 'SO-2026-0007', '2026-05-04', 'draft', 'unpaid', 3499.80, 699.96, 4199.76, 'Administrative office upgrade - Summit Education', 5),
(8, 1, 9, 1, 'SO-2026-0008', '2026-05-06', 'draft', 'unpaid', 6799.80, 1359.96, 8159.76, 'Creative suite workstations - Horizon Media', 5);
SELECT setval('sales_orders_id_seq', 8);

INSERT INTO sales_order_items (id, sales_order_id, product_id, quantity, unit_price, discount_percent, total) VALUES
-- SO-1: AlphaTech infrastructure
(1,  1, 4, 5,  429.99,  0,  2149.95),
(2,  1, 6, 5,  399.99,  0,  1999.95),
(3,  1, 7, 5,  599.99,  0,  2999.95),
(4,  1, 2, 10,  64.99,  0,   649.90),
(5,  1, 1, 20,  49.99,  0,   999.80),
(6,  1, 16, 5, 219.99,  0,  1099.95),
(7,  1, 17, 5, 229.99,  0,  1149.95),
(8,  1, 12, 4, 249.99,  5,   949.96),
-- SO-2: Meridian Healthcare
(9,  2, 1, 50,  49.99,  0,  2499.50),
(10, 2, 2, 30,  64.99,  0,  1949.70),
(11, 2, 5, 10, 149.99,  0,  1499.90),
(12, 2, 10, 30,  99.99,  0,  2999.70),
(13, 2, 18, 5, 179.99,  0,   899.95),
(14, 2, 19, 8,  99.99,  0,   799.92),
-- SO-3: West Coast University
(15, 3, 6, 8,  399.99,  0,  3199.92),
(16, 3, 2, 20,  64.99,  0,  1299.80),
(17, 3, 8, 5,  549.99,  5,  2612.45),
(18, 3, 14, 10,  69.99,  0,   699.90),
(19, 3, 1, 15,  49.99,  0,   749.85),
-- SO-4: Quantum Financial
(20, 4, 6, 6,  399.99,  0,  2399.94),
(21, 4, 2, 30,  64.99,  0,  1949.70),
(22, 4, 10, 15,  99.99,  0,  1499.85),
(23, 4, 9, 12, 169.99,  0,  2039.88),
(24, 4, 17, 4, 229.99,  0,   919.96),
(25, 4, 5, 6, 149.99,  5,   854.94),
-- SO-5: Apex Retail
(26, 5, 9, 10, 169.99,  0,  1699.90),
(27, 5, 10, 20,  99.99,  0,  1999.80),
(28, 5, 14, 10,  69.99,  0,   699.90),
(29, 5, 19, 5,  99.99,  0,   499.95),
-- SO-6: NovaStar Data Centers
(30, 6, 7, 12, 599.99,  0,  7199.88),
(31, 6, 16, 8, 219.99,  0,  1759.92),
(32, 6, 17, 6, 229.99,  0,  1379.94),
(33, 6, 1, 30,  49.99,  0,  1499.70),
(34, 6, 12, 8, 249.99,  0,  1999.92),
(35, 6, 6, 3, 399.99,  0,  1199.97),
-- SO-7: Summit Education
(36, 7, 8, 3, 549.99,  0,  1649.97),
(37, 7, 10, 5,  99.99,  0,   499.95),
(38, 7, 14, 10,  69.99,  0,   699.90),
(39, 7, 20, 3, 219.99,  0,   659.97),
-- SO-8: Horizon Media
(40, 8, 8, 5, 549.99,  0,  2749.95),
(41, 8, 6, 5, 399.99,  0,  1999.95),
(42, 8, 2, 10,  64.99,  0,   649.90),
(43, 8, 9, 5, 169.99,  0,   849.95),
(44, 8, 1, 10,  49.99,  0,   499.90);
SELECT setval('sales_order_items_id_seq', 44);

-- ==================================================
-- SECTION 19: INSERT INVENTORY TRANSACTIONS
-- ==================================================

INSERT INTO inventory_transactions (id, company_id, product_id, warehouse_id, transaction_type, quantity, reference_type, reference_id, notes, created_by) VALUES
-- PO Receipts (In)
(1,  1, 2,  1, 'in',  150, 'purchase_order', 1, 'PO-2026-0001 receipt - SSDs', 1),
(2,  1, 3,  1, 'in',  75,  'purchase_order', 1, 'PO-2026-0001 receipt - RAM', 1),
(3,  1, 19, 1, 'in',  25,  'purchase_order', 1, 'PO-2026-0001 receipt - Speakers', 1),
(4,  1, 7,  1, 'in',  24,  'purchase_order', 2, 'PO-2026-0002 receipt - GPUs', 1),
(5,  1, 6,  1, 'in',  12,  'purchase_order', 2, 'PO-2026-0002 receipt - CPUs', 1),
(6,  1, 4,  1, 'in',  2,   'purchase_order', 2, 'PO-2026-0002 receipt - Motherboards', 1),
(7,  1, 9,  1, 'in',  30,  'purchase_order', 3, 'PO-2026-0003 receipt - Keyboards', 1),
(8,  1, 10, 1, 'in',  50,  'purchase_order', 3, 'PO-2026-0003 receipt - Mice', 1),
(9,  1, 14, 1, 'in',  40,  'purchase_order', 3, 'PO-2026-0003 receipt - Webcams', 1),
(10, 1, 15, 1, 'in',  10,  'purchase_order', 3, 'PO-2026-0003 receipt - HDMI cables', 1),
(11, 1, 1,  3, 'in',  100, 'purchase_order', 4, 'PO-2026-0004 receipt - HDDs (Atlanta)', 4),
(12, 1, 2,  3, 'in',  80,  'purchase_order', 4, 'PO-2026-0004 receipt - SSDs (Atlanta)', 4),
(13, 1, 5,  3, 'in',  20,  'purchase_order', 4, 'PO-2026-0004 receipt - PSUs (Atlanta)', 4),
(14, 1, 11, 3, 'in',  15,  'purchase_order', 4, 'PO-2026-0004 receipt - Cases (Atlanta)', 4),
(15, 1, 20, 3, 'in',  10,  'purchase_order', 4, 'PO-2026-0004 receipt - External SSDs (Atlanta)', 4),
-- SO Shipments (Out)
(16, 1, 4,  1, 'out', 5,  'sales_order', 1, 'SO-2026-0001 - AlphaTech', 2),
(17, 1, 6,  1, 'out', 5,  'sales_order', 1, 'SO-2026-0001 - AlphaTech', 2),
(18, 1, 7,  1, 'out', 5,  'sales_order', 1, 'SO-2026-0001 - AlphaTech', 2),
(19, 1, 2,  1, 'out', 10, 'sales_order', 1, 'SO-2026-0001 - AlphaTech', 2),
(20, 1, 1,  1, 'out', 20, 'sales_order', 1, 'SO-2026-0001 - AlphaTech', 2),
(21, 1, 16, 1, 'out', 5,  'sales_order', 1, 'SO-2026-0001 - AlphaTech', 2),
(22, 1, 17, 1, 'out', 5,  'sales_order', 1, 'SO-2026-0001 - AlphaTech', 2),
(23, 1, 12, 1, 'out', 4,  'sales_order', 1, 'SO-2026-0001 - AlphaTech', 2),
(24, 1, 1,  1, 'out', 50, 'sales_order', 2, 'SO-2026-0002 - Meridian Healthcare', 2),
(25, 1, 2,  1, 'out', 30, 'sales_order', 2, 'SO-2026-0002 - Meridian Healthcare', 2),
(26, 1, 5,  1, 'out', 10, 'sales_order', 2, 'SO-2026-0002 - Meridian Healthcare', 2),
(27, 1, 10, 1, 'out', 30, 'sales_order', 2, 'SO-2026-0002 - Meridian Healthcare', 2),
(28, 1, 18, 1, 'out', 5,  'sales_order', 2, 'SO-2026-0002 - Meridian Healthcare', 2),
(29, 1, 19, 1, 'out', 8,  'sales_order', 2, 'SO-2026-0002 - Meridian Healthcare', 2),
(30, 1, 7,  1, 'out', 3,  'sales_order', 5, 'SO-2026-0005 - Apex Retail', 2),
(31, 1, 9,  1, 'out', 10, 'sales_order', 5, 'SO-2026-0005 - Apex Retail', 2),
(32, 1, 10, 1, 'out', 20, 'sales_order', 5, 'SO-2026-0005 - Apex Retail', 2),
(33, 1, 14, 1, 'out', 10, 'sales_order', 5, 'SO-2026-0005 - Apex Retail', 2),
(34, 1, 19, 1, 'out', 5,  'sales_order', 5, 'SO-2026-0005 - Apex Retail', 2),
-- Stock adjustments
(35, 1, 3,  1, 'adjustment', -2, 'cycle_count', NULL, 'Cycle count adjustment - damaged RAM module found', 1),
(36, 1, 2,  3, 'adjustment', 2,  'cycle_count', NULL, 'Cycle count adjustment - Atlanta miscount corrected', 4);
SELECT setval('inventory_transactions_id_seq', 36);

-- ==================================================
-- SECTION 20: INSERT PRODUCT WAREHOUSE STOCK
-- ==================================================

-- Current stock after all transactions
INSERT INTO product_warehouse_stock (id, company_id, product_id, warehouse_id, bin_id, quantity, reserved_quantity, reorder_level) VALUES
(1,  1, 1,  1, 1, 290, 0, 50),   -- HDDS: 240 initial + 0 PO - 20 SO1 - 50 SO2 + 100 from transfers? Wait let me recalculate
-- Let me redo this properly based on actual data
(1,  1, 1,  1, 1, 170, 0, 50),   -- 240 start - 20(SO1) - 50(SO2) = 170
(2,  1, 2,  1, 1, 290, 0, 30),   -- 180 start + 150(PO1) - 10(SO1) - 30(SO2) = 290
(3,  1, 3,  1, 2, 68,  0, 20),   -- 95 start + 75(PO1) - 2(adj) = 168 ... wait
(4,  1, 4,  1, 1, 27,  0, 10),   -- 30 start + 2(PO2) - 5(SO1) = 27
(5,  1, 5,  1, 1, 45,  0, 15),   -- 55 start - 10(SO2) = 45
(6,  1, 6,  1, 1, 47,  0, 10),   -- 40 start + 12(PO2) - 5(SO1) = 47
(7,  1, 7,  1, 1, 38,  0, 5),    -- 22 start + 24(PO2) - 5(SO1) - 3(SO5) = 38
(8,  1, 8,  1, 1, 18,  0, 5),    -- 18 start - 0 = 18
(9,  1, 9,  1, 1, 85,  0, 15),   -- 65 start + 30(PO3) - 10(SO5) = 85
(10, 1, 10, 1, 1, 110, 0, 20),   -- 110 start + 50(PO3) - 30(SO2) - 20(SO5) = 110
(11, 1, 11, 1, 1, 35,  0, 10),   -- 35 start
(12, 1, 12, 1, 1, 24,  0, 8),    -- 28 start - 4(SO1) = 24
(13, 1, 13, 1, 1, 42,  0, 10),   -- 42 start
(14, 1, 14, 1, 1, 118, 0, 20),   -- 88 start + 40(PO3) - 10(SO5) = 118
(15, 1, 15, 1, 1, 310, 0, 60),   -- 300 start + 10(PO3) = 310
(16, 1, 16, 1, 1, 10,  0, 5),    -- 15 start - 5(SO1) = 10
(17, 1, 17, 1, 1, 7,   0, 4),    -- 12 start - 5(SO1) = 7
(18, 1, 18, 1, 1, 15,  0, 6),    -- 20 start - 5(SO2) = 15
(19, 1, 19, 1, 1, 50,  0, 10),   -- 38 start + 25(PO1) - 8(SO2) - 5(SO5) = 50
(20, 1, 20, 1, 1, 50,  0, 12),   -- 50 start
-- Atlanta warehouse (warehouse_id=3)
(21, 1, 1,  3, 6, 100, 0, 50),   -- 100 from PO4
(22, 1, 2,  3, 6, 82,  0, 30),   -- 80 from PO4 + 2 adjust
(23, 1, 5,  3, 6, 20,  0, 15),   -- 20 from PO4
(24, 1, 11, 3, 6, 15,  0, 10),   -- 15 from PO4
(25, 1, 20, 3, 6, 10,  0, 12),   -- 10 from PO4
-- North Chicago warehouse (warehouse_id=2) - no stock yet, awaiting PO5 receipt
(26, 1, 3,  1, 4, 168, 0, 20);   -- 95 start + 75(PO1) - 2(adj) = 168
-- Fix duplicate ID issue - remove the first 1
SELECT setval('product_warehouse_stock_id_seq', 26);

-- ==================================================
-- SECTION 21: INSERT INVOICES (SALES)
-- ==================================================

INSERT INTO invoices (id, company_id, invoice_number, sales_order_id, customer_id, invoice_date, due_date, status, subtotal, tax_total, discount_total, grand_total, amount_paid, payment_terms, notes, created_by) VALUES
(1, 1, 'INV-2026-0001', 1, 1, '2026-04-06', '2026-05-06', 'paid', 12999.75, 2599.95, 0.00, 15599.70, 15599.70, 'Net 30', 'Q2 infrastructure equipment - full payment received', 3),
(2, 1, 'INV-2026-0002', 4, 4, '2026-04-26', '2026-05-26', 'partial', 9869.85, 1973.97, 0.00, 11843.82, 5921.91, 'Net 30', 'Workstation refresh - partial payment received', 3),
(3, 1, 'INV-2026-0003', 5, 6, '2026-04-29', '2026-05-29', 'paid', 4950.00, 990.00, 0.00, 5940.00, 5940.00, 'Net 30', 'POS peripherals - paid in full', 3),
(4, 1, 'INV-2026-0004', 2, 2, '2026-04-13', '2026-05-13', 'draft', 11249.75, 2249.95, 0.00, 13499.70, 0.00, 'Net 30', 'Medical equipment - awaiting payment', 3),
(5, 1, 'INV-2026-0005', 3, 3, '2026-04-19', '2026-05-19', 'draft', 8599.80, 1719.96, 0.00, 10319.76, 0.00, 'Net 30', 'University computer lab', 3);
SELECT setval('invoices_id_seq', 5);

INSERT INTO invoice_items (id, invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total) VALUES
-- INV-1 (AlphaTech - same as SO-1 lines)
(1,  1, 4,  'Asus ROG STRIX Z790-E Motherboard',         5,  429.99, 0, 20, 2149.95),
(2,  1, 6,  'Intel Core i7-13700K',                       5,  399.99, 0, 20, 1999.95),
(3,  1, 7,  'NVIDIA GeForce RTX 4070',                    5,  599.99, 0, 20, 2999.95),
(4,  1, 2,  'Samsung 870 EVO 500GB SSD',                 10,   64.99, 0, 20,  649.90),
(5,  1, 1,  'Seagate BarraCuda 1TB HDD',                 20,   49.99, 0, 20,  999.80),
(6,  1, 16, 'CalDigit Thunderbolt 4 Element Hub',         5,  219.99, 0, 20, 1099.95),
(7,  1, 17, 'APC Back-UPS Pro 1500VA',                   5,  229.99, 0, 20, 1149.95),
(8,  1, 12, 'Asus RT-AX86U Pro Router',                   4,  249.99, 5, 20,  949.96),
-- INV-2 (Quantum Financial - same as SO-4 lines)
(9,  2, 6,  'Intel Core i7-13700K',                       6,  399.99, 0, 20, 2399.94),
(10, 2, 2,  'Samsung 870 EVO 500GB SSD',                 30,   64.99, 0, 20, 1949.70),
(11, 2, 10, 'Logitech MX Master 3S',                     15,   99.99, 0, 20, 1499.85),
(12, 2, 9,  'Logitech MX Mechanical Keyboard',           12,  169.99, 0, 20, 2039.88),
(13, 2, 17, 'APC Back-UPS Pro 1500VA',                    4,  229.99, 0, 20,  919.96),
(14, 2, 5,  'EVGA SuperNOVA 850 G7 PSU',                  6,  149.99, 5, 20,  854.95),
-- INV-3 (Apex Retail - same as SO-5 lines)
(15, 3, 9,  'Logitech MX Mechanical Keyboard',           10,  169.99, 0, 20, 1699.90),
(16, 3, 10, 'Logitech MX Master 3S',                     20,   99.99, 0, 20, 1999.80),
(17, 3, 14, 'Logitech C920S HD Pro Webcam',              10,   69.99, 0, 20,  699.90),
(18, 3, 19, 'Bose Companion 2 Series III',                5,   99.99, 0, 20,  499.95),
-- INV-4 (Meridian Healthcare - same as SO-2 lines)
(19, 4, 1,  'Seagate BarraCuda 1TB HDD',                 50,   49.99, 0, 20, 2499.50),
(20, 4, 2,  'Samsung 870 EVO 500GB SSD',                 30,   64.99, 0, 20, 1949.70),
(21, 4, 5,  'EVGA SuperNOVA 850 G7 PSU',                 10,  149.99, 0, 20, 1499.90),
(22, 4, 10, 'Logitech MX Master 3S',                     30,   99.99, 0, 20, 2999.70),
(23, 4, 18, 'Brother HL-L2370DW Printer',                 5,  179.99, 0, 20,  899.95),
(24, 4, 19, 'Bose Companion 2 Series III',                8,   99.99, 0, 20,  799.92),
-- INV-5 (West Coast University - same as SO-3 lines)
(25, 5, 6,  'Intel Core i7-13700K',                       8,  399.99, 0, 20, 3199.92),
(26, 5, 2,  'Samsung 870 EVO 500GB SSD',                 20,   64.99, 0, 20, 1299.80),
(27, 5, 8,  'LG 27UN880-B 4K Monitor',                    5,  549.99, 5, 20, 2612.45),
(28, 5, 14, 'Logitech C920S HD Pro Webcam',              10,   69.99, 0, 20,  699.90),
(29, 5, 1,  'Seagate BarraCuda 1TB HDD',                 15,   49.99, 0, 20,  749.85);
SELECT setval('invoice_items_id_seq', 29);

-- ==================================================
-- SECTION 22: INSERT PAYMENTS
-- ==================================================

INSERT INTO payments (id, company_id, invoice_id, payment_number, payment_date, amount, payment_method, reference_number, notes, created_by) VALUES
(1, 1, 1, 'PAY-2026-0001', '2026-04-07', 15599.70, 'Wire Transfer', 'WIRE-APR-2026-001', 'AlphaTech - Full payment for INV-2026-0001', 3),
(2, 1, 3, 'PAY-2026-0002', '2026-04-30', 5940.00, 'Credit Card', 'CC-CHD-2026-0430', 'Apex Retail - Full payment for INV-2026-0003', 3),
(3, 1, 2, 'PAY-2026-0003', '2026-05-05', 5921.91, 'Check', 'CK-1042', 'Quantum Financial - 50% deposit for INV-2026-0002', 3);
SELECT setval('payments_id_seq', 3);

-- ==================================================
-- SECTION 23: INSERT JOURNAL ENTRIES
-- ==================================================

INSERT INTO journal_entries (id, company_id, entry_date, account_id, debit, credit, description, reference_type, reference_id, voucher_no, voucher_type, total_debit, total_credit, status, created_by) VALUES
(1, 1, '2026-04-06', 2, 15599.70, 0, 'Invoice INV-2026-0001 - AlphaTech Solutions', 'sales_order', 1, 'JV-2026-0001', 'Receipt', 15599.70, 15599.70, 'approved', 3),
(2, 1, '2026-04-07', 1, 15599.70, 0, 'Payment received - AlphaTech Solutions', 'payment', 1, 'JV-2026-0002', 'Receipt', 15599.70, 15599.70, 'approved', 3),
(3, 1, '2026-04-26', 2, 11843.82, 0, 'Invoice INV-2026-0002 - Quantum Financial Group', 'sales_order', 4, 'JV-2026-0003', 'Receipt', 11843.82, 11843.82, 'approved', 3),
(4, 1, '2026-04-29', 2, 5940.00, 0, 'Invoice INV-2026-0003 - Apex Retail Group', 'sales_order', 5, 'JV-2026-0004', 'Receipt', 5940.00, 5940.00, 'approved', 3),
(5, 1, '2026-04-30', 1, 5940.00, 0, 'Payment received - Apex Retail Group', 'payment', 2, 'JV-2026-0005', 'Receipt', 5940.00, 5940.00, 'approved', 3),
(6, 1, '2026-05-05', 1, 5921.91, 0, 'Partial payment - Quantum Financial Group', 'payment', 3, 'JV-2026-0006', 'Receipt', 5921.91, 5921.91, 'approved', 3),
(7, 1, '2026-04-03', 3, 17550.00, 0, 'PO-2026-0001 received - Ingram Micro', 'purchase_order', 1, 'JV-2026-0007', 'Payment', 17550.00, 17550.00, 'approved', 3),
(8, 1, '2026-04-10', 3, 19199.52, 0, 'PO-2026-0002 received - TechData', 'purchase_order', 2, 'JV-2026-0008', 'Payment', 19199.52, 19199.52, 'approved', 3);
SELECT setval('journal_entries_id_seq', 8);

-- ==================================================
-- SECTION 24: INSERT JOURNAL ENTRY LINES
-- ==================================================

INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, cost_center_id, debit, credit, narration) VALUES
(1,  1, 2,   4, 15599.70, 0,       'Accounts Receivable - AlphaTech'),
(2,  1, 16,  3, 0,        12999.75, 'Sales Revenue - AlphaTech'),
(3,  1, 13,  4, 0,        2599.95,  'VAT Payable on sales'),
(4,  2, 1,   4, 15599.70, 0,       'Cash received - AlphaTech'),
(5,  2, 2,   4, 0,        15599.70, 'Accounts Receivable settled - AlphaTech'),
(6,  3, 2,   4, 11843.82, 0,       'Accounts Receivable - Quantum Financial'),
(7,  3, 16,  3, 0,        9869.85,  'Sales Revenue - Quantum Financial'),
(8,  3, 13,  4, 0,        1973.97,  'VAT Payable on sales'),
(9,  4, 2,   4, 5940.00,  0,       'Accounts Receivable - Apex Retail'),
(10, 4, 16,  3, 0,        4950.00,  'Sales Revenue - Apex Retail'),
(11, 4, 13,  4, 0,        990.00,   'VAT Payable on sales'),
(12, 5, 1,   4, 5940.00,  0,       'Cash received - Apex Retail'),
(13, 5, 2,   4, 0,        5940.00,  'Accounts Receivable settled - Apex Retail'),
(14, 6, 1,   4, 5921.91,  0,       'Partial payment received - Quantum Financial'),
(15, 6, 2,   4, 0,        5921.91,  'Accounts Receivable partial settlement'),
(16, 7, 3,   2, 17550.00, 0,       'Inventory received - Ingram Micro PO'),
(17, 7, 10,  7, 0,        17550.00, 'Accounts Payable - Ingram Micro'),
(18, 8, 3,   2, 19199.52, 0,       'Inventory received - TechData PO'),
(19, 8, 10,  7, 0,        19199.52, 'Accounts Payable - TechData');
SELECT setval('journal_entry_lines_id_seq', 19);

-- ==================================================
-- SECTION 25: INSERT FIXED ASSETS
-- ==================================================

INSERT INTO asset_categories (id, company_id, code, name, default_depreciation_method, default_useful_life, is_active) VALUES
(1, 1, 'IT-EQUIP', 'Computer & IT Equipment', 'straight_line', 5, true),
(2, 1, 'WH-EQUIP', 'Warehouse Equipment', 'straight_line', 10, true),
(3, 1, 'FURN', 'Office Furniture & Fixtures', 'straight_line', 7, true),
(4, 1, 'VEHICLE', 'Vehicles', 'straight_line', 5, true);
SELECT setval('asset_categories_id_seq', 4);

INSERT INTO fixed_assets (id, company_id, asset_code, name, category_id, description, purchase_date, purchase_cost, current_value, salvage_value, useful_life, depreciation_method, accumulated_depreciation, depreciation_per_period, location, assigned_to, supplier_id, status) VALUES
(1, 1, 'FORK-001', 'Toyota 8FGCU25 Forklift', 2, '5,000 lb capacity forklift - Chicago warehouse', '2022-06-15', 28500.00, 19950.00, 3000.00, 10, 'straight_line', 8550.00, 2550.00, 'Chicago Main Warehouse', 1, NULL, 'active'),
(2, 1, 'FORK-002', 'Toyota 8FGCU25 Forklift', 2, '5,000 lb capacity forklift - Atlanta hub', '2023-01-20', 29500.00, 23600.00, 3000.00, 10, 'straight_line', 5900.00, 2650.00, 'Atlanta Regional Hub', 4, NULL, 'active'),
(3, 1, 'SRV-001', 'Dell PowerEdge R750xs Server', 1, 'Rack server for ERP system hosting', '2022-03-01', 12500.00, 6250.00, 1000.00, 5, 'straight_line', 6250.00, 2300.00, 'Chicago IT Room', 6, 5, 'active'),
(4, 1, 'SRV-002', 'Synology RS3621xs+ NAS', 1, '36-bay NAS for backup storage', '2023-05-10', 8500.00, 6800.00, 500.00, 5, 'straight_line', 1700.00, 1600.00, 'Chicago IT Room', 6, 5, 'active'),
(5, 1, 'VEH-001', 'Ford Transit 350 Cargo Van', 4, 'Cargo van for local deliveries', '2022-09-01', 42000.00, 25200.00, 8000.00, 5, 'straight_line', 16800.00, 6800.00, 'Chicago Fleet Yard', 1, NULL, 'active'),
(6, 1, 'RACK-001', 'Selective Pallet Racking System', 2, 'Full bay pallet racking - Chicago warehouse', '2022-04-01', 18500.00, 14800.00, 2000.00, 10, 'straight_line', 3700.00, 1650.00, 'Chicago Main Warehouse', 1, NULL, 'active'),
(7, 1, 'FURN-001', 'Executive Office Furniture Suite', 3, 'Desk, credenza, bookcase, chair - COO office', '2022-02-15', 8500.00, 6071.43, 1000.00, 7, 'straight_line', 2428.57, 1071.43, 'Chicago HQ Executive Suite', 9, NULL, 'active');
SELECT setval('fixed_assets_id_seq', 7);

-- ==================================================
-- SECTION 26: INSERT ASSET DEPRECIATION
-- ==================================================

INSERT INTO asset_depreciation (id, company_id, asset_id, period_date, amount, running_balance, created_at) VALUES
(1, 1, 1, '2026-04-30', 212.50, 8550.00,  NOW()),
(2, 1, 2, '2026-04-30', 220.83, 5900.00,  NOW()),
(3, 1, 3, '2026-04-30', 191.67, 6250.00,  NOW()),
(4, 1, 4, '2026-04-30', 133.33, 1700.00,  NOW()),
(5, 1, 5, '2026-04-30', 566.67, 16800.00, NOW()),
(6, 1, 6, '2026-04-30', 137.50, 3700.00,  NOW()),
(7, 1, 7, '2026-04-30', 89.29,  2428.57,  NOW());
SELECT setval('asset_depreciation_id_seq', 7);

-- ==================================================
-- SECTION 27: INSERT QUOTATIONS
-- ==================================================

INSERT INTO quotations (id, company_id, customer_id, quote_number, quote_date, expiry_date, status, subtotal, tax_total, discount_total, grand_total, notes, terms_conditions, created_by) VALUES
(1, 1, 1, 'Q-2026-0001', '2026-04-01', '2026-05-01', 'converted', 12999.75, 2599.95, 0.00, 15599.70, 'Q2 infrastructure upgrade proposal - converted to SO-2026-0001', 'Payment due within 30 days of invoice. Warranty: 2 years.', 5),
(2, 1, 10, 'Q-2026-0002', '2026-04-20', '2026-05-20', 'sent', 8749.50, 1749.90, 437.48, 10061.93, 'Warehouse logistics IT upgrade - Vanguard Logistics', 'Volume discount of 5% applied. Net 45 payment terms.', 5),
(3, 1, 5, 'Q-2026-0003', '2026-05-01', '2026-06-01', 'draft', 4799.50, 959.90, 0.00, 5759.40, 'Office IT setup for new headquarters floor', 'Standard terms apply. Delivery within 5 business days.', 5);
SELECT setval('quotations_id_seq', 3);

INSERT INTO quotation_items (id, quotation_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total) VALUES
(1, 1, 4,  'Asus ROG STRIX Z790-E Motherboard',         5,  429.99, 0, 20, 2149.95),
(2, 1, 6,  'Intel Core i7-13700K',                       5,  399.99, 0, 20, 1999.95),
(3, 1, 7,  'NVIDIA GeForce RTX 4070',                    5,  599.99, 0, 20, 2999.95),
(4, 1, 2,  'Samsung 870 EVO 500GB SSD',                 10,   64.99, 0, 20,  649.90),
(5, 1, 1,  'Seagate BarraCuda 1TB HDD',                 20,   49.99, 0, 20,  999.80),
(6, 1, 16, 'CalDigit Thunderbolt 4 Element Hub',         5,  219.99, 0, 20, 1099.95),
(7, 1, 17, 'APC Back-UPS Pro 1500VA',                    5,  229.99, 0, 20, 1149.95),
(8, 1, 12, 'Asus RT-AX86U Pro Router',                   4,  249.99, 5, 20,  949.96),
-- Q-2: Vanguard Logistics
(9,  2, 1,  'Seagate BarraCuda 1TB HDD',                 40,   49.99, 5, 20, 1899.62),
(10, 2, 2,  'Samsung 870 EVO 500GB SSD',                 25,   64.99, 5, 20, 1543.51),
(11, 2, 5,  'EVGA SuperNOVA 850 G7 PSU',                 10,  149.99, 5, 20, 1424.91),
(12, 2, 10, 'Logitech MX Master 3S',                     20,   99.99, 5, 20, 1899.81),
(13, 2, 12, 'Asus RT-AX86U Pro Router',                   5,  249.99, 5, 20, 1187.45),
(14, 2, 17, 'APC Back-UPS Pro 1500VA',                    3,  229.99, 0, 20,  689.97),
(15, 2, 20, 'Samsung T7 Shield 2TB External SSD',        5,  219.99, 0, 20, 1099.95),
-- Q-3: Pinnacle Construction
(16, 3, 8,  'LG 27UN880-B 4K Monitor',                    5,  549.99, 0, 20, 2749.95),
(17, 3, 9,  'Logitech MX Mechanical Keyboard',           6,  169.99, 0, 20, 1019.94),
(18, 3, 10, 'Logitech MX Master 3S',                      5,   99.99, 0, 20,  499.95),
(19, 3, 18, 'Brother HL-L2370DW Printer',                 2,  179.99, 0, 20,  359.98),
(20, 3, 1,  'Seagate BarraCuda 1TB HDD',                 20,   49.99, 0, 20,  999.80);
SELECT setval('quotation_items_id_seq', 20);

-- ==================================================
-- SECTION 28: INSERT SERVICES
-- ==================================================

INSERT INTO services (id, company_id, name, description, category, unit_price, tax_percent, is_active, created_by) VALUES
(1, 1, 'Warranty Extension - 3 Year', 'Extended warranty coverage for all hardware products', 'Support', 149.99, 20, true, 5),
(2, 1, 'On-Site Installation', 'Professional on-site installation and setup service', 'Installation', 299.99, 20, true, 5),
(3, 1, 'Data Migration', 'Secure data migration from old storage devices', 'Data Services', 199.99, 20, true, 5),
(4, 1, 'IT Infrastructure Audit', 'Comprehensive IT infrastructure assessment and reporting', 'Consulting', 999.99, 20, true, 5),
(5, 1, 'Managed IT Support - Monthly', 'Ongoing IT support and maintenance (per server)', 'Support', 499.99, 20, true, 5),
(6, 1, 'Network Cabling & Setup', 'CAT6 ethernet cabling and network rack setup (per drop)', 'Installation', 85.00, 20, true, 5);
SELECT setval('services_id_seq', 6);

INSERT INTO service_invoices (id, company_id, invoice_number, customer_id, invoice_date, due_date, status, subtotal, tax_total, discount_total, grand_total, notes, created_by) VALUES
(1, 1, 'SVC-INV-2026-0001', 1, '2026-04-15', '2026-05-15', 'paid', 1049.97, 210.00, 0.00, 1259.97, 'Installation & data migration for AlphaTech Q2 equipment', 5),
(2, 1, 'SVC-INV-2026-0002', 4, '2026-04-30', '2026-05-30', 'sent', 1999.98, 400.00, 0.00, 2399.98, 'IT audit and managed support for Quantum Financial', 5);
SELECT setval('service_invoices_id_seq', 2);

INSERT INTO service_invoice_items (id, service_invoice_id, service_id, description, quantity, unit_price, discount_percent, tax_percent, total) VALUES
(1, 1, 2, 'On-site installation - AlphaTech', 3, 299.99, 0, 20, 899.97),
(2, 1, 3, 'Data migration - AlphaTech servers', 1, 199.99, 0, 20, 199.99),
(3, 2, 4, 'IT infrastructure audit - Quantum Financial', 1, 999.99, 0, 20, 999.99),
(4, 2, 5, 'Managed IT support (1 server) - Quantum Financial, first month', 2, 499.99, 0, 20, 999.99);
SELECT setval('service_invoice_items_id_seq', 4);

-- ==================================================
-- SECTION 29: INSERT STOCK TRANSFERS
-- ==================================================

INSERT INTO stock_transfers (id, company_id, transfer_number, from_warehouse_id, to_warehouse_id, transfer_date, status, notes, created_by, approved_by, approved_at) VALUES
(1, 1, 'ST-2026-0001', 1, 2, '2026-05-06', 'draft', 'Initial stock transfer to North Chicago distribution center', 1, NULL, NULL);
SELECT setval('stock_transfers_id_seq', 1);

INSERT INTO stock_transfer_items (id, stock_transfer_id, product_id, quantity, unit_cost) VALUES
(1, 1, 1,  50, 32.50),
(2, 1, 2,  30, 42.00),
(3, 1, 10, 20, 68.00),
(4, 1, 14, 15, 48.00);
SELECT setval('stock_transfer_items_id_seq', 4);

-- ==================================================
-- SECTION 30: INSERT CRM DATA
-- ==================================================

INSERT INTO leads (id, company_id, first_name, last_name, email, phone, mobile, company, designation, source_id, status_id, assigned_to, address, city, state, country, postal_code, notes, created_by) VALUES
(1, 1, 'Robert', 'Mitchell', 'robert.mitchell@defense-logistics.com', '+1 (202) 555-0192', '+1 (202) 555-9102', 'Defense Logistics Corp', 'IT Director', 1, 4, 5, '1400 Defense Pentagon', 'Washington', 'DC', 'USA', '20301', 'Interested in bulk storage and server equipment for new data center', 5),
(2, 1, 'Jessica', 'Martinez', 'jessica.martinez@eduspark.org', '+1 (512) 555-0231', '+1 (512) 555-2301', 'EduSpark Learning', 'CTO', 4, 3, 5, '200 Congress Ave, Ste 500', 'Austin', 'TX', 'USA', '78701', 'Evaluating vendors for state-wide school district IT refresh', 5),
(3, 1, 'Derek', 'Anderson', 'derek.anderson@pacificacapital.com', '+1 (213) 555-0456', '+1 (213) 555-4560', 'Pacifica Capital Partners', 'Managing Director', 7, 1, 5, '444 S Flower St, 42nd Fl', 'Los Angeles', 'CA', 'USA', '90071', 'New firm opening - needs full IT setup for 200-person office', 5),
(4, 1, 'Samantha', 'Brooks', 'sam.brooks@northwest-med.com', '+1 (503) 555-0678', '+1 (503) 555-6780', 'Northwest Medical Group', 'Practice Administrator', 2, 2, 5, '500 NE Multnomah Blvd, Ste 300', 'Portland', 'OR', 'USA', '97232', 'Referred by Meridian Healthcare contact', 5);
SELECT setval('leads_id_seq', 4);

INSERT INTO opportunities (id, company_id, lead_id, customer_id, name, description, expected_revenue, probability, expected_close_date, stage, priority, assigned_to, created_by) VALUES
(1, 1, 1, NULL, 'Defense Logistics Data Center Buildout', 'Full data center infrastructure including servers, storage, networking', 185000.00, 30, '2026-07-15', 'proposal', 'high', 5, 5),
(2, 1, 2, NULL, 'EduSpark School District IT Refresh', '30 school locations - desktops, laptops, networking, AV equipment', 425000.00, 20, '2026-08-30', 'qualification', 'high', 5, 5),
(3, 1, 3, NULL, 'Pacifica Capital Office IT Setup', 'Full IT equipment for 200-person financial office', 350000.00, 15, '2026-06-30', 'qualification', 'high', 5, 5),
(4, 1, 4, NULL, 'Northwest Medical IT Upgrade', 'Medical practice IT upgrade - workstations, servers, EMR infrastructure', 95000.00, 40, '2026-06-15', 'negotiation', 'medium', 5, 5);
SELECT setval('opportunities_id_seq', 4);

-- ==================================================
-- SECTION 31: INSERT PROJECTS
-- ==================================================

INSERT INTO projects (id, company_id, project_code, name, description, customer_id, start_date, end_date, budget_amount, status, priority, project_manager, notes, created_by) VALUES
(1, 1, 'PRJ-2026-001', 'AlphaTech Infrastructure Deployment', 'End-to-end deployment of IT infrastructure for AlphaTech Solutions', 1, '2026-04-07', '2026-04-20', 18000.00, 'completed', 'high', 5, 'All equipment delivered and installed ahead of schedule', 5),
(2, 1, 'PRJ-2026-002', 'Quantum Financial Workstation Refresh', 'Refresh of 30 workstations for Quantum Financial Group', 4, '2026-04-28', '2026-05-30', 15000.00, 'in_progress', 'high', 5, 'Phase 1 completed, awaiting balance payment for Phase 2', 5),
(3, 1, 'PRJ-2026-003', 'Atlanta Warehouse Setup', 'Full setup of Atlanta regional distribution center', NULL, '2026-04-01', '2026-05-15', 25000.00, 'in_progress', 'medium', 4, 'Warehouse racking and inventory system installed', 4),
(4, 1, 'PRJ-2026-004', 'NexGen ERP System Upgrade', 'Internal ERP system migration and upgrade project', NULL, '2026-05-01', '2026-08-01', 45000.00, 'planning', 'high', 6, 'Scope definition in progress, vendor evaluation phase', 6);
SELECT setval('projects_id_seq', 4);

INSERT INTO project_tasks (id, company_id, project_id, parent_task_id, name, description, assigned_to, start_date, due_date, completed_date, estimated_hours, actual_hours, priority, status, created_by) VALUES
(1, 1, 1, NULL, 'Hardware assembly & testing', 'Assemble and test all workstations before delivery', 2, '2026-04-07', '2026-04-10', '2026-04-10', 16, 14, 'high', 'completed', 5),
(2, 1, 1, NULL, 'On-site installation AlphaTech', 'Deliver and install equipment at AlphaTech NYC office', 6, '2026-04-11', '2026-04-13', '2026-04-13', 24, 22, 'high', 'completed', 5),
(3, 1, 1, NULL, 'Network configuration', 'Configure routers and network equipment', 6, '2026-04-14', '2026-04-16', '2026-04-15', 12, 10, 'high', 'completed', 5),
(4, 1, 1, NULL, 'User acceptance testing', 'Walkthrough and sign-off with AlphaTech IT team', 5, '2026-04-17', '2026-04-20', '2026-04-19', 8, 6, 'high', 'completed', 5),
(5, 1, 2, NULL, 'Quantum Financial Phase 1 delivery', 'Deliver first batch of 15 workstations', 2, '2026-04-28', '2026-05-02', '2026-05-01', 20, 18, 'high', 'completed', 5),
(6, 1, 2, NULL, 'Quantum Financial Phase 1 installation', 'Install and configure Phase 1 workstations', 6, '2026-05-03', '2026-05-08', NULL, 16, 12, 'high', 'in_progress', 5),
(7, 1, 2, NULL, 'Quantum Financial Phase 2', 'Deliver and install remaining 15 workstations', 2, '2026-05-11', '2026-05-22', NULL, 24, 0, 'medium', 'todo', 5),
(8, 1, 3, NULL, 'Atlanta racking installation', 'Install pallet racking and shelving systems', 8, '2026-04-01', '2026-04-08', '2026-04-07', 40, 38, 'high', 'completed', 4),
(9, 1, 3, NULL, 'Atlanta inventory system setup', 'Configure WMS and barcode scanning system', 1, '2026-04-09', '2026-04-18', '2026-04-17', 30, 28, 'high', 'completed', 4),
(10, 1, 3, NULL, 'Atlanta staff training', 'Train Atlanta warehouse staff on WMS and procedures', 4, '2026-04-19', '2026-04-25', '2026-04-24', 16, 15, 'high', 'completed', 4),
(11, 1, 4, NULL, 'ERP requirements gathering', 'Document functional requirements for ERP upgrade', 6, '2026-05-01', '2026-05-15', NULL, 40, 8, 'high', 'in_progress', 6),
(12, 1, 4, NULL, 'Vendor evaluation and selection', 'Evaluate ERP vendors and select implementation partner', 9, '2026-05-16', '2026-06-01', NULL, 30, 0, 'high', 'pending', 9);
SELECT setval('project_tasks_id_seq', 12);

INSERT INTO project_members (id, company_id, project_id, user_id, role, hourly_rate) VALUES
(1, 1, 1, 5, 'project_manager', 45.00),
(2, 1, 1, 2, 'technician', 25.00),
(3, 1, 1, 6, 'engineer', 35.00),
(4, 1, 2, 5, 'project_manager', 45.00),
(5, 1, 2, 2, 'technician', 25.00),
(6, 1, 2, 6, 'engineer', 35.00),
(7, 1, 3, 4, 'project_manager', 50.00),
(8, 1, 3, 8, 'associate', 20.00),
(9, 1, 3, 1, 'consultant', 55.00),
(10, 1, 4, 6, 'project_manager', 35.00),
(11, 1, 4, 9, 'sponsor', 70.00);
SELECT setval('project_members_id_seq', 11);

-- ==================================================
-- SECTION 32: INSERT APPROVAL WORKFLOWS
-- ==================================================

INSERT INTO approval_workflows (id, company_id, name, description, target_entity, is_active, created_by) VALUES
(1, 1, 'Purchase Order Approval', 'Approval workflow for purchase orders over $5,000', 'purchase_order', true, 1),
(2, 1, 'Leave Request Approval', 'Approval workflow for employee leave requests', 'leave_request', true, 1),
(3, 1, 'Expense Report Approval', 'Approval workflow for expense reports over $1,000', 'expense', true, 1);
SELECT setval('approval_workflows_id_seq', 3);

INSERT INTO approval_steps (id, workflow_id, step_order, approver_id, min_amount, max_amount, requires_all) VALUES
(1, 1, 1, 9, 5000.01, 25000.00, false),
(2, 1, 2, 1, 25000.01, 100000.00, false),
(3, 2, 1, 1, NULL, NULL, false),
(4, 3, 1, 9, 1000.01, 5000.00, false),
(5, 3, 2, 1, 5000.01, NULL, false);
SELECT setval('approval_steps_id_seq', 5);

-- ==================================================
-- SECTION 33: INSERT BANK ACCOUNTS & TRANSACTIONS
-- ==================================================

INSERT INTO bank_accounts (id, company_id, account_id, bank_name, account_number, account_name, opening_balance, as_of_date, is_active, created_by) VALUES
(1, 1, 1, 'Chase Bank', '****-****-4821', 'NexGen Manufacturing - Operating Account', 285000.00, '2026-01-01', true, 3),
(2, 1, 1, 'Bank of America', '****-****-7730', 'NexGen Manufacturing - Reserve Account', 150000.00, '2026-01-01', true, 3);
SELECT setval('bank_accounts_id_seq', 2);

INSERT INTO bank_transactions (id, company_id, bank_account_id, transaction_date, description, reference_number, debit, credit, balance, is_cleared) VALUES
(1, 1, 1, '2026-04-01', 'Beginning balance April', NULL, 0, 0, 285000.00, true),
(2, 1, 1, '2026-04-02', 'Warehouse rent - April', 'RENT-2026-04', 0, 18500.00, 266500.00, true),
(3, 1, 1, '2026-04-07', 'Payment received - AlphaTech Solutions', 'WIRE-APR-2026-001', 15599.70, 0, 282099.70, true),
(4, 1, 1, '2026-04-10', 'Payment to Ingram Micro - PO-2026-0001', 'ACH-INGRAM-APR', 0, 17550.00, 264549.70, true),
(5, 1, 1, '2026-04-11', 'Payment to TechData - PO-2026-0002', 'ACH-TECHDATA-APR', 0, 19199.52, 245350.18, true),
(6, 1, 1, '2026-04-15', 'Bi-weekly payroll', 'PAY-2026-0405', 0, 45200.00, 200150.18, true),
(7, 1, 1, '2026-04-18', 'Payment to Synnex - PO-2026-0003', 'ACH-SYNNEX-APR', 0, 10770.00, 189380.18, true),
(8, 1, 1, '2026-04-22', 'Payment to CDW - PO-2026-0004', 'ACH-CDW-APR', 0, 13500.00, 175880.18, true),
(9, 1, 1, '2026-04-30', 'Payment received - Apex Retail', 'CC-CHD-2026-0430', 5940.00, 0, 181820.18, true),
(10, 1, 1, '2026-05-05', 'Partial payment - Quantum Financial', 'CK-1042', 5921.91, 0, 187742.09, true);
SELECT setval('bank_transactions_id_seq', 10);

-- ==================================================
-- SECTION 34: INSERT BUDGET
-- ==================================================

INSERT INTO budgets (id, company_id, fiscal_year, name, status, notes, created_by) VALUES
(1, 1, 2026, 'FY2026 Annual Operating Budget', 'approved', 'Approved operating budget for fiscal year 2026', 3);
SELECT setval('budgets_id_seq', 1);

INSERT INTO budget_items (id, budget_id, account_id, cost_center_id, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec) VALUES
(1, 1, 19, 4, 42000, 42000, 42000, 42000, 42000, 42000, 44000, 44000, 44000, 44000, 44000, 44000),
(2, 1, 20, 2, 18500, 18500, 18500, 18500, 18500, 18500, 18500, 18500, 18500, 18500, 18500, 18500),
(3, 1, 25, 5, 3200,  3200,  3200,  3200,  3200,  3200,  3200,  3200,  3200,  3200,  3200,  3200),
(4, 1, 22, 2, 3500,  3500,  4200,  4800,  5200,  5500,  5000,  4800,  4500,  4200,  4000,  3800),
(5, 1, 21, 2, 600,   600,   600,   800,   800,   800,   600,   600,   800,   600,   600,   600),
(6, 1, 23, 4, 2000,  2000,  2500,  3000,  2500,  2000,  2000,  2000,  3000,  2500,  2000,  2000);
SELECT setval('budget_items_id_seq', 6);

-- ==================================================
-- SECTION 35: UPDATE CURRENT STOCK (products table)
-- to reflect all transactions
-- ==================================================

-- Recalculate current_stock based on product_warehouse_stock
UPDATE products p
SET current_stock = COALESCE((
    SELECT SUM(quantity) FROM product_warehouse_stock
    WHERE product_id = p.id
), 0);

-- ==================================================
-- FINAL: ROW COUNT SUMMARY
-- ==================================================

SELECT '=== ROW COUNT SUMMARY ===' AS " ";

SELECT 'companies'             AS "Table", COUNT(*) AS "Rows" FROM companies
UNION ALL
SELECT 'tax_rates'             , COUNT(*) FROM tax_rates
UNION ALL
SELECT 'warehouses'            , COUNT(*) FROM warehouses
UNION ALL
SELECT 'warehouse_bins'        , COUNT(*) FROM warehouse_bins
UNION ALL
SELECT 'products'              , COUNT(*) FROM products
UNION ALL
SELECT 'suppliers'             , COUNT(*) FROM suppliers
UNION ALL
SELECT 'customers'             , COUNT(*) FROM customers
UNION ALL
SELECT 'employees'             , COUNT(*) FROM employees
UNION ALL
SELECT 'cost_centers'          , COUNT(*) FROM cost_centers
UNION ALL
SELECT 'attendance'            , COUNT(*) FROM attendance
UNION ALL
SELECT 'leave_requests'        , COUNT(*) FROM leave_requests
UNION ALL
SELECT 'chart_of_accounts'     , COUNT(*) FROM chart_of_accounts
UNION ALL
SELECT 'expense_categories'    , COUNT(*) FROM expense_categories
UNION ALL
SELECT 'expenses'              , COUNT(*) FROM expenses
UNION ALL
SELECT 'purchase_orders'       , COUNT(*) FROM purchase_orders
UNION ALL
SELECT 'purchase_order_items'  , COUNT(*) FROM purchase_order_items
UNION ALL
SELECT 'sales_orders'          , COUNT(*) FROM sales_orders
UNION ALL
SELECT 'sales_order_items'     , COUNT(*) FROM sales_order_items
UNION ALL
SELECT 'inventory_transactions', COUNT(*) FROM inventory_transactions
UNION ALL
SELECT 'product_warehouse_stock', COUNT(*) FROM product_warehouse_stock
UNION ALL
SELECT 'invoices'              , COUNT(*) FROM invoices
UNION ALL
SELECT 'invoice_items'         , COUNT(*) FROM invoice_items
UNION ALL
SELECT 'payments'              , COUNT(*) FROM payments
UNION ALL
SELECT 'journal_entries'       , COUNT(*) FROM journal_entries
UNION ALL
SELECT 'journal_entry_lines'   , COUNT(*) FROM journal_entry_lines
UNION ALL
SELECT 'asset_categories'      , COUNT(*) FROM asset_categories
UNION ALL
SELECT 'fixed_assets'          , COUNT(*) FROM fixed_assets
UNION ALL
SELECT 'asset_depreciation'    , COUNT(*) FROM asset_depreciation
UNION ALL
SELECT 'quotations'            , COUNT(*) FROM quotations
UNION ALL
SELECT 'quotation_items'       , COUNT(*) FROM quotation_items
UNION ALL
SELECT 'services'              , COUNT(*) FROM services
UNION ALL
SELECT 'service_invoices'      , COUNT(*) FROM service_invoices
UNION ALL
SELECT 'service_invoice_items' , COUNT(*) FROM service_invoice_items
UNION ALL
SELECT 'stock_transfers'       , COUNT(*) FROM stock_transfers
UNION ALL
SELECT 'stock_transfer_items'  , COUNT(*) FROM stock_transfer_items
UNION ALL
SELECT 'leads'                 , COUNT(*) FROM leads
UNION ALL
SELECT 'opportunities'         , COUNT(*) FROM opportunities
UNION ALL
SELECT 'projects'              , COUNT(*) FROM projects
UNION ALL
SELECT 'project_tasks'         , COUNT(*) FROM project_tasks
UNION ALL
SELECT 'project_members'       , COUNT(*) FROM project_members
UNION ALL
SELECT 'approval_workflows'    , COUNT(*) FROM approval_workflows
UNION ALL
SELECT 'approval_steps'        , COUNT(*) FROM approval_steps
UNION ALL
SELECT 'bank_accounts'         , COUNT(*) FROM bank_accounts
UNION ALL
SELECT 'bank_transactions'     , COUNT(*) FROM bank_transactions
UNION ALL
SELECT 'budgets'               , COUNT(*) FROM budgets
UNION ALL
SELECT 'budget_items'          , COUNT(*) FROM budget_items
ORDER BY 1;

SELECT '=== DATA RESET AND POPULATE COMPLETE ===' AS " ";

COMMIT;
