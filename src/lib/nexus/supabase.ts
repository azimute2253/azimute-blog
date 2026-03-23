/**
 * Nexus Data — Supabase client wrapper
 *
 * Re-exports the shared azimute-blog Supabase client factory and provides
 * a convenience helper for Nexus Data pages that read user/supabase from
 * Astro.locals (already set by the auth middleware).
 *
 * Usage in .astro pages:
 *   const { supabase, user } = getNexusLocals(Astro.locals);
 */

export { createSupabaseClient } from "../supabase";

import type { SupabaseClient, User } from "@supabase/supabase-js";

interface NexusLocals {
  supabase: SupabaseClient;
  user: User;
}

/**
 * Extract the authenticated Supabase client and user from Astro.locals.
 * Only call this in pages behind the auth middleware (e.g. /dashboard/*).
 * Throws if locals are missing — which means the middleware didn't run.
 */
export function getNexusLocals(locals: App.Locals): NexusLocals {
  const { supabase, user } = locals;
  if (!supabase || !user) {
    throw new Error(
      "Nexus Data: missing supabase/user in Astro.locals. " +
        "Ensure this page is under a protected route (/dashboard/*)."
    );
  }
  return { supabase, user };
}
