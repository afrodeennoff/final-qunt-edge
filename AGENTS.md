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
