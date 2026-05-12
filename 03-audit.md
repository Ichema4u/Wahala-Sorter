# 🔍 Code Audit: Wahala Sorter

A detailed examination of vulnerabilities, performance issues, accessibility gaps, and software engineering violations. Each issue includes why it matters, how to fix it, and why the fix works.

---

## Executive Summary

The Wahala Sorter code is **fundamentally sound** with good component separation and React patterns. However, there are **opportunities for improvement** in three main areas:

1. **Accessibility** - The biggest concern (not keyboard navigable, missing labels)
2. **Performance** - Room for optimization with memoization
3. **Engineering** - Minor improvements for maintainability and robustness

There are **NO critical security vulnerabilities**, but some best practices could strengthen the code.

---

## 🔐 Security Analysis

### ✅ Issue 1: Potential XSS Attack (Actually Safe!)

**Where:** TaskCard.tsx, lines 42

```typescript
<p className="text-sm font-medium text-gray-900 break-words">
  {task.title}
</p>
```

**What's the concern?**
When you display user input directly in HTML, it could include malicious code like:

```javascript
<img src=x onerror="alert('hacked!')">
```

**Why it's actually SAFE here:**
React automatically escapes text content. When you put `{task.title}` in JSX, React treats it as text, not HTML. Even if someone types that image tag, React will display it as literal text: `<img src=x onerror=...>` showing on screen, not executing.

**Why this matters:**
Older frameworks like jQuery or raw JavaScript would let this code run. React's default behavior protects you, which is one reason React is great!

**Rating:** ✅ Safe (React auto-escapes)

---

### ⚠️ Issue 2: ID Generation Could Cause Race Conditions

**Where:** App.tsx, lines 12

```typescript
const newTask: Task = {
  id: `task-${Date.now()}`,
  // ...
};
```

**What's the problem?**
`Date.now()` returns milliseconds since 1970. In a fast system or if users add two tasks in the same millisecond, you could get two tasks with the same ID!

```javascript
task - 1715459847625;
task - 1715459847625; // ← DUPLICATE!
```

**Why it matters:**
When deleting a task, if two have the same ID, you might delete the wrong one. React keys also depend on these IDs, which could cause render bugs.

**How to fix it:**

```typescript
import { v4 as uuidv4 } from "uuid";

const newTask: Task = {
  id: uuidv4(), // ← Uses UUID library
  // ...
};
```

**Why this works:**
UUIDs generate globally unique IDs with almost zero chance of collision. They're designed for exactly this problem.

**Implementation note:**
First install: `npm install uuid`

**Teaching moment:**
This is a subtle bug that probably won't happen in real use, but it's why databases use proper ID generation. Always think: "What if this happens at the exact same time?"

---

### ✅ Issue 3: Task Title Length (Safe for Now)

**Where:** AddTaskForm.tsx, lines 21-26

```typescript
<input
  type="text"
  value={input}
  // No maxLength validation
/>
```

**What's the concern?**
What if someone pastes a 100MB text into the task field? The browser would handle it, but it's wasteful.

**Why it's not critical now:**
Browser form inputs have practical limits. The UI would slow down, but it won't crash the server (there is no server!).

**How to improve it:**

```typescript
<input
  type="text"
  value={input}
  onChange={(e) => setInput(e.target.value.slice(0, 200))}
  maxLength={200}
  placeholder="What needs to be done? (max 200 chars)"
/>
```

**Why this works:**

- `maxLength={200}` - Browser prevents typing past 200 chars
- `.slice(0, 200)` - Backup prevention in JavaScript
- User sees the limit in placeholder

**Teaching moment:**
This is defensive programming. You're not being paranoid; you're being practical. Limits help users understand expectations and prevent accidents.

---

## ⚡ Performance Analysis

### ⚠️ Issue 1: Filter Called Multiple Times Per Render

**Where:** App.tsx, lines 63, 69, 75

