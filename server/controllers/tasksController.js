import * as store from '../store.js';
import * as activityLog from '../activityLog.js';
import { validateTask, VALID_PRIORITIES } from '../utils/validate.js';
import { log } from '../utils/logger.js';

const URGENT_KEYWORDS = ['urgent', 'asap', 'critical', 'now'];

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

function parseImportLine(line) {
  const parts = line.split(',').map((p) => p.trim());
  const title = parts[0];
  const priority = parts[1] || 'medium';
  return { title, priority };
}

function resolvePriority(priority, lowerTitle) {
  let resolved = priority;

  if (!VALID_PRIORITIES.includes(resolved)) {
    resolved = 'medium';
  }

  for (const keyword of URGENT_KEYWORDS) {
    if (lowerTitle.includes(keyword)) {
      resolved = 'high';
      break;
    }
  }

  return resolved;
}

function buildImportStats(totalLines, created, skipped) {
  const byPriority = { low: 0, medium: 0, high: 0 };
  for (const task of created) {
    byPriority[task.priority]++;
  }

  return {
    total: totalLines,
    created: created.length,
    skipped: skipped.length,
    byPriority,
  };
}

// Bulk-import tasks from a simple CSV-ish payload: one "title,priority" per line.
// Delegates parsing, priority resolution, and stats building to focused helpers.
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

  for (const line of lines) {
    const { title, priority: rawPriority } = parseImportLine(line);

    if (!title) {
      skipped.push({ line, reason: 'missing title' });
      continue;
    }

    const lowerTitle = title.toLowerCase();
    if (seenTitles.has(lowerTitle)) {
      skipped.push({ line, reason: 'duplicate title' });
      continue;
    }
    seenTitles.add(lowerTitle);

    const priority = resolvePriority(rawPriority, lowerTitle);

    const errors = validateTask({ title, priority });
    if (errors.length > 0) {
      skipped.push({ line, reason: errors.join('; ') });
      continue;
    }

    const task = store.createTask({ title, priority });
    await activityLog.record('created', task.id);
    created.push(task);
  }

  const stats = buildImportStats(lines.length, created, skipped);
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
