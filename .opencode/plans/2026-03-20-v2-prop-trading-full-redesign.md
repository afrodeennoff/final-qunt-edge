# V2 Prop Trading Full Redesign — Execution Plan

> **For agentic workers:** REQUIRED: Use `superpowers:subagent-driven-development` to implement this plan.
> Steps use checkbox (`- [ ]`) syntax for tracking.
> **This plan is for the `qunt-edge` Next.js 15 codebase at `/Users/timon/Downloads/qunt-edge`.**

**Goal:** Rebuild the prop trading platform's public-facing surfaces — unified design system, consolidated deals page, enhanced firm detail with reviews/coupons/challenges, leaderboard, trader profiles, and backend data integrity — with a sedai.io-inspired V2 aesthetic.

**Architecture:** 8-wave sequential pipeline. Each wave has a clean output that the next wave consumes. Waves 4–7 can run in parallel subagents once Wave 3 is complete. Wave 1 is the foundation — nothing else compiles cleanly without it.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Radix UI primitives, CVA, framer-motion, Lucide React, custom SVG icons (existing), Prisma ORM, Supabase Auth.

---

## Pre-Analysis: What Exists vs. What Needs Building

### EXISTING (partially done, needs integration/completion)
```
styles/tokens-v2.css              ← 228-line V2 system (electric blue) — ALREADY CREATED
components/icons/svg-icons.tsx    ← 509-line SVG icon system (8 icons) — ALREADY CREATED
components/ui/v2/                ← 8 V2 component variants — ALREADY CREATED
app/[locale]/(landing)/deals-v2/ ← DB-driven deals page — ALREADY CREATED
app/[locale]/(landing)/firm/[slug]/ ← Basic firm detail — EXISTS, needs enhancement
server/prop-firms.ts             ← CRUD server actions — EXISTS
server/firm-reviews.ts          ← Review actions — EXISTS
server/firm-coupons.ts          ← Coupon actions — EXISTS
app/[locale]/(landing)/leaderboard/page.tsx ← Basic leaderboard — EXISTS
```

### EXISTING BUT BROKEN / INCOMPLETE
```
styles/tokens.css                ← 917-line luxury edition (champagne gold) — CONFLICTS with V2
app/globals.css                 ← Defines oklch tokens on :root that override everything
app/layout.tsx                   ← Font variables broken (--font-geist undefined)
tailwind.config.ts               ← 484 lines, animation keyframes duplicated in 3 places
app/[locale]/(landing)/prop-firm-deals/ ← 100% mock data, NO DB connection
app/[locale]/(landing)/deals/  ← Mock data from prop-firm-deals/mock-data.ts
app/[locale]/dashboard/components/accounts/config.ts ← 1747-line hardcoded config, NOT synced with DB
app/[locale]/(landing)/propfirms/ ← Raw SQL aggregation but falls back to dev mock
prisma/schema.prisma            ← Account.propfirm is STRING (no FK), Payout.status is STRING (no enum)
server/accounts.ts               ← savePayoutAction accepts unconstrained string status
```

### NEW (create from scratch)
```
app/[locale]/(landing)/deals/          ← CONSOLIDATED deals page replacing all 3 existing
app/[locale]/dashboard/components/accounts/account-configurator.tsx ← Wire to DB (not config.ts)
server/admin/prop-firms.ts             ← Admin CRUD for PropFirm/FirmReview/FirmCoupon
server/challenges.ts                   ← Challenge model server actions
components/ui/v2/comparison-table.tsx  ← Multi-firm horizontal scroll comparison
components/ui/v2/review-card.tsx      ← Review card with avatar, rating, moderation
components/ui/v2/coupon-card.tsx      ← Coupon card with copy-to-clipboard
app/[locale]/(landing)/deals/components/firm-comparison-tool.tsx
app/[locale]/(landing)/deals/components/deals-hero.tsx
app/[locale]/(landing)/deals/components/deals-firm-grid.tsx
app/[locale]/(landing)/deals/components/deals-filters.tsx
app/[locale]/(landing)/firm/[slug]/components/firm-challenges-section.tsx
app/[locale]/(landing)/firm/[slug]/components/firm-rules-section.tsx
app/[locale]/(landing)/firm/[slug]/components/firm-coupons-section-enhanced.tsx
app/[locale]/(landing)/firm/[slug]/components/firm-reviews-section-enhanced.tsx
app/[locale]/admin/propfirms/page.tsx ← Admin PropFirm CRUD page
app/[locale]/admin/reviews/page.tsx   ← Admin review moderation page
locales/en/deals.ts                   ← Deals-specific i18n strings
locales/fr/deals.ts
prisma/migrations/YYYYMMDD_v2_data_integrity/ ← FK migration + PayoutStatus enum
prisma/migrations/YYYYMMDD_v2_challenges/    ← Challenge model
```

---

## Wave Dependency Graph

```
Wave 1 (Design System) ─────────────────────────┬──► Wave 3 (Deals Consolidation)
Wave 2 (Data Integrity) ──────────────────────┤       ↓
                                              ├──► Wave 4 (Firm Detail + Admin)
Wave 3 (Deals Consolidation) ─────────────────┤
Wave 4 (Firm Detail + Admin) ─────────────────┤
Wave 5 (Account Configurator → DB) ────────────┼──► Wave 6 (Leaderboard + Profiles)
Wave 6 (Leaderboard + Profiles) ───────────────┤
Wave 7 (Landing Redesign + Animation) ────────┤
                                              └──► Wave 8 (Performance + Polish)
```

