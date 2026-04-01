"use client"

import { useState, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

const loadingState = {
  isLoading: false,
  currentPath: "",
}

export function useNavigationLoading() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [lastRouteKey, setLastRouteKey] = useState(() => {
    // Initialise with whatever the browser currently shows so the first render
    // doesn't interpret a "route change" immediately.
    if (typeof window !== "undefined") {
      return `${window.location.pathname}${window.location.search}`
    }
    return pathname ?? "/"
  })

  useEffect(() => {
    const currentSearch = searchParams?.toString() ?? ""
    const currentRouteKey = currentSearch ? `${pathname}?${currentSearch}` : (pathname ?? "/")

    if (currentRouteKey !== lastRouteKey) {
      setIsLoading(false)
      setLastRouteKey(currentRouteKey)
    }
  }, [pathname, searchParams, lastRouteKey])

  const startLoading = () => setIsLoading(true)

  return {
    isLoading,
    startLoading,
  }
}

export function useNavigationListener() {
  useEffect(() => {
    const handleStart = () => {
      loadingState.isLoading = true
    }

    const handleComplete = () => {
      loadingState.isLoading = false
    }

    window.addEventListener("beforeunload", handleStart)
    window.addEventListener("load", handleComplete)

    return () => {
      window.removeEventListener("beforeunload", handleStart)
      window.removeEventListener("load", handleComplete)
    }
  }, [])

  return loadingState
}
