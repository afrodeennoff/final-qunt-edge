'use client'

import { Moon } from 'lucide-react'
import { Button } from './ui/button'

export function ThemeSwitcher() {
  return (
    <ButtonV2  variant="ghost" size="icon" aria-label="Dark theme enabled">
      <Moon className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Dark theme enabled</span>
    </Button>
  )
}
