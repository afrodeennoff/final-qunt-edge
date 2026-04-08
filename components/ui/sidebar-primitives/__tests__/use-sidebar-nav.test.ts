import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockUsePathname = vi.fn(() => '/dashboard')
const mockUseSearchParams = vi.fn(() => new URLSearchParams())

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
}))

describe('useSidebarNav utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePathname.mockReturnValue('/dashboard')
    mockUseSearchParams.mockReturnValue(new URLSearchParams())
  })

  describe('stripLocalePrefix', () => {
    it('should strip locale prefix from /en/dashboard', async () => {
      const { stripLocalePrefix } = await import('../use-sidebar-nav')
      expect(stripLocalePrefix('/en/dashboard')).toBe('/dashboard')
    })

    it('should strip locale prefix from /fr/admin/propfirms', async () => {
      const { stripLocalePrefix } = await import('../use-sidebar-nav')
      expect(stripLocalePrefix('/fr/admin/propfirms')).toBe('/admin/propfirms')
    })

    it('should handle path without locale prefix', async () => {
      const { stripLocalePrefix } = await import('../use-sidebar-nav')
      expect(stripLocalePrefix('/dashboard')).toBe('/dashboard')
    })

    it('should handle empty string', async () => {
      const { stripLocalePrefix } = await import('../use-sidebar-nav')
      expect(stripLocalePrefix('')).toBe('/')
    })

    it('should handle root path', async () => {
      const { stripLocalePrefix } = await import('../use-sidebar-nav')
      expect(stripLocalePrefix('/')).toBe('/')
    })
  })

  describe('useActiveLink', () => {
    it('should return a function', async () => {
      const { useActiveLink } = await import('../use-sidebar-nav')
      const hook = useActiveLink()

      expect(typeof hook).toBe('function')
    })

    it('should detect exact match for /dashboard', async () => {
      const { useActiveLink } = await import('../use-sidebar-nav')
      const isActive = useActiveLink()

      expect(isActive('/dashboard', true)).toBe(true)
      expect(isActive('/dashboard', false)).toBe(true)
      expect(isActive('/dashboard/settings', true)).toBe(false)
    })

    it('should detect nested routes', async () => {
      mockUsePathname.mockReturnValue('/teams/dashboard/abc123/analytics')

      const { useActiveLink } = await import('../use-sidebar-nav')
      const isActive = useActiveLink()

      expect(isActive('/teams/dashboard', false)).toBe(true)
      expect(isActive('/teams/dashboard', true)).toBe(false)
    })

    it('should handle tab-based navigation when tab matches', async () => {
      // Test: when active tab is 'chart', /dashboard?tab=chart should be active
      const params = new URLSearchParams()
      params.set('tab', 'chart')
      mockUseSearchParams.mockReturnValue(params)

      const { useActiveLink } = await import('../use-sidebar-nav')
      const isActive = useActiveLink()

      expect(isActive('/dashboard?tab=chart', false)).toBe(true)
    })

    it('should handle tab-based navigation with non-matching tab', async () => {
      // Test: when active tab is 'chart', /dashboard?tab=widgets should NOT be active
      const params = new URLSearchParams()
      params.set('tab', 'chart')
      mockUseSearchParams.mockReturnValue(params)

      const { useActiveLink } = await import('../use-sidebar-nav')
      const isActive = useActiveLink()

      // Different tab should not match
      expect(isActive('/dashboard?tab=widgets', false)).toBe(false)
    })

    it('should strip locale prefix from pathname', async () => {
      mockUsePathname.mockReturnValue('/en/dashboard')

      const { useActiveLink } = await import('../use-sidebar-nav')
      const isActive = useActiveLink()

      expect(isActive('/dashboard', true)).toBe(true)
    })

    it('should handle default tab for dashboard', async () => {
      const { useActiveLink } = await import('../use-sidebar-nav')
      const isActive = useActiveLink()

      expect(isActive('/dashboard', false)).toBe(true)
      expect(isActive('/dashboard?tab=widgets', false)).toBe(true)
    })

    it('should handle default tab for dashboard with different active tab', async () => {
      const params = new URLSearchParams()
      params.set('tab', 'chart')
      mockUseSearchParams.mockReturnValue(params)

      const { useActiveLink } = await import('../use-sidebar-nav')
      const isActive = useActiveLink()

      // /dashboard (no tab param) should match when active tab is 'chart'
      // because it's treated as the default dashboard route
      expect(isActive('/dashboard', false)).toBe(true)
    })

    it('should return false when pathname is empty', async () => {
      mockUsePathname.mockReturnValue('')

      const { useActiveLink } = await import('../use-sidebar-nav')
      const isActive = useActiveLink()

      expect(isActive('/dashboard', true)).toBe(false)
    })
  })
})