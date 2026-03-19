import { createServerClient, parseCookieHeader } from '@supabase/ssr';

function createSupabaseClient(request, cookies) {
  return createServerClient(
    "https://jyykieghjbopruobcmnt.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5eWtpZWdoamJvcHJ1b2JjbW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4ODI1NTgsImV4cCI6MjA4OTQ1ODU1OH0.LYXoIs99sOR6KC_rNwhKxywJCQm2-0TuBqiDNEOFwLw",
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("Cookie") ?? "");
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value, options }) => cookies.set(name, value, options)
          );
        }
      }
    }
  );
}

export { createSupabaseClient as c };
