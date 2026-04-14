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
- Base shell: clean black canvas with restrained champagne-gold and copper atmosphere
- Shared accent tokens should come from `app/globals.css` and `styles/tokens.css`, not page-local one-offs
- Surfaces: warm black with subtle gold/copper tinting — avoid both raw `bg-white/[...]` and old cobalt-heavy fills
- Borders and inset highlights: warm gold/copper low-opacity values, not blue/cobalt lines
- Scrollbar: warm gold tinted
- Selection: warm gold highlight
- Focus rings: warm gold
- Public-facing shells should stay black-first. Do not reintroduce cobalt/emerald page-scale gradients unless the user explicitly asks for them.
- For app-wide color passes, update shared primitives first: `button.tsx`, `card.tsx`, `badge.tsx`, `input.tsx`, `tabs.tsx`, `widget-shell.tsx`, `chart-surface.tsx`, sidebar chrome, and shell wrappers.

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

## Sidebar Rules
- 5 groups: Overview, Analysis, Profile & Social, Resources, System
- NO visible group headers — flat list with thin separator lines between groups
- Every nav item must have a unique icon
- Import page must be linked in sidebar

## Spacing System
- All home/landing page sections: `py-24`
- Hero: `pb-32 pt-[88px]` (special)
- Small inline sections (filters, cards): variable — OK
- No empty `className=""` — remove the attribute entirely

## Public UI Architecture
- Home route `app/[locale]/(home)/page.tsx` is a dedicated long-form marketing page composed in `app/[locale]/(home)/components/HomeContent.tsx`.
- Home and landing routes both share `app/[locale]/(landing)/components/marketing-layout-shell.tsx` for the global navbar, rolling banner, footer, and ambient shell background.
- Keep `MarketingLayoutShell` configurable from route layouts. If only one public route needs different top spacing or banner behavior, prefer shell props over copying the shell.
- Keep shell color treatment configurable too. If a route needs a black shell instead of the accent/cobalt atmosphere, use a shell variant prop rather than duplicating layout structure.
- The current default for shared public shell tone is black. `MarketingLayoutShell` should stay neutral unless a route intentionally opts into a different atmosphere.
- For public hero sections, avoid fully opaque slab backgrounds that visually detach the first section from the shared shell. Let the shell atmosphere show through unless the page is intentionally using a card/panel treatment.
- When shifting shell tone, also update repeated chrome surfaces such as navbar, footer, FAQ wrappers, embed headers, and shared-report shells so they stay visually consistent with the chosen shell.
- Many public landing routes use `components/layout/unified-page-shell.tsx` and `UnifiedSurface` for page composition. Do not assume every file in `app/[locale]/(landing)/components/` is part of the live route tree.
- The active public shell comes from `(landing)/components/navbar.tsx` and `footer.tsx`; home-local `Navigation.tsx` and `Footer.tsx` are not part of the current route wiring.
- When auditing or editing public UI, trace from route `page.tsx`/`layout.tsx` imports first, then edit the shared primitive or section that is actually mounted.
- `public/AGENTS.md` can lag behind the live home composition. Treat `HomeContent.tsx` as the source of truth for current home section order.
