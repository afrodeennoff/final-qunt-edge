import type { Metadata } from "next";
import { createClient } from "@/server/auth";
import { redirect } from "next/navigation";
import { DashboardProvider } from "./dashboard-context";
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
import { SidebarLayoutShell } from "@/components/ui/sidebar-layout-shell";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { shouldUseServerBootstrap } from "@/lib/feature-flags";
import type { DashboardBootstrapPayload } from "@/lib/types/bootstrap";
import { APP_SHELL_SOFT_BORDER_STYLE } from "@/lib/constants/layout";

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

  // Server dashboard bootstrap — loads all data for first paint when flag is enabled.
  // Falls back to client-side loadData() when flag is disabled or bootstrap fails.
  let initialBootstrap: DashboardBootstrapPayload | null = null;
  if (shouldUseServerBootstrap(user.id)) {
    try {
      // Dynamic import to avoid issues when bootstrap module is not yet stable
      const { getDashboardBootstrap } = await import("@/server/dashboard-bootstrap");
      initialBootstrap = await getDashboardBootstrap();
    } catch (err) {
      console.warn("[Dashboard] Bootstrap failed, falling back to client loadData:", err);
    }
  }

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
              <div className="mx-auto flex min-h-full max-w-[1800px] flex-col pb-[calc(theme(spacing.16)+env(safe-area-inset-bottom))] md:pb-safe">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </div>
            </SidebarLayoutShell>
          </DashboardProvider>
        </DashboardProviders>
      </SidebarRootProviders>
    </>
  );
}
