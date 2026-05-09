-- ERP Database Schema for PostgreSQL

-- ==================================================
-- ENUM TYPES
-- ==================================================

CREATE TYPE sales_order_status AS ENUM ('draft', 'confirmed', 'shipped', 'invoiced', 'cancelled');
CREATE TYPE inventory_transaction_type AS ENUM ('in', 'out', 'adjustment');
CREATE TYPE purchase_order_status AS ENUM ('draft', 'sent', 'received', 'cancelled');
CREATE TYPE account_type AS ENUM ('asset', 'liability', 'equity', 'revenue', 'expense');

-- ==================================================
-- TABLES
-- ==================================================

CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    billing_address TEXT,
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit_price DECIMAL(15, 2),
    cost_price DECIMAL(15, 2),
    current_stock INT DEFAULT 0,
    reorder_level INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sales_orders (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id),
    customer_id INT REFERENCES customers(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    order_date DATE NOT NULL,
    status sales_order_status DEFAULT 'draft',
    subtotal DECIMAL(15, 2),
    tax_total DECIMAL(15, 2),
    grand_total DECIMAL(15, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sales_order_items (
    id SERIAL PRIMARY KEY,
    sales_order_id INT REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity INT NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    total DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_transactions (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id),
    type inventory_transaction_type,
    quantity INT NOT NULL,
    reference_type VARCHAR(50),
    reference_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchase_orders (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id),
    supplier_id INT REFERENCES suppliers(id),
    po_number VARCHAR(50) UNIQUE NOT NULL,
    order_date DATE NOT NULL,
    status purchase_order_status,
    total_amount DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chart_of_accounts (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id),
    account_code VARCHAR(20) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    type account_type
);

CREATE TABLE journal_entries (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id),
    entry_date DATE NOT NULL,
    account_id INT REFERENCES chart_of_accounts(id),
    debit DECIMAL(15, 2) DEFAULT 0,
    credit DECIMAL(15, 2) DEFAULT 0,
    reference_type VARCHAR(50),
    reference_id INT,
    description TEXT
);

-- ==================================================
-- TEST DATA
-- ==================================================

INSERT INTO companies (name, tax_id, email, phone, address, currency)
VALUES ('Acme Corp', 'TAX123456', 'info@acme.com', '555-0100', '123 Main St, New York, NY', 'USD');

INSERT INTO customers (company_id, name, email, phone, billing_address, shipping_address)
VALUES (1, 'John Doe', 'john@example.com', '555-0200', '456 Oak Ave, NY', '456 Oak Ave, NY');

INSERT INTO products (company_id, sku, name, description, unit_price, cost_price, current_stock, reorder_level)
VALUES (1, 'WIDGET-001', 'Standard Widget', 'High quality standard widget', 15.50, 8.00, 100, 20);

INSERT INTO sales_orders (company_id, customer_id, order_number, order_date, status, subtotal, tax_total, grand_total, notes)
VALUES (1, 1, 'SO-2026-0001', CURRENT_DATE, 'draft', 15.50, 1.55, 17.05, 'Initial test order');

INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, total)
VALUES (1, 1, 2, 15.50, 0.00, 31.00);

INSERT INTO inventory_transactions (product_id, type, quantity, reference_type, reference_id)
VALUES (1, 'out', 2, 'sales_order', 1);
