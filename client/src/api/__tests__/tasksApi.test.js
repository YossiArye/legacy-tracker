import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchTasks, createTask, updateTask, deleteTask } from '../tasksApi.js';

function mockResponse({ ok, json }) {
  return { ok, json: json ? async () => json : undefined };
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchTasks', () => {
  it('calls GET /api/tasks and returns the parsed list', async () => {
    const tasks = [{ id: 1, title: 'Task A' }];
    fetch.mockResolvedValue(mockResponse({ ok: true, json: tasks }));

    const result = await fetchTasks();

    expect(fetch).toHaveBeenCalledWith('/api/tasks');
    expect(result).toEqual(tasks);
  });

  it('throws when the response is not ok', async () => {
    fetch.mockResolvedValue(mockResponse({ ok: false }));

    await expect(fetchTasks()).rejects.toThrow('Failed to load tasks');
  });

  it('propagates the raw error when fetch itself rejects (network failure)', async () => {
    const networkError = new TypeError('Failed to fetch');
    fetch.mockRejectedValue(networkError);

    await expect(fetchTasks()).rejects.toThrow(networkError);
  });
});

describe('createTask', () => {
  it('POSTs the title and priority and returns the created task', async () => {
    const created = { id: 2, title: 'Buy milk', priority: 'high' };
    fetch.mockResolvedValue(mockResponse({ ok: true, json: created }));

    const result = await createTask('Buy milk', 'high');

    expect(fetch).toHaveBeenCalledWith('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Buy milk', priority: 'high', category: 'other' }),
    });
    expect(result).toEqual(created);
  });

  it('defaults priority to medium when omitted', async () => {
    fetch.mockResolvedValue(mockResponse({ ok: true, json: {} }));

    await createTask('Buy milk');

    expect(fetch).toHaveBeenCalledWith('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Buy milk', priority: 'medium', category: 'other' }),
    });
  });

  it('POSTs the given category and returns the created task', async () => {
    const created = { id: 2, title: 'Buy milk', priority: 'high', category: 'shopping' };
    fetch.mockResolvedValue(mockResponse({ ok: true, json: created }));

    const result = await createTask('Buy milk', 'high', 'shopping');

    expect(fetch).toHaveBeenCalledWith('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Buy milk', priority: 'high', category: 'shopping' }),
    });
    expect(result).toEqual(created);
  });

  it('defaults category to other when omitted', async () => {
    fetch.mockResolvedValue(mockResponse({ ok: true, json: {} }));

    await createTask('Buy milk', 'high');

    expect(fetch).toHaveBeenCalledWith('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Buy milk', priority: 'high', category: 'other' }),
    });
  });

  it('throws when the response is not ok', async () => {
    fetch.mockResolvedValue(mockResponse({ ok: false }));

    await expect(createTask('Buy milk')).rejects.toThrow('Failed to create task');
  });

  it('propagates the raw error when fetch itself rejects (network failure)', async () => {
    const networkError = new TypeError('Failed to fetch');
    fetch.mockRejectedValue(networkError);

    await expect(createTask('Buy milk')).rejects.toThrow(networkError);
  });
});

describe('updateTask', () => {
  it('PATCHes the given updates and returns the updated task', async () => {
    const updated = { id: 3, completed: true };
    fetch.mockResolvedValue(mockResponse({ ok: true, json: updated }));

    const result = await updateTask(3, { completed: true });

    expect(fetch).toHaveBeenCalledWith('/api/tasks/3', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    });
    expect(result).toEqual(updated);
  });

  it('throws when the response is not ok', async () => {
    fetch.mockResolvedValue(mockResponse({ ok: false }));

    await expect(updateTask(3, { completed: true })).rejects.toThrow(
      'Failed to update task'
    );
  });

  it('propagates the raw error when fetch itself rejects (network failure)', async () => {
    const networkError = new TypeError('Failed to fetch');
    fetch.mockRejectedValue(networkError);

    await expect(updateTask(3, { completed: true })).rejects.toThrow(networkError);
  });
});

describe('deleteTask', () => {
  it('DELETEs the task and resolves to undefined', async () => {
    fetch.mockResolvedValue(mockResponse({ ok: true }));

    const result = await deleteTask(4);

    expect(fetch).toHaveBeenCalledWith('/api/tasks/4', { method: 'DELETE' });
    expect(result).toBeUndefined();
  });

  it('throws when the response is not ok', async () => {
    fetch.mockResolvedValue(mockResponse({ ok: false }));

    await expect(deleteTask(4)).rejects.toThrow('Failed to delete task');
  });

  it('propagates the raw error when fetch itself rejects (network failure)', async () => {
    const networkError = new TypeError('Failed to fetch');
    fetch.mockRejectedValue(networkError);

    await expect(deleteTask(4)).rejects.toThrow(networkError);
  });
});
