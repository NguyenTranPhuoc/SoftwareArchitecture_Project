-- ================================================
-- Zalo Clone Database Setup Script
-- Simple PostgreSQL database for students
-- ================================================

-- Create database (run this first)
CREATE DATABASE zalo_db;

-- Connect to the database
\c zalo_db

-- ================================================
-- 1. USERS TABLE
-- ================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- 2. FRIENDSHIPS TABLE
-- ================================================
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1 UUID REFERENCES users(id) ON DELETE CASCADE,
    user_id_2 UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id_1, user_id_2)
);

-- ================================================
-- 3. INDEXES FOR BETTER PERFORMANCE
-- ================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_friendships_user1 ON friendships(user_id_1);
CREATE INDEX idx_friendships_user2 ON friendships(user_id_2);
CREATE INDEX idx_friendships_status ON friendships(status);

-- ================================================
-- 4. INSERT SAMPLE DATA (for testing)
-- ================================================
INSERT INTO users (email, password_hash, display_name, phone) VALUES
('test1@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Test User 1', '0123456789'),
('test2@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Test User 2', '0987654321');

-- ================================================
-- VERIFICATION QUERIES
-- ================================================
SELECT 'Database setup complete!' AS status;
SELECT COUNT(*) AS total_users FROM users;
SELECT * FROM users;
