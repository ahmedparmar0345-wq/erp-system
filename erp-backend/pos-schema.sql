-- POS Sessions (Cashier Shifts)
CREATE TABLE IF NOT EXISTS pos_sessions (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    user_id TEXT, -- FK to users(id) which is text
    session_number VARCHAR(50) UNIQUE NOT NULL,
    opening_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closing_time TIMESTAMP,
    opening_balance DECIMAL(15,2) DEFAULT 0,
    closing_balance DECIMAL(15,2),
    cash_sales DECIMAL(15,2) DEFAULT 0,
    card_sales DECIMAL(15,2) DEFAULT 0,
    bank_sales DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'open',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- POS Cart (temporary storage for current cart)
CREATE TABLE IF NOT EXISTS pos_cart (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    user_id TEXT,
    session_id INTEGER REFERENCES pos_sessions(id),
    customer_id TEXT,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    total DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- POS Transactions table
CREATE TABLE IF NOT EXISTS pos_transactions (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    session_id INTEGER REFERENCES pos_sessions(id),
    customer_id TEXT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    amount_paid DECIMAL(15,2) NOT NULL,
    change_amount DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'completed',
    created_by TEXT
);

-- POS Transaction Items
CREATE TABLE IF NOT EXISTS pos_transaction_items (
    id SERIAL PRIMARY KEY,
    pos_transaction_id INTEGER REFERENCES pos_transactions(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(255),
    sku VARCHAR(50),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    total DECIMAL(15,2) NOT NULL
);
