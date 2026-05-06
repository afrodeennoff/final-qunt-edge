# Interactive Elements Audit and Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verify all buttons, interactive elements, functions, and frontend-to-backend communication work correctly end-to-end. Fix any broken interactions, disconnected event handlers, failed API integrations, missing loading or error feedback, and unresponsive UI elements.

**Architecture:** Systematically audit every interactive element across all routes, test click handlers, API calls, form submissions, navigation links, and error states. Create comprehensive test coverage and fix all issues.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Supabase Auth, Prisma ORM, Testing Library

---

## Phase 1: Create Audit Framework

### Task 1: Create Interactive Elements Checklist

**Files:**
- Create: `docs/interactive-elements-checklist.md`

- [ ] **Step 1: Create audit checklist**

```markdown
# Interactive Elements Audit Checklist

## Buttons
- [ ] Click handlers connected
- [ ] Loading states displayed
- [ ] Error handling implemented
- [ ] Disabled states work
- [ ] Focus states visible
- [ ] Hover states visible
- [ ] All variants work

## Form Inputs
- [ ] Value changes reflected
- [ ] Submit handlers connected
- [ ] Validation implemented
- [ ] Error states displayed
- [ ] Loading states displayed
- [ ] Disabled states work
- [ ] Focus states visible

## Selects
- [ ] Option selection works
- [ ] Value changes reflected
- [ ] Validation implemented
- [ ] Error states displayed

## Modals
- [ ] Open/close functionality
- [ ] Backdrop click closes
- [ ] Escape key closes
- [ ] Focus trap works
- [ ] Modal content renders
- [ ] Form submissions work

## Tooltips
- [ ] Hover triggers display
- [ ] Positioning is correct
- [ ] Dismiss on mouse out
- [ ] Keyboard accessible

## Dropdowns
- [ ] Open/close functionality
- [ ] Option selection works
- [ ] Click outside closes
- [ ] Dropdown positioning

## Navigation
- [ ] Links resolve correctly
- [ ] Active states work
- [ ] External links open
- [ ] Hash navigation works

## API Calls
- [ ] Data fetches correctly
- [ ] Loading states displayed
- [ ] Error states displayed
- [ ] Success states displayed
- [ ] Retry functionality works

## Form Submissions
- [ ] Data validates
- [ ] API calls complete
- [ ] Redirects work
- [ ] Error handling works

## Error States
- [ ] Loading states display
- [ ] Error messages clear
- [ ] Retry functionality works
- [ ] Empty states display
```

### Task 2: Create Test Utilities

**Files:**
- Create: `lib/test-utils.tsx`

- [ ] **Step 1: Create custom render function**

```typescript
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from '@/context/auth-context'

export function renderWithProviders(
  component: React.ReactNode,
  options?: {
    user?: any
    queryClient?: QueryClient
  }
) {
  const queryClient = options?.queryClient ?? new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <SessionProvider user={options?.user}>
        {component}
      </SessionProvider>
    </QueryClientProvider>
  )
}

export function getButtonText(buttonText: string) {
  return screen.getByRole('button', { name: buttonText })
}

export function getTextInput(placeholder: string) {
  return screen.getByPlaceholderText(placeholder)
}

export function getLink(text: string) {
  return screen.getByRole('link', { name: text })
}
```

---

## Phase 2: Audit Buttons Across All Pages

### Task 3: Audit Home Page Buttons

**Files:**
- Check: `app/[locale]/(home)/page.tsx`
- Check: `app/[locale]/(home)/components/HomeContent.tsx`

- [ ] **Step 1: Check all buttons in HomeContent**

For each button:
```
Check:
- Link/onClick handler connected?
- Loading state implemented?
- Error handling?
- Disabled state?
```

- [ ] **Step 2: Test navigation links**

Navigate to: http://localhost:3000/en
Click: "Get Started" button
Expected: Redirects to authentication page

- [ ] **Step 3: Test secondary button**

Click: "Watch Demo" button
Expected: Scrolls to demo section or opens video

