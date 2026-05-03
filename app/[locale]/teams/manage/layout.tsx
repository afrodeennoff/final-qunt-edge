import type { Metadata } from 'next'
import { createClient } from '@/server/auth'
import { redirect } from 'next/navigation'
import { TeamsSidebar } from '../components/teams-sidebar'
import { cookies } from 'next/headers'
import { parseSidebarStateCookieValue, SIDEBAR_STATE_COOKIE_NAME } from '@/lib/sidebar-state'
import { SidebarRootProviders } from '@/components/providers/root-providers'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { BackgroundGlow } from '@/components/ui/background-glow'
import {
  HEADER_Z_INDEX,
  CONTENT_PADDING,
  CONTENT_PADDING_Y,
  APP_SHELL_SOFT_BORDER_STYLE,
  WORKSPACE_SHELL_WIDTH,
} from '@/lib/constants/layout'
import {
  unifiedToolbarBadgeClassName,
  unifiedToolbarButtonClassName,
  unifiedToolbarClassName,
} from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'
import { DashboardProviders } from '@/components/providers/dashboard-providers'
import { TeamsMobileBottomNav } from '../components/teams-mobile-bottom-nav'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

function resolveTeamPathContext(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const teamsIndex = segments.indexOf('teams')
  const hasLocalePrefix = teamsIndex === 1
  const localePrefix = hasLocalePrefix ? `/${segments[0]}` : ''
  const teamsRoot = `${localePrefix}/teams`
  const dashboardRoot = `${teamsRoot}/dashboard`
  const slug =
    teamsIndex !== -1 &&
    segments[teamsIndex + 1] === 'dashboard' &&
    segments[teamsIndex + 2] &&
    segments[teamsIndex + 2] !== 'trader'
      ? segments[teamsIndex + 2]
      : undefined

  return { localePrefix, teamsRoot, dashboardRoot, slug }
}

export default async function TeamManageLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id) {
    const safeLocale = locale || 'en'
    const nextPath = encodeURIComponent(`/${safeLocale}/teams/manage`)
    redirect(`/${safeLocale}/authentication?next=${nextPath}`)
  }

  const cookieStore = await cookies()
  const defaultSidebarOpen = parseSidebarStateCookieValue(
    cookieStore.get(SIDEBAR_STATE_COOKIE_NAME)?.value,
  )

  const pathname = `/${locale}/teams/manage`
  const { dashboardRoot, slug } = resolveTeamPathContext(pathname)

  return (
    <SidebarRootProviders
      defaultOpen={defaultSidebarOpen}
      withAuthTimeout
      style={APP_SHELL_SOFT_BORDER_STYLE}
    >
      <DashboardProviders>
        <TeamsSidebar />

        <SidebarInset className="qe-v2-app-shell relative h-dvh overflow-hidden selection:bg-primary/20 selection:text-foreground">
          <BackgroundGlow variant="default" />

          <div className="relative z-0 flex h-full flex-col">
            <header
              className={`sticky top-0 ${HEADER_Z_INDEX} px-3 pb-2 pt-3 sm:px-4 sm:pb-3 sm:pt-4 lg:px-6`}
            >
              <div className={cn('mx-auto flex w-full items-center', WORKSPACE_SHELL_WIDTH)}>
                <div
                  className={cn(
                    unifiedToolbarClassName,
                    'flex min-h-[4.5rem] w-full items-center gap-4 px-3 py-2.5 sm:px-4',
                  )}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/12 to-transparent" />
                  <div className="flex min-w-0 items-center gap-3">
                    <SidebarTrigger
                      className={cn(
                        unifiedToolbarButtonClassName,
                        '-ml-0.5 h-10 w-10 md:h-9 md:w-9',
                      )}
                    />
                    <div className="flex min-w-0 flex-col">
                      <div className="flex items-center gap-2.5">
                        <span className={cn(unifiedToolbarBadgeClassName, 'hidden sm:inline-flex')}>
                          Team
                        </span>
                        <h1 className="truncate text-[0.92rem] font-semibold tracking-[0.02em] text-foreground">
                          Team Management
                        </h1>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto">
              <div
                className={cn(
                  'mx-auto w-full',
                  WORKSPACE_SHELL_WIDTH,
                  CONTENT_PADDING,
                  CONTENT_PADDING_Y,
                )}
              >
                {children}
              </div>
            </main>
          </div>
          <TeamsMobileBottomNav
            dashboardRoot={dashboardRoot}
            slug={slug}
            backHref={`/${locale}/dashboard`}
          />
        </SidebarInset>
      </DashboardProviders>
    </SidebarRootProviders>
  )
}
