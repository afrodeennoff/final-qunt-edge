'use client'

import { CardV2, CardV2Content, CardV2Description, CardV2Footer, CardV2Header, CardV2Title } from "@/components/ui/v2"
import { StatsCard } from "@/components/ui/stats-card"
import { MediaCard } from "@/components/ui/media-card"
import { ActionCard } from "@/components/ui/action-card"
import { GlassCard } from "@/components/ui/glass-card"
import { ButtonV2 } from "@/components/ui/v2"
import { BadgeV2 } from "@/components/ui/v2"
import { TrendingUp, DollarSign, Users, ShoppingCart, Zap, Shield, AlertCircle, Sparkles, Check } from "lucide-react"


export function CardShowcase() {
  return (
    <div className="w-full max-w-7xl mx-auto p-8 space-y-16">
      {/* Header */}
      <header className="text-center space-y-4 animate-fade-in">
        <h1 className="text-5xl font-bold tracking-tight">Card Component System</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Modern, accessible, and responsive card components with premium glassmorphism effects
        </p>
      </header>

      {/* Card Variants */}
      <section className="space-y-6 animate-fade-in-delayed">
        <h2 className="text-3xl font-bold tracking-tight">Premium Card Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-reveal">
          <CardV2 variant="default" hover className="group">
            <CardV2Header>
              <CardV2Title>Default Card</CardV2Title>
              <CardV2Description>Standard card with border and shadow</CardV2Description>
            </CardV2Header>
            <CardV2Content>
              <p className="text-sm text-muted-foreground">
                This is the default card variant with a subtle border and shadow effect.
              </p>
            </CardV2Content>
          </CardV2>

          <CardV2 variant="glass" hover className="group">
            <CardV2Header>
              <CardV2Title>Glass Card</CardV2Title>
              <CardV2Description>Glass morphism with backdrop blur</CardV2Description>
            </CardV2Header>
            <CardV2Content>
              <p className="text-sm text-muted-foreground">
                Glass morphism effect with subtle transparency and blur.
              </p>
            </CardV2Content>
          </CardV2>

          <CardV2 variant="elevated" hover className="group">
            <CardV2Header>
              <CardV2Title>Elevated Card</CardV2Title>
              <CardV2Description>Higher elevation for emphasis</CardV2Description>
            </CardV2Header>
            <CardV2Content>
              <p className="text-sm text-muted-foreground">
                Elevated card with stronger shadow for important content.
              </p>
            </CardV2Content>
          </CardV2>

          <CardV2 variant="outlined" hover className="group">
            <CardV2Header>
              <CardV2Title>Outlined Card</CardV2Title>
              <CardV2Description>2px border, no background</CardV2Description>
            </CardV2Header>
            <CardV2Content>
              <p className="text-sm text-muted-foreground">
                Subtle boundary without background fill.
              </p>
            </CardV2Content>
          </CardV2>

          <CardV2 variant="flat" className="group">
            <CardV2Header>
              <CardV2Title>Flat Card</CardV2Title>
              <CardV2Description>No border or shadow</CardV2Description>
            </CardV2Header>
            <CardV2Content>
              <p className="text-sm text-muted-foreground">
                Minimal card with no visual decoration.
              </p>
            </CardV2Content>
          </CardV2>

          <GlassCard variant="strong" hover className="group">
            <div className="p-6 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Premium Glass</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Enhanced glass effect with stronger backdrop and animated gradient border.
              </p>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="space-y-6 animate-fade-in-delayed-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics Cards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-reveal">
          <StatsCard
            title="Total Revenue"
            value="$125,430"
            icon={DollarSign}
            trend={{ value: 12.5, isPositive: true }}
            description="vs last month"
          />
          <StatsCard
            title="Active Users"
            value="8,543"
            icon={Users}
            trend={{ value: 8.2, isPositive: true }}
            description="vs last month"
          />
          <StatsCard
            title="New Orders"
            value="1,234"
            icon={ShoppingCart}
            trend={{ value: 3.1, isPositive: false }}
            description="vs last month"
          />
          <StatsCard
            title="Growth Rate"
            value="24.5%"
            icon={TrendingUp}
            description="Year over year"
          />
        </div>
      </section>

      {/* Action Cards */}
      <section className="space-y-6 animate-fade-in-delayed-3">
        <h2 className="text-3xl font-bold tracking-tight">Interactive Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-reveal">
          <ActionCard
            title="Quick Setup"
            description="Get started in minutes with our easy setup wizard."
            icon={Zap}
            tone="default"
            primaryAction={{
              label: "Start Setup",
              onClick: () => {},
              variant: "default"
            }}
            size="md"
          />
          <ActionCard
            title="Security Check"
            description="Your account security is up to date."
            icon={Shield}
            tone="success"
            primaryAction={{
              label: "View Details",
              onClick: () => {},
              variant: "outline"
            }}
            size="md"
          />
          <ActionCard
            title="Action Required"
            description="Please verify your email address to continue."
            icon={AlertCircle}
            tone="warning"
            primaryAction={{
              label: "Verify Now",
              onClick: () => {},
              variant: "default"
            }}
            secondaryAction={{
              label: "Later",
              onClick: () => {}
            }}
            size="md"
          />
        </div>
      </section>

      {/* Media Cards */}
      <section className="space-y-6 animate-slide-up">
        <h2 className="text-3xl font-bold tracking-tight">Media Cards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-reveal">
          <MediaCard
            image="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
            title="Mountain Landscape"
            subtitle="Nature Photography"
            description="A breathtaking view of snow-capped mountains during golden hour."
            badges={[{ label: "Featured" }, { label: "Nature", variant: "secondary" }]}
            actions={
              <div className="flex gap-2 w-full">
                <ButtonV2 variant="outline" className="flex-1">Like</ButtonV2>
                <ButtonV2 className="flex-1">View</ButtonV2>
              </div>
            }
            imageAspect="video"
          />
          <MediaCard
            image="https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop"
            title="Modern Office"
            subtitle="Workspace Design"
            description="Clean and minimalist office space perfect for productivity."
            badges={[{ label: "New", variant: "default" }]}
            actions={
              <div className="flex gap-2 w-full">
                <ButtonV2 variant="outline" className="flex-1">Save</ButtonV2>
                <ButtonV2 className="flex-1">Explore</ButtonV2>
              </div>
            }
            imageAspect="video"
          />
          <MediaCard
            image="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop"
            title="Team Collaboration"
            description="Working together to achieve amazing results."
            badges={[{ label: "Business" }]}
            imageAspect="square"
          />
        </div>
      </section>

      {/* Card Sizes */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Card Sizes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <CardV2 hover>
            <CardV2Header>
              <CardV2Title>Small Card</CardV2Title>
              <CardV2Description>Compact spacing</CardV2Description>
            </CardV2Header>
            <CardV2Content>
              <p className="text-sm">Perfect for dense information displays.</p>
            </CardV2Content>
          </CardV2>

          <CardV2 hover>
            <CardV2Header>
              <CardV2Title>Medium Card</CardV2Title>
              <CardV2Description>Default spacing</CardV2Description>
            </CardV2Header>
            <CardV2Content>
              <p>Balanced spacing for most use cases. This is the default size.</p>
            </CardV2Content>
          </CardV2>

          <CardV2 hover>
            <CardV2Header>
              <CardV2Title>Large Card</CardV2Title>
              <CardV2Description>Generous spacing</CardV2Description>
            </CardV2Header>
            <CardV2Content>
              <p className="text-base">Extra space for emphasis and readability.</p>
            </CardV2Content>
          </CardV2>
        </div>
      </section>

      {/* Interactive Cards */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Interactive States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardV2 hover clickable>
            <CardV2Header>
              <CardV2Title>Hover & Clickable</CardV2Title>
              <CardV2Description>Try hovering and clicking</CardV2Description>
            </CardV2Header>
            <CardV2Content>
              <p className="text-sm text-foreground/80">
                This card has both hover effects and clickable interaction.
              </p>
            </CardV2Content>
          </CardV2>

          <GlassCard variant="default" hover clickable>
            <div className="p-6 space-y-2">
              <h3 className="font-semibold">Interactive Glass Card</h3>
              <p className="text-sm text-foreground/80">
                Glass morphism with smooth hover and click animations.
              </p>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Composition Example */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Card Composition</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardV2 variant="elevated" hover>
            <CardV2Header>
              <div className="flex items-center justify-between">
                <CardV2Title>Analytics Dashboard</CardV2Title>
                <BadgeV2>Pro</BadgeV2>
              </div>
              <CardV2Description>Real-time performance metrics</CardV2Description>
            </CardV2Header>
            <CardV2Content className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/80">Revenue</span>
                  <span className="font-medium">$45,231</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/80">Growth</span>
                  <span className="font-medium text-foreground">+12.5%</span>
                </div>
              </div>
              <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-foreground/80 text-sm">Chart Placeholder</span>
              </div>
            </CardV2Content>
            <CardV2Footer>
              <ButtonV2  variant="outline" className="w-full">View Details</ButtonV2>
            </CardV2Footer>
          </CardV2>

          <CardV2 variant="glass" hover>
            <CardV2Header>
              <CardV2Title>User Profile</CardV2Title>
              <CardV2Description>Account information</CardV2Description>
            </CardV2Header>
            <CardV2Content className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">John Doe</p>
                  <p className="text-sm text-foreground/80">john@example.com</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/80">Member since</span>
                  <span>Jan 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/80">Plan</span>
                  <BadgeV2 variant="secondary">Enterprise</BadgeV2>
                </div>
              </div>
            </CardV2Content>
            <CardV2Footer className="gap-2">
              <ButtonV2  variant="outline" className="flex-1">Edit</ButtonV2>
              <ButtonV2  className="flex-1">Share</ButtonV2>
            </CardV2Footer>
          </CardV2>
        </div>
      </section>

      <section className="space-y-6 animate-scale-in">
        <h2 className="text-3xl font-bold tracking-tight">Premium Pricing Card</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto stagger-reveal">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-border/20 to-transparent rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-1">Basic Plan</h3>
                <p className="text-sm text-muted-foreground">Essential features for individual traders</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-sm text-muted-foreground ml-1">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                {['Basic trade tracking', 'Manual data entry', 'CSV import', 'Limited storage'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="text-sm text-foreground/90">{feature}</span>
                  </li>
                ))}
              </ul>
              <ButtonV2 variant="outline" className="w-full h-12 rounded-xl font-semibold uppercase text-xs tracking-wider">
                Get Started
              </ButtonV2>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-b from-primary/5 to-transparent animate-pulse-slow" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative rounded-2xl border border-primary/30 bg-card/60 backdrop-blur-sm p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl overflow-hidden before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-primary/10 before:via-primary/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-500 group-hover:before:opacity-100">
              <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary backdrop-blur-sm shadow-lg shadow-primary/10">
                <Sparkles className="h-3 w-3" />
                <span>Popular</span>
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-1">Pro Plan</h3>
                <p className="text-sm text-muted-foreground">Advanced analytics and AI-powered insights</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">$19.99</span>
                <span className="text-sm text-muted-foreground ml-1">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                {['AI-powered insights', 'Real-time sync', 'Advanced analytics', 'Priority support', 'Unlimited storage'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="text-sm text-foreground/90">{feature}</span>
                  </li>
                ))}
              </ul>
              <ButtonV2 className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold uppercase text-xs tracking-wider shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5">
                Upgrade Now
              </ButtonV2>
            </div>
          </div>
        </div>
      </section>

      <footer className="text-center text-sm text-muted-foreground pt-8 border-t border-border/50">
        <p>Premium Card Component System — Built with accessibility, responsive design, and glassmorphism effects in mind</p>
      </footer>
    </div>
  )
}
