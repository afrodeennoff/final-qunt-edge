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
