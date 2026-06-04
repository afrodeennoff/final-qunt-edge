'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Link2, FileSpreadsheet, Database, Pencil, Search, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/locales/client"
import { platforms, PlatformConfig, PlatformType } from './config/platforms'
import { PlatformItem } from './components/platform-item'
import { PlatformTutorial } from './components/platform-tutorial'
import { cn } from '@/lib/utils'
import { useImportTypePreferenceStore } from '@/store/import-type-preference-store'

export type ImportType = PlatformType

interface ImportTypeSelectionProps {
  selectedType: ImportType
  setSelectedType: React.Dispatch<React.SetStateAction<ImportType>>
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const categoryMeta: Record<PlatformConfig['category'], { icon: React.ReactNode; color: string }> = {
  'Direct Account Sync': {
    icon: <Link2 className="h-3.5 w-3.5" />,
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400"
  },
  'Intelligent Import': {
    icon: <FileSpreadsheet className="h-3.5 w-3.5" />,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
  },
  'Platform CSV Import': {
    icon: <Database className="h-3.5 w-3.5" />,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400"
  },
  'Manual Entry': {
    icon: <Pencil className="h-3.5 w-3.5" />,
    color: "bg-sky-500/10 text-sky-600 dark:text-sky-400"
  }
}

function isWeekend() {
  const day = new Date().getDay()
  return day === 0 || day === 6
}

export default function ImportTypeSelection({ selectedType, setSelectedType, setIsOpen }: ImportTypeSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [focusedCategory, setFocusedCategory] = useState<PlatformConfig['category'] | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const t = useI18n()
  const { lastSelectedType, setLastSelectedType } = useImportTypePreferenceStore()

  useEffect(() => {
    setSelectedType(lastSelectedType)
  }, [setSelectedType, lastSelectedType])

  const getTranslatedCategory = (category: PlatformConfig['category']) => {
    switch (category) {
      case 'Direct Account Sync':
        return t('import.type.category.directSync')
      case 'Intelligent Import':
        return t('import.type.category.intelligentImport')
      case 'Platform CSV Import':
        return t('import.type.category.platformCsv')
      case 'Manual Entry':
        return t('import.type.category.manualEntry')
      default:
        return category
    }
  }

  const filteredPlatforms = platforms.filter(platform =>
    t(platform.name as keyof typeof t).toLowerCase().includes(searchQuery.toLowerCase()) ||
    t(platform.description as keyof typeof t).toLowerCase().includes(searchQuery.toLowerCase()) ||
    getTranslatedCategory(platform.category).toLowerCase().includes(searchQuery.toLowerCase())
  )

  const categories = Array.from(new Set(filteredPlatforms.map(platform => platform.category)))
  const selectedPlatform = platforms.find(p => p.type === selectedType)

  return (
    <div className="flex flex-col h-full">
      <div className="grid md:grid-cols-2 gap-0 h-full min-h-0">
        <div className="h-full min-h-0 flex flex-col border-r border-border/50">
          <div className="relative shrink-0 px-5 pt-2 pb-3">
            <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={searchRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('import.type.search')}
              className="pl-9 h-9 text-sm rounded-lg bg-muted/50 border-border/60 focus-visible:bg-background"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <ScrollArea className="flex-1 px-3 pb-3">
            <div className="space-y-5">
              {searchQuery && filteredPlatforms.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="h-8 w-8 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">{t('import.type.noResults')}</p>
                </div>
              )}

              {categories.map(category => {
                const categoryPlatforms = filteredPlatforms.filter(platform => platform.category === category)
                if (categoryPlatforms.length === 0) return null

                const meta = categoryMeta[category]

                return (
                  <div key={category}>
                    <div className={cn(
                      "flex items-center gap-2 mb-2 px-1",
                      focusedCategory === category ? "opacity-100" : "opacity-70"
                    )}>
                      <div className={cn(
                        "flex h-5 w-5 items-center justify-center rounded",
                        meta.color
                      )}>
                        {meta.icon}
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {getTranslatedCategory(category)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {categoryPlatforms.map((platform) => (
                        <PlatformItem
                          key={platform.type}
                          platform={platform}
                          isSelected={selectedType === platform.type}
                          onSelect={(type) => {
                            setSelectedType(type as ImportType)
                            setLastSelectedType(type as ImportType)
                          }}
                          onHover={(category) => setFocusedCategory(category as PlatformConfig['category'])}
                          onLeave={() => setFocusedCategory(null)}
                          isWeekend={isWeekend()}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="h-full min-h-0 overflow-y-auto">
          {selectedType !== '' && selectedPlatform ? (
            selectedPlatform.customComponent ? (
              <div className="h-full p-5">
                <selectedPlatform.customComponent setIsOpen={setIsOpen} />
              </div>
            ) : (
              <div className="p-5">
                <PlatformTutorial selectedPlatform={selectedPlatform} setIsOpen={setIsOpen} />
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="h-12 w-12 rounded-xl bg-muted/60 flex items-center justify-center mb-4">
                <Link2 className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {t('import.type.selectPrompt')}
              </p>
              <p className="text-xs text-muted-foreground/60">
                {t('import.type.selectPromptDescription')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}