import { usePathname } from 'next/navigation'

import { NAVIGATION_TIMEOUT_MS } from '@/lib/constants/sidebar'

export const NAVIGATION_STALL_TIMEOUT_MS = NAVIGATION_TIMEOUT_MS
export const DEFAULT_OPEN_GROUPS = new Set(['Workspace', 'Review', 'Tools'])

export function stripLocalePrefix(pathname: string) {
  if (!pathname) return '/'
  const withoutLocale = pathname.replace(/^\/[a-z]{2}(?:-[A-Za-z]{2})?(?=\/|$)/, '')
  return withoutLocale.length > 0
    ? withoutLocale.startsWith('/')
      ? withoutLocale
      : `/${withoutLocale}`
    : '/'
}

function matchesExactOrNested(normalizedPathname: string, normalizedHrefPath: string): boolean {
  if (normalizedPathname === normalizedHrefPath) return true
  if (normalizedPathname.startsWith(`${normalizedHrefPath}/`)) return true
  return false
}

export function useActiveLink() {
  const pathname = usePathname()

  return (href: string, exact = false) => {
    if (!pathname || !href) return false

    const normalizedPathname = stripLocalePrefix(pathname).replace(/\/$/, '') || '/'
    const [hrefPath] = href.split('?')
    const normalizedHrefPath = stripLocalePrefix(hrefPath).replace(/\/$/, '') || '/'

    if (exact) {
      return normalizedPathname === normalizedHrefPath
    }

    return matchesExactOrNested(normalizedPathname, normalizedHrefPath)
  }
}
