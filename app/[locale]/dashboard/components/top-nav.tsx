import { Sparkles } from "lucide-react"

export function TopNav({ title }: { title: string }) {
 return (
 <div className="mb-4 flex items-center justify-between pb-3 border-b border-[oklch(0.65_0.22_260/0.08)]">
 <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/35">
 {title}
 </h2>
 <span className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.65_0.22_260/0.28)] bg-[oklch(0.65_0.22_260/0.08)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.10em] text-[oklch(0.75_0.22_260)]">
 <Sparkles className="size-3" /> AI
 </span>
 </div>
 )
}
