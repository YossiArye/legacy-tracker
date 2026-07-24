import { useState, useEffect, useCallback } from 'react';
import * as api from '../api/tasksApi.js';

// Flips the target task's `completed` flag, leaving every other task
// untouched. Returns the task's prior value so a failed request can be
// reverted later without needing a snapshot of the whole list.
function toggleTaskCompleted(tasks, id) {
  const target = tasks.find((t) => t.id === id);
  if (!target) return { tasks, previousCompleted: undefined };

  const previousCompleted = target.completed;
  const updatedTasks = tasks.map((t) =>
    t.id === id ? { ...t, completed: !previousCompleted } : t
  );
  return { tasks: updatedTasks, previousCompleted };
}

// Restores one task's `completed` flag without disturbing any change made
// to other tasks since the optimistic update (e.g. from a toggle that was
// still in flight when this one failed).
function revertTaskCompleted(tasks, id, previousCompleted) {
  return tasks.map((t) =>
    t.id === id ? { ...t, completed: previousCompleted } : t
  );
}

function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .fetchTasks()
      .then(setTasks)
      .finally(() => setLoading(false));
  }, []);

  const addTask = useCallback(async (title, priority) => {
    const task = await api.createTask(title, priority);
    setTasks((prev) => [task, ...prev]);
  }, []);

  // Toggling a task's "completed" state. Uses the functional setTasks form
  // so both the optimistic update and any later revert always act on the
  // latest state, not a snapshot captured when the click happened - that
  // snapshot could otherwise wipe out other tasks toggled in the meantime.
  const toggleComplete = useCallback((id) => {
    let previousCompleted;

    setTasks((prev) => {
      const result = toggleTaskCompleted(prev, id);
      previousCompleted = result.previousCompleted;
      return result.tasks;
    });

    if (previousCompleted === undefined) return;

    api.updateTask(id, { completed: !previousCompleted }).catch(() => {
      setTasks((prev) => revertTaskCompleted(prev, id, previousCompleted));
    });
  }, []);

  const removeTask = useCallback(async (id) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { tasks, loading, addTask, toggleComplete, removeTask };
}

export { useTasks, toggleTaskCompleted, revertTaskCompleted };
