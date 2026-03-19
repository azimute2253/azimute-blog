# Production Deploy Checklist — Members Area

## Supabase Cloud

- [ ] Create Supabase project at supabase.com
- [ ] Note project URL and keys (anon key, service role key)
- [ ] Link local project: `npx supabase link --project-ref <project-id>`
- [ ] Push migrations: `npx supabase db push`
- [ ] Verify tables created: `user_profiles`, `content_items`
- [ ] Verify RLS enabled on both tables
- [ ] Verify policies: "Users can read own profile", "Users see content for their role"
- [ ] Verify trigger: `handle_new_user()` creates profiles on signup

## Storage

- [ ] Create bucket: `reports` (private)
- [ ] Create bucket: `documents` (private)
- [ ] Create bucket: `avatars` (public)
- [ ] Upload initial content files to appropriate buckets
- [ ] Insert corresponding rows in `content_items` with `storage_path`
- [ ] Test signed URL generation works

## Auth Configuration

- [ ] Set site URL to `https://azimute.cc` in Auth settings
- [ ] Add redirect URLs: `https://azimute.cc/api/auth/callback`
- [ ] Enable email confirmations (switch from auto-confirm)
- [ ] Configure email templates (optional)
- [ ] Test signup flow → check confirmation email arrives
- [ ] Test login flow → verify redirect to /dashboard

## Content & Roles

- [ ] Seed initial content items via SQL or Studio
- [ ] Create admin user and set role to `admin` in `user_profiles`
- [ ] Test with member user → sees only member content
- [ ] Test with premium user → sees all content
- [ ] Test anonymous access → sees nothing (RLS blocks)

## Vercel Deployment

- [ ] Import project to Vercel (from GitHub master branch)
- [ ] Set environment variables in Vercel dashboard:
  - `PUBLIC_SUPABASE_URL` = `https://<project>.supabase.co`
  - `PUBLIC_SUPABASE_ANON_KEY` = production anon key
  - `SUPABASE_SERVICE_ROLE_KEY` = production service role key
- [ ] Deploy and verify build succeeds
- [ ] Custom domain: `azimute.cc` pointed to Vercel
- [ ] Verify HTTPS is active

## Post-Deploy Verification

- [ ] Public blog loads at `https://azimute.cc`
- [ ] `/login` page renders
- [ ] `/signup` page renders
- [ ] `/dashboard` redirects to `/login` when not authenticated
- [ ] Signup creates user + profile (check Supabase Auth dashboard)
- [ ] Login redirects to `/dashboard`
- [ ] Dashboard shows correct content counts
- [ ] Reports page shows role-filtered content
- [ ] Projects page works
- [ ] Documents page works
- [ ] Download button generates signed URL (if files uploaded)
- [ ] Sign out works and redirects to `/login`
- [ ] Expired session shows "session expired" message on login page

## Security

- [ ] No secrets in source code (check `.env` not committed)
- [ ] RLS enabled on all tables
- [ ] Service role key only used server-side (never in client)
- [ ] CORS configured correctly in Supabase
- [ ] Rate limiting on auth endpoints (Supabase default)

## Optional Enhancements

- [ ] Email verification required before first login
- [ ] Password reset flow (`/forgot-password`)
- [ ] User profile editing (display name)
- [ ] Admin panel for content management
- [ ] Analytics/tracking for downloads
