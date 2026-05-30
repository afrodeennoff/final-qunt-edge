'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { unifiedInsetPanelClassName } from '@/components/layout/unified-page-recipes'
import { useUserStore } from '@/store/user-store'
import { useCurrentLocale } from '@/locales/client'
import { cn } from '@/lib/utils'

export interface MobileNavLink {
  href: string
  label: string
  icon?: React.ReactNode
}

export interface MobileNavGroup {
  title?: string
  links: MobileNavLink[]
}

interface UnifiedMobileNavProps {
  groups: MobileNavGroup[]
  showUser?: boolean
  triggerClassName?: string
  footer?: React.ReactNode
}

function useHandleLogout() {
  const resetUser = useUserStore((s) => s.resetUser)

  return React.useCallback(async () => {
    resetUser()
    const { signOut } = await import('@/server/auth')
    await signOut()
  }, [resetUser])
}

function UserSection({ onLogout }: { onLogout: () => void }) {
  const user = useUserStore((s) => s.supabaseUser)
  const initials = user?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <div className={cn(unifiedInsetPanelClassName, 'flex items-center gap-3 px-3 py-2.5')}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/16 bg-primary/10 text-sm font-semibold text-sidebar-foreground">
        {user?.user_metadata?.avatar_url ? (
          <Image
            src={user.user_metadata.avatar_url}
            alt=""
            className="h-full w-full rounded-xl object-cover"
          />
        ) : (
          <User className="h-4 w-4" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-sidebar-foreground">
          {user?.user_metadata?.full_name || user?.user_metadata?.name || initials}
        </span>
        <span className="truncate text-xs text-sidebar-foreground/50">{user?.email}</span>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-0 bg-background/60 text-sidebar-foreground/50 transition-[background-color,border-color,color] duration-200 hover:border-primary/20 hover:bg-primary/10 hover:text-sidebar-foreground"
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  )
}

export function UnifiedMobileNav({
  groups,
  showUser = false,
  triggerClassName,
  footer,
}: UnifiedMobileNavProps) {
  const pathname = usePathname()
  const locale = useCurrentLocale()
  const [open, setOpen] = React.useState(false)
  const handleLogout = useHandleLogout()

  const isLinkActive = React.useCallback(
    (href: string) => {
      const resolvedHref = href.startsWith('/') ? href : `/${locale}${href}`
      const withoutHash = resolvedHref.split('#')[0]
      return pathname === withoutHash || pathname.endsWith(withoutHash)
    },
    [pathname, locale],
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            'h-11 w-11 rounded-xl border-0 bg-background/40 p-0 text-sidebar-foreground/72 shadow-sm transition-[background-color,border-color,color] duration-200 hover:border-transparent hover:bg-background/50 hover:text-sidebar-foreground lg:hidden',
            triggerClassName
          )}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[88vw] max-w-[340px] border-none bg-transparent p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SheetDescription className="sr-only">
          Primary site navigation. Use links to navigate to different sections.
        </SheetDescription>
        <div className="flex h-full flex-col overflow-y-auto rounded-[2rem] border border-primary/12 bg-[linear-gradient(180deg,hsl(var(--background)/0.98),hsl(var(--background)/0.9))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_32px_76px_-42px_rgba(0,0,0,0.94)]">
          {showUser && (
            <>
              <div className="px-3 pt-6 pb-2">
                <UserSection onLogout={handleLogout} />
              </div>
              <Separator className="mx-3" />
            </>
          )}

          <nav className="flex-1 px-3 py-4">
            <div className="space-y-4">
              {groups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  {group.title && (
                    <h3 className="mb-2 px-3 text-[9px] font-black uppercase tracking-[0.12em] text-sidebar-foreground/35">
                      {group.title}
                    </h3>
                  )}
                  <ul className="space-y-0.5 list-none">
                    {group.links.map((link) => {
                      const active = isLinkActive(link.href)
                      return (
                        <li key={link.href}>
                          <Link
                            href={link.href.startsWith('/') ? link.href : `/${locale}${link.href}`}
                            onClick={() => setOpen(false)}
                            className={cn(
                              'flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-[background-color,border-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
                              active
                                ? 'border border-primary/18 bg-primary/10 text-sidebar-foreground shadow-[0_0_0_0.5px_hsl(var(--primary)/0.16),0_18px_28px_-24px_rgba(0,0,0,0.84)]'
                                : 'border border-transparent text-sidebar-foreground/60 hover:border-transparent hover:bg-background/72 hover:text-sidebar-foreground'
                            )}
                          >
                            {link.icon && (
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center text-sidebar-foreground/60">
                                {link.icon}
                              </span>
                            )}
                            <span>{link.label}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </nav>

          {footer && (
            <>
              <Separator className="mx-3" />
              <div className="px-3 py-4">{footer}</div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
