import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

function NavbarSkeleton() {
  return (
    <div className="sticky top-0 border-b border-border/20 bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Skeleton className="h-8 w-32" />
          <div className="hidden items-center gap-6 md:flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-4 w-20" />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  )
}

function HeroSkeleton() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl space-y-8 text-center">
          <Skeleton className="mx-auto h-16 w-3/4" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="mx-auto h-8 w-2/3" />
          <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-12 w-48" />
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturesSkeleton() {
  return (
    <section className="bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 space-y-4 text-center">
          <Skeleton className="mx-auto h-10 w-64" />
          <Skeleton className="mx-auto h-5 w-full max-w-2xl" />
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-background">
              <CardContent className="space-y-4 pt-6">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatsSkeleton() {
  return (
    <section className="border-y border-border/20 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2 text-center">
              <Skeleton className="mx-auto h-10 w-20" />
              <Skeleton className="mx-auto h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="space-y-6 py-16 text-center">
            <Skeleton className="mx-auto h-10 w-96" />
            <Skeleton className="mx-auto h-5 w-full max-w-xl" />
            <div className="flex justify-center gap-4 pt-4">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-12 w-40" />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function FooterSkeleton() {
  return (
    <footer className="border-t border-border/20 bg-muted/20 py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/20 pt-8 md:flex-row">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    </footer>
  )
}

export default function LandingLoading() {
  return (
    <div className="min-h-screen bg-background">
      <NavbarSkeleton />
      <main>
        <HeroSkeleton />
        <StatsSkeleton />
        <FeaturesSkeleton />
        <CTASection />
      </main>
      <FooterSkeleton />
    </div>
  )
}