**Critical path:** Wave 1 → Wave 2 → Wave 3 → Wave 4/5/6/7 (parallel) → Wave 8

---

## Chunk 1: Wave 1 — Design System Unification

**Duration estimate:** 3–4 subagent sessions
**Prerequisite:** None
**Deliverable:** Single canonical token file, fixed font stack, deduplicated animations, V2 tokens as default for new pages

### Task 1.1: Token File Consolidation

**Files:**
- Modify: `styles/tokens.css:1-917` — DELETE after migration
- Modify: `styles/tokens-v2.css:1-228` — KEEP as canonical, rename section comments
- Modify: `app/globals.css` — remove `:root { oklch }` block that overrides everything
- Modify: `tailwind.config.ts` — remove V1 token mappings, keep only V2

- [ ] **Step 1: Audit what `tokens.css` tokens are actually used**

```bash
# Find usage of V1 tokens across codebase
rg "--accent-luxury|--accent-rose|--accent-bronze|--bg-base|--fg-primary" --type css --type tsx -l | head -30
```

- [ ] **Step 2: Audit what V2 tokens are actually used**

```bash
rg "--v2-bg-base|--v2-text-primary|--v2-accent" --type css --type tsx -l | head -30
```

- [ ] **Step 3: Create merged canonical token file**

Move all V2 tokens to `styles/tokens.css`, removing V1 luxury tokens. The canonical token file should contain:
- V2 backgrounds (electric blue SaaS dark palette)
- V2 text hierarchy (97%/65%/45% white)
- V2 accent (electric blue)
- V2 status (success/warning/error)
- V2 spacing (8px grid)
- V2 easing/duration
- V2 shadows
- V2 border radius
- ONLY keep V1 chart tokens (gold monotone) since charts still use them

- [ ] **Step 4: Delete `tokens-v2.css` — all tokens now in `tokens.css`**

- [ ] **Step 5: Fix `app/globals.css` :root block**

Remove the oklch `:root { --background: oklch(...) }` block that overrides all HSL tokens. Replace with proper HSL references to canonical tokens.

- [ ] **Step 6: Update `tailwind.config.ts`**

Remove all V1 font-family entries, animation keyframe duplicates, and theme extensions that conflict with V2. Keep only V2 spacing, radius, color, and easing tokens.

- [ ] **Step 7: Verify**

```bash
npm run lint -- styles/tokens.css app/globals.css tailwind.config.ts
npm run typecheck
npm run build  # must generate routes cleanly
```

### Task 1.2: Font Stack Fix

**Files:**
- Modify: `app/layout.tsx` — fix undefined font variables
- Modify: `app/globals.css` — fix body font-family

- [ ] **Step 1: Audit undefined font variables**

```bash
rg "font-geist|font-inter" --type tsx --type css -n | head -20
```

- [ ] **Step 2: Fix body font in `globals.css`**

Replace `var(--font-geist), var(--font-inter)` with `var(--font-sans)`.

- [ ] **Step 3: Verify font rendering on landing and dashboard**

```bash
npm run typecheck
npm run lint -- app/layout.tsx app/globals.css
```

### Task 1.3: Animation Deduplication

**Files:**
- Modify: `tailwind.config.ts` — consolidate keyframes
- Modify: `app/globals.css` — remove duplicate keyframe definitions

- [ ] **Step 1: Find all animation definitions**

```bash
rg "@keyframes|animate-" --type css -n | grep -E "(@keyframes|animate-)" | sort -u
```

- [ ] **Step 2: Deduplicate — keep one canonical definition per animation**

Strategy: Keep definitions in `globals.css`, remove duplicates from `tailwind.config.ts`.

- [ ] **Step 3: Verify**

```bash
npm run lint -- app/globals.css tailwind.config.ts
```

---

## Chunk 2: Wave 2 — Backend Data Integrity (CRITICAL)

**Duration estimate:** 2–3 subagent sessions
**Prerequisite:** Wave 1 (can start immediately — different files)
**Deliverable:** FK constraint for Account→PropFirm, typed PayoutStatus enum, Challenge model, migration

### Task 2.1: Account.propfirm → FK Migration

**Files:**
- Modify: `prisma/schema.prisma` — add `propfirmId` FK field
- Create: `prisma/migrations/YYYYMMDD_v2_account_propfirm_fk/migration.sql`
- Modify: `server/accounts.ts` — update `setupAccountAction` to use FK
- Modify: `server/accounts.ts` — keep `propfirm` string as display name (denormalized)
- Modify: `app/[locale]/dashboard/components/accounts/account-configurator.tsx` — lookup PropFirm.id by slug
- Test: `tests/server/accounts-prop-firm-fk.test.ts`

- [ ] **Step 1: Add `propfirmId` optional FK to Account model**

```prisma
model Account {
  // ... existing fields ...
  propfirmId  String?
  propfirmSlug String  @default("")  // denormalized display name
  propfirm     PropFirm? @relation(fields: [propfirmId], references: [id])
}
```

- [ ] **Step 2: Create migration**

