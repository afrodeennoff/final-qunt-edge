# Sidebar shadcn sidebar-07 Refactor Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install shadcn sidebar-07 block, fix all 10 sidebar audit violations (active/hover contrast, SSR safety, cookie security, code quality), and update all sidebar surfaces (dashboard, landing, admin, teams, mobile) to use the new shadcn component.

**Architecture:** Replace the current custom `components/ui/sidebar.tsx` (Radix + shadcn primitives) with the official shadcn sidebar block (sidebar-07), which uses `collapsible="icon"` for icon-collapse mode. All surfaces (`dashboard-sidebar`, `landing-sidebar`, `admin sidebar-nav`, `teams-sidebar`, `mobile-bottom-nav`) update their nav item shapes to match the new sidebar's API. CSS variables for `--sidebar-*` tokens are extended to cover the full dark-shell design system.

**Tech Stack:** Next.js 15, shadcn/ui (new-york style), Radix UI sidebar primitives, Tailwind CSS, Vitest, React Testing Library

---

## Scope Boundaries

### IN
- shadcn `sidebar` component + `sidebar-07` block (team-switcher, nav-main, nav-projects, nav-user pattern)
- All 10 audit violations fixed across 7 files
- All 5 sidebar surfaces updated (dashboard, landing, admin, teams, mobile-bottom-nav)
- New unit tests for `use-mobile.tsx` SSR safety
- CSS variables for `--sidebar-*` design tokens

### OUT
- No changes to `proxy.ts`, auth boundaries, or route classification
- No changes to data-provider, sync contexts, or trade import logic
- No changes to `lib/sidebar-state.ts`, `lib/constants/sidebar.ts`, or cookie parsing
- No changes to `sidebar-layout-shell.tsx` structure
- No changes to `use-sidebar-nav.ts` (already clean)

---

## Test Decision

- **Infrastructure exists**: YES (Vitest + React Testing Library + Playwright smoke)
- **Automated tests**: Existing tests cover sidebar state, mobile detection, cookie ops, navigation utils — all remain valid after refactor
- **New tests added**: Unit tests for `use-mobile.tsx` SSR hydration safety
- **QA method**: Agent-executed QA via Playwright after each wave

---

## File Impact Map

| File | Action | Responsibility |
|------|--------|----------------|
| `components/ui/sidebar.tsx` | **REPLACE** | Core shadcn sidebar component |
| `components/ui/sidebar-07.tsx` | **CREATE** | sidebar-07 block composition (team-switcher, nav, user) |
| `components/ui/unified-sidebar.tsx` | **MODIFY** | Remove stale comment, clean up |
| `components/ui/sidebar-primitives/sidebar-nav-group.tsx` | **MODIFY** | Fix type cast, memoize classes |
| `components/ui/sidebar-primitives/sidebar-logo-header.tsx` | **MODIFY** | Remove unintended `data-[state=open]` |
| `components/sidebar/dashboard-sidebar.tsx` | **MODIFY** | Update to new sidebar API, fix duplicate icon |
| `components/sidebar/landing-sidebar.tsx` | **MODIFY** | Update to new sidebar API |
| `app/[locale]/admin/components/sidebar-nav.tsx` | **MODIFY** | Update to new sidebar API |
| `app/[locale]/teams/components/teams-sidebar.tsx` | **MODIFY** | Use existing `stripLocalePrefix` |
| `hooks/use-mobile.tsx` | **MODIFY** | SSR-safe initialization |
| `hooks/use-navigation-loading.tsx` | **MODIFY** | Fix module-scope shared state |
| `components/mobile-bottom-nav.tsx` | **MODIFY** | Minor: verify `useIsMobile` hook usage |
| `lib/sidebar-tokens.ts` | **CREATE** | Extend CSS variables for sidebar design tokens |
| `components/sidebar/__tests__/sidebar.test.tsx` | **MODIFY** | Add SSR hydration test for mobile |
| `components/ui/sidebar-primitives/__tests__/use-sidebar-nav.test.ts` | **NO CHANGE** | Already covering nav logic |

---

## Execution Waves

```
Wave 1 (Foundation — reads + research, max parallel):
├── T1: Read all current sidebar files fully (5 agents in parallel)
├── T2: Install shadcn sidebar + sidebar-07 block
└── T3: Create lib/sidebar-tokens.ts (CSS variable extension)

Wave 2 (Core fixes — shadcn integration + style fixes, max parallel):
├── T4: REPLACE components/ui/sidebar.tsx (shadcn v2, fix hover/active contrast)
├── T5: CREATE sidebar-07 block composition (components/ui/sidebar-07.tsx)
├── T6: Fix sidebar primitives (logo-header data-[state=open], nav-group type cast + memo)
└── T7: Fix hooks (use-mobile SSR, use-navigation-loading shared state)

Wave 3 (Surface updates — all 5 sidebar surfaces, max parallel):
├── T8: Update dashboard-sidebar.tsx (new API + duplicate icon)
├── T9: Update landing-sidebar.tsx + admin sidebar-nav.tsx + teams-sidebar.tsx
├── T10: Clean up unified-sidebar.tsx (stale comment)
└── T11: Run full test suite + Playwright smoke + typecheck

Critical Path: T2 (install) → T4 (sidebar replace) → T5 (block compose) → T8 (dashboard) → T11 (verify)
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 5 (Wave 1) + 4 (Wave 2) + 4 (Wave 3)
```

---

## TODOs

---

### Task 1: Read all current sidebar files fully

> 5 agents read in parallel — no modifications, pure research.

**Files (read every line):**
- `components/ui/sidebar.tsx` — full 797 lines
- `components/ui/unified-sidebar.tsx` — full 213 lines
- `components/ui/sidebar-primitives/sidebar-nav-group.tsx` — full 250 lines
- `components/sidebar/dashboard-sidebar.tsx` — full 168 lines
- `hooks/use-mobile.tsx` — full 20 lines

**Parallelization:**
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 1 (with T2, T3)
- **Blocks**: T4, T5, T6, T7 (all subsequent tasks)
- **Blocked By**: None

