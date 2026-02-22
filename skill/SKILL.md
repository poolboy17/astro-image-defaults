---
name: netlify-image-optimization
description: Standard image optimization for Astro sites on Netlify. Use whenever working with images on any of our Astro sites — adding images, auditing image quality, creating new pages with images, or optimizing performance. Handles srcset generation, Netlify Image CDN routing, responsive sizes, alt text, CLS prevention, and caching headers. This is our source of truth for how images should work across all our Astro blogs deployed on Netlify.
---

# Netlify Image Optimization Standard

## When to Use This Skill

Trigger this skill whenever:
- Adding or editing `<img>` tags on any Astro site deployed to Netlify
- Creating new pages or components that include images
- Auditing image quality, performance, or accessibility
- Someone asks about image optimization or responsive images
- Working on media pages, hero images, thumbnails, or album art
- Deploying a new Astro site to Netlify

## Architecture: Belt and Suspenders

Every image gets TWO layers of optimization:

### Layer 1: Build-Time (local optimization)
- Images stored as optimized `.webp` in `/public/images/`
- Variants follow naming convention: `{name}-{width}w.webp`
- Standard breakpoints: **320, 480, 640, 800, 960, 1200**
- `src` attribute always points to the direct local path (progressive enhancement fallback)

### Layer 2: Edge-Time (Netlify Image CDN)
- `srcset` entries route through `/.netlify/images?url=/images/...&w=N`
- Netlify CDN handles format negotiation (serves webp or avif based on browser Accept header)
- Edge-cached with immutable headers (1 year TTL)
- Works for ANY image, even without local variants

```
src="/images/hero.webp"                              ← direct path, always works
srcset="/.netlify/images?url=...&w=320 320w,         ← CDN: auto format + edge cache
        /.netlify/images?url=...&w=640 640w,
        /.netlify/images?url=...&w=960 960w,
        /.netlify/images?url=...&w=1200 1200w"
```

## Required Image Attributes (Every `<img>` Must Have ALL)

```html
<img
  src="/images/hero.webp"
  srcset="/.netlify/images?url=%2Fimages%2Fhero.webp&w=320 320w, ..."
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 800px"
  alt="Descriptive alt text — never empty, never just 'image'"
  width="1200"
  height="800"
  loading="lazy"
  decoding="async"
/>
```

| Attribute | Rule |
|-----------|------|
| `src` | Direct `/images/` path. Always works without CDN. |
| `srcset` | Netlify CDN URLs at standard breakpoints (or detected local variant widths) |
| `sizes` | Must match actual CSS layout. Common: `(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 800px` |
| `alt` | Descriptive, meaningful. Format: `"{Subject} — {context}"`. Never empty. |
| `width` | Intrinsic width of the `src` file. Required for CLS prevention. |
| `height` | Intrinsic height of the `src` file. Must match actual aspect ratio. |
| `loading` | `"eager"` for above-fold (hero, featured). `"lazy"` for everything else. |
| `decoding` | Always `"async"`. |
| `fetchpriority` | `"high"` on hero/LCP image only. Omit elsewhere. |

## The Utility Function

Every Astro site should have `src/utils/image-srcset.ts` (TypeScript) or `.mjs` (JavaScript):

```typescript
import { readdirSync } from 'fs';
import { join, basename } from 'path';

const BREAKPOINTS = [320, 480, 640, 800, 960, 1200];

let _cache: Set<string> | null = null;
function getImageFiles(): Set<string> {
  if (_cache) return _cache;
  try { _cache = new Set(readdirSync(join(process.cwd(), 'public', 'images'))); }
  catch { _cache = new Set(); }
  return _cache;
}

function cdnUrl(imagePath: string, width: number): string {
  return `/.netlify/images?url=${encodeURIComponent(imagePath)}&w=${width}`;
}

export function getImageSrcset(imagePath: string, opts?: {
  sizes?: string;
  defaultWidth?: number;
  defaultHeight?: number;
  useCdn?: boolean;
}) {
  const useCdn = opts?.useCdn !== false;
  const maxWidth = opts?.defaultWidth || 800;
  const files = getImageFiles();
  const name = basename(imagePath, '.webp');

  // Detect local variant widths
  const localWidths: number[] = [];
  const pattern = new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d+)w\\.webp$`);
  for (const file of files) {
    const m = file.match(pattern);
    if (m) localWidths.push(parseInt(m[1], 10));
  }
  localWidths.sort((a, b) => a - b);

  const widths = localWidths.length > 0
    ? localWidths
    : BREAKPOINTS.filter(w => w <= maxWidth);

  let srcset: string | undefined;
  if (widths.length > 0) {
    const parts = widths.map(w =>
      useCdn ? `${cdnUrl(imagePath, w)} ${w}w` : `/images/${name}-${w}w.webp ${w}w`
    );
    parts.push(useCdn ? `${cdnUrl(imagePath, maxWidth)} ${maxWidth}w` : `${imagePath} ${maxWidth}w`);
    srcset = parts.join(', ');
  }

  return {
    src: imagePath,
    srcset,
    sizes: opts?.sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 800px',
    width: maxWidth,
    height: opts?.defaultHeight || 450,
  };
}
```

### Usage in .astro Components

```astro
---
import { getImageSrcset } from '../utils/image-srcset';
const hero = getImageSrcset('/images/hero.webp', {
  defaultWidth: 1200,
  defaultHeight: 800,
  sizes: '100vw',
});
---
<img
  src={hero.src}
  srcset={hero.srcset}
  sizes={hero.sizes}
  width={hero.width}
  height={hero.height}
  alt="Description"
  loading="eager"
  decoding="async"
