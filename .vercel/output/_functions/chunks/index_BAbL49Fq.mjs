import { c as createComponent } from './astro-component_DBSJ9d97.mjs';
import 'piccolore';
import { L as renderTemplate, x as maybeRenderHead } from './sequence_B7YpOH_f.mjs';
import { r as renderComponent } from './entrypoint_Ig64TEvT.mjs';
import { $ as $$Dashboard } from './Dashboard_CfLMb5LZ.mjs';

const ROLE_HIERARCHY = {
  member: 1,
  premium: 2,
  admin: 3
};
function hasAccess(userRole, requiredRole) {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  Astro2.locals.user;
  const profile = Astro2.locals.profile;
  const supabase = Astro2.locals.supabase;
  const role = profile?.role || "member";
  const isPremium = hasAccess(role, "premium");
  const { count: reportCount } = await supabase.from("content_items").select("*", { count: "exact", head: true }).eq("type", "report");
  const { count: projectCount } = await supabase.from("content_items").select("*", { count: "exact", head: true }).eq("type", "project");
  const { count: documentCount } = await supabase.from("content_items").select("*", { count: "exact", head: true }).eq("type", "document");
  return renderTemplate`${renderComponent($$result, "Dashboard", $$Dashboard, { "title": "Dashboard", "data-astro-cid-y55gmoyq": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 data-astro-cid-y55gmoyq>Welcome, ${profile?.display_name || "Member"}</h1> <p class="dash-subtitle" data-astro-cid-y55gmoyq>Your access level: <strong class="role-badge" data-astro-cid-y55gmoyq>${role}</strong></p> <div class="dash-grid" data-astro-cid-y55gmoyq> <a href="/dashboard/reports" class="dash-card" data-astro-cid-y55gmoyq> <span class="dash-card-count" data-astro-cid-y55gmoyq>${reportCount ?? 0}</span> <span class="dash-card-label" data-astro-cid-y55gmoyq>Reports</span> </a> <a href="/dashboard/projects" class="dash-card" data-astro-cid-y55gmoyq> <span class="dash-card-count" data-astro-cid-y55gmoyq>${projectCount ?? 0}</span> <span class="dash-card-label" data-astro-cid-y55gmoyq>Projects</span> </a> <a href="/dashboard/documents" class="dash-card" data-astro-cid-y55gmoyq> <span class="dash-card-count" data-astro-cid-y55gmoyq>${documentCount ?? 0}</span> <span class="dash-card-label" data-astro-cid-y55gmoyq>Documents</span> </a> </div> ${!isPremium && renderTemplate`<div class="upgrade-notice" data-astro-cid-y55gmoyq> <p data-astro-cid-y55gmoyq>You're on the <strong data-astro-cid-y55gmoyq>member</strong> tier. Some content requires <strong data-astro-cid-y55gmoyq>premium</strong> access.</p> </div>`}` })}`;
}, "/home/centr/Projects/azimute-blog/src/pages/dashboard/index.astro", void 0);

const $$file = "/home/centr/Projects/azimute-blog/src/pages/dashboard/index.astro";
const $$url = "/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
