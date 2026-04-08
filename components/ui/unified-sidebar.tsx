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

// Re-export public types
export type { UnifiedSidebarItem, UnifiedSidebarConfig, PendingNavigation }

// Re-export hook
export { useActiveLink }

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
  const normalizedPathname = stripLocalePrefix(pathname || '/').replace(/\/$/, '') || '/'
  const currentRouteKey = useMemo(() => {
    const currentSearch = searchParams?.toString()
    return currentSearch ? `${pathname || '/'}?${currentSearch}` : (pathname || '/')
  }, [pathname, searchParams])
  const isSidebarEnabledRoute =
    normalizedPathname === '/dashboard' ||
    normalizedPathname.startsWith('/dashboard/') ||
    normalizedPathname === '/teams' ||
    normalizedPathname.startsWith('/teams/') ||
    normalizedPathname === '/admin' ||
    normalizedPathname.startsWith('/admin/')

  const hasItems = items && items.length > 0
  const shouldRenderSidebar = isSidebarEnabledRoute || hasItems

  const { isMobile, setOpenMobile } = useSidebar()
  const isActive = useActiveLink()
  const { isLoading } = useNavigationLoading() // Need to import this

  const [pendingNavigation, setPendingNavigation] = useState<PendingNavigation | null>(null)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
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

  const handleGroupOpenChange = useCallback((groupName: string, isOpen: boolean) => {
    setOpenGroups((previous) => {
      if (previous[groupName] === isOpen) return previous
      return {
        ...previous,
        [groupName]: isOpen,
      }
    })
  }, [])

  // Initialize open groups based on items
  useEffect(() => {
    setOpenGroups((previous) => {
      const next: Record<string, boolean> = { ...previous }
      let hasChanges = false

      // Get groups from items
      const itemGroups = new Set(items.map((item) => item.group || 'Settings'))
      for (const groupName of itemGroups) {
        if (!(groupName in next)) {
          next[groupName] = DEFAULT_OPEN_GROUPS.has(groupName)
          hasChanges = true
        }
      }

      // Clean up removed groups
      for (const groupName of Object.keys(next)) {
        if (!itemGroups.has(groupName)) {
          delete next[groupName]
          hasChanges = true
        }
      }

      return hasChanges ? next : previous
    })
  }, [items])

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
    <Sidebar
      collapsible="icon"
      className={cn(
        'pointer-events-auto overflow-hidden bg-sidebar text-sidebar-foreground',
        styleVariant === 'minimal'
          ? 'border-r border-sidebar-border/12'
          : 'border-r border-sidebar-border/25'
      )}
    >
      <SidebarHeader className="h-16 border-b border-sidebar-border/12 px-2 py-2">
        <SidebarLogoHeader />
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-sidebar-border/30 hover:scrollbar-thumb-sidebar-border/45 scrollbar-w-[3px]">
        <SidebarNavGroup
          items={items}
          openGroups={openGroups}
          onGroupOpenChange={handleGroupOpenChange}
          pendingNavigation={pendingNavigation}
          currentRouteKey={currentRouteKey}
          onNavigate={handleNavigate}
          isLoading={isLoading}
          isActive={isActive}
        />

        {actions && (
          <SidebarGroup className="mt-auto border-t border-sidebar-border/15 px-0 pb-1 pt-3">
            <SidebarMenu>{actions}</SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/15 p-2">
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
  ) : null
}