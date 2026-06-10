import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import {
  getTradovateToken,
  getTradovateTrades,
} from "@/app/[locale]/dashboard/components/import/tradovate/sync/actions"
import { createRouteClient } from "@/lib/supabase/route-client"
import { rateLimit } from "@/lib/rate-limit"
import { parseJson } from "@/app/api/_utils/validate"

const rlCheck = rateLimit({ interval: 60, limit: 30 })

const syncSchema = z.object({
  accountId: z.string().min(1, "accountId is required"),
})

export async function POST(request: NextRequest) {
  const supabase = createRouteClient(request)
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 })
  }

  const rlResult = await rlCheck(request)
  if (!rlResult.success) {
    return NextResponse.json({ error: { code: "RATE_LIMITED", message: "Too many requests" } }, { status: 429 })
  }

  try {
    const { accountId } = await parseJson(request, syncSchema)

    const tokenResult = await getTradovateToken(accountId)
    if (tokenResult.error || !tokenResult.accessToken) {
      return NextResponse.json(
        { success: false, message: tokenResult.error || "Missing Tradovate access token" },
        { status: 400 },
      )
    }

    const syncResult = await getTradovateTrades(tokenResult.accessToken, {
      includedFeeTypes: tokenResult.includedFeeTypes,
    })
    if (syncResult.error) {
      return NextResponse.json({ success: false, message: syncResult.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      savedCount: syncResult.savedCount ?? 0,
      ordersCount: syncResult.ordersCount ?? 0,
      message: "Sync completed",
    })
  } catch (error) {
    console.error("Error performing Tradovate sync:", error)
    return NextResponse.json({ success: false, message: "Failed to perform Tradovate sync" }, { status: 500 })
  }
}
