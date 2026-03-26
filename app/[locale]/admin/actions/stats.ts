'use server'

import { createClient, User } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { normalizeTradesForClient } from '@/lib/data-types'
import { Trade as PrismaTrade } from '@/prisma/generated/prisma'
import { assertAdminAccess } from '@/server/authz'
import { isPrismaSchemaMismatchError } from '@/lib/prisma-guard'

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase admin configuration. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    )
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

function isAdminDataUnavailableError(error: unknown): boolean {
  if (isPrismaSchemaMismatchError(error)) return true

  if (!error || typeof error !== 'object') return false

  const maybeError = error as { code?: string; message?: string }
  const message = (maybeError.message ?? '').toLowerCase()

  return (
    maybeError.code === 'P1001' ||
    maybeError.code === 'ECONNREFUSED' ||
    message.includes('econnrefused') ||
    message.includes('can\'t reach database server')
  )
}

export async function getUserStats() {
  await assertAdminAccess()
  let supabase: ReturnType<typeof getSupabaseAdminClient> | null = null

  try {
    supabase = getSupabaseAdminClient()
  } catch (error) {
    console.warn('[AdminStats] Supabase admin client unavailable:', error)
    return {
      totalUsers: 0,
      dailyData: [],
      allUsers: [],
    }
  }

  let allUsers: User[] = []
  let page = 1
  const perPage = 1000
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage
    })

    if (error) {
      console.error('Error fetching users:', error)
      break
    }

    if (data.users.length === 0) {
      hasMore = false
    } else {
      allUsers = [...allUsers, ...data.users]
      page++
    }
  }

  // Group users by day of creation
  const dailyUsers = allUsers.reduce((acc, user) => {
    const day = user.created_at.slice(0, 10) // YYYY-MM-DD format
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Convert to array format for charts and sort by date
  const dailyData = Object.entries(dailyUsers)
    .map(([date, count]) => ({
      date,
      users: count
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    totalUsers: allUsers.length,
    dailyData,
    allUsers: allUsers.map(user => ({
      id: user.id,
      email: user.email || '',
      created_at: user.created_at
    }))
  }
}

export async function getFreeUsers() {
  await assertAdminAccess()
  let supabase: ReturnType<typeof getSupabaseAdminClient> | null = null

  try {
    supabase = getSupabaseAdminClient()
  } catch (error) {
    console.warn('[AdminStats] Supabase admin client unavailable:', error)
    return []
  }

  // Get all trades with their user IDs
  let trades: PrismaTrade[] = []

  try {
    trades = await prisma.trade.findMany({})
  } catch (error) {
    if (!isAdminDataUnavailableError(error)) {
      throw error
    }

    console.warn('[AdminStats] Trades unavailable:', error)
    return []
  }

  // Get all users who have subscriptions
  let subscribedUsers: Array<{ userId: string }> = []

  try {
    subscribedUsers = await prisma.subscription.findMany({
      select: { userId: true }
    })
  } catch (error) {
    if (!isAdminDataUnavailableError(error)) {
      throw error
    }

    console.warn('[AdminStats] Subscriptions unavailable:', error)
    return []
  }
  const subscribedUserIds = new Set(subscribedUsers.map((sub: { userId: string }) => sub.userId))

  // Get unique user IDs who have trades but no subscription
  const freeUserIds = [...new Set(trades.map((trade: PrismaTrade) => trade.userId))]
    .filter(userId => !subscribedUserIds.has(userId))

  // Get user emails from Supabase auth
  let allUsers: User[] = []
  let page = 1
  const perPage = 1000
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage
    })

    if (error) {
      console.error('Error fetching users:', error)
      break
    }

    if (data.users.length === 0) {
      hasMore = false
    } else {
      allUsers = [...allUsers, ...data.users]
      page++
    }
  }

  // Map free users to their emails and trades
  const mappedUsers = freeUserIds.map(userId => {
    const user = allUsers.find(u => u.id === userId)
    const userTrades = trades.filter((trade: PrismaTrade) => trade.userId === userId)
    return {
      email: user?.email || '',
      trades: normalizeTradesForClient(userTrades)
    }
  }).filter(user => user.email !== '')

  return mappedUsers
}

export async function getNewsletterStats() {
  await assertAdminAccess()

  try {
    const [totalSubscribers, activeSubscribers, inactiveSubscribers] = await Promise.all([
      prisma.newsletter.count(),
      prisma.newsletter.count({ where: { isActive: true } }),
      prisma.newsletter.count({ where: { isActive: false } }),
    ])

    return {
      totalSubscribers,
      activeSubscribers,
      inactiveSubscribers,
    }
  } catch (error) {
    if (!isAdminDataUnavailableError(error)) {
      throw error
    }

    console.warn('[AdminStats] Newsletter stats unavailable:', error)
    return {
      totalSubscribers: 0,
      activeSubscribers: 0,
      inactiveSubscribers: 0,
    }
  }
}
