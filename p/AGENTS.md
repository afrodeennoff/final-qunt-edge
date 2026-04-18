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
- Hero entrance: CSS `@keyframes` via `.hero-entrance` classes (NOT Framer Motion). CSS animations fire on DOM insertion regardless of JS chunk state.
- Navbar: renders immediately, no entrance animation (removed Framer Motion wrapper)
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
- If a public page looks blank but SSR HTML still contains the content, inspect the shared shell width before assuming hydration/data failure. A marquee or max-content child can push the main content far off-canvas.
- `MarketingLayoutShell` flex/content wrappers should keep `min-w-0`, and shared rolling/marquee sections must be width-contained with `w-full max-w-full overflow-hidden`.
- For public hero sections, avoid fully opaque slab backgrounds that visually detach the first section from the shared shell. Let the shell atmosphere show through unless the page is intentionally using a card/panel treatment.
- When shifting shell tone, also update repeated chrome surfaces such as navbar, footer, FAQ wrappers, embed headers, and shared-report shells so they stay visually consistent with the chosen shell.
- Many public landing routes use `components/layout/unified-page-shell.tsx` and `UnifiedSurface` for page composition. Do not assume every file in `app/[locale]/(landing)/components/` is part of the live route tree.
- Shared `/deals`-style hero, section, inset, metric, and action recipes now live in `components/layout/unified-page-recipes.ts`. When aligning public or team landing routes to the current house style, start from those recipes instead of inventing route-local chrome again.
- The active public shell comes from `(landing)/components/navbar.tsx` and `footer.tsx`; home-local `Navigation.tsx` and `Footer.tsx` are not part of the current route wiring.
- When auditing or editing public UI, trace from route `page.tsx`/`layout.tsx` imports first, then edit the shared primitive or section that is actually mounted.
- For tool-heavy landing routes such as `/deals`, keep width rhythm on `UnifiedPageShell` and centralize any route-local surface/button recipes into a small shared set of classes or helpers. Do not mix many one-off white-tinted panel styles in the same file.
- `/deals/compare`, `/deals/calculator`, `/deals/guides`, and `/deals/faq` currently redirect into anchored sections of the main `/deals` page. Unify that experience on the root deals route first instead of designing separate shells for those URLs.
- Offer/deal cards should read in one clear order: context badge, firm/title block, compact fact grid, split secondary actions, then one full-width primary CTA. Avoid scattering equal-weight buttons and stats without hierarchy.
- Route-level public or teams landing motion should use the staged shared utility classes (`animate-fade-up-smooth-d1...d4`, `animate-scale-reveal-d1...d3`) instead of inline animation-delay styles so entrances stay coordinated and `animation-fill-mode: both` prevents pre-animation flashes.
- `public/AGENTS.md` can lag behind the live home composition. Treat `HomeContent.tsx` as the source of truth for current home section order.
- Keep the home page narrative linear. Do not mount `DashboardPreview` both inside `Hero.tsx` and again in `HomeContent.tsx`; the hero owns the product showcase.
- Avoid stacking multiple home sections that all restate AI or differentiation claims. If `AIFeatures.tsx` is mounted, keep `FeaturesBento.tsx` focused on core workflow/platform capabilities and avoid reintroducing a second AI feature grid or a duplicate compare block.
- For public-facing spotlight/carousel sections, prefer auto-rotation built with a resettable `setTimeout` keyed to the active slide, and pause that motion on hover/focus so CTAs and copy actions remain comfortable to use.
- For home/marketing pages, put mounted copy in locale dictionaries first. The active home route reads from `locales/*/landing.ts` under `landing.home.*`, while shared navbar/footer chrome uses `landing.navbar.*` and `landing.footerNew.*`.
- Once the shared type scale exists in globals, mounted marketing sections should use the shared utilities (`type-h1`, `type-h2`, `type-h3`, `type-h4`, `type-body-lg`, `type-body`, `type-body-sm`, `type-label`, `type-overline`) instead of route-local clamp headings or ad-hoc display font classes.
- For hero refreshes on the home page, prefer a split composition over a fully centered stack: copy and capability cards on one side, `DashboardPreview` on the other, with small integration/trust trays attached to the preview column instead of floated as separate full-width blocks.
- If the design reference is a restrained SaaS launch page (for example Cal.com), adapt the layout language before the palette: center the editorial block, let the product screenshot dominate, reduce decorative atmosphere, and keep support chrome shallow and secondary.
- If the reference also has strong card-led hero placement (for example `xtract.framer.ai`), stage the hero in two beats: centered copy first, then an asymmetrical card grid with one dominant product card and smaller stacked support cards.
- For reference-driven hero redesigns, it is acceptable to use a local display/body pairing with fonts already loaded in the app instead of introducing a new global font dependency, as long as the hierarchy clearly separates display text from explanatory copy.
- `HomeContent.tsx` should stay a direct mounted composition for the home route unless there is a compelling reason to hide whole sections behind client-only dynamics. Full-page client reveal boundaries on the home route are a blank-page risk.
- `components/ui/button.tsx` `asChild` usage must slot the child directly. Do not wrap `Button asChild` links in `MagneticButton` or any wrapper that renders another interactive element.
- Dashboard account collections should use `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch gap-4`; account cards should be full-height flex columns with bottom actions anchored via `mt-auto`.
- Numeric trading/account/table values should prefer `tabular-nums` plus `font-medium`/`font-semibold` so dashboard columns and cards stay aligned as values change.
- Dashboard shell chrome should avoid bright `white/[...]` borders and fills. For sidebar/header/navbar/summary chrome, prefer `border-border/35-45`, `bg-background/55-80`, and restrained `bg-primary/6-12` accents instead of white-tinted pills.
- When dashboard visuals feel inconsistent, patch shared chrome first: `components/ui/sidebar.tsx`, `components/ui/unified-sidebar.tsx`, `components/ui/sidebar-primitives/**`, `dashboard-header.tsx`, `navbar.tsx`, and shared summary bars before touching route-local widgets.
- Major dashboard subpages that still use legacy `border-white/[...]`, `bg-white/[...]`, or bright `border-[oklch(...)]` card recipes should be normalized toward `border-border/35-45` and `bg-card/50-60` so they match the shell.
- Dashboard route pages that are normal content surfaces should start from `components/layout/unified-page-shell.tsx` and `UnifiedSurface` before adding route-local grids. Avoid route-local `bg-black` wrappers, ad-hoc shell padding, or narrow one-off max widths unless the page is intentionally fullscreen.
- For trader-profile-style analytics pages, prefer a two-stage composition: an elevated summary hero first, then a responsive main/aside grid with `min-w-0` content columns and a sticky right rail only at larger breakpoints.
- On trader-profile-style pages, the hero should carry a short performance brief plus compact signal tiles inside the control rail so the page reads overview → day pattern → benchmark/feed instead of a flat stack of equal-weight stats.
- If a trader-profile-style page is being aligned to a user wireframe, lock the macro order before styling details: profile/control row, thin metrics strip, dedicated active-account block, large calendar/content panel, stacked analytics rail, then full-width trade history.
- If trader-profile controls start feeling detached from the summary story, fold the visibility/date-range controls into the same summary band as the quick metrics. Keep the seven quick metrics in a `3 + 4` hierarchy, with the first row reserved for the top three signals and a taller calendar panel below to rebalance the page.
- On the live trader-profile page, keep public visibility anchored in the profile identity card’s top-right area rather than the review-controls panel. The review-controls surface should stay focused on date-range selection and active-session context.
- Keep the trader-profile content order as identity header, metric band, active accounts, daily calendar, right-rail analytics, then trade history. If the page starts feeling messy, tighten inter-section gaps before adding more chrome.
- For full-site visual refreshes, start with shared chrome first: `components/layout/unified-page-shell.tsx`, `components/layout/unified-page-recipes.ts`, public navbar/footer/shell wrappers, and core CTA/surface primitives. Route-by-route passes should inherit from that refreshed base instead of inventing local shells again.
- Home page hero redesigns should use a dominant product-UI canvas plus restrained animated SVG overlays rather than gradient-heavy marketing treatment. Prefer one-shot stroke/node animations and flat tinted surfaces over decorative gradients or continuous glow effects.
- If the user asks for “unified like `/deals`” with no function changes, treat it as a visual-only system pass: shared shell, shared panel recipes, shared CTA hierarchy, and route-local content reflow only. Do not change route behavior, data loading, filtering, or server contracts.
- Teams and admin section chrome is often owned by mounted layout wrappers (`app/[locale]/teams/dashboard/layout.tsx`, `app/[locale]/admin/admin-client-layout.tsx`) rather than the leaf pages. Refresh those layout shells first before spending time on route-local panels.
- For internal workspace headers, avoid older `bg-black/70` + white-tinted frame treatments. Prefer the same flat shared recipe language used by the refreshed public shell: subdued top tint, `border-border/35-45`, `bg-background/72-78`, and primary accent only for badges/CTAs/active states.

