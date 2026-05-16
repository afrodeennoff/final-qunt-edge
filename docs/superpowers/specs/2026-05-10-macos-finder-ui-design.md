# macOS Finder–Inspired Dark UI — Design Spec

**Date:** 2026-05-10  
**Status:** User-approved direction  
**Nature of work:** Visual-only redesign. **No behavioral, data, routing, or API changes.**

## Summary

This spec defines a **system-wide visual direction** aligned with a **macOS Finder–like** dark interface: a clear **left sidebar**, **muted list/table rows**, **hairline separators**, and **calm information density**. The product remains **dark-only** (no light mode). Layering and hierarchy are achieved with **solid, semi-opaque surfaces**—not blur or vibrancy—consistent with the project’s scroll and GPU performance policy. **Accent usage stays mostly monochrome** (graphite/slate) for structure and interactive chrome; **semantic color is reserved** for destructive and success states, with **PnL-appropriate green/red** allowed in charts and tables where data meaning requires it, without loud global accent treatments.

Execution follows a **token-first, primitive-first** rollout: establish semantic tokens in global styles and Tailwind, then update shared primitives in `components/ui`, navigation shells, `WidgetShell`, and other layout shells. Route-local styling is a **last resort** for consistency, not the primary strategy.

## Principles

1. **Visual parity with behavior** — Every change is presentation-only. Interaction models, data contracts, and navigation stay identical unless explicitly rescoped in a separate initiative.
2. **Finder-like clarity** — Sidebar as persistent wayfinding; content as subdued rows and panels; separation via thin borders and tonal steps, not heavy chrome.
3. **Solid layering** — Use stepped backgrounds, borders, and inset highlights. **Do not** use `backdrop-blur` or blur-driven “vibrancy” to imply depth.
4. **Dark-only** — One theme surface; no dual-theme maintenance or light-mode tokens in this effort.
5. **Restrained color** — Structure and controls read in **graphite/slate neutrals**. Destructive and success keep dedicated hues. Trading **PnL semantics** (green/red) appear where the user expects financial encoding, scoped to data surfaces—not global marketing accents.
6. **Performance-safe motion** — Prefer short, **restrained spring** curves (e.g. project spring ease `[0.22, 1, 0.36, 1]`). **No** blur-based entrances. Respect **`prefers-reduced-motion`**. **No** `transition-all`; **no** infinite or decorative motion in interactive components (per `AGENTS.md`).

## Token & surface model (conceptual)

- **Canvas** — Deepest background; near-black, low chroma (Finder-like void).
- **Raised surfaces** — Sidebar, panels, and cards step up one or two tonal levels using **solid** fills (opacity or OKLCH mixes), not glass.
- **Rows & lists** — Default row fill is muted; hover/selected states are **subtle tonal shifts** or **hairline** emphasis, avoiding heavy shadows on scroll paths.
- **Separators** — **Hairline** borders (single-pixel logical weight) between sections, list rows, and sidebar groups; rely on semantic border tokens.
- **Interactive chrome** — Buttons, inputs, and focus rings use **monochrome** structure; destructive/success pull from reserved semantic tokens.
- **Data semantics** — Chart series, table cells, and badges may use **PnL green/red** (and related variants) where they encode profit/loss or outcome; avoid painting entire shells in accent color.

Concrete token names and values are defined during implementation in `globals.css` / Tailwind theme extensions; this document stays **conceptual** so engineering can map to the existing Obsidian/cobalt baseline without prescribing hex-level renames here.

## Component strategy

1. **Globals & Tailwind** — Introduce or refine semantic tokens (background ladder, border, foreground, muted text, row hover/selected, sidebar-specific aliases). Ensure utilities favor **opacity- and color-token** composition over ad-hoc arbitrary values.
2. **`components/ui` primitives** — Card, Button, Input, Tabs, Dialog, Sheet, Popover, Table patterns, etc. inherit the new ladder so most routes get the look automatically.
3. **Navigation & shells** — **Sidebar** (dashboard, teams, admin as applicable), **dashboard header**, and **WidgetShell** / chart shells align with Finder-like density and separators.
4. **Stragglers** — Marketing, auth, admin, and teams pages are swept **after** core product surfaces so they consume the same primitives rather than bespoke styling.

## Phasing & milestones

| Phase | Focus | Outcome |
|-------|--------|---------|
| **1** | Tokens + base layout primitives | Semantic surface/border/text tokens and shared layout primitives updated; new visuals compose without per-page hacks. |
| **2** | Sidebar + dashboard shell + widgets | Finder-like sidebar, dashboard chrome, and widget/grid shells match the system; charts/tables use updated shells and row treatments. |
| **3** | Marketing, auth, admin, teams | Remaining surfaces brought onto the same tokens and primitives; inconsistencies from legacy passes eliminated. |

## Success criteria (Phase 1 complete)

Phase 1 is **done** when all of the following are true:

- **Token layer** — Documented semantic tokens exist for canvas, elevated surfaces, borders, primary/muted foreground, row states, and sidebar-specific roles; Tailwind (or CSS variables) exposes them for components.
- **Primitive coverage** — Core `components/ui` building blocks default to the new ladder and hairline separators where appropriate; no reliance on `backdrop-blur` or blur-based entrance motion.
- **Layout sanity** — A minimal dashboard layout using only primitives demonstrates **Finder-like** density (sidebar + content) without route-specific overrides.
- **Verification** — `npm run typecheck` and `npm run lint` pass; visual review confirms **dark-only**, **solid** layering, and **no** new interactive behavior.

## Risks & constraints

- **Blur ban** — Any design that depends on frosted glass must be translated to **solid** fills and borders; performance policy is non-negotiable.
- **Dark-only** — Scope explicitly excludes light mode; tokens should not assume a future light palette unless a separate product decision is made.
- **Scope creep** — “While we’re here” auth, API, or feature work is out of scope and risks regressions; keep changes **visual-only**.
- **Semantic color discipline** — Overusing PnL red/green outside data contexts will fight the **monochrome chrome** goal; keep accents **local** to financial semantics.

## Non-goals

- No changes to **authentication**, **authorization**, or **session** behavior.
- No **data model**, **server action**, or **API** contract changes.
- No **routing** or **feature** additions; no new user-facing capabilities beyond **how things look**.

## Open items

None. Follow-up decisions (exact OKLCH values, token naming, and component-by-component acceptance) belong in implementation tasks and design QA, not as unresolved spec gaps.
