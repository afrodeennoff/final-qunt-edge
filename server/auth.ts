'use server'
import { createServerClient } from '@supabase/ssr'
import type { UserIdentity } from '@supabase/auth-js'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { authSecurityConfig } from '@/lib/security/auth-config'
import { checkAuthGuard, recordAuthFailure, recordAuthSuccess } from '@/lib/security/auth-attempts'
import { PostAuthSetupError, ensureUserInDatabase } from './auth-user'
import { logger } from '@/lib/logger'
import {
  validatePasswordStrength,
} from '@/lib/security/password-validation'

const normalizeEnvValue = (value?: string): string => value?.trim() ?? ''

export async function getWebsiteURL() {
  let url =
    normalizeEnvValue(process?.env?.NEXT_PUBLIC_SITE_URL) || // Set this to your site URL in production env.
    normalizeEnvValue(process?.env?.NEXT_PUBLIC_VERCEL_URL) || // Optional public override.
    normalizeEnvValue(process?.env?.VERCEL_URL) || // Automatically set by Vercel at runtime.
    'http://localhost:3000/'
  // Make sure to include `https://` when not localhost.
  url = url.startsWith('http') ? url : `https://${url}`
  // Make sure to include a trailing `/`.
  url = url.endsWith('/') ? url : `${url}/`
  return url
}

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

const GENERIC_AUTH_ERROR = 'Invalid credentials or verification required'


function getExternalAuthErrorMessage(errorMessage: string): string {
  if (!authSecurityConfig.errorObfuscationEnabled) return errorMessage
  return GENERIC_AUTH_ERROR
}

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

export async function createClient() {
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

export async function signInWithDiscord(next: string | null = null, locale?: string) {
  const supabaseUrl = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)
  const supabaseKey = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Authentication is not configured. Please add Supabase environment variables to .env.local (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY). See README.md for setup instructions.')
  }

  const supabase = await createClient()
  const websiteURL = await getWebsiteURL()
  const callbackParams = new URLSearchParams()
  if (next) callbackParams.set('next', next)
  if (locale) callbackParams.set('locale', locale)
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: `${websiteURL}api/auth/callback/${callbackParams.toString() ? `?${callbackParams.toString()}` : ''}`,
    },
  })
  if (data.url) {
    redirect(data.url)
  }
}

export async function signInWithGoogle(next: string | null = null, locale?: string) {
  const supabaseUrl = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)
  const supabaseKey = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Authentication is not configured. Please add Supabase environment variables to .env.local (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY). See README.md for setup instructions.')
  }

  const supabase = await createClient()
  const websiteURL = await getWebsiteURL()
  const callbackParams = new URLSearchParams()
  if (next) callbackParams.set('next', next)
  if (locale) callbackParams.set('locale', locale)
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: {
        prompt: 'select_account',
      },
      redirectTo: `${websiteURL}api/auth/callback/${callbackParams.toString() ? `?${callbackParams.toString()}` : ''}`,
    },
  })
  if (data.url) {
    redirect(data.url)
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}