```sql
-- Add propfirmId column (nullable, no FK yet)
ALTER TABLE "account" ADD COLUMN "propfirmId" TEXT;
ALTER TABLE "account" ADD COLUMN "propfirmSlug" TEXT DEFAULT '';

-- Backfill: match existing propfirm strings to PropFirm.id
UPDATE "account" a
SET "propfirmId" = pf.id,
    "propfirmSlug" = a."propfirm"
FROM "prop_firm" pf
WHERE a."propfirm" ILIKE '%' || pf.slug || '%'
   OR a."propfirm" ILIKE '%' || pf.name || '%';

-- Add FK constraint (set NULL for unmatched)
ALTER TABLE "account" ADD CONSTRAINT "account_propfirmId_fkey"
  FOREIGN KEY ("propfirmId") REFERENCES "prop_firm"(id) ON DELETE SET NULL;

-- Accounts with no match keep propfirmSlug but propfirmId is NULL
```

- [ ] **Step 3: Update `setupAccountAction` in `server/accounts.ts`**

When saving an account, look up `PropFirm.id` by slug and set `propfirmId`. Keep `propfirm` string for backward compat with existing data.

- [ ] **Step 4: Write integration test**

```ts
// tests/server/accounts-prop-firm-fk.test.ts
test("setupAccountAction resolves propfirmId from slug", async () => {
  const firm = await createTestPropFirm({ slug: "apex-trader" })
  const account = await setupAccountAction({ propfirm: "Apex Trader" })
  expect(account.propfirmId).toBe(firm.id)
  expect(account.propfirm).toBe("Apex Trader") // denormalized
})
```

- [ ] **Step 5: Run migration + verify**

```bash
npx prisma migrate dev --name v2_account_propfirm_fk
npx prisma generate
npm run typecheck
npm run lint -- server/accounts.ts
npx vitest run tests/server/accounts-prop-firm-fk.test.ts
```

### Task 2.2: PayoutStatus Typed Enum

**Files:**
- Modify: `prisma/schema.prisma` — add `PayoutStatus` enum and update Payout.status
- Create: `prisma/migrations/YYYYMMDD_v2_payout_status_enum/migration.sql`
- Modify: `server/accounts.ts` — use typed enum in savePayoutAction
- Modify: `lib/account-metrics.ts` — use typed enum in metrics queries
- Modify: `app/[locale]/propfirms/actions/get-propfirm-catalogue.ts` — use typed enum in raw SQL
- Test: `tests/server/payout-status-enum.test.ts`

- [ ] **Step 1: Add enum to schema**

```prisma
enum PayoutStatus {
  PENDING
  PAID
  VALIDATED
  REFUSED
}

model Payout {
  status PayoutStatus @default(PENDING)
  // ... existing fields ...
}
```

- [ ] **Step 2: Create migration**

```sql
-- Add CHECK constraint for existing string values
ALTER TABLE "payout" ADD COLUMN "status_new" "PayoutStatus" DEFAULT 'PENDING';

-- Migrate data
UPDATE "payout" SET "status_new" = "status"::"PayoutStatus"
  WHERE "status" IN ('PENDING', 'PAID', 'VALIDATED', 'REFUSED');

ALTER TABLE "payout" DROP COLUMN "status";
ALTER TABLE "payout" RENAME COLUMN "status_new" TO "status";
```

- [ ] **Step 3: Update `savePayoutAction` signature**

```ts
// server/accounts.ts
export async function savePayoutAction(
  data: {
    status: PayoutStatus  // was: string
    // ...
  }
)
```

- [ ] **Step 4: Write test**

```ts
// tests/server/payout-status-enum.test.ts
test("savePayoutAction rejects invalid status", async () => {
  await expect(savePayoutAction({
    accountId: "test",
    status: "INVALID_STATUS" as PayoutStatus
  })).rejects.toThrow()
})
```

- [ ] **Step 5: Verify**

```bash
npx prisma migrate dev --name v2_payout_status_enum
npx prisma generate
npm run typecheck
npx vitest run tests/server/payout-status-enum.test.ts
```

### Task 2.3: Challenge Model

**Files:**
- Modify: `prisma/schema.prisma` — add `Challenge` model
- Create: `prisma/migrations/YYYYMMDD_v2_challenges/migration.sql`
- Modify: `server/prop-firms.ts` — add challenge CRUD
- Create: `app/[locale]/(landing)/firm/[slug]/components/firm-challenges-section.tsx`

- [ ] **Step 1: Add Challenge model to schema**

```prisma
model Challenge {
  id          String   @id @default(cuid())
  propfirmId  String
  propfirm    PropFirm @relation(fields: [propfirmId], references: [id], onDelete: Cascade)
  name        String   // e.g., "1-Step", "2-Step", "Express"
  phase       Int      // 1, 2, 3
  description String?
  rules       Json     // flexible rules object
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  @@index([propfirmId])
  @@map("challenge")
}
```

- [ ] **Step 2: Add to PropFirm relation**

```prisma
model PropFirm {
  challenges Challenge[]
  // ...
}
```

- [ ] **Step 3: Create migration + server actions**

```bash
npx prisma migrate dev --name v2_challenges
npx prisma generate
```

- [ ] **Step 4: Verify**

```bash
npm run typecheck
npx vitest run tests/server/prop-firms.test.ts
```

---

## Chunk 3: Wave 3 — Deals Page Consolidation

**Duration estimate:** 3–4 subagent sessions
**Prerequisite:** Waves 1 + 2 complete
**Deliverable:** Single `/deals` page replacing all 3 existing pages, DB-driven, comparison tool

