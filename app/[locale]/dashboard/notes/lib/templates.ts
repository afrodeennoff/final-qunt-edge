export interface NoteTemplate {
  id: string
  name: string
  description: string
  content: string
  category: 'pre-market' | 'post-market' | 'analysis' | 'planning' | 'review' | 'execution' | 'psychology'
}

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'pre-market-analysis',
    name: 'Pre-Market Analysis',
    description: 'Prepare your trading day with market analysis and checklist',
    category: 'pre-market',
    content: `<h2>Pre-Market Analysis</h2>
<h3>Market Overview</h3>
<ul>
<li>Overnight market movements:</li>
<li>Futures direction:</li>
<li>Key economic events today:</li>
</ul>
<h3>Key Levels</h3>
<ul>
<li>Resistance levels: _____________</li>
<li>Support levels: _____________</li>
<li>Pivot points: _____________</li>
</ul>
<h3>Watchlist</h3>
<ul>
<li>Primary symbols: _____________</li>
<li>Correlation check: _____________</li>
<li>Sector strength: _____________</li>
</ul>
<h3>Setup Identification</h3>
<ul>
<li>Potential setups:</li>
<li>Entry triggers:</li>
<li>Invalidation points:</li>
</ul>
<h3>Risk Parameters</h3>
<ul>
<li>Daily loss limit: $________</li>
<li>Daily profit target: $________</li>
<li>Max position size: ________</li>
<li>Max trades per day: ________</li>
</ul>
<h3>Mindset Check</h3>
<ul>
<li>Am I well-rested? (Yes/No)</li>
<li>Am I emotionally balanced? (Yes/No)</li>
<li>Am I prepared to follow my plan? (Yes/No)</li>
</ul>`
  },
  {
    id: 'trade-execution',
    name: 'Trade Execution',
    description: 'Document your trade entry, management, and exit in real-time',
    category: 'execution',
    content: `<h2>Trade Execution Log</h2>
<h3>Setup</h3>
<ul>
<li>Symbol: _____________</li>
<li>Direction: (Long / Short)</li>
<li>Strategy: _____________</li>
</ul>
<h3>Entry</h3>
<ul>
<li>Entry price: $________</li>
<li>Stop loss: $________</li>
<li>Take profit: $________</li>
<li>Risk/Reward ratio: ________</li>
<li>Position size: _____________</li>
</ul>
<h3>Reasoning</h3>
<p>Why am I taking this trade?</p>
<p><br></p>
<h3>Trade Management</h3>
<ul>
<li>Move stop to breakeven at: $________</li>
<li>Scale out plan: _____________</li>
<li>Early exit conditions: _____________</li>
</ul>
<h3>Exit</h3>
<ul>
<li>Exit price: $________</li>
<li>Actual R:R: ________</li>
<li>Profit/Loss: $________</li>
</ul>
<h3>Post-Trade Notes</h3>
<p>What went well?</p>
<p><br></p>
<p>What could be improved?</p>
<p><br></p>`
  },
  {
    id: 'post-trade-review',
    name: 'Post-Trade Review',
    description: 'Reflect on your trading performance and lessons learned',
    category: 'post-market',
    content: `<h2>Post-Trade Review</h2>
<h3>Trading Summary</h3>
<ul>
<li>Total trades: ________</li>
<li>Winning trades: ________</li>
<li>Losing trades: ________</li>
<li>Net P&L: $________</li>
<li>Win rate: ________%</li>
</ul>
<h3>Best Trade</h3>
<p>What was my best trade today and why?</p>
<p><br></p>
<h3>Worst Trade</h3>
<p>What was my worst trade today and why?</p>
<p><br></p>
<h3>Rule Violations</h3>
<p>Did I break any trading rules? If so, which ones?</p>
<p><br></p>
<h3>Lessons Learned</h3>
<p>What did I learn today that will improve my trading?</p>
<p><br></p>
<h3>Emotional State</h3>
<p>How did I feel during the trading session?</p>
<p><br></p>
<h3>Action Items</h3>
<ul>
<li></li>
<li></li>
<li></li>
</ul>`
  },
  {
    id: 'weekly-review',
    name: 'Weekly Review',
    description: 'Review your trading performance over the week',
    category: 'review',
    content: `<h2>Weekly Review</h2>
<h3>Week Overview</h3>
<ul>
<li>Week of: _____________</li>
<li>Total trades: ________</li>
<li>Winning trades: ________</li>
<li>Losing trades: ________</li>
<li>Net P&L: $________</li>
<li>Win rate: ________%</li>
</ul>
<h3>Daily Breakdown</h3>
<table>
<tr><th>Day</th><th>Trades</th><th>Win Rate</th><th>P&L</th><th>Notes</th></tr>
<tr><td>Monday</td><td></td><td></td><td></td><td></td></tr>
<tr><td>Tuesday</td><td></td><td></td><td></td><td></td></tr>
<tr><td>Wednesday</td><td></td><td></td><td></td><td></td></tr>
<tr><td>Thursday</td><td></td><td></td><td></td><td></td></tr>
<tr><td>Friday</td><td></td><td></td><td></td><td></td></tr>
</table>
<h3>Best Day</h3>
<p>What was my best day and why?</p>
<p><br></p>
<h3>Worst Day</h3>
<p>What was my worst day and why?</p>
<p><br></p>
<h3>Patterns Identified</h3>
<p><br></p>
<h3>Goals for Next Week</h3>
<ul>
<li></li>
<li></li>
<li></li>
</ul>`
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment',
    description: 'Define your risk management approach and parameters',
    category: 'planning',
    content: `<h2>Risk Assessment</h2>
<h3>Account Risk</h3>
<ul>
<li>Account size: $________</li>
<li>Max daily loss: _____% ($________)</li>
<li>Max weekly loss: _____% ($________)</li>
<li>Max monthly loss: _____% ($________)</li>
</ul>
<h3>Per-Trade Risk</h3>
<ul>
<li>Max risk per trade: _____% ($________)</li>
<li>Max risk per day: _____% ($________)</li>
<li>Standard position size: _____________</li>
<li>Max position size: _____________</li>
</ul>
<h3>Drawdown Rules</h3>
<ul>
<li>Daily loss limit: $________ (stop trading)</li>
<li>Consecutive losing trades limit: ________</li>
<li>Max drawdown before reducing size: _____%</li>
</ul>
<h3>Recovery Plan</h3>
<p>What will I do if I hit my daily loss limit?</p>
<p><br></p>
<p>How will I recover from a losing streak?</p>
<p><br></p>
<h3>Risk Rules Checklist</h3>
<ul>
<li>Never risk more than _____% on one trade</li>
<li>Always use a stop loss</li>
<li>Never move stop loss away from entry</li>
<li>Stop trading if emotional</li>
</ul>`
  },
  {
    id: 'strategy-notes',
    name: 'Strategy Notes',
    description: 'Document and refine your trading strategies',
    category: 'analysis',
    content: `<h2>Strategy Notes</h2>
<h3>Strategy Name</h3>
<p>_____________</p>
<h3>Market Conditions</h3>
<ul>
<li>Best suited for: (Trending / Ranging / Volatile / Calm)</li>
<li>Timeframes: _____________</li>
<li>Session: (London / US / Asia / All)</li>
</ul>
<h3>Entry Rules</h3>
<ul>
<li>Primary signal: _____________</li>
<li>Confirmation: _____________</li>
<li>Filter: _____________</li>
</ul>
<h3>Exit Rules</h3>
<ul>
<li>Take profit method: _____________</li>
<li>Stop loss placement: _____________</li>
<li>Trailing stop rules: _____________</li>
</ul>
<h3>Risk Management</h3>
<ul>
<li>Position sizing method: _____________</li>
<li>Max risk per trade: _____%</li>
<li>Max open positions: ________</li>
</ul>
<h3>Performance Tracking</h3>
<ul>
<li>Backtest win rate: ________%</li>
<li>Average R:R: ________</li>
<li>Expectancy: ________</li>
<li>Max drawdown: ________%</li>
</ul>
<h3>Notes & Adjustments</h3>
<p><br></p>`
  },
  {
    id: 'trading-psychology',
    name: 'Trading Psychology',
    description: 'Journal your emotional state and mental performance',
    category: 'psychology',
    content: `<h2>Trading Psychology Journal</h2>
<h3>Pre-Session State</h3>
<ul>
<li>Energy level: ___/10</li>
<li>Confidence level: ___/10</li>
<li>Stress level: ___/10</li>
<li>Focus level: ___/10</li>
</ul>
<h3>Emotional Check-In</h3>
<p>How am I feeling right now?</p>
<p><br></p>
<p>Is anything distracting me?</p>
<p><br></p>
<h3>Mental Triggers</h3>
<ul>
<li>FOMO present? (Yes/No)</li>
<li>Revenge trading urge? (Yes/No)</li>
<li>Overconfidence? (Yes/No)</li>
<li>Fear of loss? (Yes/No)</li>
</ul>
<h3>Coping Strategies Used</h3>
<ul>
<li></li>
<li></li>
<li></li>
</ul>
<h3>Session Reflection</h3>
<p>Did I stay disciplined?</p>
<p><br></p>
<p>What would I tell myself before the next session?</p>
<p><br></p>
<h3>Gratitude</h3>
<p>Three things I am grateful for today:</p>
<ul>
<li></li>
<li></li>
<li></li>
</ul>`
  },
  {
    id: 'lesson-learned',
    name: 'Lesson Learned',
    description: 'Document valuable lessons from your trading journey',
    category: 'review',
    content: `<h2>Lesson Learned</h2>
<h3>Date</h3>
<p>_____________</p>
<h3>What Happened</h3>
<p>Describe the situation:</p>
<p><br></p>
<h3>What I Did Well</h3>
<ul>
<li></li>
<li></li>
</ul>
<h3>What I Need to Improve</h3>
<ul>
<li></li>
<li></li>
</ul>
<h3>Key Insight</h3>
<p>The main takeaway from this experience:</p>
<p><br></p>
<h3>Action Plan</h3>
<p>What will I do differently starting now?</p>
<ul>
<li></li>
<li></li>
<li></li>
</ul>
<h3>Quote to Remember</h3>
<p><em>"</em></p>`
  }
]

export function getTemplateById(id: string): NoteTemplate | undefined {
  return NOTE_TEMPLATES.find(t => t.id === id)
}

export function getTemplatesByCategory(category: NoteTemplate['category']): NoteTemplate[] {
  return NOTE_TEMPLATES.filter(t => t.category === category)
}
