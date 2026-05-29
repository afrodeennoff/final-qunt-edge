# Full App Modern Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the homepage's premium visual language (glass cards, glow effects, gradient dividers, modern typography) to all 66 pages by updating ~15 shared component files.

**Architecture:** Update the shared component layer — Card, UnifiedSurface, UnifiedPageShell, MarketingSection components, MarketingLayoutShell, AuthenticationLayoutShell, sidebar, skeletons — so new design tokens cascade automatically to every page group (landing, auth, dashboard, admin, teams, embed, shared). No per-page rewrites needed.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS, shadcn/ui primitives, next-international i18n, Lucide icons.

---

### Task 1: Card — Add glass gradient variant

**Files:**
- Modify: `components/ui/card.tsx:58-65`

The `Card` component is the foundation for every surface in the app. Update the `default` and `elevated` variants to use a glass gradient background with subtle inset ring.

- [ ] **Step 1: Update Card default variant styles**

In `components/ui/card.tsx`, change the `default` and `elevated` variant class strings to include glass gradient + ring:

```
// Old (line 63-64):
variant === 'default' && 'bg-card border border-border/25',
variant === 'elevated' && 'bg-card/95 border border-border/25',
```

```
// New:
variant === 'default' && 'bg-gradient-to-br from-card/50 to-card/10 border border-border/20 ring-1 ring-inset ring-white/[0.02]',
variant === 'elevated' && 'bg-gradient-to-br from-card/60 to-card/15 border border-border/20 ring-1 ring-inset ring-white/[0.03] shadow-sm',
```

Also update the hover effect (line 69):

```
// Old:
hover && 'hover:border-border/40 hover:-translate-y-px transition-all duration-150',
```

```
// New:
hover && 'hover:border-primary/25 hover:shadow-[0_0_35px_-18px] hover:shadow-primary/15 hover:-translate-y-0.5 transition-all duration-300',
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/card.tsx
git commit -m "feat: add glass gradient variant to Card component"
```

---

### Task 2: UnifiedPageShell — Add glow orb, dot grid, modern spacing

**Files:**
- Modify: `components/layout/unified-page-shell.tsx`

The shell wraps all landing pages. Add optional `glow` (blur orb behind content) and `dotGrid` (radial dot pattern background) props. Update density spacing to match homepage pacing.

- [ ] **Step 1: Update UnifiedPageShell with glow + dot grid support**

Read the current file then replace the entire content with:

