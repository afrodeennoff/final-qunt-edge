'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import { cn } from '@/lib/utils'
import { useNavigationLoading } from '@/hooks/use-navigation-loading'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarMenu,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'

import {
  useActiveLink,
  stripLocalePrefix,
  NAVIGATION_STALL_TIMEOUT_MS,
  DEFAULT_OPEN_GROUPS,
} from './sidebar-primitives/use-sidebar-nav'
import { SidebarLogoHeader } from './sidebar-primitives/sidebar-logo-header'
import { SidebarNavGroup } from './sidebar-primitives/sidebar-nav-group'
import { SidebarUserMenu } from './sidebar-primitives/sidebar-user-menu'
import type { UnifiedSidebarItem, UnifiedSidebarConfig, PendingNavigation } from './sidebar-primitives/types'

export type { UnifiedSidebarItem, UnifiedSidebarConfig, PendingNavigation }
export { useActiveLink }

const SIDEBAR_ROUTE_PREFIXES = ['/dashboard', '/teams', '/admin']

function isSidebarEnabledRoute(pathname: string): boolean {
  const normalized = stripLocalePrefix(pathname).replace(/\/$/, '') || '/'
  return SIDEBAR_ROUTE_PREFIXES.some((prefix) => {
    if (normalized === prefix) return true
    if (normalized.startsWith(`${prefix}/`)) return true
    return false
  })
}

function buildCurrentRouteKey(pathname: string | null, searchParams: ReturnType<typeof useSearchParams>): string {
  if (!pathname) return '/'
  const currentSearch = searchParams?.toString()
  return currentSearch ? `${pathname}?${currentSearch}` : pathname
}

function getUserInitials(user?: UnifiedSidebarConfig['user']) {
  const raw = user?.full_name || user?.email || 'User'
  const parts = raw
    .replace(/@.*/, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  if (parts.length === 0) return 'U'
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('')
}

function buildOpenGroups(items: UnifiedSidebarItem[]): Record<string, boolean> {
  const groups: Record<string, boolean> = {}
  const itemGroups = new Set(items.map((item) => item.group || 'Settings'))
  for (const groupName of itemGroups) {
    groups[groupName] = DEFAULT_OPEN_GROUPS.has(groupName)
  }
  return groups
}

export function UnifiedSidebar({
  items,
  user,
  actions,
  timezone,
  onLogout,
  styleVariant = 'default',
}: UnifiedSidebarConfig) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentRouteKey = useMemo(
    () => buildCurrentRouteKey(pathname, searchParams),
    [pathname, searchParams]
  )
  const hasItems = items && items.length > 0
  const shouldRenderSidebar = useMemo(
    () => isSidebarEnabledRoute(pathname || '/') || hasItems,
    [pathname, hasItems]
  )

  const { isMobile, setOpenMobile } = useSidebar()
  const isActive = useActiveLink()
  const { isLoading } = useNavigationLoading()

  const [pendingNavigation, setPendingNavigation] = useState<PendingNavigation | null>(null)
  const openGroups = useMemo(() => buildOpenGroups(items), [items])
  const navigationFallbackTimerRef = useRef<number | null>(null)

  const clearNavigationFallbackTimer = useCallback(() => {
    if (navigationFallbackTimerRef.current === null) return
    window.clearTimeout(navigationFallbackTimerRef.current)
    navigationFallbackTimerRef.current = null
  }, [])

  const scheduleNavigationFallback = useCallback((href: string) => {
    clearNavigationFallbackTimer()
    navigationFallbackTimerRef.current = window.setTimeout(() => {
      const targetUrl = new URL(href, window.location.origin)
      const isAlreadyAtTarget =
        targetUrl.pathname === window.location.pathname &&
        targetUrl.search === window.location.search

      if (!isAlreadyAtTarget) {
        window.location.assign(targetUrl.toString())
      }
    }, NAVIGATION_STALL_TIMEOUT_MS)
  }, [clearNavigationFallbackTimer])

  useEffect(() => {
    clearNavigationFallbackTimer()
  }, [clearNavigationFallbackTimer, currentRouteKey])

  useEffect(() => {
    return () => {
      clearNavigationFallbackTimer()
    }
  }, [clearNavigationFallbackTimer])

  const [groupStates, setGroupStates] = useState<Record<string, boolean>>({})

  const handleGroupOpenChange = useCallback((groupName: string, isOpen: boolean) => {
    setGroupStates((previous) => {
      if (previous[groupName] === isOpen) return previous
      return {
        ...previous,
        [groupName]: isOpen,
      }
    })
  }, [])

  const mergedOpenGroups = useMemo(() => {
    return { ...openGroups, ...groupStates }
  }, [openGroups, groupStates])

  const handleNavigate = useCallback(
    (href: string) => {
      setPendingNavigation({
        href,
        routeKeyAtSchedule: currentRouteKey,
      })
      scheduleNavigationFallback(href)
      if (isMobile) {
        setOpenMobile(false)
      }
    },
    [currentRouteKey, scheduleNavigationFallback, isMobile, setOpenMobile]
  )

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'User'
  const initials = useMemo(() => getUserInitials(user), [user])

  return shouldRenderSidebar ? (
    <SidebarContentRender
      items={items}
      actions={actions}
      user={user}
      timezone={timezone}
      onLogout={onLogout}
      displayName={displayName}
      initials={initials}
      openGroups={mergedOpenGroups}
      pendingNavigation={pendingNavigation}
      currentRouteKey={currentRouteKey}
      isLoading={isLoading}
      isActive={isActive}
      isMobile={isMobile}
      styleVariant={styleVariant}
      onGroupOpenChange={handleGroupOpenChange}
      onNavigate={handleNavigate}
    />
  ) : null
}

