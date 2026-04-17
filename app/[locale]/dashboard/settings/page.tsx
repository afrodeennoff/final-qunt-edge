'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/locales/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useUserStore } from '../../../../store/user-store'
import { useTradovateSyncStore } from '../../../../store/tradovate-sync-store'
import { useTheme } from '@/context/theme-provider'
import { VALID_DASHBOARD_THEMES } from '@/lib/constants/dashboard-themes'
import {
  User,
  Settings,
  Bell,
  Shield,
  Globe,
  Clock,
  CreditCard,
  Database,
  LifeBuoy,
  LogOut,
  Building2,
  Eye,
  EyeOff,
  Palette,
} from 'lucide-react'
import { signOut, setPasswordAction } from '@/server/auth'
import Link from 'next/link'
import { useChangeLocale, useCurrentLocale } from '@/locales/client'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { leaveTeam, getUserTeams } from './actions'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { LinkedAccounts } from '@/components/linked-accounts'
import { UnifiedPageShell } from '@/components/layout/unified-page-shell'

type Locale = 'en' | 'fr'
type TranslateFn = ReturnType<typeof useI18n>
type TeamSummary = {
  id: string
  name: string
  traderIds: string[]
}
type UserTeamsState = {
  ownedTeams: TeamSummary[]
  joinedTeams: TeamSummary[]
}

// Add timezone list
const timezones = [
  'UTC',
  'Europe/Paris',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  // Add more common timezones as needed
]

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}

