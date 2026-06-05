/** Paths that live outside app/[locale] and must not receive a locale prefix. */
export function shouldSkipLocalePrefix(pathname: string): boolean {
  const pathOnly = pathname.split('?')[0]?.split('#')[0] ?? pathname
  return pathOnly === '/oauth' || pathOnly.startsWith('/oauth/')
}