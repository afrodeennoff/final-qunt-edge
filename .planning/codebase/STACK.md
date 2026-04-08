# Technology Stack

**Analysis Date:** 2026-04-08

## Languages

**Primary:**
- TypeScript 5.9.3 - Full codebase (app, components, server, lib, store)

**Secondary:**
- CSS - Global styles, Tailwind extensions (`app/globals.css`, `styles/tokens.css`)
- MDX - Blog/content pages (via `@next/mdx`, `@mdx-js/loader`)

## Runtime

**Environment:**
- Node.js 20.x (specified in `package.json` engines)
- Bun >=1.3.11 (specified in `package.json` packageManager)

**Package Manager:**
- Bun 1.3.11 (primary, per `packageManager` field)
- npm (fallback, scripts available: `dev:npm`, `build:npm`)
- Lockfile: `bun.lock` (present, 439KB) and `package-lock.json` (present, ~1MB)

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework (App Router)
- React 19.2.1 - UI library
- React DOM 19.2.1

**UI Component System:**
- shadcn/ui (new-york style) - 67+ components in `components/ui/`
- Radix UI primitives - 20+ packages (`@radix-ui/*`)
- Lucide React 0.544.0 - Icon library
- Framer Motion 11.18.2 / Motion 12.38.0 - Animation library
- Sonner 1.7.4 - Toast notifications
- cmdk 1.1.1 - Command palette
- Vaul 1.1.2 - Drawer component

**Data Visualization:**
- Recharts 2.15.4 - Charting library
- D3.js 7.9.0 - Low-level data visualization
- @tanstack/react-table 8.21.3 - Table component
- @tanstack/react-virtual 3.13.23 - Virtualized lists

**Rich Text / Editor:**
- TipTap 3.8.0 (core, react, starter-kit, extensions) - Collaborative rich text editor
- Yjs 13.6.23 + @tiptap/y-tiptap - CRDT for real-time collaboration

**AI / LLM:**
- Vercel AI SDK (`ai` 6.0.31, `@ai-sdk/openai` 3.0.10, `@ai-sdk/react` 3.0.33)
- OpenAI SDK 6.7.0 - Direct OpenAI API access

**Testing:**
- Vitest 2.1.9 - Unit/integration test runner
- Playwright 1.56.1 / @playwright/test 1.58.2 - E2E testing
- @axe-core/playwright 4.11.1 - Accessibility testing

**Build/Dev:**
- TypeScript 5.9.3
- Tailwind CSS 4.1.16 (via `@tailwindcss/postcss`)
- PostCSS 8.5.6
- ESLint 9.39.4 (flat config, `eslint.config.mjs`)
- tsx 4.21.0 - TypeScript execution for scripts

## Key Dependencies

**Critical:**
- `@supabase/ssr` 0.8.0 + `@supabase/supabase-js` 2.93.2 - Authentication and database backend
- `@prisma/client` 7.2.0 + `prisma` 7.3.0 - ORM for PostgreSQL
- `pg` 8.18.0 + `@prisma/adapter-pg` 7.2.0 - Direct PostgreSQL driver
- `stripe` 20.3.0 - Payment processing (legacy/helpers)
- `@whop/sdk` 0.0.23 - Primary billing and subscription management
- `resend` 4.8.0 - Transactional email
- `zod` 4.3.6 - Runtime schema validation
- `zustand` 5.0.8 - Client-side state management
- `@tanstack/react-query` 5.90.21 - Server state management

**Infrastructure:**
- `@vercel/analytics` 1.5.0 - Usage analytics
- `@vercel/speed-insights` 1.2.0 - Performance monitoring
- `pino` 10.3.1 + `pino-pretty` 13.1.3 - Structured logging
- `sharp` 0.33.5 - Image processing
- `next-themes` 0.4.6 - Theme (dark/light mode) management

**Internationalization:**
- `next-international` 1.3.1 - i18n framework (6+ locales)

**Data Import/Export:**
- `xlsx` (exceljs 4.4.0) - Excel export
- `papaparse` 5.5.3 - CSV parsing
- `csv-parse` 5.6.0 - CSV streaming parse
- `pdf2json` 3.2.2 - PDF import (broker statements)
- `jspdf` 4.2.0 - PDF generation
- `html2canvas` 1.4.1 - Screenshot capture

**Drag and Drop:**
- `@dnd-kit/core` 6.3.1 + sortable/modifiers/utilities - Drag-and-drop UI

**Forms:**
- `react-hook-form` 7.65.0 + `@hookform/resolvers` 3.10.0 - Form management

**Date/Time:**
- `date-fns` 3.6.0 + `date-fns-tz` 3.2.0 - Date manipulation
- `chrono` 1.0.5 - Natural language date parsing