## Admin Panel Patterns
- Admin CRUD server action types must expose ALL Prisma schema fields that the public UI consumes, not just a subset. When the public page reads `claimUrl`, `challengeFee`, `expiresAt`, `isActive`, the admin input type and forms must allow editing all of them.
- `PropFirmCouponInput` in `server/prop-firms.ts` is the canonical admin input type for coupons/deals. It maps to all 11 editable fields on the `PropFirmCoupon` Prisma model.
- Coupon forms exist in two locations: inline on `/admin/propfirms/[id]` (CouponsSection component) and standalone on `/admin/coupons` (CouponEditCard component). Both must stay in sync when fields change.
- Read-only prop-firm admin gating should come from the shared `getPropFirmAdminPageState()` helper, not route-local booleans. That helper is the contract for `isFallbackRecord`, `isReadOnly`, and the `canManage*` flags across `/admin/propfirms` list/detail surfaces.
- When a coupon has override fields (platform, payoutModel, drawdownType), the deals data mapping (`server/deals.ts`) uses coupon-level values first, falling back to firm-level values: `coupon.platform || coupon.propFirm.platform || 'Default'`.
- Admin coupon fields that flow to the public deals page: `code` → coupon code display + copy button, `discountPercent` → discount badge, `challengeFee` → price display, `claimUrl` → affiliate/claim link, `expiresAt` → expiry badge, `isActive` → visibility filter.
- Coupon visibility on public surfaces must honor the full schedule window, not just `isActive`/`expiresAt`. If admin exposes `startsAt`, public readers (`server/deals.ts`, `server/firm-coupons.ts`, firm detail surfaces) must also require `startsAt <= now`.
- Keep that public schedule logic centralized in `lib/prop-firms/coupon-visibility.ts`. Reuse `buildPublicCouponWindowWhere(now)` for deals, firm-detail readers, banner readers, and any future public coupon query instead of rewriting schedule filters inline.
- Public deals can also fall back to spotlight/web-sourced offers when no coupon rows exist. If admin needs to manage those offers, bridge them into prefilled create flows rather than leaving admin screens blank.
- Keep spotlight-to-coupon fallback values centralized. Public deals fallback and admin suggestion UIs should read from the same helper so discount/code/fee/claim defaults stay aligned.
- Admin server actions are co-located in `server/prop-firms.ts` and re-exported from the admin page files where they are consumed. All admin mutations call `assertAdminAccess()` and call `updateTag('prop-firms')` after writes.
- For admin update forms, blank optional coupon fields should normalize to `null`, not `undefined`, so Prisma actually clears persisted values when an admin removes a discount, claim URL, fee override, or date.
- Coupon admin writes should go through shared server-side validation/error translation in `server/prop-firms.ts`, not page-local ad hoc checks. Duplicate codes, invalid URLs, invalid date ranges, and unavailable DB/schema states should surface as friendly admin messages.
- Admin coupon entry points should show mutation feedback explicitly: success/error banners after redirects and pending-submit states on create/save/delete buttons.
- Shared admin visual chrome now lives in `app/[locale]/admin/components/admin-surface.tsx`. Use `AdminPageHeader`, `AdminStatCard`, and `AdminSection` before inventing route-local admin header/card wrappers.
- For editor-heavy admin pages like `/admin/coupons`, keep the page on one primary vertical lane: calm stat strip, one create section, then stacked suggestion/editor cards. Avoid restoring `xl:grid-cols-2` for full coupon/review editor cards unless the form body is substantially reduced first.
- If admin coupon pages are using fallback/read-only data because the database connection is unavailable, disable the write forms and show a warning instead of leaving dead-looking controls on screen.
- Apply that same read-only contract to `/admin/propfirms` and any sibling admin CRUD page: if the page is showing fallback data or the schema is unavailable, do not leave live create/edit/delete controls mounted for firms or reviews.
- For admin schedule fields backed by `input[type=\"datetime-local\"]`, never use `toISOString().slice(0, 16)` for default values. Render local wall-clock components so editing and re-saving a timestamp does not shift it by timezone offset.
- Keep admin control granularity aligned to the schema. Example: `PropFirmReview.rating` is an `Int`, so review forms should use integer steps instead of advertising half-step values that the backend cannot store faithfully.

