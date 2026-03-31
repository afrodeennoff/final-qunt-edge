'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useI18n, useChangeLocale, useCurrentLocale } from '@/locales/client'
import { useDashboardActions } from '@/context/data-provider'
import { useUserStore } from '@/store/user-store'
import { useTradovateSyncStore } from '@/store/tradovate-sync-store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LifeBuoy,
  CreditCard,
  Database,
  LogOut,
  Globe,
  LayoutDashboard,
  Clock,
  RefreshCw,
  Settings,
  Building2,
  Palette,
} from 'lucide-react'
import { SubscriptionBadge } from '@/components/subscription-badge'
import { signOut } from '@/server/auth'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme-provider'
import { VALID_DASHBOARD_THEMES, type DashboardTheme } from '@/lib/constants/dashboard-themes'

type Locale = 'en' | 'fr'
type MenuVariant = 'navbar' | 'sidebar'

const timezones = [
  'UTC',
  'Europe/Paris',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
]
const variantClasses: Record<
  MenuVariant,
  {
    trigger: string
    avatar: string
    avatarFallback: string
    account: string
    subscriptionBadge: string
    settingsIcon: string
  }
> = {
  navbar: {
    trigger: 'hover:bg-accent/70 p-1 rounded-full',
    avatar: 'h-8 w-8 rounded-full border-2 border-primary/20',
    avatarFallback: 'rounded-full bg-primary/10 text-primary',
    account: 'hidden sm:grid',
    subscriptionBadge: '',
    settingsIcon: 'hidden',
  },
  sidebar: {
    trigger: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg p-2 w-full group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center',
    avatar: 'h-8 w-8',
    avatarFallback: 'bg-sidebar-primary text-sidebar-primary-foreground',
    account: 'group-data-[collapsible=icon]:hidden',
    subscriptionBadge: 'group-data-[collapsible=icon]:hidden',
    settingsIcon: 'ml-auto size-4 group-data-[collapsible=icon]:hidden',
  },
}

function getUserInitial(email: string) {
  return email[0] ?? '?'
}

export default function UserMenu({ variant = 'sidebar' }: { variant?: MenuVariant }) {
  const t = useI18n()
  const changeLocale = useChangeLocale()
  const currentLocale = useCurrentLocale()
  const { refreshAllData } = useDashboardActions()
  const user = useUserStore(state => state.supabaseUser)
  const timezone = useUserStore(state => state.timezone)
  const setTimezone = useUserStore(state => state.setTimezone)
  const resetUser = useUserStore(state => state.resetUser)
  const clearTradovate = useTradovateSyncStore((state) => state.clearAll)
  const { theme, setTheme } = useTheme()

  const variantClass = variantClasses[variant]
  const userMetadata = user?.user_metadata
  const userEmail = user?.email ?? ''
  const userAvatarUrl = typeof userMetadata?.avatar_url === 'string' ? userMetadata.avatar_url : undefined
  const userFullName = typeof userMetadata?.full_name === 'string' ? userMetadata.full_name : undefined
  const userDisplayName = userFullName ?? userEmail.split('@')[0]
  const userInitial = getUserInitial(userEmail)

  const languages: { value: Locale; label: string }[] = useMemo(() => ([
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
  ]), [])

  return (
    <div className="relative">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Open user menu"
            className={cn(
              "flex items-center gap-2 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              variantClass.trigger
            )}
          >
            <div className="relative flex-none">
              <Avatar className={cn(
                "rounded-lg transition-transform hover:scale-105",
                variantClass.avatar
              )}>
                <AvatarImage src={userAvatarUrl} />
                <AvatarFallback className={cn(
                  "uppercase text-xs rounded-lg",
                  variantClass.avatarFallback
                )}>
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <SubscriptionBadge className={cn(
                "absolute -bottom-1 -right-1 px-1 py-0 text-[10px] leading-3",
                variantClass.subscriptionBadge
              )} />
            </div>
            <div className={cn(
              "grid flex-1 text-left text-sm leading-tight",
              variantClass.account
            )}>
              <span className="truncate font-bold text-foreground">
                {userDisplayName}
              </span>
              <span className="truncate text-[10px] text-muted-foreground font-medium">
                {userEmail}
              </span>
            </div>
            <Settings className={variantClass.settingsIcon} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>{t('dashboard.myAccount')}</DropdownMenuLabel>
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            {userEmail}
          </div>
          <DropdownMenuItem asChild>
            <Link href={`/${currentLocale}/dashboard`}>
              <div className="flex items-center w-full">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>{t('landing.navbar.dashboard')}</span>
                <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
              </div>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/${currentLocale}/dashboard/settings`}>
              <div className="flex items-center w-full">
                <Settings className="mr-2 h-4 w-4" />
                <span>{t('dashboard.settings')}</span>
                <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
              </div>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/${currentLocale}/dashboard/billing`}>
              <div className="flex items-center w-full">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>{t('dashboard.billing')}</span>
                <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
              </div>
            </Link>
          </DropdownMenuItem>
          <Link href={`/${currentLocale}/dashboard/data`}>
            <DropdownMenuItem className="flex items-center">
              <Database className="mr-2 h-4 w-4" />
              <span>{t('dashboard.data')}</span>
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem onClick={async () => await refreshAllData({ force: true })} className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            <span>{t('dashboard.refreshData')}</span>
            <DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/${currentLocale}/teams/dashboard`}>
              <div className="flex items-center w-full">
                <Building2 className="mr-2 h-4 w-4" />
                <span>{t('dashboard.teams')}</span>
              </div>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <Link href={`/${currentLocale}/support`}>
            <DropdownMenuItem className="flex items-center">
              <LifeBuoy className="mr-2 h-4 w-4" />
              <span>{t('dashboard.support')}</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              aria-label={t('dashboard.language')}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Globe className="mr-2 h-4 w-4" />
              <span>{t('dashboard.language')}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <ScrollArea className="h-[64px]">
                  <DropdownMenuRadioGroup value={currentLocale} aria-label="Language selection">
                    {languages.map((lang) => (
                      <DropdownMenuRadioItem
                        key={lang.value}
                        value={lang.value}
                        className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        onClick={() => {
                          changeLocale(lang.value)
                        }}
                      >
                        {lang.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </ScrollArea>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              aria-label={t('dashboard.timezone')}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Clock className="mr-2 h-4 w-4" />
              <span>{t('dashboard.timezone')}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <ScrollArea className="h-[40px] sm:h-[120px]">
                  <DropdownMenuRadioGroup
                    value={timezone}
                    onValueChange={setTimezone}
                    aria-label="Timezone selection"
                  >
                    {timezones.map((tz) => (
                      <DropdownMenuRadioItem
                        key={tz}
                        value={tz}
                        className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        aria-label={tz.replace('_', ' ')}
                      >
                        {tz.replace('_', ' ')}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </ScrollArea>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              aria-label={t('dashboard.theme')}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Palette className="mr-2 h-4 w-4" />
              <span>{t('dashboard.theme')}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <ScrollArea className="h-[128px]">
                  <DropdownMenuRadioGroup
                    value={theme}
                    onValueChange={(val) => setTheme(val as DashboardTheme)}
                    aria-label="Theme selection"
                  >
                    {VALID_DASHBOARD_THEMES.map((t_name) => (
                      <DropdownMenuRadioItem
                        key={t_name}
                        value={t_name}
                        className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background capitalize"
                      >
                        {t_name}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </ScrollArea>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              clearTradovate()
              resetUser()
              await signOut()
            }}
            className="flex items-center"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t('dashboard.logOut')}</span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
