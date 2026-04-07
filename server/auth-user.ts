'use server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { User } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { isPrismaColumnAvailable, isPrismaSchemaMismatchError, markPrismaColumnUnavailable } from '@/lib/prisma-guard'


const normalizeEnvValue = (value?: string): string => value?.trim() ?? ''


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


const POST_AUTH_SETUP_ERROR_MESSAGE =
  'Account setup is temporarily unavailable. Please try again in a few moments.'
const USER_SYNC_SELECT = {
  id: true,
  email: true,
  language: true,
} as const

const USER_TABLE_NAME = 'User'
const AUTH_USER_ID_COLUMN = 'auth_user_id'
const LANGUAGE_COLUMN = 'language'


type UserSyncRecord = {
  id: string
  email: string
  language?: string | null
}


// Note: PostAuthSetupError is now defined in server/auth.ts to avoid 'use server' export restrictions
class PostAuthSetupError extends Error {
  constructor(message = POST_AUTH_SETUP_ERROR_MESSAGE) {
    super(message)
    this.name = 'PostAuthSetupError'
  }
}


async function signOutSilently() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}


async function findUserByIdCompat(userId: string): Promise<UserSyncRecord | null> {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: USER_SYNC_SELECT,
    })
  } catch (error) {
    if (!isPrismaSchemaMismatchError(error)) {
      throw error
    }

    const legacyUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
      },
    })

    if (!legacyUser) {
      return null
    }

    return {
      ...legacyUser,
      language: null,
    }
  }
}


async function findUserByAuthIdCompat(authUserId: string): Promise<UserSyncRecord | null> {
  const hasAuthUserIdColumn = await isPrismaColumnAvailable(USER_TABLE_NAME, AUTH_USER_ID_COLUMN)
  if (!hasAuthUserIdColumn) {
    return findUserByIdCompat(authUserId)
  }

  try {
    return await prisma.user.findUnique({
      where: { auth_user_id: authUserId },
      select: USER_SYNC_SELECT,
    })
  } catch (error) {
    if (!isPrismaSchemaMismatchError(error)) {
      throw error
    }

    markPrismaColumnUnavailable(USER_TABLE_NAME, AUTH_USER_ID_COLUMN)
    logger.warn(
      '[ensureUserInDatabase] WARNING: auth_user_id lookup hit schema mismatch; falling back to id lookup',
      { authUserId }
    )

    return findUserByIdCompat(authUserId)
  }
}


async function upsertUserByIdAndEmailCompat(userId: string, email: string): Promise<UserSyncRecord> {
  await prisma.$executeRaw`
    INSERT INTO "public"."User" ("id", "email", "auth_user_id")
    VALUES (${userId}, ${email}, ${userId})
    ON CONFLICT ("id")
    DO UPDATE SET "email" = EXCLUDED."email"
  `

  const userRecord = await findUserByIdCompat(userId)
  if (!userRecord) {
    throw new Error('Failed to load user record after compatibility upsert')
  }
  return userRecord
}


/**
 * ensureUserInDatabase
 *
 * Ensures there is a corresponding user record in the public schema linked to the
 * Supabase Auth user, and synchronizes the preferred language/locale from the client.
 *
 * Behavior:
 * - If a user with matching `auth_user_id` exists, updates the email if it changed and
 *   keeps language set to the provided `locale` (fallbacks to existing value).
 * - If no match by `auth_user_id`, optionally checks for an existing user by email; if an
 *   email conflict with a different `auth_user_id` is detected, signs out and throws.
 * - Otherwise, creates a new `user` with `id` and `auth_user_id` set to the Supabase user id,
 *   email set from the Supabase profile, and language set to `locale` (default 'en'). Also
 *   attempts to create a default dashboard layout for first-time users.
 *
 * Parameters:
 * - user: Supabase `User` object (required). Must contain a valid `id`.
 * - locale: Optional locale string from the client (e.g. 'en', 'fr'). When provided, it is
 *   persisted to the `language` field for the user record.
 * - options: Optional behavior flags.
 *   - skipDefaultLayout?: when `true`, skips default dashboard layout creation for newly
 *     created users. Defaults to `false` (layout is created).
 *
 * Returns:
 * - The up-to-date Prisma `user` record.
 *
 * Side effects:
 * - May sign the user out on integrity or identification errors.
 * - May create a default dashboard layout for new users unless
 *   `options.skipDefaultLayout` is `true`.
 *
 * Errors:
 * - Throws on missing user or id, account conflicts, Prisma integrity/validation issues, or
 *   unexpected errors. NEXT_REDIRECT errors are re-thrown to allow Next.js redirects.
 *
 * Notes:
 * - `options.skipDefaultLayout` changes side effects only (layout creation). The returned
 *   Prisma user record semantics are unchanged.
 */
