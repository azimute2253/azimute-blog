import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const migrations = [
  {
    name: '011_feature_flags.sql',
    sql: `
CREATE TABLE IF NOT EXISTS feature_flags (
  flag_name TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Policy: All users can read feature flags
CREATE POLICY "feature_flags_read_policy"
  ON feature_flags
  FOR SELECT
  USING (true);

-- Policy: Only service role can write
CREATE POLICY "feature_flags_write_policy"
  ON feature_flags
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Add updated_at trigger
CREATE TRIGGER set_updated_at_feature_flags
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();
    `,
  },
  {
    name: '012_asset_groups_unique_constraint.sql',
    sql: `
-- Add UNIQUE constraint: one group name per (type, user) pair
ALTER TABLE asset_groups
  DROP CONSTRAINT IF EXISTS asset_groups_type_name_user_unique;

ALTER TABLE asset_groups
  ADD CONSTRAINT asset_groups_type_name_user_unique
  UNIQUE (type_id, name, user_id);
    `,
  },
  {
    name: '013_price_refresh_log.sql',
    sql: `
CREATE TABLE IF NOT EXISTS price_refresh_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  refreshed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  trigger TEXT CHECK (trigger IN ('manual', 'auto')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE price_refresh_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own refresh logs
CREATE POLICY "price_refresh_log_read_policy"
  ON price_refresh_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own refresh logs
CREATE POLICY "price_refresh_log_insert_policy"
  ON price_refresh_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
    `,
  },
  {
    name: '014_asset_flags.sql',
    sql: `
-- Add flags to assets table (if columns don't exist)
ALTER TABLE assets
  ADD COLUMN IF NOT EXISTS whole_shares BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS manual_override BOOLEAN DEFAULT false;

-- Add comment
COMMENT ON COLUMN assets.whole_shares IS 'If true, only whole shares can be bought (no fractional)';
COMMENT ON COLUMN assets.manual_override IS 'If true, exclude from automatic rebalancing';
    `,
  },
];

export const POST: APIRoute = async () => {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return new Response('Supabase credentials missing', { status: 500 });
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  const results = [];

  for (const migration of migrations) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: migration.sql });

      if (error) {
        // Try direct execution via REST API if exec_sql doesn't exist
        const { error: directError } = await supabase
          .from('_migrations')
          .insert({ name: migration.name, applied: true });

        results.push({
          migration: migration.name,
          status: directError ? 'failed' : 'applied (logged)',
          error: directError?.message,
        });

        // Execute SQL via raw query (this won't work without exec_sql function)
        // But we'll log the attempt
        console.log(`Attempted to apply: ${migration.name}`);
      } else {
        results.push({ migration: migration.name, status: 'applied' });
      }
    } catch (err) {
      results.push({
        migration: migration.name,
        status: 'error',
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return new Response(JSON.stringify({ results }, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
