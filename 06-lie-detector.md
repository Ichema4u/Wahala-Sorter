# 06 Lie Detector

## Five statements about the code

1. In `src/App.tsx`, `getTasksByColumn` currently returns tasks where `task.column !== column`.
2. In `src/components/TaskCard.tsx`, `task.timestamp` is passed through `formatTime` and rendered as relative text such as "just now".
3. In `src/components/Column.tsx`, `handleDrop` reads `taskId` from `e.dataTransfer.getData("taskId")` and always calls `onTaskMove(taskId, columnId)`.
4. The delete button in `src/components/TaskCard.tsx` has a `title="Delete task"` attribute but does not include an explicit `aria-label`.
5. The app uses `useMemo` in `src/App.tsx` to memoize task filtering and avoid repeated computation.

## Guess

I believe statement 5 is the lie.

## Reasoning

- I read the current source files in `src/`, especially `src/App.tsx`, `src/components/TaskCard.tsx`, and `src/components/Column.tsx`.
- A grep search for `useMemo` in `src/**/*.{ts,tsx}` returned no matches, so the app is not using `useMemo` anywhere.
- The changes from the earlier tinker confirmed that `getTasksByColumn` is active in the current runtime and that task placement logic depends on it.
- The code clearly shows the delete button uses `title="Delete task"` and no `aria-label` prop.
- The `handleDrop` implementation always forwards the retrieved `taskId` to `onTaskMove`.

## AI's reveal

Statement 5 is false.
