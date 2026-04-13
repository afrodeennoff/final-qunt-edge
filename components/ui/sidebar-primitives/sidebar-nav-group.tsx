import React, { useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useI18n } from '@/locales/client'
import {
 SidebarGroup,
 SidebarGroupContent,
 SidebarMenu,
 SidebarMenuBadge,
 SidebarMenuButton,
 SidebarMenuItem,
} from '@/components/ui/sidebar'
import { DEFAULT_OPEN_GROUPS } from './use-sidebar-nav'
import type { UnifiedSidebarItem, PendingNavigation } from './types'

const ITEM_BUTTON_CLASS = 'pointer-events-auto rounded-xl font-medium hover:text-sidebar-foreground data-[active=true]:text-sidebar-foreground transition-[opacity,background-color,border-color] duration-150'
const INACTIVE_ITEM_CLASS = 'text-sidebar-foreground/60'
const ACTIVE_ITEM_CLASS = 'bg-sidebar-accent/80 text-sidebar-accent-foreground shadow-[0_0_0_0.5px_oklch(0.65_0.22_260/0.25),inset_0_0_0_0.5px_oklch(0.65_0.22_260/0.12)]'

function isItemPending(
 item: UnifiedSidebarItem,
 pendingNavigation: PendingNavigation | null,
 currentRouteKey: string,
 isItemActive: boolean
) {
 if (!item.href || !pendingNavigation) return false
 return (
 pendingNavigation.href === item.href &&
 pendingNavigation.routeKeyAtSchedule === currentRouteKey &&
 !isItemActive
 )
}

function renderItemIcon(
 item: UnifiedSidebarItem,
 isItemActive: boolean,
 isPending: boolean,
 isLoading: boolean
) {
 const isPendingItem = isPending || (isLoading && isItemActive)
 if (isPendingItem) {
 return <Loader2 className="h-4 w-4 animate-spin shrink-0 text-sidebar-primary" />
 }
 return (
 <span
 className={cn(
 'shrink-0 transition-colors duration-200',
 isItemActive
 ? 'text-sidebar-primary'
 : 'text-sidebar-foreground/60 group-hover/btn:text-sidebar-foreground/80'
 )}
 >
 {item.icon}
 </span>
 )
}

function getItemTextClass(isItemActive: boolean) {
 return cn(
 'ml-3 truncate text-[13px] group-data-[collapsible=icon]:hidden',
 isItemActive
 ? 'font-semibold text-sidebar-foreground tracking-[-0.01em]'
 : 'font-medium text-sidebar-foreground/80 tracking-[-0.005em]'
 )
}

interface SidebarNavGroupProps {
 items: UnifiedSidebarItem[]
 openGroups: Record<string, boolean>
 onGroupOpenChange: (groupName: string, isOpen: boolean) => void
 pendingNavigation: PendingNavigation | null
 currentRouteKey: string
 onNavigate: (href: string) => void
 isLoading: boolean
 isActive: (href: string, exact?: boolean) => boolean
}

// Ordered flat list — group property controls sort order only, no visual headers
const GROUP_ORDER = [
 'Overview',
 'Analysis',
 'Profile & Social',
 'Resources',
 'System',
 'Workspace',
 'Performance',
 'Network',
 'Control',
 'Main',
 'Inventory',
 'Trading',
 'Team Overview',
 'Team Management',
 'Admin Panel',
 'Settings',
 'Support',
 'Admin',
]