export async function ensureUserInDatabase(
  user: User,
  locale?: string,
  options?: { skipDefaultLayout?: boolean }
) {
  if (!user) {
    await signOutSilently();
    throw new Error('User data is required');
  }

  if (!user.id) {
    await signOutSilently();
    throw new Error('User ID is required');
  }

  const ensureDashboardLayoutBackfill = async (targetUserId: string): Promise<void> => {
    try {
      const existingLayout = await prisma.dashboardLayout.findUnique({
        where: { userId: targetUserId },
        select: { id: true },
      });

      if (!existingLayout) {
        const { createDefaultDashboardLayout } = await import('@/server/database');
        await createDefaultDashboardLayout(targetUserId);
      }
    } catch (layoutError) {
      logger.error(
        '[ensureUserInDatabase] WARNING: Failed to backfill default dashboard layout',
        { error: layoutError }
      );
    }
  };

  try {
    // First try to find user by auth_user_id
    const existingUserByAuthId = await findUserByAuthIdCompat(user.id)

    // If user exists by auth_user_id, update fields if needed
    if (existingUserByAuthId) {
      const shouldUpdateEmail = existingUserByAuthId.email !== user.email;
      const shouldUpdateLanguage = !!locale && locale !== existingUserByAuthId.language
      const canUpdateLanguage =
        shouldUpdateLanguage && (await isPrismaColumnAvailable(USER_TABLE_NAME, LANGUAGE_COLUMN))

      if (shouldUpdateEmail || canUpdateLanguage) {
        try {
          const updatedUser = await prisma.user.update({
            where: {
              id: existingUserByAuthId.id
            },
            data: {
              ...(shouldUpdateEmail
                ? { email: user.email || existingUserByAuthId.email }
                : {}),
              ...(canUpdateLanguage ? { language: locale as string } : {}),
            },
            select: USER_SYNC_SELECT,
          });
          await ensureDashboardLayoutBackfill(user.id);
          return updatedUser;
        } catch (updateError) {
          if (isPrismaSchemaMismatchError(updateError) && canUpdateLanguage) {
            markPrismaColumnUnavailable(USER_TABLE_NAME, LANGUAGE_COLUMN)
          }
          logger.error('[ensureUserInDatabase] ERROR: Failed to update user record', { error: updateError });
          throw new Error('Failed to update user');
        }
    }
    if (!options?.skipDefaultLayout) {
      await ensureDashboardLayoutBackfill(user.id);
    }
    return existingUserByAuthId;
    }

    // If user doesn't exist by auth_user_id, check if email exists
    if (user.email) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true },
      });

      const isDifferentUser = existingUserByEmail !== null && existingUserByEmail?.id !== user.id

      if (isDifferentUser) {
        await signOutSilently();
        throw new Error('Account conflict: Email already associated with different authentication method');
      }
    }

    // Create new user if no existing user found
    try {
      const hasLanguageColumn = await isPrismaColumnAvailable(USER_TABLE_NAME, LANGUAGE_COLUMN)

      const newUser = await prisma.user.create({
        data: {
          auth_user_id: user.id,
          email: user.email || '', // Provide a default empty string if email is null
          id: user.id,
          ...(hasLanguageColumn ? { language: locale || 'en' } : {}),
        },
        select: USER_SYNC_SELECT,
      });

      // Create default dashboard layout for new user unless explicitly skipped
      if (!options?.skipDefaultLayout) {
        await ensureDashboardLayoutBackfill(newUser.id)
      }

      return newUser;
    } catch (createError: unknown) {
      if (isPrismaSchemaMismatchError(createError)) {
        markPrismaColumnUnavailable(USER_TABLE_NAME, AUTH_USER_ID_COLUMN)
        markPrismaColumnUnavailable(USER_TABLE_NAME, LANGUAGE_COLUMN)
        return upsertUserByIdAndEmailCompat(user.id, user.email || '')
      }
      const errObj = createError as { message?: string }
      if (errObj?.message?.includes('Unique constraint failed')) {
        await signOutSilently();
        throw new Error('Database integrity error: Duplicate user records found');
      }
      logger.error('[ensureUserInDatabase] ERROR: Failed to create user', { error: createError });
      await signOutSilently();
      throw new Error('Failed to create user account');
    }
  } catch (error) {
    // Re-throw NEXT_REDIRECT errors immediately (these are normal Next.js redirects)
    if (error instanceof Error && (
      error.message === 'NEXT_REDIRECT' ||
      ('digest' in error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT'))
    )) {
      throw error;
    }

    logger.error('[ensureUserInDatabase] ERROR: Unexpected error in main catch block', { error });

    // Handle Prisma validation errors
    if (error instanceof Error) {
      if (error.message.includes('Argument `where` of type UserWhereUniqueInput needs')) {
        await signOutSilently();
        throw new Error('Invalid user identification provided');
      }

      if (error.message.includes('Unique constraint failed')) {
        await signOutSilently();
        throw new Error('Database integrity error: Duplicate user records found');
      }

      if (error.message.includes('Account conflict')) {
        // Error already handled above
        throw error;
      }
    }

    // For any other unexpected errors, log out the user
    await signOutSilently();
    throw new Error('Critical database error occurred. Please try logging in again.');
  }
}


