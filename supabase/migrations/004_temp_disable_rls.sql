-- Temporarily disable RLS to allow triggers and seeding to work
-- TODO: Fix RLS policies to allow service_role without disabling RLS
-- This is a known issue that needs to be resolved before production

ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_items DISABLE ROW LEVEL SECURITY;