```tsx
import type { ReactNode } from 'react'
import { CONTENT_PADDING, WORKSPACE_SHELL_WIDTH } from '@/lib/constants/layout'
import { cn } from '@/lib/utils'

type UnifiedPageShellProps = {
  children: ReactNode
  className?: string
  widthClassName?: string
  density?: 'default' | 'compact' | 'spacious'
  variant?: 'default' | 'refined' | 'minimal'
  glow?: boolean
  dotGrid?: boolean
}

type UnifiedPageHeaderProps = {
  title: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  actions?: ReactNode
  className?: string
  variant?: 'default' | 'gradient' | 'elevated'
}

type UnifiedSurfaceProps = {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'subtle'
  hover?: boolean
  glowOnHover?: boolean
}

export function UnifiedPageShell({
  children,
  className,
  widthClassName = WORKSPACE_SHELL_WIDTH,
  density = 'default',
  variant = 'default',
  glow = false,
  dotGrid = false,
}: UnifiedPageShellProps) {
  const densityClasses =
    density === 'compact'
      ? 'py-4 sm:py-6 lg:py-8 2xl:py-10'
      : density === 'spacious'
        ? 'py-8 sm:py-10 lg:py-12 2xl:py-14'
        : 'py-6 sm:py-8 lg:py-10 2xl:py-12'

  return (
    <div
      className={cn(
        'scroll-smooth-butter animate-page-enter relative mx-auto w-full',
        widthClassName === 'max-w-none' && 'max-w-[2400px]',
        widthClassName,
        CONTENT_PADDING,
        densityClasses,
        dotGrid && 'bg-[radial-gradient(oklch(0.15_0.01_260)_0.8px,transparent_1px)] bg-[length:4px_4px]',
        '[&_.scroll-container]:overflow-y-auto [&_.scroll-container]:scrollbar-thin',
        className,
      )}
    >
      {glow && (
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
          <div className="h-64 w-64 rounded-full bg-primary/[0.03] blur-3xl" />
        </div>
      )}
      <div className="relative z-10 flex flex-col gap-4 sm:gap-6 lg:gap-8 2xl:gap-10">{children}</div>
    </div>
  )
}

export function UnifiedPageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
  variant = 'default',
}: UnifiedPageHeaderProps) {
  return (
    <header
      className={cn(
        'relative overflow-hidden rounded-xl border border-border/20 bg-gradient-to-br from-card/50 to-card/10 ring-1 ring-inset ring-white/[0.02] px-4 py-4 sm:py-6 sm:px-6',
        'animate-fade-up-smooth transition-all duration-300',
        variant === 'gradient' && 'border-primary/20',
        variant === 'elevated' && 'shadow-[0_0_35px_-18px] shadow-primary/15',
        className,
      )}
    >
      {variant === 'gradient' && (
        <div className="pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-full bg-primary/[0.04] blur-2xl" />
      )}
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="space-y-3">
          {eyebrow && (
            <span className="inline-block rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              {eyebrow}
            </span>
          )}
          <h1
            className={cn(
              'font-light tracking-tight text-foreground',
              'text-3xl sm:text-4xl',
            )}
          >
            {title}
          </h1>
          {description && (
            <p className="max-w-3xl text-[14px] text-muted-foreground/70 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}

export function UnifiedSurface({ children, className, variant = 'default', hover = false, glowOnHover = false }: UnifiedSurfaceProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-xl border border-border/20 bg-gradient-to-br from-card/50 to-card/10 p-4 ring-1 ring-inset ring-white/[0.02] sm:p-6',
        'transition-all duration-300',
        hover && 'hover:border-primary/25 hover:shadow-[0_0_35px_-18px] hover:shadow-primary/15',
        glowOnHover && 'hover:shadow-[0_0_35px_-18px] hover:shadow-primary/15',
        variant === 'elevated' && 'shadow-[0_0_35px_-18px] shadow-primary/10',
        variant === 'subtle' && 'bg-gradient-to-br from-muted/50 to-muted/20 border-border/10',
        className,
      )}
    >
      {glowOnHover && (
        <div className="pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-full bg-primary/[0.03] blur-2xl transition-all duration-500 group-hover:bg-primary/[0.06] group-hover:scale-150" />
      )}
      <div className="relative z-10">{children}</div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/unified-page-shell.tsx
git commit -m "feat: modernize UnifiedPageShell with glass surfaces, glow, dot grid"
```

---

### Task 3: MarketingSection components — Modern polish

**Files:**
- Modify: `components/layout/marketing-sections.tsx`

Update the eyebrow badge, section heading title, description, feature card, stat block, step card, pricing card, and hyperframe to use the new design tokens.

- [ ] **Step 1: Update section classes**

Replace the existing classes:

```
// Line 9 — hero title
export const marketingHeroTitleClassName =
  'text-balance text-[48px] font-[275] leading-[var(--leading-none)] tracking-[var(--tracking-tighter)] text-foreground sm:text-[64px] lg:text-[80px] xl:text-[96px]'

// Line 12 — section title
export const marketingSectionTitleClassName =
  'text-balance text-[32px] font-[350] leading-[var(--leading-snug)] tracking-[var(--tracking-tight)] text-foreground sm:text-[40px] lg:text-[48px]'

// Line 14 — body
export const marketingBodyClassName = 'text-[14px] leading-[var(--leading-relaxed)] text-muted-foreground/80 sm:text-[15px]'
```

With:

```
export const marketingHeroTitleClassName =
  'text-balance text-[48px] font-light tracking-tight text-foreground sm:text-[64px] lg:text-[80px] xl:text-[96px]'

export const marketingSectionTitleClassName =
  'text-balance text-[32px] font-light tracking-tight text-foreground sm:text-[40px] lg:text-[48px]'

export const marketingBodyClassName = 'text-[14px] leading-relaxed text-muted-foreground/70'
```

- [ ] **Step 2: Update MarketingSectionHeader eyebrow**

Change line 63:
```
// Old:
<p className="text-[10.5px] font-black uppercase tracking-[0.12em] text-primary">
  {eyebrow}
</p>
```

```
// New:
<span className="inline-block rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
  {eyebrow}
</span>
```

- [ ] **Step 3: Update MarketingSection with glow + divider**

Add an optional `glow` prop and a gradient top divider. Replace `MarketingSection` function:

