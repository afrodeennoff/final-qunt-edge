import { Suspense } from "react"
import type { Metadata } from "next"
import { createClient } from "@/server/auth"
import { redirect } from "next/navigation"
import { AuthProfileButton } from "../components/auth-profile-button"
import { AuthProfileButtonSkeleton } from "../components/auth-profile-button-skeleton"
import { TeamsSidebar } from "../components/teams-sidebar"
import { cookies } from "next/headers"
import { parseSidebarStateCookieValue, SIDEBAR_STATE_COOKIE_NAME } from "@/lib/sidebar-state"
import { SidebarRootProviders } from "@/components/providers/root-providers"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { BackgroundGlow } from "@/components/ui/background-glow"
import {
    HEADER_HEIGHT,
    HEADER_Z_INDEX,
    HEADER_BORDER,
    HEADER_BG,
    CONTENT_PADDING,
    CONTENT_PADDING_Y,
    APP_SHELL_SOFT_BORDER_STYLE,
} from "@/lib/constants/layout"
import { DashboardProviders } from "@/components/providers/dashboard-providers"
import { TeamsMobileBottomNav } from "../components/teams-mobile-bottom-nav"

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
}

function resolveTeamPathContext(pathname: string) {
    const segments = pathname.split("/").filter(Boolean)
    const teamsIndex = segments.indexOf("teams")
    const hasLocalePrefix = teamsIndex === 1
    const localePrefix = hasLocalePrefix ? `/${segments[0]}` : ""
    const teamsRoot = `${localePrefix}/teams`
    const dashboardRoot = `${teamsRoot}/dashboard`
    const slug =
        teamsIndex !== -1 &&
        segments[teamsIndex + 1] === "dashboard" &&
        segments[teamsIndex + 2] &&
        segments[teamsIndex + 2] !== "trader"
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
        const safeLocale = locale || "en"
        const nextPath = encodeURIComponent(`/${safeLocale}/teams/manage`)
        redirect(`/${safeLocale}/authentication?next=${nextPath}`)
    }

    const cookieStore = await cookies()
    const defaultSidebarOpen = parseSidebarStateCookieValue(
        cookieStore.get(SIDEBAR_STATE_COOKIE_NAME)?.value
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

                <SidebarInset className="relative overflow-hidden h-dvh selection:bg-background/0.45 selection:text-foreground">
                    <BackgroundGlow variant="default" />

                    <div className="relative z-0 flex h-full flex-col">
                        <header
                            className={`sticky top-0 ${HEADER_HEIGHT} ${HEADER_Z_INDEX} ${HEADER_BORDER} ${HEADER_BG}`}
                        >
                            <div className="flex h-full w-full items-center justify-between px-4 sm:px-6 lg:px-8">
                                <div className="flex items-center gap-3">
                                    <SidebarTrigger className="-ml-1" />
                                    <div className="flex flex-col">
                                        <h1 className="text-sm font-bold tracking-wide text-foreground">
                                            Team Management
                                        </h1>
                                        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                                            Unified Workspace
                                        </span>
                                    </div>
                                </div>
                                <Suspense fallback={<AuthProfileButtonSkeleton />}>
                                    <AuthProfileButton />
                                </Suspense>
                            </div>
                        </header>

                        <main className="flex-1 overflow-y-auto">
                            <div className={`w-full ${CONTENT_PADDING} ${CONTENT_PADDING_Y}`}>
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
