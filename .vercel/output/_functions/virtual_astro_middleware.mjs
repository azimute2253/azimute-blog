import { a6 as defineMiddleware, af as sequence } from './chunks/sequence_CgQDxwp7.mjs';
import 'piccolore';
import 'clsx';
import { c as createSupabaseClient } from './chunks/supabase_BOQfOlQl.mjs';

const PROTECTED_ROUTES = ["/dashboard", "/research"];
const onRequest$1 = defineMiddleware(async (context, next) => {
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => context.url.pathname.startsWith(route)
  );
  if (!isProtectedRoute) {
    return next();
  }
  const supabase = createSupabaseClient(context.request, context.cookies);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) {
    const hasCookies = context.request.headers.get("Cookie")?.includes("sb-");
    return context.redirect(hasCookies ? "/login?expired=1" : "/login");
  }
  const { data: profile } = await supabase.from("user_profiles").select("role, display_name").eq("id", user.id).single();
  context.locals.user = user;
  context.locals.profile = profile;
  context.locals.supabase = supabase;
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
