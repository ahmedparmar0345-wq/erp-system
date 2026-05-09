# ERP Database Schema Specification
## Naming Conventions
- Tables: plural, snake_case (e.g., `sales_orders`)
- Primary Key: `id`
- Foreign Key: `singular_table_name_id` (e.g., `customer_id`)
- Other columns: snake_case (e.g., `order_date`, `unit_price`)
- Timestamps: `created_at`, `updated_at` (UTC)

## Module 1: Core / Company
### Table: `companies`
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK AUTO_INCREMENT | Primary key |
| name | VARCHAR(255) NOT NULL | Company name |
| tax_id | VARCHAR(100) | Tax/VAT number |
| email | VARCHAR(255) | Company email |
| phone | VARCHAR(50) | Phone number |
| address | TEXT | Full address |
| currency | VARCHAR(3) DEFAULT 'USD' | Currency code |
| created_at | DATETIME | |
| updated_at | DATETIME | |

## Module 2: Sales
### Table: `customers`
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | Primary key |
| company_id | INT FK → companies.id | Multi-tenant support |
| name | VARCHAR(255) NOT NULL | Customer name |
| email | VARCHAR(255) | |
| phone | VARCHAR(50) | |
| billing_address | TEXT | |
| shipping_address | TEXT | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### Table: `sales_orders`
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | |
| company_id | INT FK → companies.id | |
| customer_id | INT FK → customers.id | |
| order_number | VARCHAR(50) UNIQUE NOT NULL | e.g., SO-2026-0001 |
| order_date | DATE NOT NULL | |
| status | ENUM('draft','confirmed','shipped','invoiced','cancelled') DEFAULT 'draft' | |
| subtotal | DECIMAL(15,2) | |
| tax_total | DECIMAL(15,2) | |
| grand_total | DECIMAL(15,2) | |
| notes | TEXT | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### Table: `sales_order_items`
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | |
| sales_order_id | INT FK → sales_orders.id ON DELETE CASCADE | |
| product_id | INT FK → products.id | |
| quantity | INT NOT NULL | |
| unit_price | DECIMAL(15,2) NOT NULL | |
| discount_percent | DECIMAL(5,2) DEFAULT 0 | |
| total | DECIMAL(15,2) | (quantity * unit_price) - discount |
| created_at | DATETIME | |

## Module 3: Inventory
### Table: `products`
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | |
| company_id | INT FK → companies.id | |
| sku | VARCHAR(100) UNIQUE NOT NULL | Stock Keeping Unit |
| name | VARCHAR(255) NOT NULL | |
| description | TEXT | |
| unit_price | DECIMAL(15,2) | Selling price |
| cost_price | DECIMAL(15,2) | Purchase cost |
| current_stock | INT DEFAULT 0 | |
| reorder_level | INT DEFAULT 0 | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### Table: `inventory_transactions`
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | |
| product_id | INT FK → products.id | |
| type | ENUM('in','out','adjustment') | |
| quantity | INT NOT NULL | |
| reference_type | VARCHAR(50) | e.g., 'sales_order', 'purchase_order' |
| reference_id | INT | ID of referencing document |
| created_at | DATETIME | |

## Module 4: Purchasing
### Table: `suppliers`
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | |
| company_id | INT FK → companies.id | |
| name | VARCHAR(255) NOT NULL | |
| email | VARCHAR(255) | |
| phone | VARCHAR(50) | |
| address | TEXT | |
| created_at | DATETIME | |

### Table: `purchase_orders`
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | |
| company_id | INT FK → companies.id | |
| supplier_id | INT FK → suppliers.id | |
| po_number | VARCHAR(50) UNIQUE NOT NULL | |
| order_date | DATE NOT NULL | |
| status | ENUM('draft','sent','received','cancelled') | |
| total_amount | DECIMAL(15,2) | |
| created_at | DATETIME | |

## Module 5: Accounting (Simplified)
### Table: `chart_of_accounts`
| Column | Type |
|--------|------|
| id | INT PK |
| company_id | INT FK → companies.id |
| account_code | VARCHAR(20) NOT NULL |
| account_name | VARCHAR(255) NOT NULL |
| type | ENUM('asset','liability','equity','revenue','expense') |

### Table: `journal_entries`
| Column | Type |
|--------|------|
| id | INT PK |
| company_id | INT FK → companies.id |
| entry_date | DATE NOT NULL |
| account_id | INT FK → chart_of_accounts.id |
| debit | DECIMAL(15,2) DEFAULT 0 |
| credit | DECIMAL(15,2) DEFAULT 0 |
| reference_type | VARCHAR(50) |
| reference_id | INT |
| description | TEXT |