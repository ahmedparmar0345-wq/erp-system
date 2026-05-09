-- ====================================================================
-- ERP Database: Reset (Data Only) & Populate with Realistic Demo Data
-- ====================================================================
-- WARNING: Deletes ALL data from ALL tables EXCEPT auth tables (users,
--   sessions, password_resets, roles etc. are kept).
-- Does NOT modify table structures.
-- ====================================================================

BEGIN;

-- ====================================================================
-- PHASE 1: DELETE EXISTING DATA (FK-safe order: children before parents)
-- ====================================================================

-- Level 1: Leaf / child tables
DELETE FROM purchase_return_items;
DELETE FROM sales_return_items;
DELETE FROM purchase_order_items;
DELETE FROM sales_order_items;
DELETE FROM invoice_items;
DELETE FROM quotation_items;
DELETE FROM service_invoice_items;
DELETE FROM pos_transaction_items;
DELETE FROM stock_transfer_items;
DELETE FROM asset_depreciation;
DELETE FROM asset_maintenance;
DELETE FROM time_entries;
DELETE FROM project_members;
DELETE FROM project_tasks;
DELETE FROM pos_cart;
DELETE FROM budget_items;
DELETE FROM recurring_entry_lines;
DELETE FROM journal_entry_lines;
DELETE FROM approval_logs;
DELETE FROM approval_steps;
DELETE FROM approval_requests;
DELETE FROM bank_transactions;
DELETE FROM reconciliation_reports;
DELETE FROM employee_documents;
DELETE FROM attendance;
DELETE FROM leave_requests;
DELETE FROM audit_logs;
DELETE FROM interactions;
DELETE FROM follow_ups;
DELETE FROM opportunities;
DELETE FROM leads;

-- Level 2: Mid-level tables
DELETE FROM purchase_returns;
DELETE FROM sales_returns;
DELETE FROM credit_notes;
DELETE FROM expenses;
DELETE FROM expense_categories;
DELETE FROM pos_transactions;
DELETE FROM pos_sessions;
DELETE FROM stock_transfers;
DELETE FROM product_warehouse_stock;
DELETE FROM warehouse_bins;
DELETE FROM inventory_transactions;

-- Level 3: Header / main entity tables
DELETE FROM payments;
DELETE FROM invoices;
DELETE FROM quotation_items;
DELETE FROM quotations;
DELETE FROM sales_order_items;
DELETE FROM sales_orders;
DELETE FROM purchase_order_items;
DELETE FROM purchase_orders;
DELETE FROM journal_entries;
DELETE FROM budgets;
DELETE FROM recurring_entries;
DELETE FROM bank_accounts;
DELETE FROM cost_centers;
DELETE FROM service_invoice_items;
DELETE FROM service_invoices;
DELETE FROM services;
DELETE FROM projects;
DELETE FROM approval_workflows;

-- Level 4: Core reference tables
DELETE FROM warehouses;
DELETE FROM products;
DELETE FROM tax_rates;
DELETE FROM suppliers;
DELETE FROM customers;
DELETE FROM chart_of_accounts;
DELETE FROM return_reasons;
DELETE FROM lead_sources;
DELETE FROM lead_statuses;
DELETE FROM leave_types;
DELETE FROM companies;

-- Level 5: Settings / config (full reseed)
DELETE FROM system_settings;
DELETE FROM email_templates;

-- ====================================================================
-- RESET SEQUENCES
-- ====================================================================
DO $$
DECLARE
    seq RECORD;
BEGIN
    FOR seq IN
        SELECT sequence_name
        FROM information_schema.sequences
        WHERE sequence_schema = 'public'
          AND sequence_name LIKE '%_id_seq'
          AND sequence_name NOT IN ('users_id_seq', 'roles_id_seq')
    LOOP
        EXECUTE 'ALTER SEQUENCE ' || seq.sequence_name || ' RESTART WITH 1';
    END LOOP;
END $$;

-- ====================================================================
-- PHASE 2: INSERT DEMO DATA
-- ====================================================================

-- 2a. COMPANIES
INSERT INTO companies (id, name, tax_id, email, phone, address, currency)
VALUES
(1, 'Acme Corporation',
    'US45-6789123',
    'corporate@acmecorp.com',
    '+1 (212) 555-0198',
    'One Acme Plaza, 350 Fifth Avenue, New York, NY 10118, United States',
    'USD');

-- 2b. TAX RATES
INSERT INTO tax_rates (company_id, name, rate, type, is_default, is_active, description) VALUES
(1, 'Standard VAT', 20.00, 'VAT', true, true, 'Standard VAT rate 20%'),
(1, 'Reduced VAT', 5.00, 'VAT', false, true, 'Reduced VAT rate 5%'),
(1, 'Zero Rated', 0.00, 'VAT', false, true, 'Zero rated supplies'),
(1, 'Sales Tax 8.875%', 8.875, 'Sales Tax', false, true, 'New York State & City combined sales tax'),
(1, 'Sales Tax 7.25%', 7.25, 'Sales Tax', false, true, 'California state sales tax');

-- 2c. PRODUCT CATEGORIES (via products.description / name – no dedicated table)
--    Products use sku naming convention: prefix indicates category.

-- 2d. PRODUCTS
INSERT INTO products (company_id, sku, name, description, unit_price, cost_price, current_stock, reorder_level, tax_rate_id) VALUES
(1, 'ELE-LAP-001', 'ThinkPad X1 Carbon Gen 11',
    '14" Intel Core i7-1365U, 16GB RAM, 512GB SSD, Windows 11 Pro. Ultrabook for enterprise.', 1899.00, 1250.00, 45, 10, 1),
(1, 'ELE-LAP-002', 'MacBook Pro 16" M3 Pro',
    'Apple M3 Pro chip, 18GB Unified Memory, 512GB SSD, Space Black. Professional laptop.', 2499.00, 2100.00, 28, 5, 1),
(1, 'ELE-MON-001', 'Dell UltraSharp U2723QE 27" 4K',
    '27" IPS Black, 3840x2160, USB-C Hub, 90W Power Delivery. Professional monitor.', 619.99, 420.00, 72, 15, 1),
(1, 'ELE-MOU-001', 'Logitech MX Master 3S',
    'Wireless ergonomic mouse, 8000 DPI, quiet clicks, USB-C, multi-device.', 99.99, 58.00, 200, 30, 1),
(1, 'ELE-KBD-001', 'Keychron Q1 Pro Mechanical Keyboard',
    '75% layout, Gateron Jupiter Brown switches, RGB backlight, aluminum case.', 199.00, 130.00, 85, 20, 1),
(1, 'ELE-HUB-001', 'Anker PowerExpand 11-in-1 USB-C Hub',
    'USB-C to triple monitor, 4K HDMI, 100W PD, ethernet, SD card reader.', 89.99, 52.00, 150, 25, 1),
(1, 'ELE-HDP-001', 'Sony WH-1000XM5 Wireless Headphones',
    'Industry-leading noise cancellation, 30hr battery, multipoint connection.', 349.00, 275.00, 60, 12, 1),