export async function signInWithEmail(email: string, next: string | null = null, locale?: string) {
  const requestIp = await getRequestIp()

  const supabaseUrl = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)
  const supabaseKey = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)

  if (!supabaseUrl || !supabaseKey) {
    const message = 'Authentication is not configured. Please add Supabase environment variables to .env.local (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY). See README.md for setup instructions.'
    if (process.env.NODE_ENV !== 'production') {
      return { success: false, error: message }
    }
    throw new Error(message)
  }

  try {
    const guard = await checkAuthGuard({
      email,
      ip: requestIp,
      actionType: 'magic_link_request',
    })
    if (!guard.allowed) {
      throw new Error(`${GENERIC_AUTH_ERROR}|RETRY_AFTER=${guard.retryAfterSeconds}`)
    }

    const supabase = await createClient()
    const websiteURL = await getWebsiteURL()
    const callbackParams = new URLSearchParams()
    if (next) callbackParams.set('next', next)
    if (locale) callbackParams.set('locale', locale)
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${websiteURL}api/auth/callback${callbackParams.toString() ? `?${callbackParams.toString()}` : ''}`,
      },
    })
    if (error) {
      throw new Error(error.message)
    }
    await recordAuthSuccess({
      email,
      ip: requestIp,
      actionType: 'magic_link_request',
    })
    return { success: true }
  } catch (error: unknown) {
    await recordAuthFailure({
      email,
      ip: requestIp,
      actionType: 'magic_link_request',
      userId: null,
    })
    if (error instanceof Error) {
      throw new Error(getExternalAuthErrorMessage(error.message))
    }
    handleAuthError(error)
  }
}

// Password-based authentication (login)
// If user doesn't exist, automatically creates account and signs in
export async function signInWithPasswordAction(
  email: string,
  password: string,
  next: string | null = null,
  locale?: string
) {
  const requestIp = await getRequestIp()

  const supabaseUrl = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)
  const supabaseKey = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)

  if (!supabaseUrl || !supabaseKey) {
    const message = 'Authentication is not configured. Please add Supabase environment variables to .env.local (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY). See README.md for setup instructions.'
    if (process.env.NODE_ENV !== 'production') {
      return { success: false, error: message }
    }
    throw new Error(message)
  }

  try {
    const guard = await checkAuthGuard({
      email,
      ip: requestIp,
      actionType: 'password_login',
    })
    if (!guard.allowed) {
      throw new Error(`${GENERIC_AUTH_ERROR}|RETRY_AFTER=${guard.retryAfterSeconds}`)
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      throw new Error(error.message)
    }

    // Sign-in succeeded normally
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await ensureUserInDatabase(user, locale)
      }
    } catch (e) {
      logger.error('[signInWithPasswordAction] ensureUserInDatabase failed', { error: e })
      throw new PostAuthSetupError()
    }

    // Optionally handle redirect on the client; return success and let client route
    const authUser = data.user ?? null
    await recordAuthSuccess({
      email,
      ip: requestIp,
      actionType: 'password_login',
      userId: authUser?.id ?? null,
    })
    return { success: true, next }
  } catch (error: unknown) {
    if (!(error instanceof PostAuthSetupError)) {
      await recordAuthFailure({
        email,
        ip: requestIp,
        actionType: 'password_login',
        userId: null,
      })
    }

    if (error instanceof PostAuthSetupError) {
      throw error
    }

    if (error instanceof Error) {
      throw new Error(getExternalAuthErrorMessage(error.message))
    }
    handleAuthError(error)
  }
}

// Password-based registration – auto signs in if email confirmation is disabled
export async function signUpWithPasswordAction(
  email: string,
  password: string,
  next: string | null = null,
  locale?: string
) {
  const passwordError = validatePasswordStrength(password)
  if (!passwordError.valid) {
    throw new Error(passwordError.errors.join(', '))
  }

  const requestIp = await getRequestIp()

  const supabaseUrl = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)
  const supabaseKey = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)
  if (!supabaseUrl || !supabaseKey) {
    const message = 'Authentication is not configured. Please add Supabase environment variables to .env.local (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY). See README.md for setup instructions.'
    if (process.env.NODE_ENV !== 'production') {
      return { success: false, error: message }
    }
    throw new Error(message)
  }

  try {
    const guard = await checkAuthGuard({
      email,
      ip: requestIp,
      actionType: 'password_login',
    })
    if (!guard.allowed) {
      throw new Error(`${GENERIC_AUTH_ERROR}|RETRY_AFTER=${guard.retryAfterSeconds}`)
    }

    const supabase = await createClient()
    const websiteURL = await getWebsiteURL()
    const callbackParams = new URLSearchParams()
    if (next) callbackParams.set('next', next)
    if (locale) callbackParams.set('locale', locale)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${websiteURL}api/auth/callback${callbackParams.toString() ? `?${callbackParams.toString()}` : ''}`,
      },
    })
    if (error) {
      throw new Error(error.message)
    }

    // If email confirmation is disabled, user is automatically signed in
    if (data.user && data.session) {
      try {
        await ensureUserInDatabase(data.user, locale)
      } catch (e) {
        logger.error('[signUpWithPasswordAction] ensureUserInDatabase failed', { error: e })
        throw new PostAuthSetupError()
      }
    }

    return { success: true, next }
  } catch (error: unknown) {
    if (error instanceof PostAuthSetupError) {
      throw error
    }
    handleAuthError(error)
  }
}

export async function verifyOtp(email: string, token: string, type: 'email' = 'email') {
  const requestIp = await getRequestIp()

  const supabaseUrl = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)
  const supabaseKey = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)

  if (!supabaseUrl || !supabaseKey) {
    const message = 'Authentication is not configured. Please add Supabase environment variables to .env.local (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY). See README.md for setup instructions.'
    if (process.env.NODE_ENV !== 'production') {
      return { success: false, error: message }
    }
    throw new Error(message)
  }

  try {
    const guard = await checkAuthGuard({
      email,
      ip: requestIp,
      actionType: 'otp_verify',
    })
    if (!guard.allowed) {
      throw new Error(`${GENERIC_AUTH_ERROR}|RETRY_AFTER=${guard.retryAfterSeconds}`)
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type
    })

    if (error) {
      throw new Error(error.message)
    }

    if (data.user && data.session) {
      try {
        const locale = email.includes('.fr') || email.startsWith('fr@') ? 'fr' : 'en'
        await ensureUserInDatabase(data.user, locale)
      } catch (setupError) {
        logger.error('[verifyOtp] ensureUserInDatabase failed', { error: setupError })
        throw new PostAuthSetupError()
      }
    }

    await recordAuthSuccess({
      email,
      ip: requestIp,
      actionType: 'otp_verify',
      userId: data.user?.id ?? null,
    })

    return { success: true, data }
  } catch (error: unknown) {
    if (!(error instanceof PostAuthSetupError)) {
      await recordAuthFailure({
        email,
        ip: requestIp,
        actionType: 'otp_verify',
        userId: null,
      })
    }

    if (error instanceof PostAuthSetupError) {
      throw error
    }

    if (error instanceof Error) {
      throw new Error(getExternalAuthErrorMessage(error.message))
    }
    handleAuthError(error)
  }
}


// Identity linking functions
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

export {
  ensureUserInDatabase,
  getDatabaseUserId,
  getUserId,
  getUserEmail,
  updateUserLanguage,
} from './auth-user'

export { setPasswordAction, resetPasswordForEmail, updatePassword } from './auth-password'
