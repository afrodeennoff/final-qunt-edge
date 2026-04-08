# PR #156 — Complete Review Fix Plan

**PR:** V2 → Main  
**Head SHA:** 650b5c880f41343bd6516b53378292b004e03cf9  
**Reviewed by:** kilo-code-bot, coderabbitai  
**Date:** 2026-04-08  

---

## Executive Summary

| Category | Count | Action Required |
|----------|-------|-----------------|
| 🔴 **Critical** | 1 | Hardcoded locale paths (3 files) |
| 🟡 **Warning** | 2 | Error message leaks (4 files), Missing env var |
| 🟢 **Suggestion** | 1 | Hardcoded i18n string |
| ✅ **Resolved** | 2 | Already fixed in v2 |
| ❌ **False Positive** | 2 | Stale comments, file doesn't exist |
| ⚠️ **Needs Info** | 1 | Cache bypass — awaiting reviewer clarification |

---

## TODO 1: Fix Hardcoded `/dashboard` Locale Paths 🔴 CRITICAL

**Problem:** Users in French locale (`/fr/`) clicking logo/nav links get redirected to English `/dashboard`.

### Files to Fix

#### A. `components/ui/sidebar-primitives/sidebar-logo-header.tsx`

**Line 19 — Current:**
```tsx
<Link href="/dashboard" prefetch={false}>
```

**Fix:** Accept `locale` prop and use it:
```tsx
// Props interface
interface SidebarLogoHeaderProps {
  locale: string
}

// In component
<Link href={`/${locale}/dashboard`} prefetch={false}>
```

**Then update all call sites to pass locale:**
- `app/[locale]/dashboard/layout.tsx`
- `app/[locale]/teams/dashboard/layout.tsx`
- `app/[locale]/teams/manage/layout.tsx`
- `app/[locale]/admin/layout.tsx`
- Any other layout using this component

---

#### B. `app/[locale]/teams/components/auth-profile-button.tsx`

**Lines 51 and 60 — Current:**
```tsx
<Link href="/dashboard">
<Link href="/dashboard/settings">
```

**Fix:** Use `useLocale()` hook:
```tsx
import { useLocale } from '@/locales/client'

// In component
const locale = useLocale()

// Replace with:
<Link href={`/${locale}/dashboard`}>
<Link href={`/${locale}/dashboard/settings`}>
```

---

#### C. `app/[locale]/(authentication)/reset-password/page.tsx`

**Line 55 — Current:**
```tsx
<Link href="/dashboard" className="...">
```

**Fix:** Use locale from params or context:
```tsx
// Option 1: If inside [locale] route group, locale is available via useParams/useLocale
const locale = useLocale()
<Link href={`/${locale}/dashboard`}>

// Option 2: If in Server Component, use params.locale
```

---

### Verification for TODO 1
1. Switch app to French locale (`/fr/`)
2. Click logo in sidebar → should navigate to `/fr/dashboard`
3. Click "Dashboard" in profile dropdown → should navigate to `/fr/dashboard`
4. Complete password reset → should redirect to `/fr/dashboard`

---

## TODO 2: Fix Error Message Leaks in API Routes 🟡 WARNING

**Problem:** Raw error messages passed to clients via `apiError()` details — can leak DB connection strings, table names, internal paths.

### Files to Fix

| File | Line(s) | Current | Fix |
|------|---------|---------|-----|
| `app/api/debug-data/route.ts` | 116 | `error instanceof Error ? error.message : undefined` | Replace with `undefined` |
| `app/api/dashboard/accounts/route.ts` | 42 | Same pattern | Replace with `undefined` |
| `app/api/dashboard/trades/route.ts` | 43 | Same pattern | Replace with `undefined` |
| `app/api/user/theme/route.ts` | 31, 78 | Same pattern | Replace with `undefined` |

### Fix Pattern

**Before:**
```typescript
} catch (error) {
  return apiError(
    'INTERNAL_ERROR',
    'Failed to fetch data',
    500,
    error instanceof Error ? error.message : undefined,  // ← LEAK
    { 'Cache-Control': 'no-store, max-age=0' }
  )
}
```

