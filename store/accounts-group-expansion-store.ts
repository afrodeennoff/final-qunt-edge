"use client"

import { create } from "zustand"
import type { ExpandedState } from "@tanstack/react-table"

interface AccountsGroupExpansionStore {
  expanded: ExpandedState
  setExpanded: (expanded: ExpandedState) => void
  resetExpanded: () => void
}

export const useAccountsGroupExpansionStore =
  create<AccountsGroupExpansionStore>()(
    (set) => ({
      expanded: {},
      setExpanded: (expanded) => set({ expanded }),
      resetExpanded: () => set({ expanded: {} }),
    })
  )
