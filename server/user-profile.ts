'use server'

import { createClient, getDatabaseUserId } from './auth'
import { prisma } from '@/lib/prisma'
import type { User } from '@supabase/supabase-js'
import type { Subscription } from '@/prisma/generated/prisma'
import { isPrismaSchemaMismatchError } from '@/lib/prisma-guard'

export type UserProfileData = {
  supabaseUser: User | null
  subscription: Subscription | null
}

function isUserProfileUnavailableError(error: unknown): boolean {
  if (isPrismaSchemaMismatchError(error)) return true

  if (!error || typeof error !== 'object') return false

  const maybeError = error as { code?: string; message?: string }
  const message = (maybeError.message ?? '').toLowerCase()

  return (
    maybeError.code === 'P2022' ||
    maybeError.code === 'P1001' ||
    maybeError.code === 'ECONNREFUSED' ||
    message.includes('showonleaderboard') ||
    message.includes('econnrefused') ||
    message.includes('can\'t reach database server')
  )
}

/**
 * Get user profile data including Supabase user and subscription.
 * This is a regular server action without caching - meant to be used
 * with Suspense boundaries for loading states.
 * 
 * Next.js will automatically handle request memoization during a single render.
 */
export async function getUserProfileAction(): Promise<UserProfileData> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      supabaseUser: null,
      subscription: null
    }
  }

  const userId = await getDatabaseUserId()

  // Fetch subscription data if user exists
  let subscription: Subscription | null = null

  try {
    subscription = await prisma.subscription.findUnique({
      where: { userId }
    })
  } catch (error) {
    if (!isUserProfileUnavailableError(error)) {
      throw error
    }
  }

  return {
    supabaseUser: user,
    subscription
  }
}

/**
 * Toggle the current user's leaderboard visibility.
 * Returns the new value of showOnLeaderboard.
 */
export async function toggleLeaderboardVisibility(): Promise<{ success: boolean; showOnLeaderboard: boolean; error?: string }> {
  const userId = await getDatabaseUserId()

  let currentUser: { showOnLeaderboard: boolean } | null = null

  try {
    currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { showOnLeaderboard: true },
    })
  } catch (error) {
    if (!isUserProfileUnavailableError(error)) {
      throw error
    }

    return { success: false, showOnLeaderboard: false, error: 'Leaderboard visibility unavailable' }
  }

  if (!currentUser) {
    return { success: false, showOnLeaderboard: false, error: "User not found" }
  }

  const newValue = !currentUser.showOnLeaderboard

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { showOnLeaderboard: newValue },
    })
  } catch (error) {
    if (!isUserProfileUnavailableError(error)) {
      throw error
    }

    return { success: false, showOnLeaderboard: currentUser.showOnLeaderboard, error: 'Leaderboard visibility unavailable' }
  }

  return { success: true, showOnLeaderboard: newValue }
}

/**
 * Get the current user's leaderboard visibility status.
 */
export async function getLeaderboardVisibility(): Promise<{ showOnLeaderboard: boolean }> {
  const userId = await getDatabaseUserId()

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { showOnLeaderboard: true },
    })

    return { showOnLeaderboard: user?.showOnLeaderboard ?? false }
  } catch (error) {
    if (!isUserProfileUnavailableError(error)) {
      throw error
    }

    return { showOnLeaderboard: false }
  }
}