```tsx
export function MarketingSection({
  children,
  id,
  className,
  innerClassName,
  glow = false,
}: {
  children: ReactNode
  id?: string
  className?: string
  innerClassName?: string
  glow?: boolean
}) {
  return (
    <section
      id={id}
      className={cn(
        'scroll-smooth-butter relative px-4 py-8 sm:px-6 lg:px-8 sm:py-10',
        'border-t border-border/10',
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      {glow && (
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
          <div className="h-64 w-64 rounded-full bg-primary/[0.03] blur-3xl" />
        </div>
      )}
      <div className={cn('relative z-10 mx-auto w-full', MARKETING_SHELL_WIDTH, innerClassName)}>{children}</div>
    </section>
  )
}
```

- [ ] **Step 4: Update MarketingFeatureCard icon container**

Change lines 92-93:
```
// Old:
<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted/50 border border-border/30 text-muted-foreground">
  {icon}
</div>
```

```
// New:
<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-inset ring-primary/10 text-primary">
  {icon}
</div>
```

- [ ] **Step 5: Update MarketingStatBlock**

Replace the entire component:

```tsx
export function MarketingStatBlock({
  value,
  label,
  className,
}: {
  value: ReactNode
  label: ReactNode
  className?: string
}) {
  return (
    <div className={cn('rounded-xl border border-border/20 bg-gradient-to-br from-card/50 to-card/10 p-6 ring-1 ring-inset ring-white/[0.02] text-center', className)}>
      <p className="text-[32px] font-light tracking-[-0.05em] tabular-nums text-foreground leading-none font-mono">
        {value}
      </p>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">
        {label}
      </p>
    </div>
  )
}
```

- [ ] **Step 6: Update MarketingStepCard icon**

Same icon container update as Step 4 (line 148):
```
// Old:
<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 border border-border/30 text-muted-foreground">
```

```
// New:
<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-inset ring-primary/10 text-primary">
```

- [ ] **Step 7: Commit**

```bash
git add components/layout/marketing-sections.tsx
git commit -m "feat: modernize MarketingSection components with glass tokens"
```

---

### Task 4: MarketingLayoutShell — Dot grid, glow orb, gradient divider

**Files:**
- Modify: `app/[locale]/(landing)/components/marketing-layout-shell.tsx`

Update the landing page shell to include background dot pattern, glow orb, and gradient top divider.

- [ ] **Step 1: Add background treatment + glow orb**

Add a dot grid background and glow orb behind the main content area. Update the top border to a gradient divider. Replace the return JSX:

```tsx
  return (
    <div
      className={cn(
        'marketing-shell qe-v2-app-shell min-h-dvh w-full overflow-x-hidden bg-background bg-[radial-gradient(oklch(0.15_0.01_260)_0.8px,transparent_1px)] bg-[length:4px_4px]',
        className,
      )}
    >
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="pointer-events-none fixed inset-0 flex items-start justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-primary/[0.02] blur-3xl" />
      </div>
      <div className="relative z-10 flex min-h-dvh w-full">
        <div className="flex-1 min-h-0 min-w-0 bg-transparent">
          <MiniMaxNavbarWrapper>
            <Navbar />
          </MiniMaxNavbarWrapper>
          <div className={cn('relative z-10 flex flex-1 flex-col min-w-0', topSpacingClassName)}>
            {showRollingBanner ? (
              <Suspense fallback={null}>
                <RollingAdBanner />
              </Suspense>
            ) : null}
            <div className={cn('min-w-0 px-2 sm:px-4', contentSpacingClassName, contentClassName)}>
              {children}
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  )
```

Also remove the old `h-px bg-border/30` line (line 42) since we replaced it with the gradient version. Remove the `shellVariant` prop references if unused or leave them for backward compat.

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/(landing)/components/marketing-layout-shell.tsx
git commit -m "feat: add dot grid, glow orb, gradient divider to MarketingLayoutShell"
```

---

### Task 5: AuthenticationLayoutShell — Glass card + dot grid

**Files:**
- Modify: `app/[locale]/(authentication)/client-layout.tsx`

Wrap the auth content in a glass card with centered layout on a dot-grid background.

- [ ] **Step 1: Update auth client layout**

Replace the `return` value in `client-layout.tsx`:

```
// Old:
  return (
    <div className="public-page">
      <RootProviders>{children}</RootProviders>
    </div>
  );
