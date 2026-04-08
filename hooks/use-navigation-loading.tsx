"use client"

import { useState, useEffect, useRef } from "react"
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
  const listenerStateRef = useRef({
    isLoading: false,
    currentPath: "",
  })

  useEffect(() => {
    const handleStart = () => {
      listenerStateRef.current.isLoading = true
    }

    const handleComplete = () => {
      listenerStateRef.current.isLoading = false
    }

    window.addEventListener("beforeunload", handleStart)
    window.addEventListener("load", handleComplete)

    return () => {
      window.removeEventListener("beforeunload", handleStart)
      window.removeEventListener("load", handleComplete)
    }
  }, [])

  return {
    get isLoading() { return listenerStateRef.current.isLoading },
    get currentPath() { return listenerStateRef.current.currentPath },
  }
}