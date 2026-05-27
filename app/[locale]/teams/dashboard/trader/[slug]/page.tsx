import { DataProvider } from "@/context/data-provider";
import { TraderInfo } from "../../../components/trader-info";
import { Suspense } from "react";
import { SharedWidgetCanvas } from "@/app/[locale]/shared/[slug]/shared-widget-canvas";

export default async function TraderDashboard(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;

  const {
    slug
  } = params;

  return (
    <DataProvider adminView={{ userId: slug }}>
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="h-32 animate-pulse rounded-xl border border-border/30 bg-muted/40" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl border border-border/30 bg-muted/40"
                />
              ))}
            </div>
          </div>
        }
      >
      <TraderInfo slug={slug}/>
      </Suspense>
      <div className="min-h-dvh flex flex-col bg-background">
        <div className="flex-1">
          <SharedWidgetCanvas />
        </div>
      </div>
    </DataProvider>
  );
}