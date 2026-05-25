import { Sparkles } from "lucide-react"

export function TopNav({ title }: { title: string }) {
 return (
 <div className="mb-4 flex items-center justify-between pb-3 border-b border-border/30">
 <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
 {title}
 </h2>
 <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
 <Sparkles className="size-3" /> AI
 </span>
 </div>
 )
}
