"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { ChevronRight, LogOut, MoreHorizontal, Loader2 } from "lucide-react"

import { Logo } from "@/components/logo"
import { NAVIGATION_TIMEOUT_MS } from "@/lib/constants/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { useI18n } from "@/locales/client"
import { useNavigationLoading } from "@/hooks/use-navigation-loading"

type PendingNavigation = {
  href: string
  routeKeyAtSchedule: string
}

export interface UnifiedSidebarItem {
  href?: string
  icon: React.ReactNode
  label: string
  i18nKey?: string
  action?: () => void
  badge?: React.ReactNode
  group?: string
  disabled?: boolean
  exact?: boolean
}

export interface UnifiedSidebarConfig {
  items: UnifiedSidebarItem[]
  user?: {
    avatar_url?: string
    email?: string
    full_name?: string
  }
  actions?: React.ReactNode
  showSubscription?: boolean
  timezone?: {
    value: string
    options: string[]
    onChange: (value: string) => void
  }
  onLogout?: () => void
  styleVariant?: "default" | "minimal" // Simplified to shadcn default
}

const NAVIGATION_STALL_TIMEOUT_MS = NAVIGATION_TIMEOUT_MS
const DEFAULT_OPEN_GROUPS = new Set(["Overview", "Trading", "Analytics", "System"])

function stripLocalePrefix(pathname: string) {
  if (!pathname) return "/"
  const withoutLocale = pathname.replace(/^\/[a-z]{2}(?:-[A-Za-z]{2})?(?=\/|$)/, "")
  return withoutLocale.length > 0 ? (withoutLocale.startsWith("/") ? withoutLocale : `/${withoutLocale}`) : "/"
}

function getUserInitials(user?: UnifiedSidebarConfig["user"]) {
  const raw = user?.full_name || user?.email || "User"
  const parts = raw
    .replace(/@.*/, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  if (parts.length === 0) return "U"
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("")
}

export function useActiveLink() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (href: string, exact = false) => {
    if (!pathname || !href) return false

    const normalizedPathname = stripLocalePrefix(pathname).replace(/\/$/, "") || "/"
    const [hrefPath, queryString] = href.split("?")
    const normalizedHrefPath = stripLocalePrefix(hrefPath).replace(/\/$/, "") || "/"

    const hrefParams = new URLSearchParams(queryString ?? "")
    const hrefTab = hrefParams.get("tab")

    // Handle tab-based navigation (e.g., /dashboard?tab=widgets)
    if (hrefTab) {
      const activeTab = searchParams.get("tab") || "widgets"
      if (normalizedPathname === normalizedHrefPath && activeTab === hrefTab) {
        return true
      }
    }

    // Default tab handling for /dashboard
    if (normalizedHrefPath === "/dashboard" && !hrefTab) {
      const activeTab = searchParams.get("tab")
      if (normalizedPathname === "/dashboard" && (!activeTab || activeTab === "widgets")) {
        return true
      }
    }

    // Exact match
    if (exact) {
      return normalizedPathname === normalizedHrefPath
    }

    // Nested routes
    if (normalizedPathname === normalizedHrefPath) return true
    if (normalizedPathname.startsWith(`${normalizedHrefPath}/`)) return true

    return false
  }
}