(1, 'FUR-CHR-001', 'Herman Miller Aeron Chair Size B',
    'Ergonomic mesh office chair, adjustable lumbar support, polished aluminum.', 1395.00, 980.00, 15, 5, 4),
(1, 'FUR-DSK-001', 'Uplift V2 Standing Desk 72x30"',
    'Electric height-adjustable standing desk, bamboo top, dual motor.', 799.00, 520.00, 22, 8, 4),
(1, 'ELE-STO-001', 'Samsung T7 Shield 2TB External SSD',
    'USB 3.2 Gen 2, 1050MB/s read, IP65 water/dust resistant, portable.', 179.99, 115.00, 95, 20, 1),
(1, 'ELE-CAM-001', 'Logitech Brio 4K Webcam',
    '4K Ultra HD, auto-focus, IR for Windows Hello, noise-cancelling mic.', 199.99, 135.00, 55, 15, 1),
(1, 'SFT-OFF-001', 'Microsoft 365 Business Premium License',
    'Annual subscription per user: Office apps, Exchange, Teams, SharePoint, Defender.', 264.00, 180.00, 500, 100, 3),
(1, 'SFT-OFF-002', 'QuickBooks Online Advanced Annual Subscription',
    'Accounting & payroll software for mid-size businesses, 25 users included.', 1800.00, 1200.00, 10, 3, 3),
(1, 'ELE-NET-001', 'Cisco Meraki MX68 Cloud-Managed Firewall',
    'Security appliance with SD-WAN, 1Gbps firewall throughput, 5-year license.', 1249.00, 890.00, 8, 2, 1),
(1, 'SUP-GEN-001', 'Staples Copy Paper 8.5x11 Case (10 Reams)',
    '92 brightness, 20lb bond, 5000 sheets per case. General office use.', 59.99, 38.00, 320, 50, 4);

-- 2e. SUPPLIERS
INSERT INTO suppliers (company_id, name, email, phone, address) VALUES
(1, 'TechDistrib Inc.',
    'orders@techdistrib.com',
    '+1 (408) 555-0142',
    '2300 Mission College Blvd, Santa Clara, CA 95054'),
(1, 'Global Office Systems',
    'sales@globaloffice.com',
    '+1 (312) 555-0217',
    '440 S LaSalle St Suite 400, Chicago, IL 60605'),
(1, 'Pacific Rim Electronics Ltd.',
    'export@pacificelec.com',
    '+86 (755) 8888-1234',
    '12F Fortune Tower, Nanshan District, Shenzhen, China 518000'),
(1, 'National Furniture Mart',
    'contract@natfurniture.com',
    '+1 (704) 555-0093',
    '1000 Corporate Center Dr, High Point, NC 27263'),
(1, 'Southland Paper & Packaging Co.',
    'csr@southlandpaper.com',
    '+1 (770) 555-0365',
    '3500 Highlands Pkwy SE, Atlanta, GA 30382'),
(1, 'Meridian Software Solutions',
    'licensing@meridiansoft.com',
    '+1 (425) 555-0110',
    '1500 4th Ave Suite 200, Seattle, WA 98101'),
(1, 'Apex Networking Hardware',
    'info@apexnetwork.com',
    '+1 (972) 555-0478',
    '2500 Dallas Pkwy Suite 800, Plano, TX 75093'),
(1, 'EcoSupply Sustainable Materials',
    'green@ecosupply.com',
    '+1 (503) 555-0821',
    '1120 NW 5th Ave, Portland, OR 97209');

-- 2f. CUSTOMERS
INSERT INTO customers (company_id, name, email, phone, billing_address, shipping_address) VALUES
(1, 'TechFlow Solutions Inc.',
    'ap@techflowsolutions.com',
    '+1 (415) 555-0101',
    '160 Spear St, San Francisco, CA 94105',
    '160 Spear St, San Francisco, CA 94105'),
(1, 'GreenLeaf Enterprises Ltd.',
    'invoices@greenleafenterprises.com',
    '+1 (206) 555-0234',
    '701 5th Ave Suite 4200, Seattle, WA 98104',
    '701 5th Ave Suite 4200, Seattle, WA 98104'),
(1, 'Blue Ridge Holdings LLC',
    'accounting@blueridgeholdings.com',
    '+1 (434) 555-0476',
    '1000 E High St, Charlottesville, VA 22902',
    '1000 E High St, Charlottesville, VA 22902'),
(1, 'Pacific Rim Trading Co.',
    'payables@pacrimtrading.com',
    '+1 (808) 555-0912',
    '999 Bishop St Suite 1800, Honolulu, HI 96813',
    '999 Bishop St Suite 1800, Honolulu, HI 96813'),
(1, 'MetroCity Retail Group',
    'finance@metrocityretail.com',
    '+1 (212) 555-0678',
    '350 W 50th St, New York, NY 10019',
    '350 W 50th St, New York, NY 10019'),
(1, 'Sunrise Hospitality Partners',
    'billing@sunrisehospitality.com',
    '+1 (305) 555-0345',
    '444 Brickell Ave Suite 800, Miami, FL 33131',
    '444 Brickell Ave Suite 800, Miami, FL 33131'),
(1, 'Quantum Data Systems',
    'accounts@quantumdata.io',
    '+1 (512) 555-0789',
    '816 Congress Ave Suite 1100, Austin, TX 78701',
    '816 Congress Ave Suite 1100, Austin, TX 78701'),
(1, 'Alpine Consulting Group',
    'finance@alpineconsulting.com',
    '+1 (303) 555-0567',
    '1800 Larimer St Suite 200, Denver, CO 80202',
    '1800 Larimer St Suite 200, Denver, CO 80202'),
(1, 'Redwood Construction Corp.',
    'ap@redwoodconstruction.com',
    '+1 (503) 555-0123',
    '200 SW Market St Suite 1500, Portland, OR 97201',
    '200 SW Market St Suite 1500, Portland, OR 97201'),
(1, 'Harbor Freight Logistics LLC',
    'payables@harborfreightlogistics.com',
    '+1 (904) 555-0890',
    '1 Independent Dr Suite 1200, Jacksonville, FL 32202',
    '1 Independent Dr Suite 1200, Jacksonville, FL 32202');

-- 2g. WAREHOUSES
INSERT INTO warehouses (company_id, code, name, address, city, state, country, postal_code, phone, email, is_default, is_active) VALUES
(1, 'MAIN', 'East Coast Distribution Center',
    '100 Logistics Drive', 'Newark', 'NJ', 'USA', '07114',
    '+1 (973) 555-0400', 'warehouse.ewr@acmecorp.com', true, true),
(1, 'WEST', 'West Coast Fulfillment Center',
    '2500 E Imperial Hwy', 'Los Angeles', 'CA', 'USA', '90059',
    '+1 (323) 555-0500', 'warehouse.lax@acmecorp.com', false, true),
