# Qunt Edge - Project Architecture Map

**Generated:** 2026-04-10
**Branch:** v2

---

## 🏗️ PROJECT OVERVIEW

**Qunt Edge** is an open-source trading analytics platform for professional futures/prop-firm traders. Built with **Next.js 15**, App Router, and modern stack for multi-surface applications.

### Key Dimensions
- **User Surfaces**: Public Marketing → Authenticated Dashboard → Admin → Team Collaboration
- **Data Sources**: Multiple brokers (Tradovate, Rithmic, MT5, etc.) → Database → AI Analysis
- **Tech Stack**: Next.js 15 + React 19 → Prisma + PostgreSQL → Zustand + Redis → Supabase Auth

---

## 📁 DIRECTORY STRUCTURE MAP

```
qunt-edge/
├── 🌐 app/                          # Next.js App Router (77 pages, 57 API routes)
│   ├── [locale]/                   # i18n dynamic segment (en, fr)
│   │   ├── (home)/                 # Home page
│   │   ├── (landing)/              # Marketing pages
│   │   ├── (authentication)/       # Sign-in/sign-up
│   │   ├── dashboard/              # Trading analytics (120+ components)
│   │   ├── admin/                  # Admin panel
│   │   ├── teams/                  # Team collaboration
│   │   ├── shared/[slug]/          # Public shared views
│   │   └── embed/                  # Embeddable charts
│   └── api/                        # HTTP API endpoints
├── 🧩 components/                   # UI Components (61 shadcn/ui + 20+ custom)
│   ├── ui/                         # shadcn/ui base components
│   ├── ui/v2/                      # V2 design system
│   ├── ai-elements/                # AI chat/response components
│   ├── emails/                     # React-email templates
│   └── animation/                  # Framer Motion utilities
├── ⚙️ server/                      # Server-side business logic (32 modules)
│   ├── imports/                    # Broker sync actions
│   ├── auth.ts                    # Authentication logic
│   ├── billing.ts                  # Payment processing
│   └── webhook-service.ts          # Webhook handlers
├── 🔧 lib/                         # Shared utilities (63 modules)
│   ├── ai/                        # AI SDK & policies
│   ├── analytics/                 # Risk metrics & VaR
│   ├── security/                  # Auth & security
│   └── widget-policy-engine/      # Risk scoring engine
├── 🗃️ store/                       # Zustand state management (27 stores)
├── 🌍 context/                     # React context providers (10 providers)
├── 🗄️ prisma/                      # Database schema & migrations (99 migrations)
├── 🗺️ locales/                     # i18n translations (en, fr)
└── 📄 proxy.ts                     # Middleware (route classification, auth, CSP)
```

---

## 🔄 DATA FLOW ARCHITECTURE

```
📥 User Request
    ↓
🔧 Proxy Middleware (proxy.ts)
    ├─ Route Classification (public/private/auth)
    ├─ Auth Boundary
    ├─ CSP Headers
    └─ i18n Redirect
    ↓
🌐 Next.js App Router
    ↓
🎯 Surface Layout
    ├─ Public Marketing: Landing pages, blogs, community
    ├─ Authenticated Dashboard: Trading analytics, widgets
    ├─ Admin Panel: Content management, propfirms, coupons
    └─ Team Dashboard: Collaboration, shared views
    ↓
🔌 Context Providers
    ├─ DataProvider (context/data-provider.tsx)
    │   ├─ DataStateProvider: Raw trades/accounts
    │   ├─ DataDerivedProvider: Computed metrics
    │   └─ DataActionsProvider: Mutations
    ├─ ThemeProvider
    └─ AuthProvider
    ↓
💾 State Management (Zustand)
    ├─ useTradingDomainStore: Source of truth for trades
    ├─ useUserStore: User/subscription data
    ├─ useDashboardLayoutStore: Widget layouts
    └─ useAnalysisStore: AI analysis results
    ↓
📊 Widget System
    ├─ WidgetRegistry: 35+ widget types
    ├─ WidgetCanvas: Drag-drop layout
    └─ Dynamic Chart Components: Recharts + ChartSurface
    ↓
🤖 AI Pipeline
    ├─ AI Tools (17 intent-scoped tools)
    ├─ Chat Interface
    └─ Smart Insights Widget
    ↓
🔄 Data Sources
    ├─ Broker Integrations: Tradovate, Rithmic, MT5, etc.
    ├─ Direct Upload: CSV, PDF, Excel
    └─ Database: Prisma + PostgreSQL
```

---

## 🎯 USER JOURNEY MAPS

### 1. **New User Journey**
```
👤 Landing Page → Sign Up → Email Verification → Onboarding → 
Dashboard Setup → First Import → AI Insights → Continuous Use
```

### 2. **Trading Workflow**
```
📊 Dashboard View → Account Setup → Trade Import → 
Analysis (Charts/Stats) → AI Insights → Trade Review → 
Performance Tracking → Strategy Refinement
```

### 3. **Team Collaboration**
```
👥 Create Team → Invite Members → Shared Dashboard → 
Team Analysis → Performance Comparison → Knowledge Sharing
```

---

## 🔧 TECH STACK BREAKDOWN

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **State**: Zustand (27 stores with persist)
- **UI**: shadcn/ui + Tailwind CSS + Framer Motion
- **Charts**: Recharts + ChartSurface wrappers
- **Forms**: React Hook Form + Zod validation
- **Rich Text**: Tiptap + Y.js for collaboration

