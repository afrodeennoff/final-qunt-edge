#!/usr/bin/env node
/**
 * INJECT COLOR — Replace grayscale surfaces with tinted ones
 * Uses the existing oklch token palette (cobalt, emerald, violet, amber)
 */

import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'

// Get all TSX files
const files = execSync(
  `find components/ui app/\\[locale\\] -name "*.tsx" -not -path "*/node_modules/*"`,
  { encoding: 'utf-8' }
).trim().split('\n').filter(Boolean)

let totalFiles = 0
let totalChanges = 0

// Color mapping: grayscale → tinted
const replacements = [
  // ── BORDERS: white/[0.06] → cobalt tinted borders ──
  // Card/widget borders get a subtle cobalt tint
  { from: 'border-white/[0.06]', to: 'border-[oklch(0.65_0.22_260/0.08)]', name: 'border cobalt-tint' },
  
  // ── SURFACES: bg-white/[0.02] → brand-tinted surfaces ──
  { from: 'bg-white/[0.02]', to: 'bg-[oklch(0.65_0.22_260/0.03)]', name: 'surface cobalt-tint' },
  
  // ── ELEVATED: bg-white/[0.03] → slightly more colored ──
  { from: 'bg-white/[0.03]', to: 'bg-[oklch(0.65_0.22_260/0.045)]', name: 'elevated cobalt-tint' },
  
  // ── HOVER: bg-white/[0.04] → cobalt hover ──
  { from: 'bg-white/[0.04]', to: 'bg-[oklch(0.65_0.22_260/0.06)]', name: 'hover cobalt-tint' },
  
  // ── HIGHLIGHT: bg-white/[0.06] → stronger cobalt ──
  { from: 'bg-white/[0.06]', to: 'bg-[oklch(0.65_0.22_260/0.08)]', name: 'highlight cobalt-tint' },

  // ── INSET SHADOWS: add cobalt tint ──
  { from: 'inset_0_1px_0_rgba(255,255,255,0.04)', to: 'inset_0_1px_0_oklch(0.65_0.22_260/0.06)', name: 'inset cobalt' },
  { from: 'inset_0_1px_0_rgba(255,255,255,0.06)', to: 'inset_0_1px_0_oklch(0.65_0.22_260/0.08)', name: 'inset cobalt-2' },
]

// Skip files where color injection would break functionality
const skipFiles = [
  'components/ui/form.tsx',        // form elements need neutral
  'components/ui/label.tsx',       // labels neutral
  'components/ui/switch.tsx',      // switch uses its own colors
  'components/ui/checkbox.tsx',    // checkbox has semantic colors
  'components/ui/radio-group.tsx', // radio has semantic colors
  'components/ui/toast.tsx',       // toast has semantic variants
  'components/ui/alert.tsx',       // alert has semantic variants
  'components/ui/progress.tsx',    // progress uses primary
  'components/ui/slider.tsx',      // slider uses primary
  'components/ui/pagination.tsx',  // pagination neutral
  'components/ui/command.tsx',     // command palette neutral
  'components/ui/context-menu.tsx',// context menu neutral
  'components/ui/menubar.tsx',     // menubar neutral
  'components/ui/navigation-menu.tsx',
  'components/ui/hover-card.tsx',
  'components/ui/popover.tsx',
  'components/ui/tooltip.tsx',
  'components/ui/dialog.tsx',
  'components/ui/sheet.tsx',
  'components/ui/dropdown-menu.tsx',
  'components/ui/select.tsx',
]

for (const f of files) {
  if (skipFiles.some(s => f.includes(s))) continue
  
  let c = readFileSync(f, 'utf-8')
  const orig = c
  let changes = 0
  
  for (const r of replacements) {
    const before = c
    c = c.replaceAll(r.from, r.to)
    if (c !== before) {
      changes += (before.split(r.from).length - 1) - (c.split(r.from).length - 1) || 1
    }
  }
  
  if (c !== orig) {
    writeFileSync(f, c)
    totalFiles++
    totalChanges += changes
    console.log(`✓ ${f} — ${changes} color injections`)
  }
}

console.log(`\n═══ Color Injection Complete ═══`)
console.log(`Files: ${totalFiles}`)
console.log(`Changes: ${totalChanges}`)