function SidebarContentRender({
  items,
  actions,
  user,
  timezone,
  onLogout,
  displayName,
  initials,
  openGroups,
  pendingNavigation,
  currentRouteKey,
  isLoading,
  isActive,
  isMobile,
  styleVariant,
  onGroupOpenChange,
  onNavigate,
}: {
  items: UnifiedSidebarItem[]
  actions?: React.ReactNode
  user?: UnifiedSidebarConfig['user']
  timezone?: UnifiedSidebarConfig['timezone']
  onLogout?: () => void
  displayName: string
  initials: string
  openGroups: Record<string, boolean>
  pendingNavigation: PendingNavigation | null
  currentRouteKey: string
  isLoading: boolean
  isActive: (href: string, exact?: boolean) => boolean
  isMobile: boolean
  styleVariant?: 'default' | 'minimal'
  onGroupOpenChange: (groupName: string, isOpen: boolean) => void
  onNavigate: (href: string) => void
}) {
  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      className={cn(
        'pointer-events-auto overflow-hidden text-sidebar-foreground',
        styleVariant === 'minimal' ? 'bg-sidebar/94' : 'bg-sidebar/96'
      )}
    >
      <SidebarHeader className="px-3 py-3">
        <SidebarLogoHeader />
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto px-3 py-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-sidebar-border/30 hover:scrollbar-thumb-sidebar-border/45 scrollbar-w-[3px]">
        <SidebarNavGroup
          items={items}
          openGroups={openGroups}
          onGroupOpenChange={onGroupOpenChange}
          pendingNavigation={pendingNavigation}
          currentRouteKey={currentRouteKey}
          onNavigate={onNavigate}
          isLoading={isLoading}
          isActive={isActive}
        />

        {actions && (
          <SidebarGroup className="mt-auto px-0 pb-1 pt-3">
            <SidebarMenu>{actions}</SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarUserMenu
          user={user}
          timezone={timezone}
          onLogout={onLogout}
          displayName={displayName}
          initials={initials}
          isMobile={isMobile}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
