'use client'

import { Button } from "@/components/ui/button"
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
 const isSyncPlatform = !!platform.customComponent
 const isSyncFirstStep = isFirstStep && isSyncPlatform

 return (
 <div className="flex-none border-t border-border bg-card/95 px-6 py-4 supports-backdrop-filter:bg-card/60">
 <div className="flex items-center justify-between">
 <span className="text-xs text-muted-foreground tabular-nums">
 {currentStepIndex + 1} / {platform.steps.length}
 </span>
 <div className="flex items-center gap-3">
 {currentStepIndex > 0 && (
 <Button
 variant="outline"
 size="sm"
 onClick={onBack}
 leftIcon={<ArrowLeft className="h-4 w-4" />}
 disabled={isSaving}
 >
 {t('import.button.back')}
 </Button>
 )}
 <Button
 variant="solid"
 size="sm"
 onClick={onNext}
 isLoading={isSaving}
 loadingText={t('import.button.saving')}
 rightIcon={!isSaving && (isLastStep ? <Save className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />)}
 className={cn("min-w-[100px]",
 isSyncFirstStep &&"invisible"
 )}
 disabled={isNextDisabled || isSaving}
 >
 {isLastStep ? t('import.button.save') : t('import.button.next')}
 </Button>
 </div>
 </div>
 </div>
 )
}
