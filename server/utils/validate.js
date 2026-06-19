// Validation rules for task payloads.
// Used by the controller on every create and update.

const MAX_TITLE_LENGTH = 120;
const MIN_TITLE_LENGTH = 3;
const VALID_PRIORITIES = ['low', 'medium', 'high'];

function validateTask(payload, { partial = false } = {}) {
  const errors = [];
  const { title, priority } = payload;

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

  return errors;
}

export { validateTask, VALID_PRIORITIES, MAX_TITLE_LENGTH, MIN_TITLE_LENGTH };
