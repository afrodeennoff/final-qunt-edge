# Full-Site Unified Product-Led Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a visual-only, product-led redesign across home, public landing pages, dashboard, teams, and admin using one shared shell, one surface system, one motion language, and one product-UI-plus-SVG media language without changing behavior.

**Architecture:** Build the redesign in four shippable tracks: shared visual foundations, Wave 1 public surfaces, Wave 2 dashboard/teams surfaces, and Wave 3 admin/internal surfaces. Every route refresh must re-use shared layout, motion, and CTA primitives first, and must not change route structure, APIs, auth, filters, calculations, or state behavior.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, existing `UnifiedPageShell` / `UnifiedSurface`, shared route recipes, Framer Motion, SVG overlays, ESLint, TypeScript typecheck.

---

## File Structure

### Shared foundations

- Modify: `components/layout/unified-page-shell.tsx`
  - Global shell spacing, atmosphere, border/shadow discipline, and header/surface defaults.
- Modify: `components/layout/unified-page-recipes.ts`
  - Shared hero/section/inset/metric/action recipe exports.
- Create: `components/layout/unified-hero-media.tsx`
  - Shared product-UI + SVG hero media block for home/public use.
- Modify: `components/animation/enhanced-motion.tsx`
  - Reusable staged reveal helpers that respect reduced motion.
- Modify: `app/globals.css`
  - Shared motion delay utilities, SVG utility classes, and non-gradient visual tokens.
- Modify: `components/ui/button.tsx`, `components/ui/card.tsx`, `components/ui/badge.tsx`
  - Align core CTA/surface primitives with the new product-led visual language without changing behavior.

### Wave 1: Home + public routes

- Modify: `app/[locale]/(home)/components/HomeContent.tsx`
- Modify: `app/[locale]/(home)/components/Hero.tsx`
- Modify: `app/[locale]/(home)/components/DashboardPreview.tsx`
- Modify: `app/[locale]/(home)/components/LiveStatsStrip.tsx`
- Modify: `app/[locale]/(home)/components/FeaturesBento.tsx`
- Modify: `app/[locale]/(home)/components/AIFeatures.tsx`
- Modify: `app/[locale]/(home)/components/HowItWorks.tsx`
- Modify: `app/[locale]/(home)/components/PricingSection.tsx`
- Modify: `app/[locale]/(landing)/components/marketing-layout-shell.tsx`
- Modify: `app/[locale]/(landing)/components/navbar.tsx`
- Modify: `app/[locale]/(landing)/components/footer.tsx`
- Modify: `app/[locale]/(landing)/deals/components/deals-experience.tsx`
- Modify: `app/[locale]/(landing)/propfirms/components/catalogue-experience.tsx`
- Modify: `app/[locale]/(landing)/leaderboard/page.tsx`
- Modify: `app/[locale]/(landing)/leaderboard/components/leaderboard-content.tsx`
- Modify: `app/[locale]/(landing)/leaderboard/components/leaderboard-table.tsx`
- Modify: `app/[locale]/(landing)/referral/page-client.tsx`
- Modify: `app/[locale]/(landing)/pricing/pricing-page-client.tsx`
- Modify: `app/[locale]/(landing)/support/page-client.tsx`
- Modify: `app/[locale]/(landing)/about/page.tsx`
- Modify: `app/[locale]/(landing)/faq/page.tsx`
- Modify: `app/[locale]/(landing)/docs/page.tsx`
- Modify: `app/[locale]/(landing)/blogs/page.tsx`
- Modify: `app/[locale]/(landing)/blogs/[slug]/page.tsx`
- Modify: `app/[locale]/(landing)/newsletter/page.tsx`
- Modify: `app/[locale]/(landing)/privacy/page.tsx`
- Modify: `app/[locale]/(landing)/terms/terms-page-client.tsx`
- Modify: `app/[locale]/(landing)/_updates/page.tsx`
- Modify: `app/[locale]/(landing)/_updates/[slug]/page.tsx`

### Wave 2: Dashboard + teams

- Modify: `app/[locale]/dashboard/components/dashboard-header.tsx`
- Modify: `app/[locale]/dashboard/components/navbar.tsx`
- Modify: `app/[locale]/dashboard/components/dashboard-tab-shell.tsx`
- Modify: `app/[locale]/dashboard/components/widget-canvas.tsx`
- Modify: `app/[locale]/dashboard/page.tsx`
- Modify: `app/[locale]/dashboard/behavior/page-client.tsx`
- Modify: `app/[locale]/dashboard/settings/page.tsx`
- Modify: `app/[locale]/dashboard/strategies/page.tsx`
- Modify: `app/[locale]/dashboard/trader-profile/page-client.tsx`
- Modify: `app/[locale]/dashboard/data/page.tsx`
- Modify: `app/[locale]/teams/(landing)/page-client.tsx`
- Modify: `app/[locale]/teams/components/teams-sidebar.tsx`
- Modify: `app/[locale]/teams/components/team-management.tsx`
- Modify: `app/[locale]/teams/dashboard/[slug]/page.tsx`
- Modify: `app/[locale]/teams/dashboard/[slug]/analytics/page.tsx`
- Modify: `app/[locale]/teams/dashboard/[slug]/members/page.tsx`
- Modify: `app/[locale]/teams/dashboard/[slug]/traders/page.tsx`

### Wave 3: Admin + internal tools