### Task 4: Audit Authentication Page Buttons

**Files:**
- Check: `app/[locale]/(authentication)/components/user-auth-form.tsx`

- [ ] **Step 1: Check login button**

Test: Click login button
Expected:
- Validation runs
- API call made
- Success redirects to dashboard
- Error shows message

- [ ] **Step 2: Test signup button**

Test: Fill form and click signup
Expected:
- Validation runs
- Username check works
- API call made
- Success redirects
- Error shows message

- [ ] **Step 3: Check loading state**

Click signup
Expected: Button shows loading spinner
Expected: Button text changes to "Creating account..."
Expected: User cannot click again while loading

### Task 5: Audit Dashboard Navigation Buttons

**Files:**
- Check: `components/sidebar/dashboard-sidebar.tsx`

- [ ] **Step 1: Check all sidebar links**

Test: Click each sidebar link
Expected: Navigates to correct page
Expected: Active state updates

- [ ] **Step 2: Check mobile navigation**

Open sidebar on mobile
Test: Click each menu item
Expected: Navigation works

### Task 6: Audit Settings Buttons

**Files:**
- Check: `app/[locale]/dashboard/settings/page.tsx`

- [ ] **Step 1: Test save button**

Fill form
Click: Save button
Expected:
- Validation runs
- Loading state shows
- API call completes
- Success message displayed

- [ ] **Step 2: Test cancel button**

Click: Cancel button
Expected: Form resets or navigation occurs

### Task 7: Audit Dashboard Action Buttons

**Files:**
- Check: All dashboard action buttons
- Find: "Sync", "Import", "Export", "Share" buttons

- [ ] **Step 1: Test sync button**

Click: Sync button
Expected:
- Loading state shows
- API call made
- Progress indicator shown
- Success/error message displayed

- [ ] **Step 2: Test import button**

Click: Import button
Expected:
- Modal opens
- File selection works
- Upload progress shown
- Success/error handling

---

## Phase 3: Audit Form Inputs

### Task 8: Audit Login Form

**Files:**
- Check: `app/[locale]/(authentication)/components/user-auth-form.tsx`

- [ ] **Step 1: Test email input**

Type in email field
Expected:
- Value updates
- Validation runs on blur
- Error message shows if invalid
- Success message if valid

- [ ] **Step 2: Test password input**

Type in password field
Expected:
- Value updates
- Show/hide password toggle works
- Validation runs
- Error handling

- [ ] **Step 3: Test submit**

Fill valid form
Click: Submit
Expected:
- Loading state
- API call
- Redirect

### Task 9: Audit Signup Form

**Files:**
- Check: `app/[locale]/(authentication)/components/user-auth-form.tsx`

- [ ] **Step 1: Test username input**

Type in username field
Expected:
- Auto-formatting (lowercase)
- Validation runs
- Availability check
- Error/success indicators

- [ ] **Step 2: Test confirm password**

Type password and confirm password
Expected:
- Validation runs
- Error if passwords don't match

### Task 10: Audit Trade Entry Form

**Files:**
- Check: Any trade entry forms
- Find: Trade entry, edit trade forms

- [ ] **Step 1: Test all required fields**

Leave fields empty
Submit
Expected: Validation shows all required fields

- [ ] **Step 2: Test submit**

Fill valid trade data
Submit
Expected:
- Loading state
- API call
- Success message
- Navigation or form reset

### Task 11: Audit Account Management Forms

**Files:**
- Check: Account creation, editing forms

- [ ] **Step 1: Test account creation**

Fill form
Submit
Expected:
- Loading state
- API call
- Success message
- Account appears in list

- [ ] **Step 2: Test account editing**

Edit account
Submit
Expected:
- Loading state
- API call
- Success message
- Account updated

---

## Phase 4: Audit Modals

### Task 12: Audit Modal Opening

**Files:**
- Check: All modal triggers

- [ ] **Step 1: Test modal open trigger**

Click: Modal trigger button
Expected:
- Modal opens
- Backdrop appears
- Focus moves to modal
- Z-index is correct

