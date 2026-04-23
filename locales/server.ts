import { createI18nServer } from 'next-international/server'
import React from 'react'

const raw = createI18nServer({
  en: () => import('./en'),
  fr: () => import('./fr'),
  hi: () => import('./hi'),
  ja: () => import('./ja'),
  es: () => import('./es'),
  it: () => import('./it'),
  // Fallbacks for supported middleware locales that lack files
  de: () => import('./en'),
  pt: () => import('./en'),
  vi: () => import('./en'),
  zh: () => import('./en'),
  yo: () => import('./en'),
})

export const getI18n = raw.getI18n
export const getScopedI18n = raw.getScopedI18n
export const getCurrentLocale = raw.getCurrentLocale
export const getStaticParams = raw.getStaticParams

export type TypedServerT = (key: string, params?: Record<string, unknown>) => React.ReactNode

export async function getTypedI18n(): Promise<TypedServerT> {
  const rawT = await raw.getI18n()
  return (key: string, params?: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (rawT as any)(key, params) as React.ReactNode
  }
}