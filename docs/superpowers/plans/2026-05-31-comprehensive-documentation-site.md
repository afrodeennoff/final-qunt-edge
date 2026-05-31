# Comprehensive Documentation Site & Navigation Updates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, professional, journalit.co-inspired documentation site for Qunt Edge (modeled directly on the reference at https://journalit.co/docs) that serves as the single source of truth for every public feature and every dashboard capability. This includes:
- Collapsible, well-organized docs sidebar with card-style feature overviews and diagrams.
- Exhaustive step-by-step user guide for the entire dashboard (Widget Canvas, every widget, Copilot, Journal, Trade Log, Accounts, Import, Settings, etc.).
- Rich card diagrams, flow diagrams, and visual explanations for every major feature.
- A true "complete manual" covering workflows from first import to advanced AI behavioral review and prop firm compliance.
- Consistent "Docs" discoverability: placed after Support in the public navbar, added to the landing footer (Support column), and added to the dashboard sidebar (Resources group).
- Homepage "Powerful Features" section updated to prominently feature the four previously missing public offerings: Prop Firms Catalogue, Deals, Leaderboard, and Teams.
- Accurate documentation of all existing capabilities (no "drills" feature was found in the codebase; it will be mapped to the Playbook + Behavior review system).

**Architecture:**
- Pure content + small UX enhancement effort. No new backend work.
- Landing docs live at `app/[locale]/(landing)/docs/` (already has 10 stub pages + layout + sidebar component).
- Enhance `DocsSidebar` to support collapse (desktop), mobile drawer, search (optional stretch), and visual card sections.
- Docs pages use the existing `UnifiedPageShell` + `UnifiedSurface` + Tailwind reference styles from the homepage (eyebrowStyle, cardMain, cardNested, ref-h-section, SVG diagrams, accordions).
- Navigation updates are 3 tiny, high-impact link placements.
- Homepage update adds 4 new feature cards in the existing 2x2 + full-width grid (following the exact visual language already present in HomeContent.tsx).
- All new docs content is self-contained, accurate, and written in the warm, precise, trader-focused tone used on the reference site and Qunt Edge homepage.

**Tech Stack:** Next.js 15 App Router, React Server Components for most docs pages, one small client component for the collapsible sidebar (`'use client'`), Lucide icons (already used), Tailwind, existing design tokens from homepage (`var(--qe-ref-*)`), no new packages.

**Key Principles Applied:**
- DRY: Reuse existing layout primitives and homepage visual language.
- YAGNI: Only enhance sidebar with collapse + basic mobile support; no full search index unless trivial.
- TDD not applicable (content + navigation).
- Frequent small commits after each logical group of changes.

---

## Task 1: Reorder Public Navbar — Place "Docs" Immediately After "Support"

**Files:**
- Modify: `app/[locale]/(landing)/components/navbar.tsx:23-36`

- [ ] **Step 1.1: Read the current links array to confirm exact order**

```bash
# Already known from exploration, but for the agent:
grep -n "links:" app/\[locale\]/\(landing\)/components/navbar.tsx -A 20
```

- [ ] **Step 1.2: Move the Docs entry to appear after Support in the array**

Replace the `links` definition with this exact new order (Docs now lives after Support, before the mobile nav mapping which stays automatic):

```tsx
const links: NavLink[] = useMemo(
  () => [
    { title: 'Features', href: '/#features' },
    { title: 'Pricing', href: '/pricing' },
    { title: 'Prop Firms Catalogue', href: '/propfirms' },
    { title: 'Deals', href: '/deals' },
    { title: 'Leaderboard', href: '/leaderboard' },
    { title: 'Teams', href: '/teams' },
    { title: 'Blog', href: '/blogs' },
    { title: 'Support', href: '/support' },
    { title: 'Docs', href: '/docs' },   // ← moved here per user request
  ],
  [],
);
```

- [ ] **Step 1.3: Verify the mobile nav groups automatically pick up the new order (they do via the same array)**

- [ ] **Step 1.4: Test manually**
  - `npm run dev`
  - Visit `/` (any locale)
  - Confirm navbar shows Docs as the last item, right after Support.
  - Mobile menu also shows it last.

- [ ] **Step 1.5: Commit**

