---
name: React Hook Form Refactor and Dashboard UI Enhancement
overview: Refactor NewTodo component to use React Hook Form for state management, and enhance the dashboard UI with icons, colored badges for link types, and clickable links.
todos: []
---

# React Hook Form Refactor

and Dashboard UI Enhancement

## Overview

Refactor the NewTodo component to use React Hook Form instead of multiple useState hooks, and enhance the dashboard UI with better visual design including icons, colored badges, and clickable links.

## Files to Modify/Create

### 1. Install Dependencies

- Install `react-hook-form` package
- Optionally install `@hookform/resolvers` and `zod` for validation (optional but recommended)

### 2. Refactor NewTodo Component

**File:** `apps/web-app/components/new-todo.tsx`

- Replace all `useState` hooks with `useForm` from React Hook Form
- Use `register` or `Controller` for form fields
- Use `Controller` for Calendar component (custom component)
- Use `Controller` for Select component (custom component)
- Integrate form validation with React Hook Form
- Use `reset()` method to clear form on success
- Keep Sheet `open` state separate (UI state, not form state)
- Maintain same functionality with cleaner code

### 3. Create Badge Component (if needed)

**File:** `apps/web-app/components/ui/badge.tsx` (create if doesn't exist)

- Create shadcn-style badge component for link type labels
- Support different variants/colors for different link types

### 4. Enhance Dashboard UI

**File:** `apps/web-app/app/dashboard/page.tsx`

- Add calendar icon (CalendarIcon from lucide-react) next to due date
- Create colored badges for link types:
- FIGMA: Purple/violet color
- LINEAR: Blue color
- NOTION: Gray/neutral color
- SLACK: Purple color
- GITHUB: Dark/black color
- UNKNOWN: Gray color
- Display link URL as clickable link with external link icon
- Make link open in new tab (`target="_blank" rel="noopener noreferrer"`)
- Improve card layout with better spacing and visual hierarchy
- Add hover effects and better styling

### 5. Create Link Type Utility

**File:** `apps/web-app/utils/linkType.ts` (optional helper)

- Create utility function to get badge color/variant for link type
- Create function to get display name for link type
- Centralize link type styling logic

## Implementation Details

### React Hook Form Integration

- Use `useForm` hook with default values
- Register inputs with `register()` for simple inputs
- Use `Controller` for Calendar and Select components
- Handle form submission with `handleSubmit` wrapper
- Reset form on successful submission

### Dashboard Enhancements

- Use CalendarIcon from lucide-react for due date
- Use ExternalLink icon from lucide-react for links
- Create badge component with color variants
- Improve card design with:
- Better padding and spacing
- Visual separation between elements
- Hover states
- Better typography hierarchy

### Link Type Badge Colors

- FIGMA: `bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200`
- LINEAR: `bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`
- NOTION: `bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200`