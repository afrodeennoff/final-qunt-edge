import { cn } from "@/lib/utils"

type Option = { label: string; value: string }

export interface SegmentedControlProps {
 options: Option[] | string[]
 value: string
 onChange: (value: string) => void
 className?: string
}

export function SegmentedControl({ options, value, onChange, className }: SegmentedControlProps) {
 const normalized: Option[] = Array.isArray(options)
 ? options.map((item) => (typeof item ==="string" ? { label: item, value: item } : item))
 : []

 const activeIndex = normalized.findIndex((o) => o.value === value)

 return (
 <div className={cn("relative inline-flex rounded-md border-0 bg-background/0.09 p-0.5", className)}>
   {activeIndex >= 0 && (
     <div
       className="absolute top-0.5 bottom-0.5 rounded bg-primary/20 transition-[transform,width] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
       style={{
         left: `calc(${activeIndex * (100 / normalized.length)}% + 2px)`,
         width: `calc(${100 / normalized.length}% - 4px)`,
       }}
     />
   )}
   {normalized.map((option) => (
   <button
   key={option.value}
   type="button"
   onClick={() => onChange(option.value)}
   className={cn("relative z-10 rounded px-2 py-1 text-[11px] font-semibold transition-colors duration-150",
   value === option.value ?"text-foreground" :"text-muted-foreground hover:text-foreground",
   )}
   >
   {option.label}
   </button>
   ))}
 </div>
 )
}
