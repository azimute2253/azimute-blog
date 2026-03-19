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
