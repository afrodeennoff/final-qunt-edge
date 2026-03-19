# V2 Product Rewrite — Prop Trading Analytics Platform
## Execution Plan

> **For agentic workers:** REQUIRED: Use `superpowers:subagent-driven-development` to implement this plan.
> Steps use checkbox (`- [ ]`) syntax for tracking.
> **This plan is for the `qunt-edge` Next.js 15 codebase at `/Users/timon/Downloads/qunt-edge`.**

**Goal:** Rewrite the prop trading analytics platform's public-facing surfaces — design system, landing/home, deals, firm detail, and leaderboard — with a unified V2 aesthetic inspired by sedai.io (clean SaaS, subtle gradients, animated counters), propfirmperk.com (deals layout), and propfirmmatch.com (firm detail pages).

**Architecture:** Wave-based parallel execution. Wave 1 (Design System + Icons) is the foundation — it must complete before Waves 2-5 can begin. Waves 2–5 are mutually independent and can run in parallel subagents. Wave 6 (Performance + Backend Fixes) runs last and depends on all prior waves being merged.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Radix UI primitives, CVA, framer-motion, Lucide React (existing) + custom SVG icons (new), Prisma ORM, Supabase Auth.

---

## File Map: What Exists vs. What Needs Creating

### EXISTING (do not recreate, only modify)
```
app/[locale]/(home)/components/           ← 21 files: Hero, Features, etc.
app/[locale]/(landing)/propfirms/         ← real DB catalogue
app/[locale]/(landing)/prop-firm-deals/  ← mock deals (1 component)
app/[locale]/(landing)/deals/            ← comparison + firm cards + FAQ
components/ui/                            ← 56 components
components/ui/unified-sidebar.tsx         ← nav with prop-firms/deals links
components/icons.tsx                      ← custom SVG icons
styles/tokens.css                        ← 917-line luxury champagne gold theme
tailwind.config.ts                       ← theme config
app/globals.css                          ← Tailwind v4 + tokens
server/trades.ts, server/accounts.ts     ← backend
prisma/schema.prisma                     ← no PropFirm model yet
locales/en.ts, locales/fr.ts             ← i18n strings
```

### NEW (create from scratch)
```
components/icons/svg-icons.tsx            ← SVG icon system (Wave 1)
components/ui/v2/                        ← new V2 component variants (Wave 1)
app/[locale]/(landing)/deals-v2/         ← deals page rewrite (Wave 3)
app/[locale]/(landing)/firm/[slug]/     ← firm detail pages (Wave 3)
app/[locale]/(landing)/leaderboard/      ← leaderboard page (Wave 4)
app/[locale]/teams/dashboard/trader/[slug]/ ← trader profile (Wave 4)
server/prop-firms.ts                     ← firm CRUD server actions (Wave 3)
server/firm-reviews.ts                   ← review server actions (Wave 3)
prisma/migrations/YYYYMMDD_v2_propfirm/  ← PropFirm + FirmReview + FirmCoupon migrations
```

---

## Chunk 1: Wave 1 — Design System Foundation & SVG Icon System
**Duration estimate:** 4–6 subagent sessions
**Prerequisite:** Nothing (starts from scratch)
**Deliverable:** New `tokens-v2.css`, `svg-icons.tsx`, V2 variants of Button/Card/Badge/Avatar, micro-interaction CSS utilities

---

### Task 1.1: V2 Design Token System

**Files:**
- Create: `styles/tokens-v2.css` (new file)
- Modify: `app/globals.css` (import tokens-v2.css conditionally or replace)
- Modify: `tailwind.config.ts` (add v2 tokens)
- Modify: `locales/en.ts`, `locales/fr.ts` (v2-related i18n if needed)

- [ ] **Step 1: Create `styles/tokens-v2.css`**

