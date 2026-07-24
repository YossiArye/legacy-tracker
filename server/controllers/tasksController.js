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

function nextTask(req, res) {
  const task = store.getNextPendingTask();
  if (!task) {
    return res.status(404).json({ error: 'No pending tasks' });
  }
  res.json(task);
}

// Bulk-import tasks from a simple CSV-ish payload: one "title,priority" per line.
// Handles dedup, keyword-based priority bumping, validation, and a summary report.
// TODO: this got out of hand, split it up before adding CSV file upload support.
async function bulkImportTasks(req, res) {
  const { data } = req.body;
  if (typeof data !== 'string' || data.trim().length === 0) {
    return res.status(400).json({ error: 'No import data provided' });
  }

  const lines = data
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const seenTitles = new Set();
  const created = [];
  const skipped = [];
  const urgentKeywords = ['urgent', 'asap', 'critical', 'now'];

  for (const line of lines) {
    const parts = line.split(',').map((p) => p.trim());
    const title = parts[0];
    let priority = parts[1] || 'medium';

    if (!title) {
      skipped.push({ line, reason: 'missing title' });
      continue;
    }

    const normalizedTitle = title.toLowerCase();
    if (seenTitles.has(normalizedTitle)) {
      skipped.push({ line, reason: 'duplicate title' });
      continue;
    }
    seenTitles.add(normalizedTitle);

    if (!['low', 'medium', 'high'].includes(priority)) {
      priority = 'medium';
    }

    const lowerTitle = title.toLowerCase();
    for (const keyword of urgentKeywords) {
      if (lowerTitle.includes(keyword)) {
        priority = 'high';
        break;
      }
    }

    const errors = validateTask({ title, priority });
    if (errors.length > 0) {
      skipped.push({ line, reason: errors.join('; ') });
      continue;
    }

    const task = store.createTask({ title, priority });
    await activityLog.record('created', task.id);
    created.push(task);
  }

  const stats = {
    total: lines.length,
    created: created.length,
    skipped: skipped.length,
    byPriority: {
      low: created.filter((t) => t.priority === 'low').length,
      medium: created.filter((t) => t.priority === 'medium').length,
      high: created.filter((t) => t.priority === 'high').length,
    },
  };

  log(`Bulk import: ${created.length} created, ${skipped.length} skipped`);
  res.status(201).json({ created, skipped, stats });
}

export {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  nextTask,
  bulkImportTasks,
};
