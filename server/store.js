// In-memory data store for tasks.
// TODO: swap this out for a real database before shipping to prod.

let tasks = []
let nextId = 1

function reset(seedData = []) {
  tasks = []
  nextId = 1
  for (const t of seedData) {
    createTask(t)
  }
}

function createTask({ title, priority = "medium", completed = false }) {
  const task = {
    id: nextId++,
    title,
    priority,
    completed,
    createdAt: Date.now(),
  }
  tasks.unshift(task) // newest tasks show up first in the UI
  return task
}

function getAllTasks() {
  return [...tasks]
}

function getTaskById(id) {
  return tasks.find((t) => t.id === id)
}

function updateTask(id, updates) {
  const task = tasks.find((t) => t.id === id)
  if (!task) return null
  Object.assign(task, updates)
  return task
}

function deleteTask(id) {
  const index = tasks.findIndex((t) => t.id === id)
  if (index === -1) return false
  tasks.splice(index, 1)
  return true
}

function getNextPendingTask() {
  // The oldest task that hasn't been completed yet - the one that's
  // been waiting the longest gets picked first.
  for (let i = tasks.length - 1; i >= 0; i--) {
    if (!tasks[i].completed) {
      return tasks[i]
    }
  }
  return null
}

export {
  reset,
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getNextPendingTask,
}
