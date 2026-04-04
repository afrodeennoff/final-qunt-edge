# Admin Panel Audit & Fix Plan

## TL;DR

> **Quick Summary**: Comprehensive audit of Qunt Edge admin panel identified 9 issues across 3 severity levels — all fixable with targeted surgical changes. No broken features, just consistency gaps and one deprecated API usage.
> 
> **Deliverables**:
> - Fixed `next/head` deprecation (SEO meta tag never rendered)
> - Reviews page added to sidebar navigation
> - Reviews page layout double-wrapping removed
> - Raw HTML elements replaced with V2 design system components
> - Loading states added for all admin pages
> 
> **Estimated Effort**: Short (2-3 hours total)
> **Parallel Execution**: YES — 3 waves, all tasks independent
> **Critical Path**: Wave 1 (critical) → Wave 2 (consistency) → Wave 3 (polish) → Verification

---

## Context

### Original Request
User asked to "audit the admin panel and make it functional."

### Interview Summary
**Key Discussions**:
- Full codebase exploration via 3 parallel explore agents covered all 13 admin pages, 9 server action files, 24+ components, 2 API routes, and authorization layer
- Typecheck passes with 0 errors across all admin files
- ESLint shows 0 new errors (5 pre-existing complexity warnings in existing code)

**Research Findings**:
- Admin panel is **mostly functional** — no broken CRUD operations, no missing data flows
- Server actions are well-structured with proper auth guards (`assertAdminAccess()`)
- Layout-level auth guard correctly redirects non-admin users
- All Prisma queries have proper fallbacks for DB unavailability
- **Core issue**: Design system inconsistency and one critical deprecated API

### Metis Review
**Identified Gaps** (addressed):
- Tailwind `v2-*` color tokens in reviews page may not be defined in config → Need verification
- Blog delete uses `confirm()` browser dialog → Acceptable pattern, kept as-is
- No rollback strategy specified → Each commit is independently reversible
- No regression tests mentioned → Will use typecheck + lint + build as verification gates

---

## Work Objectives

### Core Objective
Fix all identified issues in the admin panel to achieve full consistency with the V2 design system, proper App Router patterns, and complete navigation coverage.

### Concrete Deliverables
- `app/[locale]/admin/layout.tsx` — `robots` metadata export
- `app/[locale]/admin/admin-client-layout.tsx` — Removed `next/head`
- `app/[locale]/admin/components/sidebar-nav.tsx` — 8 navigation items (was 7)
- `app/[locale]/admin/reviews/page.tsx` — Clean layout without double-wrapping
- `app/[locale]/admin/error.tsx` — Uses `ButtonV2` instead of raw `<button>`
- `app/[locale]/admin/propfirms/[id]/page.tsx` — Uses `TextareaV2` instead of raw `<textarea>`
- `app/[locale]/admin/loading.tsx` — New skeleton loading state
- `app/[locale]/admin/blogs/loading.tsx` — New skeleton loading state
- `app/[locale]/admin/propfirms/loading.tsx` — New skeleton loading state
- `app/[locale]/admin/coupons/loading.tsx` — New skeleton loading state
- `app/[locale]/admin/reviews/loading.tsx` — New skeleton loading state

### Definition of Done
- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `npx eslint app/[locale]/admin/` → 0 new errors (pre-existing warnings OK)
- [ ] All 13 admin pages load without console errors
- [ ] Sidebar shows 8 navigation items including Reviews
- [ ] Admin pages are not indexable by search engines (`robots: noindex, nofollow`)

### Must Have
- All raw HTML form elements replaced with V2 design system equivalents
- Reviews page accessible from sidebar navigation
- `noindex` meta properly set via App Router metadata API
- Loading states for all admin route segments

