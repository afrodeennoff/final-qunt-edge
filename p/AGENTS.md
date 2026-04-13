# Project Conventions & Patterns

## Performance Rules (Enforced)
- No `repeat: Infinity` in interactive components (loading states OK)
- No `filter:blur()` in any animation
- No `backdrop-blur-*` anywhere (replaced with solid semi-transparent bg)
- No `transition-all` in UI/dashboard (use `transition-[opacity,background-color,border-color]`)
- No cursor-tracking `onMouseMove` handlers for visual effects
- No hover shadow/gradient on scroll-path components (widget-shell, chart-surface)
- `content-visibility: auto` on all `<section>` elements via CSS
- `contain: layout style paint` on `.react-grid-layout`

## Color System
- Surfaces: `oklch(0.65 0.22 260 / 0.03-0.08)` (cobalt tint) — NOT `bg-white/[0.02-0.06]`
- Borders: `oklch(0.65 0.22 260 / 0.08)` — NOT `border-white/[0.06]`
- Inset highlights: `oklch(0.65 0.22 260 / 0.06-0.08)` — NOT `rgba(255,255,255,0.04)`
- Scrollbar: cobalt tinted
- Selection: cobalt highlight
- Focus rings: cobalt

## Script Safety
- ALWAYS commit before running any bulk-modification script
- NEVER use regex to modify JSX className strings — use Python `.replace()` or AST
- NEVER use `sed '/pattern/d'` on lines that contain multi-line cn() arguments
- Use `git show COMMIT:path > path` for targeted file restore

## Component Patterns
- MagneticButton: static (no cursor tracking). Has whileHover scale only.
- InteractiveWrapper: magnetic mode disabled (no position tracking). Draggable still works.
- FloatingOrbs: static positions (no animation)
- BackgroundGlow: static gradient orbs (no motion)
- Hero entrance: opacity + y only (no blur)
- Dashboard navbar: `bg-background/95` (no backdrop-filter)
