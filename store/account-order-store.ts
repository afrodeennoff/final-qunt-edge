import { create } from "zustand"

interface AccountOrder {
  accountNumber: string
  order: number
}

interface GroupAccountOrder {
  [groupId: string]: AccountOrder[]
}

interface AccountOrderStore {
  groupOrders: GroupAccountOrder
  setAccountOrder: (groupId: string, accountNumber: string, order: number) => void
  reorderAccounts: (groupId: string, accountNumbers: string[]) => void
  getOrderedAccounts: <T extends { number: string }>(groupId: string, accounts: T[]) => T[]
  removeAccount: (groupId: string, accountNumber: string) => void
  clearGroup: (groupId: string) => void
}

export const useAccountOrderStore = create<AccountOrderStore>()(
  (set, get) => ({
    groupOrders: {},

    setAccountOrder: (groupId, accountNumber, order) => {
      set((state) => {
        const groupOrders = { ...state.groupOrders }
        if (!groupOrders[groupId]) {
          groupOrders[groupId] = []
        }

        const existingIndex = groupOrders[groupId].findIndex(
          (item) => item.accountNumber === accountNumber
        )

        if (existingIndex >= 0) {
          groupOrders[groupId][existingIndex].order = order
        } else {
          groupOrders[groupId].push({ accountNumber, order })
        }

        groupOrders[groupId].sort((a, b) => a.order - b.order)

        return { groupOrders }
      })
    },

    reorderAccounts: (groupId, accountNumbers) => {
      set((state) => {
        const groupOrders = { ...state.groupOrders }
        groupOrders[groupId] = accountNumbers.map((accountNumber, index) => ({
          accountNumber,
          order: index
        }))

        return { groupOrders }
      })
    },

    getOrderedAccounts: <T extends { number: string }>(groupId: string, accounts: T[]) => {
      const state = get()
      const groupOrder = state.groupOrders[groupId] || []

      if (groupOrder.length === 0) {
        return accounts
      }

      const orderMap = new Map(
        groupOrder.map((item) => [item.accountNumber, item.order])
      )

      return [...accounts].sort((a, b) => {
        const orderA = orderMap.get(a.number) ?? Number.MAX_SAFE_INTEGER
        const orderB = orderMap.get(b.number) ?? Number.MAX_SAFE_INTEGER
        return orderA - orderB
      })
    },

    removeAccount: (groupId, accountNumber) => {
      set((state) => {
        const groupOrders = { ...state.groupOrders }
        if (groupOrders[groupId]) {
          groupOrders[groupId] = groupOrders[groupId].filter(
            (item) => item.accountNumber !== accountNumber
          )
        }
        return { groupOrders }
      })
    },

    clearGroup: (groupId) => {
      set((state) => {
        const groupOrders = { ...state.groupOrders }
        delete groupOrders[groupId]
        return { groupOrders }
      })
    }
  })
)
