import * as store from '../store.js';
import * as activityLog from '../activityLog.js';
import { validateTask, VALID_PRIORITIES, VALID_CATEGORIES } from '../utils/validate.js';
import { log } from '../utils/logger.js';
import { getTaskAgeInDays } from '../utils/taskAge.js';

const URGENT_KEYWORDS = ['urgent', 'asap', 'critical', 'now'];

/**
 * Lists tasks, optionally filtered by completion status, with each task
 * annotated with an `ageInDays` field.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function listTasks(req, res) {
  const { completed } = req.query;
  let tasks = store.getAllTasks();
  if (completed !== undefined) {
    const wantCompleted = completed === 'true';
    tasks = tasks.filter((t) => t.completed === wantCompleted);
  }
  const tasksWithAge = tasks.map((t) => ({ ...t, ageInDays: getTaskAgeInDays(t) }));
  res.json(tasksWithAge);
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
  const task = store.createTask(req.body);
  await activityLog.record('created', task.id);
  log(`Created task ${task.id}`);
  res.status(201).json(task);
}

async function updateTask(req, res) {
  const id = Number(req.params.id);
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
  const category = parts[2] || 'other';
  return { title, priority, category };
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

/**
 * Falls back to the default category when the given value isn't one of
 * VALID_CATEGORIES.
 * @param {string} category - raw category value, possibly invalid
 * @returns {string} a valid category
 */
function resolveCategory(category) {
  return VALID_CATEGORIES.includes(category) ? category : 'other';
}

function buildImportStats(totalLines, created, skipped) {
  const byPriority = { low: 0, medium: 0, high: 0 };
  const byCategory = { work: 0, personal: 0, shopping: 0, other: 0 };
  for (const task of created) {
    byPriority[task.priority]++;
    byCategory[task.category]++;
  }

  return {
    total: totalLines,
    created: created.length,
    skipped: skipped.length,
    byPriority,
    byCategory,
  };
}

// Bulk-import tasks from a simple CSV-ish payload: one "title,priority,category" per line.
// Delegates parsing, priority/category resolution, and stats building to focused helpers.
async function bulkImportTasks(req, res) {
  const { data } = req.body;

  const lines = data
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const seenTitles = new Set();
  const created = [];
  const skipped = [];

  for (const line of lines) {
    const { title, priority: rawPriority, category: rawCategory } = parseImportLine(line);

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
    const category = resolveCategory(rawCategory);

    const errors = validateTask({ title, priority, category });
    if (errors.length > 0) {
      skipped.push({ line, reason: errors.join('; ') });
      continue;
    }

    const task = store.createTask({ title, priority, category });
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
