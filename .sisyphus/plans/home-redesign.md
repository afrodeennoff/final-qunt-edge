# Home Page Full Visual Redesign — Implementation Plan

**Created:** 2026-03-30  
**Branch:** v2  
**Scope:** `app/[locale]/(home)/` (35 files)

---

## 1. Current State Analysis

### What's Actually Rendered (HomeContent.tsx)
```
Hero → TrustStrip → Features → PricingSection → FinalCTA
```

### What EXISTS But Is NOT Rendered
- `DeferredHomeSections.tsx` — imports Features + PricingSection AGAIN (the duplicate bug), never imported by anyone
- 18 orphan components: ProblemStatement, HowItWorks, OnboardingJourney, AnalysisDemo, WhyChooseUs, TrustAndProof, ComparisonSection, AIFuturesSection, CTA, ProofStrip, Differentiators, Qualification, TrustStats, SearchHero, FAQSection, DashboardPreview, PropFirmsExplorer, RollingAdBanner

### Key Findings
1. **Features renders once** (in HomeContent), **PricingSection renders once** (in HomeContent) — the "duplicate" is in DeferredHomeSections which is never imported
2. **PropFirmsExplorer** and **RollingAdBanner** exist but are NOT rendered on the home page
3. Many components are well-written but disconnected from the page
4. DashboardPreview is a static mock (no framer-motion)
5. TrustStats uses V2 design tokens inconsistently (`v2-*` classes mixed with `--mk-*`)
6. Differentiators and Qualification already use framer-motion

---

## 2. Component Decision Matrix

### REWRITE (visual + structural overhaul)
| Component | Why |
|-----------|-----|
| `Hero.tsx` | Problem-first headline, live stats bar, animated dashboard preview, broker logos |
| `Features.tsx` → `FeaturesBento.tsx` | Bento grid layout replacing uniform 3-col cards |
| `DashboardPreview.tsx` | Add metric callouts, framer-motion entrance, glow effects |
| `HowItWorks.tsx` | Horizontal connected pipeline with scroll-triggered reveals |
| `ProblemStatement.tsx` | Asymmetric bento layout, scroll-triggered cards |
| `AIFuturesSection.tsx` → `AIFeatures.tsx` | Bento cards instead of tabs, visual distinction |
| `WhyChooseUs.tsx` + `TrustAndProof.tsx` → `SocialProof.tsx` | Merge into one cohesive section: stats + testimonials + trust pillars |
| `PricingSection.tsx` | Modern glassmorphism cards, better visual hierarchy |
| `FinalCTA.tsx` | Bold gradient CTA with ambient glow |
| `HomeContent.tsx` | Full restructure: new section order, proper lazy loading |
| `CTA.tsx` | Merge into FinalCTA, delete redundant component |

### KEEP (minor polish only)
| Component | Action |
|-----------|--------|
| `AnalysisDemo.tsx` | Keep as-is, already has mock data + chart. Add framer-motion entrance. |
| `ComparisonSection.tsx` | Keep structure, add framer-motion row reveals |
| `PropFirmsExplorer.tsx` | Keep as-is (real data). Ensure proper section wrapper. |
| `RollingAdBanner.tsx` | Keep as-is (real data). Ensure proper section wrapper. |
| `FAQSection.tsx` | Keep structure, add framer-motion accordion animation |
| `SearchHero.tsx` | Keep as-is (used by PropFirmsExplorer) |
| `FilterChips.tsx` | Keep as-is (used by PropFirmsExplorer) |
| `FirmCardsGrid.tsx` | Keep as-is (used by PropFirmsExplorer) |
| `FirmCard.tsx` | Keep as-is (used by FirmCardsGrid) |
| `prop-firm-utils.ts` | Keep as-is (utility) |
| `analysis-demo-chart.tsx` | Keep as-is (chart component) |

### DELETE (superseded or redundant)
| Component | Why |
|-----------|-----|
| `DeferredHomeSections.tsx` | Never imported; was the duplicate bug source |
| `TrustStrip.tsx` | Merged into Hero (broker logos) + LiveStatsStrip |
| `OnboardingJourney.tsx` | Merged into HowItWorks (4-step pipeline) |
| `ProofStrip.tsx` | Merged into SocialProof |
| `Differentiators.tsx` | Merged into FeaturesBento |
| `Qualification.tsx` | Merged into new AudienceSegmentation section |
| `TrustStats.tsx` | Merged into LiveStatsStrip (animated counters in hero area) |
| `CTA.tsx` | Redundant with FinalCTA, deleted |

---

## 3. New Section Order