(1, 'SOUTH', 'Southern Regional Warehouse',
    '4500 Lone Star Dr', 'Dallas', 'TX', 'USA', '75241',
    '+1 (214) 555-0600', 'warehouse.dfw@acmecorp.com', false, true),
(1, 'CENTRAL', 'Central Logistics Hub',
    '7800 W 79th St', 'Chicago', 'IL', 'USA', '60652',
    '+1 (773) 555-0700', 'warehouse.ord@acmecorp.com', false, true);

-- Product warehouse stock
INSERT INTO product_warehouse_stock (company_id, product_id, warehouse_id, quantity, reorder_level) VALUES
(1, 1, 1, 20, 10), (1, 1, 2, 15, 10), (1, 1, 3, 10, 5),
(1, 2, 1, 12, 5),  (1, 2, 2, 10, 5),  (1, 2, 3, 6, 5),
(1, 3, 1, 30, 15), (1, 3, 2, 25, 15), (1, 3, 3, 17, 10),
(1, 4, 1, 80, 30), (1, 4, 2, 70, 30), (1, 4, 4, 50, 20),
(1, 5, 1, 35, 20), (1, 5, 4, 30, 20), (1, 5, 3, 20, 10),
(1, 6, 1, 60, 25), (1, 6, 2, 55, 25), (1, 6, 4, 35, 15),
(1, 7, 1, 25, 12), (1, 7, 2, 20, 12), (1, 7, 4, 15, 8),
(1, 8, 1, 6, 5),   (1, 8, 2, 5, 3),   (1, 8, 3, 4, 3),
(1, 9, 1, 10, 8),  (1, 9, 2, 7, 5),   (1, 9, 3, 5, 5),
(1, 10, 1, 40, 20),(1, 10, 2, 35, 20),(1, 10, 4, 20, 10),
(1, 11, 1, 25, 15),(1, 11, 2, 20, 15),(1, 11, 3, 10, 10),
(1, 14, 1, 4, 2),  (1, 14, 2, 2, 2),  (1, 14, 4, 2, 2),
(1, 15, 1, 150, 50),(1, 15, 2, 100, 50),(1, 15, 3, 70, 30);

-- 2h. CHART OF ACCOUNTS
INSERT INTO chart_of_accounts (company_id, account_code, account_name, account_type, parent_account_id, description, is_active) VALUES
-- Assets (1)
(1, '1000', 'Current Assets', 'asset', NULL, 'Current asset accounts', true),
(1, '1100', 'Cash & Cash Equivalents', 'asset', 1, 'Cash on hand and in bank', true),
(1, '1101', 'Operating Account – Chase', 'asset', 2, 'Chase Business Checking x7890', true),
(1, '1102', 'Money Market Account', 'asset', 2, 'Reserve funds in money market', true),
(1, '1200', 'Accounts Receivable', 'asset', 1, 'Trade receivables', true),
(1, '1300', 'Inventory', 'asset', 1, 'Finished goods inventory', true),
(1, '1400', 'Prepaid Expenses', 'asset', 1, 'Prepaid insurance, rent, etc.', true),
(1, '1500', 'Fixed Assets', 'asset', NULL, 'Long-term tangible assets', true),
(1, '1501', 'Building & Improvements', 'asset', 8, 'Office building and leasehold improvements', true),
(1, '1502', 'Computer Equipment', 'asset', 8, 'Servers, workstations, laptops', true),
(1, '1503', 'Furniture & Fixtures', 'asset', 8, 'Office furniture and fixtures', true),
(1, '1504', 'Vehicles', 'asset', 8, 'Company fleet vehicles', true),
(1, '1600', 'Accumulated Depreciation', 'asset', NULL, 'Contra-asset for accumulated depreciation', true),
-- Liabilities (2)
(1, '2000', 'Current Liabilities', 'liability', NULL, 'Short-term liabilities', true),
(1, '2100', 'Accounts Payable', 'liability', 14, 'Trade payables', true),
(1, '2200', 'Accrued Expenses', 'liability', 14, 'Accrued payroll, taxes, etc.', true),
(1, '2300', 'Short-Term Loans', 'liability', 14, 'Notes payable less than 12 months', true),
(1, '2400', 'Sales Tax Payable', 'liability', 14, 'Sales tax collected to be remitted', true),
(1, '2500', 'Long-Term Liabilities', 'liability', NULL, 'Obligations beyond 12 months', true),
(1, '2501', 'Bank Loan – Term Loan', 'liability', 19, 'Chase term loan 5-year', true),
-- Equity (3)
(1, '3000', 'Shareholders Equity', 'equity', NULL, 'Equity accounts', true),
(1, '3100', 'Common Stock', 'equity', 21, 'Common shares issued', true),
(1, '3200', 'Retained Earnings', 'equity', 21, 'Cumulative retained earnings', true),
(1, '3300', 'Current Year Earnings', 'equity', 21, 'Fiscal year profit/loss', true),
-- Revenue (4)
(1, '4000', 'Revenue', 'revenue', NULL, 'Income accounts', true),
(1, '4100', 'Product Sales', 'revenue', 25, 'Revenue from product sales', true),
(1, '4200', 'Service Revenue', 'revenue', 25, 'Revenue from services', true),
(1, '4300', 'Interest Income', 'revenue', 25, 'Interest earned on bank accounts', true),
-- Expense (5)
(1, '5000', 'Cost of Goods Sold', 'expense', NULL, 'Direct costs of products sold', true),
(1, '5100', 'COGS – Electronics', 'expense', 29, 'Cost of electronics products sold', true),
(1, '5200', 'COGS – Furniture', 'expense', 29, 'Cost of furniture products sold', true),
(1, '5300', 'Operating Expenses', 'expense', NULL, 'General operating expenses', true),
(1, '5400', 'Salaries & Wages', 'expense', 32, 'Employee salaries and wages', true),
(1, '5500', 'Rent & Utilities', 'expense', 32, 'Office rent and utility payments', true),
(1, '5600', 'Office Supplies', 'expense', 32, 'Office supplies and stationery', true),
(1, '5700', 'Marketing & Advertising', 'expense', 32, 'Marketing and ad spend', true),
(1, '5800', 'Professional Fees', 'expense', 32, 'Legal, audit, consulting fees', true),
(1, '5900', 'Depreciation Expense', 'expense', 32, 'Depreciation of fixed assets', true),
(1, '6000', 'Tax Expense', 'expense', 32, 'Income tax and other taxes', true),
(1, '6100', 'Shipping & Logistics', 'expense', 32, 'Freight, shipping, and logistics costs', true);

-- 2i. EMPLOYEES
INSERT INTO employees (company_id, employee_code, first_name, last_name, email, phone,
    date_of_birth, gender, address, city, state, postal_code, country,
    department, position, hire_date, employment_type, salary,
    bank_name, bank_account_no, bank_routing_no,
    emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
    status) VALUES
