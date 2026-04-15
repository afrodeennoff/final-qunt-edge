# Spacing System — Electric Obsidian

**Enforced across the entire application**

## Section Vertical Padding
- Full sections: `py-16 sm:py-20 lg:py-24` (responsive, scales up)
- Hero: `pt-[88px] pb-16 sm:pb-20 lg:pb-24` (navbar offset top, responsive bottom)
- Compact strips (filters, stats, search): `py-4 sm:py-6`
- Footer: `py-12 sm:py-16`
- Footer grid: `gap-6 lg:gap-10`

## Internal Component Spacing
| Use Case | Value | Scale |
|----------|-------|-------|
| Icon+label, tags, tight groups | `gap-1` | 4px |
| Standard siblings, list items | `gap-2` | 8px |
| Card internals (title+desc) | `gap-3` | 12px |
| Standard content blocks | `gap-4` | 16px |
| Section-internal blocks | `gap-6` | 24px |
| Feature grid spacing | `gap-6 lg:gap-8` | responsive |
| Sparse hero/CTA | `gap-8` or `gap-12` | 32/48px |

## Banned Values
- ❌ `gap-5`, `gap-7`, `gap-9` — use `gap-4`, `gap-6`, `gap-8`
- ❌ `space-y-2.5` — use `space-y-2` or `space-y-3`
- ❌ `mb-7`, `mb-9`, `mt-7`, `mt-9` — use `mb-6`/`mb-8`, `mt-6`/`mt-8`
- ❌ `py-[Xpx]`, `px-[Xpx]`, `gap-[Xpx]` — use Tailwind scale
- ❌ `py-20`, `py-24`, `py-32` as flat values — use responsive `py-16 sm:py-20 lg:py-24`

## Exceptions
- `p-[1px]` allowed (CSS border gradient trick in modal/shell)
- Email templates use inline pixel values (Outlook compatibility)
- Dashboard internal spacing (gap-1/2/3/4) is fine as-is