```typescript
<ColumnComponent
  title="Now"
  columnId="now"
  tasks={getTasksByColumn('now')}  // ← Filter happens here
  // ...
/>
<ColumnComponent
  title="Soon"
  columnId="soon"
  tasks={getTasksByColumn('soon')}  // ← AND here
  // ...
/>
<ColumnComponent
  title="Later"
  columnId="later"
  tasks={getTasksByColumn('later')}  // ← AND here
/>
```

**What's happening?**
Every time App re-renders, it calls `getTasksByColumn()` three times. With 100 tasks, that's 300 filter operations!

```javascript
getTasksByColumn("now"); // Filter all 100 tasks
getTasksByColumn("soon"); // Filter all 100 tasks again
getTasksByColumn("later"); // Filter all 100 tasks again
```

**Why it matters:**

- With 1000 tasks = 3000 filters per render
- If rendering happens frequently, this adds up
- Modern React is fast, but why make it work harder?

**How to fix it:**

```typescript
import { useMemo } from 'react';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Only recalculate when tasks actually changes
  const tasksByColumn = useMemo(() => ({
    now: tasks.filter((task) => task.column === 'now'),
    soon: tasks.filter((task) => task.column === 'soon'),
    later: tasks.filter((task) => task.column === 'later'),
  }), [tasks]);

  return (
    <>
      {/* ... */}
      <ColumnComponent
        title="Now"
        columnId="now"
        tasks={tasksByColumn.now}  // ← Already filtered!
      />
      <ColumnComponent
        title="Soon"
        columnId="soon"
        tasks={tasksByColumn.soon}  // ← Already filtered!
      />
      <ColumnComponent
        title="Later"
        columnId="later"
        tasks={tasksByColumn.later}  // ← Already filtered!
      />
    </>
  );
}
```

**Why this works:**

- `useMemo` remembers the filtered results
- Only re-filters when `tasks` changes
- If parent re-renders but tasks don't change, ColumnComponent gets the same object
- React skips rendering if props are identical (memoization)

**Teaching moment:**
This is about lazy evaluation: "Don't do work until you have to, and don't redo work you already did."

**When to use it:**

- When filtering/sorting is expensive
- When you have 100+ items
- When parent re-renders often

---

### ⚠️ Issue 2: formatTime Recalculates Every Render

**Where:** TaskCard.tsx, lines 37

```typescript
<span className="text-xs text-gray-500">
  {formatTime(task.timestamp)}
</span>
```

**What's happening?**
When ANY prop changes on TaskCard, it re-renders and calls `formatTime()` again, even if the timestamp hasn't changed!

This becomes a problem with many tasks because:

- 50 tasks × formatTime() per render = lots of calculation
- formatTime calls `new Date()` every time (creates object)

**How to fix it:**

Option 1: Memoize TaskCard component

```typescript
import { memo } from 'react';

export default memo(function TaskCard({
  task,
  onDelete,
  onDragStart,
}: TaskCardProps) {
  // Component only re-renders if props actually change
  return (
    <div draggable onDragStart={(e) => onDragStart(e, task.id)}>
      {/* ... */}
    </div>
  );
});
```

Option 2: Memoize the time calculation

```typescript
import { useMemo } from 'react';

export default function TaskCard({
  task,
  onDelete,
  onDragStart,
}: TaskCardProps) {
  const formattedTime = useMemo(
    () => formatTime(task.timestamp),
    [task.timestamp]
  );

  return (
    <div draggable onDragStart={(e) => onDragStart(e, task.id)}>
      {/* ... */}
      <span className="text-xs text-gray-500">
        {formattedTime}
      </span>
    </div>
  );
}
```

**Why this works:**

- `memo()` - Only re-renders if props actually change
- `useMemo()` - Only recalculate if dependencies change
- Both prevent unnecessary work

**Teaching moment:**
This is premature optimization for most cases. Do it if you have:

