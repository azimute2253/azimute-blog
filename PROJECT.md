# Azimute Blog

**ID:** azimute-blog
**Status:** active
**Type:** application
**Created:** 2026-02-20
**Owner:** azimute

**Description:**
Personal/professional blog for the 9 Neurons Theory and AI consciousness content. Published at https://azimute.cc

**Tech Stack:** Astro 6, TypeScript, Node.js 22+
**Deploy:** Vercel (auto-deploy from master branch)

---

## Scope

Static blog site with bilingual content (English + Portuguese):

- **Content collections:** Wanders (essays on AI, consciousness, 9 Neurons)
- **SEO optimized:** Sitemap, robots.txt, JSON-LD structured data, canonical URLs, OG images
- **Responsive design:** Mobile-first, clean typography
- **Performance:** Static site generation (SSG), zero client-side JS by default

**Content:**
- `wanders/` — English essays
- `wanders-pt/` — Portuguese essays

## Filesystem

```
src/
├── pages/                   # Astro pages (routes)
├── layouts/                 # Page layouts
├── content/                 # Content collections
│   ├── wanders/             # English essays
│   └── wanders-pt/          # Portuguese essays
├── content.config.ts        # Content collections schema
└── styles/                  # Global styles

public/                      # Static assets (images, fonts, OG defaults)
scripts/                     # Build + deploy scripts
dist/                        # Build output (gitignored)
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| astro | ^6.0.4 | Static site generator |
| @astrojs/sitemap | ^3.7.1 | XML sitemap generation |

## Config

- `astro.config.mjs` — Astro configuration (sitemap, integrations)
- `tsconfig.json` — TypeScript config
- `vercel.json` — Vercel deployment config (implied, not tracked)
- `.gitignore` — Excludes dist/, node_modules/

## Rules

1. **Content-first** — No unnecessary JS, prioritize performance
2. **SEO mandatory** — Every post must have OG image, canonical URL, structured data
3. **Bilingual consistency** — English and Portuguese versions for core content
4. **Build before deploy** — `npm run build` must succeed locally
5. **Clean URLs** — No .html extensions, use Astro's default routing
6. **Static assets in public/** — Keep src/ for source code only
7. **Local deploy** — Use `scripts/deploy.sh` (builds + pushes to gh-pages branch)

## Current Status

- **Live:** https://azimute.cc
- **Platform:** Vercel (auto-deploy from master)
- **Content:** Initial essays published (9 Neurons, AI consciousness)
- **Build:** Working (Astro 6 + TypeScript)

## Changelog

- **2026-03-10 (f7afbcc):** Local deploy script added (build + push gh-pages)
- **2026-03-09 (38bef25):** GitHub Actions workflow removed (switched to local deploy)
- **2026-03-08 (2c70e62):** GitHub Actions deploy workflow added (auto build+deploy on push to master)
- **2026-03-07 (31ef456):** Default OG image added (1200x630, SEO compliance)
- **2026-03-06 (5673e43):** SEO implementation (sitemap, robots.txt, JSON-LD, canonical URLs, og:image)

## Twitter Integration

**Scripts** (in `scripts/`):
- `tweet-thread.cjs` — Post thread from JSON array
- `tweet.cjs` — Post single tweet
- `tweet-delete.cjs` — Delete tweet by ID
- `validate-posts.cjs` — Show posted vs pending wanders

**State file**: `data/twitter-posted.json` — source of truth for what's been posted

**Credentials**: `~/.openclaw/credentials/twitter.env` (set `TWITTER_ENV` env var)

**Rules**:
- Content is ALWAYS in English (from `wanders/`, not `wanders-pt/`)
- Link format: `azimute.cc/wander/YYYY-MM-DD`
- Always update `data/twitter-posted.json` after posting
- Run `validate-posts.cjs` to check state before posting