(1, 'EMP-001', 'Sarah', 'Chen', 'sarah.chen@acmecorp.com', '+1 (212) 555-1001',
    '1987-03-15', 'Female', '245 Park Ave Apt 12B', 'New York', 'NY', '10167', 'USA',
    'Information Technology', 'Chief Technology Officer', '2020-06-01', 'Full-time', 185000.00,
    'Chase Bank', '****7890', '021000021',
    'Michael Chen', '+1 (212) 555-9001', 'Brother', 'active'),

(1, 'EMP-002', 'James', 'Rodriguez', 'james.rodriguez@acmecorp.com', '+1 (212) 555-1002',
    '1991-11-08', 'Male', '88 Greenwich St Apt 4A', 'New York', 'NY', '10006', 'USA',
    'Engineering', 'Senior Software Engineer', '2021-03-15', 'Full-time', 145000.00,
    'Bank of America', '****2345', '026009593',
    'Ana Rodriguez', '+1 (646) 555-8002', 'Wife', 'active'),

(1, 'EMP-003', 'Emily', 'Thompson', 'emily.thompson@acmecorp.com', '+1 (212) 555-1003',
    '1993-07-22', 'Female', '150 E 44th St Apt 7C', 'New York', 'NY', '10017', 'USA',
    'Sales & Marketing', 'VP of Sales', '2019-09-01', 'Full-time', 175000.00,
    'Chase Bank', '****5678', '021000021',
    'David Thompson', '+1 (917) 555-8003', 'Father', 'active'),

(1, 'EMP-004', 'Michael', 'Patel', 'michael.patel@acmecorp.com', '+1 (212) 555-1004',
    '1985-05-30', 'Male', '400 E 67th St Apt 15A', 'New York', 'NY', '10065', 'USA',
    'Finance & Accounting', 'Chief Financial Officer', '2018-01-20', 'Full-time', 220000.00,
    'Wells Fargo', '****9012', '026012881',
    'Priya Patel', '+1 (917) 555-8004', 'Wife', 'active'),

(1, 'EMP-005', 'Jessica', 'Kim', 'jessica.kim@acmecorp.com', '+1 (212) 555-1005',
    '1995-09-14', 'Female', '30 E 40th St Apt 3B', 'New York', 'NY', '10016', 'USA',
    'Human Resources', 'HR Director', '2020-07-06', 'Full-time', 135000.00,
    'Citibank', '****3456', '021272655',
    'Soo-Jin Kim', '+1 (201) 555-8005', 'Mother', 'active'),

(1, 'EMP-006', 'Robert', 'Martinez', 'robert.martinez@acmecorp.com', '+1 (212) 555-1006',
    '1989-12-03', 'Male', '250 W 55th St Apt 6D', 'New York', 'NY', '10019', 'USA',
    'Operations', 'Operations Manager', '2021-11-01', 'Full-time', 125000.00,
    'Chase Bank', '****7891', '021000021',
    'Lisa Martinez', '+1 (347) 555-8006', 'Sister', 'active'),

(1, 'EMP-007', 'Amanda', 'Wilson', 'amanda.wilson@acmecorp.com', '+1 (212) 555-1007',
    '1997-01-28', 'Female', '100 Gold St Apt 9F', 'New York', 'NY', '10038', 'USA',
    'Engineering', 'Junior Software Engineer', '2023-04-10', 'Full-time', 95000.00,
    'Bank of America', '****6789', '026009593',
    'Thomas Wilson', '+1 (516) 555-8007', 'Father', 'active'),

(1, 'EMP-008', 'David', 'Okafor', 'david.okafor@acmecorp.com', '+1 (212) 555-1008',
    '1986-08-19', 'Male', '55 Water St Apt 20C', 'New York', 'NY', '10041', 'USA',
    'Information Technology', 'Infrastructure Manager', '2019-05-20', 'Full-time', 155000.00,
    'Chase Bank', '****1234', '021000021',
    'Nkechi Okafor', '+1 (718) 555-8008', 'Wife', 'active'),

(1, 'EMP-009', 'Sophia', 'Anderson', 'sophia.anderson@acmecorp.com', '+1 (212) 555-1009',
    '1994-04-05', 'Female', '300 E 46th St Apt 11A', 'New York', 'NY', '10017', 'USA',
    'Sales & Marketing', 'Marketing Manager', '2022-01-17', 'Full-time', 115000.00,
    'Wells Fargo', '****4567', '026012881',
    'Karen Anderson', '+1 (203) 555-8009', 'Mother', 'active'),

(1, 'EMP-010', 'Daniel', 'Lee', 'daniel.lee@acmecorp.com', '+1 (212) 555-1010',
    '1992-10-12', 'Male', '1 Hanover Sq Apt 5B', 'New York', 'NY', '10004', 'USA',
    'Legal & Compliance', 'General Counsel', '2020-09-08', 'Full-time', 195000.00,
    'Citibank', '****8901', '021272655',
    'Grace Lee', '+1 (212) 555-8010', 'Wife', 'active'),

(1, 'EMP-011', 'Rachel', 'Green', 'rachel.green@acmecorp.com', '+1 (212) 555-1011',
    '1998-06-18', 'Female', '200 E 32nd St Apt 14D', 'New York', 'NY', '10016', 'USA',
    'Human Resources', 'HR Coordinator', '2023-08-01', 'Full-time', 65000.00,
    'Chase Bank', '****2346', '021000021',
    'Barbara Green', '+1 (732) 555-8011', 'Mother', 'active'),

(1, 'EMP-012', 'Carlos', 'Mendez', 'carlos.mendez@acmecorp.com', '+1 (212) 555-1012',
    '1988-03-22', 'Male', '45 Wall St Apt 8A', 'New York', 'NY', '10005', 'USA',
    'Finance & Accounting', 'Senior Accountant', '2021-06-14', 'Full-time', 105000.00,
    'Bank of America', '****5679', '026009593',
    'Elena Mendez', '+1 (646) 555-8012', 'Sister', 'active');

-- 2j. LEAVE TYPES
INSERT INTO leave_types (company_id, name, code, default_days, is_paid) VALUES
(1, 'Annual Leave', 'AL', 20, true),
(1, 'Sick Leave', 'SL', 12, true),
(1, 'Casual Leave', 'CL', 5, true),
(1, 'Public Holiday', 'PH', 0, true),
(1, 'Unpaid Leave', 'UL', 0, false);

-- 2k. SALES ORDERS
INSERT INTO sales_orders (company_id, customer_id, order_number, order_date, status, subtotal, tax_total, grand_total, notes, created_by, payment_status, warehouse_id)
VALUES
(1, 1, 'SO-2026-0001', '2026-01-15', 'shipped', 4397.97, 571.74, 4969.71,
    'Bulk laptop order for Q1 office upgrade.', 1, 'paid', 1),
(1, 2, 'SO-2026-0002', '2026-01-20', 'confirmed', 9198.00, 1195.74, 10393.74,
    'Standing desks and chairs for new Seattle HQ.', 1, 'unpaid', 2),