- [ ] **Step 2: Test multiple modals**

Open one modal
Try to open another
Expected: Only first modal is accessible

### Task 13: Audit Modal Closing

**Files:**
- Check: All modal close mechanisms

- [ ] **Step 1: Test close button**

Open modal
Click: Close button
Expected: Modal closes

- [ ] **Step 2: Test backdrop click**

Open modal
Click: Backdrop
Expected: Modal closes

- [ ] **Step 3: Test escape key**

Open modal
Press: Escape
Expected: Modal closes

### Task 14: Audit Modal Content

**Files:**
- Check: All modal content

- [ ] **Step 1: Test form submissions in modals**

Open modal with form
Submit form
Expected:
- Loading state
- API call
- Success/error handling
- Modal closes on success

- [ ] **Step 2: Test modal responsiveness**

Open modal
Resize browser
Expected: Modal scales correctly

---

## Phase 5: Audit Dropdowns

### Task 15: Audit Dropdown Opening

**Files:**
- Check: All dropdown triggers

- [ ] **Step 1: Test dropdown open**

Click: Dropdown trigger
Expected:
- Dropdown opens
- Position is correct
- Options are visible

- [ ] **Step 2: Test keyboard navigation**

Open dropdown
Press: Arrow keys
Expected: Options highlight

### Task 16: Audit Dropdown Selection

**Files:**
- Check: All dropdown selections

- [ ] **Step 1: Test option selection**

Open dropdown
Click: Option
Expected:
- Option selected
- Value updates
- Dropdown closes
- Callback executes

### Task 17: Audit Dropdown Closing

**Files:**
- Check: All dropdown close mechanisms

- [ ] **Step 1: Test click outside**

Open dropdown
Click outside
Expected: Dropdown closes

- [ ] **Step 2: Test selection closes dropdown**

Select option
Expected: Dropdown closes

---

## Phase 6: Audit Tooltips

### Task 18: Audit Tooltip Display

**Files:**
- Check: All tooltip triggers

- [ ] **Step 1: Test hover display**

Hover: Tooltip trigger
Expected:
- Tooltip appears
- Content is readable
- Position is correct

- [ ] **Step 2: Test click display**

Click: Tooltip trigger
Expected: Tooltip displays (if click-triggered)

### Task 19: Audit Tooltip Dismissal

**Files:**
- Check: All tooltip dismissals

- [ ] **Step 1: Test mouse out**

Hover: Tooltip trigger
Move mouse out
Expected: Tooltip disappears

- [ ] **Step 2: Test click to dismiss**

Click: Tooltip content
Expected: Tooltip disappears

---

## Phase 7: Audit Navigation

### Task 20: Audit Internal Navigation

**Files:**
- Check: All internal links

- [ ] **Step 1: Test all sidebar links**

Click: Each sidebar link
Expected:
- Correct page loads
- URL updates
- Active state updates

- [ ] **Step 2: Test dashboard navigation**

Navigate between dashboard pages
Expected: All navigation works

### Task 21: Audit External Navigation

**Files:**
- Check: All external links

- [ ] **Step 1: Test external links**

Click: External link
Expected: Opens in new tab
Expected: Loads correct page

### Task 22: Audit Hash Navigation

**Files:**
- Check: Hash-based navigation

- [ ] **Step 1: Test hash links**

Navigate to: #section-id
Expected: Scrolls to correct section

---

## Phase 8: Audit API Calls

### Task 23: Audit Data Fetching

**Files:**
- Check: All data fetching functions

- [ ] **Step 1: Test fetch success**

Navigate to dashboard
Expected:
- Loading state shows
- Data fetches
- Data displays
- Loading state hides

- [ ] **Step 2: Test fetch error**

Simulate API error
Expected:
- Error state shows
- Error message displayed
- Retry button available

- [ ] **Step 3: Test retry**

Click: Retry button
Expected:
- Loading state shows
- Data fetches again
- Error cleared if resolved

