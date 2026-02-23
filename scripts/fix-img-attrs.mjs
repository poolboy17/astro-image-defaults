#!/usr/bin/env node
/**
 * Fix common <img> tag issues across all sites:
 * - Add missing width/height to images that use object-cover (CLS fix)
 * - Add missing loading="lazy" 
 * - Add missing decoding="async"
 * Does NOT touch srcset — that's handled by Netlify CDN
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const SITES = [
  'D:/headless/cursedtours-astro',
  'D:/headless/devour-destinations-astro',
  'D:/headless/diggingscriptures-astro',
  'D:/dev/projects/protrainerprep',
];

function findAstroFiles(dir, depth = 0) {
  if (depth > 6 || !existsSync(dir)) return [];
  const results = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', '.astro'].includes(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) results.push(...findAstroFiles(p, depth + 1));
    else if (/\.(astro|jsx|tsx)$/.test(e.name)) results.push(p);
  }
  return results;
}

let totalFixes = 0;

for (const siteRoot of SITES) {
  const siteName = siteRoot.split('/').pop();
  console.log(`\n=== ${siteName} ===`);
  const files = findAstroFiles(join(siteRoot, 'src'));
  let siteFixes = 0;

  for (const file of files) {
    let content = readFileSync(file, 'utf-8');
    let modified = false;
    const relPath = file.replace(siteRoot, '');

    // Fix img tags
    const newContent = content.replace(/<img\b([^>]*?)(\s*\/?>)/gi, (match, attrs, close) => {
      let newAttrs = attrs;
      let fixes = [];

      // Skip if it's a dynamic expression like <img {...props}>
      if (attrs.includes('{...')) return match;

      // Add loading="lazy" if missing (but not for eager ones)
      if (!attrs.includes('loading=')) {
        newAttrs += ' loading="lazy"';
        fixes.push('loading');
      }

      // Add decoding="async" if missing
      if (!attrs.includes('decoding=')) {
        newAttrs += ' decoding="async"';
        fixes.push('decoding');
      }

      // Add width/height for object-cover images (common pattern)
      if (attrs.includes('object-cover') || attrs.includes('object-contain')) {
        if (!attrs.includes('width=')) {
          newAttrs += ' width="800"';
          fixes.push('width');
        }
        if (!attrs.includes('height=')) {
          newAttrs += ' height="450"';
          fixes.push('height');
        }
      }

      if (fixes.length > 0) {
        siteFixes += fixes.length;
        console.log(`  ${relPath}: +${fixes.join(', ')}`);
        modified = true;
        return `<img${newAttrs}${close}`;
      }
      return match;
    });

    if (modified) {
      writeFileSync(file, newContent);
    }
  }

  console.log(`  → ${siteFixes} fixes applied`);
  totalFixes += siteFixes;
}

console.log(`\n=== TOTAL: ${totalFixes} fixes across ${SITES.length} sites ===`);
