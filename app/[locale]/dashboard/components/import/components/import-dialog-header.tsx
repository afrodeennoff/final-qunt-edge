'use client'

import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useI18n } from "@/locales/client"
import { platforms } from "../config/platforms"
import { ImportType } from "../import-type-selection"
import { Step } from "../import-button"

interface ImportDialogHeaderProps {
  step: Step
  importType: ImportType
}

export function ImportDialogHeader({ step, importType }: ImportDialogHeaderProps) {
  const t = useI18n()
  const platform = platforms.find(p => p.type === importType) || platforms.find(p => p.platformName === 'csv-ai')
  if (!platform) return null

  const currentStep = platform.steps.find(s => s.id === step)
  const currentStepIndex = platform.steps.findIndex(s => s.id === step)
  const totalSteps = platform.steps.length
  const progress = totalSteps > 1 ? (currentStepIndex / (totalSteps - 1)) * 100 : 100

  return (
    <DialogHeader className="flex-none border-b border-v2-border px-6 py-5 gap-3">
      <div className="flex items-center gap-3">
        {platform.logo.path && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-v2-border/50 bg-v2-bg-base/80 p-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={platform.logo.path}
              alt={platform.logo.alt || ""}
              className="h-full w-full object-contain"
            />
          </div>
        )}
        <div className="min-w-0">
          <DialogTitle className="text-base font-semibold leading-tight">
            {t((currentStep?.title || 'import.title') as any, { count: 1 })}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-v2-text-secondary leading-snug">
            {t((currentStep?.description || 'import.description') as any, { count: 1 })}
          </DialogDescription>
        </div>
      </div>

      {totalSteps > 1 && (
        <div className="space-y-2 pt-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-v2-bg-hover">
            <div
              className="h-full rounded-full bg-v2-accent transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between gap-2 px-0.5">
            {platform.steps.map((s, index) => (
              <div
                key={s.id}
                className={cn(
                  "text-[11px] leading-none whitespace-nowrap transition-colors",
                  currentStepIndex > index
                    ? "text-v2-text-primary font-medium"
                    : currentStepIndex === index
                      ? "text-v2-accent font-semibold"
                      : "text-v2-text-muted"
                )}
              >
                {t(s.title as any, { count: 1 })}
              </div>
            ))}
          </div>
        </div>
      )}
    </DialogHeader>
  )
} 