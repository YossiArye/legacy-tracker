const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const BASE_URL = `${API_BASE}/api/tasks`;

async function fetchTasks() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error('Failed to load tasks');
  return res.json();
}

async function createTask(title, priority = 'medium', category = 'other') {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, priority, category }),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

async function updateTask(id, updates) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

async function deleteTask(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete task');
}

export { fetchTasks, createTask, updateTask, deleteTask };
