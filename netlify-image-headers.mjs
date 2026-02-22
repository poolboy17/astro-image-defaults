/**
 * Netlify Image CDN headers generator.
 * 
 * Generates netlify.toml [[headers]] rules that enable Netlify's
 * on-the-fly image transformation CDN for any images that slip
 * through the build-time optimization layer.
 * 
 * How it works:
 * - Netlify Image CDN (/.netlify/images/) transforms images on the edge
 * - URL format: /.netlify/images?url=/images/photo.jpg&w=640&q=80&fm=webp
 * - This module generates the _headers file entries to:
 *   1. Set proper Cache-Control for optimized images
 *   2. Enable content negotiation (auto webp/avif)
 *   3. Add Vary: Accept for format negotiation
 * 
 * Usage in your site:
 *   Option A: Add to netlify.toml manually (see generateTomlHeaders())
 *   Option B: Use the integration to auto-generate _headers file
 * 
 * For the edge CDN to transform images, reference them as:
 *   <img src="/.netlify/images?url=/images/photo.jpg&w=640&fm=webp" />
 * 
 * Or use the helper to generate responsive img tags:
 *   netlifyImageTag('/images/photo.jpg', { widths: [320, 640, 960] })
 */

/**
 * Standard breakpoints for edge transforms.
 */
const EDGE_WIDTHS = [320, 480, 640, 800, 960, 1200, 1600];

/**
 * Generate a Netlify Image CDN URL for a given image.
 * @param {string} imagePath - original path, e.g. "/images/photo.jpg"
 * @param {object} opts
 * @param {number} opts.width
 * @param {number} opts.quality - default 80
 * @param {string} opts.format - "webp" | "avif" | "auto"
 */
export function netlifyImageUrl(imagePath, { width, quality = 80, format = 'webp' } = {}) {
  const params = new URLSearchParams({ url: imagePath });
  if (width) params.set('w', String(width));
  if (quality) params.set('q', String(quality));
  if (format && format !== 'auto') params.set('fm', format);
  return `/.netlify/images?${params}`;
}

/**
 * Generate srcset using Netlify Image CDN for ANY image,
 * even if no local variants exist on disk.
 * This is the edge safety net — it transforms on the fly.
 */
export function netlifyImageSrcset(imagePath, opts = {}) {
  const widths = opts.widths || EDGE_WIDTHS;
  const quality = opts.quality || 80;

  const srcset = widths
    .map(w => `${netlifyImageUrl(imagePath, { width: w, quality })} ${w}w`)
    .join(', ');

  return {
    src: netlifyImageUrl(imagePath, { width: widths[Math.floor(widths.length / 2)], quality }),
    srcset,
    sizes: opts.sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 800px',
  };
}

/**
 * Generate netlify.toml headers block for image optimization.
 * Copy this into your netlify.toml or use as _headers content.
 */
export function generateTomlHeaders() {
  return `
# Image CDN cache headers
[[headers]]
  for = "/.netlify/images/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Vary = "Accept"

# Static images — long cache with revalidation
[[headers]]
  for = "/images/*"
  [headers.values]
    Cache-Control = "public, max-age=604800, stale-while-revalidate=86400"
`.trim();
}

/**
 * Generate _headers file content for Netlify.
 */
export function generateHeadersFile() {
  return `
# Netlify Image CDN — immutable cache
/.netlify/images/*
  Cache-Control: public, max-age=31536000, immutable
  Vary: Accept

# Static images — 7 day cache with stale-while-revalidate
/images/*
  Cache-Control: public, max-age=604800, stale-while-revalidate=86400
`.trim();
}
