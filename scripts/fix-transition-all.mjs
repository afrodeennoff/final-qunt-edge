#!/usr/bin/env node
/**
 * Replace transition-all with specific properties to prevent
 * transform/filter animation delays on click
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

function walkDir(dir, ext = '.tsx') {
  let results = []
  try {
    const list = execSync(`find "${dir}" -name "*${ext}" -not -path "*/node_modules/*" -not -path "*/.next/*"`, { encoding: 'utf-8' }).trim().split('\n').filter(Boolean)
    return list
  } catch(e) { return results }
}

const dirs = [
  ...walkDir('components/ui'),
  ...walkDir('app/[locale]/dashboard'),
]

let totalFiles = 0
let totalChanges = 0

for (const f of dirs) {
  try {
    let c = readFileSync(f, 'utf-8')
    let orig = c
    
    // Replace transition-all with specific transition properties
    // But skip if it's already a specific transition
    c = c.replace(/transition-all/g, 'transition-[opacity,background-color,border-color]')
    
    if (c !== orig) {
      const count = (orig.match(/transition-all/g) || []).length
      writeFileSync(f, c)
      totalFiles++
      totalChanges += count
      console.log(`✓ ${f} — ${count}x transition-all → specific`)
    }
  } catch(e) {}
}

console.log(`\n═══ Task 11 Complete ═══`)
console.log(`Files: ${totalFiles}, Changes: ${totalChanges}`)