- Many items (50+)
- Expensive calculations
- Noticeable slowness

Start simple, optimize when you see the problem.

---

### ⚠️ Issue 3: Inline Event Handlers in JSX

**Where:** Column.tsx, lines 20-22, 24-26, 28-33

```typescript
const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  e.currentTarget.classList.add("bg-teal-50");
};

const handleDragLeave = (e: React.DragEvent) => {
  e.currentTarget.classList.remove("bg-teal-50");
};

const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  // ...
};

return (
  <div
    onDragOver={handleDragOver}      // ← OK - reference
    onDragLeave={handleDragLeave}    // ← OK - reference
    onDrop={handleDrop}              // ← OK - reference
  >
```

**Good news:** This part is CORRECT! The handlers are defined outside JSX.

**Where it would be WRONG (TaskCard.tsx, lines 30-31):**

```typescript
// ❌ BAD - Don't do this:
onDragStart={(e) => onDragStart(e, task.id)}  // Creates new function each render!

// ✅ GOOD - Extract to named handler:
const handleDragStart = (e: React.DragEvent) => onDragStart(e, task.id);
// Then use: onDragStart={handleDragStart}
```

**Why inline handlers are problematic:**

- Each render creates a NEW function object
- React sees it as a different prop
- Causes child component to re-render unnecessarily
- With many TaskCards, this adds up

**Teaching moment:**
Your code is already doing this RIGHT! Just know this pattern for the future. Always define event handlers BEFORE the JSX.

---

## ♿ Accessibility Analysis

### 🔴 Issue 1: Delete Button Not Accessible

**Where:** TaskCard.tsx, lines 44-51

```typescript
<button
  onClick={() => onDelete(task.id)}
  className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors text-lg leading-none"
  title="Delete task"
>
  ✕
</button>
```

**What's wrong?**

1. **Icon without label** - Screen readers only hear "button" (what does it do?)
2. **No aria-label** - Blind users don't know it says "Delete"
3. **No confirmation** - User might delete by accident
4. **Color only** - Relies on red color to indicate delete (what about colorblind users?)
5. **Keyboard interaction unclear** - Not obvious it's interactive

**Why this matters:**
Imagine using a screen reader:

- You hear: "button"
- You think: "What does this button do?"
- You click it
- Your task is deleted! You had no warning.

For a colorblind person:

- Can't tell it's a delete button from color
- Text "✕" might not convey meaning

**How to fix it:**

```typescript
<button
  onClick={() => {
    if (confirm(`Delete task: "${task.title}"?`)) {
      onDelete(task.id);
    }
  }}
  aria-label={`Delete task: ${task.title}`}
  className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors text-lg leading-none hover:scale-110"
  title="Delete task (will ask for confirmation)"
>
  🗑️ Delete
</button>
```

**Why this works:**

- `aria-label="Delete task: ..."` - Screen readers announce what it does
- `confirm()` dialog - User must confirm before deleting
- Emoji 🗑️ - Universal trash can symbol (more accessible than ✕)
- Text "Delete" - Explicit text, not just symbol
- `hover:scale-110` - Visual feedback it's interactive

**Teaching moment:**
Accessibility isn't about being nice; it's about whether your app works for users with:

