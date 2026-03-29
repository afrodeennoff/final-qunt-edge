import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  getActiveDeals,
  createRouteClientMock,
} = vi.hoisted(() => ({
  getActiveDeals: vi.fn(),
  createRouteClientMock: vi.fn(),
}))

vi.mock("@/server/deals", () => ({
  getActiveDeals,
}))

vi.mock("@/lib/supabase/route-client", () => ({
  createRouteClient: createRouteClientMock,
}))

describe("/api/deals/active", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    createRouteClientMock.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
          error: null,
        }),
      },
    })
  })

  it("should return active deals with default sorting", async () => {
    const mockDeals = [
      {
        id: "1",
        firmId: "firm1",
        firmSlug: "test-firm",
        firmName: "Test Firm",
        logoUrl: null,
        category: "Futures",
        platform: "Tradovate",
        payoutModel: "Monthly",
        drawdownType: "Static",
        discountPercent: 20,
        couponCode: "TEST20",
        challengeFee: 100,
        expiryDate: "2026-12-31",
        claimUrl: null,
      },
    ]

    getActiveDeals.mockResolvedValue(mockDeals)

    // Mock request
    const request = new Request("http://localhost/api/deals/active")
    
    // Import the route handler
    const { GET } = await import("@/app/api/deals/route")
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.deals).toHaveLength(1)
    expect(data.deals[0]).toEqual(mockDeals[0])
    expect(data.pagination.total).toBe(1)
    expect(getActiveDeals).toHaveBeenCalled()
  })

  it("should filter deals by search term", async () => {
    const mockDeals = [
      {
        id: "1",
        firmId: "firm1",
        firmSlug: "test-firm",
        firmName: "Test Firm",
        logoUrl: null,
        category: "Futures",
        platform: "Tradovate",
        payoutModel: "Monthly",
        drawdownType: "Static",
        discountPercent: 20,
        couponCode: "TEST20",
        challengeFee: 100,
        expiryDate: "2026-12-31",
        claimUrl: null,
      },
      {
        id: "2",
        firmId: "firm2",
        firmSlug: "another-firm",
        firmName: "Another Firm",
        logoUrl: null,
        category: "Forex",
        platform: "Rithmic",
        payoutModel: "Bi-weekly",
        drawdownType: "Trailing",
        discountPercent: 15,
        couponCode: "ANOTHER15",
        challengeFee: 150,
        expiryDate: "2026-12-31",
        claimUrl: null,
      },
    ]

    getActiveDeals.mockResolvedValue(mockDeals)

    // Mock request with search parameter
    const request = new Request("http://localhost/api/deals/active?search=test")
    
    // Import the route handler
    const { GET } = await import("@/app/api/deals/route")
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.deals).toHaveLength(1)
    expect(data.deals[0].firmName).toBe("Test Firm")
  })

  it("should handle errors gracefully", async () => {
    getActiveDeals.mockRejectedValue(new Error("Database error"))

    // Mock request
    const request = new Request("http://localhost/api/deals/active")
    
    // Import the route handler
    const { GET } = await import("@/app/api/deals/route")
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe("Failed to fetch deals")
  })

  it("should return 401 when unauthenticated", async () => {
    createRouteClientMock.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error("Unauthorized"),
        }),
      },
    })

    const request = new Request("http://localhost/api/deals/active")
    const { GET } = await import("@/app/api/deals/route")

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe("UNAUTHORIZED")
    expect(getActiveDeals).not.toHaveBeenCalled()
  })
})
