CREATE TABLE IF NOT EXISTS tax_rates (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    name VARCHAR(100) NOT NULL,
    rate DECIMAL(5,2) NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'VAT',
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='tax_rate_id') THEN
        ALTER TABLE products ADD COLUMN tax_rate_id INTEGER REFERENCES tax_rates(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='tax_rate_id') THEN
        ALTER TABLE services ADD COLUMN tax_rate_id INTEGER REFERENCES tax_rates(id);
    END IF;
END $$;

INSERT INTO tax_rates (company_id, name, rate, type, is_default, is_active, description)
SELECT 1, 'Standard VAT', 20.00, 'VAT', true, true, 'Standard VAT rate 20%'
WHERE NOT EXISTS (SELECT 1 FROM tax_rates WHERE company_id = 1 AND name = 'Standard VAT');

INSERT INTO tax_rates (company_id, name, rate, type, is_active, description)
SELECT 1, 'Reduced VAT', 5.00, 'VAT', true, 'Reduced VAT rate 5%'
WHERE NOT EXISTS (SELECT 1 FROM tax_rates WHERE company_id = 1 AND name = 'Reduced VAT');

INSERT INTO tax_rates (company_id, name, rate, type, is_active, description)
SELECT 1, 'Zero Rated', 0.00, 'VAT', true, 'Zero rated supplies'
WHERE NOT EXISTS (SELECT 1 FROM tax_rates WHERE company_id = 1 AND name = 'Zero Rated');