```css
/**
 * V2 Design Token System — sedai.io inspired
 * 8px grid, 8/12/16px radius, monochrome + single accent
 * Replaces luxury champagne gold with clean dark SaaS palette
 */

@layer base {
  :root {
    /* ===== SPACING GRID (8px) ===== */
    --space-1: 0.25rem;   /* 4px */
    --space-2: 0.5rem;    /* 8px */
    --space-3: 0.75rem;   /* 12px */
    --space-4: 1rem;      /* 16px */
    --space-5: 1.25rem;   /* 20px */
    --space-6: 1.5rem;    /* 24px */
    --space-8: 2rem;      /* 32px */
    --space-10: 2.5rem;   /* 40px */
    --space-12: 3rem;     /* 48px */
    --space-16: 4rem;     /* 64px */
    --space-20: 5rem;     /* 80px */
    --space-24: 6rem;     /* 96px */

    /* ===== RADII (8/12/16px) ===== */
    --radius-sm: 0.5rem;   /* 8px */
    --radius-md: 0.75rem;  /* 12px */
    --radius-lg: 1rem;      /* 16px */
    --radius-full: 9999px;

    /* ===== V2 SEMANTIC TOKENS — Clean Dark SaaS ===== */
    /* Backgrounds */
    --v2-bg-base: 240 8% 3%;        /* #08080b deep black */
    --v2-bg-surface: 240 6% 6%;    /* #0f0f12 card surface */
    --v2-bg-elevated: 240 5% 9%;   /* #17171b elevated */
    --v2-bg-hover: 240 5% 12%;     /* #1f1f24 hover state */

    /* Text */
    --v2-text-primary: 0 0% 97%;    /* white-97 */
    --v2-text-secondary: 240 4% 65%; /* muted text */
    --v2-text-tertiary: 240 3% 45%;  /* very muted */

    /* Accent — single electric blue for V2 */
    --v2-accent: 217 91% 60%;       /* blue-500 equivalent */
    --v2-accent-hover: 217 91% 55%;
    --v2-accent-subtle: 217 91% 60% / 0.12;
    --v2-accent-foreground: 0 0% 100%;

    /* Borders */
    --v2-border: 240 5% 18%;
    --v2-border-subtle: 240 4% 12%;

    /* Status */
    --v2-success: 142 71% 45%;
    --v2-warning: 38 92% 50%;
    --v2-error: 0 72% 51%;

    /* ===== MICRO-INTERACTION UTILITIES ===== */
    --ease-v2: cubic-bezier(0.16, 1, 0.3, 1);
    --ease-v2-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
    --duration-fast: 150ms;
    --duration-base: 200ms;
    --duration-slow: 300ms;
  }
}
```

- [ ] **Step 2: Add v2 spacing + radius to `tailwind.config.ts`**

Add to `theme.extend`:
```ts
spacing: { 'v2-1': '0.25rem', 'v2-2': '0.5rem', 'v2-3': '0.75rem', ... },
borderRadius: { 'v2-sm': '0.5rem', 'v2-md': '0.75rem', 'v2-lg': '1rem' },
transitionTimingFunction: { 'v2': 'cubic-bezier(0.16, 1, 0.3, 1)', 'v2-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
transitionDuration: { 'fast': '150ms', 'base': '200ms', 'slow': '300ms' },
```

- [ ] **Step 3: Add v2 CSS class utilities to `app/globals.css`**

Add `@layer components` block with:
```css
@layer components {
  /* Button micro-interactions */
  .btn-v2 {
    transition: transform var(--duration-base) var(--ease-v2),
                background-color var(--duration-fast) var(--ease-v2),
                box-shadow var(--duration-base) var(--ease-v2);
  }
  .btn-v2:hover { transform: scale(1.02); }
  .btn-v2:active { transform: scale(0.98); }

  /* Card hover lift */
  .card-v2 {
    transition: transform var(--duration-base) var(--ease-v2),
                box-shadow var(--duration-base) var(--ease-v2);
  }
  .card-v2:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px hsl(240 6% 6% / 0.5), 0 0 0 1px hsl(240 5% 18%);
  }

  /* Page transitions */
  .page-enter { opacity: 0; transform: translateY(8px); }
  .page-enter-active { opacity: 1; transform: translateY(0); transition: opacity 200ms var(--ease-v2), transform 200ms var(--ease-v2); }

  /* SVG Loading spinner */
  .spinner-v2 { animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* SVG success check */
  .check-v2 { animation: check-pop 0.4s var(--ease-v2-bounce) forwards; }
  @keyframes check-pop { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
}
```

- [ ] **Step 4: Verify — run `npm run lint` on new files, check no regressions**

Run: `npx eslint styles/tokens-v2.css app/globals.css tailwind.config.ts`
Expected: warnings only, 0 errors

---

### Task 1.2: SVG Icon System

**Files:**
- Create: `components/icons/svg-icons.tsx` (8 icon types: Dashboard, Deals, Leaderboard, User/Profile, Settings, Reviews, Chart/Stats, Firm/Building)
- Create: `components/icons/index.ts` (re-export from svg-icons + existing)
- Modify: `components/icons.tsx` (add `v2` variants using new SVG icons)

- [ ] **Step 1: Create `components/icons/svg-icons.tsx`**

Each icon should support: `size` prop (default 24), `strokeWidth` (default 1.5), `className`, `style`, `color`. Two variants per icon: `outline` (default) and `duotone` (filled background).