function computeFlatOrderedItems(items: UnifiedSidebarItem[]): { items: UnifiedSidebarItem[]; separators: Set<number> } {
 const byGroup: Record<string, UnifiedSidebarItem[]> = {}
 const groupOrder: string[] = []

 items.forEach((item) => {
 const group = item.group || 'Settings'
 if (!byGroup[group]) {
 byGroup[group] = []
 groupOrder.push(group)
 }
 byGroup[group].push(item)
 })

 // Sort groups by predefined order, then alphabetically
 const sortedGroups = groupOrder.sort((a, b) => {
 const aIdx = GROUP_ORDER.indexOf(a)
 const bIdx = GROUP_ORDER.indexOf(b)
 if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
 if (aIdx !== -1) return -1
 if (bIdx !== -1) return 1
 return a.localeCompare(b)
 })

 const flatItems: UnifiedSidebarItem[] = []
 const separators = new Set<number>()

 for (const groupName of sortedGroups) {
 if (byGroup[groupName].length === 0) continue
 // Add separator before each group (except the first)
 if (flatItems.length > 0) {
 separators.add(flatItems.length)
 }
 flatItems.push(...byGroup[groupName])
 }

 return { items: flatItems, separators }
}

const SidebarNavGroupInner = React.memo(function SidebarNavGroupInner({
 items: allItems,
 openGroups,
 onGroupOpenChange,
 pendingNavigation,
 currentRouteKey,
 onNavigate,
 isLoading,
 isActive,
}: SidebarNavGroupProps) {
 const t = useI18n()
 const translate = t as unknown as (key: string) => string

 const { items: flatItems, separators } = useMemo(
 () => computeFlatOrderedItems(allItems),
 [allItems]
 )

 return (
 <SidebarGroup className="px-0 py-1.5">
 <SidebarGroupContent>
 <SidebarMenu>
 {flatItems.map((item, index) => {
 const label = item.i18nKey ? translate(item.i18nKey) : item.label
 const href = item.href
 const isItemDisabled = Boolean(item.disabled)
 const itemIsActive =
 !isItemDisabled && !!href && isActive(href, item.exact)
 const isPendingItem = isItemPending(item, pendingNavigation, currentRouteKey, itemIsActive)
 const showSeparator = separators.has(index)

 return (
 <React.Fragment key={`${item.label}-${index}`}>
 {showSeparator && (
 <div className="mx-3 my-1.5 h-px bg-sidebar-border/40" />
 )}
 <SidebarMenuItem className="relative">
 {itemIsActive && (
 <div className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r-full bg-sidebar-primary shadow-[0_0_14px_hsl(var(--sidebar-primary)/0.65)]" />
 )}
 {href ? (
 <SidebarMenuButton
 asChild
 isActive={itemIsActive}
 tooltip={label}
 disabled={isItemDisabled}
 className={cn(
 ITEM_BUTTON_CLASS,
 itemIsActive ? ACTIVE_ITEM_CLASS : INACTIVE_ITEM_CLASS
 )}
 >
 <Link
 href={href}
 prefetch={false}
 onClick={() => onNavigate(href)}
 className="flex w-full items-center"
 aria-busy={isPendingItem}
 >
 {renderItemIcon(item, itemIsActive, isPendingItem, isLoading)}
 <span className={getItemTextClass(itemIsActive)}>
 {label}
 </span>
 </Link>
 </SidebarMenuButton>
 ) : (
 <SidebarMenuButton
 isActive={itemIsActive}
 tooltip={label}
 disabled={isItemDisabled}
 onClick={() => item.action?.()}
 className={cn(
 ITEM_BUTTON_CLASS,
 itemIsActive ? ACTIVE_ITEM_CLASS : INACTIVE_ITEM_CLASS
 )}
 >
 <div className="flex w-full items-center">
 {renderItemIcon(item, itemIsActive, false, false)}
 <span className={getItemTextClass(itemIsActive)}>
 {label}
 </span>
 </div>
 </SidebarMenuButton>
 )}
 {item.badge && (
 <SidebarMenuBadge className="group-data-[collapsible=icon]:hidden">
 {item.badge}
 </SidebarMenuBadge>
 )}
 </SidebarMenuItem>
 </React.Fragment>
 )
 })}
 </SidebarMenu>
 </SidebarGroupContent>
 </SidebarGroup>
 )
})

export { SidebarNavGroupInner as SidebarNavGroup }
export type { SidebarNavGroupProps }
