# Username Functionality Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all email display with usernames throughout the application and add username-based search functionality with unique username validation

**Architecture:** Add `username` field to User model with unique constraint, create username validation and search utilities, update authentication flow to handle username/email hybrid, and systematically replace email displays with usernames across all UI components.

**Tech Stack:** Prisma ORM, Next.js 16 (App Router), React 19, TypeScript, Supabase Auth

---

## Phase 1: Database Schema Updates

### Task 1: Add Username Field to User Model

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Read current User model**

Run: `cat prisma/schema.prisma | grep -A 60 "model User"`
Expected: User model with id, email, auth_user_id fields

- [ ] **Step 2: Add username field to User model**

```prisma
model User {
  id                 String              @id @default(cuid())
  email              String              @unique
  username           String?             @unique
  auth_user_id       String              @unique
  isFirstConnection  Boolean             @default(true)
  isBeta             Boolean             @default(false)
  language           String              @default("en")
  dashboardTheme     String              @default("blue")
  showOnLeaderboard  Boolean             @default(false)
  // ... rest of fields
}
```

- [ ] **Step 3: Generate Prisma client**

Run: `npx prisma generate`
Expected: Prisma client regenerated with new username field

- [ ] **Step 4: Create migration**

```bash
npx prisma migrate dev --name add_username_to_user
```
Expected: Migration file created, database schema updated

- [ ] **Step 5: Verify migration**

Run: `npx prisma studio`
Expected: User model shows username field with unique constraint

### Task 2: Add Migration to Handle Existing Users

**Files:**
- Create: `prisma/migrations/YYYY-MM-DD-add-username/migration.sql`

- [ ] **Step 1: Create migration file for existing users**

```sql
-- Add username field with empty string for existing users
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- Set username to lowercase email for existing users (to serve as default)
UPDATE "User" SET "username" = LOWER("email");

-- Add unique constraint
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
```

- [ ] **Step 2: Run migration**

```bash
npx prisma migrate dev --name add_username_to_user
```
Expected: Migration runs successfully, existing users get default username

---

## Phase 2: Authentication Flow Updates

### Task 3: Update User Model Type Definitions

**Files:**
- Modify: `server/types/user.ts` (if exists)
- Modify: `lib/types/user.ts` (if exists)
- Check: Any other user type definitions

- [ ] **Step 1: Find user type definitions**

Run: `grep -r "interface User\|type User" --include="*.ts" --include="*.tsx" server/ lib/ | head -20`
Expected: User interface/type definitions found

- [ ] **Step 2: Add username to User type**

```typescript
interface User {
  id: string
  email: string
  username?: string | null
  auth_user_id: string
  isFirstConnection: boolean
  isBeta: boolean
  language: string
  dashboardTheme: string
  showOnLeaderboard: boolean
  // ... other fields
}

type UserId = string
type Username = string
type UserEmail = string
```

### Task 4: Update Authentication Helper Functions

**Files:**
- Modify: `server/auth.ts`

- [ ] **Step 1: Read current auth file**

Run: `cat server/auth.ts`
Expected: Client creation and user lookup functions

- [ ] **Step 2: Add username lookup function**

```typescript
export async function getUserByUsername(username: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('User')
    .select('*')
    .eq('username', username.toLowerCase())
    .single()

  if (error || !data) {
    return null
  }

  return data as User
}
```

- [ ] **Step 3: Add username validation function**

```typescript
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('User')
    .select('id')
    .eq('username', username.toLowerCase())
    .limit(1)

  return !error
}
```

### Task 5: Update Authentication Form Validation

**Files:**
- Modify: `app/[locale]/(authentication)/components/user-auth-form.tsx`

- [ ] **Step 1: Read current auth form**

Run: `cat app/[locale]/(authentication)/components/user-auth-form.tsx`
Expected: Login and signup forms

- [ ] **Step 2: Add username input to signup form**

