import { TrendingUp, TrendingDown } from 'lucide-react'

export default function DashboardPreview() {
 const stats = [
 { label: 'Total P&L', value: '$12,847', change: '+34.2%', positive: true },
 { label: 'Win Rate', value: '78%', change: '+2.4%', positive: true },
 { label: 'Profit Factor', value: '2.34', change: '+0.12', positive: true },
 ]

 const bars = [65, 72, 68, 85, 78, 92, 88, 95, 82, 100, 94, 98]

 return (
 <div
 className="relative mx-auto max-w-5xl px-2 sm:px-4 scan-line-overlay"
 role="img"
 aria-label="Interactive demo dashboard preview — shown metrics are illustrative only"
 >
 <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[oklch(0.028_0.004_264/0.94)] shadow-[0_0_0_0.5px_rgba(180,210,255,0.08),0_30px_90px_-40px_rgba(0,0,0,0.95),0_0_90px_-24px_oklch(0.65_0.22_260/0.18)]">
 <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.65_0.22_260/0.12),transparent_40%)]" />
 <span className="absolute right-4 top-4 z-10 rounded-full border border-[oklch(0.65_0.22_260/0.3)] bg-[oklch(0.65_0.22_260/0.1)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[oklch(0.75_0.22_260)]">
 Demo
 </span>
 <div className="flex items-center gap-2 border-b border-white/[0.06] bg-black/40 px-4 py-4 sm:px-5">
 <div className="flex gap-1.5">
 <div className="w-3 h-3 rounded-full bg-destructive/80" />
 <div className="w-3 h-3 rounded-full bg-warning/80" />
 <div className="w-3 h-3 rounded-full bg-success/80" />
 </div>
 <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
 <div className="hidden max-w-[220px] truncate rounded-full border border-white/[0.06] bg-white/[0.04] px-3 py-1 font-mono text-[10px] text-foreground/42 sm:block">
 app.quntedge.com/dashboard
 </div>
 <div className="flex items-center gap-1.5">
 <span className="relative flex h-2 w-2">
 <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
 <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
 </span>
 <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-green-400">Live</span>
 </div>
 </div>
 <div className="h-6 w-10 rounded-full border border-white/[0.06] bg-white/[0.04] sm:w-16" />
 </div>

 <div className="space-y-4 p-4 sm:p-6">
 <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
 {stats.map((stat) => (
 <div
 key={stat.label}
 className="rounded-[1.4rem] border border-white/[0.08] bg-white/[0.03] p-4 shadow-[0_0_0_0.5px_rgba(180,210,255,0.05),0_18px_44px_-32px_rgba(0,0,0,0.9)]"
 >
 <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/34">
 {stat.label}
 </p>
 <p className="font-mono text-[28px] font-[250] tracking-[-0.05em] tabular-nums text-foreground/95">
 {stat.value}
 </p>
 <div className="mt-1 flex items-center gap-1">
 {stat.positive ? (
 <TrendingUp className="h-3 w-3 text-success" />
 ) : (
 <TrendingDown className="h-3 w-3 text-destructive" />
 )}
 <span className="text-[11px] font-semibold tabular-nums text-success">
 {stat.change}
 </span>
 </div>
 </div>
 ))}
 </div>

 <div className="relative">
 <div className="absolute inset-0 rounded-[1.6rem] blur-xl bg-primary/10 animate-glow-pulse" />
 <div className="relative h-44 overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-white/[0.03] sm:h-52">
 <div className="absolute inset-0 grid grid-cols-12">
 {Array.from({ length: 12 }).map((_, i) => (
 <div key={i} className="border-r border-white/[0.04]" />
 ))}
 </div>

 <div className="absolute inset-0 flex items-end justify-around px-2 pb-3 sm:px-4 sm:pb-4">
 {bars.map((height, i) => (
 <div
 key={i}
 className="w-3.5 rounded-t-[0.7rem] bg-gradient-to-t from-primary/90 via-primary/55 to-white/20 shadow-[0_0_24px_oklch(0.65_0.22_260/0.18)] sm:w-5"
 style={{ height: `${height}%` }}
 />
 ))}
 </div>

 <div className="absolute inset-y-0 w-px animate-scan bg-primary/60 shadow-[0_0_8px_hsl(var(--primary)/0.4)]" />

 <div className="absolute right-2 top-2 sm:right-4 sm:top-3">
 <span className="rounded-full border border-success/25 bg-success/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-success sm:text-[11px]">
 +$12,847 P&L
 </span>
 </div>
 <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:left-[45%] sm:top-[45%]">
 <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary sm:text-[11px]">
 78% Win Rate
 </span>
 </div>
 <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4">
 <span className="rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-warning sm:text-[11px]">
 2.34 Profit Factor
 </span>
 </div>
 </div>
 </div>

 <div className="rounded-[1.6rem] border border-white/[0.08] bg-white/[0.03] p-4">
 <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/34">
 Recent Trades
 </p>
 <div className="space-y-2.5">
 {[
 { symbol: 'ES', side: 'Long', pnl: '+$420', time: '10:32' },
 { symbol: 'NQ', side: 'Short', pnl: '-$180', time: '10:45' },
 { symbol: 'RTY', side: 'Long', pnl: '+$290', time: '11:15' },
 ].map((trade, i) => (
 <div
 key={i}
 className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-black/20 px-3 py-2 text-sm"
 >
 <div className="flex items-center gap-2 sm:gap-3">
 <span className="font-mono text-[0.85rem] font-semibold text-foreground/95">
 {trade.symbol}
 </span>
 <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/34">{trade.side}</span>
 </div>
 <div className="flex items-center gap-2 sm:gap-3">
 <span
 className={
 trade.pnl.startsWith('+')
 ? 'font-medium tabular-nums text-success'
 : 'font-medium tabular-nums text-destructive'
 }
 >
 {trade.pnl}
 </span>
 <span className="text-[10px] tabular-nums text-foreground/34">{trade.time}</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 )
}
