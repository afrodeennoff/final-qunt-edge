# QUNT EDGE — MASTER OPTIMIZATION & VISUAL REFINEMENT PROMPT 2026
**Current Status:** End-to-End UI/UX Optimization Initiative  
**Target Aesthetic:** 2026 macOS App Design Language  
**Scope:** Entire Application (Dashboard + Landing + Auth + Admin + Teams)  
**Current Date:** 2026-05-06  
**User Context:** afrodeennoff (Owner)  

---

## EXECUTIVE SUMMARY

This is the **single source of truth** for the comprehensive optimization of Qunt Edge into a premium 2026 macOS-aesthetic trading analytics platform. The initiative spans:

1. **UI Refinement** — Consistent design language, enhanced visual hierarchy, glass-morphism surfaces
2. **Spacing Audit** — Standardized spacing throughout all components (padding, gaps, margins)
3. **Performance** — CSR/SSR optimization, lazy loading, code splitting, bundle analysis
4. **Dark Theme + Purple Accents** — Primary color scheme as electric purple with obsidian backgrounds
5. **Black Screen & CSP Fixes** — Resolve rendering issues and security policy violations
6. **Vercel Deployment** — Production-ready build with performance monitoring
7. **Comprehensive Report** — Before/after metrics, visual comparisons, improvement details

---

## PROJECT STRUCTURE REFERENCE

### Repository Overview
- **Tech Stack:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + Prisma + Supabase
- **Language Composition:** 91.1% TypeScript, 1.9% CSS, 1.8% JavaScript, rest HTML/Roff/Shell
- **Folder Structure:**
  ```
  qunt-edge/
  ├── app/                          # Next.js 16 App Router
  │   ├── layout.tsx               # Root layout (fonts, analytics, CSP)
  │   ├── globals.css              # Global styles (~114KB)
  │   ├── globals-performance.css  # Performance optimizations
  │   ├── [locale]/                # i18n routing (en, fr, hi, ja, es, it, de, pt, vi, zh, yo)
  │   │   ├── layout.tsx           # Locale wrapper + I18nProvider
  │   │   ├── (home)/              # Marketing landing (server components)
  │   │   ├── (landing)/           # Public marketing pages
  │   │   ├── (authentication)/    # Auth pages (login, signup)
  │   │   ├── dashboard/           # Authenticated dashboard (120+ components)
  │   │   ├── admin/               # Admin panel (requires isAdminUser())
  │   │   ├── teams/               # Team management & nested dashboards
  │   │   └── shared/[slug]/       # Public share links
  │   └── api/                     # API routes (auth, ai, stripe, whop, MT5, cron)
  ├── components/                  # 400+ UI components
  │   ├── ui/                      # Radix UI + Tailwind primitives (sidebar, button, dialog, etc.)
  │   ├── dashboard/               # Dashboard-specific (header, charts, filters, tables)
  │   ├── layouts/                 # Layout utilities & recipes
  │   ├── sidebar/                 # Navigation sidebars
  │   ├── mobile-bottom-nav/       # Mobile navigation
  │   ├── providers/               # React context providers
  │   └── lazy/                    # Dynamic imports for code splitting
  ├── lib/                         # Utilities & helpers
  │   ├── constants/               # Layout, theme, broker configs
  │   ├── rate-limit.ts           # Rate limiting
  │   ├── ui-v2.ts                # UI variant selection
  │   └── utils.ts                # Tailwind merge, cn(), etc.
  ├── server/                      # Server Actions & API handlers
  │   ├── auth.ts                 # Supabase createClient()
  │   ├── authz.ts                # Authorization checks
  │   ├── dashboard-bootstrap.ts  # Server-side dashboard data loading
  │   ├── trades.ts               # Trade data operations
  │   ├── imports/                # Broker import handlers
  │   └── *.ts                    # 38 total server modules
  ├── store/                       # Zustand state (25+ stores)
  ├── context/                     # React context providers
  ├── locales/                     # i18n translations (7 languages)
  ├── prisma/                      # ORM schema + migrations
  ├── public/                      # Static assets
  └── tests/                       # 73 test files (Vitest + E2E)
  ```

---

## PHASE 1: DESIGN SYSTEM AUDIT & REFINEMENT

### 1.1 Color Palette Definition

