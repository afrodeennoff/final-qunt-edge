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
import { LayoutDashboard, BarChart3, TrendingUp, ArrowLeft } from "lucide-react"
import {
    HEADER_HEIGHT,
    HEADER_Z_INDEX,
    HEADER_BORDER,
    HEADER_BG,
    CONTENT_PADDING,
    CONTENT_PADDING_Y,
} from "@/lib/constants/layout"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import type { MobileNavItem } from "@/components/mobile-bottom-nav"

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

    const teamsMobileItems: MobileNavItem[] = [
        {
            href: slug ? `${dashboardRoot}/${slug}` : dashboardRoot,
            icon: LayoutDashboard,
            label: "Overview",
            exact: true,
        },
        {
            href: slug ? `${dashboardRoot}/${slug}/analytics` : dashboardRoot,
            icon: BarChart3,
            label: "Analytics",
            disabled: !slug,
        },
        {
            href: slug ? `${dashboardRoot}/${slug}/traders` : dashboardRoot,
            icon: TrendingUp,
            label: "Traders",
            disabled: !slug,
        },
        {
            href: `/${locale}/dashboard`,
            icon: ArrowLeft,
            label: "Dashboard",
        },
    ]

    return (
        <SidebarRootProviders defaultOpen={defaultSidebarOpen} withAuthTimeout>
            <div className="flex min-h-screen w-full bg-background selection:bg-muted selection:text-foreground">
                <TeamsSidebar />

                <SidebarInset className="relative flex-1 overflow-hidden">
                    <BackgroundGlow variant="default" />

                    <div className="relative z-0 flex min-h-screen flex-col">
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
                    <MobileBottomNav items={teamsMobileItems} />
                </SidebarInset>
            </div>
        </SidebarRootProviders>
    )
}