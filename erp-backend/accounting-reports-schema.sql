-- Accounting Reports Schema Migration
-- Run this once before using the accounting reports endpoints.
-- All statements are idempotent (IF NOT EXISTS / IF NOT).

-- ========== 1. CHART OF ACCOUNTS ENHANCEMENTS ==========

-- Rename old ENUM column 'type' to 'account_type' if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='chart_of_accounts' AND column_name='type'
  ) THEN
    ALTER TABLE chart_of_accounts RENAME COLUMN "type" TO account_type;
  END IF;
END $$;

-- Convert account_type to VARCHAR (drops the ENUM constraint)
ALTER TABLE chart_of_accounts ALTER COLUMN account_type TYPE VARCHAR(50);

-- Additional chart_of_accounts columns
ALTER TABLE chart_of_accounts ADD COLUMN IF NOT EXISTS parent_account_id INT REFERENCES chart_of_accounts(id);
ALTER TABLE chart_of_accounts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE chart_of_accounts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ========== 2. JOURNAL ENTRIES ENHANCEMENTS ==========

ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS voucher_no VARCHAR(50);
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS voucher_type VARCHAR(50);
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS total_debit DECIMAL(15,2) DEFAULT 0;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS total_credit DECIMAL(15,2) DEFAULT 0;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft';
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS created_by INT REFERENCES users(id);
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS approved_by INT REFERENCES users(id);
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS signature TEXT;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS reference_type VARCHAR(50);
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS reference_id INTEGER;

-- ========== 3. JOURNAL ENTRY LINES ==========

CREATE TABLE IF NOT EXISTS journal_entry_lines (
    id SERIAL PRIMARY KEY,
    journal_entry_id INT REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id INT REFERENCES chart_of_accounts(id),
    debit DECIMAL(15,2) DEFAULT 0,
    credit DECIMAL(15,2) DEFAULT 0,
    narration TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== 4. SALES ORDERS ENHANCEMENTS ==========

ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS created_by INT REFERENCES users(id);
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid';

-- ========== 5. PURCHASE ORDERS ENHANCEMENTS ==========

ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(15,2) DEFAULT 0;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS tax_total DECIMAL(15,2) DEFAULT 0;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS grand_total DECIMAL(15,2) DEFAULT 0;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS expected_delivery_date DATE;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS created_by INT REFERENCES users(id);
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid';
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- ========== 6. EXPENSE TABLES ==========

CREATE TABLE IF NOT EXISTS expense_categories (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(255),
    category_id INT REFERENCES expense_categories(id),
    description TEXT,
    amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
