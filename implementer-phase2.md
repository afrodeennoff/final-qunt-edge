# Implementer: Username Functionality

**Current directory**: /Users/uomarafrodeen/Downloads/qunt-edge/.worktrees/improvements-2026-05-01

**Plan**: docs/superpowers/plans/2026-05-01-comprehensive-improvement.md (Phase 2, Tasks 4-8)

**Task**: Implement username functionality across the application including database schema, validation, UI updates, and search features.

## Files to modify:
- prisma/schema.prisma
- store/user-store.ts
- lib/data-types.ts
- components/ui/user-search.tsx
- components/ui/username-input.tsx
- app/[locale]/dashboard/settings/page.tsx
- app/[locale]/dashboard/settings/actions.ts
- app/[locale]/dashboard/trader-profile/page-client.tsx
- app/[locale]/admin/components/send-email/user-selector.tsx
- app/[locale]/dashboard/components/Sidebar.tsx

## Task Sequence:

### Task 4: Add Username to Database Schema
**Goal**: Add username field to User model

**Steps**:
1. Create migration for username field
2. Add username and usernameHash to User model
3. Add unique indexes

**Expected code**:
```sql
-- prisma/migrations/20260501_add_username_to_user/migration.sql
ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN username_hash VARCHAR(255) UNIQUE;

-- Create unique index
CREATE INDEX idx_users_username ON users(username);
```

```prisma
// prisma/schema.prisma
model User {
  id                 String              @id @default(cuid())
  username           String?             @unique
  usernameHash       String?             @unique
  email              String              @unique
  // ... existing fields
}
```

### Task 5: Update User Store and Types
**Goal**: Add username to user store types and data structures

**Steps**:
1. Update UserStore type to include username
2. Update User interface in data-types.ts
3. Create user-search component

**Expected code**:
```tsx
// store/user-store.ts
type UserStore = {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  username: string | null;
  // ... existing fields
}
```

```tsx
// components/ui/user-search.tsx
export function UserSearch({ onSelect, placeholder = "Search users..." }: UserSearchProps) {
  const [query, setQuery] = useState('')
  const { users } = useUserStore()
  
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
      {/* dropdown */}
    </div>
  )
}
```

### Task 6: Update Settings Page for Username
**Goal**: Allow users to set and update their username

**Steps**:
1. Create settings actions for username update
2. Add username setting to settings page
3. Add username input with validation

**Expected code**:
```tsx
// app/[locale]/dashboard/settings/actions.ts
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

### Task 7: Replace Email Display with Username
**Goal**: Update all UI components to show usernames instead of emails

**Steps**:
1. Update trader profile to show username
2. Update admin user selector
3. Update sidebar navigation

**Expected code**:
```tsx
// app/[locale]/dashboard/trader-profile/page-client.tsx
const profileName = user?.username || user?.email || 'Unknown trader'
```

### Task 8: Implement Username Validation
**Goal**: Add username validation and availability checking

**Steps**:
1. Create username validation schema
2. Create username input component with validation
3. Add availability check API route

**Expected code**:
```tsx
// lib/validations/user.ts
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
```

## Testing Instructions:
1. Run database migration
2. Test username creation and validation
3. Test username search functionality
4. Verify all UI components show usernames
5. Test username update in settings

## Commit Requirements:
- Small commits after each task
- Commit messages should be descriptive
- Include the task number in commit message

## Status Reporting:
- Use DONE when all five tasks complete successfully
- Use DONE_WITH_CONCERNS if you have observations
- Use NEEDS_CONTEXT if you need more info
- Use BLOCKED if you cannot proceed

Start implementing now.