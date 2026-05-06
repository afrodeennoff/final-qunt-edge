// IMPLEMENTATION_GUIDE.md
# 🎯 Qunt Edge 2026 macOS Optimization — Implementation Guide

## Quick Start: 3-Step Deployment

```bash
# 1. Apply design system updates
npm run lint -- --fix

# 2. Run performance checks
npm run perf:ci

# 3. Deploy with verification
npm run build && npm run perf:lighthouse
```

---

## PHASE 1: Design System (Days 1-3)

### Step 1: Update Global CSS with Spacing Scale

**File:** `app/globals.css`

```css
@layer utilities {
  /* Spacing scale — 8px base */
  .space-xs { gap: 0.5rem; }
  .space-sm { gap: 0.75rem; }
  .space-md { gap: 1rem; }
  .space-lg { gap: 1.5rem; }
  .space-xl { gap: 2rem; }

  /* Consistent padding */
  .px-content { @apply px-6 md:px-8 lg:px-12; }
  .py-section { @apply py-8 md:py-12 lg:py-16; }

  /* Glass effect */
  .glass-light { 
    @apply backdrop-blur-md bg-white/5 border border-white/10;
  }
  .glass-medium {
    @apply backdrop-blur-xl bg-white/8 border border-white/10;
  }
  .glass-heavy {
    @apply backdrop-blur-2xl bg-white/12 border border-white/20;
  }
}
```

### Step 2: Use New Components Across Dashboard

**Before:**
```tsx
<div className="rounded-lg border border-gray-200 p-4 shadow-md">
  <h2>Title</h2>
</div>
```

**After:**
```tsx
import { GlassCard } from '@/components/ui/glass-card';
import { H2 } from '@/components/typography/typography';

<GlassCard blur="medium" glow interactive>
  <H2>Title</H2>
</GlassCard>
```

### Step 3: Audit Component Spacing

Replace all arbitrary spacing with system values:

```bash
# Find arbitrary padding/margin
grep -r "p-\[" components/
grep -r "m-\[" components/
grep -r "gap-\[" components/

# Replace with system values
# ✗ p-[18px] → ✓ p-md
# ✗ gap-[14px] → ✓ gap-sm
```

---

## PHASE 2: Performance Optimization (Days 4-7)

### Step 1: Implement Server-Side Bootstrap

**File:** `app/[locale]/(dashboard)/dashboard/page.tsx`

```tsx
import { bootstrapDashboardData } from '@/server/dashboard-bootstrap';
import { Suspense } from 'react';

async function DashboardPage() {
  // SSR: Fetch critical data on server
  const data = await bootstrapDashboardData(userId);

  return (
    <div>
      {/* Critical data — rendered immediately */}
      <DashboardHeader data={data.user} />

      {/* Non-critical — wrapped in Suspense */}
      <Suspense fallback={<EquityChartSkeleton />}>
        <EquityChart equityData={data.equity} />
      </Suspense>

      <Suspense fallback={<TradeTableSkeleton />}>
        <TradeTable trades={data.trades} />
      </Suspense>
    </div>
  );
}
```

### Step 2: Add Lazy Loading for Heavy Components

**Pattern:**
```tsx
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(
  () => import('@/components/charts/heavy-chart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: true, // or false for CSR-only
  }
);

export default function Page() {
  return <HeavyChart />;
}
```

**Convert these components:**
- RadarChart → Dynamic import
- Remotion player → Dynamic import
- PricingSection → Dynamic import
- DataTable with 1000+ rows → Dynamic import

### Step 3: Enable Caching

**File:** `next.config.ts` (Already optimized ✓)

Verify these settings:
```typescript
cacheComponents: true,  // ✓ Enabled
optimizePackageImports: [...],  // ✓ Tree shaking
images: { minimumCacheTTL: 60 * 60 * 24 * 7 },  // ✓ 1 week
```

### Step 4: Implement Request Deduplication

```tsx
// app/[locale]/(dashboard)/dashboard/page.tsx
import { unstable_cache } from 'next/cache';

// Deduplicate parallel requests
const getUserData = unstable_cache(
  () => supabase.auth.getUser(),
  ['user-data'],
  { revalidate: 60, tags: ['auth'] }
);

const getAccounts = unstable_cache(
  () => supabase.from('accounts').select('*'),
  ['accounts'],
  { revalidate: 300, tags: ['accounts'] }
);
```

---

## PHASE 3: Component Refinement (Days 8-10)

### Step 1: Apply Typography Component

**Before:**
```tsx
<h1 className="text-5xl font-bold">Dashboard</h1>
<p className="text-base leading-relaxed">Content...</p>
```

**After:**
```tsx
import { H1, Body } from '@/components/typography/typography';

<H1>Dashboard</H1>
<Body>Content...</Body>
```

### Step 2: Implement Loading States

Replace inline spinners:

```tsx
// ✗ Old
<div className="animate-spin rounded-full h-8 w-8 border-2..." />

// ✓ New
import { LoadingSpinner } from '@/components/ui/loading-spinner';

<LoadingSpinner size="md" variant="spin" />
```