### Task 3.1: Unified Deals Server Action

**Files:**
- Create: `app/[locale]/(landing)/deals/actions/get-deals-data.ts`
- Modify: `server/prop-firms.ts` — add `listPropFirmsWithStats()` with catalogue aggregates

- [ ] **Step 1: Create `getDealsData()` server action**

Combines:
- `listPropFirms()` (firm list with reviews/coupons count)
- `getPropfirmCatalogueData()` (account counts, payout stats)
- Category filtering (Forex/Futures/Crypto)
- Sorting (by name, payout rate, account count)

- [ ] **Step 2: Verify**

```bash
npm run typecheck
npm run lint -- app/[locale]/(landing)/deals/actions/
```

### Task 3.2: Deals Page Components

**Files:**
- Create: `app/[locale]/(landing)/deals/page.tsx` — replaces all 3 existing
- Create: `app/[locale]/(landing)/deals/components/deals-hero.tsx`
- Create: `app/[locale]/(landing)/deals/components/deals-firm-grid.tsx`
- Create: `app/[locale]/(landing)/deals/components/deals-firm-card.tsx`
- Create: `app/[locale]/(landing)/deals/components/deals-filters.tsx`
- Create: `app/[locale]/(landing)/deals/components/deals-comparison-tool.tsx`
- Create: `app/[locale]/(landing)/deals/components/deals-sticky-banner.tsx`
- Delete: `app/[locale]/(landing)/deals-v2/page.tsx` (merged into /deals)
- Delete: `app/[locale]/(landing)/prop-firm-deals/page.tsx` (merged into /deals)

**Key design patterns from propfirmmatch/propfirmperk:**
- Deal percentage as hero element on firm cards
- Star ratings + review counts
- Copy-to-clipboard coupon codes
- Category tabs (Forex/Futures/Crypto)
- Multi-firm comparison tool (side-by-side)
- Horizontal scroll table for dense comparison

- [ ] **Step 1: Create deals-hero component**

Sedai.io patterns: 160px section padding, single-hue accent, light-weight headings (font-weight: 300), pill CTA buttons.

```tsx
// deals-hero.tsx
export function DealsHero() {
  return (
    <section className="py-40 text-center">
      <h1 className="text-5xl font-light tracking-tight">
        The Best Prop Trading Deals
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Compare payouts, challenges, and reviews — all in one place.
      </p>
      <ButtonV2 className="mt-8 px-16">Browse All Firms</ButtonV2>
    </section>
  )
}
```

- [ ] **Step 2: Create deals-firm-card component**

Deal percentage as hero badge. Star rating. Review count. Coupon chip. Referral CTA.

```tsx
// deals-firm-card.tsx
export function DealsFirmCard({ firm }: { firm: PropFirmWithStats }) {
  return (
    <CardV2 className="p-6 hover:shadow-v2-glow transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{firm.name}</h3>
          <BadgeV2 variant="outline">{firm.category}</BadgeV2>
        </div>
        {firm.bestDeal && (
          <div className="bg-v2-accent/10 text-v2-accent px-3 py-1 rounded-full text-sm font-semibold">
            {firm.bestDeal}
          </div>
        )}
      </div>
      {/* ... */}
    </CardV2>
  )
}
```

- [ ] **Step 3: Create comparison tool component**

Multi-firm selection → side-by-side metrics table. Horizontal scroll for mobile.

```tsx
// deals-comparison-tool.tsx
export function FirmComparisonTool({ firms }: { firms: PropFirmWithStats[] }) {
  const [selected, setSelected] = useState<string[]>([])

  return (
    <div className="space-y-4">
      <FirmSelectorMulti firms={firms} selected={selected} onChange={setSelected} />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          {/* ... */}
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Wire page together**

```tsx
// deals/page.tsx
export const revalidate = 3600

export default async function DealsPage() {
  const data = await getDealsData()
  return <DealsExperience initialData={data} />
}
```

- [ ] **Step 5: Delete old parallel pages**

After confirming new `/deals` works, remove:
- `app/[locale]/(landing)/deals-v2/page.tsx`
- `app/[locale]/(landing)/deals-v2/components/`
- `app/[locale]/(landing)/prop-firm-deals/page.tsx` (keep data/mock-data.ts for reference)

- [ ] **Step 6: Verify**

```bash
npm run typecheck
npm run lint -- app/[locale]/(landing)/deals/
npm run build  # /deals must generate cleanly
```

### Task 3.3: Redirect Old Routes to `/deals`

**Files:**
- Modify: `app/[locale]/(landing)/deals-v2/page.tsx` — redirect to /deals
- Modify: `app/[locale]/(landing)/prop-firm-deals/page.tsx` — redirect to /deals

- [ ] **Step 1: Add redirect to old pages**

```tsx
// For deals-v2/page.tsx and prop-firm-deals/page.tsx:
import { redirect } from 'next/navigation'

export default function OldDealsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}/deals`)
}
```

- [ ] **Step 2: Verify redirects work**

```bash
# Test in browser or via curl
curl -I http://localhost:3000/en/deals-v2  # should 301 → /en/deals
curl -I http://localhost:3000/en/prop-firm-deals  # should 301 → /en/deals
```

---

## Chunk 4: Wave 4 — Firm Detail + Reviews + Admin CRUD

