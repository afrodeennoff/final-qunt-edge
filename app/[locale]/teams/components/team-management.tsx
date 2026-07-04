'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useI18n } from "@/locales/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
 Building2,
 Plus,
 UserPlus,
 UserMinus,
 Eye,
 Settings,
 XCircle,
 Trash2
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from "@/components/ui/dialog"
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
} from "@/components/ui/alert-dialog"
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select"
import {
 joinTeam,
 leaveTeam,
 getUserTeams,
 addManagerToTeam,
 removeManagerFromTeam,
 updateManagerAccess,
 getUserTeamAccess,
 deleteTeam,
 renameTeam,
 sendTeamInvitation,
 getTeamInvitations,
 removeTraderFromTeam,
 cancelTeamInvitation,
 createTeam
} from '@/app/[locale]/dashboard/settings/actions'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
 unifiedSectionPanelClassName,
 unifiedInsetPanelClassName,
} from '@/components/layout/unified-page-recipes'

const getDisplayName = (user: { email: string; username?: string | null }) => {
	return user.username || user.email.split('@')[0]
}

interface Team {
 id: string
 name: string
 userId: string
 traderIds: string[]
 traders: { id: string; email: string; username: string | null }[]
 managers: { id: string; managerId: string; access: string; email: string; username: string | null }[]
 createdAt: Date | string
 updatedAt: Date | string
 userAccess?: string
}

interface ManagedTeam extends Team {
 userAccess: string
}

interface TeamManagementProps {
 // Event handlers reserved for future use
 onTeamClick?: (team: Team) => void
 onManageClick?: (team: Team) => void
 onViewClick?: (team: Team) => void
}

