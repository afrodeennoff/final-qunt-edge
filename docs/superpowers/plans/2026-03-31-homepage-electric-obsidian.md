# Qunt Edge Home Page — "Electric Obsidian" Enhancement Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the Qunt Edge home page with the "Electric Obsidian" aesthetic — blending Bold & Electric, Refined & Premium, and Dark Futurism into one cohesive visual system using only existing V2 design tokens and Framer Motion.

**Architecture:** All changes are additive enhancements to existing components. CSS animations are added to globals.css. Client components get Framer Motion enhancements. Server components remain unchanged. Zero new dependencies, zero route changes, zero breaking changes.

**Tech Stack:** Next.js 15 App Router, Framer Motion, Tailwind CSS 4, CSS Custom Properties (existing V2 tokens), React 19

---

## Prerequisite Context for All Tasks

Before starting any task, read these files for reference:

1. `app/[locale]/(home)/components/_constants.ts` — MOTION_EASE, stagger delays
2. `app/globals.css` — All existing CSS custom properties, keyframes, utility classes
3. `styles/tokens.css` — Marketing tokens (--mk-*)
4. `components/animation/entrance-exit.tsx` — AnimateIn, AnimateInItem
5. `components/animation/interactive.tsx` — InteractiveWrapper, MagneticButton
6. `components/ui/glass-card.tsx` — GlassCard component
7. `components/ui/v2/index.ts` — V2 component exports
8. `tailwind.config.ts` — Custom animations, keyframes

---

## Task Overview

| # | Task | Files | Category | Priority |
|---|------|-------|----------|----------|
| 1 | CSS Base Layer | `app/globals.css` | CSS | MUST DO FIRST |
| 2 | Hero + Dashboard Preview | `Hero.tsx`, `DashboardPreview.tsx` | Visual | Wave 1 |
| 3 | Live Stats Strip | `LiveStatsStrip.tsx` | Visual | Wave 1 |
| 4 | Features Bento | `FeaturesBento.tsx` | Visual | Wave 1 |
| 5 | How It Works | `HowItWorks.tsx` | Visual | Wave 1 |
| 6 | Analysis Demo + Chart | `AnalysisDemo.tsx`, `analysis-demo-chart.tsx` | Visual | Wave 1 |
| 7 | Audience Segmentation | `AudienceSegmentation.tsx` | Visual | Wave 1 |
| 8 | AI Features | `AIFeatures.tsx` | Visual | Wave 2 |
| 9 | Social Proof | `SocialProof.tsx` | Visual | Wave 2 |
| 10 | Comparison Section | `ComparisonSection.tsx` | Visual | Wave 2 |
| 11 | Pricing Section | `PricingSection.tsx` | Visual | Wave 2 |
| 12 | FAQ Section | `FAQSection.tsx` | Visual | Wave 2 |
| 13 | Final CTA | `FinalCTA.tsx` | Visual | Wave 3 |
| 14 | Navbar + Footer | `navbar.tsx`, `footer.tsx` | Visual | Wave 3 |
| 15 | HomeContent Wrapper | `HomeContent.tsx` | Integration | Wave 3 |
| 16 | QA & Build | ALL files | Verification | FINAL |

---

## Task 1: CSS Base Layer — New Keyframe Animations

**Files:**
- Modify: `app/globals.css`

**Context:** Before any component work, add the new keyframe animations that will be used across multiple components. Read globals.css first to find the best location for new keyframes (near existing animation definitions).

- [ ] **Step 1: Read globals.css for keyframe location**

Read the bottom 100 lines of `app/globals.css` to find where existing keyframes are defined. Add new keyframes after the existing `@keyframes` block.

- [ ] **Step 2: Add `animate-mesh-drift` keyframe**

After existing keyframes, add:
```css
@keyframes animate-mesh-drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(20px, -15px) scale(1.02); }
  66% { transform: translate(-15px, 10px) scale(0.98); }
}

@keyframes animate-glow-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@keyframes animate-orb-float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

@keyframes animate-scan-line {
  0% { transform: translateY(-100%); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(100%); opacity: 0; }
}
```

- [ ] **Step 3: Add CSS utility classes for new effects**

