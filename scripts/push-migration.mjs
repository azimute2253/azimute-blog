#!/usr/bin/env node
/**
 * Push migrations to Supabase Cloud
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/push-migration.mjs
 *
 * Get your access token at:
 *   https://supabase.com/dashboard/account/tokens
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_REF = 'jyykieghjbopruobcmnt';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5eWtpZWdoamJvcHJ1b2JjbW50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg4MjU1OCwiZXhwIjoyMDg5NDU4NTU4fQ.JEvj17fddfc7aWOWGyyNNxE-UkASnZTv1ClK_StLGa8';
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!ACCESS_TOKEN) {
  console.error('Error: SUPABASE_ACCESS_TOKEN environment variable required');
  console.error('Get one at: https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}

const sqlFile = resolve(__dirname, '../supabase/combined-migration.sql');
const sql = readFileSync(sqlFile, 'utf-8');

async function runSQL(query) {
  const resp = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`SQL execution failed (${resp.status}): ${text}`);
  }

  return resp.json();
}

async function uploadFile(bucket, filename, filepath) {
  const data = readFileSync(filepath);
  const resp = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${bucket}/${filename}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'text/html',
        'x-upsert': 'true',
      },
      body: data,
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Upload failed (${resp.status}): ${text}`);
  }

  return resp.json();
}

async function main() {
  console.log('=== Supabase Cloud Migration ===\n');

  // Step 1: Run migrations
  console.log('[1/3] Running combined migration...');
  try {
    const result = await runSQL(sql);
    console.log('  ✓ Migration applied successfully');
    if (result && result.length) {
      console.log('  Result:', JSON.stringify(result).slice(0, 200));
    }
  } catch (err) {
    console.error('  ✗ Migration failed:', err.message);
    console.error('  Try running the SQL manually in Supabase SQL Editor');
    process.exit(1);
  }

  // Step 2: Verify tables
  console.log('\n[2/3] Verifying tables...');
  try {
    const tables = await runSQL(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    );
    console.log('  Tables:', tables.map(t => t.tablename).join(', '));
  } catch (err) {
    console.error('  Verification failed:', err.message);
  }

  // Step 3: Upload research reports
  console.log('\n[3/3] Uploading research reports...');
  const reports = [
    'openclaw-vanilla-disruption-2026-03-18.html',
    'anima-kerberos-positioning-2026-03-18.html',
    'openclaw-disruption-analysis-2026-03-18.html',
  ];

  const researchDir = resolve(process.env.HOME, 'Research/market-research');

  for (const file of reports) {
    const filepath = resolve(researchDir, file);
    try {
      readFileSync(filepath); // Check exists
      await uploadFile('reports', file, filepath);
      console.log(`  ✓ Uploaded: ${file}`);
    } catch (err) {
      console.log(`  ⚠ ${file}: ${err.message}`);
    }
  }

  console.log('\n=== Done ===');
  console.log('Next: Set Vercel env vars and deploy');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
