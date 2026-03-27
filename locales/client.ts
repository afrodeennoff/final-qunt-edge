"use client"
import { createI18nClient } from 'next-international/client'
import React from 'react'

const raw = createI18nClient({
  en: () => import('./en'),
  fr: () => import('./fr'),
  hi: () => import('./en'),
  ja: () => import('./en'),
  es: () => import('./en'),
  it: () => import('./en'),
})

export const useRawI18n = raw.useI18n
export const useScopedI18n = raw.useScopedI18n
export const I18nProviderClient = raw.I18nProviderClient
export const useChangeLocale = raw.useChangeLocale
export const useCurrentLocale = raw.useCurrentLocale

export type TypedT = (key: string, params?: Record<string, unknown>) => React.ReactNode

export function useTypedI18n(): TypedT {
  const rawT = useRawI18n()
  return React.useCallback((key: string, params?: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (rawT as any)(key, params) as React.ReactNode
  }, [rawT])
}

export { useRawI18n as useI18n }
