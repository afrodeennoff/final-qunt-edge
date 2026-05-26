'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { useI18n } from '@/locales/client'
import { useDashboardActions } from '@/context/data-provider'

export interface DxFeedSyncAccount {
  id: string
  userId: string
  service: string
  accountId: string
  hasToken: boolean
  accountNumbers: string[]
  lastSyncedAt: Date
  tokenExpiresAt: Date | null
  dailySyncTime: Date | null
  createdAt: Date
  updatedAt: Date
}

interface DxFeedSyncContextType {
  performSyncForAccount: (
    accountId: string,
    options?: { skipToast?: boolean; skipRefresh?: boolean },
  ) => Promise<{ success: boolean; message: string; savedCount?: number } | undefined>
  performSyncForAllAccounts: (options?: { skipRefresh?: boolean }) => Promise<void>
  isAutoSyncing: boolean
  accounts: DxFeedSyncAccount[]
  loadAccounts: () => Promise<void>
  deleteAccount: (accountId: string) => Promise<void>
  syncInterval: number
  setSyncInterval: (interval: number) => void
  enableAutoSync: boolean
  setEnableAutoSync: (enabled: boolean) => void
}

type RawDxFeedSyncAccount = Omit<
  DxFeedSyncAccount,
  'lastSyncedAt' | 'tokenExpiresAt' | 'dailySyncTime' | 'createdAt' | 'updatedAt'
> & {
  lastSyncedAt?: string | Date | null
  tokenExpiresAt?: string | Date | null
  dailySyncTime?: string | Date | null
  createdAt?: string | Date | null
  updatedAt?: string | Date | null
}

interface DxFeedSyncApiPayload {
  success?: boolean
  data?: RawDxFeedSyncAccount[]
  message?: string
  savedCount?: number
  tradesCount?: number
}

const DxFeedSyncContext = createContext<DxFeedSyncContextType | undefined>(undefined)

function normalizeDate(value: string | Date | null | undefined, fallback: Date): Date {
  if (!value) return fallback
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? fallback : date
}

function normalizeSynchronization(sync: RawDxFeedSyncAccount): DxFeedSyncAccount {
  return {
    ...sync,
    accountNumbers: Array.isArray(sync.accountNumbers) ? sync.accountNumbers : [],
    hasToken: Boolean(sync.hasToken),
    lastSyncedAt: normalizeDate(sync.lastSyncedAt, new Date(0)),
    tokenExpiresAt: sync.tokenExpiresAt ? normalizeDate(sync.tokenExpiresAt, new Date(0)) : null,
    dailySyncTime: sync.dailySyncTime ? normalizeDate(sync.dailySyncTime, new Date(0)) : null,
    createdAt: normalizeDate(sync.createdAt, new Date()),
    updatedAt: normalizeDate(sync.updatedAt, new Date()),
  }
}

