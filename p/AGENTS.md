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
- Base shell: dark plum-black canvas with tweakcn `Deep Purple` accents
- Shared accent tokens should come from `app/globals.css`, `styles/tokens.css`, and `styles/styleseed-tokens.css`, not page-local one-offs
- Dashboard accent overrides also live in `lib/constants/dashboard-themes.ts`; palette passes are incomplete unless dashboard theme palettes and default/fallback theme wiring are updated too
- Surfaces: dark neutral/plum with restrained purple tinting — avoid raw `bg-white/[...]`, legacy gold fills, and older cobalt-heavy fills
- Borders and inset highlights: low-opacity purple derived from the shared primary/border tokens
- Scrollbar: Deep Purple tinted
- Selection: Deep Purple highlight
- Focus rings: Deep Purple
- Public-facing shells should stay dark-first. Use purple atmosphere sparingly and keep shared shell structure configurable rather than forking layouts.
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
- Keep the home page narrative linear. Do not mount `DashboardPreview` both inside `Hero.tsx` and again in `HomeContent.tsx`; the hero owns the product showcase.
- Avoid stacking multiple home sections that all restate AI or differentiation claims. If `AIFeatures.tsx` is mounted, keep `FeaturesBento.tsx` focused on core workflow/platform capabilities and avoid reintroducing a second AI feature grid or a duplicate compare block.
- For public-facing spotlight/carousel sections, prefer auto-rotation built with a resettable `setTimeout` keyed to the active slide, and pause that motion on hover/focus so CTAs and copy actions remain comfortable to use.
- For home/marketing pages, put mounted copy in locale dictionaries first. The active home route reads from `locales/*/landing.ts` under `landing.home.*`, while shared navbar/footer chrome uses `landing.navbar.*` and `landing.footerNew.*`.
- Once the shared type scale exists in globals, mounted marketing sections should use the shared utilities (`type-h1`, `type-h2`, `type-h3`, `type-h4`, `type-body-lg`, `type-body`, `type-body-sm`, `type-label`, `type-overline`) instead of route-local clamp headings or ad-hoc display font classes.
- For hero refreshes on the home page, prefer a split composition over a fully centered stack: copy and capability cards on one side, `DashboardPreview` on the other, with small integration/trust trays attached to the preview column instead of floated as separate full-width blocks.
- If the design reference is a restrained SaaS launch page (for example Cal.com), adapt the layout language before the palette: center the editorial block, let the product screenshot dominate, reduce decorative atmosphere, and keep support chrome shallow and secondary.
- For reference-driven hero redesigns, it is acceptable to use a local display/body pairing with fonts already loaded in the app instead of introducing a new global font dependency, as long as the hierarchy clearly separates display text from explanatory copy.
- Dashboard account collections should use `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch gap-4`; account cards should be full-height flex columns with bottom actions anchored via `mt-auto`.
- Numeric trading/account/table values should prefer `tabular-nums` plus `font-medium`/`font-semibold` so dashboard columns and cards stay aligned as values change.
