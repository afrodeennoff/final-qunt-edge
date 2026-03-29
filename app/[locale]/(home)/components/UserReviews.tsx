import { BadgeV2 } from "@/components/ui/v2"
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Star, Quote } from 'lucide-react'

interface Review {
  id: string
  username: string
  rating: number
  content: string
  date: string
  verified: boolean
}

interface UserReviewsProps {
  reviews?: Review[]
}

function getInitials(username: string): string {
  return username
    .split(/[\s._-]+/)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= rating
              ? 'fill-primary text-primary'
              : 'text-foreground/80'
          }`}
        />
      ))}
    </div>
  )
}

export default function UserReviews({ reviews }: UserReviewsProps) {
  const displayReviews = reviews && reviews.length > 0 ? reviews : []

  return (
    <section id="reviews" className="relative px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <BadgeV2 variant="outline" className="border-primary/40 bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground [font-family:var(--home-copy)]">
            <Star className="mr-1.5 h-3 w-3" />
            Reviews
          </BadgeV2>
          <h2 className="mt-3 text-[clamp(2rem,4.9vw,3.55rem)] font-semibold leading-[0.92] tracking-[-0.028em] [font-family:var(--home-display)]">
            Trusted by serious
            <span className="block text-foreground">discretionary traders</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-[1.78] text-foreground/80 [font-family:var(--home-copy)]">
            Real feedback from verified traders who use Qunt Edge to sharpen their edge every day.
          </p>
        </div>

        {displayReviews.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayReviews.map((review) => (
              <Card
                key={review.id}
                className="group overflow-hidden rounded-2xl border-[hsl(var(--mk-border)/0.35)] bg-[hsl(var(--mk-surface)/0.7)] transition-all duration-300 hover:border-primary/40"
              >
                <CardContent className="flex h-full flex-col p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <StarRating rating={review.rating} />
                    {review.verified && (
                      <BadgeV2 variant="secondary" className="border-primary/30 bg-primary/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] [font-family:var(--home-copy)]">
                        Verified
                      </BadgeV2>
                    )}
                  </div>

                  <div className="relative flex-1">
                    <Quote className="absolute -left-1 -top-1 h-5 w-5 text-foreground/80" />
                    <p className="pl-5 text-sm leading-relaxed text-foreground/85 [font-family:var(--home-copy)]">
                      {review.content}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-3 border-t border-[hsl(var(--mk-border)/0.28)] pt-4">
                    <Avatar className="h-9 w-9 border border-[hsl(var(--mk-border)/0.28)]">
                      <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                        {getInitials(review.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium [font-family:var(--home-display)]">{review.username}</p>
                      <p className="text-[10px] text-foreground/80 [font-family:var(--home-copy)]">{review.date}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl border-[hsl(var(--mk-border)/0.35)] bg-[hsl(var(--mk-surface)/0.7)]">
            <CardContent className="p-6 text-sm text-muted-foreground">
              No live reviews are available right now.
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
