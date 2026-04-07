'use server'
import type { UserIdentity } from '@supabase/auth-js'
import { redirect } from 'next/navigation'
import { createClient, getWebsiteURL } from './auth'
import { logger } from '@/lib/logger'

/**
 * Wraps Supabase auth operations to handle JSON parsing errors gracefully.
 * When Supabase API returns HTML error pages instead of JSON, this provides
 * a more meaningful error message.
 */
function handleAuthError(error: unknown): never {
  // Check if this is a JSON parsing error (indicates HTML response)
  if (
    (error as { message?: string })?.message?.includes('Unexpected token') ||
    (error as { message?: string })?.message?.includes('is not valid JSON') ||
    (error as { originalError?: { message?: string } })?.originalError?.message?.includes('Unexpected token') ||
    (error as { originalError?: { message?: string } })?.originalError?.message?.includes('is not valid JSON')
  ) {
    logger.error('[Auth] Supabase API returned non-JSON response', {
      error: (error as { message?: string })?.message,
      originalError: (error as { originalError?: { message?: string } })?.originalError?.message,
    })
    throw new Error(
      'Authentication service is temporarily unavailable. The service returned an invalid response. Please try again in a few moments.'
    )
  }

  // Re-throw other errors as-is
  throw error
}

export async function linkDiscordAccount() {
  const supabase = await createClient()
  const websiteURL = await getWebsiteURL()
  const { data, error } = await supabase.auth.linkIdentity({
    provider: 'discord',
    options: {
      redirectTo: `${websiteURL}api/auth/callback?action=link`,
    },
  })
  if (data.url) {
    redirect(data.url)
  }
  if (error) {
    throw new Error(error.message)
  }
}

export async function linkGoogleAccount() {
  const supabase = await createClient()
  const websiteURL = await getWebsiteURL()
  const { data, error } = await supabase.auth.linkIdentity({
    provider: 'google',
    options: {
      redirectTo: `${websiteURL}api/auth/callback?action=link`,
    },
  })
  if (data.url) {
    redirect(data.url)
  }
  if (error) {
    throw new Error(error.message)
  }
}

export async function unlinkIdentity(identity: UserIdentity) {
  const supabase = await createClient()
  const { error } = await supabase.auth.unlinkIdentity(identity)
  if (error) {
    throw new Error(error.message)
  }
  return { success: true }
}

export async function getUserIdentities() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      throw new Error('User not authenticated')
    }

    // Get user's identities using the proper method
    const { data: identities, error: identitiesError } = await supabase.auth.getUserIdentities()

    if (identitiesError) {
      throw new Error(identitiesError.message)
    }

    return identities
  } catch (error: unknown) {
    handleAuthError(error)
  }
}
