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
            <div className="flex aspect-square size-8 items-center justify-center rounded-[8px] bg-gradient-to-b from-primary/20 to-primary/10 border border-primary/18 shadow-[inset_0_1px_0_oklch(1_0_0_/_0.08),0_1px_4px_rgba(0,0,0,0.32)] text-primary">
              <Logo className="size-5 fill-current" />
            </div>
            <div className="grid min-w-0 flex-1 gap-0.5 px-1.5 text-left leading-none group-data-[collapsible=icon]:hidden">
              <span className="text-[13px] font-semibold tracking-[-0.02em] text-foreground/95">
                Qunt Edge
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/45">
                Analytics
              </span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