- Visual impairments (need screen readers)
- Color blindness (can't read by color)
- Motor issues (might not use mouse)
- Cognitive differences (need clear labels)

---

### 🔴 Issue 2: Drag and Drop Keyboard Inaccessible

**Where:** TaskCard.tsx, line 28-30

```typescript
<div
  draggable
  onDragStart={(e) => onDragStart(e, task.id)}
  className="...cursor-move..."
>
```

**What's wrong?**
Drag and drop only works with a mouse! Users with:

- No mouse
- Motor disabilities
- Keyboard preference
  ...can't move tasks between columns.

**Why this matters:**
In countries like Canada, you might be required by law to support keyboard navigation for government/corporate apps.

**How to fix it:**

Create a helper component:

```typescript
// NEW FILE: components/DraggableTask.tsx
interface DraggableTaskProps {
  task: Task;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onMove: (taskId: string, direction: 'up' | 'down' | 'left' | 'right') => void;
}

export default function DraggableTask({
  task,
  onDelete,
  onDragStart,
  onMove,
}: DraggableTaskProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+Up = move up in list
    if (e.ctrlKey && e.key === 'ArrowUp') {
      e.preventDefault();
      onMove(task.id, 'up');
    }
    // Ctrl+Right = move to next column
    if (e.ctrlKey && e.key === 'ArrowRight') {
      e.preventDefault();
      onMove(task.id, 'right');
    }
    // Ctrl+Left = move to previous column
    if (e.ctrlKey && e.key === 'ArrowLeft') {
      e.preventDefault();
      onMove(task.id, 'left');
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${task.title}, ${task.column} column. Press Ctrl+Arrow keys to move`}
      className="...cursor-move focus:outline-2 focus:outline-offset-2 focus:outline-teal-600..."
    >
      {/* Task content */}
    </div>
  );
}
```

In App.tsx, add handler:

```typescript
const moveTaskByKeyboard = (
  taskId: string,
  direction: "up" | "down" | "left" | "right",
) => {
  const columns: Column[] = ["now", "soon", "later"];
  const columnIndex = columns.indexOf(
    tasks.find((t) => t.id === taskId)?.column || "now",
  );

  if (direction === "left" && columnIndex > 0) {
    moveTask(taskId, columns[columnIndex - 1]);
  } else if (direction === "right" && columnIndex < columns.length - 1) {
    moveTask(taskId, columns[columnIndex + 1]);
  }
  // 'up' and 'down' would reorder within column (more complex)
};
```

**Why this works:**

- `onKeyDown` - Detects keyboard input
- `tabIndex={0}` - Makes div focusable (keyboard accessible)
- `role="button"` - Tells screen readers this is clickable
- `aria-label` - Explains what it does and how to use it
- `Ctrl+Arrow` - Standard keyboard navigation pattern
- `focus:outline-2` - Shows focus state visually

**Teaching moment:**
Keyboard accessibility benefits EVERYONE:

- Users with disabilities benefit obviously
- Power users prefer keyboard shortcuts
- Mobile/touch users appreciate simpler interactions
- Testing is easier with keyboard automation

---

### 🔴 Issue 3: Missing Form Labels

**Where:** AddTaskForm.tsx, lines 21-26

```typescript
<input
  type="text"
  value={input}
  onChange={(e) => setInput(e.target.value)}
  placeholder="What needs to be done?"
  // No <label> element!
/>
```

**What's wrong?**

- Screen readers see an orphaned input
- No clear association between input and label
- Mobile keyboards might not work optimally
- Touch target too small for accessibility

**How to fix it:**

```typescript
<form onSubmit={handleSubmit} className="mb-8">
  <div className="flex gap-3">
    <label htmlFor="taskInput" className="sr-only">
      What needs to be done?
    </label>
    <input
      id="taskInput"
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="What needs to be done?"
      aria-label="Add a new task"
      className="flex-1 px-4 py-3 rounded-lg border border-teal-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 bg-white text-gray-900 placeholder-gray-500 transition-all"
    />
    <button type="submit" disabled={!input.trim()} aria-label="Add task button">
      Add Task
    </button>
  </div>
</form>
```

Add to your CSS:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

**Why this works:**

- `<label htmlFor="taskInput">` - Programmatically links label to input
- `id="taskInput"` - Connects label and input
- `.sr-only` class - Hides label visually but visible to screen readers
- `aria-label` - Backup accessibility label
- Larger click target - Both label and input are clickable

**Teaching moment:**
Don't skip labels just because you have a placeholder. Placeholders disappear when user types! Screen readers also ignore them. Always use proper `<label>` elements.

---

### 🟡 Issue 4: Color Used Alone to Convey Meaning

**Where:** TaskCard.tsx, lines 37-40

```typescript
<span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">
  {task.column.charAt(0).toUpperCase() + task.column.slice(1)}