(1, 3, 'SO-2026-0003', '2026-02-01', 'draft', 3629.85, 471.88, 4101.73,
    'Monitor and accessories package.', 1, 'unpaid', 1),
(1, 4, 'SO-2026-0004', '2026-02-05', 'shipped', 5089.92, 661.69, 5751.61,
    'Partial fulfillment of annual hardware contract.', 1, 'paid', 3),
(1, 5, 'SO-2026-0005', '2026-02-12', 'confirmed', 7497.00, 974.61, 8471.61,
    'Office furniture for retail flagship store.', 1, 'unpaid', 4),
(1, 6, 'SO-2026-0006', '2026-02-18', 'invoiced', 2847.00, 370.11, 3217.11,
    'AV equipment for new conference rooms.', 1, 'unpaid', 1),
(1, 7, 'SO-2026-0007', '2026-03-01', 'shipped', 3298.00, 428.74, 3726.74,
    'IT infrastructure gear.', 1, 'paid', 1),
(1, 8, 'SO-2026-0008', '2026-03-10', 'cancelled', 1498.50, 194.81, 1693.31,
    'Cancelled due to budget freeze.', 1, 'unpaid', 2);

-- 2l. SALES ORDER ITEMS
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total)
VALUES
-- SO-0001: 2x Laptop, 1x Monitor, 2x Mouse
(1, 1, 2, 1899.00, 5.00, 3608.10),
(1, 3, 1, 619.99, 0.00, 619.99),
(1, 4, 2, 99.99, 0.00, 199.98),
(1, 5, 1, 199.00, 0.00, 199.00),
-- SO-0002: 3x Chair, 3x Desk, 1x Paper
(2, 8, 3, 1395.00, 0.00, 4185.00),
(2, 9, 3, 799.00, 5.00, 2277.15),
(2, 15, 2, 59.99, 0.00, 119.98),
-- SO-0003
(3, 3, 4, 619.99, 0.00, 2479.96),
(3, 6, 3, 89.99, 0.00, 269.97),
(3, 11, 2, 199.99, 0.00, 399.98),
-- SO-0004
(4, 2, 1, 2499.00, 0.00, 2499.00),
(4, 7, 2, 349.00, 0.00, 698.00),
(4, 10, 3, 179.99, 0.00, 539.97),
-- SO-0005
(5, 8, 4, 1395.00, 0.00, 5580.00),
(5, 9, 2, 799.00, 10.00, 1438.20),
-- SO-0006
(6, 11, 3, 199.99, 0.00, 599.97),
(6, 7, 3, 349.00, 0.00, 1047.00),
(6, 6, 2, 89.99, 0.00, 179.98),
-- SO-0007
(7, 14, 1, 1249.00, 0.00, 1249.00),
(7, 1, 1, 1899.00, 0.00, 1899.00),
-- SO-0008
(8, 3, 2, 619.99, 0.00, 1239.98),
(8, 4, 1, 99.99, 0.00, 99.99);

-- 2m. INVENTORY TRANSACTIONS
INSERT INTO inventory_transactions (company_id, product_id, type, quantity, reference_type, reference_id, warehouse_id, notes)
VALUES
(1, 1, 'out', 2, 'sales_order', 1, 1, 'Shipped to TechFlow Solutions via FedEx Priority'),
(1, 3, 'out', 1, 'sales_order', 1, 1, 'Shipped to TechFlow Solutions'),
(1, 4, 'out', 2, 'sales_order', 1, 1, 'Shipped to TechFlow Solutions'),
(1, 5, 'out', 1, 'sales_order', 1, 1, 'Shipped to TechFlow Solutions'),
(1, 2, 'out', 1, 'sales_order', 4, 3, 'Shipped to Pacific Rim Trading'),
(1, 7, 'out', 2, 'sales_order', 4, 3, 'Shipped to Pacific Rim Trading'),
(1, 10, 'out', 3, 'sales_order', 4, 3, 'Shipped to Pacific Rim Trading'),
(1, 14, 'out', 1, 'sales_order', 7, 1, 'Shipped to Quantum Data Systems'),
(1, 1, 'out', 1, 'sales_order', 7, 1, 'Shipped to Quantum Data Systems'),
(1, 1, 'in', 15, 'purchase_order', 1, 1, 'Restock – received from TechDistrib Inc.'),
(1, 4, 'in', 50, 'purchase_order', 1, 1, 'Restock – received from TechDistrib Inc.'),
(1, 10, 'in', 30, 'purchase_order', 2, 2, 'Restock – received from Pacific Rim Electronics'),
(1, 8, 'in', 5, 'purchase_order', 2, 2, 'Restock – received from National Furniture Mart'),
(1, 3, 'in', 20, 'purchase_order', 3, 1, 'Restock – received from Global Office Systems'),
(1, 15, 'in', 100, 'purchase_order', 3, 1, 'Restock – received from Southland Paper'),
(1, 1, 'adjustment', 1, 'adjustment', NULL, 1, 'Inventory count adjustment – damaged unit removed'),
(1, 8, 'adjustment', -1, 'adjustment', NULL, 2, 'Inventory count correction – overcount found during audit');

-- 2n. PURCHASE ORDERS
INSERT INTO purchase_orders (company_id, supplier_id, po_number, order_date, status, subtotal, tax_total, grand_total, notes, expected_delivery_date, created_by, payment_status, warehouse_id)
VALUES
(1, 1, 'PO-2026-0001', '2026-01-05', 'received', 41500.00, 5395.00, 46895.00,
    'Q1 electronics restock – laptops and accessories.', '2026-01-18', 1, 'paid', 1),
(1, 3, 'PO-2026-0002', '2026-01-10', 'received', 23599.50, 3067.94, 26667.44,
    'Furniture order for new office fit-out.', '2026-01-28', 1, 'paid', 2),
(1, 5, 'PO-2026-0003', '2026-02-01', 'sent', 8598.00, 1117.74, 9715.74,
    'Office supplies & paper products – quarterly order.', '2026-02-20', 1, 'unpaid', 1),
(1, 2, 'PO-2026-0004', '2026-02-15', 'sent', 24598.00, 3197.74, 27795.74,
    'Monitors and peripherals for client projects.', '2026-03-05', 1, 'unpaid', 1),
(1, 6, 'PO-2026-0005', '2026-02-28', 'draft', 14400.00, 1872.00, 16272.00,
    'Microsoft 365 license renewal – 50 seats.', '2026-03-15', 1, 'unpaid', NULL),
(1, 7, 'PO-2026-0006', '2026-03-05', 'sent', 11241.00, 1461.33, 12702.33,
    'Network infrastructure upgrade.', '2026-03-22', 1, 'unpaid', 4);

