# Comprehensive UI/UX & Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix black screen on landing page, implement username functionality, consolidate trader profile sections, audit and polish entire application UI end to end, and verify all interactive elements work correctly.

**Architecture:** Incremental improvements maintaining existing functionality while enhancing user experience through systematic UI/UX refinements, username system implementation, and component consolidation.

**Tech Stack:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + Radix UI + Zustand + Prisma + Supabase + Framer Motion

---

## Phase 1: Fix Landing Page Black Screen

### Task 1: Investigate Black Screen Root Cause

**Files:**
- Modify: `app/[locale]/(home)/page.tsx:1-86`
- Modify: `app/[locale]/(home)/components/HomeContent.tsx:1-288`
- Test: Manual test on /en route

- [ ] **Step 1: Add error boundary to landing page**

```tsx
// app/[locale]/(home)/components/HomeContent.tsx
'use client'

import { ErrorBoundary } from '@/components/ui/error-boundary'

export default function HomeContent({ locale }: HomeContentProps) {
  return (
    <ErrorBoundary fallback={<div className="p-8 text-center">Loading content...</div>}>
      <div className="relative min-w-0 overflow-x-hidden bg-background selection:bg-primary/30 selection:text-foreground">
        {/* existing content */}
      </div>
    </ErrorBoundary>
  )
}
```

- [ ] **Step 2: Run dev server and test /en route**

Run: `npm run dev`
Expected: Page loads with error boundary fallback instead of black screen

- [ ] **Step 3: Check console for errors**

Open browser dev tools and navigate to /en
Expected: Error logged if any JavaScript errors occur

- [ ] **Step 4: Commit error boundary addition**

```bash
git add app/[locale]/(home]/components/HomeContent.tsx
git commit -m "fix: add error boundary to landing page to catch rendering errors"
```

### Task 2: Add Loading States

**Files:**
- Modify: `app/[locale]/(home)/components/HomeContent.tsx:1-288`
- Create: `app/[locale]/(home)/components/HomeContentLoading.tsx`

- [ ] **Step 1: Create loading component**

```tsx
// app/[locale]/(home)/components/HomeContentLoading.tsx
export default function HomeContentLoading() {
  return (
    <div className="relative min-w-0 overflow-x-hidden bg-background">
      <main className="relative z-10 flex min-w-0 flex-col">
        {/* Hero loading */}
        <div className="pt-24 sm:pt-32 lg:pt-40">
          <div className="mx-auto max-w-3xl space-y-8 text-center">
            <div className="h-6 w-32 animate-pulse bg-muted rounded mx-auto" />
            <div className="space-y-6">
              <div className="h-16 w-96 animate-pulse bg-muted rounded mx-auto" />
              <div className="h-6 w-64 animate-pulse bg-muted rounded mx-auto" />
            </div>
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <div className="h-12 w-40 animate-pulse bg-muted rounded" />
              <div className="h-12 w-40 animate-pulse bg-muted rounded" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Add Suspense to HomeContent**

```tsx
// app/[locale]/(home)/components/HomeContent.tsx
import { Suspense } from 'react'
import HomeContentLoading from './HomeContentLoading'

export default async function HomeContent({ locale }: HomeContentProps) {
  return (
    <Suspense fallback={<HomeContentLoading />}>
      <div className="relative min-w-0 overflow-x-hidden bg-background">
        {/* existing content */}
      </div>
    </Suspense>
  )
}
```

- [ ] **Step 3: Test loading state**

Run: `npm run dev`
Expected: Loading skeleton appears while content loads

- [ ] **Step 4: Commit loading state implementation**

```bash
git add app/[locale]/(home)/components/HomeContentLoading.tsx app/[locale]/(home)/components/HomeContent.tsx
git commit -m "feat: add loading states to landing page"
```

### Task 3: Fix Hydration Issues

**Files:**
- Modify: `app/[locale]/(home)/page.tsx:53-85`

- [ ] **Step 1: Add proper client component handling**

```tsx
// app/[locale]/(home)/page.tsx
import dynamic from 'next/dynamic'

