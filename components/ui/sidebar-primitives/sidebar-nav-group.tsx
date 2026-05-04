import React, { useMemo } from 'react'
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
import type { UnifiedSidebarItem, PendingNavigation } from './types'

const ITEM_BUTTON_CLASS =
  'pointer-events-auto h-[30px] rounded-[7px] px-2.5 gap-2 font-medium text-[13px] tracking-[-0.005em] hover:bg-muted/50 hover:text-foreground/90 transition-[background-color,border-color,color] duration-[120ms] ease-[cubic-bezier(0.16,1,0.3,1)] data-[active=true]:bg-primary/10 data-[active=true]:border data-[active=true]:border-primary/20 data-[active=true]:text-foreground data-[active=true]:shadow-[0_1px_3px_rgba(0,0,0,0.24)]'
const INACTIVE_ITEM_CLASS = 'text-muted-foreground/72'
const ACTIVE_ITEM_CLASS =
  'font-semibold text-foreground tracking-[-0.01em]'

function isItemPending(
  item: UnifiedSidebarItem,
  pendingNavigation: PendingNavigation | null,
  currentRouteKey: string,
  isItemActive: boolean,
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
  isLoading: boolean,
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
          ? 'text-primary'
          : 'text-muted-foreground/55 group-hover/btn:text-muted-foreground/75',
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
      ? 'font-semibold text-foreground tracking-[-0.01em]'
      : 'font-medium text-muted-foreground/72 tracking-[-0.005em]',
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
  'Workspace',
  'Review',
  'Tools',
  'Profile',
  'Resources',
  'System',
]

function computeFlatOrderedItems(items: UnifiedSidebarItem[]): {
  items: UnifiedSidebarItem[]
  separators: Set<number>
} {
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
  openGroups: _openGroups,
  onGroupOpenChange: _onGroupOpenChange,
  pendingNavigation,
  currentRouteKey,
  onNavigate,
  isLoading,
  isActive,
}: SidebarNavGroupProps) {
  const t = useI18n()
  const translate = t as unknown as (key: string) => string
  void _openGroups
  void _onGroupOpenChange

  const { items: flatItems, separators } = useMemo(
    () => computeFlatOrderedItems(allItems),
    [allItems],
  )

  return (
    <SidebarGroup className="px-0 py-2">
      <SidebarGroupContent>
        <SidebarMenu>
          {flatItems.map((item, index) => {
            const label = item.i18nKey ? translate(item.i18nKey) : item.label
            const href = item.href
            const isItemDisabled = Boolean(item.disabled)
            const itemIsActive = !isItemDisabled && !!href && isActive(href, item.exact)
            const isPendingItem = isItemPending(
              item,
              pendingNavigation,
              currentRouteKey,
              itemIsActive,
            )
            const showSeparator = separators.has(index)

            return (
              <React.Fragment key={`${item.label}-${index}`}>
                {showSeparator && <div className="mx-3 my-2.5 h-px bg-sidebar-border/22" />}
                <SidebarMenuItem className="relative">
                  {itemIsActive && (
                    <div className="absolute left-0 top-1/2 h-9 w-[3px] -translate-y-1/2 rounded-r-full bg-sidebar-primary/85" />
                  )}
                  {href ? (
                    <SidebarMenuButton
                      asChild
                      isActive={itemIsActive}
                      tooltip={label}
                      disabled={isItemDisabled}
                      className={cn(
                        ITEM_BUTTON_CLASS,
                        itemIsActive ? ACTIVE_ITEM_CLASS : INACTIVE_ITEM_CLASS,
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
                        <span className={getItemTextClass(itemIsActive)}>{label}</span>
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
                        itemIsActive ? ACTIVE_ITEM_CLASS : INACTIVE_ITEM_CLASS,
                      )}
                    >
                      <div className="flex w-full items-center">
                        {renderItemIcon(item, itemIsActive, false, false)}
                        <span className={getItemTextClass(itemIsActive)}>{label}</span>
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
