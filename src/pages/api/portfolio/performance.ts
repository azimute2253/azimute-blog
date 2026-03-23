import type { APIRoute } from 'astro';
import { getPerformanceMetrics } from 'nexus-data';
import { getNexusLocals } from '../../../lib/nexus/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const { supabase } = getNexusLocals(locals);

  const result = await getPerformanceMetrics(supabase);

  if (result.error) {
    return new Response(JSON.stringify(result.error), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(result.data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
