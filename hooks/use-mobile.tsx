import { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const mobileQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)
    const checkMobile = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile(e.matches)

    // Set initial value
    checkMobile(mobileQuery)

    // Listen for changes
    mobileQuery.addEventListener("change", checkMobile)
    return () => mobileQuery.removeEventListener("change", checkMobile)
  }, [])

  // Return false during SSR/hydration to avoid mismatch
  return isMobile ?? false
}