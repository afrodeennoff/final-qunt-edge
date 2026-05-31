'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useCurrentLocale } from '@/locales/client'
import {
  Table, Filter, Search, Tag, ArrowUpDown, Download, Trash2, Edit3,
  CheckCircle, XCircle, Target, Clock, FileText, ArrowRight, Check,
  Plus, GripVertical, Maximize2, ExternalLink, Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

const cardMain = 'rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5 sm:p-6'
const cardNested = 'rounded-lg bg-[var(--qe-ref-surface-2)] p-4'
const eyebrowStyle = 'text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)] uppercase'
const headingCard = 'text-[17px] font-semibold tracking-[-0.01em]'
const bodySmall = 'text-[13px] leading-[1.55] text-[var(--qe-ref-text-muted)]'

export default function DocsTradeLogPage() {
  const locale = useCurrentLocale()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: "How many trades can the Trade Log handle?",
      a: "The table uses virtualized rendering and handles 10,000+ trades without perceptible lag. Pagination is set to 100 rows per page by default, configurable up to 500. Filters operate server-side on the full dataset."
    },
    {
      q: "Can I edit trades after importing?",
      a: "Yes — click any cell to edit inline. Instrument, side, quantity, prices, P&L, commission, and tags are all editable. Changes save automatically. Edited fields are highlighted with a subtle indicator."
    },
    {
      q: "What happens when I delete trades?",
      a: "Deleted trades are soft-deleted and moved to a trash state for 30 days. You can restore them from the account settings. Hard deletion is available but requires confirmation."
    },
    {
      q: "Do the filters here affect the rest of the dashboard?",
      a: "The Trade Log has its own independent filter set that defaults to the same global filter context from the Dashboard. You can override filters in the log without affecting widgets — perfect for deep dives."
    },
  ]

  const columns = [
    { name: "Date/Time", desc: "Entry timestamp in your configured timezone. Sortable. Click to expand full trade details." },
    { name: "Instrument", desc: "Ticker symbol with exchange suffix. Color-coded by asset class. Quick-filter by clicking the symbol." },
    { name: "Side", desc: "Long/Short with position sizing. Short positions highlighted in red, long in green." },
    { name: "Quantity", desc: "Number of contracts/shares/lots. Editable inline." },
    { name: "Entry / Exit", desc: "Entry and exit prices with per-unit P&L calculation. Exit price shows in a separate sub-column." },
    { name: "P&L", desc: "Realized P&L in account currency. Positive values green, negative red. Commission-adjusted." },
    { name: "Duration", desc: "Position hold time. Color-coded: <1min (scalp), <1hr (intraday), >1hr (swing)." },
    { name: "Tags", desc: "Inline tag chips. Click to filter by tag. Multi-tag support with color coding." },
    { name: "Journal", desc: "Icon indicator showing whether pre/post-trade notes exist. Click to jump directly to the Journal page for that trade." },
  ]

  return (
    <div className="public-page space-y-10 text-[var(--qe-ref-text)]">
      {/* HERO */}
      <div>
        <div className={eyebrowStyle}>TRADE LOG</div>
        <h1 className="ref-h-section mt-2 text-[var(--qe-ref-text)]">The Complete Trade Log</h1>
        <p className="ref-body mt-3 max-w-[68ch] text-[var(--qe-ref-text-muted)]">
          Every trade, every fill, every detail — in a sortable, filterable, editable powerhouse table. 
          The Trade Log is the authoritative record of your trading history and the gateway to journaling, 
          tagging, and analytics.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/${locale}/dashboard/trades`} className="ref-cta-primary inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-semibold text-black">
            Open Trade Log <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={`/${locale}/docs/journal`} className="ref-cta-secondary inline-flex items-center gap-2 rounded-full border px-5 py-2 text-[13px]">
            Trade Journal Docs
          </Link>
        </div>
      </div>

      {/* ON THIS PAGE */}
      <div className={cardMain}>
        <div className={eyebrowStyle}>ON THIS PAGE</div>
        <div className="mt-3 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
          {[
            ['Navigating the Trade Log', '#overview'],
            ['Column Reference', '#columns'],
            ['Filters & Search', '#filters'],
            ['Sorting & Pagination', '#sorting'],
            ['Batch Actions & Tagging', '#batch'],
            ['Editing Trades Inline', '#editing'],
            ['Export & CSV Download', '#export'],
            ['Linking to Journal & Dashboard', '#links'],
            ['FAQ', '#faq'],
          ].map(([label, href]) => (
            <a key={href} href={href} className="flex items-center gap-2 text-[var(--qe-ref-text-muted)] hover:text-[var(--qe-ref-green)] transition-colors">
              <ArrowRight className="h-3.5 w-3.5" /> {label}
            </a>
          ))}
        </div>
      </div>

      {/* OVERVIEW */}
      <div id="overview">
        <div className={eyebrowStyle}>THE BIG PICTURE</div>
        <h2 className="ref-h-section mt-2">Navigating the Trade Log</h2>
        <p className="ref-body mt-2 max-w-[65ch] text-[var(--qe-ref-text-muted)]">
          The Trade Log lives at <strong>/dashboard/trades</strong> and is the central, immutable record of every execution 
          imported or entered into Qunt Edge. It is a virtualized, server-side-paginated table built for speed at any scale.
        </p>

        {/* Layout diagram */}
        <div className="mt-6 rounded-2xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-surface-2)] p-4 sm:p-6">
          <div className="text-center text-[10px] tracking-[2px] text-[var(--qe-ref-text-muted)] mb-3">TRADE LOG LAYOUT</div>
          <svg viewBox="0 0 920 380" className="w-full h-auto max-h-[350px]" preserveAspectRatio="xMidYMid meet">
            <rect x="20" y="20" width="880" height="340" rx="16" fill="var(--qe-ref-card)" stroke="var(--qe-ref-card-border)" strokeWidth="1" />

            {/* Tab bar */}
            <rect x="30" y="35" width="850" height="32" rx="6" fill="var(--qe-ref-surface-2)" />
            <rect x="40" y="40" width="80" height="22" rx="4" fill="rgba(0,255,159,0.15)" />
            <text x="80" y="55" fill="var(--qe-ref-green)" fontSize="10" textAnchor="middle" fontWeight="600">ALL TRADES</text>
            <rect x="128" y="40" width="65" height="22" rx="4" fill="transparent" />
            <text x="160" y="55" fill="var(--qe-ref-text-muted)" fontSize="10" textAnchor="middle">WINNERS</text>
            <rect x="200" y="40" width="65" height="22" rx="4" fill="transparent" />
            <text x="232" y="55" fill="var(--qe-ref-text-muted)" fontSize="10" textAnchor="middle">LOSERS</text>
            <rect x="272" y="40" width="75" height="22" rx="4" fill="transparent" />
            <text x="310" y="55" fill="var(--qe-ref-text-muted)" fontSize="10" textAnchor="middle">BREAKEVEN</text>

            {/* Filter bar */}
            <rect x="30" y="75" width="850" height="36" rx="6" fill="rgba(0,255,159,0.04)" stroke="rgba(0,255,159,0.1)" />
            <text x="50" y="97" fill="var(--qe-ref-text-muted)" fontSize="9">🔍</text>
            <rect x="68" y="84" width="180" height="18" rx="3" fill="var(--qe-ref-surface-2)" />
            <text x="80" y="97" fill="var(--qe-ref-text-muted)" fontSize="9">Search by instrument, tag...</text>
            <rect x="260" y="84" width="80" height="18" rx="3" fill="var(--qe-ref-surface-2)" />
            <text x="300" y="97" fill="var(--qe-ref-text-muted)" fontSize="9">Date Range</text>
            <rect x="350" y="84" width="60" height="18" rx="3" fill="var(--qe-ref-surface-2)" />
            <text x="380" y="97" fill="var(--qe-ref-text-muted)" fontSize="9">Side</text>
            <rect x="420" y="84" width="60" height="18" rx="3" fill="var(--qe-ref-surface-2)" />
            <text x="450" y="97" fill="var(--qe-ref-text-muted)" fontSize="9">Account</text>
            <rect x="490" y="84" width="60" height="18" rx="3" fill="var(--qe-ref-surface-2)" />
            <text x="520" y="97" fill="var(--qe-ref-text-muted)" fontSize="9">Tags</text>
            <rect x="750" y="82" width="100" height="22" rx="4" fill="rgba(0,255,159,0.12)" />
            <text x="800" y="97" fill="var(--qe-ref-green)" fontSize="9" textAnchor="middle" fontWeight="600">+ BATCH ACTIONS</text>

            {/* Table header */}
            <rect x="30" y="120" width="850" height="28" rx="4" fill="var(--qe-ref-surface-2)" />
            {[0,1,2,3,4,5,6,7].map(i => (
              <text key={i} x={50 + i*100} y="139" fill="var(--qe-ref-text)" fontSize="9" fontWeight="600">
                {['Date', 'Instrument', 'Side', 'Qty', 'Entry', 'Exit', 'P&L', 'Tags'][i]}
              </text>
            ))}

            {/* Table rows */}
            {[0,1,2,3,4].map(row => (
              <g key={row}>
                <rect x="30" y={152 + row*32} width="850" height="28" rx="3" fill={row % 2 === 0 ? 'transparent' : 'rgba(0,255,159,0.02)'} />
                <text x="50" y={171 + row*32} fill="var(--qe-ref-text-muted)" fontSize="9">2026-05-{10+row}</text>
                <text x="150" y={171 + row*32} fill="var(--qe-ref-text)" fontSize="9">ESM6</text>
                <text x="250" y={171 + row*32} fill={row % 2 === 0 ? 'var(--qe-ref-green)' : 'rgba(255,80,80,0.8)'} fontSize="9">{row % 2 === 0 ? 'LONG' : 'SHORT'}</text>
                <text x="350" y={171 + row*32} fill="var(--qe-ref-text-muted)" fontSize="9">{2 + row}</text>
                <text x="450" y={171 + row*32} fill="var(--qe-ref-text-muted)" fontSize="9">{5540 + row*5}</text>
                <text x="550" y={171 + row*32} fill="var(--qe-ref-text-muted)" fontSize="9">{5560 + row*5}</text>
                <text x="650" y={171 + row*32} fill={row % 2 === 0 ? 'var(--qe-ref-green)' : 'rgba(255,80,80,0.8)'} fontSize="9" fontWeight="600">
                  {row % 2 === 0 ? `+$${300-row*40}` : `-$${150+row*30}`}
                </text>
                <circle cx={760} cy={167 + row*32} r="8" fill="rgba(0,255,159,0.08)" />
                <rect x="780" y={160 + row*32} width="14" height="14" rx="2" fill="var(--qe-ref-surface-2)" />
              </g>
            ))}

            {/* Pagination */}
            <rect x="30" y="315" width="850" height="28" rx="4" fill="rgba(0,255,159,0.04)" />
            <text x="50" y="334" fill="var(--qe-ref-text-muted)" fontSize="9">Showing 1-100 of 2,847 trades</text>
            <rect x="720" y="318" width="60" height="22" rx="4" fill="var(--qe-ref-surface-2)" />
            <text x="750" y="334" fill="var(--qe-ref-text)" fontSize="9" textAnchor="middle">Page 1 of 29</text>
            <rect x="790" y="318" width="36" height="22" rx="4" fill="var(--qe-ref-surface-2)" />
            <text x="808" y="334" fill="var(--qe-ref-text-muted)" fontSize="9" textAnchor="middle">→</text>
            <rect x="830" y="318" width="36" height="22" rx="4" fill="var(--qe-ref-surface-2)" />
            <text x="848" y="334" fill="var(--qe-ref-text-muted)" fontSize="9" textAnchor="middle">→→</text>
          </svg>
          <p className="text-center text-[11px] text-[var(--qe-ref-text-muted)] mt-2">The Trade Log: tabs, filter bar, sortable columns, paginated rows, and batch action toolbar.</p>
        </div>
      </div>

      {/* COLUMN REFERENCE */}
      <div id="columns">
        <div className={eyebrowStyle}>REFERENCE</div>
        <h2 className="ref-h-section mt-2">Full Column Reference</h2>
        <p className="ref-body mt-2 max-w-[70ch] text-[var(--qe-ref-text-muted)]">
          Every column is sortable (click the header), resizable (drag the column edge), and filterable. 
          Show/hide columns via the column dropdown menu in the top-right of the table header.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {columns.map((col, i) => (
            <div key={i} className={cardMain}>
              <div className={headingCard}>{col.name}</div>
              <p className={bodySmall + ' mt-2'}>{col.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div id="filters">
        <div className={eyebrowStyle}>PRECISION</div>
        <h2 className="ref-h-section mt-2">Filters &amp; Search</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Quick Search</div>
            </div>
            <p className={bodySmall + ' mt-2'}>The search bar at the top of the log is a global text search across instrument names, tags, comments, and notes. Results update in real-time as you type with a 300ms debounce.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Advanced Filters</div>
            </div>
            <p className={bodySmall + ' mt-2'}>Click the filter icon to expand the full filter panel. Filter by date range, account, instrument, side, P&L range, duration, tags, weekday, session, and more. Multiple values supported (OR logic within a filter, AND across filters).</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Tag-Based Filtering</div>
            </div>
            <p className={bodySmall + ' mt-2'}>Click any tag chip in the table to instantly filter to all trades with that tag. Shift+click multiple tags for OR filtering. The tag cloud in the sidebar shows active tag counts for the current filter set.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Saved Filter Presets</div>
            </div>
            <p className={bodySmall + ' mt-2'}>Save any combination of filters as a named preset. Access them from the filter bar dropdown. Presets sync across devices. Examples: "My Best Setups", "Revenge Trades", "Monday Morning Scalps".</p>
          </div>
        </div>
      </div>

      {/* SORTING & PAGINATION */}
      <div id="sorting">
        <div className={eyebrowStyle}>NAVIGATION</div>
        <h2 className="ref-h-section mt-2">Sorting &amp; Pagination</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className={headingCard}>Column Sorting</div>
            <p className={bodySmall + ' mt-2'}>Click any column header to sort ascending. Click again for descending. A third click clears the sort. Multi-column sort is supported — hold Shift and click additional columns. Sort state persists across page navigation within a session.</p>
            <div className="mt-3 rounded-lg bg-[var(--qe-ref-surface-2)] p-3 text-xs text-[var(--qe-ref-text-muted)]">
              Pro tip: Sort by P&L descending + Date ascending to see your best trades in chronological order.
            </div>
          </div>
          <div className={cardMain}>
            <div className={headingCard}>Pagination &amp; Page Size</div>
            <p className={bodySmall + ' mt-2'}>100 rows per page by default. Change to 25, 50, 100, 250, or 500 via the pagination dropdown. The page count indicator shows exact position in the dataset. Keyboard shortcuts: Ctrl+→/← for next/previous page.</p>
          </div>
        </div>
      </div>

      {/* BATCH ACTIONS */}
      <div id="batch">
        <div className={eyebrowStyle}>EFFICIENCY</div>
        <h2 className="ref-h-section mt-2">Batch Actions &amp; Tagging</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className={cardMain}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)] mb-3">
              <CheckCircle className="h-4.5 w-4.5" />
            </div>
            <div className={headingCard}>Multi-Select</div>
            <p className={bodySmall + ' mt-2'}>Click the checkbox column to select individual rows. Shift+click to select a contiguous range. Ctrl/Cmd+click to toggle individual selections. The batch action bar appears automatically when selections are active, showing count and available operations.</p>
          </div>
          <div className={cardMain}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)] mb-3">
              <Tag className="h-4.5 w-4.5" />
            </div>
            <div className={headingCard}>Bulk Tagging</div>
            <p className={bodySmall + ' mt-2'}>Select multiple trades and click "Add Tag" or "Remove Tag". Type to search existing tags or create new ones. Tags are applied instantly to all selected trades. The tag cloud updates counts immediately in the sidebar.</p>
          </div>
          <div className={cardMain}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)] mb-3">
              <Trash2 className="h-4.5 w-4.5" />
            </div>
            <div className={headingCard}>Bulk Delete &amp; Export</div>
            <p className={bodySmall + ' mt-2'}>Delete multiple trades at once (soft delete with 30-day recovery window). Export selected rows as CSV or Excel with the exact columns currently visible in the table. Exports respect active filters.</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5">
          <div className="font-medium mb-2">Batch Action Flow</div>
          <svg viewBox="0 0 720 50" className="w-full max-w-[620px]">
            <rect x="20" y="8" width="140" height="34" rx="6" fill="rgba(0,255,159,0.1)" stroke="rgba(0,255,159,0.3)" />
            <text x="90" y="30" fill="var(--qe-ref-text)" fontSize="10" textAnchor="middle">Select rows</text>
            <line x1="165" y1="25" x2="200" y2="25" stroke="var(--qe-ref-green)" strokeWidth="2" />
            <polygon points="200,25 192,20 192,30" fill="var(--qe-ref-green)" />
            <rect x="210" y="8" width="160" height="34" rx="6" fill="rgba(0,255,159,0.1)" stroke="rgba(0,255,159,0.3)" />
            <text x="290" y="30" fill="var(--qe-ref-text)" fontSize="10" textAnchor="middle">Choose batch action</text>
            <line x1="375" y1="25" x2="410" y2="25" stroke="var(--qe-ref-green)" strokeWidth="2" />
            <polygon points="410,25 402,20 402,30" fill="var(--qe-ref-green)" />
            <rect x="420" y="8" width="160" height="34" rx="6" fill="rgba(0,255,159,0.15)" stroke="var(--qe-ref-green)" />
            <text x="500" y="30" fill="var(--qe-ref-green)" fontSize="10" textAnchor="middle" fontWeight="600">Confirm & apply</text>
          </svg>
        </div>
      </div>

      {/* INLINE EDITING */}
      <div id="editing">
        <div className={eyebrowStyle}>FLEXIBILITY</div>
        <h2 className="ref-h-section mt-2">Editing Trades Inline</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Inline Cell Editing</div>
            </div>
            <p className={bodySmall + ' mt-2'}>Click any cell to enter edit mode. Supported field types: text (instrument, notes), number (prices, quantity), dropdown (side, account, tags), date (entry/exit timestamps). Changes auto-save 500ms after the last keystroke or on blur. A small "edited" indicator appears on modified cells.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Full Trade Sidebar</div>
            </div>
            <p className={bodySmall + ' mt-2'}>Double-click any row to open the full Trade Details sidebar. This shows all fields, execution timeline, linked journal entries (with preview), screenshots, and audit history. From here you can jump to Journal, delete, or export the single trade.</p>
          </div>
        </div>
      </div>

      {/* EXPORT */}
      <div id="export">
        <div className={eyebrowStyle}>DATA PORTABILITY</div>
        <h2 className="ref-h-section mt-2">Export &amp; CSV Download</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className={cardMain}>
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Visible Rows Export</div>
            </div>
            <p className={bodySmall + ' mt-2'}>Export only the currently visible (filtered + paginated) rows as CSV or Excel. Includes all visible columns in their current sort order. One click, instant download.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Full Export</div>
            </div>
            <p className={bodySmall + ' mt-2'}>Export the entire filtered dataset (all pages) to CSV or Excel. Background processing for large datasets — you will receive an email notification with the download link when ready.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Custom Column Export</div>
            </div>
            <p className={bodySmall + ' mt-2'}>Choose exactly which columns, date ranges, and accounts to include. Ideal for prop firm submissions, tax preparation, or importing into another system. Mapping presets remember your preferences.</p>
          </div>
        </div>
      </div>

      {/* LINKS */}
      <div id="links">
        <div className={eyebrowStyle}>ECOSYSTEM</div>
        <h2 className="ref-h-section mt-2">Linking to Journal &amp; Dashboard</h2>

        <div className="mt-4 space-y-4">
          <div className={cardMain}>
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-[var(--qe-ref-green)]/10 p-2 text-[var(--qe-ref-green)]"><FileText className="h-5 w-5" /></div>
              <div>
                <div className="font-semibold">Trade Log → Journal Pipeline</div>
                <p className="mt-1 text-sm text-[var(--qe-ref-text-muted])">
                  Every trade row with a journal icon indicates pre-trade notes, post-trade notes, or both. Click the icon to open the full Journal page pre-loaded with that trade. The journal editor slides in as a side panel, keeping the Trade Log visible for context.
                </p>
                <Link href={`/${locale}/docs/journal`} className="mt-2 inline-flex text-xs text-[var(--qe-ref-green)] hover:underline">Read the Journal documentation →</Link>
              </div>
            </div>
          </div>

          <div className={cardMain}>
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-[var(--qe-ref-green)]/10 p-2 text-[var(--qe-ref-green)]"><Target className="h-5 w-5" /></div>
              <div>
                <div className="font-semibold">Trade Log → Dashboard Widget Context</div>
                <p className="mt-1 text-sm text-[var(--qe-ref-text-muted])">
                  Filters applied in the Trade Log can be synced to the Dashboard widget context. Enable "Sync Filters" in the table settings to make every filter choice in the log propagate to the equity curve, statistics, and Copilot widgets. Toggle off for independent deep dives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WORKFLOW */}
      <div>
        <div className={eyebrowStyle}>WORKFLOW</div>
        <h2 className="ref-h-section mt-2">Common Trade Log Routines</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
          {[
            "Daily Review: Filter by today → sort by P&L descending → tag winners/losers → add batch notes → export to CSV for your personal records.",
            "Prop Firm Compliance: Filter by account → check max drawdown trades → audit rule violations → tag compliance issues → share filtered export with your firm.",
            "Pattern Discovery: Filter by tag \"Breakout\" → sort by P&L → compare win rate vs \"Reversal\" tag → create a saved filter preset for each setup type.",
          ].map((tip, i) => (
            <div key={i} className={cardNested}>
              <div className="text-[10px] text-[var(--qe-ref-green)] font-semibold tracking-widest mb-1">ROUTINE {i+1}</div>
              {tip}
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div id="faq">
        <div className={eyebrowStyle}>QUESTIONS</div>
        <h2 className="ref-h-section mt-2">Common Questions</h2>
        <div className="mt-4 space-y-2">
          {faqs.map((faq, index) => (
            <details key={index} open={openFaq === index} onToggle={() => setOpenFaq(openFaq === index ? null : index)} className="group rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)]">
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-medium">
                {faq.q}
                <span className="text-[var(--qe-ref-text-muted)] group-open:rotate-180 transition">⌄</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-[var(--qe-ref-text-muted)] border-t border-[var(--qe-ref-card-border)] pt-4">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-8 text-center">
        <div className="text-lg font-semibold tracking-tight">Master your trade history</div>
        <p className="mt-2 text-sm text-[var(--qe-ref-text-muted])">The Trade Log is the foundation of every insight on Qunt Edge.</p>
        <Link href={`/${locale}/docs/journal`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--qe-ref-green)] px-8 py-2.5 text-sm font-semibold text-black hover:opacity-90">
          Next: Trade Journal <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="mt-4 text-[11px] text-[var(--qe-ref-text-muted)]">Also see: <Link href={`/${locale}/docs/statistics`} className="underline underline-offset-2 hover:no-underline">Statistics</Link> • <Link href={`/${locale}/docs/import`} className="underline underline-offset-2 hover:no-underline">Data Import</Link></div>
      </div>

      <div className="text-center text-[10px] text-[var(--qe-ref-text-muted)] pt-4">The Trade Log supports 10,000+ trades with virtualized rendering and server-side pagination.</div>
    </div>
  )
}
