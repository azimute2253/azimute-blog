#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const metadataPath = path.join(__dirname, 'research-metadata.json');
if (!fs.existsSync(metadataPath)) {
  console.error('❌ research-metadata.json not found. Run migrate-research.mjs first.');
  process.exit(1);
}

const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

console.log(`📤 Uploading ${metadata.length} research items to Supabase...\n`);

let successCount = 0;
let errorCount = 0;

for (const item of metadata) {
  const { error } = await supabase.from('content_items').insert({
    title: item.title,
    type: item.type,
    tags: item.tags,
    min_role: item.min_role,
    storage_path: `/research/${item.slug}`, // Web path, not file path
    published_at: item.date
  });

  if (error) {
    console.error(`  ✗ ${item.slug}:`, error.message);
    errorCount++;
  } else {
    console.log(`  ✓ ${item.title}`);
    successCount++;
  }
}

console.log(`\n✅ Upload complete: ${successCount} successful, ${errorCount} errors`);
