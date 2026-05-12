# 🏗️ Software Engineering Principles in Wahala Sorter

This document explains the software engineering principles used to build the Wahala Sorter app, with exact line references to show where each principle appears.

---

## 1. 🎯 Single Responsibility Principle (SRP)

**What It Means:**
Every function, component, or module should have ONE job and do it well. Don't mix multiple concerns in one place.

**Why It Matters:**

- Easier to understand
- Easier to test
- Easier to change
- Reusable code

### Example 1: Separated Components

Each component has ONE responsibility:

**`types.ts` (Lines 1-8)** - ONLY defines data types

```typescript
export interface Task {
  id: string;
  title: string;
  column: "now" | "soon" | "later";
  timestamp: Date;
}
```

- Job: Define what a Task looks like
- Does NOT: Handle UI, state, or logic

**`AddTaskForm.tsx` (Lines 1-43)** - ONLY handles form input

```typescript
export default function AddTaskForm({ onAddTask }: AddTaskFormProps) {
  const [input, setInput] = useState(""); // Remember what user typed
  const handleSubmit = (e: React.FormEvent) => {
    // Just handle form submission
  };
}
```

- Job: Let user type and submit
- Does NOT: Manage all tasks, or handle columns

**`TaskCard.tsx` (Lines 22-53)** - ONLY displays ONE task

```typescript
export default function TaskCard({ task, onDelete, onDragStart }: TaskCardProps) {
  return (
    <div draggable onDragStart={(e) => onDragStart(e, task.id)}>
      {/* Just shows ONE task */}
    </div>
  );
}
```

- Job: Show one task card
- Does NOT: Manage all tasks or columns

**`Column.tsx` (Lines 11-92)** - ONLY handles column display and drag/drop

```typescript
export default function ColumnComponent({
  title,
  columnId,
  tasks,
  onTaskDelete,
  onTaskMove,
  onDragStart,
}: ColumnProps) {
  // Just handle column-specific logic
}
```

- Job: Display a column and handle drag/drop for IT
- Does NOT: Manage all app state

### Example 2: Separated Functions

Each function does ONE thing:

**`formatTime()` in TaskCard.tsx (Lines 8-20)** - ONLY formats dates

```typescript
const formatTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  // ... only formats, doesn't do anything else
  return "just now"; // or "5m ago", etc.
};
```

- Job: Take a date, return pretty text
- Does NOT: Handle tasks, state, or display

**`addTask()` in App.tsx (Lines 11-20)** - ONLY creates and adds a task

```typescript
const addTask = (title: string) => {
  const newTask: Task = {
    id: `task-${Date.now()}`,
    title,
    column: "now",
    timestamp: new Date(),
  };
  setTasks([newTask, ...tasks]);
};
```

- Job: Make a new task and add it
- Does NOT: Handle deletion, moving, or display

**`deleteTask()` in App.tsx (Lines 22-24)** - ONLY deletes a task

```typescript
const deleteTask = (id: string) => {
  setTasks(tasks.filter((task) => task.id !== id));
};
```

- Job: Remove a task
- Does NOT: Add, move, or format tasks

**`getTasksByColumn()` in App.tsx (Lines 38-40)** - ONLY filters tasks

```typescript
const getTasksByColumn = (column: Column) => {
  return tasks.filter((task) => task.column === column);
};
```

- Job: Find tasks in a specific column
- Does NOT: Create, delete, or move tasks

---

## 2. 🔄 Separation of Concerns

**What It Means:**
Split your code into different areas so each handles one type of thing:

- **Data/State** - What information exists
- **Logic** - What operations happen
- **UI/Presentation** - What users see
- **Types** - What shapes data has

**Why It Matters:**

- Easier to find bugs
- Changes in one area don't break others
- Can test each part separately

### Example 1: Types Separated

**`types.ts` (Lines 1-8)** - All type definitions in ONE place

```typescript
export interface Task {
  id: string;
  title: string;
  column: "now" | "soon" | "later";
  timestamp: Date;
}
export type Column = "now" | "soon" | "later";
```

- All components IMPORT from here
- If you change Task shape, you change it in ONE place
- All other files automatically get the change

