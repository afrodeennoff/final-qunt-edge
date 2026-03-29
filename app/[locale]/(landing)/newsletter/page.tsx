import { Metadata } from "next"
import { CardV2, CardV2Content, CardV2Description, CardV2Header, CardV2Title } from "@/components/ui/v2"
import { CheckCircle2 } from "lucide-react"
import { getScopedI18n } from "@/locales/server"
import { buildPublicMetadata } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPublicMetadata({
    locale,
    path: "/newsletter",
    title: "Newsletter Preferences | Qunt Edge",
    description: "Manage newsletter preferences and unsubscribe settings for Qunt Edge updates.",
  });
}

export default async function NewsletterPage(
  props: {
    searchParams: Promise<{ [key: string]: string | undefined }>
  }
) {
  const searchParams = await props.searchParams;
  const t = await getScopedI18n('newsletter')

  const isUnsubscribed = searchParams?.status === "unsubscribed"
  const email = searchParams?.email

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-start">
      <div className="w-full px-4 py-6 sm:px-6 sm:py-8 md:py-12 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-6 sm:space-y-8">
          {isUnsubscribed && (
            <CardV2 className="border-border/30 dark:border-border/40 bg-card/80 dark:bg-card/70">
              <CardV2Header className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-x-2.5">
                  <CheckCircle2 className="h-5 w-5 text-semantic-success shrink-0" />
                  <CardV2Title className="text-lg sm:text-xl">{t("unsubscribed.title")}</CardV2Title>
                </div>
                <CardV2Description className="text-foreground text-sm sm:text-base">
                  {t("unsubscribed.description")}
                </CardV2Description>
              </CardV2Header>
              <CardV2Content>
                <p className="text-sm sm:text-base text-foreground break-all">
                  {email && `${t("unsubscribed.email")}: ${email}`}
                </p>
              </CardV2Content>
            </CardV2>
          )}

          <CardV2 className="shadow-xs">
            <CardV2Header className="space-y-3 sm:space-y-4">
              <CardV2Title className="text-lg sm:text-xl">{t("preferences.title")}</CardV2Title>
              <CardV2Description className="text-sm sm:text-base">{t("preferences.description")}</CardV2Description>
            </CardV2Header>
            <CardV2Content>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t("preferences.comingSoon")}
              </p>
            </CardV2Content>
          </CardV2>
        </div>
      </div>
    </main>
  )
}
