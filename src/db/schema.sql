-- ============================================================================
-- TRUVAER AVIATION ECOSYSTEM PLATFORM - PRODUCTION DATABASE SCHEMA (POSTGRESQL)
-- Production Ready for AWS RDS, AWS Aurora, GCP Cloud SQL, Supabase, Neon & Railway
-- Compatible with PostgreSQL 14, 15, 16+
-- ============================================================================

-- 1. Enable Required Cryptographic & UUID Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom Enum Types
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('STANDARD_USER', 'BUSINESS_USER', 'ADMIN', 'SUPER_ADMIN', 'MANAGER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE account_status_enum AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE business_verification_status_enum AS ENUM ('HARD_LOCKED', 'IN_REVIEW', 'VERIFIED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reg_number_type_enum AS ENUM ('PAN', 'TAN', 'CORPORATE_REG_NO', 'TIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE publication_status_enum AS ENUM ('PUBLISHED', 'RESTRICTED', 'PENDING_APPROVAL', 'SUSPENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE post_type_enum AS ENUM ('POST', 'ARTICLE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE crm_lead_status_enum AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE opportunity_stage_enum AS ENUM ('PROSPECTING', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE quotation_status_enum AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'INVOICED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE commission_status_enum AS ENUM ('COMMITTED', 'INVOICE_GENERATED', 'RELEASED', 'SETTLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE store_item_condition_enum AS ENUM ('FACTORY_NEW', 'OVERHAULED', 'SERVICEABLE', 'AS_REMOVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE store_item_status_enum AS ENUM ('IN_STOCK', 'LOW_STOCK', 'CRITICAL_REORDER', 'OUT_OF_STOCK');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE admin_activity_category_enum AS ENUM (
        'BUSINESS_APPROVAL',
        'COMMISSION_PAYOUT',
        'LEAD_STATUS_CHANGE',
        'WALLET_DEBIT',
        'HIERARCHY_PROMOTION',
        'PUBLICATION_COMPLIANCE',
        'SECURITY_AUDIT'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 3. CORE USER & AUTHENTICATION TABLES
-- ============================================================================

-- Regular Users Table (Licensed Aviators, Standard Consumers, Admins)
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(30) UNIQUE NOT NULL CHECK (username ~ '^[a-z0-9_.]+$'),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    gender VARCHAR(20),
    city VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE,
    date_of_birth DATE,
    country_code VARCHAR(2) NOT NULL DEFAULT 'IN',
    phone_number VARCHAR(30) NOT NULL,
    account_status account_status_enum DEFAULT 'PENDING_VERIFICATION',
    role user_role_enum DEFAULT 'STANDARD_USER',
    employment_status VARCHAR(50) DEFAULT 'Candidate',
    organization VARCHAR(150),
    headline VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Business Profiles Table (Air Charter Operators, Flight Academies, MRO Stations)
CREATE TABLE IF NOT EXISTS business_profiles (
    business_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    truvaer_id VARCHAR(50) UNIQUE,
    organization_name VARCHAR(150) NOT NULL,
    owner_name VARCHAR(150) NOT NULL,
    reg_number_type reg_number_type_enum NOT NULL DEFAULT 'PAN',
    registration_number VARCHAR(100) NOT NULL,
    date_of_registration DATE,
    nature_of_business VARCHAR(150),
    business_description TEXT,
    physical_location VARCHAR(255),
    website_url TEXT,
    country VARCHAR(2) NOT NULL DEFAULT 'IN',
    business_email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(30),
    password_hash VARCHAR(255) NOT NULL,
    inc_cert_doc_url TEXT,
    inc_cert_file_name VARCHAR(255),
    inc_cert_file_size BIGINT,
    bank_account_holder VARCHAR(150),
    bank_account_number VARCHAR(255),
    bank_account_number_masked VARCHAR(50),
    bank_ifsc_swift VARCHAR(50),
    bank_name VARCHAR(150),
    verification_status business_verification_status_enum DEFAULT 'HARD_LOCKED',
    rejection_reason_code VARCHAR(50),
    rejection_remarks TEXT,
    domain_challenge_sent BOOLEAN DEFAULT FALSE,
    domain_verified BOOLEAN DEFAULT FALSE,
    rating NUMERIC(3,2) DEFAULT 5.00,
    review_count INT DEFAULT 0,
    category VARCHAR(100),
    photos JSONB DEFAULT '[]'::jsonb,
    services_offered JSONB DEFAULT '[]'::jsonb,
    chat_enabled BOOLEAN DEFAULT TRUE,
    has_active_inquiries BOOLEAN DEFAULT FALSE,
    followed_by_count INT DEFAULT 0,
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Business Followers Table (Condition 4: Tracks users following business pages)
CREATE TABLE IF NOT EXISTS business_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES business_profiles(business_id) ON DELETE CASCADE,
    followed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_business_follow UNIQUE (user_id, business_id)
);

-- ============================================================================
-- 4. LINKEDIN POSTS, ARTICLES & TARGETED MARKETING CAMPAIGN TABLES
-- ============================================================================

-- Business Posts Table (Only business users are permitted to author posts/articles)
CREATE TABLE IF NOT EXISTS business_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES business_profiles(business_id) ON DELETE CASCADE,
    post_type post_type_enum DEFAULT 'POST',
    title VARCHAR(255),
    content TEXT NOT NULL,
    media_url TEXT,
    media_type VARCHAR(20) DEFAULT 'image',
    tags JSONB DEFAULT '[]'::jsonb,
    shares_count INT DEFAULT 0,
    is_marketed BOOLEAN DEFAULT FALSE, -- True if boosted/sponsored
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Post Marketing Campaigns Table (Targeting Range, Country, Duration, Category)
-- CONDITION 4 ENFORCED: target_audience strictly standard users, never B2B
CREATE TABLE IF NOT EXISTS post_marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES business_posts(id) ON DELETE CASCADE,
    radius_km INT NOT NULL DEFAULT 100, -- -1 denotes Worldwide / Global
    country VARCHAR(10) NOT NULL DEFAULT 'IN',
    duration_days INT NOT NULL DEFAULT 7,
    category VARCHAR(100) NOT NULL,
    target_audience VARCHAR(50) NOT NULL DEFAULT 'STANDARD_USERS_ONLY',
    credits_invested INT NOT NULL DEFAULT 50,
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Post Likes Table
CREATE TABLE IF NOT EXISTS post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES business_posts(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL, -- user_id or business_id
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_post_actor_like UNIQUE (post_id, actor_id)
);

-- Post Comments Table
CREATE TABLE IF NOT EXISTS post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES business_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_name VARCHAR(150) NOT NULL,
    user_role VARCHAR(100),
    user_avatar TEXT,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. DIGITAL WALLET & CORPORATE TREASURY TABLES
-- ============================================================================

-- Regular User Digital Wallets
CREATE TABLE IF NOT EXISTS digital_wallets (
    wallet_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    purchased_credits INT DEFAULT 0,
    earned_credits INT DEFAULT 0,
    balance INT GENERATED ALWAYS AS (purchased_credits + earned_credits) STORED,
    currency VARCHAR(10) DEFAULT 'INR',
    provisioned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Digital Wallet Transactions
CREATE TABLE IF NOT EXISTS digital_wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES digital_wallets(wallet_id) ON DELETE CASCADE,
    transaction_type VARCHAR(30) NOT NULL, -- CREDIT, DEBIT, TRANSFER, PURCHASE
    amount INT NOT NULL,
    credit_type VARCHAR(20) NOT NULL, -- PURCHASED, EARNED
    description TEXT NOT NULL,
    reference_id VARCHAR(100),
    counterparty VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Business Corporate Wallets
CREATE TABLE IF NOT EXISTS corporate_wallets (
    wallet_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID UNIQUE NOT NULL REFERENCES business_profiles(business_id) ON DELETE CASCADE,
    credit_balance INT DEFAULT 5000,
    tier VARCHAR(50) DEFAULT 'ENTERPRISE_PREMIER',
    auto_renew_enabled BOOLEAN DEFAULT FALSE,
    auto_renew_threshold INT DEFAULT 500,
    auto_renew_credits INT DEFAULT 2000,
    provisioned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Corporate Wallet Transactions
CREATE TABLE IF NOT EXISTS corporate_wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES corporate_wallets(wallet_id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- GRANT, USAGE, PURCHASE
    credits INT NOT NULL,
    description TEXT NOT NULL,
    action_type VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. SERVICE DIRECTORY (UNIFINDER) & CONTACT UNLOCK TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS service_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES business_profiles(business_id) ON DELETE CASCADE,
    truvaer_id VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    sub_category VARCHAR(100),
    logo_url TEXT,
    video_url TEXT,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(10) NOT NULL,
    address TEXT NOT NULL,
    area VARCHAR(100),
    pincode VARCHAR(20),
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) NOT NULL,
    established_year INT DEFAULT 2024,
    services JSONB DEFAULT '[]'::jsonb,
    facilities JSONB DEFAULT '[]'::jsonb,
    amenities JSONB DEFAULT '[]'::jsonb,
    photos JSONB DEFAULT '[]'::jsonb,
    banner_ad_url TEXT,
    rating NUMERIC(3,2) DEFAULT 5.00,
    reviews_count INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT TRUE,
    lead_unlock_credits INT DEFAULT 10,
    direct_chat_credits INT DEFAULT 5,
    publication_status publication_status_enum DEFAULT 'PUBLISHED',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 30-Day Unlocked Contact Records
CREATE TABLE IF NOT EXISTS unlocked_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES service_listings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES business_profiles(business_id) ON DELETE CASCADE,
    debited_credits INT NOT NULL DEFAULT 10,
    unlocked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMPTZ NOT NULL,
    CONSTRAINT uq_user_listing_unlock UNIQUE (user_id, listing_id)
);

-- Customer Reviews Table
CREATE TABLE IF NOT EXISTS customer_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES service_listings(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    author_name VARCHAR(150) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'visible',
    hidden_by VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. CRM & COMMERCIAL SALES PIPELINE TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS crm_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES business_profiles(business_id) ON DELETE CASCADE,
    client_name VARCHAR(150) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    sub_category VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    requirement_details TEXT NOT NULL,
    budget NUMERIC(15,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'INR',
    status crm_lead_status_enum DEFAULT 'NEW',
    source VARCHAR(50) DEFAULT 'Marketplace Lead',
    assigned_to VARCHAR(150),
    zone VARCHAR(50),
    country VARCHAR(10),
    territory VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crm_sales_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_code VARCHAR(50) UNIQUE NOT NULL,
    sales_date DATE NOT NULL,
    sales_status VARCHAR(50) NOT NULL DEFAULT 'Final',
    reference_no VARCHAR(100),
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    business_id UUID NOT NULL REFERENCES business_profiles(business_id) ON DELETE CASCADE,
    total_amount NUMERIC(15,2) NOT NULL,
    paid_amount NUMERIC(15,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'Paid',
    payment_method VARCHAR(50) DEFAULT 'Bank Transfer',
    items JSONB DEFAULT '[]'::jsonb,
    tag VARCHAR(50),
    notes TEXT,
    zone VARCHAR(50),
    country VARCHAR(10),
    territory VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS platform_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id VARCHAR(100) NOT NULL,
    deal_title VARCHAR(255) NOT NULL,
    quotation_number VARCHAR(100),
    business_id UUID NOT NULL REFERENCES business_profiles(business_id) ON DELETE CASCADE,
    client_name VARCHAR(150) NOT NULL,
    sale_amount NUMERIC(15,2) NOT NULL,
    commission_rate_pct NUMERIC(5,2) NOT NULL,
    commission_amount NUMERIC(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    sale_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status commission_status_enum DEFAULT 'COMMITTED',
    payment_reference VARCHAR(100),
    released_at TIMESTAMPTZ,
    settled_by_admin VARCHAR(150),
    notes TEXT,
    zone VARCHAR(50),
    country VARCHAR(10),
    territory VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. REAL-TIME ADMIN ACTIVITY FEED (Requirement 1 & Compliance Log)
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_activity_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category admin_activity_category_enum NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    actor_name VARCHAR(150) NOT NULL,
    actor_role VARCHAR(150) NOT NULL,
    target_id VARCHAR(100),
    target_name VARCHAR(255),
    amount NUMERIC(15,2),
    currency VARCHAR(20),
    status_from VARCHAR(50),
    status_to VARCHAR(50),
    severity VARCHAR(20) DEFAULT 'info', -- info, success, warning, critical
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 9. PERFORMANCE INDEXES
-- ============================================================================

-- Users & Auth Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(account_status);

-- Business Profiles Indexes
CREATE INDEX IF NOT EXISTS idx_business_country ON business_profiles(country);
CREATE INDEX IF NOT EXISTS idx_business_verification ON business_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_business_category ON business_profiles(category);

-- Follower System Indexes (Critical for Condition 4 fast feed resolution)
CREATE INDEX IF NOT EXISTS idx_followers_user_id ON business_followers(user_id);
CREATE INDEX IF NOT EXISTS idx_followers_biz_id ON business_followers(business_id);

-- Post & Campaign Indexes
CREATE INDEX IF NOT EXISTS idx_posts_business_id ON business_posts(business_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON business_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_marketed ON business_posts(is_marketed);
CREATE INDEX IF NOT EXISTS idx_campaigns_post_id ON post_marketing_campaigns(post_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_target ON post_marketing_campaigns(country, category, status);

-- Activity Feed Indexes
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON admin_activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_category ON admin_activity_feed(category);

-- ============================================================================
-- 10. AUTOMATED TIMESTAMP UPDATE TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_business_updated_at BEFORE UPDATE ON business_profiles FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_posts_updated_at BEFORE UPDATE ON business_posts FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 11. INITIAL SEED DATA FOR IMMEDIATE LIVE LAUNCH
-- ============================================================================

-- Seed Primary Root Admin
INSERT INTO users (
    user_id, username, first_name, last_name, email, password_hash,
    is_email_verified, role, account_status, phone_number, country_code
) VALUES (
    'b2e8c910-12ab-44df-a890-776655fedcba', 'admin', 'B Aditya', 'Narayana',
    'admin@truvaer.com', crypt('admin', gen_salt('bf')),
    TRUE, 'SUPER_ADMIN', 'ACTIVE', '+919876543210', 'IN'
) ON CONFLICT (email) DO NOTHING;

-- Seed Standard Aviator User
INSERT INTO users (
    user_id, username, first_name, last_name, email, password_hash,
    is_email_verified, role, account_status, phone_number, country_code, headline
) VALUES (
    'a7f1d432-89bc-43e1-a012-3456789abcde', 'user', 'Rahul', 'Varma',
    'user@domain.com', crypt('user123', gen_salt('bf')),
    TRUE, 'STANDARD_USER', 'ACTIVE', '+919820123456', 'IN', 'Commercial Pilot License (CPL) Cadet'
) ON CONFLICT (email) DO NOTHING;

-- Seed Verified Business: JetVentures
INSERT INTO business_profiles (
    business_id, truvaer_id, organization_name, owner_name, reg_number_type, registration_number,
    country, business_email, phone_number, password_hash, verification_status, category, physical_location
) VALUES (
    'a1b2c3d4-5566-7788-9900-aabbccddeeff', 'AE-AA001', 'JetVentures VIP SkySuite & Private Charters',
    'Capt. Tariq Al-Mansoor', 'CORPORATE_REG_NO', 'CRN-7890123-AE',
    'AE', 'charters@jetventures.ae', '+9714800538847', crypt('jet123', gen_salt('bf')),
    'VERIFIED', 'Private Air Charter', 'Gate 4, Executive Terminal, Al Maktoum Int. Airport, Dubai'
) ON CONFLICT (business_email) DO NOTHING;

-- Seed Verified Business: SkyHigh Aviation Academy
INSERT INTO business_profiles (
    business_id, truvaer_id, organization_name, owner_name, reg_number_type, registration_number,
    country, business_email, phone_number, password_hash, verification_status, category, physical_location
) VALUES (
    'c3d4e5f6-7788-9900-1122-bbccddeeff00', 'IN-AA002', 'SkyHigh Aviation Academy',
    'Capt. Rajesh Sharma', 'PAN', 'AAACS1234K',
    'IN', 'admissions@skyhighaviation.in', '+918023456789', crypt('skyhigh123', gen_salt('bf')),
    'VERIFIED', 'Pilot Training & Academies', 'HAL Airport Old Terminal Road, Bengaluru'
) ON CONFLICT (business_email) DO NOTHING;

-- Link Followers: Rahul Varma follows JetVentures & SkyHigh
INSERT INTO business_followers (user_id, business_id) VALUES
    ('a7f1d432-89bc-43e1-a012-3456789abcde', 'a1b2c3d4-5566-7788-9900-aabbccddeeff'),
    ('a7f1d432-89bc-43e1-a012-3456789abcde', 'c3d4e5f6-7788-9900-1122-bbccddeeff00')
ON CONFLICT (user_id, business_id) DO NOTHING;