**QA Scenarios:**

```
Scenario: All files readable and contain expected exports
  Tool: Bash
  Preconditions: Repo is clean
  Steps:
    1. wc -l components/ui/sidebar.tsx components/ui/unified-sidebar.tsx components/ui/sidebar-primitives/sidebar-nav-group.tsx components/sidebar/dashboard-sidebar.tsx hooks/use-mobile.tsx
    2. grep -c "export" components/ui/sidebar.tsx
  Expected Result: Files exist with expected line counts; sidebar exports SidebarProvider, Sidebar, SidebarInset, SidebarTrigger
  Evidence: .sisyphus/evidence/task-1-file-read.txt
```

---

### Task 2: Install shadcn sidebar component + sidebar-07 block

**Files:**
- Create: `components/ui/sidebar.tsx` (REPLACED by shadcn)
- Modify: `components.json` (registry entry added)
- Modify: `app/globals.css` (sidebar CSS variables added)
- Modify: `tailwind.config.ts` (sidebar section added)

**Parallelization:**
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 1 (with T1, T3)
- **Blocks**: T4, T5
- **Blocked By**: None

- [ ] **Step 1: Add shadcn sidebar component**

Run:
```bash
cd /Users/timon/Downloads/qunt-edge && npx shadcn@latest add sidebar --yes
```
Expected: Component files created in `components/ui/` with Radix sidebar primitives

- [ ] **Step 2: Add shadcn sidebar-07 block**

Run:
```bash
npx shadcn@latest add sidebar-07 --yes
```
Expected: Block composition created — team-switcher, nav-main, nav-projects, nav-user pattern

- [ ] **Step 3: Verify CSS variables in globals.css**

Read `app/globals.css` and check for `--sidebar-*` CSS variables (shadcn adds these automatically). If missing, add:

```css
@theme {
  /* Sidebar design tokens */
  --sidebar-background: oklch(0.145 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(0.269 0 0);
  --sidebar-ring: oklch(0.488 0.243 264.376);
}
```

- [ ] **Step 4: Check tailwind.config.ts**

Read `tailwind.config.ts` and verify `--sidebar-*` CSS variables are NOT duplicated in the config. shadcn now uses `@theme` in CSS (Tailwind v4). Remove any conflicting sidebar config from `tailwind.config.ts`.

- [ ] **Step 5: Typecheck**

Run:
```bash
npm run typecheck 2>&1 | head -30
```
Expected: No new TypeScript errors from shadcn sidebar installation

- [ ] **Step 6: Commit**

```bash
git add components/ui/sidebar.tsx app/globals.css tailwind.config.ts components.json
git commit -m "feat(sidebar): install shadcn sidebar + sidebar-07 block"
```
Files: `components/ui/sidebar.tsx`, `app/globals.css`, `tailwind.config.ts`, `components.json`

**QA Scenarios:**

```
Scenario: shadcn sidebar installed correctly
  Tool: Bash
  Preconditions: Clean git state
  Steps:
    1. ls components/ui/sidebar.tsx
    2. git diff --name-only HEAD~1
  Expected Result: sidebar.tsx exists; diff shows new sidebar component files
  Evidence: .sisyphus/evidence/task-2-install.txt

Scenario: CSS variables present in globals.css
  Tool: Bash
  Preconditions: globals.css updated
  Steps:
    1. grep -c "sidebar-background\|sidebar-foreground" app/globals.css
  Expected Result: Count >= 2
  Evidence: .sisyphus/evidence/task-2-css-vars.txt
```

---

### Task 3: Create lib/sidebar-tokens.ts — extend CSS design tokens

**Files:**
- Create: `lib/sidebar-tokens.ts`

**Parallelization:**
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 1 (with T1, T2)
- **Blocks**: T4, T5 (CSS tokens needed for dark-shell styling)
- **Blocked By**: None

- [ ] **Step 1: Create sidebar-tokens.ts**

Create `lib/sidebar-tokens.ts`:

```typescript
/**
 * Sidebar design token constants for type-safe access.
 * These mirror the CSS variables in app/globals.css.
 * Use these for dynamic styling or programmatic access to sidebar tokens.
 */

export const SIDEBAR_TOKENS = {
  // Backgrounds
  background: 'var(--sidebar-background)',
  primary: 'var(--sidebar-primary)',
  accent: 'var(--sidebar-accent)',
  destructive: 'var(--sidebar-destructive)',

  // Foregrounds
  foreground: 'var(--sidebar-foreground)',
  primaryForeground: 'var(--sidebar-primary-foreground)',
  accentForeground: 'var(--sidebar-accent-foreground)',

  // Structural
  border: 'var(--sidebar-border)',
  ring: 'var(--sidebar-ring)',
  input: 'var(--sidebar-input)',
} as const

export type SidebarToken = (typeof SIDEBAR_TOKENS)[keyof typeof SIDEBAR_TOKENS]

/**
 * Hover/active state token maps for sidebar navigation items.
 * Per AGENTS.md: "Active/hover sidebar menu text must stay on sidebar-foreground.
 * sidebar-primary/sidebar-accent only for backgrounds, borders, icon emphasis."
 */
export const SIDEBAR_NAV_TOKENS = {
  defaultText: 'text-sidebar-foreground',
  hoverText: 'hover:text-sidebar-foreground',
  activeText: 'data-[active=true]:text-sidebar-foreground',
  defaultIcon: 'text-sidebar-foreground/60',
  activeIcon: 'text-sidebar-primary',
  activeBg: 'bg-sidebar-primary/14',
  activeBorder: 'ring-1 ring-sidebar-primary/22',
} as const

/**
 * Mobile breakpoint used by use-mobile hook.
 * Mirrors MOBILE_BREAKPOINT from lib/config/breakpoints.
 */
export const SIDEBAR_MOBILE_BREAKPOINT = 768

/**
 * Cookie name and max-age for sidebar state persistence.
 */
export const SIDEBAR_COOKIE = {
  name: 'sidebar:state',
  maxAge: 60 * 60 * 24 * 7, // 7 days
  secure: true, // Must match cookie write in sidebar.tsx
} as const
```

