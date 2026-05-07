import {
  unifiedSectionPanelClassName,
  unifiedBodyCopyClassName,
} from '@/components/layout/unified-page-recipes'

export default function ProblemStatement() {
  return (
    <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className={unifiedSectionPanelClassName}>
        <h2 className="text-balance text-[clamp(1.6rem,3.2vw,2.4rem)] font-medium leading-[1.05] tracking-[-0.04em] text-foreground">
          Your edge deserves more than a spreadsheet
        </h2>
        <p className={unifiedBodyCopyClassName}>
          Most traders rely on intuition and scattered notes. Qunt Edge transforms your raw trade data into structured, actionable intelligence — so every session sharpens your execution.
        </p>
      </div>
    </section>
  )
}
