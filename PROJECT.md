# Azimute Blog

**ID:** azimute-blog
**Status:** active
**Type:** application
**Created:** 2026-02-20
**Owner:** azimute

**Description:**
Personal/professional blog for the 9 Neurons Theory and AI consciousness content. Published at https://azimute.cc

**Tech Stack:** Astro 6, TypeScript, Node.js 22+, Supabase
**Deploy:** Vercel (auto-deploy from master branch)

---

## Scope

Hybrid blog + members area:

**Public:**
- **Content collections:** Wanders (essays on AI, consciousness, 9 Neurons)
- **SEO optimized:** Sitemap, robots.txt, JSON-LD structured data, canonical URLs, OG images
- **Responsive design:** Mobile-first, clean typography
- **Performance:** SSG for public pages, SSR for protected content

**Members Area (protected):**
- **Authentication:** Supabase Auth (email/password + magic link)
- **Dashboard:** Overview, Library (Papers/Projects/Documents/Reports), Portfolio
- **Content:** Academic papers, research reports, project docs (HTML files served from `public/`)
- **Portfolio Dashboard:** nexus-data integration (asset management, performance tracking)

## Authentication & Security

**Auth Provider:** Supabase (jyykieghjbopruobcmnt.supabase.co)

**Protected Routes** (via middleware):
- `/dashboard/*` — All dashboard pages
- `/papers/*` — Academic papers (HTML served from `public/papers/`)
- `/research/*` — Research reports (HTML served from `public/research/`)

**Middleware:** `src/middleware.ts`
- Checks `PROTECTED_ROUTES` against current path
- Validates Supabase session
- Redirects to `/login` if unauthenticated
- Injects `user`, `profile`, `supabase` into `Astro.locals`

**Auth Pages:**
- `/login` — Email/password or magic link
- `/signup` — New account registration
- `/reset-password` — Password reset request
- `/update-password` — Password reset form (from email link)
- `/email-confirmed` — Post-signup confirmation

**SSR Mode:** `output: "server"` in `astro.config.mjs`
- All pages SSR by default
- Public pages opt-in with `export const prerender = true`
- Allows runtime session validation

## Filesystem

