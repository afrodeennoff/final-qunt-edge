import type { Metadata } from "next"
import { createClient } from "@/server/auth"
import { redirect } from "next/navigation"
import { TeamsSidebar } from "../components/teams-sidebar"
import { cookies } from "next/headers"
import { parseSidebarStateCookieValue, SIDEBAR_STATE_COOKIE_NAME } from "@/lib/sidebar-state"
import { SidebarRootProviders } from "@/components/providers/root-providers"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { BackgroundGlow } from "@/components/ui/background-glow"
import {
    HEADER_Z_INDEX,
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
        const safeLocale = locale || "en"
        const nextPath = encodeURIComponent(`/${safeLocale}/teams/dashboard`)
        redirect(`/${safeLocale}/authentication?next=${nextPath}`)
    }

    const cookieStore = await cookies()
    const defaultSidebarOpen = parseSidebarStateCookieValue(
        cookieStore.get(SIDEBAR_STATE_COOKIE_NAME)?.value
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
                <TeamsSidebar />

                <SidebarInset className="qe-v2-app-shell relative h-dvh overflow-hidden selection:bg-muted selection:text-foreground">
                    <BackgroundGlow variant="default" />

                    <div className="relative z-0 flex h-full flex-col">
                        <header
                            className={`sticky top-0 ${HEADER_Z_INDEX} px-3 pb-2 pt-3 sm:px-4 sm:pb-3 sm:pt-4`}
                        >
                            <div className="mx-auto w-full max-w-[1800px]">
                                <div className="qe-v2-card flex min-h-[4.25rem] items-center gap-3 px-3 py-2.5 sm:px-4">
                                    <SidebarTrigger className="-ml-0.5 h-10 w-10 rounded-2xl border border-v2-border/45 bg-v2-bg-surface/72 text-v2-text-secondary shadow-[0_14px_32px_-24px_rgba(8,15,34,0.92)] transition-all duration-200 hover:border-v2-border/70 hover:bg-v2-bg-hover hover:text-v2-text-primary md:h-9 md:w-9" />
                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <div className="flex items-center gap-2.5">
                                            <span className="hidden rounded-full border border-v2-border/30 bg-v2-bg-surface/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-v2-text-secondary sm:inline-flex">
                                                Team
                                            </span>
                                            <h1 className="truncate text-sm font-bold uppercase tracking-[0.18em] text-v2-text-primary">
                                                Team Command
                                            </h1>
                                        </div>
                                        <span className="truncate pt-1 text-xs text-v2-text-secondary">
                                            Unified oversight for members, performance, and operational team health.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </header>

                        <main className="flex-1 overflow-y-auto">
                            <div className={`mx-auto w-full max-w-[1800px] ${CONTENT_PADDING} ${CONTENT_PADDING_Y}`}>
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
