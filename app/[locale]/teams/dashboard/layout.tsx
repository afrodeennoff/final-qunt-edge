import type { Metadata } from 'next'
import { createClient } from '@/server/auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { parseSidebarStateCookieValue, SIDEBAR_STATE_COOKIE_NAME } from '@/lib/sidebar-state'
import { SidebarRootProviders } from '@/components/providers/root-providers'
import { DashboardProviders } from '@/components/providers/dashboard-providers'
import { TeamsSidebar } from '../components/teams-sidebar'
import { TeamsMobileBottomNav } from '../components/teams-mobile-bottom-nav'
import { SidebarLayoutShell } from '@/components/ui/sidebar-layout-shell'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { GestureProvider } from '@/components/providers/gesture-provider'
import { PullToRefreshIndicator } from '@/components/pull-to-refresh'
import { ErrorBoundary } from '@/components/error-boundary'
import { cn } from '@/lib/utils'
import {
  WORKSPACE_SHELL_WIDTH,
  APP_SHELL_SOFT_BORDER_STYLE,
} from '@/lib/constants/layout'

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

export default async function DashboardLayout({
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
    const nextPath = encodeURIComponent(`/${safeLocale}/teams/dashboard`)
    redirect(`/${safeLocale}/authentication?next=${nextPath}`)
  }

  const cookieStore = await cookies()
  const defaultSidebarOpen = parseSidebarStateCookieValue(
    cookieStore.get(SIDEBAR_STATE_COOKIE_NAME)?.value,
  )

  const pathname = `/${locale}/teams/dashboard`
  const { dashboardRoot, slug } = resolveTeamPathContext(pathname)

  return (
    <SidebarRootProviders
      defaultOpen={defaultSidebarOpen}
      withAuthTimeout
      style={APP_SHELL_SOFT_BORDER_STYLE}
    >
      <DashboardProviders>
        <SidebarLayoutShell
          sidebar={<TeamsSidebar />}
          header={
            <header className="sticky top-0 z-50 w-full shrink-0 px-3 pb-2 pt-3 transition-[opacity,background-color,border-color] duration-200 sm:px-4 sm:pb-2 sm:pt-4">
              <div className={cn('relative mx-auto', WORKSPACE_SHELL_WIDTH)}>
                <div className="bg-card border border-border/10 relative flex min-h-[5rem] items-center justify-between gap-3 overflow-hidden rounded-2xl px-3 py-3 transition-all duration-300 sm:gap-4 sm:px-4">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/8 to-transparent" />
                  <div className="pointer-events-auto relative z-10 flex min-w-0 items-center gap-2 pr-3 sm:gap-3 sm:pr-4">
                    <SidebarTrigger className="h-10 w-10 shrink-0 rounded-xl border border-border/20 bg-background/60 text-muted-foreground transition-[background-color,border-color,color] duration-200 hover:border-primary/25 hover:bg-primary/5 hover:text-foreground md:h-9 md:w-9" />
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="hidden h-8 w-px bg-border/40 sm:block" />
                      <div className="min-w-0 max-w-[min(32rem,44vw)]">
                        <div className="flex items-center gap-2">
                          <span className="hidden sm:inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] border-border/40 bg-background/60 text-muted-foreground">
                            Teams
                          </span>
                          <h1 className="truncate text-[11px] font-bold tracking-[0.14em] text-foreground sm:text-sm sm:uppercase sm:tracking-[0.12em]">
                            Team Workspace
                          </h1>
                        </div>
                        <p className="hidden truncate pt-1 text-xs text-muted-foreground xl:block">
                          Manage your teams, members, and collaborative analytics
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>
          }
          mobileNav={
            <TeamsMobileBottomNav
              dashboardRoot={dashboardRoot}
              slug={slug}
              backHref={`/${locale}/dashboard`}
            />
          }
          backgroundVariant="accent"
          className="selection:bg-primary/20 selection:text-primary"
        >
          <GestureProvider>
            <PullToRefreshIndicator />
            <div className={cn('mx-auto flex w-full flex-col', WORKSPACE_SHELL_WIDTH)}>
              <ErrorBoundary>{children}</ErrorBoundary>
            </div>
          </GestureProvider>
        </SidebarLayoutShell>
      </DashboardProviders>
    </SidebarRootProviders>
  )
}