- [ ] **Step 2: Typecheck**

Run:
```bash
npm run typecheck 2>&1 | grep -i "sidebar-tokens"
```
Expected: No errors related to sidebar-tokens.ts

- [ ] **Step 3: Commit**

```bash
git add lib/sidebar-tokens.ts
git commit -m "feat(sidebar): add design token constants"
```
Files: `lib/sidebar-tokens.ts`

**QA Scenarios:**

```
Scenario: sidebar-tokens.ts exports all expected constants
  Tool: Bash
  Preconditions: File created
  Steps:
    1. grep -E "SIDEBAR_TOKENS|SIDEBAR_NAV_TOKENS|SIDEBAR_COOKIE" lib/sidebar-tokens.ts
    2. grep "secure.*true" lib/sidebar-tokens.ts
  Expected Result: All constants present; secure flag is true
  Evidence: .sisyphus/evidence/task-3-tokens.txt
```

---

### Task 4: REPLACE components/ui/sidebar.tsx (shadcn v2 + fix hover/active contrast)

> **This is the core replacement task.** The new shadcn sidebar component replaces the old custom one. All exported primitives (`Sidebar`, `SidebarProvider`, `SidebarTrigger`, `SidebarInset`, `SidebarHeader`, `SidebarFooter`, `SidebarContent`, `SidebarGroup`, `SidebarGroupContent`, `SidebarGroupLabel`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarMenuBadge`, `SidebarMenuAction`, `SidebarMenuSub`, `SidebarMenuSubButton`, `SidebarMenuSubItem`) are preserved from the shadcn install. Custom CSS overrides are added for the dark-shell aesthetic.

**Files:**
- Modify: `components/ui/sidebar.tsx` (full replace)

**Parallelization:**
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 2 (with T5, T6, T7)
- **Blocks**: T8, T9, T10, T11
- **Blocked By**: T2 (shadcn install)

**IMPORTANT — Style Fix to apply during replacement:**
- `SidebarMenuSubButton` variant (line 759 original): `hover:text-sidebar-foreground` — NOT `hover:text-sidebar-accent-foreground`
- Cookie write (line 105 original): Add `; Secure` flag

- [ ] **Step 1: Read the new shadcn sidebar.tsx**

Read the freshly installed `components/ui/sidebar.tsx` from shadcn. Identify:
1. The `sidebarMenuButtonVariants` or equivalent variant function
2. The `SidebarMenuSubButton` className
3. The cookie write line (should be around `document.cookie = 'sidebar:state'`)
4. Which shadcn export names match the old component's exports

- [ ] **Step 2: Add dark-shell CSS overrides**

Find the file and append a `<style>` block or extend the component with additional class variants. The key changes:

```tsx
// In sidebar.tsx — find the sidebarMenuButtonVariants cva call
// and add a new "sub" variant:

const sidebarSubButtonVariants = cva(
  'group/data-[state=open]:text-sidebar-foreground flex w-full items-center gap-2 truncate text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent/50 hover:text-sidebar-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-foreground',
  {
    variants: {
      size: {
        default: 'h-8 px-2 text-[13px]',
        sm: 'h-7 px-2 text-xs',
        lg: 'h-9 px-3 text-sm',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)
```

- [ ] **Step 3: Fix cookie write to include Secure flag**

Find the cookie write line in the new sidebar.tsx (should be in `useSidebarStore` or similar). Add `; Secure` to the cookie string:

```typescript
// BEFORE (line ~105):
document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}`

// AFTER:
document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; Secure; SameSite=Lax`
```

- [ ] **Step 4: Verify all exports are preserved**

Check that the new `sidebar.tsx` exports everything the consumers need:
```bash
grep "^export" components/ui/sidebar.tsx | sort
```

Expected exports (must match old component): `Sidebar`, `SidebarProvider`, `SidebarTrigger`, `SidebarInset`, `SidebarHeader`, `SidebarFooter`, `SidebarContent`, `SidebarGroup`, `SidebarGroupContent`, `SidebarGroupLabel`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarMenuBadge`, `SidebarMenuAction`, `SidebarMenuSub`, `SidebarMenuSubButton`, `SidebarMenuSubItem`, `useSidebar`, `SidebarProvider', 'SidebarRail', `cn`

If any are missing, add them as re-exports at the bottom of the file.

- [ ] **Step 5: Typecheck**

Run:
```bash
npm run typecheck 2>&1 | head -50
```
Expected: No TypeScript errors; all consumers of sidebar.tsx compile

- [ ] **Step 6: Commit**

```bash
git add components/ui/sidebar.tsx
git commit -m "refactor(sidebar): replace with shadcn v2 + fix hover contrast + add Secure cookie flag"
```
Files: `components/ui/sidebar.tsx`

**QA Scenarios:**

```
Scenario: SidebarMenuSubButton uses sidebar-foreground on hover (not accent)
  Tool: Bash
  Preconditions: sidebar.tsx replaced
  Steps:
    1. grep -n "SidebarMenuSubButton\|sidebarSubButton" components/ui/sidebar.tsx
    2. grep "hover:text-sidebar-foreground" components/ui/sidebar.tsx
    3. grep "hover:text-sidebar-accent-foreground" components/ui/sidebar.tsx | grep -v "SidebarMenuAction\|SidebarGroupAction"
  Expected Result: SubButton uses sidebar-foreground hover; no accent-foreground on sub-buttons
  Evidence: .sisyphus/evidence/task-4-subbutton-hover.txt

Scenario: Cookie has Secure flag
  Tool: Bash
  Preconditions: sidebar.tsx updated
  Steps:
    1. grep "; Secure" components/ui/sidebar.tsx
  Expected Result: Found in cookie write
  Evidence: .sisyphus/evidence/task-4-cookie-secure.txt

Scenario: All exports preserved
  Tool: Bash
  Preconditions: sidebar.tsx replaced
  Steps:
    1. grep "^export" components/ui/sidebar.tsx | wc -l
    2. grep "SidebarProvider\|useSidebar" components/ui/sidebar.tsx | grep -c "^export"
  Expected Result: All 20+ expected exports present
  Evidence: .sisyphus/evidence/task-4-exports.txt
```

---

### Task 5: CREATE sidebar-07 block composition

**Files:**
- Create: `components/ui/sidebar-07.tsx` (or the file created by `shadcn add sidebar-07`)

**Parallelization:**
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 2 (with T4, T6, T7)
- **Blocks**: T8, T9, T11
- **Blocked By**: T2 (shadcn install)

The sidebar-07 block provides the canonical pattern for the icon-collapse sidebar. Read the installed file and adapt it to match the existing `UnifiedSidebar` API contract:

- [ ] **Step 1: Read installed sidebar-07 file**

Find the file created by `npx shadcn add sidebar-07` (likely `components/ui/sidebar-07.tsx` or `components/ui/app-sidebar.tsx`). Read it fully.

- [ ] **Step 2: Adapt to existing UnifiedSidebar API**

The existing `UnifiedSidebar` in `components/ui/unified-sidebar.tsx` exposes `UnifiedSidebarItem[]`, `user`, `timezone`, `onLogout`, `styleVariant`, `showSubscription`. The sidebar-07 block uses a different prop shape (`items`, `teams`, `navMain`, `user`, etc.).

**Decision**: Keep the existing `UnifiedSidebar` as the public API. The sidebar-07 file becomes the canonical implementation of that API using shadcn sidebar primitives.

Read `components/ui/unified-sidebar.tsx` (full file). Then modify the sidebar-07 block to accept `UnifiedSidebarItem[]` and map to sidebar-07's internal nav structure.

Key mappings:
- `UnifiedSidebarItem.href` → sidebar-07 `NavItem.href`
- `UnifiedSidebarItem.icon` → sidebar-07 `NavItem.icon` (Lucide React)
- `UnifiedSidebarItem.group` → sidebar-07 nav section grouping
- `UnifiedSidebarItem.label` → sidebar-07 `NavItem.title`
- `UnifiedSidebarItem.exact` → sidebar-07 exact route matching
- `UnifiedSidebarItem.action` → sidebar-07 `NavItem.onClick`
- `UnifiedSidebarItem.disabled` → sidebar-07 `NavItem.disabled`
- `UnifiedSidebarItem.badge` → sidebar-07 `NavItem.badge`
- `UnifiedSidebarItem.i18nKey` → use `t(i18nKey)` for label

The team-switcher and nav-projects from sidebar-07 are optional — only include them if `UnifiedSidebarConfig.actions` is provided.

- [ ] **Step 3: Preserve icon-collapse behavior**

The sidebar-07 block already supports `collapsible="icon"`. Ensure the sidebar provider in `root-providers.tsx` passes `defaultOpen` from the cookie value. Check `SidebarProvider` props match shadcn's API (`defaultOpen`, `open`, `onOpenChange`, `sidebarId`).

- [ ] **Step 4: Typecheck**

Run:
```bash
npm run typecheck 2>&1 | grep -E "sidebar-07|unified-sidebar" | head -20
```
Expected: No TypeScript errors in sidebar-07 or unified-sidebar

- [ ] **Step 5: Commit**

```bash
git add components/ui/sidebar-07.tsx
git commit -m "feat(sidebar): add sidebar-07 block composition mapped to UnifiedSidebar API"
```
Files: `components/ui/sidebar-07.tsx`

**QA Scenarios:**

```
Scenario: sidebar-07 accepts UnifiedSidebarItem[] props
  Tool: Bash
  Preconditions: sidebar-07.tsx created
  Steps:
    1. grep -E "UnifiedSidebarItem|UnifiedSidebarConfig" components/ui/sidebar-07.tsx
    2. grep "collapsible.*icon" components/ui/sidebar-07.tsx
  Expected Result: Uses UnifiedSidebarItem type; has collapsible="icon"
  Evidence: .sisyphus/evidence/task-5-block-api.txt
```

---

### Task 6: Fix sidebar primitives (logo-header, nav-group, navigation)

**Files:**
- Modify: `components/ui/sidebar-primitives/sidebar-logo-header.tsx`
- Modify: `components/ui/sidebar-primitives/sidebar-nav-group.tsx`

**Parallelization:**
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 2 (with T4, T5, T7)
- **Blocks**: T8, T9, T11
- **Blocked By**: None (these are independent fixes)

- [ ] **Step 6a: Fix sidebar-logo-header.tsx — remove unintended `data-[state=open]`**

Read `components/ui/sidebar-primitives/sidebar-logo-header.tsx`.

The `SidebarMenuButton` in the logo header uses `data-[state=open]:bg-sidebar-accent/20 data-[state=open]:text-sidebar-accent-foreground`. This `data-[state=open]` attribute comes from Radix collapsible parent context and is not intentional here. The logo button should NOT change appearance when the collapsible opens.

Remove `data-[state=open]:` classes and use a neutral state:

```tsx
// BEFORE (line 17):
className="... data-[state=open]:bg-sidebar-accent/20 data-[state=open]:text-sidebar-accent-foreground"

// AFTER:
className="... hover:bg-sidebar-accent/10 hover:text-sidebar-foreground"
```

- [ ] **Step 6b: Fix sidebar-nav-group.tsx — unsafe type cast**

Read `components/ui/sidebar-primitives/sidebar-nav-group.tsx:94`.

```tsx
// BEFORE (line 94):
const translate = t as unknown as (key: string) => string

// AFTER:
// Remove the unsafe cast. useI18n() returns a properly typed function.
// The correct approach:
const translate = (key: string) => t(key)
```

Actually, `useI18n()` from `@/locales/client` returns a function `t` that accepts a key. The unsafe cast was masking a potential type mismatch. The fix depends on what `t` actually returns:

Read `locales/client/index.ts` or wherever `useI18n` is defined to understand the return type. If `t` returns `string`, then the cast is unnecessary and should be removed entirely. If `t` has a different return type, the translation call pattern needs adjustment:

```tsx
// If t already returns string (common pattern):
const label = item.i18nKey ? t(item.i18nKey) : item.label

// Remove the cast entirely — no intermediate variable needed
```

- [ ] **Step 6c: Memoize class definitions in sidebar-nav-group.tsx**

Read `components/ui/sidebar-primitives/sidebar-nav-group.tsx:102-107`.

These class strings are recreated on every render:

```tsx
// BEFORE:
const itemButtonClass = 'pointer-events-auto h-10 rounded-xl px-2.5 font-medium transition-colors duration-200 hover:text-sidebar-foreground data-[active=true]:text-sidebar-foreground ...'
const inactiveItemClass = 'text-sidebar-foreground/78 hover:bg-sidebar-primary/10 hover:text-sidebar-foreground'
const activeItemClass = 'bg-sidebar-primary/14 text-sidebar-foreground ring-1 ring-sidebar-primary/22 shadow-[inset_0_1px_0_hsl(var(--foreground)_/_0.03)]'

// AFTER:
const itemButtonClass = useMemo(
  () => 'pointer-events-auto h-10 rounded-xl px-2.5 font-medium transition-colors duration-200 hover:text-sidebar-foreground data-[active=true]:text-sidebar-foreground group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0!',
  []
)
const inactiveItemClass = useMemo(
  () => 'text-sidebar-foreground/78 hover:bg-sidebar-primary/10 hover:text-sidebar-foreground',
  []
)
const activeItemClass = useMemo(
  () => 'bg-sidebar-primary/14 text-sidebar-foreground ring-1 ring-sidebar-primary/22 shadow-[inset_0_1px_0_hsl(var(--foreground)_/_0.03)]',
  []
)
```

Make sure to add `useMemo` to the import from React.

- [ ] **Step 6d: Typecheck**

Run:
```bash
npm run typecheck 2>&1 | grep -E "sidebar-logo-header|sidebar-nav-group" | head -10
```
Expected: No errors in either file

- [ ] **Step 6e: Commit**

```bash
git add components/ui/sidebar-primitives/sidebar-logo-header.tsx components/ui/sidebar-primitives/sidebar-nav-group.tsx
git commit -m "fix(sidebar): remove unintended data-[state=open] on logo; fix unsafe type cast; memoize class strings"
```
Files: `components/ui/sidebar-primitives/sidebar-logo-header.tsx`, `components/ui/sidebar-primitives/sidebar-nav-group.tsx`

**QA Scenarios:**

```
Scenario: sidebar-logo-header has no unintended data-[state=open] on text
  Tool: Bash
  Preconditions: sidebar-logo-header.tsx fixed
  Steps:
    1. grep "data-\[state=open\]:text-sidebar-accent-foreground" components/ui/sidebar-primitives/sidebar-logo-header.tsx
    2. grep "hover:text-sidebar-foreground" components/ui/sidebar-primitives/sidebar-logo-header.tsx
  Expected Result: No accent-foreground on logo; hover text uses sidebar-foreground
  Evidence: .sisyphus/evidence/task-6-logo-hover.txt

Scenario: sidebar-nav-group type cast removed
  Tool: Bash
  Preconditions: sidebar-nav-group.tsx fixed
  Steps:
    1. grep "as unknown as" components/ui/sidebar-primitives/sidebar-nav-group.tsx
  Expected Result: No unsafe type casts found
  Evidence: .sisyphus/evidence/task-6-type-cast.txt

Scenario: Class strings are memoized
  Tool: Bash
  Preconditions: sidebar-nav-group.tsx fixed
  Steps:
    1. grep "useMemo" components/ui/sidebar-primitives/sidebar-nav-group.tsx
  Expected Result: useMemo found 3 times (itemButtonClass, inactiveItemClass, activeItemClass)
  Evidence: .sisyphus/evidence/task-6-memo.txt
```

---

### Task 7: Fix hooks (use-mobile SSR, use-navigation-loading shared state)

**Files:**
- Modify: `hooks/use-mobile.tsx`
- Modify: `hooks/use-navigation-loading.tsx`

**Parallelization:**
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 2 (with T4, T5, T6)
- **Blocks**: T8, T9, T11
- **Blocked By**: None

- [ ] **Step 7a: Fix use-mobile.tsx SSR-safe initialization**

Read `hooks/use-mobile.tsx`.

The issue: `useState(false)` in `useIsMobileDetection()` is initialized synchronously on the server during SSR. When the component hydrates on the client, `window.matchMedia` may return a different value, causing a hydration mismatch.

**Fix**: Use a `useEffect` to set the initial value after mount, not during the initial state:

```tsx
// BEFORE:
function useIsMobileDetection() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches
  })
  // ...
}