```tsx
"use client"
import React from "react"

interface IconProps {
  size?: number
  strokeWidth?: number
  className?: string
  style?: React.CSSProperties
  color?: string
}

// Dashboard icon — grid of 4 squares
export function DashboardIcon({ size = 24, strokeWidth = 1.5, className, style, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

// Deals icon — stacked cards
export function DealsIcon({ size = 24, strokeWidth = 1.5, className, style, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="2" y="8" width="16" height="12" rx="2" />
      <path d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

// Leaderboard icon — podium
export function LeaderboardIcon({ size = 24, strokeWidth = 1.5, className, style, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M8 21v-6" />
      <path d="M16 21v-10" />
      <path d="M12 21V9" />
      <path d="M6 15h4" />
      <path d="M14 11h4" />
      <rect x="4" y="15" width="4" height="6" rx="1" />
      <rect x="10" y="9" width="4" height="12" rx="1" />
      <rect x="16" y="11" width="4" height="10" rx="1" />
    </svg>
  )
}

// User/Profile icon
export function ProfileIcon({ size = 24, strokeWidth = 1.5, className, style, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

// Settings icon
export function SettingsIcon({ size = 24, strokeWidth = 1.5, className, style, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

// Reviews icon — star with quote
export function ReviewsIcon({ size = 24, strokeWidth = 1.5, className, style, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  )
}

// Chart/Stats icon
export function ChartIcon({ size = 24, strokeWidth = 1.5, className, style, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M7 16l4-4 4 4 6-6" />
    </svg>
  )
}

// Firm/Building icon
export function FirmIcon({ size = 24, strokeWidth = 1.5, className, style, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  )
}

// Duotone variants (filled background + stroke)
export function DashboardIconDuotone(props: IconProps) {
  return (
    <svg width={props.size ?? 24} height={props.size ?? 24} viewBox="0 0 24 24" fill="hsl(217 91% 60% / 0.15)" stroke={props.color ?? "currentColor"} strokeWidth={props.strokeWidth ?? 1.5} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}
// ... repeat duotone pattern for all 8 icons
```

- [ ] **Step 2: Create `components/icons/index.ts`**

```ts
export * from "./svg-icons"
export * from "./lucide-icons" // or rename existing icons.tsx → lucide-icons.tsx
```

- [ ] **Step 3: Verify icon components render correctly**

Run: `npx tsc --noEmit components/icons/svg-icons.tsx`
Expected: 0 type errors

---

### Task 1.3: V2 UI Component Variants

**Files:**
- Create: `components/ui/v2/button-v2.tsx`
- Create: `components/ui/v2/card-v2.tsx`
- Create: `components/ui/v2/badge-v2.tsx`
- Create: `components/ui/v2/avatar-v2.tsx`
- Create: `components/ui/v2/input-v2.tsx`
- Create: `components/ui/v2/skeleton-v2.tsx`
- Modify: `tailwind.config.ts` (add `--radius-v2-sm/md/lg` if needed)

- [ ] **Step 1: Create `components/ui/v2/button-v2.tsx`**

Uses CVA with V2 tokens. Variants: `solid` (blue accent), `outline`, `ghost`, `destructive`. Applies `.btn-v2` micro-interaction classes. Supports `size="sm|md|lg"`.

```tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonV2Variants = cva(
  "inline-flex items-center justify-center gap-2 rounded-v2-md font-medium transition-all duration-base ease-v2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-accent focus-visible:ring-offset-2 focus-visible:ring-offset-v2-bg-base disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        solid: "bg-v2-accent text-v2-accent-foreground hover:bg-v2-accent-hover hover:scale-[1.02] active:scale-[0.98] shadow-sm",
        outline: "border border-v2-border bg-transparent text-v2-text-primary hover:bg-v2-bg-hover hover:scale-[1.02] active:scale-[0.98]",
        ghost: "text-v2-text-secondary hover:text-v2-text-primary hover:bg-v2-bg-hover",
        destructive: "bg-v2-error text-white hover:scale-[1.02] active:scale-[0.98]",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: { variant: "solid", size: "md" },
  }
)
```

- [ ] **Step 2: Create `components/ui/v2/card-v2.tsx`**

```tsx
// CardV2 — uses .card-v2 hover lift + V2 surface colors
// CardV2Header, CardV2Content, CardV2Footer mirror structure
```

- [ ] **Step 3: Create remaining V2 components**

Badge, Avatar, Input, Skeleton — all use V2 token classes (`bg-v2-bg-surface`, `text-v2-text-secondary`, `border-v2-border`).

- [ ] **Step 4: Run lint + typecheck**

Run: `npx eslint components/ui/v2/ --max-warnings=999999`
Expected: 0 errors

---

## Chunk 2: Wave 2 — Landing Page Redesign
**Duration estimate:** 3–4 subagent sessions
**Prerequisite:** Wave 1 complete (SVG icons + V2 tokens needed for this wave)
**Deliverable:** Redesigned home page with V2 aesthetics

---

### Task 2.1: V2 Hero Section

**Files:**
- Modify: `app/[locale]/(home)/components/Hero.tsx`
- Modify: `app/[locale]/(home)/components/HomeContent.tsx` (typography tokens)

- [ ] **Step 1: Rewrite Hero with V2 aesthetics**