### Step 3: Add Page Transitions

**File:** `app/[locale]/layout.tsx`

```tsx
'use client';

import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/page-transitions';

export default function LocaleLayout({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      {children}
    </motion.div>
  );
}
```

---

## PHASE 4: Testing & Verification (Days 11-14)

### Step 1: Local Performance Test

```bash
# Install Lighthouse CLI (if needed)
npm install -g @lhci/cli@0.11.x

# Run Lighthouse
npm run perf:lighthouse

# Expected scores:
# Performance: 85+
# Accessibility: 95+
# Best Practices: 95+
# SEO: 100
```

### Step 2: Bundle Analysis

```bash
npm run analyze:bundle

# Fix any packages > 100kb
# Common culprits:
# - recharts (tree shake unused components)
# - d3 (load only needed modules)
# - moment → date-fns (already done ✓)
```

### Step 3: Route Budget Check

```bash
npm run check:route-budgets

# Acceptable sizes:
# JS: < 200KB (gzipped)
# CSS: < 50KB (gzipped)
# Total: < 250KB (gzipped)
```

### Step 4: Dead Code Elimination

```bash
npm run check:dead-code

# Review and remove unused exports
# Common patterns:
# - Unused utility functions
# - Duplicate type definitions
# - Old component variations
```

### Step 5: Security Audit

```bash
npm run check:route-security

# Verify:
# ✓ No sensitive data in URLs
# ✓ CORS headers correct
# ✓ CSP policy enforced
# ✓ Rate limiting active
```

---

## Component Migration Checklist

### Dashboard Components

- [ ] DashboardHeader → Use new typography system
- [ ] EquityChart → Lazy load with dynamic()
- [ ] TradeTable → Add table skeleton
- [ ] WidgetCanvas → Keep CSR-only
- [ ] StatsPanels → Use GlassCard
- [ ] Sidebar → Add glass morphism

### Common Components

- [ ] Button → Add transition effects
- [ ] Card → Convert to GlassCard
- [ ] Input → Update padding to system
- [ ] Dialog → Use modal transition variants
- [ ] Toast → Keep current (already good)
- [ ] Tooltip → Add spring easing

### Pages

- [ ] Dashboard → SSR + Suspense
- [ ] Trades → SSR + dynamic charts
- [ ] Journal → CSR with auto-save
- [ ] Teams → SSR + static generation
- [ ] Settings → SSR + revalidation
- [ ] Admin → CSR + auth protection

---

## Performance Targets

### Core Web Vitals

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| LCP | 1.2s | TBD | ⏳ |
| FCP | 0.9s | TBD | ⏳ |
| CLS | 0.1 | TBD | ⏳ |
| INP | 200ms | TBD | ⏳ |
| TTFB | 0.2s | TBD | ⏳ |

### Resource Budgets

| Resource | Budget | Status |
|----------|--------|--------|
| JavaScript | 200KB | ⏳ |
| CSS | 50KB | ⏳ |
| Images | 300KB | ⏳ |
| Total | 250KB | ⏳ |

---

## Troubleshooting

### Issue: Hydration Mismatch

**Cause:** Component renders differently on server vs client

**Solution:**
```tsx
import { useEffect, useState } from 'react';

export function ClientOnly({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? children : null;
}
```

### Issue: Suspense Not Working

**Cause:** Missing `'use client'` directive

**Solution:**
```tsx
'use client';  // ← Add this

import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <Content />
    </Suspense>
  );
}
```

### Issue: Dynamic Import Not Lazy Loading

**Cause:** Component imported without dynamic()

**Solution:**
```tsx
// ✗ Still eagerly loaded
import HeavyComponent from '@/components/heavy';

// ✓ Lazy loaded
import dynamic from 'next/dynamic';
const HeavyComponent = dynamic(() => import('@/components/heavy'));
```

### Issue: Skeleton Not Matching Layout

**Cause:** Different aspect ratio or height

**Solution:**
```tsx
// Ensure skeleton matches actual component height
<div className="h-64">
  <Skeleton className="h-64" /> {/* Match height */}
</div>
```

---

## Monitoring & Rollback

### Check Performance Before Deploy

```bash
# Baseline capture
npm run perf:capture-baseline

# After changes
npm run build
npm run perf:baseline

# Compare results
# If performance degraded > 5%, investigate
```

### Rollback Strategy

```bash
# If major performance regression:
git revert <commit>
npm run build
npm run perf:lighthouse
```

---

## Success Metrics (Post-Deployment)

✅ **Day 1:**
- All components compile without errors
- No TypeScript warnings
- ESLint passes

✅ **Day 3:**
- Core Web Vitals meet targets
- Bundle size < 250KB
- No accessibility violations

✅ **Day 7:**
- Zero hydration mismatches
- 100% Lighthouse score on performance
- Real users show improved metrics

---

## Support & Questions

Refer to: `MASTER_OPTIMIZATION_PROMPT.md` for detailed documentation

---

**Timeline:** 2 weeks  
**Status:** Ready to implement  
**Last Updated:** 2026-05-06
