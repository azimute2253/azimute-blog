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

  // Fetch asset types for this user
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

  // If no types exist, create defaults
  if (!data || data.length === 0) {
    const defaultTypes = [
      { name: 'Ações', target_pct: 40, sort_order: 1, user_id: user.id },
      { name: 'FIIs', target_pct: 30, sort_order: 2, user_id: user.id },
      { name: 'Renda Fixa', target_pct: 30, sort_order: 3, user_id: user.id },
    ];

    const { data: created, error: createError } = await supabase
      .from('asset_types')
      .insert(defaultTypes)
      .select('id, name, target_pct, sort_order');

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Also create default groups for each type
    if (created && created.length > 0) {
      const defaultGroups = created.map((type) => ({
        type_id: type.id,
        name: 'Principal',
        target_pct: 100,
        user_id: user.id,
      }));

      await supabase.from('asset_groups').insert(defaultGroups);
    }

    return new Response(JSON.stringify(created || []), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
