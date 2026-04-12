'use client'

import * as React from 'react'
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
    <div className="flex items-center gap-3 px-3 py-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/15 text-sm font-semibold text-sidebar-foreground">
        {user?.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt=""
            className="h-full w-full rounded-full object-cover"
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
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent/12 hover:text-sidebar-foreground"
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
    [pathname, locale]
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            'h-11 w-11 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-0 text-sidebar-foreground/72 shadow-[0_0_0_0.5px_rgba(180,210,255,0.08)] lg:hidden',
            triggerClassName
          )}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[88vw] max-w-[340px] border-none bg-transparent p-0"
      >
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SheetDescription className="sr-only">
          Primary site navigation. Use links to navigate to different sections.
        </SheetDescription>
        <div className="flex h-full flex-col overflow-y-auto rounded-[2rem] border border-white/[0.08] bg-black/78 shadow-[0_0_0_0.5px_rgba(180,210,255,0.08),0_24px_70px_-36px_rgba(0,0,0,0.92)] backdrop-blur-2xl">
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
                    <h3 className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/35">
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
                              'flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                              active
                                ? 'border border-white/[0.08] bg-white/[0.04] text-sidebar-foreground shadow-[0_0_0_0.5px_oklch(0.65_0.22_260/0.16)]'
                                : 'text-sidebar-foreground/62 hover:bg-white/[0.05] hover:text-sidebar-foreground'
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
