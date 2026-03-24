import type { APIRoute } from 'astro';
import { createSupabaseClient } from '../../lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseClient(request, cookies);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (!user || authError) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Fetch asset types for this user (SELECT only — no auto-creation)
  const { data, error } = await supabase
    .from('asset_types')
    .select('id, name, target_pct, sort_order')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(data ?? []), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