### Example 2: State Management Separated

**`App.tsx` (Lines 6-7)** - State management happens in ONE place (App)

```typescript
const [tasks, setTasks] = useState<Task[]>([]);
const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
```

- All task data lives here
- Other components DON'T manage this data
- They ask App to change it using props

### Example 3: Logic Separated from Display

**TaskCard.tsx** - Logic and display are separate:

Logic (lines 8-20):

```typescript
const formatTime = (date: Date): string => {
  // Pure logic, no JSX
  return "just now";
};
```

Display (lines 22-53):

```typescript
export default function TaskCard({ task, onDelete, onDragStart }: TaskCardProps) {
  return (
    <div draggable onDragStart={(e) => onDragStart(e, task.id)}>
      {/* JSX display only */}
    </div>
  );
}
```

---

## 3. 🧩 Component Composition

**What It Means:**
Build complex UIs by combining smaller, simpler components. Like LEGO blocks!

**Why It Matters:**

- Reuse components
- Easier to understand
- Easier to test
- Easier to change

### Example: Building from Bottom Up

**Level 1: Basic Type**

```typescript
// types.ts - The data shape
export interface Task {
  /* ... */
}
```

**Level 2: Display One Item**

```typescript
// TaskCard.tsx - Shows ONE task
export default function TaskCard({ task, onDelete, onDragStart }: TaskCardProps) {
  return <div draggable>{task.title}</div>;
}
```

**Level 3: Display Collection**

```typescript
// Column.tsx - Shows a collection (lines 55-75)
{tasks.map((task) => (
  <TaskCard
    key={task.id}
    task={task}
    onDelete={onTaskDelete}
    onDragStart={onDragStart}
  />
))}
```

**Level 4: Add Form**

```typescript
// AddTaskForm.tsx - A form for input
export default function AddTaskForm({ onAddTask }: AddTaskFormProps) {
  return <form onSubmit={handleSubmit}>...</form>;
}
```

**Level 5: Combine Everything**

```typescript
// App.tsx (lines 62-88) - Combines all three columns!
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <ColumnComponent
    title="Now"
    columnId="now"
    tasks={getTasksByColumn('now')}
    onTaskDelete={deleteTask}
    onTaskMove={moveTask}
    onDragStart={handleDragStart}
  />
  <ColumnComponent
    title="Soon"
    columnId="soon"
    tasks={getTasksByColumn('soon')}
    onTaskDelete={deleteTask}
    onTaskMove={moveTask}
    onDragStart={handleDragStart}
  />
  <ColumnComponent
    title="Later"
    columnId="later"
    tasks={getTasksByColumn('later')}
    onTaskDelete={deleteTask}
    onTaskMove={moveTask}
    onDragStart={handleDragStart}
  />
</div>
```

**How it works:**

```
App (brain)
├── AddTaskForm (takes input)
└── 3x ColumnComponent (3 columns)
    └── Many TaskCard (many tasks)
```

---

## 4. ♻️ Immutability

**What It Means:**
Don't change data directly. Create NEW data instead. The original stays the same.

**Why It Matters:**

- Easier to track changes
- Easier to undo changes
- Fewer bugs
- React can detect changes better

### Example 1: Adding a Task

**App.tsx (Lines 11-20)** - Creates NEW array with new task

```typescript
const addTask = (title: string) => {
  const newTask: Task = {
    id: `task-${Date.now()}`,
    title,
    column: "now",
    timestamp: new Date(),
  };
  setTasks([newTask, ...tasks]); // ← NEW array with [...] spread operator
};
```

What happens:

- DON'T do: `tasks.push(newTask)` ❌ (changes original)
- DO do: `setTasks([newTask, ...tasks])` ✅ (creates new array)

### Example 2: Deleting a Task

**App.tsx (Lines 22-24)** - Creates NEW array without the deleted task

```typescript
const deleteTask = (id: string) => {
  setTasks(tasks.filter((task) => task.id !== id)); // ← NEW array from filter
};
```

What happens:

- DON'T do: `tasks.splice(index, 1)` ❌ (changes original)
- DO do: `tasks.filter(...)` ✅ (creates new array)