const HomeContent = dynamic(() => import('./components/HomeContent'), {
  loading: () => (
    <div className="relative min-w-0 overflow-x-hidden bg-background">
      <main className="relative z-10 flex min-w-0 flex-col">
        <div className="pt-24 sm:pt-32 lg:pt-40">
          <div className="mx-auto max-w-3xl space-y-8 text-center">
            <div className="h-16 w-96 animate-pulse bg-muted rounded mx-auto" />
          </div>
        </div>
      </main>
    </div>
  ),
  ssr: false
})

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  // ... existing code until locale resolution
  
  return (
    <>
      {/* existing schema scripts */}
      <HomeContent locale={locale} />
    </>
  )
}
```

- [ ] **Step 2: Test hydration fix**

Run: `npm run dev`
Expected: No hydration errors on /en route

- [ ] **Step 3: Commit hydration fix**

```bash
git add app/[locale]/(home)/page.tsx
git commit -m "fix: resolve hydration issues on landing page"
```

---

## Phase 2: Implement Username Functionality

### Task 4: Add Username to Database Schema

**Files:**
- Modify: `prisma/schema.prisma:16-75`
- Create: `prisma/migrations/20260501_add_username_to_user/migration.sql`

- [ ] **Step 1: Create migration for username field**

```sql
-- prisma/migrations/20260501_add_username_to_user/migration.sql
ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN username_hash VARCHAR(255) UNIQUE;

-- Create unique index
CREATE INDEX idx_users_username ON users(username);
```

- [ ] **Step 2: Add username to User model**

```prisma
// prisma/schema.prisma
model User {
  id                 String              @id @default(cuid())
  username           String?             @unique
  usernameHash       String?             @unique
  email              String              @unique
  // ... existing fields
  
  @@index([email])
  @@index([username])
}
```

- [ ] **Step 3: Run migration**

Run: `npx prisma migrate deploy`
Expected: Username field added to database

- [ ] **Step 4: Commit schema changes**

```bash
git add prisma/schema.prisma prisma/migrations/20260501_add_username_to_user/
git commit -m "feat: add username field to user schema"
```

### Task 5: Update User Store and Types

**Files:**
- Modify: `store/user-store.ts:24-32`
- Modify: `lib/data-types.ts:User interface`
- Create: `components/ui/user-search.tsx`

- [ ] **Step 1: Update UserStore type**

```tsx
// store/user-store.ts
type UserStore = {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  username: string | null;
  // ... existing fields
}
```

- [ ] **Step 2: Add username to User interface**

```tsx
// lib/data-types.ts
export interface User {
  id: string;
  email: string;
  username?: string;
  // ... existing fields
}
```

- [ ] **Step 3: Create user search component**

```tsx
// components/ui/user-search.tsx
'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Input } from './input'
import { Badge } from './badge'
import { useUserStore } from '@/store/user-store'

interface UserSearchProps {
  onSelect?: (user: User) => void
  placeholder?: string
}

