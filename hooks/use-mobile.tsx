import { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 767

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const mobileQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    const checkMobile = (e: MediaQueryListEvent | MediaQueryList) => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => setIsMobile(e.matches), 100)
    }

    // Set initial value
    checkMobile(mobileQuery)

    // Listen for changes
    mobileQuery.addEventListener("change", checkMobile)
    return () => {
      mobileQuery.removeEventListener("change", checkMobile)
      if (debounceTimer) clearTimeout(debounceTimer)
    }
  }, [])

  // Return false during SSR/hydration to avoid mismatch
  return isMobile ?? false
}