# ADR-001: Members-Only Area with Login and Role-Based Access

**Status:** Proposed
**Date:** 2026-03-18
**Author:** Aria (@architect)
**Project:** azimute-blog (https://azimute.cc)

---

## Context

The Azimute blog is currently a **pure static site** (Astro 6 SSG) deployed to GitHub Pages. It serves bilingual content (EN/PT) with zero runtime dependencies — no server, no database, no client-side JavaScript beyond a language toggle.

A new requirement has emerged: a **members-only area** with login, role-based access control, and protected content (research reports, projects, documents). The public blog must remain unchanged — fast, static, SEO-optimized.

### Current Architecture Snapshot

| Aspect | Current State |
|--------|--------------|
| Framework | Astro 6.0.4 (`output: 'static'`) |
| Hosting | GitHub Pages (gh-pages branch, manual deploy) |
| Dependencies | 2 (`astro`, `@astrojs/sitemap`) |
| Content | Markdown collections (wanders EN + PT) |
| Auth | None |
| Middleware | None |
| Client JS | ~20 lines (language toggle only) |
| Pages | 7 routes x 2 locales + RSS feed |

### Requirements

1. Login/signup page at `/login`
2. Protected dashboard at `/dashboard`
3. Role-based access: `member` and `premium` tiers
4. Protected content: research reports (HTML), projects, documents
5. Public blog remains SSG (no performance regression)
6. Deploy on Vercel
7. Minimize backend complexity

---

## Decision

### 1. Auth Provider: Supabase Auth

**Chosen:** Supabase (Auth + Database + Storage)
**Rejected:** Clerk, Auth.js, Better Auth

#### Evaluation Matrix

| Criteria | Supabase Auth | Clerk | Better Auth | Auth.js |
|----------|:------------:|:-----:|:-----------:|:-------:|
| Official Astro SDK | No (manual) | Yes | Yes | No |
| Prebuilt UI components | No | Yes | No | No |
| Self-hosted data | Supabase cloud | Clerk cloud | Your DB | Your DB |
| Database included | Yes (Postgres) | No | No | No |
| File storage included | Yes (S3-compatible) | No | No | No |
| RLS (row-level security) | Yes (native) | No | No | No |
| Role-based access | Excellent (DB-level) | Excellent (built-in) | Good (plugins) | Manual |
| Free tier MAUs | 50,000 | 50,000 | Unlimited | Unlimited |
| Setup complexity | Medium | Low | Medium | High |
| Vendor lock-in | Medium | High | Low | Low |
| All-in-one platform | Yes | No | No | No |

#### Rationale

Supabase wins because it provides **three services in one platform** that this feature needs:

1. **Auth** — Email/password, magic links, OAuth (Google, GitHub). 50K MAU free tier.
2. **Database** — Postgres for user profiles, roles, content metadata. RLS for row-level access control.
3. **Storage** — S3-compatible bucket for research reports, documents, files. Access controlled by RLS policies tied to auth.

Clerk has better DX (prebuilt components, drop-in integration) but **doesn't solve storage or database** — you'd need Supabase or another service anyway. Adding Clerk + Supabase creates two auth systems to maintain.

Better Auth is excellent for self-hosted but requires **managing your own database** and has no file storage — again needing a second service.

**The deciding factor**: protected content includes research reports and documents that need secure storage with role-based download access. Supabase Storage with RLS policies on bucket access is the most integrated solution.

#### Cost Projection

| Service | Free Tier | When to Upgrade |
|---------|-----------|-----------------|
| Supabase | 50K MAUs, 500 MB DB, 1 GB storage, 2 GB egress | >50K users or >1 GB files |
| Supabase Pro | $25/month | Production with SLA needs |
| Vercel Hobby | Free (150K function invocations) | If traffic exceeds limits |
| Vercel Pro | $20/month | Commercial use or higher limits |

**Estimated cost for launch: $0/month** (free tiers cover a members area with <1000 users easily).

---

### 2. Rendering Strategy: Static + Selective SSR

**Chosen:** `output: 'static'` with `prerender = false` on protected routes

Since Astro 5+, the old `output: 'hybrid'` is gone. Instead, the default `static` mode supports opting individual routes into SSR via `export const prerender = false`.

#### Route Classification

| Route | Rendering | Why |
|-------|-----------|-----|
| `/` | SSG (prerendered) | Public blog index, no change |
| `/about` | SSG | Public, no change |
| `/wander/[date]` | SSG | Public posts, no change |
| `/pt/*` | SSG | Portuguese variants, no change |
| `/feed.xml` | SSG | RSS feed, no change |
| `/login` | SSR | Auth forms, session handling |
| `/signup` | SSR | Registration flow |
| `/dashboard` | SSR | Protected, role-checked |
| `/dashboard/reports` | SSR | Protected content listing |
| `/dashboard/projects` | SSR | Protected content listing |
| `/dashboard/documents` | SSR | Protected content listing |
| `/api/auth/callback` | SSR | OAuth callback handler |
| `/api/auth/signout` | SSR | Session cleanup |

This preserves **100% of current performance** — every existing page remains statically generated. Only new protected routes run server-side.

#### Configuration Change

```javascript
// astro.config.mjs (updated)
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://azimute.cc',
  output: 'static',          // Keep static as default
  adapter: vercel(),          // NEW: Vercel adapter for SSR routes
  integrations: [sitemap()],
  build: { format: 'directory' },
  markdown: { shikiConfig: { theme: 'github-dark' } },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pt'],
    routing: { prefixDefaultLocale: false }
  }
});
```

Each protected page opts into SSR:

```astro
---
// src/pages/dashboard/index.astro
export const prerender = false;

const user = Astro.locals.user;
if (!user) return Astro.redirect('/login');
---
```

---

### 3. Content Storage Strategy

Three types of protected content, each with an optimal storage approach:

| Content Type | Storage | Access Control | Format |
|-------------|---------|---------------|--------|
| Research reports | Supabase Storage (`reports` bucket) | RLS policy on `storage.objects` | PDF, HTML |
| Projects | Supabase Database (`projects` table) + Storage for attachments | RLS on table + bucket | Metadata in DB, files in Storage |
| Documents | Supabase Storage (`documents` bucket) | RLS policy | PDF, DOCX, MD |

#### Supabase Storage Architecture

```
Buckets:
├── reports/          (private bucket)
│   ├── 2026/
│   │   ├── report-quantum-computing.pdf
│   │   └── report-neural-patterns.html
│   └── ...
├── documents/        (private bucket)
│   ├── project-plans/
│   └── research-notes/
└── avatars/          (public bucket, for user profile pictures)
```

#### RLS Policies (enforced at database level)

```sql
-- Only authenticated users can read from reports bucket
CREATE POLICY "Members can read reports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'reports'
  AND auth.role() = 'authenticated'
);

-- Premium users can read all; members see only member-tier content
CREATE POLICY "Premium access to all reports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'reports'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('premium', 'admin')
  )
);

CREATE POLICY "Member access to member reports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'reports'
  AND (storage.foldername(name))[1] = 'member'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('member', 'premium', 'admin')
  )
);
```

#### Content Metadata Table

```sql
CREATE TABLE content_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('report', 'project', 'document')),
  storage_path TEXT,                    -- path in Supabase Storage
  min_role TEXT DEFAULT 'member' CHECK (min_role IN ('member', 'premium')),
  tags TEXT[] DEFAULT '{}',
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: users can only see content matching their role
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see content for their role"
ON content_items FOR SELECT
USING (
  CASE min_role
    WHEN 'member' THEN auth.role() = 'authenticated'
    WHEN 'premium' THEN EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('premium', 'admin')
    )
  END
);
```

---

### 4. Middleware for Auth Checks

Single middleware file that protects `/dashboard` routes and injects user context:

```typescript
// src/middleware.ts
import { defineMiddleware } from "astro:middleware";
import { createServerClient, parseCookieHeader } from "@supabase/ssr";

const PROTECTED_ROUTES = ["/dashboard"];

export const onRequest = defineMiddleware(async (context, next) => {
  // Skip auth for static/public routes (middleware runs at build time for SSG)
  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    context.url.pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return next();
  }

  // Create Supabase server client with cookie-based session
  const supabase = createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(
            context.request.headers.get("Cookie") ?? ""
          );
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            context.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Validate session (calls Supabase to verify JWT, not just decode)
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user || error) {
    return context.redirect("/login");
  }

  // Fetch user profile with role
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  // Inject into locals (available in all .astro pages via Astro.locals)
  context.locals.user = user;
  context.locals.profile = profile;
  context.locals.supabase = supabase;

  return next();
});
```

Type safety for `Astro.locals`:

```typescript
// src/env.d.ts
/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    user: import("@supabase/supabase-js").User | null;
    profile: { role: string; display_name: string } | null;
    supabase: import("@supabase/supabase-js").SupabaseClient;
  }
}
```

---

### 5. Role Management

#### Role Hierarchy

```
admin > premium > member > anonymous
```

| Role | Access | How Assigned |
|------|--------|-------------|
| `anonymous` | Public blog only | Default (not logged in) |
| `member` | Dashboard + member-tier content | Self-signup (default role) |
| `premium` | All content + premium features | Manual upgrade by admin |
| `admin` | Everything + user management | Manual assignment |

#### Database Schema

```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'premium', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup via trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'member'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS for profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
ON user_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update roles"
ON user_profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
  )
);
```

#### Role Check Helper

```typescript
// src/lib/roles.ts
export type UserRole = 'member' | 'premium' | 'admin';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  member: 1,
  premium: 2,
  admin: 3,
};

export function hasAccess(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
```

---

### 6. Cost Analysis

#### Phase 1 (Launch — <100 users)

| Service | Tier | Cost |
|---------|------|------|
| Supabase | Free | $0/month |
| Vercel | Hobby | $0/month |
| Domain (azimute.cc) | Already owned | $0/month |
| **Total** | | **$0/month** |

Supabase free tier limits: 50K MAUs, 500 MB database, 1 GB storage, 2 GB bandwidth. More than sufficient for launch.

#### Phase 2 (Growth — 100-1000 users)

| Service | Tier | Cost |
|---------|------|------|
| Supabase | Free (still within limits) | $0/month |
| Vercel | Pro (if needed for commercial use) | $20/month |
| **Total** | | **$0-20/month** |

#### Phase 3 (Scale — 1000+ users, >1 GB content)

| Service | Tier | Cost |
|---------|------|------|
| Supabase | Pro | $25/month |
| Vercel | Pro | $20/month |
| **Total** | | **$45/month** |

#### Comparison: What Clerk Would Cost

Clerk free tier covers 50K MAUs (generous), but you'd still need Supabase for database + storage:
- Clerk Free + Supabase Free = $0 (but two services to manage)
- Clerk Pro + Supabase Pro = ~$50+/month

Using Supabase for both auth and data eliminates one integration point and one billing relationship.

---

### 7. Implementation Plan

#### Phase 1: Infrastructure (1-2 days)

1. **Create Supabase project** at supabase.com
2. **Install dependencies:**
   ```bash
   npm install @astrojs/vercel @supabase/supabase-js @supabase/ssr
   ```
3. **Update `astro.config.mjs`** — add Vercel adapter (keep `output: 'static'`)
4. **Add `.env`:**
   ```
   PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...   # server-only, never exposed
   ```
5. **Run SQL migrations** — `user_profiles` table, trigger, RLS policies
6. **Create storage buckets** — `reports`, `documents`, `avatars`
7. **Configure Supabase Auth** — enable email/password, optional OAuth providers
8. **Connect Vercel** — import repo, set environment variables

#### Phase 2: Auth Flow (1-2 days)

1. **Create `src/lib/supabase.ts`** — server client factory
2. **Create `src/middleware.ts`** — auth check for `/dashboard` routes
3. **Create `src/env.d.ts`** — type definitions for `Astro.locals`
4. **Create `src/pages/login.astro`** — login form (SSR, `prerender = false`)
5. **Create `src/pages/signup.astro`** — signup form (SSR)
6. **Create `src/pages/api/auth/callback.ts`** — OAuth callback handler
7. **Create `src/pages/api/auth/signout.ts`** — session cleanup endpoint
8. **Update `src/layouts/Base.astro`** — add "Members" link to nav (conditional)

#### Phase 3: Dashboard (2-3 days)

1. **Create `src/layouts/Dashboard.astro`** — dashboard layout (sidebar, nav, user menu)
2. **Create `src/pages/dashboard/index.astro`** — dashboard home (SSR)
3. **Create `src/pages/dashboard/reports.astro`** — research reports listing
4. **Create `src/pages/dashboard/projects.astro`** — projects listing
5. **Create `src/pages/dashboard/documents.astro`** — documents listing
6. **Create `src/lib/roles.ts`** — role hierarchy and access helpers
7. **Implement content filtering** — query `content_items` with RLS (auto-filters by role)
8. **Implement file download** — signed URLs from Supabase Storage

#### Phase 4: Content Management (1 day)

1. **Upload initial content** to Supabase Storage buckets
2. **Populate `content_items` table** with metadata
3. **Set `min_role`** per content item (member vs premium)
4. **Test RLS policies** — verify member cannot access premium content

#### Phase 5: Deploy & Migration (1 day)

1. **Update `scripts/deploy.sh`** — or replace with Vercel auto-deploy from `master`
2. **Configure Vercel project:**
   - Framework preset: Astro
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variables: Supabase keys
3. **Update DNS** — point `azimute.cc` to Vercel (if migrating from GitHub Pages)
4. **Verify:**
   - Public blog works identically (SSG, no regression)
   - `/login` renders server-side
   - `/dashboard` redirects to `/login` when unauthenticated
   - Role-based content filtering works
   - File downloads work with signed URLs

---

## File Structure (New Files)

```
src/
├── lib/
│   ├── supabase.ts           # Server client factory
│   └── roles.ts              # Role hierarchy + access helpers
├── layouts/
│   ├── Base.astro            # (modified: add Members nav link)
│   └── Dashboard.astro       # NEW: dashboard layout
├── pages/
│   ├── login.astro           # NEW: login/signup (SSR)
│   ├── signup.astro          # NEW: registration (SSR)
│   ├── api/
│   │   └── auth/
│   │       ├── callback.ts   # NEW: OAuth callback
│   │       └── signout.ts    # NEW: session cleanup
│   └── dashboard/
│       ├── index.astro       # NEW: dashboard home (SSR)
│       ├── reports.astro     # NEW: research reports (SSR)
│       ├── projects.astro    # NEW: projects listing (SSR)
│       └── documents.astro   # NEW: documents listing (SSR)
├── middleware.ts              # NEW: auth middleware
└── env.d.ts                  # NEW: Astro.locals types
```

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Supabase free tier pauses after 7 days inactivity | Dashboard goes down | Upgrade to Pro ($25/mo) when members area launches, or set up a keep-alive cron |
| Vercel cold starts on SSR routes | Slow first load on dashboard | Edge middleware for auth checks; consider ISR for semi-static dashboard content |
| GitHub Pages → Vercel DNS migration | Brief downtime during DNS propagation | Plan migration during low-traffic window; use low TTL before switch |
| Supabase vendor lock-in | Hard to migrate auth/storage later | Use standard SQL, abstract Supabase calls behind `src/lib/` layer |
| Cookie-based auth complexity | Security vulnerabilities if misconfigured | Use `@supabase/ssr` (handles PKCE, refresh tokens, cookie splitting) |

---

## Alternatives Considered

### Alternative A: Clerk + Supabase (Storage Only)

Use Clerk for auth (best DX, prebuilt components) and Supabase only for database + storage.

**Pros:** Fastest to implement, beautiful prebuilt UI, built-in organizations
**Cons:** Two services to manage, two billing relationships, Clerk owns user data, more expensive at scale
**Why rejected:** Adding Clerk when Supabase already provides auth creates unnecessary complexity and cost.

### Alternative B: Better Auth + Turso/Supabase

Self-hosted auth with Better Auth, using Turso (edge SQLite) or Supabase for database.

**Pros:** Full data ownership, no per-MAU costs, TypeScript-first
**Cons:** More setup, no file storage solution included, newer project with smaller community
**Why rejected:** Requires assembling multiple services. Supabase provides the same capabilities in one platform with less operational burden.

### Alternative C: Keep GitHub Pages + Client-Side Auth

Use Supabase Auth client-side only, protect content via JavaScript (no SSR).

**Pros:** No hosting migration, no server costs
**Cons:** Content is not truly protected (HTML is public, JS hides it), no middleware, poor security, bad SEO for dashboard
**Why rejected:** Security theater — protected content would be accessible to anyone inspecting the page source.

---

## Decision Record

| # | Decision | Choice |
|---|----------|--------|
| 1 | Auth provider | Supabase Auth |
| 2 | Rendering strategy | Static default + selective SSR (`prerender = false`) |
| 3 | Content storage | Supabase Storage (private buckets) + Database (metadata) |
| 4 | Auth middleware | Astro `src/middleware.ts` with `@supabase/ssr` |
| 5 | Role management | `user_profiles` table with RLS policies |
| 6 | Hosting migration | GitHub Pages → Vercel |
| 7 | Cost at launch | $0/month (free tiers) |

---

*— Aria, arquitetando o futuro 🏗️*
