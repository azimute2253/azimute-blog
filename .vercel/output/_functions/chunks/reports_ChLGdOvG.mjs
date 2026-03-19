import { c as createComponent } from './astro-component_DBSJ9d97.mjs';
import 'piccolore';
import { L as renderTemplate, x as maybeRenderHead, F as Fragment, a2 as addAttribute } from './sequence_B7YpOH_f.mjs';
import { r as renderComponent } from './entrypoint_Ig64TEvT.mjs';
import { r as renderScript } from './script_BYl2KK9X.mjs';
import { $ as $$Dashboard } from './Dashboard_CfLMb5LZ.mjs';

const prerender = false;
const $$Reports = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Reports;
  const supabase = Astro2.locals.supabase;
  const { data: reports, error } = await supabase.from("content_items").select("*").eq("type", "report").order("published_at", { ascending: false });
  const allTags = [...new Set((reports || []).flatMap((r) => r.tags || []))].sort();
  return renderTemplate`${renderComponent($$result, "Dashboard", $$Dashboard, { "title": "Reports", "data-astro-cid-aq3keu2l": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 data-astro-cid-aq3keu2l>Research Reports</h1> <p class="section-desc" data-astro-cid-aq3keu2l>Research reports on AI consciousness, 9 Neurons Theory, and related topics.</p> ${error ? renderTemplate`<div class="error-state" data-astro-cid-aq3keu2l> <p data-astro-cid-aq3keu2l>Failed to load reports. Please try again later.</p> </div>` : !reports || reports.length === 0 ? renderTemplate`<div class="empty-state" data-astro-cid-aq3keu2l> <svg class="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-astro-cid-aq3keu2l> <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" data-astro-cid-aq3keu2l></path> </svg> <p data-astro-cid-aq3keu2l>No reports available yet.</p> </div>` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-aq3keu2l": true }, { "default": async ($$result3) => renderTemplate`${allTags.length > 0 && renderTemplate`<div class="filter-bar" id="filter-bar" data-astro-cid-aq3keu2l> <button class="filter-tag active" data-tag="all" data-astro-cid-aq3keu2l>All</button> ${allTags.map((tag) => renderTemplate`<button class="filter-tag"${addAttribute(tag, "data-tag")} data-astro-cid-aq3keu2l>${tag}</button>`)} </div>`}<div class="content-grid" id="content-grid" data-astro-cid-aq3keu2l> ${reports.map((item) => renderTemplate`<div class="content-card"${addAttribute(JSON.stringify(item.tags || []), "data-tags")} data-astro-cid-aq3keu2l> <div class="card-icon" data-astro-cid-aq3keu2l> <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-astro-cid-aq3keu2l> <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" data-astro-cid-aq3keu2l></path> </svg> </div> <div class="card-body" data-astro-cid-aq3keu2l> <div class="card-header" data-astro-cid-aq3keu2l> <h2 class="card-title" data-astro-cid-aq3keu2l>${item.title}</h2> ${item.min_role === "premium" && renderTemplate`<span class="premium-badge" data-astro-cid-aq3keu2l>Premium</span>`} </div> ${item.description && renderTemplate`<p class="card-desc" data-astro-cid-aq3keu2l>${item.description}</p>`} <div class="card-meta" data-astro-cid-aq3keu2l> ${item.tags?.length > 0 && renderTemplate`<span class="card-tags" data-astro-cid-aq3keu2l> ${item.tags.map((tag) => renderTemplate`<span class="tag" data-astro-cid-aq3keu2l>${tag}</span>`)} </span>`} <span class="card-date" data-astro-cid-aq3keu2l> ${new Date(item.published_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })} </span> </div> ${item.storage_path && renderTemplate`<form method="POST"${addAttribute(`/api/download?path=${encodeURIComponent(item.storage_path)}&bucket=reports`, "action")} data-astro-cid-aq3keu2l> <button type="submit" class="download-btn" data-astro-cid-aq3keu2l> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-aq3keu2l> <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" data-astro-cid-aq3keu2l></path> </svg>
Download
</button> </form>`} </div> </div>`)} </div> ` })}`}` })} ${renderScript($$result, "/home/centr/Projects/azimute-blog/src/pages/dashboard/reports.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/centr/Projects/azimute-blog/src/pages/dashboard/reports.astro", void 0);

const $$file = "/home/centr/Projects/azimute-blog/src/pages/dashboard/reports.astro";
const $$url = "/dashboard/reports";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Reports,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
