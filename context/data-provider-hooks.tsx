import { useContext } from 'react'
import {
  DataContext,
  DashboardDataStateContext,
  DashboardUiStateContext,
  DashboardTradesListContext,
  DashboardAccountsListContext,
  DashboardFiltersContext,
  DashboardDerivedContext,
  DashboardActionsContext,
} from './data-provider'

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export function useDashboardTrades() {
  const context = useContext(DashboardDataStateContext)
  if (!context) {
    throw new Error('useDashboardTrades must be used within a DataProvider')
  }
  return context
}

export function useDashboardIsMobile() {
  const context = useContext(DashboardUiStateContext)
  if (!context) {
    throw new Error('useDashboardIsMobile must be used within a DataProvider')
  }
  return context.isMobile
}

export function useDashboardIsLoading() {
  const context = useContext(DashboardUiStateContext)
  if (!context) {
    throw new Error('useDashboardIsLoading must be used within a DataProvider')
  }
  return context.isLoading
}

export function useDashboardIsRevalidating() {
  const context = useContext(DashboardUiStateContext)
  if (!context) {
    throw new Error('useDashboardIsRevalidating must be used within a DataProvider')
  }
  return context.isRevalidating
}

export function useDashboardIsSharedView() {
  const context = useContext(DashboardUiStateContext)
  if (!context) {
    throw new Error('useDashboardIsSharedView must be used within a DataProvider')
  }
  return context.isSharedView
}

export function useDashboardRefreshError() {
  const context = useContext(DashboardUiStateContext)
  if (!context) {
    throw new Error('useDashboardRefreshError must be used within a DataProvider')
  }
  return context.refreshError
}

export function useDashboardTradeItems() {
  const context = useContext(DashboardTradesListContext)
  if (!context) {
    throw new Error('useDashboardTradeItems must be used within a DataProvider')
  }
  return context
}

export function useDashboardAccountsList() {
  const context = useContext(DashboardAccountsListContext)
  if (!context) {
    throw new Error('useDashboardAccountsList must be used within a DataProvider')
  }
  return context
}

export function useDashboardFilters() {
  const context = useContext(DashboardFiltersContext)
  if (!context) {
    throw new Error('useDashboardFilters must be used within a DataProvider')
  }
  return context
}

export function useDashboardStats() {
  const context = useContext(DashboardDerivedContext)
  if (!context) {
    throw new Error('useDashboardStats must be used within a DataProvider')
  }
  return context
}

export function useDashboardActions() {
  const context = useContext(DashboardActionsContext)
  if (!context) {
    throw new Error('useDashboardActions must be used within a DataProvider')
  }
  return context
}