**Duration estimate:** 3–4 subagent sessions
**Prerequisite:** Wave 3 complete
**Deliverable:** Enhanced firm detail with challenges, rules, reviews, coupons; admin CRUD pages

### Task 4.1: Enhanced Firm Detail Page

**Files:**
- Modify: `app/[locale]/(landing)/firm/[slug]/page.tsx` — add challenges data
- Create: `app/[locale]/(landing)/firm/[slug]/components/firm-challenges-section.tsx`
- Create: `app/[locale]/(landing)/firm/[slug]/components/firm-rules-section.tsx`
- Modify: `app/[locale]/(landing)/firm/[slug]/components/firm-reviews-section.tsx` — add pagination
- Modify: `app/[locale]/(landing)/firm/[slug]/components/firm-coupons-section.tsx` — add copy-to-clipboard
- Modify: `server/prop-firms.ts` — add `getPropFirmBySlugWithFull()` including challenges

- [ ] **Step 1: Add challenges to firm detail data fetch**

```ts
// server/prop-firms.ts
export async function getPropFirmBySlugWithFull(slug: string) {
  return prisma.propFirm.findUnique({
    where: { slug },
    include: {
      challenges: { where: { isActive: true }, orderBy: { phase: 'asc' } },
      reviews: { orderBy: { createdAt: 'desc' }, take: 10 },
      coupons: { where: { isActive: true } },
      _count: { select: { reviews: true, coupons: true } },
    },
  })
}
```

- [ ] **Step 2: Create challenges section**

Render challenge cards with phase, name, rules (JSON rendered as structured list), and "Start Challenge" CTA linking to referral URL.

- [ ] **Step 3: Create rules section**

Structured rules display from `Challenge.rules` JSON — daily loss limit, profit target, consistency rules, trading days, etc.

- [ ] **Step 4: Add review pagination**

```tsx
// firm-reviews-section.tsx
const [page, setPage] = useState(1)
const PAGE_SIZE = 10

const { reviews, total } = await listFirmReviews({ propfirmId: firm.id, page, pageSize: PAGE_SIZE })
```

- [ ] **Step 5: Verify firm detail page**

```bash
npm run typecheck
npm run lint -- app/[locale]/(landing)/firm/
npm run build  # /firm/[slug] must generate cleanly
```

### Task 4.2: Review System Enhancement

**Files:**
- Modify: `server/firm-reviews.ts` — add update/delete for own reviews, moderation flags
- Modify: `app/[locale]/(landing)/firm/[slug]/components/firm-reviews-section.tsx` — add avatar, rating stars, moderation
- Create: `components/ui/v2/review-card.tsx`
- Modify: `prisma/schema.prisma` — add `moderationStatus` to FirmReview

- [ ] **Step 1: Add moderationStatus to FirmReview**

```prisma
model FirmReview {
  moderationStatus String @default("PENDING") // PENDING | APPROVED | REJECTED
  moderationNote String?
  // ...
}
```

- [ ] **Step 2: Create review card component**

Profile picture (avatar), unique username, star rating (1-5 filled stars), title, body, verification badge, date.

```tsx
// components/ui/v2/review-card.tsx
export function ReviewCard({ review }: { review: FirmReview }) {
  return (
    <CardV2 className="p-5">
      <div className="flex items-start gap-3">
        <AvatarV2 src={review.avatarUrl} alt={review.username} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{review.username}</span>
            {review.isVerified && <BadgeV2 variant="accent">Verified</BadgeV2>}
          </div>
          <StarRating value={review.rating} />
          {review.title && <p className="mt-2 font-semibold">{review.title}</p>}
          {review.body && <p className="mt-1 text-muted-foreground">{review.body}</p>}
        </div>
      </div>
    </CardV2>
  )
}
```

- [ ] **Step 3: Add own-review edit/delete (auth-gated)**

Only the review author can edit/delete their own review. Add action buttons when `review.userId === currentUserId`.

- [ ] **Step 4: Verify**

```bash
npm run typecheck
npm run lint -- server/firm-reviews.ts
npx vitest run tests/server/firm-reviews.test.ts
```

### Task 4.3: Admin CRUD Pages

**Files:**
- Create: `app/[locale]/admin/propfirms/page.tsx` — PropFirm CRUD list
- Create: `app/[locale]/admin/propfirms/[id]/page.tsx` — PropFirm edit
- Create: `app/[locale]/admin/reviews/page.tsx` — Review moderation queue
- Create: `app/[locale]/admin/coupons/page.tsx` — Coupon management
- Create: `server/admin/prop-firms.ts` — admin-only server actions

- [ ] **Step 1: Create admin server actions with `assertAdminAccess()`**

```ts
// server/admin/prop-firms.ts
'use server'
import { assertAdminAccess } from '@/server/auth'

export async function adminListPropFirms() {
  await assertAdminAccess()
  return prisma.propFirm.findMany({ include: { _count: { select: { reviews: true, coupons: true } } } })
}

export async function adminCreatePropFirm(data: CreatePropFirmInput) {
  await assertAdminAccess()
  return prisma.propFirm.create({ data })
}

export async function adminUpdatePropFirm(id: string, data: UpdatePropFirmInput) {
  await assertAdminAccess()
  return prisma.propFirm.update({ where: { id }, data })
}

export async function adminDeletePropFirm(id: string) {
  await assertAdminAccess()
  return prisma.propFirm.delete({ where: { id } })
}
```

