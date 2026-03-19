#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESEARCH_DIR = path.join(process.env.HOME, 'Research', 'night-study');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'research');

// Create output dir
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Find all HTML files
const files = await glob(`${RESEARCH_DIR}/*.html`);

console.log(`🔄 Migrating ${files.length} research reports...\n`);

const metadata = [];

for (const file of files) {
  const basename = path.basename(file);
  const slug = basename.replace('.html', '');

  // Read original HTML
  const html = fs.readFileSync(file, 'utf8');

  // Extract metadata
  const titleMatch = html.match(/<title>(.*?)<\/title>/);
  const title = titleMatch ? titleMatch[1] : slug;

  const dateMatch = slug.match(/(\d{4}-\d{2}-\d{2})/);
  const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

  // Strip <html>, <head>, <body> tags - keep only content
  let content = html
    .replace(/<!DOCTYPE[^>]*>/i, '')
    .replace(/<html[^>]*>/i, '')
    .replace(/<\/html>/i, '')
    .replace(/<head[^>]*>.*?<\/head>/is, '')
    .replace(/<body[^>]*>/i, '')
    .replace(/<\/body>/i, '')
    .replace(/<style[^>]*>.*?<\/style>/gis, '') // Remove old styles
    .trim();

  // Write clean HTML content (no wrapper tags, no old styles)
  fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}.html`), content);

  metadata.push({
    slug,
    title,
    date,
    type: 'report',
    tags: ['research', 'night-study'],
    min_role: 'premium'
  });

  console.log(`  ✓ ${slug}`);
}

// Write metadata
fs.writeFileSync(
  path.join(__dirname, 'research-metadata.json'),
  JSON.stringify(metadata, null, 2)
);

console.log(`\n✅ Migrated ${files.length} reports to public/research/`);
console.log(`📄 Metadata saved to scripts/research-metadata.json`);
