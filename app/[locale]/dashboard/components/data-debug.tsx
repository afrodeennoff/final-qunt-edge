"use client"

import {
 useDashboardAccountsList,
 useDashboardActions,
 useDashboardIsLoading,
 useDashboardStats,
 useDashboardTradeItems,
} from "@/context/data-provider"
import { useUserStore } from "@/store/user-store"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Bug, X, RefreshCw, HardDrive } from "lucide-react"
import { clearAllCache } from "@/lib/indexeddb/trades-cache"
import { cn } from "@/lib/utils"

export function DataDebug() {
 const trades = useDashboardTradeItems()
 const accounts = useDashboardAccountsList()
 const isLoading = useDashboardIsLoading()
 const { formattedTrades } = useDashboardStats()
 const { refreshAllData } = useDashboardActions()
 const user = useUserStore((state) => state.user)
 const supabaseUser = useUserStore((state) => state.supabaseUser)
 const [isOpen, setIsOpen] = useState(false)

 const handleClearCache = async () => {
 const userIds = Array.from(new Set([user?.id, supabaseUser?.id].filter(Boolean) as string[]))
 if (userIds.length > 0) {
 await Promise.all(userIds.map((userId) => clearAllCache(userId)))
 window.location.reload()
 }
 }

 const isMock = trades.length > 0 && trades[0].id.startsWith('mock-')

 return (
 <div className="fixed bottom-4 right-4 z-[9999]">
 {!isOpen ? (
 <Button 
 variant="outline"
 size="icon"
 onClick={() => setIsOpen(true)}
 className="rounded-full bg-background/80 border-border/30 hover:bg-foreground/10 shadow-sm"
 >
 <Bug className="h-4 w-4 text-primary" />
 </Button>
 ) : (
 <div className="w-80 bg-background/90 border-0 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
 <div className="flex items-center justify-between mb-4 border-b-0 pb-2">
 <div className="flex items-center gap-2">
 <Bug className="h-4 w-4 text-primary" />
 <span className="text-xs font-bold uppercase tracking-widest text-foreground">Debug Dashboard</span>
 </div>
 <button onClick={() => setIsOpen(false)} className="text-foreground hover:text-foreground transition-colors">
 <X className="h-4 w-4" />
 </button>
 </div>

 <div className="space-y-3">
 <div className="flex justify-between items-center text-[10px]">
 <span className="text-foreground uppercase font-black tracking-tighter">Trades in Store</span>
 <span className="text-foreground font-mono">{trades.length}</span>
 </div>
 <div className="flex justify-between items-center text-[10px]">
 <span className="text-foreground uppercase font-black tracking-tighter">Filtered Trades</span>
 <span className="text-foreground font-mono">{formattedTrades.length}</span>
 </div>
 <div className="flex justify-between items-center text-[10px]">
 <span className="text-foreground uppercase font-black tracking-tighter">Accounts</span>
 <span className="text-foreground font-mono">{accounts.length}</span>
 </div>
 <div className="flex justify-between items-center text-[10px]">
 <span className="text-foreground uppercase font-black tracking-tighter">Environment</span>
 <span className={cn("font-mono", process.env.NODE_ENV === 'development' ?"text-semantic-success" :"text-semantic-warning")}>
 {process.env.NODE_ENV}
 </span>
 </div>
 <div className="flex justify-between items-center text-[10px]">
 <span className="text-foreground uppercase font-black tracking-tighter">Data Logic</span>
 <span className={cn("font-mono px-1.5 py-0.5 rounded text-[8px]", isMock ?"bg-semantic-warning-bg/10 text-semantic-warning" :"bg-semantic-success-bg/10 text-semantic-success")}>
 {isMock ?"MOCK (Fallback)" :"LIVE (Synced)"}
 </span>
 </div>
 <div className="flex justify-between items-center text-[10px]">
 <span className="text-foreground uppercase font-black tracking-tighter">User ID</span>
 <span className="text-foreground font-mono truncate max-w-[120px]">
 {user?.id || supabaseUser?.id ||"None"}
 </span>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-2 mt-6">
 <Button 
 variant="outline"
 size="sm"
 onClick={() => refreshAllData({ force: true })}
 disabled={isLoading}
 className="h-8 text-[9px] font-bold uppercase tracking-widest border-border/30 bg-foreground/5 hover:bg-foreground/10"
 >
 <RefreshCw className={cn("h-3 w-3 mr-2", isLoading &&"animate-spin")} />
 Sync Now
 </Button>
 <Button 
 variant="outline"
 size="sm"
 onClick={handleClearCache}
 className="h-8 text-[9px] font-bold uppercase tracking-widest border-semantic-error-border/20 bg-semantic-error-bg/5 hover:bg-semantic-error-bg/10 text-semantic-error"
 >
 <HardDrive className="h-3 w-3 mr-2" />
 Reset Cache
 </Button>
 </div>
 </div>
 )}
 </div>
 )
}
