"use client";

import React, { forwardRef, useRef } from "react";
import Image from "next/image";
import { Logo } from "@/components/logo";
import { Database } from "lucide-react";

import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/magicui/animated-beam";

const Circle = forwardRef<
 HTMLDivElement,
 { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
 return (
 <div
 ref={ref}
 className={cn("z-10 flex size-12 items-center justify-center rounded-full border-2 border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.03)] p-3 shadow-none",
 className,
 )}
 >
 {children}
 </div>
 );
});

Circle.displayName ="Circle";

export function ImportFeature() {
 const containerRef = useRef<HTMLDivElement>(null);
 const div1Ref = useRef<HTMLDivElement>(null);
 const div2Ref = useRef<HTMLDivElement>(null);
 const div3Ref = useRef<HTMLDivElement>(null);
 const div4Ref = useRef<HTMLDivElement>(null);
 const div5Ref = useRef<HTMLDivElement>(null);
 const div6Ref = useRef<HTMLDivElement>(null);
 const div7Ref = useRef<HTMLDivElement>(null);

 return (
 <div className="mx-6 rounded-xl p-6 bg-[oklch(0.65_0.22_260/0.03)] shadow-card">
 <div className="flex items-center gap-3 mb-4">
 <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center">
 <Database className="size-[18px] text-primary" strokeWidth={2} />
 </div>
 <p className="text-[12px] uppercase tracking-[0.05em] text-foreground font-medium">
 Data Import
 </p>
 </div>
 <div
 className="relative flex h-[300px] w-full items-center justify-center overflow-hidden p-10"
 ref={containerRef}
 >
 <div className="flex size-full max-h-[200px] max-w-lg flex-col items-stretch justify-between gap-10">
 <div className="flex flex-row items-center justify-between">
 <Circle ref={div1Ref}>
 <Image src="/logos/tradovate.png" alt="Tradovate" width={24} height={24} />
 </Circle>
 <Circle ref={div5Ref}>
 <Image src="/logos/topstep.png" alt="Topstep" width={24} height={24} />
 </Circle>
 </div>
 <div className="flex flex-row items-center justify-between">
 <Circle ref={div2Ref}>
 <Image src="/logos/ninjatrader.png" alt="NinjaTrader" width={24} height={24} />
 </Circle>
 <Circle ref={div4Ref} className="size-16">
 <Logo className="size-8" />
 </Circle>
 <Circle ref={div6Ref}>
 <Image src="/logos/quantower.png" alt="Quantower" width={24} height={24} />
 </Circle>
 </div>
 <div className="flex flex-row items-center justify-between">
 <Circle ref={div3Ref}>
 <Image src="/logos/rithmic.png" alt="Rithmic" width={24} height={24} />
 </Circle>
 <Circle ref={div7Ref}>
 <Image src="/logos/etp.png" alt="Thor" width={24} height={24} />
 </Circle>
 </div>
 </div>

 <AnimatedBeam
 containerRef={containerRef}
 fromRef={div1Ref}
 toRef={div4Ref}
 curvature={-75}
 endYOffset={-10}
 />
 <AnimatedBeam
 containerRef={containerRef}
 fromRef={div2Ref}
 toRef={div4Ref}
 />
 <AnimatedBeam
 containerRef={containerRef}
 fromRef={div3Ref}
 toRef={div4Ref}
 curvature={75}
 endYOffset={10}
 />
 <AnimatedBeam
 containerRef={containerRef}
 fromRef={div5Ref}
 toRef={div4Ref}
 curvature={-75}
 endYOffset={-10}
 reverse
 />
 <AnimatedBeam
 containerRef={containerRef}
 fromRef={div6Ref}
 toRef={div4Ref}
 reverse
 />
 <AnimatedBeam
 containerRef={containerRef}
 fromRef={div7Ref}
 toRef={div4Ref}
 curvature={75}
 endYOffset={10}
 reverse
 />
 </div>
 </div>
 );
}
