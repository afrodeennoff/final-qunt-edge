# Plan B: Full Codebase Audit

> **For agentic workers:** Sub-plan of `2026-05-28-dashboard-restructure-mcp-audit.md`. Cross-cutting fixes — scan every `.ts` and `.tsx` file for known anti-patterns, broken imports, and type errors.

**Goal:** Find and fix all build errors, broken imports, type errors, unused code, routing issues, and anti-pattern violations across the entire codebase.

**Architecture:** Use grep/ripgrep to scan for known patterns, fix each category in batch, then build-verify.

---

## Task B1: Scan and fix broken import paths

**Files:** ALL `.ts` and `.tsx` files

- [ ] **Step 1: Scan for missing re-export patterns**

The previous fix (commit `d4776a9a`) fixed 15 broken `export { default } from './client/*'` patterns. Re-scan for remaining ones:

```bash
rg "export \{ default \} from" --type ts --type tsx app/ components/ server/ lib/ --no-filename
```

Expected output: Nothing (all should already be fixed). If any remain, fix them by naming the default export.

- [ ] **Step 2: Scan for broken component import paths**

```bash
rg "from '(\.\./)+components/ui/v2" app/ --no-filename | head -20
```

If any v2 path still exists, verify the file actually exists at that path.

- [ ] **Step 3: Scan for `variant="error"` (should be `"destructive"`)**

```bash
rg "variant=\"error\"" --type tsx app/ components/ --no-filename
```

Replace each with `variant="destructive"`. Also check for hardcoded `variant="accent"` → should be `"info"` or `"default"` depending on context.

- [ ] **Step 4: Scan for `variant="solid"` (should be `"default"`)**

```bash
rg "variant=\"solid\"" --type tsx app/ components/ --no-filename
```

After the previous commit, there should be 0 remaining. If any exist, replace with `variant="default"`.

---

## Task B2: Fix remaining anti-pattern violations

**Files:** ALL `.ts` and `.tsx` files

- [ ] **Step 1: Scan for `console.log` (should use `console.warn`/`console.error`)**

```bash
rg "console\.log\(" --type ts --type tsx app/ components/ server/ lib/ --no-filename
```

For each hit:
- If it's a debug log that should stay but use proper logging → change to `console.warn` or `console.error`
- If it's unnecessary → remove

Exceptions: Allowed in test files and build scripts.

- [ ] **Step 2: Scan for hardcoded hex colors**

```bash
rg "#[0-9a-fA-F]{6}" --type tsx app/ components/ui/ --no-filename | rg -v "oklch|var\(--" | head -30
```

Any hardcoded hex colors in component files should use semantic tokens or oklch values instead.

Exceptions:
- Satori OG image files (Satori doesn't support CSS vars)
- CSS files (globals.css tokens are the source of truth)
- `dangerouslySetInnerHTML` or raw SVG content

- [ ] **Step 3: Scan for `backdrop-blur` usage**

```bash
rg "backdrop-blur" --type tsx app/ components/ --no-filename
```

Per AGENTS.md rules: "Never use backdrop-blur". Remove any instances or replace with solid backgrounds.

- [ ] **Step 4: Scan for unused imports in large files**

Check files > 200 lines for unused imports using TypeScript compiler check:

```bash
npx tsc --noEmit --pretty 2>&1 | head -80
```

---

## Task B3: Fix routing and navigation issues

**Files:** ALL route files and navigation components

- [ ] **Step 1: Update all remaining references to `/dashboard/behavior`**

```bash
rg "/dashboard/behavior" --type tsx --type ts --no-filename
```

This should find the `smart-insights-widget.tsx` reference. Update it to point to `/dashboard/analytics` instead.

- [ ] **Step 2: Update all remaining references to `/dashboard/reports`**

```bash
rg "/dashboard/reports" --type tsx --type ts --no-filename
```

Replace with `/dashboard/analytics`.

- [ ] **Step 3: Check for orphaned smart-insights references**

In `app/[locale]/dashboard/components/widgets/smart-insights-widget.tsx:75`, the `InsightActionTarget` set includes `/dashboard/behavior` and `/dashboard/reports`. Replace both with `/dashboard/analytics`.

- [ ] **Step 4: Commit all route fixes**

```bash
git add -A
git commit -m "fix: update all route references from reports/behavior to analytics"
```

---

## Task B4: Remove dead code and unused files

**Files:** ALL directories

- [ ] **Step 1: Find backup files (`.bak` extensions)**

```bash
find app/ -name "*.bak" -o -name "*.backup" 2>/dev/null
```

Delete any `.bak` files (like `chat.tsx.bak`, `lazy-widget.tsx.bak`, `widget-registry.tsx.bak`) since they're stale copies.

- [ ] **Step 2: Check for commented-out widget registrations**

In `app/[locale]/dashboard/config/widget-registry.tsx`, there's a commented-out `marketChart` widget. Either uncomment and activate it, or remove the dead code.

- [ ] **Step 3: Check for duplicate client/ directories in admin**

The admin has `app/[locale]/admin/components/client/` with duplicate exports. These were partially fixed in the previous re-export commit. Verify all are now properly exported and remove any truly dead files.

- [ ] **Step 4: Commit dead code removal**

```bash
git add -A
git commit -m "chore: remove dead code, backup files, and commented-out registrations"
```

---

## Task B5: Build verification

**Files:** None (verification only)

- [ ] **Step 1: Run the type checker**

```bash
npm run typecheck 2>&1 | tail -40
```

Expected: No type errors.

- [ ] **Step 2: If typecheck passes, run lint**

```bash
npm run lint 2>&1 | tail -20
```

Expected: No lint errors.

- [ ] **Step 3: If lint passes, run tests**

```bash
npm run test 2>&1 | tail -20
```

Expected: All tests passing.

- [ ] **Step 4: If tests pass, run build**

```bash
npm run build 2>&1 | tail -30
```

Expected: Successful build with no errors.

If any step fails, fix the reported issues and re-run from step 1.
