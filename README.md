# astro-image-defaults

Standard image optimization for Astro sites on Netlify. Belt and suspenders:

1. **Build-time**: Optimize locally, generate webp variants, validate alt text
2. **Edge-time**: Serve through Netlify Image CDN for format negotiation + edge caching

## Architecture

```
src="/images/hero.webp"               ← direct path, always works (fallback)
srcset="/.netlify/images?url=...&w=320 320w,  ← Netlify CDN at each breakpoint
        /.netlify/images?url=...&w=640 640w,
        /.netlify/images?url=...&w=960 960w"
```

- `src` goes direct — progressive enhancement, works without CDN
- `srcset` goes through Netlify CDN — auto format negotiation (webp/avif), edge cached, immutable
- Build layer detects local `{name}-{width}w.webp` variants to determine breakpoints
- If no local variants, uses standard breakpoints: 320, 480, 640, 800, 960, 1200

## Quick Start

### 1. Copy to your project

```bash
cp -r astro-image-defaults/image-srcset.mjs your-site/src/utils/
```

Or use as a local package:
```bash
npm link ../astro-image-defaults
```

### 2. Use in Astro components

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
  alt="Hero"
  loading="eager"
  decoding="async"
/>
```

### 3. Add Netlify headers (netlify.toml)

```toml
[images]
  remote_images = ["https://img.youtube.com/.*"]

[[headers]]
  for = "/.netlify/images/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Vary = "Accept"

[[headers]]
  for = "/images/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## Image Naming Convention

```
public/images/
  hero.webp           ← original (e.g. 1200px)
  hero-320w.webp      ← variant
  hero-480w.webp
  hero-640w.webp
  hero-800w.webp
```

`getImageSrcset()` auto-detects these at build time and uses their widths for srcset breakpoints.

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `defaultWidth` | 800 | Intrinsic width of original image |
| `defaultHeight` | 450 | Intrinsic height of original image |
| `sizes` | responsive | CSS sizes attribute |
| `useCdn` | true | Route srcset through Netlify CDN |

## How It Works

| Image state | src | srcset |
|------------|-----|--------|
| Has local variants | `/images/hero.webp` | CDN URLs at detected widths |
| No local variants | `/images/hero.webp` | CDN URLs at standard breakpoints |
| CDN disabled | `/images/hero.webp` | Local variant paths |