**Primary Brand Colors (Dark Mode - Default)**
- **Background (Obsidian):** `oklch(0.06 0.01 260)` — Deep navy-black
- **Primary (Electric Purple):** `oklch(0.60 0.22 297)` — Brand accent, glows & buttons
- **Secondary (Steel Grey):** `oklch(0.45 0.20 297)` — Secondary interactions
- **Accent (Neon Purple):** `oklch(0.65 0.21 297)` — Highlights, success states
- **Surface (Depth Layers):**
  - Surface 0 (Border): `oklch(0.06 0.01 297 / 0.5px)`
  - Surface 1 (Elevated): `oklch(0.12 0.009 297)`
  - Surface 2 (Hover): `oklch(0.15 0.016 297)`
  - Surface 3 (Focus): `oklch(0.22 0.020 297)`

**Semantic Colors**
- **Success:** `oklch(0.82 0.185 155)` — Emerald green
- **Warning:** `oklch(0.74 0.190 83)` — Amber
- **Error:** `oklch(0.64 0.255 22)` — Crimson red
- **Info:** `oklch(0.60 0.220 297)` — Cobalt blue

### 1.2 Typography System

**Font Stack (Already Configured)**
- **Sans:** DM Sans (via `--font-dm-sans`), fallback: system UI
- **Serif:** Cormorant Garamond (luxury text)
- **Mono:** IBM Plex Mono (code blocks)

**Type Scale (Tailwind-based)**
- Display: `4rem` (line-height 0.95, letter-spacing -0.055em)
- H1: `3rem` (line-height 0.98, letter-spacing -0.045em)
- H2: `2.25rem` (line-height 1.02, letter-spacing -0.035em)
- H3: `1.5rem` (line-height 1.15, letter-spacing -0.025em)
- Body: `0.875rem` (line-height 1.5, default)
- Caption: `0.8125rem` (line-height 1.2)
- Label: `0.75rem` (line-height 1.2, letter-spacing 0.12em)

**Fluid Scaling (Responsive Typography)**
- `text-fluid-xs` through `text-fluid-12xl` for auto-scaling across viewports
- Example: `clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem)` — scales between bounds

### 1.3 Spacing System

**Standardized Spacing Scale**
```
Tokens:
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)
- 3xl: 4rem (64px)
- 4xl: 6rem (96px)

Fluid Spacing (viewport-responsive):
- fluid-3xs: clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem)
- fluid-2xs: clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem)
- fluid-xs: clamp(0.75rem, 0.6rem + 0.75vw, 1rem)
- fluid-sm: clamp(1rem, 0.85rem + 0.75vw, 1.5rem)
- fluid-md: clamp(1.5rem, 1.25rem + 1.25vw, 2.5rem)
- fluid-lg: clamp(2rem, 1.75rem + 1.25vw, 3.5rem)
- fluid-xl: clamp(3rem, 2.5rem + 2.5vw, 5rem)
```

**Application Rules:**
- Container padding: `p-fluid-md` (responsive, ~16-32px)
- Vertical stacks (gap between items): `gap-fluid-sm` to `gap-fluid-lg`
- Horizontal stacks: `gap-fluid-xs` to `gap-fluid-md`
- Card internal padding: `p-fluid-md` to `p-fluid-lg`
- Section margins: `my-fluid-lg` to `my-fluid-2xl`

### 1.4 Glass-Morphism & Surface Design

**Glass Utilities (Tailwind Extended)**
- `backdrop-blur-xl` — Ultra-heavy blur for premium surfaces
- `bg-glass-minimax` — `hsla(0, 0%, 100%, 0.4)` light mode
- `border-glass` — `rgba(255, 255, 255, 0.1)` glass border

**Shadow Depth Hierarchy**
```
Ultra-Resolution Shadows (12K-ready):
- shadow-ultra-sm: Multi-layer light shadows (~3 layers)
- shadow-ultra-md: Medium depth with glow
- shadow-ultra-lg: Deep elevation shadows
- shadow-ultra-xl: Premium card surfaces
- shadow-ultra-2xl: Maximum depth (hero modals)

Glow Shadows (Semantic):
- shadow-glow-primary: Purple glow (primary accent)
- shadow-glow-success: Emerald glow (positive states)
- shadow-glow-warning: Amber glow (caution states)
- shadow-glow-error: Crimson glow (error states)
```

**Border Radius Tokens**
- Pill: `rounded-pill` (9999px — full curves)
- Comfortable: `rounded-comfortable` (13px)
- Generous: `rounded-generous` (20px)
- Large: `rounded-large` (24px)

---

## PHASE 2: COMPONENT-LEVEL AUDIT & REFINEMENT

### 2.1 Critical Components to Refine