- Modify: `app/[locale]/admin/components/sidebar-nav.tsx`
- Modify: `app/[locale]/admin/components/form-action-button.tsx`
- Modify: `app/[locale]/admin/page.tsx`
- Modify: `app/[locale]/admin/components/dashboard/admin-dashboard.tsx`
- Modify: `app/[locale]/admin/coupons/page.tsx`
- Modify: `app/[locale]/admin/propfirms/page.tsx`
- Modify: `app/[locale]/admin/propfirms/[id]/page.tsx`
- Modify: `app/[locale]/admin/reviews/page.tsx`
- Modify: `app/[locale]/admin/newsletter-builder/page.tsx`
- Modify: `app/[locale]/admin/send-email/page.tsx`
- Modify: `app/[locale]/admin/components/send-email/send-email-page-client.tsx`
- Modify: `app/[locale]/admin/weekly-recap/page.tsx`
- Modify: `app/[locale]/admin/welcome-email/page.tsx`
- Modify: `app/[locale]/admin/blogs/page.tsx`
- Modify: `app/[locale]/admin/blogs/components/blog-form.tsx`

## Task 1: Shared Visual Foundation

**Files:**
- Create: `components/layout/unified-hero-media.tsx`
- Modify: `components/layout/unified-page-shell.tsx`
- Modify: `components/layout/unified-page-recipes.ts`
- Modify: `components/animation/enhanced-motion.tsx`
- Modify: `app/globals.css`
- Modify: `components/ui/button.tsx`
- Modify: `components/ui/card.tsx`
- Modify: `components/ui/badge.tsx`
- Test: `npx eslint 'components/layout/unified-hero-media.tsx' 'components/layout/unified-page-shell.tsx' 'components/layout/unified-page-recipes.ts' 'components/animation/enhanced-motion.tsx' 'components/ui/button.tsx' 'components/ui/card.tsx' 'components/ui/badge.tsx'`

- [ ] **Step 1: Add the shared hero media primitive**

```tsx
// components/layout/unified-hero-media.tsx
type UnifiedHeroMediaProps = {
  screenshot: React.ReactNode
  overlay?: React.ReactNode
  caption?: React.ReactNode
  className?: string
}

export function UnifiedHeroMedia({
  screenshot,
  overlay,
  caption,
  className,
}: UnifiedHeroMediaProps) {
  return (
    <div className={cn(unifiedHeroPanelClassName, 'relative overflow-hidden', className)}>
      <div className="relative z-10">{screenshot}</div>
      {overlay ? <div className="pointer-events-none absolute inset-0 z-20">{overlay}</div> : null}
      {caption ? <div className="absolute inset-x-4 bottom-4 z-30">{caption}</div> : null}
    </div>
  )
}
```

- [ ] **Step 2: Normalize the shared shell defaults**

```tsx
// components/layout/unified-page-shell.tsx
<div
  className={cn(
    'scroll-smooth-butter animate-page-enter relative mx-auto w-full',
    widthClassName === 'max-w-none' && 'max-w-[1800px]',
    'px-4 sm:px-6 lg:px-8 xl:px-12',
    densityClasses,
    variant !== 'minimal' && [
      'before:absolute before:inset-0 before:pointer-events-none before:z-0',
      'before:bg-[radial-gradient(ellipse_72%_48%_at_50%_-18%,hsl(var(--primary)/0.14),transparent)]',
      'after:absolute after:inset-x-0 after:top-0 after:h-px after:pointer-events-none after:z-0',
      'after:bg-gradient-to-r after:from-transparent after:via-border/35 after:to-transparent',
    ],
  )}
>
```

- [ ] **Step 3: Add staged motion helpers with no gradient language**

```css
/* app/globals.css */
.animate-fade-up-smooth {
  animation: fade-up-smooth 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.animate-scale-reveal {
  animation: scale-reveal 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.animate-fade-up-smooth-d1 { animation-delay: 0.08s; }
.animate-fade-up-smooth-d2 { animation-delay: 0.16s; }
.animate-fade-up-smooth-d3 { animation-delay: 0.24s; }
.animate-fade-up-smooth-d4 { animation-delay: 0.32s; }
.animate-scale-reveal-d1 { animation-delay: 0.08s; }
.animate-scale-reveal-d2 { animation-delay: 0.16s; }
.animate-scale-reveal-d3 { animation-delay: 0.24s; }
```

- [ ] **Step 4: Align primitive CTA and surface defaults**

```tsx
// components/layout/unified-page-recipes.ts
export const unifiedPrimaryActionClassName =
  'inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_16px_28px_-16px_hsl(var(--primary)/0.85)] transition-[transform,background-color,box-shadow,filter] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-primary/90'

export const unifiedGhostActionClassName =
  'inline-flex items-center justify-center gap-2 rounded-full border border-border/40 bg-card/50 px-4 py-2.5 text-sm font-medium text-foreground transition-[transform,background-color,border-color,box-shadow,color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/10'
```

- [ ] **Step 5: Verify the shared foundation compiles cleanly**

Run:

```bash
npx eslint 'components/layout/unified-hero-media.tsx' 'components/layout/unified-page-shell.tsx' 'components/layout/unified-page-recipes.ts' 'components/animation/enhanced-motion.tsx' 'components/ui/button.tsx' 'components/ui/card.tsx' 'components/ui/badge.tsx'
npx tsc --noEmit
```

Expected:

- ESLint exits `0`
- TypeScript exits `0`

- [ ] **Step 6: Commit the shared foundation**

