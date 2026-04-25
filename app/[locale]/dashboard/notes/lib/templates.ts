export interface NoteTemplate {
  id: string
  name: string
  description: string
  content: string
  category: 'pre-market' | 'post-market' | 'analysis' | 'planning' | 'review'
}

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'pre-market-checklist',
    name: 'Pre-Market Checklist',
    description: 'Prepare your trading day with this comprehensive checklist',
    category: 'pre-market',
    content: `<h2>Pre-Market Checklist</h2>
<h3>Market Analysis</h3>
<ul>
<li>Review overnight market movements</li>
<li>Check key support and resistance levels</li>
<li>Identify potential trading setups</li>
<li>Review economic calendar for today</li>
</ul>
<h3>Risk Management</h3>
<ul>
<li>Set daily loss limit: $________</li>
<li>Set daily profit target: $________</li>
<li>Max position size: ________ lots/shares</li>
<li>Max trades per day: ________</li>
</ul>
<h3>Trading Plan</h3>
<ul>
<li>Primary symbols to watch: _____________</li>
<li>Session focus: (London / US / Asia)</li>
<li>Strategy focus: _____________</li>
</ul>
<h3>Mindset Check</h3>
<ul>
<li>Am I well-rested? (Yes/No)</li>
<li>Am I emotionally balanced? (Yes/No)</li>
<li>Am I following my rules? (Yes/No)</li>
</ul>
<p><em>Notes: </em></p>`
  },
  {
    id: 'post-market-review',
    name: 'Post-Market Review',
    description: 'Reflect on your trading performance and lessons learned',
    category: 'post-market',
    content: `<h2>Post-Market Review</h2>
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
    id: 'trade-thesis',
    name: 'Trade Thesis',
    description: 'Document your reasoning before entering a trade',
    category: 'analysis',
    content: `<h2>Trade Thesis</h2>
<h3>Setup Information</h3>
<ul>
<li>Symbol: _____________</li>
<li>Direction: (Long / Short)</li>
<li>Entry price: $________</li>
<li>Stop loss: $________</li>
<li>Take profit: $________</li>
<li>Risk/Reward ratio: ________</li>
</ul>
<h3>Market Context</h3>
<p>Why is this setup valid now?</p>
<p><br></p>
<h3>Technical Analysis</h3>
<ul>
<li>Key levels: _____________</li>
<li>Trend: (Uptrend / Downtrend / Range)</li>
<li>Pattern: _____________</li>
<li>Indicators: _____________</li>
</ul>
<h3>Fundamental Factors</h3>
<p><br></p>
<h3>Risk Assessment</h3>
<p>What could go wrong with this trade?</p>
<p><br></p>
<h3>Trade Management</h3>
<ul>
<li>Will I move stop to breakeven? (Yes/No)</li>
<li>Will I scale out? (Yes/No)</li>
<li>Under what conditions will I exit early?</li>
</ul>
<p><br></p>`
  },
  {
    id: 'scalping-notes',
    name: 'Scalping Notes',
    description: 'Quick notes for scalping sessions',
    category: 'analysis',
    content: `<h2>Scalping Session Notes</h2>
<h3>Session Details</h3>
<ul>
<li>Date: _____________</li>
<li>Session: (London / US / Asia)</li>
<li>Symbols: _____________</li>
</ul>
<h3>Scalping Strategy</h3>
<p>Strategy focus: _____________</p>
<p><br></p>
<h3>Key Observations</h3>
<ul>
<li>Market volatility: (High / Medium / Low)</li>
<li>Spread conditions: _____________</li>
<li>Best time window: _____________</li>
</ul>
<h3>Quick Wins</h3>
<p>What worked well today?</p>
<p><br></p>
<h3>Mistakes to Avoid</h3>
<p>What should I stop doing?</p>
<p><br></p>
<h3>Quick Trades</h3>
<table>
<tr>
<th>Time</th>
<th>Symbol</th>
<th>Result</th>
<th>Notes</th>
</tr>
<tr>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
</table>`
  },
  {
    id: 'risk-plan',
    name: 'Risk Plan',
    description: 'Define your risk management approach',
    category: 'planning',
    content: `<h2>Risk Management Plan</h2>
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
<h3>Rules Checklist</h3>
<ul>
<li>Never risk more than _____% on one trade</li>
<li>Always use a stop loss</li>
<li>Never move stop loss away from entry</li>
<li>Stop trading if emotional</li>
</ul>`
  },
  {
    id: 'lessons-learned',
    name: 'Lessons Learned',
    description: 'Document valuable lessons from your trading journey',
    category: 'review',
    content: `<h2>Lessons Learned</h2>
<h3>What I Did Well</h3>
<p>Recent wins and what I can replicate:</p>
<ul>
<li></li>
<li></li>
<li></li>
</ul>
<h3>What I Need to Improve</h3>
<p>Areas that need work:</p>
<ul>
<li></li>
<li></li>
<li></li>
</ul>
<h3>Mistakes to Avoid</h3>
<p>Patterns that lead to losses:</p>
<ul>
<li></li>
<li></li>
<li></li>
</ul>
<h3>Key Insights</h3>
<p>Aha moments and breakthroughs:</p>
<ul>
<li></li>
<li></li>
<li></li>
</ul>
<h3>Action Plan</h3>
<p>What will I do differently starting tomorrow?</p>
<ul>
<li></li>
<li></li>
<li></li>
</ul>
<h3>Quotes to Remember</h3>
<p><em>"</em></p>`
  },
  {
    id: 'weekly-summary',
    name: 'Weekly Summary',
    description: 'Review your trading performance over the week',
    category: 'review',
    content: `<h2>Weekly Trading Summary</h2>
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
<tr>
<th>Day</th>
<th>Trades</th>
<th>Win Rate</th>
<th>P&L</th>
<th>Notes</th>
</tr>
<tr>
<td>Monday</td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>Tuesday</td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>Wednesday</td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>Thursday</td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>Friday</td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
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
    id: 'daily-summary',
    name: 'Daily Summary',
    description: 'Quick daily recap of your trading activities',
    category: 'review',
    content: `<h2>Daily Trading Summary</h2>
<h3>Date</h3>
<p>_____________</p>
<h3>Performance Metrics</h3>
<ul>
<li>Total trades: ________</li>
<li>Winning trades: ________</li>
<li>Losing trades: ________</li>
<li>Net P&L: $________</li>
<li>Win rate: ________%</li>
</ul>
<h3>Best Trade</h3>
<p><br></p>
<h3>Worst Trade</h3>
<p><br></p>
<h3>What Went Well</h3>
<ul>
<li></li>
<li></li>
</ul>
<h3>What Needs Improvement</h3>
<ul>
<li></li>
<li></li>
</ul>
<h3>Tomorrow's Plan</h3>
<ul>
<li></li>
<li></li>
</ul>
<h3>Mood / Energy Level</h3>
<p>______/10</p>`
  }
]

export function getTemplateById(id: string): NoteTemplate | undefined {
  return NOTE_TEMPLATES.find(t => t.id === id)
}

export function getTemplatesByCategory(category: NoteTemplate['category']): NoteTemplate[] {
  return NOTE_TEMPLATES.filter(t => t.category === category)
}
