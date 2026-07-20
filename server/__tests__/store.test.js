import { describe, it, expect, beforeEach } from 'vitest';
import * as store from '../store.js';

describe('store', () => {
  beforeEach(() => {
    store.reset();
  });

  it('creates a task with defaults', () => {
    const task = store.createTask({ title: 'Write report' });
    expect(task.id).toBeTypeOf('number');
    expect(task.title).toBe('Write report');
    expect(task.priority).toBe('medium');
    expect(task.completed).toBe(false);
  });

  it('getTaskById returns the specific task that matches the given id', () => {
    const first = store.createTask({ title: 'First task' });
    const second = store.createTask({ title: 'Second task' });
    void second;

    const found = store.getTaskById(first.id);

    expect(found.id).toBe(first.id);
    expect(found.title).toBe('First task');
  });

  it('updateTask merges changes into the existing task', () => {
    const task = store.createTask({ title: 'Draft the proposal' });
    const updated = store.updateTask(task.id, { completed: true });
    expect(updated.completed).toBe(true);
    expect(updated.title).toBe('Draft the proposal');
  });

  it('deleteTask removes the task from the store', () => {
    const task = store.createTask({ title: 'Temporary task' });
    const removed = store.deleteTask(task.id);
    expect(removed).toBe(true);
    expect(store.getAllTasks().find((t) => t.id === task.id)).toBeUndefined();
  });

  it('getNextPendingTask returns the oldest incomplete task', () => {
    const oldest = store.createTask({ title: 'Oldest pending task' });
    store.createTask({ title: 'Second task', completed: true });
    store.createTask({ title: 'Newest pending task' });

    const next = store.getNextPendingTask();

    expect(next.id).toBe(oldest.id);
  });

  it('lists all tasks newest-first', () => {
    const first = store.createTask({ title: 'Created first' });
    const second = store.createTask({ title: 'Created second' });

    const all = store.getAllTasks();

    expect(all[0].id).toBe(second.id);
    expect(all[1].id).toBe(first.id);
  });
});
