type PropFirmAdminPageStateInput = {
  hasConfiguredDatabaseConnection: boolean
  firmId: string | null
}

type PropFirmAdminPageState = {
  isFallbackRecord: boolean
  isReadOnly: boolean
  canManageFirm: boolean
  canManageReviews: boolean
  canManageCoupons: boolean
}

export function getPropFirmAdminPageState({
  hasConfiguredDatabaseConnection,
  firmId,
}: PropFirmAdminPageStateInput): PropFirmAdminPageState {
  const isFallbackRecord = typeof firmId === 'string' && firmId.startsWith('fallback-')
  const isReadOnly = !hasConfiguredDatabaseConnection || isFallbackRecord
  const canManage = !isReadOnly

  return {
    isFallbackRecord,
    isReadOnly,
    canManageFirm: canManage,
    canManageReviews: canManage,
    canManageCoupons: canManage,
  }
}
