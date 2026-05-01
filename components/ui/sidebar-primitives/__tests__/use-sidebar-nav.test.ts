import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockUsePathname = vi.fn(() => '/dashboard')

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))

describe('useSidebarNav utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePathname.mockReturnValue('/dashboard')
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

    it('should match sub-routes for dashboard children', async () => {
      mockUsePathname.mockReturnValue('/dashboard/trades')

      const { useActiveLink } = await import('../use-sidebar-nav')
      const isActive = useActiveLink()

      expect(isActive('/dashboard/trades', true)).toBe(true)
      expect(isActive('/dashboard/trades', false)).toBe(true)
      // /dashboard should not match when on /dashboard/trades with exact
      expect(isActive('/dashboard', true)).toBe(false)
      // /dashboard should match as parent without exact
      expect(isActive('/dashboard', false)).toBe(true)
    })

    it('should strip locale prefix from pathname', async () => {
      mockUsePathname.mockReturnValue('/en/dashboard')

      const { useActiveLink } = await import('../use-sidebar-nav')
      const isActive = useActiveLink()

      expect(isActive('/dashboard', true)).toBe(true)
    })

    it('should return false when pathname is empty', async () => {
      mockUsePathname.mockReturnValue('')

      const { useActiveLink } = await import('../use-sidebar-nav')
      const isActive = useActiveLink()

      expect(isActive('/dashboard', true)).toBe(false)
    })
  })
})
