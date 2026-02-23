# Google Search Console — Manual Indexing Request Task

## Goal
Submit "Request Indexing" for all 209 unindexed sitemap pages on cursedtours.com through the Google Search Console UI. Google rate-limits to ~10-20 requests per day per property, so this will take multiple sessions over ~2 weeks.

## Context
- **Site:** cursedtours.com (GSC property: `sc-domain:cursedtours.com`)
- **Sitemap:** 217 total pages at https://cursedtours.com/sitemap.xml
- **Currently indexed:** Only 8 sitemap pages (homepage, articles index, 3 city hubs, 1 destination, 1 experience, privacy policy)
- **Need indexing:** 209 pages (170 articles, 16 city hubs, 6 destinations, 4 experiences, 6 blog pages, 7 other)
- **~307 junk WordPress URLs** are still in Google's index but have temporary removal requests active — ignore these

## Prerequisites
- Must be logged into the Google account that owns the GSC property
- Browser must be open to: https://search.google.com/search-console?resource_id=sc-domain:cursedtours.com

## Workflow Per URL

1. Click the URL inspection search bar at the top of any GSC page
2. Paste the URL (include trailing slash)
3. Press Enter — wait for inspection results to load (10-30 seconds)
4. Look for the "Request Indexing" link/button
5. Click "Request Indexing"
6. Wait for the "Indexing requested" confirmation (can take 1-2 minutes, there's a loading spinner)
7. Move to the next URL

### Important Notes
- If you see "URL is on Google" — it's already indexed, skip it
- If you see "URL is not on Google" with "Request Indexing" — submit it
- If "Request Indexing" is grayed out or you get a quota error — stop for the day, you've hit the daily limit
- Google may show a CAPTCHA/verification challenge — complete it and continue
- The daily limit is roughly 10-20 URLs. Stop when rate-limited.

## Priority Batches

Submit in this order. Each batch is roughly one day's work.

### BATCH 1 — City Hub Pages (16 URLs) ⭐ HIGHEST PRIORITY
These are your money pages — category hubs that rank for "[city] ghost tours".

```
https://cursedtours.com/austin-ghost-tours/
https://cursedtours.com/boston-ghost-tours/
https://cursedtours.com/charleston-ghost-tours/
https://cursedtours.com/denver-ghost-tours/
https://cursedtours.com/dublin-ghost-tours/
https://cursedtours.com/edinburgh-ghost-tours/
https://cursedtours.com/key-west-ghost-tours/
https://cursedtours.com/london-ghost-tours/
https://cursedtours.com/nashville-ghost-tours/
https://cursedtours.com/new-york-ghost-tours/
https://cursedtours.com/paris-ghost-tours/
https://cursedtours.com/rome-ghost-tours/
https://cursedtours.com/salem-ghost-tours/
https://cursedtours.com/san-antonio-ghost-tours/
https://cursedtours.com/st-augustine-ghost-tours/
https://cursedtours.com/washington-dc-ghost-tours/
```

### BATCH 2 — Destination + Experience + Structural Pages (17 URLs)

```
https://cursedtours.com/destinations/
https://cursedtours.com/destinations/draculas-castle/
https://cursedtours.com/destinations/eastern-state-penitentiary/
https://cursedtours.com/destinations/gettysburg/
https://cursedtours.com/destinations/port-arthur/
https://cursedtours.com/destinations/salem-witch-trials/
https://cursedtours.com/destinations/tower-of-london/
https://cursedtours.com/experiences/
https://cursedtours.com/experiences/paranormal-investigations/
https://cursedtours.com/experiences/pub-crawls/
https://cursedtours.com/experiences/true-crime/
https://cursedtours.com/experiences/walking-tours/
https://cursedtours.com/blog/
https://cursedtours.com/about/
https://cursedtours.com/contact/
https://cursedtours.com/editorial-policy/
https://cursedtours.com/terms/
```

### BATCH 3 — Blog Category Pages (5 URLs)

```
https://cursedtours.com/blog/salem-witch-trials/
https://cursedtours.com/blog/vampire-culture/
https://cursedtours.com/blog/tower-of-london/
https://cursedtours.com/blog/prison-history/
https://cursedtours.com/blog/gettysburg/
https://cursedtours.com/blog/pop-culture/
```


## Tracking Progress

Mark each batch as you complete it:

| Batch | Pages | Type | Status |
|-------|-------|------|--------|
| 1a | 10 | City Hubs (austin thru new-york) | ✅ 2026-02-23 |
| 1b | 6 | City Hubs (paris thru washington-dc) | ⬜ |
| 2 | 17 | Destinations + Experiences + Structure | ⬜ |
| 3 | 6 | Blog Categories | ⬜ |
| 4 | 15 | Articles (A-B) | ⬜ |
| 5 | 15 | Articles (B-C) | ⬜ |
| 6 | 15 | Articles (C-E) | ⬜ |
| 7 | 15 | Articles (E-G) | ⬜ |
| 8 | 15 | Articles (H-K) | ⬜ |
| 9 | 15 | Articles (K-M) | ⬜ |
| 10 | 15 | Articles (M) | ⬜ |
| 11 | 15 | Articles (N-P) | ⬜ |
| 12 | 15 | Articles (P-S) | ⬜ |
| 13 | 15 | Articles (S-T) | ⬜ |
| 14 | 15 | Articles (T-W) | ⬜ |
| 15 | 5 | Articles (W) | ⬜ |
| **TOTAL** | **209** | | |

### Session Log
- **2026-02-23:** Submitted 10/16 city hubs (austin, boston, charleston, denver, dublin, edinburgh, key-west, london, nashville, new-york). Quota exceeded after 10 requests. Remaining: paris, rome, salem, san-antonio, st-augustine, washington-dc.

## Timeline Estimate
- ~10-15 URLs per day (conservative daily limit)
- ~16 batches = **~16 working days (3+ weeks)**
- Batches 1-3 (high priority structural pages) = done in first 3-4 days
- Articles will take remaining ~12 days

## Tips
- Best time to submit: morning (US time) — GSC seems more responsive
- If a URL shows "Crawled - currently not indexed" that's fine, still request indexing
- If a URL shows "Discovered - currently not indexed" — definitely request indexing
- After submitting Batch 1 (city hubs), check back in 2-3 days to see if they got indexed
- URLs typically appear in search results 2-14 days after requesting indexing

## Tracking Progress (duplicate removed)
| 3 | 6 | Blog Categories | ⬜ |
| 4 | 15 | Articles (A-B) | ⬜ |
| 5 | 15 | Articles (B-C) | ⬜ |
| 6 | 15 | Articles (C-E) | ⬜ |
| 7 | 15 | Articles (E-G) | ⬜ |
| 8 | 15 | Articles (H-K) | ⬜ |
| 9 | 15 | Articles (K-M) | ⬜ |
| 10 | 15 | Articles (M) | ⬜ |
| 11 | 15 | Articles (N-P) | ⬜ |
| 12 | 15 | Articles (P-S) | ⬜ |
| 13 | 15 | Articles (S-T) | ⬜ |
| 14 | 15 | Articles (T-W) | ⬜ |
| 15 | 5 | Articles (W) | ⬜ |
| **TOTAL** | **209** | | |

## Timeline Estimate
- ~15 URLs per day (conservative daily limit)
- 15 batches = **~15 working days (3 weeks)**
- Batches 1-3 (high priority structural pages) = done in first 3 days
- Articles will take remaining ~12 days

## Tips
- Best time to submit: morning (US time) — GSC seems more responsive
- If a URL shows "Crawled - currently not indexed" that's fine, still request indexing
- If a URL shows "Discovered - currently not indexed" — definitely request indexing
- After submitting Batch 1 (city hubs), check back in 2-3 days to see if they got indexed
- URLs typically appear in search results 2-14 days after requesting indexing