- [ ] **Step 2: Create PropFirm admin list page**

Data table with: Name, Category, Slug, Reviews count, Coupons count, Active toggle, Actions (Edit/Delete).

- [ ] **Step 3: Create PropFirm edit page**

Form with all PropFirm fields: name, slug, category, description, shortDesc, platform, payoutModel, drawdownType, profitSplit, maxAllocation, referralUrl, logoUrl, isActive.

- [ ] **Step 4: Create review moderation queue**

List pending reviews. Approve/Reject buttons. Moderation note field.

- [ ] **Step 5: Verify**

```bash
npm run typecheck
npm run lint -- server/admin/
npm run build  # admin/propfirms must generate cleanly
```

---

## Chunk 5: Wave 5 — Account Configurator → DB Sync

**Duration estimate:** 2 subagent sessions
**Prerequisite:** Wave 2 (FK migration) complete
**Deliverable:** Account configurator uses DB as source of truth, not hardcoded config.ts

### Task 5.1: Wire Configurator to PropFirm DB

**Files:**
- Modify: `app/[locale]/dashboard/components/accounts/account-configurator.tsx` — fetch from DB, not config.ts
- Create: `server/admin/challenges.ts` — challenge CRUD for admin + public list

- [ ] **Step 1: Audit current config.ts usage in configurator**

```bash
rg "propFirms|AccountSize|from.*config" app/[locale]/dashboard/components/accounts/account-configurator.tsx -n | head -30
```

- [ ] **Step 2: Replace config lookup with DB lookup**

Current: `propFirms[firmKey].accountSizes[sizeKey]`
New: `listPropFirmsWithSizes()` → `PropFirmWithSizes.accountSizes[sizeKey]`

- [ ] **Step 3: Keep config.ts as fallback for missing DB firms**

```ts
// If DB lookup returns null, fall back to config.ts
const firm = dbFirm ?? propFirms[firmKey]
```

- [ ] **Step 4: Verify**

```bash
npm run typecheck
npm run lint -- app/[locale]/dashboard/components/accounts/account-configurator.tsx
```

### Task 5.2: Account Status Sync Across Pages

**Files:**
- Audit: All pages showing Payout status
- Modify: `app/[locale]/dashboard/components/accounts/*.tsx` — use typed PayoutStatus
- Modify: `app/[locale]/(landing)/deals/components/deals-firm-card.tsx` — show account status

- [ ] **Step 1: Audit Payout status display**

```bash
rg "PENDING|PAID|REFUSED|VALIDATED" --type tsx -n | grep -v "test\|spec\|mock" | head -20
```

- [ ] **Step 2: Create shared status badge component**

```tsx
// components/ui/v2/status-badge.tsx
export function PayoutStatusBadge({ status }: { status: PayoutStatus }) {
  const config = {
    PENDING: { label: 'Pending', className: 'text-yellow-500' },
    PAID: { label: 'Paid', className: 'text-green-500' },
    VALIDATED: { label: 'Validated', className: 'text-green-600' },
    REFUSED: { label: 'Refused', className: 'text-red-500' },
  }
  return <BadgeV2 className={config[status].className}>{config[status].label}</BadgeV2>
}
```

- [ ] **Step 3: Verify**

```bash
npm run typecheck
npm run lint -- app/[locale]/dashboard/components/accounts/
```

---

## Chunk 6: Wave 6 — Leaderboard + Trader Profiles

**Duration estimate:** 2 subagent sessions
**Prerequisite:** Wave 5 complete
**Deliverable:** Public leaderboard with ranked traders, trader profiles with public/private toggle

### Task 6.1: Leaderboard Page

**Files:**
- Modify: `app/[locale]/(landing)/leaderboard/page.tsx` — enhance with rankings, filters
- Create: `app/[locale]/(landing)/leaderboard/components/leaderboard-table.tsx`
- Create: `server/leaderboard.ts` — leaderboard server actions

- [ ] **Step 1: Create leaderboard server action**

```ts
// server/leaderboard.ts
export async function getLeaderboardData(options: {
  timeframe?: 'allTime' | 'monthly' | 'weekly'
  category?: string
  limit?: number
}) {
  // Aggregate trader stats from Account + Trade + Payout tables
  // Rank by: totalPnl, winRate, payoutCount, consistency
  // Return: rank, username, avatar, stats, isPublic
}
```

- [ ] **Step 2: Create leaderboard table with horizontal scroll**

Competitor pattern: horizontal scroll table for dense comparison data. Columns: Rank, Trader, Total PnL, Win Rate, Payouts, Consistency, Sharpe Ratio.

- [ ] **Step 3: Verify**

```bash
npm run typecheck
npm run lint -- app/[locale]/(landing)/leaderboard/
```

### Task 6.2: Trader Profile Public/Private Toggle

**Files:**
- Modify: `app/[locale]/dashboard/trader-profile/page-client.tsx` — add public/private toggle
- Modify: `server/accounts.ts` — add `updateTraderProfileVisibility()` action
- Modify: `prisma/schema.prisma` — add `isProfilePublic` to User or Account

- [ ] **Step 1: Add visibility field**

```prisma
model User {
  isProfilePublic Boolean @default(false)
  // ...
}
```

- [ ] **Step 2: Add toggle server action**

