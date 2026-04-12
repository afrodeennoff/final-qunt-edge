'use client'

import Link from 'next/link'

import { Logo } from '@/components/logo'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { useCurrentLocale } from '@/locales/client'

export function SidebarLogoHeader() {
  const locale = useCurrentLocale()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          size="lg"
          className="h-14 rounded-2xl border border-sidebar-border/40 bg-sidebar-accent/30 px-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] data-[state=open]:bg-sidebar-accent/50 hover:text-sidebar-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2!"
        >
          <Link href={`/${locale}/dashboard`} prefetch={false}>
            <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,hsl(var(--sidebar-primary))_0%,hsl(var(--chart-2))_100%)] text-sidebar-primary-foreground shadow-[0_18px_38px_-24px_hsl(var(--sidebar-primary)/0.7)]">
              <Logo className="size-5 fill-current" />
            </div>
            <div className="grid min-w-0 flex-1 gap-0.5 px-1.5 text-left leading-none group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-semibold tracking-tight">Qunt Edge</span>
              <span className="truncate text-[9px] font-medium uppercase tracking-[0.18em] text-sidebar-foreground/42">
                V2 Workspace
              </span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
