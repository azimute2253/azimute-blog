import type { APIRoute } from 'astro';
import { getNexusLocals } from '../../lib/nexus/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const { supabase } = getNexusLocals(locals);

  // Test 1: Check if portfolio_summary view exists
  const { data: summary, error: summaryError } = await supabase
    .from('portfolio_summary')
    .select('*')
    .limit(10);

  // Test 2: Check auth
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // Test 3: Check asset_types table
  const { data: types, error: typesError } = await supabase
    .from('asset_types')
    .select('*')
    .limit(10);

  return new Response(
    JSON.stringify(
      {
        summary: { data: summary, error: summaryError },
        user: { data: user?.email, error: userError },
        types: { data: types, error: typesError },
      },
      null,
      2
    ),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
