import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Connected. Starting seed...\n');

    // 1. Create companies table (core, referenced by everything)
    console.log('Creating companies table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        tax_id VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        currency VARCHAR(10) DEFAULT 'USD',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Insert demo company (if not exists)
    const existingCompany = await client.query('SELECT id FROM companies WHERE id = 1');
    if (existingCompany.rows.length === 0) {
      console.log('Inserting demo company...');
      await client.query(`
        INSERT INTO companies (id, name, tax_id, email, phone, address, currency)
        VALUES (1, 'Acme Corporation', 'US-47-3829104', 'info@acmecorp.com', '+1 (312) 555-0198',
                '1200 Industrial Blvd, Suite 400, Chicago, IL 60607', 'USD');
      `);
      await client.query("SELECT setval('companies_id_seq', 1)");
    } else {
      console.log('Company already exists, skipping.');
    }

    // 2b. Create core tables (from erp_schema.sql) — missing from schema file list
    console.log('Creating core tables (customers, products, sales_orders, etc.)...');
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE sales_order_status AS ENUM ('draft', 'confirmed', 'shipped', 'invoiced', 'cancelled');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
      DO $$ BEGIN
        CREATE TYPE inventory_transaction_type AS ENUM ('in', 'out', 'adjustment');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
      DO $$ BEGIN
        CREATE TYPE purchase_order_status AS ENUM ('draft', 'sent', 'received', 'cancelled');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
      DO $$ BEGIN
        CREATE TYPE account_type AS ENUM ('asset', 'liability', 'equity', 'revenue', 'expense');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
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
      CREATE TABLE IF NOT EXISTS products (
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
      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        company_id INT REFERENCES companies(id),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS sales_orders (
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
      CREATE TABLE IF NOT EXISTS sales_order_items (
        id SERIAL PRIMARY KEY,
        sales_order_id INT REFERENCES sales_orders(id) ON DELETE CASCADE,
        product_id INT REFERENCES products(id),
        quantity INT NOT NULL,
        unit_price DECIMAL(15, 2) NOT NULL,
        discount_percent DECIMAL(5, 2) DEFAULT 0,
        total DECIMAL(15, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS inventory_transactions (
        id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(id),
        type inventory_transaction_type,
        quantity INT NOT NULL,
        reference_type VARCHAR(50),
        reference_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id SERIAL PRIMARY KEY,
        company_id INT REFERENCES companies(id),
        supplier_id INT REFERENCES suppliers(id),
        po_number VARCHAR(50) UNIQUE NOT NULL,
        order_date DATE NOT NULL DEFAULT CURRENT_DATE,
        expected_delivery_date DATE,
        status VARCHAR(50) DEFAULT 'draft',
        subtotal DECIMAL(15,2),
        tax_total DECIMAL(15,2),
        grand_total DECIMAL(15,2),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id SERIAL PRIMARY KEY,
        purchase_order_id INT REFERENCES purchase_orders(id) ON DELETE CASCADE,
        product_id INT REFERENCES products(id),
        quantity INT NOT NULL,
        unit_price DECIMAL(15,2),
        total DECIMAL(15,2),
        received_quantity INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS chart_of_accounts (
        id SERIAL PRIMARY KEY,
        company_id INT REFERENCES companies(id),
        account_code VARCHAR(20) NOT NULL,
        account_name VARCHAR(255) NOT NULL,
        type account_type
      );
      CREATE TABLE IF NOT EXISTS journal_entries (
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
    `);
    console.log('  ✓ Core tables created');

    // 3. Run ALL schema files in dependency order (companies first, users second, etc.)
    const schemaFiles = [
      'users-schema.sql',
      'settings-schema.sql',
      'tax-schema.sql',
      'reports-schema.sql',
      'services-schema.sql',
      'quotation-schema.sql',
      'warehouse-schema.sql',
      'returns-schema.sql',
      'pos-schema.sql',
      'crm-schema.sql',
      'hr-schema.sql',
      'remaining-modules-schema.sql',
      'accounting-reports-schema.sql',
      'accounting-enhancement-schema.sql',
      'updates.sql',
    ];

    for (const file of schemaFiles) {
      const path = join(__dirname, '..', file);
      try {
        const sql = readFileSync(path, 'utf-8');
        await client.query(sql);
        console.log(`  ✓ ${file}`);
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.log(`  - ${file} not found, skipping`);
        } else {
          console.log(`  ✗ ${file}: ${err.message}`);
        }
      }
    }

    // 4. Ensure demo users exist with known passwords
    console.log('\nEnsuring demo users...');
    const demoUsers = [
      { email: 'admin@erp.com', password: 'admin123', name: 'Admin User', role: 'admin' },
      { email: 'john@erp.com', password: 'manager123', name: 'John Manager', role: 'manager' },
      { email: 'jane@erp.com', password: 'accountant123', name: 'Jane Accountant', role: 'accountant' },
      { email: 'bob@erp.com', password: 'employee123', name: 'Bob Employee', role: 'employee' },
    ];

    for (const u of demoUsers) {
      const existing = await client.query('SELECT id FROM users WHERE email = $1', [u.email]);
      if (existing.rows.length === 0) {
        const hash = await bcrypt.hash(u.password, 10);
        await client.query(
          'INSERT INTO users (company_id, email, password_hash, name, role) VALUES (1, $1, $2, $3, $4)',
          [u.email, hash, u.name, u.role]
        );
        console.log(`  ✓ Created user: ${u.email} / ${u.password}`);
      } else {
        console.log(`  - User ${u.email} already exists`);
      }
    }

    // 4b. Add additional users referenced by seed-reset.sql (IDs 6, 7, 8)
    console.log('Ensuring additional users for demo data...');
    const additionalUsers = [
      { id: 6, email: 'sarah.chen@acmecorp.com', name: 'Sarah Chen', role: 'manager' },
      { id: 7, email: 'james.rodriguez@acmecorp.com', name: 'James Rodriguez', role: 'manager' },
      { id: 8, email: 'lisa.thompson@acmecorp.com', name: 'Lisa Thompson', role: 'manager' },
      { id: 10, email: 'david.nakamura@acmecorp.com', name: 'David Nakamura', role: 'employee' },
      { id: 12, email: 'thomas.baker@acmecorp.com', name: 'Thomas Baker', role: 'employee' },
    ];
    for (const u of additionalUsers) {
      const existing = await client.query('SELECT id FROM users WHERE id = $1', [u.id]);
      if (existing.rows.length === 0) {
        const hash = await bcrypt.hash('demo123', 10);
        await client.query(
          'INSERT INTO users (id, company_id, email, password_hash, name, role) VALUES ($1, 1, $2, $3, $4, $5)',
          [u.id, u.email, hash, u.name, u.role]
        );
        console.log(`  ✓ Created user: ${u.email} / demo123`);
      } else {
        console.log(`  - User ${u.email} (id=${u.id}) already exists`);
      }
    }
    await client.query("SELECT setval('users_id_seq', GREATEST(12, (SELECT MAX(id) FROM users)))");

    // 5. Run seed-reset.sql for transactional demo data
    console.log('\nLoading transactional demo data...');
    const seedPath = join(__dirname, '..', 'seed-reset.sql');
    try {
      const seedSql = readFileSync(seedPath, 'utf-8');
      await client.query(seedSql);
      console.log('  ✓ seed-reset.sql executed successfully');
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log('  - seed-reset.sql not found, skipping');
      } else {
        console.log(`  ✗ seed-reset.sql: ${err.message}`);
        throw err;
      }
    }

    console.log('\n✅ Seed completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Login credentials:');
    console.log('  ┌─────────────────────┬──────────────────┐');
    console.log('  │ Email               │ Password         │');
    console.log('  ├─────────────────────┼──────────────────┤');
    console.log('  │ admin@erp.com       │ admin123         │');
    console.log('  │ john@erp.com        │ manager123       │');
    console.log('  │ jane@erp.com        │ accountant123    │');
    console.log('  │ bob@erp.com         │ employee123      │');
    console.log('  └─────────────────────┴──────────────────┘');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
