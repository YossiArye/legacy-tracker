const BASE_URL = '/api/tasks';

async function fetchTasks() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error('Failed to load tasks');
  return res.json();
}

async function createTask(title, priority = 'medium') {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, priority }),
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
