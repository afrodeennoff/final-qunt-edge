
## Checkbox touch target fix (2026-04-01)
- Changed `h-4 w-4` → `h-11 w-11` on the CheckboxPrimitive.Root element
- Check icon inside remains `h-4 w-4` for visual consistency within the larger touch area
- All existing props, data attributes, and API preserved
- cn() merge allows consumers to override via className prop if needed

## RadioGroup touch target fix (2026-04-01)
- Changed `h-4 w-4` → `h-11 w-11` on RadioGroupPrimitive.Item element
- Circle indicator inside remains `h-2.5 w-2.5` for visual consistency
- Same pattern as checkbox: larger hit area, centered indicator via flex
