import { redirect } from "next/navigation"
import { WelcomeEmailProvider } from "../components/welcome-email/welcome-email-context"
import { WelcomeEmailPreview } from "../components/welcome-email/welcome-email-preview"
import { assertAdminAccess } from "@/server/authz"

export default async function WelcomeEmailPage({
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
    <WelcomeEmailProvider>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 border-b border-border/30 pb-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-primary/80">
              Email Management
            </p>
            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tight">Welcome Email Preview</h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Preview and customize the welcome email that will be sent to new users.
              </p>
            </div>
          </div>
        </div>
      <WelcomeEmailPreview />
      </div>
    </WelcomeEmailProvider>
  )
} 