export function DxFeedSyncContextProvider({ children }: { children: React.ReactNode }) {
  const [isAutoSyncing, setIsAutoSyncing] = useState(false)
  const isAutoSyncingRef = useRef(false)
  const [accounts, setAccounts] = useState<DxFeedSyncAccount[]>([])
  const [syncInterval, setSyncInterval] = useState(15)
  const [enableAutoSync, setEnableAutoSync] = useState(false)
  const pathname = usePathname()
  const isSyncRouteActive = pathname?.includes('/dashboard/import') ?? false

  const t = useI18n()
  const { refreshAllData } = useDashboardActions()

  const loadAccounts = useCallback(async () => {
    try {
      const response = await fetch('/api/dxfeed/synchronizations', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.status === 401) {
        setAccounts([])
        return
      }

      const result = (await response.json()) as DxFeedSyncApiPayload
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch DxFeed synchronizations')
      }

      setAccounts((result.data || []).map(normalizeSynchronization))
    } catch (error) {

    }
  }, [])

  const deleteAccount = useCallback(
    async (accountId: string) => {
      const previousAccounts = accounts
      setAccounts((prev) => prev.filter((acc) => acc.accountId !== accountId))

      const response = await fetch('/api/dxfeed/synchronizations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      })

      const payload = (await response.json().catch(() => null)) as DxFeedSyncApiPayload | null
      if (!response.ok || !payload?.success) {
        setAccounts(previousAccounts)
        throw new Error(payload?.message || `Failed to delete synchronization (${response.status})`)
      }
    },
    [accounts],
  )

  const performSyncForAccount = useCallback(
    async (
      accountId: string,
      options?: { skipToast?: boolean; skipRefresh?: boolean },
    ) => {
      const account = accounts.find((acc) => acc.accountId === accountId)
      if (!account) return { success: false, message: `Account ${accountId} not found` }
      if (!account.hasToken) return { success: false, message: `Token for account ${accountId} is missing` }

      const runSync = async () => {
        const response = await fetch('/api/dxfeed/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountId }),
        })
        const payload = (await response.json()) as DxFeedSyncApiPayload

        if (payload?.message === 'DUPLICATE_TRADES') {
          return {
            success: true,
            message: t('dxfeedSync.multiAccount.alreadyImportedTrades'),
            savedCount: 0,
          }
        }

        if (!response.ok || !payload?.success) {
          throw new Error(payload?.message || `Sync error for account ${accountId}`)
        }

        const savedCount = payload.savedCount || 0
        const tradesCount = payload.tradesCount || 0
        let message: string

        if (savedCount > 0) {
          message = t('dxfeedSync.multiAccount.syncCompleteForAccount', {
            savedCount,
            tradesCount,
            accountId,
          })
        } else if (tradesCount > 0) {
          message = t('dxfeedSync.multiAccount.syncCompleteNoNewTradesForAccount', {
            tradesCount,
            accountId,
          })
        } else {
          message = t('dxfeedSync.multiAccount.syncCompleteNoOrdersForAccount', {
            accountId,
          })
        }

        await loadAccounts()
        if (!options?.skipRefresh) {
          await refreshAllData({ force: true })
        }

        return { success: true, message, savedCount }
      }

      try {
        if (options?.skipToast) return runSync()

        const promise = runSync()
        toast.promise(promise, {
          loading: t('dxfeedSync.sync.inProgress', { accountId }),
          success: (result) => result.message,
          error: (error) =>
            t('dxfeedSync.sync.syncFailed', {
              error: error instanceof Error ? error.message : t('dxfeedSync.sync.unknownError'),
            }),
        })

        return await promise
      } catch (error) {
        const message = `Sync error for account ${accountId}: ${
          error instanceof Error ? error.message : t('dxfeedSync.sync.unknownError')
        }`

        return { success: false, message }
      }
    },
    [accounts, loadAccounts, refreshAllData, t],
  )

  const performSyncForAllAccounts = useCallback(
    async (options?: { skipRefresh?: boolean }) => {
      if (isAutoSyncingRef.current) return

      isAutoSyncingRef.current = true
      setIsAutoSyncing(true)
      const toastId = toast.loading(t('dxfeedSync.multiAccount.syncAll'))

      try {
        const validAccounts = accounts.filter((acc) => acc.hasToken)
        let totalNewTrades = 0
        let successCount = 0

        for (const account of validAccounts) {
          const result = await performSyncForAccount(account.accountId, {
            skipToast: true,
            skipRefresh: true,
          })

          if (result?.success) {
            successCount += 1
            totalNewTrades += 'savedCount' in result ? result.savedCount || 0 : 0
          }
        }

        if (!options?.skipRefresh) {
          await refreshAllData({ force: true })
        }

        toast.success(
          totalNewTrades > 0
            ? t('dxfeedSync.multiAccount.syncCompleteForAccount', {
              savedCount: totalNewTrades,
              tradesCount: totalNewTrades,
              accountId: `${successCount} accounts`,
            })
            : t('dxfeedSync.multiAccount.accountsReloaded'),
          { id: toastId },
        )
      } catch (error) {

        toast.error(t('dxfeedSync.sync.unknownError'), { id: toastId })
      } finally {
        isAutoSyncingRef.current = false
        setIsAutoSyncing(false)
      }
    },
    [accounts, performSyncForAccount, refreshAllData, t],
  )

  const checkAndPerformSyncs = useCallback(async () => {
    if (!isSyncRouteActive || !enableAutoSync || isAutoSyncingRef.current) return

    try {
      const now = Date.now()
      for (const account of accounts) {
        if (!account.hasToken) continue
        const minutesSinceLastSync = (now - account.lastSyncedAt.getTime()) / (1000 * 60)
        if (minutesSinceLastSync >= syncInterval) {
          await performSyncForAccount(account.accountId)
        }
      }
    } catch (error) {

    }
  }, [accounts, enableAutoSync, isSyncRouteActive, performSyncForAccount, syncInterval])

  useEffect(() => {
    if (!isSyncRouteActive || !enableAutoSync) return

    const intervalId = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return
      void checkAndPerformSyncs()
    }, 5 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [checkAndPerformSyncs, enableAutoSync, isSyncRouteActive])

  useEffect(() => {
    if (!isSyncRouteActive) return
    void loadAccounts()
  }, [isSyncRouteActive, loadAccounts])

  return (
    <DxFeedSyncContext.Provider
      value={{
        performSyncForAccount,
        performSyncForAllAccounts,
        isAutoSyncing,
        accounts,
        loadAccounts,
        deleteAccount,
        syncInterval,
        setSyncInterval,
        enableAutoSync,
        setEnableAutoSync,
      }}
    >
      {children}
    </DxFeedSyncContext.Provider>
  )
}

export function useDxFeedSyncContext() {
  const context = useContext(DxFeedSyncContext)
  if (!context) {
    throw new Error('useDxFeedSyncContext must be used within a DxFeedSyncContextProvider')
  }
  return context
}
