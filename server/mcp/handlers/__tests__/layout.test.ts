import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getDashboardLayoutHandler, saveDashboardLayoutHandler } from '../layout'

vi.mock('@/server/layouts', () => ({
  getDashboardLayoutForUser: vi.fn(),
  saveDashboardLayoutForUser: vi.fn(),
}))

import * as layouts from '@/server/layouts'

const mockCtx = { userId: 'user-mcp-layout-123', authUserId: 'auth-123', role: 'user' as const, authMethod: 'apikey' as const }

describe('layout handlers (TDD - Top 15 #12)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('SECURITY: requireUserId - throws without ctx.userId', async () => {
    await expect(getDashboardLayoutHandler({} as any, {}))
      .rejects.toThrow('Authentication required')
  })

  it('SECURITY: assertNoCrossUserAccess - rejects userId in args', async () => {
    await expect(getDashboardLayoutHandler(mockCtx, { userId: 'attacker' }))
      .rejects.toThrow('Cross-user access denied')
  })

  it('getDashboardLayoutHandler returns scoped layouts or empty default', async () => {
    vi.mocked(layouts.getDashboardLayoutForUser).mockResolvedValue({ desktop: [{ i: 'w1' }], mobile: [] } as any)
    const res = await getDashboardLayoutHandler(mockCtx, {})
    expect(layouts.getDashboardLayoutForUser).toHaveBeenCalledWith('user-mcp-layout-123')
    expect(res.desktop.length).toBe(1)
  })

  it('saveDashboardLayoutHandler enforces ctx.userId, calls enhanced forUser save', async () => {
    vi.mocked(layouts.saveDashboardLayoutForUser).mockResolvedValue({ success: true })
    const layoutsArg = { desktop: [], mobile: [] }
    const res = await saveDashboardLayoutHandler(mockCtx, { layouts: layoutsArg })
    expect(layouts.saveDashboardLayoutForUser).toHaveBeenCalledWith('user-mcp-layout-123', layoutsArg)
    expect(res.success).toBe(true)
  })
})
