---
name: Todo Form and Dashboard Display
overview: Create a complete todo creation form in the NewTodo component with all required fields, integrate with Clerk for userId, handle form submission with proper state management, and display todos on the dashboard page.
todos: []
---

# Todo Fo

rm and Dashboard Display Implementation

## Overview

Implement a complete todo creation UI with form fields, integrate with Clerk authentication, handle form submission, and display todos on the dashboard.

## Files to Modify/Create

### 1. Create Missing shadcn UI Components

- **`apps/web-app/components/ui/input.tsx`** - Text input component for title and linkUrl
- **`apps/web-app/components/ui/textarea.tsx`** - Textarea component for description
- **`apps/web-app/components/ui/select.tsx`** - Select/dropdown component for linkType

### 2. Update NewTodo Component

**File:** `apps/web-app/components/new-todo.tsx`

- Add form state management using React hooks
- Import and use shadcn Input, Textarea, Select, and Calendar components
- Add form fields:
- Title (Input)
- Description (Textarea)
- Due Date (Calendar with date picker)
- Link Type (Select dropdown with LinkType enum values: FIGMA, LINEAR, NOTION, SLACK, GITHUB, UNKNOWN)
- Link URL (Input)
- Get userId from Clerk using `useAuth().userId`
- Integrate `useAddTodo` hook for form submission
- Handle form submission:
- Validate required fields
- Set completed to false by default
- Call mutation with proper payload
- Close sheet on success using controlled Sheet state
- Invalidate todos query to trigger refetch
- Add submit button with loading state

### 3. Fix and Update useAddTodo Hook

**File:** `apps/web-app/hooks/useAddTodo.tsx`

- Remove incorrect `todos` parameter dependency
- Fix TypeScript types (import or define Todo type)
- Use `useQueryClient` to invalidate 'todos' query on success
- Return proper mutation object with onSuccess handler

### 4. Update Dashboard Page

**File:** `apps/web-app/app/dashboard/page.tsx`

- Display todos list below the header
- Show each todo with:
- Title
- Description
- Due Date (formatted using existing `formatDate` utility)
- Handle loading and empty states
- Filter todos by selected date (if needed) or show all

### 5. Create Type Definitions (if needed)

- Define Todo type interface matching backend entity structure
- Or import from shared types package if available

## Implementation Details

### Form Data Structure

```typescript
{
  title: string;
  description: string;
  completed: false; // always false
  dueDate: Date;
  linkUrl: string;
  linkType: LinkType;
  userId: string; // from Clerk
}
```



### LinkType Enum Values

- FIGMA
- LINEAR
- NOTION
- SLACK
- GITHUB
- UNKNOWN

### Clerk Integration

- Use `useAuth()` from `@clerk/nextjs` to get `userId`
- Ensure user is authenticated before showing form