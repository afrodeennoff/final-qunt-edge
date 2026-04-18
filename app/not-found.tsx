'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Home, Search } from 'lucide-react'
import { unifiedInsetPanelClassName } from '@/components/layout/unified-page-recipes'
import { Button } from '@/components/ui/button'
import { RouteStateShell } from '@/components/ui/route-state'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'

// Define translations locally to avoid I18nProvider dependency
const translations = {
  en: {
    title: '404 - Page Not Found',
    heading: 'Oops! Page not found',
    description: 'The page you\'re looking for doesn\'t exist or has been moved.',
    goHome: 'Go back home',
    goBack: 'Go back',
    searchPlaceholder: 'Search for a page...',
    searchComingSoon: 'Search functionality coming soon'
  },
  fr: {
    title: '404 - Page introuvable',
    heading: 'Oups ! Page introuvable',
    description: 'La page que vous recherchez n\'existe pas ou a été déplacée.',
    goHome: 'Retour à l\'accueil',
    goBack: 'Retourner',
    searchPlaceholder: 'Rechercher une page...',
    searchComingSoon: 'Fonctionnalité de recherche bientôt disponible'
  }
}

function getLocaleFromGeolocation(): 'en' | 'fr' {
  if (typeof window === 'undefined') return 'fr' // Default for SSR

  // Get country from cookie set by middleware
  const cookies = document.cookie.split(';')
  const countryCookie = cookies.find(cookie => cookie.trim().startsWith('user-country='))
  const country = countryCookie?.split('=')[1]?.trim()

  // Use French for France and French-speaking countries, English for others
  const frenchCountries = ['FR', 'CA', 'BE', 'CH', 'LU', 'MC']
  return frenchCountries.includes(country || '') ? 'fr' : 'en'
}


function detectLocaleFromBrowser(): 'en' | 'fr' {
  if (typeof window === 'undefined') return 'fr'

  // First try geolocation from middleware
  const geoLocale = getLocaleFromGeolocation()

  // If no country detected, fall back to browser language
  const cookies = document.cookie.split(';')
  const countryCookie = cookies.find(cookie => cookie.trim().startsWith('user-country='))

  if (!countryCookie) {
    const browserLang = navigator.language.toLowerCase()
    return browserLang.startsWith('en') ? 'en' : 'fr'
  }

  return geoLocale
}

