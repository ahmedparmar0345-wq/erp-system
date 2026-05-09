-- ==========================================
-- USERS TABLE (Core authentication table)
-- Must be created before all other modules
-- ==========================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    avatar TEXT,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default admin user (password: admin123)
INSERT INTO users (company_id, email, password_hash, name, role)
VALUES (
    1,
    'admin@erp.com',
    '$2b$10$XFSA3oyWGnnw6DAQZlCqV.u6KMq8esIAB1GEm8747a5ve1uXCnT46',
    'Admin User',
    'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Insert more sample users
INSERT INTO users (company_id, email, password_hash, name, role)
VALUES
    (1, 'john@erp.com', '$2b$10$EWB.9HUGO6UlQFXGPlNLkuNHd62srZLTyfXabnVD7YXdvxgiWjgym', 'John Manager', 'manager'),
    (1, 'jane@erp.com', '$2b$10$ckD6a/lYCXXTxNGnzF8pruTXk8Am87CoALtWOPcyY1TtR9RTk3z1K', 'Jane Accountant', 'accountant'),
    (1, 'bob@erp.com', '$2b$10$O2vJJvMUPFD3nOlYT.Qvp.mUvNYztHfdYvqtkN2DxVy8rHr3bXmtm', 'Bob Employee', 'employee')
ON CONFLICT (email) DO NOTHING;
