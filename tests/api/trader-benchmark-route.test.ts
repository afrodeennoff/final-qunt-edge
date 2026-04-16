import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

const { getDatabaseUserId, findUnique } = vi.hoisted(() => ({
  getDatabaseUserId: vi.fn(),
  findUnique: vi.fn(),
}))

vi.mock("@/server/auth", () => ({
  getDatabaseUserId,
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    traderBenchmarkSnapshot: {
      findUnique,
      upsert: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}))

vi.mock("@/lib/api/with-api-route", () => ({
  withRateLimited: <T>(handler: (req: NextRequest, ctx: T) => Promise<Response>) => handler,
}))

import { GET } from "@/app/api/trader-profile/benchmark/route"

describe("/api/trader-profile/benchmark auth guard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 401 when auth resolution throws", async () => {
    getDatabaseUserId.mockRejectedValue(new Error("auth lookup failed"))

    const response = await GET(
      new NextRequest("http://localhost/api/trader-profile/benchmark"),
      { params: Promise.resolve({}) }
    )

    expect(response.status).toBe(401)
    expect(findUnique).not.toHaveBeenCalled()
  })
})
