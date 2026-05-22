#!/usr/bin/env node
/**
 * Refine Marketing & Landing Pages to Full Electric Obsidian V3
 * Visual-only pass: replace remaining legacy semantic opacity classes
 * with cobalt-tinted oklch surfaces for cohesion with home + V3 primitives.
 * Prioritizes speed (no new JS, no blur, spring transitions already in place).
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

function walkDir(dir) {
  let results = []
  try {
    const list = readdirSync(dir)
    for (const file of list) {
      const filePath = join(dir, file)
      try {
        const stat = statSync(filePath)
        if (stat && stat.isDirectory()) {
          if (!file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
            results = results.concat(walkDir(filePath))
          }
        } else if (extname(file) === '.tsx' || extname(file) === '.ts') {
          results.push(filePath)
        }
      } catch (e) { /* skip */ }
    }
  } catch (e) { /* skip */ }
  return results
}

const TARGET_DIRS = [
  'app/[locale]/(landing)',
  'app/[locale]/(home)/components',
  'components/layout',
]

const replacements = [
  // Borders - legacy border-border/* → cobalt frost borders (V3)
  [/border-border\/30(?!\s*\/)/g, 'border-[oklch(0.65_0.22_260/0.08)]'],
  [/border-border\/35(?!\s*\/)/g, 'border-[oklch(0.65_0.22_260/0.09)]'],
  [/border-border\/40(?!\s*\/)/g, 'border-[oklch(0.65_0.22_260/0.10)]'],
  [/border-border\/20(?!\s*\/)/g, 'border-[oklch(0.65_0.22_260/0.05)]'],
  [/border-border\/22(?!\s*\/)/g, 'border-[oklch(0.65_0.22_260/0.06)]'],
  [/border-border\/26(?!\s*\/)/g, 'border-[oklch(0.65_0.22_260/0.07)]'],
  [/border-border\/0\.03(?!\s*\/)/g, 'border-[oklch(0.65_0.22_260/0.03)]'],
  [/border-border\/0\.04(?!\s*\/)/g, 'border-[oklch(0.65_0.22_260/0.04)]'],
  [/border-border\/0\.06(?!\s*\/)/g, 'border-[oklch(0.65_0.22_260/0.06)]'],
  [/border-border\/0\.08(?!\s*\/)/g, 'border-[oklch(0.65_0.22_260/0.08)]'],
  [/border-border\/0\.12(?!\s*\/)/g, 'border-[oklch(0.65_0.22_260/0.12)]'],
  [/border-border\/0\.15(?!\s*\/)/g, 'border-[oklch(0.65_0.22_260/0.15)]'],
  [/border-border\/(?!\s*\/)(?!\[)/g, 'border-[oklch(0.65_0.22_260/0.08)]'], // catch remaining /xx

  // Background surfaces - legacy bg-background/* + bg-card/* → cobalt tint (low opacity for void)
  [/bg-background\/0\.01(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.01)]'],
  [/bg-background\/0\.09(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.025)]'],
  [/bg-background\/0\.11(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.03)]'],
  [/bg-background\/0\.12(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.035)]'],
  [/bg-background\/0\.14(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.05)]'],
  [/bg-background\/30(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.03)]'],
  [/bg-background\/35(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.035)]'],
  [/bg-background\/40(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.04)]'],
  [/bg-background\/45(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.045)]'],
  [/bg-background\/50(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.05)]'],
  [/bg-background\/60(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.06)]'],
  [/bg-background\/65(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.065)]'],
  [/bg-background\/70(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.07)]'],
  [/bg-background\/75(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.075)]'],
  [/bg-background\/80(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.08)]'],
  [/bg-background\/90(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.09)]'],
  [/bg-background\/20(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.02)]'],

  // Card/muted surfaces → cobalt subtle (card was neutral dark, now tinted)
  [/bg-card\/90(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.03)]'],
  [/bg-card\/80(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.03)]'],
  [/bg-card\/75(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.03)]'],
  [/bg-card\/70(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.025)]'],
  [/bg-card\/55(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.02)]'],
  [/bg-card\/45(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.015)]'],
  [/bg-muted\/50(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.02)]'],
  [/bg-secondary\/30(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.03)]'],
  [/bg-accent\/55(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.06)]'],

  // Primary opacity tints → explicit cobalt (since primary=cobalt)
  [/bg-primary\/\[0\.03\](?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.03)]'],
  [/bg-primary\/\[0\.05\](?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.05)]'],
  [/bg-primary\/\[0\.09\](?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.09)]'],
  [/bg-primary\/\[0\.11\](?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.11)]'],
  [/hover:bg-primary\/\[0\.03\]/g, 'hover:bg-[oklch(0.65_0.22_260/0.05)]'],
  [/hover:bg-primary\/\[0\.11\]/g, 'hover:bg-[oklch(0.65_0.22_260/0.09)]'],

  // Border primary tints
  [/border-primary\/35/g, 'border-[oklch(0.65_0.22_260/0.12)]'],
  [/border-primary\/25/g, 'border-[oklch(0.65_0.22_260/0.10)]'],
  [/border-primary\/24/g, 'border-[oklch(0.65_0.22_260/0.10)]'],
  [/focus:border-primary\/35/g, 'focus:border-[oklch(0.65_0.22_260/0.12)]'],

  // Hover states on old surfaces
  [/hover:bg-background\/25/g, 'hover:bg-[oklch(0.65_0.22_260/0.04)]'],
  [/hover:bg-background\/50/g, 'hover:bg-[oklch(0.65_0.22_260/0.06)]'],
  [/hover:bg-card\/75/g, 'hover:bg-[oklch(0.65_0.22_260/0.05)]'],
  [/hover:bg-card\/78/g, 'hover:bg-[oklch(0.65_0.22_260/0.05)]'],
  [/hover:border-border\/35/g, 'hover:border-[oklch(0.65_0.22_260/0.12)]'],
  [/hover:border-border\/40/g, 'hover:border-[oklch(0.65_0.22_260/0.14)]'],
  [/hover:border-border\/30/g, 'hover:border-[oklch(0.65_0.22_260/0.12)]'],

  // Focus / ring
  [/focus-visible:ring-border\/24/g, 'focus-visible:ring-[oklch(0.65_0.22_260/0.2)]'],

  // Legacy hsl primary in gradients/surfaces → cobalt
  [/hsl\(var\(--primary\)\/0\.035\)/g, 'oklch(0.65 0.22 260 / 0.035)'],
  [/hsl\(var\(--primary\)\/0\.05\)/g, 'oklch(0.65 0.22 260 / 0.05)'],
  [/hsl\(var\(--primary\)\/0\.12\)/g, 'oklch(0.65 0.22 260 / 0.12)'],
  [/hsl\(var\(--primary\)\/0\.58\)/g, 'oklch(0.65 0.22 260 / 0.06)'],

  // Remove any accidental double slashes or malformed from prior partial replaces
  [/border-\[oklch\(0\.65_0\.22_260\/0\.08\)\]\/[0-9.]+/g, 'border-[oklch(0.65_0.22_260/0.08)]'],
]

let totalFiles = 0
let totalChanges = 0
const changedFiles = []

for (const dir of TARGET_DIRS) {
  const files = walkDir(dir)
  for (const f of files) {
    // Skip already-V3 heavy files if they are clean (but we still scan for safety)
    let c = readFileSync(f, 'utf-8')
    const orig = c
    let changes = 0

    for (const [regex, to] of replacements) {
      const before = c
      c = c.replace(regex, to)
      if (c !== before) {
        const count = (before.match(regex) || []).length
        changes += count
      }
    }

    if (c !== orig) {
      writeFileSync(f, c)
      totalFiles++
      totalChanges += changes
      changedFiles.push({ file: f, changes })
      console.log(`✓ ${f} — ${changes} V3 cobalt refinements`)
    }
  }
}

console.log(`\n═══ Marketing/Landing Obsidian V3 Refinement Complete ═══`)
console.log(`Files updated: ${totalFiles}`)
console.log(`Total class replacements: ${totalChanges}`)
if (changedFiles.length) {
  console.log('\nUpdated files:')
  changedFiles.forEach(({ file, changes }) => console.log(`  - ${file} (${changes})`))
}
console.log('\nNext: run `npm run typecheck` and `npm run lint` to validate (visual only, zero behavior change).')
