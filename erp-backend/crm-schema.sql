-- ==========================================
-- CRM MODULE
-- ==========================================

-- Lead sources
CREATE TABLE IF NOT EXISTS lead_sources (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO lead_sources (company_id, name) VALUES
(1, 'Website'), (1, 'Referral'), (1, 'Phone Inquiry'),
(1, 'Email Campaign'), (1, 'Social Media'), (1, 'Walk-in'),
(1, 'Trade Show'), (1, 'Other')
ON CONFLICT DO NOTHING;

-- Lead statuses
CREATE TABLE IF NOT EXISTS lead_statuses (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    name VARCHAR(100) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    color VARCHAR(20) DEFAULT '#6b7280',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO lead_statuses (company_id, name, sort_order, color) VALUES
(1, 'New', 1, '#3b82f6'),
(1, 'Contacted', 2, '#8b5cf6'),
(1, 'Qualified', 3, '#f59e0b'),
(1, 'Proposal', 4, '#ec4899'),
(1, 'Negotiation', 5, '#f97316'),
(1, 'Won', 6, '#10b981'),
(1, 'Lost', 7, '#ef4444')
ON CONFLICT DO NOTHING;

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    salutation VARCHAR(20),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    company VARCHAR(255),
    designation VARCHAR(100),
    website VARCHAR(255),
    source_id INTEGER REFERENCES lead_sources(id),
    status_id INTEGER REFERENCES lead_statuses(id),
    assigned_to INTEGER REFERENCES users(id),
    email_opt_out BOOLEAN DEFAULT false,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    notes TEXT,
    converted_customer_id INTEGER REFERENCES customers(id),
    converted_at TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Opportunities / Deals pipeline
CREATE TABLE IF NOT EXISTS opportunities (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    lead_id INTEGER REFERENCES leads(id),
    customer_id INTEGER REFERENCES customers(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    expected_revenue DECIMAL(15,2) DEFAULT 0,
    probability INTEGER DEFAULT 0,
    expected_close_date DATE,
    stage VARCHAR(50) DEFAULT 'qualification',
    priority VARCHAR(20) DEFAULT 'medium',
    assigned_to INTEGER REFERENCES users(id),
    notes TEXT,
    lost_reason TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Follow-ups / tasks
CREATE TABLE IF NOT EXISTS follow_ups (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    lead_id INTEGER REFERENCES leads(id),
    opportunity_id INTEGER REFERENCES opportunities(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    due_time TIME,
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    assigned_to INTEGER REFERENCES users(id),
    completed_at TIMESTAMP,
    completed_by INTEGER REFERENCES users(id),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact / Interaction history
CREATE TABLE IF NOT EXISTS interactions (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    lead_id INTEGER REFERENCES leads(id),
    customer_id INTEGER REFERENCES customers(id),
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    notes TEXT,
    outcome TEXT,
    performed_by INTEGER REFERENCES users(id),
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email templates for CRM
CREATE TABLE IF NOT EXISTS crm_email_templates (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