```
1.  Hero                    — Problem-first headline, animated stats bar, dashboard preview, broker logos
2.  LiveStatsStrip          — Animated counter strip (2,400+ traders, $12M funded, etc.)
3.  ProblemStatement        — "Results tell you if you were paid, not if you were good"
4.  FeaturesBento           — Bento grid: 2 large + 4 small cards, asymmetric layout
5.  DashboardPreview        — Enhanced mock dashboard with metric callouts + glow
6.  HowItWorks              — 5-step connected horizontal pipeline
7.  AnalysisDemo            — Interactive chart + journal signals (KEEP)
8.  AudienceSegmentation    — "For Prop Firm Traders" / "For Futures Traders" tab cards
9.  AIFeatures              — AI features in bento layout (no tabs)
10. SocialProof             — Stats + testimonials + trust pillars (merged section)
11. ComparisonSection       — Head-to-head table (KEEP)
12. PropFirmsExplorer       — Real firm data catalogue (KEEP)
13. RollingAdBanner         — Deals ticker (KEEP)
14. PricingSection          — 3-tier pricing with annual toggle
15. FAQSection              — Accordion FAQ (KEEP)
16. FinalCTA                — Bold closing CTA with gradient
```

---

## 4. Detailed Component Specs

### 4.1 Hero (REWRITE)
**File:** `app/[locale]/(home)/components/Hero.tsx`  
**'use client':** YES (framer-motion animations)

**Layout:**
- Full-viewport hero (`min-h-screen`) with radial gradient background
- Subtle grid overlay (`72px` grid, `--border/0.3` opacity)
- Content centered, max-w-6xl

**Structure (top to bottom):**
```
┌──────────────────────────────────────────────────────────────┐
│  [Badge: ● Live Decision Telemetry]  ← animate-fade-in       │
│                                                                │
│  Your next edge starts                         ← stagger-in    │
│  with better decisions.                        ← stagger-in    │
│  (text-gradient-primary on "better decisions")                 │
│                                                                │
│  Subtitle: Qunt Edge isolates execution quality,             │
│  behavioral drift, and risk discipline in one surface.        │
│                                                                │
│  [Start Free Audit] [Watch Demo →]            ← stagger-in    │
│  No credit card · First audit in minutes                      │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  DashboardPreview (enhanced)                            │  │
│  │  Stats cards + bar chart + trade list                   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  Tradovate · Rithmic · IBKR · CQG · NinjaTrader              │
│  (broker logos, horizontally centered)                        │
└──────────────────────────────────────────────────────────────┘
```

**Animations (framer-motion):**
- Badge: `fadeIn` with 0ms delay
- H1 line 1: `slideUp` with 100ms delay
- H1 line 2: `slideUp` with 200ms delay, gradient text
- Subtitle: `fadeIn` with 300ms delay
- CTA buttons: `slideUp` with 400ms delay
- DashboardPreview: `scaleIn` from 0.95 with 600ms delay, slight perspective tilt (2deg)
- Broker strip: `fadeIn` with 800ms delay

**Typography:**
- H1: `text-[clamp(2.5rem,6vw,4.5rem)]`, `font-semibold`, `tracking-[-0.035em]`, `leading-[1.05]`
- Subtitle: `text-[clamp(1rem,2vw,1.25rem)]`, `text-muted-foreground/90`, `max-w-2xl`
- Uses `[font-family:var(--home-display)]` for headlines

**CTA Buttons:**
- Primary: `bg-primary btn-primary-glow rounded-xl px-7 h-12`
- Secondary: `border-border/60 hover:bg-card/80 rounded-xl`

**DashboardPreview Integration:**
- Import DashboardPreview as child component
- Wrap in framer-motion `motion.div` with perspective container
- Add subtle `box-shadow: 0 40px 80px -20px hsl(var(--primary)/0.15)` glow

---

### 4.2 LiveStatsStrip (NEW)
**File:** `app/[locale]/(home)/components/LiveStatsStrip.tsx`  
**'use client':** YES (animated counters)

**Layout:** Full-width bar, `border-y border-border/50 bg-card/40`, py-10

**Content:**
```
┌─────────────────────────────────────────────────────────────┐
│  2,400+        $12M        100%         24/7               │
│  Traders        Funded      Coverage     Support            │
└─────────────────────────────────────────────────────────────┘
```

**Implementation:**
- 4-column grid (`grid-cols-2 md:grid-cols-4`)
- Animated counters from TrustStats (reuse `AnimatedCounter` pattern)
- Each stat: large number (`text-3xl font-bold`) + label (`text-xs uppercase tracking-[0.14em]`)
- Scroll-triggered: only animate when `isInView`
- `useReducedMotion` fallback: show final values instantly
- Uses `[font-family:var(--home-display)]` for numbers