```bash
git add app/\[locale\]/\(landing\)/components/navbar.tsx
git commit -m "docs: move Docs link after Support in public navbar"
```

---

## Task 2: Add "Docs" Link to Landing Footer (Support Column, Right After "Support")

**Files:**
- Modify: `app/[locale]/(landing)/components/footer.tsx:24-29`

- [ ] **Step 2.1: Update the supportLinks array**

Current:
```ts
const supportLinks: FooterLink[] = [
  { name: 'Support', href: '/support' },
  { name: 'Community', href: '/community' },
  ...
];
```

New (exact):
```ts
const supportLinks: FooterLink[] = [
  { name: 'Support', href: '/support' },
  { name: 'Docs', href: '/docs' },           // ← added
  { name: 'Community', href: '/community' },
  { name: 'Changelog', href: '/updates' },
  { name: 'FAQ', href: '/faq' },
];
```

- [ ] **Step 2.2: Verify render in footer Support column**

- [ ] **Step 2.3: Test + commit**

```bash
git add app/\[locale\]/\(landing\)/components/footer.tsx
git commit -m "docs: add Docs link to landing footer Support column"
```

---

## Task 3: Add "Docs" Link to Dashboard Sidebar (Resources Group)

**Files:**
- Modify: `components/sidebar/dashboard-sidebar.tsx:139-151` (Resources section)

- [ ] **Step 3.1: Add import for BookOpen (or reuse existing) if not present**

BookOpen is already imported at line 9.

- [ ] **Step 3.2: Insert the Docs item right after the Deals item in the Resources group**

Current Resources block:
```ts
// ── Resources ──
{
  href: `/${locale}/propfirms`,
  icon: <Building2 className={NAV_ICON_SIZE} />,
  label: "Prop Firms",
  group: "Resources"
},
{
  href: `/${locale}/deals`,
  icon: <DollarSign className={NAV_ICON_SIZE} />,
  label: "Deals",
  group: "Resources"
},
```

New (add after Deals):
```ts
{
  href: `/${locale}/deals`,
  icon: <DollarSign className={NAV_ICON_SIZE} />,
  label: "Deals",
  group: "Resources"
},
{
  href: `/${locale}/docs`,
  icon: <BookOpen className={NAV_ICON_SIZE} />,
  label: "Docs",
  group: "Resources"
},
```

- [ ] **Step 3.3: Ensure the item appears for all users (no admin gate needed)**

- [ ] **Step 3.4: Test in dashboard (logged in)**

- [ ] **Step 3.5: Commit**

```bash
git add components/sidebar/dashboard-sidebar.tsx
git commit -m "docs: add Docs link to dashboard sidebar Resources group"
```

---

## Task 4: Enhance Docs Sidebar — Make It Collapsible + Support Card Diagram Style

**Files:**
- Modify: `app/[locale]/(landing)/docs/components/docs-sidebar.tsx`
- Modify: `app/[locale]/(landing)/docs/layout.tsx` (optional minor width tweak for collapsed state)

- [ ] **Step 4.1: Read the full current sidebar component**

- [ ] **Step 4.2: Convert to client component and add collapse state (localStorage persisted)**

Replace the entire file content with this enhanced version (keeps exact same navigation items + adds collapse, mobile sheet trigger, visual polish):

```tsx
'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  BookOpen, LayoutDashboard, FileText, BarChart3, Sparkles, Activity, FileUp, Settings,
  ChevronLeft, ChevronRight, Menu
} from 'lucide-react'

const SECTIONS = [ /* keep exact same sections and items as today */ ]

export function DocsSidebar({ locale }: { locale: string }) {
  const pathname = usePathname()
  const normalized = pathname.replace(/\/+$/, '') || '/'
  const [collapsed, setCollapsed] = React.useState(false)

  React.useEffect(() => {
    const saved = localStorage.getItem('qunt-docs-sidebar-collapsed')
    if (saved !== null) setCollapsed(saved === 'true')
  }, [])

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('qunt-docs-sidebar-collapsed', String(next))
  }

  const isActive = (href: string, exact?: boolean) => {
    const full = `/${locale}${href}`
    return exact ? normalized === full : normalized.startsWith(full)
  }

  // Desktop collapsible version
  return (
    <nav className={cn("sticky top-24 space-y-6 transition-all", collapsed ? "w-14" : "w-56")}>
      <div className="flex items-center justify-between px-3">
        {!collapsed && (
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Documentation</h3>
        )}
        <button
          onClick={toggle}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border hover:bg-muted/50"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {SECTIONS.map(section => (
        <div key={section.group}>
          {!collapsed && (
            <h3 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {section.group}
            </h3>
          )}
          <ul className="space-y-0.5">
            {section.items.map(item => (
              <li key={item.href}>
                <Link
                  href={`/${locale}${item.href}`}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                    isActive(item.href, item.exact)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/20',
                    collapsed && 'justify-center'
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <item.icon className="h-3.5 w-3.5 shrink-0" />
                  {!collapsed && item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Future: Mobile sheet trigger can be added in layout if desired */}
    </nav>
  )
}
```

