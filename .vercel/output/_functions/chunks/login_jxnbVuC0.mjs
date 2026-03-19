import { c as createComponent } from './astro-component_DBSJ9d97.mjs';
import 'piccolore';
import { L as renderTemplate, x as maybeRenderHead } from './sequence_B7YpOH_f.mjs';
import { r as renderComponent } from './entrypoint_Ig64TEvT.mjs';
import { $ as $$Base } from './Base_C89P-jJ_.mjs';
import { c as createSupabaseClient } from './supabase_BOQfOlQl.mjs';

const prerender = false;
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Login;
  let error = "";
  let success = "";
  const expired = Astro2.url.searchParams.get("expired");
  if (expired === "1") {
    error = "Your session has expired. Please sign in again.";
  }
  if (Astro2.request.method === "POST") {
    const formData = await Astro2.request.formData();
    const email = formData.get("email");
    const password = formData.get("password");
    const supabase = createSupabaseClient(Astro2.request, Astro2.cookies);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      error = authError.message;
    } else {
      return Astro2.redirect("/dashboard");
    }
  }
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": "Login", "data-astro-cid-sgpqyurt": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="auth-page" data-astro-cid-sgpqyurt> <h1 data-astro-cid-sgpqyurt>Members Area</h1> <p class="auth-subtitle" data-astro-cid-sgpqyurt>Sign in to access research reports, projects, and documents.</p> ${error && renderTemplate`<div class="auth-error" data-astro-cid-sgpqyurt>${error}</div>`} ${success} <form method="POST" class="auth-form" data-astro-cid-sgpqyurt> <label for="email" data-astro-cid-sgpqyurt>Email</label> <input type="email" id="email" name="email" required autocomplete="email" data-astro-cid-sgpqyurt> <label for="password" data-astro-cid-sgpqyurt>Password</label> <input type="password" id="password" name="password" required autocomplete="current-password" minlength="6" data-astro-cid-sgpqyurt> <button type="submit" class="auth-btn" data-astro-cid-sgpqyurt>Sign In</button> </form> <p class="auth-alt" data-astro-cid-sgpqyurt>
Don't have an account? <a href="/signup" data-astro-cid-sgpqyurt>Sign up</a> </p> </div> ` })}`;
}, "/home/centr/Projects/azimute-blog/src/pages/login.astro", void 0);

const $$file = "/home/centr/Projects/azimute-blog/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