---

### 4.3 ProblemStatement (REWRITE)
**File:** `app/[locale]/(home)/components/ProblemStatement.tsx`  
**'use client':** YES (framer-motion)

**Layout:** Asymmetric 2-column on desktop, stacked on mobile

```
┌──────────────────────────────────────────────────────────┐
│  THE GAP                              ┌───────────────┐  │
│                                       │ ⚠ False       │  │
│  Results tell you if you              │   Confidence   │  │
│  were paid, not if you were good.     └───────────────┘  │
│                                       ┌───────────────┐  │
│  Average traders celebrate outcomes.  │ 🧠 Decision    │  │
│  Elite traders audit decisions.       │   Drift        │  │
│                                       └───────────────┘  │
│  ┌─────────────────────────────┐      ┌───────────────┐  │
│  │ MINDSET UPGRADE             │      │ ↻ No          │  │
│  │ Promote process to first-   │      │   Performance  │  │
│  │ class data.                 │      │   Loop        │  │
│  └─────────────────────────────┘      └───────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Animations:**
- Left column: `motion.div` with `fadeIn` from left
- Right column cards: stagger reveal, each with 80ms delay
- Mindset Upgrade box: `border-primary/30 bg-primary/10` with subtle pulse on border

**Content:** Keep existing copy (it's strong). Restructure layout only.

---

### 4.4 FeaturesBento (REWRITE from Features)
**File:** `app/[locale]/(home)/components/FeaturesBento.tsx` (NEW file, delete Features.tsx)  
**'use client':** YES (framer-motion)

**Layout:** Asymmetric bento grid, NOT uniform 3-col cards

```
┌─────────────────────┬──────────────┐
│                     │              │
│  Advanced Analytics │  AI Insights │
│  (large, 2-col)     │  (1-col)     │
│  BarChart3 icon     │  Brain icon  │
│                     │              │
├──────────┬──────────┴──────────────┤
│          │                         │
│ Team     │  Multi-Broker Import    │
│ Sync     │  (large, 2-col)         │
│          │  Download icon           │
│          │                         │
├──────────┴──────────┬──────────────┤
│                     │              │
│ Coach-Ready Exports │ Enterprise   │
│ (1-col)             │ Security     │
│                     │              │
└─────────────────────┴──────────────┘
```

**Grid:** `grid-cols-4` with specific spans:
- Card 0 (Analytics): `col-span-2 row-span-1`
- Card 1 (AI Insights): `col-span-2 row-span-1`, highlighted (`border-primary/25`)
- Card 2 (Team Sync): `col-span-1 row-span-1`
- Card 3 (Multi-Broker): `col-span-3 row-span-1`
- Card 4 (Exports): `col-span-2 row-span-1`
- Card 5 (Security): `col-span-2 row-span-1`

**Animations:**
- Each card: `motion.div` with `whileInView={{ opacity: 1, y: 0 }}`, stagger 60ms
- Highlighted card: subtle `shadow-[0_0_32px_-12px_hsl(var(--primary)/0.15)]` pulse

**Content:** Keep existing feature data. Restructure grid only.

---

### 4.5 DashboardPreview (REWRITE)
**File:** `app/[locale]/(home)/components/DashboardPreview.tsx`  
**'use client':** NO (static mock is fine, parent handles animation)

**Enhancements:**
- Add metric callout badges floating over the chart area:
  - "+$12,847 P&L" badge with green border
  - "78% Win Rate" badge
  - "2.34 Profit Factor" badge
- Add subtle glow effect: `shadow-[0_0_60px_-15px_hsl(var(--primary)/0.2)]` on the browser chrome
- Scanner line animation: keep existing
- Add "Live" indicator dot (pulsing green) in the browser chrome bar
- Rounded corners: `rounded-t-xl` on chrome, `rounded-b-2xl` on bottom

**No framer-motion here** — animation handled by parent Hero wrapper.

---

### 4.6 HowItWorks (REWRITE)
**File:** `app/[locale]/(home)/components/HowItWorks.tsx`  
**'use client':** YES (framer-motion)

**Layout:** Horizontal 5-step connected pipeline

```
  01          02          03          04          05
 Sync       Define      Review      Detect      Improve
 Data       Rules      Session      Drift      Weekly
  ●──────────●──────────●──────────●──────────●