### Task 24: Audit API Mutation

**Files:**
- Check: All mutation functions

- [ ] **Step 1: Test successful mutation**

Submit form
Expected:
- Loading state shows
- API call succeeds
- Success message
- Data refreshes

- [ ] **Step 2: Test failed mutation**

Simulate API failure
Expected:
- Loading state shows
- API call fails
- Error message
- Data not updated

---

## Phase 9: Audit Error Handling

### Task 25: Add Error Boundaries

**Files:**
- Check: Existing error boundaries
- Add: Error boundaries to missing routes

- [ ] **Step 1: Add error boundary to missing route**

Run: `find app -name "error.tsx" | wc -l`
Expected: Error boundaries exist

- [ ] **Step 2: Test error boundary**

Introduce error in code
Expected:
- Error boundary catches error
- Fallback UI displays
- Error is logged

### Task 26: Add Error Messages

**Files:**
- Check: All API error handling

- [ ] **Step 1: Add user-friendly error messages**

For each error:
```
Check:
- Error message is clear
- Error message explains what went wrong
- Error message explains how to fix it
- Error message provides help
```

- [ ] **Step 2: Add error states to components**

Add loading, error, empty states to:
- Data tables
- Charts
- Lists
- Cards

### Task 27: Add Loading States

**Files:**
- Check: All async operations

- [ ] **Step 1: Add loading states to all API calls**

For each API call:
```
Check:
- Loading state shows during fetch
- Loading state shows during mutation
- Loading state prevents duplicate requests
```

---

## Phase 10: Test End-to-End

### Task 28: Test Success Paths

**Files:**
- Test: All success scenarios

- [ ] **Step 1: Test login flow**

Navigate to login
Enter valid credentials
Click login
Expected: Redirected to dashboard
Expected: Dashboard loads with data
Expected: No errors

- [ ] **Step 2: Test signup flow**

Navigate to signup
Fill valid form
Click signup
Expected: Account created
Expected: Redirected to dashboard
Expected: Dashboard loads with data
Expected: No errors

- [ ] **Step 3: Test trade import flow**

Navigate to import
Select file
Upload
Expected: Upload progress shown
Expected: Import starts
Expected: Trade appears in dashboard
Expected: No errors

### Task 29: Test Failure Paths

**Files:**
- Test: All error scenarios

- [ ] **Step 1: Test invalid login**

Navigate to login
Enter invalid credentials
Click login
Expected: Error message displayed
Expected: Form not submitted

- [ ] **Step 2: Test invalid signup**

Navigate to signup
Fill invalid form
Click signup
Expected: Validation errors
Expected: No API call made

- [ ] **Step 3: Test API failure**

Simulate API failure
Expected: Error state displayed
Expected: Error message shown
Expected: Retry option available

- [ ] **Step 4: Test network offline**

Go offline
Try to navigate
Expected: Loading state or error
Expected: Graceful error handling

### Task 30: Test Edge Cases

**Files:**
- Test: Edge cases and unusual scenarios

- [ ] **Step 1: Test rapid clicks**

Click button rapidly
Expected:
- Loading state prevents duplicate requests
- Only one request is made
- Result is deterministic

- [ ] **Step 2: Test form submission on mobile**

Fill form on mobile
Submit
Expected:
- Form submits
- No issues
- Success/error handled

- [ ] **Step 3: Test navigation without session**

Navigate to dashboard without login
Expected:
- Redirected to login
- No errors

---

## Phase 11: Create Test Coverage

### Task 31: Write Unit Tests for Interactive Elements

**Files:**
- Create: `tests/components/button.test.tsx`
- Create: `tests/components/form.test.tsx`
- Create: `tests/components/modal.test.tsx`

