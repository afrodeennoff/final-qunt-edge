'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/server/auth'
import { resolveTeamUserId } from '@/server/team-membership'
import { isAdminUser } from '@/server/authz'

/**
 * Get the currently authenticated Supabase user.
 * Returns null if not authenticated.
 */
export async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user ?? null
}

/**
 * Get the authenticated user and throw if not logged in.
 */
export async function requireAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.id) {
    throw new Error('Unauthorized')
  }
  return user
}

/**
 * Resolve the internal team user ID for the currently authenticated user.
 * Throws if not authenticated.
 */
export async function getRequiredTeamUserId() {
  const user = await requireAuthUser()
  const teamUserId = await resolveTeamUserId(user.id)
  return { user, teamUserId }
}

/**
 * Check if the currently authenticated user is an admin.
 */
export async function checkAdminStatus(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    return isAdminUser(user)
  } catch (error) {
    return false
  }
}
