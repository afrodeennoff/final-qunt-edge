# components/ui — Shared UI Component Library

> **Conventions**: See root `./AGENTS.md` + `./lib/AGENTS.md` for shared rules (imports, CSS, TypeScript).

**Scope**: `components/ui/`

## OVERVIEW
56 shadcn/ui + custom shared UI primitives. Design system anchor: monochrome tokens, CVA variants, `cn()` class merger.

## SURFACE SYSTEM

| Component | Purpose |
|-----------|---------|
| `widget-shell.tsx` | Widget card wrapper with header/body/footer slots |
| `chart-surface.tsx` | Chart card with title/empty-state slots, data-chart-surface attributes |
| `stats-card.tsx` | KPI metric card |
| `card.tsx` | Generic card (badge, table variants) |

**Chart layout contract**: Use `data-chart-surface-layout`, `data-chart-surface-header`, `data-chart-surface-body` attributes — NOT child-index selectors. ChartSurface merges caller-provided `components` with default `Chevron` renderer.

## KEY COMPONENTS

| Component | Notes |
|-----------|-------|
| `button.tsx` | CVA variants — primary, destructive, outline, ghost, link |
| `dialog.tsx`, `sheet.tsx`, `drawer.tsx`, `popover.tsx` | Overlay patterns |
| `sidebar.tsx`, `unified-sidebar.tsx` | Navigation shell |
| `badge.tsx` | Status chips — use semantic status-dot classes (`status-dot-live/synced/idle/error`) |
| `table.tsx`, `optimized-table.tsx` | Data tables |
| `calendar.tsx` | react-day-picker wrapper |
| `chart.tsx` | Recharts wrapper |
| `skeleton.tsx` | Loading states — `DashboardHeaderSkeleton`, `WidgetGridSkeleton`, `TableSkeleton`, `AccountsSkeleton` |
| `dropzone.tsx` | File upload — uses `next/image` for previews |
| `optimized-input.tsx` | Input with validation |
| `column-config-dialog.tsx` | Table column customization |
| `input.tsx`, `textarea.tsx`, `select.tsx`, `slider.tsx` | Form primitives |
| `tooltip.tsx`, `alert.tsx`, `tabs.tsx`, `accordion.tsx`, `collapsible.tsx` | UI patterns |
| `icons.tsx` | Lucide icon exports |

## STYLING RULES

- **Color**: Monochrome tokens only. `bg-white/5`, `white/10`, `white/20` for surfaces. Text: `white/90` (primary), `white/50` (secondary).
- **Class merging**: Always use `cn()` from `@/lib/utils`
- **Variants**: Use `class-variance-authority` (CVA) for multi-variant components
- **No raw colors** — semantic tokens only

## ANTI-PATTERNS (THIS DIR)

- **Never** use `blue/red/emerald/rose` Tailwind hues — use monochrome tokens
- **Never** hardcode `bg-white` or `text-white` — use semantic tokens
- **Never** use child-index CSS selectors for chart layout — use `data-*` attributes
- **Never** use `as any` or `@ts-ignore` in shared components

## ICONS

- Lucide React (`lucide-react`)
- Size standard: `size-4` across sidebar
- All icon exports in `icons.tsx`