### Backend
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Supabase Auth + Custom JWT
- **API**: Next.js API Routes (57 endpoints)
- **Caching**: Redis + Vercel Runtime Cache
- **AI**: OpenAI SDK + Custom policy engine

### Infrastructure
- **Deployment**: Vercel with cron jobs
- **Payments**: Whop SDK (not Stripe)
- **Broker APIs**: Tradovate, Rithmic, MT5, etc.
- **Email**: React-email + Resend
- **Analytics**: Vercel + Custom metrics

---

## 🏛️ ARCHITECTURAL PATTERNS

### 1. **Cache Components Pattern**
```typescript
'use cache'
cacheLife('stale: 3600 revalidate: 3600 expire: 7200')
cacheTag('data-list', `data-${id}`)
```

### 2. **Widget System Architecture**
```
WidgetRegistry → WidgetCanvas → LazyWidget → ChartSurface → Recharts
```

### 3. **Server Actions Pattern**
```typescript
'use server'
export async function saveTradesAction(trades: Trade[]) {
  // Prisma mutation
  await updateTag('trades-list')
  return { success: true }
}
```

### 4. **Authentication Flow**
```
Middleware → Supabase Auth → requireUser() → Server actions
```

### 5. **Data Flow Pattern**
```
Server Components → Cached functions → Prisma
↓
Mutations → Server actions → updateTag()
↓
Client components → Context providers → Zustand stores
```

---

## 🔐 SECURITY BOUNDARIES

### 1. **Route Classification**
- `PRIVATE_DOCUMENT_PATH_PREFIXES`: Auth-required routes
- `CORS_ORIGINS`: Approved domains
- `CSP_HEADERS`: Content Security Policy

### 2. **Authentication Layers**
- Middleware (proxy.ts)
- requireUser() in API routes
- Supabase auth checks
- JWT validation

### 3. **Data Protection**
- Token encryption for sensitive data
- Rate limiting (Upstash)
- Input validation (Zod)
- SQL injection prevention (Prisma)

---

## 🚀 PERFORMANCE STRATEGIES

### 1. **Caching Strategy**
- **Data Caching**: `use cache` with tags in server helpers
- **Widget Caching**: Component-level memoization
- **Bundle Optimization**: Route-based code splitting

### 2. **Rendering Optimization**
- **PPR**: Partial Prerendering for static parts
- **Dynamic Imports**: Charts and heavy components
- **Virtual Scrolling**: Large tables with react-virtual

### 3. **Database Optimization**
- **Indexed Queries**: Performance indices on trades, accounts
- **Connection Pooling**: Serverless-safe Prisma pool
- **Batch Operations**: Bulk trade imports

---

## 📊 METRICS & ANALYTICS

### Business Metrics
- **Trading Score**: Single source of truth (`score-calculator.ts`)
- **Risk Metrics**: VaR, Sharpe ratio, consistency percentage
- **Performance**: PnL distributions, win rates, drawdown

### Technical Metrics
- **Bundle Size**: Route budgets enforced
- **Core Web Vitals**: Lighthouse performance checks
- **Error Rates**: Error boundary tracking
- **Cache Hit Rates**: Redis cache monitoring

---

## 🔗 INTEGRATION MAP

### External Services
```
🤖 OpenAI → AI Analysis & Chat
💳 Whop → Payments & Subscriptions
📧 Resend → Transactional Emails
📊 Vercel → Analytics & Monitoring
🔄 Brokers → Tradovate, Rithmic, MT5, etc.
```

### Data Synchronization
```
📤 Export: User data → Shared views
📥 Import: Brokers → Local database
🔄 Real-time: WebSocket for live updates
📊 Analytics: Performance tracking
```

---

## 🚨 ANTI-PATTERNS TO AVOID

### 1. **Data Patterns**
- ❌ No `as any` types (ESLint error)
- ❌ No `console.log` (ERROR level)
- ❌ No synthesized fallback data
- ❌ No Trading Score duplication

### 2. **Architecture Patterns**
- ❌ No `unstable_cache` (use `use cache`)
- ❌ No module-scope Supabase admin client
- ❌ No stacked/double frames in UI
- ❌ No setState in effects

### 3. **Security Patterns**
- ❌ No hardcoded hex colors
- ❌ No arbitrary border-radius
- ❌ No bypass auth checks
- ❌ No `@ts-ignore`/`@ts-expect-error`

---

## 🎯 ROADMAP & EVOLUTION

### Current Status (v2)
- ✅ Multi-surface application
- ✅ Widget system with drag-drop
- ✅ AI trading assistant
- ✅ Team collaboration
- ✅ Broker integrations
- ✅ Payment lifecycle

### Future Directions
- 🔄 Mobile app development
- 🔄 Advanced AI features
- 🔄 More broker integrations
- 🔄 API platform for third parties
- 🔄 Enhanced analytics suite

---

## 📞 DEVELOPMENT WORKFLOW

### Commands
```bash
npm run dev                    # Development server
npm run build                  # Production build (with retries)
npm run typecheck              # TypeScript validation
npm run test                   # Unit tests
npm run self-heal              # Auto-fix common issues
npm run check:route-budgets    # Bundle size validation
npm run perf:lighthouse        # Performance analysis
```

### Development Patterns
- **No semicolons, single quotes, trailing commas**
- **100 character line width limit**
- **ESLint strict rules enforcement**
- **Co-located testing** in `__tests__` directories

---

This map provides a comprehensive overview of Qunt Edge's architecture, helping developers understand the system's structure, data flow, and key patterns.