### Example 3: Moving a Task

**App.tsx (Lines 26-32)** - Creates NEW array with NEW task object

```typescript
const moveTask = (taskId: string, targetColumn: Column) => {
  setTasks(
    tasks.map((task) =>
      task.id === taskId
        ? { ...task, column: targetColumn } // ← NEW object with spread {...}
        : task,
    ),
  );
  setDraggedTaskId(null);
};
```

What happens:

- DON'T do: `task.column = targetColumn` ❌ (changes original)
- DO do: `{ ...task, column: targetColumn }` ✅ (creates new object)

---

## 5. 🔄 DRY Principle (Don't Repeat Yourself)

**What It Means:**
If you're writing the same code twice, find a way to write it ONCE and reuse it.

**Why It Matters:**

- Less code = fewer bugs
- Changes in one place update everywhere
- Easier to maintain

### Example 1: Reusing ColumnComponent

**App.tsx (Lines 62-88)** - Same component used 3 times!

Instead of:

```typescript
// ❌ BAD - Repeating the same code 3 times
<NowColumn />
<SoonColumn />
<LaterColumn />
```

They do:

```typescript
// ✅ GOOD - One component, used 3 times with different props
<ColumnComponent title="Now" columnId="now" tasks={getTasksByColumn('now')} />
<ColumnComponent title="Soon" columnId="soon" tasks={getTasksByColumn('soon')} />
<ColumnComponent title="Later" columnId="later" tasks={getTasksByColumn('later')} />
```

**Why this is better:**

- Bug fix in ColumnComponent = fixes all 3!
- Add a feature to columns = it appears in all 3!
- Easier to add a 4th column later

### Example 2: Reusing getTasksByColumn

**App.tsx (Lines 38-40)** - Gets tasks once, used 3 times

```typescript
const getTasksByColumn = (column: Column) => {
  return tasks.filter((task) => task.column === column);
};

// Used 3 times (lines 63, 69, 75):
tasks={getTasksByColumn('now')}
tasks={getTasksByColumn('soon')}
tasks={getTasksByColumn('later')}
```

Instead of writing the filter logic 3 times, it's written ONCE as a function.

### Example 3: Reusing Event Handlers

**App.tsx (Lines 62-88)** - Pass SAME functions to all 3 columns

```typescript
<ColumnComponent
  onTaskDelete={deleteTask}      // ← Same function
  onTaskMove={moveTask}          // ← Same function
  onDragStart={handleDragStart}  // ← Same function
/>
```

All 3 columns use the SAME functions, not copied code.

---

## 6. 🔒 Type Safety with TypeScript

**What It Means:**
Define what types of data can go where. Catch mistakes BEFORE running code.

**Why It Matters:**

- Find bugs early
- Better IDE help (autocomplete)
- Easier to refactor
- Self-documenting code

### Example 1: Task Type

**types.ts (Lines 1-5)**

```typescript
export interface Task {
  id: string; // ← Must be text
  title: string; // ← Must be text
  column: "now" | "soon" | "later"; // ← Can ONLY be these 3 values
  timestamp: Date; // ← Must be a Date
}
```

Now if you try to do:

```typescript
const task: Task = {
  id: 123, // ❌ ERROR! Should be string
  title: "Hello", // ✅ OK
  column: "tomorrow", // ❌ ERROR! Should be "now", "soon", or "later"
  timestamp: new Date(), // ✅ OK
};
```

### Example 2: Props Type

**AddTaskForm.tsx (Lines 3-5)**

```typescript
interface AddTaskFormProps {
  onAddTask: (title: string) => void; // ← Function that takes string, returns nothing
}
```

Now if you pass the wrong function:

```typescript
<AddTaskForm onAddTask={() => 123} />  // ❌ ERROR! Should return void (nothing)
<AddTaskForm onAddTask={(title) => console.log(title)} />  // ✅ OK
```

### Example 3: Column Type

**types.ts (Line 8)**

```typescript
export type Column = "now" | "soon" | "later";
```

**Used in functions:**

