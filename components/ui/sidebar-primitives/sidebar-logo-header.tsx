'use client'

import Link from 'next/link'

import { Logo } from '@/components/logo'
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'
import { useCurrentLocale } from '@/locales/client'

export function SidebarLogoHeader() {
  const locale = useCurrentLocale()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          size="lg"
          className="h-13 rounded-xl border border-transparent px-2.5 data-[state=open]:border-sidebar-primary/20 data-[state=open]:bg-sidebar-primary/10 hover:border-sidebar-primary/16 hover:bg-sidebar-accent/8 hover:text-sidebar-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2! transition-[opacity,background-color,border-color] duration-200"
        >
          <Link href={`/${locale}/dashboard`} prefetch={false}>
            <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-sidebar-primary/12 text-sidebar-primary shadow-sm transition-[opacity,background-color,border-color] duration-300 group-hover:shadow-sm">
              <Logo className="size-5 fill-current" />
            </div>
            <div className="grid min-w-0 flex-1 gap-0.5 px-1.5 text-left leading-none group-data-[collapsible=icon]:hidden">
              <span className="truncate text-[13px] font-semibold tracking-[-0.01em] text-sidebar-foreground">
                Qunt Edge
              </span>
              <span className="truncate text-[9px] font-semibold uppercase tracking-[0.20em] text-sidebar-foreground/35 group-data-[collapsible=icon]:hidden">
                Analytics
              </span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
