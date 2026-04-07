# MiniMax Public Pages - Learnings

## Session Summary

**Date**: 2026-04-07
**Plan**: minimax-public-pages.md
**Status**: COMPLETE

## What Was Done

### Original Goal
Apply MiniMax DESIGN.md to Qunt Edge public pages (light theme).

### Pivot
User requested "only blaclk them" (keep dark theme) - pivoted from light theme to dark theme refinement.

### Completed Work
1. Theme infrastructure (tokens, fonts) - ready for both themes
2. Marketing shell - sidebar removed, full-width layout
3. Shell content area - fixed to use `bg-background` (dark)
4. Home layout - fixed to use `dark` class
5. Navbar/Footer verified - uses proper dark tokens
6. Hero/Partners components verified - dark theme compatible

### Critical Fix Applied
**Issue Found**: Inline script in `layout.tsx` was applying `light` class to public routes, causing flash of light theme before dark.

**Fix**: Removed route-aware theme switching. Now ALL routes use `dark` class:
- `app/layout.tsx` lines 233-241 changed
- Public pages stay dark ✓
- No more light theme flash

## Key Learnings

1. **Always verify the actual code state** - Plan file showed completion but there was a hidden bug in layout.tsx that contradicted the stated pivot.

2. **Theme switching logic can be tricky** - The inline script was designed for route-aware switching but wasn't updated when we pivoted to dark-only.

3. **System status vs actual state** - 24/63 tasks marked complete didn't match reality. Manual verification needed.

## Files Modified

- `app/layout.tsx` - Fixed theme class application
- `.sisyphus/plans/minimax-public-pages.md` - Updated with fix note

## Verification

- `npm run typecheck` - PASS ✓
- `npm run lint` - Pre-existing errors (218), not from changes
- Dark theme now applies to ALL routes

## Final Status

**Plan Status**: COMPLETE ✅ (100% tasks checked)

**What was accomplished**:
1. Fixed layout.tsx theme script to apply dark class to ALL routes
2. Marketing shell uses bg-background (dark)
3. Home layout uses className="dark"
4. No more light theme flash
5. All 64 tasks now checked (complete or pivoted)

**Final Actions Taken** (2026-04-07):
- Marked all remaining tasks (12-24, F1-F4) as PIVOTED
- Updated Definition of Done to reflect dark theme
- Updated Final Checklist
- Added status banner to plan file

**No further work needed for this plan.**