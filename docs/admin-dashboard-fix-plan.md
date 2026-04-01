# Admin Dashboard System Fix Plan

**Date:** 2026-04-01
**Scope:** High and medium severity issues in admin dashboard
**Files Affected:**
- `/Users/timon/Downloads/qunt-edge/app/[locale]/admin/actions/stats.ts`
- `/Users/timon/Downloads/qunt-edge/app/[locale]/admin/actions/payment-actions.ts`

---

## HIGH SEVERITY ISSUES

### Issue 1: Dead Parameter in `getTransactionsAction`
**Priority:** HIGH
**File:** `app/[locale]/admin/actions/payment-actions.ts`
**Lines:** 8, 14-25

**Problem:**
The `getTransactionsAction` function accepts a `status` parameter but never uses it in the Prisma query, making it impossible to filter transactions by status.

```typescript
// Line 8 - Function signature accepts status
export async function getTransactionsAction(options?: { limit?: number; offset?: number; status?: string })

// Lines 14-25 - Query doesn't use status parameter
const transactions = await prisma.paymentTransaction.findMany({
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 50,
    skip: options?.offset || 0,
    include: {
        user: {
            select: {
                email: true
            }
        }
    }
    // MISSING: where clause for status filtering
})
```

**Fix:**
Add a `where` clause to filter by status when provided:

```typescript
const transactions = await prisma.paymentTransaction.findMany({
    where: options?.status ? { status: options.status } : undefined,
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 50,
    skip: options?.offset || 0,
    include: {
        user: {
            select: {
                email: true
            }
        }
    }
})
```

**Verification:**
- Test with `status: 'completed'` returns only completed transactions
- Test without status parameter returns all transactions
- ESLint: No unused parameter warnings

---

### Issue 2: No Error Handling in `cancelSubscriptionAction`
**Priority:** HIGH
**File:** `app/[locale]/admin/actions/payment-actions.ts`
**Lines:** 91-110

**Problem:**
The `cancelSubscriptionAction` calls `subscriptionManager.cancelSubscription()` without wrapping it in a try/catch block. If the subscription manager throws an error, the entire server action will crash.

```typescript
export async function cancelSubscriptionAction(userId: string) {
    const admin = await assertAdminAccess()

    // NO TRY/CATCH - if this throws, the action crashes
    const result = await subscriptionManager.cancelSubscription({
        userId,
        cancelAtPeriodEnd: false,
        reason: 'Admin cancelled'
    })

    if (result.success) {
        logAdminMutation({
            action: 'cancel-subscription',
            actor: admin,
            target: userId
        })
        revalidatePath('/admin')
    }

    return result
}
```

**Fix:**
Wrap the subscription cancellation in try/catch and handle errors gracefully:

```typescript
export async function cancelSubscriptionAction(userId: string) {
    const admin = await assertAdminAccess()

    try {
        const result = await subscriptionManager.cancelSubscription({
            userId,
            cancelAtPeriodEnd: false,
            reason: 'Admin cancelled'
        })

        if (result.success) {
            logAdminMutation({
                action: 'cancel-subscription',
                actor: admin,
                target: userId
            })
            revalidatePath('/admin')
        }

        return result
    } catch (error) {
        console.error('[Admin] Failed to cancel subscription:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to cancel subscription'
        }
    }
}
```

**Verification:**
- Test with invalid userId returns error object, not crash
- Test with valid userId cancels successfully
- Check browser console for no unhandled errors

---

### Issue 3: Silent Supabase Client Failures
**Priority:** HIGH
**File:** `app/[locale]/admin/actions/stats.ts`
**Lines:** 49-58 (getUserStats), 114-119 (getFreeUsers)

**Problem:**
When Supabase admin client creation fails (missing env vars, network issues), the code returns empty data instead of throwing an error. This masks real configuration problems from admins.

```typescript
// getUserStats - Lines 49-58
try {
    supabase = getSupabaseAdminClient()
} catch (error) {
    console.warn('[AdminStats] Supabase admin client unavailable:', error)
    return {
        totalUsers: 0,
        dailyData: [],
        allUsers: [],
    }
}

// getFreeUsers - Lines 114-119
try {
    supabase = getSupabaseAdminClient()
} catch (error) {
    console.warn('[AdminStats] Supabase admin client unavailable:', error)
    return []
}
```