```bash
git add components/layout/unified-hero-media.tsx components/layout/unified-page-shell.tsx components/layout/unified-page-recipes.ts components/animation/enhanced-motion.tsx app/globals.css components/ui/button.tsx components/ui/card.tsx components/ui/badge.tsx
git commit -m "feat: add unified visual foundation"
```

## Task 2: Rebuild the Home Hero Around Product UI + SVG

**Files:**
- Modify: `app/[locale]/(home)/components/Hero.tsx`
- Modify: `app/[locale]/(home)/components/DashboardPreview.tsx`
- Modify: `app/[locale]/(home)/components/HomeContent.tsx`
- Test: `npx eslint 'app/[locale]/(home)/components/Hero.tsx' 'app/[locale]/(home)/components/DashboardPreview.tsx' 'app/[locale]/(home)/components/HomeContent.tsx'`

- [ ] **Step 1: Replace the current hero scaffold with a single dominant canvas**

```tsx
// app/[locale]/(home)/components/Hero.tsx
<section className="relative isolate overflow-hidden px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
  <div className="mx-auto grid max-w-[1360px] gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)] xl:items-end">
    <div className="space-y-6">
      <span className={unifiedChipClassName}>Qunt Edge</span>
      <h1 className="max-w-3xl text-[clamp(2.8rem,6vw,6rem)] font-medium leading-[0.94] tracking-[-0.05em] text-foreground">
        Audit execution. Not just outcomes.
      </h1>
      <p className="max-w-xl text-sm leading-[1.7] text-muted-foreground sm:text-base">
        The clinical operating layer for discretionary traders, teams, and review-led workflows.
      </p>
    </div>
    <UnifiedHeroMedia screenshot={<DashboardPreview />} overlay={<SignalOverlay />} />
  </div>
</section>
```

- [ ] **Step 2: Add the restrained SVG overlay**

```tsx
// app/[locale]/(home)/components/Hero.tsx
function SignalOverlay() {
  return (
    <svg viewBox="0 0 800 520" className="h-full w-full">
      <path
        d="M32 420 C120 380, 184 354, 248 296 C314 238, 358 202, 438 188 C528 172, 592 132, 742 74"
        className="stroke-foreground/75"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M118 404 C212 364, 268 330, 340 256 C394 198, 452 170, 548 152"
        className="stroke-primary/55"
        strokeWidth="1.5"
        strokeDasharray="6 12"
        fill="none"
      />
    </svg>
  )
}
```

- [ ] **Step 3: Remove duplicate hero-adjacent clutter from `HomeContent`**

```tsx
// app/[locale]/(home)/components/HomeContent.tsx
<main className="relative z-10 mx-auto w-full max-w-[1360px] min-w-0">
  <Hero locale={locale} />
  <TrustAndProof />
  <ProblemStatement />
  <FeaturesBento />
  <HowItWorks />
  <AnalysisDemo />
  <AudienceSegmentation />
  <PropFirmsExplorer locale={locale} />
  <PricingSection locale={locale} />
  <FAQSection />
  <FinalCTA locale={locale} />
</main>
```

- [ ] **Step 4: Verify the home hero is visual-only and responsive**

Run:

```bash
npx eslint 'app/[locale]/(home)/components/Hero.tsx' 'app/[locale]/(home)/components/DashboardPreview.tsx' 'app/[locale]/(home)/components/HomeContent.tsx'
npx tsc --noEmit
```

Expected:

- ESLint exits `0`
- TypeScript exits `0`

- [ ] **Step 5: Commit the home hero pass**

```bash
git add app/[locale]/(home)/components/Hero.tsx app/[locale]/(home)/components/DashboardPreview.tsx app/[locale]/(home)/components/HomeContent.tsx
git commit -m "feat: redesign home hero system"
```

## Task 3: Normalize the Remaining Home Narrative Sections

**Files:**
- Modify: `app/[locale]/(home)/components/LiveStatsStrip.tsx`
- Modify: `app/[locale]/(home)/components/FeaturesBento.tsx`
- Modify: `app/[locale]/(home)/components/AIFeatures.tsx`
- Modify: `app/[locale]/(home)/components/HowItWorks.tsx`
- Modify: `app/[locale]/(home)/components/PricingSection.tsx`
- Modify: `app/[locale]/(home)/components/FAQSection.tsx`
- Test: `npx eslint 'app/[locale]/(home)/components/LiveStatsStrip.tsx' 'app/[locale]/(home)/components/FeaturesBento.tsx' 'app/[locale]/(home)/components/AIFeatures.tsx' 'app/[locale]/(home)/components/HowItWorks.tsx' 'app/[locale]/(home)/components/PricingSection.tsx' 'app/[locale]/(home)/components/FAQSection.tsx'`

- [ ] **Step 1: Apply the same shell and section rhythm**

```tsx
// pattern for each home section
<section className={cn(unifiedSectionPanelClassName, 'animate-fade-up-smooth p-5 sm:p-6 lg:p-8')}>
  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Section label
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        Section headline
      </h2>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Replace leftover marketing-card styling with shared inset modules**

```tsx
<div className={cn(unifiedInsetPanelClassName, 'p-4 sm:p-5')}>
  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
    Proof point
  </p>
  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
    Content stays the same; only the presentation changes.
  </p>
</div>
```

- [ ] **Step 3: Stage section entrances without changing content logic**

```tsx
<section className="animate-fade-up-smooth animate-fade-up-smooth-d2">
  {/* existing content and data hooks remain unchanged */}
