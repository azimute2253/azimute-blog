import { c as createComponent } from './astro-component_DBSJ9d97.mjs';
import 'piccolore';
import { b4 as renderHead, a2 as addAttribute, L as renderTemplate, b5 as renderSlot } from './sequence_B7YpOH_f.mjs';
import 'clsx';
/* empty css                 */

const $$Dashboard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Dashboard;
  const { title } = Astro2.props;
  const siteTitle = `${title} — Azimute`;
  const user = Astro2.locals.user;
  const profile = Astro2.locals.profile;
  const currentPath = Astro2.url.pathname;
  const navItems = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/reports", label: "Reports" },
    { href: "/dashboard/projects", label: "Projects" },
    { href: "/dashboard/documents", label: "Documents" }
  ];
  return renderTemplate`<html lang="en" data-astro-cid-flaloh7p> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${siteTitle}</title><meta name="robots" content="noindex, nofollow"><link rel="icon" href="/favicon.svg" type="image/svg+xml">${renderHead()}</head> <body data-astro-cid-flaloh7p> <div class="dashboard-wrapper" data-astro-cid-flaloh7p> <aside class="dashboard-sidebar" data-astro-cid-flaloh7p> <a href="/" class="sidebar-logo" data-astro-cid-flaloh7p> <svg class="compass-icon" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" data-astro-cid-flaloh7p> <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3" data-astro-cid-flaloh7p></circle> <polygon points="12,3 10.8,12.5 12,11.5 13.2,12.5" fill="var(--az-compass)" transform="rotate(45, 12, 12)" data-astro-cid-flaloh7p></polygon> <polygon points="12,21 10.8,11.5 12,12.5 13.2,11.5" fill="#8a6d3b" transform="rotate(45, 12, 12)" data-astro-cid-flaloh7p></polygon> <circle cx="12" cy="12" r="1.2" fill="var(--az-compass)" data-astro-cid-flaloh7p></circle> </svg>
Azimute
</a> <nav class="sidebar-nav" data-astro-cid-flaloh7p> ${navItems.map((item) => renderTemplate`<a${addAttribute(item.href, "href")}${addAttribute(["sidebar-link", { active: currentPath === item.href || item.href !== "/dashboard" && currentPath.startsWith(item.href) }], "class:list")} data-astro-cid-flaloh7p> ${item.label} </a>`)} </nav> <div class="sidebar-user" data-astro-cid-flaloh7p> <span class="sidebar-user-name" data-astro-cid-flaloh7p>${profile?.display_name || user?.email}</span> <span class="sidebar-user-role" data-astro-cid-flaloh7p>${profile?.role || "member"}</span> <form method="POST" action="/api/auth/signout" data-astro-cid-flaloh7p> <button type="submit" class="sidebar-signout" data-astro-cid-flaloh7p>Sign Out</button> </form> </div> </aside> <main class="dashboard-main" data-astro-cid-flaloh7p> ${renderSlot($$result, $$slots["default"])} </main> </div></body></html>`;
}, "/home/centr/Projects/azimute-blog/src/layouts/Dashboard.astro", void 0);

export { $$Dashboard as $ };