```typescript
const moveTask = (taskId: string, targetColumn: Column) => {
  // ✅ Only accepts "now", "soon", or "later"
  // ❌ Can't pass "tomorrow" or anything else
};
```

---

## 7. 📌 Props Pattern (Data Down, Events Up)

**What It Means:**

- **Props DOWN**: Pass data from parent to child
- **Events UP**: Pass functions from parent to child (child calls when something happens)

**Why It Matters:**

- Clear data flow
- Easy to understand
- Easy to debug

### Example: Data and Events Flow

**App.tsx sends to ColumnComponent (Lines 62-75):**

```typescript
<ColumnComponent
  title="Now"                    // ← DATA: What to display
  columnId="now"                 // ← DATA: Which column
  tasks={getTasksByColumn('now')} // ← DATA: The tasks
  onTaskDelete={deleteTask}      // ← EVENT: What to do when delete
  onTaskMove={moveTask}          // ← EVENT: What to do when move
  onDragStart={handleDragStart}  // ← EVENT: What to do when drag
/>
```

**ColumnComponent receives (Column.tsx, Lines 12-18):**

```typescript
export default function ColumnComponent({
  title,        // ← Receives DATA
  columnId,     // ← Receives DATA
  tasks,        // ← Receives DATA
  onTaskDelete, // ← Receives FUNCTION
  onTaskMove,   // ← Receives FUNCTION
  onDragStart,  // ← Receives FUNCTION
}: ColumnProps) {
```

**ColumnComponent uses events (Column.tsx, Lines 31-33):**

```typescript
const handleDrop = (e: React.DragEvent) => {
  const taskId = e.dataTransfer.getData("taskId");
  onTaskMove(taskId, columnId); // ← Calls function from parent
};
```

**Flow diagram:**

```
User Action (drag/drop)
    ↓
ColumnComponent.handleDrop
    ↓
Calls onTaskMove (function from App)
    ↓
App.moveTask runs
    ↓
setTasks updates state
    ↓
React re-renders
    ↓
ColumnComponent gets new tasks prop
    ↓
User sees updated UI
```

---

## 8. 🪝 React Hooks Pattern

**What It Means:**
Use React hooks (`useState`, `useEffect`, etc.) to add state and side effects to functional components.

**Why It Matters:**

- Modern way to write React
- Simpler than class components
- Functions are easier to understand
- Can reuse hook logic

### Example 1: useState for State

**App.tsx (Lines 6-7)** - Remembers tasks and what's being dragged

```typescript
const [tasks, setTasks] = useState<Task[]>([]);
const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
```

**AddTaskForm.tsx (Line 8)** - Remembers what user typed

```typescript
const [input, setInput] = useState("");
```

**How it works:**

```
const [state, setState] = useState(initialValue)
     ↑      ↑             ↑
  value  setter function  starting value
```

When you call `setState`:

1. React updates the state
2. React re-renders the component
3. Component gets new value

### Example 2: Using useState

**App.tsx (Lines 11-20)** - Uses `setTasks` to update state

```typescript
const addTask = (title: string) => {
  const newTask: Task = {
    /* ... */
  };
  setTasks([newTask, ...tasks]); // ← Triggers re-render
};
```

---

## 9. 📝 Declarative Code

**What It Means:**
Say WHAT you want, not HOW to get it. Describe the desired result.

**Why It Matters:**

- Easier to read
- Easier to understand intent
- Less room for bugs

### Example 1: Declarative Rendering

**Column.tsx (Lines 50-75)** - Describes WHAT to show, not HOW to show it

```typescript
{tasks.length === 0 ? (
  <div className="text-center py-8 text-gray-400">
    <p className="text-sm">No tasks yet</p>
    <p className="text-xs mt-1">Drag tasks here to organize them</p>
  </div>
) : (
  <div>
    {tasks.map((task) => (
      <TaskCard key={task.id} task={task} />
    ))}
  </div>
)}
```

**What it says:**

- "IF there are no tasks, SHOW empty message"
- "ELSE, SHOW each task as a TaskCard"
- React figures out HOW to render it

### Example 2: Declarative Event Handling