</section>
```

- [ ] **Step 4: Verify the home narrative sections**

Run:

```bash
npx eslint 'app/[locale]/(home)/components/LiveStatsStrip.tsx' 'app/[locale]/(home)/components/FeaturesBento.tsx' 'app/[locale]/(home)/components/AIFeatures.tsx' 'app/[locale]/(home)/components/HowItWorks.tsx' 'app/[locale]/(home)/components/PricingSection.tsx' 'app/[locale]/(home)/components/FAQSection.tsx'
npx tsc --noEmit
```

Expected:

- ESLint exits `0`
- TypeScript exits `0`

- [ ] **Step 5: Commit the home narrative pass**

```bash
git add app/[locale]/(home)/components/LiveStatsStrip.tsx app/[locale]/(home)/components/FeaturesBento.tsx app/[locale]/(home)/components/AIFeatures.tsx app/[locale]/(home)/components/HowItWorks.tsx app/[locale]/(home)/components/PricingSection.tsx app/[locale]/(home)/components/FAQSection.tsx
git commit -m "feat: unify home narrative sections"
```

## Task 4: Unify the Global Public Shell and Core Public Routes

**Files:**
- Modify: `app/[locale]/(landing)/components/marketing-layout-shell.tsx`
- Modify: `app/[locale]/(landing)/components/navbar.tsx`
- Modify: `app/[locale]/(landing)/components/footer.tsx`
- Modify: `app/[locale]/(landing)/deals/components/deals-experience.tsx`
- Modify: `app/[locale]/(landing)/propfirms/components/catalogue-experience.tsx`
- Modify: `app/[locale]/(landing)/leaderboard/page.tsx`
- Modify: `app/[locale]/(landing)/leaderboard/components/leaderboard-content.tsx`
- Modify: `app/[locale]/(landing)/leaderboard/components/leaderboard-table.tsx`
- Modify: `app/[locale]/(landing)/referral/page-client.tsx`
- Modify: `app/[locale]/(landing)/pricing/pricing-page-client.tsx`
- Test: `npx eslint 'app/[locale]/(landing)/components/marketing-layout-shell.tsx' 'app/[locale]/(landing)/components/navbar.tsx' 'app/[locale]/(landing)/components/footer.tsx' 'app/[locale]/(landing)/deals/components/deals-experience.tsx' 'app/[locale]/(landing)/propfirms/components/catalogue-experience.tsx' 'app/[locale]/(landing)/leaderboard/page.tsx' 'app/[locale]/(landing)/leaderboard/components/leaderboard-content.tsx' 'app/[locale]/(landing)/leaderboard/components/leaderboard-table.tsx' 'app/[locale]/(landing)/referral/page-client.tsx' 'app/[locale]/(landing)/pricing/pricing-page-client.tsx'`

- [ ] **Step 1: Make the public shell neutral and product-led**

```tsx
// app/[locale]/(landing)/components/marketing-layout-shell.tsx
<div className="min-h-screen bg-background text-foreground">
  <Navbar />
  <div className="relative">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_40%)]" />
    {children}
  </div>
  <Footer />
</div>
```

- [ ] **Step 2: Treat `/deals` as the public reference implementation**

```tsx
// use the same structure in other routes
<UnifiedPageShell widthClassName="max-w-[1360px]" className="py-12 sm:py-16">
  <div className="space-y-6">
    <section className={cn(unifiedHeroPanelClassName, 'p-6 sm:p-8 lg:p-10')}>{/* hero */}</section>
    <section className={cn(unifiedSectionPanelClassName, 'p-5 sm:p-6')}>{/* board */}</section>
  </div>
</UnifiedPageShell>
```

- [ ] **Step 3: Replace route-local card recipes with shared recipes**

```tsx
// app/[locale]/(landing)/leaderboard/components/leaderboard-content.tsx
<section className={cn(unifiedHeroPanelClassName, 'animate-fade-up-smooth p-6 sm:p-8 lg:p-10')}>
  {/* existing leaderboard data and sort logic remain unchanged */}