```ts
export async function updateTraderProfileVisibility(isPublic: boolean) {
  const userId = await getDatabaseUserId()
  await prisma.user.update({ where: { id: userId }, data: { isProfilePublic: isPublic } })
  updateTag(`user-${userId}`)
}
```

- [ ] **Step 3: Add toggle UI in trader profile**

```tsx
<Label className="flex items-center gap-2 cursor-pointer">
  <Switch checked={isPublic} onCheckedChange={updateTraderProfileVisibility} />
  <span>Public Profile</span>
</Label>
```

- [ ] **Step 4: Verify**

```bash
npm run typecheck
npx vitest run tests/trader-profile-visibility.test.ts
```

---

## Chunk 7: Wave 7 — Landing Page Redesign + Animation System

**Duration estimate:** 3–4 subagent sessions
**Prerequisite:** Wave 1 complete (uses V2 tokens)
**Deliverable:** sedai.io-inspired home/landing redesign with micro-interactions and page transitions

### Task 7.1: Landing Page Sedai.io Redesign

**Files:**
- Modify: `app/[locale]/(home)/components/Hero.tsx` — redesign with sedai.io patterns
- Modify: `app/[locale]/(home)/components/Features.tsx` — redesign
- Modify: `app/[locale]/(home)/components/TrustStats.tsx` — redesign
- Modify: `app/[locale]/(home)/components/PricingSection.tsx` — redesign
- Modify: `app/[locale]/(home)/components/CTA.tsx` — redesign
- Create: `app/[locale]/(home)/components/stats-counter.tsx` — animated counters