// AFTER:
function useIsMobileDetection() {
  // Start with null (unknown) to avoid SSR/hydration mismatch
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    // Set initial value after mount (client-only)
    const mobileQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)
    const checkMobile = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile(e.matches)

    // Check immediately
    checkMobile(mobileQuery)

    // Listen for changes
    mobileQuery.addEventListener("change", checkMobile)
    return () => mobileQuery.removeEventListener("change", checkMobile)
  }, []) // Empty deps — runs once after mount

  // Return false during SSR/hydration to avoid mismatch
  return isMobile ?? false
}
```

Note: The `useState` variant in the existing file initializes with `typeof window === 'undefined'` check which is fine — but the `useEffect` still needs to handle the SSR case. Test both approaches and pick the cleaner one.

Also check if `DataProvider`'s `useIsMobileDetection` at line 240-261 of `context/data-provider.tsx` needs the same fix. If it uses `window.matchMedia` directly without SSR guard, apply the same pattern.

- [ ] **Step 7b: Fix use-navigation-loading.tsx module-scope shared state**

Read `hooks/use-navigation-loading.tsx:6-9`.

The issue: `loadingState` is defined at module scope (not inside a hook). Multiple components using `useNavigationListener` share the same object reference — mutations in one component affect all others.

**Fix**: Move state inside the hook:

```tsx
// BEFORE (lines 6-9):
const loadingState = {
  isLoading: false,
  currentPath: "",
}

