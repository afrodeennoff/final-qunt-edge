import Link from 'next/link'

import { Logo } from '@/components/logo'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'

export function SidebarLogoHeader() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          size="lg"
          className="h-12 rounded-xl px-2 data-[state=open]:bg-sidebar-accent/20 hover:text-sidebar-foreground group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0!"
        >
          <Link href="/dashboard" prefetch={false}>
            <div className="flex aspect-square size-9 items-center justify-center rounded-xl border border-sidebar-border/15 bg-sidebar-primary text-sidebar-primary-foreground">
              <Logo className="size-5 fill-current" />
            </div>
            <div className="grid min-w-0 flex-1 gap-0.5 px-1.5 text-left leading-none group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-semibold tracking-tight">Qunt Edge</span>
              <span className="truncate text-[9px] font-medium uppercase tracking-[0.16em] text-sidebar-foreground/45">
                Workspace
              </span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}