### Must NOT Have (Guardrails)
- Do NOT refactor server actions or business logic — they work correctly
- Do NOT change the authorization flow — it's properly implemented
- Do NOT add new dependencies — use existing `Skeleton` from `@/components/ui/skeleton`
- Do NOT modify the V2 design system components themselves
- Do NOT add `console.log` — project ESLint rule blocks it
- Do NOT use `as any` or `@ts-ignore` — project ESLint rules block them
- Do NOT add light mode styles — project is dark-only

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (Vitest)
- **Automated tests**: Tests-after (unit tests don't exist for admin pages currently)
- **Framework**: Vitest
- **Primary verification**: TypeScript typecheck + ESLint + build

### QA Policy
Every task includes agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **TypeScript**: Use Bash — `npx tsc --noEmit`, verify 0 errors
- **ESLint**: Use Bash — `npx eslint` on changed files, verify 0 new errors
- **Build**: Use Bash — `npm run build`, verify success
- **Structural**: Use Bash — `grep` to verify patterns removed/added

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — critical fixes):
├── Task 1: Fix next/head deprecation in admin-client-layout.tsx [quick]
├── Task 2: Add Reviews link to sidebar navigation [quick]
└── Task 3: Remove double-wrapping in reviews/page.tsx [quick]

Wave 2 (After Wave 1 — design system consistency):
├── Task 4: Replace raw textarea with TextareaV2 in propfirm edit [quick]
├── Task 5: Replace raw button with ButtonV2 in error.tsx [quick]
└── Task 6: Verify v2-* Tailwind tokens in reviews page [quick]

Wave 3 (After Wave 2 — polish):
├── Task 7: Add loading.tsx to 5 admin pages [quick]
└── Task 8: Final verification — typecheck + lint + build [quick]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: Task 1 → Task 4 → Task 7 → Task 8 → F1-F4 → user okay
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 3 (Waves 1 & 2)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1 | — | 4, F1-F4 | 1 |
| 2 | — | F1-F4 | 1 |
| 3 | — | F1-F4 | 1 |
| 4 | — | F1-F4 | 2 |
| 5 | — | F1-F4 | 2 |
| 6 | — | F1-F4 | 2 |
| 7 | — | 8, F1-F4 | 3 |
| 8 | 7 | F1-F4 | 3 |
| F1-F4 | 1-7 | user okay | FINAL |

### Agent Dispatch Summary

- **Wave 1**: **3** — T1-T3 → `quick`
- **Wave 2**: **3** — T4-T6 → `quick`
- **Wave 3**: **2** — T7-T8 → `quick`
- **FINAL**: **4** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [ ] 1. **Fix deprecated `next/head` in admin-client-layout.tsx**

  **What to do**:
  - Remove `import Head from "next/head"` from `app/[locale]/admin/admin-client-layout.tsx`
  - Remove the `<Head><meta name="robots" content="noindex,nofollow" /></Head>` block
  - Add `export const metadata: Metadata = { robots: { index: false, follow: false } }` to `app/[locale]/admin/layout.tsx` (the server component)
  - Add `import type { Metadata } from "next"` to the layout import

  **Must NOT do**:
  - Do NOT add a `<meta>` tag in the client component — it won't work in App Router
  - Do NOT remove any other imports or logic from admin-client-layout.tsx

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single-file metadata pattern fix
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `next-best-practices`: Task is too trivial to justify skill loading

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: F1-F4
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `app/[locale]/admin/layout.tsx` — Server component where metadata export belongs
  - `app/[locale]/admin/admin-client-layout.tsx:1-40` — Contains deprecated `Head` usage

  **External References**:
  - Next.js App Router Metadata API: https://nextjs.org/docs/app/building-your-application/optimizing/metadata

  **Acceptance Criteria**:
  - [ ] `admin-client-layout.tsx` has zero references to `next/head` or `Head`
  - [ ] `layout.tsx` exports `metadata` with `robots: { index: false, follow: false }`
  - [ ] `npx tsc --noEmit` passes with 0 errors

  **QA Scenarios**:

  ```
  Scenario: next/head import removed
    Tool: Bash (grep)
    Preconditions: Files exist
    Steps:
      1. grep -r "next/head" app/[locale]/admin/admin-client-layout.tsx
    Expected Result: No matches found (exit code 1)
    Failure Indicators: Any match found
    Evidence: .sisyphus/evidence/task-1-no-next-head.txt

  Scenario: metadata export present in layout
    Tool: Bash (grep)
    Preconditions: layout.tsx exists
    Steps:
      1. grep "robots" app/[locale]/admin/layout.tsx
    Expected Result: Match found with "index: false, follow: false"
    Failure Indicators: No match or different values
    Evidence: .sisyphus/evidence/task-1-metadata-export.txt
  ```

  **Commit**: YES (groups with Task 1 only)
  - Message: `fix(admin): replace deprecated next/head with App Router metadata export`
  - Files: `app/[locale]/admin/layout.tsx`, `app/[locale]/admin/admin-client-layout.tsx`
  - Pre-commit: `npx tsc --noEmit`

