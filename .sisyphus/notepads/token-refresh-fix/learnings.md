# Token Refresh Fix - Implementation Notes

## Date
2026-04-02

## Issue
Token refresh was storing tokens under the wrong accountId in multi-account setups.

## Root Cause
In `getTradovateToken()`, when calling `renewTradovateAccessToken()` to auto-renew expired tokens, the function was passing the function parameter `accountId` instead of the `accountId` from the sync record (`syncData.accountId`).

**Location:** `server/imports/tradovate-actions.ts` lines 1245-1251

**Before:**
```typescript
logger.info('Tradovate token expired, attempting auto-renewal', { accountId })
const renewalResult = await renewTradovateAccessToken(
  accessToken,
  syncData.accountId?.toString() === 'live' ? 'live' : 'demo',
  accountId  // BUG: Uses function parameter instead of syncData.accountId
)
```

**After:**
```typescript
logger.info('Tradovate token expired, attempting auto-renewal', { accountId: syncData.accountId })
const renewalResult = await renewTradovateAccessToken(
  accessToken,
  syncData.accountId?.toString() === 'live' ? 'live' : 'demo',
  syncData.accountId  // FIXED: Uses accountId from sync record
)
```

## Impact
This bug caused tokens to be stored under incorrect accountIds when:
1. Multiple Tradovate accounts were configured for the same user
2. Tokens expired and auto-renewed
3. The renewal was triggered for one account but stored under a different account's ID

## Fix
Changed line 1250 to use `syncData.accountId` instead of `accountId` parameter.

## Verification
- Typecheck: ✓ Passed
- Lint: ✓ No new errors introduced
- Logic: ✓ Correct accountId is now used for storing renewed tokens

## Safety
- The fix is backward compatible
- No database schema changes required
- No API contract changes
- Only affects token renewal behavior, not other token operations
