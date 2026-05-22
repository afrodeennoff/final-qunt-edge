# Spacing System — Electric Obsidian (macOS-Quality Refinements)

**Enforced across the entire application for premium, calm, balanced visual rhythm**

macOS-inspired: generous but precise breathing room, consistent 8pt grid, no awkward 20px/28px/14px values. Primitives first, then pages. Results in noticeably more polished, professional "native app" feel.

## Section Vertical Padding
- Full sections: `py-16 sm:py-20 lg:py-24` (responsive, scales up)
- Hero: `pt-[88px] pb-16 sm:pb-20 lg:pb-24` (navbar offset top, responsive bottom)
- App page shells (dashboard/teams/admin): density `py-4 sm:py-6 lg:py-8` (compact), `py-6 sm:py-8 lg:py-10` (default), `py-8 sm:py-10 lg:py-12` (spacious)
- Compact strips (filters, stats, search): `py-4 sm:py-6`
- Footer: `py-12 sm:py-16`
- Footer grid: `gap-6 lg:gap-10`

## Internal Component Spacing
| Use Case | Value | Scale |
|----------|-------|-------|
| Icon+label, tags, tight groups | `gap-1` | 4px |
| Standard siblings, list items, nav | `gap-2` | 8px |
| Card internals (title+desc), widget headers | `gap-3` | 12px |
| Standard content blocks, widget bodies | `gap-4` / `p-4` | 16px |
| Section-internal blocks, card content | `gap-6` / `p-6` | 24px |
| Feature grid spacing | `gap-6 lg:gap-8` | responsive |
| Sparse hero/CTA, large cards | `gap-8` or `p-8` | 32px |
| Sidebar containers | `p-4` | 16px |
| Dialog/sheet headers, card md | `py-4` / `p-4` | 16px |

**Card primitive (standardized for macOS polish)**:
- sm: `p-3` (12px) / `p-3 pb-0`
- md: `p-4` (16px) / `p-4 pb-0`
- lg: `p-6` (24px) / `p-6 pb-0`

WidgetShell / ChartSurface: content `p-4`, headers `px-3 py-2` or `px-2/3`

## Banned Values
- ❌ `gap-5`, `gap-7`, `gap-9`, `gap-3.5` — use `gap-4`, `gap-6`, `gap-8`, `gap-2/3`
- ❌ `space-y-2.5`, `py-5`, `p-5`, `px-3.5`, `py-2.5` (except icons) — use 8pt multiples: `p-4`, `py-4`, `px-4`, `py-2`
- ❌ `mb-7`, `mb-9`, `mt-7`, `mt-9`, `mt-5` in structural — use `mb-6`/`mb-8`, `mt-4`/`mt-6`/`mt-8`
- ❌ `py-[Xpx]`, `px-[Xpx]`, `gap-[Xpx]` — use Tailwind scale
- ❌ `py-20`, `py-24`, `py-32` as flat values — use responsive `py-16 sm:py-20 lg:py-24`

## Exceptions
- `p-[1px]` allowed (CSS border gradient trick in modal/shell)
- Email templates use inline pixel values (Outlook compatibility)
- Micro UI (badges, buttons, icons): `px-2.5 py-1`, `size-3.5` ok for optical balance
- Dashboard filter tags / micro labels retain tight 10-12px where needed for density

**Result**: The entire app (dashboard widgets, marketing sections, auth cards, teams/admin, embeds, sidebars) now has consistent, thoughtful macOS-native spacing — clean cards, proper section breathing, tight lists, refined grids. Feels calm, premium, balanced.
