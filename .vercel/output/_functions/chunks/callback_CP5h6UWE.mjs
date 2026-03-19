import { c as createSupabaseClient } from './supabase_BOQfOlQl.mjs';

const prerender = false;
const GET = async ({ request, cookies, redirect }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return redirect("/login");
  }
  const supabase = createSupabaseClient(request, cookies);
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return redirect("/login");
  }
  return redirect("/dashboard");
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