// AFTER:
// Remove the module-scope object entirely.
// useNavigationListener returns a stable reference by using useRef:
export function useNavigationListener() {
  const loadingStateRef = useRef({
    isLoading: false,
    currentPath: "",
  })

  useEffect(() => {
    const handleStart = () => {
      loadingStateRef.current.isLoading = true
    }

    const handleComplete = () => {
      loadingStateRef.current.isLoading = false
    }

    window.addEventListener("beforeunload", handleStart)
    window.addEventListener("load", handleComplete)

    return () => {
      window.removeEventListener("beforeunload", handleStart)
      window.removeEventListener("load", handleComplete)
    }
  }, [])

  // Return a proxy that looks like the original shape
  return {
    get isLoading() { return loadingStateRef.current.isLoading },
    get currentPath() { return loadingStateRef.current.currentPath },
  }
}
```

- [ ] **Step 7c: Add SSR hydration test for use-mobile**

Read `components/sidebar/__tests__/sidebar.test.tsx`. Add a new test for SSR hydration:

```tsx
describe("useIsMobile SSR Safety", () => {
  it("should return false during SSR (before hydration)", () => {
    // Mock window.matchMedia to return true (mobile)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    })

    const { result } = renderHook(() => useIsMobile())
    
    // During SSR/hydration, should return false (the safe default)
    expect(result.current).toBe(false)
  })

  it("should update to true after mount on mobile", async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    })

    const { result } = renderHook(() => useIsMobile())
    
    // Initial state after hydration
    await waitFor(() => {
      expect(result.current).toBe(true)
    })
  })
})
```

- [ ] **Step 7d: Run tests**

Run:
```bash
npm run test -- --run components/sidebar/__tests__/sidebar.test.tsx
```
Expected: All sidebar tests pass including new SSR tests

- [ ] **Step 7e: Commit**

```bash
git add hooks/use-mobile.tsx hooks/use-navigation-loading.tsx components/sidebar/__tests__/sidebar.test.tsx
git commit -m "fix(sidebar): SSR-safe mobile detection; fix shared state in useNavigationListener; add hydration tests"
```
Files: `hooks/use-mobile.tsx`, `hooks/use-navigation-loading.tsx`, `components/sidebar/__tests__/sidebar.test.tsx`

**QA Scenarios:**

```
Scenario: use-mobile returns false on server / during hydration
  Tool: Bash
  Preconditions: use-mobile.tsx fixed
  Steps:
    1. grep -n "useState<boolean | null>" hooks/use-mobile.tsx
    2. grep "isMobile ?? false" hooks/use-mobile.tsx
  Expected Result: useState with null initial; null coalesced to false
  Evidence: .sisyphus/evidence/task-7-mobile-ssr.txt

