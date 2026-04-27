const PROMO_SRC = '/hyperframes/qunt-edge-promo/index.html'

export default function ProductDemoPlayer() {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-background">
      <iframe
        title="Qunt Edge product promo"
        src={PROMO_SRC}
        className="absolute inset-0 h-full w-full border-0"
        loading="eager"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  )
}
