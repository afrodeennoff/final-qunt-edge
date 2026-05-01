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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Send Email</h1>
        <p className="text-muted-foreground">
          Choose a template, select recipients, preview the message, and send it.
        </p>
      </div>
      <SendEmailPageClient />
    </div>
  )
}