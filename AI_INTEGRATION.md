# AI Integration (Deltalytix Parity - Backend Only)

This documents the backend AI capabilities ported/augmented for functional parity with Deltalytix (https://github.com/hugodemenez/deltalytix), strictly following the master prompt: **ZERO UI changes**, only AI logic + minimal integration tweaks.

## Current State & Capabilities Implemented/Enhanced

The target already had a very strong foundation mirroring Deltalytix (chat with tool-calling, rich prompts for psychology coach, mappings with AI + validation/repair/fallback, analysis routes, behavior insights, lib/ai with pluggable client/policy/telemetry/guards/timeout/safety/budget, journal schema with pre/post/emotions, chat retention cron).

**Completed in this work (for full parity):**

1. **AI Trading Coach (Conversational)**: Enhanced by registering `getJournalEntries` tool (was present in files/prompts but not wired in route) and allowing it for "coaching" intent. Coach now has full access to journal/mood + performance data via tools (no hallucinated numbers — always tool-backed). Supports multi-turn, previous conversation memory, equity via tool, etc. Prompts emphasize behavioral cross-ref of journal comments + PnL.

2. **Pattern Recognition & Behavioral/Sentiment Analysis**: 
   - Existing `behavior/insights` (compute + cached on trades + moods).
   - New `POST /api/ai/analyze-patterns` : LLM-generated narrative + top correlations (time/instrument/tag/emotion vs PnL) using compact data. Complements existing analysis/* routes.

3. **AI Journal Insights / Automated Journaling Support**:
   - New `POST /api/ai/journal-insights` (core addition).
   - Fetches trades + linked JournalEntry (preTradeNotes, postTradeReview, emotions, confidence, discipline) + Moods + comments/tags/PnL.
   - Structured LLM output (Zod): summary, keyBiases, emotionalPatterns, disciplineInsights, recurringMistakes, actionableRecommendations, confidence, dataPointsAnalyzed.
   - Token-efficient context (capped samples + summaries). Evidence-based, cross-refs journal with actual outcomes.
   - Full robustness: policy, guard/rate-limit, telemetry/cost, timeout, repairable errors, user isolation.

4. **Intelligent Field Mapping for Imports**: Already excellent (better than source example): `POST /api/ai/mappings` with generateObject + Zod, positional duplicate handling, sample data validation, quality score + warnings, AI repair pass if low confidence, deterministic fallback, full logging/telemetry/guard/timeout. Universal broker CSV support.

5. **AI-Powered File Parsing/Insights**: Supported via `mappings` + `format-trades` + existing IBKR ocr/extract. Can be extended for non-standard (vision in coach for screenshots/charts via capabilities prompt + vision models).

6. **Supporting**:
   - Tool calling everywhere for accurate live stats (trades, journal, metrics, equity generation backend).
   - On-demand structured performance data (tools return JSON for frontend plotting later).
   - Session/context memory: getPreviousConversation tool + cron/chat-retention.
   - Image/vision: Prompt capabilities for chart/screenshot analysis (when messages include images; uses compatible vision model via pluggable client).
   - Pluggable providers: lib/ai/client.ts supports OPENAI_API_KEY fallback, AI_PROVIDER_BASE_URL + key for OpenRouter, xAI Grok (OpenAI compat), etc.

## Setup / Configuration

Required env (in .env or Vercel):

- `AI_PROVIDER_API_KEY` (or legacy `OPENAI_API_KEY` / `OPENROUTER_API_KEY`) — required.
- `AI_DEFAULT_MODEL` (e.g. "gpt-4o-mini" or "anthropic/claude-3-haiku" via OpenRouter base).
- Optional per-feature: `AI_MODEL_CHAT`, `AI_MODEL_JOURNAL_INSIGHTS`, `AI_ANALYTICS_MODEL`, `AI_PROVIDER_BASE_URL`, `AI_TIMEOUT_MS`, etc.
- Feature flags not strictly needed (policy-driven); disable by not calling or removing from policy.

See lib/ai/client.ts, policy.ts, route-guard.ts for details.

Policy now includes: "journal-insights", "analyze-patterns" (added for this parity).

## Endpoints (Backend Only)

All under `app/api/ai/` , protected by guardAiRequest (user auth + rate limits per feature), return structured errors.

- `POST /api/ai/mappings` — Intelligent CSV column mapping (existing, enhanced parity).
- `POST /api/ai/journal-insights` — Generative journal + trade psychology insights (new).
- `POST /api/ai/analyze-patterns` — LLM narrative patterns (new).
- `POST /api/ai/chat` — Main coach (enhanced with journal tool).
- Existing: /analyze/* , /behavior/insights (GET compute), /format-trades, /summarize, etc.

Example curl (with auth cookie or token as per your app):

```bash
curl -X POST https://your-app.vercel.app/api/ai/journal-insights \
  -H "Content-Type: application/json" \
  -d '{"periodDays": 30}'
```

Returns JSON with insights + confidence.

Similar for others. Coach uses Vercel AI SDK streaming (UIMessageStream).

## Minimal Integration Points (Tweaks Only)

- **Field mapper hook**: The /api/ai/mappings is the intelligent field-mapper. Call it from any backend import service (e.g. IBKR extract, Tradovate/DxFeed sync processing, or a new CSV importer). Toggleable via request param or env (e.g. `if (useAiMapping) { const map = await fetch('/api/ai/mappings', ...).then... }`). Example extension point in `app/api/imports/ibkr/extract-orders/route.ts` or `app/api/ai/format-trades/route.ts` (add optional `aiColumnMapping: true` to request and merge suggestions before formatting).
- **Journal insights trigger**: Call `/api/ai/journal-insights` from journal save paths in server code (e.g. after prisma.journalEntry.create or in dashboard/journal/[id] server action) if `autoInsights: true` in user prefs or env. Store result or return for later display (no UI change here).
- No other refactors. Existing flows untouched.

See the plan file `docs/superpowers/plans/2026-06-ai-deltalytix-parity-backend.md` for full details and next steps.

## Robustness (Already in Place + Extended)

- Per-feature policy (model, temp, timeout, log sample).
- Rate limiting + user budget guards.
- Telemetry (usage, cost, latency, errors) via lib/ai/telemetry.
- Structured outputs (Zod + generateObject).
- Timeouts, retries via signals.
- Error categorization, safe logging (no data leak).
- Token-efficient contexts, caps on fetches.
- Pluggable LLM (OpenAI SDK compat baseURL).

## Verification & Testing

- TypeScript: `npx tsc --noEmit` (or your build).
- Manual: Use the endpoints with real or seed data (ensure userId isolation).
- Coach: Test multi-turn questions about "my FOMO on losing days" or "journal patterns this week" — must use tools for numbers.
- Journal insights: Should produce evidence-based recs tied to actual PnL + notes.
- No hallucinations: All numeric/perf data comes from DB via tools.
- Existing tests in `tests/api/ai-*.test.ts` and `lib/__tests__` should continue to pass (mocks updated if needed for new features).
- Deployed to prod via Vercel (direct CLI or git on v3).

## Extending

- Add new tool: create in `app/api/ai/chat/tools/`, register in route + policy if needed.
- New feature: add to AiFeature in policy.ts, create prompt if complex, implement route using the shared guards/telemetry.
- Prompts: edit `app/api/ai/chat/prompts/*.ts` (style, initialization, capabilities for vision/journal emphasis).
- Data layer: extend in `server/journal.ts`, `lib/ai/trade-access.ts`, or direct prisma in new routes (keep efficient).

Built for production trading journal (prop firms, scalping/ICT, heavy journaling). Matches Deltalytix spirit: data-obsessed, psychology-focused, actionable.

For questions or to continue implementation, refer to the plan doc.