#### Dashboard Shell Components
| Component | File Path | Priority | Issues |
|-----------|-----------|----------|--------|
| DashboardLayout | `app/[locale]/dashboard/layout.tsx` | P0 | Server auth, sidebar integration, header layout |
| DashboardSidebar | `components/sidebar/dashboard-sidebar.tsx` | P0 | Navigation spacing, active states, hover effects |
| DashboardHeader | `app/[locale]/dashboard/components/dashboard-header.tsx` | P0 | Filter UI, import button, customize button alignment |
| Widget Canvas | `components/widget-canvas.tsx` | P0 | Drag-drop UX, gap consistency, grid alignment |
| Chart Components | `components/dashboard/charts/*.tsx` | P1 | Recharts styling, color consistency, legends |

#### Navigation & Layout
| Component | File Path | Priority | Issues |
|-----------|-----------|----------|--------|
| SidebarNav | `app/[locale]/admin/components/sidebar-nav.tsx` | P0 | Admin nav styling, color coherence |
| Navbar | `app/[locale]/(landing)/components/navbar.tsx` | P0 | Landing nav, gradient background consistency |
| MobileBottomNav | `components/mobile-bottom-nav.tsx` | P1 | Mobile spacing, icon sizing, label clarity |
| Sidebar Primitives | `components/ui/sidebar.tsx` | P0 | Radix sidebar customization, CSS variables |

#### Data & Tables
| Component | File Path | Priority | Issues |
|-----------|-----------|----------|--------|
| TradeTable | `components/dashboard/tables/trade-table-review.tsx` | P1 | Row spacing, cell padding, header alignment |
| Filters | `components/dashboard/filters/*.tsx` | P1 | Filter button styling, dropdown alignment |
| Calendar | `components/dashboard/calendar/*.tsx` | P1 | Calendar cell spacing, day/week view consistency |

#### Cards & Surfaces
| Component | File Path | Priority | Issues |
|-----------|-----------|----------|--------|
| Card (UI Primitive) | `components/ui/card.tsx` | P0 | Rounded corners, shadow depth, border styling |
| Stats Cards | `components/dashboard/statistics/*.tsx` | P1 | Stat metric spacing, icon sizing |
| Metric Panels | `components/layout/unified-page-recipes.tsx` | P0 | Unified spacing recipes for metrics |
| Dialog/Modal | `components/ui/dialog.tsx` | P1 | Modal padding, button spacing |

#### Interactive Elements
| Component | File Path | Priority | Issues |
|-----------|-----------|----------|--------|
| Button | `components/ui/button.tsx` | P0 | Button sizes, hover states, icon alignment |
| Input | `components/ui/input.tsx` | P0 | Input padding, focus ring thickness |
| Select | `components/ui/select.tsx` | P1 | Dropdown styling, option spacing |
| Tabs | `components/ui/tabs.tsx` | P1 | Tab indicator animation, content padding |

### 2.2 Spacing Audit Checklist

**For Each Component, Verify:**
- [ ] Consistent padding: `p-3` (sm), `p-4` (md), `p-6` (lg) across equivalent surfaces
- [ ] Gap consistency in flex/grid layouts: Use `gap-2`, `gap-3`, `gap-4` standardly
- [ ] Button spacing: `px-4 py-2` (sm), `px-6 py-3` (md)
- [ ] Icon sizing: 16px (sm), 20px (md), 24px (lg) with consistent spacing to text
- [ ] Card outer margins: `m-4` (container level)
- [ ] Section dividers: `my-6` or `my-8` (page-level)
- [ ] Mobile adjustments: `-sm:` variants for touch-friendly spacing

**Color Consistency Audit:**
- [ ] No hardcoded `#hex` colors — use Tailwind tokens
- [ ] Primary buttons: `bg-primary text-primary-foreground`
- [ ] Secondary buttons: `bg-secondary text-secondary-foreground`
- [ ] Hover states: `hover:bg-primary/90` or `hover:shadow-lg`
- [ ] Borders: `border border-border` (uses CSS variable)
- [ ] Text: `text-foreground` (default), `text-muted-foreground` (secondary)

### 2.3 Dark Theme Enforcement

**CSS Root Variables (app/globals.css)**
```css
:root {
  /* Obsidian Dark Theme */
  --background: 260 85% 6%;       /* oklch(0.06 0.01 260) */
  --foreground: 260 50% 95%;      /* Light text on dark bg */
  --primary: 297 22% 60%;         /* Electric purple */
  --primary-foreground: 260 85% 6%;
  --accent: 297 21% 65%;          /* Neon purple */
  --accent-foreground: 260 85% 6%;
  --border: 260 50% 15%;          /* Subtle dividers */
  --muted: 260 40% 30%;
  --muted-foreground: 260 40% 70%;
  --card: 260 85% 9%;             /* Slightly lighter than bg */
  --card-foreground: 260 50% 95%;
  --success: 155 100% 82%;        /* Emerald */
  --warning: 83 100% 74%;         /* Amber */
  --destructive: 22 100% 64%;     /* Crimson */
}

@media (prefers-color-scheme: light) {
  :root {
    /* Optional: Light theme for future */
    --background: 247 92% 98%;
    --foreground: 260 20% 10%;
    /* ... adapt all colors ... */
  }
}
```

