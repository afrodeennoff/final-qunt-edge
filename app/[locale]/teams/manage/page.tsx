import { TeamManagement } from "../components/team-management"
import { unifiedSectionPanelClassName } from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'
import { Building2 } from 'lucide-react'

export default function ManageTeamsPage() {
  return (
    <div className="space-y-6">
      <div className={cn(unifiedSectionPanelClassName, 'p-5 sm:p-6')}>
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Building2 className="h-4 w-4 text-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.12em]">Management</p>
        </div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Manage Teams</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create, configure, and control access to your trading teams. Set up invite links, manage members, and assign roles.
        </p>
      </div>
      <TeamManagement variant="standalone" />
    </div>
  )
}
