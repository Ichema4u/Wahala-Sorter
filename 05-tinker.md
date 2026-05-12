# 05 Tinker: One Line Change Experiment

## Selected line

In `src/App.tsx`, I changed the filter direction in `getTasksByColumn`:

```ts
return tasks.filter((task) => task.column !== column);
```

## Prediction

I predicted this would break the column assignment logic. Specifically, I expected tasks to appear in the wrong columns or disappear from their intended column because the helper now selects every task that does not belong to the target column.

## Change made

- Original line: `return tasks.filter((task) => task.column === column);`
- Updated line: `return tasks.filter((task) => task.column !== column);`

## Actual result

- The app still built successfully.
- At runtime, a new task entered in the form was not shown in the "Now" column.
- Instead, the same task appeared in both the "Soon" and "Later" columns.

## Gap taught

This experiment showed that one line in the filtering helper completely changes task assignment semantics. The helper is critical to column rendering, so a small typo like `===` versus `!==` does not break compilation but produces a visibly incorrect UI state.

## Conclusion

A single boolean operator change in a reusable helper can introduce a logic bug that is easy to miss without runtime verification. This highlights the importance of end-to-end checks or component-level tests for rendering logic.
