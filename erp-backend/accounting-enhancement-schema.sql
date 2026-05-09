-- ==========================================
-- ACCOUNTING ENHANCEMENTS
-- Cost Centers, Budgets, Bank Reconciliation, Recurring Entries
-- ==========================================

-- 1. COST CENTERS
CREATE TABLE IF NOT EXISTS cost_centers (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, code)
);

ALTER TABLE journal_entry_lines ADD COLUMN IF NOT EXISTS cost_center_id INTEGER REFERENCES cost_centers(id);

-- 2. BUDGETS
CREATE TABLE IF NOT EXISTS budgets (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    fiscal_year INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS budget_items (
    id SERIAL PRIMARY KEY,
    budget_id INTEGER REFERENCES budgets(id) ON DELETE CASCADE,
    account_id INTEGER REFERENCES chart_of_accounts(id),
    cost_center_id INTEGER REFERENCES cost_centers(id),
    jan DECIMAL(15,2) DEFAULT 0,
    feb DECIMAL(15,2) DEFAULT 0,
    mar DECIMAL(15,2) DEFAULT 0,
    apr DECIMAL(15,2) DEFAULT 0,
    may DECIMAL(15,2) DEFAULT 0,
    jun DECIMAL(15,2) DEFAULT 0,
    jul DECIMAL(15,2) DEFAULT 0,
    aug DECIMAL(15,2) DEFAULT 0,
    sep DECIMAL(15,2) DEFAULT 0,
    oct DECIMAL(15,2) DEFAULT 0,
    nov DECIMAL(15,2) DEFAULT 0,
    dec DECIMAL(15,2) DEFAULT 0,
    annual_total DECIMAL(15,2) GENERATED ALWAYS AS (jan+feb+mar+apr+may+jun+jul+aug+sep+oct+nov+dec) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. BANK RECONCILIATION
CREATE TABLE IF NOT EXISTS bank_accounts (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    account_id INTEGER REFERENCES chart_of_accounts(id),
    bank_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100),
    account_name VARCHAR(255),
    opening_balance DECIMAL(15,2) DEFAULT 0,
    as_of_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bank_transactions (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    bank_account_id INTEGER REFERENCES bank_accounts(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    description TEXT,
    reference_number VARCHAR(100),
    check_number VARCHAR(50),
    debit DECIMAL(15,2) DEFAULT 0,
    credit DECIMAL(15,2) DEFAULT 0,
    balance DECIMAL(15,2) DEFAULT 0,
    is_cleared BOOLEAN DEFAULT false,
    matched_journal_entry_id INTEGER REFERENCES journal_entries(id),
    matched_at TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reconciliation_reports (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    bank_account_id INTEGER REFERENCES bank_accounts(id),
    statement_date DATE NOT NULL,
    statement_balance DECIMAL(15,2) NOT NULL,
    book_balance DECIMAL(15,2) NOT NULL,
    uncleared_deposits DECIMAL(15,2) DEFAULT 0,
    uncleared_checks DECIMAL(15,2) DEFAULT 0,
    difference DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'in_progress',
    notes TEXT,
    reconciled_by INTEGER REFERENCES users(id),
    reconciled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. RECURRING JOURNAL ENTRIES
CREATE TABLE IF NOT EXISTS recurring_entries (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    voucher_type VARCHAR(50) DEFAULT 'Journal',
    frequency VARCHAR(50) NOT NULL,
    interval_value INTEGER DEFAULT 1,
    start_date DATE NOT NULL,
    end_date DATE,
    next_date DATE,
    last_generated DATE,
    day_of_month INTEGER,
    day_of_week INTEGER,
    total_occurrences INTEGER,
    occurrences_generated INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recurring_entry_lines (
    id SERIAL PRIMARY KEY,
    recurring_entry_id INTEGER REFERENCES recurring_entries(id) ON DELETE CASCADE,
    account_id INTEGER REFERENCES chart_of_accounts(id),
    cost_center_id INTEGER REFERENCES cost_centers(id),
    debit DECIMAL(15,2) DEFAULT 0,
    credit DECIMAL(15,2) DEFAULT 0,
    narration TEXT
);