**AddTaskForm.tsx (Lines 10-16)** - Describes WHAT to do, not HOW

```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (input.trim()) {
    onAddTask(input.trim());
    setInput("");
  }
};
```

It SAYS what to do:

- Prevent default form behavior
- If input exists, add task
- Clear input

It DOESN'T say HOW the DOM works or HOW to manually update it.

### Example 3: JSX is Declarative

**App.tsx (Lines 45-50)** - Describes UI structure

```typescript
<header className="bg-white border-b border-teal-100 sticky top-0 z-10">
  <div className="max-w-7xl mx-auto px-6 py-6">
    <h1 className="text-3xl font-bold text-teal-900">Wahala Sorter</h1>
    <p className="text-teal-600 mt-1">Organize your tasks with ease</p>
  </div>
</header>
```

Says: "Show a header with a title and subtitle"

React figures out: HOW to create DOM elements, HOW to attach listeners, HOW to update them

---

## 10. ✨ Pure Functions

**What It Means:**
A function that:

- Always returns the same output for the same input
- Doesn't change anything outside the function
- Has no side effects

**Why It Matters:**

- Predictable and testable
- Easy to understand
- Easy to reuse

### Example 1: Pure Function - formatTime

**TaskCard.tsx (Lines 8-20)**

```typescript
const formatTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};
```

**Why it's pure:**

- Same input (a date) → Same output (formatted string)
- Doesn't change any outside variables
- Doesn't read from global state
- Predictable!

### Example 2: Pure Function - getTasksByColumn

**App.tsx (Lines 38-40)**

```typescript
const getTasksByColumn = (column: Column) => {
  return tasks.filter((task) => task.column === column);
};
```

**Why it's pure:**

- Same input ("now") → Same output (list of "now" tasks)
- Doesn't modify `tasks` array
- Always returns a new array from filter

### Example 3: Not Pure - handleDragStart

**App.tsx (Lines 34-37)**

```typescript
const handleDragStart = (e: React.DragEvent, taskId: string) => {
  setDraggedTaskId(taskId); // ← SIDE EFFECT!
  e.dataTransfer.effectAllowed = "move"; // ← SIDE EFFECT!
  e.dataTransfer.setData("taskId", taskId); // ← SIDE EFFECT!
};
```

**Why it's NOT pure:**

- Changes state (`setDraggedTaskId`)
- Modifies event object
- Side effects needed for drag/drop to work
- That's OK! Not all functions should be pure.

---

## 11. 🎪 Event Handlers

**What It Means:**
Functions that run in response to user actions (click, drag, type, etc.)

**Why It Matters:**

- React to user input
- Keep code organized
- Easy to understand what happens when

### Event Handler Examples

**onClick - When user clicks:**

```typescript
// TaskCard.tsx (Lines 45-51)
<button
  onClick={() => onDelete(task.id)}  // ← onClick handler
  className="..."
  title="Delete task"
>
  ✕
</button>
```

**onChange - When user types:**

```typescript
// AddTaskForm.tsx (Lines 22-26)
<input
  type="text"
  value={input}
  onChange={(e) => setInput(e.target.value)}  // ← onChange handler
  placeholder="What needs to be done?"
/>
```

**onSubmit - When user submits form:**

```typescript
// AddTaskForm.tsx (Lines 18-25)
<form onSubmit={handleSubmit}>  // ← onSubmit handler
  {/* ... form elements ... */}
</form>
```

**onDragStart - When dragging starts:**

```typescript
// TaskCard.tsx (Lines 29-30)
<div
  draggable
  onDragStart={(e) => onDragStart(e, task.id)}  // ← onDragStart handler
>
```

**onDragOver - When dragging over:**

```typescript
// Column.tsx (Lines 19-22)
const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  e.currentTarget.classList.add("bg-teal-50");
};

// Used:
<div onDragOver={handleDragOver}>  // ← onDragOver handler
```

**onDragLeave - When dragging leaves:**

```typescript
// Column.tsx (Lines 24-26)
const handleDragLeave = (e: React.DragEvent) => {
  e.currentTarget.classList.remove("bg-teal-50");
};

// Used:
<div onDragLeave={handleDragLeave}>  // ← onDragLeave handler
```