- [ ] 2. **Add Reviews link to sidebar navigation**

  **What to do**:
  - Open `app/[locale]/admin/components/sidebar-nav.tsx`
  - Add `Shield` to the lucide-react import
  - Add a new item to the `routes` array after the "Blog" entry:
    ```
    {
      href: `/${locale}/admin/reviews`,
      label: "Reviews",
      icon: <Shield className="size-4" />,
    }
    ```

  **Must NOT do**:
  - Do NOT reorder existing navigation items
  - Do NOT change any existing navigation hrefs or labels

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single array item addition
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: F1-F4
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `app/[locale]/admin/components/sidebar-nav.tsx:10-46` — Existing routes array structure to match
  - `app/[locale]/admin/reviews/page.tsx` — Confirms route exists and is functional

  **Acceptance Criteria**:
  - [ ] `sidebar-nav.tsx` imports `Shield` from `lucide-react`
  - [ ] `routes` array has exactly 8 items
  - [ ] Reviews item has `href: '/${locale}/admin/reviews'`

  **QA Scenarios**:

  ```
  Scenario: Reviews link present in sidebar
    Tool: Bash (grep)
    Preconditions: sidebar-nav.tsx exists
    Steps:
      1. grep "admin/reviews" app/[locale]/admin/components/sidebar-nav.tsx
    Expected Result: Match found with correct href
    Failure Indicators: No match found
    Evidence: .sisyphus/evidence/task-2-reviews-link.txt

  Scenario: 8 navigation items total
    Tool: Bash (grep)
    Preconditions: sidebar-nav.tsx exists
    Steps:
      1. grep -c "href:" app/[locale]/admin/components/sidebar-nav.tsx
    Expected Result: Count is 8
    Failure Indicators: Count is not 8
    Evidence: .sisyphus/evidence/task-2-nav-count.txt
  ```

  **Commit**: YES (standalone)
  - Message: `fix(admin): add reviews page to sidebar navigation`
  - Files: `app/[locale]/admin/components/sidebar-nav.tsx`
  - Pre-commit: `npx tsc --noEmit`

- [ ] 3. **Remove double-wrapping in reviews/page.tsx**

  **What to do**:
  - Open `app/[locale]/admin/reviews/page.tsx`
  - Replace the outer `<div className="min-h-screen bg-background p-6 text-foreground">` and its inner `<div className="max-w-6xl mx-auto">` with a single `<div className="max-w-6xl mx-auto space-y-6">`
  - Remove the corresponding extra closing `</div>` at the end of the return statement
  - The admin layout already provides `min-h-screen`, `bg-background`, and `p-6` (via the `<main>` wrapper)

  **Must NOT do**:
  - Do NOT change any internal content structure — only remove the outer wrapper
  - Do NOT remove the `max-w-6xl` container — it's needed for layout width

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Structural JSX cleanup
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: F1-F4
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `app/[locale]/admin/admin-client-layout.tsx:50` — Layout provides `<main className="flex-1 overflow-y-auto p-6">`
  - `app/[locale]/admin/coupons/page.tsx:265-374` — Example of correct admin page wrapping (no `min-h-screen`)

  **Acceptance Criteria**:
  - [ ] No `min-h-screen` class in `reviews/page.tsx`
  - [ ] No `bg-background` class in the outer wrapper of `reviews/page.tsx`
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios**:

  ```
  Scenario: No double-wrapping classes
    Tool: Bash (grep)
    Preconditions: reviews/page.tsx exists
    Steps:
      1. grep "min-h-screen" app/[locale]/admin/reviews/page.tsx
    Expected Result: No matches (exit code 1)
    Failure Indicators: Any match found
    Evidence: .sisyphus/evidence/task-3-no-double-wrap.txt
  ```

  **Commit**: YES (standalone)
  - Message: `fix(admin): resolve reviews page layout double-wrapping`
  - Files: `app/[locale]/admin/reviews/page.tsx`
  - Pre-commit: `npx tsc --noEmit`

