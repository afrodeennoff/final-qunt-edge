# Phase 01: Visual Refresh — UI Design Contract

**Status**: Planning  
**Phase**: 01 — Visual Refresh  
**Milestone**: v2.1 Production Hardening  
**Generated**: 2026-04-10

---

## Contract Overview

This document is the **prescriptive design contract** for Phase 01: Visual Refresh. It defines the complete visual language, component patterns, motion system, and implementation rules for achieving Resend/Expo-quality polish across the Qunt Edge application.

**Lock Status**:
- [x] Anchor color preserved: `--primary: oklch(0.55 0.22 264)` (Precision Blue)
- [x] Dark-only theme enforced
- [x] Layer on existing V2 design system — no rewrite

---

## 1. Design Philosophy

### 1.1 Core Principles

| # | Principle | Application |
|---|-----------|-------------|
| P1 | **Frost/Terminal Aesthetic** | Dark surfaces with subtle blue-white borders, glass-morphism overlays, muted backgrounds |
| P2 | **Single Accent Rule** | Key color (`--primary`) used only for active states, icon badges, progress fills — never large backgrounds |
| P3 | **No Pure Black** | Strongest surface: `#2A2A2A` (`--legacy-black: 0 0% 0%`) — never `#000000` |
| P4 | **4-Step Text Hierarchy** | Primary (#E8E8E8) → Secondary (#9B9B9B) → Tertiary (#7A7A7A) → Disabled (#555555) |
| P5 | **Orchestrated Motion** | Multi-stage reveals (icon → label → metric → trend) with spring physics |
| P6 | **Consistent Spacing** | Universal section gap: `space-y-6` (24px) |
| P7 | **Card Transparency** | Border: `border-[hsl(var(--border)/0.18)]`, Background: `bg-[hsl(var(--card)/0.88)]` |

### 1.2 Reference Aesthetic

**Target**: Resend.com + Expo.dev quality
- Frost borders: subtle blue-white glow borders
- Terminal aesthetic: monospace accents, precision metrics
- Clean hierarchy: generous whitespace, clear typographic rhythm
- Micro-interactions: spring-based, orchestrated reveals

---

## 2. Color System

### 2.1 Semantic Tokens

```css
/* === Core Semantic (from globals.css) === */
--primary: oklch(0.55 0.22 264);           /* Precision Blue - brand anchor */
--primary-foreground: oklch(1 0 0);        /* White on primary */
--background: oklch(0 0% 0%);              /* Deep Obsidian #050505 */
--foreground: oklch(0.97 0 0);             /* Near white #F5F5F5 */
--card: oklch(0.07 0 0);                  /* Panel #0b0b0d */
--card-foreground: oklch(0.95 0 0);        /* #F0F0F0 */
--border: oklch(0.14 0 0);                /* Subtle #1A1A21 */
--muted: oklch(0.18 0.01 270);            /* Muted surface */
--muted-foreground: oklch(0.76 0.015 275); /* Muted text */
--accent: oklch(0.24 0.03 265);           /* Secondary accent */
--success: oklch(0.55 0.15 166);          /* Gain Green #089981 */
--warning: oklch(0.65 0.2 45);            /* Caution Orange #FB8C00 */
--destructive: oklch(0.6 0.2 15);         /* Loss Red #F23645 */
```

### 2.2 StyleSeed Text Hierarchy (Rule 2)

```css
/* === StyleSeed 5-Level Grayscale === */
--text-strong:    #FFFFFF;     /* Primary text / metrics */
--text-primary:   #E8E8E8;     /* Secondary / labels */
--text-secondary: #9B9B9B;     /* Tertiary / subtitles */
--text-tertiary:  #7A7A7A;     /* Disabled / inactive */
--text-disabled:  #555555;     /* Forbidden: pure black */
```

### 2.3 Frost Border System

```css
/* === Frost Borders (Resend-inspired) === */
--frost-border: rgba(214, 235, 253, 0.15);       /* Default frost */
--frost-border-strong: rgba(214, 235, 253, 0.22); /* Emphasis frost */
--frost-border-alt: rgba(217, 237, 254, 0.08);    /* Subtle frost */
--frost-shadow: none;                              /* No shadow in dark mode */
```

### 2.4 Impact Colors

```css
/* === Impact Colors (small areas only) === */
--impact-success: #6B9B7A;     /* Success / Up trend */
--impact-urgent: #C85A54;      /* Urgent / Error */
--impact-info: #3B82F6;        /* Info / In Progress */
--impact-warning: #F59E0B;      /* Pending / Warning */
--impact-notification: #FF4444; /* Notification dot */
```

### 2.5 Color Usage Rules

| Usage | Token | Forbidden |
|-------|-------|----------|
| Primary actions, active states | `--primary` | Large area fills, backgrounds |
| Icon badges | `bg-primary/10` | Full card backgrounds |
| Progress fills | `--primary` | Mass area coverage |
| Card backgrounds | `hsl(var(--card))` | `--primary` as bg |
| Borders | `hsl(var(--border))` | Key color borders |
| Success indicators | `--success` | Accent color misuse |
| Error states | `--destructive` | Accent color misuse |

---

## 3. Typography System

### 3.1 StyleSeed 14-Step Scale

```css
/* === StyleSeed Type Scale === */
--type-2xs: 0.625rem;   /* 10px - micro labels */
--type-xs: 0.75rem;     /* 12px - uppercase labels */
--type-sm: 0.8125rem;    /* 13px - captions */
--type-base: 0.875rem;   /* 14px - body */
--type-md: 0.9375rem;    /* 15px - body large */
--type-lg: 1.125rem;     /* 18px - headings */
--type-xl: 1.25rem;      /* 20px - subheadings */
--type-2xl: 1.5rem;      /* 24px - section titles */
--type-3xl: 1.875rem;    /* 30px - page titles */
--type-4xl: 2.25rem;     /* 36px - hero subtitles */
--type-5xl: 3rem;        /* 48px - hero titles */
```

### 3.2 Number + Unit Ratio (Rule 2)

**Requirement**: All metrics/statistics must use 2:1 ratio

```tsx
// Correct implementation
<div className="flex items-baseline whitespace-nowrap">
  <span className="text-[36px] font-bold leading-none text-foreground">
    {value}
  </span>
  <span className="text-[18px] ms-0.5 text-muted-foreground">
    {unit}
  </span>
</div>

// Forbidden: 36px value, 14px unit (wrong ratio)
// Correct: 36px value, 18px unit (2:1 ratio)
```

### 3.3 Labels

```tsx
// Labels: 12px uppercase with tracking
<p className="text-[12px] text-muted-foreground font-medium uppercase tracking-[0.05em]">
  {label}
</p>
```

### 3.4 Font Families

```css
--font-sans: Geist, sans-serif;      /* Primary sans */
--font-mono: Geist Mono, monospace;   /* Terminal/metrics */
--font-serif: Georgia, serif;         /* Decorative only */
```

---

## 4. Spacing System

### 4.1 Section Spacing (Universal)

```css
/* === Universal Section Gap === */
.space-y-section { gap: 1.5rem; }  /* 24px - between sections */
.space-y-6 { gap: 1.5rem; }        /* Standard spacing */
```

### 4.2 Page Margins

```css
/* === Page Width === */
--page-max-marketing: 1320px;      /* Marketing shell */
--page-max-mobile: 430px;           /* Mobile marketing */
--page-max-content: 768px;          /* Content pages */

/* === Section Types (Rule 14) === */
.section-type-a { margin-x: 1.5rem; }     /* Single floating card */
.section-type-b { padding-x: 1.5rem; }     /* Grid of cards */
.section-type-c { padding-x: 1.5rem; }     /* Carousel */
.section-type-d { margin-x: 1.5rem; padding: 2rem; } /* Hero */
```

### 4.3 Card Spacing

```tsx
// Standard card padding
<div className="rounded-2xl p-6 bg-card shadow-card border border-[hsl(var(--border)/0.18)]">

// Card with title
<div className="rounded-2xl p-6">
  <h3 className="text-[18px] font-semibold text-foreground mb-6">
    {title}
  </h3>
  {children}
</div>
```

---

## 5. Component System

### 5.1 Pattern Components (Required)

All pattern components exist in `components/patterns/`. Use these for all new work.

| Component | Purpose | File |
|-----------|---------|------|
| `StatCard` | Icon → label → metric → trend | `stat-card.tsx` |
| `HeroCard` | Hero with watermark | `hero-card.tsx` |
| `SectionCard` | Section wrapper | `section-card.tsx` |
| `ChartCard` | Charts with period toggle | `chart-card.tsx` |
| `DonutChartCard` | Donut charts | `donut-chart-card.tsx` |
| `BriefingCarousel` | Horizontal scrolling | `briefing-carousel.tsx` |
| `PageShell` | Page container | `page-shell.tsx` |
| `PageContent` | Page content wrapper | `page-content.tsx` |
| `RankedList` | Ranked items | `ranked-list.tsx` |
| `EmptyState` | Empty states | `empty-state.tsx` |
| `ListItem` | List items | `list-item.tsx` |
| `TopBar` | Navigation header | `top-bar.tsx` |
| `BottomNav` | Mobile navigation | `bottom-nav.tsx` |

### 5.2 StatCard Implementation

```tsx
import { StatCard } from '@/components/patterns/stat-card'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string
  unit?: string
  trend?: {
    value: string
    direction: 'up' | 'down'
    label?: string
  }
  className?: string
}

// Usage
<StatCard
  icon={TrendingUp}
  label="Total P&L"
  value="$24,580"
  unit="USD"
  trend={{ value: "+12.4%", direction: 'up', label: 'vs last month' }}
/>
```

### 5.3 SectionCard Implementation

```tsx
import { SectionCard } from '@/components/patterns/section-card'

// Basic
<SectionCard>
  <StatCard icon={Chart} label="Trades" value="1,234" />
</SectionCard>

// With title
<SectionCard title="Performance Overview">
  {children}
</SectionCard>
```

### 5.4 Card Structure Pattern

```
┌─────────────────────────────────────┐
│  [Icon Badge]                       │  ← bg-primary/10, rounded-lg
│  LABEL                              │  ← text-[12px], uppercase, tracking
│                                     │
│  36px VALUE  18px UNIT             │  ← 2:1 ratio
│                                     │
│  +12.4% vs last month               │  ← trend indicator
└─────────────────────────────────────┘
```

---

## 6. Motion System

### 6.1 Motion Tokens

```tsx
// From enhanced-motion.tsx
const SPRING_GENTLE = { type: "spring" as const, stiffness: 300, damping: 20 }
export const SPRING_BOUNCY = { type: "spring" as const, stiffness: 400, damping: 15 }

export const MOTION_DURATION = {
  fast: 100,    // hover, color changes
  normal: 200,   // enter animations
  slow: 350,    // page transitions
}

export const MOTION_EASE = {
  default: [0.4, 0, 0.2, 1],
  spring: [0.22, 1, 0.36, 1],
  entrance: [0.16, 1, 0.3, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
}
```

### 6.2 Orchestrated Entrance Pattern

```tsx
// Multi-stage reveal: icon → label → metric → trend
<motion.div
  variants={{
    icon: { scale: 0, opacity: 0 },
    label: { y: 20, opacity: 0 },
    metric: { y: 20, opacity: 0 },
    trend: { y: 20, opacity: 0 }
  }}
  initial="icon"
  animate="label"
  transition={{ 
    duration: MOTION_DURATION.slow / 1000,
    ease: MOTION_EASE.spring,
    staggerChildren: 0.08
  }}
>
  {/* Content */}
</motion.div>
```

### 6.3 Scroll-Triggered Animation

```tsx
import { MotionSection } from '@/components/animation/enhanced-motion'

<MotionSection delay={0.1} threshold={0.1}>
  {children}
</MotionSection>
```

### 6.4 Staggered Children

```tsx
import { MotionStagger, MotionStaggerItem } from '@/components/animation/enhanced-motion'

<MotionStagger delay={0.08}>
  <MotionStaggerItem>
    <Card1 />
  </MotionStaggerItem>
  <MotionStaggerItem>
    <Card2 />
  </MotionStaggerItem>
  <MotionStaggerItem>
    <Card3 />
  </MotionStaggerItem>
</MotionStagger>
```

### 6.5 Reduced Motion Support

```tsx
// All motion components respect prefers-reduced-motion
import { useReducedMotion, usePrefersReducedMotion } from '@/components/animation/enhanced-motion'

// Hook available: usePrefersReducedMotion()
// Returns true if user prefers reduced motion
```

---

## 7. Layout System

### 7.1 Section Type Patterns (Rule 14)

#### Type A: Single Floating Card
```tsx
<section className="mx-6">
  <SectionCard>
    <HeroCard icon={Icon} label="Revenue" value="$12.4K" unit="M" />
  </SectionCard>
</section>
```

#### Type B: Grid of Cards
```tsx
<section className="px-6">
  <div className="grid gap-4">
    <StatCard icon={Icon} label="Trades" value="1,234" />
    <StatCard icon={Icon} label="Win Rate" value="68%" />
  </div>
</section>
```

#### Type C: Carousel
```tsx
<section className="px-6">
  <BriefingCarousel items={deals} />
</section>
```

#### Type D: Hero
```tsx
<section className="mx-6 p-8">
  <HeroCard icon={Icon} label="Welcome" value="Qunt Edge" />
</section>
```

### 7.2 Marketing Shell

```tsx
// From marketing-layout-shell.tsx
export default function MarketingLayoutShell({ children }) {
  return (
    <div className="marketing-shell min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}
```

### 7.3 Dashboard Layout

```tsx
// Dashboard uses widget system
// Widget chrome: border-[hsl(var(--border)/0.65)], bg-[hsl(var(--card)/0.95)]
// No stacked frames - direct widget surface only
```

---

## 8. Chart System (Rule 17)

### 8.1 Area Chart Requirements

```tsx
// StyleSeed Rule 17: Chart Styling
<Area
  type="monotone"
  dataKey="value"
  stroke="hsl(var(--primary))"
  strokeWidth={2.5}                    // Fixed stroke width
  fill="url(#gradient)"
  fillOpacity={0.15}                   // 15% opacity
/>
<defs>
  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
  </linearGradient>
</defs>
```

### 8.2 Chart Rules

| Rule | Value |
|------|-------|
| Stroke width | 2.5px |
| Gradient start opacity | 15% |
| Gradient end opacity | 0% |
| Axis labels | 10px, font-weight: 500 |
| Grid lines | `hsl(var(--chart-grid) / 0.42)`, dashed 2 6 |
| Tooltip | Custom styled per Recharts defaults |

---

## 9. Responsive Design

### 9.1 Breakpoints

```css
/* === Breakpoints === */
xs:   320px   /* Extra small */
sm:   480px   /* Small mobile */
md:   768px   /* Tablet */
lg:   1024px  /* Desktop */
xl:   1280px  /* Large desktop */
2xl:  1536px  /* Extra large */
```

### 9.2 Container Max Widths

```css
/* === Container Max Widths === */
--page-max-mobile: 430px;
--page-max-marketing: 1320px;
```

### 9.3 Mobile Patterns

```tsx
// Mobile-first approach
// Touch targets: minimum 44x44px
// Scroll behavior: smooth, -webkit-overflow-scrolling: touch
// Safe areas: env(safe-area-inset-*)
```

---

## 10. Implementation Rules

### 10.1 Token Usage

| Pattern | Usage | Example |
|---------|-------|---------|
| Colors | Always use CSS variables | `text-[hsl(var(--foreground))]` or `text-foreground` |
| Backgrounds | Use semantic tokens | `bg-card`, `bg-muted` |
| Borders | Use border token with opacity | `border border-[hsl(var(--border)/0.18)]` |
| Spacing | Use Tailwind spacing scale | `p-6`, `gap-4`, `space-y-6` |
| Typography | Use semantic classes | `text-foreground`, `text-muted-foreground` |

### 10.2 Forbidden Patterns

```tsx
// FORBIDDEN: Hardcoded hex colors
<span style={{ color: '#ffffff' }} />  // Use: text-foreground

// FORBIDDEN: Pure black
<span className="text-[#000000]" />    // Use: text-foreground or #2A2A2A

// FORBIDDEN: Key color backgrounds
<div className="bg-primary" />          // Use: bg-primary/10 for badges

// FORBIDDEN: Ad-hoc spacing
<div className="mb-5 mt-4" />            // Use: space-y-6 (24px universal)

// FORBIDDEN: Console logs
console.log('debug')                    // Use: console.warn or console.error

// FORBIDDEN: Type assertions
data as any                             // Use proper TypeScript types

// FORBIDDEN: Stacked frames
<Card><Card>content</Card></Card>      // Direct widget surface only
```

### 10.3 V2 Component Import

```tsx
// All new work uses V2 imports
import { CardV2 as Card, ButtonV2 as Button } from '@/components/ui/v2'

// For pattern components, use direct imports
import { StatCard } from '@/components/patterns/stat-card'
import { SectionCard } from '@/components/patterns/section-card'
```

---

## 11. File Modifications

### 11.1 Wave 1: Foundation

| File | Change |
|------|--------|
| `app/globals.css` | Add StyleSeed tokens if missing |
| `tailwind.config.ts` | Ensure font scale complete |
| `components/animation/enhanced-motion.tsx` | Verify StyleSeed motion tokens |
| `marketing-layout-shell.tsx` | Update max-width, section rhythm |
| `components/patterns/page-shell.tsx` | Create if missing |

### 11.2 Wave 2: Landing Pages

| File | Change |
|------|--------|
| `(home)/page.tsx` | Apply section types |
| `(landing)/pricing/page.tsx` | Apply Type B grid |
| `(landing)/propfirms/*/page.tsx` | Apply Type A/B hybrid |
| `(landing)/deals/page.tsx` | Apply Type B or Type C carousel |
| Footer, Navbar | Update spacing/typography |

### 11.3 Wave 3: Dashboard & Auth

| File | Change |
|------|--------|
| Dashboard charts | Apply Rule 17 styling |
| Dashboard stat cards | Apply Rule 2 (2:1 ratio) |
| Widget chrome | Minor V2 token refinements |
| Auth pages | Apply Type A two-column card |

### 11.4 Wave 4: Polish & Verification

| Check | Method |
|-------|--------|
| Hardcoded hex | ESLint rule + manual review |
| Pure black usage | Grep for `#000` and `#000000` |
| Console logs | ESLint `no-console` rule |
| Type assertions | ESLint `no-explicit-any` rule |
| Spacing consistency | Visual QA |

---

## 12. Success Criteria

### 12.1 Visual Requirements

- [ ] Frost/terminal design language consistent across all pages
- [ ] Dark-only theme enforced (no light mode branching)
- [ ] Stat cards follow 2:1 number:unit ratio
- [ ] All metrics use proper text hierarchy
- [ ] Section spacing uses `space-y-6` consistently
- [ ] Chart styling follows Rule 17 specifications
- [ ] Orchestrated motion on all interactive elements
- [ ] Reduced motion support functional

### 12.2 Technical Requirements

- [ ] No hardcoded hex colors (use semantic tokens)
- [ ] No pure black text (#000000)
- [ ] No console.log statements
- [ ] No `as any` type assertions
- [ ] ESLint passes with zero errors
- [ ] TypeScript strict mode passes
- [ ] Production build succeeds

### 12.3 Component Requirements

- [ ] All 12 pattern components exist and functional
- [ ] V2 components used for all new work
- [ ] Widget chrome follows design contract
- [ ] Auth pages use consistent card patterns

---

## 13. Anti-Pattern Checklist

```tsx
// Search patterns for anti-patterns
/\b#[0-9A-Fa-f]{6}\b/g          // Hardcoded hex colors
/#000000|#000\b/g                // Pure black
/console\.log\(/g                // Console logs
/\bas\s+any\b/g                  // Type assertions
/mb-\d+|mt-\d+/g                 // Ad-hoc spacing
/bg-primary(?!\/\d)/g           // Key color backgrounds
```

---

## 14. Reference Files

| File | Purpose |
|------|---------|
| `app/globals.css` | Core CSS variables and tokens |
| `styles/styleseed-tokens.css` | StyleSeed design engine tokens |
| `styles/styleseed-base.css` | StyleSeed base styles |
| `styles/tokens.css` | Extended token system |
| `tailwind.config.ts` | Tailwind configuration |
| `components/patterns/*.tsx` | Pattern component implementations |
| `components/animation/enhanced-motion.tsx` | Motion system |
| `app/[locale]/(landing)/components/marketing-layout-shell.tsx` | Marketing shell |

---

## 15. Glossary

| Term | Definition |
|------|-----------|
| **Frost Border** | Subtle blue-white glow border (Resend-inspired) |
| **Precision Blue** | Brand anchor color `--primary: oklch(0.55 0.22 264)` |
| **StyleSeed** | Design engine providing tokens, patterns, and motion rules |
| **2:1 Ratio** | Number metric is 2x size of unit (e.g., 36px value, 18px unit) |
| **Orchestrated Motion** | Multi-stage reveal animations (icon → label → metric → trend) |
| **Widget Chrome** | Border, background, and shadow of dashboard widgets |

---

*Contract Version: 1.0*  
*Phase: 01 — Visual Refresh*  
*Milestone: v2.1 Production Hardening*
