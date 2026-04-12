import MarketingLayoutShell from "../../(landing)/components/marketing-layout-shell"
import { PublicRootProviders } from "@/components/providers/root-providers"

export default function SharedSlugLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <PublicRootProviders>
      <MarketingLayoutShell contentClassName="mx-auto w-full max-w-[1800px] px-4 sm:px-6 lg:px-8">
        {children}
      </MarketingLayoutShell>
    </PublicRootProviders>
  );
}
