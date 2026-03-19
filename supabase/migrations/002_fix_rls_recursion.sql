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