```

**Structure:**
- `md:grid-cols-5` grid
- Connecting line: `absolute` positioned horizontal line behind step circles
- Each step: circle with number → label → description
- Mobile: stacked vertical with vertical connecting line

**Animations:**
- Each step: `motion.div` with stagger reveal (100ms between each)
- Connecting line: `motion.div` with `scaleX` animation from 0 to 1
- Uses `marketing-panel` class for card styling

---

### 4.7 AnalysisDemo (KEEP, minor polish)
**File:** `app/[locale]/(home)/components/AnalysisDemo.tsx`  
**Changes:**
- Wrap outer section in `motion.section` with `whileInView` fade-in
- No other structural changes — mock data is fine, chart is good

---

### 4.8 AudienceSegmentation (NEW from Qualification)
**File:** `app/[locale]/(home)/components/AudienceSegmentation.tsx`  
**'use client':** YES (framer-motion)

**Layout:** 2-column cards, "Best Fit" vs "Not Ideal" approach (from Qualification)

```
┌──────────────────────────┬──────────────────────────┐
│  FOR PROP FIRM TRADERS   │  FOR FUTURES TRADERS     │
│                          │                          │
│  • Optimize consistency  │  • Build repeatable      │
│  • Protect funded edge   │    routines              │
│  • Team process audit    │  • Eliminate emotional   │
│  • Multi-account review  │    drift                 │
│                          │  • Track execution       │
│  [Get Started →]         │    quality               │
│                          │  [Get Started →]         │
└──────────────────────────┴──────────────────────────┘
```

**Content:**
- Left: "For Prop Firm Traders" — prop firm specific bullets
- Right: "For Independent Traders" — futures trader specific bullets
- Each with CTA link
- Motion: cards slide in from left/right respectively

---

### 4.9 AIFeatures (REWRITE from AIFuturesSection)
**File:** `app/[locale]/(home)/components/AIFeatures.tsx` (NEW file, delete AIFuturesSection.tsx)  
**'use client':** YES (framer-motion)

**Layout:** Bento grid, NO tabs. Show all features in one view.

```
┌──────────────────────┬──────────────────────┐
│                      │                      │
│  Behavior Drift      │  AI Session          │
│  Radar               │  Debrief             │
│  (Radar icon)        │  (Bot icon)          │
│                      │                      │
├──────────┬───────────┴──────────────────────┤
│          │                                   │
│ Execution│  Playbook Auto-Builder            │
│ Quality  │  + Risk Alerts + Weekly Briefs    │
│ Score    │  (3 mini-cards in a row)          │
│          │                                   │
└──────────┴──────────────────────────────────┘
│  AI decisions stay auditable...  [Explainable AI] │
└────────────────────────────────────────────────────┘
```

**Grid:** `grid-cols-3` with specific spans
- Card 0 (Drift Radar): `col-span-1`
- Card 1 (Session Debrief): `col-span-1`
- Card 2 (Exec Quality): `col-span-1`
- Card 3 (Auto-Builder): `col-span-1`
- Card 4 (Risk Alerts): `col-span-1`
- Card 5 (Weekly Briefs): `col-span-1`
- Footer: full-width glass card

**Animation:** Stagger reveal, 60ms between cards

---

### 4.10 SocialProof (NEW merged section)
**File:** `app/[locale]/(home)/components/SocialProof.tsx`  
**'use client':** YES (framer-motion)

**Merges:** WhyChooseUs stats + TrustAndProof testimonials + trust pillars

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Stats Row: < 7min | In Session | 100%                      │
│  (from WhyChooseUs proofStats)                               │
├──────────────────────┬──────────────────────────────────────┤
│                      │                                      │
│  Testimonial 1       │  Trust Pillars (2x2 grid)            │
│  "The review         │  • Security By Design                │
│   cadence..."        │  • Reliable Operations               │
│  — Futures Trader    │  • Data You Control                  │
│                      │  • Support You Can Reach              │
├──────────────────────┤                                      │
│  Testimonial 2       │                                      │
│  "Our team..."       │                                      │
│  — Desk Manager      │                                      │
├──────────────────────┤                                      │
│  Testimonial 3       │                                      │
│  "The weekly         │                                      │
│   brief..."          │                                      │
│  — Mentor / Coach    │                                      │
└──────────────────────┴──────────────────────────────────────┘
```

**Animation:** Stats animate in first, then testimonials stagger from left, pillars from right

---

### 4.11 ComparisonSection (KEEP, minor polish)
**File:** `app/[locale]/(home)/components/ComparisonSection.tsx`  
**Changes:**
- Wrap each table row in `motion.tr` with stagger reveal
- No other structural changes

