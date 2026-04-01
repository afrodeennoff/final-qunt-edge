'use client'

import { ButtonV2 } from "@/components/ui/v2"
import { cn } from "@/lib/utils"
import { useI18n } from "@/locales/client"
import { ArrowLeft, ArrowRight, Save } from "lucide-react"
import { ImportType } from "../import-type-selection"
import { platforms } from "../config/platforms"
import { Step } from "../import-button"

interface ImportDialogFooterProps {
  step: Step
  importType: ImportType
  onBack: () => void
  onNext: () => void
  isSaving: boolean
  isNextDisabled?: boolean
}

export function ImportDialogFooter({
  step,
  importType,
  onBack,
  onNext,
  isSaving,
  isNextDisabled
}: ImportDialogFooterProps) {
  const t = useI18n()
  const platform = platforms.find(p => p.type === importType) || platforms.find(p => p.platformName === 'csv-ai')
  if (!platform) return null

  const currentStep = platform.steps.find(s => s.id === step)
  if (!currentStep) return null

  const currentStepIndex = platform.steps.findIndex(s => s.id === step)

  const isLastStep = currentStep.isLastStep
  const isFirstStep = currentStepIndex === 0
  const isSyncFirstStep = isFirstStep && (importType === 'rithmic-sync' || importType === 'tradovate-sync')

  return (
    <div className="flex-none border-t border-v2-border bg-v2-bg-surface/95 px-6 py-4 backdrop-blur-sm supports-backdrop-filter:bg-v2-bg-surface/60">
      <div className="flex items-center justify-between">
        <span className="text-xs text-v2-text-muted tabular-nums">
          {currentStepIndex + 1} / {platform.steps.length}
        </span>
        <div className="flex items-center gap-3">
          {currentStepIndex > 0 && (
            <ButtonV2
              variant="outline"
              size="sm"
              onClick={onBack}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              disabled={isSaving}
            >
              {t('import.button.back')}
            </ButtonV2>
          )}
          <ButtonV2
            variant="solid"
            size="sm"
            onClick={onNext}
            isLoading={isSaving}
            loadingText={t('import.button.saving')}
            rightIcon={!isSaving && (isLastStep ? <Save className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />)}
            className={cn(
              "min-w-[100px]",
              isSyncFirstStep && "invisible"
            )}
            disabled={isNextDisabled || isSaving}
          >
            {isLastStep ? t('import.button.save') : t('import.button.next')}
          </ButtonV2>
        </div>
      </div>
    </div>
  )
} 