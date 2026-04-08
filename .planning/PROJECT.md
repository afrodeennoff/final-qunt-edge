# Project: Qunt Edge

## What This Is

Qunt Edge is an open-source trading analytics platform for professional futures and prop-firm traders. It enables traders to import trades from multiple platforms (Rithmic, Tradovate, MT5, ATAS, NinjaTrader, Quantower, TradeZella), analyze performance with AI-powered insights, manage subscriptions, and collaborate in teams.

## Core Value

**One place to track, analyze, and improve trading performance** — traders shouldn't need 5 different tools to understand their edge.

## Current State

- **Branch**: v2 — active development
- **Stack**: Next.js 16, React 19, Tailwind CSS, shadcn/ui, Prisma 7, Supabase, Zustand
- **Deployment**: Vercel (production)
- **Codebase Map**: Available at `.planning/codebase/` (7 analysis documents, 2113 lines)
- **i18n**: 11 locales (en, fr, hi, ja, es, it, de, pt, vi, zh, yo)
- **Build Status**: Passing (29 TypeScript errors fixed, deployed 2026-04-08)

## Context

The v2 branch is the active development branch. Recent work focused on:
- Landing page UI refresh with frost/terminal styling
- Bug fixes (recharts imports, i18n migration, type safety)
- Codebase mapping and build stabilization

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 16 with App Router | File-system routing, server components, cache components | — Active |
| Supabase for auth + DB | Managed auth, PostgreSQL, real-time, storage | — Active |
| Whop for billing | Subscription management, checkout, webhooks | — Active |
| OpenRouter for AI | Multi-model routing, cost control | — Active |
| Zustand for client state | Lightweight, no boilerplate | — Active |

## Constraints

- Node.js 20.x (required by package.json engines)
- Vercel deployment (serverless functions, edge runtime)
- Supabase PostgreSQL (managed database)
- TypeScript strict mode (all errors must be resolved for build)

## Out of Scope

- Mobile native apps — web-only for now
- Custom trading platform integrations beyond the 8+ already supported
- Real-time trading/signal execution — analytics only

---

*Last updated: 2026-04-08 after initialization*
