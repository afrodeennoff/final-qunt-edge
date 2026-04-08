import { usePathname, useSearchParams } from 'next/navigation'

import { NAVIGATION_TIMEOUT_MS } from '@/lib/constants/sidebar'
import { useNavigationLoading } from '@/hooks/use-navigation-loading'
import type { PendingNavigation } from './types'

export const NAVIGATION_STALL_TIMEOUT_MS = NAVIGATION_TIMEOUT_MS
export const DEFAULT_OPEN_GROUPS = new Set(['Overview', 'Trading', 'Analytics', 'System'])

export function stripLocalePrefix(pathname: string) {
  if (!pathname) return '/'
  const withoutLocale = pathname.replace(/^\/[a-z]{2}(?:-[A-Za-z]{2})?(?=\/|$)/, '')
  return withoutLocale.length > 0
    ? withoutLocale.startsWith('/')
      ? withoutLocale
      : `/${withoutLocale}`
    : '/'
}

export function useActiveLink() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (href: string, exact = false) => {
    if (!pathname || !href) return false

    const normalizedPathname = stripLocalePrefix(pathname).replace(/\/$/, '') || '/'
    const [hrefPath, queryString] = href.split('?')
    const normalizedHrefPath = stripLocalePrefix(hrefPath).replace(/\/$/, '') || '/'

    const hrefParams = new URLSearchParams(queryString ?? '')
    const hrefTab = hrefParams.get('tab')

    // Handle tab-based navigation (e.g., /dashboard?tab=widgets)
    if (hrefTab) {
      const activeTab = searchParams.get('tab')
      // Only match if: (1) explicit tab matches, OR (2) no active tab and href tab is default 'widgets'
      if (normalizedPathname === normalizedHrefPath) {
        if (activeTab === hrefTab) {
          return true
        }
        // Default tab fallback: if no active tab and href tab is 'widgets'
        if (!activeTab && hrefTab === 'widgets' && normalizedHrefPath === '/dashboard') {
          return true
        }
      }
      // Tab-based hrefs should not fall through to exact/nested match
      return false
    }

    // Default tab handling for /dashboard (non-tab href with no tab param)
    if (normalizedHrefPath === '/dashboard' && !hrefTab) {
      const activeTab = searchParams.get('tab')
      if (normalizedPathname === '/dashboard' && (!activeTab || activeTab === 'widgets')) {
        return true
      }
    }

    // Exact match
    if (exact) {
      return normalizedPathname === normalizedHrefPath
    }

    // Nested routes
    if (normalizedPathname === normalizedHrefPath) return true
    if (normalizedPathname.startsWith(`${normalizedHrefPath}/`)) return true

    return false
  }
}