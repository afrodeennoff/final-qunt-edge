import { LogOut, MoreHorizontal } from 'lucide-react'
import {
  Avatar as Avatar,
  AvatarFallback as AvatarFallback,
  AvatarImage as AvatarImage,
} from '@/components/ui/avatar'
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
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'
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
              className="group/user h-[52px] rounded-none border-t border-border/30 px-3 hover:bg-muted/40"
            >
              <div className="flex w-full items-center gap-2.5">
                <div className="relative shrink-0">
                  <Avatar className="h-8 w-8 overflow-hidden rounded-[8px] ring-1 ring-border/50">
                    <AvatarImage src={user?.avatar_url} alt={displayName} />
                    <AvatarFallback className="rounded-[8px] bg-gradient-to-b from-primary/25 to-primary/15 text-primary text-[11px] font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-sidebar bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                </div>
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="text-[13px] font-semibold tracking-[-0.01em] text-foreground truncate">
                    {displayName}
                  </span>
                  <span className="text-[11px] text-muted-foreground/55 truncate">
                    {user?.username ? `@${user.username}` : (user?.email || 'Free Plan')}
                  </span>
                </div>
                <MoreHorizontal className="ml-auto size-4 text-sidebar-foreground/40 transition-transform duration-200 group-hover/user:rotate-90 group-hover/user:text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden" />
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 overflow-hidden rounded-xl border border-sidebar-border/35 bg-sidebar/98 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={6}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2.5 bg-gradient-to-r from-sidebar-primary/18 to-sidebar-accent/10 px-3 py-2.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-xl shadow-[inset_0_1px_0_hsl(var(--primary)/0.06),0_4px_16px_-4px_rgba(0,0,0,0.3)]">
                  <AvatarImage src={user?.avatar_url} alt={displayName} />
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 text-sidebar-primary-foreground text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="text-[13px] font-semibold tracking-[-0.01em] text-foreground truncate">
                    {displayName}
                  </span>
                  <span className="text-[11px] text-muted-foreground/55 truncate">
                    {user?.username ? `@${user.username}` : (user?.email || '')}
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
                  <SelectTrigger className="w-full border-sidebar-border/24 bg-sidebar-accent/20 text-sm hover:border-sidebar-primary/18 hover:bg-sidebar-accent/34 data-[placeholder]:text-sidebar-foreground/40">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent className="border-sidebar-border/24 bg-sidebar/98 text-popover-foreground">
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