```

```
// New:
  return (
    <div className="min-h-dvh w-full bg-background bg-[radial-gradient(oklch(0.15_0.01_260)_0.8px,transparent_1px)] bg-[length:4px_4px]">
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-primary/[0.02] blur-3xl" />
      </div>
      <div className="relative z-10 flex min-h-dvh items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-border/20 bg-gradient-to-br from-card/60 to-card/10 p-8 ring-1 ring-inset ring-white/[0.02] shadow-[0_0_50px_-25px] shadow-primary/10">
          <RootProviders>{children}</RootProviders>
        </div>
      </div>
    </div>
  );
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/(authentication)/client-layout.tsx
git commit -m "feat: modernize auth layout with glass card and dot grid"
```

---

### Task 6: Sidebar — Glass-morphism with backdrop blur

**Files:**
- Modify: `components/ui/unified-sidebar.tsx`

The sidebar is used across dashboard, admin, and teams. Add a backdrop-blur glass effect.

- [ ] **Step 1: Add glass effect to sidebar panel**

Find the sidebar panel element (the main sidebar container). It's rendered by the `<Sidebar>` component from `@/components/ui/sidebar`. Read that file to identify the panel class.

Actually, the `UnifiedSidebar` wraps the `Sidebar` component. The Sidebar component likely lives in `components/ui/sidebar.tsx` or a sub-file. Let me check.

Read `components/ui/sidebar.tsx` and find the sidebar panel class. Then add `backdrop-blur-md bg-background/80` and a subtle border glow.

- [ ] **Step 2: Update active item styling**

Find the active nav item and add primary glow/ring:

```
// Add to active item classes:
'bg-primary/[0.06] ring-1 ring-inset ring-primary/20'
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/unified-sidebar.tsx
git commit -m "feat: add glass-morphism to sidebar"
```

---

### Task 7: Dashboard widget cards — Glass surface

**Files:**
- Modify: `app/[locale]/dashboard/components/widget-canvas.tsx`

The WidgetCanvas renders dashboard widgets. Each widget wrapper card should use the new glass surface.

- [ ] **Step 1: Find widget wrapper class in widget-canvas.tsx**

Read the file around line 331 to find where widget cards are rendered. Identify the card wrapper `className` and update it to match the new glass surface tokens.

- [ ] **Step 2: Update dashboard skeleton fallback**

In `app/[locale]/dashboard/page.tsx`, update the loading skeleton (lines 8-18 and 52-59) from:

```
<div
  key={i}
  className="h-32 animate-pulse rounded-xl border border-border/30 bg-muted/40"
/>
```

To:

```
<div
  key={i}
  className="h-32 animate-pulse rounded-xl border border-border/20 bg-gradient-to-br from-card/30 to-card/10 ring-1 ring-inset ring-white/[0.02]"
/>
```

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/dashboard/components/widget-canvas.tsx app/[locale]/dashboard/page.tsx
git commit -m "feat: modernize dashboard widget surfaces and skeletons"
```

---

### Task 8: Skeleton components — Glass style

**Files:**
- Modify: `components/ui/skeleton.tsx`

Update the base `Skeleton` component to use the glass-muted aesthetic.

- [ ] **Step 1: Update Skeleton base classes**

Change line 15 from:
```
"animate-pulse rounded-xl border border-border/30 bg-muted/60",
```

To:
```
"animate-pulse rounded-xl border border-border/20 bg-gradient-to-br from-muted/40 to-muted/10 ring-1 ring-inset ring-white/[0.02]",
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/skeleton.tsx
git commit -m "feat: update skeleton to glass-muted style"
```

---

### Task 9: Landing page error/loading/not-found states

**Files:**
- Modify: `app/[locale]/(landing)/error.tsx`
- Modify: `app/[locale]/(landing)/loading.tsx`
- Modify: `app/[locale]/(landing)/not-found.tsx` (if exists)

These pages use shared primitives (UnifiedSurface, UnifiedPageShell) so the main visual update happens via Tasks 1-4. But ensure error pages use the new glass card style.

- [ ] **Step 1: Verify shared components cascade correctly**

Check that `app/[locale]/(landing)/error.tsx` uses `UnifiedSurface` or `Card` — if so, it inherits the glass style automatically. If it uses raw HTML classes, update those manually.

Read each file and confirm. If raw classes are used, update them to match the glass surface tokens:

