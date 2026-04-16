import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  getUnifiedFirms,
  createRouteClientMock,
} = vi.hoisted(() => ({
  getUnifiedFirms: vi.fn(),
  createRouteClientMock: vi.fn(),
}))

vi.mock("@/server/deals", () => ({
  getUnifiedFirms,
}))

vi.mock("@/lib/supabase/route-client", () => ({
  createRouteClient: createRouteClientMock,
}))

vi.mock("next/server", async () => ({
  ...(await vi.importActual("next/server")),
  connection: vi.fn().mockResolvedValue(undefined),
}))

describe("/api/deals/unified", () => {
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

  it("should return unified firms with default sorting", async () => {
    const mockFirms = [
      {
        id: "1",
        slug: "test-firm",
        name: "Test Firm",
        description: "A test prop firm",
        shortDesc: "Test firm description",
        referralUrl: "https://example.com",
        logoUrl: null,
        category: "Futures",
        platform: "Tradovate",
        payoutModel: "Monthly",
        drawdownType: "Static",
        profitSplit: "80/20",
        maxAllocation: "$100K",
        challengeCount: 5,
        spotlight: null,
        catalogueStats: {
          accountsCount: 100,
          totalAccountValue: 5000000,
          paidPayoutAmount: 1000000,
          paidPayoutCount: 50,
          pendingPayoutAmount: 200000,
          sizeBreakdown: "5x25k + 3x100k",
        },
        _count: {
          reviews: 25,
          coupons: 3,
        },
        coupons: [
          {
            id: "coupon1",
            code: "TEST20",
            discountPercent: 20,
            challengeFee: 100,
            expiresAt: new Date("2026-12-31"),
            claimUrl: "https://example.com/checkout",
          },
        ],
      },
    ]

    getUnifiedFirms.mockResolvedValue(mockFirms)

    // Mock request
    const request = new NextRequest("http://localhost/api/deals/unified")
    
    // Import the route handler
    const { GET } = await import("@/app/api/deals/unified/route")
    
    const response = await GET(request, { params: Promise.resolve({}) })
    const data = await response.json()

     expect(response.status).toBe(200)
     expect(data.firms).toHaveLength(1)
     const expectedFirm = {
       ...mockFirms[0],
       coupons: [
         {
           ...mockFirms[0].coupons[0],
           expiresAt: mockFirms[0].coupons[0].expiresAt.toISOString()
         }
       ]
     }
     expect(data.firms[0]).toEqual(expectedFirm)
     expect(data.pagination.total).toBe(1)
     expect(getUnifiedFirms).toHaveBeenCalled()
  })

  it("should filter firms by search term", async () => {
    const mockFirms = [
      {
        id: "1",
        slug: "test-firm",
        name: "Test Firm",
        description: "A test prop firm",
        shortDesc: "Test firm description",
        referralUrl: "https://example.com",
        logoUrl: null,
        category: "Futures",
        platform: "Tradovate",
        payoutModel: "Monthly",
        drawdownType: "Static",
        profitSplit: "80/20",
        maxAllocation: "$100K",
        challengeCount: 5,
        spotlight: null,
        catalogueStats: {
          accountsCount: 100,
          totalAccountValue: 5000000,
          paidPayoutAmount: 1000000,
          paidPayoutCount: 50,
          pendingPayoutAmount: 200000,
          sizeBreakdown: "5x25k + 3x100k",
        },
        _count: {
          reviews: 25,
          coupons: 3,
        },
        coupons: [],
      },
      {
        id: "2",
        slug: "another-firm",
        name: "Another Firm",
        description: "Another test prop firm",
        shortDesc: "Another firm description",
        referralUrl: "https://example.com",
        logoUrl: null,
        category: "Forex",
        platform: "Rithmic",
        payoutModel: "Bi-weekly",
        drawdownType: "Trailing",
        profitSplit: "75/25",
        maxAllocation: "$50K",
        challengeCount: 3,
        spotlight: null,
        catalogueStats: {
          accountsCount: 50,
          totalAccountValue: 2500000,
          paidPayoutAmount: 500000,
          paidPayoutCount: 25,
          pendingPayoutAmount: 100000,
          sizeBreakdown: "2x25k + 1x50k",
        },
        _count: {
          reviews: 10,
          coupons: 2,
        },
        coupons: [],
      },
    ]

    getUnifiedFirms.mockResolvedValue(mockFirms)

    // Mock request with search parameter
    const request = new NextRequest("http://localhost/api/deals/unified?search=test")
    
    // Import the route handler
    const { GET } = await import("@/app/api/deals/unified/route")
    
    const response = await GET(request, { params: Promise.resolve({}) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.firms).toHaveLength(1)
    expect(data.firms[0].name).toBe("Test Firm")
  })

  it("should handle errors gracefully", async () => {
    getUnifiedFirms.mockRejectedValue(new Error("Database error"))

    // Mock request
    const request = new NextRequest("http://localhost/api/deals/unified")
    
    // Import the route handler
    const { GET } = await import("@/app/api/deals/unified/route")
    
    const response = await GET(request, { params: Promise.resolve({}) })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe("Failed to fetch firms")
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

    const request = new NextRequest("http://localhost/api/deals/unified")
    const { GET } = await import("@/app/api/deals/unified/route")

    const response = await GET(request, { params: Promise.resolve({}) })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe("UNAUTHORIZED")
    expect(getUnifiedFirms).not.toHaveBeenCalled()
  })
})
