"use client"

import { useState, useCallback, useEffect } from "react"
import { RefreshCw, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSyncContext } from "@/context/sync-context"
import { useRithmicSyncStore } from "@/store/rithmic-sync-store"
import { useDashboardActions } from "@/context/data-provider"
import { toast } from "sonner"
import { useScopedI18n } from "@/locales/client"
import { getAllRithmicData } from "@/lib/rithmic-storage"
import { safeArrayMax } from '@/lib/array-utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

export function GlobalSyncButton() {
    const t = useScopedI18n('dashboard')
    const { tradovate, manualSync } = useSyncContext()
    const { refreshAllData } = useDashboardActions()
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Rithmic state
    const {
        isAutoSyncing: isRithmicSyncing,
        syncInterval: rithmicInterval,
        autoSyncEnabled: rithmicAutoEnabled,
        setAutoSyncEnabled: setRithmicAutoEnabled
    } = useRithmicSyncStore()

    // Tradovate state
    const isTradovateSyncing = tradovate.isAutoSyncing
    const isAnySyncing = isRithmicSyncing || isTradovateSyncing || isRefreshing

    const handleGlobalSync = useCallback(async () => {
        if (isAnySyncing) return

        setIsRefreshing(true)
        const toastId = toast.loading(t('refreshData'))

        try {
            // 1. Sync Rithmic
            const rithmicCredentials = await getAllRithmicData()
            const rithmicIds = Object.keys(rithmicCredentials)

            for (const id of rithmicIds) {
                await manualSync('rithmic', id)
            }

            // 2. Sync Tradovate with skipRefresh to avoid duplicate refresh
            await tradovate.performSyncForAllAccounts({ skipRefresh: true })

            // 3. Single refresh client data from DB (deduped)
            await refreshAllData({ force: true })

            toast.success(t('refreshSuccess'), { id: toastId })
        } catch (error) {
            console.error("Global sync error:", error)
            toast.error(t('refreshError'), { id: toastId })
        } finally {
            setIsRefreshing(false)
        }
    }, [isAnySyncing, manualSync, tradovate, refreshAllData, t])

    // Calculate time until next auto-sync (approximate based on latest sync)
    const [nextSyncText, setNextSyncText] = useState<string>("")

    useEffect(() => {
        const updateNextSync = async () => {
            if (typeof document !== "undefined" && document.visibilityState === "hidden") {
                return
            }
            const rithmicData = await getAllRithmicData()
            const rithmicTimestamps = Object.values(rithmicData).map(d => new Date(d.lastSyncTime).getTime())
            const latestRithmicSync = rithmicTimestamps.length > 0 ? safeArrayMax(rithmicTimestamps) : 0

            const tradovateSyncs = tradovate.accounts
            const tradovateTimestamps = tradovateSyncs.map(a => new Date(a.lastSyncedAt).getTime())
            const latestTradovateSync = tradovateTimestamps.length > 0 ? safeArrayMax(tradovateTimestamps) : 0

            const lastSync = Math.max(latestRithmicSync, latestTradovateSync)
            if (lastSync === 0) {
                setNextSyncText("Never")
                return
            }

            const intervalMs = Math.min(rithmicInterval, tradovate.syncInterval) * 60 * 1000
            const nextSyncDate = new Date(lastSync + intervalMs)
            const diff = nextSyncDate.getTime() - Date.now()

            if (diff <= 0) {
                setNextSyncText("Due")
            } else {
                const mins = Math.floor(diff / 60000)
                const secs = Math.floor((diff % 60000) / 1000)
                setNextSyncText(`${mins}m ${secs}s`)
            }
        }

        const interval = setInterval(updateNextSync, 30000)
        updateNextSync()
        return () => clearInterval(interval)
    }, [rithmicInterval, tradovate.syncInterval, tradovate.accounts])

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "group relative flex h-9 items-center gap-2 rounded-full border px-3.5 transition-all duration-200",
                        isAnySyncing
                            ? "cursor-wait border-v2-accent/20 bg-v2-accent/10 text-v2-text-primary"
                            : "border-transparent bg-transparent text-v2-text-secondary hover:bg-v2-bg-hover/70 hover:text-v2-text-primary"
                    )}
                >
                    <RefreshCw className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-700",
                        isAnySyncing ? "animate-spin" : "group-hover:rotate-180"
                    )} />

                    <div className="hidden items-center gap-1 xl:flex">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                            {isAnySyncing ? "Syncing" : "Sync"}
                        </span>
                        {!isAnySyncing && (rithmicAutoEnabled || tradovate.enableAutoSync) && (
                            <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-v2-text-muted transition-colors group-hover:text-v2-text-secondary">
                                Auto
                            </span>
                        )}
                    </div>

                    {isAnySyncing && (
                        <div className="absolute inset-0 -z-10 rounded-full bg-primary/10 blur-md" />
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 rounded-2xl border border-v2-border/20 bg-v2-bg-surface/95 text-popover-foreground shadow-xl shadow-black/20 backdrop-blur-xl">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest">Sync Status</span>
                    {isAnySyncing ? (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[8px] animate-pulse">Syncing...</Badge>
                    ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[8px]">Standby</Badge>
                    )}
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-border/40" />

                <div className="p-2 space-y-3">
                    {/* Auto Sync Rithmic */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold">Rithmic Auto-Sync</span>
                            <span className="text-[8px] text-muted-foreground">Every {rithmicInterval} minutes</span>
                        </div>
                        <Switch
                            checked={rithmicAutoEnabled}
                            onCheckedChange={setRithmicAutoEnabled}
                        />
                    </div>

                    {/* Auto Sync Tradovate */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold">Tradovate Auto-Sync</span>
                            <span className="text-[8px] text-muted-foreground">Every {tradovate.syncInterval} minutes</span>
                        </div>
                        <Switch
                            checked={tradovate.enableAutoSync}
                            onCheckedChange={tradovate.setEnableAutoSync}
                        />
                    </div>
                </div>

                <DropdownMenuSeparator className="bg-border/40" />

                <div className="p-2">
                    <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Next Sync</span>
                        </div>
                        <span className="font-mono text-foreground">{nextSyncText}</span>
                    </div>

                    <button
                        type="button"
                        onClick={handleGlobalSync}
                        disabled={isAnySyncing}
                        className="flex h-9 w-full items-center justify-center gap-2 rounded-full border border-v2-border/20 bg-v2-bg-base/70 text-[10px] font-bold uppercase tracking-[0.18em] text-v2-text-primary transition-all hover:border-v2-border/35 hover:bg-v2-bg-hover disabled:opacity-50"
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5", isAnySyncing && "animate-spin")} />
                        <span>Force Sync Now</span>
                    </button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