---

## PHASE 3: PERFORMANCE OPTIMIZATION

### 3.1 CSR/SSR Optimization Strategy

**Server-Side Rendering (SSR) — Pages to Optimize**
```typescript
// Prioritize server rendering for:
1. app/[locale]/layout.tsx — Locale + i18n (already SSR)
2. app/[locale]/(landing)/layout.tsx — Public marketing pages
3. app/[locale]/dashboard/layout.tsx — Auth check, bootstrap data
4. app/[locale]/admin/layout.tsx — Admin check
5. app/[locale]/teams/dashboard/layout.tsx — Team data
```

**Client-Side Rendering (CSR) — Components to Optimize**
```typescript
// Use 'use client' + dynamic imports for:
1. Dashboard widgets (drag-drop, interactive charts)
2. Modal dialogs (import, settings, customize)
3. Real-time updates (trades, equity curve)
4. Heavy libraries: Remotion, RadarChart, PricingSection
5. React Query hooks (useQuery, useMutation)
```

**Dynamic Imports (Code Splitting)**
```typescript
// Current pattern (preserve):
const DashboardHeader = dynamic(
  () => import("./dashboard-header").then((m) => m.DashboardHeader),
  { loading: () => <SkeletonLoader /> }
);

// Apply to heavy components:
- Remotion Player
- Chart components (large Recharts renders)
- Admin panels (bulk operations)
- Import dialogs (broker-specific UI)
```

### 3.2 Bundle Analysis & Optimization

**Current Bundle Baseline**
```bash
npm run analyze:bundle  # Generates reports in .next/analyze
# Expected output:
# - Total: ~300-400KB (gzipped)
# - Largest chunks: recharts, @tiptap, @ai-sdk
```

**Optimization Targets**
1. **Code Split Charts** — Move Recharts to lazy route
   ```typescript
   // In dashboard/charts/page.tsx
   const EquityCurve = dynamic(() => import('./equity-curve'), { ssr: false });
   ```

2. **Tree Shake Unused Exports**
   ```bash
   npm run check:dead-code  # Find unused exports
   # Remove unused: server/, lib/, stores/
   ```

3. **Optimize Images**
   ```typescript
   // Replace static imports with next/image
   import Image from 'next/image';
   <Image src="/logo.png" alt="Logo" width={40} height={40} priority />
   ```

4. **CSS Optimization**
   - Audit `globals.css` (~114KB) for unused rules
   - Move component-specific styles to module `.css` files
   - Remove duplicate utility classes via Tailwind purge

### 3.3 Loading & Skeleton States

**Implement Skeleton Components**
```typescript
// components/skeletons/
- DashboardHeaderSkeleton.tsx
- ChartCardSkeleton.tsx
- TableRowSkeleton.tsx
- StatsCardSkeleton.tsx

// Usage in dynamic imports:
const DashboardHeader = dynamic(
  () => import('./dashboard-header'),
  { loading: () => <DashboardHeaderSkeleton /> }
);
```

**Streaming with Suspense (Server Components)**
```typescript
// app/[locale]/dashboard/layout.tsx
export default async function Layout({ children }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardHeader />
    </Suspense>
  );
}
```

### 3.4 CSP & Security Headers

**Current CSP Configuration** (check `app/layout.tsx` & Next.js config)
```
Content-Security-Policy:
  default-src 'self'
  script-src 'self' 'unsafe-inline' vercel.com
  style-src 'self' 'unsafe-inline'
  img-src 'self' data: https:
  connect-src 'self' supabase.com vercel.com analytics.vercel.com
```

**Black Screen Fixes (CSP Violations)**
1. **Root Cause:** Inline scripts blocked or render paths fail
   ```html
   <!-- Remove or wrap CSP-compliant: -->
   <script dangerouslySetInnerHTML={{ __html: '...' }} />
   ```

2. **Solutions:**
   - Replace `dangerouslySetInnerHTML` with `<Script>` component + `strategy="beforeInteractive"`
   - Add `nonce` attributes for inline scripts
   - Move theme initialization to Supabase cookie (server-side)
   - Implement hydration boundary to prevent white flashes

