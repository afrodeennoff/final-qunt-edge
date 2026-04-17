export type CouponAdminSearchParamValue = string | string[] | undefined

export type CouponAdminStatus = 'created' | 'updated' | 'deleted' | 'error'

export type CouponAdminNotice = {
  variant: 'success' | 'destructive'
  title: string
  description: string
}

type CouponTimingInput = {
  isActive: boolean
  startsAt: Date | null
  expiresAt: Date | null
}

function readFirstSearchParam(value: CouponAdminSearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export function buildCouponAdminRedirectUrl(
  pathname: string,
  status: CouponAdminStatus,
  message?: string,
): string {
  const searchParams = new URLSearchParams({ couponStatus: status })

  if (message) {
    searchParams.set('couponMessage', message)
  }

  return `${pathname}?${searchParams.toString()}`
}

export function getCouponAdminNotice(
  searchParams: Record<string, CouponAdminSearchParamValue>,
): CouponAdminNotice | null {
  const status = readFirstSearchParam(searchParams.couponStatus)
  if (!status) return null

  const message = readFirstSearchParam(searchParams.couponMessage)

  switch (status) {
    case 'created':
      return {
        variant: 'success',
        title: 'Coupon created',
        description: message ?? 'The new coupon is saved and public deal caches have been refreshed.',
      }
    case 'updated':
      return {
        variant: 'success',
        title: 'Coupon updated',
        description: message ?? 'The coupon changes are live and the connected deal surfaces were refreshed.',
      }
    case 'deleted':
      return {
        variant: 'success',
        title: 'Coupon deleted',
        description: message ?? 'The coupon was removed and public deal caches were refreshed.',
      }
    case 'error':
      return {
        variant: 'destructive',
        title: 'Coupon action failed',
        description:
          message ??
          'The coupon change did not save. Check the values and try again.',
      }
    default:
      return null
  }
}

export function getCouponTimingState({ isActive, startsAt, expiresAt }: CouponTimingInput) {
  const now = Date.now()
  const startsAtTime = startsAt ? new Date(startsAt).getTime() : null
  const expiresAtTime = expiresAt ? new Date(expiresAt).getTime() : null

  const isScheduled = isActive && startsAtTime !== null && startsAtTime > now
  const isExpired = expiresAtTime !== null && expiresAtTime < now
  const isLive = isActive && !isScheduled && !isExpired
  const isExpiringSoon =
    isLive && expiresAtTime !== null && expiresAtTime <= now + 14 * 24 * 60 * 60 * 1000

  return {
    isScheduled,
    isExpired,
    isLive,
    isExpiringSoon,
  }
}

export function formatAdminDateTimeInput(value: Date | null): string {
  return value ? new Date(value).toISOString().slice(0, 16) : ''
}

export type FirmAdminStatus = 'saved' | 'deleted' | 'error'

export function getFirmAdminNotice(searchParams: Record<string, CouponAdminSearchParamValue>): CouponAdminNotice | null {
  const status = readFirstSearchParam(searchParams.firmStatus)
  if (!status) return null
  const message = readFirstSearchParam(searchParams.firmMessage)

  switch (status) {
    case 'saved':
      return { variant: 'success', title: 'Saved', description: message ?? 'Changes saved successfully.' }
    case 'deleted':
      return { variant: 'success', title: 'Firm deleted', description: message ?? 'The firm has been removed.' }
    case 'error':
      return { variant: 'destructive', title: 'Action failed', description: message ?? 'The firm change did not save.' }
    default:
      return null
  }
}