```
// Raw classes to update:
Old: "rounded-xl border border-border/30 bg-card"
New: "rounded-xl border border-border/20 bg-gradient-to-br from-card/50 to-card/10 ring-1 ring-inset ring-white/[0.02]"
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/(landing)/error.tsx app/[locale]/(landing)/loading.tsx
git commit -m "feat: update landing error/loading states to glass style"
```

---

### Task 10: Teams pages — Glass sidebar + equity grid

**Files:**
- Modify: `app/[locale]/teams/dashboard/[slug]/page.tsx`
- Modify: `app/[locale]/teams/dashboard/layout.tsx`

Teams uses the same sidebar and card patterns as dashboard. Verify the sidebar glass from Task 6 cascades correctly, and update any raw card classes in the equity grid.

- [ ] **Step 1: Update equity grid card classes if raw**

Read `app/[locale]/teams/dashboard/[slug]/page.tsx` and find card/stat rendering. Replace raw class strings with glass tokens if present.

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/teams/dashboard/[slug]/page.tsx
git commit -m "feat: modernize teams equity grid card surfaces"
```

---

### Task 11: Shared + Embed pages

**Files:**
- Modify: `app/[locale]/shared/[slug]/page.tsx` (or layout)
- Modify: `app/[locale]/embed/page.tsx`

Shared page uses `MarketingLayoutShell` (already updated in Task 4). Embed page renders chart modules — update module backgrounds to glass.

- [ ] **Step 1: Update embed chart module backgrounds**

Read `app/[locale]/embed/page.tsx` and find chart module wrapper classes. Update to:

```
// Old:
"rounded-xl border border-border/30 bg-card"
```

```
// New:
"rounded-xl border border-border/20 bg-gradient-to-br from-card/50 to-card/10 ring-1 ring-inset ring-white/[0.02]"
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/embed/page.tsx
git commit -m "feat: modernize embed chart module surfaces"
```

---

### Task 12: Data tables — Glass header + row hover

**Files:**
- Read and find the shared data table component used across dashboard and admin

Find the data table component (likely in `components/ui/` or `components/tables/`). Update the header row to have backdrop-blur glass effect, and row hover to use subtle primary tint.

- [ ] **Step 1: Identify shared table component**

Search for shared table component in the codebase (likely uses shadcn Table primitive).

- [ ] **Step 2: Add glass header + row hover**

Update table header class:
```
// Old:
"border-b border-border/30 bg-muted/30"
```

```
// New:
"border-b border-border/20 bg-gradient-to-br from-card/40 to-card/10 backdrop-blur-sm sticky top-0 z-10"
```

Update row hover:
```
// Old:
"hover:bg-muted/30"
```

```
// New:
"hover:bg-primary/[0.02] transition-colors duration-200"
```

- [ ] **Step 3: Commit**

```bash
git add <table-file-path>
git commit -m "feat: modernize data table with glass header and row hover"
```

---

## Summary of File Changes

| # | File | Change |
|---|------|--------|
| 1 | `components/ui/card.tsx` | Glass gradient variant for default/elevated, new hover glow |
| 2 | `components/layout/unified-page-shell.tsx` | Glass surfaces, glow orb, dot grid props, modern typography |
| 3 | `components/layout/marketing-sections.tsx` | Modern eyebrow, typography, icon containers, stats, section glow |
| 4 | `app/[locale]/(landing)/components/marketing-layout-shell.tsx` | Dot grid, glow orb, gradient top divider |
| 5 | `app/[locale]/(authentication)/client-layout.tsx` | Centered glass card on dot grid background |
| 6 | `components/ui/unified-sidebar.tsx` | Glass-morphism sidebar panel, active item glow |
| 7 | `app/[locale]/dashboard/components/widget-canvas.tsx` | Glass widget surfaces |
| 8 | `app/[locale]/dashboard/page.tsx` | Glass skeleton fallback |
| 9 | `components/ui/skeleton.tsx` | Glass-muted skeleton base |
| 10 | `app/[locale]/(landing)/error.tsx` + `loading.tsx` | Glass card fallback styles |
| 11 | `app/[locale]/teams/dashboard/[slug]/page.tsx` | Glass equity grid surfaces |
| 12 | `app/[locale]/embed/page.tsx` | Glass chart module backgrounds |
| 13 | Shared data table component | Glass header, row hover tint |

All 66 pages are covered through shared component inheritance. No per-page rewrites needed — updating these ~13 files cascades the new design tokens across every route group.
