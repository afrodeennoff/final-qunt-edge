import { LogOut, MoreHorizontal } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
              className="group/user h-12 w-full rounded-xl px-2 transition-colors duration-200 hover:bg-sidebar-accent/14 data-[state=open]:bg-sidebar-accent/20 group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0!"
            >
              <div className="flex w-full items-center gap-2.5">
                <div className="relative shrink-0">
                  <Avatar className="h-9 w-9 overflow-hidden rounded-xl border border-sidebar-border/20 transition-colors duration-200 group-hover/user:border-sidebar-border/35">
                    <AvatarImage src={user?.avatar_url} alt={displayName} />
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 text-sidebar-primary-foreground text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-sidebar bg-success" />
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
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl overflow-hidden shadow-xl border-sidebar-border/40 bg-sidebar/95 backdrop-blur-xl"
            side={isMobile ? 'bottom' : 'right'}
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
                  <span className="truncate font-semibold text-sidebar-foreground">
                    {displayName}
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/60">
                    {user?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-sidebar-border/30" />
            {timezone && (
              <div className="px-2.5 py-2.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/40 px-1 mb-2">
                  Timezone
                </p>
                <div className="relative">
                  <select
                    value={timezone.value}
                    onChange={(e) => timezone.onChange(e.target.value)}
                    className={cn(
                      'w-full bg-sidebar-accent/30 text-sm p-2 focus:outline-none cursor-pointer border rounded-lg border-sidebar-border/40 hover:bg-sidebar-accent/50 hover:border-sidebar-primary/30 transition-all duration-200 appearance-none pr-8 text-sidebar-foreground'
                    )}
                  >
                    {timezone.options.map((tz) => (
                      <option
                        key={tz}
                        value={tz}
                        className="bg-popover text-popover-foreground"
                      >
                        {tz}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-sidebar-foreground/40">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
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
  )
}