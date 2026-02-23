/**
 * Route any image URL through Netlify Image CDN.
 * 
 * - External URLs → /.netlify/images?url=<encoded>&w=<width>
 * - Local /images/ paths → /.netlify/images?url=<path>&w=<width>
 * - Already CDN URLs → pass through
 * 
 * @param {string} url - Image URL (external or local)
 * @param {number} [width] - Desired width (optional)
 * @returns {string} CDN-routed URL
 */
export function cdnImage(url: string, width?: number): string {
  if (!url) return url;
  
  // Already a CDN URL
  if (url.startsWith('/.netlify/images')) return url;
  
  const params = new URLSearchParams();
  params.set('url', url);
  if (width) params.set('w', String(width));
  
  return `/.netlify/images?${params}`;
}

/**
 * Generate srcset string through Netlify CDN.
 * 
 * @param {string} url - Image URL
 * @param {number[]} [widths] - Breakpoint widths
 * @returns {string} srcset attribute value
 */
export function cdnSrcset(
  url: string,
  widths: number[] = [320, 480, 640, 800]
): string {
  return widths
    .map(w => `${cdnImage(url, w)} ${w}w`)
    .join(', ');
}
