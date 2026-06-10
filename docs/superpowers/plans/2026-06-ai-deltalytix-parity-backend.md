# AI Deltalytix Parity Implementation Plan (Backend Only)

**Date**: 2026-06
**Goal**: Achieve functional parity with Deltalytix AI capabilities (conversational coach, pattern/behavioral analysis, journal insights, intelligent field mapping, tool-based accurate data, vision hints, session memory) using ONLY backend additions/augmentations in qunt-edge. ZERO UI changes, zero impact on existing flows. Use/reuse the already excellent lib/ai/* robustness (policy, guard, telemetry, client pluggable, timeout, safety, cache, budget).

**Source Study (Deltalytix)**: 
- Chat: streamText + rich tools (getJournal, summaries, equity tool, instrument/time perf, prev conv for memory) + composite prompts (base role+dates+TZ, init always fetch data+journal, capabilities image+chart-must-use-tool, style, formatting, tools).
- Mappings: AI (generate/stream object) for arbitrary CSV headers + samples -> fixed Trade fields, positional for dups, context-aware prompt.
- Analysis: dedicated routes for patterns (time-of-day, instrument, accounts, global).
- Journal/mood for psychology.
- Prisma simple Trade + moods/comments.
- Emphasis: data via tools (never halluc numbers), behavioral/psychology focus, multi-turn, image analysis.

**Target Current State (strong base)**:
- Mirrors structure 1:1 in app/api/ai/chat (prompts identical stack + safety), mappings (actually *more robust*: repair pass, quality validation+fallback, full telemetry/cost, per-feature policy, rate+guard+timeout).
- lib/ai/* : client (OpenAI compat + baseURL for OpenRouter/xAI etc, OPENAI fallback), policy, telemetry (usage log), route-guard, timeout, prompt-safety, error-utils, cache, usage-budget, trade-access, get-all-trades, trade-normalization.
- behavior/insights (GET, compute on trades+moods for patterns — rule based, cached).
- JournalEntry rich (preTradeNotes, postTradeReview, emotions, confidence, discipline, customTags, screenshots, session/timeframe), Mood model, Trade comment/tags/images + journal relation, Comment model.
- Tools: get-journal-entries (mood/journalContent), many perf summaries, equity chart tool, prev conv.
- Cron chat-retention (cleanupExpiredChatConversations).
- Analysis routes, format-trades, editor, summarize, support, transcribe, search.
- Imports have ibkr ocr/extract (potential for AI parse).
- Already production hardened (from prior AI fixes).

**Gaps / Work (minimal, backend only)**:
1. Generative Journal Insights endpoint (LLM structured on journal+comments+trades PnL for biases, FOMO, recs) — main missing vs "AI Journal Insights".
2. Ensure coach has complete journal/mindset cross-ref (add/enhance tool if needed for linked trade data + comments).
3. Dedicated or augmented patterns analysis with LLM (or call behavior + enrich).
4. Vision: confirm/ensure image parts pass through chat for vision models (prompt already has capabilities).
5. File parsing bonus: AI assist for non-std (use mappings or add thin parse insight).
6. Minimal integration points:
   - Toggleable hook: in ibkr extract-orders or a shared import util, support ?useAiMapping=true or body flag to suggest mapping via the existing /ai/mappings logic (call the core or internal).
   - Optional "generate insights" on journal persistence (server action or after save hook — non-breaking).
7. Docs: AI_INTEGRATION.md with env, example curls, how to extend, feature flags.
8. Any prompt augments for stronger "use tools only, cross PnL+journal comments for sentiment" (in style or base).
9. If missing, expose analyze-patterns LLM wrapper.

**Constraints (non-negotiable)**:
- No changes under app/[locale]/ or any .tsx components, hooks, pages.
- New files only under app/api/ai/..., lib/ai/..., server/ (minimal), docs/.
- Reuse all existing lib/ai guards, policy("journal-insights"), telemetry, rateLimit patterns exactly (copy style from mappings/route.ts).
- All new endpoints: Zod, user isolation (guardAiRequest or getDatabaseUserId), error structured via apiError, usage logged.
- Token efficient context: fetch limited recent + aggregates, never full dump.
- Pluggable providers already supported — no change.
- CC BY-NC 4.0 respect: reimplement behavior from study, no verbatim copy.
- Production: retries (use existing timeout/retry in lib), cost guard (usage-budget), rate per user.

**Files to Touch / Create (minimal)**:
- New: app/api/ai/journal-insights/route.ts + schema.ts (core new capability).
- New: docs/AI_INTEGRATION.md (or superpowers).
- Augment (small): app/api/ai/chat/prompts/style.ts or base.ts or tools.ts (add stronger behavioral cross-ref instruction if gap).
- Augment (small): app/api/ai/chat/route.ts — ensure getJournalEntries + any new journal tool registered in availableChatTools (if not already).
- Augment (small): app/api/imports/ibkr/extract-orders/route.ts or create thin lib — add optional AI field map step (if flag, call internal mapping logic; fallback to current).
- Optional: lib/ai/prompts/journal-insights.ts or reuse.
- Optional small: if needed, enhance server/journal.ts for richer export (but use prisma direct like behavior does).
- Possibly: app/api/ai/analyze-patterns/route.ts (thin LLM wrapper over behavior or new).
- Test: add or update tests/api/ai-*.test.ts (mocks).

**Implementation Order (per master)**:
1. Core context helpers (reuse/extend lib/ai/trade-access.ts or add getJournalContext).
2. Prompts for journal-insights (structured).
3. journal-insights endpoint (modeled 100% on mappings/route.ts robustness).
4. Wire minimal hooks.
5. Prompt tweaks + tool registration.
6. Docs + verification notes.
7. Run build/typecheck, manual curl tests with mocks.

**Design for journal-insights**:
- Auth: guard or getDatabaseUserId + rate.
- Input: { periodDays?: number, tradeId?: string, accountNumber?: string } Zod.
- Fetch: prisma.trade + journalEntry + comments (limited, with pnl, tags, comment, pre/post, emotions).
- Context builder: compact string or object ( "Trade 2025-.. instrument X side Y qty Z entry A exit B pnl P comment '...' journal pre: '..' post: '..' emotions: 'fear' " ).
- LLM: generateObject with strict Zod schema { 
  overallSentiment: string, 
  recurringBiases: string[], 
  emotionalPatterns: string[], 
  ruleBreaksOrSuccesses: string[], 
  actionableRecommendations: string[], 
  confidence: number 
}.
- Use getAiLanguageModel("journal-insights"), policy, full log/telemetry/timeout/repair if low conf.
- Output + usage.
- Feature in policy.ts .

**Policy addition**: in lib/ai/policy.ts add "journal-insights": { model: ..., temperature: 0.3, ... }.

**Risks/Mitigation**: Existing flows untouched (new routes). If no AI key, checkAiConfig guards. Data isolation via userId filters.

**Verification**:
- curl POST /api/ai/journal-insights with auth simulation + mock data.
- Confirm coach can call journal tools and reason on psychology.
- field-map call from import path (test flag).
- No TS errors, existing tests pass (or new mocks).
- Build succeeds.
- AI_INTEGRATION.md has curls and setup (OPENAI_API_KEY or AI_* equiv, AI_DEFAULT_MODEL).

**Done Criteria**: All 6 capabilities have working backend support with parity behavior, docs, minimal wires, 0 UI diff, production guards.

Use existing patterns. Brutally efficient code. Test before claim complete.
