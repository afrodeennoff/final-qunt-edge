# Auth Security Hardening — Design Spec

**Date**: 2026-04-07
**Status**: Approved
**Approach**: Layer-by-Layer (Data → Auth Flow → UI)

## Context

The authentication system uses Supabase Auth with email OTP, password, Google OAuth, and Discord OAuth. A comprehensive security audit identified several vulnerabilities and incomplete functionality across token storage, API response PII exposure, missing password reset, client-server validation mismatch, and a monolithic auth module.

### Existing Strengths
- OAuth CSRF protection with timing-safe comparison
- Token encryption (AES-256-GCM) in `lib/security/token-crypto.ts`
- Logger redaction system (12 sensitive field types) in `lib/logger.ts`
- Auth rate limiting/lockout framework in `lib/security/auth-attempts.ts`
- Comprehensive security headers and CSP in `proxy.ts`
- Route-based auth protection in `proxy.ts`

### Existing Weaknesses
- Tradovate tokens stored plaintext in localStorage/sessionStorage
- Rithmic encryption key stored in localStorage (XSS-vulnerable)
- PII (emails, user IDs) exposed in admin/debug API responses
- No password reset flow
- Client-side password validation (6 chars) mismatches server (8+ chars with complexity)
- Supabase cookie security flags not explicitly set
- `console.error` calls in auth.ts bypass logger redaction
- `server/auth.ts` is ~700 lines with mixed responsibilities

---

## Layer 1: Data Layer — Token Storage & PII Redaction

### 1A: Tradovate Token Migration to Server-Side Cookies

**Problem**: `store/tradovate-sync-store.ts` stores `accessToken` and `refreshToken` in both Zustand/localStorage and sessionStorage. Accessible to any XSS payload.

**Solution**:
- Create `app/api/tradovate/token/route.ts` — a server-side token proxy that stores tokens in encrypted HttpOnly cookies using existing `token-crypto.ts` (AES-256-GCM)
- POST `/api/tradovate/token` — receives tokens from OAuth callback, encrypts and stores in HttpOnly cookies
- GET `/api/tradovate/token` — returns whether user is authenticated (no raw tokens)
- DELETE `/api/tradovate/token` — clears token cookies
- The Zustand store retains UI state only: `isAuthenticated`, `accounts`, `environment`, `lastSync`
- Remove `setTokens`, `getValidToken`, `syncWithSessionStorage`, `loadFromSessionStorage` from store
- Update `partialize` to exclude all token fields
- Add one-time migration: clear legacy tokens from localStorage on store init

**Cookie configuration**:
```
HttpOnly=true, Secure=(production), SameSite=Lax, Path=/
```

### 1B: Rithmic Credential Key — Session-Derived Encryption

**Problem**: `lib/rithmic-storage.ts` encrypts credentials with AES-GCM but stores the encryption key in localStorage. XSS = full credential extraction.

**Solution**:
- Create `app/api/rithmic/encryption-key/route.ts` — derives an encryption key from the user's Supabase session token via PBKDF2
- GET returns the derived key (authenticated users only); key changes when session changes
- `lib/rithmic-storage.ts` fetches key from API instead of localStorage on encrypt/decrypt
- Remove `getOrCreateEncryptionKey()` localStorage logic
- Migration: on first load, if legacy key exists in localStorage, encrypt existing credentials with new session-derived key, then delete legacy key

### 1C: PII Redaction Utility for API Responses

**Problem**: Admin reports return raw emails. Debug endpoint returns userId and email. No consistent PII masking.

**Solution**:
- Create `lib/redact-pii.ts`:
  - `maskEmail(email: string): string` — e.g., `j***@gmail.com`
  - `maskString(str: string, visibleStart = 2, visibleEnd = 2): string` — e.g., `ab***cd`
  - `redactUserResponse<T>(data: T, fields: string[]): T` — deep redact specified fields
- Apply to `app/api/admin/reports/route.ts`:
  - Churn report: mask emails in `recentCancellations`
  - Subscription report: mask emails in `recentSubscriptions`
  - Transaction report: mask emails in `transactions`
