# 05 — Dark-Only Theme Enforcement — Context

**Gathered**: 2026-04-11
**Status**: Ready for planning
**Depends on**: None
**Phase**: 05 of v2.1 milestone

---

## Goal

Enforce true dark-only application. Remove route-based light-theme branching. All surfaces (public, auth, dashboard, admin, team, shared, embed, error, fallback) use dark theme contract. Delete client bootstrap logic toggling light/dark classes.

---

## Current State (Baseline)

### Theme System Architecture

The app currently has a two-layer theme system:

1. **Dark-only base** (`app/globals.css`): All surfaces default to dark via Tailwind's `.dark` class on `html`
2. **Dashboard accent colors** (`context/theme-provider.tsx`): `ThemeProvider` switches between `blue`/`violet`/`emerald`/`amber`/`rose` accent palettes — NOT light/dark
3. **Light/dark route classes** (`lib/theme-route.ts`, `lib/theme-client.tsx`): Legacy route-based class toggling

### Key Files

| File | Lines | Purpose | Action |
|------|-------|---------|--------|
| `lib/theme-route.ts` | 61 | Returns `'light'` for public routes | DELETE or nullify |
| `lib/theme-client.tsx` | 23 | Client component applying light/dark classes | DELETE |
| `app/not-found.tsx` | 369 | Removes light/dark, always adds 'dark' | REMOVE theme class code |
| `app/[locale]/embed/page.tsx` | ~130 | Removes light/dark classes | REMOVE theme class code |
| `locales/en/teams.ts` | ~30 | Has 'Light' theme label | KEEP (accidental match, not light theme) |
| `app/api/og/route.tsx` | ~200 | Comment about "light/dark mode" | KEEP (comment only) |
| `config/platforms.tsx` | ~850 | Comment about "light/dark mode support" | KEEP (comment only) |

### Current `theme-route.ts` Logic (Lines 24-55)

```typescript
export function getThemeClassForPathname(pathname: string): ThemeClass {
  // Public routes: root, home, landing, embed, shared → 'light'
  if (isPublic) return 'light';
  
  // Authenticated areas → 'dark'
  if (isAuth) return 'dark';
  
  // Fallback → 'dark'
  return 'dark';
}
```

**Problem**: This returns `'light'` for public routes, but all surfaces are dark. The `'light'` class is never defined in CSS, so it silently fails — but the `classList.add("light")` call still happens on every public route navigation.

### Current `theme-client.tsx` Logic (Lines 8-14)

```typescript
useEffect(() => {
  const cls = getThemeClassForPathname(window.location.pathname);
  root.classList.remove("light", "dark");
  root.classList.add(cls);  // Adds "light" on public routes
}, []);
```

**Problem**: Runs on every client-side navigation, toggling classes unnecessarily.

### `not-found.tsx` Current State (Lines 46-52)

```typescript
function applyThemeToDocument(intensity: number) {
  root.classList.remove('light', 'dark');  // Good — removes both
  root.classList.add('dark');              // Good — always dark
}
```

**Status**: Already correct. Just needs the `applyThemeToDocument` function cleaned up (remove the `intensity` parameter and `theme-intensity` style since it does nothing useful).

### `embed/page.tsx` Current State (Lines 78, 120)

```typescript
root.classList.remove('light', 'dark');  // Repeated in 2 places
```

**Status**: Already removes both, no class is added back. Remove the redundant removals.

---

## Implementation Gray Areas

### 1. What to do with `lib/theme-route.ts`

**Options**:

| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| **A. Delete file entirely** | Remove `theme-route.ts` and `theme-client.tsx` | Cleanest, no dead code | Unknown consumers might import |
| **B. Nullify logic** | Keep file, return `'dark'` always | Safe, preserves exports | Dead code remains |

**Decision**: Option A — Delete both files after verifying zero consumers.

**Verification**: `grep -rn "theme-route\|theme-client\|getThemeClass" --include="*.ts" --include="*.tsx" | grep -v "05-CONTEXT\|05-PLAN"`

### 2. `not-found.tsx` cleanup scope

**Decision**: Remove `applyThemeToDocument` function entirely. The function removes `light`/`dark` classes and adds `dark`, but since the app always runs with `.dark` on `html` (via Tailwind dark mode), no class manipulation is needed.

### 3. `embed/page.tsx` cleanup scope

**Decision**: Remove `classList.remove('light', 'dark')` calls. The embed page is already dark-themed. No class manipulation needed.

### 4. Locale strings about "Light" theme

**Decision**: Keep as-is. These are for the dashboard accent color "Light" theme option (if any). Not light/dark mode.

---

## Files to Create/Modify/Delete

### Delete
| File | Reason |
|------|--------|
| `lib/theme-client.tsx` | Dead code, toggles light/dark classes unnecessarily |
| `lib/theme-route.ts` | Returns 'light' for public routes, no longer needed |

### Modify
| File | Change |
|------|--------|
| `app/not-found.tsx` | Remove `applyThemeToDocument` function and its call |
| `app/[locale]/embed/page.tsx` | Remove `classList.remove('light', 'dark')` calls |

### Review (verify zero consumers)
| File | Check |
|------|-------|
| Any file importing `theme-route.ts` or `theme-client.tsx` | Must be zero before deletion |

---

## Success Criteria Checklist

- [ ] No route-based light-theme branching in codebase
- [ ] Every route family verified dark-only: home, landing, auth, dashboard, admin, teams, shared, embed, not-found, error
- [ ] No client bootstrap logic toggling light/dark classes
- [ ] `lib/theme-client.tsx` deleted
- [ ] `lib/theme-route.ts` deleted
- [ ] `app/not-found.tsx` theme manipulation removed
- [ ] `app/[locale]/embed/page.tsx` theme class removal removed
- [ ] TypeScript strict mode passes
- [ ] ESLint passes (no new lint errors)

---

## Dependencies on Other Phases

- **Phase 01 (Visual Refresh)**: Uses dark-only theme tokens — no conflict
- **Phase 04 (Import Polish)**: No overlap with theme enforcement

## Blockers/Concerns

1. **Unknown consumers of `theme-route.ts`**: Must verify zero imports before deletion
2. **`theme-client.tsx` in layout**: Need to check if any layout imports it

---

*End of Phase 05 Context*
