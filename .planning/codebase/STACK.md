# Technology Stack

**Analysis Date:** 2026-04-09

## Languages

**Primary:**
- TypeScript 5.9.3 - Entire application source code (strict mode enabled)
- MDX - Blog and content pages (`content/`, `app/[locale]/blogs/`)

**Secondary:**
- SQL - Prisma migrations (`prisma/migrations/`), raw PG queries
- CSS - Global styles (`app/globals.css`), theme tokens (`styles/`)
- JavaScript (MJS) - Build scripts (`scripts/`), PM2 config (`ecosystem.config.cjs`)

## Runtime

**Environment:**
- Node.js 20.x (required by `engines` in `package.json`)
- Bun >= 1.3.11 (alternative runtime, declared as `packageManager`)

**Package Manager:**
- Bun (primary, declared via `"packageManager": "bun@1.3.11"`)
- npm (fallback, `package-lock.json` present)
- Lockfile: `bun.lock` and `package-lock.json` both present

**TypeScript Configuration:**
- Strict mode: **enabled** (`"strict": true`)
- Target: ES2017
- Module: ESNext with bundler resolution
- JSX: react-jsx
- Path aliases: `@/*` maps to project root, `@lib/*` maps to `./lib/*`
- Incremental compilation: disabled (`"incremental": false`)

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework (App Router)
- React 19.2.1 - UI library
- React DOM 19.2.1

**UI Component System:**
- shadcn/ui (new-york style) - Headless component library built on Radix UI
  - Config: `components.json` (RSC enabled, CSS variables, Tailwind)
  - Icon library: Lucide React
  - Components in: `components/ui/`
- Radix UI - Accessible headless primitives (accordion, dialog, dropdown, tabs, toast, tooltip, etc.)
- Framer Motion 11.18.2 + Motion 12.38.0 - Animation library
- Tailwind CSS 4.1.16 - Utility-first CSS framework
  - PostCSS plugin: `@tailwindcss/postcss`
  - Custom config: `tailwind.config.ts` (extensive design system with fluid typography, glassmorphism, spring animations)
  - Typography plugin: `@tailwindcss/typography`

**Styling:**
- Tailwind CSS v4 (utility-first)
- CSS custom properties (design tokens in `app/globals.css`)
- class-variance-authority (CVA) - Component variant management
- clsx + tailwind-merge - Conditional class composition
- Theme system: `next-themes` for dark/light mode, custom CSS tokens in `styles/`
- Fluid typography and spacing scales defined in Tailwind config

**State Management:**
- Zustand 5.0.8 - Client-side stores with persistence middleware
  - Stores in: `store/` (25+ stores for accounts, trading, chat, UI state, etc.)
- @tanstack/react-query 5.90.21 - Server state management and caching

**Forms:**
- React Hook Form 7.65.0 - Form state management
- @hookform/resolvers 3.10.0 - Zod validation integration
- Zod 4.3.6 - Schema validation

**Rich Text:**
- Tiptap 3.8.0 - Rich text editor (collaborative editing via Yjs, tables, images, tasks)
- Yjs 13.6.23 - CRDT for real-time collaboration
- DOMPurify 3.3.1 - HTML sanitization

**Data Visualization:**
- Recharts 2.15.4 - Charts
- D3.js 7.9.0 - Advanced visualizations
- @tanstack/react-table 8.21.3 - Data tables
- @tanstack/react-virtual 3.13.23 - Virtualized lists

**Internationalization:**
- next-international 1.3.1 - i18n framework
  - Locales: en, fr, es, it, hi, ja (in `locales/`)

## Key Dependencies

**AI/ML:**
- `ai` 6.0.31 - Vercel AI SDK (streaming, tool calling)
- `@ai-sdk/openai` 3.0.10 - OpenAI provider for AI SDK
- `@ai-sdk/react` 3.0.33 - React hooks for AI SDK
- `openai` 6.7.0 - OpenAI client

**Payment & Subscriptions:**
- `@whop/sdk` 0.0.23 - Whop payment/checkout SDK
- `stripe` 20.3.0 - Stripe integration (helpers for formatting)

**Database & ORM:**
- `@prisma/client` 7.2.0 - Database ORM client
- `@prisma/adapter-pg` 7.2.0 - PostgreSQL driver adapter for Prisma
- `pg` 8.18.0 - PostgreSQL client (connection pooling)

**Authentication:**
- `@supabase/ssr` 0.8.0 - Supabase SSR auth helpers
- `@supabase/supabase-js` 2.93.2 - Supabase client

**Email:**
- `resend` 4.8.0 - Email sending service
- `@react-email/components` 0.5.7 - Email template components
- `@react-email/render` 1.4.0 - Email rendering

**Storage & Caching:**
- Custom Redis client (`lib/redis-client.ts`) - Supports local Redis TCP + Upstash REST
- In-memory fallback caches with namespace versioning

**Content:**
- `@mdx-js/loader` 3.1.1 + `@mdx-js/react` 3.1.1 - MDX support
- `@next/mdx` 16.0.7 - Next.js MDX integration
- `gray-matter` 4.0.3 - Frontmatter parsing
- `shiki` 3.13.0 - Syntax highlighting

**File Processing:**
- `sharp` 0.33.5 - Image processing
- `canvas` 3.2.0 + `html2canvas` 1.4.1 - Canvas rendering
- `jspdf` 4.2.0 - PDF generation
- `exceljs` 4.4.0 - Excel read/write
- `pdf2json` 3.2.2 - PDF parsing
- `papaparse` 5.5.3 - CSV parsing
- `csv-parse` 5.6.0 - CSV parsing (streaming)