V2 Hero should have:
- Bold display heading (`text-fluid-5xl font-bold text-v2-text-primary`)
- Clean subheading (14-16px, `text-v2-text-secondary`)
- Two CTAs: primary (`ButtonV2 solid lg`) + secondary (`ButtonV2 outline lg`)
- Animated stat counters (e.g., "2,400+ Traders", "$12M Funded")
- Subtle gradient background (`bg-gradient-to-br from-v2-bg-base to-v2-bg-surface`)
- No framer-motion shimmer/float (sedai-inspired: cleaner, quieter)
- Remove Cormorant Garamond references, use Geist for headings

- [ ] **Step 2: Verify Hero renders on `/`**

Run dev server check: `npm run dev` and open `localhost:3000` — Hero visible with V2 styles.

---

### Task 2.2: V2 Features Section

**Files:**
- Modify: `app/[locale]/(home)/components/Features.tsx`

- [ ] **Step 1: Replace feature icon placeholders with V2 SVG icons**

Use the new `svg-icons.tsx` icons. 6 features max, 2-column grid, each with:
- Duotone SVG icon (48x48, `bg-v2-accent-subtle`)
- Bold feature name (`text-v2-text-primary font-semibold`)
- Description (`text-v2-text-secondary text-sm`)

```tsx
import { DashboardIcon, DealsIcon, ChartIcon, LeaderboardIcon, ProfileIcon, SettingsIcon } from "@/components/icons/svg-icons"
```

- [ ] **Step 2: Apply card-v2 hover lift to feature cards**

Add `card-v2` class to each feature card wrapper.

---

### Task 2.3: V2 Trust / Stats Section + Footer CTA

**Files:**
- Create: `app/[locale]/(home)/components/TrustStats.tsx` (new)
- Modify: `app/[locale]/(home)/components/CTA.tsx` (V2 style)
- Modify: `app/[locale]/(home)/components/Footer.tsx` (V2 tokens)

- [ ] **Step 1: Create TrustStats component**

3–4 animated stat blocks: traders count, funded amount, payout total, success rate.
Clean numbers, large display font, no decorative clutter.

```tsx
// Animated counter hook
function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}
```

- [ ] **Step 2: Verify with `npm run lint`**

Run: `npx eslint app/[locale]/(home)/components/TrustStats.tsx app/[locale]/(home)/components/CTA.tsx`
Expected: 0 errors

---

## Chunk 3: Wave 3 — Deals + Firm Detail System
**Duration estimate:** 5–7 subagent sessions
**Prerequisite:** Wave 1 complete (V2 tokens + components needed)
**Deliverable:** Full deals page + firm detail pages + review system

---

### Task 3.1: Prisma — Add PropFirm, FirmReview, FirmCoupon Models

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/YYYYMMDD_v2_propfirm_schema/migration.sql`
- Run: `npx prisma migrate dev --name v2_propfirm_schema`

- [ ] **Step 1: Add PropFirm, FirmReview, FirmCoupon models to schema**

```prisma
model PropFirm {
  id            String   @id @default(cuid())
  slug          String   @unique  // URL-safe: "apex-trader-funding"
  name          String            // "Apex Trader Funding"
  category      String            // "Futures" | "Forex" | "Crypto"
  description   String?
  shortDesc     String?           // For cards: one line
  platform      String?           // "Tradovate" | "Rithmic" | etc.
  payoutModel   String?           // "Bi-weekly" | "Weekly" | etc.
  drawdownType  String?           // "Trailing" | "Static" | etc.
  profitSplit   String?           // "90/10"
  maxAllocation String?           // "$300K"
  referralUrl   String?
  logoUrl       String?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  reviews FirmReview[]
  coupons FirmCoupon[]

  @@index([slug])
  @@schema("public")
}

model FirmReview {
  id         String   @id @default(cuid())
  propfirmId String
  propfirm   PropFirm @relation(fields: [propfirmId], references: [id], onDelete: Cascade)
  userId     String
  username   String            // Username of reviewer (not nullable)
  rating     Int               // 1-5
  title      String?
  body       String?
  avatarUrl  String?           // Profile picture URL
  isVerified Boolean @default(false) // Verified account holder
  createdAt  DateTime  @default(now())

  @@index([propfirmId])
  @@index([userId])
  @@schema("public")
}

model FirmCoupon {
  id            String   @id @default(cuid())
  propfirmId    String
  propfirm      PropFirm @relation(fields: [propfirmId], references: [id], onDelete: Cascade)
  code          String
  discountPercent Int
  challengeFee  Int?     // Original fee before discount
  expiresAt     DateTime?
  claimUrl      String?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())

  @@unique([propfirmId, code])
  @@index([propfirmId])
  @@schema("public")
}
```

- [ ] **Step 2: Update User model to add relations**

Add to User model:
```prisma
  firmReviews   FirmReview[] @relation("UserReviews")
