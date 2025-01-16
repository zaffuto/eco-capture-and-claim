-- Create eco_cupons table
CREATE TABLE IF NOT EXISTS eco_cupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_purchase_amount DECIMAL(10,2),
    max_discount_amount DECIMAL(10,2),
    start_date TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER,
    times_used INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    conditions JSONB,
    shopify_price_rule_id VARCHAR(255),
    shopify_discount_code_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    user_id UUID REFERENCES profiles(id)
);

-- Create products table if not exists
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shopify_product_id VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    compare_at_price DECIMAL(10,2),
    sku VARCHAR(100),
    barcode VARCHAR(100),
    inventory_quantity INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    vendor VARCHAR(255),
    product_type VARCHAR(255),
    tags TEXT[],
    images JSONB,
    variants JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_eco_cupons_modtime
    BEFORE UPDATE ON eco_cupons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_modtime
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_eco_cupons_code ON eco_cupons(code);
CREATE INDEX IF NOT EXISTS idx_eco_cupons_status ON eco_cupons(status);
CREATE INDEX IF NOT EXISTS idx_eco_cupons_expiry ON eco_cupons(expiry_date);
CREATE INDEX IF NOT EXISTS idx_products_shopify_id ON products(shopify_product_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Add RLS policies
ALTER TABLE eco_cupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies for eco_cupons
CREATE POLICY "Enable read access for all users"
    ON eco_cupons FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users only"
    ON eco_cupons FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only"
    ON eco_cupons FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Policies for products
CREATE POLICY "Enable read access for all users"
    ON products FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users only"
    ON products FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only"
    ON products FOR UPDATE
    USING (auth.role() = 'authenticated');
