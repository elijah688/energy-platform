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
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
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
    FOREIGN KEY (owner_id) REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
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


-- ========================================================
-- Seed 10 users with 1 generator each
-- ========================================================
-- ========================================================
-- Seed 10 users with 1 generator each
-- ========================================================

DO $$
DECLARE
    _user_id UUID;
BEGIN
    FOR i IN 1..10 LOOP
        -- Insert user
        INSERT INTO users (id, name, balance, energy_stored, created_at)
        VALUES (gen_random_uuid(), 'User ' || i, 100 + i * 10, 50 + i * 5, NOW())
        RETURNING id INTO _user_id;

        -- Insert generator for the user
        INSERT INTO generators (id, type, production_rate, owner_id, status, created_at)
        VALUES (gen_random_uuid(),
                CASE WHEN i % 2 = 0 THEN 'Wind' ELSE 'Solar' END,
                20 + i * 2,
                _user_id,
                'active',
                NOW());
    END LOOP;
END
$$;
