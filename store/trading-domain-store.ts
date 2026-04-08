import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Account } from '@/prisma/generated/prisma'
import { Trade } from '@/lib/data-types'
import { StoreApi, UseBoundStore } from 'zustand'

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never

const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S,
) => {
  const store = _store as WithSelectors<typeof _store>
  store.use = {}
  for (const k of Object.keys(store.getState())) {
    ; (store.use as Record<string, unknown>)[k] = () => store((s) => s[k as keyof typeof s])
  }
  return store
}

interface TradingDomainState {
  trades: Trade[]
  accounts: Account[]
  setTrades: (trades: Trade[]) => void
  setAccounts: (accounts: Account[]) => void
  updateAccount: (accountNumber: string, updates: Partial<Account>) => void
  deleteAccount: (accountNumber: string) => void
  addAccount: (account: Account) => void
}

const tradingDomainStoreBase = create<TradingDomainState>()(
  persist(
    (set) => ({
      trades: [],
      accounts: [],
      setTrades: (trades) => set({ trades }),
      setAccounts: (accounts) => set({ accounts }),
      updateAccount: (accountNumber, updates) =>
        set((state) => ({
          accounts: state.accounts.map((account) =>
            account.number === accountNumber
              ? { ...account, ...updates }
              : account
          ),
        })),
      deleteAccount: (accountNumber) =>
        set((state) => ({
          accounts: state.accounts.filter(
            (account) => account.number !== accountNumber
          ),
        })),
      addAccount: (account) =>
        set((state) => ({
          accounts: [...state.accounts, account],
        })),
    }),
    {
      name: 'trading-domain-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        trades: state.trades,
        accounts: state.accounts,
      }),
    },
  ),
)

export const useTradingDomainStore = createSelectors(tradingDomainStoreBase)
