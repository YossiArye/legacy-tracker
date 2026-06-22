import * as store from '../store.js';
import * as activityLog from '../activityLog.js';
import { validateTask } from '../utils/validate.js';
import { log } from '../utils/logger.js';

function listTasks(req, res) {
  const { completed } = req.query;
  let tasks = store.getAllTasks();
  if (completed !== undefined) {
    const wantCompleted = completed === 'true';
    tasks = tasks.filter((t) => t.completed === wantCompleted);
  }
  res.json(tasks);
}

function getTask(req, res) {
  const id = Number(req.params.id);
  const task = store.getTaskById(id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
}

async function createTask(req, res) {
  const errors = validateTask(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  const task = store.createTask(req.body);
  await activityLog.record('created', task.id);
  log(`Created task ${task.id}`);
  res.status(201).json(task);
}

async function updateTask(req, res) {
  const id = Number(req.params.id);
  const errors = validateTask(req.body, { partial: true });
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  const updated = store.updateTask(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Task not found' });
  }
  await activityLog.record('updated', id);
  res.json(updated);
}

async function deleteTask(req, res) {
  const id = Number(req.params.id);
  const removed = store.deleteTask(id);
  if (!removed) {
    return res.status(404).json({ error: 'Task not found' });
  }
  await activityLog.record('deleted', id);
  res.status(204).end();
}

export { listTasks, getTask, createTask, updateTask, deleteTask };
