#!/usr/bin/env node
// Validate what's been posted vs what's available
const fs = require('fs');
const path = require('path');

const wandersDir = path.join(__dirname, '..', 'src', 'content', 'wanders');
const stateFile = path.join(__dirname, '..', 'data', 'twitter-posted.json');

// Get all wander dates
const wanders = fs.readdirSync(wandersDir)
  .filter(f => f.endsWith('.md'))
  .map(f => f.replace('.md', ''))
  .sort();

// Get posted dates
let state = { history: [] };
if (fs.existsSync(stateFile)) {
  state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
}
const posted = new Set(state.history.map(h => h.date));

console.log(`📊 Wanders: ${wanders.length} total`);
console.log(`✅ Posted:  ${posted.size}`);
console.log(`⏳ Pending: ${wanders.length - posted.size}\n`);

console.log('--- Posted ---');
for (const date of wanders) {
  if (posted.has(date)) {
    const entry = state.history.find(h => h.date === date);
    console.log(`  ✅ ${date} → ${entry?.tweetId?.slice(0,10) || '?'}...`);
  }
}

console.log('\n--- Not Posted ---');
const unposted = [];
for (const date of wanders) {
  if (!posted.has(date)) {
    // Read title from frontmatter
    const content = fs.readFileSync(path.join(wandersDir, `${date}.md`), 'utf8');
    const titleMatch = content.match(/title:\s*"([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : '?';
    console.log(`  ⏳ ${date} — ${title}`);
    unposted.push({ date, title });
  }
}

console.log(`\n🎯 Next to post: ${unposted[0]?.date} — "${unposted[0]?.title}"`);

// Also output as JSON for automation
if (process.argv[2] === '--json') {
  console.log(JSON.stringify({ posted: [...posted], unposted, next: unposted[0] }, null, 2));
}
