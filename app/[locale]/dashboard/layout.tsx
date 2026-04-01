import type { Metadata } from "next";
import { createClient } from "@/server/auth";
import { redirect } from "next/navigation";
import { DashboardProvider } from "./dashboard-context";
import { SidebarInset } from "@/components/ui/sidebar";
import { DashboardProviders } from "@/components/providers/dashboard-providers";
import { SidebarRootProviders } from "@/components/providers/root-providers";
import { DashboardScrollReset } from "./components/dashboard-scroll-reset";
import { ErrorBoundary } from "@/components/error-boundary";
import { DashboardSidebar } from "@/components/sidebar/dashboard-sidebar";
import dynamic from "next/dynamic";
import { isAdminUser } from "@/server/authz";
import { getUserDashboardTheme } from "@/server/user-data";
import { serializeThemeVars } from "@/lib/constants/dashboard-themes";
import { cookies } from "next/headers";
import { parseSidebarStateCookieValue, SIDEBAR_STATE_COOKIE_NAME } from "@/lib/sidebar-state";

const DashboardHeader = dynamic(
  () => import("./components/dashboard-header").then((m) => m.DashboardHeader),
  { loading: () => null }
);

const DashboardClientOverlays = dynamic(
  () => import("./components/dashboard-client-overlays").then((m) => m.DashboardClientOverlays),
  { loading: () => null }
);

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const safeLocale = locale || "en";
    const nextPath = encodeURIComponent(`/${safeLocale}/dashboard`);
    redirect(`/${safeLocale}/authentication?next=${nextPath}`);
  }

  const isAdmin = isAdminUser(user);
  const userTheme = await getUserDashboardTheme() ?? undefined;
  const themeScript = serializeThemeVars(userTheme ?? 'blue');
  const cookieStore = await cookies();
  const defaultSidebarOpen = parseSidebarStateCookieValue(
    cookieStore.get(SIDEBAR_STATE_COOKIE_NAME)?.value
  );

  return (
    <>
      <script
        id="init-dashboard-theme"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var root=document.documentElement;${themeScript};root.setAttribute('data-theme','${userTheme ?? 'blue'}')}catch(e){console.error('[Theme] Bootstrap failed',e)}})()`,
        }}
      />
      <SidebarRootProviders defaultOpen={defaultSidebarOpen} withAuthTimeout initialTheme={userTheme}>
      <DashboardProviders>
        <DashboardClientOverlays />
        <DashboardProvider>
          <DashboardScrollReset />
          <div className="flex min-h-screen w-full overflow-x-hidden bg-background selection:bg-primary/20 selection:text-primary">
            <DashboardSidebar isAdmin={isAdmin} />
            <SidebarInset className="flex-1 min-h-0 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(var(--v2-accent)/0.06),transparent_50%),radial-gradient(ellipse_60%_40%_at_80%_100%,oklch(var(--v2-accent)/0.04),transparent_50%)]" />
                <div className="absolute inset-0 opacity-[0.03]">
                  <div className="absolute inset-0 bg-[linear-gradient(oklch(0.97_0_0/0.03)_1px,transparent_1px),linear-gradient(90deg,oklch(0.97_0_0/0.03)_1px,transparent_1px)] bg-[length:48px_48px]" />
                </div>
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
              </div>

              <div className="relative z-0 flex h-svh min-h-0 flex-col">
                <DashboardHeader />
                <main className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain pb-safe scroll-smooth">
                  <div className="min-h-full">
                    <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8">
                      <ErrorBoundary>
                        {children}
                      </ErrorBoundary>
                    </div>
                  </div>
                </main>
              </div>
            </SidebarInset>
          </div>
        </DashboardProvider>
      </DashboardProviders>
    </SidebarRootProviders>
    </>
  );
}
