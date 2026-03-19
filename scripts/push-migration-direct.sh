#!/bin/bash
# Direct migration push using Supabase REST API

set -e

PROJECT_URL="https://jyykieghjbopruobcmnt.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5eWtpZWdoamJvcHJ1b2JjbW50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg4MjU1OCwiZXhwIjoyMDg5NDU4NTU4fQ.JEvj17fddfc7aWOWGyyNNxE-UkASnZTv1ClK_StLGa8"

echo "🔄 Applying migrations to production Supabase..."

# Apply each migration in order
for migration in supabase/migrations/*.sql; do
    echo "📝 Applying: $migration"

    # Read migration content
    SQL_CONTENT=$(cat "$migration")

    # Execute via Supabase REST API
    curl -X POST "${PROJECT_URL}/rest/v1/rpc/exec_sql" \
        -H "apikey: ${SERVICE_ROLE_KEY}" \
        -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"query\": $(jq -Rs . <<< "$SQL_CONTENT")}" \
        --fail --silent --show-error

    echo "✅ Done: $migration"
done

echo "🎉 All migrations applied successfully!"
