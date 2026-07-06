#!/usr/bin/env node
/**
 * Performance Fix: Remove backdrop-blur and filter:blur from scroll-path components
 * These are the #1 cause of janky scroll and unresponsive clicks
 * 
 * backdrop-filter: blur() forces the browser to composite EVERY FRAME during scroll
 * filter: blur() forces full-area repaint on every animation frame
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
        } else if (file.endsWith(ext) || file.endsWith('.css')) {
          results.push(filePath)
        }
      } catch (e) { /* skip */ }
    }
  } catch (e) { /* skip */ }
  return results
}

let totalFiles = 0
let totalChanges = 0

const dirs = [
  'components/ui',
  'components/animation',
  'app/[locale]/dashboard/components',
  'app/[locale]/(home)/components',
  'app/[locale]/(landing)/components',
  'app/[locale]/(authentication)',
  'app/[locale]/teams/components',
  'app/[locale]/admin/components',
]

// Replacements — remove expensive effects from scroll-path elements
const replacements = [
  // backdrop-blur-2xl → nothing (most expensive)
  [/backdrop-blur-2xl/g, ''],
  // backdrop-blur-xl → nothing 
  [/backdrop-blur-xl/g, ''],
  // backdrop-blur-md → nothing
  [/backdrop-blur-md/g, ''],
  // backdrop-blur-sm → nothing
  [/backdrop-blur-sm/g, ''],
  // backdrop-blur-xs → nothing
  [/backdrop-blur-xs/g, ''],
  // backdrop-blur-[Xpx] → nothing
  [/backdrop-blur-\[\d+px\]/g, ''],
  // Clean up double spaces left behind
  [/  +/g, ' '],
  // Clean up space before " 
  [/\s+"/g, '"'],
  // Clean up trailing space in className
  [/className=" /g, 'className="'],
  // Clean up empty className
  [/className="\s*"/g, 'className=""'],
]

// Specific animation fixes
const animationReplacements = [
  // Remove filter:blur from MotionSection (runs on EVERY page)
  ['filter: "blur(4px)" }', '}' ],
  ['filter: "blur(0px)" } : { opacity: 0, y: 12, filter: "blur(4px)" }', '} : { opacity: 0, y: 12 }' ],
  ['filter: "blur(6px)" }', '}' ],
  ['filter: "blur(0px)" } : { opacity: 0, y: 12, filter: "blur(6px)" }', '} : { opacity: 0, y: 12 }' ],
  // Remove blur from BLUR_ENTRANCE variant
  ['filter: "blur(12px)"', 'filter: "none"'],
  ['filter: "blur(10px)"', 'filter: "none"'],
  ['filter: "blur(0px)"', 'filter: "none"'],
  ['filter: "blur(3px)"', 'filter: "none"'],
  // Remove blur from MotionStaggerItem
  ['filter: "blur(0px)"', 'filter: "none"'],
]

for (const dir of dirs) {
  const files = walkDir(dir)
  for (const file of files) {
    let content = readFileSync(file, 'utf-8')
    const original = content
    let changes = 0

    // Apply regex replacements
    for (const [pattern, replacement] of replacements) {
      const before = content
      content = content.replace(pattern, replacement)
      if (content !== before) {
        const matches = before.match(pattern)
        changes += matches ? matches.length : 0
      }
    }

    // Apply specific animation fixes
    for (const [old, rep] of animationReplacements) {
      if (content.includes(old)) {
        content = content.replaceAll(old, rep)
        changes++
      }
    }

    if (content !== original) {
      writeFileSync(file, content)
      totalFiles++
      totalChanges += changes
      console.log(`✓ ${file.replace(/.*qunt-edge\//, '')} (${changes} fixes)`)
    }
  }
}

// Also fix the dashboard header specifically
const headerFile = 'app/[locale]/dashboard/components/dashboard-header.tsx'
try {
  let content = readFileSync(headerFile, 'utf-8')
  const original = content
  
  // Remove backdrop-blur from header
  content = content.replace(/backdrop-blur-2xl/g, '')
  content = content.replace(/backdrop-blur-sm/g, '')
  content = content.replace(/  +/g, ' ')
  
  if (content !== original) {
    writeFileSync(headerFile, content)
    totalFiles++
    console.log(`✓ dashboard-header.tsx`)
  }
} catch(e) {}

// Fix enhanced-motion.tsx — remove filter:blur entirely
const motionFile = 'components/animation/enhanced-motion.tsx'
try {
  let content = readFileSync(motionFile, 'utf-8')
  
  // Remove ALL filter properties from animation variants
  content = content.replace(/,\s*filter:\s*"blur\(\d+px\)"|filter:\s*"blur\(\d+px\)",?\s*|filter:\s*"none",?\s*/g, '')
  
  writeFileSync(motionFile, content)
  totalFiles++
  console.log(`✓ enhanced-motion.tsx (removed all filter:blur)`)
} catch(e) {}

console.log(`\n═══ Performance Fix Complete ═══`)
console.log(`Files fixed: ${totalFiles}`)
console.log(`Total expensive effects removed: ${totalChanges}`)