</span>
```

**What's wrong?**
The column name is displayed only by color (teal badge). For colorblind users, they might not recognize it as a label.

**How to fix it:**

```typescript
<span
  className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded"
  aria-label={`Column: ${task.column}`}
>
  {/* Add icon for visual clarity */}
  {task.column === 'now' && '⚡'}
  {task.column === 'soon' && '⏰'}
  {task.column === 'later' && '📅'}
  {' '}
  {task.column.charAt(0).toUpperCase() + task.column.slice(1)}
</span>
```

**Why this works:**

- Icons provide additional visual cues beyond color
- Text is still present and clear
- `aria-label` explains to screen readers
- Colorblind users now have icon + text + color

**Teaching moment:**
WCAG rule: "Color should not be the only way to convey information."

---

### 🟡 Issue 5: No Focus Indicators

**Where:** All interactive elements

**What's wrong?**
When keyboard users tab through, they might not see which element has focus (which element will respond to Enter key?).

**How to fix it:**
Make sure all interactive elements have visible focus states:

```typescript
// In your index.css, add:
*:focus-visible {
  outline: 2px solid #14b8a6;  /* teal */
  outline-offset: 2px;
}

button:focus-visible,
input:focus-visible,
[role="button"]:focus-visible {
  outline: 3px solid #0d9488;  /* darker teal */
  outline-offset: 2px;
}

/* Or in Tailwind classes: */
className="focus:outline-2 focus:outline-teal-600 focus:outline-offset-2"
```

**Why this works:**

- `:focus-visible` - Shows focus for keyboard users only (not mouse)
- Outline is accessible (doesn't hide content like a border does)
- 3px is visible enough for accessibility

---

## 🏗️ Software Engineering Violations

### 🟡 Issue 1: Magic Strings Repeated

**Where:** App.tsx, lines 63, 69, 75, and Column.tsx, lines 45

```typescript
// App.tsx
columnId="now"
columnId="soon"
columnId="later"

// Column.tsx
tasks.length === 0 ? (...)
```

**What's wrong?**
The strings "now", "soon", "later" appear in multiple files. If you want to add a "urgent" column, you'd have to find and change them everywhere!

**How to fix it:**

Create a constants file:

```typescript
// src/constants.ts
export const COLUMNS = {
  NOW: "now",
  SOON: "soon",
  LATER: "later",
} as const;

export const COLUMN_LABELS = {
  [COLUMNS.NOW]: "Now",
  [COLUMNS.SOON]: "Soon",
  [COLUMNS.LATER]: "Later",
} as const;
```

Update App.tsx:

```typescript
import { COLUMNS, COLUMN_LABELS } from './constants';

