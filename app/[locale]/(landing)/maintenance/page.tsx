import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getI18n } from "@/locales/server"
import { buildPublicMetadata } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return buildPublicMetadata({
    locale,
    path: "/maintenance",
    title: "Under Maintenance | Qunt Edge",
    description:
      "Qunt Edge is currently undergoing scheduled maintenance. We'll be back shortly.",
  })
}

export default async function MaintenancePage() {
  const t = await getI18n()

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-transparent shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10 border border-warning/20 text-warning">
              <AlertCircle className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">{t('maintenance.title')}</CardTitle>
          </div>
          <CardDescription className="text-sm leading-relaxed">
            {t('maintenance.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-warning/20 bg-warning/5 p-5">
            <AlertTitle className="text-sm font-semibold text-warning mb-2">
              {t('maintenance.inMaintenance')}
            </AlertTitle>
            <AlertDescription className="text-sm text-muted-foreground leading-relaxed">
              {t('maintenance.message')}
            </AlertDescription>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}