#!/usr/bin/env node

import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

const dir = resolve(fileURLToPath(import.meta.url), "../..")

const envFiles = [".env", ".env.local", ".env.example"]

let hasErrors = false

for (const file of envFiles) {
  const path = resolve(dir, file)
  if (!existsSync(path)) continue

  const lines = readFileSync(path, "utf-8").split("\n")
  const keys = []
  const seen = new Map()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=/)
    if (!match) continue
    const key = match[1]
    keys.push(key)
    if (seen.has(key)) {
      const prevLine = seen.get(key)
      console.error(`[env-duplicates] ${file}:${i + 1} — "${key}" appears at line ${prevLine} and again on line ${i + 1}`)
      hasErrors = true
    } else {
      seen.set(key, i + 1)
    }
  }
}

if (hasErrors) {
  console.error("\n[env-duplicates] ✗ Fix duplicates: keep the later occurrence, remove the earlier one.")
  process.exit(1)
}

console.log("[env-duplicates] ✓ All env files are duplicate-free.")