**Drag & Drop:**
- `@dnd-kit/core` 6.3.1 + `@dnd-kit/sortable` 10.0.0 - Drag and drop

**Utilities:**
- `date-fns` 3.6.0 + `date-fns-tz` 3.2.0 - Date manipulation
- `decimal.js` 10.6.0 - Precise decimal math
- `nanoid` 5.1.6 - ID generation
- `zod` 4.3.6 - Schema validation
- `ajv` 8.18.0 - JSON Schema validation

**Observability:**
- `@vercel/analytics` 1.5.0 - Vercel analytics
- `@vercel/speed-insights` 1.2.0 - Vercel Speed Insights
- `pino` 10.3.1 - Structured logging (with `pino-pretty` 13.1.3 for dev)

**Security:**
- Custom rate limiter (`lib/rate-limit.ts`) - In-memory, IP-based
- Custom CSP builder (`lib/security/csp.ts`)

**Other Notable:**
- `react-grid-layout` 1.5.2 - Dashboard widget layout
- `react-resizable-panels` 2.1.9 - Resizable panel layout
- `embla-carousel-react` 8.6.0 - Carousels
- `react-colorful` 5.6.1 - Color picker
- `cmdk` 1.1.1 - Command palette
- `hotkeys-js` 3.13.15 - Keyboard shortcuts
- `sonner` 1.7.4 - Toast notifications
- `vaul` 1.1.2 - Drawer component
- `chrono` 1.0.5 - Natural language date parsing
- `youtube-transcript` 1.2.1 - YouTube transcript fetching
- `@octokit/rest` 22.0.1 - GitHub API client

## Testing

**Unit/Integration:**
- Vitest 2.1.9 - Test runner
  - Config: `vitest.config.ts` (node environment, v8 coverage)
  - Setup: `tests/setup.ts`
  - Path alias: `@` maps to project root
  - Coverage thresholds: 30% lines, 40% functions, 20% branches (per-file)
- jsdom 28.1.0 - DOM simulation for React component tests

**Payment Tests:**
- Vitest 2.1.9 with `@vitejs/plugin-react`
  - Config: `vitest.payment.config.ts` (separate test suite for payment logic)

**E2E:**
- Playwright 1.58.2 - End-to-end testing
  - Config: `playwright.config.ts`
  - Test directory: `tests/e2e/`
  - Browser: Chromium (Desktop Chrome)
  - Base URL: `http://localhost:3000`
  - Screenshots on failure, trace on first retry

**Test Helpers:**
- @axe-core/playwright 4.11.1 - Accessibility testing in E2E

## Build & Dev Tooling

**Build System:**
- Next.js built-in (Turbopack-ready)
- Custom robust build script: `scripts/robust-next-build.mjs`
- Prebuild: `scripts/clean-build-artifacts.mjs` + route generation (`scripts/generate-routes.ts`)
- Max old space: 8192MB (`NODE_OPTIONS=--max-old-space-size=8192`)
- Prisma generate runs on `postinstall`

**Linting:**
- ESLint 9.39.4 with flat config (`eslint.config.mjs`)
- `eslint-config-next` 16.1.6 (core-web-vitals + typescript presets)
- `eslint-plugin-react` + `eslint-plugin-react-hooks`

**Formatting:**
- No standalone formatter config detected (Prettier not in dependencies)

**Performance Scripts:**
- `scripts/perf-lighthouse.mjs` - Lighthouse CI
- `scripts/perf-dashboard-runtime.mjs` - Dashboard runtime perf
- `scripts/analyze-bundle.mjs` - Bundle analysis
- `scripts/check-route-budgets.mjs` - Route size budgets
- `scripts/check-dead-code.mjs` - Dead code detection
- `scripts/check-warning-budget.mjs` - Warning budget enforcement

## Configuration

**Environment:**
- Validated with Zod schema (`lib/env.ts`) - Type-safe env var access
- Key env vars defined and validated (see INTEGRATIONS.md for full list)
- Security env consistency checks (`assertSecurityEnvConsistency`)

**Build:**
- `next.config.ts` - Custom config via `lib/performance/next-config.ts`, MDX integration, URL redirects
- `tailwind.config.ts` - Extensive design system
- `postcss.config.mjs` - `@tailwindcss/postcss` plugin
- `tsconfig.json` - Strict TypeScript with path aliases
- `prisma.config.ts` - Prisma CLI configuration with env-based datasource URL
- `components.json` - shadcn/ui configuration

**Docker:**
- `Dockerfile` - Multi-stage Node.js 20 build (standalone output ~120MB)
- `Dockerfile.bun` - Bun-based Docker build
- `docker-compose.yml` - Local dev (PostgreSQL 16 + Redis 7)
- `docker-compose.prod.yml` - Production compose

**Process Management:**
- `ecosystem.config.cjs` - PM2 configuration (single instance, Bun runtime)

**Platform Configs:**
- `vercel.json` - Vercel deployment config with cron jobs
- `nixpacks.toml` - Nixpacks build configuration (alternative to Docker)

## Platform Requirements

**Development:**
- Node.js 20.x or Bun >= 1.3.11
- PostgreSQL 16 (local dev via Docker)
- Redis 7 (optional, in-memory fallback available)
- Supabase account (for auth)

**Production:**
- Primary: Vercel (configured with `vercel.json`, cron jobs, analytics)
- Alternative: Docker (standalone Node.js), Nixpacks, PM2 (VPS)
- PostgreSQL (Supabase managed preferred)
- Redis (Upstash REST or local Redis)

---

*Stack analysis: 2026-04-09*
