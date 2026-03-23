'use server'

import { createClient, getDatabaseUserId } from './auth'
import { prisma } from '@/lib/prisma'
import type { User } from '@supabase/supabase-js'
import type { Subscription } from '@/prisma/generated/prisma'

export type UserProfileData = {
  supabaseUser: User | null
  subscription: Subscription | null
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
  const subscription = await prisma.subscription.findUnique({
    where: { userId }
  })

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

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { showOnLeaderboard: true },
  })

  if (!currentUser) {
    return { success: false, showOnLeaderboard: false, error: "User not found" }
  }

  const newValue = !currentUser.showOnLeaderboard

  await prisma.user.update({
    where: { id: userId },
    data: { showOnLeaderboard: newValue },
  })

  return { success: true, showOnLeaderboard: newValue }
}

/**
 * Get the current user's leaderboard visibility status.
 */
export async function getLeaderboardVisibility(): Promise<{ showOnLeaderboard: boolean }> {
  const userId = await getDatabaseUserId()

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { showOnLeaderboard: true },
  })

  return { showOnLeaderboard: user?.showOnLeaderboard ?? false }
}
