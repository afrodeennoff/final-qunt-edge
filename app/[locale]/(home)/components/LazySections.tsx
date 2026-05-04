import dynamic from 'next/dynamic'

const SocialProofLazy = dynamic(() => import('./SocialProof'), {
  ssr: true,
  loading: () => null,
})

const FAQSectionLazy = dynamic(() => import('./FAQSection'), {
  ssr: true,
  loading: () => null,
})

const TrustAndProofLazy = dynamic(() => import('./TrustAndProof'), {
  ssr: true,
  loading: () => null,
})

export { SocialProofLazy, FAQSectionLazy, TrustAndProofLazy }
