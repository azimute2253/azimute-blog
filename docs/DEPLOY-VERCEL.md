# Deploying Azimute Blog to Vercel

## Prerequisites

1. Supabase project created at https://supabase.com
2. Vercel account at https://vercel.com
3. GitHub repository connected to Vercel

## Supabase Setup

### 1. Create Project

1. Go to https://supabase.com/dashboard
2. Create new project (free tier)
3. Note the **Project URL** and **Anon Key** from Settings > API

### 2. Run Migrations

1. Go to SQL Editor in Supabase Dashboard
2. Paste contents of `supabase/migrations/001_members_area.sql`
3. Execute

### 3. Create Storage Buckets

In Supabase Dashboard > Storage:

1. Create `reports` bucket (private)
2. Create `documents` bucket (private)
3. Create `avatars` bucket (public)

### 4. Configure Auth

In Supabase Dashboard > Authentication > Providers:

1. Enable Email/Password (enabled by default)
2. Set Site URL to `https://azimute.cc`
3. Add `https://azimute.cc/api/auth/callback` to Redirect URLs

## Vercel Setup

### 1. Import Project

1. Go to https://vercel.com/new
2. Import the `azimute-blog` GitHub repository
3. Framework preset: **Astro**
4. Build command: `npm run build`
5. Output directory: `dist`

### 2. Environment Variables

Set these in Vercel project Settings > Environment Variables:

| Variable | Value | Environments |
|----------|-------|-------------|
| `PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | All |
| `PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | All |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | All |

### 3. Custom Domain

1. Go to Vercel project Settings > Domains
2. Add `azimute.cc`
3. Update DNS records as instructed by Vercel
4. Remove GitHub Pages CNAME if needed

## DNS Migration (GitHub Pages -> Vercel)

1. Lower DNS TTL to 60 seconds (24h before migration)
2. Deploy to Vercel and verify at `*.vercel.app` URL
3. Update DNS to point to Vercel
4. Wait for propagation (5-30 min with low TTL)
5. Verify `azimute.cc` resolves to Vercel
6. Restore normal TTL

## Verification Checklist

- [ ] Public blog pages load (SSG, no regression)
- [ ] `/login` renders server-side
- [ ] `/signup` renders server-side
- [ ] `/dashboard` redirects to `/login` when unauthenticated
- [ ] Login flow works (email/password)
- [ ] Signup flow works (creates user + profile)
- [ ] Dashboard shows content counts
- [ ] Role-based content filtering works
- [ ] File downloads work via signed URLs
- [ ] RSS feed still works
- [ ] Sitemap still works
- [ ] Language toggle still works (EN/PT)

## Notes

- The old `scripts/deploy.sh` (gh-pages push) is no longer needed with Vercel
- Vercel auto-deploys from `master` branch
- Public blog pages remain fully static (SSG) — no performance regression
- Only `/login`, `/signup`, `/dashboard/*`, and `/api/*` routes use SSR