function NotFoundContent() {
  const router = useRouter()
  const [locale, setLocale] = useState<'en' | 'fr'>('fr')
  const [isClient, setIsClient] = useState(false)
  const [allRoutes, setAllRoutes] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 150)
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const resultsRef = useRef<HTMLUListElement | null>(null)
  const blurTimeout = useRef<number | null>(null)

  useEffect(() => {
    setIsClient(true)
    const detectedLocale = detectLocaleFromBrowser()
    setLocale(detectedLocale)

    // Set page title
    document.title = 'Qunt Edge | ' + translations[detectedLocale].title

  }, [])

  // Fetch routes from public/routes.json (generated at build time)
  useEffect(() => {
    let cancelled = false
    async function loadRoutes() {
      try {
        setIsLoadingRoutes(true)
        const res = await fetch('/routes.json', { cache: 'no-cache' })
        if (!res.ok) return
        const json: string[] = await res.json()
        if (!cancelled) setAllRoutes(json)
      } catch {
        // ignore
      } finally {
        if (!cancelled) setIsLoadingRoutes(false)
      }
    }
    loadRoutes()
    return () => {
      cancelled = true
    }
  }, [])

  // Utilities for routes
  const isDynamic = (route: string) => /\[[^\]]+\]/.test(route)
  const localizeRoute = (route: string, loc: 'en' | 'fr') =>
    route.replace('/[locale]', `/${loc}`)

  const concreteRoutesForLocale = useMemo(() => {
    // Replace [locale] and drop remaining dynamics (e.g., [slug], catch-alls)
    const replaced = allRoutes
      .map(r => localizeRoute(r, locale))
      .filter(r => !isDynamic(r))
      // Also filter out obvious 404-related routes if present
      .filter(r => !/not-found/.test(r))
    return Array.from(new Set(replaced)).sort()
  }, [allRoutes, locale])

  const filteredRoutes = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()
    if (!q) {
      const suggestions = concreteRoutesForLocale
      if (selectedIndex >= suggestions.length) setSelectedIndex(0)
      return suggestions
    }
    // Lightweight fuzzy scoring: sequential character matching with bonuses
    const score = (target: string, queryStr: string): number => {
      if (target.startsWith(queryStr)) return 1000 + queryStr.length // big boost for prefix
      let tIdx = 0
      let qIdx = 0
      let contiguous = 0
      let total = 0
      const tLower = target.toLowerCase()
      while (tIdx < tLower.length && qIdx < queryStr.length) {
        if (tLower[tIdx] === queryStr[qIdx]) {
          // base match
          let add = 10
          // contiguous bonus
          if (tIdx === 0) add += 15
          if (tLower[tIdx - 1] === '/' || tLower[tIdx - 1] === '-') add += 8 // segment/word start
          contiguous += 1
          add += contiguous * 2
          total += add
          qIdx++
        } else {
          contiguous = 0
        }
        tIdx++
      }
      if (qIdx !== queryStr.length) return 0 // didn't match all chars in sequence
      // length penalty (shorter targets slightly preferred)
      total -= Math.max(0, tLower.length - queryStr.length) * 0.5
      return total
    }
    const scored = concreteRoutesForLocale.map(r => ({ r, s: score(r, q) }))
      .filter(o => o.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 50) // More results available, user can scroll
      .map(o => o.r)
    if (selectedIndex >= scored.length) setSelectedIndex(0)
    return scored
  }, [concreteRoutesForLocale, debouncedQuery, selectedIndex])

  const t = translations[locale]

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push(`/${locale}`)
    }
  }

  const displayLabel = (route: string) => {
    const stripped = route.replace(new RegExp(`^/${locale}`), '') || '/'
    return stripped === '' ? '/' : stripped
  }

  const handleSelectRoute = (route: string) => {
    setShowResults(false)
    setQuery('')
    router.push(route)
  }

  const onKeyDownSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filteredRoutes.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => (i + 1) % filteredRoutes.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => (i - 1 + filteredRoutes.length) % filteredRoutes.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const route = filteredRoutes[selectedIndex] || filteredRoutes[0]
      if (route) handleSelectRoute(route)
    } else if (e.key === 'Escape') {
      setShowResults(false)
    }
  }

  const onBlurSearch = () => {
    // Delay to allow click on results without instantly closing
    if (blurTimeout.current) window.clearTimeout(blurTimeout.current)
    blurTimeout.current = window.setTimeout(() => setShowResults(false), 100)
  }

  const primaryActions = (
    <>
      <Button asChild className="rounded-full px-5">
        <Link href={`/${locale}`}>
          <Home className="mr-2 h-4 w-4" />
          {t.goHome}
        </Link>
      </Button>
      <Button variant="outline" onClick={handleGoBack} className="rounded-full px-5">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t.goBack}
      </Button>
    </>
  )

  // Show fallback during hydration with French as default.
  if (!isClient) {
    return (
      <RouteStateShell
        eyebrow="Not found"
        title="Page introuvable"
        description="La page que vous recherchez n&apos;existe pas ou a ete deplacee."
        actions={
          <Button asChild className="rounded-full px-5">
            <Link href={`/${locale}`}>
              <Home className="mr-2 h-4 w-4" />
              Retour a l'accueil
            </Link>
          </Button>
        }
      >
        <div className="flex flex-col items-center gap-5">
          <div className="rounded-full border border-primary/16 bg-primary/10 px-6 py-2 text-4xl font-semibold tracking-[-0.06em] text-foreground shadow-[0_20px_40px_-28px_rgba(0,0,0,0.9)]">
            404
          </div>
        </div>
      </RouteStateShell>
    )
  }

  return (
    <RouteStateShell
      eyebrow="Not found"
      title={t.heading}
      description={t.description}
      actions={primaryActions}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="rounded-full border border-primary/16 bg-primary/10 px-6 py-2 text-4xl font-semibold tracking-[-0.06em] text-foreground shadow-[0_20px_40px_-28px_rgba(0,0,0,0.9)]">
          404
        </div>

        <div className="w-full max-w-xl">
          <div className="relative">
            <div className={cn(unifiedInsetPanelClassName, 'relative px-4 py-3')}>
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                aria-label={t.searchPlaceholder}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setShowResults(true)
                }}
                onKeyDown={onKeyDownSearch}
                onBlur={onBlurSearch}
                onFocus={() => setShowResults(true)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-transparent pl-8 pr-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden"
                autoComplete="off"
              />
            </div>

            {(() => {
              const shouldShow =
                showResults && (query.length > 0 || isLoadingRoutes || filteredRoutes.length > 0)

              return (
                <ul
                  ref={resultsRef}
                  role="listbox"
                  aria-hidden={!shouldShow}
                  style={{ maxHeight: '220px' }}
                  className={cn(
                    unifiedInsetPanelClassName,
                    'absolute z-10 mt-2 w-full origin-top overflow-y-auto overflow-x-hidden px-1 py-1 transition duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none',
                    shouldShow
                      ? 'pointer-events-auto scale-100 opacity-100'
                      : 'pointer-events-none scale-95 opacity-0',
                  )}
                >
                  {isLoadingRoutes && (
                    <li className="px-3 py-2 text-sm text-muted-foreground">Loading...</li>
                  )}
                  {!isLoadingRoutes && filteredRoutes.length === 0 && query.length > 0 && (
                    <li className="px-3 py-2 text-sm text-muted-foreground">No results</li>
                  )}
                  {!isLoadingRoutes &&
                    filteredRoutes.map((route, idx) => (
                      <li key={route} role="option" aria-selected={idx === selectedIndex}>
                        <Link
                          href={route}
                          onClick={() => {
                            setShowResults(false)
                            setQuery('Redirecting...')
                          }}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          onMouseDown={(e) => e.preventDefault()}
                          title={route}
                          className={cn(
                            'block rounded-[0.95rem] px-3 py-2 text-sm transition-[background-color,color,border-color] duration-200',
                            idx === selectedIndex
                              ? 'bg-primary/10 text-foreground'
                              : 'text-muted-foreground hover:bg-background/70 hover:text-foreground',
                          )}
                        >
                          {displayLabel(route)}
                        </Link>
                      </li>
                    ))}
                </ul>
              )
            })()}
          </div>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            {concreteRoutesForLocale.length > 0
              ? `${concreteRoutesForLocale.length} pages available`
              : t.searchComingSoon}
          </p>
        </div>
      </div>
    </RouteStateShell>
  )
}

export default function NotFound() {
  return <NotFoundContent />
}