</section>
```

- [ ] **Step 4: Verify the shell and core public routes**

Run:

```bash
npx eslint 'app/[locale]/(landing)/components/marketing-layout-shell.tsx' 'app/[locale]/(landing)/components/navbar.tsx' 'app/[locale]/(landing)/components/footer.tsx' 'app/[locale]/(landing)/deals/components/deals-experience.tsx' 'app/[locale]/(landing)/propfirms/components/catalogue-experience.tsx' 'app/[locale]/(landing)/leaderboard/page.tsx' 'app/[locale]/(landing)/leaderboard/components/leaderboard-content.tsx' 'app/[locale]/(landing)/leaderboard/components/leaderboard-table.tsx' 'app/[locale]/(landing)/referral/page-client.tsx' 'app/[locale]/(landing)/pricing/pricing-page-client.tsx'
npx tsc --noEmit
```

Expected:

- ESLint exits `0`
- TypeScript exits `0`

- [ ] **Step 5: Commit the shell + core public routes**

```bash
git add app/[locale]/(landing)/components/marketing-layout-shell.tsx app/[locale]/(landing)/components/navbar.tsx app/[locale]/(landing)/components/footer.tsx app/[locale]/(landing)/deals/components/deals-experience.tsx app/[locale]/(landing)/propfirms/components/catalogue-experience.tsx app/[locale]/(landing)/leaderboard/page.tsx app/[locale]/(landing)/leaderboard/components/leaderboard-content.tsx app/[locale]/(landing)/leaderboard/components/leaderboard-table.tsx app/[locale]/(landing)/referral/page-client.tsx app/[locale]/(landing)/pricing/pricing-page-client.tsx
git commit -m "feat: unify public shell and core routes"
```

## Task 5: Unify the Remaining Public Content Routes

**Files:**
- Modify: `app/[locale]/(landing)/support/page-client.tsx`
- Modify: `app/[locale]/(landing)/about/page.tsx`
- Modify: `app/[locale]/(landing)/faq/page.tsx`
- Modify: `app/[locale]/(landing)/docs/page.tsx`
- Modify: `app/[locale]/(landing)/blogs/page.tsx`
- Modify: `app/[locale]/(landing)/blogs/[slug]/page.tsx`
- Modify: `app/[locale]/(landing)/newsletter/page.tsx`
- Modify: `app/[locale]/(landing)/privacy/page.tsx`
- Modify: `app/[locale]/(landing)/terms/terms-page-client.tsx`
- Modify: `app/[locale]/(landing)/_updates/page.tsx`
- Modify: `app/[locale]/(landing)/_updates/[slug]/page.tsx`
- Test: `npx eslint 'app/[locale]/(landing)/support/page-client.tsx' 'app/[locale]/(landing)/about/page.tsx' 'app/[locale]/(landing)/faq/page.tsx' 'app/[locale]/(landing)/docs/page.tsx' 'app/[locale]/(landing)/blogs/page.tsx' 'app/[locale]/(landing)/blogs/[slug]/page.tsx' 'app/[locale]/(landing)/newsletter/page.tsx' 'app/[locale]/(landing)/privacy/page.tsx' 'app/[locale]/(landing)/terms/terms-page-client.tsx' 'app/[locale]/(landing)/_updates/page.tsx' 'app/[locale]/(landing)/_updates/[slug]/page.tsx'`

- [ ] **Step 1: Use the same hero + content board formula on utility pages**

```tsx
// app/[locale]/(landing)/about/page.tsx
<UnifiedPageShell widthClassName="max-w-[1280px]" className="py-12 sm:py-16">
  <div className="space-y-6">
    <section className={cn(unifiedHeroPanelClassName, 'p-6 sm:p-8')}>
      {/* title + description only */}
    </section>
    <section className={cn(unifiedSectionPanelClassName, 'p-5 sm:p-6')}>
      {/* existing rich content */}
    </section>
  </div>
</UnifiedPageShell>
```

- [ ] **Step 2: Normalize dense/article routes with the same typography and inset modules**

```tsx
// app/[locale]/(landing)/blogs/[slug]/page.tsx
<article className={cn(unifiedSectionPanelClassName, 'mx-auto max-w-[880px] p-6 sm:p-8')}>
  <header className="border-b border-border/35 pb-6">
    {/* existing metadata + title */}
  </header>
  <div className="prose prose-invert mt-6 max-w-none">{/* existing article content */}</div>
</article>
```

- [ ] **Step 3: Apply staged entrances without changing data loading**

```tsx
<section className="animate-fade-up-smooth animate-fade-up-smooth-d2">
  {/* server data and route behavior stay the same */}
</section>
```

- [ ] **Step 4: Verify the long-tail public routes**

Run:

```bash
npx eslint 'app/[locale]/(landing)/support/page-client.tsx' 'app/[locale]/(landing)/about/page.tsx' 'app/[locale]/(landing)/faq/page.tsx' 'app/[locale]/(landing)/docs/page.tsx' 'app/[locale]/(landing)/blogs/page.tsx' 'app/[locale]/(landing)/blogs/[slug]/page.tsx' 'app/[locale]/(landing)/newsletter/page.tsx' 'app/[locale]/(landing)/privacy/page.tsx' 'app/[locale]/(landing)/terms/terms-page-client.tsx' 'app/[locale]/(landing)/_updates/page.tsx' 'app/[locale]/(landing)/_updates/[slug]/page.tsx'
npx tsc --noEmit
```

Expected:

- ESLint exits `0`
- TypeScript exits `0`

- [ ] **Step 5: Commit the long-tail public routes**

```bash
git add app/[locale]/(landing)/support/page-client.tsx app/[locale]/(landing)/about/page.tsx app/[locale]/(landing)/faq/page.tsx app/[locale]/(landing)/docs/page.tsx app/[locale]/(landing)/blogs/page.tsx app/[locale]/(landing)/blogs/[slug]/page.tsx app/[locale]/(landing)/newsletter/page.tsx app/[locale]/(landing)/privacy/page.tsx app/[locale]/(landing)/terms/terms-page-client.tsx app/[locale]/(landing)/_updates/page.tsx app/[locale]/(landing)/_updates/[slug]/page.tsx
git commit -m "feat: unify public content routes"
```

## Task 6: Normalize Shared Dashboard Chrome

**Files:**
- Modify: `app/[locale]/dashboard/components/dashboard-header.tsx`
- Modify: `app/[locale]/dashboard/components/navbar.tsx`
- Modify: `app/[locale]/dashboard/components/dashboard-tab-shell.tsx`
- Modify: `app/[locale]/dashboard/components/widget-canvas.tsx`
- Modify: `components/ui/sidebar.tsx`
- Modify: `components/ui/unified-sidebar.tsx`
- Test: `npx eslint 'app/[locale]/dashboard/components/dashboard-header.tsx' 'app/[locale]/dashboard/components/navbar.tsx' 'app/[locale]/dashboard/components/dashboard-tab-shell.tsx' 'app/[locale]/dashboard/components/widget-canvas.tsx' 'components/ui/sidebar.tsx' 'components/ui/unified-sidebar.tsx'`

- [ ] **Step 1: Align dashboard chrome with the public system**

```tsx
// app/[locale]/dashboard/components/dashboard-header.tsx
<header className={cn(unifiedSectionPanelClassName, 'p-4 sm:p-5')}>
  <div className="flex flex-wrap items-center justify-between gap-3">
    {/* existing actions and controls remain unchanged */}
  </div>
