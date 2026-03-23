import type { APIRoute } from 'astro';
import { getPerformanceMetrics } from 'nexus-data';
import { getNexusLocals } from '../../../lib/nexus/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const { supabase } = getNexusLocals(locals);

  const result = await getPerformanceMetrics(supabase);

  if (result.error) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Empty portfolio is valid - return 200 with empty data
  if (!result.data || result.data.types.length === 0) {
    return new Response(
      JSON.stringify({
        total_value_brl: 0,
        types: [],
        max_deviation_type: '',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(JSON.stringify(result.data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