3. **Verification:**
   ```bash
   npm run perf:headers  # Check CSP & CORS headers
   ```

### 3.5 Performance Budgets

**Lighthouse Targets (Vercel)**
```
- FCP (First Contentful Paint): < 1.0s
- LCP (Largest Contentful Paint): < 2.5s
- CLS (Cumulative Layout Shift): < 0.1
- FID (First Input Delay): < 100ms
- TTFB (Time to First Byte): < 0.6s
```

**Route Budgets**
```bash
npm run check:route-budgets  # Verify per-route limits

Expected limits:
- Landing page: < 80KB (gzipped)
- Dashboard: < 150KB (gzipped)
- Admin: < 100KB (gzipped)
- API routes: < 50KB (gzipped)
```

---

## PHASE 4: BLACK SCREEN & CSP VIOLATIONS FIX

### 4.1 Root Cause Analysis

**Common Black Screen Triggers:**
1. **CSP Blocking Script Execution**
   - Inline scripts without `unsafe-inline` or `nonce`
   - External scripts from CDNs not in CSP directive

2. **Hydration Mismatch**
   - Server renders different HTML than client
   - Theme provider initializes after render (causes flicker)

3. **Missing Provider Context**
   - RootProviders not wrapping children
   - Supabase session undefined on first render

### 4.2 Fix Implementation

**Step 1: Audit Inline Scripts**
```bash
# Find all dangerouslySetInnerHTML:
grep -r "dangerouslySetInnerHTML" app/
# Check app/layout.tsx lines 194-195, app/[locale]/layout.tsx
```

**Step 2: Migrate to Script Component**
```typescript
// BEFORE (risky):
<script dangerouslySetInnerHTML={{ __html: 'var _l=document.getElementById(...)' }} />

// AFTER (safe):
import Script from 'next/script';
<Script
  id="initial-loader-fade"
  strategy="beforeInteractive"
  dangerouslySetInnerHTML={{
    __html: `var _l=document.getElementById("initial-loader");if(_l){_l.style.transition="opacity .2s";_l.style.opacity="0";setTimeout(function(){_l.remove()},200)}`
  }}
/>
```

**Step 3: Update CSP Headers** (next.config.js)
```javascript
// Add to headers:
{
  key: 'Content-Security-Policy',
  value: "script-src 'self' 'unsafe-inline' 'nonce-{random}'; " +
         "style-src 'self' 'unsafe-inline'; " +
         "connect-src 'self' https://supabase.co https://vercel.com; " +
         "img-src 'self' data: https:; " +
         "font-src 'self' data:"
}
```

**Step 4: Verify No Black Screens**
```bash
# Test locally:
npm run dev
# Check Network tab → No 403/405 for resources
# Check Console → No CSP violations

# Test production:
npm run build && npm run start
```

---

## PHASE 5: VISUAL REFINEMENT DETAILS

### 5.1 Button & Interactive States

**Button Variants (Tailwind CSS)**
```typescript
// Primary
bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 disabled:opacity-50

// Secondary
bg-secondary text-secondary-foreground hover:bg-secondary/90

// Outline
border border-primary text-primary hover:bg-primary/5

// Ghost
text-foreground hover:bg-accent/10

// Icon (Small)
p-2 rounded-lg hover:bg-accent/10 transition-colors
```

**Focus & Active States**
```css
/* Focus ring (macOS style) */
focus:ring-2 focus:ring-primary/50 focus:ring-offset-1

/* Hover elevation */
hover:shadow-lg hover:translate-y-[-2px] transition-all

/* Active depression */
active:shadow-sm active:translate-y-[1px]
```

### 5.2 Input & Form Elements

**Input Styling**
```css
/* Text inputs */
px-3 py-2 rounded-lg border border-border
bg-background text-foreground
placeholder:text-muted-foreground
focus:border-primary focus:ring-2 focus:ring-primary/20
transition-all
```

**Label & Help Text**
```css
/* Label */
text-sm font-medium text-foreground mb-1.5

/* Help text */
text-xs text-muted-foreground mt-1

/* Error state */
text-error border-error focus:ring-error/20
```

### 5.3 Card & Surface Styling

**Premium Card Surface**
```typescript
<div className={cn(
  'rounded-2xl',
  'bg-card border border-border/20',
  'shadow-card-luxury',
  'p-fluid-lg',
  'backdrop-blur-xl',
  'hover:shadow-lg hover:border-border/40',
  'transition-all duration-300'
)}>
  {children}
</div>
```

