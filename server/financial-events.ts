'use server'

import { FinancialEvent } from '@/prisma/generated/prisma'
import { prisma } from '@/lib/prisma'
import { cacheLife, cacheTag } from 'next/cache'

const FINANCIAL_EVENTS_CACHE_TAG = (locale: string) => `global-financial-events-${locale}`
const FINANCIAL_EVENTS_CACHE_LIFETIME = { stale: 3_600, revalidate: 3_600, expire: 7_200 } as const

function loadFinancialEvents(locale: string | undefined): Promise<FinancialEvent[]> {
  const where = locale ? { lang: locale } : {}
  return prisma.financialEvent.findMany({
    where,
    orderBy: { date: 'desc' },
    select: {
      id: true,
      title: true,
      date: true,
      importance: true,
      type: true,
      description: true,
      sourceUrl: true,
      country: true,
      lang: true,
      timezone: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

async function getFinancialEventsCached(locale: string | undefined): Promise<FinancialEvent[]> {
  'use cache'
  cacheLife(FINANCIAL_EVENTS_CACHE_LIFETIME)
  cacheTag(FINANCIAL_EVENTS_CACHE_TAG(locale ?? 'all'), 'financial-events')
  return loadFinancialEvents(locale)
}

export async function getFinancialEvents(locale: string | undefined = undefined): Promise<FinancialEvent[]> {
  return getFinancialEventsCached(locale)
}