```

- [ ] **Step 3: Generate Prisma client and verify migration**

Run: `npx prisma generate && npx prisma migrate dev --name v2_propfirm_schema`
Expected: Migration applies cleanly, no conflicts

---

### Task 3.2: Server Actions — Firm CRUD + Reviews

**Files:**
- Create: `server/prop-firms.ts`
- Create: `server/firm-reviews.ts`
- Create: `server/firm-coupons.ts`

- [ ] **Step 1: Create `server/prop-firms.ts`**

```ts
// Public: list all active firms
export async function listPropFirms() {
  return prisma.propFirm.findMany({
    where: { isActive: true },
    include: {
      coupons: { where: { isActive: true } },
      reviews: { orderBy: { createdAt: "desc" }, take: 5 },
      _count: { select: { reviews: true, coupons: true } },
    },
    orderBy: { name: "asc" },
  })
}

// Public: get firm by slug
export async function getPropFirmBySlug(slug: string) {
  return prisma.propFirm.findUnique({
    where: { slug },
    include: {
      coupons: { where: { isActive: true } },
      reviews: {
        include: { firmReviews: false }, // just the review data
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { reviews: true } },
    },
  })
}

// Admin: create/update firm (requires admin auth)
export async function createPropFirm(data: CreatePropFirmInput) { ... }
export async function updatePropFirm(id: string, data: UpdatePropFirmInput) { ... }
```

- [ ] **Step 2: Create `server/firm-reviews.ts`**

```ts
// Authenticated: create review
export async function createFirmReview(data: {
  propfirmId: string
  rating: number
  title?: string
  body?: string
  avatarUrl?: string
}) {
  const userId = await getDatabaseUserId()
  // Unique: one review per user per firm
  const existing = await prisma.firmReview.findFirst({
    where: { propfirmId: data.propfirmId, userId }
  })
  if (existing) throw new Error("Already reviewed")
  return prisma.firmReview.create({ data: { ...data, userId, username: "..." } })
}

// Public: list reviews for a firm
export async function listFirmReviews(propfirmId: string, page = 1) { ... }
```

- [ ] **Step 3: Verify server actions**

Run: `npx tsc --noEmit server/prop-firms.ts server/firm-reviews.ts server/firm-coupons.ts`
Expected: 0 type errors

---

### Task 3.3: Deals Page V2 (`/deals-v2`)

**Files:**
- Create: `app/[locale]/(landing)/deals-v2/page.tsx` (server wrapper)
- Create: `app/[locale]/(landing)/deals-v2/page-client.tsx` (client component)
- Create: `app/[locale]/(landing)/deals-v2/components/deals-v2-experience.tsx`
- Create: `app/[locale]/(landing)/deals-v2/components/firm-card-v2.tsx`
- Create: `app/[locale]/(landing)/deals-v2/components/deals-sidebar.tsx`
- Create: `app/[locale]/(landing)/deals-v2/data/firms-query.ts` (server action wrapper)

- [ ] **Step 1: Create `app/[locale]/(landing)/deals-v2/data/firms-query.ts`**

```ts
import { listPropFirms } from "@/server/prop-firms"
export async function getDealsPageData() {
  const firms = await listPropFirms()
  return { firms }
}
```

- [ ] **Step 2: Build `deals-v2-experience.tsx`**

Layout: 2-column (3/4 + 1/4). Left: firm cards list (collapsible). Right: sidebar with ratings, rankings, quick filters.

Key UX:
- Left column scrolls independently
- Right sidebar is sticky
- Click firm card → opens `/firm/${slug}` in new tab (`target="_blank"`)
- Filter chips: All / Futures / Forex / Crypto
- Sort: Rating / Name / Newest
- Search input (filters firm list in real-time)

```tsx
// Simplified structure
<div className="flex gap-6 max-w-7xl mx-auto px-v2-6 py-v2-8">
  <main className="flex-1 min-w-0">
    {/* Filter bar */}
    <FilterBar />
    {/* Firm cards */}
    <div className="space-y-v2-3">
      {firms.map(firm => (
        <FirmCardV2 key={firm.id} firm={firm} />
      ))}
    </div>
  </main>
  <aside className="w-72 shrink-0">
    <DealsSidebar firms={firms} />
  </aside>
