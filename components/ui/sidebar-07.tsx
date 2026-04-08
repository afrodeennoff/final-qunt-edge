"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
import { useI18n } from "@/locales/client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarRail,
} from "@/components/ui/sidebar"
import type { UnifiedSidebarItem } from "./sidebar-primitives/types"

// Re-export types for consumers
export type { UnifiedSidebarItem } from "./sidebar-primitives/types"

interface Sidebar07Props {
  items: UnifiedSidebarItem[]
  user?: {
    avatar_url?: string
    email?: string
    full_name?: string
  }
  timezone?: {
    value: string
    options: string[]
    onChange: (value: string) => void
  }
  onLogout?: () => void
  showSubscription?: boolean
  actions?: React.ReactNode
  className?: string
  styleVariant?: "default" | "minimal"
}

function computeGroupedItems(items: UnifiedSidebarItem[]) {
  const order: string[] = []
  const groups: Record<string, UnifiedSidebarItem[]> = {}

  items.forEach((item) => {
    const group = item.group || "System"
    if (!groups[group]) {
      groups[group] = []
      order.push(group)
    }
    groups[group].push(item)
  })

  return { groups, order }
}

function useActiveLink() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (href: string, exact = false) => {
    if (!pathname || !href) return false
    const basePath = href.split("?")[0]
    const normalizedPath = pathname
    if (normalizedPath === basePath) return true
    if (!exact && normalizedPath.startsWith(`${basePath}/`)) return true
    return false
  }
}

export function Sidebar07({
  items,
  className,
  styleVariant = "default",
}: Sidebar07Props) {
  const t = useI18n()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const translate = t as unknown as (key: string) => string
  const isActive = useActiveLink()
  const grouped = React.useMemo(() => computeGroupedItems(items), [items])

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        "pointer-events-auto overflow-hidden bg-sidebar text-sidebar-foreground",
        styleVariant === "minimal"
          ? "border-r border-sidebar-border/12"
          : "border-r border-sidebar-border/25",
        className
      )}
    >
      <SidebarHeader className="h-16 border-b border-sidebar-border/12 px-2 py-2" />

      <SidebarContent className="overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-sidebar-border/30 hover:scrollbar-thumb-sidebar-border/45 scrollbar-w-[3px]">
        {grouped.order.map((groupName) => (
          <SidebarGroup key={groupName}>
            <SidebarGroupLabel>{groupName}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {grouped.groups[groupName].map((item) => {
                  const label = item.i18nKey ? translate(item.i18nKey) : item.label
                  const itemIsActive = item.href ? isActive(item.href, item.exact) : false

                  return (
                    <SidebarMenuItem key={`${groupName}-${item.label}`}>
                      {item.href ? (
                        <SidebarMenuButton
                          asChild
                          isActive={itemIsActive}
                          tooltip={label}
                          disabled={item.disabled}
                        >
                          <Link href={item.href}>
                            <span className="shrink-0">{item.icon}</span>
                            <span className="truncate">{label}</span>
                          </Link>
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton
                          isActive={itemIsActive}
                          tooltip={label}
                          disabled={item.disabled}
                          onClick={item.action}
                        >
                          <span className="shrink-0">{item.icon}</span>
                          <span className="truncate">{label}</span>
                        </SidebarMenuButton>
                      )}
                      {item.badge && (
                        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/15 p-2" />
      <SidebarRail />
    </Sidebar>
  )
}