function TeamSettingsCard({
  userTeams,
  onLeaveTeam,
  locale,
}: {
  userTeams: UserTeamsState
  onLeaveTeam: (teamId: string) => Promise<void>
  locale: string
}) {
  const hasTeams = userTeams.ownedTeams.length > 0 || userTeams.joinedTeams.length > 0

  return (
    <Card className="border-border/35 bg-popover/45 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Team
        </CardTitle>
        <CardDescription>Manage your team connections</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasTeams && (
          <div>
            <Label className="text-base font-medium">Current Teams</Label>
            <div className="mt-2 space-y-2">
              {userTeams.ownedTeams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-3 border-border/45 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{team.name}</p>
                    <p className="text-sm text-muted-foreground">{team.traderIds.length} traders</p>
                  </div>
                  <Badge variant="secondary">Owner</Badge>
                </div>
              ))}

              {userTeams.joinedTeams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-3 border-border/45 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{team.name}</p>
                    <p className="text-sm text-muted-foreground">{team.traderIds.length} traders</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Leave Team
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Leave Team</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to leave this team?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onLeaveTeam(team.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Leave Team
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasTeams && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No team linked</p>
            <p className="text-sm mt-2">
              Contact your team administrator to get an invitation to join a team.
            </p>
            <div className="mt-4">
              <Link href={`/${locale}/teams/dashboard`}>
<<<<<<< HEAD
                <Button>
=======
                <Button >
>>>>>>> origin/main
                  <Building2 className="mr-2 h-4 w-4" />
                  Manage Teams
                </Button>
              </Link>
            </div>
          </div>
        )}

        {hasTeams && (
          <div className="mt-4">
            <Link href={`/${locale}/teams/dashboard`}>
<<<<<<< HEAD
              <Button variant="outline" className="w-full">
=======
              <Button  variant="outline" className="w-full">
>>>>>>> origin/main
                <Settings className="mr-2 h-4 w-4" />
                Manage Teams
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PasswordSettingsCard({
  t,
  newPassword,
  confirmPassword,
  showNewPassword,
  showConfirmPassword,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onToggleNewPassword,
  onToggleConfirmPassword,
  onUpdatePassword,
}: {
  t: TranslateFn
  newPassword: string
  confirmPassword: string
  showNewPassword: boolean
  showConfirmPassword: boolean
  onNewPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onToggleNewPassword: () => void
  onToggleConfirmPassword: () => void
  onUpdatePassword: () => Promise<void>
}) {
  return (
    <Card className="border-border/35 bg-popover/45 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {t('auth.setPassword')}
        </CardTitle>
        <CardDescription>{t('auth.setPasswordDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div>
            <Label htmlFor="newPassword">{t('auth.newPassword')}</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => onNewPasswordChange(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showNewPassword}
                onClick={onToggleNewPassword}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => onConfirmPasswordChange(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                aria-label={
                  showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'
                }
                aria-pressed={showConfirmPassword}
                onClick={onToggleConfirmPassword}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Button onClick={onUpdatePassword}>{t('auth.setPassword')}</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  const t = useI18n()
  const changeLocale = useChangeLocale()
  const currentLocale = useCurrentLocale()
  const user = useUserStore((state) => state.supabaseUser)
  const timezone = useUserStore((state) => state.timezone)
  const setTimezone = useUserStore((state) => state.setTimezone)
  const resetUser = useUserStore((state) => state.resetUser)
  const clearTradovate = useTradovateSyncStore((state) => state.clearAll)
  const { theme, setTheme } = useTheme()

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [tradingAlerts, setTradingAlerts] = useState(true)
  const [weeklyReports, setWeeklyReports] = useState(true)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [userTeams, setUserTeams] = useState<UserTeamsState>({ ownedTeams: [], joinedTeams: [] })

  const languages: { value: Locale; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
  ]

  const refreshTeams = async () => {
    const result = await getUserTeams()
    if (!result.success || !result.ownedTeams || !result.joinedTeams) {
      return
    }
    setUserTeams({
      ownedTeams: result.ownedTeams,
      joinedTeams: result.joinedTeams,
    })
  }

  // Load user teams on component mount
  useEffect(() => {
    let isCancelled = false
    void getUserTeams().then((result) => {
      if (isCancelled || !result.success || !result.ownedTeams || !result.joinedTeams) {
        return
      }
      setUserTeams({
        ownedTeams: result.ownedTeams,
        joinedTeams: result.joinedTeams,
      })
    })

    return () => {
      isCancelled = true
    }
  }, [])

  const handleLeaveTeam = async (teamId: string) => {
    const result = await leaveTeam(teamId)
    if (result.success) {
      toast.success(t('dashboard.teams.leaveSuccess'))
      await refreshTeams()
    } else {
      toast.error(result.error || t('dashboard.teams.error'))
    }
  }

  const handlePasswordUpdate = async () => {
    const newPwd = newPassword || ''
    const confirmPwd = confirmPassword || ''
    if (!newPwd || newPwd.length < 6) {
      toast.error(t('error'), { description: t('auth.passwordMinLength') })
      return
    }
    if (newPwd !== confirmPwd) {
      toast.error(t('error'), { description: t('auth.passwordsDoNotMatch') })
      return
    }

    try {
      await setPasswordAction(newPwd)
      toast.success(t('success'), { description: t('auth.passwordUpdated') })
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: unknown) {
      toast.error(t('error'), {
        description: getErrorMessage(error, 'Failed to update password'),
      })
    }
  }

  return (
    <UnifiedPageShell density="compact">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Section */}
        <Card className="border-border/35 bg-popover/45 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('dashboard.profile')}
            </CardTitle>
            <CardDescription>Manage your personal information and account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.user_metadata.avatar_url} />
                <AvatarFallback className="text-lg">{user?.email![0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{user?.email}</h3>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Member since {new Date(user?.created_at || '').toLocaleDateString()}
                </p>
              </div>
            </div>
            <Separator />
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="Enter your first name" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Enter your last name" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email || ''} disabled />
              </div>
              <Button>Update Profile</Button>
            </div>
          </CardContent>
        </Card>

        {/* Preferences Section */}
        <Card className="border-border/35 bg-popover/45 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription>Customize your dashboard appearance and behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Accent Color Settings */}
            <div>
              <Label className="text-base font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Accent Color
              </Label>
              <div className="mt-2">
                <div className="rounded-md border border-border/20 bg-background/30 p-3">
<<<<<<< HEAD
                  <p className="mb-3 text-sm text-muted-foreground">
                    Choose your dashboard accent color
                  </p>
=======
                  <p className="mb-3 text-sm text-muted-foreground">Choose your dashboard accent color</p>
>>>>>>> origin/main
                  <div className="flex gap-3">
                    {VALID_DASHBOARD_THEMES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTheme(t)}
                        className="relative flex flex-col items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg p-1"
                        aria-label={`Set accent color to ${t}`}
                        aria-pressed={theme === t}
                      >
                        <span
                          className={`h-8 w-8 rounded-full transition-[opacity,background-color,border-color] ${theme === t ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110' : 'hover:scale-105'}`}
                          style={{
                            backgroundColor:
                              t === 'blue'
                                ? 'oklch(0.55 0.22 264)'
                                : t === 'violet'
                                  ? 'oklch(0.60 0.22 290)'
                                  : t === 'emerald'
                                    ? 'oklch(0.55 0.20 160)'
                                    : t === 'amber'
                                      ? 'oklch(0.60 0.20 70)'
                                      : 'oklch(0.58 0.22 10)',
                          }}
                        />
                        <span
                          className={`text-xs capitalize ${theme === t ? 'text-primary font-medium' : 'text-muted-foreground'}`}
                        >
                          {t}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Language Settings */}
            <div>
              <Label className="text-base font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Language
              </Label>
              <div className="mt-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-[200px] justify-start">
                      <Globe className="mr-2 h-4 w-4" />
                      {languages.find((lang) => lang.value === currentLocale)?.label}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuRadioGroup value={currentLocale} aria-label="Language selection">
                      {languages.map((lang) => (
                        <DropdownMenuRadioItem
                          key={lang.value}
                          value={lang.value}
                          className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          onClick={() => changeLocale(lang.value)}
                        >
                          {lang.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <Separator />

            {/* Timezone Settings */}
            <div>
              <Label className="text-base font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timezone
              </Label>
              <div className="mt-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-[200px] justify-start">
                      <Clock className="mr-2 h-4 w-4" />
                      {timezone}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <ScrollArea className="h-[200px]">
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="border-border/35 bg-popover/45 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how you receive notifications and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive important updates via email</p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get real-time alerts in your browser
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="trading-alerts">Trading Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications about your trading performance
                </p>
              </div>
              <Switch
                id="trading-alerts"
                checked={tradingAlerts}
                onCheckedChange={setTradingAlerts}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weekly-reports">Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Receive weekly performance summaries
                </p>
              </div>
              <Switch
                id="weekly-reports"
                checked={weeklyReports}
                onCheckedChange={setWeeklyReports}
              />
            </div>
          </CardContent>
        </Card>

<<<<<<< HEAD
        <TeamSettingsCard
          userTeams={userTeams}
          onLeaveTeam={handleLeaveTeam}
          locale={currentLocale}
        />
=======
        <TeamSettingsCard userTeams={userTeams} onLeaveTeam={handleLeaveTeam} locale={currentLocale} />
>>>>>>> origin/main

        {/* Linked Accounts Section */}
        <LinkedAccounts />

        <PasswordSettingsCard
          t={t}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          showNewPassword={showNewPassword}
          showConfirmPassword={showConfirmPassword}
          onNewPasswordChange={setNewPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onToggleNewPassword={() => setShowNewPassword((value) => !value)}
          onToggleConfirmPassword={() => setShowConfirmPassword((value) => !value)}
          onUpdatePassword={handlePasswordUpdate}
        />

        {/* Account Management Section */}
        <Card className="border-border/35 bg-popover/45 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Management
            </CardTitle>
            <CardDescription>Manage your account settings and data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <Link href={`/${currentLocale}/dashboard/billing`}>
<<<<<<< HEAD
                <Button variant="outline" className="w-full justify-start">
=======
                <Button  variant="outline" className="w-full justify-start">
>>>>>>> origin/main
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing & Subscription
                </Button>
              </Link>
              <Link href={`/${currentLocale}/dashboard/data`}>
<<<<<<< HEAD
                <Button variant="outline" className="w-full justify-start">
=======
                <Button  variant="outline" className="w-full justify-start">
>>>>>>> origin/main
                  <Database className="mr-2 h-4 w-4" />
                  Data Management
                </Button>
              </Link>
              <Link href={`/${currentLocale}/support`}>
<<<<<<< HEAD
                <Button variant="outline" className="w-full justify-start">
=======
                <Button  variant="outline" className="w-full justify-start">
>>>>>>> origin/main
                  <LifeBuoy className="mr-2 h-4 w-4" />
                  Support & Help
                </Button>
              </Link>
              <Separator />
              <Button
                variant="error"
                className="w-full justify-start"
                onClick={async () => {
                  clearTradovate()
                  resetUser()
                  await signOut()
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </UnifiedPageShell>
  )
}
