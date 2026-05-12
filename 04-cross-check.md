# 04 Cross-Check: What the First Audit Missed

This document reviews the existing codebase in `src/` and highlights findings that were not fully covered in `docs/03-audit.md`.

## Summary

The first audit identified several good points and some important potential issues, but it missed a few practical gaps in accessibility, drag-and-drop robustness, user experience, and defensive validation.

## 1. Accessibility and keyboard support

### Missing input label

- `src/components/AddTaskForm.tsx` uses a placeholder-only input.
- Best practice is to provide a visible `<label>` or `aria-label` so screen readers can announce the field clearly.

### Drag-and-drop is not keyboard accessible

- `src/components/TaskCard.tsx` makes tasks draggable, but there is no keyboard alternative for moving tasks.
- `src/components/Column.tsx` uses native drag events only; this means users who rely on keyboard navigation cannot move tasks between columns.

### Action button accessibility

- The delete button in `TaskCard.tsx` renders only a close symbol (`✕`).
- It should include an explicit accessible label such as `aria-label="Delete task"` to improve clarity for assistive technology.

## 2. Drag/drop robustness

### Missing validation on drop

- `src/components/Column.tsx` calls `e.dataTransfer.getData('taskId')` and passes the result to `onTaskMove` without verifying it.
- If a drag event originates from outside the app or the data transfer is empty, this can produce an invalid move call.
- Recommended fix: verify `taskId` is non-empty before calling `onTaskMove`.

### No keyboard or touch fallback

- The app only supports pointer drag-and-drop.
- A fallback action such as a dropdown or buttons for moving tasks would make the UX more inclusive.

## 3. User experience and persistence

### No persistence of tasks

- There is no `localStorage` or other persistence layer.
- User tasks are lost on page refresh, which is a significant practical gap for a task organizer app.

### No input length constraint

- `src/components/AddTaskForm.tsx` does not enforce `maxLength` on the task title.
- This was noted in the first audit as a potential improvement, but it is worth calling out again as a user-facing guardrail.

## 4. Performance and render efficiency

### Re-filtering tasks on every render

- `src/App.tsx` calls `getTasksByColumn('now')`, `getTasksByColumn('soon')`, and `getTasksByColumn('later')` on each render.
- This is a small inefficiency that could be improved with `useMemo` or by computing grouped tasks once.

## 5. Type and future-proofing concerns

### Task timestamp type assumption

- `src/types.ts` defines `timestamp: Date`.
- If the app later adds persistence or JSON hydration, task timestamps would arrive as strings and require parsing before use.
- This is not currently broken, but it is a future-proofing gap.

### Duplicate ID risk remains relevant

- The first audit correctly flagged `id: \`task-${Date.now()}\``in`src/App.tsx` as fragile.
- This remains a valid finding: collision risk exists if two tasks are created within the same millisecond.

## 6. What the first audit got right

- The React XSS concern in `TaskCard.tsx` is not a real vulnerability because React escapes text content by default.
- The `Date.now()` ID generation issue is a valid design weakness.
- The performance recommendation to reduce repeated filtering is also valid.

## Recommended next actions

1. Add a visible label or `aria-label` to the task input field.
2. Add explicit `aria-label` text to the delete button.
3. Guard `onTaskMove` against empty `taskId` values.
4. Add a keyboard-accessible task move option or alternate controls.
5. Add persistence with `localStorage` to prevent task loss on refresh.
6. Enforce a reasonable maximum task title length.
7. Optimize column task filtering with `useMemo` or grouped state.

---

These findings provide a practical cross-check of the code and capture the most relevant gaps that were not fully addressed in the initial audit.
