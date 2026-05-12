-- ========================================
-- POS Module - Database Migration
-- Adds missing columns for POS functionality
-- ========================================

-- Add POS columns to sales_orders
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS pos_transaction BOOLEAN DEFAULT false;
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(15,2) DEFAULT 0;

-- Add updated_at to pos_sessions (used by session close)
ALTER TABLE pos_sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

-- Add created_by to sales_orders if not already present
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS created_by INT;
