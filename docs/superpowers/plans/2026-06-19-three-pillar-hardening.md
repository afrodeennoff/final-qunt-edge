# Three-Pillar Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the end-to-end repair and feature-hardening of the Dashboard data lifecycle, Teams multi-tenant platform, and Admin/email automation suite — closing all Multi-User Data Isolation (MUDI) gaps, removing hardcoded configuration, and wiring up broken/missing flows.

**Architecture:** Surgical fixes to existing files. No trading math is touched (Rule 3). All credential resolution must go through `lib/env.ts` / `lib/site-url.ts` (Rule 2). Every Prisma query must be scoped to an authenticated identity (Rule 1).

**Tech Stack:** Next.js 16 App Router, Prisma 7, Supabase Auth, Resend, Zustand, TanStack Table, TipTap.

**Baseline:** `tsc --noEmit` passes (0 errors). Prisma schema valid. ESLint: 158 `no-explicit-any` errors (type hygiene, mostly in MCP tests).

---

## Phase 1 — Dashboard Data Lifecycle & Trade Management

### Task 1.1: Fix Rithmic processor hardcoded account + ID collision

**Files:**
- Modify: `app/[locale]/dashboard/components/import/rithmic/rithmic-performance-processor.tsx`

- [ ] Replace hardcoded `'default-account'` (line 31) with a generated placeholder derived from row context; surface a warning when an AccountNumber cell is missing instead of silently attaching to a fake account.
- [ ] Remove the client-side `item.id = \`${entryId}-${closeId}\`` assignment (line 89) that collapses to `"undefined-undefined"`. Let the server's `generateTradeUUID` compute the id (it already does at `server/trades.ts:309`). Use a stable row index for React keys instead.

### Task 1.2: Fix optimistic-state pollution on duplicate import rejection

**Files:**
- Modify: `app/[locale]/dashboard/components/import/import-button.tsx`

- [ ] In `handleSave`, move the optimistic store merge (lines 134-139) and `refreshTradesOnly` (line 142) to execute **only after** the `result.error` check passes (line 143). On duplicate/invalid rejection, do not mutate the local store.

### Task 1.3: Fix stale account metrics after trade mutations

**Files:**
- Modify: `app/[locale]/dashboard/components/data-provider.tsx` (updateTrades/deleteTrades cache scope, ~line 2060)
- Modify: `server/trades.ts` (`updateTradesAction`, ~line 795)

- [ ] In `data-provider.tsx` `updateTrades` and `deleteTrades`, change `clearDashboardBrowserCache('trades', ...)` to `clearDashboardBrowserCache('all', ...)` so account metrics refresh.
- [ ] In `server/trades.ts` `updateTradesAction`, call `invalidateAccountRelatedCaches(userId)` alongside `invalidateTradeRelatedCaches(userId)`.

### Task 1.4: Surface import validation warnings + fix silent Tradovate row drops

**Files:**
- Modify: `app/[locale]/dashboard/components/import/import-button.tsx`
- Modify: `app/[locale]/dashboard/components/import/tradovate/tradovate-processor.tsx`

- [ ] In `import-button.tsx`, when `result.warnings?.length`, show a toast summarizing skipped rows (e.g. "N trades imported, M skipped").
- [ ] In `tradovate-processor.tsx`, track a `skipped` counter for rows dropped at lines 109-112 and 175-182; include it in the processed summary.

---

## Phase 2 — Teams Multi-Tenant Framework

### Task 2.1: CRITICAL — Close cross-tenant trade leak in getTeamOverviewData

**Files:**
- Modify: `server/teams.ts` (`getTeamOverviewData`, lines 612-619)

- [ ] Change the trade query from `where: { accountNumber: { in: accountNumbers } }` to `where: { userId: { in: memberUserIds } }` (account number is NOT globally unique — `@@unique([number, userId])`).

### Task 2.2: CRITICAL — Add session check to getTeamOverviewDataAction

**Files:**
- Modify: `app/[locale]/teams/actions/overview.ts`

- [ ] Resolve the caller identity from the Supabase session (`getDatabaseUserId()`) and ignore the client-supplied `userId` for authorization. Keep `userId` param only for internal/mcp trusted callers, or remove it and derive from session.

### Task 2.3: Fix broken invitation URL + remove hardcoded addresses

**Files:**
- Modify: `app/[locale]/dashboard/settings/actions.ts` (`sendTeamInvitation`, lines 813-815, 836, 842)

- [ ] Build `joinUrl` via `getSiteUrl(\`/${inviteLocale}/teams/join?invitation=...\`)` to include the locale segment (currently omits `[locale]` → 404).
- [ ] Replace hardcoded `from`/`replyTo` with `process.env.TEAM_INVITE_FROM` / `TEAM_INVITE_REPLY_TO` (mirroring `api/team/invite/route.ts:170,176`).

### Task 2.4: Revoke manager access on member removal + protect owner

**Files:**
- Modify: `server/teams.ts` (`removeMember`, line 355)
- Modify: `app/[locale]/dashboard/settings/actions.ts` (`removeTraderFromTeam`, ~line 916)

- [ ] When removing a member, also delete their `TeamManager` row if one exists (prevents privilege-escalation-by-staleness).
- [ ] Add a guard: refuse to remove the team owner (`team.userId === traderId`) from members/traderIds.

