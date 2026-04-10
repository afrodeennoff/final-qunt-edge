import { usePathname, useSearchParams } from 'next/navigation'

import { NAVIGATION_TIMEOUT_MS } from '@/lib/constants/sidebar'

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

function getHrefTab(href: string): string | null {
  const queryString = href.split('?')[1] ?? ''
  return new URLSearchParams(queryString).get('tab')
}

function matchesTabHref(
  normalizedPathname: string,
  normalizedHrefPath: string,
  hrefTab: string,
  searchParams: ReturnType<typeof useSearchParams>
): boolean {
  if (normalizedPathname !== normalizedHrefPath) return false
  const activeTab = searchParams.get('tab')
  if (activeTab === hrefTab) return true
  if (!activeTab && hrefTab === 'widgets' && normalizedHrefPath === '/dashboard') return true
  return false
}

function matchesDefaultDashboard(
  normalizedPathname: string,
  searchParams: ReturnType<typeof useSearchParams>
): boolean {
  if (normalizedPathname !== '/dashboard') return false
  const activeTab = searchParams.get('tab')
  return !activeTab || activeTab === 'widgets'
}

function matchesExactOrNested(normalizedPathname: string, normalizedHrefPath: string): boolean {
  if (normalizedPathname === normalizedHrefPath) return true
  if (normalizedPathname.startsWith(`${normalizedHrefPath}/`)) return true
  return false
}

export function useActiveLink() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (href: string, exact = false) => {
    if (!pathname || !href) return false

    const normalizedPathname = stripLocalePrefix(pathname).replace(/\/$/, '') || '/'
    const [hrefPath] = href.split('?')
    const normalizedHrefPath = stripLocalePrefix(hrefPath).replace(/\/$/, '') || '/'
    const hrefTab = getHrefTab(href)

    if (hrefTab) {
      return matchesTabHref(normalizedPathname, normalizedHrefPath, hrefTab, searchParams)
    }

    if (normalizedHrefPath === '/dashboard') {
      return matchesDefaultDashboard(normalizedPathname, searchParams)
    }

    if (exact) {
      return normalizedPathname === normalizedHrefPath
    }

    return matchesExactOrNested(normalizedPathname, normalizedHrefPath)
  }
}
