"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { LogOut, MoreHorizontal, Loader2 } from "lucide-react"

import { Logo } from "@/components/logo"
import { NAVIGATION_TIMEOUT_MS } from "@/lib/constants/sidebar"
import { LeaderboardIcon } from "@/components/icons/svg-icons"
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
import { cn } from "@/lib/utils"
import { useI18n } from "@/locales/client"
import { useNavigationLoading } from "@/hooks/use-navigation-loading"

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
  const { isMobile, setOpenMobile, state, setOpen } = useSidebar()
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

  const autoExpandedDesktopRef = useRef(false)

  useEffect(() => {
    if (!shouldRenderSidebar || isMobile) return
    if (state !== 'collapsed') return
    if (autoExpandedDesktopRef.current) return

    autoExpandedDesktopRef.current = true
    setOpen(true)
  }, [isMobile, setOpen, shouldRenderSidebar, state])

  const extendedItems: UnifiedSidebarItem[] = useMemo(() => {
    const withLocalePath = (p: string) => {
      const m = pathname?.match(/^\/([a-z]{2})(?:-[A-Za-z]{2})?/)
      const locale = m?.[1] ?? 'en'
      return `/${locale}${p.startsWith('/') ? p : '/' + p}`
    }
    const extras: UnifiedSidebarItem[] = []
    if (!items?.some((it) => it.href?.includes('/leaderboard'))) {
      extras.push({ href: withLocalePath('/leaderboard'), icon: <LeaderboardIcon size={20} />, label: 'Leaderboard' })
    }
    return [...items, ...extras]
  }, [items, pathname])
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const navigationFallbackTimerRef = useRef<number | null>(null)

  const clearNavigationFallbackTimer = () => {
    if (navigationFallbackTimerRef.current === null) return
    window.clearTimeout(navigationFallbackTimerRef.current)
    navigationFallbackTimerRef.current = null
  }

  const scheduleNavigationFallback = (href: string) => {
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
  }

  useEffect(() => {
    clearNavigationFallbackTimer()
    setPendingHref(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRouteKey])


  useEffect(() => {
    return () => {
      clearNavigationFallbackTimer()
    }
  }, [])

  const groupedItems = useMemo(() => {
    const order: string[] = []
    const groups: Record<string, UnifiedSidebarItem[]> = {}

    extendedItems.forEach((item) => {
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
  }, [extendedItems])

  const displayName = user?.full_name || user?.email?.split("@")[0] || "User"
  const initials = useMemo(() => getUserInitials(user), [user])

  return shouldRenderSidebar ? (
    <Sidebar
      collapsible="icon"
      className={cn(
        'pointer-events-auto relative overflow-hidden bg-sidebar/96 text-sidebar-foreground backdrop-blur-xl',
        styleVariant === 'minimal'
          ? 'border-r border-sidebar-border/8'
          : 'border-r border-sidebar-border/30'
      )}
    >
      <div className="absolute inset-0 z-0 bg-sidebar/96" />
      <SidebarHeader className="relative z-10 h-16 border-b border-sidebar-border/12 px-2 py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2">
              <SidebarMenuButton size="lg" className="group pointer-events-auto flex-1 rounded-xl transition-all duration-200 hover:bg-sidebar-accent/15">
                <div className="flex aspect-square size-9 items-center justify-center rounded-xl border border-sidebar-border/12 bg-sidebar-accent/15 text-sidebar-foreground">
                  <Logo className="size-5 fill-current" />
                </div>
                <div className="flex flex-col gap-0.5 overflow-hidden px-1.5 leading-none">
                  <span className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">Qunt Edge</span>
                  <span className="truncate text-[9px] font-medium uppercase tracking-[0.16em] text-sidebar-foreground/40">Workspace</span>
                </div>
              </SidebarMenuButton>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="relative z-10 overflow-y-auto px-1.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-sidebar-border/30 hover:scrollbar-thumb-sidebar-border/45 scrollbar-w-[3px]">
        {groupedItems.order.map((groupName, groupIndex) => (
          <SidebarGroup key={groupName} className="px-2 py-2">
            <SidebarGroupLabel className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/35 pl-1" id={`sidebar-group-${groupIndex}`}>
              {groupName}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu role="menu" aria-labelledby={`sidebar-group-${groupIndex}`}>
                {groupedItems.groups[groupName].map((item, index) => {
                  const label = item.i18nKey ? translate(item.i18nKey) : item.label
                  const href = item.href
                  const isItemDisabled = Boolean(item.disabled)
                  const itemIsActive = !isItemDisabled && !!href && isActive(href, item.exact)
                  const isPendingItem = Boolean(
                    href && pendingHref === href && !isActive(href, item.exact)
                  )

                  return (
                    <SidebarMenuItem key={`${groupName}-${item.label}-${index}`} className="relative">
                      {itemIsActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-sidebar-primary rounded-r-full shadow-[0_0_10px_oklch(0.55_0.22_264/_0.4)]" />
                      )}
                      {href ? (
                        <SidebarMenuButton
                          asChild
                          isActive={itemIsActive}
                          tooltip={label}
                          disabled={isItemDisabled}
                          className={cn(
                            "pointer-events-auto rounded-xl font-medium transition-all duration-200 relative overflow-hidden group/btn",
                            itemIsActive
                              ? "bg-sidebar-accent/30 text-sidebar-accent-foreground font-semibold ring-1 ring-sidebar-ring/15"
                              : "text-sidebar-foreground/78 hover:bg-sidebar-accent/18 hover:text-sidebar-foreground"
                          )}
                        >
                          <Link
                            href={href}
                            prefetch={false}
                            onClick={() => {
                              setPendingHref(href)
                              scheduleNavigationFallback(href)
                              if (isMobile) {
                                setOpenMobile(false)
                              }
                            }}
                            className="flex items-center w-full relative z-10"
                            aria-busy={isPendingItem}
                          >
                            <div className={cn(
                              "absolute inset-0 bg-gradient-to-r from-sidebar-primary/0 via-sidebar-primary/5 to-sidebar-primary/0 opacity-0 transition-opacity duration-300",
                              itemIsActive ? "opacity-100" : "group-hover/btn:opacity-60"
                            )} />
                            {isPendingItem || (isLoading && itemIsActive) ? (
                              <Loader2 className="h-4 w-4 animate-spin shrink-0 text-sidebar-primary" />
                            ) : (
                              <span className={cn(
                                "shrink-0 transition-all duration-200",
                                itemIsActive ? "text-sidebar-primary scale-110" : "text-sidebar-foreground/60 group-hover/btn:text-sidebar-foreground/80"
                              )}>{item.icon}</span>
                            )}
                            <span className={cn(
                              "ml-3 truncate transition-all duration-200",
                              itemIsActive ? "font-semibold" : ""
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
                            "pointer-events-auto rounded-xl font-medium transition-all duration-200 relative overflow-hidden group/btn",
                            itemIsActive
                              ? "bg-sidebar-accent/30 text-sidebar-accent-foreground font-semibold ring-1 ring-sidebar-ring/15"
                              : "text-sidebar-foreground/78 hover:bg-sidebar-accent/18 hover:text-sidebar-foreground"
                          )}
                        >
                          <div className={cn(
                            "absolute inset-0 bg-gradient-to-r from-sidebar-primary/0 via-sidebar-primary/5 to-sidebar-primary/0 opacity-0 transition-opacity duration-300",
                            itemIsActive ? "opacity-100" : "group-hover/btn:opacity-60"
                          )} />
                          <div className="flex items-center w-full relative z-10">
                            <span className={cn(
                              "shrink-0 transition-all duration-200",
                              itemIsActive ? "text-sidebar-primary scale-110" : "text-sidebar-foreground/60 group-hover/btn:text-sidebar-foreground/80"
                            )}>{item.icon}</span>
                            <span className={cn(
                              "ml-3 truncate transition-all duration-200",
                              itemIsActive ? "font-semibold" : ""
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
          </SidebarGroup>
        ))}

        {actions && (
          <SidebarGroup className="mt-auto border-t border-sidebar-border/15 px-2 pb-2 pt-4">
            <SidebarMenu>{actions}</SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="relative z-20 border-t border-sidebar-border/15 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="group/user relative w-full overflow-hidden transition-all duration-200 hover:bg-sidebar-accent/18 data-[state=open]:bg-sidebar-accent/30 data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-sidebar-primary/0 via-sidebar-primary/5 to-sidebar-primary/0 opacity-0 group-hover/user:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 flex items-center gap-2.5 w-full">
                    <div className="relative">
                      <Avatar className="h-9 w-9 overflow-hidden rounded-xl border border-sidebar-border/20 transition-all duration-200 group-hover/user:border-sidebar-border/35">
                        <AvatarImage src={user?.avatar_url} alt={displayName} />
                        <AvatarFallback className="rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 text-sidebar-primary-foreground text-xs font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-sidebar bg-success" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold text-sidebar-foreground">{displayName}</span>
                      <span className="truncate text-xs text-sidebar-foreground/50">{user?.email || "Free Plan"}</span>
                    </div>
                    <MoreHorizontal className="ml-auto size-4 text-sidebar-foreground/40 transition-transform duration-200 group-hover/user:rotate-90 group-hover/user:text-sidebar-foreground/60" />
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
      {styleVariant !== 'minimal' ? (
        <div className="absolute inset-0 pointer-events-none border-r border-sidebar-border/15" />
      ) : null}
    </Sidebar>
  ) : null
}
