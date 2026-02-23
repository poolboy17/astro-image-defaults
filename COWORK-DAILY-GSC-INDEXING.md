# Cowork Task: Submit URLs to Google for Indexing

## What You Do
Every day, submit ~15 URLs to Google Search Console's "Request Indexing" feature using browser automation.

## Files
- **This task file:** `D:\dev\projects\astro-image-defaults\COWORK-DAILY-GSC-INDEXING.md`
- **URL list + tracking:** `D:\dev\projects\astro-image-defaults\GSC-INDEXING-TASK.md`

## Steps

1. Read `D:\devprojects\astro-image-defaults\GSC-INDEXING-TASK.md` with Desktop Commander
2. Find the first batch in the Tracking Progress table that has ⬜ (not yet done)
3. Copy the URLs from that batch
4. Open Chrome and go to `https://search.google.com/search-console?resource_id=sc-domain:cursedtours.com`
5. For each URL in the batch:
   a. Click the search/inspection bar at the top of the page
   b. Paste the URL
   c. Press Enter
   d. Wait for results to load (10-30 seconds)
   e. Click "Request Indexing"
   f. Wait for confirmation (up to 2 minutes)
   g. Move to next URL
6. After finishing the batch, use Desktop Commander to edit `GSC-INDEXING-TASK.md` — change that batch's ⬜ to ✅ and add today's date
7. Done for the day

## Stop If
- Google grays out "Request Indexing" or shows a rate limit error
- A URL already says "URL is on Google" — skip it
- CAPTCHA appears — complete it then continue

## That's It
One batch per day. ~15 URLs. Takes about 20-30 minutes. Repeat tomorrow with the next batch.