</header>
```

- [ ] **Step 2: Reduce route-local bright outlines and pill drift**

```tsx
// app/[locale]/dashboard/components/navbar.tsx
className="border-border/40 bg-background/80 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.88)] transition-[opacity,background-color,border-color]"
```

- [ ] **Step 3: Keep widget chrome transparent in layout containers**

```tsx
// app/[locale]/dashboard/components/widget-canvas.tsx
<div className="min-w-0 rounded-[inherit] bg-transparent">
  {/* widget surfaces own their own borders/backgrounds */}
</div>
```

- [ ] **Step 4: Verify dashboard chrome**

Run:

```bash
npx eslint 'app/[locale]/dashboard/components/dashboard-header.tsx' 'app/[locale]/dashboard/components/navbar.tsx' 'app/[locale]/dashboard/components/dashboard-tab-shell.tsx' 'app/[locale]/dashboard/components/widget-canvas.tsx' 'components/ui/sidebar.tsx' 'components/ui/unified-sidebar.tsx'
npx tsc --noEmit
```

Expected:

- ESLint exits `0`
- TypeScript exits `0`

- [ ] **Step 5: Commit dashboard chrome**

```bash
git add app/[locale]/dashboard/components/dashboard-header.tsx app/[locale]/dashboard/components/navbar.tsx app/[locale]/dashboard/components/dashboard-tab-shell.tsx app/[locale]/dashboard/components/widget-canvas.tsx components/ui/sidebar.tsx components/ui/unified-sidebar.tsx
git commit -m "feat: unify dashboard chrome"
```

## Task 7: Refresh Dashboard Feature Pages Without Logic Changes

**Files:**
- Modify: `app/[locale]/dashboard/page.tsx`
- Modify: `app/[locale]/dashboard/behavior/page-client.tsx`
- Modify: `app/[locale]/dashboard/settings/page.tsx`
- Modify: `app/[locale]/dashboard/strategies/page.tsx`
- Modify: `app/[locale]/dashboard/trader-profile/page-client.tsx`
- Modify: `app/[locale]/dashboard/data/page.tsx`
- Test: `npx eslint 'app/[locale]/dashboard/page.tsx' 'app/[locale]/dashboard/behavior/page-client.tsx' 'app/[locale]/dashboard/settings/page.tsx' 'app/[locale]/dashboard/strategies/page.tsx' 'app/[locale]/dashboard/trader-profile/page-client.tsx' 'app/[locale]/dashboard/data/page.tsx'`

- [ ] **Step 1: Apply the product workspace rhythm consistently**

```tsx
// pattern for dashboard route pages
<UnifiedPageShell density="compact" widthClassName="max-w-[1720px]">
  <div className="space-y-4 sm:space-y-5 lg:space-y-6">
    <section className={cn(unifiedSectionPanelClassName, 'p-5 sm:p-6')}>{/* brief / controls */}</section>
    <section className={cn(unifiedSectionPanelClassName, 'p-5 sm:p-6')}>{/* main surface */}</section>
  </div>
</UnifiedPageShell>
```

- [ ] **Step 2: Keep existing trader-profile, behavior, and settings logic intact**

```tsx
// app/[locale]/dashboard/trader-profile/page-client.tsx
// keep:
// - leaderboard visibility toggle
// - review window filters
// - benchmark fetch
// - calendar selection
// - trade pagination
// only replace layout/surface classes and motion classes
```

- [ ] **Step 3: Restyle loading and empty states to match the unified system**

```tsx
<div className="rounded-[1.4rem] border border-border/35 bg-card/60 p-5 text-sm text-muted-foreground">
  No data yet for this section.
</div>
```

- [ ] **Step 4: Verify the major dashboard pages**

Run:

```bash
npx eslint 'app/[locale]/dashboard/page.tsx' 'app/[locale]/dashboard/behavior/page-client.tsx' 'app/[locale]/dashboard/settings/page.tsx' 'app/[locale]/dashboard/strategies/page.tsx' 'app/[locale]/dashboard/trader-profile/page-client.tsx' 'app/[locale]/dashboard/data/page.tsx'
npx tsc --noEmit
```

Expected:

- ESLint exits `0`
- TypeScript exits `0`

- [ ] **Step 5: Commit the dashboard route pass**

```bash
git add app/[locale]/dashboard/page.tsx app/[locale]/dashboard/behavior/page-client.tsx app/[locale]/dashboard/settings/page.tsx app/[locale]/dashboard/strategies/page.tsx app/[locale]/dashboard/trader-profile/page-client.tsx app/[locale]/dashboard/data/page.tsx
git commit -m "feat: unify dashboard feature pages"
```

## Task 8: Refresh Teams Surfaces

**Files:**
- Modify: `app/[locale]/teams/(landing)/page-client.tsx`
- Modify: `app/[locale]/teams/components/teams-sidebar.tsx`
- Modify: `app/[locale]/teams/components/team-management.tsx`
- Modify: `app/[locale]/teams/dashboard/[slug]/page.tsx`
- Modify: `app/[locale]/teams/dashboard/[slug]/analytics/page.tsx`
- Modify: `app/[locale]/teams/dashboard/[slug]/members/page.tsx`
- Modify: `app/[locale]/teams/dashboard/[slug]/traders/page.tsx`
- Test: `npx eslint 'app/[locale]/teams/(landing)/page-client.tsx' 'app/[locale]/teams/components/teams-sidebar.tsx' 'app/[locale]/teams/components/team-management.tsx' 'app/[locale]/teams/dashboard/[slug]/page.tsx' 'app/[locale]/teams/dashboard/[slug]/analytics/page.tsx' 'app/[locale]/teams/dashboard/[slug]/members/page.tsx' 'app/[locale]/teams/dashboard/[slug]/traders/page.tsx'`

- [ ] **Step 1: Bring the teams landing page onto the same public system**

```tsx
// app/[locale]/teams/(landing)/page-client.tsx
<UnifiedPageShell widthClassName="max-w-[1360px]" className="py-12 sm:py-16">
  <section className={cn(unifiedHeroPanelClassName, 'p-6 sm:p-8 lg:p-10')}>
    {/* existing teams content rewritten visually only */}
  </section>
