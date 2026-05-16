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
      <Suspense fallback={null}>
      <TraderInfo slug={slug}/>
      </Suspense>
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1">
          <SharedWidgetCanvas />
        </div>
      </div>
    </DataProvider>
  );
}