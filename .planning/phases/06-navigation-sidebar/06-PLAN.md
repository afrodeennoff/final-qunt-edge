# Phase 06: Navigation & Sidebar Standardization — Implementation Plan

**Status**: Ready for implementation
**Phase**: 06 — Navigation & Sidebar Standardization
**Milestone**: v2.1 Production Hardening
**Generated**: 2026-04-11

---

## Tasks

### T6.1: Add Main Dashboard nav item to Admin Sidebar

**File**: `admin/components/sidebar-nav.tsx`

**Changes**:
1. Add `ArrowLeft` to imports (already imported in teams-sidebar.tsx, needs import here)
2. Add `Dashboard` import from lucide-react
3. Add Main Dashboard route item to routes array:
```tsx
{
  href: `/${locale}/dashboard`,
  icon: <ArrowLeft className={NAV_ICON_SIZE} />,
  label: "Main Dashboard",
  group: "System"
}
```

**Verification**: `grep "Main Dashboard" admin/components/sidebar-nav.tsx` returns line

### T6.2: Add Main Dashboard item to Admin Mobile Nav

**File**: `admin/admin-client-layout.tsx`

**Changes**:
1. Add `ArrowLeft` to lucide imports
2. Add Dashboard item to mobileItems array:
```tsx
{ href: `/${locale}/admin/dashboard`, icon: ArrowLeft, label: 'Dashboard' }
```
Wait — admin doesn't have `/admin/dashboard`. The admin mobile nav is about navigating between admin sections. The "Main Dashboard" link should go to `${locale}/dashboard` (the user's main trading dashboard, not an admin sub-route).

Actually, looking at the admin client layout more carefully — the admin is a separate surface from the main dashboard. The mobile nav is for navigating within admin sections. The logo header links to `/dashboard` which takes you to the main trading dashboard.

The Phase 06 requirement says "Admin sidebar has working Main Dashboard back-link". This is about the DESKTOP sidebar (via UnifiedSidebar nav item), not the mobile nav. The mobile nav in admin is for admin section navigation.

**Decision**: Only add to desktop sidebar (T6.1). The admin mobile nav doesn't need a Main Dashboard item since it's for admin-specific navigation.

### T6.3: Verify Teams Sidebar Main Dashboard Link

**File**: `teams-sidebar.tsx`

**Verification**: Check line 82-86 has Main Dashboard item with ArrowLeft icon
```tsx
href: `${localePrefix}/dashboard`,
icon: <ArrowLeft />,
label: "Main Dashboard",
group: "System"
```

### T6.4: Verify Teams Mobile Nav Dashboard Link

**File**: `teams/dashboard/layout.tsx`

**Verification**: Lines 94-97 have Dashboard mobile item

### T6.5: TypeScript and Lint

**Commands**:
1. `npm run typecheck` — must pass
2. `npm run lint` — must pass with zero new errors

---

## Commit Strategy

| Step | Commit Message | Files |
|------|---------------|-------|
| 1 | `feat(nav): add Main Dashboard back-link to admin sidebar` | admin/components/sidebar-nav.tsx |
| 2 | `chore(06): complete navigation & sidebar standardization` | N/A |

---

## Success Criteria

- [ ] Admin sidebar has "Main Dashboard" nav item with ArrowLeft icon
- [ ] Admin sidebar "Main Dashboard" links to `${locale}/dashboard`
- [ ] Teams sidebar "Main Dashboard" already present and correct
- [ ] TypeScript passes
- [ ] ESLint passes

---

*Plan Version: 1.0*
*Phase: 06 — Navigation & Sidebar Standardization*
*Milestone: v2.1 Production Hardening*
