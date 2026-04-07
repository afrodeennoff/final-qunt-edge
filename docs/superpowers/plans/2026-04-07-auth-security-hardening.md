# Auth Security Hardening — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the authentication system by migrating tokens to secure storage, redacting PII in API responses, adding password reset, aligning validation, and refactoring the monolithic auth module.

**Architecture:** Layer-by-layer approach — Data Layer (token storage + PII redaction) first, then Auth Flow Layer (password reset + validation + cookies), then UI Layer (email masking + password UX), then Technical Debt (module split + tests). Each layer is independently committable.

**Tech Stack:** Next.js 16, Supabase Auth (@supabase/ssr), Prisma, Zustand, Vitest, Zod, AES-256-GCM (Web Crypto API), TypeScript

---

## Task 1: Shared Password Validation Module

Foundation — shared validation constants used by both server and client.

**Files:**
- Create: `lib/security/password-validation.ts`
- Create: `tests/lib/password-validation.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/lib/password-validation.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  validatePasswordStrength,
  getPasswordRequirements,
} from '@/lib/security/password-validation'

describe('password-validation', () => {
  describe('PASSWORD_MIN_LENGTH', () => {
    it('should be 8', () => {
      expect(PASSWORD_MIN_LENGTH).toBe(8)
    })
  })

  describe('PASSWORD_REGEX', () => {
    it('should reject strings without uppercase', () => {
      expect(PASSWORD_REGEX.test('abcdefgh1')).toBe(false)
    })
    it('should reject strings without lowercase', () => {
      expect(PASSWORD_REGEX.test('ABCDEFGH1')).toBe(false)
    })
    it('should reject strings without digit', () => {
      expect(PASSWORD_REGEX.test('Abcdefgh')).toBe(false)
    })
    it('should accept valid passwords', () => {
      expect(PASSWORD_REGEX.test('Abcdefgh1')).toBe(true)
    })
  })

  describe('validatePasswordStrength', () => {
    it('should return errors for too-short password', () => {
      const result = validatePasswordStrength('Ab1')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`)
    })
    it('should return errors for missing uppercase', () => {
      const result = validatePasswordStrength('abcdefgh1')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
    })
    it('should return errors for missing lowercase', () => {
      const result = validatePasswordStrength('ABCDEFGH1')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one lowercase letter')
    })
    it('should return errors for missing digit', () => {
      const result = validatePasswordStrength('Abcdefgh')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one digit')
    })
    it('should return valid for strong password', () => {
      const result = validatePasswordStrength('Abcdefgh1')
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })
  })

  describe('getPasswordRequirements', () => {
    it('should return all requirements unmet for empty string', () => {
      const reqs = getPasswordRequirements('')
      expect(reqs).toHaveLength(4)
      expect(reqs.every(r => !r.met)).toBe(true)
    })
    it('should show all met for strong password', () => {
      const reqs = getPasswordRequirements('Abcdefgh1')
      expect(reqs.every(r => r.met)).toBe(true)
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/password-validation.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write the implementation**

Create `lib/security/password-validation.ts`:

```typescript
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/

interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validatePasswordStrength(password: string): ValidationResult {
  const errors: string[] = []

  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`)
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one digit')
  }

  return { valid: errors.length === 0, errors }
}

export interface PasswordRequirement {
  key: string
  label: string
  met: boolean
}

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    { key: 'length', label: `At least ${PASSWORD_MIN_LENGTH} characters`, met: (password?.length ?? 0) >= PASSWORD_MIN_LENGTH },
    { key: 'uppercase', label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { key: 'lowercase', label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { key: 'digit', label: 'One number', met: /\d/.test(password) },
  ]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/lib/password-validation.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/security/password-validation.ts tests/lib/password-validation.test.ts
git commit -m "feat(security): add shared password validation module"
```

---

## Task 2: PII Redaction Utility

**Files:**
- Create: `lib/redact-pii.ts`
- Create: `tests/lib/redact-pii.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/lib/redact-pii.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { maskEmail, maskString, redactUserResponse } from '@/lib/redact-pii'

describe('redact-pii', () => {
  describe('maskEmail', () => {
    it('should mask standard email', () => {
      expect(maskEmail('john.doe@gmail.com')).toBe('jo***@gmail.com')
    })
    it('should mask short email', () => {
      expect(maskEmail('ab@example.com')).toBe('ab***@example.com')
    })
    it('should handle null/undefined', () => {
      expect(maskEmail(null as unknown as string)).toBe('')
      expect(maskEmail(undefined as unknown as string)).toBe('')
    })
    it('should handle email with subdomains', () => {
      expect(maskEmail('user@mail.example.com')).toBe('us***@mail.example.com')
    })
  })

  describe('maskString', () => {
    it('should mask middle of string', () => {
      expect(maskString('abcdef')).toBe('ab***ef')
    })
    it('should handle short strings', () => {
      expect(maskString('ab')).toBe('ab****')
    })
    it('should handle empty string', () => {
      expect(maskString('')).toBe('')
    })
    it('should handle custom visible chars', () => {
      expect(maskString('abcdefghij', 3, 3)).toBe('abc***hij')
    })
  })

  describe('redactUserResponse', () => {
    it('should redact specified fields in flat object', () => {
      const input = { id: 'abc-123', email: 'test@example.com', name: 'John' }
      const result = redactUserResponse(input, ['email'])
      expect(result.email).toBe('te***@example.com')
      expect(result.id).toBe('abc-123')
      expect(result.name).toBe('John')
    })
    it('should redact fields in nested arrays', () => {
      const input = { users: [{ email: 'a@test.com', role: 'admin' }, { email: 'b@test.com', role: 'user' }] }
      const result = redactUserResponse(input, ['email'])
      expect(result.users[0].email).toBe('a-***@test.com')
      expect(result.users[0].role).toBe('admin')
    })
    it('should not mutate original object', () => {
      const input = { email: 'test@example.com', name: 'John' }
      redactUserResponse(input, ['email'])
      expect(input.email).toBe('test@example.com')
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/redact-pii.test.ts`
Expected: FAIL

- [ ] **Step 3: Write the implementation**

Create `lib/redact-pii.ts`:

```typescript
export function maskEmail(email: string | null | undefined): string {
  if (!email) return ''
  const atIndex = email.indexOf('@')
  if (atIndex <= 0) return maskString(email)
  const localPart = email.slice(0, atIndex)
  const domain = email.slice(atIndex + 1)
  const visibleChars = Math.min(2, localPart.length)
  return `${localPart.slice(0, visibleChars)}***@${domain}`
}

export function maskString(value: string, visibleStart = 2, visibleEnd = 2): string {
  if (!value) return ''
  if (value.length <= visibleStart + visibleEnd) return value + '****'
  return `${value.slice(0, visibleStart)}***${value.slice(-visibleEnd)}`
}

export function redactUserResponse<T>(data: T, fieldsToRedact: string[]): T {
  if (!data || typeof data !== 'object') return data
  if (Array.isArray(data)) {
    return data.map((item) =>
      typeof item === 'object' && item !== null ? redactUserResponse(item, fieldsToRedact) : item
    ) as T
  }

  const result = { ...data } as Record<string, unknown>
  for (const key of Object.keys(result)) {
    const value = result[key]
    if (fieldsToRedact.includes(key) && typeof value === 'string') {
      result[key] = value.includes('@') ? maskEmail(value) : maskString(value)
    } else if (typeof value === 'object' && value !== null) {
      result[key] = redactUserResponse(value, fieldsToRedact)
    }
  }
  return result as T
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/lib/redact-pii.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/redact-pii.ts tests/lib/redact-pii.test.ts
git commit -m "feat(security): add PII redaction utility"
```

---

## Task 3: Apply PII Redaction to Admin Reports

**Files:**
- Modify: `app/api/admin/reports/route.ts`

- [ ] **Step 1: Add import**

At top of `app/api/admin/reports/route.ts`:
```typescript
import { redactUserResponse } from '@/lib/redact-pii'
```

- [ ] **Step 2: Mask emails in churn report**

In `generateChurnReport` return, change:
```typescript
recentCancellations: cancelledSubs.slice(0, 20),
```
to:
```typescript
recentCancellations: redactUserResponse(cancelledSubs.slice(0, 20), ['email']),
```

- [ ] **Step 3: Mask emails in subscription report**

In `generateSubscriptionReport` return, change:
```typescript
recentSubscriptions: subscriptions.slice(0, 50),
```
to:
```typescript
recentSubscriptions: redactUserResponse(subscriptions.slice(0, 50), ['email']),
```

- [ ] **Step 4: Mask emails in transaction report**

In `generateTransactionReport` return, change `transactions,` to:
```typescript
transactions: redactUserResponse(transactions, ['email']),
```

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/reports/route.ts
git commit -m "fix(security): mask user emails in admin report API responses"
```

---

## Task 4: Apply PII Redaction to Debug Endpoint

**Files:**
- Modify: `app/api/debug-data/route.ts`

- [ ] **Step 1: Add import**

```typescript
import { maskEmail, maskString } from '@/lib/redact-pii'
```

- [ ] **Step 2: Mask auth section**

Change the `auth` object:
```typescript
const auth = {
  authenticated: true,
  userId: maskString(user.id, 4, 4),
  email: maskEmail(user.email),
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/debug-data/route.ts
git commit -m "fix(security): mask userId and email in debug endpoint response"
```

---

## Task 5: Replace console.error/warn with Logger in auth.ts

**Files:**
- Modify: `server/auth.ts`

- [ ] **Step 1: Add logger import**

```typescript
import { logger } from '@/lib/logger'
```

- [ ] **Step 2: Replace all console.error/warn calls**

Search and replace every `console.error(` → `logger.error(` and `console.warn(` → `logger.warn(`. Adapt the second argument from positional to object form where needed:
- `console.error('[label] message:', e)` → `logger.error('[label] message', { error: e })`
- `console.warn('[label] message:', { key: val })` → `logger.warn('[label] message', { key: val })`

- [ ] **Step 3: Verify no console.error/warn remain**

Run: `grep -n 'console\.\(error\|warn\)' server/auth.ts`
Expected: No matches

- [ ] **Step 4: Commit**

```bash
git add server/auth.ts
git commit -m "fix(security): replace console.error/warn with logger in auth.ts"
```

---

## Task 6: Harden Supabase Cookie Configuration

**Files:**
- Modify: `server/auth.ts`

- [ ] **Step 1: Update createClient cookie setAll**

In `createClient()`, replace the `setAll` callback:
```typescript
setAll(cookiesToSet) {
  try {
    cookiesToSet.forEach(({ name, value, options }) =>
      cookieStore.set(name, value, {
        ...options,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })
    )
  } catch {
    // Server Component — ignore, middleware handles session refresh
  }
},
```

- [ ] **Step 2: Commit**

```bash
git add server/auth.ts
git commit -m "fix(security): add explicit security flags to Supabase auth cookies"
```

---

## Task 7: Extract Password Module

**Files:**
- Create: `server/auth-password.ts`
- Modify: `server/auth.ts`

- [ ] **Step 1: Create server/auth-password.ts with `resetPasswordForEmail`, `updatePassword`, `setPasswordAction`**

Import `createClient` logic locally (copy the function or import from `./auth` after circular deps resolved). Include cookie hardening from Task 6. Use shared `password-validation` module. Include `handleAuthError` and `getRequestIp` helpers.

- [ ] **Step 2: Remove `setPasswordAction`, inline `validatePasswordStrength`, `PASSWORD_MIN_LENGTH`, `PASSWORD_REGEX` from `server/auth.ts`**

Replace with import from `@/lib/security/password-validation`.

- [ ] **Step 3: Add re-exports in auth.ts**

```typescript
export { setPasswordAction, resetPasswordForEmail, updatePassword } from './auth-password'
```

- [ ] **Step 4: Verify typecheck**

Run: `npm run typecheck`

- [ ] **Step 5: Commit**

```bash
git add server/auth-password.ts server/auth.ts
git commit -m "refactor(auth): extract password module from auth.ts"
```

---

## Task 8: Forgot Password Page

**Files:**
- Create: `app/[locale]/(authentication)/forgot-password/page.tsx`
- Modify: `app/[locale]/(authentication)/components/user-auth-form.tsx` (add link)

- [ ] **Step 1: Create forgot password page**

Client component with email input form. Calls `resetPasswordForEmail`. Always shows success message (prevents email enumeration). Link back to `/authentication`.

- [ ] **Step 2: Add "Forgot password?" link to auth form login tab**

Add `Link` to `next/link` pointing to `/authentication/forgot-password` near the password submit button.

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/(authentication)/forgot-password/page.tsx app/[locale]/(authentication)/components/user-auth-form.tsx
git commit -m "feat(auth): add forgot password page and link"
```

---

## Task 9: Reset Password Page

**Files:**
- Create: `app/[locale]/(authentication)/reset-password/page.tsx`

- [ ] **Step 1: Create reset password page**

Client component with: password input + visibility toggle, confirm password, real-time requirements checklist (from `getPasswordRequirements`), calls `updatePassword` on submit, redirects to dashboard on success.

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/(authentication)/reset-password/page.tsx
git commit -m "feat(auth): add reset password page with strength indicator"
```

---

## Task 10: Tradovate Token Store Cleanup

**Files:**
- Modify: `store/tradovate-sync-store.ts`

- [ ] **Step 1: Remove all token fields from store**

Remove `accessToken`, `refreshToken`, `expiresAt`, `oauthState` from interface and state. Remove `setTokens`, `getValidToken`, `syncWithSessionStorage`, `loadFromSessionStorage`, `setOAuthState`, `clearOAuthState` methods. Remove `isTokenExpired`. Update `partialize` to only persist `isAuthenticated`, `accounts`, `lastSync`, `environment`. Add `onRehydrateStorage` to clear legacy sessionStorage tokens.

- [ ] **Step 2: Verify no external consumers exist**

Run: `grep -rn 'getValidToken\|setTokens' --include='*.ts' --include='*.tsx' | grep -v node_modules | grep -v tradovate-sync-store.ts`
Expected: No matches

- [ ] **Step 3: Commit**

```bash
git add store/tradovate-sync-store.ts
git commit -m "fix(security): remove token persistence from Tradovate sync store"
```

---

## Task 11: Email Masking in Profile Button

**Files:**
- Modify: `app/[locale]/teams/components/auth-profile-button.tsx`

- [ ] **Step 1: Add import and mask email**

```typescript
import { maskEmail } from '@/lib/redact-pii'
```
Change `{user?.email}` → `{maskEmail(user?.email)}`

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/teams/components/auth-profile-button.tsx
git commit -m "fix(security): mask email in profile dropdown"
```

---

## Task 12: Password Validation Alignment in Auth Form

**Files:**
- Modify: `app/[locale]/(authentication)/components/user-auth-form.tsx`

- [ ] **Step 1: Import shared validation**

```typescript
import { validatePasswordStrength, getPasswordRequirements, PASSWORD_MIN_LENGTH } from '@/lib/security/password-validation'
```

- [ ] **Step 2: Update Zod schema**

Change `.min(6)` to `.min(PASSWORD_MIN_LENGTH)` and add regex refinement.

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/(authentication)/components/user-auth-form.tsx
git commit -m "fix(auth): align client password validation with server rules"
```

---

## Task 13: Rithmic Encryption Key — Session-Derived

**Files:**
- Create: `app/api/rithmic/encryption-key/route.ts`
- Modify: `lib/rithmic-storage.ts`

- [ ] **Step 1: Create encryption key API route**

GET endpoint that authenticates via Supabase, derives a key from `access_token` via PBKDF2 with a fixed application salt. Returns base64-encoded key. Cache-Control: no-store.

- [ ] **Step 2: Update rithmic-storage.ts**

Replace `getOrCreateEncryptionKey` to try session-derived key from API first, fallback to localStorage for migration. Add `invalidateEncryptionKeyCache` export.

- [ ] **Step 3: Commit**

```bash
git add app/api/rithmic/encryption-key/route.ts lib/rithmic-storage.ts
git commit -m "fix(security): derive Rithmic encryption key from session"
```

---

## Task 14: Extract User Sync Module

**Files:**
- Create: `server/auth-user.ts`
- Modify: `server/auth.ts`

- [ ] **Step 1: Create server/auth-user.ts**

Move: `ensureUserInDatabase`, `getDatabaseUserId`, `getUserId`, `getUserEmail`, `updateUserLanguage`, `requireAuthenticatedUser`, all `findUser*Compat` helpers, `PostAuthSetupError`, `USER_SYNC_SELECT`, `USER_TABLE_NAME`, `AUTH_USER_ID_COLUMN`, `UserSyncRecord` type.

- [ ] **Step 2: Update auth.ts with re-exports**

Remove extracted code, add:
```typescript
export { ensureUserInDatabase, getDatabaseUserId, getUserId, getUserEmail, updateUserLanguage } from './auth-user'
```

- [ ] **Step 3: Verify typecheck**

Run: `npm run typecheck`

- [ ] **Step 4: Commit**

```bash
git add server/auth-user.ts server/auth.ts
git commit -m "refactor(auth): extract user sync module from auth.ts"
```

---

## Task 15: Extract Identity Module

**Files:**
- Create: `server/auth-identity.ts`
- Modify: `server/auth.ts`

- [ ] **Step 1: Create server/auth-identity.ts**

Move: `linkDiscordAccount`, `linkGoogleAccount`, `unlinkIdentity`, `getUserIdentities`. Import `createClient` from `./auth`.

- [ ] **Step 2: Update auth.ts re-exports**

```typescript
export { getUserIdentities, linkDiscordAccount, linkGoogleAccount, unlinkIdentity } from './auth-identity'
```

- [ ] **Step 3: Commit**

```bash
git add server/auth-identity.ts server/auth.ts
git commit -m "refactor(auth): extract identity linking module"
```

---

## Task 16: Add PII Warning to user-data.ts

**Files:**
- Modify: `app/api/email/weekly-summary/[userid]/actions/user-data.ts`

- [ ] **Step 1: Add JSDoc security warning**

```typescript
/**
 * @security WARNING: Returns raw PII. INTERNAL server action only.
 * MUST NEVER be exposed to client-side code or API responses.
 */
```

- [ ] **Step 2: Commit**

```bash
git add app/api/email/weekly-summary/[userid]/actions/user-data.ts
git commit -m "docs(security): add PII warning to weekly summary user data"
```

---

## Task 17: Final Verification

- [ ] **Step 1: Run new unit tests**

Run: `npx vitest run tests/lib/password-validation.test.ts tests/lib/redact-pii.test.ts`
Expected: PASS

- [ ] **Step 2: Run full test suite**

Run: `npm test`
Expected: All PASS (or only pre-existing failures)

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`

- [ ] **Step 4: Verify no console.error/warn in auth files**

Run: `grep -rn 'console\.\(error\|warn\)' server/auth*.ts`
Expected: No matches

---

## Dependency Graph

```
Task 1  (password-validation) ─── no deps
Task 2  (redact-pii)            ─── no deps
Task 3  (admin reports PII)     ─── Task 2
Task 4  (debug PII)             ─── Task 2
Task 5  (logger replacement)    ─── no deps
Task 6  (cookie hardening)      ─── no deps
Task 7  (auth-password module)  ─── Task 1
Task 8  (forgot password page)  ─── Task 7
Task 9  (reset password page)   ─── Task 1, Task 7
Task 10 (tradovate cleanup)    ─── no deps
Task 11 (email masking)        ─── Task 2
Task 12 (validation alignment) ─── Task 1
Task 13 (rithmic key)          ─── no deps
Task 14 (auth-user module)     ─── Task 5
Task 15 (auth-identity module) ─── Task 14
Task 16 (PII JSDoc)            ─── no deps
Task 17 (verification)         ─── all above
```

**Parallelizable groups:**
- Group A (foundation): Tasks 1, 2, 5, 6, 10, 13, 16
- Group B (data layer): Tasks 3, 4, 11 (after Task 2)
- Group C (auth flow): Tasks 7, 12 (after Task 1), 14 (after Task 5)
- Group D (UI): Tasks 8, 9 (after Task 7)
- Group E (refactor): Task 15 (after Task 14)
- Group F (verify): Task 17 (after all)
