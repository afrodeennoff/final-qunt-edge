import MarketingLayoutShell from "../../(landing)/components/marketing-layout-shell"
import { PublicRootProviders } from "@/components/providers/root-providers"

export default function SharedSlugLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <PublicRootProviders>
      <MarketingLayoutShell contentClassName="w-full">
        {children}
      </MarketingLayoutShell>
    </PublicRootProviders>
  );
}
