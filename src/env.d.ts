/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    user: import("@supabase/supabase-js").User | null;
    profile: { role: string; display_name: string } | null;
    supabase: import("@supabase/supabase-js").SupabaseClient;
  }
}
