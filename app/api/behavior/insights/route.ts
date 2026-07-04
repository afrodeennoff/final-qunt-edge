import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError } from "@/lib/api-response"
import { getDatabaseUserId } from "@/server/auth"
import { computeBehaviorInsights } from "@/lib/behavior-insights"
import { getOrLoad, CachePolicies, buildCacheKey } from "@/lib/cache/cache-service"
import { withRateLimited } from "@/lib/api/with-api-route"

function sanitizePeriodDays(value: string | null): number {
  if (!value) return 30
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 30
  return Math.min(180, Math.max(7, Math.floor(parsed)))
}

function isPrerenderInterruption(error: unknown): boolean {
  if (!error || typeof error !== "object") return false

  const digest = "digest" in error ? String((error as { digest?: unknown }).digest ?? "") : ""
  const message = "message" in error ? String((error as { message?: unknown }).message ?? "") : ""

  return (
    digest === "HANGING_PROMISE_REJECTION" ||
    digest === "NEXT_PRERENDER_INTERRUPTED" ||
    message.includes("During prerendering, `cookies()` rejects")
  )
}

async function handleGet(request: NextRequest, _ctx: { params: Promise<Record<string, string>> }) {
  const requestId = crypto.randomUUID()
  try {
    const userId = await getDatabaseUserId()
    if (!userId) {
      return apiError("UNAUTHORIZED", "Unauthorized", 401)
    }

    const periodDays = sanitizePeriodDays(request.nextUrl.searchParams.get("periodDays"))
    const cacheKey = buildCacheKey("behavior", "insights", `user:${userId}:period:${periodDays}`)

    const insights = await getOrLoad(
      cacheKey,
      async () => {
        const fromDate = new Date()
        fromDate.setDate(fromDate.getDate() - periodDays)

        const [trades, moods] = await Promise.all([
          prisma.trade.findMany({
            where: {
              userId,
              entryDate: { gte: fromDate.toISOString() },
            },
            orderBy: { entryDate: "asc" },
            select: {
              entryDate: true,
              pnl: true,
              commission: true,
              quantity: true,
              comment: true,
              tags: true,
            },
          }),
          prisma.mood.findMany({
            where: {
              userId,
              day: { gte: fromDate },
            },
            orderBy: { day: "asc" },
            select: {
              day: true,
              emotionValue: true,
            },
          }),
        ])

        return computeBehaviorInsights(trades, moods, periodDays)
      },
      CachePolicies.privateSummary(60),
      "behavior-insights"
    )

    const insightsResponse = NextResponse.json(insights)
    insightsResponse.headers.set('Cache-Control', 'private, max-age=30')
    return insightsResponse
  } catch (error) {
    if (isPrerenderInterruption(error)) {
      return NextResponse.json(null)
    }

    console.error("[Behavior Insights API] Failed to build insights", error)
    return apiError("INTERNAL_ERROR", "Failed to build behavior insights", 500, { requestId })
  }
}

export const GET = withRateLimited(handleGet, {
  rateLimitId: "behavior-insights",
  rateLimitMax: 60,
  routeName: "behavior/insights",
})