```tsx
interface SignupFormData {
  email: string
  password: string
  username: string
  confirmPassword: string
}

function SignupForm() {
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  })

  const validateUsername = (username: string): string[] => {
    const errors: string[] = []

    if (!username) {
      errors.push('Username is required')
    } else if (username.length < 3) {
      errors.push('Username must be at least 3 characters')
    } else if (username.length > 30) {
      errors.push('Username must be less than 30 characters')
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, and underscores')
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const usernameErrors = validateUsername(formData.username)
    if (usernameErrors.length > 0) {
      setUsernameErrors(usernameErrors)
      return
    }

    // Check username availability
    const isAvailable = await isUsernameAvailable(formData.username)
    if (!isAvailable) {
      setUsernameErrors(['Username is already taken'])
      return
    }

    // Proceed with signup
    await signup(formData.email, formData.password, formData.username)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Email field */}
      <Input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />

      {/* Username field */}
      <Input
        type="text"
        placeholder="Username"
        value={formData.username}
        onChange={(e) => {
          setFormData({ ...formData, username: e.target.value })
          setUsernameErrors([])
        }}
        required
      />
      {usernameErrors.length > 0 && (
        <div className="mt-1 text-sm text-red-500">
          {usernameErrors.map((error, i) => (
            <div key={i}>{error}</div>
          ))}
        </div>
      )}
      <p className="mt-1 text-xs text-muted-foreground">
        Username must be 3-30 characters and can only contain letters, numbers, and underscores
      </p>

      {/* Password fields */}
      {/* ... */}
    </form>
  )
}
```

---

## Phase 3: Username Search Functionality

### Task 6: Create Username Search Utility

**Files:**
- Create: `lib/username-search.ts`

- [ ] **Step 1: Create username search utility**

```typescript
import { prisma } from '@/lib/prisma'

export interface SearchUserResult {
  id: string
  username: string
  email: string
}

export async function searchUsersByUsername(query: string): Promise<SearchUserResult[]> {
  if (!query || query.length < 2) {
    return []
  }

  const results = await prisma.user.findMany({
    where: {
      username: {
        contains: query.toLowerCase(),
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      username: true,
      email: true
    },
    take: 10
  })

  return results as SearchUserResult[]
}

export async function searchUsersByEmail(query: string): Promise<SearchUserResult[]> {
  if (!query || query.length < 2) {
    return []
  }

  const results = await prisma.user.findMany({
    where: {
      email: {
        contains: query.toLowerCase(),
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      username: true,
      email: true
    },
    take: 10
  })

  return results as SearchUserResult[]
}
```

### Task 7: Create Username Search API Route

**Files:**
- Create: `app/api/search-users/route.ts`

- [ ] **Step 1: Create search API route**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { searchUsersByUsername, searchUsersByEmail } from '@/lib/username-search'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') || ''

  if (!query) {
    return NextResponse.json({ users: [] })
  }

  // Try username search first, then email search
  const usernameResults = await searchUsersByUsername(query)

  if (usernameResults.length > 0) {
    return NextResponse.json({
      users: usernameResults,
      searchType: 'username'
    })
  }

  const emailResults = await searchUsersByEmail(query)

  return NextResponse.json({
    users: emailResults,
    searchType: 'email'
  })
}
```

### Task 8: Create Username Search UI Component

**Files:**
- Create: `components/username-search/username-search.tsx`

- [ ] **Step 1: Create username search component**

```tsx
"use client"