**Stat Card with Metric**
```typescript
<div className="rounded-xl bg-surface-2 p-4 border border-border/10">
  <div className="text-xs font-medium text-muted-foreground mb-1">
    Metric Label
  </div>
  <div className="flex items-baseline gap-2">
    <span className="text-2xl font-semibold text-foreground">
      $12,345.67
    </span>
    <span className="text-xs text-success">+2.5%</span>
  </div>
</div>
```

### 5.4 Animation & Transitions

**Smooth Transitions (Tailwind + Framer Motion)**
```typescript
// Tailwind transitions
transition-all duration-300 ease-out

// Framer Motion (for complex animations)
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 10 }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
>
  {children}
</motion.div>

// macOS-native curves
cubic-bezier(0.25, 0.1, 0.25, 1.0)  // Default macOS timing
cubic-bezier(0.175, 0.885, 0.32, 1.1) // Spring timing
```

**Spring Animation Keyframes** (Tailwind)
```css
animation: spring-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
animation: spring-out 0.4s cubic-bezier(0.36, 0, 0.66, -0.56);
animation: slide-up-spring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

## PHASE 6: DEPLOYMENT TO VERCEL

### 6.1 Pre-Deployment Checklist

**Code Quality**
- [ ] `npm run typecheck` — No TS errors
- [ ] `npm run lint` — No ESLint issues
- [ ] `npm run test` — All tests pass
- [ ] `npm run check:dead-code` — No unused exports
- [ ] `npm run check:route-security` — No security issues

**Performance**
- [ ] `npm run analyze:bundle` — Bundle under limits
- [ ] `npm run perf:headers` — CSP & CORS validated
- [ ] `npm run perf:ci` — Full CI suite passes
- [ ] Lighthouse score > 80 on all pages

**UI/UX**
- [ ] Dark theme enforced (no light theme bleeding)
- [ ] Spacing audit complete (all components reviewed)
- [ ] Color consistency verified (no stray #hex colors)
- [ ] Black screen fixes applied
- [ ] CSP violations resolved

### 6.2 Build & Deployment

**Local Build**
```bash
# Clean build
npm run clean:build-artifacts

# Full build (includes database sync, route generation)
npm run build

# Test production locally
npm run start

# Verify:
# - No console errors
# - All pages load
# - Images optimized
# - CSS purged
```

**Vercel Deployment**
```bash
# Push to main branch (or feature branch for preview)
git add .
git commit -m "perf: comprehensive UI/UX optimization for 2026 macOS aesthetic"
git push origin main

# Vercel auto-deploys from main
# Monitor at: https://vercel.com/afrodeennoff/qunt-edge

