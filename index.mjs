/**
 * astro-image-defaults
 * 
 * Standard image optimization for Astro sites on Netlify.
 * 
 * Architecture (belt and suspenders):
 *   1. Build-time: optimize locally, validate, generate variants
 *   2. Edge-time: serve ALL images through Netlify Image CDN
 *      - src = direct /images/ path (fallback, always works)
 *      - srcset = /.netlify/images?url=...&w=N (CDN-optimized)
 *      - Netlify handles format negotiation + edge caching
 * 
 * Usage:
 *   import { getImageSrcset } from 'astro-image-defaults';
 *   const img = getImageSrcset('/images/hero.webp', { defaultWidth: 1200 });
 *   // img.src = "/images/hero.webp"
 *   // img.srcset = "/.netlify/images?url=...&w=320 320w, ..."
 */

export { getImageSrcset, BREAKPOINTS } from './image-srcset.mjs';
export { imageDefaults } from './integration.mjs';
export { netlifyImageUrl, netlifyImageSrcset, generateTomlHeaders } from './netlify-image-headers.mjs';
