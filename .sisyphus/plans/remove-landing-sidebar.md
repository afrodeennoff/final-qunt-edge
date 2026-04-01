# Remove LandingSidebar from Marketing/Public Pages

## TL;DR

> **Quick Summary**: Set `showSidebar={false}` on the marketing layout so all public pages have no sidebar.
> 
> **Deliverables**:
> - `app/[locale]/(landing)/layout.tsx` updated
> 
> **Estimated Effort**: Quick (1 file, 1 line change)
> **Parallel Execution**: NO — single file
> **Critical Path**: Edit landing layout

---

## Context

### Original Request
User wants to completely remove the sidebar from all marketing/public pages. Currently `(landing)/layout.tsx` uses `MarketingLayoutShell` with the default `showSidebar={true}`, which renders `LandingSidebar`. Home page already has `showSidebar={false}`.

### Interview Summary
**Key Discussions**:
- User explicitly said: "remove that sidebar in marketing and public page and i dont want LandingSidebar"

---

## Work Objectives

### Core Objective
Remove `LandingSidebar` from all marketing/public pages by setting `showSidebar={false}` in the root landing layout.

### Concrete Deliverables
- Edit `app/[locale]/(landing)/layout.tsx` — add `showSidebar={false}` prop

### Definition of Done
- [x] Landing pages load with no sidebar visible

---

## TODOs

---

- [x] 1. Remove LandingSidebar from landing layout

  **What to do**:
  - Edit `app/[locale]/(landing)/layout.tsx`
  - Change `<MarketingLayoutShell contentClassName="w-full px-4 sm:px-6 lg:px-8">` to `<MarketingLayoutShell contentClassName="w-full px-4 sm:px-6 lg:px-8" showSidebar={false}>`

  **Must NOT do**:
  - Don't modify DashboardSidebar, TeamsSidebar, or SidebarNav
  - Don't touch any authenticated routes

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file, one-line change, no risk
  - **Skills**: none needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Nothing
  - **Blocked By**: Nothing

  **References**:
  - `app/[locale]/(landing)/layout.tsx:41` — current MarketingLayoutShell call (no showSidebar prop, defaults to true)
  - `app/[locale]/(home)/layout.tsx:28` — reference showing `showSidebar={false}` already used on home page
  - `app/[locale]/(landing)/components/marketing-layout-shell.tsx:27` — MarketingLayoutShell accepts showSidebar prop

  **Acceptance Criteria**:
  - [x] `showSidebar={false}` present in landing layout

  **QA Scenarios**:

  \`\`\`
  Scenario: Landing page loads with no sidebar
    Tool: webapp-testing (playwright)
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Navigate to http://localhost:3000/en/propfirms
      2. Inspect the page
    Expected Result: No sidebar visible on the left side
    Failure Indicators: Sidebar navigation bar visible on left
    Evidence: .sisyphus/evidence/task-1-no-sidebar.png

  Scenario: About page loads with no sidebar
    Tool: webapp-testing (playwright)
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000/en/about
      2. Inspect the page
    Expected Result: No sidebar visible
    Failure Indicators: Sidebar visible
    Evidence: .sisyphus/evidence/task-1-no-sidebar-about.png
  \`\`\`

---

## Final Verification Wave

- [x] F1. **Layout Verification** — `quick`
  Read `app/[locale]/(landing)/layout.tsx` — verify `showSidebar={false}` is set. Browse to 3+ landing pages (propfirms, about, pricing) — verify no sidebar.

- [x] F2. **Auth Pages Unaffected** — `quick`
  Browse to `/en/dashboard` — verify dashboard sidebar still works. Browse to `/en/teams/dashboard` — verify teams sidebar still works.

---

## Commit Strategy

- **1**: `fix(layout): remove LandingSidebar from public pages` — `app/[locale]/(landing)/layout.tsx`

---

## Success Criteria

```bash
# Verify showSidebar={false} is in landing layout
grep "showSidebar={false}" app/[locale]/\(landing\)/layout.tsx
# Expected: line with showSidebar={false}
```
