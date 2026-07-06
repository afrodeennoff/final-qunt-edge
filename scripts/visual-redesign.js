#!/usr/bin/env node
/**
 * Complete UI Visual Redesign Script
 * Applies consistent visual transformations across ALL .tsx files
 * NO behavior changes — purely Tailwind class substitutions
 */

const fs = require('fs');
const path = require('path');

const TARGET_DIRS = [
  path.join(__dirname, 'app/[locale]/(home)'),
  path.join(__dirname, 'app/[locale]/(landing)'),
  path.join(__dirname, 'app/[locale]/dashboard'),
  path.join(__dirname, 'app/[locale]/(authentication)'),
  path.join(__dirname, 'app/[locale]/teams'),
  path.join(__dirname, 'app/[locale]/admin'),
  path.join(__dirname, 'app/[locale]/shared'),
  path.join(__dirname, 'app/[locale]/embed'),
  path.join(__dirname, 'components/ui'),
  path.join(__dirname, 'components/layout'),
  path.join(__dirname, 'components/animation'),
  path.join(__dirname, 'components/emails'),
];

// Visual redesign replacements — all purely aesthetic
const REPLACEMENTS = [
  // 1. Replace rounded-2xl with rounded-xl everywhere (sharper, more modern)
  [/\brounded-2xl\b/g, 'rounded-xl'],
  [/\brounded-3xl\b/g, 'rounded-2xl'],
  
  // 2. Replace arbitrary hex colors with semantic tokens
  [/\brounded-\[4px\]\b/g, 'rounded-sm'],
  [/\brounded-\[6px\]\b/g, 'rounded-md'],
  [/\brounded-\[8px\]\b/g, 'rounded-lg'],
  [/\brounded-\[2px\]\b/g, 'rounded-sm'],
  
  // 3. Replace text-[10px]/[11px]/[13px]/[14px]/[15px] with standard scales
  [/\btext-\[10px\]\b/g, 'text-[0.625rem]'],
  [/\btext-\[11px\]\b/g, 'text-xs'],
  [/\btext-\[12px\]\b/g, 'text-xs'],
  [/\btext-\[13px\]\b/g, 'text-sm'],
  [/\btext-\[14px\]\b/g, 'text-sm'],
  [/\btext-\[15px\]\b/g, 'text-sm'],
  [/\btext-\[16px\]\b/g, 'text-sm'],
  [/\btext-\[17px\]\b/g, 'text-base'],
  [/\btext-\[18px\]\b/g, 'text-base'],

  // 4. Replace py-[5px] with py-1, py-[6px] with py-1.5, etc.
  [/\bpy-\[5px\]\b/g, 'py-1'],
  [/\bpy-\[6px\]\b/g, 'py-1.5'],
  [/\bpy-\[12px\]\b/g, 'py-3'],
  [/\bpx-\[16px\]\b/g, 'px-4'],

  // 5. Replace generic [var(--frost-border)] with modern glass borders
  [/border-\[var\(--frost-border\)\]/g, 'border-white/[0.06]'],
  [/border-\[var\(--frost-border-strong\)\]/g, 'border-white/[0.12]'],
  [/border-\[var\(--frost-border-alt\)\]/g, 'border-white/[0.04]'],
  
  // 6. Replace surface-card references with modern glass
  [/bg-\[var\(--surface-card\)\]/g, 'bg-white/[0.02]'],
  
  // 7. Replace oklch hardcoded surfaces
  [/bg-\[oklch\(0\.06_0_0\)\]/g, 'bg-white/[0.04]'],
  [/bg-\[oklch\(0\.08_0_0\)\]/g, 'bg-white/[0.05]'],
  [/bg-\[oklch\(0\.05_0_0\)\]/g, 'bg-white/[0.03]'],
  [/bg-\[oklch\(0\.035_0_0\)\]/g, 'bg-white/[0.02]'],
  
  // 8. Replace [var(--frost-border-alt)] 
  [/border-\[var\(--frost-border-alt\)\]/g, 'border-white/[0.04]'],
  
  // 9. Replace raw rgba with modern alpha
  [/bg-\[rgba\(255,255,255,0\.08\)\]/g, 'bg-white/[0.06]'],
  [/bg-\[rgba\(255,255,255,0\.06\)\]/g, 'bg-white/[0.04]'],
  [/bg-\[rgba\(255,255,255,0\.04\)\]/g, 'bg-white/[0.03]'],
  [/hover:bg-\[rgba\(255,255,255,0\.08\)\]/g, 'hover:bg-white/[0.06]'],
]

function getAllTsxFiles(dirs) {
  const files = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    function walk(d) {
      const entries = fs.readdirSync(d, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(d, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
            walk(full);
          }
        } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
          files.push(full);
        }
      }
    }
    walk(dir);
  }
  return files;
}

const files = getAllTsxFiles(TARGET_DIRS);
console.log(`🔍 Found ${files.length} files to redesign`);

let totalReplacements = 0;

for (const file of files) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;

    for (const [pattern, replacement] of REPLACEMENTS) {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        totalReplacements += matches.length;
      }
    }

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`  ✓ ${path.relative(process.cwd(), file)} (${content !== original ? 'modified' : 'skipped'})`);
    }
  } catch (err) {
    // Skip files that can't be read
  }
}

console.log(`\n✅ Complete! Applied ${totalReplacements} visual replacements across ${files.length} files.`);