-- 2o. PURCHASE ORDER ITEMS
INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, received_quantity)
VALUES
-- PO-0001: 15x Laptop, 50x Mouse, 30x USB Hub, 20x Keyboard
(1, 1, 15, 1250.00, 18750.00, 15),
(1, 4, 50, 58.00, 2900.00, 50),
(1, 6, 30, 52.00, 1560.00, 30),
(1, 5, 20, 130.00, 2600.00, 20),
-- PO-0002: 5x Chair, 3x Desk, 10x Paper
(2, 8, 5, 980.00, 4900.00, 5),
(2, 9, 3, 520.00, 1560.00, 3),
-- PO-0003: 50x Paper, 10x Office chair
(3, 15, 50, 38.00, 1900.00, 50),
-- PO-0004: 30x Monitor, 15x Webcam, 20x Headphones
(4, 3, 30, 420.00, 12600.00, 20),
(4, 11, 15, 135.00, 2025.00, 10),
(4, 7, 10, 275.00, 2750.00, 10),
-- PO-0005: 50x M365 license
(5, 12, 50, 180.00, 9000.00, 0),
-- PO-0006: 1x Laptop, 4x Meraki, 10x SSD
(6, 1, 1, 1250.00, 1250.00, 0),
(6, 14, 4, 890.00, 3560.00, 0),
(6, 10, 10, 115.00, 1150.00, 0);

-- 2p. INVOICES
INSERT INTO invoices (company_id, invoice_number, sales_order_id, customer_id, invoice_date, due_date,
    status, subtotal, tax_total, discount_total, grand_total, amount_paid, payment_terms, notes, created_by)
VALUES
(1, 'INV-2026-0001', 1, 1, '2026-01-16', '2026-02-15',
    'paid', 4397.97, 571.74, 0.00, 4969.71, 4969.71,
    'Net 30', 'Invoice for SO-2026-0001 – Paid via wire transfer.', 1),
(1, 'INV-2026-0002', 4, 4, '2026-02-08', '2026-03-10',
    'paid', 5089.92, 661.69, 0.00, 5751.61, 5751.61,
    'Net 30', 'Invoice for SO-2026-0004 – Paid via check.', 1),
(1, 'INV-2026-0003', 7, 7, '2026-03-04', '2026-04-03',
    'paid', 3298.00, 428.74, 0.00, 3726.74, 3726.74,
    'Net 30', 'Invoice for SO-2026-0007 – Paid via ACH.', 1),
(1, 'INV-2026-0004', 2, 2, '2026-01-22', '2026-02-21',
    'sent', 9198.00, 1195.74, 0.00, 10393.74, 0.00,
    'Net 30', 'Invoice for SO-2026-0002 – Awaiting payment.', 1),
(1, 'INV-2026-0005', 3, 3, '2026-02-03', '2026-03-05',
    'draft', 3629.85, 471.88, 0.00, 4101.73, 0.00,
    'Net 30', 'Invoice for SO-2026-0003 – Still in draft.', 1),
(1, 'INV-2026-0006', 6, 6, '2026-02-20', '2026-03-22',
    'sent', 2847.00, 370.11, 0.00, 3217.11, 0.00,
    'Net 30', 'Invoice for SO-2026-0006.', 1);

-- 2q. INVOICE ITEMS
INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total)
VALUES
(1, 1, 'ThinkPad X1 Carbon Gen 11', 2, 1899.00, 5.00, 20.00, 3608.10),
(1, 3, 'Dell UltraSharp U2723QE 27" 4K', 1, 619.99, 0.00, 20.00, 619.99),
(1, 4, 'Logitech MX Master 3S', 2, 99.99, 0.00, 20.00, 199.98),
(1, 5, 'Keychron Q1 Pro Mechanical Keyboard', 1, 199.00, 0.00, 20.00, 199.00),
(2, 2, 'MacBook Pro 16" M3 Pro', 1, 2499.00, 0.00, 20.00, 2499.00),
(2, 7, 'Sony WH-1000XM5 Wireless Headphones', 2, 349.00, 0.00, 20.00, 698.00),
(2, 10, 'Samsung T7 Shield 2TB External SSD', 3, 179.99, 0.00, 20.00, 539.97),
(3, 14, 'Cisco Meraki MX68 Cloud-Managed Firewall', 1, 1249.00, 0.00, 20.00, 1249.00),
(3, 1, 'ThinkPad X1 Carbon Gen 11', 1, 1899.00, 0.00, 20.00, 1899.00),
(4, 8, 'Herman Miller Aeron Chair Size B', 3, 1395.00, 0.00, 20.00, 4185.00),
(4, 9, 'Uplift V2 Standing Desk 72x30"', 3, 799.00, 5.00, 20.00, 2277.15),
(4, 15, 'Staples Copy Paper 8.5x11 Case (10 Reams)', 2, 59.99, 0.00, 8.875, 119.98),
(5, 3, 'Dell UltraSharp U2723QE 27" 4K', 4, 619.99, 0.00, 20.00, 2479.96),
(5, 6, 'Anker PowerExpand 11-in-1 USB-C Hub', 3, 89.99, 0.00, 20.00, 269.97),
(5, 11, 'Logitech Brio 4K Webcam', 2, 199.99, 0.00, 20.00, 399.98),
(6, 11, 'Logitech Brio 4K Webcam', 3, 199.99, 0.00, 20.00, 599.97),
(6, 7, 'Sony WH-1000XM5 Wireless Headphones', 3, 349.00, 0.00, 20.00, 1047.00),
(6, 6, 'Anker PowerExpand 11-in-1 USB-C Hub', 2, 89.99, 0.00, 20.00, 179.98);

-- 2r. PAYMENTS
INSERT INTO payments (company_id, invoice_id, payment_number, payment_date, amount, payment_method, reference_number, notes, created_by)
VALUES
(1, 1, 'PAY-2026-0001', '2026-01-28', 4969.71, 'Wire Transfer', 'WIRE-2026-028', 'Payment received from TechFlow Solutions – SO-2026-0001.', 1),
(1, 2, 'PAY-2026-0002', '2026-03-01', 5751.61, 'Check', 'CHK-10423', 'Check received from Pacific Rim Trading Co.', 1),
(1, 3, 'PAY-2026-0003', '2026-03-28', 3726.74, 'ACH', 'ACH-2026-112', 'ACH payment from Quantum Data Systems.', 1);

-- 2s. JOURNAL ENTRIES
INSERT INTO journal_entries (company_id, entry_date, description, reference_type, reference_id,
    voucher_no, voucher_type, total_debit, total_credit, status, created_by)
VALUES
(1, '2026-01-28', 'Payment received – INV-2026-0001 TechFlow Solutions', 'payment', 1,
    'JV-2026-0001', 'Receipt', 4969.71, 4969.71, 'approved', 1),
(1, '2026-03-01', 'Payment received – INV-2026-0002 Pacific Rim Trading', 'payment', 2,
    'JV-2026-0002', 'Receipt', 5751.61, 5751.61, 'approved', 1),
(1, '2026-03-28', 'Payment received – INV-2026-0003 Quantum Data Systems', 'payment', 3,
    'JV-2026-0003', 'Receipt', 3726.74, 3726.74, 'approved', 1),
(1, '2026-02-28', 'Monthly depreciation – February 2026', 'depreciation', NULL,
    'JV-2026-0004', 'Journal', 15800.00, 15800.00, 'approved', 1),
