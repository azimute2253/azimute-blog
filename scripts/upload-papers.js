#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Read .env.local file manually (contains actual credentials)
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = env.PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const papers = [
  {
    filename: 'Adures-NineNeuronsTheory-v2-2026-03-17.pdf',
    title: 'Nine Neurons Theory v2 (2026-03-17)',
    description: 'Comprehensive framework for understanding consciousness through nine fundamental neuronal patterns.',
    type: 'paper',
    min_role: 'member',
    tags: ['9-neurons-theory', 'consciousness', 'academic'],
    published_at: '2026-03-17'
  },
  {
    filename: 'Adures-TheoryNineNeurons-v2-2026-03-17.pdf',
    title: 'Theory of Nine Neurons v2 (2026-03-17)',
    description: 'Alternative presentation of the Nine Neurons Theory framework.',
    type: 'paper',
    min_role: 'member',
    tags: ['9-neurons-theory', 'consciousness', 'academic'],
    published_at: '2026-03-17'
  },
  {
    filename: 'Adures-NineStagesConsciousness-v2-2026-03-17.pdf',
    title: 'Nine Stages of Consciousness v2 (2026-03-17)',
    description: 'Exploration of consciousness development through nine progressive stages.',
    type: 'paper',
    min_role: 'member',
    tags: ['9-neurons-theory', 'consciousness', 'stages', 'academic'],
    published_at: '2026-03-17'
  },
  {
    filename: 'Adures-NineStagesConsciousness-v1-2026-02-19.pdf',
    title: 'Nine Stages of Consciousness v1 (2026-02-19)',
    description: 'Initial framework for understanding consciousness stages.',
    type: 'paper',
    min_role: 'member',
    tags: ['9-neurons-theory', 'consciousness', 'stages', 'academic'],
    published_at: '2026-02-19'
  },
  {
    filename: 'Adures-NineNeuronsTheory.pdf',
    title: 'Nine Neurons Theory (Latest)',
    description: 'The Nine Neurons Theory — latest version.',
    type: 'paper',
    min_role: 'member',
    tags: ['9-neurons-theory', 'consciousness', 'academic'],
    published_at: '2026-03-17'
  }
];

async function uploadPapers() {
  const sourcePath = resolve(process.env.HOME, 'Research/papers/9-neurons-theory');

  console.log('📄 Starting paper upload process...\n');

  for (const paper of papers) {
    console.log(`Processing: ${paper.filename}`);

    try {
      // Read the PDF file
      const filePath = resolve(sourcePath, paper.filename);
      const fileBuffer = readFileSync(filePath);

      // Upload to Supabase Storage
      const storagePath = `papers/${paper.filename}`;
      console.log(`  ⬆️  Uploading to storage: ${storagePath}`);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('content')
        .upload(storagePath, fileBuffer, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) {
        console.error(`  ❌ Upload failed: ${uploadError.message}`);
        continue;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(storagePath);

      console.log(`  ✅ Uploaded: ${publicUrl}`);

      // Insert metadata into content_items
      const { data: insertData, error: insertError } = await supabase
        .from('content_items')
        .upsert({
          title: paper.title,
          description: paper.description,
          type: paper.type,
          min_role: paper.min_role,
          tags: paper.tags,
          storage_path: publicUrl,
          published_at: paper.published_at
        }, {
          onConflict: 'title'
        });

      if (insertError) {
        console.error(`  ❌ Database insert failed: ${insertError.message}`);
        continue;
      }

      console.log(`  ✅ Metadata saved\n`);

    } catch (err) {
      console.error(`  ❌ Error processing ${paper.filename}:`, err.message);
    }
  }

  console.log('✅ Paper upload process completed!');
}

uploadPapers().catch(console.error);
