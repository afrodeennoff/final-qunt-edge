'use client'

import { useState, useEffect, useCallback } from 'react'
import { useI18n } from "@/locales/client"
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Building2,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Loader2,
  LogIn,
  UserPlus
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { unifiedSectionPanelClassName, unifiedInsetPanelClassName } from '@/components/layout/unified-page-recipes'
import {
  requestToJoinTeam,
  getTeamInvitationDetails,
  getTeamForJoin,
  requestToJoinTeamById
} from '../../dashboard/settings/actions'
import Link from 'next/link'

interface TeamInvitation {
  id: string
  teamId: string
  teamName: string
  email: string
  status: string
  createdAt: string
  expiresAt: string
}

interface TeamPublicInfo {
  id: string
  name: string
  memberCount: number
  createdBy: string
  createdAt: string
}

export default function TeamJoinPage() {
  const t = useI18n()
  const params = useParams<{ locale?: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const locale = params?.locale || 'en'
  const localePrefix = `/${locale}`
  const dashboardRoot = `${localePrefix}/teams/dashboard`

  const invitationToken = searchParams.get('invitation')
  const teamId = searchParams.get('team')
  const mode = invitationToken ? 'invitation' : teamId ? 'team' : 'none'

  const [invitation, setInvitation] = useState<TeamInvitation | null>(null)
  const [teamInfo, setTeamInfo] = useState<TeamPublicInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [joinResult, setJoinResult] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      if (mode === 'invitation' && invitationToken) {
        const result = await getTeamInvitationDetails(invitationToken)
        if (result.success && result.invitation) {
          setInvitation(result.invitation)
        } else {
          setError(result.error || 'Failed to load invitation details')
        }
      } else if (mode === 'team' && teamId) {
        const result = await getTeamForJoin(teamId)
        if (result.success && result.team) {
          setTeamInfo(result.team as TeamPublicInfo)
        } else {
          setError(result.error || 'Team not found')
        }
      } else {
        setError('No invitation or team specified')
      }
    } catch {
      setError('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [mode, invitationToken, teamId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRequestToJoin = async () => {
    setIsJoining(true)
    try {
      if (mode === 'invitation' && invitationToken) {
        const result = await requestToJoinTeam(invitationToken)
        if (result.success) {
          toast.success('Join request sent! Awaiting admin approval.')
          setJoinResult('pending_approval')
          loadData()
        } else {
          if (result.error?.includes('must be logged in')) {
            router.push(`${localePrefix}/authentication?next=${encodeURIComponent(window.location.href)}`)
            return
          }
          toast.error(result.error || 'Failed to send request')
        }
      } else if (mode === 'team' && teamId) {
        const result = await requestToJoinTeamById(teamId)
        if (result.success) {
          toast.success('Join request sent! Awaiting admin approval.')
          setJoinResult('pending_approval')
        } else {
          if (result.error?.includes('must be logged in')) {
            router.push(`${localePrefix}/authentication?next=${encodeURIComponent(window.location.href)}`)
            return
          }
          toast.error(result.error || 'Failed to send request')
        }
      }
    } catch {
      toast.error('Failed to send request')
    } finally {
      setIsJoining(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">{t('teams.management.pending')}</Badge>
      case 'pending_approval':
        return <Badge variant="outline" className="border-warning/40 text-warning">Pending Approval</Badge>
      case 'accepted':
        return <Badge variant="default" className="bg-emerald-500/10 text-emerald-500">{t('teams.invitations.accepted')}</Badge>
      case 'expired':
        return <Badge variant="destructive">{t('teams.invitations.expired')}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-semantic-warning" />
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-semantic-success" />
      case 'expired':
        return <XCircle className="h-5 w-5 text-semantic-error" />
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />
    }
  }

  if (isLoading) {
    return (
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-muted-foreground">{t('teams.join.loading')}</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Card className={cn(unifiedSectionPanelClassName)}>
            <CardHeader className="text-center">
              <XCircle className="h-12 w-12 text-semantic-error mx-auto mb-4" />
              <CardTitle className="text-xl">{t('teams.join.invalid.title')}</CardTitle>
              <CardDescription>
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              {mode === 'team' && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`${localePrefix}/authentication`)}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign in
                </Button>
              )}
              <Link href={dashboardRoot}>
                <Button variant="outline" className="w-full">
                  {t('teams.join.goToManage')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (mode === 'team' && teamInfo) {
    const showRequestBtn = !joinResult
    const showPending = joinResult === 'pending_approval'

    return (
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto">
          <Card className={cn(unifiedSectionPanelClassName)}>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{teamInfo.name}</CardTitle>
              <CardDescription className="text-sm">
                Request to join this trading team
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 pt-4">
              <div className={cn(unifiedInsetPanelClassName, "p-4 space-y-3")}>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Created by</span>
                  <span className="font-medium">{teamInfo.createdBy}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Members</span>
                  <span className="font-medium">{teamInfo.memberCount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{formatDate(teamInfo.createdAt)}</span>
                </div>
              </div>

              <Separator />

              <div className="text-center space-y-3">
                {showRequestBtn && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Click below to send a join request. The team admin will review and approve it.
                    </p>
                    <Button
                      onClick={handleRequestToJoin}
                      disabled={isJoining}
                      size="lg"
                      className="w-full gap-2"
                    >
                      {isJoining ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Requesting...</>
                      ) : (
                        <><UserPlus className="h-4 w-4" /> Request to Join</>
                      )}
                    </Button>
                  </>
                )}

                {showPending && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-warning">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">Request sent! Awaiting admin approval.</span>
                    </div>
                    <Link href={localePrefix}>
                      <Button variant="outline" className="w-full">
                        Go to Dashboard
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Card className={cn(unifiedSectionPanelClassName)}>
            <CardHeader className="text-center">
              <XCircle className="h-12 w-12 text-semantic-error mx-auto mb-4" />
              <CardTitle className="text-xl">{t('teams.join.notFound.title')}</CardTitle>
              <CardDescription>
                {t('teams.join.notFound.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href={dashboardRoot}>
                <Button 
                  variant="outline"
                  className="w-full"
                >
                  {t('teams.join.goToManage')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const isExpired = new Date(invitation.expiresAt) < new Date()
  const canRequest = invitation.status === 'pending' && !isExpired
  const isPendingApproval = invitation.status === 'pending_approval' && !isExpired

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t('teams.join.title')}</h1>
          <p className="text-muted-foreground">
            {t('teams.join.subtitle')}
          </p>
        </div>

        <Card className={cn(unifiedSectionPanelClassName, "max-w-2xl mx-auto")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-xl">{invitation.teamName}</CardTitle>
                <CardDescription>
                  {t('teams.join.details.title')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className={cn(unifiedInsetPanelClassName, "flex items-center justify-between p-4")}>
              <div className="flex items-center gap-3">
                {getStatusIcon(invitation.status)}
                <div>
                  <p className="text-sm font-medium tracking-tight text-foreground">{t('teams.join.status.title')}</p>
                  <p className="text-sm text-muted-foreground">
                    {invitation.status === 'pending' && !isExpired
                      ? t('teams.join.status.ready')
                      : invitation.status === 'pending_approval'
                        ? 'Awaiting admin approval'
                        : invitation.status === 'pending' && isExpired
                          ? t('teams.join.status.expired')
                          : invitation.status === 'accepted'
                            ? t('teams.join.status.accepted')
                            : t('teams.join.status.unknown')
                    }
                  </p>
                </div>
              </div>
              {getStatusBadge(invitation.status)}
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-medium">{t('teams.join.details.title')}</h3>
              <div className="grid gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('teams.join.details.invitedEmail')}</span>
                  <span className="text-sm font-medium text-foreground">{invitation.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('teams.join.details.invitedOn')}</span>
                  <span className="text-sm text-foreground">{formatDate(invitation.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('teams.join.details.expiresOn')}</span>
                  <span className={cn("text-sm font-medium", isExpired ? "text-semantic-error" : "text-foreground")}>
                    {formatDate(invitation.expiresAt)}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="text-center">
              {canRequest ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    {t('teams.join.action.description')}
                  </p>
                  <Button 
                    onClick={handleRequestToJoin}
                    disabled={isJoining}
                    size="lg"
                    className="w-full gap-2"
                  >
                    {isJoining ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Requesting to join...</>
                    ) : (
                      <><UserPlus className="h-4 w-4" /> Request to Join</>
                    )}
                  </Button>
                </div>
              ) : isPendingApproval ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-warning">
                    <AlertCircle className="h-5 w-5" />
                    <span>Your request is pending admin approval</span>
                  </div>
                  <Link href={dashboardRoot}>
                    <Button variant="outline" className="w-full">
                      {t('teams.join.goToManage')}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <XCircle className="h-5 w-5" />
                    <span>
                      {invitation.status === 'accepted'
                        ? t('teams.join.action.alreadyAccepted')
                        : isExpired
                          ? t('teams.join.action.expired')
                          : t('teams.join.action.invalid')
                      }
                    </span>
                  </div>
                  <Link href={dashboardRoot}>
                    <Button variant="outline" className="w-full">
                      {t('teams.join.goToManage')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