- [ ] **Step 4.3: Update layout.tsx to pass collapsed state if you want dynamic width (optional for v1 — current sticky works fine)**

- [ ] **Step 4.4: Test collapse/expand + persistence across refresh**

- [ ] **Step 4.5: Commit**

```bash
git add app/\[locale\]/\(landing\)/docs/components/docs-sidebar.tsx app/\[locale\]/\(landing\)/docs/layout.tsx
git commit -m "docs: make sidebar collapsible with localStorage persistence"
```

---

## Task 5–14: Replace Stub Content in All Docs Pages With Rich, Journalit-Style Comprehensive Guides

Each task below follows the same pattern:
- Read current stub
- Replace entire page content with a full, beautiful, card-heavy, step-by-step, diagram-rich article that explains the feature exhaustively.
- Use the exact visual language from HomeContent (cardMain, cardNested, eyebrowStyle, SVG diagrams, accordions where helpful).
- Include "On this page" quick nav, "Start here" callouts, feature cards with icons/diagrams, numbered step-by-steps for the dashboard, and cross-links.

Because of length, only the structure + key excerpts are shown in this plan. In actual implementation the agent pastes the complete high-quality prose + JSX.

**Files (one task per page):**
- `app/[locale]/(landing)/docs/page.tsx` (Welcome / Overview)
- `app/[locale]/(landing)/docs/getting-started/page.tsx`
- `app/[locale]/(landing)/docs/dashboard/page.tsx` ← **Most important** — full Widget Canvas + every widget + customization + Copilot integration step-by-step
- `app/[locale]/(landing)/docs/trade-log/page.tsx`
- `app/[locale]/(landing)/docs/journal/page.tsx`
- `app/[locale]/(landing)/docs/statistics/page.tsx`
- `app/[locale]/(landing)/docs/analytics/page.tsx`
- `app/[locale]/(landing)/docs/accounts/page.tsx`
- `app/[locale]/(landing)/docs/import/page.tsx`
- `app/[locale]/(landing)/docs/settings/page.tsx`

Additional recommended new pages (create in same task group):
- `/docs/propfirms` (Catalogue)
- `/docs/deals`
- `/docs/leaderboard`
- `/docs/teams`
- `/docs/playbook` (Strategies)
- `/docs/behavior` (if separate)

For brevity in this plan document, Task 5 shows the complete replacement pattern for the two most critical pages. All other pages follow identically.

### Task 5: Rewrite /docs (Welcome / Overview) — Full Feature Map + Beautiful Cards

**Files:** Modify `app/[locale]/(landing)/docs/page.tsx`

- [ ] **Step 5.1: Replace the entire component with the following comprehensive welcome (modeled exactly on journalit.co/docs welcome + your homepage language)**

(Paste the full ~120-line rich JSX here in real execution — includes hero, "What You Can Do" grid of 8–10 beautiful cards with icons, Getting Started cards, FAQ accordion, "Need Help?" section with Discord/support links, and links to every major doc page.)

- [ ] **Step 5.2: Add proper metadata and cross links**
- [ ] **Step 5.3: Test render + mobile**
- [ ] **Step 5.4: Commit**

### Task 6: Complete Dashboard Documentation Page (The Crown Jewel)

**Files:** `app/[locale]/(landing)/docs/dashboard/page.tsx`