</UnifiedPageShell>
```

- [ ] **Step 2: Bring teams workspace routes onto the dashboard workspace rhythm**

```tsx
// app/[locale]/teams/dashboard/[slug]/page.tsx
<div className="space-y-5">
  <section className={cn(unifiedSectionPanelClassName, 'p-5 sm:p-6')}>{/* summary */}</section>
  <section className={cn(unifiedSectionPanelClassName, 'p-5 sm:p-6')}>{/* member/trader board */}</section>
</div>
```

- [ ] **Step 3: Keep all team membership and analytics logic untouched**

```tsx
// guardrail comment for worker
// do not change:
// - auth checks
// - join/invite behavior
// - analytics queries
// - member/trader route params
```

- [ ] **Step 4: Verify teams**

Run:

```bash
npx eslint 'app/[locale]/teams/(landing)/page-client.tsx' 'app/[locale]/teams/components/teams-sidebar.tsx' 'app/[locale]/teams/components/team-management.tsx' 'app/[locale]/teams/dashboard/[slug]/page.tsx' 'app/[locale]/teams/dashboard/[slug]/analytics/page.tsx' 'app/[locale]/teams/dashboard/[slug]/members/page.tsx' 'app/[locale]/teams/dashboard/[slug]/traders/page.tsx'
npx tsc --noEmit
```

Expected:

- ESLint exits `0`
- TypeScript exits `0`

- [ ] **Step 5: Commit the teams pass**

```bash
git add app/[locale]/teams/(landing)/page-client.tsx app/[locale]/teams/components/teams-sidebar.tsx app/[locale]/teams/components/team-management.tsx app/[locale]/teams/dashboard/[slug]/page.tsx app/[locale]/teams/dashboard/[slug]/analytics/page.tsx app/[locale]/teams/dashboard/[slug]/members/page.tsx app/[locale]/teams/dashboard/[slug]/traders/page.tsx
git commit -m "feat: unify teams surfaces"
```

## Task 9: Refresh Admin + Internal Tools

**Files:**
- Modify: `app/[locale]/admin/components/sidebar-nav.tsx`
- Modify: `app/[locale]/admin/components/form-action-button.tsx`
- Modify: `app/[locale]/admin/page.tsx`
- Modify: `app/[locale]/admin/components/dashboard/admin-dashboard.tsx`
- Modify: `app/[locale]/admin/coupons/page.tsx`
- Modify: `app/[locale]/admin/propfirms/page.tsx`
- Modify: `app/[locale]/admin/propfirms/[id]/page.tsx`
- Modify: `app/[locale]/admin/reviews/page.tsx`
- Modify: `app/[locale]/admin/newsletter-builder/page.tsx`
- Modify: `app/[locale]/admin/send-email/page.tsx`
- Modify: `app/[locale]/admin/components/send-email/send-email-page-client.tsx`
- Modify: `app/[locale]/admin/weekly-recap/page.tsx`
- Modify: `app/[locale]/admin/welcome-email/page.tsx`
- Modify: `app/[locale]/admin/blogs/page.tsx`
- Modify: `app/[locale]/admin/blogs/components/blog-form.tsx`
- Test: `npx eslint 'app/[locale]/admin/components/sidebar-nav.tsx' 'app/[locale]/admin/components/form-action-button.tsx' 'app/[locale]/admin/page.tsx' 'app/[locale]/admin/components/dashboard/admin-dashboard.tsx' 'app/[locale]/admin/coupons/page.tsx' 'app/[locale]/admin/propfirms/page.tsx' 'app/[locale]/admin/propfirms/[id]/page.tsx' 'app/[locale]/admin/reviews/page.tsx' 'app/[locale]/admin/newsletter-builder/page.tsx' 'app/[locale]/admin/send-email/page.tsx' 'app/[locale]/admin/components/send-email/send-email-page-client.tsx' 'app/[locale]/admin/weekly-recap/page.tsx' 'app/[locale]/admin/welcome-email/page.tsx' 'app/[locale]/admin/blogs/page.tsx' 'app/[locale]/admin/blogs/components/blog-form.tsx'`

- [ ] **Step 1: Unify admin shell, sidebar, and action controls**

```tsx
// app/[locale]/admin/components/sidebar-nav.tsx
// visual-only changes:
className="border-border/40 bg-card/70 text-foreground shadow-[0_20px_44px_-34px_rgba(0,0,0,0.88)]"
```

- [ ] **Step 2: Apply the same page brief + control rail + main surface layout**

```tsx
// app/[locale]/admin/page.tsx
<UnifiedPageShell density="compact" widthClassName="max-w-[1600px]">
  <div className="space-y-5">
    <section className={cn(unifiedSectionPanelClassName, 'p-5 sm:p-6')}>{/* brief */}</section>
    <section className={cn(unifiedSectionPanelClassName, 'p-5 sm:p-6')}>{/* main admin board */}</section>
  </div>
