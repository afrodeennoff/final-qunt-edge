import dynamic from 'next/dynamic'
import ProblemStatement from './ProblemStatement'
import TrustAndProof from './TrustAndProof'
import OnboardingJourney from './OnboardingJourney'

const SectionSkeleton = () => <div className="min-h-24 w-full" />

const HowItWorks = dynamic(() => import('./HowItWorks'), { loading: SectionSkeleton })
const AnalysisDemo = dynamic(() => import('./AnalysisDemo'), { loading: SectionSkeleton })
const WhyChooseUs = dynamic(() => import('./WhyChooseUs'), { loading: SectionSkeleton })
const ComparisonSection = dynamic(() => import('./ComparisonSection'), { loading: SectionSkeleton })
const AIFuturesSection = dynamic(() => import('./AIFuturesSection'), { loading: SectionSkeleton })
const CTA = dynamic(() => import('./CTA'), { loading: SectionSkeleton })

export default function DeferredHomeSections() {
  return (
    <>
      <ProblemStatement />
      <HowItWorks />
      <OnboardingJourney />
      <AnalysisDemo />
      <WhyChooseUs />
      <TrustAndProof />
      <ComparisonSection />
      <AIFuturesSection />
      <CTA />
    </>
  )
}
