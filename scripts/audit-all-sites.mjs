#!/usr/bin/env node
/**
 * Image optimization pipeline for all Netlify/Astro sites.
 * 
 * What it does:
 * 1. Scans each site's public/images/ for unoptimized images
 * 2. Generates missing webp variants at standard breakpoints
 * 3. Audits <img> tags for missing srcset/sizes/alt/width/height
 * 4. Checks netlify.toml for CDN headers
 * 5. Outputs a report per site
 * 
 * Run: node scripts/audit-all-sites.mjs
 * Schedule: Windows Task Scheduler (daily)
 */

import { readdirSync, statSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, basename, extname, resolve } from 'path';
import { execSync } from 'child_process';

// ── Site registry ──────────────────────────────────────────
const SITES = [
  {
    name: 'cursedtours',
    repo: 'D:/headless/cursedtours-astro',
    url: 'https://cursedtours.com',
  },
  {
    name: 'devour-destinations',
    repo: 'D:/headless/devour-destinations-astro',
    url: 'https://devourdestinations.com',
  },
  {
    name: 'diggingscriptures',
    repo: 'D:/headless/diggingscriptures-astro',
    url: 'https://diggingscriptures.com',
  },
  {
    name: 'protrainerprep',
    repo: 'D:/dev/projects/protrainerprep',
    url: 'https://protrainerprep.com',
  },
];

const BREAKPOINTS = [320, 480, 640, 800, 960];
const REPORT_DIR = 'D:/devprojects/astro-image-defaults/reports';
const LOG_FILE = join(REPORT_DIR, 'audit-log.txt');

// ── Helpers ────────────────────────────────────────────────
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try { writeFileSync(LOG_FILE, line + '\n', { flag: 'a' }); } catch {}
}

function findFiles(dir, pattern, maxDepth = 5, depth = 0) {
  if (depth > maxDepth || !existsSync(dir)) return [];
  const results = [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...findFiles(full, pattern, maxDepth, depth + 1));
      } else if (pattern.test(entry.name)) {
        results.push(full);
      }
    }
  } catch {}
  return results;
}

function getImageDimensions(filePath) {
  // Quick check file size
  try { return statSync(filePath).size; } catch { return 0; }
}

// ── Audit: Local images ────────────────────────────────────
function auditImages(site) {
  const imgDir = join(site.repo, 'public', 'images');
  if (!existsSync(imgDir)) {
    // Also check src/assets, public/assets
    const altDirs = ['src/assets/images', 'public/assets/images', 'public/assets', 'src/images'];
    for (const alt of altDirs) {
      const d = join(site.repo, alt);
      if (existsSync(d)) return auditImagesDir(d, site);
    }
    return { baseImages: 0, withVariants: 0, missing: [], oversized: [], nonWebp: [] };
  }
  return auditImagesDir(imgDir, site);
}

function auditImagesDir(imgDir, site) {
  const files = readdirSync(imgDir);
  const variantPattern = /-\d+w\.\w+$/;
  const imageExts = /\.(webp|jpg|jpeg|png|gif|avif)$/i;

  const bases = files.filter(f => !variantPattern.test(f) && imageExts.test(f));
  const withVariants = [];
  const missing = [];
  const oversized = [];
  const nonWebp = [];

  for (const base of bases) {
    const ext = extname(base);
    const name = basename(base, ext);
    const hasVariant = files.some(f => f.startsWith(`${name}-`) && f.match(/-\d+w/));
    const size = getImageDimensions(join(imgDir, base));

    if (hasVariant) withVariants.push(base);
    else missing.push(base);

    if (size > 500_000) oversized.push({ file: base, sizeKB: Math.round(size / 1024) });
    if (ext !== '.webp') nonWebp.push(base);
  }

  return { baseImages: bases.length, withVariants: withVariants.length, missing, oversized, nonWebp };
}

// ── Audit: HTML img tags ───────────────────────────────────
function auditHtmlImages(site) {
  const astroFiles = findFiles(join(site.repo, 'src'), /\.(astro|jsx|tsx|html)$/);
  const issues = [];

  for (const file of astroFiles) {
    const content = readFileSync(file, 'utf-8');
    const imgTags = content.match(/<img\b[^>]*>/gi) || [];

    for (const tag of imgTags) {
      const relPath = file.replace(site.repo, '').replace(/\\/g, '/');
      if (!tag.includes('alt=') && !tag.includes('alt '))
        issues.push({ file: relPath, issue: 'missing alt', tag: tag.slice(0, 80) });
      if (!tag.includes('width=') && !tag.includes('width '))
        issues.push({ file: relPath, issue: 'missing width', tag: tag.slice(0, 80) });
      if (!tag.includes('height=') && !tag.includes('height '))
        issues.push({ file: relPath, issue: 'missing height', tag: tag.slice(0, 80) });
      if (!tag.includes('loading='))
        issues.push({ file: relPath, issue: 'missing loading', tag: tag.slice(0, 80) });
      if (!tag.includes('srcset=') && !tag.includes('srcset ') && !tag.includes(':srcset'))
        issues.push({ file: relPath, issue: 'missing srcset', tag: tag.slice(0, 80) });
    }
  }
  return issues;
}

