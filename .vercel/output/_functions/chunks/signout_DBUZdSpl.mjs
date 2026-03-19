import { c as createSupabaseClient } from './supabase_BOQfOlQl.mjs';

const prerender = false;
const POST = async ({ request, cookies, redirect }) => {
  const supabase = createSupabaseClient(request, cookies);
  await supabase.auth.signOut();
  return redirect("/login");
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