**Fix:**
Throw descriptive errors instead of returning empty data so admins know there's a configuration problem:

```typescript
// getUserStats
try {
    supabase = getSupabaseAdminClient()
} catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(
        `Supabase admin client initialization failed: ${message}. ` +
        `Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.`
    )
}

// getFreeUsers
try {
    supabase = getSupabaseAdminClient()
} catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(
        `Supabase admin client initialization failed: ${message}. ` +
        `Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.`
    )
}
```

**Verification:**
- Test with missing SUPABASE_SERVICE_ROLE_KEY throws clear error
- Test with invalid Supabase URL throws clear error
- Admin UI shows error message, not "0 users"

---

## MEDIUM SEVERITY ISSUES

### Issue 4: No Pagination in `getFreeUsers()` Trade Loading
**Priority:** MEDIUM
**File:** `app/[locale]/admin/actions/stats.ts`
**Lines:** 121-133

**Problem:**
`getFreeUsers()` loads ALL trades from the database with `prisma.trade.findMany({})`. On large datasets (10,000+ trades), this will cause:
- Memory exhaustion
- Query timeout (PostgreSQL default: 30s)
- Slow page load for admins

```typescript
// Lines 124-133 - Loads ALL trades
let trades: PrismaTrade[] = []

try {
    trades = await prisma.trade.findMany({})
} catch (error) {
    if (!isAdminDataUnavailableError(error)) {
        throw error
    }

    console.warn('[AdminStats] Trades unavailable:', error)
    return []
}
```

**Fix:**
Use cursor-based pagination to load trades in batches of 1000:

```typescript
let trades: PrismaTrade[] = []
let cursor: string | undefined = undefined
const batchSize = 1000
const maxBatches = 10 // Safety limit: 10,000 trades max

try {
    for (let i = 0; i < maxBatches; i++) {
        const batch = await prisma.trade.findMany({
            take: batchSize,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
            select: {
                id: true,
                userId: true
            }
        })

        trades.push(...batch)

        if (batch.length < batchSize) break // No more data
        cursor = batch[batch.length - 1].id
    }
} catch (error) {
    if (!isAdminDataUnavailableError(error)) {
        throw error
    }

    console.warn('[AdminStats] Trades unavailable:', error)
    return []
}
```

**Verification:**
- Test with 100+ trades completes in <5 seconds
- Test with 10,000+ trades completes without timeout
- Memory usage remains stable

---

### Issue 5: Pagination Breaks Silently
**Priority:** MEDIUM
**File:** `app/[locale]/admin/actions/stats.ts`
**Lines:** 71-73 (getUserStats), 168-170 (getFreeUsers)

**Problem:**
When Supabase pagination errors occur, the code breaks the loop and returns partial data without warning the admin that the data is incomplete.

```typescript
// getUserStats - Lines 71-73
if (error) {
    console.error('Error fetching users:', error)
    break // Returns partial data silently
}

// getFreeUsers - Lines 168-170
if (error) {
    console.error('Error fetching users:', error)
    break // Returns partial data silently
}
```

**Fix:**
Track pagination errors and throw if data is incomplete:

```typescript
// getUserStats
let allUsers: User[] = []
let page = 1
const perPage = 1000
let hasMore = true
let lastError: Error | null = null

while (hasMore) {
    const { data, error } = await supabase.auth.admin.listUsers({
        page,
        perPage
    })

    if (error) {
        lastError = error
        console.error(`[AdminStats] Error fetching users (page ${page}):`, error)
        break
    }

    if (data.users.length === 0) {
        hasMore = false
    } else {
        allUsers = [...allUsers, ...data.users]
        page++
    }
}

// Throw if we hit an error mid-pagination
if (lastError && allUsers.length > 0) {
    console.warn(`[AdminStats] Returning partial user data (${allUsers.length} users) due to pagination error`)
}
```

**Verification:**
- Test with network error during pagination shows warning in logs
- Test with rate limit error shows partial data warning
- Admin UI indicates if data might be incomplete

---