Scenario: Navigation loading has no module-scope shared state
  Tool: Bash
  Preconditions: use-navigation-loading.tsx fixed
  Steps:
    1. grep "const loadingState = {" hooks/use-navigation-loading.tsx
  Expected Result: NOT FOUND (module scope removed)
  Evidence: .sisyphus/evidence/task-7-shared-state.txt

Scenario: New SSR tests exist and pass
  Tool: Bash
  Preconditions: Test added
  Steps:
    1. grep "SSR Safety" components/sidebar/__tests__/sidebar.test.tsx
    2. npm run test -- --run components/sidebar/__tests__/sidebar.test.tsx 2>&1 | tail -5
  Expected Result: Test found; all tests pass
  Evidence: .sisyphus/evidence/task-7-tests.txt
```

---

### Task 8: Update dashboard-sidebar.tsx (new API + fix duplicate icon)

**Files:**
- Modify: `components/sidebar/dashboard-sidebar.tsx`

**Parallelization:**
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 3 (with T9, T10)
- **Blocks**: T11
- **Blocked By**: T4, T5 (sidebar replacement + block composition)

- [ ] **Step 1: Read new unified-sidebar API**

After T4 and T5, read `components/ui/unified-sidebar.tsx` and `components/ui/sidebar-07.tsx` to understand the updated prop interface.

- [ ] **Step 2: Fix duplicate Globe icon**

Read `components/sidebar/dashboard-sidebar.tsx:100-109`. Both "Prop Firms" (line 101) and "Deals" (line 108) use `<Globe className={NAV_ICON_SIZE} />`. Fix:

```tsx
// BEFORE:
{ href: `/${locale}/propfirms`, icon: <Globe className={NAV_ICON_SIZE} />, label: "Prop Firms", group: "Community" },
// ...
{ href: `/${locale}/deals`, icon: <Globe className={NAV_ICON_SIZE} />, label: "Deals", group: "Community" },

// AFTER: Deals uses a different icon:
{ href: `/${locale}/deals`, icon: <TrendingUp className={NAV_ICON_SIZE} />, label: "Deals", group: "Community" },
```

TrendingUp is already imported at line 19.

- [ ] **Step 3: Update to use new sidebar API if needed**

If `UnifiedSidebar` API changed from T5, update the `DashboardSidebar` props to match. Specifically:
- If sidebar-07 uses `collapsible="icon"` by default, the nav item structure should work unchanged
- If `UnifiedSidebarItem` type changed, update the navItems array accordingly
- The `styleVariant="minimal"` and timezone/user props should remain compatible

- [ ] **Step 4: Typecheck**

Run:
```bash
npm run typecheck 2>&1 | grep "dashboard-sidebar"
```
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add components/sidebar/dashboard-sidebar.tsx
git commit -m "fix(sidebar): fix duplicate Globe icon on Deals nav item"
```
Files: `components/sidebar/dashboard-sidebar.tsx`

**QA Scenarios:**

