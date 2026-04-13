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
 className="h-13 rounded-xl px-2.5 data-[state=open]:bg-sidebar-accent/15 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2! transition-[opacity,background-color,border-color] duration-200"
 >
 <Link href={`/${locale}/dashboard`} prefetch={false}>
 <div className="flex aspect-square size-9 items-center justify-center rounded-[var(--radius-icon)] bg-gradient-to-br from-sidebar-primary/90 to-sidebar-primary/60 text-sidebar-primary-foreground shadow-[0_0_12px_oklch(0.65_0.22_260/0.35)] transition-[opacity,background-color,border-color] duration-300 group-hover:shadow-[0_0_18px_oklch(0.65_0.22_260/0.50)]">
 <Logo className="size-5 fill-current" />
 </div>
 <div className="grid min-w-0 flex-1 gap-0.5 px-1.5 text-left leading-none group-data-[collapsible=icon]:hidden">
 <span className="truncate text-[13px] font-semibold tracking-[-0.01em] text-sidebar-foreground">Qunt Edge</span>
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