import { useState, useEffect } from 'react'
import { Search, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchUserResult {
  id: string
  username: string
  email: string
}

interface UsernameSearchProps {
  onSelectUser: (userId: string, username: string) => void
}

export function UsernameSearch({ onSelectUser }: UsernameSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchUserResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.length < 2) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/search-users?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setResults(data.users)
      } catch (error) {
        console.error('Error searching users:', error)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleUserSelect = (userId: string, username: string) => {
    onSelectUser(userId, username)
    setQuery('')
    setResults([])
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search users by username or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm"
        />
      </div>

      {isLoading && query.length >= 2 && (
        <div className="absolute mt-1 w-full rounded-lg border border-input bg-background p-2">
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        </div>
      )}

      {results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-input bg-background shadow-lg max-h-80 overflow-auto">
          {results.map((user, index) => (
            <button
              key={user.id}
              onClick={() => handleUserSelect(user.id, user.username)}
              className={cn(
                "w-full px-4 py-2 text-left hover:bg-muted/50",
                index === selectedIndex && "bg-muted/50"
              )}
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{user.username}</span>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground text-sm">{user.email}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Task 9: Create Username Input Component

**Files:**
- Create: `components/username-input/username-input.tsx`

- [ ] **Step 1: Create username input component**

```tsx
"use client"

import { useState, useEffect } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UsernameInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
}

export function UsernameInput({ value, onChange, onBlur, disabled }: UsernameInputProps) {
  const [isValid, setIsValid] = useState(true)
  const [isChecking, setIsChecking] = useState(false)
  const [availability, setAvailability] = useState<'checking' | 'available' | 'taken'>('checking')

  const validateUsername = (username: string): boolean => {
    if (!username) return false
    if (username.length < 3) return false
    if (username.length > 30) return false
    return /^[a-zA-Z0-9_]+$/.test(username)
  }

  useEffect(() => {
    if (!value || value.length < 3) {
      setIsValid(validateUsername(value))
      setAvailability('checking')
      return
    }

    setIsChecking(true)
    setAvailability('checking')

    const checkAvailability = async () => {
      try {
        const response = await fetch('/api/check-username', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: value }),
        })

        const data = await response.json()
        setAvailability(data.available ? 'available' : 'taken')
      } catch (error) {
        console.error('Error checking username:', error)
        setAvailability('taken')
      } finally {
        setIsChecking(false)
      }
    }

    const timeoutId = setTimeout(checkAvailability, 500)
    return () => clearTimeout(timeoutId)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^a-zA-Z0-9_]/g, '')
    onChange(newValue)
  }

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder="Enter username"
          className={cn(
            "w-full rounded-lg border px-3 py-2 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !isValid && "border-red-500"
          )}
        />
        {isChecking && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        {availability === 'available' && (
          <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
        )}
        {availability === 'taken' && (
          <X className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
        )}
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        Username must be 3-30 characters and can only contain letters, numbers, and underscores
      </p>

      {availability === 'taken' && (
        <p className="mt-1 text-xs text-red-500">This username is already taken</p>
      )}
    </div>
  )
}
```

### Task 10: Create Username Check API Route

**Files:**
- Create: `app/api/check-username/route.ts`

- [ ] **Step 1: Create username check API**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const { username } = await request.json()

  if (!username || typeof username !== 'string') {
    return NextResponse.json({ available: false }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: {
      username: username.toLowerCase()
    },
    select: {
      id: true
    }
  })

  return NextResponse.json({
    available: !user
  })
}
```

---

## Phase 4: UI Updates - Replace Email with Username

### Task 11: Update Profile Page

**Files:**
- Modify: `app/[locale]/dashboard/profile/page.tsx` (or similar)
- Find: All pages displaying user email

- [ ] **Step 1: Find all email displays**

Run: `grep -r "email" --include="*.tsx" app/[locale]/dashboard/ | grep -v "dashboard.email" | head -20`
Expected: Files displaying user emails

- [ ] **Step 2: Update profile page to show username**

```tsx
// Before
<div className="text-sm">{user.email}</div>

// After
<div className="text-sm">{user.username || user.email}</div>
```

- [ ] **Step 3: Update profile edit form**

```tsx
function ProfileForm() {
  const { data: user } = useAuth()

  return (
    <form>
      <div>
        <label>Username</label>
        <input
          type="text"
          value={user?.username || ''}
          onChange={(e) => updateUsername(e.target.value)}
        />
      </div>
    </form>
  )
}
```

### Task 12: Update Notifications to Show Username

**Files:**
- Modify: `components/notifications/notification-list.tsx`
- Modify: All notification components

- [ ] **Step 1: Update notification component to show username**

```tsx
interface NotificationProps {
  user: {
    id: string
    username?: string | null
    email: string
  }
  // ... other props
}

function NotificationItem({ user }: NotificationProps) {
  return (
    <div>
      <div className="font-medium">{user.username || user.email}</div>
      <div className="text-sm text-muted-foreground">{user.email}</div>
    </div>
  )
}
```

### Task 13: Update Team Management UI

**Files:**
- Modify: `app/[locale]/dashboard/teams/page.tsx`
- Modify: Team member lists

- [ ] **Step 1: Update team member display**

```tsx
function TeamMemberList({ members }: { members: TeamMember[] }) {
  return (
    <div>
      {members.map((member) => (
        <div key={member.userId} className="flex items-center gap-2">
          <div className="font-medium">
            {member.user?.username || member.user?.email}
          </div>
          <div className="text-xs text-muted-foreground">
            {member.user?.email}
          </div>
        </div>
      ))}
    </div>
  )
}
```

### Task 14: Update Comments and Posts UI

**Files:**
- Modify: Comment and post components showing user info
- Check: `components/chat/chat-message.tsx`
- Check: Comment rendering components

- [ ] **Step 1: Update user display in comments**

```tsx
function Comment({ user, content }: CommentProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
        {user.username?.[0] || user.email[0]}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {user.username || user.email}
          </span>
          <span className="text-xs text-muted-foreground">
            {user.email}
          </span>
        </div>
        <p className="mt-1">{content}</p>
      </div>
    </div>
  )
}
```

### Task 15: Update Leaderboard and Rankings

**Files:**
- Modify: Any leaderboard components
- Check: Leaderboard display in dashboard

- [ ] **Step 1: Update leaderboard to show username**

```tsx
function Leaderboard({ users }: { users: User[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Username</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user, index) => (
          <tr key={user.id}>
            <td>{index + 1}</td>
            <td>{user.username || user.email}</td>
            <td>{user.score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

---

## Phase 5: Notification System Enhancements

### Task 16: Add Loading States to Notifications

**Files:**
- Modify: Notification components to show loading states

- [ ] **Step 1: Add loading skeleton to notification list**

```tsx
function NotificationList({ notifications }: { notifications: Notification[] }) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch notifications
    // ...
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border bg-muted/50 p-4 animate-pulse">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="mt-2 h-4 w-64 rounded bg-muted" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  )
}
```

### Task 17: Add Error States to Notifications

**Files:**
- Modify: Notification components to show error states

- [ ] **Step 1: Add error fallback to notification fetch**

```tsx
function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    fetchNotifications()
      .then((data) => {
        setNotifications(data)
      })
      .catch((err) => {
        console.error('Failed to fetch notifications:', err)
        setError('Failed to load notifications')
      })
      .finally(() => {
        setIsLoaded(true)
      })
  }, [])

  if (!isLoaded) {
    return <NotificationLoadingSkeleton />
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">{error}</p>
        <button
          onClick={fetchNotifications}
          className="mt-2 text-sm text-red-700 underline"
        >
          Retry
        </button>
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No notifications yet
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  )
}
```

### Task 18: Add Trade Update Notifications

**Files:**
- Modify: Notification components to handle trade updates

- [ ] **Step 1: Create trade update notification component**

```tsx
interface TradeUpdateNotificationProps {
  trade: Trade
  account: Account
}

function TradeUpdateNotification({ trade, account }: TradeUpdateNotificationProps) {
  const isProfit = trade.pnl >= 0

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-sm font-medium",
              isProfit ? "text-green-600" : "text-red-600"
            )}>
              {trade.side?.toUpperCase()}
            </span>
            <span className="text-xs text-muted-foreground">
              {trade.instrument}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatCurrency(trade.pnl)}
            </span>
          </div>
          <p className="mt-1 text-sm">
            Trade completed on {account.number}
          </p>
        </div>
        <button className="text-xs text-muted-foreground hover:text-foreground">
          Dismiss
        </button>
      </div>
    </div>
  )
}
```

### Task 19: Add Failure Notifications

**Files:**
- Modify: Notification components to handle failures

- [ ] **Step 1: Add failure notification component**

```tsx
interface FailureNotificationProps {
  message: string
  action?: {
    label: string
    onClick: () => void
  }
}

function FailureNotification({ message, action }: FailureNotificationProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-red-800">Operation Failed</p>
          <p className="mt-1 text-sm text-red-700">{message}</p>
        </div>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-3 text-sm text-red-700 underline"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
```

---

## Phase 6: Testing and Validation

### Task 20: Test Username Validation

**Files:**
- Test: Authentication flow

- [ ] **Step 1: Test username validation on signup**

Run: `npm run dev`
Navigate to: http://localhost:3000/en/authentication
Fill signup form with invalid username
Expected: Validation error displayed
Fill with valid username
Expected: No errors

- [ ] **Step 2: Test username availability check**

Enter taken username
Expected: Error message "Username is already taken"
Enter available username
Expected: Green checkmark indicator

### Task 21: Test Username Search

**Files:**
- Test: Search functionality

- [ ] **Step 1: Test username search**

Navigate to dashboard
Open search component
Enter username query
Expected: Results displayed
Enter non-existent username
Expected: No results

- [ ] **Step 2: Test email search**

Enter email in search
Expected: Results displayed by email match

### Task 22: Test UI Display

**Files:**
- Test: UI components

- [ ] **Step 1: Test username display in profile**

Navigate to profile page
Expected: Username displayed (fallback to email if not set)

- [ ] **Step 2: Test username display in notifications**

Navigate to notifications
Expected: Username displayed (fallback to email if not set)

- [ ] **Step 3: Test username display in team members**

Navigate to teams page
Expected: Username displayed for team members

### Task 23: Test Notification States

**Files:**
- Test: Notification system

- [ ] **Step 1: Test loading state**

Open network tab, disable network
Reload notifications page
Expected: Loading skeleton displayed

- [ ] **Step 2: Test error state**

Simulate network error
Expected: Error message displayed with retry option

- [ ] **Step 3: Test empty state**

Clear all notifications
Expected: Empty state message displayed

---

## Verification Checklist

- [ ] Username field added to User model with unique constraint
- [ ] Migration created and applied successfully
- [ ] Existing users have default username (lowercase email)
- [ ] Username validation prevents invalid usernames
- [ ] Username availability check works correctly
- [ ] Username search finds users by username
- [ ] Email search finds users by email
- [ ] All email displays replaced with username
- [ ] Fallback to email when username is null
- [ ] Notifications show username instead of email
- [ ] Team management shows username for members
- [ ] Comments and posts show username
- [ ] Leaderboard shows username
- [ ] Loading states work in notifications
- [ ] Error states work in notifications
- [ ] Empty states work in notifications
- [ ] Trade update notifications display correctly
- [ ] Failure notifications display correctly
- [ ] All validation errors are user-friendly

---

## Success Criteria

1. Username field is required on signup with validation
2. Username must be unique in the database
3. Username search works by username and email
4. All email displays are replaced with username
5. Fallback to email works when username is not set
6. Notifications show username with email as fallback
7. Loading, error, and empty states work correctly
8. Trade update and failure notifications work
9. UI is consistent with username-first approach

---

`★ Insight ─────────────────────────────────────`
**Database Migration Strategy**: When adding a unique optional field like username, the safest approach is to populate it for existing users first (using email as a default) and add the unique constraint afterward. This prevents duplicate usernames from existing users during migration.

**Username Validation**: Enforce strict validation (3-30 chars, alphanumeric + underscores) at both database and frontend levels. Database constraint provides final protection, frontend provides immediate feedback.

**Notification State Management**: Always provide three states for data loading: loading (skeletons), error (recovery options), and empty (no-data message). This pattern prevents UI from appearing broken or blank.
`─────────────────────────────────────────────────`
