#!/usr/bin/env node
/**
 * Rewrites <img> tags in Astro files to use <CdnImage> component.
 * Only rewrites images with external URLs or /images/ paths.
 * 
 * Usage: node scripts/rewrite-to-cdn.mjs <site-root>
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const siteRoot = process.argv[2];
if (!siteRoot) {
  console.error('Usage: node scripts/rewrite-to-cdn.mjs <site-root>');
  process.exit(1);
}

// Find all .astro files with <img tags
const files = execSync(
  `grep -rl "<img " "${siteRoot}/src/" --include="*.astro"`,
  { encoding: 'utf-8' }
).trim().split('\n').filter(Boolean);

console.log(`Found ${files.length} files with <img> tags`);

let totalRewrites = 0;

for (const file of files) {
  let content = readFileSync(file, 'utf-8');
  let changed = false;
  
  // Check if CdnImage is already imported
  const hasCdnImport = content.includes('CdnImage');
  
  // Find img tags with dynamic src (JSX expressions) containing .image or Image
  // These are the ones pulling from data files with external URLs
  const imgPattern = /<img\s+([^>]*?)src=\{([^}]+)\}([^>]*?)\/?\s*>/g;
  let match;
  const replacements = [];
  
  while ((match = imgPattern.exec(content)) !== null) {
    const full = match[0];
    const before = match[1];
    const srcExpr = match[2];
    const after = match[3];
    
    // Extract alt from the attributes
    const altMatch = (before + after).match(/alt=(?:\{([^}]+)\}|"([^"]*)")/);
    const alt = altMatch 
      ? (altMatch[1] || `"${altMatch[2]}"`)
      : '"Image"';
    
    // Extract width/height if present  
    const widthMatch = (before + after).match(/width="(\d+)"/);
    const heightMatch = (before + after).match(/height="(\d+)"/);
    
    // Extract loading
    const loadingMatch = (before + after).match(/loading="([^"]+)"/);
    
    // Extract class
    const classMatch = (before + after).match(/class="([^"]+)"/);
    const classExprMatch = (before + after).match(/class=\{([^}]+)\}/);
    
    // Build CdnImage tag
    let cdnTag = `<CdnImage src={${srcExpr}} alt={${alt}}`;
    if (widthMatch) cdnTag += ` width={${widthMatch[1]}}`;
    if (heightMatch) cdnTag += ` height={${heightMatch[1]}}`;
    if (loadingMatch) cdnTag += ` loading="${loadingMatch[1]}"`;
    if (classMatch) cdnTag += ` class="${classMatch[1]}"`;
    if (classExprMatch) cdnTag += ` class={${classExprMatch[1]}}`;
    
    // Extract decoding
    const decodingMatch = (before + after).match(/decoding="([^"]+)"/);
    if (decodingMatch) cdnTag += ` decoding="${decodingMatch[1]}"`;
    
    cdnTag += ' />';
    
    replacements.push({ from: full, to: cdnTag });
  }
  
  // Also handle static src="/images/..." 
  const staticPattern = /<img\s+([^>]*?)src="(\/images\/[^"]+)"([^>]*?)\/?\s*>/g;
  while ((match = staticPattern.exec(content)) !== null) {
    const full = match[0];
    const before = match[1];
    const src = match[2];
    const after = match[3];
    
    const altMatch = (before + after).match(/alt="([^"]*)"/);
    const alt = altMatch ? altMatch[1] : 'Image';
    const widthMatch = (before + after).match(/width="(\d+)"/);
    const heightMatch = (before + after).match(/height="(\d+)"/);
    const loadingMatch = (before + after).match(/loading="([^"]+)"/);
    const classMatch = (before + after).match(/class="([^"]+)"/);
    const decodingMatch = (before + after).match(/decoding="([^"]+)"/);
    
    let cdnTag = `<CdnImage src="${src}" alt="${alt}"`;
    if (widthMatch) cdnTag += ` width={${widthMatch[1]}}`;
    if (heightMatch) cdnTag += ` height={${heightMatch[1]}}`;
    if (loadingMatch) cdnTag += ` loading="${loadingMatch[1]}"`;
    if (classMatch) cdnTag += ` class="${classMatch[1]}"`;
    if (decodingMatch) cdnTag += ` decoding="${decodingMatch[1]}"`;
    cdnTag += ' />';
    
    replacements.push({ from: full, to: cdnTag });
  }
  
  if (replacements.length === 0) continue;
  
  // Apply replacements
  for (const { from, to } of replacements) {
    content = content.replace(from, to);
    changed = true;
    totalRewrites++;
  }
  
  // Add import if needed
  if (changed && !hasCdnImport) {
    // Insert import in frontmatter
    const fmEnd = content.indexOf('---', content.indexOf('---') + 3);
    if (fmEnd > 0) {
      content = content.slice(0, fmEnd) + 
        "import CdnImage from '../components/CdnImage.astro';\n" +
        content.slice(fmEnd);
    }
  }
  
  writeFileSync(file, content);
  console.log(`  ✓ ${file.replace(siteRoot, '')} — ${replacements.length} rewrites`);
}

console.log(`\nTotal: ${totalRewrites} <img> → <CdnImage> rewrites across ${files.length} files`);
