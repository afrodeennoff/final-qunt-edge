# Theme Token Contract

## Purpose
- Define one canonical token source for app theme colors and semantic styling.
- Keep backward compatibility while migrating away from legacy aliases.

## Canonical Source
- Canonical core semantic definitions live in [`app/globals.css`](/Users/timon/Downloads/qunt-edge/app/globals.css) (`:root` and `.dark`).
- Extended marketing/utility tokens live in [`styles/tokens.css`](/Users/timon/Downloads/qunt-edge/styles/tokens.css).
- Keep token ownership clear: do not duplicate core semantic token definitions across both files.

## Canonical Tokens

### Core semantic
- `--background`
- `--foreground`
- `--card`
- `--card-foreground`
- `--popover`
- `--popover-foreground`
- `--primary`
- `--primary-foreground`
- `--secondary`
- `--secondary-foreground`
- `--muted`
- `--muted-foreground`
- `--accent`
- `--accent-foreground`
- `--destructive`
- `--destructive-foreground`
- `--success`
- `--success-foreground`
- `--input`
- `--border`
- `--ring`
- `--radius`

### Sidebar semantic
- `--sidebar-background`
- `--sidebar-foreground`
- `--sidebar-primary`
- `--sidebar-primary-foreground`
- `--sidebar-accent`
- `--sidebar-accent-foreground`
- `--sidebar-border`
- `--sidebar-ring`

### Charts
- `--chart-1` .. `--chart-8`
- `--chart-win`
- `--chart-loss`
- `--chart-grid`
- `--chart-axis`
- `--chart-tooltip`
- `--chart-tooltip-border`

## Tailwind v4 Bridge Rules
- Use `@theme inline` for color tokens only.
- Do not map fonts/radius as `--color-*`.
- Fonts and radius are consumed through existing config paths in [`tailwind.config.ts`](/Users/timon/Downloads/final-qunt-edge-main/tailwind.config.ts):
  - `fontFamily` -> `var(--font-*)`
  - `borderRadius` -> `var(--radius)`

## Backward-Compatibility Aliases
- None active.

## Alias Deprecation Timeline
- Phase A: aliases enabled for safe rollout.
- Phase B: internal references migrated to canonical names.
- Phase C (completed 2026-03-03): legacy alias removed after grep and verification gates.

## Adding New Tokens
1. Add core semantic tokens to `app/globals.css` (`:root` and `.dark`).
2. Add extended/marketing tokens to `styles/tokens.css`.
3. If token is a color used by utilities, add it in `@theme inline` as a color mapping.
4. Update `tailwind.config.ts` only when a new semantic utility name is needed.
5. Avoid redefining core semantic tokens in `styles/tokens.css`.
