# Modern Minimal UI Refinement

> **Status:** Approved — ready for implementation.
> **Scope:** 8 shared components + 1 CSS token file.
> **Constraint:** Dark-only (Electric Obsidian), Tailwind CSS v4, shadcn/ui. No backdrop-blur, no hex outside tokens.

## Changes

### 1. Component Surfaces
- **Button.tsx:** Merge pill/gradient into solid/outline (8 variants). Uniform `rounded-[10px]`.
- **Card.tsx:** Unified `border-border/25` across all variants. Elevated → `bg-card/95` inset instead of shadow.
- **Dialog.tsx:** Drop `shadow-lg`. Close btn → `rounded-md border-transparent hover:bg-muted`.
- **Dropdown-menu.tsx:** `border-border/50`, shadow → `shadow-[0_8px_20px_-12px_rgba(0,0,0,0.5)]`.
- **Popover.tsx:** `rounded-[10px]`. Shadow → `shadow-[0_4px_16px_-8px_rgba(0,0,0,0.4)]`.
- **Tooltip.tsx:** Shadow → `shadow-[0_4px_12px_-6px_rgba(0,0,0,0.5)] border-border/60`.
- **Button-minimal.tsx:** Remove `hover:shadow-md` from primary variant.
- **Sheet.tsx:** Overlay → `bg-background/60` (fix broken `hsl(var(--background)/0.8)` syntax).

### 2. Spacing & Padding Tighten
- Card content/header/footer (md): `p-4` → `p-3.5`
- Dialog: `p-6` → `p-5`
- TabsList: `p-1` → `p-0.5`
- Dropdown items: `px-2.5 py-2` → `px-2 py-1.5`
- Dropdown content: `p-1.5` → `p-1`
- Popover: `p-4` → `p-3`

### 3. Color — Desaturate Borders
- `--border`: `hsl(263, 24%, 16%)` → `hsl(260, 12%, 16%)`
- `--border-subtle`: `hsl(263, 22%, 13%)` → `hsl(260, 8%, 13%)`
- `--muted`: `#0D0D0D` → `hsl(0, 0%, 5%)`
- `--input`: `hsl(260, 20%, 12%)` → `hsl(260, 10%, 12%)`
- `--sidebar-border`: `hsl(260, 20%, 12%)` → `hsl(260, 10%, 12%)`
- `--primary`: Keep `hsl(263, 88%, 68%)`

### 4. Interactive States
- Button-minimal primary: remove `hover:shadow-md`
- Card `hover:-translate-y-0.5` → `hover:-translate-y-px`
- Ensure transition props on all hovered menu items, tabs, buttons