</div>
```

- [ ] **Step 3: Build `firm-card-v2.tsx`**

Collapsible card with: firm logo (or FirmIcon placeholder), name, category badge, short description, coupon count badge, "View Deals" link button.

- [ ] **Step 4: Build `deals-sidebar.tsx`**

Contains: Trader Rating Score (aggregate), Top 5 Ranked Firms list, Quick Filters (market type, payout model).

- [ ] **Step 5: Create server wrapper and verify route**

Run: `npm run typecheck` and confirm `/deals-v2` route generates without errors.

---

### Task 3.4: Firm Detail Page (`/firm/[slug]`)

**Files:**
- Create: `app/[locale]/(landing)/firm/[slug]/page.tsx` (server wrapper)
- Create: `app/[locale]/(landing)/firm/[slug]/page-client.tsx` (client shell)
- Create: `app/[locale]/(landing)/firm/[slug]/components/firm-header.tsx`
- Create: `app/[locale]/(landing)/firm/[slug]/components/firm-challenges.tsx`
- Create: `app/[locale]/(landing)/firm/[slug]/components/firm-rules.tsx`
- Create: `app/[locale]/(landing)/firm/[slug]/components/firm-reviews-section.tsx`
- Create: `app/[locale]/(landing)/firm/[slug]/components/firm-coupons-section.tsx`
- Modify: `components/ui/unified-sidebar.tsx` (add `/firm/[slug]` nav item under Social group)

- [ ] **Step 1: Create `app/[locale]/(landing)/firm/[slug]/page.tsx`**

```tsx
import { notFound } from "next/navigation"
import { getPropFirmBySlug } from "@/server/prop-firms"
import { FirmHeader } from "./components/firm-header"
import { FirmChallenges } from "./components/firm-challenges"
import { FirmRules } from "./components/firm-rules"
import { FirmReviewsSection } from "./components/firm-reviews-section"
import { FirmCouponsSection } from "./components/firm-coupons-section"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const firm = await getPropFirmBySlug(slug)
  if (!firm) return { title: "Firm Not Found" }
  return { title: `${firm.name} | Qunt Edge Deals`, description: firm.shortDesc }
}

