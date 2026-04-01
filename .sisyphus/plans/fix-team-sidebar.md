# Fix Team Landing Sidebar

## TL;DR

> **Quick Summary**: Add `showSidebar={false}` to the team landing layout so public team pages have no sidebar.
> 
> **Deliverables**:
> - `app/[locale]/teams/(landing)/layout.tsx` updated
> 
> **Estimated Effort**: Quick (1 file, 1 line change)
> **Parallel Execution**: NO — single file
> **Critical Path**: Edit teams landing layout

---

## Context

### Original Request
User says sidebar is appearing on the public team page and they don't want it. The `teams/(landing)/layout.tsx` uses `MarketingLayoutShell` which defaults to `showSidebar={true}`.

### The Fix
Add `showSidebar={false}` to the `MarketingLayoutShell` in `teams/(landing)/layout.tsx`.

---

## Work Objectives

### Core Objective
Remove sidebar from public team pages by setting `showSidebar={false}`.

### Concrete Deliverables
- Edit `app/[locale]/teams/(landing)/layout.tsx` — add `showSidebar={false}` prop

---

## TODOs

---

- [x] 1. Remove sidebar from team landing layout

  **What to do**:
  - Edit `app/[locale]/teams/(landing)/layout.tsx`
  - Change `<MarketingLayoutShell contentClassName="w-full">` to `<MarketingLayoutShell contentClassName="w-full" showSidebar={false}>`

  **Must NOT do**:
  - Don't modify DashboardSidebar, TeamsSidebar, or SidebarNav
  - Don't touch authenticated team routes

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file, one-line change, no risk
  - **Skills**: none needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Nothing
  - **Blocked By**: Nothing

  **References**:
  - `app/[locale]/(landing)/layout.tsx:41` — reference showing `showSidebar={false}` used on main landing layout
  - `app/[locale]/(landing)/components/marketing-layout-shell.tsx:27` — default is `showSidebar = true`
  - `app/[locale]/teams/(landing)/layout.tsx:31` — current call without showSidebar prop

  **Acceptance Criteria**:
  - [ ] `showSidebar={false}` present in team landing layout

---

## Commit Strategy

- **1**: `fix(layout): remove sidebar from public team page` — `app/[locale]/teams/(landing)/layout.tsx`

---

## Success Criteria

```bash
# Verify showSidebar={false} is in team landing layout
grep "showSidebar={false}" app/[locale]/teams/\(landing\)/layout.tsx
# Expected: line with showSidebar={false}
```