This page must contain:
- Large "Dashboard Overview" diagram (SVG showing Widget Canvas + header + sidebar + mobile nav)
- "The Widget Canvas" section with 8–10 individual cards, each describing one widget type, what data it shows, how to configure it, and a small inline diagram.
- "How to Customize Your Dashboard" — drag, resize, add/remove, save layouts, per-user persistence.
- "Copilot & AI Integration" deep dive (links to /docs/analytics).
- "From Dashboard to Action" flow: click widget → open trades/notes → review in Copilot.
- Numbered "First 5 Minutes in the Dashboard" walkthrough.
- "Common Questions" accordion.

- [ ] **Step 6.1–6.5:** Same pattern — replace, test, commit.

(Repeat identical structure for Tasks 7–14 for every other page. Each page gets 3–6 feature cards, 1–2 SVG diagrams, step-by-step where relevant, and "Related Pages" footer.)

---

## Task 15: Update Homepage "Powerful Features" Section — Add the Four Missing Public Features

**Files:**
- Modify: `app/[locale]/(home)/components/HomeContent.tsx` (the grid around lines 106–214)

- [ ] **Step 15.1: After the existing four cards, add (or replace the full-width one) four new high-quality cards** using the exact same `cardMain` / `cardNested` + icon + stat pattern already established.

Suggested four new cards (exact visual match):
1. Prop Firms Catalogue — with live stats example, "Browse 50+ verified firms..."
2. Deals — "Real-time challenge discounts + compare tool..."
3. Leaderboard — "Public performance rankings..."
4. Teams — "Shared workspaces for prop firms & funds..."

Place them in a new 2x2 grid immediately below the existing "Enterprise-Grade Security" full-width card, or integrate elegantly.

- [ ] **Step 15.2: Ensure all four link correctly to their landing pages**
- [ ] **Step 15.3: Test responsive + visual consistency with existing cards**
- [ ] **Step 15.4: Commit**

```bash
git add app/\[locale\]/\(home\)/components/HomeContent.tsx
git commit -m "docs: surface Prop Firms, Deals, Leaderboard, Teams in homepage features"
```

---

## Task 16: Handle "Drills" / Practice Feature (Investigation + Documentation Decision)

- [ ] **Step 16.1:** Confirm via grep that no "drills", "practice drills", or simulation mode exists in the current codebase (already done in exploration — nothing found).
- [ ] **Step 16.2:** In the new `/docs/dashboard` and `/docs/playbook` pages, add a small honest callout:

> **Practice & Drills**  
> Qunt Edge currently supports structured review through the Playbook (Strategies) and Behavior pages. You can create deliberate practice rules and then use Copilot + Statistics to run your own "drill-style" reviews against historical data. A dedicated simulation/drills sandbox is on the roadmap.

- [ ] **Step 16.3:** Document exactly what exists today (Playbook + tagging + custom metrics) as the practical equivalent.

---

## Task 17: Final Polish, Links, SEO, Mobile, Accessibility

- [ ] Add "On this page" in-page navigation to every long docs article.
- [ ] Ensure every docs page has excellent meta title/description.
- [ ] Add subtle entrance animations on cards (match homepage motion patterns) if it feels right.
- [ ] Full mobile testing of collapsible sidebar + all new content.
- [ ] Run `npm run lint` + `npm run typecheck` (or equivalent).

---

## Task 18: Commit Plan + All Small Navigation Changes + First Two Docs Pages

- [ ] One clean commit for navigation trio.
- [ ] Separate commit for sidebar enhancement.
- [ ] Content commits per logical group of docs pages (or one large "docs: comprehensive content overhaul" if preferred).

---

## Execution Handoff (After Plan Is Written)

**Plan complete and saved to `docs/superpowers/plans/2026-05-31-comprehensive-documentation-site.md`.**

Two execution options:

1. **Subagent-Driven (recommended)** — Dispatch a fresh subagent per task (or per 2–3 related tasks) using superpowers:subagent-driven-development. Review between tasks. Fast iteration and high quality.

2. **Inline Execution** — Use superpowers:executing-plans in this session with review checkpoints after navigation updates, after sidebar, and after each major docs page.

**Which approach would you like?**

Once you choose, we begin implementation immediately following the exact steps above.
