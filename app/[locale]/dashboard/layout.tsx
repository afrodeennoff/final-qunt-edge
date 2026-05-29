import type { Metadata } from 'next'
import { createClient } from '@/server/auth'
import { redirect } from 'next/navigation'
import { DashboardProvider } from './dashboard-context'
import { DashboardProviders } from '@/components/providers/dashboard-providers'
import { SidebarRootProviders } from '@/components/providers/root-providers'
import { DashboardScrollReset } from './components/dashboard-scroll-reset'
import { ErrorBoundary } from '@/components/error-boundary'
import { DashboardSidebar } from '@/components/sidebar/dashboard-sidebar'
import dynamic from 'next/dynamic'
import { isAdminUser } from '@/server/authz'
import { getUserDashboardTheme } from '@/server/user-data'
import {
  DEFAULT_DASHBOARD_THEME,
  normalizeDashboardTheme,
  serializeThemeVars,
} from '@/lib/constants/dashboard-themes'
import { cookies } from 'next/headers'
import { parseSidebarStateCookieValue, SIDEBAR_STATE_COOKIE_NAME } from '@/lib/sidebar-state'
import { SidebarLayoutShell } from '@/components/ui/sidebar-layout-shell'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { GestureProvider } from '@/components/providers/gesture-provider'
import { PullToRefreshIndicator } from '@/components/pull-to-refresh'
import { shouldUseServerBootstrap } from '@/lib/feature-flags'
import type { DashboardBootstrapPayload } from '@/lib/types/bootstrap'
import { APP_SHELL_SOFT_BORDER_STYLE, WORKSPACE_SHELL_WIDTH } from '@/lib/constants/layout'
import { cn } from '@/lib/utils'

const DashboardHeader = dynamic(
  () => import("./components/dashboard-header").then((m) => m.DashboardHeader),
  { loading: () => (
    <div className="flex h-16 items-center justify-between px-4">
      <div className="h-8 w-32 animate-pulse rounded-lg bg-background/30" />
      <div className="h-8 w-24 animate-pulse rounded-lg bg-background/30" />
    </div>
  ) }
);

const DashboardClientOverlays = dynamic(
  () => import('./components/dashboard-client-overlays').then((m) => m.DashboardClientOverlays),
  { loading: () => <div /> },
)

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
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

  if (!user) {
    const safeLocale = locale || 'en'
    const nextPath = encodeURIComponent(`/${safeLocale}/dashboard`)
    redirect(`/${safeLocale}/authentication?next=${nextPath}`)
  }

  const isAdmin = isAdminUser(user)

  // Server dashboard bootstrap — loads all data for first paint when flag is enabled.
  // Falls back to client-side loadData() when flag is disabled or bootstrap fails.
  // Parallelize with theme fetch for faster SSR.
  const bootstrapPromise: Promise<DashboardBootstrapPayload | null> = shouldUseServerBootstrap(user.id)
    ? import('@/server/dashboard-bootstrap')
        .then(({ getDashboardBootstrap }) => getDashboardBootstrap())
        .catch((err) => {

          return null
        })
    : Promise.resolve(null)

  const [userTheme, initialBootstrap] = await Promise.all([
    getUserDashboardTheme().then(normalizeDashboardTheme),
    bootstrapPromise,
  ])
  const themeScript = serializeThemeVars(userTheme)
  const cookieStore = await cookies()
  const defaultSidebarOpen = parseSidebarStateCookieValue(
    cookieStore.get(SIDEBAR_STATE_COOKIE_NAME)?.value,
  )

  return (
    <>
      <script
        id="init-dashboard-theme"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var root=document.documentElement;${themeScript};root.setAttribute("data-theme","${userTheme ?? DEFAULT_DASHBOARD_THEME}")}catch(e){}})()`,
        }}
      />
      <SidebarRootProviders
        defaultOpen={defaultSidebarOpen}
        withAuthTimeout
        initialTheme={userTheme}
        style={APP_SHELL_SOFT_BORDER_STYLE}
      >
        <DashboardProviders isAdmin={isAdmin} initialBootstrap={initialBootstrap}>
          <DashboardClientOverlays />
          <DashboardProvider>
            <DashboardScrollReset />
            <SidebarLayoutShell
              sidebar={<DashboardSidebar isAdmin={isAdmin} />}
              header={<DashboardHeader />}
              mobileNav={<MobileBottomNav />}
              backgroundVariant="accent"
              className="selection:bg-primary/20 selection:text-primary"
            >
              <GestureProvider>
                <PullToRefreshIndicator />
                <div
                  className={cn(
                    'mx-auto flex w-full flex-col min-h-full',
                    WORKSPACE_SHELL_WIDTH,
                  )}
                >
                  <ErrorBoundary>{children}</ErrorBoundary>
                </div>
              </GestureProvider>
            </SidebarLayoutShell>
          </DashboardProvider>
        </DashboardProviders>
      </SidebarRootProviders>
    </>
  )
}
