import type { APIRoute } from 'astro';
import { createSupabaseClient } from '../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseClient(request, cookies);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (!user || authError) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { group_id, ticker, quantity } = body;

    if (!group_id || !ticker || quantity === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: group_id, ticker, quantity' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if ticker already exists for this user
    const { data: existing } = await supabase
      .from('assets')
      .select('id')
      .eq('user_id', user.id)
      .eq('ticker', ticker.toUpperCase())
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ error: `Ativo ${ticker} já existe na sua carteira` }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create the asset
    const { data, error } = await supabase
      .from('assets')
      .insert({
        group_id,
        ticker: ticker.toUpperCase(),
        quantity: parseFloat(quantity),
        user_id: user.id,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to create asset',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
