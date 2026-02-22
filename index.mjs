/**
 * astro-image-defaults
 * 
 * Shared image optimization for Astro sites on Netlify.
 * Two layers:
 *   1. Build-time: auto-detect srcset variants from /public/images/
 *   2. Edge-time: Netlify Image CDN headers for outliers
 * 
 * Usage in astro.config.mjs:
 *   import { imageDefaults } from 'astro-image-defaults';
 *   export default defineConfig({
 *     integrations: [imageDefaults()],
 *   });
 */

export { getImageSrcset } from './image-srcset.mjs';
export { imageDefaults } from './integration.mjs';
export { netlifyImageHeaders } from './netlify-image-headers.mjs';
