/**
 * Shared error classes and helpers.
 *
 * These live outside "use server" files because server modules may only
 * export async functions — exported classes or sync functions cause a
 * webpack build error in Next.js 16.
 */

import { isPrismaSchemaMismatchError } from '@/lib/prisma-guard'

export class PropFirmCouponAdminError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PropFirmCouponAdminError'
  }
}

/**
 * Checks whether an error is a Prisma data-unavailability or schema-mismatch error.
 * This is a simplified version for the non-server error helper module.
 * The server file has a more complete version for internal use.
 */
function isPropFirmDataUnavailableError(error: unknown): boolean {
  if (isPrismaSchemaMismatchError(error)) return true
  if (!error || typeof error !== 'object') return false
  const maybeError = error as { code?: string }
  return (
    maybeError.code === 'P1001' ||
    maybeError.code === 'ECONNREFUSED' ||
    maybeError.code === 'P2025'
  )
}

function toPropFirmCouponMutationError(error: unknown): Error {
  if (error instanceof PropFirmCouponAdminError) {
    return error
  }

  const maybeError = error as { code?: string }

  if (maybeError?.code === 'P2002') {
    return new PropFirmCouponAdminError(
      'This prop firm already has a coupon with that code.',
    )
  }

  if (maybeError?.code === 'P2003' || maybeError?.code === 'P2025') {
    return new PropFirmCouponAdminError(
      'The coupon or linked prop firm could not be found anymore.',
    )
  }

  if (isPrismaSchemaMismatchError(error)) {
    return new PropFirmCouponAdminError(
      'The coupon schema is missing in the current database.',
    )
  }

  if (isPropFirmDataUnavailableError(error)) {
    return new PropFirmCouponAdminError(
      'The coupon database is unavailable right now. Try again in a moment.',
    )
  }

  return error instanceof Error
    ? error
    : new PropFirmCouponAdminError('Unable to save coupon changes right now.')
}

export function getPropFirmCouponAdminErrorMessage(error: unknown): string {
  return toPropFirmCouponMutationError(error).message
}