---

### 4.12 PropFirmsExplorer (KEEP as-is)
**File:** `app/[locale]/(home)/components/PropFirmsExplorer.tsx`  
**No changes.** Already well-structured with real data.

---

### 4.13 RollingAdBanner (KEEP as-is)
**File:** `app/[locale]/(home)/components/RollingAdBanner.tsx`  
**No changes.** Already functional with real data.

---

### 4.14 PricingSection (REWRITE)
**File:** `app/[locale]/(home)/components/PricingSection.tsx`  
**'use client':** YES (billing toggle)

**Enhancements:**
- Glassmorphism card style: `bg-card/60 backdrop-blur-sm border-border/40`
- Featured card: `border-primary/30 bg-card/80 shadow-[0_0_48px_-16px_hsl(var(--primary)/0.2)]`
- Animated entrance: `motion.div` for each card
- Better visual hierarchy: larger price, clearer feature list with icons
- Keep existing billing toggle logic

---

### 4.15 FAQSection (KEEP, minor polish)
**File:** `app/[locale]/(home)/components/FAQSection.tsx`  
**Changes:**
- Add `motion.div` wrapper on section entrance
- Accordion animation is already smooth (grid-rows trick)
- No content changes

---

### 4.16 FinalCTA (REWRITE)
**File:** `app/[locale]/(home)/components/FinalCTA.tsx`  
**'use client':** NO (static, parent can handle animation)

**Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│  ╔════════════════════════════════════════════════════════╗  │
│  ║                                                       ║  │
│  ║  Ready to trade smarter?                              ║  │
│  ║  Join 50,000+ traders...                              ║  │
│  ║                                                       ║  │
│  ║  [Start Free Audit]                                  ║  │
│  ║  No credit card · Setup in 2 minutes                 ║  │
│  ║                                                       ║  │
│  ╚════════════════════════════════════════════════════════╝  │
│  (ambient glow: radial-gradient primary/0.12 from bottom)    │
└──────────────────────────────────────────────────────────────┘
```

**Styling:**
- `marketing-panel` class with rounded-3xl
- Ambient glow: `bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,hsl(var(--primary)/0.12),transparent)]`
- CTA button: `btn-primary-glow` with large shadow
- Centered, `max-w-3xl`

---

### 4.17 HomeContent (FULL RESTRUCTURE)
**File:** `app/[locale]/(home)/components/HomeContent.tsx`  
**'use client':** NO (Server Component, children handle their own client state)

**New Structure:**
```tsx
import dynamic from 'next/dynamic'
import Hero from './Hero'
import LiveStatsStrip from './LiveStatsStrip'
import ProblemStatement from './ProblemStatement'
import FeaturesBento from './FeaturesBento'
import DashboardPreview from './DashboardPreview'
import HowItWorks from './HowItWorks'
import AnalysisDemo from './AnalysisDemo'
import AudienceSegmentation from './AudienceSegmentation'
import AIFeatures from './AIFeatures'
import SocialProof from './SocialProof'
import ComparisonSection from './ComparisonSection'
import PricingSection from './PricingSection'
import FAQSection from './FAQSection'
import FinalCTA from './FinalCTA'
import PropFirmsExplorer from './PropFirmsExplorer'
import RollingAdBanner from './RollingAdBanner'

const SectionSkeleton = () => <div className="min-h-24 w-full" />

// Lazy-load below-fold sections
const LazyHowItWorks = dynamic(() => import('./HowItWorks'), { loading: SectionSkeleton })
const LazyAnalysisDemo = dynamic(() => import('./AnalysisDemo'), { loading: SectionSkeleton })
const LazyAudienceSegmentation = dynamic(() => import('./AudienceSegmentation'), { loading: SectionSkeleton })
const LazyAIFeatures = dynamic(() => import('./AIFeatures'), { loading: SectionSkeleton })
const LazySocialProof = dynamic(() => import('./SocialProof'), { loading: SectionSkeleton })
const LazyComparisonSection = dynamic(() => import('./ComparisonSection'), { loading: SectionSkeleton })
const LazyPricingSection = dynamic(() => import('./PricingSection'), { loading: SectionSkeleton })
const LazyFAQSection = dynamic(() => import('./FAQSection'), { loading: SectionSkeleton })