## Route State & Shell Patterns
- For UI-only polish passes, start with shared route-state and shell owners before touching route-local page bodies: `components/ui/route-state.tsx`, `components/layout/unified-page-recipes.ts`, public navbar/marketing shell, `components/mobile-nav.tsx`, `dashboard-header.tsx`, and mounted admin/teams layout wrappers.
- Loading/error/not-found surfaces should use `components/ui/route-state.tsx` plus route-specific copy/actions instead of raw spinners, plain bordered boxes, or route-local fallback card recipes.
- When refreshing auth/public shell chrome, avoid reintroducing `bg-white/[...]`, blur-heavy atmosphere, or isolated route-local panel styles. Use the shared Obsidian panel/action recipes so auth, landing, dashboard, teams, and admin still read as one product.
- If verification seems stalled after a large UI pass, inspect for duplicate `tsc`/`eslint` workers before retrying. This repo is slow enough that overlapping repo-wide verifier runs can starve each other and create false “hang” signals.

## API Route & Rate Limiting Patterns
- ALL authenticated user-facing API routes should be wrapped with `withRateLimited` from `lib/api/with-api-route.ts`
- Rate limit config: `{ rateLimitId: string, rateLimitMax: number, rateLimitWindow: number, routeName: string }`
- Typical limits: 120/min for reads, 60/min for expensive reads, 30/min for mutations, 20/min for checkout/payment routes
- `withRateLimited` handler signature: `(request: NextRequest, ctx: { params: Promise<Record<string, string>> })`
- For tests, mock the wrapper as identity: `vi.mock('@/lib/api/with-api-route', () => ({ withRateLimited: (h) => h }))`
- Routes that don't need rate limiting: infrastructure probes (`/api/health`, `/api/ready`), webhook receivers with signature verification, cron routes with Vercel auth

