'use client'

import { ButtonV2 } from "@/components/ui/v2"
import { Moon } from "lucide-react"
import { useI18n } from "@/locales/client"

export function ThemeSwitcher() {
  const t = useI18n()

  return (
    <ButtonV2  variant="ghost" size="icon" className="h-8 w-8" aria-label={t('landing.navbar.darkMode')}>
      <Moon className="h-4 w-4" />
      <span className="sr-only">{t('landing.navbar.darkMode')}</span>
    </ButtonV2>
  )
} 
