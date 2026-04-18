---
status: testing
phase: audit-frontend-backend
source: "Frontend↔Backend Communication Audit (commit 3d5dfde0)"
started: "2026-04-18T12:00:00Z"
updated: "2026-04-18T12:00:00Z"
---

## Current Test

number: 1
name: Trade Import Cache Invalidation
expected: |
  After importing trades (CSV, Tradovate sync, etc.), the dashboard should immediately reflect:
  - Updated trade count in widgets
  - Fresh equity chart curve
  - Updated leaderboard rank (if applicable)
  - Updated dashboard bootstrap data (accounts, tags, stats)
awaiting: user response

## Tests

### 1. Trade Import Cache Invalidation
expected: After importing trades via any method (CSV, Tradovate sync, manual), the dashboard immediately shows updated trade count, fresh equity chart, updated leaderboard rank, and refreshed dashboard bootstrap data. No stale data visible.
result: pending

### 2. Whop Webhook Subscription Cache Invalidation
expected: After a Whop webhook fires (subscription activated/deactivated/payment), the affected user's subscription status in the dashboard updates within seconds. Previously required up to 5 minutes of stale "ACTIVE" status after cancellation.
result: pending

### 3. Grace Period Cron Cache Invalidation
expected: When the grace period cron job runs and changes subscription status (ACTIVE→PENDING→CANCELLED), the affected user's dashboard shows the new status on next load without requiring a hard refresh.
result: pending

### 4. Team CRUD Cache Invalidation
expected: After creating a team, accepting an invitation, removing a member, or updating team settings, the teams list in the dashboard reflects the change immediately. Previously required waiting for cache TTL expiry (up to 30 minutes).
result: pending

### 5. Rithmic Sync Add/Remove Cache Invalidation
expected: After connecting or disconnecting a Rithmic sync account in the import settings, the sync status in the dashboard updates immediately. Previously showed stale connection status until cache expired.
result: pending

### 6. Tradovate Token Removal Cache Invalidation
expected: After disconnecting a Tradovate account (removing token), the dashboard shows the updated sync status and clears the equity chart for that account. Previously retained stale connection status.
result: pending

### 7. Tradovate Daily Sync Time Update (Auth Fix)
expected: When updating the daily sync time for a Tradovate sync, the change persists correctly for ALL users including legacy users with divergent auth-to-database ID mapping. Previously silently failed for legacy users because it used raw auth ID instead of database ID.
result: pending

### 8. Community Posts Cache Invalidation
expected: After creating a post, adding a comment, or voting on the community page, other users (or the same user navigating from elsewhere) see the updated content immediately. Previously 'use cache' entries were stale for up to 10 minutes while page-level revalidation worked.
result: pending

### 9. Blog Posts Cache Invalidation
expected: After publishing, editing, or deleting a blog post via admin, the public blog page shows the updated content immediately. Previously 'use cache' entries were stale for up to 60 minutes.
result: pending

### 10. Typecheck Passes Clean
expected: `npx tsc --noEmit` returns 0 errors after all cache invalidation changes. No new type errors introduced.
result: pending

## Summary

total: 10
passed: 0
issues: 0
pending: 10
skipped: 0
blocked: 0

## Gaps

[none yet]
