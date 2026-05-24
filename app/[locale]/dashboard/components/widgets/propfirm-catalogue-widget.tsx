"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useI18n } from "@/locales/client"
import { useCurrentLocale } from "@/locales/client"
import { WidgetShell } from "@/components/ui/widget-shell"
import { Building2, Users, DollarSign } from "lucide-react"
import { getPropfirmCatalogueData } from "@/app/[locale]/(landing)/propfirms/actions/get-propfirm-catalogue"
import type { PropfirmCatalogueStats } from "@/app/[locale]/(landing)/propfirms/actions/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getVerifiedPropFirmProfileByName } from '@/lib/prop-firms/verified-profiles'

function fallbackSlugifyFirmName(name: string): string {
 return name
 .trim()
 .toLowerCase()
 .replace(/[^a-z0-9]+/g, '-')
 .replace(/^-+|-+$/g, '')
}

function getFirmSlugFromName(name: string): string {
 const mapped = getVerifiedPropFirmProfileByName(name)?.slug
 return mapped ?? fallbackSlugifyFirmName(name)
}

export default function PropfirmCatalogueWidget() {
 const t = useI18n()
 const locale = useCurrentLocale()
 const [stats, setStats] = useState<PropfirmCatalogueStats[]>([])
 const [isLoading, setIsLoading] = useState(true)
 const sortedStats = useMemo(
 () => [...stats].sort((a, b) => b.payouts.paidAmount - a.payouts.paidAmount),
 [stats]
 )

 useEffect(() => {
 async function fetchData() {
 try {
 const { stats: fetchedStats } = await getPropfirmCatalogueData('allTime')
 setStats(fetchedStats)
 } catch (error) {
 console.warn("Failed to fetch propfirm catalogue:", error)
 } finally {
 setIsLoading(false)
 }
 }
 fetchData()
 }, [])

 return (
 <WidgetShell
 title={t('landing.propfirms.title')}
 icon={<Building2 className="h-4 w-4" />}
 state={isLoading ?"loading" : stats.length > 0 ?"ready" :"empty"}
 emptyMessage="No propfirm activity tracked yet."
 >
 <ScrollArea className="h-full">
 <div className="flex flex-col gap-1 p-3">
{sortedStats.map((stat) => (
 <Link
 key={stat.propfirmName}
 href={`/${locale}/firm/${getFirmSlugFromName(stat.propfirmName)}`}
 className="block"
 >
 <div className="relative rounded-xl border border-border/10 bg-card/60 shadow-sm overflow-hidden transition-[opacity,background-color,border-color] duration-300 hover:border-border/30 hover:shadow-sm flex items-center justify-between p-3 cursor-pointer">
 <div className="flex flex-col gap-1 min-w-0">
 <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/35 truncate">{stat.propfirmName}</span>
 <div className="flex items-center gap-3">
 <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
 <Users className="w-3 h-3 text-muted-foreground" />
 <span>{stat.accountsCount}</span>
 </div>
 <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
 <DollarSign className="w-3 h-3 text-muted-foreground" />
 <span className="font-medium text-foreground">{stat.payouts.paidCount} Payouts</span>
 </div>
 </div>
 </div>
 <div className="text-right shrink-0">
 <div className="text-[28px] font-[250] tracking-[-0.04em] text-foreground tabular-nums leading-none">
 ${stat.payouts.paidAmount > 1000
 ? `${(stat.payouts.paidAmount / 1000).toFixed(1)}k`
 : stat.payouts.paidAmount.toLocaleString()}
 </div>
 <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/35">
 Paid
 </div>
 </div>
 </div>
 </Link>
 ))}
 </div>
 </ScrollArea>
 </WidgetShell>
 )
}