export function UnifiedSidebar({
  items,
  user,
  actions,
  timezone,
  onLogout,
  styleVariant = 'default',
}: UnifiedSidebarConfig) {
  const t = useI18n()
  const translate = t as unknown as (key: string) => string
  const isActive = useActiveLink()
  const { isMobile, setOpenMobile } = useSidebar()
  const { isLoading } = useNavigationLoading()
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

  const groupedItems = (() => {
    const order: string[] = []
    const groups: Record<string, UnifiedSidebarItem[]> = {}

    items.forEach((item) => {
      const group = item.group || "Settings"
      if (!groups[group]) {
        groups[group] = []
        order.push(group)
      }
      groups[group].push(item)
    })

    // Move specific groups to top/bottom for consistent feel across different layouts
    const sortedOrder = order.sort((a, b) => {
      const topGroups = ["Overview", "Main", "Inventory", "Trading", "Team Overview", "Team Management", "Admin Panel"]
      const bottomGroups = ["System", "Settings", "Support", "Admin"]

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
  })()

  useEffect(() => {
    setOpenGroups((previous) => {
      const next: Record<string, boolean> = { ...previous }
      let hasChanges = false

      for (const groupName of groupedItems.order) {
        if (!(groupName in next)) {
          next[groupName] = DEFAULT_OPEN_GROUPS.has(groupName)
          hasChanges = true
        }
      }

      for (const groupName of Object.keys(next)) {
        if (!groupedItems.groups[groupName]) {
          delete next[groupName]
          hasChanges = true
        }
      }

      return hasChanges ? next : previous
    })
  }, [groupedItems.groups, groupedItems.order])

  const displayName = user?.full_name || user?.email?.split("@")[0] || "User"
  const initials = useMemo(() => getUserInitials(user), [user])
  const itemButtonClass =
    "pointer-events-auto h-10 rounded-xl px-2.5 font-medium transition-colors duration-200 hover:text-sidebar-foreground data-[active=true]:text-sidebar-foreground group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0!"
  const inactiveItemClass =
    "text-sidebar-foreground/78 hover:bg-sidebar-primary/10 hover:text-sidebar-foreground"
  const activeItemClass =
    "bg-sidebar-primary/14 text-sidebar-foreground ring-1 ring-sidebar-primary/22 shadow-[inset_0_1px_0_hsl(var(--foreground)_/_0.03)]"

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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="h-12 rounded-xl px-2 data-[state=open]:bg-sidebar-accent/20 data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0!"
            >
              <div className="flex aspect-square size-9 items-center justify-center rounded-xl border border-sidebar-border/15 bg-sidebar-primary text-sidebar-primary-foreground">
                <Logo className="size-5 fill-current" />
              </div>
              <div className="grid min-w-0 flex-1 gap-0.5 px-1.5 text-left leading-none group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-semibold tracking-tight">Qunt Edge</span>
                <span className="truncate text-[9px] font-medium uppercase tracking-[0.16em] text-sidebar-foreground/45">Workspace</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-sidebar-border/30 hover:scrollbar-thumb-sidebar-border/45 scrollbar-w-[3px]">
        {groupedItems.order.map((groupName, groupIndex) => (
          <Collapsible
            key={groupName}
            open={openGroups[groupName] ?? DEFAULT_OPEN_GROUPS.has(groupName)}
            onOpenChange={(isOpen) => handleGroupOpenChange(groupName, isOpen)}
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
                      const itemIsActive = !isItemDisabled && !!href && isActive(href, item.exact)
                      const isPendingItem = Boolean(
                        href &&
                          pendingNavigation?.href === href &&
                          pendingNavigation.routeKeyAtSchedule === currentRouteKey &&
                          !isActive(href, item.exact)
                      )

                      return (
                        <SidebarMenuItem key={`${groupName}-${item.label}-${index}`} className="relative">
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
                                itemButtonClass,
                                itemIsActive ? activeItemClass : inactiveItemClass
                              )}
                            >
                              <Link
                                href={href}
                                prefetch={false}
                                onClick={() => {
                                  setPendingNavigation({
                                    href,
                                    routeKeyAtSchedule: currentRouteKey,
                                  })
                                  scheduleNavigationFallback(href)
                                  if (isMobile) {
                                    setOpenMobile(false)
                                  }
                                }}
                                className="flex w-full items-center"
                                aria-busy={isPendingItem}
                              >
                                {isPendingItem || (isLoading && itemIsActive) ? (
                                  <Loader2 className="h-4 w-4 animate-spin shrink-0 text-sidebar-primary" />
                                ) : (
                                  <span className={cn(
                                    "shrink-0 transition-colors duration-200",
                                    itemIsActive ? "text-sidebar-primary" : "text-sidebar-foreground/60 group-hover/btn:text-sidebar-foreground/80"
                                  )}>{item.icon}</span>
                                )}
                                <span className={cn(
                                  "ml-3 truncate group-data-[collapsible=icon]:hidden",
                                  itemIsActive ? "font-semibold text-sidebar-foreground" : "text-sidebar-foreground"
                                )}>{label}</span>
                              </Link>
                            </SidebarMenuButton>
                          ) : (
                            <SidebarMenuButton
                              isActive={itemIsActive}
                              tooltip={label}
                              disabled={isItemDisabled}
                              onClick={() => {
                                item.action?.()
                                if (isMobile) setOpenMobile(false)
                              }}
                              className={cn(
                                itemButtonClass,
                                itemIsActive ? activeItemClass : inactiveItemClass
                              )}
                            >
                              <div className="flex w-full items-center">
                                <span className={cn(
                                  "shrink-0 transition-colors duration-200",
                                  itemIsActive ? "text-sidebar-primary" : "text-sidebar-foreground/60 group-hover/btn:text-sidebar-foreground/80"
                                )}>{item.icon}</span>
                                <span className={cn(
                                  "ml-3 truncate group-data-[collapsible=icon]:hidden",
                                  itemIsActive ? "font-semibold text-sidebar-foreground" : "text-sidebar-foreground"
                                )}>{label}</span>
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

        {actions && (
          <SidebarGroup className="mt-auto border-t border-sidebar-border/15 px-0 pb-1 pt-3">
            <SidebarMenu>{actions}</SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/15 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="group/user h-12 w-full rounded-xl px-2 transition-colors duration-200 hover:bg-sidebar-accent/14 data-[state=open]:bg-sidebar-accent/20 group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0!"
                >
                  <div className="flex w-full items-center gap-2.5">
                    <div className="relative shrink-0">
                      <Avatar className="h-9 w-9 overflow-hidden rounded-xl border border-sidebar-border/20 transition-colors duration-200 group-hover/user:border-sidebar-border/35">
                        <AvatarImage src={user?.avatar_url} alt={displayName} />
                        <AvatarFallback className="rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 text-sidebar-primary-foreground text-xs font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-sidebar bg-success" />
                    </div>
                    <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                      <span className="truncate font-semibold text-sidebar-foreground">{displayName}</span>
                      <span className="truncate text-xs text-sidebar-foreground/50">{user?.email || "Free Plan"}</span>
                    </div>
                    <MoreHorizontal className="ml-auto size-4 text-sidebar-foreground/40 transition-transform duration-200 group-hover/user:rotate-90 group-hover/user:text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden" />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl overflow-hidden shadow-xl border-sidebar-border/40 bg-sidebar/95 backdrop-blur-xl"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={6}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2.5 px-3 py-2.5 text-left text-sm bg-gradient-to-r from-sidebar-accent/30 to-sidebar-accent/10">
                    <Avatar className="h-8 w-8 rounded-lg border border-sidebar-border/50 shadow-sm">
                      <AvatarImage src={user?.avatar_url} alt={displayName} />
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 text-sidebar-primary-foreground text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold text-sidebar-foreground">{displayName}</span>
                      <span className="truncate text-xs text-sidebar-foreground/60">{user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-sidebar-border/30" />
                {timezone && (
                  <div className="px-2.5 py-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/40 px-1 mb-2">Timezone</p>
                    <div className="relative">
                      <select
                        value={timezone.value}
                        onChange={(e) => timezone.onChange(e.target.value)}
                        className="w-full bg-sidebar-accent/30 text-sm p-2 focus:outline-none cursor-pointer border rounded-lg border-sidebar-border/40 hover:bg-sidebar-accent/50 hover:border-sidebar-primary/30 transition-all duration-200 appearance-none pr-8 text-sidebar-foreground"
                      >
                        {timezone.options.map((tz) => (
                          <option key={tz} value={tz} className="bg-popover text-popover-foreground">
                            {tz}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-sidebar-foreground/40">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                <DropdownMenuSeparator className="bg-sidebar-border/30" />
                {onLogout && (
                  <DropdownMenuItem
                    onClick={onLogout}
                    className="text-destructive focus:bg-destructive/15 focus:text-destructive cursor-pointer my-1.5 mx-1.5 rounded-lg transition-all duration-200 hover:bg-destructive/10"
                  >
                    <LogOut className="mr-2 size-4" />
                    <span className="font-medium">Log out</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  ) : null
}
