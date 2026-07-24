import * as store from '../store.js';
import * as activityLog from '../activityLog.js';
import { validateTask, VALID_PRIORITIES } from '../utils/validate.js';
import { log } from '../utils/logger.js';
import { NotFoundError, BadRequestError, ValidationError } from '../utils/errors.js';

const URGENT_KEYWORDS = ['urgent', 'asap', 'critical', 'now'];

function listTasks({ completed } = {}) {
  let tasks = store.getAllTasks();
  if (completed !== undefined) {
    const wantCompleted = completed === 'true';
    tasks = tasks.filter((t) => t.completed === wantCompleted);
  }
  return tasks;
}

function getTask(id) {
  const task = store.getTaskById(id);
  if (!task) {
    throw new NotFoundError('Task not found');
  }
  return task;
}

async function createTask(payload) {
  const errors = validateTask(payload);
  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
  const task = store.createTask(payload);
  await activityLog.record('created', task.id);
  log(`Created task ${task.id}`);
  return task;
}

async function updateTask(id, payload) {
  const errors = validateTask(payload, { partial: true });
  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
  const updated = store.updateTask(id, payload);
  if (!updated) {
    throw new NotFoundError('Task not found');
  }
  await activityLog.record('updated', id);
  return updated;
}

async function deleteTask(id) {
  const removed = store.deleteTask(id);
  if (!removed) {
    throw new NotFoundError('Task not found');
  }
  await activityLog.record('deleted', id);
}

function nextTask() {
  const task = store.getNextPendingTask();
  if (!task) {
    throw new NotFoundError('No pending tasks');
  }
  return task;
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

async function bulkImportTasks(data) {
  if (typeof data !== 'string' || data.trim().length === 0) {
    throw new BadRequestError('No import data provided');
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
  return { created, skipped, stats };
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
