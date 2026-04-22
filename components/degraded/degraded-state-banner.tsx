"use client"

import { useEffect, useState } from "react"

interface ServiceStatus {
  service: string
  status: "healthy" | "degraded" | "down"
}

export function DegradedStateBanner() {
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch("/api/ready")
        const data = await res.json()
        if (!res.ok) {
          setVisible(true)
          return
        }
        const degraded = (data.checks || []).filter(
          (c: ServiceStatus) => c.status === "degraded" || c.status === "down"
        )
        setServices(degraded)
        setVisible(degraded.length > 0)
      } catch {
        // Network error — likely offline
        setVisible(false)
      }
    }
    checkHealth()
    const interval = setInterval(checkHealth, 60_000)
    return () => clearInterval(interval)
  }, [])

  if (!visible || services.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border border-[hsl(var(--primary)/0.12)] bg-primary/[0.05] px-4 py-3 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">Some services are experiencing issues</p>
      <ul className="mt-1 space-y-0.5">
        {services.map((s) => (
          <li key={s.service} className="flex items-center gap-2">
            <span className={s.status === "down" ? "text-destructive" : "text-[oklch(0.75_0.15_85)]"}>●</span>
            <span>{s.service}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
