# Three-Pillar Completion, Repair & Hardening Sweep — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair every concrete defect surfaced by the end-to-end audit of the Dashboard/Trades, Teams, and Admin/Email/Cron pillars, plus cross-cutting MUDI and env hygiene — without touching trading math/Profit Factor calculations.

**Architecture:** Root-cause fixes only (per systematic-debugging). Each task is scoped to one defect with exact files/lines. MUDI/CRITICAL fixes land first, then HIGH, then MEDIUM/LOW. All fixes preserve Multi-User Data Isolation (queries stay scoped by authenticated session userId) and route credentials through `lib/env.ts` / `process.env` / existing `getSiteUrl()` helpers — no hardcoded client endpoints, API base URLs, or keys.

**Tech Stack:** Next.js 16 App Router, TypeScript 5.9, Prisma 7.7 (PostgreSQL/Supabase), Supabase Auth, Resend + React Email, Zustand, TanStack Query/Table.

**Critical constraints (project rules):**
1. **Zero Data Leakage** — every user-scoped Prisma query must be scoped by the authenticated `userId`.
2. **Environment-bound config** — no hardcoded client endpoints, API base URLs, or third-party keys. Use `lib/env.ts` / `process.env` / existing `getSiteUrl()`.
3. **Preserve trading logic** — do NOT touch math formulas, Profit Factor parameters, or core analytical calculations.

**Baseline:** `node_modules/.bin/tsc --noEmit -p tsconfig.json` → **exit 0** (clean). All fixes must keep it green.

---

## Defect inventory (30 total)

**CRITICAL (4):** MUDI in `getJournalTradesAction`; weekly recap `to`/`unsubscribeUrl` email mismatch; `replyTo`→`reply_to` Resend field-name bug; `MissingYouEmail` branch has dead unsubscribe link + no List-Unsubscribe header.

**HIGH (8):** Group-trades uses wrong action; import optimistic-merge clobbered by dev IndexedDB cache; bulk-edit offset keys pollute trade objects; black-friday template locale stuck on FR; team-invite joinUrl hardcoded prod URL; compute-trade-data `closeDate` null crashes `format()`; compute-trade-data Databento 1e9 scaling; weekly-recap subject mismatch admin-vs-cron.

**MEDIUM (11):** Rithmic side capitalization; FTMO commissionOnly/swap ghost fields; group/ungroup cache scope; team invite TeamManager-only authz; analytics route dual user-id resolution; team-invitation role never set; privacy-toggle client-only; newsletter firstName param unused; investing cron regex fragility; cron internal fan-out over public URL; timingSafeEqual unequal-length.

**LOW (7):** trade-tag dead contrast helper; editable-instrument-cell empty catch; acceptInvitation latent userId trust; updateMemberRole allows removing other admins; invite re-emails on upsert of ACCEPTED; joinTeam dead UX; weekly-recap AI single-week hallucination; ENV hardcodes (Tradovate live URL, prod origin literals, from-address defaults, Databento URL dup); .env.example gaps; lib/env.ts validates minority of vars.

Tasks below group related defects when they share a file and the fix is identical in shape.

---

## Task 1: [CRITICAL] Fix MUDI in `getJournalTradesAction`

**Files:**
- Modify: `server/journal.ts:452-461`

**Root cause:** `getJournalTradesAction(inputUserId?, ...)` uses the client-supplied `inputUserId` directly as `where.userId` with no server-side session verification. The client caller `statistics-client.tsx:97` passes a Zustand-store value (`useUserStore(s => s.supabaseUser?.id ?? s.user?.id)`), which is forgeable. Any authenticated user can read every other user's trades + journal entries (notes, emotions, tags, screenshots).

- [ ] **Step 1: Write a failing unit test** in `tests/server/journal-mudi.test.ts`

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    trade: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    },
  },
}))

// getDatabaseUserId must be the source of truth; mock it to return the SESSION user
vi.mock('@/server/auth', () => ({
  getDatabaseUserId: vi.fn(),
}))

import { getJournalTradesAction } from '@/server/journal'
import { getDatabaseUserId } from '@/server/auth'

