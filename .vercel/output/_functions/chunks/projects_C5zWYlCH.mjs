import { c as createComponent } from './astro-component_DBSJ9d97.mjs';
import 'piccolore';
import { L as renderTemplate, x as maybeRenderHead, F as Fragment, a2 as addAttribute } from './sequence_B7YpOH_f.mjs';
import { r as renderComponent } from './entrypoint_Ig64TEvT.mjs';
import { r as renderScript } from './script_BYl2KK9X.mjs';
import { $ as $$Dashboard } from './Dashboard_CfLMb5LZ.mjs';

const prerender = false;
const $$Projects = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Projects;
  const supabase = Astro2.locals.supabase;
  const { data: projects, error } = await supabase.from("content_items").select("*").eq("type", "project").order("published_at", { ascending: false });
  const allTags = [...new Set((projects || []).flatMap((r) => r.tags || []))].sort();
  return renderTemplate`${renderComponent($$result, "Dashboard", $$Dashboard, { "title": "Projects", "data-astro-cid-uregi5bz": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 data-astro-cid-uregi5bz>Projects</h1> <p class="section-desc" data-astro-cid-uregi5bz>Ongoing research projects and initiatives.</p> ${error ? renderTemplate`<div class="error-state" data-astro-cid-uregi5bz> <p data-astro-cid-uregi5bz>Failed to load projects. Please try again later.</p> </div>` : !projects || projects.length === 0 ? renderTemplate`<div class="empty-state" data-astro-cid-uregi5bz> <svg class="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-astro-cid-uregi5bz> <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" data-astro-cid-uregi5bz></path> </svg> <p data-astro-cid-uregi5bz>No projects available yet.</p> </div>` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-uregi5bz": true }, { "default": async ($$result3) => renderTemplate`${allTags.length > 0 && renderTemplate`<div class="filter-bar" id="filter-bar" data-astro-cid-uregi5bz> <button class="filter-tag active" data-tag="all" data-astro-cid-uregi5bz>All</button> ${allTags.map((tag) => renderTemplate`<button class="filter-tag"${addAttribute(tag, "data-tag")} data-astro-cid-uregi5bz>${tag}</button>`)} </div>`}<div class="content-grid" id="content-grid" data-astro-cid-uregi5bz> ${projects.map((item) => renderTemplate`<div class="content-card"${addAttribute(JSON.stringify(item.tags || []), "data-tags")} data-astro-cid-uregi5bz> <div class="card-icon" data-astro-cid-uregi5bz> <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-astro-cid-uregi5bz> <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" data-astro-cid-uregi5bz></path> </svg> </div> <div class="card-body" data-astro-cid-uregi5bz> <div class="card-header" data-astro-cid-uregi5bz> <h2 class="card-title" data-astro-cid-uregi5bz>${item.title}</h2> ${item.min_role === "premium" && renderTemplate`<span class="premium-badge" data-astro-cid-uregi5bz>Premium</span>`} </div> ${item.description && renderTemplate`<p class="card-desc" data-astro-cid-uregi5bz>${item.description}</p>`} <div class="card-meta" data-astro-cid-uregi5bz> ${item.tags?.length > 0 && renderTemplate`<span class="card-tags" data-astro-cid-uregi5bz> ${item.tags.map((tag) => renderTemplate`<span class="tag" data-astro-cid-uregi5bz>${tag}</span>`)} </span>`} <span class="card-date" data-astro-cid-uregi5bz> ${new Date(item.published_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })} </span> </div> ${item.storage_path && renderTemplate`<form method="POST"${addAttribute(`/api/download?path=${encodeURIComponent(item.storage_path)}&bucket=documents`, "action")} data-astro-cid-uregi5bz> <button type="submit" class="download-btn" data-astro-cid-uregi5bz> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-uregi5bz> <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" data-astro-cid-uregi5bz></path> </svg>
Download
</button> </form>`} </div> </div>`)} </div> ` })}`}` })} ${renderScript($$result, "/home/centr/Projects/azimute-blog/src/pages/dashboard/projects.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/centr/Projects/azimute-blog/src/pages/dashboard/projects.astro", void 0);

const $$file = "/home/centr/Projects/azimute-blog/src/pages/dashboard/projects.astro";
const $$url = "/dashboard/projects";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Projects,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
