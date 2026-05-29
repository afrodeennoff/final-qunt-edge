'use client'

import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Settings, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  unifiedGhostActionClassName,
  unifiedPrimaryActionClassName,
  unifiedSectionPanelClassName,
} from "@/components/layout/unified-page-recipes"
import { cn } from "@/lib/utils"
import { TeamManagement } from "../../../components/team-management"

export default function TeamMembersPage() {
  const params = useParams<{ slug: string; locale?: string }>()
  const slug = params.slug
  const localePrefix = params.locale ? `/${params.locale}` : ''
  const teamManageHref = `${localePrefix}/teams/manage`
  const analyticsHref = `${localePrefix}/teams/dashboard/${slug}/analytics`

  return (
    <section className="space-y-6">
      <header className={cn(unifiedSectionPanelClassName, 'p-5 sm:p-6')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 text-primary" />
              <p className="text-[10px] font-black uppercase tracking-[0.12em]">Access Control</p>
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Members & Roles</h1>
            <p className="mt-2 max-w-2xl text-sm leading-[1.55] text-muted-foreground">
              Manage invitations, responsibilities, and permission boundaries across the team.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={analyticsHref} className={cn(unifiedGhostActionClassName, 'text-[11px] font-black uppercase tracking-[0.15em]')}>
              Team Analytics
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={teamManageHref} className={cn(unifiedPrimaryActionClassName, 'text-[11px] font-black uppercase tracking-[0.15em]')}>
              <Settings className="h-4 w-4" />
              Manage Team
            </Link>
          </div>
        </div>
      </header>

      <Card variant="default" className="border-border/20">
        <CardContent className="p-4 sm:p-5">
          <TeamManagement />
        </CardContent>
      </Card>
    </section>
  )
}
