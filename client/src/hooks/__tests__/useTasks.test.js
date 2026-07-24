import { describe, it, expect } from 'vitest';
import { toggleTaskCompleted, revertTaskCompleted } from '../useTasks.js';

describe('toggleTaskCompleted', () => {
  it('flips only the target task and returns its previous value', () => {
    const tasks = [
      { id: 1, title: 'Task A', completed: false },
      { id: 2, title: 'Task B', completed: false },
    ];

    const { tasks: result, previousCompleted } = toggleTaskCompleted(tasks, 1);

    expect(previousCompleted).toBe(false);
    expect(result.find((t) => t.id === 1).completed).toBe(true);
    expect(result.find((t) => t.id === 2).completed).toBe(false);
  });

  it('leaves untouched task objects referentially identical', () => {
    const taskB = { id: 2, title: 'Task B', completed: false };
    const tasks = [{ id: 1, title: 'Task A', completed: false }, taskB];

    const { tasks: result } = toggleTaskCompleted(tasks, 1);

    expect(result.find((t) => t.id === 2)).toBe(taskB);
  });

  it('returns the same array reference and undefined when the id is not found', () => {
    const tasks = [{ id: 1, title: 'Task A', completed: false }];

    const { tasks: result, previousCompleted } = toggleTaskCompleted(tasks, 999);

    expect(result).toBe(tasks);
    expect(previousCompleted).toBeUndefined();
  });
});

describe('revertTaskCompleted', () => {
  it('restores only the specified task', () => {
    const tasks = [
      { id: 1, title: 'Task A', completed: true },
      { id: 2, title: 'Task B', completed: true },
    ];

    const result = revertTaskCompleted(tasks, 1, false);

    expect(result.find((t) => t.id === 1).completed).toBe(false);
    expect(result.find((t) => t.id === 2).completed).toBe(true);
  });
});

describe('race condition regression (rapid toggles, one request fails)', () => {
  it('reverting a failed toggle does not wipe out a different task toggled in the meantime', () => {
    // Reproduces the reported bug: click Task A, then quickly click Task B
    // before A's request resolves, then A's request fails.
    let tasks = [
      { id: 1, title: 'Task A', completed: false },
      { id: 2, title: 'Task B', completed: false },
    ];

    // Click A: optimistic update, remember A's previous value for a
    // possible revert.
    const toggleA = toggleTaskCompleted(tasks, 1);
    tasks = toggleA.tasks;
    expect(tasks).toEqual([
      { id: 1, title: 'Task A', completed: true },
      { id: 2, title: 'Task B', completed: false },
    ]);

    // Click B before A's request comes back: optimistic update.
    const toggleB = toggleTaskCompleted(tasks, 2);
    tasks = toggleB.tasks;
    expect(tasks).toEqual([
      { id: 1, title: 'Task A', completed: true },
      { id: 2, title: 'Task B', completed: true },
    ]);

    // A's request fails: revert only A, using A's remembered previous value.
    tasks = revertTaskCompleted(tasks, 1, toggleA.previousCompleted);

    // Task A reverted; Task B's toggle survives untouched.
    expect(tasks).toEqual([
      { id: 1, title: 'Task A', completed: false },
      { id: 2, title: 'Task B', completed: true },
    ]);
  });
});