- [ ] 4. **Replace raw `<textarea>` with TextareaV2 in prop firm edit**

  **What to do**:
  - Open `app/[locale]/admin/propfirms/[id]/page.tsx`
  - Update import to include `TextareaV2`: `import { ButtonV2, InputV2, TextareaV2 } from "@/components/ui/v2"`
  - Replace the native `<textarea>` on approximately line 316 (description field) with `<TextareaV2>` — transfer `id`, `name`, `rows`, `defaultValue` props, remove `className` with raw Tailwind
  - Replace the native `<textarea>` on approximately line 423 (review content field) with `<TextareaV2>` — transfer `name`, `defaultValue`, `placeholder`, `rows` props, remove `className`

  **Must NOT do**:
  - Do NOT change any form logic or server actions
  - Do NOT modify the native `<select>` elements (they don't have a V2 equivalent yet)
  - Do NOT add new form fields

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Direct component swap with existing V2 component
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: F1-F4
  - **Blocked By**: None

  **References**:

  **API/Type References**:
  - `components/ui/v2/textarea-v2.tsx` — `TextareaV2` component, extends `React.TextareaHTMLAttributes<HTMLTextAreaElement>`

  **Pattern References**:
  - `app/[locale]/admin/blogs/components/blog-form.tsx:150-166` — Example of TextareaV2 usage in admin (excerpt field)

  **Acceptance Criteria**:
  - [ ] Zero `<textarea` elements in `propfirms/[id]/page.tsx` (grep to verify)
  - [ ] Two `<TextareaV2` elements present
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios**:

  ```
  Scenario: No raw textarea elements
    Tool: Bash (grep)
    Preconditions: propfirms/[id]/page.tsx exists
    Steps:
      1. grep "<textarea" "app/[locale]/admin/propfirms/[id]/page.tsx"
    Expected Result: No matches (exit code 1)
    Failure Indicators: Any match found
    Evidence: .sisyphus/evidence/task-4-no-raw-textarea.txt

  Scenario: TextareaV2 imported and used
    Tool: Bash (grep)
    Preconditions: File modified
    Steps:
      1. grep "TextareaV2" "app/[locale]/admin/propfirms/[id]/page.tsx"
    Expected Result: 3 matches (1 import + 2 usages)
    Failure Indicators: Fewer than 3 matches
    Evidence: .sisyphus/evidence/task-4-textareav2-usage.txt
  ```

  **Commit**: YES (groups with Task 5)
  - Message: `fix(admin): replace raw HTML elements with V2 design system components`
  - Files: `app/[locale]/admin/propfirms/[id]/page.tsx`, `app/[locale]/admin/error.tsx`
  - Pre-commit: `npx tsc --noEmit`

- [ ] 5. **Replace raw `<button>` with ButtonV2 in error.tsx**

  **What to do**:
  - Open `app/[locale]/admin/error.tsx`
  - Add `import { ButtonV2 } from '@/components/ui/v2'`
  - Replace first `<button className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground" onClick={reset} type="button">Retry</button>` with `<ButtonV2 onClick={reset}>Retry</ButtonV2>`
  - Replace second `<button className="rounded-md border px-3 py-2 text-sm" onClick={() => window.location.assign('/dashboard')} type="button">Go to dashboard</button>` with `<ButtonV2 variant="outline" onClick={() => window.location.assign('/dashboard')}>Go to dashboard</ButtonV2>`

  **Must NOT do**:
  - Do NOT change the error boundary logic
  - Do NOT remove the `console.error` call (it's correct for error boundaries)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Direct component swap
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6)
  - **Blocks**: F1-F4
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `app/[locale]/admin/error.tsx` — Current file with raw buttons

  **API/Type References**:
  - `components/ui/v2/button-v2.tsx` — ButtonV2 component with variant prop

  **Acceptance Criteria**:
  - [ ] Zero `<button` elements in `error.tsx`
  - [ ] Two `<ButtonV2` elements with appropriate variants
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios**:

  ```
  Scenario: No raw button elements
    Tool: Bash (grep)
    Preconditions: error.tsx exists
    Steps:
      1. grep "<button" app/[locale]/admin/error.tsx
    Expected Result: No matches (exit code 1)
    Failure Indicators: Any match found
    Evidence: .sisyphus/evidence/task-5-no-raw-button.txt
  ```

  **Commit**: YES (groups with Task 4)
  - Message: `fix(admin): replace raw HTML elements with V2 design system components`
  - Files: `app/[locale]/admin/propfirms/[id]/page.tsx`, `app/[locale]/admin/error.tsx`
  - Pre-commit: `npx tsc --noEmit`

- [ ] 6. **Verify v2-* Tailwind tokens in reviews page**

  **What to do**:
  - Check if Tailwind tokens like `v2-error`, `v2-accent`, `v2-accent-foreground`, `v2-success` used in `reviews/page.tsx` are defined in the Tailwind config or CSS variables
  - If they are defined → mark task as complete, no changes needed
  - If they are NOT defined → replace with semantic equivalents (`text-destructive`, `bg-primary`, etc.)

  **Must NOT do**:
  - Do NOT blindly replace tokens without verifying they're undefined
  - Do NOT change the layout structure of the reviews page

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification task with potential minor fix
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: F1-F4
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `app/[locale]/admin/reviews/page.tsx:59-63,73-75,190-191` — Uses `v2-error`, `v2-accent`, `v2-success` tokens
  - `tailwind.config.ts` or `app/globals.css` — Where tokens should be defined
  - `components/ui/v2/` — V2 design system components that define these tokens

  **Acceptance Criteria**:
  - [ ] All `v2-*` class names in reviews/page.tsx resolve to valid Tailwind utilities or CSS variables
  - [ ] No broken styling when rendered

  **QA Scenarios**:

  ```
  Scenario: v2 tokens are defined
    Tool: Bash (grep)
    Preconditions: tailwind config and CSS files exist
    Steps:
      1. Search for v2-error, v2-accent, v2-success in tailwind config and CSS
    Expected Result: Tokens found in config/CSS definitions
    Failure Indicators: Tokens not found anywhere in config
    Evidence: .sisyphus/evidence/task-6-v2-tokens.txt
  ```

  **Commit**: YES (only if changes needed)
  - Message: `fix(admin): replace undefined v2 Tailwind tokens in reviews page`
  - Files: `app/[locale]/admin/reviews/page.tsx` (only if changes needed)
  - Pre-commit: `npx tsc --noEmit`

- [ ] 7. **Add loading.tsx skeleton states to admin pages**

  **What to do**:
  - Create `loading.tsx` files with Skeleton components for each admin route segment:
    - `app/[locale]/admin/loading.tsx` — Dashboard loading (3 stat cards + chart area)
    - `app/[locale]/admin/blogs/loading.tsx` — Blog list loading (header + search + table)
    - `app/[locale]/admin/propfirms/loading.tsx` — Prop firms loading (stats + table)
    - `app/[locale]/admin/coupons/loading.tsx` — Coupons loading (stats + form + cards)
    - `app/[locale]/admin/reviews/loading.tsx` — Reviews loading (header + tabs + cards)
  - Use existing `Skeleton` from `@/components/ui/skeleton`
  - Match each page's approximate layout structure

  **Must NOT do**:
  - Do NOT create loading.tsx for pages that already have one (`welcome-email/loading.tsx`)
  - Do NOT use `Suspense` boundaries — Next.js App Router handles this automatically with `loading.tsx`
  - Do NOT add new Skeleton component variants — use existing `Skeleton` component

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Repetitive file creation with existing components
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 8)
  - **Blocks**: 8, F1-F4
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `app/[locale]/admin/welcome-email/loading.tsx` — Existing loading.tsx to match pattern

  **API/Type References**:
  - `components/ui/skeleton.tsx` — `Skeleton` component usage: `<Skeleton className="h-8 w-48" />`

  **Acceptance Criteria**:
  - [ ] 5 new `loading.tsx` files created
  - [ ] Each imports `Skeleton` from `@/components/ui/skeleton`
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios**:

  ```
  Scenario: All loading files exist
    Tool: Bash (ls)
    Preconditions: Files created
    Steps:
      1. ls app/[locale]/admin/loading.tsx app/[locale]/admin/blogs/loading.tsx app/[locale]/admin/propfirms/loading.tsx app/[locale]/admin/coupons/loading.tsx app/[locale]/admin/reviews/loading.tsx
    Expected Result: All 5 files listed without errors
    Failure Indicators: Any file not found
    Evidence: .sisyphus/evidence/task-7-loading-files.txt
  ```

  **Commit**: YES (standalone)
  - Message: `feat(admin): add skeleton loading states for admin pages`
  - Files: 5 new `loading.tsx` files
  - Pre-commit: `npx tsc --noEmit`

