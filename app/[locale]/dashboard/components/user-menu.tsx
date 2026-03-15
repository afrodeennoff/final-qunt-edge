'use client'

import Link from 'next/link'
import { useI18n, useChangeLocale, useCurrentLocale } from '@/locales/client'
import { DASHBOARD_THEMES, type DashboardTheme, useTheme } from '@/context/theme-provider'
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
import { Slider } from '@/components/ui/slider'
import {
  LifeBuoy,
  CreditCard,
  Database,
  LogOut,
  Globe,
  LayoutDashboard,
  Clock,
  RefreshCw,
  Moon,
  Sun,
  Laptop,
  Settings,
  Building2,
  Palette,
} from 'lucide-react'
import { SubscriptionBadge } from '@/components/subscription-badge'
import { signOut } from '@/server/auth'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'

type Locale = 'en' | 'fr'
type DashboardThemeOption = {
  value: DashboardTheme
  label: string
  preview: string
  swatchClass: string
}

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
const dashboardThemeOptions: DashboardThemeOption[] = [
  { value: 'blue', label: 'VTRON Blue', preview: 'Balanced and crisp', swatchClass: 'bg-chart-1' },
  { value: 'violet', label: 'CWH Violet', preview: 'High contrast focus', swatchClass: 'bg-chart-2' },
  { value: 'emerald', label: 'Emerald Light', preview: 'Fresh and minimal', swatchClass: 'bg-chart-4' },
  { value: 'amber', label: 'Lara Amber', preview: 'Warm and energetic', swatchClass: 'bg-chart-5' },
  { value: 'rose', label: 'Efferd Rose', preview: 'Neutral editorial', swatchClass: 'bg-chart-3' },
]

export default function UserMenu({ variant = 'sidebar' }: { variant?: 'navbar' | 'sidebar' }) {
  const t = useI18n()
  const changeLocale = useChangeLocale()
  const currentLocale = useCurrentLocale()
  const { theme, setTheme, dashboardTheme, setDashboardTheme, intensity, setIntensity } = useTheme()
  const { refreshAllData } = useDashboardActions()
  const user = useUserStore(state => state.supabaseUser)
  const timezone = useUserStore(state => state.timezone)
  const setTimezone = useUserStore(state => state.setTimezone)
  const resetUser = useUserStore(state => state.resetUser)
  const clearTradovate = useTradovateSyncStore((state) => state.clearAll)

  const languages: { value: Locale; label: string }[] = useMemo(() => ([
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
  ]), [])

  const handleThemeChange = (value: string) => {
    setTheme(value as 'light' | 'dark' | 'system')
  }

  const handleDashboardThemeChange = (value: string) => {
    if (!DASHBOARD_THEMES.includes(value as DashboardTheme)) {
      return
    }

    setDashboardTheme(value as DashboardTheme)
  }

  const getThemeIcon = () => {
    if (theme === 'light') return <Sun className="h-4 w-4" />
    if (theme === 'dark') return <Moon className="h-4 w-4" />
    if (typeof window !== 'undefined') {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
      return isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />
    }
    return <Laptop className="h-4 w-4" />
  }

  const activeDashboardTheme = useMemo(
    () => dashboardThemeOptions.find((option) => option.value === dashboardTheme) ?? dashboardThemeOptions[0],
    [dashboardTheme]
  )

  return (
    <div className="relative">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Open user menu"
            className={cn(
              "flex items-center gap-2 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              variant === 'navbar'
                ? "hover:bg-accent/70 p-1 rounded-full"
                : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg p-2 w-full group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
            )}
          >
            <div className="relative flex-none">
              <Avatar className={cn(
                "rounded-lg transition-transform hover:scale-105",
                variant === 'navbar' ? "h-8 w-8 rounded-full border-2 border-primary/20" : "h-8 w-8"
              )}>
                <AvatarImage src={user?.user_metadata.avatar_url} />
                <AvatarFallback className={cn(
                  "uppercase text-xs rounded-lg",
                  variant === 'navbar' ? "rounded-full bg-primary/10 text-primary" : "bg-sidebar-primary text-sidebar-primary-foreground"
                )}>
                  {user?.email![0]}
                </AvatarFallback>
              </Avatar>
              <SubscriptionBadge className={cn(
                "absolute -bottom-1 -right-1 px-1 py-0 text-[10px] leading-3",
                variant === 'sidebar' && "group-data-[collapsible=icon]:hidden"
              )} />
            </div>
            <div className={cn(
              "grid flex-1 text-left text-sm leading-tight",
              variant === 'sidebar' && "group-data-[collapsible=icon]:hidden",
              variant === 'navbar' && "hidden sm:grid"
            )}>
              <span className="truncate font-bold text-foreground">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
              </span>
              <span className="truncate text-[10px] text-muted-foreground font-medium">
                {user?.email}
              </span>
            </div>
            {variant === 'sidebar' && (
              <Settings className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>{t('dashboard.myAccount')}</DropdownMenuLabel>
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            {user?.email}
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
              aria-label="Select dashboard theme"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Palette className="mr-2 h-4 w-4" />
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate">Dashboard Theme</span>
                <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', activeDashboardTheme.swatchClass)} />
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-[240px]">
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                  Palette presets
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={dashboardTheme}
                  onValueChange={handleDashboardThemeChange}
                  aria-label="Dashboard theme"
                >
                  {dashboardThemeOptions.map((option) => (
                    <DropdownMenuRadioItem
                      key={option.value}
                      value={option.value}
                      className="items-start py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      aria-label={`${option.label} theme`}
                    >
                      <div className="flex min-w-0 items-start gap-2">
                        <span className={cn('mt-0.5 h-3 w-3 shrink-0 rounded-full', option.swatchClass)} />
                        <span className="min-w-0">
                          <span className="block truncate text-sm">{option.label}</span>
                          <span className="block truncate text-xs text-muted-foreground">{option.preview}</span>
                        </span>
                      </div>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              aria-label={t('landing.navbar.toggleTheme')}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {getThemeIcon()}
              <span className="ml-2">{t('landing.navbar.toggleTheme')}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-[200px]">
                <DropdownMenuRadioGroup value={theme} onValueChange={handleThemeChange} aria-label="Interface theme">
                  <DropdownMenuRadioItem
                    value="light"
                    className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-label={t('landing.navbar.lightMode')}
                  >
                    <Sun className="mr-2 h-4 w-4" />
                    <span>{t('landing.navbar.lightMode')}</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="dark"
                    className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-label={t('landing.navbar.darkMode')}
                  >
                    <Moon className="mr-2 h-4 w-4" />
                    <span>{t('landing.navbar.darkMode')}</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="system"
                    className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-label={t('landing.navbar.systemTheme')}
                  >
                    <Laptop className="mr-2 h-4 w-4" />
                    <span>{t('landing.navbar.systemTheme')}</span>
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <div className="p-4">
                  <div className="mb-2 text-sm font-medium">{t('dashboard.theme.intensity')}</div>
                  <Slider
                    value={[intensity]}
                    onValueChange={([value]) => setIntensity(value)}
                    min={90}
                    max={100}
                    step={1}
                    className="w-full"
                    aria-label={t('dashboard.theme.intensity')}
                  />
                  <div className="mt-2 text-sm text-muted-foreground">
                    {intensity}%
                  </div>
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
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
