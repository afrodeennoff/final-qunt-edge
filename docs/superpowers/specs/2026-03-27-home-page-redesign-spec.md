# Qunt Edge Home Page Redesign - Design Specification

**Version:** 1.0  
**Date:** 2026-03-27  
**Status:** Approved for Implementation  
**Design Direction:** Precision Terminal

---

## Executive Summary

Complete redesign of the Qunt Edge home page to establish a premium, data-forward visual identity that appeals to serious discretionary traders. The redesign positions Qunt Edge as the "Bloomberg for retail traders" - professional, precise, and data-sophisticated.

**Target Audience:** Professional discretionary futures traders seeking performance analytics  
**Design Philosophy:** Data-forward minimalism with strategic animation

---

## 1. Visual Identity

### 1.1 Color Palette

| Role | Name | Hex | HSL | Usage |
|------|------|-----|-----|-------|
| Background | Deep Obsidian | `#050505` | - | Page background |
| Surface | Panel | `#0b0b0d` | - | Cards, elevated elements |
| Surface Elevated | Layer | `#101014` | - | Hover states, borders |
| Primary | Precision Blue | `#2962FF` | 226° 100% 59% | CTAs, links, accents |
| Success | Gain Green | `#089981` | 166° 83% 30% | Positive metrics, wins |
| Danger | Loss Red | `#F23645` | 356° 91% 64% | Negative metrics, losses |
| Warning | Caution | `#FB8C00` | 32° 97% 54% | Warnings, neutral states |
| Text Primary | Light Gray | `#E0E0E0` | 0° 0% 88% | Headlines, primary content |
| Text Secondary | Medium Gray | `#9E9E9E` | 0° 0% 62% | Body text, descriptions |
| Text Muted | Dark Gray | `#707070` | 0° 0% 44% | Labels, captions |
| Border | Subtle | `#1A1A21` | - | Dividers, card borders |

### 1.2 Typography

| Role | Font Family | Weight | Size | Line Height |
|------|------------|--------|------|------------|
| Display | Geist | 700 | 72-96px | 0.95 |
| Heading 1 | Geist | 600 | 48px | 1.0 |
| Heading 2 | Geist | 600 | 36px | 1.1 |
| Heading 3 | Geist | 500 | 24px | 1.2 |
| Body Large | Geist | 400 | 18px | 1.6 |
| Body | Geist | 400 | 16px | 1.6 |
| Body Small | Geist | 400 | 14px | 1.5 |
| Label | Geist | 500 | 12px | 1.4 |
| Mono | Geist Mono | 400 | 14px | 1.5 |

### 1.3 Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight spacing |
| `space-2` | 8px | Compact |
| `space-3` | 12px | Default |
| `space-4` | 16px | Comfortable |
| `space-6` | 24px | Spacious |
| `space-8` | 32px | Section gaps |
| `space-12` | 48px | Large gaps |
| `space-16` | 64px | Section padding |

### 1.4 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 4px | Inputs, small buttons |
| `radius-md` | 8px | Cards, panels |
| `radius-lg` | 12px | Large cards |
| `radius-xl` | 16px | Modals |
| `radius-full` | 9999px | Pills, avatars |

---

## 2. Component Specifications

### 2.1 Navigation

```tsx
// Navigation Component
<nav className="fixed top-0 w-full z-50 border-b border-[#1A1A21] bg-[#050505]/80 backdrop-blur-xl">
  <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
    <Logo />
    <div className="hidden md:flex items-center gap-8">
      <NavLink href="/features">Features</NavLink>
      <NavLink href="/pricing">Pricing</NavLink>
      <NavLink href="/docs">Docs</NavLink>
      <NavLink href="/blog">Blog</NavLink>
    </div>
    <div className="flex items-center gap-4">
      <Button variant="ghost">Login</Button>
      <Button variant="default">Start Free</Button>
    </div>
  </div>
</nav>
```

