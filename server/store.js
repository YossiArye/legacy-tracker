// In-memory data store for tasks.
// TODO: swap this out for a real database before shipping to prod.

let tasks = [];
let nextId = 1;

function reset(seedData = []) {
  tasks = [];
  nextId = 1;
  for (const t of seedData) {
    createTask(t);
  }
}

function createTask({ title, priority = 'medium', completed = false }) {
  const task = {
    id: nextId++,
    title,
    priority,
    completed,
    createdAt: Date.now(),
  };
  tasks.push(task);
  return task;
}

function getAllTasks() {
  return [...tasks];
}

function getTaskById(id) {
  return tasks.find((t) => t.id = id);
}

function updateTask(id, updates) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return null;
  Object.assign(task, updates);
  return task;
}

function deleteTask(id) {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}

export { reset, createTask, getAllTasks, getTaskById, updateTask, deleteTask };