export default function App() {
  // ...
  return (
    <>
      {Object.entries(COLUMNS).map(([key, columnId]) => (
        <ColumnComponent
          key={columnId}
          title={COLUMN_LABELS[columnId]}
          columnId={columnId}
          tasks={getTasksByColumn(columnId)}
          onTaskDelete={deleteTask}
          onTaskMove={moveTask}
          onDragStart={handleDragStart}
        />
      ))}
    </>
  );
}
```

**Why this works:**

- Single source of truth
- Add new column: just update constants
- TypeScript catches mistakes
- Easier to maintain

**Teaching moment:**
This is DRY (Don't Repeat Yourself) applied. Repeated strings are bugs waiting to happen.

---

### 🟡 Issue 2: No Input Validation

**Where:** App.tsx, lines 11-15

```typescript
const addTask = (title: string) => {
  const newTask: Task = {
    id: `task-${Date.now()}`,
    title, // ← No validation!
    column: "now",
    timestamp: new Date(),
  };
  setTasks([newTask, ...tasks]);
};
```

**What's wrong?**
What if title is:

- Empty string (after trim)?
- Whitespace only?
- Too long (10000 characters)?
- Contains only numbers that look like IDs?

**How to fix it:**

```typescript
const addTask = (title: string) => {
  // Validate input
  const cleanTitle = title.trim();

  if (!cleanTitle) {
    console.warn("Task title cannot be empty");
    return;
  }

  if (cleanTitle.length > 200) {
    console.warn("Task title cannot exceed 200 characters");
    return;
  }

  if (cleanTitle.length < 3) {
    console.warn("Task title must be at least 3 characters");
    return;
  }

  const newTask: Task = {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: cleanTitle,
    column: "now",
    timestamp: new Date(),
  };
  setTasks([newTask, ...tasks]);
};
```

**Why this works:**

- Prevents invalid data from entering
- Better error messages
- Improved ID generation (adds random part)
- User experience improves (validation feedback)

**Teaching moment:**
Never trust user input. Validate on the client (for UX) and server (for security). Even with good intentions, data gets corrupted.

---

### 🟡 Issue 3: No Error Boundaries

**Where:** Entire App.tsx

**What's wrong?**
If any component crashes, the entire app becomes blank (white screen of death).

**How to fix it:**

Create an Error Boundary component:

```typescript
// src/components/ErrorBoundary.tsx
import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

Update main.tsx:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
```

**Why this works:**

- Catches errors in child components
- Shows friendly message instead of blank screen
- Offers user a way to recover (reload)
- Logs error for debugging

**Teaching moment:**
Error boundaries are your safety net. They prevent one bug from breaking the entire app.

---

### 🟡 Issue 4: Manual DOM Manipulation in Event Handlers

**Where:** Column.tsx, lines 20-22, 24-26

```typescript
const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  e.currentTarget.classList.add("bg-teal-50"); // ← Direct DOM manipulation!
};

const handleDragLeave = (e: React.DragEvent) => {
  e.currentTarget.classList.remove("bg-teal-50"); // ← Direct DOM manipulation!
};
```

**What's wrong?**
Manually changing classes mixes React state with direct DOM manipulation. This can cause:

- State and DOM getting out of sync
- Hard-to-debug visual issues
- React can't optimize rendering

**How to fix it:**

```typescript
const [draggedOver, setDraggedOver] = useState(false);

const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  setDraggedOver(true);  // ← Use state instead!
};

const handleDragLeave = (e: React.DragEvent) => {
  setDraggedOver(false);  // ← Use state instead!
};

return (
  <div
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    onDrop={handleDrop}
    className={`bg-gray-50 rounded-xl p-6 min-h-96 flex flex-col transition-colors ${
      draggedOver ? 'bg-teal-50' : ''
    }`}
  >
```

**Why this works:**

- React manages the state
- UI always reflects true state
- Easier to test
- Easier to understand

**Teaching moment:**
In React, think of the UI as a function of state:

```
UI = f(state)
```

Not:

```
UI = direct DOM manipulation
```

---

### 🟡 Issue 5: No PropTypes or Default Values

**Where:** All components

**What's wrong?**
If someone passes wrong props, TypeScript will complain, but at runtime things might break silently.

**How to fix it:**

```typescript
// TaskCard.tsx
import PropTypes from "prop-types";

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

export default function TaskCard({
  task,
  onDelete,
  onDragStart,
}: TaskCardProps) {
  // ...
}

TaskCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    column: PropTypes.oneOf(["now", "soon", "later"]).isRequired,
    timestamp: PropTypes.instanceOf(Date).isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onDragStart: PropTypes.func.isRequired,
};
```

**Why this works:**

- Runtime validation catches bugs
- Clear documentation of expected props
- Warnings in console if props are wrong
- TypeScript provides compile-time checking, PropTypes provides runtime checking

**Teaching moment:**
TypeScript is great, but it disappears when you build for production. PropTypes stick around and catch real runtime errors.

---

### 🟡 Issue 6: No Confirmation Before Destructive Action

**Where:** App.tsx, lines 22-24

```typescript
const deleteTask = (id: string) => {
  setTasks(tasks.filter((task) => task.id !== id)); // ← No warning!
};
```

**What's wrong?**
If user clicks delete by accident, their task is gone forever.

**How to fix it:**

```typescript
const deleteTask = (id: string) => {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  if (confirm(`Delete task "${task.title}"?\n\nThis cannot be undone.`)) {
    setTasks(tasks.filter((t) => t.id !== id));
  }
};
```

Or better, with a modal (but confirm() works for simple cases):

```typescript
const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

