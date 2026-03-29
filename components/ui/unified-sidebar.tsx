"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { LogOut, MoreHorizontal, Loader2 } from "lucide-react"

import { Logo } from "@/components/logo"
import { LeaderboardIcon, DealsIcon } from "@/components/icons/svg-icons"
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
import { useNavigationHelper } from "@/lib/navigation-utils"

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

const NAVIGATION_STALL_TIMEOUT_MS = 8000

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

function useActiveLink() {
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
}: UnifiedSidebarConfig) {
  const t = useI18n()
  const translate = t as unknown as (key: string) => string
  const isActive = useActiveLink()
  const { isMobile, setOpenMobile } = useSidebar()
  const { isLoading } = useNavigationLoading()
  const { isQueryParamOnly } = useNavigationHelper()
  const pathname = usePathname()
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
  }, [pathname])

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

  return (
    <Sidebar collapsible="icon" className="pointer-events-auto border-r border-sidebar-border/40 text-sidebar-foreground backdrop-blur-xl relative overflow-hidden before:absolute before:inset-0 before:-z-10 before:opacity-40 before:bg-[linear-gradient(135deg,oklch(0.55_0.22_264)_0%,transparent_50%,oklch(0.188_0.0868_261.9799)_100%)] before:animate-mesh-gradient">
      <div className="absolute inset-0 bg-sidebar/95 backdrop-blur-xl" />
      <SidebarHeader className="h-16 border-b border-sidebar-border/30 px-2 py-0 relative bg-gradient-to-b from-sidebar-accent/20 to-transparent">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2">
              <SidebarMenuButton size="lg" className="group pointer-events-auto flex-1 transition-all duration-300 hover:bg-sidebar-accent/40 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-sidebar-primary/0 via-sidebar-primary/5 to-sidebar-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20 relative">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-sidebar-primary-foreground/20 to-transparent" />
                  <Logo className="size-5 fill-current relative z-10" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none px-1.5 overflow-hidden relative z-10">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-bold tracking-tight text-sm uppercase bg-gradient-to-r from-sidebar-foreground to-sidebar-foreground/70 bg-clip-text text-transparent">Qunt Edge</span>
                    <div className="size-1.5 rounded-full bg-sidebar-primary/60 animate-glow-pulse" />
                  </div>
                  <span className="truncate text-[9px] text-sidebar-foreground/50 uppercase tracking-[0.2em] font-medium">Workspace</span>
                </div>
              </SidebarMenuButton>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sidebar-border/50 to-transparent" />
      </SidebarHeader>

      <SidebarContent className="px-1.5 scrollbar-thin scrollbar-thumb-sidebar-border/40 scrollbar-track-transparent hover:scrollbar-thumb-sidebar-border/60 scrollbar-w-[3px]">
        {groupedItems.order.map((groupName, groupIndex) => (
          <SidebarGroup key={groupName} className="px-2 py-2.5">
            <SidebarGroupLabel className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-sidebar-foreground/40 pl-1" id={`sidebar-group-${groupIndex}`}>
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
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-gradient-to-b from-sidebar-primary via-sidebar-primary to-sidebar-primary rounded-r-full animate-slide-indicator shadow-[0_0_8px_oklch(0.55_0.22_264/_0.5)]" />
                      )}
                      <SidebarMenuButton
                        asChild={!!href}
                        isActive={itemIsActive}
                        tooltip={label}
                        disabled={isItemDisabled}
                        onClick={!href ? () => {
                          item.action?.()
                          if (isMobile) setOpenMobile(false)
                        } : undefined}
                        className={cn(
                          "pointer-events-auto rounded-xl font-medium transition-all duration-200 relative overflow-hidden group/btn",
                          itemIsActive
                            ? "bg-sidebar-accent/50 text-sidebar-accent-foreground font-semibold shadow-[inset_0_0_0_1px_oklch(0.55_0.22_264/_0.3),0_0_20px_oklch(0.55_0.22_264/_0.1)]"
                            : "hover:bg-sidebar-accent/30 text-sidebar-foreground/80 hover:text-sidebar-foreground"
                        )}
                      >
                        <div className={cn(
                          "absolute inset-0 bg-gradient-to-r from-sidebar-primary/0 via-sidebar-primary/5 to-sidebar-primary/0 opacity-0 transition-opacity duration-300",
                          itemIsActive ? "opacity-100" : "group-hover/btn:opacity-60"
                        )} />
                        {href ? (
                          <Link
                            href={href}
                            prefetch={false}
                            onClick={() => {
                              setPendingHref(href)
                              scheduleNavigationFallback(href)
                              if (isMobile && !isQueryParamOnly(href)) {
                                setOpenMobile(false)
                              }
                            }}
                            className="flex items-center w-full relative z-10"
                            aria-busy={isPendingItem}
                          >
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
                        ) : (
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
                        )}
                      </SidebarMenuButton>
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
          <SidebarGroup className="mt-auto pt-4 pb-2 border-t border-sidebar-border/30 px-2">
            <SidebarMenu>{actions}</SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/30 p-2 relative bg-gradient-to-t from-sidebar-accent/10 to-transparent">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sidebar-border/40 to-transparent" />
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent/50 data-[state=open]:text-sidebar-accent-foreground w-full transition-all duration-200 hover:bg-sidebar-accent/30 group/user relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-sidebar-primary/0 via-sidebar-primary/5 to-sidebar-primary/0 opacity-0 group-hover/user:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 flex items-center gap-2.5 w-full">
                    <div className="relative">
                      <Avatar className="h-9 w-9 rounded-xl overflow-hidden border-2 border-sidebar-border/50 shadow-lg ring-2 ring-sidebar-primary/20 transition-all duration-300 group-hover/user:ring-sidebar-primary/40 group-hover/user:border-sidebar-primary/30">
                        <AvatarImage src={user?.avatar_url} alt={displayName} />
                        <AvatarFallback className="rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 text-sidebar-primary-foreground text-xs font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-[oklch(0.55_0.15_166)] rounded-full border-2 border-sidebar animate-status-ring" />
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
      <div className="absolute inset-0 pointer-events-none border-r border-sidebar-border/20" />
    </Sidebar>
  )
}
