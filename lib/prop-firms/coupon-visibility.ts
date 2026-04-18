function padDateTimePart(value: number): string {
  return value.toString().padStart(2, '0')
}

export function buildPublicCouponWindowWhere(now: Date = new Date()) {
  return {
    AND: [
      {
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      },
      {
        OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
      },
    ],
  }
}

export function formatDateTimeLocalValue(value: Date | string | null | undefined): string {
  if (!value) return ''

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = padDateTimePart(date.getMonth() + 1)
  const day = padDateTimePart(date.getDate())
  const hours = padDateTimePart(date.getHours())
  const minutes = padDateTimePart(date.getMinutes())

  return `${year}-${month}-${day}T${hours}:${minutes}`
}
