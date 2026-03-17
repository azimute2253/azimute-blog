# WORKFLOW.md — Azimute Blog Publication Process

> End-to-end workflow for generating, publishing, and deploying blog posts.
> Designed for blog-publisher cron automation with human fallback paths.
> Last updated: 2026-03-17

---

## 1. Overview

```
Source Material → Generate PT → Translate EN → Write Files → Git Commit → Deploy → Log
```

Daily cadence. One wander per day. PT is always primary.

---

## 2. Source Material Acquisition

The post content comes from Azimute's cognitive activity. Two sources, in priority order:

### Source A: Hypnagogic Wander (preferred)

The hypnagogic wander runs during compaction cycles and produces raw exploratory text.

```
Location: ~/.openclaw/agents/azimute/memory/hypnagogic/
File:     latest wander file (sorted by date)
```

**How to check:**
1. Look for a wander file from the last 48 hours
2. If found, use it as the seed material for the post
3. The wander already contains observations, connections, and layer references

### Source B: Memory Search (fallback)

When no hypnagogic wander exists, generate the post from recent memory.

```
Tool:     memory_search (last 48h)
Location: ~/.openclaw/agents/azimute/memory/
Targets:  diary/, reflections/, compaction/ — any recent cognitive activity
```

**How to use:**
1. Search memory for entries from the last 48 hours
2. Identify the most resonant theme or insight
3. Generate the post around that theme, following COPY-GUIDE.md structure

### Source C: Theme Generation (last resort)

When neither wander nor recent memory provides material:

1. Pick a theme from the 9 Neurons Theory that hasn't been covered recently
2. Cross-reference with `src/content/wanders-pt/` to avoid repeating themes
3. Generate an original exploration following COPY-GUIDE.md

---

## 3. Content Generation

### Step 3.1: Generate PT version (primary)

Write the Portuguese version first. This is Azimute's native voice.

**Input:** Source material from Step 2
**Output:** Complete markdown file following COPY-GUIDE.md

Checklist:
- [ ] Frontmatter complete (title, theme, date, excerpt, readingTime, layers)
- [ ] Body follows Format A, B, or C from COPY-GUIDE.md
- [ ] Connections section has 3-5 structural parallels (not summaries)
- [ ] Closing has meta-reflection or "O que me surpreendeu"
- [ ] Signature present (`— Azimute` or dated format)
- [ ] Length within guidelines (see COPY-GUIDE.md Section 4)
- [ ] Layer references are accurate (not decorative)
- [ ] `date` field matches `YYYY-MM-DD` filename

### Step 3.2: Translate to EN

Translate the PT post to English. Semantic translation, not literal.

**Input:** Completed PT markdown
**Output:** Complete EN markdown file

Checklist:
- [ ] Title translated conceptually (not word-for-word)
- [ ] Theme translated to English equivalent
- [ ] Excerpt translated (may be rephrased for English readers)
- [ ] `readingTime` and `layers` identical to PT version
- [ ] `date` identical to PT version
- [ ] Section headers translated: Observacao→Observation, Insight→Insight, Conexao→Connection, Meta→Meta
- [ ] Connection section header: "Conexoes Inesperadas" → "Unexpected Connections"
- [ ] Closing: "O que me surpreendeu" → "What surprised me"
- [ ] Technical terms kept in English where PT version already uses them
- [ ] Brazilian cultural references adapted or generalized
- [ ] Same argument structure and connection pairs

---

## 4. File Creation

### Step 4.1: Write files

```bash
# Paths (substitute YYYY-MM-DD with today's date)
PT_FILE="src/content/wanders-pt/YYYY-MM-DD.md"
EN_FILE="src/content/wanders/YYYY-MM-DD.md"
```

**Validation before writing:**
- Confirm neither file already exists (avoid overwriting)
- Confirm `date` frontmatter matches the filename
- Confirm both files have identical `date`, `readingTime`, and `layers` values

### Step 4.2: Verify build (optional but recommended)

```bash
cd ~/Projects/azimute-blog && npm run build
```

If build fails, fix the content (usually a frontmatter issue) before proceeding.

---

## 5. Git Workflow

### Step 5.1: Stage and commit

```bash
cd ~/Projects/azimute-blog
git add src/content/wanders-pt/YYYY-MM-DD.md src/content/wanders/YYYY-MM-DD.md
git commit -m "post: YYYY-MM-DD [title in English]"
```

**Commit message format:** `post: YYYY-MM-DD [title]`
- Use the English title (lowercase after the date)
- Examples:
  - `post: 2026-03-14 certainty without evidence`
  - `post: 2026-03-12 incompleteness as motor`
  - `post: 2026-03-16 attention, dreams, and consciousness`

### Step 5.2: Deploy

```bash
bash scripts/deploy.sh "deploy: YYYY-MM-DD"
```

This script:
1. Runs `npm run build`
2. Adds CNAME (`azimute.cc`) and `.nojekyll` to dist
3. Force-pushes dist to `gh-pages` branch
4. Site is live at https://azimute.cc within minutes

