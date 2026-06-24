'use client'

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useI18n } from "@/locales/client"
import { ImportType } from "../import-type-selection"
import { platforms } from "../config/platforms"
import { Step } from "../import-button"

interface ImportDialogFooterProps {
  step: Step
  importType: ImportType
  onBack: () => void
  onNext: () => void | Promise<void>
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
  const isLastStep = Boolean(currentStep.isLastStep) || currentStepIndex === platform.steps.length - 1

  const getNextButtonText = () => {
    if (isSaving) return t('import.button.saving')
    if (isLastStep) {
      return t('import.button.save')
    }
    return t('import.button.next')
  }

  return (
    <div className="flex-none p-4 border-t bg-background/95 h-[68px]">
      <div className="flex justify-end items-center gap-4">
        {currentStepIndex > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-fit min-w-[100px]"
          >
            {t('import.button.back')}
          </Button>
        )}
        <Button
          type="button"
          onClick={async (e) => {
            e.preventDefault()
            e.stopPropagation()
            await onNext()
          }}
          className={cn(
            "w-fit min-w-[100px]",
            (currentStepIndex === 0 && (importType === 'rithmic-sync' || importType === 'tradovate-sync' || importType === 'dxfeed-sync')) && "invisible"
          )}
          disabled={isSaving || (!isLastStep && isNextDisabled)}
        >
          {getNextButtonText()}
        </Button>
      </div>
    </div>
  )
}
