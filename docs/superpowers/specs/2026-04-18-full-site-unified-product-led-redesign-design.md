# Full-Site Unified Product-Led Redesign

**Date:** 2026-04-18  
**Status:** Draft for review  
**Scope:** Visual refresh only  
**Primary objective:** Make every page in Qunt Edge feel like one product system instead of a mix of separate design languages.

## 1. Summary

Qunt Edge will be refreshed as a single product-led visual system applied across:

- home
- all public landing pages
- dashboard
- teams
- admin and internal tools

The redesign is strictly cosmetic. It must not change product behavior, business logic, APIs, auth, routing, calculations, filtering logic, or server/client data flow.

The system direction is:

- product-led, not editorial-first
- black / graphite / soft white as the base
- existing purple-cobalt accent family retained, but used much more selectively
- no gradients in the new design language
- real product UI as the main proof layer
- subtle animated SVG signal overlays as the identity/motion layer

## 2. Non-Negotiable Guardrails

This redesign must not change:

- route structure
- query parameters or navigation behavior
- form submission behavior
- API/server-action contracts
- auth or permissions
- calculations, scoring, filters, sorts, or benchmark logic
- Zustand/store behavior
- loading conditions or data sourcing rules

This redesign may change:

- layout and composition
- shell spacing and max-width rhythm
- surface styling and section hierarchy
- typography and label hierarchy
- CTA styling and action grouping
- empty/loading visual presentation
- motion timing and visual transitions
- SVG/image/media presentation

## 3. Visual System

### 3.1 Palette

Base palette:

- `background`: near-black
- `surface`: charcoal / graphite
- `text-primary`: soft white
- `text-secondary`: muted gray
- `border`: low-contrast cool dark line

Accent palette:

- retain the current purple-cobalt family
- use it only for:
  - primary actions
  - selected states
  - focus states
  - chart emphasis
  - key semantic highlights

Do not use accent for:

- full-page atmosphere washes
- large colorful backgrounds
- decorative gradients
- every card border or every badge

### 3.2 Surfaces

All pages should reuse the same surface family:

- `shell`: page container and section rhythm
- `hero panel`: the strongest opening block on a route
- `section panel`: main content group
- `inset module`: compact cards, filter modules, summary modules
- `table shell`: large operational data surfaces
- `empty state`: consistent calm fallback treatment

Surfaces should feel:

- matte
- structured
- premium
- data-first

Depth should come from:

- border
- shadow
- spacing
- contrast

Not from:

- gradients
- glassmorphism
- noisy glow
- decorative blur

### 3.3 Typography

Home and public:

- strong display headlines
- short copy blocks
- high contrast
- narrow text columns

Dashboard, teams, admin:

- tighter operational type
- stronger labels and section names
- clear scan hierarchy for values, KPIs, filters, and actions

### 3.4 CTA Hierarchy

Every page should follow one action system:

- one `primary` CTA
- one `secondary/ghost` CTA
- lower-priority actions visually reduced

Avoid equal visual weight across many buttons.

## 4. Motion System

Motion should feel engineered, not decorative.

Allowed motion:

- staged section reveals
- subtle hover elevation
- precise state transitions
- restrained SVG signal-line animation
- small directional motion on CTA arrows and affordance cues

Not allowed:

- blur entrances
- large floating/glowing loops
- noisy infinite animation on interactive content
- aggressive scale jumps
- decorative motion with no information value

### 4.1 Home and public motion

Home/public motion can be more expressive, but still restrained:

- hero entrance in 2-4 beats
- SVG lines can trace or pulse softly
- product UI mockups can reveal in layers

### 4.2 Product motion

Dashboard, teams, and admin should be calmer:

- staggered section entrances
- hover clarity
- focus and active-state transitions
- no marketing-style dramatics inside operational workflows

## 5. Media Language

The redesign uses a hybrid media system:

- `primary anchor`: real product UI
- `secondary identity layer`: animated SVG system overlays

### 5.1 Home page hero

The home page becomes the master expression of the whole system.

Hero rules:

