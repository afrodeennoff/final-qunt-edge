'use server'

import { cookies, headers } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { authSecurityConfig } from '@/lib/security/auth-config'
import { checkAuthGuard, recordAuthFailure } from '@/lib/security/auth-attempts'
import {
  validatePasswordStrength,
} from '@/lib/security/password-validation'

const normalizeEnvValue = (value?: string): string => value?.trim() ?? ''

const GENERIC_AUTH_ERROR = 'Invalid credentials or verification required'

async function getRequestIp(): Promise<string> {
  try {
    const headerStore = await headers()
    const forwardedFor = headerStore.get('x-forwarded-for')
    const realIp = headerStore.get('x-real-ip')
    const ip = (forwardedFor?.split(',')[0] || realIp || '').trim()
    return ip || 'unknown'
  } catch {
    return 'unknown'
  }
}

async function createClient() {
  const cookieStore = await cookies()

  const url = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)
  const key = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
              })
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

async function getWebsiteURL() {
  let url =
    normalizeEnvValue(process?.env?.NEXT_PUBLIC_SITE_URL) ||
    normalizeEnvValue(process?.env?.NEXT_PUBLIC_VERCEL_URL) ||
    normalizeEnvValue(process?.env?.VERCEL_URL) ||
    'http://localhost:3000/'
  url = url.startsWith('http') ? url : `https://${url}`
  url = url.endsWith('/') ? url : `${url}/`
  return url
}

function getExternalAuthErrorMessage(errorMessage: string): string {
  if (!authSecurityConfig.errorObfuscationEnabled) return errorMessage
  return GENERIC_AUTH_ERROR
}

/**
 * Sends a password reset email. Rate-limited via checkAuthGuard.
 * Always returns a generic message to prevent email enumeration.
 */
export async function resetPasswordForEmail(email: string) {
  const requestIp = await getRequestIp()

  const supabaseUrl = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)
  const supabaseKey = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Authentication is not configured.')
  }

  try {
    const guard = await checkAuthGuard({
      email,
      ip: requestIp,
      actionType: 'password_reset_request',
    })
    if (!guard.allowed) {
      throw new Error(`${GENERIC_AUTH_ERROR}|RETRY_AFTER=${guard.retryAfterSeconds}`)
    }

    const supabase = await createClient()
    const websiteURL = await getWebsiteURL()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${websiteURL}authentication/reset-password`,
    })
    if (error) {
      throw new Error(GENERIC_AUTH_ERROR)
    }

    return { success: true }
  } catch (error: unknown) {
    if (error instanceof Error && !error.message.includes('RETRY_AFTER')) {
      await recordAuthFailure({
        email,
        ip: requestIp,
        actionType: 'password_reset_request',
        userId: null,
      })
    }
    if (error instanceof Error) {
      throw new Error(getExternalAuthErrorMessage(error.message))
    }
    throw new Error(GENERIC_AUTH_ERROR)
  }
}

/**
 * Updates the authenticated user's password.
 * Used after Supabase redirect-based password reset or for password changes.
 */
export async function updatePassword(newPassword: string) {
  const passwordResult = validatePasswordStrength(newPassword)
  if (!passwordResult.valid) {
    throw new Error(passwordResult.errors.join(', '))
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      throw new Error(error.message)
    }
    return { success: true }
  } catch (error: unknown) {
    if (error instanceof Error) throw error
    throw new Error('Failed to update password')
  }
}

/**
 * Allow a logged-in user to set or change their password.
 */
export async function setPasswordAction(newPassword: string) {
  const passwordResult = validatePasswordStrength(newPassword)
  if (!passwordResult.valid) {
    throw new Error(passwordResult.errors.join(', '))
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      throw new Error(error.message)
    }
    return { success: true }
  } catch (error: unknown) {
    if (error instanceof Error) throw error
    throw new Error('Failed to set password')
  }
}
