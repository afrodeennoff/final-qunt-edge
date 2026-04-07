import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TradovateAccount {
  id: number
  name: string
  nickname: string
  accountType: string
  active: boolean
  clearingHouse: string
  riskCategoryId: number
  autoLiqProfileId: number
  marginCalculationType: string
  legalStatus: string
  nickname2?: string
}

type TradovateEnvironment = 'demo' | 'live'

interface TradovateState {
  isAuthenticated: boolean
  oauthState?: string
  accounts?: TradovateAccount[]
  lastSync?: string
  environment: TradovateEnvironment
}

interface TradovateSyncStore extends TradovateState {
  setAuthenticated: (authenticated: boolean) => void
  setOAuthState: (state: string) => void
  clearOAuthState: () => void
  setAccounts: (accounts: TradovateAccount[]) => void
  updateLastSync: () => void
  clearAll: () => void
  setEnvironment: (environment: TradovateEnvironment) => void
  getApiBaseUrl: () => string
}

export const useTradovateSyncStore = create<TradovateSyncStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      oauthState: undefined,
      accounts: undefined,
      lastSync: undefined,
      environment: 'demo',

      setAuthenticated: (authenticated: boolean) => {
        set({ isAuthenticated: authenticated })
      },

      setOAuthState: (oauthState: string) => {
        set({ oauthState })
      },

      clearOAuthState: () => {
        set({ oauthState: undefined })
      },

      setAccounts: (accounts: TradovateAccount[]) => {
        set({ accounts })
      },

      updateLastSync: () => {
        set({ lastSync: new Date().toISOString() })
      },

      clearAll: () => {
        set({
          isAuthenticated: false,
          oauthState: undefined,
          accounts: undefined,
          lastSync: undefined,
        })
      },

      setEnvironment: (environment: TradovateEnvironment) => {
        set({
          environment,
          isAuthenticated: false,
          accounts: undefined,
          lastSync: undefined,
          oauthState: undefined,
        })
      },

      getApiBaseUrl: () => {
        const state = get()
        return state.environment === 'demo'
          ? 'https://demo.tradovateapi.com'
          : 'https://live.tradovateapi.com'
      },
    }),
    {
      name: 'tradovate-sync-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          void state
        }
        // Clear legacy sessionStorage tokens from previous implementation
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('tradovate_access_token')
          sessionStorage.removeItem('tradovate_token_expiration')
          sessionStorage.removeItem('tradovate_environment')
        }
      },
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accounts: state.accounts,
        lastSync: state.lastSync,
        environment: state.environment,
        oauthState: state.oauthState,
      }),
    }
  )
)