(1, '2026-01-31', 'Payroll accrual – January 2026', 'payroll', NULL,
    'JV-2026-0005', 'Journal', 175000.00, 175000.00, 'approved', 1);

-- 2t. JOURNAL ENTRY LINES
INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration)
VALUES
-- JV-0001: Payment received (Debit Cash, Credit AR)
(1, 3, 4969.71, 0, 'Chase Operating Account – TechFlow payment'),
(1, 5, 0, 4969.71, 'Accounts Receivable – INV-2026-0001'),
-- JV-0002
(2, 3, 5751.61, 0, 'Chase Operating Account – Pacific Rim payment'),
(2, 5, 0, 5751.61, 'Accounts Receivable – INV-2026-0002'),
-- JV-0003
(3, 3, 3726.74, 0, 'Chase Operating Account – Quantum Data payment'),
(3, 5, 0, 3726.74, 'Accounts Receivable – INV-2026-0003'),
-- JV-0004: Monthly depreciation
(4, 38, 15800.00, 0, 'Depreciation expense – all asset categories'),
(4, 13, 0, 15800.00, 'Accumulated depreciation – all asset categories'),
-- JV-0005: Payroll accrual
(5, 33, 175000.00, 0, 'Salaries & wages – January 2026 payroll'),
(5, 16, 0, 175000.00, 'Accrued payroll – January 2026');

-- 2u. LEAVE REQUESTS
INSERT INTO leave_requests (company_id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status, created_by)
VALUES
(1, 1, 1, '2026-03-15', '2026-03-19', 5, 'Annual family vacation to Japan.', 'approved', 1),
(1, 2, 2, '2026-02-10', '2026-02-11', 2, 'Medical appointment and recovery.', 'approved', 1),
(1, 3, 1, '2026-04-10', '2026-04-14', 5, 'Spring break travel.', 'pending', 1),
(1, 5, 3, '2026-03-05', '2026-03-05', 1, 'Personal errand.', 'approved', 1),
(1, 9, 2, '2026-01-22', '2026-01-23', 2, 'Sick leave – flu symptoms.', 'approved', 1);

-- 2v. FIXED ASSETS
INSERT INTO asset_categories (company_id, code, name, default_depreciation_method, default_useful_life, is_active) VALUES
(1, 'BLDG', 'Buildings & Improvements', 'straight_line', 30, true),
(1, 'CE', 'Computer Equipment', 'straight_line', 5, true),
(1, 'FF', 'Furniture & Fixtures', 'straight_line', 7, true),
(1, 'VEH', 'Vehicles', 'straight_line', 5, true),
(1, 'MACH', 'Machinery & Equipment', 'straight_line', 10, true);

INSERT INTO fixed_assets (company_id, asset_code, name, category_id, description,
    purchase_date, purchase_cost, current_value, salvage_value, useful_life,
    depreciation_method, accumulated_depreciation, depreciation_per_period,
    location, status, notes, created_by)
VALUES
(1, 'ASSET-001', 'Headquarters Office Building', 1,
    '12-story commercial office building at 350 Fifth Avenue, New York, NY.',
    '2020-01-15', 8500000.00, 7369444.44, 500000.00, 360,
    'straight_line', 1130555.56, 22222.22,
    '350 Fifth Avenue, New York, NY 10118', 'active',
    'Monthly depreciation: $22,222.22. Acquired Jan 2020.', 1),

(1, 'ASSET-002', 'Primary Domain Controller & Server Rack', 2,
    'Dell PowerEdge R750xs server cluster with 48TB SAN storage.',
    '2023-06-01', 125000.00, 98750.00, 5000.00, 60,
    'straight_line', 26250.00, 2000.00,
    '350 Fifth Avenue, NY – Server Room B1', 'active',
    'Monthly depreciation: $2,000.00. Commissioned June 2023.', 1),

(1, 'ASSET-003', 'Company Fleet – 3x Toyota RAV4 Hybrid', 4,
    'Three 2023 Toyota RAV4 Hybrid XSE for executive and sales team use.',
    '2023-03-15', 108000.00, 73800.00, 18000.00, 60,
    'straight_line', 34200.00, 1500.00,
    'Company parking garage – 350 Fifth Avenue', 'active',
    'Monthly depreciation: $1,500.00 per vehicle ($500 each). Plates: ACM-1001 to ACM-1003.', 1),

(1, 'ASSET-004', 'Office Furniture & Workstations', 3,
    'Open-plan workstations, executive desks, and conference room furniture for 60 employees.',
    '2022-09-01', 245000.00, 155416.67, 15000.00, 84,
    'straight_line', 89583.33, 2738.10,
    'Floors 8-10, 350 Fifth Avenue, NY', 'active',
    'Monthly depreciation: $2,738.10. Installed Sep 2022.', 1),

(1, 'ASSET-005', 'Production Assembly Line Equipment', 5,
    'Automated SMT assembly line for electronics prototyping and small-batch production.',
    '2024-01-10', 520000.00, 468000.00, 20000.00, 120,
    'straight_line', 52000.00, 4166.67,
    '1410 Manufacturing Row, Newark, NJ', 'active',
    'Monthly depreciation: $4,166.67. Operational Jan 2024.', 1);

-- 2w. ASSET DEPRECIATION (sample entries)
INSERT INTO asset_depreciation (company_id, asset_id, period_date, amount, running_balance)
VALUES
(1, 1, '2026-01-31', 22222.22, 1130555.56),
(1, 2, '2026-01-31', 2000.00, 26250.00),
(1, 3, '2026-01-31', 1500.00, 34200.00),
(1, 4, '2026-01-31', 2738.10, 89583.33),
(1, 5, '2026-01-31', 4166.67, 52000.00),
(1, 1, '2026-02-28', 22222.22, 1152777.78),
(1, 2, '2026-02-28', 2000.00, 28250.00),
(1, 3, '2026-02-28', 1500.00, 35700.00),
(1, 4, '2026-02-28', 2738.10, 91500.00),
(1, 5, '2026-02-28', 4166.67, 56166.67);

-- 2x. PROJECTS
INSERT INTO projects (company_id, project_code, name, description, customer_id,
    start_date, end_date, budget_amount, status, priority, project_manager, notes, created_by)
VALUES
(1, 'PRJ-2026-001', 'TechFlow Q1 Office IT Upgrade', 'Full office IT infrastructure refresh including laptops, monitors, and network equipment for TechFlow Solutions.',
    1, '2026-01-10', '2026-03-31', 75000.00, 'in_progress', 'high', 1,
    'Scope includes 25 laptops, 30 monitors, server upgrade. Project lead: Sarah Chen.', 1),
(1, 'PRJ-2026-002', 'GreenLeaf HQ Relocation', 'Relocation and fit-out of GreenLeaf Enterprises new Seattle headquarters. Furniture, AV, and networking.',
    2, '2026-01-20', '2026-05-30', 250000.00, 'planning', 'high', 1,
    'New space at 701 5th Ave. Coordination with interior design firm.', 1),
