'use client'

import * as React from 'react'
import { Building2, Shield, Tags, BookOpen, Mail, BarChart, UserPlus, Send, LayoutDashboard } from 'lucide-react'
import { useUserStore } from '@/store/user-store'
import { UnifiedSidebar, UnifiedSidebarItem } from '@/components/ui/unified-sidebar'
import { useCurrentLocale } from '@/locales/client'
import { SUPPORTED_TIMEZONES } from '@/lib/constants/timezones'
import { NAV_ICON_SIZE } from '@/lib/constants/sidebar'

export function SidebarNav() {
  const locale = useCurrentLocale()
  const user = useUserStore(state => state.supabaseUser)
  const timezone = useUserStore(state => state.timezone)
  const setTimezone = useUserStore(state => state.setTimezone)
  const resetUser = useUserStore(state => state.resetUser)

  const handleLogout = React.useCallback(async () => {
    resetUser()
    const { signOut } = await import('@/server/auth')
    await signOut()
  }, [resetUser])

  const routes: UnifiedSidebarItem[] = React.useMemo(() => [
    {
      href: `/${locale}/admin/propfirms`,
      label: 'Firms',
      icon: <Building2 className={NAV_ICON_SIZE} />,
      group: 'Operations',
    },
    {
      href: `/${locale}/admin/coupons`,
      label: 'Offers',
      icon: <Tags className={NAV_ICON_SIZE} />,
      group: 'Operations',
    },
    {
      href: `/${locale}/admin/blogs`,
      label: 'Blog Studio',
      icon: <BookOpen className={NAV_ICON_SIZE} />,
      group: 'Publishing',
    },
    {
      href: `/${locale}/admin/reviews`,
      label: 'Reviews',
      icon: <Shield className={NAV_ICON_SIZE} />,
      group: 'Publishing',
    },
    {
      href: `/${locale}/admin/newsletter-builder`,
      label: 'Newsletter Studio',
      icon: <Mail className={NAV_ICON_SIZE} />,
      group: 'Publishing',
    },
    {
      href: `/${locale}/admin/weekly-recap`,
      label: 'Weekly Recap',
      icon: <BarChart className={NAV_ICON_SIZE} />,
      group: 'Publishing',
    },
    {
      href: `/${locale}/admin/welcome-email`,
      label: 'Welcome Flow',
      icon: <UserPlus className={NAV_ICON_SIZE} />,
      group: 'Messaging',
    },
    {
      href: `/${locale}/admin/send-email`,
      label: 'Broadcast',
      icon: <Send className={NAV_ICON_SIZE} />,
      group: 'Messaging',
    },
    {
      href: `/${locale}/dashboard`,
      label: 'Main Workspace',
      icon: <LayoutDashboard className={NAV_ICON_SIZE} />,
      group: 'System',
    },
  ], [locale])

  const timezones = [...SUPPORTED_TIMEZONES]

  return (
    <UnifiedSidebar
      items={routes}
      user={{
        avatar_url: user?.user_metadata?.avatar_url,
        email: user?.email,
        full_name: user?.user_metadata?.full_name,
      }}
      timezone={{
        value: timezone,
        options: timezones,
        onChange: setTimezone,
      }}
      onLogout={handleLogout}
    />
  )
}
