#!/usr/bin/env node

import { spawnSync } from "node:child_process"
import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

const dir = resolve(fileURLToPath(import.meta.url), "../..")

const checkEnvDuplicates = () => {
  let hasErrors = false
  for (const file of [".env", ".env.local"]) {
    const path = resolve(dir, file)
    if (!existsSync(path)) continue
    const lines = readFileSync(path, "utf-8").split("\n")
    const seen = new Map()
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/^([A-Z_][A-Z0-9_]*)=/)
      if (!match) continue
      const key = match[1]
      if (seen.has(key)) {
        const prev = seen.get(key)
        console.error(`[Self-Heal] ⚠ ${file}:${i + 1} — "${key}" duplicated (also on line ${prev})`)
        hasErrors = true
      } else {
        seen.set(key, i + 1)
      }
    }
  }
  if (hasErrors) {
    console.error("[Self-Heal] ✗ Fix env duplicates: keep the later value, remove the earlier occurrence.")
    process.exit(1)
  }
  console.log("[Self-Heal] ✓ Env files duplicate-free")
}

const run = (label, args) => {
  console.log(`\n[Self-Heal] ${label}`)
  const result = spawnSync("npm", args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  })

  return result.status ?? 1
}

checkEnvDuplicates()
const autoFixCode = run("Running ESLint auto-fix", ["run", "lint", "--", "--fix"])
if (autoFixCode !== 0) {
  console.error(`\n[Self-Heal] Auto-fix failed with exit code ${autoFixCode}.`)
  process.exit(autoFixCode)
}

const verifyCode = run("Running validation lint pass", ["run", "lint"])
if (verifyCode !== 0) {
  console.error(`\n[Self-Heal] Validation failed with exit code ${verifyCode}.`)
  process.exit(verifyCode)
}

console.log("\n[Self-Heal] Completed. Auto-fix pass + validation pass are done.")