describe('getJournalTradesAction MUDI', () => {
  beforeEach(() => vi.clearAllMocks())

  it('ignores client-supplied userId and uses session user', async () => {
    ;(getDatabaseUserId as any).mockResolvedValue('SESSION_USER')
    // Attacker passes VICTIM_USER as inputUserId
    await getJournalTradesAction('VICTIM_USER', 1, 30)
    const { prisma } = await import('@/lib/prisma')
    const where = (prisma.trade.findMany as any).mock.calls[0][0].where
    expect(where.userId).toBe('SESSION_USER')   // NOT 'VICTIM_USER'
    expect(where.userId).not.toBe('VICTIM_USER')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/server/journal-mudi.test.ts`
Expected: FAIL with `Expected: "SESSION_USER" / Received: "VICTIM_USER"`.

- [ ] **Step 3: Apply the fix** — remove the `inputUserId` parameter; always derive from session.

```ts
export async function getJournalTradesAction(
  page: number = 1,
  pageSize: number = 30,
  filters?: JournalTradesFilters,
): Promise<JournalTradesResult> {
  const userId = await getDatabaseUserId().catch(() => null)
  if (!userId) {
    return { entries: [], total: 0, page, pageSize, totalPages: 0 }
  }
  // ...rest unchanged
```

Delete the `inputUserId?: string` parameter entirely. Keep all other logic.

- [ ] **Step 4: Update the two callers**
  - `app/[locale]/dashboard/analytics/statistics/components/statistics-client.tsx:97` — change `getJournalTradesAction(uid, currentPage, pageSize)` → `getJournalTradesAction(currentPage, pageSize)`. Remove the now-unused `uid`/`userId` reads at lines 79,87,95 if nothing else uses them (verify with Grep first — `userId` may be used elsewhere in the effect; if so, keep the read, just drop the `uid` alias and the arg).
  - `app/[locale]/dashboard/notes/lib/use-journal.ts:99` — already passes `undefined` first; update call from `getJournalTradesAction(undefined, page, pageSize, filters)` → `getJournalTradesAction(page, pageSize, filters)`.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/server/journal-mudi.test.ts`
Expected: PASS.

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: exit 0. (Fix any call sites that still pass the old signature.)

- [ ] **Step 7: Commit**

```bash
git add server/journal.ts app/[locale]/dashboard/analytics/statistics/components/statistics-client.tsx app/[locale]/dashboard/notes/lib/use-journal.ts tests/server/journal-mudi.test.ts
git commit -m "fix(mudi): getJournalTradesAction trusted client-supplied userId — cross-user trade/journal leak"
```

---

## Task 2: [CRITICAL] Fix weekly-recap email routing (`to`, `unsubscribeUrl`, `replyTo`, MissingYou branch)

**Files:**
- Modify: `app/api/email/weekly-summary/[userid]/route.ts` (both branches, lines ~57-110)

**Root cause:** Three sub-bugs in one file: (a) recap branch sends to `user.email` while `unsubscribeUrl` is built from `user.email` but the subscription is keyed by `newsletter.email` — case/whitespace divergence breaks unsubscribe tokens; (b) Resend field is `reply_to`, not `replyTo` — both branches use the wrong name, so reply-to is silently dropped; (c) MissingYou branch renders `MissingYouEmail` without `unsubscribeUrl`/`siteUrl` and omits the `headers` (List-Unsubscribe) — non-compliant one-click unsubscribe + dead `#` link.

- [ ] **Step 1: Read the current file** to confirm exact line numbers.

Run: read `app/api/email/weekly-summary/[userid]/route.ts` (whole file).

- [ ] **Step 2: Fix the MissingYou branch** (no-trades path) — pass `unsubscribeUrl` + `siteUrl` to `MissingYouEmail`, add `headers` with List-Unsubscribe, use `reply_to`:

```ts
const subscriberEmail = newsletter.email
const unsubscribeUrl = buildUnsubscribeUrl(subscriberEmail, req)
const siteUrl = getSiteUrl()
const missingYouEmailHtml = await render(
  MissingYouEmail({
    firstName: newsletter.firstName || 'trader',
    email: subscriberEmail,
    language: user.language,
    unsubscribeUrl,
    siteUrl,
  })
)
return Response.json({
  emailData: {
    from: 'Qunt Edge <updates@eu.updates.qunt-edge.vercel.app>',
    to: [subscriberEmail],
    subject: user.language === 'fr' ? "Vous nous manquez 📊" : "We miss you 📊",
    html: missingYouEmailHtml,
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
    reply_to: process.env.CONTACT_REPLY_TO ?? 'team@qunt-edge.com',
  },
})
```

- [ ] **Step 3: Fix the recap branch** — use `subscriberEmail` (the newsletter.email) consistently for `to`, `unsubscribeUrl`, and the `email` prop; use `reply_to`:

```ts
const subscriberEmail = newsletter.email
const unsubscribeUrl = buildUnsubscribeUrl(subscriberEmail, req)
const siteUrl = getSiteUrl()
const weeklyStatsEmailHtml = await render(
  TraderStatsEmail({
    firstName: newsletter.firstName || user.firstName || 'trader',
    email: subscriberEmail,
    firstName: ...,
    dailyPnL: content.dailyPnL,
    winLossStats: content.winLossStats,
    resultAnalysisIntro: analysis.resultAnalysisIntro,
    tipsForNextWeek: analysis.tipsForNextWeek,
    language: user.language,
    unsubscribeUrl,
    siteUrl,
  })
)
return Response.json({
  emailData: {
    from: 'Qunt Edge <updates@eu.updates.qunt-edge.vercel.app>',
    to: [subscriberEmail],
    subject: user.language === 'fr' ? 'Vos statistiques de trading de la semaine 📈' : 'Your trading statistics for the week 📈',
    html: weeklyStatsEmailHtml,
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
    reply_to: process.env.CONTACT_REPLY_TO ?? 'team@qunt-edge.com',
  },
})
```

(When matching the existing prop list, preserve any existing props not shown above — read the file first.)

- [ ] **Step 4: Ensure `getSiteUrl` is imported** at the top of the file (add `import { getSiteUrl } from '@/lib/site-url'` if missing).

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add app/api/email/weekly-summary/[userid]/route.ts
git commit -m "fix(email): weekly recap sent to user.email with broken unsubscribe; replyTo->reply_to; MissingYou branch missing List-Unsubscribe"
```

---

## Task 3: [HIGH] Group/Ungroup should use `groupTradesAction`/`ungroupTradesAction`, not `updateTrades` with temp id

**Files:**
- Modify: `app/[locale]/dashboard/components/tables/trade-table-review.tsx:379-415` (handleGroupTrades + handleUngroupTrades)
- Reference (no change): `server/trades.ts:973-1015` (groupTradesAction/ungroupTradesAction), `context/data-provider.tsx:2076-2118` (the orphaned groupTrades/ungroupTrades context actions)

**Root cause:** The Group Trades button generates `temp_${Date.now()}_${rand}` and calls `updateTrades(ids, { groupId: tempGroupId })`, which persists a synthetic non-id groupId. The intended `groupTradesAction` (sets `groupId = tradeIds[0]`, scoped, ownership-checked) is never called.

- [ ] **Step 1: Read the data-provider group/ungroup actions** at `context/data-provider.tsx:2076-2118` to confirm the context exposes `groupTrades` and `ungroupTrades`.

- [ ] **Step 2: Wire the table to the context actions.** In `trade-table-review.tsx`, replace the body of `handleGroupTrades` and `handleUngroupTrades`:

```ts
const { groupTrades, ungroupTrades } = useData()   // or however the component already reads context

const handleGroupTrades = async () => {
  if (selectedTrades.length < 2) return
  try {
    await groupTrades(selectedTrades)         // -> groupTradesAction (groupId = tradeIds[0])
    table.resetRowSelection()
    setSelectedTrades([])
  } catch {
    toast.error(t('trade-table.deleteError'), { description: t('trade-table.deleteErrorDescription') })
  }
}

const handleUngroupTrades = async () => {
  if (selectedTrades.length === 0) return
  try {
    await ungroupTrades(selectedTrades)       // -> ungroupTradesAction (groupId = '')
    table.resetRowSelection()
    setSelectedTrades([])
  } catch {
    toast.error(t('trade-table.deleteError'), { description: t('trade-table.deleteErrorDescription') })
  }
}
```

(Confirm the exact context-reading pattern already used by `updateTrades`/`deleteTrades` in this file — match it.)

- [ ] **Step 3: Remove the now-dead `tempGroupId` line.**

- [ ] **Step 4: Verify context actions invalidate caches correctly.** Re-read `context/data-provider.tsx:2076-2118`. If they call `clearDashboardBrowserCache('trades', ...)`, change to `'all'` for consistency with update/delete (this closes the HIGH cache-scope defect too — see Task 8 note). If they already call `'all'`, no change.

- [ ] **Step 5: Typecheck + build smoke**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add app/[locale]/dashboard/components/tables/trade-table-review.tsx context/data-provider.tsx
git commit -m "fix(trades): group/ungroup now uses groupTradesAction (groupId=first trade id) instead of synthetic temp id"
```

---

## Task 4: [HIGH] Import optimistic-merge clobbered by stale IndexedDB cache in dev

**Files:**
- Modify: `context/data-provider.tsx:1010-1058` (`refreshTradesOnly`)

**Root cause:** After `ImportButton` writes the optimistic merge into the Zustand store, it calls `refreshTradesOnly({ force: false })`. In dev, the `force:false` branch reads the pre-import IndexedDB cache (which does NOT yet contain the new trades), calls `setTrades(staleCache)`, and returns early — wiping the just-merged trades. The cache write only happens after a full fetch, which is skipped.

- [ ] **Step 1: Read the current `refreshTradesOnly`** at `context/data-provider.tsx:1010-1058`.

- [ ] **Step 2: Make dev cache reads skip when the caller knows state is already current.** The cleanest minimal fix: in `ImportButton.handleSave`, call `refreshTradesOnly({ force: true })` instead of `{ force: false }` after the optimistic merge — a forced refresh re-fetches from server and writes a fresh cache, so the just-imported trades survive.

Edit `app/[locale]/dashboard/components/import/import-button.tsx:196`:
```ts
await refreshTradesOnly({ force: true })
```

- [ ] **Step 3: Harden `refreshTradesOnly` itself** so a dev `force:false` cache hit still triggers a background re-fetch (defensive — prevents the same class of bug for other callers). In `context/data-provider.tsx`, change the dev-cache-hit early-return path to kick off a non-blocking background refresh instead of returning:

```ts
if (process.env.NODE_ENV === 'development' && !force) {
  const cachedTrades = await getTradesCache(userId)
  if (cachedTrades && Array.isArray(cachedTrades) && cachedTrades.length > 0) {
    setTrades(sanitizeTradesForState(cachedTrades))
    // Background refresh so cache can never drift from server; do not await
    void (async () => {
      try {
        const fresh = await fetchAllTrades(userId)
        setTrades(fresh)
        await setTradesCache(userId, fresh)
      } catch (e) {
        logger.error({ e }, 'dev background trade refresh failed')
      }
    })()
    return
  }
}
```

(Confirm `fetchAllTrades`, `setTradesCache`, `sanitizeTradesForState`, `logger` are all already imported/available in this file — they are used elsewhere in it.)

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/dashboard/components/import/import-button.tsx context/data-provider.tsx
git commit -m "fix(import): dev cache clobbered optimistic merge; force refresh after import + background dev refresh"
```

---

## Task 5: [HIGH] Bulk-edit offset keys pollute trade objects; client never reflects new values

**Files:**
- Modify: `context/data-provider.tsx:2046-2066` (updateTrades optimistic apply)
- Reference: `server/trades.ts:712-718` (the offset keys the server consumes)

**Root cause:** `updateTrades` spreads the raw `update` object (which may contain `entryDateOffset`/`closeDateOffset`/`instrumentTrim`/`instrumentPrefix`/`instrumentSuffix`) into each affected trade in local state — ghost fields — and does NOT recompute the actual `entryDate`/`instrument` client-side. UI shows stale values until a manual refresh.

- [ ] **Step 1: Read the current `updateTrades`** at `context/data-provider.tsx:2046-2066`.

- [ ] **Step 2: Strip server-only offset keys from the optimistic apply and trigger a re-fetch after server round-trip.** The minimal correct fix: do not spread offset keys into trade objects; after the server confirms, force a refresh so the new server-computed values appear.

```ts
const SERVER_ONLY_UPDATE_KEYS = new Set([
  'entryDateOffset', 'closeDateOffset',
  'instrumentTrim', 'instrumentPrefix', 'instrumentSuffix',
])

const updateTrades = useCallback(async (tradeIds: string[], update: Partial<...>) => {
  const optimisticUpdate = Object.fromEntries(
    Object.entries(update).filter(([k]) => !SERVER_ONLY_UPDATE_KEYS.has(k))
  )
  setTrades(trades.map(t => tradeIds.includes(t.id) ? { ...t, ...optimisticUpdate } : t))
  const updatedCount = await updateTradesAction(tradeIds, update)

  clearDashboardBrowserCache('all', 'updateTrades')

  if (updatedCount === 0 || updatedCount !== tradeIds.length) {
    throw new Error(/* existing message */)
  }

  // If the update contained server-only offset/instrument transforms, re-fetch so
  // client state matches server-computed values.
  const hadServerOnlyKeys = Object.keys(update).some(k => SERVER_ONLY_UPDATE_KEYS.has(k))
  if (hadServerOnlyKeys) {
    await refreshTradesOnly({ force: true })
  }
}, [trades, /* deps */])
```

(Preserve the existing catch/rollback behavior. Match the existing closure/deps style.)

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add context/data-provider.tsx
git commit -m "fix(trades): bulk-edit offset keys polluted trade objects; strip server-only keys + force refresh"
```

---

## Task 6: [HIGH] Black-friday template locale stuck on FR when sent via admin tool

**Files:**
- Modify: `app/[locale]/admin/actions/send-email.ts:72-75` (getDefaultTemplateProps `black-friday` case), `:340-365` (mergedProps in sendEmailsToUsersInternal)

**Root cause:** `BlackFridayEmail` reads prop `locale` (not `language`). The generic sender only injects `language`. With default props, `locale: "fr"` is sent to every recipient regardless of their `user.language`.

- [ ] **Step 1: Read both locations** in `send-email.ts`.

- [ ] **Step 2: In `sendEmailsToUsersInternal`, derive `locale` from each recipient's `language`** so the per-recipient merge overrides the default. Inside the per-user `emailBatch.map`, after computing `mergedProps`, add:

```ts
const mergedProps: TemplateProps = {
  ...customProps,
  firstName: user.firstName,
  email: user.email,
  language: user.language,
  // Black-friday template reads `locale`; map from the user's language
  locale: (customProps?.locale ?? (user.language === 'fr' ? 'fr' : 'en')) as string | undefined,
  userEmail: user.email,
  userFirstName: user.firstName,
  unsubscribeUrl,
}
```

- [ ] **Step 3: Add `locale` to `getRequiredTemplateProps('black-friday')`** so the admin UI surfaces it:

```ts
case 'black-friday':
  return ['firstName', 'locale']  // (or just keep firstName; locale is auto-derived)
```

(Keep it minimal — the auto-derive in Step 2 is the real fix; this is for UI visibility.)

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/admin/actions/send-email.ts
git commit -m "fix(email): black-friday template sent FR copy to EN users — derive locale from recipient language"
```

---

## Task 7: [HIGH] Team-invitation default `joinUrl` hardcoded to prod URL

**Files:**
- Modify: `app/[locale]/admin/actions/send-email.ts:118-122` (getDefaultTemplateProps `team-invitation` case)

**Root cause:** `getDefaultTemplateProps('team-invitation')` returns `joinUrl: "https://qunt-edge.vercel.app"`, a hardcoded production URL that's sent to recipients regardless of the deployment's actual origin.

- [ ] **Step 1: Confirm `getSiteUrl` import** at top of `send-email.ts`.

- [ ] **Step 2: Replace the hardcoded literal** with `getSiteUrl()`:

```ts
case 'team-invitation':
  return {
    teamName: 'Your Team',
    inviterName: 'Trader',
    inviterEmail: 'trader@example.com',
    joinUrl: `${getSiteUrl()}/teams/join`,
  }
```

(Read the existing case first to preserve its other fields exactly.)

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/admin/actions/send-email.ts
git commit -m "fix(email): team-invitation joinUrl hardcoded prod URL -> getSiteUrl()"
```

---

## Task 8: [HIGH] compute-trade-data cron: `closeDate` null crashes `format()` + 1e9 scaling assumption

**Files:**
- Modify: `app/api/cron/compute-trade-data/route.ts:259-260` (null guard), `:169-177` (scaling note — math NOT touched, only the field-name data shape)

**Root cause (null):** `latestDate: new Date(trade.closeDate)` — `closeDate` can be null for open positions (the recent import Zod fix allows null). `date-fns format()` throws RangeError on Invalid Date, which is caught and silently zeros MAE/MFE for the whole instrument group.

**Root cause (scaling):** `bar.open / 1000000000` hardcoded for all instruments. Databento GLBX.MDP3 price scale is per-instrument. *(Math formulas/MAE-MFE computation are NOT touched — only the input price unscaling, which is a data-shape concern, not analytics math.)*

- [ ] **Step 1: Read the file** at lines 60-260 and 380-440 to understand the grouping + the Databento response shape.

- [ ] **Step 2: Null-guard `closeDate`.** Where `earliestDate`/`latestDate` are built:

```ts
const earliestDate = new Date(trade.entryDate)
const latestDate = trade.closeDate ? new Date(trade.closeDate) : earliestDate
```

And anywhere `endDateStr`/`format(latestDate, ...)` is used, ensure it falls back to `earliestDate`. Also: in the trade-grouping loop, skip open positions from MAE/MFE computation (they have no realized exit) rather than poisoning the group:

```ts
// Skip open positions — no realized exit price/exit time for MAE/MFE
if (!trade.closeDate) continue
```

Place this `continue` at the top of the loop that builds per-trade records for analytics (after the `earliestDate`/`latestDate` are computed from the remaining trades).

- [ ] **Step 3: For the 1e9 scaling — fetch the instrument's price scale from Databento's `getInstrument`/`definition` endpoint OR document the limitation.** Because the project rule forbids touching math, and Databento's REST `timeseries.get_range` can return prices already scaled to decimals when `pricing` is unset... verify by reading the current fetch payload. If the current code requests raw fixed-point integers, add a code comment documenting the per-symbol scale limitation and skip non-equity-index symbols that aren't in the symbol map (rather than producing garbage). Concretely:

```ts
// Databento GLBX.MDP3 returns fixed-point integers scaled per-instrument.
// The 1e9 divisor below is correct for ES/NQ/YM equity-index futures where
// price_increment = 1e-9. For FX (6E), bonds (ZN/ZB), DX, and micros the
// scale differs — skip them to avoid garbage MAE/MFE until a per-symbol
// scale lookup is added. (Analytics math intentionally unchanged.)
const SUPPORTED_SCALING_SYMBOLS = new Set(['ES', 'NQ', 'YM', 'RTY', 'MES', 'MNQ', 'MYM', 'M2K'])
// ...in the per-instrument loop:
if (!SUPPORTED_SCALING_SYMBOLS.has(rootSymbol)) continue
```

(Read the file first; the exact symbol-extraction step varies. This is a conservative, safe-by-default change — it never produces garbage analytics, only skips instruments we can't scale correctly.)

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add app/api/cron/compute-trade-data/route.ts
git commit -m "fix(cron): compute-trade-data crashed on null closeDate; skip unsupported-scale symbols for MAE/MFE"
```

---

## Task 9: [HIGH] Weekly-recap subject mismatch (admin vs cron)

**Files:**
- Modify: `app/[locale]/admin/actions/send-email.ts:402-405` (getDefaultSubject `weekly-recap`)

**Root cause:** Admin send-email default subject ("Your weekly trading statistics - Qunt Edge") differs from the cron-per-user subject ("Your trading statistics for the week 📈"). Two sources of truth.

- [ ] **Step 1: Read `getDefaultSubject`** in `send-email.ts:392-410`.

- [ ] **Step 2: Align the admin default with the cron subject** (the cron's emoji subject is the established production one):

```ts
'weekly-recap': {
  en: 'Your trading statistics for the week 📈',
  fr: 'Vos statistiques de trading de la semaine 📈',
},
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/admin/actions/send-email.ts
git commit -m "fix(email): align weekly-recap subject between admin send and cron"
```

---

## Task 10: [MEDIUM] Rithmic side capitalization inconsistency

**Files:**
- Modify: `app/[locale]/dashboard/components/import/rithmic/rithmic-performance-processor.tsx:76-78`

**Root cause:** Sets `item.side = 'Long' / 'Short'` (capitalized); every other importer uses lowercase `'long'/'short'`, which is what downstream badge/styling consumers compare against.

- [ ] **Step 1: Read the file** at lines 74-84.

- [ ] **Step 2: Lowercase the values:**

```ts
if (item.side === 'B' || item.side === 'S') {
  item.side = item.side === 'B' ? 'long' : 'short'
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/dashboard/components/import/rithmic/rithmic-performance-processor.tsx
git commit -m "fix(import): Rithmic side normalized to lowercase long/short for downstream consistency"
```

---

## Task 11: [MEDIUM] Team invite API: authorize on TeamMember.role=ADMIN too, not just TeamManager

**Files:**
- Modify: `app/api/team/invite/route.ts:72-93`

**Root cause:** The route checks owner OR admin-TeamManager, but `inviteMember` (server/teams.ts:216-225) also authorizes TeamMember ADMINs. A TeamMember ADMIN (e.g. team creator) who isn't in the TeamManager table gets 403.

- [ ] **Step 1: Read the route** at lines 60-100 and `server/teams.ts:216-225` (inviteMember's authz) to mirror its logic.

- [ ] **Step 2: Expand the membership `include` and the authz check** to also match an active TeamMember with role ADMIN:

```ts
const team = await prisma.team.findUnique({
  where: { id: teamId },
  include: {
    managers: { where: { managerId: inviter.id, access: 'admin' }, select: { id: true } },
    members: { where: { userId: inviter.id, role: 'ADMIN' }, select: { id: true } },
  },
})
if (!team) return apiError('NOT_FOUND', ...)
const isOwner = team.userId === inviter.id
const isAdminManager = team.managers.length > 0
const isAdminMember = team.members.length > 0
if (!isOwner && !isAdminManager && !isAdminMember) {
  return apiError('FORBIDDEN', 'Only team admins can send invitations')
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add app/api/team/invite/route.ts
git commit -m "fix(teams): invite route now authorizes TeamMember ADMIN (not just TeamManager)"
```

---

## Task 12: [MEDIUM] TeamInvitation role never set via HTTP/UI invite paths

**Files:**
- Modify: `app/api/team/invite/route.ts:14-17` (inviteSchema), `:139-145` (invitation create)
- Modify: `app/[locale]/dashboard/settings/actions.ts:799-805` (sendTeamInvitation create)
- Reference: `server/teams.ts:188` (inviteMember accepts `role`)

**Root cause:** `inviteMember` accepts a `role` param, but neither the HTTP invite route nor the settings action passes it, so every accepted invite defaults to TRADER.

- [ ] **Step 1: Read all three locations.**

- [ ] **Step 2: Add `role` to the HTTP invite schema and forward it:**

```ts
// inviteSchema
const inviteSchema = z.object({
  teamId: z.string(),
  email: z.string().email(),
  role: z.enum(['ADMIN', 'TRADER', 'ANALYST', 'VIEWER']).optional(),
})
// ... in the handler where invitation is created:
await inviteMember({ teamId, email, role: body.role, inviterId: inviter.id })
```

(Adjust to match the actual `inviteMember` signature read in Step 1.)

- [ ] **Step 3: Mirror in `sendTeamInvitation`** at `settings/actions.ts:799-805` — accept and forward an optional `role` argument from the action's input.

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add app/api/team/invite/route.ts app/[locale]/dashboard/settings/actions.ts
git commit -m "fix(teams): invitation role now propagated through HTTP + settings invite paths"
```

---

## Task 13: [MEDIUM] Group/ungroup context actions cache scope (defensive)

**Files:**
- Modify: `context/data-provider.tsx:2089, 2111`

**Root cause:** `groupTrades`/`ungroupTrades` call `clearDashboardBrowserCache('trades', ...)` while update/delete use `'all'` — inconsistent invalidation contract (stale METRICS/USER_DATA if group affects aggregates).

- [ ] **Step 1: Read lines 2076-2118.**

- [ ] **Step 2: Change both to `'all'`:**

```ts
clearDashboardBrowserCache('all', 'groupTrades')
// ...
clearDashboardBrowserCache('all', 'ungroupTrades')
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: exit 0.

- [ ] **Step 4: Commit** (may be folded into Task 3's commit if done together — that's fine)

```bash
git add context/data-provider.tsx
git commit -m "fix(cache): group/ungroup now invalidate all dashboard caches, matching update/delete"
```

---

## Task 14: [MEDIUM] Analytics route dual user-id resolution; pass resolved id to getTeamAnalytics

**Files:**
- Modify: `app/api/teams/[id]/analytics/route.ts:46-54`

**Root cause:** Route resolves `teamUserId` for the access check but calls `getTeamAnalytics(teamId, period)` without it — `getTeamAnalytics` then re-resolves via `getDatabaseUserId()` (which has a 5-min cache). If the two resolvers ever diverge, gate and loader disagree.

- [ ] **Step 1: Read the route and `getTeamAnalytics` signature** in `server/teams.ts:422+`.

- [ ] **Step 2: Pass `teamUserId` through:**

```ts
const analytics = await getTeamAnalytics(teamId, period, teamUserId)
```

(Confirm `getTeamAnalytics` already accepts an optional `requestingUserId` — the audit says it does.)

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add app/api/teams/[id]/analytics/route.ts
git commit -m "fix(teams): analytics route passes resolved userId to getTeamAnalytics (single resolver)"
```

---

## Task 15: [MEDIUM] Privacy toggle is client-only; not enforced server-side

**Files:**
- Investigate + decide. This is a feature gap, not a one-line fix.

**Root cause:** `privacy-toggle.tsx` flips local React state only — not persisted, not consulted by any query.

**Decision:** This is a product decision (add a `User.isProfilePublic` field + enforce in team/trader queries). It's out of scope for a "repair" sweep and touches the schema (migration). **Defer** — note in the plan completion report as a follow-up. Do NOT implement in this pass (would require brainstorming + migration).

- [ ] **Step 1: Document as a deferred follow-up** in the final completion summary. No code change.

---

## Task 16: [MEDIUM] Newsletter `sendNewsletter` ignores composed `firstName` param

**Files:**
- Modify: `app/[locale]/admin/actions/newsletter.ts:99-105` (destructure), `:149-166` (per-recipient)

**Root cause:** `SendNewsletterParams.firstName` is declared required but never destructured/used; per-recipient `newsletter.firstName` is used instead. Dead required param = misleading API contract.

- [ ] **Step 1: Read the file** at 1-170.

- [ ] **Step 2: Make `firstName` optional in the interface** (since the per-subscriber value is the correct source) and stop requiring it from the editor:

```ts
export interface SendNewsletterParams {
  subject: string
  youtubeId: string
  introMessage: string
  features: string[]
  firstName?: string   // unused — per-subscriber firstName is used; kept for API compat
}
```

Add a `// NOTE: firstName is intentionally unused; the per-subscriber stored value is authoritative.` comment. (Do not change sending behavior.)

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/admin/actions/newsletter.ts
git commit -m "fix(newsletter): mark unused firstName param optional; document per-subscriber source"
```

---

## Task 17: [MEDIUM] Investing cron `theDay` regex fragile + no event-count alerting

**Files:**
- Modify: `app/api/cron/investing/route.ts:73-104` (regex), `:280-310` (no-events path)

**Root cause:** Regex `/<td[^>]*class="theDay"[^>]*>([^<]+)<\/td>/` captures only flat text; if investing.com wraps the date in nested spans, `dateMatch` is null and all timed events are silently skipped. No alert when zero events are returned.

- [ ] **Step 1: Read the file** at 60-110 and 280-320.

- [ ] **Step 2: Make the date parser tolerant of nested markup** by extracting the cell's full inner HTML and stripping tags:

```ts
if (row.includes('theDay')) {
  const cellMatch = row.match(/<td[^>]*class="theDay"[^>]*>([\s\S]*?)<\/td>/)
  if (cellMatch) {
    const inner = cellMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    const parts = inner.split(' ')
    const [, date, month, year] = parts
    // ...existing monthMap lookup + Date.UTC
  }
}
```

- [ ] **Step 3: Add a warning log when zero events are parsed** so silent scraping failures surface:

```ts
if (events.length === 0) {
  logger.warn('[cron/investing] parsed 0 events — upstream HTML structure may have changed', { lang })
}
```

(Use the existing `logger` import; add if missing.)

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add app/api/cron/investing/route.ts
git commit -m "fix(cron): investing parser tolerates nested date markup; warn on zero events"
```

---

## Task 18: [MEDIUM] Cron internal fan-out goes over public URL (N+1 serverless invocations)

**Files:**
- Refactor: `app/api/cron/route.ts:120-184`

**Root cause:** The weekly `/api/cron` fan-out does `fetch(getSiteUrl('/api/email/weekly-summary/<userid>'))` per user — N separate serverless invocations over the public origin. The blueprint mentions "Redis message queues" but none exist.

**Decision:** This is an architectural change (introduce a queue or refactor to in-process batching). It's higher-risk than a bug fix and the current code is *functionally correct*, just inefficient. **Defer the Redis-queue rewrite** (out of scope for a repair sweep without infra decisions); instead apply a **safe minimal optimization**: render + send in-process within the cron loop instead of HTTP-loopback. 

- [ ] **Step 1: Read `cron/route.ts` and `[userid]/route.ts`** to confirm the per-user logic can be extracted into a pure function.

- [ ] **Step 2: Extract the per-user weekly-summary building into a shared server function** (e.g. `server/email/weekly-summary.ts` exporting `buildWeeklySummaryEmailData(userId)`), and have BOTH the `/api/email/weekly-summary/[userid]` route AND `/api/cron` call it in-process. The cron then calls `resend.batch.send(batch)` directly without HTTP loopback.

(If the extraction proves too large/risky for this pass, **defer** and just document. Prefer correctness over a rushed refactor. Do NOT introduce Redis — no infra exists.)

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: exit 0.

- [ ] **Step 4: Commit** (only if Step 2 done)

```bash
git add app/api/cron/route.ts app/api/email/weekly-summary/[userid]/route.ts server/email/weekly-summary.ts
git commit -m "perf(cron): weekly fan-out builds emails in-process instead of HTTP loopback"
```

---

## Task 19: [MEDIUM] timingSafeEqual on unequal-length buffers (timing side-channel)

**Files:**
- Modify: `server/authz.ts:185-200`

**Root cause:** `timingSafeEqual(Buffer.from(candidate), Buffer.from(secret))` throws RangeError on unequal length; the try/catch converts it to AUTH_UNAUTHORIZED (correct result) but leaks timing on length mismatch.

- [ ] **Step 1: Read the helper** at 180-200.

- [ ] **Step 2: Add a length-equality guard that returns false before the safe compare:**

```ts
const candidateBuf = Buffer.from(candidate)
const secretBuf = Buffer.from(secret)
if (candidateBuf.length !== secretBuf.length) return false
return timingSafeEqual(candidateBuf, secretBuf)
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add server/authz.ts
git commit -m "fix(authz): guard timingSafeEqual length mismatch (timing side-channel)"
```

---

## Task 20: [MEDIUM] sendEmailsToUsersInternal uses single hardcoded `from` for all templates

**Files:**
- Modify: `app/[locale]/admin/actions/send-email.ts:355`

**Root cause:** All 9 templates send from `updates@eu.updates.qunt-edge.vercel.app` regardless of template type; welcome/renewal/newsletter have dedicated senders in their automated flows.

- [ ] **Step 1: Read the per-template subject/default helpers** to see if a `from` map exists.

- [ ] **Step 2: Add a per-template `from` resolver** (env-driven, with the existing default as fallback):

```ts
function getFromAddress(template: EmailTemplate): string {
  const base = 'eu.updates.qunt-edge.vercel.app'
  const env = process.env.EMAIL_FROM_ADDRESS   // optional global override
  if (env) return env
  switch (template) {
    case 'welcome': return `Qunt Edge <welcome@${base}>`
    case 'newsletter':
    case 'new-feature': return `Qunt Edge <newsletter@${base}>`
    case 'renewal-notice': return `Qunt Edge <renewals@${base}>`
    default: return `Qunt Edge <updates@${base}>`
  }
}
// ...in the batch:
from: getFromAddress(template),
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/admin/actions/send-email.ts
git commit -m "fix(email): per-template from-address for admin sends (welcome/newsletter/renewal)"
```

---

## Task 21: [LOW×cluster] Small UI/server quality defects

**Files:**
- `app/[locale]/dashboard/components/tables/trade-tag.tsx` (dead getContrastColor, fixed foreground)
- `app/[locale]/dashboard/components/tables/editable-instrument-cell.tsx` (empty catch, stuck editor on empty)
- `app/[locale]/dashboard/components/import/ftmo/ftmo-processor.tsx` (commissionOnly/swap ghost totals)

- [ ] **Step 1: trade-tag.tsx** — wire `getContrastColor` into the tag style so light backgrounds get dark text:

```ts
const bg = metadata?.color || defaultColor
style={{ backgroundColor: bg, color: getContrastColor(bg) }}
```

- [ ] **Step 2: editable-instrument-cell.tsx** — replace empty catch with a toast + always close editor on blur; allow empty to clear:

```ts
const handleSave = async () => {
  const trimmedValue = value.trim()
  try {
    await onUpdate(tradeIds, { instrument: trimmedValue })
  } catch (e) {
    toast.error(t('trade-table.updateError'), { description: String(e?.message ?? e) })
  } finally {
    setIsEditing(false)   // always close, even on error
  }
}
```

(Remove the early-return-on-empty that traps the user; an empty instrument will fail server validation and surface a toast.)

- [ ] **Step 3: ftmo-processor.tsx** — the `commissionOnly`/`swap` ghost totals always render $0.00. Either wire them to real fields (if the FTMO CSV has a commission column, map it) or remove the misleading summary cards. Read the FTMO column mapping first; if no commission column exists, remove the two cards and the `totalCommission`/`totalSwap` reductions.

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/dashboard/components/tables/trade-tag.tsx app/[locale]/dashboard/components/tables/editable-instrument-cell.tsx app/[locale]/dashboard/components/import/ftmo/ftmo-processor.tsx
git commit -m "fix(ui): tag contrast, editable-cell error handling, FTMO ghost totals"
```

---

## Task 22: [LOW×cluster] Teams roster/invite edge cases

**Files:**
- `server/teams.ts:341-343` (updateMemberRole allows removing other admins)
- `app/api/team/invite/route.ts:127-146` (re-emails on ACCEPTED upsert)
- `app/[locale]/dashboard/settings/actions.ts:153-203` + `teams/components/team-management.tsx:257-280` (dead joinTeam UX)

- [ ] **Step 1: server/teams.ts updateMemberRole** — protect the team owner from being downgraded by anyone (including other admins):

```ts
if (member.userId === team.userId) {
  throw new Error('Cannot modify the team owner role')
}
```

Add this before any role change (read the function at 335-360 first; the existing self-downgrade guard stays).

- [ ] **Step 2: invite route upsert** — only resurrect/re-email if the existing invitation is NOT ACCEPTED:

```ts
// before the upsert, check status
if (existing && existing.status === 'ACCEPTED') {
  return apiError('ALREADY_MEMBER', 'This email has already accepted an invitation')
}
```

(Read the exact existing-invite lookup at 105-115 first.)

- [ ] **Step 3: joinTeam dead UX** — either remove the "join by Team ID" box from `team-management.tsx` or relabel it to "Enter an invitation code" with a tooltip explaining an active invite is required. Minimal: add a `disabled`/help text. (Don't delete `joinTeam` — `joinTeamByInvitation` may share code.)

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add server/teams.ts app/api/team/invite/route.ts app/[locale]/teams/components/team-management.tsx
git commit -m "fix(teams): protect owner role, don't resurrect ACCEPTED invites, clarify join UX"
```

---

## Task 23: [LOW×cluster] Weekly-recap AI single-week hallucination + welcome email dead unsubscribe link

**Files:**
- `app/api/email/weekly-summary/[userid]/actions/analysis.ts:55-74`
- `app/api/email/welcome/route.ts:102, 117`

- [ ] **Step 1: analysis.ts** — guard the prompt when only one week of data exists:

```ts
const lastTwoWeeks = weekNumbers.slice(0, 2).map(weekNum => tradesByWeek[weekNum])
const hasPreviousWeek = lastTwoWeeks.length >= 2
// ...in the prompt template, conditionally include the "Previous Week" block only if hasPreviousWeek
```

- [ ] **Step 2: welcome route** — pass `unsubscribeUrl` and `siteUrl` to `WelcomeEmail` (the header is already built; the in-body link currently falls back to `#`):

```ts
react: WelcomeEmail({
  firstName,
  email: record.email,
  language: userLanguage,
  youtubeId,
  unsubscribeUrl,         // <-- add
  siteUrl: getSiteUrl(),  // <-- add
}),
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add app/api/email/weekly-summary/[userid]/actions/analysis.ts app/api/email/welcome/route.ts
git commit -m "fix(email): weekly-recap AI no longer hallucinates week-over-week on single week; welcome body unsubscribe link"
```

---

## Task 24: [ENV] Centralize hardcoded broker/data URLs + document env gaps

**Files:**
- `lib/env.ts` (extend schema)
- `.env.example` (document missing keys)
- `lib/databento.ts:5` + `app/api/cron/compute-trade-data/route.ts:71` (dedupe Databento URL)
- Tradovate live URL literals (5 files) → centralize in one constant

**Root cause:** Multiple hardcoded third-party endpoints duplicated across files; `lib/env.ts` validates <25% of vars actually read; `.env.example` missing 4 keys.

- [ ] **Step 1: Extend `lib/env.ts`** to validate the load-bearing keys currently read raw (ADMIN_*, CRON_SECRET, VERCEL_CRON_SECRET, CONTACT_REPLY_TO, TRADOVATE_ENVIRONMENT, DATABENTO_API_KEY, MCP_URL). Add them to the z.object schema with safe defaults/optionals so a missing var fails at boot with a clear message instead of a runtime 500. Read the current `lib/env.ts` first to match its style.

- [ ] **Step 2: Add the 4 missing keys to `.env.example`:**

```
# Email reply-to for blasts (defaults to team@qunt-edge.com)
CONTACT_REPLY_TO=

# Tradovate environment: 'demo' | 'live'  (defaults to 'demo')
TRADOVATE_ENVIRONMENT=demo
NEXT_PUBLIC_TRADOVATE_ENVIRONMENT=demo

# MCP stdio remote URL (local dev)
MCP_URL=
```

- [ ] **Step 3: Dedupe Databento URL.** In `lib/databento.ts` export `DATABENTO_BASE_URL` and import it in `compute-trade-data/route.ts` instead of redeclaring.

- [ ] **Step 4: Centralize Tradovate live URL.** Create or extend a `lib/brokers/tradovate-config.ts` (or add to the existing `TRADOVATE_ENVIRONMENTS` table) exporting both demo and live hosts, and import it in the 5 call sites that hardcode `'https://live.tradovateapi.com'`. Make the live host overridable via `TRADOVATE_LIVE_API_URL` env.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add lib/env.ts .env.example lib/databento.ts lib/brokers/tradovate-config.ts app/api/cron/compute-trade-data/route.ts app/[locale]/dashboard/components/import/tradovate/sync/actions.ts server/imports/tradovate-actions.ts app/api/cron/renew-tradovate-token/route.ts store/tradovate-sync-store.ts
git commit -m "fix(env): validate load-bearing env at boot; document missing keys; centralize Databento + Tradovate URLs"
```

---

## Task 25: Final verification (verification-before-completion)

- [ ] **Step 1: Full typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: exit 0, zero errors.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors (record baseline if pre-existing).

- [ ] **Step 3: Unit tests**

Run: `npm test`
Expected: all green, including the new `tests/server/journal-mudi.test.ts`.

- [ ] **Step 4: Build smoke** (catches Next.js RSC/client-boundary issues typecheck misses)

Run: `npm run build`
Expected: exit 0. (If build env issues block — e.g. no DB — document and fall back to typecheck + lint + tests as the verification gate.)

- [ ] **Step 5: MUDI re-audit** — Grep for any remaining `prisma.trade.findMany`/`updateMany`/`deleteMany`/`aggregate` whose `where` lacks `userId` (or a valid relation). Confirm zero hits outside cron/admin-scoped paths.

- [ ] **Step 6: Produce evidence-based completion report** listing each task's status with the actual command output (exit codes + key lines).

---

## Notes on deferred items

- **Privacy toggle server-side enforcement (Task 15)** — requires schema migration + product decision; deferred to a follow-up brainstorm.
- **Redis message queue for cron fan-out (full version of Task 18)** — requires infra decision; the in-process refactor is the safe repair, Redis is a future scale item.
- **Parallel privilege stores reconciliation (TeamManager vs TeamMember.role)** — architectural; the Task 11 fix removes the immediate authz gap. Full reconciliation (single source of truth) is a separate refactor.
- **Trader-detail dashboard route-level authz (Phase 2 DEFECT 1)** — currently masked by `getTradesAction`'s session guard (Task 1 area). Adding an explicit `assertTeamMembership(slug, sessionUser)` at the page entry is recommended but depends on the team-membership helper shape; flagged for follow-up rather than rushed.
