'use client'

import { useI18n } from '@/locales/client'
import { DxFeedCredentialsManager } from './dxfeed-credentials-manager'

export function DxFeedSync() {
  const t = useI18n()

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{t('dxfeedSync.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('dxfeedSync.description')}</p>
      </div>
      <DxFeedCredentialsManager />
    </div>
  )
}
