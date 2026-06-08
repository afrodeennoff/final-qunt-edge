'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/locales/client'
import type { ApiKeyResult } from '@/server/mcp-key-service'
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
import {
  THEME_LABELS,
  THEME_PALETTES,
  VALID_DASHBOARD_THEMES,
} from '@/lib/constants/dashboard-themes'
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
  Key,
  Copy,
  Plus,
  Trash2,
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
import { leaveTeam, getUserTeams, updateUsernameAction, updateUserProfile, getUsernameCooldown } from './actions'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
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
    <Card className="border-0 bg-card shadow-sm">
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
                  className="flex items-center justify-between rounded-xl border-0 p-3"
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
                  className="flex items-center justify-between rounded-xl border-0 p-3"
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
                <Button>
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
              <Button variant="outline" className="w-full">
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
    <Card className="rounded-xl border-0 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {t('auth.setPassword')}
        </CardTitle>
        <CardDescription className="text-sm">{t('auth.setPasswordDescription')}</CardDescription>
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

function ApiKeySection() {
  const [keys, setKeys] = useState<ApiKeyResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [origin, setOrigin] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const loadKeys = async () => {
    setIsLoading(true)
    setError(null)
    const { listUserApiKeys } = await import('@/server/mcp-key-service')
    const result = await listUserApiKeys()
    if (result.success) {
      setKeys(result.keys)
    } else {
      setError(result.error || 'Failed to load API keys')
    }
    setIsLoading(false)
  }

  useEffect(() => { loadKeys() }, [])

  const handleCreate = async () => {
    if (!newKeyName.trim()) return
    setIsCreating(true)
    setError(null)
    const { generateUserApiKey } = await import('@/server/mcp-key-service')
    const result = await generateUserApiKey(newKeyName.trim())
    if (result.success) {
      setCreatedKey(result.result.key ?? null)
      setNewKeyName('')
      await loadKeys()
    } else {
      const msg = result.error || 'Failed to create key'
      setError(msg)
      toast.error(msg)
    }
    setIsCreating(false)
  }

  const handleRevoke = async (keyId: string) => {
    const { revokeApiKey } = await import('@/server/mcp-key-service')
    const result = await revokeApiKey(keyId)
    if (result.success) {
      toast.success('API key revoked')
      await loadKeys()
    } else {
      toast.error(result.error || 'Failed to revoke key')
    }
  }

  return (
    <Card className="rounded-xl border-0 bg-card shadow-sm lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </CardTitle>
            <CardDescription className="mt-1">
              Secure access to your trading data for AI agents and external tools via MCP.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Connect - MCP Endpoint */}
        {origin && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">MCP Server Endpoint</p>
              <Badge variant="outline" className="text-[10px]">Primary</Badge>
            </div>
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center gap-3">
                <code className="flex-1 text-sm font-mono text-foreground/90 break-all select-all">
                  {origin}/api/mcp
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(`${origin}/api/mcp`)
                    toast.success('Endpoint copied')
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <p className="mt-2 text-[12px] text-muted-foreground">
                 Use any of your API keys below as a Bearer token.
               </p>
               <p className="mt-1 text-[11px] text-muted-foreground/70">
                  Streamable HTTP compatible (works with Grok Remote MCP via xAI API, Claude Custom Connectors, Cursor, Jan AI, Cline, etc.).
                 For stdio-only clients: run <code className="font-mono">MCP_KEY=your_key bun run mcp:stdio</code> (forwards to this hosted instance, exposes all 95+ tools).
               </p>
             </div>
           </div>
         )}

        {/* Your API Keys */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">Your API Keys</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateDialog(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" /> Create New Key
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : keys.length === 0 ? (
            <div className="rounded-xl border-0/60 bg-muted/20 p-6 text-center">
              <Key className="mx-auto h-8 w-8 mb-3 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground mb-1">No API keys yet</p>
              <p className="text-xs text-muted-foreground">Create one to connect AI tools or external services.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {keys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="flex items-center justify-between rounded-xl border-0 bg-card/50 p-4 hover:bg-muted/20 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-sm">{apiKey.name}</p>
                      <Badge variant="outline" className="text-[10px] font-mono">{apiKey.keyPrefix}...</Badge>
                      <Badge variant="secondary" className="text-[10px]">{apiKey.role}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created {new Date(apiKey.createdAt).toLocaleDateString()} 
                      {apiKey.lastUsedAt ? ` · Last used ${new Date(apiKey.lastUsedAt).toLocaleDateString()}` : ' · Never used'}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
                        <AlertDialogDescription>
                          Revoking <strong>{apiKey.name}</strong> will immediately disable access for any tool using it. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRevoke(apiKey.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Revoke Key
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Setup Guides */}
        <div>
          <p className="text-sm font-semibold mb-3">Setup Guides</p>
          <div className="grid gap-3 md:grid-cols-2">
            {/* Claude Desktop */}
            <div className="rounded-xl border-0 bg-muted/20 p-4">
              <div className="font-medium text-sm mb-2 flex items-center gap-2">Claude Desktop</div>
              <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>Open Claude Desktop → Settings → Developer</li>
                <li>Click “Edit Config”</li>
                <li>Paste the config below (replace <code>YOUR_KEY_HERE</code>)</li>
              </ol>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => {
                  const config = `{
  "mcpServers": {
    "qunt-edge": {
      "url": "${origin}/api/mcp",
      "headers": { "Authorization": "Bearer YOUR_KEY_HERE" }
    }
  }
}`;
                  navigator.clipboard.writeText(config);
                  toast.success("Claude config copied");
                }}
              >
                Copy Claude Config
              </Button>
            </div>

            {/* Jan AI */}
            <div className="rounded-xl border-0 bg-muted/20 p-4">
              <div className="font-medium text-sm mb-2 flex items-center gap-2">Jan AI</div>
              <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>Settings → Features → MCP Servers (or Extensions → MCP Servers)</li>
                <li>Add Remote Server / + Add MCP Server</li>
                <li>Transport: HTTP</li>
                <li>URL: the endpoint above</li>
                <li>Headers: name = <code>Authorization</code>, value = <code>Bearer YOUR_KEY</code> (include the word Bearer + space)</li>
              </ol>
              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const text = `MCP Server URL: ${origin}/api/mcp\n\nHeader name: Authorization\nHeader value: Bearer YOUR_API_KEY\n\n(Do NOT put 'Bearer' as the header name — it must be 'Authorization')`;
                    navigator.clipboard.writeText(text);
                    toast.success("Jan AI config copied");
                  }}
                >
                  Copy Jan AI Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const curl = `curl -X POST ${origin}/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'`;
                    navigator.clipboard.writeText(curl);
                    toast.success("Test curl copied — replace YOUR_API_KEY");
                  }}
                >
                  Copy Test Curl
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">Can't connect? Run the curl in terminal first. If curl works but Jan doesn't: fix header in Jan, toggle server, or restart Jan. Use a fresh key from above.</p>
            </div>

            {/* Other Tools */}
            <div className="rounded-xl border-0 bg-muted/20 p-4 md:col-span-2">
              <div className="font-medium text-sm mb-2">Windsurf, Cline & Other MCP Clients</div>
              <p className="text-xs text-muted-foreground mb-3">
                Most modern MCP-compatible tools support remote servers. Use the endpoint above and authenticate with <code>Bearer YOUR_KEY</code>.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(`${origin}/api/mcp`);
                    toast.success("Endpoint copied");
                  }}
                >
                  Copy Endpoint
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const text = `Authorization: Bearer YOUR_API_KEY`;
                    navigator.clipboard.writeText(text);
                    toast.success("Header copied");
                  }}
                >
                  Copy Auth Header
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Guidebook */}
        <div className="rounded-xl border-0 bg-muted/10 p-5">
          <p className="font-semibold text-sm mb-3">Guidebook — What You Can Do</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <div className="space-y-1">
              <p className="font-medium text-foreground text-xs uppercase tracking-wider">Available Capabilities</p>
              <ul className="text-xs space-y-0.5 list-disc list-inside">
                <li>Account health & drawdown status</li>
                <li>Trade history & performance metrics</li>
                <li>Risk analysis (Sharpe, Kelly, etc.)</li>
                <li>Journal entries & mood tracking</li>
                <li>Prop firm challenge progress</li>
              </ul>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground text-xs uppercase tracking-wider">Security Best Practices</p>
              <ul className="text-xs space-y-0.5 list-disc list-inside">
                <li>Never share your API key</li>
                <li>Revoke keys you no longer use</li>
                <li>Use descriptive names for each key</li>
                <li>Rotate keys periodically</li>
              </ul>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-4 border-t-0 pt-3">
            Your data stays private. The MCP server only responds to authenticated requests from your own AI tools.
          </p>
        </div>

        {/* Error State (Migration) */}
        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4">
            <p className="font-semibold text-destructive text-sm">Database setup required</p>
            <p className="text-sm text-destructive/90 mt-1">{error}</p>
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={(open) => { setShowCreateDialog(open); if (!open) setCreatedKey(null) }}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full gap-2">
              <Plus className="h-4 w-4" /> Create New API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Give this key a clear name. You will only see the full key once.
              </DialogDescription>
            </DialogHeader>

            {createdKey ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Your new API key:</p>
                  <div className="rounded-xl border-0 bg-muted/40 p-4">
                    <code className="text-xs break-all select-all font-mono block">{createdKey}</code>
                  </div>
                  <p className="text-xs text-destructive mt-2 font-medium">Copy this key now — it will never be shown again.</p>
                </div>

                <div className="rounded-lg border-0 bg-muted/20 p-3 text-xs">
                  <p className="font-semibold mb-1">Next steps:</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
                    <li>Copy the key above</li>
                    <li>Use endpoint: <span className="font-mono">{origin}/api/mcp</span></li>
                    <li>Authenticate with: <code>Bearer YOUR_KEY</code></li>
                  </ol>
                </div>
              </div>
            ) : (
              <>
                <Input
                  placeholder="e.g. Claude Desktop, Jan AI, Trading Bot, Cursor"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                  <Button onClick={handleCreate} disabled={isCreating || !newKeyName.trim()}>
                    {isCreating ? 'Creating...' : 'Create API Key'}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  const t = useI18n()
  const changeLocale = useChangeLocale()
  const currentLocale = useCurrentLocale()
  const user = useUserStore((state) => state.supabaseUser)
  const storedUsername = useUserStore((state) => state.username)
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
  const [username, setUsername] = useState(() => storedUsername ?? '')
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false)
  const [usernameCooldown, setUsernameCooldown] = useState<{ canChange: boolean; remainingDays: number } | null>(null)
  const fullName = user?.user_metadata?.full_name || ''
  const parsedFirstName = fullName.includes(' ') ? fullName.split(' ').slice(0, -1).join(' ') : fullName
  const parsedLastName = fullName.includes(' ') ? fullName.split(' ').slice(-1)[0] : ''
  const [firstName, setFirstName] = useState(() => parsedFirstName)
  const [lastName, setLastName] = useState(() => parsedLastName)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

  useEffect(() => {
    setUsername(storedUsername ?? '')
  }, [storedUsername])

  useEffect(() => {
    getUsernameCooldown().then(setUsernameCooldown).catch(() => {})
  }, [])

  useEffect(() => {
    const fn = user?.user_metadata?.full_name || ''
    setFirstName(fn.includes(' ') ? fn.split(' ').slice(0, -1).join(' ') : fn)
    setLastName(fn.includes(' ') ? fn.split(' ').slice(-1)[0] : '')
  }, [user?.user_metadata?.full_name])

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
    }).catch((error) => {
      if (!isCancelled) {

      }
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

  const handleUpdateUsername = async () => {
    if (usernameCooldown && !usernameCooldown.canChange) {
      toast.error(`Username can be changed again in ${usernameCooldown.remainingDays} days`)
      return
    }
    setIsUpdatingUsername(true)
    try {
      const result = await updateUsernameAction(username)
      if (result.success) {
        toast.success('Username updated successfully')
        useUserStore.setState({ username: username.trim() })
      } else {
        toast.error(result.error || 'Failed to update username')
      }
    } catch {
      toast.error('Failed to update username')
    } finally {
      setIsUpdatingUsername(false)
    }
  }

  const handleUpdateProfile = async () => {
    const combined = `${firstName.trim()} ${lastName.trim()}`.trim()
    if (!combined) {
      toast.error('Name cannot be empty')
      return
    }
    setIsUpdatingProfile(true)
    try {
      const result = await updateUserProfile(combined)
      if (result.success) {
        toast.success('Profile updated successfully')
      } else {
        toast.error(result.error || 'Failed to update profile')
      }
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setIsUpdatingProfile(false)
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
        <Card className="rounded-xl border-0 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('dashboard.profile')}
            </CardTitle>
            <CardDescription className="text-sm">Manage your personal information and account details</CardDescription>
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
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Enter your first name" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Enter your last name" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email || ''} disabled />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <div className="flex gap-2">
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleUpdateUsername}
                    disabled={isUpdatingUsername || !username.trim() || (usernameCooldown !== null && !usernameCooldown.canChange)}
                    size="sm"
                  >
                    {isUpdatingUsername ? 'Updating...' : 'Update'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Unique username for your profile (3-30 characters, letters, numbers, underscores)
                </p>
                {usernameCooldown && !usernameCooldown.canChange && (
                  <p className="text-xs text-amber-500 mt-1">
                    You can change your username again in {usernameCooldown.remainingDays} day{usernameCooldown.remainingDays === 1 ? '' : 's'}
                  </p>
                )}
              </div>
              <Button onClick={handleUpdateProfile} disabled={isUpdatingProfile}>{isUpdatingProfile ? 'Updating...' : 'Update Profile'}</Button>
            </div>
          </CardContent>
        </Card>

        {/* Preferences Section */}
        <Card className="rounded-xl border-0 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription className="text-sm">Customize your dashboard appearance and behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Accent Color Settings */}
            <div>
              <Label className="text-base font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Accent Color
              </Label>
              <div className="mt-2">
                <div className="rounded-md border-0 bg-muted/40 p-3">
                  <p className="mb-3 text-sm text-muted-foreground">
                    Choose your dashboard accent color
                  </p>
                  <div className="flex gap-3">
                    {VALID_DASHBOARD_THEMES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTheme(t)}
                        className="relative flex flex-col items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg p-1"
                        aria-label={`Set accent color to ${THEME_LABELS[t]}`}
                        aria-pressed={theme === t}
                      >
                        <span
                          className={`h-8 w-8 rounded-full transition-[opacity,background-color,border-color] ${theme === t ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110' : 'hover:scale-105'}`}
                          style={{
                            backgroundColor: THEME_PALETTES[t]['--primary'],
                          }}
                        />
                        <span
                          className={`text-xs text-center ${theme === t ? 'text-primary font-medium' : 'text-muted-foreground'}`}
                        >
                          {THEME_LABELS[t]}
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
                    <Button variant="outline" className="w-full sm:w-[200px] justify-start">
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
                    <Button variant="outline" className="w-full sm:w-[200px] justify-start">
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
        <Card className="rounded-xl border-0 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription className="text-sm">Configure how you receive notifications and alerts</CardDescription>
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

        <TeamSettingsCard
          userTeams={userTeams}
          onLeaveTeam={handleLeaveTeam}
          locale={currentLocale}
        />

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

        <ApiKeySection />

        {/* Account Management Section */}
        <Card className="rounded-xl border-0 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Management
            </CardTitle>
            <CardDescription className="text-sm">Manage your account settings and data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <Link href={`/${currentLocale}/dashboard/billing`}>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing & Subscription
                </Button>
              </Link>
              <Link href={`/${currentLocale}/dashboard/data`}>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="mr-2 h-4 w-4" />
                  Data Management
                </Button>
              </Link>
              <Link href={`/${currentLocale}/support`}>
                <Button variant="outline" className="w-full justify-start">
                  <LifeBuoy className="mr-2 h-4 w-4" />
                  Support & Help
                </Button>
              </Link>
              <Separator />
              <Button
                variant="destructive"
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