// ── Audit: netlify.toml CDN config ─────────────────────────
function auditNetlifyConfig(site) {
  const tomlPath = join(site.repo, 'netlify.toml');
  const issues = [];
  if (!existsSync(tomlPath)) {
    issues.push('netlify.toml not found');
    return issues;
  }
  const content = readFileSync(tomlPath, 'utf-8');

  if (!content.includes('.netlify/images'))
    issues.push('No Netlify Image CDN headers configured');
  if (!content.includes('[images]') && !content.includes('remote_images'))
    issues.push('No [images] block for remote image allowlist');
  if (!content.includes('Cache-Control'))
    issues.push('No Cache-Control headers for images');

  return issues;
}

// ── Generate webp variants (requires sharp) ────────────────
async function generateVariants(site, dryRun = true) {
  const imgDir = join(site.repo, 'public', 'images');
  if (!existsSync(imgDir)) return [];

  const files = readdirSync(imgDir);
  const variantPattern = /-\d+w\.\w+$/;
  const bases = files.filter(f => !variantPattern.test(f) && /\.(webp|jpg|jpeg|png)$/i.test(f));
  const generated = [];

  for (const base of bases) {
    const ext = extname(base);
    const name = basename(base, ext);
    const hasVariant = files.some(f => f.startsWith(`${name}-`) && f.match(/-\d+w/));
    if (hasVariant) continue;

    for (const w of BREAKPOINTS) {
      const outName = `${name}-${w}w.webp`;
      const outPath = join(imgDir, outName);
      if (existsSync(outPath)) continue;

      if (dryRun) {
        generated.push({ file: outName, action: 'would generate' });
      } else {
        try {
          // Use sharp if available
          const sharp = (await import('sharp')).default;
          await sharp(join(imgDir, base))
            .resize(w)
            .webp({ quality: 85 })
            .toFile(outPath);
          generated.push({ file: outName, action: 'generated' });
        } catch (e) {
          generated.push({ file: outName, action: `failed: ${e.message}` });
        }
      }
    }
  }
  return generated;
}

// ── Main ───────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--fix');
  const timestamp = new Date().toISOString().slice(0, 10);

  mkdirSync(REPORT_DIR, { recursive: true });
  log(`\n${'='.repeat(60)}`);
  log(`Image Optimization Audit — ${timestamp}${dryRun ? ' (DRY RUN)' : ' (FIXING)'}`);
  log(`${'='.repeat(60)}`);

  const allReports = [];

  for (const site of SITES) {
    log(`\n── ${site.name} (${site.url}) ──`);

    if (!existsSync(site.repo)) {
      log(`  ⚠ Repo not found: ${site.repo}`);
      continue;
    }

    // 1. Image audit
    const imgAudit = auditImages(site);
    log(`  Images: ${imgAudit.baseImages} base, ${imgAudit.withVariants} with variants`);
    if (imgAudit.missing.length > 0)
      log(`  ⚠ ${imgAudit.missing.length} missing srcset variants`);
    if (imgAudit.oversized.length > 0)
      log(`  ⚠ ${imgAudit.oversized.length} oversized (>500KB): ${imgAudit.oversized.map(o => `${o.file} (${o.sizeKB}KB)`).join(', ')}`);
    if (imgAudit.nonWebp.length > 0)
      log(`  ⚠ ${imgAudit.nonWebp.length} non-webp images`);

    // 2. HTML audit
    const htmlIssues = auditHtmlImages(site);
    const uniqueIssueTypes = [...new Set(htmlIssues.map(i => i.issue))];
    for (const type of uniqueIssueTypes) {
      const count = htmlIssues.filter(i => i.issue === type).length;
      log(`  ⚠ ${count} <img> tags: ${type}`);
    }
    if (htmlIssues.length === 0) log(`  ✓ All <img> tags have required attributes`);

    // 3. Netlify config audit
    const configIssues = auditNetlifyConfig(site);
    for (const issue of configIssues) log(`  ⚠ netlify.toml: ${issue}`);
    if (configIssues.length === 0) log(`  ✓ netlify.toml CDN config OK`);

    // 4. Generate variants if --fix
    const generated = await generateVariants(site, dryRun);
    if (generated.length > 0) {
      log(`  ${dryRun ? '🔍' : '✓'} ${generated.length} variant operations`);
    }

    allReports.push({
      site: site.name,
      url: site.url,
      images: imgAudit,
      htmlIssues: htmlIssues.length,
      htmlIssueTypes: uniqueIssueTypes,
      configIssues,
      variants: generated,
    });
  }

  // Write JSON report
  const reportPath = join(REPORT_DIR, `audit-${timestamp}.json`);
  writeFileSync(reportPath, JSON.stringify(allReports, null, 2));
  log(`\nReport saved: ${reportPath}`);

  // Summary
  log(`\n── SUMMARY ──`);
  const totalIssues = allReports.reduce((sum, r) =>
    sum + r.images.missing.length + r.images.oversized.length + r.htmlIssues + r.configIssues.length, 0);
  log(`Total sites: ${allReports.length}`);
  log(`Total issues: ${totalIssues}`);
  if (totalIssues === 0) log(`✓ All sites optimized!`);

  return totalIssues;
}

main().then(issues => process.exit(issues > 0 ? 1 : 0));
