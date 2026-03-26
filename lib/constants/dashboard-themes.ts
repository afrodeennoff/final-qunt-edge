export const VALID_DASHBOARD_THEMES = ['blue', 'violet', 'emerald', 'amber', 'rose'] as const

export type DashboardTheme = typeof VALID_DASHBOARD_THEMES[number]