(1, 'PRJ-2026-003', 'Internal ERP Upgrade v3.0', 'Upgrade core ERP platform to version 3.0 with new accounting module and enhanced reporting.',
    NULL, '2026-02-01', '2026-07-31', 180000.00, 'planning', 'medium', 1,
    'Internal IT project. Cross-functional team.', 1);

-- 2y. RETURN REASONS
INSERT INTO return_reasons (company_id, reason_code, reason_name, category) VALUES
(1, 'DEFECTIVE', 'Defective/Damaged Product', 'both'),
(1, 'WRONG_ITEM', 'Wrong Item Shipped', 'both'),
(1, 'CUSTOMER_REQUEST', 'Customer Request/Change of Mind', 'sales'),
(1, 'QUALITY_ISSUE', 'Quality Issue', 'purchase'),
(1, 'EXPIRED', 'Product Expired', 'both'),
(1, 'DAMAGED', 'Damaged During Transit', 'both');

-- 2z. CRM – LEAD SOURCES & STATUSES
INSERT INTO lead_sources (company_id, name) VALUES
(1, 'Website'), (1, 'Referral'), (1, 'Phone Inquiry'),
(1, 'Email Campaign'), (1, 'Social Media'), (1, 'Walk-in'),
(1, 'Trade Show'), (1, 'Other');

INSERT INTO lead_statuses (company_id, name, sort_order, color) VALUES
(1, 'New', 1, '#3b82f6'),
(1, 'Contacted', 2, '#8b5cf6'),
(1, 'Qualified', 3, '#f59e0b'),
(1, 'Proposal', 4, '#ec4899'),
(1, 'Negotiation', 5, '#f97316'),
(1, 'Won', 6, '#10b981'),
(1, 'Lost', 7, '#ef4444');

-- 2aa. CRM LEADS
INSERT INTO leads (company_id, first_name, last_name, email, phone, company, designation,
    source_id, status_id, assigned_to, city, state, notes, created_by)
VALUES
(1, 'Marcus', 'Williams', 'marcus@nexusinnovate.io', '+1 (415) 555-2001',
    'Nexus Innovate Inc.', 'VP of Engineering', 1, 3, 1, 'San Francisco', 'CA',
    'Interested in bulk laptop order for 2026Q2. Qualifying lead.', 1),
(1, 'Angela', 'Petrova', 'angela@brightsolar.com', '+1 (512) 555-2002',
    'Bright Solar Energy', 'Procurement Manager', 4, 1, 3, 'Austin', 'TX',
    'Downloaded whitepaper on sustainable office equipment. Cold lead.', 1),
(1, 'Kenji', 'Nakamura', 'kenji@tokyotech.jp', '+81 3-5555-2003',
    'Tokyo Tech Solutions KK', 'Director of IT', 7, 2, 1, 'Tokyo', 'Japan',
    'Met at CES 2026. Interested in Meraki firewalls and laptops.', 1);

-- 2ab. SYSTEM SETTINGS
INSERT INTO system_settings (company_id, setting_key, setting_value, setting_type, category) VALUES
(1, 'company_name', 'Acme Corporation', 'string', 'general'),
(1, 'company_logo', '', 'image', 'general'),
(1, 'company_address', 'One Acme Plaza, 350 Fifth Avenue, New York, NY 10118', 'string', 'general'),
(1, 'company_phone', '+1 (212) 555-0198', 'string', 'general'),
(1, 'company_email', 'corporate@acmecorp.com', 'string', 'general'),
(1, 'company_tax_id', 'US45-6789123', 'string', 'general'),
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
(1, 'company_favicon', '', 'image', 'general');

-- 2ac. EMAIL TEMPLATES
INSERT INTO email_templates (company_id, template_code, subject, body, variables) VALUES
(1, 'welcome_email', 'Welcome to {company_name}', '<h1>Welcome {user_name}!</h1><p>Your account has been created.</p>', '["user_name","company_name","login_link"]'),
(1, 'order_confirmation', 'Order Confirmation - {order_number}', '<h1>Thank you for your order!</h1><p>Order #{order_number} has been confirmed.</p>', '["order_number","customer_name","order_date","total_amount"]'),
(1, 'leave_approval', 'Leave Request Approved', '<p>Dear {employee_name}, your leave request from {start_date} to {end_date} has been approved.</p>', '["employee_name","start_date","end_date","leave_type"]');

-- ====================================================================
-- PHASE 3: ROW COUNTS PER TABLE (confirmation)
-- ====================================================================

SELECT 'companies' AS table_name, COUNT(*) AS row_count FROM companies
UNION ALL SELECT 'tax_rates', COUNT(*) FROM tax_rates
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL SELECT 'customers', COUNT(*) FROM customers
UNION ALL SELECT 'warehouses', COUNT(*) FROM warehouses
UNION ALL SELECT 'product_warehouse_stock', COUNT(*) FROM product_warehouse_stock
UNION ALL SELECT 'chart_of_accounts', COUNT(*) FROM chart_of_accounts
UNION ALL SELECT 'employees', COUNT(*) FROM employees
UNION ALL SELECT 'leave_types', COUNT(*) FROM leave_types
UNION ALL SELECT 'leave_requests', COUNT(*) FROM leave_requests
UNION ALL SELECT 'sales_orders', COUNT(*) FROM sales_orders
UNION ALL SELECT 'sales_order_items', COUNT(*) FROM sales_order_items
UNION ALL SELECT 'purchase_orders', COUNT(*) FROM purchase_orders
UNION ALL SELECT 'purchase_order_items', COUNT(*) FROM purchase_order_items
UNION ALL SELECT 'inventory_transactions', COUNT(*) FROM inventory_transactions
UNION ALL SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL SELECT 'invoice_items', COUNT(*) FROM invoice_items
UNION ALL SELECT 'payments', COUNT(*) FROM payments
UNION ALL SELECT 'journal_entries', COUNT(*) FROM journal_entries
UNION ALL SELECT 'journal_entry_lines', COUNT(*) FROM journal_entry_lines
UNION ALL SELECT 'fixed_assets', COUNT(*) FROM fixed_assets
UNION ALL SELECT 'asset_categories', COUNT(*) FROM asset_categories
UNION ALL SELECT 'asset_depreciation', COUNT(*) FROM asset_depreciation
UNION ALL SELECT 'projects', COUNT(*) FROM projects
UNION ALL SELECT 'return_reasons', COUNT(*) FROM return_reasons
UNION ALL SELECT 'lead_sources', COUNT(*) FROM lead_sources
UNION ALL SELECT 'lead_statuses', COUNT(*) FROM lead_statuses
UNION ALL SELECT 'leads', COUNT(*) FROM leads
UNION ALL SELECT 'system_settings', COUNT(*) FROM system_settings
UNION ALL SELECT 'email_templates', COUNT(*) FROM email_templates
ORDER BY table_name;

COMMIT;
