# Trader Profile Layout & Glass-Surface Refinement

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refine the Trader Profile Page layout — widget re-sequencing, glass-container standardization, interactive feedback.

**Architecture:** Zero changes to data fetching. Only layout/CSS reordering and visual polish. All changes in `page.tsx` and `calendar-grid.tsx`.

**Tech Stack:** Tailwind CSS v4, React Server Components, `animate-fade-up-smooth`

---
### Task 1: Widget Re-sequencing — Move Stats Row Below Calendar/Activity Grid

**Files:**
- Modify: `app/[locale]/(landing)/trader/[slug]/page.tsx:270-469`

- [ ] **Step 1: Remove stats row from inside hero header**

  In the hero header div (line 277-349), remove the stats row block (lines 326-348):
  ```tsx
  {/* Premium Stats Row */}
  <div className="grid border-t-0 sm:grid-cols-2 lg:grid-cols-4">
    ...
  </div>
  ```

  Change the hero container end from:
  ```tsx
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
  ```
  To:
  ```tsx
          </div>
        </div>

        {/* Anchored Summary — Stats reordered below grid */}
        <div className="mb-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {publicStats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="group rounded-2xl border border-white/10 bg-white/30 p-5 shadow-lg backdrop-blur-xl transition-all duration-200 hover:bg-white/40 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/40">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl border border-white/10 bg-white/20 p-2.5 backdrop-blur-sm dark:bg-zinc-800/20">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/70">{stat.label}</div>
                    <div className={cn("mt-0.5 text-2xl font-semibold tracking-tighter", stat.tone)}>{stat.value}</div>
                    <div className="text-[11px] text-muted-foreground/50">{stat.helper}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
  ```

- [ ] **Step 2: Verify the stats row no longer appears in the hero**

  The hero should now only contain: avatar, username, badges, description, and action buttons — no stats grid.

---

### Task 2: Container Standardization — rounded-2xl on All Glass Containers

**Files:**
- Modify: `app/[locale]/(landing)/trader/[slug]/page.tsx`

- [ ] **Step 1: Change hero header border radius**

  Line 277: `rounded-3xl` → `rounded-2xl`

- [ ] **Step 2: Change recent trades container border radius**

  Line 362: `rounded-3xl` → `rounded-2xl`

- [ ] **Step 3: Change win rate card border radius**

  Line 402: `rounded-3xl` → `rounded-2xl`

- [ ] **Step 4: Change quick insight cards border radius**

  Lines 435, 441: `rounded-3xl` → `rounded-2xl`

- [ ] **Step 5: Change calendar card border radius**

  Line 449: `rounded-3xl` → `rounded-2xl`

---

### Task 3: Calendar Grid Heatmap Refinement

**Files:**
- Modify: `app/[locale]/(landing)/trader/[slug]/calendar-grid.tsx`

- [ ] **Step 1: Increase day cell padding for better heatmap visibility**

  Line 30: Change `px-0.5 py-1 sm:py-1.5` → `px-1 py-1.5 sm:py-2`
  Line 39: Change `text-[9px]` → `text-[10px]`
  Line 42: Change `mt-0.5 text-[9px]` → `mt-0.5 text-[10px]`

- [ ] **Step 2: Add active:scale for tactile feedback on day cells**

  Line 30: After `hover:shadow-md`, add `active:scale-[0.96]`

- [ ] **Step 3: Enhance color transition for heatmap effect**

  Line 30: Add `ease-out` to transition: `transition-all duration-200 ease-out`
  Line 37: Change the opacity style line to include a color intensity comment (no code change needed)

- [ ] **Step 4: Reduce gap between day columns for denser heatmap**

  Line 14: `gap-1 sm:gap-[3px]` → `gap-[2px] sm:gap-[2px]`

---

### Task 4: Interactive Feedback — active:scale on Trade Rows

**Files:**
- Modify: `app/[locale]/(landing)/trader/[slug]/page.tsx`

- [ ] **Step 1: Add active:scale to trade row items**

  Line 371: Add `active:scale-[0.98]` to the trade row className:
  From: `className="group flex items-center justify-between px-5 py-4 transition hover:bg-muted/40"`
  To: `className="group flex items-center justify-between px-5 py-4 transition-all duration-200 hover:bg-muted/40 active:scale-[0.98]"`

---

### Task 5: Spacing Uniformity

**Files:**
- Modify: `app/[locale]/(landing)/trader/[slug]/page.tsx`

- [ ] **Step 1: Verify all gap-6 usages are consistent**

  Line 351: `className="grid gap-6 lg:grid-cols-12"` — already correct

- [ ] **Step 2: Tighten the space-y between right-column cards**

  Line 400: `space-y-6` — this is correct, matches grid gap

---

### Verification

- [ ] `npm run typecheck` — 0 new errors
- [ ] `npm run lint` — 0 new warnings in trader files
- [ ] Hero header no longer contains stats row
- [ ] Stats row appears as anchored summary beneath the main grid
- [ ] All glass containers use rounded-2xl consistently
- [ ] Calendar day cells respond with active:scale on click/touch
- [ ] Trade rows respond with active:scale on click/touch
