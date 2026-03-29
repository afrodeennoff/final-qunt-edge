# AI Agent Configuration

This project uses AI agents for development assistance. For technical context and engineering decisions, see:

- **[ENGINEERING_LOG.md](./ENGINEERING_LOG.md)** — Comprehensive engineering changelog with architectural decisions, bug fixes, and feature implementations

## Quick Reference

- **Stack**: Next.js 15, React 19, TypeScript, Prisma, Supabase, Tailwind CSS
- **AI Integration**: OpenAI SDK with OpenRouter fallback for cost optimization
- **Database**: PostgreSQL via Supabase
- **Auth**: Supabase Auth (Discord, Google OAuth)

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript
npm run test         # Run tests
```

## Workflow Notes

- **Cache components**: server read helpers should use `use cache` with `cacheLife`/`cacheTag`, and mutations should invalidate with `updateTag`. Avoid reintroducing `unstable_cache` or `revalidateTag` in new code.
- **Route config with cache components**: when cache components are enabled, do not add route segment exports like `dynamic` or `revalidate` in `app/**/route.ts`; Next.js rejects them at build time.
- **Support models**: keep the support UI and `/api/ai/support` allowlist in sync via `lib/ai/support-models.ts`.
- **Build prerequisite**: `npm run build` invokes Prisma migration status against a local PostgreSQL URL (`localhost:5432` by default). If that service is unavailable, record the environment blocker before treating the failure as a code regression.
- **Proxy build race**: keep request interception in `proxy.ts`. If build fails with `.next/server/proxy.js` ENOENT during finalize/trace, treat it as a transient artifact race and use `scripts/robust-next-build.mjs` retries instead of migrating file conventions.
- **Deals data truthfulness**: in deals/catalogue server paths, do not synthesize fallback financial/profile metrics when DB is unavailable; return explicit empty/unavailable data instead.
- **Deals API auth**: all `/api/deals/**` handlers must enforce route-level auth (session/JWT verification in handler), not only middleware checks.
- **Proxy API classification**: classify public APIs via `isPublicApiRoute`; keep public cache headers limited to explicit read-safe paths in `PUBLIC_READ_API_PATHS`.
- **Marketing prerender safety**: server read helpers used by shared marketing layout surfaces (for example `server/prop-firms.ts` used by rolling banner/layout shell) must fail-soft on Prisma schema/connection mismatch and connection timeout errors, and should use schema-mismatch cooldown fallbacks where possible to avoid repeated failing DB attempts during static generation.

## Design System Architecture

### CSS Token Tiers

| Tier | Tokens | Usage | Example |
|---|---|---|---|
| **Semantic** | `--primary`, `--secondary`, `--foreground`, `--border`, `--card`, etc. | Dashboard, admin, business surfaces | `bg-primary`, `text-foreground` |
| **Marketing** | `--mk-bg-0`, `--mk-bg-1`, `--mk-surface`, `--mk-border`, `--mk-text`, etc. | Landing/home/marketing pages | `bg-[hsl(var(--mk-surface)/0.7)]` |
| **Chart** | `--chart-win`, `--chart-6`, `--chart-tooltip`, etc. | Data visualization only | `bg-[hsl(var(--chart-win))]` |

### Component Versions

- **V2 components** (`CardV2`, `ButtonV2`, `BadgeV2`, `InputV2`, `TextareaV2`): Primary UI components in `components/ui/v2/`. Use these for all new work.
- **V1 components** (`Card`, `Button`, `Badge`): Legacy. Existing code may use these.

### Styling Rules

1. **No hardcoded hex colors** in TSX/TS files — use semantic tokens or CSS variable functions
2. **No arbitrary border-radius** (`rounded-[Npx]`, `rounded-[Nrem]`) — use Tailwind scale: `rounded-2xl` (16px), `rounded-xl` (12px), `rounded-3xl` (24px), `rounded-sm` (6px), `rounded-lg` (8px)
3. **Use semantic tokens** for application surfaces: `bg-primary`, `bg-card`, `text-foreground`, `border-border/60`, `text-muted-foreground`
4. **Use `--mk-*` tokens** for marketing/landing surfaces (these have no semantic aliases — do NOT replace with primary/secondary tokens)
5. **Use opacity modifiers** on semantic tokens: `bg-primary/10` not `bg-[hsl(var(--primary)/0.08)]`