Add to globals.css after existing utility classes:
```css
/* Monospace data styling */
.mono-data {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

/* Glowing number for stats */
.glow-number {
  text-shadow: 0 0 20px oklch(0.55 0.22 264 / 0.4);
}

/* Terminal-style terminal accent */
.terminal-accent {
  font-family: var(--font-mono);
  color: oklch(0.55 0.22 264);
}

/* Glass panel with accent border */
.glass-accent-border {
  position: relative;
}

.glass-accent-border::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, oklch(0.55 0.22 264), oklch(0.45 0.18 290));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

/* Scan line overlay */
.scan-line-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    oklch(0.55 0.22 264 / 0.03) 50%,
    transparent 100%
  );
  height: 4px;
  width: 100%;
  animation: animate-scan-line 4s linear infinite;
  border-radius: inherit;
}
```

- [ ] **Step 4: Run typecheck to verify no regressions**

Run: `npm run typecheck 2>&1 | head -20`
Expected: No errors related to CSS changes (CSS changes don't affect TS)

- [ ] **Step 5: Commit**

```bash
git add app/globals.css
git commit -m "feat(home): add Electric Obsidian CSS base — new keyframes and utility classes"
```

---

## Task 2: Hero + Dashboard Preview Enhancement

**Files:**
- Modify: `app/[locale]/(home)/components/Hero.tsx`
- Modify: `app/[locale]/(home)/components/DashboardPreview.tsx`

**Read first:** `Hero.tsx` (full), `DashboardPreview.tsx` (full)

- [ ] **Step 1: Enhance Hero.tsx**

Read `Hero.tsx` completely. Find the `<section>` element wrapping the hero. Add the animated mesh gradient layer and magnetic CTA:

**Change 1 — Add animated mesh background to the hero section:**
Find the hero `<section>` or outer `<div>`. Add a `relative` container with an absolute positioned mesh layer:
```tsx
{/* Before the existing hero content div, add: */}
<div className="absolute inset-0 overflow-hidden pointer-events-none">
  <div className="absolute inset-0 bg-mesh-animated opacity-40" />
  <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[oklch(0.55_0.22_264/0.08)] blur-3xl animate-orb-float" />
  <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-[oklch(0.45_0.18_290/0.06)] blur-3xl animate-orb-float" style={{ animationDelay: '-5s' }} />
</div>
```

**Change 2 — Make the badge glow more intensely:**
Find the badge `<Badge>` component. Add `className="shadow-glow-primary"` to intensify the badge glow.

**Change 3 — Add magnetic button effect to CTA button:**
Find the primary CTA `<Button>` (the one with "Start Your Free Audit" text). Wrap it with `MagneticButton`:
```tsx
import { MagneticButton } from '@/components/animation/interactive'

// Replace the Button with:
<MagneticButton strength={6}>
  <Button variant="gradient-primary" size="lg" className="shadow-glow-primary-md">
    Start Your Free Audit
    <ArrowRight className="ml-2 h-4 w-4" />
  </Button>
</MagneticButton>
```

**Change 4 — Add gradient text to the headline:**
Find the headline `<h1>`. Wrap it with a `<span>` that has the gradient text class, or add the class to the existing element. The text should have `text-gradient-primary` applied.

- [ ] **Step 2: Enhance DashboardPreview.tsx**

Read `DashboardPreview.tsx` completely. Add scan line animation and ambient glow.

**Change 1 — Add scan line overlay to the dashboard container:**
Find the outer container `div` of the mock dashboard. Add the `scan-line-overlay` class:
```tsx
// Find: className that contains "relative" or the outer wrapper
<div className="relative overflow-hidden rounded-xl border border-[oklch(0.14_0_0/0.5)] bg-[oklch(0.07_0_0)] shadow-2xl">
// Add scan-line-overlay class:
<div className="relative overflow-hidden rounded-xl border border-[oklch(0.14_0_0/0.5)] bg-[oklch(0.07_0_0)] shadow-2xl scan-line-overlay">
```

**Change 2 — Add ambient glow pulse to the chart area:**
Find the chart component within the dashboard preview. Add a subtle glow:
```tsx
// Around the chart container, add a parent with glow:
<div className="relative">
  <div className="absolute inset-0 rounded-lg blur-xl bg-[oklch(0.55_0.22_264/0.1)] animate-glow-pulse" />
  {/* existing chart */}
</div>
```

- [ ] **Step 3: Verify imports**

Ensure `MagneticButton`, `AnimatedOrbit` (if added), and new CSS classes are available. If `MagneticButton` doesn't exist, use `InteractiveWrapper` with `magnetic={true}` instead.

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck 2>&1 | head -30`
Expected: No errors or only pre-existing errors

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/\(home\)/components/Hero.tsx app/[locale]/\(home\)/components/DashboardPreview.tsx
git commit -m "feat(home): enhance Hero with animated mesh, magnetic CTA, gradient text, and glow effects"
```

---

## Task 3: Live Stats Strip Enhancement

**Files:**
- Modify: `app/[locale]/(home)/components/LiveStatsStrip.tsx`

**Read first:** `LiveStatsStrip.tsx` (full)

- [ ] **Step 1: Add monospace font and glass background**

Read the component. Find the container `<div>` that wraps all stat items.

**Change 1 — Add glass background to the strip container:**
```tsx
// Find the stats strip container div
// Replace className to add glass effect:
<div className="relative w-full overflow-hidden bg-[oklch(0.07_0_0/0.6)] backdrop-blur-md border-y border-[oklch(0.14_0_0/0.3)]">
```

**Change 2 — Add monospace font to the number displays:**
Find where numbers are rendered. Look for the counter display (the number value that animates). Add `mono-data` and `glow-number` classes:
```tsx
// In the number display span/digits area, add:
<span className="font-mono tabular-nums tracking-wider glow-number">
  {/* existing number content */}
</span>
```

**Change 3 — Add separator gradient between stats:**
Find where stat items are separated. After each stat item (except the last), add a vertical gradient separator:
```tsx
// Between stat items, add:
{index < stats.length - 1 && (
  <div className="hidden sm:block w-px h-8 bg-gradient-to-b from-transparent via-[oklch(0.55_0.22_264/0.3)] to-transparent" />
)}
```

- [ ] **Step 2: Enhance the counter animation**

Find the `useEffect` that handles the counting animation. Ensure it uses smooth easing. The existing implementation likely uses a simple interval — if so, replace with requestAnimationFrame + easing for smoother animation:

```tsx
// Find the counting logic. Replace with rAF-based animation:
const animateValue = (start: number, end: number, duration: number) => {
  const startTime = performance.now()
  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3)
    const current = Math.floor(start + (end - start) * eased)
    setDisplayValue(current)
    if (progress < 1) requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
}
```

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/\(home\)/components/LiveStatsStrip.tsx
git commit -m "feat(home): enhance LiveStatsStrip with monospace numbers, glass background, and glow effects"
```

---

## Task 4: Features Bento Enhancement

**Files:**
- Modify: `app/[locale]/(home)/components/FeaturesBento.tsx`

**Read first:** `FeaturesBento.tsx` (full)

- [ ] **Step 1: Upgrade card styling to GlassCard premium**

Read the component. Find each feature card container. The cards likely use `<div>` or a `<Card>` component.

**Change 1 — Wrap each card in GlassCard with premium variant:**
```tsx
import { GlassCard } from '@/components/ui/glass-card'

// Replace existing card divs with GlassCard:
{features.map((feature, i) => (
  <GlassCard
    key={feature.title}
    variant="strong"
    hover={true}
    size="md"
    className="relative overflow-hidden"
  >
    {/* Existing card content */}
  </GlassCard>
))}
```

**Change 2 — Add icon glow container:**
Find where Lucide icons are rendered in feature cards. Wrap them in a glowing container:
```tsx
// Find the icon container div around the Lucide icon
<div className="inline-flex items-center justify-center rounded-xl w-12 h-12 border border-[oklch(0.55_0.22_264/0.3)] bg-[oklch(0.55_0.22_264/0.08)]">
  <Icon className="w-6 h-6 text-[oklch(0.55_0.22_264)]" />
</div>
// Make it more glowy:
<div className="relative inline-flex items-center justify-center rounded-xl w-12 h-12">
  <div className="absolute inset-0 rounded-xl bg-[oklch(0.55_0.22_264/0.15)] blur-sm" />
  <div className="relative inline-flex items-center justify-center rounded-xl w-12 h-12 border border-[oklch(0.55_0.22_264/0.4)] bg-[oklch(0.55_0.22_264/0.1)]">
    <Icon className="w-5 h-5 text-[oklch(0.55_0.22_264)]" />
  </div>
</div>
```

**Change 3 — Add gradient text to feature titles:**
Find the feature title `<h3>` or `<p>` elements. Add `text-gradient-primary` class to the first word or the full title:
```tsx
<h3 className="text-lg font-semibold text-gradient-primary">
  {feature.title}
</h3>
```

- [ ] **Step 2: Enhance stagger animation**

Find the Framer Motion animation wrapper. Increase the delay spread for more dramatic entrance:
```tsx
// Current stagger delay is likely 0.05s per item
// Change to 0.08s for more dramatic effect:
transition={{ duration: 0.6, ease: MOTION_EASE, delay: index * 0.08 }}
```

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/\(home\)/components/FeaturesBento.tsx
git commit -m "feat(home): enhance FeaturesBento with GlassCard premium, icon glow, and gradient text"
```

---

## Task 5: How It Works Enhancement

**Files:**
- Modify: `app/[locale]/(home)/components/HowItWorks.tsx`

**Read first:** `HowItWorks.tsx` (full)

- [ ] **Step 1: Add glowing step indicators and gradient connecting line**

Read the component. Find where step numbers/nodes are rendered and where the connecting line is drawn.

**Change 1 — Replace step number with glowing indicator:**
```tsx
// Find the step number display (likely a span or div with a number)
// Replace with glowing circle indicator:
<div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 border-[oklch(0.55_0.22_264)] bg-[oklch(0.07_0_0)] shadow-[0_0_20px_oklch(0.55_0.22_264/0.3)]">
  <span className="text-sm font-bold text-[oklch(0.55_0.22_264)] font-mono">
    {step.number}
  </span>
</div>
```

**Change 2 — Upgrade connecting line to gradient:**
Find the SVG or div that draws the connecting line between steps. Replace with gradient:
```tsx
{/* Replace the existing line with: */}
<div 
  className="absolute top-6 left-0 right-0 h-px"
  style={{
    background: 'linear-gradient(90deg, oklch(0.55 0.22 264), oklch(0.45 0.18 290), transparent)',
    mask: 'linear-gradient(90deg, black 0%, black 80%, transparent 100%)',
  }}
/>
```

- [ ] **Step 2: Add hover effect to steps**

Wrap each step in `InteractiveWrapper`:
```tsx
import { InteractiveWrapper } from '@/components/animation/interactive'

{steps.map((step, i) => (
  <InteractiveWrapper key={i} hover="scale">
    <div className="flex flex-col items-center text-center gap-3">
      {/* step content */}
    </div>
  </InteractiveWrapper>
))}
```

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/\(home\)/components/HowItWorks.tsx
git commit -m "feat(home): enhance HowItWorks with glowing step indicators and gradient connecting line"
```

---

## Task 6: Analysis Demo + Chart Enhancement

**Files:**
- Modify: `app/[locale]/(home)/components/AnalysisDemo.tsx`
- Modify: `app/[locale]/(home)/components/analysis-demo-chart.tsx`

**Read first:** `AnalysisDemo.tsx` (full), `analysis-demo-chart.tsx` (full)

- [ ] **Step 1: Add terminal aesthetic to AnalysisDemo**

Read `AnalysisDemo.tsx`. Find the two-panel layout.

**Change 1 — Add glass container with accent border to the panel:**
```tsx
// Find the panel that contains the chart
// Wrap with glass-accent-border class:
<div className="glass-accent-border rounded-2xl bg-[oklch(0.07_0_0/0.8)] backdrop-blur-md p-6">
  {/* existing chart content */}
</div>
```

**Change 2 — Add live indicator with glow to AI panel:**
Find the AI signals panel. Add a glowing "live" dot indicator:
```tsx
// Find where "AI Journal" or similar header is
<div className="flex items-center gap-2">
  <div className="relative flex items-center justify-center w-2 h-2">
    <div className="absolute w-2 h-2 rounded-full bg-[oklch(0.55_0.22_264)] animate-glow-pulse" />
    <div className="relative w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.22_264)]" />
  </div>
  <span className="text-sm font-mono text-[oklch(0.55_0.22_264)]">LIVE</span>
</div>
```

**Change 3 — Add monospace font to AI signal text:**
Find where AI signal text is displayed. Add `font-mono` class:
```tsx
<p className="text-sm font-mono text-[oklch(0.65_0.01_275)]">
  {/* signal text */}
</p>
```

- [ ] **Step 2: Enhance the chart component**

Read `analysis-demo-chart.tsx`. Find where Recharts components are used.

**Change 1 — Add gradient area fill:**
```tsx
import { Area, defs, linearGradient } from 'recharts'

// Replace existing Area or Line with gradient fill:
<Area
  type="monotone"
  dataKey="equity"
  stroke="oklch(0.55 0.22 264)"
  strokeWidth={2}
  fill="url(#equityGradient)"
  animationDuration={1500}
/>

// Add the gradient definition to the chart:
<defs>
  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor="oklch(0.55 0.22 264)" stopOpacity={0.3} />
    <stop offset="100%" stopColor="oklch(0.55 0.22 264)" stopOpacity={0} />
  </linearGradient>
</defs>
```

**Change 2 — Style grid lines with accent color:**
Find where `<CartesianGrid>` is used. Add accent-colored grid:
```tsx
<CartesianGrid
  strokeDasharray="3 3"
  stroke="oklch(0.55 0.22 264 / 0.1)"
  vertical={false}
/>
```

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/\(home\)/components/AnalysisDemo.tsx app/[locale]/\(home\)/components/analysis-demo-chart.tsx
git commit -m "feat(home): enhance AnalysisDemo with terminal aesthetics, live indicator, and gradient chart"
```

---

## Task 7: Audience Segmentation Enhancement

**Files:**
- Modify: `app/[locale]/(home)/components/AudienceSegmentation.tsx`

**Read first:** `AudienceSegmentation.tsx` (full)

- [ ] **Step 1: Add gradient borders and glass backgrounds**

Read the component. Find the two audience card containers.

**Change 1 — Wrap cards in glass-accent-border:**
```tsx
// Find the two audience card containers
// Replace with gradient border wrapper:
<div className="glass-accent-border rounded-2xl bg-[oklch(0.07_0_0/0.8)] backdrop-blur-md p-8">
  {/* existing card content */}
</div>
```

**Change 2 — Add left accent glow:**
Add a glowing left edge indicator to the featured side of each card:
```tsx
// Inside each card, add a left accent bar:
<div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[oklch(0.55_0.22_264)] via-[oklch(0.45_0.18_290)] to-transparent rounded-l-2xl" />
```

**Change 3 — Apply gradient text to headlines:**
Find audience section headlines. Add `text-gradient-primary`:
```tsx
<h2 className="text-3xl font-bold text-gradient-primary">
  {/* headline */}
</h2>
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/\(home\)/components/AudienceSegmentation.tsx
git commit -m "feat(home): enhance AudienceSegmentation with gradient borders and glass cards"
```

---

## Task 8: AI Features Enhancement

**Files:**
- Modify: `app/[locale]/(home)/components/AIFeatures.tsx`

**Read first:** `AIFeatures.tsx` (full)

- [ ] **Step 1: Upgrade to GlassCard premium with icon glow**

Follow the same pattern as Task 4 (FeaturesBento):
- Wrap each card in `GlassCard` with `variant="strong"` and `hover={true}`
- Add glowing icon containers with `oklch(0.55 0.22 264)` accent color
- Add `text-gradient-primary` to card titles
- Increase stagger delay to 0.08s

- [ ] **Step 2: Add monospace styling to technical feature text**

Find any technical metrics or code-like text. Add `font-mono`:
```tsx
<p className="font-mono text-sm text-[oklch(0.65_0.01_275)]">
  {/* technical description */}
</p>
```

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/\(home\)/components/AIFeatures.tsx
git commit -m "feat(home): enhance AIFeatures with GlassCard premium and icon glow effects"
```

---

## Task 9: Social Proof Enhancement

**Files:**
- Modify: `app/[locale]/(home)/components/SocialProof.tsx`

**Read first:** `SocialProof.tsx` (full)

- [ ] **Step 1: Add decorative quote marks and enhance avatar rings**

Read the component. Find where testimonials or quotes are rendered.

**Change 1 — Add decorative quote marks:**
```tsx
// Find where testimonial text is rendered
// Add decorative quote mark before the quote:
<div className="relative">
  <span className="absolute -top-4 -left-2 text-6xl font-serif text-[oklch(0.55_0.22_264/0.2)] leading-none select-none">
    "
  </span>
  <p className="relative text-[oklch(0.95_0_0)] italic">
    {/* existing quote text */}
  </p>
</div>
```

**Change 2 — Add accent ring to avatars:**
Find where avatar images are rendered. Add an accent-colored ring:
```tsx
// Find the Avatar component wrapper
<div className="relative">
  <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-[oklch(0.55_0.22_264)] to-[oklch(0.45_0.18_290)]" />
  <Avatar className="relative">
    {/* existing avatar */}
  </Avatar>
</div>
```

**Change 3 — Add mono styling to stat numbers:**
Find where statistics numbers are displayed. Add `mono-data glow-number`:
```tsx
<span className="text-3xl font-bold font-mono tabular-nums glow-number text-[oklch(0.55_0.22_264)]">
  {/* stat number */}
</span>
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/\(home\)/components/SocialProof.tsx
git commit -m "feat(home): enhance SocialProof with decorative quotes, avatar rings, and mono stats"
```

---

## Task 10: Comparison Section Enhancement

**Files:**
- Modify: `app/[locale]/(home)/components/ComparisonSection.tsx`

**Read first:** `ComparisonSection.tsx` (full)

- [ ] **Step 1: Style checkmarks and X marks with accent colors**

Read the component. Find where comparison rows are rendered.

**Change 1 — Style checkmarks with accent color and glow:**
```tsx
// Find where Check/X icons are used
// Replace Check icon:
<Check className="w-5 h-5 text-[oklch(0.55_0.15_166)] drop-shadow-[0_0_8px_oklch(0.55_0.15_166/0.5)]" />

// Replace X icon:
<X className="w-5 h-5 text-[oklch(0.6_0.2_15)]" />
```

**Change 2 — Add hover highlight to table rows:**
Find the table row `<tr>` or equivalent. Add hover state:
```tsx
// Add to the row container:
className="transition-colors duration-200 hover:bg-[oklch(0.07_0_0/0.5)] hover:border-l-2 hover:border-l-[oklch(0.55_0.22_264)]"
```

**Change 3 — Add accent background to Qunt Edge column (if applicable):**
If there's a "Qunt Edge" column, add subtle accent tint:
```tsx
// Find the Qunt Edge column header/data cells
className="bg-[oklch(0.55_0.22_264/0.05)]"
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/\(home\)/components/ComparisonSection.tsx
git commit -m "feat(home): enhance ComparisonSection with accent checkmarks and row hover effects"
```

---

## Task 11: Pricing Section Enhancement

**Files:**
- Modify: `app/[locale]/(home)/components/PricingSection.tsx`

**Read first:** `PricingSection.tsx` (full)

- [ ] **Step 1: Add monospace pricing and featured card glow**

Read the component. Find where pricing cards are rendered and where prices are displayed.

**Change 1 — Add monospace font to price numbers:**
```tsx
// Find the price display (e.g., "$29" or "$250")
// Add monospace styling:
<span className="text-5xl font-bold font-mono tabular-nums tracking-tight text-gradient-primary">
  {/* price */}
</span>
```

**Change 2 — Make the featured/center plan glow:**
Find which plan is the featured one (middle plan or "Pro" plan). Add `glass-accent-border` and glow:
```tsx
// Add to the featured card's container:
<div className="relative glass-accent-border rounded-2xl">
  {/* Add glow behind the card */}
  <div className="absolute -inset-1 rounded-3xl bg-[oklch(0.55_0.22_264/0.1)] blur-xl -z-10" />
  {/* existing card content */}
</div>
```

**Change 3 — Use MagneticButton for CTAs:**
```tsx
import { MagneticButton } from '@/components/animation/interactive'

// Wrap the featured CTA:
<MagneticButton strength={6}>
  <Button variant="gradient-primary" className="w-full shadow-glow-primary">
    Get Started
  </Button>
</MagneticButton>
```

**Change 4 — Style other plan CTAs:**
```tsx
// Non-featured plan buttons:
<Button variant="outline" className="w-full border-[oklch(0.55_0.22_264/0.3)] hover:border-[oklch(0.55_0.22_264)]">
  Get Started
</Button>
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/\(home\)/components/PricingSection.tsx
git commit -m "feat(home): enhance PricingSection with monospace prices, featured glow, and magnetic CTAs"
```

---

## Task 12: FAQ Section Enhancement

**Files:**
- Modify: `app/[locale]/(home)/components/FAQSection.tsx`

**Read first:** `FAQSection.tsx` (full)

- [ ] **Step 1: Style accordion items with panel styling and accent indicators**

Read the component. Find where accordion items are rendered.

**Change 1 — Add panel styling to accordion trigger:**
```tsx
// Find the Accordion.Trigger or equivalent
// Add marketing-panel class:
<Accordion.Trigger className="flex-1 flex items-center justify-between gap-4 p-4 rounded-xl border border-[oklch(0.14_0_0/0.5)] bg-[oklch(0.07_0_0)] hover:bg-[oklch(0.07_0_0/0.8)] transition-colors duration-200 text-left w-full">
```

**Change 2 — Style the chevron icon with accent color:**
```tsx
// Find the Accordion Chevron or chevron icon
// Style it with accent:
<Chevron className="h-4 w-4 shrink-0 text-[oklch(0.55_0.22_264)] transition-transform duration-200 group-data-[state=open]:rotate-180" />
```

**Change 3 — Add active indicator:**
```tsx
// Add left accent bar to the trigger:
<div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 rounded-full bg-[oklch(0.55_0.22_264)] opacity-0 group-data-[state=open]:opacity-100 transition-opacity duration-200" />
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/\(home\)/components/FAQSection.tsx
git commit -m "feat(home): enhance FAQSection with panel styling and accent indicators"
```

---

## Task 13: Final CTA Enhancement

**Files:**
- Modify: `app/[locale]/(home)/components/FinalCTA.tsx`

**Read first:** `FinalCTA.tsx` (full)

- [ ] **Step 1: Enhance ambient glow and add MagneticButton**

Read the component. Find the closing CTA container.

**Change 1 — Enhance the radial glow behind the CTA:**
```tsx
// Find the ambient glow div
// Make it more dramatic:
<div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-[oklch(0.55_0.22_264/0.15)] via-[oklch(0.45_0.18_290/0.08)] to-transparent blur-xl" />
```

**Change 2 — Add grid overlay:**
```tsx
// Add grid pattern overlay to the CTA container:
<div 
  className="absolute inset-0 rounded-3xl opacity-[0.07]"
  style={{
    backgroundImage: 'linear-gradient(oklch(0.55_0.22_264) 1px, transparent 1px), linear-gradient(90deg, oklch(0.55_0.22_264) 1px, transparent 1px)',
    backgroundSize: '72px 72px',
  }}
/>
```

**Change 3 — Use MagneticButton for the CTA button:**
```tsx
import { MagneticButton } from '@/components/animation/interactive'

<MagneticButton strength={8}>
  <Button variant="gradient-primary" size="lg" className="shadow-glow-primary-lg">
    Start Your Free Audit — No Credit Card
    <ArrowRight className="ml-2 h-5 w-5" />
  </Button>
</MagneticButton>
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/\(home\)/components/FinalCTA.tsx
git commit -m "feat(home): enhance FinalCTA with dramatic glow, grid overlay, and magnetic button"
```

---

## Task 14: Navbar + Footer Enhancement

**Files:**
- Modify: `app/[locale]/(landing)/components/navbar.tsx`
- Modify: `app/[locale]/(landing)/components/footer.tsx`

**Read first:** `navbar.tsx` (full), `footer.tsx` (full)

- [ ] **Step 1: Enhance navbar glassmorphism**

Read `navbar.tsx`. Find the navbar container and nav links.

**Change 1 — Increase glass blur intensity:**
```tsx
// Find the navbar container
// Upgrade backdrop blur:
className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-[oklch(0.07_0_0/0.8)] border-b border-[oklch(0.14_0_0/0.3)]"
```

**Change 2 — Add accent underline to active nav link:**
```tsx
// Find where active nav link is determined
// Add accent underline:
<Link
  href={link.href}
  className={cn(
    "relative text-sm font-medium transition-colors duration-200 py-2",
    isActive && "text-[oklch(0.55_0.22_264)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[oklch(0.55_0.22_264)] after:rounded-full after:shadow-[0_0_8px_oklch(0.55_0.22_264/0.5)]"
  )}
>
```

**Change 3 — Style CTA button with gradient-primary:**
Find the navbar CTA button. Ensure it uses `variant="gradient-primary"`:
```tsx
<Button variant="gradient-primary" size="sm" className="shadow-glow-primary hidden sm:flex">
  Start Free Audit
</Button>
```

- [ ] **Step 2: Enhance footer glass effect**

Read `footer.tsx`. Find the footer container.

**Change 1 — Add subtle glass effect:**
```tsx
// Find the footer container
// Add glass styling:
<footer className="relative border-t border-[oklch(0.14_0_0/0.3)] bg-[oklch(0.07_0_0/0.6)] backdrop-blur-md">
```

**Change 2 — Add accent hover to social links:**
```tsx
// Find social icon links
// Add accent color on hover with glow:
<Link
  href={social.href}
  className="text-[oklch(0.65_0.01_275)] hover:text-[oklch(0.55_0.22_264)] transition-colors duration-200"
>
  {/* icon */}
</Link>
```

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/\(landing\)/components/navbar.tsx app/[locale]/\(landing\)/components/footer.tsx
git commit -m "feat(home): enhance Navbar and Footer with stronger glassmorphism and accent styling"
```

---

## Task 15: HomeContent Integration

**Files:**
- Modify: `app/[locale]/(home)/components/HomeContent.tsx`

**Read first:** `HomeContent.tsx` (full)

- [ ] **Step 1: Ensure animated mesh layer is active**

Read `HomeContent.tsx`. Find the background gradient section. Verify that the animated mesh class is applied.

**Change 1 — Ensure animated mesh is enabled:**
```tsx
// Find the existing gradient background div
// Make sure it has the animated class:
<div className="absolute inset-0 -z-10">
  {/* Static radial gradients */}
  <div className="absolute inset-0 bg-mesh-subtle opacity-30" />
  <div className="absolute inset-0 bg-mesh-animated opacity-20" />
  {/* Corner radial accents */}
</div>
```

**Change 2 — Add subtle noise texture overlay:**
```tsx
// Add noise texture overlay at the very bottom:
<div 
  className="absolute inset-0 pointer-events-none opacity-[0.03]"
  style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}
/>
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/\(home\)/components/HomeContent.tsx
git commit -m "feat(home): ensure animated mesh layer active with noise texture overlay"
```

---

## Task 16: QA & Build Verification

**Files:**
- ALL modified files from Tasks 1-15

- [ ] **Step 1: Run TypeScript type check**

Run: `npm run typecheck 2>&1`
Expected: Exit code 0, no new errors

- [ ] **Step 2: Run ESLint**

Run: `npm run lint 2>&1 | tail -20`
Expected: No new lint errors introduced (pre-existing budget acceptable)

- [ ] **Step 3: Run production build**

Run: `npm run build 2>&1 | tail -30`
Expected: Build succeeds, no new warnings beyond budget

- [ ] **Step 4: Manual browser verification (if dev server available)**

Start dev server and verify:
- [ ] Hero renders with animated mesh background
- [ ] CTA button has magnetic hover effect
- [ ] Dashboard preview has scan line animation
- [ ] Live stats strip has monospace numbers with glow
- [ ] Feature cards have glass premium effect and icon glow
- [ ] Navigation has stronger glass blur
- [ ] Footer has glass effect
- [ ] All animations trigger on scroll
- [ ] No layout shift on load
- [ ] Responsive on mobile (375px), tablet (768px), desktop (1280px)

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat(home): complete Electric Obsidian home page enhancement

- Animated mesh gradients with drift effects
- Magnetic button CTAs with glow shadows
- GlassCard premium with icon glow across all feature cards
- Monospace terminal aesthetic for data/stats/pricing
- Gradient borders and accent glows throughout
- Enhanced navbar glassmorphism
- Scan line animations on dashboard preview
- All animations respect prefers-reduced-motion
- Zero new dependencies"
```

---

## Implementation Notes

### CSS Loading Order
CSS custom properties are defined in `globals.css` and `styles/tokens.css`. The CSS loads in this order:
1. `app/globals.css` (imported in root layout)
2. `styles/tokens.css` (imported in globals.css)

### Framer Motion Usage
All components use the existing `MOTION_EASE` constant from `_constants.ts`:
```ts
const MOTION_EASE = [0.25, 0.46, 0.45, 0.94]
```

Standard animation pattern:
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-100px' }}
  transition={{ duration: 0.6, ease: MOTION_EASE, delay: index * 0.08 }}
>
```

### Reduced Motion
All Framer Motion components already respect `useReducedMotion()`. CSS animations should also be wrapped:
```tsx
import { useReducedMotion } from 'framer-motion'

const shouldReduceMotion = useReducedMotion()

// Use reduced animation when appropriate
<motion.div
  animate={shouldReduceMotion ? {} : { y: [0, -10, 0] }}
  transition={{ duration: shouldReduceMotion ? 0 : 2, repeat: Infinity }}
/>
```

### Key Imports
```tsx
// Always use these imports for the V2 design system:
import { CardV2, ButtonV2, BadgeV2 } from '@/components/ui/v2'
import { GlassCard } from '@/components/ui/glass-card'
import { InteractiveWrapper, MagneticButton } from '@/components/animation/interactive'
import { MOTION_EASE } from './_constants'
```
