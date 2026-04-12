import { TeamManagement } from "../components/team-management"

interface DashboardPageProps {
  params: Promise<{
    locale: string
  }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  await params

  return (
    <section className="space-y-6">
      <TeamManagement />
    </section>
  )
}