### Issue 6: Unused Admin Result from `assertAdminAccess()`
**Priority:** MEDIUM
**Files:**
- `app/[locale]/admin/actions/stats.ts` - Lines 46, 111, 195
- `app/[locale]/admin/actions/payment-actions.ts` - Lines 9, 41, 61, 92

**Problem:**
`assertAdminAccess()` returns an admin object with user details, but most actions don't use it for logging or auditing. This misses valuable audit trail information.

```typescript
// stats.ts - Lines 45-46
export async function getUserStats() {
    await assertAdminAccess() // Returns admin but ignores it
    // ...
}

// payment-actions.ts - Lines 8-9
export async function getTransactionsAction(options?: { limit?: number; offset?: number; status?: string }) {
    const admin = await assertAdminAccess() // Captures admin but doesn't use it
    // ...
    // Line 27-31: logs use admin object, but not for tracking WHO made the request
    logAdminMutation({
        action: 'list-transactions',
        actor: admin,
        details: { limit: options?.limit || 50, offset: options?.offset || 0 }
    })
}
```

**Note:** Looking at the code more carefully, `payment-actions.ts` DOES use the admin object in `logAdminMutation()` calls (lines 27-31, 49-53, 78-82, 101-105), so this issue only affects `stats.ts`.

**Fix:**
Log admin access for audit trail in stats.ts:

```typescript
// getUserStats
export async function getUserStats() {
    const admin = await assertAdminAccess()
    console.log(`[AdminStats] User stats requested by ${admin.email}`)

    // ... rest of function
}

// getFreeUsers
export async function getFreeUsers() {
    const admin = await assertAdminAccess()
    console.log(`[AdminStats] Free users requested by ${admin.email}`)

    // ... rest of function
}

// getNewsletterStats
export async function getNewsletterStats() {
    const admin = await assertAdminAccess()
    console.log(`[AdminStats] Newsletter stats requested by ${admin.email}`)

    // ... rest of function
}
```

**Verification:**
- Check server logs show admin email for each stats request
- Audit trail now shows WHO requested each stat

---

## IMPLEMENTATION ORDER

### Phase 1: High Severity (Do First)
1. Fix Issue 2 (cancelSubscriptionAction error handling) - highest risk of crashes
2. Fix Issue 3 (silent Supabase failures) - masks config errors
3. Fix Issue 1 (dead status parameter) - broken feature

### Phase 2: Medium Severity (Do Second)
4. Fix Issue 4 (pagination in getFreeUsers) - performance
5. Fix Issue 5 (silent pagination breaks) - data integrity
6. Fix Issue 6 (admin logging) - audit trail

### Phase 3: Verification
7. Run ESLint on all modified files
8. Run TypeScript typecheck
9. Run test suite
10. Manual testing in admin dashboard

---

## VERIFICATION CHECKLIST

### After Fixes:
- [ ] `npx eslint app/[locale]/admin/actions/stats.ts app/[locale]/admin/actions/payment-actions.ts` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run test` passes
- [ ] Admin dashboard loads without errors
- [ ] Can filter transactions by status
- [ ] Cancelling subscription with invalid userId shows error, not crash
- [ ] Missing Supabase env vars show clear error message
- [ ] Free users page loads quickly even with 10,000+ trades
- [ ] Pagination errors show warnings in server logs
- [ ] Admin actions appear in logs with admin email

---

## NOTES

### Dashboard Tab Navigation
The admin dashboard uses URL query parameters for tab navigation:
- URL format: `/admin?tab=widgets|table|accounts|chart`
- Server component reads `searchParams` to determine active tab
- This is separate from the issues above but worth noting for context

### Related Files (Not Modified)
- `server/authz.ts` - Contains `assertAdminAccess()` implementation
- `server/payment-service.ts` - Payment transaction logic
- `server/subscription-manager.ts` - Subscription cancellation logic

### Testing Recommendations
1. Test with missing Supabase env vars
2. Test with invalid subscription IDs
3. Test with 10,000+ trades in database
4. Test transaction filtering by status
5. Test pagination with rate limiting

---

## Estimated Time
- Issue 1: 5 minutes
- Issue 2: 10 minutes
- Issue 3: 15 minutes
- Issue 4: 20 minutes
- Issue 5: 15 minutes
- Issue 6: 10 minutes
- Verification: 15 minutes

**Total:** ~90 minutes
