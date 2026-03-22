import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  getDealsOverview,
} = vi.hoisted(() => ({
  getDealsOverview: vi.fn(),
}))

vi.mock("@/server/deals", () => ({
  getDealsOverview,
}))

describe("/api/deals/overview", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("should return deals overview", async () => {
    const mockOverview = {
      totalTrackedFirms: 50,
      totalLiveDeals: 120,
      totalAccounts: 5000,
      totalAccountValue: 25000000,
      totalPaidPayoutAmount: 5000000,
      totalPaidPayoutCount: 250,
    }

    getDealsOverview.mockResolvedValue(mockOverview)

    // Mock request
    const request = new Request("http://localhost/api/deals/overview")
    
    // Import the route handler
    const { GET } = await import("@/app/api/deals/overview/route")
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockOverview)
    expect(getDealsOverview).toHaveBeenCalled()
  })

  it("should handle errors gracefully", async () => {
    getDealsOverview.mockRejectedValue(new Error("Database error"))

    // Mock request
    const request = new Request("http://localhost/api/deals/overview")
    
    // Import the route handler
    const { GET } = await import("@/app/api/deals/overview/route")
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe("Failed to fetch deals overview")
  })
})