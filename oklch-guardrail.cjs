#!/usr/bin/env node

/**
 * OKLCH Guardrail - Prevents Tailwind v4 from breaking first paint
 *
 * This script checks for the presence of @supports (color: oklch(0 0 0)) blocks
 * in CSS files that contain oklch values, which Tailwind v4 strips during build.
 * The resulting bare oklch values cause blank screens in browsers without OKLCH.
 *
 * Usage:
 *   node oklch-guardrail.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to search for PROBLEMATIC @supports blocks that break first paint
// Focus on :root and .dark selectors that contain essential UI tokens
const PROBLEMATIC_PATTERNS = [
  // :root or .dark blocks with OKLCH
  /@supports\s*\(\s*color:\s*oklch\(0\s+0\s+0\)\)\s*\{\s*:root\s*\{[^}]*oklch\(/,
  /@supports\s*\(\s*color:\s*oklch\(0\s+0\s+0\)\)\s*\{\s*\.dark\s*\{[^}]*oklch\(/,
  // Any @supports block that includes essential UI properties
  /@supports\s*\(\s*color:\s*oklch\(0\s+0\s+0\)\)\s*\{\s*(?:[^}]*\s+)?(?:--background|--foreground|--card|--primary|--muted|--accent|border|ring)[^}]*oklch\(/
];

console.log('🔍 OKLCH Guardrail - Checking for problematic @supports blocks...\n');

let foundIssues = 0;

// Check CSS files in the app directory
const cssFiles = glob.sync('app/**/*.css', {
  cwd: __dirname,
  absolute: true
});

for (const file of cssFiles) {
  const content = fs.readFileSync(file, 'utf8');

  for (const pattern of PROBLEMATIC_PATTERNS) {
    if (pattern.test(content)) {
      foundIssues++;
      const relativePath = path.relative(__dirname, file);
      console.log(`❌ ISSUE: Found problematic @supports oklch block in ${relativePath}`);
      console.log(`   These blocks get stripped by Tailwind v4, leaving bare OKLCH values`);
      console.log(`   that cause blank screens in browsers without OKLCH support.\n`);

      // Extract a snippet showing the problematic code
      const lines = content.split('\n');
      const match = content.match(pattern);
      if (match) {
        const matchLine = content.substring(0, match.index).split('\n').length;
        console.log(`   Around line ${matchLine}:`);
        const startLine = Math.max(0, matchLine - 3);
        const endLine = Math.min(lines.length, matchLine + 3);

        for (let i = startLine; i < endLine; i++) {
          const arrow = i === matchLine - 1 ? '  👉 ' : '     ';
          console.log(arrow + (i + 1).toString().padStart(3) + ': ' + lines[i]);
        }
      }
    }
  }
}

if (foundIssues === 0) {
  console.log('✅ OK: No problematic @supports (color: oklch(0 0 0)) blocks found.');
  console.log('   Hex-only values will work in all browsers.\n');

  console.log('📝 REMINDER:');
  console.log('   • Hex fallbacks in :root and .dark blocks are safe for all browsers');
  console.log('   • OKLCH values inside @media, @container, or inside SVGs are safe');
  console.log('   • OKLCH in gradients/glow effects are decorative (fallback to transparent)\n');

  process.exit(0);
} else {
  console.log(`❌ FAILED: ${foundIssues} file(s) contain problematic @supports oklch blocks.`);
  console.log('\n💡 FIX:');
  console.log('   1. REMOVE any @supports (color: oklch(0 0 0)) { ... } blocks');
  console.log('   2. KEEP only hex values in :root and .dark blocks');
  console.log('   3. USE @supports for decorative elements only (non-critical)');
  console.log('\n🚫 DO NOT USE:');
  console.log('   @supports (color: oklch(0 0 0)) { :root { ... } }');
  console.log('   @supports (color: oklch(0 0 0)) { .dark { ... } }');

  process.exit(1);
}