**onDrop - When dropped:**

```typescript
// Column.tsx (Lines 28-33)
const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  e.currentTarget.classList.remove("bg-teal-50");
  const taskId = e.dataTransfer.getData("taskId");
  onTaskMove(taskId, columnId);
};

// Used:
<div onDrop={handleDrop}>  // ← onDrop handler
```

---

## 12. 🎯 Default Parameters and Optional Chaining

**What It Means:**
Use default values and safe ways to access properties to prevent errors.

**Why It Matters:**

- Prevent crashes
- Handle missing data gracefully
- Cleaner code

### Example: Optional Properties in UI

**Column.tsx (Lines 45-48)** - Show plural or singular

```typescript
<p className="text-sm text-teal-600 mb-4">
  {tasks.length} task{tasks.length !== 1 ? "s" : ""}
</p>
```

Says: "If not 1 task, add 's', else add nothing"

- 1 task → "1 task"
- 3 tasks → "3 tasks"

---

## 13. 📦 Interfaces and Contracts

**What It Means:**
Define what a component or function MUST receive (props/parameters).

**Why It Matters:**

- Clear expectations
- Self-documenting
- TypeScript checks it

### Example: Component Contracts

**AddTaskFormProps (AddTaskForm.tsx, Lines 3-5)**

```typescript
interface AddTaskFormProps {
  onAddTask: (title: string) => void;
}
```

Says: "To use AddTaskForm, you MUST give me a function called onAddTask"

**TaskCardProps (TaskCard.tsx, Lines 3-6)**

```typescript
interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}
```

Says: "To use TaskCard, you MUST give me these 3 things"

**ColumnProps (Column.tsx, Lines 3-9)**

```typescript
interface ColumnProps {
  title: string;
  columnId: Column;
  tasks: Task[];
  onTaskDelete: (id: string) => void;
  onTaskMove: (taskId: string, targetColumn: Column) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}
```

Says: "To use ColumnComponent, you MUST give me these 6 things"

---

## Summary Table

| Principle                  | Used Where                    | Purpose                           |
| -------------------------- | ----------------------------- | --------------------------------- |
| **Single Responsibility**  | Each component, each function | One job per component             |
| **Separation of Concerns** | types.ts, App.tsx, components | Different code for different jobs |
| **Composition**            | App → Column → TaskCard       | Build complex from simple         |
| **Immutability**           | setTasks calls                | Don't change data in place        |
| **DRY**                    | ColumnComponent used 3x       | Don't repeat code                 |
| **Type Safety**            | TypeScript interfaces         | Catch errors early                |
| **Props Pattern**          | All components                | Data down, events up              |
| **React Hooks**            | useState                      | Modern React patterns             |
| **Declarative Code**       | JSX, ternary operators        | Say WHAT not HOW                  |
| **Pure Functions**         | formatTime, getTasksByColumn  | Predictable functions             |
| **Event Handlers**         | onClick, onChange, onDrag\*   | Respond to user actions           |
| **Interfaces**             | All component props           | Define contracts                  |

---

## 🎓 How These Principles Work Together

```
User Types Task
    ↓
onChange Handler (Event Handler)
    ↓
setInput updates state (React Hooks)
    ↓
AddTaskForm re-renders (Declarative)
    ↓
User Clicks "Add Task"
    ↓
onSubmit Handler (Event Handler)
    ↓
Calls onAddTask function (Props Pattern)
    ↓
App.addTask runs (Single Responsibility)
    ↓
Creates newTask (Type Safety - Task interface)
    ↓
Calls setTasks with new array (Immutability)
    ↓
React detects state change (Hooks)
    ↓
App re-renders with new tasks (Declarative)
    ↓
ColumnComponent gets new tasks prop (Composition + Props)
    ↓
Column displays new task (Separation of Concerns)
    ↓
Column uses TaskCard component (Composition + DRY)
    ↓
TaskCard displays the task (Single Responsibility)
    ↓
User sees new task!
```

Each principle plays a role in making the app work smoothly, understandable, and maintainable!
