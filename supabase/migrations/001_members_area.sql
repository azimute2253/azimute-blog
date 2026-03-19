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
