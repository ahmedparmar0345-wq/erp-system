-- System settings table (key-value store)
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string',
    category VARCHAR(100),
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, setting_key)
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (company_id, name, description, is_system, permissions) VALUES
(1, 'Super Admin', 'Full system access', true, '["*"]'),
(1, 'Admin', 'Administrative access', true, '["dashboard","customers","products","sales","purchases","expenses","accounting","vouchers","reports","hr","returns","settings.read"]'),
(1, 'Manager', 'Management access', true, '["dashboard","customers.read","products.read","sales","purchases","expenses.read","reports.read","hr.read"]'),
(1, 'Accountant', 'Accounting access', true, '["dashboard","accounting","vouchers","reports.financial","expenses"]'),
(1, 'Employee', 'Basic access', true, '["dashboard","hr.self","attendance.self","leaves.self"]')
ON CONFLICT DO NOTHING;

-- Users table updates
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id INTEGER REFERENCES roles(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing users to have Super Admin role
UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'Super Admin' AND company_id = 1) WHERE email = 'admin@erp.com';

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    template_code VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, template_code)
);

-- Insert default email templates
INSERT INTO email_templates (company_id, template_code, subject, body, variables) VALUES
(1, 'welcome_email', 'Welcome to {company_name}', '<h1>Welcome {user_name}!</h1><p>Your account has been created.</p>', '["user_name","company_name","login_link"]'),
(1, 'order_confirmation', 'Order Confirmation - {order_number}', '<h1>Thank you for your order!</h1><p>Order #{order_number} has been confirmed.</p>', '["order_number","customer_name","order_date","total_amount"]'),
(1, 'leave_approval', 'Leave Request Approved', '<p>Dear {employee_name}, your leave request from {start_date} to {end_date} has been approved.</p>', '["employee_name","start_date","end_date","leave_type"]')
ON CONFLICT DO NOTHING;

-- Default system settings
INSERT INTO system_settings (company_id, setting_key, setting_value, setting_type, category) VALUES
(1, 'company_name', 'ERP System', 'string', 'general'),
(1, 'company_logo', '', 'image', 'general'),
(1, 'company_address', '123 Business Street, City, Country', 'string', 'general'),
(1, 'company_phone', '+1 234 567 8900', 'string', 'general'),
(1, 'company_email', 'info@erpsystem.com', 'string', 'general'),
(1, 'company_tax_id', 'TAX123456789', 'string', 'general'),
(1, 'currency_symbol', '$', 'string', 'currency'),
(1, 'currency_code', 'USD', 'string', 'currency'),
(1, 'currency_position', 'before', 'string', 'currency'),
(1, 'decimal_places', '2', 'number', 'currency'),
(1, 'thousand_separator', ',', 'string', 'currency'),
(1, 'date_format', 'YYYY-MM-DD', 'string', 'general'),
(1, 'timezone', 'UTC', 'string', 'general'),
(1, 'primary_color', '#3b82f6', 'string', 'appearance'),
(1, 'sidebar_color', '#1e293b', 'string', 'appearance'),
(1, 'theme', 'light', 'string', 'appearance'),
(1, 'maintenance_mode', 'false', 'boolean', 'system'),
(1, 'company_favicon', '', 'image', 'general')
ON CONFLICT (company_id, setting_key) DO NOTHING;