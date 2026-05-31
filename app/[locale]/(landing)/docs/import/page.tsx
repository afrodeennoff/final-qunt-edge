'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useCurrentLocale } from '@/locales/client'
import {
  FileUp, Upload, Link as LinkIcon, Database, FileText,
  ArrowRight, Check, Download, RefreshCw, AlertTriangle,
  FileSpreadsheet, HardDrive, BookOpen
} from 'lucide-react'

const cardMain = 'rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5 sm:p-6'
const cardNested = 'rounded-lg bg-[var(--qe-ref-surface-2)] p-4'
const eyebrowStyle = 'text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)] uppercase'
const headingCard = 'text-[17px] font-semibold tracking-[-0.01em]'
const bodySmall = 'text-[13px] leading-[1.55] text-[var(--qe-ref-text-muted)]'
const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ')

export default function DocsImportPage() {
  const locale = useCurrentLocale()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: "Will importing duplicate trades if I import the same file twice?",
      a: "No — duplicate detection is automatic. The system matches by broker trade ID, and on a combination of instrument + entry time + price + quantity for manual imports. Duplicates are marked and skipped with a notification showing how many were detected."
    },
    {
      q: "How far back can I import trade history?",
      a: "There is no limit. Import your entire trading career — 1 year, 5 years, or more. Large imports (10,000+ trades) are processed in the background and you will receive a notification when complete. The system handles historical data from any date."
    },
    {
      q: "Do I need to re-import every time I trade?",
      a: "For API-connected brokers (Tradovate, Rithmic, DXfeed), trades sync automatically in real-time — no manual import needed. For file-based imports, import your daily or weekly exports. The Import page remembers your column mappings for CSV files, making subsequent imports one-click."
    },
    {
      q: "Can I import data from multiple brokers into one account?",
      a: "Trades are scoped to their source account. If you use the same broker account number, they merge into the same account record. If you import from different brokers into the same named account, the system can combine them — but we recommend keeping broker sources separate for clean tracking."
    },
  ]

  const platforms = [
    { name: "Tradovate", type: "Auto-Sync", method: "OAuth", desc: "Real-time trade sync via official API. Authorize once, trades appear within seconds of closing." },
    { name: "Rithmic", type: "Auto-Sync", method: "API Key", desc: "Direct Rithmic API integration. Enter your credentials, trades sync automatically." },
    { name: "DXfeed", type: "Auto-Sync", method: "API Key", desc: "Real-time DXfeed trade data synchronization. Full execution details including fees." },
    { name: "NinjaTrader", type: "File Upload", method: ".txt / .csv", desc: "Import NinjaTrader trade logs and execution reports. Supports all NinjaTrader export formats." },
    { name: "MetaTrader 5", type: "File Upload", method: ".xml / .csv", desc: "MT5 trade history exports. Supports both MT4 and MT5 formats." },
    { name: "Interactive Brokers", type: "PDF / CSV", method: "File Upload", desc: "Upload IBKR activity statements (PDF) or Flex Queries (CSV). Advanced PDF parsing extracts all trade details." },
    { name: "TradingView", type: "File Upload", method: ".csv", desc: "Export your TradingView trade journal as CSV and import directly. Strategy tester results also supported." },
    { name: "Thinkorswim", type: "File Upload", method: ".csv", desc: "TOS trade export files supported. Full order and execution history." },
    { name: "MultiCharts", type: "File Upload", method: ".csv", desc: "MultiCharts trade logs and strategy performance reports." },
    { name: "Quantower", type: "File Upload", method: ".csv / .xml", desc: "Quantower trade history exports in standard formats." },
    { name: "TradeZella", type: "File Upload", method: ".csv", desc: "Migrate from TradeZella to Qunt Edge with full trade history." },
    { name: "Topstep", type: "File Upload", method: ".csv", desc: "Topstep Trader performance reports and trade data exports." },
    { name: "FTMO", type: "File Upload", method: ".csv", desc: "FTMO challenge trading reports and statement exports." },
    { name: "CSV / Excel", type: "Generic", method: "Column Mapping", desc: "Import any CSV or Excel file with custom column mapping. The system remembers your mappings for repeat imports." },
    { name: "Manual Entry", type: "Manual", method: "Form Entry", desc: "Enter trades one at a time or in bulk via the manual trade entry form. Perfect for paper trading or adding missing trades." },
  ]

  return (
    <div className="qe-home-ref space-y-10 text-[var(--qe-ref-text)]">
      {/* HERO */}
      <div>
        <div className={eyebrowStyle}>DATA IMPORT</div>
        <h1 className="ref-h-section mt-2 text-[var(--qe-ref-text)]">Trade Import & Platform Sync</h1>
        <p className="ref-body mt-3 max-w-[68ch] text-[var(--qe-ref-text-muted)]">
          Get your trade history into Qunt Edge — fast, accurate, and reliable. Auto-sync with major brokers for real-time 
          trade capture, or import from 15+ platforms via file upload. Every importer includes smart parsing, duplicate 
          detection, and automatic tag suggestions.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/${locale}/dashboard`} className="ref-cta-primary inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-semibold text-black">
            Open Import Page <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={`/${locale}/docs/getting-started`} className="ref-cta-secondary inline-flex items-center gap-2 rounded-full border px-5 py-2 text-[13px]">
            Quick Start Guide
          </Link>
        </div>
      </div>

      {/* ON THIS PAGE */}
      <div className={cardMain}>
        <div className={eyebrowStyle}>ON THIS PAGE</div>
        <div className="mt-3 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
          {[
            ['Auto-Sync Brokers', '#autosync'],
            ['File Import Formats', '#fileimport'],
            ['CSV Column Mapping', '#csv'],
            ['PDF Import (IBKR)', '#pdf'],
            ['Manual Trade Entry', '#manual'],
            ['Duplicate Detection', '#duplicates'],
            ['Import History & Logs', '#history'],
            ['Troubleshooting & Tips', '#troubleshoot'],
            ['FAQ', '#faq'],
          ].map(([label, href]) => (
            <a key={href} href={href} className="flex items-center gap-2 text-[var(--qe-ref-text-muted)] hover:text-[var(--qe-ref-green)] transition-colors">
              <ArrowRight className="h-3.5 w-3.5" /> {label}
            </a>
          ))}
        </div>
      </div>

      {/* ALL PLATFORMS TABLE */}
      <div>
        <div className={eyebrowStyle}>ALL PLATFORMS</div>
        <h2 className="ref-h-section mt-2">Supported Platforms & Import Methods</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {platforms.map((p, i) => (
            <div key={i} className={cardMain}>
              <div className="flex items-center justify-between mb-2">
                <div className={headingCard}>{p.name}</div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  p.type === 'Auto-Sync' ? 'bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]' :
                  p.type === 'Manual' ? 'bg-purple-500/10 text-purple-400' :
                  'bg-blue-500/10 text-blue-400'
                }`}>{p.type}</span>
              </div>
              <p className={bodySmall}>{p.desc}</p>
              <div className="mt-2 text-[10px] text-[var(--qe-ref-text-muted)]">{p.method}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AUTO-SYNC */}
      <div id="autosync">
        <div className={eyebrowStyle}>REAL-TIME</div>
        <h2 className="ref-h-section mt-2">Auto-Sync Brokers</h2>
        <p className="ref-body mt-2 max-w-[70ch] text-[var(--qe-ref-text-muted)]">
          Auto-sync brokers connect via API and stream trades into Qunt Edge in real-time. Once authorized, 
          every fill appears in your Trade Log within seconds — no manual export, no file uploads.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            { name: "Tradovate", icon: LinkIcon, steps: "Go to Import → Connect Broker → Select Tradovate → Click 'Authorize' → OAuth popup confirms → Done. Trades start appearing immediately." },
            { name: "Rithmic", icon: Database, steps: "Go to Import → Connect Broker → Select Rithmic → Enter Rithmic username + API key → Encrypted and stored → Trades sync on next connection." },
            { name: "DXfeed", icon: HardDrive, steps: "Go to Import → Connect Broker → Select DXfeed → Enter API credentials → Verify connection → Real-time trade streaming begins." },
          ].map((b, i) => (
            <div key={i} className={cardMain}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)] mb-3">
                <b.icon className="h-4.5 w-4.5" />
              </div>
              <div className={headingCard}>{b.name}</div>
              <div className="mt-2 rounded-lg bg-[var(--qe-ref-surface-2)] p-3 text-xs text-[var(--qe-ref-text-muted)]">
                {b.steps}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FILE IMPORT */}
      <div id="fileimport">
        <div className={eyebrowStyle}>FILE-BASED</div>
        <h2 className="ref-h-section mt-2">File Import Formats</h2>
        <div className="cardMain">
          <p className={bodySmall}>For brokers without direct API support, upload your trade export files. The import page accepts multiple formats and provides clear feedback on parsing results:</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
            {[
              { fmt: "NinjaTrader (.txt / .csv)", desc: "Execution reports and trade logs from NinjaTrader 7 & 8" },
              { fmt: "MT5 (.xml / .csv)", desc: "Trade history exports from MetaTrader 4 and 5" },
              { fmt: "IBKR (PDF)", desc: "Interactive Brokers activity statements — PDF parsing included" },
              { fmt: "TradingView (.csv)", desc: "Trade journal and strategy tester exports" },
              { fmt: "Thinkorswim (.csv)", desc: "TOS trade history exports" },
              { fmt: "MultiCharts (.csv)", desc: "MultiCharts trade logs and reports" },
              { fmt: "Quantower (.csv)", desc: "Quantower trade history" },
              { fmt: "TradeZella (.csv)", desc: "Migration from TradeZella" },
              { fmt: "Topstep (.csv)", desc: "Topstep Trader performance reports" },
              { fmt: "FTMO (.csv)", desc: "FTMO challenge and funded account reports" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-[var(--qe-ref-surface-2)] p-2.5">
                <Upload className="h-3.5 w-3.5 text-[var(--qe-ref-green)] shrink-0" />
                <div><span className="font-medium text-[var(--qe-ref-text)]">{f.fmt.split(" (")[0]}</span><span className="text-[var(--qe-ref-text-muted)]"> ({f.fmt.split(" (")[1] || ""}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSV */}
      <div id="csv">
        <div className={eyebrowStyle}>GENERIC</div>
        <h2 className="ref-h-section mt-2">CSV Column Mapping</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="headingCard">How It Works</div>
            <p className={bodySmall + ' mt-2'}>Upload any CSV or Excel file. The system analyzes the first row (headers) and automatically maps columns. Review the mapping and adjust if needed. Core trade fields (instrument, side, quantity, entry/exit, P&L) are required; all others are optional. Manual mapping is persistent — once you map columns for a file format, the system remembers for next time.</p>
          </div>
          <div className={cardMain}>
            <div className="headingCard">Mappable Fields</div>
            <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
              {["Instrument", "Side (Buy/Sell)", "Quantity", "Entry Price", "Exit Price", "Entry Date", "Exit Date", "P&L", "Commission", "Fees", "Broker ID", "Tags", "Strategy", "Notes", "Duration"].map(f => (
                <span key={f} className="rounded bg-[var(--qe-ref-surface-2)] px-2 py-1 text-[var(--qe-ref-text-muted)]">{f}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* IBKR PDF */}
      <div id="pdf">
        <div className={eyebrowStyle}>ADVANCED PARSING</div>
        <h2 className="ref-h-section mt-2">Interactive Brokers PDF Import</h2>
        <div className="cardMain">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-[var(--qe-ref-green)]/10 p-2 text-[var(--qe-ref-green)]"><FileText className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold mb-2">From PDF to Trade Log in One Upload</div>
              <p className="text-sm text-[var(--qe-ref-text-muted)]">Upload your IBKR activity statement (PDF format). The parser extracts all executed trades, including: instrument, side, quantity, entry/exit prices, commissions, fees, and dates. Supports both "Trades" and "Corporate Actions" sections. Trades are matched against existing records for duplicate detection. Flex Query reports (CSV) are also supported for users who prefer that format.</p>
              <p className="text-sm text-[var(--qe-ref-text-muted)] mt-2">Supported IBKR statement types: Monthly Activity Statements, Trade Confirmation Reports, and Daily Activity Reports. The parser handles multi-page documents and multiple account statements.</p>
            </div>
          </div>
        </div>
      </div>

      {/* MANUAL */}
      <div id="manual">
        <div className={eyebrowStyle}>SANDBOX</div>
        <h2 className="ref-h-section mt-2">Manual Trade Entry</h2>
        <div className="grid gap-4 mt-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Single Trade Entry</div>
            </div>
            <p className={bodySmall}>Fill in the trade entry form with all details: instrument, side, quantity, entry/exit prices and times, commissions, tags, and notes. Useful for paper trading, filling gaps in broker data, or adding trades from a platform not yet supported.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Upload className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Bulk Manual Entry</div>
            </div>
            <p className={bodySmall}>Use the bulk entry mode to paste multiple trades at once. Format: a tab-separated or comma-separated block. The bulk parser extracts fields intelligently and presents them for review before saving.</p>
          </div>
        </div>
      </div>

      {/* DUPLICATE DETECTION */}
      <div id="duplicates">
        <div className={eyebrowStyle}>CLEAN DATA</div>
        <h2 className="ref-h-section mt-2">Duplicate Detection</h2>
        <div className="cardMain">
          <p className={bodySmall}>Every import runs through the duplicate detection engine. The system identifies potential duplicates using multiple strategies:</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
            {[
              { name: "Broker Trade ID", desc: "Exact match on the broker's unique trade identifier (most reliable)" },
              { name: "Fuzzy Matching", desc: "Instrument + entry time + quantity + price — within configurable tolerance windows" },
              { name: "Manual Override", desc: "After import, review flagged duplicates and approve or reject each match" },
            ].map((d, i) => (
              <div key={i} className="rounded-lg bg-[var(--qe-ref-surface-2)] p-3">
                <div className="font-medium text-[var(--qe-ref-text)]">{d.name}</div>
                <div className="text-[var(--qe-ref-text-muted)] mt-1">{d.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HISTORY */}
      <div id="history">
        <div className={eyebrowStyle}>AUDIT</div>
        <h2 className="ref-h-section mt-2">Import History & Logs</h2>
        <div className="cardMain">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-[var(--qe-ref-green)]/10 p-2 text-[var(--qe-ref-green)]"><RefreshCw className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold mb-2">Every Import Logged</div>
              <p className="text-sm text-[var(--qe-ref-text-muted)]">The Import History page shows every import you have ever done: date, source (broker/file name), number of trades imported, duplicates skipped, and errors (if any). Click any import to see the full log, including which specific trades were added, skipped, or failed. This audit trail is invaluable for reconciling your Qunt Edge data against broker statements.</p>
            </div>
          </div>
        </div>
      </div>

      {/* TROUBLESHOOT */}
      <div id="troubleshoot">
        <div className={eyebrowStyle}>TIPS</div>
        <h2 className="ref-h-section mt-2">Troubleshooting & Tips</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
          {[
            "Column Mismatch: If your CSV doesn't import correctly, check header names. The system provides a preview of mapped fields before finalizing. Adjust manually if needed.",
            "Time Zone Issues: Trades are stored in UTC and displayed in your profile timezone. Ensure your timezone is set correctly in Settings before importing.",
            "Large Files: Files over 10MB are processed asynchronously. You will receive a notification when processing completes. Check Import History for status.",
            "Partial Imports: If some trades fail, the import still succeeds for valid trades. Failed trades are logged with specific error messages for debugging.",
            "Format Help: Contact support if your broker's export format isn't recognized. We add new formats regularly based on user requests.",
            "Re-importing: Re-importing the same file is safe — duplicates are detected and skipped automatically. Use re-import to pick up any corrected broker exports.",
          ].map((tip, i) => (
            <div key={i} className={cardNested}>
              <div className="text-[10px] text-[var(--qe-ref-green)] font-semibold tracking-widest mb-1">TIP {i+1}</div>
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
        <div className="text-lg font-semibold tracking-tight">Import your trade history in minutes</div>
        <p className="mt-2 text-sm text-[var(--qe-ref-text-muted])">Connect a broker or upload a file. The data you need to build your edge is already there.</p>
        <Link href={`/${locale}/docs/accounts`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--qe-ref-green)] px-8 py-2.5 text-sm font-semibold text-black hover:opacity-90">
          Next: Account Management <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="mt-4 text-[11px] text-[var(--qe-ref-text-muted)]">Also see: <Link href={`/${locale}/docs/getting-started`} className="underline underline-offset-2 hover:no-underline">Getting Started</Link> • <Link href={`/${locale}/docs/trade-log`} className="underline underline-offset-2 hover:no-underline">Trade Log</Link></div>
      </div>

      <div className="text-center text-[10px] text-[var(--qe-ref-text-muted)] pt-4">The import engine supports 15+ platforms with auto-detection, duplicate prevention, and column mapping persistence.</div>
    </div>
  )
}
