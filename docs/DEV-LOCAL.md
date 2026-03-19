# Local Development Setup — Supabase

**Status:** Working (2026-03-18)
**Stack:** Supabase CLI (via npx) + Docker 28.2.2 + Postgres (local containers)

## Prerequisites

- Docker installed and running
- Node.js 22+

## Quick Start

```bash
# Start Supabase containers
npx supabase start

# Start Astro dev server
npm run dev

# Open browser
# Blog: http://localhost:4321
# Login: http://localhost:4321/login
# Dashboard: http://localhost:4321/dashboard
# Supabase Studio: http://localhost:54323
```

## Test Users

| Email | Password | Role | Sees |
|-------|----------|------|------|
| member@test.com | testpass123 | member | 4 items (member-only content) |
| premium@test.com | testpass123 | premium | 6 items (all content) |

After `npx supabase db reset`, you need to recreate test users:

```bash
# Get keys
eval $(npx supabase status -o env 2>/dev/null | grep -E '^(ANON_KEY|SERVICE_ROLE_KEY)=')

# Create member user
curl -s -X POST 'http://127.0.0.1:54321/auth/v1/admin/users' \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "apikey: $ANON_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"email":"member@test.com","password":"testpass123","email_confirm":true,"user_metadata":{"display_name":"Test Member"}}'

# Create premium user
curl -s -X POST 'http://127.0.0.1:54321/auth/v1/admin/users' \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "apikey: $ANON_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"email":"premium@test.com","password":"testpass123","email_confirm":true,"user_metadata":{"display_name":"Premium User"}}'

# Upgrade premium user role
npx supabase db query "UPDATE user_profiles SET role = 'premium' WHERE email = 'premium@test.com';"
```

## Adding New Content

### Via Supabase Studio

1. Open http://localhost:54323
2. Go to Table Editor > content_items
3. Click "Insert row"
4. Fill fields: title, description, type (`report`/`project`/`document`), min_role (`member`/`premium`), tags

### Via SQL

```sql
INSERT INTO content_items (title, description, type, storage_path, min_role, tags)
VALUES (
  'My Report Title',
  'Description of the report',
  'report',
  'path/to/file-in-storage-bucket.pdf',
  'member',
  ARRAY['tag1', 'tag2']
);
```

Run via: `npx supabase db query "INSERT INTO ..."`

## Testing RLS

RLS (Row-Level Security) controls who sees what. To verify:

```bash
# Get keys
eval $(npx supabase status -o env 2>/dev/null | grep -E '^(ANON_KEY|SERVICE_ROLE_KEY)=')

# Login as member
MEMBER_TOKEN=$(curl -s -X POST 'http://127.0.0.1:54321/auth/v1/token?grant_type=password' \
  -H "apikey: $ANON_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"email":"member@test.com","password":"testpass123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# Query as member — should see only member-level content
curl -s 'http://127.0.0.1:54321/rest/v1/content_items?select=title,min_role' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $MEMBER_TOKEN"

# Login as premium
PREMIUM_TOKEN=$(curl -s -X POST 'http://127.0.0.1:54321/auth/v1/token?grant_type=password' \
  -H "apikey: $ANON_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"email":"premium@test.com","password":"testpass123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# Query as premium — should see ALL content
curl -s 'http://127.0.0.1:54321/rest/v1/content_items?select=title,min_role' \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $PREMIUM_TOKEN"

# Anonymous — should see nothing
curl -s 'http://127.0.0.1:54321/rest/v1/content_items?select=title,min_role' \
  -H "apikey: $ANON_KEY"
```

## Debugging Auth Issues

### Check if user exists
```bash
npx supabase db query "SELECT id, email FROM auth.users;"
```

### Check if profile was created
```bash
npx supabase db query "SELECT id, email, role FROM user_profiles;"
```

### Check RLS status
```bash
npx supabase db query "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';"
```

### Check policies
```bash
npx supabase db query "SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public';"
```

### View Supabase logs
```bash
docker logs supabase_auth_azimute-blog --tail 50
docker logs supabase_rest_azimute-blog --tail 50
```

### Reset everything
```bash
npx supabase db reset   # Reapplies all migrations + seed
# Then recreate test users (see Quick Start above)
```

## Environment Variables

`.env.local` contains local development keys (safe to keep, not secret):

```env
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_ANON_KEY=<local-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<local-service-role-key>
```

**Important:** After `npx supabase db reset`, keys may change. Update `.env.local` by running:
```bash
npx supabase status -o env
```

## Migrations

```
supabase/migrations/
  001_members_area.sql           # Schema: user_profiles, content_items, RLS, triggers
  002_fix_rls_recursion.sql      # Remove recursive admin policies
  003_fix_service_role_access.sql # Service role insert/update (superseded)
  004_temp_disable_rls.sql       # Temp RLS disable (superseded)
  005_fix_rls_properly.sql       # Re-enable RLS with correct policies
```

## Known Limitations

- SMS auth disabled (no provider configured)
- Some Supabase services stopped (imgproxy, analytics, vector, pooler) — not needed
- Email confirmations disabled locally (auto-confirmed)
- Storage buckets must be created manually via Studio
