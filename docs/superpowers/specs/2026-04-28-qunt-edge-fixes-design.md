# Qunt Edge v3 — Routing, Theming & Import Overhaul

**Date**: 2026-04-28
**Branch**: v3
**Status**: Approved

## Summary

Five sequential tasks to fix routing, standardize the color scheme, add custom themes, replace the trade import system, and deploy.

---

## Task 1: Fix Home Page Routing

### Problem
`/en` fails to load while `/en#features` works. The hash fragment should only scroll — not be required for the page to render.

### Root Cause Hypothesis
- I18n middleware in `proxy.ts` uses `urlMappingStrategy: 'redirect'`
- Hash fragments (`#features`) are client-side only — they bypass server-side redirect issues
- The middleware may be creating a redirect loop or failing to resolve the `(home)` route group for bare locale paths

### Fix Strategy
1. Trace the full middleware chain: `middleware.ts` → `proxy.ts` → i18n handler
2. Check if `middleware.ts` (currently deleted in git status) is the cause
3. Verify `(home)` route group resolution for `/[locale]` paths
4. Fix the redirect/middleware logic so `/en` renders the home page directly
5. Ensure hash fragments still scroll correctly after fix

### Files
- `middleware.ts` / `proxy.ts` — middleware chain
- `app/[locale]/(home)/page.tsx` — home page server component
- `app/[locale]/(home)/layout.tsx` — home layout wrapper

### Success Criteria
- `/en` loads the full home page
- `/en#features` loads the home page and scrolls to features section
- No redirect loops
- All other locales (`/fr`, `/de`, etc.) work identically

---

## Task 2: Standardize Color Scheme to Purple

### Scope
Default theme only. The 4 tweakcn themes (Task 3) retain their own colors.

### What Changes
- **Component-level overrides**: Find all `blue`, `green`, `teal`, `orange`, `emerald`, `cyan` accent usage in components and replace with purple equivalents
- **Hardcoded hex values**: Replace non-purple hardcoded colors in interactive elements (buttons, links, active states, focus rings, badges)
- **CSS variables**: Ensure `--primary`, `--accent`, `--ring` in the default theme resolve to purple

### What Does NOT Change
- Semantic colors: `destructive` (red for losses), `success` (green for profits), `warning` (amber) — these are meaningful in a trading app
- Chart colors that represent data (profit/loss coloring)
- The 4 tweakcn themes (Task 3)

### Files
- `app/globals.css` — CSS variables
- `tailwind.config.ts` — extended color palette
- Components with hardcoded accent colors (search for blue/green/teal/orange utilities)
- `lib/constants/dashboard-themes.ts` — default theme values

### Success Criteria
- All interactive elements use purple by default
- No blue/green/teal/orange accents on buttons, links, badges, focus rings
- Semantic colors (profit green, loss red, warning amber) preserved

---

## Task 3: Apply 4 Custom Themes from tweakcn

### Themes
1. **Efferd** — Grayscale, minimal (no strong accent color)
2. **Hass** — Lime green primary `#bbf047`
3. **hex** — Dark-only, neon green primary `#2fe92b`
4. **my-theme** — Purple-toned primary (closest to default)

### Integration Strategy
Add as new entries in the existing dashboard theme system (`lib/constants/dashboard-themes.ts`). Each theme gets:
- Light mode CSS variables (where applicable — "hex" is dark-only)
- Dark mode CSS variables
- Theme name and metadata for the switcher UI

The existing theme switcher component picks up themes from the registry automatically.

### Files
- `lib/constants/dashboard-themes.ts` — add 4 new theme entries
- Theme switcher component (if it needs updates for new theme count)

### Success Criteria
- All 4 themes appear in the dashboard theme switcher
- Switching themes updates all CSS variables correctly
- Light/dark modes work for themes that support both
- No conflicts with default purple theme

---

## Task 4: Replace Trade Import with Deltalytix Implementation

### Scope
Replace the CSV/manual import flow. Keep broker sync flows (Tradovate, Rithmic, DxFeed) untouched.

### Process
1. Clone `https://github.com/hugodemenez/deltalytix.git`
2. Study the complete import flow: file upload, CSV parsing, column mapping, validation, data storage
3. Replace existing import wizard components in `app/[locale]/dashboard/components/import/`
4. Adapt server-side logic to Qunt Edge's Prisma/Supabase data layer
5. Preserve the Trade model schema — adapt Deltalytix's data to fit existing fields

### Components to Replace
- `ImportTypeSelection` — platform selection
- `FileUpload` — file upload + parsing
- `HeaderSelection` — CSV header mapping
- `ColumnMapping` — column-to-field mapping
- `AccountSelection` — account picker
- `FormatPreview` — trade preview
- `ImportButton` — orchestrator

### What Stays
- Broker sync actions (Tradovate, Rithmic, DxFeed) in `server/imports/`
- Trade model in Prisma schema
- `saveTradesAction` server action (adapted)

### Files
- `app/[locale]/dashboard/components/import/*` — UI components
- `server/trades.ts` — server-side import logic
- `prisma/schema.prisma` — Trade model (read-only, adapt imports to fit)

### Success Criteria
- Import flow matches Deltalytix behavior: upload → parse → map → validate → preview → save
- Error handling matches Deltalytix patterns
- Existing broker sync flows unaffected
- No new npm dependencies (adapt, don't add)

---

## Task 5: Build, Commit, Deploy

### Steps
1. `npm run typecheck` — fix all TypeScript errors
2. `npm run build` — fix build failures
3. Commit with descriptive message
4. Deploy to Vercel production

### Success Criteria
- Zero TypeScript errors
- Clean production build
- Changes committed to v3 branch
- Deployed to Vercel

---

## Execution Order

Tasks run sequentially: 1 → 2 → 3 → 4 → 5

Tasks 2 and 3 share the theme system files, so they must run in order to avoid conflicts. Task 4 is independent but largest in scope. Task 5 is the final gate.
