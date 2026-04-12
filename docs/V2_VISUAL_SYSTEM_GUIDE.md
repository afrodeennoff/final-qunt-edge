# Obsidian V3 Visual System Guide

## Goal

Qunt Edge Obsidian V3 is a direct-replace visual system for the entire product. It should feel like one premium trading workspace across home, marketing, auth, dashboard, teams, admin, shared reports, and embeds while preserving every existing behavioral contract.

## Compatibility Policy

- No behavior changes.
- No route or query-param breakage.
- No API, Prisma, auth, billing, team-membership, share-link, import, or embed contract changes.
- No store/context/server-action rewrites as part of a visual pass.
- Dark-only remains the product theme.

## Design Language

- Void-first backgrounds using near-black surfaces and layered ambient glow.
- Frosted borders with micro-contrast, not thick panel outlines.
- Electric cobalt as the primary accent, with emerald/crimson/amber semantic states for trading data.
- Typography should feel cinematic but precise:
  - thin-to-medium hero weights
  - uppercase micro-labels for metadata
  - tabular numerics for metrics
- Shell chrome should feel like floating hardware, not stacked dashboard boxes.

## Shell Rules

- Use `qe-v2-app-shell` as the page-level layout hook for app surfaces.
- Use `BackgroundGlow` for ambient treatment instead of route-local gradient noise.
- App headers should read as frosted floating rails:
  - rounded pill or rounded-2xl geometry
  - subtle borders
  - black/translucent surfaces
  - restrained shadow depth
- Keep max content width consistent:
  - app shells: `max-w-[1800px]`
  - marketing/home shells: `max-w-[1320px]` to `max-w-[1360px]`

## Primitive Rules

- Shared shadcn source-owned primitives are the visual source of truth.
- Prefer updating `components/ui/**` over route-local overrides whenever possible.
- Preserve component exports, Radix `data-*` hooks, `aria-*`, and `asChild` patterns.
- Buttons, cards, badges, inputs, dialogs, dropdowns, sidebars, and mobile nav should all read as one family.

## Card Ownership Rules

- Cards are the primary composition primitive.
- Use the shared `Card` primitive or compatible shell surfaces for section framing.
- Dashboard widgets own their own chrome.
- Do not introduce double-framing around widget surfaces in normal mode.
- Shared/public report sections may use cards, but chart/embed/widget internals should not be wrapped in a second heavy bordered panel unless the inner component is transparent.

## Navigation Rules

- Dashboard, teams, admin, and mobile nav must share the same visual rhythm.
- Visible labels may evolve, but technical paths must remain stable.
- Sidebar and bottom nav should feel like the same system:
  - rounded dock behavior
  - low-opacity borders
  - active-state glow/tint
  - compact uppercase metadata
  - high-contrast readable active text

## Motion Rules

- Motion must be presentation-only.
- Respect reduced-motion settings.
- Preferred motion:
  - section reveal
  - staggered card entrances
  - slow ambient SVG/glow movement
  - subtle hover lift
- Avoid:
  - parallax-heavy scenes
  - bouncey interaction language
  - motion that changes layout or business-state timing

## Animated SVG Guidance

- Use low-contrast grid, halo, trajectory, and instrument-panel motifs.
- Keep SVG accents behind content and pointer-events disabled.
- Animate opacity, path length, or slow orbital drift only.
- SVG motion should reinforce the trading-workspace identity, not act as generic decoration.

## Chart And Embed Rules

- Chart surfaces should inherit the Obsidian card language.
- Tooltips, legends, and shells should use the same surface hierarchy as cards.
- Embed charts must preserve:
  - query-param theming
  - chart selection/filtering
  - `postMessage` interoperability

## Implementation Guidance

- Prefer shell/layout upgrades before local page polish.
- Prefer shared primitive upgrades over route-specific hacks.
- When a surface feels outdated, fix the underlying primitive or shell first.
- Avoid reintroducing mixed V1/V2 styling after an Obsidian pass lands.

## Production Readiness Checklist

- `npm run typecheck` passes.
- `npm run build` passes, or any non-code env blocker is explicitly recorded.
- Route groups render with one Obsidian V3 shell language.
- Shared pages and embeds match the core app quality bar.
- No legacy/V1/V2 visual collisions remain in edited surfaces.
- No feature behavior changed during the visual pass.
