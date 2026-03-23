import { defineMiddleware } from "astro:middleware";
import { createSupabaseClient } from "./lib/supabase";

const PROTECTED_ROUTES = ["/dashboard", "/research", "/papers"];

export const onRequest = defineMiddleware(async (context, next) => {
  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    context.url.pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return next();
  }

  const supabase = createSupabaseClient(context.request, context.cookies);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user || error) {
    // Check if there are auth cookies — if so, session expired
    const hasCookies = context.request.headers.get("Cookie")?.includes("sb-");
    return context.redirect(hasCookies ? "/login?expired=1" : "/login");
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  context.locals.user = user;
  context.locals.profile = profile;
  context.locals.supabase = supabase;

  return next();
});
