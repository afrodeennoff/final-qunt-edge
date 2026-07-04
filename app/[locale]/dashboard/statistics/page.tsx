import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const StatisticsClient = dynamic(
  () => import('./components/statistics-client'),
  {
    loading: () => (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-xl bg-background/30 p-4">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-48 w-full" />
          </div>
        ))}
      </div>
    ),
  }
)

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Statistics | Qunt Edge',
    description: 'Performance breakdown by ticker, day, and setup tag.',
    robots: { index: false, follow: false },
  }
}

export default function StatisticsPage() {
  return <StatisticsClient />
}