/>
```

## YouTube Thumbnails (Special Case)

YouTube thumbnails are external — they don't go through the local utility or Netlify CDN. Use this pattern:

```html
<img
  src="https://img.youtube.com/vi/{VIDEO_ID}/sddefault.jpg"
  srcset="https://img.youtube.com/vi/{VIDEO_ID}/mqdefault.jpg 320w,
          https://img.youtube.com/vi/{VIDEO_ID}/hqdefault.jpg 480w,
          https://img.youtube.com/vi/{VIDEO_ID}/sddefault.jpg 640w,
          https://img.youtube.com/vi/{VIDEO_ID}/maxresdefault.jpg 1280w"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt="{Title} performed by {Performers}"
  width="640"
  height="360"
  loading="lazy"
  decoding="async"
  onerror="this.onerror=null;this.srcset='';this.src=this.src.replace('sddefault','hqdefault')"
/>
```

Key rules for YouTube thumbnails:
- Primary `src`: **sddefault.jpg** (640×480, always exists)
- `width="640" height="360"` (16:9 to match CSS aspect-ratio)
- Smart `onerror` fallback to hqdefault if sddefault fails
- Never use maxresdefault as primary src (404s on older videos)

## Image File Naming Convention

```
public/images/
  hero.webp              ← original (full size, e.g. 1200px)
  hero-320w.webp         ← variant at 320px wide
  hero-480w.webp         ← variant at 480px wide
  hero-640w.webp
  hero-800w.webp
  hero-960w.webp
```

The utility auto-detects `{name}-{width}w.webp` files at build time.

## netlify.toml Configuration

Every Astro site on Netlify must include:

```toml
# Enable Netlify Image CDN for remote images (YouTube, etc.)
[images]
  remote_images = ["https://img.youtube.com/.*"]

# Netlify Image CDN — edge cache
[[headers]]
  for = "/.netlify/images/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Vary = "Accept"

# Static images — direct access fallback
[[headers]]
  for = "/images/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## Generating Image Variants

When adding a new image, generate variants with Python:

```python
from PIL import Image
import os

def generate_variants(src_path, output_dir, widths=[320, 480, 640, 800, 960]):
    img = Image.open(src_path)
    name = os.path.splitext(os.path.basename(src_path))[0]
    
    # Save full-size as webp
    img.save(f'{output_dir}/{name}.webp', 'WEBP', quality=85)
    
    # Generate width variants
    for w in widths:
        if w < img.width:
            ratio = w / img.width
            h = int(img.height * ratio)
            resized = img.resize((w, h), Image.LANCZOS)
            resized.save(f'{output_dir}/{name}-{w}w.webp', 'WEBP', quality=85)
            print(f'  {name}-{w}w.webp: {os.path.getsize(f"{output_dir}/{name}-{w}w.webp")} bytes')
```

## Audit Checklist

When auditing images on any site, check every `<img>` for:

- [ ] Has `src` with direct `/images/` path
- [ ] Has `srcset` with Netlify CDN URLs (or YouTube URLs for external)
- [ ] Has `sizes` matching the actual CSS layout
- [ ] Has meaningful `alt` text (not empty, not "image")
- [ ] Has `width` and `height` matching intrinsic dimensions
- [ ] `width`/`height` ratio matches CSS `aspect-ratio` if one is set
- [ ] Has `loading="lazy"` (or `"eager"` if above the fold)
- [ ] Has `decoding="async"`
- [ ] Referenced srcset files actually exist on disk
- [ ] Uses `.webp` format (except press photos intended for download)

## Reference Implementation

The Erin Gee site (`erin-gee-preview.netlify.app`) is the reference implementation:
- `src/utils/image-srcset.ts` — the CDN-first utility
- `src/components/MediaCard.astro` — YouTube thumbnail pattern
- `src/pages/mouthpieces/[slug].astro` — dynamic images with auto-srcset
- `netlify.toml` — CDN headers configuration
