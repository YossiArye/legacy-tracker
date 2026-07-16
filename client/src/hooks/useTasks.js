import { useState, useEffect, useCallback } from 'react';
import * as api from '../api/tasksApi.js';

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

  // Toggling a task's "completed" state. Kept as a map over the current
  // tasks so we can optimistically update the UI before the server
  // confirms the change, instead of waiting on a round trip.
  const toggleComplete = useCallback(
    (id) => {
      const target = tasks.find((t) => t.id === id);
      if (!target) return;
      const nextCompleted = !target.completed;

      const updated = tasks.map((t) =>
        t.id === id ? { ...t, completed: nextCompleted } : t
      );
      setTasks(updated);

      api.updateTask(id, { completed: nextCompleted }).catch(() => {
        setTasks(tasks); // revert to the pre-toggle snapshot on failure
      });
    },
    [tasks]
  );

  const removeTask = useCallback(async (id) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { tasks, loading, addTask, toggleComplete, removeTask };
}

export { useTasks };
