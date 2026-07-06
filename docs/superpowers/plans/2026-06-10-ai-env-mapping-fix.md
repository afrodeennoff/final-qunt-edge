# AI Env Mapping Fix Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ] `) syntax for tracking.

**Goal:** Make all AI baseURL/model/apiKey env var reads go through the centralized Zod `getEnv()` instead of raw `process.env` — consistent, validated, traceable.

**Architecture:** 1 central env schema (`lib/env.ts`), 1 central AI client (`lib/ai/client.ts`), 1 central policy resolver (`lib/ai/policy.ts`). All three already exist — just need to wire routes and client to use them consistently.

**Tech Stack:** Next.js, Zod, @ai-sdk/openai, vitest

---

### Task 1: Fix `lib/ai/client.ts` to use `getEnv()` instead of `process.env`

**Files:**
- Modify: `lib/ai/client.ts`

- [ ] **Step 1: Read current file**

- [ ] **Step 2: Replace `process.env.AI_BASE_URL` with `getEnv().AI_BASE_URL`**
  - Line 7: `const baseURL = process.env.AI_BASE_URL || "https://openrouter.ai/api/v1";`
  - Change to: `const baseURL = getEnv().AI_BASE_URL || "https://openrouter.ai/api/v1";`
  - Import `getEnv` from `@/lib/env`

- [ ] **Step 3: Replace `process.env.OPENROUTER_API_KEY` with `getEnv().OPENROUTER_API_KEY`**
  - Line 8: `const aiApiKey = process.env.OPENROUTER_API_KEY;`
  - Change to: `const aiApiKey = getEnv().OPENROUTER_API_KEY;`

- [ ] **Step 4: Replace `process.env.NEXT_PUBLIC_APP_URL` with `getEnv().NEXT_PUBLIC_APP_URL`**
  - Line 41: `"HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://quntedge.com",`

- [ ] **Step 5: Replace `process.env.OPENROUTER_API_KEY` and `process.env.AI_BASE_URL` in `validateAiConfig`**
  - Lines 76-86: Change from `process.env` to `getEnv()`
  - Also replace `process.env.NODE_ENV` (line 76) — actually keep NODE_ENV as-is since it's not in Zod schema (it's a Next.js built-in)

- [ ] **Step 6: Run tests to verify**

  Run: `npx vitest run --config vitest.config.ts`

  Expected: All 517 tests pass (0 failures)

- [ ] **Step 7: Commit**

  ```bash
  git add lib/ai/client.ts
  git commit -m "fix(ai): use getEnv() in client.ts for baseURL/apiKey"
  ```

---

### Task 2: Normalize all route OPENROUTER_API_KEY checks through `getEnv()`

**Files:**
- Modify: `app/api/ai/support/route.ts`
- Modify: `app/api/ai/chat/route.ts`
- Modify: `app/api/ai/mappings/route.ts`
- Modify: `app/api/ai/format-trades/route.ts`
- Modify: `app/api/ai/search/date/route.ts`
- Modify: `app/api/ai/analyze/route.ts`
- Modify: `app/api/ai/analysis/time-of-day/route.ts`
- Modify: `app/api/ai/analysis/global/route.ts`
- Modify: `app/api/ai/editor/route.ts`
- Modify: `app/api/ai/summarize/route.ts`
- Modify: `app/api/ai/analysis/accounts/route.ts`
- Modify: `app/api/ai/analysis/instrument/route.ts`

- [ ] **Step 1: Create a shared helper for AI API key check**

  In each route, add import of `getEnv` from `@/lib/env` and use `getEnv().OPENROUTER_API_KEY` instead of `process.env.OPENROUTER_API_KEY`.

  Pattern to apply in every route:
  ```typescript
  // BEFORE:
  const aiApiKey = process.env.OPENROUTER_API_KEY;

  // AFTER:
  const aiApiKey = getEnv().OPENROUTER_API_KEY;
  ```