**States:**
- Default: Transparent background
- Scrolled: Blur background with subtle border
- Mobile: Hamburger menu with slide-out drawer

### 2.2 Hero Section

```tsx
// Hero Component
<section className="relative min-h-screen flex items-center justify-center pt-16">
  {/* Background effects */}
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_rgba(41,98,255,0.15),_transparent)]" />
  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(26,26,33,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(26,26,33,0.5)_1px,transparent_1px)] bg-[size:64px_64px]" />
  
  {/* Content */}
  <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
    <Badge variant="outline" className="mb-6">
      <span className="w-2 h-2 rounded-full bg-[#089981] animate-pulse mr-2" />
      Live Decision Telemetry
    </Badge>
    
    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
      Build repeatable edge.<br />
      <span className="text-[#2962FF]">Eliminate emotional drift.</span>
    </h1>
    
    <p className="text-xl text-[#9E9E9E] max-w-2xl mx-auto mb-8">
      Qunt Edge isolates execution quality, behavioral drift, and risk discipline 
      in one review surface. Every session gets a precise diagnosis.
    </p>
    
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
      <Button size="lg" className="bg-[#2962FF] hover:bg-[#2962FF]/90">
        Start Free Audit
      </Button>
      <Button size="lg" variant="outline">
        Watch Demo
      </Button>
    </div>
    
    <p className="text-sm text-[#707070]">
      No credit card required • First audit in minutes
    </p>
  </div>
  
  {/* Dashboard Preview */}
  <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-[#050505] to-transparent" />
</section>
```

### 2.3 Dashboard Preview Component

```tsx
// Dashboard Preview Component
<div className="relative max-w-5xl mx-auto mt-12 px-4">
  <div className="rounded-xl border border-[#1A1A21] bg-[#0b0b0d] overflow-hidden shadow-2xl shadow-[#2962FF]/10">
    {/* Browser chrome */}
    <div className="flex items-center gap-2 px-4 py-3 bg-[#101014] border-b border-[#1A1A21]">
      <div className="flex gap-1.5">
        <div className="w-3 h-3 rounded-full bg-[#F23645]" />
        <div className="w-3 h-3 rounded-full bg-[#FB8C00]" />
        <div className="w-3 h-3 rounded-full bg-[#089981]" />
      </div>
      <div className="flex-1 flex justify-center">
        <div className="px-3 py-1 rounded bg-[#0b0b0d] text-xs text-[#707070]">
          app.quntedge.com/dashboard
        </div>
      </div>
      <div className="w-16" />
    </div>
    
    {/* Dashboard content - simplified representation */}
    <div className="p-6 space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total P&L" value="$12,847" change="+34.2%" positive />
        <StatCard label="Win Rate" value="78%" change="+2.4%" positive />
        <StatCard label="Profit Factor" value="2.34" change="+0.12" positive />
      </div>
      
      {/* Chart placeholder */}
      <div className="h-48 rounded-lg bg-[#101014] border border-[#1A1A21] relative overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
          {[65, 72, 68, 85, 78, 92, 88, 95, 82, 100, 94, 98].map((h, i) => (
            <div 
              key={i} 
              className="w-6 rounded-t-sm bg-gradient-to-t from-[#2962FF] to-[#2962FF]/50"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        {/* Scanner line animation */}
        <div className="absolute inset-y-0 w-0.5 bg-[#2962FF] animate-[scan_3s_linear_infinite]" />
      </div>
    </div>
  </div>
</div>
```

### 2.4 Trust Strip

