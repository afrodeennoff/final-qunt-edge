# 🎨 MASTER OPTIMIZATION PROMPT — Qunt Edge 2026 macOS Edition

**Version:** 2.0  
**Status:** Production Ready  
**Last Updated:** 2026-05-06  
**Target:** Next.js 16 + React 19 + TypeScript  

---

## 📖 TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Design System](#design-system)
3. [Performance Architecture](#performance-architecture)
4. [Component Library](#component-library)
5. [Implementation Checklist](#implementation-checklist)
6. [Performance Budgets](#performance-budgets)
7. [Monitoring & Rollback](#monitoring--rollback)

---

## SYSTEM OVERVIEW

### Vision
Qunt Edge is a **premium trading analytics platform** designed with 2026 macOS aesthetics: minimalist, powerful, performant, and beautiful.

### Design Principles
- **Obsidian Luxury** — Deep dark palette inspired by Bloomberg Terminal meets Apple Vision Pro
- **Performance First** — Sub-1.5s page load, optimized CSS/JS
- **Accessibility Native** — WCAG AAA compliant by default
- **Type-Safe** — TypeScript strict mode everywhere
- **Mobile-First** — Responsive from 320px to 12K displays

### Tech Stack
- **Framework:** Next.js 16 (App Router, PPR)
- **Runtime:** React 19 with Server Components
- **Styling:** Tailwind CSS v4 + OKLch
- **State:** Zustand + React Query v5
- **Forms:** React Hook Form + Zod
- **Components:** Radix UI (headless)
- **Package Manager:** Bun 1.3.11

---

## DESIGN SYSTEM

### 1. COLOR PALETTE (OKLch — P3 Gamut)

#### Core Dark Palette
```css
--background: oklch(0.06 0.01 301);        /* Void canvas */
--foreground: oklch(0.9838 0.0035 247.86); /* Pure white text */
--card: oklch(0.085 0.014 301);            /* Card surface */
--border: oklch(0.20 0.02 300);            /* Subtle divider */
```

#### Brand Accent (Deep Purple)
```css
--primary: oklch(0.60 0.22 297);           /* Interactive elements */
--primary-fg: oklch(0.145 0 0);            /* Text on primary */
```

#### Semantic Colors
```css
--success: oklch(0.82 0.185 155);          /* Profit green */
--warning: oklch(0.84 0.175 80);           /* Amber caution */
--destructive: oklch(0.64 0.255 22);       /* Loss red */
```

#### Why OKLch?
✅ Perceptually uniform (WCAG AAA by design)  
✅ P3 wide gamut support for modern displays  
✅ Hardware-accelerated color calculations  
✅ Future-proof (CSS Color Module Level 4)  

---

### 2. SPACING SYSTEM (8px Base)

Never use arbitrary spacing. **All** spacing must follow this scale:

```javascript
// Spacing tokens (in rem, 16px base)
const SPACING = {
  '0': '0',           // 0px
  'xs': '0.5rem',     // 8px
  'sm': '0.75rem',    // 12px
  'md': '1rem',       // 16px
  'lg': '1.5rem',     // 24px
  'xl': '2rem',       // 32px
  '2xl': '2.5rem',    // 40px
  '3xl': '3rem',      // 48px
  '4xl': '4rem',      // 64px
};
```

#### Usage Examples

```tsx
// ✓ CORRECT
<div className="p-md gap-sm">Content</div>
<div className="px-lg py-md">Content</div>
<div className="mb-xl mt-md">Content</div>

// ✗ WRONG
<div className="p-[18px] gap-[14px]">Content</div>
<div className="px-[24px] py-[16px]">Content</div>
<div className="mb-[30px] mt-[16px]">Content</div>
```

---

### 3. SHADOW SYSTEM (Multi-Layer Depth)

```css
/* Tier 1: Subtle (cards at rest) */
--shadow-sm: 0 1px 3px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.14);

/* Tier 2: Medium (cards hover) */
--shadow-md: 0 2px 4px rgba(0,0,0,0.30), 0 8px 20px rgba(0,0,0,0.20);

/* Tier 3: Large (modals, popovers) */
--shadow-lg: 0 4px 8px rgba(0,0,0,0.25), 0 12px 28px rgba(0,0,0,0.22);

/* Tier 4: XL (full-screen overlays) */
--shadow-xl: 0 8px 16px rgba(0,0,0,0.22), 0 20px 40px rgba(0,0,0,0.28);

/* 12K Cinema (ultra-deep depth) */
--shadow-ultra: 0 12px 24px rgba(0,0,0,0.10), 0 32px 64px rgba(0,0,0,0.22);
```

#### Why Multi-Layer?
✅ Realistic depth perception  
✅ Better visual hierarchy  
✅ Accessible contrast ratios  
✅ Performance optimized  

---

### 4. BORDER RADIUS (macOS Squircle)

```css
--radius: 1rem;        /* 16px — primary */
--radius-sm: 0.625rem; /* 10px — small */
--radius-md: 0.875rem; /* 14px — medium */
--radius-lg: 1.125rem; /* 18px — large */
--radius-xl: 1.375rem; /* 22px — xlarge */
--radius-pill: 9999px; /* Fully rounded */
```

**macOS principle:** Use 1rem as your default. Only deviate for:
- Buttons: `rounded-lg`
- Small badges: `rounded-sm`
- Full pills: `rounded-pill`

---

### 5. TYPOGRAPHY HIERARCHY

#### Fluid Responsive Scale
```css
/* Headlines */
--type-h1-size: clamp(2.25rem, 1.95rem + 1.5vw, 3.25rem);
--type-h2-size: clamp(1.5rem, 1.35rem + 0.75vw, 2rem);
--type-h3-size: clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem);

/* Body */
--type-body-size: 0.9375rem; /* 15px base */
--type-body-line: 1.75;
--type-body-tracking: -0.01em;

/* Caption */
--type-caption-size: 0.8125rem; /* 13px */
--type-caption-line: 1.6;
```

#### Font Stack (SF Pro Display preferred)
```css
font-family:
  'SF Pro Display',
  'SF Pro Text',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  sans-serif;
```

---

### 6. GLASSMORPHISM EFFECTS

Three-tier blur system inspired by iOS/macOS:

```css
/* Light Glass (content cards) */
.glass-light {
  backdrop-filter: blur(20px) saturate(150%);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(145, 108, 255, 0.12);
}

/* Medium Glass (panels, sidebars) */
.glass-medium {
  backdrop-filter: blur(40px) saturate(180%);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(145, 108, 255, 0.16);
}

/* Heavy Glass (navigation, modals) */
.glass-heavy {
  backdrop-filter: blur(60px) saturate(200%);
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(145, 108, 255, 0.20);
}
```

**Performance note:** Glassmorphism is GPU-accelerated on M-series Macs and modern browsers. No performance penalty.

---

### 7. ANIMATION & EASING

#### macOS Spring Curves
```javascript
export const EASING = {
  // Default: smooth, bouncy settle
  spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
  
  // Entrance: fast start, gentle landing
  entrance: 'cubic-bezier(0.16, 1, 0.3, 1)',
  
  // Exit: quick fade out
  exit: 'cubic-bezier(0, 0, 0.2, 1)',
  
  // Sheet modal: snappy reveal
  sheet: 'cubic-bezier(0.32, 0.72, 0, 1)',
};

export const DURATION = {
  fast: 200,    // Button interactions
  normal: 300,  // Page transitions
  slow: 500,    // Complex animations
};
```

#### Common Animations
```tsx
// Page reveal (on route change)
{
  initial: { opacity: 0, y: 20, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -20 },
  transition: {
    duration: 0.6,
    ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
}

// Button press (all interactive elements)
{
  whileTap: { scale: 0.98 },
  transition: { duration: 0.1 },
}

// Card hover (on desktop)
{
  whileHover: {
    y: -4,
    boxShadow: var(--shadow-lg),
  },
  transition: { duration: 0.2, ease: 'easeOut' },
}
```

---

## PERFORMANCE ARCHITECTURE

### 1. RENDERING STRATEGY (CSR vs SSR)

#### Server-Side Rendering (SSR) — Use When:
✅ Page needs SEO (public pages, blogs, marketing)  
✅ Data doesn't change frequently (products, docs)  
✅ Critical content needed for FCP (above fold)  
✅ User authentication required (can pre-fetch)  

**Example: Dashboard Page**
```tsx
// app/[locale]/(dashboard)/dashboard/page.tsx
async function DashboardPage() {
  // Fetch on server — included in HTML
  const [user, trades, accounts] = await Promise.all([
    getUser(),
    getTrades(limit: 10),
    getAccounts(),
  ]);

  return (
    <div>
      {/* Critical — rendered immediately */}
      <DashboardHeader user={user} />

      {/* Non-critical — wrapped in Suspense */}
      <Suspense fallback={<ChartSkeleton />}>
        <EquityChart trades={trades} />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <TradeTable trades={trades} />
      </Suspense>
    </div>
  );
}
```

#### Client-Side Rendering (CSR) — Use When:
✅ Data changes frequently (real-time updates)  
✅ User-specific content (personalization)  
✅ Interactive state management needed  
✅ Form submissions with optimistic UI  

**Example: Trade Form**
```tsx
'use client';

import { useUpdateTrade } from '@/hooks/use-trades';

export function TradeForm({ tradeId }) {
  const { mutate: updateTrade, isPending } = useUpdateTrade();

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      updateTrade({ id: tradeId, ...formData });
    }}>
      {/* CSR-only form with optimistic updates */}
      <input type="number" placeholder="Entry price" />
      <button disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

### 2. CACHING STRATEGY

#### Next.js Caching Hierarchy
```
┌─────────────────────────────────┐
│ Browser Cache (Client)          │ 1st check
│ (CDN headers, 1 week)           │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│ Next.js Router Cache (ISR)      │ 2nd check
│ (In-memory, revalidate: 60s)    │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│ React Query Cache (Client)      │ 3rd check
│ (Zustand store, stale: 30min)   │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│ Database (Origin)               │ Last resort
│ (Fresh query, expensive)        │
└─────────────────────────────────┘
```

#### Implementation
```typescript
// lib/queries/trades.ts
import { unstable_cache } from 'next/cache';

export const getTrades = unstable_cache(
  async (userId: string, limit: number = 50) => {
    return supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
  },
  ['trades'],  // Cache key
  {
    revalidate: 300,  // 5 minutes (ISR)
    tags: ['trades'],  // For on-demand revalidation
  }
);
```

### 3. REQUEST DEDUPLICATION

Prevent duplicate network requests during renders:

```typescript
// lib/queries/user.ts
import { unstable_cache } from 'next/cache';

const getUser = unstable_cache(
  async (userId: string) => {
    // Only executes once per 60 seconds
    return supabase.auth.getUser();
  },
  ['user'],
  { revalidate: 60, tags: ['auth'] }
);
```

### 4. LAZY LOADING FOR HEAVY COMPONENTS

```typescript
// app/[locale]/(dashboard)/charts/page.tsx
import dynamic from 'next/dynamic';

const HeavyRadarChart = dynamic(
  () => import('@/components/charts/radar-chart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: true,  // Render on server (better FCP)
  }
);

const HeavyDataTable = dynamic(
  () => import('@/components/tables/data-table-1000'),
  {
    loading: () => <TableSkeleton />,
    ssr: false,  // Only client-side (interactive)
  }
);

export default function ChartsPage() {
  return (
    <div>
      <HeavyRadarChart />
      <HeavyDataTable />
    </div>
  );
}
```

**Which components to lazy load?**
- [ ] Recharts components > 50KB
- [ ] D3 visualizations
- [ ] Data tables with 1000+ rows
- [ ] Remotion player
- [ ] Rich text editors (Tiptap)
- [ ] PDF viewers
- [ ] Heavy modals (not on initial load)

### 5. IMAGE OPTIMIZATION

```typescript
// next.config.ts
images: {
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 60 * 60 * 24 * 7,  // 1 week
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  qualities: [50, 65, 75, 85, 90],
}
```

**Usage:**
```tsx
import Image from 'next/image';

<Image
  src={profilePic}
  alt="User profile"
  width={200}
  height={200}
  priority  // Only for LCP images
  sizes="(max-width: 768px) 100vw, 200px"
/>
```

---

## COMPONENT LIBRARY

### 1. GlassCard Component

```typescript
// components/ui/glass-card.tsx
import { ComponentProps } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const glassCardVariants = cva(
  'rounded-lg border transition-all duration-200',
  {
    variants: {
      blur: {
        light: 'backdrop-blur-md bg-white/5 border-white/10',
        medium: 'backdrop-blur-xl bg-white/8 border-white/10',
        heavy: 'backdrop-blur-2xl bg-white/12 border-white/20',
      },
      interactive: {
        true: 'hover:bg-white/10 hover:border-white/20 cursor-pointer',
        false: '',
      },
      glow: {
        true: 'shadow-lg shadow-primary/20',
        false: 'shadow-sm',
      },
    },
    defaultVariants: {
      blur: 'medium',
      interactive: false,
      glow: false,
    },
  }
);

interface GlassCardProps
  extends ComponentProps<'div'>,
    VariantProps<typeof glassCardVariants> {}

export function GlassCard({
  className,
  blur,
  interactive,
  glow,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(glassCardVariants({ blur, interactive, glow }), className)}
      {...props}
    />
  );
}
```

### 2. LoadingSpinner Component

```typescript
// components/ui/loading-spinner.tsx
import { cva } from 'class-variance-authority';

const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-muted-foreground/30',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 border-muted-foreground/40',
        md: 'h-8 w-8',
        lg: 'h-12 w-12 border-4',
      },
      variant: {
        spin: 'border-t-foreground',
        pulse: 'opacity-70 animate-pulse',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'spin',
    },
  }
);

export function LoadingSpinner({
  size,
  variant,
}: {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spin' | 'pulse';
}) {
  return <div className={spinnerVariants({ size, variant })} />;
}
```

### 3. Skeleton Component

```typescript
// components/ui/skeleton.tsx
export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-muted ${className}`}
      {...props}
    />
  );
}

// Presets
export const SKELETON_PRESETS = {
  cardHeader: 'h-8 w-1/3 rounded-lg',
  cardContent: 'h-4 w-full rounded-lg',
  chartPlaceholder: 'h-64 w-full rounded-lg',
  tableSkeleton: 'space-y-2',
  avatarSmall: 'h-8 w-8 rounded-full',
  avatarLarge: 'h-16 w-16 rounded-full',
};
```

### 4. Typography Component

```typescript
// components/typography/typography.tsx
import { ComponentProps } from 'react';

const typeStyles = {
  h1: 'text-fluid-5xl font-bold text-foreground',
  h2: 'text-fluid-3xl font-bold text-foreground',
  h3: 'text-fluid-2xl font-semibold text-foreground',
  h4: 'text-fluid-lg font-semibold text-foreground',
  body: 'text-body text-foreground/90',
  caption: 'text-caption text-foreground/70',
  label: 'text-label font-medium text-foreground/80 uppercase tracking-wider',
};

export function H1(props: ComponentProps<'h1'>) {
  return <h1 className={typeStyles.h1} {...props} />;
}

export function H2(props: ComponentProps<'h2'>) {
  return <h2 className={typeStyles.h2} {...props} />;
}

export function H3(props: ComponentProps<'h3'>) {
  return <h3 className={typeStyles.h3} {...props} />;
}

export function Body(props: ComponentProps<'p'>) {
  return <p className={typeStyles.body} {...props} />;
}

export function Caption(props: ComponentProps<'p'>) {
  return <p className={typeStyles.caption} {...props} />;
}

export function Label(props: ComponentProps<'label'>) {
  return <label className={typeStyles.label} {...props} />;
}
```

---

## IMPLEMENTATION CHECKLIST

### Week 1: Design System

- [ ] Update `app/globals.css` with OKLch variables
- [ ] Create `components/ui/glass-card.tsx`
- [ ] Create `components/ui/loading-spinner.tsx`
- [ ] Create `components/ui/skeleton.tsx`
- [ ] Create `components/typography/typography.tsx`
- [ ] Audit all components — replace arbitrary spacing
- [ ] Verify `tailwind.config.ts` has 8px scale
- [ ] Test dark mode toggle

### Week 2: Performance

- [ ] Add `unstable_cache` to critical queries
- [ ] Implement lazy loading for 10+ heavy components
- [ ] Add Suspense boundaries to all routes
- [ ] Create skeleton components for each async section
- [ ] Verify image optimization in `next.config.ts`
- [ ] Run bundle analysis: `npm run analyze:bundle`
- [ ] Check route budgets: `npm run check:route-budgets`

### Testing & Verification

- [ ] Run Lighthouse: `npm run perf:lighthouse`
- [ ] Check Core Web Vitals targets
- [ ] Verify accessibility: `npm run check:route-security`
- [ ] Load test with k6: `npm run loadtest:k6`
- [ ] Test on real M-series Mac (Safari, Chrome)
- [ ] Test on Windows (Firefox, Edge)
- [ ] Test on iPhone 15 Pro (test iOS blur effects)

---

## PERFORMANCE BUDGETS

### Core Web Vitals Targets

| Metric | Target | Priority |
|--------|--------|----------|
| LCP | 1.2s | 🔴 Critical |
| FCP | 0.9s | 🔴 Critical |
| CLS | 0.1 | 🟠 High |
| INP | 200ms | 🟠 High |
| TTFB | 0.2s | 🟢 Medium |

### Resource Budgets (Gzipped)

| Resource | Budget | Status |
|----------|--------|--------|
| JavaScript | 200KB | ⏳ Implement |
| CSS | 50KB | ⏳ Audit |
| Images | 300KB | ⏳ Optimize |
| Total | 250KB | ⏳ Target |

### Bundle Analysis Commands

```bash
# Analyze bundle
npm run analyze:bundle

# Check route budgets
npm run check:route-budgets

# Lighthouse audit
npm run perf:lighthouse

# Dead code check
npm run check:dead-code
```

---

## MONITORING & ROLLBACK

### Pre-Deploy Verification

```bash
# 1. Type check
npm run typecheck

# 2. Lint
npm run lint -- --fix

# 3. Test
npm run test

# 4. Build
npm run build

# 5. Performance
npm run perf:ci
```

### Rollback Strategy

If performance degrades > 5%:

```bash
# Identify regression
git log --oneline -10

# Revert last commit
git revert <commit-sha>

# Rebuild
npm run build

# Verify
npm run perf:lighthouse
```

### Real User Monitoring

```typescript
// lib/monitoring/web-vitals.ts
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';

export function registerWebVitals() {
  getCLS(console.log);
  getFCP(console.log);
  getFID(console.log);
  getLCP(console.log);
  getTTFB(console.log);
}
```

---

## QUICK REFERENCE

### Common Patterns

#### SSR with Suspense
```tsx
<Suspense fallback={<Skeleton />}>
  <AsyncComponent />
</Suspense>
```

#### Optimistic Update
```tsx
const { mutate } = useUpdateTrade({
  onMutate: (newData) => {
    queryClient.setQueryData(['trades'], newData);
  },
});
```

#### Lazy Load Component
```tsx
const Component = dynamic(
  () => import('@/components/heavy'),
  { loading: () => <Skeleton /> }
);
```

#### Use Glass Card
```tsx
<GlassCard blur="medium" interactive glow>
  <H3>Title</H3>
</GlassCard>
```

---

## SUCCESS METRICS

✅ **Aesthetics:**
- Obsidian dark theme with purple accents
- glassmorphism effects on cards/panels
- Smooth spring animations on all interactions
- Professional, minimal UI

✅ **Performance:**
- LCP < 1.2s on 4G network
- FCP < 0.9s on slow devices
- JS/CSS combined < 250KB gzipped
- Zero layout shifts (CLS < 0.1)

✅ **Code Quality:**
- 100% TypeScript strict mode
- ESLint passing with 0 warnings
- Test coverage > 80% for critical paths
- Accessibility WCAG AAA compliant

✅ **User Experience:**
- Instant page transitions
- Optimistic form updates
- Skeleton states matching layouts
- Zero hydration mismatches

---

## RESOURCES

- **Design Inspiration:** Apple Vision Pro, Bloomberg Terminal, Vercel, Linear
- **Performance Guides:** web.dev, Next.js Docs, Web Vitals
- **Component Library:** Shadcn/ui, Radix UI, Headless UI
- **Testing Tools:** Lighthouse, WebPageTest, k6 Load Test

---

**Last Updated:** 2026-05-06  
**Next Review:** 2026-06-06  
**Maintainer:** Qunt Edge Team
