'use client'

import { useMemo, useState } from "react"
import { BadgeV2 } from "@/components/ui/v2"
import { ButtonV2 } from "@/components/ui/v2"
import { useI18n } from "@/locales/client"
import {
  Clock,
  Loader2,
  Trash2
} from "lucide-react"
import { AccountsAnalysis } from "./accounts-analysis"
import { useAnalysisStore } from "@/store/analysis-store"

export function AnalysisOverview() {
  const t = useI18n()
  const clearAnalysis = useAnalysisStore((state) => state.clearAnalysis)
  const hasValidData = useAnalysisStore((state) => state.hasValidData())
  const lastPersistedUpdate = useAnalysisStore((state) => state.lastUpdated)
  const [status, setStatus] = useState<{
    isLoading: boolean
    hasData: boolean
    lastUpdated: Date | null
  }>({
    isLoading: false,
    hasData: false,
    lastUpdated: null,
  })

  const effectiveHasData = status.hasData || hasValidData
  const effectiveLastUpdated = status.lastUpdated ?? lastPersistedUpdate
  const statusLabel = useMemo(() => {
    if (status.isLoading) {
      return t("analysis.loading")
    }

    if (effectiveLastUpdated) {
      return t("analysis.lastUpdated", { date: new Date(effectiveLastUpdated).toLocaleString() })
    }

    return t("analysis.notAnalyzed")
  }, [effectiveLastUpdated, status.isLoading, t])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-primary">{t('analysis.title')}</h2>
          <p className="text-base text-muted-foreground">{t('analysis.description')}</p>
        </div>
        <div className="flex items-center gap-4">
          <ButtonV2 
            onClick={() => clearAnalysis()}
            variant="ghost"
            size="default"
            title={t('analysis.clearCache')}
            disabled={status.isLoading || !effectiveHasData}
          >
            <Trash2 className="h-5 w-5" />
          </ButtonV2>
          <BadgeV2 variant="secondary" className="flex items-center gap-2">
            {status.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
            {statusLabel}
          </BadgeV2>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-1">
        <AccountsAnalysis onStatusChange={setStatus} />
      </div>
    </div>
  )
}