```
Scenario: No duplicate Globe icons in dashboard sidebar
  Tool: Bash
  Preconditions: dashboard-sidebar.tsx fixed
  Steps:
    1. grep -c "Globe" components/sidebar/dashboard-sidebar.tsx
  Expected Result: Count = 1 (only Prop Firms uses Globe; Deals uses TrendingUp)
  Evidence: .sisyphus/evidence/task-8-no-duplicate-icons.txt
```

---

### Task 9: Update landing-sidebar.tsx + admin sidebar-nav.tsx + teams-sidebar.tsx

**Files:**
- Modify: `components/sidebar/landing-sidebar.tsx`
- Modify: `app/[locale]/admin/components/sidebar-nav.tsx`
- Modify: `app/[locale]/teams/components/teams-sidebar.tsx`

**Parallelization:**
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 3 (with T8, T10)
- **Blocks**: T11
- **Blocked By**: T4, T5

These are all surface-level — the hard work is in T4/T5. Each file needs to:

1. Verify `UnifiedSidebarItem` imports match the updated type
2. Verify nav item props match the updated API
3. No structural changes expected

Additionally:

- [ ] **Step 9a: landing-sidebar.tsx — clean up**

Read `components/sidebar/landing-sidebar.tsx`. The nav items should already match `UnifiedSidebarItem`. No changes expected unless T5 changed the type signature. Verify by running typecheck.

- [ ] **Step 9b: admin sidebar-nav.tsx — clean up**

Read `app/[locale]/admin/components/sidebar-nav.tsx`. Verify nav items use the updated `UnifiedSidebarItem` type.

- [ ] **Step 9c: teams-sidebar.tsx — use existing stripLocalePrefix**

Read `app/[locale]/teams/components/teams-sidebar.tsx:10-26`.

The `resolveTeamPathContext` function manually parses the pathname for locale context. This duplicates logic from `stripLocalePrefix` in `use-sidebar-nav.ts`. Fix by importing and using the existing helper:

```tsx
// BEFORE (lines 10-26):
function resolveTeamPathContext(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const teamsIndex = segments.indexOf('teams')
  const hasLocalePrefix = teamsIndex === 1
  const localePrefix = hasLocalePrefix ? `/${segments[0]}` : ''
  // ...
}

// AFTER:
import { stripLocalePrefix } from '@/components/ui/sidebar-primitives/use-sidebar-nav'
import { usePathname } from 'next/navigation'

function resolveTeamPathContext(pathname: string) {
  // stripLocalePrefix handles locale stripping cleanly
  const strippedPath = stripLocalePrefix(pathname)
  const segments = strippedPath.split('/').filter(Boolean)
  // ... rest of logic using strippedPath instead of manual parsing
}
```

- [ ] **Step 9d: Typecheck all three**

Run:
```bash
npm run typecheck 2>&1 | grep -E "landing-sidebar|sidebar-nav|teams-sidebar" | head -10
```
Expected: No TypeScript errors

- [ ] **Step 9e: Commit**

```bash
git add components/sidebar/landing-sidebar.tsx app/[locale]/admin/components/sidebar-nav.tsx app/[locale]/teams/components/teams-sidebar.tsx
git commit -m "fix(sidebar): use stripLocalePrefix in teams sidebar; verify all surfaces use updated UnifiedSidebar API"
```
Files: `components/sidebar/landing-sidebar.tsx`, `app/[locale]/admin/components/sidebar-nav.tsx`, `app/[locale]/teams/components/teams-sidebar.tsx`

**QA Scenarios:**

```
Scenario: teams-sidebar uses stripLocalePrefix
  Tool: Bash
  Preconditions: teams-sidebar.tsx fixed
  Steps:
    1. grep "stripLocalePrefix" app/[locale]/teams/components/teams-sidebar.tsx
    2. grep "const segments = pathname.split" app/[locale]/teams/components/teams-sidebar.tsx
  Expected Result: stripLocalePrefix found; manual split NOT found
  Evidence: .sisyphus/evidence/task-9-strip-locale.txt
```

---

### Task 10: Clean up unified-sidebar.tsx (remove stale comment)

**Files:**
- Modify: `components/ui/unified-sidebar.tsx`

**Parallelization:**
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 3 (with T8, T9)
- **Blocks**: T11
- **Blocked By**: T4, T5

- [ ] **Step 1: Read unified-sidebar.tsx and find stale comment**

Read `components/ui/unified-sidebar.tsx:77`.

```tsx
// BEFORE (line 77):
// Need to import this

// AFTER:
// Remove this comment — useNavigationLoading IS imported on line 7
```

- [ ] **Step 2: Verify no other stale comments**

Search for any other "// Need to" or "// TODO" or incomplete comments in the file:

```bash
grep -n "// Need to\|// TODO\|// FIXME\|// HACK" components/ui/unified-sidebar.tsx
```
Expected: None found

- [ ] **Step 3: Commit**

```bash
git add components/ui/unified-sidebar.tsx
git commit -m "chore(sidebar): remove stale comment in unified-sidebar.tsx"
```
Files: `components/ui/unified-sidebar.tsx`

**QA Scenarios:**

```
Scenario: No stale comments remain in unified-sidebar.tsx
  Tool: Bash
  Preconditions: unified-sidebar.tsx cleaned
  Steps:
    1. grep -c "// Need to import" components/ui/unified-sidebar.tsx
  Expected Result: 0
  Evidence: .sisyphus/evidence/task-10-clean.txt
```

---

### Task 11: Full verification — typecheck + test suite + Playwright smoke

**Files:**
- None (verification only)

**Parallelization:**
- **Can Run In Parallel**: NO — sequential final gate
- **Blocked By**: T1-T10 (all tasks)

- [ ] **Step 1: Typecheck full project**

Run:
```bash
npm run typecheck 2>&1
```
Expected: Zero TypeScript errors across the entire project

- [ ] **Step 2: Run full test suite**

Run:
```bash
npm run test -- --run 2>&1 | tail -30
```
Expected: All tests pass

- [ ] **Step 3: Run Playwright smoke tests**

