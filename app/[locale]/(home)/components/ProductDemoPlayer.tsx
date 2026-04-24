const PROMO_SRC = '/hyperframes/qunt-edge-promo/index.html'

export default function ProductDemoPlayer() {
  return (
    <div className="aspect-video w-full bg-black">
      <iframe
        title="Qunt Edge product promo"
        src={PROMO_SRC}
        className="h-full w-full border-0"
        loading="lazy"
        sandbox="allow-scripts"
      />
    </div>
  )
}