</UnifiedPageShell>
```

- [ ] **Step 3: Keep all admin mutations and form behavior intact**

```tsx
// guardrail for worker
// do not change:
// - server action imports
// - admin auth assertions
// - form field names
// - success/error redirect flow
// - existing optimistic/pending behavior
```

- [ ] **Step 4: Verify admin**

Run:

```bash
npx eslint 'app/[locale]/admin/components/sidebar-nav.tsx' 'app/[locale]/admin/components/form-action-button.tsx' 'app/[locale]/admin/page.tsx' 'app/[locale]/admin/components/dashboard/admin-dashboard.tsx' 'app/[locale]/admin/coupons/page.tsx' 'app/[locale]/admin/propfirms/page.tsx' 'app/[locale]/admin/propfirms/[id]/page.tsx' 'app/[locale]/admin/reviews/page.tsx' 'app/[locale]/admin/newsletter-builder/page.tsx' 'app/[locale]/admin/send-email/page.tsx' 'app/[locale]/admin/components/send-email/send-email-page-client.tsx' 'app/[locale]/admin/weekly-recap/page.tsx' 'app/[locale]/admin/welcome-email/page.tsx' 'app/[locale]/admin/blogs/page.tsx' 'app/[locale]/admin/blogs/components/blog-form.tsx'
npx tsc --noEmit
```

Expected:

- ESLint exits `0`
- TypeScript exits `0`

- [ ] **Step 5: Commit the admin pass**

```bash
git add app/[locale]/admin/components/sidebar-nav.tsx app/[locale]/admin/components/form-action-button.tsx app/[locale]/admin/page.tsx app/[locale]/admin/components/dashboard/admin-dashboard.tsx app/[locale]/admin/coupons/page.tsx app/[locale]/admin/propfirms/page.tsx app/[locale]/admin/propfirms/[id]/page.tsx app/[locale]/admin/reviews/page.tsx app/[locale]/admin/newsletter-builder/page.tsx app/[locale]/admin/send-email/page.tsx app/[locale]/admin/components/send-email/send-email-page-client.tsx app/[locale]/admin/weekly-recap/page.tsx app/[locale]/admin/welcome-email/page.tsx app/[locale]/admin/blogs/page.tsx app/[locale]/admin/blogs/components/blog-form.tsx
git commit -m "feat: unify admin surfaces"
```

## Task 10: Final Verification and Documentation

**Files:**
- Modify: `t/memory`
- Modify: `t/lessons`
- Modify: `p/AGENTS.md`
- Test: `npx tsc --noEmit`

- [ ] **Step 1: Run the full visual verification sweep**

Run:

```bash
npx tsc --noEmit
```

Expected:

- TypeScript exits `0`

- [ ] **Step 2: Run grouped lint passes**

Run:

```bash
npx eslint 'app/[locale]/(home)/components/Hero.tsx' 'app/[locale]/(landing)/components/marketing-layout-shell.tsx' 'app/[locale]/dashboard/trader-profile/page-client.tsx' 'app/[locale]/teams/(landing)/page-client.tsx' 'app/[locale]/admin/page.tsx'
```

Expected:

- ESLint exits `0`
- If pre-existing complexity warnings remain on large route files, record them explicitly without broadening scope

- [ ] **Step 3: Perform manual responsive review**

Review in browser:

- home hero at `1440px`, `1024px`, and `390px`
- `/deals`, `/propfirms`, `/leaderboard`, `/referral`
- `/dashboard/trader-profile`, `/dashboard/behavior`
- `/teams`, `/teams/dashboard/[slug]`
- `/admin`, `/admin/coupons`

Expected:

- one shared shell language
- no gradients
- accent reserved for primary actions and focus
- no behavior regressions

- [ ] **Step 4: Persist the durable notes**

```md
// t/memory
### Full-site product-led redesign — IN PROGRESS
- shared foundation shipped
- wave status and blockers recorded here
```

- [ ] **Step 5: Commit the verification + notes**

```bash
git add t/memory t/lessons p/AGENTS.md
git commit -m "docs: record redesign rollout state"
```

## Self-Review

### Spec coverage

- Shared visual system: covered by Task 1.
- Home hero/media direction: covered by Task 2.
- Home narrative cleanup: covered by Task 3.
- Public shell and core route unification: covered by Task 4.
- Long-tail public routes: covered by Task 5.
- Dashboard + teams product workspace mode: covered by Tasks 6, 7, and 8.
- Admin internal-tool mode: covered by Task 9.
- Verification + visual-only guardrails: covered by Task 10.

### Placeholder scan

- No `TODO`, `TBD`, or “implement later” placeholders remain.
- Every task has exact file paths, commands, and expected outcomes.

### Type consistency

- Shared recipe names are consistent: `unifiedHeroPanelClassName`, `unifiedSectionPanelClassName`, `unifiedInsetPanelClassName`, `unifiedPrimaryActionClassName`, `unifiedGhostActionClassName`.
- Shared motion helper names are consistent: `animate-fade-up-smooth-d1...d4`, `animate-scale-reveal-d1...d3`.

