# Storyboard

**Format:** 1920x1080
**Duration:** 20 seconds
**Audio:** Preview is visual-only. SCRIPT.md is ready for VO if a rendered version is requested.
**VO direction:** Calm, direct, professional. Keep pauses between lines.
**Style basis:** DESIGN.md. Electric Obsidian product UI, compact analytics, cobalt signal.

## Asset Audit

| Asset | Type | Assign to Beat | Role |
| --- | --- | --- | --- |
| Code-native Qunt Edge logo text | Text lockup | Beat 1, Beat 5 | Brand opener and closer |
| Recreated dashboard frame | HTML/CSS UI | Beat 2, Beat 3 | Signature product visual |
| Signal rail and metric cards | HTML/CSS UI | Beat 3, Beat 4 | Execution audit proof |
| AI debrief panel | HTML/CSS UI | Beat 4 | Product intelligence moment |

## Beat 1 - Cold Open (0:00-0:04)

**VO cue:** "Your PnL tells you what happened."

**Concept:** The viewer starts inside a dark trading terminal. A large result number appears, but the surrounding UI questions whether the outcome is enough.

**Visual description:** Void canvas. Product logo sits in the upper left. A large PnL figure occupies the left side. Thin cobalt grid lines and tiny execution ticks slide behind it. Three small status chips surface beside the number: result, risk, rule quality.

**Animation choreography:** Logo fades in. PnL counts upward. Status chips cascade from the right. A thin scan line travels across the frame.

**Transition:** The PnL frame slides upward as the dashboard shell rises into view.

## Beat 2 - Product Reveal (0:04-0:08)

**VO cue:** "Qunt Edge shows why."

**Concept:** The answer is the product. A dashboard frame expands into the center and turns raw results into structured review.

**Visual description:** Browser-shell product frame fills the center. Four metric cards snap into an aligned grid. A mini equity curve draws across the main chart. The right rail shows plan adherence, risk drift, and review SLA.

**Animation choreography:** Shell scales from 0.96 to 1. Cards slide in sequence. Chart line draws left to right. Metric values count up.

**Transition:** Chart line becomes a horizontal motion path that pulls the next beat forward.

## Beat 3 - Audit Loop (0:08-0:12)

**VO cue:** "Sync every trade, audit execution quality, spot behavior drift..."

**Concept:** The product shifts from dashboard to workflow. Imported fills become visible decisions, not just rows.

**Visual description:** A trade table moves through the center. Each row receives a status: clean setup, late entry, oversized risk, rule break. A signal rail underneath groups those states by color.

**Animation choreography:** Rows cascade upward. Status dots fill in. Warning markers pulse once. Signal rail segments grow to their final width.

**Transition:** The warning marker expands into the AI debrief panel.

## Beat 4 - AI Debrief (0:12-0:16)

**VO cue:** "...and turn each session into a cleaner plan."

**Concept:** AI acts like a structured desk review. The interface turns behavior drift into one practical next action.

**Visual description:** A dark command panel appears on the right with three recommendations. The dashboard remains visible behind it as context. A "Next session rule" card locks into the foreground.

**Animation choreography:** Recommendations type on. Tags slide into place. The foreground rule card settles with a cobalt border highlight.

**Transition:** The product UI compresses into the final brand lockup.

## Beat 5 - CTA (0:16-0:20)

**VO cue:** "For funded traders, coaches, and serious futures traders, review stops being scattered. Start your free audit with Qunt Edge."

**Concept:** End clean and decisive. The product name owns the frame and the CTA is simple.

**Visual description:** Qunt Edge appears large on the left. The promise sits underneath. Three audience labels sit in a compact row: funded traders, coaches, futures traders. A cobalt CTA button anchors the final frame.

**Animation choreography:** Product name rises into place. Audience labels tick on one by one. CTA button receives a restrained cobalt highlight.

**Transition:** Hold on final frame.

## Production Architecture

```
public/hyperframes/qunt-edge-promo/
├── index.html
├── DESIGN.md
├── SCRIPT.md
└── STORYBOARD.md
```
