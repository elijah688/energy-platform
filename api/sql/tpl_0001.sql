CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================================
-- Energy Trading App Schema (Simplified)
-- ========================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    balance NUMERIC(12,2) NOT NULL DEFAULT 0,
    energy_stored NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);

-- Generator types with kWh production rates
CREATE TABLE IF NOT EXISTS generator_types (
    type_key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    icon TEXT NOT NULL,
    production_rate_kwh NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User generators - composite primary key, stores counts and total kWh
CREATE TABLE IF NOT EXISTS user_generators (
    user_id UUID NOT NULL,
    generator_type TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    total_kwh_rate NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Composite primary key
    PRIMARY KEY (user_id, generator_type),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (generator_type) REFERENCES generator_types(type_key),
    
    CONSTRAINT valid_count CHECK (count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_user_generators_user ON user_generators(user_id);
CREATE INDEX IF NOT EXISTS idx_user_generators_type ON user_generators(generator_type);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL,
    buyer_id UUID,
    energy_amount NUMERIC(10,2) NOT NULL,
    price_per_kwh NUMERIC(10,4) NOT NULL,
    total_price NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    
    CONSTRAINT positive_energy CHECK (energy_amount > 0),
    CONSTRAINT positive_price CHECK (price_per_kwh > 0)
);

-- ========================================================
-- Insert Generator Types (with your kWh values)
-- ========================================================
INSERT INTO generator_types (type_key, label, icon, production_rate_kwh) VALUES
('Wind', 'Wind Turbine', 'air', 25.00),
('Solar', 'Solar Panel', 'wb_sunny', 20.00),
('Hydro', 'Hydro Electric', 'water_drop', 40.00)
ON CONFLICT (type_key) DO UPDATE SET
    label = EXCLUDED.label,
    icon = EXCLUDED.icon,
    production_rate_kwh = EXCLUDED.production_rate_kwh;

-- ========================================================
-- Seed Data - 10 users with different generator setups
-- ========================================================
DO $$
DECLARE
    _user_id UUID;
BEGIN
    FOR i IN 1..10 LOOP
        -- Insert user
        INSERT INTO users (name, balance, energy_stored)
        VALUES (
            'User ' || i, 
            1000.00 + (i * 100), 
            500.00 + (i * 50)
        )
        RETURNING id INTO _user_id;

        -- Insert user generators based on user number pattern
        IF i <= 3 THEN
            -- Users 1-3: Wind focused
            INSERT INTO user_generators (user_id, generator_type, count, total_kwh_rate)
            VALUES (_user_id, 'Wind', 2, 50.00); -- 2 * 25 kWh
            
        ELSIF i <= 6 THEN
            -- Users 4-6: Solar focused
            INSERT INTO user_generators (user_id, generator_type, count, total_kwh_rate)
            VALUES (_user_id, 'Solar', 3, 60.00); -- 3 * 20 kWh
            
        ELSE
            -- Users 7-10: Mixed setups
            INSERT INTO user_generators (user_id, generator_type, count, total_kwh_rate) VALUES
                (_user_id, 'Wind', 1, 25.00),
                (_user_id, 'Solar', 2, 40.00),
                (_user_id, 'Hydro', 1, 40.00);
        END IF;
    END LOOP;
END
$$;
