#!/usr/bin/env node
/**
 * Ultra QHD Premium Visual Redesign Script
 * Transforms ALL surfaces to 12K-quality premium look
 * VISUAL ONLY — no behavioral changes
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

function walkDir(dir, ext = '.tsx') {
  let results = []
  try {
    const list = readdirSync(dir)
    for (const file of list) {
      const filePath = join(dir, file)
      try {
        const stat = statSync(filePath)
        if (stat && stat.isDirectory()) {
          if (!file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
            results = results.concat(walkDir(filePath, ext))
          }
        } else if (file.endsWith(ext)) {
          results.push(filePath)
        }
      } catch (e) { /* skip */ }
    }
  } catch (e) { /* skip */ }
  return results
}

// Premium class transformations
const replacements = [
  // ─── SURFACE UPGRADES ───
  // Old flat backgrounds → Premium glass surfaces
  [/bg-card(?!\s*\/)/g, 'bg-white/[0.02]'],
  [/bg-card\/(\d+)/g, 'bg-white/[0.0$1]'],
  [/bg-popover(?!\s*\/)/g, 'bg-white/[0.04]'],
  [/bg-muted(?!\s*\/)/g, 'bg-white/[0.03]'],
  [/bg-secondary(?!\s*\/)/g, 'bg-white/[0.04]'],
  [/bg-accent(?!\s*\/)/g, 'bg-white/[0.05]'],
  
  // ─── BORDER UPGRADES ───
  // Old flat borders → Frosted obsidian borders
  [/border-border(?!\s*\/)/g, 'border-white/[0.06]'],
  [/border-border\/24/g, 'border-white/[0.06]'],
  [/border-border\/28/g, 'border-white/[0.08]'],
  [/border-border\/18/g, 'border-white/[0.04]'],
  [/border-border\/12/g, 'border-white/[0.03]'],
  
  // ─── TEXT UPGRADES ───
  // Better text hierarchy
  [/text-foreground(?!\s*\/)/g, 'text-foreground/95'],
  
  // ─── SHADOW UPGRADES ───
  // Flat shadows → Cinematic layered shadows
  [/shadow-sm(?!\s*\/)/g, 'shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_4px_16px_-4px_rgba(0,0,0,0.3)]'],
  [/shadow-md(?!\s*\/)/g, 'shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_32px_-8px_rgba(0,0,0,0.4)]'],
  [/shadow-lg(?!\s*\/)/g, 'shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_16px_48px_-16px_rgba(0,0,0,0.5)]'],
  
  // ─── RADIUS UPGRADES ───
  // Consistent modern radius
  [/rounded-2xl/g, 'rounded-xl'],
  [/rounded-3xl/g, 'rounded-2xl'],
  
  // ─── SPACING UPGRADES ───
  // More generous padding for premium feel
  // (Don't auto-change spacing as it's too risky for layout)
]

// Specific landing page premium transformations
const landingReplacements = [
  // Marketing surface upgrades
  [/marketing-glass/g, 'glass-card-premium'],
  [/marketing-panel/g, 'liquid-panel-premium'],
  [/marketing-badge/g, 'glass-card-subtle'],
]

// Dashboard premium transformations  
const dashboardReplacements = [
  // Widget surface upgrades
  [/precision-panel(?!\s*-)/g, 'precision-panel-premium'],
  [/liquid-panel(?!\s*-)(?!\s*_hover)/g, 'liquid-panel-premium'],
]

const dirs = [
  'app/[locale]/(home)',
  'app/[locale]/(landing)',
  'app/[locale]/(authentication)',
  'app/[locale]/dashboard',
  'app/[locale]/teams',
  'app/[locale]/admin',
  'app/[locale]/shared',
  'components/ui',
  'components/ai-elements',
]

let totalFiles = 0
let totalChanges = 0

for (const dir of dirs) {
  const files = walkDir(dir)
  for (const file of files) {
    let content = readFileSync(file, 'utf-8')
    let original = content
    let changeCount = 0
    
    // Apply global replacements
    for (const [pattern, replacement] of replacements) {
      const before = content
      content = content.replace(pattern, replacement)
      if (content !== before) {
        const matches = before.match(pattern)
        changeCount += matches ? matches.length : 0
      }
    }
    
    // Apply context-specific replacements
    const isLanding = file.includes('(landing)') || file.includes('(home)')
    const isDashboard = file.includes('dashboard') || file.includes('widget') || file.includes('chart-surface')
    
    if (isLanding) {
      for (const [pattern, replacement] of landingReplacements) {
        content = content.replace(pattern, replacement)
      }
    }
    
    if (isDashboard) {
      for (const [pattern, replacement] of dashboardReplacements) {
        content = content.replace(pattern, replacement)
      }
    }
    
    if (content !== original) {
      writeFileSync(file, content)
      totalFiles++
      totalChanges += changeCount
      console.log(`✓ ${file} (${changeCount} changes)`)
    }
  }
}

console.log(`\n═══ Ultra QHD Redesign Complete ═══`)
console.log(`Files transformed: ${totalFiles}`)
console.log(`Total class changes: ${totalChanges}`)
