import React from 'react'
import Link from 'next/link'
import { ChevronRight, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useI18n } from '@/locales/client'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { DEFAULT_OPEN_GROUPS } from './use-sidebar-nav'
import type { UnifiedSidebarItem, PendingNavigation } from './types'

const ITEM_BUTTON_CLASS = 'pointer-events-auto h-10 rounded-xl px-2.5 font-medium transition-colors duration-200 hover:text-sidebar-foreground data-[active=true]:text-sidebar-foreground group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0!'
const INACTIVE_ITEM_CLASS = 'text-sidebar-foreground/78 hover:bg-sidebar-primary/10 hover:text-sidebar-foreground'
const ACTIVE_ITEM_CLASS = 'bg-sidebar-primary/14 text-sidebar-foreground ring-1 ring-sidebar-primary/22 shadow-[inset_0_1px_0_hsl(var(--foreground)_/_0.03)]'

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
    'ml-3 truncate group-data-[collapsible=icon]:hidden',
    isItemActive
      ? 'font-semibold text-sidebar-foreground'
      : 'text-sidebar-foreground'
  )
}

export interface SidebarNavGroupProps {
  items: UnifiedSidebarItem[]
  openGroups: Record<string, boolean>
  onGroupOpenChange: (groupName: string, isOpen: boolean) => void
  pendingNavigation: PendingNavigation | null
  currentRouteKey: string
  onNavigate: (href: string) => void
  isLoading: boolean
  isActive: (href: string, exact?: boolean) => boolean
}

interface GroupedData {
  groups: Record<string, UnifiedSidebarItem[]>
  order: string[]
}

function computeGroupedItems(items: UnifiedSidebarItem[]): GroupedData {
  const order: string[] = []
  const groups: Record<string, UnifiedSidebarItem[]> = {}

  items.forEach((item) => {
    const group = item.group || 'Settings'
    if (!groups[group]) {
      groups[group] = []
      order.push(group)
    }
    groups[group].push(item)
  })

  const sortedOrder = order.sort((a, b) => {
    const topGroups = [
      'Overview',
      'Main',
      'Inventory',
      'Trading',
      'Team Overview',
      'Team Management',
      'Admin Panel',
    ]
    const bottomGroups = ['System', 'Settings', 'Support', 'Admin']

    const aIdxTop = topGroups.indexOf(a)
    const bIdxTop = topGroups.indexOf(b)
    if (aIdxTop !== -1 && bIdxTop !== -1) return aIdxTop - bIdxTop
    if (aIdxTop !== -1) return -1
    if (bIdxTop !== -1) return 1

    const aIdxBot = bottomGroups.indexOf(a)
    const bIdxBot = bottomGroups.indexOf(b)
    if (aIdxBot !== -1 && bIdxBot !== -1) return aIdxBot - bIdxBot
    if (aIdxBot !== -1) return 1
    if (bIdxBot !== -1) return -1

    return a.localeCompare(b)
  })

  return { groups, order: sortedOrder }
}

export function SidebarNavGroup({
  items,
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

  const groupedItems = React.useMemo(
    () => computeGroupedItems(items),
    [items]
  )

  return (
    <>
      {groupedItems.order.map((groupName, groupIndex) => (
        <Collapsible
          key={groupName}
          open={openGroups[groupName] ?? DEFAULT_OPEN_GROUPS.has(groupName)}
          onOpenChange={(isOpen) => onGroupOpenChange(groupName, isOpen)}
          className="group/collapsible"
        >
          <SidebarGroup className="px-0 py-1.5">
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel
                className="mb-1.5 flex cursor-pointer items-center justify-between pl-2 text-[9px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/35 hover:text-sidebar-foreground/55"
                id={`sidebar-group-${groupIndex}`}
              >
                <span>{groupName}</span>
                <ChevronRight className="size-3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu aria-labelledby={`sidebar-group-${groupIndex}`}>
                  {groupedItems.groups[groupName].map((item, index) => {
                    const label = item.i18nKey ? translate(item.i18nKey) : item.label
                    const href = item.href
                    const isItemDisabled = Boolean(item.disabled)
                    const itemIsActive =
                      !isItemDisabled && !!href && isActive(href, item.exact)
                    const isPendingItem = isItemPending(item, pendingNavigation, currentRouteKey, itemIsActive)

                    return (
                      <SidebarMenuItem
                        key={`${groupName}-${item.label}-${index}`}
                        className="relative"
                      >
                        {itemIsActive && (
                          <div className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-sidebar-primary" />
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
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      ))}
    </>
  )
}