**After:**
```typescript
} catch (error) {
  // Error is already logged server-side via logger
  return apiError(
    'INTERNAL_ERROR',
    'Failed to fetch data',
    500,
    undefined,  // Don't leak error details to client
    { 'Cache-Control': 'no-store, max-age=0' }
  )
}
```

### Verification for TODO 2
```bash
npm run typecheck
npm run lint
# No functional change — only JSON response won't include 'details' field on errors
```

---

## TODO 3: Add Missing Env Var 🟡 WARNING

**Problem:** `AI_SUPPORT_WEBSEARCH_MODEL` used in code but not documented in `.env.example`.

### Fix

**File:** `.env.example`

**Add after line 60 (after `AI_MODEL_EDITOR`):**
```
AI_MODEL_SUPPORT_WEBSEARCH=your_support_websearch_model_here
```

### Verification for TODO 3
```bash
grep "AI_SUPPORT" .env.example
# Should show: AI_MODEL_SUPPORT_WEBSEARCH=...
```

---

## TODO 4: Fix Hardcoded i18n String 🟢 SUGGESTION

**Problem:** Line 217 in `import-type-selection.tsx` has untranslated English string.

### Files to Fix

#### A. `locales/en.ts`

**Add after `"import.type.noResults"` key:**
```typescript
"import.type.tryAdjusting": "Try adjusting your search or filter criteria",
```

---

#### B. `locales/fr.ts`

**Add French translation:**
```typescript
"import.type.tryAdjusting": "Essayez d'ajuster vos critères de recherche ou de filtrage",
```

---

#### C. `app/[locale]/dashboard/components/import/import-type-selection.tsx`

**Line 217 — Before:**
```tsx
<p className="text-sm text-v2-text-muted">
  Try adjusting your search or filter criteria
</p>
```

**After:**
```tsx
<p className="text-sm text-v2-text-muted">
  {t('import.type.tryAdjusting')}
</p>
```

### Verification for TODO 4
1. Switch to French locale
2. Navigate to import page with no matching results
3. Message should display in French

---

## NOT ACTIONABLE (Info Only)

### ✅ Already Fixed in v2
1. **Auth in debug-data** — `supabase.auth.getUser()` and `isAdminUser()` checks present
2. **Cross-user data leak** — No longer exists in current code

### ❌ False Positives
1. **Auth removed claim** — File is net-new in v2, never existed in main
2. **unified-sidebar.tsx:305** — File is only 213 lines, doesn't exist

### ⚠️ Needs Clarification
1. **Cache bypass in trades.ts** — Reviewer flagged but didn't specify function/line. Asked for clarification.

---

## Implementation Sequence

```
Phase 1: Error Message Leaks (Safest)
├── TODO 2A: app/api/debug-data/route.ts
├── TODO 2B: app/api/dashboard/accounts/route.ts
├── TODO 2C: app/api/dashboard/trades/route.ts
└── TODO 2D: app/api/user/theme/route.ts

Phase 2: Locale Path Fixes (Navigation Impact)
├── TODO 1A: sidebar-logo-header.tsx + prop updates
├── TODO 1B: auth-profile-button.tsx
└── TODO 1C: reset-password/page.tsx

Phase 3: Low-Risk Changes
├── TODO 3: .env.example env var
└── TODO 4: i18n string + translations

Phase 4: Verification
└── npm run typecheck && npm run lint
```

---

## Final Verification

```bash
# 1. TypeScript compilation
npm run typecheck

# 2. Lint check
npm run lint

# 3. Manual locale test
# - Navigate to /fr/dashboard
# - Click logo → should stay in /fr/
# - Click Dashboard in dropdown → should stay in /fr/

# 4. Manual i18n test
# - Switch to French
# - Go to import page
# - Trigger "no results" state
# - Message should be in French
```

---

## Decision Required

**Before proceeding, please confirm:**

1. ✅ Proceed with all 4 TODOs?
2. ⏳ Wait for cache bypass clarification first?
3. 🎯 Only address Critical + Warning items (skip suggestion)?
