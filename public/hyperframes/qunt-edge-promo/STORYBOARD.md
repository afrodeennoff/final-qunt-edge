# Storyboard

**Format:** 1920x1080
**Duration:** 20 seconds
**Audio:** Preview is visual-only. SCRIPT.md is ready for VO if a rendered version is requested.
**VO direction:** Calm, direct, professional. Keep pauses between lines.
**Style basis:** DESIGN.md. Electric Obsidian product UI, compact analytics, cobalt signal.

## Asset Audit

| Asset | Type | Assign to Beat | Role |
| --- | --- | --- | --- |
| Brand mark (icon + text) | HTML/CSS | Beat 1, persistent | Brand presence throughout |
| PnL result card | HTML/CSS UI | Beat 1 | Session result with status chips |
| Browser shell + dashboard | HTML/CSS UI | Beat 2 | Full product frame with metrics, equity chart, rail |
| Execution audit table | HTML/CSS UI | Beat 3 | Trade rows with verdict badges and signal rail |
| AI debrief + rule card | HTML/CSS UI | Beat 4 | Recommendations panel and next-session rule |
| CTA lockup | HTML/CSS UI | Beat 5 | Brand, promise, audience chips, action button |

## Beat 1 - Cold Open (0:00-0:04)

**VO cue:** "Your PnL tells you what happened."

**Concept:** The viewer starts inside a dark trading terminal. A large result number appears, but the surrounding UI questions whether the outcome is enough.

**Visual description:** Void canvas with subtle cobalt grid and ambient glow. Brand mark in upper left. Left side: hero headline with cobalt accent. Right side: PnL card showing +$4,820 in green with three status chips (outcome known, risk unknown, rules unclear), each with a colored dot indicator.

**Animation choreography:** Brand mark fades in. Eyebrow and headline stagger from below. PnL card slides in from right. Value counts up from $0 to $4,820. Chips cascade in. Scan line travels across the frame.

**Transition:** Scene slides upward and fades.

## Beat 2 - Product Reveal (0:04-0:08)

**VO cue:** "Qunt Edge shows why."

**Concept:** The answer is the product. A dashboard frame expands into the center and turns raw results into structured review.

**Visual description:** Browser-shell product frame with traffic-light dots, URL bar (app.quntedge.com/dashboard), and "Live audit" status. Dashboard has a two-column grid: left side has three metric cards (plan adherence 86%, risk drift 12%, review SLA 4m) and an equity chart with gradient fill; right side has rail cards showing execution quality, plan score with progress bar, behavior drift with amber bar, review SLA with green bar, and AI debrief status.

**Animation choreography:** Shell scales from 0.96 to 1. Metric cards stagger in from below with counting values. Equity line draws left to right with gradient fill fade-in. Rail cards slide in from right. Progress bars grow to their target widths.

**Transition:** Scene slides left and fades.

## Beat 3 - Audit Loop (0:08-0:12)

**VO cue:** "Sync every trade, audit execution quality, spot behavior drift..."

**Concept:** The product shifts from dashboard to workflow. Imported fills become visible decisions, not just rows.

**Visual description:** Audit table panel with header ("Execution audit") and badge ("14 trades synced"). Five trade rows with instrument, time, result (color-coded positive/negative), R-multiple, and verdict badges (clean setup, late entry, rule break, plan match, textbook). Signal rail at bottom with green/amber/red segments.

**Animation choreography:** Panel scales in. Header fades in. Trade rows cascade in with stagger. Verdict badges pop in with back-ease. Signal rail segments grow to their target widths.

**Transition:** Scene scales down and fades.

## Beat 4 - AI Debrief (0:12-0:16)

**VO cue:** "...and turn each session into a cleaner plan."

**Concept:** AI acts like a structured desk review. The interface turns behavior drift into one practical next action.

**Visual description:** Split layout. Left: AI panel with gradient icon, "Session debrief" label, headline "Turn drift into one next action," and three numbered recommendations. Right: Rule card with cobalt border glow, "Next session rule" label, rule text ("One setup. Fixed size. Review in four minutes."), and tags (Discipline, Size control, SLA).

**Animation choreography:** AI icon pops in with rotation. Headline slides up. Recommendations stagger in from left with numbered badges popping. Rule card slides in from right. Tags cascade in.

**Transition:** Scene slides upward and fades.

## Beat 5 - CTA (0:16-0:20)

**VO cue:** "For funded traders, coaches, and serious futures traders, review stops being scattered. Start your free audit with Qunt Edge."

**Concept:** End clean and decisive. The product name owns the frame and the CTA is simple.

**Visual description:** Centered card with "Qunt Edge" brand name (Edge in cobalt), promise text, three audience chips with green dots, and a cobalt CTA button with glow shadow. Glass panel background.

**Animation choreography:** Card fades in. Brand name rises into place. Promise text follows. Audience chips stagger in. CTA button scales in and pulses once.

**Transition:** Hold on final frame.

## Production Architecture

```
public/hyperframes/qunt-edge-promo/
├── index.html
├── DESIGN.md
├── SCRIPT.md
└── STORYBOARD.md
```
