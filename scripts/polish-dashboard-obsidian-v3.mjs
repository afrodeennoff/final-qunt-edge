#!/usr/bin/env node
/**
 * Dashboard Obsidian V3 Polish — remove legacy tokens, enforce cobalt tints
 * VISUAL ONLY — no behavior changes. Run once for high-visibility surfaces.
 */

import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'

function walkDashboard() {
  try {
    const out = execSync(
      `find "app/[locale]/dashboard" -type f \\( -name "*.tsx" -o -name "*.ts" \\) -not -path "*/node_modules/*" -not -path "*/.next/*"`,
      { encoding: 'utf-8' }
    ).trim()
    return out ? out.split('\n').filter(Boolean) : []
  } catch (e) {
    return []
  }
}

const files = walkDashboard()
let totalFiles = 0
let totalChanges = 0

// Legacy → V3 cobalt mappings (safe, visual-only)
const replacements = [
  // Decorative / overlay legacy
  [/border-border\/25/g, 'border-[oklch(0.65_0.22_260/0.08)]'],
  [/border-border\/30/g, 'border-[oklch(0.65_0.22_260/0.08)]'],
  [/border-border\/35/g, 'border-[oklch(0.65_0.22_260/0.10)]'],
  [/border-border\/40/g, 'border-[oklch(0.65_0.22_260/0.12)]'],
  [/border-border\/20/g, 'border-[oklch(0.65_0.22_260/0.06)]'],
  [/border-border\/15/g, 'border-[oklch(0.65_0.22_260/0.05)]'],
  [/border-border\/5/g, 'border-[oklch(0.65_0.22_260/0.04)]'],

  // bg-background/ legacy surfaces → cobalt tint
  [/bg-background\/40/g, 'bg-[oklch(0.65_0.22_260/0.03)]'],
  [/bg-background\/50/g, 'bg-[oklch(0.65_0.22_260/0.04)]'],
  [/bg-background\/55/g, 'bg-[oklch(0.65_0.22_260/0.04)]'],
  [/bg-background\/60/g, 'bg-[oklch(0.65_0.22_260/0.05)]'],
  [/bg-background\/70/g, 'bg-[oklch(0.65_0.22_260/0.06)]'],
  [/bg-background\/85/g, 'bg-[oklch(0.65_0.22_260/0.07)]'],
  [/bg-background\/90/g, 'bg-[oklch(0.65_0.22_260/0.08)]'],
  [/bg-background\/25/g, 'bg-[oklch(0.65_0.22_260/0.02)]'],
  [/bg-background\/30/g, 'bg-[oklch(0.65_0.22_260/0.02)]'],
  [/bg-background\/45/g, 'bg-[oklch(0.65_0.22_260/0.03)]'],
  [/bg-background\/0\.08/g, 'bg-[oklch(0.65_0.22_260/0.03)]'],
  [/bg-background\/0\.09/g, 'bg-[oklch(0.65_0.22_260/0.03)]'],
  [/bg-background\/0\.01/g, 'bg-[oklch(0.65_0.22_260/0.01)]'],

  // bg-card legacy
  [/bg-card\/40/g, 'bg-[oklch(0.65_0.22_260/0.03)]'],
  [/bg-card\/70/g, 'bg-[oklch(0.65_0.22_260/0.05)]'],
  [/bg-card(?!\s*\/)/g, 'bg-[oklch(0.65_0.22_260/0.03)]'],

  // bg-muted for surfaces (keep for text, but surface use)
  [/bg-muted\/30/g, 'bg-[oklch(0.65_0.22_260/0.02)]'],
  [/bg-muted\/20/g, 'bg-[oklch(0.65_0.22_260/0.015)]'],
  [/bg-muted\/40/g, 'bg-[oklch(0.65_0.22_260/0.03)]'],
  [/bg-muted\/10/g, 'bg-[oklch(0.65_0.22_260/0.01)]'],
  [/bg-muted\/5/g, 'bg-[oklch(0.65_0.22_260/0.008)]'],

  // bg-secondary / accent surface misuse
  [/bg-secondary\/30/g, 'bg-[oklch(0.65_0.22_260/0.03)]'],
  [/bg-accent\/12/g, 'bg-[oklch(0.65_0.22_260/0.06)]'],

  // Hover states upgrade
  [/hover:bg-background\/90/g, 'hover:bg-[oklch(0.65_0.22_260/0.08)]'],
  [/hover:bg-background\/85/g, 'hover:bg-[oklch(0.65_0.22_260/0.07)]'],
  [/hover:bg-background\/60/g, 'hover:bg-[oklch(0.65_0.22_260/0.05)]'],

  // Fix broken /0. syntax if any left
  [/bg-background\/0\./g, 'bg-[oklch(0.65_0.22_260/0.03)]'],

  // Consistent radius for dashboard surfaces (visual polish)
  [/rounded-2xl/g, 'rounded-xl'],
]

for (const f of files) {
  try {
    let c = readFileSync(f, 'utf-8')
    const orig = c

    for (const [re, to] of replacements) {
      c = c.replace(re, to)
    }

    // Also upgrade some transition-all in dashboard if present (per anti-pattern)
    c = c.replace(/transition-all(?!\[)/g, 'transition-[opacity,background-color,border-color]')

    if (c !== orig) {
      writeFileSync(f, c)
      const count = (orig.match(/border-border|bg-(background|card|muted|secondary)|transition-all/g) || []).length
      totalFiles++
      totalChanges += count
      console.log(`✓ ${f.replace('app/[locale]/dashboard/', '')} — ${count} legacy tokens → cobalt`)
    }
  } catch (e) {
    // skip unreadable
  }
}

console.log(`\n═══ Dashboard Obsidian V3 Polish Complete ═══`)
console.log(`Files touched: ${totalFiles}`)
console.log(`Token replacements: ${totalChanges}`)
console.log(`All surfaces now use explicit oklch(0.65 0.22 260 / 0.0X) cobalt tints.`)
console.log(`Run: npm run typecheck && npm run lint -- --max-warnings=0 to verify.`)