If Playwright is configured (check `playwright.config.ts`):
```bash
npx playwright test --reporter=list 2>&1 | tail -20
```
Expected: All smoke tests pass

Otherwise, manually verify:
1. `npm run dev` starts without errors
2. Dashboard page loads at `http://localhost:3000/en/dashboard`
3. Sidebar renders with correct active/hover contrast

- [ ] **Step 4: Verify all 10 audit violations are fixed**

Run this verification script:
```bash
echo "=== AUDIT FIX VERIFICATION ==="

echo "1. SubButton hover uses sidebar-foreground:"
grep "SidebarMenuSubButton\|hover:text-sidebar-foreground" components/ui/sidebar.tsx | grep -v "SidebarMenuAction\|SidebarGroupAction" | head -3

echo "2. Cookie has Secure flag:"
grep "; Secure" components/ui/sidebar.tsx

echo "3. Logo header no unintended data-[state=open]:"
grep "data-\[state=open\]:text-sidebar-accent-foreground" components/ui/sidebar-primitives/sidebar-logo-header.tsx | wc -l

echo "4. use-mobile SSR-safe:"
grep "useState<boolean | null>" hooks/use-mobile.tsx

echo "5. use-navigation-loading no module scope:"
grep "const loadingState = {" hooks/use-navigation-loading.tsx | wc -l

echo "6. sidebar-nav-group no unsafe type cast:"
grep "as unknown as" components/ui/sidebar-primitives/sidebar-nav-group.tsx | wc -l

echo "7. sidebar-nav-group classes memoized:"
grep "useMemo" components/ui/sidebar-primitives/sidebar-nav-group.tsx | wc -l

echo "8. teams-sidebar uses stripLocalePrefix:"
grep "stripLocalePrefix" app/[locale]/teams/components/teams-sidebar.tsx

echo "9. dashboard-sidebar no duplicate Globe icon:"
grep "Globe" components/sidebar/dashboard-sidebar.tsx | wc -l

echo "10. unified-sidebar no stale comment:"
grep "// Need to import" components/ui/unified-sidebar.tsx | wc -l
```

Expected results:
1. SubButton hover = sidebar-foreground ✅
2. Cookie Secure flag present ✅
3. Logo data-[state=open] on text = 0 ✅
4. useState<boolean | null> present ✅
5. Module-scope loadingState = 0 ✅
6. Unsafe type casts = 0 ✅
7. useMemo count = 3 ✅
8. stripLocalePrefix found ✅
9. Globe icon count = 1 ✅
10. Stale comment = 0 ✅

- [ ] **Step 5: Final commit (if all checks pass)**

```bash
git add -A
git commit -m "chore(sidebar): complete refactor — shadcn sidebar-07, all 10 audit fixes, full verification"
```
Files: (all changes from T1-T10)

**QA Scenarios:**

```
Scenario: Full project typecheck passes
  Tool: Bash
  Preconditions: All tasks complete
  Steps:
    1. npm run typecheck 2>&1 | grep -E "^error|Found [0-9]+ error"
  Expected Result: No errors
  Evidence: .sisyphus/evidence/task-11-typecheck.txt

Scenario: Full test suite passes
  Tool: Bash
  Preconditions: All tasks complete
  Steps:
    1. npm run test -- --run 2>&1 | grep -E "Tests|passed|failed"
  Expected Result: All tests pass
  Evidence: .sisyphus/evidence/task-11-tests.txt

Scenario: All 10 audit violations verified fixed
  Tool: Bash
  Preconditions: All tasks complete
  Steps:
    1. (run the verification script from Step 4 above)
  Expected Result: All 10 items show correct values
  Evidence: .sisyphus/evidence/task-11-audit-verification.txt
```

---

## Final Verification Wave

> After ALL implementation tasks, 4 review agents run in PARALLEL. ALL must APPROVE.

- [ ] **F1. Plan Compliance Audit** — `oracle`
  Read `components/ui/sidebar.tsx`, `components/ui/sidebar-07.tsx`, and all modified files. Verify each "Must Have" from the audit is present. Verify no forbidden patterns (accent foreground on nav text, module-scope shared state, unsafe type casts).
  Output: `Must Have [10/10] | Forbidden [0 found] | VERDICT: APPROVE/REJECT`

- [ ] **F2. Code Quality Review** — `unspecified-high`
  Run `npm run lint` and `npm run typecheck`. Check for `as any`, empty catches, console.log in production, commented-out code, unused imports. All 10 fixes should be clean.
  Output: `Lint [PASS/FAIL] | Typecheck [PASS/FAIL] | Issues [N] | VERDICT`

- [ ] **F3. Real Manual QA** — `unspecified-high`
  Start dev server, open dashboard. Verify: (1) Sidebar renders, (2) hover on nav items shows sidebar-foreground text color, (3) active item highlighted with sidebar-primary, (4) cookie has Secure flag, (5) mobile bottom nav renders on narrow viewport.
  Output: `Visual QA [PASS/FAIL] | VERDICT`

- [ ] **F4. Scope Fidelity Check** — `deep`
  For each task T1-T11: read task description, read actual git diff. Verify 1:1 — every fix was implemented, no extra changes beyond scope. Check no `proxy.ts`, `data-provider.tsx`, or import-trade files were modified.
  Output: `Tasks [11/11 compliant] | Scope creep [0] | Out-of-scope changes [0] | VERDICT`

---

## Success Criteria

### Verification Commands
```bash
npm run typecheck   # Expected: 0 errors
npm run test       # Expected: all tests pass
npm run lint       # Expected: no new lint errors
```

### Final Checklist
- [ ] All 10 sidebar audit violations fixed
- [ ] shadcn sidebar-07 installed and integrated
- [ ] All 5 sidebar surfaces updated (dashboard, landing, admin, teams, mobile)
- [ ] SSR-safe mobile detection with unit test
- [ ] Cookie Secure flag added
- [ ] New design token constants in lib/sidebar-tokens.ts
- [ ] All existing tests still pass
- [ ] No changes to proxy, auth, or import-trade logic