- Apply to `app/api/debug-data/route.ts`: mask `userId` and `email` in `auth` section
- `user-data.ts` (weekly summary) is internal-only — add JSDoc noting PII sensitivity

### 1D: Console.error Cleanup in auth.ts

**Problem**: Several `console.error` calls in `server/auth.ts` bypass the logger's sensitive data redaction.

**Solution**: Replace all `console.error` and `console.warn` with `logger.error()` / `logger.warn()` from `lib/logger.ts`.

---

## Layer 2: Auth Flow Layer — Password Reset, Validation, Session

### 2A: Password Reset Flow

**Problem**: No password reset endpoint or UI. Users who forget passwords have no recovery path.

**Solution**:
- Server actions in `server/auth-password.ts`:
  - `resetPasswordForEmail(email: string)` — calls `supabase.auth.resetPasswordForEmail()`, rate-limited via `checkAuthGuard` (action type: `password_reset_request`)
  - `updatePassword(newPassword: string)` — calls `supabase.auth.updateUser({ password })`, validates via `validatePasswordStrength()`
- UI pages:
  - `app/[locale]/(authentication)/forgot-password/page.tsx` — email input form calling `resetPasswordForEmail`
  - `app/[locale]/(authentication)/reset-password/page.tsx` — extracts `#access_token` from URL hash, sets session, shows new password form
- Entry point: "Forgot password?" link on `user-auth-form.tsx` login tab
- Supabase email template configuration (via Supabase Dashboard) points to `{siteUrl}/auth/reset-password`

### 2B: Client-Server Password Validation Alignment

**Problem**: Client enforces minimum 6 chars. Server enforces 8+ chars with uppercase, lowercase, digit. Confusing UX.

**Solution**:
- Create `lib/security/password-validation.ts`:
  - Export `PASSWORD_MIN_LENGTH = 8`
  - Export `PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/`
  - Export `validatePasswordStrength(password: string): { valid: boolean; errors: string[] }`
  - Export `getPasswordRequirements(): { label: string; met: boolean }[]` (for UI display)
- `server/auth.ts` imports from shared module (remove inline constants)
- `user-auth-form.tsx` imports and uses same validation rules
- Real-time strength indicator: 🔴 Too short → 🟡 Missing requirements → 🟢 Strong

### 2C: Supabase Cookie Security Flags

**Problem**: `createClient()` in `server/auth.ts` doesn't set explicit cookie security options.

**Solution**: Add explicit options to `setAll` in cookie handler:
```typescript
cookieStore.set(name, value, {
  ...options,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
})
```

### 2D: Error Message Consistency

**Problem**: `handleAuthError` has unredacted `console.error`. Error obfuscation works but logging bypasses it.

**Solution**: Replace with `logger.error()`. Ensure no Supabase internal messages leak through `getExternalAuthErrorMessage()`.

---

## Layer 3: UI Layer — Presentation Security

### 3A: Email Masking in Profile Components

**Problem**: `auth-profile-button.tsx` displays full email in dropdown.

**Solution**: Use `maskEmail()` from `lib/redact-pii.ts`. Add "Show full email" toggle for account owner.

### 3B: Password Input UX

**Problem**: No visibility toggle, no confirm password on registration, no strength indicator.

**Solution**:
- Add eye icon toggle for password visibility
- Add "Confirm password" field on registration tab
- Add real-time strength indicator (per 2B)
- Ensure `autocomplete="new-password"` on registration fields

### 3C: Zustand Store Token Cleanup

Covered in 1A — remove all token fields from store persistence and add legacy migration.

### 3D: Stray Sensitive Data Patterns

**Problem**: Hardcoded `PASSWORD_MIN_LENGTH = 6` in form. ETP/Thor sync components store raw tokens in React state.

**Solution**:
- Remove hardcoded min length, import from shared module
- Audit `etp-sync.tsx` and `thor-sync.tsx` — ensure tokens are not held in state longer than needed for the API call

---

