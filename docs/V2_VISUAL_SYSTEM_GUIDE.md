# V2 Visual System Guide

## Goal

Qunt Edge V2 is a full visual replacement of the product shell and presentation layer. It must feel like one product across marketing, auth, dashboard, teams, admin, shared pages, and embeds while preserving the existing business behavior.

## Non-Negotiables

- No behavior changes.
- No route or query-param breakage.
- No API, Prisma, auth, billing, team-membership, or import contract changes.
- `NEXT_PUBLIC_UI_V2_ENABLED` remains the rollout flag.
- Dark-only remains the product theme.

## Shell Rules

- Use `qe-v2-app-shell` for page-level surfaces.
- Use `BackgroundGlow` for animated ambient background treatment instead of one-off page gradients.
- Use `MotionSection`, `MotionStagger`, and `MotionStaggerItem` for scroll/entrance motion.
- Keep headers as floating/frosted card rails, not flat bars.
- Keep max content width consistent:
  - app shells: `max-w-[1800px]`
  - marketing shells: `max-w-[1320px]`

## Card Rules

- Cards are the primary composition primitive.
- Use `qe-v2-card` or the shared `Card` primitive for section framing.
- Dashboard widgets own their own chrome.
- Do not introduce double-framing around widget surfaces in normal mode.
- Shared/public report sections may be card-based, but chart/embed/widget internals should not be wrapped in a second heavy bordered frame unless the inner component is transparent.

## Navigation Rules

- Dashboard, teams, admin, and mobile nav should use the same naming tone and visual rhythm.
- Visible labels may evolve for clarity, but technical paths must remain stable.
- Sidebar and bottom nav should feel like the same system:
  - rounded dock behavior
  - subdued borders
  - active state glow/tint
  - restrained uppercase metadata

## Motion Rules

- Motion must be presentation-only.
- Respect reduced-motion settings.
- Prefer:
  - section reveal
  - staggered card entrances
  - slow ambient SVG motion
  - subtle hover lift
- Avoid:
  - large parallax
  - aggressive bouncing
  - motion that changes layout behavior

## Animated SVG Guidance

- Use low-contrast blueprint/grid/trajectory motifs.
- Keep SVG accents behind content and pointer-events disabled.
- Animate opacity, path length, or slow orbital rotation only.
- SVG motion should reinforce the trading-workspace identity, not look decorative for its own sake.

## Chart Rules

- Chart surfaces should inherit the V2 card language.
- Tooltips, legends, and shells should use the same surface hierarchy as cards.
- Embed charts should keep behavior contracts unchanged:
  - query-param theming
  - chart filtering
  - `postMessage` interop

## Migration Rules

- New UI work must use the V2 primitives and shell patterns first.
- Prefer upgrading shared primitives over styling one page in isolation.
- If a route group still uses legacy styling, migrate via shell/layout first, then feature surfaces.
- When in doubt, fix the shared primitive instead of patching a local one-off variant.

## Production Readiness Checklist

- `npm run typecheck` passes.
- Route groups render with V2 shell rhythm.
- Shared pages and embeds match app styling quality.
- No legacy/V2 collisions remain in the edited surface.
- No feature behavior changed during the visual pass.
