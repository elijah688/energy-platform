CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================================
-- Energy Trading App Schema
-- ========================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    balance NUMERIC(12,2) NOT NULL DEFAULT 0,
    energy_stored NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);

-- Generators table
CREATE TABLE IF NOT EXISTS generators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'Wind' or 'Solar'
    production_rate NUMERIC(10,2) NOT NULL,
    owner_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    last_generated_at TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_generators_owner ON generators(owner_id);

-- Transactions / Trades table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL,
    buyer_id UUID, -- NULL if sold to market
    energy_amount NUMERIC(10,2) NOT NULL,
    price_per_kwh NUMERIC(10,4) NOT NULL,
    total_price NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