export default function HomeContent({ locale }: { locale: string }) {
  return (
    <div className="relative overflow-x-hidden bg-background">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_480px_at_50%_-10%,hsl(var(--foreground)/0.04),transparent_68%)]" />
      <div className="pointer-events-none absolute inset-0 hidden marketing-grid opacity-[0.12] sm:block" />
      
      <main className="relative z-10 mx-auto w-full max-w-[1360px]">
        {/* Above fold — immediate render */}
        <Hero locale={locale} />
        <LiveStatsStrip />
        
        {/* Below fold — lazy loaded */}
        <ProblemStatement />
        <FeaturesBento />
        <LazyHowItWorks />
        <LazyAnalysisDemo />
        <LazyAudienceSegmentation />
        <LazyAIFeatures />
        <LazySocialProof />
        <LazyComparisonSection />
        
        {/* Real data sections */}
        <RollingAdBanner />
        <PropFirmsExplorer locale={locale} />
        
        {/* Conversion sections */}
        <LazyPricingSection />
        <LazyFAQSection />
        <FinalCTA locale={locale} />
      </main>
    </div>
  )
}
```

**Note:** PropFirmsExplorer and RollingAdBanner are Server Components that fetch real data. They must NOT be dynamically imported. Hero, LiveStatsStrip, ProblemStatement, and FeaturesBento are above-fold and should render immediately.

---

## 5. Parallel Execution Waves

### Wave 0 — Foundation (SEQUENTIAL, blocks all others)
**Duration:** ~15 min

| Task ID | Description | Category | Skills | File(s) |
|---------|-------------|----------|--------|---------|
| W0.1 | Delete orphan files: `DeferredHomeSections.tsx`, `OnboardingJourney.tsx`, `ProofStrip.tsx`, `Differentiators.tsx`, `Qualification.tsx`, `TrustStats.tsx`, `CTA.tsx`, `TrustStrip.tsx` | quick | `omc-reference` | 8 files |
| W0.2 | Restructure `HomeContent.tsx` with new section order (import new components, use dynamic imports for below-fold) | quick | `omc-reference`, `next-best-practices` | 1 file |

### Wave 1 — Independent Rewrites (PARALLEL, 6 agents)
**Duration:** ~30-40 min each  
**Dependencies:** Wave 0 complete

| Task ID | Description | Category | Skills | File(s) |
|---------|-------------|----------|--------|---------|
| W1.1 | Rewrite `Hero.tsx` — problem-first headline, framer-motion stagger animations, broker logos, integrate DashboardPreview child | visual-engineering | `frontend-design`, `omc-reference`, `next-best-practices` | Hero.tsx |
| W1.2 | Create `LiveStatsStrip.tsx` — animated counters (2,400+ traders, $12M funded, 100% coverage, 24/7 support), scroll-triggered, `useReducedMotion` fallback | visual-engineering | `frontend-design`, `omc-reference` | LiveStatsStrip.tsx (NEW) |
| W1.3 | Rewrite `ProblemStatement.tsx` — asymmetric bento layout, framer-motion scroll-triggered card reveals, keep copy | visual-engineering | `frontend-design`, `omc-reference` | ProblemStatement.tsx |
| W1.4 | Create `FeaturesBento.tsx` — bento grid (not uniform cards), `grid-cols-4` with specific spans, framer-motion stagger, highlight AI card | visual-engineering | `frontend-design`, `omc-reference` | FeaturesBento.tsx (NEW) |
| W1.5 | Rewrite `HowItWorks.tsx` — horizontal 5-step pipeline with connected dots/line, framer-motion stagger, mobile vertical fallback | visual-engineering | `frontend-design`, `omc-reference` | HowItWorks.tsx |
| W1.6 | Rewrite `DashboardPreview.tsx` — add floating metric callout badges, glow effect, "Live" indicator, enhanced browser chrome | visual-engineering | `frontend-design`, `omc-reference` | DashboardPreview.tsx |

### Wave 2 — Independent Rewrites (PARALLEL, 5 agents)
**Duration:** ~30-40 min each  
**Dependencies:** Wave 0 complete (can run parallel with Wave 1)

| Task ID | Description | Category | Skills | File(s) |
|---------|-------------|----------|--------|---------|
| W2.1 | Create `AudienceSegmentation.tsx` — 2-column cards (Prop Firm Traders vs Independent Traders), framer-motion slide-in | visual-engineering | `frontend-design`, `omc-reference` | AudienceSegmentation.tsx (NEW) |
| W2.2 | Create `AIFeatures.tsx` — bento grid of all 6 AI features (no tabs), glass footer card, framer-motion stagger | visual-engineering | `frontend-design`, `omc-reference` | AIFeatures.tsx (NEW) |
| W2.3 | Create `SocialProof.tsx` — merge stats + testimonials + trust pillars, asymmetric layout, framer-motion reveals | visual-engineering | `frontend-design`, `omc-reference` | SocialProof.tsx (NEW) |
| W2.4 | Rewrite `PricingSection.tsx` — glassmorphism cards, better visual hierarchy, framer-motion entrance, keep billing toggle logic | visual-engineering | `frontend-design`, `omc-reference` | PricingSection.tsx |
| W2.5 | Rewrite `FinalCTA.tsx` — bold gradient CTA with ambient glow, marketing-panel class, centered layout | visual-engineering | `frontend-design`, `omc-reference` | FinalCTA.tsx |

### Wave 3 — Polish Passes (PARALLEL, 3 agents)
**Duration:** ~20 min each  
**Dependencies:** Wave 1 + Wave 2 complete

| Task ID | Description | Category | Skills | File(s) |
|---------|-------------|----------|--------|---------|
| W3.1 | Polish `AnalysisDemo.tsx` — wrap in motion.section, add whileInView fade-in, ensure mobile responsive | visual-engineering | `frontend-design`, `omc-reference` | AnalysisDemo.tsx |
| W3.2 | Polish `ComparisonSection.tsx` — add framer-motion row reveals, section entrance animation | visual-engineering | `frontend-design`, `omc-reference` | ComparisonSection.tsx |
| W3.3 | Polish `FAQSection.tsx` — add motion.div section entrance, ensure accordion animation smooth | visual-engineering | `frontend-design`, `omc-reference` | FAQSection.tsx |

### Wave 4 — Integration + QA (SEQUENTIAL)
**Duration:** ~30 min  
**Dependencies:** All waves complete

| Task ID | Description | Category | Skills | File(s) |
|---------|-------------|----------|--------|---------|
| W4.1 | Integration test — verify HomeContent renders all sections in order, no missing imports, no duplicate renders | unspecified-low | `omc-reference`, `webapp-testing` | HomeContent.tsx |
| W4.2 | Delete `Features.tsx` and `AIFuturesSection.tsx` (superseded by new files), remove any stale imports | quick | `omc-reference` | 2 files |
| W4.3 | Full build verification — `npm run typecheck`, `npm run lint`, visual spot-check with Playwright | unspecified-low | `webapp-testing`, `omc-reference` | — |

---

## 6. Dependency Graph (Visual)

```
W0.1 (Delete orphans) ─┐
                        ├─► W1.1 (Hero)
