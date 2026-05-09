-- Return reasons lookup
CREATE TABLE IF NOT EXISTS return_reasons (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    reason_code VARCHAR(50) NOT NULL,
    reason_name VARCHAR(255) NOT NULL,
    category VARCHAR(50), -- sales, purchase, both
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default return reasons
INSERT INTO return_reasons (company_id, reason_code, reason_name, category) VALUES
(1, 'DEFECTIVE', 'Defective/Damaged Product', 'both'),
(1, 'WRONG_ITEM', 'Wrong Item Shipped', 'both'),
(1, 'CUSTOMER_REQUEST', 'Customer Request/Change of Mind', 'sales'),
(1, 'QUALITY_ISSUE', 'Quality Issue', 'purchase'),
(1, 'EXPIRED', 'Product Expired', 'both'),
(1, 'DAMAGED', 'Damaged During Transit', 'both')
ON CONFLICT DO NOTHING;

-- Sales Returns table
CREATE TABLE IF NOT EXISTS sales_returns (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    return_number VARCHAR(50) UNIQUE NOT NULL,
    original_sales_order_id INTEGER, -- FK removed for compatibility
    customer_id INTEGER,
    return_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'pending',
    subtotal DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    restock_inventory BOOLEAN DEFAULT true,
    notes TEXT,
    created_by INTEGER,
    approved_by INTEGER,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales Return Items table
CREATE TABLE IF NOT EXISTS sales_return_items (
    id SERIAL PRIMARY KEY,
    sales_return_id INTEGER REFERENCES sales_returns(id) ON DELETE CASCADE,
    original_order_item_id INTEGER,
    product_id INTEGER,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    total DECIMAL(15,2) NOT NULL,
    return_reason_id INTEGER REFERENCES return_reasons(id),
    reason_text TEXT,
    condition VARCHAR(50) DEFAULT 'good',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Returns table
CREATE TABLE IF NOT EXISTS purchase_returns (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    return_number VARCHAR(50) UNIQUE NOT NULL,
    original_purchase_order_id INTEGER,
    supplier_id INTEGER,
    return_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'pending',
    subtotal DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    created_by INTEGER,
    approved_by INTEGER,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Return Items table
CREATE TABLE IF NOT EXISTS purchase_return_items (
    id SERIAL PRIMARY KEY,
    purchase_return_id INTEGER REFERENCES purchase_returns(id) ON DELETE CASCADE,
    original_po_item_id INTEGER,
    product_id INTEGER,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    total DECIMAL(15,2) NOT NULL,
    return_reason_id INTEGER REFERENCES return_reasons(id),
    reason_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Credit Notes (Accounting)
CREATE TABLE IF NOT EXISTS credit_notes (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    credit_note_number VARCHAR(50) UNIQUE NOT NULL,
    reference_type VARCHAR(50) NOT NULL,
    reference_id INTEGER NOT NULL,
    customer_id INTEGER,
    supplier_id INTEGER,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    journal_entry_id INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
