'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Head from "next/head"
import { toast } from "sonner"
import { useCurrentLocale } from "@/locales/client"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { RootProviders } from "@/components/providers/root-providers"
import { DashboardProviders } from "@/components/providers/dashboard-providers"
import { AuthTimeout } from "@/components/auth/auth-timeout"
import { SidebarNav } from "./components/sidebar-nav"

export function AdminClientLayout({
  children,
  defaultSidebarOpen,
}: {
  children: React.ReactNode
  defaultSidebarOpen: boolean
}) {
  const router = useRouter()
  const locale = useCurrentLocale()
  useEffect(() => {
    const hash = window.location.hash
    const params = new URLSearchParams(hash.slice(1))

    if (params.get('error')) {
      const errorDescription = params.get('error_description')
      toast.error("Authentication Error", {
        description: errorDescription?.replace(/\+/g, ' ') || "An error occurred during authentication",
      })
      router.replace(`/${locale}/authentication`)
    }
  }, [locale, router])

  return (
    <>
      <Head>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <RootProviders>
      <DashboardProviders>
      <SidebarProvider defaultOpen={defaultSidebarOpen}>
        <AuthTimeout />
        <div className="flex min-h-screen w-full bg-background text-foreground">
          <SidebarNav />
          <SidebarInset className="flex-1 relative overflow-hidden bg-transparent">
            <header className="h-16 border-b border-border/60 flex items-center justify-between px-4 md:px-8 sticky top-0 z-50 bg-background/95 backdrop-blur-md">
              <div className="flex items-center gap-4 flex-shrink-0">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                <h1 className="text-sm font-bold text-foreground tracking-wide uppercase whitespace-nowrap">Admin Panel</h1>
              </div>
            </header>
            <main className="flex-1 overflow-y-auto p-6 relative z-0">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
      </DashboardProviders>
      </RootProviders>
    </>
  )
}
