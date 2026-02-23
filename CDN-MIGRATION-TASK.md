# Netlify Image CDN Migration — All Sites

## Goal
Route ALL images (external and local) through Netlify Image CDN (`/.netlify/images?url=...`) across 4 Astro sites. Every `<img>` tag should use the `<CdnImage>` component which wraps URLs through the CDN with srcset.

## Context
- The utility file `src/utils/cdn-image.ts` and component `src/components/CdnImage.astro` already exist in all 4 sites
- The `netlify.toml` `[images]` `remote_images` allowlists are already deployed
- A first pass was attempted on cursedtours but import paths broke for nested pages — needs fixing

## Sites

1. **D:\dev\projects\cursedtours** (cursedtours.com)
   - 151 `<img>` tags already rewritten to `<CdnImage>` but BUILD IS BROKEN — import paths wrong for nested pages like `src/pages/destinations/[slug].astro`
   - Fix: all imports must use the correct relative path depth (`../../components/CdnImage.astro` for files in subdirectories)
   - External images: TripAdvisor CDN URLs in `src/data/cityTours.ts` and `src/data/destinations.ts`
   - Local images: `/images/articles/*.webp`, `/images/destinations/*.webp`

2. **D:\dev\projects\devour-destinations** (devourdestinations.com)
   - External images: TripAdvisor CDN + Unsplash URLs
   - Unsplash URLs are in JS variables (e.g. `const heroImage = "https://images.unsplash.com/..."`)
   - TripAdvisor URLs likely in data files
   - Replace all `<img>` with `<CdnImage>`, fix import paths by depth

3. **D:\dev\projects\diggingscriptures** (diggingscriptures.com)
   - 4 TripAdvisor images + local images
   - Smaller site, fewer changes needed

4. **D:\dev\projects\protrainerprep** (protrainerprep.com)
   - ~25 Pexels external images
   - Images referenced in frontmatter and page templates

## The CdnImage Component (already in all sites)

Located at `src/components/CdnImage.astro`:
- Accepts same props as `<img>`: src, alt, width, height, loading, class, etc.
- Automatically wraps `src` through `/.netlify/images?url=<encoded>&w=<width>`
- Generates srcset at breakpoints [320, 480, 640, 800]
- Adds sizes attribute

The utility at `src/utils/cdn-image.ts` exports:
- `cdnImage(url, width?)` — wraps URL through CDN
- `cdnSrcset(url, widths?)` — generates srcset string

## Tasks per site

1. Find every `<img>` tag in `.astro` files under `src/`
2. Replace with `<CdnImage>` preserving all attributes (alt, class, width, height, loading, decoding)
3. Add the correct import at the top of the frontmatter: `import CdnImage from '<correct-relative-path>/components/CdnImage.astro';`
   - CRITICAL: The relative path depends on the file's depth. `src/pages/index.astro` → `../components/CdnImage.astro`, `src/pages/destinations/[slug].astro` → `../../components/CdnImage.astro`, etc.
4. Do NOT rewrite `<img>` tags that are for SVGs, favicons, or og:image meta tags
5. Do NOT rewrite `<img>` inside `<noscript>` tags
6. After all rewrites, run `npm run build` to verify zero errors
7. If build fails, fix the errors (usually import path depth issues)
8. `git add -A && git commit -m "Route all images through Netlify Image CDN" && git push origin main`

## Verification
After each site, run `npm run build` and check:
- Zero build errors
- Output HTML contains `/.netlify/images?url=` in img src attributes
- srcset attributes present on image tags

## Important
- Do NOT modify `netlify.toml` — already done
- Do NOT modify `cdn-image.ts` or `CdnImage.astro` — already correct
- Focus only on replacing `<img>` → `<CdnImage>` with correct imports
- Skip any `<img>` inside HTML strings, markdown content, or JS template literals that aren't Astro templates
