import { NextResponse, connection } from "next/server"
import TraderStatsEmail from "@/components/emails/weekly-recap"
import MissingYouEmail from "@/components/emails/missing-data"
import { render } from "@react-email/render"
import { generateTradingAnalysis } from "./actions/analysis"
import { getUserData, computeTradingStats } from "./actions/user-data"
import { buildUnsubscribeUrl } from "@/lib/unsubscribe-url"
import { getSiteUrl } from "@/lib/site-url"
import { requireServiceAuth, toErrorResponse } from "@/server/authz"
import { z } from "zod"
import { rateLimit, createRateLimitResponse } from "@/lib/rate-limit"

const weeklySummaryRateLimit = rateLimit({ limit: 60, window: 60_000, identifier: "weekly-summary" })

const sanitizeErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  return "Unknown error"
}

const maskValue = (value?: string) => value ? `${value.slice(0, 8)}…` : 'unknown'

const userIdSchema = z.string().uuid()

export async function POST(req: Request, props: { params: Promise<{ userid: string }> }) {
  await connection()

  const params = await props.params;
  try {
    // SECURITY: Rate limit to prevent abuse
    const limitResult = await weeklySummaryRateLimit(req as unknown as Parameters<typeof weeklySummaryRateLimit>[0])
    if (!limitResult.success) {
      return createRateLimitResponse({
        limit: limitResult.limit,
        remaining: limitResult.remaining,
        resetTime: limitResult.resetTime,
      })
    }

    // Verify that this is a legitimate request with the correct secret
    requireServiceAuth(req.headers.get('authorization'), { serviceName: 'email-weekly-summary' })

    const userIdResult = userIdSchema.safeParse(params.userid)
    if (!userIdResult.success) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 })
    }

    // Get user data and compute stats
    const { user, newsletter, trades } = await getUserData(userIdResult.data)
    const stats = await computeTradingStats(trades, user.language)

    // If no trades, return missing you email data
    if (trades.length === 0) {
      const subscriberEmail = newsletter.email
      const unsubscribeUrl = buildUnsubscribeUrl(subscriberEmail, req)
      const siteUrl = getSiteUrl()
      const missingYouEmailHtml = await render(
        MissingYouEmail({
          firstName: newsletter.firstName || 'trader',
          email: subscriberEmail,
          language: user.language,
          unsubscribeUrl,
          siteUrl,
        })
      )

      return NextResponse.json({
        success: true,
        emailData: {
          from: 'Qunt Edge <newsletter@eu.updates.qunt-edge.vercel.app>',
          to: [subscriberEmail],
          subject: user.language === 'fr' ? 'Nous manquons de vous voir sur Qunt Edge' : 'We miss you on Qunt Edge',
          html: missingYouEmailHtml,
          headers: {
            'List-Unsubscribe': `<${unsubscribeUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
          reply_to: process.env.WEEKLY_SUMMARY_REPLY_TO ?? process.env.CONTACT_REPLY_TO ?? 'team@qunt-edge.com',
        }
      })
    }

    // Generate analysis using server action
    const analysis = await generateTradingAnalysis(
      stats.dailyPnL,
      user.language as 'fr' | 'en'
    )

    const subscriberEmail = newsletter.email
    const unsubscribeUrl = buildUnsubscribeUrl(subscriberEmail, req)
    const siteUrl = getSiteUrl()

    const weeklyStatsEmailHtml = await render(
      TraderStatsEmail({
        firstName: newsletter.firstName || 'trader',
        dailyPnL: stats.dailyPnL,
        winLossStats: stats.winLossStats,
        email: subscriberEmail,
        resultAnalysisIntro: analysis.resultAnalysisIntro,
        tipsForNextWeek: analysis.tipsForNextWeek,
        language: user.language,
        unsubscribeUrl,
        siteUrl,
      })
    )

    return NextResponse.json({
      success: true,
      emailData: {
        from: 'Qunt Edge <newsletter@eu.updates.qunt-edge.vercel.app>',
        to: [subscriberEmail],
        subject: user.language === 'fr' ? 'Vos statistiques de trading de la semaine 📈' : 'Your trading statistics for the week 📈',
        html: weeklyStatsEmailHtml,
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
        },
        reply_to: process.env.WEEKLY_SUMMARY_REPLY_TO ?? process.env.CONTACT_REPLY_TO ?? 'team@qunt-edge.com'
      }
    })

  } catch (error) {
    console.error({
      event: "weekly-summary.post-error",
      phase: "POST",
      userId: maskValue(params.userid),
      errorMessage: sanitizeErrorMessage(error),
    })
    return toErrorResponse(error)
  }
}
