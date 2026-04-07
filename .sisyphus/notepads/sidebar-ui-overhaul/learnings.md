## [Session Start] Sidebar UI Overhaul Plan

### Context
- 12 tasks across 3 waves + final verification
- Scope: Dashboard, Teams, Admin sidebars + layouts + mobile nav
- Landing sidebar EXCLUDED — do not touch
- Cookie contract (sidebar:state) EXCLUDED — do not change

### Key Conventions
- No `as any` / `@ts-ignore` — ESLint error
- No `console.log` — use `console.warn` / `console.error`
- Semantic tokens only (`--sidebar-*`) — no hardcoded hex
- V2 imports for new work: `@/components/ui/v2`
- Prettier: no semicolons, single quotes, trailing commas, 100 char width
- `use cache` + `cacheLife`/`cacheTag` — not `unstable_cache`
