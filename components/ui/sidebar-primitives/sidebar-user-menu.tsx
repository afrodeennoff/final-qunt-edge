import { LogOut, MoreHorizontal } from 'lucide-react'
import { Avatar as Avatar, AvatarFallback as AvatarFallback, AvatarImage as AvatarImage } from "@/components/ui/avatar"
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/ui/select'
import {
 SidebarMenu,
 SidebarMenuItem,
 SidebarMenuButton,
} from '@/components/ui/sidebar'
import type { UnifiedSidebarConfig } from './types'

export interface SidebarUserMenuProps {
 user?: UnifiedSidebarConfig['user']
 timezone?: UnifiedSidebarConfig['timezone']
 onLogout?: () => void
 displayName: string
 initials: string
 isMobile?: boolean
}

export function SidebarUserMenu({
 user,
 timezone,
 onLogout,
 displayName,
 initials,
 isMobile = false,
}: SidebarUserMenuProps) {
 return (
 <SidebarMenu>
 <SidebarMenuItem>
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <SidebarMenuButton
 size="lg"
 className="group/user w-full rounded-xl px-2.5 py-1.5 transition-[opacity,background-color,border-color] duration-200 hover:bg-sidebar-accent/12 data-[state=open]:bg-sidebar-accent/18 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2!"
 >
 <div className="flex w-full items-center gap-2.5">
 <div className="relative shrink-0">
 <Avatar className="h-9 w-9 overflow-hidden rounded-[var(--radius-icon)] ring-1 ring-sidebar-primary/20">
 <AvatarImage src={user?.avatar_url} alt={displayName} />
 <AvatarFallback className="rounded-[var(--radius-icon)] bg-gradient-to-br from-sidebar-primary/80 via-sidebar-primary/60 to-sidebar-primary/40 text-sidebar-primary-foreground text-xs font-bold tracking-wide">
 {initials}
 </AvatarFallback>
 </Avatar>
 <div className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-sidebar bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
 </div>
 <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
 <span className="truncate font-semibold text-sidebar-foreground">
 {displayName}
 </span>
 <span className="truncate text-xs text-sidebar-foreground/50">
 {user?.email || 'Free Plan'}
 </span>
 </div>
 <MoreHorizontal className="ml-auto size-4 text-sidebar-foreground/40 transition-transform duration-200 group-hover/user:rotate-90 group-hover/user:text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden" />
 </div>
 </SidebarMenuButton>
 </DropdownMenuTrigger>
 <DropdownMenuContent
 className="w-[--radix-dropdown-menu-trigger-width] min-w-56 overflow-hidden rounded-xl border-sidebar-border/40 bg-sidebar/95 shadow-[0_28px_72px_-40px_rgba(4,10,24,0.92)]"
 side={isMobile ? 'bottom' : 'right'}
 align="end"
 sideOffset={6}
 >
 <DropdownMenuLabel className="p-0 font-normal">
 <div className="flex items-center gap-2.5 bg-gradient-to-r from-sidebar-accent/32 to-sidebar-accent/12 px-3 py-2.5 text-left text-sm">
 <Avatar className="h-8 w-8 rounded-xl shadow-[inset_0_1px_0_oklch(0.65_0.22_260/0.06),0_4px_16px_-4px_rgba(0,0,0,0.3)]">
 <AvatarImage src={user?.avatar_url} alt={displayName} />
 <AvatarFallback className="rounded-lg bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 text-sidebar-primary-foreground text-xs font-semibold">
 {initials}
 </AvatarFallback>
 </Avatar>
 <div className="grid flex-1 text-left text-sm leading-tight">
 <span className="truncate font-semibold text-sidebar-foreground">
 {displayName}
 </span>
 <span className="truncate text-xs text-sidebar-foreground/60">
 {user?.email}
 </span>
 </div>
 </div>
 </DropdownMenuLabel>
 <DropdownMenuSeparator className="bg-sidebar-border/12" />
 {timezone && (
 <div className="px-2.5 py-2.5">
 <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/40 px-1 mb-2">
 Timezone
 </p>
 <Select value={timezone.value} onValueChange={timezone.onChange}>
 <SelectTrigger className="w-full bg-sidebar-accent/30 text-sm border-sidebar-border/18 hover:bg-sidebar-accent/50 hover:border-sidebar-primary/20 data-[placeholder]:text-sidebar-foreground/40">
 <SelectValue placeholder="Select timezone" />
 </SelectTrigger>
 <SelectContent className="bg-[oklch(0.65_0.22_260/0.06)] text-popover-foreground border-sidebar-border/18">
 {timezone.options.map((tz) => (
 <SelectItem key={tz} value={tz}>
 {tz}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 )}
 <DropdownMenuSeparator className="bg-sidebar-border/12" />
 {onLogout && (
 <DropdownMenuItem
 onClick={onLogout}
 className="text-destructive focus:bg-destructive/15 focus:text-destructive cursor-pointer my-1.5 mx-1.5 rounded-lg transition-[opacity,background-color,border-color] duration-200 hover:bg-destructive/10"
 >
 <LogOut className="mr-2 size-4" />
 <span className="font-medium">Log out</span>
 </DropdownMenuItem>
 )}
 </DropdownMenuContent>
 </DropdownMenu>
 </SidebarMenuItem>
 </SidebarMenu>
 )
}
