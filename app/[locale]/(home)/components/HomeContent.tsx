import ClientHomeContent from './ClientHomeContent'
import DeferredHomeSections from './DeferredHomeSections'

export default function HomeContent({ locale }: { locale: string }) {
  return (
    <div className="relative overflow-x-hidden">
      {/* Sedai-inspired design: Clean, minimal with sophisticated animations */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* Ultra-subtle background pattern */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1920&q=80')] opacity-[0.02]"/>
      </div>
      
      <main className="relative z-0 mx-auto w-full px-4 sm:px-6 lg:px-8">
        <ClientHomeContent locale={locale} />
        <DeferredHomeSections />
      </main>
    </div>
  );
}