**Other Notable:**
- `canvas` 3.2.0 - Server-side canvas (chart rendering)
- `canvas-confetti` 1.9.3 - Confetti animations
- `@octokit/rest` 22.0.1 - GitHub API
- `hotkeys-js` 3.13.15 - Keyboard shortcuts
- `react-grid-layout` 1.5.2 - Dashboard widget layout
- `react-resizable-panels` 2.1.9 - Resizable panel layout
- `react-zoom-pan-pinch` 3.7.0 - Zoomable/pannable views
- `embla-carousel-react` 8.6.0 - Carousel component
- `react-dropzone` 14.3.8 - File upload
- `react-colorful` 5.6.1 - Color picker
- `input-otp` 1.4.2 - OTP input
- `react-day-picker` 9.11.1 - Date picker
- `shiki` 3.13.0 - Syntax highlighting (code blocks)
- `decimal.js` 10.6.0 - Precise decimal arithmetic (financial calculations)
- `nanoid` 5.1.6 - Unique ID generation
- `dompurify` 3.3.1 - HTML sanitization
- `youtube-transcript` 1.2.1 - YouTube video transcript extraction

## Styling

**Approach:**
- Tailwind CSS v4 (via `@tailwindcss/postcss` plugin)
- CSS custom properties (HSL/OKLCH color tokens) defined in `app/globals.css`
- Dark mode: class-based (`darkMode: "class"` in `tailwind.config.ts`)
- Typography plugin: `@tailwindcss/typography`
- Utility libraries: `clsx` 2.1.1, `tailwind-merge` 3.3.1, `class-variance-authority` 0.7.1

**Font Stack (loaded via `next/font/google`):**
- Sans: Geist (primary), DM Sans, Outfit, Poppins, Roboto
- Serif: Cormorant Garamond
- Mono: IBM Plex Mono

**Design Tokens:**
- CSS variables for colors, spacing, transitions, easing
- Fluid typography/spacing via `clamp()` functions
- Custom shadow system (layered, glow, soft, dramatic, inner)
- Custom animation system (spring-based keyframes)

## State Management

**Client State:**
- Zustand 5.0.8 - 25+ stores in `store/` directory
  - Key stores: `user-store.ts`, `chat-store.ts`, `subscription-store.ts`, `analysis-store.ts`
  - Persistence: `zustand/middleware/persist` with `createJSONStorage` (localStorage)
- React Context - Providers in `context/` directory
  - `theme-provider.tsx`, `sync-context.tsx`, `rithmic-sync-context.tsx`, `tradovate-sync-context.tsx`, `data-provider.tsx`

**Server State:**
- TanStack React Query 5.90.21 - Async data fetching and caching
- Prisma 7.2.0 - Database queries (server-side)

**AI Chat State:**
- Vercel AI SDK `UIMessage` type with Zustand (`store/chat-store.ts`)

## Configuration

**Environment:**
- Validated at runtime via Zod schema in `lib/env.ts`
- Feature flags system in `lib/feature-flags.ts` (env-driven rollout)

**Build:**
- `next.config.ts` - delegates to `lib/performance/next-config.ts` for optimized config
- `postcss.config.mjs` - `@tailwindcss/postcss` plugin
- `tsconfig.json` - ES2017 target, bundler module resolution, strict mode
- Path aliases: `@/*` maps to project root, `@lib/*` maps to `./lib/*`

**Linting:**
- ESLint 9.39.4 with flat config (`eslint.config.mjs`)
- Plugins: `eslint-config-next` (core-web-vitals + typescript), `eslint-plugin-react`, `eslint-plugin-react-hooks`
- Key rules: `no-console` error (allow warn/error), `@typescript-eslint/no-explicit-any` error, complexity warn(10)

**Formatting:**
- Prettier (`.prettierrc` present)

## Platform Requirements

**Development:**
- Node.js 20.x or Bun >=1.3.11
- PostgreSQL (local or Supabase)
- Redis (optional, local or Upstash)

**Production:**
- Primary: Vercel (with cron jobs defined in `vercel.json`)
- Alternative: Docker / VPS (Dockerfile, `docker-compose.yml`, PM2 via `ecosystem.config.cjs`)
- Database: Supabase PostgreSQL (pooled connection via port 6543)
- Object storage: Supabase Storage
- Caching: Redis (local or Upstash REST)

**Docker:**
- Multi-stage build (node:20-slim base)
- Standalone Next.js output (~120MB vs ~1GB)
- Native dependencies: python3, make, g++, libcairo2-dev, libpango1.0-dev, libjpeg-dev, libgif-dev, librsvg2-dev (for canvas/sharp)

---

*Stack analysis: 2026-04-08*