```tsx
// Trust Strip Component
<section className="border-y border-[#1A1A21] bg-[#0b0b0d]">
  <div className="max-w-6xl mx-auto px-6 py-12">
    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
      {/* Security badges */}
      <div className="flex items-center gap-6">
        <TrustBadge icon={Shield} label="SOC2 Certified" />
        <TrustBadge icon={Lock} label="256-bit Encryption" />
        <TrustBadge icon={ShieldCheck} label="GDPR Compliant" />
      </div>
      
      {/* Integrations */}
      <div className="flex items-center gap-8">
        <IntegrationLogo name="Tradovate" />
        <IntegrationLogo name="Rithmic" />
        <IntegrationLogo name="IBKR" />
        <IntegrationLogo name="CQG" />
        <span className="text-[#707070]">NINJA|TRADER</span>
      </div>
      
      {/* Social proof */}
      <p className="text-[#9E9E9E]">
        Trusted by <span className="text-white font-medium">50,000+</span> traders
      </p>
    </div>
  </div>
</section>
```

### 2.5 Features Bento Grid

```tsx
// Bento Grid Component
<section className="py-24 bg-[#050505]">
  <div className="max-w-6xl mx-auto px-6">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-semibold mb-4">
        Everything you need to <span className="text-[#2962FF]">trade smarter</span>
      </h2>
      <p className="text-[#9E9E9E] text-lg max-w-2xl mx-auto">
        Powerful analytics, AI insights, and team collaboration in one platform.
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Large card - spans 2 cols */}
      <BentoCard variant="large" className="lg:col-span-2">
        <Icon name="BarChart3" className="w-10 h-10 text-[#2962FF]" />
        <h3>Advanced Analytics</h3>
        <p>Deep dive into your performance with decile analysis, heatmaps, and custom metrics.</p>
        <ChartPreview />
      </BentoCard>
      
      <BentoCard>
        <Icon name="Brain" className="w-10 h-10 text-[#089981]" />
        <h3>AI Insights</h3>
        <p>Pattern recognition and behavioral analysis powered by machine learning.</p>
      </BentoCard>
      
      <BentoCard>
        <Icon name="Users" className="w-10 h-10 text-[#FB8C00]" />
        <h3>Team Sync</h3>
        <p>Share layouts, compare performance, and learn from your peers.</p>
      </BentoCard>
      
      <BentoCard variant="large" className="lg:col-span-2">
        <Icon name="Download" className="w-10 h-10 text-[#2962FF]" />
        <h3>Multi-Broker Import</h3>
        <p>Connect Tradovate, Rithmic, IBKR, or import from CSV. Your data, your way.</p>
        <BrokerLogos />
      </BentoCard>
      
      <BentoCard>
        <Icon name="FileText" className="w-10 h-10 text-[#089981]" />
        <h3>Coach-Ready Exports</h3>
        <p>Generate PDF briefs and shareable reports for mentorship sessions.</p>
      </BentoCard>
    </div>
  </div>
</section>
```

### 2.6 Pricing Section

```tsx
// Pricing Section Component
<section id="pricing" className="py-24 bg-[#0b0b0d]">
  <div className="max-w-6xl mx-auto px-6">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-semibold mb-4">
        Simple, transparent <span className="text-[#2962FF]">pricing</span>
      </h2>
      <p className="text-[#9E9E9E] text-lg">
        Start free. Scale as you grow.
      </p>
      
      {/* Billing toggle */}
      <div className="inline-flex items-center gap-3 mt-8 p-1 rounded-lg bg-[#101014] border border-[#1A1A21]">
        <button className="px-4 py-2 rounded-md bg-[#2962FF] text-white text-sm font-medium">
          Monthly
        </button>
        <button className="px-4 py-2 rounded-md text-[#9E9E9E] text-sm">
          Annual <span className="text-[#089981]">-20%</span>
        </button>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Starter */}
      <PricingCard 
        name="Starter"
        price="$0"
        period="/month"
        description="Perfect for getting started"
        features={[
          "100 trades/month",
          "1 broker connection",
          "Basic analytics",
          "7-day data retention",
        ]}
        cta="Get Started"
        variant="outline"
      />
      
      {/* Pro - Featured */}
      <PricingCard 
        name="Pro"
        price="$49"
        period="/month"
        description="For serious traders"
        features={[
          "Unlimited trades",
          "All broker connections",
          "AI insights",
          "Unlimited data retention",
          "Priority support",
          "Coach-ready exports",
        ]}
        cta="Start Free Trial"
        badge="Most Popular"
        variant="featured"
      />
      
      {/* Enterprise */}
      <PricingCard 
        name="Enterprise"
        price="Custom"
        period=""
        description="For teams and firms"
        features={[
          "Everything in Pro",
          "Team management",
          "SSO integration",
          "Custom SLAs",
          "Dedicated support",
        ]}
        cta="Contact Sales"
        variant="outline"
      />
    </div>
  </div>
</section>
```

