import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import {
  getRithmicSynchronizations,
  setRithmicSynchronization,
  removeRithmicSynchronization,
} from "@/app/[locale]/dashboard/components/import/rithmic/sync/actions"
import { createRouteClient } from "@/lib/supabase/route-client"
import { rateLimit } from "@/lib/rate-limit"
import { parseJson, toValidationErrorResponse } from "@/app/api/_utils/validate"

const rlCheck = rateLimit({ interval: 60, limit: 30 })

const synchronizationSchema = z.object({
  accountId: z.string().min(1),
}).strict()

const deleteSchema = z.object({
  accountId: z.string().min(1, "accountId is required"),
})

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

  const rateLimitResult = await rlCheck(request)
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: { code: "RATE_LIMITED", message: "Too many requests" } }, { status: 429 })
  }

  try {
    const synchronizations = await getRithmicSynchronizations()
    return NextResponse.json({ success: true, data: synchronizations })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to fetch synchronizations" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  const user = await getUser(request)
  if (!user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 })
  }

  try {
    const body = await parseJson(request, synchronizationSchema)
    await setRithmicSynchronization({ ...body, service: "rithmic" })
    return NextResponse.json({ success: true, message: "Synchronization updated successfully" })
  } catch (error) {
    const parsed = toValidationErrorResponse(error)
    if (parsed) return parsed
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Failed to update synchronization" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getUser(request)
  if (!user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 })
  }

  try {
    const { accountId } = await parseJson(request, deleteSchema)
    const result = await removeRithmicSynchronization(accountId)
    const deletedCount = typeof result === "object" && result !== null ? (result as { deletedCount?: number }).deletedCount : undefined

    if (deletedCount === 0) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Synchronization not found" } },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, message: "Synchronization removed successfully" })
  } catch (error) {
    const parsed = toValidationErrorResponse(error)
    if (parsed) return parsed
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Failed to delete synchronization" }, { status: 500 })
  }
}
