-- ==================================================
-- ERP Database Complete Initialization Script
-- Run this file to set up the entire database
-- ==================================================
-- Usage: psql -U postgres -d your_db_name -f init.sql

-- 1. Core schema (companies, customers, products, etc.)
\i erp_schema.sql

-- 2. Users table (must come after companies)
\i users-schema.sql

-- 3. Settings & Roles (roles reference companies)
\i settings-schema.sql

-- 4. Remaining modules
\i hr-schema.sql
\i pos-schema.sql
\i crm-schema.sql
\i warehouse-schema.sql
\i returns-schema.sql
\i reports-schema.sql
\i accounting-reports-schema.sql
\i accounting-enhancement-schema.sql
\i remaining-modules-schema.sql

-- 5. Updates and migrations
\i updates.sql
\i accounting-reports.sql

-- 6. Quotation module
\i quotation-schema.sql

-- 7. Update default role assignment for admin user
UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'Super Admin' AND company_id = 1) WHERE email = 'admin@erp.com';
UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'Manager' AND company_id = 1) WHERE email = 'john@erp.com';
UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'Accountant' AND company_id = 1) WHERE email = 'jane@erp.com';
UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'Employee' AND company_id = 1) WHERE email = 'bob@erp.com';