## Layer 4: Technical Debt & Production Readiness

### 4A: server/auth.ts Module Split

**Problem**: ~700 lines with mixed responsibilities (auth, user sync, identity linking, ID resolution).

**Solution** — pure refactor, no behavioral changes:
- `server/auth.ts` — core auth actions (signIn, signUp, signOut, OTP, createClient, getWebsiteURL) ~250 lines
- `server/auth-user.ts` — user database sync (ensureUserInDatabase, getDatabaseUserId, findUserByAuthIdCompat, getUserId, getUserEmail, updateUserLanguage) ~250 lines
- `server/auth-identity.ts` — identity linking (linkDiscord, linkGoogle, unlinkIdentity, getUserIdentities) ~80 lines
- `server/auth-password.ts` — password actions (resetPasswordForEmail, updatePassword, validatePasswordStrength, setPasswordAction) ~80 lines
- All existing imports from `server/auth` continue to work via re-exports

### 4B: Test Coverage

- `tests/redact-pii.test.ts` — maskEmail, maskString, redactUserResponse
- `tests/password-validation.test.ts` — validatePasswordStrength, getPasswordRequirements
- `tests/auth-password-reset.test.ts` — integration test for reset flow
- Update `tests/e2e/auth.spec.ts` for forgot password link

---

## File Change Summary

| File | Change | Layer |
|------|--------|-------|
| `lib/redact-pii.ts` | New — PII redaction utility | 1C, 3A |
| `lib/security/password-validation.ts` | New — shared validation | 2B |
| `app/api/tradovate/token/route.ts` | New — server token proxy | 1A |
| `app/api/rithmic/encryption-key/route.ts` | New — session key derivation | 1B |
| `app/[locale]/(authentication)/reset-password/page.tsx` | New — reset password UI | 2A |
| `app/[locale]/(authentication)/forgot-password/page.tsx` | New — forgot password UI | 2A |
| `server/auth-user.ts` | New — user sync extracted | 4A |
| `server/auth-identity.ts` | New — identity linking extracted | 4A |
| `server/auth-password.ts` | New — password actions | 2A, 4A |
| `tests/redact-pii.test.ts` | New — unit tests | 4B |
| `tests/password-validation.test.ts` | New — unit tests | 4B |
| `tests/auth-password-reset.test.ts` | New — integration tests | 4B |
| `store/tradovate-sync-store.ts` | Major refactor — remove token persistence | 1A, 3C |
| `lib/rithmic-storage.ts` | Modify — session-derived key | 1B |
| `server/auth.ts` | Split + cookie hardening + logger fix | 1D, 2C, 4A |
| `app/[locale]/(authentication)/components/user-auth-form.tsx` | Modify — validation, UX, forgot link | 2A, 2B, 3B |
| `app/[locale]/teams/components/auth-profile-button.tsx` | Modify — mask email | 3A |
| `app/api/admin/reports/route.ts` | Modify — mask emails | 1C |
| `app/api/debug-data/route.ts` | Modify — mask user data | 1C |
| `app/[locale]/dashboard/components/import/etp/etp-sync.tsx` | Modify — token hygiene | 3D |
| `app/[locale]/dashboard/components/import/thor/thor-sync.tsx` | Modify — token hygiene | 3D |
| `tests/e2e/auth.spec.ts` | Modify — forgot password test | 4B |

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Tradovate token migration breaks existing sessions | One-time migration clears localStorage; users re-authenticate |
| Rithmic key derivation changes lock out users | Fallback: if new key fails, attempt legacy key from localStorage before requiring re-entry |
| Cookie hardening breaks Supabase SSR | Test in both dev and production; Supabase SSR supports custom cookie options |
| auth.ts split breaks imports | Re-export all public APIs from original module path |
| Password reset email template not configured | Document Supabase Dashboard configuration step |

## Out of Scope

- MFA implementation (exists in config but deferred)
- Tradovate OAuth state validation (separate concern)
- Rate limiting applied to login form UI (server-side rate limiting already exists)
- Database schema changes
