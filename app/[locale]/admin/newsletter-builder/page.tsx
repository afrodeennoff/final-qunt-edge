import { Suspense } from "react"
import { redirect } from "next/navigation"
import { NewsletterEditor } from "@/app/[locale]/admin/components/newsletter/newsletter-editor"
import { SubscriberTable } from "@/app/[locale]/admin/components/newsletter/subscriber-table"
import { NewsletterProvider } from "@/app/[locale]/admin/components/newsletter/newsletter-context"
import { NewsletterPreview } from "@/app/[locale]/admin/components/newsletter/newsletter-preview"
import { assertAdminAccess } from "@/server/authz"
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable"

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  try {
    await assertAdminAccess()
  } catch {
    redirect(`/${locale}/authentication`)
  }

  return (
    <div className="w-full px-4 py-6 space-y-6 sm:px-6 lg:px-8">
      <NewsletterProvider>
        {/* Editor and Preview */}
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[600px] rounded-xl border-0"
        >
          <ResizablePanel defaultSize={50}>
            <div className="h-full p-5">
              <Suspense fallback={null}>
                <NewsletterEditor />
              </Suspense>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50}>
            <div className="h-full p-5">
              <Suspense fallback={null}>
                <NewsletterPreview />
              </Suspense>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* Subscribers Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight">Subscribers</h2>
              <p className="text-sm text-muted-foreground">
                Manage newsletter subscribers and view subscriber data
              </p>
            </div>
          </div>
          <div className="rounded-xl border-0 bg-background/40 p-6">
            <Suspense fallback={null}>
              <SubscriberTable />
            </Suspense>
          </div>
        </div>
      </NewsletterProvider>
    </div>
  )
}
