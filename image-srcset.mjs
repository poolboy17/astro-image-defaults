/**
 * Build-time srcset auto-detection.
 * Scans /public/images/ for {name}-{width}w.{ext} variants.
 * 
 * Usage:
 *   import { getImageSrcset } from 'astro-image-defaults';
 *   const img = getImageSrcset('/images/hero.webp', { defaultWidth: 1200, defaultHeight: 800 });
 *   // img.srcset = "/images/hero-320w.webp 320w, /images/hero-640w.webp 640w, ..."
 */

import { readdirSync } from 'fs';
import { join, basename } from 'path';

let _cache = null;

function getImageFiles() {
  if (_cache) return _cache;
  try {
    _cache = new Set(readdirSync(join(process.cwd(), 'public', 'images')));
  } catch {
    _cache = new Set();
  }
  return _cache;
}

function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/**
 * Standard breakpoints used across all sites.
 * Matches common device widths and typical grid layouts.
 */
export const BREAKPOINTS = [320, 480, 640, 800, 960, 1200];

/**
 * Default quality settings.
 */
export const DEFAULTS = {
  quality: 85,
  format: 'webp',
  sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 800px',
};

/**
 * Auto-detect srcset variants for a given image path.
 * Looks for files matching {basename}-{width}w.{ext} in /public/images/.
 * 
 * @param {string} imagePath - e.g. "/images/hero.webp"
 * @param {object} opts
 * @param {string} opts.sizes - CSS sizes attribute
 * @param {number} opts.defaultWidth - intrinsic width of the src image
 * @param {number} opts.defaultHeight - intrinsic height of the src image
 * @returns {{ src, srcset, sizes, width, height }}
 */
export function getImageSrcset(imagePath, opts = {}) {
  const files = getImageFiles();
  const ext = imagePath.match(/\.\w+$/)?.[0] || '.webp';
  const name = basename(imagePath, ext);
  
  const variants = [];
  const pattern = new RegExp(`^${esc(name)}-(\\d+)w${esc(ext)}$`);

  for (const file of files) {
    const m = file.match(pattern);
    if (m) variants.push({ path: `/images/${file}`, width: +m[1] });
  }

  variants.sort((a, b) => a.width - b.width);

  let srcset;
  if (variants.length > 0) {
    const parts = variants.map(v => `${v.path} ${v.width}w`);
    if (opts.defaultWidth && files.has(basename(imagePath))) {
      parts.push(`${imagePath} ${opts.defaultWidth}w`);
    }
    srcset = parts.join(', ');
  }

  return {
    src: imagePath,
    srcset,
    sizes: opts.sizes || DEFAULTS.sizes,
    width: opts.defaultWidth || 800,
    height: opts.defaultHeight || 450,
  };
}