W0.2 (Restructure      ├─► W1.2 (LiveStatsStrip)
       HomeContent) ───┤
                        ├─► W1.3 (ProblemStatement)
                        ├─► W1.4 (FeaturesBento)
                        ├─► W1.5 (HowItWorks)
                        ├─► W1.6 (DashboardPreview)
                        │
                        ├─► W2.1 (AudienceSegmentation)
                        ├─► W2.2 (AIFeatures)
                        ├─► W2.3 (SocialProof)
                        ├─► W2.4 (PricingSection)
                        ├─► W2.5 (FinalCTA)
                        │
                        │   W1.* + W2.* ──► W3.1 (AnalysisDemo polish)
                        │                  ► W3.2 (ComparisonSection polish)
                        │                  ► W3.3 (FAQSection polish)
                        │
                        │   W3.* ──► W4.1 (Integration test)
                        │            ► W4.2 (Delete stale files)
                        │            ► W4.3 (Build verification)
```

---

## 7. Atomic Commit Strategy

Each wave produces one commit. Commits are atomic and self-contained.

| Commit | Wave | Message | Scope |
|--------|------|---------|-------|
| 1 | W0 | `refactor(home): remove orphan components, restructure HomeContent section order` | Delete 8 files, rewrite HomeContent.tsx |
| 2 | W1 | `feat(home): rewrite hero, stats strip, problem statement, features bento, how-it-works, dashboard preview` | Hero.tsx, LiveStatsStrip.tsx, ProblemStatement.tsx, FeaturesBento.tsx, HowItWorks.tsx, DashboardPreview.tsx |
| 3 | W2 | `feat(home): add audience segmentation, AI features bento, social proof, rewrite pricing and final CTA` | AudienceSegmentation.tsx, AIFeatures.tsx, SocialProof.tsx, PricingSection.tsx, FinalCTA.tsx |
| 4 | W3 | `style(home): add scroll-triggered animations to analysis demo, comparison, FAQ sections` | AnalysisDemo.tsx, ComparisonSection.tsx, FAQSection.tsx |
| 5 | W4 | `chore(home): delete superseded files, fix build verification` | Features.tsx, AIFuturesSection.tsx, typecheck/lint fixes |

**Branch strategy:** All work on a feature branch `feat/home-redesign`, squash-merge to `v2` when complete.

---

## 8. TDD-Oriented Verification Strategy

### Per-Task Verification (each agent MUST do):
1. **TypeScript:** `npx tsc --noEmit` on changed file(s) — zero errors
2. **LSP Diagnostics:** Run on each changed file — zero errors
3. **Import Check:** Every import resolves, no circular deps
4. **Responsive:** Component renders correctly at 375px, 768px, 1280px
5. **Reduced Motion:** All animations respect `prefers-reduced-motion`
6. **i18n:** All visible text uses `useI18n()` or is i18n-ready (accept `locale` prop)

### Wave-Level Verification:
- **Wave 0:** `npm run typecheck` passes (may have missing import errors for new components — acceptable)
- **Wave 1+2:** `npm run typecheck` passes, `npm run lint` passes
- **Wave 3:** Visual spot-check with Playwright screenshots
- **Wave 4:** Full `npm run build` passes

### Regression Prevention:
- No component should render twice
- PropFirmsExplorer must still fetch real data
- RollingAdBanner must still fetch real deals
- All existing routes unaffected

---

## 9. Risk Assessment

| Risk | Mitigation |
|------|------------|
| Dynamic imports break Server Components | PropFirmsExplorer + RollingAdBanner are NOT dynamically imported (they need server data) |
| Framer-motion bundle size | Lazy-load below-fold animated sections; use `whileInView` (not `useAnimation`) |
| Build fails due to DB connection | Expected — `npm run build` requires localhost:5432. Use `npm run typecheck` + `npm run lint` during dev |
| Duplicate renders | HomeContent is single source of truth. No DeferredHomeSections. |
| Missing i18n keys | All text in components should use `useI18n()` or accept `locale` prop. Add locale keys after visual approval. |

---

## 10. File Impact Summary

### New Files (5)
- `app/[locale]/(home)/components/LiveStatsStrip.tsx`
- `app/[locale]/(home)/components/FeaturesBento.tsx`
- `app/[locale]/(home)/components/AudienceSegmentation.tsx`
- `app/[locale]/(home)/components/AIFeatures.tsx`
- `app/[locale]/(home)/components/SocialProof.tsx`

### Rewritten Files (10)
- `app/[locale]/(home)/components/Hero.tsx`
- `app/[locale]/(home)/components/DashboardPreview.tsx`
- `app/[locale]/(home)/components/ProblemStatement.tsx`
- `app/[locale]/(home)/components/HowItWorks.tsx`
- `app/[locale]/(home)/components/PricingSection.tsx`
- `app/[locale]/(home)/components/FinalCTA.tsx`
- `app/[locale]/(home)/components/AnalysisDemo.tsx` (polish)
- `app/[locale]/(home)/components/ComparisonSection.tsx` (polish)
- `app/[locale]/(home)/components/FAQSection.tsx` (polish)
- `app/[locale]/(home)/components/HomeContent.tsx`

### Deleted Files (10)
- `app/[locale]/(home)/components/DeferredHomeSections.tsx`
- `app/[locale]/(home)/components/Features.tsx`
- `app/[locale]/(home)/components/TrustStrip.tsx`
- `app/[locale]/(home)/components/OnboardingJourney.tsx`
- `app/[locale]/(home)/components/ProofStrip.tsx`
- `app/[locale]/(home)/components/Differentiators.tsx`
- `app/[locale]/(home)/components/Qualification.tsx`
- `app/[locale]/(home)/components/TrustStats.tsx`
- `app/[locale]/(home)/components/CTA.tsx`
- `app/[locale]/(home)/components/AIFuturesSection.tsx`

### Unchanged Files (6)
- `app/[locale]/(home)/components/PropFirmsExplorer.tsx`
- `app/[locale]/(home)/components/RollingAdBanner.tsx`
- `app/[locale]/(home)/components/SearchHero.tsx`
- `app/[locale]/(home)/components/FilterChips.tsx`
- `app/[locale]/(home)/components/FirmCardsGrid.tsx`
- `app/[locale]/(home)/components/FirmCard.tsx`
- `app/[locale]/(home)/components/prop-firm-utils.ts`
- `app/[locale]/(home)/components/analysis-demo-chart.tsx`
- `app/[locale]/(home)/page.tsx`
- `app/[locale]/(home)/layout.tsx`
- `app/[locale]/(home)/loading.tsx`

### Total: 5 new + 10 rewritten + 10 deleted + 11 unchanged = **36 files** (was 35 + 1 new)
