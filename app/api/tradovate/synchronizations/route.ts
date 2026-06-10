import { NextRequest, NextResponse } from "next/server"
import {
  getTradovateSynchronizations,
  removeTradovateToken,
} from "@/app/[locale]/dashboard/components/import/tradovate/sync/actions"
import { createRouteClient } from "@/lib/supabase/route-client"

async function getUser(req: NextRequest) {
  const supabase = createRouteClient(req)
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) return null
  return data.user
}

export async function GET(request: NextRequest) {
  const user = await getUser(request)
  if (!user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 })
  }

  try {
    const result = await getTradovateSynchronizations()
    if (result.error) {
      return NextResponse.json({ success: false, message: result.error }, { status: 400 })
    }
    return NextResponse.json({ success: true, data: result.synchronizations || [] })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch Tradovate synchronizations" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getUser(request)
  if (!user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 })
  }

  try {
    const body = await request.json()
    const accountId = body?.accountId as string | undefined

    if (!accountId) {
      return NextResponse.json({ error: { code: "VALIDATION_FAILED", message: "accountId is required" } }, { status: 400 })
    }

    const result = await removeTradovateToken(accountId)
    const deletedCount = typeof result === "object" && result !== null ? (result as { deletedCount?: number }).deletedCount : undefined

    if (deletedCount === 0) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Synchronization not found" } },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, message: "Synchronization removed" })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete synchronization" },
      { status: 500 },
    )
  }
}
