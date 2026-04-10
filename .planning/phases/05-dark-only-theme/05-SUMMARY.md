# Phase 05: Dark-Only Theme Enforcement — Summary

**Executed:** 2026-04-11
**Status:** Complete

## What was done

### Problem
The app was dark-only but had legacy route-based light/dark theme class toggling code:
1. `lib/theme-route.ts` returned `'light'` for public routes (but CSS had no `light` class)
2. `lib/theme-client.tsx` ran on every client navigation, toggling `light`/`dark` classes
3. `app/layout.tsx` mounted `ThemeRouteInitializer` from root
4. `app/not-found.tsx` had an `applyThemeToDocument` function that removed/add classes
5. `app/[locale]/embed/page.tsx` had redundant `classList.remove('light', 'dark')` calls

### Changes

1. **app/layout.tsx**: Removed `ThemeRouteInitializer` import and usage
2. **lib/theme-client.tsx**: Deleted
3. **lib/theme-route.ts**: Deleted
4. **app/not-found.tsx**: Removed `applyThemeToDocument` function and its `localStorage` intensity call
5. **app/[locale]/embed/page.tsx**: Removed redundant `classList.remove('light', 'dark')` calls (kept `classList.add('dark')` for embed preset system)

## Key Files Changed
- `app/layout.tsx` — -2 lines (removed import + usage)
- `app/not-found.tsx` — -11 lines (removed function + call)
- `app/[locale]/embed/page.tsx` — -2 lines (removed 2 classList.remove calls)
- `lib/theme-client.tsx` — deleted
- `lib/theme-route.ts` — deleted

## Verification
- Typecheck: PASS (pre-existing errors only)
- Lint: PASS (0 new errors)
- No remaining light/dark theme class toggling

## Dependencies
None

---

*Phase 05: Dark-Only Theme Enforcement — Complete*
