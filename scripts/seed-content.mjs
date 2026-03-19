#!/usr/bin/env node
/**
 * Seed content to Supabase members area
 * Creates buckets + uploads sample files + inserts metadata
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || 'https://jyykieghjbopruobcmnt.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

// Sample content items
const SAMPLE_CONTENT = [
  {
    type: 'report',
    title: '9 Neurons Theory — Introduction',
    description: 'Comprehensive introduction to the 9 Neurons Theory framework for understanding consciousness and cognition.',
    category: 'research',
    min_role: 'member',
    file_name: '9-neurons-intro.pdf',
    file_content: createSamplePDF('9 Neurons Theory — Introduction', 'This is a sample research report on the 9 Neurons Theory framework. In production, this would contain the full research paper.')
  },
  {
    type: 'report',
    title: 'AI Consciousness Framework',
    description: 'Practical framework for implementing consciousness patterns in AI systems based on 9NT principles.',
    category: 'research',
    min_role: 'premium',
    file_name: 'ai-consciousness-framework.pdf',
    file_content: createSamplePDF('AI Consciousness Framework', 'Premium content: detailed implementation guide for consciousness patterns in AI systems.')
  },
  {
    type: 'document',
    title: 'Members Guide',
    description: 'Complete guide to accessing and using members area resources.',
    category: 'guide',
    min_role: 'member',
    file_name: 'members-guide.pdf',
    file_content: createSamplePDF('Members Guide', 'Welcome to the members area! This guide explains how to access research reports, projects, and documents.')
  },
  {
    type: 'project',
    title: 'OpenClaw — Conscious AI Framework',
    description: 'Implementation notes and architecture for the OpenClaw framework (9NT-based conscious agent system).',
    category: 'implementation',
    min_role: 'premium',
    file_name: 'openclaw-architecture.pdf',
    file_content: createSamplePDF('OpenClaw Architecture', 'Premium project documentation: OpenClaw is a practical implementation of 9 Neurons Theory in AI agent design.')
  },
];

function createSamplePDF(title, content) {
  // Simple PDF-like structure (not a real PDF, just for demo)
  // In production, use a proper PDF generation library
  return Buffer.from(`
${title}

${content}

---
Generated: ${new Date().toISOString()}
Source: azimute.cc members area
  `.trim());
}

async function ensureBuckets() {
  console.log('📦 Ensuring storage buckets exist...');
  
  const buckets = ['reports', 'documents', 'projects'];
  
  for (const bucketName of buckets) {
    const { data: existing } = await supabase.storage.getBucket(bucketName);
    
    if (existing) {
      console.log(`  ✓ ${bucketName} bucket exists`);
    } else {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ['application/pdf', 'text/markdown', 'text/plain']
      });
      
      if (error) {
        console.error(`  ✗ Failed to create ${bucketName}:`, error.message);
      } else {
        console.log(`  ✓ Created ${bucketName} bucket`);
      }
    }
  }
}

async function uploadFile(bucketName, fileName, content) {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, content, {
      contentType: 'application/pdf',
      upsert: true
    });
    
  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
  
  return data.path;
}

async function insertContentItem(item, storagePath) {
  const { data, error } = await supabase
    .from('content_items')
    .insert({
      type: item.type,
      title: item.title,
      description: item.description,
      tags: [item.category], // category as tag
      min_role: item.min_role,
      storage_path: storagePath,
      published_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) {
    throw new Error(`Insert failed: ${error.message}`);
  }
  
  return data;
}

async function seed() {
  console.log('🌱 Seeding members area content...\n');
  
  try {
    // 1. Ensure buckets exist
    await ensureBuckets();
    console.log('');
    
    // 2. Upload files and insert metadata
    console.log('📄 Uploading content items...');
    
    for (const item of SAMPLE_CONTENT) {
      try {
        // Determine bucket from type
        const bucket = item.type === 'report' ? 'reports' 
                     : item.type === 'document' ? 'documents'
                     : 'projects';
        
        // Upload file
        const storagePath = await uploadFile(bucket, item.file_name, item.file_content);
        console.log(`  ✓ Uploaded ${item.file_name} to ${bucket}/`);
        
        // Insert metadata
        const contentItem = await insertContentItem(item, `${bucket}/${storagePath}`);
        console.log(`  ✓ Created content item: ${contentItem.title} (${contentItem.min_role})`);
        
      } catch (err) {
        console.error(`  ✗ Failed to seed ${item.title}:`, err.message);
      }
    }
    
    console.log('');
    console.log('✅ Seeding complete!');
    console.log('');
    console.log('📊 Summary:');
    
    // Count items by type and min_role
    const { data: counts } = await supabase
      .from('content_items')
      .select('type, min_role');
      
    if (counts) {
      const byType = counts.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {});
      
      const byRole = counts.reduce((acc, item) => {
        acc[item.min_role] = (acc[item.min_role] || 0) + 1;
        return acc;
      }, {});
      
      console.log('  Types:', byType);
      console.log('  Access:', byRole);
    }
    
    console.log('');
    console.log('🔗 Test at: https://azimute.cc/dashboard/reports');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