- [ ] 8. **Final verification — typecheck + lint**

  **What to do**:
  - Run `npx tsc --noEmit` — verify 0 errors
  - Run `npx eslint app/[locale]/admin/` — verify 0 new errors (5 pre-existing complexity warnings OK)
  - If any errors found → fix and re-verify

  **Must NOT do**:
  - Do NOT skip any verification step
  - Do NOT suppress errors with `@ts-ignore` or eslint-disable

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification-only task
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (after all other tasks)
  - **Blocks**: F1-F4
  - **Blocked By**: 1, 2, 3, 4, 5, 6, 7

  **References**: None needed

  **Acceptance Criteria**:
  - [ ] `npx tsc --noEmit` exits with code 0
  - [ ] `npx eslint app/[locale]/admin/` shows 0 errors (warnings OK)

  **QA Scenarios**:

  ```
  Scenario: TypeScript passes
    Tool: Bash
    Steps:
      1. npx tsc --noEmit 2>&1
    Expected Result: Exit code 0, no error output
    Evidence: .sisyphus/evidence/task-8-typecheck.txt

  Scenario: ESLint passes
    Tool: Bash
    Steps:
      1. npx eslint app/[locale]/admin/ 2>&1
    Expected Result: 0 errors (5 pre-existing warnings OK)
    Evidence: .sisyphus/evidence/task-8-lint.txt
  ```

  **Commit**: NO (verification only)

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npx tsc --noEmit` + `npx eslint app/[locale]/admin/`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Commit 1**: `fix(admin): replace deprecated next/head with App Router metadata export`
  - `app/[locale]/admin/layout.tsx`, `app/[locale]/admin/admin-client-layout.tsx`
  - Pre-commit: `npx tsc --noEmit`

- **Commit 2**: `fix(admin): add reviews page to sidebar navigation`
  - `app/[locale]/admin/components/sidebar-nav.tsx`
  - Pre-commit: `npx tsc --noEmit`

- **Commit 3**: `fix(admin): resolve reviews page layout double-wrapping`
  - `app/[locale]/admin/reviews/page.tsx`
  - Pre-commit: `npx tsc --noEmit`

- **Commit 4**: `fix(admin): replace raw HTML elements with V2 design system components`
  - `app/[locale]/admin/propfirms/[id]/page.tsx`, `app/[locale]/admin/error.tsx`
  - Pre-commit: `npx tsc --noEmit`

- **Commit 5**: `feat(admin): add skeleton loading states for admin pages`
  - `app/[locale]/admin/loading.tsx`, `app/[locale]/admin/blogs/loading.tsx`, `app/[locale]/admin/propfirms/loading.tsx`, `app/[locale]/admin/coupons/loading.tsx`, `app/[locale]/admin/reviews/loading.tsx`
  - Pre-commit: `npx tsc --noEmit`

---

## Success Criteria

### Verification Commands
```bash
npx tsc --noEmit                              # Expected: 0 errors
npx eslint app/[locale]/admin/                # Expected: 0 new errors (5 pre-existing warnings OK)
```

### Final Checklist
- [ ] All "Must Have" present (6 items)
- [ ] All "Must NOT Have" absent (7 items)
- [ ] `robots: noindex, nofollow` meta renders on admin pages
- [ ] Sidebar shows 8 items: Prop Firms, Coupons, Blog, Reviews, Newsletter Builder, Weekly Recap, Welcome Email, Send Email
- [ ] Reviews page renders without double padding
- [ ] Prop firm form uses TextareaV2 (not raw textarea)
- [ ] Error boundary uses ButtonV2 (not raw button)
- [ ] All admin routes have loading.tsx skeleton states
