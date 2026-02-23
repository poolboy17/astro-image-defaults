# SEO Audit Agent — Affiliate Sites
# Cowork background task
# EXCLUDES: erin-gee-preview (not an affiliate site)

## Goal
Run the existing SEO audit framework across all 4 affiliate sites, aggregate results into a single cross-site report.

## Architecture Already Built

There is a shared audit framework at `D:\dev\projects\shared-test-utils\` (zero external deps) that all 4 sites already use. Each site has:
- `tests/site.config.mjs` — site-specific check configuration
- `tests/audit.mjs` — runner that discovers pages in dist/, runs checks, prints report

The shared framework checks: heading hierarchy, HTML balance, duplicate IDs, canonical URLs, og:image, meta descriptions, anchor links, content gaps, scroll cadence, visual styling, callout nesting, padding variation.

## Sites

| Site | Repo | Config |
|------|------|--------|
| cursedtours | D:\dev\projects\cursedtours | tests/site.config.mjs |
| devour-destinations | D:\dev\projects\devour-destinations | tests/site.config.mjs |
| diggingscriptures | D:\dev\projects\diggingscriptures | tests/site.config.mjs |
| protrainerprep | D:\dev\projects\protrainerprep | tests/site.config.mjs |

## Tasks

### Step 1: Build each site
For each site repo, run `npm run build`. If the build fails, log the error and skip to the next site.

### Step 2: Run existing audits
For each site, run the existing audit: `node tests/audit.mjs`
Capture the full output (pass/fail/warn counts and details).

### Step 3: Run additional SEO checks NOT in the existing framework
After running the existing audit, also scan every HTML file in dist/ for these additional signals:

**Title tag quality:**
- Length check: ≤60 chars (WARN if >60)
- Uniqueness: flag duplicate titles across the site
- Keyword presence: extract the most common 2-word phrase on the page and check if it appears in the title

**Meta description quality:**
- Length: 120-155 chars ideal (WARN if <80 or >155)
- Uniqueness: flag duplicates across site

**Structured data:**
- Check for any `<script type="application/ld+json">` blocks
- Flag pages with zero structured data
- For pages that have it, validate the JSON parses correctly

**Image optimization:**
- Count images NOT routed through `/.netlify/images` CDN
- Count images missing `srcset`
- Count images missing `alt` text (or alt="")
- Count images missing `width`/`height`

**Internal linking:**
- Run internal linking audit: `node D:\dev\skills\internal-linking\audit-internal-links.mjs ./dist --config ./tests/linking.config.mjs --json`
- Each site has its own `tests/linking.config.mjs` with page types, thresholds, and selectors
- Checks: orphans, under/over-linked, broken links, self-links, bad anchors, dupe anchors

**Affiliate link hygiene:**
- Find all external links
- Check affiliate links have `rel="nofollow sponsored"` or `rel="sponsored nofollow"`
- Check they open in new tab (`target="_blank"`)

**Word count:**
- Extract visible text (strip HTML tags), count words
- Apply site-specific minimums:
  - protrainerprep: Per SEO-QC-GATES.md (Pillar ≥2000, Hub ≥1500, Spoke ≥700)
  - cursedtours: City pages ≥1500, Articles ≥800
  - devour-destinations: Blog posts ≥800
  - diggingscriptures: Articles ≥600

### Step 4: Aggregate and report

Save results to `D:\dev\projects\astro-image-defaults\reports\seo-audit-YYYY-MM-DD.json`

Also save a markdown summary to `D:\dev\projects\astro-image-defaults\reports\seo-summary-YYYY-MM-DD.md`

The markdown summary should have:
- One section per site with pass/fail/warn totals
- Top 5 most critical issues per site
- Cross-site comparison table

## Available Tools

**Google Search Console MCP server** is connected and available for:
- `get_search_performance` — clicks, impressions, CTR, position data
- `inspect_url` — check indexing status of specific URLs
- `get_indexed_urls` — list indexed URLs for a property
- `get_sitemaps` — list submitted sitemaps
- `submit_url_for_indexing` — request indexing of new/updated pages
- `batch_inspect_urls` — bulk URL inspection
- `run_pagespeed_analysis` — PageSpeed Insights scores

Use GSC data to enrich the audit with real search performance metrics when available.

## Important Notes
- All audit code is pure Node.js with zero external dependencies
- `shared-test-utils` is at `D:\dev\projects\shared-test-utils\` — reference it via relative path from each site
- Do NOT modify any site files — this is READ ONLY audit
- Do NOT deploy anything
- Do NOT touch erin-gee-preview
- If a site's build fails, still report that as a critical issue
