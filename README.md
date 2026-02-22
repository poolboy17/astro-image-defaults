# astro-image-defaults

Shared image optimization for Astro sites on Netlify. Two layers:

1. **Build-time** (Option 1): Auto-detects `{name}-{width}w.webp` variants in `/public/images/` and generates srcset strings. Runs at build, zero runtime cost.

2. **Edge-time** (Option 2): Netlify Image CDN transforms images on the fly for anything the build layer missed — CMS uploads, dynamic content, forgotten optimizations.

## Quick Start

### In your Astro component:

```astro
---
import { getImageSrcset } from 'astro-image-defaults';
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
  alt="Hero image"
  loading="eager"
  decoding="async"
/>
```

### As an Astro integration (build report):

```js
// astro.config.mjs
import { imageDefaults } from 'astro-image-defaults';
export default defineConfig({
  integrations: [imageDefaults()],
});
```

### Edge fallback (Netlify Image CDN):

```astro
---
import { netlifyImageSrcset } from 'astro-image-defaults';
// Works for ANY image, even without local variants
const img = netlifyImageSrcset('/images/uploaded-photo.jpg');
---
<img src={img.src} srcset={img.srcset} sizes={img.sizes} alt="..." />
```

## Image Naming Convention

Place variants next to the original in `/public/images/`:

```
hero.webp          (original, e.g. 1200px wide)
hero-320w.webp
hero-480w.webp
hero-640w.webp
hero-800w.webp
hero-960w.webp
```

`getImageSrcset()` auto-detects these at build time.

## Standard Breakpoints

`320, 480, 640, 800, 960, 1200`

## Netlify Headers

Add to your `netlify.toml` for optimal caching:

```toml
[[headers]]
  for = "/.netlify/images/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Vary = "Accept"

[[headers]]
  for = "/images/*"
  [headers.values]
    Cache-Control = "public, max-age=604800, stale-while-revalidate=86400"
```

## How the Two Layers Work Together

| Scenario | Build layer | Edge layer |
|----------|-------------|------------|
| Image with local variants | ✅ srcset from disk | Not needed |
| Image without variants | ⚠️ No srcset | ✅ CDN transforms on-the-fly |
| CMS/dynamic upload | N/A | ✅ CDN transforms on-the-fly |
| YouTube thumbnail | Use MediaCard pattern | Not applicable (external) |
