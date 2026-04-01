import type { Metadata } from "next"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AuthTimeout } from "@/components/auth/auth-timeout"
import { createClient } from "@/server/auth"
import { redirect } from "next/navigation"
import { TeamsSidebar } from '../components/teams-sidebar'
import { cookies } from "next/headers"
import { parseSidebarStateCookieValue, SIDEBAR_STATE_COOKIE_NAME } from "@/lib/sidebar-state"

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

    if (!user?.id) {
      const safeLocale = locale || "en"
      const nextPath = encodeURIComponent(`/${safeLocale}/teams/dashboard`)
      redirect(`/${safeLocale}/authentication?next=${nextPath}`)
    }

    const cookieStore = await cookies()
    const defaultSidebarOpen = parseSidebarStateCookieValue(
      cookieStore.get(SIDEBAR_STATE_COOKIE_NAME)?.value
    )

    // If no teams found, show the default dashboard with a message
    return (
        <SidebarProvider defaultOpen={defaultSidebarOpen}>
            <AuthTimeout />
            <div className="flex min-h-screen w-full bg-background selection:bg-muted selection:text-foreground">
                <TeamsSidebar />

                <SidebarInset className="flex-1 relative overflow-hidden">
                    <div className="pointer-events-none absolute left-0 top-0 z-0 h-full w-full">
                        <div className="absolute left-[-10%] top-[-10%] h-[45%] w-[45%] rounded-full bg-primary/6 blur-[120px] animate-pulse-slow" />
                        <div className="absolute bottom-[-10%] right-[-10%] h-[45%] w-[45%] rounded-full bg-primary/8 blur-[120px] animate-pulse-slow" />
                    </div>

                    <div className="relative z-0 flex min-h-screen flex-col">
                        <header className="sticky top-0 z-40 h-16 border-b border-border/70 bg-background/95 backdrop-blur-md">
                            <div className="flex h-full w-full items-center px-4 sm:px-6 lg:px-8">
                                <div className="flex items-center gap-3">
                                    <SidebarTrigger className="-ml-1" />
                                    <div className="flex flex-col">
                                        <h1 className="text-sm font-bold tracking-wide text-foreground">Teams Dashboard</h1>
                                        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Unified Workspace</span>
                                    </div>
                                </div>
                            </div>
                        </header>

                        <main className="flex-1 overflow-y-auto">
                            <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                                {children}
                            </div>
                        </main>
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
} 
