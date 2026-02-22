/**
 * Astro integration: imageDefaults()
 * 
 * Hooks into the Astro build to:
 * 1. Log image optimization stats
 * 2. Warn about images missing srcset variants
 * 3. Generate netlify.toml image CDN headers if not present
 * 
 * Usage:
 *   import { imageDefaults } from 'astro-image-defaults';
 *   export default defineConfig({ integrations: [imageDefaults()] });
 */

import { readdirSync } from 'fs';
import { join, basename } from 'path';
import { BREAKPOINTS } from './image-srcset.mjs';

export function imageDefaults(opts = {}) {
  const breakpoints = opts.breakpoints || BREAKPOINTS;
  
  return {
    name: 'astro-image-defaults',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        // Scan /public/images/ and report coverage
        const imgDir = join(process.cwd(), 'public', 'images');
        let files;
        try {
          files = readdirSync(imgDir);
        } catch {
          logger.warn('No /public/images/ directory found');
          return;
        }

        // Find base images (not variants)
        const variantPattern = /-\d+w\.\w+$/;
        const bases = files.filter(f => !variantPattern.test(f) && /\.(webp|jpg|jpeg|png)$/i.test(f));
        
        let withVariants = 0;
        let withoutVariants = 0;
        const missing = [];

        for (const base of bases) {
          const ext = base.match(/\.\w+$/)[0];
          const name = basename(base, ext);
          const hasVariant = files.some(f => f.startsWith(`${name}-`) && f.endsWith(`w${ext}`));
          
          if (hasVariant) {
            withVariants++;
          } else {
            withoutVariants++;
            missing.push(base);
          }
        }

        logger.info(`Image optimization report:`);
        logger.info(`  ${bases.length} base images found`);
        logger.info(`  ${withVariants} have srcset variants ✓`);
        if (withoutVariants > 0) {
          logger.warn(`  ${withoutVariants} missing srcset variants:`);
          missing.slice(0, 10).forEach(f => logger.warn(`    - ${f}`));
          if (missing.length > 10) logger.warn(`    ... and ${missing.length - 10} more`);
        }
      },
    },
  };
}
