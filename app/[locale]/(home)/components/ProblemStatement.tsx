export default function ProblemStatement() {
  const pains = [
    { title: "Scattered Data", desc: "Trades across 4 brokers, 12 spreadsheets, and zero single source of truth." },
    { title: "Blind Spots", desc: "You know you’re profitable but have no idea which setups actually generate your edge." },
    { title: "No Real Review", desc: "End-of-day journaling is a joke. You repeat the same expensive mistakes weekly." },
  ]

  return (
    <section className="relative border-b border-white/10 bg-[#050505] py-16">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[oklch(0.65_0.22_260)]">The Problem</div>
          <h2 className="mt-4 text-balance text-[42px] font-[260] tracking-[-0.03em] text-white sm:text-[52px]">
            Trading is hard enough.<br />Your tools shouldn’t make it harder.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pains.map((pain, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-[#0a0a0f] p-7">
              <div className="text-[15px] font-semibold tracking-tight text-white">{pain.title}</div>
              <p className="mt-3 text-[14px] leading-relaxed text-white/70">{pain.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
