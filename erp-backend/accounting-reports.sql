-- ==================================================
-- Accounting Reports - Schema Additions
-- ==================================================
-- Required by: routes/accounting-reports.js
-- Also required by existing: routes/accounting.js

-- 1. journal_entry_lines table (line items for journal entries)
CREATE TABLE IF NOT EXISTS journal_entry_lines (
    id SERIAL PRIMARY KEY,
    journal_entry_id INT NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id INT NOT NULL REFERENCES chart_of_accounts(id),
    debit DECIMAL(15, 2) DEFAULT 0,
    credit DECIMAL(15, 2) DEFAULT 0,
    narration TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jel_entry_id ON journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_jel_account_id ON journal_entry_lines(account_id);

-- 2. Extend journal_entries header columns (needed by accounting.js)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'voucher_no') THEN
        ALTER TABLE journal_entries ADD COLUMN voucher_no VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'voucher_type') THEN
        ALTER TABLE journal_entries ADD COLUMN voucher_type VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'total_debit') THEN
        ALTER TABLE journal_entries ADD COLUMN total_debit DECIMAL(15, 2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'total_credit') THEN
        ALTER TABLE journal_entries ADD COLUMN total_credit DECIMAL(15, 2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'status') THEN
        ALTER TABLE journal_entries ADD COLUMN status VARCHAR(20) DEFAULT 'draft';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'created_by') THEN
        ALTER TABLE journal_entries ADD COLUMN created_by INT REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'updated_at') THEN
        ALTER TABLE journal_entries ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'approved_by') THEN
        ALTER TABLE journal_entries ADD COLUMN approved_by INT REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'approved_at') THEN
        ALTER TABLE journal_entries ADD COLUMN approved_at TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'signature') THEN
        ALTER TABLE journal_entries ADD COLUMN signature TEXT;
    END IF;
END $$;

-- 3. Extend chart_of_accounts
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chart_of_accounts' AND column_name = 'parent_account_id') THEN
        ALTER TABLE chart_of_accounts ADD COLUMN parent_account_id INT REFERENCES chart_of_accounts(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chart_of_accounts' AND column_name = 'description') THEN
        ALTER TABLE chart_of_accounts ADD COLUMN description TEXT;
    END IF;
END $$;

-- 4. Data migration: move existing line-level journal_entries data to journal_entry_lines
-- (safe to run multiple times; skips if data already in jel)
INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, narration)
SELECT id, account_id, debit, credit, description
FROM journal_entries je
WHERE je.account_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM journal_entry_lines jel WHERE jel.journal_entry_id = je.id)
ORDER BY je.id;

-- Update journal_entries headers with totals from lines
UPDATE journal_entries je
SET total_debit = COALESCE((SELECT SUM(debit) FROM journal_entry_lines WHERE journal_entry_id = je.id), 0),
    total_credit = COALESCE((SELECT SUM(credit) FROM journal_entry_lines WHERE journal_entry_id = je.id), 0),
    status = COALESCE(je.status, 'approved')
WHERE je.total_debit IS NULL;

-- Migrate reference_type, reference_id data if they exist on old rows
UPDATE journal_entries je
SET voucher_type = CASE
    WHEN je.reference_type = 'sales_order' THEN 'Receipt'
    WHEN je.reference_type = 'purchase_order' THEN 'Payment'
    ELSE 'Journal'
END,
    voucher_no = 'MIGRATED-' || je.id
WHERE je.voucher_no IS NULL;