### Task 2.5: Fix getTeamById to include managers + win-rate scoping bug

**Files:**
- Modify: `server/teams.ts` (`getTeamById`, lines 88-130; `updateTeamAnalytics`, lines 525-532)

- [ ] In `getTeamById` `OR`, add `{ managers: { some: { managerId: userId } } }` so managers aren't 404'd.
- [ ] In `updateTeamAnalytics`, scope `winningTradesResult` (lines 526-529) to the same `periodStart` filter as `totalTrades` so win-rate is period-consistent. (This is a query-scoping fix, NOT a math change.)

### Task 2.6: Clean dangling bestMemberId + GIN index on Team.traderIds

**Files:**
- Modify: `server/teams.ts` (`removeMember`) — null out `TeamAnalytics.bestMemberId` when the removed member was the best performer.
- Modify: `prisma/schema.prisma` (Team model, ~line 760) — add `@@index([traderIds], type: Gin)`.

- [ ] Apply schema index; document that a migration is required (`prisma migrate`).

---

## Phase 3 — Admin Suite & Email/Newsletter Automation

### Task 3.1: CRITICAL — Add auth to sendEmailsToUsersInternal

**Files:**
- Modify: `app/[locale]/admin/actions/send-email.ts` (`sendEmailsToUsersInternal`, ~line 273)

- [ ] Either inline `assertAdminAccess()` into `sendEmailsToUsersInternal`, or un-export it and keep only `sendEmailsToUsers` (which already asserts admin) as the public entry point.

### Task 3.2: CRITICAL — Fix tokenless unsubscribe links (CAN-SPAM)

**Files:**
- Modify: `components/emails/weekly-recap.tsx` (lines 342-344)
- Modify: `components/emails/welcome.tsx` (lines 27-29)
- Modify: `components/emails/team-invitation.tsx` (line 63), `missing-data.tsx` (line 81)

- [ ] Accept an `unsubscribeUrl` prop (signed token) like `renewal-notice.tsx` does; stop building a tokenless hardcoded-domain URL. Callers must pass `buildUnsubscribeUrl(email)`.

### Task 3.3: Remove hardcoded domains in email templates → getSiteUrl

**Files:**
- Modify: `components/emails/*.tsx` (weekly-recap:302, welcome:83,156, black-friday:112,131, new-feature:86, missing-data:180)

- [ ] Replace literal `https://qunt-edge.vercel.app/dashboard` etc. with a `siteUrl` prop (or render-time `getSiteUrl('/dashboard')` on the server). Templates are rendered server-side, so `getSiteUrl` is safe.

### Task 3.4: Fix newsletter French-only recipient filter + full-table scan

**Files:**
- Modify: `app/[locale]/admin/actions/newsletter.ts` (`sendNewsletter`, lines 113-117)

- [ ] Remove the `user.language === 'fr'` filter (English users can never receive the newsletter).
- [ ] Replace `prisma.user.findMany()` (fetches whole table) with a targeted query joining `Newsletter` subscribers (`email`, `firstName`, `language`) — only fetch what's needed.

### Task 3.5: Remove hardcoded personal reply-to + unify Resend from-addresses

**Files:**
- Modify: `app/[locale]/admin/actions/send-email.ts` (line 355), `newsletter.ts` (150,209), `app/api/email/weekly-summary/[userid]/route.ts` (110)

- [ ] Replace hardcoded `hugo.demenez@qunt-edge.vercel.app` reply_to with `process.env.CONTACT_REPLY_TO` / a named env var; fall back to omitting reply_to if unset.

### Task 3.6: Schedule the weekly crons + fix weekly-recap language pass-through

**Files:**
- Modify: `vercel.json` (add schedules for `/api/cron` and `/api/cron/compute-trade-data`)
- Modify: `app/[locale]/admin/actions/weekly-recap.ts` (lines 63, 79-91)

- [ ] Add two `vercel.json` cron entries (weekly cadence) using `requireCronAuth`-compatible auth.
- [ ] In `weekly-recap.ts`, derive `language` from the target user instead of forcing `'fr'`; pass `language` + `email` into `renderEmail` so the template renders in the correct locale.

### Task 3.7: Fix investing cron English month map

**Files:**
- Modify: `app/api/cron/investing/route.ts` (lines 80-84)

- [ ] Add English month names to the month map (or select the map by `lang`) so the scheduled `lang=en` run yields events.

---

## Verification

### Task V.1: Type + lint + schema checks after each phase
- [ ] After Phase 1: `npx tsc --noEmit` (0 errors), `npx prisma validate`
- [ ] After Phase 2: `npx tsc --noEmit` (0 errors)
- [ ] After Phase 3: `npx tsc --noEmit` (0 errors)
- [ ] Final: `npx eslint .` (confirm no NEW errors introduced beyond the pre-existing MCP-test `any` warnings)

### Task V.2: Targeted regression checks
- [ ] Confirm `server/teams.ts` no longer queries trades by `accountNumber` alone.
- [ ] Confirm `getTeamOverviewDataAction` resolves identity from session.
- [ ] Confirm no email template builds a tokenless unsubscribe URL.
- [ ] Confirm no `hugo.demenez` literal remains in app code (only in docs/.env examples).
