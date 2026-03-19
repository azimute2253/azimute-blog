-- Allow service role (backend) to bypass RLS for admin operations
-- The trigger needs to INSERT into user_profiles, which requires a policy

CREATE POLICY "Service role can insert profiles"
ON user_profiles FOR INSERT
WITH CHECK (true);  -- Service role bypasses this anyway, but Postgres requires a policy

CREATE POLICY "Service role can update profiles"
ON user_profiles FOR UPDATE
USING (true)
WITH CHECK (true);
