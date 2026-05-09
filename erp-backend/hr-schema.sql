-- ==========================================
-- HR / EMPLOYEES MODULE
-- ==========================================

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    date_of_birth DATE,
    gender VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    
    -- Employment details
    department VARCHAR(100),
    position VARCHAR(100),
    hire_date DATE NOT NULL,
    employment_type VARCHAR(50) DEFAULT 'Full-time',
    salary DECIMAL(15,2),
    bank_name VARCHAR(255),
    bank_account_no VARCHAR(100),
    bank_routing_no VARCHAR(50),
    
    -- Emergency contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_relation VARCHAR(100),
    
    -- Documents (JSON array of documents)
    documents JSONB DEFAULT '[]',
    
    -- Status
    status VARCHAR(20) DEFAULT 'active',
    termination_date DATE,
    termination_reason TEXT,
    
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    employee_id INTEGER REFERENCES employees(id),
    date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    status VARCHAR(20) DEFAULT 'present',
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, date)
);

-- Leave types table
CREATE TABLE IF NOT EXISTS leave_types (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    default_days INTEGER DEFAULT 0,
    is_paid BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default leave types
INSERT INTO leave_types (company_id, name, code, default_days, is_paid) VALUES
(1, 'Annual Leave', 'AL', 20, true),
(1, 'Sick Leave', 'SL', 12, true),
(1, 'Casual Leave', 'CL', 5, true),
(1, 'Public Holiday', 'PH', 0, true),
(1, 'Unpaid Leave', 'UL', 0, false)
ON CONFLICT DO NOTHING;

-- Leave requests table
CREATE TABLE IF NOT EXISTS leave_requests (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    employee_id INTEGER REFERENCES employees(id),
    leave_type_id INTEGER REFERENCES leave_types(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee documents table
CREATE TABLE IF NOT EXISTS employee_documents (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    employee_id INTEGER REFERENCES employees(id),
    document_type VARCHAR(50) NOT NULL,
    document_name VARCHAR(255),
    file_path VARCHAR(500),
    file_size INTEGER,
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);