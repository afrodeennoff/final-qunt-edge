"use client"

import { ButtonV2 } from "@/components/ui/v2"
import { InputV2 } from "@/components/ui/v2"
import { useDashboardFilters } from "@/context/data-provider"
import { useI18n } from "@/locales/client"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

interface PnlFilterSimpleProps {
  className?: string
}

export function PnlFilterSimple({ className }: PnlFilterSimpleProps) {
  const t = useI18n()
  const { pnlRange, setPnlRange } = useDashboardFilters()
  const [customMin, setCustomMin] = useState<string>("")
  const [customMax, setCustomMax] = useState<string>("")

  const handlePresetSelect = (min: number | undefined, max: number | undefined) => {
    setPnlRange({ min, max })
  }

  const handleCustomRangeApply = () => {
    setPnlRange({
      min: customMin === "" ? undefined : Number(customMin),
      max: customMax === "" ? undefined : Number(customMax)
    })
  }

  const isPresetActive = (min: number | undefined, max: number | undefined) => {
    return pnlRange.min === min && pnlRange.max === max
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{t('filters.pnl')}</Label>
      <Card>
        <CardContent className="p-3 space-y-3">
          {/* Preset buttons */}
          <div className="space-y-2">
            <ButtonV2 
              variant={isPresetActive(undefined, undefined) ? "default" : "outline"}
              size="sm"
              className="w-full justify-start"
              onClick={() => handlePresetSelect(undefined, undefined)}
            >
              {t('filters.allTrades')}
            </ButtonV2>
            <ButtonV2 
              variant={isPresetActive(0, undefined) ? "default" : "outline"}
              size="sm"
              className="w-full justify-start"
              onClick={() => handlePresetSelect(0, undefined)}
            >
              {t('filters.profitableTrades')}
            </ButtonV2>
            <ButtonV2 
              variant={isPresetActive(undefined, 0) ? "default" : "outline"}
              size="sm"
              className="w-full justify-start"
              onClick={() => handlePresetSelect(undefined, 0)}
            >
              {t('filters.losingTrades')}
            </ButtonV2>
          </div>

          {/* Custom range */}
          <div className="space-y-2 pt-2 border-t">
            <div className="text-xs text-muted-foreground">{t('filters.customRange')}</div>
            <div className="flex gap-2">
              <InputV2
                type="number"
                placeholder={t('filters.min')}
                value={customMin}
                onChange={(e) => setCustomMin(e.target.value)}
                className="h-8 text-xs"
              />
              <InputV2
                type="number"
                placeholder={t('filters.max')}
                value={customMax}
                onChange={(e) => setCustomMax(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <ButtonV2  
              onClick={handleCustomRangeApply}
              size="sm"
              className="w-full"
              variant="secondary"
            >
              {t('filters.apply')}
            </ButtonV2>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 