export default async function FirmDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const firm = await getPropFirmBySlug(slug)
  if (!firm) notFound()

  return (
    <div className="max-w-5xl mx-auto">
      <FirmHeader firm={firm} />
      <div className="grid grid-cols-3 gap-6 mt-8">
        <div className="col-span-2 space-y-6">
          <FirmChallenges firm={firm} />
          <FirmRules firm={firm} />
          <FirmReviewsSection firm={firm} />
        </div>
        <div className="col-span-1">
          <FirmCouponsSection firm={firm} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build `firm-reviews-section.tsx`**

- Shows existing reviews (paginated, 10 per page)
- "Write a Review" button — visible only to authenticated users (`useSession()`)
- Review form: star rating (1–5), title, body text, optional avatar upload
- Unique username validation (user must have set username in profile)
- Avatar upload: `useSupabaseUpload` scoped to `firm-reviews/` prefix

- [ ] **Step 3: Build coupon + challenges + rules sections**

- Challenges: list of challenge tiers with pricing
- Rules: key rules table (drawdown, profit split, payout frequency, platform)
- Coupons: card grid of active coupons with copy-to-clipboard button

- [ ] **Step 4: Add firm nav link to sidebar**

Modify `components/ui/unified-sidebar.tsx` and `components/sidebar/dashboard-sidebar.tsx`:
Add item: `{ label: 'Firms', href: withLocale('/firm'), icon: <FirmIcon />, group: 'Social' }`

- [ ] **Step 5: Run `npm run lint` on all new firm route files**

Expected: 0 errors

---

## Chunk 4: Wave 4 — Leaderboard + Trader Profiles
**Duration estimate:** 3–4 subagent sessions
**Prerequisite:** Wave 1 complete (V2 components)
**Deliverable:** Leaderboard page + trader profile pages

---

### Task 4.1: Leaderboard Page

**Files:**
- Create: `app/[locale]/(landing)/leaderboard/page.tsx` (server wrapper)
- Create: `app/[locale]/(landing)/leaderboard/page-client.tsx`
- Create: `app/[locale]/(landing)/leaderboard/components/leaderboard-table.tsx`
- Create: `app/[locale]/(landing)/leaderboard/components/leaderboard-filters.tsx`
- Create: `app/[locale]/(landing)/leaderboard/data/leaderboard-query.ts`
- Modify: `components/ui/unified-sidebar.tsx` (add leaderboard nav item)
- Modify: `app/[locale]/(home)/page.tsx` (add leaderboard CTA link in Hero or Features)

- [ ] **Step 1: Create `app/[locale]/(landing)/leaderboard/data/leaderboard-query.ts`**

Uses existing `Trade` + `Account` + `User` models. Ranks by:
- Monthly PnL (default)
- All-time PnL
- Win rate
- Consistency score

Public data only — no sensitive account details exposed.

```ts
export async function getLeaderboardData(sort: "monthly_pnl" | "alltime_pnl" | "winrate" = "monthly_pnl") {
  const startOfMonth = startOfMonth(new Date())
  const trades = await prisma.trade.groupBy({
    by: ["userId"],
    _sum: { pnl: true },
    _count: { id: true },
    where: { closeDate: { gte: startOfMonth } },
    orderBy: sort === "monthly_pnl"
      ? { _sum: { pnl: "desc" } }
      : sort === "alltime_pnl"
      ? { _sum: { pnl: "desc" } }
      : undefined,
    take: 100,
  })
  // Join with user metadata (username, avatar)
  // Return ranked list with position number
}
```

- [ ] **Step 2: Build `leaderboard-table.tsx`**

Columns: Rank, Trader (username + avatar), PnL, Win Rate, Total Trades, Consistency Score.
Top 3 get gold/silver/bronze medal indicators.
Alternating row styling with `card-v2` row hover.

- [ ] **Step 3: Build filters + add to sidebar + home CTA**

Filters: sort by (tabs), time range (This Month / All Time).
Sidebar: add "Leaderboard" under Social group.
Home CTA: add to Hero or Features "See who's winning" link to `/leaderboard`.

---

### Task 4.2: Trader Profile Page

**Files:**
- Modify: `app/[locale]/teams/dashboard/trader/[slug]/page.tsx` (enhance existing)
- Create: `app/[locale]/teams/dashboard/trader/[slug]/components/trader-profile-header.tsx`
- Create: `app/[locale]/teams/dashboard/trader/[slug]/components/trader-stats-grid.tsx`
- Create: `app/[locale]/teams/dashboard/trader/[slug]/components/trader-reviews.tsx`
- Create: `app/[locale]/teams/dashboard/trader/[slug]/components/privacy-toggle.tsx`

- [ ] **Step 1: Enhance existing trader profile with V2 + privacy toggle**

- Add "Privacy: Public/Private" toggle (stored in `User` or `TeamMember`)
- If private + not owner → show blurred/placeholder
- Profile header: avatar, username, join date, total PnL, win rate, consistency
- Stats grid: V2 cards with micro-interactions
- Reviews section: shows reviews the trader has received (if public)

---

## Chunk 5: Wave 5 — Additional Prop Firms + Backend Fixes
**Duration estimate:** 2–3 subagent sessions
**Prerequisite:** Wave 3 (PropFirm schema) complete
**Deliverable:** 5 new firms seeded + API mismatch fixes + data flow hardening

---

### Task 5.1: Seed New Prop Firms

**Files:**
- Create: `prisma/seeders/prop-firms-seeder.ts`
- Create: `prisma/migrations/YYYYMMDD_seed_propfirms/migration.sql`

Firms to add (from user requirements):
1. **FundingPips** — Forex, MetaTrader 5, Static drawdown, 90/10 split
2. **The5ers** — Forex, cTrader, Trailing drawdown, 80/20 split (already partially in mock — make complete)
3. **FundedNext** — Forex, MetaTrader 5, Static drawdown, 90/10 split (already in mock — make complete)
4. **Top Futures firms** — Add 3 more futures firms
5. **Top CFD firms** — Add 3 more CFD firms

Each firm: slug, name, category, description, platform, rules, referralUrl, logoUrl (placeholder), coupons (where applicable).

- [ ] **Step 1: Create seeder file**

```ts
const FIRMS_TO_SEED = [
  {
    slug: "funding-pips",
    name: "FundingPips",
    category: "Forex",
    platform: "MetaTrader 5",
    shortDesc: "...",
    referralUrl: "https://fundingpips.com/ref/...",
    // ...
  },
  // ... all 5 firms
]

export async function seedPropFirms() {
  for (const firm of FIRMS_TO_SEED) {
    await prisma.propFirm.upsert({
      where: { slug: firm.slug },
      update: firm,
      create: firm,
    })
  }
}
```

- [ ] **Step 2: Run seed and verify**

Run: `npx tsx prisma/seeders/prop-firms-seeder.ts`
Expected: All firms upserted, no errors

---

### Task 5.2: API Mismatch + Data Flow Fixes

**Files (audit + fix):**
- Audit: `server/trades.ts`, `server/accounts.ts`, `server/groups.ts`
- Fix: Any mismatched return types, broken auth guards, state inconsistencies
- Verify: `npm run typecheck && npm run lint` passes on all server files

- [ ] **Step 1: Audit data flows**

Run: `npx tsc --noEmit` and note all type errors in server files.

- [ ] **Step 2: Fix top 5 errors**

Prioritize: auth guard mismatches, Prisma type drift, server action return type inconsistencies.

- [ ] **Step 3: Verify all server files lint clean**

Run: `npx eslint server/ --max-warnings=999999`
Expected: 0 errors

---

## Chunk 6: Wave 6 — Performance Optimization
**Duration estimate:** 2–3 subagent sessions
**Prerequisite:** Waves 1–5 complete (all new pages exist)
**Deliverable:** Lazy loading, API optimization, caching, reduced re-renders

---

### Task 6.1: Lazy Loading for V2 Pages

- [ ] **Step 1: Add `next/dynamic` for below-fold sections in deals page**

```tsx
const FirmReviewsSection = dynamic(() => import("./components/firm-reviews-section").then(m => ({ default: m.FirmReviewsSection })), {
  loading: () => <SkeletonV2 className="h-64" />,
  ssr: false,
})
```

- [ ] **Step 2: Add skeleton loaders for all new pages**

- Deals page: SkeletonV2 cards in firm list while loading
- Firm detail: SkeletonV2 for header, rules, challenges while data loads
- Leaderboard: SkeletonV2 rows while loading

---

### Task 6.2: API Optimization

- [ ] **Step 1: Add `unstable_cache` / `revalidate` tags to firm queries**

```ts
import { unstable_cache } from "next/cache"
export const listPropFirmsCached = unstable_cache(
  listPropFirms,
  ["prop-firms-list"],
  { revalidate: 3600, tags: ["prop-firms"] }
)
```

- [ ] **Step 2: Add `force-dynamic` to leaderboard route (always fresh)**

```tsx
export const dynamic = "force-dynamic"
```

---

### Task 6.3: Re-render Reduction

- [ ] **Step 1: Verify React.memo on all V2 list item components**

- `FirmCardV2` — memoized
- `LeaderboardRow` — memoized
- `ReviewCard` — memoized

- [ ] **Step 2: Verify no unnecessary context subscriptions in new pages**

Run: `npm run perf:lighthouse` (or equivalent) to confirm no regression.

---

## Verification Criteria Per Wave

### Wave 1 Verification
- [ ] `npx eslint styles/tokens-v2.css components/icons/svg-icons.tsx components/ui/v2/ --max-warnings=999999` → 0 errors
- [ ] `npx tsc --noEmit components/icons/svg-icons.tsx components/ui/v2/*.tsx` → 0 errors
- [ ] `npm run build` → routes generate for new icon + V2 component files

### Wave 2 Verification
- [ ] Home page (`/`) renders with new Hero, Features (SVG icons), TrustStats
- [ ] `npx eslint app/[locale]/(home)/components/Hero.tsx app/[locale]/(home)/components/Features.tsx app/[locale]/(home)/components/TrustStats.tsx` → 0 errors
- [ ] `npm run typecheck` → passes

### Wave 3 Verification
- [ ] `npx prisma migrate dev --name v2_propfirm_schema` → applies cleanly
- [ ] `npm run typecheck` → passes with new schema types
- [ ] `/deals-v2` renders: firm cards + sidebar
- [ ] `/firm/apex-trader-funding` (or slug) renders: header + sections
- [ ] Review form only visible when authenticated (verify with auth check)
- [ ] Avatar upload scoped to `firm-reviews/` prefix (verify with upload hook)

### Wave 4 Verification
- [ ] `/leaderboard` renders ranked table
- [ ] `npm run typecheck` → passes
- [ ] Trader profile privacy toggle works (public/private switch changes visibility)

### Wave 5 Verification
- [ ] All 5 new firms appear in deals page
- [ ] `npx eslint server/ --max-warnings=999999` → 0 errors
- [ ] `npm run typecheck` → passes

### Wave 6 Verification
- [ ] All new pages load without blocking JS (skeleton shown first)
- [ ] `npm run build` → full build succeeds
- [ ] `npm run check:route-budgets` → no regressions

---

## Dependency Graph

```
Wave 1 (Design System) ─────────┬──► Wave 2 (Landing Page)
                                 ├──► Wave 3 (Deals + Firm Detail) ←── Wave 1
                                 ├──► Wave 4 (Leaderboard + Profiles)
Wave 3 (Schema migrations) ─────┤
Wave 3 (Seed data) ────────────┴──► Wave 5 (New Firms + Fixes)

Waves 1-5 ──────────────────────────────► Wave 6 (Performance)
```

## Wave Parallelization Notes

**Wave 1 MUST run first** (sequential). Its output (SVG icons + V2 tokens) is consumed by Waves 2, 3, 4.

**Waves 2, 3, 4 can run in parallel** once Wave 1 is merged. Assign:
- Wave 2 → visual-engineering agent
- Wave 3 → deep/full-stack agent
- Wave 4 → standard agent

**Wave 5 (New Firms + Fixes)** depends on Wave 3's schema migration. Run after Wave 3.

**Wave 6 (Performance)** runs last, after all pages exist, to optimize what exists.

## Rollback Plan

If a wave introduces regressions:
1. Revert the wave's git commit
2. `npm run typecheck && npm run lint` must be green before continuing
3. Re-run the wave with corrections

## Notes for Agents

- **Do NOT touch `context/data-provider.tsx`** unless explicitly listed — it's a large, fragile file.
- **Do NOT touch `server/shared.ts`, `server/trades.ts`, `server/accounts.ts`** unless fixing API mismatches in Wave 5.
- **Do NOT remove existing pages** (propfirms, prop-firm-deals, deals) — keep them, the new deals-v2 and firm/[slug] are additive.
- **Use V2 tokens everywhere in new files** (`--v2-*` CSS vars, `v2-` Tailwind classes). Existing files stay unchanged.
- **Auth pattern**: `import { getDatabaseUserId } from "@/server/auth"` for server actions, `import { useSession } from "next-auth/react"` for client components.
- **Icon imports**: `import { DashboardIcon } from "@/components/icons/svg-icons"` — do NOT use Lucide as primary icons in new V2 pages.
