# store — Zustand Client State

> **Conventions**: See root `./AGENTS.md` for shared rules.

**Scope**: `store/`

## OVERVIEW
29 Zustand stores — client-side state islands for auth, trades, accounts, filters, sync, and UI preferences. NOT persisted to localStorage unless explicitly needed.

## KEY STORES

| Store | Persisted | Purpose |
|-------|-----------|---------|
| `user-store.ts` | Partial | Auth user + `dashboardLayout` |
| `account-store.ts` | Yes | Accounts list |
| `trades-store.ts` | Yes | Trade data |
| `filters/news-filter-store.ts` | Yes | Date/instrument/account filters |
| `modal-state-store.ts` | Yes | Global modal open state |
| `toolbar-settings-store.ts` | Yes | Toolbar preferences |
| `rithmic-sync-store.ts` | No | Rithmic broker sync state |
| `tradovate-sync-store.ts` | No | Tradovate broker sync state |

## CRITICAL SECURITY NOTE

> `dashboardLayout` is **NOT persisted** to localStorage (per 2026-03-13 hardening). Layout state lives in Prisma DB only.

## CONVENTIONS

- Files: kebab-case (`user-store.ts`, `trades-store.ts`)
- Store naming: kebab-case filenames
- State shape: prefer flat over nested
- Use `unknown` not `any` for persisted state migrations

## ANTI-PATTERNS (THIS DIR)

- **Never** persist sensitive user data without encryption
- **Never** use `any` for state types — use specific types
- **Never** create stores for server data — use React Context for server-derived state