### 2.7 Final CTA

```tsx
// Final CTA Component
<section className="py-24 bg-[#050505] relative overflow-hidden">
  {/* Background glow */}
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,_rgba(41,98,255,0.2),_transparent)]" />
  
  <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
    <h2 className="text-4xl md:text-5xl font-semibold mb-6">
      Ready to <span className="text-[#2962FF]">trade smarter</span>?
    </h2>
    <p className="text-xl text-[#9E9E9E] mb-8">
      Join 50,000+ traders who have improved their performance with Qunt Edge.
      Start your free audit today.
    </p>
    <Button size="lg" className="bg-[#2962FF] hover:bg-[#2962FF]/90 text-lg px-8">
      Start Free Audit
    </Button>
    <p className="mt-4 text-sm text-[#707070]">
      No credit card required • Setup in 2 minutes
    </p>
  </div>
</section>
```

### 2.8 Footer

```tsx
// Footer Component
<footer className="border-t border-[#1A1A21] bg-[#0b0b0d]">
  <div className="max-w-6xl mx-auto px-6 py-12">
    <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
      <div className="col-span-2">
        <Logo className="mb-4" />
        <p className="text-[#707070] text-sm max-w-xs">
          The trading journal and analytics platform for discretionary traders who take their craft seriously.
        </p>
      </div>
      
      <FooterColumn 
        title="Product"
        links={["Features", "Pricing", "Integrations", "Changelog"]}
      />
      <FooterColumn 
        title="Resources"
        links={["Documentation", "API Reference", "Blog", "Community"]}
      />
      <FooterColumn 
        title="Company"
        links={["About", "Careers", "Contact", "Legal"]}
      />
    </div>
    
    <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-[#1A1A21]">
      <p className="text-[#707070] text-sm">
        © 2026 Qunt Edge. All rights reserved.
      </p>
      <div className="flex items-center gap-4 mt-4 md:mt-0">
        <SocialLink name="Twitter" />
        <SocialLink name="Discord" />
        <SocialLink name="GitHub" />
      </div>
    </div>
  </div>
</footer>
```

---

## 3. Animation Specifications

### 3.1 Scanner Line Animation

```css
/* Scanner line effect for dashboard preview */
@keyframes scan {
  0% {
    left: 0;
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}

.animate-scan {
  animation: scan 3s linear infinite;
}
```

### 3.2 Staggered Reveal

```css
/* Fade up with stagger */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stagger-reveal > * {
  opacity: 0;
  animation: fadeUp 0.6s ease-out forwards;
}

.stagger-reveal > *:nth-child(1) { animation-delay: 0ms; }
.stagger-reveal > *:nth-child(2) { animation-delay: 100ms; }
.stagger-reveal > *:nth-child(3) { animation-delay: 200ms; }
.stagger-reveal > *:nth-child(4) { animation-delay: 300ms; }
.stagger-reveal > *:nth-child(5) { animation-delay: 400ms; }
```

### 3.3 Hover Interactions

```css
/* Card hover effect */
.bento-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.bento-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

/* Button hover effect */
.btn-primary {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(41, 98, 255, 0.3);
}
```