async function requireAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user?.id) {
    throw new Error("User not authenticated")
  }

  return user
}


// Optimized function that uses middleware data when available
export async function getUserId(): Promise<string> {
  const user = await requireAuthenticatedUser()
  return user.id
}


// Hot-path cache for resolved user IDs to avoid repetitive DB lookups
const userIdCache = new Map<string, string>()


/**
 * Resolve the database user primary key (`User.id`) from an auth/middleware id.
 * Most relational tables (`Account`, `Trade`, `Tag`, `Mood`, etc.) reference `User.id`.
 */
export async function getDatabaseUserId(): Promise<string> {
  const user = await requireAuthenticatedUser()
  const rawUserId = user.id

  // Check in-memory cache first
  const cachedId = userIdCache.get(rawUserId)
  if (cachedId) return cachedId

  const byId = await prisma.user.findUnique({
    where: { id: rawUserId },
    select: { id: true },
  })

  let byAuthId: { id: string } | null = null
  const hasAuthUserIdColumn = await isPrismaColumnAvailable(USER_TABLE_NAME, AUTH_USER_ID_COLUMN)
  if (hasAuthUserIdColumn) {
    try {
      byAuthId = await prisma.user.findUnique({
        where: { auth_user_id: rawUserId },
        select: { id: true },
      })
    } catch (error) {
      if (!isPrismaSchemaMismatchError(error)) {
        throw error
      }
      markPrismaColumnUnavailable(USER_TABLE_NAME, AUTH_USER_ID_COLUMN)
    }
  }

  // Prefer legacy auth_user_id mapping if it points to a different row than raw auth id.
  // This avoids selecting an empty shadow user row while data (trades/accounts/layouts) lives on legacy id.
  if (byAuthId?.id && byAuthId.id !== rawUserId) {
    logger.warn(
      '[getDatabaseUserId] Divergent auth mapping detected; using auth_user_id row',
      { rawUserId, resolvedUserId: byAuthId.id }
    )
    userIdCache.set(rawUserId, byAuthId.id)
    return byAuthId.id
  }

  const finalId = byId?.id || byAuthId?.id
  if (finalId) {
    userIdCache.set(rawUserId, finalId)
    return finalId
  }


  let resolvedEmail = user.email?.trim().toLowerCase() || ""

  if (!resolvedEmail) {
    resolvedEmail = `${rawUserId}@users.qunt-edge.local`
  }

  const created = await (async () => {
    try {
      return await prisma.user.upsert({
        where: { id: rawUserId },
        create: {
          id: rawUserId,
          email: resolvedEmail,
          auth_user_id: rawUserId,
        },
        update: {
          email: resolvedEmail,
        },
        select: { id: true },
      })
    } catch (error) {
      const isUniqueConstraintError =
        (typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          (error as { code?: string }).code === 'P2002') ||
        (error instanceof Error && error.message.includes('Unique constraint failed'))

      if (isUniqueConstraintError) {
        const existingByEmail = resolvedEmail
          ? await prisma.user.findUnique({
              where: { email: resolvedEmail },
              select: { id: true },
            })
          : null

        if (existingByEmail?.id) {
          userIdCache.set(rawUserId, existingByEmail.id)
          return { id: existingByEmail.id }
        }
      }

      if (!isPrismaSchemaMismatchError(error)) {
        throw error
      }

      markPrismaColumnUnavailable(USER_TABLE_NAME, AUTH_USER_ID_COLUMN)
      await upsertUserByIdAndEmailCompat(rawUserId, resolvedEmail)
      return { id: rawUserId }
    }
  })()

  return created.id
}


export async function getUserEmail(): Promise<string> {
  const user = await requireAuthenticatedUser()
  return user.email || ""
}


// Lightweight updater for user language without full ensure logic
export async function updateUserLanguage(locale: string): Promise<{ updated: boolean }> {
  const allowedLocales = new Set(['en', 'fr'])
  if (!allowedLocales.has(locale)) {
    return { updated: false }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.id) {
    return { updated: false }
  }

  let existing: { id: string; language: string | null } | null = null
  try {
    existing = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        language: true,
      },
    })
  } catch (error) {
    if (isPrismaSchemaMismatchError(error)) {
      markPrismaColumnUnavailable(USER_TABLE_NAME, LANGUAGE_COLUMN)
      return { updated: false }
    }
    throw error
  }
  if (!existing) {
    return { updated: false }
  }

  if (existing.language === locale) {
    return { updated: false }
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { language: locale },
    })
  } catch (error) {
    if (isPrismaSchemaMismatchError(error)) {
      markPrismaColumnUnavailable(USER_TABLE_NAME, LANGUAGE_COLUMN)
      return { updated: false }
    }
    throw error
  }
  return { updated: true }
}
