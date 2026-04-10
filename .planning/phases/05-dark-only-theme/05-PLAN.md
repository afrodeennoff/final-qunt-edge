# Phase 05: Dark-Only Theme Enforcement — Implementation Plan

**Status**: Ready for implementation
**Phase**: 05 — Dark-Only Theme Enforcement
**Milestone**: v2.1 Production Hardening
**Generated**: 2026-04-11

---

## Overview

Remove route-based light/dark theme branching. The app is dark-only; the `light` class is never defined in CSS. The `ThemeRouteInitializer` client component toggles `light`/`dark` classes on every public route load — unnecessary and harmful.

### Files to Delete
- `lib/theme-client.tsx`
- `lib/theme-route.ts`

### Files to Modify
- `app/layout.tsx` — Remove `ThemeRouteInitializer` import and usage
- `app/not-found.tsx` — Remove `applyThemeToDocument` function
- `app/[locale]/embed/page.tsx` — Remove redundant `classList.remove('light', 'dark')` calls

---

## Tasks

### T5.1: Remove ThemeRouteInitializer from Root Layout

**File**: `app/layout.tsx`

**Changes**:
1. Remove line 16: `import ThemeRouteInitializer from "@/lib/theme-client";`
2. Remove line 255: `<ThemeRouteInitializer />`

**Verification**: `grep "ThemeRouteInitializer" app/layout.tsx` returns empty

### T5.2: Delete theme-client.tsx and theme-route.ts

**Files**: `lib/theme-client.tsx`, `lib/theme-route.ts`

**Verification**: Files do not exist

### T5.3: Remove applyThemeToDocument from not-found.tsx

**File**: `app/not-found.tsx`

**Changes**:
1. Remove `applyThemeToDocument` function (lines 46-53)
2. Remove the `applyThemeToDocument(savedIntensity)` call in the useEffect (line 96)
3. The function removes 'light'/'dark' and adds 'dark' — no longer needed since app is always dark

**Verification**: `grep "applyThemeToDocument" app/not-found.tsx` returns empty

### T5.4: Remove redundant theme class removal from embed page

**File**: `app/[locale]/embed/page.tsx`

**Changes**:
1. Remove `root.classList.remove('light', 'dark')` calls at lines 78 and 120
2. The embed page doesn't add any theme class back, so the removal is pointless

**Verification**: `grep "classList.remove.*light.*dark" app/[locale]/embed/page.tsx` returns empty

### T5.5: Verify no remaining theme class references

**Command**: `grep -rn "classList.add.*light\|classList.remove.*light\|'light'\|\"light\"" --include="*.tsx" --include="*.ts" | grep -v "node_modules\|\.next\|05-CONTEXT\|05-PLAN\|05-VERIFICATION\|locale.*light" | head -20`

**Expected**: Only harmless occurrences (e.g., locale strings, comments about "light mode")

### T5.6: TypeScript and Lint

**Commands**:
1. `npm run typecheck` — must pass
2. `npm run lint` — must pass with zero new errors

---

## Commit Strategy

| Step | Commit Message | Files |
|------|---------------|-------|
| 1 | `fix(theme): remove ThemeRouteInitializer from root layout` | app/layout.tsx |
| 2 | `refactor(theme): remove legacy light/dark route class files` | lib/theme-client.tsx, lib/theme-route.ts (deleted) |
| 3 | `fix(theme): remove applyThemeToDocument from not-found page` | app/not-found.tsx |
| 4 | `fix(theme): remove redundant theme class removal from embed page` | app/[locale]/embed/page.tsx |
| 5 | `chore(05): complete dark-only theme enforcement` | N/A |

---

## Success Criteria

- [ ] `app/layout.tsx` does not import or use `ThemeRouteInitializer`
- [ ] `lib/theme-client.tsx` deleted
- [ ] `lib/theme-route.ts` deleted
- [ ] `app/not-found.tsx` has no theme class manipulation
- [ ] `app/[locale]/embed/page.tsx` has no theme class removal
- [ ] No `'light'` theme class added anywhere in app
- [ ] TypeScript passes
- [ ] ESLint passes

---

*Plan Version: 1.0*
*Phase: 05 — Dark-Only Theme Enforcement*
*Milestone: v2.1 Production Hardening*
