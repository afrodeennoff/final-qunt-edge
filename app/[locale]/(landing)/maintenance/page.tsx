import { CardV2, CardV2Content, CardV2Description, CardV2Header, CardV2Title } from "@/components/ui/v2"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getI18n } from "@/locales/server"

export default async function MaintenancePage() {
  const t = await getI18n()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <CardV2 className="w-full max-w-md">
        <CardV2Header>
          <CardV2Title className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-semantic-warning" />
            {t('maintenance.title')}
          </CardV2Title>
          <CardV2Description>
            {t('maintenance.description')}
          </CardV2Description>
        </CardV2Header>
        <CardV2Content>
          <Alert>
            <AlertTitle>{t('maintenance.inMaintenance')}</AlertTitle>
            <AlertDescription>
              {t('maintenance.message')}
            </AlertDescription>
          </Alert>
        </CardV2Content>
      </CardV2>
    </div>
  )
} 