- one dominant canvas
- real product UI is the visual proof
- subtle animated SVG overlays express flow, audit, signal, and execution structure
- no card soup
- no stacked unrelated promo blocks in the first viewport
- no gradient hero backgrounds

The first screen should communicate:

- this is a serious product for traders
- the product itself is the hero
- the system is precise, clinical, and structured

### 5.2 Other public pages

Public pages may use:

- live product crops
- monochrome screenshots
- small SVG overlays
- restrained diagram fragments

They should not rely on unrelated stock imagery as the main system language.

## 6. Page Architecture

The same system will be expressed in two modes.

### 6.1 Public narrative mode

Used for:

- home
- deals
- propfirms
- leaderboard
- referral
- pricing
- blogs
- docs
- support
- about
- newsletter
- legal/info pages

Page rhythm:

- hero or opening header
- summary strip or compact board
- main content board
- final CTA or utility close

### 6.2 Product workspace mode

Used for:

- dashboard
- teams
- admin

Page rhythm:

- page brief
- KPI/control strip
- main working surface
- optional right rail
- full-width table/history below

These pages must feel like the same product system, but not like marketing pages.

## 7. Route-Group Application

### 7.1 Home

Refresh goals:

- make it the source of truth for the redesign
- remove repeated or redundant sections
- reduce visual clutter
- turn the first viewport into one strong product statement

Narrative flow:

- hero
- proof
- workflow
- analytics power
- team/admin proof
- pricing
- FAQ
- final CTA

### 7.2 Public landing routes

Targets:

- deals
- propfirms
- leaderboard
- referral
- pricing
- community
- support
- blogs
- docs
- newsletter
- legal/info routes

Refresh goals:

- same shell rhythm
- same action hierarchy
- same spacing logic
- same empty-state language
- same section ordering discipline

### 7.3 Dashboard and teams

Refresh goals:

- more premium operational polish
- stronger hierarchy for KPIs, filters, and history
- shared shell with public routes, but calmer expression
- tighter table and chart presentation

### 7.4 Admin

Refresh goals:

- same system, adapted for operator clarity
- cleaner control rails
- better form hierarchy
- stronger list/table sections
- more confidence and readability for dense tasks

## 8. Execution Waves

### Wave 1: Home + public landing system

Includes:

- home
- all public landing pages and public content routes

Goal:

- make public-facing surfaces feel fully unified first

### Wave 2: Dashboard + teams

Includes:

- dashboard
- trader profile
- strategies
- behavior
- settings
- reports
- team landing and team dashboard surfaces

Goal:

- bring operational surfaces onto the same system without changing behavior

### Wave 3: Admin + internal tools

Includes:

- admin pages
- newsletter/email/internal operator surfaces

Goal:

- finish full-product alignment so internal pages no longer look like a separate app

## 9. Shared Components and Tokens

Before route-level refreshes, the system should standardize and reuse:

- page shell primitives
- shared recipe classes for hero, section, inset, metric, and action surfaces
- motion utility classes and staged-delay helpers
- table shell styling
- empty/loading state styling
- button hierarchy
- badge/label hierarchy

Future route work should build from these shared layers first instead of route-local styling.

## 10. Verification

Every wave must verify:

- `visual refresh only`
- no route/API/auth/store logic changes
- targeted lint passes
- full typecheck passes
- responsive parity on desktop and mobile
- no reintroduction of gradients
- no motion regressions against reduced-motion rules
- consistent CTA hierarchy and shell rhythm across all touched pages

## 11. Risks

Primary risks:

- redesign drift if route-local one-offs are allowed again
- home becoming too cinematic while product pages remain utilitarian
- accent overuse making pages feel colorful instead of disciplined
- motion becoming decorative instead of structural

Mitigation:

- shared system-first rollout
- one source of truth for shell/surface/action recipes
- one motion vocabulary
- route work done in waves with verification after each wave

## 12. Acceptance Criteria

The redesign is successful when:

- all route groups feel like one product family
- home is the strongest visual statement, but not visually disconnected from product pages
- public pages, dashboard, teams, and admin all share one shell and action language
- the accent family feels controlled and premium
- animated SVG and product UI coexist without noise
- no behavior changes are introduced
