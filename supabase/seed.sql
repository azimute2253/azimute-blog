-- =============================================================
-- Seed Data — Local Development
-- Runs automatically on `supabase reset`
-- =============================================================

-- NOTE: You can manually create test users in Supabase Studio:
-- http://localhost:54323 → Authentication → Add user

-- Sample content (no storage_path for now, just metadata)
INSERT INTO content_items (title, description, type, min_role, tags, published_at)
VALUES
  ('Introduction to 9 Neurons Theory', 'Overview of the 9 Neurons Framework for AI consciousness modeling', 'report', 'member', ARRAY['9-neurons', 'theory', 'fundamentals'], '2026-01-15'),
  ('Prediction Error and Agency', 'How prediction error serves as the axis of agency in AI systems', 'report', 'member', ARRAY['prediction', 'agency', 'consciousness'], '2026-02-10'),
  ('Advanced Attention Mechanisms', 'Deep dive into attention patterns in transformer architectures', 'report', 'premium', ARRAY['attention', 'transformers', 'technical'], '2026-03-01'),
  ('OpenClaw Architecture', 'Technical documentation of the OpenClaw AI assistant platform', 'document', 'member', ARRAY['openclaw', 'architecture', 'implementation'], '2026-02-20'),
  ('AIOX Framework Guide', 'Complete guide to the AIOX agent orchestration system', 'document', 'premium', ARRAY['aiox', 'agents', 'development'], '2026-03-10'),
  ('Azimute Blog Project', 'Case study: Building a members area with Astro and Supabase', 'project', 'member', ARRAY['astro', 'supabase', 'tutorial'], '2026-03-15')
ON CONFLICT DO NOTHING;
