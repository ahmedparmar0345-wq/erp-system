-- ==========================================
-- INVOICING, FIXED ASSETS, PROJECTS, APPROVAL WORKFLOWS
-- ==========================================

-- ==================== 1. INVOICING ====================
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    sales_order_id INTEGER REFERENCES sales_orders(id),
    customer_id INTEGER REFERENCES customers(id),
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    subtotal DECIMAL(15,2) DEFAULT 0,
    tax_total DECIMAL(15,2) DEFAULT 0,
    discount_total DECIMAL(15,2) DEFAULT 0,
    grand_total DECIMAL(15,2) DEFAULT 0,
    amount_paid DECIMAL(15,2) DEFAULT 0,
    balance_due DECIMAL(15,2) GENERATED ALWAYS AS (grand_total - amount_paid) STORED,
    payment_terms VARCHAR(100),
    notes TEXT,
    terms_conditions TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    description TEXT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    tax_percent DECIMAL(5,2) DEFAULT 0,
    total DECIMAL(15,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    invoice_id INTEGER REFERENCES invoices(id),
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 2. FIXED ASSETS ====================
CREATE TABLE IF NOT EXISTS asset_categories (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    default_depreciation_method VARCHAR(20) DEFAULT 'straight_line',
    default_useful_life INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS fixed_assets (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    asset_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES asset_categories(id),
    description TEXT,
    purchase_date DATE NOT NULL,
    purchase_cost DECIMAL(15,2) NOT NULL,
    current_value DECIMAL(15,2) NOT NULL,
    salvage_value DECIMAL(15,2) DEFAULT 0,
    useful_life INTEGER NOT NULL,
    depreciation_method VARCHAR(20) DEFAULT 'straight_line',
    accumulated_depreciation DECIMAL(15,2) DEFAULT 0,
    depreciation_per_period DECIMAL(15,2) DEFAULT 0,
    location VARCHAR(255),
    assigned_to INTEGER REFERENCES users(id),
    supplier_id INTEGER REFERENCES suppliers(id),
    warranty_expiry DATE,
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS asset_depreciation (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    asset_id INTEGER REFERENCES fixed_assets(id) ON DELETE CASCADE,
    period_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    running_balance DECIMAL(15,2) NOT NULL,
    journal_entry_id INTEGER REFERENCES journal_entries(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS asset_maintenance (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    asset_id INTEGER REFERENCES fixed_assets(id) ON DELETE CASCADE,
    maintenance_date DATE NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    cost DECIMAL(15,2) DEFAULT 0,
    performed_by VARCHAR(255),
    next_maintenance_date DATE,
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 3. PROJECT MANAGEMENT ====================
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    project_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    customer_id INTEGER REFERENCES customers(id),
    start_date DATE,
    end_date DATE,
    budget_amount DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'planning',
    priority VARCHAR(20) DEFAULT 'medium',
    project_manager INTEGER REFERENCES users(id),
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_tasks (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    parent_task_id INTEGER REFERENCES project_tasks(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to INTEGER REFERENCES users(id),
    start_date DATE,
    due_date DATE,
    completed_date DATE,
    estimated_hours DECIMAL(8,2) DEFAULT 0,
    actual_hours DECIMAL(8,2) DEFAULT 0,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'todo',
    sort_order INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_members (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    role VARCHAR(50) DEFAULT 'member',
    hourly_rate DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

CREATE TABLE IF NOT EXISTS time_entries (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    project_id INTEGER REFERENCES projects(id),
    task_id INTEGER REFERENCES project_tasks(id),
    user_id INTEGER REFERENCES users(id),
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    hours DECIMAL(8,2) NOT NULL,
    description TEXT,
    billable BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 4. APPROVAL WORKFLOWS ====================
CREATE TABLE IF NOT EXISTS approval_workflows (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_entity VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS approval_steps (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER REFERENCES approval_workflows(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    approver_id INTEGER REFERENCES users(id),
    approver_role_id INTEGER REFERENCES roles(id),
    min_amount DECIMAL(15,2),
    max_amount DECIMAL(15,2),
    requires_all BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workflow_id, step_order)
);

CREATE TABLE IF NOT EXISTS approval_requests (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    workflow_id INTEGER REFERENCES approval_workflows(id),
    target_entity VARCHAR(100) NOT NULL,
    target_id INTEGER NOT NULL,
    requester_id INTEGER REFERENCES users(id),
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER DEFAULT 1,
    amount DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS approval_logs (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES approval_requests(id) ON DELETE CASCADE,
    step_id INTEGER REFERENCES approval_steps(id),
    approver_id INTEGER REFERENCES users(id),
    action VARCHAR(20) NOT NULL,
    comment TEXT,
    acted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
