import dynamic from 'next/dynamic'
import ProblemStatement from './ProblemStatement'
import Features from './Features'
import TrustAndProof from './TrustAndProof'
import OnboardingJourney from './OnboardingJourney'

const SectionSkeleton = () => <div className="min-h-24 w-full" />

const HowItWorks = dynamic(() => import('./HowItWorks'), { loading: SectionSkeleton })
const AnalysisDemo = dynamic(() => import('./AnalysisDemo'), { loading: SectionSkeleton })
const WhyChooseUs = dynamic(() => import('./WhyChooseUs'), { loading: SectionSkeleton })
const ComparisonSection = dynamic(() => import('./ComparisonSection'), { loading: SectionSkeleton })
const DealsPreview = dynamic(() => import('./DealsPreview'), { loading: SectionSkeleton })
const LeaderboardPreview = dynamic(() => import('./LeaderboardPreview'), { loading: SectionSkeleton })
const UserReviews = dynamic(() => import('./UserReviews'), { loading: SectionSkeleton })
const FeaturedFirms = dynamic(() => import('./FeaturedFirms'), { loading: SectionSkeleton })
const FAQSection = dynamic(() => import('./FAQSection'), { loading: SectionSkeleton })
const PricingSection = dynamic(() => import('./PricingSection'), { loading: SectionSkeleton })
const CTA = dynamic(() => import('./CTA'), { loading: SectionSkeleton })
const Footer = dynamic(() => import('./Footer'), { loading: SectionSkeleton })

export default function DeferredHomeSections({ locale }: { locale: string }) {
  return (
    <>
      <ProblemStatement />
      <Features />
      <HowItWorks />
      <OnboardingJourney />
      <AnalysisDemo />
      <WhyChooseUs />
      <TrustAndProof />
      <ComparisonSection />
      <DealsPreview locale={locale} />
      <LeaderboardPreview locale={locale} />
      <UserReviews locale={locale} />
      <FeaturedFirms locale={locale} />
      <PricingSection />
      <FAQSection locale={locale} />
      <CTA />
      <Footer />
    </>
  )
}