- [ ] **Step 2: Apply the fix to support/route.ts**

- [ ] **Step 3: Apply the fix to chat/route.ts**

- [ ] **Step 4: Apply the fix to mappings/route.ts**

- [ ] **Step 5: Apply the fix to format-trades/route.ts**

- [ ] **Step 6: Apply the fix to search/date/route.ts**

- [ ] **Step 7: Apply the fix to analyze/route.ts**

- [ ] **Step 8: Apply the fix to analysis/time-of-day/route.ts**

- [ ] **Step 9: Apply the fix to analysis/global/route.ts**

- [ ] **Step 10: Apply the fix to editor/route.ts**

- [ ] **Step 11: Apply the fix to summarize/route.ts**

- [ ] **Step 12: Apply the fix to analysis/accounts/route.ts**

- [ ] **Step 13: Apply the fix to analysis/instrument/route.ts**

- [ ] **Step 14: Run tests**

  Run: `npx vitest run --config vitest.config.ts`

- [ ] **Step 15: Commit**

  ```bash
  git add app/api/ai/
  git commit -m "fix(ai): normalize OPENROUTER_API_KEY reads via getEnv() in all routes"
  ```

---

### Task 3: Fix transcribe/route.ts to use `getEnv()` and fix env files

**Files:**
- Modify: `app/api/ai/transcribe/route.ts`
- Modify: `.env.local`
- Modify: `.env.vercel.production`
- Modify: `.env.example`

- [ ] **Step 1: Fix transcribe/route.ts**
  - Import `getEnv` from `@/lib/env`
  - Replace `process.env.OPENAI_API_KEY` with `getEnv().OPENAI_API_KEY`
  - Replace `process.env.AI_TRANSCRIBE_BASE_URL` with `getEnv().AI_TRANSCRIBE_BASE_URL`

- [ ] **Step 2: Remove dead AI_ROUTER_* from `.env.local`**
  Remove these lines:
  ```
  AI_ROUTER_ENABLED=false
  AI_ROUTER_PROVIDER_ORDER=openrouter
  AI_ROUTER_MAX_PRICE_INPUT=0.05
  AI_ROUTER_MAX_PRICE_OUTPUT=0.05
  AI_ROUTER_BYOK_FREE_MODELS=
  AI_ROUTER_MODEL_FREE=openrouter/free
  AI_ROUTER_MODEL_AUTO=openrouter/auto
  AI_ROUTER_MODEL_LIQUID=Liquid/lfm2-8b-a1b
  AI_ROUTER_LIQUID_MODEL=Liquid/lfm2-8b-a1b
  ```

- [ ] **Step 3: Fix `.env.vercel.production` escaping**
  Remove trailing `\n` from each value. Currently: `"gemma4:latest-cloud\n"` → `"gemma4:latest-cloud"`

- [ ] **Step 4: Run tests**

  Run: `npx vitest run --config vitest.config.ts`

- [ ] **Step 5: Commit**

  ```bash
  git add app/api/ai/transcribe/route.ts .env.local .env.vercel.production
  git commit -m "fix(ai): transcribe route getEnv(), clean dead AI_ROUTER_ vars, fix env escaping"
  ```

---

### Task 4: Final verification

- [ ] **Step 1: Run full test suite**

  Run: `npx vitest run --config vitest.config.ts`

  Expected: 517 passed, 0 failures

- [ ] **Step 2: Check no remaining raw `process.env.OPENROUTER_API_KEY` or similar in source**

  Run: `rg 'process\.env\.(OPENROUTER_API_KEY|OPENAI_API_KEY|AI_BASE_URL|AI_MODEL|AI_TRANSCRIBE_BASE_URL)' --include='*.ts' --include='*.tsx' lib/ app/ server/ 2>/dev/null`

  Expected: Only `lib/env.ts` should remain (the schema definition itself)
