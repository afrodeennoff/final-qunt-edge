# 06 — Navigation & Sidebar Standardization — Context

**Gathered**: 2026-04-11
**Status**: Ready for planning
**Depends on**: None
**Phase**: 06 of v2.1 milestone

---

## Goal

Standardize admin and teams sidebars with clear dashboard back-link pattern. Admin gets visible Main Dashboard link, teams keeps consistent Main Dashboard link. Mobile navigation mirrors desktop contract.

---

## Current State (Baseline)

### Sidebar Architecture

All sidebars use `UnifiedSidebar` component. Navigation structure:

| Surface | Desktop Sidebar | Mobile Bottom Nav | Main Dashboard Link |
|---------|----------------|-----------------|-------------------|
| Admin | `SidebarNav` → `UnifiedSidebar` | `MobileBottomNav` in `AdminClientLayout` | **MISSING** |
| Teams | `TeamsSidebar` → `UnifiedSidebar` | `MobileBottomNav` in teams dashboard layout | Present |

### Admin Sidebar — Current (`admin/components/sidebar-nav.tsx`)

Routes (no explicit group → defaults to 'Settings'):
- Prop Firms, Coupons, Blog, Reviews, Newsletter Builder, Weekly Recap, Welcome Email, Send Email
- **Missing**: Main Dashboard back-link
- Note: `SidebarLogoHeader` links to `/dashboard` — implicit back-link exists

### Admin Mobile Nav — Current (`admin-client-layout.tsx` lines 44-50)

Items: Firms, Blog, Coupons, Newsletter, Recap
- **Missing**: Main Dashboard link

### Teams Sidebar — Current (`teams-sidebar.tsx` lines 81-86)

```tsx
{
  href: `${localePrefix}/dashboard`,
  icon: <ArrowLeft />,
  label: "Main Dashboard",
  group: "System"
}
```
**Status**: Already present. Links to `${localePrefix}/dashboard` — correct pattern.

### Teams Mobile Nav — Current (`teams/dashboard/layout.tsx` lines 94-97)

```tsx
{
  href: `/${locale}/dashboard`,  // hardcoded, locale-aware
  icon: ArrowLeft,
  label: "Dashboard",
}
```
**Status**: Present. Uses `/${locale}/dashboard`.

---

## Implementation Gray Areas

### 1. Admin Main Dashboard — Which icon and label?

**Decision**: Use `ArrowLeft` icon with "Main Dashboard" label, grouped in "System".

Rationale: Matches teams sidebar pattern exactly.

### 2. Admin Mobile Nav — Add Dashboard link?

**Decision**: Yes. Add "Main Dashboard" to admin mobile nav with `ArrowLeft` icon.

Rationale: Users navigating from admin to dashboard on mobile should have a clear path.

### 3. Teams Sidebar active state — Already working?

**Decision**: Verify `useActiveLink` correctly highlights "Main Dashboard" when on `/[locale]/dashboard`.

The `SidebarNavGroup` uses `isActive(href, item.exact)` with `exact: true` for Overview but not for Main Dashboard. Since Main Dashboard has no `exact` prop, it uses default (fuzzy match). This is correct — if user is on `/en/dashboard/overview`, the `href: "/en/dashboard"` should be active.

---

## Files to Create/Modify

### Modify
| File | Change |
|------|--------|
| `admin/components/sidebar-nav.tsx` | Add Main Dashboard nav item with ArrowLeft icon, System group |
| `admin/admin-client-layout.tsx` | Add Dashboard item to mobileItems |

---

## Success Criteria Checklist

- [ ] Admin sidebar has "Main Dashboard" nav item with ArrowLeft icon
- [ ] Admin sidebar "Main Dashboard" links to `${locale}/dashboard`
- [ ] Admin mobile nav has "Main Dashboard" item
- [ ] Teams sidebar "Main Dashboard" already present and correct
- [ ] Teams mobile nav already has Dashboard item
- [ ] TypeScript passes
- [ ] ESLint passes

---

*End of Phase 06 Context*
