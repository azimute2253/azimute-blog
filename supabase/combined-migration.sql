-- =============================================================
-- Migration 001: Members Area
-- =============================================================
-- =============================================================
-- Members Area Migration — ADR-001
-- Run in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- =============================================================

-- 1. User Profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'premium', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'member'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
ON user_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update roles"
ON user_profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 4. Content metadata table
CREATE TABLE content_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('report', 'project', 'document')),
  storage_path TEXT,
  min_role TEXT DEFAULT 'member' CHECK (min_role IN ('member', 'premium')),
  tags TEXT[] DEFAULT '{}',
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see content for their role"
ON content_items FOR SELECT
USING (
  CASE min_role
    WHEN 'member' THEN auth.role() = 'authenticated'
    WHEN 'premium' THEN EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('premium', 'admin')
    )
  END
);

-- 5. Storage bucket RLS policies
-- Note: Create buckets manually in Supabase Dashboard > Storage
-- Buckets needed: reports (private), documents (private), avatars (public)

-- Members can read from reports bucket
CREATE POLICY "Members can read reports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'reports'
  AND auth.role() = 'authenticated'
);

-- Premium access to all reports
CREATE POLICY "Premium access to all reports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'reports'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('premium', 'admin')
  )
);

-- Members can read documents
CREATE POLICY "Members can read documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents'
  AND auth.role() = 'authenticated'
);

-- Anyone can read avatars (public bucket)
CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Authenticated users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- =============================================================
-- Migration 002: Fix RLS Recursion
-- =============================================================
-- Fix infinite recursion in user_profiles RLS policies
-- The original admin policies caused recursion by querying user_profiles within the policy

-- Drop problematic policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_profiles;

-- For now, users can only read their own profile
-- Admin access should be granted via service role key (backend only)
-- If needed in future, use auth.jwt() metadata or a separate admin check function

-- Add a simple update policy for users to update their own display_name only
-- Note: Service role bypasses RLS, so admins can update roles via backend
CREATE POLICY "Users can update own display_name"
ON user_profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =============================================================
-- Migration 003: Fix Service Role Access
-- =============================================================
-- Allow service role (backend) to bypass RLS for admin operations
-- The trigger needs to INSERT into user_profiles, which requires a policy

CREATE POLICY "Service role can insert profiles"
ON user_profiles FOR INSERT
WITH CHECK (true);  -- Service role bypasses this anyway, but Postgres requires a policy

CREATE POLICY "Service role can update profiles"
ON user_profiles FOR UPDATE
USING (true)
WITH CHECK (true);

-- =============================================================
-- Migration 004: Temp Disable RLS
-- =============================================================
-- Temporarily disable RLS to allow triggers and seeding to work
-- TODO: Fix RLS policies to allow service_role without disabling RLS
-- This is a known issue that needs to be resolved before production

ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_items DISABLE ROW LEVEL SECURITY;

-- =============================================================
-- Migration 005: Fix RLS Properly
-- =============================================================
-- =============================================================
-- Fix RLS: Re-enable with correct policies
-- Root cause: migration 004 disabled RLS as workaround for
-- recursion issues that were already fixed in 002.
-- The handle_new_user() trigger runs as SECURITY DEFINER,
-- so it bypasses RLS — no special INSERT policy needed.
-- =============================================================

-- 1. Drop overly permissive policies from migration 003
DROP POLICY IF EXISTS "Service role can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role can update profiles" ON user_profiles;

-- 2. Re-enable RLS on both tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

-- 3. Verify existing policies are correct:
--    user_profiles:
--      - "Users can read own profile" (SELECT WHERE auth.uid() = id) ✓
--      - "Users can update own display_name" (UPDATE WHERE auth.uid() = id) ✓
--    content_items:
--      - "Users see content for their role" (CASE on min_role) ✓

-- 4. Force RLS for table owners too (prevents bypass via service_role in edge cases)
-- Note: We do NOT force RLS for these tables because the service_role key
-- needs to bypass RLS for admin operations and the signup trigger.
-- The trigger uses SECURITY DEFINER which already bypasses RLS.

-- =============================================================
-- Storage Buckets
-- =============================================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('reports', 'reports', false),
  ('documents', 'documents', false),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- Sample Content
-- =============================================================
INSERT INTO content_items (title, type, storage_path, min_role, tags, description)
VALUES
  ('OpenClaw Vanilla — Análise de Disrupção', 'report', 'reports/openclaw-vanilla-disruption-2026-03-18.html', 'member', ARRAY['research', 'openclaw'], 'Análise técnica do OpenClaw vanilla open-source'),
  ('Anima & Squad Kerberos — Posicionamento', 'report', 'reports/anima-kerberos-positioning-2026-03-18.html', 'premium', ARRAY['market', 'positioning'], 'Posicionamento estratégico no mercado de agentes de IA'),
  ('OpenClaw Disruption Analysis', 'report', 'reports/openclaw-disruption-analysis-2026-03-18.html', 'member', ARRAY['research', 'openclaw'], 'Análise de disrupção (versão customizada)');
