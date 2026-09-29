-- ==========================================
-- AetherOS Database Schema (PostgreSQL DDL)
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Accessibility & Cognitive Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    active_shell VARCHAR(50) DEFAULT 'standard' CHECK (active_shell IN ('standard', 'dyslexia', 'adhd', 'autism')),
    font_family VARCHAR(50) DEFAULT 'default',
    font_size VARCHAR(20) DEFAULT 'base',
    tint_overlay_enabled BOOLEAN DEFAULT false,
    tint_color VARCHAR(50) DEFAULT '#FAF6EE',
    bionic_reading_enabled BOOLEAN DEFAULT false,
    reading_ruler_enabled BOOLEAN DEFAULT false,
    brown_noise_volume REAL DEFAULT 0.2,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_prefs UNIQUE (user_id)
);

-- Saved ADHD Tasks & Micro-steps
CREATE TABLE IF NOT EXISTS task_dechunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_goal TEXT NOT NULL,
    kickoff_message TEXT,
    steps JSONB NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Saved Number Clarifications (Dyscalculia Notebook)
CREATE TABLE IF NOT EXISTS number_clarifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    raw_input TEXT NOT NULL,
    chunked_form TEXT NOT NULL,
    plain_scale TEXT NOT NULL,
    relative_takeaway TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tone Decoded Communications History
CREATE TABLE IF NOT EXISTS tone_decodings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    raw_message TEXT NOT NULL,
    literal_meaning TEXT NOT NULL,
    detected_tone VARCHAR(100) NOT NULL,
    subtext_analysis TEXT NOT NULL,
    suggested_replies JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
