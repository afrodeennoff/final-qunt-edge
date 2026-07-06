import { create } from 'zustand'
import { SubscriptionWithPrice } from '@/server/billing'

export interface PlanLimitsResponse {
  plan: string | null
  accounts: { used: number; max: number | null }
  trades: { used: number; max: number | null }
  screenshots: { used: number; max: number | null }
  dataRetentionDays: number | null
  maxTeamMembers: number | null
  features: string[]
}

interface SubscriptionStore {
  subscription: SubscriptionWithPrice | null
  limits: PlanLimitsResponse | null
  isLoading: boolean
  error: string | null

  setSubscription: (subscription: SubscriptionWithPrice | null) => void
  setLimits: (limits: PlanLimitsResponse | null) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearSubscription: () => void
  refreshSubscription: () => Promise<void>
  refreshLimits: () => Promise<void>
}

export const useSubscriptionStore = create<SubscriptionStore>()((set) => ({
  subscription: null,
  limits: null,
  isLoading: true,
  error: null,

  setSubscription: (subscription) => set({
    subscription: subscription,
    error: null
  }),

  setLimits: (limits) => set({ limits }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearSubscription: () => set({
    subscription: null,
    limits: null,
    error: null
  }),

  refreshSubscription: async () => {
    try {
      set({ isLoading: true, error: null });
      const { getSubscriptionData } = await import('@/server/billing');
      const subscriptionData = await getSubscriptionData();
      set({
        subscription: subscriptionData,
        error: null
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to refresh subscription',
        subscription: null
      });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshLimits: async () => {
    try {
      const res = await fetch('/api/user/limits');
      if (!res.ok) throw new Error('Failed to fetch limits');
      const limits = await res.json();
      set({ limits });
    } catch {
      // silently fail — limits are non-critical
    }
  }
}))