**Sedai.io design patterns:**
- Light-weight headings: `font-weight: 300` for display, `500` for emphasis
- 160px section padding (py-40)
- Single-hue brand accent (`--v2-accent` electric blue)
- Alternating dark (#000009) / light (#FAFAFF) sections
- Pill CTAs with wide horizontal padding (px-16)
- Transparent fixed nav (h-16)
- Narrow text columns (max-width: 900px)
- Glass cards: `rgba(0,0,0,0.03) + 1px subtle border`
- Minimal animation (150-300ms transitions only)

- [ ] **Step 1: Redesign Hero**

Remove all framer-motion. Use CSS transitions only (150ms). Light-weight display heading (font-light). Single accent color CTA. Minimal decorative elements.

- [ ] **Step 2: Redesign Features section**

Grid of 3-4 feature cards. Each with icon, title, short description. Glass card styling.

- [ ] **Step 3: Add animated stat counters**

```tsx
// stats-counter.tsx
export function StatsCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      setDisplay(Math.floor(progress * value))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value, duration])

  return <span>{display.toLocaleString()}</span>
}
```

- [ ] **Step 4: Verify**

```bash
npm run typecheck
npm run lint -- app/[locale]/(home)/
npm run build  # home page must generate cleanly
```

### Task 7.2: Animation System

**Files:**
- Modify: `components/motion/motion-primitives.tsx` — consolidate all motion
- Modify: `app/globals.css` — add micro-interaction CSS utilities
- Modify: `components/motion/global-motion-effects.tsx` — clean up, keep only essential effects

**Micro-interactions to implement:**
- Button: scale(1.02) on hover, scale(0.98) on active, 150ms
- Card: translateY(-2px) + shadow-v2-glow on hover, 200ms
- Input: border-color → v2-accent on focus, ring-2, 150ms
- Badge: subtle pulse on "live" indicators
- Page transition: fade + translateY(8px), 200ms ease-out
- Coupon copy button: check icon animation on success

- [ ] **Step 1: Add CSS micro-interaction utilities**

```css
/* In globals.css @layer components */
.btn-micro {
  transition: transform 150ms var(--ease-v2), background-color 100ms;
}
.btn-micro:hover { transform: scale(1.02); }
.btn-micro:active { transform: scale(0.98); }

.card-micro {
  transition: transform 200ms var(--ease-v2), box-shadow 200ms var(--ease-v2);
}
.card-micro:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-v2-glow);
}

.input-micro {
  transition: border-color 150ms, box-shadow 150ms;
}
.input-micro:focus {
  border-color: hsl(var(--v2-accent));
  box-shadow: 0 0 0 2px hsl(var(--v2-accent) / 0.3);
}
```

- [ ] **Step 2: Consolidate motion components**

Refactor `components/motion/motion-primitives.tsx` — keep MotionPage, MotionSection, MotionStagger. Remove MotionStaggerItem if redundant.

- [ ] **Step 3: Add page transition wrapper**

```tsx
// app/[locale]/(home)/layout.tsx
import { PageTransition } from '@/components/motion/page-transition'

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>
}
```

- [ ] **Step 4: Verify**

```bash
npm run typecheck
npm run lint -- components/motion/ app/globals.css
```

---

## Chunk 8: Wave 8 — Performance + Polish

**Duration estimate:** 1–2 subagent sessions
**Prerequisite:** All other waves complete
**Deliverable:** Lazy loading, caching, optimized API calls, final polish

### Task 8.1: Lazy Loading for All New Pages

- [ ] **Step 1: Add `next/dynamic` for below-fold sections**

All sections below the fold in `/deals`, `/firm/[slug]`, and `/leaderboard` should use `next/dynamic` with skeleton fallbacks.

### Task 8.2: Caching Strategy

- [ ] **Step 1: Add `unstable_cache` to firm queries**

```ts
// server/prop-firms.ts
export const getDealsDataCached = unstable_cache(
  getDealsData,
  ['deals-data'],
  { revalidate: 3600, tags: ['prop-firms', 'catalogue'] }
)
```

### Task 8.3: Final Verification

- [ ] **Step 1: Full typecheck**

```bash
npm run typecheck
```

- [ ] **Step 2: Full lint check**

```bash
npm run lint -- --max-warnings=999999
```

- [ ] **Step 3: Production build**

```bash
npm run build
```

- [ ] **Step 4: Route budget check**

```bash
npm run check:route-budgets
```

- [ ] **Step 5: Color contract check**

```bash
npm run check:color-contract
```

---

## Verification Criteria Per Wave

### Wave 1 (Design System)
- [ ] `npm run lint -- styles/tokens.css app/globals.css tailwind.config.ts` → 0 errors
- [ ] `npm run typecheck` → passes
- [ ] `npm run build` → routes generate cleanly

### Wave 2 (Data Integrity)
- [ ] `npx prisma migrate dev --name v2_account_propfirm_fk` → applies cleanly
- [ ] `npx prisma migrate dev --name v2_payout_status_enum` → applies cleanly
- [ ] `npx prisma migrate dev --name v2_challenges` → applies cleanly
- [ ] `npm run typecheck` → passes
- [ ] `npx vitest run tests/server/accounts-prop-firm-fk.test.ts tests/server/payout-status-enum.test.ts` → all pass

### Wave 3 (Deals Consolidation)
- [ ] `/deals` renders firm grid with DB data
- [ ] `/deals-v2` → redirects to `/deals`
- [ ] `/prop-firm-deals` → redirects to `/deals`
- [ ] `npm run build` → /deals generates cleanly

### Wave 4 (Firm Detail + Admin)
- [ ] `/firm/[slug]` renders challenges, rules, reviews (paginated), coupons
- [ ] `/admin/propfirms` renders CRUD list
- [ ] `/admin/reviews` renders moderation queue
- [ ] Review edit/delete only visible to own review author
- [ ] `npm run typecheck` → passes

### Wave 5 (Account Configurator → DB)
- [ ] Account configurator fetches from DB (not only config.ts)
- [ ] Payout status uses typed `PayoutStatus` enum throughout
- [ ] `npm run typecheck` → passes

### Wave 6 (Leaderboard + Profiles)
- [ ] `/leaderboard` renders ranked table with filters
- [ ] Trader profile has public/private toggle
- [ ] `npm run build` → leaderboard generates cleanly

### Wave 7 (Landing Redesign + Animation)
- [ ] Home page uses sedai.io patterns (light-weight headings, 160px padding, glass cards)
- [ ] Micro-interactions work (hover, active, focus states)
- [ ] Page transitions smooth (fade + slide, 150-200ms)
- [ ] `npm run typecheck` → passes

### Wave 8 (Performance + Polish)
- [ ] `npm run typecheck` → passes
- [ ] `npm run lint -- --max-warnings=999999` → 0 errors
- [ ] `npm run build` → passes
- [ ] `npm run check:route-budgets` → passes

---

## Risk Areas & Mitigation

| Risk | Severity | Mitigation |
|------|----------|------------|
| Wave 2 migration breaks existing `Account.propfirm` string values | CRITICAL | Backfill migration sets `propfirmId` from string match; keep `propfirm` string as denormalized display name |
| Wave 2 enum migration loses data if values don't match | CRITICAL | CHECK constraint in migration validates values before cast |
| Consolidating 3 deals pages loses existing SEO URLs | HIGH | Add 301 redirects from old URLs to `/deals` |
| Account configurator breaking during config→DB migration | HIGH | Keep config.ts as fallback; gradual migration |
| V2 token changes breaking existing dashboard | MEDIUM | V2 tokens are additive; existing dashboard uses V1 tokens (to be deprecated) |
| Animation refactor introduces regressions in existing motion | MEDIUM | CSS-only animations (no framer-motion) for new pages; existing pages unchanged |
| Admin CRUD pages bypassing existing auth guards | HIGH | All admin actions use `assertAdminAccess()` from day 1 |

---

## Notes for Agents

- **Do NOT touch `context/data-provider.tsx`** unless explicitly listed — it's 2070+ lines and fragile.
- **Do NOT touch `server/trades.ts`, `server/shared.ts`** unless fixing PayoutStatus references.
- **Do NOT remove existing pages** — add 301 redirects instead. Search engines and bookmarks must keep working.
- **Use V2 tokens everywhere in new files**: `--v2-*` CSS vars, `v2-` Tailwind classes, `CardV2`/`ButtonV2`/`BadgeV2` components.
- **Auth pattern**: `import { getDatabaseUserId } from "@/server/auth"` for server actions; `import { useSession } from "next-auth/react"` for client components.
- **Icon imports**: `import { DashboardIcon } from "@/components/icons/svg-icons"` — use SVG icons for new V2 pages, not Lucide.
- **Migration order**: Always run `npx prisma migrate dev` and `npx prisma generate` after schema changes before running typecheck.
- **Backward compat**: Account.propfirm string is kept as `propfirm` field (denormalized for display) alongside new FK `propfirmId`.
- **Config.ts**: After Wave 5, config.ts becomes read-only fallback. New firms are added via admin CRUD.
