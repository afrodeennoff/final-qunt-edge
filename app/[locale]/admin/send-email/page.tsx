import { redirect } from "next/navigation"
import { SendEmailPageClient } from "../components/send-email/send-email-page-client"
import { assertAdminAccess } from "@/server/authz"

export default async function SendEmailPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  try {
    await assertAdminAccess();
  } catch {
    redirect(`/${locale}/authentication`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b-0 pb-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-primary/80">
            Email Management
          </p>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight">Send Email</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Choose a template, select recipients, preview the message, and send it.
            </p>
          </div>
        </div>
      </div>
      <SendEmailPageClient />
    </div>
  )
}