const TeamManagement = React.memo(function TeamManagement({
 // Event handlers reserved for future use
 // onTeamClick,
 // onManageClick,
 // onViewClick,
}: TeamManagementProps) {

 const pathname = usePathname()
 const router = useRouter()
 const segments = pathname.split('/').filter(Boolean)
 const teamsIndex = segments.indexOf('teams')
 const localePrefix = teamsIndex === 1 ? `/${segments[0]}` : ''
 const teamsRoot = `${localePrefix}/teams`
 const dashboardRoot = `${teamsRoot}/dashboard`
 const [firstTeamId, setFirstTeamId] = useState<string | null>(null);
 const [isRedirecting, setIsRedirecting] = useState(true);

 useEffect(() => {
 let cancelled = false;
 const loadInitialData = async () => {
 if (!pathname.endsWith('/teams/dashboard')) {
 setIsRedirecting(false);
 return;
 }
 try {
 const teamsResult = await getUserTeams()

 if (cancelled) return;

 if (teamsResult.success) {
 if (teamsResult.ownedTeams && teamsResult.ownedTeams.length > 0) {
 setFirstTeamId(teamsResult.ownedTeams[0].id)
 return
 }
 else if (teamsResult.joinedTeams && teamsResult.joinedTeams.length > 0) {
 setFirstTeamId(teamsResult.joinedTeams[0].id)
 return
 }
 }

 const managedResult = await getUserTeamAccess()
 if (cancelled) return;

 if (managedResult.success && managedResult.managedTeams && managedResult.managedTeams.length > 0) {
 setFirstTeamId(managedResult.managedTeams[0].id)
 } else {
 // No teams found — stop redirecting, show the management UI
 setIsRedirecting(false);
 }
 } catch {
 // On error, stop redirecting and show management UI
 setIsRedirecting(false);
 }
 }
 loadInitialData()
 return () => { cancelled = true; }
 }, [pathname])

 useEffect(() => {
 if (firstTeamId && pathname.endsWith('/teams/dashboard')) {
 router.replace(`${dashboardRoot}/${firstTeamId}`)
 // Mark redirect as done — the route change will trigger a re-render
 // and the first useEffect will set isRedirecting(false when the path changes)
 const timeout = setTimeout(() => setIsRedirecting(false), 3000)
 return () => clearTimeout(timeout)
 } else if (!firstTeamId) {
 setIsRedirecting(false);
 }
 }, [firstTeamId, dashboardRoot, pathname, router])
 const t = useI18n()

 // State
 const [userTeams, setUserTeams] = useState<{
 ownedTeams: Team[]
 joinedTeams: Team[]
 }>({ ownedTeams: [], joinedTeams: [] })

 const [managedTeams, setManagedTeams] = useState<ManagedTeam[]>([])
 const [isLoading, setIsLoading] = useState(true)

 // Dialog states
 const [createDialogOpen, setCreateDialogOpen] = useState(false)
 const [joinDialogOpen, setJoinDialogOpen] = useState(false)
 const [manageDialogOpen, setManageDialogOpen] = useState(false)
 const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

 // Form states
 const [newTeamName, setNewTeamName] = useState('')
 const [joinTeamId, setJoinTeamId] = useState('')
 const [newManagerEmail, setNewManagerEmail] = useState('')
 const [newManagerAccess, setNewManagerAccess] = useState<'admin' | 'viewer'>('viewer')
 const [renameTeamName, setRenameTeamName] = useState('')
 const [newTraderEmail, setNewTraderEmail] = useState('')
 const [isSubmitting, setIsSubmitting] = useState(false)
 const [pendingInvitations, setPendingInvitations] = useState<Array<{ id: string; email: string; status: string; createdAt: Date | string; expiresAt: Date | string; username?: null }>>([])

  // Cache for team data to avoid duplicate fetches
  const teamDataCache = useRef<{ teams: typeof userTeams; managed: ManagedTeam[] } | null>(null)

  // Load data on component mount
  useEffect(() => {
  let isMounted = true

  if (!teamDataCache.current) {
    loadTeamData()
  } else {
    setUserTeams(teamDataCache.current.teams)
    setManagedTeams(teamDataCache.current.managed)
    setIsLoading(false)
  }

  return () => {
    isMounted = false
  }
  }, [])

  async function loadTeamData() {
  setIsLoading(true)
  try {
  // Load owned and joined teams
  const teamsResult = await getUserTeams()
  if (teamsResult.success) {
  const teams = {
  ownedTeams: teamsResult.ownedTeams || [],
  joinedTeams: teamsResult.joinedTeams || [],
  }
  setUserTeams(teams)

  // Load managed teams
  const managedResult = await getUserTeamAccess()
  const managed = managedResult.managedTeams || []

  if (managedResult.success) {
  setManagedTeams(managed)
  }

  teamDataCache.current = { teams, managed }
  } else {
  // If getUserTeams fails, still try managed teams
  const managedResult = await getUserTeamAccess()
  if (managedResult.success) {
  const managed = managedResult.managedTeams || []
  setManagedTeams(managed)
  teamDataCache.current = { teams: { ownedTeams: [], joinedTeams: [] }, managed }
  }
  }
  } catch {

  toast.error(t('dashboard.teams.error'))
  } finally {
  setIsLoading(false)
  setIsRedirecting(false)
  }
  }

 const handleCreateTeam = async () => {
 if (!newTeamName.trim()) {
 toast.error(t('teams.rename.nameRequired'))
 return
 }

 setIsSubmitting(true)
 try {
 const result = await createTeam(newTeamName.trim())
 if (result.success) {
 toast.success(t('teams.management.createTeamTitle') + ' - ' + t('teams.rename.success'))
 setCreateDialogOpen(false)
 setNewTeamName('')
 await loadTeamData()
 } else {
 toast.error(result.error || t('dashboard.teams.error'))
 }
 } catch {

 toast.error(t('dashboard.teams.error'))
 } finally {
 setIsSubmitting(false)
 }
 }

 const handleJoinTeam = async () => {
 if (!joinTeamId.trim()) {
 toast.error('Team ID is required')
 return
 }

 setIsSubmitting(true)
 try {
 const result = await joinTeam(joinTeamId.trim())
 if (result.success) {
 toast.success('Joined team successfully')
 setJoinDialogOpen(false)
 setJoinTeamId('')
 await loadTeamData()
 } else {
 toast.error(result.error || t('dashboard.teams.error'))
 }
 } catch {

 toast.error(t('dashboard.teams.error'))
 } finally {
 setIsSubmitting(false)
 }
 }

 const handleLeaveTeam = async (teamId: string) => {
 try {
 const result = await leaveTeam(teamId)
 if (result.success) {
 toast.success(t('dashboard.teams.leaveSuccess'))
 await loadTeamData()
 } else {
 toast.error(result.error || t('dashboard.teams.error'))
 }
 } catch {

 toast.error(t('dashboard.teams.error'))
 }
 }

 const handleAddManager = async () => {
 if (!newManagerEmail.trim()) {
 toast.error(t('dashboard.teams.managerEmail'))
 return
 }

 if (!selectedTeam) return

 setIsSubmitting(true)
 try {
 const result = await addManagerToTeam(selectedTeam.id, newManagerEmail.trim(), newManagerAccess)
 if (result.success) {
 toast.success(t('dashboard.teams.managerAdded'))

 // Update the selected team locally
 const newManager = {
 id: `temp-${Date.now()}`, // Temporary ID
 managerId: 'temp-manager-id', // This will be updated when we reload the data
 access: newManagerAccess,
 email: newManagerEmail.trim(),
 username: null as string | null,
 }

 const updatedSelectedTeam = {
 ...selectedTeam,
 managers: [...selectedTeam.managers, newManager]
 }
 setSelectedTeam(updatedSelectedTeam)

 // Update the teams in the main state to keep everything in sync
 setUserTeams(prev => ({
 ownedTeams: prev.ownedTeams.map(team =>
 team.id === selectedTeam.id
 ? updatedSelectedTeam
 : team
 ),
 joinedTeams: prev.joinedTeams.map(team =>
 team.id === selectedTeam.id
 ? updatedSelectedTeam
 : team
 )
 }))

 setManagedTeams(prev =>
 prev.map(team =>
 team.id === selectedTeam.id
 ? { ...updatedSelectedTeam, userAccess: team.userAccess }
 : team
 )
 )

 setNewManagerEmail('')
 setNewManagerAccess('viewer')

 // Note: We don't reload data immediately to keep the dialog open
 // Data will be refreshed when the dialog is closed or when needed
 } else {
 toast.error(result.error || t('dashboard.teams.error'))
 }
 } catch {

 toast.error(t('dashboard.teams.error'))
 } finally {
 setIsSubmitting(false)
 }
 }

 const handleRemoveManager = async (managerId: string) => {
 if (!selectedTeam) return

 try {
 const result = await removeManagerFromTeam(selectedTeam.id, managerId)
 if (result.success) {
 toast.success(t('dashboard.teams.managerRemoved'))

 // Update the selected team locally
 const updatedSelectedTeam = {
 ...selectedTeam,
 managers: selectedTeam.managers.filter(manager => manager.managerId !== managerId)
 }
 setSelectedTeam(updatedSelectedTeam)

 // Update the teams in the main state to keep everything in sync
 setUserTeams(prev => ({
 ownedTeams: prev.ownedTeams.map(team =>
 team.id === selectedTeam.id
 ? updatedSelectedTeam
 : team
 ),
 joinedTeams: prev.joinedTeams.map(team =>
 team.id === selectedTeam.id
 ? updatedSelectedTeam
 : team
 )
 }))

 setManagedTeams(prev =>
 prev.map(team =>
 team.id === selectedTeam.id
 ? { ...updatedSelectedTeam, userAccess: team.userAccess }
 : team
 )
 )

 // Note: We don't reload data immediately to keep the dialog open
 // Data will be refreshed when the dialog is closed
 } else {
 toast.error(result.error || t('dashboard.teams.error'))
 }
 } catch {

 toast.error(t('dashboard.teams.error'))
 }
 }

 const handleUpdateManagerAccess = async (managerId: string, access: 'admin' | 'viewer') => {
 if (!selectedTeam) return

 try {
 const result = await updateManagerAccess(selectedTeam.id, managerId, access)
 if (result.success) {
 toast.success(t('dashboard.teams.accessUpdated'))

 // Update the selected team locally
 const updatedSelectedTeam = {
 ...selectedTeam,
 managers: selectedTeam.managers.map(manager =>
 manager.managerId === managerId
 ? { ...manager, access }
 : manager
 )
 }
 setSelectedTeam(updatedSelectedTeam)

 // Update the teams in the main state to keep everything in sync
 setUserTeams(prev => ({
 ownedTeams: prev.ownedTeams.map(team =>
 team.id === selectedTeam.id
 ? updatedSelectedTeam
 : team
 ),
 joinedTeams: prev.joinedTeams.map(team =>
 team.id === selectedTeam.id
 ? updatedSelectedTeam
 : team
 )
 }))

 setManagedTeams(prev =>
 prev.map(team =>
 team.id === selectedTeam.id
 ? { ...updatedSelectedTeam, userAccess: team.userAccess }
 : team
 )
 )

 // Note: We don't reload data immediately to keep the dialog open
 // Data will be refreshed when the dialog is closed or when needed
 } else {
 toast.error(result.error || t('dashboard.teams.error'))
 }
 } catch {

 toast.error(t('dashboard.teams.error'))
 }
 }

 const handleDeleteTeam = async (teamId: string) => {
 try {
 const result = await deleteTeam(teamId)
 if (result.success) {
 toast.success('Team deleted successfully')
 await loadTeamData()
 } else {
 toast.error(result.error || 'Failed to delete team')
 }
 } catch {

 toast.error('Failed to delete team')
 }
 }

 const handleRenameTeam = async () => {
 if (!selectedTeam || !renameTeamName.trim()) {
 toast.error(t('teams.rename.nameRequired'))
 return
 }

 setIsSubmitting(true)
 try {
 const result = await renameTeam(selectedTeam.id, renameTeamName.trim())
 if (result.success) {
 toast.success(t('teams.rename.success'))

 // Update the selected team name locally
 const updatedSelectedTeam = {
 ...selectedTeam,
 name: renameTeamName.trim()
 }
 setSelectedTeam(updatedSelectedTeam)

 // Update the teams in the main state to keep everything in sync
 setUserTeams(prev => ({
 ownedTeams: prev.ownedTeams.map(team =>
 team.id === selectedTeam.id
 ? updatedSelectedTeam
 : team
 ),
 joinedTeams: prev.joinedTeams.map(team =>
 team.id === selectedTeam.id
 ? updatedSelectedTeam
 : team
 )
 }))

 setManagedTeams(prev =>
 prev.map(team =>
 team.id === selectedTeam.id
 ? { ...updatedSelectedTeam, userAccess: team.userAccess }
 : team
 )
 )

 // Keep the modal open and reset the rename input
 setRenameTeamName('')
 } else {
 toast.error(result.error || t('teams.rename.error'))
 }
 } catch {

 toast.error(t('teams.rename.error'))
 } finally {
 setIsSubmitting(false)
 }
 }

 const handleAddTrader = async () => {
 if (!selectedTeam || !newTraderEmail.trim()) {
 toast.error(t('teams.traders.add.emailRequired'))
 return
 }

 setIsSubmitting(true)
 try {
 const result = await sendTeamInvitation(selectedTeam.id, newTraderEmail.trim())
 if (result.success) {
 toast.success(t('teams.invitations.sent'))
 setNewTraderEmail('')
 // Only reload pending invitations, no need to reload all team data
 await loadPendingInvitations()
 } else {
 toast.error(result.error || t('teams.traders.add.error'))
 }
 } catch {

 toast.error(t('teams.traders.add.error'))
 } finally {
 setIsSubmitting(false)
 }
 }

 const loadPendingInvitations = async () => {
 if (!selectedTeam) return

 try {
 const result = await getTeamInvitations(selectedTeam.id)
 if (result.success) {
 setPendingInvitations(result.invitations || [])
 }
 } catch {

 }
 }

 const handleRemoveTrader = async (traderId: string) => {
 if (!selectedTeam) return

 try {
 const removeResult = await removeTraderFromTeam(selectedTeam.id, traderId)
 if (removeResult.success) {
 toast.success('Trader removed successfully')

 // Update the selected team locally
 const updatedSelectedTeam = {
 ...selectedTeam,
 traderIds: selectedTeam.traderIds.filter(id => id !== traderId),
 traders: selectedTeam.traders.filter(trader => trader.id !== traderId)
 }
 setSelectedTeam(updatedSelectedTeam)

 // Update the teams in the main state to keep everything in sync
 setUserTeams(prev => ({
 ownedTeams: prev.ownedTeams.map(team =>
 team.id === selectedTeam.id
 ? updatedSelectedTeam
 : team
 ),
 joinedTeams: prev.joinedTeams.map(team =>
 team.id === selectedTeam.id
 ? updatedSelectedTeam
 : team
 )
 }))

 setManagedTeams(prev =>
 prev.map(team =>
 team.id === selectedTeam.id
 ? { ...updatedSelectedTeam, userAccess: team.userAccess }
 : team
 )
 )
 } else {
 toast.error(removeResult.error || t('dashboard.teams.error'))
 }
 } catch {

 toast.error(t('dashboard.teams.error'))
 }
 }

 const handleCancelInvitation = async (invitationId: string) => {
 if (!selectedTeam) return

 try {
 const cancelResult = await cancelTeamInvitation(selectedTeam.id, invitationId)
 if (cancelResult.success) {
 toast.success('Invitation canceled successfully')
 await loadPendingInvitations()
 } else {
 toast.error(cancelResult.error || t('dashboard.teams.error'))
 }
 } catch {

 toast.error(t('dashboard.teams.error'))
 }
 }

  const getStatusIndicator = (access: string, isOwner: boolean) => {
    if (isOwner) return 'bg-warning'
    if (access === 'admin') return 'bg-primary'
    return 'bg-success'
  }

 const getAccessLabel = (access: string, isOwner: boolean) => {
 if (isOwner) {
 return t('dashboard.teams.owner')
 }
 switch (access) {
 case 'admin':
 return t('dashboard.teams.admin')
 case 'viewer':
 return t('dashboard.teams.viewer')
 default:
 return access
 }
 }

 const formatDate = (date: Date | string | unknown) => {
 if (date instanceof Date) {
 return date.toLocaleDateString()
 }
 if (typeof date === 'string') {
 return new Date(date).toLocaleDateString()
 }
 return 'Unknown date'
 }

 // Deduplicate teams to prevent showing the same team twice
 const allTeams = new Map<string, Team>()

 // Add owned teams first (highest priority)
 userTeams.ownedTeams.forEach(team => {
 allTeams.set(team.id, { ...team, userAccess: 'admin' })
 })

 // Add joined teams (medium priority)
 userTeams.joinedTeams.forEach(team => {
 if (!allTeams.has(team.id)) {
 allTeams.set(team.id, { ...team, userAccess: 'viewer' })
 }
 })

 // Add managed teams (lowest priority - only if not already added)
 managedTeams.forEach(team => {
 if (!allTeams.has(team.id)) {
 allTeams.set(team.id, team)
 }
 })

 const filteredTeams = Array.from(allTeams.values())

 if (isLoading || isRedirecting) {
  return (
  <div className="container mx-auto py-8 px-4">
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {[1,2,3].map(i => (
    <div key={i} className="rounded-xl border-0 bg-gradient-to-br from-card/50 to-card/10 p-5 animate-pulse">
      <div className="h-4 bg-muted/40 rounded w-3/4 mb-3" />
      <div className="h-3 bg-muted/30 rounded w-1/2 mb-2" />
      <div className="h-3 bg-muted/30 rounded w-2/3 mb-4" />
      <div className="h-8 bg-muted/40 rounded w-full" />
    </div>
  ))}
  </div>
  </div>
  )
  }

 return (
 <div className="mx-auto py-4">
 {/* Header */}
  <div className={cn(unifiedSectionPanelClassName, 'mb-5 p-5 sm:p-6')}>
 <h1 className="text-2xl font-black tracking-tight text-foreground">{t('teams.management.component.title')}</h1>
 <p className="text-muted-foreground mt-2 text-sm">{t('teams.management.component.description')}</p>
 </div>

 {/* Teams Grid */}
 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
 {filteredTeams.map((team) => {
 const isOwner = userTeams.ownedTeams.some(b => b.id === team.id)
 const isJoined = userTeams.joinedTeams.some(b => b.id === team.id)
 const isManaged = managedTeams.some(b => b.id === team.id)
 const access = team.userAccess || (isOwner ? 'admin' : 'viewer')
 const isActive = pathname.includes(`/teams/dashboard/${team.id}`)

  return (
   <Card
     key={team.id}
     variant="default"
     className={cn(
       "rounded-xl border-0 bg-gradient-to-br from-card/50 to-card/10 transition-all duration-200 hover:ring-1 hover:ring-primary/20",
       selectedTeam?.id === team.id && "ring-2 ring-primary/35"
     )}
   >
 <CardHeader className="pb-3">
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-3 min-w-0 flex-1">
 <div className={cn("rounded-full h-2 w-2 shrink-0",
 getStatusIndicator(access, isOwner)
 )} />
 <div className="min-w-0 flex-1">
 <CardTitle className={cn("text-sm truncate flex items-center gap-2 text-foreground",
 isActive &&"text-primary"
 )}>
 {team.name}
 {isActive && (
 <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">
 {t('teams.management.active')}
 </Badge>
 )}
 </CardTitle>
 <p className="text-xs text-muted-foreground mt-1">
 {getAccessLabel(access, isOwner)}
 </p>
 </div>
 </div>
 </div>
 </CardHeader>
 <CardContent className="pt-0 space-y-3">
 <div className="flex justify-between items-baseline text-sm">
 <span className="text-muted-foreground">{t('dashboard.teams.traders')}</span>
 <span className="font-medium">{team.traderIds.length}</span>
 </div>

 <div className="flex justify-between items-baseline text-sm">
 <span className="text-muted-foreground">{t('teams.management.created')}</span>
 <span className="text-xs">{formatDate(team.createdAt)}</span>
 </div>

 <Separator />

 <div className="flex gap-2 flex-wrap">
 {/* Manage button - only for owners and admins */}
 {(isOwner || access === 'admin') && (
 <Button 
 variant="outline"
 size="sm"
 className="flex-1 text-xs"
 onClick={async () => {
 setSelectedTeam(team)
 setRenameTeamName(team.name)
 setManageDialogOpen(true)
   // Load pending invitations when dialog opens
   await loadPendingInvitations()
 }}
 >
 <Settings className="h-3 w-3 mr-1" />
 {t('teams.management.manage')}
 </Button>
 )}

 {/* View button - for all team members (owners, admins, regular members, managed teams) */}
 {(isOwner || isJoined || isManaged) && (
 <Button 
 asChild
 variant="outline"
 size="sm"
 className="flex-1 text-xs"
 >
 <Link href={`${dashboardRoot}/${team.id}`} className="flex items-center">
 <Eye className="h-3 w-3 mr-1" />
 {t('teams.dashboard.view')}
 </Link>
 </Button>
 )}

 {/* Delete button - only for owners */}
 {isOwner && (
 <AlertDialog>
 <AlertDialogTrigger asChild>
 <Button variant="destructive" size="sm" className="flex-1 text-xs">
 <Trash2 className="h-3 w-3 mr-1" />
 {t('teams.management.delete')}
 </Button>
 </AlertDialogTrigger>
 <AlertDialogContent className="w-[95vw] sm:w-full">
 <AlertDialogHeader>
 <AlertDialogTitle>{t('teams.management.deleteTeam')}</AlertDialogTitle>
 <AlertDialogDescription>
 {t('teams.management.deleteConfirm').replace('{name}', team.name)}
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
 <AlertDialogAction
 onClick={() => handleDeleteTeam(team.id)}
 className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
 >
 {t('teams.management.deleteTeam')}
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 )}

 {/* Leave button - for joined/managed teams that are not owners */}
 {(isJoined || isManaged) && !isOwner && (
 <AlertDialog>
 <AlertDialogTrigger asChild>
 <Button variant="outline" size="sm" className="flex-1 text-xs">
 <UserMinus className="h-3 w-3 mr-1" />
 {t('teams.management.leave')}
 </Button>
 </AlertDialogTrigger>
 <AlertDialogContent className="w-[95vw] sm:w-full">
 <AlertDialogHeader>
 <AlertDialogTitle>{t('teams.management.leave')}</AlertDialogTitle>
 <AlertDialogDescription>
 {t('teams.management.leaveConfirm')}
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
 <AlertDialogAction
 onClick={() => handleLeaveTeam(team.id)}
 className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
 >
 {t('teams.management.leave')}
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 )}
 </div>
 </CardContent>
 </Card>
 )
 })}

  {/* Create New Team Card - only show if there's at least one team */}
  {filteredTeams.length > 0 && (
   <Card
     variant="outlined"
     className="cursor-pointer border-dashed border-2 border-primary/12 bg-primary/5 hover:border-primary/30 hover:bg-primary/8 transition-[background-color,border-color] duration-200 ease-[0.22,1,0.36,1]"
     onClick={() => setCreateDialogOpen(true)}
   >
  <CardContent className="flex flex-col items-center justify-center h-48 p-6">
  <Plus className="h-12 w-12 text-muted-foreground mb-4" />
  <CardTitle className="text-lg text-center mb-2">
  {t('teams.management.component.createButtonText')}
  </CardTitle>
  <p className="text-sm text-muted-foreground text-center">
  {t('teams.management.createTeamDescription')}
  </p>
  </CardContent>
  </Card>
  )}
  </div>

 {/* Empty State */}
  {filteredTeams.length === 0 && (
  <div className={cn(unifiedSectionPanelClassName, "flex flex-col items-center justify-center py-16 px-4")}>
 <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
 <h3 className="text-lg font-semibold mb-2 text-foreground">
 {t('teams.management.component.emptyStateMessage')}
 </h3>
 <p className="text-muted-foreground mb-4">
 {t('teams.management.getStarted')}
 </p>
  <Button onClick={() => setCreateDialogOpen(true)}>
  <Plus className="h-4 w-4 mr-2" />
  {t('teams.management.component.createButtonText')}
  </Button>
 </div>
 )}

 {/* Manage Team Dialog */}
 <Dialog open={manageDialogOpen} onOpenChange={(open) => {
 setManageDialogOpen(open)
 // Refresh data when dialog is closed to get updated manager IDs
 if (!open) {
 loadTeamData()
 }
 }}>
 <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col w-[95vw] sm:w-full">
 <DialogHeader className="shrink-0">
 <DialogTitle>{t('teams.management.manageTitle').replace('{name}', selectedTeam?.name || '')}</DialogTitle>
 <DialogDescription>
 {t('teams.management.manageDescription')}
 </DialogDescription>
 </DialogHeader>

 <div className="space-y-6 overflow-y-auto flex-1 pr-2 -mr-2 px-1">
  {/* Rename Team Section */}
  <div className={cn(unifiedInsetPanelClassName, "p-4 space-y-3")}>
  <h4 className="font-medium mb-3">{t('teams.rename.title')}</h4>
 <div className="flex gap-2">
 <Input
 placeholder={t('teams.rename.placeholder')}
 value={renameTeamName}
 onChange={(e) => setRenameTeamName(e.target.value)}
 className="flex-1"
 />
 <Button 
 onClick={handleRenameTeam}
 disabled={isSubmitting || !renameTeamName.trim()}
 size="sm"
 >
 {isSubmitting ? t('teams.management.saving') : t('teams.management.rename')}
 </Button>
 </div>
 </div>

 <Separator />

 {/* Traders Section */}
 <div>
 <h4 className="font-medium mb-3">{t('teams.traders')}</h4>

  {/* Current Traders */}
  <div className={cn(unifiedInsetPanelClassName, "p-4 space-y-3")}>
  <h5 className="text-sm font-medium text-muted-foreground mb-2">{t('teams.traders.current')}</h5>
 <div className="space-y-2">
 {(selectedTeam?.traders.length || 0) === 0 ? (
 <p className="text-sm text-muted-foreground">{t('teams.traders.noTraders')}</p>
 ) : (
 <div className="space-y-1">
 {selectedTeam?.traders.map((trader: { id: string; email: string }) => (
<div key={trader.id} className="flex items-center justify-between rounded-xl bg-card border-0 p-3 hover:bg-muted/10 transition-colors duration-150 text-sm">
  <span>{getDisplayName(trader)}</span>
 <div className="flex items-center gap-2">
 <Badge variant="outline">{t('teams.management.member')}</Badge>
 <AlertDialog>
           <AlertDialogTrigger asChild>
           <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground" aria-label="Remove trader">
           <UserMinus className="h-3 w-3" />
           </Button>
           </AlertDialogTrigger>
           <AlertDialogContent className="w-[95vw] sm:w-full">
           <AlertDialogHeader>
           <AlertDialogTitle>{t('teams.management.removeTrader')}</AlertDialogTitle>
 <AlertDialogDescription>
 {t('teams.management.removeTraderConfirm').replace('{email}', getDisplayName(trader))}
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
 <AlertDialogAction
 onClick={() => handleRemoveTrader(trader.id)}
 className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
 >
 {t('teams.management.removeTraderAction')}
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

  <div className={cn(unifiedInsetPanelClassName, "p-4 space-y-3")}>
  {/* Add New Trader */}
  <div>
  <h5 className="text-sm font-medium text-muted-foreground mb-2">{t('teams.traders.addNew')}</h5>
 <p className="text-sm text-muted-foreground mb-3">
 {t('teams.traders.add.description')}
 </p>
 <div className="flex gap-2">
 <Input
 placeholder={t('teams.traders.add.placeholder')}
 value={newTraderEmail}
 onChange={(e) => setNewTraderEmail(e.target.value)}
 className="flex-1"
 />
   <Button 
   onClick={handleAddTrader}
   disabled={isSubmitting || !newTraderEmail.trim()}
   size="sm"
   aria-label="Add trader"
   >
   {isSubmitting ? t('teams.management.saving') : <UserPlus className="h-4 w-4" />}
   </Button>
   </div>
   </div>

   {/* Pending Invitations */}
 <div className="mt-4">
 <h5 className="text-sm font-medium text-muted-foreground mb-2">{t('teams.invitations.pending')}</h5>
 {pendingInvitations.length === 0 ? (
 <p className="text-sm text-muted-foreground">{t('teams.management.noPendingInvitations')}</p>
 ) : (
 <div className="space-y-1">
 {pendingInvitations.map((invitation) => (
<div key={invitation.id} className="flex items-center justify-between rounded-xl bg-card border-0 p-3 hover:bg-muted/10 transition-colors duration-150 text-sm">
  <span>{getDisplayName(invitation)}</span>
 <div className="flex items-center gap-2">
 <Badge variant="outline">{t('teams.management.pending')}</Badge>
 <AlertDialog>
   <AlertDialogTrigger asChild>
   <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground" aria-label="Cancel invitation">
   <XCircle className="h-3 w-3" />
   </Button>
   </AlertDialogTrigger>
   <AlertDialogContent className="w-[95vw] sm:w-full">
   <AlertDialogHeader>
   <AlertDialogTitle>{t('teams.management.cancelInvitation')}</AlertDialogTitle>
 <AlertDialogDescription>
 {t('teams.management.cancelInvitationConfirm').replace('{email}', getDisplayName(invitation))}
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
 <AlertDialogAction
 onClick={() => handleCancelInvitation(invitation.id)}
 className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
 >
 {t('teams.management.cancelInvitationAction')}
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </div>
 </div>
 ))}
 </div>
  )}
  </div>
  </div>
  </div>

  <Separator />

  {/* Managers Section */}
 <div>
 <h4 className="font-medium mb-3">{t('teams.managers')}</h4>

  {/* Current Managers */}
  <div className={cn(unifiedInsetPanelClassName, "p-4 space-y-3")}>
  <h5 className="text-sm font-medium text-muted-foreground mb-2">{t('teams.managers.current')}</h5>
 <div className="space-y-2">
 {(selectedTeam?.managers.length || 0) === 0 ? (
 <p className="text-sm text-muted-foreground">{t('teams.managers.noManagers')}</p>
 ) : (
 <div className="space-y-1">
 {selectedTeam?.managers.map((manager) => (
<div key={manager.id} className="flex items-center justify-between rounded-xl bg-card border-0 p-3 hover:bg-muted/10 transition-colors duration-150 text-sm">
  <span>{getDisplayName(manager)}</span>
 <div className="flex items-center gap-2">
 <Badge variant="outline">
 {manager.access === 'admin' ? t('dashboard.teams.admin') : t('dashboard.teams.viewer')}
 </Badge>
 <Select
 value={manager.access}
 onValueChange={(value: 'admin' | 'viewer') => handleUpdateManagerAccess(manager.managerId, value)}
 >
 <SelectTrigger className="w-20 h-6 text-xs">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="viewer">{t('dashboard.teams.viewer')}</SelectItem>
 <SelectItem value="admin">{t('dashboard.teams.admin')}</SelectItem>
 </SelectContent>
 </Select>
 <AlertDialog>
   <AlertDialogTrigger asChild>
   <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground" aria-label="Remove manager">
   <UserMinus className="h-3 w-3" />
   </Button>
   </AlertDialogTrigger>
   <AlertDialogContent className="w-[95vw] sm:w-full">
   <AlertDialogHeader>
   <AlertDialogTitle>{t('teams.management.removeManager')}</AlertDialogTitle>
 <AlertDialogDescription>
 {t('teams.management.removeManagerConfirm').replace('{email}', getDisplayName(manager))}
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
 <AlertDialogAction
 onClick={() => handleRemoveManager(manager.managerId)}
 className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
 >
 {t('teams.management.removeManagerAction')}
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

  {/* Add New Manager */}
  <div className={cn(unifiedInsetPanelClassName, "p-4 space-y-3")}>
  <h5 className="text-sm font-medium text-muted-foreground mb-2">{t('teams.managers.addNew')}</h5>
 <div className="flex gap-2">
 <Input
 placeholder={t('dashboard.teams.managerEmail')}
 value={newManagerEmail}
 onChange={(e) => setNewManagerEmail(e.target.value)}
 className="flex-1"
 />
 <Select value={newManagerAccess} onValueChange={(value: 'admin' | 'viewer') => setNewManagerAccess(value)}>
 <SelectTrigger className="w-32">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="viewer">{t('dashboard.teams.viewer')}</SelectItem>
 <SelectItem value="admin">{t('dashboard.teams.admin')}</SelectItem>
 </SelectContent>
 </Select>
   <Button onClick={handleAddManager} disabled={isSubmitting} aria-label="Add manager">
   {isSubmitting ? t('teams.management.saving') : <UserPlus className="h-4 w-4" />}
   </Button>
   </div>
    </div>
    </div>
    </div>

   <DialogFooter className="shrink-0 mt-4">
 <Button variant="outline" onClick={() => setManageDialogOpen(false)}>
 {t('teams.management.close')}
 </Button>
 </DialogFooter>
 </DialogContent>
  </Dialog>

  {/* Create Team Dialog */}
  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
  <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
  <DialogHeader>
  <DialogTitle>{t('teams.management.createTeamTitle')}</DialogTitle>
  <DialogDescription>
  {t('teams.management.createTeamDialogDescription')}
  </DialogDescription>
  </DialogHeader>
  <div className="space-y-4">
  <div>
  <Label htmlFor="team-name">{t('teams.management.teamName')}</Label>
  <Input
  id="team-name"
  value={newTeamName}
  onChange={(e) => setNewTeamName(e.target.value)}
  placeholder={t('teams.management.enterTeamName')}
  />
  </div>
  </div>
  <DialogFooter>
  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
  {t('teams.management.cancel')}
  </Button>
  <Button onClick={handleCreateTeam} disabled={isSubmitting}>
  {isSubmitting ? t('teams.management.saving') : t('teams.management.createTeamTitle')}
  </Button>
  </DialogFooter>
  </DialogContent>
  </Dialog>
  </div>
  )
})

export { TeamManagement } 
