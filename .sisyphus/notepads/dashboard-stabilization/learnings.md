# Dashboard Stabilization - Learnings

## Completed Tasks (10/11)

### T1: Cache Tags Centralization
- `EQUITY_CHART` constant added to `lib/cache/cache-invalidation.ts`
- Maps to `equity-chart-${userId}` pattern
- `invalidateEquityChart(userId)` helper function exists

### T2: Equity-Chart Invalidation
- Added to mutation paths: `server/layouts.ts`, `server/imports/tradovate-actions.ts`, `server/thor.ts`
- All invalidation functions now include equity-chart tag

### T3: Sidebar Header Button
- Fixed in `components/ui/unified-sidebar.tsx` lines 300-314
- Wrapped with `<Link href="/dashboard">` + `asChild` pattern

### T4: Parallel Refresh
- `Promise.allSettled` used in `context/data-provider.tsx` lines 623, 1066
- Error handling improved

### T5: Runtime/Deploy
- Node 20.x verified in package.json
- npm-only build verified in vercel.json
- 6 protected routes in proxy.ts

### T6: Chat Persistence
- 24h retention in `lib/chat-retention.ts` with `CHAT_RETENTION_MS`
- `expiresAt` stored in conversation envelope
- `loadChat()` filters expired at read time

### T7: Chat Cleanup Cron
- Already exists at `/api/cron/chat-retention`
- `cleanupExpiredChatConversations()` in `server/journal.ts`
- Cron entry in vercel.json

### T8: Chat AI Elements
- Partial migration: uses `Response` + `Reasoning` from ai-elements
- Custom components preserved: EquityChartMessage, askForConfirmation, ToolCallMessage

### T10: Unit Tests
- Created `lib/__tests__/cache-invalidation.test.ts` with 14 tests
- All tests pass

### T11: Final Verification
- Typecheck passes
- New code has no anti-patterns

## Deferred Tasks

### T9: Accounts Analysis Migration
- Complex refactor - deferred to future work
- Current implementation uses custom rendering, not AI Elements

## Test Files Created
- `lib/__tests__/cache-invalidation.test.ts` - 14 tests

## Test Files Modified (for mock compatibility)
- `tests/server/accounts-isolation.test.ts` - Added `invalidateAccountRelatedCaches` mock
- `tests/server/delete-ownership-regression.test.ts` - Added `invalidateGroupRelatedCaches` mock