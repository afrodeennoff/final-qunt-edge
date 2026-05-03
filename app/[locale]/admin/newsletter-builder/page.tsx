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
    <div className="w-full px-4 py-6 space-y-8 sm:px-6 lg:px-8">
      <NewsletterProvider>
        {/* Editor and Preview */}
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[600px] rounded-lg border"
        >
          <ResizablePanel defaultSize={50}>
            <div className="h-full p-4">
              <Suspense fallback={null}>
                <NewsletterEditor />
              </Suspense>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50}>
            <div className="h-full p-4">
              <Suspense fallback={null}>
                <NewsletterPreview />
              </Suspense>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* Subscribers Table */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Subscribers</h2>
          <Suspense fallback={null}>
            <SubscriberTable />
          </Suspense>
        </div>
      </NewsletterProvider>
    </div>
  )
}