```
src/
├── pages/
│   ├── dashboard/           # Protected members area
│   │   ├── index.astro      # Dashboard overview
│   │   ├── library.astro    # Content hub (4 categories)
│   │   ├── papers.astro     # Academic papers list
│   │   ├── reports.astro    # Research reports list
│   │   ├── projects.astro   # Projects list
│   │   ├── documents.astro  # Documents list
│   │   ├── portfolio/       # Portfolio dashboard (nexus-data)
│   │   └── assets/          # Asset management
│   ├── papers/
│   │   └── [slug].astro     # Paper reader (serves public/papers/*.html)
│   ├── research/
│   │   └── [slug].astro     # Research reader (serves public/research/*.html)
│   ├── wander/
│   │   └── [date].astro     # Blog posts (prerendered)
│   ├── api/                 # API endpoints (SSR)
│   │   ├── auth/            # Supabase auth callbacks
│   │   ├── portfolio/       # Portfolio data endpoints
│   │   ├── asset-types.ts   # Asset types CRUD
│   │   └── assets.ts        # Asset CRUD
│   ├── login.astro          # Login page
│   ├── signup.astro         # Signup page
│   └── index.astro          # Homepage (prerendered)
├── layouts/
│   ├── Base.astro           # Public layout
│   └── Dashboard.astro      # Members area layout (collapsible sidebar)
├── components/
│   ├── NexusDashboard.tsx   # Portfolio dashboard wrapper (React)
│   └── AssetForm.tsx        # Asset registration form (React)
├── content/                 # Content collections
│   ├── wanders/             # English essays (prerendered)
│   └── wanders-pt/          # Portuguese essays (prerendered)
├── middleware.ts            # Auth middleware
├── lib/
│   ├── supabase.ts          # Supabase client factory
│   └── i18n.ts              # Translations (en/pt)
└── styles/                  # Global styles

public/
├── papers/                  # Academic papers (HTML)
├── research/                # Research reports (HTML)
└── ...                      # Static assets

scripts/
├── deploy.sh                # Local deploy script
└── tweet*.cjs               # Twitter posting scripts
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| astro | ^6.0.4 | SSG/SSR framework |
| @astrojs/sitemap | ^3.7.1 | XML sitemap |
| @astrojs/vercel | ^8.4.1 | Vercel adapter (SSR) |
| @astrojs/tailwind | ^6.0.2 | Tailwind CSS |
| @astrojs/react | ^4.0.2 | React integration |
| @supabase/supabase-js | ^2.99.3 | Supabase client |
| react | ^19.2.4 | React library |
| recharts | ^3.8.0 | Portfolio charts |
| nexus-data | git+https://github.com/azimute2253/nexus-data.git | Portfolio data layer |

## Config

- `astro.config.mjs` — Astro config (output: "server", Vercel adapter, React, Tailwind)
- `tsconfig.json` — TypeScript config
- `tailwind.config.mjs` — Tailwind CSS config (v3, azimute.cc design system)
- `.npmrc` — `legacy-peer-deps=true` (for nexus-data compatibility)
- `src/env.d.ts` — Astro + Supabase types

**Environment Variables:**
- `PUBLIC_SUPABASE_URL` — Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only)

## Database (Supabase)

**Tables:**
- `user_profiles` — User metadata (role, display_name)
- `content_items` — Papers, reports, projects, documents
- `asset_types` — Portfolio asset types (Ações, FIIs, Renda Fixa)
- `asset_groups` — Asset groupings within types
- `assets` — User portfolio assets
- `price_cache` — Historical price data
- `exchange_rates` — Currency conversion rates

**RLS (Row-Level Security):**
- All tables enforce `user_id` filtering
- Users only see their own data
- `content_items` filtered by `min_role` (free/member/premium)

## UI/UX Features

**Collapsible Sidebar** (Dashboard layout):
- Expanded: 240px width (icons + text)
- Collapsed: 70px width (icons only)
- Toggle button repositions below logo when collapsed
- State persists in `localStorage` (`azimute-sidebar-collapsed`)
- Smooth transitions (0.3s ease)

**Design System** (CSS custom properties):
- Colors: `--az-void`, `--az-deep`, `--az-surface`, `--az-text`, `--az-compass`
- Fonts: Space Grotesk (display), Source Serif 4 (body), JetBrains Mono (code)
- Max-width: `--az-content-width: 680px` (public), 960px (dashboard)

**Portfolio Dashboard** (nexus-data):
- Empty state: "Cadastrar Ativo" button
- Asset registration form: type → group → ticker → quantity
- Auto-creates default types (Ações, FIIs, Renda Fixa) on first access
- Auto-creates "Principal" group per type

## Rules

1. **Content-first** — No unnecessary JS, prioritize performance
2. **SEO mandatory** — Every post must have OG image, canonical URL, structured data
3. **Bilingual consistency** — English and Portuguese versions for core content
4. **Build before deploy** — `npm run build` must succeed locally
5. **Clean URLs** — No .html extensions, use Astro's default routing
6. **Static assets in public/** — Keep src/ for source code only
7. **Auth required for members content** — All `/dashboard/*`, `/papers/*`, `/research/*` routes protected
8. **SSR for auth** — Never prerender protected routes (`export const prerender = false`)
9. **Public pages must opt-in to prerender** — `export const prerender = true` on public routes
10. **Design consistency** — Use azimute.cc design system variables

## Current Status

- **Live:** https://azimute.cc
- **Platform:** Vercel (auto-deploy from master)
- **Auth:** Supabase (working, tested with lk.adures@gmail.com)
- **Members Area:** Dashboard, Library, Portfolio (deployed)
- **Public Blog:** Wanders published (prerendered static)
- **Protected Content:** 24 academic papers + 2 market research reports

## Changelog

**2026-03-23:**
- Members area UX improvements (collapsible sidebar, unified Library tab)
- SSR authentication protection for `/dashboard/*`, `/papers/*`, `/research/*`
- Portfolio dashboard integration (nexus-data package via Git URL)
- Asset registration UI (/dashboard/assets/new)
- API endpoints: asset-types, asset-groups, assets, portfolio/performance

**2026-03-18:**
- Supabase authentication integration (signup, login, magic link, password reset)
- Dashboard layout with members-only content (papers, reports, projects, documents)
- Content items database with RLS (role-based access)

**2026-03-10 (f7afbcc):**
- Local deploy script added (build + push gh-pages)

**2026-03-09 (38bef25):**
- GitHub Actions workflow removed (switched to local deploy)

**2026-03-08 (2c70e62):**
- GitHub Actions deploy workflow added (auto build+deploy on push to master)

**2026-03-07 (31ef456):**
- Default OG image added (1200x630, SEO compliance)

**2026-03-06 (5673e43):**
- SEO implementation (sitemap, robots.txt, JSON-LD, canonical URLs, og:image)

## Twitter Integration

**Scripts** (in `scripts/`):
- `tweet-thread.cjs` — Post thread from JSON array
- `tweet.cjs` — Post single tweet
- `tweet-delete.cjs` — Delete tweet by ID
- `validate-posts.cjs` — Show posted vs pending wanders

**State file**: `data/twitter-posted.json` — source of truth for what's been posted

**Credentials**: `~/.openclaw/credentials/twitter.env` (set `TWITTER_ENV` env var)

**Rules**:
- Content is ALWAYS in English (from `wanders/`, not `wanders-pt/`)
- Link format: `azimute.cc/wander/YYYY-MM-DD`
- Always update `data/twitter-posted.json` after posting
- Run `validate-posts.cjs` to check state before posting

## nexus-data Integration

**Package:** git+https://github.com/azimute2253/nexus-data.git

**Installation:**
```bash
npm install git+https://github.com/azimute2253/nexus-data.git --legacy-peer-deps
```

**Components:**
- `NexusDashboard` — Full portfolio dashboard (React component)
- `AssetForm` — Asset registration form

**Data Layer:**
- Supabase client shared between azimute-blog and nexus-data
- nexus-data uses vanilla Supabase client (no SSR auth)
- azimute-blog handles SSR auth via middleware
- API routes create Supabase client directly (middleware doesn't run for `/api/*`)

**Status:**
- 31/31 user stories complete at 12/12 QA
- Fully deployed and verified in production
- Empty portfolio state working correctly (shows "Cadastrar Ativo" button)
