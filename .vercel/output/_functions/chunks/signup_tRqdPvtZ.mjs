import { c as createComponent } from './astro-component_DBSJ9d97.mjs';
import 'piccolore';
import { L as renderTemplate, x as maybeRenderHead } from './sequence_B7YpOH_f.mjs';
import { r as renderComponent } from './entrypoint_Ig64TEvT.mjs';
import { $ as $$Base } from './Base_C89P-jJ_.mjs';
import { c as createSupabaseClient } from './supabase_BOQfOlQl.mjs';

const prerender = false;
const $$Signup = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Signup;
  let error = "";
  let success = "";
  if (Astro2.request.method === "POST") {
    const formData = await Astro2.request.formData();
    const email = formData.get("email");
    const password = formData.get("password");
    const displayName = formData.get("display_name");
    const supabase = createSupabaseClient(Astro2.request, Astro2.cookies);
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName }
      }
    });
    if (authError) {
      error = authError.message;
    } else {
      success = "Check your email for a confirmation link.";
    }
  }
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": "Sign Up", "data-astro-cid-sgjovbj7": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="auth-page" data-astro-cid-sgjovbj7> <h1 data-astro-cid-sgjovbj7>Create Account</h1> <p class="auth-subtitle" data-astro-cid-sgjovbj7>Join to access research reports, projects, and documents.</p> ${error && renderTemplate`<div class="auth-error" data-astro-cid-sgjovbj7>${error}</div>`} ${success && renderTemplate`<div class="auth-success" data-astro-cid-sgjovbj7>${success}</div>`} <form method="POST" class="auth-form" data-astro-cid-sgjovbj7> <label for="display_name" data-astro-cid-sgjovbj7>Name</label> <input type="text" id="display_name" name="display_name" required autocomplete="name" data-astro-cid-sgjovbj7> <label for="email" data-astro-cid-sgjovbj7>Email</label> <input type="email" id="email" name="email" required autocomplete="email" data-astro-cid-sgjovbj7> <label for="password" data-astro-cid-sgjovbj7>Password</label> <input type="password" id="password" name="password" required autocomplete="new-password" minlength="6" data-astro-cid-sgjovbj7> <button type="submit" class="auth-btn" data-astro-cid-sgjovbj7>Create Account</button> </form> <p class="auth-alt" data-astro-cid-sgjovbj7>
Already have an account? <a href="/login" data-astro-cid-sgjovbj7>Sign in</a> </p> </div> ` })}`;
}, "/home/centr/Projects/azimute-blog/src/pages/signup.astro", void 0);

const $$file = "/home/centr/Projects/azimute-blog/src/pages/signup.astro";
const $$url = "/signup";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Signup,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
