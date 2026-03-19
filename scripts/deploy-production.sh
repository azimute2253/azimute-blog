#!/bin/bash
# =============================================================
# Production Deployment Script — Members Area
# Usage: bash scripts/deploy-production.sh
# Requires: Supabase DB password and Vercel auth
# =============================================================

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SUPABASE_REF="jyykieghjbopruobcmnt"
SUPABASE_URL="https://${SUPABASE_REF}.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5eWtpZWdoamJvcHJ1b2JjbW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4ODI1NTgsImV4cCI6MjA4OTQ1ODU1OH0.LYXoIs99sOR6KC_rNwhKxywJCQm2-0TuBqiDNEOFwLw"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5eWtpZWdoamJvcHJ1b2JjbW50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg4MjU1OCwiZXhwIjoyMDg5NDU4NTU4fQ.JEvj17fddfc7aWOWGyyNNxE-UkASnZTv1ClK_StLGa8"
RESEARCH_DIR="$HOME/Research/market-research"
COMBINED_SQL="$PROJECT_DIR/supabase/combined-migration.sql"

echo "=== Azimute Members Area — Production Deploy ==="
echo ""

# Step 1: Database Password
if [ -z "${SUPABASE_DB_PASSWORD:-}" ]; then
  echo -n "Enter Supabase database password: "
  read -rs SUPABASE_DB_PASSWORD
  echo ""
fi

DB_URL="postgresql://postgres.${SUPABASE_REF}:${SUPABASE_DB_PASSWORD}@aws-0-us-west-2.pooler.supabase.com:6543/postgres"

echo "[1/7] Testing database connection..."
if ! PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "aws-0-us-west-2.pooler.supabase.com" -p 6543 -U "postgres.${SUPABASE_REF}" -d postgres -c "SELECT 1;" > /dev/null 2>&1; then
  # Try session mode
  DB_URL="postgresql://postgres.${SUPABASE_REF}:${SUPABASE_DB_PASSWORD}@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
  if ! PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "aws-0-us-west-2.pooler.supabase.com" -p 5432 -U "postgres.${SUPABASE_REF}" -d postgres -c "SELECT 1;" > /dev/null 2>&1; then
    # Try direct connection
    DB_URL="postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.${SUPABASE_REF}.supabase.co:5432/postgres"
    if ! PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "db.${SUPABASE_REF}.supabase.co" -p 5432 -U postgres -d postgres -c "SELECT 1;" > /dev/null 2>&1; then
      echo "ERROR: Cannot connect to database. Check password and try again."
      exit 1
    fi
  fi
fi
echo "  ✓ Database connection OK"

echo ""
echo "[2/7] Running migrations..."
npx supabase db push --db-url "$DB_URL" --include-all 2>&1 || {
  echo "  Falling back to direct SQL execution..."
  PGPASSWORD="$SUPABASE_DB_PASSWORD" psql "$DB_URL" -f "$COMBINED_SQL" 2>&1
}
echo "  ✓ Migrations applied"

echo ""
echo "[3/7] Verifying tables..."
TABLES=$(curl -s "${SUPABASE_URL}/rest/v1/" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" 2>&1)

if echo "$TABLES" | grep -q "user_profiles"; then
  echo "  ✓ user_profiles table exists"
else
  echo "  ⚠ user_profiles not found in REST API (may need schema cache refresh)"
fi

if echo "$TABLES" | grep -q "content_items"; then
  echo "  ✓ content_items table exists"
else
  echo "  ⚠ content_items not found in REST API (may need schema cache refresh)"
fi

echo ""
echo "[4/7] Uploading research reports to storage..."
for file in \
  "openclaw-vanilla-disruption-2026-03-18.html" \
  "anima-kerberos-positioning-2026-03-18.html" \
  "openclaw-disruption-analysis-2026-03-18.html"; do

  FILEPATH="${RESEARCH_DIR}/${file}"
  if [ -f "$FILEPATH" ]; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
      -X POST "${SUPABASE_URL}/storage/v1/object/reports/${file}" \
      -H "Authorization: Bearer ${SERVICE_KEY}" \
      -H "Content-Type: text/html" \
      --data-binary "@${FILEPATH}")

    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
      echo "  ✓ Uploaded: ${file}"
    else
      echo "  ⚠ Upload returned HTTP ${HTTP_CODE}: ${file}"
    fi
  else
    echo "  ⚠ File not found: ${FILEPATH}"
  fi
done

echo ""
echo "[5/7] Verifying content items..."
CONTENT=$(curl -s "${SUPABASE_URL}/rest/v1/content_items?select=title,type,min_role" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" 2>&1)
echo "  Content items: ${CONTENT}"

echo ""
echo "[6/7] Vercel environment variables..."
echo "  Set these in Vercel Dashboard > Settings > Environment Variables:"
echo "  PUBLIC_SUPABASE_URL = ${SUPABASE_URL}"
echo "  PUBLIC_SUPABASE_ANON_KEY = ${ANON_KEY}"
echo "  SUPABASE_SERVICE_ROLE_KEY = ${SERVICE_KEY}"
echo ""
echo "  OR use Vercel CLI:"
echo "  npx vercel env add PUBLIC_SUPABASE_URL production"
echo "  npx vercel env add PUBLIC_SUPABASE_ANON_KEY production"
echo "  npx vercel env add SUPABASE_SERVICE_ROLE_KEY production"

echo ""
echo "[7/7] Auth configuration..."
echo "  Configure in Supabase Dashboard > Authentication > URL Configuration:"
echo "  Site URL: https://azimute.cc"
echo "  Redirect URLs: https://azimute.cc/api/auth/callback"

echo ""
echo "=== Deploy Summary ==="
echo "Next steps:"
echo "  1. Set Vercel env vars (step 6 above)"
echo "  2. Configure auth URLs (step 7 above)"
echo "  3. git push origin master (triggers Vercel deploy)"
echo "  4. Verify: https://azimute.cc/signup"
echo ""
echo "Done!"
