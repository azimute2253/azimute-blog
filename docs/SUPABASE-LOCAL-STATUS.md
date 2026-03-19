# Supabase Local Setup — Current Status

**Date:** 2026-03-18 (updated)
**Status:** Working

---

## Current State

| Component | Status | Notes |
|-----------|--------|-------|
| Docker | Working | v28.2.2 |
| Supabase CLI | Working | via npx |
| Local Stack | Running | API :54321, Studio :54323, DB :54322 |
| Astro Dev Server | Working | :4321 with SSR routes |
| RLS | Enabled | Fixed in migration 005 |
| Auth | Working | Signup, login, signout |
| Test Users | Created | member@test.com, premium@test.com |

## Services

| Service | URL | Status |
|---------|-----|--------|
| Studio | http://127.0.0.1:54323 | Running |
| API | http://127.0.0.1:54321 | Running |
| Database | postgresql://postgres:postgres@127.0.0.1:54322/postgres | Running |
| Mailpit | http://127.0.0.1:54324 | Running |

## Migrations Applied

1. `001_members_area.sql` — Schema, tables, RLS policies, triggers
2. `002_fix_rls_recursion.sql` — Remove recursive admin policies
3. `003_fix_service_role_access.sql` — Service role policies (superseded)
4. `004_temp_disable_rls.sql` — Temp disable (superseded)
5. `005_fix_rls_properly.sql` — Re-enable RLS correctly

## RLS Verification

Tested via REST API:
- Anonymous: 0 items (blocked)
- Member (member@test.com): 4 items (member-level only)
- Premium (premium@test.com): 6 items (all content)
