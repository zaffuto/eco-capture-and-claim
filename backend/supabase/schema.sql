-- Create enum types
CREATE TYPE user_role AS ENUM ('collector', 'business');
CREATE TYPE certificate_status AS ENUM ('active', 'used', 'expired');
CREATE TYPE reward_type AS ENUM ('credit', 'coupon');
CREATE TYPE reward_status AS ENUM ('active', 'used', 'expired');

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  name TEXT,
  phone TEXT,
  role user_role NOT NULL,
  location POINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create recycling_records table
CREATE TABLE recycling_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  container_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  location POINT NOT NULL,
  battery_type TEXT NOT NULL,
  certificate_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create certificates table
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recycling_record_id UUID REFERENCES recycling_records(id),
  user_id UUID REFERENCES users(id),
  business_id UUID REFERENCES users(id),
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  valid_until TIMESTAMP WITH TIME ZONE,
  status certificate_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create rewards table
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  type reward_type NOT NULL,
  amount DECIMAL NOT NULL,
  shopify_product_id TEXT,
  expiry_date TIMESTAMP WITH TIME ZONE,
  status reward_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recycling_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Recycling records policies
CREATE POLICY "Users can view their own recycling records"
  ON recycling_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recycling records"
  ON recycling_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Certificates policies
CREATE POLICY "Users can view their certificates"
  ON certificates FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = business_id);

-- Rewards policies
CREATE POLICY "Users can view their own rewards"
  ON rewards FOR SELECT
  USING (auth.uid() = user_id);
