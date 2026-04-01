'use server'
import { prisma } from '@/lib/prisma'
import { TickDetails } from '@/prisma/generated/prisma'
import { cacheLife, cacheTag } from 'next/cache'

const TICK_DETAILS_CACHE_TAG = 'global-tick-details'
const TICK_DETAILS_CACHE_LIFETIME = { stale: 3_600, revalidate: 3_600, expire: 7_200 } as const

function loadTickDetails(): Promise<TickDetails[]> {
  return prisma.tickDetails.findMany()
}

async function getTickDetailsCached(): Promise<TickDetails[]> {
  'use cache'
  cacheLife(TICK_DETAILS_CACHE_LIFETIME)
  cacheTag(TICK_DETAILS_CACHE_TAG)
  return loadTickDetails()
}

export async function getTickDetails(): Promise<TickDetails[]> {
  return getTickDetailsCached()
}