### 3.4 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 4. Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, stacked |
| Tablet | 640px - 1024px | 2 columns |
| Desktop | 1024px - 1280px | 3 columns |
| Wide | > 1280px | Full layout |

### 4.1 Typography Scaling

```css
/* Mobile-first fluid typography */
.text-display {
  font-size: clamp(2.5rem, 8vw, 6rem);
  line-height: 0.95;
}

.text-heading-1 {
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.0;
}

.text-heading-2 {
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  line-height: 1.1;
}

.text-body {
  font-size: clamp(1rem, 1.5vw, 1.125rem);
  line-height: 1.6;
}
```

---

## 5. Accessibility Requirements

### 5.1 Color Contrast

| Element | Foreground | Background | Ratio | Level |
|---------|------------|------------|-------|-------|
| Primary text | `#E0E0E0` | `#050505` | 13.5:1 | AAA |
| Secondary text | `#9E9E9E` | `#050505` | 5.7:1 | AA |
| Muted text | `#707070` | `#050505` | 3.2:1 | AA |
| Primary button | `#FFFFFF` | `#2962FF` | 4.8:1 | AA |

### 5.2 Focus States

```css
/* Visible focus ring */
:focus-visible {
  outline: 2px solid #2962FF;
  outline-offset: 2px;
}

/* Focus within for keyboard navigation */
:focus-within {
  outline: 2px solid #2962FF;
  outline-offset: 2px;
}
```

### 5.3 Screen Reader Support

- All images have alt text
- Interactive elements have aria-labels
- Color is not the only indicator of state
- Skip links for main content
- Proper heading hierarchy (h1 → h2 → h3)

---

## 6. Performance Requirements

| Metric | Target | Measurement |
|--------|--------|------------|
| LCP | < 2.5s | Lighthouse |
| FID | < 100ms | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| Bundle Size | < 300KB | Webpack stats |
| First Paint | < 1s | Chrome DevTools |

### 6.1 Optimization Strategies

- Lazy load below-fold sections
- Use `next/image` for all images
- Preload critical fonts
- Minimize JavaScript bundle
- Use CSS animations over JS animations

---

## 7. Implementation Files

### Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `app/[locale]/(home)/components/HomeContent.tsx` | Modify | Main container |
| `app/[locale]/(home)/components/Hero.tsx` | Rewrite | Hero section |
| `app/[locale]/(home)/components/TrustStrip.tsx` | Create | Trust/security strip |
| `app/[locale]/(home)/components/Features.tsx` | Rewrite | Bento grid features |
| `app/[locale]/(home)/components/DashboardPreview.tsx` | Create | Animated dashboard mock |
| `app/[locale]/(home)/components/PricingSection.tsx` | Rewrite | Pricing cards |
| `app/[locale]/(home)/components/FinalCTA.tsx` | Create | Bottom CTA |
| `app/[locale]/(home)/components/Footer.tsx` | Rewrite | Footer |
| `app/[locale]/(home)/components/Navigation.tsx` | Create | Header navigation |
| `app/globals.css` | Modify | Animation keyframes |
| `tailwind.config.ts` | Modify | Color tokens |

---

## 8. Verification Checklist

- [ ] All sections render correctly
- [ ] Responsive breakpoints work
- [ ] Animations smooth (60fps)
- [ ] Color contrast passes WCAG AA
- [ ] Focus states visible
- [ ] Reduced motion respected
- [ ] Lighthouse score > 90
- [ ] Build succeeds without errors
- [ ] TypeScript compiles without errors

---

## 9. Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Hero conversion rate | TBD | +20% |
| Time on page | TBD | +30s |
| Bounce rate | TBD | -10% |
| Lighthouse Performance | TBD | >90 |
| Lighthouse Accessibility | TBD | >95 |

---

**Document Status:** Ready for Implementation  
**Next Step:** Invoke writing-plans skill for implementation breakdown