// In JSX:
{taskToDelete && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
    <div className="bg-white rounded-lg p-6 max-w-sm">
      <h2 className="text-xl font-bold mb-4">Delete Task?</h2>
      <p className="text-gray-600 mb-6">This action cannot be undone.</p>
      <div className="flex gap-3">
        <button
          onClick={() => {
            deleteTask(taskToDelete);
            setTaskToDelete(null);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete
        </button>
        <button
          onClick={() => setTaskToDelete(null)}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
```

**Why this works:**

- `confirm()` simple - "Are you sure?"
- Modal more polished - Custom UI
- Both prevent accidental deletion

**Teaching moment:**
UI pattern rule: The more destructive the action, the harder it should be to do by accident.

---

## 📊 Severity Summary

| Issue                       | Severity | Impact          | Effort to Fix |
| --------------------------- | -------- | --------------- | ------------- |
| Delete without confirmation | High     | User experience | Low           |
| Keyboard accessibility      | High     | Legal/inclusive | Medium        |
| Screen reader labels        | High     | Inclusive       | Low           |
| Input validation            | Medium   | Data quality    | Low           |
| Performance memoization     | Medium   | Speed           | Low           |
| Error boundaries            | Medium   | Reliability     | Medium        |
| DOM manipulation            | Medium   | Maintainability | Medium        |
| UUID for IDs                | Low      | Edge case       | Low           |
| Input length limits         | Low      | Edge case       | Low           |
| Magic strings               | Low      | Maintainability | Low           |

---

## ✅ What's Already Good

The code does many things RIGHT:

1. ✅ **Component composition** - Well-separated concerns
2. ✅ **TypeScript** - Good type safety
3. ✅ **State management** - Simple and clear
4. ✅ **Immutable updates** - Using spread operator correctly
5. ✅ **Event handler organization** - Not inline in JSX (mostly)
6. ✅ **No security vulnerabilities** - React auto-escapes text
7. ✅ **DRY principle** - Components reused appropriately

---

## 🎯 Priority Fix Order

If you want to improve the codebase, do it in this order:

### Phase 1: Quick Wins (30 minutes)

1. Add delete confirmation
2. Add `aria-label` to delete button
3. Add form label with `.sr-only`
4. Add `maxLength` to input

### Phase 2: Accessibility (1 hour)

1. Fix color-only information issue
2. Add focus visible styles
3. Add proper heading hierarchy

### Phase 3: Performance (1 hour)

1. Add `useMemo` for task filtering
2. Memoize TaskCard component
3. Fix drag/drop DOM manipulation

### Phase 4: Robustness (2 hours)

1. Add Error Boundary
2. Improve ID generation
3. Add input validation
4. Add keyboard navigation

### Phase 5: Maintenance (1 hour)

1. Extract magic strings to constants
2. Add PropTypes
3. Add helpful console warnings

---

## 🎓 Key Takeaway

Good code isn't just about making it work. It's about making it work for:

- **Users** - Fast, accessible, reliable
- **Developers** - Maintainable, testable, understandable
- **Business** - Solves problems without introducing new ones

The Wahala Sorter has a strong foundation. These improvements make it production-ready.