export function UserSearch({ onSelect, placeholder = "Search users..." }: UserSearchProps) {
  const [query, setQuery] = useState('')
  const { users } = useUserStore() // This needs to be implemented
  
  const filteredUsers = useMemo(() => {
    if (!query) return []
    return users.filter(user => 
      user.username?.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    )
  }, [query, users])
  
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10"
      />
      {filteredUsers.length > 0 && (
        <div className="absolute top-full mt-1 w-full rounded-md border bg-popover shadow-md">
          {filteredUsers.map(user => (
            <div
              key={user.id}
              className="flex cursor-pointer items-center gap-2 p-2 hover:bg-accent"
              onClick={() => onSelect?.(user)}
            >
              <div className="h-8 w-8 rounded-full bg-muted" />
              <div className="flex-1">
                <p className="text-sm font-medium">{user.username || user.email}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              {user.username && (
                <Badge variant="secondary">@{user.username}</Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Commit user store updates**

```bash
git add store/user-store.ts lib/data-types.ts components/ui/user-search.tsx
git commit -m "feat: add username field and user search component"
```

### Task 6: Update Settings Page for Username

**Files:**
- Modify: `app/[locale]/dashboard/settings/page.tsx:50-100`
- Create: `app/[locale]/dashboard/settings/actions.ts`

- [ ] **Step 1: Create settings actions**

```tsx
// app/[locale]/dashboard/settings/actions.ts
import { createServerClient } from '@/server/auth'
import { NextRequest } from 'next/server'

export async function updateUsernameAction(username: string) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from('users')
    .update({ username, username_hash: Buffer.from(username).toString('hex') })
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
  
  if (error) throw error
  return { success: true }
}
```

- [ ] **Step 2: Add username setting to settings page**

```tsx
// app/[locale]/dashboard/settings/page.tsx
import { updateUsernameAction } from './actions'
import { UserSearch } from '@/components/ui/user-search'

export default function SettingsPage() {
  const user = useUserStore((state) => state.supabaseUser)
  const [username, setUsername] = useState(user?.username || '')
  
  const handleUpdateUsername = async () => {
    try {
      await updateUsernameAction(username)
      toast.success('Username updated successfully')
    } catch (error) {
      toast.error('Failed to update username')
    }
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your profile information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
          
          <div className="space-y-2">
            <Label>Username</Label>
            <div className="flex gap-2">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
              <Button onClick={handleUpdateUsername}>
                Update
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Unique username for profile display and search
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Commit settings page updates**

```bash
git add app/[locale]/dashboard/settings/page.tsx app/[locale]/dashboard/settings/actions.ts
git commit -m "feat: add username setting to user profile settings"
```

### Task 7: Replace Email Display with Username

**Files:**
- Modify: `app/[locale]/dashboard/trader-profile/page-client.tsx:915-940`
- Modify: `app/[locale]/admin/components/send-email/user-selector.tsx`
- Modify: `app/[locale]/dashboard/components/Sidebar.tsx`

- [ ] **Step 1: Update trader profile to show username**

```tsx
// app/[locale]/dashboard/trader-profile/page-client.tsx
const profileName = user?.username || user?.email || 'Unknown trader'

// Update avatar alt text
<AvatarImage src={profileAvatar ?? undefined} alt={`${profileName} avatar`} />
```

- [ ] **Step 2: Update admin user selector**

```tsx
// app/[locale]/admin/components/send-email/user-selector.tsx
interface UserOption {
  id: string
  username?: string
  email: string
}

const displayName = user.username || user.email

<select>
  {users.map(user => (
    <option key={user.id} value={user.id}>
      {user.username ? `${user.username} (${user.email})` : user.email}
    </option>
  ))}
</select>
```

- [ ] **Step 3: Update sidebar with username**

```tsx
// app/[locale]/dashboard/components/Sidebar.tsx
const user = useUserStore((state) => state.supabaseUser)
const displayName = user?.username || user?.email

// Update any display of user email to show username instead
```

- [ ] **Step 4: Commit username display updates**

```bash
git add app/[locale]/dashboard/trader-profile/page-client.tsx app/[locale]/admin/components/send-email/user-selector.tsx app/[locale]/dashboard/components/Sidebar.tsx
git commit -m "feat: replace email display with username throughout app"
```

### Task 8: Implement Username Validation

**Files:**
- Modify: `app/api/auth/route.ts`
- Create: `lib/validations/user.ts`
- Create: `components/ui/username-input.tsx`

- [ ] **Step 1: Create username validation**

```tsx
// lib/validations/user.ts
import { z } from 'zod'

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
  .transform(val => val.toLowerCase())
```

- [ ] **Step 2: Create username input component**

```tsx
// components/ui/username-input.tsx
'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Input } from './input'
import { usernameSchema } from '@/lib/validations/user'

interface UsernameInputProps {
  value: string
  onChange: (value: string) => void
  available?: boolean
}

export function UsernameInput({ value, onChange, available }: UsernameInputProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null)
  
  const validateUsername = (username: string) => {
    try {
      usernameSchema.parse(username)
      setIsValid(true)
      return true
    } catch {
      setIsValid(false)
      return false
    }
  }
  
  const handleChange = (username: string) => {
    onChange(username)
    validateUsername(username)
  }
  
  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Enter username"
        className={isValid === false ? 'border-red-500' : ''}
      />
      {value && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isValid === true ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : isValid === false ? (
            <X className="h-4 w-4 text-red-500" />
          ) : (
            <div className="h-4 w-4 animate-pulse bg-muted rounded" />
          )}
        </div>
      )}
      {!isValid && value && (
        <p className="mt-1 text-sm text-red-500">
          Username must be 3-30 characters, letters, numbers, and underscores only
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Update auth route to validate username**

```tsx
// app/api/auth/route.ts
import { usernameSchema } from '@/lib/validations/user'

export async function POST(request: Request) {
  const { username } = await request.json()
  
  if (username) {
    try {
      const validatedUsername = usernameSchema.parse(username)
      // Check if username is available
      const existingUser = await prisma.user.findUnique({
        where: { username: validatedUsername }
      })
      
      if (existingUser) {
        return Response.json({ available: false })
      }
      
      return Response.json({ available: true })
    } catch {
      return Response.json({ available: false, error: 'Invalid username' })
    }
  }
}
```

- [ ] **Step 4: Commit username validation**

```bash
git add lib/validations/user.ts components/ui/username-input.tsx app/api/auth/route.ts
git commit -m "feat: add username validation and availability check"
```

---

## Phase 3: Consolidate Trader Profile Sections

### Task 9: Merge Performance Sections

**Files:**
- Modify: `app/[locale]/dashboard/trader-profile/page-client.tsx:988-1044`
- Create: `app/[locale]/dashboard/trader-profile/components/UnifiedPerformanceDashboard.tsx`

- [ ] **Step 1: Create unified performance dashboard**

```tsx
// app/[locale]/dashboard/trader-profile/components/UnifiedPerformanceDashboard.tsx
'use client'

import { StatTile, StripMetric } from './page-client' // Import from parent

interface UnifiedPerformanceDashboardProps {
  metrics: TraderMetrics
  benchmark?: BenchmarkMetrics
  totalCapitalAllAccounts: number
  totalWithdrawAllAccounts: number
}

export function UnifiedPerformanceDashboard({
  metrics,
  benchmark,
  totalCapitalAllAccounts,
  totalWithdrawAllAccounts
}: UnifiedPerformanceDashboardProps) {
  const primaryStripMetrics = [
    { label: 'Total trades', value: String(metrics.totalTrades) },
    { label: 'Net P&L', value: formatSigned(metrics.netPnl) },
    { label: 'Win rate', value: `${formatValue(metrics.winRate)}%` },
    { label: 'Avg return', value: formatSigned(metrics.avgReturn) }
  ]
  
  return (
    <UnifiedSurface variant="elevated" className="animate-fade-up-smooth p-5 sm:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
            Performance overview
          </p>
          <h3 className="mt-1 text-lg font-semibold">Trading Performance</h3>
        </div>
        
        {/* Primary Metrics */}
        <div className="lg:col-span-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {primaryStripMetrics.map((metric) => (
            <StripMetric
              key={metric.label}
              label={metric.label}
              value={metric.value}
              tone={metric.tone}
              emphasis
              className="h-full"
            />
          ))}
        </div>
        
        {/* Accounts & Capital */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatTile
            label="Total capital"
            value={formatCapitalCompact(totalCapitalAllAccounts)}
            tone={totalCapitalAllAccounts >= 0 ? 'positive' : 'negative'}
          />
          <StatTile
            label="Total withdraw"
            value={formatCapitalCompact(totalWithdrawAllAccounts)}
          />
          <StatTile
            label="Avg net / trade"
            value={formatSigned(metrics.avgReturn)}
            tone={
              metrics.avgReturn > 0
                ? 'positive'
                : metrics.avgReturn < 0
                  ? 'negative'
                  : 'default'
            }
          />
        </div>
        
        {/* Performance & Execution Quality */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Risk reward"
            value={formatValue(metrics.riskReward)}
          />
          <StatTile
            label="Max drawdown"
            value={formatValue(metrics.drawdown)}
            tone={metrics.drawdown > 0 ? 'negative' : 'default'}
          />
          <StatTile
            label="Win rate"
            value={`${formatValue(metrics.winRate)}%`}
            tone={metrics.winRate >= 50 ? 'positive' : 'default'}
          />
          <StatTile
            label="Consistency rate"
            value={`${formatValue(metrics.consistencyRate)}%`}
            tone={metrics.consistencyRate >= 75 ? 'positive' : 'default'}
          />
        </div>
        
        {/* Benchmark Comparison */}
        {benchmark && (
          <div className="rounded-lg border border-border/30 bg-muted/30 p-4">
            <p className="text-sm font-medium mb-2">Benchmark Comparison</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Your Win Rate</span>
                <span className="font-medium">{metrics.winRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Benchmark Win Rate</span>
                <span className="font-medium">{benchmark.winRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Your Drawdown</span>
                <span className="font-medium">{formatValue(metrics.drawdown)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Benchmark Drawdown</span>
                <span className="font-medium">{formatValue(benchmark.drawdown)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </UnifiedSurface>
  )
}
```

- [ ] **Step 2: Update trader profile page**

```tsx
// app/[locale]/dashboard/trader-profile/page-client.tsx
import { UnifiedPerformanceDashboard } from './components/UnifiedPerformanceDashboard'

// Replace the three separate sections with:
<UnifiedPerformanceDashboard
  metrics={metrics}
  benchmark={benchmark}
  totalCapitalAllAccounts={totalCapitalAllAccounts}
  totalWithdrawAllAccounts={totalWithdrawAllAccounts}
/>
```

- [ ] **Step 3: Test consolidated layout**

Run: `npm run dev`
Expected: All metrics in single cohesive section with proper spacing

- [ ] **Step 4: Commit consolidation**

```bash
git add app/[locale]/dashboard/trader-profile/components/UnifiedPerformanceDashboard.tsx app/[locale]/dashboard/trader-profile/page-client.tsx
git commit -m "feat: consolidate trader profile sections into unified dashboard"
```

---

## Phase 4: Comprehensive UI Audit and Polish

### Task 10: Fix Typography Hierarchy

**Files:**
- Modify: `app/[locale]/(home)/components/HomeContent.tsx:124-133`
- Modify: `components/layout/marketing-sections.tsx`
- Modify: `components/ui/heading.tsx`

- [ ] **Step 1: Standardize heading hierarchy**

```tsx
// components/ui/heading.tsx
import { cva, type VariantProps } from 'class-variance-authority'

export const headingVariants = cva(
  'font-semibold tracking-tight',
  {
    variants: {
      size: {
        '2xl': 'text-2xl sm:text-3xl',
        xl: 'text-xl sm:text-2xl',
        lg: 'text-lg sm:text-xl',
        md: 'text-base sm:text-lg',
        sm: 'text-sm sm:text-base',
      }
    },
    defaultVariants: {
      size: '2xl',
    },
  }
)
```

- [ ] **Step 2: Update marketing sections**

```tsx
// components/layout/marketing-sections.tsx
<MarketingSectionHeader
  eyebrow={t('landing.home.features.eyebrow')}
  title={
    <h2 className={headingVariants({ size: '2xl' })}>
      {t('landing.home.features.title')}{' '}
      <span className="text-primary">{t('landing.home.features.highlight')}</span>
    </h2>
  }
  description={t('landing.home.features.description')}
/>
```

- [ ] **Step 3: Update landing page headings**

```tsx
// app/[locale]/(home)/components/HomeContent.tsx
<h1 className={headingVariants({ size: '2xl' })}>
  {t('landing.hero.headline')}
</h1>
<p className="text-lg leading-relaxed text-muted-foreground">
  {t('landing.hero.subheadline')}
</p>
```

- [ ] **Step 4: Commit typography fixes**

```bash
git add components/ui/heading.tsx components/layout/marketing-sections.tsx app/[locale]/(home)/components/HomeContent.tsx
git commit -m "feat: standardize typography hierarchy across application"
```

### Task 11: Fix Spacing and Layout

**Files:**
- Modify: `app/[locale]/(home)/components/HomeContent.tsx:119-288`
- Modify: `app/[locale]/dashboard/trader-profile/page-client.tsx:907-1044`
- Create: `components/ui/space.tsx`

- [ ] **Step 1: Create space utilities**

```tsx
// components/ui/space.tsx
import { cva } from 'class-variance-authority'

export const spaceVariants = cva('', {
  variants: {
    p: {
      none: '',
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    },
    py: {
      none: '',
      sm: 'py-2',
      md: 'py-4',
      lg: 'py-6',
      xl: 'py-8',
    },
    px: {
      none: '',
      sm: 'px-2',
      md: 'px-4',
      lg: 'px-6',
      xl: 'px-8',
    },
    gap: {
      none: '',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    }
  },
  defaultVariants: {
    p: 'md',
    py: 'md',
    px: 'md',
    gap: 'md',
  },
})
```

- [ ] **Step 2: Update marketing sections spacing**

```tsx
// app/[locale]/(home)/components/HomeContent.tsx
<MarketingSection className="py-16 lg:py-20 spaceVariants({ py: 'xl' })">
  <div className="space-y-8 spaceVariants({ py: 'lg' })">
    {/* Content */}
  </div>
</MarketingSection>
```

- [ ] **Step 3: Update trader profile spacing**

```tsx
// app/[locale]/dashboard/trader-profile/page-client.tsx
<UnifiedPageShell density="compact" className="spaceVariants({ p: 'xl' })">
  <div className="animate-page-enter space-y-8 spaceVariants({ gap: 'xl' })">
    {/* Content */}
  </div>
</UnifiedPageShell>
```

- [ ] **Step 4: Commit spacing fixes**

```bash
git add components/ui/space.tsx app/[locale]/(home)/components/HomeContent.tsx app/[locale]/dashboard/trader-profile/page-client.tsx
git commit -m "feat: standardize spacing and layout patterns"
```

### Task 12: Fix Color Contrast and Theme Tokens

**Files:**
- Modify: `tailwind.config.ts`
- Create: `lib/theme/tokens.ts`
- Modify: `components/ui/theme-provider.tsx`

- [ ] **Step 1: Create theme tokens**

```tsx
// lib/theme/tokens.ts
export const themeTokens = {
  primary: {
    50: 'hsl(var(--primary)/0.1)',
    100: 'hsl(var(--primary)/0.2)',
    500: 'hsl(var(--primary)/1)',
    700: 'hsl(var(--primary)/0.8)',
    900: 'hsl(var(--primary)/0.6)',
  },
  background: {
    card: 'hsl(var(--card))',
    muted: 'hsl(var(--muted))',
    surface: 'hsl(var(--surface))',
  },
  text: {
    primary: 'hsl(var(--text-primary))',
    secondary: 'hsl(var(--text-secondary))',
    muted: 'hsl(var(--text-muted))',
  }
}
```

- [ ] **Step 2: Update theme provider**

```tsx
// components/ui/theme-provider.tsx
import { themeTokens } from '@/lib/theme/tokens'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <style jsx global>{`
        :root {
          --primary: oklch(0.62 0.18 260);
          --text-primary: oklch(0.15 0.02 260);
          --text-secondary: oklch(0.35 0.01 260);
          --text-muted: oklch(0.55 0.01 260);
          --card: oklch(0.98 0.01 260);
          --muted: oklch(0.96 0.01 260);
          --surface: oklch(0.94 0.01 260);
        }
      `}</style>
      {children}
    </div>
  )
}
```

- [ ] **Step 3: Update components to use tokens**

```tsx
// app/[locale]/(home)/components/HomeContent.tsx
<div className="text-primary">
  <h1 className={themeTokens.text.primary}>Title</h1>
  <p className={themeTokens.text.muted}>Subtitle</p>
</div>
```

- [ ] **Step 4: Commit theme token updates**

```bash
git add lib/theme/tokens.ts components/ui/theme-provider.tsx app/[locale]/(home)/components/HomeContent.tsx
git commit -m "feat: implement theme tokens and fix color contrast"
```

### Task 13: Polish Interactive Elements

**Files:**
- Modify: `components/ui/button.tsx`
- Modify: `components/ui/input.tsx`
- Modify: `components/ui/select.tsx`
- Create: `components/ui/micro-interactions.tsx`

- [ ] **Step 1: Add hover states to buttons**

```tsx
// components/ui/button.tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
```

- [ ] **Step 2: Add focus states to inputs**

```tsx
// components/ui/input.tsx
const inputVariants = cva(
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      error: {
        true: 'border-red-500 focus-visible:ring-red-500',
        false: '',
      },
    },
    defaultVariants: {
      error: false,
    },
  }
)
```

- [ ] **Step 3: Create micro-interactions**

```tsx
// components/ui/micro-interactions.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface AnimatedButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}

export function AnimatedButton({ children, onClick, variant = 'primary' }: AnimatedButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`relative overflow-hidden rounded-md px-4 py-2 font-medium transition-colors ${
        variant === 'primary'
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground'
      }`}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 bg-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          />
        )}
      </AnimatePresence>
      {children}
    </motion.button>
  )
}
```

- [ ] **Step 4: Commit interactive element updates**

```bash
git add components/ui/button.tsx components/ui/input.tsx components/ui/select.tsx components/ui/micro-interactions.tsx
git commit -m "feat: enhance interactive elements with consistent hover and focus states"
```

### Task 14: Improve Loading and Error States

**Files:**
- Create: `components/ui/loading.tsx`
- Create: `components/ui/error-boundary.tsx`
- Modify: `app/[locale]/(authentication)/loading.tsx`
- Modify: `app/[locale]/dashboard/page.tsx`

- [ ] **Step 1: Create loading component**

```tsx
// components/ui/loading.tsx
import { Loader2 } from 'lucide-react'

export function Loading({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading size="lg" />
    </div>
  )
}
```

- [ ] **Step 2: Create error boundary**

```tsx
// components/ui/error-boundary.tsx
'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="text-muted-foreground">
              We apologize for the inconvenience. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

- [ ] **Step 3: Update authentication loading**

```tsx
// app/[locale]/(authentication)/loading.tsx
import { PageLoading } from '@/components/ui/loading'

export default function Loading() {
  return <PageLoading />
}
```

- [ ] **Step 4: Update dashboard with error boundary**

```tsx
// app/[locale]/dashboard/page.tsx
import { ErrorBoundary } from '@/components/ui/error-boundary'

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  )
}
```

- [ ] **Step 5: Commit loading and error improvements**

```bash
git add components/ui/loading.tsx components/ui/error-boundary.tsx app/[locale]/(authentication)/loading.tsx app/[locale]/dashboard/page.tsx
git commit -m "feat: improve loading and error states across application"
```

---

## Phase 5: End-to-End Interaction Verification

### Task 15: Test All Interactive Elements

**Files:**
- Test: All pages in `app/[locale]/`
- Test: All API routes in `app/api/`
- Test: All form submissions

- [ ] **Step 1: Create test checklist**

```markdown
# Interaction Test Checklist

## Authentication Flow
- [ ] Login form submission works
- [ ] Email validation on login
- [ ] Password requirements enforced
- [ ] "Forgot password" link works
- [ ] Password reset flow completes
- [ ] Signup form validation works
- [ ] Email confirmation sends

## Dashboard Navigation
- [ ] Sidebar navigation links work
- [ ] Dashboard sections load correctly
- [ ] Settings page saves changes
- [ ] Profile updates apply immediately
- [ ] Logout clears session

## Trading Features
- [ ] Trade import buttons trigger
- [ ] Trade sync status updates
- [ ] Journal editor saves entries
- [ ] Charts render data correctly
- [ ] Filter controls work
- [ ] Export buttons download files

## Team Features
- [ ] Team creation form works
- [ ] Member invites send
- [ ] Permissions apply correctly
- [ ] Team dashboard shows data
- [ ] Collaboration features work

## Admin Features
- [ ] User search filters correctly
- [ ] Subscription management works
- [ ] Blog editor saves posts
- [ ] Analytics data displays
```

- [ ] **Step 2: Test each interaction manually**

Run: `npm run dev`
Test each item in the checklist
Expected: All interactions work as expected

- [ ] **Step 3: Test API routes**

```bash
# Test auth API
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"testpass"}'

# Test dashboard API
curl http://localhost:3000/api/dashboard/stats -H "Authorization: Bearer $TOKEN"

# Test settings API
curl -X PATCH http://localhost:3000/api/user/settings -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"theme":"dark"}'
```

- [ ] **Step 4: Commit verification results**

```bash
git add docs/superpowers/plans/2026-05-01-comprehensive-improvement.md
git commit -m "feat: complete comprehensive UI/UX improvement implementation"
```

### Task 16: Deploy to Production

- [ ] **Step 1: Run final build check**

Run: `npm run build`
Expected: Build succeeds without errors

- [ ] **Step 2: Run performance checks**

Run: `npm run perf:verify`
Expected: All performance budgets pass

- [ ] **Step 3: Deploy to Vercel**

```bash
# Deploy to Vercel
vercel --prod --yes
```

Expected: Application deploys successfully

- [ ] **Step 4: Verify production deployment**

Visit: `https://qunt-edge.vercel.app/en`
Expected: Landing page loads without black screen

- [ ] **Step 5: Commit deployment**

```bash
git add vercel.json
git commit -m "feat: deploy comprehensive improvements to production"
```

---

## Summary

This plan covers all required improvements:

1. **Fixed black screen** on /en landing page with error boundaries and loading states
2. **Added username functionality** with database schema, validation, and UI updates
3. **Consolidated trader profile** sections into unified dashboard
4. **Polished entire application UI** with consistent spacing, typography, and interactions
5. **Verified all interactions** work correctly end to end

Each task is designed to be completed in 2-5 minute increments with clear verification steps and frequent commits.