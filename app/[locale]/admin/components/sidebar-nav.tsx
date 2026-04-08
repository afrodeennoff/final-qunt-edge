'use client'

import * as React from 'react'
import { Building2, Shield, Tags, BookOpen, Mail, BarChart, UserPlus, Send } from 'lucide-react'
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
      label: 'Prop Firms',
      icon: <Building2 className={NAV_ICON_SIZE} />,
    },
    {
      href: `/${locale}/admin/coupons`,
      label: 'Coupons',
      icon: <Tags className={NAV_ICON_SIZE} />,
    },
    {
      href: `/${locale}/admin/blogs`,
      label: 'Blog',
      icon: <BookOpen className={NAV_ICON_SIZE} />,
    },
    {
      href: `/${locale}/admin/reviews`,
      label: 'Reviews',
      icon: <Shield className={NAV_ICON_SIZE} />,
    },
    {
      href: `/${locale}/admin/newsletter-builder`,
      label: 'Newsletter Builder',
      icon: <Mail className={NAV_ICON_SIZE} />,
    },
    {
      href: `/${locale}/admin/weekly-recap`,
      label: 'Weekly Recap',
      icon: <BarChart className={NAV_ICON_SIZE} />,
    },
    {
      href: `/${locale}/admin/welcome-email`,
      label: 'Welcome Email',
      icon: <UserPlus className={NAV_ICON_SIZE} />,
    },
    {
      href: `/${locale}/admin/send-email`,
      label: 'Send Email',
      icon: <Send className={NAV_ICON_SIZE} />,
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
