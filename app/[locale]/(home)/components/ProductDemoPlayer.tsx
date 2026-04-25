const PROMO_SRC = '/hyperframes/qunt-edge-promo/index.html'

export default function ProductDemoPlayer() {
  return (
    <div className="w-full bg-black" style={{ aspectRatio: '16 / 10.5' }}>
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
