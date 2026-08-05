// Validation rules for task payloads.
// Used by the controller on every create and update.

const MAX_TITLE_LENGTH = 120;
const MIN_TITLE_LENGTH = 3;
const VALID_PRIORITIES = ['low', 'medium', 'high'];
const VALID_CATEGORIES = ['work', 'personal', 'shopping', 'other'];

/**
 * Normalizes a task payload before validation/storage - currently just
 * trims `title` so the length check in validateTask and the value that
 * actually gets stored agree with each other.
 * @param {object} payload - raw task payload (from req.body)
 * @param {string} [payload.title]
 * @returns {object} a new object with `title` trimmed, if present
 */
function normalizeTaskInput(payload) {
  const normalized = { ...payload };
  if (typeof normalized.title === 'string') {
    normalized.title = normalized.title.trim();
  }
  return normalized;
}

function validateTask(payload, { partial = false } = {}) {
  const errors = [];
  const { title, priority, category } = payload;

  if (!partial || title !== undefined) {
    if (typeof title !== 'string' || title.trim().length < MIN_TITLE_LENGTH) {
      errors.push(`Title must be at least ${MIN_TITLE_LENGTH} characters`);
    } else if (title.length > MAX_TITLE_LENGTH) {
      errors.push(`Title must be under ${MAX_TITLE_LENGTH} characters`);
    }
  }

  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  if (category !== undefined && !VALID_CATEGORIES.includes(category)) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  return errors;
}

export {
  validateTask,
  normalizeTaskInput,
  VALID_PRIORITIES,
  VALID_CATEGORIES,
  MAX_TITLE_LENGTH,
  MIN_TITLE_LENGTH,
};
