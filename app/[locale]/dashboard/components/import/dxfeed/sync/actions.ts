'use server'

import {
  authenticateDxFeed as authenticateDxFeedInternal,
  updateDxFeedDailySyncTimeAction as updateDxFeedDailySyncTimeActionInternal,
} from '@/server/imports/dxfeed-actions'

export async function authenticateDxFeed(login: string, password: string) {
  return authenticateDxFeedInternal(login, password)
}

export async function updateDxFeedDailySyncTimeAction(
  accountId: string,
  syncTime: string | null,
) {
  return updateDxFeedDailySyncTimeActionInternal(accountId, syncTime)
}
