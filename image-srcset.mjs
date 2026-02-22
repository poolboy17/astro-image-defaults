/**
 * Build-time srcset with Netlify CDN URLs.
 * 
 * Scans /public/images/ for {name}-{width}w.{ext} variants to
 * determine available breakpoints, then generates srcset pointing
 * through Netlify Image CDN for edge delivery.
 * 
 * Architecture:
 *   src  = /images/hero.webp (direct, fallback)
 *   srcset = /.netlify/images?url=/images/hero.webp&w=320 320w, ...
 */

import { readdirSync } from 'fs';
import { join, basename } from 'path';

export const BREAKPOINTS = [320, 480, 640, 800, 960, 1200];

let _cache = null;
function getImageFiles() {
  if (_cache) return _cache;
  try { _cache = new Set(readdirSync(join(process.cwd(), 'public', 'images'))); }
  catch { _cache = new Set(); }
  return _cache;
}
function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/** Netlify Image CDN URL */
function cdnUrl(imagePath, width) {
  return `/.netlify/images?url=${encodeURIComponent(imagePath)}&w=${width}`;
}

/**
 * Generate optimized image attributes.
 * 
 * @param {string} imagePath - e.g. "/images/hero.webp"
 * @param {object} opts
 * @param {string} opts.sizes - CSS sizes attribute
 * @param {number} opts.defaultWidth - intrinsic width of the original
 * @param {number} opts.defaultHeight - intrinsic height of the original
 * @param {boolean} opts.useCdn - route srcset through Netlify CDN (default: true)
 * @returns {{ src, srcset, sizes, width, height }}
 */
export function getImageSrcset(imagePath, opts = {}) {
  const useCdn = opts.useCdn !== false;
  const maxWidth = opts.defaultWidth || 800;
  const files = getImageFiles();
  const ext = imagePath.match(/\.\w+$/)?.[0] || '.webp';
  const name = basename(imagePath, ext);

  // Detect local variant widths
  const localWidths = [];
  const pattern = new RegExp(`^${esc(name)}-(\\d+)w${esc(ext)}$`);
  for (const file of files) {
    const m = file.match(pattern);
    if (m) localWidths.push(+m[1]);
  }
  localWidths.sort((a, b) => a - b);

  // Use detected widths if available, otherwise standard breakpoints
  const widths = localWidths.length > 0
    ? localWidths
    : BREAKPOINTS.filter(w => w <= maxWidth);

  let srcset;
  if (widths.length > 0) {
    const parts = widths.map(w =>
      useCdn ? `${cdnUrl(imagePath, w)} ${w}w` : `/images/${name}-${w}w${ext} ${w}w`
    );
    // Add full-size original
    parts.push(useCdn ? `${cdnUrl(imagePath, maxWidth)} ${maxWidth}w` : `${imagePath} ${maxWidth}w`);
    srcset = parts.join(', ');
  }

  return {
    src: imagePath,
    srcset,
    sizes: opts.sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 800px',
    width: maxWidth,
    height: opts.defaultHeight || 450,
  };
}
