# Spacing System — Electric Obsidian

## Section Vertical Padding
- Full sections: `py-16 sm:py-20 lg:py-24` (responsive, scales up)
- Hero: `pt-[88px] pb-16 sm:pb-20 lg:pb-24` (navbar offset top, responsive bottom)
- Compact sections (strips, filters): `py-4 sm:py-6` (tight)
- Footer: `py-12 sm:py-16` (reduced from hero but still spacious)

## Internal Component Spacing
- Tight groups (icon+label, tags): `gap-1` (4px)
- Standard siblings (label+input, list items): `gap-2` (8px)
- Card internals (title+description): `gap-3` (12px)
- Standard content blocks: `gap-4` (16px)
- Section-internal blocks: `gap-6` (24px)
- Feature grid spacing: `gap-6 lg:gap-8`
- Sparse hero/CTA: `gap-8 lg:gap-12`

## Rules
- No arbitrary pixel values (p-[7px], gap-[5px]) — use nearest Tailwind scale
- No `gap-5`, `gap-7`, `gap-9` — use `gap-4`, `gap-6`, `gap-8` instead
- No `space-y-2.5` — use `space-y-2` or `space-y-3`
- No `mb-7`, `mb-9` — use `mb-6` or `mb-8`
- All section wrappers use consistent responsive `py-16 sm:py-20 lg:py-24`