- [ ] **Step 1: Write button tests**

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('should execute onClick handler when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should show loading state', () => {
    render(<Button isLoading>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toContainHTML('<div')
  })
})
```

- [ ] **Step 2: Create form tests**

```typescript
describe('LoginForm', () => {
  it('should validate email field', () => {
    render(<LoginForm />)
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'invalid-email' }
    })
    fireEvent.blur(screen.getByPlaceholderText('Email'))
    expect(screen.getByText('Invalid email')).toBeInTheDocument()
  })

  it('should submit form with valid data', async () => {
    render(<LoginForm />)

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    })

    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    })

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })
})
```

### Task 32: Write Integration Tests

**Files:**
- Create: `tests/integration/dashboard-navigation.test.tsx`
- Create: `tests/integration/trade-import.test.tsx`

- [ ] **Step 1: Create dashboard navigation test**

```typescript
describe('Dashboard Navigation', () => {
  it('should navigate between dashboard pages', () => {
    renderWithProviders(<DashboardLayout />)

    expect(screen.getByText('Trades')).toBeInTheDocument()
    expect(screen.getByText('Accounts')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Trades'))
    expect(screen.getByText(/trades/i)).toBeInTheDocument()

    fireEvent.click(screen.getByText('Accounts'))
    expect(screen.getByText(/accounts/i)).toBeInTheDocument()
  })
})
```

---

## Verification Checklist

- [ ] All buttons have connected click handlers
- [ ] All buttons show loading states
- [ ] All buttons handle errors
- [ ] All buttons have disabled states
- [ ] All buttons have focus states
- [ ] All buttons have hover states
- [ ] All buttons have all variants working
- [ ] All form inputs reflect value changes
- [ ] All form inputs have validation
- [ ] All form inputs show error states
- [ ] All form inputs show loading states
- [ ] All form inputs have disabled states
- [ ] All form inputs have focus states
- [ ] All selects have selection working
- [ ] All selects have value reflection
- [ ] All selects have validation
- [ ] All selects have error states
- [ ] All modals can open
- [ ] All modals can close
- [ ] All modals trap focus
- [ ] All modals respond to escape key
- [ ] All modals respond to backdrop click
- [ ] All tooltips display on hover
- [ ] All tooltips have correct positioning
- [ ] All tooltips dismiss on mouse out
- [ ] All tooltips are keyboard accessible
- [ ] All dropdowns can open
- [ ] All dropdowns can close
- [ ] All dropdowns handle option selection
- [ ] All dropdowns handle click outside
- [ ] All dropdowns have correct positioning
- [ ] All links navigate correctly
- [ ] All links have active states
- [ ] All API calls fetch data
- [ ] All API calls show loading states
- [ ] All API calls handle errors
- [ ] All API calls show success states
- [ ] All API calls have retry functionality
- [ ] All form submissions validate
- [ ] All form submissions call API
- [ ] All form submissions handle errors
- [ ] All form submissions show success
- [ ] All error states are user-friendly
- [ ] All error states have retry
- [ ] All error states have clear messages
- [ ] All loading states show progress
- [ ] All loading states prevent duplicate requests
- [ ] All navigation links work
- [ ] All navigation links update URL
- [ ] All external links open correctly
- [ ] All error boundaries catch errors
- [ ] All test paths work
- [ ] All failure paths work
- [ ] All edge cases handled

---

## Success Criteria

1. All buttons work correctly
2. All forms validate and submit correctly
3. All modals open and close correctly
4. All dropdowns work correctly
5. All tooltips work correctly
6. All navigation links work correctly
7. All API calls work correctly
8. All error states are user-friendly
9. All loading states are shown
10. All success states are shown
11. All test paths work end-to-end
12. All failure paths work end-to-end
13. All edge cases are handled
14. Test coverage is comprehensive
15. No broken interactive elements

---

`★ Insight ─────────────────────────────────────`
**Test-Driven Fix Approach**: Test each interactive element independently, then fix issues systematically. This ensures complete coverage and prevents regression.

**Error Boundary Placement**: Place error boundaries at route level, not component level. This catches all rendering errors within a route and provides a consistent error experience.

**Loading State Best Practices**: Always show loading states for async operations. Never leave buttons disabled without visual feedback or rely on user memory of what's happening.
`─────────────────────────────────────────────────`