# Post-deployment:
# 1. Check build logs (no warnings/errors)
# 2. Run Lighthouse audit (vercel.com/analytics)
# 3. Test on mobile, tablet, desktop
# 4. Verify CSP headers in DevTools
```

### 6.3 Monitoring & Analytics

**Vercel Analytics Dashboard**
- Real User Monitoring (RUM) for FCP, LCP, CLS
- Core Web Vitals trends
- Error rate tracking

**Performance Monitoring**
```typescript
// app/layout.tsx — Add telemetry
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
```

---

## PHASE 7: COMPREHENSIVE IMPROVEMENT REPORT

### 7.1 Report Structure

Generate detailed report covering:

#### A. Visual Design Improvements
```
1. Color System
   - Before: Mixed colors (some #hex, some CSS vars)
   - After: Unified oklch palette (obsidian + electric purple)
   - Impact: Consistent, modern, accessibility + color contrast validated

2. Typography
   - Before: Default Tailwind scaling
   - After: Fluid responsive typography (clamp-based)
   - Impact: Better readability across all viewport sizes

3. Spacing
   - Before: Inconsistent padding/margins (p-2, p-5, p-8, etc.)
   - After: Standardized tokens (fluid-xs to fluid-3xl)
   - Impact: 20% less CSS, better visual hierarchy

4. Glass-Morphism
   - Before: Basic flat cards
   - After: Multi-layer shadows, glass blur, depth perception
   - Impact: Premium feel, modern 2026 aesthetic
```

#### B. Component Refinement
```
Dashboard Header
- Before: Text alignment issues, filter UI cluttered
- After: Centered layout, clear visual hierarchy, icon spacing
- Metrics: 15px padding standardization, 3-level shadow depth

Sidebar Navigation
- Before: Hover states unclear, icon sizing inconsistent
- After: Clear hover/active states, consistent 20px icons
- Metrics: Gap standardization (8px between nav items)

Charts & Data Viz
- Before: Recharts default styling
- After: Custom color scheme (purple primary), responsive sizing
- Metrics: LCP improvement +200ms, memory usage -15%

Trade Table
- Before: Dense rows, poor readability
- After: Spacious layout (12px row gap), zebra striping
- Metrics: Column width optimization, filter performance +30%
```

#### C. Performance Metrics

**Before Optimization**
```
Bundle Size (gzipped):
- JS: 380KB
- CSS: 45KB
- Total: 425KB

Core Web Vitals (Lighthouse):
- FCP: 1.8s
- LCP: 3.2s
- CLS: 0.15
- FID: 95ms
- TTI: 4.5s

Performance Score: 62/100
```

**After Optimization**
```
Bundle Size (gzipped):
- JS: 280KB (-26%)
- CSS: 32KB (-28%)
- Total: 312KB (-26%)

Core Web Vitals:
- FCP: 0.9s (-50%)
- LCP: 2.1s (-34%)
- CLS: 0.05 (-67%)
- FID: 45ms (-53%)
- TTI: 2.8s (-38%)

Performance Score: 88/100 (+26 points)
```

#### D. CSR/SSR Changes
```
Routes Optimized for SSR:
- app/[locale]/(landing)/ — Public pages (faster TTFB)
- app/[locale]/dashboard/ — Auth check + bootstrap data
- app/[locale]/admin/ — Admin-only data

Routes with Dynamic Imports (CSR):
- Dashboard widgets (interactive)
- Import dialogs (broker-specific)
- Chart components (heavy Recharts)

Impact: 40% reduction in initial HTML size
```

#### E. Black Screen & CSP Fixes
```
Issues Resolved:
1. Inline script CSP violations → Migrated to Next.js <Script>
2. Hydration mismatch → Theme provider moved to server
3. Missing error boundaries → ErrorBoundary wrapper applied
4. Render blocking resources → Preload/prefetch optimized

CSP Headers Updated:
- script-src: 'self' + safe externals (no 'unsafe-inline')
- style-src: Tailwind output only
- connect-src: Supabase + Vercel APIs

Zero reported CSP violations in production
```

#### F. Before/After Visual Comparison

**Dashboard Header**
```
BEFORE:
┌─────────────────────────────────────────┐
│ Qunt Edge    Filter   Import   More     │ ← Misaligned, cluttered
├─────────────────────────────────────────┤

AFTER:
┌─────────────────────────────────────────────────────┐
│          🎯 Dashboard                               │ ← Centered, hierarchy clear
│   📊 Account   📅 Date Range   🔄 Refresh   ⚙️     │ ← Icons consistent, spaced
├─────────────────────────────────────────────────────┤
                   ↑ Glass surface, elegant shadow
```

**Sidebar Navigation**
```
BEFORE:
Dashboard
    └ 📊 Analytics
    └ 📈 Trades  ← No hover effect, text crowded
    └ ⚙️  Settings

AFTER:
Dashboard
    ├ 📊 Analytics    ← Clear hover highlight
    ├ 📈 Trades       ← Consistent spacing (12px gaps)
    └ ⚙️  Settings    ← Active state (purple glow + underline)
    
    [Spacious, readable, premium feel]
```

**Trading Cards**
```
BEFORE:
┌──────────────┐
│ Metric    $X │ ← Cramped, flat
└──────────────┘

AFTER:
┌────────────────────────┐
│                        │
│ Daily Profit           │ ← Breathing room
│ $12,345.67             │ ← Large, readable
│ +2.5% vs yesterday     │ ← Secondary info
│                        │
└────────────────────────┘ ← Glass surface, depth shadow
```

#### G. Deployment Summary
```
Deployment Details:
- Environment: Vercel Production
- Region: Edge (global CDN)
- Build Time: ~4m 30s
- Cache Strategy: Static (landing), ISR (dashboard)
- Environment Variables: All configured
- Database: Supabase (connected)

Post-Deployment Verification:
✓ All pages accessible
✓ No console errors
✓ API routes responding
✓ Lighthouse: 88/100
✓ Core Web Vitals: All Green
✓ CSP Headers: Verified
✓ SSL/TLS: A+ rating

Go-Live Date: 2026-05-06
Status: Live & Monitoring
```

---

## PHASE 8: IMPLEMENTATION ROADMAP

### Week 1: Design System & Audit
- [ ] Day 1-2: Audit all components (spacing, colors, typography)
- [ ] Day 3: Document design system inconsistencies
- [ ] Day 4-5: Create refactoring plan with priority matrix

### Week 2: Component Refinement
- [ ] Days 1-2: Refine dashboard shell (header, sidebar, layout)
- [ ] Days 3-4: Refine data components (tables, charts, filters)
- [ ] Day 5: Test on mobile/tablet/desktop

### Week 3: Performance & Fixes
- [ ] Days 1-2: Optimize bundle (code split, tree shake)
- [ ] Days 3-4: Fix black screen & CSP issues
- [ ] Day 5: Run full performance audit

### Week 4: Polish & Deploy
- [ ] Days 1-2: Final UI polish (animations, micro-interactions)
- [ ] Days 3-4: Full testing (TypeScript, Lint, Tests, Lighthouse)
- [ ] Day 5: Deploy to Vercel, monitor, generate report

---

## QUICK REFERENCE: KEY FILES TO MODIFY

### Design System & Styles
1. **app/globals.css** — Update CSS variables (colors, shadows, transitions)
2. **tailwind.config.ts** — Verify tokens, add custom colors/shadows
3. **app/layout.tsx** — Meta tags, CSP headers, theme initialization

### Component Refinement (Priority Order)
1. **app/[locale]/dashboard/layout.tsx** — Auth + shell structure
2. **components/sidebar/dashboard-sidebar.tsx** — Navigation styling
3. **app/[locale]/dashboard/components/dashboard-header.tsx** — Header layout
4. **components/widget-canvas.tsx** — Grid + spacing
5. **components/ui/card.tsx** — Card surface styling
6. **components/dashboard/charts/*.tsx** — Chart themes

### Performance & Security
1. **next.config.js** — CSP headers, compression settings
2. **app/[locale]/layout.tsx** — Suspense boundaries, skeleton loaders
3. **components/providers/root-providers.tsx** — Provider optimization

### Deployment
1. **.env.production** — Vercel environment variables
2. **vercel.json** — Build settings, redirects
3. **package.json** — Build scripts, dependencies

---

## SUCCESS CRITERIA

✅ **Visual Design**
- Dark theme enforced throughout (no light theme bleeding)
- Electric purple accents (oklch(0.60 0.22 297)) consistently applied
- Glass-morphism surfaces with proper depth shadows
- All components follow standardized spacing tokens

✅ **Performance**
- Bundle size < 320KB gzipped
- Lighthouse score ≥ 88/100
- All Core Web Vitals green
- CSP violations: 0

✅ **User Experience**
- Black screen issues resolved
- Smooth animations (spring curves, fade transitions)
- Mobile-first responsive design (tested on 5 viewports)
- All interactive elements have clear hover/active states

✅ **Deployment**
- Production build passes all checks
- Vercel deployment successful
- Real-time monitoring active
- Comprehensive report generated

---

## NOTES FOR AI/CLAUDE

When executing this prompt:

1. **Start with CLAUDE.md & AGENTS.md** — These define the project structure and constraints
2. **Follow strict order:** Design System → Components → Performance → Deploy
3. **Test frequently:** After each major change, run `npm run typecheck && npm run lint`
4. **Generate reports:** Use scripts like `npm run analyze:bundle`, `npm run perf:headers`
5. **Preserve existing logic:** Only refactor styling/spacing, never change functionality
6. **Commit often:** Small, logical commits with clear messages
7. **Document changes:** Update AGENTS.md or component comments as needed

**Key Constraints:**
- Next.js 16 (App Router) — no Pages directory changes
- React 19 — use latest hooks & patterns
- TypeScript strict mode — all types must be valid
- Tailwind CSS 4 — use `@apply` sparingly, prefer utility classes
- Supabase Auth — preserve existing auth flow
- Vercel deployment — use standard Next.js optimization practices

---

## APPENDIX: USEFUL COMMANDS

```bash
# Development
npm run dev                      # Start dev server
npm run dev:bun                 # Bun dev server (faster)

# Type checking & linting
npm run typecheck               # TypeScript check (strict)
npm run lint                    # ESLint audit

# Testing
npm run test                    # Vitest
npm run test:coverage           # Coverage report

# Performance analysis
npm run analyze:bundle          # Bundle size analysis
npm run perf:headers            # CSP & header validation
npm run perf:verify             # Route budgets + bundle
npm run perf:ci                 # Full CI pipeline

# Building
npm run build                   # Production build
npm run start                   # Production server

# Database
npx prisma generate             # Generate Prisma client
npx prisma db push              # Push schema (dev)
npx prisma migrate deploy       # Run migrations (prod)

# Utilities
npm run clean:build-artifacts   # Remove .next, dist
npm run self-heal               # Auto-fix common issues
npm run check:dead-code         # Find unused exports
npm run check:route-security    # Security audit
```

---

**Master Prompt Version:** 1.0  
**Last Updated:** 2026-05-06  
**Status:** Ready for Execution  
**Owner:** afrodeennoff  