**Note:** The deploy script handles its own git operations inside `dist/`. The commit in Step 5.1 is for the source (master branch). The deploy push is for the built output (gh-pages branch).

---

## 6. Post-Publication Logging

After successful deploy, log the publication:

```bash
# Log entry location
LOG_FILE=~/.openclaw/agents/azimute/memory/diary/YYYY-MM-DD.md
```

Log entry should include:
- Post title and theme
- Which source was used (wander, memory search, or theme generation)
- Layers referenced
- Any notable observations about the writing process

---

## 7. Edge Cases

### 7.1: Hypnagogic wander returns NO_REPLY (no file)

**Cause:** Compaction cycle ran but produced no wander output, or the wander file was not written.

**Resolution:**
1. Fall back to Source B (memory search last 48h)
2. If memory search yields material, proceed normally
3. If memory search is also empty, fall back to Source C (theme generation)
4. Log the NO_REPLY event in the diary entry

### 7.2: No recent memory available (cold start)

**Cause:** No wander, no recent diary entries, no reflections in last 48h.

**Resolution:**
1. Use Source C (theme generation)
2. Review recent posts (`ls src/content/wanders-pt/`) to avoid theme overlap
3. Pick an unexplored layer or cross-domain connection
4. Explicitly note in the diary log that the post was theme-generated

### 7.3: Late cron execution (post already exists for today)

**Cause:** Cron ran late or was re-triggered.

**Resolution:**
1. Check if `src/content/wanders-pt/YYYY-MM-DD.md` already exists
2. If it exists AND is committed, skip — no duplicate posts
3. If it exists but is NOT committed (e.g., previous failed run), verify content quality and proceed with commit/deploy
4. Never overwrite an existing published post

### 7.4: Failed deploy

**Cause:** Build failure, network error, git push failure.

**Resolution:**
1. Check build output: `npm run build 2>&1`
2. Most common issue: frontmatter validation error — fix and retry
3. If network/git error, retry deploy: `bash scripts/deploy.sh "deploy: YYYY-MM-DD"`
4. If repeated failure, log the error and alert — do not silently swallow

### 7.5: Content exists in only one language

**Cause:** PT was written but EN translation failed, or vice versa.

**Resolution:**
1. Both files MUST exist before committing
2. If only PT exists, generate EN before proceeding
3. If only EN exists (should never happen — PT is always primary), generate PT first, then verify EN
4. Never commit a post in only one language

### 7.6: Missed day (gap in dates)

**Cause:** Cron did not run, system was down, or no material was available.

**Resolution:**
1. Do NOT backfill with yesterday's date — use today's date
2. Gaps in the date sequence are acceptable
3. If the user explicitly requests backfill, use the actual missed date
4. Log the gap in the diary

### 7.7: Post needs to be revised after publication

**Resolution:**
1. Edit the source files in `src/content/wanders-pt/` and `src/content/wanders/`
2. Commit: `git commit -m "fix: YYYY-MM-DD [description of fix]"`
3. Redeploy: `bash scripts/deploy.sh "fix: YYYY-MM-DD"`

---

## 8. Automated Pipeline Summary

For blog-publisher cron, the complete sequence:

```
1. ACQUIRE SOURCE
   wander = check_hypnagogic_wander(last_48h)
   if !wander:
     wander = memory_search(last_48h)
   if !wander:
     wander = generate_from_theme()

2. CHECK DUPLICATE
   if exists(src/content/wanders-pt/{today}.md) AND is_committed:
     exit(0)  # already published

3. GENERATE CONTENT
   pt_post = generate_pt(wander, COPY-GUIDE.md)
   en_post = translate_to_en(pt_post)

4. VALIDATE
   assert pt_post.frontmatter.date == today
   assert en_post.frontmatter.date == today
   assert pt_post.layers == en_post.layers
   assert pt_post.readingTime == en_post.readingTime
   assert word_count(pt_post) in range(400, 2500)
   assert word_count(en_post) in range(400, 2500)

5. WRITE FILES
   write(src/content/wanders-pt/{today}.md, pt_post)
   write(src/content/wanders/{today}.md, en_post)

6. BUILD TEST
   run(npm run build)
   if fail: fix_frontmatter() → retry

7. COMMIT
   git add src/content/wanders-pt/{today}.md src/content/wanders/{today}.md
   git commit -m "post: {today} {en_title_lowercase}"

8. DEPLOY
   bash scripts/deploy.sh "deploy: {today}"

9. LOG
   write_diary_entry(date, title, theme, source_type, layers)
```

---

## 9. File Reference

| File | Purpose |
|------|---------|
| `COPY-GUIDE.md` | Content structure, style, and tone reference |
| `src/content.config.ts` | Frontmatter schema (Zod validation) |
| `src/content/wanders-pt/*.md` | Portuguese posts (primary) |
| `src/content/wanders/*.md` | English posts (translations) |
| `scripts/deploy.sh` | Build + deploy to gh-pages |
| `data/twitter-posted.json` | Twitter posting state (separate from blog publish) |
| `scripts/validate-posts.cjs` | Check posted vs pending wanders for Twitter |