## Cache Invalidation Patterns
- Cache invalidation MUST happen AFTER `prisma.$transaction()` commits, never inside the callback
- If invalidation fails after a successful write, log the error but never throw — the DB write is truth, cache self-heals via TTL
- Use `updateTag()` for Next.js `'use cache'` cached server functions
- Use `CacheService.invalidateNamespace()` for Redis-layer cached data
- Always invalidate both layers when mutating data that flows through both
- **Always use composite invalidation helpers** from `lib/cache/cache-invalidation.ts` (`invalidateTradeDataCaches`, `invalidateAccountRelatedCaches`, etc.) instead of listing individual `updateTag()` calls. Manual tag lists are error-prone.
- **`revalidatePath()` alone is NOT sufficient** for `'use cache'` data. Always pair with `updateTag()` for the relevant cache tags.
- **Webhook handlers MUST invalidate caches** after subscription/payment mutations. Add invalidation at the central `processEvent` level, not in individual handlers.
- **Team mutations MUST invalidate** `teams-${userId}` cache tag for all affected user IDs (owner + members).

## Test Mock Patterns
- When mocking `@/lib/logger`, always include BOTH `logger` and `createLogger: () => ({ info, warn, error, debug })`
- This is needed because `cache-service.ts` (transitively imported by many modules) uses `createLogger`
- For `withRateLimited`-wrapped route tests, pass `{ params: Promise.resolve({}) }` as second arg to the exported handler

## Optimistic Update Pattern
- ALL optimistic mutations must capture state BEFORE mutation and restore on server error
- Capture via `useUserStore.getState().fieldName` or `useTradingDomainStore.getState().fieldName` (synchronous snapshot)
- Pattern: `const previous = store.getState().field` → optimistic update → `try { await serverAction() } catch { store.setState({ field: previous }); throw error }`
- Reference implementation: `moveAccountToGroup` in `context/data-provider.tsx`
- NEVER update local state before capturing previous state
