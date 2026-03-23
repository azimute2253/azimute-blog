import type { APIRoute } from 'astro';
import { createSupabaseClient } from '../../lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseClient(request, cookies);

  // Test 1: Check auth
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (!user || userError) {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized',
        details: userError?.message,
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Test 2: Check if portfolio_summary view exists
  const { data: summary, error: summaryError } = await supabase
    .from('portfolio_summary')
    .select('*')
    .limit(10);

  // Test 3: Check asset_types table
  const { data: types, error: typesError } = await supabase
    .from('asset_types')
    .select('*')
    .limit(10);

  return new Response(
    JSON.stringify(
      {
        user: { email: user.email, id: user.id },
        summary: {
          data: summary,
          count: summary?.length || 0,
          error: summaryError?.message || null,
        },
        types: {
          data: types,
          count: types?.length || 0,
          error: typesError?.message || null,
        },
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
